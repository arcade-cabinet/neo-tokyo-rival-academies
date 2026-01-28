/**
 * FlowerBed - Flower beds and garden plots component
 *
 * Various flower bed types for urban gardens and overgrown areas.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type FlowerBedType = 'circular' | 'rectangular' | 'raised' | 'wild';
export type FlowerBedCondition = 'maintained' | 'overgrown' | 'neglected' | 'flourishing';
export type FlowerType = 'roses' | 'tulips' | 'wildflowers' | 'chrysanthemums' | 'mixed';

export interface FlowerBedProps {
  id: string;
  position: Vector3;
  /** Y-axis rotation in radians */
  rotation?: number;
  /** Bed type */
  type?: FlowerBedType;
  /** Condition of the flower bed */
  condition?: FlowerBedCondition;
  /** Width of the bed */
  width?: number;
  /** Depth of the bed */
  depth?: number;
  /** Type of flowers */
  flowerType?: FlowerType;
  /** Bloom level 0-1 (how many flowers are blooming) */
  bloomLevel?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function FlowerBed({
  id,
  position,
  rotation = 0,
  type = 'rectangular',
  condition = 'maintained',
  width = 1.5,
  depth = 1,
  flowerType = 'mixed',
  bloomLevel = 0.7,
  seed,
}: FlowerBedProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const materials: PBRMaterial[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    // Condition affects plant density and health
    const healthFactor =
      condition === 'maintained'
        ? 0.9
        : condition === 'overgrown'
          ? 0.75
          : condition === 'neglected'
            ? 0.5
            : 1.0; // flourishing

    const densityMultiplier =
      condition === 'maintained'
        ? 1.0
        : condition === 'overgrown'
          ? 1.5
          : condition === 'neglected'
            ? 0.6
            : 1.3; // flourishing

    // Soil material
    const soilMat = new PBRMaterial(`flowerbed_soil_${id}`, scene);
    soilMat.albedoColor = new Color3(0.25, 0.18, 0.12);
    soilMat.metallic = 0;
    soilMat.roughness = 0.95;
    materials.push(soilMat);

    // Border material
    const borderMat = new PBRMaterial(`flowerbed_border_${id}`, scene);
    materials.push(borderMat);

    // Foliage material
    const foliageMat = new PBRMaterial(`flowerbed_foliage_${id}`, scene);
    foliageMat.albedoColor = new Color3(
      0.15 * healthFactor,
      0.45 * healthFactor,
      0.12 * healthFactor
    );
    foliageMat.metallic = 0;
    foliageMat.roughness = 0.8;
    materials.push(foliageMat);

    // Get flower colors based on type
    const getFlowerColors = (): Color3[] => {
      switch (flowerType) {
        case 'roses':
          return [
            new Color3(0.9, 0.2, 0.25),
            new Color3(0.95, 0.4, 0.5),
            new Color3(0.85, 0.85, 0.8),
            new Color3(0.9, 0.6, 0.3),
          ];
        case 'tulips':
          return [
            new Color3(0.95, 0.3, 0.35),
            new Color3(0.95, 0.85, 0.2),
            new Color3(0.6, 0.2, 0.7),
            new Color3(0.95, 0.5, 0.3),
          ];
        case 'wildflowers':
          return [
            new Color3(0.95, 0.95, 0.3),
            new Color3(0.4, 0.4, 0.85),
            new Color3(0.9, 0.5, 0.7),
            new Color3(0.95, 0.6, 0.2),
            new Color3(0.85, 0.85, 0.9),
          ];
        case 'chrysanthemums':
          return [
            new Color3(0.95, 0.85, 0.2),
            new Color3(0.85, 0.3, 0.4),
            new Color3(0.95, 0.6, 0.3),
            new Color3(0.9, 0.9, 0.85),
          ];
        default:
          return [
            new Color3(0.9, 0.25, 0.3),
            new Color3(0.95, 0.85, 0.25),
            new Color3(0.5, 0.3, 0.8),
            new Color3(0.95, 0.55, 0.65),
            new Color3(0.95, 0.5, 0.2),
            new Color3(0.85, 0.85, 0.9),
          ];
      }
    };

    const flowerColors = getFlowerColors();

    // Create flower materials
    const flowerMats: PBRMaterial[] = flowerColors.map((color, i) => {
      const mat = new PBRMaterial(`flowerbed_flower_${id}_${i}`, scene);
      mat.albedoColor = color.scale(healthFactor);
      mat.metallic = 0;
      mat.roughness = 0.6;
      materials.push(mat);
      return mat;
    });

    if (type === 'circular') {
      const radius = Math.max(width, depth) / 2;

      // Border
      borderMat.albedoColor = new Color3(0.5, 0.45, 0.4);
      borderMat.metallic = 0;
      borderMat.roughness = 0.85;

      const border = MeshBuilder.CreateTorus(
        `${id}_border`,
        {
          diameter: radius * 2 + 0.08,
          thickness: 0.06,
          tessellation: 32,
        },
        scene
      );
      border.position = new Vector3(posX, posY + 0.03, posZ);
      border.rotation.x = Math.PI / 2;
      border.rotation.y = rotation;
      border.material = borderMat;
      meshes.push(border);

      // Soil
      const soil = MeshBuilder.CreateCylinder(
        `${id}_soil`,
        {
          height: 0.05,
          diameter: radius * 2,
          tessellation: 32,
        },
        scene
      );
      soil.position = new Vector3(posX, posY + 0.025, posZ);
      soil.material = soilMat;
      meshes.push(soil);

      // Plants in circular pattern
      const ringCount = Math.floor(radius / 0.15);
      for (let ring = 1; ring <= ringCount; ring++) {
        const ringRadius = (ring / ringCount) * radius * 0.85;
        const plantsInRing = Math.floor(ring * 6 * densityMultiplier);

        for (let p = 0; p < plantsInRing; p++) {
          const angle = (p / plantsInRing) * Math.PI * 2 + (rng ? rng.next() * 0.2 : 0);
          const plantX = posX + Math.cos(angle + rotation) * ringRadius;
          const plantZ = posZ + Math.sin(angle + rotation) * ringRadius;

          // Foliage
          const foliageSize = 0.04 + (rng ? rng.next() * 0.03 : 0.015);
          const foliage = MeshBuilder.CreateSphere(
            `${id}_foliage_${ring}_${p}`,
            { diameter: foliageSize * 2 },
            scene
          );
          foliage.position = new Vector3(plantX, posY + 0.06 + foliageSize, plantZ);
          foliage.scaling = new Vector3(1, 0.7, 1);
          foliage.material = foliageMat;
          meshes.push(foliage);

          // Flower (based on bloom level)
          if (rng ? rng.next() < bloomLevel : p % 2 === 0) {
            const flowerMat =
              flowerMats[Math.floor((rng ? rng.next() : p / plantsInRing) * flowerMats.length)];
            const flowerSize = 0.015 + (rng ? rng.next() * 0.015 : 0.007);

            const flower = MeshBuilder.CreateSphere(
              `${id}_flower_${ring}_${p}`,
              { diameter: flowerSize * 2 },
              scene
            );
            flower.position = new Vector3(
              plantX + (rng ? (rng.next() - 0.5) * 0.02 : 0),
              posY + 0.08 + foliageSize * 1.5 + (rng ? rng.next() * 0.02 : 0),
              plantZ + (rng ? (rng.next() - 0.5) * 0.02 : 0)
            );
            flower.material = flowerMat;
            meshes.push(flower);
          }
        }
      }
    } else if (type === 'rectangular') {
      // Border stones
      borderMat.albedoColor = new Color3(0.55, 0.5, 0.45);
      borderMat.metallic = 0;
      borderMat.roughness = 0.9;

      const borderThickness = 0.08;
      const borderHeight = 0.08;

      // Create border segments
      for (const [side, len, offX, offZ, rotY] of [
        ['front', width, 0, depth / 2, 0],
        ['back', width, 0, -depth / 2, 0],
        ['left', depth, -width / 2, 0, Math.PI / 2],
        ['right', depth, width / 2, 0, Math.PI / 2],
      ] as const) {
        const segment = MeshBuilder.CreateBox(
          `${id}_border_${side}`,
          {
            width: len + borderThickness,
            height: borderHeight,
            depth: borderThickness,
          },
          scene
        );
        segment.position = new Vector3(
          posX + offX * Math.cos(rotation) - offZ * Math.sin(rotation),
          posY + borderHeight / 2,
          posZ + offX * Math.sin(rotation) + offZ * Math.cos(rotation)
        );
        segment.rotation.y = rotation + rotY;
        segment.material = borderMat;
        meshes.push(segment);
      }

      // Soil
      const soil = MeshBuilder.CreateBox(
        `${id}_soil`,
        {
          width: width - borderThickness,
          height: 0.04,
          depth: depth - borderThickness,
        },
        scene
      );
      soil.position = new Vector3(posX, posY + 0.02, posZ);
      soil.rotation.y = rotation;
      soil.material = soilMat;
      meshes.push(soil);

      // Grid of plants
      const plantsX = Math.floor(((width - 0.1) / 0.12) * densityMultiplier);
      const plantsZ = Math.floor(((depth - 0.1) / 0.12) * densityMultiplier);

      for (let px = 0; px < plantsX; px++) {
        for (let pz = 0; pz < plantsZ; pz++) {
          const localX =
            (px / (plantsX - 1) - 0.5) * (width - 0.15) + (rng ? (rng.next() - 0.5) * 0.04 : 0);
          const localZ =
            (pz / (plantsZ - 1) - 0.5) * (depth - 0.15) + (rng ? (rng.next() - 0.5) * 0.04 : 0);

          const plantX = posX + localX * Math.cos(rotation) - localZ * Math.sin(rotation);
          const plantZ = posZ + localX * Math.sin(rotation) + localZ * Math.cos(rotation);

          // Foliage
          const foliageSize = 0.035 + (rng ? rng.next() * 0.025 : 0.012);
          const foliage = MeshBuilder.CreateSphere(
            `${id}_foliage_${px}_${pz}`,
            { diameter: foliageSize * 2 },
            scene
          );
          foliage.position = new Vector3(plantX, posY + 0.05 + foliageSize, plantZ);
          foliage.scaling = new Vector3(1, 0.65, 1);
          foliage.material = foliageMat;
          meshes.push(foliage);

          // Flower
          if (rng ? rng.next() < bloomLevel : (px + pz) % 2 === 0) {
            const flowerMat =
              flowerMats[
                Math.floor(
                  (rng ? rng.next() : (px * plantsZ + pz) / (plantsX * plantsZ)) * flowerMats.length
                )
              ];
            const flowerSize = 0.012 + (rng ? rng.next() * 0.012 : 0.006);

            const flower = MeshBuilder.CreateSphere(
              `${id}_flower_${px}_${pz}`,
              { diameter: flowerSize * 2 },
              scene
            );
            flower.position = new Vector3(
              plantX + (rng ? (rng.next() - 0.5) * 0.015 : 0),
              posY + 0.07 + foliageSize * 1.4 + (rng ? rng.next() * 0.015 : 0),
              plantZ + (rng ? (rng.next() - 0.5) * 0.015 : 0)
            );
            flower.material = flowerMat;
            meshes.push(flower);
          }
        }
      }
    } else if (type === 'raised') {
      const bedHeight = 0.3;

      // Wooden frame
      borderMat.albedoColor = new Color3(0.45, 0.32, 0.2);
      borderMat.metallic = 0;
      borderMat.roughness = 0.85;

      const plankThickness = 0.04;

      // Create frame walls
      for (const [side, len, offX, offZ, rotY] of [
        ['front', width, 0, depth / 2, 0],
        ['back', width, 0, -depth / 2, 0],
        ['left', depth - plankThickness * 2, -width / 2 + plankThickness / 2, 0, Math.PI / 2],
        ['right', depth - plankThickness * 2, width / 2 - plankThickness / 2, 0, Math.PI / 2],
      ] as const) {
        const wall = MeshBuilder.CreateBox(
          `${id}_wall_${side}`,
          {
            width: len,
            height: bedHeight,
            depth: plankThickness,
          },
          scene
        );
        wall.position = new Vector3(
          posX + offX * Math.cos(rotation) - offZ * Math.sin(rotation),
          posY + bedHeight / 2,
          posZ + offX * Math.sin(rotation) + offZ * Math.cos(rotation)
        );
        wall.rotation.y = rotation + rotY;
        wall.material = borderMat;
        meshes.push(wall);
      }

      // Corner posts
      for (const [cx, cz] of [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]) {
        const postX = cx * (width / 2 - plankThickness / 2);
        const postZ = cz * (depth / 2 - plankThickness / 2);

        const post = MeshBuilder.CreateBox(
          `${id}_post_${cx}_${cz}`,
          {
            width: plankThickness * 1.5,
            height: bedHeight + 0.05,
            depth: plankThickness * 1.5,
          },
          scene
        );
        post.position = new Vector3(
          posX + postX * Math.cos(rotation) - postZ * Math.sin(rotation),
          posY + (bedHeight + 0.05) / 2,
          posZ + postX * Math.sin(rotation) + postZ * Math.cos(rotation)
        );
        post.rotation.y = rotation;
        post.material = borderMat;
        meshes.push(post);
      }

      // Soil
      const soil = MeshBuilder.CreateBox(
        `${id}_soil`,
        {
          width: width - plankThickness * 2 - 0.02,
          height: 0.03,
          depth: depth - plankThickness * 2 - 0.02,
        },
        scene
      );
      soil.position = new Vector3(posX, posY + bedHeight - 0.03, posZ);
      soil.rotation.y = rotation;
      soil.material = soilMat;
      meshes.push(soil);

      // Taller plants for raised beds
      const plantsX = Math.floor(((width - 0.15) / 0.15) * densityMultiplier);
      const plantsZ = Math.floor(((depth - 0.15) / 0.15) * densityMultiplier);

      for (let px = 0; px < plantsX; px++) {
        for (let pz = 0; pz < plantsZ; pz++) {
          const localX =
            (px / Math.max(1, plantsX - 1) - 0.5) * (width - 0.2) +
            (rng ? (rng.next() - 0.5) * 0.05 : 0);
          const localZ =
            (pz / Math.max(1, plantsZ - 1) - 0.5) * (depth - 0.2) +
            (rng ? (rng.next() - 0.5) * 0.05 : 0);

          const plantX = posX + localX * Math.cos(rotation) - localZ * Math.sin(rotation);
          const plantZ = posZ + localX * Math.sin(rotation) + localZ * Math.cos(rotation);
          const plantBaseY = posY + bedHeight;

          // Stem
          const stemHeight = 0.08 + (rng ? rng.next() * 0.06 : 0.03);
          const stem = MeshBuilder.CreateCylinder(
            `${id}_stem_${px}_${pz}`,
            {
              height: stemHeight,
              diameter: 0.008,
            },
            scene
          );
          stem.position = new Vector3(plantX, plantBaseY + stemHeight / 2, plantZ);
          stem.rotation.z = rng ? (rng.next() - 0.5) * 0.15 : 0;
          stem.material = foliageMat;
          meshes.push(stem);

          // Leaves
          const leafCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
          for (let l = 0; l < leafCount; l++) {
            const leafAngle = (l / leafCount) * Math.PI * 2 + rotation;
            const leafSize = 0.025 + (rng ? rng.next() * 0.015 : 0.007);

            const leaf = MeshBuilder.CreateDisc(
              `${id}_leaf_${px}_${pz}_${l}`,
              { radius: leafSize, tessellation: 6 },
              scene
            );
            leaf.position = new Vector3(
              plantX + Math.cos(leafAngle) * 0.015,
              plantBaseY + stemHeight * (0.3 + l * 0.25),
              plantZ + Math.sin(leafAngle) * 0.015
            );
            leaf.rotation.x = Math.PI / 3;
            leaf.rotation.y = leafAngle;
            leaf.material = foliageMat;
            meshes.push(leaf);
          }

          // Flower
          if (rng ? rng.next() < bloomLevel : (px + pz) % 2 === 0) {
            const flowerMat =
              flowerMats[
                Math.floor(
                  (rng ? rng.next() : (px * plantsZ + pz) / (plantsX * plantsZ)) * flowerMats.length
                )
              ];
            const flowerSize = 0.015 + (rng ? rng.next() * 0.015 : 0.007);

            const flower = MeshBuilder.CreateSphere(
              `${id}_flower_${px}_${pz}`,
              { diameter: flowerSize * 2 },
              scene
            );
            flower.position = new Vector3(
              plantX + (rng ? (rng.next() - 0.5) * 0.01 : 0),
              plantBaseY + stemHeight + flowerSize,
              plantZ + (rng ? (rng.next() - 0.5) * 0.01 : 0)
            );
            flower.material = flowerMat;
            meshes.push(flower);
          }
        }
      }
    } else if (type === 'wild') {
      // No formal border - just scattered plants
      const area = width * depth;
      const plantCount = Math.floor(area * 40 * densityMultiplier);

      // Optional scattered stones
      const stoneMat = new PBRMaterial(`flowerbed_stone_${id}`, scene);
      stoneMat.albedoColor = new Color3(0.5, 0.48, 0.45);
      stoneMat.metallic = 0;
      stoneMat.roughness = 0.9;
      materials.push(stoneMat);

      const stoneCount = rng ? 3 + Math.floor(rng.next() * 5) : 4;
      for (let s = 0; s < stoneCount; s++) {
        const stoneX = (rng ? rng.next() - 0.5 : s / stoneCount - 0.5) * width * 0.9;
        const stoneZ = (rng ? rng.next() - 0.5 : (s % 2) - 0.5) * depth * 0.9;
        const stoneSize = 0.05 + (rng ? rng.next() * 0.08 : 0.04);

        const stone = MeshBuilder.CreateSphere(
          `${id}_stone_${s}`,
          { diameter: stoneSize * 2 },
          scene
        );
        stone.position = new Vector3(
          posX + stoneX * Math.cos(rotation) - stoneZ * Math.sin(rotation),
          posY + stoneSize * 0.4,
          posZ + stoneX * Math.sin(rotation) + stoneZ * Math.cos(rotation)
        );
        stone.scaling = new Vector3(
          1 + (rng ? (rng.next() - 0.5) * 0.4 : 0),
          0.5 + (rng ? rng.next() * 0.3 : 0.15),
          1 + (rng ? (rng.next() - 0.5) * 0.4 : 0)
        );
        stone.material = stoneMat;
        meshes.push(stone);
      }

      // Scattered wild plants
      for (let p = 0; p < plantCount; p++) {
        const localX = (rng ? rng.next() - 0.5 : Math.random() - 0.5) * width * 0.95;
        const localZ = (rng ? rng.next() - 0.5 : Math.random() - 0.5) * depth * 0.95;

        const plantX = posX + localX * Math.cos(rotation) - localZ * Math.sin(rotation);
        const plantZ = posZ + localX * Math.sin(rotation) + localZ * Math.cos(rotation);

        // Varied plant heights for wild look
        const plantHeight = 0.03 + (rng ? rng.next() * 0.08 : 0.04);
        const foliageSize = 0.02 + (rng ? rng.next() * 0.03 : 0.015);

        // Grass/foliage
        const foliage = MeshBuilder.CreateCylinder(
          `${id}_foliage_${p}`,
          {
            height: plantHeight,
            diameterTop: foliageSize * 0.3,
            diameterBottom: foliageSize,
          },
          scene
        );
        foliage.position = new Vector3(plantX, posY + plantHeight / 2, plantZ);
        foliage.rotation.z = rng ? (rng.next() - 0.5) * 0.3 : 0;
        foliage.rotation.y = rng ? rng.next() * Math.PI * 2 : 0;
        foliage.material = foliageMat;
        meshes.push(foliage);

        // Flowers (more sparse in wild beds)
        if (rng ? rng.next() < bloomLevel * 0.7 : p % 4 === 0) {
          const flowerMat =
            flowerMats[Math.floor((rng ? rng.next() : p / plantCount) * flowerMats.length)];
          const flowerSize = 0.008 + (rng ? rng.next() * 0.012 : 0.006);

          const flower = MeshBuilder.CreateSphere(
            `${id}_flower_${p}`,
            { diameter: flowerSize * 2 },
            scene
          );
          flower.position = new Vector3(
            plantX + (rng ? (rng.next() - 0.5) * 0.02 : 0),
            posY + plantHeight + flowerSize * 0.5,
            plantZ + (rng ? (rng.next() - 0.5) * 0.02 : 0)
          );
          flower.material = flowerMat;
          meshes.push(flower);
        }
      }

      // Add weeds for overgrown/neglected conditions
      if (condition === 'overgrown' || condition === 'neglected') {
        const weedMat = new PBRMaterial(`flowerbed_weed_${id}`, scene);
        weedMat.albedoColor = new Color3(0.25, 0.4, 0.15);
        weedMat.metallic = 0;
        weedMat.roughness = 0.85;
        materials.push(weedMat);

        const weedCount = Math.floor(plantCount * 0.2);
        for (let w = 0; w < weedCount; w++) {
          const weedX = (rng ? rng.next() - 0.5 : Math.random() - 0.5) * width;
          const weedZ = (rng ? rng.next() - 0.5 : Math.random() - 0.5) * depth;

          const weedWorldX = posX + weedX * Math.cos(rotation) - weedZ * Math.sin(rotation);
          const weedWorldZ = posZ + weedX * Math.sin(rotation) + weedZ * Math.cos(rotation);

          const weedHeight = 0.08 + (rng ? rng.next() * 0.1 : 0.05);

          const weed = MeshBuilder.CreateCylinder(
            `${id}_weed_${w}`,
            {
              height: weedHeight,
              diameterTop: 0.002,
              diameterBottom: 0.01,
            },
            scene
          );
          weed.position = new Vector3(weedWorldX, posY + weedHeight / 2, weedWorldZ);
          weed.rotation.z = rng ? (rng.next() - 0.5) * 0.5 : 0;
          weed.material = weedMat;
          meshes.push(weed);
        }
      }
    }

    // Add butterflies/bees for flourishing condition
    if (condition === 'flourishing' && rng) {
      const insectMat = new PBRMaterial(`flowerbed_insect_${id}`, scene);
      insectMat.albedoColor = new Color3(0.9, 0.8, 0.2);
      insectMat.metallic = 0;
      insectMat.roughness = 0.5;
      materials.push(insectMat);

      const insectCount = 2 + Math.floor(rng.next() * 3);
      for (let i = 0; i < insectCount; i++) {
        const insectX = (rng.next() - 0.5) * width * 0.7;
        const insectZ = (rng.next() - 0.5) * depth * 0.7;
        const insectY = 0.15 + rng.next() * 0.1;

        const insect = MeshBuilder.CreateSphere(`${id}_insect_${i}`, { diameter: 0.01 }, scene);
        insect.position = new Vector3(
          posX + insectX * Math.cos(rotation) - insectZ * Math.sin(rotation),
          posY + insectY,
          posZ + insectX * Math.sin(rotation) + insectZ * Math.cos(rotation)
        );
        insect.material = insectMat;
        meshes.push(insect);

        // Wings
        const wingMat = new PBRMaterial(`flowerbed_wing_${id}_${i}`, scene);
        wingMat.albedoColor = new Color3(0.9, 0.6, 0.3);
        wingMat.metallic = 0;
        wingMat.roughness = 0.4;
        wingMat.alpha = 0.7;
        materials.push(wingMat);

        for (const side of [-1, 1]) {
          const wing = MeshBuilder.CreateDisc(
            `${id}_wing_${i}_${side}`,
            { radius: 0.008, tessellation: 6 },
            scene
          );
          wing.position = new Vector3(
            insect.position.x + side * 0.008,
            insect.position.y + 0.003,
            insect.position.z
          );
          wing.rotation.x = Math.PI / 2;
          wing.rotation.z = side * 0.3;
          wing.material = wingMat;
          meshes.push(wing);
        }
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      for (const mat of materials) {
        mat.dispose();
      }
    };
  }, [
    scene,
    id,
    posX,
    posY,
    posZ,
    rotation,
    type,
    condition,
    width,
    depth,
    flowerType,
    bloomLevel,
    seed,
  ]);

  return null;
}
