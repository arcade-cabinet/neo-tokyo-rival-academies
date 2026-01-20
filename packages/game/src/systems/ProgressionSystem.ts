import type { ECSEntity } from '@/state/ecs';
import { world } from '../state/ecs';
import { useGameStore } from '../state/gameStore';

export const MAX_LEVEL = 30;

// Logger interface placeholder (can be replaced with a real logger later)
const logger = {
  info: (msg: string, data?: unknown) => console.log(`[Progression] ${msg}`, data || ''),
};

/**
 * Calculate XP required for a given level.
 * Formula: XPRequired = 100 * (level ^ 1.5)
 *
 * @param level - The target level to calculate total XP for
 * @returns XP required to complete this level (reach level + 1)
 */
export function calculateXPRequired(level: number): number {
  return Math.floor(100 * level ** 1.5);
}

/**
 * Award XP to an entity.
 *
 * @param entity - The entity to award XP to
 * @param xpAmount - Amount of XP to award
 * @param bonusMultiplier - Optional bonus multiplier (e.g., 1.5 for break finish)
 */
export function awardXP(entity: ECSEntity, xpAmount: number, bonusMultiplier: number = 1.0): void {
  if (!entity.level) return;

  const finalXP = Math.floor(xpAmount * bonusMultiplier);
  entity.level.xp += finalXP;

  logger.info('XP Awarded', {
    entityId: entity.id,
    amount: finalXP,
    totalXP: entity.level.xp,
  });
}

/**
 * Calculate XP reward for defeating an enemy.
 *
 * @param enemyLevel - The level of the defeated enemy
 * @param enemyType - Type of enemy (grunt, boss, etc.)
 * @param wasBreakFinish - Whether the enemy was defeated during break state
 * @returns XP amount to award
 */
export function calculateEnemyXP(
  enemyLevel: number,
  enemyType: 'grunt' | 'boss' | 'elite',
  wasBreakFinish: boolean = false
): number {
  const baseXP = {
    grunt: 10,
    elite: 25,
    boss: 50,
  };

  const xp = baseXP[enemyType] * enemyLevel;
  const bonusMultiplier = wasBreakFinish ? 1.5 : 1.0;

  return Math.floor(xp * bonusMultiplier);
}

/**
 * Handles leveling up when XP threshold is met.
 */
export const updateProgression = () => {
  // Query entities with level and stats components
  const entities = world.with('level', 'stats');
  const gameStore = useGameStore.getState();

  for (const entity of entities) {
    // Safety guard for invalid nextLevelXp to prevent infinite loop
    if (entity.level.nextLevelXp <= 0) {
      logger.info('Invalid nextLevelXp detected, resetting to safe default.', {
        entityId: entity.id,
      });
      entity.level.nextLevelXp = calculateXPRequired(entity.level.current);
    }

    // Check level cap
    if (entity.level.current >= MAX_LEVEL) {
      entity.level.xp = Math.min(entity.level.xp, entity.level.nextLevelXp - 1);
      continue;
    }

    // Multi-level up logic via while loop with safety counter
    let loopGuard = 0;
    while (entity.level.xp >= entity.level.nextLevelXp && loopGuard < 100) {
      loopGuard++;

      // Check level cap again
      if (entity.level.current >= MAX_LEVEL) {
        entity.level.xp = Math.min(entity.level.xp, entity.level.nextLevelXp - 1); // Cap below threshold
        break;
      }

      // Level Up Logic
      const overflowXp = entity.level.xp - entity.level.nextLevelXp;

      entity.level.current += 1;
      entity.level.xp = overflowXp;

      // Calculate XP requirement for next level using formula
      entity.level.nextLevelXp = calculateXPRequired(entity.level.current);

      // Grant Stat Points (3 per level)
      entity.level.statPoints += 3;

      // Full Heal on Level Up
      // We use 'structure' as Max Health
      if (entity.health !== undefined) {
        entity.health = entity.stats.structure;
      }

      // Notify UI via GameStore if it's the player
      if (entity.isPlayer) {
        gameStore.onCombatText?.(`LEVEL UP! ${entity.level.current}`, '#ff00ff');
      }

      // Structured logging
      logger.info('Level Up', {
        entityId: entity.id,
        newLevel: entity.level.current,
      });
    }

    if (loopGuard >= 100) {
      logger.info('Level Up loop guard hit, stopping progression update.', {
        entityId: entity.id,
      });
    }
  }
};
