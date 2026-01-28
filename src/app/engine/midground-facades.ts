import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

export interface MidgroundFacadesOptions {
  minX: number;
  maxX: number;
  height?: number;
  depth?: number;
}

interface WindowConfig {
  rows: number;
  cols: number;
  startY: number;
  spacing: number;
}

export class MidgroundFacades {
  private meshes: AbstractMesh[] = [];
  private materials: StandardMaterial[] = [];

  constructor(private readonly scene: Scene) {}

  build({ minX, maxX, height = 25, depth = -8 }: MidgroundFacadesOptions) {
    const meshes: AbstractMesh[] = [];
    const { buildingMat, windowMat, neonMat, roofMat } = createFacadeMaterials(this.scene);

    const leftFacade = createBuildingFacade(
      this.scene,
      'leftFacade',
      {
        width: 12,
        height,
        depth: 6,
        position: new Vector3(minX - 6, height / 2, depth),
      },
      buildingMat
    );
    meshes.push(leftFacade);

    const leftWindows = createWindowGrid(
      this.scene,
      'leftWindows',
      {
        parentPos: new Vector3(minX - 0.5, 0, depth),
        width: 10,
        windowConfig: { rows: 5, cols: 3, startY: 3, spacing: 4 },
      },
      windowMat
    );
    meshes.push(...leftWindows);

    const arcadeSign = createNeonSign(
      this.scene,
      'arcadeSign',
      new Vector3(minX - 3, height - 5, depth + 3),
      { width: 6, height: 2 },
      new Color3(1, 0, 0.6),
      neonMat
    );
    meshes.push(arcadeSign);

    const rightFacade = createBuildingFacade(
      this.scene,
      'rightFacade',
      {
        width: 12,
        height,
        depth: 6,
        position: new Vector3(maxX + 6, height / 2, depth),
      },
      buildingMat
    );
    meshes.push(rightFacade);

    const rightWindows = createWindowGrid(
      this.scene,
      'rightWindows',
      {
        parentPos: new Vector3(maxX + 0.5, 0, depth),
        width: 10,
        windowConfig: { rows: 5, cols: 3, startY: 3, spacing: 4 },
      },
      windowMat
    );
    meshes.push(...rightWindows);

    const cyberSign = createNeonSign(
      this.scene,
      'cyberSign',
      new Vector3(maxX + 3, height - 8, depth + 3),
      { width: 5, height: 1.5 },
      new Color3(0, 1, 0.8),
      neonMat
    );
    meshes.push(cyberSign);

    const fireEscape = createFireEscape(
      this.scene,
      'fireEscape',
      new Vector3(maxX + 1, 0, depth + 2.5),
      height - 5,
      buildingMat
    );
    meshes.push(...fireEscape);

    const waterTank = createWaterTank(
      this.scene,
      'waterTank',
      new Vector3(maxX + 8, height + 2, depth - 2),
      buildingMat
    );
    meshes.push(waterTank);

    const backRoof = MeshBuilder.CreateBox(
      'backRoof',
      {
        width: maxX - minX + 24,
        height: 1,
        depth: 15,
      },
      this.scene
    );
    backRoof.position = new Vector3(0, 2, depth - 10);
    backRoof.material = roofMat;
    meshes.push(backRoof);

    const acPositions = [
      new Vector3(-10, 3.5, depth - 8),
      new Vector3(5, 3.5, depth - 12),
      new Vector3(12, 3.5, depth - 9),
    ];
    for (let i = 0; i < acPositions.length; i++) {
      const ac = createACUnit(this.scene, `backAC_${i}`, acPositions[i], buildingMat);
      meshes.push(ac);
    }

    this.meshes = meshes;
    this.materials = [buildingMat, windowMat, neonMat, roofMat];
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    for (const mat of this.materials) {
      mat.dispose();
    }
    this.meshes = [];
    this.materials = [];
  }
}

