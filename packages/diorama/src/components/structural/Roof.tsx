/**
 * Roof - Overhead structures component
 *
 * Reusable for:
 * - Building overhangs/canopies
 * - Interior ceilings
 * - Awnings over doorways
 * - Covered walkways
 * - Industrial rooftop equipment (AC units, vents)
 *
 * Different from Floor - this is OVERHEAD structures.
 */

import { type AbstractMesh, Color3, MeshBuilder, PBRMaterial, Vector3 } from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';

export type RoofStyle = 'flat' | 'sloped' | 'canopy' | 'industrial' | 'glass';

export interface RoofProps {
  /** Unique identifier */
  id: string;
  /** Position (center point of roof) */
  position: Vector3;
  /** Dimensions */
  size: { width: number; depth: number; thickness?: number };
  /** Roof style */
  style?: RoofStyle;
  /** For sloped roofs - angle in radians */
  slopeAngle?: number;
  /** Slope direction (0 = +X, PI/2 = +Z, etc) */
  slopeDirection?: number;
  /** Primary color/material tint */
  color?: Color3;
  /** Add support beams */
  supportBeams?: boolean;
  /** Number of support beams (auto if not specified) */
  beamCount?: number;
  /** Add edge trim/border */
  edgeTrim?: boolean;
  /** Edge glow color for cyberpunk effect */
  edgeGlow?: Color3 | null;
  /** Add industrial equipment (AC units, vents) */
  equipment?: boolean;
  /** Equipment density (1-5) */
  equipmentDensity?: number;
  /** Random seed for equipment placement */
  seed?: number;
  /** Callback when mesh is ready */
  onReady?: (mesh: AbstractMesh) => void;
}

// Simple seeded random
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Roof component
 */
