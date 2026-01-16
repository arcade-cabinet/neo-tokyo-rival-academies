import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';

interface ObstacleProps {
  type: 'low' | 'high';
  position: [number, number, number];
}

/**
 * Render a pulsing obstacle mesh positioned in 3D space.
 *
 * The rendered mesh is a box whose vertical size and vertical offset depend on `type`,
 * and which has a subtle pulsing scale animation and a small point light for glow.
 *
 * @param type - 'low' for a shorter obstacle (height 1, y offset 0.5) or 'high' for a taller obstacle (height 3, y offset 1.5)
 * @param position - Base `[x, y, z]` position; the component applies the type-specific vertical offset to `y`
 * @returns A React element containing the obstacle mesh (box geometry, emissive material, and a child point light)
 */
export function Obstacle({ type, position }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const height = type === 'low' ? 1 : 3;
  const yOffset = type === 'low' ? 0.5 : 1.5;

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + yOffset, position[2]]} castShadow>
      <boxGeometry args={[1, height, 4]} />
      <meshStandardMaterial
        color={0xffff00}
        emissive={0xffff00}
        emissiveIntensity={0.2}
        roughness={0.3}
        metalness={0.7}
      />
      {/* Glow effect */}
      <pointLight position={[0, 0, 0]} color={0xffff00} intensity={0.5} distance={5} />
    </mesh>
  );
}
