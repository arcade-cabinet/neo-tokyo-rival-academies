import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ECSEntity } from '@/state/ecs';
import {
    applyCooldown,
    executeAbility,
    getRemainingCooldown,
    isOnCooldown,
    updateCooldowns,
    type Ability,
    type AbilityCooldownState,
} from '@/systems/AbilitySystem';

describe('AbilitySystem', () => {
  const testAbility: Ability = {
    id: 'test_ability',
    name: 'Test Ability',
    description: 'A test ability',
    cost: 10,
    cooldown: 5000,
    effectType: 'damage',
    effectValue: 50,
  };

  describe('Cooldown Management', () => {
    it('should detect cooldown correctly', () => {
      const now = Date.now();
      const activeCooldown: AbilityCooldownState = {
        abilityId: 'test',
        endsAt: now + 1000,
      };
      const expiredCooldown: AbilityCooldownState = {
        abilityId: 'test',
        endsAt: now - 1000,
      };

      expect(isOnCooldown(activeCooldown)).toBe(true);
      expect(isOnCooldown(expiredCooldown)).toBe(false);
      expect(isOnCooldown(undefined)).toBe(false);
    });

    it('should calculate remaining cooldown correctly', () => {
      const now = Date.now();
      const cooldown: AbilityCooldownState = {
        abilityId: 'test',
        endsAt: now + 5000,
      };

      const remaining = getRemainingCooldown(cooldown);
      expect(remaining).toBeGreaterThan(4900);
      expect(remaining).toBeLessThanOrEqual(5000);
    });

    it('should apply cooldown correctly', () => {
      const cooldown = applyCooldown(testAbility);

      expect(cooldown.abilityId).toBe(testAbility.id);
      expect(cooldown.endsAt).toBeGreaterThan(Date.now());
    });

    it('should update cooldowns and remove expired ones', () => {
      const now = Date.now();
      const cooldowns: AbilityCooldownState[] = [
        { abilityId: 'active1', endsAt: now + 1000 },
        { abilityId: 'expired1', endsAt: now - 1000 },
        { abilityId: 'active2', endsAt: now + 2000 },
        { abilityId: 'expired2', endsAt: now - 500 },
      ];

      const updated = updateCooldowns(cooldowns);

      expect(updated).toHaveLength(2);
      expect(updated.find((cd) => cd.abilityId === 'active1')).toBeDefined();
      expect(updated.find((cd) => cd.abilityId === 'active2')).toBeDefined();
      expect(updated.find((cd) => cd.abilityId === 'expired1')).toBeUndefined();
      expect(updated.find((cd) => cd.abilityId === 'expired2')).toBeUndefined();
    });
  });

  describe('Ability Execution', () => {
    it('should execute damage ability successfully', () => {
      const caster: ECSEntity = { id: 'caster', mana: 100 };
      const target: ECSEntity = { id: 'target', health: 100 };
      const cooldowns: AbilityCooldownState[] = [];

      const result = executeAbility(caster, target, testAbility, cooldowns);

      expect(result.success).toBe(true);
      expect(target.health).toBe(50);
      expect(result.effect).toBeDefined();
      expect(result.effect?.type).toBe('damage');
    });

    it('should fail if ability is on cooldown', () => {
      const caster: ECSEntity = { id: 'caster', mana: 100 };
      const target: ECSEntity = { id: 'target', health: 100 };
      const cooldowns: AbilityCooldownState[] = [
        {
          abilityId: testAbility.id,
          endsAt: Date.now() + 1000,
        },
      ];

      const result = executeAbility(caster, target, testAbility, cooldowns);

      expect(result.success).toBe(false);
      expect(result.failureReason).toBe('Ability is on cooldown');
      expect(target.health).toBe(100); // Health unchanged
    });

    it('should execute heal ability successfully', () => {
      const healAbility: Ability = {
        id: 'heal',
        name: 'Heal',
        description: 'Heals target',
        cost: 15,
        cooldown: 3000,
        effectType: 'heal',
        effectValue: 30,
      };

      const caster: ECSEntity = { id: 'caster', mana: 100 };
      const target: ECSEntity = {
        id: 'target',
        health: 50,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
      };
      const cooldowns: AbilityCooldownState[] = [];

      const result = executeAbility(caster, target, healAbility, cooldowns);

      expect(result.success).toBe(true);
      expect(target.health).toBe(80);
      expect(result.effect?.type).toBe('heal');
    });

    it('should not heal above max health', () => {
      const healAbility: Ability = {
        id: 'heal',
        name: 'Heal',
        description: 'Heals target',
        cost: 15,
        cooldown: 3000,
        effectType: 'heal',
        effectValue: 100,
      };

      const caster: ECSEntity = { id: 'caster', mana: 100 };
      const target: ECSEntity = {
        id: 'target',
        health: 90,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
      };
      const cooldowns: AbilityCooldownState[] = [];

      const result = executeAbility(caster, target, healAbility, cooldowns);

      expect(result.success).toBe(true);
      expect(target.health).toBe(100); // Capped at max
    });
  });

  describe('Property 24: Cooldown enforcement', () => {
    it('should prevent ability use during cooldown', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }), // Cooldown duration
          (cooldownDuration) => {
            const ability: Ability = {
              id: 'test',
              name: 'Test',
              description: 'Test ability',
              cost: 10,
              cooldown: cooldownDuration,
              effectType: 'damage',
              effectValue: 50,
            };

            const caster: ECSEntity = { id: 'caster', mana: 100 };
            const target: ECSEntity = { id: 'target', health: 100 };

            // First use should succeed
            const cooldowns: AbilityCooldownState[] = [];
            // Use a fresh target/caster for first call or just verify state
            // Here executeAbility mutates target.health, but we check success/failure mostly
            // To be safe, let's use separate targets
            const target1 = { ...target };
            const firstResult = executeAbility(caster, target1, ability, cooldowns);
            expect(firstResult.success).toBe(true);

            // Add cooldown
            const newCooldown = applyCooldown(ability);
            cooldowns.push(newCooldown);

            // Second immediate use should fail
            const target2 = { ...target };
            const secondResult = executeAbility(caster, target2, ability, cooldowns);
            expect(secondResult.success).toBe(false);
            expect(secondResult.failureReason).toBe('Ability is on cooldown');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow ability use after cooldown expires', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 1000 }), // Short cooldown for testing
          (cooldownDuration) => {
            const now = Date.now();
            const expiredCooldown: AbilityCooldownState = {
              abilityId: testAbility.id,
              endsAt: now - cooldownDuration, // Expired by generated duration
            };

            const cooldowns = [expiredCooldown];
            const caster: ECSEntity = { id: 'caster', mana: 100 };
            const target: ECSEntity = { id: 'target', health: 100 };

            const result = executeAbility(caster, target, testAbility, cooldowns);

            // Should succeed because cooldown expired
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly track remaining cooldown time', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }), // Cooldown duration
          (cooldownDuration) => {
            const now = Date.now();
            const cooldown: AbilityCooldownState = {
              abilityId: 'test',
              endsAt: now + cooldownDuration,
            };

            const remaining = getRemainingCooldown(cooldown);

            // Remaining should be close to cooldown duration (within 100ms tolerance)
            expect(remaining).toBeGreaterThan(cooldownDuration - 100);
            expect(remaining).toBeLessThanOrEqual(cooldownDuration);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});