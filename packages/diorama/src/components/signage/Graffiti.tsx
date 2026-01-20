/**
 * Graffiti - Wall graffiti and street art
 *
 * Graffiti tags and murals for urban decoration.
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

export type GraffitiType =
	| "tag"
	| "throw_up"
	| "piece"
	| "stencil"
	| "mural"
	| "scratch";
export type GraffitiSize = "small" | "medium" | "large" | "massive";

export interface GraffitiProps {
	id: string;
	position: Vector3;
	/** Graffiti type */
	type?: GraffitiType;
	/** Graffiti size */
	size?: GraffitiSize;
	/** Primary color */
	primaryColor?:
		| "red"
		| "blue"
		| "green"
		| "yellow"
		| "purple"
		| "orange"
		| "white"
		| "black";
	/** Has drips */
	hasDrips?: boolean;
	/** Age/faded 0-1 */
	age?: number;
	/** Wall normal direction (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Graffiti({
	id,
	position,
	type = "tag",
	size = "medium",
	primaryColor = "red",
	hasDrips = false,
	age = 0.2,
	rotation = 0,
	seed,
}: GraffitiProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Size dimensions
		let width: number;
		let height: number;
		switch (size) {
			case "small":
				width = 0.3;
				height = 0.2;
				break;
			case "medium":
				width = 0.8;
				height = 0.5;
				break;
			case "large":
				width = 1.5;
				height = 1.0;
				break;
			case "massive":
				width = 3.0;
				height = 2.0;
				break;
			default:
				width = 0.8;
				height = 0.5;
		}

		// Get color
		const getColor = (colorName: string): Color3 => {
			const ageFactor = 1 - age * 0.4;
			switch (colorName) {
				case "red":
					return new Color3(0.85, 0.15, 0.1).scale(ageFactor);
				case "blue":
					return new Color3(0.1, 0.3, 0.85).scale(ageFactor);
				case "green":
					return new Color3(0.1, 0.7, 0.2).scale(ageFactor);
				case "yellow":
					return new Color3(0.9, 0.85, 0.1).scale(ageFactor);
				case "purple":
					return new Color3(0.6, 0.1, 0.7).scale(ageFactor);
				case "orange":
					return new Color3(0.95, 0.5, 0.1).scale(ageFactor);
				case "white":
					return new Color3(0.95, 0.95, 0.95).scale(ageFactor);
				case "black":
					return new Color3(0.1, 0.1, 0.12);
				default:
					return new Color3(0.85, 0.15, 0.1).scale(ageFactor);
			}
		};

		const mainColor = getColor(primaryColor);

		// Main material
		const graffitiMat = new PBRMaterial(`graffiti_main_${id}`, scene);
		graffitiMat.albedoColor = mainColor;
		graffitiMat.metallic = 0.1;
		graffitiMat.roughness = 0.7;

		if (type === "tag") {
			// Simple tag - stylized letters
			const strokeCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let s = 0; s < strokeCount; s++) {
				const strokeW = width * (0.1 + (rng ? rng.next() * 0.15 : 0.1));
				const strokeH = height * (0.3 + (rng ? rng.next() * 0.4 : 0.3));
				const sx = (s / strokeCount - 0.5) * width * 0.8;
				const sy = (rng ? rng.next() - 0.5 : 0) * height * 0.3;

				const stroke = MeshBuilder.CreatePlane(
					`${id}_stroke_${s}`,
					{ width: strokeW, height: strokeH },
					scene,
				);
				stroke.position = new Vector3(
					posX + Math.sin(rotation) * sx,
					posY + sy,
					posZ + Math.cos(rotation) * sx,
				);
				stroke.rotation.y = rotation;
				stroke.rotation.z = rng ? (rng.next() - 0.5) * 0.5 : 0;
				stroke.material = graffitiMat;
				meshes.push(stroke);
			}
		} else if (type === "throw_up") {
			// Bubble letters - rounded shapes
			const letterCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);

			// Outline
			const outlineMat = new PBRMaterial(`graffiti_outline_${id}`, scene);
			outlineMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			outlineMat.metallic = 0.1;
			outlineMat.roughness = 0.7;

			for (let l = 0; l < letterCount; l++) {
				const lx = (l / letterCount - 0.5) * width * 0.7;
				const letterW = (width / letterCount) * 0.8;
				const letterH = height * 0.8;

				// Outline
				const outline = MeshBuilder.CreateDisc(
					`${id}_outline_${l}`,
					{ radius: Math.max(letterW, letterH) / 2 + 0.02, tessellation: 16 },
					scene,
				);
				outline.position = new Vector3(
					posX + Math.sin(rotation) * lx - Math.cos(rotation) * 0.001,
					posY,
					posZ + Math.cos(rotation) * lx + Math.sin(rotation) * 0.001,
				);
				outline.rotation.y = rotation;
				outline.scaling = new Vector3(letterW / letterH, 1, 1);
				outline.material = outlineMat;
				meshes.push(outline);

				// Fill
				const fill = MeshBuilder.CreateDisc(
					`${id}_fill_${l}`,
					{ radius: Math.max(letterW, letterH) / 2 - 0.01, tessellation: 16 },
					scene,
				);
				fill.position = new Vector3(
					posX + Math.sin(rotation) * lx,
					posY,
					posZ + Math.cos(rotation) * lx,
				);
				fill.rotation.y = rotation;
				fill.scaling = new Vector3(letterW / letterH, 1, 1);
				fill.material = graffitiMat;
				meshes.push(fill);
			}
		} else if (type === "piece") {
			// Full piece with multiple colors
			const secondaryMat = new PBRMaterial(`graffiti_secondary_${id}`, scene);
			const colors = ["blue", "green", "yellow", "purple", "orange"];
			const secondaryColorName =
				colors[rng ? Math.floor(rng.next() * colors.length) : 0];
			secondaryMat.albedoColor = getColor(secondaryColorName);
			secondaryMat.metallic = 0.1;
			secondaryMat.roughness = 0.7;

			// Background
			const bgMat = new PBRMaterial(`graffiti_bg_${id}`, scene);
			bgMat.albedoColor = new Color3(0.15, 0.15, 0.18);
			bgMat.metallic = 0;
			bgMat.roughness = 0.8;

			const bg = MeshBuilder.CreatePlane(
				`${id}_bg`,
				{ width: width, height: height },
				scene,
			);
			bg.position = new Vector3(
				posX - Math.cos(rotation) * 0.002,
				posY,
				posZ + Math.sin(rotation) * 0.002,
			);
			bg.rotation.y = rotation;
			bg.material = bgMat;
			meshes.push(bg);

			// Main shapes
			const shapeCount = 4 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let sh = 0; sh < shapeCount; sh++) {
				const shapeW = width * (0.15 + (rng ? rng.next() * 0.2 : 0.1));
				const shapeH = height * (0.2 + (rng ? rng.next() * 0.3 : 0.15));
				const shx =
					(rng ? rng.next() - 0.5 : sh / shapeCount - 0.5) * width * 0.7;
				const shy = (rng ? rng.next() - 0.5 : 0) * height * 0.6;

				const shape = MeshBuilder.CreatePlane(
					`${id}_shape_${sh}`,
					{ width: shapeW, height: shapeH },
					scene,
				);
				shape.position = new Vector3(
					posX + Math.sin(rotation) * shx,
					posY + shy,
					posZ + Math.cos(rotation) * shx,
				);
				shape.rotation.y = rotation;
				shape.rotation.z = rng ? (rng.next() - 0.5) * 0.3 : 0;
				shape.material = sh % 2 === 0 ? graffitiMat : secondaryMat;
				meshes.push(shape);
			}
		} else if (type === "stencil") {
			// Clean stencil art
			const stencilMat = new PBRMaterial(`graffiti_stencil_${id}`, scene);
			stencilMat.albedoColor = mainColor;
			stencilMat.metallic = 0;
			stencilMat.roughness = 0.6;

			// Main shape
			const mainShape = MeshBuilder.CreatePlane(
				`${id}_stencil`,
				{ width: width * 0.8, height: height * 0.8 },
				scene,
			);
			mainShape.position = new Vector3(posX, posY, posZ);
			mainShape.rotation.y = rotation;
			mainShape.material = stencilMat;
			meshes.push(mainShape);

			// Cut-out details
			const cutoutMat = new PBRMaterial(`graffiti_cutout_${id}`, scene);
			cutoutMat.albedoColor = new Color3(0.5, 0.48, 0.45); // Wall color showing through
			cutoutMat.metallic = 0;
			cutoutMat.roughness = 0.9;

			const cutoutCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let c = 0; c < cutoutCount; c++) {
				const cutW = width * (0.05 + (rng ? rng.next() * 0.1 : 0.05));
				const cutH = height * (0.1 + (rng ? rng.next() * 0.15 : 0.08));
				const cutX = (rng ? rng.next() - 0.5 : 0) * width * 0.5;
				const cutY = (rng ? rng.next() - 0.5 : 0) * height * 0.5;

				const cutout = MeshBuilder.CreatePlane(
					`${id}_cutout_${c}`,
					{ width: cutW, height: cutH },
					scene,
				);
				cutout.position = new Vector3(
					posX + Math.sin(rotation) * cutX + Math.cos(rotation) * 0.001,
					posY + cutY,
					posZ + Math.cos(rotation) * cutX - Math.sin(rotation) * 0.001,
				);
				cutout.rotation.y = rotation;
				cutout.material = cutoutMat;
				meshes.push(cutout);
			}
		} else if (type === "mural") {
			// Large-scale mural
			const muralBg = MeshBuilder.CreatePlane(
				`${id}_mural`,
				{ width: width, height: height },
				scene,
			);
			muralBg.position = new Vector3(posX, posY, posZ);
			muralBg.rotation.y = rotation;
			muralBg.material = graffitiMat;
			meshes.push(muralBg);

			// Detail layers
			const detailColors = ["blue", "green", "yellow", "white", "black"];
			const detailCount = 6 + (rng ? Math.floor(rng.next() * 4) : 3);

			for (let d = 0; d < detailCount; d++) {
				const detailMat = new PBRMaterial(`graffiti_detail_${id}_${d}`, scene);
				const detailColorName =
					detailColors[
						rng
							? Math.floor(rng.next() * detailColors.length)
							: d % detailColors.length
					];
				detailMat.albedoColor = getColor(detailColorName);
				detailMat.metallic = 0.1;
				detailMat.roughness = 0.7;

				const dw = width * (0.1 + (rng ? rng.next() * 0.2 : 0.1));
				const dh = height * (0.1 + (rng ? rng.next() * 0.2 : 0.1));
				const dx = (rng ? rng.next() - 0.5 : 0) * width * 0.8;
				const dy = (rng ? rng.next() - 0.5 : 0) * height * 0.8;

				const detail = MeshBuilder.CreatePlane(
					`${id}_detail_${d}`,
					{ width: dw, height: dh },
					scene,
				);
				detail.position = new Vector3(
					posX + Math.sin(rotation) * dx + Math.cos(rotation) * 0.001,
					posY + dy,
					posZ + Math.cos(rotation) * dx - Math.sin(rotation) * 0.001,
				);
				detail.rotation.y = rotation;
				detail.material = detailMat;
				meshes.push(detail);
			}
		} else {
			// Scratch/etched graffiti
			const scratchMat = new PBRMaterial(`graffiti_scratch_${id}`, scene);
			scratchMat.albedoColor = new Color3(0.6, 0.58, 0.55);
			scratchMat.metallic = 0.3;
			scratchMat.roughness = 0.8;

			const scratchCount = 5 + (rng ? Math.floor(rng.next() * 5) : 3);
			for (let sc = 0; sc < scratchCount; sc++) {
				const scratchLen = width * (0.2 + (rng ? rng.next() * 0.3 : 0.15));
				const scx = (rng ? rng.next() - 0.5 : 0) * width * 0.6;
				const scy = (rng ? rng.next() - 0.5 : 0) * height * 0.6;

				const scratch = MeshBuilder.CreatePlane(
					`${id}_scratch_${sc}`,
					{ width: scratchLen, height: 0.01 },
					scene,
				);
				scratch.position = new Vector3(
					posX + Math.sin(rotation) * scx,
					posY + scy,
					posZ + Math.cos(rotation) * scx,
				);
				scratch.rotation.y = rotation;
				scratch.rotation.z = rng ? rng.next() * Math.PI : Math.PI / 4;
				scratch.material = scratchMat;
				meshes.push(scratch);
			}
		}

		// Drips
		if (hasDrips && type !== "scratch" && type !== "stencil") {
			const dripCount = 2 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let dr = 0; dr < dripCount; dr++) {
				const dripX =
					(rng ? rng.next() - 0.5 : dr / dripCount - 0.5) * width * 0.6;
				const dripLen = 0.1 + (rng ? rng.next() * 0.2 : 0.1);

				const drip = MeshBuilder.CreatePlane(
					`${id}_drip_${dr}`,
					{ width: 0.015, height: dripLen },
					scene,
				);
				drip.position = new Vector3(
					posX + Math.sin(rotation) * dripX,
					posY - height / 2 - dripLen / 2,
					posZ + Math.cos(rotation) * dripX,
				);
				drip.rotation.y = rotation;
				drip.material = graffitiMat;
				meshes.push(drip);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			graffitiMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		size,
		primaryColor,
		hasDrips,
		age,
		rotation,
		seed,
	]);

	return null;
}
