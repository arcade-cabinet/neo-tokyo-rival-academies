import { type Nullable, PBRMaterial, type Scene, Texture } from '@babylonjs/core';

export type MaterialCategory =
  | 'concrete'
  | 'metal'
  | 'brick'
  | 'tiles'
  | 'wood'
  | 'ground'
  | 'rock'
  | 'planks'
  | 'foam'
  | 'fabric'
  | 'rope'
  | 'ice';

export const AMBIENTCG_MATERIALS = {
  concrete: {
    Concrete012: 'Concrete012',
    Concrete015: 'Concrete015',
  },
  metal: {
    Metal055C: 'Metal055C',
    CorrugatedSteel006B: 'CorrugatedSteel006B',
  },
  brick: {
    Bricks050: 'Bricks050',
    Bricks057: 'Bricks057',
    Bricks068: 'Bricks068',
  },
  tiles: {
    Tiles041: 'Tiles041',
    Tiles046: 'Tiles046',
    Tiles079: 'Tiles079',
  },
  wood: {
    Wood052: 'Wood052',
    Wood055: 'Wood055',
    WoodFloor013: 'WoodFloor013',
    Planks031B: 'Planks031B',
  },
  ground: {
    Ground043: 'Ground043',
    Ground044: 'Ground044',
    Ground088: 'Ground088',
  },
  rock: {
    Rock018: 'Rock018',
    Rock027: 'Rock027',
  },
  misc: {
    Ice002: 'Ice002',
    Foam003: 'Foam003',
    Fabric063: 'Fabric063',
    Rope003: 'Rope003',
  },
} as const;

export const AMBIENTCG_BASE_PATH = '/assets/ambientcg';

export interface AmbientCGMaterialOptions {
  materialId: string;
  uvScale?: { u: number; v: number };
  parallax?: boolean;
  parallaxDepth?: number;
  metallic?: number;
  roughnessMultiplier?: number;
  useAO?: boolean;
}

const TEXTURE_SUFFIXES = {
  color: 'Color.jpg',
  normalGL: 'NormalGL.jpg',
  normalDX: 'NormalDX.jpg',
  roughness: 'Roughness.jpg',
  displacement: 'Displacement.jpg',
  ao: 'AmbientOcclusion.jpg',
  metalness: 'Metalness.jpg',
} as const;

export function createAmbientCGMaterial(
  name: string,
  scene: Scene,
  options: AmbientCGMaterialOptions
): PBRMaterial {
  const {
    materialId,
    uvScale = { u: 1, v: 1 },
    parallax = false,
    parallaxDepth = 0.02,
    metallic = 0,
    roughnessMultiplier = 1,
    useAO = true,
  } = options;

  const basePath = `${AMBIENTCG_BASE_PATH}/${materialId}`;
  const prefix = `${materialId}_1K-JPG_`;

  const material = new PBRMaterial(name, scene);

  const loadTexture = (suffix: string): Nullable<Texture> => {
    try {
      const tex = new Texture(
        `${basePath}/${prefix}${suffix}`,
        scene,
        undefined,
        undefined,
        undefined,
        undefined,
        () => {
          // Optional textures may be missing.
        }
      );
      tex.uScale = uvScale.u;
      tex.vScale = uvScale.v;
      return tex;
    } catch {
      return null;
    }
  };

  const colorTex = loadTexture(TEXTURE_SUFFIXES.color);
  if (colorTex) {
    material.albedoTexture = colorTex;
  }

  const normalTex = loadTexture(TEXTURE_SUFFIXES.normalGL);
  if (normalTex) {
    material.bumpTexture = normalTex;
  }

  const roughnessTex = loadTexture(TEXTURE_SUFFIXES.roughness);
  if (roughnessTex) {
    material.metallicTexture = roughnessTex;
    material.useRoughnessFromMetallicTextureGreen = true;
    material.useRoughnessFromMetallicTextureAlpha = false;
  }

  const aoTex = useAO ? loadTexture(TEXTURE_SUFFIXES.ao) : null;
  if (aoTex) {
    material.ambientTexture = aoTex;
  }

  const displacementTex = loadTexture(TEXTURE_SUFFIXES.displacement);
  if (parallax && displacementTex) {
    material.parallaxTexture = displacementTex;
    material.parallaxScaleBias = parallaxDepth;
  }

  const metalnessTex = loadTexture(TEXTURE_SUFFIXES.metalness);
  if (metalnessTex) {
    material.metallicTexture = metalnessTex;
  }

  material.metallic = metallic;
  material.roughness = Math.min(1, roughnessMultiplier);

  return material;
}
