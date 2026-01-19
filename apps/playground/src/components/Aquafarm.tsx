/**
 * Aquafarm - Water-based farming for survival economy
 *
 * Various aquaculture configurations for post-flood survival environments.
 * Essential for food production in the flooded Neo-Tokyo setting.
 * Includes fish farming, seaweed cultivation, and shellfish beds.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
	type AbstractMesh,
	type Material,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../blocks/Block";

export type AquafarmType = "fish-cage" | "seaweed-line" | "shellfish-rack" | "floating-garden" | "combined";
export type AquafarmScale = "small" | "medium" | "large";

export interface AquafarmProps {
	id: string;
	position: Vector3;
	/** Aquafarm type/configuration */
	type?: AquafarmType;
	/** Farm scale */
	scale?: AquafarmScale;
	/** Width of farm area */
	width?: number;
	/** Depth of farm area */
	depth?: number;
	/** Stocking density 0-1 */
	stockingDensity?: number;
	/** Growth stage 0-1 */
	growthStage?: number;
	/** Has feeding system */
	hasFeeder?: boolean;
	/** Has monitoring buoys */
	hasMonitoring?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const SCALE_MULTIPLIERS: Record<AquafarmScale, number> = {
	small: 0.6,
	medium: 1,
	large: 1.5,
};

