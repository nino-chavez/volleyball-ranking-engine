<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header?: Snippet;
		children: Snippet;
		padding?: 'default' | 'none';
	}

	let { header, children, padding = 'default' }: Props = $props();
</script>

<div class="rounded-xl bg-surface shadow-md ring-1 ring-black/[0.04]">
	{#if header}
		<div class="border-b border-border px-6 py-5">
			{@render header()}
		</div>
	{/if}
	<div class={padding === 'default' ? 'p-6' : ''}>
		{@render children()}
	</div>
</div>
