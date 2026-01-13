import type { CharacterState } from '@/types/game';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

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
export function Character({ color, position = [0, 0, 0], state = 'run' }: CharacterProps) {
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
    const speed = 15; // Will be controlled externally later
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
    if (state === 'run' || state === 'sprint') {
      pivotRef.current.rotation.x = 0.2;
      pivotRef.current.position.y = 0;

      if (limbsRef.current.legL.current) limbsRef.current.legL.current.rotation.x = Math.sin(run);
      if (limbsRef.current.legR.current) limbsRef.current.legR.current.rotation.x = Math.sin(run + Math.PI);
      if (limbsRef.current.armL.current) limbsRef.current.armL.current.rotation.x = Math.sin(run + Math.PI);
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
    }
  });

  const Limb = ({
    x,
    y,
    w,
    h,
    limbRef,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    limbRef: React.RefObject<THREE.Group>;
  }) => (
    <group position={[x, y, 0]} ref={limbRef}>
      <mesh position={[0, -h / 2, 0]} castShadow>
        <boxGeometry args={[w, h, w]} />
        <meshStandardMaterial color={0x111111} roughness={0.7} />
      </mesh>
    </group>
  );

  return (
    <group position={position}>
      <group ref={pivotRef}>
        {/* Torso */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.3]} />
          <meshStandardMaterial color={0x111111} roughness={0.7} />
        </mesh>

        {/* Coat Segments - Hierarchical for physics */}
        <group ref={coatSeg1Ref} position={[0, 0.5, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.52, 0.5, 0.32]} />
            <meshStandardMaterial color={0x111111} roughness={0.7} />
          </mesh>

          <group ref={coatSeg2Ref} position={[0, -0.45, 0]}>
            <mesh position={[0, -0.25, 0]} castShadow>
              <boxGeometry args={[0.52, 0.5, 0.32]} />
              <meshStandardMaterial color={0x111111} roughness={0.7} />
            </mesh>

            <group ref={coatSeg3Ref} position={[0, -0.45, 0]}>
              <mesh position={[0, -0.25, 0]} castShadow>
                <boxGeometry args={[0.52, 0.5, 0.32]} />
                <meshStandardMaterial color={0x111111} roughness={0.7} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Head */}
        <group position={[0, 1.3, 0]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color={0xffccaa} />
          </mesh>
          {/* Pompadour Hair */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
            <meshStandardMaterial color={color} roughness={0.2} />
          </mesh>
        </group>

        {/* Limbs */}
        <Limb x={0.35} y={1.1} w={0.12} h={0.6} limbRef={limbsRef.current.armR} />
        <Limb x={-0.35} y={1.1} w={0.12} h={0.6} limbRef={limbsRef.current.armL} />
        <Limb x={0.15} y={0.5} w={0.18} h={0.7} limbRef={limbsRef.current.legR} />
        <Limb x={-0.15} y={0.5} w={0.18} h={0.7} limbRef={limbsRef.current.legL} />
      </group>
    </group>
  );
}