/**
 * Fog - Atmospheric fog and mist
 *
 * Fog volumes for atmospheric effects.
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

export type FogType = "ground" | "volumetric" | "rolling" | "patchy" | "dense";

export interface FogProps {
	id: string;
	position: Vector3;
	/** Fog type */
	type?: FogType;
	/** Width (x) */
	width?: number;
	/** Height (y) */
	height?: number;
	/** Depth (z) */
	depth?: number;
	/** Density 0-1 */
	density?: number;
	/** Color tint */
	tint?: "white" | "blue" | "yellow" | "gray";
	/** Seed for procedural variation */
	seed?: number;
}

export function Fog({
	id,
	position,
	type = "ground",
	width = 10,
	height = 1,
	depth = 10,
	density = 0.5,
	tint = "white",
	seed,
}: FogProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Material
		const fogMat = new PBRMaterial(`fog_${id}`, scene);

		// Color based on tint
		switch (tint) {
			case "white":
				fogMat.albedoColor = new Color3(0.95, 0.95, 0.97);
				break;
			case "blue":
				fogMat.albedoColor = new Color3(0.85, 0.9, 0.98);
				break;
			case "yellow":
				fogMat.albedoColor = new Color3(0.98, 0.95, 0.85);
				break;
			case "gray":
				fogMat.albedoColor = new Color3(0.7, 0.72, 0.75);
				break;
		}
		fogMat.metallic = 0;
		fogMat.roughness = 1;
		fogMat.alpha = density * 0.4;

		if (type === "ground") {
			// Ground-hugging fog layer
			const layerCount = 3;
			for (let l = 0; l < layerCount; l++) {
				const layerY = posY + (l / layerCount) * height;
				const layerAlpha = density * 0.3 * (1 - l / layerCount);

				const layerMat = new PBRMaterial(`fog_layer_${id}_${l}`, scene);
				layerMat.albedoColor = fogMat.albedoColor;
				layerMat.metallic = 0;
				layerMat.roughness = 1;
				layerMat.alpha = layerAlpha;

				const layer = MeshBuilder.CreateBox(
					`${id}_layer_${l}`,
					{ width: width, height: height / layerCount, depth: depth },
					scene,
				);
				layer.position = new Vector3(
					posX,
					layerY + height / layerCount / 2,
					posZ,
				);
				layer.material = layerMat;
				meshes.push(layer);
			}
		} else if (type === "volumetric") {
			// Billowing volumetric fog using spheres
			const cloudCount = Math.floor(10 * density);
			for (let c = 0; c < cloudCount; c++) {
				const cx = (rng ? rng.next() - 0.5 : c / cloudCount - 0.5) * width;
				const cy = (rng ? rng.next() : 0.5) * height;
				const cz = (rng ? rng.next() - 0.5 : 0) * depth;
				const cloudSize =
					(1 + (rng ? rng.next() : 0.5)) * Math.min(width, depth) * 0.15;

				const cloudMat = new PBRMaterial(`fog_cloud_${id}_${c}`, scene);
				cloudMat.albedoColor = fogMat.albedoColor;
				cloudMat.metallic = 0;
				cloudMat.roughness = 1;
				cloudMat.alpha = density * 0.25 * (rng ? 0.5 + rng.next() * 0.5 : 0.75);

				const cloud = MeshBuilder.CreateSphere(
					`${id}_cloud_${c}`,
					{ diameter: cloudSize, segments: 8 },
					scene,
				);
				cloud.position = new Vector3(posX + cx, posY + cy, posZ + cz);
				cloud.scaling = new Vector3(
					1 + (rng ? (rng.next() - 0.5) * 0.5 : 0),
					0.5 + (rng ? rng.next() * 0.3 : 0.15),
					1 + (rng ? (rng.next() - 0.5) * 0.5 : 0),
				);
				cloud.material = cloudMat;
				meshes.push(cloud);
			}
		} else if (type === "rolling") {
			// Wave-like rolling fog
			const waveCount = 5;
			for (let w = 0; w < waveCount; w++) {
				const waveZ = (w / waveCount - 0.5) * depth;
				const waveHeight = height * (0.5 + (rng ? rng.next() * 0.5 : 0.25));

				const waveMat = new PBRMaterial(`fog_wave_${id}_${w}`, scene);
				waveMat.albedoColor = fogMat.albedoColor;
				waveMat.metallic = 0;
				waveMat.roughness = 1;
				waveMat.alpha = density * 0.3;

				const wave = MeshBuilder.CreateCylinder(
					`${id}_wave_${w}`,
					{ height: width, diameter: waveHeight * 2, tessellation: 12 },
					scene,
				);
				wave.position = new Vector3(posX, posY + waveHeight / 2, posZ + waveZ);
				wave.rotation.z = Math.PI / 2;
				wave.scaling = new Vector3(1, 0.3, 1);
				wave.material = waveMat;
				meshes.push(wave);
			}
		} else if (type === "patchy") {
			// Scattered fog patches
			const patchCount = Math.floor(8 * density);
			for (let p = 0; p < patchCount; p++) {
				const px = (rng ? rng.next() - 0.5 : p / patchCount - 0.5) * width;
				const pz = (rng ? rng.next() - 0.5 : 0) * depth;
				const patchSize =
					(2 + (rng ? rng.next() * 2 : 1)) * Math.min(width, depth) * 0.1;

				const patchMat = new PBRMaterial(`fog_patch_${id}_${p}`, scene);
				patchMat.albedoColor = fogMat.albedoColor;
				patchMat.metallic = 0;
				patchMat.roughness = 1;
				patchMat.alpha = density * 0.35 * (rng ? 0.5 + rng.next() * 0.5 : 0.75);

				const patch = MeshBuilder.CreateDisc(
					`${id}_patch_${p}`,
					{ radius: patchSize, tessellation: 12 },
					scene,
				);
				patch.position = new Vector3(posX + px, posY + height * 0.1, posZ + pz);
				patch.rotation.x = Math.PI / 2;
				patch.material = patchMat;
				meshes.push(patch);

				// Vertical wisps
				const wispCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
				for (let ws = 0; ws < wispCount; ws++) {
					const wispMat = new PBRMaterial(`fog_wisp_${id}_${p}_${ws}`, scene);
					wispMat.albedoColor = fogMat.albedoColor;
					wispMat.metallic = 0;
					wispMat.roughness = 1;
					wispMat.alpha = density * 0.2;

					const wisp = MeshBuilder.CreateCylinder(
						`${id}_wisp_${p}_${ws}`,
						{
							height: height * 0.5,
							diameterTop: 0.05,
							diameterBottom: patchSize * 0.3,
						},
						scene,
					);
					wisp.position = new Vector3(
						posX + px + (rng ? (rng.next() - 0.5) * patchSize : 0),
						posY + height * 0.3,
						posZ + pz + (rng ? (rng.next() - 0.5) * patchSize : 0),
					);
					wisp.material = wispMat;
					meshes.push(wisp);
				}
			}
		} else {
			// Dense fog - single large volume
			const denseFog = MeshBuilder.CreateBox(
				`${id}_dense`,
				{ width: width, height: height, depth: depth },
				scene,
			);
			denseFog.position = new Vector3(posX, posY + height / 2, posZ);
			denseFog.material = fogMat;
			meshes.push(denseFog);

			// Internal density variations
			const variationCount = Math.floor(5 * density);
			for (let v = 0; v < variationCount; v++) {
				const vx = (rng ? rng.next() - 0.5 : 0) * width * 0.8;
				const vy = (rng ? rng.next() : 0.5) * height;
				const vz = (rng ? rng.next() - 0.5 : 0) * depth * 0.8;

				const varMat = new PBRMaterial(`fog_var_${id}_${v}`, scene);
				varMat.albedoColor = fogMat.albedoColor.scale(0.95);
				varMat.metallic = 0;
				varMat.roughness = 1;
				varMat.alpha = density * 0.15;

				const variation = MeshBuilder.CreateSphere(
					`${id}_var_${v}`,
					{ diameter: Math.min(width, depth) * 0.3, segments: 8 },
					scene,
				);
				variation.position = new Vector3(posX + vx, posY + vy, posZ + vz);
				variation.material = varMat;
				meshes.push(variation);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			fogMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		width,
		height,
		depth,
		density,
		tint,
		seed,
	]);

	return null;
}
