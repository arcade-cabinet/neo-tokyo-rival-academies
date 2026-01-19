/**
 * NeonSign - Salvaged pre-flood signage component
 *
 * FACTION CONTEXT (v2.0 Flooded World):
 * In the flooded world, electricity is a scarce luxury. Most survivors live
 * pre-industrial lives governed by day/night cycles, using lanterns and bonfires.
 *
 * Neon signs are SALVAGED PRE-FLOOD LUXURY ITEMS that require:
 * - Hoarded solar panels (traded like gold)
 * - Battery banks (rare)
 * - Generators (rarer, fuel even more so)
 *
 * Running neon at night is an OBSCENE DISPLAY of hoarded resources.
 * It signals: "We have power. We have control. Fear us."
 *
 * FACTION AFFINITY:
 * - Syndicate (HIGH): Territory markers, gambling dens, black market
 * - Collective (LOW): Black market zones only
 * - Academy (RARE): Special occasions, championship events
 * - Others (NONE): Can't afford the power expenditure
 *
 * GAMEPLAY SIGNALS:
 * - Controlled territory (criminal activity)
 * - Trade opportunity (black market goods)
 * - Danger zone (enter at your own risk)
 * - Quest giver nearby (Syndicate contacts)
 *
 * See: docs/MODULAR_ASSEMBLY_SYSTEM.md
 * GitHub Issue: #64
 *
 * Uses high emissive for bloom interaction.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export type NeonShape = "rectangle" | "circle" | "arrow" | "bar" | "kanji" | "skull";
export type NeonMountType = "wall" | "pole" | "hanging" | "ground";
export type NeonFaction = "syndicate" | "collective" | "academy" | "neutral";

export interface NeonSignProps {
	/** Unique identifier */
	id: string;
	/** Position */
	position: Vector3;
	/** Primary glow color */
	color: Color3;
	/** Sign shape */
	shape?: NeonShape;
	/** Sign dimensions */
	size?: { width: number; height: number };
	/** Tube thickness */
	thickness?: number;
	/** Rotation (Y axis, radians) */
	rotation?: number;
	/** Mount type (affects supporting structure) */
	mount?: NeonMountType;
	/** Glow intensity multiplier */
	intensity?: number;
	/** Secondary color (for multi-color signs) */
	secondaryColor?: Color3 | null;
	/** Flicker effect */
	flicker?: boolean;
	/** Faction affiliation (affects color and style defaults) */
	faction?: NeonFaction;
	/** Is sign powered/lit */
	isPowered?: boolean;
	/** Callback when mesh is ready */
	onReady?: (mesh: AbstractMesh) => void;
}

/**
 * NeonSign component
 *
 * Displays salvaged pre-flood neon signage. Use sparingly - only in
 * Syndicate territory and black market zones. The mere presence of
 * powered neon signals wealth, crime, and danger to players.
 */
