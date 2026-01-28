/**
 * Generator - Backup power generator component
 *
 * Industrial and residential generators for power backup.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type GeneratorType = 'portable' | 'standby' | 'industrial' | 'solar';

export interface GeneratorProps {
  id: string;
  position: Vector3;
  /** Generator type */
  type?: GeneratorType;
  /** Size multiplier */
  size?: number;
  /** Is running */
  running?: boolean;
  /** Age/wear 0-1 */
  wear?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Generator({
  id,
  position,
  type = 'standby',
  size = 1,
  running = false,
  wear = 0.2,
  rotation = 0,
  seed,
}: GeneratorProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const _rng = seed !== undefined ? createSeededRandom(seed) : null;

    const wearFactor = 1 - wear * 0.25;

    // Materials
    const bodyMat = new PBRMaterial(`generator_body_${id}`, scene);
    const accentMat = new PBRMaterial(`generator_accent_${id}`, scene);

    if (type === 'portable') {
      // Small portable generator
      bodyMat.albedoColor = new Color3(0.7, 0.15, 0.1).scale(wearFactor);
      bodyMat.metallic = 0.6;
      bodyMat.roughness = 0.5;
      accentMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      accentMat.metallic = 0.7;
      accentMat.roughness = 0.4;

      const bodyWidth = 0.6 * size;
      const bodyHeight = 0.5 * size;
      const bodyDepth = 0.4 * size;

      // Main body
      const body = MeshBuilder.CreateBox(
        `${id}_body`,
        { width: bodyWidth, height: bodyHeight, depth: bodyDepth },
        scene
      );
      body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
      body.rotation.y = rotation;
      body.material = bodyMat;
      meshes.push(body);

      // Frame/cage
      const frameMat = new PBRMaterial(`generator_frame_${id}`, scene);
      frameMat.albedoColor = new Color3(0.15, 0.15, 0.17);
      frameMat.metallic = 0.85;
      frameMat.roughness = 0.3;

      // Frame tubes
      const tubePositions = [
        [-bodyWidth / 2, 0, -bodyDepth / 2],
        [bodyWidth / 2, 0, -bodyDepth / 2],
        [-bodyWidth / 2, 0, bodyDepth / 2],
        [bodyWidth / 2, 0, bodyDepth / 2],
      ];

      for (let i = 0; i < tubePositions.length; i++) {
        const [tx, _, tz] = tubePositions[i];
        const tube = MeshBuilder.CreateCylinder(
          `${id}_tube_${i}`,
          { height: bodyHeight + 0.1, diameter: 0.03 },
          scene
        );
        tube.position = new Vector3(
          posX + Math.cos(rotation) * tx - Math.sin(rotation) * tz,
          posY + bodyHeight / 2,
          posZ + Math.sin(rotation) * tx + Math.cos(rotation) * tz
        );
        tube.material = frameMat;
        meshes.push(tube);
      }

      // Handle
      const handle = MeshBuilder.CreateCylinder(
        `${id}_handle`,
        { height: bodyWidth - 0.1, diameter: 0.025 },
        scene
      );
      handle.position = new Vector3(posX, posY + bodyHeight + 0.05, posZ);
      handle.rotation.z = Math.PI / 2;
      handle.rotation.y = rotation;
      handle.material = frameMat;
      meshes.push(handle);

      // Control panel
      const panel = MeshBuilder.CreateBox(
        `${id}_panel`,
        { width: bodyWidth * 0.4, height: bodyHeight * 0.3, depth: 0.02 },
        scene
      );
      panel.position = new Vector3(
        posX + Math.sin(rotation) * (bodyDepth / 2 + 0.01),
        posY + bodyHeight * 0.6,
        posZ + Math.cos(rotation) * (bodyDepth / 2 + 0.01)
      );
      panel.rotation.y = rotation;
      panel.material = accentMat;
      meshes.push(panel);

      // Outlets
      for (let o = 0; o < 2; o++) {
        const outlet = MeshBuilder.CreateCylinder(
          `${id}_outlet_${o}`,
          { height: 0.02, diameter: 0.05 },
          scene
        );
        outlet.position = new Vector3(
          posX +
            Math.sin(rotation) * (bodyDepth / 2 + 0.02) +
            Math.cos(rotation) * ((o - 0.5) * 0.12),
          posY + bodyHeight * 0.35,
          posZ +
            Math.cos(rotation) * (bodyDepth / 2 + 0.02) -
            Math.sin(rotation) * ((o - 0.5) * 0.12)
        );
        outlet.rotation.x = Math.PI / 2;
        outlet.rotation.y = rotation;
        outlet.material = accentMat;
        meshes.push(outlet);
      }
    } else if (type === 'standby') {
      // Residential standby generator
      bodyMat.albedoColor = new Color3(0.35, 0.4, 0.35).scale(wearFactor);
      bodyMat.metallic = 0.5;
      bodyMat.roughness = 0.6;

      const bodyWidth = 1.2 * size;
      const bodyHeight = 0.8 * size;
      const bodyDepth = 0.7 * size;

      // Main enclosure
      const body = MeshBuilder.CreateBox(
        `${id}_body`,
        { width: bodyWidth, height: bodyHeight, depth: bodyDepth },
        scene
      );
      body.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
      body.rotation.y = rotation;
      body.material = bodyMat;
      meshes.push(body);

      // Louvers (vents)
      const louverMat = new PBRMaterial(`generator_louver_${id}`, scene);
      louverMat.albedoColor = new Color3(0.2, 0.22, 0.2);
      louverMat.metallic = 0.6;
      louverMat.roughness = 0.5;

      for (const side of [-1, 1]) {
        const louver = MeshBuilder.CreateBox(
          `${id}_louver_${side}`,
          { width: 0.02, height: bodyHeight * 0.6, depth: bodyDepth * 0.6 },
          scene
        );
        louver.position = new Vector3(
          posX + Math.cos(rotation) * ((side * bodyWidth) / 2 + side * 0.01),
          posY + bodyHeight * 0.5,
          posZ - Math.sin(rotation) * ((side * bodyWidth) / 2 + side * 0.01)
        );
        louver.rotation.y = rotation;
        louver.material = louverMat;
        meshes.push(louver);
      }

      // Exhaust
      const exhaust = MeshBuilder.CreateCylinder(
        `${id}_exhaust`,
        { height: 0.15, diameter: 0.1 },
        scene
      );
      exhaust.position = new Vector3(
        posX - Math.sin(rotation) * (bodyDepth / 2 - 0.15),
        posY + bodyHeight + 0.075,
        posZ - Math.cos(rotation) * (bodyDepth / 2 - 0.15)
      );
      exhaust.material = accentMat;
      meshes.push(exhaust);

      // Concrete pad
      const pad = MeshBuilder.CreateBox(
        `${id}_pad`,
        { width: bodyWidth + 0.2, height: 0.1, depth: bodyDepth + 0.2 },
        scene
      );
      pad.position = new Vector3(posX, posY + 0.05, posZ);
      pad.rotation.y = rotation;
      const padMat = new PBRMaterial(`generator_pad_${id}`, scene);
      padMat.albedoColor = new Color3(0.55, 0.53, 0.5);
      padMat.metallic = 0;
      padMat.roughness = 0.9;
      pad.material = padMat;
      meshes.push(pad);
    } else if (type === 'industrial') {
      // Large industrial generator
      bodyMat.albedoColor = new Color3(0.3, 0.32, 0.35).scale(wearFactor);
      bodyMat.metallic = 0.75;
      bodyMat.roughness = 0.4;

      const bodyWidth = 3 * size;
      const bodyHeight = 1.5 * size;
      const bodyDepth = 1.2 * size;

      // Main enclosure
      const body = MeshBuilder.CreateBox(
        `${id}_body`,
        { width: bodyWidth, height: bodyHeight, depth: bodyDepth },
        scene
      );
      body.position = new Vector3(posX, posY + bodyHeight / 2 + 0.2, posZ);
      body.rotation.y = rotation;
      body.material = bodyMat;
      meshes.push(body);

      // Base frame
      const frame = MeshBuilder.CreateBox(
        `${id}_frame`,
        { width: bodyWidth + 0.1, height: 0.2, depth: bodyDepth + 0.1 },
        scene
      );
      frame.position = new Vector3(posX, posY + 0.1, posZ);
      frame.rotation.y = rotation;
      frame.material = accentMat;
      meshes.push(frame);

      // Radiator section
      const radiator = MeshBuilder.CreateBox(
        `${id}_radiator`,
        { width: 0.3, height: bodyHeight - 0.2, depth: bodyDepth - 0.2 },
        scene
      );
      radiator.position = new Vector3(
        posX + Math.cos(rotation) * (bodyWidth / 2 - 0.2),
        posY + bodyHeight / 2 + 0.2,
        posZ - Math.sin(rotation) * (bodyWidth / 2 - 0.2)
      );
      radiator.rotation.y = rotation;
      radiator.material = accentMat;
      meshes.push(radiator);

      // Control cabinet
      const cabinet = MeshBuilder.CreateBox(
        `${id}_cabinet`,
        { width: 0.6, height: 1.2, depth: 0.4 },
        scene
      );
      cabinet.position = new Vector3(
        posX +
          Math.cos(rotation) * (-bodyWidth / 2 - 0.35) +
          Math.sin(rotation) * (bodyDepth / 2 - 0.3),
        posY + 0.6,
        posZ -
          Math.sin(rotation) * (-bodyWidth / 2 - 0.35) +
          Math.cos(rotation) * (bodyDepth / 2 - 0.3)
      );
      cabinet.rotation.y = rotation;
      cabinet.material = bodyMat;
      meshes.push(cabinet);

      // Exhaust stack
      const stack = MeshBuilder.CreateCylinder(`${id}_stack`, { height: 1, diameter: 0.25 }, scene);
      stack.position = new Vector3(
        posX - Math.sin(rotation) * (bodyDepth / 2 - 0.3),
        posY + bodyHeight + 0.7,
        posZ - Math.cos(rotation) * (bodyDepth / 2 - 0.3)
      );
      stack.material = accentMat;
      meshes.push(stack);

      // Fuel tank
      const fuelTank = MeshBuilder.CreateCylinder(
        `${id}_fuelTank`,
        { height: bodyWidth * 0.6, diameter: 0.5 },
        scene
      );
      fuelTank.position = new Vector3(
        posX + Math.sin(rotation) * (bodyDepth / 2 + 0.35),
        posY + 0.35,
        posZ + Math.cos(rotation) * (bodyDepth / 2 + 0.35)
      );
      fuelTank.rotation.z = Math.PI / 2;
      fuelTank.rotation.y = rotation;
      fuelTank.material = accentMat;
      meshes.push(fuelTank);
    } else if (type === 'solar') {
      // Solar generator with battery
      bodyMat.albedoColor = new Color3(0.15, 0.15, 0.17).scale(wearFactor);
      bodyMat.metallic = 0.2;
      bodyMat.roughness = 0.6;

      const bodyWidth = 0.8 * size;
      const bodyHeight = 0.6 * size;
      const bodyDepth = 0.5 * size;

      // Battery unit
      const battery = MeshBuilder.CreateBox(
        `${id}_battery`,
        { width: bodyWidth, height: bodyHeight, depth: bodyDepth },
        scene
      );
      battery.position = new Vector3(posX, posY + bodyHeight / 2, posZ);
      battery.rotation.y = rotation;
      battery.material = bodyMat;
      meshes.push(battery);

      // Solar panel
      const panelMat = new PBRMaterial(`generator_panel_${id}`, scene);
      panelMat.albedoColor = new Color3(0.1, 0.12, 0.2);
      panelMat.metallic = 0.4;
      panelMat.roughness = 0.3;

      const panel = MeshBuilder.CreateBox(
        `${id}_panel`,
        { width: bodyWidth * 1.5, height: 0.03, depth: bodyWidth * 1.2 },
        scene
      );
      panel.position = new Vector3(
        posX - Math.sin(rotation) * 0.2,
        posY + bodyHeight + 0.4,
        posZ - Math.cos(rotation) * 0.2
      );
      panel.rotation.y = rotation;
      panel.rotation.x = 0.5;
      panel.material = panelMat;
      meshes.push(panel);

      // Panel frame
      const frameMat = new PBRMaterial(`generator_sFrame_${id}`, scene);
      frameMat.albedoColor = new Color3(0.6, 0.6, 0.62);
      frameMat.metallic = 0.8;
      frameMat.roughness = 0.4;

      // Stand
      const stand = MeshBuilder.CreateCylinder(
        `${id}_stand`,
        { height: 0.4, diameter: 0.04 },
        scene
      );
      stand.position = new Vector3(posX, posY + bodyHeight + 0.2, posZ);
      stand.material = frameMat;
      meshes.push(stand);

      // Display
      const display = MeshBuilder.CreateBox(
        `${id}_display`,
        { width: bodyWidth * 0.4, height: bodyHeight * 0.3, depth: 0.02 },
        scene
      );
      display.position = new Vector3(
        posX + Math.sin(rotation) * (bodyDepth / 2 + 0.01),
        posY + bodyHeight * 0.6,
        posZ + Math.cos(rotation) * (bodyDepth / 2 + 0.01)
      );
      display.rotation.y = rotation;
      const displayMat = new PBRMaterial(`generator_display_${id}`, scene);
      displayMat.albedoColor = new Color3(0.1, 0.3, 0.1);
      if (running) {
        displayMat.emissiveColor = new Color3(0.1, 0.4, 0.1);
      }
      displayMat.metallic = 0;
      displayMat.roughness = 0.3;
      display.material = displayMat;
      meshes.push(display);
    }

    // Running indicator light
    if (running) {
      const lightMat = new PBRMaterial(`generator_light_${id}`, scene);
      lightMat.albedoColor = new Color3(0.2, 0.8, 0.2);
      lightMat.emissiveColor = new Color3(0.2, 0.8, 0.2);
      lightMat.metallic = 0;
      lightMat.roughness = 0.3;

      const light = MeshBuilder.CreateSphere(`${id}_runLight`, { diameter: 0.04 }, scene);
      const lightOffset = type === 'portable' ? 0.25 : type === 'standby' ? 0.4 : 0.6;
      light.position = new Vector3(
        posX + Math.sin(rotation) * lightOffset * size,
        posY + (type === 'portable' ? 0.45 : type === 'standby' ? 0.65 : 1.5) * size,
        posZ + Math.cos(rotation) * lightOffset * size
      );
      light.material = lightMat;
      meshes.push(light);
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      bodyMat.dispose();
      accentMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, size, running, wear, rotation, seed]);

  return null;
}
