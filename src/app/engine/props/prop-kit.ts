import { type AbstractMesh, Color3, MeshBuilder, type Scene, type Vector3 } from '@babylonjs/core';
import { createEnvironmentMaterial } from '../toon-material';

export type PropType =
  | 'crate'
  | 'barrel'
  | 'debris'
  | 'pallet_stack'
  | 'tarp'
  | 'tarpaulin'
  | 'clothesline'
  | 'tent'
  | 'bicycle'
  | 'bicycle_rack'
  | 'carcass';

export class PropKit {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  create(kind: PropType, id: string, position: Vector3, rotation = 0) {
    switch (kind) {
      case 'crate':
        return this.createCrate(id, position, rotation);
      case 'barrel':
        return this.createBarrel(id, position);
      case 'debris':
        return this.createDebris(id, position);
      case 'pallet_stack':
        return this.createPalletStack(id, position, rotation);
      case 'tarp':
        return this.createTarp(id, position, rotation);
      case 'tarpaulin':
        return this.createTarpaulin(id, position, rotation);
      case 'clothesline':
        return this.createClothesline(id, position, rotation);
      case 'tent':
        return this.createTent(id, position, rotation);
      case 'bicycle':
        return this.createBicycle(id, position, rotation);
      case 'bicycle_rack':
        return this.createBicycleRack(id, position, rotation);
      case 'carcass':
        return this.createCarcass(id, position, rotation);
    }
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private createCrate(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const crate = MeshBuilder.CreateBox(
      `${id}_crate`,
      { width: 0.8, height: 0.6, depth: 0.8 },
      this.scene
    );
    crate.position = position.clone();
    crate.position.y += 0.3;
    crate.rotation.y = rotation;
    crate.material = createEnvironmentMaterial(
      `${id}_crate_mat`,
      this.scene,
      new Color3(0.45, 0.32, 0.2)
    );
    meshes.push(crate);

    this.track(meshes);
    return meshes;
  }

  private createBarrel(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const barrel = MeshBuilder.CreateCylinder(
      `${id}_barrel`,
      { diameter: 0.5, height: 0.9 },
      this.scene
    );
    barrel.position = position.clone();
    barrel.position.y += 0.45;
    barrel.material = createEnvironmentMaterial(
      `${id}_barrel_mat`,
      this.scene,
      new Color3(0.2, 0.3, 0.32)
    );
    meshes.push(barrel);

    this.track(meshes);
    return meshes;
  }

  private createDebris(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const chunk = MeshBuilder.CreateBox(
      `${id}_debris`,
      { width: 0.6, height: 0.2, depth: 0.6 },
      this.scene
    );
    chunk.position = position.clone();
    chunk.position.y += 0.1;
    chunk.rotation.y = Math.PI / 4;
    chunk.material = createEnvironmentMaterial(
      `${id}_debris_mat`,
      this.scene,
      new Color3(0.18, 0.2, 0.22)
    );
    meshes.push(chunk);

    this.track(meshes);
    return meshes;
  }

  private createPalletStack(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const pallet = MeshBuilder.CreateBox(
      `${id}_pallet`,
      { width: 1.2, height: 0.2, depth: 0.9 },
      this.scene
    );
    pallet.position = position.clone();
    pallet.position.y += 0.1;
    pallet.rotation.y = rotation;
    pallet.material = createEnvironmentMaterial(
      `${id}_pallet_mat`,
      this.scene,
      new Color3(0.4, 0.3, 0.2)
    );
    meshes.push(pallet);

    const top = MeshBuilder.CreateBox(
      `${id}_pallet_top`,
      { width: 1.0, height: 0.4, depth: 0.7 },
      this.scene
    );
    top.position = position.clone();
    top.position.y += 0.4;
    top.rotation.y = rotation;
    top.material = createEnvironmentMaterial(
      `${id}_pallet_top_mat`,
      this.scene,
      new Color3(0.35, 0.25, 0.18)
    );
    meshes.push(top);

    this.track(meshes);
    return meshes;
  }

  private createTarp(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const tarp = MeshBuilder.CreatePlane(`${id}_tarp`, { width: 1.6, height: 1.2 }, this.scene);
    tarp.position = position.clone();
    tarp.position.y += 0.3;
    tarp.rotation.y = rotation;
    tarp.rotation.x = Math.PI / 12;
    tarp.material = createEnvironmentMaterial(
      `${id}_tarp_mat`,
      this.scene,
      new Color3(0.2, 0.3, 0.35)
    );
    meshes.push(tarp);

    this.track(meshes);
    return meshes;
  }

  private createTarpaulin(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const tarp = MeshBuilder.CreatePlane(
      `${id}_tarpaulin`,
      { width: 2.0, height: 1.4 },
      this.scene
    );
    tarp.position = position.clone();
    tarp.position.y += 0.4;
    tarp.rotation.y = rotation;
    tarp.rotation.x = Math.PI / 10;
    tarp.material = createEnvironmentMaterial(
      `${id}_tarpaulin_mat`,
      this.scene,
      new Color3(0.25, 0.28, 0.32)
    );
    meshes.push(tarp);

    this.track(meshes);
    return meshes;
  }

