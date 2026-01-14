import { ContactShadows, Environment, OrbitControls, Text3D } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { FC } from 'react';

export const WelcomeScene: FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      style={{ width: '100%', height: '100vh' }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ffff" />
      <pointLight position={[10, -10, -5]} intensity={0.5} color="#ff00ff" />

      {/* 3D Text */}
      <Text3D
        font="/fonts/helvetiker_regular.typeface.json"
        size={0.8}
        height={0.2}
        position={[-2.5, 1, 0]}
      >
        Neo-Tokyo
        <meshStandardMaterial color="#00ffff" metalness={0.8} roughness={0.2} />
      </Text3D>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Floating Cube */}
      <RotatingCube />

      {/* Environment and Controls */}
      <Environment preset="night" />
      <ContactShadows position={[0, -0.99, 0]} opacity={0.5} scale={10} blur={2} far={4} />
      <OrbitControls makeDefault />
    </Canvas>
  );
};

/**
 * Renders a magenta, shadow-casting cube positioned slightly above the ground.
 *
 * @returns A JSX element containing a box mesh with standard material configured for metalness and roughness
 */
function RotatingCube() {
  return (
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff00ff" metalness={0.7} roughness={0.3} />
    </mesh>
  );
}
