import { World } from 'miniplex';
import { createReactAPI } from 'miniplex-react';
import type * as THREE from 'three';

// Define the components that entities can have
export type ECSEntity = {
  id?: string;
  // Tags
  isPlayer?: boolean;
  isEnemy?: boolean;
  isPlatform?: boolean;
  isObstacle?: boolean;

  // Physics & Transform
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;

  // Game Logic
  faction?: 'Kurenai' | 'Azure';
  characterState?: 'run' | 'sprint' | 'jump' | 'slide' | 'stun' | 'stand' | 'block' | 'attack';
  health?: number;
  obstacleType?: 'low' | 'high';

  // Platform specifics
  platformData?: {
    length: number;
    slope: number;
    width: number;
  };

  // Visuals
  modelColor?: number;
};

// Create the ECS world
export const world = new World<ECSEntity>();

// Create the React bindings
export const ECS = createReactAPI(world);
