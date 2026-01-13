import type { Entity, GameState, InputState } from '@/types/game';
import { Character } from '@components/react/objects/Character';
import { Enemy } from '@components/react/objects/Enemy';
import { Obstacle } from '@components/react/objects/Obstacle';
import { Platform } from '@components/react/objects/Platform';
import { useFrame, useThree } from '@react-three/fiber';
import { CONFIG } from '@utils/gameConfig';
import { useRef, useState } from 'react';
import * as THREE from 'three';

interface GameWorldProps {
  gameState: GameState;
  inputState: InputState;
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onCombatText?: (message: string, color: string) => void;
}

interface PlatformData {
  id: string;
  x: number;
  y: number;
  length: number;
  slope: number;
}

/**
 * Renders and manages the in-game world: player character, procedural platforms, enemies, obstacles, physics, camera following, scoring, and combat interactions.
 *
 * @param gameState - Current game lifecycle and activity flags used to start/stop the simulation
 * @param inputState - Player input state (run, jump, slide) that drives movement and actions
 * @param onGameOver - Callback invoked when the player falls out of the world or the game ends
 * @param onScoreUpdate - Callback invoked with the player's horizontal score as it advances
 * @param onCombatText - Optional callback for displaying combat messages with a color (message, color)
 * @returns A React element group that composes the game scene (hero, platforms, entities, and ground)
 */