export function Roof({
  id,
  position,
  size,
  style = 'flat',
  slopeAngle = 0.15,
  slopeDirection = 0,
  color = new Color3(0.3, 0.3, 0.35),
  supportBeams = false,
  beamCount,
  edgeTrim = false,
  edgeGlow = null,
  equipment = false,
  equipmentDensity = 2,
  seed = 12345,
  onReady,
}: RoofProps) {
  const scene = useScene();
  const meshesRef = useRef<AbstractMesh[]>([]);

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const thickness = size.thickness ?? 0.15;
    let seedCounter = seed;

    const nextRandom = () => {
      seedCounter++;
      return seededRandom(seedCounter);
    };

    // Main roof material
    const roofMat = new PBRMaterial(`roofMat_${id}`, scene);
    roofMat.albedoColor = color;
    roofMat.roughness = 0.8;
    roofMat.metallic = style === 'industrial' ? 0.4 : 0.1;

    // Glass material for glass roofs
    const glassMat = new PBRMaterial(`glassMat_${id}`, scene);
    glassMat.albedoColor = new Color3(0.1, 0.15, 0.2);
    glassMat.alpha = 0.4;
    glassMat.roughness = 0.1;
    glassMat.metallic = 0.0;
    glassMat.subSurface.isTranslucencyEnabled = true;
    glassMat.subSurface.translucencyIntensity = 0.8;

    // Metal material for beams/frames
    const metalMat = new PBRMaterial(`metalMat_${id}`, scene);
    metalMat.albedoColor = new Color3(0.15, 0.15, 0.18);
    metalMat.roughness = 0.5;
    metalMat.metallic = 0.7;

    // Container for rotation
    const container = MeshBuilder.CreateBox(
      `roofContainer_${id}`,
      { width: 0.01, height: 0.01, depth: 0.01 },
      scene
    );
    container.position = position.clone();
    container.isVisible = false;
    meshes.push(container);

    // Create roof based on style
    switch (style) {
      case 'flat': {
        const roof = MeshBuilder.CreateBox(
          `roof_${id}`,
          {
            width: size.width,
            height: thickness,
            depth: size.depth,
          },
          scene
        );
        roof.position = new Vector3(0, 0, 0);
        roof.material = roofMat;
        roof.parent = container;
        meshes.push(roof);
        break;
      }

      case 'sloped': {
        const roof = MeshBuilder.CreateBox(
          `roof_${id}`,
          {
            width: size.width,
            height: thickness,
            depth: size.depth,
          },
          scene
        );
        roof.position = new Vector3(0, 0, 0);
        roof.rotation.z = slopeAngle;
        roof.rotation.y = slopeDirection;
        roof.material = roofMat;
        roof.parent = container;
        meshes.push(roof);
        break;
      }

      case 'canopy': {
        // Slightly curved canopy using multiple segments
        const segments = 5;
        const segmentDepth = size.depth / segments;
        const curveHeight = size.depth * 0.1;

        for (let i = 0; i < segments; i++) {
          const t = i / (segments - 1);
          const curveY = Math.sin(t * Math.PI) * curveHeight;

          const segment = MeshBuilder.CreateBox(
            `canopy_${id}_${i}`,
            {
              width: size.width,
              height: thickness,
              depth: segmentDepth * 1.1,
            },
            scene
          );
          segment.position = new Vector3(
            0,
            curveY,
            -size.depth / 2 + segmentDepth / 2 + i * segmentDepth
          );
          segment.material = roofMat;
          segment.parent = container;
          meshes.push(segment);
        }
        break;
      }

      case 'industrial': {
        // Corrugated metal roof with ridges
        const ridgeCount = Math.floor(size.width / 0.5);
        const ridgeWidth = size.width / ridgeCount;

        for (let i = 0; i < ridgeCount; i++) {
          const ridge = MeshBuilder.CreateBox(
            `ridge_${id}_${i}`,
            {
              width: ridgeWidth * 0.9,
              height: thickness * (1 + (i % 2) * 0.5),
              depth: size.depth,
            },
            scene
          );
          ridge.position = new Vector3(
            -size.width / 2 + ridgeWidth / 2 + i * ridgeWidth,
            (i % 2) * thickness * 0.25,
            0
          );
          ridge.material = roofMat;
          ridge.parent = container;
          meshes.push(ridge);
        }
        break;
      }

      case 'glass': {
        // Glass panels with metal frame
        const panelCountX = Math.max(2, Math.floor(size.width / 2));
        const panelCountZ = Math.max(2, Math.floor(size.depth / 2));
        const panelWidth = size.width / panelCountX;
        const panelDepth = size.depth / panelCountZ;
        const frameThickness = 0.05;

        for (let x = 0; x < panelCountX; x++) {
          for (let z = 0; z < panelCountZ; z++) {
            // Glass panel
            const panel = MeshBuilder.CreateBox(
              `glassPanel_${id}_${x}_${z}`,
              {
                width: panelWidth - frameThickness * 2,
                height: thickness * 0.5,
                depth: panelDepth - frameThickness * 2,
              },
              scene
            );
            panel.position = new Vector3(
              -size.width / 2 + panelWidth / 2 + x * panelWidth,
              0,
              -size.depth / 2 + panelDepth / 2 + z * panelDepth
            );
            panel.material = glassMat;
            panel.parent = container;
            meshes.push(panel);
          }
        }

        // Frame grid
        for (let x = 0; x <= panelCountX; x++) {
          const frameX = MeshBuilder.CreateBox(
            `frameX_${id}_${x}`,
            {
              width: frameThickness,
              height: thickness,
              depth: size.depth,
            },
            scene
          );
          frameX.position = new Vector3(-size.width / 2 + x * panelWidth, 0, 0);
          frameX.material = metalMat;
          frameX.parent = container;
          meshes.push(frameX);
        }

        for (let z = 0; z <= panelCountZ; z++) {
          const frameZ = MeshBuilder.CreateBox(
            `frameZ_${id}_${z}`,
            {
              width: size.width,
              height: thickness,
              depth: frameThickness,
            },
            scene
          );
          frameZ.position = new Vector3(0, 0, -size.depth / 2 + z * panelDepth);
          frameZ.material = metalMat;
          frameZ.parent = container;
          meshes.push(frameZ);
        }
        break;
      }
    }

    // Support beams
    if (supportBeams) {
      const beamMat = new PBRMaterial(`beamMat_${id}`, scene);
      beamMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      beamMat.roughness = 0.6;
      beamMat.metallic = 0.5;

      const actualBeamCount = beamCount ?? Math.max(2, Math.floor(size.width / 3));
      const beamSpacing = size.width / (actualBeamCount - 1);
      const beamHeight = 2.5; // Standard support height

      for (let i = 0; i < actualBeamCount; i++) {
        const beam = MeshBuilder.CreateBox(
          `beam_${id}_${i}`,
          {
            width: 0.15,
            height: beamHeight,
            depth: 0.15,
          },
          scene
        );
        beam.position = new Vector3(
          -size.width / 2 + i * beamSpacing,
          -beamHeight / 2 - thickness / 2,
          size.depth / 2 - 0.2
        );
        beam.material = beamMat;
        beam.parent = container;
        meshes.push(beam);
      }
    }

    // Edge trim
    if (edgeTrim) {
      const trimMat = new PBRMaterial(`trimMat_${id}`, scene);
      trimMat.albedoColor = new Color3(0.12, 0.12, 0.14);
      trimMat.roughness = 0.5;
      trimMat.metallic = 0.6;

      const trimHeight = thickness * 2;
      const trimThickness = 0.08;

      // Four edges
      const edges = [
        {
          w: size.width + trimThickness * 2,
          d: trimThickness,
          x: 0,
          z: size.depth / 2,
        },
        {
          w: size.width + trimThickness * 2,
          d: trimThickness,
          x: 0,
          z: -size.depth / 2,
        },
        {
          w: trimThickness,
          d: size.depth,
          x: size.width / 2,
          z: 0,
        },
        {
          w: trimThickness,
          d: size.depth,
          x: -size.width / 2,
          z: 0,
        },
      ];

      edges.forEach((edge, i) => {
        const trim = MeshBuilder.CreateBox(
          `trim_${id}_${i}`,
          {
            width: edge.w,
            height: trimHeight,
            depth: edge.d,
          },
          scene
        );
        trim.position = new Vector3(edge.x, -thickness / 2, edge.z);
        trim.material = trimMat;
        trim.parent = container;
        meshes.push(trim);
      });
    }

    // Edge glow
    if (edgeGlow) {
      const glowMat = new PBRMaterial(`edgeGlowMat_${id}`, scene);
      glowMat.albedoColor = edgeGlow;
      glowMat.emissiveColor = edgeGlow.scale(2);
      glowMat.emissiveIntensity = 2;
      glowMat.unlit = true;

      const glowThickness = 0.03;
      const glowHeight = 0.05;

      const glowEdges = [
        {
          w: size.width,
          d: glowThickness,
          x: 0,
          z: size.depth / 2 + glowThickness,
        },
        {
          w: size.width,
          d: glowThickness,
          x: 0,
          z: -size.depth / 2 - glowThickness,
        },
        {
          w: glowThickness,
          d: size.depth,
          x: size.width / 2 + glowThickness,
          z: 0,
        },
        {
          w: glowThickness,
          d: size.depth,
          x: -size.width / 2 - glowThickness,
          z: 0,
        },
      ];

      glowEdges.forEach((edge, i) => {
        const glow = MeshBuilder.CreateBox(
          `glow_${id}_${i}`,
          {
            width: edge.w,
            height: glowHeight,
            depth: edge.d,
          },
          scene
        );
        glow.position = new Vector3(edge.x, -thickness / 2, edge.z);
        glow.material = glowMat;
        glow.parent = container;
        meshes.push(glow);
      });
    }

    // Industrial equipment
    if (equipment) {
      const equipMat = new PBRMaterial(`equipMat_${id}`, scene);
      equipMat.albedoColor = new Color3(0.25, 0.25, 0.28);
      equipMat.roughness = 0.7;
      equipMat.metallic = 0.4;

      const ventMat = new PBRMaterial(`ventMat_${id}`, scene);
      ventMat.albedoColor = new Color3(0.15, 0.15, 0.17);
      ventMat.roughness = 0.6;
      ventMat.metallic = 0.5;

      const equipCount = Math.floor(equipmentDensity * 2);
      const safeMargin = 1;

      for (let i = 0; i < equipCount; i++) {
        const eqType = Math.floor(nextRandom() * 3);
        const eqX = (nextRandom() - 0.5) * (size.width - safeMargin * 2);
        const eqZ = (nextRandom() - 0.5) * (size.depth - safeMargin * 2);

        switch (eqType) {
          case 0: {
            // AC Unit
            const acWidth = 0.8 + nextRandom() * 0.4;
            const acHeight = 0.5 + nextRandom() * 0.3;
            const acDepth = 0.6 + nextRandom() * 0.3;

            const ac = MeshBuilder.CreateBox(
              `ac_${id}_${i}`,
              {
                width: acWidth,
                height: acHeight,
                depth: acDepth,
              },
              scene
            );
            ac.position = new Vector3(eqX, thickness / 2 + acHeight / 2, eqZ);
            ac.material = equipMat;
            ac.parent = container;
            meshes.push(ac);

            // Fan grill on top
            const fan = MeshBuilder.CreateCylinder(
              `fan_${id}_${i}`,
              {
                diameter: acWidth * 0.7,
                height: 0.05,
              },
              scene
            );
            fan.position = new Vector3(eqX, thickness / 2 + acHeight + 0.025, eqZ);
            fan.material = ventMat;
            fan.parent = container;
            meshes.push(fan);
            break;
          }

          case 1: {
            // Vent pipe
            const pipeHeight = 0.5 + nextRandom() * 1;
            const pipeDiameter = 0.2 + nextRandom() * 0.2;

            const pipe = MeshBuilder.CreateCylinder(
              `pipe_${id}_${i}`,
              {
                diameter: pipeDiameter,
                height: pipeHeight,
              },
              scene
            );
            pipe.position = new Vector3(eqX, thickness / 2 + pipeHeight / 2, eqZ);
            pipe.material = ventMat;
            pipe.parent = container;
            meshes.push(pipe);

            // Cap
            const cap = MeshBuilder.CreateCylinder(
              `cap_${id}_${i}`,
              {
                diameter: pipeDiameter * 1.5,
                height: 0.1,
              },
              scene
            );
            cap.position = new Vector3(eqX, thickness / 2 + pipeHeight + 0.05, eqZ);
            cap.material = ventMat;
            cap.parent = container;
            meshes.push(cap);
            break;
          }

          case 2: {
            // Equipment box
            const boxSize = 0.4 + nextRandom() * 0.4;

            const box = MeshBuilder.CreateBox(
              `eqBox_${id}_${i}`,
              {
                width: boxSize,
                height: boxSize * 0.8,
                depth: boxSize * 0.6,
              },
              scene
            );
            box.position = new Vector3(eqX, thickness / 2 + (boxSize * 0.8) / 2, eqZ);
            box.material = equipMat;
            box.parent = container;
            meshes.push(box);
            break;
          }
        }
      }
    }

    meshesRef.current = meshes;

    if (onReady) {
      onReady(container);
    }

    return () => {
      for (const mesh of meshesRef.current) {
        mesh.dispose();
      }
      meshesRef.current = [];
    };
  }, [
    scene,
    id,
    position,
    size,
    style,
    slopeAngle,
    slopeDirection,
    color,
    supportBeams,
    beamCount,
    edgeTrim,
    edgeGlow,
    equipment,
    equipmentDensity,
    seed,
    onReady,
  ]);

  return null;
}

