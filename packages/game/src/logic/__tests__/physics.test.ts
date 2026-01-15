import { describe, expect, it } from 'vitest';
import type { PhysicsEntity, PhysicsWorld } from '../physics';
import { updatePhysics } from '../physics';

// --- Mocks ---

class MockWorld implements PhysicsWorld {
  entities: Set<PhysicsEntity> = new Set();
  removed: PhysicsEntity[] = [];

  add(e: PhysicsEntity) {
    this.entities.add(e);
  }

  remove(e: PhysicsEntity) {
    this.entities.delete(e);
    this.removed.push(e);
  }

  // Helpers for testing
  get platforms() {
    return Array.from(this.entities).filter(e => !!e.platformData);
  }

  get dynamicEntities() {
    return Array.from(this.entities).filter(e => !!e.velocity);
  }
}

function createPlatform(x: number, length: number): PhysicsEntity {
  return {
    position: { x, y: 0, z: 0 },
    platformData: { length, slope: 0, width: 10 }
  };
}

function createPlayer(x: number): PhysicsEntity {
  return {
    position: { x, y: 10, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    characterState: 'run',
    modelColor: 0xff0000
  };
}

describe('Physics Logic', () => {
  it('should cleanup platforms far behind camera', () => {
    const world = new MockWorld();
    const cameraX = 200;

    const p1 = createPlatform(0, 10); // Ends at 10. Dist to cam 190. Remove.
    const p2 = createPlatform(110, 10); // Ends at 120. Dist to cam 80. Keep.
    const p3 = createPlatform(210, 10); // Ends at 220. Ahead. Keep.

    world.add(p1);
    world.add(p2);
    world.add(p3);

    updatePhysics(world, [], world.platforms, 0.1, cameraX);

    expect(world.removed).toContain(p1);
    expect(world.removed).not.toContain(p2);
    expect(world.removed).not.toContain(p3);
  });

  it('should apply gravity', () => {
    const world = new MockWorld();
    const player = createPlayer(0);
    player.velocity!.y = 0;
    world.add(player);

    updatePhysics(world, world.dynamicEntities, [], 0.1, 0);

    expect(player.velocity!.y).toBeLessThan(0);
  });

  it('should snap to ground', () => {
    const world = new MockWorld();
    const player = createPlayer(0);
    player.position.y = 0.5;
    player.velocity!.y = -10;
    world.add(player);

    const platform = createPlatform(-10, 20);
    platform.position.y = 0;
    world.add(platform);

    updatePhysics(world, world.dynamicEntities, world.platforms, 0.1, 0);

    expect(player.position.y).toBe(0);
    expect(player.velocity!.y).toBe(0);
  });
});
