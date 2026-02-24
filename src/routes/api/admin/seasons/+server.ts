import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { requireAuth } from '$lib/auth-guard.js';
import { supabaseServer } from '$lib/supabase-server.js';
import { seasonInsertSchema, seasonUpdateSchema } from '$lib/schemas/season.js';
import { z } from 'zod';

/**
 * GET /api/admin/seasons
 *
 * Returns all seasons ordered by start_date descending.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	try {
		const { data: seasons, error } = await supabaseServer
			.from('seasons')
			.select('*')
			.order('start_date', { ascending: false });

		if (error) {
			return json({ success: false, error: error.message }, { status: 500 });
		}

		return json({ success: true, data: { seasons: seasons ?? [] } });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};

/**
 * POST /api/admin/seasons
 *
 * Create a new season. Validates body with seasonInsertSchema.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	try {
		const body = await request.json();
		const parsed = seasonInsertSchema.safeParse(body);

		if (!parsed.success) {
			return json(
				{ success: false, error: 'Validation failed', details: parsed.error.issues },
				{ status: 400 },
			);
		}

		const { data: season, error } = await supabaseServer
			.from('seasons')
			.insert(parsed.data)
			.select()
			.single();

		if (error) {
			return json({ success: false, error: error.message }, { status: 500 });
		}

		return json({ success: true, data: { season } });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};

/**
 * PUT /api/admin/seasons
 *
 * Update an existing season. Requires id in body alongside partial fields.
 */
const putBodySchema = z.object({
	id: z.uuid(),
	...seasonUpdateSchema.shape,
});

export const PUT: RequestHandler = async ({ request, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	try {
		const body = await request.json();
		const parsed = putBodySchema.safeParse(body);

		if (!parsed.success) {
			return json(
				{ success: false, error: 'Validation failed', details: parsed.error.issues },
				{ status: 400 },
			);
		}

		const { id, ...fields } = parsed.data;

		const { data: season, error } = await supabaseServer
			.from('seasons')
			.update(fields)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return json({ success: false, error: error.message }, { status: 500 });
		}

		return json({ success: true, data: { season } });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};

/**
 * DELETE /api/admin/seasons?id=...
 *
 * Delete a season by id. Checks for dependent tournaments first.
 */
export const DELETE: RequestHandler = async ({ url, locals }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const id = url.searchParams.get('id');

	if (!id) {
		return json({ success: false, error: 'Missing required parameter: id' }, { status: 400 });
	}

	try {
		// Check for dependent tournaments
		const { count, error: countError } = await supabaseServer
			.from('tournaments')
			.select('id', { count: 'exact', head: true })
			.eq('season_id', id);

		if (countError) {
			return json({ success: false, error: countError.message }, { status: 500 });
		}

		if (count && count > 0) {
			return json(
				{
					success: false,
					error: `Cannot delete season: ${count} tournament(s) depend on it. Remove them first.`,
				},
				{ status: 409 },
			);
		}

		const { error: deleteError } = await supabaseServer
			.from('seasons')
			.delete()
			.eq('id', id);

		if (deleteError) {
			return json({ success: false, error: deleteError.message }, { status: 500 });
		}

		return json({ success: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'An unexpected error occurred';
		return json({ success: false, error: message }, { status: 500 });
	}
};
