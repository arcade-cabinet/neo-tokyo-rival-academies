/**
 * Quality Settings
 *
 * Defines quality presets for different performance targets.
 * Used by both web and mobile renderers.
 */

export type QualityLevel = "low" | "medium" | "high";

export interface QualitySettings {
	/** Enable shadow rendering */
	shadowsEnabled: boolean;
	/** Shadow map resolution */
	shadowMapSize: number;
	/** Enable antialiasing */
	antialiasing: boolean;
	/** Maximum particle count */
	particleCount: number;
	/** Render resolution scale (1.0 = native) */
	renderScale: number;
	/** Maximum active lights */
	maxLights: number;
	/** Enable post-processing effects */
	postProcessing: boolean;
	/** Texture quality (0.5 = half res, 1.0 = full) */
	textureQuality: number;
}

/**
 * Quality presets for different device tiers
 */
export const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
	low: {
		shadowsEnabled: false,
		shadowMapSize: 512,
		antialiasing: false,
		particleCount: 50,
		renderScale: 0.75,
		maxLights: 2,
		postProcessing: false,
		textureQuality: 0.5,
	},
	medium: {
		shadowsEnabled: true,
		shadowMapSize: 1024,
		antialiasing: true,
		particleCount: 100,
		renderScale: 1.0,
		maxLights: 4,
		postProcessing: true,
		textureQuality: 0.75,
	},
	high: {
		shadowsEnabled: true,
		shadowMapSize: 2048,
		antialiasing: true,
		particleCount: 200,
		renderScale: 1.0,
		maxLights: 8,
		postProcessing: true,
		textureQuality: 1.0,
	},
} as const;

/**
 * Device-specific quality targets
 */
export const DEVICE_QUALITY_TARGETS = {
	/** Pixel 8a baseline target */
	pixel8a: "medium" as QualityLevel,
	/** OnePlus Open foldable target */
	onePlusOpen: "high" as QualityLevel,
	/** Generic mobile fallback */
	mobileFallback: "low" as QualityLevel,
	/** Desktop default */
	desktop: "high" as QualityLevel,
} as const;
