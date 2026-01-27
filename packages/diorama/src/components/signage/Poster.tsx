/**
 * Poster - Wall-mounted posters and flyers
 *
 * Posters, advertisements, and flyers for urban decoration.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type PosterType =
  | 'movie'
  | 'concert'
  | 'political'
  | 'advertisement'
  | 'wanted'
  | 'graffiti';
export type PosterSize = 'small' | 'medium' | 'large' | 'banner';

export interface PosterProps {
  id: string;
  position: Vector3;
  /** Poster type */
  type?: PosterType;
  /** Poster size */
  size?: PosterSize;
  /** Is torn/weathered */
  isTorn?: boolean;
  /** Is layered (multiple posters) */
  isLayered?: boolean;
  /** Wall normal direction (radians) */
  rotation?: number;
  /** Condition 0-1 */
  condition?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Poster({
  id,
  position,
  type = 'advertisement',
  size = 'medium',
  isTorn = false,
  isLayered = false,
  rotation = 0,
  condition = 0.8,
  seed,
}: PosterProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    // Size dimensions
    let width: number;
    let height: number;
    switch (size) {
      case 'small':
        width = 0.2;
        height = 0.3;
        break;
      case 'medium':
        width = 0.4;
        height = 0.6;
        break;
      case 'large':
        width = 0.7;
        height = 1.0;
        break;
      case 'banner':
        width = 1.5;
        height = 0.5;
        break;
      default:
        width = 0.4;
        height = 0.6;
    }

    // Get poster color based on type
    const getTypeColor = (posterType: PosterType): Color3 => {
      switch (posterType) {
        case 'movie':
          return new Color3(0.8, 0.2, 0.15);
        case 'concert':
          return new Color3(0.9, 0.5, 0.1);
        case 'political':
          return new Color3(0.15, 0.3, 0.6);
        case 'advertisement':
          return new Color3(0.85, 0.8, 0.2);
        case 'wanted':
          return new Color3(0.9, 0.85, 0.7);
        case 'graffiti':
          return new Color3(0.3, 0.7, 0.4);
        default:
          return new Color3(0.8, 0.75, 0.7);
      }
    };

    const conditionFactor = condition;

    // Layered posters underneath
    if (isLayered) {
      const layerCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
      for (let l = 0; l < layerCount; l++) {
        const layerMat = new PBRMaterial(`poster_layer_${id}_${l}`, scene);
        const layerColor = new Color3(
          0.5 + (rng ? rng.next() * 0.4 : 0.2),
          0.5 + (rng ? rng.next() * 0.4 : 0.2),
          0.5 + (rng ? rng.next() * 0.4 : 0.2)
        ).scale(conditionFactor * 0.7);
        layerMat.albedoColor = layerColor;
        layerMat.metallic = 0;
        layerMat.roughness = 0.9;

        const layerOffset = (l + 1) * 0.002;
        const layerW = width * (1 + (rng ? (rng.next() - 0.5) * 0.3 : 0.1));
        const layerH = height * (1 + (rng ? (rng.next() - 0.5) * 0.3 : 0.1));
        const layerX = rng ? (rng.next() - 0.5) * 0.1 : 0;
        const layerY = rng ? (rng.next() - 0.5) * 0.1 : 0;

        const layer = MeshBuilder.CreatePlane(
          `${id}_layer_${l}`,
          { width: layerW, height: layerH },
          scene
        );
        layer.position = new Vector3(
          posX + Math.cos(rotation) * layerOffset + Math.sin(rotation) * layerX,
          posY + layerY,
          posZ - Math.sin(rotation) * layerOffset + Math.cos(rotation) * layerX
        );
        layer.rotation.y = rotation;
        layer.material = layerMat;
        meshes.push(layer);
      }
    }

    // Main poster
    const posterMat = new PBRMaterial(`poster_main_${id}`, scene);
    posterMat.albedoColor = getTypeColor(type).scale(conditionFactor);
    posterMat.metallic = 0;
    posterMat.roughness = 0.85;

    const poster = MeshBuilder.CreatePlane(`${id}_poster`, { width: width, height: height }, scene);
    poster.position = new Vector3(posX, posY, posZ);
    poster.rotation.y = rotation;
    poster.material = posterMat;
    meshes.push(poster);

    // Torn effect
    if (isTorn) {
      const tearMat = new PBRMaterial(`poster_tear_${id}`, scene);
      tearMat.albedoColor = new Color3(0.9, 0.88, 0.85).scale(conditionFactor * 0.9);
      tearMat.metallic = 0;
      tearMat.roughness = 0.95;

      // Create torn edges using multiple small planes
      const tearCount = 3 + (rng ? Math.floor(rng.next() * 4) : 2);
      for (let t = 0; t < tearCount; t++) {
        const tearW = 0.03 + (rng ? rng.next() * 0.05 : 0.02);
        const tearH = 0.05 + (rng ? rng.next() * 0.1 : 0.05);

        // Random position along edges
        let tearX = 0;
        let tearY = 0;
        const edge = rng ? Math.floor(rng.next() * 4) : t % 4;
        switch (edge) {
          case 0: // Top
            tearX = (rng ? rng.next() - 0.5 : 0) * width * 0.8;
            tearY = height / 2 - tearH / 2;
            break;
          case 1: // Bottom
            tearX = (rng ? rng.next() - 0.5 : 0) * width * 0.8;
            tearY = -height / 2 + tearH / 2;
            break;
          case 2: // Left
            tearX = -width / 2 + tearW / 2;
            tearY = (rng ? rng.next() - 0.5 : 0) * height * 0.8;
            break;
          case 3: // Right
            tearX = width / 2 - tearW / 2;
            tearY = (rng ? rng.next() - 0.5 : 0) * height * 0.8;
            break;
        }

        const tear = MeshBuilder.CreatePlane(
          `${id}_tear_${t}`,
          { width: tearW, height: tearH },
          scene
        );
        tear.position = new Vector3(
          posX - 0.002 + Math.sin(rotation) * tearX,
          posY + tearY,
          posZ + Math.cos(rotation) * tearX
        );
        tear.rotation.y = rotation;
        tear.rotation.z = rng ? (rng.next() - 0.5) * 0.3 : 0;
        tear.material = tearMat;
        meshes.push(tear);
      }
    }

    // Text/content simulation (simple rectangles)
    const contentMat = new PBRMaterial(`poster_content_${id}`, scene);
    contentMat.albedoColor = new Color3(0.1, 0.1, 0.12);
    contentMat.metallic = 0;
    contentMat.roughness = 0.9;

    // Title area
    const titleW = width * 0.7;
    const titleH = height * 0.15;
    const title = MeshBuilder.CreatePlane(`${id}_title`, { width: titleW, height: titleH }, scene);
    title.position = new Vector3(posX - 0.001, posY + height * 0.3, posZ);
    title.rotation.y = rotation;
    title.material = contentMat;
    meshes.push(title);

    // Content lines
    const lineCount = 2 + (rng ? Math.floor(rng.next() * 2) : 1);
    for (let ln = 0; ln < lineCount; ln++) {
      const lineW = width * (0.4 + (rng ? rng.next() * 0.3 : 0.2));
      const line = MeshBuilder.CreatePlane(
        `${id}_line_${ln}`,
        { width: lineW, height: height * 0.03 },
        scene
      );
      line.position = new Vector3(posX - 0.001, posY - height * 0.2 - ln * height * 0.08, posZ);
      line.rotation.y = rotation;
      line.material = contentMat;
      meshes.push(line);
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
    };
  }, [scene, id, posX, posY, posZ, type, size, isTorn, isLayered, rotation, condition, seed]);

  return null;
}
