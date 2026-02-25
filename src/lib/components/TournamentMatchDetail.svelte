<script lang="ts">
	import { toOrdinal, formatDate } from '$lib/utils/format.js';

	interface Match {
		opponent_name: string;
		won: boolean;
		set_scores?: string | null;
	}

	interface TournamentEntry {
		tournament_name: string;
		tournament_date: string;
		division: string;
		finish_position: number;
		field_size: number;
		matches: Match[];
	}

	let {
		tournaments,
	}: {
		tournaments: TournamentEntry[];
	} = $props();

	let expandedMap = $state<Record<string, boolean>>({});

	function toggle(key: string) {
		expandedMap = { ...expandedMap, [key]: !expandedMap[key] };
	}
</script>

<div class="space-y-3">
	{#each tournaments as tourn (tourn.tournament_name + tourn.tournament_date)}
		{@const key = tourn.tournament_name + tourn.tournament_date}
		{@const isExpanded = expandedMap[key] ?? false}
		{@const hasMatches = tourn.matches.length > 0}
		{@const wins = tourn.matches.filter((m) => m.won).length}
		{@const losses = tourn.matches.filter((m) => !m.won).length}

		<div class="rounded-lg border border-border bg-surface shadow-sm">
			<button
				type="button"
				class="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface-alt/50 focus:outline-none focus:ring-1 focus:ring-accent rounded-lg"
				onclick={() => toggle(key)}
				aria-expanded={isExpanded}
			>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<span class="text-sm font-semibold text-text-primary truncate">{tourn.tournament_name}</span>
						{#if hasMatches}
							<span class="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-[10px] font-medium text-text-secondary">
								{wins}W-{losses}L
							</span>
						{/if}
					</div>
					<div class="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
						<span>{formatDate(tourn.tournament_date)}</span>
						<span>{tourn.division}</span>
						<span>Finish: {toOrdinal(tourn.finish_position)} of {tourn.field_size}</span>
					</div>
				</div>
				{#if hasMatches}
					<svg
						class="h-4 w-4 shrink-0 text-text-muted transition-transform {isExpanded ? 'rotate-180' : ''}"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				{/if}
			</button>

			{#if isExpanded && hasMatches}
				<div class="border-t border-border px-4 py-2">
					<div class="space-y-1">
						{#each tourn.matches as match, i (i)}
							<div class="flex items-center gap-3 py-1.5 text-sm">
								<span
									class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold {match.won
										? 'bg-success/10 text-success'
										: 'bg-error/10 text-error'}"
								>
									{match.won ? 'W' : 'L'}
								</span>
								<span class="text-text-primary">vs. {match.opponent_name}</span>
								{#if match.set_scores}
									<span class="text-xs text-text-muted">({match.set_scores})</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
