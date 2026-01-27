/**
 * Shelter Block - Production RTB block for survival shelters
 *
 * PROMOTED FROM: playground/src/components/Tarp.tsx, TentStructure.tsx
 * VALIDATION: See /docs/legacy/react/COMPONENT_PROMOTION.md
 *
 * Shelter blocks represent makeshift living spaces on rooftops.
 * They snap to floor edges and can connect to equipment blocks.
 */

import type { BlockDefinition, SnapPoint } from "../BlockSystem";
import { GRID_UNIT_SIZE, STANDARD_BLOCK_SIZES } from "../BlockSystem";

// ============================================================================
// SNAP POINT CONFIGURATIONS
// ============================================================================

/** Standard shelter snap points (small block) */
const SHELTER_SNAP_POINTS_SMALL: SnapPoint[] = [
	// North edge - can connect to walkway
	{
		id: "north_edge",
		type: "floor_edge",
		direction: "north",
		localPosition: { x: 0, y: 0, z: GRID_UNIT_SIZE / 2 },
		width: GRID_UNIT_SIZE,
		tags: ["public", "entry"],
	},
	// South edge - back connection
	{
		id: "south_edge",
		type: "floor_edge",
		direction: "south",
		localPosition: { x: 0, y: 0, z: -GRID_UNIT_SIZE / 2 },
		width: GRID_UNIT_SIZE,
		tags: ["private"],
	},
	// East edge
	{
		id: "east_edge",
		type: "floor_edge",
		direction: "east",
		localPosition: { x: GRID_UNIT_SIZE / 2, y: 0, z: 0 },
		width: GRID_UNIT_SIZE,
	},
	// West edge
	{
		id: "west_edge",
		type: "floor_edge",
		direction: "west",
		localPosition: { x: -GRID_UNIT_SIZE / 2, y: 0, z: 0 },
		width: GRID_UNIT_SIZE,
	},
];

// ============================================================================
// BLOCK DEFINITIONS
// ============================================================================

/**
 * Tarp Shelter - Simple tarp-covered area
 * Cheapest, most common shelter type
 */
export const SHELTER_TARP: BlockDefinition = {
	typeId: "rtb_shelter_tarp",
	name: "Tarp Shelter",
	category: "rtb_shelter",
	faction: "neutral",
	gridSize: STANDARD_BLOCK_SIZES.small,
	dimensions: {
		width: GRID_UNIT_SIZE,
		height: 2.5,
		depth: GRID_UNIT_SIZE,
	},
	snapPoints: SHELTER_SNAP_POINTS_SMALL,
	lodLevels: {
		0: { distance: 0, geometrySimplification: 1.0 },
		1: { distance: 30, geometrySimplification: 0.5 },
		2: { distance: 60, geometrySimplification: 0.25 },
		3: { distance: 100, geometrySimplification: 0.1 },
	},
	instanceHints: {
		repeatableElements: ["tarp_pole", "rope"],
		mergeStatic: true,
	},
	debugColor: { r: 0.4, g: 0.6, b: 0.3 },
	tags: ["shelter", "cheap", "temporary"],
};

/**
 * Tent Structure - More permanent tent shelter
 */
export const SHELTER_TENT: BlockDefinition = {
	typeId: "rtb_shelter_tent",
	name: "Tent Structure",
	category: "rtb_shelter",
	faction: "neutral",
	gridSize: STANDARD_BLOCK_SIZES.small,
	dimensions: {
		width: GRID_UNIT_SIZE,
		height: 3,
		depth: GRID_UNIT_SIZE,
	},
	snapPoints: SHELTER_SNAP_POINTS_SMALL,
	lodLevels: {
		0: { distance: 0, geometrySimplification: 1.0 },
		1: { distance: 30, geometrySimplification: 0.5 },
		2: { distance: 60, geometrySimplification: 0.25 },
		3: { distance: 100, geometrySimplification: 0.1 },
	},
	instanceHints: {
		repeatableElements: ["tent_pole", "guy_line"],
		mergeStatic: true,
	},
	debugColor: { r: 0.5, g: 0.5, b: 0.4 },
	tags: ["shelter", "semi-permanent"],
};

/**
 * Container Shelter - Converted shipping container
 * Most durable shelter type
 */
