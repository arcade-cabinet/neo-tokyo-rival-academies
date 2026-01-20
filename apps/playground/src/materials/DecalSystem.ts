/**
 * DecalSystem - Projective decals for weathering and damage
 *
 * BRIDGING DAGGERFALL TO MODERN:
 * - Daggerfall (1996): No decals, just tiled textures
 * - Modern (2026): Decals overlay detail (water stains, graffiti, damage)
 *
 * This provides:
 * 1. Water leak/stain decals (flooded world theming)
 * 2. Manhole covers (rooftop details)
 * 3. Road lines and markings
 * 4. Graffiti and damage overlays
 *
 * Assets located at: ~/assets/AmbientCG/Assets/DECAL/1K-JPG/
 *
 * Decal assets include:
 * - Color map
 * - Opacity map (alpha mask!)
 * - Normal map
 * - Roughness map
 */

import {
	MeshBuilder,
	PBRMaterial,
	Texture,
	Vector3,
	type AbstractMesh,
	type Scene,
	type Nullable,
	StandardMaterial,
	Color3,
} from "@babylonjs/core";

// ============================================================================
// AMBIENTCG DECAL CATALOG
// ============================================================================

/**
 * Decal categories
 */
export type DecalCategory =
	| "leaking"     // Water stains, leaks - PERFECT for flooded world
	| "manhole"     // Manhole covers - rooftop infrastructure
	| "roadlines"   // Road markings
	| "door"        // Door decals
	| "gum"         // Chewing gum (gross urban detail)
	| "edge";       // Paving edges

/**
 * Known decals in our AmbientCG collection
 */
export const AMBIENTCG_DECALS = {
	// Water leaks and stains - essential for flooded world
	leaking: {
		Leaking002: "Leaking002",
		Leaking003: "Leaking003",
		Leaking004: "Leaking004",
		Leaking005: "Leaking005",
		Leaking010A: "Leaking010A",
		Leaking011A: "Leaking011A",
		Leaking011B: "Leaking011B",
		Leaking011C: "Leaking011C",
	},

	// Manhole covers - rooftop access points
	manhole: {
		ManholeCover001: "ManholeCover001",
		ManholeCover004: "ManholeCover004",
		ManholeCover006: "ManholeCover006",
		ManholeCover007: "ManholeCover007",
		ManholeCover008: "ManholeCover008",
		ManholeCover009: "ManholeCover009",
	},

	// Road lines
	roadlines: {
		RoadLines001: "RoadLines001",
		RoadLines006: "RoadLines006",
		RoadLines007: "RoadLines007",
		RoadLines008: "RoadLines008",
		RoadLines009: "RoadLines009",
		RoadLines011: "RoadLines011",
		RoadLines012: "RoadLines012",
		RoadLines013: "RoadLines013",
		RoadLines014: "RoadLines014",
		RoadLines015: "RoadLines015",
		RoadLines016: "RoadLines016",
	},

	// Doors
	door: {
		Door002: "Door002",
	},

	// Urban grime
	gum: {
		ChewingGum002: "ChewingGum002",
	},

	// Edges
	edge: {
		PavingEdge001: "PavingEdge001",
	},
} as const;

/**
 * Base path for AmbientCG decal assets
 */
export const DECAL_BASE_PATH = "/assets/decals";

// ============================================================================
// DECAL TEXTURE SUFFIXES
// ============================================================================

const DECAL_SUFFIXES = {
	color: "Color.jpg",
	opacity: "Opacity.jpg",
	normalGL: "NormalGL.jpg",
	roughness: "Roughness.jpg",
	displacement: "Displacement.jpg",
} as const;

// ============================================================================
// DECAL PLACEMENT
// ============================================================================

export interface DecalOptions {
	/** Decal ID from AMBIENTCG_DECALS */
	decalId: string;
	/** Position in world space */
	position: Vector3;
	/** Size of the decal */
	size: { width: number; height: number };
	/** Rotation in radians (around Y axis for floor decals) */
	rotation?: number;
	/** Slight Y offset to prevent z-fighting */
	yOffset?: number;
	/** Opacity multiplier (0-1) */
	opacity?: number;
}

