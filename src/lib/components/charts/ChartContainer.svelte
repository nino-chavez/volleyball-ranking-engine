<script lang="ts">
	import { chartDefaults } from './chart-theme.js';
	import type { Snippet } from 'svelte';

	let {
		title = '',
		height = chartDefaults.height,
		loading = false,
		empty = false,
		emptyMessage = 'No data available',
		children,
	}: {
		title?: string;
		height?: number;
		loading?: boolean;
		empty?: boolean;
		emptyMessage?: string;
		children: Snippet;
	} = $props();
</script>

<div class="rounded-xl border border-border bg-surface shadow-sm">
	{#if title}
		<div class="border-b border-border px-5 py-3">
			<h3 class="text-sm font-semibold text-text-primary">{title}</h3>
		</div>
	{/if}

	<div class="relative px-4 py-4" style="min-height: {height}px;">
		{#if loading}
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
			</div>
		{:else if empty}
			<div class="flex h-full items-center justify-center" style="min-height: {height - 32}px;">
				<p class="text-sm text-text-muted">{emptyMessage}</p>
			</div>
		{:else}
			{@render children()}
		{/if}
	</div>
</div>
