import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  PointLight,
  type Scene,
  Vector3,
} from '@babylonjs/core';
import seedrandom from 'seedrandom';
import { InfrastructureKit } from './infrastructure/infrastructure-kit';
import { StructuralKit } from './structural/structural-kit';
import { createEffectMaterial, createEnvironmentMaterial } from './toon-material';

interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface RooftopBlock {
  id: string;
  position: Vector3;
  width: number;
  depth: number;
  height: number;
  type: 'academy' | 'residential' | 'commercial' | 'industrial';
  connections: string[];
}

interface BridgeConnection {
  id: string;
  from: string;
  to: string;
  startPos: Vector3;
  endPos: Vector3;
  width: number;
}

interface FloodedWorldBuildResult {
  spawnPoint: Vector3;
  bounds: Bounds;
  groundMeshes: AbstractMesh[];
  collisionMeshes: AbstractMesh[];
}

interface WorldRng {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(values: readonly T[]): T;
}

interface Palette {
  academy: Color3;
  residential: Color3;
  commercial: Color3;
  industrial: Color3;
  wall: Color3;
  metal: Color3;
  wood: Color3;
  cloth: Color3;
  water: Color3;
  light: Color3;
  glow: Color3;
}

const ROOFTOP_CONFIG = {
  academy: {
    width: { min: 12, max: 16 },
    depth: { min: 10, max: 14 },
    height: { min: 8, max: 10 },
  },
  residential: {
    width: { min: 6, max: 10 },
    depth: { min: 6, max: 10 },
    height: { min: 7, max: 9 },
  },
  commercial: {
    width: { min: 8, max: 14 },
    depth: { min: 8, max: 12 },
    height: { min: 7, max: 10 },
  },
  industrial: {
    width: { min: 10, max: 18 },
    depth: { min: 8, max: 14 },
    height: { min: 6, max: 9 },
  },
} as const;

function createRng(seed: string): WorldRng {
  const rng = seedrandom(seed);
  return {
    next: () => rng(),
    int: (min, max) => Math.floor(rng() * (max - min)) + min,
    pick: (values) => values[Math.floor(rng() * values.length)],
  };
}

function createSubRng(seed: string, key: string): WorldRng {
  return createRng(`${seed}:${key}`);
}

function generateRooftopLayout(
  rng: WorldRng,
  count: number
): { rooftops: RooftopBlock[]; bridges: BridgeConnection[] } {
  const rooftops: RooftopBlock[] = [];
  const bridges: BridgeConnection[] = [];

  const academyConfig = ROOFTOP_CONFIG.academy;
  const academy: RooftopBlock = {
    id: 'academy_main',
    position: new Vector3(0, 0, 0),
    width: rng.int(academyConfig.width.min, academyConfig.width.max),
    depth: rng.int(academyConfig.depth.min, academyConfig.depth.max),
    height: rng.int(academyConfig.height.min, academyConfig.height.max),
    type: 'academy',
    connections: [],
  };
  rooftops.push(academy);

  const types: Array<'residential' | 'commercial' | 'industrial'> = [
    'residential',
    'commercial',
    'industrial',
  ];

  for (let i = 1; i < count; i++) {
    const type = rng.pick(types);
    const config = ROOFTOP_CONFIG[type];

    const sourceIdx = rng.int(0, rooftops.length);
    const source = rooftops[sourceIdx];

    const direction = rng.pick(['north', 'south', 'east', 'west'] as const);
    const gap = rng.int(3, 8);
    const offset = (rng.next() - 0.5) * 10;

    const width = rng.int(config.width.min, config.width.max);
    const depth = rng.int(config.depth.min, config.depth.max);
    const height = rng.int(config.height.min, config.height.max);

    let position: Vector3;
    switch (direction) {
      case 'north':
        position = new Vector3(
          source.position.x + offset,
          0,
          source.position.z - source.depth / 2 - gap - depth / 2
        );
        break;
      case 'south':
        position = new Vector3(
          source.position.x + offset,
          0,
          source.position.z + source.depth / 2 + gap + depth / 2
        );
        break;
      case 'east':
        position = new Vector3(
          source.position.x + source.width / 2 + gap + width / 2,
          0,
          source.position.z + offset
        );
        break;
      default:
        position = new Vector3(
          source.position.x - source.width / 2 - gap - width / 2,
          0,
          source.position.z + offset
        );
        break;
    }

    const rooftop: RooftopBlock = {
      id: `rooftop_${i}_${type}`,
      position,
      width,
      depth,
      height,
      type,
      connections: [source.id],
    };

    rooftops.push(rooftop);
    source.connections.push(rooftop.id);

    let startPos: Vector3;
    let endPos: Vector3;

    switch (direction) {
      case 'north':
        startPos = new Vector3(
          source.position.x,
          source.height,
          source.position.z - source.depth / 2
        );
        endPos = new Vector3(position.x, height, position.z + depth / 2);
        break;
      case 'south':
        startPos = new Vector3(
          source.position.x,
          source.height,
          source.position.z + source.depth / 2
        );
        endPos = new Vector3(position.x, height, position.z - depth / 2);
        break;
      case 'east':
        startPos = new Vector3(
          source.position.x + source.width / 2,
          source.height,
          source.position.z
        );
        endPos = new Vector3(position.x - width / 2, height, position.z);
        break;
      default:
        startPos = new Vector3(
          source.position.x - source.width / 2,
          source.height,
          source.position.z
        );
        endPos = new Vector3(position.x + width / 2, height, position.z);
        break;
    }

    bridges.push({
      id: `bridge_${source.id}_${rooftop.id}`,
      from: source.id,
      to: rooftop.id,
      startPos,
      endPos,
      width: rng.int(2, 4),
    });
  }

  return { rooftops, bridges };
}

