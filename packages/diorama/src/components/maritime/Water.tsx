/**
 * Water - Reflective/translucent water surface component
 *
 * Uses for flooded Neo-Tokyo:
 * - Flooded street surfaces
 * - Gaps between buildings
 * - Rooftop pools/water features
 * - Reflective aesthetic element
 *
 * NOT a physics simulation - just visual representation.
 * Character collision handled separately (fall = respawn or swim zone).
 */

import {
	type AbstractMesh,
	Color3,
	MeshBuilder,
	PBRMaterial,
	type Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface WaterProps {
	/** Unique identifier */
	id: string;
	/** Position (center of water plane) */
	position: Vector3;
	/** Size of water surface */
	size: { width: number; depth: number };
	/** Water depth (visual only, affects color) */
	depth?: number;
	/** Base water color */
	color?: Color3;
	/** Opacity (0-1) */
	opacity?: number;
	/** Reflectivity (0-1) */
	reflectivity?: number;
	/** Enable animated ripples */
	animated?: boolean;
	/** Callback when mesh is ready */
	onReady?: (mesh: AbstractMesh) => void;
}

// Default flooded city water color - murky blue-green
const DEFAULT_WATER_COLOR = new Color3(0.05, 0.15, 0.2);

/**
 * Water surface component
 */
export function Water({
	id,
	position,
	size,
	depth = 5,
	color = DEFAULT_WATER_COLOR,
	opacity = 0.85,
	reflectivity = 0.6,
	animated = false,
	onReady,
}: WaterProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh | null>(null);

	useEffect(() => {
		if (!scene) return;

		// Create water plane
		const waterMesh = MeshBuilder.CreateGround(
			`water_${id}`,
			{
				width: size.width,
				height: size.depth, // Ground uses height for Z dimension
				subdivisions: animated ? 32 : 1,
			},
			scene,
		);

		waterMesh.position = position.clone();

		// PBR material for realistic water
		const waterMat = new PBRMaterial(`waterMat_${id}`, scene);

		// Base color - darker = deeper looking
		const depthFactor = Math.min(depth / 10, 1);
		waterMat.albedoColor = color.scale(1 - depthFactor * 0.5);

		// Transparency
		waterMat.alpha = opacity;
		waterMat.transparencyMode = 2; // Alpha blend

		// Reflectivity - water is somewhat metallic looking
		waterMat.metallic = reflectivity * 0.3;
		waterMat.roughness = 1 - reflectivity * 0.8;

		// Emissive for that eerie glow from below (city lights underwater)
		waterMat.emissiveColor = color.scale(0.1);
		waterMat.emissiveIntensity = 0.3;

		// Subsurface scattering approximation - light penetrates water
		waterMat.subSurface.isTranslucencyEnabled = true;
		waterMat.subSurface.translucencyIntensity = 0.5;
		waterMat.subSurface.tintColor = color;

		waterMesh.material = waterMat;
		meshRef.current = waterMesh;

		if (onReady) {
			onReady(waterMesh);
		}

		return () => {
			waterMesh.dispose();
			waterMat.dispose();
		};
	}, [
		scene,
		id,
		position,
		size,
		depth,
		color,
		opacity,
		reflectivity,
		animated,
		onReady,
	]);

	return null;
}

/**
 * Preset water types for common scenarios
 */
export const WATER_PRESETS = {
	// Deep flooded street - murky, low visibility
	flooded_street: {
		color: new Color3(0.03, 0.1, 0.12),
		opacity: 0.9,
		reflectivity: 0.4,
		depth: 8,
	},
	// Shallow puddle - clearer, more reflective
	puddle: {
		color: new Color3(0.1, 0.15, 0.2),
		opacity: 0.7,
		reflectivity: 0.8,
		depth: 0.5,
	},
	// Rooftop pool - cleaner water
	pool: {
		color: new Color3(0.1, 0.3, 0.4),
		opacity: 0.75,
		reflectivity: 0.7,
		depth: 2,
	},
	// Polluted industrial water
	polluted: {
		color: new Color3(0.15, 0.12, 0.05),
		opacity: 0.95,
		reflectivity: 0.3,
		depth: 6,
	},
	// Night water with neon reflections (higher emissive)
	neon_night: {
		color: new Color3(0.02, 0.08, 0.15),
		opacity: 0.85,
		reflectivity: 0.9,
		depth: 10,
	},
} as const;

export type WaterPreset = keyof typeof WATER_PRESETS;

export default Water;
