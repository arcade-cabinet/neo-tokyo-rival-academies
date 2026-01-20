/**
 * NavMesh - Navigation mesh for AI pathfinding
 *
 * Provides:
 * - Walkable area definition (boxes/planes)
 * - Waypoint graph generation
 * - A* pathfinding
 * - Debug visualization
 *
 * This is a simple grid-based nav mesh for testing.
 * Can be upgraded to use Recast/Detour later.
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

export interface NavArea {
	/** Area identifier */
	id: string;
	/** Center position */
	position: Vector3;
	/** Area dimensions */
	size: { width: number; depth: number };
	/** Height offset from ground */
	height?: number;
	/** Connected areas (by id) */
	connections?: string[];
	/** Movement cost multiplier (1 = normal, >1 = slower) */
	cost?: number;
}

export interface NavMeshProps {
	/** Unique identifier */
	id: string;
	/** Walkable areas */
	areas: NavArea[];
	/** Grid cell size for waypoint generation */
	cellSize?: number;
	/** Show debug visualization */
	debug?: boolean;
	/** Debug color for walkable areas */
	debugColor?: Color3;
	/** Debug color for waypoints */
	waypointColor?: Color3;
	/** Debug color for connections */
	connectionColor?: Color3;
	/** Callback when nav mesh is ready */
	onReady?: (navMesh: NavMeshController) => void;
}

export interface NavMeshController {
	/** Find path between two points */
	findPath: (start: Vector3, end: Vector3) => Vector3[];
	/** Get nearest waypoint to a position */
	getNearestWaypoint: (position: Vector3) => Vector3 | null;
	/** Check if a position is walkable */
	isWalkable: (position: Vector3) => boolean;
	/** Get all waypoints */
	getWaypoints: () => Vector3[];
	/** Get area at position */
	getAreaAt: (position: Vector3) => NavArea | null;
}

interface Waypoint {
	position: Vector3;
	areaId: string;
	neighbors: number[];
	gCost: number;
	hCost: number;
	fCost: number;
	parent: number | null;
}

/**
 * NavMesh component
 */
