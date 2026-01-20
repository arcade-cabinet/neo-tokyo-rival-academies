import fc from 'fast-check';
import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '@/state/ecs';
import {
  awardXP,
  calculateEnemyXP,
  calculateXPRequired,
  updateProgression,
} from '@/systems/ProgressionSystem';

describe('ProgressionSystem', () => {
  beforeEach(() => {
    world.clear();
  });

  describe('XP Calculation', () => {
    it('should calculate XP required using formula', () => {
      // Formula: XPRequired = 100 * (level ^ 1.5)
      expect(calculateXPRequired(1)).toBe(100); // 100 * 1^1.5 = 100
      expect(calculateXPRequired(2)).toBe(282); // 100 * 2^1.5 ≈ 282
      expect(calculateXPRequired(3)).toBe(519); // 100 * 3^1.5 ≈ 519
      expect(calculateXPRequired(10)).toBe(3162); // 100 * 10^1.5 ≈ 3162
    });

    it('should calculate enemy XP correctly', () => {
      expect(calculateEnemyXP(1, 'grunt', false)).toBe(10); // 10 * 1 * 1.0
      expect(calculateEnemyXP(1, 'grunt', true)).toBe(15); // 10 * 1 * 1.5
      expect(calculateEnemyXP(5, 'boss', false)).toBe(250); // 50 * 5 * 1.0
      expect(calculateEnemyXP(5, 'boss', true)).toBe(375); // 50 * 5 * 1.5
    });
  });

  describe('XP Awarding', () => {
    it('should award XP to entity', () => {
      const entity = world.add({
        id: 'player',
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 0, nextLevelXp: 100, statPoints: 0 },
      });

      awardXP(entity, 50);

      expect(entity.level?.xp).toBe(50);
    });

    it('should apply bonus multiplier', () => {
      const entity = world.add({
        id: 'player',
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 0, nextLevelXp: 100, statPoints: 0 },
      });

      awardXP(entity, 50, 1.5);

      expect(entity.level?.xp).toBe(75); // 50 * 1.5
    });
  });

  describe('Leveling', () => {
    it('should level up entity when xp >= nextLevelXp', () => {
      const entity = world.add({
        id: 'player',
        health: 50,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 100, nextLevelXp: 100, statPoints: 0 },
      });

      updateProgression();

      expect(entity.level?.current).toBe(2);
      expect(entity.level?.xp).toBe(0);
      expect(entity.level?.statPoints).toBe(3);
      expect(entity.health).toBe(100); // Full heal
      expect(entity.level?.nextLevelXp).toBe(calculateXPRequired(2));
    });

    it('should handle overflow xp', () => {
      const entity = world.add({
        id: 'player',
        health: 50,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 150, nextLevelXp: 100, statPoints: 0 },
      });

      updateProgression();

      expect(entity.level?.current).toBe(2);
      expect(entity.level?.xp).toBe(50);
    });

    it('should handle multi-level overflow', () => {
      const entity = world.add({
        id: 'player',
        health: 50,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 500, nextLevelXp: 100, statPoints: 0 },
      });

      updateProgression();

      expect(entity.level?.current).toBeGreaterThan(1);
      expect(entity.level?.statPoints).toBeGreaterThan(0);
    });

    it('should not level up if xp is insufficient', () => {
      const entity = world.add({
        id: 'player',
        health: 50,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 50, nextLevelXp: 100, statPoints: 0 },
      });

      updateProgression();

      expect(entity.level?.current).toBe(1);
      expect(entity.level?.xp).toBe(50);
      expect(entity.level?.statPoints).toBe(0);
    });

    it('should cap at level 30', () => {
      const entity = world.add({
        id: 'player',
        health: 50,
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 30, xp: 10000, nextLevelXp: 100, statPoints: 0 },
      });

      updateProgression();

      expect(entity.level?.current).toBe(30);
      expect(entity.level?.xp).toBe(99); // XP capped at nextLevelXp - 1
    });

    it('should handle entity without health property correctly', () => {
      const entity = world.add({
        id: 'shard',
        stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
        level: { current: 1, xp: 100, nextLevelXp: 100, statPoints: 0 },
      });

      updateProgression();

      expect(entity.level?.current).toBe(2);
      expect(entity.health).toBeUndefined();
    });
  });

  describe('Property 25: XP monotonicity', () => {
    it('should maintain non-negative XP after level ups', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 1,
            maxLength: 10,
          }),
          (xpGains) => {
            const entity = world.add({
              id: 'player',
              stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
              level: { current: 1, xp: 0, nextLevelXp: 100, statPoints: 0 },
            });

            for (const xpGain of xpGains) {
              awardXP(entity, xpGain);
              updateProgression();

              const currentTotalXP = entity.level?.xp ?? 0;

              // XP should always be non-negative after level up processing
              expect(currentTotalXP).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should never decrease level', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 }), {
            minLength: 1,
            maxLength: 10,
          }),
          (xpGains) => {
            const entity = world.add({
              id: 'player',
              stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
              level: { current: 1, xp: 0, nextLevelXp: 100, statPoints: 0 },
            });

            let previousLevel = 1;

            for (const xpGain of xpGains) {
              awardXP(entity, xpGain);
              updateProgression();

              const currentLevel = entity.level?.current ?? 1;

              // Level should never decrease
              expect(currentLevel).toBeGreaterThanOrEqual(previousLevel);

              previousLevel = currentLevel;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should increase XP required with level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 29 }), // Levels 1-29
          (level) => {
            const currentLevelXP = calculateXPRequired(level);
            const nextLevelXP = calculateXPRequired(level + 1);

            // XP required should increase with level
            expect(nextLevelXP).toBeGreaterThan(currentLevelXP);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
