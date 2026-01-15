import { useFrame } from '@react-three/fiber';
import { ECS } from '../state/ecs';
import { CONFIG } from '../utils/gameConfig';

// Convert slope units to radians: slope * ~15 degrees
const SLOPE_TO_RAD = 0.26;

// Query dynamic entities (Player, Enemy)
const dynamicEntities = ECS.world.with('position', 'velocity', 'characterState');
// Query platforms
const platforms = ECS.world.with('position', 'platformData');

export const PhysicsSystem = () => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);

    for (const entity of dynamicEntities) {
      // Apply Gravity
      // Bosses might ignore gravity (e.g. if flying)
      const isFlying = entity.isFlying || entity.modelColor === 0xffffff;
      if (!isFlying) {
        entity.velocity.y += CONFIG.gravity * dt;
      }

      // Apply Air Drag / Friction to X
      // If no input (controlled by InputSystem), slow down.
      // But PhysicsSystem doesn't know about input directly.
      // InputSystem sets 'run' or 'stand'.
      // If 'stand' or 'block', damp velocity.
      if (entity.characterState === 'stand' || entity.characterState === 'block') {
        // Friction
        entity.velocity.x *= CONFIG.FRICTION_MULTIPLIER;
        if (Math.abs(entity.velocity.x) < CONFIG.VELOCITY_THRESHOLD) entity.velocity.x = 0;
      }

      // Integrate Position (Physics movement)
      entity.position.x += entity.velocity.x * dt;
      entity.position.y += entity.velocity.y * dt;
      entity.position.z += entity.velocity.z * dt;

      // Platform Collision
      let groundHeight = -999;

      // Check collision with all platforms
      for (const p of platforms) {
        const { length, slope } = p.platformData;
        const angle = slope * SLOPE_TO_RAD;
        const projLen = length * Math.cos(angle);
        const dx = entity.position.x - p.position.x;

        if (dx >= -0.5 && dx <= projLen + 0.5) {
          const gy = p.position.y + dx * Math.tan(angle);
          if (gy > groundHeight) {
            groundHeight = gy;
          }
        }
      }

      // Ground snapping
      const snapDist = 1.0;
      const isGrounded =
        entity.velocity.y <= 0 &&
        (entity.position.y <= groundHeight + 0.1 ||
          (entity.characterState !== 'jump' && entity.position.y <= groundHeight + snapDist));

      if (isGrounded) {
        entity.position.y = groundHeight;
        entity.velocity.y = 0;
      }
    }
  });

  return null;
};
