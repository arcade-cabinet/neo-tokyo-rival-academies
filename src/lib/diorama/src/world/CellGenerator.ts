/**
 * CellGenerator - Procedural content for world cells
 *
 * Generates buildings, props, and collision for each cell based on:
 * - District profile (theme, density)
 * - Cell type (building, street, plaza, etc.)
 * - Cell seed (deterministic)
 */

import type { AbstractMesh, Scene } from '@babylonjs/core';
import { Color3, MeshBuilder, StandardMaterial, Vector3 } from '@babylonjs/core';
import type { DistrictId, WorldCell } from './WorldGrid';
import { CELL_SIZE } from './WorldGrid';

// District visual profiles
export interface DistrictProfile {
  id: DistrictId;
  name: string;
  theme: 'slum' | 'neon' | 'corporate' | 'industrial' | 'transition';
  density: number; // 0-1
  buildingHeightRange: [number, number];
  neonIntensity: number; // 0-1
  propDensity: number; // 0-1
  colors: {
    building: Color3;
    accent: Color3;
    neon: Color3;
    ground: Color3;
  };
}

export const DISTRICT_PROFILES: Record<DistrictId, DistrictProfile> = {
  academy_gate_slums: {
    id: 'academy_gate_slums',
    name: 'Academy Gate Slums',
    theme: 'slum',
    density: 0.45,
    buildingHeightRange: [5, 15],
    neonIntensity: 0.3,
    propDensity: 0.6,
    colors: {
      building: new Color3(0.15, 0.12, 0.1),
      accent: new Color3(0.2, 0.15, 0.12),
      neon: new Color3(0.8, 0.6, 0.2),
      ground: new Color3(0.1, 0.08, 0.06),
    },
  },
  neon_spire_entertainment: {
    id: 'neon_spire_entertainment',
    name: 'Neon Spire Entertainment',
    theme: 'neon',
    density: 0.78,
    buildingHeightRange: [20, 50],
    neonIntensity: 0.9,
    propDensity: 0.8,
    colors: {
      building: new Color3(0.1, 0.1, 0.15),
      accent: new Color3(0.2, 0.2, 0.25),
      neon: new Color3(1, 0, 0.8),
      ground: new Color3(0.08, 0.08, 0.1),
    },
  },
  corporate_pinnacle: {
    id: 'corporate_pinnacle',
    name: 'Corporate Pinnacle',
    theme: 'corporate',
    density: 0.9,
    buildingHeightRange: [40, 80],
    neonIntensity: 0.4,
    propDensity: 0.3,
    colors: {
      building: new Color3(0.12, 0.12, 0.14),
      accent: new Color3(0.25, 0.25, 0.28),
      neon: new Color3(0.2, 0.6, 1),
      ground: new Color3(0.06, 0.06, 0.08),
    },
  },
  industrial_forge: {
    id: 'industrial_forge',
    name: 'Industrial Forge',
    theme: 'industrial',
    density: 0.65,
    buildingHeightRange: [10, 30],
    neonIntensity: 0.2,
    propDensity: 0.7,
    colors: {
      building: new Color3(0.14, 0.13, 0.12),
      accent: new Color3(0.25, 0.2, 0.15),
      neon: new Color3(1, 0.6, 0.1),
      ground: new Color3(0.1, 0.08, 0.07),
    },
  },
  underground_sewer: {
    id: 'underground_sewer',
    name: 'Underground Sewer',
    theme: 'slum',
    density: 0.4,
    buildingHeightRange: [3, 8],
    neonIntensity: 0.1,
    propDensity: 0.5,
    colors: {
      building: new Color3(0.1, 0.1, 0.08),
      accent: new Color3(0.12, 0.12, 0.1),
      neon: new Color3(0.3, 0.5, 0.2),
      ground: new Color3(0.05, 0.05, 0.04),
    },
  },
  rooftop_skybridge: {
    id: 'rooftop_skybridge',
    name: 'Rooftop Skybridge',
    theme: 'transition',
    density: 0.7,
    buildingHeightRange: [15, 40],
    neonIntensity: 0.5,
    propDensity: 0.4,
    colors: {
      building: new Color3(0.12, 0.12, 0.14),
      accent: new Color3(0.18, 0.18, 0.2),
      neon: new Color3(0.6, 0.8, 1),
      ground: new Color3(0.08, 0.08, 0.09),
    },
  },
  abandoned_overgrowth: {
    id: 'abandoned_overgrowth',
    name: 'Abandoned Overgrowth',
    theme: 'slum',
    density: 0.35,
    buildingHeightRange: [5, 20],
    neonIntensity: 0.05,
    propDensity: 0.8,
    colors: {
      building: new Color3(0.12, 0.14, 0.1),
      accent: new Color3(0.15, 0.18, 0.12),
      neon: new Color3(0.2, 0.6, 0.3),
      ground: new Color3(0.08, 0.1, 0.06),
    },
  },
  club_eclipse: {
    id: 'club_eclipse',
    name: 'Club Eclipse',
    theme: 'neon',
    density: 0.82,
    buildingHeightRange: [15, 35],
    neonIntensity: 1.0,
    propDensity: 0.9,
    colors: {
      building: new Color3(0.08, 0.08, 0.12),
      accent: new Color3(0.15, 0.15, 0.2),
      neon: new Color3(1, 0.2, 0.8),
      ground: new Color3(0.05, 0.05, 0.08),
    },
  },
  central_pillar_hub: {
    id: 'central_pillar_hub',
    name: 'Central Pillar Hub',
    theme: 'corporate',
    density: 0.85,
    buildingHeightRange: [30, 70],
    neonIntensity: 0.6,
    propDensity: 0.5,
    colors: {
      building: new Color3(0.1, 0.1, 0.12),
      accent: new Color3(0.2, 0.2, 0.25),
      neon: new Color3(0.4, 0.6, 1),
      ground: new Color3(0.06, 0.06, 0.08),
    },
  },
  fringe_resistance: {
    id: 'fringe_resistance',
    name: 'Fringe Resistance',
    theme: 'transition',
    density: 0.55,
    buildingHeightRange: [8, 25],
    neonIntensity: 0.35,
    propDensity: 0.6,
    colors: {
      building: new Color3(0.13, 0.12, 0.12),
      accent: new Color3(0.18, 0.16, 0.15),
      neon: new Color3(0.9, 0.3, 0.2),
      ground: new Color3(0.08, 0.07, 0.07),
    },
  },
};

