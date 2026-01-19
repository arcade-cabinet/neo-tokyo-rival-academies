/**
 * Awning - Shop awning/canopy component
 *
 * Overhead protection and shade for storefronts.
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

export type AwningStyle = "standard" | "dome" | "flat" | "retractable" | "traditional";
export type AwningFabric = "canvas" | "vinyl" | "metal" | "bamboo";

export interface AwningProps {
	id: string;
	position: Vector3;
	/** Width of awning */
	width?: number;
	/** Projection depth */
	depth?: number;
	/** Style */
	style?: AwningStyle;
	/** Fabric/material type */
	fabric?: AwningFabric;
	/** Primary color */
	color?: Color3;
	/** Has stripes */
	striped?: boolean;
	/** Stripe color (if striped) */
	stripeColor?: Color3;
	/** Direction awning faces (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Awning({
	id,
	position,
	width = 3,
	depth = 1.5,
	style = "standard",
	fabric = "canvas",
	color,
	striped = true,
	stripeColor,
	rotation = 0,
	seed,
}: AwningProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Generate colors if not specified
		const primaryColor = color ?? (rng
			? new Color3(rng.next() * 0.5 + 0.3, rng.next() * 0.3 + 0.1, rng.next() * 0.3 + 0.1)
			: new Color3(0.6, 0.2, 0.1));
		const secondaryColor = stripeColor ?? new Color3(0.95, 0.95, 0.9);

		// Frame material
		const frameMat = new PBRMaterial(`awning_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(0.3, 0.3, 0.32);
		frameMat.metallic = 0.8;
		frameMat.roughness = 0.4;

		// Fabric material
		const fabricMat = new PBRMaterial(`awning_fabric_${id}`, scene);
		fabricMat.albedoColor = primaryColor;
		fabricMat.metallic = fabric === "metal" ? 0.7 : 0;
		fabricMat.roughness = fabric === "metal" ? 0.4 : fabric === "vinyl" ? 0.6 : 0.8;

		const dropAngle = Math.PI / 6; // 30 degrees

		if (style === "standard") {
			// Curved awning shape
			const segments = 8;
			const angleRange = Math.PI / 3;

			for (let i = 0; i < segments; i++) {
				const angle1 = (i / segments) * angleRange;
				const angle2 = ((i + 1) / segments) * angleRange;

				const y1 = Math.cos(angle1) * depth * 0.5;
				const z1 = Math.sin(angle1) * depth;
				const y2 = Math.cos(angle2) * depth * 0.5;
				const z2 = Math.sin(angle2) * depth;

				const segmentMat = striped && i % 2 === 0
					? fabricMat
					: (() => {
						const altMat = new PBRMaterial(`awning_stripe_${id}_${i}`, scene);
						altMat.albedoColor = secondaryColor;
						altMat.metallic = 0;
						altMat.roughness = 0.8;
						return altMat;
					})();

				// Create segment as a box (simplified curve)
				const segmentLength = Math.sqrt((y2 - y1) ** 2 + (z2 - z1) ** 2);
				const segment = MeshBuilder.CreateBox(
					`${id}_segment_${i}`,
					{ width, height: 0.02, depth: segmentLength },
					scene
				);
				segment.position = new Vector3(
					posX,
					posY + (y1 + y2) / 2,
					posZ + (z1 + z2) / 2
				);
				segment.rotation.x = -Math.atan2(y2 - y1, z2 - z1);
				segment.rotation.y = rotation;
				segment.material = segmentMat;
				meshes.push(segment);
			}

			// Valance (front drape)
			const valance = MeshBuilder.CreateBox(
				`${id}_valance`,
				{ width: width + 0.1, height: 0.2, depth: 0.02 },
				scene
			);
			valance.position = new Vector3(posX, posY - 0.1, posZ + depth);
			valance.rotation.y = rotation;
			valance.material = fabricMat;
			meshes.push(valance);
		} else if (style === "flat") {
			// Simple flat awning
			const canopy = MeshBuilder.CreateBox(
				`${id}_canopy`,
				{ width, height: 0.03, depth },
				scene
			);
			canopy.position = new Vector3(posX, posY, posZ + depth / 2);
			canopy.rotation.x = dropAngle;
			canopy.rotation.y = rotation;
			canopy.material = fabricMat;
			meshes.push(canopy);

			// Support brackets
			for (const side of [-1, 1]) {
				const bracket = MeshBuilder.CreateBox(
					`${id}_bracket_${side}`,
					{ width: 0.05, height: 0.05, depth: depth * 0.95 },
					scene
				);
				bracket.position = new Vector3(
					posX + (side * width) / 2 * 0.9,
					posY - 0.03,
					posZ + depth / 2
				);
				bracket.rotation.x = dropAngle;
				bracket.rotation.y = rotation;
				bracket.material = frameMat;
				meshes.push(bracket);
			}
		} else if (style === "dome") {
			// Dome/bubble awning
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: width, slice: 0.5 },
				scene
			);
			dome.position = new Vector3(posX, posY, posZ + width / 2);
			dome.rotation.x = Math.PI / 2;
			dome.rotation.y = rotation;
			dome.scaling = new Vector3(1, depth / width, 0.5);
			dome.material = fabricMat;
			meshes.push(dome);
		} else if (style === "traditional") {
			// Japanese noren-style or traditional fabric
			const tradMat = new PBRMaterial(`awning_trad_${id}`, scene);
			tradMat.albedoColor = fabric === "bamboo"
				? new Color3(0.6, 0.5, 0.35)
				: primaryColor;
			tradMat.metallic = 0;
			tradMat.roughness = 0.85;

			// Slats or fabric panels
			const slatCount = fabric === "bamboo" ? Math.floor(width / 0.05) : 1;

			if (fabric === "bamboo") {
				for (let i = 0; i < slatCount; i++) {
					const slat = MeshBuilder.CreateCylinder(
						`${id}_slat_${i}`,
						{ height: depth, diameter: 0.04 },
						scene
					);
					slat.position = new Vector3(
						posX + (i - slatCount / 2 + 0.5) * (width / slatCount),
						posY,
						posZ + depth / 2
					);
					slat.rotation.x = Math.PI / 2 + dropAngle;
					slat.rotation.y = rotation;
					slat.material = tradMat;
					meshes.push(slat);
				}

				// Binding rods
				for (let j = 0; j < 3; j++) {
					const rod = MeshBuilder.CreateCylinder(
						`${id}_rod_${j}`,
						{ height: width, diameter: 0.02 },
						scene
					);
					const t = j / 2;
					rod.position = new Vector3(
						posX,
						posY - Math.sin(dropAngle) * t * depth,
						posZ + Math.cos(dropAngle) * t * depth
					);
					rod.rotation.z = Math.PI / 2;
					rod.rotation.y = rotation;
					rod.material = frameMat;
					meshes.push(rod);
				}
			} else {
				const panel = MeshBuilder.CreateBox(
					`${id}_panel`,
					{ width, height: 0.01, depth },
					scene
				);
				panel.position = new Vector3(posX, posY, posZ + depth / 2);
				panel.rotation.x = dropAngle;
				panel.rotation.y = rotation;
				panel.material = tradMat;
				meshes.push(panel);
			}
		} else if (style === "retractable") {
			// Retractable arm awning
			const canopy = MeshBuilder.CreateBox(
				`${id}_canopy`,
				{ width, height: 0.02, depth },
				scene
			);
			canopy.position = new Vector3(posX, posY, posZ + depth / 2);
			canopy.rotation.x = dropAngle;
			canopy.rotation.y = rotation;
			canopy.material = fabricMat;
			meshes.push(canopy);

			// Arms
			for (const side of [-1, 1]) {
				const arm = MeshBuilder.CreateBox(
					`${id}_arm_${side}`,
					{ width: 0.04, height: 0.04, depth: depth * 1.1 },
					scene
				);
				arm.position = new Vector3(
					posX + (side * width) / 2 * 0.95,
					posY - 0.05,
					posZ + depth / 2
				);
				arm.rotation.x = dropAngle;
				arm.rotation.y = rotation;
				arm.material = frameMat;
				meshes.push(arm);

				// Elbow joint
				const elbow = MeshBuilder.CreateSphere(
					`${id}_elbow_${side}`,
					{ diameter: 0.08 },
					scene
				);
				elbow.position = new Vector3(
					posX + (side * width) / 2 * 0.95,
					posY - 0.1,
					posZ + depth * 0.3
				);
				elbow.material = frameMat;
				meshes.push(elbow);
			}

			// Front bar
			const frontBar = MeshBuilder.CreateCylinder(
				`${id}_front_bar`,
				{ height: width, diameter: 0.03 },
				scene
			);
			const frontY = posY - Math.sin(dropAngle) * depth;
			const frontZ = posZ + Math.cos(dropAngle) * depth + depth;
			frontBar.position = new Vector3(posX, frontY, frontZ);
			frontBar.rotation.z = Math.PI / 2;
			frontBar.rotation.y = rotation;
			frontBar.material = frameMat;
			meshes.push(frontBar);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			frameMat.dispose();
			fabricMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, width, depth, style, fabric, color, striped, stripeColor, rotation, seed]);

	return null;
}
