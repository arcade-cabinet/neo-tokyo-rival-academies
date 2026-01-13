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

export function Character({ color, position = [0, 0, 0], state = 'run' }: CharacterProps) {
  const pivotRef = useRef<THREE.Group>(null);
  const coatSeg1Ref = useRef<THREE.Group>(null);
  const coatSeg2Ref = useRef<THREE.Group>(null);
  const coatSeg3Ref = useRef<THREE.Group>(null);
  const limbsRef = useRef({
    armL: null as THREE.Group | null,
    armR: null as THREE.Group | null,
    legL: null as THREE.Group | null,
    legR: null as THREE.Group | null,
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

      if (limbsRef.current.legL) limbsRef.current.legL.rotation.x = Math.sin(run);
      if (limbsRef.current.legR) limbsRef.current.legR.rotation.x = Math.sin(run + Math.PI);
      if (limbsRef.current.armL) limbsRef.current.armL.rotation.x = Math.sin(run + Math.PI);
      if (limbsRef.current.armR) limbsRef.current.armR.rotation.x = Math.sin(run);
    } else if (state === 'jump') {
      pivotRef.current.rotation.x = 0;
      if (limbsRef.current.legL) limbsRef.current.legL.rotation.x = 0.5;
      if (limbsRef.current.legR) limbsRef.current.legR.rotation.x = -0.2;
      if (limbsRef.current.armL) limbsRef.current.armL.rotation.x = -2.5;
      if (limbsRef.current.armR) limbsRef.current.armR.rotation.x = -2;
    } else if (state === 'slide') {
      pivotRef.current.rotation.x = -1.3;
      pivotRef.current.position.y = -0.5;
      if (limbsRef.current.legL) limbsRef.current.legL.rotation.x = 1.5;
      if (limbsRef.current.legR) limbsRef.current.legR.rotation.x = 1.3;
      if (limbsRef.current.armL) limbsRef.current.armL.rotation.x = 0.5;
      if (limbsRef.current.armR) limbsRef.current.armR.rotation.x = 0.5;
    } else if (state === 'stun') {
      pivotRef.current.rotation.x = -0.5;
      if (limbsRef.current.armL) limbsRef.current.armL.rotation.x = -1;
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
    limbRef: React.MutableRefObject<THREE.Group | null>;
  }) => (
    <group
      position={[x, y, 0]}
      ref={(ref) => {
        limbRef.current = ref;
      }}
    >
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
        <Limb x={0.35} y={1.1} w={0.12} h={0.6} limbRef={{ current: null } as any} />
        <Limb x={-0.35} y={1.1} w={0.12} h={0.6} limbRef={{ current: null } as any} />
        <Limb x={0.15} y={0.5} w={0.18} h={0.7} limbRef={{ current: null } as any} />
        <Limb x={-0.15} y={0.5} w={0.18} h={0.7} limbRef={{ current: null } as any} />
      </group>
    </group>
  );
}
