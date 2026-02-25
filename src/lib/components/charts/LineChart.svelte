<!-- eslint-disable @typescript-eslint/no-explicit-any -- Record<string, any> required for LayerChart generic data compatibility -->
<script lang="ts" generics="T extends Record<string, any>">
	import { Chart, Svg, Axis, Grid, Spline, Highlight, Tooltip } from 'layerchart';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import { chartColors, chartFonts, chartDefaults } from './chart-theme.js';

	let {
		data,
		x,
		y,
		xScale: xScaleProp,
		yScale: yScaleProp,
		yDomain,
		xLabel = '',
		yLabel = '',
		height = chartDefaults.height,
		padding = chartDefaults.padding,
		yReverse = false,
		yNice = true,
		formatTooltip,
		color = chartColors.accent,
	}: {
		data: T[];
		x: string;
		y: string;
		xScale?: ReturnType<typeof scaleTime> | ReturnType<typeof scaleLinear>;
		yScale?: ReturnType<typeof scaleLinear>;
		yDomain?: [number | null, number | null];
		xLabel?: string;
		yLabel?: string;
		height?: number;
		padding?: { top?: number; right?: number; bottom?: number; left?: number };
		yReverse?: boolean;
		yNice?: boolean;
		formatTooltip?: (d: T) => string;
		color?: string;
	} = $props();
</script>

<div style="height: {height}px;">
	<Chart
		{data}
		{x}
		{y}
		{yDomain}
		{yNice}
		{yReverse}
		{padding}
		xScale={xScaleProp ?? scaleTime()}
		yScale={yScaleProp ?? scaleLinear()}
		tooltip={{ mode: 'bisect-x' }}
	>
		<Svg>
			<Axis
				placement="bottom"
				label={xLabel}
				tickLabelProps={{ fill: chartColors.axisText, 'font-size': chartFonts.sizeSm }}
			/>
			<Axis
				placement="left"
				label={yLabel}
				tickLabelProps={{ fill: chartColors.axisText, 'font-size': chartFonts.sizeSm }}
			/>
			<Grid class="stroke-border opacity-50" />
			<Spline class="stroke-2" style="stroke: {color};" />
			<Highlight
				points={{ class: 'fill-accent' }}
				lines={{ class: 'stroke-accent/30' }}
			/>
		</Svg>
		<Tooltip.Root let:data={tooltipData}>
			<Tooltip.Header>
				{#if formatTooltip}
					{formatTooltip(tooltipData)}
				{:else}
					{tooltipData[y]}
				{/if}
			</Tooltip.Header>
		</Tooltip.Root>
	</Chart>
</div>
