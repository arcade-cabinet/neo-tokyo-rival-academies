/**
 * SteamVent - Atmospheric steam/smoke vent component
 *
 * Adds atmosphere and movement to urban environments.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	ParticleSystem,
	Texture,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../blocks/Block";

export type VentType = "grate" | "pipe" | "chimney" | "crack";
export type VentContent = "steam" | "smoke" | "gas" | "exhaust";

export interface SteamVentProps {
	id: string;
	position: Vector3;
	/** Vent type */
	type?: VentType;
	/** What's coming out */
	content?: VentContent;
	/** Emission rate 0-1 */
	intensity?: number;
	/** Is currently active */
	active?: boolean;
	/** Direction of emission (radians, 0 = up) */
	direction?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function SteamVent({
	id,
	position,
	type = "grate",
	content = "steam",
	intensity = 0.5,
	active = true,
	direction = 0,
	seed,
}: SteamVentProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);
	const particleRef = useRef<ParticleSystem | null>(null);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Vent structure material
		const ventMat = new PBRMaterial(`vent_mat_${id}`, scene);
		ventMat.albedoColor = new Color3(0.3, 0.3, 0.32);
		ventMat.metallic = 0.8;
		ventMat.roughness = 0.5;

		// Grate/opening material
		const grateMat = new PBRMaterial(`grate_mat_${id}`, scene);
		grateMat.albedoColor = new Color3(0.15, 0.15, 0.17);
		grateMat.metallic = 0.7;
		grateMat.roughness = 0.6;

		if (type === "grate") {
			// Street-level grate
			const grateSize = 0.6;
			const frame = MeshBuilder.CreateBox(
				`${id}_frame`,
				{ width: grateSize + 0.1, height: 0.05, depth: grateSize + 0.1 },
				scene
			);
			frame.position = new Vector3(posX, posY + 0.025, posZ);
			frame.material = ventMat;
			meshes.push(frame);

			// Grate bars
			const barCount = 8;
			for (let i = 0; i < barCount; i++) {
				const bar = MeshBuilder.CreateBox(
					`${id}_bar_${i}`,
					{ width: grateSize, height: 0.04, depth: 0.02 },
					scene
				);
				bar.position = new Vector3(
					posX,
					posY + 0.05,
					posZ + (i - (barCount - 1) / 2) * (grateSize / barCount)
				);
				bar.material = grateMat;
				meshes.push(bar);
			}
		} else if (type === "pipe") {
			// Exposed pipe vent
			const pipeHeight = 0.5 + (rng ? rng.next() * 0.3 : 0);
			const pipeDiameter = 0.15;

			const pipe = MeshBuilder.CreateCylinder(
				`${id}_pipe`,
				{ height: pipeHeight, diameter: pipeDiameter },
				scene
			);
			pipe.position = new Vector3(posX, posY + pipeHeight / 2, posZ);
			pipe.rotation.x = direction;
			pipe.material = ventMat;
			meshes.push(pipe);

			// Pipe cap with opening
			const cap = MeshBuilder.CreateTorus(
				`${id}_cap`,
				{ diameter: pipeDiameter, thickness: 0.02 },
				scene
			);
			cap.position = new Vector3(posX, posY + pipeHeight, posZ);
			cap.rotation.x = Math.PI / 2 + direction;
			cap.material = ventMat;
			meshes.push(cap);
		} else if (type === "chimney") {
			// Industrial chimney
			const chimneyHeight = 1.5 + (rng ? rng.next() * 0.5 : 0);
			const chimneyDiameter = 0.4;

			const chimney = MeshBuilder.CreateCylinder(
				`${id}_chimney`,
				{
					height: chimneyHeight,
					diameterTop: chimneyDiameter * 0.9,
					diameterBottom: chimneyDiameter,
				},
				scene
			);
			chimney.position = new Vector3(posX, posY + chimneyHeight / 2, posZ);
			chimney.material = ventMat;
			meshes.push(chimney);

			// Chimney cap
			const capMat = new PBRMaterial(`chimney_cap_${id}`, scene);
			capMat.albedoColor = new Color3(0.25, 0.25, 0.27);
			capMat.metallic = 0.75;
			capMat.roughness = 0.5;

			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{ height: 0.1, diameterTop: chimneyDiameter * 1.2, diameterBottom: chimneyDiameter * 0.9 },
				scene
			);
			cap.position = new Vector3(posX, posY + chimneyHeight + 0.05, posZ);
			cap.material = capMat;
			meshes.push(cap);

			// Weather hood
			const hood = MeshBuilder.CreateCylinder(
				`${id}_hood`,
				{ height: 0.15, diameterTop: 0, diameterBottom: chimneyDiameter * 1.4 },
				scene
			);
			hood.position = new Vector3(posX, posY + chimneyHeight + 0.2, posZ);
			hood.material = capMat;
			meshes.push(hood);
		} else if (type === "crack") {
			// Ground crack vent
			const crackLength = 0.8 + (rng ? rng.next() * 0.4 : 0);
			const crack = MeshBuilder.CreateBox(
				`${id}_crack`,
				{ width: crackLength, height: 0.02, depth: 0.08 + (rng ? rng.next() * 0.05 : 0) },
				scene
			);
			crack.position = new Vector3(posX, posY + 0.01, posZ);
			crack.rotation.y = rng ? rng.next() * Math.PI : 0;
			crack.material = grateMat;
			meshes.push(crack);
		}

		// Particle system for steam/smoke
		if (active) {
			const particles = new ParticleSystem(`${id}_particles`, 100 * intensity, scene);

			// Create emitter position
			let emitterY = posY;
			if (type === "pipe") {
				emitterY += 0.5 + (rng ? rng.next() * 0.3 : 0);
			} else if (type === "chimney") {
				emitterY += 1.5 + (rng ? rng.next() * 0.5 : 0);
			} else if (type === "grate") {
				emitterY += 0.05;
			}

			particles.emitter = new Vector3(posX, emitterY, posZ);

			// Particle appearance based on content
			if (content === "steam") {
				particles.color1 = new Color3(0.9, 0.9, 0.95).toColor4(0.5);
				particles.color2 = new Color3(0.8, 0.8, 0.85).toColor4(0.3);
				particles.colorDead = new Color3(1, 1, 1).toColor4(0);
			} else if (content === "smoke") {
				particles.color1 = new Color3(0.3, 0.3, 0.35).toColor4(0.6);
				particles.color2 = new Color3(0.2, 0.2, 0.22).toColor4(0.4);
				particles.colorDead = new Color3(0.1, 0.1, 0.12).toColor4(0);
			} else if (content === "gas") {
				particles.color1 = new Color3(0.7, 0.9, 0.7).toColor4(0.4);
				particles.color2 = new Color3(0.5, 0.8, 0.5).toColor4(0.2);
				particles.colorDead = new Color3(0.3, 0.5, 0.3).toColor4(0);
			} else {
				// Exhaust
				particles.color1 = new Color3(0.4, 0.35, 0.3).toColor4(0.5);
				particles.color2 = new Color3(0.3, 0.25, 0.2).toColor4(0.3);
				particles.colorDead = new Color3(0.2, 0.15, 0.1).toColor4(0);
			}

			// Particle behavior
			particles.minSize = 0.1;
			particles.maxSize = 0.4 * (1 + intensity);
			particles.minLifeTime = 1;
			particles.maxLifeTime = 3;
			particles.emitRate = 20 * intensity;

			// Direction (mostly up with some spread)
			particles.direction1 = new Vector3(-0.3, 1, -0.3);
			particles.direction2 = new Vector3(0.3, 1, 0.3);

			// Apply directional rotation
			if (direction !== 0) {
				const dirX = Math.sin(direction);
				const dirY = Math.cos(direction);
				particles.direction1 = new Vector3(-0.2 + dirX, dirY, -0.2);
				particles.direction2 = new Vector3(0.2 + dirX, dirY, 0.2);
			}

			particles.minEmitPower = 0.5;
			particles.maxEmitPower = 1.5;
			particles.updateSpeed = 0.02;

			// Gravity (slight upward for hot gases)
			particles.gravity = new Vector3(0, content === "smoke" ? 0.1 : 0.3, 0);

			// Emit box
			if (type === "grate") {
				particles.minEmitBox = new Vector3(-0.25, 0, -0.25);
				particles.maxEmitBox = new Vector3(0.25, 0.05, 0.25);
			} else if (type === "crack") {
				particles.minEmitBox = new Vector3(-0.3, 0, -0.03);
				particles.maxEmitBox = new Vector3(0.3, 0.02, 0.03);
			} else {
				particles.minEmitBox = new Vector3(-0.05, 0, -0.05);
				particles.maxEmitBox = new Vector3(0.05, 0.02, 0.05);
			}

			// No texture - use default particle
			particles.blendMode = ParticleSystem.BLENDMODE_STANDARD;

			particles.start();
			particleRef.current = particles;
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			if (particleRef.current) {
				particleRef.current.dispose();
				particleRef.current = null;
			}
			ventMat.dispose();
			grateMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, content, intensity, active, direction, seed]);

	return null;
}
