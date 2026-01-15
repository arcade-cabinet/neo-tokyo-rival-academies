import { Canvas } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { Suspense } from 'react';
import { Leva, useControls } from 'leva';

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

            {/* Character (Placeholder) */}
            <RigidBody position={[0, 2, 0]} enabledRotations={[false, true, false]}>
              <mesh castShadow>
                <capsuleGeometry args={[0.5, 1.8]} />
                <meshStandardMaterial color="cyan" />
              </mesh>
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
