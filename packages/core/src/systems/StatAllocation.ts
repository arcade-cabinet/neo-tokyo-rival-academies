/**
 * Stat allocation system for character progression.
 * Players receive stat points per level to allocate to their stats.
 *
 * Platform-agnostic - no rendering dependencies.
 */

import type { CoreEntity, LevelProgress, RPGStats } from '../types/entity';

export type StatType = keyof RPGStats;

export interface StatAllocation {
  structure: number;
  ignition: number;
  logic: number;
  flow: number;
}

export interface AllocationResult {
  success: boolean;
  error?: string;
  entity?: CoreEntity;
  remainingPoints?: number;
}

/**
 * Role archetypes for stat recommendations.
 */
export type CharacterRole = 'tank' | 'melee_dps' | 'ranged_dps' | 'balanced';

/**
 * Stat points awarded per level.
 */
export const STAT_POINTS_PER_LEVEL = 3;

/**
 * Role-based stat weights for recommendations.
 */
const ROLE_WEIGHTS: Record<CharacterRole, Record<StatType, number>> = {
  tank: { structure: 0.5, ignition: 0.2, logic: 0.1, flow: 0.2 },
  melee_dps: { structure: 0.2, ignition: 0.5, logic: 0.1, flow: 0.2 },
  ranged_dps: { structure: 0.2, ignition: 0.1, logic: 0.5, flow: 0.2 },
  balanced: { structure: 0.25, ignition: 0.25, logic: 0.25, flow: 0.25 },
};

/**
 * Primary stat by role for remainder distribution.
 */
const PRIMARY_STAT_BY_ROLE: Record<CharacterRole, StatType> = {
  tank: 'structure',
  melee_dps: 'ignition',
  ranged_dps: 'logic',
  balanced: 'structure',
};

/**
 * Create a zero allocation.
 */
export function createEmptyAllocation(): StatAllocation {
  return { structure: 0, ignition: 0, logic: 0, flow: 0 };
}

/**
 * Calculate total points in an allocation.
 */
export function getTotalAllocationPoints(allocation: StatAllocation): number {
  return allocation.structure + allocation.ignition + allocation.logic + allocation.flow;
}

/**
 * Validate a stat allocation.
 */
export function validateAllocation(
  allocation: StatAllocation,
  availablePoints: number,
): { valid: boolean; error?: string } {
  const totalPoints = getTotalAllocationPoints(allocation);

  if (totalPoints > availablePoints) {
    return {
      valid: false,
      error: `Allocation exceeds available points (${totalPoints} > ${availablePoints})`,
    };
  }

  const hasNegative = Object.values(allocation).some((v) => v < 0);
  if (hasNegative) {
    return {
      valid: false,
      error: 'Cannot allocate negative stat points',
    };
  }

  return { valid: true };
}

/**
 * Apply stat allocation to an entity.
 * Returns a new entity with updated stats (immutable).
 */
export function applyStatAllocation(
  entity: CoreEntity,
  allocation: StatAllocation,
): AllocationResult {
  if (!entity.stats || !entity.level) {
    return {
      success: false,
      error: 'Entity does not have stats or level components',
    };
  }

  const validation = validateAllocation(allocation, entity.level.statPoints);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const totalPoints = getTotalAllocationPoints(allocation);

  const newStats: RPGStats = {
    structure: entity.stats.structure + allocation.structure,
    ignition: entity.stats.ignition + allocation.ignition,
    logic: entity.stats.logic + allocation.logic,
    flow: entity.stats.flow + allocation.flow,
  };

  const newLevel: LevelProgress = {
    ...entity.level,
    statPoints: entity.level.statPoints - totalPoints,
  };

  const updatedEntity: CoreEntity = {
    ...entity,
    stats: newStats,
    level: newLevel,
  };

  return {
    success: true,
    entity: updatedEntity,
    remainingPoints: newLevel.statPoints,
  };
}

/**
 * Get recommended stat allocation based on character role.
 */
export function getRecommendedAllocation(role: CharacterRole, points: number): StatAllocation {
  const weights = ROLE_WEIGHTS[role];

  const allocation: StatAllocation = {
    structure: Math.floor(points * weights.structure),
    ignition: Math.floor(points * weights.ignition),
    logic: Math.floor(points * weights.logic),
    flow: Math.floor(points * weights.flow),
  };

  // Distribute remainder to primary stat
  const total = getTotalAllocationPoints(allocation);
  const remainder = points - total;
  if (remainder > 0) {
    const primaryStat = PRIMARY_STAT_BY_ROLE[role];
    allocation[primaryStat] += remainder;
  }

  return allocation;
}

/**
 * Calculate points spent from base stats.
 */
export function calculatePointsSpent(currentStats: RPGStats, baseStats: RPGStats): number {
  return (
    currentStats.structure -
    baseStats.structure +
    (currentStats.ignition - baseStats.ignition) +
    (currentStats.logic - baseStats.logic) +
    (currentStats.flow - baseStats.flow)
  );
}

/**
 * Reset stat allocation (for respec functionality).
 * Returns updated entity and number of points refunded.
 */
export function resetStatAllocation(
  entity: CoreEntity,
  baseStats: RPGStats,
): { entity: CoreEntity; refundedPoints: number } {
  if (!entity.stats || !entity.level) {
    return { entity, refundedPoints: 0 };
  }

  const pointsSpent = calculatePointsSpent(entity.stats, baseStats);

  const updatedEntity: CoreEntity = {
    ...entity,
    stats: { ...baseStats },
    level: {
      ...entity.level,
      statPoints: entity.level.statPoints + pointsSpent,
    },
  };

  return { entity: updatedEntity, refundedPoints: pointsSpent };
}

/**
 * Get stat description for UI display.
 */
export function getStatDescription(stat: StatType): string {
  const descriptions: Record<StatType, string> = {
    structure: 'Max Health - Increases survivability',
    ignition: 'Attack Power - Increases physical damage',
    logic: 'Tech Power - Increases ability damage',
    flow: 'Agility - Increases speed and evasion',
  };
  return descriptions[stat];
}
