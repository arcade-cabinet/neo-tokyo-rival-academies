/**
 * Flagpole - Poles with flags, banners, and pennants
 *
 * Vertical poles with various flags and decorative elements.
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

export type FlagpoleType = "national" | "banner" | "pennant" | "windsock" | "tattered";

export interface FlagpoleProps {
	id: string;
	position: Vector3;
	/** Flagpole type */
	type?: FlagpoleType;
	/** Pole height */
	height?: number;
	/** Flag color */
	flagColor?: "red" | "blue" | "white" | "green" | "yellow" | "orange";
	/** Secondary color for patterns */
	secondaryColor?: "red" | "blue" | "white" | "black" | "yellow";
	/** Has rope/pulley system */
	hasRope?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Flagpole({
	id,
	position,
	type = "national",
	height = 5,
	flagColor = "red",
	secondaryColor = "white",
	hasRope = true,
	condition = 0.8,
	rotation = 0,
	seed,
}: FlagpoleProps) {
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

		// Get color values
		const getColor = (colorName: string): Color3 => {
			switch (colorName) {
				case "red": return new Color3(0.8, 0.15, 0.15);
				case "blue": return new Color3(0.15, 0.25, 0.6);
				case "white": return new Color3(0.95, 0.95, 0.95);
				case "green": return new Color3(0.15, 0.5, 0.2);
				case "yellow": return new Color3(0.9, 0.85, 0.2);
				case "orange": return new Color3(0.9, 0.5, 0.1);
				case "black": return new Color3(0.1, 0.1, 0.12);
				default: return new Color3(0.8, 0.15, 0.15);
			}
		};

		// Pole material
		const poleMat = new PBRMaterial(`flagpole_${id}`, scene);
		poleMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(conditionFactor);
		poleMat.metallic = 0.7;
		poleMat.roughness = 0.4;

		// Main pole
		const pole = MeshBuilder.CreateCylinder(
			`${id}_pole`,
			{ height: height, diameterTop: 0.04, diameterBottom: 0.08, tessellation: 12 },
			scene
		);
		pole.position = new Vector3(posX, posY + height / 2, posZ);
		pole.material = poleMat;
		meshes.push(pole);

		// Base
		const baseMat = new PBRMaterial(`flagpole_base_${id}`, scene);
		baseMat.albedoColor = new Color3(0.35, 0.37, 0.4);
		baseMat.metallic = 0.5;
		baseMat.roughness = 0.6;

		const base = MeshBuilder.CreateCylinder(
			`${id}_base`,
			{ height: 0.3, diameterTop: 0.15, diameterBottom: 0.25, tessellation: 12 },
			scene
		);
		base.position = new Vector3(posX, posY + 0.15, posZ);
		base.material = baseMat;
		meshes.push(base);

		// Finial (top ornament)
		const finialMat = new PBRMaterial(`flagpole_finial_${id}`, scene);
		finialMat.albedoColor = new Color3(0.85, 0.75, 0.3);
		finialMat.metallic = 0.9;
		finialMat.roughness = 0.2;

		const finial = MeshBuilder.CreateSphere(
			`${id}_finial`,
			{ diameter: 0.12, segments: 12 },
			scene
		);
		finial.position = new Vector3(posX, posY + height + 0.06, posZ);
		finial.material = finialMat;
		meshes.push(finial);

		// Flag material
		const flagMat = new PBRMaterial(`flagpole_flag_${id}`, scene);
		flagMat.albedoColor = getColor(flagColor).scale(conditionFactor);
		flagMat.metallic = 0;
		flagMat.roughness = 0.8;

		const flagHeight = height * 0.25;
		const flagWidth = flagHeight * 1.5;
		const flagTop = posY + height - 0.2;

		if (type === "national" || type === "tattered") {
			// Rectangular flag
			const tattering = type === "tattered" ? 0.3 : 0;

			const flag = MeshBuilder.CreateBox(
				`${id}_flag`,
				{ width: 0.02, height: flagHeight * (1 - tattering * (rng ? rng.next() : 0.5)), depth: flagWidth },
				scene
			);
			flag.position = new Vector3(
				posX + Math.cos(rotation) * (flagWidth / 2 + 0.05),
				flagTop - flagHeight / 2,
				posZ - Math.sin(rotation) * (flagWidth / 2 + 0.05)
			);
			flag.rotation.y = rotation;
			flag.material = flagMat;
			meshes.push(flag);

			// Secondary stripe/pattern
			const stripeMat = new PBRMaterial(`flagpole_stripe_${id}`, scene);
			stripeMat.albedoColor = getColor(secondaryColor).scale(conditionFactor);
			stripeMat.metallic = 0;
			stripeMat.roughness = 0.8;

			const stripe = MeshBuilder.CreateBox(
				`${id}_stripe`,
				{ width: 0.025, height: flagHeight * 0.3, depth: flagWidth * 0.9 },
				scene
			);
			stripe.position = new Vector3(
				flag.position.x + Math.cos(rotation) * 0.005,
				flag.position.y,
				flag.position.z - Math.sin(rotation) * 0.005
			);
			stripe.rotation.y = rotation;
			stripe.material = stripeMat;
			meshes.push(stripe);

		} else if (type === "banner") {
			// Vertical hanging banner
			const bannerWidth = flagWidth * 0.4;
			const bannerLength = flagHeight * 2;

			// Banner crossbar
			const crossbar = MeshBuilder.CreateCylinder(
				`${id}_crossbar`,
				{ height: bannerWidth * 1.5, diameter: 0.03 },
				scene
			);
			crossbar.position = new Vector3(posX, flagTop + 0.1, posZ);
			crossbar.rotation.z = Math.PI / 2;
			crossbar.rotation.y = rotation;
			crossbar.material = poleMat;
			meshes.push(crossbar);

			// Banner body
			const banner = MeshBuilder.CreateBox(
				`${id}_banner`,
				{ width: bannerWidth, height: bannerLength, depth: 0.02 },
				scene
			);
			banner.position = new Vector3(posX, flagTop - bannerLength / 2, posZ);
			banner.rotation.y = rotation;
			banner.material = flagMat;
			meshes.push(banner);

		} else if (type === "pennant") {
			// Triangular pennant
			const pennantLength = flagWidth * 1.5;

			const pennant = MeshBuilder.CreateCylinder(
				`${id}_pennant`,
				{ height: pennantLength, diameterTop: 0, diameterBottom: flagHeight * 0.6, tessellation: 3 },
				scene
			);
			pennant.position = new Vector3(
				posX + Math.cos(rotation) * (pennantLength / 2),
				flagTop - flagHeight * 0.3,
				posZ - Math.sin(rotation) * (pennantLength / 2)
			);
			pennant.rotation.z = Math.PI / 2;
			pennant.rotation.y = rotation;
			pennant.material = flagMat;
			meshes.push(pennant);

		} else if (type === "windsock") {
			// Conical windsock
			const sockLength = flagWidth * 0.8;

			// Support ring
			const ring = MeshBuilder.CreateTorus(
				`${id}_ring`,
				{ diameter: flagHeight * 0.4, thickness: 0.02, tessellation: 16 },
				scene
			);
			ring.position = new Vector3(posX, flagTop, posZ);
			ring.rotation.z = Math.PI / 2;
			ring.rotation.y = rotation;
			ring.material = poleMat;
			meshes.push(ring);

			// Sock body
			const sock = MeshBuilder.CreateCylinder(
				`${id}_sock`,
				{ height: sockLength, diameterTop: 0.05, diameterBottom: flagHeight * 0.35, tessellation: 12 },
				scene
			);
			sock.position = new Vector3(
				posX + Math.cos(rotation) * (sockLength / 2 + flagHeight * 0.2),
				flagTop,
				posZ - Math.sin(rotation) * (sockLength / 2 + flagHeight * 0.2)
			);
			sock.rotation.z = Math.PI / 2;
			sock.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.3 : 0);
			sock.material = flagMat;
			meshes.push(sock);

			// Stripes
			const stripeMat = new PBRMaterial(`flagpole_sockstripe_${id}`, scene);
			stripeMat.albedoColor = getColor(secondaryColor);
			stripeMat.metallic = 0;
			stripeMat.roughness = 0.7;

			for (let s = 0; s < 3; s++) {
				const stripe = MeshBuilder.CreateTorus(
					`${id}_sockstripe_${s}`,
					{ diameter: flagHeight * 0.3 - s * 0.06, thickness: 0.02, tessellation: 12 },
					scene
				);
				stripe.position = new Vector3(
					sock.position.x - Math.cos(rotation) * (sockLength * 0.15 + s * sockLength * 0.2),
					sock.position.y,
					sock.position.z + Math.sin(rotation) * (sockLength * 0.15 + s * sockLength * 0.2)
				);
				stripe.rotation.z = Math.PI / 2;
				stripe.rotation.y = rotation;
				stripe.material = stripeMat;
				meshes.push(stripe);
			}
		}

		// Rope
		if (hasRope && type !== "windsock") {
			const ropeMat = new PBRMaterial(`flagpole_rope_${id}`, scene);
			ropeMat.albedoColor = new Color3(0.8, 0.75, 0.65);
			ropeMat.metallic = 0;
			ropeMat.roughness = 0.9;

			const rope = MeshBuilder.CreateCylinder(
				`${id}_rope`,
				{ height: height * 0.9, diameter: 0.015 },
				scene
			);
			rope.position = new Vector3(
				posX + Math.cos(rotation + Math.PI / 2) * 0.06,
				posY + height * 0.45,
				posZ - Math.sin(rotation + Math.PI / 2) * 0.06
			);
			rope.material = ropeMat;
			meshes.push(rope);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			poleMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, height, flagColor, secondaryColor, hasRope, condition, rotation, seed]);

	return null;
}
