/**
 * Gutter - Rain gutters and downspouts component
 *
 * Essential drainage elements for buildings in a flooded Neo-Tokyo.
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

export type GutterType = "half_round" | "k_style" | "box" | "copper";
export type ConditionType = "pristine" | "weathered" | "rusted" | "damaged";

export interface GutterProps {
	id: string;
	position: Vector3;
	/** Gutter profile type */
	type?: GutterType;
	/** Length of gutter section */
	length?: number;
	/** Has downspout attached */
	hasDownspout?: boolean;
	/** Is leaking water */
	isLeaking?: boolean;
	/** Physical condition */
	condition?: ConditionType;
	/** Direction gutter runs (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const GUTTER_PROFILES: Record<
	GutterType,
	{ width: number; depth: number; thickness: number }
> = {
	half_round: { width: 0.12, depth: 0.06, thickness: 0.003 },
	k_style: { width: 0.14, depth: 0.08, thickness: 0.004 },
	box: { width: 0.1, depth: 0.1, thickness: 0.005 },
	copper: { width: 0.12, depth: 0.07, thickness: 0.003 },
};

const CONDITION_FACTORS: Record<
	ConditionType,
	{ rust: number; roughness: number; alpha: number }
> = {
	pristine: { rust: 0, roughness: 0.3, alpha: 1 },
	weathered: { rust: 0.15, roughness: 0.5, alpha: 1 },
	rusted: { rust: 0.5, roughness: 0.7, alpha: 0.95 },
	damaged: { rust: 0.7, roughness: 0.8, alpha: 0.9 },
};

export function Gutter({
	id,
	position,
	type = "k_style",
	length = 2,
	hasDownspout = true,
	isLeaking = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: GutterProps) {
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

		const profile = GUTTER_PROFILES[type];
		const conditionFactor = CONDITION_FACTORS[condition];
		const rustVariation = rng ? rng.next() * 0.1 : 0.05;

		// Base gutter material
		const gutterMat = new PBRMaterial(`gutter_mat_${id}`, scene);
		materials.push(gutterMat);

		if (type === "copper") {
			// Copper with patina based on condition
			const patina = conditionFactor.rust * 0.8;
			gutterMat.albedoColor = new Color3(
				0.72 * (1 - patina) + 0.3 * patina,
				0.45 * (1 - patina) + 0.55 * patina,
				0.2 * (1 - patina) + 0.45 * patina,
			);
			gutterMat.metallic = 0.9 - patina * 0.3;
		} else {
			// Aluminum/steel gutter
			const rust = conditionFactor.rust + rustVariation;
			gutterMat.albedoColor = new Color3(
				0.6 - rust * 0.2 + rust * 0.3,
				0.62 - rust * 0.35,
				0.65 - rust * 0.4,
			);
			gutterMat.metallic = 0.7 - rust * 0.3;
		}
		gutterMat.roughness = conditionFactor.roughness;
		gutterMat.alpha = conditionFactor.alpha;

		// Create gutter channel based on type
		if (type === "half_round") {
			// Half-round gutter (semicircular cross-section)
			const gutter = MeshBuilder.CreateCylinder(
				`${id}_gutter`,
				{
					height: length,
					diameter: profile.width,
					tessellation: 16,
					arc: 0.5,
				},
				scene,
			);
			gutter.position = new Vector3(posX, posY, posZ);
			gutter.rotation.z = Math.PI / 2;
			gutter.rotation.y = rotation;
			gutter.material = gutterMat;
			meshes.push(gutter);

			// End caps
			for (const end of [-1, 1]) {
				const cap = MeshBuilder.CreateDisc(
					`${id}_cap_${end}`,
					{ radius: profile.width / 2, tessellation: 16, arc: 0.5 },
					scene,
				);
				cap.position = new Vector3(
					posX + Math.cos(rotation) * ((end * length) / 2),
					posY,
					posZ - Math.sin(rotation) * ((end * length) / 2),
				);
				cap.rotation.y = rotation + (end === 1 ? Math.PI : 0);
				cap.rotation.x = Math.PI / 2;
				cap.material = gutterMat;
				meshes.push(cap);
			}
		} else if (type === "k_style") {
			// K-style gutter (shaped profile)
			// Main channel
			const bottom = MeshBuilder.CreateBox(
				`${id}_bottom`,
				{ width: length, height: profile.thickness, depth: profile.width },
				scene,
			);
			bottom.position = new Vector3(posX, posY, posZ);
			bottom.rotation.y = rotation;
			bottom.material = gutterMat;
			meshes.push(bottom);

			// Front face (decorative ogee profile)
			const front = MeshBuilder.CreateBox(
				`${id}_front`,
				{ width: length, height: profile.depth, depth: profile.thickness },
				scene,
			);
			front.position = new Vector3(
				posX + Math.sin(rotation) * (profile.width / 2 - profile.thickness / 2),
				posY + profile.depth / 2,
				posZ + Math.cos(rotation) * (profile.width / 2 - profile.thickness / 2),
			);
			front.rotation.y = rotation;
			front.material = gutterMat;
			meshes.push(front);

			// Back face
			const back = MeshBuilder.CreateBox(
				`${id}_back`,
				{
					width: length,
					height: profile.depth * 0.7,
					depth: profile.thickness,
				},
				scene,
			);
			back.position = new Vector3(
				posX - Math.sin(rotation) * (profile.width / 2 - profile.thickness / 2),
				posY + profile.depth * 0.35,
				posZ - Math.cos(rotation) * (profile.width / 2 - profile.thickness / 2),
			);
			back.rotation.y = rotation;
			back.material = gutterMat;
			meshes.push(back);

			// Decorative lip on front
			const lip = MeshBuilder.CreateBox(
				`${id}_lip`,
				{
					width: length,
					height: profile.thickness * 2,
					depth: profile.thickness * 3,
				},
				scene,
			);
			lip.position = new Vector3(
				posX + Math.sin(rotation) * (profile.width / 2 + profile.thickness),
				posY + profile.depth - profile.thickness,
				posZ + Math.cos(rotation) * (profile.width / 2 + profile.thickness),
			);
			lip.rotation.y = rotation;
			lip.material = gutterMat;
			meshes.push(lip);
		} else if (type === "box") {
			// Box gutter (square profile)
			// Bottom
			const bottom = MeshBuilder.CreateBox(
				`${id}_bottom`,
				{ width: length, height: profile.thickness, depth: profile.width },
				scene,
			);
			bottom.position = new Vector3(posX, posY, posZ);
			bottom.rotation.y = rotation;
			bottom.material = gutterMat;
			meshes.push(bottom);

			// Sides
			for (const side of [-1, 1]) {
				const sideWall = MeshBuilder.CreateBox(
					`${id}_side_${side}`,
					{ width: length, height: profile.depth, depth: profile.thickness },
					scene,
				);
				sideWall.position = new Vector3(
					posX +
						Math.sin(rotation) *
							(side * (profile.width / 2 - profile.thickness / 2)),
					posY + profile.depth / 2,
					posZ +
						Math.cos(rotation) *
							(side * (profile.width / 2 - profile.thickness / 2)),
				);
				sideWall.rotation.y = rotation;
				sideWall.material = gutterMat;
				meshes.push(sideWall);
			}
		} else if (type === "copper") {
			// Decorative copper gutter (half-round with ornamental brackets)
			const gutter = MeshBuilder.CreateCylinder(
				`${id}_gutter`,
				{
					height: length,
					diameter: profile.width,
					tessellation: 24,
					arc: 0.5,
				},
				scene,
			);
			gutter.position = new Vector3(posX, posY, posZ);
			gutter.rotation.z = Math.PI / 2;
			gutter.rotation.y = rotation;
			gutter.material = gutterMat;
			meshes.push(gutter);

			// Ornamental brackets
			const bracketCount = Math.max(2, Math.floor(length / 0.6));
			const bracketMat = new PBRMaterial(`bracket_mat_${id}`, scene);
			bracketMat.albedoColor = gutterMat.albedoColor;
			bracketMat.metallic = gutterMat.metallic;
			bracketMat.roughness = gutterMat.roughness;
			materials.push(bracketMat);

			for (let i = 0; i < bracketCount; i++) {
				const bracketPos = (i / (bracketCount - 1) - 0.5) * (length - 0.1);

				// Bracket arm
				const arm = MeshBuilder.CreateBox(
					`${id}_bracket_arm_${i}`,
					{ width: 0.02, height: 0.08, depth: profile.width + 0.02 },
					scene,
				);
				arm.position = new Vector3(
					posX + Math.cos(rotation) * bracketPos,
					posY - 0.04,
					posZ - Math.sin(rotation) * bracketPos,
				);
				arm.rotation.y = rotation;
				arm.material = bracketMat;
				meshes.push(arm);

				// Decorative scroll
				const scroll = MeshBuilder.CreateTorus(
					`${id}_scroll_${i}`,
					{ diameter: 0.04, thickness: 0.008, tessellation: 16, arc: 0.75 },
					scene,
				);
				scroll.position = new Vector3(
					posX +
						Math.cos(rotation) * bracketPos -
						Math.sin(rotation) * (profile.width / 2 + 0.015),
					posY - 0.06,
					posZ -
						Math.sin(rotation) * bracketPos -
						Math.cos(rotation) * (profile.width / 2 + 0.015),
				);
				scroll.rotation.y = rotation;
				scroll.rotation.x = Math.PI / 2;
				scroll.material = bracketMat;
				meshes.push(scroll);
			}
		}

		// Mounting brackets (except copper which has its own)
		if (type !== "copper") {
			const bracketMat = new PBRMaterial(`bracket_mat_${id}`, scene);
			bracketMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			bracketMat.metallic = 0.8;
			bracketMat.roughness = 0.5;
			materials.push(bracketMat);

			const bracketCount = Math.max(2, Math.floor(length / 0.8));
			for (let i = 0; i < bracketCount; i++) {
				const bracketPos = (i / (bracketCount - 1) - 0.5) * (length - 0.15);

				const bracket = MeshBuilder.CreateBox(
					`${id}_bracket_${i}`,
					{ width: 0.03, height: 0.05, depth: profile.width + 0.01 },
					scene,
				);
				bracket.position = new Vector3(
					posX + Math.cos(rotation) * bracketPos,
					posY - 0.025,
					posZ - Math.sin(rotation) * bracketPos,
				);
				bracket.rotation.y = rotation;
				bracket.material = bracketMat;
				meshes.push(bracket);
			}
		}

		// Downspout
		if (hasDownspout) {
			const downspoutMat = new PBRMaterial(`downspout_mat_${id}`, scene);
			downspoutMat.albedoColor = gutterMat.albedoColor;
			downspoutMat.metallic = gutterMat.metallic;
			downspoutMat.roughness = gutterMat.roughness;
			materials.push(downspoutMat);

			const downspoutSize = type === "box" ? 0.06 : 0.05;
			const downspoutLength = 1.5 + (rng ? rng.next() * 0.5 : 0.25);
			const downspoutX = posX + Math.cos(rotation) * (length / 2 - 0.1);
			const downspoutZ = posZ - Math.sin(rotation) * (length / 2 - 0.1);

			// Outlet (connection to gutter)
			const outlet = MeshBuilder.CreateCylinder(
				`${id}_outlet`,
				{ height: 0.08, diameter: downspoutSize * 1.5 },
				scene,
			);
			outlet.position = new Vector3(downspoutX, posY - 0.04, downspoutZ);
			outlet.material = downspoutMat;
			meshes.push(outlet);

			// Elbow (top)
			const elbowTop = MeshBuilder.CreateTorus(
				`${id}_elbow_top`,
				{
					diameter: downspoutSize * 2,
					thickness: downspoutSize / 2,
					tessellation: 16,
					arc: 0.25,
				},
				scene,
			);
			elbowTop.position = new Vector3(
				downspoutX - Math.sin(rotation) * downspoutSize,
				posY - 0.12,
				downspoutZ - Math.cos(rotation) * downspoutSize,
			);
			elbowTop.rotation.y = rotation;
			elbowTop.material = downspoutMat;
			meshes.push(elbowTop);

			// Vertical section
			const vertical = MeshBuilder.CreateCylinder(
				`${id}_vertical`,
				{ height: downspoutLength, diameter: downspoutSize },
				scene,
			);
			vertical.position = new Vector3(
				downspoutX - Math.sin(rotation) * downspoutSize * 2,
				posY - 0.12 - downspoutLength / 2 - downspoutSize,
				downspoutZ - Math.cos(rotation) * downspoutSize * 2,
			);
			vertical.material = downspoutMat;
			meshes.push(vertical);

			// Elbow (bottom)
			const elbowBottom = MeshBuilder.CreateTorus(
				`${id}_elbow_bottom`,
				{
					diameter: downspoutSize * 2,
					thickness: downspoutSize / 2,
					tessellation: 16,
					arc: 0.25,
				},
				scene,
			);
			elbowBottom.position = new Vector3(
				downspoutX - Math.sin(rotation) * downspoutSize,
				posY - 0.12 - downspoutLength - downspoutSize * 2,
				downspoutZ - Math.cos(rotation) * downspoutSize,
			);
			elbowBottom.rotation.y = rotation;
			elbowBottom.rotation.z = Math.PI;
			elbowBottom.material = downspoutMat;
			meshes.push(elbowBottom);

			// Wall strap mounts
			const strapCount = Math.max(2, Math.floor(downspoutLength / 0.5));
			for (let i = 0; i < strapCount; i++) {
				const strapY =
					posY - 0.2 - (i / (strapCount - 1)) * (downspoutLength - 0.2);

				const strap = MeshBuilder.CreateTorus(
					`${id}_strap_${i}`,
					{
						diameter: downspoutSize * 1.3,
						thickness: 0.008,
						tessellation: 16,
						arc: 0.75,
					},
					scene,
				);
				strap.position = new Vector3(
					downspoutX - Math.sin(rotation) * downspoutSize * 2,
					strapY,
					downspoutZ - Math.cos(rotation) * downspoutSize * 2,
				);
				strap.rotation.x = Math.PI / 2;
				strap.rotation.z = rotation + Math.PI / 2;
				strap.material = downspoutMat;
				meshes.push(strap);
			}
		}

		// Water leak effect
		if (isLeaking && condition === "damaged") {
			const waterMat = new PBRMaterial(`water_mat_${id}`, scene);
			waterMat.albedoColor = new Color3(0.4, 0.5, 0.6);
			waterMat.metallic = 0.1;
			waterMat.roughness = 0.1;
			waterMat.alpha = 0.6;
			materials.push(waterMat);

			// Leak drip at random position
			const leakPos = rng ? rng.next() * 0.6 - 0.3 : 0;
			const drip = MeshBuilder.CreateCylinder(
				`${id}_drip`,
				{ height: 0.3, diameterTop: 0.005, diameterBottom: 0.015 },
				scene,
			);
			drip.position = new Vector3(
				posX + Math.cos(rotation) * leakPos * length,
				posY - 0.15,
				posZ - Math.sin(rotation) * leakPos * length,
			);
			drip.material = waterMat;
			meshes.push(drip);

			// Water stain below leak
			const stain = MeshBuilder.CreateDisc(
				`${id}_stain`,
				{ radius: 0.08, tessellation: 12 },
				scene,
			);
			stain.position = new Vector3(
				posX + Math.cos(rotation) * leakPos * length,
				posY - 0.31,
				posZ - Math.sin(rotation) * leakPos * length,
			);
			stain.rotation.x = Math.PI / 2;
			stain.material = waterMat;
			meshes.push(stain);
		}

		// Debris in gutter (weathered/rusted conditions)
		if ((condition === "weathered" || condition === "rusted") && rng) {
			const debrisMat = new PBRMaterial(`debris_mat_${id}`, scene);
			debrisMat.albedoColor = new Color3(0.35, 0.28, 0.2);
			debrisMat.metallic = 0;
			debrisMat.roughness = 0.95;
			materials.push(debrisMat);

			const debrisCount = condition === "rusted" ? 4 : 2;
			for (let i = 0; i < debrisCount; i++) {
				const debrisPos = (rng.next() - 0.5) * (length - 0.2);
				const debris = MeshBuilder.CreateBox(
					`${id}_debris_${i}`,
					{
						width: 0.02 + rng.next() * 0.03,
						height: 0.01 + rng.next() * 0.015,
						depth: 0.02 + rng.next() * 0.03,
					},
					scene,
				);
				debris.position = new Vector3(
					posX + Math.cos(rotation) * debrisPos,
					posY + profile.thickness + 0.005,
					posZ - Math.sin(rotation) * debrisPos,
				);
				debris.rotation.y = rng.next() * Math.PI * 2;
				debris.material = debrisMat;
				meshes.push(debris);
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
		length,
		hasDownspout,
		isLeaking,
		condition,
		rotation,
		seed,
	]);

	return null;
}
