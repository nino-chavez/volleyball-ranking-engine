<script lang="ts">
	interface Props {
		rank: number;
	}

	let { rank }: Props = $props();

	const isTopFive = $derived(rank <= 5);
</script>

{#if isTopFive}
	<span
		class="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-gradient-to-br from-[#1C1917] to-[#292524] px-2 py-0.5 text-sm font-bold tabular-nums text-white shadow-sm"
	>
		{rank}
	</span>
{:else}
	<span
		class="inline-flex min-w-[2rem] items-center justify-center tabular-nums text-sm font-medium text-text-secondary"
	>
		{rank}
	</span>
{/if}
