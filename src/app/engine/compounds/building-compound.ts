import { type AbstractMesh, Color3, type Scene, Vector3 } from '@babylonjs/core';
import { type NeonShape, NeonSignBuilder } from '../signage/neon-sign';
import { FloorBuilder, type FloorSurface } from '../structural/floor';
import { RoofBuilder, type RoofStyle } from '../structural/roof';
import { createTexturedWall, type WallTextureType } from '../structural/textured-wall';

export type BuildingStyle = 'residential' | 'commercial' | 'industrial' | 'office';

export interface BuildingOptions {
  id: string;
  position: Vector3;
  footprint: { width: number; depth: number };
  floors?: number;
  floorHeight?: number;
  style?: BuildingStyle;
  wallTexture?: WallTextureType;
  rooftopSurface?: FloorSurface;
  roofStyle?: RoofStyle | 'none';
  signs?: Array<{
    position: 'front' | 'side' | 'top';
    shape: NeonShape;
    color: Color3;
    floor?: number;
  }>;
  seed?: number;
  rooftopEquipment?: boolean;
  accentColor?: Color3;
}

const STYLE_PRESETS: Record<
  BuildingStyle,
  {
    wallTexture: WallTextureType;
    rooftopSurface: FloorSurface;
    roofStyle: RoofStyle | 'none';
    accentColor: Color3;
    hasEquipment: boolean;
  }