export const SHELTER_CONTAINER: BlockDefinition = {
	typeId: "rtb_shelter_container",
	name: "Container Shelter",
	category: "rtb_shelter",
	faction: "collective",
	gridSize: { x: 1, y: 1, z: 2 }, // Containers are longer
	dimensions: {
		width: GRID_UNIT_SIZE,
		height: 2.6,
		depth: GRID_UNIT_SIZE * 2,
	},
	snapPoints: [
		// Entry on one end
		{
			id: "entry",
			type: "wall_doorway",
			direction: "north",
			localPosition: { x: 0, y: 0, z: GRID_UNIT_SIZE },
			width: 2,
			height: 2.2,
			tags: ["entry", "secure"],
		},
		// Floor edges on sides
		{
			id: "east_edge",
			type: "floor_edge",
			direction: "east",
			localPosition: { x: GRID_UNIT_SIZE / 2, y: 0, z: 0 },
			width: GRID_UNIT_SIZE * 2,
		},
		{
			id: "west_edge",
			type: "floor_edge",
			direction: "west",
			localPosition: { x: -GRID_UNIT_SIZE / 2, y: 0, z: 0 },
			width: GRID_UNIT_SIZE * 2,
		},
	],
	lodLevels: {
		0: { distance: 0, geometrySimplification: 1.0 },
		1: { distance: 40, geometrySimplification: 0.6 },
		2: { distance: 80, geometrySimplification: 0.3 },
	},
	instanceHints: {
		repeatableElements: [],
		mergeStatic: true,
	},
	debugColor: { r: 0.6, g: 0.4, b: 0.3 },
	tags: ["shelter", "permanent", "secure", "metal"],
};

/**
 * Platform Shelter - Elevated platform with covering
 * Good for waterline-adjacent locations
 */
export const SHELTER_PLATFORM: BlockDefinition = {
	typeId: "rtb_shelter_platform",
	name: "Platform Dwelling",
	category: "rtb_shelter",
	faction: "drowned",
	gridSize: STANDARD_BLOCK_SIZES.medium,
	dimensions: {
		width: GRID_UNIT_SIZE * 2,
		height: 4,
		depth: GRID_UNIT_SIZE * 2,
	},
	snapPoints: [
		// All four edges for maximum connectivity
		{
			id: "north_edge",
			type: "floor_edge",
			direction: "north",
			localPosition: { x: 0, y: 1, z: GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE * 2,
			tags: ["elevated"],
		},
		{
			id: "south_edge",
			type: "floor_edge",
			direction: "south",
			localPosition: { x: 0, y: 1, z: -GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE * 2,
			tags: ["elevated"],
		},
		{
			id: "east_edge",
			type: "floor_edge",
			direction: "east",
			localPosition: { x: GRID_UNIT_SIZE, y: 1, z: 0 },
			width: GRID_UNIT_SIZE * 2,
			tags: ["elevated"],
		},
		{
			id: "west_edge",
			type: "floor_edge",
			direction: "west",
			localPosition: { x: -GRID_UNIT_SIZE, y: 1, z: 0 },
			width: GRID_UNIT_SIZE * 2,
			tags: ["elevated"],
		},
		// Ramp down to ground level
		{
			id: "ramp_down",
			type: "ramp_top",
			direction: "south",
			localPosition: { x: 0, y: 1, z: -GRID_UNIT_SIZE + 1 },
			width: 2,
			tags: ["access"],
		},
	],
	lodLevels: {
		0: { distance: 0, geometrySimplification: 1.0 },
		1: { distance: 35, geometrySimplification: 0.5 },
		2: { distance: 70, geometrySimplification: 0.25 },
	},
	instanceHints: {
		repeatableElements: ["support_post", "railing"],
		mergeStatic: false, // Platform needs to stay separate for water interaction
	},
	debugColor: { r: 0.3, g: 0.5, b: 0.5 },
	tags: ["shelter", "elevated", "water-adjacent"],
};

// ============================================================================
// EXPORTS
// ============================================================================

/** All shelter block definitions */
export const SHELTER_BLOCKS: BlockDefinition[] = [
	SHELTER_TARP,
	SHELTER_TENT,
	SHELTER_CONTAINER,
	SHELTER_PLATFORM,
];
