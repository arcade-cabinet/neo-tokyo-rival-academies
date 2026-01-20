/**
 * Ramp - Inclined surface for accessibility/vehicles
 *
 * Critical component per design philosophy: "No Climbing - Ramps Only"
 * All vertical navigation should be via ramps, not ladders/climbing.
 */

import {
	type AbstractMesh,
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../../world/blocks/Block";

export type RampMaterial = "concrete" | "metal" | "wood" | "rubber";
export type RampStyle = "solid" | "grated" | "ridged";

export interface RampProps {
	id: string;
	position: Vector3;
	/** Total height to climb */
	height?: number;
	/** Width of ramp */
	width?: number;
	/** Length/run of ramp (auto-calculated for safe slope if not specified) */
	length?: number;
	/** Material appearance */
	material?: RampMaterial;
	/** Surface style */
	style?: RampStyle;
	/** Direction ramp faces (radians) */
	rotation?: number;
	/** Include side rails */
	sideRails?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

const MATERIAL_COLORS: Record<
	RampMaterial,
	{ base: Color3; metallic: number; roughness: number }
> = {
	concrete: { base: new Color3(0.5, 0.5, 0.52), metallic: 0, roughness: 0.85 },
	metal: { base: new Color3(0.45, 0.47, 0.5), metallic: 0.75, roughness: 0.45 },
	wood: { base: new Color3(0.5, 0.38, 0.25), metallic: 0, roughness: 0.65 },
	rubber: { base: new Color3(0.15, 0.15, 0.15), metallic: 0, roughness: 0.95 },
};

export function Ramp({
	id,
	position,
	height = 2,
	width = 2,
	length,
	material = "concrete",
	style = "solid",
	rotation = 0,
	sideRails = true,
	seed,
}: RampProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Calculate safe slope (1:12 is ADA compliant, we use 1:8 for game)
		const actualLength = length ?? height * 8;
		const angle = Math.atan2(height, actualLength);

		// Apply seed variation
		const materialVariation = rng ? rng.next() * 0.08 - 0.04 : 0;

		// Create material
		const mat = new PBRMaterial(`ramp_mat_${id}`, scene);
		const colors = MATERIAL_COLORS[material];
		mat.albedoColor = new Color3(
			colors.base.r + materialVariation,
			colors.base.g + materialVariation,
			colors.base.b + materialVariation,
		);
		mat.metallic = colors.metallic;
		mat.roughness = colors.roughness;

		// Calculate ramp dimensions
		const rampLength = Math.sqrt(actualLength * actualLength + height * height);
		const thickness = 0.15;

		// Main ramp surface
		const ramp = MeshBuilder.CreateBox(
			`${id}_surface`,
			{ width, height: thickness, depth: rampLength },
			scene,
		);
		ramp.position = new Vector3(
			posX,
			posY + height / 2,
			posZ + actualLength / 2,
		);
		ramp.rotation.x = -angle;
		ramp.rotation.y = rotation;
		ramp.material = mat;
		meshes.push(ramp);

		// Add ridges for "ridged" style
		if (style === "ridged") {
			const ridgeCount = Math.floor(rampLength / 0.3);
			for (let i = 0; i < ridgeCount; i++) {
				const ridge = MeshBuilder.CreateBox(
					`${id}_ridge_${i}`,
					{ width: width * 0.9, height: 0.02, depth: 0.03 },
					scene,
				);
				const t = (i + 0.5) / ridgeCount;
				ridge.position = new Vector3(
					posX,
					posY + t * height + thickness / 2 + 0.01,
					posZ + t * actualLength,
				);
				ridge.rotation.y = rotation;
				ridge.material = mat;
				meshes.push(ridge);
			}
		}

		// Add grating pattern for "grated" style
		if (style === "grated") {
			const grateSpacing = 0.15;
			const grateCount = Math.floor(width / grateSpacing);
			for (let i = 0; i < grateCount; i++) {
				const grate = MeshBuilder.CreateBox(
					`${id}_grate_${i}`,
					{ width: 0.02, height: 0.02, depth: rampLength * 0.95 },
					scene,
				);
				const offset = (i - grateCount / 2 + 0.5) * grateSpacing;
				grate.position = new Vector3(
					posX + offset,
					posY + height / 2 + thickness / 2 + 0.01,
					posZ + actualLength / 2,
				);
				grate.rotation.x = -angle;
				grate.rotation.y = rotation;
				grate.material = mat;
				meshes.push(grate);
			}
		}

		// Side rails
		if (sideRails) {
			const railMat = new PBRMaterial(`rail_mat_${id}`, scene);
			railMat.albedoColor = new Color3(0.35, 0.35, 0.38);
			railMat.metallic = 0.85;
			railMat.roughness = 0.35;

			for (const side of [-1, 1]) {
				// Bottom post
				const bottomPost = MeshBuilder.CreateCylinder(
					`${id}_post_bottom_${side}`,
					{ height: 1, diameter: 0.05 },
					scene,
				);
				bottomPost.position = new Vector3(
					posX + (side * width) / 2,
					posY + 0.5,
					posZ,
				);
				bottomPost.rotation.y = rotation;
				bottomPost.material = railMat;
				meshes.push(bottomPost);

				// Top post
				const topPost = MeshBuilder.CreateCylinder(
					`${id}_post_top_${side}`,
					{ height: 1, diameter: 0.05 },
					scene,
				);
				topPost.position = new Vector3(
					posX + (side * width) / 2,
					posY + height + 0.5,
					posZ + actualLength,
				);
				topPost.rotation.y = rotation;
				topPost.material = railMat;
				meshes.push(topPost);

				// Rail bar
				const rail = MeshBuilder.CreateCylinder(
					`${id}_rail_${side}`,
					{ height: rampLength, diameter: 0.04 },
					scene,
				);
				rail.position = new Vector3(
					posX + (side * width) / 2,
					posY + height / 2 + 1,
					posZ + actualLength / 2,
				);
				rail.rotation.x = Math.PI / 2 - angle;
				rail.rotation.y = rotation;
				rail.material = railMat;
				meshes.push(rail);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			mat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		height,
		width,
		length,
		material,
		style,
		rotation,
		sideRails,
		seed,
	]);

	return null;
}
