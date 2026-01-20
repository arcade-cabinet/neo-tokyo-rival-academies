/**
 * Catwalk - Elevated walkway component
 *
 * Industrial and utility catwalks for elevated access.
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

export type CatwalkStyle = "industrial" | "maintenance" | "scaffold" | "pipe";
export type CatwalkRailing = "full" | "single" | "none";

export interface CatwalkProps {
	id: string;
	position: Vector3;
	/** Catwalk style */
	style?: CatwalkStyle;
	/** Length of catwalk */
	length?: number;
	/** Width of catwalk */
	width?: number;
	/** Railing type */
	railing?: CatwalkRailing;
	/** Direction (radians) */
	rotation?: number;
	/** Rust/wear 0-1 */
	rust?: number;
	/** Has support columns */
	hasSupports?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

export function Catwalk({
	id,
	position,
	style = "industrial",
	length = 6,
	width = 1,
	railing = "full",
	rotation = 0,
	rust = 0.2,
	hasSupports = true,
	seed,
}: CatwalkProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const rustFactor = 1 - rust * 0.35;

		// Materials
		const frameMat = new PBRMaterial(`catwalk_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(
			0.3 * rustFactor + rust * 0.25,
			0.3 * rustFactor + rust * 0.12,
			0.32 * rustFactor,
		);
		frameMat.metallic = 0.85;
		frameMat.roughness = 0.35 + rust * 0.4;

		const deckMat = new PBRMaterial(`catwalk_deck_${id}`, scene);
		deckMat.albedoColor = new Color3(
			0.25 * rustFactor + rust * 0.2,
			0.25 * rustFactor + rust * 0.1,
			0.27 * rustFactor,
		);
		deckMat.metallic = 0.75;
		deckMat.roughness = 0.45 + rust * 0.35;

		const railMat = new PBRMaterial(`catwalk_rail_${id}`, scene);
		railMat.albedoColor = new Color3(0.35, 0.35, 0.38).scale(rustFactor);
		railMat.metallic = 0.7;
		railMat.roughness = 0.4 + rust * 0.3;

		const railHeight = 1;
		const barThickness = 0.025;

		// Main deck/walkway
		if (style === "industrial" || style === "maintenance") {
			// Grated deck
			const deck = MeshBuilder.CreateBox(
				`${id}_deck`,
				{ width: length, height: 0.03, depth: width },
				scene,
			);
			deck.position = new Vector3(posX, posY, posZ);
			deck.rotation.y = rotation;
			deck.material = deckMat;
			meshes.push(deck);

			// Main support beams (longitudinal)
			for (const side of [-1, 1]) {
				const beam = MeshBuilder.CreateBox(
					`${id}_beam_${side}`,
					{ width: length, height: 0.08, depth: 0.05 },
					scene,
				);
				beam.position = new Vector3(
					posX + Math.sin(rotation) * (side * (width / 2 - 0.05)),
					posY - 0.055,
					posZ + Math.cos(rotation) * (side * (width / 2 - 0.05)),
				);
				beam.rotation.y = rotation;
				beam.material = frameMat;
				meshes.push(beam);
			}

			// Cross braces
			const braceCount = Math.floor(length / 1.5);
			for (let i = 0; i <= braceCount; i++) {
				const braceX = (i / braceCount - 0.5) * length;
				const brace = MeshBuilder.CreateBox(
					`${id}_brace_${i}`,
					{ width: 0.04, height: 0.06, depth: width - 0.1 },
					scene,
				);
				brace.position = new Vector3(
					posX + Math.cos(rotation) * braceX,
					posY - 0.05,
					posZ - Math.sin(rotation) * braceX,
				);
				brace.rotation.y = rotation;
				brace.material = frameMat;
				meshes.push(brace);
			}
		} else if (style === "scaffold") {
			// Plank deck
			const plankCount = Math.floor(length / 0.25);
			for (let i = 0; i < plankCount; i++) {
				const plankX = (i / plankCount - 0.5) * length + 0.125;
				const plankWidth = 0.22 + (rng ? (rng.next() - 0.5) * 0.02 : 0);

				const plank = MeshBuilder.CreateBox(
					`${id}_plank_${i}`,
					{ width: plankWidth, height: 0.04, depth: width - 0.1 },
					scene,
				);
				plank.position = new Vector3(
					posX + Math.cos(rotation) * plankX,
					posY,
					posZ - Math.sin(rotation) * plankX,
				);
				plank.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.02 : 0);
				plank.material = deckMat;
				meshes.push(plank);
			}

			// Scaffold poles
			const poleCount = Math.floor(length / 2) + 1;
			for (let p = 0; p < poleCount; p++) {
				const poleX = (p / (poleCount - 1) - 0.5) * length;
				for (const side of [-1, 1]) {
					const pole = MeshBuilder.CreateCylinder(
						`${id}_pole_${p}_${side}`,
						{ height: 0.5, diameter: 0.04 },
						scene,
					);
					pole.position = new Vector3(
						posX +
							Math.cos(rotation) * poleX +
							Math.sin(rotation) * ((side * width) / 2),
						posY - 0.25,
						posZ -
							Math.sin(rotation) * poleX +
							Math.cos(rotation) * ((side * width) / 2),
					);
					pole.material = frameMat;
					meshes.push(pole);
				}
			}
		} else if (style === "pipe") {
			// Pipe-based catwalk
			// Main pipes (walkway)
			const pipeCount = 3;
			for (let i = 0; i < pipeCount; i++) {
				const pipeZ = (i / (pipeCount - 1) - 0.5) * (width - 0.1);
				const pipe = MeshBuilder.CreateCylinder(
					`${id}_pipe_${i}`,
					{ height: length, diameter: 0.08 },
					scene,
				);
				pipe.position = new Vector3(
					posX + Math.sin(rotation) * pipeZ,
					posY - 0.04,
					posZ + Math.cos(rotation) * pipeZ,
				);
				pipe.rotation.z = Math.PI / 2;
				pipe.rotation.y = rotation;
				pipe.material = frameMat;
				meshes.push(pipe);
			}

			// Cross pipes
			const crossCount = Math.floor(length / 1.2);
			for (let c = 0; c <= crossCount; c++) {
				const crossX = (c / crossCount - 0.5) * length;
				const cross = MeshBuilder.CreateCylinder(
					`${id}_cross_${c}`,
					{ height: width, diameter: 0.05 },
					scene,
				);
				cross.position = new Vector3(
					posX + Math.cos(rotation) * crossX,
					posY - 0.04,
					posZ - Math.sin(rotation) * crossX,
				);
				cross.rotation.x = Math.PI / 2;
				cross.rotation.y = rotation;
				cross.material = frameMat;
				meshes.push(cross);
			}

			// Deck grate
			const deck = MeshBuilder.CreateBox(
				`${id}_deck`,
				{ width: length - 0.1, height: 0.02, depth: width - 0.15 },
				scene,
			);
			deck.position = new Vector3(posX, posY + 0.01, posZ);
			deck.rotation.y = rotation;
			deck.material = deckMat;
			meshes.push(deck);
		}

		// Railings
		if (railing !== "none") {
			const sides = railing === "full" ? [-1, 1] : [1];

			for (const side of sides) {
				// Top rail
				const topRail = MeshBuilder.CreateCylinder(
					`${id}_topRail_${side}`,
					{ height: length, diameter: barThickness * 2 },
					scene,
				);
				topRail.position = new Vector3(
					posX + Math.sin(rotation) * (side * (width / 2 + 0.02)),
					posY + railHeight,
					posZ + Math.cos(rotation) * (side * (width / 2 + 0.02)),
				);
				topRail.rotation.z = Math.PI / 2;
				topRail.rotation.y = rotation;
				topRail.material = railMat;
				meshes.push(topRail);

				// Mid rail
				const midRail = MeshBuilder.CreateCylinder(
					`${id}_midRail_${side}`,
					{ height: length, diameter: barThickness * 1.5 },
					scene,
				);
				midRail.position = new Vector3(
					posX + Math.sin(rotation) * (side * (width / 2 + 0.02)),
					posY + railHeight * 0.5,
					posZ + Math.cos(rotation) * (side * (width / 2 + 0.02)),
				);
				midRail.rotation.z = Math.PI / 2;
				midRail.rotation.y = rotation;
				midRail.material = railMat;
				meshes.push(midRail);

				// Posts
				const postCount = Math.floor(length / 1.5) + 1;
				for (let p = 0; p < postCount; p++) {
					const postX = (p / (postCount - 1) - 0.5) * length;
					const post = MeshBuilder.CreateCylinder(
						`${id}_post_${side}_${p}`,
						{ height: railHeight, diameter: barThickness * 2 },
						scene,
					);
					post.position = new Vector3(
						posX +
							Math.cos(rotation) * postX +
							Math.sin(rotation) * (side * (width / 2 + 0.02)),
						posY + railHeight / 2,
						posZ -
							Math.sin(rotation) * postX +
							Math.cos(rotation) * (side * (width / 2 + 0.02)),
					);
					post.material = railMat;
					meshes.push(post);
				}

				// Kick plate (toe board)
				const kickPlate = MeshBuilder.CreateBox(
					`${id}_kick_${side}`,
					{ width: length, height: 0.1, depth: 0.01 },
					scene,
				);
				kickPlate.position = new Vector3(
					posX + Math.sin(rotation) * (side * (width / 2 + 0.02)),
					posY + 0.05,
					posZ + Math.cos(rotation) * (side * (width / 2 + 0.02)),
				);
				kickPlate.rotation.y = rotation;
				kickPlate.material = deckMat;
				meshes.push(kickPlate);
			}
		}

		// Support columns
		if (hasSupports) {
			const supportCount = Math.max(2, Math.floor(length / 3));
			for (let s = 0; s < supportCount; s++) {
				const supportX = (s / (supportCount - 1) - 0.5) * length;

				// Main column
				const column = MeshBuilder.CreateCylinder(
					`${id}_column_${s}`,
					{ height: posY, diameter: 0.08 },
					scene,
				);
				column.position = new Vector3(
					posX + Math.cos(rotation) * supportX,
					posY / 2,
					posZ - Math.sin(rotation) * supportX,
				);
				column.material = frameMat;
				meshes.push(column);

				// Diagonal braces
				for (const dir of [-1, 1]) {
					const braceLength = Math.sqrt(posY ** 2 / 4 + 1);
					const brace = MeshBuilder.CreateCylinder(
						`${id}_colBrace_${s}_${dir}`,
						{ height: braceLength, diameter: 0.04 },
						scene,
					);
					brace.position = new Vector3(
						posX + Math.cos(rotation) * (supportX + dir * 0.5),
						posY * 0.6,
						posZ - Math.sin(rotation) * (supportX + dir * 0.5),
					);
					brace.rotation.z = dir * Math.atan2(1, posY / 2);
					brace.rotation.y = rotation;
					brace.material = frameMat;
					meshes.push(brace);
				}
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			frameMat.dispose();
			deckMat.dispose();
			railMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		style,
		length,
		width,
		railing,
		rotation,
		rust,
		hasSupports,
		seed,
	]);

	return null;
}
