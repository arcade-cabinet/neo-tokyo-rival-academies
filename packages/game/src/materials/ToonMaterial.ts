/**
 * Toon Material Factory
 *
 * Creates cel-shaded materials for anime aesthetic.
 * Uses BabylonJS CellMaterial for stepped lighting.
 */

import { Color3, type Scene, Texture } from '@babylonjs/core';
import { CellMaterial } from '@babylonjs/materials';

export interface ToonMaterialOptions {
  diffuseColor?: Color3;
  computeHighLevel?: boolean;
  diffuseTexture?: string;
}

/**
 * Create a toon material with cel-shaded lighting
 */
export function createToonMaterial(
  name: string,
  scene: Scene,
  options: ToonMaterialOptions = {}
): CellMaterial {
  const material = new CellMaterial(name, scene);

  // Set diffuse color (base color)
  material.diffuseColor = options.diffuseColor || new Color3(1, 1, 1);

  // Enable high-level lighting computation for better cel-shading
  material.computeHighLevel = options.computeHighLevel ?? true;

  // Apply diffuse texture if provided
  if (options.diffuseTexture) {
    material.diffuseTexture = new Texture(options.diffuseTexture, scene);
  }

  // Disable specular for flat anime look
  material.specularColor = new Color3(0, 0, 0);

  return material;
}

/**
 * Character material preset (skin tones)
 */
export function createCharacterMaterial(
  name: string,
  scene: Scene,
  skinTone: 'light' | 'medium' | 'dark' = 'medium'
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

/**
 * Environment material preset (tiles, props)
 */
export function createEnvironmentMaterial(name: string, scene: Scene, color: Color3): CellMaterial {
  return createToonMaterial(name, scene, {
    diffuseColor: color,
    computeHighLevel: true,
  });
}

/**
 * Effect material preset (particles, glows)
 */
export function createEffectMaterial(name: string, scene: Scene, color: Color3): CellMaterial {
  const material = createToonMaterial(name, scene, {
    diffuseColor: color,
    computeHighLevel: false, // Simpler lighting for effects
  });

  // Make effects slightly emissive
  material.emissiveColor = color.scale(0.3);

  return material;
}
