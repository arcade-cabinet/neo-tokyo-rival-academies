/**
 * Bench - Seating component
 *
 * Various bench types for parks, streets, and waiting areas.
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

export type BenchStyle =
	| "park"
	| "modern"
	| "japanese"
	| "concrete"
	| "bus_stop"
	| "stadium";
export type BenchCondition = "new" | "weathered" | "damaged" | "vandalized";

export interface BenchProps {
	id: string;
	position: Vector3;
	/** Bench style */
	style?: BenchStyle;
	/** Length of bench */
	length?: number;
	/** Has backrest */
	hasBackrest?: boolean;
	/** Has armrests */
	hasArmrests?: boolean;
	/** Condition */
	condition?: BenchCondition;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Bench({
	id,
	position,
	style = "park",
	length = 1.5,
	hasBackrest = true,
	hasArmrests = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: BenchProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const _rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor =
			condition === "new"
				? 1
				: condition === "weathered"
					? 0.85
					: condition === "damaged"
						? 0.7
						: 0.6;

		// Materials based on style
		const seatMat = new PBRMaterial(`bench_seat_${id}`, scene);
		const frameMat = new PBRMaterial(`bench_frame_${id}`, scene);

		const seatHeight = 0.45;
		const seatDepth = 0.4;
		const backHeight = 0.5;

		if (style === "park") {
			// Wood slats on metal frame
			seatMat.albedoColor = new Color3(
				0.45 * conditionFactor,
				0.32 * conditionFactor,
				0.18 * conditionFactor,
			);
			seatMat.metallic = 0;
			seatMat.roughness = 0.8;
			frameMat.albedoColor = new Color3(0.2, 0.25, 0.2).scale(conditionFactor);
			frameMat.metallic = 0.8;
			frameMat.roughness = 0.5;

			// Metal frame legs
			for (const side of [-1, 1]) {
				const legX = side * (length / 2 - 0.15);

				// Front leg
				const frontLeg = MeshBuilder.CreateBox(
					`${id}_frontLeg_${side}`,
					{ width: 0.05, height: seatHeight, depth: 0.05 },
					scene,
				);
				frontLeg.position = new Vector3(
					posX +
						Math.cos(rotation) * legX +
						Math.sin(rotation) * (seatDepth / 2 - 0.05),
					posY + seatHeight / 2,
					posZ -
						Math.sin(rotation) * legX +
						Math.cos(rotation) * (seatDepth / 2 - 0.05),
				);
				frontLeg.rotation.y = rotation;
				frontLeg.material = frameMat;
				meshes.push(frontLeg);

				// Back leg
				const backLeg = MeshBuilder.CreateBox(
					`${id}_backLeg_${side}`,
					{
						width: 0.05,
						height: hasBackrest ? seatHeight + backHeight : seatHeight,
						depth: 0.05,
					},
					scene,
				);
				backLeg.position = new Vector3(
					posX +
						Math.cos(rotation) * legX -
						Math.sin(rotation) * (seatDepth / 2 - 0.05),
					posY + (hasBackrest ? seatHeight + backHeight : seatHeight) / 2,
					posZ -
						Math.sin(rotation) * legX -
						Math.cos(rotation) * (seatDepth / 2 - 0.05),
				);
				backLeg.rotation.y = rotation;
				backLeg.material = frameMat;
				meshes.push(backLeg);
			}

			// Wood slats for seat
			const slatCount = Math.floor(length / 0.08);
			for (let i = 0; i < slatCount; i++) {
				const slatX = (i - (slatCount - 1) / 2) * 0.08;
				const slat = MeshBuilder.CreateBox(
					`${id}_seatSlat_${i}`,
					{ width: 0.06, height: 0.025, depth: seatDepth - 0.05 },
					scene,
				);
				slat.position = new Vector3(
					posX + Math.cos(rotation) * slatX,
					posY + seatHeight,
					posZ - Math.sin(rotation) * slatX,
				);
				slat.rotation.y = rotation;
				slat.material = seatMat;
				meshes.push(slat);
			}

			// Backrest slats
			if (hasBackrest) {
				for (let i = 0; i < slatCount; i++) {
					const slatX = (i - (slatCount - 1) / 2) * 0.08;
					const slat = MeshBuilder.CreateBox(
						`${id}_backSlat_${i}`,
						{ width: 0.06, height: backHeight - 0.1, depth: 0.02 },
						scene,
					);
					slat.position = new Vector3(
						posX +
							Math.cos(rotation) * slatX -
							Math.sin(rotation) * (seatDepth / 2 - 0.02),
						posY + seatHeight + backHeight / 2,
						posZ -
							Math.sin(rotation) * slatX -
							Math.cos(rotation) * (seatDepth / 2 - 0.02),
					);
					slat.rotation.y = rotation;
					slat.material = seatMat;
					meshes.push(slat);
				}
			}
		} else if (style === "modern") {
			// Sleek metal/composite design
			seatMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(conditionFactor);
			seatMat.metallic = 0.6;
			seatMat.roughness = 0.3;
			frameMat.albedoColor = new Color3(0.7, 0.72, 0.75).scale(conditionFactor);
			frameMat.metallic = 0.9;
			frameMat.roughness = 0.2;

			// Single piece seat
			const seat = MeshBuilder.CreateBox(
				`${id}_seat`,
				{ width: length, height: 0.05, depth: seatDepth },
				scene,
			);
			seat.position = new Vector3(posX, posY + seatHeight, posZ);
			seat.rotation.y = rotation;
			seat.material = seatMat;
			meshes.push(seat);

			// Metal support frame
			for (const side of [-1, 1]) {
				const legX = side * (length / 2 - 0.1);
				const leg = MeshBuilder.CreateBox(
					`${id}_leg_${side}`,
					{ width: 0.08, height: seatHeight, depth: seatDepth + 0.1 },
					scene,
				);
				leg.position = new Vector3(
					posX + Math.cos(rotation) * legX,
					posY + seatHeight / 2,
					posZ - Math.sin(rotation) * legX,
				);
				leg.rotation.y = rotation;
				leg.material = frameMat;
				meshes.push(leg);
			}

			// Curved backrest
			if (hasBackrest) {
				const back = MeshBuilder.CreateBox(
					`${id}_back`,
					{ width: length, height: backHeight, depth: 0.04 },
					scene,
				);
				back.position = new Vector3(
					posX - Math.sin(rotation) * (seatDepth / 2),
					posY + seatHeight + backHeight / 2,
					posZ - Math.cos(rotation) * (seatDepth / 2),
				);
				back.rotation.y = rotation;
				back.rotation.x = -0.15;
				back.material = seatMat;
				meshes.push(back);
			}
		} else if (style === "japanese") {
			// Simple wooden design
			seatMat.albedoColor = new Color3(
				0.55 * conditionFactor,
				0.42 * conditionFactor,
				0.25 * conditionFactor,
			);
			seatMat.metallic = 0;
			seatMat.roughness = 0.75;
			frameMat.albedoColor = new Color3(0.5, 0.38, 0.2).scale(conditionFactor);
			frameMat.metallic = 0;
			frameMat.roughness = 0.8;

			// Thick wooden seat
			const seat = MeshBuilder.CreateBox(
				`${id}_seat`,
				{ width: length, height: 0.06, depth: seatDepth },
				scene,
			);
			seat.position = new Vector3(posX, posY + seatHeight, posZ);
			seat.rotation.y = rotation;
			seat.material = seatMat;
			meshes.push(seat);

			// Tapered wooden legs
			for (const side of [-1, 1]) {
				const legX = side * (length / 2 - 0.12);
				for (const legZ of [-seatDepth / 2 + 0.08, seatDepth / 2 - 0.08]) {
					const leg = MeshBuilder.CreateCylinder(
						`${id}_leg_${side}_${legZ}`,
						{ height: seatHeight, diameterTop: 0.05, diameterBottom: 0.07 },
						scene,
					);
					leg.position = new Vector3(
						posX + Math.cos(rotation) * legX + Math.sin(rotation) * legZ,
						posY + seatHeight / 2,
						posZ - Math.sin(rotation) * legX + Math.cos(rotation) * legZ,
					);
					leg.material = frameMat;
					meshes.push(leg);
				}
			}

			// No backrest typically for Japanese style
		} else if (style === "concrete") {
			// Heavy concrete bench
			seatMat.albedoColor = new Color3(
				0.55 * conditionFactor,
				0.53 * conditionFactor,
				0.5 * conditionFactor,
			);
			seatMat.metallic = 0;
			seatMat.roughness = 0.9;

			// Solid concrete block
			const seat = MeshBuilder.CreateBox(
				`${id}_seat`,
				{ width: length, height: 0.15, depth: seatDepth + 0.1 },
				scene,
			);
			seat.position = new Vector3(posX, posY + seatHeight - 0.05, posZ);
			seat.rotation.y = rotation;
			seat.material = seatMat;
			meshes.push(seat);

			// Concrete supports
			for (const side of [-1, 1]) {
				const support = MeshBuilder.CreateBox(
					`${id}_support_${side}`,
					{ width: 0.2, height: seatHeight - 0.15, depth: seatDepth + 0.1 },
					scene,
				);
				support.position = new Vector3(
					posX + Math.cos(rotation) * (side * (length / 2 - 0.15)),
					posY + (seatHeight - 0.15) / 2,
					posZ - Math.sin(rotation) * (side * (length / 2 - 0.15)),
				);
				support.rotation.y = rotation;
				support.material = seatMat;
				meshes.push(support);
			}
		} else if (style === "bus_stop") {
			// Simple metal bench with perforated seat
			seatMat.albedoColor = new Color3(0.35, 0.35, 0.38).scale(conditionFactor);
			seatMat.metallic = 0.85;
			seatMat.roughness = 0.35;
			frameMat.albedoColor = new Color3(0.25, 0.25, 0.28).scale(
				conditionFactor,
			);
			frameMat.metallic = 0.9;
			frameMat.roughness = 0.3;

			// Seat
			const seat = MeshBuilder.CreateBox(
				`${id}_seat`,
				{ width: length, height: 0.03, depth: seatDepth },
				scene,
			);
			seat.position = new Vector3(posX, posY + seatHeight, posZ);
			seat.rotation.y = rotation;
			seat.material = seatMat;
			meshes.push(seat);

			// Single leg supports
			for (const side of [-1, 1]) {
				const leg = MeshBuilder.CreateCylinder(
					`${id}_leg_${side}`,
					{ height: seatHeight, diameter: 0.05 },
					scene,
				);
				leg.position = new Vector3(
					posX + Math.cos(rotation) * (side * (length / 2 - 0.1)),
					posY + seatHeight / 2,
					posZ - Math.sin(rotation) * (side * (length / 2 - 0.1)),
				);
				leg.material = frameMat;
				meshes.push(leg);
			}

			// Backrest
			if (hasBackrest) {
				const back = MeshBuilder.CreateBox(
					`${id}_back`,
					{ width: length, height: backHeight * 0.8, depth: 0.02 },
					scene,
				);
				back.position = new Vector3(
					posX - Math.sin(rotation) * (seatDepth / 2 - 0.05),
					posY + seatHeight + backHeight * 0.4,
					posZ - Math.cos(rotation) * (seatDepth / 2 - 0.05),
				);
				back.rotation.y = rotation;
				back.material = seatMat;
				meshes.push(back);
			}
		} else if (style === "stadium") {
			// Plastic stadium seat
			seatMat.albedoColor = new Color3(0.1, 0.3, 0.6).scale(conditionFactor);
			seatMat.metallic = 0.1;
			seatMat.roughness = 0.6;
			frameMat.albedoColor = new Color3(0.6, 0.6, 0.62).scale(conditionFactor);
			frameMat.metallic = 0.8;
			frameMat.roughness = 0.4;

			// Molded plastic seat
			const seat = MeshBuilder.CreateBox(
				`${id}_seat`,
				{ width: length, height: 0.04, depth: seatDepth },
				scene,
			);
			seat.position = new Vector3(posX, posY + seatHeight, posZ);
			seat.rotation.y = rotation;
			seat.material = seatMat;
			meshes.push(seat);

			// Back
			const back = MeshBuilder.CreateBox(
				`${id}_back`,
				{ width: length, height: backHeight, depth: 0.03 },
				scene,
			);
			back.position = new Vector3(
				posX - Math.sin(rotation) * (seatDepth / 2),
				posY + seatHeight + backHeight / 2,
				posZ - Math.cos(rotation) * (seatDepth / 2),
			);
			back.rotation.y = rotation;
			back.rotation.x = -0.1;
			back.material = seatMat;
			meshes.push(back);

			// Metal frame
			const frame = MeshBuilder.CreateCylinder(
				`${id}_frame`,
				{ height: seatHeight, diameter: 0.04 },
				scene,
			);
			frame.position = new Vector3(posX, posY + seatHeight / 2, posZ);
			frame.material = frameMat;
			meshes.push(frame);
		}

		// Armrests
		if (
			hasArmrests &&
			(style === "park" || style === "modern" || style === "bus_stop")
		) {
			const armMat = new PBRMaterial(`bench_arm_${id}`, scene);
			armMat.albedoColor = frameMat.albedoColor;
			armMat.metallic = frameMat.metallic;
			armMat.roughness = frameMat.roughness;

			for (const side of [-1, 1]) {
				const armX = side * (length / 2 - 0.05);
				const arm = MeshBuilder.CreateBox(
					`${id}_arm_${side}`,
					{ width: 0.05, height: 0.05, depth: seatDepth - 0.1 },
					scene,
				);
				arm.position = new Vector3(
					posX + Math.cos(rotation) * armX,
					posY + seatHeight + 0.2,
					posZ - Math.sin(rotation) * armX,
				);
				arm.rotation.y = rotation;
				arm.material = armMat;
				meshes.push(arm);

				// Arm support
				const armSupport = MeshBuilder.CreateBox(
					`${id}_armSupport_${side}`,
					{ width: 0.04, height: 0.2, depth: 0.04 },
					scene,
				);
				armSupport.position = new Vector3(
					posX +
						Math.cos(rotation) * armX +
						Math.sin(rotation) * (seatDepth / 2 - 0.1),
					posY + seatHeight + 0.1,
					posZ -
						Math.sin(rotation) * armX +
						Math.cos(rotation) * (seatDepth / 2 - 0.1),
				);
				armSupport.rotation.y = rotation;
				armSupport.material = armMat;
				meshes.push(armSupport);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			seatMat.dispose();
			frameMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		style,
		length,
		hasBackrest,
		hasArmrests,
		condition,
		rotation,
		seed,
	]);

	return null;
}
