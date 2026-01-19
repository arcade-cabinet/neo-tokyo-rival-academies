/**
 * TrashCan - Waste receptacle component
 *
 * Various trash can types for streets and public areas.
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

export type TrashCanStyle = "public" | "residential" | "industrial" | "japanese" | "recycling";
export type TrashCanCondition = "clean" | "dirty" | "overflowing" | "damaged";

export interface TrashCanProps {
	id: string;
	position: Vector3;
	/** Trash can style */
	style?: TrashCanStyle;
	/** Condition */
	condition?: TrashCanCondition;
	/** Has lid */
	hasLid?: boolean;
	/** Lid is open */
	lidOpen?: boolean;
	/** Color (for recycling) */
	color?: Color3;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function TrashCan({
	id,
	position,
	style = "public",
	condition = "dirty",
	hasLid = true,
	lidOpen = false,
	color,
	rotation = 0,
	seed,
}: TrashCanProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const dirtFactor = condition === "clean" ? 1 : condition === "dirty" ? 0.85 : condition === "overflowing" ? 0.75 : 0.7;

		const bodyMat = new PBRMaterial(`trashcan_body_${id}`, scene);
		const accentMat = new PBRMaterial(`trashcan_accent_${id}`, scene);

		if (style === "public") {
			// Classic public trash can
			bodyMat.albedoColor = (color ?? new Color3(0.15, 0.35, 0.15)).scale(dirtFactor);
			bodyMat.metallic = 0.7;
			bodyMat.roughness = 0.5;
			accentMat.albedoColor = new Color3(0.25, 0.25, 0.27).scale(dirtFactor);
			accentMat.metallic = 0.8;
			accentMat.roughness = 0.4;

			const bodyHeight = 0.9;
			const bodyRadius = 0.25;

			// Main body (tapered cylinder)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: bodyHeight, diameterTop: bodyRadius * 2.1, diameterBottom: bodyRadius * 1.8 },
				scene
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Top rim
			const rim = MeshBuilder.CreateTorus(
				`${id}_rim`,
				{ diameter: bodyRadius * 2.1, thickness: 0.03 },
				scene
			);
			rim.position = new Vector3(posX, posY + bodyHeight, posZ);
			rim.rotation.x = Math.PI / 2;
			rim.material = accentMat;
			meshes.push(rim);

			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.05, diameter: bodyRadius * 2 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.025, posZ);
			base.material = accentMat;
			meshes.push(base);

			// Lid
			if (hasLid) {
				const lid = MeshBuilder.CreateCylinder(
					`${id}_lid`,
					{ height: 0.08, diameterTop: bodyRadius * 1.8, diameterBottom: bodyRadius * 2.2 },
					scene
				);
				if (lidOpen) {
					lid.position = new Vector3(posX + bodyRadius * 1.5, posY + bodyHeight + 0.04, posZ);
					lid.rotation.z = Math.PI / 2;
				} else {
					lid.position = new Vector3(posX, posY + bodyHeight + 0.04, posZ);
				}
				lid.material = bodyMat;
				meshes.push(lid);

				// Lid handle
				const handle = MeshBuilder.CreateCylinder(
					`${id}_handle`,
					{ height: 0.08, diameter: 0.03 },
					scene
				);
				if (lidOpen) {
					handle.position = new Vector3(posX + bodyRadius * 1.5, posY + bodyHeight + 0.12, posZ);
				} else {
					handle.position = new Vector3(posX, posY + bodyHeight + 0.12, posZ);
				}
				handle.material = accentMat;
				meshes.push(handle);
			}
		} else if (style === "residential") {
			// Wheeled residential bin
			bodyMat.albedoColor = (color ?? new Color3(0.2, 0.2, 0.22)).scale(dirtFactor);
			bodyMat.metallic = 0.2;
			bodyMat.roughness = 0.7;

			const bodyHeight = 1.0;
			const bodyWidth = 0.5;
			const bodyDepth = 0.45;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: bodyWidth, height: bodyHeight, depth: bodyDepth },
				scene
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2 + 0.08, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Hinged lid
			if (hasLid) {
				const lid = MeshBuilder.CreateBox(
					`${id}_lid`,
					{ width: bodyWidth + 0.02, height: 0.04, depth: bodyDepth + 0.02 },
					scene
				);
				if (lidOpen) {
					lid.position = new Vector3(
						posX - Math.sin(rotation) * (bodyDepth / 2 + 0.02),
						posY + bodyHeight + 0.2,
						posZ - Math.cos(rotation) * (bodyDepth / 2 + 0.02)
					);
					lid.rotation.x = -Math.PI / 3;
				} else {
					lid.position = new Vector3(posX, posY + bodyHeight + 0.1, posZ);
				}
				lid.rotation.y = rotation;
				lid.material = bodyMat;
				meshes.push(lid);
			}

			// Wheels
			const wheelMat = new PBRMaterial(`trashcan_wheel_${id}`, scene);
			wheelMat.albedoColor = new Color3(0.15, 0.15, 0.17);
			wheelMat.metallic = 0.3;
			wheelMat.roughness = 0.8;

			for (const side of [-1, 1]) {
				const wheel = MeshBuilder.CreateCylinder(
					`${id}_wheel_${side}`,
					{ height: 0.04, diameter: 0.15 },
					scene
				);
				wheel.position = new Vector3(
					posX + Math.cos(rotation) * (side * bodyWidth / 2) - Math.sin(rotation) * (bodyDepth / 2 - 0.1),
					posY + 0.075,
					posZ - Math.sin(rotation) * (side * bodyWidth / 2) - Math.cos(rotation) * (bodyDepth / 2 - 0.1)
				);
				wheel.rotation.z = Math.PI / 2;
				wheel.rotation.y = rotation;
				wheel.material = wheelMat;
				meshes.push(wheel);
			}

			// Handle
			const handle = MeshBuilder.CreateBox(
				`${id}_handle`,
				{ width: bodyWidth - 0.1, height: 0.04, depth: 0.04 },
				scene
			);
			handle.position = new Vector3(
				posX + Math.sin(rotation) * (bodyDepth / 2 + 0.02),
				posY + bodyHeight + 0.05,
				posZ + Math.cos(rotation) * (bodyDepth / 2 + 0.02)
			);
			handle.rotation.y = rotation;
			handle.material = bodyMat;
			meshes.push(handle);
		} else if (style === "industrial") {
			// Large industrial dumpster-style
			bodyMat.albedoColor = (color ?? new Color3(0.3, 0.35, 0.3)).scale(dirtFactor);
			bodyMat.metallic = 0.85;
			bodyMat.roughness = 0.55;

			const bodyHeight = 0.8;
			const bodyRadius = 0.35;

			// Cylindrical body
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: bodyHeight, diameter: bodyRadius * 2 },
				scene
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Reinforcement bands
			for (let i = 0; i < 3; i++) {
				const band = MeshBuilder.CreateTorus(
					`${id}_band_${i}`,
					{ diameter: bodyRadius * 2.05, thickness: 0.02 },
					scene
				);
				band.position = new Vector3(posX, posY + (i + 1) * (bodyHeight / 4), posZ);
				band.rotation.x = Math.PI / 2;
				band.material = accentMat;
				meshes.push(band);
			}

			// Handles
			for (const side of [-1, 1]) {
				const handle = MeshBuilder.CreateBox(
					`${id}_handle_${side}`,
					{ width: 0.15, height: 0.04, depth: 0.03 },
					scene
				);
				handle.position = new Vector3(
					posX + Math.cos(rotation + Math.PI / 2) * (side * bodyRadius),
					posY + bodyHeight * 0.8,
					posZ - Math.sin(rotation + Math.PI / 2) * (side * bodyRadius)
				);
				handle.rotation.y = rotation + Math.PI / 2;
				handle.material = accentMat;
				meshes.push(handle);
			}
		} else if (style === "japanese") {
			// Japanese-style waste bin
			bodyMat.albedoColor = new Color3(0.9, 0.9, 0.92).scale(dirtFactor);
			bodyMat.metallic = 0.3;
			bodyMat.roughness = 0.4;
			accentMat.albedoColor = (color ?? new Color3(0.1, 0.4, 0.2)).scale(dirtFactor);
			accentMat.metallic = 0.1;
			accentMat.roughness = 0.5;

			const bodyHeight = 0.7;
			const bodyWidth = 0.3;

			// Rectangular body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: bodyWidth, height: bodyHeight, depth: bodyWidth },
				scene
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Color band
			const band = MeshBuilder.CreateBox(
				`${id}_band`,
				{ width: bodyWidth + 0.01, height: 0.1, depth: bodyWidth + 0.01 },
				scene
			);
			band.position = new Vector3(posX, posY + bodyHeight - 0.1, posZ);
			band.rotation.y = rotation;
			band.material = accentMat;
			meshes.push(band);

			// Swing top
			if (hasLid) {
				const lid = MeshBuilder.CreateBox(
					`${id}_lid`,
					{ width: bodyWidth - 0.02, height: 0.02, depth: bodyWidth / 2 - 0.02 },
					scene
				);
				lid.position = new Vector3(
					posX + Math.sin(rotation) * (bodyWidth / 4),
					posY + bodyHeight + (lidOpen ? 0.05 : 0.01),
					posZ + Math.cos(rotation) * (bodyWidth / 4)
				);
				lid.rotation.y = rotation;
				if (lidOpen) lid.rotation.x = -0.5;
				lid.material = bodyMat;
				meshes.push(lid);
			}
		} else if (style === "recycling") {
			// Recycling bin with color coding
			const recycleColor = color ?? new Color3(0.2, 0.4, 0.7);
			bodyMat.albedoColor = recycleColor.scale(dirtFactor);
			bodyMat.metallic = 0.3;
			bodyMat.roughness = 0.6;

			const bodyHeight = 0.6;
			const bodyWidth = 0.35;

			// Body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: bodyWidth, height: bodyHeight, depth: bodyWidth },
				scene
			);
			body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Recycling symbol (simplified)
			const symbolMat = new PBRMaterial(`trashcan_symbol_${id}`, scene);
			symbolMat.albedoColor = new Color3(1, 1, 1);
			symbolMat.metallic = 0;
			symbolMat.roughness = 0.5;

			const symbol = MeshBuilder.CreateDisc(
				`${id}_symbol`,
				{ radius: 0.08 },
				scene
			);
			symbol.position = new Vector3(
				posX + Math.sin(rotation) * (bodyWidth / 2 + 0.01),
				posY + bodyHeight * 0.6,
				posZ + Math.cos(rotation) * (bodyWidth / 2 + 0.01)
			);
			symbol.rotation.y = rotation + Math.PI / 2;
			symbol.material = symbolMat;
			meshes.push(symbol);

			// Lid with slot
			if (hasLid) {
				const lid = MeshBuilder.CreateBox(
					`${id}_lid`,
					{ width: bodyWidth + 0.02, height: 0.03, depth: bodyWidth + 0.02 },
					scene
				);
				lid.position = new Vector3(posX, posY + bodyHeight + 0.015, posZ);
				lid.rotation.y = rotation;
				lid.material = bodyMat;
				meshes.push(lid);

				// Slot opening
				const slotMat = new PBRMaterial(`trashcan_slot_${id}`, scene);
				slotMat.albedoColor = new Color3(0.05, 0.05, 0.07);
				slotMat.metallic = 0;
				slotMat.roughness = 0.9;

				const slot = MeshBuilder.CreateBox(
					`${id}_slot`,
					{ width: bodyWidth * 0.6, height: 0.035, depth: 0.05 },
					scene
				);
				slot.position = new Vector3(posX, posY + bodyHeight + 0.015, posZ);
				slot.rotation.y = rotation;
				slot.material = slotMat;
				meshes.push(slot);
			}
		}

		// Overflowing trash
		if (condition === "overflowing" && rng) {
			const trashMat = new PBRMaterial(`trashcan_trash_${id}`, scene);
			trashMat.albedoColor = new Color3(0.4, 0.38, 0.35);
			trashMat.metallic = 0;
			trashMat.roughness = 0.9;

			const trashCount = 3 + Math.floor(rng.next() * 4);
			const canHeight = style === "residential" ? 1.1 : style === "industrial" ? 0.8 : 0.9;

			for (let t = 0; t < trashCount; t++) {
				const angle = rng.next() * Math.PI * 2;
				const radius = 0.15 + rng.next() * 0.15;

				const trash = MeshBuilder.CreateBox(
					`${id}_trash_${t}`,
					{
						width: 0.05 + rng.next() * 0.1,
						height: 0.03 + rng.next() * 0.05,
						depth: 0.05 + rng.next() * 0.1,
					},
					scene
				);
				trash.position = new Vector3(
					posX + Math.cos(angle) * radius,
					posY + canHeight + rng.next() * 0.15,
					posZ + Math.sin(angle) * radius
				);
				trash.rotation.x = rng.next() * Math.PI;
				trash.rotation.y = rng.next() * Math.PI;
				trash.material = trashMat;
				meshes.push(trash);
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
	}, [scene, id, posX, posY, posZ, style, condition, hasLid, lidOpen, color, rotation, seed]);

	return null;
}
