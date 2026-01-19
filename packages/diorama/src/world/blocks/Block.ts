/**
 * Block System - Daggerfall-inspired modular architecture
 *
 * KEY CONCEPTS FROM DAGGERFALL:
 * 1. Blocks are fixed-size, pre-tested units that snap together
 * 2. Each block has defined "snap points" at edges where connections occur
 * 3. Block selection is deterministic via seed → category → specific block
 * 4. Blocks form a grid system (Daggerfall: 64x64 RMB units)
 *
 * NEO-TOKYO ADAPTATION:
 * - RTB (Rooftop Territory Block) = our "RMB" (exterior city blocks)
 * - SRB (Submerged Ruin Block) = our "RDB" (dungeon/interior blocks)
 * - WTB (Waterway Transit Block) = connections between rooftops
 *
 * Grid unit: 8m x 8m (allows 2-3 shelters per block edge)
 */

import type { Color3, Vector3 } from "@babylonjs/core";

// ============================================================================
// SNAP POINT SYSTEM
// ============================================================================

/**
 * Snap point types define how blocks connect
 */
export type SnapPointType =
	| "floor_edge" // Flat edge, connects to walkways/bridges
	| "wall_doorway" // Opening in wall, connects to adjacent rooms
	| "ramp_top" // Top of ramp, connects to floor hole
	| "ramp_bottom" // Bottom of ramp, connects to floor surface
	| "connector" // Generic connection point
	| "water_edge"; // Edge touches water, for docks/piers

/**
 * Direction a snap point faces (for matching)
 */
export type SnapDirection = "north" | "south" | "east" | "west" | "up" | "down";

/**
 * A snap point is a connection interface on a block
 */
export interface SnapPoint {
	/** Unique ID within the block */
	id: string;
	/** Type of connection */
	type: SnapPointType;
	/** Direction the snap faces (outward from block) */
	direction: SnapDirection;
	/** Position relative to block origin (center base) */
	localPosition: { x: number; y: number; z: number };
	/** Width of the connection area */
	width: number;
	/** Height of the connection area (0 for floor edges) */
	height?: number;
	/** Whether this snap point is required to be connected */
	required?: boolean;
	/** Tags for semantic matching (e.g., "public", "private", "service") */
	tags?: string[];
}

/**
 * Check if two snap points can connect
 * - Opposite directions (north↔south, east↔west, up↔down)
 * - Matching types (floor_edge↔floor_edge, doorway↔doorway)
 * - Similar widths (within tolerance)
 */
export function canSnapConnect(
	a: SnapPoint,
	b: SnapPoint,
	tolerance = 0.5,
): boolean {
	// Check opposite directions
	const opposites: Record<SnapDirection, SnapDirection> = {
		north: "south",
		south: "north",
		east: "west",
		west: "east",
		up: "down",
		down: "up",
	};

	if (opposites[a.direction] !== b.direction) return false;

	// Check compatible types
	const compatibleTypes: Record<SnapPointType, SnapPointType[]> = {
		floor_edge: ["floor_edge", "connector"],
		wall_doorway: ["wall_doorway", "connector"],
		ramp_top: ["floor_edge"], // Ramp top connects to floor with hole
		ramp_bottom: ["floor_edge"],
		connector: ["floor_edge", "wall_doorway", "connector"],
		water_edge: ["water_edge", "connector"],
	};

	if (!compatibleTypes[a.type].includes(b.type)) return false;

	// Check width compatibility
	if (Math.abs(a.width - b.width) > tolerance) return false;

	return true;
}

// ============================================================================
// BLOCK DEFINITION
// ============================================================================

/**
 * Block category for organization and selection
 */
export type BlockCategory =
	// RTB categories (rooftop exteriors)
	| "rtb_shelter" // Small shelter structure
	| "rtb_market" // Market stalls/trading area
	| "rtb_equipment" // AC units, solar panels, tanks
	| "rtb_garden" // Aquafarm, growing area
	| "rtb_landing" // Ferry/boat landing zone
	| "rtb_transition" // Ramps, stairs between levels

	// SRB categories (submerged interiors)
	| "srb_corridor" // Hallway connector
	| "srb_room_small" // Small interior room
	| "srb_room_large" // Large interior room
	| "srb_junction" // Multi-way intersection

	// WTB categories (water transit)
	| "wtb_bridge" // Fixed bridge connection
	| "wtb_dock" // Boat docking point
	| "wtb_ferry_stop"; // Ferry boarding area

/**
 * Faction affinity affects textures, colors, props
 */
export type FactionAffinity =
	| "academy" // Clean, orderly, blues/whites
	| "syndicate" // Neon, flashy, magentas/cyans
	| "collective" // Practical, recycled, greens/oranges
	| "drowned" // Organic, decayed, teals/purples
	| "neutral"; // Mixed, generic

/**
 * Block definition - the schema for a block type
 */
