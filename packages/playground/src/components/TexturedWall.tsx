/**
 * TexturedWall - Wall component using real AmbientCG PBR textures
 *
 * Uses actual texture assets instead of procedural colors.
 * Separates visual (textures) from physics (collision boxes).
 *
 * Textures loaded from ~/assets/AmbientCG/Assets/MATERIAL/1K-JPG/
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	StandardMaterial,
	Texture,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

// Available texture sets - organized semantically
export const WALL_TEXTURES = {
	// Concrete (walls/concrete/)
	concrete_clean: { category: "walls/concrete", name: "clean" },
	concrete_dirty: { category: "walls/concrete", name: "dirty" },

	// Brick (walls/brick/)
	brick_red: { category: "walls/brick", name: "red" },
	brick_grey: { category: "walls/brick", name: "grey" },

	// Metal (walls/metal/)
	metal_clean: { category: "walls/metal", name: "clean" },
	metal_rusted: { category: "walls/metal", name: "rusted" },
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
	/** Rotation in radians around Y axis */
	rotation?: number;
	/** UV tiling (how many times texture repeats) */
	uvScale?: { u: number; v: number };
	/** Callback when mesh is ready (for collision registration) */
	onReady?: (mesh: AbstractMesh) => void;
}

// Base path for textures
const TEXTURE_BASE_PATH = "/assets/textures";

/**
 * TexturedWall component using PBR materials
 */
export function TexturedWall({
	id,
	position,
	size,
	textureType,
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

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const textureInfo = WALL_TEXTURES[textureType];
		const texturePath = `${TEXTURE_BASE_PATH}/${textureInfo.category}`;

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
			scene
		);

		wallMesh.position = pos.clone();
		wallMesh.position.y += sizeH / 2; // Position from base
		wallMesh.rotation.y = rotation;

		// Create PBR material with textures
		const wallMat = new PBRMaterial(`wallMat_${id}`, scene);

		// Load ALL PBR texture maps
		const colorMap = new Texture(
			`${texturePath}/${textureInfo.name}_color.jpg`,
			scene
		);
		const normalMap = new Texture(
			`${texturePath}/${textureInfo.name}_normal.jpg`,
			scene
		);
		const roughnessMap = new Texture(
			`${texturePath}/${textureInfo.name}_roughness.jpg`,
			scene
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
	}, [scene, id, posX, posY, posZ, sizeW, sizeH, sizeD, textureType, rotation, uvU, uvV, onReady]);

	return null;
}

/**
 * Fallback wall using StandardMaterial when textures aren't available
 * Good for development/testing before textures are copied
 */
export function FallbackTexturedWall({
	id,
	position,
	size,
	textureType,
	rotation = 0,
	onReady,
}: TexturedWallProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	// Stabilize primitive values
	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;
	const sizeW = size.width;
	const sizeH = size.height;
	const sizeD = size.depth;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const pos = new Vector3(posX, posY, posZ);

		// Main wall body
		const wallMesh = MeshBuilder.CreateBox(
			`wall_${id}`,
			{
				width: sizeW,
				height: sizeH,
				depth: sizeD,
			},
			scene
		);

		wallMesh.position = pos.clone();
		wallMesh.position.y += sizeH / 2;
		wallMesh.rotation.y = rotation;

		// Fallback colors based on texture type
		const fallbackColors: Record<WallTextureType, Color3> = {
			concrete_clean: new Color3(0.45, 0.45, 0.48),
			concrete_dirty: new Color3(0.35, 0.35, 0.38),
			brick_red: new Color3(0.55, 0.25, 0.2),
			brick_grey: new Color3(0.4, 0.4, 0.4),
			metal_clean: new Color3(0.3, 0.32, 0.35),
			metal_rusted: new Color3(0.4, 0.28, 0.2),
		};

		const wallMat = new StandardMaterial(`wallMat_${id}`, scene);
		wallMat.diffuseColor = fallbackColors[textureType] || new Color3(0.4, 0.4, 0.4);
		wallMat.specularColor = textureType.startsWith("metal")
			? new Color3(0.3, 0.3, 0.3)
			: new Color3(0.05, 0.05, 0.05);

		wallMesh.material = wallMat;
		meshes.push(wallMesh);

		meshesRef.current = meshes;

		if (onReady && meshes.length > 0) {
			onReady(meshes[0]);
		}

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [scene, id, posX, posY, posZ, sizeW, sizeH, sizeD, textureType, rotation, onReady]);

	return null;
}

export default TexturedWall;
