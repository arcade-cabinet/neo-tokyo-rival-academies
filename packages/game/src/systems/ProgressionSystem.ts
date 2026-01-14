import { world } from '../state/ecs';

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

  for (const entity of entities) {
    // Multi-level up logic via while loop
    while (entity.level.xp >= entity.level.nextLevelXp) {
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

      // Structured logging
      logger.info('Level Up', { entityId: entity.id, newLevel: entity.level.current });
    }
  }
};
