import { World } from 'miniplex';
import { createReactAPI } from 'miniplex-react';

export interface RPGStats {
  structure: number; // Max Health
  ignition: number; // Attack
  logic: number; // Tech/Ranged
  flow: number; // Speed/Evasion
}

export interface LevelProgress {
  current: number;
  xp: number;
  nextLevelXp: number;
  statPoints: number;
}

export interface Equipment {
  weapon: string; // Item ID
  armor: string; // Item ID
  accessory: string; // Item ID
}

export interface DialogueState {
  isInteracting: boolean;
  currentDialogueId: string;
  nodeId: string;
}

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
  position?: Vector3;
  velocity?: Vector3;
  mesh?: AbstractMesh;
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
  modelColor?: number; // Optional color property

  // RPG Stats
  stats?: RPGStats;

  // Progression
  level?: LevelProgress;

  // Equipment
  equipment?: Equipment;

  // Dialogue
  dialogueState?: DialogueState;
};

// Create the ECS world
export const world = new World<ECSEntity>();

// Create the React bindings
export const ECS = createReactAPI(world);
