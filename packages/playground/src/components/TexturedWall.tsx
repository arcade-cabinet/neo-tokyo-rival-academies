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
	/** Neon accent strip at top */
	neonAccent?: Color3 | null;
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
	neonAccent = null,
	onReady,
}: TexturedWallProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const textureInfo = WALL_TEXTURES[textureType];
		const texturePath = `${TEXTURE_BASE_PATH}/${textureInfo.category}`;

		// Main wall body
		const wallMesh = MeshBuilder.CreateBox(
			`wall_${id}`,
			{
				width: size.width,
				height: size.height,
				depth: size.depth,
			},
			scene
		);

		wallMesh.position = position.clone();
		wallMesh.position.y += size.height / 2; // Position from base
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
		// Displacement map for parallax effect (optional, can be perf heavy)
		// const displacementMap = new Texture(
		// 	`${texturePath}/${textureInfo.name}_displacement.jpg`,
		// 	scene
		// );

		// Apply UV scaling to all maps
		const applyUV = (tex: Texture) => {
			tex.uScale = uvScale.u;
			tex.vScale = uvScale.v;
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
		wallMat.metallic = 0; // Not metallic (walls aren't metal even if named "metal")
		wallMat.roughness = 1; // Base roughness, texture modifies

		// Optional: Parallax mapping for depth effect
		// wallMat.useParallax = true;
		// wallMat.useParallaxOcclusion = true;
		// wallMat.parallaxScaleBias = 0.02;

		wallMesh.material = wallMat;
		meshes.push(wallMesh);

		// Add neon accent strip with GLOW
		if (neonAccent) {
			const neonStrip = MeshBuilder.CreateBox(
				`neon_${id}`,
				{
					width: size.width * 0.95,
					height: 0.1,
					depth: size.depth + 0.03,
				},
				scene
			);

			neonStrip.position = position.clone();
			neonStrip.position.y += size.height - 0.05;
			neonStrip.rotation.y = rotation;

			// PBR material for proper bloom interaction
			const neonMat = new PBRMaterial(`neonMat_${id}`, scene);
			neonMat.albedoColor = neonAccent;
			// HIGH emissive intensity for bloom to pick up
			neonMat.emissiveColor = neonAccent.scale(2.5);
			neonMat.emissiveIntensity = 3.0;
			// Unlit appearance - neon doesn't need diffuse shading
			neonMat.unlit = true;
			neonStrip.material = neonMat;
			meshes.push(neonStrip);

			// Add a subtle glow plane behind the neon for extra bloom
			const glowPlane = MeshBuilder.CreatePlane(
				`neonGlow_${id}`,
				{
					width: size.width * 1.1,
					height: 0.4,
				},
				scene
			);
			glowPlane.position = position.clone();
			glowPlane.position.y += size.height - 0.05;
			glowPlane.position.z -= (size.depth / 2 + 0.05);
			glowPlane.rotation.y = rotation;

			const glowMat = new PBRMaterial(`glowMat_${id}`, scene);
			glowMat.albedoColor = neonAccent.scale(0.3);
			glowMat.emissiveColor = neonAccent.scale(1.5);
			glowMat.emissiveIntensity = 2.0;
			glowMat.alpha = 0.4;
			glowMat.transparencyMode = 2; // Alpha blend
			glowMat.unlit = true;
			glowPlane.material = glowMat;
			meshes.push(glowPlane);
		}

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
	}, [scene, id, position, size, textureType, rotation, uvScale, neonAccent, onReady]);

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
	neonAccent = null,
	onReady,
}: TexturedWallProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];

		// Main wall body
		const wallMesh = MeshBuilder.CreateBox(
			`wall_${id}`,
			{
				width: size.width,
				height: size.height,
				depth: size.depth,
			},
			scene
		);

		wallMesh.position = position.clone();
		wallMesh.position.y += size.height / 2;
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

		// Neon strip with glow
		if (neonAccent) {
			const neonStrip = MeshBuilder.CreateBox(
				`neon_${id}`,
				{
					width: size.width * 0.95,
					height: 0.1,
					depth: size.depth + 0.03,
				},
				scene
			);

			neonStrip.position = position.clone();
			neonStrip.position.y += size.height - 0.05;
			neonStrip.rotation.y = rotation;

			// Use PBR for bloom interaction even in fallback
			const neonMat = new PBRMaterial(`neonMat_${id}`, scene);
			neonMat.albedoColor = neonAccent;
			neonMat.emissiveColor = neonAccent.scale(2.5);
			neonMat.emissiveIntensity = 3.0;
			neonMat.unlit = true;
			neonStrip.material = neonMat;
			meshes.push(neonStrip);
		}

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
	}, [scene, id, position, size, textureType, rotation, neonAccent, onReady]);

	return null;
}

export default TexturedWall;
