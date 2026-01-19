/**
 * ForegroundProps Component
 *
 * Props placed on the hex grid playable area.
 * Part of the isometric diorama's Layer 1 (z: 0 to -5).
 *
 * Includes: AC units, pipe clusters, barrier fences, steam vents
 */

import {
	type AbstractMesh,
	Color3,
	MeshBuilder,
	ParticleSystem,
	type Scene,
	StandardMaterial,
	Texture,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface ForegroundPropsProps {
	/** Seed for deterministic prop placement */
	seed: string;
	/** Grid bounds */
	bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
	/** Show steam particle effects */
	enableParticles?: boolean;
}

interface PropPlacement {
	type: "ac_unit" | "pipe_cluster" | "barrier" | "steam_vent" | "antenna";
	position: Vector3;
	rotation?: number;
	scale?: number;
}

export function ForegroundProps({
	seed,
	bounds,
	enableParticles = true,
}: ForegroundPropsProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);
	const particlesRef = useRef<ParticleSystem[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const particles: ParticleSystem[] = [];

		// Generate deterministic prop placements
		const placements = generatePropPlacements(seed, bounds);

		// Create materials
		const materials = createPropMaterials(scene);

		// Create each prop
		for (const placement of placements) {
			let propMeshes: AbstractMesh[];

			switch (placement.type) {
				case "ac_unit":
					propMeshes = createACUnit(scene, placement, materials);
					break;
				case "pipe_cluster":
					propMeshes = createPipeCluster(scene, placement, materials);
					break;
				case "barrier":
					propMeshes = createBarrier(scene, placement, materials);
					break;
				case "steam_vent":
					propMeshes = createSteamVent(scene, placement, materials);
					if (enableParticles) {
						const steam = createSteamParticles(scene, placement.position);
						particles.push(steam);
					}
					break;
				case "antenna":
					propMeshes = createAntenna(scene, placement, materials);
					break;
				default:
					propMeshes = [];
			}

			meshes.push(...propMeshes);
		}

		// Edge barriers
		const edgeBarriers = createEdgeBarriers(scene, bounds, materials);
		meshes.push(...edgeBarriers);

		meshesRef.current = meshes;
		particlesRef.current = particles;

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			for (const particle of particlesRef.current) {
				particle.dispose();
			}
			for (const mat of Object.values(materials)) {
				mat.dispose();
			}
			meshesRef.current = [];
			particlesRef.current = [];
		};
	}, [scene, seed, bounds, enableParticles]);

	return null;
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: string): () => number {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}

	return () => {
		hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
		hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
		hash ^= hash >>> 16;
		return (hash >>> 0) / 0xffffffff;
	};
}

/**
 * Generate prop placements based on seed
 */
function generatePropPlacements(
	seed: string,
	bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
): PropPlacement[] {
	const random = seededRandom(seed);
	const placements: PropPlacement[] = [];

	const gridWidth = bounds.maxX - bounds.minX;
	const gridDepth = bounds.maxZ - bounds.minZ;

	// AC units - scattered around edges
	const acCount = 3 + Math.floor(random() * 2);
	for (let i = 0; i < acCount; i++) {
		const edge = Math.floor(random() * 4);
		let x: number;
		let z: number;

		switch (edge) {
			case 0: // top
				x = bounds.minX + random() * gridWidth;
				z = bounds.minZ + random() * 3;
				break;
			case 1: // bottom
				x = bounds.minX + random() * gridWidth;
				z = bounds.maxZ - random() * 3;
				break;
			case 2: // left
				x = bounds.minX + random() * 3;
				z = bounds.minZ + random() * gridDepth;
				break;
			default: // right
				x = bounds.maxX - random() * 3;
				z = bounds.minZ + random() * gridDepth;
				break;
		}

		placements.push({
			type: "ac_unit",
			position: new Vector3(x, 0, z),
			rotation: random() * Math.PI * 2,
		});
	}

	// Pipe clusters - near center area
	const pipeCount = 2 + Math.floor(random() * 2);
	for (let i = 0; i < pipeCount; i++) {
		placements.push({
			type: "pipe_cluster",
			position: new Vector3(
				bounds.minX + 5 + random() * (gridWidth - 10),
				0,
				bounds.minZ + 5 + random() * (gridDepth - 10),
			),
			rotation: random() * Math.PI * 2,
		});
	}

	// Steam vents - scattered
	const steamCount = 2 + Math.floor(random() * 2);
	for (let i = 0; i < steamCount; i++) {
		placements.push({
			type: "steam_vent",
			position: new Vector3(
				bounds.minX + 3 + random() * (gridWidth - 6),
				0,
				bounds.minZ + 3 + random() * (gridDepth - 6),
			),
		});
	}

	// Antennas - corners
	if (random() > 0.5) {
		placements.push({
			type: "antenna",
			position: new Vector3(bounds.minX + 2, 0, bounds.minZ + 2),
		});
	}
	if (random() > 0.5) {
		placements.push({
			type: "antenna",
			position: new Vector3(bounds.maxX - 2, 0, bounds.minZ + 2),
		});
	}

	return placements;
}

