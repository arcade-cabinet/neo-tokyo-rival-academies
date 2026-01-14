import { Character } from '@components/react/objects/Character';
import { Enemy } from '@components/react/objects/Enemy';
import { Obstacle } from '@components/react/objects/Obstacle';
import { Platform } from '@components/react/objects/Platform';
import { DataShard } from '@components/react/objects/DataShard';
import { Connector } from '@components/react/objects/Connector';
import { ParallaxBackground } from './ParallaxBackground';
import { SpaceshipBackground } from './SpaceshipBackground';
import { MallBackground } from './MallBackground';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ECS, world } from '@/state/ecs';
import { useGameStore } from '@/state/gameStore';
import { aiSystem } from '@/systems/AISystem';
import { CombatSystem } from '@/systems/CombatSystem';
import { InputSystem } from '@/systems/InputSystem';
import { PhysicsSystem } from '@/systems/PhysicsSystem';
import { stageSystem } from '@/systems/StageSystem';
import type { GameState, InputState } from '@/types/game';

interface GameWorldProps {
  gameState: GameState;
  inputState: InputState;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onCombatText?: (message: string, color: string) => void;
  onCameraShake?: () => void;
  onDialogue?: (speaker: string, text: string) => void;
}

const B_STORY_LOGS = [
    "LOG 001: The simulation boundaries are decaying...",
    "LOG 002: 'Midnight Exam' is a cover. They are harvesting our kinetic data.",
    "LOG 003: Subject 'Vera' shows unauthorized deviation. Is she the cause?",
    "LOG 004: GLITCH PROTOCOL ACTIVE. The world is trying to delete us.",
    "LOG 005: There is no Academy. Wake up."
];

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
  onCombatText,
  onDialogue,
}: GameWorldProps) {
  const { camera } = useThree();
  const { showDialogue, addItem, addXp } = useGameStore();
  const collectedLogs = useRef(0);
  const exitSequenceActive = useRef(false);
  const initialized = useRef(false);
  const bossSpawned = useRef(false);
  const hasAlienQueenSpawned = useRef(false);

  // Generation state
  // We track the bounds of generated content to allow backtracking
  const genStateRef = useRef({
    nextX: -10,
    nextY: 0,
    minX: -10, // Track backward generation limit if we wanted to go left
  });

  // Init World
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load initial stage
    stageSystem.loadStage('sector7_streets');

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

    // Spawn Rival (Ally)
    world.add({
      id: 'rival-ally',
      isAlly: true,
      position: new THREE.Vector3(-3, 5, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      characterState: 'run',
      faction: 'Azure',
      modelColor: 0x00ffff,
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

    // Start Quest
    useGameStore.getState().startQuest({
        id: 'sector7_patrol',
        title: 'Sector 7 Patrol',
        description: 'Patrol the streets and clear out 5 Yakuza members.',
        completed: false
    });

    return () => {
      world.clear();
      initialized.current = false;
    };
  }, []);

  // Main Loop for Camera & Procedural Gen
  useFrame((_state, delta) => {
    if (!gameState.active) return;

    // AI Update
    aiSystem.update();

    // Camera follow player (Side View)
    const player = world.with('isPlayer', 'position').first;
    if (player) {
      // Platformer Camera Logic (Damped Follow)
      // Isometric/Diorama feel: Higher Y, angled down.

      let targetX = player.position.x;
      let targetY = player.position.y + 8; // Higher up
      let targetZ = 30; // Further back
      let lookAtY = player.position.y + 2;

      // Exit Sequence Override
      if (exitSequenceActive.current) {
          // Camera stays fixed or pans to watch player walk away
          // Player walks into Z
          player.velocity.x = 0;
          player.velocity.y = 0;
          player.position.z -= 5 * delta; // Walk into background
          player.characterState = 'run';

          if (player.position.z < -20) {
              // Complete Stage
              exitSequenceActive.current = false;
              stageSystem.completeStage();

              // Reset Player Z for next stage
              player.position.z = 0;
          }
      } else {
          // Normal Camera Follow
          camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 3 * delta);
          camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 3 * delta);
          camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 3 * delta);

          camera.lookAt(camera.position.x, lookAtY, 0);
      }

      const score = Math.floor(player.position.x);
      onScoreUpdate(score);
      stageSystem.update(player.position.x);

      // Trigger Abduction Event (Hardcoded for demo at X > 50) - Only in Sector 7
      if (stageSystem.currentStageId === 'sector7_streets' && player.position.x > 50 && !bossSpawned.current && stageSystem.activeEvent !== 'ABDUCTION') {
           stageSystem.triggerEvent('ABDUCTION');
           onDialogue?.('Rival', "Kai! The gravity... it's glitching out!");
      }

      // Handle Abduction Physics
      if (stageSystem.activeEvent === 'ABDUCTION') {
          // Override Physics: Lift Player & Ally
          player.velocity.y = 10;
          player.velocity.x = 0;

          // Lift Ally too
          const ally = world.with('isAlly', 'position', 'velocity').first;
          if (ally && ally.velocity) {
              ally.velocity.y = 10;
              ally.velocity.x = 0;
          }

          // Camera Look Up
          camera.position.y += 10 * delta;
          camera.lookAt(player.position.x, player.position.y + 10, 0);

          // Transition to Space Stage if high enough
          if (player.position.y > 50) {
              console.log("Welcome to Space!");
              onDialogue?.('Rival', "This environment... it's corrupted data! We have to purge it!");
              stageSystem.loadStage('alien_ship');

              // Reset Player & Ally Position
              player.position.set(0, 5, 0);
              player.velocity.set(0, 0, 0);

              const ally = world.with('isAlly', 'position', 'velocity').first;
              if (ally && ally.velocity && ally.position) {
                  ally.position.set(-3, 5, 0);
                  ally.velocity.set(0, 0, 0);
              }

              // Spawn Platform for Alien Ship
              world.add({
                isPlatform: true,
                position: new THREE.Vector3(0, 0, 0),
                platformData: { length: 100, slope: 0, width: 20 },
                modelColor: 0x333333,
              });

              // Spawn Alien Queen
              hasAlienQueenSpawned.current = true;
              world.add({
                  id: 'alien-queen',
                  isEnemy: true,
                  isBoss: true,
                  position: new THREE.Vector3(20, 10, -5),
                  velocity: new THREE.Vector3(0, 0, 0),
                  characterState: 'stand',
                  faction: 'Azure', // Or specific Alien faction? Yuka treats as Enemy
                  modelColor: 0x00ff00, // Green
                  health: 500,
              });

              // Spawn Tentacles
              for(let i=0; i<4; i++) {
                  world.add({
                      id: `tentacle-${i}`,
                      isEnemy: true,
                      position: new THREE.Vector3(10 + i*5, 0, 5),
                      velocity: new THREE.Vector3(0, 0, 0),
                      characterState: 'attack',
                      faction: 'Azure',
                      modelColor: 0x00aa00,
                  });
              }

              // Reset Gen State
              genStateRef.current.nextX = 100; // Far away
          }
          return; // Skip normal platform generation/physics
      }

      // Check for Alien Queen Death -> Mall Drop
      if (stageSystem.currentStageId === 'alien_ship' && hasAlienQueenSpawned.current) {
         let bossCount = 0;
         for (const _b of world.with('isBoss')) { bossCount++; }

         if (bossCount === 0) {
             console.log("Alien Queen Defeated! Dropping to Mall...");
             onDialogue?.('Rival', "Gravity's back! Brace for impact!");
             stageSystem.loadStage('mall_drop');

             // Setup Mall
             player.position.set(0, 20, 0); // High up
             player.velocity.set(0, -5, 0);

             const ally = world.with('isAlly', 'position', 'velocity').first;
             if (ally && ally.velocity && ally.position) {
                  ally.position.set(-3, 20, 0);
                  ally.velocity.set(0, -5, 0);
             }

             // Clear old entities
             const toRemove: any[] = [];
             for (const e of world.with('isPlatform')) toRemove.push(e);
             for (const e of world.with('isEnemy')) toRemove.push(e);
             for (const e of toRemove) world.remove(e);

             // Spawn Mall Platforms
             world.add({
                isPlatform: true,
                position: new THREE.Vector3(0, 0, 0),
                platformData: { length: 50, slope: 0, width: 10 },
                modelColor: 0xff00ff, // Neon Pink
              });

              world.add({
                isPlatform: true,
                position: new THREE.Vector3(60, 10, 0),
                platformData: { length: 40, slope: 0, width: 10 },
                modelColor: 0x00ffff, // Neon Blue
              });

              // Spawn Mall Cops
              for(let i=0; i<3; i++) {
                  world.add({
                      id: `mall-cop-${i}`,
                      isEnemy: true,
                      position: new THREE.Vector3(20 + i*10, 0, 0),
                      velocity: new THREE.Vector3(0, 0, 0),
                      characterState: 'stand',
                      faction: 'Azure',
                      modelColor: 0x0000ff, // Blue Cop
                  });
              }

              genStateRef.current.nextX = 120;
         }
      }

      // Check stage END REACHED (Not complete yet, triggering connector)
      // If we walked far enough, spawn exit connector
      if (stageSystem.state === 'playing' && player.position.x > stageSystem.currentStage.length && !exitSequenceActive.current) {
          // Check if we already spawned exit?
          // Let's rely on stageSystem state transition.
          // Currently stageSystem sets 'complete' when x > length.
          // We want to intercept that.
          // Actually stageSystem.update sets 'complete'.
      }

      // Check stage completion
      if (stageSystem.state === 'complete') {
        if (!bossSpawned.current) {
          console.log('Spawning End/Boss Arena...');
          bossSpawned.current = true;

          const endX = genStateRef.current.nextX + 10;
          const endY = genStateRef.current.nextY;

          // If boss stage, spawn Boss. If street stage, spawn Connector.
          if (stageSystem.currentStageId === 'sector7_streets') {
              // Spawn Connector
              onDialogue?.('Rival', "There's the bridge to the Upper Plate! Let's go!");

              world.add({
                  isPlatform: true,
                  position: new THREE.Vector3(endX, endY, 0),
                  platformData: { length: 20, slope: 0, width: 10 },
                  modelColor: 0x222222
              });

              // We need a visual entity for the connector (not ECS physics, just visual)
              // But we can add a dummy ECS entity or just render it if we tracked it.
              // Let's add a "Connector" entity to ECS?
              // ECS entities render based on components.
              // We haven't added <Connector> to render loop yet.
              // Let's trigger the exit sequence logic here.
          } else {
             // Boss Spawn (Alien Ship / Mall)
             // ... (Existing Boss Logic)

            world.add({
                isPlatform: true,
                position: new THREE.Vector3(endX, endY, 0),
                platformData: { length: 60, slope: 0, width: 12 },
            });

            world.add({
                id: 'boss-vera',
                isEnemy: true,
                position: new THREE.Vector3(endX + 30, endY + 5, 0),
                velocity: new THREE.Vector3(0, 0, 0),
                characterState: 'stand',
                faction: 'Azure',
                modelColor: 0xffffff,
            });
          }
        }

        // Handle Exit Sequence Logic (If on connector)
        if (stageSystem.currentStageId === 'sector7_streets' && bossSpawned.current) {
             const endX = genStateRef.current.nextX + 20; // Approx connector center
             if (Math.abs(player.position.x - endX) < 5 && !exitSequenceActive.current) {
                 console.log("Entering Connector...");
                 exitSequenceActive.current = true;
             }
        }
      }

      // Game Over check
      if (player.position.y < -20) {
        onGameOver();
      }

      // Camera Shake Trigger (e.g., from external events)
      if (onCameraShake && Math.random() < 0.0005) {
        onCameraShake();
      }

      // Generate ahead based on Stage Type
      if (stageSystem.currentStage.platforms === 'procedural' && stageSystem.state !== 'complete') {
        // Generate forward
        if (genStateRef.current.nextX < player.position.x + 80) {
          generatePlatform();
        }
        // Ideally we would generate backward too if player goes left,
        // but for now we just keep the start platform.
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
          id: `enemy-${Math.random().toString(36).substr(2, 9)}`, // Ensure ID for Yuka
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
      } else if (rand > 0.35) {
          // Rare spawn for Data Shard (B-Story)
          const sx = x + 5 + Math.random() * (length - 10);
          world.add({
              isCollectible: true,
              position: new THREE.Vector3(sx, y + 2, 0),
              modelColor: 0x00ff00,
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
      <PhysicsSystem />
      <InputSystem inputState={inputState} />
      <CombatSystem
        onGameOver={onGameOver}
        onScoreUpdate={onScoreUpdate}
        onCameraShake={onCameraShake}
        onCombatText={(msg, color) => {
            if (msg === 'DATA ACQUIRED') {
                const logIndex = collectedLogs.current % B_STORY_LOGS.length;
                // UI Update
                showDialogue('SYSTEM', B_STORY_LOGS[logIndex]);
                addItem('data_shard', 'Data Shard');

                // Legacy support if needed
                onDialogue?.('SYSTEM', B_STORY_LOGS[logIndex]);
                collectedLogs.current++;
            } else if (msg === 'DESTROYED!' || msg === 'KO!') {
                addXp(100);
            }
            onCombatText?.(msg, color);
        }}
      />

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

      <ECS.Entities in={world.with('isCollectible', 'position')}>
          {(entity) => (
              <DataShard position={[entity.position.x, entity.position.y, entity.position.z]} />
          )}
      </ECS.Entities>

      {/* We need to render the connector if we spawned one.
          Currently we don't have an ECS component for 'isConnector'.
          Let's just conditionally render one at the end if bossSpawned for Sector 7.
      */}
      {bossSpawned.current && stageSystem.currentStageId === 'sector7_streets' && (
          <Connector position={[genStateRef.current.nextX + 20, genStateRef.current.nextY, 0]} type="bridge" />
      )}

      <ECS.Entities in={world.with('isAlly', 'position', 'characterState')}>
        {(entity) => (
          <Character
            position={[entity.position.x, entity.position.y, entity.position.z]}
            state={entity.characterState}
            color={entity.modelColor || 0x00ffff}
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {stageSystem.currentStageId === 'alien_ship' ? <SpaceshipBackground /> :
       stageSystem.currentStageId === 'mall_drop' ? <MallBackground /> :
       <ParallaxBackground />}
    </>
  );
}
