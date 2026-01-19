/**
 * RooftopGarden - Survival garden plots for food production
 *
 * Various rooftop garden configurations for post-apocalyptic survival environments.
 * Essential for food production in the flooded Neo-Tokyo setting.
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

export type GardenType = "raised-bed" | "container" | "vertical" | "hydroponic" | "tarp";
export type GardenCrop = "vegetables" | "herbs" | "rice" | "mushrooms" | "mixed";

export interface RooftopGardenProps {
	id: string;
	position: Vector3;
	/** Garden type/configuration */
	type?: GardenType;
	/** Primary crop type */
	crop?: GardenCrop;
	/** Width of garden area */
	width?: number;
	/** Depth of garden area */
	depth?: number;
	/** Growth stage 0-1 (seedling to harvest) */
	growthStage?: number;
	/** Has irrigation system */
	hasIrrigation?: boolean;
	/** Has protective cover/shade */
	hasCover?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const CROP_COLORS: Record<GardenCrop, { plant: Color3; soil: Color3 }> = {
	vegetables: { plant: new Color3(0.2, 0.5, 0.15), soil: new Color3(0.3, 0.2, 0.1) },
	herbs: { plant: new Color3(0.3, 0.55, 0.2), soil: new Color3(0.35, 0.25, 0.12) },
	rice: { plant: new Color3(0.4, 0.6, 0.25), soil: new Color3(0.25, 0.2, 0.15) },
	mushrooms: { plant: new Color3(0.7, 0.65, 0.55), soil: new Color3(0.2, 0.15, 0.1) },
	mixed: { plant: new Color3(0.25, 0.5, 0.18), soil: new Color3(0.32, 0.22, 0.11) },
};

