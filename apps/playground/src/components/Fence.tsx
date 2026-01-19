/**
 * Fence - Barrier/boundary component
 *
 * Various fence types for property boundaries and restricted areas.
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

export type FenceStyle = "chainlink" | "wooden" | "metal" | "concrete" | "barbed" | "bamboo";
export type FenceCondition = "new" | "weathered" | "damaged" | "overgrown";

export interface FenceProps {
	id: string;
	position: Vector3;
	/** Fence style */
	style?: FenceStyle;
	/** Length of fence segment */
	length?: number;
	/** Height of fence */
	height?: number;
	/** Fence condition */
	condition?: FenceCondition;
	/** Direction fence faces (radians) */
	rotation?: number;
	/** Has gate opening */
	hasGate?: boolean;
	/** Gate is open */
	gateOpen?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

export function Fence({
	id,
	position,
	style = "chainlink",
	length = 4,
	height = 2,
	condition = "weathered",
	rotation = 0,
	hasGate = false,
	gateOpen = false,
	seed,
}: FenceProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = condition === "new" ? 1 : condition === "weathered" ? 0.8 : condition === "damaged" ? 0.6 : 0.5;

		// Post material
		const postMat = new PBRMaterial(`fence_post_${id}`, scene);
		const panelMat = new PBRMaterial(`fence_panel_${id}`, scene);

		if (style === "chainlink") {
			postMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
			postMat.metallic = 0.8;
			postMat.roughness = 0.5;
			panelMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
			panelMat.metallic = 0.7;
			panelMat.roughness = 0.4;
			panelMat.alpha = 0.8;
		} else if (style === "wooden") {
			postMat.albedoColor = new Color3(0.4, 0.3, 0.2).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.85;
			panelMat.albedoColor = new Color3(0.45, 0.35, 0.22).scale(conditionFactor);
			panelMat.metallic = 0;
			panelMat.roughness = 0.8;
		} else if (style === "metal") {
			postMat.albedoColor = new Color3(0.25, 0.25, 0.28).scale(conditionFactor);
			postMat.metallic = 0.9;
			postMat.roughness = 0.3;
			panelMat.albedoColor = new Color3(0.3, 0.3, 0.33).scale(conditionFactor);
			panelMat.metallic = 0.85;
			panelMat.roughness = 0.35;
		} else if (style === "concrete") {
			postMat.albedoColor = new Color3(0.6, 0.58, 0.55).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.9;
			panelMat.albedoColor = new Color3(0.55, 0.53, 0.5).scale(conditionFactor);
			panelMat.metallic = 0;
			panelMat.roughness = 0.85;
		} else if (style === "bamboo") {
			postMat.albedoColor = new Color3(0.65, 0.55, 0.35).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.75;
			panelMat.albedoColor = new Color3(0.6, 0.5, 0.3).scale(conditionFactor);
			panelMat.metallic = 0;
			panelMat.roughness = 0.7;
		} else {
			// Barbed wire
			postMat.albedoColor = new Color3(0.35, 0.32, 0.3).scale(conditionFactor);
			postMat.metallic = 0.7;
			postMat.roughness = 0.6;
			panelMat.albedoColor = new Color3(0.4, 0.4, 0.42).scale(conditionFactor);
			panelMat.metallic = 0.8;
			panelMat.roughness = 0.5;
		}

		const postRadius = style === "wooden" ? 0.06 : style === "bamboo" ? 0.04 : 0.04;
		const postSpacing = style === "chainlink" || style === "barbed" ? 2.5 : 2;
		const postCount = Math.ceil(length / postSpacing) + 1;

		// Create posts
		for (let i = 0; i < postCount; i++) {
			const postX = (i - (postCount - 1) / 2) * postSpacing;

			// Skip post at gate position if gate exists
			if (hasGate && i === Math.floor(postCount / 2)) continue;

			const postHeight = height + (rng ? (rng.next() - 0.5) * 0.1 : 0);
			const post = MeshBuilder.CreateCylinder(
				`${id}_post_${i}`,
				{ height: postHeight, diameter: postRadius * 2 },
				scene
			);
			post.position = new Vector3(
				posX + Math.cos(rotation) * postX,
				posY + postHeight / 2,
				posZ - Math.sin(rotation) * postX
			);
			post.material = postMat;
			meshes.push(post);

			// Post cap
			if (style !== "barbed") {
				const cap = MeshBuilder.CreateSphere(
					`${id}_cap_${i}`,
					{ diameter: postRadius * 2.5 },
					scene
				);
				cap.position = new Vector3(
					posX + Math.cos(rotation) * postX,
					posY + postHeight + postRadius * 0.5,
					posZ - Math.sin(rotation) * postX
				);
				cap.material = postMat;
				meshes.push(cap);
			}
		}

		// Create panels/wires between posts
		if (style === "chainlink") {
			// Mesh panel
			const gateWidth = hasGate ? 1.5 : 0;
			const panelLength = length - gateWidth;

			const panel = MeshBuilder.CreateBox(
				`${id}_panel`,
				{ width: panelLength, height: height - 0.2, depth: 0.02 },
				scene
			);
			const panelOffset = hasGate ? -gateWidth / 2 : 0;
			panel.position = new Vector3(
				posX + Math.cos(rotation) * panelOffset,
				posY + height / 2,
				posZ - Math.sin(rotation) * panelOffset
			);
			panel.rotation.y = rotation;
			panel.material = panelMat;
			meshes.push(panel);

			// Top rail
			const topRail = MeshBuilder.CreateCylinder(
				`${id}_topRail`,
				{ height: panelLength, diameter: 0.04 },
				scene
			);
			topRail.position = new Vector3(
				posX + Math.cos(rotation) * panelOffset,
				posY + height - 0.05,
				posZ - Math.sin(rotation) * panelOffset
			);
			topRail.rotation.z = Math.PI / 2;
			topRail.rotation.y = rotation;
			topRail.material = postMat;
			meshes.push(topRail);
		} else if (style === "wooden") {
			// Horizontal rails and vertical slats
			const railCount = 2;
			for (let r = 0; r < railCount; r++) {
				const railY = height * (r + 1) / (railCount + 1);
				const rail = MeshBuilder.CreateBox(
					`${id}_rail_${r}`,
					{ width: length, height: 0.08, depth: 0.04 },
					scene
				);
				rail.position = new Vector3(posX, posY + railY, posZ);
				rail.rotation.y = rotation;
				rail.material = postMat;
				meshes.push(rail);
			}

			// Vertical slats
			const slatCount = Math.floor(length / 0.15);
			for (let s = 0; s < slatCount; s++) {
				const slatX = (s - (slatCount - 1) / 2) * 0.15;
				const slatHeight = height - 0.1 + (rng ? (rng.next() - 0.5) * 0.05 : 0);

				// Skip slats at gate
				if (hasGate && Math.abs(slatX) < 0.75) continue;

				const slat = MeshBuilder.CreateBox(
					`${id}_slat_${s}`,
					{ width: 0.1, height: slatHeight, depth: 0.02 },
					scene
				);
				slat.position = new Vector3(
					posX + Math.cos(rotation) * slatX,
					posY + slatHeight / 2,
					posZ - Math.sin(rotation) * slatX
				);
				slat.rotation.y = rotation;
				slat.material = panelMat;
				meshes.push(slat);
			}
		} else if (style === "barbed") {
			// Wire strands
			const wireCount = 4;
			for (let w = 0; w < wireCount; w++) {
				const wireY = height * (w + 1) / (wireCount + 1);
				const wire = MeshBuilder.CreateCylinder(
					`${id}_wire_${w}`,
					{ height: length, diameter: 0.01 },
					scene
				);
				wire.position = new Vector3(posX, posY + wireY, posZ);
				wire.rotation.z = Math.PI / 2;
				wire.rotation.y = rotation;
				wire.material = panelMat;
				meshes.push(wire);
			}

			// Barbs (simplified)
			const barbCount = Math.floor(length * 3);
			for (let b = 0; b < barbCount; b++) {
				const barbX = (b - (barbCount - 1) / 2) * (length / barbCount);
				const wireIndex = b % wireCount;
				const wireY = height * (wireIndex + 1) / (wireCount + 1);

				const barb = MeshBuilder.CreateBox(
					`${id}_barb_${b}`,
					{ width: 0.03, height: 0.03, depth: 0.01 },
					scene
				);
				barb.position = new Vector3(
					posX + Math.cos(rotation) * barbX,
					posY + wireY,
					posZ - Math.sin(rotation) * barbX
				);
				barb.rotation.y = rotation + (rng ? rng.next() * Math.PI : Math.PI / 4);
				barb.material = panelMat;
				meshes.push(barb);
			}
		} else if (style === "concrete") {
			// Solid panels
			const panel = MeshBuilder.CreateBox(
				`${id}_panel`,
				{ width: length, height: height - 0.1, depth: 0.15 },
				scene
			);
			panel.position = new Vector3(posX, posY + (height - 0.1) / 2, posZ);
			panel.rotation.y = rotation;
			panel.material = panelMat;
			meshes.push(panel);
		} else if (style === "metal") {
			// Vertical bars
			const barCount = Math.floor(length / 0.12);
			for (let b = 0; b < barCount; b++) {
				const barX = (b - (barCount - 1) / 2) * 0.12;

				if (hasGate && Math.abs(barX) < 0.75) continue;

				const bar = MeshBuilder.CreateCylinder(
					`${id}_bar_${b}`,
					{ height: height - 0.1, diameter: 0.02 },
					scene
				);
				bar.position = new Vector3(
					posX + Math.cos(rotation) * barX,
					posY + (height - 0.1) / 2,
					posZ - Math.sin(rotation) * barX
				);
				bar.material = panelMat;
				meshes.push(bar);
			}

			// Top rail
			const topRail = MeshBuilder.CreateBox(
				`${id}_topRail`,
				{ width: length, height: 0.04, depth: 0.04 },
				scene
			);
			topRail.position = new Vector3(posX, posY + height - 0.02, posZ);
			topRail.rotation.y = rotation;
			topRail.material = postMat;
			meshes.push(topRail);
		} else if (style === "bamboo") {
			// Bamboo poles
			const poleCount = Math.floor(length / 0.08);
			for (let p = 0; p < poleCount; p++) {
				const poleX = (p - (poleCount - 1) / 2) * 0.08;
				const poleHeight = height - 0.05 + (rng ? (rng.next() - 0.5) * 0.15 : 0);

				if (hasGate && Math.abs(poleX) < 0.75) continue;

				const pole = MeshBuilder.CreateCylinder(
					`${id}_pole_${p}`,
					{ height: poleHeight, diameter: 0.03 + (rng ? rng.next() * 0.01 : 0) },
					scene
				);
				pole.position = new Vector3(
					posX + Math.cos(rotation) * poleX,
					posY + poleHeight / 2,
					posZ - Math.sin(rotation) * poleX
				);
				pole.material = panelMat;
				meshes.push(pole);
			}

			// Horizontal bindings
			for (let h = 0; h < 3; h++) {
				const bindY = height * (h + 1) / 4;
				const binding = MeshBuilder.CreateCylinder(
					`${id}_bind_${h}`,
					{ height: length, diameter: 0.015 },
					scene
				);
				binding.position = new Vector3(posX, posY + bindY, posZ);
				binding.rotation.z = Math.PI / 2;
				binding.rotation.y = rotation;
				binding.material = postMat;
				meshes.push(binding);
			}
		}

		// Gate (if present and open)
		if (hasGate && !gateOpen) {
			const gateMat = new PBRMaterial(`fence_gate_${id}`, scene);
			gateMat.albedoColor = panelMat.albedoColor;
			gateMat.metallic = panelMat.metallic;
			gateMat.roughness = panelMat.roughness;

			const gate = MeshBuilder.CreateBox(
				`${id}_gate`,
				{ width: 1.2, height: height - 0.3, depth: 0.03 },
				scene
			);
			gate.position = new Vector3(posX, posY + (height - 0.3) / 2 + 0.1, posZ);
			gate.rotation.y = rotation;
			gate.material = gateMat;
			meshes.push(gate);
		}

		// Overgrown condition - add vines
		if (condition === "overgrown" && rng) {
			const vineMat = new PBRMaterial(`fence_vine_${id}`, scene);
			vineMat.albedoColor = new Color3(0.2, 0.4, 0.15);
			vineMat.metallic = 0;
			vineMat.roughness = 0.9;

			const vineCount = Math.floor(rng.next() * 5) + 3;
			for (let v = 0; v < vineCount; v++) {
				const vineX = (rng.next() - 0.5) * length;
				const vine = MeshBuilder.CreateBox(
					`${id}_vine_${v}`,
					{ width: 0.2 + rng.next() * 0.3, height: height * (0.3 + rng.next() * 0.5), depth: 0.05 },
					scene
				);
				vine.position = new Vector3(
					posX + Math.cos(rotation) * vineX + Math.sin(rotation) * 0.05,
					posY + height * 0.3 + rng.next() * height * 0.3,
					posZ - Math.sin(rotation) * vineX + Math.cos(rotation) * 0.05
				);
				vine.rotation.y = rotation;
				vine.material = vineMat;
				meshes.push(vine);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			postMat.dispose();
			panelMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, style, length, height, condition, rotation, hasGate, gateOpen, seed]);

	return null;
}
