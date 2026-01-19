/**
 * Clothesline - Laundry hanging between buildings
 *
 * Clothes and linens hanging to dry, adding life to the urban environment.
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

export type ClotheslineType = "residential" | "commercial" | "makeshift";

export interface ClotheslineProps {
	id: string;
	position: Vector3;
	/** Clothesline type */
	type?: ClotheslineType;
	/** Length of the line */
	length?: number;
	/** Number of items hanging */
	itemCount?: number;
	/** Has poles at ends */
	hasPoles?: boolean;
	/** Line sag amount */
	sag?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Clothesline({
	id,
	position,
	type = "residential",
	length = 4,
	itemCount = 5,
	hasPoles = true,
	sag = 0.3,
	condition = 0.8,
	rotation = 0,
	seed,
}: ClotheslineProps) {
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

		// Rope/line material
		const ropeMat = new PBRMaterial(`clothesline_rope_${id}`, scene);
		ropeMat.albedoColor = type === "makeshift"
			? new Color3(0.4, 0.35, 0.3)
			: new Color3(0.85, 0.85, 0.8);
		ropeMat.metallic = 0;
		ropeMat.roughness = 0.9;

		// Create sagging line using segments
		const segments = 12;
		for (let s = 0; s < segments; s++) {
			const t1 = s / segments;
			const t2 = (s + 1) / segments;

			// Parabolic sag
			const sag1 = sag * 4 * t1 * (1 - t1);
			const sag2 = sag * 4 * t2 * (1 - t2);

			const x1 = posX - Math.sin(rotation) * (t1 - 0.5) * length;
			const z1 = posZ - Math.cos(rotation) * (t1 - 0.5) * length;
			const x2 = posX - Math.sin(rotation) * (t2 - 0.5) * length;
			const z2 = posZ - Math.cos(rotation) * (t2 - 0.5) * length;

			const segLength = Math.sqrt(
				Math.pow(x2 - x1, 2) + Math.pow(sag2 - sag1, 2) + Math.pow(z2 - z1, 2)
			);

			const segment = MeshBuilder.CreateCylinder(
				`${id}_rope_${s}`,
				{ height: segLength, diameter: 0.015 },
				scene
			);
			segment.position = new Vector3(
				(x1 + x2) / 2,
				posY - (sag1 + sag2) / 2,
				(z1 + z2) / 2
			);

			// Calculate rotation to connect points
			const dx = x2 - x1;
			const dy = -sag2 + sag1;
			const dz = z2 - z1;
			segment.rotation.z = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
			segment.rotation.y = Math.atan2(dx, dz);

			segment.material = ropeMat;
			meshes.push(segment);
		}

		// Poles
		if (hasPoles) {
			const poleMat = new PBRMaterial(`clothesline_pole_${id}`, scene);
			poleMat.albedoColor = type === "makeshift"
				? new Color3(0.5, 0.4, 0.3).scale(conditionFactor)
				: new Color3(0.6, 0.62, 0.65);
			poleMat.metallic = type === "makeshift" ? 0 : 0.5;
			poleMat.roughness = 0.7;

			const poleHeight = 2;
			for (const side of [-1, 1]) {
				const pole = MeshBuilder.CreateCylinder(
					`${id}_pole_${side}`,
					{ height: poleHeight, diameter: type === "makeshift" ? 0.06 : 0.04 },
					scene
				);
				pole.position = new Vector3(
					posX - Math.sin(rotation) * (side * length / 2),
					posY - poleHeight / 2 + 0.1,
					posZ - Math.cos(rotation) * (side * length / 2)
				);
				pole.material = poleMat;
				meshes.push(pole);
			}
		}

		// Hanging items (clothes)
		const clothColors = [
			new Color3(0.9, 0.9, 0.95), // White
			new Color3(0.3, 0.4, 0.6), // Blue
			new Color3(0.7, 0.25, 0.25), // Red
			new Color3(0.4, 0.5, 0.35), // Green
			new Color3(0.85, 0.75, 0.6), // Beige
			new Color3(0.2, 0.2, 0.22), // Dark
		];

		for (let i = 0; i < itemCount; i++) {
			const t = (i + 0.5) / itemCount;
			const sagAmount = sag * 4 * t * (1 - t);

			const clothMat = new PBRMaterial(`clothesline_cloth_${id}_${i}`, scene);
			const colorIdx = rng
				? Math.floor(rng.next() * clothColors.length)
				: i % clothColors.length;
			clothMat.albedoColor = clothColors[colorIdx].scale(conditionFactor);
			clothMat.metallic = 0;
			clothMat.roughness = 0.85;

			// Random item type
			const itemType = rng ? rng.next() : 0.5;

			if (itemType < 0.3) {
				// T-shirt shape
				const shirt = MeshBuilder.CreateBox(
					`${id}_shirt_${i}`,
					{ width: 0.4, height: 0.5, depth: 0.02 },
					scene
				);
				shirt.position = new Vector3(
					posX - Math.sin(rotation) * (t - 0.5) * length,
					posY - sagAmount - 0.35,
					posZ - Math.cos(rotation) * (t - 0.5) * length
				);
				shirt.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.2 : 0);
				shirt.material = clothMat;
				meshes.push(shirt);

				// Sleeves
				for (const side of [-1, 1]) {
					const sleeve = MeshBuilder.CreateBox(
						`${id}_sleeve_${i}_${side}`,
						{ width: 0.15, height: 0.2, depth: 0.02 },
						scene
					);
					sleeve.position = new Vector3(
						shirt.position.x + Math.cos(rotation) * (side * 0.25),
						shirt.position.y + 0.1,
						shirt.position.z - Math.sin(rotation) * (side * 0.25)
					);
					sleeve.rotation.y = rotation;
					sleeve.rotation.z = side * 0.3;
					sleeve.material = clothMat;
					meshes.push(sleeve);
				}
			} else if (itemType < 0.6) {
				// Pants
				const waist = MeshBuilder.CreateBox(
					`${id}_waist_${i}`,
					{ width: 0.35, height: 0.15, depth: 0.02 },
					scene
				);
				waist.position = new Vector3(
					posX - Math.sin(rotation) * (t - 0.5) * length,
					posY - sagAmount - 0.15,
					posZ - Math.cos(rotation) * (t - 0.5) * length
				);
				waist.rotation.y = rotation;
				waist.material = clothMat;
				meshes.push(waist);

				for (const side of [-1, 1]) {
					const leg = MeshBuilder.CreateBox(
						`${id}_leg_${i}_${side}`,
						{ width: 0.12, height: 0.5, depth: 0.02 },
						scene
					);
					leg.position = new Vector3(
						waist.position.x + Math.cos(rotation) * (side * 0.1),
						waist.position.y - 0.3,
						waist.position.z - Math.sin(rotation) * (side * 0.1)
					);
					leg.rotation.y = rotation;
					leg.material = clothMat;
					meshes.push(leg);
				}
			} else if (itemType < 0.8) {
				// Towel/sheet
				const sheet = MeshBuilder.CreateBox(
					`${id}_sheet_${i}`,
					{ width: 0.6, height: 0.8, depth: 0.01 },
					scene
				);
				sheet.position = new Vector3(
					posX - Math.sin(rotation) * (t - 0.5) * length,
					posY - sagAmount - 0.5,
					posZ - Math.cos(rotation) * (t - 0.5) * length
				);
				sheet.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.1 : 0);
				sheet.material = clothMat;
				meshes.push(sheet);
			} else {
				// Small item (sock, underwear)
				const small = MeshBuilder.CreateBox(
					`${id}_small_${i}`,
					{ width: 0.15, height: 0.2, depth: 0.01 },
					scene
				);
				small.position = new Vector3(
					posX - Math.sin(rotation) * (t - 0.5) * length,
					posY - sagAmount - 0.2,
					posZ - Math.cos(rotation) * (t - 0.5) * length
				);
				small.rotation.y = rotation;
				small.material = clothMat;
				meshes.push(small);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			ropeMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, length, itemCount, hasPoles, sag, condition, rotation, seed]);

	return null;
}
