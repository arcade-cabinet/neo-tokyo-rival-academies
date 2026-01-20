/**
 * Skylight - Roof skylights component
 *
 * Various skylight types for buildings in Neo-Tokyo.
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

export type SkylightType = "flat" | "domed" | "pyramid" | "tubular";
export type ConditionType = "pristine" | "weathered" | "rusted" | "damaged";

export interface SkylightProps {
	id: string;
	position: Vector3;
	/** Skylight type */
	type?: SkylightType;
	/** Width of skylight */
	width?: number;
	/** Depth of skylight */
	depth?: number;
	/** Is skylight open (venting) */
	isOpen?: boolean;
	/** Has broken/cracked glass */
	isBroken?: boolean;
	/** Physical condition */
	condition?: ConditionType;
	/** Direction skylight faces (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const CONDITION_FACTORS: Record<
	ConditionType,
	{ rust: number; roughness: number; clarity: number }
> = {
	pristine: { rust: 0, roughness: 0.3, clarity: 0.95 },
	weathered: { rust: 0.15, roughness: 0.45, clarity: 0.8 },
	rusted: { rust: 0.4, roughness: 0.6, clarity: 0.6 },
	damaged: { rust: 0.6, roughness: 0.75, clarity: 0.4 },
};

export function Skylight({
	id,
	position,
	type = "flat",
	width = 1.0,
	depth = 1.0,
	isOpen = false,
	isBroken = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: SkylightProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: PBRMaterial[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = CONDITION_FACTORS[condition];
		const rustVariation = rng ? rng.next() * 0.1 : 0.05;

		// Frame material
		const frameMat = new PBRMaterial(`frame_mat_${id}`, scene);
		const rust = conditionFactor.rust + rustVariation;
		frameMat.albedoColor = new Color3(
			0.35 - rust * 0.05 + rust * 0.15,
			0.35 - rust * 0.15,
			0.38 - rust * 0.2,
		);
		frameMat.metallic = 0.85 - rust * 0.2;
		frameMat.roughness = conditionFactor.roughness;
		materials.push(frameMat);

		// Glass material
		const glassMat = new PBRMaterial(`glass_mat_${id}`, scene);
		glassMat.albedoColor = new Color3(0.7, 0.75, 0.85);
		glassMat.metallic = 0.05;
		glassMat.roughness = 0.05 + (1 - conditionFactor.clarity) * 0.3;
		glassMat.alpha = isBroken ? 0 : conditionFactor.clarity * 0.5;
		materials.push(glassMat);

		const frameThickness = 0.04;
		const _frameHeight = 0.08;

		if (type === "flat") {
			// Flat skylight with metal frame
			// Curb/base frame
			const curbHeight = 0.12;

			// Curb sides
			for (const side of ["front", "back", "left", "right"]) {
				const isHorizontal = side === "front" || side === "back";
				const curbWidth = isHorizontal ? width : depth;
				const curbDepth = isHorizontal ? frameThickness : frameThickness;

				const curb = MeshBuilder.CreateBox(
					`${id}_curb_${side}`,
					{ width: curbWidth, height: curbHeight, depth: curbDepth },
					scene,
				);

				let curbX = posX;
				let curbZ = posZ;
				if (side === "front") curbZ += depth / 2 - frameThickness / 2;
				if (side === "back") curbZ -= depth / 2 - frameThickness / 2;
				if (side === "left") curbX -= width / 2 - frameThickness / 2;
				if (side === "right") curbX += width / 2 - frameThickness / 2;

				curb.position = new Vector3(curbX, posY + curbHeight / 2, curbZ);
				curb.rotation.y = rotation + (isHorizontal ? 0 : Math.PI / 2);
				curb.material = frameMat;
				meshes.push(curb);
			}

			// Top frame
			for (const side of ["front", "back", "left", "right"]) {
				const isHorizontal = side === "front" || side === "back";
				const topFrameWidth = isHorizontal
					? width + frameThickness * 2
					: frameThickness;
				const topFrameDepth = isHorizontal ? frameThickness : depth;

				const topFrame = MeshBuilder.CreateBox(
					`${id}_topframe_${side}`,
					{
						width: topFrameWidth,
						height: frameThickness,
						depth: topFrameDepth,
					},
					scene,
				);

				let frameX = posX;
				let frameZ = posZ;
				if (side === "front") frameZ += depth / 2;
				if (side === "back") frameZ -= depth / 2;
				if (side === "left") frameX -= width / 2;
				if (side === "right") frameX += width / 2;

				topFrame.position = new Vector3(
					frameX,
					posY + curbHeight + frameThickness / 2,
					frameZ,
				);
				topFrame.rotation.y = rotation;
				topFrame.material = frameMat;
				meshes.push(topFrame);
			}

			// Glass panel
			if (!isBroken) {
				const openAngle = isOpen ? Math.PI / 6 : 0;

				const glass = MeshBuilder.CreateBox(
					`${id}_glass`,
					{
						width: width - frameThickness,
						height: 0.01,
						depth: depth - frameThickness,
					},
					scene,
				);
				glass.position = new Vector3(
					posX,
					posY +
						curbHeight +
						frameThickness +
						(isOpen ? (Math.sin(openAngle) * depth) / 4 : 0),
					posZ + (isOpen ? (Math.cos(openAngle) * depth) / 4 - depth / 4 : 0),
				);
				glass.rotation.y = rotation;
				glass.rotation.x = openAngle;
				glass.material = glassMat;
				meshes.push(glass);

				// Mullions (dividers)
				const mullionCount = Math.max(1, Math.floor(width / 0.5));
				for (let i = 1; i < mullionCount; i++) {
					const mullion = MeshBuilder.CreateBox(
						`${id}_mullion_${i}`,
						{ width: 0.02, height: 0.02, depth: depth - frameThickness * 2 },
						scene,
					);
					mullion.position = new Vector3(
						posX + (i / mullionCount - 0.5) * (width - frameThickness),
						posY + curbHeight + frameThickness + 0.01,
						posZ,
					);
					mullion.rotation.y = rotation;
					mullion.rotation.x = openAngle;
					mullion.material = frameMat;
					meshes.push(mullion);
				}
			}

			// Flashing around base
			const flashingMat = new PBRMaterial(`flashing_mat_${id}`, scene);
			flashingMat.albedoColor = frameMat.albedoColor.scale(0.8);
			flashingMat.metallic = 0.7;
			flashingMat.roughness = conditionFactor.roughness + 0.1;
			materials.push(flashingMat);

			const flashing = MeshBuilder.CreateBox(
				`${id}_flashing`,
				{ width: width + 0.15, height: 0.02, depth: depth + 0.15 },
				scene,
			);
			flashing.position = new Vector3(posX, posY + 0.01, posZ);
			flashing.rotation.y = rotation;
			flashing.material = flashingMat;
			meshes.push(flashing);
		} else if (type === "domed") {
			// Domed/bubble skylight
			// Base curb
			const curbHeight = 0.1;
			const curb = MeshBuilder.CreateCylinder(
				`${id}_curb`,
				{
					height: curbHeight,
					diameter: width,
					tessellation: 32,
				},
				scene,
			);
			curb.position = new Vector3(posX, posY + curbHeight / 2, posZ);
			curb.material = frameMat;
			meshes.push(curb);

			// Dome glass
			if (!isBroken) {
				const domeMat = new PBRMaterial(`dome_mat_${id}`, scene);
				domeMat.albedoColor = new Color3(0.75, 0.8, 0.9);
				domeMat.metallic = 0.02;
				domeMat.roughness = 0.03 + (1 - conditionFactor.clarity) * 0.2;
				domeMat.alpha = conditionFactor.clarity * 0.45;
				materials.push(domeMat);

				const _domeHeight = width * 0.4;
				const dome = MeshBuilder.CreateSphere(
					`${id}_dome`,
					{
						diameter: width - frameThickness * 2,
						segments: 24,
						slice: 0.5,
					},
					scene,
				);
				dome.position = new Vector3(posX, posY + curbHeight, posZ);
				dome.material = domeMat;
				meshes.push(dome);

				// Flange ring at base of dome
				const flange = MeshBuilder.CreateTorus(
					`${id}_flange`,
					{
						diameter: width - frameThickness,
						thickness: frameThickness * 0.8,
						tessellation: 32,
					},
					scene,
				);
				flange.position = new Vector3(posX, posY + curbHeight, posZ);
				flange.rotation.x = Math.PI / 2;
				flange.material = frameMat;
				meshes.push(flange);
			}

			// Venting mechanism (if open)
			if (isOpen) {
				const ventAngle = Math.PI / 8;
				const ventArm = MeshBuilder.CreateCylinder(
					`${id}_vent_arm`,
					{ height: width * 0.3, diameter: 0.02 },
					scene,
				);
				ventArm.position = new Vector3(
					posX + Math.sin(rotation) * (width / 4),
					posY + curbHeight + width * 0.25,
					posZ + Math.cos(rotation) * (width / 4),
				);
				ventArm.rotation.x = ventAngle;
				ventArm.rotation.y = rotation;
				ventArm.material = frameMat;
				meshes.push(ventArm);
			}
		} else if (type === "pyramid") {
			// Pyramid/hip roof skylight
			// Base curb
			const curbHeight = 0.1;

			for (const side of ["front", "back", "left", "right"]) {
				const isHorizontal = side === "front" || side === "back";
				const curbWidth = isHorizontal ? width : depth;

				const curb = MeshBuilder.CreateBox(
					`${id}_curb_${side}`,
					{ width: curbWidth, height: curbHeight, depth: frameThickness },
					scene,
				);

				let curbX = posX;
				let curbZ = posZ;
				if (side === "front") curbZ += depth / 2 - frameThickness / 2;
				if (side === "back") curbZ -= depth / 2 - frameThickness / 2;
				if (side === "left") curbX -= width / 2 - frameThickness / 2;
				if (side === "right") curbX += width / 2 - frameThickness / 2;

				curb.position = new Vector3(curbX, posY + curbHeight / 2, curbZ);
				curb.rotation.y = rotation + (isHorizontal ? 0 : Math.PI / 2);
				curb.material = frameMat;
				meshes.push(curb);
			}

			// Pyramid glass panels
			const pyramidHeight = Math.min(width, depth) * 0.4;
			const apexY = posY + curbHeight + pyramidHeight;

			if (!isBroken) {
				// Four triangular glass panels
				for (let face = 0; face < 4; face++) {
					const faceAngle = rotation + (face * Math.PI) / 2;
					const faceWidth = face % 2 === 0 ? width : depth;
					const faceDepth = face % 2 === 0 ? depth : width;

					// Create triangular panel using custom vertices would be ideal,
					// but we'll approximate with a thin box angled properly
					const panelLength = Math.sqrt(
						(faceWidth / 2) ** 2 + pyramidHeight ** 2,
					);
					const panelAngle = Math.atan2(pyramidHeight, faceDepth / 2);

					const panel = MeshBuilder.CreateBox(
						`${id}_panel_${face}`,
						{
							width: faceWidth * 0.92,
							height: 0.008,
							depth: panelLength * 0.9,
						},
						scene,
					);

					const faceDist = faceDepth / 4;
					panel.position = new Vector3(
						posX + Math.sin(faceAngle) * faceDist,
						posY + curbHeight + pyramidHeight / 2,
						posZ + Math.cos(faceAngle) * faceDist,
					);
					panel.rotation.y = faceAngle;
					panel.rotation.x = panelAngle - Math.PI / 2;
					panel.material = glassMat;
					meshes.push(panel);

					// Frame edge
					const edge = MeshBuilder.CreateBox(
						`${id}_edge_${face}`,
						{
							width: frameThickness * 0.8,
							height: frameThickness * 0.8,
							depth: panelLength,
						},
						scene,
					);

					const edgeDist = faceDepth / 2 - frameThickness / 2;
					edge.position = new Vector3(
						posX + Math.sin(faceAngle) * edgeDist,
						posY + curbHeight + pyramidHeight / 2,
						posZ + Math.cos(faceAngle) * edgeDist,
					);
					edge.rotation.y = faceAngle;
					edge.rotation.x = panelAngle - Math.PI / 2;
					edge.material = frameMat;
					meshes.push(edge);
				}

				// Ridge edges (corners of pyramid)
				for (let corner = 0; corner < 4; corner++) {
					const cornerAngle = rotation + Math.PI / 4 + (corner * Math.PI) / 2;
					const cornerDist = Math.sqrt((width / 2) ** 2 + (depth / 2) ** 2);
					const ridgeLength = Math.sqrt(cornerDist ** 2 + pyramidHeight ** 2);

					const ridge = MeshBuilder.CreateCylinder(
						`${id}_ridge_${corner}`,
						{ height: ridgeLength, diameter: frameThickness * 0.7 },
						scene,
					);

					const ridgeAngle = Math.atan2(pyramidHeight, cornerDist);
					ridge.position = new Vector3(
						posX + Math.cos(cornerAngle) * (cornerDist / 2),
						posY + curbHeight + pyramidHeight / 2,
						posZ + Math.sin(cornerAngle) * (cornerDist / 2),
					);
					ridge.rotation.z = ridgeAngle;
					ridge.rotation.y = cornerAngle + Math.PI / 2;
					ridge.material = frameMat;
					meshes.push(ridge);
				}
			}

			// Apex cap
			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{
					height: 0.04,
					diameterTop: 0.02,
					diameterBottom: 0.06,
					tessellation: 8,
				},
				scene,
			);
			cap.position = new Vector3(posX, apexY + 0.02, posZ);
			cap.rotation.y = rotation + Math.PI / 4;
			cap.material = frameMat;
			meshes.push(cap);
		} else if (type === "tubular") {
			// Tubular/sun tunnel skylight
			const _tubeRadius = width / 2;
			const tubeHeight = 0.5;

			// Dome cap on roof
			const domeMat = new PBRMaterial(`tubedome_mat_${id}`, scene);
			domeMat.albedoColor = new Color3(0.8, 0.85, 0.92);
			domeMat.metallic = 0.02;
			domeMat.roughness = 0.02;
			domeMat.alpha = isBroken ? 0 : conditionFactor.clarity * 0.4;
			materials.push(domeMat);

			if (!isBroken) {
				const dome = MeshBuilder.CreateSphere(
					`${id}_dome`,
					{ diameter: width * 0.9, segments: 16, slice: 0.5 },
					scene,
				);
				dome.position = new Vector3(posX, posY + 0.08, posZ);
				dome.material = domeMat;
				meshes.push(dome);
			}

			// Flashing collar
			const collar = MeshBuilder.CreateCylinder(
				`${id}_collar`,
				{
					height: 0.08,
					diameterTop: width * 1.05,
					diameterBottom: width * 1.2,
					tessellation: 24,
				},
				scene,
			);
			collar.position = new Vector3(posX, posY + 0.04, posZ);
			collar.material = frameMat;
			meshes.push(collar);

			// Tube section (reflective interior)
			const tubeMat = new PBRMaterial(`tube_mat_${id}`, scene);
			tubeMat.albedoColor = new Color3(0.85, 0.87, 0.9);
			tubeMat.metallic = 0.9;
			tubeMat.roughness = 0.15;
			materials.push(tubeMat);

			const tube = MeshBuilder.CreateCylinder(
				`${id}_tube`,
				{ height: tubeHeight, diameter: width - 0.02, tessellation: 24 },
				scene,
			);
			tube.position = new Vector3(posX, posY - tubeHeight / 2, posZ);
			tube.material = tubeMat;
			meshes.push(tube);

			// Tube outer casing
			const casing = MeshBuilder.CreateCylinder(
				`${id}_casing`,
				{ height: tubeHeight, diameter: width + 0.04, tessellation: 24 },
				scene,
			);
			casing.position = new Vector3(posX, posY - tubeHeight / 2, posZ);
			casing.material = frameMat;
			meshes.push(casing);

			// Flexible joint rings
			for (let i = 0; i < 3; i++) {
				const ringY = posY - 0.1 - i * (tubeHeight / 4);
				const ring = MeshBuilder.CreateTorus(
					`${id}_ring_${i}`,
					{ diameter: width + 0.05, thickness: 0.015, tessellation: 24 },
					scene,
				);
				ring.position = new Vector3(posX, ringY, posZ);
				ring.rotation.x = Math.PI / 2;
				ring.material = frameMat;
				meshes.push(ring);
			}
		}

		// Broken glass shards (if broken)
		if (isBroken && rng) {
			const shardMat = new PBRMaterial(`shard_mat_${id}`, scene);
			shardMat.albedoColor = new Color3(0.75, 0.8, 0.88);
			shardMat.metallic = 0.05;
			shardMat.roughness = 0.1;
			shardMat.alpha = 0.6;
			materials.push(shardMat);

			const shardCount = 4 + Math.floor(rng.next() * 4);
			for (let i = 0; i < shardCount; i++) {
				const shardX = posX + (rng.next() - 0.5) * width * 0.8;
				const shardZ = posZ + (rng.next() - 0.5) * depth * 0.8;

				const shard = MeshBuilder.CreateBox(
					`${id}_shard_${i}`,
					{
						width: 0.03 + rng.next() * 0.05,
						height: 0.005,
						depth: 0.02 + rng.next() * 0.04,
					},
					scene,
				);
				shard.position = new Vector3(
					shardX,
					posY +
						(type === "flat" ? 0.12 : type === "domed" ? 0.1 : 0.08) +
						rng.next() * 0.02,
					shardZ,
				);
				shard.rotation.y = rng.next() * Math.PI * 2;
				shard.rotation.x = (rng.next() - 0.5) * 0.3;
				shard.material = shardMat;
				meshes.push(shard);
			}

			// Remaining glass fragments in frame
			for (let i = 0; i < 3; i++) {
				const fragmentAngle = rng.next() * Math.PI * 2;
				const fragmentDist = (width / 2 - 0.08) * rng.next();

				const fragment = MeshBuilder.CreateBox(
					`${id}_fragment_${i}`,
					{
						width: 0.05 + rng.next() * 0.1,
						height: 0.008,
						depth: 0.03 + rng.next() * 0.06,
					},
					scene,
				);
				fragment.position = new Vector3(
					posX + Math.cos(fragmentAngle) * fragmentDist,
					posY + (type === "flat" ? 0.13 : 0.1),
					posZ + Math.sin(fragmentAngle) * fragmentDist,
				);
				fragment.rotation.y = fragmentAngle;
				fragment.rotation.z = (rng.next() - 0.5) * 0.5;
				fragment.material = shardMat;
				meshes.push(fragment);
			}
		}

		// Weathering/dirt accumulation
		if (conditionFactor.clarity < 0.7 && rng && !isBroken) {
			const dirtMat = new PBRMaterial(`dirt_mat_${id}`, scene);
			dirtMat.albedoColor = new Color3(0.4, 0.38, 0.35);
			dirtMat.metallic = 0;
			dirtMat.roughness = 0.95;
			dirtMat.alpha = (1 - conditionFactor.clarity) * 0.4;
			materials.push(dirtMat);

			const dirtCount = Math.floor((1 - conditionFactor.clarity) * 5) + 1;
			for (let i = 0; i < dirtCount; i++) {
				const dirt = MeshBuilder.CreateDisc(
					`${id}_dirt_${i}`,
					{ radius: 0.05 + rng.next() * 0.1, tessellation: 8 },
					scene,
				);
				dirt.position = new Vector3(
					posX + (rng.next() - 0.5) * width * 0.6,
					posY +
						(type === "domed"
							? width * 0.2
							: type === "pyramid"
								? width * 0.25
								: 0.14),
					posZ + (rng.next() - 0.5) * depth * 0.6,
				);
				dirt.rotation.x = Math.PI / 2 + (rng.next() - 0.5) * 0.3;
				dirt.rotation.y = rng.next() * Math.PI * 2;
				dirt.material = dirtMat;
				meshes.push(dirt);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			for (const mat of materials) {
				mat.dispose();
			}
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		width,
		depth,
		isOpen,
		isBroken,
		condition,
		rotation,
		seed,
	]);

	return null;
}
