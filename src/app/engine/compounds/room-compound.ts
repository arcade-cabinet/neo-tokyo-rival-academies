import { type AbstractMesh, Color3, type Scene, Vector3 } from '@babylonjs/core';
import { NeonSignBuilder } from '../signage/neon-sign';
import { FloorBuilder, type FloorSurface } from '../structural/floor';
import { createTexturedWall, type WallTextureType } from '../structural/textured-wall';

export type RoomStyle = 'residential' | 'office' | 'industrial' | 'shop' | 'club';

export interface DoorwayConfig {
  wall: 'north' | 'south' | 'east' | 'west';
  position: number;
  width: number;
  height: number;
}

export interface RoomOptions {
  id: string;
  position: Vector3;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  style?: RoomStyle;
  floorSurface?: FloorSurface;
  wallTexture?: WallTextureType;
  hasCeiling?: boolean;
  walls?: {
    north?: boolean;
    south?: boolean;
    east?: boolean;
    west?: boolean;
  };
  doorways?: DoorwayConfig[];
  accentColor?: Color3;
  seed?: number;
  ceilingLights?: boolean;
  ambientLevel?: number;
}

const STYLE_PRESETS: Record<
  RoomStyle,
  {
    floorSurface: FloorSurface;
    wallTexture: WallTextureType;
    accentColor: Color3;
    hasCeiling: boolean;
    ceilingLights: boolean;
  }
