import type { ECSEntity } from '@/state/ecs';
import abilitiesData from '../data/abilities.json';

export interface Ability {
  /** Unique ability ID */
  id: string;
  /** Display name */
  name: string;
  /** Description of the ability */
  description: string;
  /** Cost to use (energy, mana, etc.) */
  cost: number;
  /** Cooldown duration in milliseconds */
  cooldown: number;
  /** Effect type */
  effectType: 'damage' | 'buff' | 'debuff' | 'heal' | 'utility';
  /** Effect value (damage amount, heal amount, etc.) */
  effectValue: number;
  /** Additional properties */
  properties?: Record<string, unknown>;
}

export interface AbilityCooldownState {
  /** Ability ID */
  abilityId: string;
  /** Timestamp when cooldown ends */
  endsAt: number;
}

export interface AbilityExecutionResult {
  /** Whether the ability was successfully executed */
  success: boolean;
  /** Reason for failure (if any) */
  failureReason?: string;
  /** Effect applied */
  effect?: {
    type: Ability['effectType'];
    value: number;
    target: ECSEntity;
  };
}

// Module-scoped ability database
const abilityDatabase: Record<string, Ability[]> = abilitiesData as Record<string, Ability[]>;

/**
 * Get abilities available to a character.
 *
 * @param characterId - The character ID (e.g. 'kai', 'vera')
 * @returns Array of abilities
 */
export function getCharacterAbilities(characterId: string): Ability[] {
  return abilityDatabase[characterId] || [];
}

/**
 * Check if an ability is currently on cooldown.
 *
 * @param cooldownState - The cooldown state for the ability
 * @returns True if on cooldown
 */
export function isOnCooldown(cooldownState?: AbilityCooldownState): boolean {
  if (!cooldownState) return false;
  return Date.now() < cooldownState.endsAt;
}

/**
 * Apply cooldown to an ability.
 *
 * @param ability - The ability used
 * @returns New cooldown state
 */
export function applyCooldown(ability: Ability): AbilityCooldownState {
  return {
    abilityId: ability.id,
    endsAt: Date.now() + ability.cooldown,
  };
}

/**
 * Execute an ability.
 *
 * @param caster - The entity casting the ability
 * @param target - The target entity
 * @param ability - The ability to execute
 * @param cooldowns - Current cooldowns for the caster
 * @returns Result of execution
 */
export function executeAbility(
  caster: ECSEntity,
  target: ECSEntity,
  ability: Ability,
  cooldowns: AbilityCooldownState[]
): AbilityExecutionResult {
  // Check if ability is on cooldown
  const cooldownState = cooldowns.find((cd) => cd.abilityId === ability.id);
  if (isOnCooldown(cooldownState)) {
    return {
      success: false,
      failureReason: 'Ability is on cooldown',
    };
  }

  // Check resource cost
  if (ability.cost > 0) {
    if ((caster.mana ?? 0) < ability.cost) {
      return {
        success: false,
        failureReason: 'Insufficient mana',
      };
    }
    // Deduct cost
    caster.mana = (caster.mana ?? 0) - ability.cost;
  }

  // Apply ability effect
  let effect: { type: Ability['effectType']; value: number; target: ECSEntity } | undefined;

  switch (ability.effectType) {
    case 'damage':
      if (target.health !== undefined) {
        target.health = Math.max(0, target.health - ability.effectValue);
        effect = { type: 'damage', value: ability.effectValue, target };
      }
      break;

    case 'heal':
      if (target.health !== undefined && target.stats?.structure !== undefined) {
        const maxHealth = target.stats.structure;
        target.health = Math.min(maxHealth, target.health + ability.effectValue);
        effect = { type: 'heal', value: ability.effectValue, target };
      }
      break;

    case 'buff':
    case 'debuff':
    case 'utility':
      // These would be implemented with a buff/debuff system
      // For now, just mark as successful and return the effect for visualization
      effect = { type: ability.effectType, value: ability.effectValue, target };
      break;
  }

  if (!effect) {
    return {
      success: false,
      failureReason: 'Invalid target for ability',
    };
  }

  return {
    success: true,
    effect,
  };
}
