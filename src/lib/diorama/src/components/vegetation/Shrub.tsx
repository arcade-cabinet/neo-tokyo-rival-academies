/**
 * Shrub - Bushes and small vegetation
 *
 * Shrubs and bushes for urban landscaping.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type ShrubType = 'round' | 'box' | 'natural' | 'ornamental' | 'hedge' | 'overgrown';

export interface ShrubProps {
  id: string;
  position: Vector3;
  /** Shrub type */
  type?: ShrubType;
  /** Width */
  width?: number;
  /** Height */
  height?: number;
  /** Depth (for hedges) */
  depth?: number;
  /** Has flowers */
  hasFlowers?: boolean;
  /** Is trimmed */
  isTrimmed?: boolean;
  /** Health 0-1 */
  health?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Shrub({
  id,
  position,
  type = 'natural',
  width = 1,
  height = 0.8,
  depth = 1,
  hasFlowers = false,
  isTrimmed = false,
  health = 0.9,
  rotation = 0,
  seed,
}: ShrubProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    // Materials
    const leafMat = new PBRMaterial(`shrub_leaf_${id}`, scene);
    const branchMat = new PBRMaterial(`shrub_branch_${id}`, scene);

    // Color based on health
    const greenIntensity = 0.3 + health * 0.4;
    const brownMix = 1 - health;

    leafMat.albedoColor = new Color3(0.15 + brownMix * 0.3, greenIntensity, 0.1 + brownMix * 0.1);
    leafMat.metallic = 0;
    leafMat.roughness = 0.9;

    branchMat.albedoColor = new Color3(0.3, 0.22, 0.15);
    branchMat.metallic = 0;
    branchMat.roughness = 0.95;

    if (type === 'round' || type === 'ornamental') {
      // Spherical bush
      const mainBush = MeshBuilder.CreateSphere(
        `${id}_main`,
        { diameter: width, segments: 12 },
        scene
      );
      mainBush.position = new Vector3(posX, posY + height / 2, posZ);
      mainBush.scaling = new Vector3(1, height / width, 1);
      mainBush.material = leafMat;
      meshes.push(mainBush);

      if (!isTrimmed) {
        // Add irregular bumps
        const bumpCount = 5 + (rng ? Math.floor(rng.next() * 5) : 3);
        for (let b = 0; b < bumpCount; b++) {
          const bumpAngle = (rng ? rng.next() : b / bumpCount) * Math.PI * 2;
          const bumpY = height * 0.3 + (rng ? rng.next() : 0.5) * height * 0.5;
          const bumpDist = width * 0.35;
          const bumpSize = 0.15 + (rng ? rng.next() * 0.15 : 0.1);

          const bump = MeshBuilder.CreateSphere(
            `${id}_bump_${b}`,
            { diameter: bumpSize, segments: 8 },
            scene
          );
          bump.position = new Vector3(
            posX + Math.cos(bumpAngle) * bumpDist,
            posY + bumpY,
            posZ + Math.sin(bumpAngle) * bumpDist
          );
          bump.material = leafMat;
          meshes.push(bump);
        }
      }
    } else if (type === 'box') {
      // Box hedge
      const mainBox = MeshBuilder.CreateBox(
        `${id}_main`,
        { width: width, height: height, depth: depth },
        scene
      );
      mainBox.position = new Vector3(posX, posY + height / 2, posZ);
      mainBox.rotation.y = rotation;
      mainBox.material = leafMat;
      meshes.push(mainBox);
    } else if (type === 'hedge') {
      // Long hedge
      const hedgeLength = Math.max(width, depth);
      const hedgeWidth = Math.min(width, depth);

      const hedge = MeshBuilder.CreateBox(
        `${id}_hedge`,
        { width: hedgeLength, height: height, depth: hedgeWidth },
        scene
      );
      hedge.position = new Vector3(posX, posY + height / 2, posZ);
      hedge.rotation.y = rotation;
      hedge.material = leafMat;
      meshes.push(hedge);

      // Top rounding
      const topRound = MeshBuilder.CreateCylinder(
        `${id}_top`,
        { height: hedgeLength, diameter: hedgeWidth, tessellation: 12 },
        scene
      );
      topRound.position = new Vector3(posX, posY + height, posZ);
      topRound.rotation.z = Math.PI / 2;
      topRound.rotation.y = rotation;
      topRound.scaling = new Vector3(1, 0.3, 1);
      topRound.material = leafMat;
      meshes.push(topRound);
    } else if (type === 'natural' || type === 'overgrown') {
      // Organic shape using multiple spheres
      const clusterCount = type === 'overgrown' ? 8 : 5;

      for (let c = 0; c < clusterCount; c++) {
        const clusterAngle = (rng ? rng.next() : c / clusterCount) * Math.PI * 2;
        const clusterDist = (rng ? rng.next() : 0.5) * width * 0.3;
        const clusterY = (rng ? rng.next() : 0.5) * height * 0.6;
        const clusterSize = width * (0.3 + (rng ? rng.next() * 0.3 : 0.15));

        const cluster = MeshBuilder.CreateSphere(
          `${id}_cluster_${c}`,
          { diameter: clusterSize, segments: 8 },
          scene
        );
        cluster.position = new Vector3(
          posX + Math.cos(clusterAngle) * clusterDist,
          posY + height * 0.3 + clusterY,
          posZ + Math.sin(clusterAngle) * clusterDist
        );
        cluster.scaling = new Vector3(
          1 + (rng ? (rng.next() - 0.5) * 0.3 : 0),
          0.8 + (rng ? rng.next() * 0.4 : 0.2),
          1 + (rng ? (rng.next() - 0.5) * 0.3 : 0)
        );
        cluster.material = leafMat;
        meshes.push(cluster);
      }

      // Overgrown tendrils
      if (type === 'overgrown') {
        const tendrilCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
        for (let t = 0; t < tendrilCount; t++) {
          const tendrilAngle = (rng ? rng.next() : t / tendrilCount) * Math.PI * 2;
          const tendrilLength = 0.3 + (rng ? rng.next() * 0.4 : 0.2);

          const tendril = MeshBuilder.CreateCylinder(
            `${id}_tendril_${t}`,
            { height: tendrilLength, diameterTop: 0.02, diameterBottom: 0.05 },
            scene
          );
          tendril.position = new Vector3(
            posX + Math.cos(tendrilAngle) * width * 0.5,
            posY + height + tendrilLength * 0.3,
            posZ + Math.sin(tendrilAngle) * width * 0.5
          );
          tendril.rotation.x = (rng ? rng.next() - 0.5 : 0) * 0.5;
          tendril.rotation.z = (rng ? rng.next() - 0.5 : 0) * 0.5;
          tendril.material = leafMat;
          meshes.push(tendril);
        }
      }
    } else {
      // Default natural cluster
      const mainCluster = MeshBuilder.CreateSphere(
        `${id}_main`,
        { diameter: width, segments: 10 },
        scene
      );
      mainCluster.position = new Vector3(posX, posY + height / 2, posZ);
      mainCluster.scaling = new Vector3(1, height / width, depth / width);
      mainCluster.material = leafMat;
      meshes.push(mainCluster);
    }

    // Visible branches for natural types
    if ((type === 'natural' || type === 'overgrown') && health < 0.8) {
      const branchCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
      for (let br = 0; br < branchCount; br++) {
        const branchAngle = (rng ? rng.next() : br / branchCount) * Math.PI * 2;
        const branchLength = height * 0.4;

        const branch = MeshBuilder.CreateCylinder(
          `${id}_branch_${br}`,
          { height: branchLength, diameterTop: 0.02, diameterBottom: 0.04 },
          scene
        );
        branch.position = new Vector3(
          posX + Math.cos(branchAngle) * width * 0.2,
          posY + branchLength / 2,
          posZ + Math.sin(branchAngle) * width * 0.2
        );
        branch.rotation.z = branchAngle + Math.PI / 4;
        branch.material = branchMat;
        meshes.push(branch);
      }
    }

    // Flowers
    if (hasFlowers && health > 0.6) {
      const flowerMat = new PBRMaterial(`shrub_flower_${id}`, scene);
      const flowerHue = rng ? rng.next() : 0.5;
      flowerMat.albedoColor = new Color3(
        0.8 + flowerHue * 0.2,
        0.3 + (1 - flowerHue) * 0.5,
        0.5 + flowerHue * 0.3
      );
      flowerMat.metallic = 0;
      flowerMat.roughness = 0.8;

      const flowerCount = 8 + (rng ? Math.floor(rng.next() * 8) : 5);
      for (let f = 0; f < flowerCount; f++) {
        const flowerAngle = (rng ? rng.next() : f / flowerCount) * Math.PI * 2;
        const flowerDist = (rng ? rng.next() : 0.5) * width * 0.45;
        const flowerY = height * 0.5 + (rng ? rng.next() : 0.5) * height * 0.4;

        const flower = MeshBuilder.CreateSphere(
          `${id}_flower_${f}`,
          { diameter: 0.06 + (rng ? rng.next() * 0.04 : 0.02), segments: 6 },
          scene
        );
        flower.position = new Vector3(
          posX + Math.cos(flowerAngle) * flowerDist,
          posY + flowerY,
          posZ + Math.sin(flowerAngle) * flowerDist
        );
        flower.material = flowerMat;
        meshes.push(flower);
      }
    }

    // Dead leaves on ground
    if (health < 0.6) {
      const deadLeafMat = new PBRMaterial(`shrub_deadleaf_${id}`, scene);
      deadLeafMat.albedoColor = new Color3(0.4, 0.3, 0.15);
      deadLeafMat.metallic = 0;
      deadLeafMat.roughness = 0.95;

      const leafPileCount = 2 + (rng ? Math.floor(rng.next() * 3) : 1);
      for (let lp = 0; lp < leafPileCount; lp++) {
        const pileAngle = (rng ? rng.next() : lp / leafPileCount) * Math.PI * 2;
        const pileDist = width * 0.4 + (rng ? rng.next() * 0.3 : 0.15);

        const pile = MeshBuilder.CreateDisc(
          `${id}_leafpile_${lp}`,
          { radius: 0.15 + (rng ? rng.next() * 0.1 : 0.05), tessellation: 8 },
          scene
        );
        pile.position = new Vector3(
          posX + Math.cos(pileAngle) * pileDist,
          posY + 0.01,
          posZ + Math.sin(pileAngle) * pileDist
        );
        pile.rotation.x = Math.PI / 2;
        pile.material = deadLeafMat;
        meshes.push(pile);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      leafMat.dispose();
      branchMat.dispose();
    };
  }, [
    scene,
    id,
    posX,
    posY,
    posZ,
    type,
    width,
    height,
    depth,
    hasFlowers,
    isTrimmed,
    health,
    rotation,
    seed,
  ]);

  return null;
}
