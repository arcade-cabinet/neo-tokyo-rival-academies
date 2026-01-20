/**
 * FishingNet - Nets for the flooded city
 *
 * Fishing nets hung to dry or deployed in water.
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

export type FishingNetType = "cast" | "gill" | "trap" | "decorative";
export type FishingNetState = "drying" | "deployed" | "tangled" | "damaged";

export interface FishingNetProps {
	id: string;
	position: Vector3;
	/** Net type */
	type?: FishingNetType;
	/** Net state */
	state?: FishingNetState;
	/** Size multiplier */
	size?: number;
	/** Has floats */
	hasFloats?: boolean;
	/** Has weights */
	hasWeights?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function FishingNet({
	id,
	position,
	type = "cast",
	state = "drying",
	size = 2,
	hasFloats = true,
	hasWeights = true,
	condition = 0.7,
	rotation = 0,
	seed,
}: FishingNetProps) {
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

		// Net material
		const netMat = new PBRMaterial(`fishnet_${id}`, scene);
		netMat.albedoColor = new Color3(0.35, 0.38, 0.32).scale(conditionFactor);
		netMat.metallic = 0;
		netMat.roughness = 0.95;
		netMat.alpha = 0.85;

		if (type === "cast" || type === "decorative") {
			// Circular cast net
			const rings = 8;
			const spokes = 16;

			for (let r = 1; r <= rings; r++) {
				const radius = (r / rings) * size;
				const ringY =
					state === "drying"
						? posY - (r / rings) * size * 0.5
						: posY + (rng ? (rng.next() - 0.5) * 0.1 : 0);

				// Create ring
				const ring = MeshBuilder.CreateTorus(
					`${id}_ring_${r}`,
					{ diameter: radius * 2, thickness: 0.01, tessellation: spokes },
					scene,
				);
				ring.position = new Vector3(posX, ringY, posZ);
				ring.rotation.x = Math.PI / 2;
				ring.rotation.y = rotation;
				ring.material = netMat;
				meshes.push(ring);
			}

			// Create spokes
			for (let s = 0; s < spokes; s++) {
				const angle = (s / spokes) * Math.PI * 2 + rotation;

				const spoke = MeshBuilder.CreateCylinder(
					`${id}_spoke_${s}`,
					{ height: size, diameter: 0.008 },
					scene,
				);
				spoke.position = new Vector3(
					posX + Math.cos(angle) * (size / 2),
					posY - (state === "drying" ? size * 0.25 : 0),
					posZ + Math.sin(angle) * (size / 2),
				);
				spoke.rotation.z = state === "drying" ? 0.5 : Math.PI / 2;
				spoke.rotation.y = angle;
				spoke.material = netMat;
				meshes.push(spoke);
			}
		} else if (type === "gill") {
			// Rectangular gill net
			const width = size * 2;
			const height = size;
			const gridX = 12;
			const gridY = 6;

			// Horizontal lines
			for (let y = 0; y <= gridY; y++) {
				const lineY = posY + (y / gridY - 0.5) * height;
				const line = MeshBuilder.CreateCylinder(
					`${id}_hline_${y}`,
					{ height: width, diameter: 0.008 },
					scene,
				);
				line.position = new Vector3(posX, lineY, posZ);
				line.rotation.z = Math.PI / 2;
				line.rotation.y = rotation;
				line.material = netMat;
				meshes.push(line);
			}

			// Vertical lines
			for (let x = 0; x <= gridX; x++) {
				const lineX = (x / gridX - 0.5) * width;
				const line = MeshBuilder.CreateCylinder(
					`${id}_vline_${x}`,
					{ height: height, diameter: 0.008 },
					scene,
				);
				line.position = new Vector3(
					posX - Math.sin(rotation) * lineX,
					posY,
					posZ - Math.cos(rotation) * lineX,
				);
				line.rotation.y = rotation;
				line.material = netMat;
				meshes.push(line);
			}
		} else if (type === "trap") {
			// Fish trap/pot shape
			const trapRadius = size * 0.4;
			const trapHeight = size * 0.6;

			// Frame rings
			const frameMat = new PBRMaterial(`fishnet_frame_${id}`, scene);
			frameMat.albedoColor = new Color3(0.4, 0.32, 0.2).scale(conditionFactor);
			frameMat.metallic = 0;
			frameMat.roughness = 0.9;

			for (let r = 0; r < 4; r++) {
				const ringY = posY + (r / 3 - 0.5) * trapHeight;
				const ring = MeshBuilder.CreateTorus(
					`${id}_frame_${r}`,
					{ diameter: trapRadius * 2, thickness: 0.03, tessellation: 16 },
					scene,
				);
				ring.position = new Vector3(posX, ringY, posZ);
				ring.rotation.x = Math.PI / 2;
				ring.material = frameMat;
				meshes.push(ring);
			}

			// Vertical frame bars
			for (let v = 0; v < 6; v++) {
				const angle = (v / 6) * Math.PI * 2 + rotation;
				const bar = MeshBuilder.CreateCylinder(
					`${id}_bar_${v}`,
					{ height: trapHeight, diameter: 0.025 },
					scene,
				);
				bar.position = new Vector3(
					posX + Math.cos(angle) * trapRadius,
					posY,
					posZ + Math.sin(angle) * trapRadius,
				);
				bar.material = frameMat;
				meshes.push(bar);
			}

			// Net mesh covering
			const netCover = MeshBuilder.CreateCylinder(
				`${id}_cover`,
				{
					height: trapHeight * 0.95,
					diameter: trapRadius * 1.9,
					tessellation: 16,
				},
				scene,
			);
			netCover.position = new Vector3(posX, posY, posZ);
			netCover.material = netMat;
			meshes.push(netCover);
		}

		// Floats
		if (hasFloats && type !== "trap") {
			const floatMat = new PBRMaterial(`fishnet_float_${id}`, scene);
			floatMat.albedoColor = new Color3(0.9, 0.5, 0.1);
			floatMat.metallic = 0.1;
			floatMat.roughness = 0.6;

			const floatCount = type === "gill" ? 8 : 6;
			for (let f = 0; f < floatCount; f++) {
				const angle =
					type === "cast" ? (f / floatCount) * Math.PI * 2 + rotation : 0;
				const floatX =
					type === "cast"
						? posX + Math.cos(angle) * size
						: posX -
							Math.sin(rotation) * ((f / (floatCount - 1) - 0.5) * size * 2);
				const floatZ =
					type === "cast"
						? posZ + Math.sin(angle) * size
						: posZ -
							Math.cos(rotation) * ((f / (floatCount - 1) - 0.5) * size * 2);

				const float = MeshBuilder.CreateSphere(
					`${id}_float_${f}`,
					{ diameter: 0.1, segments: 8 },
					scene,
				);
				float.position = new Vector3(
					floatX,
					posY + (type === "gill" ? size / 2 : 0),
					floatZ,
				);
				float.material = floatMat;
				meshes.push(float);
			}
		}

		// Weights
		if (hasWeights && type !== "trap") {
			const weightMat = new PBRMaterial(`fishnet_weight_${id}`, scene);
			weightMat.albedoColor = new Color3(0.3, 0.32, 0.35);
			weightMat.metallic = 0.6;
			weightMat.roughness = 0.5;

			const weightCount = type === "gill" ? 8 : 8;
			for (let w = 0; w < weightCount; w++) {
				const angle =
					type === "cast" ? (w / weightCount) * Math.PI * 2 + rotation : 0;
				const weightX =
					type === "cast"
						? posX + Math.cos(angle) * size
						: posX -
							Math.sin(rotation) * ((w / (weightCount - 1) - 0.5) * size * 2);
				const weightZ =
					type === "cast"
						? posZ + Math.sin(angle) * size
						: posZ -
							Math.cos(rotation) * ((w / (weightCount - 1) - 0.5) * size * 2);

				const weight = MeshBuilder.CreateCylinder(
					`${id}_weight_${w}`,
					{ height: 0.06, diameter: 0.04, tessellation: 8 },
					scene,
				);
				weight.position = new Vector3(
					weightX,
					posY -
						(type === "cast" && state === "drying" ? size * 0.5 : size / 2),
					weightZ,
				);
				weight.material = weightMat;
				meshes.push(weight);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			netMat.dispose();
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
		hasFloats,
		hasWeights,
		condition,
		rotation,
		seed,
	]);

	return null;
}
