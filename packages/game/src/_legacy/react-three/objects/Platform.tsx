import { asphalt } from "@neo-tokyo/content-gen";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface PlatformProps {
	x: number;
	y: number;
	length: number;
	slope: number; // 0=flat, 1=up, -1=down
}

/**
 * Render a rotated 3D platform with an asphalt surface, animated neon edge lights, and an underside glow.
 *
 * @param x - World X coordinate of the platform origin
 * @param y - World Y coordinate of the platform origin
 * @param length - Platform length along its forward axis
 * @param slope - Tilt multiplier where 0 = flat, 1 = upward tilt, -1 = downward tilt
 * @returns A React-Three-Fiber group containing the platform meshes, edge lights, and glow effects
 */
export function Platform({ x, y, length, slope }: PlatformProps) {
	const edgeLight1Ref = useRef<THREE.PointLight>(null);
	const edgeLight2Ref = useRef<THREE.PointLight>(null);

	// Animate edge lights
	useFrame((state) => {
		const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
		if (edgeLight1Ref.current) {
			edgeLight1Ref.current.intensity = pulse * 1.5;
		}
		if (edgeLight2Ref.current) {
			edgeLight2Ref.current.intensity = pulse * 1.5;
		}
	});

	const { position, rotation } = useMemo(() => {
		const angle = slope * 0.26; // ~15 degrees
		const h = 10;

		// Calculate center position for rotated box
		const cx = x + (length / 2) * Math.cos(angle);
		const cy = y + (length / 2) * Math.sin(angle) - h / 2;

		return {
			position: [cx, cy, 0] as [number, number, number],
			rotation: [0, 0, angle] as [number, number, number],
		};
	}, [x, y, length, slope]);

	// Memoize textures (expensive to generate)
	const asphaltTexture = useMemo(() => asphalt(), []);

	return (
		<group>
			{/* Main platform body - darker, more industrial */}
			<mesh position={position} rotation={rotation} castShadow receiveShadow>
				<boxGeometry args={[length, 10, 8]} />
				<meshStandardMaterial
					color={0x0a0a0a}
					roughness={0.9}
					metalness={0.1}
					emissive={0x050510}
					emissiveIntensity={0.1}
				/>
			</mesh>

			{/* Asphalt top surface with enhanced material */}
			<mesh
				position={[position[0], position[1] + 5.01, position[2]]}
				rotation={[rotation[0] - Math.PI / 2, rotation[1], rotation[2]]}
				receiveShadow
			>
				<planeGeometry args={[length, 8]} />
				<meshStandardMaterial
					map={asphaltTexture}
					roughness={0.6}
					metalness={0.3}
					emissive={0x0a0520}
					emissiveIntensity={0.05}
				/>
			</mesh>

			{/* Neon edge glow strips - cyan side */}
			<group
				position={[
					position[0] - length / 2,
					position[1] + 2.5,
					position[2] - 4.1,
				]}
				rotation={rotation}
			>
				<mesh>
					<boxGeometry args={[0.2, 5, 0.2]} />
					<meshBasicMaterial color={0x00ffff} toneMapped={false} />
				</mesh>
				<pointLight
					ref={edgeLight1Ref}
					position={[0, 0, 0]}
					color={0x00ffff}
					intensity={1.5}
					distance={8}
					decay={2}
				/>
			</group>

			{/* Neon edge glow strips - magenta side */}
			<group
				position={[
					position[0] - length / 2,
					position[1] + 2.5,
					position[2] + 4.1,
				]}
				rotation={rotation}
			>
				<mesh>
					<boxGeometry args={[0.2, 5, 0.2]} />
					<meshBasicMaterial color={0xff00ff} toneMapped={false} />
				</mesh>
				<pointLight
					ref={edgeLight2Ref}
					position={[0, 0, 0]}
					color={0xff00ff}
					intensity={1.5}
					distance={8}
					decay={2}
				/>
			</group>

			{/* Underside glow effect */}
			<mesh
				position={[position[0], position[1] - 5.1, position[2]]}
				rotation={[Math.PI / 2, 0, rotation[2]]}
			>
				<planeGeometry args={[length * 0.9, 7]} />
				<meshBasicMaterial
					color={0x00ffff}
					transparent
					opacity={0.1}
					side={THREE.DoubleSide}
				/>
			</mesh>
		</group>
	);
}