export interface CellContent {
  meshes: AbstractMesh[];
  materials: StandardMaterial[];
  collisionMeshes: AbstractMesh[];
}

/**
 * Generate content for a single cell
 */
export function generateCellContent(scene: Scene, cell: WorldCell): CellContent {
  const profile = DISTRICT_PROFILES[cell.districtId as DistrictId];
  const rng = createSeededRNG(cell.seed);

  const meshes: AbstractMesh[] = [];
  const materials: StandardMaterial[] = [];
  const collisionMeshes: AbstractMesh[] = [];

  // Create materials for this cell
  const cellMaterials = createCellMaterials(scene, cell.seed, profile);
  materials.push(...Object.values(cellMaterials));

  // Ground mesh
  const ground = createGround(scene, cell, cellMaterials.ground);
  meshes.push(ground);

  // Generate content based on cell type
  switch (cell.cellType) {
    case 'building': {
      const buildings = generateBuildings(scene, cell, profile, rng, cellMaterials);
      meshes.push(...buildings.meshes);
      collisionMeshes.push(...buildings.collision);
      break;
    }

    case 'street': {
      const streetContent = generateStreet(scene, cell, profile, rng, cellMaterials);
      meshes.push(...streetContent.meshes);
      break;
    }

    case 'plaza': {
      const plazaContent = generatePlaza(scene, cell, profile, rng, cellMaterials);
      meshes.push(...plazaContent.meshes);
      break;
    }

    case 'alley': {
      const alleyContent = generateAlley(scene, cell, profile, rng, cellMaterials);
      meshes.push(...alleyContent.meshes);
      collisionMeshes.push(...alleyContent.collision);
      break;
    }

    case 'park': {
      const parkContent = generatePark(scene, cell, profile, rng, cellMaterials);
      meshes.push(...parkContent.meshes);
      break;
    }

    case 'elevator': {
      const elevatorContent = generateElevator(scene, cell, profile, cellMaterials);
      meshes.push(...elevatorContent.meshes);
      collisionMeshes.push(...elevatorContent.collision);
      break;
    }

    case 'bridge': {
      const bridgeContent = generateBridge(scene, cell, profile, cellMaterials);
      meshes.push(...bridgeContent.meshes);
      collisionMeshes.push(...bridgeContent.collision);
      break;
    }
  }

  // Add neon signs based on district intensity
  if (rng() < profile.neonIntensity) {
    const signs = generateNeonSigns(scene, cell, profile, rng, cellMaterials);
    meshes.push(...signs);
  }

  // Add props based on district density
  if (rng() < profile.propDensity) {
    const props = generateProps(scene, cell, profile, rng, cellMaterials);
    meshes.push(...props);
  }

  return { meshes, materials, collisionMeshes };
}

