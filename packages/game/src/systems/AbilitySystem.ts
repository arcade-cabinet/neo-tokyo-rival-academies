import type { ECSEntity } from '../state/ecs';

/**
 * Ability system for combat.
 * Manages character abilities with cooldowns and effects.
 */

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
    type: string;
    value: number;
    target: ECSEntity;
  };
}

/**
 * Check if an ability is on cooldown.
 *
 * @param cooldownState - The cooldown state for the ability
 * @returns True if the ability is on cooldown
 */
export function isOnCooldown(cooldownState: AbilityCooldownState | undefined): boolean {
  if (!cooldownState) return false;

  const now = Date.now();
  return now < cooldownState.endsAt;
}

/**
 * Get remaining cooldown time in milliseconds.
 *
 * @param cooldownState - The cooldown state for the ability
 * @returns Remaining cooldown time in milliseconds, or 0 if not on cooldown
 */
export function getRemainingCooldown(cooldownState: AbilityCooldownState | undefined): number {
  if (!cooldownState) return 0;

  const now = Date.now();
  const remaining = cooldownState.endsAt - now;
  return Math.max(0, remaining);
}

/**
 * Apply cooldown to an ability.
 *
 * @param ability - The ability to apply cooldown to
 * @returns Cooldown state
 */
export function applyCooldown(ability: Ability): AbilityCooldownState {
  const now = Date.now();
  return {
    abilityId: ability.id,
    endsAt: now + ability.cooldown,
  };
}

/**
 * Update cooldown states, removing expired cooldowns.
 *
 * @param cooldowns - Array of cooldown states
 * @returns Updated array with expired cooldowns removed
 */
export function updateCooldowns(
  cooldowns: AbilityCooldownState[]
): AbilityCooldownState[] {
  const now = Date.now();
  return cooldowns.filter((cooldown) => now < cooldown.endsAt);
}

/**
 * Execute an ability.
 *
 * @param caster - The entity casting the ability
 * @param target - The target entity
 * @param ability - The ability to execute
 * @param cooldowns - Current cooldown states
 * @returns Execution result
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

  // Check if caster has enough resources (simplified - just check if cost is affordable)
  // In a full implementation, this would check energy/mana/etc.
  if (ability.cost > 0) {
    // For now, assume abilities can always be cast
    // TODO: Implement resource system
  }

  // Apply ability effect
  let effect: { type: string; value: number; target: ECSEntity } | undefined;

  switch (ability.effectType) {
    case 'damage':
      if (target.health !== undefined) {
        target.health = Math.max(0, target.health - ability.effectValue);
        effect = { type: 'damage', value: ability.effectValue, target };
      }
      break;

    case 'heal':
      if (target.health !== undefined && target.stats?.structure) {
        const maxHealth = target.stats.structure;
        target.health = Math.min(maxHealth, target.health + ability.effectValue);
        effect = { type: 'heal', value: ability.effectValue, target };
      }
      break;

    case 'buff':
    case 'debuff':
    case 'utility':
      // These would be implemented with a buff/debuff system
      // For now, just mark as successful
      effect = { type: ability.effectType, value: ability.effectValue, target };
      break;
  }

  return {
    success: true,
    effect,
  };
}

/**
 * Get all abilities for a character.
 * This would typically load from a data file or database.
 *
 * @param characterId - The character ID
 * @returns Array of abilities
 */
export function getCharacterAbilities(characterId: string): Ability[] {
  // This is a placeholder - in a full implementation, this would load from data files
  const abilityDatabase: Record<string, Ability[]> = {
    kai: [
      {
        id: 'kai_lightning_strike',
        name: 'Lightning Strike',
        description: 'A powerful melee attack that deals high damage and breaks stability',
        cost: 20,
        cooldown: 5000, // 5 seconds
        effectType: 'damage',
        effectValue: 50,
        properties: {
          stabilityDamage: 100,
        },
      },
    ],
    vera: [
      {
        id: 'vera_tech_barrier',
        name: 'Tech Barrier',
        description: 'Creates a temporary barrier that grants invincibility',
        cost: 30,
        cooldown: 10000, // 10 seconds
        effectType: 'buff',
        effectValue: 3000, // 3 seconds of invincibility
        properties: {
          invincibilityDuration: 3000,
        },
      },
    ],
  };

  return abilityDatabase[characterId] || [];
}
