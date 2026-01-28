import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  type Nullable,
  PBRMaterial,
  type Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';

export type DecalCategory = 'leaking' | 'manhole' | 'roadlines' | 'door' | 'gum' | 'edge';

export const AMBIENTCG_DECALS = {
  leaking: {
    Leaking002: 'Leaking002',
    Leaking003: 'Leaking003',
    Leaking004: 'Leaking004',
    Leaking005: 'Leaking005',
    Leaking010A: 'Leaking010A',
    Leaking011A: 'Leaking011A',
    Leaking011B: 'Leaking011B',
    Leaking011C: 'Leaking011C',
  },
  manhole: {
    ManholeCover001: 'ManholeCover001',
    ManholeCover004: 'ManholeCover004',
    ManholeCover006: 'ManholeCover006',
    ManholeCover007: 'ManholeCover007',
    ManholeCover008: 'ManholeCover008',
    ManholeCover009: 'ManholeCover009',
  },
  roadlines: {
    RoadLines001: 'RoadLines001',
    RoadLines006: 'RoadLines006',
    RoadLines007: 'RoadLines007',
    RoadLines008: 'RoadLines008',
    RoadLines009: 'RoadLines009',
    RoadLines011: 'RoadLines011',
    RoadLines012: 'RoadLines012',
    RoadLines013: 'RoadLines013',
    RoadLines014: 'RoadLines014',
    RoadLines015: 'RoadLines015',
    RoadLines016: 'RoadLines016',
  },
  door: {
    Door002: 'Door002',
  },
  gum: {
    ChewingGum002: 'ChewingGum002',
  },
  edge: {
    PavingEdge001: 'PavingEdge001',
  },
} as const;

export const DECAL_BASE_PATH = '/assets/decals';

const DECAL_SUFFIXES = {
  color: 'Color.jpg',
  opacity: 'Opacity.jpg',
  normalGL: 'NormalGL.jpg',
  roughness: 'Roughness.jpg',
  displacement: 'Displacement.jpg',
} as const;

export interface DecalOptions {
  decalId: string;
  position: Vector3;
  size: { width: number; height: number };
  rotation?: number;
  yOffset?: number;
  opacity?: number;
}

export function createFloorDecal(
  name: string,
  scene: Scene,
  options: DecalOptions
): { mesh: AbstractMesh; dispose: () => void } {
  const { decalId, position, size, rotation = 0, yOffset = 0.01, opacity = 1 } = options;

  const basePath = `${DECAL_BASE_PATH}/${decalId}`;
  const prefix = `${decalId}_1K-JPG_`;

  const decalMesh = MeshBuilder.CreateGround(
    name,
    { width: size.width, height: size.height },
    scene
  );
  decalMesh.position = position.clone();
  decalMesh.position.y += yOffset;
  decalMesh.rotation.y = rotation;

  const decalMat = new PBRMaterial(`${name}_mat`, scene);

  const colorTex = new Texture(`${basePath}/${prefix}${DECAL_SUFFIXES.color}`, scene);
  const opacityTex = new Texture(`${basePath}/${prefix}${DECAL_SUFFIXES.opacity}`, scene);

  let normalTex: Nullable<Texture> = null;
  try {
    normalTex = new Texture(`${basePath}/${prefix}${DECAL_SUFFIXES.normalGL}`, scene);
  } catch {
    // optional
  }

  decalMat.albedoTexture = colorTex;
  decalMat.opacityTexture = opacityTex;
  if (normalTex) {
    decalMat.bumpTexture = normalTex;
  }

  decalMat.transparencyMode = PBRMaterial.MATERIAL_ALPHABLEND;
  decalMat.alpha = opacity;
  decalMat.metallic = 0;
  decalMat.roughness = 0.7;
  decalMat.backFaceCulling = false;

  decalMesh.material = decalMat;

  return {
    mesh: decalMesh,
    dispose: () => {
      decalMesh.dispose();
      decalMat.dispose();
      colorTex.dispose();
      opacityTex.dispose();
      normalTex?.dispose();
    },
  };
}

export function createGraffitiDecal(
  name: string,
  scene: Scene,
  target: AbstractMesh,
  options: DecalOptions
): { mesh: AbstractMesh; dispose: () => void } {
  const { decalId, position, size, rotation = 0, opacity = 1 } = options;

  const basePath = `${DECAL_BASE_PATH}/${decalId}`;
  const prefix = `${decalId}_1K-JPG_`;

  const decalMesh = MeshBuilder.CreateDecal(name, target, {
    position,
    size: new Vector3(size.width, size.height, size.width),
    angle: rotation,
  });

  const decalMat = new StandardMaterial(`${name}_mat`, scene);
  const colorTex = new Texture(`${basePath}/${prefix}${DECAL_SUFFIXES.color}`, scene);
  const opacityTex = new Texture(`${basePath}/${prefix}${DECAL_SUFFIXES.opacity}`, scene);

  decalMat.diffuseTexture = colorTex;
  decalMat.opacityTexture = opacityTex;
  decalMat.diffuseColor = new Color3(1, 1, 1);
  decalMat.emissiveColor = new Color3(0.1, 0.1, 0.1);
  decalMat.backFaceCulling = false;
  decalMat.alpha = opacity;

  decalMesh.material = decalMat;

  return {
    mesh: decalMesh,
    dispose: () => {
      decalMesh.dispose();
      decalMat.dispose();
      colorTex.dispose();
      opacityTex.dispose();
    },
  };
}
