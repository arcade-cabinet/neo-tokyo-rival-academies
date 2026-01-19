/**
 * CoolingTower - HVAC cooling tower components
 *
 * Various cooling tower types for buildings in the flooded Neo-Tokyo environment.
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

export type CoolingTowerType = "evaporative" | "dry" | "hybrid" | "industrial";

export type CoolingTowerCondition = "pristine" | "worn" | "damaged" | "rusted";

export interface CoolingTowerProps {
	id: string;
	position: Vector3;
	/** Cooling tower type */
	type?: CoolingTowerType;
	/** Rotation (radians) */
	rotation?: number;
	/** Condition of the tower */
	condition?: CoolingTowerCondition;
	/** Seed for procedural variation */
	seed?: number;
	/** Height of the tower */
	height?: number;
	/** Diameter of the tower */
	diameter?: number;
	/** Whether it has a fan on top */
	hasFan?: boolean;
	/** Whether the tower is currently running */
	isRunning?: boolean;
}

const CONDITION_FACTORS: Record<CoolingTowerCondition, number> = {
	pristine: 1.0,
	worn: 0.85,
	damaged: 0.7,
	rusted: 0.55,
};

export function CoolingTower({
	id,
	position,
	type = "evaporative",
	rotation = 0,
	condition = "worn",
	seed,
	height = 3,
	diameter = 2,
	hasFan = true,
	isRunning = false,
}: CoolingTowerProps) {
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
		const ageVariation = rng ? rng.next() * 0.08 : 0.04;

		// Main body material
		const bodyMat = new PBRMaterial(`cooling_body_${id}`, scene);
		bodyMat.metallic = 0.6;
		bodyMat.roughness = 0.5 + (1 - conditionFactor) * 0.25;
		materials.push(bodyMat);

		// Frame/structure material
		const frameMat = new PBRMaterial(`cooling_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(
			0.4 * conditionFactor - ageVariation,
			0.42 * conditionFactor - ageVariation,
			0.45 * conditionFactor - ageVariation
		);
		frameMat.metallic = 0.85;
		frameMat.roughness = 0.35;
		materials.push(frameMat);

		// Grate/louver material
		const grateMat = new PBRMaterial(`cooling_grate_${id}`, scene);
		grateMat.albedoColor = new Color3(0.2, 0.2, 0.22);
		grateMat.metallic = 0.7;
		grateMat.roughness = 0.5;
		materials.push(grateMat);

		if (type === "evaporative") {
			// Classic evaporative cooling tower (rectangular)
			bodyMat.albedoColor = new Color3(
				0.55 * conditionFactor - ageVariation,
				0.57 * conditionFactor - ageVariation,
				0.6 * conditionFactor - ageVariation
			);

			const towerWidth = diameter;
			const towerDepth = diameter * 0.8;

			// Main tower body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: towerWidth, height: height, depth: towerDepth },
				scene
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Intake louvers on sides
			const louverHeight = height * 0.6;
			const louverCount = Math.floor(louverHeight / 0.15);

			for (const side of [-1, 1]) {
				// Louver frame
				const louverFrame = MeshBuilder.CreateBox(
					`${id}_louver_frame_${side}`,
					{ width: 0.03, height: louverHeight, depth: towerDepth * 0.8 },
					scene
				);
				louverFrame.position = new Vector3(
					posX + Math.cos(rotation) * (side * (towerWidth / 2 + 0.015)),
					posY + height * 0.35,
					posZ - Math.sin(rotation) * (side * (towerWidth / 2 + 0.015))
				);
				louverFrame.rotation.y = rotation;
				louverFrame.material = grateMat;
				meshes.push(louverFrame);

				// Individual louver slats
				for (let l = 0; l < louverCount; l++) {
					const slat = MeshBuilder.CreateBox(
						`${id}_slat_${side}_${l}`,
						{ width: 0.02, height: 0.08, depth: towerDepth * 0.75 },
						scene
					);
					slat.position = new Vector3(
						posX + Math.cos(rotation) * (side * (towerWidth / 2 + 0.025)),
						posY + height * 0.1 + l * (louverHeight / louverCount),
						posZ - Math.sin(rotation) * (side * (towerWidth / 2 + 0.025))
					);
					slat.rotation.y = rotation;
					slat.rotation.z = side * Math.PI / 8;
					slat.material = bodyMat;
					meshes.push(slat);
				}
			}

			// Water basin at bottom
			const basin = MeshBuilder.CreateBox(
				`${id}_basin`,
				{ width: towerWidth + 0.1, height: 0.15, depth: towerDepth + 0.1 },
				scene
			);
			basin.position = new Vector3(posX, posY + 0.075, posZ);
			basin.rotation.y = rotation;
			basin.material = frameMat;
			meshes.push(basin);

			// Fill media section (visible through louvers)
			const fillMedia = MeshBuilder.CreateBox(
				`${id}_fill`,
				{ width: towerWidth * 0.9, height: height * 0.4, depth: towerDepth * 0.7 },
				scene
			);
			fillMedia.position = new Vector3(posX, posY + height * 0.35, posZ);
			fillMedia.rotation.y = rotation;

			const fillMat = new PBRMaterial(`cooling_fill_${id}`, scene);
			fillMat.albedoColor = new Color3(0.25, 0.25, 0.27);
			fillMat.metallic = 0.2;
			fillMat.roughness = 0.8;
			materials.push(fillMat);
			fillMedia.material = fillMat;
			meshes.push(fillMedia);

			// Fan stack on top
			if (hasFan) {
				const fanStack = MeshBuilder.CreateCylinder(
					`${id}_fan_stack`,
					{ height: height * 0.25, diameter: diameter * 0.7 },
					scene
				);
				fanStack.position = new Vector3(posX, posY + height + height * 0.125, posZ);
				fanStack.material = bodyMat;
				meshes.push(fanStack);

				// Fan guard
				const fanGuard = MeshBuilder.CreateTorus(
					`${id}_fan_guard`,
					{ diameter: diameter * 0.65, thickness: 0.03 },
					scene
				);
				fanGuard.position = new Vector3(posX, posY + height + height * 0.25, posZ);
				fanGuard.rotation.x = Math.PI / 2;
				fanGuard.material = grateMat;
				meshes.push(fanGuard);

				// Fan blades
				const bladeCount = 6;
				for (let b = 0; b < bladeCount; b++) {
					const bladeAngle = (b / bladeCount) * Math.PI * 2 + rotation;

					const blade = MeshBuilder.CreateBox(
						`${id}_blade_${b}`,
						{ width: diameter * 0.25, height: 0.02, depth: 0.08 },
						scene
					);
					blade.position = new Vector3(
						posX + Math.cos(bladeAngle) * diameter * 0.15,
						posY + height + height * 0.25,
						posZ + Math.sin(bladeAngle) * diameter * 0.15
					);
					blade.rotation.y = bladeAngle + Math.PI / 2;
					blade.rotation.x = Math.PI / 12;
					blade.material = frameMat;
					meshes.push(blade);
				}

				// Motor housing
				const motor = MeshBuilder.CreateCylinder(
					`${id}_motor`,
					{ height: 0.2, diameter: 0.25 },
					scene
				);
				motor.position = new Vector3(posX, posY + height + height * 0.18, posZ);
				motor.material = frameMat;
				meshes.push(motor);
			}

		} else if (type === "dry") {
			// Dry cooler (finned coil heat exchanger)
			bodyMat.albedoColor = new Color3(
				0.5 * conditionFactor,
				0.52 * conditionFactor,
				0.55 * conditionFactor
			);

			const coolerWidth = diameter * 1.5;
			const coolerHeight = height * 0.6;
			const coolerDepth = diameter * 0.4;

			// Main frame
			const frame = MeshBuilder.CreateBox(
				`${id}_frame`,
				{ width: coolerWidth, height: coolerHeight, depth: coolerDepth },
				scene
			);
			frame.position = new Vector3(posX, posY + coolerHeight / 2 + 0.3, posZ);
			frame.rotation.y = rotation;
			frame.material = frameMat;
			meshes.push(frame);

			// Fin coil sections
			const coilCount = 3;
			for (let c = 0; c < coilCount; c++) {
				const coilX = (c - 1) * (coolerWidth / 3);

				const coil = MeshBuilder.CreateBox(
					`${id}_coil_${c}`,
					{ width: coolerWidth / 3.5, height: coolerHeight * 0.85, depth: coolerDepth * 0.8 },
					scene
				);
				coil.position = new Vector3(
					posX + Math.cos(rotation) * coilX,
					posY + coolerHeight / 2 + 0.3,
					posZ - Math.sin(rotation) * coilX
				);
				coil.rotation.y = rotation;
				coil.material = bodyMat;
				meshes.push(coil);

				// Fin detail lines
				const finCount = 8;
				for (let f = 0; f < finCount; f++) {
					const fin = MeshBuilder.CreateBox(
						`${id}_fin_${c}_${f}`,
						{ width: coolerWidth / 3.5 - 0.02, height: 0.01, depth: coolerDepth * 0.75 },
						scene
					);
					fin.position = new Vector3(
						posX + Math.cos(rotation) * coilX,
						posY + 0.35 + (f / finCount) * coolerHeight * 0.8,
						posZ - Math.sin(rotation) * coilX
					);
					fin.rotation.y = rotation;
					fin.material = grateMat;
					meshes.push(fin);
				}
			}

			// Support legs
			for (const lx of [-1, 1]) {
				for (const lz of [-1, 1]) {
					const leg = MeshBuilder.CreateCylinder(
						`${id}_leg_${lx}_${lz}`,
						{ height: 0.3, diameter: 0.08 },
						scene
					);
					leg.position = new Vector3(
						posX + Math.cos(rotation) * (lx * coolerWidth / 2.5) - Math.sin(rotation) * (lz * coolerDepth / 3),
						posY + 0.15,
						posZ + Math.sin(rotation) * (lx * coolerWidth / 2.5) + Math.cos(rotation) * (lz * coolerDepth / 3)
					);
					leg.material = frameMat;
					meshes.push(leg);
				}
			}

			// Axial fans on top
			if (hasFan) {
				for (let fan = 0; fan < coilCount; fan++) {
					const fanX = (fan - 1) * (coolerWidth / 3);

					// Fan shroud
					const shroud = MeshBuilder.CreateCylinder(
						`${id}_shroud_${fan}`,
						{ height: 0.15, diameter: coolerWidth / 4 },
						scene
					);
					shroud.position = new Vector3(
						posX + Math.cos(rotation) * fanX,
						posY + coolerHeight + 0.4,
						posZ - Math.sin(rotation) * fanX
					);
					shroud.material = grateMat;
					meshes.push(shroud);

					// Fan hub
					const hub = MeshBuilder.CreateCylinder(
						`${id}_hub_${fan}`,
						{ height: 0.08, diameter: 0.1 },
						scene
					);
					hub.position = new Vector3(
						posX + Math.cos(rotation) * fanX,
						posY + coolerHeight + 0.45,
						posZ - Math.sin(rotation) * fanX
					);
					hub.material = frameMat;
					meshes.push(hub);
				}
			}

			// Header pipes
			for (const pz of [-1, 1]) {
				const pipe = MeshBuilder.CreateCylinder(
					`${id}_header_${pz}`,
					{ height: coolerWidth, diameter: 0.08 },
					scene
				);
				pipe.position = new Vector3(
					posX - Math.sin(rotation) * (pz * (coolerDepth / 2 + 0.06)),
					posY + coolerHeight * 0.8,
					posZ + Math.cos(rotation) * (pz * (coolerDepth / 2 + 0.06))
				);
				pipe.rotation.z = Math.PI / 2;
				pipe.rotation.y = rotation;
				pipe.material = frameMat;
				meshes.push(pipe);
			}

		} else if (type === "hybrid") {
			// Hybrid cooling tower (wet/dry)
			bodyMat.albedoColor = new Color3(
				0.6 * conditionFactor - ageVariation,
				0.62 * conditionFactor - ageVariation,
				0.65 * conditionFactor - ageVariation
			);

			// Lower wet section
			const wetHeight = height * 0.6;
			const wetSection = MeshBuilder.CreateBox(
				`${id}_wet_section`,
				{ width: diameter, height: wetHeight, depth: diameter * 0.9 },
				scene
			);
			wetSection.position = new Vector3(posX, posY + wetHeight / 2, posZ);
			wetSection.rotation.y = rotation;
			wetSection.material = bodyMat;
			meshes.push(wetSection);

			// Upper dry coil section
			const dryHeight = height * 0.35;
			const drySection = MeshBuilder.CreateBox(
				`${id}_dry_section`,
				{ width: diameter * 1.1, height: dryHeight, depth: diameter * 0.5 },
				scene
			);
			drySection.position = new Vector3(posX, posY + wetHeight + dryHeight / 2, posZ);
			drySection.rotation.y = rotation;
			drySection.material = frameMat;
			meshes.push(drySection);

			// Transition collar
			const collar = MeshBuilder.CreateBox(
				`${id}_collar`,
				{ width: diameter * 1.05, height: 0.1, depth: diameter * 0.85 },
				scene
			);
			collar.position = new Vector3(posX, posY + wetHeight + 0.05, posZ);
			collar.rotation.y = rotation;
			collar.material = grateMat;
			meshes.push(collar);

			// Louvers on wet section
			const louverSections = 2;
			for (const side of [-1, 1]) {
				for (let ls = 0; ls < louverSections; ls++) {
					const louverY = posY + wetHeight * 0.2 + ls * wetHeight * 0.35;

					const louver = MeshBuilder.CreateBox(
						`${id}_hybrid_louver_${side}_${ls}`,
						{ width: 0.02, height: wetHeight * 0.25, depth: diameter * 0.7 },
						scene
					);
					louver.position = new Vector3(
						posX + Math.cos(rotation) * (side * (diameter / 2 + 0.01)),
						louverY,
						posZ - Math.sin(rotation) * (side * (diameter / 2 + 0.01))
					);
					louver.rotation.y = rotation;
					louver.material = grateMat;
					meshes.push(louver);
				}
			}

			// Fan on top
			if (hasFan) {
				const fanDiameter = diameter * 0.6;

				const fanRing = MeshBuilder.CreateTorus(
					`${id}_fan_ring`,
					{ diameter: fanDiameter, thickness: 0.04 },
					scene
				);
				fanRing.position = new Vector3(posX, posY + height + 0.1, posZ);
				fanRing.rotation.x = Math.PI / 2;
				fanRing.material = frameMat;
				meshes.push(fanRing);

				// Fan blades
				const bladeCount = 5;
				for (let b = 0; b < bladeCount; b++) {
					const bladeAngle = (b / bladeCount) * Math.PI * 2;

					const blade = MeshBuilder.CreateBox(
						`${id}_hybrid_blade_${b}`,
						{ width: fanDiameter * 0.4, height: 0.015, depth: 0.1 },
						scene
					);
					blade.position = new Vector3(
						posX + Math.cos(bladeAngle) * fanDiameter * 0.2,
						posY + height + 0.1,
						posZ + Math.sin(bladeAngle) * fanDiameter * 0.2
					);
					blade.rotation.y = bladeAngle + Math.PI / 2;
					blade.rotation.x = Math.PI / 10;
					blade.material = bodyMat;
					meshes.push(blade);
				}
			}

			// Spray nozzle distribution (visible as pipes)
			const nozzlePipe = MeshBuilder.CreateCylinder(
				`${id}_nozzle_pipe`,
				{ height: diameter * 0.7, diameter: 0.04 },
				scene
			);
			nozzlePipe.position = new Vector3(posX, posY + wetHeight * 0.85, posZ);
			nozzlePipe.rotation.z = Math.PI / 2;
			nozzlePipe.rotation.y = rotation;
			nozzlePipe.material = frameMat;
			meshes.push(nozzlePipe);

		} else if (type === "industrial") {
			// Large industrial hyperbolic cooling tower
			bodyMat.albedoColor = new Color3(
				0.65 * conditionFactor,
				0.63 * conditionFactor,
				0.6 * conditionFactor
			);

			// Hyperbolic shell (approximated with stacked cylinders)
			const shellSegments = 8;
			const baseRadius = diameter / 2;
			const throatRadius = diameter * 0.35;
			const topRadius = diameter * 0.45;

			for (let s = 0; s < shellSegments; s++) {
				const t = s / (shellSegments - 1);
				const segmentHeight = height / shellSegments;

				// Hyperbolic profile calculation
				const throatPosition = 0.7;
				let radius: number;
				if (t < throatPosition) {
					const localT = t / throatPosition;
					radius = baseRadius - (baseRadius - throatRadius) * Math.pow(localT, 0.5);
				} else {
					const localT = (t - throatPosition) / (1 - throatPosition);
					radius = throatRadius + (topRadius - throatRadius) * Math.pow(localT, 0.8);
				}

				const nextT = (s + 1) / (shellSegments - 1);
				let nextRadius: number;
				if (nextT < throatPosition) {
					const localT = nextT / throatPosition;
					nextRadius = baseRadius - (baseRadius - throatRadius) * Math.pow(localT, 0.5);
				} else {
					const localT = (nextT - throatPosition) / (1 - throatPosition);
					nextRadius = throatRadius + (topRadius - throatRadius) * Math.pow(localT, 0.8);
				}

				const segment = MeshBuilder.CreateCylinder(
					`${id}_shell_${s}`,
					{
						height: segmentHeight,
						diameterBottom: radius * 2,
						diameterTop: nextRadius * 2,
					},
					scene
				);
				segment.position = new Vector3(posX, posY + s * segmentHeight + segmentHeight / 2, posZ);
				segment.material = bodyMat;
				meshes.push(segment);
			}

			// Air inlet openings at base
			const inletCount = 8;
			const inletHeight = height * 0.15;

			for (let i = 0; i < inletCount; i++) {
				const inletAngle = (i / inletCount) * Math.PI * 2;

				// Support columns between inlets
				const column = MeshBuilder.CreateCylinder(
					`${id}_column_${i}`,
					{ height: inletHeight, diameter: 0.2 },
					scene
				);
				column.position = new Vector3(
					posX + Math.cos(inletAngle) * (baseRadius - 0.15),
					posY + inletHeight / 2,
					posZ + Math.sin(inletAngle) * (baseRadius - 0.15)
				);
				column.material = frameMat;
				meshes.push(column);
			}

			// Water distribution basin
			const basin = MeshBuilder.CreateCylinder(
				`${id}_basin`,
				{ height: 0.2, diameter: diameter * 0.8 },
				scene
			);
			basin.position = new Vector3(posX, posY + 0.1, posZ);
			basin.material = frameMat;
			meshes.push(basin);

			// Fill pack support structure
			const fillSupport = MeshBuilder.CreateCylinder(
				`${id}_fill_support`,
				{ height: height * 0.3, diameter: diameter * 0.7 },
				scene
			);
			fillSupport.position = new Vector3(posX, posY + height * 0.25, posZ);

			const fillMat = new PBRMaterial(`cooling_fill_ind_${id}`, scene);
			fillMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			fillMat.metallic = 0.3;
			fillMat.roughness = 0.7;
			materials.push(fillMat);
			fillSupport.material = fillMat;
			meshes.push(fillSupport);

			// Drift eliminators at top
			const eliminator = MeshBuilder.CreateCylinder(
				`${id}_eliminator`,
				{ height: 0.15, diameter: topRadius * 1.8 },
				scene
			);
			eliminator.position = new Vector3(posX, posY + height - 0.1, posZ);
			eliminator.material = grateMat;
			meshes.push(eliminator);

			// Access ladder
			const ladderHeight = height * 0.9;
			const ladderRail = MeshBuilder.CreateCylinder(
				`${id}_ladder`,
				{ height: ladderHeight, diameter: 0.04 },
				scene
			);
			ladderRail.position = new Vector3(
				posX + baseRadius + 0.15,
				posY + ladderHeight / 2,
				posZ
			);
			ladderRail.material = frameMat;
			meshes.push(ladderRail);
		}

		// Running indicator (steam/mist effect placeholder - colored sphere)
		if (isRunning && hasFan) {
			const steamMat = new PBRMaterial(`cooling_steam_${id}`, scene);
			steamMat.albedoColor = new Color3(0.9, 0.92, 0.95);
			steamMat.metallic = 0;
			steamMat.roughness = 1;
			steamMat.alpha = 0.3;
			materials.push(steamMat);

			const steam = MeshBuilder.CreateSphere(
				`${id}_steam`,
				{ diameter: diameter * 0.5 },
				scene
			);
			steam.position = new Vector3(posX, posY + height + (type === "industrial" ? 0.5 : height * 0.3), posZ);
			steam.material = steamMat;
			meshes.push(steam);
		}

		// Rust/corrosion for damaged condition
		if (condition === "rusted" && rng) {
			const rustMat = new PBRMaterial(`cooling_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.45, 0.3, 0.15);
			rustMat.metallic = 0.25;
			rustMat.roughness = 0.95;
			rustMat.alpha = 0.65;
			materials.push(rustMat);

			const rustCount = 3 + Math.floor(rng.next() * 3);
			for (let r = 0; r < rustCount; r++) {
				const rustStreak = MeshBuilder.CreateBox(
					`${id}_rust_${r}`,
					{
						width: diameter * (0.08 + rng.next() * 0.12),
						height: height * (0.15 + rng.next() * 0.25),
						depth: 0.015,
					},
					scene
				);
				const streakAngle = rng.next() * Math.PI * 2;
				const streakRadius = (diameter / 2) * (0.9 + rng.next() * 0.15);
				rustStreak.position = new Vector3(
					posX + Math.cos(streakAngle) * streakRadius,
					posY + height * (0.3 + rng.next() * 0.5),
					posZ + Math.sin(streakAngle) * streakRadius
				);
				rustStreak.rotation.y = streakAngle;
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
	}, [scene, id, posX, posY, posZ, type, rotation, condition, seed, height, diameter, hasFan, isRunning]);

	return null;
}
