import { describe, it, expect } from 'vitest';
import { computeTCI } from '../tci.js';

describe('computeTCI', () => {
	it('returns 0 when maxFieldSize is 0', () => {
		expect(computeTCI(10, 50, 0, 100)).toBe(0);
	});

	it('returns 0 when maxAvgRating is 0', () => {
		expect(computeTCI(10, 50, 20, 0)).toBe(0);
	});

	it('returns 100 when tournament has max field and max rating', () => {
		const result = computeTCI(20, 80, 20, 80);
		expect(result).toBeCloseTo(100, 1);
	});

	it('returns ~50 for a tournament with half the max values', () => {
		const result = computeTCI(10, 40, 20, 80);
		// fieldSizeScore = 50, avgRatingScore = 50, placementScore = 25
		// 50*0.4 + 50*0.4 + 25*0.2 = 20 + 20 + 5 = 45
		expect(result).toBeCloseTo(45, 1);
	});

	it('scales between 0 and 100', () => {
		const result = computeTCI(5, 30, 20, 80);
		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThanOrEqual(100);
	});
});
