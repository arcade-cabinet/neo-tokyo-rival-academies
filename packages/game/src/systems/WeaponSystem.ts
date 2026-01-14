/**
 * Weapon System
 *
 * Handles weapon switching and stat modifications for the Mall Drop stage
 */

import type { ECSEntity } from '../state/ecs';

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  speed: number;
  knockback: number;
  description: string;
}

export const WEAPONS: Record<string, Weapon> = {
  default: {
    id: 'default',
    name: 'Fists',
    damage: 10,
    speed: 1.0,
    knockback: 0,
    description: 'Your bare hands',
  },
  scissors: {
    id: 'scissors',
    name: 'Giant Scissors',
    damage: 25,
    speed: 0.7,
    knockback: 2,
    description: 'High damage, slow attack',
  },
  sign: {
    id: 'sign',
    name: 'Mall Sign',
    damage: 15,
    speed: 1.0,
    knockback: 1,
    description: 'Balanced weapon',
  },
  broom: {
    id: 'broom',
    name: 'Broom',
    damage: 8,
    speed: 1.5,
    knockback: 3,
    description: 'Fast attacks with knockback',
  },
};

/**
 * Equip a weapon to an entity and update its stats
 */
export function equipWeapon(entity: ECSEntity, weaponId: string): void {
  const weapon = WEAPONS[weaponId];
  if (!weapon) {
    console.warn(`Unknown weapon: ${weaponId}`);
    return;
  }

  // Store the weapon in equipment
  if (!entity.equipment) {
    entity.equipment = { weapon: null, armor: null, accessory: null };
  }
  entity.equipment.weapon = weaponId;

  // Update stats based on weapon
  if (entity.stats) {
    // Store base stats if not already stored
    if (!entity.baseStats) {
      entity.baseStats = { ...entity.stats };
    }

    // Apply weapon modifiers
    entity.stats.ignition = Math.floor((entity.baseStats.ignition || 10) * weapon.damage / 10);
  }
}

/**
 * Get currently equipped weapon
 */
export function getEquippedWeapon(entity: ECSEntity): Weapon {
  const weaponId = entity.equipment?.weapon || 'default';
  return WEAPONS[weaponId] || WEAPONS.default;
}

/**
 * Create a weapon pickup entity
 */
export interface WeaponPickupData {
  weaponId: string;
  position: [number, number, number];
}

export function createWeaponPickup(data: WeaponPickupData): Partial<ECSEntity> {
  return {
    isCollectible: true,
    position: { x: data.position[0], y: data.position[1], z: data.position[2] },
    collectibleType: 'weapon',
    weaponId: data.weaponId,
  };
}
