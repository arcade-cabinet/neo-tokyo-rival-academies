/**
 * @neo-tokyo/core
 *
 * Platform-agnostic game logic for Neo-Tokyo: Rival Academies.
 * Contains types, ECS components, and pure game systems.
 *
 * This package has NO rendering dependencies - it can be used by:
 * - Web builds (Babylon.js via Reactylon)
 * - Mobile builds (Babylon Native via React Native)
 * - Server-side logic (Node.js)
 * - Testing environments
 *
 * No platform-specific imports (no DOM, no React Native APIs) allowed here.
 */

export const CORE_VERSION = "0.1.0";

// Systems
export * from "./systems";
// Types
export * from "./types";
// State
export * from "./state/worldStore";
export * from "./state/questStore";
export * from "./state/alignmentStore";
export * from "./state/playerStore";
// Data
export * from "./data/questGrammar";
