import { type AbstractMesh, Color3, MeshBuilder, type Scene, Vector3 } from '@babylonjs/core';
import { createEffectMaterial, createEnvironmentMaterial } from '../toon-material';

export type MaritimeProp =
  | 'pier'
  | 'pontoon'
  | 'boat'
  | 'buoy'
  | 'dock'
  | 'floating_platform'
  | 'houseboat'
  | 'rain_collector'
  | 'fishing_net'
  | 'anchor';

export interface MaritimeOptions {
  id: string;
  position: Vector3;
  rotation?: number;
  variant?: 'wood' | 'plastic' | 'traditional' | 'modern' | 'rowboat' | 'sampan';
}

export class MaritimeKit {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  create(
    kind: MaritimeProp,
    id: string,
    position: Vector3,
    rotation = 0,
    variant?: MaritimeOptions['variant']
  ) {
    switch (kind) {
      case 'pier':
        return this.createPier(id, position, rotation);
      case 'pontoon':
        return this.createPontoon(id, position, rotation, variant ?? 'wood');
      case 'boat':
        return this.createBoat(id, position, rotation, variant ?? 'rowboat');
      case 'buoy':
        return this.createBuoy(id, position);
      case 'dock':
        return this.createDock(id, position, rotation);
      case 'floating_platform':
        return this.createFloatingPlatform(id, position, rotation, variant ?? 'wood');
      case 'houseboat':
        return this.createHouseboat(id, position, rotation, variant ?? 'traditional');
      case 'rain_collector':
        return this.createRainCollector(id, position, rotation);
      case 'fishing_net':
        return this.createFishingNet(id, position, rotation);
      case 'anchor':
        return this.createAnchor(id, position, rotation);
    }
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private createPier(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const deck = MeshBuilder.CreateBox(
      `${id}_deck`,
      { width: 6, height: 0.3, depth: 2 },
      this.scene
    );
    deck.position = position.clone();
    deck.position.y += 0.15;
    deck.rotation.y = rotation;
    deck.material = createEnvironmentMaterial(
      `${id}_deck_mat`,
      this.scene,
      new Color3(0.45, 0.32, 0.2)
    );
    meshes.push(deck);

    const postColor = new Color3(0.3, 0.22, 0.15);
    const postOffsets = [
      new Vector3(-2.6, -1.2, -0.8),
      new Vector3(2.6, -1.2, -0.8),
      new Vector3(-2.6, -1.2, 0.8),
      new Vector3(2.6, -1.2, 0.8),
    ];
    postOffsets.forEach((offset, index) => {
      const post = MeshBuilder.CreateCylinder(
        `${id}_post_${index}`,
        { diameter: 0.25, height: 2.4 },
        this.scene
      );
      post.position = position.add(offset);
      post.rotation.y = rotation;
      post.material = createEnvironmentMaterial(`${id}_post_mat_${index}`, this.scene, postColor);
      meshes.push(post);
    });

    this.track(meshes);
    return meshes;
  }

  private createPontoon(
    id: string,
    position: Vector3,
    rotation: number,
    variant: MaritimeOptions['variant']
  ) {
    const meshes: AbstractMesh[] = [];
    const baseColor =
      variant === 'plastic' ? new Color3(0.2, 0.32, 0.45) : new Color3(0.4, 0.3, 0.2);
    const deck = MeshBuilder.CreateBox(
      `${id}_pontoon`,
      { width: 3, height: 0.4, depth: 1.6 },
      this.scene
    );
    deck.position = position.clone();
    deck.position.y += 0.2;
    deck.rotation.y = rotation;
    deck.material = createEnvironmentMaterial(`${id}_pontoon_mat`, this.scene, baseColor);
    meshes.push(deck);

    const bumper = MeshBuilder.CreateTorus(
      `${id}_bumper`,
      { diameter: 0.6, thickness: 0.1 },
      this.scene
    );
    bumper.position = position.clone();
    bumper.position.y += 0.25;
    bumper.position.z += 0.9;
    bumper.rotation.y = rotation;
    bumper.material = createEnvironmentMaterial(
      `${id}_bumper_mat`,
      this.scene,
      new Color3(0.1, 0.1, 0.12)
    );
    meshes.push(bumper);

    this.track(meshes);
    return meshes;
  }

  private createBoat(
    id: string,
    position: Vector3,
    rotation: number,
    variant: MaritimeOptions['variant']
  ) {
    const meshes: AbstractMesh[] = [];
    const hullColor =
      variant === 'sampan' ? new Color3(0.35, 0.22, 0.15) : new Color3(0.2, 0.28, 0.35);
    const hull = MeshBuilder.CreateBox(
      `${id}_hull`,
      { width: 2.2, height: 0.5, depth: 0.9 },
      this.scene
    );
    hull.position = position.clone();
    hull.position.y += 0.25;
    hull.rotation.y = rotation;
    hull.material = createEnvironmentMaterial(`${id}_hull_mat`, this.scene, hullColor);
    meshes.push(hull);

    const seat = MeshBuilder.CreateBox(
      `${id}_seat`,
      { width: 1.2, height: 0.15, depth: 0.4 },
      this.scene
    );
    seat.position = position.clone();
    seat.position.y += 0.45;
    seat.rotation.y = rotation;
    seat.material = createEnvironmentMaterial(
      `${id}_seat_mat`,
      this.scene,
      new Color3(0.5, 0.4, 0.25)
    );
    meshes.push(seat);

    if (variant === 'sampan') {
      const mast = MeshBuilder.CreateCylinder(
        `${id}_mast`,
        { diameter: 0.08, height: 1.2 },
        this.scene
      );
      mast.position = position.clone();
      mast.position.y += 0.9;
      mast.rotation.y = rotation;
      mast.material = createEnvironmentMaterial(
        `${id}_mast_mat`,
        this.scene,
        new Color3(0.35, 0.3, 0.25)
      );
      meshes.push(mast);

      const sail = MeshBuilder.CreatePlane(`${id}_sail`, { width: 0.9, height: 0.6 }, this.scene);
      sail.position = position.clone();
      sail.position.y += 0.9;
      sail.position.x += Math.cos(rotation) * 0.4;
      sail.position.z -= Math.sin(rotation) * 0.4;
      sail.rotation.y = rotation + Math.PI / 2;
      sail.material = createEnvironmentMaterial(
        `${id}_sail_mat`,
        this.scene,
        new Color3(0.75, 0.7, 0.6)
      );
      meshes.push(sail);
    }

    this.track(meshes);
    return meshes;
  }

  private createBuoy(id: string, position: Vector3) {
    const meshes: AbstractMesh[] = [];
    const base = MeshBuilder.CreateCylinder(
      `${id}_base`,
      { diameter: 0.4, height: 0.6 },
      this.scene
    );
    base.position = position.clone();
    base.position.y += 0.3;
    base.material = createEnvironmentMaterial(
      `${id}_base_mat`,
      this.scene,
      new Color3(0.8, 0.2, 0.2)
    );
    meshes.push(base);

    const light = MeshBuilder.CreateSphere(`${id}_light`, { diameter: 0.25 }, this.scene);
    light.position = position.clone();
    light.position.y += 0.7;
    light.material = createEffectMaterial(`${id}_light_mat`, this.scene, new Color3(1.0, 0.6, 0.2));
    meshes.push(light);

    this.track(meshes);
    return meshes;
  }

  private createDock(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const base = MeshBuilder.CreateBox(
      `${id}_dock`,
      { width: 4, height: 0.3, depth: 2.4 },
      this.scene
    );
    base.position = position.clone();
    base.position.y += 0.15;
    base.rotation.y = rotation;
    base.material = createEnvironmentMaterial(
      `${id}_dock_mat`,
      this.scene,
      new Color3(0.4, 0.28, 0.18)
    );
    meshes.push(base);

    const ladder = MeshBuilder.CreateBox(
      `${id}_ladder`,
      { width: 0.2, height: 1.2, depth: 0.05 },
      this.scene
    );
    ladder.position = position.clone();
    ladder.position.y -= 0.3;
    ladder.position.z -= 1.1;
    ladder.rotation.y = rotation;
    ladder.material = createEnvironmentMaterial(
      `${id}_ladder_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(ladder);

    this.track(meshes);
    return meshes;
  }

  private createFloatingPlatform(
    id: string,
    position: Vector3,
    rotation: number,
    variant: MaritimeOptions['variant']
  ) {
    const meshes: AbstractMesh[] = [];
    const color = variant === 'plastic' ? new Color3(0.22, 0.32, 0.4) : new Color3(0.4, 0.3, 0.2);
    const platform = MeshBuilder.CreateBox(
      `${id}_platform`,
      { width: 4, height: 0.35, depth: 2.5 },
      this.scene
    );
    platform.position = position.clone();
    platform.position.y += 0.2;
    platform.rotation.y = rotation;
    platform.material = createEnvironmentMaterial(`${id}_platform_mat`, this.scene, color);
    meshes.push(platform);

    this.track(meshes);
    return meshes;
  }

  private createHouseboat(
    id: string,
    position: Vector3,
    rotation: number,
    variant: MaritimeOptions['variant']
  ) {
    const meshes: AbstractMesh[] = [];
    const hull = MeshBuilder.CreateBox(
      `${id}_houseboat_hull`,
      { width: 6, height: 0.6, depth: 3 },
      this.scene
    );
    hull.position = position.clone();
    hull.position.y += 0.3;
    hull.rotation.y = rotation;
    hull.material = createEnvironmentMaterial(
      `${id}_houseboat_hull_mat`,
      this.scene,
      new Color3(0.28, 0.3, 0.35)
    );
    meshes.push(hull);

    const cabinColor =
      variant === 'modern' ? new Color3(0.6, 0.6, 0.65) : new Color3(0.45, 0.35, 0.25);
    const cabin = MeshBuilder.CreateBox(
      `${id}_houseboat_cabin`,
      { width: 3.5, height: 1.6, depth: 2.2 },
      this.scene
    );
    cabin.position = position.clone();
    cabin.position.y += 1.2;
    cabin.rotation.y = rotation;
    cabin.material = createEnvironmentMaterial(`${id}_houseboat_cabin_mat`, this.scene, cabinColor);
    meshes.push(cabin);

    const roof = MeshBuilder.CreateBox(
      `${id}_houseboat_roof`,
      { width: 3.8, height: 0.2, depth: 2.4 },
      this.scene
    );
    roof.position = position.clone();
    roof.position.y += 2.1;
    roof.rotation.y = rotation;
    roof.material = createEnvironmentMaterial(
      `${id}_houseboat_roof_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(roof);

    this.track(meshes);
    return meshes;
  }

  private createRainCollector(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const barrel = MeshBuilder.CreateCylinder(
      `${id}_barrel`,
      { diameter: 0.9, height: 1.1 },
      this.scene
    );
    barrel.position = position.clone();
    barrel.position.y += 0.55;
    barrel.rotation.y = rotation;
    barrel.material = createEnvironmentMaterial(
      `${id}_barrel_mat`,
      this.scene,
      new Color3(0.25, 0.32, 0.4)
    );
    meshes.push(barrel);

    const tarp = MeshBuilder.CreatePlane(`${id}_tarp`, { width: 1.4, height: 1.2 }, this.scene);
    tarp.position = position.clone();
    tarp.position.y += 1.2;
    tarp.position.z += 0.4;
    tarp.rotation.y = rotation;
    tarp.rotation.x = Math.PI / 6;
    tarp.material = createEnvironmentMaterial(
      `${id}_tarp_mat`,
      this.scene,
      new Color3(0.25, 0.3, 0.28)
    );
    meshes.push(tarp);

    this.track(meshes);
    return meshes;
  }

  private createFishingNet(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const net = MeshBuilder.CreatePlane(`${id}_net`, { width: 1.8, height: 1.2 }, this.scene);
    net.position = position.clone();
    net.position.y += 0.2;
    net.rotation.y = rotation;
    net.rotation.x = -Math.PI / 2.4;
    net.material = createEnvironmentMaterial(
      `${id}_net_mat`,
      this.scene,
      new Color3(0.2, 0.24, 0.28)
    );
    meshes.push(net);

    const floatLine = MeshBuilder.CreateCylinder(
      `${id}_float`,
      { diameter: 0.08, height: 1.8 },
      this.scene
    );
    floatLine.position = position.clone();
    floatLine.position.y += 0.6;
    floatLine.rotation.z = Math.PI / 2;
    floatLine.rotation.y = rotation;
    floatLine.material = createEnvironmentMaterial(
      `${id}_float_mat`,
      this.scene,
      new Color3(0.5, 0.42, 0.2)
    );
    meshes.push(floatLine);

    this.track(meshes);
    return meshes;
  }

  private createAnchor(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const shaft = MeshBuilder.CreateCylinder(
      `${id}_shaft`,
      { diameter: 0.1, height: 1.2 },
      this.scene
    );
    shaft.position = position.clone();
    shaft.position.y += 0.6;
    shaft.rotation.y = rotation;
    shaft.material = createEnvironmentMaterial(
      `${id}_shaft_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(shaft);

    const cross = MeshBuilder.CreateCylinder(
      `${id}_cross`,
      { diameter: 0.08, height: 0.6 },
      this.scene
    );
    cross.position = position.clone();
    cross.position.y += 0.2;
    cross.rotation.z = Math.PI / 2;
    cross.rotation.y = rotation;
    cross.material = createEnvironmentMaterial(
      `${id}_cross_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    meshes.push(cross);

    this.track(meshes);
    return meshes;
  }

  private track(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
