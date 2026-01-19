/**
 * FireHydrant - Urban fire hydrant component
 *
 * Various fire hydrant styles for the flooded neo-tokyo city.
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

export type HydrantType = "american" | "european" | "japanese" | "industrial";
export type HydrantCondition = "new" | "weathered" | "rusted" | "damaged";

export interface FireHydrantProps {
	id: string;
	position: Vector3;
	/** Hydrant type/style */
	type?: HydrantType;
	/** Height of hydrant */
	height?: number;
	/** Whether water is flowing */
	isOpen?: boolean;
	/** Visual condition */
	condition?: HydrantCondition;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function FireHydrant({
	id,
	position,
	type = "american",
	height = 0.75,
	isOpen = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: FireHydrantProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Condition factors for weathering
		const conditionFactor =
			condition === "new"
				? 1
				: condition === "weathered"
					? 0.85
					: condition === "rusted"
						? 0.65
						: 0.5;

		// Base colors by type
		const baseColor =
			type === "american"
				? new Color3(0.85, 0.15, 0.1) // Red
				: type === "european"
					? new Color3(0.85, 0.75, 0.1) // Yellow
					: type === "japanese"
						? new Color3(0.85, 0.15, 0.1) // Red
						: new Color3(0.4, 0.4, 0.42); // Industrial gray

		// Materials
		const bodyMat = new PBRMaterial(`hydrant_body_${id}`, scene);
		bodyMat.albedoColor = baseColor.scale(conditionFactor);
		bodyMat.metallic = 0.7;
		bodyMat.roughness = condition === "rusted" ? 0.8 : 0.5;

		const capMat = new PBRMaterial(`hydrant_cap_${id}`, scene);
		capMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(conditionFactor);
		capMat.metallic = 0.85;
		capMat.roughness = 0.4;

		const chainMat = new PBRMaterial(`hydrant_chain_${id}`, scene);
		chainMat.albedoColor = new Color3(0.5, 0.5, 0.52).scale(conditionFactor);
		chainMat.metallic = 0.9;
		chainMat.roughness = 0.3;

		if (type === "american") {
			// Classic American fire hydrant
			const bodyRadius = 0.12;
			const nozzleRadius = 0.04;

			// Base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.08, diameterTop: bodyRadius * 2.2, diameterBottom: bodyRadius * 2.5 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.04, posZ);
			base.material = bodyMat;
			meshes.push(base);

			// Main body (barrel)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: height * 0.6, diameterTop: bodyRadius * 2, diameterBottom: bodyRadius * 2.2 },
				scene
			);
			body.position = new Vector3(posX, posY + 0.08 + (height * 0.6) / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Bonnet (top dome)
			const bonnet = MeshBuilder.CreateCylinder(
				`${id}_bonnet`,
				{ height: height * 0.25, diameterTop: bodyRadius * 1.2, diameterBottom: bodyRadius * 2 },
				scene
			);
			bonnet.position = new Vector3(posX, posY + 0.08 + height * 0.6 + (height * 0.25) / 2, posZ);
			bonnet.material = bodyMat;
			meshes.push(bonnet);

			// Operating nut on top
			const opNut = MeshBuilder.CreateCylinder(
				`${id}_opnut`,
				{ height: 0.04, diameter: bodyRadius * 0.8, tessellation: 5 },
				scene
			);
			opNut.position = new Vector3(posX, posY + height + 0.02, posZ);
			opNut.material = capMat;
			meshes.push(opNut);

			// Side nozzles (2.5 inch outlets)
			for (const angle of [Math.PI / 4, -Math.PI / 4 + Math.PI]) {
				const nozzleX = Math.cos(angle + rotation) * (bodyRadius + 0.03);
				const nozzleZ = Math.sin(angle + rotation) * (bodyRadius + 0.03);

				const nozzle = MeshBuilder.CreateCylinder(
					`${id}_nozzle_${angle}`,
					{ height: 0.08, diameter: nozzleRadius * 2 },
					scene
				);
				nozzle.position = new Vector3(
					posX + nozzleX,
					posY + height * 0.5,
					posZ + nozzleZ
				);
				nozzle.rotation.z = Math.PI / 2;
				nozzle.rotation.y = angle + rotation;
				nozzle.material = bodyMat;
				meshes.push(nozzle);

				// Nozzle cap
				const cap = MeshBuilder.CreateCylinder(
					`${id}_cap_${angle}`,
					{ height: 0.02, diameter: nozzleRadius * 2.2, tessellation: 6 },
					scene
				);
				cap.position = new Vector3(
					posX + Math.cos(angle + rotation) * (bodyRadius + 0.08),
					posY + height * 0.5,
					posZ + Math.sin(angle + rotation) * (bodyRadius + 0.08)
				);
				cap.rotation.z = Math.PI / 2;
				cap.rotation.y = angle + rotation;
				cap.material = capMat;
				meshes.push(cap);
			}

			// Front pumper nozzle (4.5 inch)
			const pumperNozzle = MeshBuilder.CreateCylinder(
				`${id}_pumper`,
				{ height: 0.1, diameter: 0.09 },
				scene
			);
			pumperNozzle.position = new Vector3(
				posX + Math.cos(rotation) * (bodyRadius + 0.05),
				posY + height * 0.35,
				posZ + Math.sin(rotation) * (bodyRadius + 0.05)
			);
			pumperNozzle.rotation.z = Math.PI / 2;
			pumperNozzle.rotation.y = rotation;
			pumperNozzle.material = bodyMat;
			meshes.push(pumperNozzle);

			const pumperCap = MeshBuilder.CreateCylinder(
				`${id}_pumperCap`,
				{ height: 0.03, diameter: 0.1, tessellation: 6 },
				scene
			);
			pumperCap.position = new Vector3(
				posX + Math.cos(rotation) * (bodyRadius + 0.11),
				posY + height * 0.35,
				posZ + Math.sin(rotation) * (bodyRadius + 0.11)
			);
			pumperCap.rotation.z = Math.PI / 2;
			pumperCap.rotation.y = rotation;
			pumperCap.material = capMat;
			meshes.push(pumperCap);
		} else if (type === "european") {
			// European pillar-style hydrant
			const bodyRadius = 0.08;

			// Base plate
			const basePlate = MeshBuilder.CreateCylinder(
				`${id}_basePlate`,
				{ height: 0.03, diameter: bodyRadius * 4 },
				scene
			);
			basePlate.position = new Vector3(posX, posY + 0.015, posZ);
			basePlate.material = capMat;
			meshes.push(basePlate);

			// Cylindrical body
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: height * 0.8, diameter: bodyRadius * 2 },
				scene
			);
			body.position = new Vector3(posX, posY + 0.03 + (height * 0.8) / 2, posZ);
			body.material = bodyMat;
			meshes.push(body);

			// Top cap
			const topCap = MeshBuilder.CreateCylinder(
				`${id}_topCap`,
				{ height: 0.06, diameterTop: bodyRadius * 1.5, diameterBottom: bodyRadius * 2 },
				scene
			);
			topCap.position = new Vector3(posX, posY + 0.03 + height * 0.8 + 0.03, posZ);
			topCap.material = bodyMat;
			meshes.push(topCap);

			// Dome top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: bodyRadius * 1.5, slice: 0.5 },
				scene
			);
			dome.position = new Vector3(posX, posY + 0.03 + height * 0.8 + 0.06, posZ);
			dome.material = bodyMat;
			meshes.push(dome);

			// Connection point (single outlet)
			const outlet = MeshBuilder.CreateCylinder(
				`${id}_outlet`,
				{ height: 0.06, diameter: 0.06 },
				scene
			);
			outlet.position = new Vector3(
				posX + Math.cos(rotation) * (bodyRadius + 0.03),
				posY + height * 0.5,
				posZ + Math.sin(rotation) * (bodyRadius + 0.03)
			);
			outlet.rotation.z = Math.PI / 2;
			outlet.rotation.y = rotation;
			outlet.material = capMat;
			meshes.push(outlet);
		} else if (type === "japanese") {
			// Japanese-style fire hydrant (shorter, distinctive shape)
			const bodyRadius = 0.1;

			// Round base
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.05, diameterTop: bodyRadius * 2.5, diameterBottom: bodyRadius * 2.8 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.025, posZ);
			base.material = bodyMat;
			meshes.push(base);

			// Lower body section
			const lowerBody = MeshBuilder.CreateCylinder(
				`${id}_lowerBody`,
				{ height: height * 0.4, diameter: bodyRadius * 2.2 },
				scene
			);
			lowerBody.position = new Vector3(posX, posY + 0.05 + (height * 0.4) / 2, posZ);
			lowerBody.material = bodyMat;
			meshes.push(lowerBody);

			// Decorative band
			const band = MeshBuilder.CreateTorus(
				`${id}_band`,
				{ diameter: bodyRadius * 2.3, thickness: 0.015 },
				scene
			);
			band.position = new Vector3(posX, posY + 0.05 + height * 0.4, posZ);
			band.rotation.x = Math.PI / 2;
			band.material = capMat;
			meshes.push(band);

			// Upper body (narrower)
			const upperBody = MeshBuilder.CreateCylinder(
				`${id}_upperBody`,
				{ height: height * 0.35, diameterTop: bodyRadius * 1.6, diameterBottom: bodyRadius * 2 },
				scene
			);
			upperBody.position = new Vector3(posX, posY + 0.05 + height * 0.4 + (height * 0.35) / 2, posZ);
			upperBody.material = bodyMat;
			meshes.push(upperBody);

			// Dome top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: bodyRadius * 1.6, slice: 0.5 },
				scene
			);
			dome.position = new Vector3(posX, posY + 0.05 + height * 0.75, posZ);
			dome.material = bodyMat;
			meshes.push(dome);

			// Single side outlet
			const outlet = MeshBuilder.CreateCylinder(
				`${id}_outlet`,
				{ height: 0.05, diameter: 0.05 },
				scene
			);
			outlet.position = new Vector3(
				posX + Math.cos(rotation) * (bodyRadius * 1.1 + 0.025),
				posY + height * 0.45,
				posZ + Math.sin(rotation) * (bodyRadius * 1.1 + 0.025)
			);
			outlet.rotation.z = Math.PI / 2;
			outlet.rotation.y = rotation;
			outlet.material = capMat;
			meshes.push(outlet);

			// Kanji marking plate (simplified as disc)
			const plate = MeshBuilder.CreateDisc(
				`${id}_plate`,
				{ radius: 0.04 },
				scene
			);
			plate.position = new Vector3(
				posX - Math.cos(rotation) * (bodyRadius * 1.1 + 0.01),
				posY + height * 0.5,
				posZ - Math.sin(rotation) * (bodyRadius * 1.1 + 0.01)
			);
			plate.rotation.y = rotation + Math.PI;
			const plateMat = new PBRMaterial(`hydrant_plate_${id}`, scene);
			plateMat.albedoColor = new Color3(1, 1, 1);
			plateMat.metallic = 0;
			plateMat.roughness = 0.3;
			plate.material = plateMat;
			meshes.push(plate);
		} else if (type === "industrial") {
			// Heavy-duty industrial hydrant
			const bodyRadius = 0.15;

			// Reinforced base
			const base = MeshBuilder.CreateBox(
				`${id}_base`,
				{ width: bodyRadius * 3, height: 0.08, depth: bodyRadius * 3 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.04, posZ);
			base.rotation.y = rotation;
			base.material = capMat;
			meshes.push(base);

			// Main body (hexagonal cross-section simulated)
			const body = MeshBuilder.CreateCylinder(
				`${id}_body`,
				{ height: height * 0.7, diameter: bodyRadius * 2, tessellation: 6 },
				scene
			);
			body.position = new Vector3(posX, posY + 0.08 + (height * 0.7) / 2, posZ);
			body.rotation.y = rotation;
			body.material = bodyMat;
			meshes.push(body);

			// Top section
			const top = MeshBuilder.CreateCylinder(
				`${id}_top`,
				{ height: height * 0.2, diameterTop: bodyRadius * 1.4, diameterBottom: bodyRadius * 2, tessellation: 6 },
				scene
			);
			top.position = new Vector3(posX, posY + 0.08 + height * 0.7 + (height * 0.2) / 2, posZ);
			top.rotation.y = rotation;
			top.material = bodyMat;
			meshes.push(top);

			// Heavy-duty operating wheel
			const wheel = MeshBuilder.CreateTorus(
				`${id}_wheel`,
				{ diameter: bodyRadius * 1.2, thickness: 0.02 },
				scene
			);
			wheel.position = new Vector3(posX, posY + height + 0.02, posZ);
			wheel.material = capMat;
			meshes.push(wheel);

			// Wheel spokes
			for (let i = 0; i < 4; i++) {
				const angle = (i * Math.PI) / 2;
				const spoke = MeshBuilder.CreateCylinder(
					`${id}_spoke_${i}`,
					{ height: bodyRadius * 1.2, diameter: 0.015 },
					scene
				);
				spoke.position = new Vector3(posX, posY + height + 0.02, posZ);
				spoke.rotation.z = Math.PI / 2;
				spoke.rotation.y = angle;
				spoke.material = capMat;
				meshes.push(spoke);
			}

			// Multiple outlets
			for (let i = 0; i < 4; i++) {
				const angle = (i * Math.PI) / 2 + rotation;
				const outletX = Math.cos(angle) * (bodyRadius + 0.04);
				const outletZ = Math.sin(angle) * (bodyRadius + 0.04);

				const outlet = MeshBuilder.CreateCylinder(
					`${id}_outlet_${i}`,
					{ height: 0.06, diameter: 0.06 },
					scene
				);
				outlet.position = new Vector3(
					posX + outletX,
					posY + height * 0.4 + (i % 2) * 0.15,
					posZ + outletZ
				);
				outlet.rotation.z = Math.PI / 2;
				outlet.rotation.y = angle;
				outlet.material = capMat;
				meshes.push(outlet);
			}
		}

		// Water flow effect when open
		if (isOpen && rng) {
			const waterMat = new PBRMaterial(`hydrant_water_${id}`, scene);
			waterMat.albedoColor = new Color3(0.4, 0.6, 0.9);
			waterMat.metallic = 0.1;
			waterMat.roughness = 0.2;
			waterMat.alpha = 0.7;

			// Water stream
			const streamLength = 0.8 + rng.next() * 0.4;
			const stream = MeshBuilder.CreateCylinder(
				`${id}_stream`,
				{ height: streamLength, diameterTop: 0.02, diameterBottom: 0.05 },
				scene
			);
			stream.position = new Vector3(
				posX + Math.cos(rotation) * (0.2 + streamLength / 2),
				posY + height * 0.35,
				posZ + Math.sin(rotation) * (0.2 + streamLength / 2)
			);
			stream.rotation.z = Math.PI / 2;
			stream.rotation.y = rotation;
			stream.material = waterMat;
			meshes.push(stream);

			// Splash puddle
			const puddle = MeshBuilder.CreateDisc(
				`${id}_puddle`,
				{ radius: 0.3 + rng.next() * 0.2 },
				scene
			);
			puddle.position = new Vector3(
				posX + Math.cos(rotation) * (0.4 + streamLength),
				posY + 0.01,
				posZ + Math.sin(rotation) * (0.4 + streamLength)
			);
			puddle.rotation.x = Math.PI / 2;
			puddle.material = waterMat;
			meshes.push(puddle);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			bodyMat.dispose();
			capMat.dispose();
			chainMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, height, isOpen, condition, rotation, seed]);

	return null;
}