> = {
  residential: {
    wallTexture: 'brick_grey',
    rooftopSurface: 'concrete',
    roofStyle: 'none',
    accentColor: new Color3(1, 0.8, 0.3),
    hasEquipment: false,
  },
  commercial: {
    wallTexture: 'concrete_dirty',
    rooftopSurface: 'concrete',
    roofStyle: 'flat',
    accentColor: new Color3(1, 0, 0.5),
    hasEquipment: true,
  },
  industrial: {
    wallTexture: 'metal_rusted',
    rooftopSurface: 'metal_grating',
    roofStyle: 'industrial',
    accentColor: new Color3(1, 0.5, 0),
    hasEquipment: true,
  },
  office: {
    wallTexture: 'concrete_clean',
    rooftopSurface: 'tile',
    roofStyle: 'glass',
    accentColor: new Color3(0, 0.8, 1),
    hasEquipment: true,
  },
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const BUILDING_PRESETS = {
  apartment_small: {
    footprint: { width: 8, depth: 8 },
    floors: 4,
    style: 'residential' as BuildingStyle,
  },
  apartment_tall: {
    footprint: { width: 10, depth: 10 },
    floors: 8,
    style: 'residential' as BuildingStyle,
  },
  shop: {
    footprint: { width: 6, depth: 8 },
    floors: 2,
    style: 'commercial' as BuildingStyle,
    signs: [
      { position: 'front' as const, shape: 'rectangle' as NeonShape, color: new Color3(1, 0, 0.5) },
    ],
  },
  warehouse: {
    footprint: { width: 15, depth: 20 },
    floors: 2,
    style: 'industrial' as BuildingStyle,
  },
  office_tower: {
    footprint: { width: 12, depth: 12 },
    floors: 10,
    style: 'office' as BuildingStyle,
    signs: [{ position: 'top' as const, shape: 'bar' as NeonShape, color: new Color3(0, 1, 0.8) }],
  },
};

export class BuildingCompound {
  private meshes: AbstractMesh[] = [];
  private materials: Set<unknown> = new Set();
  private floorBuilder: FloorBuilder;
  private roofBuilder: RoofBuilder;
  private neonBuilder: NeonSignBuilder;

  constructor(private readonly scene: Scene) {
    this.floorBuilder = new FloorBuilder(scene);
    this.roofBuilder = new RoofBuilder(scene);
    this.neonBuilder = new NeonSignBuilder(scene);
  }

  build(options: BuildingOptions) {
    const {
      id,
      position,
      footprint,
      floors = 3,
      floorHeight = 3,
      style = 'commercial',
      wallTexture,
      rooftopSurface,
      roofStyle,
      signs = [],
      seed = 12345,
      rooftopEquipment,
      accentColor,
    } = options;

    const preset = STYLE_PRESETS[style];
    const finalWallTexture = wallTexture ?? preset.wallTexture;
    const finalRooftopSurface = rooftopSurface ?? preset.rooftopSurface;
    const finalRoofStyle = roofStyle ?? preset.roofStyle;
    const finalAccentColor = accentColor ?? preset.accentColor;
    const finalHasEquipment = rooftopEquipment ?? preset.hasEquipment;

    const buildingHeight = floors * floorHeight;
    const rooftopY = position.y + buildingHeight;

    const front = createTexturedWall(this.scene, {
      id: `${id}_front`,
      position: new Vector3(position.x, position.y, position.z - footprint.depth / 2),
      size: { width: footprint.width, height: buildingHeight, depth: 0.3 },
      textureType: finalWallTexture,
    });
    const back = createTexturedWall(this.scene, {
      id: `${id}_back`,
      position: new Vector3(position.x, position.y, position.z + footprint.depth / 2),
      size: { width: footprint.width, height: buildingHeight, depth: 0.3 },
      textureType: finalWallTexture,
    });
    const left = createTexturedWall(this.scene, {
      id: `${id}_left`,
      position: new Vector3(position.x - footprint.width / 2, position.y, position.z),
      size: { width: 0.3, height: buildingHeight, depth: footprint.depth },
      textureType: finalWallTexture,
    });
    const right = createTexturedWall(this.scene, {
      id: `${id}_right`,
      position: new Vector3(position.x + footprint.width / 2, position.y, position.z),
      size: { width: 0.3, height: buildingHeight, depth: footprint.depth },
      textureType: finalWallTexture,
    });

    this.trackMeshes([front, back, left, right]);

    const roofFloor = this.floorBuilder.build({
      id: `${id}_rooftop`,
      position: new Vector3(position.x, rooftopY, position.z),
      size: { width: footprint.width, depth: footprint.depth },
      surface: finalRooftopSurface,
      edgeTrim: true,
    });
    this.trackMeshes(roofFloor);

    if (finalRoofStyle !== 'none') {
      const roofMeshes = this.roofBuilder.build({
        id: `${id}_roof`,
        position: new Vector3(position.x, rooftopY + 2, position.z),
        size: { width: footprint.width * 0.6, depth: footprint.depth * 0.4, thickness: 0.1 },
        style: finalRoofStyle,
        equipment: finalHasEquipment,
        equipmentDensity: 2,
        edgeGlow: finalAccentColor,
        seed,
      });
      this.trackMeshes(roofMeshes);
    }

    const windowNeons = this.buildWindowNeons(
      seed,
      floors,
      floorHeight,
      footprint,
      position,
      finalAccentColor
    );
    const neonMeshes: AbstractMesh[] = [];
    windowNeons.slice(0, 15).forEach((wn, i) => {
      const meshes = this.neonBuilder.build({
        id: `${id}_window_${i}`,
        position: new Vector3(wn.x, wn.y, wn.z),
        color: wn.color,
        shape: 'rectangle',
        size: { width: 0.6, height: 0.4 },
        mount: 'wall',
        intensity: 0.8,
      });
      neonMeshes.push(...meshes);
    });

    signs.forEach((sign, i) => {
      const floorLevel = sign.floor === -1 ? floors - 1 : (sign.floor ?? 0);
      const signY = position.y + floorLevel * floorHeight + floorHeight * 0.7;
      let signPos = new Vector3(position.x, signY, position.z - footprint.depth / 2 - 0.1);
      let rotation = 0;
      if (sign.position === 'side') {
        signPos = new Vector3(position.x - footprint.width / 2 - 0.1, signY, position.z);
        rotation = Math.PI / 2;
      } else if (sign.position === 'top') {
        signPos = new Vector3(position.x, rooftopY + 1, position.z);
      }
      const meshes = this.neonBuilder.build({
        id: `${id}_sign_${i}`,
        position: signPos,
        color: sign.color,
        shape: sign.shape,
        size: { width: 2, height: 1.2 },
        mount: 'wall',
        rotation,
      });
      neonMeshes.push(...meshes);
    });

    this.trackMeshes(neonMeshes);

    return this.meshes;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.material?.dispose?.();
      mesh.dispose();
    }
    this.floorBuilder.dispose();
    this.roofBuilder.dispose();
    this.neonBuilder.dispose();
    this.meshes = [];
    this.materials.clear();
  }

  private buildWindowNeons(
    seed: number,
    floors: number,
    floorHeight: number,
    footprint: { width: number; depth: number },
    position: Vector3,
    accent: Color3
  ) {
    const neons: Array<{ x: number; y: number; z: number; color: Color3 }> = [];
    let seedCounter = seed;
    const nextRandom = () => {
      seedCounter += 1;
      return seededRandom(seedCounter);
    };
    const windowColors = [
      new Color3(1, 0.9, 0.7),
      new Color3(0.7, 0.9, 1),
      new Color3(1, 0.5, 0.3),
      accent,
    ];
    for (let floor = 0; floor < floors; floor++) {
      const windowCount = Math.floor(footprint.width / 2);
      for (let w = 0; w < windowCount; w++) {
        if (nextRandom() > 0.4) {
          neons.push({
            x: position.x - footprint.width / 2 + 1 + w * 2,
            y: position.y + floor * floorHeight + floorHeight / 2,
            z: position.z - footprint.depth / 2 - 0.01,
            color: windowColors[Math.floor(nextRandom() * windowColors.length)],
          });
        }
      }
    }
    return neons;
  }

  private trackMeshes(meshes: AbstractMesh[]) {
    for (const mesh of meshes) {
      this.meshes.push(mesh);
      if (mesh.material) {
        this.materials.add(mesh.material);
      }
    }
  }
}
