/**
 * ProceduralBackground - Seeded background layer generation
 *
 * Generates background layers as ACTUAL 3D GEOMETRY so collision matches visuals.
 * No AI-generated images - everything is meshes that define both appearance and walkable bounds.
 *
 * Layer Structure (FF7 diorama style):
 * - Ground plane (y=0): Where characters walk
 * - Building collision (y=0+): Blocks that define walkable bounds
 * - Visual buildings (z=-15 to -60): Background scenery with depth
 *
 * All generation is deterministic from seed - same seed = same layout.
 */

import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';

export interface ProceduralBackgroundProps {
  /** Master seed for deterministic generation */
  seed: string;
  /** Theme affects colors and density */
  theme: 'neon' | 'slum' | 'corporate' | 'industrial' | 'sunset';
  /** Playable area bounds - backgrounds frame this area */
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  /** Building density 0-1 */
  density?: number;
  /** Callback with collision meshes for walkable area calculation */
  onCollisionMeshesReady?: (meshes: AbstractMesh[]) => void;
}

// Theme color palettes
const THEME_COLORS: Record<
  ProceduralBackgroundProps['theme'],
  { building: Color3; accent: Color3; neon: Color3; ground: Color3 }
> = {
  neon: {
    building: new Color3(0.1, 0.1, 0.15),
    accent: new Color3(0.2, 0.2, 0.25),
    neon: new Color3(1, 0, 0.8),
    ground: new Color3(0.08, 0.08, 0.1),
  },
  slum: {
    building: new Color3(0.15, 0.12, 0.1),
    accent: new Color3(0.2, 0.15, 0.12),
    neon: new Color3(0.8, 0.6, 0.2),
    ground: new Color3(0.1, 0.08, 0.06),
  },
  corporate: {
    building: new Color3(0.12, 0.12, 0.14),
    accent: new Color3(0.25, 0.25, 0.28),
    neon: new Color3(0.2, 0.6, 1),
    ground: new Color3(0.06, 0.06, 0.08),
  },
  industrial: {
    building: new Color3(0.14, 0.13, 0.12),
    accent: new Color3(0.25, 0.2, 0.15),
    neon: new Color3(1, 0.6, 0.1),
    ground: new Color3(0.1, 0.08, 0.07),
  },
  sunset: {
    building: new Color3(0.12, 0.1, 0.12),
    accent: new Color3(0.2, 0.15, 0.18),
    neon: new Color3(1, 0.4, 0.6),
    ground: new Color3(0.1, 0.06, 0.08),
  },
};

