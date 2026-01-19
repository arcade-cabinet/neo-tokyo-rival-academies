/**
 * Tarpaulin - Covers and makeshift shelters
 *
 * Tarps and covers for urban environments.
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

export type TarpaulinType = "flat" | "tent" | "draped" | "awning" | "wrapped";
export type TarpaulinColor = "blue" | "green" | "orange" | "gray" | "camo";

export interface TarpaulinProps {
	id: string;
	position: Vector3;
	/** Tarpaulin type */
	type?: TarpaulinType;
	/** Tarpaulin color */
	color?: TarpaulinColor;
	/** Width (x) */
	width?: number;
	/** Depth (z) */
	depth?: number;
	/** Has grommets */
	hasGrommets?: boolean;
	/** Is torn */
	isTorn?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Tarpaulin({
	id,
	position,
	type = "flat",
	color = "blue",
	width = 2,
	depth = 2,
	hasGrommets = true,
	isTorn = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: TarpaulinProps) {
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

		// Material
		const tarpMat = new PBRMaterial(`tarp_${id}`, scene);

		switch (color) {
			case "blue":
				tarpMat.albedoColor = new Color3(0.15, 0.35, 0.6).scale(conditionFactor);
				break;
			case "green":
				tarpMat.albedoColor = new Color3(0.2, 0.4, 0.2).scale(conditionFactor);
				break;
			case "orange":
				tarpMat.albedoColor = new Color3(0.85, 0.45, 0.1).scale(conditionFactor);
				break;
			case "gray":
				tarpMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
				break;
			case "camo":
				tarpMat.albedoColor = new Color3(0.35, 0.4, 0.3).scale(conditionFactor);
				break;
		}
		tarpMat.metallic = 0.1;
		tarpMat.roughness = 0.7;

		if (type === "flat") {
			// Flat tarp on ground
			const tarp = MeshBuilder.CreatePlane(
				`${id}_tarp`,
				{ width: width, height: depth },
				scene
			);
			tarp.position = new Vector3(posX, posY + 0.01, posZ);
			tarp.rotation.x = Math.PI / 2;
			tarp.rotation.z = rotation;
			tarp.material = tarpMat;
			meshes.push(tarp);

			// Wrinkles
			const wrinkleCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let w = 0; w < wrinkleCount; w++) {
				const wx = (rng ? (rng.next() - 0.5) : (w / wrinkleCount - 0.5)) * width * 0.8;
				const wz = (rng ? (rng.next() - 0.5) : 0) * depth * 0.8;
				const wrinkleLen = 0.3 + (rng ? rng.next() * 0.3 : 0.15);

				const wrinkle = MeshBuilder.CreateCylinder(
					`${id}_wrinkle_${w}`,
					{ height: wrinkleLen, diameter: 0.05 },
					scene
				);
				wrinkle.position = new Vector3(
					posX + Math.cos(rotation) * wx - Math.sin(rotation) * wz,
					posY + 0.025,
					posZ - Math.sin(rotation) * wx - Math.cos(rotation) * wz
				);
				wrinkle.rotation.z = Math.PI / 2;
				wrinkle.rotation.y = rotation + (rng ? rng.next() * Math.PI : 0);
				wrinkle.scaling = new Vector3(1, 1, 0.5);
				wrinkle.material = tarpMat;
				meshes.push(wrinkle);
			}

		} else if (type === "tent") {
			// A-frame tent shape
			const tentHeight = Math.min(width, depth) * 0.5;

			// Create tent panels
			const ridgeLen = depth;

			// Left panel
			const leftPanel = MeshBuilder.CreatePlane(
				`${id}_left`,
				{ width: width / 2 / Math.cos(Math.atan2(tentHeight, width / 2)), height: ridgeLen },
				scene
			);
			leftPanel.position = new Vector3(
				posX - Math.cos(rotation) * (width / 4),
				posY + tentHeight / 2,
				posZ + Math.sin(rotation) * (width / 4)
			);
			leftPanel.rotation.y = rotation;
			leftPanel.rotation.z = -Math.atan2(tentHeight, width / 2);
			leftPanel.material = tarpMat;
			meshes.push(leftPanel);

			// Right panel
			const rightPanel = MeshBuilder.CreatePlane(
				`${id}_right`,
				{ width: width / 2 / Math.cos(Math.atan2(tentHeight, width / 2)), height: ridgeLen },
				scene
			);
			rightPanel.position = new Vector3(
				posX + Math.cos(rotation) * (width / 4),
				posY + tentHeight / 2,
				posZ - Math.sin(rotation) * (width / 4)
			);
			rightPanel.rotation.y = rotation;
			rightPanel.rotation.z = Math.atan2(tentHeight, width / 2);
			rightPanel.material = tarpMat;
			meshes.push(rightPanel);

		} else if (type === "draped") {
			// Draped over object
			const drapeHeight = 0.5 + (rng ? rng.next() * 0.3 : 0.15);

			// Top surface
			const top = MeshBuilder.CreatePlane(
				`${id}_top`,
				{ width: width * 0.8, height: depth * 0.8 },
				scene
			);
			top.position = new Vector3(posX, posY + drapeHeight, posZ);
			top.rotation.x = Math.PI / 2;
			top.rotation.z = rotation;
			top.material = tarpMat;
			meshes.push(top);

			// Hanging sides
			for (const side of [-1, 1]) {
				const sidePanel = MeshBuilder.CreatePlane(
					`${id}_side_${side}`,
					{ width: width * 0.8, height: drapeHeight },
					scene
				);
				sidePanel.position = new Vector3(
					posX - Math.sin(rotation) * (side * depth * 0.4),
					posY + drapeHeight / 2,
					posZ - Math.cos(rotation) * (side * depth * 0.4)
				);
				sidePanel.rotation.y = rotation + Math.PI / 2;
				sidePanel.material = tarpMat;
				meshes.push(sidePanel);
			}

		} else if (type === "awning") {
			// Angled awning
			const awningAngle = Math.PI / 6;

			const awning = MeshBuilder.CreatePlane(
				`${id}_awning`,
				{ width: width, height: depth / Math.cos(awningAngle) },
				scene
			);
			awning.position = new Vector3(
				posX,
				posY + depth * Math.sin(awningAngle) / 2,
				posZ - depth * Math.cos(awningAngle) / 2
			);
			awning.rotation.x = Math.PI / 2 - awningAngle;
			awning.rotation.z = rotation;
			awning.material = tarpMat;
			meshes.push(awning);

			// Support poles
			const poleMat = new PBRMaterial(`tarp_pole_${id}`, scene);
			poleMat.albedoColor = new Color3(0.5, 0.52, 0.55);
			poleMat.metallic = 0.7;
			poleMat.roughness = 0.4;

			for (const side of [-1, 1]) {
				const pole = MeshBuilder.CreateCylinder(
					`${id}_pole_${side}`,
					{ height: depth * Math.sin(awningAngle) + 0.5, diameter: 0.03 },
					scene
				);
				pole.position = new Vector3(
					posX + Math.cos(rotation) * (side * width / 2),
					posY + (depth * Math.sin(awningAngle) + 0.5) / 2 - 0.25,
					posZ - Math.sin(rotation) * (side * width / 2) - depth * Math.cos(awningAngle)
				);
				pole.material = poleMat;
				meshes.push(pole);
			}

		} else {
			// Wrapped around object
			const wrapRadius = Math.min(width, depth) / 2;
			const wrapHeight = 0.8;

			const wrap = MeshBuilder.CreateCylinder(
				`${id}_wrap`,
				{ height: wrapHeight, diameter: wrapRadius * 2, tessellation: 12 },
				scene
			);
			wrap.position = new Vector3(posX, posY + wrapHeight / 2, posZ);
			wrap.material = tarpMat;
			meshes.push(wrap);

			// Loose top
			const looseTop = MeshBuilder.CreateDisc(
				`${id}_top`,
				{ radius: wrapRadius * 1.1, tessellation: 12 },
				scene
			);
			looseTop.position = new Vector3(posX, posY + wrapHeight + 0.02, posZ);
			looseTop.rotation.x = Math.PI / 2;
			looseTop.material = tarpMat;
			meshes.push(looseTop);
		}

		// Grommets
		if (hasGrommets && type !== "wrapped") {
			const grommetMat = new PBRMaterial(`tarp_grommet_${id}`, scene);
			grommetMat.albedoColor = new Color3(0.5, 0.52, 0.55);
			grommetMat.metallic = 0.8;
			grommetMat.roughness = 0.4;

			const grommetPositions = [
				[-width / 2, -depth / 2],
				[width / 2, -depth / 2],
				[-width / 2, depth / 2],
				[width / 2, depth / 2],
			];

			for (let g = 0; g < grommetPositions.length; g++) {
				const [gx, gz] = grommetPositions[g];
				const gy = type === "flat" ? 0.015 : type === "tent" ? 0.02 : 0.1;

				const grommet = MeshBuilder.CreateTorus(
					`${id}_grommet_${g}`,
					{ diameter: 0.03, thickness: 0.005, tessellation: 12 },
					scene
				);
				grommet.position = new Vector3(
					posX + Math.cos(rotation) * gx * 0.9 - Math.sin(rotation) * gz * 0.9,
					posY + gy,
					posZ - Math.sin(rotation) * gx * 0.9 - Math.cos(rotation) * gz * 0.9
				);
				grommet.rotation.x = Math.PI / 2;
				grommet.material = grommetMat;
				meshes.push(grommet);
			}
		}

		// Torn holes
		if (isTorn) {
			const holeMat = new PBRMaterial(`tarp_hole_${id}`, scene);
			holeMat.albedoColor = new Color3(0, 0, 0);
			holeMat.metallic = 0;
			holeMat.roughness = 1;
			holeMat.alpha = 0;

			const holeCount = 1 + (rng ? Math.floor(rng.next() * 2) : 1);
			for (let h = 0; h < holeCount; h++) {
				const hx = (rng ? (rng.next() - 0.5) : 0) * width * 0.6;
				const hz = (rng ? (rng.next() - 0.5) : 0) * depth * 0.6;
				const holeSize = 0.1 + (rng ? rng.next() * 0.15 : 0.08);

				// Hole represented by darker patch
				const tearMat = new PBRMaterial(`tarp_tear_${id}_${h}`, scene);
				tearMat.albedoColor = tarpMat.albedoColor.scale(0.5);
				tearMat.metallic = 0;
				tearMat.roughness = 0.9;

				const tear = MeshBuilder.CreateDisc(
					`${id}_tear_${h}`,
					{ radius: holeSize, tessellation: 8 },
					scene
				);
				tear.position = new Vector3(
					posX + Math.cos(rotation) * hx - Math.sin(rotation) * hz,
					posY + 0.02,
					posZ - Math.sin(rotation) * hx - Math.cos(rotation) * hz
				);
				tear.rotation.x = Math.PI / 2;
				tear.material = tearMat;
				meshes.push(tear);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			tarpMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, color, width, depth, hasGrommets, isTorn, condition, rotation, seed]);

	return null;
}
