import { useFrame, useThree } from '@react-three/fiber';
import { building } from '@utils/procedural/AssetGen';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function ParallaxLayer({
  speed,
  zOffset,
  count,
  scale,
  colorVariant,
}: {
  speed: number;
  zOffset: number;
  count: number;
  scale: number;
  colorVariant: 'neon' | 'dark';
}) {
  const groupRef = useRef<THREE.Group>(null);
  const itemsRef = useRef<(THREE.Group | null)[]>([]);
  const { camera } = useThree();

  const materials = useMemo(
    () => ({
      cyan: building(190),
      magenta: building(320),
      dark: new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.1 }),
    }),
    []
  );

  const data = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const x = (i - count / 2) * (40 * scale);
      const z = zOffset - Math.random() * 50;
      const height = (50 + Math.random() * 100) * scale;
      const width = (10 + Math.random() * 20) * scale;
      const depth = (10 + Math.random() * 20) * scale;
      const isCyan = Math.random() > 0.5;
      return { id: i, x, z, height, width, depth, isCyan };
    });
  }, [count, scale, zOffset]);

  useFrame(() => {
    if (!groupRef.current) return;
    const camX = camera.position.x;
    groupRef.current.position.x = camX * speed;

    const distFactor = 1 - speed;
    const totalWidth = count * (40 * scale);
    const viewOffset = camX * distFactor;

    itemsRef.current.forEach((b, _i) => {
      if (!b) return;
      let localX = b.position.x;
      if (localX < viewOffset - totalWidth / 2) {
        localX += totalWidth;
        b.position.x = localX;
      } else if (localX > viewOffset + totalWidth / 2) {
        localX -= totalWidth;
        b.position.x = localX;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((d, i) => (
        <group
          key={d.id}
          position={[d.x, d.height / 2 - 20, d.z]}
          ref={(el) => {
            itemsRef.current[i] = el;
          }}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[d.width, d.height, d.depth]} />
            {colorVariant === 'neon' ? (
              <meshStandardMaterial
                map={d.isCyan ? materials.cyan : materials.magenta}
                roughness={0.2}
                metalness={0.8}
              />
            ) : (
              <primitive object={materials.dark} />
            )}
          </mesh>
          {colorVariant === 'neon' && (
            <mesh position={[0, d.height / 2 + 0.5, 0]}>
              <boxGeometry args={[d.width * 1.1, 1, d.depth * 1.1]} />
              <meshBasicMaterial color={d.isCyan ? 0x00ffff : 0xff00ff} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export function CityBackground() {
  return (
    <>
      {/* Far Background (Slow, Dark) */}
      <ParallaxLayer speed={0.95} zOffset={-150} count={30} scale={2.5} colorVariant="dark" />
      {/* Mid Background (Normal, Neon) */}
      <ParallaxLayer speed={0.8} zOffset={-60} count={40} scale={1.2} colorVariant="neon" />
    </>
  );
}
