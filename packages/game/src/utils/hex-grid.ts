/**
 * Hex Grid Utilities
 * Based on Red Blob Games hexagonal grid reference: https://www.redblobgames.com/grids/hexagons/
 *
 * This module provides coordinate systems and conversion functions for hex grids.
 * Uses axial coordinates (q, r) for storage and cube coordinates (q, r, s) for algorithms.
 */

// ============================================================================
// TYPES
// ============================================================================

/** Axial coordinate (compact storage) - q,r where s = -q-r */
export interface HexAxial {
  q: number;
  r: number;
}

/** Cube coordinate (algorithmic operations) - q+r+s must equal 0 */
export interface HexCube {
  q: number;
  r: number;
  s: number;
}

/** Offset coordinate (rectangular grid mapping) */
export interface HexOffset {
  col: number;
  row: number;
}

/** World position in 3D space */
export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

/** Hex orientation: pointy-top or flat-top */
export type HexOrientation = 'pointy' | 'flat';

/** Layout configuration for hex grid */
export interface HexLayout {
  orientation: HexOrientation;
  size: number; // Hex size (outer radius)
  origin: WorldPosition; // Grid origin in world space
  spacing: number; // Gap between hexes (0 = touching, negative = overlap)
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default hex layout configuration */
export const DEFAULT_HEX_LAYOUT: HexLayout = {
  orientation: 'pointy',
  size: 1.0,
  origin: { x: 0, y: 0, z: 0 },
  spacing: 0,
};

/** Hex geometry constants */
export const HEX_GEOMETRY = {
  /** Number of sides (always 6) */
  SIDES: 6,
  /** Angle between vertices (60 degrees in radians) */
  VERTEX_ANGLE: Math.PI / 3,
  /** Ratio of inner radius to outer radius */
  INNER_RADIUS_RATIO: Math.sqrt(3) / 2,
} as const;

// ============================================================================
// COORDINATE CONVERSIONS
// ============================================================================

/**
 * Convert axial coordinates to cube coordinates
 * Cube constraint: q + r + s = 0, so s = -q - r
 */
export function axialToCube(hex: HexAxial): HexCube {
  return {
    q: hex.q,
    r: hex.r,
    s: -hex.q - hex.r,
  };
}

/**
 * Convert cube coordinates to axial coordinates
 * Simply drops the s component (it's redundant)
 */
export function cubeToAxial(hex: HexCube): HexAxial {
  return {
    q: hex.q,
    r: hex.r,
  };
}

/**
 * Convert offset coordinates (col, row) to axial coordinates
 * Uses "odd-q" vertical layout (odd columns shifted down)
 */
export function offsetToAxial(offset: HexOffset, orientation: HexOrientation = 'pointy'): HexAxial {
  if (orientation === 'pointy') {
    // Odd-q vertical layout
    const q = offset.col;
    const r = offset.row - Math.floor((offset.col - (offset.col & 1)) / 2);
    return { q, r };
  } else {
    // Odd-r horizontal layout
    const q = offset.col - Math.floor((offset.row - (offset.row & 1)) / 2);
    const r = offset.row;
    return { q, r };
  }
}

/**
 * Convert axial coordinates to offset coordinates
 * Uses "odd-q" vertical layout (odd columns shifted down)
 */
export function axialToOffset(hex: HexAxial, orientation: HexOrientation = 'pointy'): HexOffset {
  if (orientation === 'pointy') {
    // Odd-q vertical layout
    const col = hex.q;
    const row = hex.r + Math.floor((hex.q - (hex.q & 1)) / 2);
    return { col, row };
  } else {
    // Odd-r horizontal layout
    const col = hex.q + Math.floor((hex.r - (hex.r & 1)) / 2);
    const row = hex.r;
    return { col, row };
  }
}

// ============================================================================
// WORLD POSITION CONVERSIONS
// ============================================================================

/**
 * Convert axial hex coordinates to world position (X, Z plane, Y = 0)
 * This is the core function for placing hex tiles in 3D space
 */
export function hexToWorld(hex: HexAxial, layout: HexLayout = DEFAULT_HEX_LAYOUT): WorldPosition {
  const { orientation, size, origin, spacing } = layout;

  // Calculate effective size with spacing
  const effectiveSize = size + spacing / 2;

  let x: number;
  let z: number;

  if (orientation === 'pointy') {
    // Pointy-top hex layout
    // Width = sqrt(3) * size, Height = 2 * size
    x = effectiveSize * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
    z = effectiveSize * ((3 / 2) * hex.r);
  } else {
    // Flat-top hex layout
    // Width = 2 * size, Height = sqrt(3) * size
    x = effectiveSize * ((3 / 2) * hex.q);
    z = effectiveSize * ((Math.sqrt(3) / 2) * hex.q + Math.sqrt(3) * hex.r);
  }

  return {
    x: x + origin.x,
    y: origin.y,
    z: z + origin.z,
  };
}

/**
 * Convert offset coordinates directly to world position
 * Convenience function for grid-based iteration
 */
export function offsetToWorld(offset: HexOffset, layout: HexLayout = DEFAULT_HEX_LAYOUT): WorldPosition {
  const axial = offsetToAxial(offset, layout.orientation);
  return hexToWorld(axial, layout);
}

/**
 * Convert world position to nearest axial hex coordinate
 * Used for picking/selection
 */
export function worldToHex(world: WorldPosition, layout: HexLayout = DEFAULT_HEX_LAYOUT): HexAxial {
  const { orientation, size, origin, spacing } = layout;

  // Translate to local coordinates
  const localX = world.x - origin.x;
  const localZ = world.z - origin.z;

  const effectiveSize = size + spacing / 2;

  let q: number;
  let r: number;

  if (orientation === 'pointy') {
    q = ((Math.sqrt(3) / 3) * localX - (1 / 3) * localZ) / effectiveSize;
    r = ((2 / 3) * localZ) / effectiveSize;
  } else {
    q = ((2 / 3) * localX) / effectiveSize;
    r = (-(1 / 3) * localX + (Math.sqrt(3) / 3) * localZ) / effectiveSize;
  }

  // Round to nearest hex
  return cubeToAxial(cubeRound({ q, r, s: -q - r }));
}

// ============================================================================
// HEX GRID GENERATION
// ============================================================================

/**
 * Generate a rectangular hex grid
 * Returns array of axial coordinates for all hexes in the grid
 */
export function generateRectGrid(
  width: number,
  height: number,
  layout: HexLayout = DEFAULT_HEX_LAYOUT
): HexAxial[] {
  const hexes: HexAxial[] = [];

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      hexes.push(offsetToAxial({ col, row }, layout.orientation));
    }
  }

  return hexes;
}

