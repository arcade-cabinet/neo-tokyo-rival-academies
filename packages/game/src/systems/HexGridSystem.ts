/**
 * Hex Grid System
 *
 * Generates deterministic hex tile grids with bounds trimming.
 */

import seedrandom from 'seedrandom';
import { type HexTile, TileType } from '@/types/tiles';
import { getHexesInBounds, hexToWorld } from '@/utils/hex-grid-babylon';

export interface GridBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface GridConfig {
  seed: string;
  cols: number;
  rows: number;
  bounds: GridBounds;
}

/**
 * Select tile type deterministically based on position
 */
function selectTileType(q: number, r: number, _rng: () => number): TileType {
  // Use position as seed for consistent results
  const positionSeed = Math.abs(q * 1000 + r);
  const random = (positionSeed * 9301 + 49297) % 233280;
  const value = random / 233280.0;

  // Weighted distribution
  if (value < 0.6) return TileType.BASE; // 60% base tiles
  if (value < 0.75) return TileType.AIRVENT; // 15% airvent
  if (value < 0.85) return TileType.PIPES; // 10% pipes
  if (value < 0.93) return TileType.GENERATOR; // 8% generator
  if (value < 0.98) return TileType.ANTENNA; // 5% antenna
  return TileType.EDGE; // 2% edge
}

export const HexGridSystem = {
  /**
   * Generate a hex grid with deterministic tile types
   */
  generateGrid(config: GridConfig): HexTile[] {
    const { seed, bounds } = config;
    const rng = seedrandom(seed);

    // Get all hex coordinates within bounds
    const hexCoords = getHexesInBounds(bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ);

    // Assign tile types deterministically
    const tiles: HexTile[] = hexCoords.map((coord) => {
      const pos = hexToWorld(coord.q, coord.r);

      // Deterministic tile type based on position and RNG
      const tileType = selectTileType(coord.q, coord.r, rng);

      return {
        q: coord.q,
        r: coord.r,
        type: tileType,
        worldX: pos.x,
        worldZ: pos.z,
      };
    });

    console.log(`Generated ${tiles.length} hex tiles within bounds`);
    return tiles;
  },

  /**
   * Get tiles at the edge of bounds (for clipping plane application)
   */
  getEdgeTiles(
    tiles: HexTile[],
    bounds: GridBounds
  ): {
    leftEdge: HexTile[];
    rightEdge: HexTile[];
  } {
    const threshold = 0.5; // Distance threshold for edge detection

    const leftEdge = tiles.filter((tile) => Math.abs(tile.worldX - bounds.minX) < threshold);
    const rightEdge = tiles.filter((tile) => Math.abs(tile.worldX - bounds.maxX) < threshold);

    return { leftEdge, rightEdge };
  },
};