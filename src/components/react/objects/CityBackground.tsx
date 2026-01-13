import { useFrame, useThree } from '@react-three/fiber';
import { building } from '@utils/procedural/AssetGen';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';

export function CityBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const buildingRefs = useRef<(THREE.Group | null)[]>([]);
  const { camera } = useThree();

  // Create building materials once
  const materials = useMemo(
    () => ({
      cyan: building(190),
      magenta: building(320),
    }),
    []
  );

  // Generate static data for a pool of buildings
  // 40 buildings spaced ~30 units = 1200 units coverage
  const buildingsData = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const x = (i - 20) * 30; // Start centered
      const z = -50 - Math.random() * 100;
      const height = 30 + Math.random() * 80; // Taller buildings
      const width = 10 + Math.random() * 15;
      const depth = 10 + Math.random() * 15;
      const isCyan = Math.random() > 0.5;
      return { id: i, x, z, height, width, depth, isCyan };
    });
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    const parallaxFactor = 0.9; // Moves at 90% of camera speed (looks far away)
    const camX = camera.position.x;

    // Move the container group
    groupRef.current.position.x = camX * parallaxFactor;

    // Recycle buildings
    // Relative speed factor (how fast they move relative to camera) is (1 - parallaxFactor) = 0.1
    // Apparent position relative to camera = (groupPos + localPos) - camPos
    // = (camX * p + localX) - camX
    // = localX - camX * (1 - p)

    const distFactor = 1 - parallaxFactor;
    const totalWidth = 40 * 30; // 1200
    const viewOffset = camX * distFactor;

    buildingRefs.current.forEach((b, _i) => {
      if (!b) return;

      // Calculate where this building is relative to the "view center" in local space
      // localX should be close to viewOffset
      let localX = b.position.x;

      // If building is too far left relative to view
      if (localX < viewOffset - 200) {
        localX += totalWidth;
        b.position.x = localX;
      }
      // If building is too far right (unlikely when moving right, but good for safety)
      else if (localX > viewOffset + totalWidth - 200) {
        localX -= totalWidth;
        b.position.x = localX;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {buildingsData.map((data, i) => (
        <group
          key={data.id}
          position={[data.x, data.height / 2, data.z]}
          ref={(el) => {
            buildingRefs.current[i] = el;
          }}
        >
          {/* Building body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[data.width, data.height, data.depth]} />
            <meshStandardMaterial
              map={data.isCyan ? materials.cyan : materials.magenta}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Top glow */}
          <mesh position={[0, data.height / 2 + 0.5, 0]}>
            <boxGeometry args={[data.width * 1.1, 1, data.depth * 1.1]} />
            <meshBasicMaterial color={data.isCyan ? 0x00ffff : 0xff00ff} />
            <pointLight
              position={[0, 2, 0]}
              color={data.isCyan ? 0x00ffff : 0xff00ff}
              intensity={2}
              distance={40}
            />
          </mesh>

          {/* Antenna */}
          <mesh position={[0, data.height / 2 + 5, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 10, 8]} />
            <meshBasicMaterial color={data.isCyan ? 0x00ffff : 0xff00ff} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
