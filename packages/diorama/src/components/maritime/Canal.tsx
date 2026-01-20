/**
 * Canal - Water channel with walls
 *
 * Canals and waterways for flooded urban environments.
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

export type CanalType =
	| "concrete"
	| "stone"
	| "natural"
	| "industrial"
	| "venetian";

export interface CanalProps {
	id: string;
	position: Vector3;
	/** Canal type */
	type?: CanalType;
	/** Length (z) */
	length?: number;
	/** Width (x) */
	width?: number;
	/** Depth */
	depth?: number;
	/** Has walkways */
	hasWalkways?: boolean;
	/** Has mooring rings */
	hasMooring?: boolean;
	/** Water level 0-1 */
	waterLevel?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Canal({
	id,
	position,
	type = "concrete",
	length = 20,
	width = 5,
	depth = 2,
	hasWalkways = true,
	hasMooring = true,
	waterLevel = 0.7,
	condition = 0.8,
	rotation = 0,
	seed,
}: CanalProps) {
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

		// Materials
		const wallMat = new PBRMaterial(`canal_wall_${id}`, scene);
		const floorMat = new PBRMaterial(`canal_floor_${id}`, scene);
		const walkwayMat = new PBRMaterial(`canal_walkway_${id}`, scene);
		const waterMat = new PBRMaterial(`canal_water_${id}`, scene);

		if (type === "concrete") {
			wallMat.albedoColor = new Color3(0.6, 0.58, 0.55).scale(conditionFactor);
			wallMat.metallic = 0;
			wallMat.roughness = 0.8;
			floorMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(
				conditionFactor * 0.9,
			);
			floorMat.metallic = 0;
			floorMat.roughness = 0.85;
			walkwayMat.albedoColor = new Color3(0.65, 0.63, 0.6).scale(
				conditionFactor,
			);
			walkwayMat.metallic = 0;
			walkwayMat.roughness = 0.75;
		} else if (type === "stone") {
			wallMat.albedoColor = new Color3(0.45, 0.42, 0.38).scale(conditionFactor);
			wallMat.metallic = 0;
			wallMat.roughness = 0.9;
			floorMat.albedoColor = new Color3(0.4, 0.38, 0.35).scale(
				conditionFactor * 0.9,
			);
			floorMat.metallic = 0;
			floorMat.roughness = 0.95;
			walkwayMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(
				conditionFactor,
			);
			walkwayMat.metallic = 0;
			walkwayMat.roughness = 0.85;
		} else if (type === "natural") {
			wallMat.albedoColor = new Color3(0.35, 0.32, 0.28).scale(conditionFactor);
			wallMat.metallic = 0;
			wallMat.roughness = 0.95;
			floorMat.albedoColor = new Color3(0.3, 0.28, 0.22).scale(conditionFactor);
			floorMat.metallic = 0;
			floorMat.roughness = 1.0;
			walkwayMat.albedoColor = new Color3(0.4, 0.35, 0.28).scale(
				conditionFactor,
			);
			walkwayMat.metallic = 0;
			walkwayMat.roughness = 0.9;
		} else if (type === "industrial") {
			wallMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
			wallMat.metallic = 0.3;
			wallMat.roughness = 0.7;
			floorMat.albedoColor = new Color3(0.35, 0.37, 0.4).scale(
				conditionFactor * 0.9,
			);
			floorMat.metallic = 0.2;
			floorMat.roughness = 0.75;
			walkwayMat.albedoColor = new Color3(0.45, 0.47, 0.5).scale(
				conditionFactor,
			);
			walkwayMat.metallic = 0.4;
			walkwayMat.roughness = 0.6;
		} else {
			// Venetian style
			wallMat.albedoColor = new Color3(0.55, 0.45, 0.35).scale(conditionFactor);
			wallMat.metallic = 0;
			wallMat.roughness = 0.85;
			floorMat.albedoColor = new Color3(0.45, 0.4, 0.35).scale(
				conditionFactor * 0.9,
			);
			floorMat.metallic = 0;
			floorMat.roughness = 0.9;
			walkwayMat.albedoColor = new Color3(0.7, 0.65, 0.55).scale(
				conditionFactor,
			);
			walkwayMat.metallic = 0;
			walkwayMat.roughness = 0.7;
		}

		waterMat.albedoColor = new Color3(0.15, 0.25, 0.35);
		waterMat.metallic = 0.2;
		waterMat.roughness = 0.1;
		waterMat.alpha = 0.8;

		const wallThickness = 0.3;
		const wallHeight = depth + 0.3;

		// Canal walls
		for (const side of [-1, 1]) {
			const wall = MeshBuilder.CreateBox(
				`${id}_wall_${side}`,
				{ width: wallThickness, height: wallHeight, depth: length },
				scene,
			);
			wall.position = new Vector3(
				posX + Math.cos(rotation) * (side * (width / 2 + wallThickness / 2)),
				posY - depth / 2 + wallHeight / 2,
				posZ - Math.sin(rotation) * (side * (width / 2 + wallThickness / 2)),
			);
			wall.rotation.y = rotation;
			wall.material = wallMat;
			meshes.push(wall);
		}

		// Canal floor
		const floor = MeshBuilder.CreateBox(
			`${id}_floor`,
			{ width: width, height: 0.2, depth: length },
			scene,
		);
		floor.position = new Vector3(posX, posY - depth, posZ);
		floor.rotation.y = rotation;
		floor.material = floorMat;
		meshes.push(floor);

		// Water surface
		const waterHeight = depth * waterLevel;
		const water = MeshBuilder.CreateBox(
			`${id}_water`,
			{ width: width - 0.1, height: 0.05, depth: length - 0.1 },
			scene,
		);
		water.position = new Vector3(posX, posY - depth + waterHeight, posZ);
		water.rotation.y = rotation;
		water.material = waterMat;
		meshes.push(water);

		// Walkways
		if (hasWalkways) {
			const walkwayWidth = 1.2;
			for (const side of [-1, 1]) {
				const walkway = MeshBuilder.CreateBox(
					`${id}_walkway_${side}`,
					{ width: walkwayWidth, height: 0.15, depth: length },
					scene,
				);
				walkway.position = new Vector3(
					posX +
						Math.cos(rotation) *
							(side * (width / 2 + wallThickness + walkwayWidth / 2)),
					posY + 0.075,
					posZ -
						Math.sin(rotation) *
							(side * (width / 2 + wallThickness + walkwayWidth / 2)),
				);
				walkway.rotation.y = rotation;
				walkway.material = walkwayMat;
				meshes.push(walkway);

				// Walkway edge/curb
				const curb = MeshBuilder.CreateBox(
					`${id}_curb_${side}`,
					{ width: 0.1, height: 0.2, depth: length },
					scene,
				);
				curb.position = new Vector3(
					posX +
						Math.cos(rotation) * (side * (width / 2 + wallThickness + 0.05)),
					posY + 0.1,
					posZ -
						Math.sin(rotation) * (side * (width / 2 + wallThickness + 0.05)),
				);
				curb.rotation.y = rotation;
				curb.material = wallMat;
				meshes.push(curb);
			}
		}

		// Mooring rings
		if (hasMooring) {
			const mooringMat = new PBRMaterial(`canal_mooring_${id}`, scene);
			mooringMat.albedoColor = new Color3(0.3, 0.32, 0.35).scale(
				conditionFactor,
			);
			mooringMat.metallic = 0.85;
			mooringMat.roughness = 0.4;

			const ringSpacing = 4;
			const ringCount = Math.floor(length / ringSpacing);

			for (let r = 0; r < ringCount; r++) {
				const rz = (r - (ringCount - 1) / 2) * ringSpacing;

				for (const side of [-1, 1]) {
					// Ring mount
					const mount = MeshBuilder.CreateCylinder(
						`${id}_mount_${r}_${side}`,
						{ height: 0.15, diameter: 0.12 },
						scene,
					);
					mount.position = new Vector3(
						posX +
							Math.cos(rotation) * (side * (width / 2 + wallThickness / 2)) -
							Math.sin(rotation) * rz,
						posY + 0.075,
						posZ -
							Math.sin(rotation) * (side * (width / 2 + wallThickness / 2)) -
							Math.cos(rotation) * rz,
					);
					mount.material = mooringMat;
					meshes.push(mount);

					// Ring (torus)
					const ring = MeshBuilder.CreateTorus(
						`${id}_ring_${r}_${side}`,
						{ diameter: 0.15, thickness: 0.02, tessellation: 16 },
						scene,
					);
					ring.position = new Vector3(
						posX +
							Math.cos(rotation) * (side * (width / 2 + wallThickness + 0.05)) -
							Math.sin(rotation) * rz,
						posY + 0.15,
						posZ -
							Math.sin(rotation) * (side * (width / 2 + wallThickness + 0.05)) -
							Math.cos(rotation) * rz,
					);
					ring.rotation.z = Math.PI / 2;
					ring.rotation.y = rotation;
					ring.material = mooringMat;
					meshes.push(ring);
				}
			}
		}

		// Add some weathering details for older conditions
		if (conditionFactor < 0.7 && type !== "natural") {
			const stainMat = new PBRMaterial(`canal_stain_${id}`, scene);
			stainMat.albedoColor = new Color3(0.2, 0.22, 0.18);
			stainMat.metallic = 0;
			stainMat.roughness = 0.95;
			stainMat.alpha = 0.4;

			// Water stain line
			const stainCount = 3 + (rng ? Math.floor(rng.next() * 3) : 0);
			for (let s = 0; s < stainCount; s++) {
				const sz =
					(rng ? rng.next() - 0.5 : s / stainCount - 0.5) * (length - 2);
				const stainWidth = 0.5 + (rng ? rng.next() * 0.5 : 0);

				for (const side of [-1, 1]) {
					const stain = MeshBuilder.CreateBox(
						`${id}_stain_${s}_${side}`,
						{ width: 0.02, height: 0.3, depth: stainWidth },
						scene,
					);
					stain.position = new Vector3(
						posX +
							Math.cos(rotation) * (side * (width / 2 + 0.01)) -
							Math.sin(rotation) * sz,
						posY - depth + waterHeight + 0.15,
						posZ -
							Math.sin(rotation) * (side * (width / 2 + 0.01)) -
							Math.cos(rotation) * sz,
					);
					stain.rotation.y = rotation;
					stain.material = stainMat;
					meshes.push(stain);
				}
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			wallMat.dispose();
			floorMat.dispose();
			walkwayMat.dispose();
			waterMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		length,
		width,
		depth,
		hasWalkways,
		hasMooring,
		waterLevel,
		condition,
		rotation,
		seed,
	]);

	return null;
}
