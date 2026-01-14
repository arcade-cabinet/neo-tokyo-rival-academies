import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const CITY_COLORS = [0x00ffff, 0xff00ff, 0x9900ff, 0x0000ff];

function BuildingLayer({
  count,
  z,
  speedFactor,
  heightRange,
}: {
  count: number;
  z: number;
  speedFactor: number;
  heightRange: [number, number];
}) {
  const { camera } = useThree();
  const mesh = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const buildings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const h = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
      arr.push({
        x: (Math.random() - 0.5) * 200, // Spread across X
        y: -20, // Base
        z: 0,
        scaleY: h,
        color: CITY_COLORS[Math.floor(Math.random() * CITY_COLORS.length)],
      });
    }
    return arr.sort((a, b) => a.x - b.x); // Sort for easier wrapping logic?
  }, [count, heightRange]);

  useFrame(() => {
    if (!mesh.current) return;

    // Parallax movement
    const camX = camera.position.x;

    buildings.forEach((b, i) => {
      // Infinite wrapping
      // Standard parallax: Object moves with camera but slower.
      // Pos = Origin + Cam * (1-Speed)

      // Let's stick to world-space placement.
      // If speed = 0.5, it moves half as fast as camera.
      // We need to reposition instances that fall out of view.

      const wrapRange = 100;
      let worldX = b.x + camX * (1 - speedFactor);

      // Re-center around camera
      while (worldX < camX - wrapRange) worldX += wrapRange * 2;
      while (worldX > camX + wrapRange) worldX -= wrapRange * 2;

      dummy.position.set(worldX, b.y + b.scaleY / 2, z);
      dummy.scale.set(3 + Math.random() * 2, b.scaleY, 3 + Math.random() * 2);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
      // We can't easily change color per frame without attribute buffer magic,
      // but we set it once usually. For now, ignore dynamic color updates.
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#222" emissive="#111" />
    </instancedMesh>
  );
}

function NeonLights({ count, z, speedFactor }: { count: number; z: number; speedFactor: number }) {
  const { camera } = useThree();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lights = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      x: (Math.random() - 0.5) * 200,
      y: Math.random() * 40 - 10,
      color: new THREE.Color().setHex(CITY_COLORS[Math.floor(Math.random() * CITY_COLORS.length)]),
    }));
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const camX = camera.position.x;
    const wrapRange = 100;

    lights.forEach((l, i) => {
      let worldX = l.x + camX * (1 - speedFactor);
      while (worldX < camX - wrapRange) worldX += wrapRange * 2;
      while (worldX > camX + wrapRange) worldX -= wrapRange * 2;

      dummy.position.set(worldX, l.y, z + 0.6); // Slightly in front of buildings
      dummy.scale.set(0.5, 2 + Math.random() * 5, 0.1);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
      mesh.current?.setColorAt(i, l.color);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

export function ParallaxBackground() {
  return (
    <group>
      {/* Far Background (Skyline) */}
      <BuildingLayer count={30} z={-20} speedFactor={0.1} heightRange={[30, 60]} />
      {/* Mid Background */}
      <BuildingLayer count={20} z={-10} speedFactor={0.3} heightRange={[15, 30]} />
      <NeonLights count={40} z={-10} speedFactor={0.3} />

      {/* Fog to blend */}
      <fog attach="fog" args={['#050510', 10, 60]} />
      <color attach="background" args={['#050510']} />
    </group>
  );
}
