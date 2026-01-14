import type { ECSEntity } from '../state/ecs';

/**
 * Resolve combat between an attacker and a defender, producing final damage and whether it was critical.
 *
 * Uses the attacker's `stats?.ignition` (defaults to 10) as attack power and the defender's `stats?.structure`
 * (defaults to 10) to derive defense as `structure * 0.1`. Damage is computed as `max(1, atk - def)`.
 * A critical hit occurs with probability `atk * 0.01`; on critical the damage is multiplied by 1.5.
 *
 * @param attacker - Entity performing the attack; its `stats.ignition` determines attack power (defaults to 10)
 * @param defender - Entity receiving the attack; its `stats.structure` determines defense (defaults to 10)
 * @returns The final damage (floored to an integer) and `isCritical` indicating if a critical hit occurred
 */
export function resolveCombat(
  attacker: ECSEntity,
  defender: ECSEntity
): { damage: number; isCritical: boolean } {
  // Base stats or defaults
  const atk = attacker.stats?.ignition || 10;
  // Defense is derived from Structure (10% of Max HP/Structure)
  const def = (defender.stats?.structure || 10) * 0.1;

  let damage = Math.max(1, atk - def);
  let isCritical = false;

  // Critical hit chance: 1% per point of Ignition over 10? Or just flat % based on Ignition?
  // Let's say 1% per Ignition point.
  if (Math.random() < atk * 0.01) {
    damage *= 1.5;
    isCritical = true;
  }

  return { damage: Math.floor(damage), isCritical };
}