import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  ParticleSystem,
  type Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';

export interface ForegroundPropsOptions {
  seed: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  enableParticles?: boolean;
}

interface PropPlacement {
  type: 'ac_unit' | 'pipe_cluster' | 'barrier' | 'steam_vent' | 'antenna';
  position: Vector3;
  rotation?: number;
  scale?: number;
}

interface PropMaterials {
  metal: StandardMaterial;
  grime: StandardMaterial;
  caution: StandardMaterial;
  neon: StandardMaterial;
}

export class ForegroundProps {
  private meshes: AbstractMesh[] = [];
  private particles: ParticleSystem[] = [];
  private materials: StandardMaterial[] = [];

  constructor(private readonly scene: Scene) {}

  build({ seed, bounds, enableParticles = true }: ForegroundPropsOptions) {
    const meshes: AbstractMesh[] = [];
    const particles: ParticleSystem[] = [];
    const placements = generatePropPlacements(seed, bounds);
    const materials = createPropMaterials(this.scene);

    for (const placement of placements) {
      let propMeshes: AbstractMesh[] = [];

      switch (placement.type) {
        case 'ac_unit':
          propMeshes = createACUnit(this.scene, placement, materials);
          break;
        case 'pipe_cluster':
          propMeshes = createPipeCluster(this.scene, placement, materials);
          break;
        case 'barrier':
          propMeshes = createBarrier(this.scene, placement, materials);
          break;
        case 'steam_vent':
          propMeshes = createSteamVent(this.scene, placement, materials);
          if (enableParticles) {
            particles.push(createSteamParticles(this.scene, placement.position));
          }
          break;
        case 'antenna':
          propMeshes = createAntenna(this.scene, placement, materials);
          break;
      }

      meshes.push(...propMeshes);
    }

    meshes.push(...createEdgeBarriers(this.scene, bounds, materials));

    this.meshes = meshes;
    this.particles = particles;
    this.materials = Object.values(materials);
  }

  dispose() {
    for (const mesh of this.meshes) {
      mesh.dispose();
    }
    for (const particle of this.particles) {
      particle.dispose();
    }
    for (const mat of this.materials) {
      mat.dispose();
    }
    this.meshes = [];
    this.particles = [];
    this.materials = [];
  }
}

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
    hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 0xffffffff;
  };
}

function generatePropPlacements(
  seed: string,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): PropPlacement[] {
  const random = seededRandom(seed);
  const placements: PropPlacement[] = [];
  const gridWidth = bounds.maxX - bounds.minX;
  const gridDepth = bounds.maxZ - bounds.minZ;

  const acCount = 3 + Math.floor(random() * 2);
  for (let i = 0; i < acCount; i++) {
    const edge = Math.floor(random() * 4);
    let x: number;
    let z: number;

    switch (edge) {
      case 0:
        x = bounds.minX + random() * gridWidth;
        z = bounds.minZ + random() * 3;
        break;
      case 1:
        x = bounds.minX + random() * gridWidth;
        z = bounds.maxZ - random() * 3;
        break;
      case 2:
        x = bounds.minX + random() * 3;
        z = bounds.minZ + random() * gridDepth;
        break;
      default:
        x = bounds.maxX - random() * 3;
        z = bounds.minZ + random() * gridDepth;
        break;
    }

    placements.push({
      type: 'ac_unit',
      position: new Vector3(x, 0, z),
      rotation: random() * Math.PI * 2,
    });
  }

  const pipeCount = 2 + Math.floor(random() * 2);
  for (let i = 0; i < pipeCount; i++) {
    placements.push({
      type: 'pipe_cluster',
      position: new Vector3(
        bounds.minX + 5 + random() * (gridWidth - 10),
        0,
        bounds.minZ + 5 + random() * (gridDepth - 10)
      ),
      rotation: random() * Math.PI * 2,
    });
  }

  const steamCount = 2 + Math.floor(random() * 2);
  for (let i = 0; i < steamCount; i++) {
    placements.push({
      type: 'steam_vent',
      position: new Vector3(
        bounds.minX + 3 + random() * (gridWidth - 6),
        0,
        bounds.minZ + 3 + random() * (gridDepth - 6)
      ),
    });
  }

  placements.push({
    type: 'barrier',
    position: new Vector3(bounds.minX + gridWidth * 0.5, 0, bounds.minZ + 4),
    rotation: 0,
    scale: 1.1,
  });
  placements.push({
    type: 'barrier',
    position: new Vector3(bounds.minX + gridWidth * 0.4, 0, bounds.maxZ - 4),
    rotation: Math.PI,
    scale: 1.1,
  });

  if (random() > 0.4) {
    placements.push({
      type: 'antenna',
      position: new Vector3(
        bounds.minX + 6 + random() * (gridWidth - 12),
        0,
        bounds.minZ + 6 + random() * (gridDepth - 12)
      ),
      rotation: random() * Math.PI * 2,
    });
  }

  return placements;
}

