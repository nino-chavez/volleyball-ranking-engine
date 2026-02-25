import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { supabaseServer } from '$lib/supabase-server.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.session) {
		redirect(303, '/auth/login');
	}

	const { data: seasons } = await supabaseServer
		.from('seasons')
		.select('id, name, is_active')
		.order('start_date', { ascending: false });

	return { seasons: seasons ?? [] };
};
