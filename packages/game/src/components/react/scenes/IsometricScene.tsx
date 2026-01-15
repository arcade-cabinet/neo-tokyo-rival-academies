import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, useGLTF, useAnimations, useTexture } from '@react-three/drei';
import { Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { Suspense, useRef, useEffect, useState, useMemo } from 'react';
import { Leva, useControls } from 'leva';
import type { Group } from 'three';
import * as THREE from 'three';

function useKeyboard() {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: true }));
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, a: true }));
      if (key === 's' || key === 'arrowdown') setKeys(k => ({ ...k, s: true }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, d: true }));
      if (key === ' ') setKeys(k => ({ ...k, space: true }));
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: false }));
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, a: false }));
      if (key === 's' || key === 'arrowdown') setKeys(k => ({ ...k, s: false }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, d: false }));
      if (key === ' ') setKeys(k => ({ ...k, space: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  return keys;
}

function KaiCharacter() {
  const group = useRef<Group>(null);
  const rigidBody = useRef<RapierRigidBody>(null);
  const { scene } = useGLTF('/assets/characters/main/kai/rigged.glb');
  const idleAnim = useGLTF('/assets/characters/main/kai/animations/idle_combat.glb');
  const runAnim = useGLTF('/assets/characters/main/kai/animations/run_in_place.glb');
  const { actions } = useAnimations([...idleAnim.animations, ...runAnim.animations], group);
  const keys = useKeyboard();
  const [isMoving, setIsMoving] = useState(false);

  const speed = 5;

  useEffect(() => {
    const actionNames = Object.keys(actions);
    const idle = actions[actionNames[0]];
    if (idle) idle.reset().fadeIn(0.5).play();
  }, [actions]);

  useEffect(() => {
    const actionNames = Object.keys(actions);
    const moving = keys.w || keys.a || keys.s || keys.d;
    if (moving !== isMoving) {
      setIsMoving(moving);
      if (moving && actions[actionNames[1]]) {
        actions[actionNames[0]]?.fadeOut(0.2);
        actions[actionNames[1]]?.reset().fadeIn(0.2).play();
      } else if (actions[actionNames[0]]) {
        actions[actionNames[1]]?.fadeOut(0.2);
        actions[actionNames[0]]?.reset().fadeIn(0.2).play();
      }
    }
  }, [keys, isMoving, actions]);

  useFrame(() => {
    if (!rigidBody.current) return;
    const vel = { x: 0, y: 0, z: 0 };
    if (keys.w) vel.z -= speed;
    if (keys.s) vel.z += speed;
    if (keys.a) vel.x -= speed;
    if (keys.d) vel.x += speed;

    rigidBody.current.setLinvel({ x: vel.x, y: rigidBody.current.linvel().y, z: vel.z }, true);

    if (group.current && (vel.x !== 0 || vel.z !== 0)) {
      group.current.rotation.y = Math.atan2(vel.x, vel.z);
    }
  });

  return (
    <RigidBody ref={rigidBody} position={[0, 1, 0]} enabledRotations={[false, false, false]} lockRotations>
      <group ref={group}>
        <primitive object={scene} scale={1} castShadow />
      </group>
    </RigidBody>
  );
}

function DioramaFloor() {
  // Dark metallic rooftop floor - simple but effective
  return (
    <RigidBody type="fixed">
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[16, 16]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.3}
          metalness={0.8}
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Grid lines for visual interest */}
      <gridHelper args={[16, 16, '#333333', '#222222']} position={[0, 0.01, 0]} />
    </RigidBody>
  );
}

function CurvedBackdrop() {
  const farTex = useTexture('/assets/backgrounds/sector0/parallax_far/concept.png');
  const midTex = useTexture('/assets/backgrounds/sector0/parallax_mid/concept.png');
  const rooftopTex = useTexture('/assets/backgrounds/sector0/rooftop/concept.png');

  // Make textures tile horizontally
  [farTex, midTex, rooftopTex].forEach(tex => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(2, 1);
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  // Create curved cylinder geometry for backdrop - wraps 270 degrees around
  const createCurvedGeometry = (radius: number, height: number) => {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 64, 1, true, Math.PI * 0.25, Math.PI * 1.5);
    return geometry;
  };

  return (
    <group>
      {/* Far skyline - largest, furthest back */}
      <mesh geometry={createCurvedGeometry(25, 20)} position={[0, 8, 0]}>
        <meshBasicMaterial map={farTex} side={THREE.BackSide} transparent opacity={1} />
      </mesh>

      {/* Mid buildings - medium distance */}
      <mesh geometry={createCurvedGeometry(20, 16)} position={[0, 6, 0]}>
        <meshBasicMaterial map={midTex} side={THREE.BackSide} transparent opacity={0.95} />
      </mesh>

      {/* Rooftop/foreground elements - closest */}
      <mesh geometry={createCurvedGeometry(15, 12)} position={[0, 4, 0]}>
        <meshBasicMaterial map={rooftopTex} side={THREE.BackSide} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function SceneContent() {
  const { zoom, camX, camY, camZ } = useControls('Camera', {
    zoom: { value: 45, min: 10, max: 100 },
    camX: { value: 12, min: -30, max: 30 },
    camY: { value: 12, min: 0, max: 30 },
    camZ: { value: 12, min: -30, max: 30 }
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[camX, camY, camZ]} zoom={zoom} near={-100} far={200} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* Neon accent lights */}
      <pointLight position={[-6, 4, -6]} color="#ff00ff" intensity={3} distance={20} />
      <pointLight position={[6, 4, 6]} color="#00ffff" intensity={3} distance={20} />
      <pointLight position={[0, 2, -8]} color="#ff6600" intensity={2} distance={15} />

      {/* Curved parallax backdrop */}
      <CurvedBackdrop />

      {/* Physics world */}
      <Physics>
        <DioramaFloor />
        <KaiCharacter />
      </Physics>

      <OrbitControls
        enableRotate={false}
        enableZoom={true}
        enablePan={false}
        minZoom={20}
        maxZoom={80}
      />
    </>
  );
}

export default function IsometricScene() {
  return (
    <>
      <Leva collapsed />
      <Canvas shadows>
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 30, 60]} />
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </>
  );
}

useGLTF.preload('/assets/characters/main/kai/rigged.glb');
useGLTF.preload('/assets/characters/main/kai/animations/idle_combat.glb');
useGLTF.preload('/assets/characters/main/kai/animations/run_in_place.glb');
useTexture.preload('/assets/backgrounds/sector0/parallax_far/concept.png');
useTexture.preload('/assets/backgrounds/sector0/parallax_mid/concept.png');
useTexture.preload('/assets/backgrounds/sector0/rooftop/concept.png');
