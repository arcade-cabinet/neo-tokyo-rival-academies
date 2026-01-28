import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  PBRMaterial,
  type Scene,
  Vector3,
} from '@babylonjs/core';

export type RoofStyle = 'flat' | 'sloped' | 'canopy' | 'industrial' | 'glass';

export interface RoofOptions {
  id: string;
  position: Vector3;
  size: { width: number; depth: number; thickness?: number };
  style?: RoofStyle;
  slopeAngle?: number;
  slopeDirection?: number;
  color?: Color3;
  supportBeams?: boolean;
  beamCount?: number;
  edgeTrim?: boolean;
  edgeGlow?: Color3 | null;
  equipment?: boolean;
  equipmentDensity?: number;
  seed?: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export class RoofBuilder {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  build(options: RoofOptions) {
    const {
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
    } = options;

    const meshes: AbstractMesh[] = [];
    const thickness = size.thickness ?? 0.15;
    let seedCounter = seed;

    const nextRandom = () => {
      seedCounter++;
      return seededRandom(seedCounter);
    };

    const roofMat = new PBRMaterial(`roofMat_${id}`, this.scene);
    roofMat.albedoColor = color;
    roofMat.roughness = 0.8;
    roofMat.metallic = style === 'industrial' ? 0.4 : 0.1;

    const glassMat = new PBRMaterial(`glassMat_${id}`, this.scene);
    glassMat.albedoColor = new Color3(0.1, 0.15, 0.2);
    glassMat.alpha = 0.4;
    glassMat.roughness = 0.1;
    glassMat.metallic = 0.0;
    glassMat.subSurface.isTranslucencyEnabled = true;
    glassMat.subSurface.translucencyIntensity = 0.8;

    const metalMat = new PBRMaterial(`metalMat_${id}`, this.scene);
    metalMat.albedoColor = new Color3(0.15, 0.15, 0.18);
    metalMat.roughness = 0.5;
    metalMat.metallic = 0.7;

    const container = MeshBuilder.CreateBox(
      `roofContainer_${id}`,
      { width: 0.01, height: 0.01, depth: 0.01 },
      this.scene
    );
    container.position = position.clone();
    container.isVisible = false;
    meshes.push(container);

    switch (style) {
      case 'flat': {
        const roof = MeshBuilder.CreateBox(
          `roof_${id}`,
          { width: size.width, height: thickness, depth: size.depth },
          this.scene
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
          { width: size.width, height: thickness, depth: size.depth },
          this.scene
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
        const segments = 5;
        const segmentDepth = size.depth / segments;
        const curveHeight = size.depth * 0.1;

        for (let i = 0; i < segments; i++) {
          const t = i / (segments - 1);
          const curveY = Math.sin(t * Math.PI) * curveHeight;

          const segment = MeshBuilder.CreateBox(
            `canopy_${id}_${i}`,
            { width: size.width, height: thickness, depth: segmentDepth * 1.1 },
            this.scene
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
        const ridgeCount = Math.max(1, Math.floor(size.width / 0.5));
        const ridgeWidth = size.width / ridgeCount;
        for (let i = 0; i < ridgeCount; i++) {
          const ridge = MeshBuilder.CreateBox(
            `ridge_${id}_${i}`,
            { width: ridgeWidth * 0.9, height: thickness, depth: size.depth },
            this.scene
          );
          ridge.position = new Vector3(-size.width / 2 + ridgeWidth / 2 + i * ridgeWidth, 0, 0);
          ridge.material = roofMat;
          ridge.parent = container;
          meshes.push(ridge);
        }
        break;
      }
      case 'glass': {
        const roof = MeshBuilder.CreateBox(
          `roof_${id}`,
          { width: size.width, height: thickness, depth: size.depth },
          this.scene
        );
        roof.position = new Vector3(0, 0, 0);
        roof.material = glassMat;
        roof.parent = container;
        meshes.push(roof);
        break;
      }
    }

    if (supportBeams) {
      const beams = beamCount ?? Math.max(2, Math.floor(size.width / 2));
      for (let i = 0; i < beams; i++) {
        const beam = MeshBuilder.CreateBox(
          `beam_${id}_${i}`,
          { width: 0.2, height: 0.2, depth: size.depth },
          this.scene
        );
        beam.position = new Vector3(
          -size.width / 2 + (i + 1) * (size.width / (beams + 1)),
          -thickness / 2 - 0.1,
          0
        );
        beam.material = metalMat;
        beam.parent = container;
        meshes.push(beam);
      }
    }

    if (edgeTrim) {
      const trim = MeshBuilder.CreateBox(
        `trim_${id}`,
        { width: size.width + 0.2, height: thickness * 0.5, depth: size.depth + 0.2 },
        this.scene
      );
      trim.position = new Vector3(0, -thickness / 2 - 0.05, 0);
      trim.material = metalMat;
      trim.parent = container;
      meshes.push(trim);

      if (edgeGlow) {
        const glowMat = new PBRMaterial(`glow_${id}`, this.scene);
        glowMat.emissiveColor = edgeGlow;
        glowMat.albedoColor = edgeGlow.scale(0.4);
        glowMat.unlit = true;

        const glow = MeshBuilder.CreateBox(
          `glow_${id}`,
          { width: size.width + 0.3, height: 0.05, depth: size.depth + 0.3 },
          this.scene
        );
        glow.position = new Vector3(0, -thickness / 2 - 0.02, 0);
        glow.material = glowMat;
        glow.parent = container;
        meshes.push(glow);
      }
    }

    if (equipment) {
      const equipmentCount = Math.max(1, Math.floor(equipmentDensity));
      for (let i = 0; i < equipmentCount; i++) {
        const x = (nextRandom() - 0.5) * (size.width - 1);
        const z = (nextRandom() - 0.5) * (size.depth - 1);
        const eq = MeshBuilder.CreateBox(
          `equip_${id}_${i}`,
          { width: 0.8, height: 0.5, depth: 0.8 },
          this.scene
        );
        eq.position = new Vector3(x, thickness / 2 + 0.25, z);
        eq.material = metalMat;
        eq.parent = container;
        meshes.push(eq);
      }
    }

    this.meshes = meshes;
    return meshes;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    this.meshes = [];
  }
}
