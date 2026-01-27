import { Color3, type Scene, Texture } from '@babylonjs/core';
import { CellMaterial } from '@babylonjs/materials';

export interface ToonMaterialOptions {
  diffuseColor?: Color3;
  computeHighLevel?: boolean;
  diffuseTexture?: string;
}

export function createToonMaterial(
  name: string,
  scene: Scene,
  options: ToonMaterialOptions = {},
): CellMaterial {
  const material = new CellMaterial(name, scene);
  material.diffuseColor = options.diffuseColor || new Color3(1, 1, 1);
  material.computeHighLevel = options.computeHighLevel ?? true;

  if (options.diffuseTexture) {
    material.diffuseTexture = new Texture(options.diffuseTexture, scene);
  }

  material.specularColor = new Color3(0, 0, 0);
  return material;
}

export function createCharacterMaterial(
  name: string,
  scene: Scene,
  skinTone: 'light' | 'medium' | 'dark' = 'medium',
): CellMaterial {
  const skinColors = {
    light: new Color3(1.0, 0.9, 0.85),
    medium: new Color3(0.9, 0.75, 0.65),
    dark: new Color3(0.7, 0.55, 0.45),
  };

  return createToonMaterial(name, scene, {
    diffuseColor: skinColors[skinTone],
    computeHighLevel: true,
  });
}

export function createEnvironmentMaterial(name: string, scene: Scene, color: Color3): CellMaterial {
  return createToonMaterial(name, scene, {
    diffuseColor: color,
    computeHighLevel: true,
  });
}

export function createEffectMaterial(name: string, scene: Scene, color: Color3): CellMaterial {
  const material = createToonMaterial(name, scene, {
    diffuseColor: color,
    computeHighLevel: false,
  });

  material.emissiveColor = color.scale(0.3);
  return material;
}
