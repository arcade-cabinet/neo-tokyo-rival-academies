import { type AbstractMesh, Color3, MeshBuilder, type Scene, type Vector3 } from '@babylonjs/core';
import { createEffectMaterial, createEnvironmentMaterial } from '../toon-material';

export type SignageProp =
  | 'street_light'
  | 'lamppost'
  | 'billboard'
  | 'poster'
  | 'traffic_sign'
  | 'signpost'
  | 'lantern'
  | 'graffiti'
  | 'flagpole';

export class SignageKit {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  create(kind: SignageProp, id: string, position: Vector3, rotation = 0) {
    switch (kind) {
      case 'street_light':
        return this.createStreetLight(id, position, rotation);
      case 'lamppost':
        return this.createLamppost(id, position, rotation);
      case 'billboard':
        return this.createBillboard(id, position, rotation);
      case 'poster':
        return this.createPoster(id, position, rotation);
      case 'traffic_sign':
        return this.createTrafficSign(id, position, rotation);
      case 'signpost':
        return this.createSignpost(id, position, rotation);
      case 'lantern':
        return this.createLantern(id, position, rotation);
      case 'graffiti':
        return this.createGraffiti(id, position, rotation);
      case 'flagpole':
        return this.createFlagpole(id, position, rotation);
    }
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private createStreetLight(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const pole = MeshBuilder.CreateCylinder(
      `${id}_pole`,
      { diameter: 0.12, height: 3.4 },
      this.scene
    );
    pole.position = position.clone();
    pole.position.y += 1.7;
    pole.rotation.y = rotation;
    pole.material = createEnvironmentMaterial(
      `${id}_pole_mat`,
      this.scene,
      new Color3(0.2, 0.22, 0.25)
    );
    meshes.push(pole);

    const arm = MeshBuilder.CreateBox(
      `${id}_arm`,
      { width: 0.8, height: 0.08, depth: 0.08 },
      this.scene
    );
    arm.position = position.clone();
    arm.position.y += 3.1;
    arm.position.x += Math.cos(rotation) * 0.4;
    arm.position.z += Math.sin(rotation) * 0.4;
    arm.rotation.y = rotation;
    arm.material = createEnvironmentMaterial(
      `${id}_arm_mat`,
      this.scene,
      new Color3(0.2, 0.22, 0.25)
    );
    meshes.push(arm);

    const light = MeshBuilder.CreateSphere(`${id}_light`, { diameter: 0.25 }, this.scene);
    light.position = position.clone();
    light.position.y += 3.0;
    light.position.x += Math.cos(rotation) * 0.75;
    light.position.z += Math.sin(rotation) * 0.75;
    light.material = createEffectMaterial(
      `${id}_light_mat`,
      this.scene,
      new Color3(1.0, 0.85, 0.65)
    );
    meshes.push(light);

    this.track(meshes);
    return meshes;
  }

  private createLamppost(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const pole = MeshBuilder.CreateCylinder(
      `${id}_pole`,
      { diameter: 0.18, height: 3.0 },
      this.scene
    );
    pole.position = position.clone();
    pole.position.y += 1.5;
    pole.rotation.y = rotation;
    pole.material = createEnvironmentMaterial(
      `${id}_pole_mat`,
      this.scene,
      new Color3(0.25, 0.2, 0.18)
    );
    meshes.push(pole);

    const lantern = MeshBuilder.CreateSphere(`${id}_lantern`, { diameter: 0.35 }, this.scene);
    lantern.position = position.clone();
    lantern.position.y += 3.1;
    lantern.rotation.y = rotation;
    lantern.material = createEffectMaterial(
      `${id}_lantern_mat`,
      this.scene,
      new Color3(1.0, 0.75, 0.5)
    );
    meshes.push(lantern);

    this.track(meshes);
    return meshes;
  }

  private createBillboard(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const frame = MeshBuilder.CreateBox(
      `${id}_frame`,
      { width: 3.2, height: 1.6, depth: 0.1 },
      this.scene
    );
    frame.position = position.clone();
    frame.position.y += 2.6;
    frame.rotation.y = rotation;
    frame.material = createEnvironmentMaterial(
      `${id}_frame_mat`,
      this.scene,
      new Color3(0.2, 0.22, 0.25)
    );
    meshes.push(frame);

    const panel = MeshBuilder.CreatePlane(`${id}_panel`, { width: 3.0, height: 1.4 }, this.scene);
    panel.position = position.clone();
    panel.position.y += 2.6;
    panel.position.z += 0.06;
    panel.rotation.y = rotation;
    panel.material = createEnvironmentMaterial(
      `${id}_panel_mat`,
      this.scene,
      new Color3(0.6, 0.5, 0.4)
    );
    meshes.push(panel);

    const pole = MeshBuilder.CreateCylinder(
      `${id}_pole`,
      { diameter: 0.12, height: 2.2 },
      this.scene
    );
    pole.position = position.clone();
    pole.position.y += 1.1;
    pole.rotation.y = rotation;
    pole.material = createEnvironmentMaterial(
      `${id}_pole_mat`,
      this.scene,
      new Color3(0.2, 0.22, 0.25)
    );
    meshes.push(pole);

    this.track(meshes);
    return meshes;
  }

