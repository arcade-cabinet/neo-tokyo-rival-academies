import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Render a neon sign mesh with an emissive material.
 *
 * @param position - 3D position as [x, y, z] where the sign will be placed
 * @param color - CSS color or hex string used for the sign's color and emissive glow
 * @param size - Width and height as [width, height] for the sign's rectangular face
 * @returns A JSX mesh positioned at `position` with box geometry sized by `size` and a bright emissive material
 */
function NeonSign({
  position,
  color,
  size,
}: {
  position: [number, number, number];
  color: string;
  size: [number, number];
}) {
  return (
    <mesh position={new THREE.Vector3(...position)}>
      <boxGeometry args={[size[0], size[1], 0.5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Renders a layer of neon shop signs positioned at a fixed depth with horizontal parallax.
 *
 * Generates `count` neon signs with varied positions, sizes, and colors, and shifts the entire layer horizontally based on the camera X position multiplied by `speedFactor`.
 *
 * @param count - Number of shop signs to generate in the layer
 * @param depth - Z position at which all shop signs are placed
 * @param speedFactor - Multiplier applied to the camera's X position to produce the layer's parallax offset
 * @returns A React group containing the generated NeonSign meshes with parallax behavior
 */
function ShopLayer({
  count,
  depth,
  speedFactor,
}: {
  count: number;
  depth: number;
  speedFactor: number;
}) {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);

  // Create random shops
  const shops = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 50, // Vertical spread
      width: 5 + Math.random() * 10,
      height: 4 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff', // Cyberpunk Pink/Blue
    }));
  }, [count]);

  useFrame(() => {
    if (!group.current) return;
    const camX = camera.position.x;

    // Parallax
    group.current.position.x = camX * speedFactor;

    // We might need to wrap them manually if we want infinite scrolling,
    // but for now let's just place them widely.
  });

  return (
    <group ref={group}>
      {shops.map((s, i) => (
        <NeonSign key={i} position={[s.x, s.y, depth]} color={s.color} size={[s.width, s.height]} />
      ))}
    </group>
  );
}

/**
 * Renders the layered neon mall background with parallax shop signs, ambient lighting, and a floor hint.
 *
 * @returns A React Three Fiber group containing:
 * - a dark scene background,
 * - an ambient light,
 * - two ShopLayer instances configured for parallax (near and far),
 * - and a semi-transparent floor plane to suggest reflection.
 */
export function MallBackground() {
  return (
    <group>
      <color attach="background" args={['#100010']} />
      <ambientLight intensity={0.2} />
      <ShopLayer count={20} depth={-20} speedFactor={0.8} />
      <ShopLayer count={30} depth={-40} speedFactor={0.5} />

      {/* Floor reflection hint? */}
      <mesh position={[0, -10, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1000, 100]} />
        <meshBasicMaterial color="#200020" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}