export function Aquafarm({
	id,
	position,
	type = "fish-cage",
	scale = "medium",
	width = 4,
	depth = 4,
	stockingDensity = 0.7,
	growthStage = 0.6,
	hasFeeder = false,
	hasMonitoring = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: AquafarmProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);
	const materialsRef = useRef<Material[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: PBRMaterial[] = [];
		const random = createSeededRandom(seed ?? Math.random() * 10000);

		const scaleMult = SCALE_MULTIPLIERS[scale];
		const actualWidth = width * scaleMult;
		const actualDepth = depth * scaleMult;

		// Net/mesh material
		const netMat = new PBRMaterial(`${id}-net-mat`, scene);
		netMat.albedoColor = new Color3(0.2, 0.25, 0.2);
		netMat.alpha = 0.7;
		netMat.roughness = 0.8;
		netMat.metallic = 0;
		materials.push(netMat);

		// Rope material
		const ropeMat = new PBRMaterial(`${id}-rope-mat`, scene);
		ropeMat.albedoColor = new Color3(0.5 * condition, 0.4 * condition, 0.25 * condition);
		ropeMat.roughness = 0.9;
		ropeMat.metallic = 0;
		materials.push(ropeMat);

		// Float/buoy material
		const floatMat = new PBRMaterial(`${id}-float-mat`, scene);
		floatMat.albedoColor = new Color3(0.8, 0.4, 0.1);
		floatMat.roughness = 0.6;
		floatMat.metallic = 0;
		materials.push(floatMat);

		// PVC/plastic material
		const plasticMat = new PBRMaterial(`${id}-plastic-mat`, scene);
		plasticMat.albedoColor = new Color3(0.1, 0.3, 0.5);
		plasticMat.roughness = 0.4;
		plasticMat.metallic = 0;
		materials.push(plasticMat);

		// Wood material
		const woodMat = new PBRMaterial(`${id}-wood-mat`, scene);
		woodMat.albedoColor = new Color3(0.35 * condition, 0.25 * condition, 0.15 * condition);
		woodMat.roughness = 0.85;
		woodMat.metallic = 0;
		materials.push(woodMat);

		// Seaweed/plant material
		const seaweedMat = new PBRMaterial(`${id}-seaweed-mat`, scene);
		seaweedMat.albedoColor = new Color3(0.1, 0.35, 0.15);
		seaweedMat.roughness = 0.7;
		seaweedMat.metallic = 0;
		materials.push(seaweedMat);

		if (type === "fish-cage") {
			// Floating fish cage/pen
			const cageDepthUnderwater = 1.5 * scaleMult;
			const frameHeight = 0.3 * scaleMult;

			// Floating frame (above water)
			const frameParts = [
				{ w: actualWidth, d: 0.1, x: 0, z: actualDepth / 2 },
				{ w: actualWidth, d: 0.1, x: 0, z: -actualDepth / 2 },
				{ w: 0.1, d: actualDepth, x: actualWidth / 2, z: 0 },
				{ w: 0.1, d: actualDepth, x: -actualWidth / 2, z: 0 },
			];

			for (let i = 0; i < frameParts.length; i++) {
				const fp = frameParts[i];
				const frame = MeshBuilder.CreateBox(
					`${id}-frame-${i}`,
					{ width: fp.w, height: frameHeight, depth: fp.d },
					scene
				);
				frame.position = new Vector3(posX + fp.x, posY + frameHeight / 2, posZ + fp.z);
				frame.material = woodMat;
				meshes.push(frame);
			}

			// Net walls (semi-transparent)
			const netWalls = [
				{ w: actualWidth, h: cageDepthUnderwater, d: 0.02, x: 0, z: actualDepth / 2 },
				{ w: actualWidth, h: cageDepthUnderwater, d: 0.02, x: 0, z: -actualDepth / 2 },
				{ w: 0.02, h: cageDepthUnderwater, d: actualDepth, x: actualWidth / 2, z: 0 },
				{ w: 0.02, h: cageDepthUnderwater, d: actualDepth, x: -actualWidth / 2, z: 0 },
			];

			for (let i = 0; i < netWalls.length; i++) {
				const nw = netWalls[i];
				const wall = MeshBuilder.CreateBox(
					`${id}-netwall-${i}`,
					{ width: nw.w, height: nw.h, depth: nw.d },
					scene
				);
				wall.position = new Vector3(posX + nw.x, posY - nw.h / 2, posZ + nw.z);
				wall.material = netMat;
				meshes.push(wall);
			}

			// Net bottom
			const bottom = MeshBuilder.CreateBox(
				`${id}-netbottom`,
				{ width: actualWidth, height: 0.02, depth: actualDepth },
				scene
			);
			bottom.position = new Vector3(posX, posY - cageDepthUnderwater, posZ);
			bottom.material = netMat;
			meshes.push(bottom);

			// Corner floats
			for (let i = 0; i < 4; i++) {
				const fx = (i % 2 === 0 ? -1 : 1) * (actualWidth / 2);
				const fz = (i < 2 ? -1 : 1) * (actualDepth / 2);
				const float = MeshBuilder.CreateCylinder(
					`${id}-float-${i}`,
					{ diameter: 0.4 * scaleMult, height: 0.3 * scaleMult, tessellation: 12 },
					scene
				);
				float.position = new Vector3(posX + fx, posY + 0.1, posZ + fz);
				float.material = floatMat;
				meshes.push(float);
			}

		} else if (type === "seaweed-line") {
			// Longline seaweed cultivation
			const lineCount = Math.floor(actualWidth / 0.8);
			const lineLength = actualDepth;

			for (let i = 0; i < lineCount; i++) {
				const lineX = posX - actualWidth / 2 + 0.4 + i * 0.8;

				// Main rope
				const rope = MeshBuilder.CreateCylinder(
					`${id}-rope-${i}`,
					{ diameter: 0.03, height: lineLength, tessellation: 8 },
					scene
				);
				rope.rotation.x = Math.PI / 2;
				rope.position = new Vector3(lineX, posY - 0.3, posZ);
				rope.material = ropeMat;
				meshes.push(rope);

				// Seaweed strands
				const strandCount = Math.floor(lineLength * 3 * stockingDensity);
				for (let j = 0; j < strandCount; j++) {
					const sz = posZ - lineLength / 2 + (j / strandCount) * lineLength;
					const strandLength = (0.3 + growthStage * 0.7) * scaleMult;

					const strand = MeshBuilder.CreateCylinder(
						`${id}-seaweed-${i}-${j}`,
						{ diameter: 0.02 + growthStage * 0.03, height: strandLength, tessellation: 6 },
						scene
					);
					strand.position = new Vector3(
						lineX + (random() - 0.5) * 0.1,
						posY - 0.3 - strandLength / 2,
						sz
					);
					strand.rotation.x = (random() - 0.5) * 0.3;
					strand.rotation.z = (random() - 0.5) * 0.3;
					strand.material = seaweedMat;
					meshes.push(strand);
				}

				// End buoys
				for (let end = 0; end < 2; end++) {
					const buoy = MeshBuilder.CreateSphere(
						`${id}-buoy-${i}-${end}`,
						{ diameter: 0.2 * scaleMult, segments: 8 },
						scene
					);
					buoy.position = new Vector3(
						lineX,
						posY + 0.1,
						posZ + (end === 0 ? -1 : 1) * (lineLength / 2)
					);
					buoy.material = floatMat;
					meshes.push(buoy);
				}
			}

		} else if (type === "shellfish-rack") {
			// Oyster/mussel rack system
			const rackHeight = 0.8 * scaleMult;
			const rackCount = Math.floor(actualDepth / 1.2);

			for (let i = 0; i < rackCount; i++) {
				const rackZ = posZ - actualDepth / 2 + 0.6 + i * 1.2;

				// Rack frame
				const crossbeam = MeshBuilder.CreateBox(
					`${id}-rack-${i}`,
					{ width: actualWidth, height: 0.08, depth: 0.08 },
					scene
				);
				crossbeam.position = new Vector3(posX, posY - 0.2, rackZ);
				crossbeam.material = woodMat;
				meshes.push(crossbeam);

				// Support posts
				for (let p = 0; p < 2; p++) {
					const post = MeshBuilder.CreateCylinder(
						`${id}-post-${i}-${p}`,
						{ diameter: 0.1, height: rackHeight, tessellation: 8 },
						scene
					);
					post.position = new Vector3(
						posX + (p === 0 ? -1 : 1) * (actualWidth / 2 - 0.1),
						posY - rackHeight / 2 + 0.1,
						rackZ
					);
					post.material = woodMat;
					meshes.push(post);
				}

				// Shellfish bags/cages
				const bagCount = Math.floor((actualWidth - 0.4) / 0.5);
				for (let b = 0; b < bagCount; b++) {
					const bagX = posX - actualWidth / 2 + 0.35 + b * 0.5;
					const bagSize = 0.25 * scaleMult * (0.8 + growthStage * 0.4);

					const bag = MeshBuilder.CreateBox(
						`${id}-bag-${i}-${b}`,
						{ width: bagSize, height: bagSize * 1.5, depth: bagSize },
						scene
					);
					bag.position = new Vector3(bagX, posY - 0.2 - bagSize * 0.75, rackZ);
					bag.material = netMat;
					meshes.push(bag);
				}
			}

			// End floats
			for (let i = 0; i < 2; i++) {
				const float = MeshBuilder.CreateCylinder(
					`${id}-endfloat-${i}`,
					{ diameter: 0.5 * scaleMult, height: 0.25 * scaleMult, tessellation: 12 },
					scene
				);
				float.position = new Vector3(posX, posY + 0.12, posZ + (i === 0 ? -1 : 1) * (actualDepth / 2));
				float.material = floatMat;
				meshes.push(float);
			}

		} else if (type === "floating-garden") {
			// Floating hydroponic/aquaponic garden
			const platformHeight = 0.15 * scaleMult;

			// Main floating platform
			const platform = MeshBuilder.CreateBox(
				`${id}-platform`,
				{ width: actualWidth, height: platformHeight, depth: actualDepth },
				scene
			);
			platform.position = new Vector3(posX, posY + platformHeight / 2 - 0.05, posZ);
			platform.material = plasticMat;
			meshes.push(platform);

			// Growing channels
			const channelCount = Math.floor(actualWidth / 0.4);
			const channelMat = new PBRMaterial(`${id}-channel-mat`, scene);
			channelMat.albedoColor = new Color3(0.8, 0.8, 0.75);
			channelMat.roughness = 0.3;
			materials.push(channelMat);

			for (let i = 0; i < channelCount; i++) {
				const channelX = posX - actualWidth / 2 + 0.2 + i * 0.4;

				const channel = MeshBuilder.CreateBox(
					`${id}-channel-${i}`,
					{ width: 0.25, height: 0.1, depth: actualDepth - 0.2 },
					scene
				);
				channel.position = new Vector3(channelX, posY + platformHeight + 0.05, posZ);
				channel.material = channelMat;
				meshes.push(channel);

				// Plants in channel
				const plantCount = Math.floor((actualDepth - 0.4) * 3 * stockingDensity);
				for (let p = 0; p < plantCount; p++) {
					const plantZ = posZ - actualDepth / 2 + 0.3 + (p / plantCount) * (actualDepth - 0.6);
					const plantHeight = (0.1 + growthStage * 0.25) * scaleMult;

					const plant = MeshBuilder.CreateCylinder(
						`${id}-plant-${i}-${p}`,
						{ diameter: 0.03 + growthStage * 0.04, height: plantHeight, tessellation: 6 },
						scene
					);
					plant.position = new Vector3(channelX, posY + platformHeight + 0.1 + plantHeight / 2, plantZ);
					plant.material = seaweedMat;
					meshes.push(plant);
				}
			}

			// Corner floats (extra buoyancy)
			for (let i = 0; i < 4; i++) {
				const fx = (i % 2 === 0 ? -1 : 1) * (actualWidth / 2 + 0.15);
				const fz = (i < 2 ? -1 : 1) * (actualDepth / 2 + 0.15);
				const float = MeshBuilder.CreateCylinder(
					`${id}-float-${i}`,
					{ diameter: 0.3 * scaleMult, height: 0.2 * scaleMult, tessellation: 12 },
					scene
				);
				float.position = new Vector3(posX + fx, posY + 0.05, posZ + fz);
				float.material = floatMat;
				meshes.push(float);
			}

		} else if (type === "combined") {
			// Combined system with multiple elements
			// Fish cage in center
			const cageSize = Math.min(actualWidth, actualDepth) * 0.4;
			const cage = MeshBuilder.CreateBox(
				`${id}-cage`,
				{ width: cageSize, height: 1, depth: cageSize },
				scene
			);
			cage.position = new Vector3(posX, posY - 0.5, posZ);
			cage.material = netMat;
			meshes.push(cage);

			// Surrounding seaweed lines
			for (let i = 0; i < 4; i++) {
				const angle = (i / 4) * Math.PI * 2;
				const lineX = posX + Math.cos(angle) * (cageSize / 2 + 0.5);
				const lineZ = posZ + Math.sin(angle) * (cageSize / 2 + 0.5);

				const rope = MeshBuilder.CreateCylinder(
					`${id}-surround-rope-${i}`,
					{ diameter: 0.02, height: 1.5, tessellation: 8 },
					scene
				);
				rope.position = new Vector3(lineX, posY - 0.5, lineZ);
				rope.material = ropeMat;
				meshes.push(rope);

				// Seaweed
				for (let j = 0; j < 5; j++) {
					const strand = MeshBuilder.CreateCylinder(
						`${id}-strand-${i}-${j}`,
						{ diameter: 0.03, height: 0.4 * growthStage, tessellation: 6 },
						scene
					);
					strand.position = new Vector3(
						lineX + (random() - 0.5) * 0.1,
						posY - 0.3 - j * 0.25,
						lineZ + (random() - 0.5) * 0.1
					);
					strand.material = seaweedMat;
					meshes.push(strand);
				}
			}

			// Central float
			const mainFloat = MeshBuilder.CreateCylinder(
				`${id}-main-float`,
				{ diameter: cageSize * 0.8, height: 0.2, tessellation: 16 },
				scene
			);
			mainFloat.position = new Vector3(posX, posY + 0.1, posZ);
			mainFloat.material = floatMat;
			meshes.push(mainFloat);
		}

		// Feeder system
		if (hasFeeder && (type === "fish-cage" || type === "combined")) {
			const feederMat = new PBRMaterial(`${id}-feeder-mat`, scene);
			feederMat.albedoColor = new Color3(0.3, 0.3, 0.35);
			feederMat.roughness = 0.5;
			feederMat.metallic = 0.3;
			materials.push(feederMat);

			const feeder = MeshBuilder.CreateCylinder(
				`${id}-feeder`,
				{ diameterTop: 0.3 * scaleMult, diameterBottom: 0.15 * scaleMult, height: 0.5 * scaleMult, tessellation: 12 },
				scene
			);
			feeder.position = new Vector3(posX, posY + 0.5, posZ);
			feeder.material = feederMat;
			meshes.push(feeder);

			// Feeder pipe
			const pipe = MeshBuilder.CreateCylinder(
				`${id}-feeder-pipe`,
				{ diameter: 0.05, height: 0.6, tessellation: 8 },
				scene
			);
			pipe.position = new Vector3(posX, posY + 0.05, posZ);
			pipe.material = feederMat;
			meshes.push(pipe);
		}

		// Monitoring buoys
		if (hasMonitoring) {
			const monitorMat = new PBRMaterial(`${id}-monitor-mat`, scene);
			monitorMat.albedoColor = new Color3(0.9, 0.9, 0.1);
			monitorMat.roughness = 0.4;
			monitorMat.metallic = 0.1;
			materials.push(monitorMat);

			for (let i = 0; i < 2; i++) {
				const buoy = MeshBuilder.CreateSphere(
					`${id}-monitor-${i}`,
					{ diameter: 0.2 * scaleMult, segments: 12 },
					scene
				);
				buoy.position = new Vector3(
					posX + (i === 0 ? -1 : 1) * (actualWidth / 2 + 0.3),
					posY + 0.1,
					posZ
				);
				buoy.material = monitorMat;
				meshes.push(buoy);

				// Antenna
				const antenna = MeshBuilder.CreateCylinder(
					`${id}-antenna-${i}`,
					{ diameter: 0.02, height: 0.3 * scaleMult, tessellation: 6 },
					scene
				);
				antenna.position = new Vector3(
					posX + (i === 0 ? -1 : 1) * (actualWidth / 2 + 0.3),
					posY + 0.25,
					posZ
				);
				antenna.material = monitorMat;
				meshes.push(antenna);
			}
		}

		// Apply rotation
		if (rotation !== 0) {
			for (const mesh of meshes) {
				const relX = mesh.position.x - posX;
				const relZ = mesh.position.z - posZ;
				mesh.position.x = posX + relX * Math.cos(rotation) - relZ * Math.sin(rotation);
				mesh.position.z = posZ + relX * Math.sin(rotation) + relZ * Math.cos(rotation);
				mesh.rotation.y += rotation;
			}
		}

		meshRef.current = meshes;
		materialsRef.current = materials;

		return () => {
			for (const mesh of meshRef.current) {
				mesh.dispose();
			}
			for (const mat of materialsRef.current) {
				mat.dispose();
			}
			meshRef.current = [];
			materialsRef.current = [];
		};
	}, [id, posX, posY, posZ, type, scale, width, depth, stockingDensity, growthStage, hasFeeder, hasMonitoring, condition, rotation, seed, scene]);

	return null;
}
