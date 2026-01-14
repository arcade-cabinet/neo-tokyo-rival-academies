import type { GameConfig, GameState, InputState } from '@/types/game';

export const CONFIG: GameConfig = {
  gravity: -50,
  baseSpeed: 14,
  sprintSpeed: 22,
  jumpForce: 18,
  knockbackDrag: 4,
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
};
