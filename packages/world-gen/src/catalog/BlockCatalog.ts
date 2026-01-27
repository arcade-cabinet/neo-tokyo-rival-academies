/**
 * Block Catalog - Production registry for procedural blocks
 *
 * DDL-style catalog that registers all available blocks by category.
 * Blocks are promoted here from playground after validation.
 *
 * Usage:
 *   import { BlockCatalog } from '@neo-tokyo/world-gen/catalog';
 *   const shelterBlocks = BlockCatalog.getPool('rtb_shelter');
 *   const selectedBlock = BlockCatalog.selectBlock('rtb_shelter', seed, gridX, gridZ);
 */

import {
  type BlockCategory,
  type BlockDefinition,
  createSeededRandom,
} from '../blocks/BlockSystem';

// ============================================================================
// CATALOG STORAGE
// ============================================================================

const blockPools: Map<BlockCategory, BlockDefinition[]> = new Map();
const blockById: Map<string, BlockDefinition> = new Map();

// ============================================================================
// CATALOG API
// ============================================================================

export const BlockCatalog = {
  /**
   * Register a block definition
   */
  register(definition: BlockDefinition): void {
    // Add to category pool
    if (!blockPools.has(definition.category)) {
      blockPools.set(definition.category, []);
    }
    const pool = blockPools.get(definition.category);
    if (!pool) {
      return;
    }
    pool.push(definition);

    // Add to ID lookup
    blockById.set(definition.typeId, definition);
  },

  /**
   * Register multiple blocks
   */
  registerAll(definitions: BlockDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  },

  /**
   * Get all blocks in a category
   */
  getPool(category: BlockCategory): BlockDefinition[] {
    return blockPools.get(category) ?? [];
  },

  /**
   * Get block by type ID
   */
  getById(typeId: string): BlockDefinition | undefined {
    return blockById.get(typeId);
  },

  /**
   * Select block from pool using seeded random
   * Same seed + position = same block every time (Daggerfall-style)
   */
  selectBlock(
    category: BlockCategory,
    seed: number,
    gridX: number,
    gridZ: number
  ): BlockDefinition | undefined {
    const pool = this.getPool(category);
    if (pool.length === 0) return undefined;

    const locationSeed = seed ^ (gridX * 73856093) ^ (gridZ * 19349663);
    const rng = createSeededRandom(locationSeed);
    return rng.pick(pool);
  },

  /**
   * Get all registered categories
   */
  getCategories(): BlockCategory[] {
    return Array.from(blockPools.keys());
  },

  /**
   * Get total block count
   */
  getTotalCount(): number {
    return blockById.size;
  },

  /**
   * Get count per category
   */
  getCategoryCounts(): Record<BlockCategory, number> {
    const counts: Partial<Record<BlockCategory, number>> = {};
    for (const [category, pool] of blockPools) {
      counts[category] = pool.length;
    }
    return counts as Record<BlockCategory, number>;
  },

  /**
   * Clear all registrations (for testing)
   */
  clear(): void {
    blockPools.clear();
    blockById.clear();
  },
};
