import {
  type AbstractMesh,
  Color3,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  type Vector3,
} from '@babylonjs/core';

export type InfrastructureKind =
  | 'ac_unit'
  | 'antenna'
  | 'cooling_tower'
  | 'dumpster'
  | 'generator'
  | 'heli_pad'
  | 'pipe'
  | 'power_line'
  | 'satellite_dish'
  | 'solar_panel'
  | 'storage_tank'
  | 'vent'
  | 'water_tank';

interface InfrastructureMaterials {
  metal: StandardMaterial;
  concrete: StandardMaterial;
  hazard: StandardMaterial;
  neon: StandardMaterial;
  grime: StandardMaterial;
}

export class InfrastructureKit {
  private materials: InfrastructureMaterials | null = null;

  constructor(private readonly scene: Scene) {}

  create(kind: InfrastructureKind, id: string, position: Vector3, rotation = 0): AbstractMesh[] {
    const materials = this.getMaterials();
    switch (kind) {
      case 'ac_unit':
        return createACUnit(this.scene, materials, id, position, rotation);
      case 'antenna':
        return createAntenna(this.scene, materials, id, position);
      case 'cooling_tower':
        return createCoolingTower(this.scene, materials, id, position);
      case 'dumpster':
        return createDumpster(this.scene, materials, id, position, rotation);
      case 'generator':
        return createGenerator(this.scene, materials, id, position, rotation);
      case 'heli_pad':
        return createHeliPad(this.scene, materials, id, position);
      case 'pipe':
        return createPipe(this.scene, materials, id, position, rotation);
      case 'power_line':
        return createPowerLine(this.scene, materials, id, position, rotation);
      case 'satellite_dish':
        return createSatelliteDish(this.scene, materials, id, position, rotation);
      case 'solar_panel':
        return createSolarPanel(this.scene, materials, id, position, rotation);
      case 'storage_tank':
        return createStorageTank(this.scene, materials, id, position, rotation);
      case 'vent':
        return createVent(this.scene, materials, id, position);
      case 'water_tank':
        return createWaterTank(this.scene, materials, id, position);
    }
  }

  dispose(): void {
    if (!this.materials) return;
    for (const mat of Object.values(this.materials)) {
      mat.dispose();
    }
    this.materials = null;
  }

  private getMaterials(): InfrastructureMaterials {
    if (this.materials) return this.materials;

    const metal = new StandardMaterial('infra_metal', this.scene);
    metal.diffuseColor = new Color3(0.28, 0.3, 0.34);
    metal.specularColor = new Color3(0.1, 0.1, 0.1);

    const concrete = new StandardMaterial('infra_concrete', this.scene);
    concrete.diffuseColor = new Color3(0.22, 0.23, 0.26);
    concrete.specularColor = new Color3(0.04, 0.04, 0.04);

    const hazard = new StandardMaterial('infra_hazard', this.scene);
    hazard.diffuseColor = new Color3(0.95, 0.78, 0.2);
    hazard.specularColor = new Color3(0.1, 0.1, 0.1);

    const neon = new StandardMaterial('infra_neon', this.scene);
    neon.diffuseColor = new Color3(0.2, 0.8, 1);
    neon.emissiveColor = new Color3(0.2, 0.8, 1);

    const grime = new StandardMaterial('infra_grime', this.scene);
    grime.diffuseColor = new Color3(0.18, 0.19, 0.22);
    grime.specularColor = new Color3(0.05, 0.05, 0.05);

    this.materials = { metal, concrete, hazard, neon, grime };
    return this.materials;
  }
}

function createACUnit(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const base = MeshBuilder.CreateBox(`ac_${id}`, { width: 1.4, height: 0.8, depth: 1.2 }, scene);
  base.position = position.clone();
  base.position.y += 0.4;
  base.rotation.y = rotation;
  base.material = materials.metal;

  const grill = MeshBuilder.CreateCylinder(`ac_grill_${id}`, { diameter: 0.6, height: 0.1 }, scene);
  grill.position = position.clone();
  grill.position.y += 0.85;
  grill.rotation.x = Math.PI / 2;
  grill.material = materials.grime;

  return [base, grill];
}

function createAntenna(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3
): AbstractMesh[] {
  const mast = MeshBuilder.CreateCylinder(`antenna_${id}`, { diameter: 0.12, height: 3 }, scene);
  mast.position = position.clone();
  mast.position.y += 1.5;
  mast.material = materials.metal;

  const dish = MeshBuilder.CreateCylinder(
    `antenna_dish_${id}`,
    { diameter: 1.2, height: 0.2 },
    scene
  );
  dish.position = position.clone();
  dish.position.y += 2.6;
  dish.rotation.x = Math.PI / 2;
  dish.material = materials.neon;
  return [mast, dish];
}

function createCoolingTower(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3
): AbstractMesh[] {
  const tower = MeshBuilder.CreateCylinder(
    `cooling_${id}`,
    { diameterTop: 2.6, diameterBottom: 3.2, height: 3.8 },
    scene
  );
  tower.position = position.clone();
  tower.position.y += 1.9;
  tower.material = materials.concrete;
  return [tower];
}

