/**
 * Mailbox - Mail receptacle component
 *
 * Various mailbox types for residential and commercial areas.
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

export type MailboxType = "residential" | "apartment" | "public" | "japanese";

export interface MailboxProps {
	id: string;
	position: Vector3;
	/** Mailbox type */
	type?: MailboxType;
	/** Color */
	color?: Color3;
	/** Has mail (flag up for residential) */
	hasMail?: boolean;
	/** Door open */
	doorOpen?: boolean;
	/** Condition */
	condition?: "new" | "weathered" | "rusted";
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Mailbox({
	id,
	position,
	type = "residential",
	color,
	hasMail = false,
	doorOpen = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: MailboxProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = condition === "new" ? 1 : condition === "weathered" ? 0.85 : 0.7;

		// Materials
		const bodyMat = new PBRMaterial(`mailbox_body_${id}`, scene);
		const accentMat = new PBRMaterial(`mailbox_accent_${id}`, scene);

		if (type === "residential") {
			// Classic American-style mailbox
			bodyMat.albedoColor = (color ?? new Color3(0.15, 0.15, 0.17)).scale(conditionFactor);
			bodyMat.metallic = 0.8;
			bodyMat.roughness = 0.4 + (1 - conditionFactor) * 0.3;

			const boxLength = 0.5;
			const boxHeight = 0.2;
			const boxWidth = 0.18;

			// Main body (rounded top)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: boxLength, diameter: boxHeight },
				scene
			);
			body.position = new Vector3(posX, posY + 1.0, posZ);
			body.rotation.z = Math.PI / 2;
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Flat bottom section
			const bottom = MeshBuilder.CreateBox(
				`${id}_bottom`,
				{ width: boxLength, height: boxHeight / 2, depth: boxWidth },
				scene
			);
			bottom.position = new Vector3(posX, posY + 0.95, posZ);
			bottom.rotation.y = rotation;
			bottom.material = bodyMat;
			meshes.push(bottom);

			// Post
			const postMat = new PBRMaterial(`mailbox_post_${id}`, scene);
			postMat.albedoColor = new Color3(0.35, 0.28, 0.18).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.85;

			const post = MeshBuilder.CreateBox(
				`${id}_post`,
				{ width: 0.1, height: 0.9, depth: 0.1 },
				scene
			);
			post.position = new Vector3(posX, posY + 0.45, posZ);
			post.rotation.y = rotation;
			post.material = postMat;
			meshes.push(post);

			// Door
			const door = MeshBuilder.CreateCylinder(
				`${id}_door`,
				{ height: 0.02, diameter: boxHeight - 0.02, arc: 0.5 },
				scene
			);
			if (doorOpen) {
				door.position = new Vector3(
					posX + Math.cos(rotation) * (boxLength / 2 + 0.02),
					posY + 1.0,
					posZ - Math.sin(rotation) * (boxLength / 2 + 0.02)
				);
				door.rotation.x = Math.PI / 2;
				door.rotation.z = Math.PI / 2;
			} else {
				door.position = new Vector3(
					posX + Math.cos(rotation) * (boxLength / 2),
					posY + 1.0,
					posZ - Math.sin(rotation) * (boxLength / 2)
				);
				door.rotation.z = Math.PI / 2;
			}
			door.rotation.y = rotation;
			door.material = bodyMat;
			meshes.push(door);

			// Flag
			const flagMat = new PBRMaterial(`mailbox_flag_${id}`, scene);
			flagMat.albedoColor = new Color3(0.8, 0.15, 0.1);
			flagMat.metallic = 0.3;
			flagMat.roughness = 0.5;

			const flagPole = MeshBuilder.CreateCylinder(
				`${id}_flagPole`,
				{ height: 0.15, diameter: 0.01 },
				scene
			);
			if (hasMail) {
				flagPole.position = new Vector3(
					posX + Math.sin(rotation) * (boxWidth / 2 + 0.02),
					posY + 1.1,
					posZ + Math.cos(rotation) * (boxWidth / 2 + 0.02)
				);
			} else {
				flagPole.position = new Vector3(
					posX + Math.sin(rotation) * (boxWidth / 2 + 0.02),
					posY + 1.0,
					posZ + Math.cos(rotation) * (boxWidth / 2 + 0.02)
				);
				flagPole.rotation.z = Math.PI / 2;
				flagPole.rotation.y = rotation;
			}
			flagPole.material = flagMat;
			meshes.push(flagPole);

			const flag = MeshBuilder.CreateBox(
				`${id}_flag`,
				{ width: 0.08, height: 0.06, depth: 0.01 },
				scene
			);
			if (hasMail) {
				flag.position = new Vector3(
					posX + Math.sin(rotation) * (boxWidth / 2 + 0.02),
					posY + 1.15,
					posZ + Math.cos(rotation) * (boxWidth / 2 + 0.02)
				);
			} else {
				flag.position = new Vector3(
					posX + Math.sin(rotation) * (boxWidth / 2 + 0.1),
					posY + 1.0,
					posZ + Math.cos(rotation) * (boxWidth / 2 + 0.1)
				);
			}
			flag.rotation.y = rotation;
			flag.material = flagMat;
			meshes.push(flag);

		} else if (type === "apartment") {
			// Wall of apartment mailboxes
			bodyMat.albedoColor = (color ?? new Color3(0.55, 0.55, 0.58)).scale(conditionFactor);
			bodyMat.metallic = 0.85;
			bodyMat.roughness = 0.3;

			const rows = 4;
			const cols = 3;
			const boxWidth = 0.2;
			const boxHeight = 0.15;
			const boxDepth = 0.3;

			// Frame
			const frame = MeshBuilder.CreateBox(
				`${id}_frame`,
				{
					width: cols * boxWidth + 0.1,
					height: rows * boxHeight + 0.1,
					depth: boxDepth + 0.02,
				},
				scene
			);
			frame.position = new Vector3(
				posX,
				posY + (rows * boxHeight + 0.1) / 2 + 0.8,
				posZ
			);
			frame.rotation.y = rotation;
			frame.material = bodyMat;
			meshes.push(frame);

			// Individual boxes
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					const boxX = (c - (cols - 1) / 2) * boxWidth;
					const boxY = (r - (rows - 1) / 2) * boxHeight;

					// Door
					const door = MeshBuilder.CreateBox(
						`${id}_door_${r}_${c}`,
						{ width: boxWidth - 0.01, height: boxHeight - 0.01, depth: 0.02 },
						scene
					);
					door.position = new Vector3(
						posX + Math.cos(rotation) * boxX + Math.sin(rotation) * (boxDepth / 2 + 0.01),
						posY + 0.8 + (rows * boxHeight + 0.1) / 2 + boxY,
						posZ - Math.sin(rotation) * boxX + Math.cos(rotation) * (boxDepth / 2 + 0.01)
					);
					door.rotation.y = rotation;
					door.material = bodyMat;
					meshes.push(door);

					// Lock
					const lock = MeshBuilder.CreateCylinder(
						`${id}_lock_${r}_${c}`,
						{ height: 0.015, diameter: 0.02 },
						scene
					);
					lock.position = new Vector3(
						posX + Math.cos(rotation) * (boxX + boxWidth / 3) + Math.sin(rotation) * (boxDepth / 2 + 0.025),
						posY + 0.8 + (rows * boxHeight + 0.1) / 2 + boxY,
						posZ - Math.sin(rotation) * (boxX + boxWidth / 3) + Math.cos(rotation) * (boxDepth / 2 + 0.025)
					);
					lock.rotation.x = Math.PI / 2;
					lock.rotation.y = rotation;
					lock.material = accentMat;
					meshes.push(lock);
				}
			}

		} else if (type === "public") {
			// Public mail collection box
			bodyMat.albedoColor = (color ?? new Color3(0.1, 0.2, 0.5)).scale(conditionFactor);
			bodyMat.metallic = 0.7;
			bodyMat.roughness = 0.4;

			const boxWidth = 0.5;
			const boxHeight = 1.1;
			const boxDepth = 0.4;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: boxWidth, height: boxHeight, depth: boxDepth },
				scene
			);
			body.position = new Vector3(posX, posY + boxHeight / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Rounded top
			const top = MeshBuilder.CreateCylinder(
				`${id}_top`,
				{ height: boxDepth, diameter: boxWidth },
				scene
			);
			top.position = new Vector3(posX, posY + boxHeight, posZ);
			top.rotation.x = Math.PI / 2;
			top.rotation.y = rotation;
			top.material = bodyMat;
			meshes.push(top);

			// Mail slot
			const slotMat = new PBRMaterial(`mailbox_slot_${id}`, scene);
			slotMat.albedoColor = new Color3(0.05, 0.05, 0.07);
			slotMat.metallic = 0;
			slotMat.roughness = 0.9;

			const slot = MeshBuilder.CreateBox(
				`${id}_slot`,
				{ width: boxWidth * 0.7, height: 0.03, depth: 0.05 },
				scene
			);
			slot.position = new Vector3(
				posX + Math.sin(rotation) * (boxDepth / 2 + 0.01),
				posY + boxHeight * 0.75,
				posZ + Math.cos(rotation) * (boxDepth / 2 + 0.01)
			);
			slot.rotation.y = rotation;
			slot.material = slotMat;
			meshes.push(slot);

			// Collection times sign
			const sign = MeshBuilder.CreateBox(
				`${id}_sign`,
				{ width: boxWidth * 0.6, height: 0.15, depth: 0.01 },
				scene
			);
			sign.position = new Vector3(
				posX + Math.sin(rotation) * (boxDepth / 2 + 0.01),
				posY + boxHeight * 0.5,
				posZ + Math.cos(rotation) * (boxDepth / 2 + 0.01)
			);
			sign.rotation.y = rotation;
			const signMat = new PBRMaterial(`mailbox_sign_${id}`, scene);
			signMat.albedoColor = new Color3(0.9, 0.9, 0.92);
			signMat.metallic = 0;
			signMat.roughness = 0.5;
			sign.material = signMat;
			meshes.push(sign);

			// Pull handle
			const handle = MeshBuilder.CreateBox(
				`${id}_handle`,
				{ width: 0.15, height: 0.03, depth: 0.03 },
				scene
			);
			handle.position = new Vector3(
				posX + Math.sin(rotation) * (boxDepth / 2 + 0.03),
				posY + boxHeight * 0.3,
				posZ + Math.cos(rotation) * (boxDepth / 2 + 0.03)
			);
			handle.rotation.y = rotation;
			handle.material = accentMat;
			meshes.push(handle);

		} else if (type === "japanese") {
			// Japanese post box (red cylindrical)
			bodyMat.albedoColor = (color ?? new Color3(0.8, 0.15, 0.1)).scale(conditionFactor);
			bodyMat.metallic = 0.6;
			bodyMat.roughness = 0.4;

			const diameter = 0.4;
			const height = 1.3;

			// Main cylinder
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: height, diameter: diameter },
				scene
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Dome top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: diameter, slice: 0.5 },
				scene
			);
			dome.position = new Vector3(posX, posY + height, posZ);
			dome.material = bodyMat;
			meshes.push(dome);

			// Decorative band
			const band = MeshBuilder.CreateTorus(
				`${id}_band`,
				{ diameter: diameter * 1.02, thickness: 0.02 },
				scene
			);
			band.position = new Vector3(posX, posY + height * 0.85, posZ);
			band.rotation.x = Math.PI / 2;
			band.material = accentMat;
			meshes.push(band);

			// Mail slot
			const slotMat = new PBRMaterial(`mailbox_jslot_${id}`, scene);
			slotMat.albedoColor = new Color3(0.05, 0.05, 0.07);
			slotMat.metallic = 0;
			slotMat.roughness = 0.9;

			const slot = MeshBuilder.CreateBox(
				`${id}_slot`,
				{ width: diameter * 0.6, height: 0.02, depth: 0.05 },
				scene
			);
			slot.position = new Vector3(
				posX + Math.sin(rotation) * (diameter / 2 + 0.01),
				posY + height * 0.7,
				posZ + Math.cos(rotation) * (diameter / 2 + 0.01)
			);
			slot.rotation.y = rotation;
			slot.material = slotMat;
			meshes.push(slot);

			// Collection plate
			const plate = MeshBuilder.CreateCylinder(
				`${id}_plate`,
				{ height: 0.02, diameter: diameter * 0.4 },
				scene
			);
			plate.position = new Vector3(
				posX + Math.sin(rotation) * (diameter / 2 + 0.01),
				posY + height * 0.45,
				posZ + Math.cos(rotation) * (diameter / 2 + 0.01)
			);
			plate.rotation.x = Math.PI / 2;
			plate.rotation.y = rotation;
			const plateMat = new PBRMaterial(`mailbox_plate_${id}`, scene);
			plateMat.albedoColor = new Color3(0.85, 0.85, 0.88);
			plateMat.metallic = 0;
			plateMat.roughness = 0.4;
			plate.material = plateMat;
			meshes.push(plate);

			// "〒" symbol placeholder
			const symbol = MeshBuilder.CreateBox(
				`${id}_symbol`,
				{ width: 0.1, height: 0.08, depth: 0.01 },
				scene
			);
			symbol.position = new Vector3(
				posX + Math.sin(rotation) * (diameter / 2 + 0.01),
				posY + height * 0.55,
				posZ + Math.cos(rotation) * (diameter / 2 + 0.01)
			);
			symbol.rotation.y = rotation;
			const symbolMat = new PBRMaterial(`mailbox_symbol_${id}`, scene);
			symbolMat.albedoColor = new Color3(0.9, 0.9, 0.92);
			symbolMat.metallic = 0;
			symbolMat.roughness = 0.4;
			symbol.material = symbolMat;
			meshes.push(symbol);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			bodyMat.dispose();
			accentMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, color, hasMail, doorOpen, condition, rotation, seed]);

	return null;
}
