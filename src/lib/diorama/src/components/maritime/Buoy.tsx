/**
 * Buoy - Water navigation markers
 *
 * Buoys and water markers for flooded environments.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type BuoyType = 'marker' | 'channel' | 'mooring' | 'danger' | 'light';
export type BuoyColor = 'red' | 'green' | 'yellow' | 'orange' | 'white';

export interface BuoyProps {
  id: string;
  position: Vector3;
  /** Buoy type */
  type?: BuoyType;
  /** Buoy color */
  color?: BuoyColor;
  /** Has light */
  hasLight?: boolean;
  /** Is lit */
  isLit?: boolean;
  /** Size multiplier */
  size?: number;
  /** Condition 0-1 */
  condition?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Buoy({
  id,
  position,
  type = 'marker',
  color = 'red',
  hasLight = false,
  isLit = true,
  size = 1,
  condition = 0.8,
  seed,
}: BuoyProps) {
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

    // Get buoy color
    const getColor = (colorName: BuoyColor): Color3 => {
      switch (colorName) {
        case 'red':
          return new Color3(0.85, 0.15, 0.1);
        case 'green':
          return new Color3(0.1, 0.6, 0.2);
        case 'yellow':
          return new Color3(0.9, 0.85, 0.1);
        case 'orange':
          return new Color3(0.95, 0.5, 0.1);
        case 'white':
          return new Color3(0.95, 0.95, 0.95);
        default:
          return new Color3(0.85, 0.15, 0.1);
      }
    };

    const buoyMat = new PBRMaterial(`buoy_${id}`, scene);
    buoyMat.albedoColor = getColor(color).scale(conditionFactor);
    buoyMat.metallic = 0.3;
    buoyMat.roughness = 0.6;

    const baseRadius = 0.3 * size;
    const baseHeight = 0.8 * size;

    if (type === 'marker' || type === 'channel') {
      // Conical marker buoy
      const body = MeshBuilder.CreateCylinder(
        `${id}_body`,
        {
          height: baseHeight,
          diameterTop: baseRadius * 0.3,
          diameterBottom: baseRadius * 2,
          tessellation: 16,
        },
        scene
      );
      body.position = new Vector3(posX, posY + baseHeight / 2, posZ);
      body.material = buoyMat;
      meshes.push(body);

      // Stripe band
      if (type === 'channel') {
        const stripeMat = new PBRMaterial(`buoy_stripe_${id}`, scene);
        stripeMat.albedoColor =
          color === 'red' ? new Color3(0.95, 0.95, 0.95) : new Color3(0.1, 0.1, 0.12);
        stripeMat.metallic = 0.2;
        stripeMat.roughness = 0.6;

        const stripe = MeshBuilder.CreateTorus(
          `${id}_stripe`,
          {
            diameter: baseRadius * 1.4,
            thickness: baseHeight * 0.15,
            tessellation: 16,
          },
          scene
        );
        stripe.position = new Vector3(posX, posY + baseHeight * 0.4, posZ);
        stripe.rotation.x = Math.PI / 2;
        stripe.material = stripeMat;
        meshes.push(stripe);
      }
    } else if (type === 'mooring') {
      // Spherical mooring buoy
      const body = MeshBuilder.CreateSphere(
        `${id}_body`,
        { diameter: baseRadius * 2, segments: 16 },
        scene
      );
      body.position = new Vector3(posX, posY + baseRadius, posZ);
      body.material = buoyMat;
      meshes.push(body);

      // Mooring eye
      const eyeMat = new PBRMaterial(`buoy_eye_${id}`, scene);
      eyeMat.albedoColor = new Color3(0.4, 0.42, 0.45);
      eyeMat.metallic = 0.85;
      eyeMat.roughness = 0.4;

      const eye = MeshBuilder.CreateTorus(
        `${id}_eye`,
        {
          diameter: baseRadius * 0.6,
          thickness: baseRadius * 0.1,
          tessellation: 12,
        },
        scene
      );
      eye.position = new Vector3(posX, posY + baseRadius * 2, posZ);
      eye.material = eyeMat;
      meshes.push(eye);
    } else if (type === 'danger') {
      // Pillar danger buoy
      const body = MeshBuilder.CreateCylinder(
        `${id}_body`,
        { height: baseHeight * 1.5, diameter: baseRadius, tessellation: 16 },
        scene
      );
      body.position = new Vector3(posX, posY + baseHeight * 0.75, posZ);
      body.material = buoyMat;
      meshes.push(body);

      // X marks
      const xMat = new PBRMaterial(`buoy_x_${id}`, scene);
      xMat.albedoColor = new Color3(0.1, 0.1, 0.12);
      xMat.metallic = 0.1;
      xMat.roughness = 0.7;

      for (let x = 0; x < 2; x++) {
        const xBar = MeshBuilder.CreateBox(
          `${id}_x_${x}`,
          { width: baseRadius * 0.8, height: 0.02, depth: baseRadius * 0.15 },
          scene
        );
        xBar.position = new Vector3(posX, posY + baseHeight, posZ);
        xBar.rotation.z = x === 0 ? Math.PI / 4 : -Math.PI / 4;
        xBar.material = xMat;
        meshes.push(xBar);
      }

      // Base float
      const baseMat = new PBRMaterial(`buoy_base_${id}`, scene);
      baseMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      baseMat.metallic = 0.5;
      baseMat.roughness = 0.6;

      const base = MeshBuilder.CreateCylinder(
        `${id}_base`,
        { height: 0.2, diameter: baseRadius * 2.5, tessellation: 16 },
        scene
      );
      base.position = new Vector3(posX, posY + 0.1, posZ);
      base.material = baseMat;
      meshes.push(base);
    } else {
      // Light buoy (larger, with tower)
      const baseMat = new PBRMaterial(`buoy_base_${id}`, scene);
      baseMat.albedoColor = new Color3(0.3, 0.32, 0.35).scale(conditionFactor);
      baseMat.metallic = 0.6;
      baseMat.roughness = 0.5;

      // Float base
      const base = MeshBuilder.CreateCylinder(
        `${id}_base`,
        { height: 0.4, diameter: baseRadius * 3, tessellation: 16 },
        scene
      );
      base.position = new Vector3(posX, posY + 0.2, posZ);
      base.material = baseMat;
      meshes.push(base);

      // Tower
      const tower = MeshBuilder.CreateCylinder(
        `${id}_tower`,
        {
          height: baseHeight * 1.5,
          diameter: baseRadius * 0.8,
          tessellation: 12,
        },
        scene
      );
      tower.position = new Vector3(posX, posY + 0.4 + baseHeight * 0.75, posZ);
      tower.material = buoyMat;
      meshes.push(tower);

      // Light housing
      const housingMat = new PBRMaterial(`buoy_housing_${id}`, scene);
      housingMat.albedoColor = new Color3(0.15, 0.15, 0.18);
      housingMat.metallic = 0.7;
      housingMat.roughness = 0.4;

      const housing = MeshBuilder.CreateCylinder(
        `${id}_housing`,
        { height: 0.3, diameter: baseRadius * 1.2, tessellation: 12 },
        scene
      );
      housing.position = new Vector3(posX, posY + 0.4 + baseHeight * 1.5 + 0.15, posZ);
      housing.material = housingMat;
      meshes.push(housing);
    }

    // Light fixture (for hasLight types)
    if (hasLight || type === 'light') {
      const lightMat = new PBRMaterial(`buoy_light_${id}`, scene);
      if (isLit) {
        lightMat.albedoColor = new Color3(1.0, 0.95, 0.6);
        lightMat.emissiveColor = new Color3(0.8, 0.75, 0.4);
      } else {
        lightMat.albedoColor = new Color3(0.5, 0.48, 0.4);
      }
      lightMat.metallic = 0;
      lightMat.roughness = 0.3;

      const lightY =
        type === 'light' ? posY + 0.4 + baseHeight * 1.5 + 0.35 : posY + baseHeight + 0.15;

      const light = MeshBuilder.CreateSphere(
        `${id}_light`,
        { diameter: 0.15, segments: 12 },
        scene
      );
      light.position = new Vector3(posX, lightY, posZ);
      light.material = lightMat;
      meshes.push(light);

      // Light cage
      if (type === 'marker' || type === 'channel') {
        const cageMat = new PBRMaterial(`buoy_cage_${id}`, scene);
        cageMat.albedoColor = new Color3(0.4, 0.42, 0.45);
        cageMat.metallic = 0.8;
        cageMat.roughness = 0.4;

        const cageBarCount = 4;
        for (let c = 0; c < cageBarCount; c++) {
          const cageAngle = (c / cageBarCount) * Math.PI * 2;

          const bar = MeshBuilder.CreateCylinder(
            `${id}_cagebar_${c}`,
            { height: 0.2, diameter: 0.01 },
            scene
          );
          bar.position = new Vector3(
            posX + Math.cos(cageAngle) * 0.08,
            lightY,
            posZ + Math.sin(cageAngle) * 0.08
          );
          bar.material = cageMat;
          meshes.push(bar);
        }
      }
    }

    // Anchor chain hint (below waterline)
    const chainMat = new PBRMaterial(`buoy_chain_${id}`, scene);
    chainMat.albedoColor = new Color3(0.35, 0.37, 0.4).scale(conditionFactor);
    chainMat.metallic = 0.7;
    chainMat.roughness = 0.5;

    const chainLength = 0.5 * size;
    const chain = MeshBuilder.CreateCylinder(
      `${id}_chain`,
      { height: chainLength, diameter: 0.03 },
      scene
    );
    chain.position = new Vector3(posX, posY - chainLength / 2, posZ);
    chain.material = chainMat;
    meshes.push(chain);

    // Barnacles/weathering for poor condition
    if (condition < 0.6) {
      const barnacleMat = new PBRMaterial(`buoy_barnacle_${id}`, scene);
      barnacleMat.albedoColor = new Color3(0.6, 0.58, 0.55);
      barnacleMat.metallic = 0;
      barnacleMat.roughness = 0.95;

      const barnacleCount = 5 + (rng ? Math.floor(rng.next() * 5) : 3);
      for (let b = 0; b < barnacleCount; b++) {
        const bAngle = (rng ? rng.next() : b / barnacleCount) * Math.PI * 2;
        const bHeight = (rng ? rng.next() : 0.3) * baseHeight * 0.5;
        const bRadius = type === 'mooring' ? baseRadius : baseRadius * (1 - bHeight / baseHeight);

        const barnacle = MeshBuilder.CreateSphere(
          `${id}_barnacle_${b}`,
          { diameter: 0.03 + (rng ? rng.next() * 0.02 : 0.01), segments: 6 },
          scene
        );
        barnacle.position = new Vector3(
          posX + Math.cos(bAngle) * bRadius,
          posY + bHeight + 0.05,
          posZ + Math.sin(bAngle) * bRadius
        );
        barnacle.scaling = new Vector3(1, 0.5, 1);
        barnacle.material = barnacleMat;
        meshes.push(barnacle);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      buoyMat.dispose();
    };
  }, [scene, id, posX, posY, posZ, type, color, hasLight, isLit, size, condition, seed]);

  return null;
}