function createFacadeMaterials(scene: Scene) {
  const buildingMat = new StandardMaterial('buildingMat', scene);
  buildingMat.diffuseColor = new Color3(0.15, 0.15, 0.18);
  buildingMat.specularColor = new Color3(0.05, 0.05, 0.05);

  const windowMat = new StandardMaterial('windowMat', scene);
  windowMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
  windowMat.emissiveColor = new Color3(0.3, 0.35, 0.5);
  windowMat.specularColor = new Color3(0, 0, 0);

  const neonMat = new StandardMaterial('neonMat', scene);
  neonMat.emissiveColor = new Color3(1, 0, 1);
  neonMat.specularColor = new Color3(0, 0, 0);

  const roofMat = new StandardMaterial('roofMat', scene);
  roofMat.diffuseColor = new Color3(0.12, 0.12, 0.14);
  roofMat.specularColor = new Color3(0.04, 0.04, 0.04);

  return { buildingMat, windowMat, neonMat, roofMat };
}

function createBuildingFacade(
  scene: Scene,
  name: string,
  options: { width: number; height: number; depth: number; position: Vector3 },
  material: StandardMaterial
) {
  const facade = MeshBuilder.CreateBox(
    name,
    { width: options.width, height: options.height, depth: options.depth },
    scene
  );
  facade.position = options.position.clone();
  facade.material = material;
  return facade;
}

function createWindowGrid(
  scene: Scene,
  name: string,
  options: { parentPos: Vector3; width: number; windowConfig: WindowConfig },
  material: StandardMaterial
) {
  const { rows, cols, startY, spacing } = options.windowConfig;
  const windows: AbstractMesh[] = [];
  const totalWidth = options.width;
  const windowSize = totalWidth / (cols * 1.4);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const window = MeshBuilder.CreatePlane(
        `${name}_${row}_${col}`,
        { width: windowSize, height: windowSize * 0.8 },
        scene
      );
      window.position = new Vector3(
        options.parentPos.x + (col - (cols - 1) / 2) * spacing,
        startY + row * spacing,
        options.parentPos.z + 3
      );
      window.material = material;
      windows.push(window);
    }
  }

  return windows;
}

function createNeonSign(
  scene: Scene,
  name: string,
  position: Vector3,
  size: { width: number; height: number },
  color: Color3,
  baseMaterial: StandardMaterial
) {
  const sign = MeshBuilder.CreatePlane(name, size, scene);
  sign.position = position.clone();
  const signMat = baseMaterial.clone(`${name}_mat`) as StandardMaterial;
  signMat.emissiveColor = color;
  signMat.diffuseColor = color.scale(0.4);
  sign.material = signMat;
  return sign;
}

function createFireEscape(
  scene: Scene,
  name: string,
  position: Vector3,
  height: number,
  material: StandardMaterial
) {
  const meshes: AbstractMesh[] = [];
  const ladder = MeshBuilder.CreateBox(
    `${name}_ladder`,
    { width: 0.4, height: height, depth: 0.4 },
    scene
  );
  ladder.position = new Vector3(position.x, height / 2, position.z);
  ladder.material = material;
  meshes.push(ladder);

  const platformCount = Math.floor(height / 5);
  for (let i = 0; i < platformCount; i++) {
    const platform = MeshBuilder.CreateBox(
      `${name}_platform_${i}`,
      { width: 4, height: 0.2, depth: 2 },
      scene
    );
    platform.position = new Vector3(position.x - 2.5, 1 + i * 5, position.z);
    platform.material = material;
    meshes.push(platform);
  }

  return meshes;
}

function createWaterTank(
  scene: Scene,
  name: string,
  position: Vector3,
  material: StandardMaterial
) {
  const tank = MeshBuilder.CreateCylinder(name, { height: 2, diameter: 2.5 }, scene);
  tank.position = position.clone();
  tank.material = material;
  return tank;
}

function createACUnit(scene: Scene, name: string, position: Vector3, material: StandardMaterial) {
  const ac = MeshBuilder.CreateBox(name, { width: 1.6, height: 1, depth: 1.2 }, scene);
  ac.position = position.clone();
  ac.material = material;
  return ac;
}
