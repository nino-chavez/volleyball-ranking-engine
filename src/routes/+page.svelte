<script lang="ts">
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
</script>

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