export function ProceduralBackground({
  seed,
  theme,
  bounds,
  density = 0.6,
  onCollisionMeshesReady,
}: ProceduralBackgroundProps) {
  const scene = useScene();
  const meshesRef = useRef<AbstractMesh[]>([]);
  const materialsRef = useRef<StandardMaterial[]>([]);

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const materials: StandardMaterial[] = [];
    const collisionMeshes: AbstractMesh[] = [];

    // Seeded random generator
    const rng = createSeededRNG(seed);
    const colors = THEME_COLORS[theme];

    // Create materials
    const buildingMat = new StandardMaterial('bgBuilding', scene);
    buildingMat.diffuseColor = colors.building;
    buildingMat.specularColor = new Color3(0.05, 0.05, 0.05);
    materials.push(buildingMat);

    const accentMat = new StandardMaterial('bgAccent', scene);
    accentMat.diffuseColor = colors.accent;
    accentMat.specularColor = new Color3(0.1, 0.1, 0.1);
    materials.push(accentMat);

    const neonMat = new StandardMaterial('bgNeon', scene);
    neonMat.diffuseColor = colors.neon.scale(0.3);
    neonMat.emissiveColor = colors.neon;
    neonMat.specularColor = new Color3(0, 0, 0);
    materials.push(neonMat);

    const groundMat = new StandardMaterial('bgGround', scene);
    groundMat.diffuseColor = colors.ground;
    groundMat.specularColor = new Color3(0.02, 0.02, 0.02);
    materials.push(groundMat);

    // =====================================================================
    // GROUND PLANE - The walkable area
    // =====================================================================
    const groundWidth = bounds.maxX - bounds.minX;
    const groundDepth = bounds.maxZ - bounds.minZ;

    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: groundWidth, height: groundDepth },
      scene
    );
    ground.position.x = (bounds.minX + bounds.maxX) / 2;
    ground.position.z = (bounds.minZ + bounds.maxZ) / 2;
    ground.position.y = 0;
    ground.material = groundMat;
    ground.receiveShadows = true;
    meshes.push(ground);

    // =====================================================================
    // LEFT SIDE BUILDINGS - Frame left edge, define left boundary
    // =====================================================================
    const leftBuildings = generateBuildingRow(
      scene,
      {
        startX: bounds.minX - 15,
        endX: bounds.minX - 3,
        z: -5,
        zVariance: 8,
        minHeight: 15,
        maxHeight: 40,
        count: Math.floor(5 + density * 5),
      },
      rng,
      buildingMat,
      accentMat
    );
    meshes.push(...leftBuildings.meshes);
    collisionMeshes.push(...leftBuildings.collision);

    // =====================================================================
    // RIGHT SIDE BUILDINGS - Frame right edge, define right boundary
    // =====================================================================
    const rightBuildings = generateBuildingRow(
      scene,
      {
        startX: bounds.maxX + 3,
        endX: bounds.maxX + 15,
        z: -5,
        zVariance: 8,
        minHeight: 15,
        maxHeight: 40,
        count: Math.floor(5 + density * 5),
      },
      rng,
      buildingMat,
      accentMat
    );
    meshes.push(...rightBuildings.meshes);
    collisionMeshes.push(...rightBuildings.collision);

    // =====================================================================
    // MIDGROUND LAYER (z = -15 to -25) - Close background buildings
    // =====================================================================
    const midgroundCount = Math.floor(8 + density * 10);
    for (let i = 0; i < midgroundCount; i++) {
      const x = bounds.minX - 10 + rng() * (groundWidth + 20);
      const z = -15 - rng() * 10;
      const width = 8 + rng() * 12;
      const height = 20 + rng() * 30;
      const depth = 5 + rng() * 8;

      const building = MeshBuilder.CreateBox(`midground_${i}`, { width, height, depth }, scene);
      building.position = new Vector3(x, height / 2, z);
      building.material = rng() > 0.7 ? accentMat : buildingMat;
      meshes.push(building);

      // Add windows (emissive rectangles)
      if (rng() > 0.3) {
        const windows = createBuildingWindows(
          scene,
          building.position,
          width,
          height,
          z + depth / 2 + 0.1,
          rng,
          colors.neon
        );
        meshes.push(...windows);
      }
    }

    // =====================================================================
    // FAR BACKGROUND LAYER (z = -35 to -60) - Distant cityscape
    // =====================================================================
    const farCount = Math.floor(15 + density * 20);
    for (let i = 0; i < farCount; i++) {
      const x = bounds.minX - 40 + rng() * (groundWidth + 80);
      const z = -35 - rng() * 25;
      const width = 10 + rng() * 20;
      const height = 30 + rng() * 60;
      const depth = 8 + rng() * 15;

      const building = MeshBuilder.CreateBox(`far_${i}`, { width, height, depth }, scene);
      building.position = new Vector3(x, height / 2, z);

      // Far buildings are darker/foggier
      const farMat = new StandardMaterial(`farMat_${i}`, scene);
      farMat.diffuseColor = colors.building.scale(0.5 + (z + 60) / 50);
      farMat.specularColor = new Color3(0, 0, 0);
      materials.push(farMat);
      building.material = farMat;

      meshes.push(building);
    }

    // =====================================================================
    // NEON SIGNS - Scattered accents
    // =====================================================================
    const signCount = Math.floor(3 + density * 5);
    for (let i = 0; i < signCount; i++) {
      const x = bounds.minX - 8 + rng() * (groundWidth + 16);
      const y = 8 + rng() * 15;
      const z = -10 - rng() * 15;

      const sign = MeshBuilder.CreateBox(
        `neonSign_${i}`,
        { width: 3 + rng() * 4, height: 1 + rng() * 2, depth: 0.3 },
        scene
      );
      sign.position = new Vector3(x, y, z);
      sign.material = neonMat;
      meshes.push(sign);
    }

    // =====================================================================
    // BACK BOUNDARY WALL - Invisible collision at far edge
    // =====================================================================
    const backWall = MeshBuilder.CreateBox(
      'backWall',
      { width: groundWidth + 20, height: 5, depth: 1 },
      scene
    );
    backWall.position = new Vector3((bounds.minX + bounds.maxX) / 2, 2.5, bounds.minZ - 0.5);
    backWall.isVisible = false;
    collisionMeshes.push(backWall);
    meshes.push(backWall);

    // Store refs
    meshesRef.current = meshes;
    materialsRef.current = materials;

    // Notify parent of collision meshes
    if (onCollisionMeshesReady) {
      onCollisionMeshesReady(collisionMeshes);
    }

    return () => {
      for (const mesh of meshesRef.current) {
        mesh.dispose();
      }
      for (const mat of materialsRef.current) {
        mat.dispose();
      }
      meshesRef.current = [];
      materialsRef.current = [];
    };
  }, [scene, seed, theme, bounds, density, onCollisionMeshesReady]);

  return null;
}

