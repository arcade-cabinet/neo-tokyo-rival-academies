/**
 * Pontoon - Floating platform component
 *
 * Buoyant platforms for the flooded city.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type PontoonType = 'single' | 'double' | 'platform' | 'barrel';

export interface PontoonProps {
  id: string;
  position: Vector3;
  /** Type of pontoon */
  type?: PontoonType;
  /** Width */
  width?: number;
  /** Length */
  length?: number;
  /** Water level (Y position) */
  waterLevel?: number;
  /** Has deck surface */
  deck?: boolean;
  /** Has mooring rings */
  mooringRings?: boolean;
  /** Seed for procedural variation */
  seed?: number;
}

export function Pontoon({
  id,
  position,
  type = 'single',
  width = 2,
  length = 4,
  waterLevel = 0,
  deck = true,
  mooringRings = true,
  seed,
}: PontoonProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const _posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const floatHeight = waterLevel + 0.15; // Slight above water

    // Pontoon body material
    const bodyMat = new PBRMaterial(`pontoon_body_${id}`, scene);
    bodyMat.albedoColor = new Color3(0.3, 0.35, 0.4);
    bodyMat.metallic = 0.2;
    bodyMat.roughness = 0.7;

    // Deck material
    const deckMat = new PBRMaterial(`pontoon_deck_${id}`, scene);
    deckMat.albedoColor = rng
      ? new Color3(0.4 + rng.next() * 0.1, 0.35 + rng.next() * 0.1, 0.25 + rng.next() * 0.1)
      : new Color3(0.45, 0.38, 0.28);
    deckMat.metallic = 0;
    deckMat.roughness = 0.8;

    // Metal hardware material
    const metalMat = new PBRMaterial(`pontoon_metal_${id}`, scene);
    metalMat.albedoColor = new Color3(0.25, 0.25, 0.27);
    metalMat.metallic = 0.9;
    metalMat.roughness = 0.4;

    if (type === 'single') {
      // Single pontoon float
      const body = MeshBuilder.CreateCylinder(
        `${id}_body`,
        { height: length, diameter: width },
        scene
      );
      body.position = new Vector3(posX, floatHeight, posZ + length / 2);
      body.rotation.x = Math.PI / 2;
      body.material = bodyMat;
      meshes.push(body);

      // End caps
      for (const end of [0, length]) {
        const cap = MeshBuilder.CreateSphere(
          `${id}_cap_${end}`,
          { diameter: width, slice: 0.5 },
          scene
        );
        cap.position = new Vector3(posX, floatHeight, posZ + end);
        cap.rotation.x = end === 0 ? Math.PI / 2 : -Math.PI / 2;
        cap.material = bodyMat;
        meshes.push(cap);
      }
    } else if (type === 'double') {
      // Two parallel pontoons
      for (const side of [-1, 1]) {
        const body = MeshBuilder.CreateCylinder(
          `${id}_body_${side}`,
          { height: length, diameter: width * 0.4 },
          scene
        );
        body.position = new Vector3(posX + (side * width) / 3, floatHeight, posZ + length / 2);
        body.rotation.x = Math.PI / 2;
        body.material = bodyMat;
        meshes.push(body);

        // End caps
        for (const end of [0, length]) {
          const cap = MeshBuilder.CreateSphere(
            `${id}_cap_${side}_${end}`,
            { diameter: width * 0.4, slice: 0.5 },
            scene
          );
          cap.position = new Vector3(posX + (side * width) / 3, floatHeight, posZ + end);
          cap.rotation.x = end === 0 ? Math.PI / 2 : -Math.PI / 2;
          cap.material = bodyMat;
          meshes.push(cap);
        }
      }

      // Cross braces
      const braceCount = Math.ceil(length / 2);
      for (let i = 0; i < braceCount; i++) {
        const braceZ = (i + 0.5) * (length / braceCount);
        const brace = MeshBuilder.CreateBox(
          `${id}_brace_${i}`,
          { width: width * 0.8, height: 0.1, depth: 0.15 },
          scene
        );
        brace.position = new Vector3(posX, floatHeight + width * 0.2 + 0.05, posZ + braceZ);
        brace.material = metalMat;
        meshes.push(brace);
      }
    } else if (type === 'platform') {
      // Rectangular platform float
      const body = MeshBuilder.CreateBox(
        `${id}_body`,
        { width, height: 0.4, depth: length },
        scene
      );
      body.position = new Vector3(posX, floatHeight, posZ + length / 2);
      body.material = bodyMat;
      meshes.push(body);
    } else if (type === 'barrel') {
      // Barrel-based float
      const barrelRadius = 0.3;
      const barrelHeight = 0.9;
      const barrelCountW = Math.floor(width / (barrelRadius * 2.2));
      const barrelCountL = Math.floor(length / (barrelRadius * 2.2));

      const barrelMat = new PBRMaterial(`pontoon_barrel_${id}`, scene);
      barrelMat.albedoColor =
        rng && rng.next() > 0.5
          ? new Color3(0.15, 0.25, 0.45) // Blue barrel
          : new Color3(0.6, 0.35, 0.15); // Rust barrel
      barrelMat.metallic = 0.7;
      barrelMat.roughness = 0.5;

      for (let i = 0; i < barrelCountW; i++) {
        for (let j = 0; j < barrelCountL; j++) {
          const barrel = MeshBuilder.CreateCylinder(
            `${id}_barrel_${i}_${j}`,
            { height: barrelHeight, diameter: barrelRadius * 2 },
            scene
          );
          barrel.position = new Vector3(
            posX + (i - barrelCountW / 2 + 0.5) * (width / barrelCountW),
            floatHeight,
            posZ + (j + 0.5) * (length / barrelCountL)
          );
          barrel.rotation.x = Math.PI / 2;
          barrel.material = barrelMat;
          meshes.push(barrel);
        }
      }
    }

    // Deck surface
    if (deck) {
      const deckY =
        type === 'barrel'
          ? floatHeight + 0.35
          : type === 'double'
            ? floatHeight + width * 0.2 + 0.1
            : floatHeight + (type === 'platform' ? 0.2 : width / 2) + 0.05;

      const deckSurface = MeshBuilder.CreateBox(
        `${id}_deck`,
        { width: width * 0.95, height: 0.08, depth: length * 0.95 },
        scene
      );
      deckSurface.position = new Vector3(posX, deckY, posZ + length / 2);
      deckSurface.material = deckMat;
      meshes.push(deckSurface);

      // Deck planks texture (visual lines)
      const plankCount = Math.floor(width / 0.15);
      for (let i = 0; i < plankCount; i++) {
        const line = MeshBuilder.CreateBox(
          `${id}_plank_line_${i}`,
          { width: 0.01, height: 0.005, depth: length * 0.93 },
          scene
        );
        line.position = new Vector3(
          posX + (i - plankCount / 2 + 0.5) * ((width * 0.9) / plankCount),
          deckY + 0.045,
          posZ + length / 2
        );
        line.material = metalMat;
        meshes.push(line);
      }
    }

    // Mooring rings
    if (mooringRings) {
      const ringPositions = [
        { x: -width / 2 + 0.1, z: 0.3 },
        { x: width / 2 - 0.1, z: 0.3 },
        { x: -width / 2 + 0.1, z: length - 0.3 },
        { x: width / 2 - 0.1, z: length - 0.3 },
      ];

      for (let i = 0; i < ringPositions.length; i++) {
        const rp = ringPositions[i];
        const ring = MeshBuilder.CreateTorus(
          `${id}_ring_${i}`,
          { diameter: 0.12, thickness: 0.02 },
          scene
        );
        ring.position = new Vector3(posX + rp.x, floatHeight + 0.3, posZ + rp.z);
        ring.rotation.x = Math.PI / 2;
        ring.material = metalMat;
        meshes.push(ring);

        // Ring mount
        const mount = MeshBuilder.CreateBox(
          `${id}_mount_${i}`,
          { width: 0.08, height: 0.08, depth: 0.04 },
          scene
        );
        mount.position = new Vector3(posX + rp.x * 0.95, floatHeight + 0.3, posZ + rp.z);
        mount.material = metalMat;
        meshes.push(mount);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      bodyMat.dispose();
      deckMat.dispose();
      metalMat.dispose();
    };
  }, [scene, id, posX, posZ, type, width, length, waterLevel, deck, mooringRings, seed]);

  return null;
}