/**
 * Dispose cell content
 */
export function disposeCellContent(content: CellContent): void {
  for (const mesh of content.meshes) {
    mesh.dispose();
  }
  for (const mat of content.materials) {
    mat.dispose();
  }
}

// ============================================================================
// Generation helpers
// ============================================================================

function createCellMaterials(scene: Scene, seed: string, profile: DistrictProfile) {
  const building = new StandardMaterial(`${seed}_building`, scene);
  building.diffuseColor = profile.colors.building;
  building.specularColor = new Color3(0.05, 0.05, 0.05);

  const accent = new StandardMaterial(`${seed}_accent`, scene);
  accent.diffuseColor = profile.colors.accent;
  accent.specularColor = new Color3(0.1, 0.1, 0.1);

  const neon = new StandardMaterial(`${seed}_neon`, scene);
  neon.diffuseColor = profile.colors.neon.scale(0.3);
  neon.emissiveColor = profile.colors.neon;
  neon.specularColor = new Color3(0, 0, 0);

  const ground = new StandardMaterial(`${seed}_ground`, scene);
  ground.diffuseColor = profile.colors.ground;
  ground.specularColor = new Color3(0.02, 0.02, 0.02);

  return { building, accent, neon, ground };
}

function createGround(scene: Scene, cell: WorldCell, material: StandardMaterial): AbstractMesh {
  const ground = MeshBuilder.CreateGround(
    `ground_${cell.x}_${cell.z}`,
    { width: CELL_SIZE, height: CELL_SIZE },
    scene
  );
  ground.position = new Vector3(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);
  ground.material = material;
  ground.receiveShadows = true;
  return ground;
}

function generateBuildings(
  scene: Scene,
  cell: WorldCell,
  profile: DistrictProfile,
  rng: () => number,
  materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[]; collision: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];
  const collision: AbstractMesh[] = [];

  // How many buildings in this cell? Based on density
  const count = Math.floor(1 + profile.density * 3);

  for (let i = 0; i < count; i++) {
    const [minH, maxH] = profile.buildingHeightRange;
    const height = minH + rng() * (maxH - minH);
    const width = 4 + rng() * 8;
    const depth = 4 + rng() * 8;

    // Position within cell (avoid edges for streets)
    const margin = 2;
    const x = cell.worldPosition.x + (rng() - 0.5) * (CELL_SIZE - margin * 2 - width);
    const z = cell.worldPosition.z + (rng() - 0.5) * (CELL_SIZE - margin * 2 - depth);

    const building = MeshBuilder.CreateBox(
      `building_${cell.x}_${cell.z}_${i}`,
      { width, height, depth },
      scene
    );
    building.position = new Vector3(x, cell.worldPosition.y + height / 2, z);
    building.material = rng() > 0.7 ? materials.accent : materials.building;
    meshes.push(building);

    // Collision box at base
    const collisionBox = MeshBuilder.CreateBox(
      `collision_${cell.x}_${cell.z}_${i}`,
      { width: width + 0.5, height: 3, depth: depth + 0.5 },
      scene
    );
    collisionBox.position = new Vector3(x, cell.worldPosition.y + 1.5, z);
    collisionBox.isVisible = false;
    collision.push(collisionBox);
    meshes.push(collisionBox);

    // Windows
    if (rng() < 0.6) {
      const windows = generateWindows(scene, building, height, width, depth, rng, materials.neon);
      meshes.push(...windows);
    }
  }

  return { meshes, collision };
}