export function NeonSign({
	id,
	position,
	color,
	shape = "rectangle",
	size = { width: 2, height: 1 },
	thickness = 0.08,
	rotation = 0,
	mount = "wall",
	intensity = 3.0,
	secondaryColor = null,
	flicker = false,
	onReady,
}: NeonSignProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];

		// Create neon material
		const createNeonMaterial = (neonColor: Color3, matId: string) => {
			const mat = new PBRMaterial(`neonMat_${id}_${matId}`, scene);
			mat.albedoColor = neonColor;
			mat.emissiveColor = neonColor.scale(2.5);
			mat.emissiveIntensity = intensity;
			mat.unlit = true;
			return mat;
		};

		const primaryMat = createNeonMaterial(color, "primary");
		const secondaryMat = secondaryColor ? createNeonMaterial(secondaryColor, "secondary") : primaryMat;

		// Parent container for rotation
		const container = MeshBuilder.CreateBox(
			`neonContainer_${id}`,
			{ width: 0.01, height: 0.01, depth: 0.01 },
			scene
		);
		container.position = position.clone();
		container.rotation.y = rotation;
		container.isVisible = false;
		meshes.push(container);

		// Create shape-specific geometry
		switch (shape) {
			case "rectangle": {
				// Four tube segments forming a rectangle
				const halfW = size.width / 2;
				const halfH = size.height / 2;

				// Top
				const top = MeshBuilder.CreateCylinder(
					`neon_${id}_top`,
					{ diameter: thickness, height: size.width },
					scene
				);
				top.position = new Vector3(0, halfH, 0);
				top.rotation.z = Math.PI / 2;
				top.material = primaryMat;
				top.parent = container;
				meshes.push(top);

				// Bottom
				const bottom = MeshBuilder.CreateCylinder(
					`neon_${id}_bottom`,
					{ diameter: thickness, height: size.width },
					scene
				);
				bottom.position = new Vector3(0, -halfH, 0);
				bottom.rotation.z = Math.PI / 2;
				bottom.material = secondaryMat;
				bottom.parent = container;
				meshes.push(bottom);

				// Left
				const left = MeshBuilder.CreateCylinder(
					`neon_${id}_left`,
					{ diameter: thickness, height: size.height },
					scene
				);
				left.position = new Vector3(-halfW, 0, 0);
				left.material = primaryMat;
				left.parent = container;
				meshes.push(left);

				// Right
				const right = MeshBuilder.CreateCylinder(
					`neon_${id}_right`,
					{ diameter: thickness, height: size.height },
					scene
				);
				right.position = new Vector3(halfW, 0, 0);
				right.material = secondaryMat;
				right.parent = container;
				meshes.push(right);
				break;
			}

			case "circle": {
				const torus = MeshBuilder.CreateTorus(
					`neon_${id}_circle`,
					{
						diameter: size.width,
						thickness: thickness,
						tessellation: 32,
					},
					scene
				);
				torus.rotation.x = Math.PI / 2;
				torus.material = primaryMat;
				torus.parent = container;
				meshes.push(torus);
				break;
			}

			case "arrow": {
				// Arrow pointing right (→)
				const shaftLength = size.width * 0.7;
				const headSize = size.width * 0.3;

				// Shaft
				const shaft = MeshBuilder.CreateCylinder(
					`neon_${id}_shaft`,
					{ diameter: thickness, height: shaftLength },
					scene
				);
				shaft.position = new Vector3(-headSize / 2, 0, 0);
				shaft.rotation.z = Math.PI / 2;
				shaft.material = primaryMat;
				shaft.parent = container;
				meshes.push(shaft);

				// Arrow head - top diagonal
				const headTop = MeshBuilder.CreateCylinder(
					`neon_${id}_headTop`,
					{ diameter: thickness, height: headSize * 0.8 },
					scene
				);
				headTop.position = new Vector3(shaftLength / 2 - headSize * 0.2, headSize * 0.25, 0);
				headTop.rotation.z = Math.PI / 4;
				headTop.material = secondaryMat;
				headTop.parent = container;
				meshes.push(headTop);

				// Arrow head - bottom diagonal
				const headBottom = MeshBuilder.CreateCylinder(
					`neon_${id}_headBottom`,
					{ diameter: thickness, height: headSize * 0.8 },
					scene
				);
				headBottom.position = new Vector3(shaftLength / 2 - headSize * 0.2, -headSize * 0.25, 0);
				headBottom.rotation.z = -Math.PI / 4;
				headBottom.material = secondaryMat;
				headBottom.parent = container;
				meshes.push(headBottom);
				break;
			}

			case "bar": {
				// Simple horizontal or vertical bar
				const bar = MeshBuilder.CreateCylinder(
					`neon_${id}_bar`,
					{ diameter: thickness, height: size.width },
					scene
				);
				bar.rotation.z = Math.PI / 2;
				bar.material = primaryMat;
				bar.parent = container;
				meshes.push(bar);
				break;
			}
		}

		// Mount structure
		if (mount === "pole") {
			const poleMat = new PBRMaterial(`poleMat_${id}`, scene);
			poleMat.albedoColor = new Color3(0.2, 0.2, 0.22);
			poleMat.metallic = 0.5;
			poleMat.roughness = 0.6;

			const pole = MeshBuilder.CreateCylinder(
				`pole_${id}`,
				{ diameter: 0.1, height: 3 },
				scene
			);
			pole.position = new Vector3(0, -size.height / 2 - 1.5, 0.1);
			pole.material = poleMat;
			pole.parent = container;
			meshes.push(pole);
		} else if (mount === "hanging") {
			const wireMat = new PBRMaterial(`wireMat_${id}`, scene);
			wireMat.albedoColor = new Color3(0.15, 0.15, 0.15);
			wireMat.metallic = 0.3;

			const wire = MeshBuilder.CreateCylinder(
				`wire_${id}`,
				{ diameter: 0.02, height: 1 },
				scene
			);
			wire.position = new Vector3(0, size.height / 2 + 0.5, 0);
			wire.material = wireMat;
			wire.parent = container;
			meshes.push(wire);
		} else if (mount === "wall") {
			// Small backing plate
			const backMat = new PBRMaterial(`backMat_${id}`, scene);
			backMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			backMat.metallic = 0.2;

			const back = MeshBuilder.CreateBox(
				`back_${id}`,
				{
					width: size.width * 0.8,
					height: size.height * 0.6,
					depth: 0.05,
				},
				scene
			);
			back.position = new Vector3(0, 0, 0.1);
			back.material = backMat;
			back.parent = container;
			meshes.push(back);
		}

		meshesRef.current = meshes;

		if (onReady) {
			onReady(container);
		}

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [scene, id, position, color, shape, size, thickness, rotation, mount, intensity, secondaryColor, flicker, onReady]);

	return null;
}

