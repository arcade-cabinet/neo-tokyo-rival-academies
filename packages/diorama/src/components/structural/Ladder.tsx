/**
 * Ladder - Vertical access component
 *
 * Various ladder types for vertical navigation in urban environments.
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

export type LadderType = "fixed" | "extension" | "rope" | "cage" | "stepladder";
export type LadderMaterial = "metal" | "wood" | "aluminum" | "rope";

export interface LadderProps {
	id: string;
	position: Vector3;
	/** Ladder type */
	type?: LadderType;
	/** Ladder material */
	material?: LadderMaterial;
	/** Height of ladder */
	height?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Angle from vertical (for leaning ladders) */
	lean?: number;
	/** Rust/damage 0-1 */
	wear?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Ladder({
	id,
	position,
	type = "fixed",
	material = "metal",
	height = 3,
	rotation = 0,
	lean = 0,
	wear = 0.2,
	seed,
}: LadderProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const wearFactor = 1 - wear * 0.3;

		// Material setup
		const railMat = new PBRMaterial(`ladder_rail_${id}`, scene);
		const rungMat = new PBRMaterial(`ladder_rung_${id}`, scene);

		if (material === "metal") {
			railMat.albedoColor = new Color3(
				0.35 * wearFactor,
				0.35 * wearFactor,
				0.38 * wearFactor,
			);
			railMat.metallic = 0.85;
			railMat.roughness = 0.4 + wear * 0.3;
			rungMat.albedoColor = new Color3(
				0.32 * wearFactor,
				0.32 * wearFactor,
				0.35 * wearFactor,
			);
			rungMat.metallic = 0.8;
			rungMat.roughness = 0.45 + wear * 0.3;
		} else if (material === "wood") {
			railMat.albedoColor = new Color3(
				0.45 * wearFactor,
				0.32 * wearFactor,
				0.18 * wearFactor,
			);
			railMat.metallic = 0;
			railMat.roughness = 0.8;
			rungMat.albedoColor = new Color3(
				0.5 * wearFactor,
				0.35 * wearFactor,
				0.2 * wearFactor,
			);
			rungMat.metallic = 0;
			rungMat.roughness = 0.75;
		} else if (material === "aluminum") {
			railMat.albedoColor = new Color3(0.7, 0.72, 0.75).scale(wearFactor);
			railMat.metallic = 0.9;
			railMat.roughness = 0.25;
			rungMat.albedoColor = new Color3(0.68, 0.7, 0.73).scale(wearFactor);
			rungMat.metallic = 0.88;
			rungMat.roughness = 0.3;
		} else {
			// Rope
			railMat.albedoColor = new Color3(0.5, 0.4, 0.25).scale(wearFactor);
			railMat.metallic = 0;
			railMat.roughness = 0.95;
			rungMat.albedoColor = new Color3(0.45, 0.35, 0.2).scale(wearFactor);
			rungMat.metallic = 0;
			rungMat.roughness = 0.9;
		}

		const ladderWidth =
			type === "cage" ? 0.5 : type === "stepladder" ? 0.6 : 0.4;
		const rungSpacing = 0.3;
		const rungCount = Math.floor(height / rungSpacing);
		const railThickness = material === "rope" ? 0.02 : 0.025;

		// Calculate lean offset
		const leanOffset = Math.sin(lean) * height;

		if (type === "fixed" || type === "extension") {
			// Side rails
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateCylinder(
					`${id}_rail_${side}`,
					{ height: height, diameter: railThickness * 2 },
					scene,
				);
				rail.position = new Vector3(
					posX +
						Math.cos(rotation) * ((side * ladderWidth) / 2) +
						(Math.sin(lean) * leanOffset) / 2,
					posY + height / 2,
					posZ - Math.sin(rotation) * ((side * ladderWidth) / 2),
				);
				rail.rotation.x = lean;
				rail.rotation.y = rotation;
				rail.material = railMat;
				meshes.push(rail);
			}

			// Rungs
			for (let i = 0; i < rungCount; i++) {
				const rungY = (i + 0.5) * rungSpacing;
				const rungLeanOffset = Math.sin(lean) * rungY;

				const rung = MeshBuilder.CreateCylinder(
					`${id}_rung_${i}`,
					{ height: ladderWidth, diameter: railThickness * 1.5 },
					scene,
				);
				rung.position = new Vector3(
					posX + Math.sin(lean) * rungLeanOffset,
					posY + rungY,
					posZ,
				);
				rung.rotation.z = Math.PI / 2;
				rung.rotation.y = rotation;
				rung.material = rungMat;
				meshes.push(rung);
			}

			// Extension mechanism
			if (type === "extension") {
				const bracketMat = new PBRMaterial(`ladder_bracket_${id}`, scene);
				bracketMat.albedoColor = new Color3(0.3, 0.3, 0.32);
				bracketMat.metallic = 0.8;
				bracketMat.roughness = 0.4;

				for (const side of [-1, 1]) {
					const bracket = MeshBuilder.CreateBox(
						`${id}_bracket_${side}`,
						{ width: 0.05, height: 0.15, depth: 0.03 },
						scene,
					);
					bracket.position = new Vector3(
						posX + Math.cos(rotation) * ((side * ladderWidth) / 2),
						posY + height * 0.4,
						posZ - Math.sin(rotation) * ((side * ladderWidth) / 2),
					);
					bracket.rotation.y = rotation;
					bracket.material = bracketMat;
					meshes.push(bracket);
				}
			}
		} else if (type === "cage") {
			// Safety cage ladder
			// Rails
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateCylinder(
					`${id}_rail_${side}`,
					{ height: height, diameter: railThickness * 2 },
					scene,
				);
				rail.position = new Vector3(
					posX + Math.cos(rotation) * ((side * ladderWidth) / 2),
					posY + height / 2,
					posZ - Math.sin(rotation) * ((side * ladderWidth) / 2),
				);
				rail.material = railMat;
				meshes.push(rail);
			}

			// Rungs
			for (let i = 0; i < rungCount; i++) {
				const rungY = (i + 0.5) * rungSpacing;
				const rung = MeshBuilder.CreateCylinder(
					`${id}_rung_${i}`,
					{ height: ladderWidth, diameter: railThickness * 1.5 },
					scene,
				);
				rung.position = new Vector3(posX, posY + rungY, posZ);
				rung.rotation.z = Math.PI / 2;
				rung.rotation.y = rotation;
				rung.material = rungMat;
				meshes.push(rung);
			}

			// Safety cage hoops
			const cageMat = new PBRMaterial(`ladder_cage_${id}`, scene);
			cageMat.albedoColor = new Color3(0.4, 0.4, 0.42);
			cageMat.metallic = 0.75;
			cageMat.roughness = 0.5;

			const hoopCount = Math.floor(height / 0.6);
			const cageRadius = 0.4;
			for (let h = 1; h < hoopCount; h++) {
				const hoopY = h * 0.6 + 0.3;
				const hoop = MeshBuilder.CreateTorus(
					`${id}_hoop_${h}`,
					{ diameter: cageRadius * 2, thickness: 0.02, tessellation: 16 },
					scene,
				);
				hoop.position = new Vector3(
					posX - Math.cos(rotation) * (cageRadius / 2),
					posY + hoopY,
					posZ + Math.sin(rotation) * (cageRadius / 2),
				);
				hoop.rotation.x = Math.PI / 2;
				hoop.rotation.z = rotation;
				hoop.material = cageMat;
				meshes.push(hoop);
			}

			// Vertical cage bars
			const barCount = 4;
			for (let b = 0; b < barCount; b++) {
				const barAngle = (b / barCount) * Math.PI + Math.PI / 2;
				const bar = MeshBuilder.CreateCylinder(
					`${id}_cageBar_${b}`,
					{ height: height - 0.5, diameter: 0.015 },
					scene,
				);
				bar.position = new Vector3(
					posX -
						Math.cos(rotation) * (cageRadius / 2) +
						Math.cos(barAngle + rotation) * cageRadius,
					posY + height / 2 + 0.25,
					posZ +
						Math.sin(rotation) * (cageRadius / 2) -
						Math.sin(barAngle + rotation) * cageRadius,
				);
				bar.material = cageMat;
				meshes.push(bar);
			}
		} else if (type === "rope") {
			// Rope ladder
			for (const side of [-1, 1]) {
				// Create segmented rope
				const segmentCount = Math.floor(height / 0.1);
				for (let s = 0; s < segmentCount; s++) {
					const segY = s * 0.1;
					const sway = rng ? (rng.next() - 0.5) * 0.03 : 0;

					const segment = MeshBuilder.CreateCylinder(
						`${id}_rope_${side}_${s}`,
						{ height: 0.1, diameter: railThickness * 2 },
						scene,
					);
					segment.position = new Vector3(
						posX + Math.cos(rotation) * ((side * ladderWidth) / 2) + sway,
						posY + segY + 0.05,
						posZ - Math.sin(rotation) * ((side * ladderWidth) / 2),
					);
					segment.rotation.x = rng ? (rng.next() - 0.5) * 0.1 : 0;
					segment.material = railMat;
					meshes.push(segment);
				}
			}

			// Wooden rungs
			for (let i = 0; i < rungCount; i++) {
				const rungY = (i + 0.5) * rungSpacing;
				const rung = MeshBuilder.CreateBox(
					`${id}_rung_${i}`,
					{ width: ladderWidth + 0.05, height: 0.025, depth: 0.06 },
					scene,
				);
				rung.position = new Vector3(posX, posY + rungY, posZ);
				rung.rotation.y = rotation;
				rung.rotation.z = rng ? (rng.next() - 0.5) * 0.05 : 0;
				rung.material = rungMat;
				meshes.push(rung);
			}
		} else if (type === "stepladder") {
			// A-frame step ladder
			const spreadAngle = 0.25;

			// Front legs
			for (const side of [-1, 1]) {
				const leg = MeshBuilder.CreateCylinder(
					`${id}_frontLeg_${side}`,
					{ height: height, diameter: railThickness * 2 },
					scene,
				);
				leg.position = new Vector3(
					posX +
						Math.cos(rotation) * ((side * ladderWidth) / 2) +
						(Math.sin(rotation) * Math.sin(spreadAngle) * height) / 2,
					posY + (Math.cos(spreadAngle) * height) / 2,
					posZ -
						Math.sin(rotation) * ((side * ladderWidth) / 2) +
						(Math.cos(rotation) * Math.sin(spreadAngle) * height) / 2,
				);
				leg.rotation.x = spreadAngle;
				leg.rotation.y = rotation;
				leg.material = railMat;
				meshes.push(leg);
			}

			// Back legs
			for (const side of [-1, 1]) {
				const leg = MeshBuilder.CreateCylinder(
					`${id}_backLeg_${side}`,
					{ height: height * 0.95, diameter: railThickness * 2 },
					scene,
				);
				leg.position = new Vector3(
					posX +
						Math.cos(rotation) * ((side * ladderWidth) / 2) -
						Math.sin(rotation) * Math.sin(spreadAngle) * height * 0.47,
					posY + Math.cos(spreadAngle) * height * 0.47,
					posZ -
						Math.sin(rotation) * ((side * ladderWidth) / 2) -
						Math.cos(rotation) * Math.sin(spreadAngle) * height * 0.47,
				);
				leg.rotation.x = -spreadAngle;
				leg.rotation.y = rotation;
				leg.material = railMat;
				meshes.push(leg);
			}

			// Steps (front only)
			const stepCount = Math.floor((height - 0.3) / rungSpacing);
			for (let i = 0; i < stepCount; i++) {
				const stepY = (i + 1) * rungSpacing;
				const stepZ = Math.sin(spreadAngle) * stepY;

				const step = MeshBuilder.CreateBox(
					`${id}_step_${i}`,
					{ width: ladderWidth - 0.05, height: 0.02, depth: 0.1 },
					scene,
				);
				step.position = new Vector3(
					posX + Math.sin(rotation) * stepZ,
					posY + Math.cos(spreadAngle) * stepY,
					posZ + Math.cos(rotation) * stepZ,
				);
				step.rotation.y = rotation;
				step.material = rungMat;
				meshes.push(step);
			}

			// Top platform
			const platform = MeshBuilder.CreateBox(
				`${id}_platform`,
				{ width: ladderWidth, height: 0.03, depth: 0.2 },
				scene,
			);
			platform.position = new Vector3(posX, posY + height * 0.9, posZ);
			platform.rotation.y = rotation;
			platform.material = rungMat;
			meshes.push(platform);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			railMat.dispose();
			rungMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		material,
		height,
		rotation,
		lean,
		wear,
		seed,
	]);

	return null;
}