/**
 * Create materials for props
 */
function createPropMaterials(scene: Scene): Record<string, StandardMaterial> {
	// Metal material
	const metalMat = new StandardMaterial("propMetal", scene);
	metalMat.diffuseColor = new Color3(0.35, 0.38, 0.4);
	metalMat.specularColor = new Color3(0.2, 0.2, 0.2);

	// Rusty metal
	const rustyMat = new StandardMaterial("propRusty", scene);
	rustyMat.diffuseColor = new Color3(0.45, 0.3, 0.2);
	rustyMat.specularColor = new Color3(0.1, 0.1, 0.1);

	// Pipe material
	const pipeMat = new StandardMaterial("propPipe", scene);
	pipeMat.diffuseColor = new Color3(0.25, 0.28, 0.3);
	pipeMat.specularColor = new Color3(0.3, 0.3, 0.3);

	// Grate material
	const grateMat = new StandardMaterial("propGrate", scene);
	grateMat.diffuseColor = new Color3(0.2, 0.2, 0.22);
	grateMat.specularColor = new Color3(0.15, 0.15, 0.15);

	// Warning yellow
	const warningMat = new StandardMaterial("propWarning", scene);
	warningMat.diffuseColor = new Color3(0.9, 0.7, 0.1);
	warningMat.specularColor = new Color3(0.1, 0.1, 0.1);

	return { metalMat, rustyMat, pipeMat, grateMat, warningMat };
}

/**
 * Create AC unit prop
 */
function createACUnit(
	scene: Scene,
	placement: PropPlacement,
	materials: Record<string, StandardMaterial>,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const { position, rotation = 0 } = placement;

	// Main body
	const body = MeshBuilder.CreateBox(
		`ac_body_${position.x}_${position.z}`,
		{ width: 2, height: 1.5, depth: 1.2 },
		scene,
	);
	body.position = new Vector3(position.x, 0.75, position.z);
	body.rotation.y = rotation;
	body.material = materials.metalMat;
	parts.push(body);

	// Fan grill
	const grill = MeshBuilder.CreateCylinder(
		`ac_grill_${position.x}_${position.z}`,
		{ diameter: 0.8, height: 0.1, tessellation: 16 },
		scene,
	);
	grill.position = new Vector3(
		position.x + Math.sin(rotation) * 0.6,
		0.9,
		position.z + Math.cos(rotation) * 0.6,
	);
	grill.rotation.x = Math.PI / 2;
	grill.rotation.z = rotation;
	grill.material = materials.grateMat;
	parts.push(grill);

	return parts;
}

/**
 * Create pipe cluster prop
 */
function createPipeCluster(
	scene: Scene,
	placement: PropPlacement,
	materials: Record<string, StandardMaterial>,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const { position, rotation = 0 } = placement;

	// Vertical pipes
	const pipeConfigs = [
		{ xOff: 0, zOff: 0, height: 2.5, diameter: 0.3 },
		{ xOff: 0.4, zOff: 0.2, height: 1.8, diameter: 0.25 },
		{ xOff: -0.3, zOff: 0.3, height: 2.2, diameter: 0.2 },
	];

	for (let i = 0; i < pipeConfigs.length; i++) {
		const cfg = pipeConfigs[i];
		const pipe = MeshBuilder.CreateCylinder(
			`pipe_${i}_${position.x}_${position.z}`,
			{ height: cfg.height, diameter: cfg.diameter, tessellation: 8 },
			scene,
		);

		const rotatedX =
			cfg.xOff * Math.cos(rotation) - cfg.zOff * Math.sin(rotation);
		const rotatedZ =
			cfg.xOff * Math.sin(rotation) + cfg.zOff * Math.cos(rotation);

		pipe.position = new Vector3(
			position.x + rotatedX,
			cfg.height / 2,
			position.z + rotatedZ,
		);
		pipe.material = materials.pipeMat;
		parts.push(pipe);
	}

	// Horizontal connector pipe
	const connector = MeshBuilder.CreateCylinder(
		`pipe_conn_${position.x}_${position.z}`,
		{ height: 1.2, diameter: 0.15, tessellation: 8 },
		scene,
	);
	connector.position = new Vector3(position.x, 1.5, position.z + 0.15);
	connector.rotation.z = Math.PI / 2;
	connector.rotation.y = rotation;
	connector.material = materials.pipeMat;
	parts.push(connector);

	return parts;
}

/**
 * Create barrier fence
 */
function createBarrier(
	scene: Scene,
	placement: PropPlacement,
	materials: Record<string, StandardMaterial>,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const { position, rotation = 0 } = placement;

	// Posts
	for (let i = 0; i < 2; i++) {
		const post = MeshBuilder.CreateBox(
			`barrier_post_${i}_${position.x}_${position.z}`,
			{ width: 0.15, height: 1.2, depth: 0.15 },
			scene,
		);
		const offset = i === 0 ? -0.8 : 0.8;
		post.position = new Vector3(
			position.x + offset * Math.cos(rotation),
			0.6,
			position.z + offset * Math.sin(rotation),
		);
		post.material = materials.metalMat;
		parts.push(post);
	}

	// Rails
	for (let r = 0; r < 2; r++) {
		const rail = MeshBuilder.CreateBox(
			`barrier_rail_${r}_${position.x}_${position.z}`,
			{ width: 1.8, height: 0.08, depth: 0.08 },
			scene,
		);
		rail.position = new Vector3(position.x, 0.4 + r * 0.5, position.z);
		rail.rotation.y = rotation;
		rail.material = r === 1 ? materials.warningMat : materials.metalMat;
		parts.push(rail);
	}

	return parts;
}

