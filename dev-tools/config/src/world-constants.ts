/**
 * World Generation Constants
 *
 * Configuration for procedural world generation, districts, and hex grids.
 */

/**
 * Hex grid configuration
 */
export const HEX_GRID = {
	/** Base hex tile size */
	tileSize: 1.0,
	/** Default grid width (hexes) */
	defaultWidth: 10,
	/** Default grid depth (hexes) */
	defaultDepth: 8,
	/** Hex orientation (pointy-top or flat-top) */
	orientation: "pointy" as const,
} as const;

/**
 * District configuration
 */
export const DISTRICTS = {
	/** Total number of districts in Neo-Tokyo */
	count: 10,
	/** Strata (vertical layers) per district */
	strataCount: 3,
	/** Names for the 10 districts */
	names: [
		"Sector 0 - Central Core",
		"Sector 1 - Neon Slums",
		"Sector 2 - Corporate Heights",
		"Sector 3 - Underground Market",
		"Sector 4 - Academy District",
		"Sector 5 - Industrial Zone",
		"Sector 6 - Waterfront",
		"Sector 7 - Entertainment Strip",
		"Sector 8 - Residential Blocks",
		"Sector 9 - Outer Perimeter",
	] as const,
} as const;

/**
 * Camera configuration for isometric view
 */
export const CAMERA = {
	/** Default camera radius from target */
	defaultRadius: 30,
	/** Orthographic camera size */
	orthoSize: 21,
	/** Minimum zoom level */
	minOrthoSize: 10,
	/** Maximum zoom level */
	maxOrthoSize: 50,
	/** Camera elevation angle (degrees) */
	elevationAngle: 45,
	/** Camera rotation angle (degrees) for isometric view */
	rotationAngle: 45,
} as const;

/**
 * Background and parallax configuration
 */
export const BACKGROUND = {
	/** Number of parallax layers */
	parallaxLayers: 3,
	/** Far background distance */
	farDistance: 100,
	/** Near background distance */
	nearDistance: 10,
} as const;

/**
 * Tile types for procedural generation
 */
export const TILE_TYPES = [
	"base",
	"airvent",
	"pipes",
	"glass",
	"tarpaper",
	"grate",
] as const;

export type TileType = (typeof TILE_TYPES)[number];

/**
 * Tile spawn weights (must sum to 1.0)
 */
export const TILE_WEIGHTS: Record<TileType, number> = {
	base: 0.5,
	airvent: 0.15,
	pipes: 0.1,
	glass: 0.1,
	tarpaper: 0.08,
	grate: 0.07,
} as const;
