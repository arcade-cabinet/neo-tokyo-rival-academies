import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  PBRMaterial,
  type Scene,
  Vector3,
} from '@babylonjs/core';

export type NeonShape = 'rectangle' | 'circle' | 'arrow' | 'bar' | 'kanji' | 'skull';
export type NeonMountType = 'wall' | 'pole' | 'hanging' | 'ground';
export type NeonFaction = 'syndicate' | 'collective' | 'academy' | 'neutral';

export interface NeonSignOptions {
  id: string;
  position: Vector3;
  color: Color3;
  shape?: NeonShape;
  size?: { width: number; height: number };
  thickness?: number;
  rotation?: number;
  mount?: NeonMountType;
  intensity?: number;
  secondaryColor?: Color3 | null;
  isPowered?: boolean;
}

export const FACTION_COLORS: Record<NeonFaction, { primary: Color3; secondary: Color3 }> = {
  syndicate: {
    primary: new Color3(1, 0, 0.3),
    secondary: new Color3(1, 0.5, 0),
  },
  collective: {
    primary: new Color3(0.2, 0.8, 0.4),
    secondary: new Color3(0.2, 0.6, 1),
  },
  academy: {
    primary: new Color3(0.4, 0.6, 1),
    secondary: new Color3(1, 0.9, 0.6),
  },
  neutral: {
    primary: new Color3(0.7, 0.7, 0.8),
    secondary: new Color3(0.3, 0.9, 1),
  },
};

export class NeonSignBuilder {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  build(options: NeonSignOptions) {
    const {
      id,
      position,
      color,
      shape = 'rectangle',
      size = { width: 2, height: 1 },
      thickness = 0.08,
      rotation = 0,
      mount = 'wall',
      intensity = 3.0,
      secondaryColor = null,
      isPowered = true,
    } = options;

    const meshes: AbstractMesh[] = [];
    const createNeonMaterial = (neonColor: Color3, matId: string) => {
      const mat = new PBRMaterial(`neonMat_${id}_${matId}`, this.scene);
      mat.albedoColor = neonColor;
      mat.emissiveColor = neonColor.scale(2.5);
      mat.emissiveIntensity = isPowered ? intensity : 0.2;
      mat.unlit = true;
      return mat;
    };

    const primaryMat = createNeonMaterial(color, 'primary');
    const secondaryMat = secondaryColor
      ? createNeonMaterial(secondaryColor, 'secondary')
      : primaryMat;

    const container = MeshBuilder.CreateBox(
      `neonContainer_${id}`,
      { width: 0.01, height: 0.01, depth: 0.01 },
      this.scene
    );
    container.position = position.clone();
    container.rotation.y = rotation;
    container.isVisible = false;
    meshes.push(container);

