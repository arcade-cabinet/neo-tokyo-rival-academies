/**
 * World Generation Package
 *
 * Production system for procedural world generation in Neo-Tokyo.
 * Uses Daggerfall-inspired block architecture with Babylon.js optimizations.
 *
 * @packageDocumentation
 */

// Block system
export * from "./blocks/BlockSystem";

// Catalog
export { BlockCatalog } from "./catalog/BlockCatalog";

// RTB Blocks
export { SHELTER_BLOCKS, SHELTER_TARP, SHELTER_TENT, SHELTER_CONTAINER, SHELTER_PLATFORM } from "./blocks/rtb/ShelterBlock";
