import {
  Animation,
  Color3,
  GlowLayer,
  type Mesh,
  MeshBuilder,
  type Scene,
  StandardMaterial,
  Vector3,
} from '@babylonjs/core';

export interface QuestMarker {
  id: string;
  position: Vector3;
  type: 'objective' | 'collectible' | 'npc' | 'exit';
  label?: string;
  active?: boolean;
}

export interface DataShard {
  id: string;
  position: Vector3;
  collected: boolean;
}

const MARKER_COLORS: Record<QuestMarker['type'], Color3> = {
  objective: new Color3(0.98, 0.77, 0.32),
  collectible: new Color3(0.3, 0.65, 0.95),
  npc: new Color3(0.3, 0.85, 0.5),
  exit: new Color3(0.8, 0.42, 0.64),
};

export class QuestMarkerManager {
  private meshes = new Map<string, Mesh>();
  private glowLayer: GlowLayer | null = null;

  constructor(private readonly scene: Scene) {
    this.glowLayer = new GlowLayer('questGlow', scene);
    this.glowLayer.intensity = 0.6;
  }

  setMarkers(markers: QuestMarker[], onInteract?: (markerId: string) => void) {
    const activeIds = new Set(markers.filter((m) => m.active !== false).map((m) => m.id));

    for (const id of this.meshes.keys()) {
      if (!activeIds.has(id)) {
        const mesh = this.meshes.get(id);
        mesh?.dispose();
        this.meshes.delete(id);
      }
    }

    for (const marker of markers) {
      if (marker.active === false) continue;
      let mesh = this.meshes.get(marker.id);
      if (!mesh) {
        mesh = createMarkerMesh(this.scene, marker, 2.5, this.glowLayer);
        mesh.metadata = { questMarkerId: marker.id, onInteract };
        this.meshes.set(marker.id, mesh);
      }
      mesh.position.x = marker.position.x;
      mesh.position.z = marker.position.z;
    }
  }

  dispose() {
    for (const mesh of this.meshes.values()) {
      mesh.dispose();
    }
    this.meshes.clear();
    this.glowLayer?.dispose();
    this.glowLayer = null;
  }
}

export class DataShardManager {
  private meshes = new Map<string, Mesh>();
  private shards = new Map<string, DataShard>();

  constructor(private readonly scene: Scene) {}

  setShards(shards: DataShard[], onCollect?: (shardId: string) => void) {
    for (const shard of shards) {
      this.shards.set(shard.id, shard);
    }

    for (const shard of shards) {
      if (shard.collected) {
        const mesh = this.meshes.get(shard.id);
        mesh?.dispose();
        this.meshes.delete(shard.id);
        continue;
      }

      if (!this.meshes.has(shard.id)) {
        const mesh = createDataShardMesh(this.scene, shard);
        mesh.metadata = { shardId: shard.id, onCollect };
        this.meshes.set(shard.id, mesh);
      }
    }
  }

  markCollected(shardId: string) {
    const shard = this.shards.get(shardId);
    if (!shard) return;
    shard.collected = true;
    const mesh = this.meshes.get(shardId);
    mesh?.dispose();
    this.meshes.delete(shardId);
  }

  dispose() {
    for (const mesh of this.meshes.values()) {
      mesh.dispose();
    }
    this.meshes.clear();
  }
}

function createMarkerMesh(
  scene: Scene,
  marker: QuestMarker,
  floatHeight: number,
  glowLayer: GlowLayer | null
): Mesh {
  const color = MARKER_COLORS[marker.type];
  let mesh: Mesh;

  switch (marker.type) {
    case 'objective':
      mesh = MeshBuilder.CreatePolyhedron(`marker_${marker.id}`, { type: 1, size: 0.4 }, scene);
      break;
    case 'collectible':
      mesh = MeshBuilder.CreateBox(`marker_${marker.id}`, { size: 0.35 }, scene);
      mesh.rotation.x = Math.PI / 4;
      mesh.rotation.z = Math.PI / 4;
      break;
    case 'npc': {
      const cylinder = MeshBuilder.CreateCylinder(
        `marker_${marker.id}_cyl`,
        { height: 0.6, diameter: 0.2, tessellation: 8 },
        scene
      );
      const dot = MeshBuilder.CreateSphere(
        `marker_${marker.id}_dot`,
        { diameter: 0.2, segments: 8 },
        scene
      );
      dot.position.y = -0.5;
      dot.parent = cylinder;
      mesh = cylinder;
      break;
    }
    case 'exit':
      mesh = MeshBuilder.CreateCylinder(
        `marker_${marker.id}`,
        { height: 0.8, diameterTop: 0, diameterBottom: 0.5, tessellation: 4 },
        scene
      );
      mesh.rotation.z = Math.PI;
      break;
    default:
      mesh = MeshBuilder.CreateSphere(`marker_${marker.id}`, { diameter: 0.4, segments: 8 }, scene);
  }

  mesh.position = new Vector3(marker.position.x, floatHeight, marker.position.z);

  const material = new StandardMaterial(`marker_mat_${marker.id}`, scene);
  material.diffuseColor = color.scale(0.5);
  material.emissiveColor = color;
  material.specularColor = new Color3(1, 1, 1);
  material.alpha = 0.9;
  mesh.material = material;

  if (glowLayer) {
    glowLayer.addIncludedOnlyMesh(mesh);
  }

  const floatAnim = new Animation(
    `float_${marker.id}`,
    'position.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  floatAnim.setKeys([
    { frame: 0, value: floatHeight },
    { frame: 30, value: floatHeight + 0.3 },
    { frame: 60, value: floatHeight },
  ]);
  mesh.animations.push(floatAnim);
  scene.beginAnimation(mesh, 0, 60, true);

  const rotateAnim = new Animation(
    `rotate_${marker.id}`,
    'rotation.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  rotateAnim.setKeys([
    { frame: 0, value: 0 },
    { frame: 120, value: Math.PI * 2 },
  ]);
  mesh.animations.push(rotateAnim);
  scene.beginAnimation(mesh, 0, 120, true);

  const pulseAnim = new Animation(
    `pulse_${marker.id}`,
    'material.emissiveColor',
    30,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  pulseAnim.setKeys([
    { frame: 0, value: color },
    { frame: 30, value: color.scale(1.5) },
    { frame: 60, value: color },
  ]);
  mesh.animations.push(pulseAnim);
  scene.beginAnimation(mesh, 0, 60, true);

  return mesh;
}

function createDataShardMesh(scene: Scene, shard: DataShard): Mesh {
  const mesh = MeshBuilder.CreatePolyhedron(`shard_${shard.id}`, { type: 2, size: 0.2 }, scene);
  mesh.position = new Vector3(shard.position.x, 0.8, shard.position.z);

  const material = new StandardMaterial(`shard_mat_${shard.id}`, scene);
  material.diffuseColor = new Color3(0, 0.3, 0.4);
  material.emissiveColor = new Color3(0, 0.7, 0.95);
  material.alpha = 0.85;
  mesh.material = material;

  const spinAnim = new Animation(
    `spin_${shard.id}`,
    'rotation.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  spinAnim.setKeys([
    { frame: 0, value: 0 },
    { frame: 60, value: Math.PI * 2 },
  ]);
  mesh.animations.push(spinAnim);
  scene.beginAnimation(mesh, 0, 60, true);

  return mesh;
}
