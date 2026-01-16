import type { GameConfig, GameState, InputState } from '@/types/game';

export const CONFIG: GameConfig & { FRICTION_MULTIPLIER: number; VELOCITY_THRESHOLD: number } = {
  gravity: -50,
  baseSpeed: 14,
  sprintSpeed: 22,
  jumpForce: 18,
  knockbackDrag: 4,
  FRICTION_MULTIPLIER: 0.8,
  VELOCITY_THRESHOLD: 0.1,
};

export const initialGameState: GameState = {
  active: false,
  biome: 0,
  score: 0,
  rep: 0,
  speed: 0,
  stunned: 0,
  lastBiomeSwitch: 0,
};

export const initialInputState: InputState = {
  run: false,
  slide: false,
  jump: false,
  attack: false,
  left: false,
  right: false,
};
