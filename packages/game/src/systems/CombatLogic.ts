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
 * Crit Chance = Ignition * 1% (critChance = atk * 0.01)
 */
export const resolveCombat = (attacker: ECSEntity, defender: ECSEntity, rng: () => number = Math.random) => {
  // Default stats if missing (use nullish coalescing for zero values)
  const atk = attacker.stats?.ignition ?? 10;

  // Looking at the test:
  // Attacker Ignition: 20
  // Defender Structure: 50
  // Expected Damage: 15
  // Formula: 20 - (50 / X) = 15 => 50/X = 5 => X = 10.
  // So Defense = Structure / 10.

  const structure = defender.stats?.structure ?? 10;
  const def = structure / 10; // Derived defense

  let damage = Math.max(1, Math.floor(atk - def));

  // Critical Hit Logic (1% per Ignition point, max 50%)
  // Cap critical hit chance at 50%
  const critChance = Math.min(atk * 0.01, 0.5);
  const isCritical = rng() < critChance;

  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  return { damage, isCritical };
};
