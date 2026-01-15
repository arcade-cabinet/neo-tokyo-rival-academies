import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '../../state/ecs';
import { updateProgression } from '../ProgressionSystem';

describe('ProgressionSystem', () => {
  beforeEach(() => {
    world.clear();
  });

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
    expect(entity.level?.nextLevelXp).toBe(150);
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
    // Test case: XP exceeds multiple thresholds
    // Level 1 -> 2: Needs 100 XP.
    // Level 2 -> 3: Needs 150 XP. (100 * 1.5)
    // Total for Lvl 3: 250 XP.
    // Given XP: 300.
    // Expected: Level 3, Remaining XP: 50.

    const entity = world.add({
      id: 'player',
      health: 50,
      stats: { structure: 100, ignition: 10, logic: 10, flow: 10 },
      level: { current: 1, xp: 300, nextLevelXp: 100, statPoints: 0 },
    });

    updateProgression();

    expect(entity.level?.current).toBe(3);
    expect(entity.level?.xp).toBe(50);
    expect(entity.level?.statPoints).toBe(6); // 2 levels * 3 points
    expect(entity.level?.nextLevelXp).toBe(225); // 150 * 1.5
  });
});
