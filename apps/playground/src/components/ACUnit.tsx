/**
 * ACUnit - Air conditioning outdoor unit component
 *
 * Ubiquitous rooftop element in Japanese urban environments.
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

export type ACSize = "small" | "medium" | "large" | "industrial";

export interface ACUnitProps {
	id: string;
	position: Vector3;
	/** Unit size */
	size?: ACSize;
	/** Is running (fan spinning, slight vibration visual) */
	running?: boolean;
	/** Age/rust level 0-1 */
	age?: number;
	/** Direction unit faces (radians) */
	rotation?: number;
	/** Wall mounted vs ground */
	wallMounted?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

const SIZE_DIMENSIONS: Record<ACSize, { width: number; height: number; depth: number }> = {
	small: { width: 0.7, height: 0.5, depth: 0.25 },
	medium: { width: 0.9, height: 0.7, depth: 0.35 },
	large: { width: 1.2, height: 0.9, depth: 0.4 },
	industrial: { width: 2, height: 1.5, depth: 0.8 },
};

export function ACUnit({
	id,
	position,
	size = "medium",
	running = false,
	age = 0,
	rotation = 0,
	wallMounted = false,
	seed,
}: ACUnitProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const dims = SIZE_DIMENSIONS[size];
		const ageVariation = age * (rng ? rng.next() * 0.12 : 0.08);

		// Body material
		const bodyMat = new PBRMaterial(`ac_body_${id}`, scene);
		bodyMat.albedoColor = new Color3(
			0.85 - ageVariation,
			0.85 - ageVariation,
			0.87 - ageVariation
		);
		bodyMat.metallic = 0.6;
		bodyMat.roughness = 0.5 + age * 0.2;

		// Grill material
		const grillMat = new PBRMaterial(`ac_grill_${id}`, scene);
		grillMat.albedoColor = new Color3(0.15, 0.15, 0.17);
		grillMat.metallic = 0.7;
		grillMat.roughness = 0.6;

		// Fan material (if visible/running)
		const fanMat = new PBRMaterial(`ac_fan_${id}`, scene);
		fanMat.albedoColor = new Color3(0.2, 0.2, 0.22);
		fanMat.metallic = 0.5;
		fanMat.roughness = 0.5;

		// Main body
		const body = MeshBuilder.CreateBox(
			`${id}_body`,
			{ width: dims.width, height: dims.height, depth: dims.depth },
			scene
		);
		body.position = new Vector3(posX, posY + dims.height / 2, posZ);
		body.rotation.y = rotation;
		body.material = bodyMat;
		meshes.push(body);

		// Front grill (where air exhausts)
		const grillDepth = 0.02;
		const grill = MeshBuilder.CreateBox(
			`${id}_grill`,
			{ width: dims.width * 0.85, height: dims.height * 0.7, depth: grillDepth },
			scene
		);
		grill.position = new Vector3(
			posX + Math.sin(rotation) * (dims.depth / 2 + grillDepth / 2),
			posY + dims.height * 0.55,
			posZ + Math.cos(rotation) * (dims.depth / 2 + grillDepth / 2)
		);
		grill.rotation.y = rotation;
		grill.material = grillMat;
		meshes.push(grill);

		// Grill slats
		const slatCount = Math.floor(dims.height * 8);
		for (let i = 0; i < slatCount; i++) {
			const slat = MeshBuilder.CreateBox(
				`${id}_slat_${i}`,
				{ width: dims.width * 0.83, height: 0.008, depth: 0.015 },
				scene
			);
			slat.position = new Vector3(
				posX + Math.sin(rotation) * (dims.depth / 2 + grillDepth + 0.005),
				posY + dims.height * 0.25 + (i / slatCount) * dims.height * 0.55,
				posZ + Math.cos(rotation) * (dims.depth / 2 + grillDepth + 0.005)
			);
			slat.rotation.y = rotation;
			slat.rotation.x = Math.PI / 8; // Angled slats
			slat.material = bodyMat;
			meshes.push(slat);
		}

		// Fan behind grill (simplified as circle)
		if (size === "industrial" || size === "large") {
			const fanRadius = Math.min(dims.width, dims.height) * 0.35;
			const fan = MeshBuilder.CreateCylinder(
				`${id}_fan`,
				{ height: 0.02, diameter: fanRadius * 2 },
				scene
			);
			fan.position = new Vector3(
				posX + Math.sin(rotation) * (dims.depth / 2 - 0.05),
				posY + dims.height * 0.55,
				posZ + Math.cos(rotation) * (dims.depth / 2 - 0.05)
			);
			fan.rotation.x = Math.PI / 2;
			fan.rotation.y = rotation;
			fan.material = fanMat;
			meshes.push(fan);

			// Fan blades
			const bladeCount = 5;
			for (let i = 0; i < bladeCount; i++) {
				const bladeAngle = (i / bladeCount) * Math.PI * 2;
				const blade = MeshBuilder.CreateBox(
					`${id}_blade_${i}`,
					{ width: fanRadius * 0.3, height: fanRadius * 0.9, depth: 0.01 },
					scene
				);
				blade.position = new Vector3(
					posX + Math.sin(rotation) * (dims.depth / 2 - 0.03) + Math.cos(rotation + bladeAngle) * fanRadius * 0.45,
					posY + dims.height * 0.55 + Math.sin(bladeAngle) * fanRadius * 0.45,
					posZ + Math.cos(rotation) * (dims.depth / 2 - 0.03) - Math.sin(rotation + bladeAngle) * fanRadius * 0.45
				);
				blade.rotation.z = bladeAngle + Math.PI / 6;
				blade.material = fanMat;
				meshes.push(blade);
			}
		}

		// Top vents
		const ventCount = size === "industrial" ? 4 : 2;
		for (let i = 0; i < ventCount; i++) {
			const vent = MeshBuilder.CreateBox(
				`${id}_vent_${i}`,
				{ width: dims.width / (ventCount + 1), height: 0.02, depth: dims.depth * 0.6 },
				scene
			);
			vent.position = new Vector3(
				posX + Math.cos(rotation) * ((i - (ventCount - 1) / 2) * (dims.width / ventCount)),
				posY + dims.height + 0.01,
				posZ - Math.sin(rotation) * ((i - (ventCount - 1) / 2) * (dims.width / ventCount))
			);
			vent.rotation.y = rotation;
			vent.material = grillMat;
			meshes.push(vent);
		}

		// Control panel / brand badge
		const badgeMat = new PBRMaterial(`ac_badge_${id}`, scene);
		badgeMat.albedoColor = new Color3(0.1, 0.2, 0.4);
		badgeMat.metallic = 0.8;
		badgeMat.roughness = 0.3;

		const badge = MeshBuilder.CreateBox(
			`${id}_badge`,
			{ width: dims.width * 0.25, height: 0.04, depth: 0.01 },
			scene
		);
		badge.position = new Vector3(
			posX + Math.sin(rotation) * (dims.depth / 2 + 0.015),
			posY + dims.height * 0.15,
			posZ + Math.cos(rotation) * (dims.depth / 2 + 0.015)
		);
		badge.rotation.y = rotation;
		badge.material = badgeMat;
		meshes.push(badge);

		// Refrigerant pipes
		const pipeMat = new PBRMaterial(`ac_pipe_${id}`, scene);
		pipeMat.albedoColor = new Color3(0.72, 0.45, 0.2);
		pipeMat.metallic = 0.7;
		pipeMat.roughness = 0.4;

		const pipeSpacing = 0.06;
		for (let i = 0; i < 2; i++) {
			const pipe = MeshBuilder.CreateCylinder(
				`${id}_pipe_${i}`,
				{ height: wallMounted ? 0.5 : 0.3, diameter: 0.02 + i * 0.01 },
				scene
			);
			pipe.position = new Vector3(
				posX - Math.sin(rotation) * (dims.depth / 2 - 0.05) + Math.cos(rotation) * (dims.width / 2 - 0.1 + i * pipeSpacing),
				posY + dims.height + (wallMounted ? 0.25 : 0.15),
				posZ - Math.cos(rotation) * (dims.depth / 2 - 0.05) - Math.sin(rotation) * (dims.width / 2 - 0.1 + i * pipeSpacing)
			);
			pipe.material = pipeMat;
			meshes.push(pipe);
		}

		// Wall mounting bracket (if wall mounted)
		if (wallMounted) {
			const bracketMat = new PBRMaterial(`ac_bracket_${id}`, scene);
			bracketMat.albedoColor = new Color3(0.35, 0.35, 0.37);
			bracketMat.metallic = 0.8;
			bracketMat.roughness = 0.5;

			for (const side of [-1, 1]) {
				const bracket = MeshBuilder.CreateBox(
					`${id}_bracket_${side}`,
					{ width: 0.05, height: dims.height * 0.8, depth: dims.depth + 0.1 },
					scene
				);
				bracket.position = new Vector3(
					posX + Math.cos(rotation) * (side * (dims.width / 2 + 0.025)),
					posY + dims.height * 0.4,
					posZ - Math.sin(rotation) * (side * (dims.width / 2 + 0.025))
				);
				bracket.rotation.y = rotation;
				bracket.material = bracketMat;
				meshes.push(bracket);
			}
		}

		// Feet (if not wall mounted)
		if (!wallMounted) {
			const footMat = new PBRMaterial(`ac_foot_${id}`, scene);
			footMat.albedoColor = new Color3(0.2, 0.2, 0.22);
			footMat.metallic = 0.6;
			footMat.roughness = 0.7;

			for (const cx of [-1, 1]) {
				for (const cz of [-1, 1]) {
					const foot = MeshBuilder.CreateBox(
						`${id}_foot_${cx}_${cz}`,
						{ width: 0.1, height: 0.05, depth: 0.1 },
						scene
					);
					foot.position = new Vector3(
						posX + Math.cos(rotation) * (cx * (dims.width / 2 - 0.08)) + Math.sin(rotation) * (cz * (dims.depth / 2 - 0.05)),
						posY + 0.025,
						posZ - Math.sin(rotation) * (cx * (dims.width / 2 - 0.08)) + Math.cos(rotation) * (cz * (dims.depth / 2 - 0.05))
					);
					foot.rotation.y = rotation;
					foot.material = footMat;
					meshes.push(foot);
				}
			}
		}

		// Age/rust effects
		if (age > 0.4 && rng) {
			const rustMat = new PBRMaterial(`ac_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.5, 0.35, 0.2);
			rustMat.metallic = 0.3;
			rustMat.roughness = 0.9;
			rustMat.alpha = age * 0.6;

			// Rust streaks from top
			const streakCount = Math.floor(age * 3) + 1;
			for (let i = 0; i < streakCount; i++) {
				const streak = MeshBuilder.CreateBox(
					`${id}_rust_${i}`,
					{
						width: 0.03 + rng.next() * 0.04,
						height: dims.height * (0.2 + rng.next() * 0.3),
						depth: 0.01,
					},
					scene
				);
				streak.position = new Vector3(
					posX + Math.sin(rotation) * (dims.depth / 2 + 0.02) + Math.cos(rotation) * ((rng.next() - 0.5) * dims.width * 0.7),
					posY + dims.height - streak.scaling.y * dims.height * 0.3,
					posZ + Math.cos(rotation) * (dims.depth / 2 + 0.02) - Math.sin(rotation) * ((rng.next() - 0.5) * dims.width * 0.7)
				);
				streak.rotation.y = rotation;
				streak.material = rustMat;
				meshes.push(streak);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			bodyMat.dispose();
			grillMat.dispose();
			fanMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, size, running, age, rotation, wallMounted, seed]);

	return null;
}
