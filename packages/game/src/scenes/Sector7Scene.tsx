/**
 * Sector7Scene - Tutorial Level (Stage 2)
 *
 * Ground-level Neo-Tokyo streets.
 * First playable area after intro cutscene.
 *
 * Visual Composition:
 * - Background: Neon-lit street parallax (far cityscape)
 * - Midground: Building facades with neon signs framing left/right
 * - Foreground: Street-level ground with props (abandoned cars, steam vents)
 * - Characters: Kai (player), Yakuza grunts (optional encounters), Vera (ahead)
 *
 * Gameplay:
 * - Tutorial movement (WASD)
 * - Optional B-story Yakuza encounters
 * - Data shard collectibles
 * - Distance tracker showing Vera ahead
 * - Trigger: 500 units → Alien Abduction
 */

import type { AnimationGroup } from '@babylonjs/core';
import { type AbstractMesh, Color3, MeshBuilder, StandardMaterial, Vector3 } from '@babylonjs/core';
import {
  Character,
  CharacterAnimationController,
  CyberpunkNeonLights,
  DirectionalLightWithShadows,
  IsometricCamera,
  PlayerController,
  ProceduralBackground,
} from '@neo-tokyo/diorama';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useScene } from 'reactylon';
import { STAGE_CONFIGS } from './SceneManager';

const _CONFIG = STAGE_CONFIGS.sector7_streets;

export interface Sector7SceneProps {
  onStageComplete?: () => void;
  inputState?: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
}

// Prop placement data (world coordinates)
interface PropPlacement {
  type: 'car' | 'steam_vent' | 'barrier' | 'neon_sign' | 'trash_pile';
  position: Vector3;
  rotation?: number;
  scale?: number;
}

// Fixed prop placements for this scene
const PROP_PLACEMENTS: PropPlacement[] = [
  // Abandoned cars (obstacles)
  { type: 'car', position: new Vector3(-15, 0, 3), rotation: 0.2 },
  { type: 'car', position: new Vector3(8, 0, -4), rotation: -0.1 },
  { type: 'car', position: new Vector3(25, 0, 2), rotation: 0.3 },

  // Steam vents (atmospheric)
  { type: 'steam_vent', position: new Vector3(-8, 0, 0) },
  { type: 'steam_vent', position: new Vector3(12, 0, -2) },
  { type: 'steam_vent', position: new Vector3(30, 0, 1) },

  // Barriers (guide player path)
  { type: 'barrier', position: new Vector3(-20, 0, 8), rotation: 0 },
  { type: 'barrier', position: new Vector3(-20, 0, -8), rotation: 0 },

  // Trash piles (world detail)
  { type: 'trash_pile', position: new Vector3(-12, 0, 6) },
  { type: 'trash_pile', position: new Vector3(5, 0, -6) },
  { type: 'trash_pile', position: new Vector3(18, 0, 5) },
];

// NPC spawn points
interface NPCSpawn {
  type: 'yakuza_grunt' | 'vera_rival';
  position: Vector3;
  patrolPath?: Vector3[];
}

const _NPC_SPAWNS: NPCSpawn[] = [
  // Yakuza grunts for optional B-story combat
  {
    type: 'yakuza_grunt',
    position: new Vector3(15, 0, 0),
    patrolPath: [new Vector3(15, 0, -3), new Vector3(15, 0, 3)],
  },
  {
    type: 'yakuza_grunt',
    position: new Vector3(35, 0, 2),
  },

  // Vera running ahead (visible in distance)
  {
    type: 'vera_rival',
    position: new Vector3(40, 0, 0),
  },
];

// Data shard locations
interface DataShardLocation {
  id: string;
  position: Vector3;
  loreTitle: string;
}

const _DATA_SHARDS: DataShardLocation[] = [
  {
    id: 's7_shard_1',
    position: new Vector3(-5, 0.5, 4),
    loreTitle: 'The First Race',
  },
  {
    id: 's7_shard_2',
    position: new Vector3(20, 0.5, -5),
    loreTitle: 'Academy Origins',
  },
  {
    id: 's7_shard_3',
    position: new Vector3(42, 0.5, 0),
    loreTitle: 'The Midnight Protocol',
  },
];

// Scene bounds
const SCENE_BOUNDS = { minX: -25, maxX: 50, minZ: -10, maxZ: 10 };

