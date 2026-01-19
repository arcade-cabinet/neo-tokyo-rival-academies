/**
 * Bicycle - Parked or abandoned bicycles
 *
 * Bicycles as urban clutter and environmental detail.
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

export type BicycleType =
	| "city"
	| "mountain"
	| "racing"
	| "mamachari"
	| "folding"
	| "vintage";
export type BicycleState = "parked" | "fallen" | "locked" | "abandoned";

export interface BicycleProps {
	id: string;
	position: Vector3;
	/** Bicycle type */
	type?: BicycleType;
	/** Bicycle state */
	state?: BicycleState;
	/** Has basket */
	hasBasket?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Bicycle({
	id,
	position,
	type = "city",
	state = "parked",
	hasBasket = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: BicycleProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = condition;

		// Materials
		const frameMat = new PBRMaterial(`bicycle_frame_${id}`, scene);
		const wheelMat = new PBRMaterial(`bicycle_wheel_${id}`, scene);
		const tireMat = new PBRMaterial(`bicycle_tire_${id}`, scene);
		const seatMat = new PBRMaterial(`bicycle_seat_${id}`, scene);

		// Frame color based on type
		switch (type) {
			case "city":
				frameMat.albedoColor = new Color3(0.2, 0.35, 0.5).scale(
					conditionFactor,
				);
				break;
			case "mountain":
				frameMat.albedoColor = new Color3(0.15, 0.15, 0.18).scale(
					conditionFactor,
				);
				break;
			case "racing":
				frameMat.albedoColor = new Color3(0.8, 0.1, 0.1).scale(conditionFactor);
				break;
			case "mamachari":
				frameMat.albedoColor = new Color3(0.5, 0.45, 0.35).scale(
					conditionFactor,
				);
				break;
			case "folding":
				frameMat.albedoColor = new Color3(0.85, 0.5, 0.1).scale(
					conditionFactor,
				);
				break;
			case "vintage":
				frameMat.albedoColor = new Color3(0.15, 0.3, 0.25).scale(
					conditionFactor,
				);
				break;
		}
		frameMat.metallic = 0.7;
		frameMat.roughness = 0.4;

		wheelMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(conditionFactor);
		wheelMat.metallic = 0.85;
		wheelMat.roughness = 0.35;

		tireMat.albedoColor = new Color3(0.1, 0.1, 0.12);
		tireMat.metallic = 0;
		tireMat.roughness = 0.9;

		seatMat.albedoColor = new Color3(0.15, 0.15, 0.18);
		seatMat.metallic = 0.1;
		seatMat.roughness = 0.7;

		// Calculate fallen rotation
		let tiltX = 0;
		let baseY = posY;
		if (state === "fallen") {
			tiltX = Math.PI / 2 - 0.3;
			baseY = posY + 0.15;
		}

		// Wheel size based on type
		const wheelRadius =
			type === "folding" ? 0.2 : type === "racing" ? 0.35 : 0.3;
		const wheelbase = type === "folding" ? 0.6 : type === "racing" ? 1.0 : 0.85;

		// Front wheel
		const frontWheel = MeshBuilder.CreateTorus(
			`${id}_frontWheel`,
			{ diameter: wheelRadius * 2, thickness: 0.03, tessellation: 24 },
			scene,
		);
		frontWheel.position = new Vector3(
			posX + Math.cos(rotation) * (wheelbase / 2),
			baseY + wheelRadius,
			posZ - Math.sin(rotation) * (wheelbase / 2),
		);
		frontWheel.rotation.y = rotation;
		frontWheel.rotation.x = Math.PI / 2 + tiltX;
		frontWheel.material = tireMat;
		meshes.push(frontWheel);

		// Front hub
		const frontHub = MeshBuilder.CreateCylinder(
			`${id}_frontHub`,
			{ height: 0.05, diameter: 0.08 },
			scene,
		);
		frontHub.position = frontWheel.position.clone();
		frontHub.rotation.z = Math.PI / 2;
		frontHub.rotation.y = rotation;
		frontHub.material = wheelMat;
		meshes.push(frontHub);

		// Rear wheel
		const rearWheel = MeshBuilder.CreateTorus(
			`${id}_rearWheel`,
			{ diameter: wheelRadius * 2, thickness: 0.03, tessellation: 24 },
			scene,
		);
		rearWheel.position = new Vector3(
			posX - Math.cos(rotation) * (wheelbase / 2),
			baseY + wheelRadius,
			posZ + Math.sin(rotation) * (wheelbase / 2),
		);
		rearWheel.rotation.y = rotation;
		rearWheel.rotation.x = Math.PI / 2 + tiltX;
		rearWheel.material = tireMat;
		meshes.push(rearWheel);

		// Rear hub
		const rearHub = MeshBuilder.CreateCylinder(
			`${id}_rearHub`,
			{ height: 0.05, diameter: 0.08 },
			scene,
		);
		rearHub.position = rearWheel.position.clone();
		rearHub.rotation.z = Math.PI / 2;
		rearHub.rotation.y = rotation;
		rearHub.material = wheelMat;
		meshes.push(rearHub);

		// Main frame (simplified as connected tubes)
		const frameHeight = type === "racing" ? 0.4 : 0.5;

		// Down tube
		const downTube = MeshBuilder.CreateCylinder(
			`${id}_downTube`,
			{ height: wheelbase * 0.7, diameter: 0.03 },
			scene,
		);
		downTube.position = new Vector3(
			posX,
			baseY + wheelRadius + frameHeight * 0.3,
			posZ,
		);
		downTube.rotation.z = Math.PI / 2 + 0.3 + tiltX;
		downTube.rotation.y = rotation;
		downTube.material = frameMat;
		meshes.push(downTube);

		// Seat tube
		const seatTube = MeshBuilder.CreateCylinder(
			`${id}_seatTube`,
			{ height: frameHeight, diameter: 0.03 },
			scene,
		);
		seatTube.position = new Vector3(
			posX - Math.cos(rotation) * (wheelbase * 0.2),
			baseY + wheelRadius + frameHeight * 0.5,
			posZ + Math.sin(rotation) * (wheelbase * 0.2),
		);
		seatTube.rotation.x = tiltX;
		seatTube.material = frameMat;
		meshes.push(seatTube);

		// Top tube
		const topTube = MeshBuilder.CreateCylinder(
			`${id}_topTube`,
			{ height: wheelbase * 0.5, diameter: 0.025 },
			scene,
		);
		topTube.position = new Vector3(
			posX + Math.cos(rotation) * (wheelbase * 0.1),
			baseY + wheelRadius + frameHeight,
			posZ - Math.sin(rotation) * (wheelbase * 0.1),
		);
		topTube.rotation.z = Math.PI / 2;
		topTube.rotation.y = rotation;
		topTube.rotation.x = tiltX;
		topTube.material = frameMat;
		meshes.push(topTube);

		// Fork
		const fork = MeshBuilder.CreateCylinder(
			`${id}_fork`,
			{ height: wheelRadius + 0.1, diameter: 0.025 },
			scene,
		);
		fork.position = new Vector3(
			posX + Math.cos(rotation) * (wheelbase / 2),
			baseY + wheelRadius * 0.6,
			posZ - Math.sin(rotation) * (wheelbase / 2),
		);
		fork.rotation.x = tiltX;
		fork.material = frameMat;
		meshes.push(fork);

		// Handlebars
		const handlebarWidth = type === "racing" ? 0.35 : 0.5;
		const handlebar = MeshBuilder.CreateCylinder(
			`${id}_handlebar`,
			{ height: handlebarWidth, diameter: 0.02 },
			scene,
		);
		handlebar.position = new Vector3(
			posX + Math.cos(rotation) * (wheelbase / 2),
			baseY + wheelRadius + frameHeight + 0.1,
			posZ - Math.sin(rotation) * (wheelbase / 2),
		);
		handlebar.rotation.z = Math.PI / 2;
		handlebar.rotation.y = rotation;
		handlebar.rotation.x = tiltX;
		handlebar.material = frameMat;
		meshes.push(handlebar);

		// Handlebar grips
		const gripMat = new PBRMaterial(`bicycle_grip_${id}`, scene);
		gripMat.albedoColor = new Color3(0.15, 0.15, 0.15);
		gripMat.metallic = 0;
		gripMat.roughness = 0.8;

		for (const side of [-1, 1]) {
			const grip = MeshBuilder.CreateCylinder(
				`${id}_grip_${side}`,
				{ height: 0.1, diameter: 0.03 },
				scene,
			);
			grip.position = new Vector3(
				posX +
					Math.cos(rotation) * (wheelbase / 2) +
					Math.sin(rotation) * ((side * handlebarWidth) / 2),
				baseY + wheelRadius + frameHeight + 0.1,
				posZ -
					Math.sin(rotation) * (wheelbase / 2) +
					Math.cos(rotation) * ((side * handlebarWidth) / 2),
			);
			grip.rotation.z = Math.PI / 2;
			grip.rotation.y = rotation;
			grip.material = gripMat;
			meshes.push(grip);
		}

		// Seat
		const seat = MeshBuilder.CreateBox(
			`${id}_seat`,
			{ width: 0.12, height: 0.04, depth: 0.25 },
			scene,
		);
		seat.position = new Vector3(
			posX - Math.cos(rotation) * (wheelbase * 0.25),
			baseY + wheelRadius + frameHeight + 0.15,
			posZ + Math.sin(rotation) * (wheelbase * 0.25),
		);
		seat.rotation.y = rotation;
		seat.rotation.x = tiltX;
		seat.material = seatMat;
		meshes.push(seat);

		// Pedals and crank
		const crankMat = new PBRMaterial(`bicycle_crank_${id}`, scene);
		crankMat.albedoColor = new Color3(0.5, 0.52, 0.55);
		crankMat.metallic = 0.8;
		crankMat.roughness = 0.4;

		const crankCenter = MeshBuilder.CreateCylinder(
			`${id}_crank`,
			{ height: 0.08, diameter: 0.1 },
			scene,
		);
		crankCenter.position = new Vector3(
			posX - Math.cos(rotation) * (wheelbase * 0.15),
			baseY + wheelRadius * 0.7,
			posZ + Math.sin(rotation) * (wheelbase * 0.15),
		);
		crankCenter.rotation.z = Math.PI / 2;
		crankCenter.rotation.y = rotation;
		crankCenter.material = crankMat;
		meshes.push(crankCenter);

		// Basket (if mamachari or has basket)
		if (hasBasket || type === "mamachari") {
			const basketMat = new PBRMaterial(`bicycle_basket_${id}`, scene);
			basketMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(
				conditionFactor,
			);
			basketMat.metallic = 0.6;
			basketMat.roughness = 0.5;

			const basket = MeshBuilder.CreateBox(
				`${id}_basket`,
				{ width: 0.3, height: 0.2, depth: 0.25 },
				scene,
			);
			basket.position = new Vector3(
				posX + Math.cos(rotation) * (wheelbase / 2 + 0.1),
				baseY + wheelRadius + frameHeight - 0.1,
				posZ - Math.sin(rotation) * (wheelbase / 2 + 0.1),
			);
			basket.rotation.y = rotation;
			basket.rotation.x = tiltX;
			basket.material = basketMat;
			meshes.push(basket);
		}

		// Lock (if locked state)
		if (state === "locked") {
			const lockMat = new PBRMaterial(`bicycle_lock_${id}`, scene);
			lockMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			lockMat.metallic = 0.3;
			lockMat.roughness = 0.6;

			const lock = MeshBuilder.CreateCylinder(
				`${id}_lock`,
				{ height: 0.8, diameter: 0.015 },
				scene,
			);
			lock.position = new Vector3(posX, baseY + wheelRadius, posZ);
			lock.rotation.z = Math.PI / 4;
			lock.material = lockMat;
			meshes.push(lock);
		}

		// Rust spots for abandoned
		if (state === "abandoned" || condition < 0.5) {
			const rustMat = new PBRMaterial(`bicycle_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.5, 0.25, 0.1);
			rustMat.metallic = 0.4;
			rustMat.roughness = 0.9;

			const rustCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let r = 0; r < rustCount; r++) {
				const rx = (rng ? rng.next() - 0.5 : 0) * wheelbase;
				const ry = wheelRadius + (rng ? rng.next() : 0.5) * frameHeight;
				const rustSize = 0.03 + (rng ? rng.next() * 0.03 : 0.02);

				const rust = MeshBuilder.CreateSphere(
					`${id}_rust_${r}`,
					{ diameter: rustSize, segments: 6 },
					scene,
				);
				rust.position = new Vector3(
					posX + Math.cos(rotation) * rx,
					baseY + ry,
					posZ - Math.sin(rotation) * rx,
				);
				rust.material = rustMat;
				meshes.push(rust);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			frameMat.dispose();
			wheelMat.dispose();
			tireMat.dispose();
			seatMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		state,
		hasBasket,
		condition,
		rotation,
		seed,
	]);

	return null;
}
