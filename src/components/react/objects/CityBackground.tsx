import { useFrame } from '@react-three/fiber';
import { building } from '@utils/procedural/AssetGen';
import { useRef } from 'react';
import type * as THREE from 'three';

/**
 * Render a procedurally generated city skyline used as a background.
 *
 * The component creates 20 building groups with randomized position, size, color, and window textures. Each building includes a textured body, a top glow with a point light, and an antenna. The root group's x position is tied to the camera to produce a parallax effect.
 *
 * @returns A React group containing the generated building groups; the group's x position is driven by the camera to create parallax.
 */
export function CityBackground() {
  const buildingsRef = useRef<THREE.Group>(null);

  // Create building materials
  const cyanBuildingTexture = building(190); // Cyan windows
  const magentaBuildingTexture = building(320); // Magenta windows

  useFrame((state) => {
    if (buildingsRef.current) {
      // Parallax effect - buildings move slower than camera
      buildingsRef.current.position.x = state.camera.position.x * 0.3;
    }
  });

  const buildings = [];
  for (let i = 0; i < 20; i++) {
    const x = (i - 10) * 30 + (Math.random() - 0.5) * 10;
    const z = -50 - Math.random() * 100;
    const height = 20 + Math.random() * 60;
    const width = 8 + Math.random() * 12;
    const depth = 8 + Math.random() * 12;
    const texture = Math.random() > 0.5 ? cyanBuildingTexture : magentaBuildingTexture;
    const color = Math.random() > 0.5 ? 0x00ffff : 0xff00ff;

    buildings.push(
      <group key={i} position={[x, height / 2, z]}>
        {/* Building body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial map={texture} roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Top glow */}
        <mesh position={[0, height / 2 + 0.5, 0]}>
          <boxGeometry args={[width * 1.1, 1, depth * 1.1]} />
          <meshBasicMaterial color={color} />
          <pointLight position={[0, 2, 0]} color={color} intensity={2} distance={30} />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, height / 2 + 5, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 10, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    );
  }

  return <group ref={buildingsRef}>{buildings}</group>;
}
