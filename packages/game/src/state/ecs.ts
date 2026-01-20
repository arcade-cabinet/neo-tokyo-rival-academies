import type { AbstractMesh, Vector3 } from '@babylonjs/core';
import type {
  CharacterState,
  DialogueState,
  Equipment,
  Faction,
  LevelProgress,
  ObstacleType,
  PlatformData,
  RPGStats,
} from '@neo-tokyo/core';
import { World } from 'miniplex';
import { createReactAPI } from 'miniplex-react';

// Import game-specific types that differ from core
import type { BreakState, StabilityState } from '../systems/BreakSystem';
import type { InvincibilityState } from '../systems/HitDetection';
import type { ReputationState } from '../systems/ReputationSystem';

// Re-export core types for convenience
export type {
  CharacterState,
  DialogueState,
  Equipment,
  Faction,
  LevelProgress,
  ObstacleType,
  PlatformData,
  RPGStats,
} from '@neo-tokyo/core';

// Re-export game-specific types
export type { BreakState, StabilityState } from '../systems/BreakSystem';
export type { InvincibilityState } from '../systems/HitDetection';
export type { ReputationState } from '../systems/ReputationSystem';

/**
 * Babylon.js-specific ECS Entity.
 * Extends core types with Babylon-specific rendering components.
 */
export type ECSEntity = {
  id?: string;

  // === Tags ===
  isPlayer?: boolean;
  isEnemy?: boolean;
  isBoss?: boolean;
  isAlly?: boolean;
  isPlatform?: boolean;
  isObstacle?: boolean;
  isCollectible?: boolean;

  // === Physics & Transform (Babylon-specific) ===
  position?: Vector3;
  velocity?: Vector3;
  mesh?: AbstractMesh;
  isFlying?: boolean;

  // === Game Logic ===
  faction?: Faction;
  characterState?: CharacterState;
  health?: number;
  mana?: number;
  obstacleType?: ObstacleType;
  platformData?: PlatformData;

  // === Visuals ===
  modelColor?: number;

  // === RPG Systems ===
  stats?: RPGStats;
  level?: LevelProgress;
  equipment?: Equipment;

  // === Interaction ===
  dialogueState?: DialogueState;

  // === Combat Systems ===
  invincibility?: InvincibilityState;
  stability?: StabilityState;
  breakState?: BreakState;
  reputation?: ReputationState;
};

// Create the ECS world
export const world = new World<ECSEntity>();

// Create the React bindings
export const ECS = createReactAPI(world);
