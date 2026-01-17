/**
 * Lighting Components
 *
 * Provides lighting setups for the diorama scene.
 * Includes directional lights with shadows and neon accent point lights.
 */

import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface DirectionalLightWithShadowsProps {
	/** Light position */
	position?: Vector3;
	/** Light direction (if not specified, derived from position) */
	direction?: Vector3;
	/** Light intensity */
	intensity?: number;
	/** Shadow map size (higher = better quality, lower performance) */
	shadowMapSize?: number;
	/** Meshes that should cast shadows */
	shadowCasters?: AbstractMesh[];
	/** Name for the light */
	name?: string;
}

export function DirectionalLightWithShadows({
	position = new Vector3(15, 25, 10),
	direction,
	intensity = 1.2,
	shadowMapSize = 2048,
	shadowCasters = [],
	name = "directionalLight",
}: DirectionalLightWithShadowsProps) {
	const scene = useScene();
	const lightRef = useRef<DirectionalLight | null>(null);
	const shadowGenRef = useRef<ShadowGenerator | null>(null);

	useEffect(() => {
		if (!scene) return;

		// Create directional light
		const light = new DirectionalLight(
			name,
			direction || position.negate().normalize(),
			scene,
		);
		light.position = position;
		light.intensity = intensity;

		// Create shadow generator
		const shadowGenerator = new ShadowGenerator(shadowMapSize, light);
		shadowGenerator.useBlurExponentialShadowMap = true;
		shadowGenerator.blurKernel = 32;

		// Add shadow casters
		for (const mesh of shadowCasters) {
			shadowGenerator.addShadowCaster(mesh);
		}

		lightRef.current = light;
		shadowGenRef.current = shadowGenerator;

		return () => {
			shadowGenerator.dispose();
			light.dispose();
			lightRef.current = null;
			shadowGenRef.current = null;
		};
	}, [
		scene,
		position,
		direction,
		intensity,
		shadowMapSize,
		name,
		shadowCasters,
	]);

	// Update shadow casters when they change
	useEffect(() => {
		if (!shadowGenRef.current) return;

		// Clear existing casters
		shadowGenRef.current.getShadowMap()?.renderList?.splice(0);

		// Add new casters
		for (const mesh of shadowCasters) {
			shadowGenRef.current.addShadowCaster(mesh);
		}
	}, [shadowCasters]);

	return null;
}

export interface NeonPointLightProps {
	/** Light position */
	position: Vector3;
	/** Light color (RGB 0-1 or hex string) */
	color: string | Color3;
	/** Light intensity */
	intensity?: number;
	/** Light range/distance */
	range?: number;
	/** Name for the light */
	name?: string;
}

export function NeonPointLight({
	position,
	color,
	intensity = 3,
	range = 20,
	name = "neonLight",
}: NeonPointLightProps) {
	const scene = useScene();
	const lightRef = useRef<PointLight | null>(null);

	useEffect(() => {
		if (!scene) return;

		const light = new PointLight(name, position, scene);
		light.intensity = intensity;
		light.range = range;

		// Parse color
		if (typeof color === "string") {
			light.diffuse = Color3.FromHexString(color);
		} else {
			light.diffuse = color;
		}

		// Neon lights typically have no specular
		light.specular = new Color3(0, 0, 0);

		lightRef.current = light;

		return () => {
			light.dispose();
			lightRef.current = null;
		};
	}, [scene, position, color, intensity, range, name]);

	return null;
}

/**
 * Cyberpunk neon lighting preset
 * Includes magenta, cyan, and orange accent lights
 */
export interface CyberpunkNeonLightsProps {
	/** Intensity multiplier for all neon lights */
	intensityMultiplier?: number;
	/** Range multiplier for all neon lights */
	rangeMultiplier?: number;
}

export function CyberpunkNeonLights({
	intensityMultiplier = 1,
	rangeMultiplier = 1,
}: CyberpunkNeonLightsProps = {}) {
	return (
		<>
			<NeonPointLight
				name="neonMagenta"
				position={new Vector3(-6, 4, -6)}
				color="#ff00ff"
				intensity={3 * intensityMultiplier}
				range={20 * rangeMultiplier}
			/>
			<NeonPointLight
				name="neonCyan"
				position={new Vector3(6, 4, 6)}
				color="#00ffff"
				intensity={3 * intensityMultiplier}
				range={20 * rangeMultiplier}
			/>
			<NeonPointLight
				name="neonOrange"
				position={new Vector3(0, 2, -8)}
				color="#ff6600"
				intensity={2 * intensityMultiplier}
				range={15 * rangeMultiplier}
			/>
		</>
	);
}
