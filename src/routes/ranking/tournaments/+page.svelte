<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Card from '$lib/components/Card.svelte';
	import Select from '$lib/components/Select.svelte';
	import Button from '$lib/components/Button.svelte';
	import DataTable from '$lib/components/DataTable.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import ChartContainer from '$lib/components/charts/ChartContainer.svelte';
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import { AgeGroup } from '$lib/schemas/enums.js';
	import { formatDate } from '$lib/utils/format.js';

	let { data } = $props<{
		data: {
			seasons: Array<{ id: string; name: string }>;
		};
	}>();

	interface TournamentResult {
		id: string;
		name: string;
		date: string;
		location: string | null;
		field_size: number;
		avg_rating: number;
		weight: number;
		tier: number | null;
		tci: number;
	}

	let selectedSeasonId = $state('');
	let selectedAgeGroup = $state('');
	let tournaments = $state<TournamentResult[]>([]);
	let loading = $state(false);
	let loaded = $state(false);
	let errorMessage = $state('');

	const contextReady = $derived(selectedSeasonId !== '' && selectedAgeGroup !== '');

	const seasonOptions = $derived(
		data.seasons.map((s: { id: string; name: string }) => ({ value: s.id, label: s.name })),
	);
	const ageGroupOptions = AgeGroup.options.map((ag) => ({ value: ag, label: ag }));

	const chartData = $derived(
		tournaments.slice(0, 15).map((t) => ({ name: t.name.slice(0, 20), tci: Math.round(t.tci * 10) / 10 })),
	);

	async function loadTournaments() {
		if (!contextReady || loading) return;
		loading = true;
		errorMessage = '';

		try {
			const res = await fetch(
				`/api/ranking/tournaments?season_id=${selectedSeasonId}&age_group=${selectedAgeGroup}`,
			);
			const result = await res.json();

			if (!res.ok || !result.success) {
				errorMessage = result.error || 'Failed to load tournament rankings.';
				return;
			}

			tournaments = result.data.tournaments;
			loaded = true;
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
		} finally {
			loading = false;
		}
	}

	function tierLabel(tier: number | null): string {
		if (tier === null) return '--';
		return `Tier ${tier}`;
	}
</script>

<PageHeader
	title="Tournament Rankings"
	subtitle="Tournaments ranked by Tournament Competitiveness Index (TCI)."
/>

<div class="space-y-6">
	<Card>
		{#snippet header()}
			<h2 class="text-lg font-semibold text-text-primary">Select Context</h2>
		{/snippet}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Select
				label="Season"
				id="tourn-season-select"
				options={seasonOptions}
				bind:value={selectedSeasonId}
				placeholder="Select a season..."
			/>
			<Select
				label="Age Group"
				id="tourn-age-group-select"
				options={ageGroupOptions}
				bind:value={selectedAgeGroup}
				placeholder="Select age group..."
			/>
		</div>
		<div class="mt-4">
			<Button variant="primary" disabled={!contextReady || loading} {loading} onclick={loadTournaments}>
				Load Tournament Rankings
			</Button>
		</div>
	</Card>

	{#if errorMessage}
		<Banner variant="error" title="Error">{errorMessage}</Banner>
	{/if}

	{#if loaded && tournaments.length === 0}
		<Card>
			<p class="py-8 text-center text-text-muted">No tournaments found for this season and age group.</p>
		</Card>
	{/if}

	{#if tournaments.length > 0}
		<!-- TCI Bar Chart -->
		<ChartContainer title="TCI Overview (Top 15)" height={300} empty={chartData.length === 0}>
			<BarChart data={chartData} x="name" y="tci" height={260} />
		</ChartContainer>

		<!-- Tournament Ranking Table -->
		<DataTable caption="Tournament rankings by TCI">
			<thead class="bg-gradient-to-r from-[#1C1917] via-[#292524] to-[#1C1917] text-white">
				<tr>
					<th scope="col" class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/70">#</th>
					<th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Tournament</th>
					<th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/70">Date</th>
					<th scope="col" class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/70">Tier</th>
					<th scope="col" class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/70">Field Size</th>
					<th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70 sm:table-cell">Avg Rating</th>
					<th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70 sm:table-cell">Weight</th>
					<th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/70">TCI</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border">
				{#each tournaments as tourn, i (tourn.id)}
					<tr class="hover:bg-surface-alt/50">
						<td class="whitespace-nowrap px-3 py-2 text-center text-sm font-semibold tabular-nums text-text-primary">{i + 1}</td>
						<td class="whitespace-nowrap px-3 py-2 text-sm font-medium text-text-primary">{tourn.name}</td>
						<td class="whitespace-nowrap px-3 py-2 text-sm text-text-secondary">{formatDate(tourn.date)}</td>
						<td class="whitespace-nowrap px-3 py-2 text-center text-sm text-text-secondary">{tierLabel(tourn.tier)}</td>
						<td class="whitespace-nowrap px-3 py-2 text-center text-sm tabular-nums text-text-secondary">{tourn.field_size}</td>
						<td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{tourn.avg_rating.toFixed(2)}</td>
						<td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{tourn.weight.toFixed(1)}</td>
						<td class="whitespace-nowrap px-3 py-2 text-right text-sm font-semibold tabular-nums text-accent">{tourn.tci.toFixed(1)}</td>
					</tr>
				{/each}
			</tbody>
		</DataTable>
	{/if}
</div>