function createPropMaterials(scene: Scene): PropMaterials {
  const metal = new StandardMaterial('propMetal', scene);
  metal.diffuseColor = new Color3(0.25, 0.28, 0.32);
  metal.specularColor = new Color3(0.1, 0.1, 0.1);

  const grime = new StandardMaterial('propGrime', scene);
  grime.diffuseColor = new Color3(0.18, 0.2, 0.22);
  grime.specularColor = new Color3(0.05, 0.05, 0.05);

  const caution = new StandardMaterial('propCaution', scene);
  caution.diffuseColor = new Color3(0.9, 0.8, 0.2);
  caution.specularColor = new Color3(0.1, 0.1, 0.1);

  const neon = new StandardMaterial('propNeon', scene);
  neon.diffuseColor = new Color3(0.2, 0.8, 1);
  neon.emissiveColor = new Color3(0.2, 0.8, 1);

  return { metal, grime, caution, neon };
}

function createACUnit(scene: Scene, placement: PropPlacement, materials: PropMaterials) {
  const base = MeshBuilder.CreateBox('ac_base', { width: 1.2, height: 0.8, depth: 1.2 }, scene);
  base.position = placement.position.clone();
  base.position.y = 0.4;
  base.rotation.y = placement.rotation ?? 0;
  base.material = materials.metal;

  const fan = MeshBuilder.CreateCylinder('ac_fan', { diameter: 0.6, height: 0.1 }, scene);
  fan.position = base.position.clone();
  fan.position.y = 0.85;
  fan.rotation.x = Math.PI / 2;
  fan.material = materials.grime;

  return [base, fan];
}

function createPipeCluster(scene: Scene, placement: PropPlacement, materials: PropMaterials) {
  const meshes: AbstractMesh[] = [];
  const pipeCount = 3;
  for (let i = 0; i < pipeCount; i++) {
    const pipe = MeshBuilder.CreateCylinder(`pipe_${i}`, { diameter: 0.35, height: 3 }, scene);
    pipe.position = placement.position.clone();
    pipe.position.y = 0.4;
    pipe.position.x += (i - 1) * 0.6;
    pipe.rotation.z = Math.PI / 2;
    pipe.material = materials.metal;
    meshes.push(pipe);
  }

  const base = MeshBuilder.CreateBox('pipe_base', { width: 2, height: 0.2, depth: 1 }, scene);
  base.position = placement.position.clone();
  base.position.y = 0.1;
  base.material = materials.grime;
  meshes.push(base);
  return meshes;
}

function createBarrier(scene: Scene, placement: PropPlacement, materials: PropMaterials) {
  const barrier = MeshBuilder.CreateBox('barrier', { width: 4, height: 0.6, depth: 0.4 }, scene);
  barrier.position = placement.position.clone();
  barrier.position.y = 0.3;
  barrier.rotation.y = placement.rotation ?? 0;
  barrier.scaling.scaleInPlace(placement.scale ?? 1);
  barrier.material = materials.caution;
  return [barrier];
}