/**
 * Faction color schemes
 */
export const FACTION_COLORS: Record<NeonFaction, { primary: Color3; secondary: Color3 }> = {
	syndicate: {
		primary: new Color3(1, 0, 0.3),      // Crimson red
		secondary: new Color3(1, 0.5, 0),    // Orange warning
	},
	collective: {
		primary: new Color3(0.2, 0.8, 0.4),  // Green (community)
		secondary: new Color3(0.9, 0.9, 0.3), // Yellow
	},
	academy: {
		primary: new Color3(0, 0.6, 1),      // Academy blue
		secondary: new Color3(1, 1, 1),       // White
	},
	neutral: {
		primary: new Color3(0.8, 0.8, 0.8),  // Grey
		secondary: new Color3(0.5, 0.5, 0.5),
	},
};

/**
 * Preset neon sign configurations
 */
export const NEON_PRESETS = {
	// === SYNDICATE TERRITORY MARKERS ===
	syndicate_territory: {
		shape: "rectangle" as NeonShape,
		size: { width: 2, height: 1.5 },
		color: FACTION_COLORS.syndicate.primary,
		secondaryColor: FACTION_COLORS.syndicate.secondary,
		mount: "wall" as NeonMountType,
		faction: "syndicate" as NeonFaction,
		intensity: 4.0,
	},
	syndicate_warning: {
		shape: "arrow" as NeonShape,
		size: { width: 1.5, height: 0.8 },
		color: FACTION_COLORS.syndicate.secondary,
		mount: "pole" as NeonMountType,
		faction: "syndicate" as NeonFaction,
		flicker: true,
	},
	syndicate_entrance: {
		shape: "circle" as NeonShape,
		size: { width: 1.2, height: 1.2 },
		color: FACTION_COLORS.syndicate.primary,
		mount: "hanging" as NeonMountType,
		faction: "syndicate" as NeonFaction,
	},
	// === BLACK MARKET (COLLECTIVE) ===
	black_market: {
		shape: "bar" as NeonShape,
		size: { width: 2.5, height: 0.1 },
		color: FACTION_COLORS.collective.primary,
		mount: "wall" as NeonMountType,
		faction: "collective" as NeonFaction,
		intensity: 2.0,
	},
	// === ACADEMY (RARE EVENTS) ===
	academy_event: {
		shape: "rectangle" as NeonShape,
		size: { width: 3, height: 2 },
		color: FACTION_COLORS.academy.primary,
		secondaryColor: FACTION_COLORS.academy.secondary,
		mount: "pole" as NeonMountType,
		faction: "academy" as NeonFaction,
	},
	// === LEGACY PRESETS (backward compat) ===
	kanji_frame: {
		shape: "rectangle" as NeonShape,
		size: { width: 1.5, height: 2 },
		color: new Color3(1, 0, 0.3),
		mount: "wall" as NeonMountType,
	},
	direction: {
		shape: "arrow" as NeonShape,
		size: { width: 1.5, height: 0.8 },
		color: new Color3(0, 1, 0.5),
		mount: "pole" as NeonMountType,
	},
	open_circle: {
		shape: "circle" as NeonShape,
		size: { width: 1, height: 1 },
		color: new Color3(0, 0.8, 1),
		mount: "hanging" as NeonMountType,
	},
	accent_bar: {
		shape: "bar" as NeonShape,
		size: { width: 3, height: 0.1 },
		color: new Color3(1, 0.5, 0),
		mount: "wall" as NeonMountType,
	},
};
