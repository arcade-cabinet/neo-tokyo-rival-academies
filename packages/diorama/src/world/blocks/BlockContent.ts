/**
 * BlockContent - Rules-based component spawning for blocks
 *
 * This is the CRITICAL missing piece: defining WHAT components spawn
 * inside each block type, based on rules rather than manual placement.
 *
 * Daggerfall approach: each RMB block has pre-defined building placements,
 * but the buildings themselves are selected from pools based on location seed.
 *
 * Neo-Tokyo approach: each RTB block has content RULES that determine:
 * - Base structure (floor, walls, roof)
 * - Props (furniture, equipment, clutter)
 * - Decoration (signs, posters, vegetation)
 * - Faction-specific variations
 */

import { type Color3, Vector3 } from "@babylonjs/core";
import type { BlockCategory, BlockDefinition, FactionAffinity } from "./Block";
import { createSeededRandom } from "./Block";

// ============================================================================
// PLACEMENT RULES
// ============================================================================

/**
 * Where a component can be placed within a block
 */
export type PlacementZone =
	| "center" // Center of block
	| "edge_north" // Along north edge
	| "edge_south" // Along south edge
	| "edge_east" // Along east edge
	| "edge_west" // Along west edge
	| "corner_ne" // Northeast corner
	| "corner_nw" // Northwest corner
	| "corner_se" // Southeast corner
	| "corner_sw" // Southwest corner
	| "perimeter" // Any edge
	| "interior" // Not touching edges
	| "wall_north" // On north wall surface
	| "wall_south" // On south wall surface
	| "wall_east" // On east wall surface
	| "wall_west" // On west wall surface
	| "roof" // On top surface
	| "scattered"; // Random positions throughout

/**
 * Component spawn rule
 */
export interface ComponentSpawnRule {
	/** Component type name (matches export name from components/index.ts) */
	component: string;
	/** Min/max count to spawn [min, max] */
	count: [number, number];
	/** Where to place within block */
	placement: PlacementZone;
	/** Props to pass to component (can include functions of seed) */
	props?: Record<string, unknown>;
	/** Probability this rule triggers (0-1, default 1) */
	probability?: number;
	/** Required faction (only spawn if block has this faction) */
	factionRequired?: FactionAffinity;
	/** Excluded factions (don't spawn if block has these factions) */
	factionExcluded?: FactionAffinity[];
	/** Required tags on block */
	tagsRequired?: string[];
	/** Spacing between multiple instances */
	spacing?: number;
	/** Y offset from block base */
	yOffset?: number;
	/** Rotation mode */
	rotation?: "fixed" | "random" | "face_center" | "face_out";
}

/**
 * Block content definition - all rules for populating a block type
 */
export interface BlockContentDefinition {
	/** Block category this applies to */
	category: BlockCategory;
	/** Optional specific block typeId (if omitted, applies to whole category) */
	blockTypeId?: string;

	/** Base structure components (floor, walls, roof) */
	structure: {
		floor?: {
			component: string;
			props?: Record<string, unknown>;
		};
		walls?: Array<{
			side: "north" | "south" | "east" | "west";
			component: string;
			props?: Record<string, unknown>;
			/** If true, wall has opening (door/window) */
			hasOpening?: boolean;
		}>;
		roof?: {
			component: string;
			props?: Record<string, unknown>;
		};
	};

	/** Props - furniture, equipment, clutter */
	props: ComponentSpawnRule[];

	/** Decoration - signs, posters, vegetation */
	decoration: ComponentSpawnRule[];

	/** Lighting components */
	lighting: ComponentSpawnRule[];

	/** Faction-specific overrides */
	factionVariants?: Partial<
		Record<
			FactionAffinity,
			{
				props?: ComponentSpawnRule[];
				decoration?: ComponentSpawnRule[];
				colorScheme?: {
					primary: Color3;
					secondary: Color3;
					accent: Color3;
				};
			}
		>
	>;
}

// ============================================================================
// CONTENT DEFINITIONS
// ============================================================================

/**
 * RTB_SHELTER content rules
 */