function createSteamVent(scene: Scene, placement: PropPlacement, materials: PropMaterials) {
  const vent = MeshBuilder.CreateCylinder('steam_vent', { diameter: 0.8, height: 0.4 }, scene);
  vent.position = placement.position.clone();
  vent.position.y = 0.2;
  vent.material = materials.metal;
  return [vent];
}

function createAntenna(scene: Scene, placement: PropPlacement, materials: PropMaterials) {
  const mast = MeshBuilder.CreateCylinder('antenna_mast', { diameter: 0.15, height: 3 }, scene);
  mast.position = placement.position.clone();
  mast.position.y = 1.5;
  mast.material = materials.metal;

  const dish = MeshBuilder.CreateCylinder('antenna_dish', { diameter: 1, height: 0.2 }, scene);
  dish.position = placement.position.clone();
  dish.position.y = 2.6;
  dish.rotation.x = Math.PI / 2;
  dish.material = materials.neon;
  return [mast, dish];
}

function createSteamParticles(scene: Scene, position: Vector3) {
  const particleSystem = new ParticleSystem('steam', 200, scene);
  particleSystem.particleTexture = new Texture('/assets/particles/soft.png', scene);
  particleSystem.emitter = position.add(new Vector3(0, 0.4, 0));
  particleSystem.minEmitBox = new Vector3(-0.2, 0, -0.2);
  particleSystem.maxEmitBox = new Vector3(0.2, 0.4, 0.2);
  particleSystem.color1 = new Color3(0.7, 0.7, 0.8).toColor4(0.6);
  particleSystem.color2 = new Color3(0.9, 0.9, 1).toColor4(0.2);
  particleSystem.colorDead = new Color3(0.9, 0.9, 1).toColor4(0);
  particleSystem.minSize = 0.2;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.6;
  particleSystem.maxLifeTime = 1.8;
  particleSystem.emitRate = 40;
  particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;
  particleSystem.gravity = new Vector3(0, 0.4, 0);
  particleSystem.direction1 = new Vector3(-0.2, 1, -0.2);
  particleSystem.direction2 = new Vector3(0.2, 1.4, 0.2);
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;
  particleSystem.minEmitPower = 0.4;
  particleSystem.maxEmitPower = 0.8;
  particleSystem.updateSpeed = 0.02;
  particleSystem.start();
  return particleSystem;
}

function createEdgeBarriers(
  scene: Scene,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
  materials: PropMaterials
) {
  const meshes: AbstractMesh[] = [];
  const width = bounds.maxX - bounds.minX;
  const depth = bounds.maxZ - bounds.minZ;

  const barrierTop = MeshBuilder.CreateBox(
    'edge_barrier_top',
    { width: width + 2, height: 0.5, depth: 0.3 },
    scene
  );
  barrierTop.position = new Vector3((bounds.minX + bounds.maxX) / 2, 0.25, bounds.minZ - 0.3);
  barrierTop.material = materials.grime;
  meshes.push(barrierTop);

  const barrierBottom = barrierTop.clone('edge_barrier_bottom');
  if (barrierBottom) {
    barrierBottom.position = new Vector3((bounds.minX + bounds.maxX) / 2, 0.25, bounds.maxZ + 0.3);
    barrierBottom.material = materials.grime;
    meshes.push(barrierBottom);
  }

  const barrierLeft = MeshBuilder.CreateBox(
    'edge_barrier_left',
    { width: 0.3, height: 0.5, depth: depth + 2 },
    scene
  );
  barrierLeft.position = new Vector3(bounds.minX - 0.3, 0.25, (bounds.minZ + bounds.maxZ) / 2);
  barrierLeft.material = materials.grime;
  meshes.push(barrierLeft);

  const barrierRight = barrierLeft.clone('edge_barrier_right');
  if (barrierRight) {
    barrierRight.position = new Vector3(bounds.maxX + 0.3, 0.25, (bounds.minZ + bounds.maxZ) / 2);
    barrierRight.material = materials.grime;
    meshes.push(barrierRight);
  }

  return meshes;
}
