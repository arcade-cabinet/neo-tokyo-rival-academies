/**
 * Chimney - Building chimneys component
 *
 * Various chimney types for buildings in Neo-Tokyo.
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

export type ChimneyType = "brick" | "metal" | "industrial" | "decorative";
export type ConditionType = "pristine" | "weathered" | "rusted" | "damaged";

export interface ChimneyProps {
	id: string;
	position: Vector3;
	/** Chimney type */
	type?: ChimneyType;
	/** Height of chimney */
	height?: number;
	/** Width/diameter of chimney */
	width?: number;
	/** Has rain cap */
	hasCap?: boolean;
	/** Is producing smoke */
	isSmoking?: boolean;
	/** Physical condition */
	condition?: ConditionType;
	/** Direction chimney faces (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const CONDITION_FACTORS: Record<ConditionType, { rust: number; roughness: number; soot: number }> = {
	pristine: { rust: 0, roughness: 0.4, soot: 0 },
	weathered: { rust: 0.2, roughness: 0.6, soot: 0.2 },
	rusted: { rust: 0.5, roughness: 0.75, soot: 0.4 },
	damaged: { rust: 0.7, roughness: 0.85, soot: 0.6 },
};

export function Chimney({
	id,
	position,
	type = "brick",
	height = 1.5,
	width = 0.4,
	hasCap = true,
	isSmoking = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: ChimneyProps) {
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

		if (type === "brick") {
			// Traditional brick chimney
			const brickMat = new PBRMaterial(`brick_mat_${id}`, scene);
			brickMat.albedoColor = new Color3(
				0.55 - conditionFactor.soot * 0.2,
				0.32 - conditionFactor.soot * 0.15,
				0.25 - conditionFactor.soot * 0.1
			);
			brickMat.metallic = 0;
			brickMat.roughness = conditionFactor.roughness + 0.1;
			materials.push(brickMat);

			// Main chimney body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: width, height: height, depth: width },
				scene
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.rotation.y = rotation;
			body.material = brickMat;
			meshes.push(body);

			// Brick texture pattern (rows of mortar lines)
			const mortarMat = new PBRMaterial(`mortar_mat_${id}`, scene);
			mortarMat.albedoColor = new Color3(0.6, 0.58, 0.55).scale(1 - conditionFactor.soot * 0.3);
			mortarMat.metallic = 0;
			mortarMat.roughness = 0.9;
			materials.push(mortarMat);

			const rowCount = Math.floor(height / 0.08);
			for (let i = 0; i < rowCount; i++) {
				for (const face of [0, 1, 2, 3]) {
					const faceAngle = rotation + (face * Math.PI / 2);
					const mortar = MeshBuilder.CreateBox(
						`${id}_mortar_${face}_${i}`,
						{ width: width * 0.98, height: 0.008, depth: 0.002 },
						scene
					);
					mortar.position = new Vector3(
						posX + Math.sin(faceAngle) * (width / 2 + 0.001),
						posY + 0.04 + i * (height / rowCount),
						posZ + Math.cos(faceAngle) * (width / 2 + 0.001)
					);
					mortar.rotation.y = faceAngle;
					mortar.material = mortarMat;
					meshes.push(mortar);
				}
			}

			// Decorative crown at top
			const crownMat = new PBRMaterial(`crown_mat_${id}`, scene);
			crownMat.albedoColor = brickMat.albedoColor.scale(0.9);
			crownMat.metallic = 0;
			crownMat.roughness = conditionFactor.roughness + 0.05;
			materials.push(crownMat);

			const crown = MeshBuilder.CreateBox(
				`${id}_crown`,
				{ width: width + 0.06, height: 0.05, depth: width + 0.06 },
				scene
			);
			crown.position = new Vector3(posX, posY + height + 0.025, posZ);
			crown.rotation.y = rotation;
			crown.material = crownMat;
			meshes.push(crown);

			// Flue opening
			const flue = MeshBuilder.CreateBox(
				`${id}_flue`,
				{ width: width * 0.6, height: 0.1, depth: width * 0.6 },
				scene
			);
			flue.position = new Vector3(posX, posY + height + 0.1, posZ);
			flue.rotation.y = rotation;
			flue.material = brickMat;
			meshes.push(flue);

		} else if (type === "metal") {
			// Single-wall metal chimney pipe
			const metalMat = new PBRMaterial(`metal_mat_${id}`, scene);
			const rust = conditionFactor.rust + rustVariation;
			metalMat.albedoColor = new Color3(
				0.55 - rust * 0.1 + rust * 0.25,
				0.55 - rust * 0.25,
				0.58 - rust * 0.35
			);
			metalMat.metallic = 0.85 - rust * 0.3;
			metalMat.roughness = conditionFactor.roughness;
			materials.push(metalMat);

			// Main pipe
			const pipe = MeshBuilder.CreateCylinder(
				`${id}_pipe`,
				{ height: height, diameter: width, tessellation: 24 },
				scene
			);
			pipe.position = new Vector3(posX, posY + height / 2, posZ);
			pipe.material = metalMat;
			meshes.push(pipe);

			// Pipe collar/flashing at base
			const flashingMat = new PBRMaterial(`flashing_mat_${id}`, scene);
			flashingMat.albedoColor = new Color3(0.25, 0.25, 0.27);
			flashingMat.metallic = 0.7;
			flashingMat.roughness = 0.5;
			materials.push(flashingMat);

			const flashing = MeshBuilder.CreateCylinder(
				`${id}_flashing`,
				{
					height: 0.08,
					diameterTop: width + 0.02,
					diameterBottom: width + 0.15,
					tessellation: 24,
				},
				scene
			);
			flashing.position = new Vector3(posX, posY + 0.04, posZ);
			flashing.material = flashingMat;
			meshes.push(flashing);

			// Storm collar
			const collar = MeshBuilder.CreateTorus(
				`${id}_collar`,
				{ diameter: width + 0.04, thickness: 0.015, tessellation: 24 },
				scene
			);
			collar.position = new Vector3(posX, posY + 0.12, posZ);
			collar.rotation.x = Math.PI / 2;
			collar.material = metalMat;
			meshes.push(collar);

			// Seam lines
			for (let i = 0; i < 3; i++) {
				const seamY = posY + 0.3 + (i * height * 0.3);
				const seam = MeshBuilder.CreateTorus(
					`${id}_seam_${i}`,
					{ diameter: width + 0.008, thickness: 0.008, tessellation: 24 },
					scene
				);
				seam.position = new Vector3(posX, seamY, posZ);
				seam.rotation.x = Math.PI / 2;
				seam.material = metalMat;
				meshes.push(seam);
			}

		} else if (type === "industrial") {
			// Industrial exhaust stack
			const stackMat = new PBRMaterial(`stack_mat_${id}`, scene);
			const rust = conditionFactor.rust + rustVariation;
			stackMat.albedoColor = new Color3(
				0.45 - rust * 0.1 + rust * 0.2,
				0.45 - rust * 0.2,
				0.48 - rust * 0.25
			);
			stackMat.metallic = 0.75 - rust * 0.2;
			stackMat.roughness = conditionFactor.roughness;
			materials.push(stackMat);

			// Main stack (tapered)
			const stack = MeshBuilder.CreateCylinder(
				`${id}_stack`,
				{
					height: height,
					diameterTop: width * 0.85,
					diameterBottom: width,
					tessellation: 32,
				},
				scene
			);
			stack.position = new Vector3(posX, posY + height / 2, posZ);
			stack.material = stackMat;
			meshes.push(stack);

			// Base flange
			const flange = MeshBuilder.CreateCylinder(
				`${id}_flange`,
				{ height: 0.06, diameter: width * 1.3, tessellation: 32 },
				scene
			);
			flange.position = new Vector3(posX, posY + 0.03, posZ);
			flange.material = stackMat;
			meshes.push(flange);

			// Reinforcement rings
			const ringCount = Math.max(2, Math.floor(height / 0.6));
			for (let i = 0; i < ringCount; i++) {
				const ringY = posY + 0.2 + (i / ringCount) * (height - 0.4);
				const ringDiameter = width - (i / ringCount) * (width * 0.15);

				const ring = MeshBuilder.CreateTorus(
					`${id}_ring_${i}`,
					{ diameter: ringDiameter + 0.03, thickness: 0.025, tessellation: 32 },
					scene
				);
				ring.position = new Vector3(posX, ringY, posZ);
				ring.rotation.x = Math.PI / 2;
				ring.material = stackMat;
				meshes.push(ring);
			}

			// Access ladder
			const ladderMat = new PBRMaterial(`ladder_mat_${id}`, scene);
			ladderMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			ladderMat.metallic = 0.8;
			ladderMat.roughness = 0.5;
			materials.push(ladderMat);

			// Ladder rails
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateCylinder(
					`${id}_rail_${side}`,
					{ height: height * 0.9, diameter: 0.02 },
					scene
				);
				rail.position = new Vector3(
					posX + Math.cos(rotation) * (side * 0.12) + Math.sin(rotation) * (width / 2 + 0.05),
					posY + height * 0.45,
					posZ - Math.sin(rotation) * (side * 0.12) + Math.cos(rotation) * (width / 2 + 0.05)
				);
				rail.material = ladderMat;
				meshes.push(rail);
			}

			// Ladder rungs
			const rungCount = Math.floor(height * 3);
			for (let i = 0; i < rungCount; i++) {
				const rung = MeshBuilder.CreateCylinder(
					`${id}_rung_${i}`,
					{ height: 0.24, diameter: 0.015 },
					scene
				);
				rung.position = new Vector3(
					posX + Math.sin(rotation) * (width / 2 + 0.05),
					posY + 0.15 + (i / rungCount) * height * 0.85,
					posZ + Math.cos(rotation) * (width / 2 + 0.05)
				);
				rung.rotation.z = Math.PI / 2;
				rung.rotation.y = rotation;
				rung.material = ladderMat;
				meshes.push(rung);
			}

			// Safety cage (top portion)
			const cageStartY = posY + height * 0.6;
			const cageHeight = height * 0.35;
			const cageRadius = width / 2 + 0.2;

			// Cage hoops
			for (let i = 0; i < 4; i++) {
				const hoopY = cageStartY + (i / 3) * cageHeight;
				const hoop = MeshBuilder.CreateTorus(
					`${id}_hoop_${i}`,
					{ diameter: cageRadius * 2, thickness: 0.012, tessellation: 24, arc: 0.75 },
					scene
				);
				hoop.position = new Vector3(
					posX - Math.sin(rotation) * cageRadius * 0.1,
					hoopY,
					posZ - Math.cos(rotation) * cageRadius * 0.1
				);
				hoop.rotation.x = Math.PI / 2;
				hoop.rotation.y = rotation + Math.PI / 2;
				hoop.material = ladderMat;
				meshes.push(hoop);
			}

		} else if (type === "decorative") {
			// Decorative Victorian-style chimney
			const stoneMat = new PBRMaterial(`stone_mat_${id}`, scene);
			stoneMat.albedoColor = new Color3(
				0.65 - conditionFactor.soot * 0.15,
				0.62 - conditionFactor.soot * 0.15,
				0.58 - conditionFactor.soot * 0.1
			);
			stoneMat.metallic = 0;
			stoneMat.roughness = conditionFactor.roughness + 0.15;
			materials.push(stoneMat);

			// Base pedestal
			const base = MeshBuilder.CreateBox(
				`${id}_base`,
				{ width: width * 1.2, height: height * 0.15, depth: width * 1.2 },
				scene
			);
			base.position = new Vector3(posX, posY + height * 0.075, posZ);
			base.rotation.y = rotation;
			base.material = stoneMat;
			meshes.push(base);

			// Main shaft
			const shaft = MeshBuilder.CreateBox(
				`${id}_shaft`,
				{ width: width, height: height * 0.6, depth: width },
				scene
			);
			shaft.position = new Vector3(posX, posY + height * 0.15 + height * 0.3, posZ);
			shaft.rotation.y = rotation;
			shaft.material = stoneMat;
			meshes.push(shaft);

			// Corbel transition
			const corbelMat = new PBRMaterial(`corbel_mat_${id}`, scene);
			corbelMat.albedoColor = stoneMat.albedoColor.scale(0.95);
			corbelMat.metallic = 0;
			corbelMat.roughness = stoneMat.roughness;
			materials.push(corbelMat);

			const corbel = MeshBuilder.CreateBox(
				`${id}_corbel`,
				{ width: width * 1.1, height: height * 0.08, depth: width * 1.1 },
				scene
			);
			corbel.position = new Vector3(posX, posY + height * 0.75 + height * 0.04, posZ);
			corbel.rotation.y = rotation;
			corbel.material = corbelMat;
			meshes.push(corbel);

			// Upper stack with decorative bands
			const upperStack = MeshBuilder.CreateBox(
				`${id}_upper`,
				{ width: width * 0.85, height: height * 0.2, depth: width * 0.85 },
				scene
			);
			upperStack.position = new Vector3(posX, posY + height * 0.83 + height * 0.1, posZ);
			upperStack.rotation.y = rotation;
			upperStack.material = stoneMat;
			meshes.push(upperStack);

			// Decorative crown molding
			const crownWidth = width * 0.95;
			for (let layer = 0; layer < 3; layer++) {
				const crownLayer = MeshBuilder.CreateBox(
					`${id}_crown_${layer}`,
					{
						width: crownWidth - layer * 0.03,
						height: 0.025,
						depth: crownWidth - layer * 0.03,
					},
					scene
				);
				crownLayer.position = new Vector3(
					posX,
					posY + height + 0.01 + layer * 0.025,
					posZ
				);
				crownLayer.rotation.y = rotation;
				crownLayer.material = corbelMat;
				meshes.push(crownLayer);
			}

			// Chimney pots (decorative flue terminals)
			const potMat = new PBRMaterial(`pot_mat_${id}`, scene);
			potMat.albedoColor = new Color3(0.5, 0.3, 0.22);
			potMat.metallic = 0;
			potMat.roughness = 0.75;
			materials.push(potMat);

			const potCount = width > 0.5 ? 2 : 1;
			for (let p = 0; p < potCount; p++) {
				const potOffset = potCount > 1 ? (p - 0.5) * width * 0.4 : 0;

				const pot = MeshBuilder.CreateCylinder(
					`${id}_pot_${p}`,
					{
						height: height * 0.15,
						diameterTop: width * 0.25,
						diameterBottom: width * 0.2,
						tessellation: 16,
					},
					scene
				);
				pot.position = new Vector3(
					posX + Math.cos(rotation) * potOffset,
					posY + height + 0.08 + height * 0.075,
					posZ - Math.sin(rotation) * potOffset
				);
				pot.material = potMat;
				meshes.push(pot);

				// Pot rim
				const rim = MeshBuilder.CreateTorus(
					`${id}_rim_${p}`,
					{ diameter: width * 0.27, thickness: 0.015, tessellation: 16 },
					scene
				);
				rim.position = new Vector3(
					posX + Math.cos(rotation) * potOffset,
					posY + height + 0.08 + height * 0.15,
					posZ - Math.sin(rotation) * potOffset
				);
				rim.rotation.x = Math.PI / 2;
				rim.material = potMat;
				meshes.push(rim);
			}
		}

		// Rain cap (if applicable)
		if (hasCap) {
			const capMat = new PBRMaterial(`cap_mat_${id}`, scene);
			const capRust = conditionFactor.rust + rustVariation;
			capMat.albedoColor = new Color3(
				0.5 - capRust * 0.1 + capRust * 0.2,
				0.5 - capRust * 0.2,
				0.52 - capRust * 0.25
			);
			capMat.metallic = 0.8 - capRust * 0.2;
			capMat.roughness = conditionFactor.roughness;
			materials.push(capMat);

			const capY = posY + height + (type === "decorative" ? height * 0.2 : 0.15);
			const capWidth = type === "brick" ? width * 0.7 :
				type === "decorative" ? width * 0.35 :
				width * 0.9;

			// Cap roof
			const capRoof = MeshBuilder.CreateCylinder(
				`${id}_cap_roof`,
				{
					height: 0.06,
					diameterTop: 0.02,
					diameterBottom: capWidth + 0.1,
					tessellation: type === "brick" || type === "decorative" ? 4 : 24,
				},
				scene
			);
			capRoof.position = new Vector3(posX, capY + 0.15, posZ);
			capRoof.rotation.y = type === "brick" || type === "decorative" ? rotation + Math.PI / 4 : 0;
			capRoof.material = capMat;
			meshes.push(capRoof);

			// Cap supports
			const supportCount = type === "brick" || type === "decorative" ? 4 : 3;
			for (let s = 0; s < supportCount; s++) {
				const angle = (s / supportCount) * Math.PI * 2 + rotation;
				const support = MeshBuilder.CreateCylinder(
					`${id}_support_${s}`,
					{ height: 0.12, diameter: 0.012 },
					scene
				);
				support.position = new Vector3(
					posX + Math.cos(angle) * (capWidth / 2 - 0.02),
					capY + 0.06,
					posZ + Math.sin(angle) * (capWidth / 2 - 0.02)
				);
				support.material = capMat;
				meshes.push(support);
			}
		}

		// Smoke effect (simple cylinder as placeholder for particle system)
		if (isSmoking) {
			const smokeMat = new PBRMaterial(`smoke_mat_${id}`, scene);
			smokeMat.albedoColor = new Color3(0.5, 0.5, 0.52);
			smokeMat.metallic = 0;
			smokeMat.roughness = 1;
			smokeMat.alpha = 0.25;
			materials.push(smokeMat);

			const smokeY = posY + height + (hasCap ? 0.25 : 0.1);
			for (let i = 0; i < 3; i++) {
				const smokeHeight = 0.15 + i * 0.1;
				const smokeDrift = rng ? (rng.next() - 0.5) * 0.1 : 0;

				const smoke = MeshBuilder.CreateCylinder(
					`${id}_smoke_${i}`,
					{
						height: smokeHeight,
						diameterTop: width * (0.4 + i * 0.15),
						diameterBottom: width * (0.2 + i * 0.1),
						tessellation: 12,
					},
					scene
				);
				smoke.position = new Vector3(
					posX + smokeDrift * i,
					smokeY + i * 0.12 + smokeHeight / 2,
					posZ + smokeDrift * i * 0.5
				);
				smoke.material = smokeMat;
				meshes.push(smoke);
			}
		}

		// Soot staining on damaged/weathered chimneys
		if (conditionFactor.soot > 0.3 && rng) {
			const sootMat = new PBRMaterial(`soot_mat_${id}`, scene);
			sootMat.albedoColor = new Color3(0.1, 0.1, 0.1);
			sootMat.metallic = 0;
			sootMat.roughness = 0.95;
			sootMat.alpha = conditionFactor.soot * 0.5;
			materials.push(sootMat);

			// Soot streaks from top
			const streakCount = Math.floor(conditionFactor.soot * 4) + 1;
			for (let i = 0; i < streakCount; i++) {
				const angle = rng.next() * Math.PI * 2;
				const streakWidth = 0.03 + rng.next() * 0.04;
				const streakHeight = height * (0.3 + rng.next() * 0.4);

				const streak = MeshBuilder.CreateBox(
					`${id}_soot_${i}`,
					{ width: streakWidth, height: streakHeight, depth: 0.005 },
					scene
				);
				streak.position = new Vector3(
					posX + Math.cos(angle) * (width / 2 + 0.003),
					posY + height - streakHeight / 2,
					posZ + Math.sin(angle) * (width / 2 + 0.003)
				);
				streak.rotation.y = angle;
				streak.material = sootMat;
				meshes.push(streak);
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
	}, [scene, id, posX, posY, posZ, type, height, width, hasCap, isSmoking, condition, rotation, seed]);

	return null;
}
