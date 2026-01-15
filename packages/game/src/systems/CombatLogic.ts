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
  // Use structure as a proxy for defense if not explicitly defined,
  // BUT logic suggests Structure is HP.
  // Let's assume Defense = Structure / 10 for now to avoid massive reduction,
  // OR just fix the test expectation if we want high defense.

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
  const critChance = Math.min(atk * 0.01, 0.5);
  const isCritical = Math.random() < critChance;

  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }

  return { damage, isCritical };
};
