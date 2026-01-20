/**
 * Tree - Urban tree component
 *
 * Trees for parks, streets, and overgrown areas.
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

export type TreeType = "deciduous" | "conifer" | "palm" | "dead" | "bonsai";
export type TreeSize = "small" | "medium" | "large";

export interface TreeProps {
	id: string;
	position: Vector3;
	/** Tree type */
	type?: TreeType;
	/** Tree size */
	size?: TreeSize;
	/** Season affects foliage color */
	season?: "spring" | "summer" | "autumn" | "winter";
	/** Health 0-1 (dead trees have 0) */
	health?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const SIZE_SCALES: Record<TreeSize, number> = {
	small: 0.6,
	medium: 1,
	large: 1.5,
};

export function Tree({
	id,
	position,
	type = "deciduous",
	size = "medium",
	season = "summer",
	health = 1,
	seed,
}: TreeProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const scale = SIZE_SCALES[size];

		// Trunk material
		const trunkMat = new PBRMaterial(`tree_trunk_${id}`, scene);
		trunkMat.albedoColor =
			type === "palm"
				? new Color3(0.5, 0.4, 0.3)
				: new Color3(0.35, 0.25, 0.15);
		trunkMat.metallic = 0;
		trunkMat.roughness = 0.9;

		// Foliage color based on type and season
		let foliageColor: Color3;
		if (type === "dead" || health < 0.2) {
			foliageColor = new Color3(0.4, 0.35, 0.25);
		} else if (type === "conifer") {
			foliageColor = new Color3(0.15, 0.35, 0.15);
		} else if (type === "palm") {
			foliageColor = new Color3(0.2, 0.45, 0.15);
		} else {
			// Deciduous - season dependent
			switch (season) {
				case "spring":
					foliageColor = new Color3(0.4, 0.55, 0.25);
					break;
				case "autumn":
					foliageColor = new Color3(0.7, 0.4, 0.15);
					break;
				case "winter":
					foliageColor = new Color3(0.45, 0.42, 0.38);
					break;
				default:
					foliageColor = new Color3(0.2, 0.45, 0.15);
			}
		}

		// Apply health variation
		foliageColor = foliageColor.scale(0.7 + health * 0.3);

		const foliageMat = new PBRMaterial(`tree_foliage_${id}`, scene);
		foliageMat.albedoColor = foliageColor;
		foliageMat.metallic = 0;
		foliageMat.roughness = 0.85;

		const trunkHeight =
			(type === "palm" ? 4 : type === "bonsai" ? 0.4 : 2.5) * scale;
		const trunkRadius =
			(type === "palm" ? 0.15 : type === "bonsai" ? 0.05 : 0.15) * scale;

		if (type === "deciduous" || type === "dead") {
			// Trunk
			const trunk = MeshBuilder.CreateCylinder(
				`${id}_trunk`,
				{
					height: trunkHeight,
					diameterTop: trunkRadius * 0.6,
					diameterBottom: trunkRadius,
				},
				scene,
			);
			trunk.position = new Vector3(posX, posY + trunkHeight / 2, posZ);
			trunk.material = trunkMat;
			meshes.push(trunk);

			// Main branches (simplified)
			if (type !== "dead" || health > 0) {
				const branchCount = rng ? 3 + Math.floor(rng.next() * 3) : 4;
				for (let i = 0; i < branchCount; i++) {
					const branchAngle =
						(i / branchCount) * Math.PI * 2 + (rng ? rng.next() * 0.5 : 0);
					const branchLength = (0.8 + (rng ? rng.next() * 0.4 : 0)) * scale;

					const branch = MeshBuilder.CreateCylinder(
						`${id}_branch_${i}`,
						{
							height: branchLength,
							diameterTop: 0.02 * scale,
							diameterBottom: 0.05 * scale,
						},
						scene,
					);
					branch.position = new Vector3(
						posX + Math.cos(branchAngle) * branchLength * 0.4,
						posY +
							trunkHeight * 0.7 +
							(rng ? rng.next() * trunkHeight * 0.2 : 0),
						posZ + Math.sin(branchAngle) * branchLength * 0.4,
					);
					branch.rotation.z = Math.PI / 4;
					branch.rotation.y = branchAngle;
					branch.material = trunkMat;
					meshes.push(branch);
				}
			}

			// Foliage clusters (spheres)
			if (type !== "dead" && health > 0.3) {
				const clusterCount = rng ? 4 + Math.floor(rng.next() * 4) : 5;
				for (let i = 0; i < clusterCount; i++) {
					const clusterSize = (0.8 + (rng ? rng.next() * 0.6 : 0)) * scale;
					const angle = rng
						? rng.next() * Math.PI * 2
						: (i / clusterCount) * Math.PI * 2;
					const radius = (rng ? rng.next() * 0.8 : 0.5) * scale;

					const cluster = MeshBuilder.CreateSphere(
						`${id}_foliage_${i}`,
						{ diameter: clusterSize },
						scene,
					);
					cluster.position = new Vector3(
						posX + Math.cos(angle) * radius,
						posY + trunkHeight + (rng ? rng.next() * scale : 0.5 * scale),
						posZ + Math.sin(angle) * radius,
					);
					cluster.material = foliageMat;
					meshes.push(cluster);
				}
			}
		} else if (type === "conifer") {
			// Trunk
			const trunk = MeshBuilder.CreateCylinder(
				`${id}_trunk`,
				{
					height: trunkHeight,
					diameterTop: trunkRadius * 0.5,
					diameterBottom: trunkRadius,
				},
				scene,
			);
			trunk.position = new Vector3(posX, posY + trunkHeight / 2, posZ);
			trunk.material = trunkMat;
			meshes.push(trunk);

			// Conical foliage layers
			const layerCount = 4;
			for (let i = 0; i < layerCount; i++) {
				const layerY =
					posY + trunkHeight * 0.4 + i * ((trunkHeight * 0.5) / layerCount);
				const layerSize = (1.5 - i * 0.3) * scale;

				const layer = MeshBuilder.CreateCylinder(
					`${id}_layer_${i}`,
					{
						height: layerSize * 0.4,
						diameterTop: layerSize * 0.3,
						diameterBottom: layerSize,
					},
					scene,
				);
				layer.position = new Vector3(posX, layerY, posZ);
				layer.material = foliageMat;
				meshes.push(layer);
			}
		} else if (type === "palm") {
			// Trunk with texture bands
			const trunk = MeshBuilder.CreateCylinder(
				`${id}_trunk`,
				{
					height: trunkHeight,
					diameterTop: trunkRadius * 0.8,
					diameterBottom: trunkRadius,
				},
				scene,
			);
			trunk.position = new Vector3(posX, posY + trunkHeight / 2, posZ);
			trunk.material = trunkMat;
			meshes.push(trunk);

			// Trunk bands
			const bandCount = Math.floor(trunkHeight / 0.3);
			for (let i = 0; i < bandCount; i++) {
				const band = MeshBuilder.CreateTorus(
					`${id}_band_${i}`,
					{ diameter: trunkRadius * 1.8, thickness: 0.02 },
					scene,
				);
				band.position = new Vector3(
					posX,
					posY + (i + 0.5) * (trunkHeight / bandCount),
					posZ,
				);
				band.rotation.x = Math.PI / 2;
				band.material = trunkMat;
				meshes.push(band);
			}

			// Palm fronds
			const frondCount = rng ? 6 + Math.floor(rng.next() * 4) : 8;
			for (let i = 0; i < frondCount; i++) {
				const frondAngle =
					(i / frondCount) * Math.PI * 2 + (rng ? rng.next() * 0.3 : 0);
				const frondLength = (1.5 + (rng ? rng.next() * 0.5 : 0)) * scale;

				const frond = MeshBuilder.CreateBox(
					`${id}_frond_${i}`,
					{ width: 0.3 * scale, height: 0.02, depth: frondLength },
					scene,
				);
				frond.position = new Vector3(
					posX + Math.cos(frondAngle) * frondLength * 0.4,
					posY + trunkHeight - 0.1,
					posZ + Math.sin(frondAngle) * frondLength * 0.4,
				);
				frond.rotation.y = frondAngle;
				frond.rotation.x = Math.PI / 4 + (rng ? rng.next() * 0.2 : 0);
				frond.material = foliageMat;
				meshes.push(frond);
			}
		} else if (type === "bonsai") {
			// Twisted trunk
			const trunk = MeshBuilder.CreateCylinder(
				`${id}_trunk`,
				{
					height: trunkHeight,
					diameterTop: trunkRadius * 0.7,
					diameterBottom: trunkRadius,
				},
				scene,
			);
			trunk.position = new Vector3(posX, posY + trunkHeight / 2, posZ);
			trunk.rotation.z = (rng ? rng.next() - 0.5 : 0) * 0.3;
			trunk.material = trunkMat;
			meshes.push(trunk);

			// Compact foliage clusters
			const clusterCount = rng ? 2 + Math.floor(rng.next() * 2) : 3;
			for (let i = 0; i < clusterCount; i++) {
				const cluster = MeshBuilder.CreateSphere(
					`${id}_foliage_${i}`,
					{ diameter: 0.25 * scale },
					scene,
				);
				const angle = (i / clusterCount) * Math.PI * 2;
				cluster.position = new Vector3(
					posX + Math.cos(angle) * 0.1 * scale,
					posY + trunkHeight + 0.1 * scale,
					posZ + Math.sin(angle) * 0.1 * scale,
				);
				cluster.scaling = new Vector3(1, 0.6, 1);
				cluster.material = foliageMat;
				meshes.push(cluster);
			}

			// Pot
			const potMat = new PBRMaterial(`tree_pot_${id}`, scene);
			potMat.albedoColor = new Color3(0.5, 0.35, 0.25);
			potMat.metallic = 0;
			potMat.roughness = 0.8;

			const pot = MeshBuilder.CreateCylinder(
				`${id}_pot`,
				{
					height: 0.15 * scale,
					diameterTop: 0.3 * scale,
					diameterBottom: 0.25 * scale,
				},
				scene,
			);
			pot.position = new Vector3(posX, posY + 0.075 * scale, posZ);
			pot.material = potMat;
			meshes.push(pot);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			trunkMat.dispose();
			foliageMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, size, season, health, seed]);

	return null;
}
