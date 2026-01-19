/**
 * HDRIEnvironment - Image-Based Lighting from AmbientCG HDRIs
 *
 * BRIDGING DAGGERFALL TO MODERN:
 * - Daggerfall (1996): Flat colored sky, no environment reflections
 * - Modern (2026): HDR environment maps for realistic lighting + reflections
 *
 * This provides:
 * 1. Skybox rendering (visual backdrop)
 * 2. Image-Based Lighting (IBL) for PBR materials
 * 3. Environment reflections on metallic/glossy surfaces
 *
 * Assets located at: ~/assets/AmbientCG/Assets/HDRI/1K/
 *
 * IMPORTANT: Babylon.js prefers .env files (pre-filtered) or .hdr
 * AmbientCG provides .exr files which need conversion via:
 * https://www.babylonjs.com/tools/ibl/
 *
 * For now we use the tonemapped .jpg as skybox and create a simple
 * environment from it. For production, convert EXR → .env
 */

import {
	Color3,
	CubeTexture,
	HDRCubeTexture,
	Texture,
	MeshBuilder,
	StandardMaterial,
	type Scene,
	type Nullable,
	BackgroundMaterial,
} from "@babylonjs/core";

// ============================================================================
// AMBIENTCG HDRI CATALOG
// ============================================================================

/**
 * HDRI categories for different moods/times
 */
export type HDRICategory =
	| "day"         // DaySkyHDRI*, DayEnvironmentHDRI*
	| "evening"     // EveningSkyHDRI*
	| "morning"     // MorningSkyHDRI*
	| "night"       // NightSkyHDRI*, NightEnvironmentHDRI*
	| "element";    // HDRIElement* (abstract/studio)

/**
 * Known HDRIs in our AmbientCG collection
 * These are selected for cyberpunk/flooded world atmosphere
 */
export const AMBIENTCG_HDRIS = {
	// Daytime - clear skies
	day: {
		DaySkyHDRI001B: "DaySkyHDRI001B",
		DaySkyHDRI007A: "DaySkyHDRI007A",
		DaySkyHDRI021A: "DaySkyHDRI021A",
		DaySkyHDRI041B: "DaySkyHDRI041B",
		DayEnvironmentHDRI049: "DayEnvironmentHDRI049",
		DayEnvironmentHDRI071: "DayEnvironmentHDRI071",
	},

	// Evening - golden hour, sunset
	evening: {
		EveningSkyHDRI010A: "EveningSkyHDRI010A",
		EveningSkyHDRI013A: "EveningSkyHDRI013A",
		EveningSkyHDRI024A: "EveningSkyHDRI024A",
		EveningSkyHDRI033B: "EveningSkyHDRI033B",
		EveningSkyHDRI035A: "EveningSkyHDRI035A",
		EveningSkyHDRI039B: "EveningSkyHDRI039B",
	},

	// Morning - dawn
	morning: {
		MorningSkyHDRI003A: "MorningSkyHDRI003A",
		MorningSkyHDRI005B: "MorningSkyHDRI005B",
		MorningSkyHDRI006B: "MorningSkyHDRI006B",
		MorningSkyHDRI009A: "MorningSkyHDRI009A",
	},

	// Night - cyberpunk atmosphere (dark with neon potential)
	night: {
		NightSkyHDRI001: "NightSkyHDRI001",
		NightSkyHDRI006: "NightSkyHDRI006",
		NightSkyHDRI007: "NightSkyHDRI007",
		NightSkyHDRI008: "NightSkyHDRI008",
		NightSkyHDRI009: "NightSkyHDRI009",
		NightEnvironmentHDRI002: "NightEnvironmentHDRI002",
		NightEnvironmentHDRI003: "NightEnvironmentHDRI003",
		NightEnvironmentHDRI004: "NightEnvironmentHDRI004",
		NightEnvironmentHDRI005: "NightEnvironmentHDRI005",
	},

	// Studio/element (for controlled lighting)
	element: {
		HDRIElement001: "HDRIElement001",
	},
} as const;

/**
 * Base path for AmbientCG HDRI assets
 */
export const HDRI_BASE_PATH = "/assets/hdri";

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

export interface HDRIEnvironmentOptions {
	/** HDRI ID from AMBIENTCG_HDRIS */
	hdriId: string;
	/** Whether to show as skybox */
	showSkybox?: boolean;
	/** Skybox rotation (radians) */
	rotation?: number;
	/** Environment intensity for IBL */
	intensity?: number;
	/** Blur level for reflections (0 = sharp, 1 = blurry) */
	reflectionBlur?: number;
}

/**
 * Setup HDRI environment for a scene
 *
 * This sets:
 * 1. scene.environmentTexture (for PBR reflections)
 * 2. scene.createDefaultSkybox (optional visual skybox)
 *
 * @returns Cleanup function
 */
