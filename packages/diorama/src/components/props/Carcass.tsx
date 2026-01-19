/**
 * Carcass - Abandoned vehicle remains
 *
 * Rusted car and vehicle carcasses for post-flood environments.
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

export type CarcassType = "sedan" | "truck" | "van" | "bus" | "motorcycle";
export type CarcassState = "rusted" | "burned" | "submerged" | "stripped";

export interface CarcassProps {
	id: string;
	position: Vector3;
	/** Vehicle type */
	type?: CarcassType;
	/** Damage state */
	state?: CarcassState;
	/** Has wheels */
	hasWheels?: boolean;
	/** Missing panels count */
	missingPanels?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Carcass({
	id,
	position,
	type = "sedan",
	state = "rusted",
	hasWheels = false,
	missingPanels = 2,
	condition = 0.3,
	rotation = 0,
	seed,
}: CarcassProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Base material based on state
		const bodyMat = new PBRMaterial(`carcass_body_${id}`, scene);

		switch (state) {
			case "rusted":
				bodyMat.albedoColor = new Color3(0.45, 0.3, 0.2).scale(condition);
				bodyMat.metallic = 0.4;
				bodyMat.roughness = 0.9;
				break;
			case "burned":
				bodyMat.albedoColor = new Color3(0.15, 0.13, 0.12);
				bodyMat.metallic = 0.2;
				bodyMat.roughness = 0.95;
				break;
			case "submerged":
				bodyMat.albedoColor = new Color3(0.3, 0.35, 0.32).scale(condition);
				bodyMat.metallic = 0.3;
				bodyMat.roughness = 0.85;
				break;
			case "stripped":
				bodyMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(condition);
				bodyMat.metallic = 0.5;
				bodyMat.roughness = 0.7;
				break;
		}

		// Dimensions based on type
		let length = 4;
		let width = 1.8;
		let height = 1.4;

		switch (type) {
			case "sedan":
				length = 4.5;
				width = 1.8;
				height = 1.4;
				break;
			case "truck":
				length = 5;
				width = 2;
				height = 1.8;
				break;
			case "van":
				length = 4.5;
				width = 1.9;
				height = 2;
				break;
			case "bus":
				length = 10;
				width = 2.5;
				height = 2.8;
				break;
			case "motorcycle":
				length = 2;
				width = 0.8;
				height = 1;
				break;
		}

		const baseY = state === "submerged" ? posY - height * 0.3 : posY;

		if (type === "motorcycle") {
			// Motorcycle frame
			const frame = MeshBuilder.CreateCylinder(
				`${id}_frame`,
				{ height: length * 0.8, diameter: 0.1 },
				scene,
			);
			frame.position = new Vector3(posX, baseY + 0.4, posZ);
			frame.rotation.z = Math.PI / 2;
			frame.rotation.y = rotation;
			frame.material = bodyMat;
			meshes.push(frame);

			// Tank
			const tank = MeshBuilder.CreateBox(
				`${id}_tank`,
				{ width: 0.3, height: 0.25, depth: 0.5 },
				scene,
			);
			tank.position = new Vector3(posX, baseY + 0.6, posZ);
			tank.rotation.y = rotation;
			tank.material = bodyMat;
			meshes.push(tank);

			// Wheels (if present)
			if (hasWheels) {
				const wheelMat = new PBRMaterial(`carcass_wheel_${id}`, scene);
				wheelMat.albedoColor = new Color3(0.15, 0.15, 0.15);
				wheelMat.metallic = 0.2;
				wheelMat.roughness = 0.9;

				for (const side of [-1, 1]) {
					const wheel = MeshBuilder.CreateCylinder(
						`${id}_wheel_${side}`,
						{ height: 0.1, diameter: 0.6 },
						scene,
					);
					wheel.position = new Vector3(
						posX - Math.sin(rotation) * (side * length * 0.35),
						baseY + 0.3,
						posZ - Math.cos(rotation) * (side * length * 0.35),
					);
					wheel.rotation.z = Math.PI / 2;
					wheel.rotation.y = rotation;
					wheel.material = wheelMat;
					meshes.push(wheel);
				}
			}
		} else {
			// Car/truck/van/bus body
			const bodyHeight = height * 0.5;
			const cabinHeight = height * 0.5;

			// Main body (lower)
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: width, height: bodyHeight, depth: length },
				scene,
			);
			body.position = new Vector3(posX, baseY + bodyHeight / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Cabin (upper)
			const cabinLength =
				type === "truck"
					? length * 0.4
					: type === "bus"
						? length * 0.9
						: length * 0.6;
			const cabinOffset = type === "truck" ? -length * 0.2 : 0;

			// Check if cabin should be missing (for stripped)
			const hasCabin = !(state === "stripped" && rng && rng.next() > 0.5);

			if (hasCabin) {
				const cabin = MeshBuilder.CreateBox(
					`${id}_cabin`,
					{ width: width * 0.95, height: cabinHeight, depth: cabinLength },
					scene,
				);
				cabin.position = new Vector3(
					posX - Math.sin(rotation) * cabinOffset,
					baseY + bodyHeight + cabinHeight / 2,
					posZ - Math.cos(rotation) * cabinOffset,
				);
				cabin.rotation.y = rotation;
				cabin.material = bodyMat;
				meshes.push(cabin);

				// Window frames (empty)
				const frameMat = new PBRMaterial(`carcass_frame_${id}`, scene);
				frameMat.albedoColor = new Color3(0.2, 0.2, 0.22);
				frameMat.metallic = 0.5;
				frameMat.roughness = 0.7;

				if (state !== "burned") {
					// Windshield frame
					const windshieldFrame = MeshBuilder.CreateBox(
						`${id}_windshield`,
						{ width: width * 0.85, height: cabinHeight * 0.7, depth: 0.05 },
						scene,
					);
					windshieldFrame.position = new Vector3(
						posX - Math.sin(rotation) * (cabinOffset - cabinLength / 2 + 0.05),
						baseY + bodyHeight + cabinHeight * 0.4,
						posZ - Math.cos(rotation) * (cabinOffset - cabinLength / 2 + 0.05),
					);
					windshieldFrame.rotation.y = rotation;
					windshieldFrame.rotation.x = -0.2;
					windshieldFrame.material = frameMat;
					meshes.push(windshieldFrame);
				}
			}

			// Wheels
			if (hasWheels) {
				const wheelMat = new PBRMaterial(`carcass_wheel_${id}`, scene);
				wheelMat.albedoColor = new Color3(0.15, 0.15, 0.15);
				wheelMat.metallic = 0.2;
				wheelMat.roughness = 0.9;

				const wheelRadius = type === "bus" ? 0.5 : 0.35;
				const wheelPositions =
					type === "bus"
						? [
								[-length * 0.4, -width * 0.5],
								[-length * 0.4, width * 0.5],
								[length * 0.35, -width * 0.5],
								[length * 0.35, width * 0.5],
							]
						: [
								[-length * 0.35, -width * 0.5],
								[-length * 0.35, width * 0.5],
								[length * 0.35, -width * 0.5],
								[length * 0.35, width * 0.5],
							];

				for (let w = 0; w < wheelPositions.length; w++) {
					const [wz, wx] = wheelPositions[w];

					// Skip some wheels randomly
					if (rng && rng.next() > 0.7) continue;

					const wheel = MeshBuilder.CreateCylinder(
						`${id}_wheel_${w}`,
						{ height: 0.2, diameter: wheelRadius * 2 },
						scene,
					);
					wheel.position = new Vector3(
						posX + Math.cos(rotation) * wx - Math.sin(rotation) * wz,
						baseY + wheelRadius,
						posZ - Math.sin(rotation) * wx - Math.cos(rotation) * wz,
					);
					wheel.rotation.z = Math.PI / 2;
					wheel.rotation.y = rotation;
					wheel.material = wheelMat;
					meshes.push(wheel);
				}
			} else {
				// Wheel wells / axle blocks when no wheels
				const blockMat = new PBRMaterial(`carcass_block_${id}`, scene);
				blockMat.albedoColor = new Color3(0.3, 0.28, 0.25);
				blockMat.metallic = 0.3;
				blockMat.roughness = 0.9;

				for (const side of [-1, 1]) {
					const block = MeshBuilder.CreateBox(
						`${id}_block_${side}`,
						{ width: 0.3, height: 0.15, depth: 0.4 },
						scene,
					);
					block.position = new Vector3(
						posX + Math.cos(rotation) * (side * width * 0.4),
						baseY + 0.075,
						posZ - Math.sin(rotation) * (side * width * 0.4),
					);
					block.rotation.y = rotation;
					block.material = blockMat;
					meshes.push(block);
				}
			}

			// Truck bed
			if (type === "truck") {
				const bedMat = new PBRMaterial(`carcass_bed_${id}`, scene);
				bedMat.albedoColor = bodyMat.albedoColor.scale(0.9);
				bedMat.metallic = bodyMat.metallic;
				bedMat.roughness = bodyMat.roughness;

				// Bed floor
				const bedFloor = MeshBuilder.CreateBox(
					`${id}_bedfloor`,
					{ width: width * 0.95, height: 0.05, depth: length * 0.5 },
					scene,
				);
				bedFloor.position = new Vector3(
					posX + Math.sin(rotation) * (length * 0.2),
					baseY + bodyHeight + 0.025,
					posZ + Math.cos(rotation) * (length * 0.2),
				);
				bedFloor.rotation.y = rotation;
				bedFloor.material = bedMat;
				meshes.push(bedFloor);

				// Bed sides
				for (const side of [-1, 1]) {
					const bedSide = MeshBuilder.CreateBox(
						`${id}_bedside_${side}`,
						{ width: 0.05, height: 0.4, depth: length * 0.5 },
						scene,
					);
					bedSide.position = new Vector3(
						posX +
							Math.cos(rotation) * (side * width * 0.47) +
							Math.sin(rotation) * (length * 0.2),
						baseY + bodyHeight + 0.2,
						posZ -
							Math.sin(rotation) * (side * width * 0.47) +
							Math.cos(rotation) * (length * 0.2),
					);
					bedSide.rotation.y = rotation;
					bedSide.material = bedMat;
					meshes.push(bedSide);
				}
			}
		}

		// Rust patches
		if (state === "rusted") {
			const rustMat = new PBRMaterial(`carcass_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.5, 0.25, 0.1);
			rustMat.metallic = 0.3;
			rustMat.roughness = 0.95;

			const rustCount = 3 + (rng ? Math.floor(rng.next() * 4) : 2);
			for (let r = 0; r < rustCount; r++) {
				const rx = (rng ? rng.next() - 0.5 : 0) * width;
				const ry = (rng ? rng.next() : 0.5) * height * 0.8;
				const rz = (rng ? rng.next() - 0.5 : 0) * length;
				const rustSize = 0.1 + (rng ? rng.next() * 0.15 : 0.08);

				const rust = MeshBuilder.CreateDisc(
					`${id}_rust_${r}`,
					{ radius: rustSize, tessellation: 8 },
					scene,
				);
				rust.position = new Vector3(
					posX + Math.cos(rotation) * rx - Math.sin(rotation) * rz,
					baseY + ry,
					posZ - Math.sin(rotation) * rx - Math.cos(rotation) * rz,
				);
				rust.rotation.y = rotation;
				rust.material = rustMat;
				meshes.push(rust);
			}
		}

		// Burn marks
		if (state === "burned") {
			const sootMat = new PBRMaterial(`carcass_soot_${id}`, scene);
			sootMat.albedoColor = new Color3(0.05, 0.05, 0.05);
			sootMat.metallic = 0;
			sootMat.roughness = 1;

			const sootCount = 4 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let s = 0; s < sootCount; s++) {
				const sx = (rng ? rng.next() - 0.5 : 0) * width * 1.2;
				const sy = height * 0.8 + (rng ? rng.next() * 0.3 : 0.15);
				const sz = (rng ? rng.next() - 0.5 : 0) * length * 0.8;

				const soot = MeshBuilder.CreateSphere(
					`${id}_soot_${s}`,
					{ diameter: 0.2 + (rng ? rng.next() * 0.2 : 0.1), segments: 6 },
					scene,
				);
				soot.position = new Vector3(
					posX + Math.cos(rotation) * sx - Math.sin(rotation) * sz,
					baseY + sy,
					posZ - Math.sin(rotation) * sx - Math.cos(rotation) * sz,
				);
				soot.scaling = new Vector3(1, 0.3, 1);
				soot.material = sootMat;
				meshes.push(soot);
			}
		}

		// Algae/moss for submerged
		if (state === "submerged") {
			const algaeMat = new PBRMaterial(`carcass_algae_${id}`, scene);
			algaeMat.albedoColor = new Color3(0.15, 0.35, 0.2);
			algaeMat.metallic = 0;
			algaeMat.roughness = 0.95;

			const algaeCount = 5 + (rng ? Math.floor(rng.next() * 4) : 2);
			for (let a = 0; a < algaeCount; a++) {
				const ax = (rng ? rng.next() - 0.5 : 0) * width;
				const ay = (rng ? rng.next() : 0.5) * height * 0.5;
				const az = (rng ? rng.next() - 0.5 : 0) * length;

				const algae = MeshBuilder.CreateDisc(
					`${id}_algae_${a}`,
					{ radius: 0.1 + (rng ? rng.next() * 0.1 : 0.05), tessellation: 8 },
					scene,
				);
				algae.position = new Vector3(
					posX + Math.cos(rotation) * ax - Math.sin(rotation) * az,
					baseY + ay,
					posZ - Math.sin(rotation) * ax - Math.cos(rotation) * az,
				);
				algae.rotation.y = rotation;
				algae.rotation.x = rng ? rng.next() - 0.5 : 0;
				algae.material = algaeMat;
				meshes.push(algae);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			bodyMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		state,
		hasWheels,
		missingPanels,
		condition,
		rotation,
		seed,
	]);

	return null;
}
