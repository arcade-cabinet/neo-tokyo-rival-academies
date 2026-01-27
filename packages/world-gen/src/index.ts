/**
 * World Generation Package
 *
 * Production system for procedural world generation in Neo-Tokyo.
 * Uses Daggerfall-inspired block architecture with Babylon.js optimizations.
 *
 * @packageDocumentation
 */

// Block system
export * from './blocks/BlockSystem';
// RTB Blocks
export {
  SHELTER_BLOCKS,
  SHELTER_CONTAINER,
  SHELTER_PLATFORM,
  SHELTER_TARP,
  SHELTER_TENT,
} from './blocks/rtb/ShelterBlock';
// Catalog
export { BlockCatalog } from './catalog/BlockCatalog';
