/**
 * RTB (Rooftop Territory Block) Definitions
 *
 * These are the "RMB blocks" of Neo-Tokyo - pre-defined rooftop configurations
 * that snap together to form explorable territories.
 *
 * Each RTB is collision-tested and has defined snap points at edges.
 */

import {
	type BlockDefinition,
	type SnapPoint,
	GRID_UNIT_SIZE,
	registerBlock,
} from "./Block";

// ============================================================================
// HELPER: Create standard edge snap points for a block
// ============================================================================

function createEdgeSnapPoints(
	width: number,
	depth: number,
	height: number = 0
): SnapPoint[] {
	const halfW = width / 2;
	const halfD = depth / 2;

	return [
		// North edge (front, -Z)
		{
			id: "edge_north",
			type: "floor_edge",
			direction: "north",
			localPosition: { x: 0, y: height, z: -halfD },
			width: width,
		},
		// South edge (back, +Z)
		{
			id: "edge_south",
			type: "floor_edge",
			direction: "south",
			localPosition: { x: 0, y: height, z: halfD },
			width: width,
		},
		// East edge (right, +X)
		{
			id: "edge_east",
			type: "floor_edge",
			direction: "east",
			localPosition: { x: halfW, y: height, z: 0 },
			width: depth,
		},
		// West edge (left, -X)
		{
			id: "edge_west",
			type: "floor_edge",
			direction: "west",
			localPosition: { x: -halfW, y: height, z: 0 },
			width: depth,
		},
	];
}

// ============================================================================
// RTB_SHELTER: Small shelter blocks
// ============================================================================

export const RTB_SHELTER_LEAN_TO: BlockDefinition = {
	typeId: "rtb_shelter_lean_to",
	name: "Lean-To Shelter",
	category: "rtb_shelter",
	faction: "collective",
	gridSize: { x: 1, y: 1, z: 1 },
	dimensions: { width: GRID_UNIT_SIZE, height: 3, depth: GRID_UNIT_SIZE },
	snapPoints: [
		...createEdgeSnapPoints(GRID_UNIT_SIZE, GRID_UNIT_SIZE),
		// Doorway on south side
		{
			id: "door_south",
			type: "wall_doorway",
			direction: "south",
			localPosition: { x: 0, y: 0, z: GRID_UNIT_SIZE / 2 },
			width: 1.5,
			height: 2.2,
			tags: ["entrance"],
		},
	],
	debugColor: { r: 0.2, g: 0.6, b: 0.3 },
	tags: ["small", "cheap", "temporary"],
};

export const RTB_SHELTER_SHACK: BlockDefinition = {
	typeId: "rtb_shelter_shack",
	name: "Salvage Shack",
	category: "rtb_shelter",
	faction: "collective",
	gridSize: { x: 1, y: 1, z: 1 },
	dimensions: { width: GRID_UNIT_SIZE, height: 3.5, depth: GRID_UNIT_SIZE },
	snapPoints: [
		...createEdgeSnapPoints(GRID_UNIT_SIZE, GRID_UNIT_SIZE),
		{
			id: "door_south",
			type: "wall_doorway",
			direction: "south",
			localPosition: { x: -1.5, y: 0, z: GRID_UNIT_SIZE / 2 },
			width: 1.2,
			height: 2,
			tags: ["entrance"],
		},
	],
	debugColor: { r: 0.4, g: 0.4, b: 0.3 },
	tags: ["small", "enclosed", "storage"],
};

export const RTB_SHELTER_BOOTH: BlockDefinition = {
	typeId: "rtb_shelter_booth",
	name: "Vendor Booth",
	category: "rtb_shelter",
	faction: "syndicate",
	gridSize: { x: 1, y: 1, z: 1 },
	dimensions: { width: GRID_UNIT_SIZE, height: 2.8, depth: GRID_UNIT_SIZE },
	snapPoints: [
		...createEdgeSnapPoints(GRID_UNIT_SIZE, GRID_UNIT_SIZE),
		{
			id: "counter_north",
			type: "connector",
			direction: "north",
			localPosition: { x: 0, y: 1, z: -GRID_UNIT_SIZE / 2 },
			width: 3,
			height: 0.8,
			tags: ["service", "counter"],
		},
	],
	debugColor: { r: 0.8, g: 0.2, b: 0.5 },
	tags: ["commercial", "open_front", "neon"],
};

