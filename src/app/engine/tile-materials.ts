import { Color3, type Scene } from '@babylonjs/core';
import { TileType } from './tiles';
import { type createEnvironmentMaterial, createToonMaterial } from './toon-material';

const TILE_COLORS: Record<TileType, Color3> = {
  [TileType.BASE]: new Color3(0.16, 0.18, 0.2),
  [TileType.AIRVENT]: new Color3(0.2, 0.24, 0.28),
  [TileType.PIPES]: new Color3(0.25, 0.22, 0.18),
  [TileType.GENERATOR]: new Color3(0.32, 0.28, 0.22),
  [TileType.ANTENNA]: new Color3(0.18, 0.2, 0.26),
  [TileType.EDGE]: new Color3(0.1, 0.12, 0.14),
};

const TILE_TEXTURES: Record<TileType, string> = {
  [TileType.BASE]: '/assets/tiles/rooftop/base/concept.png',
  [TileType.AIRVENT]: '/assets/tiles/rooftop/airvent/concept.png',
  [TileType.PIPES]: '/assets/tiles/rooftop/pipes/concept.png',
  [TileType.GENERATOR]: '/assets/tiles/rooftop/glass/concept.png',
  [TileType.ANTENNA]: '/assets/tiles/rooftop/tarpaper/concept.png',
  [TileType.EDGE]: '/assets/tiles/rooftop/grate/concept.png',
};

export function createTileMaterial(type: TileType, scene: Scene) {
  const color = TILE_COLORS[type];
  const texturePath = TILE_TEXTURES[type];

  return createToonMaterial(`tile_${type}`, scene, {
    diffuseColor: color,
    diffuseTexture: texturePath,
    computeHighLevel: true,
  });
}

export function createAllTileMaterials(scene: Scene) {
  const materials: Record<TileType, ReturnType<typeof createEnvironmentMaterial>> = {
    [TileType.BASE]: createTileMaterial(TileType.BASE, scene),
    [TileType.AIRVENT]: createTileMaterial(TileType.AIRVENT, scene),
    [TileType.PIPES]: createTileMaterial(TileType.PIPES, scene),
    [TileType.GENERATOR]: createTileMaterial(TileType.GENERATOR, scene),
    [TileType.ANTENNA]: createTileMaterial(TileType.ANTENNA, scene),
    [TileType.EDGE]: createTileMaterial(TileType.EDGE, scene),
  };

  return materials;
}

export function getTileColor(type: TileType): Color3 {
  return TILE_COLORS[type].clone();
}
