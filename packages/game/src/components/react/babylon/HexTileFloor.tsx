/**
 * Hex Tile Floor Component
 *
 * Renders hex grid floor using thin instances for performance.
 */

import { type AbstractMesh, Color3, MeshBuilder } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createAllTileMaterials } from '@/materials/TileMaterials';
import { type GridBounds, HexGridSystem } from '@/systems/HexGridSystem';
import { TileType } from '@/types/tiles';
import { applyLeftClipping, applyRightClipping } from '@/utils/clipping-planes';
import { createHexMatrix, HEX_SIZE } from '@/utils/hex-grid-babylon';

export interface HexTileFloorProps {
  seed: string;
  cols: number;
  rows: number;
  bounds: GridBounds;
  debug?: boolean;
}

export function HexTileFloor({ seed, cols, rows, bounds, debug = false }: HexTileFloorProps) {
  const scene = useScene();
  const meshesRef = useRef<AbstractMesh[]>([]);

  useEffect(() => {
    if (!scene) return;

    // Generate tile grid
    const tiles = HexGridSystem.generateGrid({ seed, cols, rows, bounds });

    // Create materials for each tile type
    const materials = createAllTileMaterials(scene);

    // Get edge tiles for clipping
    const { leftEdge, rightEdge } = HexGridSystem.getEdgeTiles(tiles, bounds);

    // Group tiles by type
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

    // Create master hex mesh (flat-top orientation)
    const masterHex = MeshBuilder.CreateCylinder(
      'hexMaster',
      {
        height: 0.1,
        diameter: HEX_SIZE * 2,
        tessellation: 6,
      },
      scene
    );
    masterHex.rotation.y = Math.PI / 6; // Rotate for flat-top
    masterHex.isVisible = false; // Master mesh is not rendered

    // Create thin instances for each tile type
    const createdMeshes: AbstractMesh[] = [];

    for (const [type, typeTiles] of Object.entries(tilesByType)) {
      if (typeTiles.length === 0) continue;

      const tileType = type as TileType;
      const instanceMesh = masterHex.clone(`hex_${tileType}`);
      instanceMesh.isVisible = true;
      instanceMesh.material = materials[tileType];

      // Create transformation matrices for thin instances
      const matrices: number[] = [];
      for (const tile of typeTiles) {
        const matrix = createHexMatrix(tile.q, tile.r);
        matrices.push(...matrix.asArray());
      }

      // Apply thin instances
      instanceMesh.thinInstanceSetBuffer('matrix', new Float32Array(matrices), 16);

      // Apply clipping to edge tiles
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
    meshesRef.current = createdMeshes;

    // Debug visualization
    if (debug) {
      // Wireframe overlay
      for (const mesh of createdMeshes) {
        if (mesh.material) {
          // @ts-expect-error - wireframe exists on materials
          mesh.material.wireframe = true;
        }
      }

      // Bounds visualization
      const boundsBox = MeshBuilder.CreateBox(
        'boundsDebug',
        {
          width: bounds.maxX - bounds.minX,
          height: 0.1,
          depth: bounds.maxZ - bounds.minZ,
        },
        scene
      );
      boundsBox.position.x = (bounds.minX + bounds.maxX) / 2;
      boundsBox.position.z = (bounds.minZ + bounds.maxZ) / 2;
      boundsBox.position.y = 0.2;

      const boundsMaterial = boundsBox.material || scene.defaultMaterial;
      // @ts-expect-error - wireframe exists on materials
      boundsMaterial.wireframe = true;
      // @ts-expect-error - diffuseColor exists on materials
      boundsMaterial.diffuseColor = new Color3(1, 0, 0);

      createdMeshes.push(boundsBox);
    }

    return () => {
      for (const mesh of meshesRef.current) {
        mesh.dispose();
      }
      for (const material of Object.values(materials)) {
        material.dispose();
      }
      meshesRef.current = [];
    };
  }, [scene, seed, cols, rows, bounds, debug]);

  return null;
}