export class FloodedWorldBuilder {
  private readonly meshes: AbstractMesh[] = [];
  private readonly lights: PointLight[] = [];
  private infrastructureKit: InfrastructureKit | null = null;
  private structuralKit: StructuralKit | null = null;

  constructor(private readonly scene: Scene) {}

  build(seed: string): FloodedWorldBuildResult {
    this.infrastructureKit?.dispose();
    this.infrastructureKit = new InfrastructureKit(this.scene);
    this.structuralKit?.dispose();
    this.structuralKit = new StructuralKit(this.scene);
    const { rooftops, bridges } = generateRooftopLayout(createSubRng(seed, 'layout'), 8);

    const groundMeshes: AbstractMesh[] = [];
    const collisionMeshes: AbstractMesh[] = [];

    const palette: Palette = {
      academy: new Color3(0.25, 0.22, 0.3),
      residential: new Color3(0.28, 0.3, 0.32),
      commercial: new Color3(0.32, 0.32, 0.34),
      industrial: new Color3(0.35, 0.3, 0.28),
      wall: new Color3(0.2, 0.22, 0.24),
      metal: new Color3(0.35, 0.38, 0.4),
      wood: new Color3(0.45, 0.32, 0.2),
      cloth: new Color3(0.2, 0.25, 0.28),
      water: new Color3(0.05, 0.18, 0.25),
      light: new Color3(0.9, 0.75, 0.55),
      glow: new Color3(0.2, 0.45, 0.4),
    };

    const waterPlane = MeshBuilder.CreateGround(
      'water_plane',
      { width: 120, height: 120 },
      this.scene
    );
    waterPlane.position.y = 0;
    const waterMat = createEnvironmentMaterial('water_material', this.scene, palette.water);
    waterMat.alpha = 0.8;
    waterPlane.material = waterMat;
    this.meshes.push(waterPlane);

    rooftops.forEach((rooftop) => {
      const roofMat = createEnvironmentMaterial(
        `roof_${rooftop.type}`,
        this.scene,
        palette[rooftop.type]
      );
      const wallMat = createEnvironmentMaterial('roof_wall', this.scene, palette.wall);

      const floor = MeshBuilder.CreateBox(
        `${rooftop.id}_floor`,
        { width: rooftop.width, height: 0.2, depth: rooftop.depth },
        this.scene
      );
      floor.position.set(rooftop.position.x, rooftop.height - 0.1, rooftop.position.z);
      floor.material = roofMat;
      floor.receiveShadows = true;
      this.meshes.push(floor);
      groundMeshes.push(floor);

      const wallThickness = 0.2;
      const wallHeight = 1.2;

      const north = MeshBuilder.CreateBox(
        `${rooftop.id}_wall_n`,
        { width: rooftop.width, height: wallHeight, depth: wallThickness },
        this.scene
      );
      north.position.set(
        rooftop.position.x,
        rooftop.height + wallHeight / 2,
        rooftop.position.z - rooftop.depth / 2
      );
      north.material = wallMat;

      const south = north.clone(`${rooftop.id}_wall_s`);
      if (south) {
        south.position.set(
          rooftop.position.x,
          rooftop.height + wallHeight / 2,
          rooftop.position.z + rooftop.depth / 2
        );
      }

      const east = MeshBuilder.CreateBox(
        `${rooftop.id}_wall_e`,
        { width: wallThickness, height: wallHeight, depth: rooftop.depth },
        this.scene
      );
      east.position.set(
        rooftop.position.x + rooftop.width / 2,
        rooftop.height + wallHeight / 2,
        rooftop.position.z
      );
      east.material = wallMat;

      const west = east.clone(`${rooftop.id}_wall_w`);
      if (west) {
        west.position.set(
          rooftop.position.x - rooftop.width / 2,
          rooftop.height + wallHeight / 2,
          rooftop.position.z
        );
      }

      [north, south, east, west].forEach((mesh) => {
        if (mesh) {
          this.meshes.push(mesh);
          collisionMeshes.push(mesh);
        }
      });

      this.placeProps(rooftop, seed, palette);
    });

    bridges.forEach((bridge) => {
      const length = Math.hypot(
        bridge.endPos.x - bridge.startPos.x,
        bridge.endPos.z - bridge.startPos.z
      );
      const midpoint = new Vector3(
        (bridge.startPos.x + bridge.endPos.x) / 2,
        (bridge.startPos.y + bridge.endPos.y) / 2,
        (bridge.startPos.z + bridge.endPos.z) / 2
      );
      const angle = Math.atan2(
        bridge.endPos.x - bridge.startPos.x,
        bridge.endPos.z - bridge.startPos.z
      );

      const bridgeMesh = MeshBuilder.CreateBox(
        bridge.id,
        { width: bridge.width, height: 0.15, depth: length },
        this.scene
      );
      bridgeMesh.position.set(midpoint.x, midpoint.y, midpoint.z);
      bridgeMesh.rotation.y = angle;
      bridgeMesh.material = createEnvironmentMaterial('bridge_metal', this.scene, palette.metal);
      bridgeMesh.receiveShadows = true;
      this.meshes.push(bridgeMesh);
      groundMeshes.push(bridgeMesh);

      if (this.structuralKit) {
        const offset = bridge.width / 2 + 0.2;
        const sideOffsetX = Math.cos(angle + Math.PI / 2) * offset;
        const sideOffsetZ = Math.sin(angle + Math.PI / 2) * offset;
        const railingPosLeft = new Vector3(
          midpoint.x + sideOffsetX,
          midpoint.y + 0.1,
          midpoint.z + sideOffsetZ
        );
        const railingPosRight = new Vector3(
          midpoint.x - sideOffsetX,
          midpoint.y + 0.1,
          midpoint.z - sideOffsetZ
        );
        const leftRail = this.structuralKit.createRailing(
          `${bridge.id}_rail_l`,
          railingPosLeft,
          length,
          0.8,
          angle
        );
        const rightRail = this.structuralKit.createRailing(
          `${bridge.id}_rail_r`,
          railingPosRight,
          length,
          0.8,
          angle
        );
        this.meshes.push(...leftRail, ...rightRail);
      }
    });

    const bounds = this.calculateBounds(rooftops, 6);
    const spawnPoint = this.resolveSpawnPoint(rooftops, bounds);

    return {
      spawnPoint,
      bounds,
      groundMeshes,
      collisionMeshes,
    };
  }

