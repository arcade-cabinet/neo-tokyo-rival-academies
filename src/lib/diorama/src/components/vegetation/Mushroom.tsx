/**
 * Mushroom - Mushrooms and fungi component
 *
 * Various mushroom types for overgrown urban environments.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type MushroomType = 'common' | 'cluster' | 'shelf' | 'glowing';
export type MushroomCondition = 'fresh' | 'mature' | 'decaying' | 'dried';

export interface MushroomProps {
  id: string;
  position: Vector3;
  /** Y-axis rotation in radians */
  rotation?: number;
  /** Mushroom type */
  type?: MushroomType;
  /** Condition of the mushroom */
  condition?: MushroomCondition;
  /** Size multiplier */
  size?: number;
  /** Number of mushrooms (for cluster type) */
  count?: number;
  /** Whether the mushroom is edible (affects color) */
  isEdible?: boolean;
  /** Seed for procedural variation */
  seed?: number;
}

export function Mushroom({
  id,
  position,
  rotation = 0,
  type = 'common',
  condition = 'mature',
  size = 1,
  count = 5,
  isEdible = true,
  seed,
}: MushroomProps) {
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

    // Condition affects appearance
    const freshness =
      condition === 'fresh'
        ? 1.0
        : condition === 'mature'
          ? 0.85
          : condition === 'decaying'
            ? 0.6
            : 0.4; // dried

    // Cap material
    const capMat = new PBRMaterial(`mushroom_cap_${id}`, scene);
    materials.push(capMat);

    // Stem material
    const stemMat = new PBRMaterial(`mushroom_stem_${id}`, scene);
    materials.push(stemMat);

    // Configure colors based on type and edibility
    if (type === 'common') {
      if (isEdible) {
        capMat.albedoColor = new Color3(0.6 * freshness, 0.45 * freshness, 0.3 * freshness);
      } else {
        // Toxic mushrooms have more vibrant colors
        capMat.albedoColor = new Color3(0.8 * freshness, 0.2 * freshness, 0.15 * freshness);
      }
      capMat.metallic = 0;
      capMat.roughness = 0.7;

      stemMat.albedoColor = new Color3(0.85 * freshness, 0.8 * freshness, 0.75 * freshness);
      stemMat.metallic = 0;
      stemMat.roughness = 0.8;
    } else if (type === 'cluster') {
      if (isEdible) {
        capMat.albedoColor = new Color3(0.55 * freshness, 0.5 * freshness, 0.4 * freshness);
      } else {
        capMat.albedoColor = new Color3(0.7 * freshness, 0.55 * freshness, 0.2 * freshness);
      }
      capMat.metallic = 0;
      capMat.roughness = 0.75;

      stemMat.albedoColor = new Color3(0.8 * freshness, 0.78 * freshness, 0.7 * freshness);
      stemMat.metallic = 0;
      stemMat.roughness = 0.85;
    } else if (type === 'shelf') {
      capMat.albedoColor = isEdible
        ? new Color3(0.5 * freshness, 0.4 * freshness, 0.3 * freshness)
        : new Color3(0.6 * freshness, 0.3 * freshness, 0.25 * freshness);
      capMat.metallic = 0;
      capMat.roughness = 0.8;

      stemMat.albedoColor = new Color3(0.45 * freshness, 0.4 * freshness, 0.35 * freshness);
      stemMat.metallic = 0;
      stemMat.roughness = 0.9;
    } else if (type === 'glowing') {
      capMat.albedoColor = new Color3(0.2 * freshness, 0.6 * freshness, 0.5 * freshness);
      capMat.emissiveColor = new Color3(0.1, 0.4, 0.35);
      capMat.metallic = 0.1;
      capMat.roughness = 0.5;

      stemMat.albedoColor = new Color3(0.7 * freshness, 0.75 * freshness, 0.7 * freshness);
      stemMat.emissiveColor = new Color3(0.05, 0.15, 0.12);
      stemMat.metallic = 0;
      stemMat.roughness = 0.7;
    }

    // Adjust for condition
    if (condition === 'decaying') {
      capMat.albedoColor = capMat.albedoColor.add(new Color3(0.05, 0.08, 0.02));
    } else if (condition === 'dried') {
      capMat.roughness = Math.min(capMat.roughness + 0.2, 1);
      stemMat.roughness = Math.min(stemMat.roughness + 0.15, 1);
    }

    if (type === 'common') {
      // Single mushroom with classic cap and stem
      const capRadius = 0.06 * size;
      const stemHeight = 0.1 * size;
      const stemRadius = 0.015 * size;

      // Stem
      const stem = MeshBuilder.CreateCylinder(
        `${id}_stem`,
        {
          height: stemHeight,
          diameterTop: stemRadius * 1.8,
          diameterBottom: stemRadius * 2.2,
        },
        scene
      );
      stem.position = new Vector3(posX, posY + stemHeight / 2, posZ);
      stem.rotation.y = rotation;
      stem.material = stemMat;
      meshes.push(stem);

      // Cap
      const cap = MeshBuilder.CreateSphere(
        `${id}_cap`,
        {
          diameter: capRadius * 2,
          slice: 0.5,
        },
        scene
      );
      cap.position = new Vector3(posX, posY + stemHeight, posZ);
      cap.rotation.x = Math.PI;
      cap.rotation.y = rotation;
      cap.material = capMat;
      meshes.push(cap);

      // Gills under cap
      const gillMat = new PBRMaterial(`mushroom_gill_${id}`, scene);
      gillMat.albedoColor = stemMat.albedoColor.scale(0.9);
      gillMat.metallic = 0;
      gillMat.roughness = 0.85;
      materials.push(gillMat);

      const gills = MeshBuilder.CreateCylinder(
        `${id}_gills`,
        {
          height: 0.01,
          diameter: capRadius * 1.8,
        },
        scene
      );
      gills.position = new Vector3(posX, posY + stemHeight - 0.005, posZ);
      gills.material = gillMat;
      meshes.push(gills);

      // Spots for non-edible mushrooms
      if (!isEdible && rng) {
        const spotMat = new PBRMaterial(`mushroom_spot_${id}`, scene);
        spotMat.albedoColor = new Color3(0.95, 0.95, 0.9);
        spotMat.metallic = 0;
        spotMat.roughness = 0.6;
        materials.push(spotMat);

        const spotCount = 4 + Math.floor(rng.next() * 5);
        for (let s = 0; s < spotCount; s++) {
          const spotAngle = rng.next() * Math.PI * 2;
          const spotDist = rng.next() * capRadius * 0.7;
          const spotSize = 0.005 + rng.next() * 0.008;

          const spot = MeshBuilder.CreateDisc(
            `${id}_spot_${s}`,
            { radius: spotSize, tessellation: 8 },
            scene
          );

          // Position on cap surface
          const spotX = Math.cos(spotAngle) * spotDist;
          const spotZ = Math.sin(spotAngle) * spotDist;
          const spotY = Math.sqrt(Math.max(0, capRadius * capRadius - spotDist * spotDist));

          spot.position = new Vector3(posX + spotX, posY + stemHeight + spotY * 0.95, posZ + spotZ);
          spot.rotation.x = -Math.atan2(spotY, spotDist);
          spot.rotation.y = spotAngle;
          spot.material = spotMat;
          meshes.push(spot);
        }
      }
    } else if (type === 'cluster') {
      // Multiple mushrooms growing together
      const mushroomCount = count;

      for (let m = 0; m < mushroomCount; m++) {
        const offsetAngle = rng ? rng.next() * Math.PI * 2 : (m / mushroomCount) * Math.PI * 2;
        const offsetDist = rng ? rng.next() * 0.06 * size : 0.03 * size;
        const mushroomSize = (0.6 + (rng ? rng.next() * 0.8 : 0.4)) * size;

        const mX = posX + Math.cos(offsetAngle) * offsetDist;
        const mZ = posZ + Math.sin(offsetAngle) * offsetDist;

        const capRadius = 0.025 * mushroomSize;
        const stemHeight = 0.06 * mushroomSize;
        const stemRadius = 0.008 * mushroomSize;

        // Stem
        const stem = MeshBuilder.CreateCylinder(
          `${id}_stem_${m}`,
          {
            height: stemHeight,
            diameterTop: stemRadius * 1.5,
            diameterBottom: stemRadius * 2,
          },
          scene
        );
        stem.position = new Vector3(mX, posY + stemHeight / 2, mZ);
        stem.rotation.z = rng ? (rng.next() - 0.5) * 0.2 : 0;
        stem.rotation.y = rotation + (rng ? rng.next() * 0.5 : 0);
        stem.material = stemMat;
        meshes.push(stem);

        // Cap
        const cap = MeshBuilder.CreateSphere(
          `${id}_cap_${m}`,
          {
            diameter: capRadius * 2,
            slice: 0.5,
          },
          scene
        );
        cap.position = new Vector3(mX, posY + stemHeight, mZ);
        cap.rotation.x = Math.PI;
        cap.material = capMat;
        meshes.push(cap);
      }

      // Base substrate (rotting wood/debris)
      const substrateMat = new PBRMaterial(`mushroom_substrate_${id}`, scene);
      substrateMat.albedoColor = new Color3(0.25, 0.2, 0.15);
      substrateMat.metallic = 0;
      substrateMat.roughness = 0.95;
      materials.push(substrateMat);

      const substrate = MeshBuilder.CreateCylinder(
        `${id}_substrate`,
        {
          height: 0.02,
          diameter: 0.15 * size,
        },
        scene
      );
      substrate.position = new Vector3(posX, posY + 0.01, posZ);
      substrate.material = substrateMat;
      meshes.push(substrate);
    } else if (type === 'shelf') {
      // Bracket/shelf fungi growing on vertical surface
      const shelfCount = Math.min(count, 5);

      for (let s = 0; s < shelfCount; s++) {
        const shelfSize = (0.5 + (rng ? rng.next() * 0.8 : 0.4)) * size;
        const shelfY = posY + s * 0.05 * size + (rng ? (rng.next() - 0.5) * 0.02 : 0);
        const shelfOffset = rng ? (rng.next() - 0.5) * 0.03 : 0;

        const shelfWidth = 0.08 * shelfSize;
        const shelfDepth = 0.06 * shelfSize;
        const shelfThickness = 0.015 * shelfSize;

        // Create shelf shape (half disc)
        const shelf = MeshBuilder.CreateCylinder(
          `${id}_shelf_${s}`,
          {
            height: shelfThickness,
            diameter: shelfWidth * 2,
            tessellation: 16,
            arc: 0.5,
          },
          scene
        );
        shelf.position = new Vector3(posX + shelfOffset, shelfY, posZ + shelfDepth / 2);
        shelf.rotation.x = Math.PI / 2;
        shelf.rotation.y = rotation;
        shelf.rotation.z = rng ? (rng.next() - 0.5) * 0.1 : 0;
        shelf.material = capMat;
        meshes.push(shelf);

        // Growth rings/texture
        if (rng && rng.next() > 0.5) {
          const ringMat = capMat.clone(`mushroom_ring_${id}_${s}`);
          ringMat.albedoColor = capMat.albedoColor.scale(0.85);
          materials.push(ringMat);

          const ring = MeshBuilder.CreateTorus(
            `${id}_ring_${s}`,
            {
              diameter: shelfWidth * 1.2,
              thickness: 0.003,
              arc: 0.5,
              tessellation: 16,
            },
            scene
          );
          ring.position = new Vector3(
            posX + shelfOffset,
            shelfY + shelfThickness / 2 + 0.001,
            posZ + shelfDepth * 0.4
          );
          ring.rotation.x = Math.PI / 2;
          ring.rotation.y = rotation;
          ring.material = ringMat;
          meshes.push(ring);
        }
      }
    } else if (type === 'glowing') {
      // Bioluminescent mushrooms
      const mushroomCount = Math.max(3, count);

      for (let m = 0; m < mushroomCount; m++) {
        const offsetAngle = rng ? rng.next() * Math.PI * 2 : (m / mushroomCount) * Math.PI * 2;
        const offsetDist = rng ? rng.next() * 0.08 * size : 0.04 * size;
        const mushroomSize = (0.5 + (rng ? rng.next() * 1.0 : 0.5)) * size;

        const mX = posX + Math.cos(offsetAngle) * offsetDist;
        const mZ = posZ + Math.sin(offsetAngle) * offsetDist;

        const capRadius = 0.03 * mushroomSize;
        const stemHeight = 0.07 * mushroomSize;
        const stemRadius = 0.008 * mushroomSize;

        // Stem with slight glow
        const stem = MeshBuilder.CreateCylinder(
          `${id}_stem_${m}`,
          {
            height: stemHeight,
            diameterTop: stemRadius * 1.5,
            diameterBottom: stemRadius * 2,
          },
          scene
        );
        stem.position = new Vector3(mX, posY + stemHeight / 2, mZ);
        stem.rotation.z = rng ? (rng.next() - 0.5) * 0.3 : 0;
        stem.material = stemMat;
        meshes.push(stem);

        // Glowing cap
        const cap = MeshBuilder.CreateSphere(
          `${id}_cap_${m}`,
          {
            diameter: capRadius * 2,
            slice: 0.6,
          },
          scene
        );
        cap.position = new Vector3(mX, posY + stemHeight, mZ);
        cap.rotation.x = Math.PI;
        cap.material = capMat;
        meshes.push(cap);

        // Bright spots on cap for extra glow effect
        if (rng && rng.next() > 0.4) {
          const glowSpotMat = new PBRMaterial(`mushroom_glowspot_${id}_${m}`, scene);
          glowSpotMat.albedoColor = new Color3(0.3, 0.9, 0.8);
          glowSpotMat.emissiveColor = new Color3(0.2, 0.6, 0.5);
          glowSpotMat.metallic = 0;
          glowSpotMat.roughness = 0.4;
          materials.push(glowSpotMat);

          const spotCount = 2 + Math.floor(rng.next() * 3);
          for (let sp = 0; sp < spotCount; sp++) {
            const spotAngle = rng.next() * Math.PI * 2;
            const spotDist = rng.next() * capRadius * 0.6;
            const spotSize = 0.003 + rng.next() * 0.004;

            const spot = MeshBuilder.CreateSphere(
              `${id}_glowspot_${m}_${sp}`,
              { diameter: spotSize * 2 },
              scene
            );

            const spotLocalX = Math.cos(spotAngle) * spotDist;
            const spotLocalZ = Math.sin(spotAngle) * spotDist;
            const spotLocalY = Math.sqrt(Math.max(0, capRadius * capRadius - spotDist * spotDist));

            spot.position = new Vector3(
              mX + spotLocalX,
              posY + stemHeight + spotLocalY * 0.9,
              mZ + spotLocalZ
            );
            spot.material = glowSpotMat;
            meshes.push(spot);
          }
        }
      }

      // Glowing spores/particles on ground
      if (rng) {
        const sporeMat = new PBRMaterial(`mushroom_spore_${id}`, scene);
        sporeMat.albedoColor = new Color3(0.2, 0.5, 0.45);
        sporeMat.emissiveColor = new Color3(0.1, 0.3, 0.25);
        sporeMat.metallic = 0;
        sporeMat.roughness = 0.6;
        materials.push(sporeMat);

        const sporeCount = 5 + Math.floor(rng.next() * 8);
        for (let sp = 0; sp < sporeCount; sp++) {
          const sporeAngle = rng.next() * Math.PI * 2;
          const sporeDist = 0.02 + rng.next() * 0.1 * size;
          const sporeSize = 0.002 + rng.next() * 0.003;

          const spore = MeshBuilder.CreateSphere(
            `${id}_spore_${sp}`,
            { diameter: sporeSize * 2 },
            scene
          );
          spore.position = new Vector3(
            posX + Math.cos(sporeAngle) * sporeDist,
            posY + rng.next() * 0.01,
            posZ + Math.sin(sporeAngle) * sporeDist
          );
          spore.material = sporeMat;
          meshes.push(spore);
        }
      }
    }

    // Add decay details for decaying condition
    if (condition === 'decaying' && rng && type !== 'glowing') {
      const decayMat = new PBRMaterial(`mushroom_decay_${id}`, scene);
      decayMat.albedoColor = new Color3(0.3, 0.35, 0.25);
      decayMat.metallic = 0;
      decayMat.roughness = 0.9;
      materials.push(decayMat);

      const moldCount = 2 + Math.floor(rng.next() * 4);
      for (let md = 0; md < moldCount; md++) {
        const moldAngle = rng.next() * Math.PI * 2;
        const moldDist = rng.next() * 0.05 * size;
        const moldSize = 0.005 + rng.next() * 0.01;

        const mold = MeshBuilder.CreateSphere(
          `${id}_mold_${md}`,
          { diameter: moldSize * 2 },
          scene
        );
        mold.position = new Vector3(
          posX + Math.cos(moldAngle) * moldDist,
          posY + 0.03 * size + rng.next() * 0.05 * size,
          posZ + Math.sin(moldAngle) * moldDist
        );
        mold.scaling = new Vector3(1, 0.5, 1);
        mold.material = decayMat;
        meshes.push(mold);
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
  }, [scene, id, posX, posY, posZ, rotation, type, condition, size, count, isEdible, seed]);

  return null;
}
