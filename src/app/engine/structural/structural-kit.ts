import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  type Vector3,
} from '@babylonjs/core';

export class StructuralKit {
  private materials: {
    metal: StandardMaterial;
    concrete: StandardMaterial;
    glass: StandardMaterial;
  } | null = null;

  constructor(private readonly scene: Scene) {}

  createStairs(
    id: string,
    position: Vector3,
    width: number,
    height: number,
    depth: number
  ): AbstractMesh[] {
    const stepCount = Math.max(3, Math.floor(height / 0.3));
    const stepHeight = height / stepCount;
    const stepDepth = depth / stepCount;
    const meshes: AbstractMesh[] = [];
    const mat = this.getMaterials().concrete;

    for (let i = 0; i < stepCount; i++) {
      const step = MeshBuilder.CreateBox(
        `stairs_${id}_${i}`,
        { width, height: stepHeight, depth: stepDepth },
        this.scene
      );
      step.position = position.clone();
      step.position.y += stepHeight / 2 + i * stepHeight;
      step.position.z += -depth / 2 + stepDepth / 2 + i * stepDepth;
      step.material = mat;
      meshes.push(step);
    }

    return meshes;
  }

  createRailing(
    id: string,
    position: Vector3,
    length: number,
    height = 0.8,
    rotation = 0
  ): AbstractMesh[] {
    const mat = this.getMaterials().metal;
    const base = MeshBuilder.CreateBox(
      `railing_${id}`,
      { width: length, height: 0.1, depth: 0.1 },
      this.scene
    );
    base.position = position.clone();
    base.position.y += height;
    base.rotation.y = rotation;
    base.material = mat;

    const posts: AbstractMesh[] = [];
    const postCount = Math.max(2, Math.floor(length / 1.5));
    for (let i = 0; i <= postCount; i++) {
      const offset = -length / 2 + (length / postCount) * i;
      const offsetX = Math.cos(rotation) * offset;
      const offsetZ = Math.sin(rotation) * offset;
      const post = MeshBuilder.CreateBox(
        `railing_${id}_post_${i}`,
        { width: 0.1, height: height, depth: 0.1 },
        this.scene
      );
      post.position = position.clone();
      post.position.y += height / 2;
      post.position.x += offsetX;
      post.position.z += offsetZ;
      post.rotation.y = rotation;
      post.material = mat;
      posts.push(post);
    }

    return [base, ...posts];
  }

  createFence(
    id: string,
    position: Vector3,
    length: number,
    height = 1.2,
    rotation = 0
  ): AbstractMesh[] {
    const mat = this.getMaterials().metal;
    const mesh = MeshBuilder.CreateBox(
      `fence_${id}`,
      { width: length, height, depth: 0.1 },
      this.scene
    );
    mesh.position = position.clone();
    mesh.position.y += height / 2;
    mesh.rotation.y = rotation;
    mesh.material = mat;
    return [mesh];
  }

  createLadder(id: string, position: Vector3, height: number, rotation = 0): AbstractMesh[] {
    const mat = this.getMaterials().metal;
    const sideLeft = MeshBuilder.CreateBox(
      `ladder_${id}_left`,
      { width: 0.05, height, depth: 0.05 },
      this.scene
    );
    sideLeft.position = position.clone();
    sideLeft.position.x -= 0.25;
    sideLeft.position.y += height / 2;
    sideLeft.rotation.y = rotation;
    sideLeft.material = mat;

    const sideRight = sideLeft.clone(`ladder_${id}_right`);
    if (sideRight) {
      sideRight.position.x += 0.5;
      sideRight.material = mat;
    }

    const rungs: AbstractMesh[] = [];
    const rungCount = Math.max(3, Math.floor(height / 0.3));
    for (let i = 0; i < rungCount; i++) {
      const rung = MeshBuilder.CreateBox(
        `ladder_${id}_rung_${i}`,
        { width: 0.5, height: 0.05, depth: 0.05 },
        this.scene
      );
      rung.position = position.clone();
      rung.position.y += 0.2 + i * (height / rungCount);
      rung.rotation.y = rotation;
      rung.material = mat;
      rungs.push(rung);
    }

    return [sideLeft, ...(sideRight ? [sideRight] : []), ...rungs];
  }

  createDoor(id: string, position: Vector3, width = 1, height = 2.2, rotation = 0): AbstractMesh[] {
    const mat = this.getMaterials().metal;
    const mesh = MeshBuilder.CreateBox(`door_${id}`, { width, height, depth: 0.08 }, this.scene);
    mesh.position = position.clone();
    mesh.position.y += height / 2;
    mesh.rotation.y = rotation;
    mesh.material = mat;
    return [mesh];
  }

  createWindow(
    id: string,
    position: Vector3,
    width = 1,
    height = 0.8,
    rotation = 0
  ): AbstractMesh[] {
    const mat = this.getMaterials().glass;
    const mesh = MeshBuilder.CreateBox(`window_${id}`, { width, height, depth: 0.05 }, this.scene);
    mesh.position = position.clone();
    mesh.position.y += height / 2;
    mesh.rotation.y = rotation;
    mesh.material = mat;
    return [mesh];
  }

  dispose(): void {
    if (!this.materials) return;
    for (const mat of Object.values(this.materials)) {
      mat.dispose();
    }
    this.materials = null;
  }

  private getMaterials() {
    if (this.materials) return this.materials;

    const metal = new StandardMaterial('struct_metal', this.scene);
    metal.diffuseColor = new Color3(0.25, 0.28, 0.32);
    metal.specularColor = new Color3(0.1, 0.1, 0.1);

    const concrete = new StandardMaterial('struct_concrete', this.scene);
    concrete.diffuseColor = new Color3(0.2, 0.2, 0.23);
    concrete.specularColor = new Color3(0.05, 0.05, 0.05);

    const glass = new StandardMaterial('struct_glass', this.scene);
    glass.diffuseColor = new Color3(0.1, 0.14, 0.2);
    glass.emissiveColor = new Color3(0.15, 0.2, 0.3);
    glass.alpha = 0.6;

    this.materials = { metal, concrete, glass };
    return this.materials;
  }
}
