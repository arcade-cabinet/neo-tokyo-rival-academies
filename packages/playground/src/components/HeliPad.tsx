/**
 * HeliPad - Helicopter landing pads
 *
 * Rooftop helicopter landing areas.
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

export type HeliPadType = "hospital" | "corporate" | "military" | "emergency";

export interface HeliPadProps {
	id: string;
	position: Vector3;
	/** Pad type */
	type?: HeliPadType;
	/** Diameter */
	diameter?: number;
	/** Has lights */
	hasLights?: boolean;
	/** Lights are on */
	lightsOn?: boolean;
	/** Has windsock */
	hasWindsock?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function HeliPad({
	id,
	position,
	type = "corporate",
	diameter = 10,
	hasLights = true,
	lightsOn = false,
	hasWindsock = true,
	condition = 0.8,
	rotation = 0,
	seed,
}: HeliPadProps) {
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

		// Pad surface material
		const padMat = new PBRMaterial(`helipad_${id}`, scene);
		padMat.albedoColor = new Color3(0.35, 0.37, 0.4).scale(conditionFactor);
		padMat.metallic = 0.1;
		padMat.roughness = 0.85;

		// Main pad
		const pad = MeshBuilder.CreateCylinder(
			`${id}_pad`,
			{ height: 0.15, diameter: diameter, tessellation: 32 },
			scene
		);
		pad.position = new Vector3(posX, posY + 0.075, posZ);
		pad.material = padMat;
		meshes.push(pad);

		// H or cross marking
		const markingMat = new PBRMaterial(`helipad_marking_${id}`, scene);

		switch (type) {
			case "hospital":
				markingMat.albedoColor = new Color3(0.85, 0.15, 0.1).scale(conditionFactor);
				break;
			case "corporate":
				markingMat.albedoColor = new Color3(0.95, 0.95, 0.95).scale(conditionFactor);
				break;
			case "military":
				markingMat.albedoColor = new Color3(0.3, 0.35, 0.25).scale(conditionFactor);
				break;
			case "emergency":
				markingMat.albedoColor = new Color3(0.95, 0.6, 0.1).scale(conditionFactor);
				break;
		}
		markingMat.metallic = 0;
		markingMat.roughness = 0.7;

		// H shape
		const hWidth = diameter * 0.4;
		const hHeight = diameter * 0.5;
		const hThickness = diameter * 0.08;

		// Vertical bars of H
		for (const side of [-1, 1]) {
			const vBar = MeshBuilder.CreateBox(
				`${id}_hbar_v_${side}`,
				{ width: hThickness, height: 0.02, depth: hHeight },
				scene
			);
			vBar.position = new Vector3(
				posX + Math.cos(rotation) * (side * hWidth / 2),
				posY + 0.16,
				posZ - Math.sin(rotation) * (side * hWidth / 2)
			);
			vBar.rotation.y = rotation;
			vBar.material = markingMat;
			meshes.push(vBar);
		}

		// Horizontal bar of H
		const hBar = MeshBuilder.CreateBox(
			`${id}_hbar_h`,
			{ width: hWidth + hThickness, height: 0.02, depth: hThickness },
			scene
		);
		hBar.position = new Vector3(posX, posY + 0.16, posZ);
		hBar.rotation.y = rotation;
		hBar.material = markingMat;
		meshes.push(hBar);

		// Circle marking
		const circleMat = new PBRMaterial(`helipad_circle_${id}`, scene);
		circleMat.albedoColor = markingMat.albedoColor;
		circleMat.metallic = 0;
		circleMat.roughness = 0.7;

		const circleInner = MeshBuilder.CreateTorus(
			`${id}_circle`,
			{ diameter: diameter * 0.75, thickness: diameter * 0.03, tessellation: 32 },
			scene
		);
		circleInner.position = new Vector3(posX, posY + 0.16, posZ);
		circleInner.rotation.x = Math.PI / 2;
		circleInner.material = circleMat;
		meshes.push(circleInner);

		// Edge lights
		if (hasLights) {
			const lightMat = new PBRMaterial(`helipad_light_${id}`, scene);
			if (lightsOn) {
				lightMat.albedoColor = new Color3(0.2, 0.9, 0.2);
				lightMat.emissiveColor = new Color3(0.1, 0.6, 0.1);
			} else {
				lightMat.albedoColor = new Color3(0.3, 0.35, 0.3);
			}
			lightMat.metallic = 0.3;
			lightMat.roughness = 0.4;

			const lightCount = 12;
			for (let l = 0; l < lightCount; l++) {
				const lightAngle = (l / lightCount) * Math.PI * 2 + rotation;
				const lightRadius = diameter / 2 - 0.2;

				const light = MeshBuilder.CreateCylinder(
					`${id}_light_${l}`,
					{ height: 0.1, diameter: 0.15, tessellation: 8 },
					scene
				);
				light.position = new Vector3(
					posX + Math.cos(lightAngle) * lightRadius,
					posY + 0.2,
					posZ + Math.sin(lightAngle) * lightRadius
				);
				light.material = lightMat;
				meshes.push(light);
			}

			// Approach lights (if corporate or emergency)
			if (type === "corporate" || type === "emergency") {
				const approachMat = new PBRMaterial(`helipad_approach_${id}`, scene);
				if (lightsOn) {
					approachMat.albedoColor = new Color3(0.9, 0.85, 0.2);
					approachMat.emissiveColor = new Color3(0.6, 0.55, 0.1);
				} else {
					approachMat.albedoColor = new Color3(0.4, 0.38, 0.2);
				}
				approachMat.metallic = 0.3;
				approachMat.roughness = 0.4;

				for (let a = 1; a <= 3; a++) {
					const approachLight = MeshBuilder.CreateCylinder(
						`${id}_approach_${a}`,
						{ height: 0.08, diameter: 0.12, tessellation: 8 },
						scene
					);
					approachLight.position = new Vector3(
						posX - Math.sin(rotation) * (diameter / 2 + a * 0.8),
						posY + 0.19,
						posZ - Math.cos(rotation) * (diameter / 2 + a * 0.8)
					);
					approachLight.material = approachMat;
					meshes.push(approachLight);
				}
			}
		}

		// Windsock
		if (hasWindsock) {
			const poleMat = new PBRMaterial(`helipad_pole_${id}`, scene);
			poleMat.albedoColor = new Color3(0.5, 0.52, 0.55);
			poleMat.metallic = 0.7;
			poleMat.roughness = 0.4;

			const sockMat = new PBRMaterial(`helipad_sock_${id}`, scene);
			sockMat.albedoColor = new Color3(0.95, 0.5, 0.1);
			sockMat.metallic = 0;
			sockMat.roughness = 0.7;

			const poleHeight = 2;
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole`,
				{ height: poleHeight, diameter: 0.05 },
				scene
			);
			pole.position = new Vector3(
				posX + Math.cos(rotation + Math.PI / 4) * (diameter / 2 + 1),
				posY + poleHeight / 2,
				posZ - Math.sin(rotation + Math.PI / 4) * (diameter / 2 + 1)
			);
			pole.material = poleMat;
			meshes.push(pole);

			// Windsock cone
			const sockLength = 0.6;
			const sock = MeshBuilder.CreateCylinder(
				`${id}_sock`,
				{ height: sockLength, diameterTop: 0.05, diameterBottom: 0.15, tessellation: 8 },
				scene
			);
			sock.position = new Vector3(
				posX + Math.cos(rotation + Math.PI / 4) * (diameter / 2 + 1) + sockLength / 2,
				posY + poleHeight - 0.1,
				posZ - Math.sin(rotation + Math.PI / 4) * (diameter / 2 + 1)
			);
			sock.rotation.z = Math.PI / 2;
			sock.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.5 : 0);
			sock.material = sockMat;
			meshes.push(sock);

			// Stripes on windsock
			const stripeMat = new PBRMaterial(`helipad_stripe_${id}`, scene);
			stripeMat.albedoColor = new Color3(0.95, 0.95, 0.95);
			stripeMat.metallic = 0;
			stripeMat.roughness = 0.7;

			for (let s = 0; s < 2; s++) {
				const stripe = MeshBuilder.CreateTorus(
					`${id}_sockstripe_${s}`,
					{ diameter: 0.12 - s * 0.03, thickness: 0.02, tessellation: 8 },
					scene
				);
				stripe.position = new Vector3(
					sock.position.x - (0.15 + s * 0.15),
					sock.position.y,
					sock.position.z
				);
				stripe.rotation.z = Math.PI / 2;
				stripe.material = stripeMat;
				meshes.push(stripe);
			}
		}

		// Safety perimeter
		const perimeterMat = new PBRMaterial(`helipad_perimeter_${id}`, scene);
		perimeterMat.albedoColor = new Color3(0.9, 0.85, 0.1).scale(conditionFactor);
		perimeterMat.metallic = 0;
		perimeterMat.roughness = 0.7;

		const segmentCount = 16;
		for (let seg = 0; seg < segmentCount; seg++) {
			if (seg % 2 === 0) {
				const segAngle = (seg / segmentCount) * Math.PI * 2;
				const nextAngle = ((seg + 1) / segmentCount) * Math.PI * 2;
				const arcLength = (diameter / 2) * (nextAngle - segAngle);

				const segment = MeshBuilder.CreateBox(
					`${id}_perimeter_${seg}`,
					{ width: arcLength, height: 0.02, depth: 0.1 },
					scene
				);
				segment.position = new Vector3(
					posX + Math.cos(segAngle + (nextAngle - segAngle) / 2) * (diameter / 2 + 0.3),
					posY + 0.16,
					posZ + Math.sin(segAngle + (nextAngle - segAngle) / 2) * (diameter / 2 + 0.3)
				);
				segment.rotation.y = -segAngle - Math.PI / 2;
				segment.material = perimeterMat;
				meshes.push(segment);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			padMat.dispose();
			markingMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, diameter, hasLights, lightsOn, hasWindsock, condition, rotation, seed]);

	return null;
}