export interface BlockDefinition {
	/** Unique block type ID */
	typeId: string;
	/** Human-readable name */
	name: string;
	/** Category for selection pools */
	category: BlockCategory;
	/** Default faction affinity */
	faction: FactionAffinity;

	/** Block dimensions in grid units (8m = 1 unit) */
	gridSize: { x: number; y: number; z: number };
	/** Actual dimensions in meters */
	dimensions: { width: number; height: number; depth: number };

	/** All snap points on this block */
	snapPoints: SnapPoint[];

	/** Preview color for debug visualization */
	debugColor?: { r: number; g: number; b: number };

	/** Tags for filtering/search */
	tags?: string[];
}

/**
 * Block instance - a placed block in the world
 */
export interface BlockInstance {
	/** Instance ID */
	instanceId: string;
	/** Block type definition */
	definition: BlockDefinition;
	/** World position (block center at base) */
	position: { x: number; y: number; z: number };
	/** Rotation (0, 90, 180, 270 degrees) */
	rotation: 0 | 90 | 180 | 270;
	/** Connected snap points (snapId → connected block instance ID) */
	connections: Map<string, string>;
	/** Seed for internal procedural details */
	seed: number;
	/** Override faction for this instance */
	factionOverride?: FactionAffinity;
}

// ============================================================================
// GRID SYSTEM
// ============================================================================

/**
 * Grid constants (Daggerfall used 64x64 units per RMB)
 * We use 8m as our base unit for rooftop blocks
 */
export const GRID_UNIT_SIZE = 8; // meters

/**
 * Standard block sizes in grid units
 */
export const STANDARD_BLOCK_SIZES = {
	small: { x: 1, y: 1, z: 1 }, // 8x8m footprint
	medium: { x: 2, y: 1, z: 2 }, // 16x16m footprint
	large: { x: 3, y: 1, z: 3 }, // 24x24m footprint
	corridor: { x: 1, y: 1, z: 2 }, // 8x16m (narrow, long)
	wide: { x: 2, y: 1, z: 1 }, // 16x8m (wide, shallow)
} as const;

/**
 * Convert grid coordinates to world position
 */
export function gridToWorld(
	gridX: number,
	gridY: number,
	gridZ: number,
): { x: number; y: number; z: number } {
	return {
		x: gridX * GRID_UNIT_SIZE,
		y: gridY * GRID_UNIT_SIZE,
		z: gridZ * GRID_UNIT_SIZE,
	};
}

/**
 * Convert world position to grid coordinates
 */
export function worldToGrid(
	worldX: number,
	worldY: number,
	worldZ: number,
): { x: number; y: number; z: number } {
	return {
		x: Math.floor(worldX / GRID_UNIT_SIZE),
		y: Math.floor(worldY / GRID_UNIT_SIZE),
		z: Math.floor(worldZ / GRID_UNIT_SIZE),
	};
}

// ============================================================================
// SEEDED SELECTION
// ============================================================================

/**
 * Seeded random number generator (same seed = same sequence)
 */
export function createSeededRandom(seed: number) {
	let state = seed;

	return {
		/** Get next random float 0-1 */
		next(): number {
			state = (state * 1103515245 + 12345) & 0x7fffffff;
			return state / 0x7fffffff;
		},
		/** Get random int in range [min, max] */
		nextInt(min: number, max: number): number {
			return Math.floor(this.next() * (max - min + 1)) + min;
		},
		/** Pick random item from array */
		pick<T>(array: T[]): T {
			return array[Math.floor(this.next() * array.length)];
		},
		/** Shuffle array (returns new array) */
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

/**
 * Select a block from a pool based on seed and position
 * This is how Daggerfall picks buildings - deterministic per location
 */
export function selectBlockFromPool(
	pool: BlockDefinition[],
	seed: number,
	gridX: number,
	gridZ: number,
): BlockDefinition {
	// Combine seed with position for location-specific selection
	const locationSeed = seed ^ (gridX * 73856093) ^ (gridZ * 19349663);
	const rng = createSeededRandom(locationSeed);
	return rng.pick(pool);
}

// ============================================================================
// BLOCK POOLS (will be populated with actual definitions)
// ============================================================================

/**
 * Block pool organized by category
 */
export const BLOCK_POOLS: Partial<Record<BlockCategory, BlockDefinition[]>> = {
	// These will be populated as we create actual block definitions
};

/**
 * Register a block definition to its category pool
 */
export function registerBlock(definition: BlockDefinition): void {
	if (!BLOCK_POOLS[definition.category]) {
		BLOCK_POOLS[definition.category] = [];
	}
	BLOCK_POOLS[definition.category]!.push(definition);
}

/**
 * Get all blocks in a category
 */
export function getBlockPool(category: BlockCategory): BlockDefinition[] {
	return BLOCK_POOLS[category] ?? [];
}
