/**
 * DockingStation - Entry/exit point for rail-based transport
 *
 * Reusable for:
 * - Ferry docks (building edge over water)
 * - Elevator stops (floor landings)
 * - Gondola stations
 * - Platform waypoints
 *
 * Provides visual indicator and alignment point for platforms.
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

export type DockType = "ferry" | "elevator" | "gondola" | "platform";

export interface DockingStationProps {
	/** Unique identifier */
	id: string;
	/** Station position (center of dock surface) */
	position: Vector3;
	/** Dock dimensions */
	size: { width: number; depth: number };
	/** Type of dock (affects visuals) */
	dockType?: DockType;
	/** Direction platform approaches from (degrees, 0 = +Z) */
	approachAngle?: number;
	/** Show waiting area marking */
	waitingArea?: boolean;
	/** Neon edge color */
	neonColor?: Color3;
	/** Callback when mesh is ready */
	onReady?: (mesh: AbstractMesh) => void;
}

// Visual configurations per dock type
const DOCK_CONFIG: Record<DockType, {
	baseColor: Color3;
	accentColor: Color3;
	hasCanopy: boolean;
}> = {
	ferry: {
		baseColor: new Color3(0.3, 0.32, 0.35),
		accentColor: new Color3(0, 0.8, 1),
		hasCanopy: false,
	},
	elevator: {
		baseColor: new Color3(0.25, 0.25, 0.28),
		accentColor: new Color3(1, 0.8, 0),
		hasCanopy: true,
	},
	gondola: {
		baseColor: new Color3(0.28, 0.28, 0.3),
		accentColor: new Color3(1, 0, 0.5),
		hasCanopy: true,
	},
	platform: {
		baseColor: new Color3(0.35, 0.35, 0.38),
		accentColor: new Color3(0, 1, 0.5),
		hasCanopy: false,
	},
};

/**
 * DockingStation component
 */
export function DockingStation({
	id,
	position,
	size,
	dockType = "ferry",
	approachAngle = 0,
	waitingArea = true,
	neonColor,
	onReady,
}: DockingStationProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);
	const materialsRef = useRef<Material[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const materials: Material[] = [];
		const config = DOCK_CONFIG[dockType];
		const rotation = (approachAngle * Math.PI) / 180;
		const effectiveNeonColor = neonColor || config.accentColor;

		// Main dock platform
		const dockPlatform = MeshBuilder.CreateBox(
			`dock_${id}`,
			{
				width: size.width,
				height: 0.15,
				depth: size.depth,
			},
			scene
		);

		dockPlatform.position = position.clone();
		dockPlatform.position.y += 0.075;
		dockPlatform.rotation.y = rotation;

		const dockMat = new PBRMaterial(`dockMat_${id}`, scene);
		dockMat.albedoColor = config.baseColor;
		dockMat.roughness = 0.6;
		dockMat.metallic = 0.3;
		materials.push(dockMat);

		dockPlatform.material = dockMat;
		meshes.push(dockPlatform);

		// Edge lighting strips
		const edgeHeight = 0.08;
		const edgeWidth = 0.06;

		// Approach edge (where platform docks) - use LOCAL coordinates since it's parented
		const approachEdge = MeshBuilder.CreateBox(
			`dockEdge_${id}_approach`,
			{
				width: size.width,
				height: edgeHeight,
				depth: edgeWidth,
			},
			scene
		);
		// Local position relative to parent
		approachEdge.position = new Vector3(0, 0.075 + edgeHeight / 2, size.depth / 2);

		const neonMat = new PBRMaterial(`neonMat_${id}`, scene);
		neonMat.albedoColor = effectiveNeonColor;
		neonMat.emissiveColor = effectiveNeonColor.scale(2.5);
		neonMat.emissiveIntensity = 3.0;
		neonMat.unlit = true;
		materials.push(neonMat);

		approachEdge.material = neonMat;
		approachEdge.parent = dockPlatform;
		meshes.push(approachEdge);

		// Side edges - use LOCAL coordinates since they're parented
		const sideEdgeLeft = MeshBuilder.CreateBox(
			`dockEdge_${id}_left`,
			{
				width: edgeWidth,
				height: edgeHeight,
				depth: size.depth,
			},
			scene
		);
		sideEdgeLeft.position = new Vector3(-size.width / 2, 0.075 + edgeHeight / 2, 0);
		sideEdgeLeft.material = neonMat;
		sideEdgeLeft.parent = dockPlatform;
		meshes.push(sideEdgeLeft);

		const sideEdgeRight = MeshBuilder.CreateBox(
			`dockEdge_${id}_right`,
			{
				width: edgeWidth,
				height: edgeHeight,
				depth: size.depth,
			},
			scene
		);
		sideEdgeRight.position = new Vector3(size.width / 2, 0.075 + edgeHeight / 2, 0);
		sideEdgeRight.material = neonMat;
		sideEdgeRight.parent = dockPlatform;
		meshes.push(sideEdgeRight);

		// Waiting area marking (striped pattern on dock) - use LOCAL coordinates
		if (waitingArea) {
			const waitingMarker = MeshBuilder.CreateBox(
				`waiting_${id}`,
				{
					width: size.width * 0.6,
					height: 0.02,
					depth: size.depth * 0.4,
				},
				scene
			);
			waitingMarker.position = new Vector3(0, 0.085, -size.depth * 0.2);

			const waitingMat = new PBRMaterial(`waitingMat_${id}`, scene);
			waitingMat.albedoColor = effectiveNeonColor.scale(0.3);
			waitingMat.emissiveColor = effectiveNeonColor.scale(0.5);
			waitingMat.emissiveIntensity = 1.0;
			waitingMat.alpha = 0.7;
			waitingMat.transparencyMode = 2;
			materials.push(waitingMat);

			waitingMarker.material = waitingMat;
			waitingMarker.parent = dockPlatform;
			meshes.push(waitingMarker);
		}

		// Safety bollards at corners - use LOCAL coordinates
		const bollardPositions = [
			new Vector3(-size.width / 2 + 0.15, 0, -size.depth / 2 + 0.15),
			new Vector3(size.width / 2 - 0.15, 0, -size.depth / 2 + 0.15),
		];

		const bollardMat = new PBRMaterial(`bollardMat_${id}`, scene);
		bollardMat.albedoColor = new Color3(0.8, 0.6, 0);
		bollardMat.roughness = 0.4;
		bollardMat.metallic = 0.2;
		materials.push(bollardMat);

		bollardPositions.forEach((pos, i) => {
			const bollard = MeshBuilder.CreateCylinder(
				`bollard_${id}_${i}`,
				{ diameter: 0.15, height: 0.8 },
				scene
			);
			bollard.position = new Vector3(pos.x, 0.475, pos.z);
			bollard.material = bollardMat;
			bollard.parent = dockPlatform;
			meshes.push(bollard);
		});

		meshesRef.current = meshes;
		materialsRef.current = materials;

		if (onReady) {
			onReady(dockPlatform);
		}

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
	}, [scene, id, position, size, dockType, approachAngle, waitingArea, neonColor, onReady]);

	return null;
}
