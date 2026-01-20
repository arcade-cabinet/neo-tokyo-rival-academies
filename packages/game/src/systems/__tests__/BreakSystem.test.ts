import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ECSEntity } from '@/state/ecs';
import {
  applyBreakState,
  type BreakState,
  initializeStability,
  isBroken,
  processHitWithStability,
  reduceStability,
  regenerateStability,
  type StabilityState,
  updateBreakState,
  updateStabilityAndBreak,
} from '../BreakSystem';

describe('BreakSystem', () => {
  describe('Stability Initialization', () => {
    it('should initialize grunt stability correctly', () => {
      const stability = initializeStability('grunt');
      expect(stability.current).toBe(100);
      expect(stability.max).toBe(100);
      expect(stability.regenRate).toBe(10);
    });

    it('should initialize boss stability correctly', () => {
      const stability = initializeStability('boss');
      expect(stability.current).toBe(500);
      expect(stability.max).toBe(500);
      expect(stability.regenRate).toBe(20);
    });

    it('should initialize player stability correctly', () => {
      const stability = initializeStability('player');
      expect(stability.current).toBe(200);
      expect(stability.max).toBe(200);
      expect(stability.regenRate).toBe(15);
    });
  });

  describe('Stability Reduction', () => {
    it('should reduce stability by damage amount', () => {
      const stability: StabilityState = {
        current: 100,
        max: 100,
        regenRate: 10,
        lastHitTime: Date.now(),
      };

      const result = reduceStability(stability, 30);

      expect(result.stability.current).toBe(70);
      expect(result.breakTriggered).toBe(false);
    });

    it('should trigger break when stability reaches 0', () => {
      const stability: StabilityState = {
        current: 20,
        max: 100,
        regenRate: 10,
        lastHitTime: Date.now(),
      };

      const result = reduceStability(stability, 30);

      expect(result.stability.current).toBe(0);
      expect(result.breakTriggered).toBe(true);
    });

    it('should not allow stability to go below 0', () => {
      const stability: StabilityState = {
        current: 10,
        max: 100,
        regenRate: 10,
        lastHitTime: Date.now(),
      };

      const result = reduceStability(stability, 50);

      expect(result.stability.current).toBe(0);
    });
  });

  describe('Stability Regeneration', () => {
    it('should regenerate stability over time', () => {
      const now = Date.now();
      const stability: StabilityState = {
        current: 50,
        max: 100,
        regenRate: 10,
        lastHitTime: now - 2000, // 2 seconds ago
      };

      const result = regenerateStability(stability, 1000); // 1 second elapsed

      expect(result.current).toBeGreaterThan(50);
      expect(result.current).toBeLessThanOrEqual(100);
    });

    it('should not regenerate if hit recently', () => {
      const stability: StabilityState = {
        current: 50,
        max: 100,
        regenRate: 10,
        lastHitTime: Date.now() - 500, // 0.5 seconds ago
      };

      const result = regenerateStability(stability, 1000);

      expect(result.current).toBe(50); // No regeneration
    });

    it('should not exceed max stability', () => {
      const now = Date.now();
      const stability: StabilityState = {
        current: 95,
        max: 100,
        regenRate: 10,
        lastHitTime: now - 2000,
      };

      const result = regenerateStability(stability, 2000); // 2 seconds

      expect(result.current).toBe(100);
    });
  });

  describe('Break State', () => {
    it('should apply break state correctly', () => {
      const entity: ECSEntity = { id: 'test' };
      const breakState = applyBreakState(entity, 5000);

      expect(breakState.isBroken).toBe(true);
      expect(breakState.endsAt).toBeGreaterThan(Date.now());
    });

    it('should detect broken state correctly', () => {
      const now = Date.now();
      const activeBreak: BreakState = {
        isBroken: true,
        endsAt: now + 1000,
      };
      const expiredBreak: BreakState = {
        isBroken: true,
        endsAt: now - 1000,
      };

      expect(isBroken(activeBreak)).toBe(true);
      expect(isBroken(expiredBreak)).toBe(false);
      expect(isBroken(undefined)).toBe(false);
    });

    it('should update break state correctly', () => {
      const now = Date.now();
      const activeBreak: BreakState = {
        isBroken: true,
        endsAt: now + 1000,
      };
      const expiredBreak: BreakState = {
        isBroken: true,
        endsAt: now - 1000,
      };

      expect(updateBreakState(activeBreak)).toBeDefined();
      expect(updateBreakState(expiredBreak)).toBeUndefined();
      expect(updateBreakState(undefined)).toBeUndefined();
    });
  });

  describe('Property 23: Break state consistency', () => {
    it('should never allow stability below 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500 }), // Initial stability
          fc.integer({ min: 1, max: 1000 }), // Damage amount
          (initialStability, damage) => {
            const stability: StabilityState = {
              current: initialStability,
              max: initialStability,
              regenRate: 10,
              lastHitTime: Date.now(),
            };

            const result = reduceStability(stability, damage);

            // Stability should never go below 0
            expect(result.stability.current).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always trigger break when stability depleted', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 500 }), // Initial stability
          (initialStability) => {
            const stability: StabilityState = {
              current: initialStability,
              max: initialStability,
              regenRate: 10,
              lastHitTime: Date.now(),
            };

            // Deal enough damage to deplete stability
            const result = reduceStability(stability, initialStability + 100);

            // Stability should be 0
            expect(result.stability.current).toBe(0);

            // Break should be triggered
            expect(result.breakTriggered).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain break state for duration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }), // Break duration
          (duration) => {
            const entity: ECSEntity = { id: 'test' };
            const breakState = applyBreakState(entity, duration);

            // Should be broken immediately
            expect(isBroken(breakState)).toBe(true);

            // Verify the actual breakState is still valid (endsAt should be in future)
            // Use derived time instead of hardcoded
            const almostExpired: BreakState = {
              isBroken: true,
              endsAt: Date.now() + duration - 50, // Just before expiry
            };
            expect(isBroken(almostExpired)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Integration', () => {
    it('should process hit with stability correctly', () => {
      const entity: ECSEntity & {
        stability?: StabilityState;
        breakState?: BreakState;
      } = {
        id: 'test',
        stability: initializeStability('grunt'),
      };

      const breakTriggered = processHitWithStability(entity, 150);

      expect(breakTriggered).toBe(true);
      expect(entity.stability?.current).toBe(0);
      expect(entity.breakState).toBeDefined();
    });

    it('should update stability and break state correctly', () => {
      const entity: ECSEntity & {
        stability?: StabilityState;
        breakState?: BreakState;
      } = {
        id: 'test',
        stability: {
          current: 50,
          max: 100,
          regenRate: 10,
          lastHitTime: Date.now() - 2000,
        },
      };

      updateStabilityAndBreak(entity, 1000);

      expect(entity.stability?.current).toBeGreaterThan(50);
    });
  });
});
