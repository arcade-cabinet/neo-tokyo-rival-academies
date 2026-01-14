import { useFrame } from '@react-three/fiber';
import { ECS } from '../state/ecs';

export const MovementSystem = () => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);

    // Query entities with position and velocity
    const entities = ECS.world.with('position', 'velocity');

    for (const entity of entities) {
      // Basic Euler integration
      entity.position.x += entity.velocity.x * dt;
      entity.position.y += entity.velocity.y * dt;
      entity.position.z += entity.velocity.z * dt;
    }
  });

  return null;
};
