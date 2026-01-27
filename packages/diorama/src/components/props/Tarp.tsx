/**
 * Tarp - Makeshift tarps and covers
 *
 * Various tarp configurations for post-apocalyptic urban environments.
 * Used as shelters, covers, and makeshift structures.
 */

import {
  type AbstractMesh,
  Color3,
  type Material,
  MeshBuilder,
  PBRMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type TarpType = 'flat' | 'draped' | 'tent' | 'awning';

export interface TarpProps {
  id: string;
  position: Vector3;
  /** Tarp type/configuration */
  type?: TarpType;
  /** Width of the tarp */
  width?: number;
  /** Depth of the tarp */
  depth?: number;
  /** Primary tarp color */
  color?: Color3;
  /** Whether tarp has holes/damage */
  hasHoles?: boolean;
  /** Whether tarp is tied down with ropes */
  isTied?: boolean;
  /** Condition 0-1 */
  condition?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

// Common tarp colors found in urban environments
const DEFAULT_TARP_COLORS = [
  new Color3(0.1, 0.25, 0.5), // Blue
  new Color3(0.15, 0.4, 0.15), // Green
  new Color3(0.55, 0.35, 0.15), // Brown/tan
  new Color3(0.6, 0.6, 0.6), // Gray
  new Color3(0.6, 0.35, 0.1), // Orange
];

export function Tarp({
  id,
  position,
  type = 'flat',
  width = 2,
  depth = 2,
  color,
  hasHoles = false,
  isTied = true,
  condition = 0.7,
  rotation = 0,
  seed,
}: TarpProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const materials: Material[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    // Select color
    const tarpColor =
      color ??
      (rng
        ? DEFAULT_TARP_COLORS[Math.floor(rng.next() * DEFAULT_TARP_COLORS.length)]
        : DEFAULT_TARP_COLORS[0]);

    // Create main tarp material
    const tarpMat = new PBRMaterial(`tarp_main_${id}`, scene);
    tarpMat.albedoColor = tarpColor.scale(condition);
    tarpMat.metallic = 0;
    tarpMat.roughness = 0.85;
    tarpMat.backFaceCulling = false;
    materials.push(tarpMat);

    // Rope material for ties
    const ropeMat = new PBRMaterial(`tarp_rope_${id}`, scene);
    ropeMat.albedoColor = new Color3(0.4, 0.35, 0.25).scale(condition);
    ropeMat.metallic = 0;
    ropeMat.roughness = 0.9;
    materials.push(ropeMat);

    // Grommet/ring material
    const grommetMat = new PBRMaterial(`tarp_grommet_${id}`, scene);
    grommetMat.albedoColor = new Color3(0.5, 0.5, 0.52).scale(condition);
    grommetMat.metallic = 0.7;
    grommetMat.roughness = 0.5;
    materials.push(grommetMat);

    if (type === 'flat') {
      // Flat tarp laying on ground or slightly raised
      const subdivisions = 8;
      const tarp = MeshBuilder.CreateGround(
        `${id}_tarp`,
        { width, height: depth, subdivisions },
        scene
      );
      tarp.position = new Vector3(posX, posY + 0.02, posZ);
      tarp.rotation.y = rotation;
      tarp.material = tarpMat;

      // Add slight waviness by adjusting vertices
      const positions = tarp.getVerticesData('position');
      if (positions && rng) {
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] += (rng.next() - 0.5) * 0.05;
        }
        tarp.updateVerticesData('position', positions);
      }
      meshes.push(tarp);

      // Add corner weights/grommets
      const corners = [
        [-width / 2, -depth / 2],
        [width / 2, -depth / 2],
        [-width / 2, depth / 2],
        [width / 2, depth / 2],
      ];

      for (let i = 0; i < corners.length; i++) {
        const [cx, cz] = corners[i];
        const grommet = MeshBuilder.CreateTorus(
          `${id}_grommet_${i}`,
          { diameter: 0.06, thickness: 0.01, tessellation: 12 },
          scene
        );
        grommet.position = new Vector3(
          posX + Math.cos(rotation) * cx - Math.sin(rotation) * cz,
          posY + 0.025,
          posZ + Math.sin(rotation) * cx + Math.cos(rotation) * cz
        );
        grommet.rotation.x = Math.PI / 2;
        grommet.material = grommetMat;
        meshes.push(grommet);
      }
    } else if (type === 'draped') {
      // Tarp draped over something (like debris or a frame)
      const peakHeight = Math.min(width, depth) * 0.4;
      const segments = 12;

      // Create custom draped shape using ribbon
      const paths: Vector3[][] = [];
      for (let i = 0; i <= segments; i++) {
        const path: Vector3[] = [];
        const zPos = (i / segments - 0.5) * depth;

        for (let j = 0; j <= segments; j++) {
          const xPos = (j / segments - 0.5) * width;
          // Create a dome-like drape with random variation
          const distFromCenter = Math.sqrt((xPos / (width / 2)) ** 2 + (zPos / (depth / 2)) ** 2);
          const heightFactor = Math.max(0, 1 - distFromCenter);
          const baseHeight = peakHeight * heightFactor * heightFactor;
          const variation = rng ? (rng.next() - 0.5) * 0.1 : 0;

          path.push(new Vector3(xPos, baseHeight + variation, zPos));
        }
        paths.push(path);
      }

      const tarp = MeshBuilder.CreateRibbon(
        `${id}_tarp`,
        { pathArray: paths, sideOrientation: 2 },
        scene
      );
      tarp.position = new Vector3(posX, posY, posZ);
      tarp.rotation.y = rotation;
      tarp.material = tarpMat;
      meshes.push(tarp);

      // Support pole in center
      const pole = MeshBuilder.CreateCylinder(
        `${id}_pole`,
        { height: peakHeight, diameter: 0.04 },
        scene
      );
      pole.position = new Vector3(posX, posY + peakHeight / 2, posZ);
      const poleMat = new PBRMaterial(`tarp_pole_${id}`, scene);
      poleMat.albedoColor = new Color3(0.35, 0.3, 0.2);
      poleMat.metallic = 0;
      poleMat.roughness = 0.8;
      materials.push(poleMat);
      pole.material = poleMat;
      meshes.push(pole);
    } else if (type === 'tent') {
      // A-frame tent configuration
      const tentHeight = Math.min(width, depth) * 0.6;
      const halfWidth = width / 2;

      // Create two sloped panels
      for (const side of [-1, 1]) {
        const panel = MeshBuilder.CreatePlane(
          `${id}_panel_${side}`,
          { width: Math.sqrt(halfWidth ** 2 + tentHeight ** 2), height: depth },
          scene
        );

        const angle = Math.atan2(tentHeight, halfWidth);
        panel.position = new Vector3(
          posX + Math.cos(rotation) * ((side * halfWidth) / 2),
          posY + tentHeight / 2,
          posZ - Math.sin(rotation) * ((side * halfWidth) / 2)
        );
        panel.rotation.y = rotation;
        panel.rotation.z = side * (Math.PI / 2 - angle);
        panel.material = tarpMat;
        meshes.push(panel);
      }

      // Ridge pole
      const ridge = MeshBuilder.CreateCylinder(
        `${id}_ridge`,
        { height: depth + 0.1, diameter: 0.03 },
        scene
      );
      ridge.position = new Vector3(posX, posY + tentHeight, posZ);
      ridge.rotation.x = Math.PI / 2;
      ridge.rotation.y = rotation;
      const ridgeMat = new PBRMaterial(`tarp_ridge_${id}`, scene);
      ridgeMat.albedoColor = new Color3(0.3, 0.25, 0.15);
      ridgeMat.metallic = 0;
      ridgeMat.roughness = 0.85;
      materials.push(ridgeMat);
      ridge.material = ridgeMat;
      meshes.push(ridge);

      // End poles
      for (const end of [-1, 1]) {
        const pole = MeshBuilder.CreateCylinder(
          `${id}_endPole_${end}`,
          { height: tentHeight + 0.1, diameter: 0.025 },
          scene
        );
        pole.position = new Vector3(
          posX - Math.sin(rotation) * ((end * depth) / 2),
          posY + tentHeight / 2,
          posZ - Math.cos(rotation) * ((end * depth) / 2)
        );
        pole.material = ridgeMat;
        meshes.push(pole);
      }
    } else if (type === 'awning') {
      // Sloped awning attached to wall
      const awningHeight = 0.8;
      const slopeAngle = Math.PI / 6; // 30 degrees

      // Main awning surface
      const awning = MeshBuilder.CreatePlane(
        `${id}_awning`,
        { width, height: depth / Math.cos(slopeAngle) },
        scene
      );
      awning.position = new Vector3(
        posX,
        posY + awningHeight - (depth / 2) * Math.sin(slopeAngle),
        posZ - (depth / 2) * Math.cos(slopeAngle) * 0.5
      );
      awning.rotation.x = slopeAngle;
      awning.rotation.y = rotation;
      awning.material = tarpMat;
      meshes.push(awning);

      // Support frame
      const frameMat = new PBRMaterial(`tarp_frame_${id}`, scene);
      frameMat.albedoColor = new Color3(0.4, 0.4, 0.42).scale(condition);
      frameMat.metallic = 0.8;
      frameMat.roughness = 0.4;
      materials.push(frameMat);

      // Front bar
      const frontBar = MeshBuilder.CreateCylinder(
        `${id}_frontBar`,
        { height: width, diameter: 0.025 },
        scene
      );
      frontBar.position = new Vector3(
        posX,
        posY + awningHeight - depth * Math.sin(slopeAngle),
        posZ - depth * Math.cos(slopeAngle)
      );
      frontBar.rotation.z = Math.PI / 2;
      frontBar.rotation.y = rotation;
      frontBar.material = frameMat;
      meshes.push(frontBar);

      // Support poles
      for (const side of [-1, 1]) {
        const pole = MeshBuilder.CreateCylinder(
          `${id}_supportPole_${side}`,
          {
            height: awningHeight - depth * Math.sin(slopeAngle),
            diameter: 0.02,
          },
          scene
        );
        pole.position = new Vector3(
          posX + Math.cos(rotation) * (((side * width) / 2) * 0.9),
          posY + (awningHeight - depth * Math.sin(slopeAngle)) / 2,
          posZ - depth * Math.cos(slopeAngle) - Math.sin(rotation) * (((side * width) / 2) * 0.9)
        );
        pole.material = frameMat;
        meshes.push(pole);
      }
    }

    // Add tie-down ropes if specified
    if (isTied && type !== 'awning') {
      const ropeCount = rng ? 2 + Math.floor(rng.next() * 3) : 3;
      for (let i = 0; i < ropeCount; i++) {
        const angle = (i / ropeCount) * Math.PI * 2 + (rng ? rng.next() * 0.3 : 0);
        const dist = Math.max(width, depth) * 0.6;

        const rope = MeshBuilder.CreateCylinder(
          `${id}_rope_${i}`,
          { height: dist, diameter: 0.01 },
          scene
        );

        const startX = Math.cos(angle + rotation) * (width / 4);
        const startZ = Math.sin(angle + rotation) * (depth / 4);
        const endX = Math.cos(angle + rotation) * dist;
        const endZ = Math.sin(angle + rotation) * dist;

        rope.position = new Vector3(
          posX + (startX + endX) / 2,
          posY + 0.1,
          posZ + (startZ + endZ) / 2
        );
        rope.rotation.x = Math.PI / 2 - 0.2;
        rope.rotation.y = angle + rotation;
        rope.material = ropeMat;
        meshes.push(rope);

        // Stake at end
        const stake = MeshBuilder.CreateCylinder(
          `${id}_stake_${i}`,
          { height: 0.15, diameterTop: 0.01, diameterBottom: 0.02 },
          scene
        );
        stake.position = new Vector3(posX + endX, posY + 0.05, posZ + endZ);
        stake.material = grommetMat;
        meshes.push(stake);
      }
    }

    // Add holes if damaged
    if (hasHoles && rng) {
      const holeMat = new PBRMaterial(`tarp_hole_${id}`, scene);
      holeMat.albedoColor = new Color3(0.05, 0.05, 0.05);
      holeMat.metallic = 0;
      holeMat.roughness = 1;
      holeMat.alpha = 0.3;
      materials.push(holeMat);

      const holeCount = 2 + Math.floor(rng.next() * 4);
      for (let i = 0; i < holeCount; i++) {
        const holeX = (rng.next() - 0.5) * width * 0.7;
        const holeZ = (rng.next() - 0.5) * depth * 0.7;
        const holeSize = 0.05 + rng.next() * 0.15;

        const hole = MeshBuilder.CreateDisc(
          `${id}_hole_${i}`,
          { radius: holeSize, tessellation: 6 },
          scene
        );
        hole.position = new Vector3(
          posX + Math.cos(rotation) * holeX - Math.sin(rotation) * holeZ,
          posY + 0.03 + (type === 'draped' ? 0.2 : 0),
          posZ + Math.sin(rotation) * holeX + Math.cos(rotation) * holeZ
        );
        hole.rotation.x = -Math.PI / 2;
        hole.material = holeMat;
        meshes.push(hole);
      }
    }

    // Add weathering details
    if (condition < 0.6 && rng) {
      const stainMat = new PBRMaterial(`tarp_stain_${id}`, scene);
      stainMat.albedoColor = new Color3(0.2, 0.18, 0.12);
      stainMat.metallic = 0;
      stainMat.roughness = 0.95;
      stainMat.alpha = 0.4;
      materials.push(stainMat);

      const stainCount = 2 + Math.floor(rng.next() * 3);
      for (let i = 0; i < stainCount; i++) {
        const stainX = (rng.next() - 0.5) * width * 0.8;
        const stainZ = (rng.next() - 0.5) * depth * 0.8;
        const stainSize = 0.1 + rng.next() * 0.2;

        const stain = MeshBuilder.CreateDisc(
          `${id}_stain_${i}`,
          { radius: stainSize, tessellation: 8 },
          scene
        );
        stain.position = new Vector3(
          posX + Math.cos(rotation) * stainX - Math.sin(rotation) * stainZ,
          posY + 0.025,
          posZ + Math.sin(rotation) * stainX + Math.cos(rotation) * stainZ
        );
        stain.rotation.x = -Math.PI / 2;
        stain.material = stainMat;
        meshes.push(stain);
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
    type,
    width,
    depth,
    color,
    hasHoles,
    isTied,
    condition,
    rotation,
    seed,
  ]);

  return null;
}