  private createPoster(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const poster = MeshBuilder.CreatePlane(`${id}_poster`, { width: 0.8, height: 1.0 }, this.scene);
    poster.position = position.clone();
    poster.position.y += 1.0;
    poster.rotation.y = rotation;
    poster.material = createEnvironmentMaterial(
      `${id}_poster_mat`,
      this.scene,
      new Color3(0.55, 0.45, 0.35)
    );
    meshes.push(poster);

    this.track(meshes);
    return meshes;
  }

  private createTrafficSign(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const post = MeshBuilder.CreateCylinder(
      `${id}_post`,
      { diameter: 0.08, height: 1.6 },
      this.scene
    );
    post.position = position.clone();
    post.position.y += 0.8;
    post.rotation.y = rotation;
    post.material = createEnvironmentMaterial(
      `${id}_post_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(post);

    const sign = MeshBuilder.CreatePlane(`${id}_sign`, { width: 0.6, height: 0.6 }, this.scene);
    sign.position = position.clone();
    sign.position.y += 1.4;
    sign.rotation.y = rotation;
    sign.material = createEnvironmentMaterial(
      `${id}_sign_mat`,
      this.scene,
      new Color3(0.7, 0.2, 0.2)
    );
    meshes.push(sign);

    this.track(meshes);
    return meshes;
  }

  private createSignpost(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const post = MeshBuilder.CreateCylinder(
      `${id}_post`,
      { diameter: 0.1, height: 1.8 },
      this.scene
    );
    post.position = position.clone();
    post.position.y += 0.9;
    post.rotation.y = rotation;
    post.material = createEnvironmentMaterial(
      `${id}_post_mat`,
      this.scene,
      new Color3(0.25, 0.25, 0.28)
    );
    meshes.push(post);

    const arm = MeshBuilder.CreateBox(
      `${id}_arm`,
      { width: 0.9, height: 0.12, depth: 0.2 },
      this.scene
    );
    arm.position = position.clone();
    arm.position.y += 1.4;
    arm.rotation.y = rotation;
    arm.material = createEnvironmentMaterial(
      `${id}_arm_mat`,
      this.scene,
      new Color3(0.4, 0.32, 0.2)
    );
    meshes.push(arm);

    this.track(meshes);
    return meshes;
  }

  private createLantern(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const hanger = MeshBuilder.CreateCylinder(
      `${id}_hanger`,
      { diameter: 0.05, height: 0.8 },
      this.scene
    );
    hanger.position = position.clone();
    hanger.position.y += 1.2;
    hanger.rotation.y = rotation;
    hanger.material = createEnvironmentMaterial(
      `${id}_hanger_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(hanger);

    const lantern = MeshBuilder.CreateSphere(`${id}_lantern`, { diameter: 0.4 }, this.scene);
    lantern.position = position.clone();
    lantern.position.y += 0.8;
    lantern.rotation.y = rotation;
    lantern.material = createEffectMaterial(
      `${id}_lantern_mat`,
      this.scene,
      new Color3(1.0, 0.7, 0.45)
    );
    meshes.push(lantern);

    this.track(meshes);
    return meshes;
  }

  private createGraffiti(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const spray = MeshBuilder.CreatePlane(
      `${id}_graffiti`,
      { width: 1.2, height: 0.8 },
      this.scene
    );
    spray.position = position.clone();
    spray.position.y += 0.9;
    spray.rotation.y = rotation;
    spray.material = createEnvironmentMaterial(
      `${id}_graffiti_mat`,
      this.scene,
      new Color3(0.6, 0.3, 0.4)
    );
    meshes.push(spray);

    this.track(meshes);
    return meshes;
  }

  private createFlagpole(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const pole = MeshBuilder.CreateCylinder(
      `${id}_pole`,
      { diameter: 0.08, height: 2.6 },
      this.scene
    );
    pole.position = position.clone();
    pole.position.y += 1.3;
    pole.rotation.y = rotation;
    pole.material = createEnvironmentMaterial(
      `${id}_pole_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(pole);

    const flag = MeshBuilder.CreatePlane(`${id}_flag`, { width: 0.9, height: 0.6 }, this.scene);
    flag.position = position.clone();
    flag.position.y += 2.0;
    flag.position.x += Math.cos(rotation) * 0.45;
    flag.position.z += Math.sin(rotation) * 0.45;
    flag.rotation.y = rotation + Math.PI / 2;
    flag.material = createEnvironmentMaterial(
      `${id}_flag_mat`,
      this.scene,
      new Color3(0.7, 0.2, 0.25)
    );
    meshes.push(flag);

    this.track(meshes);
    return meshes;
  }

  private track(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
