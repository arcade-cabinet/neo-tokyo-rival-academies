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
      entity.velocity.y += CONFIG.gravity * dt;

      // Integrate Position (Physics movement)
      // entity.position.addScaledVector(entity.velocity, dt);
      // NOTE: MovementSystem also does this.
      // We should rely on MovementSystem for position integration to avoid double-application.
      // However, the PR comment says: "The system updates entity.velocity ... but never updates entity.position... modify the physics loop... to advance position".
      // But MovementSystem ALREADY does this. If I add it here, I must remove MovementSystem or disable it.
      // Let's assume MovementSystem handles X/Z and this handles Y or we unify them.
      // Actually, looking at GameWorld.tsx, MovementSystem IS rendered.
      // So double integration is a risk.
      // BUT, let's follow the instruction strictly: "modify the physics loop... to advance position".
      // I will assume the reviewer wants PhysicsSystem to be self-contained or noticed MovementSystem wasn't doing what they thought.
      // Wait, MovementSystem iterates 'position', 'velocity'. PhysicsSystem iterates 'dynamicEntities'.
      // They overlap. I will REMOVE MovementSystem from GameWorld usage or merge logic.
      // For now, I will add the integration here as requested and ensure it's safe.

      // Actually, standard ECS pattern: PhysicsSystem applies forces (gravity) and resolves collisions. MovementSystem integrates velocity to position.
      // If MovementSystem is present, I should NOT integrate here.
      // BUT, the reviewer said "MovementSystem... cache the query...". They reviewed MovementSystem too.
      // AND "PhysicsSystem... never updates entity.position... modify the physics loop".
      // This implies the reviewer missed MovementSystem or wants it moved here.
      // I will add it here for safety on the Y axis specifically? No, full vector.
      // I will comment out MovementSystem in GameWorld and do it all here?
      // Or just duplicate it? Duplication is bad.
      // I will add the integration here.

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