/**
 * Roof presets
 */
export const ROOF_PRESETS = {
  // Simple flat overhang
  overhang: {
    style: 'flat' as RoofStyle,
    size: { width: 4, depth: 2, thickness: 0.15 },
    edgeTrim: true,
  },
  // Shop awning
  awning: {
    style: 'canopy' as RoofStyle,
    size: { width: 3, depth: 1.5, thickness: 0.08 },
    color: new Color3(0.6, 0.1, 0.1),
    supportBeams: true,
    beamCount: 2,
  },
  // Industrial shed roof
  industrial_shed: {
    style: 'industrial' as RoofStyle,
    size: { width: 8, depth: 6, thickness: 0.1 },
    color: new Color3(0.35, 0.35, 0.4),
    equipment: true,
    equipmentDensity: 3,
  },
  // Glass skylight
  skylight: {
    style: 'glass' as RoofStyle,
    size: { width: 4, depth: 4, thickness: 0.1 },
    edgeGlow: new Color3(0, 0.8, 1),
  },
  // Covered walkway
  walkway: {
    style: 'flat' as RoofStyle,
    size: { width: 3, depth: 8, thickness: 0.12 },
    supportBeams: true,
    beamCount: 4,
    edgeGlow: new Color3(1, 0.5, 0),
  },
  // Cyberpunk neon roof
  neon_canopy: {
    style: 'flat' as RoofStyle,
    size: { width: 5, depth: 3, thickness: 0.1 },
    color: new Color3(0.08, 0.08, 0.1),
    edgeTrim: true,
    edgeGlow: new Color3(1, 0, 0.5),
  },
};

export default Roof;
