/**
 * Crate - Storage crate/box component
 *
 * Common clutter prop for industrial and storage areas.
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

export type CrateType = "wooden" | "plastic" | "metal" | "cardboard";
export type CrateSize = "small" | "medium" | "large";

export interface CrateProps {
	id: string;
	position: Vector3;
	/** Crate type */
	type?: CrateType;
	/** Crate size */
	size?: CrateSize;
	/** Is stacked (affects positioning) */
	stacked?: boolean;
	/** Rotation (radians) */
	rotation?: number;
	/** Damage level 0-1 */
	damage?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const SIZE_DIMENSIONS: Record<CrateSize, { width: number; height: number; depth: number }> = {
	small: { width: 0.4, height: 0.3, depth: 0.4 },
	medium: { width: 0.6, height: 0.5, depth: 0.6 },
	large: { width: 1, height: 0.8, depth: 1 },
};

export function Crate({
	id,
	position,
	type = "wooden",
	size = "medium",
	stacked = false,
	rotation = 0,
	damage = 0,
	seed,
}: CrateProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const dims = SIZE_DIMENSIONS[size];
		const damageVariation = damage * (rng ? rng.next() * 0.15 : 0.1);

		// Material based on type
		const mat = new PBRMaterial(`crate_mat_${id}`, scene);

		if (type === "wooden") {
			mat.albedoColor = new Color3(
				0.55 - damageVariation,
				0.4 - damageVariation,
				0.25 - damageVariation
			);
			mat.metallic = 0;
			mat.roughness = 0.8;
		} else if (type === "plastic") {
			const plasticColors = [
				new Color3(0.2, 0.4, 0.7),  // Blue
				new Color3(0.7, 0.2, 0.2),  // Red
				new Color3(0.2, 0.6, 0.3),  // Green
				new Color3(0.8, 0.7, 0.2),  // Yellow
			];
			mat.albedoColor = rng
				? plasticColors[Math.floor(rng.next() * plasticColors.length)]
				: plasticColors[0];
			mat.metallic = 0.1;
			mat.roughness = 0.6;
		} else if (type === "metal") {
			mat.albedoColor = new Color3(
				0.4 - damageVariation,
				0.42 - damageVariation,
				0.45 - damageVariation
			);
			mat.metallic = 0.8;
			mat.roughness = 0.4 + damage * 0.3;
		} else {
			// Cardboard
			mat.albedoColor = new Color3(
				0.6 - damageVariation,
				0.5 - damageVariation,
				0.35 - damageVariation
			);
			mat.metallic = 0;
			mat.roughness = 0.95;
		}

		// Apply rotation variation from seed
		const rotVariation = rng ? (rng.next() - 0.5) * 0.1 : 0;

		// Main body
		const body = MeshBuilder.CreateBox(
			`${id}_body`,
			{ width: dims.width, height: dims.height, depth: dims.depth },
			scene
		);
		body.position = new Vector3(posX, posY + dims.height / 2, posZ);
		body.rotation.y = rotation + rotVariation;
		body.material = mat;
		meshes.push(body);

		// Type-specific details
		if (type === "wooden") {
			// Wooden slat lines
			const trimMat = new PBRMaterial(`crate_trim_${id}`, scene);
			trimMat.albedoColor = new Color3(0.35, 0.25, 0.15);
			trimMat.metallic = 0;
			trimMat.roughness = 0.85;

			// Horizontal slats
			const slatCount = size === "large" ? 4 : size === "medium" ? 3 : 2;
			for (let i = 0; i < slatCount; i++) {
				const slat = MeshBuilder.CreateBox(
					`${id}_slat_${i}`,
					{ width: dims.width + 0.02, height: 0.02, depth: dims.depth + 0.02 },
					scene
				);
				slat.position = new Vector3(
					posX,
					posY + (i + 0.5) * (dims.height / slatCount),
					posZ
				);
				slat.rotation.y = rotation + rotVariation;
				slat.material = trimMat;
				meshes.push(slat);
			}

			// Corner posts
			for (const cx of [-1, 1]) {
				for (const cz of [-1, 1]) {
					const post = MeshBuilder.CreateBox(
						`${id}_post_${cx}_${cz}`,
						{ width: 0.04, height: dims.height + 0.02, depth: 0.04 },
						scene
					);
					post.position = new Vector3(
						posX + cx * (dims.width / 2 - 0.02),
						posY + dims.height / 2,
						posZ + cz * (dims.depth / 2 - 0.02)
					);
					post.rotation.y = rotation + rotVariation;
					post.material = trimMat;
					meshes.push(post);
				}
			}
		} else if (type === "plastic") {
			// Ventilation holes
			const holeMat = new PBRMaterial(`crate_hole_${id}`, scene);
			holeMat.albedoColor = new Color3(0.1, 0.1, 0.1);
			holeMat.metallic = 0;
			holeMat.roughness = 0.9;

			const holeRows = size === "large" ? 3 : 2;
			const holeCols = size === "large" ? 4 : 3;
			for (let row = 0; row < holeRows; row++) {
				for (let col = 0; col < holeCols; col++) {
					const hole = MeshBuilder.CreateBox(
						`${id}_hole_${row}_${col}`,
						{ width: 0.03, height: 0.06, depth: 0.01 },
						scene
					);
					hole.position = new Vector3(
						posX + (col - (holeCols - 1) / 2) * (dims.width / (holeCols + 1)),
						posY + dims.height * 0.3 + row * 0.1,
						posZ + dims.depth / 2 + 0.005
					);
					hole.rotation.y = rotation + rotVariation;
					hole.material = holeMat;
					meshes.push(hole);
				}
			}

			// Rim at top
			const rim = MeshBuilder.CreateBox(
				`${id}_rim`,
				{ width: dims.width + 0.04, height: 0.03, depth: dims.depth + 0.04 },
				scene
			);
			rim.position = new Vector3(posX, posY + dims.height, posZ);
			rim.rotation.y = rotation + rotVariation;
			rim.material = mat;
			meshes.push(rim);
		} else if (type === "metal") {
			// Reinforcement ridges
			const ridgeMat = new PBRMaterial(`crate_ridge_${id}`, scene);
			ridgeMat.albedoColor = new Color3(0.35, 0.37, 0.4);
			ridgeMat.metallic = 0.85;
			ridgeMat.roughness = 0.35;

			const ridgeCount = size === "large" ? 4 : 3;
			for (let i = 0; i < ridgeCount; i++) {
				const ridge = MeshBuilder.CreateBox(
					`${id}_ridge_${i}`,
					{ width: dims.width + 0.02, height: 0.03, depth: 0.03 },
					scene
				);
				ridge.position = new Vector3(
					posX,
					posY + (i + 0.5) * (dims.height / ridgeCount),
					posZ + dims.depth / 2
				);
				ridge.rotation.y = rotation + rotVariation;
				ridge.material = ridgeMat;
				meshes.push(ridge);
			}

			// Handles
			for (const side of [-1, 1]) {
				const handle = MeshBuilder.CreateBox(
					`${id}_handle_${side}`,
					{ width: 0.15, height: 0.04, depth: 0.02 },
					scene
				);
				handle.position = new Vector3(
					posX + side * (dims.width / 2 + 0.01),
					posY + dims.height * 0.7,
					posZ
				);
				handle.rotation.y = rotation + rotVariation + Math.PI / 2;
				handle.material = ridgeMat;
				meshes.push(handle);
			}
		} else if (type === "cardboard") {
			// Tape strips
			const tapeMat = new PBRMaterial(`crate_tape_${id}`, scene);
			tapeMat.albedoColor = new Color3(0.7, 0.6, 0.4);
			tapeMat.metallic = 0;
			tapeMat.roughness = 0.7;

			// Center tape
			const tape = MeshBuilder.CreateBox(
				`${id}_tape`,
				{ width: 0.08, height: 0.01, depth: dims.depth + 0.02 },
				scene
			);
			tape.position = new Vector3(posX, posY + dims.height + 0.005, posZ);
			tape.rotation.y = rotation + rotVariation;
			tape.material = tapeMat;
			meshes.push(tape);

			// Cross tape
			const tape2 = MeshBuilder.CreateBox(
				`${id}_tape2`,
				{ width: dims.width + 0.02, height: 0.01, depth: 0.08 },
				scene
			);
			tape2.position = new Vector3(posX, posY + dims.height + 0.005, posZ);
			tape2.rotation.y = rotation + rotVariation;
			tape2.material = tapeMat;
			meshes.push(tape2);

			// Damage: partially open flap
			if (damage > 0.5 && rng) {
				const flapMat = new PBRMaterial(`crate_flap_${id}`, scene);
				flapMat.albedoColor = new Color3(0.55, 0.45, 0.3);
				flapMat.metallic = 0;
				flapMat.roughness = 0.95;

				const flap = MeshBuilder.CreateBox(
					`${id}_flap`,
					{ width: dims.width * 0.45, height: 0.01, depth: dims.depth * 0.3 },
					scene
				);
				flap.position = new Vector3(
					posX + dims.width * 0.2,
					posY + dims.height + 0.02,
					posZ - dims.depth * 0.3
				);
				flap.rotation.x = -Math.PI / 4 * damage;
				flap.rotation.y = rotation + rotVariation;
				flap.material = flapMat;
				meshes.push(flap);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			mat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, size, stacked, rotation, damage, seed]);

	return null;
}
