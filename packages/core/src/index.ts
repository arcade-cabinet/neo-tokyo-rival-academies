/**
 * @neo-tokyo/core
 * Platform-agnostic game logic for Neo-Tokyo: Rival Academies
 *
 * This package contains all game systems that work across:
 * - apps/web (Vite + Reactylon)
 * - apps/mobile (React Native + Babylon Native)
 *
 * No platform-specific imports (no DOM, no React Native) allowed here.
 */

// Re-export types
export * from '@neo-tokyo/types';

// Placeholder exports - game logic will be extracted from packages/game
// as part of the Native Monorepo architecture pivot (Issue #43)
export const CORE_VERSION = '0.1.0';