> = {
  residential: {
    floorSurface: 'wood',
    wallTexture: 'concrete_clean',
    accentColor: new Color3(1, 0.9, 0.7),
    hasCeiling: true,
    ceilingLights: true,
  },
  office: {
    floorSurface: 'tile',
    wallTexture: 'concrete_clean',
    accentColor: new Color3(0.8, 0.9, 1),
    hasCeiling: true,
    ceilingLights: true,
  },
  industrial: {
    floorSurface: 'concrete',
    wallTexture: 'metal_rusted',
    accentColor: new Color3(1, 0.5, 0),
    hasCeiling: false,
    ceilingLights: false,
  },
  shop: {
    floorSurface: 'tile',
    wallTexture: 'concrete_dirty',
    accentColor: new Color3(1, 0, 0.5),
    hasCeiling: true,
    ceilingLights: true,
  },
  club: {
    floorSurface: 'tile',
    wallTexture: 'concrete_dirty',
    accentColor: new Color3(0.5, 0, 1),
    hasCeiling: true,
    ceilingLights: true,
  },
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const ROOM_PRESETS = {
  small_apartment: {
    dimensions: { width: 6, depth: 5, height: 3 },
    style: 'residential' as RoomStyle,
  },
  large_office: {
    dimensions: { width: 12, depth: 10, height: 3.5 },
    style: 'office' as RoomStyle,
  },
  warehouse_section: {
    dimensions: { width: 15, depth: 15, height: 6 },
    style: 'industrial' as RoomStyle,
    hasCeiling: false,
  },
  corner_shop: {
    dimensions: { width: 8, depth: 6, height: 3 },
    style: 'shop' as RoomStyle,
    walls: { north: false, south: true, east: true, west: true },
  },
  nightclub: {
    dimensions: { width: 20, depth: 15, height: 4 },
    style: 'club' as RoomStyle,
  },
  corridor: {
    dimensions: { width: 3, depth: 12, height: 3 },
    style: 'office' as RoomStyle,
    walls: { north: true, south: true, east: false, west: false },
  },
};

export class RoomCompound {
  private meshes: AbstractMesh[] = [];
  private floorBuilder: FloorBuilder;
  private neonBuilder: NeonSignBuilder;

  constructor(private readonly scene: Scene) {
    this.floorBuilder = new FloorBuilder(scene);
    this.neonBuilder = new NeonSignBuilder(scene);
  }

  build(options: RoomOptions) {
    const {
      id,
      position,
      dimensions,
      style = 'residential',
      floorSurface,
      wallTexture,
      hasCeiling,
      walls = { north: true, south: true, east: true, west: true },
      accentColor,
      seed = 42,
      ceilingLights,
      ambientLevel = 0.3,
    } = options;

    const preset = STYLE_PRESETS[style];
    const finalFloorSurface = floorSurface ?? preset.floorSurface;
    const finalWallTexture = wallTexture ?? preset.wallTexture;
    const finalAccentColor = accentColor ?? preset.accentColor;
    const finalHasCeiling = hasCeiling ?? preset.hasCeiling;
    const finalCeilingLights = ceilingLights ?? preset.ceilingLights;

    const { width, depth, height } = dimensions;

    const floorMeshes = this.floorBuilder.build({
      id: `${id}_floor`,
      position,
      size: { width, depth },
      surface: finalFloorSurface,
    });
    this.trackMeshes(floorMeshes);

    if (finalHasCeiling) {
      const ceilingMeshes = this.floorBuilder.build({
        id: `${id}_ceiling`,
        position: new Vector3(position.x, position.y + height, position.z),
        size: { width, depth },
        surface: 'concrete',
      });
      this.trackMeshes(ceilingMeshes);
    }

    if (walls.north) {
      const wall = createTexturedWall(this.scene, {
        id: `${id}_wall_north`,
        position: new Vector3(position.x, position.y, position.z - depth / 2),
        size: { width, height, depth: 0.2 },
        textureType: finalWallTexture,
      });
      this.trackMeshes([wall]);
    }

    if (walls.south) {
      const wall = createTexturedWall(this.scene, {
        id: `${id}_wall_south`,
        position: new Vector3(position.x, position.y, position.z + depth / 2),
        size: { width, height, depth: 0.2 },
        textureType: finalWallTexture,
      });
      this.trackMeshes([wall]);
    }

    if (walls.east) {
      const wall = createTexturedWall(this.scene, {
        id: `${id}_wall_east`,
        position: new Vector3(position.x + width / 2, position.y, position.z),
        size: { width: 0.2, height, depth },
        textureType: finalWallTexture,
      });
      this.trackMeshes([wall]);
    }

    if (walls.west) {
      const wall = createTexturedWall(this.scene, {
        id: `${id}_wall_west`,
        position: new Vector3(position.x - width / 2, position.y, position.z),
        size: { width: 0.2, height, depth },
        textureType: finalWallTexture,
      });
      this.trackMeshes([wall]);
    }

    if (finalCeilingLights && finalHasCeiling) {
      const spacingX = 4;
      const spacingZ = 4;
      const countX = Math.max(1, Math.floor(width / spacingX));
      const countZ = Math.max(1, Math.floor(depth / spacingZ));

      for (let ix = 0; ix < countX; ix += 1) {
        for (let iz = 0; iz < countZ; iz += 1) {
          const x = position.x - width / 2 + (ix + 0.5) * (width / countX);
          const z = position.z - depth / 2 + (iz + 0.5) * (depth / countZ);
          const meshes = this.neonBuilder.build({
            id: `${id}_ceiling_light_${ix}_${iz}`,
            position: new Vector3(x, position.y + height - 0.1, z),
            color: new Color3(1, 1, 1),
            shape: 'rectangle',
            size: { width: 0.8, height: 0.4 },
            mount: 'ground',
            intensity: 1.5,
          });
          this.trackMeshes(meshes);
        }
      }
    }

    let seedCounter = seed;
    const nextRandom = () => {
      seedCounter += 1;
      return seededRandom(seedCounter);
    };

    const addWallLights = (
      wallName: string,
      wallX: number,
      wallZ: number,
      isXWall: boolean,
      wallLength: number
    ) => {
      const count = Math.floor(wallLength / 5);
      for (let i = 0; i < count; i += 1) {
        if (nextRandom() > 0.5) {
          const offset = (i + 0.5) * (wallLength / count) - wallLength / 2;
          const meshes = this.neonBuilder.build({
            id: `${id}_wall_light_${wallName}_${i}`,
            position: new Vector3(
              isXWall ? position.x + offset : wallX,
              position.y + height * (0.5 + nextRandom() * 0.3),
              isXWall ? wallZ : position.z + offset
            ),
            color: finalAccentColor,
            shape: 'bar',
            size: { width: 0.8, height: 0.1 },
            mount: 'wall',
            rotation: isXWall ? 0 : Math.PI / 2,
            intensity: 0.8,
          });
          this.trackMeshes(meshes);
        }
      }
    };

    if (walls.north) addWallLights('north', 0, position.z - depth / 2, true, width);
    if (walls.south) addWallLights('south', 0, position.z + depth / 2, true, width);
    if (walls.east) addWallLights('east', position.x + width / 2, 0, false, depth);
    if (walls.west) addWallLights('west', position.x - width / 2, 0, false, depth);

    const ambientGlow = this.neonBuilder.build({
      id: `${id}_ambient_glow`,
      position: new Vector3(position.x, position.y + 0.05, position.z),
      color: finalAccentColor,
      shape: 'rectangle',
      size: { width: width * 0.6, height: depth * 0.6 },
      mount: 'ground',
      intensity: ambientLevel,
    });
    this.trackMeshes(ambientGlow);

    return this.meshes;
  }

  dispose() {
    this.floorBuilder.dispose();
    this.neonBuilder.dispose();
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    this.meshes = [];
  }

  private trackMeshes(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
