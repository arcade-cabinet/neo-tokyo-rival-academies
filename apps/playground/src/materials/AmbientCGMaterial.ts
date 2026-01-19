/**
 * AmbientCGMaterial - Full PBR material loader for AmbientCG assets
 *
 * BRIDGING DAGGERFALL TO MODERN:
 * - Daggerfall (1996): Simple tiled textures on flat polygons
 * - Modern (2026): Full PBR with Color, Normal, Roughness, Displacement, AO, Metalness
 *
 * This loader handles the complete AmbientCG PBR workflow:
 * 1. Color (Albedo) - base color texture
 * 2. Normal (GL format) - surface detail without geometry
 * 3. Roughness - microsurface scattering
 * 4. Displacement - parallax occlusion mapping for depth
 * 5. AmbientOcclusion - baked shadow detail
 * 6. Metalness - for metal materials
 *
 * Assets located at: ~/assets/AmbientCG/Assets/MATERIAL/1K-JPG/
 */

import {
	PBRMaterial,
	Texture,
	type Scene,
	type Nullable,
} from "@babylonjs/core";

// ============================================================================
// AMBIENTCG MATERIAL CATALOG
// ============================================================================

/**
 * Material categories available from AmbientCG
 */
export type MaterialCategory =
	| "concrete"    // Concrete012, Concrete015, etc.
	| "metal"       // Metal055C, CorrugatedSteel006B
	| "brick"       // Bricks050, Bricks057, Bricks068
	| "tiles"       // Tiles041, Tiles046, Tiles079
	| "wood"        // Wood052, Wood055, WoodFloor013
	| "ground"      // Ground043, Ground044, Ground088
	| "rock"        // Rock018, Rock027
	| "planks"      // Planks031B
	| "foam"        // Foam003
	| "fabric"      // Fabric063
	| "rope"        // Rope003
	| "ice";        // Ice002

/**
 * Known materials in our AmbientCG collection
 */
export const AMBIENTCG_MATERIALS = {
	// Concrete - perfect for rooftops and walls
	concrete: {
		Concrete012: "Concrete012",
		Concrete015: "Concrete015",
	},

	// Metal - cyberpunk industrial
	metal: {
		Metal055C: "Metal055C",
		CorrugatedSteel006B: "CorrugatedSteel006B",
	},

	// Brick - building facades
	brick: {
		Bricks050: "Bricks050",
		Bricks057: "Bricks057",
		Bricks068: "Bricks068",
	},

	// Tiles - rooftop surfaces, walkways
	tiles: {
		Tiles041: "Tiles041",
		Tiles046: "Tiles046",
		Tiles079: "Tiles079",
	},

	// Wood - docks, platforms, shelters
	wood: {
		Wood052: "Wood052",
		Wood055: "Wood055",
		WoodFloor013: "WoodFloor013",
		Planks031B: "Planks031B",
	},

	// Ground - terrain
	ground: {
		Ground043: "Ground043",
		Ground044: "Ground044",
		Ground088: "Ground088",
	},

	// Rock - natural features
	rock: {
		Rock018: "Rock018",
		Rock027: "Rock027",
	},

	// Special
	misc: {
		Ice002: "Ice002",
		Foam003: "Foam003",
		Fabric063: "Fabric063",
		Rope003: "Rope003",
	},
} as const;

/**
 * Base path for AmbientCG assets
 * In production, these would be copied to public/assets
 */
export const AMBIENTCG_BASE_PATH = "/assets/ambientcg";

// ============================================================================
// MATERIAL LOADER
// ============================================================================

export interface AmbientCGMaterialOptions {
	/** Material ID from AMBIENTCG_MATERIALS */
	materialId: string;
	/** UV tiling scale */
	uvScale?: { u: number; v: number };
	/** Enable parallax occlusion mapping (uses displacement) */
	parallax?: boolean;
	/** Parallax depth (0.01 - 0.1 typical) */
	parallaxDepth?: number;
	/** Override metallic value (for non-metallic materials) */
	metallic?: number;
	/** Override roughness multiplier */
	roughnessMultiplier?: number;
	/** Enable AO if available */
	useAO?: boolean;
}

/**
 * Map of PBR texture types to their file suffixes
 */
const TEXTURE_SUFFIXES = {
	color: "Color.jpg",
	normalGL: "NormalGL.jpg",
	normalDX: "NormalDX.jpg",
	roughness: "Roughness.jpg",
	displacement: "Displacement.jpg",
	ao: "AmbientOcclusion.jpg",
	metalness: "Metalness.jpg",
} as const;

/**
 * Create a full PBR material from AmbientCG assets
 */
