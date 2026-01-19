/**
 * Door - Doorway/entrance component
 *
 * Supports various door types common in Japanese urban environments.
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

export type DoorType = "single" | "double" | "sliding" | "shutter" | "noren";
export type DoorMaterial = "metal" | "wood" | "glass" | "plastic";
export type DoorState = "open" | "closed" | "halfopen";

export interface DoorProps {
	id: string;
	position: Vector3;
	/** Door type */
	type?: DoorType;
	/** Door material */
	material?: DoorMaterial;
	/** Door state */
	state?: DoorState;
	/** Width of doorway */
	width?: number;
	/** Height of doorway */
	height?: number;
	/** Include door frame */
	frame?: boolean;
	/** Direction door faces (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const MATERIAL_COLORS: Record<DoorMaterial, { base: Color3; metallic: number; roughness: number; alpha?: number }> = {
	metal: { base: new Color3(0.4, 0.42, 0.45), metallic: 0.85, roughness: 0.4 },
	wood: { base: new Color3(0.4, 0.28, 0.18), metallic: 0, roughness: 0.7 },
	glass: { base: new Color3(0.7, 0.75, 0.8), metallic: 0.1, roughness: 0.1, alpha: 0.4 },
	plastic: { base: new Color3(0.8, 0.8, 0.82), metallic: 0, roughness: 0.6 },
};

export function Door({
	id,
	position,
	type = "single",
	material = "metal",
	state = "closed",
	width = 1,
	height = 2.2,
	frame = true,
	rotation = 0,
	seed,
}: DoorProps) {
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

		// Create door material
		const mat = new PBRMaterial(`door_mat_${id}`, scene);
		const colors = MATERIAL_COLORS[material];
		mat.albedoColor = new Color3(
			colors.base.r + materialVariation,
			colors.base.g + materialVariation,
			colors.base.b + materialVariation
		);
		mat.metallic = colors.metallic;
		mat.roughness = colors.roughness;
		if (colors.alpha) {
			mat.alpha = colors.alpha;
		}

		// Frame material
		const frameMat = new PBRMaterial(`frame_mat_${id}`, scene);
		frameMat.albedoColor = new Color3(0.3, 0.3, 0.32);
		frameMat.metallic = 0.7;
		frameMat.roughness = 0.5;

		const doorThickness = 0.05;
		const frameThickness = 0.08;
		const frameDepth = 0.15;

		// Door frame
		if (frame) {
			// Top frame
			const topFrame = MeshBuilder.CreateBox(
				`${id}_frame_top`,
				{ width: width + frameThickness * 2, height: frameThickness, depth: frameDepth },
				scene
			);
			topFrame.position = new Vector3(posX, posY + height + frameThickness / 2, posZ);
			topFrame.rotation.y = rotation;
			topFrame.material = frameMat;
			meshes.push(topFrame);

			// Side frames
			for (const side of [-1, 1]) {
				const sideFrame = MeshBuilder.CreateBox(
					`${id}_frame_side_${side}`,
					{ width: frameThickness, height: height, depth: frameDepth },
					scene
				);
				sideFrame.position = new Vector3(
					posX + (side * (width + frameThickness)) / 2,
					posY + height / 2,
					posZ
				);
				sideFrame.rotation.y = rotation;
				sideFrame.material = frameMat;
				meshes.push(sideFrame);
			}
		}

		// Door panel(s) based on type and state
		if (type === "single") {
			const door = MeshBuilder.CreateBox(
				`${id}_door`,
				{ width: width * 0.95, height: height * 0.98, depth: doorThickness },
				scene
			);

			let doorRotation = 0;
			let doorOffsetX = 0;
			let doorOffsetZ = 0;

			if (state === "open") {
				doorRotation = Math.PI / 2;
				doorOffsetX = width / 2;
				doorOffsetZ = width / 2;
			} else if (state === "halfopen") {
				doorRotation = Math.PI / 4;
				doorOffsetX = width / 4;
				doorOffsetZ = width / 4;
			}

			door.position = new Vector3(posX + doorOffsetX, posY + height / 2, posZ + doorOffsetZ);
			door.rotation.y = rotation + doorRotation;
			door.material = mat;
			meshes.push(door);

			// Door handle
			const handle = MeshBuilder.CreateCylinder(
				`${id}_handle`,
				{ height: 0.12, diameter: 0.02 },
				scene
			);
			handle.position = new Vector3(
				posX + doorOffsetX + width * 0.35,
				posY + height * 0.45,
				posZ + doorOffsetZ + doorThickness / 2 + 0.02
			);
			handle.rotation.x = Math.PI / 2;
			handle.rotation.y = rotation + doorRotation;
			handle.material = frameMat;
			meshes.push(handle);
		} else if (type === "double") {
			for (const side of [-1, 1]) {
				const door = MeshBuilder.CreateBox(
					`${id}_door_${side}`,
					{ width: width * 0.47, height: height * 0.98, depth: doorThickness },
					scene
				);

				let doorRotation = 0;
				let doorOffsetX = (side * width) / 4;
				let doorOffsetZ = 0;

				if (state === "open") {
					doorRotation = side * Math.PI / 2;
					doorOffsetX = (side * width) / 2;
					doorOffsetZ = width / 4;
				} else if (state === "halfopen") {
					doorRotation = side * Math.PI / 4;
					doorOffsetX = (side * width) / 3;
					doorOffsetZ = width / 8;
				}

				door.position = new Vector3(posX + doorOffsetX, posY + height / 2, posZ + doorOffsetZ);
				door.rotation.y = rotation + doorRotation;
				door.material = mat;
				meshes.push(door);
			}
		} else if (type === "sliding") {
			const slideAmount = state === "open" ? width * 0.9 : state === "halfopen" ? width * 0.45 : 0;

			const door = MeshBuilder.CreateBox(
				`${id}_door`,
				{ width: width * 0.95, height: height * 0.98, depth: doorThickness },
				scene
			);
			door.position = new Vector3(posX + slideAmount, posY + height / 2, posZ);
			door.rotation.y = rotation;
			door.material = mat;
			meshes.push(door);

			// Sliding track
			const track = MeshBuilder.CreateBox(
				`${id}_track`,
				{ width: width * 2, height: 0.03, depth: 0.05 },
				scene
			);
			track.position = new Vector3(posX + width / 2, posY + height + 0.02, posZ);
			track.rotation.y = rotation;
			track.material = frameMat;
			meshes.push(track);
		} else if (type === "shutter") {
			const shutterHeight = state === "closed" ? height : state === "halfopen" ? height / 2 : height * 0.1;
			const shutterY = posY + height - shutterHeight / 2;

			const shutter = MeshBuilder.CreateBox(
				`${id}_shutter`,
				{ width: width * 0.98, height: shutterHeight, depth: doorThickness },
				scene
			);
			shutter.position = new Vector3(posX, shutterY, posZ);
			shutter.rotation.y = rotation;
			shutter.material = mat;
			meshes.push(shutter);

			// Horizontal lines on shutter
			const lineCount = Math.floor(shutterHeight / 0.1);
			for (let i = 0; i < lineCount; i++) {
				const line = MeshBuilder.CreateBox(
					`${id}_shutter_line_${i}`,
					{ width: width * 0.96, height: 0.01, depth: doorThickness + 0.01 },
					scene
				);
				line.position = new Vector3(
					posX,
					shutterY - shutterHeight / 2 + (i + 0.5) * (shutterHeight / lineCount),
					posZ
				);
				line.rotation.y = rotation;
				line.material = frameMat;
				meshes.push(line);
			}
		} else if (type === "noren") {
			// Traditional Japanese fabric curtain
			const norenMat = new PBRMaterial(`noren_mat_${id}`, scene);
			norenMat.albedoColor = rng
				? new Color3(rng.next() * 0.3 + 0.1, rng.next() * 0.2 + 0.1, rng.next() * 0.4 + 0.2)
				: new Color3(0.2, 0.15, 0.4);
			norenMat.metallic = 0;
			norenMat.roughness = 0.9;

			const stripCount = 4;
			const stripWidth = width / stripCount * 0.9;
			const stripHeight = height * 0.6;

			for (let i = 0; i < stripCount; i++) {
				const strip = MeshBuilder.CreateBox(
					`${id}_noren_${i}`,
					{ width: stripWidth, height: stripHeight, depth: 0.01 },
					scene
				);
				strip.position = new Vector3(
					posX + (i - stripCount / 2 + 0.5) * (width / stripCount),
					posY + height - stripHeight / 2 - 0.1,
					posZ
				);
				strip.rotation.y = rotation;
				strip.material = norenMat;
				meshes.push(strip);
			}

			// Rod at top
			const rod = MeshBuilder.CreateCylinder(
				`${id}_rod`,
				{ height: width, diameter: 0.03 },
				scene
			);
			rod.position = new Vector3(posX, posY + height - 0.05, posZ);
			rod.rotation.z = Math.PI / 2;
			rod.rotation.y = rotation;
			rod.material = frameMat;
			meshes.push(rod);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			mat.dispose();
			frameMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, material, state, width, height, frame, rotation, seed]);

	return null;
}
