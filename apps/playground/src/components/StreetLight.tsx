/**
 * StreetLight - Urban lighting component
 *
 * Various street lamp styles for the flooded city.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	PointLight,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../blocks/Block";

export type LightStyle = "modern" | "traditional" | "industrial" | "neon" | "lantern";
export type LightState = "on" | "off" | "flickering";

export interface StreetLightProps {
	id: string;
	position: Vector3;
	/** Light style */
	style?: LightStyle;
	/** Height of light */
	height?: number;
	/** Light state */
	state?: LightState;
	/** Light color */
	lightColor?: Color3;
	/** Light intensity */
	intensity?: number;
	/** Create actual Babylon light */
	emitLight?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

export function StreetLight({
	id,
	position,
	style = "modern",
	height = 4,
	state = "on",
	lightColor,
	intensity = 0.5,
	emitLight = false,
	seed,
}: StreetLightProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);
	const lightRef = useRef<PointLight | null>(null);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Pole material
		const poleMat = new PBRMaterial(`streetlight_pole_${id}`, scene);
		poleMat.albedoColor = style === "traditional"
			? new Color3(0.15, 0.15, 0.12) // Dark iron
			: new Color3(0.4, 0.42, 0.45); // Modern metal
		poleMat.metallic = 0.85;
		poleMat.roughness = style === "traditional" ? 0.6 : 0.4;

		// Light fixture material
		const isOn = state === "on" || state === "flickering";
		const actualLightColor = lightColor ?? (
			style === "neon"
				? new Color3(1, 0.2, 0.5) // Pink neon
				: style === "lantern"
					? new Color3(1, 0.8, 0.4) // Warm lantern
					: new Color3(1, 0.95, 0.9) // White LED
		);

		const fixtureMat = new PBRMaterial(`streetlight_fixture_${id}`, scene);
		fixtureMat.albedoColor = isOn ? actualLightColor : new Color3(0.3, 0.3, 0.32);
		if (isOn) {
			fixtureMat.emissiveColor = actualLightColor.scale(0.8);
		}
		fixtureMat.metallic = 0.1;
		fixtureMat.roughness = 0.3;

		// Glass/cover material
		const glassMat = new PBRMaterial(`streetlight_glass_${id}`, scene);
		glassMat.albedoColor = isOn ? actualLightColor.scale(0.5) : new Color3(0.6, 0.6, 0.62);
		glassMat.metallic = 0.05;
		glassMat.roughness = 0.1;
		glassMat.alpha = 0.6;

		if (style === "modern") {
			// Modern LED streetlight
			// Pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: height - 0.5, diameterTop: 0.08, diameterBottom: 0.12 },
				scene
			);
			pole.position = new Vector3(posX, posY + (height - 0.5) / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Arm
			const arm = MeshBuilder.CreateCylinder(
				`${id}_arm`,
				{ height: 1.2, diameter: 0.06 },
				scene
			);
			arm.position = new Vector3(posX + 0.5, posY + height - 0.3, posZ);
			arm.rotation.z = Math.PI / 2;
			arm.material = poleMat;
			meshes.push(arm);

			// LED panel
			const panel = MeshBuilder.CreateBox(
				`${id}_panel`,
				{ width: 0.6, height: 0.08, depth: 0.3 },
				scene
			);
			panel.position = new Vector3(posX + 1, posY + height - 0.35, posZ);
			panel.material = poleMat;
			meshes.push(panel);

			// Light surface
			const light = MeshBuilder.CreateBox(
				`${id}_light`,
				{ width: 0.55, height: 0.02, depth: 0.25 },
				scene
			);
			light.position = new Vector3(posX + 1, posY + height - 0.4, posZ);
			light.material = fixtureMat;
			meshes.push(light);
		} else if (style === "traditional") {
			// Victorian-style lamp post
			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.3, diameterTop: 0.2, diameterBottom: 0.35 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.15, posZ);
			base.material = poleMat;
			meshes.push(base);

			// Pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: height - 0.8, diameter: 0.1 },
				scene
			);
			pole.position = new Vector3(posX, posY + 0.3 + (height - 0.8) / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Decorative collar
			const collar = MeshBuilder.CreateTorus(
				`${id}_collar`,
				{ diameter: 0.2, thickness: 0.03 },
				scene
			);
			collar.position = new Vector3(posX, posY + height - 0.5, posZ);
			collar.rotation.x = Math.PI / 2;
			collar.material = poleMat;
			meshes.push(collar);

			// Lantern housing
			const housing = MeshBuilder.CreateCylinder(
				`${id}_housing`,
				{ height: 0.4, diameterTop: 0.15, diameterBottom: 0.25, tessellation: 6 },
				scene
			);
			housing.position = new Vector3(posX, posY + height - 0.2, posZ);
			housing.material = poleMat;
			meshes.push(housing);

			// Glass panels (simplified as sphere)
			const glass = MeshBuilder.CreateSphere(
				`${id}_glass`,
				{ diameter: 0.2 },
				scene
			);
			glass.position = new Vector3(posX, posY + height - 0.2, posZ);
			glass.material = glassMat;
			meshes.push(glass);

			// Top cap
			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{ height: 0.1, diameterTop: 0.05, diameterBottom: 0.15 },
				scene
			);
			cap.position = new Vector3(posX, posY + height + 0.05, posZ);
			cap.material = poleMat;
			meshes.push(cap);
		} else if (style === "industrial") {
			// Industrial flood light
			// Pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: height, diameter: 0.15 },
				scene
			);
			pole.position = new Vector3(posX, posY + height / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Cross arm
			const arm = MeshBuilder.CreateBox(
				`${id}_arm`,
				{ width: 1.5, height: 0.1, depth: 0.1 },
				scene
			);
			arm.position = new Vector3(posX, posY + height, posZ);
			arm.material = poleMat;
			meshes.push(arm);

			// Flood lights
			for (const side of [-0.5, 0.5]) {
				const fixture = MeshBuilder.CreateBox(
					`${id}_fixture_${side}`,
					{ width: 0.4, height: 0.3, depth: 0.2 },
					scene
				);
				fixture.position = new Vector3(posX + side, posY + height - 0.2, posZ);
				fixture.rotation.x = Math.PI / 6;
				fixture.material = poleMat;
				meshes.push(fixture);

				const lens = MeshBuilder.CreateBox(
					`${id}_lens_${side}`,
					{ width: 0.35, height: 0.25, depth: 0.02 },
					scene
				);
				lens.position = new Vector3(posX + side, posY + height - 0.28, posZ + 0.09);
				lens.rotation.x = Math.PI / 6;
				lens.material = fixtureMat;
				meshes.push(lens);
			}
		} else if (style === "neon") {
			// Neon tube light (cyberpunk style)
			// Mount bracket
			const bracket = MeshBuilder.CreateBox(
				`${id}_bracket`,
				{ width: 0.1, height: 0.1, depth: 0.15 },
				scene
			);
			bracket.position = new Vector3(posX, posY + height, posZ);
			bracket.material = poleMat;
			meshes.push(bracket);

			// Neon tube
			const tube = MeshBuilder.CreateCylinder(
				`${id}_tube`,
				{ height: 1.5, diameter: 0.04 },
				scene
			);
			tube.position = new Vector3(posX, posY + height - 0.1, posZ + 0.1);
			tube.rotation.z = Math.PI / 2;
			tube.material = fixtureMat;
			meshes.push(tube);

			// Second tube (different color)
			const tube2Mat = new PBRMaterial(`streetlight_tube2_${id}`, scene);
			const tube2Color = rng
				? new Color3(rng.next(), rng.next() * 0.5 + 0.5, 1)
				: new Color3(0.2, 0.8, 1);
			tube2Mat.albedoColor = isOn ? tube2Color : new Color3(0.3, 0.3, 0.32);
			if (isOn) tube2Mat.emissiveColor = tube2Color.scale(0.8);
			tube2Mat.metallic = 0.1;
			tube2Mat.roughness = 0.3;

			const tube2 = MeshBuilder.CreateCylinder(
				`${id}_tube2`,
				{ height: 1.2, diameter: 0.03 },
				scene
			);
			tube2.position = new Vector3(posX, posY + height - 0.2, posZ + 0.15);
			tube2.rotation.z = Math.PI / 2;
			tube2.material = tube2Mat;
			meshes.push(tube2);
		} else if (style === "lantern") {
			// Japanese paper lantern style
			// Support post
			const post = MeshBuilder.CreateCylinder(
				`${id}_post`,
				{ height: height - 0.6, diameter: 0.08 },
				scene
			);
			post.position = new Vector3(posX, posY + (height - 0.6) / 2, posZ);
			post.material = poleMat;
			meshes.push(post);

			// Arm
			const arm = MeshBuilder.CreateCylinder(
				`${id}_arm`,
				{ height: 0.6, diameter: 0.04 },
				scene
			);
			arm.position = new Vector3(posX + 0.25, posY + height - 0.4, posZ);
			arm.rotation.z = Math.PI / 3;
			arm.material = poleMat;
			meshes.push(arm);

			// Lantern body
			const lanternMat = new PBRMaterial(`streetlight_lantern_${id}`, scene);
			lanternMat.albedoColor = isOn
				? new Color3(1, 0.9, 0.7)
				: new Color3(0.9, 0.85, 0.75);
			if (isOn) lanternMat.emissiveColor = new Color3(1, 0.8, 0.5).scale(0.5);
			lanternMat.metallic = 0;
			lanternMat.roughness = 0.9;
			lanternMat.alpha = isOn ? 0.85 : 0.95;

			const lantern = MeshBuilder.CreateCylinder(
				`${id}_lantern`,
				{ height: 0.5, diameterTop: 0.25, diameterBottom: 0.3 },
				scene
			);
			lantern.position = new Vector3(posX + 0.45, posY + height - 0.3, posZ);
			lantern.material = lanternMat;
			meshes.push(lantern);

			// Top and bottom caps
			for (const y of [0.25, -0.25]) {
				const cap = MeshBuilder.CreateCylinder(
					`${id}_cap_${y}`,
					{ height: 0.05, diameter: y > 0 ? 0.2 : 0.28 },
					scene
				);
				cap.position = new Vector3(posX + 0.45, posY + height - 0.3 + y, posZ);
				cap.material = poleMat;
				meshes.push(cap);
			}
		}

		// Create actual light if requested
		if (emitLight && isOn) {
			const light = new PointLight(
				`${id}_point_light`,
				new Vector3(posX, posY + height - 0.5, posZ),
				scene
			);
			light.diffuse = actualLightColor;
			light.intensity = intensity;
			light.range = 10;
			lightRef.current = light;
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			if (lightRef.current) {
				lightRef.current.dispose();
				lightRef.current = null;
			}
			poleMat.dispose();
			fixtureMat.dispose();
			glassMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, style, height, state, lightColor, intensity, emitLight, seed]);

	return null;
}
