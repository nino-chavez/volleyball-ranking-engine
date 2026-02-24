import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { supabaseServer } from '$lib/supabase-server.js';

/**
 * GET /api/ranking/runs?season_id=...
 *
 * Returns past ranking runs for a season, ordered by ran_at descending.
 */
export const GET: RequestHandler = async ({ url }) => {
  const seasonId = url.searchParams.get('season_id');

  if (!seasonId) {
    return json(
      { success: false, error: 'Missing required parameter: season_id' },
      { status: 400 },
    );
  }

  try {
    // Fetch ranking runs for the season
    const { data: runs, error: runsError } = await supabaseServer
      .from('ranking_runs')
      .select('id, ran_at, parameters, status')
      .eq('season_id', seasonId)
      .order('ran_at', { ascending: false });

    if (runsError) {
      return json({ success: false, error: runsError.message }, { status: 500 });
    }

    // Count results per run
    const runIds = (runs ?? []).map((r) => r.id);
    const { data: resultCounts, error: countError } = await supabaseServer
      .from('ranking_results')
      .select('ranking_run_id')
      .in('ranking_run_id', runIds.length > 0 ? runIds : ['__none__']);

    if (countError) {
      return json({ success: false, error: countError.message }, { status: 500 });
    }

    // Build count map
    const countMap = new Map<string, number>();
    for (const row of resultCounts ?? []) {
      countMap.set(row.ranking_run_id, (countMap.get(row.ranking_run_id) ?? 0) + 1);
    }

    const runsList = (runs ?? []).map((r) => ({
      id: r.id,
      ran_at: r.ran_at,
      teams_ranked: countMap.get(r.id) ?? 0,
      status: r.status,
    }));

    return json({ success: true, data: { runs: runsList } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return json({ success: false, error: message }, { status: 500 });
  }
};