export function NavMesh({
	id,
	areas,
	cellSize = 1,
	debug = false,
	debugColor = new Color3(0, 1, 0),
	waypointColor = new Color3(1, 1, 0),
	connectionColor = new Color3(0, 0.5, 1),
	onReady,
}: NavMeshProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);
	const waypointsRef = useRef<Waypoint[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const waypoints: Waypoint[] = [];

		// Generate waypoints for each area
		areas.forEach((area) => {
			const height = area.height ?? 0;
			const halfW = area.size.width / 2;
			const halfD = area.size.depth / 2;

			// Create grid of waypoints
			const startX = area.position.x - halfW + cellSize / 2;
			const endX = area.position.x + halfW - cellSize / 2;
			const startZ = area.position.z - halfD + cellSize / 2;
			const endZ = area.position.z + halfD - cellSize / 2;

			for (let x = startX; x <= endX; x += cellSize) {
				for (let z = startZ; z <= endZ; z += cellSize) {
					waypoints.push({
						position: new Vector3(x, area.position.y + height, z),
						areaId: area.id,
						neighbors: [],
						gCost: 0,
						hCost: 0,
						fCost: 0,
						parent: null,
					});
				}
			}
		});

		// Connect waypoints within same area and to neighbors
		for (let i = 0; i < waypoints.length; i++) {
			for (let j = i + 1; j < waypoints.length; j++) {
				const wpA = waypoints[i];
				const wpB = waypoints[j];
				const dist = Vector3.Distance(wpA.position, wpB.position);

				// Connect if close enough (adjacent cells)
				const maxDist = cellSize * 1.5; // Allow diagonal

				if (dist <= maxDist) {
					// Same area
					if (wpA.areaId === wpB.areaId) {
						wpA.neighbors.push(j);
						wpB.neighbors.push(i);
					} else {
						// Different areas - check if connected
						const areaA = areas.find((a) => a.id === wpA.areaId);
						const areaB = areas.find((a) => a.id === wpB.areaId);

						if (
							areaA?.connections?.includes(wpB.areaId) ||
							areaB?.connections?.includes(wpA.areaId)
						) {
							wpA.neighbors.push(j);
							wpB.neighbors.push(i);
						}
					}
				}
			}
		}

		waypointsRef.current = waypoints;

		// Debug visualization
		if (debug) {
			// Area planes
			const areaMat = new StandardMaterial(`navAreaMat_${id}`, scene);
			areaMat.diffuseColor = debugColor;
			areaMat.alpha = 0.3;
			areaMat.backFaceCulling = false;

			areas.forEach((area, i) => {
				const plane = MeshBuilder.CreatePlane(
					`navArea_${id}_${i}`,
					{
						width: area.size.width,
						height: area.size.depth,
					},
					scene,
				);
				plane.rotation.x = Math.PI / 2;
				plane.position = area.position.clone();
				plane.position.y += (area.height ?? 0) + 0.01;
				plane.material = areaMat;
				meshes.push(plane);
			});

			// Waypoint markers
			const wpMat = new StandardMaterial(`navWpMat_${id}`, scene);
			wpMat.diffuseColor = waypointColor;
			wpMat.emissiveColor = waypointColor.scale(0.5);

			waypoints.forEach((wp, i) => {
				const marker = MeshBuilder.CreateSphere(
					`navWp_${id}_${i}`,
					{
						diameter: cellSize * 0.2,
					},
					scene,
				);
				marker.position = wp.position.clone();
				marker.position.y += 0.1;
				marker.material = wpMat;
				meshes.push(marker);
			});

			// Connection lines
			const lineMat = new StandardMaterial(`navLineMat_${id}`, scene);
			lineMat.diffuseColor = connectionColor;
			lineMat.emissiveColor = connectionColor;

			const drawnConnections = new Set<string>();

			waypoints.forEach((wp, i) => {
				wp.neighbors.forEach((j) => {
					const key = i < j ? `${i}-${j}` : `${j}-${i}`;
					if (!drawnConnections.has(key)) {
						drawnConnections.add(key);

						const line = MeshBuilder.CreateLines(
							`navLine_${id}_${key}`,
							{
								points: [
									wp.position.add(new Vector3(0, 0.1, 0)),
									waypoints[j].position.add(new Vector3(0, 0.1, 0)),
								],
							},
							scene,
						);
						line.color = connectionColor;
						meshes.push(line as unknown as AbstractMesh);
					}
				});
			});
		}

		meshesRef.current = meshes;

		// Controller API
		const controller: NavMeshController = {
			findPath: (start: Vector3, end: Vector3): Vector3[] => {
				const startIdx = findNearestWaypointIndex(start);
				const endIdx = findNearestWaypointIndex(end);

				if (startIdx === -1 || endIdx === -1) {
					return [];
				}

				// A* pathfinding
				const path = astar(startIdx, endIdx);

				// Add actual start and end points
				if (path.length > 0) {
					return [
						start,
						...path.map((i) => waypointsRef.current[i].position),
						end,
					];
				}

				return [];
			},

			getNearestWaypoint: (position: Vector3): Vector3 | null => {
				const idx = findNearestWaypointIndex(position);
				return idx !== -1 ? waypointsRef.current[idx].position.clone() : null;
			},

			isWalkable: (position: Vector3): boolean => {
				return getAreaAt(position) !== null;
			},

			getWaypoints: (): Vector3[] => {
				return waypointsRef.current.map((wp) => wp.position.clone());
			},

			getAreaAt: (position: Vector3): NavArea | null => {
				return getAreaAt(position);
			},
		};

		// Helper functions
		function findNearestWaypointIndex(position: Vector3): number {
			let nearestIdx = -1;
			let nearestDist = Infinity;

			waypointsRef.current.forEach((wp, i) => {
				const dist = Vector3.Distance(position, wp.position);
				if (dist < nearestDist) {
					nearestDist = dist;
					nearestIdx = i;
				}
			});

			return nearestIdx;
		}

		function getAreaAt(position: Vector3): NavArea | null {
			for (const area of areas) {
				const height = area.height ?? 0;
				const halfW = area.size.width / 2;
				const halfD = area.size.depth / 2;

				if (
					position.x >= area.position.x - halfW &&
					position.x <= area.position.x + halfW &&
					position.z >= area.position.z - halfD &&
					position.z <= area.position.z + halfD &&
					Math.abs(position.y - (area.position.y + height)) < 1
				) {
					return area;
				}
			}
			return null;
		}

		function astar(startIdx: number, endIdx: number): number[] {
			const wps = waypointsRef.current;

			// Reset costs
			wps.forEach((wp) => {
				wp.gCost = Infinity;
				wp.hCost = 0;
				wp.fCost = Infinity;
				wp.parent = null;
			});

			const openSet = new Set<number>([startIdx]);
			const closedSet = new Set<number>();

			wps[startIdx].gCost = 0;
			wps[startIdx].hCost = Vector3.Distance(
				wps[startIdx].position,
				wps[endIdx].position,
			);
			wps[startIdx].fCost = wps[startIdx].hCost;

			while (openSet.size > 0) {
				// Find node with lowest fCost
				let currentIdx = -1;
				let lowestF = Infinity;
				openSet.forEach((idx) => {
					if (wps[idx].fCost < lowestF) {
						lowestF = wps[idx].fCost;
						currentIdx = idx;
					}
				});

				if (currentIdx === endIdx) {
					// Reconstruct path
					const path: number[] = [];
					let curr: number | null = endIdx;
					while (curr !== null) {
						path.unshift(curr);
						curr = wps[curr].parent;
					}
					return path;
				}

				openSet.delete(currentIdx);
				closedSet.add(currentIdx);

				// Process neighbors
				const current = wps[currentIdx];
				for (const neighborIdx of current.neighbors) {
					if (closedSet.has(neighborIdx)) continue;

					const neighbor = wps[neighborIdx];
					const area = areas.find((a) => a.id === neighbor.areaId);
					const cost = area?.cost ?? 1;

					const tentativeG =
						current.gCost +
						Vector3.Distance(current.position, neighbor.position) * cost;

					if (tentativeG < neighbor.gCost) {
						neighbor.parent = currentIdx;
						neighbor.gCost = tentativeG;
						neighbor.hCost = Vector3.Distance(
							neighbor.position,
							wps[endIdx].position,
						);
						neighbor.fCost = neighbor.gCost + neighbor.hCost;

						if (!openSet.has(neighborIdx)) {
							openSet.add(neighborIdx);
						}
					}
				}
			}

			// No path found
			return [];
		}

		if (onReady) {
			onReady(controller);
		}

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
			waypointsRef.current = [];
		};
	}, [
		scene,
		id,
		areas,
		cellSize,
		debug,
		debugColor,
		waypointColor,
		connectionColor,
		onReady,
	]);

	return null;
}

/**
 * Helper to create connected areas from floor components
 */
export function createNavAreasFromFloors(
	floors: Array<{
		id: string;
		position: Vector3;
		size: { width: number; depth: number };
	}>,
	autoConnect = true,
	maxConnectionDistance = 5,
): NavArea[] {
	const areas: NavArea[] = floors.map((floor) => ({
		id: floor.id,
		position: floor.position.clone(),
		size: { width: floor.size.width, depth: floor.size.depth },
		height: 0.1,
		connections: [],
	}));

	if (autoConnect) {
		// Connect areas that are close enough
		for (let i = 0; i < areas.length; i++) {
			for (let j = i + 1; j < areas.length; j++) {
				const dist = Vector3.Distance(areas[i].position, areas[j].position);

				// Calculate min distance based on sizes
				const minDist =
					(Math.max(areas[i].size.width, areas[i].size.depth) +
						Math.max(areas[j].size.width, areas[j].size.depth)) /
					2;

				if (dist <= minDist + maxConnectionDistance) {
					areas[i].connections?.push(areas[j].id);
					areas[j].connections?.push(areas[i].id);
				}
			}
		}
	}

	return areas;
}

export default NavMesh;