function generateWindows(
  scene: Scene,
  building: AbstractMesh,
  height: number,
  width: number,
  depth: number,
  rng: () => number,
  neonMaterial: StandardMaterial
): AbstractMesh[] {
  const windows: AbstractMesh[] = [];
  const rows = Math.floor(height / 4);
  const cols = Math.floor(width / 3);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (rng() < 0.4) continue; // Skip some windows

      const win = MeshBuilder.CreatePlane(
        `window_${building.name}_${row}_${col}`,
        { width: 1.2, height: 1.8 },
        scene
      );

      const xOffset = (col - (cols - 1) / 2) * 2.5;
      const yOffset = (row - rows / 2) * 3.5;

      win.position = new Vector3(
        building.position.x + xOffset,
        building.position.y + yOffset,
        building.position.z + depth / 2 + 0.1
      );

      const brightness = 0.2 + rng() * 0.5;
      const winMat = neonMaterial.clone(`winMat_${win.name}`);
      winMat.emissiveColor = neonMaterial.emissiveColor.scale(brightness);
      win.material = winMat;
      windows.push(win);
    }
  }

  return windows;
}

function generateStreet(
  scene: Scene,
  cell: WorldCell,
  _profile: DistrictProfile,
  _rng: () => number,
  _materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];

  // Street markings (simple lines)
  for (let i = 0; i < 3; i++) {
    const line = MeshBuilder.CreateBox(
      `streetLine_${cell.x}_${cell.z}_${i}`,
      { width: 0.2, height: 0.02, depth: CELL_SIZE * 0.8 },
      scene
    );
    line.position = new Vector3(
      cell.worldPosition.x + (i - 1) * 2,
      cell.worldPosition.y + 0.01,
      cell.worldPosition.z
    );

    const lineMat = new StandardMaterial(`lineMat_${line.name}`, scene);
    lineMat.diffuseColor = new Color3(0.8, 0.8, 0.2);
    lineMat.emissiveColor = new Color3(0.3, 0.3, 0.1);
    line.material = lineMat;
    meshes.push(line);
  }

  return { meshes };
}

function generatePlaza(
  scene: Scene,
  cell: WorldCell,
  _profile: DistrictProfile,
  rng: () => number,
  materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];

  // Decorative fountain or statue
  if (rng() > 0.5) {
    const fountain = MeshBuilder.CreateCylinder(
      `fountain_${cell.x}_${cell.z}`,
      { diameter: 4, height: 1.5, tessellation: 16 },
      scene
    );
    fountain.position = new Vector3(
      cell.worldPosition.x,
      cell.worldPosition.y + 0.75,
      cell.worldPosition.z
    );
    fountain.material = materials.accent;
    meshes.push(fountain);
  }

  return { meshes };
}

function generateAlley(
  scene: Scene,
  cell: WorldCell,
  profile: DistrictProfile,
  rng: () => number,
  materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[]; collision: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];
  const collision: AbstractMesh[] = [];

  // Narrow buildings on sides
  for (let side = 0; side < 2; side++) {
    const height = profile.buildingHeightRange[0] + rng() * 10;
    const wall = MeshBuilder.CreateBox(
      `alleyWall_${cell.x}_${cell.z}_${side}`,
      { width: 3, height, depth: CELL_SIZE },
      scene
    );
    wall.position = new Vector3(
      cell.worldPosition.x + (side === 0 ? -8 : 8),
      cell.worldPosition.y + height / 2,
      cell.worldPosition.z
    );
    wall.material = materials.building;
    meshes.push(wall);

    // Collision
    const collisionBox = MeshBuilder.CreateBox(
      `alleyCollision_${cell.x}_${cell.z}_${side}`,
      { width: 4, height: 3, depth: CELL_SIZE },
      scene
    );
    collisionBox.position = new Vector3(
      cell.worldPosition.x + (side === 0 ? -8 : 8),
      cell.worldPosition.y + 1.5,
      cell.worldPosition.z
    );
    collisionBox.isVisible = false;
    collision.push(collisionBox);
    meshes.push(collisionBox);
  }

  return { meshes, collision };
}

