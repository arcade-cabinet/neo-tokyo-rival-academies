import { world } from '../state/ecs';
import { useGameStore } from '../state/gameStore';

// Logger interface placeholder (can be replaced with a real logger later)
const logger = {
  info: (msg: string, data?: any) => console.log(`[Progression] ${msg}`, data || ''),
};

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
      entity.level.nextLevelXp = 100;
    }

    // Multi-level up logic via while loop with safety counter
    let loopGuard = 0;
    while (entity.level.xp >= entity.level.nextLevelXp && loopGuard < 100) {
      loopGuard++;

      // Level Up Logic
      const overflowXp = entity.level.xp - entity.level.nextLevelXp;

      entity.level.current += 1;
      entity.level.xp = overflowXp;

      // Increase XP requirement for next level (Curve: 1.5x)
      entity.level.nextLevelXp = Math.floor(entity.level.nextLevelXp * 1.5);

      // Grant Stat Points
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
      logger.info('Level Up', { entityId: entity.id, newLevel: entity.level.current });
    }

    if (loopGuard >= 100) {
      logger.info('Level Up loop guard hit, stopping progression update.', { entityId: entity.id });
    }
  }
};
