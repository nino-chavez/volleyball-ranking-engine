<script lang="ts">
  import type { NormalizedTeamResult } from '$lib/ranking/types.js';
  import DataTable from './DataTable.svelte';
  import TierRow from './TierRow.svelte';
  import RankBadge from './RankBadge.svelte';

  let { results, teams }: {
    results: NormalizedTeamResult[];
    teams: Map<string, string>;
  } = $props();

  function fmt(value: number): string {
    return value.toFixed(2);
  }
</script>

{#if results.length === 0}
  <div class="rounded-lg border border-border bg-surface p-12 text-center shadow-sm">
    <p class="text-text-muted">No results</p>
  </div>
{:else}
  <DataTable caption="Ranking results">
    <thead class="bg-surface-alt">
      <tr>
        <th scope="col" class="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Rank</th>
        <th scope="col" class="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Team Name</th>
        <th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Colley Rating</th>
        <th scope="col" class="hidden px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Colley Rank</th>
        <th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2200 Rating</th>
        <th scope="col" class="hidden px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2200 Rank</th>
        <th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2400 Rating</th>
        <th scope="col" class="hidden px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2400 Rank</th>
        <th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2500 Rating</th>
        <th scope="col" class="hidden px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2500 Rank</th>
        <th scope="col" class="hidden px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2700 Rating</th>
        <th scope="col" class="hidden px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted sm:table-cell">Elo-2700 Rank</th>
        <th scope="col" class="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-muted">AggRating</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-border">
      {#each results as row (row.team_id)}
        <TierRow rank={row.agg_rank}>
          <td class="whitespace-nowrap px-3 py-2 text-center"><RankBadge rank={row.agg_rank} /></td>
          <td class="whitespace-nowrap px-3 py-2 text-left text-sm font-medium text-text-primary">{teams.get(row.team_id) ?? row.team_id}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{fmt(row.algo1_rating)}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-center text-sm text-text-muted sm:table-cell">{row.algo1_rank}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{fmt(row.algo2_rating)}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-center text-sm text-text-muted sm:table-cell">{row.algo2_rank}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{fmt(row.algo3_rating)}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-center text-sm text-text-muted sm:table-cell">{row.algo3_rank}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{fmt(row.algo4_rating)}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-center text-sm text-text-muted sm:table-cell">{row.algo4_rank}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-right text-sm tabular-nums text-text-secondary sm:table-cell">{fmt(row.algo5_rating)}</td>
          <td class="hidden whitespace-nowrap px-3 py-2 text-center text-sm text-text-muted sm:table-cell">{row.algo5_rank}</td>
          <td class="whitespace-nowrap px-3 py-2 text-right text-sm font-semibold tabular-nums text-text-primary">{fmt(row.agg_rating)}</td>
        </TierRow>
      {/each}
    </tbody>
  </DataTable>
{/if}
