/**
 * BabylonJS Mesh Factory Utilities
 *
 * Helper functions for creating common meshes and converting types.
 */

import {
    Color3,
    MeshBuilder,
    StandardMaterial,
    Vector3,
    type AbstractMesh,
    type Scene,
} from '@babylonjs/core';

/**
 * Create a simple box mesh
 */
export function createBox(
  name: string,
  size: number,
  scene: Scene,
  color?: Color3
): AbstractMesh {
  const box = MeshBuilder.CreateBox(name, { size }, scene);

  if (color) {
    const material = new StandardMaterial(`${name}_material`, scene);
    material.diffuseColor = color;
    material.specularColor = new Color3(0, 0, 0);
    box.material = material;
  }

  return box;
}

/**
 * Create a sphere mesh
 */
export function createSphere(
  name: string,
  diameter: number,
  scene: Scene,
  color?: Color3
): AbstractMesh {
  const sphere = MeshBuilder.CreateSphere(name, { diameter }, scene);

  if (color) {
    const material = new StandardMaterial(`${name}_material`, scene);
    material.diffuseColor = color;
    material.specularColor = new Color3(0, 0, 0);
    sphere.material = material;
  }

  return sphere;
}

/**
 * Create a cylinder mesh
 */
export function createCylinder(
  name: string,
  height: number,
  diameter: number,
  scene: Scene,
  color?: Color3
): AbstractMesh {
  const cylinder = MeshBuilder.CreateCylinder(name, { height, diameter }, scene);

  if (color) {
    const material = new StandardMaterial(`${name}_material`, scene);
    material.diffuseColor = color;
    material.specularColor = new Color3(0, 0, 0);
    cylinder.material = material;
  }

  return cylinder;
}

/**
 * Create a ground plane
 */
export function createGround(
  name: string,
  width: number,
  height: number,
  scene: Scene,
  color?: Color3
): AbstractMesh {
  const ground = MeshBuilder.CreateGround(name, { width, height }, scene);

  if (color) {
    const material = new StandardMaterial(`${name}_material`, scene);
    material.diffuseColor = color;
    material.specularColor = new Color3(0, 0, 0);
    ground.material = material;
  }

  return ground;
}

/**
 * Convert hex color to BabylonJS Color3
 */
export function hexToColor3(hex: number): Color3 {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;
  return new Color3(r, g, b);
}

/**
 * Create Vector3 from array
 */
export function vec3FromArray(arr: [number, number, number]): Vector3 {
  return new Vector3(arr[0], arr[1], arr[2]);
}

/**
 * Clone Vector3
 */
export function cloneVector3(v: Vector3): Vector3 {
  return new Vector3(v.x, v.y, v.z);
}
