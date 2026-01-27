/**
 * Bonfire - Open fire pit for warmth and cooking
 *
 * Various bonfire configurations for post-apocalyptic survival environments.
 * Used as gathering points, cooking stations, and light sources.
 */

import {
  type AbstractMesh,
  Color3,
  type Material,
  MeshBuilder,
  PBRMaterial,
  PointLight,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type BonfireType = 'campfire' | 'barrel' | 'brazier' | 'pit' | 'cooking';
export type BonfireState = 'burning' | 'smoldering' | 'dead' | 'starting';

export interface BonfireProps {
  id: string;
  position: Vector3;
  /** Bonfire type/configuration */
  type?: BonfireType;
  /** Current state */
  state?: BonfireState;
  /** Size multiplier */
  size?: number;
  /** Has cooking grate/spit */
  hasCookingGrate?: boolean;
  /** Number of logs/fuel visible */
  fuelAmount?: number;
  /** Light intensity when burning */
  lightIntensity?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

const STATE_COLORS: Record<BonfireState, { emissive: Color3; intensity: number }> = {
  burning: { emissive: new Color3(1, 0.4, 0.1), intensity: 1 },
  smoldering: { emissive: new Color3(0.8, 0.2, 0.05), intensity: 0.3 },
  dead: { emissive: new Color3(0.1, 0.1, 0.1), intensity: 0 },
  starting: { emissive: new Color3(0.6, 0.3, 0.1), intensity: 0.5 },
};

export function Bonfire({
  id,
  position,
  type = 'campfire',
  state = 'burning',
  size = 1,
  hasCookingGrate = false,
  fuelAmount = 5,
  lightIntensity = 2,
  rotation = 0,
  seed,
}: BonfireProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);
  const materialsRef = useRef<Material[]>([]);
  const lightRef = useRef<PointLight | null>(null);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const materials: PBRMaterial[] = [];
    const random = createSeededRandom(seed ?? Math.random() * 10000);

    const stateConfig = STATE_COLORS[state];

    // Base container/pit
    const baseMat = new PBRMaterial(`${id}-base-mat`, scene);
    baseMat.albedoColor = new Color3(0.15, 0.12, 0.1);
    baseMat.roughness = 0.9;
    baseMat.metallic = 0;
    materials.push(baseMat);

    // Fire material (emissive)
    const fireMat = new PBRMaterial(`${id}-fire-mat`, scene);
    fireMat.albedoColor = stateConfig.emissive;
    fireMat.emissiveColor = stateConfig.emissive.scale(stateConfig.intensity);
    fireMat.roughness = 1;
    fireMat.metallic = 0;
    materials.push(fireMat);

    // Wood/log material
    const woodMat = new PBRMaterial(`${id}-wood-mat`, scene);
    woodMat.albedoColor = new Color3(0.3, 0.2, 0.1);
    woodMat.roughness = 0.85;
    woodMat.metallic = 0;
    materials.push(woodMat);

    // Ash material
    const ashMat = new PBRMaterial(`${id}-ash-mat`, scene);
    ashMat.albedoColor = new Color3(0.25, 0.25, 0.25);
    ashMat.roughness = 1;
    ashMat.metallic = 0;
    materials.push(ashMat);

    // Create base depending on type
    if (type === 'barrel') {
      // Oil barrel fire
      const barrel = MeshBuilder.CreateCylinder(
        `${id}-barrel`,
        { diameter: 0.6 * size, height: 0.9 * size, tessellation: 16 },
        scene
      );
      barrel.position = new Vector3(posX, posY + 0.45 * size, posZ);
      barrel.material = baseMat;
      meshes.push(barrel);
    } else if (type === 'brazier') {
      // Metal brazier
      const bowl = MeshBuilder.CreateCylinder(
        `${id}-bowl`,
        {
          diameterTop: 0.8 * size,
          diameterBottom: 0.5 * size,
          height: 0.4 * size,
          tessellation: 8,
        },
        scene
      );
      bowl.position = new Vector3(posX, posY + 0.5 * size, posZ);
      bowl.material = baseMat;
      meshes.push(bowl);

      // Legs
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const leg = MeshBuilder.CreateCylinder(
          `${id}-leg-${i}`,
          { diameter: 0.05 * size, height: 0.5 * size },
          scene
        );
        leg.position = new Vector3(
          posX + Math.cos(angle) * 0.3 * size,
          posY + 0.25 * size,
          posZ + Math.sin(angle) * 0.3 * size
        );
        leg.material = baseMat;
        meshes.push(leg);
      }
    } else if (type === 'pit') {
      // Dug fire pit with stone ring
      const pitBase = MeshBuilder.CreateDisc(
        `${id}-pit`,
        { radius: 0.5 * size, tessellation: 12 },
        scene
      );
      pitBase.rotation.x = Math.PI / 2;
      pitBase.position = new Vector3(posX, posY + 0.01, posZ);
      pitBase.material = ashMat;
      meshes.push(pitBase);

      // Stone ring
      const stoneCount = 8 + Math.floor(random() * 4);
      for (let i = 0; i < stoneCount; i++) {
        const angle = (i / stoneCount) * Math.PI * 2 + random() * 0.2;
        const stoneSize = (0.1 + random() * 0.08) * size;
        const stone = MeshBuilder.CreateBox(
          `${id}-stone-${i}`,
          { width: stoneSize, height: stoneSize * 0.7, depth: stoneSize },
          scene
        );
        stone.position = new Vector3(
          posX + Math.cos(angle) * 0.45 * size,
          posY + stoneSize * 0.35,
          posZ + Math.sin(angle) * 0.45 * size
        );
        stone.rotation.y = random() * Math.PI;
        stone.material = baseMat;
        meshes.push(stone);
      }
    } else {
      // Default campfire - simple ground fire
      const fireBase = MeshBuilder.CreateDisc(
        `${id}-base`,
        { radius: 0.4 * size, tessellation: 12 },
        scene
      );
      fireBase.rotation.x = Math.PI / 2;
      fireBase.position = new Vector3(posX, posY + 0.01, posZ);
      fireBase.material = ashMat;
      meshes.push(fireBase);
    }

    // Add logs/fuel
    const logCount = Math.min(Math.max(fuelAmount, 2), 8);
    for (let i = 0; i < logCount; i++) {
      const logLength = (0.4 + random() * 0.3) * size;
      const logRadius = (0.03 + random() * 0.03) * size;
      const log = MeshBuilder.CreateCylinder(
        `${id}-log-${i}`,
        { diameter: logRadius * 2, height: logLength, tessellation: 8 },
        scene
      );

      const angle = (i / logCount) * Math.PI * 2;
      const dist = random() * 0.15 * size;
      const baseHeight =
        type === 'barrel' ? 0.9 * size : type === 'brazier' ? 0.55 * size : 0.05 * size;

      log.position = new Vector3(
        posX + Math.cos(angle) * dist,
        posY + baseHeight + logRadius + random() * 0.1 * size,
        posZ + Math.sin(angle) * dist
      );
      log.rotation.z = Math.PI / 2;
      log.rotation.y = angle + (random() - 0.5) * 0.5;
      log.rotation.x = (random() - 0.5) * 0.3;

      // Some logs are charred
      if (state !== 'dead' && random() > 0.5) {
        const charredMat = new PBRMaterial(`${id}-charred-${i}`, scene);
        charredMat.albedoColor = new Color3(0.1, 0.08, 0.05);
        charredMat.emissiveColor = stateConfig.emissive.scale(stateConfig.intensity * 0.3);
        charredMat.roughness = 1;
        materials.push(charredMat);
        log.material = charredMat;
      } else {
        log.material = woodMat;
      }
      meshes.push(log);
    }

    // Fire glow (when burning or smoldering)
    if (state === 'burning' || state === 'smoldering' || state === 'starting') {
      const fireHeight =
        type === 'barrel' ? 0.9 * size : type === 'brazier' ? 0.6 * size : 0.15 * size;
      const fire = MeshBuilder.CreateSphere(
        `${id}-fire`,
        { diameter: 0.3 * size * stateConfig.intensity, segments: 8 },
        scene
      );
      fire.position = new Vector3(posX, posY + fireHeight + 0.15 * size, posZ);
      fire.material = fireMat;
      fire.scaling = new Vector3(1, 1.5, 1);
      meshes.push(fire);
    }

    // Cooking grate
    if (hasCookingGrate && (type === 'campfire' || type === 'pit' || type === 'cooking')) {
      const grateMat = new PBRMaterial(`${id}-grate-mat`, scene);
      grateMat.albedoColor = new Color3(0.2, 0.2, 0.2);
      grateMat.roughness = 0.6;
      grateMat.metallic = 0.8;
      materials.push(grateMat);

      // Grate frame
      const grateHeight = 0.4 * size;
      const grateSize = 0.5 * size;

      // Support legs
      for (let i = 0; i < 2; i++) {
        const support = MeshBuilder.CreateCylinder(
          `${id}-support-${i}`,
          { diameter: 0.02 * size, height: grateHeight },
          scene
        );
        support.position = new Vector3(
          posX + (i === 0 ? -1 : 1) * grateSize * 0.4,
          posY + grateHeight / 2,
          posZ
        );
        support.material = grateMat;
        meshes.push(support);
      }

      // Grate bars
      for (let i = 0; i < 5; i++) {
        const bar = MeshBuilder.CreateCylinder(
          `${id}-bar-${i}`,
          { diameter: 0.015 * size, height: grateSize * 0.8 },
          scene
        );
        bar.rotation.z = Math.PI / 2;
        bar.position = new Vector3(posX, posY + grateHeight, posZ + (i - 2) * 0.1 * size);
        bar.material = grateMat;
        meshes.push(bar);
      }
    }

    // Point light for fire illumination
    if (state === 'burning' || state === 'smoldering' || state === 'starting') {
      const fireHeight =
        type === 'barrel' ? 1 * size : type === 'brazier' ? 0.7 * size : 0.3 * size;
      const light = new PointLight(
        `${id}-light`,
        new Vector3(posX, posY + fireHeight, posZ),
        scene
      );
      light.diffuse = stateConfig.emissive;
      light.specular = stateConfig.emissive.scale(0.3);
      light.intensity = lightIntensity * stateConfig.intensity;
      light.range = 5 * size;
      lightRef.current = light;
    }

    // Apply rotation to all meshes
    if (rotation !== 0) {
      for (const mesh of meshes) {
        const relX = mesh.position.x - posX;
        const relZ = mesh.position.z - posZ;
        mesh.position.x = posX + relX * Math.cos(rotation) - relZ * Math.sin(rotation);
        mesh.position.z = posZ + relX * Math.sin(rotation) + relZ * Math.cos(rotation);
        mesh.rotation.y += rotation;
      }
    }

    meshRef.current = meshes;
    materialsRef.current = materials;

    return () => {
      for (const mesh of meshRef.current) {
        mesh.dispose();
      }
      for (const mat of materialsRef.current) {
        mat.dispose();
      }
      if (lightRef.current) {
        lightRef.current.dispose();
      }
      meshRef.current = [];
      materialsRef.current = [];
      lightRef.current = null;
    };
  }, [
    id,
    posX,
    posY,
    posZ,
    type,
    state,
    size,
    hasCookingGrate,
    fuelAmount,
    lightIntensity,
    rotation,
    seed,
    scene,
  ]);

  return null;
}
