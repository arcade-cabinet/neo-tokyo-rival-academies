/**
 * Tile Type Definitions
 *
 * Defines tile types for hex grid diorama.
 */

export enum TileType {
  BASE = 'base',
  AIRVENT = 'airvent',
  PIPES = 'pipes',
  GENERATOR = 'generator',
  ANTENNA = 'antenna',
  EDGE = 'edge',
}

export interface TileDefinition {
  type: TileType;
  materialName: string;
  modelPath?: string; // Optional 3D model for tile decoration
}

export const TILE_DEFINITIONS: Record<TileType, TileDefinition> = {
  [TileType.BASE]: {
    type: TileType.BASE,
    materialName: 'base_tile',
  },
  [TileType.AIRVENT]: {
    type: TileType.AIRVENT,
    materialName: 'airvent_tile',
    modelPath: '/assets/tiles/rooftop/airvent.glb',
  },
  [TileType.PIPES]: {
    type: TileType.PIPES,
    materialName: 'pipes_tile',
    modelPath: '/assets/tiles/rooftop/pipes.glb',
  },
  [TileType.GENERATOR]: {
    type: TileType.GENERATOR,
    materialName: 'generator_tile',
    modelPath: '/assets/tiles/rooftop/generator.glb',
  },
  [TileType.ANTENNA]: {
    type: TileType.ANTENNA,
    materialName: 'antenna_tile',
    modelPath: '/assets/tiles/rooftop/antenna.glb',
  },
  [TileType.EDGE]: {
    type: TileType.EDGE,
    materialName: 'edge_tile',
  },
};

export interface HexTile {
  q: number;
  r: number;
  type: TileType;
  worldX: number;
  worldZ: number;
}
