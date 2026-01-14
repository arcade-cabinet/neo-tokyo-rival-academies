import type { ECSEntity } from '../state/ecs';

/**
 * Calculates damage based on stats.
 *
 * Formula:
 * Damage = Attack - (Defense / 2)
 *
 * Attack is based on 'Ignition' stat.
 * Defense is based on 'Structure' stat (conceptually).
 *
 * Crit Chance = Ignition / 2 %
 */
export const resolveCombat = (attacker: ECSEntity, defender: ECSEntity) => {
  // Default stats if missing
  const atk = attacker.stats?.ignition ?? 10;
  const def = defender.stats?.structure ?? 10;

  let damage = Math.max(1, Math.floor(atk - def / 2));

  // Critical Hit Logic (1% per Ignition point, max 50%)
  const critChance = Math.min(atk * 0.01, 0.5);
  const isCritical = Math.random() < critChance;

  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  return { damage, isCritical };
};
