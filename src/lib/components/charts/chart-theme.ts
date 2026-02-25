/**
 * Chart theme constants aligned with "Game Day" design tokens.
 * Consumed by chart wrapper components for consistent styling.
 */

export const chartColors = {
	accent: '#E05A2B',
	accentLight: '#FFF5EF',
	accentHover: '#C44E25',

	// Tier colors (match TierRow component)
	tier1: '#F59E0B', // amber-500
	tier2: '#3B82F6', // blue-500
	tier3: '#10B981', // emerald-500
	tier4: '#78716C', // text-muted

	success: '#16a34a',
	error: '#dc2626',
	warning: '#d97706',

	// Chart-specific palette for multi-series
	series: ['#E05A2B', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],

	// Neutral tones
	gridLine: '#DDD9D1',
	axisLine: '#C4BFB5',
	axisText: '#78716C',
	tooltipBg: '#1C1917',
	tooltipText: '#FFFFFF',
	tooltipBorder: '#292524',
} as const;

export const chartFonts = {
	family: "'Space Grotesk Variable', 'Space Grotesk', system-ui, sans-serif",
	sizeXs: 10,
	sizeSm: 11,
	sizeMd: 12,
	sizeLg: 14,
} as const;

export const chartDefaults = {
	/** Standard chart height in pixels */
	height: 300,
	/** Compact chart height (e.g., inline sparklines) */
	heightCompact: 200,
	/** Padding around chart area */
	padding: { top: 20, right: 20, bottom: 40, left: 50 },
	/** Padding for charts with no left axis */
	paddingNoAxis: { top: 20, right: 20, bottom: 40, left: 20 },
} as const;