/**
 * Create steam vent grate
 */
function createSteamVent(
	scene: Scene,
	placement: PropPlacement,
	materials: Record<string, StandardMaterial>,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const { position } = placement;

	// Grate cover
	const grate = MeshBuilder.CreateCylinder(
		`vent_grate_${position.x}_${position.z}`,
		{ diameter: 1.2, height: 0.1, tessellation: 12 },
		scene,
	);
	grate.position = new Vector3(position.x, 0.05, position.z);
	grate.material = materials.grateMat;
	parts.push(grate);

	// Rim
	const rim = MeshBuilder.CreateTorus(
		`vent_rim_${position.x}_${position.z}`,
		{ diameter: 1.2, thickness: 0.1, tessellation: 16 },
		scene,
	);
	rim.position = new Vector3(position.x, 0.1, position.z);
	rim.material = materials.rustyMat;
	parts.push(rim);

	return parts;
}

/**
 * Create antenna prop
 */
function createAntenna(
	scene: Scene,
	placement: PropPlacement,
	materials: Record<string, StandardMaterial>,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const { position } = placement;

	// Base
	const base = MeshBuilder.CreateBox(
		`antenna_base_${position.x}_${position.z}`,
		{ width: 0.6, height: 0.4, depth: 0.6 },
		scene,
	);
	base.position = new Vector3(position.x, 0.2, position.z);
	base.material = materials.metalMat;
	parts.push(base);

	// Pole
	const pole = MeshBuilder.CreateCylinder(
		`antenna_pole_${position.x}_${position.z}`,
		{ height: 3, diameter: 0.08, tessellation: 8 },
		scene,
	);
	pole.position = new Vector3(position.x, 1.9, position.z);
	pole.material = materials.metalMat;
	parts.push(pole);

	// Dishes
	const dish = MeshBuilder.CreateDisc(
		`antenna_dish_${position.x}_${position.z}`,
		{ radius: 0.4, tessellation: 12 },
		scene,
	);
	dish.position = new Vector3(position.x + 0.3, 2.8, position.z);
	dish.rotation.y = Math.PI / 4;
	dish.rotation.x = Math.PI / 6;
	dish.material = materials.rustyMat;
	parts.push(dish);

	return parts;
}

/**
 * Create edge barriers around the playable area
 */
function createEdgeBarriers(
	scene: Scene,
	bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
	materials: Record<string, StandardMaterial>,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const barrierSpacing = 4;

	// Back edge (minZ)
	for (let x = bounds.minX; x <= bounds.maxX; x += barrierSpacing) {
		const barriers = createBarrier(
			scene,
			{
				type: "barrier",
				position: new Vector3(x, 0, bounds.minZ - 1),
				rotation: 0,
			},
			materials,
		);
		parts.push(...barriers);
	}

	return parts;
}

/**
 * Create steam particle effect
 */
function createSteamParticles(scene: Scene, position: Vector3): ParticleSystem {
	const particleSystem = new ParticleSystem(
		`steam_${position.x}_${position.z}`,
		200,
		scene,
	);

	// Use a simple white texture or create one
	particleSystem.particleTexture = new Texture(
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAGklEQVQYV2P8////fwYGBgYGRhgGMTAwMAAAFQAB/v1MoQAAAABJRU5ErkJggg==",
		scene,
	);

	// Emitter
	particleSystem.emitter = new Vector3(position.x, 0.15, position.z);
	particleSystem.minEmitBox = new Vector3(-0.3, 0, -0.3);
	particleSystem.maxEmitBox = new Vector3(0.3, 0, 0.3);

	// Particle properties
	particleSystem.color1 = new Color3(0.8, 0.8, 0.8).toColor4(0.3);
	particleSystem.color2 = new Color3(0.9, 0.9, 0.95).toColor4(0.2);
	particleSystem.colorDead = new Color3(1, 1, 1).toColor4(0);

	particleSystem.minSize = 0.3;
	particleSystem.maxSize = 0.8;

	particleSystem.minLifeTime = 1.5;
	particleSystem.maxLifeTime = 3;

	particleSystem.emitRate = 15;

	particleSystem.direction1 = new Vector3(-0.2, 1, -0.2);
	particleSystem.direction2 = new Vector3(0.2, 1.5, 0.2);

	particleSystem.minEmitPower = 0.5;
	particleSystem.maxEmitPower = 1;

	particleSystem.gravity = new Vector3(0, 0.1, 0);

	particleSystem.start();

	return particleSystem;
}
