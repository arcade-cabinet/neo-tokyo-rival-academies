import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Environment, useGLTF, useAnimations } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useRef, useEffect } from 'react';
import { Leva, useControls } from 'leva';
import type { Group } from 'three';

function KaiCharacter({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const group = useRef<Group>(null);
  const { scene } = useGLTF('/assets/characters/main/kai/rigged.glb');
  const idleAnim = useGLTF('/assets/characters/main/kai/animations/idle_combat.glb');
  const { actions } = useAnimations(idleAnim.animations, group);

  useEffect(() => {
    const idle = actions[Object.keys(actions)[0]];
    if (idle) {
      idle.reset().fadeIn(0.5).play();
    }
  }, [actions]);

  return (
    <group ref={group} position={position}>
      <primitive object={scene} scale={1} castShadow />
    </group>
  );
}

export default function IsometricScene() {
  const { zoom, position } = useControls('Camera', {
    zoom: { value: 40, min: 10, max: 100 },
    position: { value: [20, 20, 20] }
  });

  return (
    <>
      <Leva />
      <Canvas shadows>
        <Suspense fallback={null}>
          <OrthographicCamera makeDefault position={position} zoom={zoom} near={-100} far={100} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 5]} intensity={1} castShadow />

          <Physics>
            {/* Floor */}
            <RigidBody type="fixed">
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#222" />
              </mesh>
            </RigidBody>

            {/* Kai - Actual Generated Model */}
            <RigidBody position={[0, 0, 0]} enabledRotations={[false, true, false]}>
              <KaiCharacter />
            </RigidBody>

            {/* Obstacles / Diorama Elements */}
            <RigidBody position={[5, 1, 5]} type="fixed">
               <mesh castShadow receiveShadow>
                 <boxGeometry args={[2, 2, 2]} />
                 <meshStandardMaterial color="magenta" />
               </mesh>
            </RigidBody>

          </Physics>

          <Environment preset="city" />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </>
  );
}

useGLTF.preload('/assets/characters/main/kai/rigged.glb');
useGLTF.preload('/assets/characters/main/kai/animations/idle_combat.glb');
