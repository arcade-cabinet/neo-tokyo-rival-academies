/**
 * Navigation System
 *
 * Manages RecastJS navigation mesh generation and pathfinding queries.
 */

import { Vector3 } from '@babylonjs/core';
import type { HexTile } from '@/types/tiles';

export interface NavigationMesh {
  id: string;
  tiles: HexTile[];
  obstacles: Vector3[];
}

export interface Waypoint {
  position: Vector3;
  index: number;
}

export class NavigationSystem {
  private meshCache: Map<string, NavigationMesh> = new Map();

  /**
   * Generate navigation mesh from hex grid tiles
   */
  generateMesh(stageId: string, tiles: HexTile[], obstacles: Vector3[] = []): NavigationMesh {
    const mesh: NavigationMesh = {
      id: stageId,
      tiles,
      obstacles,
    };

    this.meshCache.set(stageId, mesh);
    console.log(`Generated navigation mesh for ${stageId}: ${tiles.length} tiles`);

    return mesh;
  }

  /**
   * Get cached navigation mesh for stage
   */
  getMesh(stageId: string): NavigationMesh | undefined {
    return this.meshCache.get(stageId);
  }

  /**
   * Find path between two positions
   */
  findPath(start: Vector3, end: Vector3, stageId: string): Waypoint[] | null {
    const mesh = this.meshCache.get(stageId);
    if (!mesh) {
      console.warn(`No navigation mesh found for stage: ${stageId}`);
      return null;
    }

    // Simple A* pathfinding implementation
    // In production, this would use RecastJS for complex navigation
    const startTile = this.getClosestTile(start, mesh);
    const endTile = this.getClosestTile(end, mesh);

    if (!startTile || !endTile) {
      return null;
    }

    // For now, return direct path (will be replaced with proper A* + RecastJS)
    const waypoints: Waypoint[] = [
      { position: new Vector3(startTile.worldX, 0, startTile.worldZ), index: 0 },
      { position: new Vector3(endTile.worldX, 0, endTile.worldZ), index: 1 },
    ];

    return waypoints;
  }

  /**
   * Check if two positions are reachable
   */
  isReachable(start: Vector3, end: Vector3, stageId: string): boolean {
    const path = this.findPath(start, end, stageId);
    return path !== null && path.length > 0;
  }

  /**
   * Get closest point on navigation mesh
   */
  getClosestPoint(position: Vector3, stageId: string): Vector3 | null {
    const mesh = this.meshCache.get(stageId);
    if (!mesh) return null;

    const tile = this.getClosestTile(position, mesh);
    if (!tile) return null;

    return new Vector3(tile.worldX, 0, tile.worldZ);
  }

  /**
   * Get closest tile to a position
   */
  private getClosestTile(position: Vector3, mesh: NavigationMesh): HexTile | null {
    if (mesh.tiles.length === 0) return null;

    let closestTile = mesh.tiles[0];
    let minDistance = this.distanceSquared(position, closestTile);

    for (const tile of mesh.tiles) {
      const dist = this.distanceSquared(position, tile);
      if (dist < minDistance) {
        minDistance = dist;
        closestTile = tile;
      }
    }

    return closestTile;
  }

  /**
   * Calculate squared distance (faster than distance for comparisons)
   */
  private distanceSquared(pos: Vector3, tile: HexTile): number {
    const dx = pos.x - tile.worldX;
    const dz = pos.z - tile.worldZ;
    return dx * dx + dz * dz;
  }

  /**
   * Clear all cached navigation meshes
   */
  clearCache(): void {
    this.meshCache.clear();
  }
}

// Singleton instance
export const navigationSystem = new NavigationSystem();
