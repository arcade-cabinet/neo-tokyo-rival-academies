/**
 * Debris - Scattered debris/clutter component
 *
 * Random debris piles for post-flood urban environments.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type DebrisType = 'construction' | 'trash' | 'natural' | 'flood' | 'mixed';
export type DebrisSize = 'small' | 'medium' | 'large';

export interface DebrisProps {
  id: string;
  position: Vector3;
  /** Debris type */
  type?: DebrisType;
  /** Debris spread size */
  size?: DebrisSize;
  /** Density of debris 0-1 */
  density?: number;
  /** Spread radius */
  radius?: number;
  /** Seed for procedural variation */
  seed?: number;
}

const SIZE_COUNTS: Record<DebrisSize, { min: number; max: number }> = {
  small: { min: 3, max: 6 },
  medium: { min: 6, max: 12 },
  large: { min: 12, max: 20 },
};

export function Debris({
  id,
  position,
  type = 'mixed',
  size = 'medium',
  density = 0.7,
  radius = 2,
  seed,
}: DebrisProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : { next: Math.random };

    const counts = SIZE_COUNTS[size];
    const itemCount = Math.floor(counts.min + rng.next() * (counts.max - counts.min) * density);

    // Material pools by type
    const constructionColors = [
      new Color3(0.5, 0.5, 0.52), // Concrete
      new Color3(0.45, 0.35, 0.2), // Wood
      new Color3(0.35, 0.37, 0.4), // Metal
      new Color3(0.55, 0.35, 0.25), // Brick
    ];

    const trashColors = [
      new Color3(0.2, 0.2, 0.22), // Black plastic
      new Color3(0.8, 0.8, 0.82), // White plastic
      new Color3(0.3, 0.5, 0.7), // Blue
      new Color3(0.6, 0.5, 0.35), // Cardboard
    ];

    const naturalColors = [
      new Color3(0.3, 0.25, 0.15), // Wood/bark
      new Color3(0.25, 0.35, 0.2), // Leaves
      new Color3(0.4, 0.38, 0.35), // Stone
    ];

    const floodColors = [
      new Color3(0.3, 0.25, 0.2), // Waterlogged wood
      new Color3(0.35, 0.35, 0.38), // Metal debris
      new Color3(0.4, 0.4, 0.35), // Mud-covered
      new Color3(0.2, 0.3, 0.25), // Seaweed/algae
    ];

    // Generate debris items
    for (let i = 0; i < itemCount; i++) {
      const angle = rng.next() * Math.PI * 2;
      const dist = rng.next() * radius;
      const itemX = posX + Math.cos(angle) * dist;
      const itemZ = posZ + Math.sin(angle) * dist;

      // Decide item type
      let colorPool: Color3[];
      let metallic = 0;
      let roughness = 0.8;

      if (type === 'construction') {
        colorPool = constructionColors;
        metallic = rng.next() > 0.7 ? 0.7 : 0;
        roughness = 0.7 + rng.next() * 0.2;
      } else if (type === 'trash') {
        colorPool = trashColors;
        metallic = 0.1;
        roughness = 0.5 + rng.next() * 0.3;
      } else if (type === 'natural') {
        colorPool = naturalColors;
        metallic = 0;
        roughness = 0.85 + rng.next() * 0.1;
      } else if (type === 'flood') {
        colorPool = floodColors;
        metallic = rng.next() > 0.6 ? 0.5 : 0;
        roughness = 0.7 + rng.next() * 0.25;
      } else {
        // Mixed - pick from all
        const allColors = [...constructionColors, ...trashColors, ...naturalColors, ...floodColors];
        colorPool = allColors;
        metallic = rng.next() > 0.7 ? rng.next() * 0.6 : 0;
        roughness = 0.6 + rng.next() * 0.35;
      }

      const itemColor = colorPool[Math.floor(rng.next() * colorPool.length)];

      const mat = new PBRMaterial(`debris_mat_${id}_${i}`, scene);
      mat.albedoColor = new Color3(
        itemColor.r + (rng.next() - 0.5) * 0.1,
        itemColor.g + (rng.next() - 0.5) * 0.1,
        itemColor.b + (rng.next() - 0.5) * 0.1
      );
      mat.metallic = metallic;
      mat.roughness = roughness;

      // Random shape
      const shapeType = rng.next();
      let item: AbstractMesh;

      if (shapeType < 0.3) {
        // Box/plank
        const w = 0.1 + rng.next() * 0.3;
        const h = 0.05 + rng.next() * 0.15;
        const d = 0.1 + rng.next() * 0.4;
        item = MeshBuilder.CreateBox(`${id}_item_${i}`, { width: w, height: h, depth: d }, scene);
        item.position = new Vector3(itemX, posY + h / 2, itemZ);
      } else if (shapeType < 0.5) {
        // Cylinder/pipe piece
        const height = 0.1 + rng.next() * 0.3;
        const diameter = 0.05 + rng.next() * 0.15;
        item = MeshBuilder.CreateCylinder(`${id}_item_${i}`, { height, diameter }, scene);
        item.position = new Vector3(itemX, posY + height / 2, itemZ);
        item.rotation.x = rng.next() * Math.PI;
        item.rotation.z = rng.next() * Math.PI;
      } else if (shapeType < 0.7) {
        // Irregular rock/chunk
        const diameter = 0.1 + rng.next() * 0.25;
        item = MeshBuilder.CreateSphere(`${id}_item_${i}`, { diameter }, scene);
        item.position = new Vector3(itemX, posY + diameter / 3, itemZ);
        item.scaling = new Vector3(
          0.7 + rng.next() * 0.6,
          0.5 + rng.next() * 0.5,
          0.7 + rng.next() * 0.6
        );
      } else if (shapeType < 0.85) {
        // Flat sheet/panel
        const w = 0.2 + rng.next() * 0.5;
        const d = 0.2 + rng.next() * 0.5;
        item = MeshBuilder.CreateBox(
          `${id}_item_${i}`,
          { width: w, height: 0.02, depth: d },
          scene
        );
        item.position = new Vector3(itemX, posY + 0.01 + rng.next() * 0.05, itemZ);
        item.rotation.x = (rng.next() - 0.5) * 0.3;
        item.rotation.z = (rng.next() - 0.5) * 0.3;
      } else {
        // Triangular/wedge piece
        const size = 0.1 + rng.next() * 0.2;
        item = MeshBuilder.CreateCylinder(
          `${id}_item_${i}`,
          {
            height: size,
            diameterTop: 0,
            diameterBottom: size,
            tessellation: 3,
          },
          scene
        );
        item.position = new Vector3(itemX, posY + size / 2, itemZ);
        item.rotation.x = rng.next() * Math.PI;
      }

      item.rotation.y = rng.next() * Math.PI * 2;
      item.material = mat;
      meshes.push(item);
    }

    // Add some connecting elements for flood debris
    if (type === 'flood' || type === 'mixed') {
      const seaweedCount = Math.floor(rng.next() * 3 * density);
      const seaweedMat = new PBRMaterial(`debris_seaweed_${id}`, scene);
      seaweedMat.albedoColor = new Color3(0.15, 0.3, 0.2);
      seaweedMat.metallic = 0;
      seaweedMat.roughness = 0.9;

      for (let i = 0; i < seaweedCount; i++) {
        const angle = rng.next() * Math.PI * 2;
        const dist = rng.next() * radius * 0.8;
        const sw = MeshBuilder.CreateBox(
          `${id}_seaweed_${i}`,
          {
            width: 0.3 + rng.next() * 0.3,
            height: 0.01,
            depth: 0.05 + rng.next() * 0.1,
          },
          scene
        );
        sw.position = new Vector3(
          posX + Math.cos(angle) * dist,
          posY + 0.005,
          posZ + Math.sin(angle) * dist
        );
        sw.rotation.y = rng.next() * Math.PI * 2;
        sw.material = seaweedMat;
        meshes.push(sw);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.material?.dispose();
        mesh.dispose();
      }
    };
  }, [scene, id, posX, posY, posZ, type, size, density, radius, seed]);

  return null;
}
