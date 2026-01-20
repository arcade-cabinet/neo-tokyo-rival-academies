/**
 * Anchor - Ship anchors decorative or functional
 *
 * Anchors for boats and decorative maritime elements.
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

export type AnchorType = "traditional" | "danforth" | "mushroom" | "decorative";
export type AnchorState = "deployed" | "stowed" | "abandoned";

export interface AnchorProps {
	id: string;
	position: Vector3;
	/** Anchor type */
	type?: AnchorType;
	/** Anchor state */
	state?: AnchorState;
	/** Size multiplier */
	size?: number;
	/** Has chain attached */
	hasChain?: boolean;
	/** Chain length */
	chainLength?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Anchor({
	id,
	position,
	type = "traditional",
	state = "stowed",
	size = 1,
	hasChain = true,
	chainLength = 2,
	condition = 0.6,
	rotation = 0,
	seed,
}: AnchorProps) {
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

		// Anchor material
		const anchorMat = new PBRMaterial(`anchor_${id}`, scene);
		if (state === "abandoned" || conditionFactor < 0.5) {
			// Rusted
			anchorMat.albedoColor = new Color3(0.45, 0.3, 0.2).scale(conditionFactor);
			anchorMat.metallic = 0.4;
			anchorMat.roughness = 0.9;
		} else {
			anchorMat.albedoColor = new Color3(0.25, 0.27, 0.3);
			anchorMat.metallic = 0.8;
			anchorMat.roughness = 0.4;
		}

		const baseSize = 0.8 * size;

		if (type === "traditional") {
			// Classic anchor shape
			// Shank (vertical bar)
			const shank = MeshBuilder.CreateCylinder(
				`${id}_shank`,
				{ height: baseSize, diameter: baseSize * 0.08 },
				scene,
			);
			shank.position = new Vector3(posX, posY + baseSize / 2, posZ);
			shank.rotation.y = rotation;
			shank.material = anchorMat;
			meshes.push(shank);

			// Stock (horizontal bar at top)
			const stock = MeshBuilder.CreateCylinder(
				`${id}_stock`,
				{ height: baseSize * 0.8, diameter: baseSize * 0.06 },
				scene,
			);
			stock.position = new Vector3(posX, posY + baseSize * 0.85, posZ);
			stock.rotation.z = Math.PI / 2;
			stock.rotation.y = rotation;
			stock.material = anchorMat;
			meshes.push(stock);

			// Ring at top
			const ring = MeshBuilder.CreateTorus(
				`${id}_ring`,
				{
					diameter: baseSize * 0.15,
					thickness: baseSize * 0.03,
					tessellation: 16,
				},
				scene,
			);
			ring.position = new Vector3(
				posX,
				posY + baseSize + baseSize * 0.08,
				posZ,
			);
			ring.rotation.x = Math.PI / 2;
			ring.material = anchorMat;
			meshes.push(ring);

			// Crown (bottom connector)
			const crown = MeshBuilder.CreateSphere(
				`${id}_crown`,
				{ diameter: baseSize * 0.15, segments: 8 },
				scene,
			);
			crown.position = new Vector3(posX, posY + baseSize * 0.08, posZ);
			crown.material = anchorMat;
			meshes.push(crown);

			// Flukes (arms)
			for (const side of [-1, 1]) {
				// Arm
				const arm = MeshBuilder.CreateCylinder(
					`${id}_arm_${side}`,
					{ height: baseSize * 0.4, diameter: baseSize * 0.06 },
					scene,
				);
				arm.position = new Vector3(
					posX + Math.cos(rotation) * (side * baseSize * 0.15),
					posY + baseSize * 0.15,
					posZ - Math.sin(rotation) * (side * baseSize * 0.15),
				);
				arm.rotation.z = side * 0.8;
				arm.rotation.y = rotation;
				arm.material = anchorMat;
				meshes.push(arm);

				// Fluke (triangular tip)
				const fluke = MeshBuilder.CreateCylinder(
					`${id}_fluke_${side}`,
					{
						height: baseSize * 0.2,
						diameterTop: 0,
						diameterBottom: baseSize * 0.15,
						tessellation: 3,
					},
					scene,
				);
				fluke.position = new Vector3(
					posX + Math.cos(rotation) * (side * baseSize * 0.35),
					posY + baseSize * 0.25,
					posZ - Math.sin(rotation) * (side * baseSize * 0.35),
				);
				fluke.rotation.z = side * 1.2;
				fluke.rotation.y = rotation + Math.PI / 6;
				fluke.material = anchorMat;
				meshes.push(fluke);
			}
		} else if (type === "danforth") {
			// Modern flat anchor
			// Shank
			const shank = MeshBuilder.CreateBox(
				`${id}_shank`,
				{
					width: baseSize * 0.08,
					height: baseSize * 0.8,
					depth: baseSize * 0.04,
				},
				scene,
			);
			shank.position = new Vector3(posX, posY + baseSize * 0.4, posZ);
			shank.rotation.y = rotation;
			shank.material = anchorMat;
			meshes.push(shank);

			// Ring
			const ring = MeshBuilder.CreateTorus(
				`${id}_ring`,
				{
					diameter: baseSize * 0.12,
					thickness: baseSize * 0.02,
					tessellation: 16,
				},
				scene,
			);
			ring.position = new Vector3(posX, posY + baseSize * 0.85, posZ);
			ring.rotation.x = Math.PI / 2;
			ring.material = anchorMat;
			meshes.push(ring);

			// Flat flukes
			for (const side of [-1, 1]) {
				const fluke = MeshBuilder.CreateBox(
					`${id}_fluke_${side}`,
					{
						width: baseSize * 0.35,
						height: baseSize * 0.02,
						depth: baseSize * 0.25,
					},
					scene,
				);
				fluke.position = new Vector3(
					posX + Math.cos(rotation) * (side * baseSize * 0.2),
					posY + baseSize * 0.1,
					posZ - Math.sin(rotation) * (side * baseSize * 0.2),
				);
				fluke.rotation.y = rotation + side * 0.4;
				fluke.material = anchorMat;
				meshes.push(fluke);
			}
		} else if (type === "mushroom") {
			// Mushroom anchor
			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{
					height: baseSize * 0.15,
					diameterTop: baseSize * 0.6,
					diameterBottom: baseSize * 0.3,
					tessellation: 16,
				},
				scene,
			);
			cap.position = new Vector3(posX, posY + baseSize * 0.08, posZ);
			cap.material = anchorMat;
			meshes.push(cap);

			const shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: baseSize * 0.5, diameter: baseSize * 0.1 },
				scene,
			);
			shaft.position = new Vector3(posX, posY + baseSize * 0.4, posZ);
			shaft.material = anchorMat;
			meshes.push(shaft);

			const ring = MeshBuilder.CreateTorus(
				`${id}_ring`,
				{
					diameter: baseSize * 0.12,
					thickness: baseSize * 0.02,
					tessellation: 16,
				},
				scene,
			);
			ring.position = new Vector3(posX, posY + baseSize * 0.7, posZ);
			ring.rotation.x = Math.PI / 2;
			ring.material = anchorMat;
			meshes.push(ring);
		} else {
			// Decorative anchor (simplified traditional)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: baseSize, diameter: baseSize * 0.1 },
				scene,
			);
			body.position = new Vector3(posX, posY + baseSize / 2, posZ);
			body.material = anchorMat;
			meshes.push(body);

			const crossbar = MeshBuilder.CreateCylinder(
				`${id}_crossbar`,
				{ height: baseSize * 0.7, diameter: baseSize * 0.08 },
				scene,
			);
			crossbar.position = new Vector3(posX, posY + baseSize * 0.2, posZ);
			crossbar.rotation.z = Math.PI / 2;
			crossbar.rotation.y = rotation;
			crossbar.material = anchorMat;
			meshes.push(crossbar);

			const ring = MeshBuilder.CreateTorus(
				`${id}_ring`,
				{
					diameter: baseSize * 0.18,
					thickness: baseSize * 0.03,
					tessellation: 16,
				},
				scene,
			);
			ring.position = new Vector3(posX, posY + baseSize + baseSize * 0.1, posZ);
			ring.rotation.x = Math.PI / 2;
			ring.material = anchorMat;
			meshes.push(ring);
		}

		// Chain
		if (hasChain) {
			const chainMat = new PBRMaterial(`anchor_chain_${id}`, scene);
			chainMat.albedoColor = anchorMat.albedoColor.scale(0.9);
			chainMat.metallic = anchorMat.metallic;
			chainMat.roughness = anchorMat.roughness;

			const linkCount = Math.floor(chainLength * 8);
			const linkHeight = chainLength / linkCount;

			for (let l = 0; l < linkCount; l++) {
				const link = MeshBuilder.CreateTorus(
					`${id}_link_${l}`,
					{
						diameter: baseSize * 0.08,
						thickness: baseSize * 0.015,
						tessellation: 8,
					},
					scene,
				);
				link.position = new Vector3(
					posX + (rng ? (rng.next() - 0.5) * 0.05 : 0),
					posY + baseSize + 0.1 + l * linkHeight,
					posZ + (rng ? (rng.next() - 0.5) * 0.05 : 0),
				);
				link.rotation.x = l % 2 === 0 ? Math.PI / 2 : 0;
				link.rotation.y = rng ? rng.next() * 0.2 : 0;
				link.material = chainMat;
				meshes.push(link);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			anchorMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		state,
		size,
		hasChain,
		chainLength,
		condition,
		rotation,
		seed,
	]);

	return null;
}
