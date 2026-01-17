import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

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

	// Create random shops with stable IDs
	const shops = useMemo(() => {
		return Array.from({ length: count }, (_, idx) => ({
			id: `shop-${idx}-${Math.random()}`, // Stable ID within this session
			x: (Math.random() - 0.5) * 300,
			y: (Math.random() - 0.5) * 50, // Vertical spread
			width: 5 + Math.random() * 10,
			height: 4 + Math.random() * 4,
			color: Math.random() > 0.5 ? "#ff00ff" : "#00ffff", // Cyberpunk Pink/Blue
		}));
	}, [count]);

	useFrame(() => {
		if (!group.current) return;
		const camX = camera.position.x;

		// Parallax logic adjusted for groups
		// Simple translation isn't enough for infinite scrolling like the instanced mesh approach
		// But for "MallBackground" specifically, maybe it's just a scrolling backdrop
		// Let's stick to the requested change: Stable IDs (already present in my read, verifying)
		group.current.position.x = camX * speedFactor;
	});

	return (
		<group ref={group}>
			{shops.map((s) => (
				<NeonSign
					key={s.id}
					position={[s.x, s.y, depth]}
					color={s.color}
					size={[s.width, s.height]}
				/>
			))}
		</group>
	);
}

export function MallBackground() {
	return (
		<group>
			<color attach="background" args={["#100010"]} />
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