/**
 * Create a decal mesh with proper materials
 *
 * This creates a simple plane with alpha-blended textures.
 * For true projected decals on complex surfaces, use MeshBuilder.CreateDecal()
 */
export function createFloorDecal(
	name: string,
	scene: Scene,
	options: DecalOptions
): { mesh: AbstractMesh; dispose: () => void } {
	const {
		decalId,
		position,
		size,
		rotation = 0,
		yOffset = 0.01,
		opacity = 1,
	} = options;

	const basePath = `${DECAL_BASE_PATH}/${decalId}`;
	const prefix = `${decalId}_1K-JPG_`;

	// Create a ground plane for the decal
	const decalMesh = MeshBuilder.CreateGround(
		name,
		{ width: size.width, height: size.height },
		scene
	);

	decalMesh.position = position.clone();
	decalMesh.position.y += yOffset;
	decalMesh.rotation.y = rotation;

	// Create PBR material with alpha blending
	const decalMat = new PBRMaterial(`${name}_mat`, scene);

	// Load textures
	const colorTex = new Texture(
		`${basePath}/${prefix}${DECAL_SUFFIXES.color}`,
		scene
	);

	// Opacity texture is critical for decals!
	const opacityTex = new Texture(
		`${basePath}/${prefix}${DECAL_SUFFIXES.opacity}`,
		scene
	);

	// Normal map for surface detail
	let normalTex: Nullable<Texture> = null;
	try {
		normalTex = new Texture(
			`${basePath}/${prefix}${DECAL_SUFFIXES.normalGL}`,
			scene
		);
	} catch {
		// Normal map optional
	}

	// Configure material
	decalMat.albedoTexture = colorTex;
	decalMat.opacityTexture = opacityTex;

	if (normalTex) {
		decalMat.bumpTexture = normalTex;
	}

	// Alpha blending
	decalMat.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
	decalMat.alpha = opacity;

	// Non-metallic, slightly rough
	decalMat.metallic = 0;
	decalMat.roughness = 0.7;

	// Disable backface culling for decals
	decalMat.backFaceCulling = false;

	// Z-offset to prevent z-fighting
	decalMat.zOffset = -1;

	decalMesh.material = decalMat;

	return {
		mesh: decalMesh,
		dispose: () => {
			decalMesh.dispose();
			decalMat.dispose();
			colorTex.dispose();
			opacityTex.dispose();
			if (normalTex) normalTex.dispose();
		},
	};
}

/**
 * Create a projected decal onto a target mesh
 *
 * This uses Babylon's CreateDecal which properly wraps around geometry
 */
export function createProjectedDecal(
	name: string,
	scene: Scene,
	targetMesh: AbstractMesh,
	options: DecalOptions & { normal: Vector3 }
): { mesh: AbstractMesh; dispose: () => void } | null {
	const {
		decalId,
		position,
		size,
		normal,
		opacity = 1,
	} = options;

	const basePath = `${DECAL_BASE_PATH}/${decalId}`;
	const prefix = `${decalId}_1K-JPG_`;

	try {
		const decalMesh = MeshBuilder.CreateDecal(name, targetMesh, {
			position,
			normal,
			size: new Vector3(size.width, size.height, 1),
		});

		if (!decalMesh) {
			console.warn(`Failed to create decal: ${name}`);
			return null;
		}

		// Create material
		const decalMat = new StandardMaterial(`${name}_mat`, scene);

		const colorTex = new Texture(
			`${basePath}/${prefix}${DECAL_SUFFIXES.color}`,
			scene
		);
		const opacityTex = new Texture(
			`${basePath}/${prefix}${DECAL_SUFFIXES.opacity}`,
			scene
		);

		decalMat.diffuseTexture = colorTex;
		decalMat.opacityTexture = opacityTex;
		decalMat.alpha = opacity;
		decalMat.zOffset = -2;

		decalMesh.material = decalMat;

		return {
			mesh: decalMesh,
			dispose: () => {
				decalMesh.dispose();
				decalMat.dispose();
				colorTex.dispose();
				opacityTex.dispose();
			},
		};
	} catch (e) {
		console.warn(`Decal creation failed: ${e}`);
		return null;
	}
}

