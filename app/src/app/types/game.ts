export interface GameConfig {
  gravity: number;
  baseSpeed: number;
  sprintSpeed: number;
  jumpForce: number;
  knockbackDrag: number;
}

export interface GameState {
  active: boolean;
  biome: number;
  score: number;
  rep: number;
  speed: number;
  stunned: number;
  lastBiomeSwitch: number;
}

export interface InputState {
  run: boolean;
  slide: boolean;
  jump: boolean;
  attack: boolean;
  left: boolean;
  right: boolean;
}
