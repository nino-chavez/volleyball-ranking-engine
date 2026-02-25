import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { requireAuth } from '$lib/auth-guard.js';
import { supabaseServer } from '$lib/supabase-server.js';

/**
 * GET /api/ranking/team/[id]/rank-history?season_id=&age_group=
 *
 * Returns rank + rating history for a team across all runs in a season.
 */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const teamId = params.id;
	const seasonId = url.searchParams.get('season_id');
	const ageGroup = url.searchParams.get('age_group');

	if (!seasonId || !ageGroup) {
		return json(
			{ success: false, error: 'Missing required parameters: season_id, age_group' },
			{ status: 400 },
		);
	}

	try {
		// Fetch all ranking runs for this season + age group
		const { data: runs, error: runsError } = await supabaseServer
			.from('ranking_runs')
			.select('id, ran_at, status')
			.eq('season_id', seasonId)
			.eq('age_group', ageGroup as '15U' | '16U' | '17U' | '18U')
			.order('ran_at');

		if (runsError) {
			return json({ success: false, error: runsError.message }, { status: 500 });
		}

		if (!runs || runs.length === 0) {
			return json({ success: true, data: { points: [] } });
		}

		const runIds = runs.map((r) => r.id);

		// Fetch ranking results for this team across all runs
		const { data: results, error: resultsError } = await supabaseServer
			.from('ranking_results')
			.select('ranking_run_id, agg_rank, agg_rating')
			.eq('team_id', teamId)
			.in('ranking_run_id', runIds);

		if (resultsError) {
			return json({ success: false, error: resultsError.message }, { status: 500 });
		}

		// Build a map of run_id -> result
		const resultMap = new Map(
			(results ?? []).map((r) => [r.ranking_run_id, r]),
		);

		// Build points array, only for runs where this team has results
		const points = runs
			.filter((run) => resultMap.has(run.id))
			.map((run) => {
				const result = resultMap.get(run.id)!;
				return {
					ran_at: run.ran_at,
					agg_rank: result.agg_rank ?? 0,
					agg_rating: result.agg_rating ?? 0,
					status: run.status,
				};
			});

		return json({ success: true, data: { points } });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};
