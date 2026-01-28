import {
  type AbstractMesh,
  MeshBuilder,
  PBRMaterial,
  type Scene,
  Texture,
  type Vector3,
} from '@babylonjs/core';
import { getMaterialTexturePath, type MaterialName } from '@neo-tokyo/shared-assets';

export const WALL_TEXTURES = {
  concrete_clean: 'Concrete004' as MaterialName,
  concrete_dirty: 'Concrete022' as MaterialName,
  concrete_weathered: 'Concrete015' as MaterialName,
  concrete_damaged: 'Concrete034' as MaterialName,
  brick_red: 'Bricks001' as MaterialName,
  brick_grey: 'Bricks010' as MaterialName,
  brick_weathered: 'Bricks024' as MaterialName,
  brick_old: 'Bricks037' as MaterialName,
  metal_clean: 'Metal001' as MaterialName,
  metal_corrugated: 'CorrugatedSteel001' as MaterialName,
  metal_rusted: 'Rust001' as MaterialName,
  metal_weathered: 'CorrugatedSteel003' as MaterialName,
} as const;

export type WallTextureType = keyof typeof WALL_TEXTURES;

export interface TexturedWallOptions {
  id: string;
  position: Vector3;
  size: { width: number; height: number; depth: number };
  textureType: WallTextureType;
  material?: MaterialName;
  rotation?: number;
  uvScale?: { u: number; v: number };
}

export function createTexturedWall(scene: Scene, options: TexturedWallOptions): AbstractMesh {
  const {
    id,
    position,
    size,
    textureType,
    material,
    rotation = 0,
    uvScale = { u: 1, v: 1 },
  } = options;

  const materialName = material ?? WALL_TEXTURES[textureType];

  const wallMesh = MeshBuilder.CreateBox(
    `wall_${id}`,
    { width: size.width, height: size.height, depth: size.depth },
    scene
  );

  wallMesh.position = position.clone();
  wallMesh.position.y += size.height / 2;
  wallMesh.rotation.y = rotation;

  const wallMat = new PBRMaterial(`wallMat_${id}`, scene);
  const colorMap = new Texture(getMaterialTexturePath(materialName, 'Color'), scene);
  const normalMap = new Texture(getMaterialTexturePath(materialName, 'NormalGL'), scene);
  const roughnessMap = new Texture(getMaterialTexturePath(materialName, 'Roughness'), scene);

  for (const map of [colorMap, normalMap, roughnessMap]) {
    map.uScale = uvScale.u;
    map.vScale = uvScale.v;
  }

  wallMat.albedoTexture = colorMap;
  wallMat.bumpTexture = normalMap;
  wallMat.metallicTexture = roughnessMap;
  wallMat.useRoughnessFromMetallicTextureGreen = true;
  wallMat.useRoughnessFromMetallicTextureAlpha = false;
  wallMat.metallic = 0;
  wallMat.roughness = 1;

  wallMesh.material = wallMat;

  return wallMesh;
}

export class TexturedWallBuilder {
  private mesh: AbstractMesh | null = null;

  constructor(private readonly scene: Scene) {}

  build(options: TexturedWallOptions) {
    this.mesh = createTexturedWall(this.scene, options);
    return this.mesh;
  }

  dispose() {
    this.mesh?.dispose();
    this.mesh = null;
  }
}
