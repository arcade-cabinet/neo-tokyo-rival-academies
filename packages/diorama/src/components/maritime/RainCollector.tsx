/**
 * RainCollector - Rain collection containers component
 *
 * Various rain collection containers for post-flood urban environments.
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

export type RainCollectorType = "barrel" | "tank" | "bucket" | "tarp";
export type RainCollectorCondition = "new" | "used" | "weathered" | "damaged";

export interface RainCollectorProps {
	id: string;
	position: Vector3;
	/** Y-axis rotation in radians */
	rotation?: number;
	/** Collector type */
	type?: RainCollectorType;
	/** Condition of the collector */
	condition?: RainCollectorCondition;
	/** Capacity (affects size) */
	capacity?: number;
	/** Fill level 0-1 */
	fillLevel?: number;
	/** Whether it has a spout/tap */
	hasSpout?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

export function RainCollector({
	id,
	position,
	rotation = 0,
	type = "barrel",
	condition = "used",
	capacity = 1,
	fillLevel = 0.6,
	hasSpout = true,
	seed,
}: RainCollectorProps) {
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

		// Condition affects appearance
		const ageFactor =
			condition === "new"
				? 1.0
				: condition === "used"
					? 0.85
					: condition === "weathered"
						? 0.7
						: 0.55; // damaged

		// Water material for fill
		const waterMat = new PBRMaterial(`collector_water_${id}`, scene);
		waterMat.albedoColor = new Color3(0.3, 0.4, 0.5);
		waterMat.metallic = 0.1;
		waterMat.roughness = 0.05;
		waterMat.alpha = 0.85;
		materials.push(waterMat);

		// Metal accent material
		const metalMat = new PBRMaterial(`collector_metal_${id}`, scene);
		metalMat.albedoColor = new Color3(
			0.4 * ageFactor,
			0.42 * ageFactor,
			0.45 * ageFactor,
		);
		metalMat.metallic = 0.8;
		metalMat.roughness = 0.4 + (1 - ageFactor) * 0.3;
		materials.push(metalMat);

		const scale = Math.sqrt(capacity);

		if (type === "barrel") {
			const barrelMat = new PBRMaterial(`collector_barrel_${id}`, scene);
			barrelMat.albedoColor = new Color3(
				0.15 * ageFactor,
				0.2 * ageFactor,
				0.5 * ageFactor,
			);
			barrelMat.metallic = 0.1;
			barrelMat.roughness = 0.6;
			materials.push(barrelMat);

			const barrelHeight = 0.9 * scale;
			const barrelDiameter = 0.55 * scale;

			// Main barrel body
			const barrel = MeshBuilder.CreateCylinder(
				`${id}_barrel`,
				{
					height: barrelHeight,
					diameterTop: barrelDiameter * 0.95,
					diameterBottom: barrelDiameter,
					tessellation: 24,
				},
				scene,
			);
			barrel.position = new Vector3(posX, posY + barrelHeight / 2, posZ);
			barrel.rotation.y = rotation;
			barrel.material = barrelMat;
			meshes.push(barrel);

			// Barrel ribs
			const ribCount = 4;
			for (let r = 0; r < ribCount; r++) {
				const ribY = posY + (r + 1) * (barrelHeight / (ribCount + 1));
				const rib = MeshBuilder.CreateTorus(
					`${id}_rib_${r}`,
					{
						diameter: barrelDiameter * 1.01,
						thickness: 0.015,
						tessellation: 24,
					},
					scene,
				);
				rib.position = new Vector3(posX, ribY, posZ);
				rib.rotation.x = Math.PI / 2;
				rib.material = barrelMat;
				meshes.push(rib);
			}

			// Top rim
			const rim = MeshBuilder.CreateTorus(
				`${id}_rim`,
				{
					diameter: barrelDiameter * 0.95,
					thickness: 0.025,
					tessellation: 24,
				},
				scene,
			);
			rim.position = new Vector3(posX, posY + barrelHeight, posZ);
			rim.rotation.x = Math.PI / 2;
			rim.material = metalMat;
			meshes.push(rim);

			// Water inside
			if (fillLevel > 0) {
				const waterHeight = barrelHeight * fillLevel * 0.9;
				const water = MeshBuilder.CreateCylinder(
					`${id}_water`,
					{
						height: waterHeight,
						diameter: barrelDiameter * 0.9,
					},
					scene,
				);
				water.position = new Vector3(posX, posY + waterHeight / 2 + 0.03, posZ);
				water.material = waterMat;
				meshes.push(water);
			}

			// Spout
			if (hasSpout) {
				const spout = MeshBuilder.CreateCylinder(
					`${id}_spout`,
					{ height: 0.08, diameter: 0.03 },
					scene,
				);
				spout.position = new Vector3(
					posX + barrelDiameter / 2 + 0.02,
					posY + barrelHeight * 0.15,
					posZ,
				);
				spout.rotation.z = Math.PI / 2;
				spout.rotation.y = rotation;
				spout.material = metalMat;
				meshes.push(spout);

				// Tap handle
				const tapHandle = MeshBuilder.CreateBox(
					`${id}_tap`,
					{ width: 0.04, height: 0.02, depth: 0.01 },
					scene,
				);
				tapHandle.position = new Vector3(
					posX + barrelDiameter / 2 + 0.06,
					posY + barrelHeight * 0.15 + 0.02,
					posZ,
				);
				tapHandle.rotation.y = rotation;
				tapHandle.material = metalMat;
				meshes.push(tapHandle);
			}
		} else if (type === "tank") {
			const tankMat = new PBRMaterial(`collector_tank_${id}`, scene);
			tankMat.albedoColor = new Color3(
				0.2 * ageFactor,
				0.22 * ageFactor,
				0.25 * ageFactor,
			);
			tankMat.metallic = 0.85;
			tankMat.roughness = 0.35 + (1 - ageFactor) * 0.3;
			materials.push(tankMat);

			const tankHeight = 1.2 * scale;
			const tankWidth = 0.8 * scale;
			const tankDepth = 0.6 * scale;

			// Rectangular tank body
			const tank = MeshBuilder.CreateBox(
				`${id}_tank`,
				{
					width: tankWidth,
					height: tankHeight,
					depth: tankDepth,
				},
				scene,
			);
			tank.position = new Vector3(posX, posY + tankHeight / 2, posZ);
			tank.rotation.y = rotation;
			tank.material = tankMat;
			meshes.push(tank);

			// Reinforcement ribs on sides
			for (let side = 0; side < 2; side++) {
				const ribX = (side === 0 ? 1 : -1) * (tankWidth / 2 + 0.01);
				for (let r = 0; r < 3; r++) {
					const rib = MeshBuilder.CreateBox(
						`${id}_siderib_${side}_${r}`,
						{
							width: 0.02,
							height: tankHeight * 0.9,
							depth: 0.02,
						},
						scene,
					);
					const ribOffset = (r - 1) * tankDepth * 0.35;
					rib.position = new Vector3(
						posX + ribX * Math.cos(rotation) - ribOffset * Math.sin(rotation),
						posY + tankHeight / 2,
						posZ + ribX * Math.sin(rotation) + ribOffset * Math.cos(rotation),
					);
					rib.rotation.y = rotation;
					rib.material = tankMat;
					meshes.push(rib);
				}
			}

			// Top lid
			const lid = MeshBuilder.CreateBox(
				`${id}_lid`,
				{
					width: tankWidth * 0.3,
					height: 0.03,
					depth: tankDepth * 0.3,
				},
				scene,
			);
			lid.position = new Vector3(posX, posY + tankHeight + 0.015, posZ);
			lid.rotation.y = rotation;
			lid.material = metalMat;
			meshes.push(lid);

			// Lid handle
			const lidHandle = MeshBuilder.CreateBox(
				`${id}_lidhandle`,
				{ width: 0.06, height: 0.02, depth: 0.02 },
				scene,
			);
			lidHandle.position = new Vector3(posX, posY + tankHeight + 0.04, posZ);
			lidHandle.rotation.y = rotation;
			lidHandle.material = metalMat;
			meshes.push(lidHandle);

			// Water level indicator
			const indicatorMat = new PBRMaterial(`collector_indicator_${id}`, scene);
			indicatorMat.albedoColor = new Color3(0.2, 0.5, 0.8);
			indicatorMat.metallic = 0;
			indicatorMat.roughness = 0.3;
			indicatorMat.alpha = 0.7;
			materials.push(indicatorMat);

			const indicator = MeshBuilder.CreateBox(
				`${id}_indicator`,
				{
					width: 0.02,
					height: tankHeight * 0.7 * fillLevel,
					depth: 0.02,
				},
				scene,
			);
			indicator.position = new Vector3(
				posX + (tankWidth / 2 + 0.02) * Math.cos(rotation),
				posY + tankHeight * 0.1 + (tankHeight * 0.7 * fillLevel) / 2,
				posZ + (tankWidth / 2 + 0.02) * Math.sin(rotation),
			);
			indicator.material = indicatorMat;
			meshes.push(indicator);

			// Spout
			if (hasSpout) {
				const spout = MeshBuilder.CreateCylinder(
					`${id}_spout`,
					{ height: 0.1, diameter: 0.04 },
					scene,
				);
				spout.position = new Vector3(
					posX + (tankWidth / 2 + 0.03) * Math.cos(rotation),
					posY + tankHeight * 0.1,
					posZ + (tankWidth / 2 + 0.03) * Math.sin(rotation),
				);
				spout.rotation.z = Math.PI / 2;
				spout.rotation.y = rotation;
				spout.material = metalMat;
				meshes.push(spout);
			}
		} else if (type === "bucket") {
			const bucketMat = new PBRMaterial(`collector_bucket_${id}`, scene);
			bucketMat.albedoColor = new Color3(
				0.5 * ageFactor,
				0.5 * ageFactor,
				0.52 * ageFactor,
			);
			bucketMat.metallic = 0.7;
			bucketMat.roughness = 0.45 + (1 - ageFactor) * 0.25;
			materials.push(bucketMat);

			const bucketHeight = 0.35 * scale;
			const bucketTopDiameter = 0.35 * scale;
			const bucketBottomDiameter = 0.3 * scale;

			// Bucket body
			const bucket = MeshBuilder.CreateCylinder(
				`${id}_bucket`,
				{
					height: bucketHeight,
					diameterTop: bucketTopDiameter,
					diameterBottom: bucketBottomDiameter,
					tessellation: 24,
				},
				scene,
			);
			bucket.position = new Vector3(posX, posY + bucketHeight / 2, posZ);
			bucket.rotation.y = rotation;
			bucket.material = bucketMat;
			meshes.push(bucket);

			// Rim
			const rim = MeshBuilder.CreateTorus(
				`${id}_rim`,
				{
					diameter: bucketTopDiameter,
					thickness: 0.015,
					tessellation: 24,
				},
				scene,
			);
			rim.position = new Vector3(posX, posY + bucketHeight, posZ);
			rim.rotation.x = Math.PI / 2;
			rim.material = bucketMat;
			meshes.push(rim);

			// Handle
			const handleMat = new PBRMaterial(`collector_handle_${id}`, scene);
			handleMat.albedoColor = new Color3(0.3, 0.3, 0.32);
			handleMat.metallic = 0.85;
			handleMat.roughness = 0.4;
			materials.push(handleMat);

			// Handle arc
			const handle = MeshBuilder.CreateTorus(
				`${id}_handle`,
				{
					diameter: bucketTopDiameter * 0.8,
					thickness: 0.01,
					arc: 0.5,
					tessellation: 16,
				},
				scene,
			);
			handle.position = new Vector3(
				posX,
				posY + bucketHeight + bucketTopDiameter * 0.35,
				posZ,
			);
			handle.rotation.z = Math.PI;
			handle.rotation.y = rotation;
			handle.material = handleMat;
			meshes.push(handle);

			// Handle attachment points
			for (const side of [-1, 1]) {
				const attachment = MeshBuilder.CreateCylinder(
					`${id}_attachment_${side}`,
					{ height: 0.02, diameter: 0.015 },
					scene,
				);
				attachment.position = new Vector3(
					posX + side * bucketTopDiameter * 0.4 * Math.cos(rotation),
					posY + bucketHeight - 0.01,
					posZ + side * bucketTopDiameter * 0.4 * Math.sin(rotation),
				);
				attachment.material = handleMat;
				meshes.push(attachment);
			}

			// Water inside
			if (fillLevel > 0) {
				const waterHeight = bucketHeight * fillLevel * 0.85;
				const waterDiameter =
					bucketBottomDiameter +
					(bucketTopDiameter - bucketBottomDiameter) * fillLevel * 0.85;
				const water = MeshBuilder.CreateCylinder(
					`${id}_water`,
					{
						height: waterHeight,
						diameter: waterDiameter * 0.95,
					},
					scene,
				);
				water.position = new Vector3(posX, posY + waterHeight / 2 + 0.02, posZ);
				water.material = waterMat;
				meshes.push(water);
			}
		} else if (type === "tarp") {
			const tarpMat = new PBRMaterial(`collector_tarp_${id}`, scene);
			tarpMat.albedoColor = new Color3(
				0.15 * ageFactor,
				0.35 * ageFactor,
				0.2 * ageFactor,
			);
			tarpMat.metallic = 0;
			tarpMat.roughness = 0.8;
			materials.push(tarpMat);

			const tarpSize = 1.5 * scale;
			const tarpSag = 0.3 * scale;

			// Create sagging tarp using a subdivided plane
			const subdivisions = 8;
			const tarp = MeshBuilder.CreateGround(
				`${id}_tarp`,
				{
					width: tarpSize,
					height: tarpSize,
					subdivisions: subdivisions,
				},
				scene,
			);

			// Modify vertices to create sag
			const positions = tarp.getVerticesData("position");
			if (positions) {
				for (let i = 0; i < positions.length; i += 3) {
					const x = positions[i];
					const z = positions[i + 2];
					// Create bowl shape - lower in center
					const distFromCenter = Math.sqrt(x * x + z * z) / (tarpSize / 2);
					const sagAmount = (1 - distFromCenter * distFromCenter) * tarpSag;
					positions[i + 1] = -sagAmount;
				}
				tarp.updateVerticesData("position", positions);
			}

			tarp.position = new Vector3(posX, posY + tarpSag + 0.3, posZ);
			tarp.rotation.y = rotation;
			tarp.material = tarpMat;
			meshes.push(tarp);

			// Corner stakes/supports
			const stakeMat = new PBRMaterial(`collector_stake_${id}`, scene);
			stakeMat.albedoColor = new Color3(0.4, 0.35, 0.25);
			stakeMat.metallic = 0;
			stakeMat.roughness = 0.85;
			materials.push(stakeMat);

			const stakeHeight = tarpSag + 0.4;
			const cornerOffset = tarpSize * 0.45;

			for (let cx = -1; cx <= 1; cx += 2) {
				for (let cz = -1; cz <= 1; cz += 2) {
					const stake = MeshBuilder.CreateCylinder(
						`${id}_stake_${cx}_${cz}`,
						{
							height: stakeHeight,
							diameterTop: 0.02,
							diameterBottom: 0.03,
						},
						scene,
					);
					const stakeX = cx * cornerOffset;
					const stakeZ = cz * cornerOffset;
					stake.position = new Vector3(
						posX + stakeX * Math.cos(rotation) - stakeZ * Math.sin(rotation),
						posY + stakeHeight / 2,
						posZ + stakeX * Math.sin(rotation) + stakeZ * Math.cos(rotation),
					);
					stake.material = stakeMat;
					meshes.push(stake);
				}
			}

			// Water collected in center
			if (fillLevel > 0) {
				const waterRadius = tarpSize * 0.3 * Math.sqrt(fillLevel);
				const waterDepth = tarpSag * fillLevel;
				const water = MeshBuilder.CreateCylinder(
					`${id}_water`,
					{
						height: waterDepth,
						diameter: waterRadius * 2,
					},
					scene,
				);
				water.position = new Vector3(
					posX,
					posY + 0.32 - tarpSag + waterDepth / 2,
					posZ,
				);
				water.material = waterMat;
				meshes.push(water);
			}

			// Drainage spout (rope/tube to lower container)
			if (hasSpout) {
				const spoutMat = new PBRMaterial(`collector_spoutmat_${id}`, scene);
				spoutMat.albedoColor = new Color3(0.25, 0.25, 0.27);
				spoutMat.metallic = 0.2;
				spoutMat.roughness = 0.7;
				materials.push(spoutMat);

				const spout = MeshBuilder.CreateCylinder(
					`${id}_spout`,
					{
						height: 0.5,
						diameter: 0.02,
					},
					scene,
				);
				spout.position = new Vector3(posX + tarpSize * 0.35, posY + 0.1, posZ);
				spout.rotation.z = Math.PI / 4;
				spout.rotation.y = rotation;
				spout.material = spoutMat;
				meshes.push(spout);
			}
		}

		// Add weathering details for damaged condition
		if (condition === "damaged" && rng) {
			const damageMat = new PBRMaterial(`collector_damage_${id}`, scene);
			damageMat.albedoColor = new Color3(0.5, 0.35, 0.2);
			damageMat.metallic = 0.4;
			damageMat.roughness = 0.8;
			materials.push(damageMat);

			const damageCount = 2 + Math.floor(rng.next() * 3);
			const baseHeight =
				type === "barrel"
					? 0.9 * scale
					: type === "tank"
						? 1.2 * scale
						: 0.35 * scale;

			for (let d = 0; d < damageCount; d++) {
				const damageAngle = rng.next() * Math.PI * 2;
				const damageY = rng.next() * baseHeight * 0.6 + baseHeight * 0.2;
				const damageSize = 0.02 + rng.next() * 0.03;

				const damage = MeshBuilder.CreateBox(
					`${id}_damage_${d}`,
					{
						width: damageSize,
						height: damageSize * 2,
						depth: 0.01,
					},
					scene,
				);
				const radius =
					type === "barrel"
						? (0.55 * scale) / 2
						: type === "bucket"
							? (0.35 * scale) / 2
							: 0.4 * scale;
				damage.position = new Vector3(
					posX + Math.cos(damageAngle + rotation) * radius,
					posY + damageY,
					posZ + Math.sin(damageAngle + rotation) * radius,
				);
				damage.rotation.y = damageAngle + rotation;
				damage.material = damageMat;
				meshes.push(damage);
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
		rotation,
		type,
		condition,
		capacity,
		fillLevel,
		hasSpout,
		seed,
	]);

	return null;
}
