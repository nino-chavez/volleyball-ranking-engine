import type { IdentityConflict, IdentityMapping } from './types.js';

/**
 * Available auto-resolution strategies for handling identity conflicts.
 */
export type ResolutionStrategy =
	| 'exact_match_only'
	| 'fuzzy_threshold'
	| 'create_missing'
	| 'skip_unresolved';

/**
 * Apply an auto-resolution strategy to a list of identity conflicts,
 * producing identity mappings without human intervention.
 *
 * @param conflicts - Unresolved identity conflicts from parsing
 * @param strategy - The resolution strategy to apply
 * @param fuzzyThreshold - Minimum similarity score for fuzzy_threshold strategy (0-1, default 0.8)
 * @returns Array of identity mappings
 */
export function autoResolve(
	conflicts: IdentityConflict[],
	strategy: ResolutionStrategy,
	fuzzyThreshold: number = 0.8,
): IdentityMapping[] {
	const mappings: IdentityMapping[] = [];

	for (const conflict of conflicts) {
		const mapping = resolveConflict(conflict, strategy, fuzzyThreshold);
		if (mapping) {
			mappings.push(mapping);
		}
	}

	return mappings;
}

function resolveConflict(
	conflict: IdentityConflict,
	strategy: ResolutionStrategy,
	fuzzyThreshold: number,
): IdentityMapping | null {
	switch (strategy) {
		case 'exact_match_only': {
			// Only map if there's a suggestion with a perfect score (1.0)
			const exact = conflict.suggestions.find((s) => s.score === 1.0);
			if (exact) {
				return {
					type: conflict.type,
					parsedValue: conflict.parsedValue,
					action: 'map',
					mappedId: exact.id,
				};
			}
			// No exact match -- leave unresolved (job will fail unless combined with skip)
			return null;
		}

		case 'fuzzy_threshold': {
			// Map to the best suggestion if it meets the threshold
			const best = conflict.suggestions[0];
			if (best && best.score >= fuzzyThreshold) {
				return {
					type: conflict.type,
					parsedValue: conflict.parsedValue,
					action: 'map',
					mappedId: best.id,
				};
			}
			return null;
		}

		case 'create_missing': {
			// Create new entities for any unresolved conflicts
			return {
				type: conflict.type,
				parsedValue: conflict.parsedValue,
				action: 'create',
				newRecord: {
					name: conflict.parsedName ?? conflict.parsedValue,
					code: conflict.parsedValue,
				},
			};
		}

		case 'skip_unresolved': {
			// Skip any rows associated with unresolved entities
			return {
				type: conflict.type,
				parsedValue: conflict.parsedValue,
				action: 'skip',
			};
		}

		default:
			return null;
	}
}
