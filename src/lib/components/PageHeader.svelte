<script lang="ts">
	interface Props {
		title: string;
		subtitle?: string;
	}

	let { title, subtitle }: Props = $props();
</script>

<div class="mb-8">
	<h1 class="text-3xl font-bold tracking-tight text-text-primary">{title}</h1>
	{#if subtitle}
		<p class="mt-2 text-base text-text-secondary">{subtitle}</p>
	{/if}
	<div class="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-accent to-accent/40"></div>
</div>
