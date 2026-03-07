<script lang="ts">
	let { data } = $props();

	const actions = [
		{
			href: '/import',
			title: 'Import Data',
			description:
				'Upload Excel spreadsheets with tournament results or Colley ratings to populate the system.',
			icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12',
		},
		{
			href: '/ranking',
			title: 'Rankings',
			description:
				'View, compute, and manage team rankings across age groups using the five-algorithm ensemble.',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
		},
		{
			href: '/ranking/weights',
			title: 'Tournament Weights',
			description:
				'Adjust tournament importance multipliers to fine-tune how results affect final rankings.',
			icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
		},
	];

	const algorithms = [
		{
			name: 'Colley Matrix',
			description: 'A least-squares ranking method that evaluates win/loss records without considering margin of victory, making it resistant to schedule manipulation.',
		},
		{
			name: 'Elo Variants',
			description: 'Four Elo-based rating systems with different starting parameters (K=2200, 2400, 2500, 2700) to capture different sensitivity levels to upsets and consistency.',
		},
		{
			name: 'Ensemble Aggregate',
			description: 'A weighted average across all five algorithms, producing a single consensus ranking that reduces the bias of any individual method.',
		},
	];
</script>

{#if data.session}
	<!-- Authenticated: navigation hub -->
	<div class="py-[var(--space-10)] px-[var(--gutter)]">
		<div class="max-w-[var(--container-max)] mx-auto">
			<div class="mb-[var(--space-10)]">
				<p class="overline mb-[var(--space-2)]">VB Ranking Engine</p>
				<h1 class="display-1 mb-[var(--space-3)]">Team Rankings</h1>
				<p class="body-lg text-[var(--color-text-secondary)] max-w-2xl">
					Compute, review, and export AAU volleyball team rankings using a five-algorithm ensemble
					(Colley Matrix + four Elo variants).
				</p>
			</div>

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				{#each actions as action (action.href)}
					<a href={action.href} class="group block">
						<div class="card card-body card-gradient-border card-interactive">
							<div class="w-10 h-10 rounded-[var(--radius-lg)] mb-[var(--space-3)] flex items-center justify-center bg-[var(--color-accent-50)]">
								<svg class="w-5 h-5 text-[var(--color-accent-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon} />
								</svg>
							</div>
							<h2 class="heading-4 mb-[var(--space-2)] group-hover:text-[var(--color-accent-600)] transition-colors">
								{action.title}
							</h2>
							<p class="body-sm text-[var(--color-text-secondary)]">{action.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<!-- Unauthenticated: landing page -->
	<div class="py-[var(--space-16)] px-[var(--gutter)]">
		<div class="max-w-[var(--container-max)] mx-auto">
			<!-- Hero -->
			<div class="text-center mb-[var(--space-16)]">
				<p class="overline mb-[var(--space-3)]">630 VB Ranking Engine</p>
				<h1 class="display-1 mb-[var(--space-4)] max-w-3xl mx-auto">
					Fair, Transparent Team Rankings for AAU Volleyball
				</h1>
				<p class="body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-[var(--space-8)]">
					A five-algorithm ensemble ranking system used by the 630 ranking committee to compute, review, and publish official team standings across all age groups.
				</p>
				<a href="/auth/login" class="btn btn-primary btn-rect">Sign In</a>
			</div>

			<!-- How it works -->
			<div class="mb-[var(--space-16)]">
				<div class="text-center mb-[var(--space-10)]">
					<p class="overline mb-[var(--space-2)]">Workflow</p>
					<h2 class="heading-1">How It Works</h2>
				</div>

				<div class="grid md:grid-cols-3 gap-8">
					<div class="text-center">
						<div class="w-14 h-14 rounded-full bg-[var(--color-accent-50)] flex items-center justify-center mx-auto mb-[var(--space-4)]">
							<span class="heading-2 text-[var(--color-accent-600)]">1</span>
						</div>
						<h3 class="heading-3 mb-[var(--space-2)]">Import</h3>
						<p class="body-base text-[var(--color-text-secondary)]">
							Upload tournament results from Excel spreadsheets or Colley rating exports. The system deduplicates and validates all data.
						</p>
					</div>

					<div class="text-center">
						<div class="w-14 h-14 rounded-full bg-[var(--color-accent-50)] flex items-center justify-center mx-auto mb-[var(--space-4)]">
							<span class="heading-2 text-[var(--color-accent-600)]">2</span>
						</div>
						<h3 class="heading-3 mb-[var(--space-2)]">Compute</h3>
						<p class="body-base text-[var(--color-text-secondary)]">
							Run rankings with tournament weights. Five algorithms independently evaluate every team, then an ensemble produces the final standings.
						</p>
					</div>

					<div class="text-center">
						<div class="w-14 h-14 rounded-full bg-[var(--color-accent-50)] flex items-center justify-center mx-auto mb-[var(--space-4)]">
							<span class="heading-2 text-[var(--color-accent-600)]">3</span>
						</div>
						<h3 class="heading-3 mb-[var(--space-2)]">Publish</h3>
						<p class="body-base text-[var(--color-text-secondary)]">
							Review rankings by age group, apply manual overrides where needed, then finalize and export for distribution.
						</p>
					</div>
				</div>
			</div>

			<!-- Algorithms -->
			<div class="mb-[var(--space-16)]">
				<div class="text-center mb-[var(--space-10)]">
					<p class="overline mb-[var(--space-2)]">Methodology</p>
					<h2 class="heading-1">Five-Algorithm Ensemble</h2>
					<p class="body-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
						No single algorithm is perfect. By combining five independent methods, the system reduces bias and produces more stable, defensible rankings.
					</p>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					{#each algorithms as algo}
						<div class="card card-body card-gradient-border">
							<h3 class="heading-4 mb-[var(--space-2)]">{algo.name}</h3>
							<p class="body-sm text-[var(--color-text-secondary)]">{algo.description}</p>
						</div>
					{/each}
				</div>
			</div>

			<!-- Who it's for -->
			<div class="card-dark rounded-[var(--radius-2xl)] p-8 md:p-12 text-center">
				<h2 class="heading-1 text-[var(--color-text-dark-primary)] mb-[var(--space-3)]">Built for the Ranking Committee</h2>
				<p class="body-lg text-[var(--color-text-dark-secondary)] mb-[var(--space-6)] max-w-xl mx-auto">
					This tool is used by the 630 ranking committee to produce official AAU volleyball team rankings. Contact your committee lead for access.
				</p>
				<a href="/auth/login" class="btn btn-cta">Sign In</a>
			</div>
		</div>
	</div>
{/if}
