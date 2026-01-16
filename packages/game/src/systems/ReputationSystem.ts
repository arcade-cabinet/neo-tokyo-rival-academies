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
  // Previous -100 to 100 was for Alignment (-1.0 to 1.0)
  const clampedValue = Math.max(0, Math.min(100, newValue));

  return {
    ...reputation,
    [change.faction]: clampedValue,
  };
}

/**
 * Get reputation level based on numeric value (0-100).
 *
 * @param value - Reputation value (0 to 100)
 * @returns Reputation level
 */
export function getReputationLevel(value: number): ReputationLevel {
  if (value <= 10) return 'Hated';
  if (value <= 25) return 'Hostile';
  if (value <= 40) return 'Unfriendly';
  if (value <= 60) return 'Neutral';
  if (value <= 75) return 'Friendly';
  if (value <= 90) return 'Honored';
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
 * Get dialogue options based on reputation.
 *
 * @param reputation - Current reputation state
 * @param faction - The faction being interacted with
 * @returns Available dialogue options
 */
export function getDialogueOptions(
  reputation: ReputationState,
  faction: Faction
): string[] {
  const value = reputation[faction];
  const level = getReputationLevel(value);

  const baseOptions = ['Talk', 'Leave'];

  if (level === 'Hated' || level === 'Hostile') {
    return [...baseOptions, 'Threaten'];
  }

  if (level === 'Friendly' || level === 'Honored' || level === 'Revered') {
    return [...baseOptions, 'Ask for Help', 'Trade'];
  }

  return baseOptions;
}

/**
 * Calculate enemy aggression level based on reputation.
 *
 * @param reputation - Current reputation state
 * @param faction - The enemy's faction
 * @returns Aggression multiplier (0.5 to 2.0)
 */
export function getAggressionLevel(reputation: ReputationState, faction: Faction): number {
  const value = reputation[faction];

  // Hated/Hostile: 2.0x aggression
  if (value <= 25) return 2.0;

  // Unfriendly: 1.5x aggression
  if (value <= 40) return 1.5;

  // Neutral: 1.0x aggression
  if (value <= 60) return 1.0;

  // Friendly: 0.75x aggression
  if (value <= 75) return 0.75;

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
 *
 * @param entity - The entity (usually player) to apply change to
 * @param change - The reputation change
 */
export function applyReputationToEntity(
  entity: ECSEntity,
  change: ReputationChange
): void {
  if (!entity.reputation) {
    entity.reputation = initializeReputation();
  }

  entity.reputation = applyReputationChange(entity.reputation, change);
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
  const factions: Faction[] = [];

  for (const [faction, value] of Object.entries(reputation)) {
    if (value >= threshold) {
      factions.push(faction as Faction);
    }
  }

  return factions;
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