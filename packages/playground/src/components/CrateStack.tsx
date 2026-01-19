/**
 * CrateStack - Stacked crates and containers
 *
 * Pre-configured stacks of crates for quick placement.
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

export type CrateStackType = "wooden" | "plastic" | "metal" | "mixed" | "shipping";
export type CrateStackArrangement = "pyramid" | "tower" | "wall" | "scattered" | "corner";

export interface CrateStackProps {
	id: string;
	position: Vector3;
	/** Stack type */
	type?: CrateStackType;
	/** Stack arrangement */
	arrangement?: CrateStackArrangement;
	/** Number of crates */
	count?: number;
	/** Base crate size */
	crateSize?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function CrateStack({
	id,
	position,
	type = "wooden",
	arrangement = "pyramid",
	count = 6,
	crateSize = 0.5,
	condition = 0.8,
	rotation = 0,
	seed,
}: CrateStackProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = condition;

		// Materials based on type
		const getCrateMaterial = (index: number): PBRMaterial => {
			const mat = new PBRMaterial(`cratestack_${id}_${index}`, scene);

			if (type === "wooden") {
				const shade = 0.9 + (rng ? (rng.next() - 0.5) * 0.2 : 0);
				mat.albedoColor = new Color3(0.45 * shade, 0.35 * shade, 0.2 * shade).scale(conditionFactor);
				mat.metallic = 0;
				mat.roughness = 0.85;
			} else if (type === "plastic") {
				const colors = [
					new Color3(0.2, 0.4, 0.7),
					new Color3(0.7, 0.2, 0.2),
					new Color3(0.2, 0.6, 0.3),
					new Color3(0.7, 0.5, 0.1),
				];
				mat.albedoColor = colors[rng ? Math.floor(rng.next() * colors.length) : index % colors.length].scale(conditionFactor);
				mat.metallic = 0.1;
				mat.roughness = 0.6;
			} else if (type === "metal") {
				mat.albedoColor = new Color3(0.45, 0.47, 0.5).scale(conditionFactor);
				mat.metallic = 0.8;
				mat.roughness = 0.4;
			} else if (type === "mixed") {
				const typeChoice = rng ? rng.next() : index / count;
				if (typeChoice < 0.33) {
					mat.albedoColor = new Color3(0.45, 0.35, 0.2).scale(conditionFactor);
					mat.metallic = 0;
					mat.roughness = 0.85;
				} else if (typeChoice < 0.66) {
					mat.albedoColor = new Color3(0.2, 0.4, 0.6).scale(conditionFactor);
					mat.metallic = 0.1;
					mat.roughness = 0.6;
				} else {
					mat.albedoColor = new Color3(0.45, 0.47, 0.5).scale(conditionFactor);
					mat.metallic = 0.8;
					mat.roughness = 0.4;
				}
			} else {
				// Shipping containers
				const containerColors = [
					new Color3(0.6, 0.15, 0.1),
					new Color3(0.1, 0.3, 0.5),
					new Color3(0.1, 0.4, 0.2),
					new Color3(0.5, 0.35, 0.1),
				];
				mat.albedoColor = containerColors[rng ? Math.floor(rng.next() * containerColors.length) : index % containerColors.length].scale(conditionFactor);
				mat.metallic = 0.6;
				mat.roughness = 0.5;
			}

			return mat;
		};

		// Calculate crate positions based on arrangement
		const cratePositions: { x: number; y: number; z: number; w: number; h: number; d: number; rot: number }[] = [];

		if (arrangement === "pyramid") {
			let remaining = count;
			let layer = 0;
			while (remaining > 0) {
				const layerSize = Math.ceil(Math.sqrt(remaining));
				const cratesInLayer = Math.min(remaining, layerSize * layerSize);
				const actualLayerSize = Math.ceil(Math.sqrt(cratesInLayer));

				for (let i = 0; i < cratesInLayer && remaining > 0; i++) {
					const lx = (i % actualLayerSize - (actualLayerSize - 1) / 2) * crateSize;
					const lz = (Math.floor(i / actualLayerSize) - (actualLayerSize - 1) / 2) * crateSize;
					const ly = layer * crateSize;

					cratePositions.push({
						x: lx,
						y: ly,
						z: lz,
						w: crateSize * (0.9 + (rng ? (rng.next() - 0.5) * 0.1 : 0)),
						h: crateSize * (0.9 + (rng ? (rng.next() - 0.5) * 0.1 : 0)),
						d: crateSize * (0.9 + (rng ? (rng.next() - 0.5) * 0.1 : 0)),
						rot: (rng ? (rng.next() - 0.5) * 0.1 : 0),
					});
					remaining--;
				}
				layer++;
			}

		} else if (arrangement === "tower") {
			for (let i = 0; i < count; i++) {
				cratePositions.push({
					x: (rng ? (rng.next() - 0.5) * 0.1 : 0),
					y: i * crateSize,
					z: (rng ? (rng.next() - 0.5) * 0.1 : 0),
					w: crateSize * (0.95 + (rng ? (rng.next() - 0.5) * 0.1 : 0)),
					h: crateSize * (0.95 + (rng ? (rng.next() - 0.5) * 0.1 : 0)),
					d: crateSize * (0.95 + (rng ? (rng.next() - 0.5) * 0.1 : 0)),
					rot: (rng ? (rng.next() - 0.5) * 0.15 : 0) * i * 0.3,
				});
			}

		} else if (arrangement === "wall") {
			const cols = Math.ceil(Math.sqrt(count * 2));
			const rows = Math.ceil(count / cols);

			let placed = 0;
			for (let row = 0; row < rows && placed < count; row++) {
				for (let col = 0; col < cols && placed < count; col++) {
					cratePositions.push({
						x: (col - (cols - 1) / 2) * crateSize,
						y: row * crateSize,
						z: 0,
						w: crateSize * 0.95,
						h: crateSize * 0.95,
						d: crateSize * 0.95,
						rot: 0,
					});
					placed++;
				}
			}

		} else if (arrangement === "scattered") {
			for (let i = 0; i < count; i++) {
				const angle = (rng ? rng.next() : i / count) * Math.PI * 2;
				const dist = (rng ? rng.next() : 0.5) * crateSize * 2;

				cratePositions.push({
					x: Math.cos(angle) * dist,
					y: i < count / 2 ? 0 : crateSize,
					z: Math.sin(angle) * dist,
					w: crateSize * (0.8 + (rng ? rng.next() * 0.4 : 0.2)),
					h: crateSize * (0.8 + (rng ? rng.next() * 0.4 : 0.2)),
					d: crateSize * (0.8 + (rng ? rng.next() * 0.4 : 0.2)),
					rot: (rng ? rng.next() : 0) * Math.PI * 0.5,
				});
			}

		} else {
			// Corner arrangement
			let placed = 0;
			for (let layer = 0; placed < count; layer++) {
				const layerCount = Math.min(count - placed, 3 - layer);
				for (let i = 0; i < layerCount && placed < count; i++) {
					cratePositions.push({
						x: i * crateSize * 0.5,
						y: layer * crateSize,
						z: (layerCount - 1 - i) * crateSize * 0.5,
						w: crateSize * 0.95,
						h: crateSize * 0.95,
						d: crateSize * 0.95,
						rot: 0,
					});
					placed++;
				}
			}
		}

		// Create crates
		for (let i = 0; i < cratePositions.length; i++) {
			const pos = cratePositions[i];
			const mat = getCrateMaterial(i);

			const crate = MeshBuilder.CreateBox(
				`${id}_crate_${i}`,
				{ width: pos.w, height: pos.h, depth: pos.d },
				scene
			);

			// Apply rotation and position
			const rotatedX = Math.cos(rotation) * pos.x - Math.sin(rotation) * pos.z;
			const rotatedZ = Math.sin(rotation) * pos.x + Math.cos(rotation) * pos.z;

			crate.position = new Vector3(
				posX + rotatedX,
				posY + pos.y + pos.h / 2,
				posZ + rotatedZ
			);
			crate.rotation.y = rotation + pos.rot;
			crate.material = mat;
			meshes.push(crate);

			// Add details for shipping containers
			if (type === "shipping" && pos.w > crateSize * 0.8) {
				const ribMat = new PBRMaterial(`cratestack_rib_${id}_${i}`, scene);
				ribMat.albedoColor = new Color3(0.3, 0.32, 0.35);
				ribMat.metallic = 0.7;
				ribMat.roughness = 0.5;

				// Corrugation ribs
				const ribCount = 3;
				for (let r = 0; r < ribCount; r++) {
					const ribZ = (r / (ribCount - 1) - 0.5) * pos.d * 0.7;

					for (const side of [-1, 1]) {
						const rib = MeshBuilder.CreateBox(
							`${id}_rib_${i}_${r}_${side}`,
							{ width: 0.02, height: pos.h * 0.9, depth: 0.02 },
							scene
						);
						rib.position = new Vector3(
							posX + rotatedX + Math.cos(rotation + pos.rot) * (side * pos.w / 2),
							posY + pos.y + pos.h / 2,
							posZ + rotatedZ + Math.cos(rotation + pos.rot) * ribZ
						);
						rib.rotation.y = rotation + pos.rot;
						rib.material = ribMat;
						meshes.push(rib);
					}
				}
			}

			// Add straps for wooden crates
			if (type === "wooden" && rng && rng.next() > 0.5) {
				const strapMat = new PBRMaterial(`cratestack_strap_${id}_${i}`, scene);
				strapMat.albedoColor = new Color3(0.35, 0.37, 0.4);
				strapMat.metallic = 0.6;
				strapMat.roughness = 0.5;

				const strap = MeshBuilder.CreateBox(
					`${id}_strap_${i}`,
					{ width: pos.w + 0.02, height: 0.03, depth: 0.02 },
					scene
				);
				strap.position = new Vector3(
					posX + rotatedX,
					posY + pos.y + pos.h / 2,
					posZ + rotatedZ
				);
				strap.rotation.y = rotation + pos.rot;
				strap.material = strapMat;
				meshes.push(strap);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
		};
	}, [scene, id, posX, posY, posZ, type, arrangement, count, crateSize, condition, rotation, seed]);

	return null;
}
