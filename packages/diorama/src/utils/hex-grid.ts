/**
 * Hex Grid Utilities for BabylonJS
 *
 * Hexagonal grid coordinate conversion and utilities.
 * Uses flat-top orientation.
 */

import { Matrix, Vector3 } from "@babylonjs/core";
import type { AxialCoord, CubeCoord } from "../types/grid";

export const HEX_SIZE = 1.2; // Tile size in world units

/**
 * Convert axial hex coordinates to world position
 */
export function hexToWorld(q: number, r: number, size = HEX_SIZE): Vector3 {
	const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
	const z = size * ((3 / 2) * r);
	return new Vector3(x, 0, z);
}

/**
 * Convert world position to axial hex coordinates
 */
export function worldToHex(pos: Vector3, size = HEX_SIZE): AxialCoord {
	const q = ((Math.sqrt(3) / 3) * pos.x - (1 / 3) * pos.z) / size;
	const r = ((2 / 3) * pos.z) / size;
	return axialRound({ q, r });
}

/**
 * Convert axial to cube coordinates
 */
export function axialToCube(axial: AxialCoord): CubeCoord {
	const x = axial.q;
	const z = axial.r;
	const y = -x - z;
	return { x, y, z };
}

/**
 * Convert cube to axial coordinates
 */
export function cubeToAxial(cube: CubeCoord): AxialCoord {
	return { q: cube.x, r: cube.z };
}

/**
 * Round fractional axial coordinates to nearest hex
 */
export function axialRound(axial: AxialCoord): AxialCoord {
	return cubeToAxial(cubeRound(axialToCube(axial)));
}

/**
 * Round fractional cube coordinates to nearest hex
 */
export function cubeRound(cube: CubeCoord): CubeCoord {
	let rx = Math.round(cube.x);
	let ry = Math.round(cube.y);
	let rz = Math.round(cube.z);

	const xDiff = Math.abs(rx - cube.x);
	const yDiff = Math.abs(ry - cube.y);
	const zDiff = Math.abs(rz - cube.z);

	if (xDiff > yDiff && xDiff > zDiff) {
		rx = -ry - rz;
	} else if (yDiff > zDiff) {
		ry = -rx - rz;
	} else {
		rz = -rx - ry;
	}

	return { x: rx, y: ry, z: rz };
}

/**
 * Snap world position to nearest hex center
 */
export function snapToHex(pos: Vector3, size = HEX_SIZE): Vector3 {
	const hex = worldToHex(pos, size);
	return hexToWorld(hex.q, hex.r, size);
}

/**
 * Create transformation matrix for hex tile at given coordinates
 */
export function createHexMatrix(q: number, r: number, size = HEX_SIZE): Matrix {
	const pos = hexToWorld(q, r, size);
	return Matrix.Translation(pos.x, pos.y, pos.z);
}

/**
 * Get distance between two hex coordinates (in hex steps)
 */
export function hexDistance(a: AxialCoord, b: AxialCoord): number {
	const ac = axialToCube(a);
	const bc = axialToCube(b);
	return (
		(Math.abs(ac.x - bc.x) + Math.abs(ac.y - bc.y) + Math.abs(ac.z - bc.z)) / 2
	);
}

/**
 * Get all hex coordinates within a rectangular bounds
 */
export function getHexesInBounds(
	minX: number,
	maxX: number,
	minZ: number,
	maxZ: number,
	size = HEX_SIZE,
): AxialCoord[] {
	const hexes: AxialCoord[] = [];

	// Convert bounds to approximate hex range
	const minHexQ = Math.floor(minX / (size * Math.sqrt(3)));
	const maxHexQ = Math.ceil(maxX / (size * Math.sqrt(3)));
	const minHexR = Math.floor(minZ / (size * 1.5));
	const maxHexR = Math.ceil(maxZ / (size * 1.5));

	// Generate all hexes in range and filter by actual bounds
	for (let q = minHexQ; q <= maxHexQ; q++) {
		for (let r = minHexR; r <= maxHexR; r++) {
			const pos = hexToWorld(q, r, size);
			if (pos.x >= minX && pos.x <= maxX && pos.z >= minZ && pos.z <= maxZ) {
				hexes.push({ q, r });
			}
		}
	}

	return hexes;
}
