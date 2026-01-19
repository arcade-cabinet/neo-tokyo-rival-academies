/**
 * Dumpster - Large waste container component
 *
 * Commercial dumpsters for alleys and back areas.
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

export type DumpsterType = "standard" | "frontload" | "rolloff" | "compactor";
export type DumpsterCondition = "new" | "used" | "rusted" | "damaged";

export interface DumpsterProps {
	id: string;
	position: Vector3;
	/** Dumpster type */
	type?: DumpsterType;
	/** Size multiplier */
	size?: number;
	/** Condition */
	condition?: DumpsterCondition;
	/** Fill level 0-1 */
	fillLevel?: number;
	/** Lid open */
	lidOpen?: boolean;
	/** Color */
	color?: Color3;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Dumpster({
	id,
	position,
	type = "standard",
	size = 1,
	condition = "used",
	fillLevel = 0.3,
	lidOpen = false,
	color,
	rotation = 0,
	seed,
}: DumpsterProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor =
			condition === "new"
				? 1
				: condition === "used"
					? 0.85
					: condition === "rusted"
						? 0.65
						: 0.55;
		const rustAmount =
			condition === "rusted" ? 0.3 : condition === "damaged" ? 0.4 : 0;

		// Materials
		const bodyMat = new PBRMaterial(`dumpster_body_${id}`, scene);
		const baseColor = color ?? new Color3(0.15, 0.35, 0.2);
		bodyMat.albedoColor = new Color3(
			baseColor.r * conditionFactor + rustAmount * 0.3,
			baseColor.g * conditionFactor + rustAmount * 0.15,
			baseColor.b * conditionFactor,
		);
		bodyMat.metallic = 0.85;
		bodyMat.roughness = 0.4 + (1 - conditionFactor) * 0.3;

		const accentMat = new PBRMaterial(`dumpster_accent_${id}`, scene);
		accentMat.albedoColor = new Color3(0.2, 0.2, 0.22).scale(conditionFactor);
		accentMat.metallic = 0.8;
		accentMat.roughness = 0.5;

		if (type === "standard" || type === "frontload") {
			const bodyWidth = 1.8 * size;
			const bodyHeight = 1.2 * size;
			const bodyDepth = 1.5 * size;

			// Main body (tapered)
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: bodyWidth, height: bodyHeight, depth: bodyDepth },
				scene,
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2 + 0.1, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Reinforcement ribs
			const ribCount = 3;
			for (let r = 0; r < ribCount; r++) {
				const ribX = (r / (ribCount - 1) - 0.5) * (bodyWidth - 0.2);
				for (const side of [-1, 1]) {
					const rib = MeshBuilder.CreateBox(
						`${id}_rib_${r}_${side}`,
						{ width: 0.05, height: bodyHeight - 0.2, depth: 0.04 },
						scene,
					);
					rib.position = new Vector3(
						posX +
							Math.cos(rotation) * ribX +
							Math.sin(rotation) * ((side * bodyDepth) / 2),
						posY + bodyHeight / 2 + 0.1,
						posZ -
							Math.sin(rotation) * ribX +
							Math.cos(rotation) * ((side * bodyDepth) / 2),
					);
					rib.rotation.y = rotation;
					rib.material = accentMat;
					meshes.push(rib);
				}
			}

			// Lid
			const lid = MeshBuilder.CreateBox(
				`${id}_lid`,
				{ width: bodyWidth + 0.05, height: 0.05, depth: bodyDepth / 2 - 0.05 },
				scene,
			);
			if (lidOpen) {
				lid.position = new Vector3(
					posX - Math.sin(rotation) * (bodyDepth / 4 + 0.1),
					posY + bodyHeight + 0.35,
					posZ - Math.cos(rotation) * (bodyDepth / 4 + 0.1),
				);
				lid.rotation.x = -Math.PI / 2;
			} else {
				lid.position = new Vector3(
					posX - Math.sin(rotation) * (bodyDepth / 4),
					posY + bodyHeight + 0.15,
					posZ - Math.cos(rotation) * (bodyDepth / 4),
				);
			}
			lid.rotation.y = rotation;
			lid.material = bodyMat;
			meshes.push(lid);

			// Second lid half
			const lid2 = MeshBuilder.CreateBox(
				`${id}_lid2`,
				{ width: bodyWidth + 0.05, height: 0.05, depth: bodyDepth / 2 - 0.05 },
				scene,
			);
			lid2.position = new Vector3(
				posX + Math.sin(rotation) * (bodyDepth / 4),
				posY + bodyHeight + 0.15,
				posZ + Math.cos(rotation) * (bodyDepth / 4),
			);
			lid2.rotation.y = rotation;
			lid2.material = bodyMat;
			meshes.push(lid2);

			// Fork pockets (for frontload)
			if (type === "frontload") {
				for (const side of [-1, 1]) {
					const pocket = MeshBuilder.CreateBox(
						`${id}_pocket_${side}`,
						{ width: 0.2, height: 0.15, depth: 0.3 },
						scene,
					);
					pocket.position = new Vector3(
						posX +
							Math.cos(rotation) * (side * bodyWidth * 0.3) +
							Math.sin(rotation) * (bodyDepth / 2 + 0.1),
						posY + bodyHeight * 0.7,
						posZ -
							Math.sin(rotation) * (side * bodyWidth * 0.3) +
							Math.cos(rotation) * (bodyDepth / 2 + 0.1),
					);
					pocket.rotation.y = rotation;
					pocket.material = accentMat;
					meshes.push(pocket);
				}
			}

			// Wheels
			const wheelMat = new PBRMaterial(`dumpster_wheel_${id}`, scene);
			wheelMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			wheelMat.metallic = 0.3;
			wheelMat.roughness = 0.8;

			for (const wx of [-1, 1]) {
				for (const wz of [-1, 1]) {
					const wheel = MeshBuilder.CreateCylinder(
						`${id}_wheel_${wx}_${wz}`,
						{ height: 0.06, diameter: 0.15 },
						scene,
					);
					wheel.position = new Vector3(
						posX +
							Math.cos(rotation) * (wx * (bodyWidth / 2 - 0.15)) -
							Math.sin(rotation) * (wz * (bodyDepth / 2 - 0.1)),
						posY + 0.075,
						posZ -
							Math.sin(rotation) * (wx * (bodyWidth / 2 - 0.15)) -
							Math.cos(rotation) * (wz * (bodyDepth / 2 - 0.1)),
					);
					wheel.rotation.z = Math.PI / 2;
					wheel.rotation.y = rotation;
					wheel.material = wheelMat;
					meshes.push(wheel);
				}
			}
		} else if (type === "rolloff") {
			// Large roll-off container
			const bodyWidth = 2.5 * size;
			const bodyHeight = 1.5 * size;
			const bodyDepth = 5 * size;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: bodyWidth, height: bodyHeight, depth: bodyDepth },
				scene,
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Hook rails
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateBox(
					`${id}_rail_${side}`,
					{ width: 0.08, height: 0.15, depth: bodyDepth + 0.2 },
					scene,
				);
				rail.position = new Vector3(
					posX + Math.cos(rotation) * (side * (bodyWidth / 2 + 0.04)),
					posY + bodyHeight + 0.08,
					posZ - Math.sin(rotation) * (side * (bodyWidth / 2 + 0.04)),
				);
				rail.rotation.y = rotation;
				rail.material = accentMat;
				meshes.push(rail);
			}

			// Hook
			const hook = MeshBuilder.CreateCylinder(
				`${id}_hook`,
				{ height: 0.3, diameter: 0.1 },
				scene,
			);
			hook.position = new Vector3(
				posX + Math.sin(rotation) * (bodyDepth / 2 - 0.2),
				posY + bodyHeight + 0.25,
				posZ + Math.cos(rotation) * (bodyDepth / 2 - 0.2),
			);
			hook.material = accentMat;
			meshes.push(hook);

			// Rear door
			const door = MeshBuilder.CreateBox(
				`${id}_door`,
				{ width: bodyWidth - 0.1, height: bodyHeight - 0.1, depth: 0.05 },
				scene,
			);
			door.position = new Vector3(
				posX - Math.sin(rotation) * (bodyDepth / 2 + 0.025),
				posY + bodyHeight / 2,
				posZ - Math.cos(rotation) * (bodyDepth / 2 + 0.025),
			);
			door.rotation.y = rotation;
			door.material = bodyMat;
			meshes.push(door);
		} else if (type === "compactor") {
			// Trash compactor unit
			const bodyWidth = 2 * size;
			const bodyHeight = 2 * size;
			const bodyDepth = 3 * size;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: bodyWidth, height: bodyHeight, depth: bodyDepth },
				scene,
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Hopper
			const hopperMat = new PBRMaterial(`dumpster_hopper_${id}`, scene);
			hopperMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			hopperMat.metallic = 0.8;
			hopperMat.roughness = 0.4;

			const hopper = MeshBuilder.CreateBox(
				`${id}_hopper`,
				{ width: bodyWidth * 0.6, height: 0.8, depth: 0.8 },
				scene,
			);
			hopper.position = new Vector3(
				posX + Math.sin(rotation) * (bodyDepth / 2 + 0.3),
				posY + bodyHeight * 0.7,
				posZ + Math.cos(rotation) * (bodyDepth / 2 + 0.3),
			);
			hopper.rotation.y = rotation;
			hopper.material = hopperMat;
			meshes.push(hopper);

			// Control panel
			const panel = MeshBuilder.CreateBox(
				`${id}_panel`,
				{ width: 0.3, height: 0.4, depth: 0.1 },
				scene,
			);
			panel.position = new Vector3(
				posX +
					Math.cos(rotation) * (bodyWidth / 2 + 0.05) +
					Math.sin(rotation) * (bodyDepth / 3),
				posY + bodyHeight * 0.5,
				posZ -
					Math.sin(rotation) * (bodyWidth / 2 + 0.05) +
					Math.cos(rotation) * (bodyDepth / 3),
			);
			panel.rotation.y = rotation;
			panel.material = accentMat;
			meshes.push(panel);
		}

		// Trash overflow
		if (fillLevel > 0.8 && rng) {
			const trashMat = new PBRMaterial(`dumpster_trash_${id}`, scene);
			trashMat.albedoColor = new Color3(0.35, 0.32, 0.28);
			trashMat.metallic = 0;
			trashMat.roughness = 0.9;

			const trashCount = Math.floor((fillLevel - 0.7) * 20);
			const baseHeight = (type === "rolloff" ? 1.5 : 1.2) * size;

			for (let t = 0; t < trashCount; t++) {
				const tx = (rng.next() - 0.5) * 1.2 * size;
				const tz = (rng.next() - 0.5) * 1 * size;

				const trash = MeshBuilder.CreateBox(
					`${id}_trash_${t}`,
					{
						width: 0.1 + rng.next() * 0.2,
						height: 0.05 + rng.next() * 0.1,
						depth: 0.1 + rng.next() * 0.2,
					},
					scene,
				);
				trash.position = new Vector3(
					posX + Math.cos(rotation) * tx - Math.sin(rotation) * tz,
					posY + baseHeight + 0.1 + rng.next() * 0.2,
					posZ - Math.sin(rotation) * tx - Math.cos(rotation) * tz,
				);
				trash.rotation.x = rng.next() * Math.PI;
				trash.rotation.y = rng.next() * Math.PI;
				trash.material = trashMat;
				meshes.push(trash);
			}
		}

		// Damage dents
		if (condition === "damaged" && rng) {
			const dentCount = 2 + Math.floor(rng.next() * 3);
			for (let d = 0; d < dentCount; d++) {
				// Simplified: just darker patches
				const dentMat = new PBRMaterial(`dumpster_dent_${id}_${d}`, scene);
				dentMat.albedoColor = bodyMat.albedoColor.scale(0.7);
				dentMat.metallic = 0.85;
				dentMat.roughness = 0.6;

				const dent = MeshBuilder.CreateBox(
					`${id}_dent_${d}`,
					{
						width: 0.2 + rng.next() * 0.2,
						height: 0.15 + rng.next() * 0.2,
						depth: 0.02,
					},
					scene,
				);
				const dentSide = rng.next() > 0.5 ? 1 : -1;
				const bodyDepthActual = type === "rolloff" ? 5 * size : 1.5 * size;
				dent.position = new Vector3(
					posX +
						Math.sin(rotation) * ((rng.next() - 0.5) * bodyDepthActual * 0.8) +
						Math.cos(rotation) * (dentSide * 0.9 * size),
					posY + 0.3 + rng.next() * 0.6 * size,
					posZ +
						Math.cos(rotation) * ((rng.next() - 0.5) * bodyDepthActual * 0.8) -
						Math.sin(rotation) * (dentSide * 0.9 * size),
				);
				dent.rotation.y = rotation;
				dent.material = dentMat;
				meshes.push(dent);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			bodyMat.dispose();
			accentMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		size,
		condition,
		fillLevel,
		lidOpen,
		color,
		rotation,
		seed,
	]);

	return null;
}
