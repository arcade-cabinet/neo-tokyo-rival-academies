/**
 * Barrel - Storage barrel/drum component
 *
 * Industrial prop for docks, warehouses, and rooftops.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type BarrelType = 'metal' | 'plastic' | 'wooden';
export type BarrelContent = 'oil' | 'water' | 'chemical' | 'empty' | 'fire';

export interface BarrelProps {
  id: string;
  position: Vector3;
  /** Barrel type */
  type?: BarrelType;
  /** Content type (affects color/markings) */
  content?: BarrelContent;
  /** Is laying on side */
  onSide?: boolean;
  /** Rotation (radians) */
  rotation?: number;
  /** Rust/damage level 0-1 */
  rust?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Barrel({
  id,
  position,
  type = 'metal',
  content = 'empty',
  onSide = false,
  rotation = 0,
  rust = 0,
  seed,
}: BarrelProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const height = 0.9;
    const diameter = 0.6;
    const rustVariation = rust * (rng ? rng.next() * 0.15 : 0.1);

    // Barrel color based on content
    let barrelColor: Color3;
    if (type === 'wooden') {
      barrelColor = new Color3(0.45 - rustVariation, 0.32 - rustVariation, 0.18 - rustVariation);
    } else if (type === 'plastic') {
      switch (content) {
        case 'water':
          barrelColor = new Color3(0.2, 0.4, 0.7);
          break;
        case 'chemical':
          barrelColor = new Color3(0.7, 0.6, 0.1);
          break;
        default:
          barrelColor = new Color3(0.3, 0.3, 0.35);
      }
    } else {
      // Metal
      switch (content) {
        case 'oil':
          barrelColor = new Color3(0.15, 0.15, 0.17);
          break;
        case 'chemical':
          barrelColor = new Color3(0.1, 0.35, 0.55);
          break;
        case 'fire':
          barrelColor = new Color3(0.5 - rustVariation, 0.3 - rustVariation, 0.15 - rustVariation);
          break;
        default:
          barrelColor = new Color3(0.4 - rustVariation, 0.42 - rustVariation, 0.45 - rustVariation);
      }
    }

    // Main material
    const mat = new PBRMaterial(`barrel_mat_${id}`, scene);
    mat.albedoColor = barrelColor;
    mat.metallic = type === 'metal' ? 0.8 - rust * 0.3 : type === 'plastic' ? 0.1 : 0;
    mat.roughness = type === 'metal' ? 0.4 + rust * 0.4 : type === 'plastic' ? 0.5 : 0.75;

    // Position calculation for laying on side
    const centerY = onSide ? posY + diameter / 2 : posY + height / 2;

    // Main body
    const body = MeshBuilder.CreateCylinder(
      `${id}_body`,
      { height, diameter, tessellation: 24 },
      scene
    );
    body.position = new Vector3(posX, centerY, posZ);
    if (onSide) {
      body.rotation.x = Math.PI / 2;
    }
    body.rotation.y = rotation;
    body.material = mat;
    meshes.push(body);

    if (type === 'metal') {
      // Rim bands
      const rimMat = new PBRMaterial(`barrel_rim_${id}`, scene);
      rimMat.albedoColor = new Color3(
        0.3 - rustVariation,
        0.3 - rustVariation,
        0.32 - rustVariation
      );
      rimMat.metallic = 0.85;
      rimMat.roughness = 0.4 + rust * 0.3;

      for (const yOffset of [-height / 2 + 0.05, height / 2 - 0.05]) {
        const rim = MeshBuilder.CreateTorus(
          `${id}_rim_${yOffset}`,
          { diameter: diameter + 0.02, thickness: 0.03 },
          scene
        );
        if (onSide) {
          rim.position = new Vector3(posX, centerY + yOffset, posZ);
          rim.rotation.y = Math.PI / 2;
        } else {
          rim.position = new Vector3(posX, centerY + yOffset, posZ);
          rim.rotation.x = Math.PI / 2;
        }
        rim.material = rimMat;
        meshes.push(rim);
      }

      // Bung (cap) on top
      if (!onSide) {
        const bung = MeshBuilder.CreateCylinder(
          `${id}_bung`,
          { height: 0.03, diameter: 0.08 },
          scene
        );
        bung.position = new Vector3(posX + 0.1, posY + height + 0.015, posZ);
        bung.material = rimMat;
        meshes.push(bung);
      }

      // Rust streaks
      if (rust > 0.3 && rng) {
        const rustMat = new PBRMaterial(`barrel_rust_${id}`, scene);
        rustMat.albedoColor = new Color3(0.5, 0.25, 0.1);
        rustMat.metallic = 0.3;
        rustMat.roughness = 0.9;
        rustMat.alpha = rust * 0.7;

        const streakCount = Math.floor(rust * 4) + 1;
        for (let i = 0; i < streakCount; i++) {
          const streak = MeshBuilder.CreateBox(
            `${id}_rust_${i}`,
            {
              width: 0.05 + rng.next() * 0.05,
              height: height * (0.2 + rng.next() * 0.3),
              depth: 0.01,
            },
            scene
          );
          const angle = rng.next() * Math.PI * 2;
          streak.position = new Vector3(
            posX + Math.cos(angle) * (diameter / 2 + 0.005),
            centerY - height * 0.1 + rng.next() * height * 0.3,
            posZ + Math.sin(angle) * (diameter / 2 + 0.005)
          );
          streak.rotation.y = angle + Math.PI / 2;
          if (onSide) {
            streak.rotation.z = Math.PI / 2;
          }
          streak.material = rustMat;
          meshes.push(streak);
        }
      }
    } else if (type === 'wooden') {
      // Wooden staves and metal bands
      const bandMat = new PBRMaterial(`barrel_band_${id}`, scene);
      bandMat.albedoColor = new Color3(0.25, 0.25, 0.27);
      bandMat.metallic = 0.8;
      bandMat.roughness = 0.5;

      // Metal bands
      const bandPositions = [-height * 0.35, 0, height * 0.35];
      for (const yOffset of bandPositions) {
        const band = MeshBuilder.CreateTorus(
          `${id}_band_${yOffset}`,
          { diameter: diameter + 0.01, thickness: 0.02 },
          scene
        );
        if (onSide) {
          band.position = new Vector3(posX, centerY + yOffset, posZ);
          band.rotation.y = Math.PI / 2;
        } else {
          band.position = new Vector3(posX, centerY + yOffset, posZ);
          band.rotation.x = Math.PI / 2;
        }
        band.material = bandMat;
        meshes.push(band);
      }
    } else if (type === 'plastic') {
      // Molded ribs
      const ribCount = 4;
      for (let i = 0; i < ribCount; i++) {
        const rib = MeshBuilder.CreateTorus(
          `${id}_rib_${i}`,
          { diameter: diameter + 0.005, thickness: 0.015 },
          scene
        );
        const yOffset = -height / 2 + (i + 1) * (height / (ribCount + 1));
        if (onSide) {
          rib.position = new Vector3(posX, centerY + yOffset, posZ);
          rib.rotation.y = Math.PI / 2;
        } else {
          rib.position = new Vector3(posX, centerY + yOffset, posZ);
          rib.rotation.x = Math.PI / 2;
        }
        rib.material = mat;
        meshes.push(rib);
      }

      // Warning label (if chemical)
      if (content === 'chemical') {
        const labelMat = new PBRMaterial(`barrel_label_${id}`, scene);
        labelMat.albedoColor = new Color3(1, 0.8, 0);
        labelMat.metallic = 0;
        labelMat.roughness = 0.7;

        const label = MeshBuilder.CreateBox(
          `${id}_label`,
          { width: 0.15, height: 0.1, depth: 0.01 },
          scene
        );
        label.position = new Vector3(
          posX + (onSide ? 0 : diameter / 2 + 0.005),
          centerY,
          posZ + (onSide ? diameter / 2 + 0.005 : 0)
        );
        label.rotation.y = onSide ? 0 : Math.PI / 2;
        label.material = labelMat;
        meshes.push(label);
      }
    }

    // Fire barrel: add flames
    if (content === 'fire' && !onSide) {
      const fireMat = new PBRMaterial(`barrel_fire_${id}`, scene);
      fireMat.albedoColor = new Color3(1, 0.5, 0.1);
      fireMat.emissiveColor = new Color3(1, 0.4, 0.1);
      fireMat.metallic = 0;
      fireMat.roughness = 0.5;

      // Glow from inside
      const glow = MeshBuilder.CreateCylinder(
        `${id}_glow`,
        { height: 0.1, diameter: diameter * 0.9 },
        scene
      );
      glow.position = new Vector3(posX, posY + height - 0.05, posZ);
      glow.material = fireMat;
      meshes.push(glow);

      // Flame shapes (simplified as cones)
      const flameCount = rng ? 3 + Math.floor(rng.next() * 3) : 4;
      for (let i = 0; i < flameCount; i++) {
        const flame = MeshBuilder.CreateCylinder(
          `${id}_flame_${i}`,
          {
            height: 0.3 + (rng ? rng.next() * 0.2 : 0),
            diameterTop: 0,
            diameterBottom: 0.1,
          },
          scene
        );
        const angle = (i / flameCount) * Math.PI * 2;
        flame.position = new Vector3(
          posX + Math.cos(angle) * diameter * 0.25,
          posY + height + 0.1 + (rng ? rng.next() * 0.1 : 0),
          posZ + Math.sin(angle) * diameter * 0.25
        );
        flame.material = fireMat;
        meshes.push(flame);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      mat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, content, onSide, rotation, rust, seed]);

  return null;
}
