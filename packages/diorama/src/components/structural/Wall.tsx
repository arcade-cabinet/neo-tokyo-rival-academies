/**
 * Wall - Procedural wall segment building block
 *
 * A single wall segment that can be:
 * - Different heights and widths
 * - Different materials (concrete, metal, glass)
 * - With or without windows
 * - With optional damage/graffiti
 *
 * Used to construct buildings, barriers, facades.
 */

import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  StandardMaterial,
  type Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';

export type WallMaterial = 'concrete' | 'metal' | 'glass' | 'brick';
export type WallCondition = 'pristine' | 'worn' | 'damaged' | 'ruined';

export interface WallProps {
  /** Unique identifier */
  id: string;
  /** Wall position */
  position: Vector3;
  /** Wall dimensions (width, height, depth) */
  size: { width: number; height: number; depth: number };
  /** Material type */
  material?: WallMaterial;
  /** Surface condition */
  condition?: WallCondition;
  /** Rotation in radians */
  rotation?: number;
  /** Add windows */
  windows?: {
    columns: number;
    rows: number;
    emissive?: boolean;
  };
  /** Seed for procedural variation */
  seed: string;
  /** Callback when mesh is ready */
  onReady?: (mesh: AbstractMesh) => void;
}

/**
 * Create seeded RNG from string
 */
function createRNG(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 0xffffffff;
  };
}

/**
 * Get base color for material type
 */
function getMaterialColor(material: WallMaterial, rng: () => number): Color3 {
  const variation = (rng() - 0.5) * 0.1;

  switch (material) {
    case 'concrete':
      return new Color3(0.35 + variation, 0.35 + variation, 0.38 + variation);
    case 'metal':
      return new Color3(0.25 + variation, 0.28 + variation, 0.32 + variation);
    case 'glass':
      return new Color3(0.15 + variation, 0.2 + variation, 0.25 + variation);
    case 'brick':
      return new Color3(0.45 + variation, 0.25 + variation, 0.2 + variation);
    default:
      return new Color3(0.3, 0.3, 0.3);
  }
}

/**
 * Apply condition effects to color
 */
function applyCondition(color: Color3, condition: WallCondition, rng: () => number): Color3 {
  switch (condition) {
    case 'pristine':
      return color;
    case 'worn':
      return color.scale(0.85 + rng() * 0.1);
    case 'damaged':
      return color.scale(0.7 + rng() * 0.15);
    case 'ruined':
      return color.scale(0.5 + rng() * 0.2);
    default:
      return color;
  }
}

/**
 * Wall component
 */
export function Wall({
  id,
  position,
  size,
  material = 'concrete',
  condition = 'worn',
  rotation = 0,
  windows,
  seed,
  onReady,
}: WallProps) {
  const scene = useScene();
  const meshesRef = useRef<AbstractMesh[]>([]);

  useEffect(() => {
    if (!scene) return;

    const rng = createRNG(seed);
    const meshes: AbstractMesh[] = [];

    // Main wall body
    const wallMesh = MeshBuilder.CreateBox(
      `wall_${id}`,
      {
        width: size.width,
        height: size.height,
        depth: size.depth,
      },
      scene
    );

    wallMesh.position = position.clone();
    wallMesh.position.y += size.height / 2; // Position from base
    wallMesh.rotation.y = rotation;

    // Wall material
    const wallMat = new StandardMaterial(`wallMat_${id}`, scene);
    const baseColor = getMaterialColor(material, rng);
    const finalColor = applyCondition(baseColor, condition, rng);
    wallMat.diffuseColor = finalColor;
    wallMat.specularColor =
      material === 'metal' || material === 'glass'
        ? new Color3(0.3, 0.3, 0.3)
        : new Color3(0.05, 0.05, 0.05);

    if (material === 'glass') {
      wallMat.alpha = 0.6;
    }

    wallMesh.material = wallMat;
    meshes.push(wallMesh);

    // Add windows if specified
    if (windows && windows.columns > 0 && windows.rows > 0) {
      const windowWidth = (size.width * 0.7) / windows.columns;
      const windowHeight = (size.height * 0.6) / windows.rows;
      const startX = -((windows.columns - 1) * windowWidth) / 2;
      const startY = size.height * 0.2;

      for (let col = 0; col < windows.columns; col++) {
        for (let row = 0; row < windows.rows; row++) {
          const windowMesh = MeshBuilder.CreateBox(
            `window_${id}_${col}_${row}`,
            {
              width: windowWidth * 0.8,
              height: windowHeight * 0.8,
              depth: size.depth + 0.02, // Slightly proud
            },
            scene
          );

          const windowX = startX + col * windowWidth;
          const windowY = startY + row * windowHeight + windowHeight / 2;

          windowMesh.position = position.clone();
          windowMesh.position.x += windowX * Math.cos(rotation);
          windowMesh.position.z += windowX * Math.sin(rotation);
          windowMesh.position.y += windowY;
          windowMesh.rotation.y = rotation;

          const windowMat = new StandardMaterial(`windowMat_${id}_${col}_${row}`, scene);
          windowMat.diffuseColor = new Color3(0.1, 0.12, 0.15);
          windowMat.alpha = 0.8;

          // Emissive windows (lit interiors)
          if (windows.emissive && rng() > 0.3) {
            const warmth = rng();
            windowMat.emissiveColor = new Color3(
              0.4 + warmth * 0.3,
              0.35 + warmth * 0.2,
              0.2 + warmth * 0.1
            );
          }

          windowMesh.material = windowMat;
          meshes.push(windowMesh);
        }
      }
    }

    meshesRef.current = meshes;

    // Notify parent
    if (onReady && meshes.length > 0) {
      onReady(meshes[0]);
    }

    return () => {
      for (const mesh of meshesRef.current) {
        mesh.dispose();
      }
      meshesRef.current = [];
    };
  }, [scene, id, position, size, material, condition, rotation, windows, seed, onReady]);

  return null;
}

export default Wall;
