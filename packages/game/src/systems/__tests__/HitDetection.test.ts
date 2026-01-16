import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { ECSEntity } from '@/state/ecs';
import {
    applyInvincibilityFrames,
    isInvincible,
    registerHit,
    updateInvincibilityState,
    type InvincibilityState,
} from '@/systems/HitDetection';

describe('HitDetection', () => {
  describe('Invincibility Frames', () => {
    it('should apply invincibility frames correctly', () => {
      const duration = 500;

      const state = applyInvincibilityFrames(duration);

      expect(state.isInvincible).toBe(true);
      expect(state.endsAt).toBeGreaterThan(Date.now());
    });

    it('should detect invincibility correctly', () => {
      const now = Date.now();
      const activeState: InvincibilityState = {
        isInvincible: true,
        endsAt: now + 1000,
      };
      const expiredState: InvincibilityState = {
        isInvincible: true,
        endsAt: now - 1000,
      };

      expect(isInvincible(activeState)).toBe(true);
      expect(isInvincible(expiredState)).toBe(false);
      expect(isInvincible(undefined)).toBe(false);
    });

    it('should update invincibility state correctly', () => {
      const now = Date.now();
      const activeState: InvincibilityState = {
        isInvincible: true,
        endsAt: now + 1000,
      };
      const expiredState: InvincibilityState = {
        isInvincible: true,
        endsAt: now - 1000,
      };

      expect(updateInvincibilityState(activeState)).toBeDefined();
      expect(updateInvincibilityState(expiredState)).toBeUndefined();
      expect(updateInvincibilityState(undefined)).toBeUndefined();
    });
  });

  describe('Hit Registration', () => {
    it('should register hit on non-invincible target', () => {
      const attacker: ECSEntity = { id: 'attacker' };
      const target: ECSEntity = { id: 'target', health: 100 };

      const result = registerHit(attacker, target, 20, 500);

      expect(result).toBe(true);
      expect(target.health).toBe(80);
    });

    it('should not register hit on invincible target', () => {
      const attacker: ECSEntity = { id: 'attacker' };
      const target: ECSEntity = {
        id: 'target',
        health: 100,
        invincibility: {
          isInvincible: true,
          endsAt: Date.now() + 1000,
        },
      };

      const result = registerHit(attacker, target, 20, 500);

      expect(result).toBe(false);
      expect(target.health).toBe(100); // Health unchanged
    });

    it('should prevent health from going below zero', () => {
      const attacker: ECSEntity = { id: 'attacker' };
      const target: ECSEntity = { id: 'target', health: 10 };

      registerHit(attacker, target, 50, 500);

      expect(target.health).toBe(0);
    });
  });

  describe('Property 22: Hit registration accuracy', () => {
    /**
     * Feature: production-launch, Property 22: Hit registration accuracy
     * Validates: Requirements 7.2
     *
     * For any attack on a non-invincible target, hit should register.
     * Invincibility frames should prevent multiple hits.
     */
    it('should always register hits on non-invincible targets', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Initial health
          fc.integer({ min: 1, max: 50 }), // Damage
          (initialHealth, damage) => {
            const attacker: ECSEntity = { id: 'attacker' };
            const target: ECSEntity = { id: 'target', health: initialHealth };

            const result = registerHit(attacker, target, damage, 500);

            // Hit should register
            expect(result).toBe(true);

            // Health should decrease
            expect(target.health).toBeLessThan(initialHealth);

            // Health should not go below zero
            expect(target.health).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should prevent hits during invincibility frames', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Initial health
          fc.integer({ min: 1, max: 50 }), // Damage
          fc.integer({ min: 100, max: 1000 }), // Invincibility duration
          (initialHealth, damage, invincibilityDuration) => {
            const attacker: ECSEntity = { id: 'attacker' };
            const target: ECSEntity = {
              id: 'target',
              health: initialHealth,
            };

            // First hit should register
            const firstHit = registerHit(attacker, target, damage, invincibilityDuration);
            expect(firstHit).toBe(true);

            const healthAfterFirstHit = target.health;

            // Second immediate hit should not register (invincibility frames)
            const secondHit = registerHit(attacker, target, damage, invincibilityDuration);
            expect(secondHit).toBe(false);

            // Health should remain unchanged after second hit
            expect(target.health).toBe(healthAfterFirstHit);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});