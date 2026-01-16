import * as THREE from 'three';

export function Connector({
  position,
  type = 'bridge',
}: {
  position: [number, number, number];
  type?: 'bridge' | 'gate';
}) {
  return (
    <group position={position}>
      {/* Visuals for a connector that goes 'into' the Z depth */}

      {type === 'bridge' && (
        <group>
          {/* The floor extending back */}
          <mesh position={[0, -0.5, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <boxGeometry args={[8, 40, 1]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Railings */}
          <mesh position={[-4.5, 0.5, -10]}>
            <boxGeometry args={[1, 2, 40]} />
            <meshStandardMaterial color="#0ff" emissive="#0ff" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[4.5, 0.5, -10]}>
            <boxGeometry args={[1, 2, 40]} />
            <meshStandardMaterial color="#0ff" emissive="#0ff" emissiveIntensity={0.5} />
          </mesh>
          {/* Neon Arches */}
          <mesh position={[0, 5, -5]}>
            <torusGeometry args={[6, 0.5, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#f0f" emissive="#f0f" />
          </mesh>
          <mesh position={[0, 5, -15]}>
            <torusGeometry args={[6, 0.5, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#f0f" emissive="#f0f" />
          </mesh>
        </group>
      )}

      {type === 'gate' && (
        <group>
          {/* Large Gate Structure */}
          <mesh position={[0, 5, -2]}>
            <boxGeometry args={[12, 10, 2]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Holographic Door */}
          <mesh position={[0, 4, -1]}>
            <planeGeometry args={[8, 8]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}
