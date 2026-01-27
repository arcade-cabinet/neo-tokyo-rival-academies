import seedrandom from 'seedrandom';
import type { GridBounds, GridConfig } from './grid-types';
import { getHexesInBounds, hexToWorld } from './hex-grid';
import { type HexTile, TileType } from './tiles';

function selectTileType(q: number, r: number, _rng: () => number): TileType {
  const positionSeed = Math.abs(q * 1000 + r);
  const random = (positionSeed * 9301 + 49297) % 233280;
  const value = random / 233280.0;

  if (value < 0.6) return TileType.BASE;
  if (value < 0.75) return TileType.AIRVENT;
  if (value < 0.85) return TileType.PIPES;
  if (value < 0.93) return TileType.GENERATOR;
  if (value < 0.98) return TileType.ANTENNA;
  return TileType.EDGE;
}

export const HexGridSystem = {
  generateGrid(config: GridConfig): HexTile[] {
    const { seed, bounds } = config;
    const rng = seedrandom(seed);

    const hexCoords = getHexesInBounds(bounds.minX, bounds.maxX, bounds.minZ, bounds.maxZ);

    return hexCoords.map((coord) => {
      const pos = hexToWorld(coord.q, coord.r);
      const tileType = selectTileType(coord.q, coord.r, rng);

      return {
        q: coord.q,
        r: coord.r,
        type: tileType,
        worldX: pos.x,
        worldZ: pos.z,
      };
    });
  },

  getEdgeTiles(
    tiles: HexTile[],
    bounds: GridBounds,
  ): {
    leftEdge: HexTile[];
    rightEdge: HexTile[];
  } {
    const threshold = 0.5;
    const leftEdge = tiles.filter((tile) => Math.abs(tile.worldX - bounds.minX) < threshold);
    const rightEdge = tiles.filter((tile) => Math.abs(tile.worldX - bounds.maxX) < threshold);

    return { leftEdge, rightEdge };
  },
};

export type { GridBounds, GridConfig };
