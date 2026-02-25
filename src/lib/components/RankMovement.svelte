<script lang="ts">
	let {
		currentRank,
		previousRank,
	}: {
		currentRank: number;
		previousRank: number | null;
	} = $props();

	const movement = $derived(
		previousRank == null ? 'new' : previousRank - currentRank,
	);

	const label = $derived(
		movement === 'new'
			? 'New entry'
			: movement > 0
				? `Up ${movement} position${movement !== 1 ? 's' : ''}`
				: movement < 0
					? `Down ${Math.abs(movement)} position${Math.abs(movement) !== 1 ? 's' : ''}`
					: 'No change',
	);
</script>

{#if movement === 'new'}
	<span
		class="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent"
		title={label}
		aria-label={label}
	>
		NEW
	</span>
{:else if movement > 0}
	<span
		class="inline-flex items-center gap-0.5 text-xs font-medium text-success"
		title={label}
		aria-label={label}
	>
		<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
			<path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
		</svg>
		{movement}
	</span>
{:else if movement < 0}
	<span
		class="inline-flex items-center gap-0.5 text-xs font-medium text-error"
		title={label}
		aria-label={label}
	>
		<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
			<path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
		</svg>
		{Math.abs(movement)}
	</span>
{:else}
	<span
		class="inline-flex items-center text-xs text-text-muted"
		title={label}
		aria-label={label}
	>
		<svg class="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
			<path d="M2 6H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
		</svg>
	</span>
{/if}
