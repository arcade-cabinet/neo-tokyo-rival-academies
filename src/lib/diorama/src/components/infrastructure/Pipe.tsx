/**
 * Pipe - Exposed piping component
 *
 * Infrastructure element for industrial areas and utilities.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type PipeMaterial = 'metal' | 'copper' | 'pvc' | 'rusty';
export type PipeSize = 'small' | 'medium' | 'large';

export interface PipeProps {
  id: string;
  /** Start position (use with end) */
  start?: Vector3;
  /** End position (use with start) */
  end?: Vector3;
  /** Position (use with length and direction for simpler API) */
  position?: Vector3;
  /** Length of pipe (use with position) */
  length?: number;
  /** Direction the pipe extends (use with position and length, defaults to +X) */
  direction?: Vector3;
  /** Pipe material */
  material?: PipeMaterial;
  /** Pipe size */
  size?: PipeSize;
  /** Has flanges at ends */
  flanges?: boolean;
  /** Has valve */
  valve?: boolean;
  /** Valve position (0-1) along pipe */
  valvePosition?: number;
  /** Has insulation wrapping */
  insulated?: boolean;
  /** Rust/corrosion level 0-1 */
  corrosion?: number;
  /** Seed for procedural variation */
  seed?: number;
}

const SIZE_DIAMETERS: Record<PipeSize, number> = {
  small: 0.05,
  medium: 0.1,
  large: 0.2,
};

