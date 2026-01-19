/**
 * DrainGrate - Storm drain and grate component
 *
 * Various drain grate styles for the flooded neo-tokyo city streets.
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

export type DrainType = "slot" | "grid" | "trench" | "curb";
export type DrainCondition = "new" | "weathered" | "rusted" | "damaged";

export interface DrainGrateProps {
	id: string;
	position: Vector3;
	/** Drain type/style */
	type?: DrainType;
	/** Width of the drain */
	width?: number;
	/** Length of the drain */
	length?: number;
	/** Whether the drain is blocked with debris */
	isBlocked?: boolean;
	/** Water flow intensity (0-1, 0 = dry, 1 = full flow) */
	waterFlow?: number;
	/** Visual condition */
	condition?: DrainCondition;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function DrainGrate({
	id,
	position,
	type = "slot",
	width = 0.15,
	length = 0.6,
	isBlocked = false,
	waterFlow = 0,
	condition = "weathered",
	rotation = 0,
	seed,
}: DrainGrateProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Condition factors for weathering
		const conditionFactor =
			condition === "new"
				? 1
				: condition === "weathered"
					? 0.8
					: condition === "rusted"
						? 0.6
						: 0.45;

		// Materials
		const grateMat = new PBRMaterial(`drain_grate_${id}`, scene);
		grateMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(conditionFactor);
		grateMat.metallic = condition === "rusted" ? 0.6 : 0.85;
		grateMat.roughness = condition === "rusted" ? 0.75 : 0.5;

		const frameMat = new PBRMaterial(`drain_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(0.25, 0.25, 0.27).scale(conditionFactor);
		frameMat.metallic = 0.8;
		frameMat.roughness = 0.5;

		const holeMat = new PBRMaterial(`drain_hole_${id}`, scene);
		holeMat.albedoColor = new Color3(0.02, 0.02, 0.03);
		holeMat.metallic = 0;
		holeMat.roughness = 1;

		const frameDepth = 0.04;
		const grateThickness = 0.02;

		if (type === "slot") {
			// Linear slot drain
			// Frame
			const frame = MeshBuilder.CreateBox(
				`${id}_frame`,
				{ width: width + 0.03, height: frameDepth, depth: length + 0.03 },
				scene
			);
			frame.position = new Vector3(posX, posY + frameDepth / 2, posZ);
			frame.rotation.y = rotation;
			frame.material = frameMat;
			meshes.push(frame);

			// Inner void
			const innerVoid = MeshBuilder.CreateBox(
				`${id}_void`,
				{ width: width - 0.01, height: frameDepth + 0.01, depth: length - 0.01 },
				scene
			);
			innerVoid.position = new Vector3(posX, posY + frameDepth / 2, posZ);
			innerVoid.rotation.y = rotation;
			innerVoid.material = holeMat;
			meshes.push(innerVoid);

			// Slot grate bars (parallel bars)
			const barCount = Math.floor(length / 0.08);
			const barSpacing = length / barCount;
			const barWidth = 0.015;

			for (let i = 0; i < barCount; i++) {
				const barZ = (i - (barCount - 1) / 2) * barSpacing;

				const bar = MeshBuilder.CreateBox(
					`${id}_bar_${i}`,
					{ width: width - 0.02, height: grateThickness, depth: barWidth },
					scene
				);
				bar.position = new Vector3(
					posX + Math.sin(rotation) * barZ,
					posY + frameDepth + grateThickness / 2,
					posZ + Math.cos(rotation) * barZ
				);
				bar.rotation.y = rotation;
				bar.material = grateMat;
				meshes.push(bar);
			}

			// Cross supports (2 perpendicular bars)
			for (const xOffset of [-width / 4, width / 4]) {
				const support = MeshBuilder.CreateBox(
					`${id}_support_${xOffset}`,
					{ width: barWidth, height: grateThickness, depth: length - 0.02 },
					scene
				);
				support.position = new Vector3(
					posX + Math.cos(rotation) * xOffset,
					posY + frameDepth + grateThickness / 2,
					posZ - Math.sin(rotation) * xOffset
				);
				support.rotation.y = rotation;
				support.material = grateMat;
				meshes.push(support);
			}
		} else if (type === "grid") {
			// Square grid drain
			const gridSize = Math.max(width, length);

			// Frame
			const frame = MeshBuilder.CreateBox(
				`${id}_frame`,
				{ width: gridSize + 0.04, height: frameDepth, depth: gridSize + 0.04 },
				scene
			);
			frame.position = new Vector3(posX, posY + frameDepth / 2, posZ);
			frame.rotation.y = rotation;
			frame.material = frameMat;
			meshes.push(frame);

			// Inner void
			const innerVoid = MeshBuilder.CreateBox(
				`${id}_void`,
				{ width: gridSize - 0.01, height: frameDepth + 0.01, depth: gridSize - 0.01 },
				scene
			);
			innerVoid.position = new Vector3(posX, posY + frameDepth / 2, posZ);
			innerVoid.rotation.y = rotation;
			innerVoid.material = holeMat;
			meshes.push(innerVoid);

			// Grid pattern
			const gridBarCount = Math.floor(gridSize / 0.04);
			const gridSpacing = gridSize / gridBarCount;
			const gridBarWidth = 0.012;

			// Horizontal bars
			for (let i = 0; i < gridBarCount; i++) {
				const barOffset = (i - (gridBarCount - 1) / 2) * gridSpacing;

				const hBar = MeshBuilder.CreateBox(
					`${id}_hbar_${i}`,
					{ width: gridSize - 0.02, height: grateThickness, depth: gridBarWidth },
					scene
				);
				hBar.position = new Vector3(
					posX + Math.sin(rotation) * barOffset,
					posY + frameDepth + grateThickness / 2,
					posZ + Math.cos(rotation) * barOffset
				);
				hBar.rotation.y = rotation;
				hBar.material = grateMat;
				meshes.push(hBar);
			}

			// Vertical bars
			for (let i = 0; i < gridBarCount; i++) {
				const barOffset = (i - (gridBarCount - 1) / 2) * gridSpacing;

				const vBar = MeshBuilder.CreateBox(
					`${id}_vbar_${i}`,
					{ width: gridBarWidth, height: grateThickness, depth: gridSize - 0.02 },
					scene
				);
				vBar.position = new Vector3(
					posX + Math.cos(rotation) * barOffset,
					posY + frameDepth + grateThickness / 2,
					posZ - Math.sin(rotation) * barOffset
				);
				vBar.rotation.y = rotation;
				vBar.material = grateMat;
				meshes.push(vBar);
			}
		} else if (type === "trench") {
			// Long trench drain (for walkways)
			const trenchWidth = width;
			const trenchLength = length;

			// Channel walls
			for (const side of [-1, 1]) {
				const wall = MeshBuilder.CreateBox(
					`${id}_wall_${side}`,
					{ width: 0.02, height: frameDepth * 2, depth: trenchLength },
					scene
				);
				wall.position = new Vector3(
					posX + Math.cos(rotation) * (side * (trenchWidth / 2 + 0.01)),
					posY + frameDepth,
					posZ - Math.sin(rotation) * (side * (trenchWidth / 2 + 0.01))
				);
				wall.rotation.y = rotation;
				wall.material = frameMat;
				meshes.push(wall);
			}

			// Channel floor (visible through grate)
			const channelFloor = MeshBuilder.CreateBox(
				`${id}_floor`,
				{ width: trenchWidth, height: 0.01, depth: trenchLength },
				scene
			);
			channelFloor.position = new Vector3(posX, posY + 0.005, posZ);
			channelFloor.rotation.y = rotation;
			channelFloor.material = holeMat;
			meshes.push(channelFloor);

			// End caps
			for (const end of [-1, 1]) {
				const endCap = MeshBuilder.CreateBox(
					`${id}_endcap_${end}`,
					{ width: trenchWidth + 0.04, height: frameDepth * 2, depth: 0.02 },
					scene
				);
				endCap.position = new Vector3(
					posX + Math.sin(rotation) * (end * (trenchLength / 2 + 0.01)),
					posY + frameDepth,
					posZ + Math.cos(rotation) * (end * (trenchLength / 2 + 0.01))
				);
				endCap.rotation.y = rotation;
				endCap.material = frameMat;
				meshes.push(endCap);
			}

			// Grate sections
			const sectionCount = Math.floor(trenchLength / 0.3);
			const sectionLength = trenchLength / sectionCount;

			for (let s = 0; s < sectionCount; s++) {
				const sectionZ = (s - (sectionCount - 1) / 2) * sectionLength;

				// Section frame
				const sectionFrame = MeshBuilder.CreateBox(
					`${id}_section_frame_${s}`,
					{ width: trenchWidth + 0.01, height: 0.01, depth: 0.015 },
					scene
				);
				sectionFrame.position = new Vector3(
					posX + Math.sin(rotation) * (sectionZ - sectionLength / 2),
					posY + frameDepth * 2 + 0.005,
					posZ + Math.cos(rotation) * (sectionZ - sectionLength / 2)
				);
				sectionFrame.rotation.y = rotation;
				sectionFrame.material = frameMat;
				meshes.push(sectionFrame);

				// Grate bars within section
				const barsPerSection = 4;
				for (let b = 0; b < barsPerSection; b++) {
					const barZ = sectionZ + (b - (barsPerSection - 1) / 2) * (sectionLength / (barsPerSection + 1));

					const bar = MeshBuilder.CreateBox(
						`${id}_bar_${s}_${b}`,
						{ width: trenchWidth - 0.01, height: grateThickness, depth: 0.01 },
						scene
					);
					bar.position = new Vector3(
						posX + Math.sin(rotation) * barZ,
						posY + frameDepth * 2 + grateThickness / 2,
						posZ + Math.cos(rotation) * barZ
					);
					bar.rotation.y = rotation;
					bar.material = grateMat;
					meshes.push(bar);
				}
			}
		} else if (type === "curb") {
			// Curb-side drain inlet
			const inletWidth = width;
			const inletHeight = 0.15;

			// Curb face with opening
			const curbMat = new PBRMaterial(`drain_curb_${id}`, scene);
			curbMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(conditionFactor);
			curbMat.metallic = 0.1;
			curbMat.roughness = 0.85;

			// Left curb piece
			const leftCurb = MeshBuilder.CreateBox(
				`${id}_leftCurb`,
				{ width: 0.08, height: inletHeight, depth: 0.15 },
				scene
			);
			leftCurb.position = new Vector3(
				posX + Math.cos(rotation) * (-(inletWidth / 2 + 0.04)),
				posY + inletHeight / 2,
				posZ - Math.sin(rotation) * (-(inletWidth / 2 + 0.04))
			);
			leftCurb.rotation.y = rotation;
			leftCurb.material = curbMat;
			meshes.push(leftCurb);

			// Right curb piece
			const rightCurb = MeshBuilder.CreateBox(
				`${id}_rightCurb`,
				{ width: 0.08, height: inletHeight, depth: 0.15 },
				scene
			);
			rightCurb.position = new Vector3(
				posX + Math.cos(rotation) * (inletWidth / 2 + 0.04),
				posY + inletHeight / 2,
				posZ - Math.sin(rotation) * (inletWidth / 2 + 0.04)
			);
			rightCurb.rotation.y = rotation;
			rightCurb.material = curbMat;
			meshes.push(rightCurb);

			// Top piece (lintel)
			const lintel = MeshBuilder.CreateBox(
				`${id}_lintel`,
				{ width: inletWidth + 0.16, height: 0.05, depth: 0.15 },
				scene
			);
			lintel.position = new Vector3(
				posX,
				posY + inletHeight + 0.025,
				posZ
			);
			lintel.rotation.y = rotation;
			lintel.material = curbMat;
			meshes.push(lintel);

			// Drain opening (dark void)
			const opening = MeshBuilder.CreateBox(
				`${id}_opening`,
				{ width: inletWidth, height: inletHeight - 0.02, depth: 0.12 },
				scene
			);
			opening.position = new Vector3(
				posX + Math.sin(rotation) * 0.01,
				posY + (inletHeight - 0.02) / 2 + 0.01,
				posZ + Math.cos(rotation) * 0.01
			);
			opening.rotation.y = rotation;
			opening.material = holeMat;
			meshes.push(opening);

			// Grate bars (horizontal)
			const barCount = 4;
			const barSpacing = (inletHeight - 0.04) / (barCount + 1);

			for (let i = 0; i < barCount; i++) {
				const bar = MeshBuilder.CreateCylinder(
					`${id}_bar_${i}`,
					{ height: inletWidth - 0.02, diameter: 0.015 },
					scene
				);
				bar.position = new Vector3(
					posX,
					posY + barSpacing * (i + 1) + 0.02,
					posZ + Math.cos(rotation) * 0.075
				);
				bar.rotation.z = Math.PI / 2;
				bar.rotation.y = rotation;
				bar.material = grateMat;
				meshes.push(bar);
			}

			// Floor slab
			const floor = MeshBuilder.CreateBox(
				`${id}_floor`,
				{ width: inletWidth + 0.16, height: 0.02, depth: 0.2 },
				scene
			);
			floor.position = new Vector3(
				posX - Math.sin(rotation) * 0.025,
				posY + 0.01,
				posZ - Math.cos(rotation) * 0.025
			);
			floor.rotation.y = rotation;
			floor.material = curbMat;
			meshes.push(floor);
		}

		// Water flow effect
		if (waterFlow > 0 && !isBlocked) {
			const waterMat = new PBRMaterial(`drain_water_${id}`, scene);
			waterMat.albedoColor = new Color3(0.3, 0.5, 0.7);
			waterMat.metallic = 0.2;
			waterMat.roughness = 0.15;
			waterMat.alpha = 0.6 + waterFlow * 0.3;

			if (type === "curb") {
				// Water flowing into curb drain
				const waterStream = MeshBuilder.CreateBox(
					`${id}_waterStream`,
					{ width: width * 0.6, height: 0.01, depth: 0.3 },
					scene
				);
				waterStream.position = new Vector3(
					posX + Math.sin(rotation) * 0.2,
					posY + 0.005 + waterFlow * 0.02,
					posZ + Math.cos(rotation) * 0.2
				);
				waterStream.rotation.y = rotation;
				waterStream.material = waterMat;
				meshes.push(waterStream);
			} else {
				// Water pooling at drain
				const waterPool = MeshBuilder.CreateDisc(
					`${id}_waterPool`,
					{ radius: Math.max(width, length) / 2 + waterFlow * 0.1 },
					scene
				);
				waterPool.position = new Vector3(posX, posY + frameDepth + grateThickness + 0.002, posZ);
				waterPool.rotation.x = Math.PI / 2;
				waterPool.material = waterMat;
				meshes.push(waterPool);
			}
		}

		// Blocked debris
		if (isBlocked && rng) {
			const debrisMat = new PBRMaterial(`drain_debris_${id}`, scene);
			debrisMat.albedoColor = new Color3(0.35, 0.3, 0.25);
			debrisMat.metallic = 0;
			debrisMat.roughness = 0.9;

			const debrisCount = 3 + Math.floor(rng.next() * 5);
			for (let d = 0; d < debrisCount; d++) {
				const debrisType = rng.next();

				if (debrisType < 0.4) {
					// Leaves
					const leaf = MeshBuilder.CreateDisc(
						`${id}_leaf_${d}`,
						{ radius: 0.015 + rng.next() * 0.02 },
						scene
					);
					const offsetX = (rng.next() - 0.5) * (width * 0.8);
					const offsetZ = (rng.next() - 0.5) * (length * 0.8);
					leaf.position = new Vector3(
						posX + Math.cos(rotation) * offsetX + Math.sin(rotation) * offsetZ,
						posY + frameDepth + grateThickness + 0.005 + rng.next() * 0.01,
						posZ - Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetZ
					);
					leaf.rotation.x = Math.PI / 2 + (rng.next() - 0.5) * 0.3;
					leaf.rotation.y = rng.next() * Math.PI * 2;
					const leafMat = new PBRMaterial(`drain_leaf_${id}_${d}`, scene);
					leafMat.albedoColor = new Color3(
						0.3 + rng.next() * 0.3,
						0.25 + rng.next() * 0.15,
						0.1
					);
					leafMat.metallic = 0;
					leafMat.roughness = 0.85;
					leaf.material = leafMat;
					meshes.push(leaf);
				} else if (debrisType < 0.7) {
					// Twigs
					const twig = MeshBuilder.CreateCylinder(
						`${id}_twig_${d}`,
						{ height: 0.04 + rng.next() * 0.06, diameter: 0.005 + rng.next() * 0.005 },
						scene
					);
					const offsetX = (rng.next() - 0.5) * (width * 0.7);
					const offsetZ = (rng.next() - 0.5) * (length * 0.7);
					twig.position = new Vector3(
						posX + Math.cos(rotation) * offsetX + Math.sin(rotation) * offsetZ,
						posY + frameDepth + grateThickness + 0.01,
						posZ - Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetZ
					);
					twig.rotation.z = Math.PI / 2 + (rng.next() - 0.5) * 0.5;
					twig.rotation.y = rng.next() * Math.PI;
					const twigMat = new PBRMaterial(`drain_twig_${id}_${d}`, scene);
					twigMat.albedoColor = new Color3(0.35, 0.25, 0.15);
					twigMat.metallic = 0;
					twigMat.roughness = 0.9;
					twig.material = twigMat;
					meshes.push(twig);
				} else {
					// Trash/paper
					const trash = MeshBuilder.CreateBox(
						`${id}_trash_${d}`,
						{
							width: 0.02 + rng.next() * 0.03,
							height: 0.002,
							depth: 0.02 + rng.next() * 0.03,
						},
						scene
					);
					const offsetX = (rng.next() - 0.5) * (width * 0.6);
					const offsetZ = (rng.next() - 0.5) * (length * 0.6);
					trash.position = new Vector3(
						posX + Math.cos(rotation) * offsetX + Math.sin(rotation) * offsetZ,
						posY + frameDepth + grateThickness + 0.005,
						posZ - Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetZ
					);
					trash.rotation.y = rng.next() * Math.PI;
					trash.rotation.x = (rng.next() - 0.5) * 0.2;
					const trashMat = new PBRMaterial(`drain_trash_${id}_${d}`, scene);
					trashMat.albedoColor = new Color3(
						0.7 + rng.next() * 0.25,
						0.7 + rng.next() * 0.25,
						0.65 + rng.next() * 0.2
					);
					trashMat.metallic = 0;
					trashMat.roughness = 0.8;
					trash.material = trashMat;
					meshes.push(trash);
				}
			}

			// Sludge buildup
			const sludgeMat = new PBRMaterial(`drain_sludge_${id}`, scene);
			sludgeMat.albedoColor = new Color3(0.2, 0.18, 0.15);
			sludgeMat.metallic = 0.1;
			sludgeMat.roughness = 0.95;
			sludgeMat.alpha = 0.9;

			const sludge = MeshBuilder.CreateDisc(
				`${id}_sludge`,
				{ radius: Math.max(width, length) / 2 * 0.8 },
				scene
			);
			sludge.position = new Vector3(posX, posY + frameDepth + grateThickness + 0.001, posZ);
			sludge.rotation.x = Math.PI / 2;
			sludge.material = sludgeMat;
			meshes.push(sludge);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			grateMat.dispose();
			frameMat.dispose();
			holeMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, width, length, isBlocked, waterFlow, condition, rotation, seed]);

	return null;
}
