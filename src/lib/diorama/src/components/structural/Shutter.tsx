/**
 * Shutter - Window shutters component
 *
 * Various shutter types for buildings in Neo-Tokyo.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type ShutterType = 'louvered' | 'paneled' | 'bahama' | 'rolling';
export type ShutterState = 'closed' | 'open' | 'half' | 'broken';
export type ConditionType = 'pristine' | 'weathered' | 'rusted' | 'damaged';

export interface ShutterProps {
  id: string;
  position: Vector3;
  /** Shutter type */
  type?: ShutterType;
  /** Shutter state */
  state?: ShutterState;
  /** Width of shutter */
  width?: number;
  /** Height of shutter */
  height?: number;
  /** Physical condition */
  condition?: ConditionType;
  /** Direction shutter faces (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

const CONDITION_FACTORS: Record<ConditionType, { rust: number; roughness: number; warp: number }> =
  {
    pristine: { rust: 0, roughness: 0.4, warp: 0 },
    weathered: { rust: 0.2, roughness: 0.6, warp: 0.02 },
    rusted: { rust: 0.5, roughness: 0.75, warp: 0.04 },
    damaged: { rust: 0.7, roughness: 0.85, warp: 0.08 },
  };

export function Shutter({
  id,
  position,
  type = 'louvered',
  state = 'closed',
  width = 0.4,
  height = 1.0,
  condition = 'weathered',
  rotation = 0,
  seed,
}: ShutterProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const materials: PBRMaterial[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const conditionFactor = CONDITION_FACTORS[condition];
    const rustVariation = rng ? rng.next() * 0.1 : 0.05;

    // Shutter frame material
    const frameMat = new PBRMaterial(`shutter_frame_${id}`, scene);
    materials.push(frameMat);

    // Determine color based on type and condition
    let baseColor: Color3;
    if (type === 'rolling') {
      // Metal rolling shutter
      const rust = conditionFactor.rust + rustVariation;
      baseColor = new Color3(0.5 - rust * 0.15, 0.52 - rust * 0.2, 0.55 - rust * 0.25);
      frameMat.metallic = 0.85 - rust * 0.2;
    } else {
      // Wood/painted shutters
      const colors = [
        new Color3(0.15, 0.3, 0.2), // Dark green
        new Color3(0.2, 0.15, 0.1), // Dark brown
        new Color3(0.1, 0.15, 0.25), // Navy blue
        new Color3(0.4, 0.35, 0.3), // Tan
        new Color3(0.25, 0.1, 0.1), // Maroon
      ];
      baseColor = rng ? rng.pick(colors) : colors[0];
      // Fade color based on condition
      baseColor = baseColor.scale(1 - conditionFactor.rust * 0.3);
      frameMat.metallic = 0.1;
    }
    frameMat.albedoColor = baseColor;
    frameMat.roughness = conditionFactor.roughness;

    const frameThickness = 0.02;
    const louverThickness = 0.008;

    // Calculate state offset/angle
    let openAngle = 0;
    let rollOffset = 0;
    if (state === 'open') {
      openAngle = Math.PI / 2 - 0.1;
      rollOffset = height * 0.9;
    } else if (state === 'half') {
      openAngle = Math.PI / 4;
      rollOffset = height * 0.45;
    } else if (state === 'broken') {
      // Random broken angle
      openAngle = (rng ? rng.next() * 0.6 - 0.3 : 0.15) + 0.2;
    }

    if (type === 'louvered') {
      // Louvered shutters (horizontal slats at angle)
      // Frame
      const topFrame = MeshBuilder.CreateBox(
        `${id}_frame_top`,
        { width: width, height: frameThickness, depth: frameThickness },
        scene
      );
      topFrame.position = new Vector3(
        posX + (Math.sin(rotation + openAngle) * frameThickness) / 2,
        posY + height - frameThickness / 2,
        posZ + (Math.cos(rotation + openAngle) * frameThickness) / 2
      );
      topFrame.rotation.y = rotation + openAngle;
      topFrame.material = frameMat;
      meshes.push(topFrame);

      const bottomFrame = MeshBuilder.CreateBox(
        `${id}_frame_bottom`,
        { width: width, height: frameThickness, depth: frameThickness },
        scene
      );
      bottomFrame.position = new Vector3(
        posX + (Math.sin(rotation + openAngle) * frameThickness) / 2,
        posY + frameThickness / 2,
        posZ + (Math.cos(rotation + openAngle) * frameThickness) / 2
      );
      bottomFrame.rotation.y = rotation + openAngle;
      bottomFrame.material = frameMat;
      meshes.push(bottomFrame);

      // Side rails
      for (const side of [-1, 1]) {
        const sideRail = MeshBuilder.CreateBox(
          `${id}_rail_${side}`,
          {
            width: frameThickness,
            height: height - frameThickness * 2,
            depth: frameThickness,
          },
          scene
        );
        sideRail.position = new Vector3(
          posX +
            Math.cos(rotation + openAngle) * (side * (width / 2 - frameThickness / 2)) +
            (Math.sin(rotation + openAngle) * frameThickness) / 2,
          posY + height / 2,
          posZ -
            Math.sin(rotation + openAngle) * (side * (width / 2 - frameThickness / 2)) +
            (Math.cos(rotation + openAngle) * frameThickness) / 2
        );
        sideRail.rotation.y = rotation + openAngle;
        sideRail.material = frameMat;
        meshes.push(sideRail);
      }

      // Louver slats
      const louverCount = Math.floor((height - frameThickness * 2) / 0.04);
      const louverSpacing = (height - frameThickness * 2) / louverCount;

      for (let i = 0; i < louverCount; i++) {
        const warp =
          state === 'broken' && rng
            ? (rng.next() - 0.5) * conditionFactor.warp * 10
            : conditionFactor.warp * (rng ? rng.next() - 0.5 : 0);

        // Skip some louvers if broken
        if (state === 'broken' && rng && rng.next() < 0.15) continue;

        const louver = MeshBuilder.CreateBox(
          `${id}_louver_${i}`,
          {
            width: width - frameThickness * 2.5,
            height: louverThickness,
            depth: 0.025,
          },
          scene
        );
        louver.position = new Vector3(
          posX + Math.sin(rotation + openAngle) * 0.012,
          posY + frameThickness + (i + 0.5) * louverSpacing,
          posZ + Math.cos(rotation + openAngle) * 0.012
        );
        louver.rotation.y = rotation + openAngle;
        louver.rotation.x = Math.PI / 6 + warp; // Angled louvers
        louver.material = frameMat;
        meshes.push(louver);
      }
    } else if (type === 'paneled') {
      // Paneled shutters (solid panels in frame)
      // Outer frame
      const frame = MeshBuilder.CreateBox(
        `${id}_frame`,
        { width: width, height: height, depth: frameThickness },
        scene
      );
      frame.position = new Vector3(
        posX + (Math.sin(rotation + openAngle) * frameThickness) / 2,
        posY + height / 2,
        posZ + (Math.cos(rotation + openAngle) * frameThickness) / 2
      );
      frame.rotation.y = rotation + openAngle;
      frame.material = frameMat;
      meshes.push(frame);

      // Inner panels (recessed)
      const panelMat = new PBRMaterial(`panel_mat_${id}`, scene);
      panelMat.albedoColor = baseColor.scale(0.9);
      panelMat.metallic = frameMat.metallic;
      panelMat.roughness = frameMat.roughness;
      materials.push(panelMat);

      const panelRows = 2;
      const panelHeight = (height - frameThickness * 3) / panelRows;

      for (let row = 0; row < panelRows; row++) {
        // Skip panel if broken
        if (state === 'broken' && rng && rng.next() < 0.3) continue;

        const panel = MeshBuilder.CreateBox(
          `${id}_panel_${row}`,
          {
            width: width - frameThickness * 3,
            height: panelHeight - frameThickness,
            depth: frameThickness * 0.5,
          },
          scene
        );
        panel.position = new Vector3(
          posX + Math.sin(rotation + openAngle) * frameThickness * 0.25,
          posY + frameThickness * 1.5 + row * (panelHeight + frameThickness) + panelHeight / 2,
          posZ + Math.cos(rotation + openAngle) * frameThickness * 0.25
        );
        panel.rotation.y = rotation + openAngle;
        panel.material = panelMat;
        meshes.push(panel);

        // Panel border molding
        for (const side of ['top', 'bottom', 'left', 'right']) {
          const isHorizontal = side === 'top' || side === 'bottom';
          const moldingWidth = isHorizontal ? width - frameThickness * 4 : frameThickness * 0.4;
          const moldingHeight = isHorizontal
            ? frameThickness * 0.4
            : panelHeight - frameThickness * 1.5;

          const molding = MeshBuilder.CreateBox(
            `${id}_molding_${row}_${side}`,
            {
              width: moldingWidth,
              height: moldingHeight,
              depth: frameThickness * 0.3,
            },
            scene
          );

          let moldX = posX;
          let moldY =
            posY + frameThickness * 1.5 + row * (panelHeight + frameThickness) + panelHeight / 2;
          if (side === 'top') moldY += panelHeight / 2 - frameThickness * 0.5;
          if (side === 'bottom') moldY -= panelHeight / 2 - frameThickness * 0.5;
          if (side === 'left')
            moldX += Math.cos(rotation + openAngle) * -(width / 2 - frameThickness * 2);
          if (side === 'right')
            moldX += Math.cos(rotation + openAngle) * (width / 2 - frameThickness * 2);

          molding.position = new Vector3(
            moldX + Math.sin(rotation + openAngle) * frameThickness * 0.6,
            moldY,
            posZ +
              Math.cos(rotation + openAngle) * frameThickness * 0.6 +
              (side === 'left'
                ? -Math.sin(rotation + openAngle) * (width / 2 - frameThickness * 2)
                : side === 'right'
                  ? -Math.sin(rotation + openAngle) * -(width / 2 - frameThickness * 2)
                  : 0)
          );
          molding.rotation.y = rotation + openAngle;
          molding.material = frameMat;
          meshes.push(molding);
        }
      }
    } else if (type === 'bahama') {
      // Bahama shutters (hinged at top, angles outward)
      const bahamaAngle =
        state === 'open'
          ? Math.PI / 3
          : state === 'half'
            ? Math.PI / 5
            : state === 'broken'
              ? Math.PI / 4 + (rng ? rng.next() * 0.3 : 0.1)
              : Math.PI / 8;

      // Main panel
      const panel = MeshBuilder.CreateBox(
        `${id}_panel`,
        { width: width, height: height, depth: frameThickness },
        scene
      );
      panel.position = new Vector3(
        posX + Math.sin(rotation) * ((Math.sin(bahamaAngle) * height) / 2 + frameThickness / 2),
        posY + height - (Math.cos(bahamaAngle) * height) / 2,
        posZ + Math.cos(rotation) * ((Math.sin(bahamaAngle) * height) / 2 + frameThickness / 2)
      );
      panel.rotation.y = rotation;
      panel.rotation.x = -bahamaAngle;
      panel.material = frameMat;
      meshes.push(panel);

      // Louvers on bahama
      const louverCount = Math.floor(height / 0.06);
      for (let i = 0; i < louverCount; i++) {
        if (state === 'broken' && rng && rng.next() < 0.2) continue;

        const louverY = (i + 0.5) / louverCount;
        const louver = MeshBuilder.CreateBox(
          `${id}_louver_${i}`,
          { width: width * 0.9, height: louverThickness, depth: 0.02 },
          scene
        );

        // Position along angled panel
        louver.position = new Vector3(
          posX +
            Math.sin(rotation) * (Math.sin(bahamaAngle) * (1 - louverY) * height + frameThickness),
          posY + height - Math.cos(bahamaAngle) * (1 - louverY) * height,
          posZ +
            Math.cos(rotation) * (Math.sin(bahamaAngle) * (1 - louverY) * height + frameThickness)
        );
        louver.rotation.y = rotation;
        louver.rotation.x = -bahamaAngle + Math.PI / 8;
        louver.material = frameMat;
        meshes.push(louver);
      }

      // Support arms
      for (const side of [-1, 1]) {
        const arm = MeshBuilder.CreateBox(
          `${id}_arm_${side}`,
          {
            width: 0.015,
            height: Math.sin(bahamaAngle) * height * 0.8,
            depth: 0.015,
          },
          scene
        );
        arm.position = new Vector3(
          posX +
            Math.cos(rotation) * (side * (width / 2 - 0.05)) +
            Math.sin(rotation) * (Math.sin(bahamaAngle) * height * 0.4 + 0.05),
          posY + height * 0.7,
          posZ -
            Math.sin(rotation) * (side * (width / 2 - 0.05)) +
            Math.cos(rotation) * (Math.sin(bahamaAngle) * height * 0.4 + 0.05)
        );
        arm.rotation.y = rotation;
        arm.rotation.z = Math.PI / 2 - bahamaAngle * 0.9;
        arm.material = frameMat;
        meshes.push(arm);
      }

      // Top hinge line
      const hinge = MeshBuilder.CreateCylinder(
        `${id}_hinge`,
        { height: width, diameter: 0.015 },
        scene
      );
      hinge.position = new Vector3(
        posX + (Math.sin(rotation) * frameThickness) / 2,
        posY + height,
        posZ + (Math.cos(rotation) * frameThickness) / 2
      );
      hinge.rotation.z = Math.PI / 2;
      hinge.rotation.y = rotation;
      hinge.material = frameMat;
      meshes.push(hinge);
    } else if (type === 'rolling') {
      // Rolling metal shutter
      const slatHeight = 0.04;
      const slatDepth = 0.025;
      const visibleHeight = height - rollOffset;
      const slatCount = Math.ceil(visibleHeight / slatHeight);

      // Guide rails on sides
      const railMat = new PBRMaterial(`rail_mat_${id}`, scene);
      railMat.albedoColor = new Color3(0.35, 0.35, 0.38);
      railMat.metallic = 0.8;
      railMat.roughness = 0.5;
      materials.push(railMat);

      for (const side of [-1, 1]) {
        const rail = MeshBuilder.CreateBox(
          `${id}_rail_${side}`,
          { width: 0.04, height: height, depth: 0.05 },
          scene
        );
        rail.position = new Vector3(
          posX + Math.cos(rotation) * (side * (width / 2 + 0.02)),
          posY + height / 2,
          posZ - Math.sin(rotation) * (side * (width / 2 + 0.02))
        );
        rail.rotation.y = rotation;
        rail.material = railMat;
        meshes.push(rail);
      }

      // Slats
      for (let i = 0; i < slatCount; i++) {
        const slatY = posY + (i + 0.5) * slatHeight;

        // Add warp for damaged condition
        const warp =
          condition === 'damaged' && rng ? (rng.next() - 0.5) * conditionFactor.warp * 5 : 0;

        // Skip slats if broken (holes in shutter)
        if (state === 'broken' && rng && rng.next() < 0.1) continue;

        const slat = MeshBuilder.CreateBox(
          `${id}_slat_${i}`,
          { width: width - 0.01, height: slatHeight * 0.85, depth: slatDepth },
          scene
        );
        slat.position = new Vector3(
          posX + Math.sin(rotation) * (slatDepth / 2 + warp),
          slatY,
          posZ + Math.cos(rotation) * (slatDepth / 2 + warp)
        );
        slat.rotation.y = rotation;
        slat.material = frameMat;
        meshes.push(slat);

        // Interlocking lip
        const lip = MeshBuilder.CreateBox(
          `${id}_lip_${i}`,
          {
            width: width - 0.02,
            height: slatHeight * 0.2,
            depth: slatDepth * 0.6,
          },
          scene
        );
        lip.position = new Vector3(
          posX + Math.sin(rotation) * (slatDepth * 0.8 + warp),
          slatY - slatHeight * 0.35,
          posZ + Math.cos(rotation) * (slatDepth * 0.8 + warp)
        );
        lip.rotation.y = rotation;
        lip.material = frameMat;
        meshes.push(lip);
      }

      // Roll housing at top
      const housingRadius = 0.08;
      const housing = MeshBuilder.CreateCylinder(
        `${id}_housing`,
        { height: width + 0.1, diameter: housingRadius * 2 },
        scene
      );
      housing.position = new Vector3(
        posX + Math.sin(rotation) * (slatDepth + housingRadius * 0.5),
        posY + height + housingRadius,
        posZ + Math.cos(rotation) * (slatDepth + housingRadius * 0.5)
      );
      housing.rotation.z = Math.PI / 2;
      housing.rotation.y = rotation;
      housing.material = railMat;
      meshes.push(housing);

      // Housing cover
      const cover = MeshBuilder.CreateBox(
        `${id}_cover`,
        {
          width: width + 0.12,
          height: housingRadius * 2.2,
          depth: housingRadius * 2.5,
        },
        scene
      );
      cover.position = new Vector3(
        posX + Math.sin(rotation) * (slatDepth + housingRadius * 0.3),
        posY + height + housingRadius,
        posZ + Math.cos(rotation) * (slatDepth + housingRadius * 0.3)
      );
      cover.rotation.y = rotation;
      cover.material = railMat;
      meshes.push(cover);

      // Bottom bar/handle
      if (visibleHeight > 0.1) {
        const handleBar = MeshBuilder.CreateBox(
          `${id}_handle`,
          {
            width: width - 0.02,
            height: slatHeight * 1.2,
            depth: slatDepth * 1.5,
          },
          scene
        );
        handleBar.position = new Vector3(
          posX + Math.sin(rotation) * slatDepth * 0.8,
          posY + slatHeight * 0.6,
          posZ + Math.cos(rotation) * slatDepth * 0.8
        );
        handleBar.rotation.y = rotation;
        handleBar.material = railMat;
        meshes.push(handleBar);
      }
    }

    // Hinges (for non-rolling types)
    if (type !== 'rolling' && type !== 'bahama') {
      const hingeMat = new PBRMaterial(`hinge_mat_${id}`, scene);
      hingeMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      hingeMat.metallic = 0.85;
      hingeMat.roughness = 0.5 + conditionFactor.rust * 0.3;
      materials.push(hingeMat);

      const hingePositions = [0.15, 0.5, 0.85];
      for (const hp of hingePositions) {
        const hinge = MeshBuilder.CreateCylinder(
          `${id}_hinge_${hp}`,
          { height: 0.06, diameter: 0.015 },
          scene
        );
        hinge.position = new Vector3(
          posX + Math.cos(rotation + openAngle) * (-width / 2 - 0.01),
          posY + height * hp,
          posZ - Math.sin(rotation + openAngle) * (-width / 2 - 0.01)
        );
        hinge.material = hingeMat;
        meshes.push(hinge);
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
  }, [scene, id, posX, posY, posZ, type, state, width, height, condition, rotation, seed]);

  return null;
}
