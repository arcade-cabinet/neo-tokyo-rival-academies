import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

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
			const h =
				heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
			arr.push({
				x: (Math.random() - 0.5) * 200, // Spread across X
				y: -20, // Base
				z: 0,
				scaleY: h,
				// Pre-compute random width scaling
				scaleX: 3 + Math.random() * 2,
				scaleZ: 3 + Math.random() * 2,
				color: CITY_COLORS[Math.floor(Math.random() * CITY_COLORS.length)],
			});
		}
		return arr.sort((a, b) => a.x - b.x);
	}, [count, heightRange]);

	useFrame(() => {
		if (!mesh.current) return;

		// Parallax movement
		const camX = camera.position.x;

		buildings.forEach((b, i) => {
			const wrapRange = 100;
			let worldX = b.x + camX * (1 - speedFactor);

			// Re-center around camera
			while (worldX < camX - wrapRange) worldX += wrapRange * 2;
			while (worldX > camX + wrapRange) worldX -= wrapRange * 2;

			dummy.position.set(worldX, b.y + b.scaleY / 2, z);
			// Use pre-computed scales to avoid jitter
			dummy.scale.set(b.scaleX, b.scaleY, b.scaleZ);
			dummy.updateMatrix();
			mesh.current?.setMatrixAt(i, dummy.matrix);
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

function NeonLights({
	count,
	z,
	speedFactor,
}: {
	count: number;
	z: number;
	speedFactor: number;
}) {
	const { camera } = useThree();
	const mesh = useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);
	const lights = useMemo(() => {
		return new Array(count).fill(0).map(() => ({
			x: (Math.random() - 0.5) * 200,
			y: Math.random() * 40 - 10,
			color: new THREE.Color().setHex(
				CITY_COLORS[Math.floor(Math.random() * CITY_COLORS.length)],
			),
			// Pre-compute scale
			scaleY: 2 + Math.random() * 5,
		}));
	}, [count]);

	// Set colors once on mount to avoid re-uploading attribute buffer every frame
	useEffect(() => {
		if (!mesh.current) return;
		lights.forEach((l, i) => {
			mesh.current?.setColorAt(i, l.color);
		});
		if (mesh.current.instanceColor) {
			mesh.current.instanceColor.needsUpdate = true;
		}
	}, [lights]);

	useFrame(() => {
		if (!mesh.current) return;
		const camX = camera.position.x;
		const wrapRange = 100;

		lights.forEach((l, i) => {
			let worldX = l.x + camX * (1 - speedFactor);
			while (worldX < camX - wrapRange) worldX += wrapRange * 2;
			while (worldX > camX + wrapRange) worldX -= wrapRange * 2;

			dummy.position.set(worldX, l.y, z + 0.6); // Slightly in front of buildings
			// Use pre-computed scale
			dummy.scale.set(0.5, l.scaleY, 0.1);
			dummy.updateMatrix();
			mesh.current?.setMatrixAt(i, dummy.matrix);
		});
		mesh.current.instanceMatrix.needsUpdate = true;
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
			<BuildingLayer
				count={30}
				z={-20}
				speedFactor={0.1}
				heightRange={[30, 60]}
			/>
			{/* Mid Background */}
			<BuildingLayer
				count={20}
				z={-10}
				speedFactor={0.3}
				heightRange={[15, 30]}
			/>
			<NeonLights count={40} z={-10} speedFactor={0.3} />

			{/* Fog to blend */}
			<fog attach="fog" args={["#050510", 10, 60]} />
			<color attach="background" args={["#050510"]} />
		</group>
	);
}