// ============================================================================
// PRESET DECAL FACTORIES
// ============================================================================

/**
 * Create a water leak/stain decal
 * Essential for flooded world atmosphere!
 */
export function createWaterStainDecal(
	name: string,
	scene: Scene,
	position: Vector3,
	size: number = 2,
	variant: keyof typeof AMBIENTCG_DECALS.leaking = "Leaking004"
): { mesh: AbstractMesh; dispose: () => void } {
	return createFloorDecal(name, scene, {
		decalId: AMBIENTCG_DECALS.leaking[variant],
		position,
		size: { width: size, height: size },
		rotation: Math.random() * Math.PI * 2, // Random rotation for variety
		opacity: 0.8,
	});
}

/**
 * Create a manhole cover decal
 */
export function createManholeDecal(
	name: string,
	scene: Scene,
	position: Vector3,
	size: number = 1.5,
	variant: keyof typeof AMBIENTCG_DECALS.manhole = "ManholeCover001"
): { mesh: AbstractMesh; dispose: () => void } {
	return createFloorDecal(name, scene, {
		decalId: AMBIENTCG_DECALS.manhole[variant],
		position,
		size: { width: size, height: size },
		rotation: 0,
		opacity: 1,
	});
}

/**
 * Create a road marking decal
 */
export function createRoadLineDecal(
	name: string,
	scene: Scene,
	position: Vector3,
	size: { width: number; length: number },
	rotation: number = 0,
	variant: keyof typeof AMBIENTCG_DECALS.roadlines = "RoadLines001"
): { mesh: AbstractMesh; dispose: () => void } {
	return createFloorDecal(name, scene, {
		decalId: AMBIENTCG_DECALS.roadlines[variant],
		position,
		size: { width: size.width, height: size.length },
		rotation,
		opacity: 0.9,
	});
}

// ============================================================================
// SEED-BASED DECAL SCATTERING
// ============================================================================

export interface ScatterOptions {
	/** Area bounds (world space) */
	bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
	/** Y position */
	y: number;
	/** Number of decals to scatter */
	count: number;
	/** Size range */
	sizeRange: { min: number; max: number };
	/** Decal variants to use */
	variants: string[];
	/** Opacity range */
	opacityRange?: { min: number; max: number };
}

/**
 * Scatter decals across an area using a seed for determinism
 */
export function scatterWaterStains(
	scene: Scene,
	seed: number,
	options: ScatterOptions
): { meshes: AbstractMesh[]; dispose: () => void } {
	const {
		bounds,
		y,
		count,
		sizeRange,
		variants,
		opacityRange = { min: 0.5, max: 0.9 },
	} = options;

	// Simple seeded random
	let state = seed;
	const random = () => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return state / 0x7fffffff;
	};

	const meshes: AbstractMesh[] = [];
	const disposers: (() => void)[] = [];

	for (let i = 0; i < count; i++) {
		const x = bounds.minX + random() * (bounds.maxX - bounds.minX);
		const z = bounds.minZ + random() * (bounds.maxZ - bounds.minZ);
		const size = sizeRange.min + random() * (sizeRange.max - sizeRange.min);
		const variant = variants[Math.floor(random() * variants.length)] as keyof typeof AMBIENTCG_DECALS.leaking;
		const opacity = opacityRange.min + random() * (opacityRange.max - opacityRange.min);

		const decal = createFloorDecal(`water_stain_${i}`, scene, {
			decalId: `Leaking${variant}`,
			position: new Vector3(x, y, z),
			size: { width: size, height: size },
			rotation: random() * Math.PI * 2,
			opacity,
		});

		meshes.push(decal.mesh);
		disposers.push(decal.dispose);
	}

	return {
		meshes,
		dispose: () => {
			for (const d of disposers) {
				d();
			}
		},
	};
}
