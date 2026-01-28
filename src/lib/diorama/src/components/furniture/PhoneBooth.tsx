/**
 * PhoneBooth - Public telephone booths
 *
 * Phone booths and telephone kiosks for urban environments.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type PhoneBoothType = 'british' | 'japanese' | 'modern' | 'kiosk' | 'wall';

export interface PhoneBoothProps {
  id: string;
  position: Vector3;
  /** Booth type */
  type?: PhoneBoothType;
  /** Is working */
  isWorking?: boolean;
  /** Has light */
  hasLight?: boolean;
  /** Condition 0-1 */
  condition?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function PhoneBooth({
  id,
  position,
  type = 'japanese',
  isWorking = false,
  hasLight = true,
  condition = 0.7,
  rotation = 0,
  seed,
}: PhoneBoothProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const _rng = seed !== undefined ? createSeededRandom(seed) : null;

    const conditionFactor = condition;

    // Materials
    const frameMat = new PBRMaterial(`phonebooth_frame_${id}`, scene);
    const glassMat = new PBRMaterial(`phonebooth_glass_${id}`, scene);
    const phoneMat = new PBRMaterial(`phonebooth_phone_${id}`, scene);
    const roofMat = new PBRMaterial(`phonebooth_roof_${id}`, scene);

    glassMat.albedoColor = new Color3(0.6, 0.7, 0.8);
    glassMat.metallic = 0.1;
    glassMat.roughness = 0.1;
    glassMat.alpha = 0.5;

    phoneMat.albedoColor = new Color3(0.15, 0.15, 0.18);
    phoneMat.metallic = 0.2;
    phoneMat.roughness = 0.6;

    if (type === 'british') {
      // Classic red British phone box
      frameMat.albedoColor = new Color3(0.8, 0.1, 0.1).scale(conditionFactor);
      frameMat.metallic = 0.3;
      frameMat.roughness = 0.6;
      roofMat.albedoColor = new Color3(0.7, 0.08, 0.08).scale(conditionFactor);
      roofMat.metallic = 0.3;
      roofMat.roughness = 0.5;

      const width = 0.9;
      const depth = 0.9;
      const height = 2.5;

      // Frame posts
      for (let x = -1; x <= 1; x += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const post = MeshBuilder.CreateBox(
            `${id}_post_${x}_${z}`,
            { width: 0.08, height: height, depth: 0.08 },
            scene
          );
          post.position = new Vector3(
            posX +
              Math.cos(rotation) * ((x * width) / 2.3) -
              Math.sin(rotation) * ((z * depth) / 2.3),
            posY + height / 2,
            posZ -
              Math.sin(rotation) * ((x * width) / 2.3) -
              Math.cos(rotation) * ((z * depth) / 2.3)
          );
          post.rotation.y = rotation;
          post.material = frameMat;
          meshes.push(post);
        }
      }

      // Glass panels
      for (const side of [-1, 1]) {
        // Side panels
        const sideGlass = MeshBuilder.CreateBox(
          `${id}_sideglass_${side}`,
          { width: 0.02, height: height * 0.7, depth: depth * 0.7 },
          scene
        );
        sideGlass.position = new Vector3(
          posX + Math.cos(rotation) * ((side * width) / 2.2),
          posY + height * 0.45,
          posZ - Math.sin(rotation) * ((side * width) / 2.2)
        );
        sideGlass.rotation.y = rotation;
        sideGlass.material = glassMat;
        meshes.push(sideGlass);
      }

      // Front/back panels
      for (const side of [-1, 1]) {
        if (side === 1) continue; // Door side
        const fbGlass = MeshBuilder.CreateBox(
          `${id}_fbglass_${side}`,
          { width: width * 0.7, height: height * 0.7, depth: 0.02 },
          scene
        );
        fbGlass.position = new Vector3(
          posX - Math.sin(rotation) * ((side * depth) / 2.2),
          posY + height * 0.45,
          posZ - Math.cos(rotation) * ((side * depth) / 2.2)
        );
        fbGlass.rotation.y = rotation;
        fbGlass.material = glassMat;
        meshes.push(fbGlass);
      }

      // Crown roof
      const roof = MeshBuilder.CreateBox(
        `${id}_roof`,
        { width: width + 0.1, height: 0.25, depth: depth + 0.1 },
        scene
      );
      roof.position = new Vector3(posX, posY + height + 0.125, posZ);
      roof.rotation.y = rotation;
      roof.material = roofMat;
      meshes.push(roof);
    } else if (type === 'japanese') {
      // Gray/green Japanese phone booth
      frameMat.albedoColor = new Color3(0.4, 0.5, 0.45).scale(conditionFactor);
      frameMat.metallic = 0.5;
      frameMat.roughness = 0.4;
      roofMat.albedoColor = new Color3(0.35, 0.45, 0.4).scale(conditionFactor);
      roofMat.metallic = 0.4;
      roofMat.roughness = 0.5;

      const width = 0.85;
      const depth = 0.85;
      const height = 2.2;

      // Base
      const base = MeshBuilder.CreateBox(
        `${id}_base`,
        { width: width, height: 0.1, depth: depth },
        scene
      );
      base.position = new Vector3(posX, posY + 0.05, posZ);
      base.rotation.y = rotation;
      base.material = frameMat;
      meshes.push(base);

      // Frame
      const frame = MeshBuilder.CreateBox(
        `${id}_frame`,
        { width: width, height: height, depth: depth },
        scene
      );
      frame.position = new Vector3(posX, posY + height / 2 + 0.1, posZ);
      frame.rotation.y = rotation;
      frame.material = frameMat;
      meshes.push(frame);

      // Glass panels (inset)
      for (const side of [-1, 0, 1]) {
        const glass = MeshBuilder.CreateBox(
          `${id}_glass_${side}`,
          {
            width: side === 0 ? width * 0.75 : 0.02,
            height: height * 0.75,
            depth: side === 0 ? 0.02 : depth * 0.75,
          },
          scene
        );
        if (side === 0) {
          // Front
          glass.position = new Vector3(
            posX - Math.sin(rotation) * (depth / 2 - 0.02),
            posY + height * 0.5,
            posZ - Math.cos(rotation) * (depth / 2 - 0.02)
          );
        } else {
          // Sides
          glass.position = new Vector3(
            posX + Math.cos(rotation) * (side * (width / 2 - 0.02)),
            posY + height * 0.5,
            posZ - Math.sin(rotation) * (side * (width / 2 - 0.02))
          );
        }
        glass.rotation.y = rotation;
        glass.material = glassMat;
        meshes.push(glass);
      }

      // Roof
      const roof = MeshBuilder.CreateBox(
        `${id}_roof`,
        { width: width + 0.15, height: 0.08, depth: depth + 0.15 },
        scene
      );
      roof.position = new Vector3(posX, posY + height + 0.14, posZ);
      roof.rotation.y = rotation;
      roof.material = roofMat;
      meshes.push(roof);
    } else if (type === 'modern') {
      // Modern metal/glass booth
      frameMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(conditionFactor);
      frameMat.metallic = 0.8;
      frameMat.roughness = 0.3;
      roofMat.albedoColor = new Color3(0.55, 0.57, 0.6).scale(conditionFactor);
      roofMat.metallic = 0.7;
      roofMat.roughness = 0.35;

      const width = 0.8;
      const depth = 0.6;
      const height = 2.3;

      // Minimal frame
      const frame = MeshBuilder.CreateBox(
        `${id}_frame`,
        { width: width, height: 0.05, depth: depth },
        scene
      );
      frame.position = new Vector3(posX, posY + height, posZ);
      frame.rotation.y = rotation;
      frame.material = frameMat;
      meshes.push(frame);

      // Glass sides (curved effect with multiple panels)
      const panelCount = 5;
      for (let p = 0; p < panelCount; p++) {
        const angle = (p / (panelCount - 1) - 0.5) * Math.PI * 0.6;
        const px = Math.sin(angle) * (width / 2 + 0.05);
        const pz = Math.cos(angle) * (depth / 2) - depth / 2;

        const panel = MeshBuilder.CreateBox(
          `${id}_panel_${p}`,
          { width: 0.02, height: height, depth: depth * 0.25 },
          scene
        );
        panel.position = new Vector3(
          posX + Math.cos(rotation) * px - Math.sin(rotation) * pz,
          posY + height / 2,
          posZ - Math.sin(rotation) * px - Math.cos(rotation) * pz
        );
        panel.rotation.y = rotation + angle;
        panel.material = glassMat;
        meshes.push(panel);
      }
    } else if (type === 'kiosk') {
      // Open kiosk style
      frameMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
      frameMat.metallic = 0.7;
      frameMat.roughness = 0.4;
      roofMat.albedoColor = new Color3(0.25, 0.3, 0.6).scale(conditionFactor);
      roofMat.metallic = 0.5;
      roofMat.roughness = 0.5;

      const width = 0.6;
      const depth = 0.4;
      const height = 2.0;

      // Post
      const post = MeshBuilder.CreateCylinder(
        `${id}_post`,
        { height: height, diameter: 0.1 },
        scene
      );
      post.position = new Vector3(posX, posY + height / 2, posZ);
      post.material = frameMat;
      meshes.push(post);

      // Hood
      const hood = MeshBuilder.CreateBox(
        `${id}_hood`,
        { width: width, height: 0.05, depth: depth },
        scene
      );
      hood.position = new Vector3(
        posX - Math.sin(rotation) * 0.15,
        posY + height - 0.3,
        posZ - Math.cos(rotation) * 0.15
      );
      hood.rotation.y = rotation;
      hood.rotation.x = -0.2;
      hood.material = roofMat;
      meshes.push(hood);
    } else {
      // Wall-mounted phone
      frameMat.albedoColor = new Color3(0.55, 0.57, 0.6).scale(conditionFactor);
      frameMat.metallic = 0.6;
      frameMat.roughness = 0.4;

      const width = 0.35;
      const height = 0.5;
      const depth = 0.15;

      // Backing plate
      const backing = MeshBuilder.CreateBox(
        `${id}_backing`,
        { width: width, height: height, depth: 0.02 },
        scene
      );
      backing.position = new Vector3(posX, posY + 1.4, posZ);
      backing.rotation.y = rotation;
      backing.material = frameMat;
      meshes.push(backing);

      // Phone unit
      const phone = MeshBuilder.CreateBox(
        `${id}_phone`,
        { width: width * 0.8, height: height * 0.7, depth: depth },
        scene
      );
      phone.position = new Vector3(
        posX - Math.sin(rotation) * (depth / 2 + 0.01),
        posY + 1.4,
        posZ - Math.cos(rotation) * (depth / 2 + 0.01)
      );
      phone.rotation.y = rotation;
      phone.material = phoneMat;
      meshes.push(phone);
    }

    // Phone handset (for booth types)
    if (type !== 'wall') {
      const handset = MeshBuilder.CreateCylinder(
        `${id}_handset`,
        { height: 0.2, diameter: 0.04 },
        scene
      );
      handset.position = new Vector3(
        posX - Math.sin(rotation) * 0.15,
        posY + 1.3,
        posZ - Math.cos(rotation) * 0.15
      );
      handset.rotation.z = Math.PI / 4;
      handset.material = phoneMat;
      meshes.push(handset);

      // Cord
      if (isWorking) {
        const cordMat = new PBRMaterial(`phonebooth_cord_${id}`, scene);
        cordMat.albedoColor = new Color3(0.1, 0.1, 0.12);
        cordMat.metallic = 0;
        cordMat.roughness = 0.8;

        const cord = MeshBuilder.CreateCylinder(
          `${id}_cord`,
          { height: 0.4, diameter: 0.015 },
          scene
        );
        cord.position = new Vector3(
          posX - Math.sin(rotation) * 0.18,
          posY + 1.1,
          posZ - Math.cos(rotation) * 0.18
        );
        cord.material = cordMat;
        meshes.push(cord);
      }
    }

    // Light
    if (hasLight && type !== 'wall' && type !== 'kiosk') {
      const lightMat = new PBRMaterial(`phonebooth_light_${id}`, scene);
      if (isWorking) {
        lightMat.albedoColor = new Color3(1.0, 0.95, 0.8);
        lightMat.emissiveColor = new Color3(0.8, 0.75, 0.5);
      } else {
        lightMat.albedoColor = new Color3(0.5, 0.48, 0.45);
      }
      lightMat.metallic = 0;
      lightMat.roughness = 0.3;

      const lightHeight = type === 'british' ? 2.5 : 2.2;
      const light = MeshBuilder.CreateBox(
        `${id}_light`,
        { width: 0.15, height: 0.08, depth: 0.15 },
        scene
      );
      light.position = new Vector3(posX, posY + lightHeight - 0.1, posZ);
      light.material = lightMat;
      meshes.push(light);
    }

    // Out of order sign (if not working)
    if (!isWorking && condition < 0.6) {
      const signMat = new PBRMaterial(`phonebooth_sign_${id}`, scene);
      signMat.albedoColor = new Color3(0.9, 0.85, 0.1);
      signMat.metallic = 0;
      signMat.roughness = 0.7;

      const sign = MeshBuilder.CreatePlane(`${id}_sign`, { width: 0.2, height: 0.1 }, scene);
      sign.position = new Vector3(
        posX - Math.sin(rotation) * 0.5,
        posY + 1.5,
        posZ - Math.cos(rotation) * 0.5
      );
      sign.rotation.y = rotation;
      sign.material = signMat;
      meshes.push(sign);
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      frameMat.dispose();
      glassMat.dispose();
      phoneMat.dispose();
      roofMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, isWorking, hasLight, condition, rotation, seed]);

  return null;
}
