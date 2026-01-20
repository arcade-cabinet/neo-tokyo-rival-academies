/**
 * Elevator - Elevator shafts and machinery component
 *
 * Various elevator types for buildings in the flooded Neo-Tokyo environment.
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

export type ElevatorType = "external" | "penthouse" | "freight" | "service";

export type ElevatorCondition = "pristine" | "worn" | "damaged" | "rusted";

export interface ElevatorProps {
	id: string;
	position: Vector3;
	/** Elevator type */
	type?: ElevatorType;
	/** Rotation (radians) */
	rotation?: number;
	/** Condition of the elevator */
	condition?: ElevatorCondition;
	/** Seed for procedural variation */
	seed?: number;
	/** Height of the elevator shaft */
	height?: number;
	/** Width of the elevator car/shaft */
	width?: number;
	/** Whether it has a motor room on top */
	hasMotorRoom?: boolean;
	/** Current floor position (0-1 normalized) */
	currentFloor?: number;
}

const CONDITION_FACTORS: Record<ElevatorCondition, number> = {
	pristine: 1.0,
	worn: 0.85,
	damaged: 0.7,
	rusted: 0.55,
};

export function Elevator({
	id,
	position,
	type = "external",
	rotation = 0,
	condition = "worn",
	seed,
	height = 10,
	width = 2.5,
	hasMotorRoom = true,
	currentFloor = 0.3,
}: ElevatorProps) {
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
		const ageVariation = rng ? rng.next() * 0.1 : 0.05;

		// Frame/structure material
		const frameMat = new PBRMaterial(`elevator_frame_${id}`, scene);
		frameMat.metallic = 0.85;
		frameMat.roughness = 0.35 + (1 - conditionFactor) * 0.3;
		materials.push(frameMat);

		// Glass material for external elevators
		const glassMat = new PBRMaterial(`elevator_glass_${id}`, scene);
		glassMat.albedoColor = new Color3(0.7, 0.8, 0.9);
		glassMat.metallic = 0.1;
		glassMat.roughness = 0.05;
		glassMat.alpha = 0.4;
		materials.push(glassMat);

		// Car material
		const carMat = new PBRMaterial(`elevator_car_${id}`, scene);
		carMat.metallic = 0.7;
		carMat.roughness = 0.4;
		materials.push(carMat);

		// Machinery material
		const machineryMat = new PBRMaterial(`elevator_machinery_${id}`, scene);
		machineryMat.albedoColor = new Color3(
			0.3 * conditionFactor,
			0.32 * conditionFactor,
			0.35 * conditionFactor,
		);
		machineryMat.metallic = 0.8;
		machineryMat.roughness = 0.5;
		materials.push(machineryMat);

		const depth = width * 0.8;
		const carY = posY + currentFloor * (height - width);

		if (type === "external") {
			// Glass elevator on building exterior
			frameMat.albedoColor = new Color3(
				0.4 * conditionFactor - ageVariation,
				0.42 * conditionFactor - ageVariation,
				0.45 * conditionFactor - ageVariation,
			);

			// Main shaft frame - four corner posts
			const postRadius = 0.08;
			const postPositions = [
				[-width / 2 + postRadius, -depth / 2 + postRadius],
				[width / 2 - postRadius, -depth / 2 + postRadius],
				[-width / 2 + postRadius, depth / 2 - postRadius],
				[width / 2 - postRadius, depth / 2 - postRadius],
			];

			for (let i = 0; i < postPositions.length; i++) {
				const [px, pz] = postPositions[i];
				const post = MeshBuilder.CreateCylinder(
					`${id}_post_${i}`,
					{ height: height, diameter: postRadius * 2 },
					scene,
				);
				post.position = new Vector3(
					posX + Math.cos(rotation) * px - Math.sin(rotation) * pz,
					posY + height / 2,
					posZ + Math.sin(rotation) * px + Math.cos(rotation) * pz,
				);
				post.material = frameMat;
				meshes.push(post);
			}

			// Glass panels on sides
			const glassPanelCount = Math.floor(height / 2);
			for (let g = 0; g < glassPanelCount; g++) {
				const panelY = posY + g * 2 + 1;

				// Front glass
				const frontGlass = MeshBuilder.CreateBox(
					`${id}_glass_front_${g}`,
					{ width: width - postRadius * 4, height: 1.8, depth: 0.02 },
					scene,
				);
				frontGlass.position = new Vector3(
					posX + Math.sin(rotation) * (depth / 2),
					panelY,
					posZ + Math.cos(rotation) * (depth / 2),
				);
				frontGlass.rotation.y = rotation;
				frontGlass.material = glassMat;
				meshes.push(frontGlass);

				// Side glasses
				for (const side of [-1, 1]) {
					const sideGlass = MeshBuilder.CreateBox(
						`${id}_glass_side_${g}_${side}`,
						{ width: 0.02, height: 1.8, depth: depth - postRadius * 4 },
						scene,
					);
					sideGlass.position = new Vector3(
						posX + Math.cos(rotation) * ((side * width) / 2),
						panelY,
						posZ - Math.sin(rotation) * ((side * width) / 2),
					);
					sideGlass.rotation.y = rotation;
					sideGlass.material = glassMat;
					meshes.push(sideGlass);
				}
			}

			// Elevator car
			carMat.albedoColor = new Color3(0.25, 0.27, 0.3);

			const car = MeshBuilder.CreateBox(
				`${id}_car`,
				{ width: width - 0.3, height: 2.4, depth: depth - 0.2 },
				scene,
			);
			car.position = new Vector3(posX, carY + 1.2, posZ);
			car.rotation.y = rotation;
			car.material = carMat;
			meshes.push(car);

			// Car roof
			const carRoof = MeshBuilder.CreateBox(
				`${id}_car_roof`,
				{ width: width - 0.25, height: 0.1, depth: depth - 0.15 },
				scene,
			);
			carRoof.position = new Vector3(posX, carY + 2.45, posZ);
			carRoof.rotation.y = rotation;
			carRoof.material = frameMat;
			meshes.push(carRoof);
		} else if (type === "penthouse") {
			// Luxury penthouse elevator
			frameMat.albedoColor = new Color3(
				0.7 * conditionFactor,
				0.65 * conditionFactor,
				0.5 * conditionFactor,
			);
			carMat.albedoColor = new Color3(0.15, 0.12, 0.1);

			// Ornate shaft enclosure
			const shaft = MeshBuilder.CreateBox(
				`${id}_shaft`,
				{ width: width, height: height, depth: depth },
				scene,
			);
			shaft.position = new Vector3(posX, posY + height / 2, posZ);
			shaft.rotation.y = rotation;
			shaft.material = frameMat;
			meshes.push(shaft);

			// Decorative trim lines
			const trimCount = Math.floor(height / 3);
			for (let t = 0; t < trimCount; t++) {
				const trimY = posY + (t + 1) * 3;

				const trim = MeshBuilder.CreateBox(
					`${id}_trim_${t}`,
					{ width: width + 0.05, height: 0.08, depth: depth + 0.05 },
					scene,
				);
				trim.position = new Vector3(posX, trimY, posZ);
				trim.rotation.y = rotation;

				const trimMat = new PBRMaterial(`elevator_trim_${id}_${t}`, scene);
				trimMat.albedoColor = new Color3(0.8, 0.75, 0.55);
				trimMat.metallic = 0.9;
				trimMat.roughness = 0.2;
				materials.push(trimMat);
				trim.material = trimMat;
				meshes.push(trim);
			}

			// Door frame at ground level
			const doorFrame = MeshBuilder.CreateBox(
				`${id}_door_frame`,
				{ width: width * 0.7, height: 2.8, depth: 0.15 },
				scene,
			);
			doorFrame.position = new Vector3(
				posX + Math.sin(rotation) * (depth / 2 + 0.075),
				posY + 1.4,
				posZ + Math.cos(rotation) * (depth / 2 + 0.075),
			);
			doorFrame.rotation.y = rotation;
			doorFrame.material = frameMat;
			meshes.push(doorFrame);
		} else if (type === "freight") {
			// Industrial freight elevator
			frameMat.albedoColor = new Color3(
				0.35 * conditionFactor - ageVariation,
				0.37 * conditionFactor - ageVariation,
				0.4 * conditionFactor - ageVariation,
			);
			carMat.albedoColor = new Color3(0.4, 0.42, 0.45);

			const freightWidth = width * 1.5;
			const freightDepth = depth * 1.3;

			// Heavy duty shaft frame
			const framePosts = [
				[-freightWidth / 2, -freightDepth / 2],
				[freightWidth / 2, -freightDepth / 2],
				[-freightWidth / 2, freightDepth / 2],
				[freightWidth / 2, freightDepth / 2],
			];

			for (let i = 0; i < framePosts.length; i++) {
				const [fx, fz] = framePosts[i];

				// I-beam style posts
				const beam = MeshBuilder.CreateBox(
					`${id}_beam_${i}`,
					{ width: 0.2, height: height, depth: 0.2 },
					scene,
				);
				beam.position = new Vector3(
					posX + Math.cos(rotation) * fx - Math.sin(rotation) * fz,
					posY + height / 2,
					posZ + Math.sin(rotation) * fx + Math.cos(rotation) * fz,
				);
				beam.rotation.y = rotation;
				beam.material = frameMat;
				meshes.push(beam);

				// Flanges
				for (const dir of [-1, 1]) {
					const flange = MeshBuilder.CreateBox(
						`${id}_flange_${i}_${dir}`,
						{ width: 0.3, height: height, depth: 0.05 },
						scene,
					);
					flange.position = new Vector3(
						posX +
							Math.cos(rotation) * fx -
							Math.sin(rotation) * (fz + dir * 0.075),
						posY + height / 2,
						posZ +
							Math.sin(rotation) * fx +
							Math.cos(rotation) * (fz + dir * 0.075),
					);
					flange.rotation.y = rotation;
					flange.material = frameMat;
					meshes.push(flange);
				}
			}

			// Cross bracing
			const braceCount = Math.floor(height / 4);
			for (let b = 0; b < braceCount; b++) {
				const braceY = posY + (b + 0.5) * 4;

				for (const side of [-1, 1]) {
					const brace = MeshBuilder.CreateBox(
						`${id}_brace_${b}_${side}`,
						{ width: freightWidth + 0.2, height: 0.1, depth: 0.1 },
						scene,
					);
					brace.position = new Vector3(
						posX - Math.sin(rotation) * ((side * freightDepth) / 2),
						braceY,
						posZ - Math.cos(rotation) * ((side * freightDepth) / 2),
					);
					brace.rotation.y = rotation;
					brace.material = frameMat;
					meshes.push(brace);
				}
			}

			// Heavy platform car
			const platform = MeshBuilder.CreateBox(
				`${id}_platform`,
				{ width: freightWidth - 0.3, height: 0.15, depth: freightDepth - 0.3 },
				scene,
			);
			platform.position = new Vector3(posX, carY + 0.075, posZ);
			platform.rotation.y = rotation;
			platform.material = carMat;
			meshes.push(platform);

			// Safety rails on platform
			const railHeight = 1.2;
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateBox(
					`${id}_rail_${side}`,
					{ width: 0.05, height: railHeight, depth: freightDepth - 0.4 },
					scene,
				);
				rail.position = new Vector3(
					posX + Math.cos(rotation) * (side * (freightWidth / 2 - 0.2)),
					carY + 0.15 + railHeight / 2,
					posZ - Math.sin(rotation) * (side * (freightWidth / 2 - 0.2)),
				);
				rail.rotation.y = rotation;
				rail.material = frameMat;
				meshes.push(rail);
			}
		} else if (type === "service") {
			// Utilitarian service elevator
			frameMat.albedoColor = new Color3(
				0.5 * conditionFactor,
				0.5 * conditionFactor,
				0.52 * conditionFactor,
			);
			carMat.albedoColor = new Color3(0.45, 0.45, 0.47);

			// Simple enclosed shaft
			const shaftThickness = 0.1;

			// Back wall
			const backWall = MeshBuilder.CreateBox(
				`${id}_back_wall`,
				{ width: width, height: height, depth: shaftThickness },
				scene,
			);
			backWall.position = new Vector3(
				posX - Math.sin(rotation) * (depth / 2),
				posY + height / 2,
				posZ - Math.cos(rotation) * (depth / 2),
			);
			backWall.rotation.y = rotation;
			backWall.material = frameMat;
			meshes.push(backWall);

			// Side walls
			for (const side of [-1, 1]) {
				const sideWall = MeshBuilder.CreateBox(
					`${id}_side_${side}`,
					{ width: shaftThickness, height: height, depth: depth },
					scene,
				);
				sideWall.position = new Vector3(
					posX + Math.cos(rotation) * ((side * width) / 2),
					posY + height / 2,
					posZ - Math.sin(rotation) * ((side * width) / 2),
				);
				sideWall.rotation.y = rotation;
				sideWall.material = frameMat;
				meshes.push(sideWall);
			}

			// Guide rails
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateBox(
					`${id}_guide_${side}`,
					{ width: 0.08, height: height, depth: 0.04 },
					scene,
				);
				rail.position = new Vector3(
					posX +
						Math.cos(rotation) * (side * (width / 2 - 0.15)) -
						Math.sin(rotation) * (depth / 2 - 0.1),
					posY + height / 2,
					posZ -
						Math.sin(rotation) * (side * (width / 2 - 0.15)) -
						Math.cos(rotation) * (depth / 2 - 0.1),
				);
				rail.rotation.y = rotation;
				rail.material = machineryMat;
				meshes.push(rail);
			}

			// Service car
			const car = MeshBuilder.CreateBox(
				`${id}_car`,
				{ width: width - 0.4, height: 2.2, depth: depth - 0.3 },
				scene,
			);
			car.position = new Vector3(posX, carY + 1.1, posZ);
			car.rotation.y = rotation;
			car.material = carMat;
			meshes.push(car);

			// Ventilation grate on car top
			const grate = MeshBuilder.CreateBox(
				`${id}_grate`,
				{ width: width * 0.4, height: 0.05, depth: depth * 0.4 },
				scene,
			);
			grate.position = new Vector3(posX, carY + 2.25, posZ);
			grate.rotation.y = rotation;
			grate.material = machineryMat;
			meshes.push(grate);
		}

		// Motor room (if enabled)
		if (hasMotorRoom) {
			const motorRoomHeight = 1.5;
			const motorRoomWidth = width * 0.8;
			const motorRoomDepth = depth * 0.8;

			const motorRoom = MeshBuilder.CreateBox(
				`${id}_motor_room`,
				{
					width: motorRoomWidth,
					height: motorRoomHeight,
					depth: motorRoomDepth,
				},
				scene,
			);
			motorRoom.position = new Vector3(
				posX,
				posY + height + motorRoomHeight / 2,
				posZ,
			);
			motorRoom.rotation.y = rotation;
			motorRoom.material = machineryMat;
			meshes.push(motorRoom);

			// Motor housing
			const motor = MeshBuilder.CreateCylinder(
				`${id}_motor`,
				{ height: motorRoomWidth * 0.6, diameter: motorRoomHeight * 0.5 },
				scene,
			);
			motor.position = new Vector3(
				posX,
				posY + height + motorRoomHeight * 0.4,
				posZ,
			);
			motor.rotation.z = Math.PI / 2;
			motor.rotation.y = rotation;
			motor.material = machineryMat;
			meshes.push(motor);

			// Sheave wheel
			const sheave = MeshBuilder.CreateCylinder(
				`${id}_sheave`,
				{ height: 0.15, diameter: motorRoomHeight * 0.7 },
				scene,
			);
			sheave.position = new Vector3(
				posX + Math.cos(rotation) * (motorRoomWidth * 0.25),
				posY + height + motorRoomHeight * 0.4,
				posZ - Math.sin(rotation) * (motorRoomWidth * 0.25),
			);
			sheave.rotation.z = Math.PI / 2;
			sheave.rotation.y = rotation;
			sheave.material = frameMat;
			meshes.push(sheave);

			// Ventilation louvers on motor room
			const louverMat = new PBRMaterial(`elevator_louver_${id}`, scene);
			louverMat.albedoColor = new Color3(0.2, 0.2, 0.22);
			louverMat.metallic = 0.6;
			louverMat.roughness = 0.5;
			materials.push(louverMat);

			for (const side of [-1, 1]) {
				const louver = MeshBuilder.CreateBox(
					`${id}_motor_louver_${side}`,
					{
						width: 0.02,
						height: motorRoomHeight * 0.5,
						depth: motorRoomDepth * 0.6,
					},
					scene,
				);
				louver.position = new Vector3(
					posX +
						Math.cos(rotation) * ((side * motorRoomWidth) / 2 + side * 0.01),
					posY + height + motorRoomHeight * 0.5,
					posZ -
						Math.sin(rotation) * ((side * motorRoomWidth) / 2 + side * 0.01),
				);
				louver.rotation.y = rotation;
				louver.material = louverMat;
				meshes.push(louver);
			}
		}

		// Cables
		const cableMat = new PBRMaterial(`elevator_cable_${id}`, scene);
		cableMat.albedoColor = new Color3(0.15, 0.15, 0.17);
		cableMat.metallic = 0.9;
		cableMat.roughness = 0.4;
		materials.push(cableMat);

		const cableCount = type === "freight" ? 4 : 2;
		for (let c = 0; c < cableCount; c++) {
			const cableOffset = (c - (cableCount - 1) / 2) * 0.15;
			const cableHeight = height - carY + posY + (hasMotorRoom ? 1.5 : 0);

			const cable = MeshBuilder.CreateCylinder(
				`${id}_cable_${c}`,
				{ height: cableHeight, diameter: 0.02 },
				scene,
			);
			cable.position = new Vector3(
				posX + Math.cos(rotation) * cableOffset,
				carY + cableHeight / 2,
				posZ - Math.sin(rotation) * cableOffset,
			);
			cable.material = cableMat;
			meshes.push(cable);
		}

		// Counter weight (visible in external type)
		if (type === "external") {
			const counterWeightY = posY + height - currentFloor * (height - width);

			const counterWeight = MeshBuilder.CreateBox(
				`${id}_counterweight`,
				{ width: 0.4, height: 1.5, depth: 0.3 },
				scene,
			);
			counterWeight.position = new Vector3(
				posX - Math.sin(rotation) * (depth / 2 - 0.2),
				counterWeightY,
				posZ - Math.cos(rotation) * (depth / 2 - 0.2),
			);
			counterWeight.rotation.y = rotation;
			counterWeight.material = machineryMat;
			meshes.push(counterWeight);
		}

		// Rust/damage effects based on condition
		if (condition === "rusted" && rng) {
			const rustMat = new PBRMaterial(`elevator_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.5, 0.35, 0.2);
			rustMat.metallic = 0.3;
			rustMat.roughness = 0.9;
			rustMat.alpha = 0.7;
			materials.push(rustMat);

			const rustCount = 3 + Math.floor(rng.next() * 3);
			for (let r = 0; r < rustCount; r++) {
				const rustStreak = MeshBuilder.CreateBox(
					`${id}_rust_${r}`,
					{
						width: 0.05 + rng.next() * 0.1,
						height: height * (0.1 + rng.next() * 0.2),
						depth: 0.01,
					},
					scene,
				);
				const rustAngle = rng.next() * Math.PI * 2;
				rustStreak.position = new Vector3(
					posX + Math.cos(rustAngle) * (width / 2 + 0.02),
					posY + height * (0.5 + rng.next() * 0.3),
					posZ + Math.sin(rustAngle) * (depth / 2 + 0.02),
				);
				rustStreak.rotation.y = rustAngle;
				rustStreak.material = rustMat;
				meshes.push(rustStreak);
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
		rotation,
		condition,
		seed,
		height,
		width,
		hasMotorRoom,
		currentFloor,
	]);

	return null;
}
