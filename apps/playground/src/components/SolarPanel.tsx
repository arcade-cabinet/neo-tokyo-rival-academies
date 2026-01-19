/**
 * SolarPanel - Solar panel array components
 *
 * Various solar panel configurations for rooftops in the flooded Neo-Tokyo environment.
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

export type SolarPanelType = "residential" | "commercial" | "tracker" | "integrated";

export type SolarPanelCondition = "pristine" | "worn" | "damaged" | "rusted";

export interface SolarPanelProps {
	id: string;
	position: Vector3;
	/** Solar panel type */
	type?: SolarPanelType;
	/** Rotation (radians) */
	rotation?: number;
	/** Condition of the panels */
	condition?: SolarPanelCondition;
	/** Seed for procedural variation */
	seed?: number;
	/** Width of the panel array */
	width?: number;
	/** Depth of the panel array */
	depth?: number;
	/** Number of panels in the array */
	panelCount?: number;
	/** Tilt angle of panels (radians) */
	tiltAngle?: number;
}

const CONDITION_FACTORS: Record<SolarPanelCondition, number> = {
	pristine: 1.0,
	worn: 0.85,
	damaged: 0.7,
	rusted: 0.55,
};

export function SolarPanel({
	id,
	position,
	type = "residential",
	rotation = 0,
	condition = "worn",
	seed,
	width = 2,
	depth = 1.2,
	panelCount = 4,
	tiltAngle = Math.PI / 8,
}: SolarPanelProps) {
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

		const conditionFactor = CONDITION_FACTORS[condition];
		const ageVariation = rng ? rng.next() * 0.05 : 0.025;

		// Solar cell material (dark blue/black photovoltaic)
		const cellMat = new PBRMaterial(`solar_cell_${id}`, scene);
		cellMat.albedoColor = new Color3(
			0.05 * conditionFactor,
			0.08 * conditionFactor,
			0.18 * conditionFactor
		);
		cellMat.metallic = 0.3;
		cellMat.roughness = 0.15 + (1 - conditionFactor) * 0.2;
		materials.push(cellMat);

		// Frame material (aluminum)
		const frameMat = new PBRMaterial(`solar_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(
			0.7 * conditionFactor - ageVariation,
			0.72 * conditionFactor - ageVariation,
			0.75 * conditionFactor - ageVariation
		);
		frameMat.metallic = 0.9;
		frameMat.roughness = 0.25;
		materials.push(frameMat);

		// Support structure material
		const supportMat = new PBRMaterial(`solar_support_${id}`, scene);
		supportMat.albedoColor = new Color3(
			0.4 * conditionFactor,
			0.42 * conditionFactor,
			0.45 * conditionFactor
		);
		supportMat.metallic = 0.85;
		supportMat.roughness = 0.4;
		materials.push(supportMat);

		const panelWidth = width / Math.max(1, Math.ceil(Math.sqrt(panelCount)));
		const panelDepth = depth;
		const panelThickness = 0.04;

		if (type === "residential") {
			// Simple residential rooftop panels
			const cols = Math.ceil(Math.sqrt(panelCount));
			const rows = Math.ceil(panelCount / cols);
			const spacing = 0.1;

			const totalWidth = cols * panelWidth + (cols - 1) * spacing;
			const totalDepth = rows * panelDepth + (rows - 1) * spacing;

			let panelIndex = 0;
			for (let row = 0; row < rows && panelIndex < panelCount; row++) {
				for (let col = 0; col < cols && panelIndex < panelCount; col++) {
					const offsetX = (col - (cols - 1) / 2) * (panelWidth + spacing);
					const offsetZ = (row - (rows - 1) / 2) * (panelDepth + spacing);

					// Panel cell surface
					const cell = MeshBuilder.CreateBox(
						`${id}_cell_${panelIndex}`,
						{ width: panelWidth - 0.06, height: panelThickness - 0.01, depth: panelDepth - 0.06 },
						scene
					);
					const cellY = posY + Math.sin(tiltAngle) * panelDepth / 2 + 0.15;
					cell.position = new Vector3(
						posX + Math.cos(rotation) * offsetX - Math.sin(rotation) * offsetZ,
						cellY,
						posZ + Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetZ
					);
					cell.rotation.y = rotation;
					cell.rotation.x = -tiltAngle;
					cell.material = cellMat;
					meshes.push(cell);

					// Aluminum frame
					const frame = MeshBuilder.CreateBox(
						`${id}_frame_${panelIndex}`,
						{ width: panelWidth, height: panelThickness, depth: panelDepth },
						scene
					);
					frame.position = new Vector3(
						posX + Math.cos(rotation) * offsetX - Math.sin(rotation) * offsetZ,
						cellY - 0.005,
						posZ + Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetZ
					);
					frame.rotation.y = rotation;
					frame.rotation.x = -tiltAngle;
					frame.material = frameMat;
					meshes.push(frame);

					// Grid lines on panel
					const gridLines = 6;
					for (let g = 1; g < gridLines; g++) {
						const gridLine = MeshBuilder.CreateBox(
							`${id}_grid_${panelIndex}_${g}`,
							{ width: panelWidth - 0.08, height: 0.002, depth: 0.008 },
							scene
						);
						const lineOffset = (g / gridLines - 0.5) * (panelDepth - 0.1);
						gridLine.position = new Vector3(
							posX + Math.cos(rotation) * offsetX - Math.sin(rotation) * (offsetZ + lineOffset * Math.cos(tiltAngle)),
							cellY + 0.022 + lineOffset * Math.sin(tiltAngle),
							posZ + Math.sin(rotation) * offsetX + Math.cos(rotation) * (offsetZ + lineOffset * Math.cos(tiltAngle))
						);
						gridLine.rotation.y = rotation;
						gridLine.rotation.x = -tiltAngle;
						gridLine.material = frameMat;
						meshes.push(gridLine);
					}

					panelIndex++;
				}
			}

			// Simple mounting brackets
			const bracketHeight = 0.15;
			for (const bx of [-1, 1]) {
				for (const bz of [-1, 1]) {
					const bracket = MeshBuilder.CreateBox(
						`${id}_bracket_${bx}_${bz}`,
						{ width: 0.05, height: bracketHeight + Math.sin(tiltAngle) * panelDepth / 2, depth: 0.05 },
						scene
					);
					bracket.position = new Vector3(
						posX + Math.cos(rotation) * (bx * totalWidth / 3) - Math.sin(rotation) * (bz * totalDepth / 3),
						posY + bracketHeight / 2,
						posZ + Math.sin(rotation) * (bx * totalWidth / 3) + Math.cos(rotation) * (bz * totalDepth / 3)
					);
					bracket.rotation.y = rotation;
					bracket.material = supportMat;
					meshes.push(bracket);
				}
			}

		} else if (type === "commercial") {
			// Commercial grade panels with proper racking
			const cols = Math.ceil(panelCount / 2);
			const rows = 2;
			const spacing = 0.15;

			for (let row = 0; row < rows; row++) {
				for (let col = 0; col < cols && (row * cols + col) < panelCount; col++) {
					const offsetX = (col - (cols - 1) / 2) * (panelWidth + spacing);
					const offsetZ = (row - 0.5) * (panelDepth + spacing);

					// Panel
					const panel = MeshBuilder.CreateBox(
						`${id}_panel_${row}_${col}`,
						{ width: panelWidth, height: panelThickness, depth: panelDepth },
						scene
					);
					const panelY = posY + 0.4 + Math.sin(tiltAngle) * panelDepth / 2;
					panel.position = new Vector3(
						posX + Math.cos(rotation) * offsetX - Math.sin(rotation) * offsetZ,
						panelY,
						posZ + Math.sin(rotation) * offsetX + Math.cos(rotation) * offsetZ
					);
					panel.rotation.y = rotation;
					panel.rotation.x = -tiltAngle;
					panel.material = cellMat;
					meshes.push(panel);

					// Frame border
					const frameThickness = 0.03;
					for (const side of ["top", "bottom", "left", "right"] as const) {
						let frameWidth: number;
						let frameDepth: number;
						let frameOffsetX = 0;
						let frameOffsetZ = 0;

						if (side === "top" || side === "bottom") {
							frameWidth = panelWidth;
							frameDepth = frameThickness;
							frameOffsetZ = (side === "top" ? 1 : -1) * (panelDepth / 2 - frameThickness / 2);
						} else {
							frameWidth = frameThickness;
							frameDepth = panelDepth;
							frameOffsetX = (side === "right" ? 1 : -1) * (panelWidth / 2 - frameThickness / 2);
						}

						const framePiece = MeshBuilder.CreateBox(
							`${id}_frame_${row}_${col}_${side}`,
							{ width: frameWidth, height: panelThickness + 0.01, depth: frameDepth },
							scene
						);
						framePiece.position = new Vector3(
							posX + Math.cos(rotation) * (offsetX + frameOffsetX) - Math.sin(rotation) * (offsetZ + frameOffsetZ * Math.cos(tiltAngle)),
							panelY + frameOffsetZ * Math.sin(tiltAngle),
							posZ + Math.sin(rotation) * (offsetX + frameOffsetX) + Math.cos(rotation) * (offsetZ + frameOffsetZ * Math.cos(tiltAngle))
						);
						framePiece.rotation.y = rotation;
						framePiece.rotation.x = -tiltAngle;
						framePiece.material = frameMat;
						meshes.push(framePiece);
					}
				}
			}

			// Racking system
			const railCount = 3;
			const railLength = cols * (panelWidth + spacing);

			for (let rail = 0; rail < railCount; rail++) {
				const railZ = (rail / (railCount - 1) - 0.5) * (rows * (panelDepth + spacing));

				const railBeam = MeshBuilder.CreateBox(
					`${id}_rail_${rail}`,
					{ width: railLength, height: 0.05, depth: 0.08 },
					scene
				);
				railBeam.position = new Vector3(
					posX - Math.sin(rotation) * railZ,
					posY + 0.35,
					posZ + Math.cos(rotation) * railZ
				);
				railBeam.rotation.y = rotation;
				railBeam.material = supportMat;
				meshes.push(railBeam);
			}

			// Support posts
			const postCount = Math.max(2, Math.ceil(cols / 2));
			for (let p = 0; p < postCount; p++) {
				const postX = (p / (postCount - 1) - 0.5) * (railLength - 0.5);

				for (const pz of [-1, 1]) {
					const post = MeshBuilder.CreateCylinder(
						`${id}_post_${p}_${pz}`,
						{ height: 0.4, diameter: 0.06 },
						scene
					);
					post.position = new Vector3(
						posX + Math.cos(rotation) * postX - Math.sin(rotation) * (pz * (panelDepth + spacing / 2)),
						posY + 0.2,
						posZ + Math.sin(rotation) * postX + Math.cos(rotation) * (pz * (panelDepth + spacing / 2))
					);
					post.material = supportMat;
					meshes.push(post);
				}
			}

		} else if (type === "tracker") {
			// Single-axis tracking solar panel
			const trackerWidth = width * 1.5;
			const trackerDepth = depth;

			// Central torque tube
			const tubeLength = trackerWidth * 1.1;
			const torqueTube = MeshBuilder.CreateCylinder(
				`${id}_torque_tube`,
				{ height: tubeLength, diameter: 0.1 },
				scene
			);
			torqueTube.position = new Vector3(posX, posY + 0.8, posZ);
			torqueTube.rotation.z = Math.PI / 2;
			torqueTube.rotation.y = rotation;
			torqueTube.material = supportMat;
			meshes.push(torqueTube);

			// Panels attached to tracker
			const trackerPanels = Math.min(panelCount, 6);
			const trackerSpacing = trackerWidth / trackerPanels;

			for (let tp = 0; tp < trackerPanels; tp++) {
				const tpOffset = (tp - (trackerPanels - 1) / 2) * trackerSpacing;

				// Panel frame
				const tPanel = MeshBuilder.CreateBox(
					`${id}_tracker_panel_${tp}`,
					{ width: trackerSpacing - 0.05, height: panelThickness, depth: trackerDepth },
					scene
				);
				tPanel.position = new Vector3(
					posX + Math.cos(rotation) * tpOffset,
					posY + 0.8,
					posZ - Math.sin(rotation) * tpOffset
				);
				tPanel.rotation.y = rotation;
				tPanel.rotation.x = -tiltAngle;
				tPanel.material = cellMat;
				meshes.push(tPanel);

				// Module clamps
				for (const clampZ of [-1, 1]) {
					const clamp = MeshBuilder.CreateBox(
						`${id}_clamp_${tp}_${clampZ}`,
						{ width: 0.04, height: 0.06, depth: 0.08 },
						scene
					);
					clamp.position = new Vector3(
						posX + Math.cos(rotation) * tpOffset - Math.sin(rotation) * (clampZ * trackerDepth / 3),
						posY + 0.8 - 0.03,
						posZ - Math.sin(rotation) * tpOffset + Math.cos(rotation) * (clampZ * trackerDepth / 3)
					);
					clamp.rotation.y = rotation;
					clamp.material = frameMat;
					meshes.push(clamp);
				}
			}

			// Support posts with bearings
			for (const postSide of [-1, 1]) {
				const postX = postSide * tubeLength / 3;

				// Main post
				const post = MeshBuilder.CreateCylinder(
					`${id}_tracker_post_${postSide}`,
					{ height: 0.8, diameter: 0.12 },
					scene
				);
				post.position = new Vector3(
					posX + Math.cos(rotation) * postX,
					posY + 0.4,
					posZ - Math.sin(rotation) * postX
				);
				post.material = supportMat;
				meshes.push(post);

				// Bearing housing
				const bearing = MeshBuilder.CreateCylinder(
					`${id}_bearing_${postSide}`,
					{ height: 0.15, diameter: 0.18 },
					scene
				);
				bearing.position = new Vector3(
					posX + Math.cos(rotation) * postX,
					posY + 0.8,
					posZ - Math.sin(rotation) * postX
				);
				bearing.rotation.z = Math.PI / 2;
				bearing.rotation.y = rotation;
				bearing.material = frameMat;
				meshes.push(bearing);
			}

			// Drive motor housing
			const motor = MeshBuilder.CreateBox(
				`${id}_motor`,
				{ width: 0.2, height: 0.25, depth: 0.15 },
				scene
			);
			motor.position = new Vector3(
				posX + Math.cos(rotation) * (-tubeLength / 2 - 0.15),
				posY + 0.8,
				posZ - Math.sin(rotation) * (-tubeLength / 2 - 0.15)
			);
			motor.rotation.y = rotation;
			motor.material = supportMat;
			meshes.push(motor);

		} else if (type === "integrated") {
			// Building-integrated photovoltaics (flush mount)
			const intWidth = width;
			const intDepth = depth;
			const intPanels = panelCount;

			const cols = Math.ceil(Math.sqrt(intPanels * (intWidth / intDepth)));
			const rows = Math.ceil(intPanels / cols);

			const cellWidth = (intWidth - (cols + 1) * 0.02) / cols;
			const cellDepth = (intDepth - (rows + 1) * 0.02) / rows;

			// Base mounting surface
			const baseSurface = MeshBuilder.CreateBox(
				`${id}_base`,
				{ width: intWidth, height: 0.02, depth: intDepth },
				scene
			);
			baseSurface.position = new Vector3(posX, posY + 0.01, posZ);
			baseSurface.rotation.y = rotation;
			baseSurface.rotation.x = -tiltAngle;
			baseSurface.material = frameMat;
			meshes.push(baseSurface);

			// Individual cells in grid
			let cellIndex = 0;
			for (let row = 0; row < rows && cellIndex < intPanels; row++) {
				for (let col = 0; col < cols && cellIndex < intPanels; col++) {
					const cellOffsetX = (col - (cols - 1) / 2) * (cellWidth + 0.02);
					const cellOffsetZ = (row - (rows - 1) / 2) * (cellDepth + 0.02);

					const cell = MeshBuilder.CreateBox(
						`${id}_int_cell_${cellIndex}`,
						{ width: cellWidth, height: 0.015, depth: cellDepth },
						scene
					);

					const baseY = posY + 0.02;
					const adjustedZ = cellOffsetZ * Math.cos(tiltAngle);
					const adjustedY = baseY + cellOffsetZ * Math.sin(tiltAngle);

					cell.position = new Vector3(
						posX + Math.cos(rotation) * cellOffsetX - Math.sin(rotation) * adjustedZ,
						adjustedY + 0.0075,
						posZ + Math.sin(rotation) * cellOffsetX + Math.cos(rotation) * adjustedZ
					);
					cell.rotation.y = rotation;
					cell.rotation.x = -tiltAngle;
					cell.material = cellMat;
					meshes.push(cell);

					cellIndex++;
				}
			}

			// Junction box
			const junctionBox = MeshBuilder.CreateBox(
				`${id}_junction`,
				{ width: 0.15, height: 0.05, depth: 0.1 },
				scene
			);
			junctionBox.position = new Vector3(
				posX + Math.cos(rotation) * (intWidth / 2 - 0.1) - Math.sin(rotation) * (-intDepth / 2 + 0.1),
				posY + 0.05,
				posZ + Math.sin(rotation) * (intWidth / 2 - 0.1) + Math.cos(rotation) * (-intDepth / 2 + 0.1)
			);
			junctionBox.rotation.y = rotation;
			junctionBox.material = supportMat;
			meshes.push(junctionBox);

			// Conduit
			const conduit = MeshBuilder.CreateCylinder(
				`${id}_conduit`,
				{ height: 0.3, diameter: 0.025 },
				scene
			);
			conduit.position = new Vector3(
				posX + Math.cos(rotation) * (intWidth / 2 + 0.05) - Math.sin(rotation) * (-intDepth / 2 + 0.1),
				posY - 0.1,
				posZ + Math.sin(rotation) * (intWidth / 2 + 0.05) + Math.cos(rotation) * (-intDepth / 2 + 0.1)
			);
			conduit.material = supportMat;
			meshes.push(conduit);
		}

		// Damage/weathering effects
		if ((condition === "damaged" || condition === "rusted") && rng) {
			const damageMat = new PBRMaterial(`solar_damage_${id}`, scene);
			damageMat.albedoColor = new Color3(0.3, 0.32, 0.35);
			damageMat.metallic = 0.2;
			damageMat.roughness = 0.8;
			damageMat.alpha = 0.7;
			materials.push(damageMat);

			// Cracked/damaged cells
			const damageCount = condition === "rusted" ? 3 : 1;
			for (let d = 0; d < damageCount; d++) {
				const crack = MeshBuilder.CreateBox(
					`${id}_crack_${d}`,
					{
						width: panelWidth * (0.3 + rng.next() * 0.4),
						height: 0.005,
						depth: 0.02,
					},
					scene
				);
				crack.position = new Vector3(
					posX + (rng.next() - 0.5) * width * 0.6,
					posY + 0.25 + rng.next() * 0.2,
					posZ + (rng.next() - 0.5) * depth * 0.4
				);
				crack.rotation.y = rotation + rng.next() * Math.PI;
				crack.rotation.x = -tiltAngle;
				crack.material = damageMat;
				meshes.push(crack);
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
	}, [scene, id, posX, posY, posZ, type, rotation, condition, seed, width, depth, panelCount, tiltAngle]);

	return null;
}
