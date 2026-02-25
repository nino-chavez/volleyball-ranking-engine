<script lang="ts">
	import { computeHistogram } from '$lib/ranking/stats.js';
	import ChartContainer from './ChartContainer.svelte';
	import BarChart from './BarChart.svelte';

	let {
		ratings,
	}: {
		ratings: number[];
	} = $props();

	const buckets = $derived(computeHistogram(ratings, 10));
	const chartData = $derived(
		buckets.map((b) => ({ bucket: b.label, count: b.count })),
	);
</script>

<ChartContainer title="Rating Distribution" height={280} empty={ratings.length === 0}>
	<BarChart
		data={chartData}
		x="bucket"
		y="count"
		xLabel="Aggregate Rating"
		yLabel="Teams"
		height={240}
	/>
</ChartContainer>
