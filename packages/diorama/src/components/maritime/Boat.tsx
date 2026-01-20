/**
 * Boat - Small watercraft
 *
 * Boats and small vessels for flooded environments.
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

export type BoatType =
	| "rowboat"
	| "motorboat"
	| "kayak"
	| "canoe"
	| "dinghy"
	| "sampan";
export type BoatState = "floating" | "beached" | "sunk" | "overturned";

export interface BoatProps {
	id: string;
	position: Vector3;
	/** Boat type */
	type?: BoatType;
	/** Boat state */
	state?: BoatState;
	/** Length */
	length?: number;
	/** Has oars/paddles */
	hasOars?: boolean;
	/** Has motor (for motorboat) */
	hasMotor?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Boat({
	id,
	position,
	type = "rowboat",
	state = "floating",
	length = 3,
	hasOars = true,
	hasMotor = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: BoatProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const _rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = condition;

		// Calculate state transforms
		let baseY = posY;
		let tiltX = 0;
		let tiltZ = 0;

		if (state === "beached") {
			tiltX = 0.1;
		} else if (state === "sunk") {
			baseY = posY - 0.3;
			tiltX = 0.05;
		} else if (state === "overturned") {
			tiltZ = Math.PI;
			baseY = posY + 0.2;
		}

		// Hull material
		const hullMat = new PBRMaterial(`boat_hull_${id}`, scene);

		switch (type) {
			case "rowboat":
			case "dinghy":
				hullMat.albedoColor = new Color3(0.45, 0.35, 0.2).scale(
					conditionFactor,
				);
				hullMat.metallic = 0;
				hullMat.roughness = 0.85;
				break;
			case "motorboat":
				hullMat.albedoColor = new Color3(0.9, 0.9, 0.92).scale(conditionFactor);
				hullMat.metallic = 0.4;
				hullMat.roughness = 0.3;
				break;
			case "kayak":
				hullMat.albedoColor = new Color3(0.9, 0.4, 0.1).scale(conditionFactor);
				hullMat.metallic = 0.2;
				hullMat.roughness = 0.5;
				break;
			case "canoe":
				hullMat.albedoColor = new Color3(0.5, 0.35, 0.2).scale(conditionFactor);
				hullMat.metallic = 0;
				hullMat.roughness = 0.9;
				break;
			case "sampan":
				hullMat.albedoColor = new Color3(0.35, 0.28, 0.18).scale(
					conditionFactor,
				);
				hullMat.metallic = 0;
				hullMat.roughness = 0.9;
				break;
		}

		const width =
			type === "kayak"
				? length * 0.15
				: type === "canoe"
					? length * 0.2
					: length * 0.35;
		const depth =
			type === "kayak" || type === "canoe" ? length * 0.08 : length * 0.15;

		if (type === "rowboat" || type === "dinghy") {
			// Traditional rowboat shape
			const hull = MeshBuilder.CreateBox(
				`${id}_hull`,
				{ width: width, height: depth, depth: length },
				scene,
			);
			hull.position = new Vector3(posX, baseY + depth / 2, posZ);
			hull.rotation.y = rotation;
			hull.rotation.x = tiltX;
			hull.rotation.z = tiltZ;
			hull.material = hullMat;
			meshes.push(hull);

			// Bow (front point)
			const bow = MeshBuilder.CreateCylinder(
				`${id}_bow`,
				{
					height: depth,
					diameterTop: 0.05,
					diameterBottom: width,
					tessellation: 3,
				},
				scene,
			);
			bow.position = new Vector3(
				posX - Math.sin(rotation) * (length / 2),
				baseY + depth / 2,
				posZ - Math.cos(rotation) * (length / 2),
			);
			bow.rotation.y = rotation + Math.PI / 6;
			bow.rotation.x = tiltX;
			bow.material = hullMat;
			meshes.push(bow);

			// Stern (back)
			const stern = MeshBuilder.CreateBox(
				`${id}_stern`,
				{ width: width * 0.8, height: depth, depth: 0.1 },
				scene,
			);
			stern.position = new Vector3(
				posX + Math.sin(rotation) * (length / 2 + 0.05),
				baseY + depth / 2,
				posZ + Math.cos(rotation) * (length / 2 + 0.05),
			);
			stern.rotation.y = rotation;
			stern.rotation.x = tiltX;
			stern.material = hullMat;
			meshes.push(stern);

			// Seats
			const seatMat = new PBRMaterial(`boat_seat_${id}`, scene);
			seatMat.albedoColor = new Color3(0.4, 0.32, 0.2).scale(conditionFactor);
			seatMat.metallic = 0;
			seatMat.roughness = 0.85;

			for (let s = 0; s < 2; s++) {
				const seatZ = (s - 0.5) * (length * 0.4);
				const seat = MeshBuilder.CreateBox(
					`${id}_seat_${s}`,
					{ width: width * 0.9, height: 0.03, depth: 0.2 },
					scene,
				);
				seat.position = new Vector3(
					posX - Math.sin(rotation) * seatZ,
					baseY + depth + 0.015,
					posZ - Math.cos(rotation) * seatZ,
				);
				seat.rotation.y = rotation;
				seat.material = seatMat;
				meshes.push(seat);
			}
		} else if (type === "motorboat") {
			// Sleeker motorboat
			const hull = MeshBuilder.CreateBox(
				`${id}_hull`,
				{ width: width, height: depth, depth: length },
				scene,
			);
			hull.position = new Vector3(posX, baseY + depth / 2, posZ);
			hull.rotation.y = rotation;
			hull.rotation.x = tiltX;
			hull.rotation.z = tiltZ;
			hull.material = hullMat;
			meshes.push(hull);

			// Windshield
			const glassMat = new PBRMaterial(`boat_glass_${id}`, scene);
			glassMat.albedoColor = new Color3(0.5, 0.6, 0.7);
			glassMat.metallic = 0.1;
			glassMat.roughness = 0.1;
			glassMat.alpha = 0.6;

			const windshield = MeshBuilder.CreateBox(
				`${id}_windshield`,
				{ width: width * 0.8, height: depth * 0.6, depth: 0.03 },
				scene,
			);
			windshield.position = new Vector3(
				posX - Math.sin(rotation) * (length * 0.15),
				baseY + depth + depth * 0.3,
				posZ - Math.cos(rotation) * (length * 0.15),
			);
			windshield.rotation.y = rotation;
			windshield.rotation.x = -0.3;
			windshield.material = glassMat;
			meshes.push(windshield);
		} else if (type === "kayak" || type === "canoe") {
			// Narrow elongated hull
			const hull = MeshBuilder.CreateCylinder(
				`${id}_hull`,
				{ height: length, diameter: width, tessellation: 12 },
				scene,
			);
			hull.position = new Vector3(posX, baseY + width / 4, posZ);
			hull.rotation.z = Math.PI / 2;
			hull.rotation.y = rotation;
			hull.scaling = new Vector3(1, (depth / width) * 2, 1);
			hull.material = hullMat;
			meshes.push(hull);

			// Cockpit opening (for kayak)
			if (type === "kayak") {
				const cockpitMat = new PBRMaterial(`boat_cockpit_${id}`, scene);
				cockpitMat.albedoColor = new Color3(0.15, 0.15, 0.18);
				cockpitMat.metallic = 0;
				cockpitMat.roughness = 0.8;

				const cockpit = MeshBuilder.CreateCylinder(
					`${id}_cockpit`,
					{ height: 0.02, diameter: width * 0.7, tessellation: 12 },
					scene,
				);
				cockpit.position = new Vector3(posX, baseY + width / 2, posZ);
				cockpit.material = cockpitMat;
				meshes.push(cockpit);
			}
		} else {
			// Sampan (flat-bottomed)
			const hull = MeshBuilder.CreateBox(
				`${id}_hull`,
				{ width: width, height: depth * 0.5, depth: length },
				scene,
			);
			hull.position = new Vector3(posX, baseY + depth * 0.25, posZ);
			hull.rotation.y = rotation;
			hull.rotation.x = tiltX;
			hull.material = hullMat;
			meshes.push(hull);

			// Curved sides
			for (const side of [-1, 1]) {
				const sidePanel = MeshBuilder.CreateBox(
					`${id}_side_${side}`,
					{ width: 0.05, height: depth * 0.8, depth: length * 0.9 },
					scene,
				);
				sidePanel.position = new Vector3(
					posX + Math.cos(rotation) * ((side * width) / 2),
					baseY + depth * 0.4,
					posZ - Math.sin(rotation) * ((side * width) / 2),
				);
				sidePanel.rotation.y = rotation;
				sidePanel.rotation.z = side * 0.15;
				sidePanel.material = hullMat;
				meshes.push(sidePanel);
			}

			// Canopy frame
			const canopyMat = new PBRMaterial(`boat_canopy_${id}`, scene);
			canopyMat.albedoColor = new Color3(0.6, 0.55, 0.45).scale(
				conditionFactor,
			);
			canopyMat.metallic = 0;
			canopyMat.roughness = 0.85;

			const canopy = MeshBuilder.CreateBox(
				`${id}_canopy`,
				{ width: width * 0.8, height: 0.03, depth: length * 0.4 },
				scene,
			);
			canopy.position = new Vector3(
				posX + Math.sin(rotation) * (length * 0.15),
				baseY + depth + 0.5,
				posZ + Math.cos(rotation) * (length * 0.15),
			);
			canopy.rotation.y = rotation;
			canopy.material = canopyMat;
			meshes.push(canopy);
		}

		// Oars
		if (
			hasOars &&
			state !== "overturned" &&
			(type === "rowboat" || type === "canoe" || type === "dinghy")
		) {
			const oarMat = new PBRMaterial(`boat_oar_${id}`, scene);
			oarMat.albedoColor = new Color3(0.5, 0.4, 0.25);
			oarMat.metallic = 0;
			oarMat.roughness = 0.85;

			for (const side of [-1, 1]) {
				// Oar shaft
				const oarLength = length * 0.6;
				const oar = MeshBuilder.CreateCylinder(
					`${id}_oar_${side}`,
					{ height: oarLength, diameter: 0.03 },
					scene,
				);
				oar.position = new Vector3(
					posX + Math.cos(rotation) * (side * width * 0.6),
					baseY + depth + 0.1,
					posZ - Math.sin(rotation) * (side * width * 0.6),
				);
				oar.rotation.z = Math.PI / 2 + side * 0.3;
				oar.rotation.y = rotation;
				oar.material = oarMat;
				meshes.push(oar);

				// Oar blade
				const blade = MeshBuilder.CreateBox(
					`${id}_blade_${side}`,
					{ width: 0.15, height: 0.02, depth: 0.3 },
					scene,
				);
				blade.position = new Vector3(
					posX + Math.cos(rotation) * (side * (width * 0.6 + oarLength / 2)),
					baseY + depth + 0.1 - side * oarLength * 0.15,
					posZ - Math.sin(rotation) * (side * (width * 0.6 + oarLength / 2)),
				);
				blade.rotation.y = rotation;
				blade.material = oarMat;
				meshes.push(blade);
			}
		}

		// Motor
		if ((hasMotor || type === "motorboat") && state !== "overturned") {
			const motorMat = new PBRMaterial(`boat_motor_${id}`, scene);
			motorMat.albedoColor = new Color3(0.2, 0.22, 0.25);
			motorMat.metallic = 0.6;
			motorMat.roughness = 0.5;

			// Motor body
			const motor = MeshBuilder.CreateBox(
				`${id}_motor`,
				{ width: 0.3, height: 0.5, depth: 0.2 },
				scene,
			);
			motor.position = new Vector3(
				posX + Math.sin(rotation) * (length / 2 - 0.1),
				baseY + depth - 0.1,
				posZ + Math.cos(rotation) * (length / 2 - 0.1),
			);
			motor.rotation.y = rotation;
			motor.material = motorMat;
			meshes.push(motor);

			// Propeller shaft
			const shaft = MeshBuilder.CreateCylinder(
				`${id}_shaft`,
				{ height: 0.6, diameter: 0.05 },
				scene,
			);
			shaft.position = new Vector3(
				posX + Math.sin(rotation) * (length / 2 + 0.1),
				baseY - 0.1,
				posZ + Math.cos(rotation) * (length / 2 + 0.1),
			);
			shaft.rotation.x = 0.2;
			shaft.material = motorMat;
			meshes.push(shaft);
		}

		// Water in hull (for sunk state)
		if (state === "sunk") {
			const waterMat = new PBRMaterial(`boat_water_${id}`, scene);
			waterMat.albedoColor = new Color3(0.2, 0.35, 0.45);
			waterMat.metallic = 0.2;
			waterMat.roughness = 0.1;
			waterMat.alpha = 0.7;

			const water = MeshBuilder.CreateBox(
				`${id}_water`,
				{ width: width * 0.9, height: depth * 0.7, depth: length * 0.9 },
				scene,
			);
			water.position = new Vector3(posX, baseY + depth * 0.35, posZ);
			water.rotation.y = rotation;
			water.material = waterMat;
			meshes.push(water);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			hullMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		state,
		length,
		hasOars,
		hasMotor,
		condition,
		rotation,
		seed,
	]);

	return null;
}
