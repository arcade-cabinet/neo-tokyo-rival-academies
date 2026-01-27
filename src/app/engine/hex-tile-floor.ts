import { type AbstractMesh, Color3, MeshBuilder, type Scene } from '@babylonjs/core';
import { applyLeftClipping, applyRightClipping } from './clipping-planes';
import type { GridBounds } from './grid-types';
import { createHexMatrix, HEX_SIZE } from './hex-grid';
import { HexGridSystem } from './hex-grid-system';
import { createAllTileMaterials } from './tile-materials';
import { TileType } from './tiles';

export interface HexTileFloorOptions {
  seed: string;
  cols: number;
  rows: number;
  bounds: GridBounds;
  debug?: boolean;
}

export class HexTileFloor {
  private meshes: AbstractMesh[] = [];
  private materials: ReturnType<typeof createAllTileMaterials> | null = null;

  constructor(private readonly scene: Scene) {}

  build(options: HexTileFloorOptions) {
    const { seed, cols, rows, bounds, debug = false } = options;

    const tiles = HexGridSystem.generateGrid({ seed, cols, rows, bounds });
    const materials = createAllTileMaterials(this.scene);
    const { leftEdge, rightEdge } = HexGridSystem.getEdgeTiles(tiles, bounds);

    const tilesByType: Record<TileType, typeof tiles> = {
      [TileType.BASE]: [],
      [TileType.AIRVENT]: [],
      [TileType.PIPES]: [],
      [TileType.GENERATOR]: [],
      [TileType.ANTENNA]: [],
      [TileType.EDGE]: [],
    };

    for (const tile of tiles) {
      tilesByType[tile.type].push(tile);
    }

    const tileScale = 1.02;
    const masterHex = MeshBuilder.CreateCylinder(
      'hexMaster',
      {
        height: 0.15,
        diameter: HEX_SIZE * 2 * tileScale,
        tessellation: 6,
      },
      this.scene
    );
    masterHex.rotation.y = Math.PI / 6;
    masterHex.isVisible = false;

    const createdMeshes: AbstractMesh[] = [];

    for (const [type, typeTiles] of Object.entries(tilesByType)) {
      if (typeTiles.length === 0) continue;

      const tileType = type as TileType;
      const instanceMesh = masterHex.clone(`hex_${tileType}`);
      if (!instanceMesh) continue;
      instanceMesh.isVisible = true;
      instanceMesh.material = materials[tileType];

      const matrices: number[] = [];
      for (const tile of typeTiles) {
        const matrix = createHexMatrix(tile.q, tile.r);
        matrices.push(...matrix.asArray());
      }

      instanceMesh.thinInstanceSetBuffer('matrix', new Float32Array(matrices), 16);

      const isLeftEdge = leftEdge.some((t) => typeTiles.includes(t));
      const isRightEdge = rightEdge.some((t) => typeTiles.includes(t));

      if (isLeftEdge && instanceMesh.material) {
        applyLeftClipping(instanceMesh.material, bounds.minX);
      }
      if (isRightEdge && instanceMesh.material) {
        applyRightClipping(instanceMesh.material, bounds.maxX);
      }

      createdMeshes.push(instanceMesh);
    }

    masterHex.dispose();

    if (debug) {
      for (const mesh of createdMeshes) {
        if (mesh.material) {
          (mesh.material as { wireframe?: boolean }).wireframe = true;
        }
      }

      const boundsBox = MeshBuilder.CreateBox(
        'boundsDebug',
        {
          width: bounds.maxX - bounds.minX,
          height: 0.1,
          depth: bounds.maxZ - bounds.minZ,
        },
        this.scene
      );
      boundsBox.position.x = (bounds.minX + bounds.maxX) / 2;
      boundsBox.position.z = (bounds.minZ + bounds.maxZ) / 2;
      boundsBox.position.y = 0.2;

      const boundsMaterial = boundsBox.material || this.scene.defaultMaterial;
      (boundsMaterial as { wireframe?: boolean; diffuseColor?: Color3 }).wireframe = true;
      (boundsMaterial as { diffuseColor?: Color3 }).diffuseColor = new Color3(1, 0, 0);
      createdMeshes.push(boundsBox);
    }

    this.meshes = createdMeshes;
    this.materials = materials;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    if (this.materials) {
      for (const material of Object.values(this.materials)) {
        material.dispose();
      }
    }
    this.meshes = [];
    this.materials = null;
  }
}
