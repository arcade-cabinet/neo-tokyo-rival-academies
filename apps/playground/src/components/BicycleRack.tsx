/**
 * BicycleRack - Bicycle parking racks
 *
 * Various styles of bicycle racks with optional parked bicycles.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
	type AbstractMesh,
	type Material,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../blocks/Block";

export type BicycleRackType = "wave" | "post" | "grid" | "spiral" | "wall";

export interface BicycleRackProps {
	id: string;
	position: Vector3;
	/** Rack type/style */
	type?: BicycleRackType;
	/** Number of bicycle slots */
	capacity?: number;
	/** Number of bicycles currently parked */
	occupiedCount?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

// Rack dimensions by type
const RACK_SPECS: Record<BicycleRackType, { slotWidth: number; height: number; depth: number }> = {
	wave: { slotWidth: 0.35, height: 0.8, depth: 0.6 },
	post: { slotWidth: 0.8, height: 0.9, depth: 0.15 },
	grid: { slotWidth: 0.4, height: 0.5, depth: 1.8 },
	spiral: { slotWidth: 0.45, height: 0.6, depth: 0.5 },
	wall: { slotWidth: 0.5, height: 1.2, depth: 0.3 },
};

export function BicycleRack({
	id,
	position,
	type = "wave",
	capacity = 5,
	occupiedCount = 0,
	condition = 0.8,
	rotation = 0,
	seed,
}: BicycleRackProps) {
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

		const specs = RACK_SPECS[type];
		const { slotWidth, height, depth } = specs;
		const actualCapacity = Math.min(capacity, 12);
		const actualOccupied = Math.min(occupiedCount, actualCapacity);

		// Main rack material (galvanized steel)
		const rackMat = new PBRMaterial(`rack_main_${id}`, scene);
		rackMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(condition);
		rackMat.metallic = 0.85;
		rackMat.roughness = 0.35;
		materials.push(rackMat);

		// Painted rack material (for some types)
		const paintedMat = new PBRMaterial(`rack_painted_${id}`, scene);
		const paintColors = [
			new Color3(0.1, 0.3, 0.6),   // Blue
			new Color3(0.15, 0.5, 0.2),  // Green
			new Color3(0.5, 0.1, 0.1),   // Red
			new Color3(0.3, 0.3, 0.32),  // Gray
		];
		const paintColor = rng
			? paintColors[Math.floor(rng.next() * paintColors.length)]
			: paintColors[3];
		paintedMat.albedoColor = paintColor.scale(condition);
		paintedMat.metallic = 0.6;
		paintedMat.roughness = 0.5;
		materials.push(paintedMat);

		// Ground anchor material
		const anchorMat = new PBRMaterial(`rack_anchor_${id}`, scene);
		anchorMat.albedoColor = new Color3(0.4, 0.4, 0.42).scale(condition);
		anchorMat.metallic = 0.7;
		anchorMat.roughness = 0.5;
		materials.push(anchorMat);

		// Calculate total rack width
		const totalWidth = actualCapacity * slotWidth;

		// Helper to transform positions
		const transformPos = (localX: number, localY: number, localZ: number): Vector3 => {
			const cosR = Math.cos(rotation);
			const sinR = Math.sin(rotation);
			return new Vector3(
				posX + localX * cosR - localZ * sinR,
				posY + localY,
				posZ + localX * sinR + localZ * cosR
			);
		};

		if (type === "wave") {
			// Wave/serpentine rack - continuous curved tube
			const tubeRadius = 0.025;
			const waveCount = actualCapacity;
			const waveAmplitude = depth / 2;

			// Create wave path
			const pathPoints: Vector3[] = [];
			const segments = waveCount * 12;

			for (let i = 0; i <= segments; i++) {
				const t = i / segments;
				const x = (t - 0.5) * totalWidth;
				const z = Math.sin(t * waveCount * Math.PI) * waveAmplitude;
				const y = height * (1 - Math.abs(Math.sin(t * waveCount * Math.PI)) * 0.3);
				pathPoints.push(new Vector3(x, y, z));
			}

			const waveTube = MeshBuilder.CreateTube(
				`${id}_wave`,
				{ path: pathPoints, radius: tubeRadius, tessellation: 12, cap: 2 },
				scene
			);
			waveTube.position = new Vector3(posX, posY, posZ);
			waveTube.rotation.y = rotation;
			waveTube.material = paintedMat;
			meshes.push(waveTube);

			// Ground anchors at each end
			for (const end of [-1, 1]) {
				const endX = end * (totalWidth / 2 - slotWidth / 4);

				// Vertical leg
				const leg = MeshBuilder.CreateCylinder(
					`${id}_leg_${end}`,
					{ height: height * 0.7, diameter: tubeRadius * 2 },
					scene
				);
				leg.position = transformPos(endX, height * 0.35, 0);
				leg.material = paintedMat;
				meshes.push(leg);

				// Anchor plate
				const anchor = MeshBuilder.CreateBox(
					`${id}_anchor_${end}`,
					{ width: 0.1, height: 0.01, depth: 0.1 },
					scene
				);
				anchor.position = transformPos(endX, 0.005, 0);
				anchor.rotation.y = rotation;
				anchor.material = anchorMat;
				meshes.push(anchor);
			}

		} else if (type === "post") {
			// Post/staple racks - inverted U shapes
			const postWidth = 0.4;
			const postRadius = 0.02;

			for (let i = 0; i < actualCapacity; i++) {
				const postX = (i - (actualCapacity - 1) / 2) * slotWidth;

				// Create inverted U path
				const uPath: Vector3[] = [];
				const uSegments = 16;

				// Left leg
				uPath.push(new Vector3(-postWidth / 2, 0, 0));
				uPath.push(new Vector3(-postWidth / 2, height - postWidth / 2, 0));

				// Curved top
				for (let j = 0; j <= uSegments; j++) {
					const angle = Math.PI - (j / uSegments) * Math.PI;
					uPath.push(new Vector3(
						Math.cos(angle) * (postWidth / 2),
						height - postWidth / 2 + Math.sin(angle) * (postWidth / 2),
						0
					));
				}

				// Right leg
				uPath.push(new Vector3(postWidth / 2, height - postWidth / 2, 0));
				uPath.push(new Vector3(postWidth / 2, 0, 0));

				const post = MeshBuilder.CreateTube(
					`${id}_post_${i}`,
					{ path: uPath, radius: postRadius, tessellation: 8, cap: 2 },
					scene
				);
				post.position = transformPos(postX, 0, 0);
				post.rotation.y = rotation;
				post.material = rackMat;
				meshes.push(post);

				// Anchor plates
				for (const side of [-1, 1]) {
					const anchor = MeshBuilder.CreateCylinder(
						`${id}_postAnchor_${i}_${side}`,
						{ height: 0.01, diameter: 0.08 },
						scene
					);
					anchor.position = transformPos(postX + side * postWidth / 2, 0.005, 0);
					anchor.material = anchorMat;
					meshes.push(anchor);
				}
			}

		} else if (type === "grid") {
			// Grid/wheel rack - slots for wheels
			const slotCount = actualCapacity;
			const slotDepth = depth;
			const slotHeight = height;
			const barRadius = 0.015;

			// Main frame - two long bars
			for (const side of [-1, 1]) {
				const frameBar = MeshBuilder.CreateCylinder(
					`${id}_frameBar_${side}`,
					{ height: totalWidth, diameter: barRadius * 2 },
					scene
				);
				frameBar.position = transformPos(0, slotHeight, side * (slotDepth / 2 - 0.1));
				frameBar.rotation.z = Math.PI / 2;
				frameBar.rotation.y = rotation;
				frameBar.material = rackMat;
				meshes.push(frameBar);
			}

			// Vertical supports at ends
			for (const endX of [-1, 1]) {
				for (const endZ of [-1, 1]) {
					const support = MeshBuilder.CreateCylinder(
						`${id}_support_${endX}_${endZ}`,
						{ height: slotHeight, diameter: barRadius * 2 },
						scene
					);
					support.position = transformPos(
						endX * (totalWidth / 2 - 0.02),
						slotHeight / 2,
						endZ * (slotDepth / 2 - 0.1)
					);
					support.material = rackMat;
					meshes.push(support);
				}
			}

			// Wheel slots (angled bars)
			for (let i = 0; i < slotCount; i++) {
				const slotX = (i - (slotCount - 1) / 2) * slotWidth;

				// Two angled guides per slot
				for (const side of [-1, 1]) {
					const guide = MeshBuilder.CreateCylinder(
						`${id}_guide_${i}_${side}`,
						{ height: slotDepth - 0.2, diameter: barRadius * 1.5 },
						scene
					);
					guide.position = transformPos(
						slotX + side * 0.08,
						0.15,
						0
					);
					guide.rotation.x = Math.PI / 2;
					guide.rotation.y = rotation;
					guide.material = rackMat;
					meshes.push(guide);
				}

				// Cross bar at bottom
				const crossBar = MeshBuilder.CreateCylinder(
					`${id}_cross_${i}`,
					{ height: 0.2, diameter: barRadius * 1.5 },
					scene
				);
				crossBar.position = transformPos(slotX, 0.03, slotDepth / 2 - 0.15);
				crossBar.rotation.z = Math.PI / 2;
				crossBar.rotation.y = rotation;
				crossBar.material = rackMat;
				meshes.push(crossBar);
			}

			// Ground plate
			const groundPlate = MeshBuilder.CreateBox(
				`${id}_groundPlate`,
				{ width: totalWidth + 0.1, height: 0.02, depth: slotDepth },
				scene
			);
			groundPlate.position = transformPos(0, 0.01, 0);
			groundPlate.rotation.y = rotation;
			groundPlate.material = anchorMat;
			meshes.push(groundPlate);

		} else if (type === "spiral") {
			// Spiral/helix rack
			const spiralRadius = 0.15;
			const spiralTurns = 2;
			const tubeRadius = 0.015;

			for (let i = 0; i < actualCapacity; i++) {
				const spiralX = (i - (actualCapacity - 1) / 2) * slotWidth;

				// Create spiral path
				const spiralPath: Vector3[] = [];
				const spiralSegments = spiralTurns * 24;

				for (let j = 0; j <= spiralSegments; j++) {
					const t = j / spiralSegments;
					const angle = t * spiralTurns * Math.PI * 2;
					spiralPath.push(new Vector3(
						Math.cos(angle) * spiralRadius,
						t * height,
						Math.sin(angle) * spiralRadius
					));
				}

				const spiral = MeshBuilder.CreateTube(
					`${id}_spiral_${i}`,
					{ path: spiralPath, radius: tubeRadius, tessellation: 8, cap: 2 },
					scene
				);
				spiral.position = transformPos(spiralX, 0, 0);
				spiral.rotation.y = rotation;
				spiral.material = paintedMat;
				meshes.push(spiral);

				// Central post
				const centerPost = MeshBuilder.CreateCylinder(
					`${id}_centerPost_${i}`,
					{ height: height + 0.05, diameter: tubeRadius * 1.5 },
					scene
				);
				centerPost.position = transformPos(spiralX, (height + 0.05) / 2, 0);
				centerPost.material = rackMat;
				meshes.push(centerPost);

				// Base plate
				const basePlate = MeshBuilder.CreateCylinder(
					`${id}_basePlate_${i}`,
					{ height: 0.015, diameter: spiralRadius * 2 + 0.1 },
					scene
				);
				basePlate.position = transformPos(spiralX, 0.0075, 0);
				basePlate.material = anchorMat;
				meshes.push(basePlate);
			}

		} else if (type === "wall") {
			// Wall-mounted vertical rack
			const hookWidth = 0.3;
			const hookDepth = 0.25;
			const barRadius = 0.02;

			// Back mounting bar
			const mountBar = MeshBuilder.CreateBox(
				`${id}_mountBar`,
				{ width: totalWidth + 0.1, height: 0.08, depth: 0.04 },
				scene
			);
			mountBar.position = transformPos(0, height - 0.04, -depth / 2 + 0.02);
			mountBar.rotation.y = rotation;
			mountBar.material = rackMat;
			meshes.push(mountBar);

			// Individual hooks
			for (let i = 0; i < actualCapacity; i++) {
				const hookX = (i - (actualCapacity - 1) / 2) * slotWidth;

				// Hook arm (horizontal)
				const hookArm = MeshBuilder.CreateCylinder(
					`${id}_hookArm_${i}`,
					{ height: hookDepth, diameter: barRadius * 2 },
					scene
				);
				hookArm.position = transformPos(hookX, height - 0.04, -depth / 2 + hookDepth / 2 + 0.02);
				hookArm.rotation.x = Math.PI / 2;
				hookArm.rotation.y = rotation;
				hookArm.material = paintedMat;
				meshes.push(hookArm);

				// Hook end (curved up)
				const hookEndPath: Vector3[] = [];
				for (let j = 0; j <= 8; j++) {
					const angle = (j / 8) * Math.PI / 2;
					hookEndPath.push(new Vector3(
						0,
						Math.sin(angle) * 0.05,
						Math.cos(angle) * 0.05
					));
				}
				const hookEnd = MeshBuilder.CreateTube(
					`${id}_hookEnd_${i}`,
					{ path: hookEndPath, radius: barRadius, tessellation: 8, cap: 2 },
					scene
				);
				hookEnd.position = transformPos(hookX, height - 0.04, -depth / 2 + hookDepth + 0.02);
				hookEnd.rotation.y = rotation;
				hookEnd.material = paintedMat;
				meshes.push(hookEnd);

				// Lower support hook
				const lowerHook = MeshBuilder.CreateCylinder(
					`${id}_lowerHook_${i}`,
					{ height: hookDepth * 0.6, diameter: barRadius * 1.5 },
					scene
				);
				lowerHook.position = transformPos(hookX, height * 0.4, -depth / 2 + hookDepth * 0.3 + 0.02);
				lowerHook.rotation.x = Math.PI / 2;
				lowerHook.rotation.y = rotation;
				lowerHook.material = paintedMat;
				meshes.push(lowerHook);

				// Tire tray
				const tray = MeshBuilder.CreateBox(
					`${id}_tray_${i}`,
					{ width: hookWidth * 0.8, height: 0.02, depth: hookDepth * 0.5 },
					scene
				);
				tray.position = transformPos(hookX, height * 0.38, -depth / 2 + hookDepth * 0.25 + 0.02);
				tray.rotation.y = rotation;
				tray.material = rackMat;
				meshes.push(tray);
			}

			// Wall mounting bolts
			const boltCount = Math.ceil(actualCapacity / 2) + 1;
			for (let b = 0; b < boltCount; b++) {
				const boltX = (b - (boltCount - 1) / 2) * (totalWidth / (boltCount - 1 || 1));
				const bolt = MeshBuilder.CreateCylinder(
					`${id}_bolt_${b}`,
					{ height: 0.03, diameter: 0.025 },
					scene
				);
				bolt.position = transformPos(boltX, height - 0.04, -depth / 2);
				bolt.rotation.x = Math.PI / 2;
				bolt.rotation.y = rotation;
				bolt.material = anchorMat;
				meshes.push(bolt);
			}
		}

		// Add parked bicycles (simplified representations)
		if (actualOccupied > 0) {
			const bikeMat = new PBRMaterial(`rack_bike_${id}`, scene);
			bikeMat.metallic = 0.7;
			bikeMat.roughness = 0.4;
			materials.push(bikeMat);

			const wheelMat = new PBRMaterial(`rack_wheel_${id}`, scene);
			wheelMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			wheelMat.metallic = 0.2;
			wheelMat.roughness = 0.8;
			materials.push(wheelMat);

			// Determine which slots are occupied
			const occupiedSlots: number[] = [];
			const availableSlots = Array.from({ length: actualCapacity }, (_, i) => i);

			for (let o = 0; o < actualOccupied; o++) {
				if (rng) {
					const slotIndex = Math.floor(rng.next() * availableSlots.length);
					occupiedSlots.push(availableSlots.splice(slotIndex, 1)[0]);
				} else {
					occupiedSlots.push(o);
				}
			}

			// Bike colors
			const bikeColors = [
				new Color3(0.15, 0.15, 0.18),  // Black
				new Color3(0.6, 0.6, 0.62),    // Silver
				new Color3(0.6, 0.1, 0.1),     // Red
				new Color3(0.1, 0.3, 0.5),     // Blue
				new Color3(0.5, 0.35, 0.1),    // Orange
			];

			for (const slotIdx of occupiedSlots) {
				const bikeX = (slotIdx - (actualCapacity - 1) / 2) * slotWidth;
				const bikeColor = rng
					? bikeColors[Math.floor(rng.next() * bikeColors.length)]
					: bikeColors[0];

				const thisBikeMat = new PBRMaterial(`rack_bike_${id}_${slotIdx}`, scene);
				thisBikeMat.albedoColor = bikeColor.scale(condition);
				thisBikeMat.metallic = 0.7;
				thisBikeMat.roughness = 0.4;
				materials.push(thisBikeMat);

				const wheelRadius = 0.3;
				const wheelbase = 0.85;

				if (type === "wall") {
					// Vertical bike
					// Frame simplified
					const frame = MeshBuilder.CreateCylinder(
						`${id}_bikeFrame_${slotIdx}`,
						{ height: wheelbase, diameter: 0.025 },
						scene
					);
					frame.position = transformPos(bikeX, height - 0.3, 0);
					frame.material = thisBikeMat;
					meshes.push(frame);

					// Wheels (vertical)
					for (const wPos of [-1, 1]) {
						const wheel = MeshBuilder.CreateTorus(
							`${id}_bikeWheel_${slotIdx}_${wPos}`,
							{ diameter: wheelRadius * 2, thickness: 0.025, tessellation: 20 },
							scene
						);
						wheel.position = transformPos(bikeX, height - 0.3 + wPos * (wheelbase / 2), 0);
						wheel.rotation.y = rotation + Math.PI / 2;
						wheel.material = wheelMat;
						meshes.push(wheel);
					}
				} else {
					// Horizontal bike
					const bikeZ = type === "grid" ? depth / 4 : 0;
					const bikeY = wheelRadius;

					// Frame simplified as box
					const frame = MeshBuilder.CreateBox(
						`${id}_bikeFrame_${slotIdx}`,
						{ width: 0.05, height: 0.4, depth: wheelbase * 0.7 },
						scene
					);
					frame.position = transformPos(bikeX + (rng ? (rng.next() - 0.5) * 0.05 : 0), bikeY + 0.15, bikeZ);
					frame.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.1 : 0);
					frame.material = thisBikeMat;
					meshes.push(frame);

					// Wheels
					for (const wPos of [-1, 1]) {
						const wheel = MeshBuilder.CreateTorus(
							`${id}_bikeWheel_${slotIdx}_${wPos}`,
							{ diameter: wheelRadius * 2, thickness: 0.02, tessellation: 20 },
							scene
						);
						wheel.position = transformPos(
							bikeX,
							bikeY,
							bikeZ + wPos * (wheelbase / 2)
						);
						wheel.rotation.x = Math.PI / 2;
						wheel.rotation.y = rotation;
						wheel.material = wheelMat;
						meshes.push(wheel);
					}

					// Handlebars
					const handlebar = MeshBuilder.CreateCylinder(
						`${id}_handlebar_${slotIdx}`,
						{ height: 0.4, diameter: 0.018 },
						scene
					);
					handlebar.position = transformPos(bikeX, bikeY + 0.45, bikeZ + wheelbase / 2 - 0.1);
					handlebar.rotation.z = Math.PI / 2;
					handlebar.rotation.y = rotation;
					handlebar.material = thisBikeMat;
					meshes.push(handlebar);

					// Seat
					const seat = MeshBuilder.CreateBox(
						`${id}_seat_${slotIdx}`,
						{ width: 0.1, height: 0.03, depth: 0.2 },
						scene
					);
					seat.position = transformPos(bikeX, bikeY + 0.5, bikeZ - wheelbase / 4);
					seat.rotation.y = rotation;
					const seatMat = new PBRMaterial(`rack_seat_${id}_${slotIdx}`, scene);
					seatMat.albedoColor = new Color3(0.12, 0.12, 0.14);
					seatMat.metallic = 0.1;
					seatMat.roughness = 0.8;
					materials.push(seatMat);
					seat.material = seatMat;
					meshes.push(seat);
				}
			}
		}

		// Add rust/weathering for low condition
		if (condition < 0.5 && rng) {
			const rustMat = new PBRMaterial(`rack_rust_${id}`, scene);
			rustMat.albedoColor = new Color3(0.5, 0.3, 0.15);
			rustMat.metallic = 0.3;
			rustMat.roughness = 0.9;
			materials.push(rustMat);

			const rustCount = 4 + Math.floor(rng.next() * 6);
			for (let r = 0; r < rustCount; r++) {
				const rustX = (rng.next() - 0.5) * totalWidth;
				const rustY = rng.next() * height * 0.8 + 0.1;
				const rustZ = (rng.next() - 0.5) * depth * 0.5;
				const rustSize = 0.015 + rng.next() * 0.025;

				const rust = MeshBuilder.CreateSphere(
					`${id}_rust_${r}`,
					{ diameter: rustSize, segments: 6 },
					scene
				);
				rust.position = transformPos(rustX, rustY, rustZ);
				rust.material = rustMat;
				meshes.push(rust);
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
	}, [scene, id, posX, posY, posZ, type, capacity, occupiedCount, condition, rotation, seed]);

	return null;
}
