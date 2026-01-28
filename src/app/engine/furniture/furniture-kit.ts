import { type AbstractMesh, Color3, MeshBuilder, type Scene, type Vector3 } from '@babylonjs/core';
import { createEnvironmentMaterial } from '../toon-material';

export type FurnitureProp =
  | 'bench'
  | 'trash_can'
  | 'vending_machine'
  | 'mailbox'
  | 'planter'
  | 'phone_booth'
  | 'fire_hydrant'
  | 'parking_meter'
  | 'bollard'
  | 'manhole'
  | 'drain_grate'
  | 'shopping_cart'
  | 'umbrella'
  | 'newspaper';

export class FurnitureKit {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  create(kind: FurnitureProp, id: string, position: Vector3, rotation = 0) {
    switch (kind) {
      case 'bench':
        return this.createBench(id, position, rotation);
      case 'trash_can':
        return this.createTrashCan(id, position);
      case 'vending_machine':
        return this.createVendingMachine(id, position, rotation);
      case 'mailbox':
        return this.createMailbox(id, position, rotation);
      case 'planter':
        return this.createPlanter(id, position, rotation);
      case 'phone_booth':
        return this.createPhoneBooth(id, position, rotation);
      case 'fire_hydrant':
        return this.createHydrant(id, position);
      case 'parking_meter':
        return this.createParkingMeter(id, position, rotation);
      case 'bollard':
        return this.createBollard(id, position);
      case 'manhole':
        return this.createManhole(id, position);
      case 'drain_grate':
        return this.createDrainGrate(id, position);
      case 'shopping_cart':
        return this.createShoppingCart(id, position, rotation);
      case 'umbrella':
        return this.createUmbrella(id, position, rotation);
      case 'newspaper':
        return this.createNewspaper(id, position, rotation);
    }
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private createBench(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const seat = MeshBuilder.CreateBox(
      `${id}_seat`,
      { width: 1.6, height: 0.2, depth: 0.5 },
      this.scene
    );
    seat.position = position.clone();
    seat.position.y += 0.4;
    seat.rotation.y = rotation;
    seat.material = createEnvironmentMaterial(
      `${id}_seat_mat`,
      this.scene,
      new Color3(0.5, 0.35, 0.22)
    );
    meshes.push(seat);

    const legOffsets = [new Color3(-0.6, 0, -0.2), new Color3(0.6, 0, -0.2)];
    legOffsets.forEach((offset, index) => {
      const leg = MeshBuilder.CreateBox(
        `${id}_leg_${index}`,
        { width: 0.15, height: 0.4, depth: 0.15 },
        this.scene
      );
      leg.position = position.clone();
      leg.position.y += 0.2;
      leg.position.x += offset.r;
      leg.position.z += offset.b;
      leg.rotation.y = rotation;
      leg.material = createEnvironmentMaterial(
        `${id}_leg_mat_${index}`,
        this.scene,
        new Color3(0.2, 0.2, 0.22)
      );
      meshes.push(leg);
    });

    this.track(meshes);
    return meshes;
  }

  private createTrashCan(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const can = MeshBuilder.CreateCylinder(`${id}_can`, { diameter: 0.5, height: 0.8 }, this.scene);
    can.position = position.clone();
    can.position.y += 0.4;
    can.material = createEnvironmentMaterial(
      `${id}_can_mat`,
      this.scene,
      new Color3(0.18, 0.2, 0.22)
    );
    meshes.push(can);

    this.track(meshes);
    return meshes;
  }

  private createVendingMachine(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const body = MeshBuilder.CreateBox(
      `${id}_body`,
      { width: 0.8, height: 1.8, depth: 0.7 },
      this.scene
    );
    body.position = position.clone();
    body.position.y += 0.9;
    body.rotation.y = rotation;
    body.material = createEnvironmentMaterial(
      `${id}_body_mat`,
      this.scene,
      new Color3(0.2, 0.3, 0.45)
    );
    meshes.push(body);

    const glass = MeshBuilder.CreatePlane(`${id}_glass`, { width: 0.7, height: 1.0 }, this.scene);
    glass.position = position.clone();
    glass.position.y += 1.1;
    glass.position.z += 0.36;
    glass.rotation.y = rotation;
    glass.material = createEnvironmentMaterial(
      `${id}_glass_mat`,
      this.scene,
      new Color3(0.4, 0.5, 0.6)
    );
    meshes.push(glass);

    this.track(meshes);
    return meshes;
  }

