import { type AbstractMesh, Color3, type Scene, Vector3 } from '@babylonjs/core';
import { NeonSignBuilder } from '../signage/neon-sign';
import { FloorBuilder, type FloorSurface } from '../structural/floor';
import { createTexturedWall } from '../structural/textured-wall';

export type BridgeStyle = 'industrial' | 'modern' | 'makeshift' | 'glass';

export interface BridgeOptions {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  width?: number;
  style?: BridgeStyle;
  surfaceType?: FloorSurface;
  railings?: boolean;
  railingHeight?: number;
  supportCount?: number;
  edgeLighting?: boolean;
  accentColor?: Color3;
}

const STYLE_PRESETS: Record<
  BridgeStyle,
  {
    surface: FloorSurface;
    accentColor: Color3;
    hasRailings: boolean;
    railingHeight: number;
  }
> = {
  industrial: {
    surface: 'metal_grating',
    accentColor: new Color3(1, 0.5, 0),
    hasRailings: true,
    railingHeight: 1.0,
  },
  modern: {
    surface: 'tile',
    accentColor: new Color3(0, 0.8, 1),
    hasRailings: true,
    railingHeight: 1.2,
  },
  makeshift: {
    surface: 'concrete',
    accentColor: new Color3(1, 0.9, 0.5),
    hasRailings: false,
    railingHeight: 0.8,
  },
  glass: {
    surface: 'tile',
    accentColor: new Color3(0, 1, 0.8),
    hasRailings: true,
    railingHeight: 1.0,
  },
};

export class BridgeCompound {
  private meshes: AbstractMesh[] = [];
  private floorBuilder: FloorBuilder;
  private neonBuilder: NeonSignBuilder;

  constructor(private readonly scene: Scene) {
    this.floorBuilder = new FloorBuilder(scene);
    this.neonBuilder = new NeonSignBuilder(scene);
  }

  build(options: BridgeOptions) {
    const {
      id,
      startPosition,
      endPosition,
      width = 2,
      style = 'industrial',
      surfaceType,
      railings,
      railingHeight,
      supportCount = 0,
      edgeLighting = true,
      accentColor,
    } = options;

    const preset = STYLE_PRESETS[style];
    const finalSurface = surfaceType ?? preset.surface;
    const finalAccentColor = accentColor ?? preset.accentColor;
    const finalHasRailings = railings ?? preset.hasRailings;
    const finalRailingHeight = railingHeight ?? preset.railingHeight;

    const direction = endPosition.subtract(startPosition);
    const length = direction.length();
    const midPoint = startPosition.add(direction.scale(0.5));
    const angle = Math.atan2(direction.x, direction.z);
    const avgHeight = (startPosition.y + endPosition.y) / 2;

    const deckMeshes = this.floorBuilder.build({
      id: `${id}_deck`,
      position: new Vector3(midPoint.x, avgHeight, midPoint.z),
      size: { width: length, depth: width },
      surface: finalSurface,
      rotation: angle,
    });
    this.trackMeshes(deckMeshes);

    if (finalHasRailings) {
      const leftRail = createTexturedWall(this.scene, {
        id: `${id}_railing_left`,
        position: new Vector3(
          midPoint.x - Math.cos(angle) * (width / 2),
          avgHeight,
          midPoint.z + Math.sin(angle) * (width / 2)
        ),
        size: { width: length, height: finalRailingHeight, depth: 0.05 },
        textureType: 'metal_rusted',
        rotation: angle,
      });
      const rightRail = createTexturedWall(this.scene, {
        id: `${id}_railing_right`,
        position: new Vector3(
          midPoint.x + Math.cos(angle) * (width / 2),
          avgHeight,
          midPoint.z - Math.sin(angle) * (width / 2)
        ),
        size: { width: length, height: finalRailingHeight, depth: 0.05 },
        textureType: 'metal_rusted',
        rotation: angle,
      });
      this.trackMeshes([leftRail, rightRail]);
    }

    if (supportCount > 0) {
      for (let i = 1; i <= supportCount; i += 1) {
        const t = i / (supportCount + 1);
        const pos = startPosition.add(direction.scale(t));
        const support = createTexturedWall(this.scene, {
          id: `${id}_support_${i}`,
          position: new Vector3(pos.x, 0, pos.z),
          size: { width: 0.4, height: pos.y, depth: 0.4 },
          textureType: 'metal_rusted',
        });
        this.trackMeshes([support]);
      }
    }

    if (edgeLighting) {
      const spacing = 3;
      const count = Math.floor(length / spacing);
      const perpX = Math.cos(angle);
      const perpZ = -Math.sin(angle);

      for (let i = 0; i <= count; i += 1) {
        const t = count > 0 ? i / count : 0.5;
        const basePos = startPosition.add(direction.scale(t));
        const leftPos = new Vector3(
          basePos.x - perpX * (width / 2 + 0.1),
          basePos.y + 0.05,
          basePos.z - perpZ * (width / 2 + 0.1)
        );
        const rightPos = new Vector3(
          basePos.x + perpX * (width / 2 + 0.1),
          basePos.y + 0.05,
          basePos.z + perpZ * (width / 2 + 0.1)
        );
        const leftMeshes = this.neonBuilder.build({
          id: `${id}_light_left_${i}`,
          position: leftPos,
          color: finalAccentColor,
          shape: 'circle',
          size: { width: 0.15, height: 0.15 },
          mount: 'ground',
          intensity: 0.8,
        });
        const rightMeshes = this.neonBuilder.build({
          id: `${id}_light_right_${i}`,
          position: rightPos,
          color: finalAccentColor,
          shape: 'circle',
          size: { width: 0.15, height: 0.15 },
          mount: 'ground',
          intensity: 0.8,
        });
        this.trackMeshes([...leftMeshes, ...rightMeshes]);
      }
    }

    const startMarker = this.neonBuilder.build({
      id: `${id}_start_marker`,
      position: new Vector3(startPosition.x, startPosition.y + 0.05, startPosition.z),
      color: new Color3(0, 1, 0.5),
      shape: 'bar',
      size: { width, height: 0.1 },
      mount: 'ground',
      rotation: angle,
      intensity: 1.0,
    });
    const endMarker = this.neonBuilder.build({
      id: `${id}_end_marker`,
      position: new Vector3(endPosition.x, endPosition.y + 0.05, endPosition.z),
      color: new Color3(1, 0, 0.5),
      shape: 'bar',
      size: { width, height: 0.1 },
      mount: 'ground',
      rotation: angle,
      intensity: 1.0,
    });
    this.trackMeshes([...startMarker, ...endMarker]);

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
