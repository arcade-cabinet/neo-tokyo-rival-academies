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
	/** Station name/label (for UI) */
	label?: string;
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
	label,
	onReady,
}: DockingStationProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
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

		dockPlatform.material = dockMat;
		meshes.push(dockPlatform);

		// Edge lighting strips
		const edgeHeight = 0.08;
		const edgeWidth = 0.06;

		// Approach edge (where platform docks)
		const approachEdge = MeshBuilder.CreateBox(
			`dockEdge_${id}_approach`,
			{
				width: size.width,
				height: edgeHeight,
				depth: edgeWidth,
			},
			scene
		);
		approachEdge.position = new Vector3(
			position.x,
			position.y + 0.15 + edgeHeight / 2,
			position.z + size.depth / 2
		);
		approachEdge.rotation.y = rotation;

		const neonMat = new PBRMaterial(`neonMat_${id}`, scene);
		neonMat.albedoColor = effectiveNeonColor;
		neonMat.emissiveColor = effectiveNeonColor.scale(2.5);
		neonMat.emissiveIntensity = 3.0;
		neonMat.unlit = true;

		approachEdge.material = neonMat;
		approachEdge.parent = dockPlatform;
		meshes.push(approachEdge);

		// Side edges
		const sideEdgeLeft = MeshBuilder.CreateBox(
			`dockEdge_${id}_left`,
			{
				width: edgeWidth,
				height: edgeHeight,
				depth: size.depth,
			},
			scene
		);
		sideEdgeLeft.position = new Vector3(
			position.x - size.width / 2,
			position.y + 0.15 + edgeHeight / 2,
			position.z
		);
		sideEdgeLeft.rotation.y = rotation;
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
		sideEdgeRight.position = new Vector3(
			position.x + size.width / 2,
			position.y + 0.15 + edgeHeight / 2,
			position.z
		);
		sideEdgeRight.rotation.y = rotation;
		sideEdgeRight.material = neonMat;
		sideEdgeRight.parent = dockPlatform;
		meshes.push(sideEdgeRight);

		// Waiting area marking (striped pattern on dock)
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
			waitingMarker.position = new Vector3(
				position.x,
				position.y + 0.16,
				position.z - size.depth * 0.2
			);
			waitingMarker.rotation.y = rotation;

			const waitingMat = new PBRMaterial(`waitingMat_${id}`, scene);
			waitingMat.albedoColor = effectiveNeonColor.scale(0.3);
			waitingMat.emissiveColor = effectiveNeonColor.scale(0.5);
			waitingMat.emissiveIntensity = 1.0;
			waitingMat.alpha = 0.7;
			waitingMat.transparencyMode = 2;

			waitingMarker.material = waitingMat;
			waitingMarker.parent = dockPlatform;
			meshes.push(waitingMarker);
		}

		// Safety bollards at corners
		const bollardPositions = [
			new Vector3(-size.width / 2 + 0.15, 0, -size.depth / 2 + 0.15),
			new Vector3(size.width / 2 - 0.15, 0, -size.depth / 2 + 0.15),
		];

		const bollardMat = new PBRMaterial(`bollardMat_${id}`, scene);
		bollardMat.albedoColor = new Color3(0.8, 0.6, 0);
		bollardMat.roughness = 0.4;
		bollardMat.metallic = 0.2;

		bollardPositions.forEach((pos, i) => {
			const bollard = MeshBuilder.CreateCylinder(
				`bollard_${id}_${i}`,
				{ diameter: 0.15, height: 0.8 },
				scene
			);
			bollard.position = new Vector3(
				position.x + pos.x,
				position.y + 0.55,
				position.z + pos.z
			);
			bollard.material = bollardMat;
			bollard.parent = dockPlatform;
			meshes.push(bollard);
		});

		meshesRef.current = meshes;

		if (onReady) {
			onReady(dockPlatform);
		}

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [scene, id, position, size, dockType, approachAngle, waitingArea, neonColor, label, onReady]);

	return null;
}

export default DockingStation;
