/**
 * Window - Window opening component
 *
 * Various window types for Japanese urban architecture.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type WindowType = 'single' | 'double' | 'sliding' | 'fixed' | 'shoji' | 'awning';
export type WindowState = 'open' | 'closed' | 'halfopen';

export interface WindowProps {
  id: string;
  position: Vector3;
  /** Window type */
  type?: WindowType;
  /** Window state */
  state?: WindowState;
  /** Width of window */
  width?: number;
  /** Height of window */
  height?: number;
  /** Has bars/grating */
  bars?: boolean;
  /** Has curtains/blinds inside */
  curtains?: boolean;
  /** Interior light visible (night effect) */
  lit?: boolean;
  /** Direction window faces (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

export function Window({
  id,
  position,
  type = 'sliding',
  state = 'closed',
  width = 1.2,
  height = 1,
  bars = false,
  curtains = false,
  lit = false,
  rotation = 0,
  seed,
}: WindowProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    // Frame material
    const frameMat = new PBRMaterial(`frame_mat_${id}`, scene);
    frameMat.albedoColor = new Color3(0.25, 0.25, 0.28);
    frameMat.metallic = 0.8;
    frameMat.roughness = 0.4;

    // Glass material
    const glassMat = new PBRMaterial(`glass_mat_${id}`, scene);
    glassMat.albedoColor = lit
      ? new Color3(0.9, 0.85, 0.6) // Warm interior light
      : new Color3(0.6, 0.65, 0.7); // Reflective glass
    glassMat.metallic = 0.1;
    glassMat.roughness = 0.05;
    glassMat.alpha = lit ? 0.7 : 0.4;

    const frameThickness = 0.04;
    const frameDepth = 0.08;
    const glassThickness = 0.01;

    // Window frame
    // Top
    const topFrame = MeshBuilder.CreateBox(
      `${id}_frame_top`,
      {
        width: width + frameThickness * 2,
        height: frameThickness,
        depth: frameDepth,
      },
      scene
    );
    topFrame.position = new Vector3(posX, posY + height + frameThickness / 2, posZ);
    topFrame.rotation.y = rotation;
    topFrame.material = frameMat;
    meshes.push(topFrame);

    // Bottom
    const bottomFrame = MeshBuilder.CreateBox(
      `${id}_frame_bottom`,
      {
        width: width + frameThickness * 2,
        height: frameThickness,
        depth: frameDepth,
      },
      scene
    );
    bottomFrame.position = new Vector3(posX, posY - frameThickness / 2, posZ);
    bottomFrame.rotation.y = rotation;
    bottomFrame.material = frameMat;
    meshes.push(bottomFrame);

    // Sides
    for (const side of [-1, 1]) {
      const sideFrame = MeshBuilder.CreateBox(
        `${id}_frame_side_${side}`,
        { width: frameThickness, height: height, depth: frameDepth },
        scene
      );
      sideFrame.position = new Vector3(
        posX + (side * (width + frameThickness)) / 2,
        posY + height / 2,
        posZ
      );
      sideFrame.rotation.y = rotation;
      sideFrame.material = frameMat;
      meshes.push(sideFrame);
    }

    // Glass panels based on type
    if (type === 'single' || type === 'fixed') {
      const glass = MeshBuilder.CreateBox(
        `${id}_glass`,
        { width: width * 0.95, height: height * 0.95, depth: glassThickness },
        scene
      );
      glass.position = new Vector3(posX, posY + height / 2, posZ);
      glass.rotation.y = rotation;
      glass.material = glassMat;
      meshes.push(glass);
    } else if (type === 'double') {
      for (const side of [-1, 1]) {
        const glass = MeshBuilder.CreateBox(
          `${id}_glass_${side}`,
          { width: width * 0.45, height: height * 0.95, depth: glassThickness },
          scene
        );
        glass.position = new Vector3(posX + (side * width) / 4, posY + height / 2, posZ);
        glass.rotation.y = rotation;
        glass.material = glassMat;
        meshes.push(glass);
      }

      // Center divider
      const divider = MeshBuilder.CreateBox(
        `${id}_divider`,
        { width: frameThickness, height: height, depth: frameDepth },
        scene
      );
      divider.position = new Vector3(posX, posY + height / 2, posZ);
      divider.rotation.y = rotation;
      divider.material = frameMat;
      meshes.push(divider);
    } else if (type === 'sliding') {
      const slideOffset = state === 'open' ? width * 0.4 : state === 'halfopen' ? width * 0.2 : 0;

      // Fixed pane
      const fixedGlass = MeshBuilder.CreateBox(
        `${id}_glass_fixed`,
        { width: width * 0.48, height: height * 0.95, depth: glassThickness },
        scene
      );
      fixedGlass.position = new Vector3(posX - width / 4, posY + height / 2, posZ);
      fixedGlass.rotation.y = rotation;
      fixedGlass.material = glassMat;
      meshes.push(fixedGlass);

      // Sliding pane
      const slidingGlass = MeshBuilder.CreateBox(
        `${id}_glass_sliding`,
        { width: width * 0.48, height: height * 0.95, depth: glassThickness },
        scene
      );
      slidingGlass.position = new Vector3(
        posX + width / 4 - slideOffset,
        posY + height / 2,
        posZ + 0.02
      );
      slidingGlass.rotation.y = rotation;
      slidingGlass.material = glassMat;
      meshes.push(slidingGlass);
    } else if (type === 'shoji') {
      // Traditional Japanese paper screen
      const shojiMat = new PBRMaterial(`shoji_mat_${id}`, scene);
      shojiMat.albedoColor = lit ? new Color3(1, 0.95, 0.85) : new Color3(0.95, 0.92, 0.88);
      shojiMat.metallic = 0;
      shojiMat.roughness = 0.95;
      shojiMat.alpha = lit ? 0.9 : 0.85;

      const slideOffset = state === 'open' ? width * 0.9 : state === 'halfopen' ? width * 0.45 : 0;

      // Paper panel
      const paper = MeshBuilder.CreateBox(
        `${id}_shoji_paper`,
        { width: width * 0.95, height: height * 0.95, depth: 0.01 },
        scene
      );
      paper.position = new Vector3(posX + slideOffset, posY + height / 2, posZ);
      paper.rotation.y = rotation;
      paper.material = shojiMat;
      meshes.push(paper);

      // Grid pattern
      const gridH = 4;
      const gridV = 3;
      for (let i = 1; i < gridH; i++) {
        const hBar = MeshBuilder.CreateBox(
          `${id}_shoji_h_${i}`,
          { width: width * 0.93, height: 0.015, depth: 0.02 },
          scene
        );
        hBar.position = new Vector3(posX + slideOffset, posY + (i / gridH) * height, posZ + 0.01);
        hBar.rotation.y = rotation;
        hBar.material = frameMat;
        meshes.push(hBar);
      }
      for (let i = 1; i < gridV; i++) {
        const vBar = MeshBuilder.CreateBox(
          `${id}_shoji_v_${i}`,
          { width: 0.015, height: height * 0.93, depth: 0.02 },
          scene
        );
        vBar.position = new Vector3(
          posX + slideOffset + (i / gridV - 0.5) * width,
          posY + height / 2,
          posZ + 0.01
        );
        vBar.rotation.y = rotation;
        vBar.material = frameMat;
        meshes.push(vBar);
      }
    } else if (type === 'awning') {
      const openAngle = state === 'open' ? Math.PI / 3 : state === 'halfopen' ? Math.PI / 6 : 0;

      const glass = MeshBuilder.CreateBox(
        `${id}_glass`,
        { width: width * 0.95, height: height * 0.95, depth: glassThickness },
        scene
      );
      glass.position = new Vector3(
        posX,
        posY + height / 2 + (Math.sin(openAngle) * height) / 2,
        posZ + (Math.cos(openAngle) * height) / 2 - height / 2
      );
      glass.rotation.x = openAngle;
      glass.rotation.y = rotation;
      glass.material = glassMat;
      meshes.push(glass);
    }

    // Security bars
    if (bars) {
      const barMat = new PBRMaterial(`bar_mat_${id}`, scene);
      barMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      barMat.metallic = 0.9;
      barMat.roughness = 0.4;

      const barCount = Math.floor(width / 0.15);
      for (let i = 0; i < barCount; i++) {
        const bar = MeshBuilder.CreateCylinder(
          `${id}_bar_${i}`,
          { height: height, diameter: 0.015 },
          scene
        );
        bar.position = new Vector3(
          posX + (i - barCount / 2 + 0.5) * (width / barCount),
          posY + height / 2,
          posZ + frameDepth / 2 + 0.01
        );
        bar.rotation.y = rotation;
        bar.material = barMat;
        meshes.push(bar);
      }
    }

    // Curtains
    if (curtains && state !== 'open') {
      const curtainMat = new PBRMaterial(`curtain_mat_${id}`, scene);
      const curtainColor = rng
        ? new Color3(rng.next() * 0.4 + 0.3, rng.next() * 0.4 + 0.3, rng.next() * 0.4 + 0.3)
        : new Color3(0.6, 0.55, 0.5);
      curtainMat.albedoColor = curtainColor;
      curtainMat.metallic = 0;
      curtainMat.roughness = 0.9;
      curtainMat.alpha = 0.85;

      const curtain = MeshBuilder.CreateBox(
        `${id}_curtain`,
        { width: width * 0.9, height: height * 0.9, depth: 0.02 },
        scene
      );
      curtain.position = new Vector3(posX, posY + height / 2, posZ - frameDepth / 2 - 0.02);
      curtain.rotation.y = rotation;
      curtain.material = curtainMat;
      meshes.push(curtain);
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      frameMat.dispose();
      glassMat.dispose();
    };
  }, [
    scene,
    id,
    posX,
    posY,
    posZ,
    type,
    state,
    width,
    height,
    bars,
    curtains,
    lit,
    rotation,
    seed,
  ]);

  return null;
}
