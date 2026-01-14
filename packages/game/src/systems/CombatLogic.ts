import type { ECSEntity } from '../state/ecs';

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