// ============================================================================
// RTB_MARKET: Market/trading area blocks
// ============================================================================

export const RTB_MARKET_STALLS: BlockDefinition = {
	typeId: "rtb_market_stalls",
	name: "Market Stall Row",
	category: "rtb_market",
	faction: "collective",
	gridSize: { x: 2, y: 1, z: 1 },
	dimensions: { width: GRID_UNIT_SIZE * 2, height: 3, depth: GRID_UNIT_SIZE },
	snapPoints: [
		...createEdgeSnapPoints(GRID_UNIT_SIZE * 2, GRID_UNIT_SIZE),
	],
	debugColor: { r: 0.6, g: 0.5, b: 0.2 },
	tags: ["commercial", "open", "busy"],
};

export const RTB_MARKET_SQUARE: BlockDefinition = {
	typeId: "rtb_market_square",
	name: "Market Square",
	category: "rtb_market",
	faction: "neutral",
	gridSize: { x: 2, y: 1, z: 2 },
	dimensions: { width: GRID_UNIT_SIZE * 2, height: 0.2, depth: GRID_UNIT_SIZE * 2 },
	snapPoints: [
		// North edge (16m wide)
		{
			id: "edge_north",
			type: "floor_edge",
			direction: "north",
			localPosition: { x: 0, y: 0, z: -GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE * 2,
		},
		// South edge
		{
			id: "edge_south",
			type: "floor_edge",
			direction: "south",
			localPosition: { x: 0, y: 0, z: GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE * 2,
		},
		// East edge
		{
			id: "edge_east",
			type: "floor_edge",
			direction: "east",
			localPosition: { x: GRID_UNIT_SIZE, y: 0, z: 0 },
			width: GRID_UNIT_SIZE * 2,
		},
		// West edge
		{
			id: "edge_west",
			type: "floor_edge",
			direction: "west",
			localPosition: { x: -GRID_UNIT_SIZE, y: 0, z: 0 },
			width: GRID_UNIT_SIZE * 2,
		},
	],
	debugColor: { r: 0.5, g: 0.5, b: 0.5 },
	tags: ["open", "central", "gathering"],
};

// ============================================================================
// RTB_EQUIPMENT: Rooftop equipment blocks
// ============================================================================

export const RTB_EQUIPMENT_SOLAR: BlockDefinition = {
	typeId: "rtb_equipment_solar",
	name: "Solar Panel Array",
	category: "rtb_equipment",
	faction: "academy",
	gridSize: { x: 1, y: 1, z: 1 },
	dimensions: { width: GRID_UNIT_SIZE, height: 1.5, depth: GRID_UNIT_SIZE },
	snapPoints: createEdgeSnapPoints(GRID_UNIT_SIZE, GRID_UNIT_SIZE),
	debugColor: { r: 0.1, g: 0.2, b: 0.4 },
	tags: ["power", "technology", "valuable"],
};

export const RTB_EQUIPMENT_TANKS: BlockDefinition = {
	typeId: "rtb_equipment_tanks",
	name: "Water Storage Tanks",
	category: "rtb_equipment",
	faction: "collective",
	gridSize: { x: 1, y: 1, z: 1 },
	dimensions: { width: GRID_UNIT_SIZE, height: 4, depth: GRID_UNIT_SIZE },
	snapPoints: createEdgeSnapPoints(GRID_UNIT_SIZE, GRID_UNIT_SIZE),
	debugColor: { r: 0.3, g: 0.3, b: 0.5 },
	tags: ["water", "storage", "essential"],
};

// ============================================================================
// RTB_TRANSITION: Level change blocks (ramps!)
// ============================================================================

export const RTB_TRANSITION_RAMP: BlockDefinition = {
	typeId: "rtb_transition_ramp",
	name: "Access Ramp",
	category: "rtb_transition",
	faction: "neutral",
	gridSize: { x: 1, y: 1, z: 2 },
	dimensions: { width: GRID_UNIT_SIZE, height: GRID_UNIT_SIZE, depth: GRID_UNIT_SIZE * 2 },
	snapPoints: [
		// Bottom connection (floor level)
		{
			id: "ramp_bottom",
			type: "ramp_bottom",
			direction: "south",
			localPosition: { x: 0, y: 0, z: GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE - 1, // Slightly narrower for lips
		},
		// Top connection (elevated floor)
		{
			id: "ramp_top",
			type: "ramp_top",
			direction: "north",
			localPosition: { x: 0, y: GRID_UNIT_SIZE, z: -GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE - 1,
		},
		// Side edges (blocked by lips)
		{
			id: "edge_east",
			type: "floor_edge",
			direction: "east",
			localPosition: { x: GRID_UNIT_SIZE / 2, y: GRID_UNIT_SIZE / 2, z: 0 },
			width: GRID_UNIT_SIZE * 2,
			tags: ["blocked"], // Can't connect here - ramp lip blocks it
		},
		{
			id: "edge_west",
			type: "floor_edge",
			direction: "west",
			localPosition: { x: -GRID_UNIT_SIZE / 2, y: GRID_UNIT_SIZE / 2, z: 0 },
			width: GRID_UNIT_SIZE * 2,
			tags: ["blocked"],
		},
	],
	debugColor: { r: 0.6, g: 0.4, b: 0.2 },
	tags: ["vertical", "access", "essential"],
};

// ============================================================================
// RTB_LANDING: Ferry/dock blocks
// ============================================================================

export const RTB_LANDING_DOCK: BlockDefinition = {
	typeId: "rtb_landing_dock",
	name: "Small Dock",
	category: "rtb_landing",
	faction: "collective",
	gridSize: { x: 1, y: 1, z: 2 },
	dimensions: { width: GRID_UNIT_SIZE, height: 0.5, depth: GRID_UNIT_SIZE * 2 },
	snapPoints: [
		// Land side connection
		{
			id: "edge_north",
			type: "floor_edge",
			direction: "north",
			localPosition: { x: 0, y: 0, z: -GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE,
			required: true,
			tags: ["land_access"],
		},
		// Water side
		{
			id: "water_south",
			type: "water_edge",
			direction: "south",
			localPosition: { x: 0, y: 0, z: GRID_UNIT_SIZE },
			width: GRID_UNIT_SIZE,
			tags: ["boat_mooring"],
		},
		// Side edges
		{
			id: "edge_east",
			type: "floor_edge",
			direction: "east",
			localPosition: { x: GRID_UNIT_SIZE / 2, y: 0, z: 0 },
			width: GRID_UNIT_SIZE * 2,
		},
		{
			id: "edge_west",
			type: "floor_edge",
			direction: "west",
			localPosition: { x: -GRID_UNIT_SIZE / 2, y: 0, z: 0 },
			width: GRID_UNIT_SIZE * 2,
		},
	],
	debugColor: { r: 0.2, g: 0.4, b: 0.6 },
	tags: ["water_access", "transport", "public"],
};

// ============================================================================
// REGISTER ALL BLOCKS
// ============================================================================

export function registerAllRTBBlocks(): void {
	// Shelters
	registerBlock(RTB_SHELTER_LEAN_TO);
	registerBlock(RTB_SHELTER_SHACK);
	registerBlock(RTB_SHELTER_BOOTH);

	// Markets
	registerBlock(RTB_MARKET_STALLS);
	registerBlock(RTB_MARKET_SQUARE);

	// Equipment
	registerBlock(RTB_EQUIPMENT_SOLAR);
	registerBlock(RTB_EQUIPMENT_TANKS);

	// Transitions
	registerBlock(RTB_TRANSITION_RAMP);

	// Landings
	registerBlock(RTB_LANDING_DOCK);
}

// Auto-register on import
registerAllRTBBlocks();

// Export individual blocks for direct use
export const RTB_BLOCKS = {
	shelter: {
		leanTo: RTB_SHELTER_LEAN_TO,
		shack: RTB_SHELTER_SHACK,
		booth: RTB_SHELTER_BOOTH,
	},
	market: {
		stalls: RTB_MARKET_STALLS,
		square: RTB_MARKET_SQUARE,
	},
	equipment: {
		solar: RTB_EQUIPMENT_SOLAR,
		tanks: RTB_EQUIPMENT_TANKS,
	},
	transition: {
		ramp: RTB_TRANSITION_RAMP,
	},
	landing: {
		dock: RTB_LANDING_DOCK,
	},
};
