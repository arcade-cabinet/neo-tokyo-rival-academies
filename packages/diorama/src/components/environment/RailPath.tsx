/**
 * RailPath - Spline path that objects can follow
 *
 * Reusable for:
 * - Ferry routes (horizontal over water)
 * - Elevators (vertical)
 * - Gondolas (diagonal)
 * - Moving walkways
 * - Sliding doors
 * - Any rail-based movement
 *
 * The path itself is invisible in production.
 * Debug mode shows the path for development.
 */

import {
	Color3,
	Curve3,
	type LinesMesh,
	MeshBuilder,
	Path3D,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface RailPathProps {
	/** Unique identifier */
	id: string;
	/** Control points for the path (minimum 2) */
	points: Vector3[];
	/** Path type - affects interpolation */
	pathType?: "linear" | "catmullrom" | "bezier";
	/** Number of subdivisions for smooth curves */
	subdivisions?: number;
	/** Show debug visualization */
	debug?: boolean;
	/** Debug line color */
	debugColor?: Color3;
	/** Callback with the computed Path3D object */
	onPathReady?: (path: Path3D, curve: Curve3) => void;
}

/**
 * RailPath component - creates a followable path
 */
export function RailPath({
	id,
	points,
	pathType = "catmullrom",
	subdivisions = 60,
	debug = false,
	debugColor = new Color3(1, 1, 0),
	onPathReady,
}: RailPathProps) {
	const scene = useScene();
	const debugMeshRef = useRef<LinesMesh | null>(null);
	const pathRef = useRef<Path3D | null>(null);

	useEffect(() => {
		if (!scene || points.length < 2) return;

		let curve: Curve3;

		// Create curve based on type
		switch (pathType) {
			case "linear":
				// Simple linear interpolation between points
				curve = new Curve3(points);
				break;

			case "bezier":
				// Quadratic bezier if 3 points, cubic if 4+
				if (points.length === 3) {
					curve = Curve3.CreateQuadraticBezier(
						points[0],
						points[1],
						points[2],
						subdivisions,
					);
				} else if (points.length >= 4) {
					curve = Curve3.CreateCubicBezier(
						points[0],
						points[1],
						points[2],
						points[3],
						subdivisions,
					);
				} else {
					curve = new Curve3(points);
				}
				break;

			case "catmullrom":
			default:
				// Smooth Catmull-Rom spline through all points
				curve = Curve3.CreateCatmullRomSpline(points, subdivisions, true);
				break;
		}

		// Create Path3D for position/rotation queries
		const curvePoints = curve.getPoints();
		const path = new Path3D(curvePoints);
		pathRef.current = path;

		// Debug visualization
		if (debug) {
			// Main path line
			const debugLine = MeshBuilder.CreateLines(
				`railPath_debug_${id}`,
				{ points: curvePoints },
				scene,
			);
			debugLine.color = debugColor;
			debugMeshRef.current = debugLine;

			// Control point markers
			const markerMat = new StandardMaterial(`railMarker_${id}`, scene);
			markerMat.emissiveColor = new Color3(1, 0.5, 0);

			points.forEach((point, i) => {
				const marker = MeshBuilder.CreateSphere(
					`railMarker_${id}_${i}`,
					{ diameter: 0.3 },
					scene,
				);
				marker.position = point;
				marker.material = markerMat;
			});
		}

		// Notify parent
		if (onPathReady) {
			onPathReady(path, curve);
		}

		return () => {
			if (debugMeshRef.current) {
				debugMeshRef.current.dispose();
				debugMeshRef.current = null;
			}
			// Dispose marker meshes
			if (debug) {
				points.forEach((_, i) => {
					const marker = scene.getMeshByName(`railMarker_${id}_${i}`);
					marker?.dispose();
				});
				const markerMat = scene.getMaterialByName(`railMarker_${id}`);
				markerMat?.dispose();
			}
		};
	}, [
		scene,
		id,
		points,
		pathType,
		subdivisions,
		debug,
		debugColor,
		onPathReady,
	]);

	return null;
}

/**
 * Helper to create common rail path shapes
 */
export const RailPathPresets = {
	/**
	 * Straight line between two points
	 */
	straight: (start: Vector3, end: Vector3): Vector3[] => [start, end],

	/**
	 * Simple arc between two points with height
	 */
	arc: (start: Vector3, end: Vector3, height: number): Vector3[] => {
		const mid = Vector3.Lerp(start, end, 0.5);
		mid.y += height;
		return [start, mid, end];
	},

	/**
	 * Vertical elevator path
	 */
	vertical: (base: Vector3, height: number): Vector3[] => [
		base,
		new Vector3(base.x, base.y + height, base.z),
	],

	/**
	 * L-shaped path (two segments at 90 degrees)
	 */
	lShape: (start: Vector3, corner: Vector3, end: Vector3): Vector3[] => [
		start,
		corner,
		end,
	],

	/**
	 * Loop path (returns to start)
	 */
	loop: (center: Vector3, radius: number, segments: number = 8): Vector3[] => {
		const points: Vector3[] = [];
		for (let i = 0; i <= segments; i++) {
			const angle = (i / segments) * Math.PI * 2;
			points.push(
				new Vector3(
					center.x + Math.cos(angle) * radius,
					center.y,
					center.z + Math.sin(angle) * radius,
				),
			);
		}
		return points;
	},
};

export default RailPath;