function generatePark(
  scene: Scene,
  cell: WorldCell,
  _profile: DistrictProfile,
  rng: () => number,
  _materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];

  // Simple "trees" as cylinders
  const treeCount = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < treeCount; i++) {
    const trunk = MeshBuilder.CreateCylinder(
      `tree_${cell.x}_${cell.z}_${i}`,
      { diameter: 0.5, height: 4, tessellation: 8 },
      scene
    );
    trunk.position = new Vector3(
      cell.worldPosition.x + (rng() - 0.5) * (CELL_SIZE - 4),
      cell.worldPosition.y + 2,
      cell.worldPosition.z + (rng() - 0.5) * (CELL_SIZE - 4)
    );

    const treeMat = new StandardMaterial(`treeMat_${trunk.name}`, scene);
    treeMat.diffuseColor = new Color3(0.3, 0.2, 0.1);
    trunk.material = treeMat;
    meshes.push(trunk);

    // Canopy
    const canopy = MeshBuilder.CreateSphere(
      `canopy_${cell.x}_${cell.z}_${i}`,
      { diameter: 3, segments: 8 },
      scene
    );
    canopy.position = trunk.position.add(new Vector3(0, 3, 0));
    const canopyMat = new StandardMaterial(`canopyMat_${canopy.name}`, scene);
    canopyMat.diffuseColor = new Color3(0.2, 0.4, 0.2);
    canopy.material = canopyMat;
    meshes.push(canopy);
  }

  return { meshes };
}

function generateElevator(
  scene: Scene,
  cell: WorldCell,
  _profile: DistrictProfile,
  materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[]; collision: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];
  const collision: AbstractMesh[] = [];

  // Elevator shaft
  const shaft = MeshBuilder.CreateCylinder(
    `elevator_${cell.x}_${cell.z}`,
    { diameter: 6, height: 20, tessellation: 12 },
    scene
  );
  shaft.position = new Vector3(
    cell.worldPosition.x,
    cell.worldPosition.y + 10,
    cell.worldPosition.z
  );
  shaft.material = materials.accent;
  meshes.push(shaft);

  // Collision around shaft
  const collisionCyl = MeshBuilder.CreateCylinder(
    `elevatorCollision_${cell.x}_${cell.z}`,
    { diameter: 7, height: 3, tessellation: 12 },
    scene
  );
  collisionCyl.position = new Vector3(
    cell.worldPosition.x,
    cell.worldPosition.y + 1.5,
    cell.worldPosition.z
  );
  collisionCyl.isVisible = false;
  collision.push(collisionCyl);
  meshes.push(collisionCyl);

  return { meshes, collision };
}

