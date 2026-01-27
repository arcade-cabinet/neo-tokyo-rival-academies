/**
 * Scaffolding - Construction scaffolding component
 *
 * Multi-story scaffolding structures for buildings under construction.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type ScaffoldingType = 'frame' | 'tube' | 'suspended' | 'mobile';

export interface ScaffoldingProps {
  id: string;
  position: Vector3;
  /** Scaffolding type */
  type?: ScaffoldingType;
  /** Width (x) */
  width?: number;
  /** Height (y) */
  height?: number;
  /** Depth (z) */
  depth?: number;
  /** Number of levels */
  levels?: number;
  /** Has safety netting */
  hasNetting?: boolean;
  /** Has planks on all levels */
  fullPlanks?: boolean;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Scaffolding({
  id,
  position,
  type = 'frame',
  width = 3,
  height = 6,
  depth = 1.5,
  levels = 3,
  hasNetting = false,
  fullPlanks = true,
  rotation = 0,
  seed,
}: ScaffoldingProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const _rng = seed !== undefined ? createSeededRandom(seed) : null;

    const levelHeight = height / levels;

    // Materials
    const tubeMat = new PBRMaterial(`scaffold_tube_${id}`, scene);
    tubeMat.albedoColor = new Color3(0.6, 0.6, 0.62);
    tubeMat.metallic = 0.85;
    tubeMat.roughness = 0.35;

    const plankMat = new PBRMaterial(`scaffold_plank_${id}`, scene);
    plankMat.albedoColor = new Color3(0.5, 0.38, 0.22);
    plankMat.metallic = 0;
    plankMat.roughness = 0.85;

    const braceMat = new PBRMaterial(`scaffold_brace_${id}`, scene);
    braceMat.albedoColor = new Color3(0.55, 0.55, 0.58);
    braceMat.metallic = 0.8;
    braceMat.roughness = 0.4;

    const tubeRadius = type === 'tube' ? 0.024 : 0.02;

    if (type === 'frame' || type === 'tube') {
      // Vertical standards (corner poles)
      const corners = [
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [-width / 2, depth / 2],
        [width / 2, depth / 2],
      ];

      for (let i = 0; i < corners.length; i++) {
        const [cx, cz] = corners[i];
        const standard = MeshBuilder.CreateCylinder(
          `${id}_standard_${i}`,
          { height: height, diameter: tubeRadius * 2 },
          scene
        );
        standard.position = new Vector3(
          posX + Math.cos(rotation) * cx - Math.sin(rotation) * cz,
          posY + height / 2,
          posZ + Math.sin(rotation) * cx + Math.cos(rotation) * cz
        );
        standard.material = tubeMat;
        meshes.push(standard);
      }

      // Intermediate standards for wider scaffolds
      if (width > 2.5) {
        const midCount = Math.floor(width / 2);
        for (let m = 1; m < midCount; m++) {
          const mx = -width / 2 + m * (width / midCount);
          for (const mz of [-depth / 2, depth / 2]) {
            const midStandard = MeshBuilder.CreateCylinder(
              `${id}_midStandard_${m}_${mz}`,
              { height: height, diameter: tubeRadius * 2 },
              scene
            );
            midStandard.position = new Vector3(
              posX + Math.cos(rotation) * mx - Math.sin(rotation) * mz,
              posY + height / 2,
              posZ + Math.sin(rotation) * mx + Math.cos(rotation) * mz
            );
            midStandard.material = tubeMat;
            meshes.push(midStandard);
          }
        }
      }

      // Ledgers (horizontal - along length)
      for (let level = 0; level <= levels; level++) {
        const ledgerY = posY + level * levelHeight;

        for (const lz of [-depth / 2, depth / 2]) {
          const ledger = MeshBuilder.CreateCylinder(
            `${id}_ledger_${level}_${lz}`,
            { height: width, diameter: tubeRadius * 2 },
            scene
          );
          ledger.position = new Vector3(
            posX - Math.sin(rotation) * lz,
            ledgerY,
            posZ + Math.cos(rotation) * lz
          );
          ledger.rotation.z = Math.PI / 2;
          ledger.rotation.y = rotation;
          ledger.material = tubeMat;
          meshes.push(ledger);
        }
      }

      // Transoms (horizontal - along depth)
      for (let level = 0; level <= levels; level++) {
        const transomY = posY + level * levelHeight;
        const transomCount = Math.ceil(width / 2) + 1;

        for (let t = 0; t < transomCount; t++) {
          const tx = -width / 2 + t * (width / (transomCount - 1));
          const transom = MeshBuilder.CreateCylinder(
            `${id}_transom_${level}_${t}`,
            { height: depth, diameter: tubeRadius * 2 },
            scene
          );
          transom.position = new Vector3(
            posX + Math.cos(rotation) * tx,
            transomY,
            posZ + Math.sin(rotation) * tx
          );
          transom.rotation.x = Math.PI / 2;
          transom.rotation.y = rotation;
          transom.material = tubeMat;
          meshes.push(transom);
        }
      }

      // Diagonal braces
      for (let level = 0; level < levels; level++) {
        const braceY = posY + level * levelHeight + levelHeight / 2;
        const braceLength = Math.sqrt(width ** 2 + levelHeight ** 2);

        // Front and back diagonal braces
        for (const side of [-1, 1]) {
          const brace = MeshBuilder.CreateCylinder(
            `${id}_brace_${level}_${side}`,
            { height: braceLength, diameter: tubeRadius * 1.5 },
            scene
          );
          brace.position = new Vector3(
            posX - Math.sin(rotation) * ((side * depth) / 2),
            braceY,
            posZ + Math.cos(rotation) * ((side * depth) / 2)
          );
          brace.rotation.z = Math.atan2(levelHeight, width) * (level % 2 === 0 ? 1 : -1);
          brace.rotation.y = rotation;
          brace.material = braceMat;
          meshes.push(brace);
        }
      }

      // Planks
      for (let level = 1; level <= levels; level++) {
        if (!fullPlanks && level < levels) continue;

        const plankY = posY + level * levelHeight + 0.02;
        const plankWidth = 0.22;
        const plankCount = Math.floor(depth / plankWidth);

        for (let p = 0; p < plankCount; p++) {
          const pz = -depth / 2 + (p + 0.5) * (depth / plankCount);
          const plank = MeshBuilder.CreateBox(
            `${id}_plank_${level}_${p}`,
            { width: width - 0.1, height: 0.04, depth: plankWidth - 0.02 },
            scene
          );
          plank.position = new Vector3(
            posX - Math.sin(rotation) * pz,
            plankY,
            posZ + Math.cos(rotation) * pz
          );
          plank.rotation.y = rotation;
          plank.material = plankMat;
          meshes.push(plank);
        }

        // Guard rails on top level
        if (level === levels) {
          for (const gz of [-depth / 2 - 0.05, depth / 2 + 0.05]) {
            const guard = MeshBuilder.CreateCylinder(
              `${id}_guard_${level}_${gz}`,
              { height: width, diameter: tubeRadius * 2 },
              scene
            );
            guard.position = new Vector3(
              posX - Math.sin(rotation) * gz,
              plankY + 0.5,
              posZ + Math.cos(rotation) * gz
            );
            guard.rotation.z = Math.PI / 2;
            guard.rotation.y = rotation;
            guard.material = tubeMat;
            meshes.push(guard);
          }
        }
      }
    } else if (type === 'suspended') {
      // Suspended scaffolding (hanging platform)
      const platformWidth = width;
      const platformDepth = depth;

      // Platform
      const platform = MeshBuilder.CreateBox(
        `${id}_platform`,
        { width: platformWidth, height: 0.05, depth: platformDepth },
        scene
      );
      platform.position = new Vector3(posX, posY, posZ);
      platform.rotation.y = rotation;
      platform.material = plankMat;
      meshes.push(platform);

      // Guard rails
      const railHeight = 1;
      for (const side of [-1, 1]) {
        // Posts
        for (const px of [-platformWidth / 2, 0, platformWidth / 2]) {
          const post = MeshBuilder.CreateCylinder(
            `${id}_post_${side}_${px}`,
            { height: railHeight, diameter: tubeRadius * 2 },
            scene
          );
          post.position = new Vector3(
            posX + Math.cos(rotation) * px - Math.sin(rotation) * ((side * platformDepth) / 2),
            posY + railHeight / 2,
            posZ + Math.sin(rotation) * px + Math.cos(rotation) * ((side * platformDepth) / 2)
          );
          post.material = tubeMat;
          meshes.push(post);
        }

        // Top rail
        const topRail = MeshBuilder.CreateCylinder(
          `${id}_topRail_${side}`,
          { height: platformWidth, diameter: tubeRadius * 2 },
          scene
        );
        topRail.position = new Vector3(
          posX - Math.sin(rotation) * ((side * platformDepth) / 2),
          posY + railHeight,
          posZ + Math.cos(rotation) * ((side * platformDepth) / 2)
        );
        topRail.rotation.z = Math.PI / 2;
        topRail.rotation.y = rotation;
        topRail.material = tubeMat;
        meshes.push(topRail);
      }

      // Suspension cables
      const cableHeight = 3;
      for (const cx of [-platformWidth / 2 + 0.1, platformWidth / 2 - 0.1]) {
        const cable = MeshBuilder.CreateCylinder(
          `${id}_cable_${cx}`,
          { height: cableHeight, diameter: 0.015 },
          scene
        );
        cable.position = new Vector3(
          posX + Math.cos(rotation) * cx,
          posY + cableHeight / 2,
          posZ + Math.sin(rotation) * cx
        );
        cable.material = braceMat;
        meshes.push(cable);
      }

      // Winch mechanisms
      for (const wx of [-platformWidth / 2 + 0.2, platformWidth / 2 - 0.2]) {
        const winch = MeshBuilder.CreateCylinder(
          `${id}_winch_${wx}`,
          { height: 0.15, diameter: 0.2 },
          scene
        );
        winch.position = new Vector3(
          posX + Math.cos(rotation) * wx,
          posY + cableHeight + 0.1,
          posZ + Math.sin(rotation) * wx
        );
        winch.rotation.x = Math.PI / 2;
        winch.material = tubeMat;
        meshes.push(winch);
      }
    } else if (type === 'mobile') {
      // Mobile scaffolding with wheels
      const platformHeight = height - 0.3;

      // Base frame
      const baseFrame = MeshBuilder.CreateBox(
        `${id}_baseFrame`,
        { width: width, height: 0.08, depth: depth },
        scene
      );
      baseFrame.position = new Vector3(posX, posY + 0.2, posZ);
      baseFrame.rotation.y = rotation;
      baseFrame.material = tubeMat;
      meshes.push(baseFrame);

      // Wheels
      const wheelPositions = [
        [-width / 2 + 0.15, -depth / 2 + 0.15],
        [width / 2 - 0.15, -depth / 2 + 0.15],
        [-width / 2 + 0.15, depth / 2 - 0.15],
        [width / 2 - 0.15, depth / 2 - 0.15],
      ];

      for (let w = 0; w < wheelPositions.length; w++) {
        const [wx, wz] = wheelPositions[w];
        const wheel = MeshBuilder.CreateCylinder(
          `${id}_wheel_${w}`,
          { height: 0.05, diameter: 0.15 },
          scene
        );
        wheel.position = new Vector3(
          posX + Math.cos(rotation) * wx - Math.sin(rotation) * wz,
          posY + 0.075,
          posZ + Math.sin(rotation) * wx + Math.cos(rotation) * wz
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.rotation.y = rotation;
        wheel.material = braceMat;
        meshes.push(wheel);
      }

      // Vertical standards
      for (let i = 0; i < 4; i++) {
        const [cx, cz] = wheelPositions[i];
        const standard = MeshBuilder.CreateCylinder(
          `${id}_mobileStandard_${i}`,
          { height: platformHeight, diameter: tubeRadius * 2 },
          scene
        );
        standard.position = new Vector3(
          posX + Math.cos(rotation) * cx - Math.sin(rotation) * cz,
          posY + 0.24 + platformHeight / 2,
          posZ + Math.sin(rotation) * cx + Math.cos(rotation) * cz
        );
        standard.material = tubeMat;
        meshes.push(standard);
      }

      // Platform
      const platform = MeshBuilder.CreateBox(
        `${id}_mobilePlatform`,
        { width: width - 0.1, height: 0.05, depth: depth - 0.1 },
        scene
      );
      platform.position = new Vector3(posX, posY + 0.24 + platformHeight, posZ);
      platform.rotation.y = rotation;
      platform.material = plankMat;
      meshes.push(platform);

      // Guard rails
      for (const side of [-1, 1]) {
        const guard = MeshBuilder.CreateCylinder(
          `${id}_mobileGuard_${side}`,
          { height: width - 0.2, diameter: tubeRadius * 2 },
          scene
        );
        guard.position = new Vector3(
          posX - Math.sin(rotation) * (side * (depth / 2 - 0.1)),
          posY + 0.24 + platformHeight + 0.5,
          posZ + Math.cos(rotation) * (side * (depth / 2 - 0.1))
        );
        guard.rotation.z = Math.PI / 2;
        guard.rotation.y = rotation;
        guard.material = tubeMat;
        meshes.push(guard);
      }
    }

    // Safety netting
    if (hasNetting && type !== 'mobile') {
      const netMat = new PBRMaterial(`scaffold_net_${id}`, scene);
      netMat.albedoColor = new Color3(0.1, 0.4, 0.1);
      netMat.metallic = 0;
      netMat.roughness = 0.95;
      netMat.alpha = 0.7;

      // Front netting
      const frontNet = MeshBuilder.CreateBox(
        `${id}_frontNet`,
        { width: width, height: height, depth: 0.01 },
        scene
      );
      frontNet.position = new Vector3(
        posX - Math.sin(rotation) * (depth / 2 + 0.05),
        posY + height / 2,
        posZ + Math.cos(rotation) * (depth / 2 + 0.05)
      );
      frontNet.rotation.y = rotation;
      frontNet.material = netMat;
      meshes.push(frontNet);
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      tubeMat.dispose();
      plankMat.dispose();
      braceMat.dispose();
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
    levels,
    hasNetting,
    fullPlanks,
    rotation,
    seed,
  ]);

  return null;
}
