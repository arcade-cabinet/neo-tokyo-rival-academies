/**
 * Railing - Safety railing/guardrail component
 *
 * Edge protection for platforms, walkways, and rooftops.
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

export type RailingStyle = "simple" | "ornate" | "industrial" | "glass" | "cable" | "mesh";
export type RailingMaterial = "metal" | "wood" | "concrete";

export interface RailingProps {
	id: string;
	position: Vector3;
	/** Length of railing */
	length?: number;
	/** Height of railing */
	height?: number;
	/** Style */
	style?: RailingStyle;
	/** Material */
	material?: RailingMaterial;
	/** Direction railing faces (radians) */
	rotation?: number;
	/** Has opening/gap */
	opening?: boolean;
	/** Opening position (0-1) along length */
	openingPosition?: number;
	/** Opening width */
	openingWidth?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const MATERIAL_COLORS: Record<RailingMaterial, { base: Color3; metallic: number; roughness: number }> = {
	metal: { base: new Color3(0.35, 0.37, 0.4), metallic: 0.85, roughness: 0.4 },
	wood: { base: new Color3(0.45, 0.35, 0.22), metallic: 0, roughness: 0.7 },
	concrete: { base: new Color3(0.55, 0.55, 0.57), metallic: 0, roughness: 0.85 },
};

