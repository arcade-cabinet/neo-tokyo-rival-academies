/**
 * @neo-tokyo/types
 * Shared TypeScript types for the Neo-Tokyo game.
 *
 * These types are platform-agnostic and used by both:
 * - apps/web (Vite + Reactylon)
 * - apps/mobile (React Native + Babylon Native)
 */

// Re-export from game package for now - will be migrated to packages/core
// when the full Native Monorepo architecture is implemented.

// Placeholder types until core extraction is complete
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface HexCoord {
  q: number;
  r: number;
}

export interface RPGStats {
  structure: number;
  ignition: number;
  logic: number;
  flow: number;
}

export type Faction = 'Kurenai' | 'Azure';

export interface ReputationState {
  Kurenai: number;
  Azure: number;
}

export type ReputationLevel =
  | 'Hated'
  | 'Hostile'
  | 'Unfriendly'
  | 'Neutral'
  | 'Friendly'
  | 'Honored'
  | 'Revered';
