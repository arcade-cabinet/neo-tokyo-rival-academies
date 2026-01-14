import type { ECSEntity } from '../state/ecs';

export function resolveCombat(
  attacker: ECSEntity,
  defender: ECSEntity
): { damage: number; isCritical: boolean } {
  // Base stats or defaults (use nullish coalescing to allow 0 values)
  const atk = attacker.stats?.ignition ?? 10;
  // Defense is derived from Structure (10% of Max HP/Structure)
  const def = (defender.stats?.structure ?? 10) * 0.1;

  let damage = Math.max(1, atk - def);
  let isCritical = false;

  // Critical hit chance: 1% per Ignition point, capped at 50%
  const critChance = Math.min(atk * 0.01, 0.5);
  if (Math.random() < critChance) {
    damage *= 1.5;
    isCritical = true;
  }

  return { damage: Math.floor(damage), isCritical };
}
