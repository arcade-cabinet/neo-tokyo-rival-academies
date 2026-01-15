import { updatePhysics, type PhysicsEntity, type PhysicsWorld } from '../src/logic/physics';

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

// --- Test Runner ---

async function runTests() {
  console.log('Running Physics Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ ${msg}`);
      passed++;
    } else {
      console.error(`❌ ${msg}`);
      failed++;
    }
  }

  // Test 1: Platform Cleanup
  {
    console.log('\nTest 1: Platform Cleanup');
    const world = new MockWorld();

    // Camera at 200
    const cameraX = 200;

    // Platform 1: Far behind (x=0, len=10) -> EndX = 10. Dist to Cam = 190. (Threshold 100). Should be removed.
    const p1 = createPlatform(0, 10);
    world.add(p1);

    // Platform 2: Close behind (x=110, len=10) -> EndX = 120. Dist = 80. Should KEEP.
    const p2 = createPlatform(110, 10);
    world.add(p2);

    // Platform 3: Ahead (x=210, len=10) -> EndX = 220. Should KEEP.
    const p3 = createPlatform(210, 10);
    world.add(p3);

    updatePhysics(world, [], world.platforms, 0.1, cameraX);

    assert(world.removed.includes(p1), 'Platform far behind should be removed');
    assert(!world.removed.includes(p2), 'Platform close behind should NOT be removed');
    assert(!world.removed.includes(p3), 'Platform ahead should NOT be removed');
    assert(world.entities.size === 2, 'World should have 2 entities remaining');
  }

  // Test 2: Gravity
  {
    console.log('\nTest 2: Gravity');
    const world = new MockWorld();
    const player = createPlayer(0);
    player.velocity!.y = 0;
    world.add(player);

    updatePhysics(world, world.dynamicEntities, [], 0.1, 0);

    // Gravity is -50. dt is 0.1. vel.y should decrease by 5.
    // Wait, CONFIG might be mocked or real. Real CONFIG.gravity = -50.
    // In physics.ts: entity.velocity.y += CONFIG.gravity * dt;
    // So -50 * 0.1 = -5.
    assert(player.velocity!.y < 0, `Gravity should apply (vY=${player.velocity!.y})`);
    assert(Math.abs(player.velocity!.y + 5) < 0.001, `Gravity value check (Expected -5, got ${player.velocity!.y})`);
  }

  // Test 3: Collision (Ground Snap)
  {
    console.log('\nTest 3: Collision');
    const world = new MockWorld();
    const player = createPlayer(0);
    player.position.y = 0.5; // Slightly above ground
    player.velocity!.y = -10; // Falling
    world.add(player);

    const platform = createPlatform(-10, 20); // From -10 to 10
    platform.position.y = 0;
    world.add(platform);

    updatePhysics(world, world.dynamicEntities, world.platforms, 0.1, 0);

    // Ground snap logic:
    // If dy <= 0 and y <= groundHeight + snapDist...
    // snapDist = 1.0.
    // player.y = 0.5. groundHeight = 0.
    // isGrounded should be true.
    // y should be set to 0. vY to 0.

    assert(player.position.y === 0, `Player should snap to ground (y=${player.position.y})`);
    assert(player.velocity!.y === 0, `Player velocity Y should be 0 (vy=${player.velocity!.y})`);
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
