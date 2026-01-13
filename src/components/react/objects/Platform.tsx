import { asphalt } from '@utils/procedural/AssetGen';
import { useMemo } from 'react';
import * as THREE from 'three';

interface PlatformProps {
  x: number;
  y: number;
  length: number;
  slope: number; // 0=flat, 1=up, -1=down
}

export function Platform({ x, y, length, slope }: PlatformProps) {
  const { position, rotation } = useMemo(() => {
    const angle = slope * 0.26; // ~15 degrees
    const h = 10;

    // Calculate center position for rotated box
    const cx = x + (length / 2) * Math.cos(angle);
    const cy = y + (length / 2) * Math.sin(angle) - h / 2;

    return {
      position: [cx, cy, 0] as [number, number, number],
      rotation: [0, 0, angle] as [number, number, number],
    };
  }, [x, y, length, slope]);

  // Memoize textures (expensive to generate)
  const asphaltTexture = useMemo(() => asphalt(), []);

  return (
    <group>
      {/* Main platform body */}
      <mesh position={position} rotation={rotation} castShadow receiveShadow>
        <boxGeometry args={[length, 10, 8]} />
        <meshStandardMaterial color={0x111111} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Asphalt top surface */}
      <mesh
        position={[position[0], position[1] + 5.01, position[2]]}
        rotation={[rotation[0] - Math.PI / 2, rotation[1], rotation[2]]}
      >
        <planeGeometry args={[length, 8]} />
        <meshStandardMaterial map={asphaltTexture} roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Neon edge glow */}
      <mesh
        position={[position[0] - length / 2, position[1] + 2.5, position[2] - 4.1]}
        rotation={rotation}
      >
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshBasicMaterial color={0x00ffff} />
        <pointLight position={[0, 0, 0]} color={0x00ffff} intensity={0.5} distance={5} />
      </mesh>
      <mesh
        position={[position[0] - length / 2, position[1] + 2.5, position[2] + 4.1]}
        rotation={rotation}
      >
        <boxGeometry args={[0.1, 5, 0.1]} />
        <meshBasicMaterial color={0xff00ff} />
        <pointLight position={[0, 0, 0]} color={0xff00ff} intensity={0.5} distance={5} />
      </mesh>
    </group>
  );
}