export function Railing({
	id,
	position,
	length = 4,
	height = 1.1,
	style = "simple",
	material = "metal",
	rotation = 0,
	opening = false,
	openingPosition = 0.5,
	openingWidth = 1,
	seed,
}: RailingProps) {
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

		// Main material
		const mat = new PBRMaterial(`railing_mat_${id}`, scene);
		const colors = MATERIAL_COLORS[material];
		mat.albedoColor = new Color3(
			colors.base.r + materialVariation,
			colors.base.g + materialVariation,
			colors.base.b + materialVariation
		);
		mat.metallic = colors.metallic;
		mat.roughness = colors.roughness;

		const postDiameter = style === "industrial" ? 0.06 : 0.04;
		const railDiameter = style === "industrial" ? 0.05 : 0.03;

		// Calculate segments (accounting for opening)
		const segments: Array<{ start: number; end: number }> = [];
		if (opening) {
			const openStart = openingPosition * length - openingWidth / 2;
			const openEnd = openingPosition * length + openingWidth / 2;
			if (openStart > 0) segments.push({ start: 0, end: openStart });
			if (openEnd < length) segments.push({ start: openEnd, end: length });
		} else {
			segments.push({ start: 0, end: length });
		}

		for (const segment of segments) {
			const segmentLength = segment.end - segment.start;
			const segmentCenter = (segment.start + segment.end) / 2 - length / 2;

			// Posts
			const postSpacing = 1.5;
			const postCount = Math.max(2, Math.ceil(segmentLength / postSpacing) + 1);

			for (let i = 0; i < postCount; i++) {
				const t = i / (postCount - 1);
				const postX = segment.start + t * segmentLength - length / 2;

				const post = MeshBuilder.CreateCylinder(
					`${id}_post_${segment.start}_${i}`,
					{ height, diameter: postDiameter },
					scene
				);
				post.position = new Vector3(
					posX + Math.cos(rotation) * postX,
					posY + height / 2,
					posZ + Math.sin(rotation) * postX
				);
				post.material = mat;
				meshes.push(post);
			}

			// Top rail
			const topRail = MeshBuilder.CreateCylinder(
				`${id}_top_rail_${segment.start}`,
				{ height: segmentLength, diameter: railDiameter },
				scene
			);
			topRail.position = new Vector3(
				posX + Math.cos(rotation) * segmentCenter,
				posY + height,
				posZ + Math.sin(rotation) * segmentCenter
			);
			topRail.rotation.z = Math.PI / 2;
			topRail.rotation.y = rotation;
			topRail.material = mat;
			meshes.push(topRail);

			// Style-specific infill
			if (style === "simple" || style === "industrial") {
				// Middle rail
				const midRail = MeshBuilder.CreateCylinder(
					`${id}_mid_rail_${segment.start}`,
					{ height: segmentLength, diameter: railDiameter * 0.8 },
					scene
				);
				midRail.position = new Vector3(
					posX + Math.cos(rotation) * segmentCenter,
					posY + height * 0.5,
					posZ + Math.sin(rotation) * segmentCenter
				);
				midRail.rotation.z = Math.PI / 2;
				midRail.rotation.y = rotation;
				midRail.material = mat;
				meshes.push(midRail);
			} else if (style === "ornate") {
				// Vertical balusters
				const balusterSpacing = 0.12;
				const balusterCount = Math.floor(segmentLength / balusterSpacing);

				for (let i = 0; i < balusterCount; i++) {
					const balusterX = segment.start + (i + 0.5) * (segmentLength / balusterCount) - length / 2;

					const baluster = MeshBuilder.CreateCylinder(
						`${id}_baluster_${segment.start}_${i}`,
						{ height: height * 0.85, diameter: 0.015 },
						scene
					);
					baluster.position = new Vector3(
						posX + Math.cos(rotation) * balusterX,
						posY + height * 0.45,
						posZ + Math.sin(rotation) * balusterX
					);
					baluster.material = mat;
					meshes.push(baluster);
				}

				// Bottom rail
				const bottomRail = MeshBuilder.CreateCylinder(
					`${id}_bottom_rail_${segment.start}`,
					{ height: segmentLength, diameter: railDiameter * 0.8 },
					scene
				);
				bottomRail.position = new Vector3(
					posX + Math.cos(rotation) * segmentCenter,
					posY + height * 0.05,
					posZ + Math.sin(rotation) * segmentCenter
				);
				bottomRail.rotation.z = Math.PI / 2;
				bottomRail.rotation.y = rotation;
				bottomRail.material = mat;
				meshes.push(bottomRail);
			} else if (style === "glass") {
				const glassMat = new PBRMaterial(`glass_mat_${id}`, scene);
				glassMat.albedoColor = new Color3(0.7, 0.75, 0.8);
				glassMat.metallic = 0.1;
				glassMat.roughness = 0.05;
				glassMat.alpha = 0.35;

				const glass = MeshBuilder.CreateBox(
					`${id}_glass_${segment.start}`,
					{ width: segmentLength * 0.98, height: height * 0.85, depth: 0.015 },
					scene
				);
				glass.position = new Vector3(
					posX + Math.cos(rotation) * segmentCenter,
					posY + height * 0.45,
					posZ + Math.sin(rotation) * segmentCenter
				);
				glass.rotation.y = rotation;
				glass.material = glassMat;
				meshes.push(glass);
			} else if (style === "cable") {
				const cableCount = 4;
				for (let i = 0; i < cableCount; i++) {
					const cableY = posY + (i + 0.5) * (height / cableCount);
					const cable = MeshBuilder.CreateCylinder(
						`${id}_cable_${segment.start}_${i}`,
						{ height: segmentLength, diameter: 0.008 },
						scene
					);
					cable.position = new Vector3(
						posX + Math.cos(rotation) * segmentCenter,
						cableY,
						posZ + Math.sin(rotation) * segmentCenter
					);
					cable.rotation.z = Math.PI / 2;
					cable.rotation.y = rotation;
					cable.material = mat;
					meshes.push(cable);
				}
			} else if (style === "mesh") {
				// Wire mesh panel
				const meshMat = new PBRMaterial(`mesh_mat_${id}`, scene);
				meshMat.albedoColor = new Color3(0.4, 0.4, 0.42);
				meshMat.metallic = 0.8;
				meshMat.roughness = 0.5;
				meshMat.alpha = 0.7;

				const meshPanel = MeshBuilder.CreateBox(
					`${id}_mesh_${segment.start}`,
					{ width: segmentLength * 0.98, height: height * 0.85, depth: 0.01 },
					scene
				);
				meshPanel.position = new Vector3(
					posX + Math.cos(rotation) * segmentCenter,
					posY + height * 0.45,
					posZ + Math.sin(rotation) * segmentCenter
				);
				meshPanel.rotation.y = rotation;
				meshPanel.material = meshMat;
				meshes.push(meshPanel);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			mat.dispose();
		};
	}, [scene, id, posX, posY, posZ, length, height, style, material, rotation, opening, openingPosition, openingWidth, seed]);

	return null;
}
