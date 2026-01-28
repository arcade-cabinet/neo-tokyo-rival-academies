import { type AbstractMesh, Color3, MeshBuilder, type Scene, type Vector3 } from '@babylonjs/core';
import { createEnvironmentMaterial } from '../toon-material';

export type VegetationProp =
  | 'tree'
  | 'palm'
  | 'shrub'
  | 'grass'
  | 'vine'
  | 'mushroom'
  | 'flower_bed';

export interface VegetationOptions {
  id: string;
  position: Vector3;
  rotation?: number;
  variant?: 'deciduous' | 'palm' | 'flowering' | 'wild' | 'ornamental';
  scale?: number;
}

export class VegetationKit {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  create(
    kind: VegetationProp,
    id: string,
    position: Vector3,
    rotation = 0,
    variant?: VegetationOptions['variant'],
    scale = 1
  ) {
    switch (kind) {
      case 'tree':
        return this.createTree(id, position, rotation, variant ?? 'deciduous', scale);
      case 'palm':
        return this.createPalm(id, position, rotation, scale);
      case 'shrub':
        return this.createShrub(id, position, rotation, variant ?? 'flowering', scale);
      case 'grass':
        return this.createGrass(id, position, rotation, variant ?? 'wild', scale);
      case 'vine':
        return this.createVine(id, position, rotation, scale);
      case 'mushroom':
        return this.createMushroom(id, position, rotation, scale);
      case 'flower_bed':
        return this.createFlowerBed(id, position, rotation, scale);
    }
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private createTree(
    id: string,
    position: Vector3,
    rotation: number,
    variant: VegetationOptions['variant'],
    scale: number
  ) {
    const meshes: AbstractMesh[] = [];
    const trunk = MeshBuilder.CreateCylinder(
      `${id}_trunk`,
      { diameter: 0.4 * scale, height: 2.2 * scale },
      this.scene
    );
    trunk.position = position.clone();
    trunk.position.y += 1.1 * scale;
    trunk.rotation.y = rotation;
    trunk.material = createEnvironmentMaterial(
      `${id}_trunk_mat`,
      this.scene,
      new Color3(0.35, 0.25, 0.18)
    );
    meshes.push(trunk);

    const leafColor =
      variant === 'flowering' ? new Color3(0.35, 0.6, 0.35) : new Color3(0.2, 0.45, 0.25);
    const canopy = MeshBuilder.CreateSphere(
      `${id}_canopy`,
      { diameter: 2.2 * scale, segments: 8 },
      this.scene
    );
    canopy.position = position.clone();
    canopy.position.y += 2.6 * scale;
    canopy.material = createEnvironmentMaterial(`${id}_canopy_mat`, this.scene, leafColor);
    meshes.push(canopy);

    this.track(meshes);
    return meshes;
  }

  private createPalm(id: string, position: Vector3, rotation: number, scale: number) {
    const meshes: AbstractMesh[] = [];
    const trunk = MeshBuilder.CreateCylinder(
      `${id}_palm_trunk`,
      { diameter: 0.25 * scale, height: 3.2 * scale },
      this.scene
    );
    trunk.position = position.clone();
    trunk.position.y += 1.6 * scale;
    trunk.rotation.y = rotation;
    trunk.material = createEnvironmentMaterial(
      `${id}_palm_trunk_mat`,
      this.scene,
      new Color3(0.4, 0.3, 0.2)
    );
    meshes.push(trunk);

    for (let i = 0; i < 5; i += 1) {
      const leaf = MeshBuilder.CreatePlane(
        `${id}_palm_leaf_${i}`,
        { width: 1.4 * scale, height: 0.3 * scale },
        this.scene
      );
      leaf.position = position.clone();
      leaf.position.y += 3.1 * scale;
      leaf.rotation.y = rotation + (i * Math.PI) / 2.5;
      leaf.rotation.x = Math.PI / 6;
      leaf.material = createEnvironmentMaterial(
        `${id}_palm_leaf_mat_${i}`,
        this.scene,
        new Color3(0.2, 0.5, 0.3)
      );
      meshes.push(leaf);
    }

    this.track(meshes);
    return meshes;
  }

  private createShrub(
    id: string,
    position: Vector3,
    rotation: number,
    variant: VegetationOptions['variant'],
    scale: number
  ) {
    const meshes: AbstractMesh[] = [];
    const color =
      variant === 'flowering' ? new Color3(0.35, 0.55, 0.35) : new Color3(0.2, 0.4, 0.22);
    const shrub = MeshBuilder.CreateSphere(
      `${id}_shrub`,
      { diameter: 1.2 * scale, segments: 6 },
      this.scene
    );
    shrub.position = position.clone();
    shrub.position.y += 0.6 * scale;
    shrub.rotation.y = rotation;
    shrub.material = createEnvironmentMaterial(`${id}_shrub_mat`, this.scene, color);
    meshes.push(shrub);

    if (variant === 'flowering') {
      const bloom = MeshBuilder.CreateSphere(
        `${id}_bloom`,
        { diameter: 0.4 * scale, segments: 6 },
        this.scene
      );
      bloom.position = position.clone();
      bloom.position.y += 0.9 * scale;
      bloom.position.x += 0.2 * scale;
      bloom.material = createEnvironmentMaterial(
        `${id}_bloom_mat`,
        this.scene,
        new Color3(0.8, 0.55, 0.6)
      );
      meshes.push(bloom);
    }

    this.track(meshes);
    return meshes;
  }

  private createGrass(
    id: string,
    position: Vector3,
    rotation: number,
    variant: VegetationOptions['variant'],
    scale: number
  ) {
    const meshes: AbstractMesh[] = [];
    const color =
      variant === 'ornamental' ? new Color3(0.3, 0.55, 0.3) : new Color3(0.22, 0.45, 0.25);
    for (let i = 0; i < 4; i += 1) {
      const blade = MeshBuilder.CreatePlane(
        `${id}_grass_${i}`,
        { width: 0.5 * scale, height: 0.8 * scale },
        this.scene
      );
      blade.position = position.clone();
      blade.position.y += 0.4 * scale;
      blade.position.x += (i - 1.5) * 0.15 * scale;
      blade.rotation.y = rotation + (i * Math.PI) / 6;
      blade.material = createEnvironmentMaterial(`${id}_grass_mat_${i}`, this.scene, color);
      meshes.push(blade);
    }

    this.track(meshes);
    return meshes;
  }

  private createVine(id: string, position: Vector3, rotation: number, scale: number) {
    const meshes: AbstractMesh[] = [];
    const vine = MeshBuilder.CreateCylinder(
      `${id}_vine`,
      { diameter: 0.08 * scale, height: 2.2 * scale },
      this.scene
    );
    vine.position = position.clone();
    vine.position.y += 1.1 * scale;
    vine.rotation.y = rotation;
    vine.material = createEnvironmentMaterial(
      `${id}_vine_mat`,
      this.scene,
      new Color3(0.2, 0.5, 0.25)
    );
    meshes.push(vine);

    const leaf = MeshBuilder.CreatePlane(
      `${id}_vine_leaf`,
      { width: 0.5 * scale, height: 0.4 * scale },
      this.scene
    );
    leaf.position = position.clone();
    leaf.position.y += 1.4 * scale;
    leaf.position.x += 0.2 * scale;
    leaf.rotation.y = rotation + Math.PI / 4;
    leaf.material = createEnvironmentMaterial(
      `${id}_vine_leaf_mat`,
      this.scene,
      new Color3(0.2, 0.5, 0.3)
    );
    meshes.push(leaf);

    this.track(meshes);
    return meshes;
  }

  private createMushroom(id: string, position: Vector3, rotation: number, scale: number) {
    const meshes: AbstractMesh[] = [];
    const stem = MeshBuilder.CreateCylinder(
      `${id}_stem`,
      { diameter: 0.15 * scale, height: 0.4 * scale },
      this.scene
    );
    stem.position = position.clone();
    stem.position.y += 0.2 * scale;
    stem.rotation.y = rotation;
    stem.material = createEnvironmentMaterial(
      `${id}_stem_mat`,
      this.scene,
      new Color3(0.75, 0.7, 0.65)
    );
    meshes.push(stem);

    const cap = MeshBuilder.CreateSphere(
      `${id}_cap`,
      { diameter: 0.5 * scale, segments: 6 },
      this.scene
    );
    cap.position = position.clone();
    cap.position.y += 0.45 * scale;
    cap.material = createEnvironmentMaterial(
      `${id}_cap_mat`,
      this.scene,
      new Color3(0.6, 0.35, 0.35)
    );
    meshes.push(cap);

    this.track(meshes);
    return meshes;
  }

  private createFlowerBed(id: string, position: Vector3, rotation: number, scale: number) {
    const meshes: AbstractMesh[] = [];
    const base = MeshBuilder.CreateBox(
      `${id}_bed`,
      { width: 1.6 * scale, height: 0.25 * scale, depth: 1.0 * scale },
      this.scene
    );
    base.position = position.clone();
    base.position.y += 0.12 * scale;
    base.rotation.y = rotation;
    base.material = createEnvironmentMaterial(
      `${id}_bed_mat`,
      this.scene,
      new Color3(0.25, 0.2, 0.15)
    );
    meshes.push(base);

    const plant = MeshBuilder.CreateSphere(
      `${id}_bed_plants`,
      { diameter: 0.9 * scale, segments: 6 },
      this.scene
    );
    plant.position = position.clone();
    plant.position.y += 0.6 * scale;
    plant.material = createEnvironmentMaterial(
      `${id}_bed_plant_mat`,
      this.scene,
      new Color3(0.25, 0.45, 0.25)
    );
    meshes.push(plant);

    this.track(meshes);
    return meshes;
  }

  private track(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
