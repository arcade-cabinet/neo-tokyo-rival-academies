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
});
