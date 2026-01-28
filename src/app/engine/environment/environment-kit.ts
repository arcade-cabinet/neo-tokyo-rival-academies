import { type AbstractMesh, Color3, MeshBuilder, type Scene, type Vector3 } from '@babylonjs/core';
import { createEffectMaterial, createEnvironmentMaterial } from '../toon-material';

export type EnvironmentProp = 'steam_vent' | 'fog_panel';

export class EnvironmentKit {
  private meshes: AbstractMesh[] = [];

  constructor(private readonly scene: Scene) {}

  create(kind: EnvironmentProp, id: string, position: Vector3, rotation = 0) {
    switch (kind) {
      case 'steam_vent':
        return this.createSteamVent(id, position, rotation);
      case 'fog_panel':
        return this.createFogPanel(id, position, rotation);
    }
  }

  dispose() {
    this.meshes.forEach((mesh) => {
      mesh.material?.dispose?.();
      mesh.dispose();
    });
    this.meshes = [];
  }

  private createSteamVent(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const base = MeshBuilder.CreateCylinder(
      `${id}_base`,
      { diameter: 0.6, height: 0.3 },
      this.scene
    );
    base.position = position.clone();
    base.position.y += 0.15;
    base.rotation.y = rotation;
    base.material = createEnvironmentMaterial(
      `${id}_base_mat`,
      this.scene,
      new Color3(0.2, 0.22, 0.24)
    );
    meshes.push(base);

    const plume = MeshBuilder.CreatePlane(`${id}_plume`, { width: 1.4, height: 1.8 }, this.scene);
    plume.position = position.clone();
    plume.position.y += 1.1;
    plume.rotation.y = rotation;
    plume.material = createEffectMaterial(
      `${id}_plume_mat`,
      this.scene,
      new Color3(0.75, 0.8, 0.85)
    );
    plume.material.alpha = 0.6;
    meshes.push(plume);

    this.track(meshes);
    return meshes;
  }

  private createFogPanel(id: string, position: Vector3, rotation: number) {
    const meshes: AbstractMesh[] = [];
    const panel = MeshBuilder.CreatePlane(`${id}_fog`, { width: 6, height: 3 }, this.scene);
    panel.position = position.clone();
    panel.position.y += 1.5;
    panel.rotation.y = rotation;
    panel.material = createEffectMaterial(`${id}_fog_mat`, this.scene, new Color3(0.6, 0.65, 0.7));
    panel.material.alpha = 0.35;
    meshes.push(panel);

    this.track(meshes);
    return meshes;
  }

  private track(meshes: AbstractMesh[]) {
    this.meshes.push(...meshes);
  }
}
