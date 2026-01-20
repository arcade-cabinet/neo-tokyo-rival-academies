/**
 * WaterTank - Rooftop/industrial water storage component
 *
 * Various water tank styles for buildings.
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

export type WaterTankType =
	| "wooden"
	| "metal"
	| "concrete"
	| "plastic"
	| "industrial";

export interface WaterTankProps {
	id: string;
	position: Vector3;
	/** Tank type */
	type?: WaterTankType;
	/** Tank diameter */
	diameter?: number;
	/** Tank height */
	height?: number;
	/** Has support structure */
	hasSupport?: boolean;
	/** Support height */
	supportHeight?: number;
	/** Rust/age 0-1 */
	age?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function WaterTank({
	id,
	position,
	type = "wooden",
	diameter = 2,
	height = 2.5,
	hasSupport = true,
	supportHeight = 2,
	age = 0.3,
	seed,
}: WaterTankProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const _rng = seed !== undefined ? createSeededRandom(seed) : null;

		const ageFactor = 1 - age * 0.3;
		const tankY = posY + (hasSupport ? supportHeight : 0);

		// Materials based on type
		const tankMat = new PBRMaterial(`watertank_body_${id}`, scene);
		const accentMat = new PBRMaterial(`watertank_accent_${id}`, scene);

		if (type === "wooden") {
			tankMat.albedoColor = new Color3(
				0.4 * ageFactor,
				0.32 * ageFactor,
				0.2 * ageFactor,
			);
			tankMat.metallic = 0;
			tankMat.roughness = 0.85;
			accentMat.albedoColor = new Color3(0.25, 0.25, 0.27);
			accentMat.metallic = 0.8;
			accentMat.roughness = 0.5;

			// Wooden staves (simplified as cylinder)
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: height, diameter: diameter },
				scene,
			);
			tank.position = new Vector3(posX, tankY + height / 2, posZ);
			tank.material = tankMat;
			meshes.push(tank);

			// Metal bands
			const bandCount = 4;
			for (let b = 0; b < bandCount; b++) {
				const bandY = tankY + (b + 0.5) * (height / (bandCount + 1));
				const band = MeshBuilder.CreateTorus(
					`${id}_band_${b}`,
					{ diameter: diameter * 1.02, thickness: 0.03 },
					scene,
				);
				band.position = new Vector3(posX, bandY, posZ);
				band.rotation.x = Math.PI / 2;
				band.material = accentMat;
				meshes.push(band);
			}

			// Conical roof
			const roof = MeshBuilder.CreateCylinder(
				`${id}_roof`,
				{
					height: diameter * 0.4,
					diameterTop: 0,
					diameterBottom: diameter * 1.1,
				},
				scene,
			);
			roof.position = new Vector3(posX, tankY + height + diameter * 0.2, posZ);
			roof.material = tankMat;
			meshes.push(roof);
		} else if (type === "metal") {
			tankMat.albedoColor = new Color3(
				0.5 * ageFactor + age * 0.2,
				0.52 * ageFactor + age * 0.1,
				0.55 * ageFactor,
			);
			tankMat.metallic = 0.85;
			tankMat.roughness = 0.35 + age * 0.3;

			// Main tank
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: height, diameter: diameter },
				scene,
			);
			tank.position = new Vector3(posX, tankY + height / 2, posZ);
			tank.material = tankMat;
			meshes.push(tank);

			// Dome top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: diameter, slice: 0.5 },
				scene,
			);
			dome.position = new Vector3(posX, tankY + height, posZ);
			dome.material = tankMat;
			meshes.push(dome);

			// Access hatch
			const hatch = MeshBuilder.CreateCylinder(
				`${id}_hatch`,
				{ height: 0.1, diameter: 0.5 },
				scene,
			);
			hatch.position = new Vector3(
				posX,
				tankY + height + diameter / 4 + 0.05,
				posZ,
			);
			hatch.material = accentMat;
			meshes.push(hatch);
		} else if (type === "concrete") {
			tankMat.albedoColor = new Color3(0.55, 0.53, 0.5).scale(ageFactor);
			tankMat.metallic = 0;
			tankMat.roughness = 0.9;

			// Rectangular concrete tank
			const tank = MeshBuilder.CreateBox(
				`${id}_tank`,
				{ width: diameter, height: height, depth: diameter },
				scene,
			);
			tank.position = new Vector3(posX, tankY + height / 2, posZ);
			tank.material = tankMat;
			meshes.push(tank);

			// Reinforcement columns
			for (const cx of [-1, 1]) {
				for (const cz of [-1, 1]) {
					const col = MeshBuilder.CreateBox(
						`${id}_col_${cx}_${cz}`,
						{ width: 0.15, height: height + 0.1, depth: 0.15 },
						scene,
					);
					col.position = new Vector3(
						posX + cx * (diameter / 2 - 0.075),
						tankY + height / 2,
						posZ + cz * (diameter / 2 - 0.075),
					);
					col.material = tankMat;
					meshes.push(col);
				}
			}

			// Flat roof
			const roof = MeshBuilder.CreateBox(
				`${id}_roof`,
				{ width: diameter + 0.1, height: 0.1, depth: diameter + 0.1 },
				scene,
			);
			roof.position = new Vector3(posX, tankY + height + 0.05, posZ);
			roof.material = tankMat;
			meshes.push(roof);
		} else if (type === "plastic") {
			tankMat.albedoColor = new Color3(0.15, 0.15, 0.17).scale(ageFactor);
			tankMat.metallic = 0.1;
			tankMat.roughness = 0.6;

			// Rounded plastic tank
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: height, diameter: diameter },
				scene,
			);
			tank.position = new Vector3(posX, tankY + height / 2, posZ);
			tank.material = tankMat;
			meshes.push(tank);

			// Dome top
			const dome = MeshBuilder.CreateSphere(
				`${id}_dome`,
				{ diameter: diameter * 0.95, slice: 0.5 },
				scene,
			);
			dome.position = new Vector3(posX, tankY + height, posZ);
			dome.material = tankMat;
			meshes.push(dome);

			// Fill cap
			const capMat = new PBRMaterial(`watertank_cap_${id}`, scene);
			capMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			capMat.metallic = 0.2;
			capMat.roughness = 0.5;

			const cap = MeshBuilder.CreateCylinder(
				`${id}_cap`,
				{ height: 0.08, diameter: 0.25 },
				scene,
			);
			cap.position = new Vector3(
				posX + diameter * 0.2,
				tankY + height + diameter * 0.35,
				posZ,
			);
			cap.material = capMat;
			meshes.push(cap);
		} else if (type === "industrial") {
			tankMat.albedoColor = new Color3(
				0.6 * ageFactor,
				0.62 * ageFactor,
				0.65 * ageFactor,
			);
			tankMat.metallic = 0.9;
			tankMat.roughness = 0.25 + age * 0.25;

			// Large horizontal cylinder
			const tank = MeshBuilder.CreateCylinder(
				`${id}_tank`,
				{ height: diameter * 2, diameter: diameter },
				scene,
			);
			tank.position = new Vector3(posX, tankY + diameter / 2, posZ);
			tank.rotation.z = Math.PI / 2;
			tank.material = tankMat;
			meshes.push(tank);

			// End caps
			for (const side of [-1, 1]) {
				const cap = MeshBuilder.CreateSphere(
					`${id}_cap_${side}`,
					{ diameter: diameter, slice: 0.5 },
					scene,
				);
				cap.position = new Vector3(
					posX + side * diameter,
					tankY + diameter / 2,
					posZ,
				);
				cap.rotation.z = (side * Math.PI) / 2;
				cap.material = tankMat;
				meshes.push(cap);
			}

			// Saddle supports
			const saddleMat = new PBRMaterial(`watertank_saddle_${id}`, scene);
			saddleMat.albedoColor = new Color3(0.5, 0.5, 0.52);
			saddleMat.metallic = 0.7;
			saddleMat.roughness = 0.5;

			for (const side of [-1, 1]) {
				const saddle = MeshBuilder.CreateBox(
					`${id}_saddle_${side}`,
					{ width: 0.3, height: diameter / 2, depth: diameter * 0.6 },
					scene,
				);
				saddle.position = new Vector3(
					posX + side * diameter * 0.6,
					tankY + diameter / 4,
					posZ,
				);
				saddle.material = saddleMat;
				meshes.push(saddle);
			}

			// Pressure gauge
			const gauge = MeshBuilder.CreateCylinder(
				`${id}_gauge`,
				{ height: 0.05, diameter: 0.15 },
				scene,
			);
			gauge.position = new Vector3(posX, tankY + diameter + 0.03, posZ);
			gauge.material = accentMat;
			meshes.push(gauge);
		}

		// Support structure
		if (hasSupport && type !== "industrial") {
			const supportMat = new PBRMaterial(`watertank_support_${id}`, scene);
			supportMat.albedoColor = new Color3(0.35, 0.35, 0.38).scale(ageFactor);
			supportMat.metallic = 0.8;
			supportMat.roughness = 0.45;

			// Legs
			const legCount = type === "concrete" ? 4 : 6;
			const legRadius = diameter / 2 - 0.1;

			for (let l = 0; l < legCount; l++) {
				const angle = (l / legCount) * Math.PI * 2;
				const leg = MeshBuilder.CreateCylinder(
					`${id}_leg_${l}`,
					{ height: supportHeight, diameter: 0.08 },
					scene,
				);
				leg.position = new Vector3(
					posX + Math.cos(angle) * legRadius,
					posY + supportHeight / 2,
					posZ + Math.sin(angle) * legRadius,
				);
				leg.material = supportMat;
				meshes.push(leg);

				// Cross braces
				if (l % 2 === 0 && legCount > 4) {
					const nextAngle = (((l + 1) % legCount) / legCount) * Math.PI * 2;
					const braceLength = Math.sqrt(
						2 * legRadius ** 2 * (1 - Math.cos((2 * Math.PI) / legCount)),
					);

					const brace = MeshBuilder.CreateCylinder(
						`${id}_brace_${l}`,
						{ height: braceLength, diameter: 0.04 },
						scene,
					);
					brace.position = new Vector3(
						posX + Math.cos((angle + nextAngle) / 2) * legRadius * 0.9,
						posY + supportHeight * 0.3,
						posZ + Math.sin((angle + nextAngle) / 2) * legRadius * 0.9,
					);
					brace.rotation.y = angle + Math.PI / legCount;
					brace.rotation.z = Math.PI / 2;
					brace.material = supportMat;
					meshes.push(brace);
				}
			}

			// Top platform
			const platform = MeshBuilder.CreateCylinder(
				`${id}_platform`,
				{ height: 0.1, diameter: diameter + 0.2 },
				scene,
			);
			platform.position = new Vector3(posX, tankY - 0.05, posZ);
			platform.material = supportMat;
			meshes.push(platform);
		}

		// Pipes
		const pipeMat = new PBRMaterial(`watertank_pipe_${id}`, scene);
		pipeMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(ageFactor);
		pipeMat.metallic = 0.85;
		pipeMat.roughness = 0.4;

		// Outlet pipe
		const outletPipe = MeshBuilder.CreateCylinder(
			`${id}_outlet`,
			{ height: hasSupport ? supportHeight + 0.5 : 0.5, diameter: 0.08 },
			scene,
		);
		outletPipe.position = new Vector3(
			posX + diameter / 2 - 0.1,
			posY + (hasSupport ? supportHeight / 2 : 0.25),
			posZ,
		);
		outletPipe.material = pipeMat;
		meshes.push(outletPipe);

		// Inlet pipe
		const inletPipe = MeshBuilder.CreateCylinder(
			`${id}_inlet`,
			{ height: 0.4, diameter: 0.06 },
			scene,
		);
		inletPipe.position = new Vector3(
			posX - diameter / 2 + 0.1,
			tankY + height * 0.8,
			posZ,
		);
		inletPipe.rotation.z = Math.PI / 2;
		inletPipe.material = pipeMat;
		meshes.push(inletPipe);

		// Overflow pipe
		const overflow = MeshBuilder.CreateCylinder(
			`${id}_overflow`,
			{ height: 0.3, diameter: 0.05 },
			scene,
		);
		overflow.position = new Vector3(
			posX,
			tankY + height * 0.95,
			posZ + diameter / 2 - 0.1,
		);
		overflow.rotation.x = Math.PI / 2;
		overflow.material = pipeMat;
		meshes.push(overflow);

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			tankMat.dispose();
			accentMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		diameter,
		height,
		hasSupport,
		supportHeight,
		age,
		seed,
	]);

	return null;
}
