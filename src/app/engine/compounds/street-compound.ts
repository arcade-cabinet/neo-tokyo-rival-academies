import { type AbstractMesh, Color3, MeshBuilder, type Scene, Vector3 } from '@babylonjs/core';
import { NeonSignBuilder } from '../signage/neon-sign';
import { FloorBuilder } from '../structural/floor';
import { createTexturedWall } from '../structural/textured-wall';
import { createEnvironmentMaterial } from '../toon-material';

export type StreetStyle = 'commercial' | 'industrial' | 'residential' | 'market';

export interface StreetOptions {
  id: string;
  position: Vector3;
  dimensions: {
    length: number;
    canalWidth: number;
    walkwayWidth: number;
  };
  style?: StreetStyle;
  seed?: number;
  leftWalkway?: boolean;
  rightWalkway?: boolean;
  waterLevel?: number;
  canalDepth?: number;
  accentColor?: Color3;
  ferryStops?: number;
}

const STYLE_PRESETS: Record<
  StreetStyle,
  {
    accentColor: Color3;
    waterColor: Color3;
    walkwaySurface: 'concrete' | 'metal_grating' | 'tile';
    neonDensity: number;
  }
> = {
  commercial: {
    accentColor: new Color3(1, 0, 0.5),
    waterColor: new Color3(0.02, 0.05, 0.1),
    walkwaySurface: 'concrete',
    neonDensity: 0.7,
  },
  industrial: {
    accentColor: new Color3(1, 0.5, 0),
    waterColor: new Color3(0.05, 0.05, 0.05),
    walkwaySurface: 'metal_grating',
    neonDensity: 0.3,
  },
  residential: {
    accentColor: new Color3(1, 0.9, 0.7),
    waterColor: new Color3(0.02, 0.05, 0.08),
    walkwaySurface: 'concrete',
    neonDensity: 0.4,
  },
  market: {
    accentColor: new Color3(1, 0.8, 0.2),
    waterColor: new Color3(0.02, 0.04, 0.08),
    walkwaySurface: 'tile',
    neonDensity: 0.8,
  },
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const STREET_PRESETS = {
  main_canal: {
    dimensions: { length: 50, canalWidth: 8, walkwayWidth: 4 },
    style: 'commercial' as StreetStyle,
    ferryStops: 2,
  },
  back_canal: {
    dimensions: { length: 30, canalWidth: 5, walkwayWidth: 2.5 },
    style: 'residential' as StreetStyle,
    ferryStops: 1,
  },
  industrial_canal: {
    dimensions: { length: 40, canalWidth: 10, walkwayWidth: 3 },
    style: 'industrial' as StreetStyle,
    ferryStops: 1,
  },
  market_canal: {
    dimensions: { length: 35, canalWidth: 6, walkwayWidth: 5 },
    style: 'market' as StreetStyle,
    ferryStops: 3,
  },
  one_sided: {
    dimensions: { length: 25, canalWidth: 6, walkwayWidth: 3 },
    style: 'industrial' as StreetStyle,
    leftWalkway: true,
    rightWalkway: false,
  },
};

export class StreetCompound {
  private meshes: AbstractMesh[] = [];
  private floorBuilder: FloorBuilder;
  private neonBuilder: NeonSignBuilder;

  constructor(private readonly scene: Scene) {
    this.floorBuilder = new FloorBuilder(scene);
    this.neonBuilder = new NeonSignBuilder(scene);
  }

  build(options: StreetOptions) {
    const {
      id,
      position,
      dimensions,
      style = 'commercial',
      seed = 42,
      leftWalkway = true,
      rightWalkway = true,
      waterLevel = -0.5,
      canalDepth = 3,
      accentColor,
      ferryStops = 0,
    } = options;

    const preset = STYLE_PRESETS[style];
    const finalAccentColor = accentColor ?? preset.accentColor;
    const { length, canalWidth, walkwayWidth } = dimensions;

    const water = MeshBuilder.CreateGround(
      `${id}_canal`,
      { width: canalWidth, height: length },
      this.scene
    );
    water.position = new Vector3(position.x, position.y + waterLevel, position.z + length / 2);
    const waterMat = createEnvironmentMaterial(`${id}_water_mat`, this.scene, preset.waterColor);
    waterMat.alpha = 0.85;
    water.material = waterMat;
    this.trackMeshes([water]);

    if (leftWalkway) {
      const leftWall = createTexturedWall(this.scene, {
        id: `${id}_canal_wall_left`,
        position: new Vector3(
          position.x - canalWidth / 2,
          position.y + waterLevel - canalDepth,
          position.z + length / 2
        ),
        size: { width: 0.2, height: canalDepth, depth: length },
        textureType: 'concrete_dirty',
      });
      this.trackMeshes([leftWall]);
    }

    if (rightWalkway) {
      const rightWall = createTexturedWall(this.scene, {
        id: `${id}_canal_wall_right`,
        position: new Vector3(
          position.x + canalWidth / 2,
          position.y + waterLevel - canalDepth,
          position.z + length / 2
        ),
        size: { width: 0.2, height: canalDepth, depth: length },
        textureType: 'concrete_dirty',
      });
      this.trackMeshes([rightWall]);
    }

    if (leftWalkway) {
      const floorMeshes = this.floorBuilder.build({
        id: `${id}_walkway_left`,
        position: new Vector3(
          position.x - canalWidth / 2 - walkwayWidth / 2,
          position.y,
          position.z + length / 2
        ),
        size: { width: walkwayWidth, depth: length },
        surface: preset.walkwaySurface,
        edgeTrim: true,
      });
      this.trackMeshes(floorMeshes);
    }

    if (rightWalkway) {
      const floorMeshes = this.floorBuilder.build({
        id: `${id}_walkway_right`,
        position: new Vector3(
          position.x + canalWidth / 2 + walkwayWidth / 2,
          position.y,
          position.z + length / 2
        ),
        size: { width: walkwayWidth, depth: length },
        surface: preset.walkwaySurface,
        edgeTrim: true,
      });
      this.trackMeshes(floorMeshes);
    }

    let seedCounter = seed;
    const nextRandom = () => {
      seedCounter += 1;
      return seededRandom(seedCounter);
    };
    const neonColors = [
      finalAccentColor,
      new Color3(0, 1, 0.8),
      new Color3(1, 0, 0.5),
      new Color3(0.5, 0, 1),
    ];
    const spacing = 5;
    const count = Math.floor(length / spacing);
    for (let i = 0; i < count; i += 1) {
      if (nextRandom() > 1 - preset.neonDensity) {
        const z = position.z + (i + 0.5) * spacing;
        const side = nextRandom() > 0.5 ? -1 : 1;
        const x = position.x + side * (canalWidth / 2 + 0.3);
        const neonMeshes = this.neonBuilder.build({
          id: `${id}_neon_${i}`,
          position: new Vector3(x, position.y + waterLevel + 0.1, z),
          color: neonColors[Math.floor(nextRandom() * neonColors.length)],
          shape: 'bar',
          size: { width: 1.5, height: 0.1 },
          mount: 'ground',
          intensity: 1.0,
        });
        this.trackMeshes(neonMeshes);
      }
    }

    if (ferryStops > 0) {
      for (let i = 0; i < ferryStops; i += 1) {
        const t = (i + 0.5) / ferryStops;
        const z = position.z + t * length;
        const side = i % 2 === 0 ? 'left' : 'right';
        const x =
          side === 'left'
            ? position.x - canalWidth / 2 - walkwayWidth / 2
            : position.x + canalWidth / 2 + walkwayWidth / 2;
        const stopMeshes = this.neonBuilder.build({
          id: `${id}_ferry_${i}`,
          position: new Vector3(x, position.y + 0.1, z),
          color: new Color3(0, 1, 0.5),
          shape: 'rectangle',
          size: { width: walkwayWidth * 0.8, height: 2 },
          mount: 'ground',
          intensity: 0.6,
        });
        this.trackMeshes(stopMeshes);
      }
    }

    const entranceGlow = this.neonBuilder.build({
      id: `${id}_entrance_glow`,
      position: new Vector3(position.x, position.y + waterLevel + 0.1, position.z + 1),
      color: finalAccentColor,
      shape: 'bar',
      size: { width: canalWidth * 0.8, height: 0.3 },
      mount: 'ground',
      intensity: 0.7,
    });
    const exitGlow = this.neonBuilder.build({
      id: `${id}_exit_glow`,
      position: new Vector3(position.x, position.y + waterLevel + 0.1, position.z + length - 1),
      color: finalAccentColor,
      shape: 'bar',
      size: { width: canalWidth * 0.8, height: 0.3 },
      mount: 'ground',
      intensity: 0.7,
    });
    this.trackMeshes([...entranceGlow, ...exitGlow]);

    return this.meshes;
  }

  dispose() {
    this.floorBuilder.dispose();
    this.neonBuilder.dispose();
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private trackMeshes(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
