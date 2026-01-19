/**
 * FloatingPlatform - Water-based platform component
 *
 * Platforms that float on water for flooded urban environments.
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

export type FloatingPlatformType = "dock" | "raft" | "barge" | "modular";

export interface FloatingPlatformProps {
	id: string;
	position: Vector3;
	/** Platform type */
	type?: FloatingPlatformType;
	/** Width (x) */
	width?: number;
	/** Depth (z) */
	depth?: number;
	/** Has railings */
	hasRailings?: boolean;
	/** Has mooring points */
	hasMooring?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function FloatingPlatform({
	id,
	position,
	type = "dock",
	width = 3,
	depth = 4,
	hasRailings = false,
	hasMooring = true,
	condition = 0.8,
	rotation = 0,
	seed,
}: FloatingPlatformProps) {
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
		const deckMat = new PBRMaterial(`floatplat_deck_${id}`, scene);
		const frameMat = new PBRMaterial(`floatplat_frame_${id}`, scene);
		const floatMat = new PBRMaterial(`floatplat_float_${id}`, scene);

		if (type === "dock") {
			// Wooden dock
			deckMat.albedoColor = new Color3(
				0.45 * conditionFactor,
				0.35 * conditionFactor,
				0.2 * conditionFactor,
			);
			deckMat.metallic = 0;
			deckMat.roughness = 0.85;
			frameMat.albedoColor = new Color3(0.4, 0.32, 0.18).scale(conditionFactor);
			frameMat.metallic = 0;
			frameMat.roughness = 0.9;
			floatMat.albedoColor = new Color3(0.3, 0.35, 0.4);
			floatMat.metallic = 0.7;
			floatMat.roughness = 0.5;

			// Deck planks
			const plankCount = Math.floor(depth / 0.15);
			for (let p = 0; p < plankCount; p++) {
				const plankZ = (p - (plankCount - 1) / 2) * 0.15;
				const plankWidth = width - 0.1 + (rng ? (rng.next() - 0.5) * 0.02 : 0);

				const plank = MeshBuilder.CreateBox(
					`${id}_plank_${p}`,
					{ width: plankWidth, height: 0.03, depth: 0.12 },
					scene,
				);
				plank.position = new Vector3(
					posX - Math.sin(rotation) * plankZ,
					posY + 0.2,
					posZ - Math.cos(rotation) * plankZ,
				);
				plank.rotation.y = rotation;
				plank.material = deckMat;
				meshes.push(plank);
			}

			// Support beams
			const beamCount = 3;
			for (let b = 0; b < beamCount; b++) {
				const beamX =
					(b - (beamCount - 1) / 2) * ((width / (beamCount - 1)) * 0.8);
				const beam = MeshBuilder.CreateBox(
					`${id}_beam_${b}`,
					{ width: 0.1, height: 0.08, depth: depth - 0.1 },
					scene,
				);
				beam.position = new Vector3(
					posX + Math.cos(rotation) * beamX,
					posY + 0.15,
					posZ - Math.sin(rotation) * beamX,
				);
				beam.rotation.y = rotation;
				beam.material = frameMat;
				meshes.push(beam);
			}

			// Flotation drums
			const drumCount = 4;
			for (let d = 0; d < drumCount; d++) {
				const dx = ((d % 2) - 0.5) * (width - 0.5);
				const dz = (Math.floor(d / 2) - 0.5) * (depth - 0.8);

				const drum = MeshBuilder.CreateCylinder(
					`${id}_drum_${d}`,
					{ height: depth * 0.3, diameter: 0.4 },
					scene,
				);
				drum.position = new Vector3(
					posX + Math.cos(rotation) * dx - Math.sin(rotation) * dz,
					posY,
					posZ - Math.sin(rotation) * dx - Math.cos(rotation) * dz,
				);
				drum.rotation.z = Math.PI / 2;
				drum.rotation.y = rotation;
				drum.material = floatMat;
				meshes.push(drum);
			}
		} else if (type === "raft") {
			// Makeshift raft
			deckMat.albedoColor = new Color3(0.35, 0.28, 0.15).scale(conditionFactor);
			deckMat.metallic = 0;
			deckMat.roughness = 0.9;
			floatMat.albedoColor = new Color3(0.15, 0.15, 0.17);
			floatMat.metallic = 0.1;
			floatMat.roughness = 0.7;

			// Random planks
			const plankCount = 8 + (rng ? Math.floor(rng.next() * 5) : 0);
			for (let p = 0; p < plankCount; p++) {
				const plankW = 0.15 + (rng ? rng.next() * 0.15 : 0);
				const plankD = 0.8 + (rng ? rng.next() * 0.8 : 0);
				const px =
					(rng ? rng.next() - 0.5 : p / plankCount - 0.5) * width * 0.8;
				const pz = (rng ? rng.next() - 0.5 : 0) * depth * 0.6;

				const plank = MeshBuilder.CreateBox(
					`${id}_plank_${p}`,
					{ width: plankW, height: 0.02, depth: plankD },
					scene,
				);
				plank.position = new Vector3(
					posX + Math.cos(rotation) * px - Math.sin(rotation) * pz,
					posY + 0.15 + (rng ? rng.next() * 0.02 : 0),
					posZ - Math.sin(rotation) * px - Math.cos(rotation) * pz,
				);
				plank.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.2 : 0);
				plank.material = deckMat;
				meshes.push(plank);
			}

			// Barrel floats
			const barrelCount = 4 + (rng ? Math.floor(rng.next() * 3) : 0);
			for (let b = 0; b < barrelCount; b++) {
				const bx =
					((b % 2) - 0.5) * (width - 0.3) +
					(rng ? (rng.next() - 0.5) * 0.2 : 0);
				const bz =
					(Math.floor(b / 2) / (barrelCount / 2) - 0.5) * (depth - 0.4);

				const barrel = MeshBuilder.CreateCylinder(
					`${id}_barrel_${b}`,
					{ height: 0.5, diameter: 0.35 },
					scene,
				);
				barrel.position = new Vector3(
					posX + Math.cos(rotation) * bx - Math.sin(rotation) * bz,
					posY + 0.05,
					posZ - Math.sin(rotation) * bx - Math.cos(rotation) * bz,
				);
				barrel.material = floatMat;
				meshes.push(barrel);
			}
		} else if (type === "barge") {
			// Metal barge
			deckMat.albedoColor = new Color3(0.35, 0.38, 0.4).scale(conditionFactor);
			deckMat.metallic = 0.8;
			deckMat.roughness = 0.5;
			frameMat.albedoColor = new Color3(0.3, 0.32, 0.35).scale(conditionFactor);
			frameMat.metallic = 0.85;
			frameMat.roughness = 0.45;

			// Hull
			const hull = MeshBuilder.CreateBox(
				`${id}_hull`,
				{ width: width, height: 0.4, depth: depth },
				scene,
			);
			hull.position = new Vector3(posX, posY, posZ);
			hull.rotation.y = rotation;
			hull.material = frameMat;
			meshes.push(hull);

			// Deck
			const deck = MeshBuilder.CreateBox(
				`${id}_deck`,
				{ width: width - 0.1, height: 0.05, depth: depth - 0.1 },
				scene,
			);
			deck.position = new Vector3(posX, posY + 0.2, posZ);
			deck.rotation.y = rotation;
			deck.material = deckMat;
			meshes.push(deck);

			// Gunwales
			for (const side of [-1, 1]) {
				const gunwale = MeshBuilder.CreateBox(
					`${id}_gunwale_${side}`,
					{ width: 0.08, height: 0.15, depth: depth },
					scene,
				);
				gunwale.position = new Vector3(
					posX + Math.cos(rotation) * ((side * width) / 2),
					posY + 0.28,
					posZ - Math.sin(rotation) * ((side * width) / 2),
				);
				gunwale.rotation.y = rotation;
				gunwale.material = frameMat;
				meshes.push(gunwale);
			}
		} else if (type === "modular") {
			// Modular floating dock sections
			deckMat.albedoColor = new Color3(0.45, 0.45, 0.48).scale(conditionFactor);
			deckMat.metallic = 0.3;
			deckMat.roughness = 0.6;
			floatMat.albedoColor = new Color3(0.6, 0.6, 0.65);
			floatMat.metallic = 0.7;
			floatMat.roughness = 0.4;

			// Modular sections
			const sectionsX = Math.ceil(width / 1);
			const sectionsZ = Math.ceil(depth / 1);

			for (let sx = 0; sx < sectionsX; sx++) {
				for (let sz = 0; sz < sectionsZ; sz++) {
					const secX = (sx - (sectionsX - 1) / 2) * 1;
					const secZ = (sz - (sectionsZ - 1) / 2) * 1;

					// Section deck
					const section = MeshBuilder.CreateBox(
						`${id}_section_${sx}_${sz}`,
						{ width: 0.95, height: 0.04, depth: 0.95 },
						scene,
					);
					section.position = new Vector3(
						posX + Math.cos(rotation) * secX - Math.sin(rotation) * secZ,
						posY + 0.18,
						posZ - Math.sin(rotation) * secX - Math.cos(rotation) * secZ,
					);
					section.rotation.y = rotation;
					section.material = deckMat;
					meshes.push(section);

					// Float underneath
					const float = MeshBuilder.CreateBox(
						`${id}_float_${sx}_${sz}`,
						{ width: 0.8, height: 0.15, depth: 0.8 },
						scene,
					);
					float.position = new Vector3(
						posX + Math.cos(rotation) * secX - Math.sin(rotation) * secZ,
						posY + 0.075,
						posZ - Math.sin(rotation) * secX - Math.cos(rotation) * secZ,
					);
					float.rotation.y = rotation;
					float.material = floatMat;
					meshes.push(float);
				}
			}
		}

		// Railings
		if (hasRailings) {
			const railMat = new PBRMaterial(`floatplat_rail_${id}`, scene);
			railMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
			railMat.metallic = 0.8;
			railMat.roughness = 0.4;

			const railHeight = 0.8;

			for (const side of [-1, 1]) {
				// Posts
				const postCount = Math.ceil(depth / 1.5) + 1;
				for (let p = 0; p < postCount; p++) {
					const postZ = (p / (postCount - 1) - 0.5) * (depth - 0.2);
					const post = MeshBuilder.CreateCylinder(
						`${id}_post_${side}_${p}`,
						{ height: railHeight, diameter: 0.04 },
						scene,
					);
					post.position = new Vector3(
						posX +
							Math.cos(rotation) * (side * (width / 2 - 0.1)) -
							Math.sin(rotation) * postZ,
						posY + 0.2 + railHeight / 2,
						posZ -
							Math.sin(rotation) * (side * (width / 2 - 0.1)) -
							Math.cos(rotation) * postZ,
					);
					post.material = railMat;
					meshes.push(post);
				}

				// Top rail
				const topRail = MeshBuilder.CreateCylinder(
					`${id}_topRail_${side}`,
					{ height: depth - 0.2, diameter: 0.03 },
					scene,
				);
				topRail.position = new Vector3(
					posX + Math.cos(rotation) * (side * (width / 2 - 0.1)),
					posY + 0.2 + railHeight,
					posZ - Math.sin(rotation) * (side * (width / 2 - 0.1)),
				);
				topRail.rotation.x = Math.PI / 2;
				topRail.rotation.y = rotation;
				topRail.material = railMat;
				meshes.push(topRail);
			}
		}

		// Mooring points
		if (hasMooring) {
			const mooringMat = new PBRMaterial(`floatplat_mooring_${id}`, scene);
			mooringMat.albedoColor = new Color3(0.3, 0.32, 0.35);
			mooringMat.metallic = 0.85;
			mooringMat.roughness = 0.4;

			const mooringPositions = [
				[width / 2 - 0.15, depth / 2 - 0.15],
				[-width / 2 + 0.15, depth / 2 - 0.15],
				[width / 2 - 0.15, -depth / 2 + 0.15],
				[-width / 2 + 0.15, -depth / 2 + 0.15],
			];

			for (let m = 0; m < mooringPositions.length; m++) {
				const [mx, mz] = mooringPositions[m];
				const cleat = MeshBuilder.CreateBox(
					`${id}_cleat_${m}`,
					{ width: 0.15, height: 0.08, depth: 0.06 },
					scene,
				);
				cleat.position = new Vector3(
					posX + Math.cos(rotation) * mx - Math.sin(rotation) * mz,
					posY + 0.24,
					posZ - Math.sin(rotation) * mx - Math.cos(rotation) * mz,
				);
				cleat.rotation.y = rotation;
				cleat.material = mooringMat;
				meshes.push(cleat);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			deckMat.dispose();
			frameMat.dispose();
			floatMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		width,
		depth,
		hasRailings,
		hasMooring,
		condition,
		rotation,
		seed,
	]);

	return null;
}
