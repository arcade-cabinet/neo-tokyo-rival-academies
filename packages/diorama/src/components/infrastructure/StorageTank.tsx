/**
 * StorageTank - Industrial storage tanks
 *
 * Large storage tanks for industrial areas.
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

export type StorageTankType =
	| "cylindrical"
	| "spherical"
	| "rectangular"
	| "silo"
	| "pressurized";
export type StorageTankContent =
	| "fuel"
	| "water"
	| "chemical"
	| "gas"
	| "empty";

export interface StorageTankProps {
	id: string;
	position: Vector3;
	/** Tank type */
	type?: StorageTankType;
	/** Tank contents */
	content?: StorageTankContent;
	/** Diameter/width */
	diameter?: number;
	/** Height */
	height?: number;
	/** Has ladder */
	hasLadder?: boolean;
	/** Has piping */
	hasPiping?: boolean;
	/** Fill level 0-1 */
	fillLevel?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function StorageTank({
	id,
	position,
	type = "cylindrical",
	content = "fuel",
	diameter = 3,
	height = 5,
	hasLadder = true,
	hasPiping = true,
	fillLevel = 0.7,
	condition = 0.8,
	rotation = 0,
	seed,
}: StorageTankProps) {
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

		// Tank material based on content
		const tankMat = new PBRMaterial(`tank_${id}`, scene);

		switch (content) {
			case "fuel":
				tankMat.albedoColor = new Color3(0.85, 0.85, 0.8).scale(
					conditionFactor,
				);
				break;
			case "water":
				tankMat.albedoColor = new Color3(0.3, 0.5, 0.7).scale(conditionFactor);
				break;
			case "chemical":
				tankMat.albedoColor = new Color3(0.7, 0.65, 0.2).scale(conditionFactor);
				break;
			case "gas":
				tankMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(
					conditionFactor,
				);
				break;
			default:
				tankMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(
					conditionFactor,
				);
		}
		tankMat.metallic = 0.7;
		tankMat.roughness = 0.4;

		if (type === "cylindrical") {
			// Standard cylindrical tank
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: height, diameter: diameter, tessellation: 24 },
				scene,
			);
			tank.position = new Vector3(posX, posY + height / 2, posZ);
			tank.material = tankMat;
			meshes.push(tank);

			// Dome top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: diameter, segments: 16, slice: 0.5 },
				scene,
			);
			dome.position = new Vector3(posX, posY + height, posZ);
			dome.material = tankMat;
			meshes.push(dome);

			// Base ring
			const baseRingMat = new PBRMaterial(`tank_basering_${id}`, scene);
			baseRingMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(
				conditionFactor,
			);
			baseRingMat.metallic = 0.8;
			baseRingMat.roughness = 0.4;

			const baseRing = MeshBuilder.CreateTorus(
				`${id}_basering`,
				{ diameter: diameter + 0.1, thickness: 0.1, tessellation: 24 },
				scene,
			);
			baseRing.position = new Vector3(posX, posY + 0.05, posZ);
			baseRing.rotation.x = Math.PI / 2;
			baseRing.material = baseRingMat;
			meshes.push(baseRing);
		} else if (type === "spherical") {
			// Spherical tank (for gas)
			const sphere = MeshBuilder.CreateSphere(
				`${id}_sphere`,
				{ diameter: diameter, segments: 24 },
				scene,
			);
			sphere.position = new Vector3(posX, posY + diameter / 2 + 0.5, posZ);
			sphere.material = tankMat;
			meshes.push(sphere);

			// Support legs
			const legMat = new PBRMaterial(`tank_leg_${id}`, scene);
			legMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
			legMat.metallic = 0.8;
			legMat.roughness = 0.4;

			const legCount = 4;
			for (let l = 0; l < legCount; l++) {
				const legAngle = (l / legCount) * Math.PI * 2 + rotation;
				const legX = Math.cos(legAngle) * (diameter / 3);
				const legZ = Math.sin(legAngle) * (diameter / 3);

				const leg = MeshBuilder.CreateCylinder(
					`${id}_leg_${l}`,
					{ height: diameter / 2 + 0.5, diameter: 0.15 },
					scene,
				);
				leg.position = new Vector3(
					posX + legX,
					posY + (diameter / 4 + 0.25),
					posZ + legZ,
				);
				leg.rotation.z = Math.atan2(legX, diameter / 2) * 0.3;
				leg.rotation.x = Math.atan2(legZ, diameter / 2) * 0.3;
				leg.material = legMat;
				meshes.push(leg);
			}
		} else if (type === "rectangular") {
			// Rectangular tank
			const tank = MeshBuilder.CreateBox(
				`${id}_tank`,
				{ width: diameter, height: height, depth: diameter * 1.5 },
				scene,
			);
			tank.position = new Vector3(posX, posY + height / 2, posZ);
			tank.rotation.y = rotation;
			tank.material = tankMat;
			meshes.push(tank);

			// Reinforcement ribs
			const ribMat = new PBRMaterial(`tank_rib_${id}`, scene);
			ribMat.albedoColor = tankMat.albedoColor.scale(0.9);
			ribMat.metallic = 0.8;
			ribMat.roughness = 0.4;

			const ribCount = 4;
			for (let r = 0; r < ribCount; r++) {
				const ribY = (r + 1) * (height / (ribCount + 1));

				for (const side of [-1, 1]) {
					const rib = MeshBuilder.CreateBox(
						`${id}_rib_${r}_${side}`,
						{ width: 0.05, height: 0.1, depth: diameter * 1.5 + 0.1 },
						scene,
					);
					rib.position = new Vector3(
						posX + Math.cos(rotation) * ((side * diameter) / 2),
						posY + ribY,
						posZ - Math.sin(rotation) * ((side * diameter) / 2),
					);
					rib.rotation.y = rotation;
					rib.material = ribMat;
					meshes.push(rib);
				}
			}
		} else if (type === "silo") {
			// Grain silo style
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: height, diameter: diameter, tessellation: 24 },
				scene,
			);
			tank.position = new Vector3(posX, posY + height / 2, posZ);
			tank.material = tankMat;
			meshes.push(tank);

			// Conical top
			const cone = MeshBuilder.CreateCylinder(
				`${id}_cone`,
				{
					height: height * 0.3,
					diameterBottom: diameter,
					diameterTop: 0.2,
					tessellation: 24,
				},
				scene,
			);
			cone.position = new Vector3(posX, posY + height + height * 0.15, posZ);
			cone.material = tankMat;
			meshes.push(cone);

			// Horizontal rings
			const ringMat = new PBRMaterial(`tank_ring_${id}`, scene);
			ringMat.albedoColor = tankMat.albedoColor.scale(0.85);
			ringMat.metallic = 0.75;
			ringMat.roughness = 0.45;

			const ringCount = Math.floor(height / 1.5);
			for (let r = 0; r < ringCount; r++) {
				const ring = MeshBuilder.CreateTorus(
					`${id}_ring_${r}`,
					{ diameter: diameter + 0.05, thickness: 0.04, tessellation: 24 },
					scene,
				);
				ring.position = new Vector3(posX, posY + (r + 1) * 1.5, posZ);
				ring.rotation.x = Math.PI / 2;
				ring.material = ringMat;
				meshes.push(ring);
			}
		} else {
			// Pressurized (horizontal cylinder)
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: height, diameter: diameter, tessellation: 24 },
				scene,
			);
			tank.position = new Vector3(posX, posY + diameter / 2 + 0.3, posZ);
			tank.rotation.z = Math.PI / 2;
			tank.rotation.y = rotation;
			tank.material = tankMat;
			meshes.push(tank);

			// End caps (hemispheres)
			for (const side of [-1, 1]) {
				const cap = MeshBuilder.CreateSphere(
					`${id}_cap_${side}`,
					{ diameter: diameter, segments: 16, slice: 0.5 },
					scene,
				);
				cap.position = new Vector3(
					posX + Math.cos(rotation) * ((side * height) / 2),
					posY + diameter / 2 + 0.3,
					posZ - Math.sin(rotation) * ((side * height) / 2),
				);
				cap.rotation.y = rotation + (side === 1 ? 0 : Math.PI);
				cap.rotation.z = Math.PI / 2;
				cap.material = tankMat;
				meshes.push(cap);
			}

			// Saddle supports
			const saddleMat = new PBRMaterial(`tank_saddle_${id}`, scene);
			saddleMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(
				conditionFactor,
			);
			saddleMat.metallic = 0.7;
			saddleMat.roughness = 0.5;

			for (const offset of [-height / 4, height / 4]) {
				const saddle = MeshBuilder.CreateBox(
					`${id}_saddle_${offset}`,
					{ width: 0.2, height: diameter / 2 + 0.3, depth: diameter + 0.2 },
					scene,
				);
				saddle.position = new Vector3(
					posX + Math.cos(rotation) * offset,
					posY + (diameter / 4 + 0.15),
					posZ - Math.sin(rotation) * offset,
				);
				saddle.rotation.y = rotation;
				saddle.material = saddleMat;
				meshes.push(saddle);
			}
		}

		// Ladder
		if (hasLadder && type !== "pressurized") {
			const ladderMat = new PBRMaterial(`tank_ladder_${id}`, scene);
			ladderMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(
				conditionFactor,
			);
			ladderMat.metallic = 0.8;
			ladderMat.roughness = 0.4;

			const ladderHeight = type === "spherical" ? diameter : height;

			// Rails
			for (const side of [-0.15, 0.15]) {
				const rail = MeshBuilder.CreateCylinder(
					`${id}_rail_${side}`,
					{ height: ladderHeight, diameter: 0.03 },
					scene,
				);
				rail.position = new Vector3(
					posX +
						Math.cos(rotation) * (diameter / 2 + 0.1) +
						Math.sin(rotation) * side,
					posY + ladderHeight / 2,
					posZ -
						Math.sin(rotation) * (diameter / 2 + 0.1) +
						Math.cos(rotation) * side,
				);
				rail.material = ladderMat;
				meshes.push(rail);
			}

			// Rungs
			const rungCount = Math.floor(ladderHeight / 0.3);
			for (let r = 0; r < rungCount; r++) {
				const rung = MeshBuilder.CreateCylinder(
					`${id}_rung_${r}`,
					{ height: 0.3, diameter: 0.02 },
					scene,
				);
				rung.position = new Vector3(
					posX + Math.cos(rotation) * (diameter / 2 + 0.1),
					posY + (r + 1) * 0.3,
					posZ - Math.sin(rotation) * (diameter / 2 + 0.1),
				);
				rung.rotation.z = Math.PI / 2;
				rung.rotation.y = rotation;
				rung.material = ladderMat;
				meshes.push(rung);
			}
		}

		// Piping
		if (hasPiping) {
			const pipeMat = new PBRMaterial(`tank_pipe_${id}`, scene);
			pipeMat.albedoColor = new Color3(0.45, 0.47, 0.5).scale(conditionFactor);
			pipeMat.metallic = 0.75;
			pipeMat.roughness = 0.4;

			// Main outlet pipe
			const outletHeight = type === "pressurized" ? diameter / 2 + 0.3 : 0.5;
			const outlet = MeshBuilder.CreateCylinder(
				`${id}_outlet`,
				{ height: 1, diameter: 0.15 },
				scene,
			);
			outlet.position = new Vector3(
				posX - Math.sin(rotation) * (diameter / 2 + 0.5),
				posY + outletHeight,
				posZ - Math.cos(rotation) * (diameter / 2 + 0.5),
			);
			outlet.rotation.z = Math.PI / 2;
			outlet.rotation.y = rotation;
			outlet.material = pipeMat;
			meshes.push(outlet);

			// Valve
			const valve = MeshBuilder.CreateCylinder(
				`${id}_valve`,
				{ height: 0.2, diameter: 0.25 },
				scene,
			);
			valve.position = new Vector3(
				posX - Math.sin(rotation) * (diameter / 2 + 1),
				posY + outletHeight,
				posZ - Math.cos(rotation) * (diameter / 2 + 1),
			);
			valve.rotation.z = Math.PI / 2;
			valve.rotation.y = rotation;
			valve.material = pipeMat;
			meshes.push(valve);

			// Valve wheel
			const wheelMat = new PBRMaterial(`tank_wheel_${id}`, scene);
			wheelMat.albedoColor = new Color3(0.8, 0.2, 0.1);
			wheelMat.metallic = 0.6;
			wheelMat.roughness = 0.5;

			const wheel = MeshBuilder.CreateTorus(
				`${id}_wheel`,
				{ diameter: 0.15, thickness: 0.02, tessellation: 16 },
				scene,
			);
			wheel.position = new Vector3(
				posX - Math.sin(rotation) * (diameter / 2 + 1.15),
				posY + outletHeight,
				posZ - Math.cos(rotation) * (diameter / 2 + 1.15),
			);
			wheel.rotation.y = rotation;
			wheel.material = wheelMat;
			meshes.push(wheel);
		}

		// Warning labels
		if (content === "fuel" || content === "chemical") {
			const labelMat = new PBRMaterial(`tank_label_${id}`, scene);
			labelMat.albedoColor =
				content === "fuel"
					? new Color3(0.9, 0.1, 0.1)
					: new Color3(0.9, 0.7, 0.1);
			labelMat.metallic = 0;
			labelMat.roughness = 0.6;

			const label = MeshBuilder.CreatePlane(
				`${id}_label`,
				{ width: 0.5, height: 0.5 },
				scene,
			);
			label.position = new Vector3(
				posX + Math.cos(rotation + Math.PI / 2) * (diameter / 2 + 0.01),
				posY + (type === "pressurized" ? diameter / 2 + 0.3 : height / 2),
				posZ - Math.sin(rotation + Math.PI / 2) * (diameter / 2 + 0.01),
			);
			label.rotation.y = rotation + Math.PI / 2;
			label.material = labelMat;
			meshes.push(label);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			tankMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		content,
		diameter,
		height,
		hasLadder,
		hasPiping,
		fillLevel,
		condition,
		rotation,
		seed,
	]);

	return null;
}
