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
  modelPath?: string;
}

export const TILE_DEFINITIONS: Record<TileType, TileDefinition> = {
  [TileType.BASE]: {
    type: TileType.BASE,
    materialName: 'base_tile',
  },
  [TileType.AIRVENT]: {
    type: TileType.AIRVENT,
    materialName: 'airvent_tile',
    modelPath: '/assets/tiles/rooftop/airvent/model.glb',
  },
  [TileType.PIPES]: {
    type: TileType.PIPES,
    materialName: 'pipes_tile',
    modelPath: '/assets/tiles/rooftop/pipes/model.glb',
  },
  [TileType.GENERATOR]: {
    type: TileType.GENERATOR,
    materialName: 'generator_tile',
    modelPath: '/assets/tiles/rooftop/glass/model.glb',
  },
  [TileType.ANTENNA]: {
    type: TileType.ANTENNA,
    materialName: 'antenna_tile',
    modelPath: '/assets/tiles/rooftop/tarpaper/model.glb',
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
