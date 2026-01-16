/**
 * Core entity types for the ECS architecture.
 * Platform-agnostic - no rendering dependencies.
 */

import type { Vec3 } from './math';

/**
 * Faction types for the rival academies
 */
export type Faction = 'Kurenai' | 'Azure';

/**
 * Character state machine states
 */
export type CharacterState =
  | 'idle'
  | 'run'
  | 'sprint'
  | 'jump'
  | 'slide'
  | 'stun'
  | 'stand'
  | 'block'
  | 'attack'
  | 'dead';

/**
 * RPG stat block
 */
export interface RPGStats {
  /** Max Health - tankiness */
  structure: number;
  /** Attack - physical damage */
  ignition: number;
  /** Tech/Ranged - ability power */
  logic: number;
  /** Speed/Evasion - agility */
  flow: number;
}

/**
 * Default stat block for new characters
 */
export const DEFAULT_STATS: RPGStats = {
  structure: 10,
  ignition: 10,
  logic: 10,
  flow: 10,
};

/**
 * Level progression tracking
 */
export interface LevelProgress {
  current: number;
  xp: number;
  nextLevelXp: number;
  statPoints: number;
}

/**
 * Equipment slots
 */
export interface Equipment {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

/**
 * Dialogue interaction state
 */
export interface DialogueState {
  isInteracting: boolean;
  currentDialogueId: string;
  nodeId: string;
}

/**
 * Invincibility frames state
 */
export interface InvincibilityState {
  active: boolean;
  remaining: number;
  duration: number;
}

/**
 * Stability/poise system state
 */
export interface StabilityState {
  current: number;
  max: number;
  regenRate: number;
  regenDelay: number;
  lastDamageTime: number;
}

/**
 * Break gauge state for stagger mechanics
 */
export interface BreakState {
  gauge: number;
  maxGauge: number;
  isBroken: boolean;
  breakDuration: number;
  breakTimer: number;
  recoveryRate: number;
}

/**
 * Reputation with factions
 */
export interface ReputationState {
  Kurenai: number;
  Azure: number;
}

/**
 * Platform-specific data stored as opaque reference.
 * Renderers populate this with their mesh/model reference.
 */
export type MeshRef = unknown;

/**
 * Obstacle types for the runner sections
 */
export type ObstacleType = 'low' | 'high';

/**
 * Platform data for runner sections
 */
export interface PlatformData {
  length: number;
  slope: number;
  width: number;
}

/**
 * Core ECS Entity - platform-agnostic game state.
 * Renderers extend this with their platform-specific components.
 */
export interface CoreEntity {
  /** Unique entity identifier */
  id: string;

  // === Tags ===
  isPlayer?: boolean;
  isEnemy?: boolean;
  isBoss?: boolean;
  isAlly?: boolean;
  isPlatform?: boolean;
  isObstacle?: boolean;
  isCollectible?: boolean;
  isNPC?: boolean;

  // === Transform (platform-agnostic) ===
  position?: Vec3;
  velocity?: Vec3;
  rotation?: Vec3;
  isFlying?: boolean;

  // === Mesh Reference (platform-specific, opaque) ===
  meshRef?: MeshRef;

  // === Game Logic ===
  faction?: Faction;
  characterState?: CharacterState;
  health?: number;
  maxHealth?: number;
  mana?: number;
  maxMana?: number;

  // === Obstacle/Platform ===
  obstacleType?: ObstacleType;
  platformData?: PlatformData;

  // === Visual Hints (for renderers) ===
  modelId?: string;
  tintColor?: number;

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

  // === AI ===
  aiState?: string;
  targetEntityId?: string;
  patrolPath?: Vec3[];
  patrolIndex?: number;
}

/**
 * Create a new entity with defaults
 */
export function createEntity(id: string, partial?: Partial<CoreEntity>): CoreEntity {
  return {
    id,
    ...partial,
  };
}

/**
 * Create a player entity with standard defaults
 */
export function createPlayerEntity(id = 'player'): CoreEntity {
  return createEntity(id, {
    isPlayer: true,
    faction: 'Kurenai',
    characterState: 'idle',
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    stats: { ...DEFAULT_STATS },
    level: {
      current: 1,
      xp: 0,
      nextLevelXp: 100,
      statPoints: 0,
    },
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    reputation: {
      Kurenai: 50,
      Azure: 50,
    },
  });
}

/**
 * Create an enemy entity
 */
export function createEnemyEntity(id: string, faction: Faction, level = 1): CoreEntity {
  const healthMultiplier = 1 + (level - 1) * 0.2;
  return createEntity(id, {
    isEnemy: true,
    faction,
    characterState: 'idle',
    health: Math.floor(50 * healthMultiplier),
    maxHealth: Math.floor(50 * healthMultiplier),
    stats: {
      structure: 8 + level,
      ignition: 8 + level,
      logic: 6 + level,
      flow: 6 + level,
    },
    aiState: 'patrol',
  });
}
