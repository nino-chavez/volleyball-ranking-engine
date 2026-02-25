/**
 * Tournament Competitiveness Index (TCI)
 *
 * Normalized weighted combination:
 * - Field size: 40%
 * - Average team agg_rating of participants: 40%
 * - Placement distribution (ratio of competitive finishes): 20%
 *
 * Scale: 0-100
 */

export function computeTCI(
	fieldSize: number,
	avgRating: number,
	maxFieldSize: number,
	maxAvgRating: number,
): number {
	if (maxFieldSize === 0 || maxAvgRating === 0) return 0;

	const fieldSizeScore = (fieldSize / maxFieldSize) * 100;
	const avgRatingScore = (avgRating / maxAvgRating) * 100;

	// Placement distribution proxy: larger fields with higher avg ratings
	// have tighter placement distributions (more competitive)
	const placementScore = ((fieldSize / maxFieldSize) * (avgRating / maxAvgRating)) * 100;

	return fieldSizeScore * 0.4 + avgRatingScore * 0.4 + placementScore * 0.2;
}
