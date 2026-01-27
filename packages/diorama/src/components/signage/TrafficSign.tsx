/**
 * TrafficSign - Road and street signs
 *
 * Traffic signs, street signs, and directional markers.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type TrafficSignType =
  | 'stop'
  | 'yield'
  | 'oneway'
  | 'speed'
  | 'warning'
  | 'street'
  | 'parking'
  | 'noEntry';
export type TrafficSignCondition = 'new' | 'weathered' | 'damaged' | 'vandalized';

export interface TrafficSignProps {
  id: string;
  position: Vector3;
  /** Sign type */
  type?: TrafficSignType;
  /** Sign condition */
  signCondition?: TrafficSignCondition;
  /** Post height */
  postHeight?: number;
  /** Is tilted */
  isTilted?: boolean;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function TrafficSign({
  id,
  position,
  type = 'stop',
  signCondition = 'weathered',
  postHeight = 2.5,
  isTilted = false,
  rotation = 0,
  seed,
}: TrafficSignProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    // Condition factor
    let conditionFactor = 1.0;
    switch (signCondition) {
      case 'new':
        conditionFactor = 1.0;
        break;
      case 'weathered':
        conditionFactor = 0.8;
        break;
      case 'damaged':
        conditionFactor = 0.6;
        break;
      case 'vandalized':
        conditionFactor = 0.5;
        break;
    }

    // Materials
    const postMat = new PBRMaterial(`trafficsign_post_${id}`, scene);
    postMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
    postMat.metallic = 0.8;
    postMat.roughness = 0.4;

    const signMat = new PBRMaterial(`trafficsign_sign_${id}`, scene);

    // Set sign color based on type
    switch (type) {
      case 'stop':
        signMat.albedoColor = new Color3(0.85, 0.1, 0.1).scale(conditionFactor);
        break;
      case 'yield':
        signMat.albedoColor = new Color3(0.85, 0.1, 0.1).scale(conditionFactor);
        break;
      case 'oneway':
        signMat.albedoColor = new Color3(0.1, 0.1, 0.12).scale(conditionFactor);
        break;
      case 'speed':
        signMat.albedoColor = new Color3(0.95, 0.95, 0.95).scale(conditionFactor);
        break;
      case 'warning':
        signMat.albedoColor = new Color3(0.95, 0.85, 0.1).scale(conditionFactor);
        break;
      case 'street':
        signMat.albedoColor = new Color3(0.15, 0.45, 0.15).scale(conditionFactor);
        break;
      case 'parking':
        signMat.albedoColor = new Color3(0.15, 0.35, 0.7).scale(conditionFactor);
        break;
      case 'noEntry':
        signMat.albedoColor = new Color3(0.85, 0.1, 0.1).scale(conditionFactor);
        break;
    }
    signMat.metallic = 0.3;
    signMat.roughness = 0.5;

    // Calculate tilt
    const tiltX = isTilted ? (rng ? (rng.next() - 0.5) * 0.15 : 0.05) : 0;
    const tiltZ = isTilted ? (rng ? (rng.next() - 0.5) * 0.15 : -0.05) : 0;

    // Post
    const postDiameter = 0.08;
    const post = MeshBuilder.CreateCylinder(
      `${id}_post`,
      { height: postHeight, diameter: postDiameter },
      scene
    );
    post.position = new Vector3(posX, posY + postHeight / 2, posZ);
    post.rotation.x = tiltX;
    post.rotation.z = tiltZ;
    post.material = postMat;
    meshes.push(post);

    // Sign based on type
    const signY = posY + postHeight - 0.2;
    let signMesh: AbstractMesh;

    switch (type) {
      case 'stop': {
        // Octagon shape approximated with cylinder
        signMesh = MeshBuilder.CreateCylinder(
          `${id}_sign`,
          { height: 0.02, diameter: 0.6, tessellation: 8 },
          scene
        );
        signMesh.rotation.x = Math.PI / 2;
        break;
      }
      case 'yield': {
        // Triangle (using disc with 3 tessellations)
        signMesh = MeshBuilder.CreateDisc(`${id}_sign`, { radius: 0.35, tessellation: 3 }, scene);
        signMesh.rotation.z = Math.PI;
        break;
      }
      case 'warning': {
        // Diamond (rotated square)
        signMesh = MeshBuilder.CreateBox(
          `${id}_sign`,
          { width: 0.5, height: 0.5, depth: 0.02 },
          scene
        );
        signMesh.rotation.z = Math.PI / 4;
        break;
      }
      case 'street': {
        // Rectangle (street name sign)
        signMesh = MeshBuilder.CreateBox(
          `${id}_sign`,
          { width: 0.8, height: 0.2, depth: 0.02 },
          scene
        );
        break;
      }
      default: {
        // Default rectangular sign
        signMesh = MeshBuilder.CreateBox(
          `${id}_sign`,
          { width: 0.5, height: 0.5, depth: 0.02 },
          scene
        );
      }
    }

    signMesh.position = new Vector3(
      posX + Math.sin(tiltX) * (postHeight - 0.2),
      signY + Math.cos(tiltX) * Math.cos(tiltZ) * 0.3,
      posZ + Math.sin(tiltZ) * (postHeight - 0.2)
    );
    signMesh.rotation.y = rotation;
    signMesh.rotation.x += tiltX;
    signMesh.rotation.z += tiltZ;
    signMesh.material = signMat;
    meshes.push(signMesh);

    // Add text/symbol placeholder
    const textMat = new PBRMaterial(`trafficsign_text_${id}`, scene);
    textMat.albedoColor = new Color3(0.95, 0.95, 0.95).scale(conditionFactor);
    textMat.metallic = 0.1;
    textMat.roughness = 0.6;

    if (type === 'stop' || type === 'street' || type === 'oneway') {
      const textPlane = MeshBuilder.CreatePlane(
        `${id}_text`,
        {
          width: type === 'street' ? 0.6 : 0.35,
          height: type === 'street' ? 0.12 : 0.1,
        },
        scene
      );
      textPlane.position = new Vector3(
        signMesh.position.x - Math.sin(rotation) * 0.015,
        signMesh.position.y,
        signMesh.position.z - Math.cos(rotation) * 0.015
      );
      textPlane.rotation.y = rotation;
      textPlane.material = textMat;
      meshes.push(textPlane);
    }

    // Damage effects
    if (signCondition === 'damaged' || signCondition === 'vandalized') {
      const dentCount = 1 + (rng ? Math.floor(rng.next() * 2) : 1);
      const dentMat = new PBRMaterial(`trafficsign_dent_${id}`, scene);
      dentMat.albedoColor = new Color3(0.3, 0.32, 0.35);
      dentMat.metallic = 0.6;
      dentMat.roughness = 0.7;

      for (let d = 0; d < dentCount; d++) {
        const dentSize = 0.05 + (rng ? rng.next() * 0.05 : 0.02);
        const dentX = rng ? (rng.next() - 0.5) * 0.3 : 0;
        const dentY = rng ? (rng.next() - 0.5) * 0.3 : 0;

        const dent = MeshBuilder.CreateSphere(
          `${id}_dent_${d}`,
          { diameter: dentSize, segments: 8 },
          scene
        );
        dent.position = new Vector3(
          signMesh.position.x + Math.sin(rotation) * dentX,
          signMesh.position.y + dentY,
          signMesh.position.z + Math.cos(rotation) * dentX
        );
        dent.scaling = new Vector3(1, 1, 0.3);
        dent.material = dentMat;
        meshes.push(dent);
      }
    }

    // Vandalized effects (stickers, spray)
    if (signCondition === 'vandalized') {
      const stickerMat = new PBRMaterial(`trafficsign_sticker_${id}`, scene);
      stickerMat.albedoColor = new Color3(
        0.5 + (rng ? rng.next() * 0.5 : 0.3),
        0.5 + (rng ? rng.next() * 0.5 : 0.3),
        0.5 + (rng ? rng.next() * 0.5 : 0.3)
      );
      stickerMat.metallic = 0;
      stickerMat.roughness = 0.8;

      const stickerCount = 1 + (rng ? Math.floor(rng.next() * 3) : 1);
      for (let s = 0; s < stickerCount; s++) {
        const stickerW = 0.05 + (rng ? rng.next() * 0.08 : 0.03);
        const stickerH = 0.03 + (rng ? rng.next() * 0.05 : 0.02);
        const sx = rng ? (rng.next() - 0.5) * 0.25 : 0;
        const sy = rng ? (rng.next() - 0.5) * 0.25 : 0;

        const sticker = MeshBuilder.CreatePlane(
          `${id}_sticker_${s}`,
          { width: stickerW, height: stickerH },
          scene
        );
        sticker.position = new Vector3(
          signMesh.position.x - Math.sin(rotation) * 0.02 + Math.cos(rotation) * sx,
          signMesh.position.y + sy,
          signMesh.position.z - Math.cos(rotation) * 0.02 - Math.sin(rotation) * sx
        );
        sticker.rotation.y = rotation;
        sticker.rotation.z = rng ? (rng.next() - 0.5) * 0.5 : 0;
        sticker.material = stickerMat;
        meshes.push(sticker);
      }
    }

    // Base plate
    const baseMat = new PBRMaterial(`trafficsign_base_${id}`, scene);
    baseMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
    baseMat.metallic = 0.7;
    baseMat.roughness = 0.5;

    const base = MeshBuilder.CreateCylinder(`${id}_base`, { height: 0.05, diameter: 0.25 }, scene);
    base.position = new Vector3(posX, posY + 0.025, posZ);
    base.material = baseMat;
    meshes.push(base);

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      postMat.dispose();
      signMat.dispose();
      baseMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, signCondition, postHeight, isTilted, rotation, seed]);

  return null;
}