export function setupHDRIEnvironment(
	scene: Scene,
	options: HDRIEnvironmentOptions
): () => void {
	const {
		hdriId,
		showSkybox = true,
		rotation = 0,
		intensity = 1,
		reflectionBlur = 0.3,
	} = options;

	const disposables: { dispose: () => void }[] = [];

	// Path to the HDRI
	// AmbientCG provides .exr files, but Babylon prefers .env or .hdr
	// For now, we'll try to load as HDR and fallback to creating from tonemapped jpg
	const basePath = `${HDRI_BASE_PATH}/${hdriId}`;

	// Try to load as .env file (pre-converted, ideal)
	const envPath = `${basePath}/${hdriId}_1K.env`;
	const jpgPath = `${basePath}/${hdriId}_1K_TONEMAPPED.jpg`;

	// For proper IBL, we need a cube texture
	// Create from prefiltered .env file if available
	let envTexture: Nullable<CubeTexture> = null;

	try {
		// Try to load pre-converted .env file
		envTexture = CubeTexture.CreateFromPrefilteredData(envPath, scene);
		envTexture.rotationY = rotation;
		scene.environmentTexture = envTexture;
		scene.environmentIntensity = intensity;
		disposables.push(envTexture);
	} catch {
		console.warn(`HDRI .env not found, using fallback: ${hdriId}`);
		// Fallback: Create basic environment from simple colors
		// In production, convert EXR to .env using Babylon.js IBL tool
	}

	// Create skybox if requested
	if (showSkybox) {
		// Use tonemapped jpg for skybox visual
		const skybox = MeshBuilder.CreateBox(
			"skybox",
			{ size: 1000 },
			scene
		);
		skybox.infiniteDistance = true;

		const skyMat = new BackgroundMaterial("skyMat", scene);

		// Try to use HDR texture for skybox
		if (envTexture) {
			skyMat.reflectionTexture = envTexture;
			skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
		} else {
			// Fallback: Use regular texture as diffuse
			const skyTex = new Texture(jpgPath, scene);
			skyMat.diffuseTexture = skyTex;
			disposables.push(skyTex);
		}

		skyMat.backFaceCulling = false;
		skybox.material = skyMat;

		disposables.push(skybox);
		disposables.push(skyMat);
	}

	return () => {
		for (const d of disposables) {
			d.dispose();
		}
		scene.environmentTexture = null;
	};
}

// ============================================================================
// PRESET ENVIRONMENTS
// ============================================================================

/**
 * Setup a cyberpunk night environment
 */
export function setupNightEnvironment(
	scene: Scene,
	variant: keyof typeof AMBIENTCG_HDRIS.night = "NightSkyHDRI008"
): () => void {
	return setupHDRIEnvironment(scene, {
		hdriId: AMBIENTCG_HDRIS.night[variant],
		showSkybox: true,
		intensity: 0.8,
		reflectionBlur: 0.2,
	});
}

/**
 * Setup a moody evening environment
 */
export function setupEveningEnvironment(
	scene: Scene,
	variant: keyof typeof AMBIENTCG_HDRIS.evening = "EveningSkyHDRI039B"
): () => void {
	return setupHDRIEnvironment(scene, {
		hdriId: AMBIENTCG_HDRIS.evening[variant],
		showSkybox: true,
		intensity: 1.0,
		reflectionBlur: 0.3,
	});
}

/**
 * Setup a clear day environment
 */
export function setupDayEnvironment(
	scene: Scene,
	variant: keyof typeof AMBIENTCG_HDRIS.day = "DaySkyHDRI021A"
): () => void {
	return setupHDRIEnvironment(scene, {
		hdriId: AMBIENTCG_HDRIS.day[variant],
		showSkybox: true,
		intensity: 1.2,
		reflectionBlur: 0.4,
	});
}

// ============================================================================
// SIMPLE PROCEDURAL ENVIRONMENT (FALLBACK)
// ============================================================================

/**
 * Create a simple gradient skybox when HDRI isn't available
 * Uses cyberpunk colors: deep blue → magenta → teal
 */
export function createCyberpunkGradientEnvironment(scene: Scene): () => void {
	const disposables: { dispose: () => void }[] = [];

	// Create a simple colored skybox
	const skybox = MeshBuilder.CreateBox("procedural_skybox", { size: 1000 }, scene);
	skybox.infiniteDistance = true;

	const skyMat = new StandardMaterial("procedural_skyMat", scene);

	// Dark blue base with slight emissive
	skyMat.diffuseColor = new Color3(0.02, 0.02, 0.05);
	skyMat.emissiveColor = new Color3(0.01, 0.01, 0.03);
	skyMat.specularColor = new Color3(0, 0, 0);
	skyMat.backFaceCulling = false;

	skybox.material = skyMat;

	disposables.push(skybox);
	disposables.push(skyMat);

	// Set a basic environment color
	scene.ambientColor = new Color3(0.05, 0.05, 0.1);

	return () => {
		for (const d of disposables) {
			d.dispose();
		}
	};
}
