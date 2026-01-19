/**
 * Balcony - Protruding balcony component
 *
 * Common in Japanese apartments for drying laundry and small gardens.
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

export type BalconyType = "standard" | "juliet" | "cantilevered" | "enclosed";
export type BalconyMaterial = "concrete" | "metal" | "wood";

export interface BalconyProps {
	id: string;
	position: Vector3;
	/** Balcony type */
	type?: BalconyType;
	/** Material */
	material?: BalconyMaterial;
	/** Width along building */
	width?: number;
	/** Depth (how far it protrudes) */
	depth?: number;
	/** Railing height */
	railingHeight?: number;
	/** Has plants/items on it */
	decorated?: boolean;
	/** Direction balcony faces (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const MATERIAL_COLORS: Record<
	BalconyMaterial,
	{ base: Color3; metallic: number; roughness: number }
> = {
	concrete: {
		base: new Color3(0.55, 0.55, 0.57),
		metallic: 0,
		roughness: 0.85,
	},
	metal: { base: new Color3(0.4, 0.42, 0.45), metallic: 0.8, roughness: 0.4 },
	wood: { base: new Color3(0.45, 0.35, 0.22), metallic: 0, roughness: 0.7 },
};

export function Balcony({
	id,
	position,
	type = "standard",
	material = "concrete",
	width = 3,
	depth = 1.2,
	railingHeight = 1.1,
	decorated = false,
	rotation = 0,
	seed,
}: BalconyProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const materialVariation = rng ? rng.next() * 0.08 - 0.04 : 0;

		// Floor material
		const floorMat = new PBRMaterial(`balcony_floor_mat_${id}`, scene);
		const colors = MATERIAL_COLORS[material];
		floorMat.albedoColor = new Color3(
			colors.base.r + materialVariation,
			colors.base.g + materialVariation,
			colors.base.b + materialVariation,
		);
		floorMat.metallic = colors.metallic;
		floorMat.roughness = colors.roughness;

		// Railing material
		const railMat = new PBRMaterial(`balcony_rail_mat_${id}`, scene);
		railMat.albedoColor = new Color3(0.3, 0.32, 0.35);
		railMat.metallic = 0.85;
		railMat.roughness = 0.35;

		const floorThickness = 0.15;

		if (type === "standard" || type === "cantilevered") {
			// Floor slab
			const floor = MeshBuilder.CreateBox(
				`${id}_floor`,
				{ width, height: floorThickness, depth },
				scene,
			);
			floor.position = new Vector3(
				posX,
				posY - floorThickness / 2,
				posZ + depth / 2,
			);
			floor.rotation.y = rotation;
			floor.material = floorMat;
			meshes.push(floor);

			// Railings - front and sides
			const railThickness = 0.04;

			// Front railing posts
			const postCount = Math.max(2, Math.ceil(width / 1.5));
			for (let i = 0; i < postCount; i++) {
				const post = MeshBuilder.CreateCylinder(
					`${id}_post_${i}`,
					{ height: railingHeight, diameter: railThickness },
					scene,
				);
				post.position = new Vector3(
					posX + (i - (postCount - 1) / 2) * (width / (postCount - 1)),
					posY + railingHeight / 2,
					posZ + depth,
				);
				post.rotation.y = rotation;
				post.material = railMat;
				meshes.push(post);
			}

			// Front top rail
			const frontRail = MeshBuilder.CreateCylinder(
				`${id}_rail_front`,
				{ height: width, diameter: railThickness },
				scene,
			);
			frontRail.position = new Vector3(
				posX,
				posY + railingHeight,
				posZ + depth,
			);
			frontRail.rotation.z = Math.PI / 2;
			frontRail.rotation.y = rotation;
			frontRail.material = railMat;
			meshes.push(frontRail);

			// Side railings
			for (const side of [-1, 1]) {
				// Side post at back
				const backPost = MeshBuilder.CreateCylinder(
					`${id}_side_post_${side}`,
					{ height: railingHeight, diameter: railThickness },
					scene,
				);
				backPost.position = new Vector3(
					posX + (side * width) / 2,
					posY + railingHeight / 2,
					posZ,
				);
				backPost.rotation.y = rotation;
				backPost.material = railMat;
				meshes.push(backPost);

				// Side top rail
				const sideRail = MeshBuilder.CreateCylinder(
					`${id}_rail_side_${side}`,
					{ height: depth, diameter: railThickness },
					scene,
				);
				sideRail.position = new Vector3(
					posX + (side * width) / 2,
					posY + railingHeight,
					posZ + depth / 2,
				);
				sideRail.rotation.x = Math.PI / 2;
				sideRail.rotation.y = rotation;
				sideRail.material = railMat;
				meshes.push(sideRail);
			}

			// Front glass/panel infill
			const infillMat = new PBRMaterial(`balcony_infill_${id}`, scene);
			infillMat.albedoColor = new Color3(0.7, 0.72, 0.75);
			infillMat.metallic = 0.1;
			infillMat.roughness = 0.1;
			infillMat.alpha = 0.3;

			const infill = MeshBuilder.CreateBox(
				`${id}_infill`,
				{ width: width * 0.95, height: railingHeight * 0.8, depth: 0.01 },
				scene,
			);
			infill.position = new Vector3(
				posX,
				posY + railingHeight * 0.45,
				posZ + depth,
			);
			infill.rotation.y = rotation;
			infill.material = infillMat;
			meshes.push(infill);
		} else if (type === "juliet") {
			// Juliet balcony - no floor, just railing
			const railWidth = width;
			const railDepth = 0.2;

			// Top rail
			const topRail = MeshBuilder.CreateBox(
				`${id}_top_rail`,
				{ width: railWidth, height: 0.05, depth: railDepth },
				scene,
			);
			topRail.position = new Vector3(
				posX,
				posY + railingHeight,
				posZ + railDepth / 2,
			);
			topRail.rotation.y = rotation;
			topRail.material = railMat;
			meshes.push(topRail);

			// Vertical bars
			const barCount = Math.floor(width / 0.12);
			for (let i = 0; i < barCount; i++) {
				const bar = MeshBuilder.CreateCylinder(
					`${id}_bar_${i}`,
					{ height: railingHeight, diameter: 0.02 },
					scene,
				);
				bar.position = new Vector3(
					posX + (i - barCount / 2 + 0.5) * (width / barCount),
					posY + railingHeight / 2,
					posZ + railDepth / 2,
				);
				bar.rotation.y = rotation;
				bar.material = railMat;
				meshes.push(bar);
			}
		} else if (type === "enclosed") {
			// Enclosed balcony with glass walls
			const floor = MeshBuilder.CreateBox(
				`${id}_floor`,
				{ width, height: floorThickness, depth },
				scene,
			);
			floor.position = new Vector3(
				posX,
				posY - floorThickness / 2,
				posZ + depth / 2,
			);
			floor.rotation.y = rotation;
			floor.material = floorMat;
			meshes.push(floor);

			// Glass walls
			const glassMat = new PBRMaterial(`balcony_glass_${id}`, scene);
			glassMat.albedoColor = new Color3(0.7, 0.75, 0.8);
			glassMat.metallic = 0.1;
			glassMat.roughness = 0.05;
			glassMat.alpha = 0.35;

			const wallHeight = 2.2;

			// Front glass
			const frontGlass = MeshBuilder.CreateBox(
				`${id}_glass_front`,
				{ width: width * 0.98, height: wallHeight, depth: 0.02 },
				scene,
			);
			frontGlass.position = new Vector3(
				posX,
				posY + wallHeight / 2,
				posZ + depth,
			);
			frontGlass.rotation.y = rotation;
			frontGlass.material = glassMat;
			meshes.push(frontGlass);

			// Side glass
			for (const side of [-1, 1]) {
				const sideGlass = MeshBuilder.CreateBox(
					`${id}_glass_side_${side}`,
					{ width: 0.02, height: wallHeight, depth: depth * 0.98 },
					scene,
				);
				sideGlass.position = new Vector3(
					posX + (side * width) / 2,
					posY + wallHeight / 2,
					posZ + depth / 2,
				);
				sideGlass.rotation.y = rotation;
				sideGlass.material = glassMat;
				meshes.push(sideGlass);
			}

			// Ceiling
			const ceiling = MeshBuilder.CreateBox(
				`${id}_ceiling`,
				{ width, height: 0.1, depth },
				scene,
			);
			ceiling.position = new Vector3(posX, posY + wallHeight, posZ + depth / 2);
			ceiling.rotation.y = rotation;
			ceiling.material = floorMat;
			meshes.push(ceiling);
		}

		// Decorations
		if (decorated && rng && (type === "standard" || type === "enclosed")) {
			// Potted plants
			const plantCount = Math.floor(rng.next() * 3) + 1;
			const plantMat = new PBRMaterial(`plant_mat_${id}`, scene);
			plantMat.albedoColor = new Color3(0.2, 0.4, 0.15);
			plantMat.metallic = 0;
			plantMat.roughness = 0.9;

			const potMat = new PBRMaterial(`pot_mat_${id}`, scene);
			potMat.albedoColor = new Color3(0.6, 0.4, 0.3);
			potMat.metallic = 0;
			potMat.roughness = 0.8;

			for (let i = 0; i < plantCount; i++) {
				const potX = posX + (rng.next() - 0.5) * (width * 0.7);
				const potZ = posZ + 0.3 + rng.next() * (depth * 0.5);

				// Pot
				const pot = MeshBuilder.CreateCylinder(
					`${id}_pot_${i}`,
					{ height: 0.25, diameterTop: 0.2, diameterBottom: 0.15 },
					scene,
				);
				pot.position = new Vector3(potX, posY + 0.125, potZ);
				pot.material = potMat;
				meshes.push(pot);

				// Plant
				const plant = MeshBuilder.CreateSphere(
					`${id}_plant_${i}`,
					{ diameter: 0.3 + rng.next() * 0.2 },
					scene,
				);
				plant.position = new Vector3(
					potX,
					posY + 0.35 + rng.next() * 0.1,
					potZ,
				);
				plant.material = plantMat;
				meshes.push(plant);
			}

			// Laundry pole (very Japanese)
			if (rng.next() > 0.5) {
				const poleMat = new PBRMaterial(`pole_mat_${id}`, scene);
				poleMat.albedoColor = new Color3(0.7, 0.7, 0.72);
				poleMat.metallic = 0.9;
				poleMat.roughness = 0.3;

				const pole = MeshBuilder.CreateCylinder(
					`${id}_laundry_pole`,
					{ height: width * 0.8, diameter: 0.03 },
					scene,
				);
				pole.position = new Vector3(
					posX,
					posY + railingHeight * 0.8,
					posZ + depth * 0.7,
				);
				pole.rotation.z = Math.PI / 2;
				pole.rotation.y = rotation;
				pole.material = poleMat;
				meshes.push(pole);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			floorMat.dispose();
			railMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		material,
		width,
		depth,
		railingHeight,
		decorated,
		rotation,
		seed,
	]);

	return null;
}
