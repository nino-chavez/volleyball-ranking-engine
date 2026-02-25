<script lang="ts">
	let {
		mean,
		median,
		stdDev,
		teamCount,
	}: {
		mean: number;
		median: number;
		stdDev: number;
		teamCount: number;
	} = $props();

	function fmt(n: number): string {
		return n.toFixed(2);
	}
</script>

<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
	<div class="rounded-lg border border-border bg-surface p-4 text-center shadow-sm">
		<div class="text-xs font-medium uppercase tracking-wider text-text-muted">Teams</div>
		<div class="mt-1 text-2xl font-bold tabular-nums text-text-primary">{teamCount}</div>
	</div>
	<div class="rounded-lg border border-border bg-surface p-4 text-center shadow-sm">
		<div class="text-xs font-medium uppercase tracking-wider text-text-muted">Mean Rating</div>
		<div class="mt-1 text-2xl font-bold tabular-nums text-text-primary">{fmt(mean)}</div>
	</div>
	<div class="rounded-lg border border-border bg-surface p-4 text-center shadow-sm">
		<div class="text-xs font-medium uppercase tracking-wider text-text-muted">Median Rating</div>
		<div class="mt-1 text-2xl font-bold tabular-nums text-text-primary">{fmt(median)}</div>
	</div>
	<div class="rounded-lg border border-border bg-surface p-4 text-center shadow-sm">
		<div class="text-xs font-medium uppercase tracking-wider text-text-muted">Std Dev</div>
		<div class="mt-1 text-2xl font-bold tabular-nums text-text-primary">{fmt(stdDev)}</div>
	</div>
</div>