/**
 * Generate a hexagonal-shaped grid (radius from center)
 * Returns array of axial coordinates for all hexes within radius
 */
export function generateHexGrid(radius: number): HexAxial[] {
  const hexes: HexAxial[] = [];

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      hexes.push({ q, r });
    }
  }

  return hexes;
}

// ============================================================================
// HEX ALGORITHMS (using cube coordinates)
// ============================================================================

/**
 * Round fractional cube coordinates to nearest hex
 * Essential for world-to-hex conversion
 */
export function cubeRound(cube: HexCube): HexCube {
  let q = Math.round(cube.q);
  let r = Math.round(cube.r);
  let s = Math.round(cube.s);

  const qDiff = Math.abs(q - cube.q);
  const rDiff = Math.abs(r - cube.r);
  const sDiff = Math.abs(s - cube.s);

  // Reset the component with largest rounding error
  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
}

/**
 * Calculate distance between two hexes (in hex steps)
 */
export function hexDistance(a: HexAxial, b: HexAxial): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);

  return Math.max(Math.abs(ac.q - bc.q), Math.abs(ac.r - bc.r), Math.abs(ac.s - bc.s));
}

/**
 * Get all six neighbors of a hex
 */
export function hexNeighbors(hex: HexAxial): HexAxial[] {
  const directions: HexAxial[] = [
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ];

  return directions.map((dir) => ({
    q: hex.q + dir.q,
    r: hex.r + dir.r,
  }));
}

