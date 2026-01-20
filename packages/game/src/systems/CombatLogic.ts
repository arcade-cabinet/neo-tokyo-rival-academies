import type { ECSEntity } from '../state/ecs';

/**
 * Combat damage calculation system.
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

export type AttackType = 'melee' | 'ranged' | 'tech';

export interface CombatResult {
  damage: number;
  isCritical: boolean;
  attackType: AttackType;
}

/**
 * Calculate damage for an attack.
 *
 * @param attacker - The attacking entity
 * @param defender - The defending entity
 * @param attackType - Type of attack (melee, ranged, tech)
 * @param rng - Random number generator for critical hits
 * @returns Combat result with damage and critical hit status
 */
export const calculateDamage = (
  attacker: ECSEntity,
  defender: ECSEntity,
  attackType: AttackType = 'melee',
  rng: () => number = Math.random
): CombatResult => {
  // Get attacker's attack power based on attack type
  const attackPower = attacker.stats?.ignition ?? 10;

  // Get defender's defense
  const defense = getDefense(defender);

  // Calculate base damage: AttackPower - Defense
  const baseDamage = attackPower - defense;

  // Ensure damage is non-negative
  let damage = Math.max(1, Math.floor(baseDamage));

  // Critical hit logic (1% per Ignition point, max 50%)
  const critChance = Math.min((attacker.stats?.ignition ?? 10) * 0.01, 0.5);
  const isCritical = rng() < critChance;

  if (isCritical) {
    damage = Math.floor(damage * 1.5); // 1.5x multiplier for critical hits
  }

  return { damage, isCritical, attackType };
};

/**
 * Get attack power for an entity.
 * Base attack power is 10, modified by Ignition stat.
 */
function getAttackPower(entity: ECSEntity, attackType: AttackType): number {
  const baseAttack = 10;

  if (attackType === 'melee') {
    const ignition = entity.stats?.ignition ?? 10;
    return baseAttack + ignition * 0.5;
  }

  // Ranged and tech use Logic stat
  const logic = entity.stats?.logic ?? 10;
  return baseAttack + logic * 0.5;
}

/**
 * Get stat multiplier based on attack type.
 * - Melee: Ignition stat
 * - Ranged/Tech: Logic stat
 */
function getStatMultiplier(entity: ECSEntity, attackType: AttackType): number {
  if (attackType === 'melee') {
    return (entity.stats?.ignition ?? 10) / 10;
  }
  // Ranged and tech use Logic stat
  return (entity.stats?.logic ?? 10) / 10;
}

/**
 * Get defense value for an entity.
 * Defense is based on Structure stat.
 */
function getDefense(entity: ECSEntity): number {
  const structure = entity.stats?.structure ?? 10;
  return structure / 10; // Defense = Structure / 10
}

/**
 * Legacy combat resolution function for backward compatibility.
 * Uses melee attack type.
 */
export const resolveCombat = (
  attacker: ECSEntity,
  defender: ECSEntity,
  rng: () => number = Math.random
): { damage: number; isCritical: boolean } => {
  const result = calculateDamage(attacker, defender, 'melee', rng);
  console.log({
    attackPower: getAttackPower(attacker, 'melee'),
    statMultiplier: getStatMultiplier(attacker, 'melee'),
    defense: getDefense(defender),
    damage: result.damage,
    isCritical: result.isCritical,
  });
  return { damage: result.damage, isCritical: result.isCritical };
};
