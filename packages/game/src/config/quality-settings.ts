/**
 * Quality Settings
 *
 * Defines quality presets for different performance targets.
 */

export type QualityLevel = "low" | "medium" | "high";

export interface QualitySettings {
	shadowsEnabled: boolean;
	shadowMapSize: number;
	antialiasing: boolean;
	particleCount: number;
	renderScale: number;
	maxLights: number;
}

const QUALITY_PRESETS: Record<QualityLevel, QualitySettings> = {
	low: {
		shadowsEnabled: false,
		shadowMapSize: 512,
		antialiasing: false,
		particleCount: 50,
		renderScale: 0.75,
		maxLights: 2,
	},
	medium: {
		shadowsEnabled: true,
		shadowMapSize: 1024,
		antialiasing: true,
		particleCount: 100,
		renderScale: 1.0,
		maxLights: 4,
	},
	high: {
		shadowsEnabled: true,
		shadowMapSize: 2048,
		antialiasing: true,
		particleCount: 200,
		renderScale: 1.0,
		maxLights: 8,
	},
};

let currentQuality: QualityLevel = "medium";

/**
 * Get current quality settings
 */
export function getQualitySettings(): QualitySettings {
	return QUALITY_PRESETS[currentQuality];
}

/**
 * Set quality level
 */
export function setQualityLevel(level: QualityLevel): void {
	currentQuality = level;
	console.log(`Quality level set to: ${level}`);
}

/**
 * Get current quality level
 */
export function getQualityLevel(): QualityLevel {
	return currentQuality;
}

/**
 * Auto-detect quality level based on device capabilities
 */
export function autoDetectQuality(): QualityLevel {
	// Check for mobile device
	const isMobile =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent,
		);

	if (isMobile) {
		return "low";
	}

	// Check for high-end desktop (rough heuristic)
	const hasHighMemory = navigator.deviceMemory
		? navigator.deviceMemory >= 8
		: false;
	const hasHighCores = navigator.hardwareConcurrency
		? navigator.hardwareConcurrency >= 8
		: false;

	if (hasHighMemory && hasHighCores) {
		return "high";
	}

	return "medium";
}

/**
 * Initialize quality settings based on device
 */
export function initializeQuality(): void {
	const detectedQuality = autoDetectQuality();
	setQualityLevel(detectedQuality);
}
