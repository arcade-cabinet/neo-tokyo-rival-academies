import type { ECSEntity } from '@/state/ecs';

/**
 * Reputation system for faction relationships.
 * Tracks player standing with the two main academies: Kurenai (Passion) and Azure (Logic).
 * Aligns with docs/ALIGNMENT_SYSTEM.md.
 */

export type Faction = 'Kurenai' | 'Azure';

export interface ReputationState {
  Kurenai: number;
  Azure: number;
}

export interface ReputationChange {
  faction: Faction;
  amount: number;
  reason: string;
}

export type ReputationLevel =
  | 'Hated'
  | 'Hostile'
  | 'Unfriendly'
  | 'Neutral'
  | 'Friendly'
  | 'Honored'
  | 'Revered';

/**
 * Initialize reputation state with neutral standing.
 */
export function initializeReputation(): ReputationState {
  return {
    Kurenai: 50,
    Azure: 50,
  };
}

/**
 * Apply a reputation change, clamping to [0, 100] range.
 * Note: Golden Record specifies 0-100 for Reputation meters.
 *
 * @param reputation - Current reputation state
 * @param change - The reputation change to apply
 * @returns Updated reputation state
 */
export function applyReputationChange(
  reputation: ReputationState,
  change: ReputationChange
): ReputationState {
  const newValue = reputation[change.faction] + change.amount;
  // Clamping to 0-100 as per Golden Record (Reputation Meter)
  const clampedValue = Math.max(0, Math.min(100, newValue));

  return {
    ...reputation,
    [change.faction]: clampedValue,
  };
}

/**
 * Reputation level thresholds (data-driven).
 * Each entry is [level, maxThreshold] - value <= threshold returns the level.
 */
const REPUTATION_LEVEL_THRESHOLDS: readonly [ReputationLevel, number][] = [
  ['Hated', 10],
  ['Hostile', 25],
  ['Unfriendly', 40],
  ['Neutral', 60],
  ['Friendly', 75],
  ['Honored', 90],
];

/**
 * Get reputation level based on numeric value (0-100).
 *
 * @param value - Reputation value (0 to 100)
 * @returns Reputation level
 */
export function getReputationLevel(value: number): ReputationLevel {
  for (const [level, threshold] of REPUTATION_LEVEL_THRESHOLDS) {
    if (value <= threshold) {
      return level;
    }
  }
  return 'Revered';
}

/**
 * Check if a quest is unlocked based on reputation.
 *
 * @param reputation - Current reputation state
 * @param requirements - Reputation requirements for the quest
 * @returns True if the quest is unlocked
 */
export function isQuestUnlocked(
  reputation: ReputationState,
  requirements: Partial<Record<Faction, number>>
): boolean {
  for (const [faction, requiredValue] of Object.entries(requirements)) {
    const currentValue = reputation[faction as Faction];
    if (currentValue < requiredValue) {
      return false;
    }
  }
  return true;
}

/**
 * Extra dialogue options by reputation level (data-driven).
 */
const DIALOGUE_OPTIONS_BY_LEVEL: Partial<Record<ReputationLevel, string[]>> = {
  Hated: ['Threaten'],
  Hostile: ['Threaten'],
  Friendly: ['Ask for Help', 'Trade'],
  Honored: ['Ask for Help', 'Trade'],
  Revered: ['Ask for Help', 'Trade'],
};

/**
 * Get dialogue options based on reputation.
 *
 * @param reputation - Current reputation state
 * @param faction - The faction being interacted with
 * @returns Available dialogue options
 */
export function getDialogueOptions(reputation: ReputationState, faction: Faction): string[] {
  const value = reputation[faction];
  const level = getReputationLevel(value);

  const baseOptions = ['Talk', 'Leave'];
  const extraOptions = DIALOGUE_OPTIONS_BY_LEVEL[level] ?? [];

  return [...baseOptions, ...extraOptions];
}

/**
 * Aggression thresholds (data-driven).
 * Each entry is [reputationThreshold, aggressionMultiplier].
 */
const AGGRESSION_THRESHOLDS: readonly [number, number][] = [
  [25, 2.0], // Hated/Hostile
  [40, 1.5], // Unfriendly
  [60, 1.0], // Neutral
  [75, 0.75], // Friendly
];

/**
 * Calculate enemy aggression level based on reputation.
 *
 * @param reputation - Current reputation state
 * @param faction - The enemy's faction
 * @returns Aggression multiplier (0.5 to 2.0)
 */
export function getAggressionLevel(reputation: ReputationState, faction: Faction): number {
  const value = reputation[faction];

  for (const [threshold, aggression] of AGGRESSION_THRESHOLDS) {
    if (value <= threshold) {
      return aggression;
    }
  }

  // Honored/Revered: 0.5x aggression
  return 0.5;
}

/**
 * Get reputation changes for common actions.
 */
export const REPUTATION_CHANGES = {
  DEFEAT_ENEMY: -5,
  DEFEAT_BOSS: -15,
  COMPLETE_QUEST: 10,
  HELP_CIVILIAN: 5,
  BETRAY_FACTION: -25,
  SPARE_ENEMY: 3,
  DESTROY_PROPERTY: -10,
};

/**
 * Apply reputation change to an entity.
 * Updates the entity in place and returns it.
 *
 * @param entity - The entity (usually player) to apply change to
 * @param change - The reputation change
 * @returns The updated entity
 */
export function applyReputationToEntity(entity: ECSEntity, change: ReputationChange): ECSEntity {
  const currentReputation = entity.reputation || initializeReputation();
  entity.reputation = applyReputationChange(currentReputation, change);
  return entity;
}

/**
 * Get all factions where reputation meets a threshold.
 *
 * @param reputation - Current reputation state
 * @param threshold - Minimum reputation value
 * @returns Array of factions meeting the threshold
 */
export function getFactionsAboveThreshold(
  reputation: ReputationState,
  threshold: number
): Faction[] {
  return (Object.entries(reputation) as [Faction, number][])
    .filter(([_, value]) => value >= threshold)
    .map(([faction]) => faction);
}

/**
 * Get reputation summary for display.
 *
 * @param reputation - Current reputation state
 * @returns Formatted reputation summary
 */
export function getReputationSummary(reputation: ReputationState): Record<Faction, string> {
  return {
    Kurenai: `${getReputationLevel(reputation.Kurenai)} (${reputation.Kurenai})`,
    Azure: `${getReputationLevel(reputation.Azure)} (${reputation.Azure})`,
  };
}