    switch (shape) {
      case 'rectangle': {
        const halfW = size.width / 2;
        const halfH = size.height / 2;

        const top = MeshBuilder.CreateCylinder(
          `neon_${id}_top`,
          { diameter: thickness, height: size.width },
          this.scene
        );
        top.position = new Vector3(0, halfH, 0);
        top.rotation.z = Math.PI / 2;
        top.material = primaryMat;
        top.parent = container;
        meshes.push(top);

        const bottom = MeshBuilder.CreateCylinder(
          `neon_${id}_bottom`,
          { diameter: thickness, height: size.width },
          this.scene
        );
        bottom.position = new Vector3(0, -halfH, 0);
        bottom.rotation.z = Math.PI / 2;
        bottom.material = secondaryMat;
        bottom.parent = container;
        meshes.push(bottom);

        const left = MeshBuilder.CreateCylinder(
          `neon_${id}_left`,
          { diameter: thickness, height: size.height },
          this.scene
        );
        left.position = new Vector3(-halfW, 0, 0);
        left.material = primaryMat;
        left.parent = container;
        meshes.push(left);

        const right = MeshBuilder.CreateCylinder(
          `neon_${id}_right`,
          { diameter: thickness, height: size.height },
          this.scene
        );
        right.position = new Vector3(halfW, 0, 0);
        right.material = secondaryMat;
        right.parent = container;
        meshes.push(right);
        break;
      }
      case 'circle': {
        const torus = MeshBuilder.CreateTorus(
          `neon_${id}_circle`,
          { diameter: size.width, thickness, tessellation: 32 },
          this.scene
        );
        torus.rotation.x = Math.PI / 2;
        torus.material = primaryMat;
        torus.parent = container;
        meshes.push(torus);
        break;
      }
      case 'arrow': {
        const shaftLength = size.width * 0.7;
        const headSize = size.width * 0.3;

        const shaft = MeshBuilder.CreateCylinder(
          `neon_${id}_shaft`,
          { diameter: thickness, height: shaftLength },
          this.scene
        );
        shaft.position = new Vector3(-headSize / 2, 0, 0);
        shaft.rotation.z = Math.PI / 2;
        shaft.material = primaryMat;
        shaft.parent = container;
        meshes.push(shaft);

        const headTop = MeshBuilder.CreateCylinder(
          `neon_${id}_headTop`,
          { diameter: thickness, height: headSize * 0.8 },
          this.scene
        );
        headTop.position = new Vector3(shaftLength / 2 - headSize * 0.2, headSize * 0.25, 0);
        headTop.rotation.z = Math.PI / 4;
        headTop.material = secondaryMat;
        headTop.parent = container;
        meshes.push(headTop);

        const headBottom = MeshBuilder.CreateCylinder(
          `neon_${id}_headBottom`,
          { diameter: thickness, height: headSize * 0.8 },
          this.scene
        );
        headBottom.position = new Vector3(shaftLength / 2 - headSize * 0.2, -headSize * 0.25, 0);
        headBottom.rotation.z = -Math.PI / 4;
        headBottom.material = secondaryMat;
        headBottom.parent = container;
        meshes.push(headBottom);
        break;
      }
      case 'bar':
      case 'kanji':
      case 'skull': {
        const bar = MeshBuilder.CreateCylinder(
          `neon_${id}_bar`,
          { diameter: thickness, height: size.width },
          this.scene
        );
        bar.rotation.z = Math.PI / 2;
        bar.material = primaryMat;
        bar.parent = container;
        meshes.push(bar);
        break;
      }
    }

    if (mount === 'pole') {
      const poleMat = new PBRMaterial(`poleMat_${id}`, this.scene);
      poleMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      poleMat.metallic = 0.5;
      poleMat.roughness = 0.6;

      const pole = MeshBuilder.CreateCylinder(
        `pole_${id}`,
        { diameter: 0.1, height: 3 },
        this.scene
      );
      pole.position = new Vector3(0, -size.height / 2 - 1.5, 0.1);
      pole.material = poleMat;
      pole.parent = container;
      meshes.push(pole);
    } else if (mount === 'hanging') {
      const wireMat = new PBRMaterial(`wireMat_${id}`, this.scene);
      wireMat.albedoColor = new Color3(0.15, 0.15, 0.15);
      wireMat.metallic = 0.3;

      const wire = MeshBuilder.CreateCylinder(
        `wire_${id}`,
        { diameter: 0.02, height: 1 },
        this.scene
      );
      wire.position = new Vector3(0, size.height / 2 + 0.5, 0);
      wire.material = wireMat;
      wire.parent = container;
      meshes.push(wire);
    } else if (mount === 'wall') {
      const backMat = new PBRMaterial(`backMat_${id}`, this.scene);
      backMat.albedoColor = new Color3(0.1, 0.1, 0.12);
      backMat.metallic = 0.2;

      const back = MeshBuilder.CreateBox(
        `back_${id}`,
        { width: size.width * 0.8, height: size.height * 0.6, depth: 0.05 },
        this.scene
      );
      back.position = new Vector3(0, 0, 0.1);
      back.material = backMat;
      back.parent = container;
      meshes.push(back);
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
