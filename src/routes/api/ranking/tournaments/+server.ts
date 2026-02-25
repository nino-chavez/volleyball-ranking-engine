import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { requireAuth } from '$lib/auth-guard.js';
import { supabaseServer } from '$lib/supabase-server.js';
import { computeTCI } from '$lib/ranking/tci.js';

/**
 * GET /api/ranking/tournaments?season_id=&age_group=
 *
 * Computes Tournament Competitiveness Index (TCI) per tournament.
 * Uses the latest finalized ranking run's team ratings.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const seasonId = url.searchParams.get('season_id');
	const ageGroup = url.searchParams.get('age_group');

	if (!seasonId || !ageGroup) {
		return json(
			{ success: false, error: 'Missing required parameters: season_id, age_group' },
			{ status: 400 },
		);
	}

	try {
		// Find the latest finalized run for these params
		const { data: latestRun } = await supabaseServer
			.from('ranking_runs')
			.select('id')
			.eq('season_id', seasonId)
			.eq('age_group', ageGroup as '15U' | '16U' | '17U' | '18U')
			.eq('status', 'finalized')
			.order('ran_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		// Fetch all tournaments for the season
		const { data: tournaments, error: tournErr } = await supabaseServer
			.from('tournaments')
			.select('id, name, date, location')
			.eq('season_id', seasonId)
			.order('date');

		if (tournErr) {
			return json({ success: false, error: tournErr.message }, { status: 500 });
		}

		if (!tournaments || tournaments.length === 0) {
			return json({ success: true, data: { tournaments: [] } });
		}

		const tournamentIds = tournaments.map((t) => t.id);

		// Fetch all tournament results to compute field size per tournament
		const { data: allResults } = await supabaseServer
			.from('tournament_results')
			.select('tournament_id, team_id')
			.in('tournament_id', tournamentIds);

		// Group by tournament: set of unique team_ids
		const fieldMap = new Map<string, Set<string>>();
		for (const r of allResults ?? []) {
			if (!fieldMap.has(r.tournament_id)) {
				fieldMap.set(r.tournament_id, new Set());
			}
			fieldMap.get(r.tournament_id)!.add(r.team_id);
		}

		// Fetch tournament weights/tiers
		const { data: weightRows } = await supabaseServer
			.from('tournament_weights')
			.select('tournament_id, weight, tier')
			.eq('season_id', seasonId)
			.in('tournament_id', tournamentIds);

		const weightMap = new Map(
			(weightRows ?? []).map((w) => [w.tournament_id, { weight: w.weight, tier: w.tier }]),
		);

		// If we have a finalized run, fetch ratings for TCI avg rating calculation
		const ratingMap = new Map<string, number>();
		if (latestRun) {
			const { data: rankings } = await supabaseServer
				.from('ranking_results')
				.select('team_id, agg_rating')
				.eq('ranking_run_id', latestRun.id);

			for (const r of rankings ?? []) {
				ratingMap.set(r.team_id, r.agg_rating ?? 0);
			}
		}

		// Compute TCI for each tournament
		const tournamentData = tournaments.map((t) => {
			const teamIds = fieldMap.get(t.id) ?? new Set<string>();
			const fieldSize = teamIds.size;

			// Avg rating of participating teams
			let avgRating = 0;
			if (ratingMap.size > 0 && teamIds.size > 0) {
				const ratings = [...teamIds]
					.map((id) => ratingMap.get(id))
					.filter((r): r is number => r !== undefined);
				avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
			}

			const w = weightMap.get(t.id);

			return {
				id: t.id,
				name: t.name,
				date: t.date,
				location: t.location,
				field_size: fieldSize,
				avg_rating: avgRating,
				weight: w?.weight ?? 1,
				tier: w?.tier ?? null,
				tci: 0, // placeholder, computed below
			};
		});

		// Compute max values for normalization
		const maxFieldSize = Math.max(...tournamentData.map((t) => t.field_size), 1);
		const maxAvgRating = Math.max(...tournamentData.map((t) => t.avg_rating), 1);

		// Compute TCI and sort
		for (const t of tournamentData) {
			t.tci = computeTCI(t.field_size, t.avg_rating, maxFieldSize, maxAvgRating);
		}

		tournamentData.sort((a, b) => b.tci - a.tci);

		return json({ success: true, data: { tournaments: tournamentData } });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};
