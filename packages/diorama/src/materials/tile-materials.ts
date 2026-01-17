/**
 * Tile Material System
 *
 * Creates and manages materials for different tile types.
 */

import { Color3, type Scene } from "@babylonjs/core";
import { TileType } from "../types/tiles";
import { createEnvironmentMaterial } from "./toon-material";

/**
 * Tile color palette (neon cyberpunk theme)
 */
const TILE_COLORS: Record<TileType, Color3> = {
	[TileType.BASE]: new Color3(0.15, 0.15, 0.2), // Dark gray
	[TileType.AIRVENT]: new Color3(0.2, 0.25, 0.3), // Blue-gray
	[TileType.PIPES]: new Color3(0.25, 0.2, 0.15), // Brown-gray
	[TileType.GENERATOR]: new Color3(0.3, 0.25, 0.2), // Warm gray
	[TileType.ANTENNA]: new Color3(0.2, 0.2, 0.25), // Cool gray
	[TileType.EDGE]: new Color3(0.1, 0.1, 0.15), // Very dark
};

/**
 * Create material for a specific tile type
 */
export function createTileMaterial(type: TileType, scene: Scene) {
	const color = TILE_COLORS[type];
	return createEnvironmentMaterial(`tile_${type}`, scene, color);
}

/**
 * Create all tile materials at once
 */
export function createAllTileMaterials(scene: Scene) {
	const materials: Record<
		TileType,
		ReturnType<typeof createEnvironmentMaterial>
	> = {
		[TileType.BASE]: createTileMaterial(TileType.BASE, scene),
		[TileType.AIRVENT]: createTileMaterial(TileType.AIRVENT, scene),
		[TileType.PIPES]: createTileMaterial(TileType.PIPES, scene),
		[TileType.GENERATOR]: createTileMaterial(TileType.GENERATOR, scene),
		[TileType.ANTENNA]: createTileMaterial(TileType.ANTENNA, scene),
		[TileType.EDGE]: createTileMaterial(TileType.EDGE, scene),
	};

	return materials;
}

/**
 * Get tile color for a given type
 */
export function getTileColor(type: TileType): Color3 {
	return TILE_COLORS[type].clone();
}
