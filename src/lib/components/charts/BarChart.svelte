<!-- eslint-disable @typescript-eslint/no-explicit-any -- Record<string, any> required for LayerChart generic data compatibility -->
<script lang="ts" generics="T extends Record<string, any>">
	import { Chart, Svg, Axis, Grid, Bars } from 'layerchart';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { chartColors, chartFonts, chartDefaults } from './chart-theme.js';

	let {
		data,
		x,
		y,
		xLabel = '',
		yLabel = '',
		height = chartDefaults.height,
		padding = chartDefaults.padding,
		color = chartColors.accent,
	}: {
		data: T[];
		x: string;
		y: string;
		xLabel?: string;
		yLabel?: string;
		height?: number;
		padding?: { top?: number; right?: number; bottom?: number; left?: number };
		color?: string;
	} = $props();
</script>

<div style="height: {height}px;">
	<Chart
		{data}
		{x}
		{y}
		{padding}
		xScale={scaleBand().padding(0.2)}
		yScale={scaleLinear()}
		yDomain={[0, null]}
		yNice
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
			<Bars class="fill-accent" style="fill: {color};" />
		</Svg>
	</Chart>
</div>
