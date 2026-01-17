/**
 * Grid Type Definitions
 */

export interface AxialCoord {
	q: number;
	r: number;
}

export interface CubeCoord {
	x: number;
	y: number;
	z: number;
}

export interface GridBounds {
	minX: number;
	maxX: number;
	minZ: number;
	maxZ: number;
}

export interface GridConfig {
	seed: string;
	cols: number;
	rows: number;
	bounds: GridBounds;
}
