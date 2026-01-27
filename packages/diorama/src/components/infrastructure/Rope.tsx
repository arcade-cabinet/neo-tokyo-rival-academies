/**
 * Rope - Ropes and cables
 *
 * Ropes, cables, and hanging lines.
 */

import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  PBRMaterial,
  Quaternion,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type RopeType = 'hemp' | 'nylon' | 'cable' | 'chain' | 'wire';
export type RopeStyle = 'straight' | 'hanging' | 'coiled' | 'tied' | 'draped';

export interface RopeProps {
  id: string;
  position: Vector3;
  /** Rope type */
  type?: RopeType;
  /** Display style */
  style?: RopeStyle;
  /** Length */
  length?: number;
  /** Thickness */
  thickness?: number;
  /** End position (for hanging/draped styles) */
  endPosition?: Vector3;
  /** Sag amount for hanging */
  sag?: number;
  /** Condition 0-1 */
  condition?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Rope({
  id,
  position,
  type = 'hemp',
  style = 'hanging',
  length = 2,
  thickness = 0.02,
  endPosition,
  sag = 0.3,
  condition = 0.8,
  rotation = 0,
  seed,
}: RopeProps) {
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

    // Material
    const ropeMat = new PBRMaterial(`rope_${id}`, scene);

    switch (type) {
      case 'hemp':
        ropeMat.albedoColor = new Color3(0.55, 0.45, 0.3).scale(conditionFactor);
        ropeMat.metallic = 0;
        ropeMat.roughness = 0.95;
        break;
      case 'nylon':
        ropeMat.albedoColor = new Color3(0.9, 0.85, 0.75).scale(conditionFactor);
        ropeMat.metallic = 0.1;
        ropeMat.roughness = 0.6;
        break;
      case 'cable':
        ropeMat.albedoColor = new Color3(0.15, 0.15, 0.18);
        ropeMat.metallic = 0.3;
        ropeMat.roughness = 0.7;
        break;
      case 'chain':
        ropeMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
        ropeMat.metallic = 0.85;
        ropeMat.roughness = 0.4;
        break;
      case 'wire':
        ropeMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(conditionFactor);
        ropeMat.metallic = 0.9;
        ropeMat.roughness = 0.3;
        break;
    }

    if (style === 'straight') {
      // Simple straight rope/cable
      const rope = MeshBuilder.CreateCylinder(
        `${id}_rope`,
        { height: length, diameter: thickness },
        scene
      );
      rope.position = new Vector3(posX, posY + length / 2, posZ);
      rope.material = ropeMat;
      meshes.push(rope);
    } else if (style === 'hanging' || style === 'draped') {
      // Catenary curve approximation
      const endPos = endPosition || new Vector3(posX + length, posY, posZ);
      const midX = (posX + endPos.x) / 2;
      const midY = Math.min(posY, endPos.y) - sag;
      const midZ = (posZ + endPos.z) / 2;

      const segmentCount = 12;
      const points: Vector3[] = [];

      // Generate catenary points
      for (let i = 0; i <= segmentCount; i++) {
        const t = i / segmentCount;

        // Quadratic bezier approximation
        const x = (1 - t) * (1 - t) * posX + 2 * (1 - t) * t * midX + t * t * endPos.x;
        const y = (1 - t) * (1 - t) * posY + 2 * (1 - t) * t * midY + t * t * endPos.y;
        const z = (1 - t) * (1 - t) * posZ + 2 * (1 - t) * t * midZ + t * t * endPos.z;

        points.push(new Vector3(x, y, z));
      }

      // Create segments
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const segLength = Vector3.Distance(start, end);

        const segment = MeshBuilder.CreateCylinder(
          `${id}_seg_${i}`,
          { height: segLength, diameter: thickness },
          scene
        );

        // Position at midpoint
        segment.position = new Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2,
          (start.z + end.z) / 2
        );

        // Rotate to align with segment direction
        const direction = end.subtract(start).normalize();
        const up = new Vector3(0, 1, 0);
        const angle = Math.acos(Vector3.Dot(up, direction));
        const axis = Vector3.Cross(up, direction).normalize();

        if (axis.length() > 0.001) {
          segment.rotationQuaternion = Quaternion.RotationAxis(axis, angle);
        }

        segment.material = ropeMat;
        meshes.push(segment);
      }

