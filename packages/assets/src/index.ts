/**
 * Shared Game Assets
 *
 * This package provides typed asset paths and manifests for all Neo-Tokyo apps.
 * Assets are stored here and imported by game, playground, mobile, and web apps.
 *
 * Usage:
 *   import { TEXTURES, MATERIALS } from '@neo-tokyo/assets';
 *   const concreteColor = TEXTURES.materials.Concrete004.Color;
 */

// ============================================================================
// TEXTURE TYPES
// ============================================================================

export type PBRMapType = "Color" | "NormalGL" | "Roughness" | "AmbientOcclusion" | "Displacement";

export interface PBRTextureSet {
	Color: string;
	NormalGL: string;
	Roughness: string;
	AmbientOcclusion?: string;
	Displacement?: string;
}

export interface DecalTextureSet {
	Color: string;
	NormalGL: string;
	Roughness: string;
	Opacity: string;
	Displacement?: string;
}

// ============================================================================
// MATERIAL CATALOG
// ============================================================================

/** Available PBR materials from AmbientCG */
export const MATERIAL_NAMES = [
	// Concrete
	"Concrete004", "Concrete015", "Concrete022", "Concrete034",
	// Brick
	"Bricks001", "Bricks010", "Bricks024", "Bricks037",
	// Metal
	"Metal001", "Metal006", "Metal012", "Metal034",
	// Rust
	"Rust001", "Rust004",
	// Asphalt
	"Asphalt001", "Asphalt010",
	// Tiles
	"Tiles001", "Tiles074",
	// Flooded World specific
	"CorrugatedSteel001", "CorrugatedSteel003", "CorrugatedSteel005",
	"PaintedWood001", "PaintedWood003", "PaintedWood005",
	"Fabric001", "Fabric003", "Fabric006",
	"RoofingTiles001", "RoofingTiles006",
] as const;

export type MaterialName = typeof MATERIAL_NAMES[number];

/** Available decal materials */
export const DECAL_NAMES = [
	"Leaking001", "Leaking002", "Leaking003", "Leaking004", "Leaking005",
	"AsphaltDamage001",
] as const;

export type DecalName = typeof DECAL_NAMES[number];

// ============================================================================
// PATH CONFIGURATION
// ============================================================================

/**
 * Runtime base path for texture URLs.
 * This should be set by the consuming app to match their public folder structure.
 *
 * Default assumes textures are served from /assets/textures/ambientcg/
 *
 * Usage in consuming app:
 *   import { setTextureBasePath } from '@neo-tokyo/assets';
 *   setTextureBasePath('/assets/textures/ambientcg'); // Match your public folder
 */
let TEXTURE_BASE_PATH = "/assets/textures/ambientcg";

/** Configure the runtime texture base path */
export function setTextureBasePath(basePath: string): void {
	TEXTURE_BASE_PATH = basePath.replace(/\/$/, ""); // Remove trailing slash
}

/** Get the current texture base path */
export function getTextureBasePath(): string {
	return TEXTURE_BASE_PATH;
}

// ============================================================================
// PATH HELPERS
// ============================================================================

/** Get runtime URL for a material texture */
export function getMaterialTexturePath(
	material: MaterialName,
	map: PBRMapType
): string {
	return `${TEXTURE_BASE_PATH}/materials/${material}/${material}_1K-JPG_${map}.jpg`;
}

/** Get runtime URL for a decal texture */
export function getDecalTexturePath(
	decal: DecalName,
	map: PBRMapType | "Opacity"
): string {
	return `${TEXTURE_BASE_PATH}/decals/${decal}/${decal}_1K-JPG_${map}.jpg`;
}

/** Get full PBR texture set for a material */
export function getMaterialTextureSet(material: MaterialName): PBRTextureSet {
	return {
		Color: getMaterialTexturePath(material, "Color"),
		NormalGL: getMaterialTexturePath(material, "NormalGL"),
		Roughness: getMaterialTexturePath(material, "Roughness"),
		AmbientOcclusion: getMaterialTexturePath(material, "AmbientOcclusion"),
		Displacement: getMaterialTexturePath(material, "Displacement"),
	};
}

/** Get full decal texture set */
export function getDecalTextureSet(decal: DecalName): DecalTextureSet {
	return {
		Color: getDecalTexturePath(decal, "Color"),
		NormalGL: getDecalTexturePath(decal, "NormalGL"),
		Roughness: getDecalTexturePath(decal, "Roughness"),
		Opacity: getDecalTexturePath(decal, "Opacity"),
		Displacement: getDecalTexturePath(decal, "Displacement"),
	};
}

// ============================================================================
// TEXTURE SET BUILDERS
// ============================================================================

/** Get all material texture sets (regenerates paths on each call to use current base path) */
export function getAllMaterialTextureSets(): Record<MaterialName, PBRTextureSet> {
	return Object.fromEntries(
		MATERIAL_NAMES.map(name => [name, getMaterialTextureSet(name)])
	) as Record<MaterialName, PBRTextureSet>;
}

/** Get all decal texture sets (regenerates paths on each call to use current base path) */
export function getAllDecalTextureSets(): Record<DecalName, DecalTextureSet> {
	return Object.fromEntries(
		DECAL_NAMES.map(name => [name, getDecalTextureSet(name)])
	) as Record<DecalName, DecalTextureSet>;
}

// ============================================================================
// BABYLON.JS HELPERS
// ============================================================================

/**
 * Babylon.js PBR material texture configuration.
 * Use with scene.createMaterial() or manually assign to PBRMaterial.
 */
export interface BabylonPBRConfig {
	albedoTextureUrl: string;
	bumpTextureUrl: string;
	metallicTextureUrl: string;
	ambientTextureUrl?: string;
}

/** Get Babylon.js-ready texture URLs for a material */
export function getBabylonTextureConfig(material: MaterialName): BabylonPBRConfig {
	return {
		albedoTextureUrl: getMaterialTexturePath(material, "Color"),
		bumpTextureUrl: getMaterialTexturePath(material, "NormalGL"),
		metallicTextureUrl: getMaterialTexturePath(material, "Roughness"),
		ambientTextureUrl: getMaterialTexturePath(material, "AmbientOcclusion"),
	};
}

// ============================================================================
// CATEGORY GROUPS
// ============================================================================

/** Materials grouped by category for easy selection */
export const MATERIAL_CATEGORIES = {
	concrete: ["Concrete004", "Concrete015", "Concrete022", "Concrete034"] as MaterialName[],
	brick: ["Bricks001", "Bricks010", "Bricks024", "Bricks037"] as MaterialName[],
	metal: ["Metal001", "Metal006", "Metal012", "Metal034"] as MaterialName[],
	rust: ["Rust001", "Rust004"] as MaterialName[],
	asphalt: ["Asphalt001", "Asphalt010"] as MaterialName[],
	tiles: ["Tiles001", "Tiles074"] as MaterialName[],
	corrugatedSteel: ["CorrugatedSteel001", "CorrugatedSteel003", "CorrugatedSteel005"] as MaterialName[],
	paintedWood: ["PaintedWood001", "PaintedWood003", "PaintedWood005"] as MaterialName[],
	fabric: ["Fabric001", "Fabric003", "Fabric006"] as MaterialName[],
	roofingTiles: ["RoofingTiles001", "RoofingTiles006"] as MaterialName[],
} as const;

/** Weathering decals */
export const WEATHERING_DECALS = {
	leaking: ["Leaking001", "Leaking002", "Leaking003", "Leaking004", "Leaking005"] as DecalName[],
	damage: ["AsphaltDamage001"] as DecalName[],
} as const;
