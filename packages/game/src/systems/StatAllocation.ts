import type { ECSEntity, RPGStats } from "@/state/ecs";

/**
 * Stat allocation system for character progression.
 * Players receive 3 stat points per level to allocate to their stats.
 */

export type StatType = "structure" | "ignition" | "logic" | "flow";

export interface StatAllocation {
	structure: number;
	ignition: number;
	logic: number;
	flow: number;
}

export interface AllocationResult {
	success: boolean;
	error?: string;
	newStats?: RPGStats;
	remainingPoints?: number;
}

/**
 * Validate a stat allocation.
 *
 * @param allocation - The proposed stat allocation
 * @param availablePoints - Number of stat points available
 * @returns True if the allocation is valid
 */
export function validateAllocation(
	allocation: StatAllocation,
	availablePoints: number,
): { valid: boolean; error?: string } {
	// Calculate total points being allocated
	const totalPoints =
		allocation.structure +
		allocation.ignition +
		allocation.logic +
		allocation.flow;

	// Check if allocation exceeds available points
	if (totalPoints > availablePoints) {
		return {
			valid: false,
			error: `Allocation exceeds available points (${totalPoints} > ${availablePoints})`,
		};
	}

	// Check for negative allocations
	if (
		allocation.structure < 0 ||
		allocation.ignition < 0 ||
		allocation.logic < 0 ||
		allocation.flow < 0
	) {
		return {
			valid: false,
			error: "Cannot allocate negative stat points",
		};
	}

	return { valid: true };
}

/**
 * Apply stat allocation to an entity.
 *
 * @param entity - The entity to apply allocation to
 * @param allocation - The stat allocation to apply
 * @returns Result of the allocation
 */
export function applyStatAllocation(
	entity: ECSEntity,
	allocation: StatAllocation,
): AllocationResult {
	if (!entity.stats || !entity.level) {
		return {
			success: false,
			error: "Entity does not have stats or level components",
		};
	}

	// Validate allocation
	const validation = validateAllocation(allocation, entity.level.statPoints);
	if (!validation.valid) {
		return {
			success: false,
			error: validation.error,
		};
	}

	// Calculate total points being allocated
	const totalPoints =
		allocation.structure +
		allocation.ignition +
		allocation.logic +
		allocation.flow;

	// Apply stat increases
	const newStats: RPGStats = {
		structure: entity.stats.structure + allocation.structure,
		ignition: entity.stats.ignition + allocation.ignition,
		logic: entity.stats.logic + allocation.logic,
		flow: entity.stats.flow + allocation.flow,
	};

	// Update entity stats
	entity.stats = newStats;

	// Deduct stat points
	entity.level.statPoints -= totalPoints;

	return {
		success: true,
		newStats,
		remainingPoints: entity.level.statPoints,
	};
}

/**
 * Get recommended stat allocation based on character role.
 *
 * @param role - The character's role (tank, dps, support, etc.)
 * @param points - Number of points to allocate
 * @returns Recommended allocation
 */
export function getRecommendedAllocation(
	role: "tank" | "melee_dps" | "ranged_dps" | "balanced",
	points: number,
): StatAllocation {
	const weights: Record<typeof role, [number, number, number, number]> = {
		tank: [0.5, 0.2, 0.1, 0.2],
		melee_dps: [0.2, 0.5, 0.1, 0.2],
		ranged_dps: [0.2, 0.1, 0.5, 0.2],
		balanced: [0.25, 0.25, 0.25, 0.25],
	};

	const [sW, iW, lW, fW] = weights[role];
	const allocation: StatAllocation = {
		structure: Math.floor(points * sW),
		ignition: Math.floor(points * iW),
		logic: Math.floor(points * lW),
		flow: Math.floor(points * fW),
	};

	// Distribute remainder to primary stat for the role
	const total =
		allocation.structure +
		allocation.ignition +
		allocation.logic +
		allocation.flow;
	const remainder = points - total;
	if (remainder > 0) {
		const primaryStat: keyof StatAllocation =
			role === "tank"
				? "structure"
				: role === "melee_dps"
					? "ignition"
					: role === "ranged_dps"
						? "logic"
						: "structure";
		allocation[primaryStat] += remainder;
	}

	return allocation;
}

/**
 * Reset stat allocation (for respec functionality).
 *
 * @param entity - The entity to reset stats for
 * @param baseStats - The base stats to reset to
 * @returns Number of stat points refunded
 */
export function resetStatAllocation(
	entity: ECSEntity,
	baseStats: RPGStats,
): number {
	if (!entity.stats || !entity.level) {
		return 0;
	}

	// Calculate total points spent
	const pointsSpent =
		entity.stats.structure -
		baseStats.structure +
		(entity.stats.ignition - baseStats.ignition) +
		(entity.stats.logic - baseStats.logic) +
		(entity.stats.flow - baseStats.flow);

	// Reset stats to base
	entity.stats = { ...baseStats };

	// Refund points
	entity.level.statPoints += pointsSpent;

	return pointsSpent;
}
