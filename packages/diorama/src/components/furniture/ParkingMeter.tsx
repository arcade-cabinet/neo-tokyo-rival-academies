/**
 * ParkingMeter - Urban parking meter component
 *
 * Various parking meter styles for the flooded neo-tokyo city.
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

export type MeterType = "single" | "double" | "digital" | "solar";
export type MeterCondition = "new" | "weathered" | "rusted" | "damaged";

export interface ParkingMeterProps {
	id: string;
	position: Vector3;
	/** Meter type/style */
	type?: MeterType;
	/** Whether the meter shows expired */
	isExpired?: boolean;
	/** Whether the meter is broken/non-functional */
	isBroken?: boolean;
	/** Visual condition */
	condition?: MeterCondition;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function ParkingMeter({
	id,
	position,
	type = "single",
	isExpired = false,
	isBroken = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: ParkingMeterProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

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
					: condition === "rusted"
						? 0.65
						: 0.5;

		// Materials
		const poleMat = new PBRMaterial(`meter_pole_${id}`, scene);
		poleMat.albedoColor = new Color3(0.4, 0.4, 0.42).scale(conditionFactor);
		poleMat.metallic = 0.85;
		poleMat.roughness = condition === "rusted" ? 0.7 : 0.4;

		const bodyMat = new PBRMaterial(`meter_body_${id}`, scene);
		bodyMat.albedoColor = new Color3(0.35, 0.35, 0.38).scale(conditionFactor);
		bodyMat.metallic = 0.75;
		bodyMat.roughness = 0.45;

		const displayMat = new PBRMaterial(`meter_display_${id}`, scene);
		if (isBroken) {
			displayMat.albedoColor = new Color3(0.2, 0.2, 0.22);
		} else if (isExpired) {
			displayMat.albedoColor = new Color3(0.9, 0.2, 0.1);
			displayMat.emissiveColor = new Color3(0.9, 0.2, 0.1).scale(0.3);
		} else {
			displayMat.albedoColor = new Color3(0.1, 0.8, 0.2);
			displayMat.emissiveColor = new Color3(0.1, 0.8, 0.2).scale(0.3);
		}
		displayMat.metallic = 0.1;
		displayMat.roughness = 0.3;

		const glassMat = new PBRMaterial(`meter_glass_${id}`, scene);
		glassMat.albedoColor = new Color3(0.7, 0.75, 0.8);
		glassMat.metallic = 0.05;
		glassMat.roughness = 0.1;
		glassMat.alpha = isBroken ? 0.3 : 0.6;

		const poleHeight = 1.0;
		const meterHeight = 0.35;

		if (type === "single") {
			// Classic single-head parking meter
			const poleRadius = 0.03;

			// Pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: poleHeight, diameter: poleRadius * 2 },
				scene,
			);
			pole.position = new Vector3(posX, posY + poleHeight / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Meter head body
			const head = MeshBuilder.CreateBox(
				`${id}_head`,
				{ width: 0.12, height: meterHeight, depth: 0.1 },
				scene,
			);
			head.position = new Vector3(
				posX + Math.sin(rotation) * 0.02,
				posY + poleHeight + meterHeight / 2,
				posZ + Math.cos(rotation) * 0.02,
			);
			head.rotation.y = rotation;
			head.material = bodyMat;
			meshes.push(head);

			// Display window
			const display = MeshBuilder.CreateBox(
				`${id}_display`,
				{ width: 0.08, height: 0.12, depth: 0.01 },
				scene,
			);
			display.position = new Vector3(
				posX + Math.sin(rotation) * 0.06,
				posY + poleHeight + meterHeight / 2 + 0.05,
				posZ + Math.cos(rotation) * 0.06,
			);
			display.rotation.y = rotation;
			display.material = glassMat;
			meshes.push(display);

			// Display backing
			const displayBack = MeshBuilder.CreateBox(
				`${id}_displayBack`,
				{ width: 0.07, height: 0.1, depth: 0.005 },
				scene,
			);
			displayBack.position = new Vector3(
				posX + Math.sin(rotation) * 0.055,
				posY + poleHeight + meterHeight / 2 + 0.05,
				posZ + Math.cos(rotation) * 0.055,
			);
			displayBack.rotation.y = rotation;
			displayBack.material = displayMat;
			meshes.push(displayBack);

			// Coin slot
			const slotMat = new PBRMaterial(`meter_slot_${id}`, scene);
			slotMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			slotMat.metallic = 0.9;
			slotMat.roughness = 0.3;

			const slot = MeshBuilder.CreateBox(
				`${id}_slot`,
				{ width: 0.04, height: 0.005, depth: 0.02 },
				scene,
			);
			slot.position = new Vector3(
				posX + Math.sin(rotation) * 0.065,
				posY + poleHeight + meterHeight - 0.05,
				posZ + Math.cos(rotation) * 0.065,
			);
			slot.rotation.y = rotation;
			slot.material = slotMat;
			meshes.push(slot);

			// Turn knob
			const knob = MeshBuilder.CreateCylinder(
				`${id}_knob`,
				{ height: 0.02, diameter: 0.03 },
				scene,
			);
			knob.position = new Vector3(
				posX + Math.sin(rotation + Math.PI / 2) * 0.07,
				posY + poleHeight + meterHeight / 2,
				posZ + Math.cos(rotation + Math.PI / 2) * 0.07,
			);
			knob.rotation.z = Math.PI / 2;
			knob.rotation.y = rotation;
			knob.material = bodyMat;
			meshes.push(knob);
		} else if (type === "double") {
			// Double-head parking meter
			const poleRadius = 0.035;

			// Main pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: poleHeight, diameter: poleRadius * 2 },
				scene,
			);
			pole.position = new Vector3(posX, posY + poleHeight / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Cross bar
			const crossBar = MeshBuilder.CreateCylinder(
				`${id}_crossBar`,
				{ height: 0.3, diameter: poleRadius * 1.5 },
				scene,
			);
			crossBar.position = new Vector3(posX, posY + poleHeight, posZ);
			crossBar.rotation.z = Math.PI / 2;
			crossBar.rotation.y = rotation;
			crossBar.material = poleMat;
			meshes.push(crossBar);

			// Two meter heads
			for (const side of [-1, 1]) {
				const offsetX = Math.cos(rotation) * (side * 0.12);
				const offsetZ = -Math.sin(rotation) * (side * 0.12);

				// Meter head body
				const head = MeshBuilder.CreateCylinder(
					`${id}_head_${side}`,
					{ height: meterHeight, diameterTop: 0.08, diameterBottom: 0.1 },
					scene,
				);
				head.position = new Vector3(
					posX + offsetX,
					posY + poleHeight + meterHeight / 2,
					posZ + offsetZ,
				);
				head.material = bodyMat;
				meshes.push(head);

				// Display dome
				const dome = MeshBuilder.CreateSphere(
					`${id}_dome_${side}`,
					{ diameter: 0.08, slice: 0.5 },
					scene,
				);
				dome.position = new Vector3(
					posX + offsetX + Math.sin(rotation + (side * Math.PI) / 2) * 0.04,
					posY + poleHeight + meterHeight / 2,
					posZ + offsetZ + Math.cos(rotation + (side * Math.PI) / 2) * 0.04,
				);
				dome.rotation.z = (-side * Math.PI) / 2;
				dome.rotation.y = rotation;
				dome.material = glassMat;
				meshes.push(dome);

				// Status indicator
				const indicator = MeshBuilder.CreateDisc(
					`${id}_indicator_${side}`,
					{ radius: 0.025 },
					scene,
				);
				indicator.position = new Vector3(
					posX + offsetX + Math.sin(rotation + (side * Math.PI) / 2) * 0.045,
					posY + poleHeight + meterHeight / 2,
					posZ + offsetZ + Math.cos(rotation + (side * Math.PI) / 2) * 0.045,
				);
				indicator.rotation.y = rotation + (side * Math.PI) / 2 + Math.PI / 2;
				const indicatorMat = new PBRMaterial(
					`meter_indicator_${id}_${side}`,
					scene,
				);
				const isThisExpired = rng ? rng.next() > 0.5 : isExpired;
				if (isBroken) {
					indicatorMat.albedoColor = new Color3(0.2, 0.2, 0.22);
				} else if (isThisExpired) {
					indicatorMat.albedoColor = new Color3(0.9, 0.2, 0.1);
					indicatorMat.emissiveColor = new Color3(0.9, 0.2, 0.1).scale(0.4);
				} else {
					indicatorMat.albedoColor = new Color3(0.1, 0.8, 0.2);
					indicatorMat.emissiveColor = new Color3(0.1, 0.8, 0.2).scale(0.4);
				}
				indicatorMat.metallic = 0;
				indicatorMat.roughness = 0.3;
				indicator.material = indicatorMat;
				meshes.push(indicator);

				// Top cap
				const cap = MeshBuilder.CreateCylinder(
					`${id}_cap_${side}`,
					{ height: 0.03, diameter: 0.06 },
					scene,
				);
				cap.position = new Vector3(
					posX + offsetX,
					posY + poleHeight + meterHeight + 0.015,
					posZ + offsetZ,
				);
				cap.material = bodyMat;
				meshes.push(cap);
			}
		} else if (type === "digital") {
			// Modern digital parking meter/kiosk
			const poleRadius = 0.04;
			const kioskHeight = 0.5;

			// Pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: poleHeight * 0.8, diameter: poleRadius * 2 },
				scene,
			);
			pole.position = new Vector3(posX, posY + (poleHeight * 0.8) / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Kiosk body
			const kiosk = MeshBuilder.CreateBox(
				`${id}_kiosk`,
				{ width: 0.2, height: kioskHeight, depth: 0.12 },
				scene,
			);
			kiosk.position = new Vector3(
				posX + Math.sin(rotation) * 0.03,
				posY + poleHeight * 0.8 + kioskHeight / 2,
				posZ + Math.cos(rotation) * 0.03,
			);
			kiosk.rotation.y = rotation;
			kiosk.material = bodyMat;
			meshes.push(kiosk);

			// Digital screen
			const screenMat = new PBRMaterial(`meter_screen_${id}`, scene);
			if (isBroken) {
				screenMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			} else {
				screenMat.albedoColor = new Color3(0.1, 0.15, 0.2);
				screenMat.emissiveColor = new Color3(0.2, 0.4, 0.8).scale(0.5);
			}
			screenMat.metallic = 0.1;
			screenMat.roughness = 0.2;

			const screen = MeshBuilder.CreateBox(
				`${id}_screen`,
				{ width: 0.15, height: 0.2, depth: 0.01 },
				scene,
			);
			screen.position = new Vector3(
				posX + Math.sin(rotation) * 0.1,
				posY + poleHeight * 0.8 + kioskHeight / 2 + 0.08,
				posZ + Math.cos(rotation) * 0.1,
			);
			screen.rotation.y = rotation;
			screen.material = screenMat;
			meshes.push(screen);

			// Keypad
			const keypadMat = new PBRMaterial(`meter_keypad_${id}`, scene);
			keypadMat.albedoColor = new Color3(0.25, 0.25, 0.27);
			keypadMat.metallic = 0.7;
			keypadMat.roughness = 0.5;

			const keypad = MeshBuilder.CreateBox(
				`${id}_keypad`,
				{ width: 0.1, height: 0.08, depth: 0.015 },
				scene,
			);
			keypad.position = new Vector3(
				posX + Math.sin(rotation) * 0.1,
				posY + poleHeight * 0.8 + kioskHeight / 2 - 0.12,
				posZ + Math.cos(rotation) * 0.1,
			);
			keypad.rotation.y = rotation;
			keypad.rotation.x = -0.3;
			keypad.material = keypadMat;
			meshes.push(keypad);

			// Card slot
			const cardSlot = MeshBuilder.CreateBox(
				`${id}_cardSlot`,
				{ width: 0.06, height: 0.003, depth: 0.02 },
				scene,
			);
			cardSlot.position = new Vector3(
				posX + Math.sin(rotation) * 0.1,
				posY + poleHeight * 0.8 + kioskHeight / 2 - 0.02,
				posZ + Math.cos(rotation) * 0.1,
			);
			cardSlot.rotation.y = rotation;
			const slotMat = new PBRMaterial(`meter_cardslot_${id}`, scene);
			slotMat.albedoColor = new Color3(0.05, 0.05, 0.07);
			slotMat.metallic = 0.9;
			slotMat.roughness = 0.2;
			cardSlot.material = slotMat;
			meshes.push(cardSlot);

			// Status LED
			const led = MeshBuilder.CreateSphere(
				`${id}_led`,
				{ diameter: 0.015 },
				scene,
			);
			led.position = new Vector3(
				posX + Math.sin(rotation) * 0.1,
				posY + poleHeight * 0.8 + kioskHeight - 0.03,
				posZ + Math.cos(rotation) * 0.1,
			);
			led.material = displayMat;
			meshes.push(led);
		} else if (type === "solar") {
			// Solar-powered parking meter
			const poleRadius = 0.035;
			const kioskHeight = 0.4;

			// Pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: poleHeight, diameter: poleRadius * 2 },
				scene,
			);
			pole.position = new Vector3(posX, posY + poleHeight / 2, posZ);
			pole.material = poleMat;
			meshes.push(pole);

			// Meter body
			const body = MeshBuilder.CreateBox(
				`${id}_body`,
				{ width: 0.18, height: kioskHeight, depth: 0.1 },
				scene,
			);
			body.position = new Vector3(
				posX + Math.sin(rotation) * 0.02,
				posY + poleHeight + kioskHeight / 2,
				posZ + Math.cos(rotation) * 0.02,
			);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Solar panel
			const solarMat = new PBRMaterial(`meter_solar_${id}`, scene);
			solarMat.albedoColor = new Color3(0.1, 0.12, 0.2);
			solarMat.metallic = 0.6;
			solarMat.roughness = 0.2;

			const solarPanel = MeshBuilder.CreateBox(
				`${id}_solar`,
				{ width: 0.2, height: 0.01, depth: 0.15 },
				scene,
			);
			solarPanel.position = new Vector3(
				posX - Math.sin(rotation) * 0.02,
				posY + poleHeight + kioskHeight + 0.05,
				posZ - Math.cos(rotation) * 0.02,
			);
			solarPanel.rotation.y = rotation;
			solarPanel.rotation.x = -0.4; // Tilted for sun
			solarPanel.material = solarMat;
			meshes.push(solarPanel);

			// Solar panel frame
			const frameWidth = 0.22;
			const frameDepth = 0.17;
			for (const [dx, dz, w, d] of [
				[-frameWidth / 2, 0, 0.01, frameDepth],
				[frameWidth / 2, 0, 0.01, frameDepth],
				[0, -frameDepth / 2, frameWidth, 0.01],
				[0, frameDepth / 2, frameWidth, 0.01],
			] as const) {
				const framePiece = MeshBuilder.CreateBox(
					`${id}_frame_${dx}_${dz}`,
					{ width: w, height: 0.015, depth: d },
					scene,
				);
				framePiece.position = new Vector3(
					posX -
						Math.sin(rotation) * 0.02 +
						Math.cos(rotation) * dx -
						Math.sin(rotation) * dz * Math.cos(0.4),
					posY + poleHeight + kioskHeight + 0.05 + dz * Math.sin(0.4),
					posZ -
						Math.cos(rotation) * 0.02 -
						Math.sin(rotation) * dx -
						Math.cos(rotation) * dz * Math.cos(0.4),
				);
				framePiece.rotation.y = rotation;
				framePiece.rotation.x = -0.4;
				framePiece.material = poleMat;
				meshes.push(framePiece);
			}

			// Display
			const display = MeshBuilder.CreateBox(
				`${id}_display`,
				{ width: 0.12, height: 0.15, depth: 0.01 },
				scene,
			);
			display.position = new Vector3(
				posX + Math.sin(rotation) * 0.07,
				posY + poleHeight + kioskHeight / 2 + 0.06,
				posZ + Math.cos(rotation) * 0.07,
			);
			display.rotation.y = rotation;
			display.material = glassMat;
			meshes.push(display);

			// Display content
			const displayContent = MeshBuilder.CreateBox(
				`${id}_displayContent`,
				{ width: 0.1, height: 0.12, depth: 0.005 },
				scene,
			);
			displayContent.position = new Vector3(
				posX + Math.sin(rotation) * 0.065,
				posY + poleHeight + kioskHeight / 2 + 0.06,
				posZ + Math.cos(rotation) * 0.065,
			);
			displayContent.rotation.y = rotation;
			displayContent.material = displayMat;
			meshes.push(displayContent);

			// Coin slot
			const coinSlot = MeshBuilder.CreateBox(
				`${id}_coinSlot`,
				{ width: 0.03, height: 0.004, depth: 0.015 },
				scene,
			);
			coinSlot.position = new Vector3(
				posX + Math.sin(rotation) * 0.07,
				posY + poleHeight + kioskHeight / 2 - 0.08,
				posZ + Math.cos(rotation) * 0.07,
			);
			coinSlot.rotation.y = rotation;
			const slotMat = new PBRMaterial(`meter_coinslot_${id}`, scene);
			slotMat.albedoColor = new Color3(0.05, 0.05, 0.07);
			slotMat.metallic = 0.9;
			slotMat.roughness = 0.2;
			coinSlot.material = slotMat;
			meshes.push(coinSlot);
		}

		// Damage effects
		if (isBroken && rng) {
			// Crack in display
			const crackMat = new PBRMaterial(`meter_crack_${id}`, scene);
			crackMat.albedoColor = new Color3(0.15, 0.15, 0.17);
			crackMat.metallic = 0;
			crackMat.roughness = 0.9;

			const crackCount = 2 + Math.floor(rng.next() * 3);
			for (let i = 0; i < crackCount; i++) {
				const crack = MeshBuilder.CreateBox(
					`${id}_crack_${i}`,
					{
						width: 0.002,
						height: 0.03 + rng.next() * 0.05,
						depth: 0.001,
					},
					scene,
				);
				const yOffset = type === "digital" ? 0.08 : 0.05;
				crack.position = new Vector3(
					posX + Math.sin(rotation) * 0.08 + (rng.next() - 0.5) * 0.06,
					posY +
						poleHeight +
						meterHeight / 2 +
						yOffset +
						(rng.next() - 0.5) * 0.08,
					posZ + Math.cos(rotation) * 0.08,
				);
				crack.rotation.y = rotation;
				crack.rotation.z = ((rng.next() - 0.5) * Math.PI) / 3;
				crack.material = crackMat;
				meshes.push(crack);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			poleMat.dispose();
			bodyMat.dispose();
			displayMat.dispose();
			glassMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		isExpired,
		isBroken,
		condition,
		rotation,
		seed,
	]);

	return null;
}
