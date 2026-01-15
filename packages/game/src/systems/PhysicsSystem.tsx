import { useFrame } from '@react-three/fiber';
import { updatePhysics } from '../logic/physics';
import { ECS } from '../state/ecs';

// Query dynamic entities (Player, Enemy)
const dynamicEntities = ECS.world.with('position', 'velocity', 'characterState');
// Query platforms
const platforms = ECS.world.with('position', 'platformData');

export const PhysicsSystem = () => {
  useFrame((state, delta) => {
    updatePhysics(ECS.world, dynamicEntities, platforms, delta, state.camera.position.x);
  });

  return null;
};
