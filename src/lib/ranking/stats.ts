/**
 * Pure statistical functions for ranking summary calculations.
 */

export function computeMean(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function computeMedian(values: number[]): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeStdDev(values: number[]): number {
	if (values.length < 2) return 0;
	const mean = computeMean(values);
	const squaredDiffs = values.map((v) => (v - mean) ** 2);
	return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

export interface HistogramBucket {
	label: string;
	min: number;
	max: number;
	count: number;
}

export function computeHistogram(
	values: number[],
	bucketCount: number = 10,
): HistogramBucket[] {
	if (values.length === 0) return [];

	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min;

	if (range === 0) {
		return [{ label: min.toFixed(1), min, max, count: values.length }];
	}

	const bucketSize = range / bucketCount;
	const buckets: HistogramBucket[] = Array.from({ length: bucketCount }, (_, i) => ({
		label: `${(min + i * bucketSize).toFixed(1)}`,
		min: min + i * bucketSize,
		max: min + (i + 1) * bucketSize,
		count: 0,
	}));

	for (const value of values) {
		const index = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
		buckets[index].count++;
	}

	return buckets;
}
