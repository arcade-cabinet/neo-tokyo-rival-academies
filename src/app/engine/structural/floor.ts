import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  PBRMaterial,
  type Scene,
  Texture,
  type Vector3,
} from '@babylonjs/core';

export type FloorSurface =
  | 'concrete'
  | 'gravel'
  | 'metal_grating'
  | 'tile'
  | 'wood'
  | 'membrane'
  | 'solar';

export interface FloorOptions {
  id: string;
  position: Vector3;
  size: { width: number; depth: number };
  surface?: FloorSurface;
  thickness?: number;
  rotation?: number;
  uvScale?: { u: number; v: number };
  edgeTrim?: boolean;
  edgeColor?: Color3;
}

const SURFACE_CONFIG: Record<
  FloorSurface,
  { color: Color3; roughness: number; metallic: number; textureCategory?: string }
> = {
  concrete: {
    color: new Color3(0.45, 0.45, 0.48),
    roughness: 0.85,
    metallic: 0.0,
    textureCategory: 'floors/concrete',
  },
  gravel: {
    color: new Color3(0.5, 0.48, 0.45),
    roughness: 0.95,
    metallic: 0.0,
  },
  metal_grating: {
    color: new Color3(0.35, 0.35, 0.38),
    roughness: 0.4,
    metallic: 0.7,
  },
  tile: {
    color: new Color3(0.6, 0.58, 0.55),
    roughness: 0.3,
    metallic: 0.1,
  },
  wood: {
    color: new Color3(0.45, 0.35, 0.25),
    roughness: 0.7,
    metallic: 0.0,
  },
  membrane: {
    color: new Color3(0.25, 0.25, 0.28),
    roughness: 0.6,
    metallic: 0.1,
  },
  solar: {
    color: new Color3(0.15, 0.18, 0.25),
    roughness: 0.2,
    metallic: 0.4,
  },
};

const TEXTURE_BASE_PATH = '/assets/textures';

export class FloorBuilder {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  build(options: FloorOptions) {
    const {
      id,
      position,
      size,
      surface = 'concrete',
      thickness = 0.2,
      rotation = 0,
      uvScale = { u: 1, v: 1 },
      edgeTrim = false,
      edgeColor = new Color3(0.2, 0.2, 0.22),
    } = options;

    const meshes: AbstractMesh[] = [];
    const config = SURFACE_CONFIG[surface];

    const floorMesh = MeshBuilder.CreateBox(
      `floor_${id}`,
      { width: size.width, height: thickness, depth: size.depth },
      this.scene
    );
    floorMesh.position = position.clone();
    floorMesh.position.y += thickness / 2;
    floorMesh.rotation.y = rotation;

    const floorMat = new PBRMaterial(`floorMat_${id}`, this.scene);
    floorMat.albedoColor = config.color;
    floorMat.roughness = config.roughness;
    floorMat.metallic = config.metallic;

    if (config.textureCategory) {
      const texturePath = `${TEXTURE_BASE_PATH}/${config.textureCategory}`;
      try {
        const colorMap = new Texture(`${texturePath}/color.jpg`, this.scene);
        colorMap.uScale = uvScale.u * (size.width / 2);
        colorMap.vScale = uvScale.v * (size.depth / 2);
        floorMat.albedoTexture = colorMap;

        const normalMap = new Texture(`${texturePath}/normal.jpg`, this.scene);
        normalMap.uScale = uvScale.u * (size.width / 2);
        normalMap.vScale = uvScale.v * (size.depth / 2);
        floorMat.bumpTexture = normalMap;

        const roughnessMap = new Texture(`${texturePath}/roughness.jpg`, this.scene);
        roughnessMap.uScale = uvScale.u * (size.width / 2);
        roughnessMap.vScale = uvScale.v * (size.depth / 2);
        floorMat.metallicTexture = roughnessMap;
        floorMat.useRoughnessFromMetallicTextureGreen = true;
      } catch {
        // fallback to base color
      }
    }

    floorMesh.material = floorMat;
    meshes.push(floorMesh);

    if (edgeTrim) {
      const trimHeight = 0.1;
      const trimWidth = 0.08;

      const trimMat = new PBRMaterial(`trimMat_${id}`, this.scene);
      trimMat.albedoColor = edgeColor;
      trimMat.roughness = 0.5;
      trimMat.metallic = 0.3;

      const edges = [
        { w: size.width + trimWidth * 2, d: trimWidth, x: 0, z: -size.depth / 2 - trimWidth / 2 },
        { w: size.width + trimWidth * 2, d: trimWidth, x: 0, z: size.depth / 2 + trimWidth / 2 },
        { w: trimWidth, d: size.depth, x: -size.width / 2 - trimWidth / 2, z: 0 },
        { w: trimWidth, d: size.depth, x: size.width / 2 + trimWidth / 2, z: 0 },
      ];

      for (const edge of edges) {
        const trim = MeshBuilder.CreateBox(
          `trim_${id}_${edge.x}_${edge.z}`,
          { width: edge.w, height: trimHeight, depth: edge.d },
          this.scene
        );
        trim.position = position.clone();
        trim.position.y += thickness + trimHeight / 2;
        trim.position.x += edge.x;
        trim.position.z += edge.z;
        trim.rotation.y = rotation;
        trim.material = trimMat;
        meshes.push(trim);
      }
    }

    this.meshes = meshes;
    return meshes;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    this.meshes = [];
  }
}
