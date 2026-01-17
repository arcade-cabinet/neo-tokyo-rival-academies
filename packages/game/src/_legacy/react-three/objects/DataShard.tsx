import { Float, Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

export function DataShard({
	position,
}: {
	position: [number, number, number];
}) {
	const meshRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.02;
			meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
		}
	});

	return (
		<Float speed={2} rotationIntensity={1} floatIntensity={1}>
			<mesh ref={meshRef} position={position}>
				{/* A floating digital chip/crystal */}
				<octahedronGeometry args={[0.5, 0]} />
				<meshStandardMaterial
					color="#00ff00"
					emissive="#00ff00"
					emissiveIntensity={3}
					wireframe={true}
				/>
				<Sparkles
					count={10}
					scale={2}
					size={2}
					speed={0.4}
					opacity={0.5}
					color="#00ff00"
				/>
			</mesh>
		</Float>
	);
}