      // For chain type, add links
      if (type === 'chain') {
        const linkCount = Math.floor(length * 5);
        for (let l = 0; l < linkCount; l++) {
          const t = l / linkCount;
          const lx = (1 - t) * (1 - t) * posX + 2 * (1 - t) * t * midX + t * t * endPos.x;
          const ly = (1 - t) * (1 - t) * posY + 2 * (1 - t) * t * midY + t * t * endPos.y;
          const lz = (1 - t) * (1 - t) * posZ + 2 * (1 - t) * t * midZ + t * t * endPos.z;

          const link = MeshBuilder.CreateTorus(
            `${id}_link_${l}`,
            {
              diameter: thickness * 2,
              thickness: thickness * 0.4,
              tessellation: 8,
            },
            scene
          );
          link.position = new Vector3(lx, ly, lz);
          link.rotation.x = l % 2 === 0 ? 0 : Math.PI / 2;
          link.material = ropeMat;
          meshes.push(link);
        }
      }
    } else if (style === 'coiled') {
      // Coiled rope on ground
      const coilRadius = length / (Math.PI * 6);
      const coilCount = 4 + (rng ? Math.floor(rng.next() * 3) : 2);

      for (let c = 0; c < coilCount; c++) {
        const coilY = posY + c * thickness * 1.1;
        const coilR = coilRadius + (rng ? (rng.next() - 0.5) * 0.05 : 0);

        const coil = MeshBuilder.CreateTorus(
          `${id}_coil_${c}`,
          { diameter: coilR * 2, thickness: thickness, tessellation: 24 },
          scene
        );
        coil.position = new Vector3(posX, coilY, posZ);
        coil.rotation.x = Math.PI / 2;
        coil.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.1 : 0);
        coil.material = ropeMat;
        meshes.push(coil);
      }

      // Loose end
      const endLength = length * 0.2;
      const looseEnd = MeshBuilder.CreateCylinder(
        `${id}_end`,
        { height: endLength, diameter: thickness },
        scene
      );
      looseEnd.position = new Vector3(
        posX + coilRadius,
        posY + coilCount * thickness * 1.1 + endLength / 2,
        posZ
      );
      looseEnd.rotation.z = Math.PI / 6;
      looseEnd.material = ropeMat;
      meshes.push(looseEnd);
    } else if (style === 'tied') {
      // Tied knot
      const knotRadius = thickness * 3;

      // Main knot ball
      const knot = MeshBuilder.CreateSphere(
        `${id}_knot`,
        { diameter: knotRadius * 2, segments: 12 },
        scene
      );
      knot.position = new Vector3(posX, posY, posZ);
      knot.scaling = new Vector3(1, 0.7, 1);
      knot.material = ropeMat;
      meshes.push(knot);

      // Rope ends
      for (let e = 0; e < 2; e++) {
        const endAngle = e * Math.PI + (rng ? (rng.next() - 0.5) * 0.5 : 0);
        const endLength = length * 0.4;

        const ropeEnd = MeshBuilder.CreateCylinder(
          `${id}_end_${e}`,
          { height: endLength, diameter: thickness },
          scene
        );
        ropeEnd.position = new Vector3(
          posX + Math.cos(endAngle) * knotRadius,
          posY - endLength / 2,
          posZ + Math.sin(endAngle) * knotRadius
        );
        ropeEnd.rotation.z = (e === 0 ? 1 : -1) * 0.3;
        ropeEnd.material = ropeMat;
        meshes.push(ropeEnd);
      }
    }

    // Frayed ends for hemp rope in poor condition
    if (type === 'hemp' && condition < 0.6) {
      const frayMat = new PBRMaterial(`rope_fray_${id}`, scene);
      frayMat.albedoColor = ropeMat.albedoColor.scale(1.1);
      frayMat.metallic = 0;
      frayMat.roughness = 1;

      const frayCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
      for (let f = 0; f < frayCount; f++) {
        const frayAngle = (rng ? rng.next() : f / frayCount) * Math.PI * 2;
        const frayLen = 0.03 + (rng ? rng.next() * 0.03 : 0.02);

        const fray = MeshBuilder.CreateCylinder(
          `${id}_fray_${f}`,
          {
            height: frayLen,
            diameterTop: 0.001,
            diameterBottom: thickness * 0.3,
          },
          scene
        );
        fray.position = new Vector3(
          posX + Math.cos(frayAngle) * thickness * 0.3,
          posY - frayLen / 2,
          posZ + Math.sin(frayAngle) * thickness * 0.3
        );
        fray.rotation.x = rng ? (rng.next() - 0.5) * 0.5 : 0;
        fray.rotation.z = rng ? (rng.next() - 0.5) * 0.5 : 0;
        fray.material = frayMat;
        meshes.push(fray);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      ropeMat.dispose();
    };
  }, [
    scene,
    id,
    posX,
    posY,
    posZ,
    type,
    style,
    length,
    thickness,
    endPosition,
    sag,
    condition,
    rotation,
    seed,
  ]);

  return null;
}