export function Sector7Scene({ onStageComplete, inputState }: Sector7SceneProps) {
  const scene = useScene();
  const [characterMeshes, setCharacterMeshes] = useState<AbstractMesh[]>([]);
  const [animController, setAnimController] = useState<CharacterAnimationController | null>(null);
  const [playerProgress, setPlayerProgress] = useState(0);
  const [_collectedShards, setCollectedShards] = useState<Set<string>>(new Set());
  const [collisionMeshes, setCollisionMeshes] = useState<AbstractMesh[]>([]);
  const propsRef = useRef<AbstractMesh[]>([]);

  // Create scene props
  useEffect(() => {
    if (!scene) return;

    const props: AbstractMesh[] = [];

    // Create placeholder props (until we have proper GLB models)
    for (const placement of PROP_PLACEMENTS) {
      const prop = createPlaceholderProp(
        scene,
        placement.type,
        placement.position,
        placement.rotation,
        placement.scale
      );
      props.push(prop);
    }

    // Ground plane (street surface)
    const streetGround = MeshBuilder.CreateGround('street', { width: 100, height: 25 }, scene);
    streetGround.position.y = 0;
    streetGround.position.x = 25; // Offset for scene length

    const streetMat = new StandardMaterial('streetMat', scene);
    streetMat.diffuseColor = new Color3(0.08, 0.08, 0.1);
    streetMat.specularColor = new Color3(0.05, 0.05, 0.05);
    streetGround.material = streetMat;
    streetGround.receiveShadows = true;
    props.push(streetGround);

    propsRef.current = props;

    return () => {
      for (const prop of propsRef.current) {
        prop.dispose();
      }
      propsRef.current = [];
    };
  }, [scene]);

  // Track player progress
  useEffect(() => {
    if (!characterMeshes.length) return;

    const rootMesh = characterMeshes[0];
    // Check distance traveled
    if (rootMesh.position.x > 50 && onStageComplete) {
      // Trigger alien abduction at ~500 units
      console.log('[Sector7] Stage complete - triggering alien abduction');
      onStageComplete();
    }

    setPlayerProgress(Math.max(0, rootMesh.position.x));
  }, [characterMeshes, onStageComplete]);

  const handleCharacterLoaded = (meshes: AbstractMesh[], animations: AnimationGroup[]) => {
    setCharacterMeshes(meshes);
    const controller = new CharacterAnimationController(animations);
    setAnimController(controller);
    controller.play('combat', true);
  };

  const _handleShardCollect = (shardId: string) => {
    setCollectedShards((prev) => new Set([...prev, shardId]));
    console.log(`[Sector7] Collected shard: ${shardId}`);
  };

  // Callback when procedural background generates collision meshes
  const handleCollisionMeshesReady = useCallback((meshes: AbstractMesh[]) => {
    setCollisionMeshes(meshes);
  }, []);

  if (!scene) return null;

  return (
    <>
      {/* Camera - fixed isometric view, follows player */}
      <IsometricCamera target={new Vector3(playerProgress, 0, 0)} radius={30} orthoSize={18} />

      {/* Lighting */}
      <DirectionalLightWithShadows
        position={new Vector3(15, 25, 10)}
        intensity={1.0}
        shadowMapSize={2048}
        shadowCasters={characterMeshes}
      />
      <CyberpunkNeonLights />

      {/* Procedural background - generates buildings that define walkable area */}
      <ProceduralBackground
        seed="sector7-streets-v1"
        theme="neon"
        bounds={SCENE_BOUNDS}
        density={0.7}
        onCollisionMeshesReady={handleCollisionMeshesReady}
      />

      {/* Player character (Kai) */}
      <Character
        modelPath="/assets/characters/main/kai/animations/combat_stance.glb"
        animationPaths={['/assets/characters/main/kai/animations/runfast.glb']}
        position={new Vector3(0, 0, 0)}
        scale={1}
        initialAnimation="combat"
        onLoaded={handleCharacterLoaded}
      />

      {/* Player movement controller with collision */}
      {characterMeshes.length > 0 && animController && (
        <PlayerController
          characterMeshes={characterMeshes}
          animationController={animController}
          speed={5}
          bounds={SCENE_BOUNDS}
          collisionMeshes={collisionMeshes}
          inputState={inputState}
        />
      )}

      {/* Vera running ahead (rival marker) */}
      <Character
        modelPath="/assets/characters/main/vera/animations/runfast.glb"
        position={new Vector3(40 + playerProgress * 0.3, 0, 0)}
        scale={1}
        initialAnimation="run"
      />

      {/* TODO: Data shards as collectibles */}
      {/* TODO: Yakuza grunt NPCs */}
      {/* TODO: Dialogue triggers */}
    </>
  );
}

/**
 * Create a placeholder prop mesh until we have proper GLB models
 */
function createPlaceholderProp(
  scene: import('@babylonjs/core').Scene,
  type: PropPlacement['type'],
  position: Vector3,
  rotation = 0,
  scale = 1
): AbstractMesh {
  let mesh: AbstractMesh;
  let color: Color3;

  switch (type) {
    case 'car':
      mesh = MeshBuilder.CreateBox(
        `prop_car_${position.x}`,
        { width: 4, height: 1.5, depth: 2 },
        scene
      );
      mesh.position.y = 0.75;
      color = new Color3(0.15, 0.15, 0.2);
      break;

    case 'steam_vent':
      mesh = MeshBuilder.CreateCylinder(
        `prop_vent_${position.x}`,
        { height: 0.3, diameter: 1.5, tessellation: 12 },
        scene
      );
      mesh.position.y = 0.15;
      color = new Color3(0.2, 0.2, 0.22);
      break;

    case 'barrier':
      mesh = MeshBuilder.CreateBox(
        `prop_barrier_${position.x}`,
        { width: 3, height: 1.2, depth: 0.2 },
        scene
      );
      mesh.position.y = 0.6;
      color = new Color3(0.8, 0.5, 0.1); // Warning orange
      break;

    case 'neon_sign':
      mesh = MeshBuilder.CreateBox(
        `prop_sign_${position.x}`,
        { width: 4, height: 2, depth: 0.3 },
        scene
      );
      mesh.position.y = 5;
      color = new Color3(1, 0, 0.6); // Pink neon
      break;

    case 'trash_pile':
      mesh = MeshBuilder.CreatePolyhedron(
        `prop_trash_${position.x}`,
        { type: 1, size: 0.6 },
        scene
      );
      mesh.position.y = 0.3;
      color = new Color3(0.25, 0.2, 0.15);
      break;

    default:
      mesh = MeshBuilder.CreateBox(`prop_${position.x}`, { size: 1 }, scene);
      color = new Color3(0.5, 0.5, 0.5);
  }

  mesh.position.x = position.x;
  mesh.position.z = position.z;
  mesh.rotation.y = rotation;
  mesh.scaling = new Vector3(scale, scale, scale);

  const mat = new StandardMaterial(`mat_${mesh.name}`, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  mesh.material = mat;

  return mesh;
}
