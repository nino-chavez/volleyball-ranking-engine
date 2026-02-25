import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { supabaseServer } from '$lib/supabase-server.js';
import { requireAuth } from '$lib/auth-guard.js';
import { JobRunner } from '$lib/import/job-runner.js';
import type { ResolutionStrategy } from '$lib/import/resolution-strategies.js';

/**
 * GET /api/import/jobs
 * List import jobs, optionally filtered by source_id.
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const sourceId = url.searchParams.get('source_id');

	let query = supabaseServer
		.from('import_jobs')
		.select('*, import_sources(name, source_type, format)')
		.order('created_at', { ascending: false })
		.limit(50);

	if (sourceId) {
		query = query.eq('source_id', sourceId);
	}

	const { data, error } = await query;

	if (error) {
		return json({ success: false, error: error.message }, { status: 500 });
	}

	return json({ success: true, data: { jobs: data ?? [] } });
};

/**
 * POST /api/import/jobs
 * Trigger a new import job for a given source.
 * Body: { source_id: string, resolution_strategy?: string, fuzzy_threshold?: number }
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const body = await request.json();
	const { source_id, resolution_strategy, fuzzy_threshold } = body as {
		source_id?: string;
		resolution_strategy?: string;
		fuzzy_threshold?: number;
	};

	if (!source_id) {
		return json({ success: false, error: 'Missing required field: source_id' }, { status: 400 });
	}

	const validStrategies: ResolutionStrategy[] = [
		'exact_match_only',
		'fuzzy_threshold',
		'create_missing',
		'skip_unresolved',
	];

	const strategy = (resolution_strategy ?? 'skip_unresolved') as ResolutionStrategy;
	if (!validStrategies.includes(strategy)) {
		return json(
			{
				success: false,
				error: `Invalid resolution_strategy. Must be one of: ${validStrategies.join(', ')}`,
			},
			{ status: 400 },
		);
	}

	try {
		const runner = new JobRunner(supabaseServer);
		const jobId = await runner.run(source_id, {
			resolutionStrategy: strategy,
			fuzzyThreshold: fuzzy_threshold,
		});

		// Fetch the completed job
		const { data: job } = await supabaseServer
			.from('import_jobs')
			.select('*')
			.eq('id', jobId)
			.single();

		return json({ success: true, data: { job } }, { status: 201 });
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : 'Job execution failed';
		return json({ success: false, error: errorMsg }, { status: 500 });
	}
};