export const CONTENT_RTB_SHELTER: BlockContentDefinition = {
	category: "rtb_shelter",
	structure: {
		floor: {
			component: "Floor",
			props: { surface: "concrete", edgeTrim: true },
		},
		walls: [
			{
				side: "north",
				component: "TexturedWall",
				props: { textureType: "metal_corrugated" },
			},
			{
				side: "east",
				component: "TexturedWall",
				props: { textureType: "metal_corrugated" },
			},
			{
				side: "west",
				component: "TexturedWall",
				props: { textureType: "metal_corrugated" },
			},
			// South is open (entrance)
		],
		roof: {
			component: "Roof",
			props: { style: "industrial" },
		},
	},
	props: [
		{
			component: "Crate",
			count: [1, 3],
			placement: "corner_nw",
			props: { type: "wooden", size: "medium" },
		},
		{
			component: "Barrel",
			count: [0, 2],
			placement: "corner_ne",
			props: { type: "metal" },
			probability: 0.7,
		},
		{
			component: "Tarp",
			count: [0, 1],
			placement: "interior",
			props: { type: "flat", state: "draped" },
			probability: 0.5,
		},
	],
	decoration: [
		{
			component: "Poster",
			count: [1, 3],
			placement: "wall_north",
			props: { type: "advertisement", condition: "torn" },
		},
		{
			component: "Graffiti",
			count: [0, 2],
			placement: "wall_east",
			probability: 0.4,
		},
	],
	lighting: [
		{
			component: "Lantern",
			count: [1, 1],
			placement: "roof",
			props: { type: "industrial", isLit: true },
			yOffset: -0.5,
		},
	],
	factionVariants: {
		collective: {
			decoration: [
				{
					component: "Vine",
					count: [1, 2],
					placement: "wall_north",
					props: { type: "ivy", growth: "moderate" },
				},
			],
		},
		syndicate: {
			decoration: [
				{
					component: "NeonSign",
					count: [1, 1],
					placement: "wall_north",
					props: { shape: "bar" },
				},
			],
		},
	},
};

/**
 * RTB_MARKET content rules
 */
export const CONTENT_RTB_MARKET: BlockContentDefinition = {
	category: "rtb_market",
	structure: {
		floor: {
			component: "Floor",
			props: { surface: "tile", edgeTrim: true },
		},
	},
	props: [
		{
			component: "VendingMachine",
			count: [1, 3],
			placement: "perimeter",
			props: { type: "drinks", powered: true },
			spacing: 2,
		},
		{
			component: "Bench",
			count: [2, 4],
			placement: "scattered",
			props: { style: "modern" },
			spacing: 3,
		},
		{
			component: "TrashCan",
			count: [1, 2],
			placement: "corner_ne",
			props: { style: "municipal" },
		},
		{
			component: "Planter",
			count: [0, 3],
			placement: "perimeter",
			props: { style: "rectangular" },
			probability: 0.6,
		},
		{
			component: "Umbrella",
			count: [1, 4],
			placement: "scattered",
			props: { type: "patio", state: "open" },
			spacing: 4,
		},
	],
	decoration: [
		{
			component: "Billboard",
			count: [0, 1],
			placement: "edge_north",
			props: { type: "street", size: "medium" },
			probability: 0.5,
		},
		{
			component: "Poster",
			count: [2, 5],
			placement: "scattered",
			props: { type: "advertisement" },
		},
		{
			component: "Flagpole",
			count: [0, 2],
			placement: "corner_nw",
			props: { type: "banner" },
			probability: 0.4,
		},
	],
	lighting: [
		{
			component: "StreetLight",
			count: [2, 4],
			placement: "perimeter",
			props: { style: "modern", state: "on" },
			spacing: 6,
		},
		{
			component: "Lantern",
			count: [2, 6],
			placement: "scattered",
			props: { type: "paper", isLit: true },
			factionRequired: "collective",
		},
	],
};

/**
 * RTB_EQUIPMENT content rules
 */
export const CONTENT_RTB_EQUIPMENT: BlockContentDefinition = {
	category: "rtb_equipment",
	structure: {
		floor: {
			component: "Floor",
			props: { surface: "metal_grating" },
		},
	},
	props: [
		{
			component: "ACUnit",
			count: [1, 3],
			placement: "center",
			props: { size: "large" },
			spacing: 3,
		},
		{
			component: "WaterTank",
			count: [0, 2],
			placement: "corner_nw",
			props: { type: "rooftop" },
			probability: 0.7,
		},
		{
			component: "Generator",
			count: [0, 1],
			placement: "corner_se",
			props: { type: "diesel" },
			probability: 0.5,
		},
		{
			component: "Pipe",
			count: [2, 5],
			placement: "perimeter",
			props: { material: "metal", size: "medium" },
		},
		{
			component: "Vent",
			count: [1, 3],
			placement: "scattered",
			props: { type: "exhaust", state: "running" },
		},
		{
			component: "SolarPanel",
			count: [0, 4],
			placement: "roof",
			props: { type: "residential" },
			factionRequired: "academy",
		},
	],
	decoration: [
		{
			component: "TrafficSign",
			count: [1, 2],
			placement: "edge_south",
			props: { type: "warning" },
		},
	],
	lighting: [
		{
			component: "StreetLight",
			count: [1, 2],
			placement: "corner_ne",
			props: { style: "industrial" },
		},
	],
};

/**
 * RTB_LANDING (dock) content rules
 */
