/**
 * AirConditioner - Window and wall AC units
 *
 * Air conditioning units for building exteriors.
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

export type AirConditionerType =
	| "window"
	| "split"
	| "mini"
	| "industrial"
	| "portable";

export interface AirConditionerProps {
	id: string;
	position: Vector3;
	/** AC type */
	type?: AirConditionerType;
	/** Is running */
	isRunning?: boolean;
	/** Has drip stain */
	hasDripStain?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Wall normal direction (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function AirConditioner({
	id,
	position,
	type = "window",
	isRunning = false,
	hasDripStain = true,
	condition = 0.7,
	rotation = 0,
	seed,
}: AirConditionerProps) {
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

		// Main material
		const bodyMat = new PBRMaterial(`ac_body_${id}`, scene);
		bodyMat.albedoColor = new Color3(0.85, 0.83, 0.8).scale(conditionFactor);
		bodyMat.metallic = 0.3;
		bodyMat.roughness = 0.6;

		const ventMat = new PBRMaterial(`ac_vent_${id}`, scene);
		ventMat.albedoColor = new Color3(0.3, 0.32, 0.35);
		ventMat.metallic = 0.5;
		ventMat.roughness = 0.5;

		if (type === "window") {
			// Window AC unit
			const width = 0.6;
			const height = 0.4;
			const depth = 0.5;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: width, height: height, depth: depth },
				scene,
			);
			body.position = new Vector3(posX, posY, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Front vent panel
			const frontVent = MeshBuilder.CreateBox(
				`${id}_frontvent`,
				{ width: width * 0.9, height: height * 0.4, depth: 0.02 },
				scene,
			);
			frontVent.position = new Vector3(
				posX - Math.sin(rotation) * (depth / 2 + 0.01),
				posY - height * 0.15,
				posZ - Math.cos(rotation) * (depth / 2 + 0.01),
			);
			frontVent.rotation.y = rotation;
			frontVent.material = ventMat;
			meshes.push(frontVent);

			// Vent slats
			const slatCount = 6;
			for (let s = 0; s < slatCount; s++) {
				const slat = MeshBuilder.CreateBox(
					`${id}_slat_${s}`,
					{ width: width * 0.85, height: 0.01, depth: 0.03 },
					scene,
				);
				slat.position = new Vector3(
					posX - Math.sin(rotation) * (depth / 2 + 0.02),
					posY - height * 0.3 + s * ((height * 0.35) / slatCount),
					posZ - Math.cos(rotation) * (depth / 2 + 0.02),
				);
				slat.rotation.y = rotation;
				slat.rotation.x = isRunning ? -0.3 : 0;
				slat.material = ventMat;
				meshes.push(slat);
			}

			// Controls panel
			const controlMat = new PBRMaterial(`ac_control_${id}`, scene);
			controlMat.albedoColor = new Color3(0.2, 0.22, 0.25);
			controlMat.metallic = 0.4;
			controlMat.roughness = 0.5;

			const controls = MeshBuilder.CreateBox(
				`${id}_controls`,
				{ width: width * 0.3, height: height * 0.15, depth: 0.02 },
				scene,
			);
			controls.position = new Vector3(
				posX -
					Math.sin(rotation) * (depth / 2 + 0.01) +
					Math.cos(rotation) * (width * 0.3),
				posY + height * 0.3,
				posZ -
					Math.cos(rotation) * (depth / 2 + 0.01) -
					Math.sin(rotation) * (width * 0.3),
			);
			controls.rotation.y = rotation;
			controls.material = controlMat;
			meshes.push(controls);

			// Back grille
			const grilleMat = new PBRMaterial(`ac_grille_${id}`, scene);
			grilleMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(
				conditionFactor,
			);
			grilleMat.metallic = 0.6;
			grilleMat.roughness = 0.5;

			const grille = MeshBuilder.CreateBox(
				`${id}_grille`,
				{ width: width, height: height * 0.7, depth: 0.02 },
				scene,
			);
			grille.position = new Vector3(
				posX + Math.sin(rotation) * (depth / 2 + 0.01),
				posY,
				posZ + Math.cos(rotation) * (depth / 2 + 0.01),
			);
			grille.rotation.y = rotation;
			grille.material = grilleMat;
			meshes.push(grille);
		} else if (type === "split") {
			// Split system outdoor unit
			const width = 0.8;
			const height = 0.6;
			const depth = 0.3;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: width, height: height, depth: depth },
				scene,
			);
			body.position = new Vector3(posX, posY, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Fan grille (front)
			const fanGrille = MeshBuilder.CreateCylinder(
				`${id}_fangrille`,
				{ height: 0.02, diameter: height * 0.7, tessellation: 24 },
				scene,
			);
			fanGrille.position = new Vector3(
				posX - Math.sin(rotation) * (depth / 2 + 0.01),
				posY,
				posZ - Math.cos(rotation) * (depth / 2 + 0.01),
			);
			fanGrille.rotation.z = Math.PI / 2;
			fanGrille.rotation.y = rotation;
			fanGrille.material = ventMat;
			meshes.push(fanGrille);

			// Fan blades (if running)
			if (isRunning) {
				const fanMat = new PBRMaterial(`ac_fan_${id}`, scene);
				fanMat.albedoColor = new Color3(0.2, 0.22, 0.25);
				fanMat.metallic = 0.5;
				fanMat.roughness = 0.4;

				const bladeCount = 5;
				for (let b = 0; b < bladeCount; b++) {
					const bladeAngle = (b / bladeCount) * Math.PI * 2;
					const blade = MeshBuilder.CreateBox(
						`${id}_blade_${b}`,
						{ width: height * 0.3, height: 0.02, depth: 0.05 },
						scene,
					);
					blade.position = new Vector3(
						posX - Math.sin(rotation) * (depth / 2 + 0.02),
						posY + Math.sin(bladeAngle) * height * 0.2,
						posZ -
							Math.cos(rotation) * (depth / 2 + 0.02) +
							Math.cos(bladeAngle) * height * 0.2,
					);
					blade.rotation.y = rotation;
					blade.rotation.x = bladeAngle;
					blade.material = fanMat;
					meshes.push(blade);
				}
			}

			// Pipes
			const pipeMat = new PBRMaterial(`ac_pipe_${id}`, scene);
			pipeMat.albedoColor = new Color3(0.7, 0.5, 0.35);
			pipeMat.metallic = 0.7;
			pipeMat.roughness = 0.4;

			for (let p = 0; p < 2; p++) {
				const pipe = MeshBuilder.CreateCylinder(
					`${id}_pipe_${p}`,
					{ height: 0.5, diameter: 0.03 },
					scene,
				);
				pipe.position = new Vector3(
					posX +
						Math.cos(rotation) * (width / 2 - 0.1 - p * 0.06) +
						Math.sin(rotation) * (depth / 2 + 0.25),
					posY + height / 2,
					posZ -
						Math.sin(rotation) * (width / 2 - 0.1 - p * 0.06) +
						Math.cos(rotation) * (depth / 2 + 0.25),
				);
				pipe.rotation.z = Math.PI / 2;
				pipe.rotation.y = rotation;
				pipe.material = pipeMat;
				meshes.push(pipe);
			}
		} else if (type === "mini") {
			// Mini split indoor unit
			const width = 0.8;
			const height = 0.25;
			const depth = 0.2;

			// Main body (curved)
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: width, height: height, depth: depth },
				scene,
			);
			body.position = new Vector3(posX, posY, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Bottom vent
			const vent = MeshBuilder.CreateBox(
				`${id}_vent`,
				{ width: width * 0.9, height: height * 0.3, depth: depth + 0.02 },
				scene,
			);
			vent.position = new Vector3(
				posX - Math.sin(rotation) * 0.02,
				posY - height * 0.4,
				posZ - Math.cos(rotation) * 0.02,
			);
			vent.rotation.y = rotation;
			vent.rotation.x = isRunning ? 0.3 : 0;
			vent.material = ventMat;
			meshes.push(vent);

			// Status LED
			if (isRunning) {
				const ledMat = new PBRMaterial(`ac_led_${id}`, scene);
				ledMat.albedoColor = new Color3(0.2, 0.8, 0.3);
				ledMat.emissiveColor = new Color3(0.1, 0.5, 0.2);
				ledMat.metallic = 0;
				ledMat.roughness = 0.3;

				const led = MeshBuilder.CreateSphere(
					`${id}_led`,
					{ diameter: 0.02, segments: 8 },
					scene,
				);
				led.position = new Vector3(
					posX -
						Math.sin(rotation) * (depth / 2 + 0.01) +
						Math.cos(rotation) * (width / 2 - 0.05),
					posY + height * 0.3,
					posZ -
						Math.cos(rotation) * (depth / 2 + 0.01) -
						Math.sin(rotation) * (width / 2 - 0.05),
				);
				led.material = ledMat;
				meshes.push(led);
			}
		} else if (type === "industrial") {
			// Large industrial unit
			const width = 1.5;
			const height = 1.2;
			const depth = 0.6;

			// Main body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: width, height: height, depth: depth },
				scene,
			);
			body.position = new Vector3(posX, posY, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Multiple fan grilles
			for (let f = 0; f < 2; f++) {
				const fanY = posY + (f - 0.5) * height * 0.4;
				const fanGrille = MeshBuilder.CreateCylinder(
					`${id}_fan_${f}`,
					{ height: 0.02, diameter: height * 0.35, tessellation: 24 },
					scene,
				);
				fanGrille.position = new Vector3(
					posX - Math.sin(rotation) * (depth / 2 + 0.01),
					fanY,
					posZ - Math.cos(rotation) * (depth / 2 + 0.01),
				);
				fanGrille.rotation.z = Math.PI / 2;
				fanGrille.rotation.y = rotation;
				fanGrille.material = ventMat;
				meshes.push(fanGrille);
			}

			// Service panel
			const panelMat = new PBRMaterial(`ac_panel_${id}`, scene);
			panelMat.albedoColor = new Color3(0.5, 0.52, 0.55);
			panelMat.metallic = 0.7;
			panelMat.roughness = 0.4;

			const panel = MeshBuilder.CreateBox(
				`${id}_panel`,
				{ width: width * 0.3, height: height * 0.4, depth: 0.02 },
				scene,
			);
			panel.position = new Vector3(
				posX + Math.cos(rotation) * (width * 0.3),
				posY - height * 0.2,
				posZ - Math.sin(rotation) * (width * 0.3),
			);
			panel.rotation.y = rotation + Math.PI / 2;
			panel.material = panelMat;
			meshes.push(panel);
		} else {
			// Portable AC
			const width = 0.35;
			const height = 0.7;
			const depth = 0.35;

			// Main body
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: height, diameter: width, tessellation: 16 },
				scene,
			);
			body.position = new Vector3(posX, posY + height / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Top vent
			const topVent = MeshBuilder.CreateCylinder(
				`${id}_topvent`,
				{ height: 0.05, diameter: width * 0.8, tessellation: 16 },
				scene,
			);
			topVent.position = new Vector3(posX, posY + height - 0.05, posZ);
			topVent.material = ventMat;
			meshes.push(topVent);

			// Exhaust hose
			const hoseMat = new PBRMaterial(`ac_hose_${id}`, scene);
			hoseMat.albedoColor = new Color3(0.7, 0.68, 0.65);
			hoseMat.metallic = 0.2;
			hoseMat.roughness = 0.7;

			const hose = MeshBuilder.CreateCylinder(
				`${id}_hose`,
				{ height: 0.8, diameter: 0.12 },
				scene,
			);
			hose.position = new Vector3(
				posX + Math.cos(rotation) * 0.3,
				posY + height * 0.7,
				posZ - Math.sin(rotation) * 0.3,
			);
			hose.rotation.z = Math.PI / 4;
			hose.rotation.y = rotation;
			hose.material = hoseMat;
			meshes.push(hose);

			// Wheels
			const wheelMat = new PBRMaterial(`ac_wheel_${id}`, scene);
			wheelMat.albedoColor = new Color3(0.15, 0.15, 0.18);
			wheelMat.metallic = 0.3;
			wheelMat.roughness = 0.8;

			for (const side of [-1, 1]) {
				const wheel = MeshBuilder.CreateCylinder(
					`${id}_wheel_${side}`,
					{ height: 0.03, diameter: 0.08 },
					scene,
				);
				wheel.position = new Vector3(
					posX + Math.cos(rotation) * (side * width * 0.3),
					posY + 0.04,
					posZ - Math.sin(rotation) * (side * width * 0.3),
				);
				wheel.rotation.z = Math.PI / 2;
				wheel.rotation.y = rotation;
				wheel.material = wheelMat;
				meshes.push(wheel);
			}
		}

		// Drip stain
		if (hasDripStain && (type === "window" || type === "split")) {
			const stainMat = new PBRMaterial(`ac_stain_${id}`, scene);
			stainMat.albedoColor = new Color3(0.3, 0.35, 0.32);
			stainMat.metallic = 0;
			stainMat.roughness = 0.9;
			stainMat.alpha = 0.6;

			const stainLength = 0.3 + (rng ? rng.next() * 0.3 : 0.15);
			const stain = MeshBuilder.CreatePlane(
				`${id}_stain`,
				{ width: 0.15, height: stainLength },
				scene,
			);
			stain.position = new Vector3(
				posX + Math.sin(rotation) * 0.01,
				posY - (type === "window" ? 0.2 : 0.3) - stainLength / 2,
				posZ + Math.cos(rotation) * 0.01,
			);
			stain.rotation.y = rotation + Math.PI;
			stain.material = stainMat;
			meshes.push(stain);
		}

		// Rust/weathering
		if (condition < 0.6) {
			const rustMat = new PBRMaterial(`ac_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.5, 0.3, 0.15);
			rustMat.metallic = 0.3;
			rustMat.roughness = 0.95;

			const rustCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
			for (let r = 0; r < rustCount; r++) {
				const rustSize = 0.05 + (rng ? rng.next() * 0.05 : 0.03);
				const rx = (rng ? rng.next() - 0.5 : 0) * 0.3;
				const ry = (rng ? rng.next() - 0.5 : 0) * 0.2;

				const rust = MeshBuilder.CreateDisc(
					`${id}_rust_${r}`,
					{ radius: rustSize, tessellation: 8 },
					scene,
				);
				rust.position = new Vector3(
					posX - Math.sin(rotation) * 0.26 + Math.cos(rotation) * rx,
					posY + ry,
					posZ - Math.cos(rotation) * 0.26 - Math.sin(rotation) * rx,
				);
				rust.rotation.y = rotation;
				rust.material = rustMat;
				meshes.push(rust);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			bodyMat.dispose();
			ventMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		isRunning,
		hasDripStain,
		condition,
		rotation,
		seed,
	]);

	return null;
}
