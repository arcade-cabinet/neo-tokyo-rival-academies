/**
 * Pillar - Structural column component
 *
 * Vertical support columns for elevated structures.
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

export type PillarShape = "square" | "round" | "hexagonal" | "ibeam";
export type PillarMaterial = "concrete" | "metal" | "wood" | "stone";

export interface PillarProps {
	id: string;
	position: Vector3;
	/** Pillar height */
	height?: number;
	/** Pillar width/diameter */
	width?: number;
	/** Cross-section shape */
	shape?: PillarShape;
	/** Material */
	material?: PillarMaterial;
	/** Has decorative capital at top */
	capital?: boolean;
	/** Has base plinth */
	base?: boolean;
	/** Weathering/damage level 0-1 */
	weathering?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const MATERIAL_COLORS: Record<
	PillarMaterial,
	{ base: Color3; metallic: number; roughness: number }
> = {
	concrete: {
		base: new Color3(0.55, 0.55, 0.57),
		metallic: 0,
		roughness: 0.85,
	},
	metal: { base: new Color3(0.4, 0.42, 0.45), metallic: 0.85, roughness: 0.4 },
	wood: { base: new Color3(0.45, 0.32, 0.2), metallic: 0, roughness: 0.7 },
	stone: { base: new Color3(0.6, 0.58, 0.55), metallic: 0, roughness: 0.9 },
};

export function Pillar({
	id,
	position,
	height = 4,
	width = 0.5,
	shape = "square",
	material = "concrete",
	capital = false,
	base = true,
	weathering = 0,
	seed,
}: PillarProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const materialVariation = rng ? rng.next() * 0.1 - 0.05 : 0;
		const weatherVariation = weathering * (rng ? rng.next() * 0.15 : 0.1);

		// Main material
		const mat = new PBRMaterial(`pillar_mat_${id}`, scene);
		const colors = MATERIAL_COLORS[material];
		mat.albedoColor = new Color3(
			colors.base.r + materialVariation - weatherVariation,
			colors.base.g + materialVariation - weatherVariation,
			colors.base.b + materialVariation - weatherVariation,
		);
		mat.metallic = colors.metallic * (1 - weathering * 0.3);
		mat.roughness = Math.min(1, colors.roughness + weathering * 0.2);

		const baseHeight = 0.2;
		const capitalHeight = 0.25;
		const shaftHeight =
			height - (base ? baseHeight : 0) - (capital ? capitalHeight : 0);
		let shaftY = posY + shaftHeight / 2;
		if (base) shaftY += baseHeight;

		// Main shaft
		let shaft: AbstractMesh;
		if (shape === "square") {
			shaft = MeshBuilder.CreateBox(
				`${id}_shaft`,
				{ width, height: shaftHeight, depth: width },
				scene,
			);
		} else if (shape === "round") {
			shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: shaftHeight, diameter: width },
				scene,
			);
		} else if (shape === "hexagonal") {
			shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: shaftHeight, diameter: width, tessellation: 6 },
				scene,
			);
		} else {
			// I-beam
			const flangeThickness = width * 0.15;
			const webThickness = width * 0.1;

			// Web (vertical middle)
			const web = MeshBuilder.CreateBox(
				`${id}_web`,
				{ width: webThickness, height: shaftHeight, depth: width },
				scene,
			);
			web.position = new Vector3(posX, shaftY, posZ);
			web.material = mat;
			meshes.push(web);

			// Flanges (top and bottom horizontal)
			for (const yOffset of [
				-shaftHeight / 2 + flangeThickness / 2,
				shaftHeight / 2 - flangeThickness / 2,
			]) {
				const flange = MeshBuilder.CreateBox(
					`${id}_flange_${yOffset}`,
					{ width, height: flangeThickness, depth: width },
					scene,
				);
				flange.position = new Vector3(posX, shaftY + yOffset, posZ);
				flange.material = mat;
				meshes.push(flange);
			}

			shaft = web; // Use web as primary shaft for positioning
		}

		if (shape !== "ibeam") {
			shaft.position = new Vector3(posX, shaftY, posZ);
			shaft.material = mat;
			meshes.push(shaft);
		}

		// Base plinth
		if (base) {
			const baseMesh =
				shape === "round"
					? MeshBuilder.CreateCylinder(
							`${id}_base`,
							{ height: baseHeight, diameter: width * 1.3 },
							scene,
						)
					: MeshBuilder.CreateBox(
							`${id}_base`,
							{ width: width * 1.3, height: baseHeight, depth: width * 1.3 },
							scene,
						);
			baseMesh.position = new Vector3(posX, posY + baseHeight / 2, posZ);
			baseMesh.material = mat;
			meshes.push(baseMesh);
		}

		// Capital
		if (capital) {
			const capitalY = posY + height - capitalHeight / 2;
			const capitalMesh =
				shape === "round"
					? MeshBuilder.CreateCylinder(
							`${id}_capital`,
							{
								height: capitalHeight,
								diameterTop: width * 1.4,
								diameterBottom: width,
							},
							scene,
						)
					: MeshBuilder.CreateBox(
							`${id}_capital`,
							{ width: width * 1.4, height: capitalHeight, depth: width * 1.4 },
							scene,
						);
			capitalMesh.position = new Vector3(posX, capitalY, posZ);
			capitalMesh.material = mat;
			meshes.push(capitalMesh);
		}

		// Weathering details
		if (weathering > 0.3 && rng) {
			const stainMat = new PBRMaterial(`stain_mat_${id}`, scene);
			stainMat.albedoColor = new Color3(0.2, 0.2, 0.18);
			stainMat.metallic = 0;
			stainMat.roughness = 0.95;
			stainMat.alpha = weathering * 0.5;

			// Water stain streaks
			const streakCount = Math.floor(weathering * 3) + 1;
			for (let i = 0; i < streakCount; i++) {
				const streakHeight = shaftHeight * (0.3 + rng.next() * 0.4);
				const streak = MeshBuilder.CreateBox(
					`${id}_streak_${i}`,
					{
						width: width * 0.3 * rng.next() + 0.1,
						height: streakHeight,
						depth: 0.01,
					},
					scene,
				);
				streak.position = new Vector3(
					posX + (rng.next() - 0.5) * width * 0.3,
					shaftY - shaftHeight / 2 + streakHeight / 2,
					posZ + width / 2 + 0.01,
				);
				streak.material = stainMat;
				meshes.push(streak);
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
		shape,
		material,
		capital,
		base,
		weathering,
		seed,
	]);

	return null;
}
