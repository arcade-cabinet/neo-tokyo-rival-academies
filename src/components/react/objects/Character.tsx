import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { CharacterState } from '@/types/game';

interface CharacterProps {
  color: THREE.ColorRepresentation;
  isPlayer?: boolean;
  position?: [number, number, number];
  state?: CharacterState;
}

/**
 * Renders a stylized humanoid character as a Three.js group with animated coat segments and pose-driven limb motion.
 *
 * @param color - Hex color used for the character's hair
 * @param position - Root group position as [x, y, z]
 * @param state - Animation/pose state: 'run', 'sprint', 'jump', 'slide', or 'stun'
 * @returns The top-level group containing the character's meshes and runtime animation logic
 */
interface CharacterPropsWithSpeed extends CharacterProps {
  speed?: number;
  isPlayer?: boolean;
}

export function Character({
  color,
  position = [0, 0, 0],
  state = 'run',
  speed = 15,
  isPlayer = false,
}: CharacterPropsWithSpeed) {
  const pivotRef = useRef<THREE.Group>(null);
  const coatSeg1Ref = useRef<THREE.Group>(null);
  const coatSeg2Ref = useRef<THREE.Group>(null);
  const coatSeg3Ref = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);

  const limbsRef = useRef({
    armL: armLRef,
    armR: armRRef,
    legL: legLRef,
    legR: legRRef,
  });

  useFrame((frameState, delta) => {
    if (!pivotRef.current) return;

    const t = frameState.clock.elapsedTime;
    // speed is now passed in props
    const run = t * speed * 1.5;

    // Coat Physics - Simulate billowing based on speed
    const angle = Math.min(Math.max(speed * 0.05, 0.2), 1.5);
    if (coatSeg1Ref.current) {
      coatSeg1Ref.current.rotation.x = THREE.MathUtils.lerp(
        coatSeg1Ref.current.rotation.x,
        angle + Math.sin(t * 10) * 0.1,
        delta * 5
      );
    }
    if (coatSeg2Ref.current) {
      coatSeg2Ref.current.rotation.x = THREE.MathUtils.lerp(
        coatSeg2Ref.current.rotation.x,
        0.3 + Math.sin(t * 10 - 1) * 0.2,
        delta * 5
      );
    }
    if (coatSeg3Ref.current) {
      coatSeg3Ref.current.rotation.x = THREE.MathUtils.lerp(
        coatSeg3Ref.current.rotation.x,
        0.2 + Math.sin(t * 10 - 2) * 0.2,
        delta * 5
      );
    }

    // Animation based on state
    if (state === 'stand') {
      pivotRef.current.rotation.x = 0;
      pivotRef.current.position.y = 0;

      // Reset rotations
      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = 0;
      if (limbsRef.current.legR.current) limbsRef.current.legR.current.rotation.x = 0;
      if (limbsRef.current.armL.current) limbsRef.current.armL.current.rotation.x = 0;
      if (limbsRef.current.armR.current) limbsRef.current.armR.current.rotation.x = 0;

      // Subtle breathing
      const breath = Math.sin(t * 2) * 0.02;
      pivotRef.current.scale.y = 1 + breath;
      pivotRef.current.position.y = breath * 0.2;
    } else if (state === 'block') {
      pivotRef.current.rotation.x = 0;
      pivotRef.current.position.y = 0;
      pivotRef.current.scale.y = 1;

      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = 0.2;
      if (limbsRef.current.legR.current) limbsRef.current.legR.current.rotation.x = -0.2;

      // Guard up
      if (limbsRef.current.armL.current) {
        limbsRef.current.armL.current.rotation.x = -2;
        limbsRef.current.armL.current.rotation.z = -0.5;
      }
      if (limbsRef.current.armR.current) {
        limbsRef.current.armR.current.rotation.x = -2;
        limbsRef.current.armR.current.rotation.z = 0.5;
      }
    } else if (state === 'run' || state === 'sprint') {
      pivotRef.current.rotation.x = 0.2;
      pivotRef.current.position.y = 0;
      pivotRef.current.scale.y = 1;

      // Reset Z rotation from block
      if (limbsRef.current.armL.current) limbsRef.current.armL.current.rotation.z = 0;
      if (limbsRef.current.armR.current) limbsRef.current.armR.current.rotation.z = 0;

      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = Math.sin(run);
      if (limbsRef.current.legR.current)
        limbsRef.current.legR.current.rotation.x = Math.sin(run + Math.PI);
      if (limbsRef.current.armL.current)
        limbsRef.current.armL.current.rotation.x = Math.sin(run + Math.PI);
      if (limbsRef.current.armR.current) limbsRef.current.armR.current.rotation.x = Math.sin(run);
    } else if (state === 'jump') {
      pivotRef.current.rotation.x = 0;
      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = 0.5;
      if (limbsRef.current.legR.current) limbsRef.current.legR.current.rotation.x = -0.2;
      if (limbsRef.current.armL.current) limbsRef.current.armL.current.rotation.x = -2.5;
      if (limbsRef.current.armR.current) limbsRef.current.armR.current.rotation.x = -2;
    } else if (state === 'slide') {
      pivotRef.current.rotation.x = -1.3;
      pivotRef.current.position.y = -0.5;
      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = 1.5;
      if (limbsRef.current.legR.current) limbsRef.current.legR.current.rotation.x = 1.3;
      if (limbsRef.current.armL.current) limbsRef.current.armL.current.rotation.x = 0.5;
      if (limbsRef.current.armR.current) limbsRef.current.armR.current.rotation.x = 0.5;
    } else if (state === 'stun') {
      pivotRef.current.rotation.x = -0.5;
      if (limbsRef.current.armL.current) limbsRef.current.armL.current.rotation.x = -1;
      if (coatSeg1Ref.current) coatSeg1Ref.current.rotation.x = -2;
    } else if (state === 'attack') {
      pivotRef.current.rotation.x = 0.2;
      // Rapid strikes
      if (limbsRef.current.armR.current) {
        limbsRef.current.armR.current.rotation.x = -Math.PI / 2 + Math.sin(t * 30) * 1.0;
        limbsRef.current.armR.current.rotation.z = 0.5;
      }
      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = 0.5;
      if (limbsRef.current.legR.current) limbsRef.current.legR.current.rotation.x = -0.5;
    }
  });

  const Limb = ({
    x,
    y,
    w,
    h,
    limbRef,
    hasWeapon,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    limbRef: React.RefObject<THREE.Group | null>;
    hasWeapon?: boolean;
  }) => (
    <group position={[x, y, 0]} ref={limbRef}>
      <mesh position={[0, -h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, w]} />
        <meshToonMaterial color={0x111111} />
      </mesh>
      {hasWeapon && isPlayer && (
        // THE REDLINE PISTON (Hammer)
        <group position={[0, -h, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshToonMaterial color="#333" />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.8]} />
            <meshToonMaterial color="#a00" />
          </mesh>
          {/* Engine block detail */}
          <mesh position={[0, 1.2, 0.45]}>
            <boxGeometry args={[0.6, 0.4, 0.2]} />
            <meshToonMaterial color="#gold" />
          </mesh>
        </group>
      )}
      {hasWeapon && !isPlayer && (
        // THE NULL SET (Lance)
        <group position={[0, -h, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.05, 0.1, 2.5, 8]} />
            <meshToonMaterial color="#0ff" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshToonMaterial color="#fff" wireframe />
          </mesh>
        </group>
      )}
    </group>
  );

  return (
    <group position={position}>
      <group ref={pivotRef}>
        {/* Torso */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.3]} />
          <meshToonMaterial color={0x111111} />
        </mesh>

        {/* Coat Segments - Hierarchical for physics */}
        <group ref={coatSeg1Ref} position={[0, 0.5, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.52, 0.5, 0.32]} />
            <meshToonMaterial color={isPlayer ? 0xaa0000 : 0x0000aa} />
          </mesh>

          <group ref={coatSeg2Ref} position={[0, -0.45, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.52, 0.5, 0.32]} />
              <meshToonMaterial color={isPlayer ? 0x880000 : 0x000088} />
            </mesh>

            <group ref={coatSeg3Ref} position={[0, -0.45, 0]}>
              <mesh position={[0, -0.25, 0]} castShadow>
                <boxGeometry args={[0.52, 0.5, 0.32]} />
                <meshToonMaterial color={isPlayer ? 0x660000 : 0x000066} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Head */}
        <group position={[0, 1.3, 0]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshToonMaterial color={0xffccaa} />
          </mesh>
          {/* Pompadour Hair or Bob Cut */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshToonMaterial color={color} />
          </mesh>
        </group>

        {/* Limbs */}
        <Limb x={0.35} y={1.1} w={0.12} h={0.6} limbRef={limbsRef.current.armR} hasWeapon={true} />
        <Limb x={-0.35} y={1.1} w={0.12} h={0.6} limbRef={limbsRef.current.armL} />
        <Limb x={0.15} y={0.5} w={0.18} h={0.7} limbRef={limbsRef.current.legR} />
        <Limb x={-0.15} y={0.5} w={0.18} h={0.7} limbRef={limbsRef.current.legL} />
      </group>
    </group>
  );
}
