import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ECSEntity } from '../../state/ecs';
import { calculateDamage, resolveCombat, type AttackType } from '../CombatLogic';

describe('CombatLogic', () => {
  describe('calculateDamage', () => {
    it('should calculate basic melee damage correctly', () => {
      const attacker: ECSEntity = {
        stats: { structure: 10, ignition: 20, logic: 10, flow: 10 },
      };
      const defender: ECSEntity = {
        stats: { structure: 50, ignition: 10, logic: 10, flow: 10 },
      };

      const result = calculateDamage(attacker, defender, 'melee', () => 1.0); // No crit
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(result.isCritical).toBe(false);
      expect(result.attackType).toBe('melee');
    });

    it('should calculate ranged damage using Logic stat', () => {
      const attacker: ECSEntity = {
        stats: { structure: 10, ignition: 10, logic: 30, flow: 10 },
      };
      const defender: ECSEntity = {
        stats: { structure: 20, ignition: 10, logic: 10, flow: 10 },
      };

      const result = calculateDamage(attacker, defender, 'ranged', () => 1.0);
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(result.attackType).toBe('ranged');
    });

    it('should apply critical hit multiplier correctly', () => {
      const attacker: ECSEntity = {
        stats: { structure: 10, ignition: 20, logic: 10, flow: 10 },
      };
      const defender: ECSEntity = {
        stats: { structure: 20, ignition: 10, logic: 10, flow: 10 },
      };

      const normalResult = calculateDamage(attacker, defender, 'melee', () => 1.0); // No crit
      const critResult = calculateDamage(attacker, defender, 'melee', () => 0.0); // Always crit

      expect(critResult.isCritical).toBe(true);
      expect(critResult.damage).toBeGreaterThan(normalResult.damage);
      expect(critResult.damage).toBe(normalResult.damage * 2);
    });
  });

  describe('Property 21: Damage non-negativity', () => {
    /**
     * Feature: production-launch, Property 21: Damage non-negativity
     * Validates: Requirements 7.1
     *
     * For any attacker/defender stat combination, damage should be >= 0.
     * Critical hits should always deal more damage than normal hits.
     */
    it('should never produce negative damage for any stat combination', () => {
      fc.assert(
        fc.property(
          fc.record({
            structure: fc.integer({ min: 1, max: 100 }),
            ignition: fc.integer({ min: 1, max: 100 }),
            logic: fc.integer({ min: 1, max: 100 }),
            flow: fc.integer({ min: 1, max: 100 }),
          }),
          fc.record({
            structure: fc.integer({ min: 1, max: 100 }),
            ignition: fc.integer({ min: 1, max: 100 }),
            logic: fc.integer({ min: 1, max: 100 }),
            flow: fc.integer({ min: 1, max: 100 }),
          }),
          fc.constantFrom<AttackType>('melee', 'ranged', 'tech'),
          (attackerStats, defenderStats, attackType) => {
            const attacker: ECSEntity = { stats: attackerStats };
            const defender: ECSEntity = { stats: defenderStats };

            const result = calculateDamage(attacker, defender, attackType, () => 1.0);

            // Damage should never be negative
            expect(result.damage).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always deal more damage on critical hits', () => {
      fc.assert(
        fc.property(
          fc.record({
            structure: fc.integer({ min: 1, max: 100 }),
            ignition: fc.integer({ min: 1, max: 100 }),
            logic: fc.integer({ min: 1, max: 100 }),
            flow: fc.integer({ min: 1, max: 100 }),
          }),
          fc.record({
            structure: fc.integer({ min: 1, max: 100 }),
            ignition: fc.integer({ min: 1, max: 100 }),
            logic: fc.integer({ min: 1, max: 100 }),
            flow: fc.integer({ min: 1, max: 100 }),
          }),
          fc.constantFrom<AttackType>('melee', 'ranged', 'tech'),
          (attackerStats, defenderStats, attackType) => {
            const attacker: ECSEntity = { stats: attackerStats };
            const defender: ECSEntity = { stats: defenderStats };

            const normalResult = calculateDamage(attacker, defender, attackType, () => 1.0);
            const critResult = calculateDamage(attacker, defender, attackType, () => 0.0);

            // Critical hits should deal more damage (or equal if damage is 0)
            if (normalResult.damage > 0) {
              expect(critResult.damage).toBeGreaterThan(normalResult.damage);
            } else {
              expect(critResult.damage).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('resolveCombat (legacy)', () => {
    it('should maintain backward compatibility', () => {
      const attacker: ECSEntity = {
        stats: { structure: 10, ignition: 20, logic: 10, flow: 10 },
      };
      const defender: ECSEntity = {
        stats: { structure: 50, ignition: 10, logic: 10, flow: 10 },
      };

      const result = resolveCombat(attacker, defender, () => 1.0);
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(result.isCritical).toBe(false);
    });
  });
});