export function Pipe({
  id,
  start: startProp,
  end: endProp,
  position,
  length: lengthProp,
  direction: directionProp,
  material = 'metal',
  size = 'medium',
  flanges = false,
  valve = false,
  valvePosition = 0.5,
  insulated = false,
  corrosion = 0,
  seed,
}: PipeProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const diameter = SIZE_DIAMETERS[size];
    const corrosionVariation = corrosion * (rng ? rng.next() * 0.15 : 0.1);

    // Support both start/end and position/length/direction patterns
    let pipeStart: Vector3;
    let pipeEnd: Vector3;

    if (startProp && endProp) {
      // Use explicit start/end
      pipeStart = startProp;
      pipeEnd = endProp;
    } else if (position) {
      // Use position with length and direction
      const pipeLength = lengthProp ?? 2;
      const pipeDir = directionProp ?? new Vector3(1, 0, 0); // Default to +X
      pipeStart = position;
      pipeEnd = position.add(pipeDir.normalize().scale(pipeLength));
    } else {
      // Default fallback
      pipeStart = Vector3.Zero();
      pipeEnd = new Vector3(2, 0, 0);
    }

    // Calculate pipe length and direction
    const pipeDirection = pipeEnd.subtract(pipeStart);
    const length = pipeDirection.length();
    const center = pipeStart.add(pipeDirection.scale(0.5));

    // Calculate rotation to align cylinder
    const up = Vector3.Up();
    const angle = Math.acos(Vector3.Dot(pipeDirection.normalize(), up));
    const axis = Vector3.Cross(up, pipeDirection.normalize()).normalize();

    // Pipe material color
    let pipeColor: Color3;
    if (material === 'copper') {
      pipeColor = new Color3(
        0.72 - corrosionVariation,
        0.45 - corrosionVariation * 2,
        0.2 - corrosionVariation
      );
    } else if (material === 'pvc') {
      pipeColor = new Color3(0.9, 0.9, 0.92);
    } else if (material === 'rusty') {
      pipeColor = new Color3(0.5 - corrosionVariation, 0.3 - corrosionVariation, 0.15);
    } else {
      pipeColor = new Color3(
        0.45 - corrosionVariation,
        0.47 - corrosionVariation,
        0.5 - corrosionVariation
      );
    }

    // Main material
    const mat = new PBRMaterial(`pipe_mat_${id}`, scene);
    mat.albedoColor = pipeColor;
    mat.metallic = material === 'pvc' ? 0 : 0.8 - corrosion * 0.3;
    mat.roughness = material === 'pvc' ? 0.5 : 0.4 + corrosion * 0.4;

    // Main pipe body
    const pipe = MeshBuilder.CreateCylinder(`${id}_pipe`, { height: length, diameter }, scene);
    pipe.position = center;
    if (axis.length() > 0.001) {
      pipe.rotationQuaternion = null;
      pipe.rotate(axis, angle);
    }
    pipe.material = mat;
    meshes.push(pipe);

    // Insulation
    if (insulated) {
      const insulationMat = new PBRMaterial(`pipe_insulation_${id}`, scene);
      insulationMat.albedoColor = new Color3(0.8, 0.75, 0.65);
      insulationMat.metallic = 0;
      insulationMat.roughness = 0.95;

      const insulation = MeshBuilder.CreateCylinder(
        `${id}_insulation`,
        { height: length * 0.9, diameter: diameter * 1.5 },
        scene
      );
      insulation.position = center;
      if (axis.length() > 0.001) {
        insulation.rotationQuaternion = null;
        insulation.rotate(axis, angle);
      }
      insulation.material = insulationMat;
      meshes.push(insulation);

      // Tape bands
      const bandMat = new PBRMaterial(`pipe_band_${id}`, scene);
      bandMat.albedoColor = new Color3(0.3, 0.3, 0.32);
      bandMat.metallic = 0.7;
      bandMat.roughness = 0.5;

      const bandCount = Math.max(2, Math.floor(length / 0.5));
      for (let i = 0; i < bandCount; i++) {
        const t = (i + 0.5) / bandCount;
        const bandPos = pipeStart.add(pipeDirection.scale(t));

        const band = MeshBuilder.CreateTorus(
          `${id}_band_${i}`,
          { diameter: diameter * 1.6, thickness: 0.015 },
          scene
        );
        band.position = bandPos;
        if (axis.length() > 0.001) {
          band.rotationQuaternion = null;
          band.rotate(axis, angle);
          band.rotate(pipeDirection.normalize(), Math.PI / 2);
        } else {
          band.rotation.x = Math.PI / 2;
        }
        band.material = bandMat;
        meshes.push(band);
      }
    }

    // Flanges
    if (flanges) {
      const flangeMat = new PBRMaterial(`pipe_flange_${id}`, scene);
      flangeMat.albedoColor = new Color3(0.35, 0.37, 0.4);
      flangeMat.metallic = 0.85;
      flangeMat.roughness = 0.4;

      for (const pos of [pipeStart, pipeEnd]) {
        const flange = MeshBuilder.CreateCylinder(
          `${id}_flange_${pos === pipeStart ? 'start' : 'end'}`,
          { height: 0.03, diameter: diameter * 2 },
          scene
        );
        flange.position = pos;
        if (axis.length() > 0.001) {
          flange.rotationQuaternion = null;
          flange.rotate(axis, angle);
        }
        flange.material = flangeMat;
        meshes.push(flange);

        // Bolts
        const boltCount = size === 'large' ? 8 : size === 'medium' ? 6 : 4;
        for (let i = 0; i < boltCount; i++) {
          const boltAngle = (i / boltCount) * Math.PI * 2;
          const boltOffset = new Vector3(
            Math.cos(boltAngle) * diameter * 0.8,
            0,
            Math.sin(boltAngle) * diameter * 0.8
          );

          const bolt = MeshBuilder.CreateCylinder(
            `${id}_bolt_${pos === pipeStart ? 'start' : 'end'}_${i}`,
            { height: 0.04, diameter: 0.02 },
            scene
          );
          bolt.position = pos.add(boltOffset);
          if (axis.length() > 0.001) {
            bolt.rotationQuaternion = null;
            bolt.rotate(axis, angle);
          }
          bolt.material = flangeMat;
          meshes.push(bolt);
        }
      }
    }

    // Valve
    if (valve) {
      const valveMat = new PBRMaterial(`pipe_valve_${id}`, scene);
      valveMat.albedoColor = new Color3(0.6, 0.15, 0.15);
      valveMat.metallic = 0.7;
      valveMat.roughness = 0.4;

      const valvePos = pipeStart.add(pipeDirection.scale(valvePosition));

      // Valve body
      const valveBody = MeshBuilder.CreateCylinder(
        `${id}_valve_body`,
        { height: diameter * 1.5, diameter: diameter * 1.8 },
        scene
      );
      valveBody.position = valvePos;
      if (axis.length() > 0.001) {
        valveBody.rotationQuaternion = null;
        valveBody.rotate(axis, angle);
      }
      valveBody.material = mat;
      meshes.push(valveBody);

      // Valve handle/wheel
      const handleRadius = diameter * 1.5;
      const wheel = MeshBuilder.CreateTorus(
        `${id}_valve_wheel`,
        { diameter: handleRadius * 2, thickness: 0.02 },
        scene
      );

      // Position wheel perpendicular to pipe
      const perpendicular = Vector3.Cross(pipeDirection.normalize(), new Vector3(1, 0, 0));
      if (perpendicular.length() < 0.1) {
        perpendicular.copyFrom(Vector3.Cross(pipeDirection.normalize(), new Vector3(0, 0, 1)));
      }
      perpendicular.normalize();

      wheel.position = valvePos.add(perpendicular.scale(diameter + handleRadius));
      wheel.material = valveMat;
      meshes.push(wheel);

      // Wheel spokes
      const spokeCount = 4;
      for (let i = 0; i < spokeCount; i++) {
        const spoke = MeshBuilder.CreateCylinder(
          `${id}_spoke_${i}`,
          { height: handleRadius * 1.8, diameter: 0.015 },
          scene
        );
        spoke.position = wheel.position.clone();
        spoke.rotation.z = (i / spokeCount) * Math.PI;
        spoke.material = valveMat;
        meshes.push(spoke);
      }

      // Valve stem
      const stem = MeshBuilder.CreateCylinder(
        `${id}_valve_stem`,
        { height: diameter + handleRadius, diameter: 0.03 },
        scene
      );
      stem.position = valvePos.add(perpendicular.scale((diameter + handleRadius) / 2));
      stem.rotation.x = Math.PI / 2;
      stem.material = mat;
      meshes.push(stem);
    }

    // Corrosion details
    if (corrosion > 0.4 && rng && !insulated) {
      const rustMat = new PBRMaterial(`pipe_rust_${id}`, scene);
      rustMat.albedoColor = new Color3(0.5, 0.25, 0.1);
      rustMat.metallic = 0.2;
      rustMat.roughness = 0.95;
      rustMat.alpha = corrosion;

      const patchCount = Math.floor(corrosion * 5) + 1;
      for (let i = 0; i < patchCount; i++) {
        const t = rng.next();
        const patchPos = pipeStart.add(pipeDirection.scale(t));
        const patchAngle = rng.next() * Math.PI * 2;

        const patch = MeshBuilder.CreateBox(
          `${id}_rust_patch_${i}`,
          {
            width: 0.03 + rng.next() * 0.03,
            height: 0.05 + rng.next() * 0.05,
            depth: 0.01,
          },
          scene
        );

        const offset = new Vector3(
          Math.cos(patchAngle) * (diameter / 2 + 0.005),
          0,
          Math.sin(patchAngle) * (diameter / 2 + 0.005)
        );
        patch.position = patchPos.add(offset);
        patch.rotation.y = patchAngle;
        patch.material = rustMat;
        meshes.push(patch);
      }
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      mat.dispose();
    };
  }, [
    scene,
    id,
    startProp,
    endProp,
    position,
    lengthProp,
    directionProp,
    material,
    size,
    flanges,
    valve,
    valvePosition,
    insulated,
    corrosion,
    seed,
  ]);

  return null;
}
