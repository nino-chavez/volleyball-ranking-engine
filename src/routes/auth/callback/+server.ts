import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { email, password, action } = await request.json();

	if (!email || !password) {
		return json({ error: 'Email and password are required.' }, { status: 400 });
	}

	if (action === 'signup') {
		return json({ error: 'Public signup is disabled. Contact an administrator for access.' }, { status: 403 });
	}

	// Default: login
	const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
	if (error) {
		return json({ error: 'Invalid email or password.' }, { status: 400 });
	}

	return json({ success: true });
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('OAuth callback error:', error.message);
			redirect(303, '/auth/login?error=callback_failed');
		}
	}

	redirect(303, '/');
};
