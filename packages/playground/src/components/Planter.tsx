/**
 * Planter - Plant container component
 *
 * Various planter types for urban greenery.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../blocks/Block";

export type PlanterStyle = "box" | "round" | "urn" | "trough" | "hanging" | "raised";
export type PlanterMaterial = "concrete" | "ceramic" | "wood" | "metal" | "plastic";

export interface PlanterProps {
	id: string;
	position: Vector3;
	/** Planter style */
	style?: PlanterStyle;
	/** Planter material */
	material?: PlanterMaterial;
	/** Size */
	size?: number;
	/** Has plants */
	hasPlants?: boolean;
	/** Plant health 0-1 */
	plantHealth?: number;
	/** Color */
	color?: Color3;
	/** Seed for procedural variation */
	seed?: number;
}

export function Planter({
	id,
	position,
	style = "box",
	material = "concrete",
	size = 1,
	hasPlants = true,
	plantHealth = 0.8,
	color,
	seed,
}: PlanterProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Material setup
		const planterMat = new PBRMaterial(`planter_body_${id}`, scene);

		if (material === "concrete") {
			planterMat.albedoColor = color ?? new Color3(0.55, 0.53, 0.5);
			planterMat.metallic = 0;
			planterMat.roughness = 0.9;
		} else if (material === "ceramic") {
			planterMat.albedoColor = color ?? new Color3(0.7, 0.4, 0.3);
			planterMat.metallic = 0.1;
			planterMat.roughness = 0.5;
		} else if (material === "wood") {
			planterMat.albedoColor = color ?? new Color3(0.45, 0.32, 0.18);
			planterMat.metallic = 0;
			planterMat.roughness = 0.85;
		} else if (material === "metal") {
			planterMat.albedoColor = color ?? new Color3(0.4, 0.42, 0.45);
			planterMat.metallic = 0.8;
			planterMat.roughness = 0.4;
		} else {
			// Plastic
			planterMat.albedoColor = color ?? new Color3(0.2, 0.35, 0.2);
			planterMat.metallic = 0.1;
			planterMat.roughness = 0.6;
		}

		// Soil material
		const soilMat = new PBRMaterial(`planter_soil_${id}`, scene);
		soilMat.albedoColor = new Color3(0.25, 0.18, 0.12);
		soilMat.metallic = 0;
		soilMat.roughness = 0.95;

		if (style === "box") {
			const boxWidth = 0.6 * size;
			const boxHeight = 0.4 * size;

			// Outer box
			const box = MeshBuilder.CreateBox(
				`${id}_box`,
				{ width: boxWidth, height: boxHeight, depth: boxWidth },
				scene
			);
			box.position = new Vector3(posX, posY + boxHeight / 2, posZ);
			box.material = planterMat;
			meshes.push(box);

			// Soil surface
			const soil = MeshBuilder.CreateBox(
				`${id}_soil`,
				{ width: boxWidth - 0.04, height: 0.02, depth: boxWidth - 0.04 },
				scene
			);
			soil.position = new Vector3(posX, posY + boxHeight - 0.03, posZ);
			soil.material = soilMat;
			meshes.push(soil);

		} else if (style === "round") {
			const diameter = 0.5 * size;
			const height = 0.35 * size;

			// Round pot
			const pot = MeshBuilder.CreateCylinder(
				`${id}_pot`,
				{ height: height, diameterTop: diameter, diameterBottom: diameter * 0.8 },
				scene
			);
			pot.position = new Vector3(posX, posY + height / 2, posZ);
			pot.material = planterMat;
			meshes.push(pot);

			// Rim
			const rim = MeshBuilder.CreateTorus(
				`${id}_rim`,
				{ diameter: diameter, thickness: 0.02 },
				scene
			);
			rim.position = new Vector3(posX, posY + height, posZ);
			rim.rotation.x = Math.PI / 2;
			rim.material = planterMat;
			meshes.push(rim);

			// Soil
			const soil = MeshBuilder.CreateCylinder(
				`${id}_soil`,
				{ height: 0.02, diameter: diameter - 0.04 },
				scene
			);
			soil.position = new Vector3(posX, posY + height - 0.03, posZ);
			soil.material = soilMat;
			meshes.push(soil);

		} else if (style === "urn") {
			const diameter = 0.45 * size;
			const height = 0.6 * size;

			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.1 * size, diameter: diameter * 0.5 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.05 * size, posZ);
			base.material = planterMat;
			meshes.push(base);

			// Pedestal
			const pedestal = MeshBuilder.CreateCylinder(
				`${id}_pedestal`,
				{ height: 0.15 * size, diameterTop: diameter * 0.4, diameterBottom: diameter * 0.5 },
				scene
			);
			pedestal.position = new Vector3(posX, posY + 0.175 * size, posZ);
			pedestal.material = planterMat;
			meshes.push(pedestal);

			// Bowl
			const bowl = MeshBuilder.CreateCylinder(
				`${id}_bowl`,
				{ height: height * 0.5, diameterTop: diameter, diameterBottom: diameter * 0.4 },
				scene
			);
			bowl.position = new Vector3(posX, posY + height * 0.5, posZ);
			bowl.material = planterMat;
			meshes.push(bowl);

			// Lip
			const lip = MeshBuilder.CreateTorus(
				`${id}_lip`,
				{ diameter: diameter * 1.05, thickness: 0.03 },
				scene
			);
			lip.position = new Vector3(posX, posY + height * 0.75, posZ);
			lip.rotation.x = Math.PI / 2;
			lip.material = planterMat;
			meshes.push(lip);

			// Soil
			const soil = MeshBuilder.CreateCylinder(
				`${id}_soil`,
				{ height: 0.02, diameter: diameter - 0.04 },
				scene
			);
			soil.position = new Vector3(posX, posY + height * 0.73, posZ);
			soil.material = soilMat;
			meshes.push(soil);

		} else if (style === "trough") {
			const troughWidth = 1.2 * size;
			const troughHeight = 0.35 * size;
			const troughDepth = 0.4 * size;

			// Trough body
			const trough = MeshBuilder.CreateBox(
				`${id}_trough`,
				{ width: troughWidth, height: troughHeight, depth: troughDepth },
				scene
			);
			trough.position = new Vector3(posX, posY + troughHeight / 2, posZ);
			trough.material = planterMat;
			meshes.push(trough);

			// Feet
			if (material !== "concrete") {
				for (const fx of [-1, 1]) {
					for (const fz of [-1, 1]) {
						const foot = MeshBuilder.CreateCylinder(
							`${id}_foot_${fx}_${fz}`,
							{ height: 0.05, diameter: 0.08 },
							scene
						);
						foot.position = new Vector3(
							posX + fx * (troughWidth / 2 - 0.1),
							posY + 0.025,
							posZ + fz * (troughDepth / 2 - 0.08)
						);
						foot.material = planterMat;
						meshes.push(foot);
					}
				}
			}

			// Soil
			const soil = MeshBuilder.CreateBox(
				`${id}_soil`,
				{ width: troughWidth - 0.04, height: 0.02, depth: troughDepth - 0.04 },
				scene
			);
			soil.position = new Vector3(posX, posY + troughHeight - 0.03, posZ);
			soil.material = soilMat;
			meshes.push(soil);

		} else if (style === "hanging") {
			const diameter = 0.35 * size;
			const height = 0.25 * size;

			// Pot
			const pot = MeshBuilder.CreateSphere(
				`${id}_pot`,
				{ diameter: diameter, slice: 0.6 },
				scene
			);
			pot.position = new Vector3(posX, posY, posZ);
			pot.rotation.x = Math.PI;
			pot.material = planterMat;
			meshes.push(pot);

			// Chains/hangers
			const chainMat = new PBRMaterial(`planter_chain_${id}`, scene);
			chainMat.albedoColor = new Color3(0.3, 0.32, 0.35);
			chainMat.metallic = 0.85;
			chainMat.roughness = 0.4;

			for (let c = 0; c < 3; c++) {
				const chainAngle = (c / 3) * Math.PI * 2;
				const chain = MeshBuilder.CreateCylinder(
					`${id}_chain_${c}`,
					{ height: 0.4, diameter: 0.01 },
					scene
				);
				chain.position = new Vector3(
					posX + Math.cos(chainAngle) * diameter * 0.35,
					posY + 0.2,
					posZ + Math.sin(chainAngle) * diameter * 0.35
				);
				chain.rotation.z = 0.3;
				chain.rotation.y = chainAngle;
				chain.material = chainMat;
				meshes.push(chain);
			}

			// Hook
			const hook = MeshBuilder.CreateTorus(
				`${id}_hook`,
				{ diameter: 0.06, thickness: 0.01 },
				scene
			);
			hook.position = new Vector3(posX, posY + 0.42, posZ);
			hook.material = chainMat;
			meshes.push(hook);

			// Soil
			const soil = MeshBuilder.CreateCylinder(
				`${id}_soil`,
				{ height: 0.02, diameter: diameter - 0.04 },
				scene
			);
			soil.position = new Vector3(posX, posY + diameter * 0.15, posZ);
			soil.material = soilMat;
			meshes.push(soil);

		} else if (style === "raised") {
			const bedWidth = 1.5 * size;
			const bedHeight = 0.6 * size;
			const bedDepth = 0.8 * size;

			// Bed walls
			const wallThickness = material === "wood" ? 0.08 : 0.1;

			for (const side of ["front", "back", "left", "right"]) {
				let wallW, wallH, wallD, wallX, wallZ;

				if (side === "front" || side === "back") {
					wallW = bedWidth;
					wallH = bedHeight;
					wallD = wallThickness;
					wallX = 0;
					wallZ = (side === "front" ? 1 : -1) * (bedDepth / 2 - wallThickness / 2);
				} else {
					wallW = wallThickness;
					wallH = bedHeight;
					wallD = bedDepth - wallThickness * 2;
					wallX = (side === "right" ? 1 : -1) * (bedWidth / 2 - wallThickness / 2);
					wallZ = 0;
				}

				const wall = MeshBuilder.CreateBox(
					`${id}_wall_${side}`,
					{ width: wallW, height: wallH, depth: wallD },
					scene
				);
				wall.position = new Vector3(posX + wallX, posY + wallH / 2, posZ + wallZ);
				wall.material = planterMat;
				meshes.push(wall);
			}

			// Corner posts (for wood)
			if (material === "wood") {
				for (const cx of [-1, 1]) {
					for (const cz of [-1, 1]) {
						const post = MeshBuilder.CreateBox(
							`${id}_post_${cx}_${cz}`,
							{ width: 0.1, height: bedHeight + 0.05, depth: 0.1 },
							scene
						);
						post.position = new Vector3(
							posX + cx * (bedWidth / 2 - 0.05),
							posY + bedHeight / 2,
							posZ + cz * (bedDepth / 2 - 0.05)
						);
						post.material = planterMat;
						meshes.push(post);
					}
				}
			}

			// Soil
			const soil = MeshBuilder.CreateBox(
				`${id}_soil`,
				{ width: bedWidth - wallThickness * 2 - 0.02, height: 0.02, depth: bedDepth - wallThickness * 2 - 0.02 },
				scene
			);
			soil.position = new Vector3(posX, posY + bedHeight - 0.05, posZ);
			soil.material = soilMat;
			meshes.push(soil);
		}

		// Plants
		if (hasPlants) {
			const foliageMat = new PBRMaterial(`planter_foliage_${id}`, scene);
			const greenness = 0.2 + plantHealth * 0.35;
			foliageMat.albedoColor = new Color3(greenness * 0.6, greenness, greenness * 0.4);
			foliageMat.metallic = 0;
			foliageMat.roughness = 0.85;

			const plantCount = rng ? 2 + Math.floor(rng.next() * 4) : 3;
			const planterRadius = style === "trough" || style === "raised" ? 0.4 * size : 0.15 * size;
			const baseHeight = style === "urn" ? 0.45 * size : style === "hanging" ? 0.08 * size : 0.35 * size;

			for (let p = 0; p < plantCount; p++) {
				const angle = rng ? rng.next() * Math.PI * 2 : (p / plantCount) * Math.PI * 2;
				const radius = rng ? rng.next() * planterRadius * 0.7 : planterRadius * 0.4;
				const plantHeight = (0.15 + (rng ? rng.next() * 0.2 : 0.1)) * size * plantHealth;

				const plant = MeshBuilder.CreateSphere(
					`${id}_plant_${p}`,
					{ diameter: plantHeight * 1.5 },
					scene
				);
				plant.position = new Vector3(
					posX + Math.cos(angle) * radius,
					posY + baseHeight + plantHeight * 0.4,
					posZ + Math.sin(angle) * radius
				);
				plant.scaling = new Vector3(1, 0.7 + (rng ? rng.next() * 0.4 : 0.2), 1);
				plant.material = foliageMat;
				meshes.push(plant);
			}

			// Optional flowers
			if (plantHealth > 0.7 && rng && rng.next() > 0.5) {
				const flowerMat = new PBRMaterial(`planter_flower_${id}`, scene);
				const flowerColors = [
					new Color3(0.9, 0.3, 0.4),
					new Color3(0.9, 0.8, 0.3),
					new Color3(0.4, 0.3, 0.8),
					new Color3(0.9, 0.5, 0.7),
				];
				flowerMat.albedoColor = flowerColors[Math.floor(rng.next() * flowerColors.length)];
				flowerMat.metallic = 0;
				flowerMat.roughness = 0.7;

				const flowerCount = 2 + Math.floor(rng.next() * 4);
				for (let f = 0; f < flowerCount; f++) {
					const angle = rng.next() * Math.PI * 2;
					const radius = rng.next() * planterRadius * 0.6;

					const flower = MeshBuilder.CreateSphere(
						`${id}_flower_${f}`,
						{ diameter: 0.04 + rng.next() * 0.03 },
						scene
					);
					flower.position = new Vector3(
						posX + Math.cos(angle) * radius,
						posY + baseHeight + 0.2 * size + rng.next() * 0.1 * size,
						posZ + Math.sin(angle) * radius
					);
					flower.material = flowerMat;
					meshes.push(flower);
				}
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			planterMat.dispose();
			soilMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, style, material, size, hasPlants, plantHealth, color, seed]);

	return null;
}
