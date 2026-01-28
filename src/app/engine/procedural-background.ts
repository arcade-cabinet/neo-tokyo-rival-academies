import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

export interface ProceduralBackgroundOptions {
  seed: string;
  theme: 'neon' | 'slum' | 'corporate' | 'industrial' | 'sunset';
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  density?: number;
}

interface ThemeColors {
  building: Color3;
  accent: Color3;
  neon: Color3;
  ground: Color3;
}

const THEME_COLORS: Record<ProceduralBackgroundOptions['theme'], ThemeColors> = {
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

export class ProceduralBackground {
  private meshes: AbstractMesh[] = [];
  private materials: StandardMaterial[] = [];
  private collisionMeshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  build({ seed, theme, bounds, density = 0.6 }: ProceduralBackgroundOptions) {
    const meshes: AbstractMesh[] = [];
    const materials: StandardMaterial[] = [];
    const collisionMeshes: AbstractMesh[] = [];

    const rng = createSeededRng(seed);
    const colors = THEME_COLORS[theme];

    const buildingMat = new StandardMaterial('bgBuilding', this.scene);
    buildingMat.diffuseColor = colors.building;
    buildingMat.specularColor = new Color3(0.05, 0.05, 0.05);
    materials.push(buildingMat);

    const accentMat = new StandardMaterial('bgAccent', this.scene);
    accentMat.diffuseColor = colors.accent;
    accentMat.specularColor = new Color3(0.1, 0.1, 0.1);
    materials.push(accentMat);

    const neonMat = new StandardMaterial('bgNeon', this.scene);
    neonMat.diffuseColor = colors.neon.scale(0.3);
    neonMat.emissiveColor = colors.neon;
    neonMat.specularColor = new Color3(0, 0, 0);
    materials.push(neonMat);

    const groundMat = new StandardMaterial('bgGround', this.scene);
    groundMat.diffuseColor = colors.ground;
    groundMat.specularColor = new Color3(0.02, 0.02, 0.02);
    materials.push(groundMat);

    const groundWidth = bounds.maxX - bounds.minX;
    const groundDepth = bounds.maxZ - bounds.minZ;

    const ground = MeshBuilder.CreateGround(
      'ground',
      { width: groundWidth, height: groundDepth },
      this.scene
    );
    ground.position.x = (bounds.minX + bounds.maxX) / 2;
    ground.position.z = (bounds.minZ + bounds.maxZ) / 2;
    ground.position.y = 0;
    ground.material = groundMat;
    ground.receiveShadows = true;
    meshes.push(ground);

    const leftBuildings = generateBuildingRow(
      this.scene,
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

    const rightBuildings = generateBuildingRow(
      this.scene,
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

    const midgroundCount = Math.floor(8 + density * 10);
    for (let i = 0; i < midgroundCount; i++) {
      const x = bounds.minX - 10 + rng() * (groundWidth + 20);
      const z = -15 - rng() * 10;
      const width = 8 + rng() * 12;
      const height = 20 + rng() * 30;
      const depth = 5 + rng() * 8;

      const building = MeshBuilder.CreateBox(
        `midground_${i}`,
        { width, height, depth },
        this.scene
      );
      building.position = new Vector3(x, height / 2, z);
      building.material = rng() > 0.7 ? accentMat : buildingMat;
      meshes.push(building);

      if (rng() > 0.6) {
        const neon = MeshBuilder.CreateBox(
          `midground_neon_${i}`,
          { width: width * 0.2, height: height * 0.08, depth: depth * 0.2 },
          this.scene
        );
        neon.position = new Vector3(x + width * 0.25, height * 0.6, z + depth * 0.55);
        neon.material = neonMat;
        meshes.push(neon);
      }
    }

    const farCount = Math.floor(10 + density * 12);
    for (let i = 0; i < farCount; i++) {
      const x = bounds.minX - 20 + rng() * (groundWidth + 40);
      const z = -30 - rng() * 30;
      const width = 6 + rng() * 10;
      const height = 15 + rng() * 25;
      const depth = 4 + rng() * 6;

      const building = MeshBuilder.CreateBox(`far_${i}`, { width, height, depth }, this.scene);
      building.position = new Vector3(x, height / 2, z);
      building.material = buildingMat;
      building.scaling.z = 0.6;
      meshes.push(building);
    }

    this.meshes = meshes;
    this.materials = materials;
    this.collisionMeshes = collisionMeshes;
  }

  getCollisionMeshes() {
    return this.collisionMeshes;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    for (const mat of this.materials) {
      mat.dispose();
    }
    this.meshes = [];
    this.materials = [];
    this.collisionMeshes = [];
  }
}

function createSeededRng(seed: string): () => number {
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

function generateBuildingRow(
  scene: Scene,
  options: {
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
) {
  const meshes: AbstractMesh[] = [];
  const collision: AbstractMesh[] = [];
  const span = options.endX - options.startX;
  const spacing = span / options.count;

  for (let i = 0; i < options.count; i++) {
    const width = 6 + rng() * 8;
    const height = options.minHeight + rng() * (options.maxHeight - options.minHeight);
    const depth = 4 + rng() * 6;
    const x = options.startX + spacing * i + rng() * 2;
    const z = options.z + (rng() - 0.5) * options.zVariance;

    const building = MeshBuilder.CreateBox(`bg_row_${i}`, { width, height, depth }, scene);
    building.position = new Vector3(x, height / 2, z);
    building.material = rng() > 0.6 ? accentMat : buildingMat;
    meshes.push(building);

    const collider = MeshBuilder.CreateBox(
      `bg_row_col_${i}`,
      { width: width + 1, height: height, depth: depth + 1 },
      scene
    );
    collider.position = building.position.clone();
    collider.isVisible = false;
    collision.push(collider);
    meshes.push(collider);
  }

  return { meshes, collision };
}
