/**
 * Vent - Roof vents and exhaust components
 *
 * Various ventilation structures for rooftops in the flooded Neo-Tokyo environment.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type VentType = 'turbine' | 'box' | 'mushroom' | 'ridge';

export type VentCondition = 'pristine' | 'worn' | 'damaged' | 'rusted';

export interface VentProps {
  id: string;
  position: Vector3;
  /** Vent type */
  type?: VentType;
  /** Rotation (radians) */
  rotation?: number;
  /** Condition of the vent */
  condition?: VentCondition;
  /** Seed for procedural variation */
  seed?: number;
  /** Size of the vent */
  size?: number;
  /** Whether the vent is spinning (for turbine type) */
  isSpinning?: boolean;
  /** Whether it has a protective grate */
  hasGrate?: boolean;
}

const CONDITION_FACTORS: Record<VentCondition, number> = {
  pristine: 1.0,
  worn: 0.85,
  damaged: 0.7,
  rusted: 0.55,
};

export function Vent({
  id,
  position,
  type = 'turbine',
  rotation = 0,
  condition = 'worn',
  seed,
  size = 0.6,
  isSpinning = false,
  hasGrate = true,
}: VentProps) {
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
    const ageVariation = rng ? rng.next() * 0.08 : 0.04;

    // Main metal material
    const metalMat = new PBRMaterial(`vent_metal_${id}`, scene);
    metalMat.albedoColor = new Color3(
      0.55 * conditionFactor - ageVariation,
      0.57 * conditionFactor - ageVariation,
      0.6 * conditionFactor - ageVariation
    );
    metalMat.metallic = 0.85;
    metalMat.roughness = 0.35 + (1 - conditionFactor) * 0.3;
    materials.push(metalMat);

    // Grate material
    const grateMat = new PBRMaterial(`vent_grate_${id}`, scene);
    grateMat.albedoColor = new Color3(0.2, 0.2, 0.22);
    grateMat.metallic = 0.7;
    grateMat.roughness = 0.5;
    materials.push(grateMat);

    if (type === 'turbine') {
      // Turbine vent (whirlybird style)
      const baseHeight = size * 0.3;
      const turbineHeight = size * 0.8;
      const turbineDiameter = size;

      // Base collar
      const base = MeshBuilder.CreateCylinder(
        `${id}_base`,
        {
          height: baseHeight,
          diameter: turbineDiameter * 0.7,
          diameterTop: turbineDiameter * 0.85,
        },
        scene
      );
      base.position = new Vector3(posX, posY + baseHeight / 2, posZ);
      base.material = metalMat;
      meshes.push(base);

      // Turbine housing (simplified dome shape)
      const housing = MeshBuilder.CreateSphere(
        `${id}_housing`,
        { diameter: turbineDiameter, slice: 0.6 },
        scene
      );
      housing.position = new Vector3(posX, posY + baseHeight + turbineHeight * 0.3, posZ);
      housing.material = metalMat;
      meshes.push(housing);

      // Turbine fins (simplified as radial plates)
      const finCount = 12;
      for (let f = 0; f < finCount; f++) {
        const finAngle = (f / finCount) * Math.PI * 2 + rotation;
        const spinOffset = isSpinning ? rotation * 2 : 0;

        const fin = MeshBuilder.CreateBox(
          `${id}_fin_${f}`,
          {
            width: 0.02,
            height: turbineHeight * 0.5,
            depth: turbineDiameter * 0.35,
          },
          scene
        );
        fin.position = new Vector3(
          posX + Math.cos(finAngle + spinOffset) * turbineDiameter * 0.25,
          posY + baseHeight + turbineHeight * 0.35,
          posZ + Math.sin(finAngle + spinOffset) * turbineDiameter * 0.25
        );
        fin.rotation.y = finAngle + spinOffset + Math.PI / 2;
        fin.rotation.x = Math.PI / 12; // Slight angle for wind catch
        fin.material = metalMat;
        meshes.push(fin);
      }

      // Top cap
      const cap = MeshBuilder.CreateCylinder(
        `${id}_cap`,
        { height: 0.05, diameter: turbineDiameter * 0.15 },
        scene
      );
      cap.position = new Vector3(posX, posY + baseHeight + turbineHeight * 0.75, posZ);
      cap.material = metalMat;
      meshes.push(cap);
    } else if (type === 'box') {
      // Box exhaust vent
      const boxWidth = size;
      const boxHeight = size * 0.6;
      const boxDepth = size * 0.8;

      // Main box body
      const box = MeshBuilder.CreateBox(
        `${id}_box`,
        { width: boxWidth, height: boxHeight, depth: boxDepth },
        scene
      );
      box.position = new Vector3(posX, posY + boxHeight / 2, posZ);
      box.rotation.y = rotation;
      box.material = metalMat;
      meshes.push(box);

      // Top hood/cap with overhang
      const hood = MeshBuilder.CreateBox(
        `${id}_hood`,
        { width: boxWidth + 0.1, height: 0.05, depth: boxDepth + 0.15 },
        scene
      );
      hood.position = new Vector3(
        posX + Math.sin(rotation) * 0.03,
        posY + boxHeight + 0.025,
        posZ + Math.cos(rotation) * 0.03
      );
      hood.rotation.y = rotation;
      hood.material = metalMat;
      meshes.push(hood);

      // Louver slats on front
      const louverCount = 4;
      for (let l = 0; l < louverCount; l++) {
        const louver = MeshBuilder.CreateBox(
          `${id}_louver_${l}`,
          { width: boxWidth * 0.85, height: 0.02, depth: 0.08 },
          scene
        );
        louver.position = new Vector3(
          posX + Math.sin(rotation) * (boxDepth / 2 + 0.04),
          posY + boxHeight * 0.2 + l * ((boxHeight * 0.6) / louverCount),
          posZ + Math.cos(rotation) * (boxDepth / 2 + 0.04)
        );
        louver.rotation.y = rotation;
        louver.rotation.x = Math.PI / 6; // Angled down
        louver.material = metalMat;
        meshes.push(louver);
      }

      // Side flanges
      for (const side of [-1, 1]) {
        const flange = MeshBuilder.CreateBox(
          `${id}_flange_${side}`,
          { width: 0.03, height: boxHeight, depth: boxDepth },
          scene
        );
        flange.position = new Vector3(
          posX + Math.cos(rotation) * (side * (boxWidth / 2 + 0.015)),
          posY + boxHeight / 2,
          posZ - Math.sin(rotation) * (side * (boxWidth / 2 + 0.015))
        );
        flange.rotation.y = rotation;
        flange.material = metalMat;
        meshes.push(flange);
      }

      // Interior grate
      if (hasGrate) {
        const grate = MeshBuilder.CreateBox(
          `${id}_grate`,
          { width: boxWidth * 0.8, height: 0.02, depth: boxDepth * 0.7 },
          scene
        );
        grate.position = new Vector3(posX, posY + 0.01, posZ);
        grate.rotation.y = rotation;
        grate.material = grateMat;
        meshes.push(grate);

        // Grate mesh pattern
        const meshCount = 4;
        for (let mx = 0; mx < meshCount; mx++) {
          const meshBar = MeshBuilder.CreateBox(
            `${id}_mesh_${mx}`,
            { width: 0.01, height: 0.025, depth: boxDepth * 0.65 },
            scene
          );
          meshBar.position = new Vector3(
            posX + Math.cos(rotation) * ((mx - (meshCount - 1) / 2) * boxWidth * 0.2),
            posY + 0.02,
            posZ - Math.sin(rotation) * ((mx - (meshCount - 1) / 2) * boxWidth * 0.2)
          );
          meshBar.rotation.y = rotation;
          meshBar.material = grateMat;
          meshes.push(meshBar);
        }
      }
    } else if (type === 'mushroom') {
      // Mushroom cap vent
      const stemDiameter = size * 0.4;
      const stemHeight = size * 0.6;
      const capDiameter = size;
      const capHeight = size * 0.25;

      // Stem/pipe
      const stem = MeshBuilder.CreateCylinder(
        `${id}_stem`,
        { height: stemHeight, diameter: stemDiameter },
        scene
      );
      stem.position = new Vector3(posX, posY + stemHeight / 2, posZ);
      stem.material = metalMat;
      meshes.push(stem);

      // Mushroom cap
      const cap = MeshBuilder.CreateCylinder(
        `${id}_cap`,
        {
          height: capHeight,
          diameterTop: capDiameter * 0.3,
          diameterBottom: capDiameter,
        },
        scene
      );
      cap.position = new Vector3(posX, posY + stemHeight + capHeight / 2 + 0.05, posZ);
      cap.material = metalMat;
      meshes.push(cap);

      // Cap underside (hollow feeling)
      const capUnder = MeshBuilder.CreateCylinder(
        `${id}_cap_under`,
        { height: 0.03, diameter: capDiameter * 0.9 },
        scene
      );
      capUnder.position = new Vector3(posX, posY + stemHeight + 0.04, posZ);

      const underMat = new PBRMaterial(`vent_under_${id}`, scene);
      underMat.albedoColor = new Color3(0.15, 0.15, 0.17);
      underMat.metallic = 0.5;
      underMat.roughness = 0.7;
      materials.push(underMat);
      capUnder.material = underMat;
      meshes.push(capUnder);

      // Air gap ring
      const airGap = stemHeight * 0.1;
      const gapRing = MeshBuilder.CreateTorus(
        `${id}_gap_ring`,
        { diameter: stemDiameter + 0.02, thickness: 0.02 },
        scene
      );
      gapRing.position = new Vector3(posX, posY + stemHeight + airGap / 2, posZ);
      gapRing.rotation.x = Math.PI / 2;
      gapRing.material = metalMat;
      meshes.push(gapRing);

      // Inner grate at stem top
      if (hasGrate) {
        const innerGrate = MeshBuilder.CreateCylinder(
          `${id}_inner_grate`,
          { height: 0.02, diameter: stemDiameter * 0.85 },
          scene
        );
        innerGrate.position = new Vector3(posX, posY + stemHeight - 0.01, posZ);
        innerGrate.material = grateMat;
        meshes.push(innerGrate);

        // Cross bars
        for (let c = 0; c < 2; c++) {
          const crossBar = MeshBuilder.CreateBox(
            `${id}_cross_${c}`,
            { width: stemDiameter * 0.8, height: 0.03, depth: 0.02 },
            scene
          );
          crossBar.position = new Vector3(posX, posY + stemHeight - 0.01, posZ);
          crossBar.rotation.y = (c * Math.PI) / 2 + rotation;
          crossBar.material = grateMat;
          meshes.push(crossBar);
        }
      }

      // Mounting flange at base
      const flange = MeshBuilder.CreateCylinder(
        `${id}_flange`,
        { height: 0.03, diameter: stemDiameter + 0.15 },
        scene
      );
      flange.position = new Vector3(posX, posY + 0.015, posZ);
      flange.material = metalMat;
      meshes.push(flange);
    } else if (type === 'ridge') {
      // Ridge/roof vent (linear exhaust)
      const ridgeLength = size * 2;
      const ridgeWidth = size * 0.5;
      const ridgeHeight = size * 0.4;

      // Base frame
      const baseFrame = MeshBuilder.CreateBox(
        `${id}_base_frame`,
        { width: ridgeLength, height: 0.05, depth: ridgeWidth },
        scene
      );
      baseFrame.position = new Vector3(posX, posY + 0.025, posZ);
      baseFrame.rotation.y = rotation;
      baseFrame.material = metalMat;
      meshes.push(baseFrame);

      // A-frame cap
      const capAngle = Math.PI / 6;

      for (const side of [-1, 1]) {
        const capPanel = MeshBuilder.CreateBox(
          `${id}_cap_${side}`,
          {
            width: ridgeLength,
            height: ridgeWidth / Math.cos(capAngle) / 2,
            depth: 0.02,
          },
          scene
        );
        capPanel.position = new Vector3(
          posX,
          posY + 0.05 + ridgeHeight / 2,
          posZ + Math.cos(rotation) * (side * ridgeWidth * 0.2)
        );
        capPanel.rotation.y = rotation;
        capPanel.rotation.x = side * capAngle;
        capPanel.material = metalMat;
        meshes.push(capPanel);
      }

      // Ridge cap (top seam)
      const ridgeCap = MeshBuilder.CreateBox(
        `${id}_ridge_cap`,
        { width: ridgeLength, height: 0.04, depth: 0.06 },
        scene
      );
      ridgeCap.position = new Vector3(posX, posY + 0.05 + ridgeHeight, posZ);
      ridgeCap.rotation.y = rotation;
      ridgeCap.material = metalMat;
      meshes.push(ridgeCap);

      // End caps
      for (const end of [-1, 1]) {
        const endCap = MeshBuilder.CreateBox(
          `${id}_end_cap_${end}`,
          { width: 0.02, height: ridgeHeight + 0.05, depth: ridgeWidth },
          scene
        );
        endCap.position = new Vector3(
          posX + Math.cos(rotation) * ((end * ridgeLength) / 2),
          posY + ridgeHeight / 2 + 0.025,
          posZ - Math.sin(rotation) * ((end * ridgeLength) / 2)
        );
        endCap.rotation.y = rotation;
        endCap.material = metalMat;
        meshes.push(endCap);
      }

      // Mesh screen under the ridge
      if (hasGrate) {
        const screen = MeshBuilder.CreateBox(
          `${id}_screen`,
          { width: ridgeLength - 0.1, height: 0.02, depth: ridgeWidth - 0.1 },
          scene
        );
        screen.position = new Vector3(posX, posY + 0.06, posZ);
        screen.rotation.y = rotation;
        screen.material = grateMat;
        meshes.push(screen);
      }
    }

    // Rust/weathering for damaged condition
    if (condition === 'rusted' && rng) {
      const rustMat = new PBRMaterial(`vent_rust_${id}`, scene);
      rustMat.albedoColor = new Color3(0.5, 0.35, 0.2);
      rustMat.metallic = 0.3;
      rustMat.roughness = 0.9;
      rustMat.alpha = 0.6;
      materials.push(rustMat);

      const rustCount = 2 + Math.floor(rng.next() * 2);
      for (let r = 0; r < rustCount; r++) {
        const rustPatch = MeshBuilder.CreateBox(
          `${id}_rust_${r}`,
          {
            width: size * (0.1 + rng.next() * 0.15),
            height: size * (0.15 + rng.next() * 0.2),
            depth: 0.01,
          },
          scene
        );
        const patchAngle = rng.next() * Math.PI * 2;
        rustPatch.position = new Vector3(
          posX + Math.cos(patchAngle) * size * 0.3,
          posY + size * (0.2 + rng.next() * 0.4),
          posZ + Math.sin(patchAngle) * size * 0.3
        );
        rustPatch.rotation.y = patchAngle;
        rustPatch.material = rustMat;
        meshes.push(rustPatch);
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
  }, [scene, id, posX, posY, posZ, type, rotation, condition, seed, size, isSpinning, hasGrate]);

  return null;
}
