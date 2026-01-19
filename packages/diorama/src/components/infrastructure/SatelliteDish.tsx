/**
 * SatelliteDish - Satellite dishes and receivers component
 *
 * Various satellite dish types for buildings in Neo-Tokyo.
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

export type SatelliteDishType = "small" | "medium" | "large" | "commercial";
export type ConditionType = "pristine" | "weathered" | "rusted" | "damaged";

export interface SatelliteDishProps {
	id: string;
	position: Vector3;
	/** Dish size/type */
	type?: SatelliteDishType;
	/** Dish diameter in meters */
	diameter?: number;
	/** Elevation angle in degrees (0-90) */
	elevation?: number;
	/** Azimuth angle in degrees (compass direction) */
	azimuth?: number;
	/** Is broken/non-functional */
	isBroken?: boolean;
	/** Physical condition */
	condition?: ConditionType;
	/** Base rotation offset (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const DISH_SIZES: Record<
	SatelliteDishType,
	{ diameter: number; focalLength: number; feedSize: number }
> = {
	small: { diameter: 0.45, focalLength: 0.25, feedSize: 0.04 },
	medium: { diameter: 0.75, focalLength: 0.4, feedSize: 0.05 },
	large: { diameter: 1.2, focalLength: 0.6, feedSize: 0.07 },
	commercial: { diameter: 2.4, focalLength: 1.2, feedSize: 0.12 },
};

const CONDITION_FACTORS: Record<
	ConditionType,
	{ rust: number; roughness: number; albedo: number }
> = {
	pristine: { rust: 0, roughness: 0.25, albedo: 1 },
	weathered: { rust: 0.15, roughness: 0.4, albedo: 0.9 },
	rusted: { rust: 0.45, roughness: 0.6, albedo: 0.75 },
	damaged: { rust: 0.7, roughness: 0.75, albedo: 0.6 },
};

export function SatelliteDish({
	id,
	position,
	type = "medium",
	diameter,
	elevation = 35,
	azimuth = 180,
	isBroken = false,
	condition = "weathered",
	rotation = 0,
	seed,
}: SatelliteDishProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: PBRMaterial[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const sizeSpec = DISH_SIZES[type];
		const actualDiameter = diameter ?? sizeSpec.diameter;
		const focalLength =
			sizeSpec.focalLength * (actualDiameter / sizeSpec.diameter);
		const feedSize = sizeSpec.feedSize * (actualDiameter / sizeSpec.diameter);

		const conditionFactor = CONDITION_FACTORS[condition];
		const rustVariation = rng ? rng.next() * 0.1 : 0.05;

		// Convert angles to radians
		const elevationRad = (elevation * Math.PI) / 180;
		const azimuthRad = (azimuth * Math.PI) / 180 + rotation;

		// Broken dish has misaligned angles
		const brokenElevation =
			isBroken && rng ? elevationRad + (rng.next() - 0.5) * 0.5 : elevationRad;
		const brokenAzimuth =
			isBroken && rng ? azimuthRad + (rng.next() - 0.5) * 0.3 : azimuthRad;

		// Dish material
		const dishMat = new PBRMaterial(`dish_mat_${id}`, scene);
		const rust = conditionFactor.rust + rustVariation;
		dishMat.albedoColor = new Color3(
			0.85 * conditionFactor.albedo - rust * 0.1,
			0.85 * conditionFactor.albedo - rust * 0.15,
			0.88 * conditionFactor.albedo - rust * 0.2,
		);
		dishMat.metallic = 0.3;
		dishMat.roughness = conditionFactor.roughness;
		materials.push(dishMat);

		// Mount material
		const mountMat = new PBRMaterial(`mount_mat_${id}`, scene);
		mountMat.albedoColor = new Color3(
			0.4 - rust * 0.05 + rust * 0.15,
			0.4 - rust * 0.15,
			0.42 - rust * 0.2,
		);
		mountMat.metallic = 0.85 - rust * 0.2;
		mountMat.roughness = conditionFactor.roughness + 0.1;
		materials.push(mountMat);

		// LNB/Feed material
		const feedMat = new PBRMaterial(`feed_mat_${id}`, scene);
		feedMat.albedoColor = new Color3(0.15, 0.15, 0.17);
		feedMat.metallic = 0.2;
		feedMat.roughness = 0.6;
		materials.push(feedMat);

		// Calculate dish center position based on mount configuration
		let mountHeight: number;
		let dishCenterY: number;
		let dishCenterOffset: number;

		if (type === "commercial") {
			// Large commercial dish with heavy-duty mount
			mountHeight = 0.8;
			dishCenterY = posY + mountHeight + actualDiameter * 0.3;
			dishCenterOffset = actualDiameter * 0.1;

			// Heavy base plate
			const basePlate = MeshBuilder.CreateCylinder(
				`${id}_baseplate`,
				{ height: 0.04, diameter: 0.6, tessellation: 24 },
				scene,
			);
			basePlate.position = new Vector3(posX, posY + 0.02, posZ);
			basePlate.material = mountMat;
			meshes.push(basePlate);

			// Anchor bolts
			for (let i = 0; i < 6; i++) {
				const boltAngle = (i / 6) * Math.PI * 2;
				const bolt = MeshBuilder.CreateCylinder(
					`${id}_bolt_${i}`,
					{ height: 0.03, diameter: 0.025 },
					scene,
				);
				bolt.position = new Vector3(
					posX + Math.cos(boltAngle) * 0.22,
					posY + 0.055,
					posZ + Math.sin(boltAngle) * 0.22,
				);
				bolt.material = mountMat;
				meshes.push(bolt);
			}

			// Main pedestal
			const pedestal = MeshBuilder.CreateCylinder(
				`${id}_pedestal`,
				{ height: mountHeight * 0.7, diameter: 0.12 },
				scene,
			);
			pedestal.position = new Vector3(
				posX,
				posY + 0.04 + mountHeight * 0.35,
				posZ,
			);
			pedestal.material = mountMat;
			meshes.push(pedestal);

			// Elevation pivot housing
			const pivotHousing = MeshBuilder.CreateBox(
				`${id}_pivot_housing`,
				{ width: 0.2, height: 0.15, depth: 0.25 },
				scene,
			);
			pivotHousing.position = new Vector3(
				posX,
				posY + 0.04 + mountHeight * 0.7 + 0.075,
				posZ,
			);
			pivotHousing.rotation.y = brokenAzimuth;
			pivotHousing.material = mountMat;
			meshes.push(pivotHousing);

			// Elevation arm
			const elevationArm = MeshBuilder.CreateBox(
				`${id}_elevation_arm`,
				{ width: 0.08, height: actualDiameter * 0.5, depth: 0.08 },
				scene,
			);
			elevationArm.position = new Vector3(
				posX + Math.sin(brokenAzimuth) * 0.15,
				posY + mountHeight + 0.1,
				posZ + Math.cos(brokenAzimuth) * 0.15,
			);
			elevationArm.rotation.y = brokenAzimuth;
			elevationArm.rotation.x = brokenElevation - Math.PI / 2;
			elevationArm.material = mountMat;
			meshes.push(elevationArm);

			// Actuator motor
			const actuator = MeshBuilder.CreateCylinder(
				`${id}_actuator`,
				{ height: 0.35, diameter: 0.06 },
				scene,
			);
			actuator.position = new Vector3(
				posX - Math.sin(brokenAzimuth) * 0.08,
				posY + mountHeight * 0.6,
				posZ - Math.cos(brokenAzimuth) * 0.08,
			);
			actuator.rotation.z = Math.PI / 4;
			actuator.rotation.y = brokenAzimuth;
			actuator.material = mountMat;
			meshes.push(actuator);
		} else {
			// Standard residential/small commercial mount
			mountHeight = type === "large" ? 0.5 : type === "medium" ? 0.35 : 0.25;
			dishCenterY = posY + mountHeight + actualDiameter * 0.25;
			dishCenterOffset = actualDiameter * 0.08;

			// Wall/roof mount bracket
			const bracket = MeshBuilder.CreateBox(
				`${id}_bracket`,
				{ width: 0.12, height: 0.08, depth: 0.15 },
				scene,
			);
			bracket.position = new Vector3(posX, posY + 0.04, posZ);
			bracket.rotation.y = rotation;
			bracket.material = mountMat;
			meshes.push(bracket);

			// Main mast
			const mast = MeshBuilder.CreateCylinder(
				`${id}_mast`,
				{ height: mountHeight, diameter: 0.04 },
				scene,
			);
			mast.position = new Vector3(posX, posY + 0.08 + mountHeight / 2, posZ);
			mast.material = mountMat;
			meshes.push(mast);

			// Mast clamp
			const clamp = MeshBuilder.CreateTorus(
				`${id}_clamp`,
				{ diameter: 0.06, thickness: 0.015, tessellation: 16 },
				scene,
			);
			clamp.position = new Vector3(posX, posY + 0.08 + mountHeight * 0.9, posZ);
			clamp.rotation.x = Math.PI / 2;
			clamp.material = mountMat;
			meshes.push(clamp);

			// Elevation/azimuth adjustment collar
			const collar = MeshBuilder.CreateCylinder(
				`${id}_collar`,
				{ height: 0.06, diameter: 0.08 },
				scene,
			);
			collar.position = new Vector3(
				posX,
				posY + 0.08 + mountHeight + 0.03,
				posZ,
			);
			collar.rotation.y = brokenAzimuth;
			collar.material = mountMat;
			meshes.push(collar);

			// Dish arm
			const armLength = actualDiameter * 0.35;
			const arm = MeshBuilder.CreateCylinder(
				`${id}_arm`,
				{ height: armLength, diameter: 0.025 },
				scene,
			);
			arm.position = new Vector3(
				posX +
					Math.sin(brokenAzimuth) * armLength * 0.4 * Math.cos(brokenElevation),
				posY + mountHeight + 0.06 + armLength * 0.4 * Math.sin(brokenElevation),
				posZ +
					Math.cos(brokenAzimuth) * armLength * 0.4 * Math.cos(brokenElevation),
			);
			arm.rotation.y = brokenAzimuth;
			arm.rotation.z = Math.PI / 2 - brokenElevation;
			arm.material = mountMat;
			meshes.push(arm);
		}

		// Dish reflector (parabolic approximated as hemisphere slice)
		const dishDepth = actualDiameter * 0.12;
		const dish = MeshBuilder.CreateSphere(
			`${id}_dish`,
			{
				diameter: actualDiameter,
				segments: type === "commercial" ? 32 : 24,
				slice: 0.15,
			},
			scene,
		);

		const dishDistFromMount = focalLength * 0.5;
		dish.position = new Vector3(
			posX +
				Math.sin(brokenAzimuth) * dishDistFromMount * Math.cos(brokenElevation),
			dishCenterY + dishDistFromMount * Math.sin(brokenElevation),
			posZ +
				Math.cos(brokenAzimuth) * dishDistFromMount * Math.cos(brokenElevation),
		);
		dish.rotation.y = brokenAzimuth + Math.PI;
		dish.rotation.x = Math.PI / 2 + brokenElevation;
		dish.material = dishMat;
		meshes.push(dish);

		// Dish edge rim
		const rim = MeshBuilder.CreateTorus(
			`${id}_rim`,
			{
				diameter: actualDiameter,
				thickness: 0.015,
				tessellation: type === "commercial" ? 48 : 32,
			},
			scene,
		);
		rim.position = dish.position.clone();
		rim.rotation.y = brokenAzimuth;
		rim.rotation.x = brokenElevation;
		rim.material = mountMat;
		meshes.push(rim);

		// Feed horn support arm(s)
		const feedDistance = focalLength * 0.9;
		const feedX =
			posX +
			Math.sin(brokenAzimuth) *
				(dishDistFromMount + feedDistance) *
				Math.cos(brokenElevation);
		const feedY =
			dishCenterY +
			(dishDistFromMount + feedDistance) * Math.sin(brokenElevation);
		const feedZ =
			posZ +
			Math.cos(brokenAzimuth) *
				(dishDistFromMount + feedDistance) *
				Math.cos(brokenElevation);

		if (type === "commercial") {
			// Multiple support struts for commercial
			for (let i = 0; i < 4; i++) {
				const strutAngle = (i / 4) * Math.PI * 2 + brokenAzimuth;
				const strutStart = new Vector3(
					dish.position.x + Math.cos(strutAngle) * (actualDiameter * 0.4),
					dish.position.y +
						Math.sin(i % 2 === 0 ? 0.1 : -0.1) * actualDiameter * 0.1,
					dish.position.z + Math.sin(strutAngle) * (actualDiameter * 0.4),
				);

				const strutLength = Vector3.Distance(
					strutStart,
					new Vector3(feedX, feedY, feedZ),
				);
				const strut = MeshBuilder.CreateCylinder(
					`${id}_strut_${i}`,
					{ height: strutLength, diameter: 0.025 },
					scene,
				);

				// Position at midpoint
				strut.position = new Vector3(
					(strutStart.x + feedX) / 2,
					(strutStart.y + feedY) / 2,
					(strutStart.z + feedZ) / 2,
				);

				// Calculate rotation to point from start to feed
				const direction = new Vector3(
					feedX - strutStart.x,
					feedY - strutStart.y,
					feedZ - strutStart.z,
				).normalize();
				strut.rotation.x = Math.acos(direction.y);
				strut.rotation.y = Math.atan2(direction.x, direction.z);
				strut.material = mountMat;
				meshes.push(strut);
			}
		} else {
			// Single or dual arm for smaller dishes
			const armCount = type === "large" ? 2 : 1;
			for (let i = 0; i < armCount; i++) {
				const armAngle = brokenAzimuth + (i === 0 ? Math.PI / 6 : -Math.PI / 6);
				const armStart = new Vector3(
					dish.position.x +
						Math.cos(armAngle) *
							(actualDiameter * 0.35) *
							Math.cos(brokenElevation),
					dish.position.y,
					dish.position.z +
						Math.sin(armAngle) *
							(actualDiameter * 0.35) *
							Math.cos(brokenElevation),
				);

				const feedArmLength = Vector3.Distance(
					armStart,
					new Vector3(feedX, feedY, feedZ),
				);
				const feedArm = MeshBuilder.CreateCylinder(
					`${id}_feedarm_${i}`,
					{ height: feedArmLength, diameter: 0.015 },
					scene,
				);

				feedArm.position = new Vector3(
					(armStart.x + feedX) / 2,
					(armStart.y + feedY) / 2,
					(armStart.z + feedZ) / 2,
				);

				const armDir = new Vector3(
					feedX - armStart.x,
					feedY - armStart.y,
					feedZ - armStart.z,
				).normalize();
				feedArm.rotation.x = Math.acos(armDir.y);
				feedArm.rotation.y = Math.atan2(armDir.x, armDir.z);
				feedArm.material = mountMat;
				meshes.push(feedArm);
			}
		}

		// LNB/Feed horn
		const lnb = MeshBuilder.CreateCylinder(
			`${id}_lnb`,
			{
				height: feedSize * 2.5,
				diameterTop: feedSize * 0.6,
				diameterBottom: feedSize,
				tessellation: 16,
			},
			scene,
		);
		lnb.position = new Vector3(feedX, feedY, feedZ);
		lnb.rotation.y = brokenAzimuth + Math.PI;
		lnb.rotation.x = brokenElevation;
		lnb.material = feedMat;
		meshes.push(lnb);

		// LNB housing/electronics
		const lnbHousing = MeshBuilder.CreateBox(
			`${id}_lnb_housing`,
			{ width: feedSize * 1.2, height: feedSize * 0.8, depth: feedSize * 2 },
			scene,
		);
		lnbHousing.position = new Vector3(
			feedX +
				Math.sin(brokenAzimuth) * feedSize * 1.5 * Math.cos(brokenElevation),
			feedY + feedSize * 1.5 * Math.sin(brokenElevation),
			feedZ +
				Math.cos(brokenAzimuth) * feedSize * 1.5 * Math.cos(brokenElevation),
		);
		lnbHousing.rotation.y = brokenAzimuth;
		lnbHousing.material = feedMat;
		meshes.push(lnbHousing);

		// Coax cable connection
		const cable = MeshBuilder.CreateCylinder(
			`${id}_cable`,
			{ height: mountHeight * 0.8, diameter: 0.012 },
			scene,
		);
		cable.position = new Vector3(
			posX + Math.sin(brokenAzimuth + Math.PI / 4) * 0.05,
			posY + mountHeight * 0.4,
			posZ + Math.cos(brokenAzimuth + Math.PI / 4) * 0.05,
		);
		cable.material = feedMat;
		meshes.push(cable);

		// Grounding wire (commercial)
		if (type === "commercial" || type === "large") {
			const groundWire = MeshBuilder.CreateCylinder(
				`${id}_ground`,
				{ height: mountHeight + 0.2, diameter: 0.006 },
				scene,
			);
			groundWire.position = new Vector3(
				posX - Math.sin(rotation) * 0.08,
				posY + (mountHeight + 0.2) / 2,
				posZ - Math.cos(rotation) * 0.08,
			);
			groundWire.material = mountMat;
			meshes.push(groundWire);
		}

		// Brand label (pristine/weathered only)
		if (condition === "pristine" || condition === "weathered") {
			const labelMat = new PBRMaterial(`label_mat_${id}`, scene);
			const labelColors = [
				new Color3(0.8, 0.1, 0.1), // Red
				new Color3(0.1, 0.3, 0.7), // Blue
				new Color3(0.2, 0.5, 0.2), // Green
			];
			labelMat.albedoColor = rng ? rng.pick(labelColors) : labelColors[0];
			labelMat.metallic = 0.1;
			labelMat.roughness = 0.5;
			labelMat.alpha = condition === "weathered" ? 0.7 : 0.9;
			materials.push(labelMat);

			const label = MeshBuilder.CreateBox(
				`${id}_label`,
				{
					width: actualDiameter * 0.15,
					height: actualDiameter * 0.05,
					depth: 0.003,
				},
				scene,
			);
			label.position = new Vector3(
				dish.position.x -
					Math.sin(brokenAzimuth) *
						(actualDiameter * 0.3) *
						Math.cos(brokenElevation - 0.2),
				dish.position.y - actualDiameter * 0.15,
				dish.position.z -
					Math.cos(brokenAzimuth) *
						(actualDiameter * 0.3) *
						Math.cos(brokenElevation - 0.2),
			);
			label.rotation.y = brokenAzimuth + Math.PI;
			label.rotation.x = brokenElevation - 0.2;
			label.material = labelMat;
			meshes.push(label);
		}

		// Damage effects
		if (isBroken && rng) {
			// Bent/broken feed arm
			if (rng.next() < 0.5) {
				const brokenArm = MeshBuilder.CreateCylinder(
					`${id}_broken_arm`,
					{ height: focalLength * 0.3, diameter: 0.012 },
					scene,
				);
				brokenArm.position = new Vector3(
					feedX + (rng.next() - 0.5) * 0.1,
					feedY - focalLength * 0.2,
					feedZ + (rng.next() - 0.5) * 0.1,
				);
				brokenArm.rotation.x = (rng.next() * Math.PI) / 3;
				brokenArm.rotation.z = (rng.next() * Math.PI) / 4;
				brokenArm.material = mountMat;
				meshes.push(brokenArm);
			}

			// Dents in dish
			const dentMat = new PBRMaterial(`dent_mat_${id}`, scene);
			dentMat.albedoColor = dishMat.albedoColor.scale(0.85);
			dentMat.metallic = 0.25;
			dentMat.roughness = conditionFactor.roughness + 0.15;
			materials.push(dentMat);

			const dentCount = 2 + Math.floor(rng.next() * 3);
			for (let i = 0; i < dentCount; i++) {
				const dentAngle = rng.next() * Math.PI * 2;
				const dentDist = rng.next() * actualDiameter * 0.35;

				const dent = MeshBuilder.CreateSphere(
					`${id}_dent_${i}`,
					{ diameter: 0.05 + rng.next() * 0.08, segments: 8 },
					scene,
				);
				dent.position = new Vector3(
					dish.position.x + Math.cos(dentAngle) * dentDist,
					dish.position.y + (rng.next() - 0.5) * 0.05,
					dish.position.z + Math.sin(dentAngle) * dentDist,
				);
				dent.material = dentMat;
				meshes.push(dent);
			}

			// Rust streaks on damaged dishes
			const streakMat = new PBRMaterial(`streak_mat_${id}`, scene);
			streakMat.albedoColor = new Color3(0.5, 0.3, 0.15);
			streakMat.metallic = 0.2;
			streakMat.roughness = 0.85;
			streakMat.alpha = 0.6;
			materials.push(streakMat);

			for (let i = 0; i < 3; i++) {
				const streakAngle = rng.next() * Math.PI * 2;
				const streak = MeshBuilder.CreateBox(
					`${id}_streak_${i}`,
					{
						width: 0.02 + rng.next() * 0.03,
						height: actualDiameter * (0.1 + rng.next() * 0.15),
						depth: 0.003,
					},
					scene,
				);
				streak.position = new Vector3(
					dish.position.x + Math.cos(streakAngle) * actualDiameter * 0.25,
					dish.position.y - actualDiameter * 0.1,
					dish.position.z + Math.sin(streakAngle) * actualDiameter * 0.25,
				);
				streak.rotation.y = streakAngle;
				streak.material = streakMat;
				meshes.push(streak);
			}
		}

		// Bird droppings on weathered/old dishes
		if (
			(condition === "rusted" || condition === "damaged") &&
			rng &&
			rng.next() < 0.6
		) {
			const droppingMat = new PBRMaterial(`dropping_mat_${id}`, scene);
			droppingMat.albedoColor = new Color3(0.9, 0.9, 0.88);
			droppingMat.metallic = 0;
			droppingMat.roughness = 0.9;
			materials.push(droppingMat);

			const droppingCount = 2 + Math.floor(rng.next() * 4);
			for (let i = 0; i < droppingCount; i++) {
				const dropAngle = rng.next() * Math.PI * 2;
				const dropDist = rng.next() * actualDiameter * 0.4;

				const dropping = MeshBuilder.CreateDisc(
					`${id}_dropping_${i}`,
					{ radius: 0.01 + rng.next() * 0.02, tessellation: 6 },
					scene,
				);
				dropping.position = new Vector3(
					dish.position.x + Math.cos(dropAngle) * dropDist,
					dish.position.y + 0.01,
					dish.position.z + Math.sin(dropAngle) * dropDist,
				);
				dropping.rotation.x = Math.PI / 2 + brokenElevation;
				dropping.rotation.y = rng.next() * Math.PI;
				dropping.material = droppingMat;
				meshes.push(dropping);
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
		diameter,
		elevation,
		azimuth,
		isBroken,
		condition,
		rotation,
		seed,
	]);

	return null;
}
