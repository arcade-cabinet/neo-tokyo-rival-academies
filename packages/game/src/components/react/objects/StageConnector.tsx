import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface StageConnectorProps {
  position: [number, number, number];
  type: 'door' | 'bridge' | 'elevator' | 'portal';
  destination: string;
  isActive: boolean;
  onEnter: () => void;
}

export function StageConnector({ position, type, isActive, onEnter }: StageConnectorProps) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glow.current && isActive) {
      glow.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.1);
    }
    if (group.current) {
      // Floating effect for portals
      if (type === 'portal') {
        group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
      }
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Visuals based on Type */}
      {type === 'door' && (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2, 3, 0.5]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {type === 'bridge' && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4, 10]} />
          <meshStandardMaterial color="#333" side={THREE.DoubleSide} />
        </mesh>
      )}

      {type === 'elevator' && (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[3, 0.2, 3]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <mesh position={[0, 1.5, -1.4]}>
            <boxGeometry args={[3, 3, 0.2]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      )}

      {/* Interactive Zone / Glow */}
      <mesh ref={glow} position={[0, 1.5, 0]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial
          color={isActive ? '#00ff00' : '#ff0000'}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>

      {/* Label */}
      {isActive && (
        <group position={[0, 4, 0]}>
          <mesh>
            <planeGeometry args={[2, 0.5]} />
            <meshBasicMaterial color="#000" />
          </mesh>
        </group>
      )}
    </group>
  );
}
