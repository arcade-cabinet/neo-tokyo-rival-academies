/**
 * Floor - Ground/rooftop surface component
 *
 * In the flooded city, floors are primarily:
 * - Rooftop surfaces (concrete, gravel, membrane)
 * - Interior floors (tile, wood, metal grating)
 * - Platform surfaces (dock, bridge, ferry deck)
 *
 * NOT the flooded streets below - that's Water component.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Texture,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export type FloorSurface =
	| "concrete"      // Standard rooftop
	| "gravel"        // Loose stone rooftop
	| "metal_grating" // Industrial walkway
	| "tile"          // Interior floors
	| "wood"          // Old building floors
	| "membrane"      // Modern rooftop waterproofing
	| "solar"         // Solar panel arrays

export interface FloorProps {
	/** Unique identifier */
	id: string;
	/** Floor position (center) */
	position: Vector3;
	/** Floor dimensions */
	size: { width: number; depth: number };
	/** Surface type */
	surface?: FloorSurface;
	/** Floor thickness */
	thickness?: number;
	/** Rotation in radians (Y axis) */
	rotation?: number;
	/** UV tiling scale */
	uvScale?: { u: number; v: number };
	/** Edge trim/border */
	edgeTrim?: boolean;
	/** Edge trim color (if enabled) */
	edgeColor?: Color3;
	/** Callback when mesh is ready */
	onReady?: (mesh: AbstractMesh) => void;
}

// Surface material configurations
const SURFACE_CONFIG: Record<FloorSurface, {
	color: Color3;
	roughness: number;
	metallic: number;
	textureCategory?: string;
}> = {
	concrete: {
		color: new Color3(0.45, 0.45, 0.48),
		roughness: 0.85,
		metallic: 0.0,
		textureCategory: "floors/concrete",
	},
	gravel: {
		color: new Color3(0.5, 0.48, 0.45),
		roughness: 0.95,
		metallic: 0.0,
	},
	metal_grating: {
		color: new Color3(0.35, 0.35, 0.38),
		roughness: 0.4,
		metallic: 0.7,
	},
	tile: {
		color: new Color3(0.6, 0.58, 0.55),
		roughness: 0.3,
		metallic: 0.1,
	},
	wood: {
		color: new Color3(0.45, 0.35, 0.25),
		roughness: 0.7,
		metallic: 0.0,
	},
	membrane: {
		color: new Color3(0.25, 0.25, 0.28),
		roughness: 0.6,
		metallic: 0.1,
	},
	solar: {
		color: new Color3(0.15, 0.18, 0.25),
		roughness: 0.2,
		metallic: 0.4,
	},
};

const TEXTURE_BASE_PATH = "/assets/textures";

/**
 * Floor component
 */
export function Floor({
	id,
	position,
	size,
	surface = "concrete",
	thickness = 0.2,
	rotation = 0,
	uvScale = { u: 1, v: 1 },
	edgeTrim = false,
	edgeColor = new Color3(0.2, 0.2, 0.22),
	onReady,
}: FloorProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const config = SURFACE_CONFIG[surface];

		// Main floor surface
		const floorMesh = MeshBuilder.CreateBox(
			`floor_${id}`,
			{
				width: size.width,
				height: thickness,
				depth: size.depth,
			},
			scene
		);

		floorMesh.position = position.clone();
		floorMesh.position.y += thickness / 2;
		floorMesh.rotation.y = rotation;

		// PBR Material
		const floorMat = new PBRMaterial(`floorMat_${id}`, scene);
		floorMat.albedoColor = config.color;
		floorMat.roughness = config.roughness;
		floorMat.metallic = config.metallic;

		// Load textures if available
		if (config.textureCategory) {
			const texturePath = `${TEXTURE_BASE_PATH}/${config.textureCategory}`;

			try {
				const colorMap = new Texture(`${texturePath}/color.jpg`, scene);
				colorMap.uScale = uvScale.u * (size.width / 2);
				colorMap.vScale = uvScale.v * (size.depth / 2);
				floorMat.albedoTexture = colorMap;

				const normalMap = new Texture(`${texturePath}/normal.jpg`, scene);
				normalMap.uScale = uvScale.u * (size.width / 2);
				normalMap.vScale = uvScale.v * (size.depth / 2);
				floorMat.bumpTexture = normalMap;

				const roughnessMap = new Texture(`${texturePath}/roughness.jpg`, scene);
				roughnessMap.uScale = uvScale.u * (size.width / 2);
				roughnessMap.vScale = uvScale.v * (size.depth / 2);
				floorMat.metallicTexture = roughnessMap;
				floorMat.useRoughnessFromMetallicTextureGreen = true;
			} catch {
				// Textures not available, use fallback colors
				console.log(`Floor textures not found for ${surface}, using fallback`);
			}
		}

		floorMesh.material = floorMat;
		meshes.push(floorMesh);

		// Edge trim (raised border around floor)
		if (edgeTrim) {
			const trimHeight = 0.1;
			const trimWidth = 0.08;

			const trimMat = new PBRMaterial(`trimMat_${id}`, scene);
			trimMat.albedoColor = edgeColor;
			trimMat.roughness = 0.5;
			trimMat.metallic = 0.3;

			// Four edge pieces
			const edges = [
				{ w: size.width + trimWidth * 2, d: trimWidth, x: 0, z: -size.depth / 2 - trimWidth / 2 },
				{ w: size.width + trimWidth * 2, d: trimWidth, x: 0, z: size.depth / 2 + trimWidth / 2 },
				{ w: trimWidth, d: size.depth, x: -size.width / 2 - trimWidth / 2, z: 0 },
				{ w: trimWidth, d: size.depth, x: size.width / 2 + trimWidth / 2, z: 0 },
			];

			edges.forEach(({ w, d, x, z }, i) => {
				const trim = MeshBuilder.CreateBox(
					`trim_${id}_${i}`,
					{ width: w, height: trimHeight, depth: d },
					scene
				);
				trim.position = new Vector3(
					position.x + x,
					position.y + thickness + trimHeight / 2,
					position.z + z
				);
				trim.rotation.y = rotation;
				trim.material = trimMat;
				trim.parent = floorMesh;
				meshes.push(trim);
			});
		}

		meshesRef.current = meshes;

		if (onReady) {
			onReady(floorMesh);
		}

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [scene, id, position, size, surface, thickness, rotation, uvScale, edgeTrim, edgeColor, onReady]);

	return null;
}

/**
 * Rooftop presets for common scenarios
 */
export const FLOOR_PRESETS = {
	// Standard rooftop with edge
	rooftop_standard: {
		surface: "concrete" as FloorSurface,
		thickness: 0.25,
		edgeTrim: true,
		edgeColor: new Color3(0.15, 0.15, 0.18),
	},
	// Industrial walkway
	walkway: {
		surface: "metal_grating" as FloorSurface,
		thickness: 0.1,
		edgeTrim: false,
	},
	// Modern rooftop
	rooftop_modern: {
		surface: "membrane" as FloorSurface,
		thickness: 0.2,
		edgeTrim: true,
		edgeColor: new Color3(0.1, 0.1, 0.12),
	},
	// Solar array
	solar_array: {
		surface: "solar" as FloorSurface,
		thickness: 0.15,
		edgeTrim: false,
	},
};

export default Floor;
