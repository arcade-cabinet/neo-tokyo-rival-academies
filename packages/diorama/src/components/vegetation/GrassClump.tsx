/**
 * GrassClump - Grass tufts and ground cover
 *
 * Grass clumps for natural ground decoration.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type GrassType = 'wild' | 'lawn' | 'tall' | 'wheat' | 'reeds' | 'moss';

export interface GrassClumpProps {
  id: string;
  position: Vector3;
  /** Grass type */
  type?: GrassType;
  /** Clump radius */
  radius?: number;
  /** Blade height */
  height?: number;
  /** Density */
  density?: number;
  /** Health 0-1 */
  health?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function GrassClump({
  id,
  position,
  type = 'wild',
  radius = 0.3,
  height = 0.2,
  density = 1,
  health = 0.9,
  seed,
}: GrassClumpProps) {
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
    const grassMat = new PBRMaterial(`grass_blade_${id}`, scene);

    // Color based on type and health
    const greenBase = health * 0.5;
    const brownMix = 1 - health;

    switch (type) {
      case 'wild':
        grassMat.albedoColor = new Color3(0.2 + brownMix * 0.3, 0.35 + greenBase, 0.1);
        break;
      case 'lawn':
        grassMat.albedoColor = new Color3(0.15 + brownMix * 0.25, 0.45 + greenBase * 0.8, 0.12);
        break;
      case 'tall':
        grassMat.albedoColor = new Color3(0.25 + brownMix * 0.3, 0.4 + greenBase * 0.7, 0.15);
        break;
      case 'wheat':
        grassMat.albedoColor = new Color3(0.7 + brownMix * 0.1, 0.6 + health * 0.1, 0.25);
        break;
      case 'reeds':
        grassMat.albedoColor = new Color3(0.3 + brownMix * 0.2, 0.45 + greenBase * 0.5, 0.2);
        break;
      case 'moss':
        grassMat.albedoColor = new Color3(0.15 + brownMix * 0.15, 0.3 + greenBase * 0.6, 0.1);
        break;
    }
    grassMat.metallic = 0;
    grassMat.roughness = 0.9;

    if (type === 'moss') {
      // Moss is a ground cover, not blades
      const mossBase = MeshBuilder.CreateDisc(
        `${id}_moss`,
        { radius: radius, tessellation: 12 },
        scene
      );
      mossBase.position = new Vector3(posX, posY + 0.005, posZ);
      mossBase.rotation.x = Math.PI / 2;
      mossBase.material = grassMat;
      meshes.push(mossBase);

      // Add some bumpy texture
      const bumpCount = Math.floor(5 * density);
      for (let b = 0; b < bumpCount; b++) {
        const bumpAngle = (rng ? rng.next() : b / bumpCount) * Math.PI * 2;
        const bumpDist = (rng ? rng.next() : 0.5) * radius * 0.8;
        const bumpSize = 0.03 + (rng ? rng.next() * 0.03 : 0.02);

        const bump = MeshBuilder.CreateSphere(
          `${id}_mossbump_${b}`,
          { diameter: bumpSize, segments: 6 },
          scene
        );
        bump.position = new Vector3(
          posX + Math.cos(bumpAngle) * bumpDist,
          posY + bumpSize * 0.3,
          posZ + Math.sin(bumpAngle) * bumpDist
        );
        bump.scaling = new Vector3(1, 0.4, 1);
        bump.material = grassMat;
        meshes.push(bump);
      }
    } else {
      // Grass blades
      const bladeCount = Math.floor(
        (type === 'lawn' ? 15 : type === 'tall' || type === 'reeds' ? 8 : 12) * density
      );
      const bladeHeight =
        type === 'tall'
          ? height * 2
          : type === 'reeds'
            ? height * 3
            : type === 'lawn'
              ? height * 0.5
              : height;

      for (let b = 0; b < bladeCount; b++) {
        const bladeAngle = (rng ? rng.next() : b / bladeCount) * Math.PI * 2;
        const bladeDist = (rng ? rng.next() : 0.5) * radius;
        const bladeH = bladeHeight * (0.7 + (rng ? rng.next() * 0.6 : 0.3));
        const bladeWidth = type === 'reeds' ? 0.02 : type === 'wheat' ? 0.015 : 0.008;

        // Blade as a thin box rotated to look like grass
        const blade = MeshBuilder.CreateBox(
          `${id}_blade_${b}`,
          { width: bladeWidth, height: bladeH, depth: 0.002 },
          scene
        );
        blade.position = new Vector3(
          posX + Math.cos(bladeAngle) * bladeDist,
          posY + bladeH / 2,
          posZ + Math.sin(bladeAngle) * bladeDist
        );

        // Random rotation and tilt
        blade.rotation.y = bladeAngle + (rng ? (rng.next() - 0.5) * 0.5 : 0);
        blade.rotation.x = rng ? (rng.next() - 0.5) * 0.3 : 0;
        blade.rotation.z = rng ? (rng.next() - 0.5) * 0.2 : 0;

        blade.material = grassMat;
        meshes.push(blade);
      }

      // Wheat heads
      if (type === 'wheat') {
        const wheatMat = new PBRMaterial(`grass_wheat_${id}`, scene);
        wheatMat.albedoColor = new Color3(0.75, 0.65, 0.35);
        wheatMat.metallic = 0;
        wheatMat.roughness = 0.85;

        const headCount = Math.floor(bladeCount * 0.6);
        for (let h = 0; h < headCount; h++) {
          const headAngle = (rng ? rng.next() : h / headCount) * Math.PI * 2;
          const headDist = (rng ? rng.next() : 0.5) * radius;
          const headH = bladeHeight * (0.8 + (rng ? rng.next() * 0.4 : 0.2));

          const wheatHead = MeshBuilder.CreateCylinder(
            `${id}_wheathead_${h}`,
            { height: 0.08, diameterTop: 0.015, diameterBottom: 0.02 },
            scene
          );
          wheatHead.position = new Vector3(
            posX + Math.cos(headAngle) * headDist,
            posY + headH + 0.04,
            posZ + Math.sin(headAngle) * headDist
          );
          wheatHead.rotation.x = rng ? (rng.next() - 0.5) * 0.3 : 0;
          wheatHead.material = wheatMat;
          meshes.push(wheatHead);
        }
      }

      // Reed tops
      if (type === 'reeds') {
        const reedTopMat = new PBRMaterial(`grass_reedtop_${id}`, scene);
        reedTopMat.albedoColor = new Color3(0.5, 0.4, 0.3);
        reedTopMat.metallic = 0;
        reedTopMat.roughness = 0.9;

        const topCount = Math.floor(bladeCount * 0.4);
        for (let t = 0; t < topCount; t++) {
          const topAngle = (rng ? rng.next() : t / topCount) * Math.PI * 2;
          const topDist = (rng ? rng.next() : 0.5) * radius;
          const topH = bladeHeight * 3 * (0.8 + (rng ? rng.next() * 0.4 : 0.2));

          const reedTop = MeshBuilder.CreateCylinder(
            `${id}_reedtop_${t}`,
            { height: 0.12, diameterTop: 0.01, diameterBottom: 0.025 },
            scene
          );
          reedTop.position = new Vector3(
            posX + Math.cos(topAngle) * topDist,
            posY + topH + 0.06,
            posZ + Math.sin(topAngle) * topDist
          );
          reedTop.material = reedTopMat;
          meshes.push(reedTop);
        }
      }
    }

    // Dead grass patches
    if (health < 0.5) {
      const deadMat = new PBRMaterial(`grass_dead_${id}`, scene);
      deadMat.albedoColor = new Color3(0.45, 0.35, 0.2);
      deadMat.metallic = 0;
      deadMat.roughness = 0.95;

      const deadCount = Math.floor(3 * (1 - health));
      for (let d = 0; d < deadCount; d++) {
        const deadAngle = (rng ? rng.next() : d / deadCount) * Math.PI * 2;
        const deadDist = (rng ? rng.next() : 0.5) * radius;

        const deadPatch = MeshBuilder.CreateDisc(
          `${id}_dead_${d}`,
          { radius: 0.05 + (rng ? rng.next() * 0.05 : 0.02), tessellation: 6 },
          scene
        );
        deadPatch.position = new Vector3(
          posX + Math.cos(deadAngle) * deadDist,
          posY + 0.002,
          posZ + Math.sin(deadAngle) * deadDist
        );
        deadPatch.rotation.x = Math.PI / 2;
        deadPatch.material = deadMat;
        meshes.push(deadPatch);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      grassMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, radius, height, density, health, seed]);

  return null;
}
