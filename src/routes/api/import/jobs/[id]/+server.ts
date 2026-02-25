import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { supabaseServer } from '$lib/supabase-server.js';
import { requireAuth } from '$lib/auth-guard.js';

/**
 * GET /api/import/jobs/[id]
 * Get a single import job by ID with its source details.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	const authError = requireAuth(locals);
	if (authError) return authError;

	const jobId = params.id;

	const { data: job, error } = await supabaseServer
		.from('import_jobs')
		.select('*, import_sources(name, source_type, format, season_id, age_group)')
		.eq('id', jobId)
		.single();

	if (error) {
		return json({ success: false, error: error.message }, { status: 404 });
	}

	return json({ success: true, data: { job } });
};