  private createClothesline(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const line = MeshBuilder.CreateCylinder(
      `${id}_line`,
      { diameter: 0.05, height: 2.0 },
      this.scene
    );
    line.position = position.clone();
    line.position.y += 1.6;
    line.rotation.z = Math.PI / 2;
    line.rotation.y = rotation;
    line.material = createEnvironmentMaterial(
      `${id}_line_mat`,
      this.scene,
      new Color3(0.3, 0.3, 0.33)
    );
    meshes.push(line);

    const cloth = MeshBuilder.CreatePlane(`${id}_cloth`, { width: 0.6, height: 0.4 }, this.scene);
    cloth.position = position.clone();
    cloth.position.y += 1.2;
    cloth.position.x += 0.2;
    cloth.rotation.y = rotation;
    cloth.material = createEnvironmentMaterial(
      `${id}_cloth_mat`,
      this.scene,
      new Color3(0.6, 0.5, 0.45)
    );
    meshes.push(cloth);

    this.track(meshes);
    return meshes;
  }

  private createTent(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const base = MeshBuilder.CreateBox(
      `${id}_base`,
      { width: 2.2, height: 0.2, depth: 1.6 },
      this.scene
    );
    base.position = position.clone();
    base.position.y += 0.1;
    base.rotation.y = rotation;
    base.material = createEnvironmentMaterial(
      `${id}_base_mat`,
      this.scene,
      new Color3(0.2, 0.25, 0.3)
    );
    meshes.push(base);

    const cover = MeshBuilder.CreateCylinder(
      `${id}_cover`,
      { diameterTop: 0, diameterBottom: 2.2, height: 1.0, tessellation: 24 },
      this.scene
    );
    cover.position = position.clone();
    cover.position.y += 0.8;
    cover.rotation.y = rotation;
    cover.material = createEnvironmentMaterial(
      `${id}_cover_mat`,
      this.scene,
      new Color3(0.25, 0.3, 0.35)
    );
    meshes.push(cover);

    this.track(meshes);
    return meshes;
  }

  private createBicycle(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const frame = MeshBuilder.CreateCylinder(
      `${id}_frame`,
      { diameter: 0.08, height: 1.2 },
      this.scene
    );
    frame.position = position.clone();
    frame.position.y += 0.5;
    frame.rotation.z = Math.PI / 2;
    frame.rotation.y = rotation;
    frame.material = createEnvironmentMaterial(
      `${id}_frame_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(frame);

    const wheelOffsets = [-0.45, 0.45];
    wheelOffsets.forEach((offset, index) => {
      const wheel = MeshBuilder.CreateTorus(
        `${id}_wheel_${index}`,
        { diameter: 0.5, thickness: 0.08 },
        this.scene
      );
      wheel.position = position.clone();
      wheel.position.y += 0.25;
      wheel.position.x += offset;
      wheel.rotation.y = rotation;
      wheel.material = createEnvironmentMaterial(
        `${id}_wheel_mat_${index}`,
        this.scene,
        new Color3(0.1, 0.1, 0.12)
      );
      meshes.push(wheel);
    });

    this.track(meshes);
    return meshes;
  }

  private createBicycleRack(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const rack = MeshBuilder.CreateTorus(
      `${id}_rack`,
      { diameter: 1.0, thickness: 0.08 },
      this.scene
    );
    rack.position = position.clone();
    rack.position.y += 0.4;
    rack.rotation.y = rotation;
    rack.material = createEnvironmentMaterial(
      `${id}_rack_mat`,
      this.scene,
      new Color3(0.25, 0.25, 0.28)
    );
    meshes.push(rack);

    this.track(meshes);
    return meshes;
  }

  private createCarcass(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const body = MeshBuilder.CreateBox(
      `${id}_body`,
      { width: 1.6, height: 0.4, depth: 0.8 },
      this.scene
    );
    body.position = position.clone();
    body.position.y += 0.2;
    body.rotation.y = rotation;
    body.material = createEnvironmentMaterial(
      `${id}_body_mat`,
      this.scene,
      new Color3(0.25, 0.25, 0.3)
    );
    meshes.push(body);

    const cabin = MeshBuilder.CreateBox(
      `${id}_cabin`,
      { width: 0.8, height: 0.4, depth: 0.6 },
      this.scene
    );
    cabin.position = position.clone();
    cabin.position.y += 0.5;
    cabin.position.x += 0.2;
    cabin.rotation.y = rotation;
    cabin.material = createEnvironmentMaterial(
      `${id}_cabin_mat`,
      this.scene,
      new Color3(0.3, 0.32, 0.36)
    );
    meshes.push(cabin);

    this.track(meshes);
    return meshes;
  }

  private track(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
