import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { supabaseServer } from '$lib/supabase-server.js';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.session) {
		redirect(303, '/auth/login');
	}

	const sourceId = url.searchParams.get('source_id');

	// Fetch sources for the trigger dropdown
	const { data: sources } = await supabaseServer
		.from('import_sources')
		.select('id, name, source_type, format, enabled')
		.eq('enabled', true)
		.order('name');

	return {
		sources: sources ?? [],
		initialSourceId: sourceId,
	};
};
