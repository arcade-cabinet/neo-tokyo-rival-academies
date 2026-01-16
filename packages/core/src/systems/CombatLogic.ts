/**
 * Combat damage calculation system.
 * Platform-agnostic - no rendering dependencies.
 *
 * Base Formula:
 * Damage = (Attacker.AttackPower * StatMultiplier) - (Defender.Defense / 2)
 *
 * StatMultiplier:
 * - Ignition for melee attacks
 * - Logic for ranged/tech attacks
 *
 * Critical Hit Multiplier: 2.0x damage
 */

import type { CoreEntity, RPGStats } from '../types/entity';

export type AttackType = 'melee' | 'ranged' | 'tech';

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  attackType: AttackType;
}

export interface DamageModifiers {
  /** Multiplier for all damage (default 1.0) */
  damageMultiplier?: number;
  /** Additional flat damage */
  flatBonus?: number;
  /** Override critical chance (0-1) */
  critChanceOverride?: number;
  /** Is the defender in "broken" state? */
  isDefenderBroken?: boolean;
}

/**
 * Default RPG stats for entities without stats component.
 */
const DEFAULT_STAT_VALUE = 10;

/**
 * Get a stat value safely, defaulting if missing.
 */
function getStat(stats: RPGStats | undefined, stat: keyof RPGStats): number {
  return stats?.[stat] ?? DEFAULT_STAT_VALUE;
}

/**
 * Get attack power for an entity.
 * Base attack power is 10, modified by relevant stat.
 */
function getAttackPower(entity: CoreEntity, attackType: AttackType): number {
  const baseAttack = 10;

  if (attackType === 'melee') {
    const ignition = getStat(entity.stats, 'ignition');
    return baseAttack + ignition * 0.5;
  }

  // Ranged and tech use Logic stat
  const logic = getStat(entity.stats, 'logic');
  return baseAttack + logic * 0.5;
}

/**
 * Get stat multiplier based on attack type.
 * - Melee: Ignition stat
 * - Ranged/Tech: Logic stat
 */
function getStatMultiplier(entity: CoreEntity, attackType: AttackType): number {
  if (attackType === 'melee') {
    return getStat(entity.stats, 'ignition') / 10;
  }
  // Ranged and tech use Logic stat
  return getStat(entity.stats, 'logic') / 10;
}

/**
 * Get defense value for an entity.
 * Defense is based on Structure stat.
 */
function getDefense(entity: CoreEntity): number {
  const structure = getStat(entity.stats, 'structure');
  return structure / 2;
}

/**
 * Calculate critical hit chance based on Ignition stat.
 * 1% per Ignition point, capped at 50%.
 */
export function calculateCritChance(entity: CoreEntity): number {
  const ignition = getStat(entity.stats, 'ignition');
  return Math.min(ignition * 0.01, 0.5);
}

/**
 * Calculate damage for an attack.
 *
 * @param attacker - The attacking entity
 * @param defender - The defending entity
 * @param attackType - Type of attack (melee, ranged, tech)
 * @param modifiers - Optional damage modifiers
 * @param rng - Random number generator for critical hits (default Math.random)
 * @returns Combat result with damage and critical hit status
 */
export function calculateDamage(
  attacker: CoreEntity,
  defender: CoreEntity,
  attackType: AttackType = 'melee',
  modifiers: DamageModifiers = {},
  rng: () => number = Math.random,
): CombatResult {
  const attackPower = getAttackPower(attacker, attackType);
  const statMultiplier = getStatMultiplier(attacker, attackType);
  const defense = getDefense(defender);

  // Base damage formula
  let baseDamage = attackPower * statMultiplier - defense / 2;

  // Apply damage multiplier
  const damageMultiplier = modifiers.damageMultiplier ?? 1.0;
  baseDamage *= damageMultiplier;

  // Add flat bonus
  const flatBonus = modifiers.flatBonus ?? 0;
  baseDamage += flatBonus;

  // Ensure damage is non-negative
  let damage = Math.max(0, Math.floor(baseDamage));

  // Critical hit logic
  const critChance = modifiers.critChanceOverride ?? calculateCritChance(attacker);
  const isCritical = rng() < critChance;

  if (isCritical) {
    damage = Math.floor(damage * 2.0);
  }

  // Broken state: guaranteed critical and bonus damage
  if (modifiers.isDefenderBroken) {
    damage = Math.floor(damage * (isCritical ? 1.0 : 2.0)); // If already crit, no double-dip
  }

  return { damage, isCritical, attackType };
}

/**
 * Apply damage to an entity, respecting health bounds.
 * Returns updated entity (immutable).
 */
export function applyDamage(entity: CoreEntity, damage: number): CoreEntity {
  const currentHealth = entity.health ?? 0;
  const newHealth = Math.max(0, currentHealth - damage);

  return {
    ...entity,
    health: newHealth,
    characterState: newHealth === 0 ? 'dead' : entity.characterState,
  };
}

/**
 * Apply healing to an entity, respecting max health.
 * Returns updated entity (immutable).
 */
export function applyHealing(entity: CoreEntity, amount: number): CoreEntity {
  const currentHealth = entity.health ?? 0;
  const maxHealth = entity.maxHealth ?? 100;
  const newHealth = Math.min(maxHealth, currentHealth + amount);

  return {
    ...entity,
    health: newHealth,
  };
}

/**
 * Check if an entity is alive.
 */
export function isAlive(entity: CoreEntity): boolean {
  return (entity.health ?? 0) > 0;
}

/**
 * Legacy combat resolution function for backward compatibility.
 * Uses melee attack type.
 */
export function resolveCombat(
  attacker: CoreEntity,
  defender: CoreEntity,
  rng: () => number = Math.random,
): { damage: number; isCritical: boolean } {
  const result = calculateDamage(attacker, defender, 'melee', {}, rng);
  return { damage: result.damage, isCritical: result.isCritical };
}

/**
 * Calculate effective DPS (damage per second) for an entity.
 * Useful for balancing and UI display.
 */
export function calculateEffectiveDPS(
  entity: CoreEntity,
  attackType: AttackType,
  attacksPerSecond: number,
): number {
  // Simulate 1000 attacks to get average damage
  const iterations = 1000;
  let totalDamage = 0;

  const dummyDefender: CoreEntity = {
    id: 'dummy',
    stats: { structure: 10, ignition: 10, logic: 10, flow: 10 },
  };

  // Use seeded random for consistency
  let seed = 12345;
  const seededRng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < iterations; i++) {
    const result = calculateDamage(entity, dummyDefender, attackType, {}, seededRng);
    totalDamage += result.damage;
  }

  const avgDamage = totalDamage / iterations;
  return avgDamage * attacksPerSecond;
}
