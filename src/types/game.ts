import type * as THREE from 'three';
import type { Mesh } from 'three';

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
  rep: number; // Reputation/XP
  speed: number;
  stunned: number;
  lastBiomeSwitch: number;
}

export interface InputState {
  run: boolean;
  slide: boolean;
  jump: boolean;
  attack: boolean;
}

export interface Platform {
  mesh: Mesh;
  x: number;
  y: number;
  len: number;
  angle: number;
  slope: number;
}

export interface Entity {
  type: 'enemy' | 'obstacle';
  active: boolean;
  x: number;
  y: number;
  id: string;
  enemyType?: 'stand' | 'block';
  obstacleType?: 'low' | 'high';
}

export interface Character {
  mesh: THREE.Group;
  pivot: THREE.Group;
  coatSegments: THREE.Group[];
  limbs: {
    armL: THREE.Group;
    armR: THREE.Group;
    legL: THREE.Group;
    legR: THREE.Group;
  };
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  state: CharacterState;
  grounded: boolean;
  isPlayer: boolean;
  update: (dt: number, t: number, speed: number) => void;
}

export type CharacterState =
  | 'run'
  | 'sprint'
  | 'jump'
  | 'slide'
  | 'stun'
  | 'stand'
  | 'block'
  | 'attack';

export interface Biome {
  name: string;
  fog: number;
  light: number;
  bldgMat: THREE.Material;
}
