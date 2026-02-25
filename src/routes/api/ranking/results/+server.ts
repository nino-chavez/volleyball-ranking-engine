import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { requireAuth } from '$lib/auth-guard.js';
import { supabaseServer } from '$lib/supabase-server.js';

export const GET: RequestHandler = async ({ url, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const rankingRunId = url.searchParams.get('ranking_run_id');

	if (!rankingRunId) {
		return json(
			{ success: false, error: 'Missing required parameter: ranking_run_id' },
			{ status: 400 },
		);
	}

	try {
		// Fetch ranking results with team names
		const { data: results, error } = await supabaseServer
			.from('ranking_results')
			.select(
				'team_id, algo1_rating, algo1_rank, algo2_rating, algo2_rank, algo3_rating, algo3_rank, algo4_rating, algo4_rank, algo5_rating, algo5_rank, agg_rating, agg_rank',
			)
			.eq('ranking_run_id', rankingRunId)
			.order('agg_rank');

		if (error) {
			return json({ success: false, error: error.message }, { status: 500 });
		}

		// Fetch team names, codes, and regions for all team_ids in results
		const teamIds = (results ?? []).map((r) => r.team_id);
		const { data: teamRows } = await supabaseServer
			.from('teams')
			.select('id, name, code, region')
			.in('id', teamIds.length > 0 ? teamIds : ['__none__']);

		const teamsMap: Record<string, { name: string; code: string; region: string }> = {};
		for (const team of teamRows ?? []) {
			teamsMap[team.id] = { name: team.name, code: team.code, region: team.region };
		}

		// Fetch overrides for this run
		const { data: overrideRows } = await supabaseServer
			.from('ranking_overrides')
			.select(
				'team_id, original_rank, final_rank, justification, committee_member, created_at, updated_at',
			)
			.eq('ranking_run_id', rankingRunId);

		const overridesMap: Record<
			string,
			{
				original_rank: number;
				final_rank: number;
				justification: string;
				committee_member: string;
				created_at: string;
				updated_at: string;
			}
		> = {};
		for (const o of overrideRows ?? []) {
			overridesMap[o.team_id] = {
				original_rank: o.original_rank,
				final_rank: o.final_rank,
				justification: o.justification,
				committee_member: o.committee_member,
				created_at: o.created_at,
				updated_at: o.updated_at,
			};
		}

		// Fetch run status and context (season_id, age_group)
		const { data: runRow } = await supabaseServer
			.from('ranking_runs')
			.select('status, season_id, age_group, ran_at')
			.eq('id', rankingRunId)
			.single();

		// Look up previous finalized run for rank movement indicators
		const previousRanks: Record<string, number> = {};
		if (runRow?.season_id && runRow?.age_group) {
			const { data: prevRun } = await supabaseServer
				.from('ranking_runs')
				.select('id')
				.eq('season_id', runRow.season_id)
				.eq('age_group', runRow.age_group)
				.eq('status', 'finalized')
				.neq('id', rankingRunId)
				.lt('ran_at', runRow.ran_at)
				.order('ran_at', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (prevRun) {
				const { data: prevResults } = await supabaseServer
					.from('ranking_results')
					.select('team_id, agg_rank')
					.eq('ranking_run_id', prevRun.id);

				for (const pr of prevResults ?? []) {
					previousRanks[pr.team_id] = pr.agg_rank ?? 0;
				}
			}
		}

		return json({
			success: true,
			data: {
				results: (results ?? []).map((r) => ({
					team_id: r.team_id,
					algo1_rating: r.algo1_rating ?? 0,
					algo1_rank: r.algo1_rank ?? 0,
					algo2_rating: r.algo2_rating ?? 0,
					algo2_rank: r.algo2_rank ?? 0,
					algo3_rating: r.algo3_rating ?? 0,
					algo3_rank: r.algo3_rank ?? 0,
					algo4_rating: r.algo4_rating ?? 0,
					algo4_rank: r.algo4_rank ?? 0,
					algo5_rating: r.algo5_rating ?? 0,
					algo5_rank: r.algo5_rank ?? 0,
					agg_rating: r.agg_rating ?? 0,
					agg_rank: r.agg_rank ?? 0,
				})),
				teams: teamsMap,
				overrides: overridesMap,
				run_status: runRow?.status ?? 'draft',
				previous_ranks: previousRanks,
			},
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};