export function createAmbientCGMaterial(
	name: string,
	scene: Scene,
	options: AmbientCGMaterialOptions
): PBRMaterial {
	const {
		materialId,
		uvScale = { u: 1, v: 1 },
		parallax = false,
		parallaxDepth = 0.02,
		metallic = 0,
		roughnessMultiplier = 1,
		useAO = true,
	} = options;

	// Construct path: /assets/ambientcg/MaterialName/MaterialName_1K-JPG_*.jpg
	const basePath = `${AMBIENTCG_BASE_PATH}/${materialId}`;
	const prefix = `${materialId}_1K-JPG_`;

	const material = new PBRMaterial(name, scene);

	// Helper to load texture with UV scaling
	const loadTexture = (suffix: string): Nullable<Texture> => {
		try {
			const tex = new Texture(
				`${basePath}/${prefix}${suffix}`,
				scene,
				undefined,
				undefined,
				undefined,
				undefined,
				(message) => {
					// Silently ignore missing textures (not all materials have all maps)
					console.debug(`Optional texture not found: ${suffix}`);
				}
			);
			tex.uScale = uvScale.u;
			tex.vScale = uvScale.v;
			return tex;
		} catch {
			return null;
		}
	};

	// === ALBEDO (Color) ===
	const colorTex = loadTexture(TEXTURE_SUFFIXES.color);
	if (colorTex) {
		material.albedoTexture = colorTex;
	}

	// === NORMAL MAP (use GL format for Babylon.js) ===
	const normalTex = loadTexture(TEXTURE_SUFFIXES.normalGL);
	if (normalTex) {
		material.bumpTexture = normalTex;
		material.invertNormalMapX = false;
		material.invertNormalMapY = false;
	}

	// === ROUGHNESS ===
	const roughnessTex = loadTexture(TEXTURE_SUFFIXES.roughness);
	if (roughnessTex) {
		// In Babylon.js PBR, roughness can come from metallicTexture's green channel
		// OR we can use microSurfaceTexture
		material.microSurfaceTexture = roughnessTex;
		material.useMicroSurfaceFromReflectivityMapAlpha = false;
	}

	// === METALLIC ===
	material.metallic = metallic;
	material.roughness = roughnessMultiplier;

	// Try to load metalness texture if this is a metal material
	const metalnessTex = loadTexture(TEXTURE_SUFFIXES.metalness);
	if (metalnessTex) {
		material.metallicTexture = metalnessTex;
		material.useMetallnessFromMetallicTextureBlue = true;
	}

	// === AMBIENT OCCLUSION ===
	if (useAO) {
		const aoTex = loadTexture(TEXTURE_SUFFIXES.ao);
		if (aoTex) {
			material.ambientTexture = aoTex;
		}
	}

	// === PARALLAX OCCLUSION MAPPING ===
	if (parallax) {
		const dispTex = loadTexture(TEXTURE_SUFFIXES.displacement);
		if (dispTex) {
			// Babylon.js uses the bump texture for parallax
			// We need to combine normal and height
			material.useParallax = true;
			material.useParallaxOcclusion = true;

			// Parallax settings
			const parallaxScale = parallaxDepth;
			material.parallaxScaleBias = parallaxScale;
		}
	}

	// === ENVIRONMENT (set later by scene environment) ===
	// material.reflectionTexture will be set by HDRIEnvironment

	return material;
}

// ============================================================================
// PRESET MATERIAL FACTORIES
// ============================================================================

/**
 * Create a concrete material (rooftops, walls)
 */
export function createConcreteMaterial(
	name: string,
	scene: Scene,
	variant: keyof typeof AMBIENTCG_MATERIALS.concrete = "Concrete012",
	uvScale = { u: 1, v: 1 }
): PBRMaterial {
	return createAmbientCGMaterial(name, scene, {
		materialId: AMBIENTCG_MATERIALS.concrete[variant],
		uvScale,
		metallic: 0,
		roughnessMultiplier: 1,
	});
}

/**
 * Create a corrugated steel material (industrial shelters)
 */
export function createCorrugatedSteelMaterial(
	name: string,
	scene: Scene,
	uvScale = { u: 1, v: 1 }
): PBRMaterial {
	return createAmbientCGMaterial(name, scene, {
		materialId: AMBIENTCG_MATERIALS.metal.CorrugatedSteel006B,
		uvScale,
		metallic: 0.9,
		roughnessMultiplier: 0.6,
	});
}

/**
 * Create a wood plank material (docks, bridges, platforms)
 */
export function createWoodPlankMaterial(
	name: string,
	scene: Scene,
	variant: keyof typeof AMBIENTCG_MATERIALS.wood = "Planks031B",
	uvScale = { u: 1, v: 1 }
): PBRMaterial {
	return createAmbientCGMaterial(name, scene, {
		materialId: AMBIENTCG_MATERIALS.wood[variant],
		uvScale,
		metallic: 0,
		roughnessMultiplier: 1,
	});
}

/**
 * Create a brick material (building facades)
 */
export function createBrickMaterial(
	name: string,
	scene: Scene,
	variant: keyof typeof AMBIENTCG_MATERIALS.brick = "Bricks050",
	uvScale = { u: 1, v: 1 }
): PBRMaterial {
	return createAmbientCGMaterial(name, scene, {
		materialId: AMBIENTCG_MATERIALS.brick[variant],
		uvScale,
		metallic: 0,
		roughnessMultiplier: 1,
		parallax: true,
		parallaxDepth: 0.015,
	});
}

/**
 * Create a tile material (rooftop walkways)
 */
export function createTileMaterial(
	name: string,
	scene: Scene,
	variant: keyof typeof AMBIENTCG_MATERIALS.tiles = "Tiles041",
	uvScale = { u: 1, v: 1 }
): PBRMaterial {
	return createAmbientCGMaterial(name, scene, {
		materialId: AMBIENTCG_MATERIALS.tiles[variant],
		uvScale,
		metallic: 0,
		roughnessMultiplier: 0.8,
	});
}
