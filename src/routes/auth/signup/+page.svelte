<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
</script>

<PageHeader title="Invite Only" subtitle="Access to the Volleyball Ranking Engine is by invitation." />

<div class="mx-auto max-w-md">
	<Card>
		<div class="space-y-4 text-center">
			<p class="text-sm text-text-secondary">
				New accounts are created by an administrator through the Supabase dashboard.
				If you need access, contact your committee administrator.
			</p>
			<p class="text-sm text-text-muted">
				Already have an account?
				<a href="/auth/login" class="font-medium text-accent hover:text-accent-hover">Log in</a>
			</p>
		</div>
	</Card>
</div>
