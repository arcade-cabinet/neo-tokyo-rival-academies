import { describe, it, expect, beforeEach } from 'vitest';
import { equipWeapon, getEquippedWeapon, WEAPONS, createWeaponPickup } from '../WeaponSystem';
import type { ECSEntity } from '../../state/ecs';

describe('WeaponSystem', () => {
  let entity: ECSEntity;

  beforeEach(() => {
    entity = {
      id: 'test-entity',
      stats: {
        structure: 100,
        ignition: 20,
        logic: 15,
        flow: 10,
      },
      equipment: {
        weapon: null,
        armor: null,
        accessory: null,
      },
    };
  });

  describe('equipWeapon', () => {
    it('should equip a weapon and update stats', () => {
      equipWeapon(entity, 'scissors');

      expect(entity.equipment?.weapon).toBe('scissors');
      expect(entity.baseStats).toBeDefined();
      expect(entity.baseStats?.ignition).toBe(20);
      // Giant Scissors: damage 25, so stats.ignition = 20 * 25 / 10 = 50
      expect(entity.stats?.ignition).toBe(50);
    });

    it('should preserve base stats when switching weapons', () => {
      equipWeapon(entity, 'scissors');
      const firstIgnition = entity.stats?.ignition;

      equipWeapon(entity, 'broom');
      // Broom: damage 8, so stats.ignition = 20 * 8 / 10 = 16
      expect(entity.stats?.ignition).toBe(16);
      expect(entity.baseStats?.ignition).toBe(20); // Base stats unchanged
      expect(firstIgnition).not.toBe(entity.stats?.ignition);
    });

    it('should handle unknown weapon gracefully', () => {
      const consoleWarn = console.warn;
      console.warn = () => {}; // Suppress warning in test

      equipWeapon(entity, 'nonexistent-weapon');

      console.warn = consoleWarn;
      expect(entity.equipment?.weapon).toBe('nonexistent-weapon');
    });

    it('should create equipment object if missing', () => {
      const bareEntity: ECSEntity = {
        id: 'bare',
        stats: {
          structure: 50,
          ignition: 10,
          logic: 5,
          flow: 5,
        },
      };

      equipWeapon(bareEntity, 'sign');

      expect(bareEntity.equipment).toBeDefined();
      expect(bareEntity.equipment?.weapon).toBe('sign');
    });
  });

  describe('getEquippedWeapon', () => {
    it('should return equipped weapon', () => {
      entity.equipment = { weapon: 'scissors', armor: null, accessory: null };

      const weapon = getEquippedWeapon(entity);

      expect(weapon.id).toBe('scissors');
      expect(weapon.name).toBe('Giant Scissors');
    });

    it('should return default weapon if none equipped', () => {
      const weapon = getEquippedWeapon(entity);

      expect(weapon.id).toBe('default');
      expect(weapon.name).toBe('Fists');
    });

    it('should return default weapon for unknown id', () => {
      entity.equipment = { weapon: 'unknown', armor: null, accessory: null };

      const weapon = getEquippedWeapon(entity);

      expect(weapon.id).toBe('default');
    });
  });

  describe('WEAPONS', () => {
    it('should have all expected weapons', () => {
      expect(WEAPONS.default).toBeDefined();
      expect(WEAPONS.scissors).toBeDefined();
      expect(WEAPONS.sign).toBeDefined();
      expect(WEAPONS.broom).toBeDefined();
    });

    it('should have proper damage scaling', () => {
      // Giant Scissors: high damage, slow
      expect(WEAPONS.scissors.damage).toBeGreaterThan(WEAPONS.default.damage);
      expect(WEAPONS.scissors.speed).toBeLessThan(WEAPONS.default.speed);

      // Broom: low damage, fast
      expect(WEAPONS.broom.damage).toBeLessThan(WEAPONS.default.damage);
      expect(WEAPONS.broom.speed).toBeGreaterThan(WEAPONS.default.speed);

      // Sign: balanced
      expect(WEAPONS.sign.speed).toBe(1.0);
    });

    it('should have knockback values', () => {
      expect(WEAPONS.broom.knockback).toBe(3); // High knockback
      expect(WEAPONS.scissors.knockback).toBe(2); // Medium knockback
      expect(WEAPONS.default.knockback).toBe(0); // No knockback
    });
  });

  describe('createWeaponPickup', () => {
    it('should create a valid pickup entity', () => {
      const pickup = createWeaponPickup({
        weaponId: 'scissors',
        position: [10, 5, 0],
      });

      expect(pickup.isCollectible).toBe(true);
      expect(pickup.collectibleType).toBe('weapon');
      expect(pickup.weaponId).toBe('scissors');
      expect(pickup.position?.x).toBe(10);
      expect(pickup.position?.y).toBe(5);
      expect(pickup.position?.z).toBe(0);
    });
  });
});
