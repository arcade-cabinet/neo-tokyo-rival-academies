import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * Renders an instanced parallax layer of stars.
 *
 * Each star is placed with a random position and scale, and its world position is updated each frame
 * to create a parallax effect relative to the camera. Stars wrap horizontally and vertically to
 * maintain a continuous field as the camera moves.
 *
 * @param count - Number of star instances to generate
 * @param depth - Z position at which the layer is rendered (distance from the camera)
 * @param speedFactor - Parallax intensity in [0, 1]; lower values make stars appear farther (less movement),
 *                      higher values make them follow the camera more closely
 * @returns A React element containing an instanced mesh of spherical star sprites
 */
function StarLayer({
  count,
  depth,
  speedFactor,
}: {
  count: number;
  depth: number;
  speedFactor: number;
}) {
  const { camera } = useThree();
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stars = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 100,
      z: 0,
      scale: Math.random() * 0.5 + 0.1,
    }));
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const camX = camera.position.x;
    const camY = camera.position.y; // Vertical parallax too
    const wrapRangeX = 100;
    const wrapRangeY = 50;

    stars.forEach((s, i) => {
      let worldX = s.x + camX * (1 - speedFactor);
      let worldY = s.y + camY * (1 - speedFactor);

      // Wrap X
      while (worldX < camX - wrapRangeX) worldX += wrapRangeX * 2;
      while (worldX > camX + wrapRangeX) worldX -= wrapRangeX * 2;

      // Wrap Y (since we move vertically in abduction)
      while (worldY < camY - wrapRangeY) worldY += wrapRangeY * 2;
      while (worldY > camY + wrapRangeY) worldY -= wrapRangeY * 2;

      dummy.position.set(worldX, worldY, depth);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </instancedMesh>
  );
}

export function SpaceshipBackground() {
  return (
    <group>
      <color attach="background" args={['#000010']} />
      <StarLayer count={200} depth={-50} speedFactor={0.05} />
      <StarLayer count={100} depth={-30} speedFactor={0.1} />
      {/* Maybe some giant metal structures parallaxing by? */}
    </group>
  );
}