/**
 * Seeded random number generator
 */
function createSeededRNG(seed: string): () => number {
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
 * Generate a row of buildings for side framing
 */
function generateBuildingRow(
  scene: Scene,
  config: {
    startX: number;
    endX: number;
    z: number;
    zVariance: number;
    minHeight: number;
    maxHeight: number;
    count: number;
  },
  rng: () => number,
  buildingMat: StandardMaterial,
  accentMat: StandardMaterial
): { meshes: AbstractMesh[]; collision: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];
  const collision: AbstractMesh[] = [];
  const spacing = (config.endX - config.startX) / config.count;

  for (let i = 0; i < config.count; i++) {
    const x = config.startX + i * spacing + (rng() - 0.5) * spacing * 0.5;
    const z = config.z + (rng() - 0.5) * config.zVariance;
    const width = 4 + rng() * 6;
    const height = config.minHeight + rng() * (config.maxHeight - config.minHeight);
    const depth = 4 + rng() * 6;

    const building = MeshBuilder.CreateBox(`row_building_${i}`, { width, height, depth }, scene);
    building.position = new Vector3(x, height / 2, z);
    building.material = rng() > 0.6 ? accentMat : buildingMat;
    meshes.push(building);

    // Collision box at ground level
    const collisionBox = MeshBuilder.CreateBox(
      `collision_${i}`,
      { width: width + 1, height: 3, depth: depth + 1 },
      scene
    );
    collisionBox.position = new Vector3(x, 1.5, z);
    collisionBox.isVisible = false;
    collision.push(collisionBox);
    meshes.push(collisionBox);
  }

  return { meshes, collision };
}

/**
 * Create glowing window rectangles on a building
 */
function createBuildingWindows(
  scene: Scene,
  buildingPos: Vector3,
  buildingWidth: number,
  buildingHeight: number,
  z: number,
  rng: () => number,
  neonColor: Color3
): AbstractMesh[] {
  const windows: AbstractMesh[] = [];
  const rows = Math.floor(buildingHeight / 4);
  const cols = Math.floor(buildingWidth / 3);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Randomly skip some windows
      if (rng() < 0.4) continue;

      const win = MeshBuilder.CreatePlane(
        `window_${buildingPos.x}_${row}_${col}`,
        { width: 1.5, height: 2 },
        scene
      );

      const xOffset = (col - (cols - 1) / 2) * 2.5;
      const yOffset = (row - (rows - 1) / 2) * 3.5;

      win.position = new Vector3(buildingPos.x + xOffset, buildingPos.y + yOffset, z);

      // Varying window brightness
      const brightness = 0.2 + rng() * 0.6;
      const windowMat = new StandardMaterial(`winMat_${win.name}`, scene);
      windowMat.emissiveColor = neonColor.scale(brightness);
      windowMat.specularColor = new Color3(0, 0, 0);
      win.material = windowMat;

      windows.push(win);
    }
  }

  return windows;
}
