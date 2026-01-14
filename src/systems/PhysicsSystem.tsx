import { useFrame } from '@react-three/fiber';
import { ECS } from '../state/ecs';
import { CONFIG } from '../utils/gameConfig';

export const PhysicsSystem = () => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Query dynamic entities (Player, Enemy)
    const dynamicEntities = ECS.world.with('position', 'velocity', 'characterState');
    // Query platforms
    const platforms = ECS.world.with('position', 'platformData');

    for (const entity of dynamicEntities) {
      // Apply Gravity
      entity.velocity.y += CONFIG.gravity * dt;

      // Platform Collision
      let groundHeight = -999;

      // Check collision with all platforms
      for (const p of platforms) {
        const { length, slope } = p.platformData;
        const angle = slope * 0.26;
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

        // If we were jumping, land
        if (entity.characterState === 'jump') {
          // We'll let InputSystem handle state transitions mostly,
          // but physics needs to know we are grounded
        }
      }

      // Game Over check (Fall)
      if (entity.isPlayer && entity.position.y < -20) {
        // Simple respawn/reset logic for now, handled by GameWorld usually
        // But we can flag it here if we add a 'dead' component
      }
    }
  });

  return null;
};
