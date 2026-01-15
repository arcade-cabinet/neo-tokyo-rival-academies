import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Text, useTexture } from '@react-three/drei';
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier';
import { Suspense, useRef } from 'react';
import { Leva, useControls } from 'leva';
import * as THREE from 'three';

function ParallaxLayer({ z, speed, color }: { z: number, speed: number, color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock, camera }) => {
    if (ref.current) {
        // Simple parallax: move opposite to camera/player
        // For now just drift
        ref.current.position.x = Math.sin(clock.getElapsedTime() * speed) * 2;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, z]}>
      <planeGeometry args={[40, 20]} />
      <meshStandardMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

export default function SideScrollScene() {
  const { fov, camPos } = useControls('Camera', {
    fov: { value: 45, min: 10, max: 90 },
    camPos: { value: [0, 5, 20] }
  });

  return (
    <>
      <Leva />
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={camPos} fov={fov} />
          
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

          <Physics gravity={[0, -15, 0]}>
            {/* Ground */}
            <RigidBody type="fixed" position={[0, -2, 0]}>
              <mesh receiveShadow>
                <boxGeometry args={[50, 2, 5]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </RigidBody>

            {/* Platforms */}
            <RigidBody type="fixed" position={[-5, 2, 0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[4, 0.5, 4]} />
                <meshStandardMaterial color="#ff00ff" emissive="#440044" />
              </mesh>
            </RigidBody>

             <RigidBody type="fixed" position={[6, 5, 0]}>
              <mesh receiveShadow castShadow>
                <boxGeometry args={[4, 0.5, 4]} />
                <meshStandardMaterial color="#00ffff" emissive="#004444" />
              </mesh>
            </RigidBody>

            {/* Character (Physics) */}
            <RigidBody position={[0, 5, 0]} enabledRotations={[false, false, false]} friction={0}>
              <mesh castShadow>
                <capsuleGeometry args={[0.5, 1.8]} />
                <meshStandardMaterial color="orange" />
              </mesh>
            </RigidBody>
          </Physics>

          {/* Background Layers */}
          <ParallaxLayer z={-10} speed={0.1} color="#1a1a2e" />
          <ParallaxLayer z={-20} speed={0.05} color="#0f0f1a" />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </>
  );
}
