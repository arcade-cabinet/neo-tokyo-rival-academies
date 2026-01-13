import type { GameState, InputState } from '@/types/game';
import { Character } from '@components/react/objects/Character';
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
}

interface PlatformData {
  id: string;
  x: number;
  y: number;
  length: number;
  slope: number;
}

export function GameWorld({ gameState, inputState, onGameOver, onScoreUpdate }: GameWorldProps) {
  const { camera } = useThree();
  const [heroPos, setHeroPos] = useState(new THREE.Vector3(0, 5, 0));
  const [heroVel, setHeroVel] = useState(new THREE.Vector3(0, 0, 0));
  const [heroState, setHeroState] = useState<'run' | 'sprint' | 'jump' | 'slide' | 'stun'>('run');
  const [grounded, setGrounded] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
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

    // Cleanup old platforms
    setPlatforms((prev) => prev.filter((p) => p.x + p.length > newPos.x - 50));
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

      {/* Ground Plane (for shadows) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}