export const CONTENT_RTB_LANDING: BlockContentDefinition = {
	category: "rtb_landing",
	structure: {
		floor: {
			component: "Floor",
			props: { surface: "wood_planks" },
		},
	},
	props: [
		{
			component: "Bollard",
			count: [2, 4],
			placement: "perimeter",
			props: { type: "steel" },
			spacing: 2,
		},
		{
			component: "Rope",
			count: [1, 3],
			placement: "edge_south",
			props: { type: "hemp" },
		},
		{
			component: "Anchor",
			count: [0, 1],
			placement: "corner_sw",
			props: { type: "decorative", state: "stowed" },
			probability: 0.3,
		},
		{
			component: "FishingNet",
			count: [0, 2],
			placement: "edge_east",
			props: { type: "decorative", state: "drying" },
			probability: 0.5,
		},
		{
			component: "Crate",
			count: [1, 4],
			placement: "edge_north",
			props: { type: "wooden", size: "small" },
		},
		{
			component: "Barrel",
			count: [0, 2],
			placement: "corner_ne",
			props: { type: "wooden", content: "fish" },
		},
	],
	decoration: [
		{
			component: "Buoy",
			count: [1, 2],
			placement: "edge_south",
			props: { type: "marker" },
			yOffset: -1, // Below dock level
		},
		{
			component: "Lantern",
			count: [1, 2],
			placement: "corner_nw",
			props: { type: "nautical", isLit: true },
		},
	],
	lighting: [
		{
			component: "Lamppost",
			count: [1, 1],
			placement: "center",
			props: { style: "industrial" },
		},
	],
};

// ============================================================================
// CONTENT REGISTRY
// ============================================================================

/**
 * Registry of all content definitions
 */
export const BLOCK_CONTENT_REGISTRY: Map<
	BlockCategory,
	BlockContentDefinition[]
> = new Map();

/**
 * Register a content definition
 */
export function registerBlockContent(content: BlockContentDefinition): void {
	const existing = BLOCK_CONTENT_REGISTRY.get(content.category) || [];
	existing.push(content);
	BLOCK_CONTENT_REGISTRY.set(content.category, existing);
}

/**
 * Get content definition for a block
 */
export function getBlockContent(
	definition: BlockDefinition,
): BlockContentDefinition | undefined {
	const categoryContents = BLOCK_CONTENT_REGISTRY.get(definition.category);
	if (!categoryContents) return undefined;

	// Try to find specific match first
	const specific = categoryContents.find(
		(c) => c.blockTypeId === definition.typeId,
	);
	if (specific) return specific;

	// Fall back to category-wide content
	return categoryContents.find((c) => !c.blockTypeId);
}

// Track if registration has been done
let contentRegistered = false;

/**
 * Register all built-in block content definitions
 * Call this once at app startup
 */
export function registerAllBlockContent(): void {
	if (contentRegistered) return;
	contentRegistered = true;

	registerBlockContent(CONTENT_RTB_SHELTER);
	registerBlockContent(CONTENT_RTB_MARKET);
	registerBlockContent(CONTENT_RTB_EQUIPMENT);
	registerBlockContent(CONTENT_RTB_LANDING);

	console.log(
		"[BlockContent] Registered content for",
		BLOCK_CONTENT_REGISTRY.size,
		"categories",
	);
}

// ============================================================================
// SPAWN POSITION CALCULATOR
// ============================================================================

/**
 * Calculate spawn positions for a rule within block bounds
 */
