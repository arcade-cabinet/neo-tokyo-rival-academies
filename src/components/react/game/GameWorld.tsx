import { Character } from '@components/react/objects/Character';
import { Enemy } from '@components/react/objects/Enemy';
import { Obstacle } from '@components/react/objects/Obstacle';
import { Platform } from '@components/react/objects/Platform';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ECS, world } from '@/state/ecs';
import { CombatSystem } from '@/systems/CombatSystem';
import { InputSystem } from '@/systems/InputSystem';
import { MovementSystem } from '@/systems/MovementSystem';
import { PhysicsSystem } from '@/systems/PhysicsSystem';
import type { GameState, InputState } from '@/types/game';

interface GameWorldProps {
  gameState: GameState;
  inputState: InputState;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onCombatText?: (message: string, color: string) => void;
  onCameraShake?: () => void;
}

const pickEnemyColor = () => {
  // Randomize Yakuza (Black) vs Rival (Cyan) vs Biker (Red)
  const enemyTypeRand = Math.random();
  let color = 0x00ffff; // Rival
  if (enemyTypeRand > 0.7)
    color = 0x111111; // Yakuza
  else if (enemyTypeRand > 0.4) color = 0x880000; // Biker
  return color;
};

export function GameWorld({
  gameState,
  inputState,
  onGameOver,
  onScoreUpdate,
  onCameraShake,
}: GameWorldProps) {
  const { camera } = useThree();
  const initialized = useRef(false);

  // Generation state
  const genStateRef = useRef({
    nextX: -10,
    nextY: 0,
  });

  // Init World
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Spawn Player
    world.add({
      id: 'player',
      isPlayer: true,
      position: new THREE.Vector3(0, 5, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      characterState: 'run',
      faction: 'Kurenai',
      modelColor: 0xff0000,
    });

    // Spawn Start Platform
    world.add({
      id: 'start-platform',
      isPlatform: true,
      position: new THREE.Vector3(-10, 0, 0),
      platformData: { length: 40, slope: 0, width: 8 },
      modelColor: 0x0a0a0a,
    });
    genStateRef.current.nextX = 30;

    return () => {
      world.clear();
      initialized.current = false;
    };
  }, []);

  // Main Loop for Camera & Procedural Gen
  useFrame((_state, delta) => {
    if (!gameState.active) return;

    // Camera follow player (Side View)
    const player = world.with('isPlayer', 'position').first;
    if (player) {
      // Side view camera logic
      camera.position.x = player.position.x; // Keep player centered horizontally
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, player.position.y + 3, 3 * delta);
      camera.position.z = 25; // Fixed distance for 2.5D view
      camera.lookAt(player.position.x, player.position.y + 2, 0);

      onScoreUpdate(Math.floor(player.position.x));

      // Game Over check
      if (player.position.y < -20) {
        onGameOver();
      }

      // Camera Shake Trigger (e.g., from external events)
      if (onCameraShake && Math.random() < 0.0005) {
        onCameraShake();
      }

      // Generate ahead
      if (genStateRef.current.nextX < player.position.x + 80) {
        generatePlatform();
      }
    }
  });

  const generatePlatform = () => {
    const type = Math.random();
    let length = 15 + Math.random() * 15;
    let slope = 0;

    if (type < 0.2) {
      // GAP
      const gap = 5 + Math.random() * 8;
      genStateRef.current.nextX += gap;
      const yChange = (Math.random() - 0.6) * 5;
      genStateRef.current.nextY += yChange > 2 ? 2 : yChange;
    } else if (type < 0.6) {
      slope = 0;
    } else if (type < 0.8) {
      slope = 1;
      length = 15 + Math.random() * 10;
    } else {
      slope = -1;
      length = 15 + Math.random() * 10;
    }

    const angle = slope * 0.26;
    // Current spawn point
    const x = genStateRef.current.nextX;
    const y = genStateRef.current.nextY;

    world.add({
      isPlatform: true,
      position: new THREE.Vector3(x, y, 0),
      platformData: { length, slope, width: 8 },
    });

    // Entities on platform
    if (length > 15 && Math.abs(slope) < 0.1) {
      const rand = Math.random();
      if (rand > 0.7) {
        const ex = x + 5 + Math.random() * (length - 10);
        world.add({
          isEnemy: true,
          position: new THREE.Vector3(ex, y, 0),
          velocity: new THREE.Vector3(0, 0, 0),
          characterState: Math.random() > 0.5 ? 'stand' : 'block',
          faction: 'Azure', // Keep faction for now
          modelColor: pickEnemyColor(),
        });
      } else if (rand > 0.4) {
        const ox = x + 5 + Math.random() * (length - 10);
        world.add({
          isObstacle: true,
          position: new THREE.Vector3(ox, y, 0),
          obstacleType: Math.random() > 0.5 ? 'low' : 'high',
        });
      }
    }

    // Update next spawn
    genStateRef.current.nextX += length * Math.cos(angle);
    genStateRef.current.nextY += length * Math.sin(angle);
  };

  return (
    <>
      {/* Run systems */}
      <MovementSystem />
      <PhysicsSystem />
      <InputSystem inputState={inputState} />
      <CombatSystem onGameOver={onGameOver} onScoreUpdate={onScoreUpdate} />

      {/* Render Entities */}
      <ECS.Entities in={world.with('isPlayer', 'position', 'characterState')}>
        {(entity) => (
          <Character
            position={[entity.position.x, entity.position.y, entity.position.z]}
            state={entity.characterState}
            color={entity.modelColor || 0xff0000}
            isPlayer
          />
        )}
      </ECS.Entities>

      <ECS.Entities in={world.with('isEnemy', 'position', 'characterState')}>
        {(entity) => (
          <Enemy
            position={[entity.position.x, entity.position.y, entity.position.z]}
            enemyType={entity.characterState === 'block' ? 'block' : 'stand'}
            color={entity.modelColor}
          />
        )}
      </ECS.Entities>

      <ECS.Entities in={world.with('isObstacle', 'position', 'obstacleType')}>
        {(entity) => (
          <Obstacle
            position={[entity.position.x, entity.position.y, entity.position.z]}
            type={entity.obstacleType || 'low'}
          />
        )}
      </ECS.Entities>

      <ECS.Entities in={world.with('isPlatform', 'position', 'platformData')}>
        {(entity) => (
          <Platform
            x={entity.position.x}
            y={entity.position.y}
            length={entity.platformData.length}
            slope={entity.platformData.slope}
          />
        )}
      </ECS.Entities>

      {/* Ground Plane (for shadows) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </>
  );
}
