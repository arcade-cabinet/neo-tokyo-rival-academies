/**
 * BlockRenderer - Visualizes block definitions in the scene
 *
 * Renders:
 * - Block footprint (debug box or actual geometry)
 * - Snap points (colored spheres/arrows showing connection points)
 * - Connection lines between snapped blocks
 */

import {
	type AbstractMesh,
	Color3,
	MeshBuilder,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import type {
	BlockDefinition,
	BlockInstance,
	SnapDirection,
	SnapPoint,
} from "./Block";
import { GRID_UNIT_SIZE } from "./Block";

// ============================================================================
// SNAP POINT VISUALIZER
// ============================================================================

interface SnapPointVisualizerProps {
	id: string;
	snapPoint: SnapPoint;
	blockPosition: Vector3;
	blockRotation: number;
	showLabels?: boolean;
}

/**
 * Visualizes a single snap point as a colored indicator
 */
export function SnapPointVisualizer({
	id,
	snapPoint,
	blockPosition,
	blockRotation,
	_showLabels = false,
}: SnapPointVisualizerProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh | null>(null);

	useEffect(() => {
		if (!scene) return;

		// Calculate world position of snap point
		const local = snapPoint.localPosition;

		// Apply block rotation to local position
		const cos = Math.cos(blockRotation);
		const sin = Math.sin(blockRotation);
		const rotatedX = local.x * cos - local.z * sin;
		const rotatedZ = local.x * sin + local.z * cos;

		const worldPos = new Vector3(
			blockPosition.x + rotatedX,
			blockPosition.y + local.y,
			blockPosition.z + rotatedZ,
		);

		// Color based on snap type
		const typeColors: Record<string, Color3> = {
			floor_edge: new Color3(0, 1, 0.5), // Cyan-green
			wall_doorway: new Color3(1, 0.5, 0), // Orange
			ramp_top: new Color3(1, 1, 0), // Yellow
			ramp_bottom: new Color3(0.5, 1, 0), // Lime
			connector: new Color3(0.5, 0.5, 1), // Light blue
			water_edge: new Color3(0, 0.5, 1), // Blue
		};

		const color = typeColors[snapPoint.type] || new Color3(1, 1, 1);

		// Create indicator mesh
		const indicator = MeshBuilder.CreateSphere(
			`snap_${id}_${snapPoint.id}`,
			{ diameter: 0.4 },
			scene,
		);
		indicator.position = worldPos;

		// Create material
		const mat = new StandardMaterial(`snapMat_${id}_${snapPoint.id}`, scene);
		mat.diffuseColor = color;
		mat.emissiveColor = color.scale(0.5);
		mat.alpha = 0.8;
		indicator.material = mat;

		// Create direction arrow
		const directionOffsets: Record<SnapDirection, Vector3> = {
			north: new Vector3(0, 0, -0.6),
			south: new Vector3(0, 0, 0.6),
			east: new Vector3(0.6, 0, 0),
			west: new Vector3(-0.6, 0, 0),
			up: new Vector3(0, 0.6, 0),
			down: new Vector3(0, -0.6, 0),
		};

		// Rotate direction offset by block rotation
		const dirOffset = directionOffsets[snapPoint.direction];
		const rotatedDirX = dirOffset.x * cos - dirOffset.z * sin;
		const rotatedDirZ = dirOffset.x * sin + dirOffset.z * cos;

		const arrow = MeshBuilder.CreateCylinder(
			`arrow_${id}_${snapPoint.id}`,
			{ height: 0.4, diameterTop: 0, diameterBottom: 0.2 },
			scene,
		);
		arrow.position = worldPos.add(
			new Vector3(rotatedDirX, dirOffset.y, rotatedDirZ),
		);

		// Rotate arrow to point in direction
		if (snapPoint.direction === "up") {
			// Already pointing up
		} else if (snapPoint.direction === "down") {
			arrow.rotation.z = Math.PI;
		} else {
			arrow.rotation.x = Math.PI / 2;
			const dirAngles: Record<SnapDirection, number> = {
				north: 0,
				south: Math.PI,
				east: -Math.PI / 2,
				west: Math.PI / 2,
				up: 0,
				down: 0,
			};
			arrow.rotation.y = dirAngles[snapPoint.direction] + blockRotation;
		}

		arrow.material = mat;
		arrow.parent = indicator;

		meshRef.current = indicator;

		return () => {
			if (meshRef.current) {
				meshRef.current.dispose();
			}
		};
	}, [scene, id, snapPoint, blockPosition, blockRotation]);

	return null;
}

// ============================================================================
// BLOCK DEBUG RENDERER
// ============================================================================

interface BlockDebugRendererProps {
	id: string;
	definition: BlockDefinition;
	position: Vector3;
	rotation?: number;
	showSnapPoints?: boolean;
	opacity?: number;
}

/**
 * Renders a block as a debug visualization (colored box + snap points)
 */
export function BlockDebugRenderer({
	id,
	definition,
	position,
	rotation = 0,
	showSnapPoints = true,
	opacity = 0.3,
}: BlockDebugRendererProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh | null>(null);

	useEffect(() => {
		if (!scene) return;

		const { width, height, depth } = definition.dimensions;
		const debugColor = definition.debugColor || { r: 0.5, g: 0.5, b: 0.5 };

		// Create box representing block footprint
		const box = MeshBuilder.CreateBox(
			`block_debug_${id}`,
			{ width, height: Math.max(height, 0.5), depth },
			scene,
		);

		box.position = position.clone();
		box.position.y += Math.max(height, 0.5) / 2;
		box.rotation.y = rotation;

		// Debug material
		const mat = new StandardMaterial(`blockDebugMat_${id}`, scene);
		mat.diffuseColor = new Color3(debugColor.r, debugColor.g, debugColor.b);
		mat.alpha = opacity;
		mat.backFaceCulling = false;

		box.material = mat;
		meshRef.current = box;

		return () => {
			if (meshRef.current) {
				meshRef.current.dispose();
			}
		};
	}, [scene, id, definition, position, rotation, opacity]);

	return (
		<>
			{showSnapPoints &&
				definition.snapPoints.map((snap) => (
					<SnapPointVisualizer
						key={`${id}_snap_${snap.id}`}
						id={id}
						snapPoint={snap}
						blockPosition={position}
						blockRotation={rotation}
					/>
				))}
		</>
	);
}

// ============================================================================
// BLOCK INSTANCE RENDERER
// ============================================================================

interface BlockInstanceRendererProps {
	instance: BlockInstance;
	debugMode?: boolean;
}

/**
 * Renders a placed block instance
 * In debug mode: shows colored box + snap points
 * In normal mode: would render actual geometry (TODO)
 */
export function BlockInstanceRenderer({
	instance,
	debugMode = true,
}: BlockInstanceRendererProps) {
	const position = new Vector3(
		instance.position.x,
		instance.position.y,
		instance.position.z,
	);

	const rotationRad = (instance.rotation * Math.PI) / 180;

	if (debugMode) {
		return (
			<BlockDebugRenderer
				id={instance.instanceId}
				definition={instance.definition}
				position={position}
				rotation={rotationRad}
				showSnapPoints={true}
			/>
		);
	}

	// TODO: Render actual block geometry based on definition
	// This would use the actual primitives (Floor, TexturedWall, etc.)
	return (
		<BlockDebugRenderer
			id={instance.instanceId}
			definition={instance.definition}
			position={position}
			rotation={rotationRad}
			showSnapPoints={false}
			opacity={0.8}
		/>
	);
}

// ============================================================================
// GRID VISUALIZER
// ============================================================================

interface GridVisualizerProps {
	id: string;
	gridSize?: number;
	cellCount?: number;
	position?: Vector3;
	color?: Color3;
}

/**
 * Visualizes the block grid for debugging placement
 */
export function GridVisualizer({
	id,
	gridSize = GRID_UNIT_SIZE,
	cellCount = 8,
	position = Vector3.Zero(),
	color = new Color3(0.3, 0.3, 0.3),
}: GridVisualizerProps) {
	const scene = useScene();
	const linesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const lines: AbstractMesh[] = [];
		const totalSize = gridSize * cellCount;
		const halfSize = totalSize / 2;

		// Create grid lines
		for (let i = 0; i <= cellCount; i++) {
			const offset = -halfSize + i * gridSize;
			const isMajor = i === 0 || i === cellCount || i === cellCount / 2;
			const alpha = isMajor ? 0.6 : 0.3;

			// X-axis line
			const lineX = MeshBuilder.CreateLines(
				`grid_${id}_x_${i}`,
				{
					points: [
						new Vector3(position.x - halfSize, position.y, position.z + offset),
						new Vector3(position.x + halfSize, position.y, position.z + offset),
					],
				},
				scene,
			);
			lineX.color = color;
			lineX.alpha = alpha;
			lines.push(lineX);

			// Z-axis line
			const lineZ = MeshBuilder.CreateLines(
				`grid_${id}_z_${i}`,
				{
					points: [
						new Vector3(position.x + offset, position.y, position.z - halfSize),
						new Vector3(position.x + offset, position.y, position.z + halfSize),
					],
				},
				scene,
			);
			lineZ.color = color;
			lineZ.alpha = alpha;
			lines.push(lineZ);
		}

		linesRef.current = lines;

		return () => {
			for (const line of linesRef.current) {
				line.dispose();
			}
			linesRef.current = [];
		};
	}, [scene, id, gridSize, cellCount, position, color]);

	return null;
}
