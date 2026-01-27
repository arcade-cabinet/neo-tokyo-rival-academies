import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
  type AbstractMesh,
  type Material,
  type Scene,
} from '@babylonjs/core';

export type BackgroundTheme = 'flooded' | 'overcast' | 'sunset';

export interface BackgroundPanelsOptions {
  minX: number;
  maxX: number;
  height?: number;
  theme?: BackgroundTheme;
  sector?: string;
}

const THEME_TINTS: Record<BackgroundTheme, Color3> = {
  flooded: new Color3(0.15, 0.22, 0.32),
  overcast: new Color3(0.12, 0.14, 0.18),
  sunset: new Color3(0.3, 0.18, 0.14),
};

const THEME_EMISSIVE: Record<BackgroundTheme, number> = {
  flooded: 0.08,
  overcast: 0.04,
  sunset: 0.1,
};

export class BackgroundPanels {
  private meshes: AbstractMesh[] = [];
  private materials: Material[] = [];

  constructor(private readonly scene: Scene) {}

  build({ minX, maxX, height = 30, theme = 'flooded', sector = 'sector0' }: BackgroundPanelsOptions) {
    const tint = THEME_TINTS[theme];
    const emissiveIntensity = THEME_EMISSIVE[theme];
    const meshes: AbstractMesh[] = [];
    const materials: Material[] = [];

    const sceneWidth = maxX - minX;

    const farWidth = sceneWidth * 3;
    const farHeight = height * 0.6;
    const farPanel = MeshBuilder.CreatePlane('parallaxFar', { width: farWidth, height: farHeight }, this.scene);
    farPanel.position = new Vector3(0, farHeight * 0.8 + 5, -60);
    farPanel.rotation.x = -Math.PI / 12;

    const farMaterial = new StandardMaterial('parallaxFarMat', this.scene);
    farMaterial.diffuseTexture = new Texture(`/assets/backgrounds/${sector}/parallax_far/concept.png`, this.scene);
    farMaterial.specularColor = new Color3(0, 0, 0);
    farMaterial.emissiveColor = tint.scale(emissiveIntensity * 0.8);
    farMaterial.backFaceCulling = false;
    farPanel.material = farMaterial;
    meshes.push(farPanel);
    materials.push(farMaterial);

    const midWidth = sceneWidth * 2.5;
    const midHeight = height * 0.5;
    const midPanel = MeshBuilder.CreatePlane('parallaxMid', { width: midWidth, height: midHeight }, this.scene);
    midPanel.position = new Vector3(0, midHeight * 0.6 + 3, -45);
    midPanel.rotation.x = -Math.PI / 16;

    const midMaterial = new StandardMaterial('parallaxMidMat', this.scene);
    midMaterial.diffuseTexture = new Texture(`/assets/backgrounds/${sector}/parallax_mid/concept.png`, this.scene);
    midMaterial.specularColor = new Color3(0, 0, 0);
    midMaterial.emissiveColor = tint.scale(emissiveIntensity);
    midMaterial.backFaceCulling = false;
    midPanel.material = midMaterial;
    meshes.push(midPanel);
    materials.push(midMaterial);

    const wallHeight = height * 0.7;
    const wallWidth = wallHeight * (9 / 16);

    const leftPanel = MeshBuilder.CreatePlane('wallLeft', { width: wallWidth, height: wallHeight }, this.scene);
    leftPanel.position = new Vector3(minX - 15, wallHeight * 0.35, -30);
    leftPanel.rotation.y = Math.PI / 5;

    const leftMaterial = new StandardMaterial('wallLeftMat', this.scene);
    leftMaterial.diffuseTexture = new Texture(`/assets/backgrounds/${sector}/wall_left/concept.png`, this.scene);
    leftMaterial.specularColor = new Color3(0, 0, 0);
    leftMaterial.emissiveColor = tint.scale(emissiveIntensity * 1.2);
    leftMaterial.backFaceCulling = false;
    leftPanel.material = leftMaterial;
    meshes.push(leftPanel);
    materials.push(leftMaterial);

    const rightPanel = MeshBuilder.CreatePlane('wallRight', { width: wallWidth, height: wallHeight }, this.scene);
    rightPanel.position = new Vector3(maxX + 15, wallHeight * 0.35, -30);
    rightPanel.rotation.y = -Math.PI / 5;

    const rightMaterial = new StandardMaterial('wallRightMat', this.scene);
    rightMaterial.diffuseTexture = new Texture(`/assets/backgrounds/${sector}/wall_right/concept.png`, this.scene);
    rightMaterial.specularColor = new Color3(0, 0, 0);
    rightMaterial.emissiveColor = tint.scale(emissiveIntensity * 1.2);
    rightMaterial.backFaceCulling = false;
    rightPanel.material = rightMaterial;
    meshes.push(rightPanel);
    materials.push(rightMaterial);

    const backWidth = sceneWidth * 1.5;
    const backHeight = height * 0.35;
    const backPanel = MeshBuilder.CreatePlane('rooftopEdge', { width: backWidth, height: backHeight }, this.scene);
    backPanel.position = new Vector3(0, backHeight * 0.3 + 1, -32);
    backPanel.rotation.x = -Math.PI / 10;

    const backMaterial = new StandardMaterial('rooftopEdgeMat', this.scene);
    backMaterial.diffuseTexture = new Texture(`/assets/backgrounds/${sector}/rooftop/concept.png`, this.scene);
    backMaterial.specularColor = new Color3(0, 0, 0);
    backMaterial.emissiveColor = tint.scale(emissiveIntensity * 0.9);
    backMaterial.backFaceCulling = false;
    backPanel.material = backMaterial;
    meshes.push(backPanel);
    materials.push(backMaterial);

    this.meshes = meshes;
    this.materials = materials;
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    for (const material of this.materials) {
      material.dispose();
    }
    this.meshes = [];
    this.materials = [];
  }
}
