import { CONFIG } from '../utils/gameConfig';

// Convert slope units to radians: slope * ~15 degrees
const SLOPE_TO_RAD = 0.26;

export interface PhysicsEntity {
  id?: string;
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  characterState?: string;
  modelColor?: number;
  // For platforms
  platformData?: {
    length: number;
    slope: number;
    width: number;
  };
}

export interface PhysicsWorld {
  remove(entity: PhysicsEntity): void;
}

export function updatePhysics(
  world: PhysicsWorld,
  dynamicEntities: Iterable<PhysicsEntity>,
  platforms: Iterable<PhysicsEntity>,
  delta: number,
  cameraX: number
) {
  const dt = Math.min(delta, 0.1);

  // 1. Physics & Collision for Dynamic Entities
  for (const entity of dynamicEntities) {
    if (!entity.velocity) continue;

    // Apply Gravity
    // Bosses might ignore gravity (e.g. if flying)
    const isFlying = entity.modelColor === 0xffffff;
    if (!isFlying) {
      entity.velocity.y += CONFIG.gravity * dt;
    }

    // Apply Air Drag / Friction to X
    if (entity.characterState === 'stand' || entity.characterState === 'block') {
      entity.velocity.x *= 0.8;
      if (Math.abs(entity.velocity.x) < 0.1) entity.velocity.x = 0;
    }

    // Integrate Position
    entity.position.x += entity.velocity.x * dt;
    entity.position.y += entity.velocity.y * dt;
    entity.position.z += entity.velocity.z * dt;

    const NO_GROUND = -999;
    const SNAP_DISTANCE = 1.0;

    // Platform Collision
    let groundHeight = NO_GROUND;

    for (const p of platforms) {
        if (!p.platformData) continue;

        const { length, slope } = p.platformData;
        
        const dx = entity.position.x - p.position.x;

        // Optimization: Broad phase check (right side)
        if (dx < -0.5) continue;

        // Optimization: Broad phase check (left side) using length as upper bound
        if (dx > length + 0.5) continue;

        const angle = slope * SLOPE_TO_RAD;
        const projLen = length * Math.cos(angle);

        if (dx <= projLen + 0.5) {
          const gy = p.position.y + dx * Math.tan(angle);
          if (gy > groundHeight) {
            groundHeight = gy;
          }
        }
    }

    // Ground snapping
    const snapDist = SNAP_DISTANCE;
    const isGrounded =
      entity.velocity.y <= 0 &&
      (entity.position.y <= groundHeight + 0.1 ||
        (entity.characterState !== 'jump' && entity.position.y <= groundHeight + snapDist));

    if (isGrounded) {
      entity.position.y = groundHeight;
      entity.velocity.y = 0;
    }
  }

  // 2. Platform Cleanup
  // Remove platforms that are far behind the camera
  // Threshold of 100 units ensures platforms are well off-screen before removal
  const CLEANUP_THRESHOLD = 100;
  const toRemove: PhysicsEntity[] = [];

  for (const p of platforms) {
      if (!p.platformData) continue;

      // Calculate approximate end of platform
      const endX = p.position.x + p.platformData.length;

      if (endX < cameraX - CLEANUP_THRESHOLD) {
          toRemove.push(p);
      }
  }

  for (const p of toRemove) {
      world.remove(p);
  }
}