  private createMailbox(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const box = MeshBuilder.CreateBox(
      `${id}_box`,
      { width: 0.6, height: 0.5, depth: 0.4 },
      this.scene
    );
    box.position = position.clone();
    box.position.y += 0.75;
    box.rotation.y = rotation;
    box.material = createEnvironmentMaterial(
      `${id}_box_mat`,
      this.scene,
      new Color3(0.65, 0.1, 0.15)
    );
    meshes.push(box);

    const post = MeshBuilder.CreateCylinder(
      `${id}_post`,
      { diameter: 0.1, height: 1.0 },
      this.scene
    );
    post.position = position.clone();
    post.position.y += 0.5;
    post.material = createEnvironmentMaterial(
      `${id}_post_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(post);

    this.track(meshes);
    return meshes;
  }

  private createPlanter(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const base = MeshBuilder.CreateBox(
      `${id}_planter`,
      { width: 0.8, height: 0.4, depth: 0.8 },
      this.scene
    );
    base.position = position.clone();
    base.position.y += 0.2;
    base.rotation.y = rotation;
    base.material = createEnvironmentMaterial(
      `${id}_planter_mat`,
      this.scene,
      new Color3(0.3, 0.25, 0.2)
    );
    meshes.push(base);

    const soil = MeshBuilder.CreateBox(
      `${id}_soil`,
      { width: 0.7, height: 0.15, depth: 0.7 },
      this.scene
    );
    soil.position = position.clone();
    soil.position.y += 0.45;
    soil.rotation.y = rotation;
    soil.material = createEnvironmentMaterial(
      `${id}_soil_mat`,
      this.scene,
      new Color3(0.2, 0.18, 0.15)
    );
    meshes.push(soil);

    this.track(meshes);
    return meshes;
  }

  private createPhoneBooth(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const frame = MeshBuilder.CreateBox(
      `${id}_frame`,
      { width: 0.9, height: 2.1, depth: 0.9 },
      this.scene
    );
    frame.position = position.clone();
    frame.position.y += 1.05;
    frame.rotation.y = rotation;
    frame.material = createEnvironmentMaterial(
      `${id}_frame_mat`,
      this.scene,
      new Color3(0.5, 0.1, 0.15)
    );
    meshes.push(frame);

    const glass = MeshBuilder.CreatePlane(`${id}_glass`, { width: 0.75, height: 1.6 }, this.scene);
    glass.position = position.clone();
    glass.position.y += 1.0;
    glass.position.z += 0.45;
    glass.rotation.y = rotation;
    glass.material = createEnvironmentMaterial(
      `${id}_glass_mat`,
      this.scene,
      new Color3(0.4, 0.5, 0.6)
    );
    meshes.push(glass);

    this.track(meshes);
    return meshes;
  }

  private createHydrant(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const body = MeshBuilder.CreateCylinder(
      `${id}_body`,
      { diameter: 0.4, height: 0.8 },
      this.scene
    );
    body.position = position.clone();
    body.position.y += 0.4;
    body.material = createEnvironmentMaterial(
      `${id}_body_mat`,
      this.scene,
      new Color3(0.8, 0.2, 0.2)
    );
    meshes.push(body);

    const cap = MeshBuilder.CreateSphere(`${id}_cap`, { diameter: 0.4 }, this.scene);
    cap.position = position.clone();
    cap.position.y += 0.85;
    cap.material = createEnvironmentMaterial(
      `${id}_cap_mat`,
      this.scene,
      new Color3(0.7, 0.2, 0.2)
    );
    meshes.push(cap);

    this.track(meshes);
    return meshes;
  }

  private createParkingMeter(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const post = MeshBuilder.CreateCylinder(
      `${id}_post`,
      { diameter: 0.1, height: 1.0 },
      this.scene
    );
    post.position = position.clone();
    post.position.y += 0.5;
    post.rotation.y = rotation;
    post.material = createEnvironmentMaterial(
      `${id}_post_mat`,
      this.scene,
      new Color3(0.25, 0.25, 0.28)
    );
    meshes.push(post);

    const head = MeshBuilder.CreateBox(
      `${id}_head`,
      { width: 0.3, height: 0.4, depth: 0.2 },
      this.scene
    );
    head.position = position.clone();
    head.position.y += 1.1;
    head.rotation.y = rotation;
    head.material = createEnvironmentMaterial(
      `${id}_head_mat`,
      this.scene,
      new Color3(0.3, 0.3, 0.35)
    );
    meshes.push(head);

    this.track(meshes);
    return meshes;
  }

  private createBollard(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const bollard = MeshBuilder.CreateCylinder(
      `${id}_bollard`,
      { diameter: 0.3, height: 0.6 },
      this.scene
    );
    bollard.position = position.clone();
    bollard.position.y += 0.3;
    bollard.material = createEnvironmentMaterial(
      `${id}_bollard_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(bollard);

    this.track(meshes);
    return meshes;
  }

  private createManhole(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const disc = MeshBuilder.CreateCylinder(
      `${id}_manhole`,
      { diameter: 0.8, height: 0.05 },
      this.scene
    );
    disc.position = position.clone();
    disc.position.y += 0.03;
    disc.material = createEnvironmentMaterial(
      `${id}_manhole_mat`,
      this.scene,
      new Color3(0.15, 0.16, 0.18)
    );
    meshes.push(disc);

    this.track(meshes);
    return meshes;
  }

  private createDrainGrate(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const grate = MeshBuilder.CreateBox(
      `${id}_grate`,
      { width: 0.7, height: 0.05, depth: 0.4 },
      this.scene
    );
    grate.position = position.clone();
    grate.position.y += 0.03;
    grate.material = createEnvironmentMaterial(
      `${id}_grate_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(grate);

    this.track(meshes);
    return meshes;
  }

  private createShoppingCart(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const basket = MeshBuilder.CreateBox(
      `${id}_basket`,
      { width: 0.8, height: 0.4, depth: 0.6 },
      this.scene
    );
    basket.position = position.clone();
    basket.position.y += 0.5;
    basket.rotation.y = rotation;
    basket.material = createEnvironmentMaterial(
      `${id}_basket_mat`,
      this.scene,
      new Color3(0.3, 0.3, 0.35)
    );
    meshes.push(basket);

    const handle = MeshBuilder.CreateCylinder(
      `${id}_handle`,
      { diameter: 0.05, height: 0.6 },
      this.scene
    );
    handle.position = position.clone();
    handle.position.y += 0.8;
    handle.position.z -= 0.3;
    handle.rotation.z = Math.PI / 2;
    handle.rotation.y = rotation;
    handle.material = createEnvironmentMaterial(
      `${id}_handle_mat`,
      this.scene,
      new Color3(0.25, 0.25, 0.28)
    );
    meshes.push(handle);

    this.track(meshes);
    return meshes;
  }

  private createUmbrella(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const pole = MeshBuilder.CreateCylinder(
      `${id}_pole`,
      { diameter: 0.05, height: 1.2 },
      this.scene
    );
    pole.position = position.clone();
    pole.position.y += 0.6;
    pole.rotation.y = rotation;
    pole.material = createEnvironmentMaterial(
      `${id}_pole_mat`,
      this.scene,
      new Color3(0.25, 0.25, 0.28)
    );
    meshes.push(pole);

    const canopy = MeshBuilder.CreateCone(
      `${id}_canopy`,
      { diameter: 1.2, height: 0.4 },
      this.scene
    );
    canopy.position = position.clone();
    canopy.position.y += 1.3;
    canopy.rotation.y = rotation;
    canopy.material = createEnvironmentMaterial(
      `${id}_canopy_mat`,
      this.scene,
      new Color3(0.2, 0.3, 0.5)
    );
    meshes.push(canopy);

    this.track(meshes);
    return meshes;
  }

  private createNewspaper(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const paper = MeshBuilder.CreatePlane(`${id}_paper`, { width: 0.5, height: 0.3 }, this.scene);
    paper.position = position.clone();
    paper.position.y += 0.02;
    paper.rotation.y = rotation;
    paper.rotation.x = -Math.PI / 2;
    paper.material = createEnvironmentMaterial(
      `${id}_paper_mat`,
      this.scene,
      new Color3(0.7, 0.7, 0.7)
    );
    meshes.push(paper);

    this.track(meshes);
    return meshes;
  }

  private track(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