export function GameWorld({
  gameState,
  inputState,
  onGameOver,
  onScoreUpdate,
  onCombatText,
}: GameWorldProps) {
  const { camera } = useThree();
  const [heroPos, setHeroPos] = useState(new THREE.Vector3(0, 5, 0));
  const [heroVel, setHeroVel] = useState(new THREE.Vector3(0, 0, 0));
  const [heroState, setHeroState] = useState<'run' | 'sprint' | 'jump' | 'slide' | 'stun'>('run');
  const [grounded, setGrounded] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [stunTimer, setStunTimer] = useState(0);

  // Generation state
  const genStateRef = useRef({
    nextX: -10,
    nextY: 0,
  });

  // Initialize world
  useFrame((_state, delta) => {
    if (!gameState.active) return;

    const dt = Math.min(delta, 0.1);

    // Update stun timer
    if (stunTimer > 0) {
      setStunTimer((prev) => Math.max(0, prev - dt));
      const newVel = heroVel.clone();
      newVel.x += (0 - newVel.x) * CONFIG.knockbackDrag * dt;
      setHeroVel(newVel);
    } else {
      // Normal controls
      const targetSpeed = inputState.run ? CONFIG.sprintSpeed : CONFIG.baseSpeed;
      const newVel = heroVel.clone();
      newVel.x += (targetSpeed - newVel.x) * 5 * dt;

      if (grounded) {
        const newState = inputState.slide ? 'slide' : inputState.run ? 'sprint' : 'run';
        setHeroState(newState);

        if (inputState.jump) {
          newVel.y = CONFIG.jumpForce;
          setGrounded(false);
          setHeroState('jump');
        }
      } else {
        setHeroState('jump');
      }

      setHeroVel(newVel);
    }

    // Apply physics
    const newVel = heroVel.clone();
    newVel.y += CONFIG.gravity * dt;

    const newPos = heroPos.clone();
    newPos.x += newVel.x * dt;
    newPos.y += newVel.y * dt;

    // Simple ground check (will be enhanced with raycasting)
    if (newPos.y <= 0 && newVel.y <= 0) {
      newPos.y = 0;
      newVel.y = 0;
      setGrounded(true);
    } else {
      setGrounded(false);
    }

    setHeroPos(newPos);
    setHeroVel(newVel);

    // Update camera
    camera.position.x = newPos.x - 6;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, newPos.y + 4, 2 * dt);
    camera.lookAt(newPos.x, newPos.y + 2, 0);

    // Update score
    onScoreUpdate(Math.floor(newPos.x));

    // Game over check
    if (newPos.y < -20) {
      onGameOver();
    }

    // Generate world ahead
    if (genStateRef.current.nextX < newPos.x + 80) {
      generatePlatform();
    }

    // Check combat interactions
    entities.forEach((entity) => {
      if (!entity.active) return;

      const dx = entity.x - newPos.x;
      const dy = Math.abs(newPos.y - entity.y);

      // Collision check
      if (dx < 1.5 && dx > -1.0 && dy < 2) {
        if (entity.type === 'obstacle') {
          // Hit obstacle
          if (onCombatText) onCombatText('IMPACT!', '#ff0');
          setHeroVel(new THREE.Vector3(-15, 10, 0));
          setHeroState('stun');
          setStunTimer(0.5);
          setEntities((prev) =>
            prev.map((e) => (e.id === entity.id ? { ...e, active: false } : e))
          );
        } else if (entity.type === 'enemy') {
          // Combat check: Sprint or Slide beats enemy
          const win = heroState === 'sprint' || heroState === 'slide';
          if (win) {
            if (onCombatText) onCombatText('K.O.', '#0f0');
            setEntities((prev) =>
              prev.map((e) => (e.id === entity.id ? { ...e, active: false } : e))
            );
          } else {
            if (onCombatText) onCombatText('COUNTERED!', '#f00');
            setHeroVel(new THREE.Vector3(-25, 15, 0));
            setHeroState('stun');
            setStunTimer(0.8);
            setEntities((prev) =>
              prev.map((e) => (e.id === entity.id ? { ...e, active: false } : e))
            );
          }
        }
      }
    });

    // Cleanup old platforms and entities
    setPlatforms((prev) => prev.filter((p) => p.x + p.length > newPos.x - 50));
    setEntities((prev) => prev.filter((e) => e.x > newPos.x - 50));
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
      // FLAT
      slope = 0;
    } else if (type < 0.8) {
      // UP
      slope = 1;
      length = 15 + Math.random() * 10;
    } else {
      // DOWN
      slope = -1;
      length = 15 + Math.random() * 10;
    }

    const newPlatform: PlatformData = {
      id: `platform-${Date.now()}-${Math.random()}`,
      x: genStateRef.current.nextX,
      y: genStateRef.current.nextY,
      length,
      slope,
    };

    setPlatforms((prev) => [...prev, newPlatform]);

    // Spawn entities on flat platforms
    if (length > 15 && Math.abs(slope) < 0.1) {
      if (Math.random() > 0.6) {
        // Spawn enemy
        const ex = genStateRef.current.nextX + 5 + Math.random() * (length - 10);
        const enemyType = Math.random() > 0.5 ? 'stand' : 'block';
        setEntities((prev) => [
          ...prev,
          {
            id: `enemy-${Date.now()}-${Math.random()}`,
            type: 'enemy',
            x: ex,
            y: genStateRef.current.nextY,
            active: true,
            enemyType,
          },
        ]);
      } else if (Math.random() > 0.5) {
        // Spawn obstacle
        const ox = genStateRef.current.nextX + 5 + Math.random() * (length - 10);
        const obstacleType = Math.random() > 0.5 ? 'low' : 'high';
        setEntities((prev) => [
          ...prev,
          {
            id: `obstacle-${Date.now()}-${Math.random()}`,
            type: 'obstacle',
            x: ox,
            y: genStateRef.current.nextY,
            active: true,
            obstacleType,
          },
        ]);
      }
    }

    // Update generation state
    const angle = slope * 0.26;
    genStateRef.current.nextX += length * Math.cos(angle);
    genStateRef.current.nextY += length * Math.sin(angle);
  };

  // Initial platforms
  if (platforms.length === 0 && gameState.active) {
    setPlatforms([
      {
        id: 'start-platform',
        x: -10,
        y: 0,
        length: 40,
        slope: 0,
      },
    ]);
    genStateRef.current.nextX = 30;
  }

  return (
    <group>
      {/* Hero Character */}
      <Character
        color={0xff0000}
        isPlayer
        position={[heroPos.x, heroPos.y, heroPos.z]}
        state={heroState}
      />

      {/* Platforms */}
      {platforms.map((platform) => (
        <Platform
          key={platform.id}
          x={platform.x}
          y={platform.y}
          length={platform.length}
          slope={platform.slope}
        />
      ))}

      {/* Entities - Enemies and Obstacles */}
      {entities.map((entity) => {
        if (!entity.active) return null;

        if (entity.type === 'enemy' && entity.enemyType) {
          return (
            <Enemy
              key={entity.id}
              position={[entity.x, entity.y, 0]}
              enemyType={entity.enemyType}
            />
          );
        }

        if (entity.type === 'obstacle' && entity.obstacleType) {
          return (
            <Obstacle
              key={entity.id}
              type={entity.obstacleType}
              position={[entity.x, entity.y, 0]}
            />
          );
        }

        return null;
      })}

      {/* Ground Plane (for shadows) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}