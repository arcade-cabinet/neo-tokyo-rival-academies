/**
 * TentStructure - Makeshift shelters and tents
 *
 * Various tent and shelter structures for refugees and temporary dwellings.
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

export type TentType = "camping" | "military" | "market" | "refugee" | "tarp";
export type TentState = "intact" | "weathered" | "collapsed" | "abandoned";

export interface TentStructureProps {
	id: string;
	position: Vector3;
	/** Tent type */
	type?: TentType;
	/** Tent state */
	state?: TentState;
	/** Size multiplier */
	size?: number;
	/** Fabric color */
	color?: "blue" | "green" | "tan" | "orange" | "gray" | "camo";
	/** Has interior light */
	isLit?: boolean;
	/** Has stakes/ropes */
	hasStakes?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function TentStructure({
	id,
	position,
	type = "camping",
	state = "intact",
	size = 2,
	color = "blue",
	isLit = false,
	hasStakes = true,
	condition = 0.8,
	rotation = 0,
	seed,
}: TentStructureProps) {
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

		// Get color values
		const getColor = (colorName: string): Color3 => {
			switch (colorName) {
				case "blue":
					return new Color3(0.2, 0.35, 0.55);
				case "green":
					return new Color3(0.25, 0.4, 0.25);
				case "tan":
					return new Color3(0.6, 0.55, 0.4);
				case "orange":
					return new Color3(0.85, 0.45, 0.15);
				case "gray":
					return new Color3(0.45, 0.47, 0.5);
				case "camo":
					return new Color3(0.35, 0.38, 0.3);
				default:
					return new Color3(0.2, 0.35, 0.55);
			}
		};

		// Fabric material
		const fabricMat = new PBRMaterial(`tent_fabric_${id}`, scene);
		fabricMat.albedoColor = getColor(color).scale(conditionFactor);
		fabricMat.metallic = 0;
		fabricMat.roughness = 0.85;
		if (isLit) {
			fabricMat.emissiveColor = getColor(color).scale(0.1);
		}

		// State adjustments
		const stateOffset = state === "collapsed" ? -size * 0.3 : 0;
		const stateTilt =
			state === "weathered" ? (rng ? rng.next() * 0.1 : 0.05) : 0;

		if (type === "camping") {
			// A-frame camping tent
			const tentWidth = size * 0.8;
			const tentLength = size * 1.2;
			const tentHeight = size * 0.7 + stateOffset;

			// Create tent panels
			for (const side of [-1, 1]) {
				const panel = MeshBuilder.CreateBox(
					`${id}_panel_${side}`,
					{ width: tentLength, height: tentWidth / Math.cos(0.8), depth: 0.02 },
					scene,
				);
				panel.position = new Vector3(
					posX,
					posY + tentHeight / 2,
					posZ + Math.cos(rotation) * (side * tentWidth * 0.25),
				);
				panel.rotation.x = side * 0.8 + stateTilt;
				panel.rotation.y = rotation;
				panel.material = fabricMat;
				meshes.push(panel);
			}

			// Front/back triangular panels
			for (const end of [-1, 1]) {
				const endPanel = MeshBuilder.CreateCylinder(
					`${id}_end_${end}`,
					{
						height: 0.02,
						diameterTop: 0,
						diameterBottom: tentWidth * 1.4,
						tessellation: 3,
					},
					scene,
				);
				endPanel.position = new Vector3(
					posX - Math.sin(rotation) * ((end * tentLength) / 2),
					posY + tentHeight / 2,
					posZ - Math.cos(rotation) * ((end * tentLength) / 2),
				);
				endPanel.rotation.x = Math.PI / 2;
				endPanel.rotation.z = end === 1 ? Math.PI : 0;
				endPanel.rotation.y = rotation;
				endPanel.material = fabricMat;
				meshes.push(endPanel);
			}
		} else if (type === "military") {
			// Military style rectangular tent
			const tentWidth = size * 1.5;
			const tentLength = size * 2;
			const tentHeight = size * 0.8 + stateOffset;
			const wallHeight = tentHeight * 0.4;

			// Walls
			for (const side of [-1, 1]) {
				const wall = MeshBuilder.CreateBox(
					`${id}_wall_${side}`,
					{ width: tentLength, height: wallHeight, depth: 0.02 },
					scene,
				);
				wall.position = new Vector3(
					posX,
					posY + wallHeight / 2,
					posZ + Math.cos(rotation) * ((side * tentWidth) / 2),
				);
				wall.rotation.y = rotation;
				wall.material = fabricMat;
				meshes.push(wall);
			}

			// Roof panels
			for (const side of [-1, 1]) {
				const roofWidth = tentWidth / 2 / Math.cos(0.4);
				const roof = MeshBuilder.CreateBox(
					`${id}_roof_${side}`,
					{ width: tentLength, height: roofWidth, depth: 0.02 },
					scene,
				);
				roof.position = new Vector3(
					posX,
					posY + wallHeight + (tentHeight - wallHeight) / 2,
					posZ + Math.cos(rotation) * (side * tentWidth * 0.2),
				);
				roof.rotation.x = side * 0.4 + stateTilt;
				roof.rotation.y = rotation;
				roof.material = fabricMat;
				meshes.push(roof);
			}
		} else if (type === "market") {
			// Market stall canopy
			const canopyWidth = size * 2;
			const canopyDepth = size * 1.5;
			const canopyHeight = size * 1.2 + stateOffset;

			// Canopy top
			const canopy = MeshBuilder.CreateBox(
				`${id}_canopy`,
				{ width: canopyWidth, height: 0.03, depth: canopyDepth },
				scene,
			);
			canopy.position = new Vector3(posX, posY + canopyHeight, posZ);
			canopy.rotation.y = rotation;
			canopy.rotation.x = 0.1 + stateTilt;
			canopy.material = fabricMat;
			meshes.push(canopy);

			// Corner poles
			const poleMat = new PBRMaterial(`tent_pole_${id}`, scene);
			poleMat.albedoColor = new Color3(0.6, 0.58, 0.55);
			poleMat.metallic = 0.6;
			poleMat.roughness = 0.5;

			for (let x = -1; x <= 1; x += 2) {
				for (let z = -1; z <= 1; z += 2) {
					const pole = MeshBuilder.CreateCylinder(
						`${id}_pole_${x}_${z}`,
						{ height: canopyHeight, diameter: 0.04 },
						scene,
					);
					pole.position = new Vector3(
						posX +
							Math.cos(rotation) * (x * canopyWidth * 0.45) -
							Math.sin(rotation) * (z * canopyDepth * 0.45),
						posY + canopyHeight / 2,
						posZ -
							Math.sin(rotation) * (x * canopyWidth * 0.45) -
							Math.cos(rotation) * (z * canopyDepth * 0.45),
					);
					pole.material = poleMat;
					meshes.push(pole);
				}
			}
		} else if (type === "refugee" || type === "tarp") {
			// Makeshift tarp shelter
			const tarpWidth = size * 1.5;
			const tarpLength = size * 2;
			const tarpHeight = size * 0.6 + stateOffset;

			// Main tarp (draped)
			const tarp = MeshBuilder.CreateBox(
				`${id}_tarp`,
				{ width: tarpWidth, height: 0.02, depth: tarpLength },
				scene,
			);
			tarp.position = new Vector3(posX, posY + tarpHeight, posZ);
			tarp.rotation.y = rotation;
			tarp.rotation.x = 0.15 + stateTilt;
			tarp.rotation.z = rng ? (rng.next() - 0.5) * 0.1 : 0;
			tarp.material = fabricMat;
			meshes.push(tarp);

			// Support poles (irregular)
			const poleMat = new PBRMaterial(`tent_pole_${id}`, scene);
			poleMat.albedoColor = new Color3(0.5, 0.4, 0.3);
			poleMat.metallic = 0;
			poleMat.roughness = 0.9;

			const poleCount = 3 + (rng ? Math.floor(rng.next() * 2) : 1);
			for (let p = 0; p < poleCount; p++) {
				const px =
					(rng ? rng.next() - 0.5 : p / poleCount - 0.5) * tarpWidth * 0.8;
				const pz = (rng ? rng.next() - 0.5 : 0) * tarpLength * 0.8;
				const pHeight = tarpHeight * (0.7 + (rng ? rng.next() * 0.5 : 0.25));

				const pole = MeshBuilder.CreateCylinder(
					`${id}_pole_${p}`,
					{
						height: pHeight,
						diameter: 0.03 + (rng ? rng.next() * 0.02 : 0.01),
					},
					scene,
				);
				pole.position = new Vector3(
					posX + Math.cos(rotation) * px - Math.sin(rotation) * pz,
					posY + pHeight / 2,
					posZ - Math.sin(rotation) * px - Math.cos(rotation) * pz,
				);
				pole.rotation.z = rng ? (rng.next() - 0.5) * 0.1 : 0;
				pole.material = poleMat;
				meshes.push(pole);
			}

			// Draped edges
			for (const side of [-1, 1]) {
				const drape = MeshBuilder.CreateBox(
					`${id}_drape_${side}`,
					{ width: 0.02, height: tarpHeight * 0.5, depth: tarpLength * 0.8 },
					scene,
				);
				drape.position = new Vector3(
					posX + Math.cos(rotation) * ((side * tarpWidth) / 2),
					posY + tarpHeight * 0.6,
					posZ - Math.sin(rotation) * ((side * tarpWidth) / 2),
				);
				drape.rotation.y = rotation;
				drape.rotation.z = side * 0.5;
				drape.material = fabricMat;
				meshes.push(drape);
			}
		}

		// Stakes and ropes
		if (hasStakes && state !== "collapsed") {
			const stakeMat = new PBRMaterial(`tent_stake_${id}`, scene);
			stakeMat.albedoColor = new Color3(0.55, 0.5, 0.45);
			stakeMat.metallic = 0.5;
			stakeMat.roughness = 0.6;

			const ropeMat = new PBRMaterial(`tent_rope_${id}`, scene);
			ropeMat.albedoColor = new Color3(0.65, 0.6, 0.5);
			ropeMat.metallic = 0;
			ropeMat.roughness = 0.9;

			const stakeCount = 4;
			const stakeRadius = size * 0.9;

			for (let s = 0; s < stakeCount; s++) {
				const angle = (s / stakeCount) * Math.PI * 2 + rotation + Math.PI / 4;

				// Stake
				const stake = MeshBuilder.CreateCylinder(
					`${id}_stake_${s}`,
					{ height: 0.15, diameter: 0.02 },
					scene,
				);
				stake.position = new Vector3(
					posX + Math.cos(angle) * stakeRadius,
					posY + 0.05,
					posZ + Math.sin(angle) * stakeRadius,
				);
				stake.rotation.z = 0.2;
				stake.rotation.y = angle;
				stake.material = stakeMat;
				meshes.push(stake);

				// Guy rope
				const ropeLength = stakeRadius * 0.8;
				const rope = MeshBuilder.CreateCylinder(
					`${id}_rope_${s}`,
					{ height: ropeLength, diameter: 0.008 },
					scene,
				);
				rope.position = new Vector3(
					posX + Math.cos(angle) * (stakeRadius * 0.5),
					posY + size * 0.4,
					posZ + Math.sin(angle) * (stakeRadius * 0.5),
				);
				rope.rotation.z = 0.6;
				rope.rotation.y = angle + Math.PI;
				rope.material = ropeMat;
				meshes.push(rope);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			fabricMat.dispose();
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
		color,
		isLit,
		hasStakes,
		condition,
		rotation,
		seed,
	]);

	return null;
}
