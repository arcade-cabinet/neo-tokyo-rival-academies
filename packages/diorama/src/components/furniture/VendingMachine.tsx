/**
 * VendingMachine - Japanese vending machine component
 *
 * Iconic urban furniture of Japan.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type VendingMachineType = 'drinks' | 'snacks' | 'cigarettes' | 'toys' | 'umbrellas';

export interface VendingMachineProps {
  id: string;
  position: Vector3;
  /** Machine type */
  type?: VendingMachineType;
  /** Primary color */
  color?: Color3;
  /** Is powered/lit */
  powered?: boolean;
  /** Direction machine faces (radians) */
  rotation?: number;
  /** Weathering level 0-1 */
  weathering?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function VendingMachine({
  id,
  position,
  type = 'drinks',
  color,
  powered = true,
  rotation = 0,
  weathering = 0,
  seed,
}: VendingMachineProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const weatherVariation = weathering * (rng ? rng.next() * 0.1 : 0.05);

    // Machine dimensions
    const width = 0.8;
    const height = 1.8;
    const depth = 0.7;

    // Main color
    const mainColor =
      color ??
      (rng
        ? new Color3(rng.next() * 0.4 + 0.3, rng.next() * 0.4 + 0.1, rng.next() * 0.4 + 0.1)
        : new Color3(0.6, 0.15, 0.15)); // Red is common

    // Body material
    const bodyMat = new PBRMaterial(`vending_body_${id}`, scene);
    bodyMat.albedoColor = new Color3(
      mainColor.r - weatherVariation,
      mainColor.g - weatherVariation,
      mainColor.b - weatherVariation
    );
    bodyMat.metallic = 0.7;
    bodyMat.roughness = 0.4 + weathering * 0.2;

    // Glass/display material
    const glassMat = new PBRMaterial(`vending_glass_${id}`, scene);
    glassMat.albedoColor = powered ? new Color3(0.9, 0.95, 1) : new Color3(0.3, 0.3, 0.32);
    if (powered) {
      glassMat.emissiveColor = new Color3(0.8, 0.85, 0.9);
    }
    glassMat.metallic = 0.1;
    glassMat.roughness = 0.1;
    glassMat.alpha = 0.7;

    // Trim material
    const trimMat = new PBRMaterial(`vending_trim_${id}`, scene);
    trimMat.albedoColor = new Color3(0.2, 0.2, 0.22);
    trimMat.metallic = 0.85;
    trimMat.roughness = 0.35;

    // Main body
    const body = MeshBuilder.CreateBox(`${id}_body`, { width, height, depth }, scene);
    body.position = new Vector3(posX, posY + height / 2, posZ);
    body.rotation.y = rotation;
    body.material = bodyMat;
    meshes.push(body);

    // Front panel with display
    const frontPanel = MeshBuilder.CreateBox(
      `${id}_front`,
      { width: width * 0.85, height: height * 0.6, depth: 0.02 },
      scene
    );
    frontPanel.position = new Vector3(
      posX + Math.sin(rotation) * (depth / 2 + 0.01),
      posY + height * 0.55,
      posZ + Math.cos(rotation) * (depth / 2 + 0.01)
    );
    frontPanel.rotation.y = rotation;
    frontPanel.material = glassMat;
    meshes.push(frontPanel);

    // Display products (simplified as colored rectangles)
    if (type === 'drinks' && powered) {
      const rowCount = 4;
      const colCount = 3;
      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const canMat = new PBRMaterial(`vending_can_${id}_${row}_${col}`, scene);
          const canColor = rng
            ? new Color3(rng.next(), rng.next(), rng.next())
            : new Color3(0.8, 0.2, 0.2);
          canMat.albedoColor = canColor;
          canMat.metallic = 0.8;
          canMat.roughness = 0.3;

          const can = MeshBuilder.CreateCylinder(
            `${id}_can_${row}_${col}`,
            { height: 0.12, diameter: 0.06 },
            scene
          );
          can.position = new Vector3(
            posX + Math.sin(rotation) * (depth / 2 - 0.1) + Math.cos(rotation) * ((col - 1) * 0.2),
            posY + height * 0.35 + row * 0.15,
            posZ + Math.cos(rotation) * (depth / 2 - 0.1) - Math.sin(rotation) * ((col - 1) * 0.2)
          );
          can.material = canMat;
          meshes.push(can);
        }
      }
    }

    // Coin slot area
    const coinSlot = MeshBuilder.CreateBox(
      `${id}_coin_slot`,
      { width: 0.15, height: 0.25, depth: 0.05 },
      scene
    );
    coinSlot.position = new Vector3(
      posX + Math.sin(rotation) * (depth / 2 + 0.025) + Math.cos(rotation) * (width * 0.3),
      posY + height * 0.4,
      posZ + Math.cos(rotation) * (depth / 2 + 0.025) - Math.sin(rotation) * (width * 0.3)
    );
    coinSlot.rotation.y = rotation;
    coinSlot.material = trimMat;
    meshes.push(coinSlot);

    // Dispensing slot
    const dispenseSlot = MeshBuilder.CreateBox(
      `${id}_dispense`,
      { width: width * 0.6, height: 0.25, depth: 0.15 },
      scene
    );
    dispenseSlot.position = new Vector3(
      posX + Math.sin(rotation) * (depth / 2 - 0.05),
      posY + 0.15,
      posZ + Math.cos(rotation) * (depth / 2 - 0.05)
    );
    dispenseSlot.rotation.y = rotation;
    dispenseSlot.material = trimMat;
    meshes.push(dispenseSlot);

    // Dispense door (flap)
    const flap = MeshBuilder.CreateBox(
      `${id}_flap`,
      { width: width * 0.55, height: 0.02, depth: 0.12 },
      scene
    );
    flap.position = new Vector3(
      posX + Math.sin(rotation) * (depth / 2 + 0.05),
      posY + 0.22,
      posZ + Math.cos(rotation) * (depth / 2 + 0.05)
    );
    flap.rotation.x = -Math.PI / 6;
    flap.rotation.y = rotation;
    flap.material = trimMat;
    meshes.push(flap);

    // Price display
    if (powered) {
      const priceMat = new PBRMaterial(`vending_price_${id}`, scene);
      priceMat.albedoColor = new Color3(0.1, 0.8, 0.2);
      priceMat.emissiveColor = new Color3(0.1, 0.8, 0.2);
      priceMat.metallic = 0;
      priceMat.roughness = 0.5;

      const priceDisplay = MeshBuilder.CreateBox(
        `${id}_price`,
        { width: 0.1, height: 0.05, depth: 0.01 },
        scene
      );
      priceDisplay.position = new Vector3(
        posX + Math.sin(rotation) * (depth / 2 + 0.03) + Math.cos(rotation) * (width * 0.3),
        posY + height * 0.32,
        posZ + Math.cos(rotation) * (depth / 2 + 0.03) - Math.sin(rotation) * (width * 0.3)
      );
      priceDisplay.rotation.y = rotation;
      priceDisplay.material = priceMat;
      meshes.push(priceDisplay);
    }

    // Top light strip (if powered)
    if (powered) {
      const lightMat = new PBRMaterial(`vending_light_${id}`, scene);
      lightMat.albedoColor = new Color3(1, 1, 1);
      lightMat.emissiveColor = new Color3(0.9, 0.95, 1);
      lightMat.metallic = 0;
      lightMat.roughness = 0.3;

      const lightStrip = MeshBuilder.CreateBox(
        `${id}_light`,
        { width: width * 0.9, height: 0.08, depth: 0.02 },
        scene
      );
      lightStrip.position = new Vector3(
        posX + Math.sin(rotation) * (depth / 2 + 0.01),
        posY + height - 0.08,
        posZ + Math.cos(rotation) * (depth / 2 + 0.01)
      );
      lightStrip.rotation.y = rotation;
      lightStrip.material = lightMat;
      meshes.push(lightStrip);
    }

    // Brand logo area
    const logoMat = new PBRMaterial(`vending_logo_${id}`, scene);
    const brandColors = [
      new Color3(0.9, 0.1, 0.1), // Red
      new Color3(0.1, 0.3, 0.8), // Blue
      new Color3(0.1, 0.6, 0.2), // Green
      new Color3(1, 0.5, 0), // Orange
    ];
    logoMat.albedoColor = rng
      ? brandColors[Math.floor(rng.next() * brandColors.length)]
      : brandColors[0];
    logoMat.metallic = 0.5;
    logoMat.roughness = 0.4;

    const logo = MeshBuilder.CreateBox(
      `${id}_logo`,
      { width: width * 0.6, height: 0.15, depth: 0.01 },
      scene
    );
    logo.position = new Vector3(
      posX + Math.sin(rotation) * (depth / 2 + 0.015),
      posY + height - 0.2,
      posZ + Math.cos(rotation) * (depth / 2 + 0.015)
    );
    logo.rotation.y = rotation;
    logo.material = logoMat;
    meshes.push(logo);

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      bodyMat.dispose();
      glassMat.dispose();
      trimMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, color, powered, rotation, weathering, seed]);

  return null;
}
