/**
 * Vine - Climbing vines on walls component
 *
 * Various vine types for overgrown urban environments.
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

export type VineType = "ivy" | "wisteria" | "kudzu" | "tech_cable";
export type VineCondition = "new" | "established" | "overgrown" | "dying";

export interface VineProps {
	id: string;
	position: Vector3;
	/** Y-axis rotation in radians */
	rotation?: number;
	/** Vine type */
	type?: VineType;
	/** Condition of the vine */
	condition?: VineCondition;
	/** Length of the vine (height it covers) */
	length?: number;
	/** Width of the vine spread */
	width?: number;
	/** Whether the vine has flowers (for wisteria) */
	hasFlowers?: boolean;
	/** Coverage density 0-1 */
	coverage?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Vine({
	id,
	position,
	rotation = 0,
	type = "ivy",
	condition = "established",
	length = 2,
	width = 1,
	hasFlowers = false,
	coverage = 0.6,
	seed,
}: VineProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: PBRMaterial[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Condition affects health/color
		const healthFactor =
			condition === "new" ? 0.9 :
			condition === "established" ? 1.0 :
			condition === "overgrown" ? 0.85 :
			0.4; // dying

		const densityMultiplier =
			condition === "new" ? 0.5 :
			condition === "established" ? 1.0 :
			condition === "overgrown" ? 1.4 :
			0.3;

		// Main vine/stem material
		const stemMat = new PBRMaterial(`vine_stem_${id}`, scene);
		materials.push(stemMat);

		// Leaf/foliage material
		const foliageMat = new PBRMaterial(`vine_foliage_${id}`, scene);
		materials.push(foliageMat);

		if (type === "ivy") {
			stemMat.albedoColor = new Color3(0.25, 0.2, 0.15);
			stemMat.metallic = 0;
			stemMat.roughness = 0.9;

			foliageMat.albedoColor = new Color3(
				0.15 * healthFactor,
				0.4 * healthFactor,
				0.12 * healthFactor
			);
			foliageMat.metallic = 0;
			foliageMat.roughness = 0.75;

		} else if (type === "wisteria") {
			stemMat.albedoColor = new Color3(0.35, 0.28, 0.2);
			stemMat.metallic = 0;
			stemMat.roughness = 0.85;

			foliageMat.albedoColor = new Color3(
				0.2 * healthFactor,
				0.45 * healthFactor,
				0.18 * healthFactor
			);
			foliageMat.metallic = 0;
			foliageMat.roughness = 0.7;

		} else if (type === "kudzu") {
			stemMat.albedoColor = new Color3(0.22, 0.18, 0.12);
			stemMat.metallic = 0;
			stemMat.roughness = 0.9;

			foliageMat.albedoColor = new Color3(
				0.18 * healthFactor,
				0.5 * healthFactor,
				0.15 * healthFactor
			);
			foliageMat.metallic = 0;
			foliageMat.roughness = 0.8;

		} else if (type === "tech_cable") {
			stemMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			stemMat.metallic = 0.3;
			stemMat.roughness = 0.6;

			// Tech cables have glowing accents instead of foliage
			foliageMat.albedoColor = new Color3(0.1, 0.8, 0.9);
			foliageMat.emissiveColor = new Color3(0.05, 0.4, 0.45);
			foliageMat.metallic = 0.5;
			foliageMat.roughness = 0.4;
		}

		// Calculate number of vine strands based on coverage
		const strandCount = Math.floor(3 + coverage * 8 * densityMultiplier);

		// Create main vine strands
		for (let s = 0; s < strandCount; s++) {
			const strandX = rng
				? (rng.next() - 0.5) * width * 0.8
				: (s / strandCount - 0.5) * width * 0.8;

			// Each strand has multiple segments climbing upward
			const segmentCount = Math.floor(4 + (rng ? rng.next() * 4 : 2));
			let currentY = 0;
			let currentX = strandX;
			let currentZ = 0;

			for (let seg = 0; seg < segmentCount; seg++) {
				const segmentLength = (length / segmentCount) * (0.8 + (rng ? rng.next() * 0.4 : 0.2));
				const segmentThickness = type === "tech_cable"
					? 0.015 + (rng ? rng.next() * 0.01 : 0)
					: 0.02 + (rng ? rng.next() * 0.015 : 0) * (1 - seg / segmentCount * 0.5);

				// Create vine segment
				const segment = MeshBuilder.CreateCylinder(
					`${id}_strand_${s}_seg_${seg}`,
					{
						height: segmentLength,
						diameterTop: segmentThickness * 0.7,
						diameterBottom: segmentThickness,
					},
					scene
				);

				// Position relative to vine base
				segment.position = new Vector3(
					posX + currentX,
					posY + currentY + segmentLength / 2,
					posZ + currentZ + 0.02 // Slight offset from wall
				);

				// Slight random rotation for organic feel
				if (type !== "tech_cable") {
					segment.rotation.x = (rng ? (rng.next() - 0.5) * 0.2 : 0);
					segment.rotation.z = (rng ? (rng.next() - 0.5) * 0.3 : 0);
				}
				segment.rotation.y = rotation;

				segment.material = stemMat;
				meshes.push(segment);

				// Update position for next segment
				currentY += segmentLength;
				currentX += rng ? (rng.next() - 0.5) * 0.15 : 0;
				currentZ += rng ? (rng.next() - 0.5) * 0.05 : 0;

				// Add leaves/nodes along the strand
				if (type !== "tech_cable") {
					const leafCount = Math.floor(2 + (rng ? rng.next() * 3 : 1) * coverage * densityMultiplier);

					for (let l = 0; l < leafCount; l++) {
						const leafY = currentY - segmentLength * (l / leafCount);
						const leafAngle = rng ? rng.next() * Math.PI * 2 : (l / leafCount) * Math.PI * 2;
						const leafSize = type === "kudzu"
							? 0.08 + (rng ? rng.next() * 0.06 : 0.03)
							: 0.04 + (rng ? rng.next() * 0.04 : 0.02);

						const leaf = MeshBuilder.CreateDisc(
							`${id}_leaf_${s}_${seg}_${l}`,
							{ radius: leafSize * healthFactor, tessellation: 6 },
							scene
						);
						leaf.position = new Vector3(
							posX + currentX + Math.cos(leafAngle) * 0.05,
							posY + leafY,
							posZ + currentZ + 0.03 + Math.sin(leafAngle) * 0.03
						);
						leaf.rotation.x = Math.PI / 2 + (rng ? (rng.next() - 0.5) * 0.5 : 0);
						leaf.rotation.y = rotation + leafAngle;
						leaf.rotation.z = rng ? (rng.next() - 0.5) * 0.3 : 0;
						leaf.material = foliageMat;
						meshes.push(leaf);
					}
				} else {
					// Tech cables have glowing nodes
					if (rng && rng.next() > 0.6) {
						const nodeSize = 0.02 + (rng ? rng.next() * 0.015 : 0);
						const node = MeshBuilder.CreateSphere(
							`${id}_node_${s}_${seg}`,
							{ diameter: nodeSize },
							scene
						);
						node.position = new Vector3(
							posX + currentX,
							posY + currentY - segmentLength * 0.5,
							posZ + currentZ + 0.03
						);
						node.material = foliageMat;
						meshes.push(node);
					}
				}
			}

			// For tech_cable type, add connector boxes at ends
			if (type === "tech_cable" && rng && rng.next() > 0.5) {
				const connector = MeshBuilder.CreateBox(
					`${id}_connector_${s}`,
					{ width: 0.04, height: 0.06, depth: 0.03 },
					scene
				);
				connector.position = new Vector3(
					posX + currentX,
					posY + currentY,
					posZ + currentZ + 0.02
				);
				connector.rotation.y = rotation;
				connector.material = stemMat;
				meshes.push(connector);
			}
		}

		// Add flowers for wisteria
		if (type === "wisteria" && hasFlowers && healthFactor > 0.5) {
			const flowerMat = new PBRMaterial(`vine_flower_${id}`, scene);
			flowerMat.albedoColor = new Color3(0.6, 0.4, 0.8);
			flowerMat.metallic = 0;
			flowerMat.roughness = 0.6;
			materials.push(flowerMat);

			const clusterCount = Math.floor(3 + coverage * 6 * densityMultiplier);

			for (let c = 0; c < clusterCount; c++) {
				const clusterX = rng ? (rng.next() - 0.5) * width * 0.7 : (c / clusterCount - 0.5) * width * 0.7;
				const clusterY = rng ? rng.next() * length * 0.8 : (c / clusterCount) * length * 0.7;
				const clusterLength = 0.15 + (rng ? rng.next() * 0.2 : 0.1);

				// Flower cluster (hanging)
				const flowerCount = Math.floor(4 + (rng ? rng.next() * 6 : 3));

				for (let f = 0; f < flowerCount; f++) {
					const flower = MeshBuilder.CreateSphere(
						`${id}_flower_${c}_${f}`,
						{ diameter: 0.02 + (rng ? rng.next() * 0.015 : 0) },
						scene
					);
					flower.position = new Vector3(
						posX + clusterX + (rng ? (rng.next() - 0.5) * 0.05 : 0),
						posY + clusterY - (f / flowerCount) * clusterLength,
						posZ + 0.04 + (rng ? rng.next() * 0.02 : 0)
					);
					flower.material = flowerMat;
					meshes.push(flower);
				}
			}
		}

		// Add additional coverage for overgrown condition
		if (condition === "overgrown" && type !== "tech_cable") {
			const extraLeafCount = Math.floor(coverage * 15);

			for (let e = 0; e < extraLeafCount; e++) {
				const leafX = rng ? (rng.next() - 0.5) * width : 0;
				const leafY = rng ? rng.next() * length : length * 0.5;
				const leafSize = 0.05 + (rng ? rng.next() * 0.05 : 0.025);

				const extraLeaf = MeshBuilder.CreateDisc(
					`${id}_extraleaf_${e}`,
					{ radius: leafSize, tessellation: 6 },
					scene
				);
				extraLeaf.position = new Vector3(
					posX + leafX,
					posY + leafY,
					posZ + 0.04 + (rng ? rng.next() * 0.03 : 0)
				);
				extraLeaf.rotation.x = Math.PI / 2 + (rng ? (rng.next() - 0.5) * 0.6 : 0);
				extraLeaf.rotation.y = rotation + (rng ? rng.next() * Math.PI * 2 : 0);
				extraLeaf.material = foliageMat;
				meshes.push(extraLeaf);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			for (const mat of materials) {
				mat.dispose();
			}
		};
	}, [scene, id, posX, posY, posZ, rotation, type, condition, length, width, hasFlowers, coverage, seed]);

	return null;
}
