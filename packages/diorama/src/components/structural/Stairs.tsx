/**
 * Stairs - Staircase component for vertical navigation
 *
 * Supports multiple stair types:
 * - straight: Standard straight staircase
 * - spiral: Spiral/helical staircase
 * - lshaped: L-shaped with landing
 * - ushaped: U-shaped with double landing
 */

import {
	type AbstractMesh,
	type Scene as BabylonScene,
	Color3,
	MeshBuilder,
	PBRMaterial,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../../world/blocks/Block";

export type StairType = "straight" | "spiral" | "lshaped" | "ushaped";
export type StairMaterial = "concrete" | "metal" | "wood" | "stone";

export interface StairsProps {
	id: string;
	position: Vector3;
	/** Total height to climb */
	height?: number;
	/** Width of stairs */
	width?: number;
	/** Type of staircase */
	type?: StairType;
	/** Material appearance */
	material?: StairMaterial;
	/** Direction stairs face (radians) */
	rotation?: number;
	/** Number of steps (auto-calculated if not specified) */
	stepCount?: number;
	/** Include handrails */
	handrails?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

const MATERIAL_COLORS: Record<
	StairMaterial,
	{ base: Color3; metallic: number; roughness: number }
> = {
	concrete: { base: new Color3(0.5, 0.5, 0.52), metallic: 0, roughness: 0.85 },
	metal: { base: new Color3(0.4, 0.42, 0.45), metallic: 0.8, roughness: 0.4 },
	wood: { base: new Color3(0.45, 0.32, 0.2), metallic: 0, roughness: 0.7 },
	stone: { base: new Color3(0.55, 0.53, 0.5), metallic: 0, roughness: 0.9 },
};

export function Stairs({
	id,
	position,
	height = 3,
	width = 1.5,
	type = "straight",
	material = "concrete",
	rotation = 0,
	stepCount,
	handrails = true,
	seed,
}: StairsProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Calculate steps
		const stepHeight = 0.18; // Standard step height
		const steps = stepCount ?? Math.ceil(height / stepHeight);
		const actualStepHeight = height / steps;
		const stepDepth = 0.28; // Standard tread depth

		// Apply seed variation
		const materialVariation = rng ? rng.next() * 0.1 - 0.05 : 0;

		// Create material
		const mat = new PBRMaterial(`stairs_mat_${id}`, scene);
		const colors = MATERIAL_COLORS[material];
		mat.albedoColor = new Color3(
			colors.base.r + materialVariation,
			colors.base.g + materialVariation,
			colors.base.b + materialVariation,
		);
		mat.metallic = colors.metallic;
		mat.roughness = colors.roughness;

		// Build stairs based on type
		if (type === "straight") {
			for (let i = 0; i < steps; i++) {
				const step = MeshBuilder.CreateBox(
					`${id}_step_${i}`,
					{ width, height: actualStepHeight, depth: stepDepth },
					scene,
				);
				step.position = new Vector3(
					posX,
					posY + (i + 0.5) * actualStepHeight,
					posZ + i * stepDepth,
				);
				step.rotation.y = rotation;
				step.material = mat;
				meshes.push(step);
			}

			// Handrails
			if (handrails) {
				const railMat = new PBRMaterial(`rail_mat_${id}`, scene);
				railMat.albedoColor = new Color3(0.3, 0.3, 0.32);
				railMat.metallic = 0.9;
				railMat.roughness = 0.3;

				const totalDepth = steps * stepDepth;
				const railLength = Math.sqrt(totalDepth * totalDepth + height * height);

				for (const side of [-1, 1]) {
					// Rail post at bottom
					const bottomPost = MeshBuilder.CreateCylinder(
						`${id}_post_bottom_${side}`,
						{ height: 1, diameter: 0.05 },
						scene,
					);
					bottomPost.position = new Vector3(
						posX + (side * width) / 2,
						posY + 0.5,
						posZ,
					);
					bottomPost.rotation.y = rotation;
					bottomPost.material = railMat;
					meshes.push(bottomPost);

					// Rail post at top
					const topPost = MeshBuilder.CreateCylinder(
						`${id}_post_top_${side}`,
						{ height: 1, diameter: 0.05 },
						scene,
					);
					topPost.position = new Vector3(
						posX + (side * width) / 2,
						posY + height + 0.5,
						posZ + totalDepth,
					);
					topPost.rotation.y = rotation;
					topPost.material = railMat;
					meshes.push(topPost);

					// Handrail
					const rail = MeshBuilder.CreateCylinder(
						`${id}_rail_${side}`,
						{ height: railLength, diameter: 0.04 },
						scene,
					);
					rail.position = new Vector3(
						posX + (side * width) / 2,
						posY + height / 2 + 1,
						posZ + totalDepth / 2,
					);
					rail.rotation.x = Math.atan2(height, totalDepth);
					rail.rotation.y = rotation;
					rail.material = railMat;
					meshes.push(rail);
				}
			}
		} else if (type === "spiral") {
			const radius = width;
			const anglePerStep = (Math.PI * 2) / 12; // 12 steps per revolution

			for (let i = 0; i < steps; i++) {
				const angle = i * anglePerStep + rotation;
				const step = MeshBuilder.CreateBox(
					`${id}_step_${i}`,
					{ width: radius, height: actualStepHeight, depth: 0.3 },
					scene,
				);
				step.position = new Vector3(
					posX + Math.cos(angle) * radius * 0.5,
					posY + (i + 0.5) * actualStepHeight,
					posZ + Math.sin(angle) * radius * 0.5,
				);
				step.rotation.y = angle + Math.PI / 2;
				step.material = mat;
				meshes.push(step);
			}

			// Central pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: height + 0.5, diameter: 0.15 },
				scene,
			);
			pole.position = new Vector3(posX, posY + height / 2, posZ);
			pole.material = mat;
			meshes.push(pole);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			mat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		height,
		width,
		type,
		material,
		rotation,
		stepCount,
		handrails,
		seed,
	]);

	return null;
}
