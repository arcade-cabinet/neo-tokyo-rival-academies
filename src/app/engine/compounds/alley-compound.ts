import { type AbstractMesh, Color3, type Scene, Vector3 } from '@babylonjs/core';
import { NeonSignBuilder } from '../signage/neon-sign';
import { FloorBuilder, type FloorSurface } from '../structural/floor';
import { createTexturedWall, type WallTextureType } from '../structural/textured-wall';

export type AlleyMood = 'dark' | 'neon' | 'industrial' | 'residential';

export interface AlleyOptions {
  id: string;
  position: Vector3;
  dimensions: {
    length: number;
    width: number;
    wallHeight: number;
  };
  mood?: AlleyMood;
  wallTexture?: WallTextureType;
  floorSurface?: FloorSurface;
  deadEnd?: boolean;
  seed?: number;
  overheadPipes?: boolean;
  neonDensity?: number;
  accentColor?: Color3;
}

const MOOD_PRESETS: Record<
  AlleyMood,
  {
    wallTexture: WallTextureType;
    floorSurface: FloorSurface;
    accentColor: Color3;
    neonDensity: number;
    hasOverhead: boolean;
  }
> = {
  dark: {
    wallTexture: 'concrete_dirty',
    floorSurface: 'concrete',
    accentColor: new Color3(0.3, 0.3, 0.4),
    neonDensity: 0.1,
    hasOverhead: true,
  },
  neon: {
    wallTexture: 'concrete_dirty',
    floorSurface: 'concrete',
    accentColor: new Color3(1, 0, 0.5),
    neonDensity: 0.7,
    hasOverhead: true,
  },
  industrial: {
    wallTexture: 'metal_rusted',
    floorSurface: 'metal_grating',
    accentColor: new Color3(1, 0.5, 0),
    neonDensity: 0.3,
    hasOverhead: true,
  },
  residential: {
    wallTexture: 'brick_grey',
    floorSurface: 'concrete',
    accentColor: new Color3(1, 0.9, 0.7),
    neonDensity: 0.2,
    hasOverhead: false,
  },
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const ALLEY_PRESETS = {
  narrow_passage: {
    dimensions: { length: 15, width: 3, wallHeight: 8 },
    mood: 'neon' as AlleyMood,
  },
  service_alley: {
    dimensions: { length: 20, width: 4, wallHeight: 6 },
    mood: 'industrial' as AlleyMood,
  },
  residential_alley: {
    dimensions: { length: 12, width: 3.5, wallHeight: 10 },
    mood: 'residential' as AlleyMood,
  },
  dead_end: {
    dimensions: { length: 10, width: 3, wallHeight: 8 },
    mood: 'dark' as AlleyMood,
    deadEnd: true,
  },
};

export class AlleyCompound {
  private meshes: AbstractMesh[] = [];
  private floorBuilder: FloorBuilder;
  private neonBuilder: NeonSignBuilder;

  constructor(private readonly scene: Scene) {
    this.floorBuilder = new FloorBuilder(scene);
    this.neonBuilder = new NeonSignBuilder(scene);
  }

  build(options: AlleyOptions) {
    const {
      id,
      position,
      dimensions,
      mood = 'neon',
      wallTexture,
      floorSurface,
      deadEnd = false,
      seed = 42,
      overheadPipes,
      neonDensity,
      accentColor,
    } = options;

    const preset = MOOD_PRESETS[mood];
    const finalWallTexture = wallTexture ?? preset.wallTexture;
    const finalFloorSurface = floorSurface ?? preset.floorSurface;
    const finalAccentColor = accentColor ?? preset.accentColor;
    const finalNeonDensity = neonDensity ?? preset.neonDensity;
    const finalHasOverhead = overheadPipes ?? preset.hasOverhead;

    const { length, width, wallHeight } = dimensions;

    const leftWall = createTexturedWall(this.scene, {
      id: `${id}_left_wall`,
      position: new Vector3(position.x - width / 2, position.y, position.z + length / 2),
      size: { width: 0.3, height: wallHeight, depth: length },
      textureType: finalWallTexture,
    });
    const rightWall = createTexturedWall(this.scene, {
      id: `${id}_right_wall`,
      position: new Vector3(position.x + width / 2, position.y, position.z + length / 2),
      size: { width: 0.3, height: wallHeight, depth: length },
      textureType: finalWallTexture,
    });
    this.trackMeshes([leftWall, rightWall]);

    if (deadEnd) {
      const backWall = createTexturedWall(this.scene, {
        id: `${id}_back_wall`,
        position: new Vector3(position.x, position.y, position.z + length),
        size: { width: width + 0.6, height: wallHeight, depth: 0.3 },
        textureType: finalWallTexture,
      });
      this.trackMeshes([backWall]);
    }

    const floorMeshes = this.floorBuilder.build({
      id: `${id}_floor`,
      position: new Vector3(position.x, position.y, position.z + length / 2),
      size: { width, depth: length },
      surface: finalFloorSurface,
    });
    this.trackMeshes(floorMeshes);

    const neonColors = [
      new Color3(1, 0, 0.5),
      new Color3(0, 1, 0.8),
      new Color3(1, 0.5, 0),
      new Color3(0.5, 0, 1),
      finalAccentColor,
    ];

    let seedCounter = seed;
    const nextRandom = () => {
      seedCounter += 1;
      return seededRandom(seedCounter);
    };

    const spacing = 4;
    const count = Math.floor(length / spacing);
    for (let i = 0; i < count; i += 1) {
      if (nextRandom() > 1 - finalNeonDensity) {
        const wallSide = nextRandom() > 0.5 ? 'left' : 'right';
        const z = position.z + (i + 0.5) * spacing;
        const x = wallSide === 'left' ? position.x - width / 2 + 0.1 : position.x + width / 2 - 0.1;
        const y = position.y + wallHeight * (0.4 + nextRandom() * 0.4);
        const rotation = wallSide === 'left' ? Math.PI / 2 : -Math.PI / 2;
        const neonMeshes = this.neonBuilder.build({
          id: `${id}_neon_${i}`,
          position: new Vector3(x, y, z),
          color: neonColors[Math.floor(nextRandom() * neonColors.length)],
          shape: 'bar',
          size: { width: 0.8, height: 0.1 },
          mount: 'wall',
          rotation,
          intensity: 1.2,
        });
        this.trackMeshes(neonMeshes);
      }
    }

    if (finalHasOverhead) {
      let pipeSeed = seed + 1000;
      const nextPipeRandom = () => {
        pipeSeed += 1;
        return seededRandom(pipeSeed);
      };
      const pipeCount = Math.floor(length / 6);
      for (let i = 0; i < pipeCount; i += 1) {
        if (nextPipeRandom() > 0.3) {
          const z = position.z + (i + 0.5) * (length / pipeCount);
          const y = position.y + wallHeight - 0.5 - nextPipeRandom() * 1;
          const pipeWidth = width * (0.8 + nextPipeRandom() * 0.2);
          const pipeMeshes = this.floorBuilder.build({
            id: `${id}_pipe_${i}`,
            position: new Vector3(position.x, y, z),
            size: { width: pipeWidth, depth: 0.15 },
            surface: 'metal_grating',
          });
          this.trackMeshes(pipeMeshes);
        }
      }
    }

    const entranceGlow = this.neonBuilder.build({
      id: `${id}_entrance_glow`,
      position: new Vector3(position.x, position.y + 0.1, position.z + 0.5),
      color: finalAccentColor,
      shape: 'rectangle',
      size: { width: width * 0.8, height: 0.3 },
      mount: 'ground',
      intensity: 0.5,
    });
    this.trackMeshes(entranceGlow);

    if (deadEnd) {
      const deadGlow = this.neonBuilder.build({
        id: `${id}_deadend_glow`,
        position: new Vector3(position.x, position.y + wallHeight * 0.6, position.z + length - 0.1),
        color: new Color3(1, 0, 0.3),
        shape: 'rectangle',
        size: { width: width * 0.5, height: 0.3 },
        mount: 'wall',
        intensity: 0.8,
      });
      this.trackMeshes(deadGlow);
    }

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
