import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ECSEntity } from '../../state/ecs';
import {
    applyStatAllocation,
    getRecommendedAllocation,
    resetStatAllocation,
    validateAllocation,
    type StatAllocation,
} from '../StatAllocation';

describe('StatAllocation', () => {
  describe('Validation', () => {
    it('should validate correct allocation', () => {
      const allocation: StatAllocation = {
        structure: 1,
        ignition: 1,
        logic: 1,
        flow: 0,
      };

      const result = validateAllocation(allocation, 3);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject allocation exceeding available points', () => {
      const allocation: StatAllocation = {
        structure: 2,
        ignition: 2,
        logic: 2,
        flow: 2,
      };

      const result = validateAllocation(allocation, 3);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds available points');
    });

    it('should reject negative allocations', () => {
      const allocation: StatAllocation = {
        structure: -1,
        ignition: 1,
        logic: 1,
        flow: 1,
      };

      const result = validateAllocation(allocation, 3);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('negative');
    });
  });

  describe('Application', () => {
    it('should apply stat allocation correctly', () => {
      const entity: ECSEntity = {
        id: 'player',
        stats: { structure: 10, ignition: 10, logic: 10, flow: 10 },
        level: { current: 2, xp: 0, nextLevelXp: 100, statPoints: 3 },
        health: 10,
      };

      const allocation: StatAllocation = {
        structure: 1,
        ignition: 1,
        logic: 1,
        flow: 0,
      };

      const result = applyStatAllocation(entity, allocation);

      expect(result.success).toBe(true);
      expect(entity.stats?.structure).toBe(11);
      expect(entity.stats?.ignition).toBe(11);
      expect(entity.stats?.logic).toBe(11);
      expect(entity.stats?.flow).toBe(10);
      expect(entity.level?.statPoints).toBe(0);
      expect(entity.health).toBe(11); // Health increased with structure
    });

    it('should fail if entity lacks stats', () => {
      const entity: ECSEntity = {
        id: 'player',
        level: { current: 2, xp: 0, nextLevelXp: 100, statPoints: 3 },
      };

      const allocation: StatAllocation = {
        structure: 1,
        ignition: 1,
        logic: 1,
        flow: 0,
      };

      const result = applyStatAllocation(entity, allocation);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not have stats');
    });

    it('should fail if allocation is invalid', () => {
      const entity: ECSEntity = {
        id: 'player',
        stats: { structure: 10, ignition: 10, logic: 10, flow: 10 },
        level: { current: 2, xp: 0, nextLevelXp: 100, statPoints: 3 },
      };

      const allocation: StatAllocation = {
        structure: 5,
        ignition: 5,
        logic: 5,
        flow: 5,
      };

      const result = applyStatAllocation(entity, allocation);

      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds available points');
    });
  });

  describe('Recommended Allocations', () => {
    it('should provide tank allocation', () => {
      const allocation = getRecommendedAllocation('tank', 10);

      expect(allocation.structure).toBeGreaterThan(allocation.ignition);
      expect(allocation.structure).toBeGreaterThan(allocation.logic);
    });

    it('should provide melee DPS allocation', () => {
      const allocation = getRecommendedAllocation('melee_dps', 10);

      expect(allocation.ignition).toBeGreaterThan(allocation.structure);
      expect(allocation.ignition).toBeGreaterThan(allocation.logic);
    });

    it('should provide ranged DPS allocation', () => {
      const allocation = getRecommendedAllocation('ranged_dps', 10);

      expect(allocation.logic).toBeGreaterThan(allocation.structure);
      expect(allocation.logic).toBeGreaterThan(allocation.ignition);
    });

    it('should provide balanced allocation', () => {
      const allocation = getRecommendedAllocation('balanced', 12);

      // All stats should be roughly equal
      expect(allocation.structure).toBe(allocation.ignition);
      expect(allocation.ignition).toBe(allocation.logic);
      expect(allocation.logic).toBe(allocation.flow);
    });
  });

  describe('Reset', () => {
    it('should reset stats and refund points', () => {
      const entity: ECSEntity = {
        id: 'player',
        stats: { structure: 15, ignition: 12, logic: 11, flow: 10 },
        level: { current: 5, xp: 0, nextLevelXp: 500, statPoints: 0 },
      };

      const baseStats = { structure: 10, ignition: 10, logic: 10, flow: 10 };

      const refunded = resetStatAllocation(entity, baseStats);

      expect(refunded).toBe(8); // 5 + 2 + 1 + 0 = 8 points
      expect(entity.stats).toEqual(baseStats);
      expect(entity.level?.statPoints).toBe(8);
    });
  });

  describe('Property 26: Stat point conservation', () => {
    /**
     * Feature: production-launch, Property 26: Stat point conservation
     * Validates: Requirements 8.3
     *
     * For any allocation, total points spent should equal points available.
     * Stats should never decrease from allocation.
     */
    it('should conserve stat points', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }), // Available points
          fc.record({
            structure: fc.integer({ min: 0, max: 5 }),
            ignition: fc.integer({ min: 0, max: 5 }),
            logic: fc.integer({ min: 0, max: 5 }),
            flow: fc.integer({ min: 0, max: 5 }),
          }),
          (availablePoints, allocation) => {
            const totalAllocated =
              allocation.structure + allocation.ignition + allocation.logic + allocation.flow;

            // Skip if allocation exceeds available points
            if (totalAllocated > availablePoints) {
              return true;
            }

            const entity: ECSEntity = {
              id: 'player',
              stats: { structure: 10, ignition: 10, logic: 10, flow: 10 },
              level: { current: 2, xp: 0, nextLevelXp: 100, statPoints: availablePoints },
            };

            const initialPoints = entity.level.statPoints;
            const result = applyStatAllocation(entity, allocation);

            if (result.success) {
              // Points spent should equal total allocated
              const pointsSpent = initialPoints - (entity.level?.statPoints ?? 0);
              expect(pointsSpent).toBe(totalAllocated);

              // Remaining points should be correct
              expect(entity.level?.statPoints).toBe(availablePoints - totalAllocated);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never decrease stats from allocation', () => {
      fc.assert(
        fc.property(
          fc.record({
            structure: fc.integer({ min: 10, max: 50 }),
            ignition: fc.integer({ min: 10, max: 50 }),
            logic: fc.integer({ min: 10, max: 50 }),
            flow: fc.integer({ min: 10, max: 50 }),
          }),
          fc.record({
            structure: fc.integer({ min: 0, max: 5 }),
            ignition: fc.integer({ min: 0, max: 5 }),
            logic: fc.integer({ min: 0, max: 5 }),
            flow: fc.integer({ min: 0, max: 5 }),
          }),
          (initialStats, allocation) => {
            const totalAllocated =
              allocation.structure + allocation.ignition + allocation.logic + allocation.flow;

            const entity: ECSEntity = {
              id: 'player',
              stats: { ...initialStats },
              level: { current: 2, xp: 0, nextLevelXp: 100, statPoints: totalAllocated },
            };

            const result = applyStatAllocation(entity, allocation);

            if (result.success && entity.stats) {
              // All stats should be >= initial values
              expect(entity.stats.structure).toBeGreaterThanOrEqual(initialStats.structure);
              expect(entity.stats.ignition).toBeGreaterThanOrEqual(initialStats.ignition);
              expect(entity.stats.logic).toBeGreaterThanOrEqual(initialStats.logic);
              expect(entity.stats.flow).toBeGreaterThanOrEqual(initialStats.flow);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