function generateBridge(
  scene: Scene,
  cell: WorldCell,
  _profile: DistrictProfile,
  materials: ReturnType<typeof createCellMaterials>
): { meshes: AbstractMesh[]; collision: AbstractMesh[] } {
  const meshes: AbstractMesh[] = [];
  const collision: AbstractMesh[] = [];

  // Bridge deck
  const deck = MeshBuilder.CreateBox(
    `bridge_${cell.x}_${cell.z}`,
    { width: CELL_SIZE, height: 0.5, depth: 6 },
    scene
  );
  deck.position = new Vector3(cell.worldPosition.x, cell.worldPosition.y + 5, cell.worldPosition.z);
  deck.material = materials.accent;
  meshes.push(deck);

  // Support pillars
  for (let i = 0; i < 2; i++) {
    const pillar = MeshBuilder.CreateCylinder(
      `bridgePillar_${cell.x}_${cell.z}_${i}`,
      { diameter: 1, height: 5, tessellation: 8 },
      scene
    );
    pillar.position = new Vector3(
      cell.worldPosition.x + (i === 0 ? -8 : 8),
      cell.worldPosition.y + 2.5,
      cell.worldPosition.z
    );
    pillar.material = materials.building;
    meshes.push(pillar);

    // Pillar collision
    const pillarCollision = MeshBuilder.CreateCylinder(
      `bridgePillarCollision_${cell.x}_${cell.z}_${i}`,
      { diameter: 1.5, height: 3, tessellation: 8 },
      scene
    );
    pillarCollision.position = pillar.position.clone();
    pillarCollision.position.y = cell.worldPosition.y + 1.5;
    pillarCollision.isVisible = false;
    collision.push(pillarCollision);
    meshes.push(pillarCollision);
  }

  return { meshes, collision };
}

function generateNeonSigns(
  scene: Scene,
  cell: WorldCell,
  profile: DistrictProfile,
  rng: () => number,
  materials: ReturnType<typeof createCellMaterials>
): AbstractMesh[] {
  const signs: AbstractMesh[] = [];
  const count = Math.floor(1 + profile.neonIntensity * 3);

  for (let i = 0; i < count; i++) {
    const sign = MeshBuilder.CreateBox(
      `neonSign_${cell.x}_${cell.z}_${i}`,
      { width: 2 + rng() * 3, height: 1 + rng() * 1.5, depth: 0.2 },
      scene
    );
    sign.position = new Vector3(
      cell.worldPosition.x + (rng() - 0.5) * CELL_SIZE,
      cell.worldPosition.y + 5 + rng() * 10,
      cell.worldPosition.z + (rng() - 0.5) * CELL_SIZE
    );
    sign.material = materials.neon;
    signs.push(sign);
  }

  return signs;
}

function generateProps(
  scene: Scene,
  cell: WorldCell,
  profile: DistrictProfile,
  rng: () => number,
  materials: ReturnType<typeof createCellMaterials>
): AbstractMesh[] {
  const props: AbstractMesh[] = [];
  const count = Math.floor(2 + profile.propDensity * 5);

  const propTypes = ['trash', 'barrel', 'crate', 'vent'];

  for (let i = 0; i < count; i++) {
    const type = propTypes[Math.floor(rng() * propTypes.length)];
    let prop: AbstractMesh;

    switch (type) {
      case 'trash':
        prop = MeshBuilder.CreatePolyhedron(
          `prop_${cell.x}_${cell.z}_${i}`,
          { type: 1, size: 0.3 + rng() * 0.3 },
          scene
        );
        break;
      case 'barrel':
        prop = MeshBuilder.CreateCylinder(
          `prop_${cell.x}_${cell.z}_${i}`,
          { diameter: 0.8, height: 1.2, tessellation: 8 },
          scene
        );
        break;
      case 'crate':
        prop = MeshBuilder.CreateBox(
          `prop_${cell.x}_${cell.z}_${i}`,
          { size: 0.8 + rng() * 0.4 },
          scene
        );
        break;
      case 'vent':
        prop = MeshBuilder.CreateCylinder(
          `prop_${cell.x}_${cell.z}_${i}`,
          { diameter: 1, height: 0.2, tessellation: 12 },
          scene
        );
        break;
      default:
        prop = MeshBuilder.CreateBox(`prop_${cell.x}_${cell.z}_${i}`, { size: 0.5 }, scene);
    }

    prop.position = new Vector3(
      cell.worldPosition.x + (rng() - 0.5) * (CELL_SIZE - 4),
      cell.worldPosition.y + 0.5,
      cell.worldPosition.z + (rng() - 0.5) * (CELL_SIZE - 4)
    );
    prop.material = rng() > 0.5 ? materials.accent : materials.building;
    props.push(prop);
  }

  return props;
}

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
