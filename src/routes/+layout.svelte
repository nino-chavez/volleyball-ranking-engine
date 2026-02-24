<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import NavHeader from '$lib/components/NavHeader.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import { page } from '$app/state';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<NavHeader currentPath={page.url.pathname} />
<PageShell>
	{@render children()}
</PageShell>
