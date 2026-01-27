/**
 * Lamppost - Various street lamp styles
 *
 * Street lamps with different styles and conditions.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type LamppostType =
  | 'victorian'
  | 'modern'
  | 'japanese'
  | 'industrial'
  | 'art_deco'
  | 'minimal';

export interface LamppostProps {
  id: string;
  position: Vector3;
  /** Lamppost type */
  type?: LamppostType;
  /** Post height */
  height?: number;
  /** Is lit */
  isLit?: boolean;
  /** Has multiple heads */
  headCount?: number;
  /** Condition 0-1 */
  condition?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Lamppost({
  id,
  position,
  type = 'modern',
  height = 4,
  isLit = true,
  headCount = 1,
  condition = 0.8,
  rotation = 0,
  seed,
}: LamppostProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const conditionFactor = condition;

    // Materials
    const postMat = new PBRMaterial(`lamppost_post_${id}`, scene);
    const lampMat = new PBRMaterial(`lamppost_lamp_${id}`, scene);
    const glassMat = new PBRMaterial(`lamppost_glass_${id}`, scene);

    if (type === 'victorian') {
      postMat.albedoColor = new Color3(0.15, 0.18, 0.15).scale(conditionFactor);
      postMat.metallic = 0.7;
      postMat.roughness = 0.5;
      lampMat.albedoColor = new Color3(0.2, 0.22, 0.2).scale(conditionFactor);
      lampMat.metallic = 0.6;
      lampMat.roughness = 0.4;
    } else if (type === 'modern') {
      postMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
      postMat.metallic = 0.8;
      postMat.roughness = 0.35;
      lampMat.albedoColor = new Color3(0.55, 0.57, 0.6).scale(conditionFactor);
      lampMat.metallic = 0.75;
      lampMat.roughness = 0.3;
    } else if (type === 'japanese') {
      postMat.albedoColor = new Color3(0.35, 0.32, 0.28).scale(conditionFactor);
      postMat.metallic = 0.3;
      postMat.roughness = 0.7;
      lampMat.albedoColor = new Color3(0.9, 0.85, 0.75).scale(conditionFactor);
      lampMat.metallic = 0;
      lampMat.roughness = 0.6;
    } else if (type === 'industrial') {
      postMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
      postMat.metallic = 0.85;
      postMat.roughness = 0.4;
      lampMat.albedoColor = new Color3(0.35, 0.37, 0.4).scale(conditionFactor);
      lampMat.metallic = 0.8;
      lampMat.roughness = 0.45;
    } else if (type === 'art_deco') {
      postMat.albedoColor = new Color3(0.25, 0.25, 0.28).scale(conditionFactor);
      postMat.metallic = 0.75;
      postMat.roughness = 0.35;
      lampMat.albedoColor = new Color3(0.85, 0.75, 0.5).scale(conditionFactor);
      lampMat.metallic = 0.5;
      lampMat.roughness = 0.4;
    } else {
      // Minimal
      postMat.albedoColor = new Color3(0.15, 0.15, 0.18).scale(conditionFactor);
      postMat.metallic = 0.9;
      postMat.roughness = 0.25;
      lampMat.albedoColor = new Color3(0.2, 0.2, 0.22).scale(conditionFactor);
      lampMat.metallic = 0.85;
      lampMat.roughness = 0.3;
    }

    if (isLit) {
      glassMat.albedoColor = new Color3(1.0, 0.95, 0.8);
      glassMat.emissiveColor = new Color3(0.9, 0.85, 0.6);
    } else {
      glassMat.albedoColor = new Color3(0.6, 0.6, 0.55);
    }
    glassMat.metallic = 0;
    glassMat.roughness = 0.2;
    glassMat.alpha = 0.8;

    // Base
    const baseMat = new PBRMaterial(`lamppost_base_${id}`, scene);
    baseMat.albedoColor = postMat.albedoColor.scale(0.9);
    baseMat.metallic = postMat.metallic;
    baseMat.roughness = postMat.roughness + 0.1;

    let baseSize = 0.2;
    if (type === 'victorian' || type === 'art_deco') {
      baseSize = 0.35;
      const base = MeshBuilder.CreateCylinder(
        `${id}_base`,
        { height: 0.15, diameterTop: 0.25, diameterBottom: baseSize },
        scene
      );
      base.position = new Vector3(posX, posY + 0.075, posZ);
      base.material = baseMat;
      meshes.push(base);
    } else {
      const base = MeshBuilder.CreateCylinder(
        `${id}_base`,
        { height: 0.08, diameter: baseSize },
        scene
      );
      base.position = new Vector3(posX, posY + 0.04, posZ);
      base.material = baseMat;
      meshes.push(base);
    }

    // Main post
    const postDiameter = type === 'victorian' || type === 'art_deco' ? 0.12 : 0.08;

    if (type === 'victorian') {
      // Fluted post
      const post = MeshBuilder.CreateCylinder(
        `${id}_post`,
        { height: height - 0.5, diameter: postDiameter, tessellation: 8 },
        scene
      );
      post.position = new Vector3(posX, posY + (height - 0.5) / 2 + 0.15, posZ);
      post.material = postMat;
      meshes.push(post);

      // Decorative rings
      for (let r = 0; r < 3; r++) {
        const ringY = posY + 0.5 + (r * (height - 1)) / 2;
        const ring = MeshBuilder.CreateTorus(
          `${id}_ring_${r}`,
          { diameter: postDiameter + 0.04, thickness: 0.02, tessellation: 16 },
          scene
        );
        ring.position = new Vector3(posX, ringY, posZ);
        ring.rotation.x = Math.PI / 2;
        ring.material = postMat;
        meshes.push(ring);
      }
    } else if (type === 'modern' || type === 'minimal') {
      // Curved modern post
      const post = MeshBuilder.CreateCylinder(
        `${id}_post`,
        { height: height * 0.7, diameter: postDiameter },
        scene
      );
      post.position = new Vector3(posX, posY + height * 0.35, posZ);
      post.material = postMat;
      meshes.push(post);

      // Curved arm
      const armLength = 1.2;
      const arm = MeshBuilder.CreateCylinder(
        `${id}_arm`,
        { height: armLength, diameter: postDiameter * 0.8 },
        scene
      );
      arm.position = new Vector3(
        posX + Math.cos(rotation) * (armLength / 2 - 0.1),
        posY + height * 0.7 + 0.2,
        posZ - Math.sin(rotation) * (armLength / 2 - 0.1)
      );
      arm.rotation.z = Math.PI / 2 - 0.3;
      arm.rotation.y = rotation;
      arm.material = postMat;
      meshes.push(arm);
    } else {
      // Standard straight post
      const post = MeshBuilder.CreateCylinder(
        `${id}_post`,
        { height: height, diameter: postDiameter },
        scene
      );
      post.position = new Vector3(posX, posY + height / 2, posZ);
      post.material = postMat;
      meshes.push(post);
    }

    // Lamp heads
    const actualHeadCount = Math.min(Math.max(headCount, 1), 4);

    for (let h = 0; h < actualHeadCount; h++) {
      const headAngle = rotation + (h / actualHeadCount) * Math.PI * 2;
      const headOffset = actualHeadCount > 1 ? 0.3 : 0;

      const headX = posX + Math.cos(headAngle) * headOffset;
      const headZ = posZ - Math.sin(headAngle) * headOffset;
      let headY = posY + height;

      if (type === 'modern' || type === 'minimal') {
        headY = posY + height * 0.7 + 0.3;
        const armEnd = 1.0;
        const hx = posX + Math.cos(rotation) * armEnd;
        const hz = posZ - Math.sin(rotation) * armEnd;

        // Modern lamp housing
        const housing = MeshBuilder.CreateBox(
          `${id}_housing_${h}`,
          { width: 0.4, height: 0.08, depth: 0.15 },
          scene
        );
        housing.position = new Vector3(hx, headY, hz);
        housing.rotation.y = rotation;
        housing.material = lampMat;
        meshes.push(housing);

        // Light panel
        const lightPanel = MeshBuilder.CreateBox(
          `${id}_light_${h}`,
          { width: 0.35, height: 0.02, depth: 0.12 },
          scene
        );
        lightPanel.position = new Vector3(hx, headY - 0.05, hz);
        lightPanel.rotation.y = rotation;
        lightPanel.material = glassMat;
        meshes.push(lightPanel);
      } else if (type === 'victorian' || type === 'art_deco') {
        // Ornate lantern
        const lanternBase = MeshBuilder.CreateCylinder(
          `${id}_lanternBase_${h}`,
          { height: 0.05, diameter: 0.2 },
          scene
        );
        lanternBase.position = new Vector3(headX, headY, headZ);
        lanternBase.material = lampMat;
        meshes.push(lanternBase);

        const lanternBody = MeshBuilder.CreateCylinder(
          `${id}_lanternBody_${h}`,
          {
            height: 0.35,
            diameter: 0.18,
            tessellation: type === 'victorian' ? 6 : 8,
          },
          scene
        );
        lanternBody.position = new Vector3(headX, headY + 0.2, headZ);
        lanternBody.material = glassMat;
        meshes.push(lanternBody);

        const lanternTop = MeshBuilder.CreateCylinder(
          `${id}_lanternTop_${h}`,
          { height: 0.1, diameterBottom: 0.2, diameterTop: 0.08 },
          scene
        );
        lanternTop.position = new Vector3(headX, headY + 0.42, headZ);
        lanternTop.material = lampMat;
        meshes.push(lanternTop);

        // Finial
        const finial = MeshBuilder.CreateSphere(
          `${id}_finial_${h}`,
          { diameter: 0.06, segments: 8 },
          scene
        );
        finial.position = new Vector3(headX, headY + 0.5, headZ);
        finial.material = lampMat;
        meshes.push(finial);
      } else if (type === 'japanese') {
        // Paper lantern style
        const lantern = MeshBuilder.CreateSphere(
          `${id}_lantern_${h}`,
          { diameter: 0.35, segments: 12 },
          scene
        );
        lantern.position = new Vector3(headX, headY + 0.1, headZ);
        lantern.scaling = new Vector3(1, 1.3, 1);
        lantern.material = glassMat;
        meshes.push(lantern);

        // Frame rings
        for (let fr = 0; fr < 3; fr++) {
          const frameRing = MeshBuilder.CreateTorus(
            `${id}_frame_${h}_${fr}`,
            { diameter: 0.32, thickness: 0.01, tessellation: 16 },
            scene
          );
          frameRing.position = new Vector3(headX, headY + 0.05 + fr * 0.1, headZ);
          frameRing.rotation.x = Math.PI / 2;
          frameRing.material = postMat;
          meshes.push(frameRing);
        }
      } else {
        // Industrial cobra head
        const housing = MeshBuilder.CreateBox(
          `${id}_housing_${h}`,
          { width: 0.5, height: 0.15, depth: 0.25 },
          scene
        );
        housing.position = new Vector3(
          headX + Math.cos(headAngle) * 0.2,
          headY,
          headZ - Math.sin(headAngle) * 0.2
        );
        housing.rotation.y = headAngle;
        housing.material = lampMat;
        meshes.push(housing);

        const lens = MeshBuilder.CreateBox(
          `${id}_lens_${h}`,
          { width: 0.4, height: 0.02, depth: 0.2 },
          scene
        );
        lens.position = new Vector3(
          headX + Math.cos(headAngle) * 0.2,
          headY - 0.08,
          headZ - Math.sin(headAngle) * 0.2
        );
        lens.rotation.y = headAngle;
        lens.material = glassMat;
        meshes.push(lens);
      }
    }

    // Broken/flickering effect
    if (condition < 0.5 && !isLit) {
      const brokenGlass = new PBRMaterial(`lamppost_broken_${id}`, scene);
      brokenGlass.albedoColor = new Color3(0.3, 0.3, 0.28);
      brokenGlass.metallic = 0.1;
      brokenGlass.roughness = 0.8;

      // Replace glass material on some elements
      for (const mesh of meshes) {
        if (mesh.material === glassMat && rng && rng.next() > 0.5) {
          mesh.material = brokenGlass;
        }
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      postMat.dispose();
      lampMat.dispose();
      glassMat.dispose();
      baseMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, height, isLit, headCount, condition, rotation, seed]);

  return null;
}