  dispose() {
    this.infrastructureKit?.dispose();
    this.infrastructureKit = null;
    this.structuralKit?.dispose();
    this.structuralKit = null;
    this.lights.forEach((light) => {
      light.dispose();
    });
    this.meshes.forEach((mesh) => {
      mesh.dispose();
    });
    this.lights.length = 0;
    this.meshes.length = 0;
  }

  private placeProps(rooftop: RooftopBlock, seed: string, palette: Palette) {
    const propRng = createSubRng(seed, `props_${rooftop.id}`);
    const area = rooftop.width * rooftop.depth;
    const propCount = Math.floor(area / 15) + propRng.int(2, 5);
    const propTypes: Record<RooftopBlock['type'], string[]> = {
      academy: ['bench', 'planter', 'lantern', 'antenna', 'vent', 'solar_panel', 'heli_pad'],
      residential: [
        'ac_unit',
        'water_tank',
        'antenna',
        'vent',
        'crate',
        'tarp',
        'planter',
        'dumpster',
      ],
      commercial: [
        'ac_unit',
        'satellite_dish',
        'vent',
        'solar_panel',
        'barrel',
        'bench',
        'generator',
      ],
      industrial: [
        'water_tank',
        'vent',
        'crate',
        'barrel',
        'debris',
        'tarp',
        'antenna',
        'storage_tank',
        'cooling_tower',
        'pipe',
        'power_line',
      ],
    };

    for (let i = 0; i < propCount; i++) {
      const propType = propRng.pick(propTypes[rooftop.type]);
      const margin = 1.5;
      const x = rooftop.position.x + (propRng.next() - 0.5) * (rooftop.width - margin * 2);
      const z = rooftop.position.z + (propRng.next() - 0.5) * (rooftop.depth - margin * 2);
      const y = rooftop.height + 0.05;

      switch (propType) {
        case 'ac_unit':
          this.addInfrastructureProp('ac_unit', `${rooftop.id}_ac_${i}`, new Vector3(x, y, z));
          break;
        case 'water_tank':
          this.addInfrastructureProp('water_tank', `${rooftop.id}_tank_${i}`, new Vector3(x, y, z));
          break;
        case 'antenna':
          this.addInfrastructureProp('antenna', `${rooftop.id}_antenna_${i}`, new Vector3(x, y, z));
          break;
        case 'satellite_dish':
          this.addInfrastructureProp(
            'satellite_dish',
            `${rooftop.id}_dish_${i}`,
            new Vector3(x, y, z)
          );
          break;
        case 'solar_panel':
          this.addInfrastructureProp(
            'solar_panel',
            `${rooftop.id}_solar_${i}`,
            new Vector3(x, y, z),
            Math.PI / 8
          );
          break;
        case 'vent':
          this.addInfrastructureProp('vent', `${rooftop.id}_vent_${i}`, new Vector3(x, y, z));
          break;
        case 'generator':
          this.addInfrastructureProp(
            'generator',
            `${rooftop.id}_generator_${i}`,
            new Vector3(x, y, z)
          );
          break;
        case 'dumpster':
          this.addInfrastructureProp(
            'dumpster',
            `${rooftop.id}_dumpster_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'storage_tank':
          this.addInfrastructureProp(
            'storage_tank',
            `${rooftop.id}_storage_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'cooling_tower':
          this.addInfrastructureProp(
            'cooling_tower',
            `${rooftop.id}_cooling_${i}`,
            new Vector3(x, y, z)
          );
          break;
        case 'pipe':
          this.addInfrastructureProp(
            'pipe',
            `${rooftop.id}_pipe_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'power_line':
          this.addInfrastructureProp(
            'power_line',
            `${rooftop.id}_power_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'heli_pad':
          this.addInfrastructureProp(
            'heli_pad',
            `${rooftop.id}_helipad_${i}`,
            new Vector3(x, y, z)
          );
          break;
        case 'crate':
          this.addBoxProp(
            `${rooftop.id}_crate_${i}`,
            new Vector3(x, y + 0.3, z),
            palette.wood,
            0.8,
            0.6,
            0.8
          );
          break;
        case 'barrel':
          this.addCylinderProp(
            `${rooftop.id}_barrel_${i}`,
            new Vector3(x, y + 0.5, z),
            new Color3(0.2, 0.3, 0.32),
            0.4,
            1.0
          );
          break;
        case 'tarp':
          this.addBoxProp(
            `${rooftop.id}_tarp_${i}`,
            new Vector3(x, y + 0.2, z),
            palette.cloth,
            1.6,
            0.2,
            1.6
          );
          break;
        case 'debris':
          this.addBoxProp(
            `${rooftop.id}_debris_${i}`,
            new Vector3(x, y + 0.1, z),
            new Color3(0.18, 0.2, 0.22),
            0.6,
            0.2,
            0.6
          );
          break;
        case 'planter':
          this.addBoxProp(
            `${rooftop.id}_planter_${i}`,
            new Vector3(x, y + 0.3, z),
            new Color3(0.2, 0.25, 0.18),
            0.8,
            0.6,
            0.8
          );
          break;
        case 'bench':
          this.addBoxProp(
            `${rooftop.id}_bench_${i}`,
            new Vector3(x, y + 0.25, z),
            palette.wood,
            1.4,
            0.3,
            0.5
          );
          break;
        case 'lantern':
          this.addLantern(`${rooftop.id}_lantern_${i}`, new Vector3(x, y + 0.4, z));
          break;
        default:
          break;
      }
    }
  }

  private addBoxProp(
    id: string,
    position: Vector3,
    color: Color3,
    width: number,
    height: number,
    depth: number,
    tilt = 0
  ) {
    const mesh = MeshBuilder.CreateBox(id, { width, height, depth }, this.scene);
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.x = tilt;
    mesh.material = createEnvironmentMaterial(`${id}_mat`, this.scene, color);
    this.meshes.push(mesh);
  }

  private addCylinderProp(
    id: string,
    position: Vector3,
    color: Color3,
    diameter: number,
    height: number
  ) {
    const mesh = MeshBuilder.CreateCylinder(id, { diameter, height }, this.scene);
    mesh.position.set(position.x, position.y, position.z);
    mesh.material = createEnvironmentMaterial(`${id}_mat`, this.scene, color);
    this.meshes.push(mesh);
  }

  private addLantern(id: string, position: Vector3) {
    const base = MeshBuilder.CreateCylinder(
      `${id}_base`,
      { diameter: 0.3, height: 0.4 },
      this.scene
    );
    base.position.set(position.x, position.y, position.z);
    base.material = createEnvironmentMaterial(
      `${id}_base_mat`,
      this.scene,
      new Color3(0.2, 0.2, 0.22)
    );
    this.meshes.push(base);

    const glow = MeshBuilder.CreateSphere(`${id}_glow`, { diameter: 0.35 }, this.scene);
    glow.position.set(position.x, position.y + 0.35, position.z);
    glow.material = createEffectMaterial(`${id}_glow_mat`, this.scene, new Color3(1.0, 0.6, 0.2));
    this.meshes.push(glow);

    const light = new PointLight(`${id}_light`, glow.position, this.scene);
    light.diffuse = new Color3(1.0, 0.55, 0.25);
    light.intensity = 0.4;
    this.lights.push(light);
  }

  private calculateBounds(rooftops: RooftopBlock[], padding: number): Bounds {
    const minX = Math.min(...rooftops.map((roof) => roof.position.x - roof.width / 2)) - padding;
    const maxX = Math.max(...rooftops.map((roof) => roof.position.x + roof.width / 2)) + padding;
    const minZ = Math.min(...rooftops.map((roof) => roof.position.z - roof.depth / 2)) - padding;
    const maxZ = Math.max(...rooftops.map((roof) => roof.position.z + roof.depth / 2)) + padding;
    return { minX, maxX, minZ, maxZ };
  }

  private resolveSpawnPoint(rooftops: RooftopBlock[], bounds: Bounds): Vector3 {
    const academy = rooftops.find((roof) => roof.type === 'academy');
    if (academy) {
      return new Vector3(academy.position.x, academy.height + 1, academy.position.z);
    }
    return new Vector3((bounds.minX + bounds.maxX) / 2, 8, (bounds.minZ + bounds.maxZ) / 2);
  }

  private addInfrastructureProp(
    kind: Parameters<InfrastructureKit['create']>[0],
    id: string,
    position: Vector3,
    rotation = 0
  ) {
    if (!this.infrastructureKit) return;
    const meshes = this.infrastructureKit.create(kind, id, position, rotation);
    this.meshes.push(...meshes);
  }
}

export type { FloodedWorldBuildResult };
