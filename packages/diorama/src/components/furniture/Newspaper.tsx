/**
 * Newspaper - Scattered newspapers and magazines
 *
 * Newspapers, magazines, and printed material as urban clutter.
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

export type NewspaperType = 'single' | 'stack' | 'scattered' | 'stand';

export interface NewspaperProps {
  id: string;
  position: Vector3;
  /** Newspaper arrangement type */
  type?: NewspaperType;
  /** Number of papers (for stack/scattered) */
  count?: number;
  /** Whether papers are wet/damaged */
  isWet?: boolean;
  /** Whether papers are torn */
  isTorn?: boolean;
  /** Condition 0-1 */
  condition?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

// Standard newspaper/magazine dimensions
const PAPER_WIDTH = 0.3;
const PAPER_HEIGHT = 0.002;
const PAPER_DEPTH = 0.4;

export function Newspaper({
  id,
  position,
  type = 'single',
  count = 5,
  isWet = false,
  isTorn = false,
  condition = 0.8,
  rotation = 0,
  seed,
}: NewspaperProps) {
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

    // Base paper colors
    const paperColors = [
      new Color3(0.9, 0.88, 0.82), // Newsprint
      new Color3(0.95, 0.95, 0.92), // White magazine
      new Color3(0.85, 0.82, 0.75), // Aged paper
      new Color3(0.75, 0.72, 0.68), // Old/dirty
    ];

    // Create paper material
    const createPaperMat = (index: number, wet: boolean): PBRMaterial => {
      const mat = new PBRMaterial(`paper_${id}_${index}`, scene);
      const baseColor = rng
        ? paperColors[Math.floor(rng.next() * paperColors.length)]
        : paperColors[0];

      if (wet) {
        mat.albedoColor = baseColor.scale(0.6);
        mat.roughness = 0.5;
      } else {
        mat.albedoColor = baseColor.scale(condition);
        mat.roughness = 0.9;
      }
      mat.metallic = 0;
      materials.push(mat);
      return mat;
    };

    // Create ink/print detail material
    const inkMat = new PBRMaterial(`paper_ink_${id}`, scene);
    inkMat.albedoColor = new Color3(0.15, 0.15, 0.18);
    inkMat.metallic = 0;
    inkMat.roughness = 0.95;
    materials.push(inkMat);

    // Colored magazine material
    const magazineMat = new PBRMaterial(`paper_magazine_${id}`, scene);
    const magColors = [
      new Color3(0.8, 0.2, 0.2),
      new Color3(0.2, 0.5, 0.8),
      new Color3(0.8, 0.6, 0.1),
      new Color3(0.3, 0.7, 0.3),
    ];
    magazineMat.albedoColor = rng
      ? magColors[Math.floor(rng.next() * magColors.length)].scale(condition)
      : magColors[0].scale(condition);
    magazineMat.metallic = 0.1;
    magazineMat.roughness = 0.6;
    materials.push(magazineMat);

    if (type === 'single') {
      // Single newspaper laying flat
      const paper = MeshBuilder.CreateBox(
        `${id}_paper`,
        { width: PAPER_WIDTH, height: PAPER_HEIGHT, depth: PAPER_DEPTH },
        scene
      );
      paper.position = new Vector3(posX, posY + PAPER_HEIGHT / 2, posZ);
      paper.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.3 : 0);
      paper.material = createPaperMat(0, isWet);
      meshes.push(paper);

      // Add text lines (simplified as thin strips)
      const lineCount = 5 + (rng ? Math.floor(rng.next() * 4) : 3);
      for (let i = 0; i < lineCount; i++) {
        const lineWidth = PAPER_WIDTH * (0.3 + (rng ? rng.next() * 0.5 : 0.4));
        const lineZ = PAPER_DEPTH * 0.35 - (i / lineCount) * PAPER_DEPTH * 0.7;

        const line = MeshBuilder.CreateBox(
          `${id}_line_${i}`,
          { width: lineWidth, height: 0.0005, depth: 0.008 },
          scene
        );
        line.position = new Vector3(
          posX + (rng ? (rng.next() - 0.5) * 0.05 : 0),
          posY + PAPER_HEIGHT + 0.0003,
          posZ + lineZ
        );
        line.rotation.y = paper.rotation.y;
        line.material = inkMat;
        meshes.push(line);
      }

      // Add headline (thicker line)
      const headline = MeshBuilder.CreateBox(
        `${id}_headline`,
        { width: PAPER_WIDTH * 0.7, height: 0.0005, depth: 0.02 },
        scene
      );
      headline.position = new Vector3(
        posX,
        posY + PAPER_HEIGHT + 0.0003,
        posZ + PAPER_DEPTH * 0.38
      );
      headline.rotation.y = paper.rotation.y;
      headline.material = inkMat;
      meshes.push(headline);

      // Add torn edges if damaged
      if (isTorn && rng) {
        const tearCount = 2 + Math.floor(rng.next() * 3);
        for (let i = 0; i < tearCount; i++) {
          const tearEdge = rng.next() < 0.5 ? 'x' : 'z';
          const tearPos = (rng.next() - 0.5) * (tearEdge === 'x' ? PAPER_DEPTH : PAPER_WIDTH) * 0.8;
          const tearSize = 0.02 + rng.next() * 0.04;

          const tear = MeshBuilder.CreateBox(
            `${id}_tear_${i}`,
            {
              width: tearEdge === 'x' ? tearSize : 0.01,
              height: PAPER_HEIGHT * 2,
              depth: tearEdge === 'z' ? tearSize : 0.01,
            },
            scene
          );
          tear.position = new Vector3(
            posX + (tearEdge === 'z' ? ((rng.next() > 0.5 ? 1 : -1) * PAPER_WIDTH) / 2 : tearPos),
            posY + PAPER_HEIGHT / 2,
            posZ + (tearEdge === 'x' ? ((rng.next() > 0.5 ? 1 : -1) * PAPER_DEPTH) / 2 : tearPos)
          );
          tear.rotation.y = paper.rotation.y + (rng.next() - 0.5) * 0.5;
          tear.material = createPaperMat(100 + i, isWet);
          meshes.push(tear);
        }
      }
    } else if (type === 'stack') {
      // Stack of papers
      const actualCount = Math.min(count, 20);

      for (let i = 0; i < actualCount; i++) {
        const stackHeight = i * (PAPER_HEIGHT + 0.002);
        const offsetX = rng ? (rng.next() - 0.5) * 0.03 : 0;
        const offsetZ = rng ? (rng.next() - 0.5) * 0.03 : 0;
        const rotOffset = rng ? (rng.next() - 0.5) * 0.15 : 0;

        const paper = MeshBuilder.CreateBox(
          `${id}_paper_${i}`,
          { width: PAPER_WIDTH, height: PAPER_HEIGHT, depth: PAPER_DEPTH },
          scene
        );
        paper.position = new Vector3(
          posX + offsetX,
          posY + PAPER_HEIGHT / 2 + stackHeight,
          posZ + offsetZ
        );
        paper.rotation.y = rotation + rotOffset;

        // Alternate between newspaper and magazine
        const isMagazine = rng ? rng.next() > 0.7 : i % 4 === 0;
        paper.material = isMagazine ? magazineMat : createPaperMat(i, isWet && i < actualCount / 3);
        meshes.push(paper);
      }

      // Add binding/rubber band around stack
      if (actualCount > 3) {
        const bandMat = new PBRMaterial(`paper_band_${id}`, scene);
        bandMat.albedoColor = new Color3(0.6, 0.5, 0.3);
        bandMat.metallic = 0;
        bandMat.roughness = 0.8;
        materials.push(bandMat);

        const bandHeight = (actualCount * (PAPER_HEIGHT + 0.002)) / 2;
        const band = MeshBuilder.CreateTorus(
          `${id}_band`,
          {
            diameter: Math.max(PAPER_WIDTH, PAPER_DEPTH) + 0.02,
            thickness: 0.005,
            tessellation: 24,
          },
          scene
        );
        band.position = new Vector3(posX, posY + bandHeight, posZ);
        band.rotation.x = Math.PI / 2;
        band.rotation.y = rotation;
        band.material = bandMat;
        meshes.push(band);
      }
    } else if (type === 'scattered') {
      // Scattered papers across an area
      const actualCount = Math.min(count, 15);
      const scatterRadius = 0.5 + actualCount * 0.1;

      for (let i = 0; i < actualCount; i++) {
        const angle = rng ? rng.next() * Math.PI * 2 : (i / actualCount) * Math.PI * 2;
        const dist = rng ? rng.next() * scatterRadius : (i / actualCount) * scatterRadius;
        const paperX = posX + Math.cos(angle) * dist;
        const paperZ = posZ + Math.sin(angle) * dist;

        // Randomly size papers (some are full, some are sections)
        const widthScale = rng ? 0.5 + rng.next() * 0.5 : 0.75;
        const depthScale = rng ? 0.5 + rng.next() * 0.5 : 0.75;

        const paper = MeshBuilder.CreateBox(
          `${id}_paper_${i}`,
          {
            width: PAPER_WIDTH * widthScale,
            height: PAPER_HEIGHT,
            depth: PAPER_DEPTH * depthScale,
          },
          scene
        );
        paper.position = new Vector3(
          paperX,
          posY + PAPER_HEIGHT / 2 + (rng ? rng.next() * 0.01 : 0),
          paperZ
        );
        paper.rotation.y = rng ? rng.next() * Math.PI * 2 : rotation + i * 0.5;

        // Some papers are crumpled (slightly rotated on other axes)
        if (rng && rng.next() > 0.6) {
          paper.rotation.x = (rng.next() - 0.5) * 0.2;
          paper.rotation.z = (rng.next() - 0.5) * 0.2;
        }

        const isMagazine = rng ? rng.next() > 0.75 : false;
        paper.material = isMagazine ? magazineMat : createPaperMat(i, isWet);
        meshes.push(paper);

        // Add some crumpled balls
        if (rng && rng.next() > 0.7) {
          const crumple = MeshBuilder.CreateSphere(
            `${id}_crumple_${i}`,
            { diameter: 0.04 + rng.next() * 0.03, segments: 6 },
            scene
          );
          crumple.position = new Vector3(
            paperX + (rng.next() - 0.5) * 0.2,
            posY + 0.02,
            paperZ + (rng.next() - 0.5) * 0.2
          );
          crumple.scaling = new Vector3(
            0.8 + rng.next() * 0.4,
            0.6 + rng.next() * 0.3,
            0.8 + rng.next() * 0.4
          );
          crumple.material = createPaperMat(100 + i, isWet);
          meshes.push(crumple);
        }
      }
    } else if (type === 'stand') {
      // Newspaper stand/rack
      const standMat = new PBRMaterial(`paper_stand_${id}`, scene);
      standMat.albedoColor = new Color3(0.3, 0.32, 0.35).scale(condition);
      standMat.metallic = 0.7;
      standMat.roughness = 0.5;
      materials.push(standMat);

      const standWidth = 0.8;
      const standHeight = 1.2;
      const standDepth = 0.4;

      // Main frame
      const frame = MeshBuilder.CreateBox(
        `${id}_frame`,
        { width: standWidth, height: standHeight, depth: 0.03 },
        scene
      );
      frame.position = new Vector3(posX, posY + standHeight / 2, posZ - standDepth / 2);
      frame.rotation.y = rotation;
      frame.material = standMat;
      meshes.push(frame);

      // Side panels
      for (const side of [-1, 1]) {
        const sidePanel = MeshBuilder.CreateBox(
          `${id}_side_${side}`,
          { width: 0.02, height: standHeight, depth: standDepth },
          scene
        );
        sidePanel.position = new Vector3(
          posX + Math.cos(rotation) * ((side * standWidth) / 2),
          posY + standHeight / 2,
          posZ - Math.sin(rotation) * ((side * standWidth) / 2)
        );
        sidePanel.rotation.y = rotation;
        sidePanel.material = standMat;
        meshes.push(sidePanel);
      }

      // Shelves with papers
      const shelfCount = 3;
      const actualPaperCount = Math.min(count, 8);

      for (let s = 0; s < shelfCount; s++) {
        const shelfY = posY + 0.3 + s * 0.35;

        // Shelf
        const shelf = MeshBuilder.CreateBox(
          `${id}_shelf_${s}`,
          { width: standWidth - 0.04, height: 0.02, depth: standDepth - 0.05 },
          scene
        );
        shelf.position = new Vector3(posX, shelfY, posZ);
        shelf.rotation.y = rotation;
        shelf.material = standMat;
        meshes.push(shelf);

        // Papers on shelf
        const papersOnShelf =
          Math.floor(actualPaperCount / shelfCount) + (s === 0 ? actualPaperCount % shelfCount : 0);

        for (let p = 0; p < papersOnShelf; p++) {
          const paperX = (p - (papersOnShelf - 1) / 2) * 0.15;

          const paper = MeshBuilder.CreateBox(
            `${id}_shelfPaper_${s}_${p}`,
            {
              width: PAPER_WIDTH * 0.9,
              height: PAPER_HEIGHT * 3,
              depth: PAPER_DEPTH * 0.9,
            },
            scene
          );

          // Papers lean back slightly
          paper.position = new Vector3(
            posX + Math.cos(rotation) * paperX,
            shelfY + PAPER_DEPTH * 0.45 + 0.02,
            posZ - Math.sin(rotation) * paperX - standDepth * 0.2
          );
          paper.rotation.x = -0.3;
          paper.rotation.y = rotation + (rng ? (rng.next() - 0.5) * 0.1 : 0);

          const isMagazine = rng ? rng.next() > 0.5 : p % 2 === 0;
          paper.material = isMagazine ? magazineMat : createPaperMat(s * 10 + p, false);
          meshes.push(paper);
        }
      }

      // Header sign
      const signMat = new PBRMaterial(`paper_sign_${id}`, scene);
      signMat.albedoColor = new Color3(0.2, 0.35, 0.6).scale(condition);
      signMat.metallic = 0.1;
      signMat.roughness = 0.7;
      materials.push(signMat);

      const sign = MeshBuilder.CreateBox(
        `${id}_sign`,
        { width: standWidth - 0.1, height: 0.15, depth: 0.02 },
        scene
      );
      sign.position = new Vector3(posX, posY + standHeight + 0.08, posZ - standDepth / 2 + 0.02);
      sign.rotation.y = rotation;
      sign.material = signMat;
      meshes.push(sign);
    }

    // Add water damage effects
    if (isWet && rng) {
      const waterMat = new PBRMaterial(`paper_water_${id}`, scene);
      waterMat.albedoColor = new Color3(0.4, 0.42, 0.45);
      waterMat.metallic = 0.1;
      waterMat.roughness = 0.4;
      waterMat.alpha = 0.3;
      materials.push(waterMat);

      const stainCount = 2 + Math.floor(rng.next() * 4);
      for (let i = 0; i < stainCount; i++) {
        const stainX = (rng.next() - 0.5) * PAPER_WIDTH * 1.5;
        const stainZ = (rng.next() - 0.5) * PAPER_DEPTH * 1.5;
        const stainSize = 0.03 + rng.next() * 0.06;

        const stain = MeshBuilder.CreateDisc(
          `${id}_waterStain_${i}`,
          { radius: stainSize, tessellation: 8 },
          scene
        );
        stain.position = new Vector3(
          posX + Math.cos(rotation) * stainX - Math.sin(rotation) * stainZ,
          posY + 0.004,
          posZ + Math.sin(rotation) * stainX + Math.cos(rotation) * stainZ
        );
        stain.rotation.x = -Math.PI / 2;
        stain.material = waterMat;
        meshes.push(stain);
      }
    }

    // Add dirt/grime for low condition
    if (condition < 0.5 && rng) {
      const grimeMat = new PBRMaterial(`paper_grime_${id}`, scene);
      grimeMat.albedoColor = new Color3(0.25, 0.22, 0.18);
      grimeMat.metallic = 0;
      grimeMat.roughness = 0.95;
      grimeMat.alpha = 0.5;
      materials.push(grimeMat);

      const grimeCount = 3 + Math.floor(rng.next() * 4);
      for (let i = 0; i < grimeCount; i++) {
        const grimeX = (rng.next() - 0.5) * PAPER_WIDTH * 2;
        const grimeZ = (rng.next() - 0.5) * PAPER_DEPTH * 2;
        const grimeSize = 0.02 + rng.next() * 0.05;

        const grime = MeshBuilder.CreateDisc(
          `${id}_grime_${i}`,
          { radius: grimeSize, tessellation: 6 },
          scene
        );
        grime.position = new Vector3(posX + grimeX, posY + 0.003, posZ + grimeZ);
        grime.rotation.x = -Math.PI / 2;
        grime.material = grimeMat;
        meshes.push(grime);
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
  }, [scene, id, posX, posY, posZ, type, count, isWet, isTorn, condition, rotation, seed]);

  return null;
}
