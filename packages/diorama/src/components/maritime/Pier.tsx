/**
 * Pier - Extended dock/jetty for boat access
 *
 * Water-level structures for the flooded city.
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

export type PierStyle = "wooden" | "concrete" | "floating" | "industrial";

export interface PierProps {
	id: string;
	position: Vector3;
	/** Length of pier */
	length?: number;
	/** Width of pier */
	width?: number;
	/** Style */
	style?: PierStyle;
	/** Water level (Y position) */
	waterLevel?: number;
	/** Has cleats for boat mooring */
	cleats?: boolean;
	/** Has lighting */
	lights?: boolean;
	/** Direction pier extends (radians) */
	rotation?: number;
	/** Weathering level 0-1 */
	weathering?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Pier({
	id,
	position,
	length = 8,
	width = 2.5,
	style = "wooden",
	waterLevel = 0,
	cleats = true,
	lights = false,
	rotation = 0,
	weathering = 0.3,
	seed,
}: PierProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const weatherVariation = weathering * (rng ? rng.next() * 0.1 : 0.05);

		// Deck material
		const deckMat = new PBRMaterial(`pier_deck_${id}`, scene);
		if (style === "wooden") {
			deckMat.albedoColor = new Color3(
				0.4 - weatherVariation,
				0.3 - weatherVariation,
				0.2 - weatherVariation,
			);
			deckMat.metallic = 0;
			deckMat.roughness = 0.85;
		} else if (style === "concrete") {
			deckMat.albedoColor = new Color3(
				0.55 - weatherVariation,
				0.55 - weatherVariation,
				0.57 - weatherVariation,
			);
			deckMat.metallic = 0;
			deckMat.roughness = 0.9;
		} else if (style === "floating") {
			deckMat.albedoColor = new Color3(0.3, 0.3, 0.35);
			deckMat.metallic = 0.1;
			deckMat.roughness = 0.7;
		} else {
			deckMat.albedoColor = new Color3(0.35, 0.37, 0.4);
			deckMat.metallic = 0.6;
			deckMat.roughness = 0.5;
		}

		// Piling material
		const pilingMat = new PBRMaterial(`pier_piling_${id}`, scene);
		pilingMat.albedoColor =
			style === "wooden"
				? new Color3(
						0.3 - weatherVariation,
						0.25 - weatherVariation,
						0.15 - weatherVariation,
					)
				: new Color3(0.5, 0.5, 0.52);
		pilingMat.metallic = style === "wooden" ? 0 : 0.1;
		pilingMat.roughness = 0.9;

		const deckHeight = posY;
		const deckThickness = style === "concrete" ? 0.3 : 0.15;

		if (style === "wooden") {
			// Wooden planks
			const plankWidth = 0.2;
			const plankCount = Math.floor(width / plankWidth);
			const plankGap = 0.02;

			for (let i = 0; i < plankCount; i++) {
				const plankOffset = (i - plankCount / 2 + 0.5) * (width / plankCount);
				const plank = MeshBuilder.CreateBox(
					`${id}_plank_${i}`,
					{
						width: plankWidth - plankGap,
						height: deckThickness,
						depth: length,
					},
					scene,
				);
				plank.position = new Vector3(
					posX + Math.cos(rotation + Math.PI / 2) * plankOffset,
					deckHeight - deckThickness / 2,
					posZ + length / 2 + Math.sin(rotation + Math.PI / 2) * plankOffset,
				);
				plank.rotation.y = rotation;
				plank.material = deckMat;
				meshes.push(plank);
			}

			// Support beams
			const beamCount = Math.ceil(length / 2);
			for (let i = 0; i < beamCount; i++) {
				const beamZ = (i + 0.5) * (length / beamCount);
				const beam = MeshBuilder.CreateBox(
					`${id}_beam_${i}`,
					{ width, height: 0.15, depth: 0.2 },
					scene,
				);
				beam.position = new Vector3(
					posX + Math.cos(rotation) * beamZ,
					deckHeight - deckThickness - 0.075,
					posZ + Math.sin(rotation) * beamZ + beamZ,
				);
				beam.rotation.y = rotation;
				beam.material = pilingMat;
				meshes.push(beam);
			}
		} else if (style === "concrete" || style === "industrial") {
			// Solid deck
			const deck = MeshBuilder.CreateBox(
				`${id}_deck`,
				{ width, height: deckThickness, depth: length },
				scene,
			);
			deck.position = new Vector3(
				posX,
				deckHeight - deckThickness / 2,
				posZ + length / 2,
			);
			deck.rotation.y = rotation;
			deck.material = deckMat;
			meshes.push(deck);
		} else if (style === "floating") {
			// Floating pontoon sections
			const sectionCount = Math.ceil(length / 3);
			const sectionLength = length / sectionCount;

			for (let i = 0; i < sectionCount; i++) {
				const sectionZ = (i + 0.5) * sectionLength;
				const section = MeshBuilder.CreateBox(
					`${id}_section_${i}`,
					{ width, height: 0.4, depth: sectionLength - 0.1 },
					scene,
				);
				section.position = new Vector3(
					posX + Math.cos(rotation) * sectionZ,
					waterLevel + 0.15, // Float above water
					posZ + sectionZ,
				);
				section.rotation.y = rotation;
				section.material = deckMat;
				meshes.push(section);
			}
		}

		// Pilings
		if (style !== "floating") {
			const pilingDepth = posY - waterLevel + 2; // Extend below water
			const pilingSpacing = 3;
			const pilingCountLength = Math.ceil(length / pilingSpacing) + 1;

			for (let i = 0; i < pilingCountLength; i++) {
				for (const side of [-1, 1]) {
					const pilingZ = i * pilingSpacing;
					if (pilingZ > length) continue;

					const piling = MeshBuilder.CreateCylinder(
						`${id}_piling_${i}_${side}`,
						{ height: pilingDepth, diameter: style === "wooden" ? 0.25 : 0.35 },
						scene,
					);
					piling.position = new Vector3(
						posX +
							Math.cos(rotation + Math.PI / 2) * (side * (width / 2 - 0.15)) +
							Math.cos(rotation) * pilingZ,
						posY - pilingDepth / 2 - deckThickness,
						posZ +
							pilingZ +
							Math.sin(rotation + Math.PI / 2) * (side * (width / 2 - 0.15)),
					);
					piling.material = pilingMat;
					meshes.push(piling);
				}
			}
		}

		// Cleats for mooring
		if (cleats) {
			const cleatMat = new PBRMaterial(`pier_cleat_${id}`, scene);
			cleatMat.albedoColor = new Color3(0.25, 0.25, 0.27);
			cleatMat.metallic = 0.9;
			cleatMat.roughness = 0.4;

			const cleatSpacing = 4;
			const cleatCount = Math.floor(length / cleatSpacing);

			for (let i = 0; i < cleatCount; i++) {
				for (const side of [-1, 1]) {
					const cleatZ =
						((i + 0.5) * (length / cleatCount) * cleatSpacing) /
						(length / cleatCount);
					if (cleatZ > length - 1) continue;

					// Cleat base
					const cleatBase = MeshBuilder.CreateCylinder(
						`${id}_cleat_${i}_${side}`,
						{ height: 0.15, diameter: 0.15 },
						scene,
					);
					cleatBase.position = new Vector3(
						posX +
							Math.cos(rotation + Math.PI / 2) * (side * (width / 2 - 0.3)) +
							Math.cos(rotation) * cleatZ,
						deckHeight + 0.075,
						posZ +
							cleatZ +
							Math.sin(rotation + Math.PI / 2) * (side * (width / 2 - 0.3)),
					);
					cleatBase.material = cleatMat;
					meshes.push(cleatBase);

					// Cleat horns
					const horn = MeshBuilder.CreateCylinder(
						`${id}_cleat_horn_${i}_${side}`,
						{ height: 0.2, diameter: 0.05 },
						scene,
					);
					horn.position = new Vector3(
						posX +
							Math.cos(rotation + Math.PI / 2) * (side * (width / 2 - 0.3)) +
							Math.cos(rotation) * cleatZ,
						deckHeight + 0.2,
						posZ +
							cleatZ +
							Math.sin(rotation + Math.PI / 2) * (side * (width / 2 - 0.3)),
					);
					horn.rotation.z = Math.PI / 2;
					horn.rotation.y = rotation;
					horn.material = cleatMat;
					meshes.push(horn);
				}
			}
		}

		// Lights
		if (lights) {
			const lightMat = new PBRMaterial(`pier_light_${id}`, scene);
			lightMat.albedoColor = new Color3(1, 0.9, 0.7);
			lightMat.emissiveColor = new Color3(1, 0.9, 0.7);
			lightMat.metallic = 0;
			lightMat.roughness = 0.3;

			const poleMat = new PBRMaterial(`pier_pole_${id}`, scene);
			poleMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			poleMat.metallic = 0.8;
			poleMat.roughness = 0.4;

			const lightSpacing = 6;
			const lightCount = Math.floor(length / lightSpacing);

			for (let i = 0; i < lightCount; i++) {
				const lightZ = (i + 0.5) * lightSpacing;

				// Pole
				const pole = MeshBuilder.CreateCylinder(
					`${id}_light_pole_${i}`,
					{ height: 2.5, diameter: 0.08 },
					scene,
				);
				pole.position = new Vector3(
					posX +
						Math.cos(rotation + Math.PI / 2) * (width / 2 - 0.2) +
						Math.cos(rotation) * lightZ,
					deckHeight + 1.25,
					posZ + lightZ + Math.sin(rotation + Math.PI / 2) * (width / 2 - 0.2),
				);
				pole.material = poleMat;
				meshes.push(pole);

				// Light fixture
				const fixture = MeshBuilder.CreateSphere(
					`${id}_light_${i}`,
					{ diameter: 0.25 },
					scene,
				);
				fixture.position = new Vector3(
					posX +
						Math.cos(rotation + Math.PI / 2) * (width / 2 - 0.2) +
						Math.cos(rotation) * lightZ,
					deckHeight + 2.6,
					posZ + lightZ + Math.sin(rotation + Math.PI / 2) * (width / 2 - 0.2),
				);
				fixture.material = lightMat;
				meshes.push(fixture);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			deckMat.dispose();
			pilingMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		length,
		width,
		style,
		waterLevel,
		cleats,
		lights,
		rotation,
		weathering,
		seed,
	]);

	return null;
}
