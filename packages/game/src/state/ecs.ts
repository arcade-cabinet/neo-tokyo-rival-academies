import { World } from 'miniplex';
import { createReactAPI } from 'miniplex-react';
import type * as THREE from 'three';

// Define the components that entities can have
export type ECSEntity = {
  id?: string;
  // Tags
  isPlayer?: boolean;
  isEnemy?: boolean;
  isBoss?: boolean;
  isAlly?: boolean;
  isPlatform?: boolean;
  isObstacle?: boolean;
  isCollectible?: boolean;

  // Physics & Transform
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;
  isFlying?: boolean;

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

  // RPG Stats
  stats?: {
    structure: number; // Max Health
    ignition: number; // Attack
    logic: number; // Tech/Ranged
    flow: number; // Speed/Evasion
  };

  // Base stats (before equipment modifiers)
  baseStats?: {
    structure: number;
    ignition: number;
    logic: number;
    flow: number;
  };

  // Progression
  level?: {
    current: number;
    xp: number;
    nextLevelXp: number;
    statPoints: number;
  };

  // Equipment
  equipment?: {
    weapon: string | null; // Item ID
    armor: string | null; // Item ID
    accessory: string | null; // Item ID
  };

  // Collectible data
  collectibleType?: 'data_shard' | 'weapon' | 'item';
  weaponId?: string; // For weapon pickups

  // Dialogue
  dialogueState?: {
    isInteracting: boolean;
    currentDialogueId: string;
    nodeId: string;
  };

  // Tentacle AI data (for alien ship stage)
  tentacleData?: {
    anchorPoint: any; // THREE.Vector3
    patrolRadius: number;
    attackRange: number;
    attackSpeed: number;
    state: 'patrol' | 'tracking' | 'attacking' | 'retracting';
    patrolAngle: number;
    attackCooldown: number;
    target: any | null; // THREE.Vector3 | null
  };
};

// Create the ECS world
export const world = new World<ECSEntity>();

// Create the React bindings
export const ECS = createReactAPI(world);