/**
 * Get hexes in a ring at a given radius from center
 */
export function hexRing(center: HexAxial, radius: number): HexAxial[] {
  if (radius === 0) return [center];

  const results: HexAxial[] = [];
  const directions: HexAxial[] = [
    { q: 1, r: 0 },
    { q: 0, r: 1 },
    { q: -1, r: 1 },
    { q: -1, r: 0 },
    { q: 0, r: -1 },
    { q: 1, r: -1 },
  ];

  // Start at radius steps in the q direction
  let hex: HexAxial = { q: center.q + radius, r: center.r - radius };

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push({ ...hex });
      hex = { q: hex.q + directions[i].q, r: hex.r + directions[i].r };
    }
  }

  return results;
}

// ============================================================================
// HEX GEOMETRY HELPERS
// ============================================================================

/**
 * Calculate the inner radius (apothem) from outer radius
 * Inner radius = distance from center to middle of edge
 */
export function hexInnerRadius(outerRadius: number): number {
  return outerRadius * HEX_GEOMETRY.INNER_RADIUS_RATIO;
}

/**
 * Calculate the outer radius from inner radius
 */
export function hexOuterRadius(innerRadius: number): number {
  return innerRadius / HEX_GEOMETRY.INNER_RADIUS_RATIO;
}

/**
 * Get the 6 corner vertices of a hex in local coordinates
 * Y is up (height), X-Z is the ground plane
 */
export function hexCorners(
  size: number,
  orientation: HexOrientation = 'pointy',
  height: number = 0
): [number, number, number][] {
  const corners: [number, number, number][] = [];

  for (let i = 0; i < 6; i++) {
    const angle =
      orientation === 'pointy'
        ? (Math.PI / 6) + i * HEX_GEOMETRY.VERTEX_ANGLE // Start at 30 degrees
        : i * HEX_GEOMETRY.VERTEX_ANGLE; // Start at 0 degrees

    corners.push([size * Math.cos(angle), height, size * Math.sin(angle)]);
  }

  return corners;
}

/**
 * Get the bounding box dimensions for a hex
 * Returns [width, height] in world units
 */
export function hexBoundingBox(size: number, orientation: HexOrientation = 'pointy'): [number, number] {
  if (orientation === 'pointy') {
    // Pointy-top: width = sqrt(3) * size, height = 2 * size
    return [Math.sqrt(3) * size, 2 * size];
  } else {
    // Flat-top: width = 2 * size, height = sqrt(3) * size
    return [2 * size, Math.sqrt(3) * size];
  }
}

// ============================================================================
// THREE.JS INTEGRATION HELPERS
// ============================================================================

/**
 * Create a Matrix4 for positioning a hex tile at given coordinates
 * For use with Three.js InstancedMesh.setMatrixAt()
 */
export function createHexMatrix(
  hex: HexAxial,
  layout: HexLayout = DEFAULT_HEX_LAYOUT,
  rotation: number = 0,
  scale: number = 1
): number[] {
  const pos = hexToWorld(hex, layout);

  // Create transformation matrix components
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Column-major 4x4 matrix (as flat array for Three.js)
  // This is a combined translation, rotation (Y-axis), and uniform scale
  return [
    scale * cosR, 0, scale * -sinR, 0, // Column 0
    0, scale, 0, 0, // Column 1
    scale * sinR, 0, scale * cosR, 0, // Column 2
    pos.x, pos.y, pos.z, 1, // Column 3 (translation)
  ];
}

/**
 * Generate world positions for a rectangular grid as Three.js-friendly tuples
 */
export function generateGridPositions(
  width: number,
  height: number,
  layout: HexLayout = DEFAULT_HEX_LAYOUT
): [number, number, number][] {
  const positions: [number, number, number][] = [];

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      const pos = offsetToWorld({ col, row }, layout);
      positions.push([pos.x, pos.y, pos.z]);
    }
  }

  return positions;
}