function createDumpster(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const body = MeshBuilder.CreateBox(
    `dumpster_${id}`,
    { width: 2.2, height: 1.2, depth: 1.3 },
    scene
  );
  body.position = position.clone();
  body.position.y += 0.6;
  body.rotation.y = rotation;
  body.material = materials.grime;

  const lid = MeshBuilder.CreateBox(
    `dumpster_lid_${id}`,
    { width: 2.2, height: 0.1, depth: 1.3 },
    scene
  );
  lid.position = body.position.clone();
  lid.position.y += 0.65;
  lid.material = materials.metal;

  return [body, lid];
}

function createGenerator(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const base = MeshBuilder.CreateBox(
    `generator_${id}`,
    { width: 1.6, height: 0.9, depth: 1 },
    scene
  );
  base.position = position.clone();
  base.position.y += 0.45;
  base.rotation.y = rotation;
  base.material = materials.metal;

  const stripe = MeshBuilder.CreateBox(
    `generator_stripe_${id}`,
    { width: 1.6, height: 0.15, depth: 1.02 },
    scene
  );
  stripe.position = base.position.clone();
  stripe.position.y += 0.2;
  stripe.material = materials.hazard;

  return [base, stripe];
}

function createHeliPad(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3
): AbstractMesh[] {
  const pad = MeshBuilder.CreateCylinder(`helipad_${id}`, { diameter: 6, height: 0.2 }, scene);
  pad.position = position.clone();
  pad.position.y += 0.1;
  pad.material = materials.concrete;

  const marker = MeshBuilder.CreateTorus(
    `helipad_marker_${id}`,
    { diameter: 4.5, thickness: 0.1 },
    scene
  );
  marker.position = pad.position.clone();
  marker.rotation.x = Math.PI / 2;
  marker.material = materials.neon;

  return [pad, marker];
}

function createPipe(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const pipe = MeshBuilder.CreateCylinder(`pipe_${id}`, { diameter: 0.4, height: 3 }, scene);
  pipe.position = position.clone();
  pipe.position.y += 0.4;
  pipe.rotation.z = Math.PI / 2;
  pipe.rotation.y = rotation;
  pipe.material = materials.metal;
  return [pipe];
}

function createPowerLine(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const pole = MeshBuilder.CreateCylinder(`power_pole_${id}`, { diameter: 0.25, height: 4 }, scene);
  pole.position = position.clone();
  pole.position.y += 2;
  pole.material = materials.metal;
  pole.rotation.y = rotation;

  const arm = MeshBuilder.CreateBox(
    `power_arm_${id}`,
    { width: 2.5, height: 0.1, depth: 0.1 },
    scene
  );
  arm.position = position.clone();
  arm.position.y += 3.3;
  arm.material = materials.metal;
  return [pole, arm];
}

function createSatelliteDish(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const dish = MeshBuilder.CreateCylinder(`satellite_${id}`, { diameter: 1.6, height: 0.2 }, scene);
  dish.position = position.clone();
  dish.position.y += 0.6;
  dish.rotation.x = Math.PI / 2;
  dish.rotation.y = rotation;
  dish.material = materials.metal;

  const mast = MeshBuilder.CreateCylinder(
    `satellite_mast_${id}`,
    { diameter: 0.12, height: 1 },
    scene
  );
  mast.position = position.clone();
  mast.position.y += 0.3;
  mast.material = materials.metal;

  return [dish, mast];
}

function createSolarPanel(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const panel = MeshBuilder.CreateBox(
    `solar_${id}`,
    { width: 1.6, height: 0.08, depth: 1.2 },
    scene
  );
  panel.position = position.clone();
  panel.position.y += 0.2;
  panel.rotation.y = rotation;
  panel.material = materials.neon;

  const stand = MeshBuilder.CreateBox(
    `solar_stand_${id}`,
    { width: 0.3, height: 0.3, depth: 0.3 },
    scene
  );
  stand.position = position.clone();
  stand.position.y += 0.05;
  stand.material = materials.metal;

  return [panel, stand];
}

function createStorageTank(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3,
  rotation: number
): AbstractMesh[] {
  const tank = MeshBuilder.CreateCylinder(`storage_${id}`, { diameter: 2.4, height: 1.6 }, scene);
  tank.position = position.clone();
  tank.position.y += 0.8;
  tank.rotation.y = rotation;
  tank.material = materials.metal;
  return [tank];
}

function createVent(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3
): AbstractMesh[] {
  const vent = MeshBuilder.CreateCylinder(`vent_${id}`, { diameter: 0.9, height: 0.5 }, scene);
  vent.position = position.clone();
  vent.position.y += 0.25;
  vent.material = materials.metal;
  return [vent];
}

function createWaterTank(
  scene: Scene,
  materials: InfrastructureMaterials,
  id: string,
  position: Vector3
): AbstractMesh[] {
  const tank = MeshBuilder.CreateCylinder(`water_${id}`, { diameter: 2, height: 1.6 }, scene);
  tank.position = position.clone();
  tank.position.y += 0.8;
  tank.material = materials.metal;
  return [tank];
}
