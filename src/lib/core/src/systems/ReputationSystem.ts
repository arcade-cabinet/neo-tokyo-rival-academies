/**
 * Reputation system for faction relationships.
 * Tracks player standing with the two main academies: Kurenai (Passion) and Azure (Logic).
 * Platform-agnostic - no rendering dependencies.
 *
 * @see docs/ALIGNMENT_SYSTEM.md
 */

import type { CoreEntity, Faction, ReputationState } from '../types/entity';

export type { Faction, ReputationState };

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
 */
export function applyReputationChange(
  reputation: ReputationState,
  change: ReputationChange
): ReputationState {
  const newValue = reputation[change.faction] + change.amount;
  const clampedValue = Math.max(0, Math.min(100, newValue));

  return {
    ...reputation,
    [change.faction]: clampedValue,
  };
}

/**
 * Reputation level thresholds (data-driven).
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
 */
const AGGRESSION_THRESHOLDS: readonly [number, number][] = [
  [25, 2.0],
  [40, 1.5],
  [60, 1.0],
  [75, 0.75],
];

/**
 * Calculate enemy aggression level based on reputation.
 */
export function getAggressionLevel(reputation: ReputationState, faction: Faction): number {
  const value = reputation[faction];

  for (const [threshold, aggression] of AGGRESSION_THRESHOLDS) {
    if (value <= threshold) {
      return aggression;
    }
  }

  return 0.5;
}

/**
 * Standard reputation changes for common actions.
 */
export const REPUTATION_CHANGES = {
  DEFEAT_ENEMY: -5,
  DEFEAT_BOSS: -15,
  COMPLETE_QUEST: 10,
  HELP_CIVILIAN: 5,
  BETRAY_FACTION: -25,
  SPARE_ENEMY: 3,
  DESTROY_PROPERTY: -10,
} as const;

/**
 * Apply reputation change to an entity.
 */
export function applyReputationToEntity(entity: CoreEntity, change: ReputationChange): CoreEntity {
  const currentReputation = entity.reputation ?? initializeReputation();
  return {
    ...entity,
    reputation: applyReputationChange(currentReputation, change),
  };
}

/**
 * Get all factions where reputation meets a threshold.
 */
export function getFactionsAboveThreshold(
  reputation: ReputationState,
  threshold: number
): Faction[] {
  return (Object.entries(reputation) as [Faction, number][])
    .filter(([, value]) => value >= threshold)
    .map(([faction]) => faction);
}

/**
 * Get reputation summary for display.
 */
export function getReputationSummary(reputation: ReputationState): Record<Faction, string> {
  return {
    Kurenai: `${getReputationLevel(reputation.Kurenai)} (${reputation.Kurenai})`,
    Azure: `${getReputationLevel(reputation.Azure)} (${reputation.Azure})`,
  };
}
