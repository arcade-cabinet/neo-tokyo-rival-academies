/**
 * Background Panels Component
 *
 * Creates textured background panels with parallax layers for proper diorama depth.
 * - Foreground: Hex tiles + character (in main scene)
 * - Midground: Left/right wall panels (building facades)
 * - Background: Parallax far skyline + mid city layers
 */

import {
	Color3,
	MeshBuilder,
	StandardMaterial,
	Texture,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import type { AbstractMesh, Material } from "@babylonjs/core";

export type BackgroundTheme = "neon" | "dark" | "sunset";

export interface BackgroundPanelsProps {
	minX: number;
	maxX: number;
	height?: number;
	theme?: BackgroundTheme;
	/** Sector for asset paths (default: sector0) */
	sector?: string;
}

/**
 * Theme tint colors for when textures fail to load
 */
const THEME_TINTS: Record<BackgroundTheme, Color3> = {
	neon: new Color3(0.3, 0.1, 0.5), // Purple-blue neon
	dark: new Color3(0.1, 0.1, 0.15), // Very dark blue
	sunset: new Color3(0.4, 0.2, 0.15), // Orange-red sunset
};

/**
 * Emissive intensity by theme
 */
const THEME_EMISSIVE: Record<BackgroundTheme, number> = {
	neon: 0.3,
	dark: 0.05,
	sunset: 0.15,
};

export function BackgroundPanels({
	minX,
	maxX,
	height = 30,
	theme = "neon",
	sector = "sector0",
}: BackgroundPanelsProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);
	const materialsRef = useRef<Material[]>([]);

	useEffect(() => {
		if (!scene) return;

		const tint = THEME_TINTS[theme];
		const emissiveIntensity = THEME_EMISSIVE[theme];
		const meshes: AbstractMesh[] = [];
		const materials: Material[] = [];

		// Calculate dimensions based on isometric view
		// Camera looks from above-behind, so "back" is visually at top of screen
		const sceneWidth = maxX - minX;

		// ===== PARALLAX FAR LAYER (Distant Skyline) =====
		// Positioned far back, visible above the play area as horizon
		const farWidth = sceneWidth * 3;
		const farHeight = height * 0.6;
		const farPanel = MeshBuilder.CreatePlane(
			"parallaxFar",
			{ width: farWidth, height: farHeight },
			scene,
		);
		// Position far behind, high up as distant skyline
		farPanel.position = new Vector3(0, farHeight * 0.8 + 5, -60);
		farPanel.rotation.x = -Math.PI / 12; // Slight tilt toward camera

		const farMaterial = new StandardMaterial("parallaxFarMat", scene);
		farMaterial.diffuseTexture = new Texture(
			`/assets/backgrounds/${sector}/parallax_far/concept.png`,
			scene,
		);
		farMaterial.diffuseTexture.hasAlpha = false;
		farMaterial.specularColor = new Color3(0, 0, 0);
		farMaterial.emissiveColor = tint.scale(emissiveIntensity * 0.8);
		farMaterial.backFaceCulling = false;
		farPanel.material = farMaterial;
		meshes.push(farPanel);
		materials.push(farMaterial);

		// ===== PARALLAX MID LAYER (Mid-distance Buildings) =====
		const midWidth = sceneWidth * 2.5;
		const midHeight = height * 0.5;
		const midPanel = MeshBuilder.CreatePlane(
			"parallaxMid",
			{ width: midWidth, height: midHeight },
			scene,
		);
		// Position mid-distance, between far and play area
		midPanel.position = new Vector3(0, midHeight * 0.6 + 3, -45);
		midPanel.rotation.x = -Math.PI / 16; // Slight tilt

		const midMaterial = new StandardMaterial("parallaxMidMat", scene);
		midMaterial.diffuseTexture = new Texture(
			`/assets/backgrounds/${sector}/parallax_mid/concept.png`,
			scene,
		);
		midMaterial.diffuseTexture.hasAlpha = false;
		midMaterial.specularColor = new Color3(0, 0, 0);
		midMaterial.emissiveColor = tint.scale(emissiveIntensity);
		midMaterial.backFaceCulling = false;
		midPanel.material = midMaterial;
		meshes.push(midPanel);
		materials.push(midMaterial);

		// ===== LEFT WALL PANEL (Building Facade) =====
		// 9:16 vertical building facade on left edge, far back
		const wallHeight = height * 0.7;
		const wallWidth = wallHeight * (9 / 16);

		const leftPanel = MeshBuilder.CreatePlane(
			"wallLeft",
			{ width: wallWidth, height: wallHeight },
			scene,
		);
		// Position on left side, far back to not occlude play area
		leftPanel.position = new Vector3(minX - 15, wallHeight * 0.35, -30);
		leftPanel.rotation.y = Math.PI / 5; // Slight angle facing into scene

		const leftMaterial = new StandardMaterial("wallLeftMat", scene);
		leftMaterial.diffuseTexture = new Texture(
			`/assets/backgrounds/${sector}/wall_left/concept.png`,
			scene,
		);
		leftMaterial.diffuseTexture.hasAlpha = false;
		leftMaterial.specularColor = new Color3(0, 0, 0);
		leftMaterial.emissiveColor = tint.scale(emissiveIntensity * 1.2);
		leftMaterial.backFaceCulling = false;
		leftPanel.material = leftMaterial;
		meshes.push(leftPanel);
		materials.push(leftMaterial);

		// ===== RIGHT WALL PANEL (Building Facade) =====
		const rightPanel = MeshBuilder.CreatePlane(
			"wallRight",
			{ width: wallWidth, height: wallHeight },
			scene,
		);
		// Mirror position on right side, far back
		rightPanel.position = new Vector3(maxX + 15, wallHeight * 0.35, -30);
		rightPanel.rotation.y = -Math.PI / 5; // Mirrored angle

		const rightMaterial = new StandardMaterial("wallRightMat", scene);
		rightMaterial.diffuseTexture = new Texture(
			`/assets/backgrounds/${sector}/wall_right/concept.png`,
			scene,
		);
		rightMaterial.diffuseTexture.hasAlpha = false;
		rightMaterial.specularColor = new Color3(0, 0, 0);
		rightMaterial.emissiveColor = tint.scale(emissiveIntensity * 1.2);
		rightMaterial.backFaceCulling = false;
		rightPanel.material = rightMaterial;
		meshes.push(rightPanel);
		materials.push(rightMaterial);

		// ===== ROOFTOP EDGE / BACK BARRIER =====
		// Positioned between play area and mid-parallax, frames the scene
		const backWidth = sceneWidth * 1.5;
		const backHeight = height * 0.35;
		const backPanel = MeshBuilder.CreatePlane(
			"rooftopEdge",
			{ width: backWidth, height: backHeight },
			scene,
		);
		// Position behind play area but in front of parallax layers
		backPanel.position = new Vector3(0, backHeight * 0.3 + 1, -32);
		backPanel.rotation.x = -Math.PI / 10; // Tilt to face camera

		const backMaterial = new StandardMaterial("rooftopEdgeMat", scene);
		backMaterial.diffuseTexture = new Texture(
			`/assets/backgrounds/${sector}/rooftop/concept.png`,
			scene,
		);
		backMaterial.diffuseTexture.hasAlpha = false;
		backMaterial.specularColor = new Color3(0, 0, 0);
		backMaterial.emissiveColor = tint.scale(emissiveIntensity * 0.9);
		backMaterial.backFaceCulling = false;
		backPanel.material = backMaterial;
		meshes.push(backPanel);
		materials.push(backMaterial);

		// Store refs for cleanup
		meshesRef.current = meshes;
		materialsRef.current = materials;

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			for (const mat of materialsRef.current) {
				mat.dispose();
			}
			meshesRef.current = [];
			materialsRef.current = [];
		};
	}, [scene, minX, maxX, height, theme, sector]);

	return null;
}
