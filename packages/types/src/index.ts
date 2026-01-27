/**
 * @neo-tokyo/types
 *
 * Shared TypeScript types for the Neo-Tokyo game.
 * Re-exports core types and adds additional type definitions.
 *
 * This package is the central type authority - all packages should import
 * types from here rather than defining their own.
 */

// Re-export all types from @neo-tokyo/core
export type {
  BreakState,
  CharacterState,
  CoreEntity,
  DialogueState,
  Equipment,
  Faction,
  InvincibilityState,
  LevelProgress,
  MeshRef,
  ObstacleType,
  PlatformData,
  ReputationState,
  RPGStats,
  StabilityState,
  Vec2,
  Vec3,
} from '@neo-tokyo/core';

export {
  createEnemyEntity,
  createEntity,
  createPlayerEntity,
  DEFAULT_STATS,
  Vec2Math,
  Vec3Math,
  vec2,
  vec3,
} from '@neo-tokyo/core';

// Additional types specific to game presentation

/**
 * Scene types for navigation
 */
export type SceneType = 'menu' | 'diorama' | 'combat' | 'dialogue' | 'cutscene';

/**
 * Game flow state
 */
export type GamePhase =
  | 'loading'
  | 'splash'
  | 'menu'
  | 'narrative'
  | 'playing'
  | 'paused'
  | 'gameOver';

/**
 * Input action types
 */
export interface InputActions {
  move: { x: number; y: number };
  attack: boolean;
  jump: boolean;
  interact: boolean;
  menu: boolean;
}

/**
 * Touch control configuration
 */
export interface TouchControlConfig {
  joystickSize: number;
  joystickPosition: 'left' | 'right';
  buttonLayout: 'standard' | 'compact';
  hapticFeedback: boolean;
}

/**
 * Save data structure
 */
export interface SaveData {
  version: string;
  seed: string;
  timestamp: number;
  playerEntity: {
    stats: import('@neo-tokyo/core').RPGStats;
    level: import('@neo-tokyo/core').LevelProgress;
    equipment: import('@neo-tokyo/core').Equipment;
    reputation: import('@neo-tokyo/core').ReputationState;
  };
  questProgress: Record<string, boolean>;
  unlockedDistricts: number[];
  alignment: number;
  playTime: number;
}

/**
 * Quest definition
 */
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'faction';
  faction?: import('@neo-tokyo/core').Faction;
  alignmentBias: number;
  xpReward: number;
  reputationReward: {
    Kurenai: number;
    Azure: number;
  };
  prerequisites: string[];
}

/**
 * Dialogue node for dialogue tree
 */
export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  next?: string;
}

/**
 * Dialogue choice
 */
export interface DialogueChoice {
  text: string;
  nextNodeId: string;
  alignmentShift?: number;
  requires?: string;
}

/**
 * HUD configuration
 */
export interface HUDConfig {
  showHealth: boolean;
  showMana: boolean;
  showMinimap: boolean;
  showQuestTracker: boolean;
  showFactionBar: boolean;
  touchControlsEnabled: boolean;
}
