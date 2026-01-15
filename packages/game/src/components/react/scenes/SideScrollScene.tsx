import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, useGLTF, useAnimations, useTexture } from '@react-three/drei';
import { Physics, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { Suspense, useRef, useEffect, useState } from 'react';
import { Leva, useControls } from 'leva';
import type { Group, Mesh } from 'three';
import * as THREE from 'three';

function useKeyboard() {
  const [keys, setKeys] = useState({ left: false, right: false, jump: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, left: true }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, right: true }));
      if (key === ' ' || key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, jump: true }));
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') setKeys(k => ({ ...k, left: false }));
      if (key === 'd' || key === 'arrowright') setKeys(k => ({ ...k, right: false }));
      if (key === ' ' || key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, jump: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  return keys;
}

function ParallaxLayer({ z, texture, playerX }: { z: number, texture: THREE.Texture, playerX: React.MutableRefObject<number> }) {
  const ref = useRef<Mesh>(null);
  const parallaxFactor = Math.abs(z) / 50;

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = -playerX.current * parallaxFactor;
    }
  });

  return (
    <mesh ref={ref} position={[0, 5, z]}>
      <planeGeometry args={[60, 30]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

function KaiCharacter({ playerX }: { playerX: React.MutableRefObject<number> }) {
  const group = useRef<Group>(null);
  const rigidBody = useRef<RapierRigidBody>(null);
  const { scene } = useGLTF('/assets/characters/main/kai/rigged.glb');
  const idleAnim = useGLTF('/assets/characters/main/kai/animations/idle_combat.glb');
  const runAnim = useGLTF('/assets/characters/main/kai/animations/run_in_place.glb');
  const jumpAnim = useGLTF('/assets/characters/main/kai/animations/jump_idle.glb');
  const { actions } = useAnimations([...idleAnim.animations, ...runAnim.animations, ...jumpAnim.animations], group);
  const keys = useKeyboard();
  const [currentAnim, setCurrentAnim] = useState('idle');
  const canJump = useRef(true);

  const speed = 8;
  const jumpForce = 12;

  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actions[actionNames[0]]) actions[actionNames[0]].reset().fadeIn(0.5).play();
  }, [actions]);

  useFrame(() => {
    if (!rigidBody.current || !group.current) return;

    const vel = rigidBody.current.linvel();
    let vx = 0;

    if (keys.left) vx = -speed;
    if (keys.right) vx = speed;

    const grounded = Math.abs(vel.y) < 0.1;

    if (keys.jump && grounded && canJump.current) {
      rigidBody.current.setLinvel({ x: vx, y: jumpForce, z: 0 }, true);
      canJump.current = false;
      setTimeout(() => { canJump.current = true; }, 300);
    } else {
      rigidBody.current.setLinvel({ x: vx, y: vel.y, z: 0 }, true);
    }

    playerX.current = rigidBody.current.translation().x;

    if (vx > 0) group.current.rotation.y = Math.PI / 2;
    if (vx < 0) group.current.rotation.y = -Math.PI / 2;

    const actionNames = Object.keys(actions);
    let newAnim = 'idle';
    if (!grounded) newAnim = 'jump';
    else if (vx !== 0) newAnim = 'run';

    if (newAnim !== currentAnim) {
      const idx = newAnim === 'idle' ? 0 : newAnim === 'run' ? 1 : 2;
      const prevIdx = currentAnim === 'idle' ? 0 : currentAnim === 'run' ? 1 : 2;
      actions[actionNames[prevIdx]]?.fadeOut(0.15);
      actions[actionNames[idx]]?.reset().fadeIn(0.15).play();
      setCurrentAnim(newAnim);
    }
  });

  return (
    <RigidBody ref={rigidBody} position={[0, 3, 0]} enabledRotations={[false, false, false]} lockRotations friction={0.5}>
      <group ref={group} rotation={[0, Math.PI / 2, 0]}>
        <primitive object={scene} scale={1} castShadow />
      </group>
    </RigidBody>
  );
}

function ParallaxBackgrounds({ playerX }: { playerX: React.MutableRefObject<number> }) {
  const farBg = useTexture('/assets/backgrounds/sector0/parallax_far/concept.png');
  const midBg = useTexture('/assets/backgrounds/sector0/parallax_mid/concept.png');
  const rooftopBg = useTexture('/assets/backgrounds/sector0/rooftop/concept.png');

  return (
    <>
      <ParallaxLayer z={-30} texture={farBg} playerX={playerX} />
      <ParallaxLayer z={-20} texture={midBg} playerX={playerX} />
      <ParallaxLayer z={-10} texture={rooftopBg} playerX={playerX} />
    </>
  );
}

function SceneContent({ playerX }: { playerX: React.MutableRefObject<number> }) {
  const { fov, camPos } = useControls('Camera', {
    fov: { value: 50, min: 10, max: 90 },
    camPos: { value: [0, 4, 18] }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={camPos} fov={fov} />

      <ambientLight intensity={0.5} />
      <spotLight position={[10, 15, 10]} angle={0.4} penumbra={1} intensity={1.5} castShadow />
      <pointLight position={[-8, 5, 5]} color="#ff00ff" intensity={3} distance={20} />
      <pointLight position={[8, 5, 5]} color="#00ffff" intensity={3} distance={20} />

      <Physics gravity={[0, -20, 0]}>
        {/* Ground */}
        <RigidBody type="fixed" position={[0, -1, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[60, 2, 5]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </RigidBody>

        {/* Platforms */}
        <RigidBody type="fixed" position={[-8, 2, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[5, 0.5, 4]} />
            <meshStandardMaterial color="#ff00ff" emissive="#440044" />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" position={[0, 4, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[4, 0.5, 4]} />
            <meshStandardMaterial color="#00ffff" emissive="#004444" />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" position={[8, 6, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[5, 0.5, 4]} />
            <meshStandardMaterial color="#ffff00" emissive="#444400" />
          </mesh>
        </RigidBody>

        <KaiCharacter playerX={playerX} />
      </Physics>

      <ParallaxBackgrounds playerX={playerX} />
      <Environment preset="night" />
    </>
  );
}

export default function SideScrollScene() {
  const playerX = useRef(0);

  return (
    <>
      <Leva />
      <Canvas shadows>
        <Suspense fallback={null}>
          <SceneContent playerX={playerX} />
        </Suspense>
      </Canvas>
    </>
  );
}

useGLTF.preload('/assets/characters/main/kai/rigged.glb');
useGLTF.preload('/assets/characters/main/kai/animations/idle_combat.glb');
useGLTF.preload('/assets/characters/main/kai/animations/run_in_place.glb');
useGLTF.preload('/assets/characters/main/kai/animations/jump_idle.glb');
useTexture.preload('/assets/backgrounds/sector0/parallax_far/concept.png');
useTexture.preload('/assets/backgrounds/sector0/parallax_mid/concept.png');
useTexture.preload('/assets/backgrounds/sector0/rooftop/concept.png');
