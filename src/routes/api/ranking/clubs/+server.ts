import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { requireAuth } from '$lib/auth-guard.js';
import { supabaseServer } from '$lib/supabase-server.js';

/**
 * GET /api/ranking/clubs?season_id=&age_group=&run_id=
 *
 * Aggregates team ratings by club for the specified ranking run.
 * Returns clubs with avg agg_rating, team count, and best team.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const seasonId = url.searchParams.get('season_id');
	const ageGroup = url.searchParams.get('age_group');
	let runId = url.searchParams.get('run_id');

	if (!seasonId || !ageGroup) {
		return json(
			{ success: false, error: 'Missing required parameters: season_id, age_group' },
			{ status: 400 },
		);
	}

	try {
		// If no run_id, find the latest finalized run
		if (!runId) {
			const { data: latestRun } = await supabaseServer
				.from('ranking_runs')
				.select('id')
				.eq('season_id', seasonId)
				.eq('age_group', ageGroup as '15U' | '16U' | '17U' | '18U')
				.eq('status', 'finalized')
				.order('ran_at', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (!latestRun) {
				return json({
					success: true,
					data: { clubs: [], message: 'No finalized ranking run found.' },
				});
			}
			runId = latestRun.id;
		}

		// Fetch ranking results for this run
		const { data: results, error: resultsErr } = await supabaseServer
			.from('ranking_results')
			.select('team_id, agg_rating, agg_rank')
			.eq('ranking_run_id', runId);

		if (resultsErr) {
			return json({ success: false, error: resultsErr.message }, { status: 500 });
		}

		const teamIds = (results ?? []).map((r) => r.team_id);
		if (teamIds.length === 0) {
			return json({ success: true, data: { clubs: [] } });
		}

		// Fetch teams with club_id
		const { data: teamRows } = await supabaseServer
			.from('teams')
			.select('id, name, club_id')
			.in('id', teamIds);

		// Fetch clubs
		const clubIds = [...new Set((teamRows ?? []).map((t) => t.club_id).filter(Boolean))];

		const clubMap = new Map<string, { name: string; region: string | null }>();
		if (clubIds.length > 0) {
			const { data: clubRows } = await supabaseServer
				.from('clubs')
				.select('id, name, region')
				.in('id', clubIds as string[]);

			for (const c of clubRows ?? []) {
				clubMap.set(c.id, { name: c.name, region: c.region });
			}
		}

		// Build team -> club mapping and team -> rating mapping
		const teamClubMap = new Map<string, string>();
		const teamNameMap = new Map<string, string>();
		for (const t of teamRows ?? []) {
			if (t.club_id) teamClubMap.set(t.id, t.club_id);
			teamNameMap.set(t.id, t.name);
		}

		const resultMap = new Map(
			(results ?? []).map((r) => [r.team_id, { rating: r.agg_rating ?? 0, rank: r.agg_rank ?? 0 }]),
		);

		// Aggregate by club
		const clubAgg = new Map<
			string,
			{ totalRating: number; count: number; bestRank: number; bestTeam: string }
		>();

		for (const [teamId, clubId] of teamClubMap) {
			const r = resultMap.get(teamId);
			if (!r) continue;

			const existing = clubAgg.get(clubId) ?? {
				totalRating: 0,
				count: 0,
				bestRank: Infinity,
				bestTeam: '',
			};

			existing.totalRating += r.rating;
			existing.count++;
			if (r.rank < existing.bestRank) {
				existing.bestRank = r.rank;
				existing.bestTeam = teamNameMap.get(teamId) ?? teamId;
			}

			clubAgg.set(clubId, existing);
		}

		// Build response
		const clubs = [...clubAgg.entries()]
			.map(([clubId, agg]) => {
				const club = clubMap.get(clubId);
				return {
					id: clubId,
					name: club?.name ?? clubId,
					region: club?.region ?? null,
					team_count: agg.count,
					avg_rating: agg.totalRating / agg.count,
					best_team: agg.bestTeam,
					best_rank: agg.bestRank,
				};
			})
			.sort((a, b) => b.avg_rating - a.avg_rating);

		return json({ success: true, data: { clubs } });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};
