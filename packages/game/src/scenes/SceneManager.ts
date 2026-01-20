/**
 * SceneManager - Central controller for stage transitions
 *
 * Handles loading/unloading of game scenes (stages).
 * Each stage is a self-contained Babylon scene with its own assets.
 */

import type { Engine, Scene } from '@babylonjs/core';

export type StageId =
  | 'intro_cutscene'
  | 'sector7_streets'
  | 'alien_ship'
  | 'mall_drop'
  | 'boss_ambush'
  | 'rooftop_chase'
  | 'summit_climb'
  | 'final_battle'
  | 'epilogue';

export interface StageConfig {
  id: StageId;
  name: string;
  type: 'cutscene' | 'platformer' | 'boss' | 'runner';
  theme: 'dark' | 'neon' | 'sunset';
  /** Stage length in world units (for platformer/runner stages) */
  length?: number;
  /** Next stage after completion */
  nextStage?: StageId;
  /** Asset paths needed for this stage */
  assets: {
    backgrounds: string[];
    characters: string[];
    props: string[];
  };
}

/**
 * Stage configuration data
 * This defines the structure and flow of the entire game
 */
export const STAGE_CONFIGS: Record<StageId, StageConfig> = {
  intro_cutscene: {
    id: 'intro_cutscene',
    name: 'Prologue',
    type: 'cutscene',
    theme: 'dark',
    nextStage: 'sector7_streets',
    assets: {
      backgrounds: ['/assets/backgrounds/sector0/parallax_far/concept.png'],
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/main/vera/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
  sector7_streets: {
    id: 'sector7_streets',
    name: 'Sector 7: Streets',
    type: 'platformer',
    theme: 'neon',
    length: 500,
    nextStage: 'alien_ship', // C-Story disruptor
    assets: {
      backgrounds: [
        '/assets/backgrounds/sector0/parallax_far/concept.png',
        '/assets/backgrounds/sector0/parallax_mid/concept.png',
        '/assets/backgrounds/sector0/wall_left/concept.png',
        '/assets/backgrounds/sector0/wall_right/concept.png',
      ],
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/main/kai/animations/runfast.glb',
        '/assets/characters/main/vera/animations/runfast.glb',
        '/assets/characters/b-story/yakuza/grunt/animations/combat_stance.glb',
      ],
      props: ['/assets/tiles/rooftop/airvent/model.glb', '/assets/tiles/rooftop/pipes/model.glb'],
    },
  },
  alien_ship: {
    id: 'alien_ship',
    name: 'Alien Mothership',
    type: 'boss',
    theme: 'dark',
    length: 100,
    nextStage: 'mall_drop',
    assets: {
      backgrounds: [], // Need to generate alien ship backgrounds
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/main/vera/animations/combat_stance.glb',
        '/assets/characters/c-story/aliens/humanoid/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
  mall_drop: {
    id: 'mall_drop',
    name: 'Neo-Tokyo Mall',
    type: 'platformer',
    theme: 'neon',
    length: 300,
    nextStage: 'boss_ambush',
    assets: {
      backgrounds: [], // Need to generate mall backgrounds
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/main/vera/animations/combat_stance.glb',
        '/assets/characters/c-story/mall-security/guard/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
  boss_ambush: {
    id: 'boss_ambush',
    name: 'The Ambush',
    type: 'boss',
    theme: 'dark',
    length: 100,
    nextStage: 'rooftop_chase',
    assets: {
      backgrounds: ['/assets/backgrounds/sector0/parallax_far/concept.png'],
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/b-story/yakuza/boss/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
  rooftop_chase: {
    id: 'rooftop_chase',
    name: 'Rooftops',
    type: 'platformer',
    theme: 'sunset',
    length: 800,
    nextStage: 'summit_climb',
    assets: {
      backgrounds: [], // Need sunset rooftop backgrounds
      characters: [
        '/assets/characters/main/kai/animations/runfast.glb',
        '/assets/characters/main/vera/animations/runfast.glb',
        '/assets/characters/b-story/bikers/grunt/animations/combat_stance.glb',
      ],
      props: ['/assets/tiles/rooftop/airvent/model.glb', '/assets/tiles/rooftop/pipes/model.glb'],
    },
  },
  summit_climb: {
    id: 'summit_climb',
    name: 'The Summit',
    type: 'runner',
    theme: 'neon',
    length: 1000,
    nextStage: 'final_battle',
    assets: {
      backgrounds: [], // Need orbital elevator backgrounds
      characters: [
        '/assets/characters/main/kai/animations/runfast.glb',
        '/assets/characters/main/vera/animations/runfast.glb',
        '/assets/characters/b-story/bikers/boss/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
  final_battle: {
    id: 'final_battle',
    name: 'Final Clash',
    type: 'boss',
    theme: 'dark',
    length: 100,
    nextStage: 'epilogue',
    assets: {
      backgrounds: [], // Summit arena backgrounds
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/main/vera/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
  epilogue: {
    id: 'epilogue',
    name: 'Victory',
    type: 'cutscene',
    theme: 'sunset',
    assets: {
      backgrounds: [],
      characters: [
        '/assets/characters/main/kai/animations/combat_stance.glb',
        '/assets/characters/main/vera/animations/combat_stance.glb',
      ],
      props: [],
    },
  },
};

/**
 * Scene Manager singleton
 */
export class SceneManager {
  private static instance: SceneManager;
  private currentScene: Scene | null = null;
  private currentStageId: StageId | null = null;

  private constructor() {}

  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  /**
   * Initialize with Babylon engine
   */
  init(engine: Engine): void {
    this.engine = engine;
  }

  /**
   * Get current stage ID
   */
  getCurrentStageId(): StageId | null {
    return this.currentStageId;
  }

  /**
   * Get current stage config
   */
  getCurrentStageConfig(): StageConfig | null {
    return this.currentStageId ? STAGE_CONFIGS[this.currentStageId] : null;
  }

  /**
   * Transition to next stage
   */
  async transitionToNextStage(): Promise<void> {
    const config = this.getCurrentStageConfig();
    if (config?.nextStage) {
      await this.loadStage(config.nextStage);
    }
  }

  /**
   * Load a specific stage
   */
  async loadStage(stageId: StageId): Promise<void> {
    const config = STAGE_CONFIGS[stageId];
    if (!config) {
      throw new Error(`Unknown stage: ${stageId}`);
    }

    console.log(`[SceneManager] Loading stage: ${config.name}`);

    // Dispose current scene
    if (this.currentScene) {
      this.currentScene.dispose();
      this.currentScene = null;
    }

    this.currentStageId = stageId;

    // Scene will be created by React component
    // This just sets the state for what should be rendered
  }

  /**
   * Get all stage IDs in order
   */
  getStageOrder(): StageId[] {
    return [
      'intro_cutscene',
      'sector7_streets',
      'alien_ship',
      'mall_drop',
      'boss_ambush',
      'rooftop_chase',
      'summit_climb',
      'final_battle',
      'epilogue',
    ];
  }
}

export const sceneManager = SceneManager.getInstance();
