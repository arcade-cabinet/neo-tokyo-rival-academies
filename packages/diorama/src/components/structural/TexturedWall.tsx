/**
 * TexturedWall - Wall component using real AmbientCG PBR textures
 *
 * Uses @neo-tokyo/core for texture paths and material types.
 * Separates visual (textures) from physics (collision boxes).
 */

import {
	type AbstractMesh,
	MeshBuilder,
	PBRMaterial,
	Texture,
	Vector3,
} from "@babylonjs/core";
import {
	getMaterialTexturePath,
	type MaterialName,
} from "@neo-tokyo/shared-assets";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

// Map semantic wall types to actual AmbientCG materials
export const WALL_TEXTURES = {
	// Concrete walls
	concrete_clean: "Concrete004" as MaterialName,
	concrete_dirty: "Concrete022" as MaterialName,
	concrete_weathered: "Concrete015" as MaterialName,
	concrete_damaged: "Concrete034" as MaterialName,

	// Brick walls
	brick_red: "Bricks001" as MaterialName,
	brick_grey: "Bricks010" as MaterialName,
	brick_weathered: "Bricks024" as MaterialName,
	brick_old: "Bricks037" as MaterialName,

	// Metal walls
	metal_clean: "Metal001" as MaterialName,
	metal_corrugated: "CorrugatedSteel001" as MaterialName,
	metal_rusted: "Rust001" as MaterialName,
	metal_weathered: "CorrugatedSteel003" as MaterialName,
} as const;

export type WallTextureType = keyof typeof WALL_TEXTURES;

export interface TexturedWallProps {
	/** Unique identifier */
	id: string;
	/** Wall position (base center) */
	position: Vector3;
	/** Wall dimensions (width, height, depth) */
	size: { width: number; height: number; depth: number };
	/** Texture type from available presets */
	textureType: WallTextureType;
	/** Or use a direct material name from @neo-tokyo/assets */
	material?: MaterialName;
	/** Rotation in radians around Y axis */
	rotation?: number;
	/** UV tiling (how many times texture repeats) */
	uvScale?: { u: number; v: number };
	/** Callback when mesh is ready (for collision registration) */
	onReady?: (mesh: AbstractMesh) => void;
}

/**
 * TexturedWall component using PBR materials from @neo-tokyo/assets
 */
export function TexturedWall({
	id,
	position,
	size,
	textureType,
	material,
	rotation = 0,
	uvScale = { u: 1, v: 1 },
	onReady,
}: TexturedWallProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	// Stabilize primitive values to avoid unnecessary re-renders
	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;
	const sizeW = size.width;
	const sizeH = size.height;
	const sizeD = size.depth;
	const uvU = uvScale.u;
	const uvV = uvScale.v;

	// Resolve material name: direct material prop takes precedence over textureType
	const materialName = material ?? WALL_TEXTURES[textureType];

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];

		// Reconstruct from primitive values
		const pos = new Vector3(posX, posY, posZ);

		// Main wall body
		const wallMesh = MeshBuilder.CreateBox(
			`wall_${id}`,
			{
				width: sizeW,
				height: sizeH,
				depth: sizeD,
			},
			scene,
		);

		wallMesh.position = pos.clone();
		wallMesh.position.y += sizeH / 2; // Position from base
		wallMesh.rotation.y = rotation;

		// Create PBR material with textures from @neo-tokyo/assets
		const wallMat = new PBRMaterial(`wallMat_${id}`, scene);

		// Load PBR texture maps using shared asset paths
		const colorMap = new Texture(
			getMaterialTexturePath(materialName, "Color"),
			scene,
		);
		const normalMap = new Texture(
			getMaterialTexturePath(materialName, "NormalGL"),
			scene,
		);
		const roughnessMap = new Texture(
			getMaterialTexturePath(materialName, "Roughness"),
			scene,
		);

		// Apply UV scaling to all maps
		const applyUV = (tex: Texture) => {
			tex.uScale = uvU;
			tex.vScale = uvV;
		};
		applyUV(colorMap);
		applyUV(normalMap);
		applyUV(roughnessMap);

		// Configure full PBR material
		wallMat.albedoTexture = colorMap;
		wallMat.bumpTexture = normalMap;

		// Roughness from texture (use green channel as roughness)
		wallMat.metallicTexture = roughnessMap;
		wallMat.useRoughnessFromMetallicTextureGreen = true;
		wallMat.useRoughnessFromMetallicTextureAlpha = false;
		wallMat.metallic = 0;
		wallMat.roughness = 1;

		wallMesh.material = wallMat;
		meshes.push(wallMesh);

		meshesRef.current = meshes;

		// Notify parent for collision registration
		if (onReady && meshes.length > 0) {
			onReady(meshes[0]);
		}

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		sizeW,
		sizeH,
		sizeD,
		materialName,
		rotation,
		uvU,
		uvV,
		onReady,
	]);

	return null;
}

export default TexturedWall;
