import { memo } from 'react';
import * as THREE from 'three';

// Memoized material to prevent re-renders
const ToonMat = memo(({ color, wireframe = false, transparent = false, opacity = 1 }: { color: THREE.ColorRepresentation, wireframe?: boolean, transparent?: boolean, opacity?: number }) => (
    <meshToonMaterial
        color={color}
        wireframe={wireframe}
        transparent={transparent}
        opacity={opacity}
        gradientMap={null}
    />
));
ToonMat.displayName = 'ToonMat';

interface LimbProps {
  x: number;
  y: number;
  w: number;
  h: number;
  limbRef: React.RefObject<THREE.Group | null>;
  hasWeapon?: boolean;
  isPlayer?: boolean;
}

export const Limb = ({
  x,
  y,
  w,
  h,
  limbRef,
  hasWeapon,
  isPlayer,
}: LimbProps) => (
  <group position={[x, y, 0]} ref={limbRef}>
    <mesh position={[0, -h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, w]} />
      <ToonMat color={0x111111} />
    </mesh>
    {hasWeapon && isPlayer && (
      // THE REDLINE PISTON (Hammer)
      <group position={[0, -h, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.3, 1.2, 0.3]} />
          <ToonMat color="#333" />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <ToonMat color="#a00" />
        </mesh>
        {/* Engine block detail */}
        <mesh position={[0, 1.2, 0.45]}>
          <boxGeometry args={[0.6, 0.4, 0.2]} />
          <ToonMat color="#ffd700" />
        </mesh>
      </group>
    )}
    {hasWeapon && !isPlayer && (
      // THE NULL SET (Lance)
      <group position={[0, -h, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.05, 0.1, 2.5, 8]} />
          <ToonMat color="#0ff" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <ToonMat color="#fff" wireframe />
        </mesh>
      </group>
    )}
  </group>
);
