/**
 * Materials Module - Modern 4K visuals for Neo-Tokyo
 *
 * This module provides the visual layer that transforms
 * Daggerfall's block LOGIC into modern aesthetics.
 *
 * PHILOSOPHY:
 * - Blocks define WHERE things go (Daggerfall logic)
 * - Materials define HOW things LOOK (Modern 2026 visuals)
 *
 * Components:
 * 1. AmbientCGMaterial - Full PBR materials from AmbientCG
 * 2. HDRIEnvironment - Image-based lighting from HDRIs
 * 3. DecalSystem - Weathering overlays (water stains, damage)
 */

// PBR Materials
export {
	createAmbientCGMaterial,
	createConcreteMaterial,
	createCorrugatedSteelMaterial,
	createWoodPlankMaterial,
	createBrickMaterial,
	createTileMaterial,
	AMBIENTCG_MATERIALS,
	AMBIENTCG_BASE_PATH,
	type MaterialCategory,
	type AmbientCGMaterialOptions,
} from "./AmbientCGMaterial";

// HDRI Environment Lighting
export {
	setupHDRIEnvironment,
	setupNightEnvironment,
	setupEveningEnvironment,
	setupDayEnvironment,
	createCyberpunkGradientEnvironment,
	AMBIENTCG_HDRIS,
	HDRI_BASE_PATH,
	type HDRICategory,
	type HDRIEnvironmentOptions,
} from "./HDRIEnvironment";

// Decal System
export {
	createFloorDecal,
	createProjectedDecal,
	createWaterStainDecal,
	createManholeDecal,
	createRoadLineDecal,
	scatterWaterStains,
	AMBIENTCG_DECALS,
	DECAL_BASE_PATH,
	type DecalCategory,
	type DecalOptions,
	type ScatterOptions,
} from "./DecalSystem";
