import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, useGLTF, useAnimations } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useRef, useEffect } from 'react';
import { Leva, useControls } from 'leva';
import type { Group, Mesh } from 'three';

function ParallaxLayer({ z, speed, color }: { z: number, speed: number, color: string }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
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

function KaiCharacter({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF('/assets/characters/main/kai/rigged.glb');
  const runAnim = useGLTF('/assets/characters/main/kai/animations/run_in_place.glb');
  const { actions } = useAnimations(runAnim.animations, group);

  useEffect(() => {
    const run = actions[Object.keys(actions)[0]];
    if (run) {
      run.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  return (
    <group ref={group} position={position} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} scale={1} castShadow />
    </group>
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

            {/* Kai - Actual Generated Model */}
            <RigidBody position={[0, 2, 0]} enabledRotations={[false, false, false]} friction={0}>
              <KaiCharacter />
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

useGLTF.preload('/assets/characters/main/kai/rigged.glb');
useGLTF.preload('/assets/characters/main/kai/animations/run_in_place.glb');
