/**
 * Hex Normalizer Utility
 *
 * Forces any 3D model (GLTF/GLB) to fit within exact hex tile constraints.
 * This ensures ALL tiles align perfectly regardless of their original geometry.
 *
 * The normalizer:
 * 1. Computes the bounding box of the input model
 * 2. Centers the model at origin
 * 3. Scales to fit within the target hex dimensions
 * 4. Optionally clips/masks geometry that exceeds hex bounds
 */

import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { type HexOrientation, hexInnerRadius } from "./hex-grid";

// ============================================================================
// TYPES
// ============================================================================

export interface HexNormalizerConfig {
	/** Target hex size (outer radius) */
	hexSize: number;
	/** Hex orientation */
	orientation: HexOrientation;
	/** Target height for the tile (Y-axis) */
	targetHeight: number;
	/** How to handle models larger than hex bounds */
	overflowMode: "scale" | "clip" | "mask";
	/** Whether to center the model at origin */
	centerModel: boolean;
	/** Whether to align the bottom of the model to Y=0 */
	alignToGround: boolean;
	/** Padding inside hex bounds (0-1, percentage of hex size) */
	padding: number;
}

export interface NormalizedModel {
	/** The normalized scene/group */
	scene: THREE.Group;
	/** Applied scale factor */
	scale: number;
	/** Original bounding box */
	originalBounds: THREE.Box3;
	/** Normalized bounding box */
	normalizedBounds: THREE.Box3;
	/** Whether clipping was applied */
	wasClipped: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_NORMALIZER_CONFIG: HexNormalizerConfig = {
	hexSize: 1.0,
	orientation: "pointy",
	targetHeight: 0.1,
	overflowMode: "scale",
	centerModel: true,
	alignToGround: true,
	padding: 0.05, // 5% padding
};

// ============================================================================
// CORE NORMALIZER
// ============================================================================

/**
 * Normalize a GLTF model to fit within hex tile constraints
 * This is the main function for force-locking tiles to correct size and shape
 */
export function normalizeToHex(
	gltf: GLTF,
	config: Partial<HexNormalizerConfig> = {},
): NormalizedModel {
	const cfg = { ...DEFAULT_NORMALIZER_CONFIG, ...config };

	// Clone the scene to avoid modifying the original
	const scene = gltf.scene.clone(true);

	// Step 1: Compute original bounding box
	const originalBounds = new THREE.Box3().setFromObject(scene);
	const originalSize = new THREE.Vector3();
	const originalCenter = new THREE.Vector3();
	originalBounds.getSize(originalSize);
	originalBounds.getCenter(originalCenter);

	// Step 2: Calculate target dimensions based on hex geometry
	const effectiveHexSize = cfg.hexSize * (1 - cfg.padding);
	const innerRadius = hexInnerRadius(effectiveHexSize);

	// For pointy-top hex, the inscribed rectangle dimensions are:
	// Width (X) = 2 * innerRadius = sqrt(3) * hexSize
	// Depth (Z) = 2 * innerRadius = sqrt(3) * hexSize (for a regular hex)
	// For flat-top, it's swapped

	// Inscribed circle diameter is the limiting factor (same for both orientations)
	const targetWidth = 2 * innerRadius;
	const targetDepth = 2 * innerRadius;

	const targetHeight = cfg.targetHeight;

	// Step 3: Calculate scale factor to fit within hex bounds
	const scaleX = targetWidth / originalSize.x;
	const scaleY = targetHeight / originalSize.y;
	const scaleZ = targetDepth / originalSize.z;

	// Use uniform scale (smallest factor) to maintain aspect ratio
	// Or use per-axis scale if we want to stretch/distort to fit exactly
	let scale: number;
	let wasClipped = false;

	if (cfg.overflowMode === "scale") {
		// Uniform scale to fit entirely within bounds
		scale = Math.min(scaleX, scaleY, scaleZ);
	} else {
		// Non-uniform scale to fill the hex exactly
		// Note: This distorts the model but ensures exact fit
		scale = 1; // We'll handle this with per-axis scaling
		scene.scale.set(scaleX, scaleY, scaleZ);
	}

	if (cfg.overflowMode === "scale") {
		scene.scale.setScalar(scale);
	}

	// Step 4: Center the model
	if (cfg.centerModel) {
		// Recalculate bounds after scaling
		scene.updateMatrixWorld(true);
		const scaledBounds = new THREE.Box3().setFromObject(scene);
		const scaledCenter = new THREE.Vector3();
		scaledBounds.getCenter(scaledCenter);

		// Translate to center at origin (X, Z)
		scene.position.x = -scaledCenter.x;
		scene.position.z = -scaledCenter.z;
	}

	// Step 5: Align to ground
	if (cfg.alignToGround) {
		scene.updateMatrixWorld(true);
		const groundBounds = new THREE.Box3().setFromObject(scene);
		scene.position.y = -groundBounds.min.y;
	}

	// Step 6: Apply clipping if needed
	if (cfg.overflowMode === "clip" || cfg.overflowMode === "mask") {
		wasClipped = applyHexClipping(scene, cfg);
	}

	// Calculate final normalized bounds
	scene.updateMatrixWorld(true);
	const normalizedBounds = new THREE.Box3().setFromObject(scene);

	return {
		scene,
		scale:
			cfg.overflowMode === "scale" ? scale : Math.min(scaleX, scaleY, scaleZ),
		originalBounds,
		normalizedBounds,
		wasClipped,
	};
}

/**
 * Normalize a Three.js Object3D (not GLTF) to hex constraints
 */
export function normalizeObject3DToHex(
	object: THREE.Object3D,
	config: Partial<HexNormalizerConfig> = {},
): NormalizedModel {
	const cfg = { ...DEFAULT_NORMALIZER_CONFIG, ...config };

	// Clone the object
	const scene = object.clone(true) as THREE.Group;

	// Compute original bounds
	const originalBounds = new THREE.Box3().setFromObject(scene);
	const originalSize = new THREE.Vector3();
	originalBounds.getSize(originalSize);

	// Calculate target dimensions
	const effectiveHexSize = cfg.hexSize * (1 - cfg.padding);
	const innerRadius = hexInnerRadius(effectiveHexSize);
	const targetWidth = 2 * innerRadius;
	const targetDepth = 2 * innerRadius;
	const targetHeight = cfg.targetHeight;

	// Calculate scale
	const scaleX = originalSize.x > 0 ? targetWidth / originalSize.x : 1;
	const scaleY = originalSize.y > 0 ? targetHeight / originalSize.y : 1;
	const scaleZ = originalSize.z > 0 ? targetDepth / originalSize.z : 1;
	const scale = Math.min(scaleX, scaleY, scaleZ);

	scene.scale.setScalar(scale);

	// Center and ground align
	scene.updateMatrixWorld(true);
	const scaledBounds = new THREE.Box3().setFromObject(scene);
	const scaledCenter = new THREE.Vector3();
	scaledBounds.getCenter(scaledCenter);

	if (cfg.centerModel) {
		scene.position.x = -scaledCenter.x;
		scene.position.z = -scaledCenter.z;
	}

	if (cfg.alignToGround) {
		scene.updateMatrixWorld(true);
		const groundBounds = new THREE.Box3().setFromObject(scene);
		scene.position.y = -groundBounds.min.y;
	}

	scene.updateMatrixWorld(true);
	const normalizedBounds = new THREE.Box3().setFromObject(scene);

	return {
		scene,
		scale,
		originalBounds,
		normalizedBounds,
		wasClipped: false,
	};
}

// ============================================================================
// CLIPPING UTILITIES
// ============================================================================

/**
 * Apply hexagonal clipping to geometry that exceeds bounds
 * This creates a hard cutoff at the hex edges
 */
function applyHexClipping(
	scene: THREE.Group,
	config: HexNormalizerConfig,
): boolean {
	let didClip = false;

	scene.traverse((child) => {
		if (child instanceof THREE.Mesh && child.geometry) {
			const clipped = clipGeometryToHex(child.geometry, config);
			if (clipped) didClip = true;
		}
	});

	return didClip;
}

/**
 * Clip a BufferGeometry to fit within hex bounds
 * Modifies geometry in place
 */
function clipGeometryToHex(
	geometry: THREE.BufferGeometry,
	config: HexNormalizerConfig,
): boolean {
	const positionAttr = geometry.getAttribute("position");
	if (!positionAttr) return false;

	const effectiveHexSize = config.hexSize * (1 - config.padding);
	const innerRadius = hexInnerRadius(effectiveHexSize);
	let modified = false;

	// Create hex boundary check function
	const isInsideHex = (x: number, z: number): boolean => {
		// For a regular hexagon centered at origin
		// Check if point is inside using the hex distance formula
		const absX = Math.abs(x);
		const absZ = Math.abs(z);

		if (config.orientation === "pointy") {
			// Pointy-top hex boundary check
			return (
				absX <= innerRadius &&
				absZ <= effectiveHexSize &&
				absX + absZ * (effectiveHexSize / innerRadius) <= effectiveHexSize * 2
			);
		} else {
			// Flat-top hex boundary check
			return (
				absZ <= innerRadius &&
				absX <= effectiveHexSize &&
				absZ + absX * (effectiveHexSize / innerRadius) <= effectiveHexSize * 2
			);
		}
	};

	// Clip vertices to hex boundary
	const positions = positionAttr.array as Float32Array;
	for (let i = 0; i < positions.length; i += 3) {
		const x = positions[i];
		const z = positions[i + 2];

		if (!isInsideHex(x, z)) {
			// Project point onto nearest hex edge
			const [clippedX, clippedZ] = projectToHexBoundary(
				x,
				z,
				effectiveHexSize,
				config.orientation,
			);
			positions[i] = clippedX;
			positions[i + 2] = clippedZ;
			modified = true;
		}
	}

	if (modified) {
		positionAttr.needsUpdate = true;
		geometry.computeVertexNormals();
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();
	}

	return modified;
}

/**
 * Project a point onto the nearest hex boundary edge
 */
function projectToHexBoundary(
	x: number,
	z: number,
	hexSize: number,
	orientation: HexOrientation,
): [number, number] {
	// Convert to polar coordinates
	const angle = Math.atan2(z, x);
	const dist = Math.sqrt(x * x + z * z);

	// Calculate the distance to hex edge at this angle
	const startAngle = orientation === "pointy" ? Math.PI / 6 : 0;
	const sectorAngle = (angle - startAngle + Math.PI * 2) % (Math.PI / 3);
	const edgeDist =
		(hexSize * Math.cos(Math.PI / 6)) / Math.cos(sectorAngle - Math.PI / 6);

	// Clamp distance to edge
	const clampedDist = Math.min(dist, edgeDist);

	return [clampedDist * Math.cos(angle), clampedDist * Math.sin(angle)];
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Normalize multiple models to the same hex constraints
 * Useful for ensuring all tiles in a set are identical size
 */
export function normalizeModelBatch(
	models: GLTF[],
	config: Partial<HexNormalizerConfig> = {},
): NormalizedModel[] {
	return models.map((gltf) => normalizeToHex(gltf, config));
}

// ============================================================================
// INSTANCED MESH HELPERS
// ============================================================================

/**
 * Create a standardized hex tile geometry
 * This creates a 6-sided cylinder with exact hex dimensions
 */
export function createStandardHexGeometry(
	hexSize: number,
	height: number = 0.1,
	orientation: HexOrientation = "pointy",
): THREE.CylinderGeometry {
	// CylinderGeometry with 6 radial segments creates a hexagon
	const geometry = new THREE.CylinderGeometry(
		hexSize * 0.95, // Top radius (slightly smaller for visual gap)
		hexSize * 0.95, // Bottom radius
		height, // Height
		6, // Radial segments (hexagon)
		1, // Height segments
	);

	// Rotate for correct orientation
	if (orientation === "pointy") {
		geometry.rotateY(Math.PI / 6); // 30 degrees for pointy-top
	}
	// Flat-top needs no rotation

	return geometry;
}

/**
 * Compute the transformation matrix for positioning a hex tile
 * Returns a Matrix4 ready for use with InstancedMesh.setMatrixAt()
 */
export function computeHexTileMatrix(
	position: [number, number, number],
	rotation: number = 0,
	scale: number = 1,
): THREE.Matrix4 {
	const matrix = new THREE.Matrix4();
	const pos = new THREE.Vector3(...position);
	const quat = new THREE.Quaternion().setFromAxisAngle(
		new THREE.Vector3(0, 1, 0),
		rotation,
	);
	const scl = new THREE.Vector3(scale, scale, scale);

	matrix.compose(pos, quat, scl);
	return matrix;
}

/**
 * Set up an InstancedMesh with hex tile positions
 * Handles all the matrix math for proper hex grid placement
 */
export function setupHexInstancedMesh(
	mesh: THREE.InstancedMesh,
	positions: [number, number, number][],
	rotations?: number[],
	scales?: number[],
): void {
	const dummy = new THREE.Object3D();

	positions.forEach((pos, i) => {
		dummy.position.set(pos[0], pos[1], pos[2]);
		dummy.rotation.y = rotations?.[i] ?? 0;
		const scale = scales?.[i] ?? 1;
		dummy.scale.set(scale, scale, scale);
		dummy.updateMatrix();
		mesh.setMatrixAt(i, dummy.matrix);
	});

	mesh.instanceMatrix.needsUpdate = true;
}

// ============================================================================
// MATERIAL HELPERS
// ============================================================================

/**
 * Create a hex-shaped clipping plane material
 * Can be used to mask any geometry to hex shape
 */
export function createHexClipMaterial(
	baseMaterial: THREE.Material,
	hexSize: number,
	orientation: HexOrientation = "pointy",
): THREE.Material {
	// Clone the material
	const material = baseMaterial.clone();

	// Create 6 clipping planes forming a hexagon
	const clippingPlanes: THREE.Plane[] = [];
	const innerRadius = hexInnerRadius(hexSize);

	for (let i = 0; i < 6; i++) {
		const angle =
			orientation === "pointy"
				? Math.PI / 6 + i * (Math.PI / 3)
				: i * (Math.PI / 3);

		const normal = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
		const plane = new THREE.Plane(normal, innerRadius);
		clippingPlanes.push(plane);
	}

	// Apply clipping planes to material (these properties exist on all Three.js materials)
	if ("clippingPlanes" in material) {
		(material as THREE.MeshStandardMaterial).clippingPlanes = clippingPlanes;
		(material as THREE.MeshStandardMaterial).clipIntersection = false;
	}

	return material;
}