export function RooftopGarden({
	id,
	position,
	type = "raised-bed",
	crop = "vegetables",
	width = 2,
	depth = 1.5,
	growthStage = 0.7,
	hasIrrigation = false,
	hasCover = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: RooftopGardenProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);
	const materialsRef = useRef<Material[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: PBRMaterial[] = [];
		const random = createSeededRandom(seed ?? Math.random() * 10000);

		const cropConfig = CROP_COLORS[crop];
		const plantHeight = 0.1 + growthStage * 0.4;

		// Soil material
		const soilMat = new PBRMaterial(`${id}-soil-mat`, scene);
		soilMat.albedoColor = cropConfig.soil;
		soilMat.roughness = 1;
		soilMat.metallic = 0;
		materials.push(soilMat);

		// Plant material
		const plantMat = new PBRMaterial(`${id}-plant-mat`, scene);
		plantMat.albedoColor = cropConfig.plant;
		plantMat.roughness = 0.8;
		plantMat.metallic = 0;
		materials.push(plantMat);

		// Wood/container material
		const woodMat = new PBRMaterial(`${id}-wood-mat`, scene);
		woodMat.albedoColor = new Color3(0.4 * condition, 0.3 * condition, 0.2 * condition);
		woodMat.roughness = 0.85;
		woodMat.metallic = 0;
		materials.push(woodMat);

		// Create bed structure based on type
		if (type === "raised-bed") {
			// Wooden raised bed frame
			const bedHeight = 0.3;
			const wallThickness = 0.08;

			// Sides
			const sides = [
				{ w: width, d: wallThickness, x: 0, z: depth / 2 - wallThickness / 2 },
				{ w: width, d: wallThickness, x: 0, z: -depth / 2 + wallThickness / 2 },
				{ w: wallThickness, d: depth, x: width / 2 - wallThickness / 2, z: 0 },
				{ w: wallThickness, d: depth, x: -width / 2 + wallThickness / 2, z: 0 },
			];

			for (let i = 0; i < sides.length; i++) {
				const s = sides[i];
				const wall = MeshBuilder.CreateBox(
					`${id}-wall-${i}`,
					{ width: s.w, height: bedHeight, depth: s.d },
					scene
				);
				wall.position = new Vector3(posX + s.x, posY + bedHeight / 2, posZ + s.z);
				wall.material = woodMat;
				meshes.push(wall);
			}

			// Soil inside
			const soil = MeshBuilder.CreateBox(
				`${id}-soil`,
				{ width: width - wallThickness * 2, height: bedHeight - 0.05, depth: depth - wallThickness * 2 },
				scene
			);
			soil.position = new Vector3(posX, posY + (bedHeight - 0.05) / 2, posZ);
			soil.material = soilMat;
			meshes.push(soil);

		} else if (type === "container") {
			// Collection of containers/pots
			const containerCount = Math.floor(width * depth * 2);
			for (let i = 0; i < containerCount; i++) {
				const cx = posX + (random() - 0.5) * (width - 0.3);
				const cz = posZ + (random() - 0.5) * (depth - 0.3);
				const cSize = 0.2 + random() * 0.15;
				const cHeight = 0.2 + random() * 0.1;

				const container = MeshBuilder.CreateCylinder(
					`${id}-container-${i}`,
					{ diameterTop: cSize, diameterBottom: cSize * 0.85, height: cHeight, tessellation: 8 },
					scene
				);
				container.position = new Vector3(cx, posY + cHeight / 2, cz);
				container.material = woodMat;
				meshes.push(container);

				// Soil in container
				const cSoil = MeshBuilder.CreateCylinder(
					`${id}-csoil-${i}`,
					{ diameter: cSize * 0.9, height: 0.02, tessellation: 8 },
					scene
				);
				cSoil.position = new Vector3(cx, posY + cHeight - 0.02, cz);
				cSoil.material = soilMat;
				meshes.push(cSoil);
			}

		} else if (type === "vertical") {
			// Vertical pallet garden
			const palletHeight = 1.2;
			const palletWidth = width;
			const shelfCount = 4;

			// Back panel
			const back = MeshBuilder.CreateBox(
				`${id}-back`,
				{ width: palletWidth, height: palletHeight, depth: 0.05 },
				scene
			);
			back.position = new Vector3(posX, posY + palletHeight / 2, posZ);
			back.material = woodMat;
			meshes.push(back);

			// Shelves
			for (let i = 0; i < shelfCount; i++) {
				const shelfY = posY + 0.15 + (i / (shelfCount - 1)) * (palletHeight - 0.3);
				const shelf = MeshBuilder.CreateBox(
					`${id}-shelf-${i}`,
					{ width: palletWidth - 0.1, height: 0.08, depth: 0.15 },
					scene
				);
				shelf.position = new Vector3(posX, shelfY, posZ + 0.1);
				shelf.material = woodMat;
				meshes.push(shelf);

				// Soil on shelf
				const shelfSoil = MeshBuilder.CreateBox(
					`${id}-shelfsoil-${i}`,
					{ width: palletWidth - 0.15, height: 0.05, depth: 0.12 },
					scene
				);
				shelfSoil.position = new Vector3(posX, shelfY + 0.065, posZ + 0.1);
				shelfSoil.material = soilMat;
				meshes.push(shelfSoil);
			}

		} else if (type === "hydroponic") {
			// PVC pipe hydroponic system
			const pipeMat = new PBRMaterial(`${id}-pipe-mat`, scene);
			pipeMat.albedoColor = new Color3(0.9, 0.9, 0.9);
			pipeMat.roughness = 0.3;
			pipeMat.metallic = 0;
			materials.push(pipeMat);

			const pipeRows = Math.floor(depth / 0.3);
			for (let i = 0; i < pipeRows; i++) {
				const pipeZ = posZ - depth / 2 + 0.15 + i * 0.3;
				const pipe = MeshBuilder.CreateCylinder(
					`${id}-pipe-${i}`,
					{ diameter: 0.15, height: width, tessellation: 12 },
					scene
				);
				pipe.rotation.z = Math.PI / 2;
				pipe.position = new Vector3(posX, posY + 0.3 + i * 0.05, pipeZ);
				pipe.material = pipeMat;
				meshes.push(pipe);
			}

			// Support frame
			for (let i = 0; i < 2; i++) {
				const support = MeshBuilder.CreateBox(
					`${id}-support-${i}`,
					{ width: 0.05, height: 0.5, depth: depth },
					scene
				);
				support.position = new Vector3(
					posX + (i === 0 ? -1 : 1) * (width / 2 - 0.05),
					posY + 0.25,
					posZ
				);
				support.material = woodMat;
				meshes.push(support);
			}

		} else if (type === "tarp") {
			// Ground-level tarp garden
			const tarpMat = new PBRMaterial(`${id}-tarp-mat`, scene);
			tarpMat.albedoColor = new Color3(0.1, 0.2, 0.4);
			tarpMat.roughness = 0.7;
			tarpMat.metallic = 0;
			materials.push(tarpMat);

			// Tarp base
			const tarp = MeshBuilder.CreateBox(
				`${id}-tarp`,
				{ width: width + 0.2, height: 0.01, depth: depth + 0.2 },
				scene
			);
			tarp.position = new Vector3(posX, posY + 0.005, posZ);
			tarp.material = tarpMat;
			meshes.push(tarp);

			// Soil mounds
			const moundCount = Math.floor(width * depth);
			for (let i = 0; i < moundCount; i++) {
				const mx = posX + (random() - 0.5) * (width - 0.3);
				const mz = posZ + (random() - 0.5) * (depth - 0.3);
				const mound = MeshBuilder.CreateCylinder(
					`${id}-mound-${i}`,
					{ diameterTop: 0.1, diameterBottom: 0.25, height: 0.1, tessellation: 8 },
					scene
				);
				mound.position = new Vector3(mx, posY + 0.06, mz);
				mound.material = soilMat;
				meshes.push(mound);
			}
		}

		// Add plants based on growth stage and crop type
		if (growthStage > 0.1) {
			const plantCount = Math.floor(width * depth * 4 * growthStage);
			const plantArea = type === "vertical" ? { w: width - 0.2, d: 0.1 } : { w: width - 0.3, d: depth - 0.3 };

			for (let i = 0; i < plantCount; i++) {
				const px = posX + (random() - 0.5) * plantArea.w;
				const pz = posZ + (random() - 0.5) * plantArea.d;
				const baseY = type === "raised-bed" ? posY + 0.25 : type === "vertical" ? posY + 0.3 + random() * 0.8 : posY + 0.05;

				if (crop === "mushrooms") {
					// Mushroom caps
					const cap = MeshBuilder.CreateCylinder(
						`${id}-mushroom-${i}`,
						{ diameterTop: 0.08 * growthStage, diameterBottom: 0.02, height: plantHeight * 0.5, tessellation: 8 },
						scene
					);
					cap.position = new Vector3(px, baseY + plantHeight * 0.25, pz);
					cap.material = plantMat;
					meshes.push(cap);
				} else {
					// Generic plant
					const stem = MeshBuilder.CreateCylinder(
						`${id}-plant-${i}`,
						{ diameter: 0.02, height: plantHeight, tessellation: 6 },
						scene
					);
					stem.position = new Vector3(px, baseY + plantHeight / 2, pz);
					stem.material = plantMat;
					meshes.push(stem);

					// Leaves for larger plants
					if (growthStage > 0.4 && random() > 0.5) {
						const leafSize = 0.05 + growthStage * 0.1;
						const leaf = MeshBuilder.CreateDisc(
							`${id}-leaf-${i}`,
							{ radius: leafSize, tessellation: 6 },
							scene
						);
						leaf.position = new Vector3(px, baseY + plantHeight * 0.7, pz);
						leaf.rotation.x = -Math.PI / 4 + random() * 0.5;
						leaf.rotation.y = random() * Math.PI * 2;
						leaf.material = plantMat;
						meshes.push(leaf);
					}
				}
			}
		}

		// Irrigation system
		if (hasIrrigation) {
			const pipeMat = new PBRMaterial(`${id}-irrigation-mat`, scene);
			pipeMat.albedoColor = new Color3(0.1, 0.1, 0.1);
			pipeMat.roughness = 0.5;
			pipeMat.metallic = 0.2;
			materials.push(pipeMat);

			// Main pipe
			const mainPipe = MeshBuilder.CreateCylinder(
				`${id}-main-pipe`,
				{ diameter: 0.03, height: width },
				scene
			);
			mainPipe.rotation.z = Math.PI / 2;
			mainPipe.position = new Vector3(posX, posY + 0.35, posZ - depth / 2 + 0.1);
			mainPipe.material = pipeMat;
			meshes.push(mainPipe);

			// Drip lines
			const dripCount = Math.floor(width / 0.3);
			for (let i = 0; i < dripCount; i++) {
				const drip = MeshBuilder.CreateCylinder(
					`${id}-drip-${i}`,
					{ diameter: 0.015, height: depth - 0.2 },
					scene
				);
				drip.rotation.x = Math.PI / 2;
				drip.position = new Vector3(
					posX - width / 2 + 0.15 + i * 0.3,
					posY + 0.32,
					posZ
				);
				drip.material = pipeMat;
				meshes.push(drip);
			}
		}

		// Protective cover
		if (hasCover) {
			const coverMat = new PBRMaterial(`${id}-cover-mat`, scene);
			coverMat.albedoColor = new Color3(0.9, 0.9, 0.85);
			coverMat.alpha = 0.3;
			coverMat.roughness = 0.2;
			materials.push(coverMat);

			const coverHeight = 0.8;
			const cover = MeshBuilder.CreateBox(
				`${id}-cover`,
				{ width: width + 0.1, height: 0.01, depth: depth + 0.1 },
				scene
			);
			cover.position = new Vector3(posX, posY + coverHeight, posZ);
			cover.material = coverMat;
			meshes.push(cover);

			// Cover supports
			for (let i = 0; i < 4; i++) {
				const sx = (i % 2 === 0 ? -1 : 1) * (width / 2);
				const sz = (i < 2 ? -1 : 1) * (depth / 2);
				const support = MeshBuilder.CreateCylinder(
					`${id}-cover-support-${i}`,
					{ diameter: 0.02, height: coverHeight },
					scene
				);
				support.position = new Vector3(posX + sx, posY + coverHeight / 2, posZ + sz);
				support.material = woodMat;
				meshes.push(support);
			}
		}

		// Apply rotation
		if (rotation !== 0) {
			for (const mesh of meshes) {
				const relX = mesh.position.x - posX;
				const relZ = mesh.position.z - posZ;
				mesh.position.x = posX + relX * Math.cos(rotation) - relZ * Math.sin(rotation);
				mesh.position.z = posZ + relX * Math.sin(rotation) + relZ * Math.cos(rotation);
				mesh.rotation.y += rotation;
			}
		}

		meshRef.current = meshes;
		materialsRef.current = materials;

		return () => {
			for (const mesh of meshRef.current) {
				mesh.dispose();
			}
			for (const mat of materialsRef.current) {
				mat.dispose();
			}
			meshRef.current = [];
			materialsRef.current = [];
		};
	}, [id, posX, posY, posZ, type, crop, width, depth, growthStage, hasIrrigation, hasCover, condition, rotation, seed, scene]);

	return null;
}
