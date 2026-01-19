/**
 * Farground - Distant city skyline component
 *
 * Provides visual depth without gameplay complexity:
 * - Silhouette buildings at various distances
 * - Atmospheric fog/haze
 * - Distant neon glows
 * - Parallax layers
 *
 * NOT interactive - purely visual backdrop.
 */

import {
	Color3,
	Color4,
	MeshBuilder,
	PBRMaterial,
	StandardMaterial,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface FargroundProps {
	/** Unique identifier */
	id: string;
	/** Position of the farground center */
	position: Vector3;
	/** Width of the skyline */
	width?: number;
	/** Distance from camera (affects fog/scale) */
	distance?: number;
	/** Building density (buildings per 10 units) */
	density?: number;
	/** Atmospheric color (fog/haze) */
	atmosphereColor?: Color3;
	/** Base building color (silhouette) */
	buildingColor?: Color3;
	/** Enable distant neon glows */
	distantNeon?: boolean;
	/** Random seed for building placement */
	seed?: number;
}

// Simple seeded random for deterministic generation
function seededRandom(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Farground component
 */
export function Farground({
	id,
	position,
	width = 200,
	distance = 100,
	density = 8,
	atmosphereColor = new Color3(0.02, 0.03, 0.08),
	buildingColor = new Color3(0.05, 0.06, 0.1),
	distantNeon = true,
	seed = 12345,
}: FargroundProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		let seedCounter = seed;

		const nextRandom = () => {
			seedCounter++;
			return seededRandom(seedCounter);
		};

		// Building silhouette material (very dark, slight emissive)
		const buildingMat = new PBRMaterial(`farMat_${id}`, scene);
		buildingMat.albedoColor = buildingColor;
		buildingMat.roughness = 1;
		buildingMat.metallic = 0;
		// Slight ambient glow from distant city lights
		buildingMat.emissiveColor = buildingColor.scale(0.3);
		buildingMat.emissiveIntensity = 0.5;

		// Atmosphere/fog plane
		const atmosphereMat = new StandardMaterial(`atmosMat_${id}`, scene);
		atmosphereMat.diffuseColor = atmosphereColor;
		atmosphereMat.emissiveColor = atmosphereColor.scale(0.5);
		atmosphereMat.alpha = 0.4;
		atmosphereMat.backFaceCulling = false;

		// Number of buildings
		const buildingCount = Math.floor((width / 10) * density);

		// Generate building silhouettes
		for (let i = 0; i < buildingCount; i++) {
			const xPos = position.x - width / 2 + (i / buildingCount) * width + (nextRandom() - 0.5) * 10;
			const buildingWidth = 3 + nextRandom() * 8;
			const buildingDepth = 2 + nextRandom() * 4;
			const buildingHeight = 10 + nextRandom() * 40;

			// Vary distance slightly for parallax effect
			const zOffset = (nextRandom() - 0.5) * 20;

			const building = MeshBuilder.CreateBox(
				`far_building_${id}_${i}`,
				{
					width: buildingWidth,
					height: buildingHeight,
					depth: buildingDepth,
				},
				scene
			);

			building.position = new Vector3(
				xPos,
				position.y + buildingHeight / 2 - 5, // Below horizon line
				position.z + distance + zOffset
			);

			building.material = buildingMat;
			meshes.push(building);

			// Distant neon windows/lights
			if (distantNeon && nextRandom() > 0.5) {
				const neonCount = Math.floor(1 + nextRandom() * 4);

				for (let j = 0; j < neonCount; j++) {
					const neonY = position.y + 5 + nextRandom() * (buildingHeight - 10);
					const neonX = xPos + (nextRandom() - 0.5) * (buildingWidth * 0.6);

					// Random neon color
					const neonColors = [
						new Color3(1, 0, 0.5),
						new Color3(0, 1, 0.5),
						new Color3(0, 0.5, 1),
						new Color3(1, 0.5, 0),
						new Color3(1, 0, 1),
					];
					const neonColor = neonColors[Math.floor(nextRandom() * neonColors.length)];

					const neonMat = new PBRMaterial(`farNeon_${id}_${i}_${j}`, scene);
					neonMat.albedoColor = neonColor;
					neonMat.emissiveColor = neonColor.scale(2);
					neonMat.emissiveIntensity = 2;
					neonMat.unlit = true;

					const neonSize = 0.3 + nextRandom() * 0.5;
					const neon = MeshBuilder.CreateBox(
						`far_neon_${id}_${i}_${j}`,
						{
							width: neonSize * (1 + nextRandom() * 3),
							height: neonSize,
							depth: 0.1,
						},
						scene
					);

					neon.position = new Vector3(
						neonX,
						neonY,
						position.z + distance + zOffset - buildingDepth / 2 - 0.1
					);

					neon.material = neonMat;
					meshes.push(neon);
				}
			}
		}

		// Atmospheric haze layers (multiple for depth)
		const hazeLayers = [
			{ z: distance * 0.7, alpha: 0.15 },
			{ z: distance * 0.85, alpha: 0.25 },
			{ z: distance, alpha: 0.35 },
		];

		hazeLayers.forEach(({ z, alpha }, i) => {
			const hazeMat = new StandardMaterial(`hazeMat_${id}_${i}`, scene);
			hazeMat.diffuseColor = atmosphereColor;
			hazeMat.emissiveColor = atmosphereColor.scale(0.3);
			hazeMat.alpha = alpha;
			hazeMat.backFaceCulling = false;

			const haze = MeshBuilder.CreatePlane(
				`haze_${id}_${i}`,
				{
					width: width * 1.5,
					height: 80,
				},
				scene
			);
			haze.position = new Vector3(position.x, position.y + 20, position.z + z);
			haze.material = hazeMat;
			meshes.push(haze);
		});

		// Sky gradient (very distant)
		const skyMat = new StandardMaterial(`skyMat_${id}`, scene);
		skyMat.diffuseColor = new Color3(0.01, 0.02, 0.05);
		skyMat.emissiveColor = new Color3(0.02, 0.03, 0.08);
		skyMat.backFaceCulling = false;

		const sky = MeshBuilder.CreatePlane(
			`sky_${id}`,
			{
				width: width * 2,
				height: 100,
			},
			scene
		);
		sky.position = new Vector3(position.x, position.y + 40, position.z + distance + 50);
		sky.material = skyMat;
		meshes.push(sky);

		meshesRef.current = meshes;

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [scene, id, position, width, distance, density, atmosphereColor, buildingColor, distantNeon, seed]);

	return null;
}

/**
 * Farground presets
 */
export const FARGROUND_PRESETS = {
	// Dense downtown skyline
	downtown: {
		density: 12,
		distance: 80,
		atmosphereColor: new Color3(0.02, 0.03, 0.06),
		buildingColor: new Color3(0.04, 0.05, 0.08),
		distantNeon: true,
	},
	// Industrial district
	industrial: {
		density: 6,
		distance: 120,
		atmosphereColor: new Color3(0.04, 0.03, 0.02),
		buildingColor: new Color3(0.06, 0.05, 0.04),
		distantNeon: false,
	},
	// Sparse outer district
	outskirts: {
		density: 4,
		distance: 150,
		atmosphereColor: new Color3(0.01, 0.02, 0.04),
		buildingColor: new Color3(0.03, 0.04, 0.06),
		distantNeon: true,
	},
};

export default Farground;
