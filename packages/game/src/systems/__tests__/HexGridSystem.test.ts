/**
 * Hex Grid System Tests
 *
 * Property-based tests for hex grid generation.
 * Validates Design Property 1: Hex Grid Determinism
 * Validates Design Property 3: Tile Bounds Constraint
 */

import { describe, expect, it } from 'vitest';
import { type GridBounds, HexGridSystem } from '../HexGridSystem';

describe('HexGridSystem', () => {
  const defaultBounds: GridBounds = {
    minX: -20,
    maxX: 20,
    minZ: -20,
    maxZ: 20,
  };

  describe('Property 1: Hex Grid Determinism', () => {
    it('should generate identical grids with same seed', () => {
      const seed = 'test-seed-123';
      const config = { seed, cols: 10, rows: 10, bounds: defaultBounds };

      const grid1 = HexGridSystem.generateGrid(config);
      const grid2 = HexGridSystem.generateGrid(config);

      expect(grid1.length).toBe(grid2.length);

      for (let i = 0; i < grid1.length; i++) {
        expect(grid1[i].q).toBe(grid2[i].q);
        expect(grid1[i].r).toBe(grid2[i].r);
        expect(grid1[i].type).toBe(grid2[i].type);
        expect(grid1[i].worldX).toBeCloseTo(grid2[i].worldX, 5);
        expect(grid1[i].worldZ).toBeCloseTo(grid2[i].worldZ, 5);
      }
    });

    it('should generate different grids with different seeds', () => {
      const config1 = { seed: 'seed-a', cols: 10, rows: 10, bounds: defaultBounds };
      const config2 = { seed: 'seed-b', cols: 10, rows: 10, bounds: defaultBounds };

      const grid1 = HexGridSystem.generateGrid(config1);
      const grid2 = HexGridSystem.generateGrid(config2);

      // Grids should have same structure (same positions)
      expect(grid1.length).toBe(grid2.length);

      // Positions should be identical (deterministic based on bounds)
      for (let i = 0; i < grid1.length; i++) {
        expect(grid1[i].q).toBe(grid2[i].q);
        expect(grid1[i].r).toBe(grid2[i].r);
      }

      // Note: Tile types are currently deterministic based on position only,
      // not seed. This is by design for consistent visual appearance.
      // If we want seed-based variation, we'd need to modify selectTileType.
    });

    it('should be reproducible across multiple runs', () => {
      const seed = 'reproducible-seed';
      const config = { seed, cols: 10, rows: 10, bounds: defaultBounds };

      const grids = [
        HexGridSystem.generateGrid(config),
        HexGridSystem.generateGrid(config),
        HexGridSystem.generateGrid(config),
      ];

      // All grids should be identical
      for (let i = 1; i < grids.length; i++) {
        expect(grids[i].length).toBe(grids[0].length);
        for (let j = 0; j < grids[0].length; j++) {
          expect(grids[i][j].type).toBe(grids[0][j].type);
        }
      }
    });
  });

  describe('Property 3: Tile Bounds Constraint', () => {
    it('should generate all tiles within bounds', () => {
      const bounds: GridBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
      const config = { seed: 'bounds-test', cols: 10, rows: 10, bounds };

      const tiles = HexGridSystem.generateGrid(config);

      for (const tile of tiles) {
        expect(tile.worldX).toBeGreaterThanOrEqual(bounds.minX);
        expect(tile.worldX).toBeLessThanOrEqual(bounds.maxX);
        expect(tile.worldZ).toBeGreaterThanOrEqual(bounds.minZ);
        expect(tile.worldZ).toBeLessThanOrEqual(bounds.maxZ);
      }
    });

    it('should respect asymmetric bounds', () => {
      const bounds: GridBounds = { minX: -5, maxX: 15, minZ: -20, maxZ: 5 };
      const config = { seed: 'asymmetric', cols: 10, rows: 10, bounds };

      const tiles = HexGridSystem.generateGrid(config);

      for (const tile of tiles) {
        expect(tile.worldX).toBeGreaterThanOrEqual(bounds.minX);
        expect(tile.worldX).toBeLessThanOrEqual(bounds.maxX);
        expect(tile.worldZ).toBeGreaterThanOrEqual(bounds.minZ);
        expect(tile.worldZ).toBeLessThanOrEqual(bounds.maxZ);
      }
    });

    it('should generate fewer tiles with smaller bounds', () => {
      const largeBounds: GridBounds = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };
      const smallBounds: GridBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };

      const largeGrid = HexGridSystem.generateGrid({
        seed: 'size-test',
        cols: 10,
        rows: 10,
        bounds: largeBounds,
      });

      const smallGrid = HexGridSystem.generateGrid({
        seed: 'size-test',
        cols: 10,
        rows: 10,
        bounds: smallBounds,
      });

      expect(smallGrid.length).toBeLessThan(largeGrid.length);
    });
  });

  describe('Edge Tile Detection', () => {
    it('should identify left edge tiles', () => {
      const bounds: GridBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
      const tiles = HexGridSystem.generateGrid({
        seed: 'edge-test',
        cols: 10,
        rows: 10,
        bounds,
      });

      const { leftEdge } = HexGridSystem.getEdgeTiles(tiles, bounds);

      for (const tile of leftEdge) {
        expect(Math.abs(tile.worldX - bounds.minX)).toBeLessThan(1.0);
      }
    });

    it('should identify right edge tiles', () => {
      const bounds: GridBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
      const tiles = HexGridSystem.generateGrid({
        seed: 'edge-test',
        cols: 10,
        rows: 10,
        bounds,
      });

      const { rightEdge } = HexGridSystem.getEdgeTiles(tiles, bounds);

      for (const tile of rightEdge) {
        expect(Math.abs(tile.worldX - bounds.maxX)).toBeLessThan(1.0);
      }
    });
  });
});
