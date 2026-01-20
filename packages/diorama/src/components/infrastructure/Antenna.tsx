/**
 * Antenna - Communication antenna component
 *
 * Various antenna types for rooftops and buildings.
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

export type AntennaType = "tv" | "satellite" | "cell" | "radio" | "wifi";

export interface AntennaProps {
	id: string;
	position: Vector3;
	/** Antenna type */
	type?: AntennaType;
	/** Height of antenna */
	height?: number;
	/** Dish diameter (for satellite) */
	dishSize?: number;
	/** Rotation/direction (radians) */
	rotation?: number;
	/** Rust/age 0-1 */
	rust?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Antenna({
	id,
	position,
	type = "tv",
	height = 2,
	dishSize = 0.8,
	rotation = 0,
	rust = 0.2,
	seed,
}: AntennaProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const rustFactor = 1 - rust * 0.3;

		// Materials
		const metalMat = new PBRMaterial(`antenna_metal_${id}`, scene);
		metalMat.albedoColor = new Color3(
			0.55 * rustFactor,
			0.55 * rustFactor,
			0.58 * rustFactor,
		);
		metalMat.metallic = 0.85;
		metalMat.roughness = 0.35 + rust * 0.3;

		const poleMat = new PBRMaterial(`antenna_pole_${id}`, scene);
		poleMat.albedoColor = new Color3(
			0.5 * rustFactor,
			0.5 * rustFactor,
			0.52 * rustFactor,
		);
		poleMat.metallic = 0.8;
		poleMat.roughness = 0.4 + rust * 0.25;

		if (type === "tv") {
			// TV antenna (Yagi style)
			const mastRadius = 0.015;

			// Main mast
			const mast = MeshBuilder.CreateCylinder(
				`${id}_mast`,
				{ height: height, diameter: mastRadius * 2 },
				scene,
			);
			mast.position = new Vector3(posX, posY + height / 2, posZ);
			mast.material = poleMat;
			meshes.push(mast);

			// Horizontal boom
			const boomLength = 1.2;
			const boom = MeshBuilder.CreateCylinder(
				`${id}_boom`,
				{ height: boomLength, diameter: mastRadius * 1.5 },
				scene,
			);
			boom.position = new Vector3(
				posX + (Math.sin(rotation) * boomLength) / 4,
				posY + height - 0.15,
				posZ + (Math.cos(rotation) * boomLength) / 4,
			);
			boom.rotation.x = Math.PI / 2;
			boom.rotation.y = rotation;
			boom.material = metalMat;
			meshes.push(boom);

			// Elements (dipoles)
			const elementCount = 8;
			const elementLengths = [0.5, 0.48, 0.45, 0.42, 0.38, 0.35, 0.32, 0.3];
			for (let i = 0; i < elementCount; i++) {
				const elementPos = (i / elementCount - 0.3) * boomLength;
				const elementLength = elementLengths[i] || 0.3;

				const element = MeshBuilder.CreateCylinder(
					`${id}_element_${i}`,
					{ height: elementLength, diameter: 0.008 },
					scene,
				);
				element.position = new Vector3(
					posX + Math.sin(rotation) * elementPos,
					posY + height - 0.15,
					posZ + Math.cos(rotation) * elementPos,
				);
				element.rotation.z = Math.PI / 2;
				element.rotation.y = rotation + Math.PI / 2;
				element.material = metalMat;
				meshes.push(element);
			}

			// Reflector
			const reflector = MeshBuilder.CreateCylinder(
				`${id}_reflector`,
				{ height: 0.6, diameter: 0.008 },
				scene,
			);
			reflector.position = new Vector3(
				posX - Math.sin(rotation) * boomLength * 0.4,
				posY + height - 0.15,
				posZ - Math.cos(rotation) * boomLength * 0.4,
			);
			reflector.rotation.z = Math.PI / 2;
			reflector.rotation.y = rotation + Math.PI / 2;
			reflector.material = metalMat;
			meshes.push(reflector);
		} else if (type === "satellite") {
			// Satellite dish
			const dishMat = new PBRMaterial(`antenna_dish_${id}`, scene);
			dishMat.albedoColor = new Color3(0.85, 0.85, 0.88).scale(rustFactor);
			dishMat.metallic = 0.3;
			dishMat.roughness = 0.5;

			// Mount
			const mount = MeshBuilder.CreateCylinder(
				`${id}_mount`,
				{ height: 0.3, diameter: 0.08 },
				scene,
			);
			mount.position = new Vector3(posX, posY + 0.15, posZ);
			mount.material = poleMat;
			meshes.push(mount);

			// Arm
			const armLength = dishSize * 0.6;
			const arm = MeshBuilder.CreateCylinder(
				`${id}_arm`,
				{ height: armLength, diameter: 0.04 },
				scene,
			);
			arm.position = new Vector3(
				posX + (Math.sin(rotation) * armLength) / 3,
				posY + 0.3 + armLength / 3,
				posZ + (Math.cos(rotation) * armLength) / 3,
			);
			arm.rotation.x = Math.PI / 4;
			arm.rotation.y = rotation;
			arm.material = poleMat;
			meshes.push(arm);

			// Dish (hemisphere)
			const dish = MeshBuilder.CreateSphere(
				`${id}_dish`,
				{ diameter: dishSize, slice: 0.5 },
				scene,
			);
			dish.position = new Vector3(
				posX + Math.sin(rotation) * armLength * 0.5,
				posY + 0.3 + armLength * 0.6,
				posZ + Math.cos(rotation) * armLength * 0.5,
			);
			dish.rotation.x = -Math.PI / 4;
			dish.rotation.y = rotation;
			dish.material = dishMat;
			meshes.push(dish);

			// LNB (receiver)
			const lnbArm = MeshBuilder.CreateCylinder(
				`${id}_lnbArm`,
				{ height: dishSize * 0.5, diameter: 0.015 },
				scene,
			);
			lnbArm.position = new Vector3(
				posX + Math.sin(rotation) * (armLength * 0.5 + dishSize * 0.2),
				posY + 0.3 + armLength * 0.6,
				posZ + Math.cos(rotation) * (armLength * 0.5 + dishSize * 0.2),
			);
			lnbArm.rotation.z = Math.PI / 2;
			lnbArm.rotation.y = rotation;
			lnbArm.material = poleMat;
			meshes.push(lnbArm);

			const lnb = MeshBuilder.CreateCylinder(
				`${id}_lnb`,
				{ height: 0.08, diameter: 0.04 },
				scene,
			);
			lnb.position = new Vector3(
				posX + Math.sin(rotation) * (armLength * 0.5 + dishSize * 0.35),
				posY + 0.3 + armLength * 0.6,
				posZ + Math.cos(rotation) * (armLength * 0.5 + dishSize * 0.35),
			);
			lnb.rotation.z = Math.PI / 2;
			lnb.rotation.y = rotation;
			lnb.material = metalMat;
			meshes.push(lnb);
		} else if (type === "cell") {
			// Cellular tower panel antenna
			// Main pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: height, diameter: 0.1 },
				scene,
			);
			pole.position = new Vector3(posX, posY + height / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Panel antennas (3 sectors)
			const panelMat = new PBRMaterial(`antenna_panel_${id}`, scene);
			panelMat.albedoColor = new Color3(0.85, 0.85, 0.88);
			panelMat.metallic = 0.2;
			panelMat.roughness = 0.4;

			for (let sector = 0; sector < 3; sector++) {
				const sectorAngle = (sector / 3) * Math.PI * 2 + rotation;
				const panelDist = 0.2;

				const panel = MeshBuilder.CreateBox(
					`${id}_panel_${sector}`,
					{ width: 0.15, height: 1.2, depth: 0.08 },
					scene,
				);
				panel.position = new Vector3(
					posX + Math.cos(sectorAngle) * panelDist,
					posY + height - 0.8,
					posZ + Math.sin(sectorAngle) * panelDist,
				);
				panel.rotation.y = sectorAngle;
				panel.material = panelMat;
				meshes.push(panel);
			}

			// Equipment boxes
			const boxMat = new PBRMaterial(`antenna_box_${id}`, scene);
			boxMat.albedoColor = new Color3(0.5, 0.52, 0.55);
			boxMat.metallic = 0.7;
			boxMat.roughness = 0.4;

			const box = MeshBuilder.CreateBox(
				`${id}_equipBox`,
				{ width: 0.4, height: 0.5, depth: 0.3 },
				scene,
			);
			box.position = new Vector3(posX + 0.3, posY + height * 0.3, posZ);
			box.material = boxMat;
			meshes.push(box);
		} else if (type === "radio") {
			// Radio antenna (whip style)
			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.2, diameter: 0.15 },
				scene,
			);
			base.position = new Vector3(posX, posY + 0.1, posZ);
			base.material = poleMat;
			meshes.push(base);

			// Coil section
			const coil = MeshBuilder.CreateCylinder(
				`${id}_coil`,
				{ height: 0.3, diameter: 0.06 },
				scene,
			);
			coil.position = new Vector3(posX, posY + 0.35, posZ);
			coil.material = metalMat;
			meshes.push(coil);

			// Whip antenna
			const whip = MeshBuilder.CreateCylinder(
				`${id}_whip`,
				{ height: height - 0.5, diameterTop: 0.005, diameterBottom: 0.015 },
				scene,
			);
			whip.position = new Vector3(posX, posY + 0.5 + (height - 0.5) / 2, posZ);
			whip.material = metalMat;
			meshes.push(whip);
		} else if (type === "wifi") {
			// WiFi antenna
			// Base mount
			const mount = MeshBuilder.CreateCylinder(
				`${id}_mount`,
				{ height: 0.1, diameter: 0.08 },
				scene,
			);
			mount.position = new Vector3(posX, posY + 0.05, posZ);
			mount.material = poleMat;
			meshes.push(mount);

			// Multiple antenna rods
			const antennaCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
			const spread = 0.15;

			for (let a = 0; a < antennaCount; a++) {
				const antennaX =
					((a - (antennaCount - 1) / 2) * spread) / (antennaCount - 1 || 1);

				// Plastic housing
				const plasticMat = new PBRMaterial(`antenna_plastic_${id}_${a}`, scene);
				plasticMat.albedoColor = new Color3(0.2, 0.2, 0.22);
				plasticMat.metallic = 0.1;
				plasticMat.roughness = 0.7;

				const antenna = MeshBuilder.CreateCylinder(
					`${id}_wifi_${a}`,
					{ height: height * 0.8, diameterTop: 0.015, diameterBottom: 0.02 },
					scene,
				);
				antenna.position = new Vector3(
					posX + Math.cos(rotation) * antennaX,
					posY + 0.1 + height * 0.4,
					posZ - Math.sin(rotation) * antennaX,
				);
				antenna.material = plasticMat;
				meshes.push(antenna);

				// Articulation joint
				const joint = MeshBuilder.CreateSphere(
					`${id}_joint_${a}`,
					{ diameter: 0.025 },
					scene,
				);
				joint.position = new Vector3(
					posX + Math.cos(rotation) * antennaX,
					posY + 0.1,
					posZ - Math.sin(rotation) * antennaX,
				);
				joint.material = poleMat;
				meshes.push(joint);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			metalMat.dispose();
			poleMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		height,
		dishSize,
		rotation,
		rust,
		seed,
	]);

	return null;
}
