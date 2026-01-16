import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type {
  Faction,
  ReputationChange,
  ReputationState,
} from '../ReputationSystem';
import {
  applyReputationChange,
  getAggressionLevel,
  getReputationLevel,
  initializeReputation,
  isQuestUnlocked,
} from '../ReputationSystem';

describe('ReputationSystem', () => {
  describe('Initialization', () => {
    it('should initialize with neutral reputation', () => {
      const reputation = initializeReputation();

      expect(reputation.Kurenai).toBe(50);
      expect(reputation.Azure).toBe(50);
    });
  });

  describe('Reputation Changes', () => {
    it('should apply positive reputation change', () => {
      const reputation = initializeReputation();
      const change: ReputationChange = {
        faction: 'Kurenai',
        amount: 25,
        reason: 'Helped faction',
      };

      const updated = applyReputationChange(reputation, change);

      expect(updated.Kurenai).toBe(75); // 50 + 25
      expect(updated.Azure).toBe(50);
    });

    it('should apply negative reputation change', () => {
      const reputation = initializeReputation();
      // Start with default 50
      const change: ReputationChange = {
        faction: 'Azure',
        amount: -30,
        reason: 'Betrayed faction',
      };

      const updated = applyReputationChange(reputation, change);

      expect(updated.Azure).toBe(20);
    });

    it('should clamp reputation at 100', () => {
      const reputation: ReputationState = {
        Kurenai: 90,
        Azure: 0,
      };
      const change: ReputationChange = {
        faction: 'Kurenai',
        amount: 50,
        reason: 'Major help',
      };

      const updated = applyReputationChange(reputation, change);

      expect(updated.Kurenai).toBe(100);
    });

    it('should clamp reputation at 0', () => {
      const reputation: ReputationState = {
        Kurenai: 10,
        Azure: 0,
      };
      const change: ReputationChange = {
        faction: 'Kurenai',
        amount: -50,
        reason: 'Major betrayal',
      };

      const updated = applyReputationChange(reputation, change);

      expect(updated.Kurenai).toBe(0);
    });
  });

  describe('Reputation Levels', () => {
    it('should return correct reputation levels', () => {
      expect(getReputationLevel(0)).toBe('Hated');
      expect(getReputationLevel(10)).toBe('Hated');
      expect(getReputationLevel(20)).toBe('Hostile');
      expect(getReputationLevel(35)).toBe('Unfriendly');
      expect(getReputationLevel(50)).toBe('Neutral');
      expect(getReputationLevel(70)).toBe('Friendly');
      expect(getReputationLevel(85)).toBe('Honored');
      expect(getReputationLevel(95)).toBe('Revered');
    });
  });

  describe('Quest Unlocking', () => {
    it('should unlock quest when requirements met', () => {
      const reputation: ReputationState = {
        Kurenai: 50,
        Azure: 30,
      };

      const requirements = {
        Kurenai: 40,
        Azure: 20,
      };

      expect(isQuestUnlocked(reputation, requirements)).toBe(true);
    });

    it('should not unlock quest when requirements not met', () => {
      const reputation: ReputationState = {
        Kurenai: 30,
        Azure: 10,
      };

      const requirements = {
        Kurenai: 40,
        Azure: 20,
      };

      expect(isQuestUnlocked(reputation, requirements)).toBe(false);
    });
  });

  describe('Aggression Levels', () => {
    it('should return high aggression for hated reputation', () => {
      const reputation: ReputationState = {
        Kurenai: 5,
        Azure: 0,
      };

      expect(getAggressionLevel(reputation, 'Kurenai')).toBe(2.0);
    });

    it('should return normal aggression for neutral reputation', () => {
      const reputation: ReputationState = {
        Kurenai: 50,
        Azure: 50,
      };

      expect(getAggressionLevel(reputation, 'Kurenai')).toBe(1.0);
    });

    it('should return low aggression for revered reputation', () => {
      const reputation: ReputationState = {
        Kurenai: 95,
        Azure: 0,
      };

      expect(getAggressionLevel(reputation, 'Kurenai')).toBe(0.5);
    });
  });

  describe('Property 27: Reputation clamping', () => {
    it('should always clamp reputation to [0, 100]', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              faction: fc.constantFrom<Faction>('Kurenai', 'Azure'),
              amount: fc.integer({ min: -50, max: 50 }),
              reason: fc.constant('test'),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (changes) => {
            let reputation = initializeReputation();

            for (const change of changes) {
              reputation = applyReputationChange(reputation, change);

              expect(reputation.Kurenai).toBeGreaterThanOrEqual(0);
              expect(reputation.Kurenai).toBeLessThanOrEqual(100);
              expect(reputation.Azure).toBeGreaterThanOrEqual(0);
              expect(reputation.Azure).toBeLessThanOrEqual(100);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});