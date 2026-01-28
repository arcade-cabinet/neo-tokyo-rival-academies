/**
 * @neo-tokyo/diorama
 *
 * 3D rendering package for Neo-Tokyo: Rival Academies.
 * Uses Babylon.js via Reactylon for declarative 3D scene composition.
 *
 * This package contains all visual/rendering components:
 * - 100+ procedural building components
 * - Hex tile grid and floor
 * - Background panels and parallax
 * - Isometric camera system
 * - Materials (Toon shader, tile materials)
 * - Block system (Daggerfall-inspired modular architecture)
 * - Scene utilities
 */

// Camera
export * from './camera';

// Components (100+ procedural building elements)
export * from './components';

// Materials
export * from './materials';

// Types
export * from './types';

// Utilities
export * from './utils';

// World generation (blocks, cells, grid)
export * from './world';
