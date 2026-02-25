import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types.js';
import type { ImportFormat, ParsedFinishesRow, ParsedColleyRow } from './types.js';
import { getParser } from './parsers/index.js';
import { IdentityResolver } from './identity-resolver.js';
import { ImportService } from './import-service.js';
import { autoResolve, type ResolutionStrategy } from './resolution-strategies.js';
import { XlsxFileAdapter } from './sources/xlsx-file-adapter.js';
import { UrlAdapter } from './sources/url-adapter.js';
import type { SourceAdapter, SourceAdapterConfig } from './sources/source-adapter.js';

export interface JobRunnerOptions {
	resolutionStrategy: ResolutionStrategy;
	fuzzyThreshold?: number;
}

/**
 * Orchestrates the full import pipeline: source -> parser -> resolver -> import service.
 * Creates a job record, updates it as the job progresses, and records the final result.
 */
export class JobRunner {
	private supabase: SupabaseClient<Database>;

	constructor(supabase: SupabaseClient<Database>) {
		this.supabase = supabase;
	}

	/**
	 * Execute an import job for a given source.
	 *
	 * @param sourceId - The import_sources.id to run
	 * @param options - Resolution strategy and threshold
	 * @returns The created job ID
	 */
	async run(sourceId: string, options: JobRunnerOptions): Promise<string> {
		// 1. Fetch the source configuration
		const { data: source, error: sourceError } = await this.supabase
			.from('import_sources')
			.select('*')
			.eq('id', sourceId)
			.single();

		if (sourceError || !source) {
			throw new Error(`Import source not found: ${sourceId}`);
		}

		// 2. Create the job record
		const { data: job, error: jobError } = await this.supabase
			.from('import_jobs')
			.insert({ source_id: sourceId, status: 'pending' as const })
			.select('id')
			.single();

		if (jobError || !job) {
			throw new Error(`Failed to create import job: ${jobError?.message}`);
		}

		const jobId = job.id;

		try {
			// Mark job as running
			await this.supabase
				.from('import_jobs')
				.update({ status: 'running' as const, started_at: new Date().toISOString() })
				.eq('id', jobId);

			// 3. Create the appropriate adapter
			const adapter = this.createAdapter(source.source_type, source.format as ImportFormat);
			const config = (source.config ?? {}) as SourceAdapterConfig;

			// 4. Fetch the file
			const fileBuffer = await adapter.fetch(config);

			// 5. Parse the file
			const format = source.format as ImportFormat;
			const parser = getParser(format);
			const parseResult = parser.parse(fileBuffer);

			// 6. Resolve identities
			const resolver = new IdentityResolver(this.supabase);
			const ageGroup = source.age_group as '15U' | '16U' | '17U' | '18U';

			// Get season_id for tournament resolution
			const seasonId = source.season_id;

			// Extract team codes and tournament names from parsed rows
			let teamCodes: string[] = [];
			let tournamentNames: string[] = [];

			if (format === 'finishes') {
				const rows = parseResult.rows as ParsedFinishesRow[];
				teamCodes = rows.map((r) => r.teamCode);
				tournamentNames = rows.map((r) => r.tournamentName);
			} else {
				const rows = parseResult.rows as ParsedColleyRow[];
				teamCodes = rows.map((r) => r.teamCode);
			}

			const { unmatched: teamConflicts } = await resolver.resolveTeams(teamCodes, ageGroup);
			const { matched: teamMatched } = await resolver.resolveTeams(teamCodes, ageGroup);

			let tournamentMatched = new Map<string, string>();
			let tournamentConflicts = parseResult.identityConflicts.filter(
				(c) => c.type === 'tournament',
			);

			if (format === 'finishes' && tournamentNames.length > 0) {
				const tournResult = await resolver.resolveTournaments(tournamentNames, seasonId);
				tournamentMatched = tournResult.matched;
				tournamentConflicts = tournResult.unmatched;
			}

			// 7. Auto-resolve conflicts using the specified strategy
			const allConflicts = [...teamConflicts, ...tournamentConflicts];
			const autoMappings = autoResolve(
				allConflicts,
				options.resolutionStrategy,
				options.fuzzyThreshold,
			);

			// Build complete identity mappings (auto-resolved + matched)
			const identityMappings = [...autoMappings];

			// Add the already-matched teams
			for (const [code, id] of teamMatched) {
				identityMappings.push({
					type: 'team',
					parsedValue: code,
					action: 'map',
					mappedId: id,
				});
			}

			// Add the already-matched tournaments
			for (const [name, id] of tournamentMatched) {
				identityMappings.push({
					type: 'tournament',
					parsedValue: name,
					action: 'map',
					mappedId: id,
				});
			}

			// 8. Check for unresolved conflicts (items that have no mapping)
			const unresolvedConflicts = allConflicts.filter(
				(c) =>
					!identityMappings.some(
						(m) => m.type === c.type && m.parsedValue === c.parsedValue,
					),
			);

			if (unresolvedConflicts.length > 0) {
				const unresolvedNames = unresolvedConflicts
					.map((c) => `${c.type}: ${c.parsedValue}`)
					.join(', ');
				throw new Error(
					`Unresolved identity conflicts: ${unresolvedNames}. Use a different resolution strategy or resolve manually.`,
				);
			}

			// 9. Validate and import
			const importService = new ImportService(this.supabase);

			let rowsInserted = 0;
			let rowsUpdated = 0;
			let rowsSkipped = 0;
			let rowsProcessed = 0;

			if (format === 'finishes') {
				const validated = importService.validateFinishesRows(
					parseResult.rows as ParsedFinishesRow[],
					identityMappings,
				);
				rowsProcessed = validated.length;

				const summary = await importService.executeMerge(
					validated,
					format,
					seasonId,
					ageGroup,
				);
				rowsInserted = summary.rowsInserted;
				rowsUpdated = summary.rowsUpdated;
				rowsSkipped = summary.rowsSkipped;
			} else {
				// For Colley format, we need a ranking_run_id from source config
				const rankingRunId = (config as Record<string, unknown>).ranking_run_id as
					| string
					| undefined;
				if (!rankingRunId) {
					throw new Error(
						'Colley format sources require config.ranking_run_id',
					);
				}

				const validated = importService.validateColleyRows(
					parseResult.rows as ParsedColleyRow[],
					identityMappings,
					rankingRunId,
				);
				rowsProcessed = validated.length;

				const summary = await importService.executeMerge(
					validated,
					format,
					seasonId,
					ageGroup,
				);
				rowsInserted = summary.rowsInserted;
				rowsUpdated = summary.rowsUpdated;
				rowsSkipped = summary.rowsSkipped;
			}

			// 10. Mark job as completed
			await this.supabase
				.from('import_jobs')
				.update({
					status: 'completed' as const,
					completed_at: new Date().toISOString(),
					rows_processed: rowsProcessed,
					rows_inserted: rowsInserted,
					rows_updated: rowsUpdated,
					rows_skipped: rowsSkipped,
					metadata: {
						parse_errors: parseResult.errors.length,
						resolution_strategy: options.resolutionStrategy,
						auto_resolved_conflicts: autoMappings.length,
					},
				})
				.eq('id', jobId);

			// Update source last_run_at
			await this.supabase
				.from('import_sources')
				.update({ last_run_at: new Date().toISOString() })
				.eq('id', sourceId);

			return jobId;
		} catch (err) {
			// Mark job as failed
			const errorMsg = err instanceof Error ? err.message : 'Unknown error';
			await this.supabase
				.from('import_jobs')
				.update({
					status: 'failed' as const,
					completed_at: new Date().toISOString(),
					error_message: errorMsg,
				})
				.eq('id', jobId);

			throw err;
		}
	}

	private createAdapter(sourceType: string, format: ImportFormat): SourceAdapter {
		switch (sourceType) {
			case 'xlsx_file':
				return new XlsxFileAdapter(format);
			case 'xlsx_url':
				return new UrlAdapter(format);
			default:
				throw new Error(`Unsupported source type: ${sourceType}`);
		}
	}
}
