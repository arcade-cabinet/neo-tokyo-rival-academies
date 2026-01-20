/**
 * Umbrella - Umbrellas in various states
 *
 * Umbrellas as urban props - open, closed, broken, or discarded.
 */

import {
	type AbstractMesh,
	Color3,
	type Material,
	MeshBuilder,
	PBRMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../../world/blocks/Block";

export type UmbrellaType = "standard" | "parasol" | "golf" | "japanese" | "patio";
export type UmbrellaState = "closed" | "open" | "broken" | "inverted";

export interface UmbrellaProps {
	id: string;
	position: Vector3;
	/** Umbrella type */
	type?: UmbrellaType;
	/** Umbrella state */
	state?: UmbrellaState;
	/** Primary color */
	color?: Color3;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

// Dimensions for different umbrella types
const UMBRELLA_SPECS: Record<
	UmbrellaType,
	{ radius: number; shaftLength: number; ribCount: number }
> = {
	standard: { radius: 0.5, shaftLength: 0.7, ribCount: 8 },
	parasol: { radius: 0.8, shaftLength: 0.9, ribCount: 8 },
	golf: { radius: 0.7, shaftLength: 0.85, ribCount: 8 },
	japanese: { radius: 0.45, shaftLength: 0.65, ribCount: 24 },
	patio: { radius: 1.2, shaftLength: 2.0, ribCount: 8 }, // Large cafe/patio umbrella
};

// Common umbrella colors
const DEFAULT_COLORS = [
	new Color3(0.1, 0.15, 0.3), // Navy
	new Color3(0.7, 0.1, 0.1), // Red
	new Color3(0.1, 0.1, 0.12), // Black
	new Color3(0.15, 0.4, 0.15), // Green
	new Color3(0.6, 0.5, 0.1), // Yellow/gold
	new Color3(0.5, 0.2, 0.5), // Purple
];

export function Umbrella({
	id,
	position,
	type = "standard",
	state = "closed",
	color,
	condition = 0.8,
	rotation = 0,
	seed,
}: UmbrellaProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: Material[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const specs = UMBRELLA_SPECS[type];
		const { radius, shaftLength, ribCount } = specs;

		// Select color
		const umbrellaColor =
			color ??
			(rng
				? DEFAULT_COLORS[Math.floor(rng.next() * DEFAULT_COLORS.length)]
				: DEFAULT_COLORS[2]); // Default black

		// Canopy material
		const canopyMat = new PBRMaterial(`umbrella_canopy_${id}`, scene);
		canopyMat.albedoColor = umbrellaColor.scale(condition);
		canopyMat.metallic = 0;
		canopyMat.roughness = 0.7;
		canopyMat.backFaceCulling = false;
		materials.push(canopyMat);

		// Secondary canopy color (for patterns)
		const canopyMat2 = new PBRMaterial(`umbrella_canopy2_${id}`, scene);
		const secondaryColor =
			type === "golf"
				? new Color3(0.9, 0.9, 0.92) // White for golf umbrella alternating
				: umbrellaColor.scale(0.7);
		canopyMat2.albedoColor = secondaryColor.scale(condition);
		canopyMat2.metallic = 0;
		canopyMat2.roughness = 0.7;
		canopyMat2.backFaceCulling = false;
		materials.push(canopyMat2);

		// Shaft/frame material
		const shaftMat = new PBRMaterial(`umbrella_shaft_${id}`, scene);
		shaftMat.albedoColor = new Color3(0.2, 0.2, 0.22).scale(condition);
		shaftMat.metallic = 0.8;
		shaftMat.roughness = 0.3;
		materials.push(shaftMat);

		// Handle material
		const handleMat = new PBRMaterial(`umbrella_handle_${id}`, scene);
		if (type === "japanese") {
			handleMat.albedoColor = new Color3(0.4, 0.25, 0.12).scale(condition); // Bamboo
			handleMat.metallic = 0;
			handleMat.roughness = 0.8;
		} else {
			handleMat.albedoColor = new Color3(0.15, 0.15, 0.15);
			handleMat.metallic = 0.3;
			handleMat.roughness = 0.6;
		}
		materials.push(handleMat);

		// Rib material
		const ribMat = new PBRMaterial(`umbrella_rib_${id}`, scene);
		ribMat.albedoColor = new Color3(0.5, 0.5, 0.52).scale(condition);
		ribMat.metallic = 0.7;
		ribMat.roughness = 0.4;
		materials.push(ribMat);

		// Calculate orientation based on state
		let tiltAngle = 0;
		let baseY = posY;
		let isFlat = false;

		if (state === "closed") {
			// Standing or laying down
			if (rng && rng.next() > 0.5) {
				// Laying flat
				tiltAngle = Math.PI / 2;
				baseY = posY + 0.03;
				isFlat = true;
			}
		} else if (state === "broken") {
			tiltAngle = (rng ? rng.next() * 0.5 : 0.3) + 0.2;
		} else if (state === "inverted") {
			tiltAngle = Math.PI; // Flipped upside down
			baseY = posY + radius * 0.3;
		}

		if (state === "closed") {
			// Closed umbrella - furled canopy
			const furledRadius = 0.03;
			const furledLength = shaftLength * 0.85;

			// Main shaft
			const shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: shaftLength, diameter: 0.015 },
				scene,
			);
			if (isFlat) {
				shaft.position = new Vector3(posX, baseY, posZ);
				shaft.rotation.z = Math.PI / 2;
				shaft.rotation.y = rotation;
			} else {
				shaft.position = new Vector3(posX, baseY + shaftLength / 2, posZ);
			}
			shaft.material = shaftMat;
			meshes.push(shaft);

			// Furled canopy (cylinder around shaft)
			const furledCanopy = MeshBuilder.CreateCylinder(
				`${id}_furledCanopy`,
				{ height: furledLength, diameter: furledRadius * 2 },
				scene,
			);
			if (isFlat) {
				furledCanopy.position = new Vector3(
					posX + Math.cos(rotation) * (shaftLength * 0.1),
					baseY + furledRadius,
					posZ - Math.sin(rotation) * (shaftLength * 0.1),
				);
				furledCanopy.rotation.z = Math.PI / 2;
				furledCanopy.rotation.y = rotation;
			} else {
				furledCanopy.position = new Vector3(
					posX,
					baseY + shaftLength * 0.55,
					posZ,
				);
			}
			furledCanopy.material = canopyMat;
			meshes.push(furledCanopy);

			// Tip at top
			const tip = MeshBuilder.CreateCylinder(
				`${id}_tip`,
				{ height: 0.04, diameterTop: 0.005, diameterBottom: 0.012 },
				scene,
			);
			if (isFlat) {
				tip.position = new Vector3(
					posX + Math.cos(rotation) * (shaftLength / 2 + 0.02),
					baseY,
					posZ - Math.sin(rotation) * (shaftLength / 2 + 0.02),
				);
				tip.rotation.z = Math.PI / 2;
				tip.rotation.y = rotation;
			} else {
				tip.position = new Vector3(posX, baseY + shaftLength + 0.02, posZ);
			}
			tip.material = shaftMat;
			meshes.push(tip);

			// Handle
			if (type === "japanese") {
				// Straight bamboo handle
				const handle = MeshBuilder.CreateCylinder(
					`${id}_handle`,
					{ height: 0.12, diameter: 0.02 },
					scene,
				);
				if (isFlat) {
					handle.position = new Vector3(
						posX - Math.cos(rotation) * (shaftLength / 2 + 0.06),
						baseY,
						posZ + Math.sin(rotation) * (shaftLength / 2 + 0.06),
					);
					handle.rotation.z = Math.PI / 2;
					handle.rotation.y = rotation;
				} else {
					handle.position = new Vector3(posX, baseY - 0.06, posZ);
				}
				handle.material = handleMat;
				meshes.push(handle);
			} else {
				// J-hook handle
				const handleStraight = MeshBuilder.CreateCylinder(
					`${id}_handleStraight`,
					{ height: 0.08, diameter: 0.018 },
					scene,
				);
				// Create curved hook path (half circle)
				const hookPath: Vector3[] = [];
				const hookRadius = 0.03;
				for (let j = 0; j <= 8; j++) {
					const angle = (j / 8) * Math.PI; // Half circle
					hookPath.push(
						new Vector3(
							0,
							-Math.cos(angle) * hookRadius,
							Math.sin(angle) * hookRadius,
						),
					);
				}
				const hookCurve = MeshBuilder.CreateTube(
					`${id}_hookCurve`,
					{ path: hookPath, radius: 0.009, tessellation: 8, cap: 2 },
					scene,
				);

				if (isFlat) {
					handleStraight.position = new Vector3(
						posX - Math.cos(rotation) * (shaftLength / 2 + 0.04),
						baseY,
						posZ + Math.sin(rotation) * (shaftLength / 2 + 0.04),
					);
					handleStraight.rotation.z = Math.PI / 2;
					handleStraight.rotation.y = rotation;

					hookCurve.position = new Vector3(
						posX - Math.cos(rotation) * (shaftLength / 2 + 0.08),
						baseY - 0.03,
						posZ + Math.sin(rotation) * (shaftLength / 2 + 0.08),
					);
					hookCurve.rotation.z = -Math.PI / 2;
					hookCurve.rotation.y = rotation;
				} else {
					handleStraight.position = new Vector3(posX, baseY - 0.04, posZ);
					hookCurve.position = new Vector3(posX, baseY - 0.08, posZ + 0.03);
					hookCurve.rotation.x = Math.PI / 2;
				}
				handleStraight.material = handleMat;
				hookCurve.material = handleMat;
				meshes.push(handleStraight);
				meshes.push(hookCurve);
			}

			// Velcro strap
			const strap = MeshBuilder.CreateTorus(
				`${id}_strap`,
				{ diameter: furledRadius * 2.5, thickness: 0.008, tessellation: 16 },
				scene,
			);
			const strapMat = new PBRMaterial(`umbrella_strap_${id}`, scene);
			strapMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			strapMat.metallic = 0;
			strapMat.roughness = 0.9;
			materials.push(strapMat);

			if (isFlat) {
				strap.position = new Vector3(
					posX + Math.cos(rotation) * (shaftLength * 0.2),
					baseY + furledRadius,
					posZ - Math.sin(rotation) * (shaftLength * 0.2),
				);
				strap.rotation.z = Math.PI / 2;
				strap.rotation.y = rotation;
			} else {
				strap.position = new Vector3(posX, baseY + shaftLength * 0.5, posZ);
			}
			strap.material = strapMat;
			meshes.push(strap);
		} else if (state === "open" || state === "broken" || state === "inverted") {
			// Open umbrella - create canopy segments
			const canopyHeight = state === "inverted" ? -0.15 : 0.15;
			const canopyY =
				state === "inverted" ? baseY - canopyHeight : baseY + shaftLength - 0.1;

			// Main shaft
			const shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: shaftLength, diameter: 0.015 },
				scene,
			);
			shaft.position = new Vector3(posX, baseY + shaftLength / 2, posZ);
			shaft.rotation.x = tiltAngle;
			shaft.rotation.y = rotation;
			shaft.material = shaftMat;
			meshes.push(shaft);

			// Create canopy segments
			const segmentAngle = (Math.PI * 2) / ribCount;

			for (let i = 0; i < ribCount; i++) {
				const angle = i * segmentAngle + rotation;

				// Canopy segment (pie slice)
				const segmentRadius =
					state === "broken" && rng && rng.next() > 0.7
						? radius * (0.3 + rng.next() * 0.4) // Torn segment
						: radius;

				const segment = MeshBuilder.CreateDisc(
					`${id}_segment_${i}`,
					{ radius: segmentRadius, arc: segmentAngle, tessellation: 8 },
					scene,
				);

				const segCenterX =
					posX +
					Math.cos(angle + segmentAngle / 2) *
						(segmentRadius / 3) *
						Math.cos(tiltAngle);
				const segCenterZ =
					posZ + Math.sin(angle + segmentAngle / 2) * (segmentRadius / 3);

				segment.position = new Vector3(
					segCenterX,
					canopyY +
						(state === "inverted" ? canopyHeight * 0.5 : -canopyHeight * 0.5),
					segCenterZ,
				);
				segment.rotation.x =
					state === "inverted" ? Math.PI / 2 + 0.3 : -Math.PI / 2 + 0.3;
				segment.rotation.y = angle;

				// Alternate colors for golf umbrella
				if (type === "golf" && i % 2 === 1) {
					segment.material = canopyMat2;
				} else {
					segment.material = canopyMat;
				}
				meshes.push(segment);

				// Rib
				const ribLength = segmentRadius * 0.95;
				const rib = MeshBuilder.CreateCylinder(
					`${id}_rib_${i}`,
					{ height: ribLength, diameter: 0.004 },
					scene,
				);
				const ribAngle = state === "inverted" ? -0.3 : 0.3;
				rib.position = new Vector3(
					posX + Math.cos(angle) * (ribLength / 2) * Math.cos(ribAngle),
					canopyY - canopyHeight * 0.5 + Math.sin(ribAngle) * (ribLength / 2),
					posZ + Math.sin(angle) * (ribLength / 2),
				);
				rib.rotation.z = -ribAngle;
				rib.rotation.y = angle + Math.PI / 2;
				rib.material = ribMat;
				meshes.push(rib);
			}

			// Top finial
			const finial = MeshBuilder.CreateSphere(
				`${id}_finial`,
				{ diameter: 0.025, segments: 8 },
				scene,
			);
			finial.position = new Vector3(
				posX + Math.sin(tiltAngle) * shaftLength,
				baseY + shaftLength * Math.cos(tiltAngle) + 0.01,
				posZ,
			);
			finial.material = shaftMat;
			meshes.push(finial);

			// Handle
			if (type === "japanese") {
				const handle = MeshBuilder.CreateCylinder(
					`${id}_handle`,
					{ height: 0.15, diameter: 0.022 },
					scene,
				);
				handle.position = new Vector3(
					posX - Math.sin(tiltAngle) * 0.08,
					baseY - 0.075,
					posZ,
				);
				handle.material = handleMat;
				meshes.push(handle);
			} else {
				const handleStraight = MeshBuilder.CreateCylinder(
					`${id}_handleStraight`,
					{ height: 0.1, diameter: 0.018 },
					scene,
				);
				handleStraight.position = new Vector3(posX, baseY - 0.05, posZ);
				handleStraight.material = handleMat;
				meshes.push(handleStraight);

				// Create curved hook path for open umbrella handle
				const openHookPath: Vector3[] = [];
				const openHookRadius = 0.035;
				for (let j = 0; j <= 10; j++) {
					const angle = (j / 10) * Math.PI * 0.55; // Partial arc
					openHookPath.push(
						new Vector3(
							0,
							-Math.cos(angle) * openHookRadius,
							Math.sin(angle) * openHookRadius,
						),
					);
				}
				const hookCurve = MeshBuilder.CreateTube(
					`${id}_hookCurve`,
					{ path: openHookPath, radius: 0.009, tessellation: 8, cap: 2 },
					scene,
				);
				hookCurve.position = new Vector3(posX, baseY - 0.1, posZ + 0.035);
				hookCurve.rotation.x = Math.PI / 2;
				hookCurve.material = handleMat;
				meshes.push(hookCurve);
			}

			// Runner (sliding part on shaft)
			const runner = MeshBuilder.CreateCylinder(
				`${id}_runner`,
				{ height: 0.03, diameter: 0.025 },
				scene,
			);
			runner.position = new Vector3(
				posX + Math.sin(tiltAngle) * (shaftLength * 0.7),
				baseY + shaftLength * 0.7 * Math.cos(tiltAngle),
				posZ,
			);
			runner.rotation.x = tiltAngle;
			runner.material = shaftMat;
			meshes.push(runner);

			// Add broken elements
			if (state === "broken" && rng) {
				// Bent/broken ribs
				const brokenRibCount = 1 + Math.floor(rng.next() * 3);
				for (let b = 0; b < brokenRibCount; b++) {
					const brokenAngle = rng.next() * Math.PI * 2;
					const bentRib = MeshBuilder.CreateCylinder(
						`${id}_brokenRib_${b}`,
						{ height: radius * 0.4, diameter: 0.004 },
						scene,
					);
					bentRib.position = new Vector3(
						posX + Math.cos(brokenAngle) * radius * 0.6,
						canopyY - 0.1,
						posZ + Math.sin(brokenAngle) * radius * 0.6,
					);
					bentRib.rotation.z = rng.next() * Math.PI * 0.5 - Math.PI * 0.25;
					bentRib.rotation.y = brokenAngle;
					bentRib.material = ribMat;
					meshes.push(bentRib);
				}

				// Torn fabric pieces
				const tornCount = 2 + Math.floor(rng.next() * 3);
				for (let t = 0; t < tornCount; t++) {
					const tornAngle = rng.next() * Math.PI * 2;
					const tornDist = radius * (0.5 + rng.next() * 0.4);

					const torn = MeshBuilder.CreatePlane(
						`${id}_torn_${t}`,
						{ width: 0.08 + rng.next() * 0.1, height: 0.1 + rng.next() * 0.15 },
						scene,
					);
					torn.position = new Vector3(
						posX + Math.cos(tornAngle) * tornDist,
						canopyY - 0.05 - rng.next() * 0.1,
						posZ + Math.sin(tornAngle) * tornDist,
					);
					torn.rotation.x = rng.next() * Math.PI - Math.PI / 2;
					torn.rotation.y = tornAngle;
					torn.material = canopyMat;
					meshes.push(torn);
				}
			}
		}

		// Japanese umbrella specific decorations
		if (type === "japanese" && state === "open") {
			// Paper texture pattern (simplified as rings)
			const ringCount = 3;
			for (let r = 0; r < ringCount; r++) {
				const ringRadius = radius * (0.3 + r * 0.25);
				const ring = MeshBuilder.CreateTorus(
					`${id}_decorRing_${r}`,
					{
						diameter: ringRadius * 2,
						thickness: 0.003,
						tessellation: ribCount,
					},
					scene,
				);
				ring.position = new Vector3(posX, baseY + shaftLength - 0.15, posZ);
				ring.rotation.x = Math.PI / 2;
				const ringMat = new PBRMaterial(`umbrella_ring_${id}_${r}`, scene);
				ringMat.albedoColor = new Color3(0.3, 0.2, 0.1).scale(condition);
				ringMat.metallic = 0;
				ringMat.roughness = 0.9;
				materials.push(ringMat);
				ring.material = ringMat;
				meshes.push(ring);
			}
		}

		// Add wear/damage for low condition
		if (condition < 0.5 && rng) {
			const wearMat = new PBRMaterial(`umbrella_wear_${id}`, scene);
			wearMat.albedoColor = new Color3(0.3, 0.28, 0.25);
			wearMat.metallic = 0;
			wearMat.roughness = 0.95;
			wearMat.alpha = 0.6;
			materials.push(wearMat);

			const wearCount = 3 + Math.floor(rng.next() * 4);
			for (let w = 0; w < wearCount; w++) {
				const wearAngle = rng.next() * Math.PI * 2;
				const wearDist = rng.next() * radius * 0.8;
				const wearSize = 0.02 + rng.next() * 0.04;

				const wear = MeshBuilder.CreateDisc(
					`${id}_wear_${w}`,
					{ radius: wearSize, tessellation: 6 },
					scene,
				);

				const wearY =
					state === "closed"
						? isFlat
							? baseY + 0.04
							: baseY +
								shaftLength * 0.5 +
								(rng.next() - 0.5) * shaftLength * 0.3
						: baseY + shaftLength - 0.1;

				wear.position = new Vector3(
					posX + Math.cos(wearAngle) * wearDist,
					wearY,
					posZ + Math.sin(wearAngle) * wearDist,
				);
				wear.rotation.x = -Math.PI / 2;
				wear.material = wearMat;
				meshes.push(wear);
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
		state,
		color,
		condition,
		rotation,
		seed,
	]);

	return null;
}
