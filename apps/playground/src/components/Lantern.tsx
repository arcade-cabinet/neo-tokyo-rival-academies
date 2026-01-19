/**
 * Lantern - Decorative hanging lanterns
 *
 * Japanese and decorative lanterns for atmosphere.
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

export type LanternType = "paper" | "stone" | "metal" | "festival" | "camping";

export interface LanternProps {
	id: string;
	position: Vector3;
	/** Lantern type */
	type?: LanternType;
	/** Lantern color */
	color?: "red" | "white" | "orange" | "yellow" | "green" | "blue";
	/** Is lit */
	isLit?: boolean;
	/** Size multiplier */
	size?: number;
	/** Has hanging cord */
	hasHanger?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Lantern({
	id,
	position,
	type = "paper",
	color = "red",
	isLit = true,
	size = 1,
	hasHanger = true,
	condition = 0.9,
	rotation = 0,
	seed,
}: LanternProps) {
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

		// Get color value
		const getColor = (colorName: string): Color3 => {
			switch (colorName) {
				case "red": return new Color3(0.85, 0.15, 0.1);
				case "white": return new Color3(0.95, 0.92, 0.85);
				case "orange": return new Color3(0.95, 0.5, 0.1);
				case "yellow": return new Color3(0.95, 0.9, 0.3);
				case "green": return new Color3(0.2, 0.6, 0.3);
				case "blue": return new Color3(0.2, 0.4, 0.7);
				default: return new Color3(0.85, 0.15, 0.1);
			}
		};

		const baseColor = getColor(color);
		const baseRadius = 0.15 * size;
		const baseHeight = 0.3 * size;

		if (type === "paper") {
			// Japanese paper lantern
			const paperMat = new PBRMaterial(`lantern_paper_${id}`, scene);
			paperMat.albedoColor = baseColor.scale(conditionFactor);
			paperMat.metallic = 0;
			paperMat.roughness = 0.8;
			if (isLit) {
				paperMat.emissiveColor = baseColor.scale(0.4);
			}
			paperMat.alpha = 0.85;

			// Main body (sphere stretched)
			const body = MeshBuilder.CreateSphere(
				`${id}_body`,
				{ diameter: baseRadius * 2, segments: 16 },
				scene
			);
			body.position = new Vector3(posX, posY, posZ);
			body.scaling = new Vector3(1, baseHeight / baseRadius, 1);
			body.material = paperMat;
			meshes.push(body);

			// Frame rings
			const frameMat = new PBRMaterial(`lantern_frame_${id}`, scene);
			frameMat.albedoColor = new Color3(0.2, 0.15, 0.1);
			frameMat.metallic = 0;
			frameMat.roughness = 0.9;

			const ringCount = 4;
			for (let r = 0; r < ringCount; r++) {
				const ringY = (r / (ringCount - 1) - 0.5) * baseHeight * 1.5;
				const ringRadius = baseRadius * Math.cos((r / (ringCount - 1) - 0.5) * Math.PI * 0.8);

				const ring = MeshBuilder.CreateTorus(
					`${id}_ring_${r}`,
					{ diameter: ringRadius * 2, thickness: 0.01, tessellation: 16 },
					scene
				);
				ring.position = new Vector3(posX, posY + ringY, posZ);
				ring.rotation.x = Math.PI / 2;
				ring.material = frameMat;
				meshes.push(ring);
			}

			// Top and bottom caps
			for (const side of [-1, 1]) {
				const cap = MeshBuilder.CreateCylinder(
					`${id}_cap_${side}`,
					{ height: 0.03, diameter: baseRadius * 0.5, tessellation: 12 },
					scene
				);
				cap.position = new Vector3(posX, posY + side * baseHeight * 0.8, posZ);
				cap.material = frameMat;
				meshes.push(cap);
			}

		} else if (type === "stone") {
			// Japanese stone lantern (toro)
			const stoneMat = new PBRMaterial(`lantern_stone_${id}`, scene);
			stoneMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(conditionFactor);
			stoneMat.metallic = 0;
			stoneMat.roughness = 0.95;

			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: baseHeight * 0.3, diameter: baseRadius * 3, tessellation: 6 },
				scene
			);
			base.position = new Vector3(posX, posY + baseHeight * 0.15, posZ);
			base.material = stoneMat;
			meshes.push(base);

			// Stem
			const stem = MeshBuilder.CreateCylinder(
				`${id}_stem`,
				{ height: baseHeight * 1.5, diameter: baseRadius * 0.8, tessellation: 6 },
				scene
			);
			stem.position = new Vector3(posX, posY + baseHeight * 0.3 + baseHeight * 0.75, posZ);
			stem.material = stoneMat;
			meshes.push(stem);

			// Light box
			const boxMat = new PBRMaterial(`lantern_box_${id}`, scene);
			boxMat.albedoColor = stoneMat.albedoColor;
			boxMat.metallic = 0;
			boxMat.roughness = 0.9;

			const lightBox = MeshBuilder.CreateBox(
				`${id}_lightbox`,
				{ width: baseRadius * 2, height: baseHeight * 0.8, depth: baseRadius * 2 },
				scene
			);
			lightBox.position = new Vector3(posX, posY + baseHeight * 1.45, posZ);
			lightBox.rotation.y = rotation + Math.PI / 4;
			lightBox.material = boxMat;
			meshes.push(lightBox);

			// Window openings
			if (isLit) {
				const glowMat = new PBRMaterial(`lantern_glow_${id}`, scene);
				glowMat.albedoColor = new Color3(1.0, 0.9, 0.6);
				glowMat.emissiveColor = new Color3(0.8, 0.7, 0.4);
				glowMat.metallic = 0;
				glowMat.roughness = 0.5;

				for (let w = 0; w < 4; w++) {
					const windowAngle = rotation + Math.PI / 4 + w * Math.PI / 2;
					const window = MeshBuilder.CreatePlane(
						`${id}_window_${w}`,
						{ width: baseRadius * 0.8, height: baseHeight * 0.5 },
						scene
					);
					window.position = new Vector3(
						posX + Math.cos(windowAngle) * baseRadius * 1.01,
						posY + baseHeight * 1.45,
						posZ + Math.sin(windowAngle) * baseRadius * 1.01
					);
					window.rotation.y = windowAngle + Math.PI / 2;
					window.material = glowMat;
					meshes.push(window);
				}
			}

			// Roof
			const roof = MeshBuilder.CreateCylinder(
				`${id}_roof`,
				{ height: baseHeight * 0.4, diameterTop: 0.02, diameterBottom: baseRadius * 2.5, tessellation: 4 },
				scene
			);
			roof.position = new Vector3(posX, posY + baseHeight * 2.05, posZ);
			roof.rotation.y = rotation + Math.PI / 4;
			roof.material = stoneMat;
			meshes.push(roof);

		} else if (type === "metal") {
			// Metal lantern
			const metalMat = new PBRMaterial(`lantern_metal_${id}`, scene);
			metalMat.albedoColor = new Color3(0.25, 0.27, 0.3).scale(conditionFactor);
			metalMat.metallic = 0.8;
			metalMat.roughness = 0.4;

			// Main housing
			const housing = MeshBuilder.CreateCylinder(
				`${id}_housing`,
				{ height: baseHeight, diameter: baseRadius * 2, tessellation: 8 },
				scene
			);
			housing.position = new Vector3(posX, posY, posZ);
			housing.material = metalMat;
			meshes.push(housing);

			// Glass panels
			const glassMat = new PBRMaterial(`lantern_glass_${id}`, scene);
			glassMat.albedoColor = new Color3(0.8, 0.85, 0.9);
			glassMat.metallic = 0.1;
			glassMat.roughness = 0.1;
			glassMat.alpha = 0.6;
			if (isLit) {
				glassMat.emissiveColor = new Color3(0.6, 0.55, 0.4);
			}

			for (let p = 0; p < 4; p++) {
				const panelAngle = rotation + p * Math.PI / 2;
				const panel = MeshBuilder.CreatePlane(
					`${id}_panel_${p}`,
					{ width: baseRadius * 1.2, height: baseHeight * 0.7 },
					scene
				);
				panel.position = new Vector3(
					posX + Math.cos(panelAngle) * baseRadius * 0.95,
					posY,
					posZ + Math.sin(panelAngle) * baseRadius * 0.95
				);
				panel.rotation.y = panelAngle + Math.PI / 2;
				panel.material = glassMat;
				meshes.push(panel);
			}

			// Top cap
			const topCap = MeshBuilder.CreateCylinder(
				`${id}_topcap`,
				{ height: 0.05, diameterTop: baseRadius * 0.8, diameterBottom: baseRadius * 2.1, tessellation: 8 },
				scene
			);
			topCap.position = new Vector3(posX, posY + baseHeight / 2 + 0.025, posZ);
			topCap.material = metalMat;
			meshes.push(topCap);

		} else if (type === "festival") {
			// Festival string lantern
			const festivalMat = new PBRMaterial(`lantern_festival_${id}`, scene);
			festivalMat.albedoColor = baseColor.scale(conditionFactor);
			festivalMat.metallic = 0;
			festivalMat.roughness = 0.7;
			if (isLit) {
				festivalMat.emissiveColor = baseColor.scale(0.5);
			}
			festivalMat.alpha = 0.9;

			// Round lantern body
			const body = MeshBuilder.CreateSphere(
				`${id}_body`,
				{ diameter: baseRadius * 2.5, segments: 12 },
				scene
			);
			body.position = new Vector3(posX, posY, posZ);
			body.material = festivalMat;
			meshes.push(body);

			// Wire frame
			const wireMat = new PBRMaterial(`lantern_wire_${id}`, scene);
			wireMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			wireMat.metallic = 0.7;
			wireMat.roughness = 0.5;

			// Vertical wires
			const wireCount = 8;
			for (let w = 0; w < wireCount; w++) {
				const wireAngle = (w / wireCount) * Math.PI * 2;
				const wire = MeshBuilder.CreateCylinder(
					`${id}_wire_${w}`,
					{ height: baseRadius * 2.4, diameter: 0.01 },
					scene
				);
				wire.position = new Vector3(
					posX + Math.cos(wireAngle) * baseRadius * 1.2,
					posY,
					posZ + Math.sin(wireAngle) * baseRadius * 1.2
				);
				wire.material = wireMat;
				meshes.push(wire);
			}

		} else {
			// Camping lantern
			const campMat = new PBRMaterial(`lantern_camp_${id}`, scene);
			campMat.albedoColor = new Color3(0.15, 0.35, 0.2).scale(conditionFactor);
			campMat.metallic = 0.6;
			campMat.roughness = 0.4;

			// Body
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: baseHeight, diameter: baseRadius * 2, tessellation: 12 },
				scene
			);
			body.position = new Vector3(posX, posY, posZ);
			body.material = campMat;
			meshes.push(body);

			// Glass globe
			const globeMat = new PBRMaterial(`lantern_globe_${id}`, scene);
			globeMat.albedoColor = new Color3(0.9, 0.88, 0.85);
			globeMat.metallic = 0;
			globeMat.roughness = 0.2;
			globeMat.alpha = 0.7;
			if (isLit) {
				globeMat.emissiveColor = new Color3(0.8, 0.75, 0.5);
			}

			const globe = MeshBuilder.CreateCylinder(
				`${id}_globe`,
				{ height: baseHeight * 0.6, diameter: baseRadius * 1.6, tessellation: 12 },
				scene
			);
			globe.position = new Vector3(posX, posY + baseHeight * 0.1, posZ);
			globe.material = globeMat;
			meshes.push(globe);

			// Handle
			const handleMat = new PBRMaterial(`lantern_handle_${id}`, scene);
			handleMat.albedoColor = new Color3(0.3, 0.32, 0.35);
			handleMat.metallic = 0.8;
			handleMat.roughness = 0.4;

			const handle = MeshBuilder.CreateTorus(
				`${id}_handle`,
				{ diameter: baseRadius * 1.5, thickness: 0.02, tessellation: 16, arc: 0.5 },
				scene
			);
			handle.position = new Vector3(posX, posY + baseHeight / 2 + baseRadius * 0.75, posZ);
			handle.rotation.z = Math.PI;
			handle.material = handleMat;
			meshes.push(handle);
		}

		// Hanging cord
		if (hasHanger && type !== "stone") {
			const cordMat = new PBRMaterial(`lantern_cord_${id}`, scene);
			cordMat.albedoColor = new Color3(0.2, 0.18, 0.15);
			cordMat.metallic = 0;
			cordMat.roughness = 0.9;

			const cordLength = 0.3 * size;
			const cord = MeshBuilder.CreateCylinder(
				`${id}_cord`,
				{ height: cordLength, diameter: 0.01 },
				scene
			);
			cord.position = new Vector3(
				posX,
				posY + (type === "paper" ? baseHeight * 0.8 : baseHeight / 2) + cordLength / 2,
				posZ
			);
			cord.material = cordMat;
			meshes.push(cord);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
		};
	}, [scene, id, posX, posY, posZ, type, color, isLit, size, hasHanger, condition, rotation, seed]);

	return null;
}
