/**
 * BollardPost - Traffic control bollard component
 *
 * Various bollard styles for traffic control in the flooded neo-tokyo city.
 */

import {
	type AbstractMesh,
	Color3,
	MeshBuilder,
	PBRMaterial,
	PointLight,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../../world/blocks/Block";

export type BollardType =
	| "fixed"
	| "removable"
	| "flexible"
	| "decorative"
	| "lit";
export type BollardCondition = "new" | "weathered" | "damaged" | "vandalized";

export interface BollardPostProps {
	id: string;
	position: Vector3;
	/** Bollard type/style */
	type?: BollardType;
	/** Height of bollard */
	height?: number;
	/** Diameter of bollard */
	diameter?: number;
	/** Whether the bollard has a light */
	hasLight?: boolean;
	/** Light color (for lit type) */
	lightColor?: Color3;
	/** Whether light is on */
	lightOn?: boolean;
	/** Visual condition */
	condition?: BollardCondition;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function BollardPost({
	id,
	position,
	type = "fixed",
	height = 0.9,
	diameter = 0.15,
	hasLight = false,
	lightColor,
	lightOn = true,
	condition = "weathered",
	rotation = 0,
	seed,
}: BollardPostProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);
	const lightRef = useRef<PointLight | null>(null);

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
					? 0.85
					: condition === "damaged"
						? 0.7
						: 0.55;

		// Base materials
		const bodyMat = new PBRMaterial(`bollard_body_${id}`, scene);
		const accentMat = new PBRMaterial(`bollard_accent_${id}`, scene);

		// Effective light for lit bollards
		const effectiveLightColor = lightColor ?? new Color3(1, 0.9, 0.7);
		const effectiveHasLight = type === "lit" || hasLight;

		if (type === "fixed") {
			// Classic fixed steel bollard
			bodyMat.albedoColor = new Color3(0.35, 0.35, 0.38).scale(conditionFactor);
			bodyMat.metallic = 0.85;
			bodyMat.roughness = 0.45;

			// Main body
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height, diameterTop: diameter * 0.9, diameterBottom: diameter },
				scene,
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Domed top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: diameter * 0.9, slice: 0.5 },
				scene,
			);
			dome.position = new Vector3(posX, posY + height, posZ);
			dome.material = bodyMat;
			meshes.push(dome);

			// Base ring
			const baseRing = MeshBuilder.CreateTorus(
				`${id}_baseRing`,
				{ diameter: diameter * 1.3, thickness: 0.02 },
				scene,
			);
			baseRing.position = new Vector3(posX, posY + 0.02, posZ);
			baseRing.rotation.x = Math.PI / 2;
			baseRing.material = bodyMat;
			meshes.push(baseRing);

			// Reflective band
			accentMat.albedoColor = new Color3(0.9, 0.9, 0.1).scale(conditionFactor);
			accentMat.metallic = 0.3;
			accentMat.roughness = 0.3;
			if (conditionFactor > 0.7) {
				accentMat.emissiveColor = new Color3(0.9, 0.9, 0.1).scale(0.15);
			}

			const band = MeshBuilder.CreateCylinder(
				`${id}_band`,
				{ height: 0.05, diameter: diameter * 0.95 },
				scene,
			);
			band.position = new Vector3(posX, posY + height * 0.7, posZ);
			band.material = accentMat;
			meshes.push(band);
		} else if (type === "removable") {
			// Removable bollard with socket
			bodyMat.albedoColor = new Color3(0.4, 0.4, 0.42).scale(conditionFactor);
			bodyMat.metallic = 0.8;
			bodyMat.roughness = 0.5;

			// Socket base
			const socketMat = new PBRMaterial(`bollard_socket_${id}`, scene);
			socketMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(conditionFactor);
			socketMat.metallic = 0.85;
			socketMat.roughness = 0.4;

			const socket = MeshBuilder.CreateCylinder(
				`${id}_socket`,
				{
					height: 0.05,
					diameterTop: diameter * 1.4,
					diameterBottom: diameter * 1.5,
				},
				scene,
			);
			socket.position = new Vector3(posX, posY + 0.025, posZ);
			socket.material = socketMat;
			meshes.push(socket);

			// Socket hole
			const socketHole = MeshBuilder.CreateCylinder(
				`${id}_socketHole`,
				{ height: 0.06, diameter: diameter * 0.85 },
				scene,
			);
			socketHole.position = new Vector3(posX, posY + 0.03, posZ);
			const holeMat = new PBRMaterial(`bollard_hole_${id}`, scene);
			holeMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			holeMat.metallic = 0.9;
			holeMat.roughness = 0.3;
			socketHole.material = holeMat;
			meshes.push(socketHole);

			// Main body (slightly narrower to fit socket)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: height - 0.1, diameter: diameter * 0.95 },
				scene,
			);
			body.position = new Vector3(posX, posY + 0.05 + (height - 0.1) / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Top cap with lock ring
			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{
					height: 0.04,
					diameterTop: diameter * 0.7,
					diameterBottom: diameter * 0.95,
				},
				scene,
			);
			cap.position = new Vector3(posX, posY + height - 0.03, posZ);
			cap.material = bodyMat;
			meshes.push(cap);

			// Lock mechanism
			const lock = MeshBuilder.CreateCylinder(
				`${id}_lock`,
				{ height: 0.02, diameter: 0.03 },
				scene,
			);
			lock.position = new Vector3(posX, posY + height - 0.01, posZ);
			lock.material = socketMat;
			meshes.push(lock);

			// Handle loops
			for (const side of [-1, 1]) {
				const loop = MeshBuilder.CreateTorus(
					`${id}_loop_${side}`,
					{ diameter: 0.05, thickness: 0.008 },
					scene,
				);
				loop.position = new Vector3(
					posX + Math.cos(rotation) * ((side * diameter) / 2),
					posY + height * 0.6,
					posZ - Math.sin(rotation) * ((side * diameter) / 2),
				);
				loop.rotation.y = rotation;
				loop.material = bodyMat;
				meshes.push(loop);
			}
		} else if (type === "flexible") {
			// Flexible/rebounding bollard
			bodyMat.albedoColor = new Color3(0.9, 0.5, 0.1).scale(conditionFactor); // Orange
			bodyMat.metallic = 0.1;
			bodyMat.roughness = 0.7;

			// Flexible body (tapered cylinder)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height, diameterTop: diameter * 0.7, diameterBottom: diameter },
				scene,
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Reflective stripes
			accentMat.albedoColor = new Color3(0.95, 0.95, 0.95).scale(
				conditionFactor,
			);
			accentMat.metallic = 0.2;
			accentMat.roughness = 0.3;
			accentMat.emissiveColor = new Color3(0.95, 0.95, 0.95).scale(0.1);

			const stripeCount = 3;
			for (let i = 0; i < stripeCount; i++) {
				const stripeY = 0.15 + i * (height * 0.25);
				const stripeRadius = (diameter * (1 - (stripeY / height) * 0.3)) / 2;

				const stripe = MeshBuilder.CreateCylinder(
					`${id}_stripe_${i}`,
					{ height: 0.04, diameter: stripeRadius * 2 + 0.01 },
					scene,
				);
				stripe.position = new Vector3(posX, posY + stripeY, posZ);
				stripe.material = accentMat;
				meshes.push(stripe);
			}

			// Base plate
			const baseMat = new PBRMaterial(`bollard_base_${id}`, scene);
			baseMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(conditionFactor);
			baseMat.metallic = 0.8;
			baseMat.roughness = 0.4;

			const basePlate = MeshBuilder.CreateCylinder(
				`${id}_basePlate`,
				{ height: 0.02, diameter: diameter * 1.5 },
				scene,
			);
			basePlate.position = new Vector3(posX, posY + 0.01, posZ);
			basePlate.material = baseMat;
			meshes.push(basePlate);

			// Mounting bolts
			for (let i = 0; i < 4; i++) {
				const angle = (i * Math.PI) / 2 + Math.PI / 4;
				const bolt = MeshBuilder.CreateCylinder(
					`${id}_bolt_${i}`,
					{ height: 0.015, diameter: 0.015 },
					scene,
				);
				bolt.position = new Vector3(
					posX + Math.cos(angle) * (diameter * 0.6),
					posY + 0.025,
					posZ + Math.sin(angle) * (diameter * 0.6),
				);
				bolt.material = baseMat;
				meshes.push(bolt);
			}
		} else if (type === "decorative") {
			// Decorative cast iron style bollard
			bodyMat.albedoColor = new Color3(0.15, 0.15, 0.12).scale(conditionFactor); // Dark iron
			bodyMat.metallic = 0.75;
			bodyMat.roughness = 0.6;

			// Ornate base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{
					height: 0.1,
					diameterTop: diameter * 0.9,
					diameterBottom: diameter * 1.3,
					tessellation: 8,
				},
				scene,
			);
			base.position = new Vector3(posX, posY + 0.05, posZ);
			base.rotation.y = rotation;
			base.material = bodyMat;
			meshes.push(base);

			// Lower decorative ring
			const lowerRing = MeshBuilder.CreateTorus(
				`${id}_lowerRing`,
				{ diameter: diameter * 1.1, thickness: 0.025 },
				scene,
			);
			lowerRing.position = new Vector3(posX, posY + 0.15, posZ);
			lowerRing.rotation.x = Math.PI / 2;
			lowerRing.material = bodyMat;
			meshes.push(lowerRing);

			// Main shaft with fluting (simplified)
			const shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: height * 0.6, diameter, tessellation: 12 },
				scene,
			);
			shaft.position = new Vector3(
				posX,
				posY + 0.15 + (height * 0.6) / 2,
				posZ,
			);
			shaft.material = bodyMat;
			meshes.push(shaft);

			// Upper decorative ring
			const upperRing = MeshBuilder.CreateTorus(
				`${id}_upperRing`,
				{ diameter: diameter * 1.05, thickness: 0.02 },
				scene,
			);
			upperRing.position = new Vector3(posX, posY + 0.15 + height * 0.6, posZ);
			upperRing.rotation.x = Math.PI / 2;
			upperRing.material = bodyMat;
			meshes.push(upperRing);

			// Finial (decorative top)
			const finialBase = MeshBuilder.CreateCylinder(
				`${id}_finialBase`,
				{
					height: 0.08,
					diameterTop: diameter * 0.6,
					diameterBottom: diameter * 0.85,
				},
				scene,
			);
			finialBase.position = new Vector3(
				posX,
				posY + 0.15 + height * 0.6 + 0.04,
				posZ,
			);
			finialBase.material = bodyMat;
			meshes.push(finialBase);

			const finialBall = MeshBuilder.CreateSphere(
				`${id}_finialBall`,
				{ diameter: diameter * 0.5 },
				scene,
			);
			finialBall.position = new Vector3(
				posX,
				posY + 0.15 + height * 0.6 + 0.1 + diameter * 0.25,
				posZ,
			);
			finialBall.material = bodyMat;
			meshes.push(finialBall);

			// Chain attachment rings
			for (const side of [-1, 1]) {
				const ring = MeshBuilder.CreateTorus(
					`${id}_chainRing_${side}`,
					{ diameter: 0.04, thickness: 0.006 },
					scene,
				);
				ring.position = new Vector3(
					posX + Math.cos(rotation) * ((side * diameter) / 2),
					posY + height * 0.4,
					posZ - Math.sin(rotation) * ((side * diameter) / 2),
				);
				ring.rotation.y = rotation + Math.PI / 2;
				ring.material = bodyMat;
				meshes.push(ring);
			}
		} else if (type === "lit") {
			// LED-lit bollard
			bodyMat.albedoColor = new Color3(0.4, 0.4, 0.42).scale(conditionFactor);
			bodyMat.metallic = 0.8;
			bodyMat.roughness = 0.35;

			// Main body
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height, diameter },
				scene,
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Light strip/ring
			const lightMat = new PBRMaterial(`bollard_light_${id}`, scene);
			if (lightOn) {
				lightMat.albedoColor = effectiveLightColor;
				lightMat.emissiveColor = effectiveLightColor.scale(0.8);
			} else {
				lightMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			}
			lightMat.metallic = 0.1;
			lightMat.roughness = 0.2;

			// Horizontal light band
			const lightBand = MeshBuilder.CreateCylinder(
				`${id}_lightBand`,
				{ height: 0.06, diameter: diameter * 1.02 },
				scene,
			);
			lightBand.position = new Vector3(posX, posY + height * 0.85, posZ);
			lightBand.material = lightMat;
			meshes.push(lightBand);

			// Top cap with downlight
			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{ height: 0.03, diameterTop: diameter * 0.8, diameterBottom: diameter },
				scene,
			);
			cap.position = new Vector3(posX, posY + height + 0.015, posZ);
			cap.material = bodyMat;
			meshes.push(cap);

			// Downlight lens
			const lens = MeshBuilder.CreateCylinder(
				`${id}_lens`,
				{ height: 0.01, diameter: diameter * 0.5 },
				scene,
			);
			lens.position = new Vector3(posX, posY + height - 0.01, posZ);
			lens.material = lightMat;
			meshes.push(lens);

			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.04, diameterTop: diameter, diameterBottom: diameter * 1.2 },
				scene,
			);
			base.position = new Vector3(posX, posY + 0.02, posZ);
			base.material = bodyMat;
			meshes.push(base);

			// Create actual light
			if (lightOn && effectiveHasLight) {
				const light = new PointLight(
					`${id}_pointLight`,
					new Vector3(posX, posY + height * 0.85, posZ),
					scene,
				);
				light.diffuse = effectiveLightColor;
				light.intensity = 0.3;
				light.range = 3;
				lightRef.current = light;
			}
		}

		// Add light for non-lit types if hasLight is true
		if (effectiveHasLight && type !== "lit" && lightOn) {
			const lightMat = new PBRMaterial(`bollard_lightAdd_${id}`, scene);
			lightMat.albedoColor = effectiveLightColor;
			lightMat.emissiveColor = effectiveLightColor.scale(0.6);
			lightMat.metallic = 0.1;
			lightMat.roughness = 0.2;

			const lightBulb = MeshBuilder.CreateSphere(
				`${id}_lightBulb`,
				{ diameter: 0.04 },
				scene,
			);
			lightBulb.position = new Vector3(posX, posY + height + 0.03, posZ);
			lightBulb.material = lightMat;
			meshes.push(lightBulb);

			const light = new PointLight(
				`${id}_pointLight`,
				new Vector3(posX, posY + height + 0.05, posZ),
				scene,
			);
			light.diffuse = effectiveLightColor;
			light.intensity = 0.2;
			light.range = 2;
			lightRef.current = light;
		}

		// Damage effects
		if (condition === "damaged" && rng) {
			// Tilt the bollard slightly
			const tiltAngle = (rng.next() - 0.5) * 0.15;
			for (const mesh of meshes) {
				mesh.rotation.z += tiltAngle;
			}
		}

		if (condition === "vandalized" && rng) {
			// Add graffiti/paint splotch
			const graffitiMat = new PBRMaterial(`bollard_graffiti_${id}`, scene);
			graffitiMat.albedoColor = new Color3(
				0.2 + rng.next() * 0.8,
				rng.next() * 0.8,
				rng.next() * 0.8,
			);
			graffitiMat.metallic = 0;
			graffitiMat.roughness = 0.8;

			const graffiti = MeshBuilder.CreateDisc(
				`${id}_graffiti`,
				{ radius: 0.05 + rng.next() * 0.05 },
				scene,
			);
			graffiti.position = new Vector3(
				posX + Math.cos(rotation) * (diameter / 2 + 0.01),
				posY + height * (0.3 + rng.next() * 0.4),
				posZ - Math.sin(rotation) * (diameter / 2 + 0.01),
			);
			graffiti.rotation.y = rotation + Math.PI / 2;
			graffiti.material = graffitiMat;
			meshes.push(graffiti);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			if (lightRef.current) {
				lightRef.current.dispose();
				lightRef.current = null;
			}
			bodyMat.dispose();
			accentMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		height,
		diameter,
		hasLight,
		lightColor,
		lightOn,
		condition,
		rotation,
		seed,
	]);

	return null;
}
