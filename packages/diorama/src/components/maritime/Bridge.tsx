/**
 * Bridge - Pedestrian/vehicle bridge component
 *
 * Bridges for crossing water or gaps in urban environments.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type BridgeType = 'pedestrian' | 'road' | 'suspension' | 'arch' | 'pontoon' | 'drawbridge';

export interface BridgeProps {
  id: string;
  position: Vector3;
  /** Bridge type */
  type?: BridgeType;
  /** Length of bridge */
  length?: number;
  /** Width of bridge */
  width?: number;
  /** Height above water/ground */
  clearance?: number;
  /** Has railings */
  hasRailings?: boolean;
  /** Has lights */
  hasLights?: boolean;
  /** Rotation (radians) */
  rotation?: number;
  /** Condition 0-1 */
  condition?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Bridge({
  id,
  position,
  type = 'pedestrian',
  length = 10,
  width = 2,
  clearance = 2,
  hasRailings = true,
  hasLights = false,
  rotation = 0,
  condition = 0.85,
  seed,
}: BridgeProps) {
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
    const deckMat = new PBRMaterial(`bridge_deck_${id}`, scene);
    const structMat = new PBRMaterial(`bridge_struct_${id}`, scene);
    const railMat = new PBRMaterial(`bridge_rail_${id}`, scene);

    if (type === 'pedestrian') {
      // Wooden pedestrian bridge
      deckMat.albedoColor = new Color3(0.45, 0.35, 0.2).scale(conditionFactor);
      deckMat.metallic = 0;
      deckMat.roughness = 0.85;
      structMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
      structMat.metallic = 0.8;
      structMat.roughness = 0.4;
      railMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
      railMat.metallic = 0.75;
      railMat.roughness = 0.45;

      // Deck planks
      const plankCount = Math.floor(length / 0.15);
      for (let p = 0; p < plankCount; p++) {
        const plankX = (p / plankCount - 0.5) * length;
        const plank = MeshBuilder.CreateBox(
          `${id}_plank_${p}`,
          { width: 0.12, height: 0.03, depth: width - 0.1 },
          scene
        );
        plank.position = new Vector3(
          posX + Math.cos(rotation) * plankX,
          posY + clearance,
          posZ - Math.sin(rotation) * plankX
        );
        plank.rotation.y = rotation;
        plank.material = deckMat;
        meshes.push(plank);
      }

      // Support beams (longitudinal)
      for (const side of [-1, 1]) {
        const beam = MeshBuilder.CreateBox(
          `${id}_beam_${side}`,
          { width: length, height: 0.1, depth: 0.08 },
          scene
        );
        beam.position = new Vector3(
          posX - Math.sin(rotation) * (side * (width / 2 - 0.1)),
          posY + clearance - 0.06,
          posZ - Math.cos(rotation) * (side * (width / 2 - 0.1))
        );
        beam.rotation.y = rotation;
        beam.material = structMat;
        meshes.push(beam);
      }

      // Support posts
      const postCount = Math.ceil(length / 3) + 1;
      for (let p = 0; p < postCount; p++) {
        const postX = (p / (postCount - 1) - 0.5) * length;
        for (const side of [-1, 1]) {
          const post = MeshBuilder.CreateCylinder(
            `${id}_post_${p}_${side}`,
            { height: clearance, diameter: 0.08 },
            scene
          );
          post.position = new Vector3(
            posX + Math.cos(rotation) * postX - Math.sin(rotation) * (side * (width / 2 - 0.1)),
            posY + clearance / 2,
            posZ - Math.sin(rotation) * postX - Math.cos(rotation) * (side * (width / 2 - 0.1))
          );
          post.material = structMat;
          meshes.push(post);
        }
      }
    } else if (type === 'road') {
      // Concrete road bridge
      deckMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(conditionFactor);
      deckMat.metallic = 0;
      deckMat.roughness = 0.9;
      structMat.albedoColor = new Color3(0.55, 0.53, 0.5).scale(conditionFactor);
      structMat.metallic = 0;
      structMat.roughness = 0.85;

      // Main deck
      const deck = MeshBuilder.CreateBox(
        `${id}_deck`,
        { width: length, height: 0.3, depth: width },
        scene
      );
      deck.position = new Vector3(posX, posY + clearance, posZ);
      deck.rotation.y = rotation;
      deck.material = deckMat;
      meshes.push(deck);

      // Support pillars
      const pillarCount = Math.max(2, Math.ceil(length / 5));
      for (let p = 0; p < pillarCount; p++) {
        const pillarX = (p / (pillarCount - 1) - 0.5) * (length - 2);
        const pillar = MeshBuilder.CreateBox(
          `${id}_pillar_${p}`,
          { width: 0.8, height: clearance - 0.15, depth: width * 0.6 },
          scene
        );
        pillar.position = new Vector3(
          posX + Math.cos(rotation) * pillarX,
          posY + (clearance - 0.15) / 2,
          posZ - Math.sin(rotation) * pillarX
        );
        pillar.rotation.y = rotation;
        pillar.material = structMat;
        meshes.push(pillar);
      }

      // Curbs
      for (const side of [-1, 1]) {
        const curb = MeshBuilder.CreateBox(
          `${id}_curb_${side}`,
          { width: length, height: 0.15, depth: 0.2 },
          scene
        );
        curb.position = new Vector3(
          posX - Math.sin(rotation) * (side * (width / 2 - 0.1)),
          posY + clearance + 0.22,
          posZ - Math.cos(rotation) * (side * (width / 2 - 0.1))
        );
        curb.rotation.y = rotation;
        curb.material = structMat;
        meshes.push(curb);
      }
    } else if (type === 'suspension') {
      // Suspension bridge
      deckMat.albedoColor = new Color3(0.35, 0.37, 0.4).scale(conditionFactor);
      deckMat.metallic = 0.7;
      deckMat.roughness = 0.5;
      structMat.albedoColor = new Color3(0.7, 0.15, 0.1).scale(conditionFactor);
      structMat.metallic = 0.8;
      structMat.roughness = 0.35;

      // Deck
      const deck = MeshBuilder.CreateBox(
        `${id}_deck`,
        { width: length, height: 0.15, depth: width },
        scene
      );
      deck.position = new Vector3(posX, posY + clearance, posZ);
      deck.rotation.y = rotation;
      deck.material = deckMat;
      meshes.push(deck);

      // Towers
      const towerHeight = clearance + 3;
      for (const side of [-1, 1]) {
        const towerX = side * (length / 2 - 0.5);

        // Main tower
        const tower = MeshBuilder.CreateBox(
          `${id}_tower_${side}`,
          { width: 0.4, height: towerHeight, depth: width + 0.5 },
          scene
        );
        tower.position = new Vector3(
          posX + Math.cos(rotation) * towerX,
          posY + towerHeight / 2,
          posZ - Math.sin(rotation) * towerX
        );
        tower.rotation.y = rotation;
        tower.material = structMat;
        meshes.push(tower);

        // Tower top beam
        const topBeam = MeshBuilder.CreateBox(
          `${id}_topBeam_${side}`,
          { width: 0.5, height: 0.3, depth: width + 0.5 },
          scene
        );
        topBeam.position = new Vector3(
          posX + Math.cos(rotation) * towerX,
          posY + towerHeight + 0.15,
          posZ - Math.sin(rotation) * towerX
        );
        topBeam.rotation.y = rotation;
        topBeam.material = structMat;
        meshes.push(topBeam);
      }

      // Main cables
      const cableMat = new PBRMaterial(`bridge_cable_${id}`, scene);
      cableMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      cableMat.metallic = 0.9;
      cableMat.roughness = 0.3;

      const cableSegments = 20;
      for (const cableSide of [-1, 1]) {
        for (let s = 0; s < cableSegments; s++) {
          const t1 = s / cableSegments;
          const t2 = (s + 1) / cableSegments;
          const x1 = (t1 - 0.5) * length;
          const x2 = (t2 - 0.5) * length;
          const sag1 = Math.sin(t1 * Math.PI) * 1.5;
          const sag2 = Math.sin(t2 * Math.PI) * 1.5;
          const y1 = clearance + towerHeight - sag1;
          const y2 = clearance + towerHeight - sag2;

          const segLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          const cable = MeshBuilder.CreateCylinder(
            `${id}_cable_${cableSide}_${s}`,
            { height: segLength, diameter: 0.04 },
            scene
          );
          cable.position = new Vector3(
            posX +
              Math.cos(rotation) * ((x1 + x2) / 2) -
              Math.sin(rotation) * ((cableSide * width) / 2),
            posY + (y1 + y2) / 2,
            posZ -
              Math.sin(rotation) * ((x1 + x2) / 2) -
              Math.cos(rotation) * ((cableSide * width) / 2)
          );
          cable.rotation.z = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
          cable.rotation.y = rotation;
          cable.material = cableMat;
          meshes.push(cable);
        }
      }
    } else if (type === 'arch') {
      // Arched bridge
      deckMat.albedoColor = new Color3(0.5, 0.48, 0.45).scale(conditionFactor);
      deckMat.metallic = 0;
      deckMat.roughness = 0.85;
      structMat.albedoColor = new Color3(0.55, 0.35, 0.25).scale(conditionFactor);
      structMat.metallic = 0;
      structMat.roughness = 0.8;

      // Deck
      const deck = MeshBuilder.CreateBox(
        `${id}_deck`,
        { width: length, height: 0.2, depth: width },
        scene
      );
      deck.position = new Vector3(posX, posY + clearance, posZ);
      deck.rotation.y = rotation;
      deck.material = deckMat;
      meshes.push(deck);

      // Arch segments
      const archSegments = 12;
      for (let a = 0; a < archSegments; a++) {
        const t = a / archSegments;
        const archX = (t - 0.5) * length;
        const archHeight = Math.sin(t * Math.PI) * (clearance * 0.8);

        const segment = MeshBuilder.CreateBox(
          `${id}_arch_${a}`,
          { width: length / archSegments + 0.1, height: 0.3, depth: 0.4 },
          scene
        );
        segment.position = new Vector3(
          posX + Math.cos(rotation) * archX,
          posY + archHeight + 0.15,
          posZ - Math.sin(rotation) * archX
        );
        segment.rotation.y = rotation;
        segment.rotation.z = Math.cos(t * Math.PI) * 0.3;
        segment.material = structMat;
        meshes.push(segment);

        // Vertical supports
        if (archHeight < clearance - 0.3) {
          const support = MeshBuilder.CreateBox(
            `${id}_support_${a}`,
            { width: 0.15, height: clearance - archHeight - 0.2, depth: 0.2 },
            scene
          );
          support.position = new Vector3(
            posX + Math.cos(rotation) * archX,
            posY + archHeight + (clearance - archHeight) / 2,
            posZ - Math.sin(rotation) * archX
          );
          support.rotation.y = rotation;
          support.material = structMat;
          meshes.push(support);
        }
      }
    } else if (type === 'pontoon') {
      // Floating pontoon bridge
      deckMat.albedoColor = new Color3(0.4, 0.42, 0.45).scale(conditionFactor);
      deckMat.metallic = 0.7;
      deckMat.roughness = 0.5;
      structMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
      structMat.metallic = 0.8;
      structMat.roughness = 0.4;

      // Pontoon sections
      const pontoonCount = Math.ceil(length / 2);
      for (let p = 0; p < pontoonCount; p++) {
        const pontoonX = (p / pontoonCount - 0.5) * length + length / pontoonCount / 2;

        // Deck section
        const deckSection = MeshBuilder.CreateBox(
          `${id}_deckSection_${p}`,
          { width: length / pontoonCount - 0.1, height: 0.08, depth: width },
          scene
        );
        deckSection.position = new Vector3(
          posX + Math.cos(rotation) * pontoonX,
          posY + 0.3,
          posZ - Math.sin(rotation) * pontoonX
        );
        deckSection.rotation.y = rotation;
        deckSection.material = deckMat;
        meshes.push(deckSection);

        // Pontoon float
        const pontoon = MeshBuilder.CreateCylinder(
          `${id}_pontoon_${p}`,
          { height: width * 0.8, diameter: 0.5 },
          scene
        );
        pontoon.position = new Vector3(
          posX + Math.cos(rotation) * pontoonX,
          posY + 0.1,
          posZ - Math.sin(rotation) * pontoonX
        );
        pontoon.rotation.x = Math.PI / 2;
        pontoon.rotation.y = rotation;
        pontoon.material = structMat;
        meshes.push(pontoon);
      }
    } else if (type === 'drawbridge') {
      // Drawbridge
      deckMat.albedoColor = new Color3(0.4, 0.32, 0.2).scale(conditionFactor);
      deckMat.metallic = 0;
      deckMat.roughness = 0.85;
      structMat.albedoColor = new Color3(0.55, 0.35, 0.25).scale(conditionFactor);
      structMat.metallic = 0;
      structMat.roughness = 0.8;

      // Fixed sections on each end
      for (const side of [-1, 1]) {
        const fixedX = side * (length / 2 - length * 0.15);
        const fixedSection = MeshBuilder.CreateBox(
          `${id}_fixed_${side}`,
          { width: length * 0.3, height: 0.15, depth: width },
          scene
        );
        fixedSection.position = new Vector3(
          posX + Math.cos(rotation) * fixedX,
          posY + clearance,
          posZ - Math.sin(rotation) * fixedX
        );
        fixedSection.rotation.y = rotation;
        fixedSection.material = deckMat;
        meshes.push(fixedSection);

        // Towers
        const tower = MeshBuilder.CreateBox(
          `${id}_tower_${side}`,
          { width: 0.5, height: clearance + 2, depth: width + 0.5 },
          scene
        );
        tower.position = new Vector3(
          posX + Math.cos(rotation) * (side * (length / 2 - length * 0.3)),
          posY + (clearance + 2) / 2,
          posZ - Math.sin(rotation) * (side * (length / 2 - length * 0.3))
        );
        tower.rotation.y = rotation;
        tower.material = structMat;
        meshes.push(tower);
      }

      // Movable center section
      const centerSection = MeshBuilder.CreateBox(
        `${id}_center`,
        { width: length * 0.4, height: 0.15, depth: width },
        scene
      );
      centerSection.position = new Vector3(posX, posY + clearance, posZ);
      centerSection.rotation.y = rotation;
      centerSection.material = deckMat;
      meshes.push(centerSection);
    }

    // Railings
    if (hasRailings && type !== 'road') {
      railMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
      railMat.metallic = 0.8;
      railMat.roughness = 0.4;

      const railHeight = 1;

      for (const side of [-1, 1]) {
        // Posts
        const postCount = Math.ceil(length / 2) + 1;
        for (let p = 0; p < postCount; p++) {
          const postX = (p / (postCount - 1) - 0.5) * length;
          const post = MeshBuilder.CreateCylinder(
            `${id}_railPost_${side}_${p}`,
            { height: railHeight, diameter: 0.04 },
            scene
          );
          post.position = new Vector3(
            posX + Math.cos(rotation) * postX - Math.sin(rotation) * (side * (width / 2 - 0.05)),
            posY + clearance + railHeight / 2 + 0.05,
            posZ - Math.sin(rotation) * postX - Math.cos(rotation) * (side * (width / 2 - 0.05))
          );
          post.material = railMat;
          meshes.push(post);
        }

        // Top rail
        const topRail = MeshBuilder.CreateCylinder(
          `${id}_topRail_${side}`,
          { height: length, diameter: 0.03 },
          scene
        );
        topRail.position = new Vector3(
          posX - Math.sin(rotation) * (side * (width / 2 - 0.05)),
          posY + clearance + railHeight + 0.05,
          posZ - Math.cos(rotation) * (side * (width / 2 - 0.05))
        );
        topRail.rotation.z = Math.PI / 2;
        topRail.rotation.y = rotation;
        topRail.material = railMat;
        meshes.push(topRail);
      }
    }

    // Lights
    if (hasLights) {
      const lightMat = new PBRMaterial(`bridge_light_${id}`, scene);
      lightMat.albedoColor = new Color3(1, 0.95, 0.8);
      lightMat.emissiveColor = new Color3(1, 0.9, 0.7);
      lightMat.metallic = 0;
      lightMat.roughness = 0.3;

      const lightCount = Math.ceil(length / 5);
      for (let l = 0; l < lightCount; l++) {
        const lightX = (l / lightCount - 0.5) * length + length / lightCount / 2;
        for (const side of [-1, 1]) {
          // Light pole
          const pole = MeshBuilder.CreateCylinder(
            `${id}_lightPole_${l}_${side}`,
            { height: 2, diameter: 0.05 },
            scene
          );
          pole.position = new Vector3(
            posX + Math.cos(rotation) * lightX - Math.sin(rotation) * (side * (width / 2 - 0.1)),
            posY + clearance + 1.1,
            posZ - Math.sin(rotation) * lightX - Math.cos(rotation) * (side * (width / 2 - 0.1))
          );
          pole.material = railMat;
          meshes.push(pole);

          // Light fixture
          const light = MeshBuilder.CreateSphere(
            `${id}_light_${l}_${side}`,
            { diameter: 0.15 },
            scene
          );
          light.position = new Vector3(
            posX + Math.cos(rotation) * lightX - Math.sin(rotation) * (side * (width / 2 - 0.1)),
            posY + clearance + 2.15,
            posZ - Math.sin(rotation) * lightX - Math.cos(rotation) * (side * (width / 2 - 0.1))
          );
          light.material = lightMat;
          meshes.push(light);
        }
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      deckMat.dispose();
      structMat.dispose();
      railMat.dispose();
    };
  }, [
    scene,
    id,
    posX,
    posY,
    posZ,
    type,
    length,
    width,
    clearance,
    hasRailings,
    hasLights,
    rotation,
    condition,
    seed,
  ]);

  return null;
}
