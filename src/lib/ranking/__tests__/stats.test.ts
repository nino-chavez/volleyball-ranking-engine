import { describe, it, expect } from 'vitest';
import { computeMean, computeMedian, computeStdDev, computeHistogram } from '../stats.js';

describe('computeMean', () => {
	it('returns 0 for empty array', () => {
		expect(computeMean([])).toBe(0);
	});

	it('computes mean of values', () => {
		expect(computeMean([10, 20, 30])).toBe(20);
	});

	it('handles single value', () => {
		expect(computeMean([42])).toBe(42);
	});
});

describe('computeMedian', () => {
	it('returns 0 for empty array', () => {
		expect(computeMedian([])).toBe(0);
	});

	it('returns middle value for odd-length array', () => {
		expect(computeMedian([3, 1, 2])).toBe(2);
	});

	it('returns average of two middle values for even-length array', () => {
		expect(computeMedian([1, 2, 3, 4])).toBe(2.5);
	});

	it('handles single value', () => {
		expect(computeMedian([5])).toBe(5);
	});
});

describe('computeStdDev', () => {
	it('returns 0 for empty array', () => {
		expect(computeStdDev([])).toBe(0);
	});

	it('returns 0 for single value', () => {
		expect(computeStdDev([5])).toBe(0);
	});

	it('computes sample standard deviation', () => {
		// [2, 4, 4, 4, 5, 5, 7, 9] => mean=5, variance=4, stddev=2
		const result = computeStdDev([2, 4, 4, 4, 5, 5, 7, 9]);
		expect(result).toBeCloseTo(2, 0);
	});
});

describe('computeHistogram', () => {
	it('returns empty for empty array', () => {
		expect(computeHistogram([])).toEqual([]);
	});

	it('creates buckets with counts', () => {
		const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
		const buckets = computeHistogram(values, 5);
		expect(buckets).toHaveLength(5);
		expect(buckets.every((b) => b.count >= 1)).toBe(true);
	});

	it('handles all same values', () => {
		const buckets = computeHistogram([5, 5, 5], 3);
		expect(buckets).toHaveLength(1);
		expect(buckets[0].count).toBe(3);
	});
});
