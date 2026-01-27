import { type Material, Plane } from '@babylonjs/core';

export function createLeftClippingPlane(x: number): Plane {
  return new Plane(1, 0, 0, -x);
}

export function createRightClippingPlane(x: number): Plane {
  return new Plane(-1, 0, 0, x);
}

export function applyClippingPlane(material: Material, plane: Plane): void {
  if (material.clipPlane !== undefined) {
    material.clipPlane = plane;
  }
}

export function applyLeftClipping(material: Material, x: number): void {
  const plane = createLeftClippingPlane(x);
  applyClippingPlane(material, plane);
}

export function applyRightClipping(material: Material, x: number): void {
  const plane = createRightClippingPlane(x);
  applyClippingPlane(material, plane);
}
