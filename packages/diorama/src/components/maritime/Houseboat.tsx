/**
 * Houseboat - Floating residential structure
 *
 * Houseboats and floating homes for flooded urban environments.
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

export type HouseboatType =
	| "traditional"
	| "modern"
	| "shanty"
	| "luxury"
	| "converted";

export interface HouseboatProps {
	id: string;
	position: Vector3;
	/** Houseboat type */
	type?: HouseboatType;
	/** Length (z) */
	length?: number;
	/** Width (x) */
	width?: number;
	/** Number of stories */
	stories?: number;
	/** Has deck */
	hasDeck?: boolean;
	/** Has planter boxes */
	hasPlanters?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Houseboat({
	id,
	position,
	type = "traditional",
	length = 8,
	width = 3,
	stories = 1,
	hasDeck = true,
	hasPlanters = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: HouseboatProps) {
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
		const hullMat = new PBRMaterial(`houseboat_hull_${id}`, scene);
		const wallMat = new PBRMaterial(`houseboat_wall_${id}`, scene);
		const roofMat = new PBRMaterial(`houseboat_roof_${id}`, scene);
		const deckMat = new PBRMaterial(`houseboat_deck_${id}`, scene);
		const windowMat = new PBRMaterial(`houseboat_window_${id}`, scene);

		if (type === "traditional") {
			// Classic wooden houseboat
			hullMat.albedoColor = new Color3(0.25, 0.2, 0.15).scale(conditionFactor);
			hullMat.metallic = 0;
			hullMat.roughness = 0.85;
			wallMat.albedoColor = new Color3(0.85, 0.82, 0.75).scale(conditionFactor);
			wallMat.metallic = 0;
			wallMat.roughness = 0.7;
			roofMat.albedoColor = new Color3(0.35, 0.25, 0.2).scale(conditionFactor);
			roofMat.metallic = 0;
			roofMat.roughness = 0.8;
		} else if (type === "modern") {
			// Contemporary design
			hullMat.albedoColor = new Color3(0.15, 0.15, 0.18).scale(conditionFactor);
			hullMat.metallic = 0.6;
			hullMat.roughness = 0.4;
			wallMat.albedoColor = new Color3(0.9, 0.9, 0.92).scale(conditionFactor);
			wallMat.metallic = 0.1;
			wallMat.roughness = 0.3;
			roofMat.albedoColor = new Color3(0.2, 0.2, 0.22);
			roofMat.metallic = 0.7;
			roofMat.roughness = 0.35;
		} else if (type === "shanty") {
			// Makeshift floating home
			hullMat.albedoColor = new Color3(0.3, 0.28, 0.25).scale(
				conditionFactor * 0.7,
			);
			hullMat.metallic = 0.3;
			hullMat.roughness = 0.9;
			wallMat.albedoColor = new Color3(0.4, 0.35, 0.3).scale(
				conditionFactor * 0.8,
			);
			wallMat.metallic = 0.2;
			wallMat.roughness = 0.85;
			roofMat.albedoColor = new Color3(0.35, 0.32, 0.3).scale(
				conditionFactor * 0.7,
			);
			roofMat.metallic = 0.4;
			roofMat.roughness = 0.7;
		} else if (type === "luxury") {
			// High-end yacht-style
			hullMat.albedoColor = new Color3(0.95, 0.95, 0.97);
			hullMat.metallic = 0.3;
			hullMat.roughness = 0.2;
			wallMat.albedoColor = new Color3(0.2, 0.18, 0.15);
			wallMat.metallic = 0.4;
			wallMat.roughness = 0.3;
			roofMat.albedoColor = new Color3(0.15, 0.15, 0.18);
			roofMat.metallic = 0.5;
			roofMat.roughness = 0.25;
		} else {
			// Converted barge
			hullMat.albedoColor = new Color3(0.25, 0.3, 0.35).scale(conditionFactor);
			hullMat.metallic = 0.7;
			hullMat.roughness = 0.5;
			wallMat.albedoColor = new Color3(0.5, 0.45, 0.4).scale(conditionFactor);
			wallMat.metallic = 0.1;
			wallMat.roughness = 0.75;
			roofMat.albedoColor = new Color3(0.4, 0.38, 0.35).scale(conditionFactor);
			roofMat.metallic = 0.3;
			roofMat.roughness = 0.6;
		}

		deckMat.albedoColor = new Color3(0.45, 0.35, 0.25).scale(conditionFactor);
		deckMat.metallic = 0;
		deckMat.roughness = 0.8;

		windowMat.albedoColor = new Color3(0.4, 0.5, 0.6);
		windowMat.metallic = 0.1;
		windowMat.roughness = 0.1;
		windowMat.alpha = 0.7;

		// Hull
		const hullHeight = 0.6;
		const hull = MeshBuilder.CreateBox(
			`${id}_hull`,
			{ width: width, height: hullHeight, depth: length },
			scene,
		);
		hull.position = new Vector3(posX, posY + hullHeight / 2, posZ);
		hull.rotation.y = rotation;
		hull.material = hullMat;
		meshes.push(hull);

		// Cabin for each story
		const cabinHeight = 2.2;
		for (let s = 0; s < stories; s++) {
			const cabinWidth = width - 0.3 - s * 0.2;
			const cabinLength = length - 1.5 - s * 0.5;
			const cabinY = posY + hullHeight + s * cabinHeight + cabinHeight / 2;

			const cabin = MeshBuilder.CreateBox(
				`${id}_cabin_${s}`,
				{ width: cabinWidth, height: cabinHeight, depth: cabinLength },
				scene,
			);
			cabin.position = new Vector3(posX, cabinY, posZ);
			cabin.rotation.y = rotation;
			cabin.material = wallMat;
			meshes.push(cabin);

			// Windows on each side
			const windowCount = Math.floor(cabinLength / 1.5);
			for (let w = 0; w < windowCount; w++) {
				const wz = (w - (windowCount - 1) / 2) * 1.5;

				for (const side of [-1, 1]) {
					const window = MeshBuilder.CreateBox(
						`${id}_window_${s}_${w}_${side}`,
						{ width: 0.05, height: 0.6, depth: 0.8 },
						scene,
					);
					window.position = new Vector3(
						posX +
							Math.cos(rotation) * ((side * cabinWidth) / 2) -
							Math.sin(rotation) * wz,
						cabinY,
						posZ -
							Math.sin(rotation) * ((side * cabinWidth) / 2) -
							Math.cos(rotation) * wz,
					);
					window.rotation.y = rotation;
					window.material = windowMat;
					meshes.push(window);
				}
			}
		}

		// Roof
		const roofY = posY + hullHeight + stories * cabinHeight;
		const roof = MeshBuilder.CreateBox(
			`${id}_roof`,
			{ width: width - 0.2, height: 0.1, depth: length - 1.2 },
			scene,
		);
		roof.position = new Vector3(posX, roofY + 0.05, posZ);
		roof.rotation.y = rotation;
		roof.material = roofMat;
		meshes.push(roof);

		// Front deck
		if (hasDeck) {
			const deckLength = 1.5;
			const deck = MeshBuilder.CreateBox(
				`${id}_deck`,
				{ width: width - 0.2, height: 0.05, depth: deckLength },
				scene,
			);
			const deckZ = (length - deckLength) / 2 - 0.1;
			deck.position = new Vector3(
				posX - Math.sin(rotation) * deckZ,
				posY + hullHeight + 0.025,
				posZ - Math.cos(rotation) * deckZ,
			);
			deck.rotation.y = rotation;
			deck.material = deckMat;
			meshes.push(deck);

			// Deck railings
			const railMat = new PBRMaterial(`houseboat_rail_${id}`, scene);
			railMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
			railMat.metallic = 0.8;
			railMat.roughness = 0.4;

			for (const side of [-1, 1]) {
				const railing = MeshBuilder.CreateBox(
					`${id}_railing_${side}`,
					{ width: 0.04, height: 0.8, depth: deckLength },
					scene,
				);
				railing.position = new Vector3(
					posX +
						Math.cos(rotation) * (side * (width / 2 - 0.15)) -
						Math.sin(rotation) * deckZ,
					posY + hullHeight + 0.4,
					posZ -
						Math.sin(rotation) * (side * (width / 2 - 0.15)) -
						Math.cos(rotation) * deckZ,
				);
				railing.rotation.y = rotation;
				railing.material = railMat;
				meshes.push(railing);
			}
		}

		// Planter boxes
		if (hasPlanters) {
			const planterMat = new PBRMaterial(`houseboat_planter_${id}`, scene);
			planterMat.albedoColor = new Color3(0.4, 0.3, 0.2);
			planterMat.metallic = 0;
			planterMat.roughness = 0.85;

			const plantMat = new PBRMaterial(`houseboat_plant_${id}`, scene);
			plantMat.albedoColor = new Color3(0.2, 0.45, 0.15);
			plantMat.metallic = 0;
			plantMat.roughness = 0.9;

			const planterCount = 2 + (rng ? Math.floor(rng.next() * 2) : 0);
			for (let p = 0; p < planterCount; p++) {
				const px = ((p % 2) - 0.5) * (width - 0.8);
				const pz = (Math.floor(p / 2) - 0.5) * 1.5;

				const planter = MeshBuilder.CreateBox(
					`${id}_planter_${p}`,
					{ width: 0.4, height: 0.25, depth: 0.3 },
					scene,
				);
				planter.position = new Vector3(
					posX + Math.cos(rotation) * px - Math.sin(rotation) * pz,
					roofY + 0.125,
					posZ - Math.sin(rotation) * px - Math.cos(rotation) * pz,
				);
				planter.rotation.y = rotation;
				planter.material = planterMat;
				meshes.push(planter);

				// Plant
				const plant = MeshBuilder.CreateSphere(
					`${id}_plant_${p}`,
					{ diameter: 0.35, segments: 8 },
					scene,
				);
				plant.position = new Vector3(
					posX + Math.cos(rotation) * px - Math.sin(rotation) * pz,
					roofY + 0.35,
					posZ - Math.sin(rotation) * px - Math.cos(rotation) * pz,
				);
				plant.material = plantMat;
				meshes.push(plant);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			hullMat.dispose();
			wallMat.dispose();
			roofMat.dispose();
			deckMat.dispose();
			windowMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		length,
		width,
		stories,
		hasDeck,
		hasPlanters,
		condition,
		rotation,
		seed,
	]);

	return null;
}
