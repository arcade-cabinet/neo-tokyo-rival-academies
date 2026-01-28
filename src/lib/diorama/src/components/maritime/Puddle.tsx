/**
 * Puddle - Water puddles on ground component
 *
 * Various puddle types for flooded urban environments.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type PuddleType = 'rain' | 'oil' | 'mud' | 'reflection';
export type PuddleCondition = 'fresh' | 'stagnant' | 'evaporating' | 'frozen';

export interface PuddleProps {
  id: string;
  position: Vector3;
  /** Y-axis rotation in radians */
  rotation?: number;
  /** Puddle type */
  type?: PuddleType;
  /** Condition of the puddle */
  condition?: PuddleCondition;
  /** Radius of the puddle */
  radius?: number;
  /** Depth of the puddle */
  depth?: number;
  /** Whether the puddle has ripples */
  hasRipples?: boolean;
  /** Seed for procedural variation */
  seed?: number;
}

export function Puddle({
  id,
  position,
  rotation = 0,
  type = 'rain',
  condition = 'fresh',
  radius = 0.5,
  depth = 0.02,
  hasRipples = false,
  seed,
}: PuddleProps) {
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

    // Main puddle material
    const puddleMat = new PBRMaterial(`puddle_main_${id}`, scene);
    materials.push(puddleMat);

    // Configure material based on type
    if (type === 'rain') {
      puddleMat.albedoColor = new Color3(0.3, 0.35, 0.4);
      puddleMat.metallic = 0.1;
      puddleMat.roughness = condition === 'frozen' ? 0.2 : 0.05;
      puddleMat.alpha = 0.85;
    } else if (type === 'oil') {
      puddleMat.albedoColor = new Color3(0.1, 0.08, 0.12);
      puddleMat.metallic = 0.6;
      puddleMat.roughness = 0.1;
      puddleMat.alpha = 0.9;
    } else if (type === 'mud') {
      puddleMat.albedoColor = new Color3(0.35, 0.28, 0.18);
      puddleMat.metallic = 0;
      puddleMat.roughness = 0.7;
      puddleMat.alpha = 0.95;
    } else if (type === 'reflection') {
      puddleMat.albedoColor = new Color3(0.25, 0.3, 0.35);
      puddleMat.metallic = 0.3;
      puddleMat.roughness = 0.02;
      puddleMat.alpha = 0.8;
    }

    // Adjust for condition
    if (condition === 'stagnant') {
      puddleMat.roughness = Math.min(puddleMat.roughness + 0.2, 1);
      if (type === 'rain' || type === 'reflection') {
        puddleMat.albedoColor = puddleMat.albedoColor.add(new Color3(0.05, 0.08, 0.02));
      }
    } else if (condition === 'evaporating') {
      puddleMat.alpha = Math.max(puddleMat.alpha - 0.3, 0.4);
    } else if (condition === 'frozen') {
      puddleMat.albedoColor = new Color3(0.7, 0.75, 0.85);
      puddleMat.metallic = 0.1;
      puddleMat.roughness = 0.15;
      puddleMat.alpha = 0.9;
    }

    // Create organic puddle shape using merged discs
    const mainShape = MeshBuilder.CreateDisc(
      `${id}_main`,
      {
        radius: radius,
        tessellation: 32,
      },
      scene
    );
    mainShape.position = new Vector3(posX, posY + depth / 2, posZ);
    mainShape.rotation.x = Math.PI / 2;
    mainShape.rotation.y = rotation;
    mainShape.material = puddleMat;
    meshes.push(mainShape);

    // Add irregular extensions to make it look more natural
    const extensionCount = rng ? 3 + Math.floor(rng.next() * 4) : 4;

    for (let e = 0; e < extensionCount; e++) {
      const extAngle = rng ? rng.next() * Math.PI * 2 : (e / extensionCount) * Math.PI * 2;
      const extRadius = radius * (0.3 + (rng ? rng.next() * 0.4 : 0.2));
      const extDistance = radius * (0.5 + (rng ? rng.next() * 0.4 : 0.2));

      const extension = MeshBuilder.CreateDisc(
        `${id}_ext_${e}`,
        {
          radius: extRadius,
          tessellation: 16,
        },
        scene
      );
      extension.position = new Vector3(
        posX + Math.cos(extAngle) * extDistance,
        posY + depth / 2,
        posZ + Math.sin(extAngle) * extDistance
      );
      extension.rotation.x = Math.PI / 2;
      extension.material = puddleMat;
      meshes.push(extension);
    }

    // Add depth indication at edges (darker rim)
    const rimMat = new PBRMaterial(`puddle_rim_${id}`, scene);
    rimMat.albedoColor = puddleMat.albedoColor.scale(0.7);
    rimMat.metallic = 0;
    rimMat.roughness = 0.8;
    materials.push(rimMat);

    const rimSegments = rng ? 8 + Math.floor(rng.next() * 8) : 12;

    for (let r = 0; r < rimSegments; r++) {
      const rimAngle = (r / rimSegments) * Math.PI * 2 + (rng ? rng.next() * 0.2 : 0);
      const rimDist = radius * (0.85 + (rng ? rng.next() * 0.2 : 0.1));
      const rimSize = radius * (0.08 + (rng ? rng.next() * 0.06 : 0.03));

      const rimPiece = MeshBuilder.CreateDisc(
        `${id}_rim_${r}`,
        { radius: rimSize, tessellation: 8 },
        scene
      );
      rimPiece.position = new Vector3(
        posX + Math.cos(rimAngle) * rimDist,
        posY + depth / 4,
        posZ + Math.sin(rimAngle) * rimDist
      );
      rimPiece.rotation.x = Math.PI / 2;
      rimPiece.material = rimMat;
      meshes.push(rimPiece);
    }

    // Add ripples if enabled and not frozen
    if (hasRipples && condition !== 'frozen') {
      const rippleMat = new PBRMaterial(`puddle_ripple_${id}`, scene);
      rippleMat.albedoColor = new Color3(0.8, 0.85, 0.9);
      rippleMat.metallic = 0.2;
      rippleMat.roughness = 0.1;
      rippleMat.alpha = 0.3;
      materials.push(rippleMat);

      const rippleCount = rng ? 1 + Math.floor(rng.next() * 3) : 2;

      for (let rp = 0; rp < rippleCount; rp++) {
        const rippleX = rng ? (rng.next() - 0.5) * radius : 0;
        const rippleZ = rng ? (rng.next() - 0.5) * radius : 0;
        const rippleRadius = radius * (0.2 + (rng ? rng.next() * 0.3 : 0.15));

        // Create concentric ripple rings
        const ringCount = 3;
        for (let ring = 0; ring < ringCount; ring++) {
          const ringRadius = rippleRadius * (0.3 + ring * 0.35);
          const ringThickness = 0.008 + (rng ? rng.next() * 0.005 : 0);

          const rippleRing = MeshBuilder.CreateTorus(
            `${id}_ripple_${rp}_${ring}`,
            {
              diameter: ringRadius * 2,
              thickness: ringThickness,
              tessellation: 24,
            },
            scene
          );
          rippleRing.position = new Vector3(posX + rippleX, posY + depth + 0.001, posZ + rippleZ);
          rippleRing.rotation.x = Math.PI / 2;
          rippleRing.material = rippleMat;
          meshes.push(rippleRing);
        }
      }
    }

    // Oil puddles have iridescent patches
    if (type === 'oil') {
      const iridescentMat = new PBRMaterial(`puddle_iridescent_${id}`, scene);
      iridescentMat.metallic = 0.8;
      iridescentMat.roughness = 0.05;
      iridescentMat.alpha = 0.5;
      materials.push(iridescentMat);

      const patchCount = rng ? 2 + Math.floor(rng.next() * 4) : 3;

      for (let p = 0; p < patchCount; p++) {
        // Cycle through rainbow colors
        const hue = rng ? rng.next() : p / patchCount;
        iridescentMat.albedoColor = new Color3(
          0.5 + 0.5 * Math.sin(hue * Math.PI * 2),
          0.5 + 0.5 * Math.sin(hue * Math.PI * 2 + (Math.PI * 2) / 3),
          0.5 + 0.5 * Math.sin(hue * Math.PI * 2 + (Math.PI * 4) / 3)
        );

        const patchMat = iridescentMat.clone(`puddle_iridescent_${id}_${p}`);
        materials.push(patchMat);

        const patchRadius = radius * (0.15 + (rng ? rng.next() * 0.2 : 0.1));
        const patchAngle = rng ? rng.next() * Math.PI * 2 : (p / patchCount) * Math.PI * 2;
        const patchDist = rng ? rng.next() * radius * 0.5 : radius * 0.3;

        const patch = MeshBuilder.CreateDisc(
          `${id}_iridescent_${p}`,
          { radius: patchRadius, tessellation: 12 },
          scene
        );
        patch.position = new Vector3(
          posX + Math.cos(patchAngle) * patchDist,
          posY + depth + 0.002,
          posZ + Math.sin(patchAngle) * patchDist
        );
        patch.rotation.x = Math.PI / 2;
        patch.material = patchMat;
        meshes.push(patch);
      }
    }

    // Mud puddles have debris
    if (type === 'mud' && condition !== 'frozen') {
      const debrisMat = new PBRMaterial(`puddle_debris_${id}`, scene);
      debrisMat.albedoColor = new Color3(0.25, 0.2, 0.15);
      debrisMat.metallic = 0;
      debrisMat.roughness = 0.9;
      materials.push(debrisMat);

      const debrisCount = rng ? 2 + Math.floor(rng.next() * 5) : 3;

      for (let d = 0; d < debrisCount; d++) {
        const debrisAngle = rng ? rng.next() * Math.PI * 2 : (d / debrisCount) * Math.PI * 2;
        const debrisDist = rng ? rng.next() * radius * 0.7 : radius * 0.4;
        const debrisSize = 0.02 + (rng ? rng.next() * 0.03 : 0.015);

        const debris = MeshBuilder.CreateBox(
          `${id}_debris_${d}`,
          {
            width: debrisSize * (0.5 + (rng ? rng.next() : 0.5)),
            height: debrisSize * 0.3,
            depth: debrisSize * (0.5 + (rng ? rng.next() : 0.5)),
          },
          scene
        );
        debris.position = new Vector3(
          posX + Math.cos(debrisAngle) * debrisDist,
          posY + depth + debrisSize * 0.1,
          posZ + Math.sin(debrisAngle) * debrisDist
        );
        debris.rotation.y = rng ? rng.next() * Math.PI * 2 : 0;
        debris.material = debrisMat;
        meshes.push(debris);
      }
    }

    // Frozen puddles have ice cracks
    if (condition === 'frozen') {
      const crackMat = new PBRMaterial(`puddle_crack_${id}`, scene);
      crackMat.albedoColor = new Color3(0.9, 0.95, 1);
      crackMat.metallic = 0;
      crackMat.roughness = 0.3;
      crackMat.alpha = 0.6;
      materials.push(crackMat);

      const crackCount = rng ? 3 + Math.floor(rng.next() * 5) : 4;

      for (let c = 0; c < crackCount; c++) {
        const crackLength = radius * (0.3 + (rng ? rng.next() * 0.5 : 0.25));
        const crackAngle = rng ? rng.next() * Math.PI * 2 : (c / crackCount) * Math.PI * 2;
        const crackStartDist = rng ? rng.next() * radius * 0.3 : 0;

        const crack = MeshBuilder.CreateBox(
          `${id}_crack_${c}`,
          {
            width: crackLength,
            height: 0.003,
            depth: 0.005 + (rng ? rng.next() * 0.005 : 0),
          },
          scene
        );
        crack.position = new Vector3(
          posX + Math.cos(crackAngle) * (crackStartDist + crackLength / 2),
          posY + depth + 0.002,
          posZ + Math.sin(crackAngle) * (crackStartDist + crackLength / 2)
        );
        crack.rotation.y = crackAngle;
        crack.material = crackMat;
        meshes.push(crack);
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
  }, [scene, id, posX, posY, posZ, rotation, type, condition, radius, depth, hasRipples, seed]);

  return null;
}
