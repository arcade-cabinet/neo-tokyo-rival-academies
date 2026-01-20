/**
 * Block System - Production version
 *
 * Daggerfall-inspired modular architecture for procedural world generation.
 * This is the production system - blocks are promoted here after validation
 * in the playground package.
 *
 * KEY CONCEPTS:
 * 1. Blocks are fixed-size, pre-validated units that snap together
 * 2. Each block has defined snap points at edges for connections
 * 3. Block selection is deterministic: seed → category → specific block
 * 4. Supports LOD and instancing for production performance
 *
 * BLOCK TYPES:
 * - RTB (Rooftop Territory Block) - exterior city blocks
 * - SRB (Submerged Ruin Block) - interior/dungeon blocks
 * - WTB (Waterway Transit Block) - connections over water
 */

import type { Vector3 } from "@babylonjs/core";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Grid unit size in meters (allows 2-3 shelters per edge) */
export const GRID_UNIT_SIZE = 8;

/** Standard block sizes in grid units */
export const STANDARD_BLOCK_SIZES = {
	small: { x: 1, y: 1, z: 1 },    // 8x8m footprint
	medium: { x: 2, y: 1, z: 2 },   // 16x16m footprint
	large: { x: 3, y: 1, z: 3 },    // 24x24m footprint
	corridor: { x: 1, y: 1, z: 2 }, // 8x16m (narrow, long)
	wide: { x: 2, y: 1, z: 1 },     // 16x8m (wide, shallow)
} as const;

// ============================================================================
// TYPES
// ============================================================================

/** Snap point connection types */
export type SnapPointType =
	| "floor_edge"      // Flat edge for walkways/bridges
	| "wall_doorway"    // Opening in wall
	| "ramp_top"        // Top of ramp/stairs
	| "ramp_bottom"     // Bottom of ramp/stairs
	| "connector"       // Generic connection
	| "water_edge";     // Edge touching water

/** Direction a snap point faces */
export type SnapDirection = "north" | "south" | "east" | "west" | "up" | "down";

/** Block categories for organization */
export type BlockCategory =
	// RTB categories
	| "rtb_shelter"
	| "rtb_market"
	| "rtb_equipment"
	| "rtb_garden"
	| "rtb_landing"
	| "rtb_transition"
	// SRB categories
	| "srb_corridor"
	| "srb_room_small"
	| "srb_room_large"
	| "srb_junction"
	// WTB categories
	| "wtb_bridge"
	| "wtb_dock"
	| "wtb_ferry_stop";

/** Faction affinity affects styling */
export type FactionAffinity =
	| "academy"
	| "syndicate"
	| "collective"
	| "drowned"
	| "neutral";

/** LOD level for production rendering */
export type LODLevel = 0 | 1 | 2 | 3;

// ============================================================================
// INTERFACES
// ============================================================================

/** Snap point definition */
export interface SnapPoint {
	id: string;
	type: SnapPointType;
	direction: SnapDirection;
	localPosition: { x: number; y: number; z: number };
	width: number;
	height?: number;
	required?: boolean;
	tags?: string[];
}

/** Block definition schema */
export interface BlockDefinition {
	typeId: string;
	name: string;
	category: BlockCategory;
	faction: FactionAffinity;
	gridSize: { x: number; y: number; z: number };
	dimensions: { width: number; height: number; depth: number };
	snapPoints: SnapPoint[];
	/** LOD configurations */
	lodLevels?: {
		[key in LODLevel]?: {
			distance: number;
			geometrySimplification: number;
		};
	};
	/** Instancing hints for repeated elements */
	instanceHints?: {
		repeatableElements: string[];
		mergeStatic: boolean;
	};
	debugColor?: { r: number; g: number; b: number };
	tags?: string[];
}

/** Placed block instance */
export interface BlockInstance {
	instanceId: string;
	definition: BlockDefinition;
	position: { x: number; y: number; z: number };
	rotation: 0 | 90 | 180 | 270;
	connections: Map<string, string>;
	seed: number;
	factionOverride?: FactionAffinity;
	currentLOD?: LODLevel;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Convert grid coordinates to world position */
export function gridToWorld(gridX: number, gridY: number, gridZ: number) {
	return {
		x: gridX * GRID_UNIT_SIZE,
		y: gridY * GRID_UNIT_SIZE,
		z: gridZ * GRID_UNIT_SIZE,
	};
}

/** Convert world position to grid coordinates */
export function worldToGrid(worldX: number, worldY: number, worldZ: number) {
	return {
		x: Math.floor(worldX / GRID_UNIT_SIZE),
		y: Math.floor(worldY / GRID_UNIT_SIZE),
		z: Math.floor(worldZ / GRID_UNIT_SIZE),
	};
}

/** Check if two snap points can connect */
export function canSnapConnect(a: SnapPoint, b: SnapPoint, tolerance = 0.5): boolean {
	const opposites: Record<SnapDirection, SnapDirection> = {
		north: "south", south: "north",
		east: "west", west: "east",
		up: "down", down: "up",
	};

	if (opposites[a.direction] !== b.direction) return false;

	const compatibleTypes: Record<SnapPointType, SnapPointType[]> = {
		floor_edge: ["floor_edge", "connector"],
		wall_doorway: ["wall_doorway", "connector"],
		ramp_top: ["floor_edge"],
		ramp_bottom: ["floor_edge"],
		connector: ["floor_edge", "wall_doorway", "connector"],
		water_edge: ["water_edge", "connector"],
	};

	if (!compatibleTypes[a.type].includes(b.type)) return false;
	if (Math.abs(a.width - b.width) > tolerance) return false;

	return true;
}

/** Seeded random number generator */
export function createSeededRandom(seed: number) {
	let state = seed;

	return {
		next(): number {
			state = (state * 1103515245 + 12345) & 0x7fffffff;
			return state / 0x7fffffff;
		},
		nextInt(min: number, max: number): number {
			return Math.floor(this.next() * (max - min + 1)) + min;
		},
		pick<T>(array: T[]): T {
			return array[Math.floor(this.next() * array.length)];
		},
		shuffle<T>(array: T[]): T[] {
			const result = [...array];
			for (let i = result.length - 1; i > 0; i--) {
				const j = Math.floor(this.next() * (i + 1));
				[result[i], result[j]] = [result[j], result[i]];
			}
			return result;
		},
	};
}

/** Select block from pool based on seed and position */
export function selectBlockFromPool(
	pool: BlockDefinition[],
	seed: number,
	gridX: number,
	gridZ: number
): BlockDefinition | undefined {
	if (pool.length === 0) return undefined;
	const locationSeed = seed ^ (gridX * 73856093) ^ (gridZ * 19349663);
	const rng = createSeededRandom(locationSeed);
	return rng.pick(pool);
}