export function calculateSpawnPositions(
	rule: ComponentSpawnRule,
	blockDimensions: { width: number; height: number; depth: number },
	blockPosition: Vector3,
	seed: number,
): Vector3[] {
	const rng = createSeededRandom(seed);
	const positions: Vector3[] = [];

	// Determine count
	const count = rng.nextInt(rule.count[0], rule.count[1]);
	if (count === 0) return positions;

	// Check probability
	if (rule.probability !== undefined && rng.next() > rule.probability) {
		return positions;
	}

	const halfW = blockDimensions.width / 2;
	const halfD = blockDimensions.depth / 2;
	const yOffset = rule.yOffset || 0;
	const spacing = rule.spacing || 1;

	// Generate positions based on placement zone
	const generatePosition = (index: number): Vector3 => {
		let x = 0;
		let z = 0;

		switch (rule.placement) {
			case "center":
				x = (rng.next() - 0.5) * spacing * index;
				z = (rng.next() - 0.5) * spacing * index;
				break;

			case "edge_north":
				x = (rng.next() - 0.5) * (blockDimensions.width - 1);
				z = -halfD + 0.5;
				break;

			case "edge_south":
				x = (rng.next() - 0.5) * (blockDimensions.width - 1);
				z = halfD - 0.5;
				break;

			case "edge_east":
				x = halfW - 0.5;
				z = (rng.next() - 0.5) * (blockDimensions.depth - 1);
				break;

			case "edge_west":
				x = -halfW + 0.5;
				z = (rng.next() - 0.5) * (blockDimensions.depth - 1);
				break;

			case "corner_ne":
				x = halfW - 1 - rng.next();
				z = -halfD + 1 + rng.next();
				break;

			case "corner_nw":
				x = -halfW + 1 + rng.next();
				z = -halfD + 1 + rng.next();
				break;

			case "corner_se":
				x = halfW - 1 - rng.next();
				z = halfD - 1 - rng.next();
				break;

			case "corner_sw":
				x = -halfW + 1 + rng.next();
				z = halfD - 1 - rng.next();
				break;

			case "perimeter": {
				// Pick random edge
				const edge = rng.nextInt(0, 3);
				const t = rng.next();
				if (edge === 0) {
					x = t * blockDimensions.width - halfW;
					z = -halfD + 0.5;
				} else if (edge === 1) {
					x = t * blockDimensions.width - halfW;
					z = halfD - 0.5;
				} else if (edge === 2) {
					x = -halfW + 0.5;
					z = t * blockDimensions.depth - halfD;
				} else {
					x = halfW - 0.5;
					z = t * blockDimensions.depth - halfD;
				}
				break;
			}

			case "interior":
				x = (rng.next() - 0.5) * (blockDimensions.width - 2);
				z = (rng.next() - 0.5) * (blockDimensions.depth - 2);
				break;

			case "scattered":
				x = (rng.next() - 0.5) * (blockDimensions.width - 1);
				z = (rng.next() - 0.5) * (blockDimensions.depth - 1);
				break;

			case "wall_north":
			case "wall_south":
			case "wall_east":
			case "wall_west":
				// Wall positions handled by structure, use interior fallback
				x = (rng.next() - 0.5) * (blockDimensions.width - 2);
				z = (rng.next() - 0.5) * (blockDimensions.depth - 2);
				break;

			case "roof":
				x = (rng.next() - 0.5) * (blockDimensions.width - 1);
				z = (rng.next() - 0.5) * (blockDimensions.depth - 1);
				break;
		}

		return new Vector3(
			blockPosition.x + x,
			blockPosition.y + yOffset,
			blockPosition.z + z,
		);
	};

	// Generate positions with spacing enforcement
	for (let i = 0; i < count; i++) {
		let pos: Vector3;
		let attempts = 0;
		const maxAttempts = 10;

		do {
			pos = generatePosition(i);
			attempts++;

			// Check spacing from existing positions
			const tooClose = positions.some(
				(existing) => Vector3.Distance(pos, existing) < spacing,
			);

			if (!tooClose || attempts >= maxAttempts) {
				positions.push(pos);
				break;
			}
		} while (attempts < maxAttempts);
	}

	return positions;
}

/**
 * Generate all component spawns for a block instance
 */
export interface ComponentSpawn {
	component: string;
	position: Vector3;
	rotation: number;
	props: Record<string, unknown>;
	seed: number;
}

export function generateBlockContent(
	definition: BlockDefinition,
	position: Vector3,
	rotation: number,
	seed: number,
	factionOverride?: FactionAffinity,
): ComponentSpawn[] {
	const content = getBlockContent(definition);
	if (!content) return [];

	const spawns: ComponentSpawn[] = [];
	const rng = createSeededRandom(seed);
	const faction = factionOverride || definition.faction;

	// Helper to process spawn rules
	const processRules = (rules: ComponentSpawnRule[]) => {
		for (const rule of rules) {
			// Check faction requirements
			if (rule.factionRequired && rule.factionRequired !== faction) continue;
			if (rule.factionExcluded?.includes(faction)) continue;

			// Calculate positions
			const positions = calculateSpawnPositions(
				rule,
				definition.dimensions,
				position,
				seed + spawns.length,
			);

			// Create spawns
			for (const pos of positions) {
				let rot = rotation;
				if (rule.rotation === "random") rot = rng.next() * Math.PI * 2;
				else if (rule.rotation === "face_center") {
					rot = Math.atan2(position.z - pos.z, position.x - pos.x);
				} else if (rule.rotation === "face_out") {
					rot = Math.atan2(pos.z - position.z, pos.x - position.x);
				}

				spawns.push({
					component: rule.component,
					position: pos,
					rotation: rot,
					props: { ...rule.props },
					seed: rng.nextInt(0, 999999),
				});
			}
		}
	};

	// Process all rule categories
	processRules(content.props);
	processRules(content.decoration);
	processRules(content.lighting);

	// Apply faction variants
	const factionVariant = content.factionVariants?.[faction];
	if (factionVariant) {
		if (factionVariant.props) processRules(factionVariant.props);
		if (factionVariant.decoration) processRules(factionVariant.decoration);
	}

	return spawns;
}
