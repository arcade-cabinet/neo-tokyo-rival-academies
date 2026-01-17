/**
 * Clipping Plane Utilities
 *
 * Creates and applies clipping planes to materials for diorama bounds.
 */

import { type Material, Plane } from "@babylonjs/core";

/**
 * Create left clipping plane (clips content to the left of X position)
 */
export function createLeftClippingPlane(x: number): Plane {
	// Normal points right (+X), clips everything to the left
	return new Plane(1, 0, 0, -x);
}

/**
 * Create right clipping plane (clips content to the right of X position)
 */
export function createRightClippingPlane(x: number): Plane {
	// Normal points left (-X), clips everything to the right
	return new Plane(-1, 0, 0, x);
}

/**
 * Apply clipping plane to material
 */
export function applyClippingPlane(material: Material, plane: Plane): void {
	// BabylonJS materials support clipPlane property on the base Material type
	if (material.clipPlane !== undefined) {
		material.clipPlane = plane;
	}
}

/**
 * Apply left clipping plane to material
 */
export function applyLeftClipping(material: Material, x: number): void {
	const plane = createLeftClippingPlane(x);
	applyClippingPlane(material, plane);
}

/**
 * Apply right clipping plane to material
 */
export function applyRightClipping(material: Material, x: number): void {
	const plane = createRightClippingPlane(x);
	applyClippingPlane(material, plane);
}
