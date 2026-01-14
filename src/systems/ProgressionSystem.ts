import { world } from '../state/ecs';

/**
 * Handles leveling up when XP threshold is met.
 */
export const updateProgression = () => {
  // Query entities with level and stats components
  const entities = world.with('level', 'stats');

  for (const entity of entities) {
    // Check if XP threshold is met
    if (entity.level.xp >= entity.level.nextLevelXp) {
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

      console.log(`Entity ${entity.id} leveled up to ${entity.level.current}!`);
    }
  }
};
