import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  PointLight,
  type Scene,
  Vector3,
} from '@babylonjs/core';
import seedrandom from 'seedrandom';
import { AlleyCompound } from './compounds/alley-compound';
import { BridgeCompound } from './compounds/bridge-compound';
import { BuildingCompound } from './compounds/building-compound';
import { RoomCompound } from './compounds/room-compound';
import { StreetCompound } from './compounds/street-compound';
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
  private buildingCompound: BuildingCompound | null = null;
  private bridgeCompound: BridgeCompound | null = null;
  private alleyCompound: AlleyCompound | null = null;
  private roomCompound: RoomCompound | null = null;
  private streetCompound: StreetCompound | null = null;

  constructor(private readonly scene: Scene) {}

  build(seed: string): FloodedWorldBuildResult {
    this.infrastructureKit?.dispose();
    this.infrastructureKit = new InfrastructureKit(this.scene);
    this.structuralKit?.dispose();
    this.structuralKit = new StructuralKit(this.scene);
    this.buildingCompound?.dispose();
    this.buildingCompound = new BuildingCompound(this.scene);
    this.bridgeCompound?.dispose();
    this.bridgeCompound = new BridgeCompound(this.scene);
    this.alleyCompound?.dispose();
    this.alleyCompound = new AlleyCompound(this.scene);
    this.roomCompound?.dispose();
    this.roomCompound = new RoomCompound(this.scene);
    this.streetCompound?.dispose();
    this.streetCompound = new StreetCompound(this.scene);
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
      this.placeCompounds(rooftop, seed);
    });

    bridges.forEach((bridge) => {
      if (!this.bridgeCompound) {
        return;
      }
      const bridgeMeshes = this.bridgeCompound.build({
        id: bridge.id,
        startPosition: bridge.startPos,
        endPosition: bridge.endPos,
        width: bridge.width,
        style: 'industrial',
        supportCount: 1,
        edgeLighting: true,
        accentColor: palette.glow,
      });
      this.meshes.push(...bridgeMeshes);
      const deck = bridgeMeshes.find((mesh) => mesh.name === `floor_${bridge.id}_deck`);
      if (deck) {
        groundMeshes.push(deck);
      }
    });

    const bounds = this.calculateBounds(rooftops, 6);
    this.placeStreet(bounds, seed);
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
    this.buildingCompound?.dispose();
    this.buildingCompound = null;
    this.bridgeCompound?.dispose();
    this.bridgeCompound = null;
    this.alleyCompound?.dispose();
    this.alleyCompound = null;
    this.roomCompound?.dispose();
    this.roomCompound = null;
    this.streetCompound?.dispose();
    this.streetCompound = null;
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
      academy: [
        'bench',
        'planter',
        'lantern',
        'antenna',
        'vent',
        'solar_panel',
        'heli_pad',
        'railing',
        'stairs',
      ],
      residential: [
        'ac_unit',
        'water_tank',
        'antenna',
        'vent',
        'crate',
        'tarp',
        'planter',
        'dumpster',
        'ladder',
        'awning',
      ],
      commercial: [
        'ac_unit',
        'satellite_dish',
        'vent',
        'solar_panel',
        'barrel',
        'bench',
        'generator',
        'balcony',
        'catwalk',
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
        'pillar',
        'ramp',
        'scaffold',
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
        case 'railing':
          this.addStructuralProp(
            'railing',
            `${rooftop.id}_rail_${i}`,
            new Vector3(x, y + 0.2, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'stairs':
          this.addStructuralProp(
            'stairs',
            `${rooftop.id}_stairs_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'ladder':
          this.addStructuralProp(
            'ladder',
            `${rooftop.id}_ladder_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'awning':
          this.addStructuralProp(
            'awning',
            `${rooftop.id}_awning_${i}`,
            new Vector3(x, y + 1.2, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'balcony':
          this.addStructuralProp(
            'balcony',
            `${rooftop.id}_balcony_${i}`,
            new Vector3(x, y + 1.6, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'catwalk':
          this.addStructuralProp(
            'catwalk',
            `${rooftop.id}_catwalk_${i}`,
            new Vector3(x, y + 0.4, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'pillar':
          this.addStructuralProp('pillar', `${rooftop.id}_pillar_${i}`, new Vector3(x, y, z));
          break;
        case 'ramp':
          this.addStructuralProp(
            'ramp',
            `${rooftop.id}_ramp_${i}`,
            new Vector3(x, y, z),
            propRng.next() * Math.PI * 2
          );
          break;
        case 'scaffold':
          this.addStructuralProp('scaffold', `${rooftop.id}_scaffold_${i}`, new Vector3(x, y, z));
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

  private placeCompounds(rooftop: RooftopBlock, seed: string) {
    if (!this.buildingCompound || !this.alleyCompound || !this.roomCompound) {
      return;
    }

    const compoundRng = createSubRng(seed, `compound_${rooftop.id}`);
    const baseY = rooftop.height;
    const basePosition = rooftop.position;

    if (rooftop.type === 'academy') {
      const roomWidth = Math.min(10, rooftop.width * 0.55);
      const roomDepth = Math.min(8, rooftop.depth * 0.45);
      const roomMeshes = this.roomCompound.build({
        id: `${rooftop.id}_dojo`,
        position: new Vector3(basePosition.x, baseY, basePosition.z + rooftop.depth * 0.1),
        dimensions: { width: roomWidth, depth: roomDepth, height: 3.5 },
        style: 'office',
        walls: { north: false, south: true, east: true, west: true },
        ambientLevel: 0.25,
      });
      this.meshes.push(...roomMeshes);
      return;
    }

    const buildingStyle =
      rooftop.type === 'residential'
        ? 'residential'
        : rooftop.type === 'commercial'
          ? 'commercial'
          : 'industrial';

    const buildingFootprint = {
      width: Math.max(4, Math.min(rooftop.width * 0.55, 10)),
      depth: Math.max(4, Math.min(rooftop.depth * 0.45, 10)),
    };

    const buildingMeshes = this.buildingCompound.build({
      id: `${rooftop.id}_building`,
      position: new Vector3(
        basePosition.x - rooftop.width * 0.15,
        baseY,
        basePosition.z - rooftop.depth * 0.1
      ),
      footprint: buildingFootprint,
      floors: compoundRng.int(2, 4),
      floorHeight: 2.8,
      style: buildingStyle,
      seed: compoundRng.int(1, 10000),
      rooftopEquipment: true,
    });
    this.meshes.push(...buildingMeshes);

    const alleyLength = Math.min(14, rooftop.depth * 0.6);
    if (alleyLength > 6) {
      const alleyMeshes = this.alleyCompound.build({
        id: `${rooftop.id}_alley`,
        position: new Vector3(
          basePosition.x + rooftop.width * 0.2,
          baseY,
          basePosition.z - rooftop.depth / 2 + 1
        ),
        dimensions: { length: alleyLength, width: 3, wallHeight: 6 },
        mood: rooftop.type === 'industrial' ? 'industrial' : 'neon',
        seed: compoundRng.int(1, 10000),
        deadEnd: compoundRng.next() > 0.5,
      });
      this.meshes.push(...alleyMeshes);
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

  private placeStreet(bounds: Bounds, seed: string) {
    if (!this.streetCompound) {
      return;
    }

    const streetRng = createSubRng(seed, 'street');
    const length = streetRng.int(32, 48);
    const canalWidth = streetRng.int(6, 10);
    const walkwayWidth = streetRng.int(3, 5);
    const maxStartZ = 50 - length;
    const minStartZ = -50;
    const desiredStartZ = bounds.minZ - length * 0.6;
    const startZ = Math.min(maxStartZ, Math.max(minStartZ, desiredStartZ));
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const style = streetRng.pick(['residential', 'market', 'commercial', 'industrial'] as const);

    const streetMeshes = this.streetCompound.build({
      id: 'main_canal',
      position: new Vector3(centerX, 0, startZ),
      dimensions: { length, canalWidth, walkwayWidth },
      style,
      seed: streetRng.int(1, 10000),
      leftWalkway: true,
      rightWalkway: true,
      waterLevel: -0.6,
      canalDepth: 3.2,
      ferryStops: streetRng.int(1, 3),
    });

    this.meshes.push(...streetMeshes);
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

  private addStructuralProp(
    kind:
      | 'stairs'
      | 'ladder'
      | 'railing'
      | 'fence'
      | 'pillar'
      | 'ramp'
      | 'balcony'
      | 'catwalk'
      | 'awning'
      | 'scaffold',
    id: string,
    position: Vector3,
    rotation = 0
  ) {
    if (!this.structuralKit) return;
    const kit = this.structuralKit;
    let meshes: AbstractMesh[] = [];
    switch (kind) {
      case 'stairs':
        meshes = kit.createStairs(id, position, 2.4, 1.6, 2.4);
        break;
      case 'ladder':
        meshes = kit.createLadder(id, position, 2.4, rotation);
        break;
      case 'railing':
        meshes = kit.createRailing(id, position, 3.2, 0.9, rotation);
        break;
      case 'fence':
        meshes = kit.createFence(id, position, 3.2, 1.2, rotation);
        break;
      case 'pillar':
        meshes = kit.createPillar(id, position, 3.2, 0.2);
        break;
      case 'ramp':
        meshes = kit.createRamp(id, position, 2.4, 1.0, 3.0, rotation);
        break;
      case 'balcony':
        meshes = kit.createBalcony(id, position, 3.0, 1.4, rotation);
        break;
      case 'catwalk':
        meshes = kit.createCatwalk(id, position, 3.0, 1.2, rotation);
        break;
      case 'awning':
        meshes = kit.createAwning(id, position, 2.4, 1.2, rotation);
        break;
      case 'scaffold':
        meshes = kit.createScaffold(id, position, 2.6, 2.4, 1.2);
        break;
    }
    this.meshes.push(...meshes);
  }
}

export type { FloodedWorldBuildResult };
