/**
 * QuestMarkers Component
 *
 * Floating quest objective markers above specific hexes.
 * Includes pulsing animation and interaction handling.
 */

import {
	type AbstractMesh,
	Animation,
	Color3,
	GlowLayer,
	MeshBuilder,
	type Scene,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef, useState } from "react";
import { useScene } from "reactylon";

export interface QuestMarker {
	id: string;
	/** Grid position (hex q,r or world x,z) */
	position: Vector3;
	/** Marker type affects color and shape */
	type: "objective" | "collectible" | "npc" | "exit";
	/** Optional label */
	label?: string;
	/** Whether this marker is active/visible */
	active?: boolean;
}

export interface QuestMarkersProps {
	markers: QuestMarker[];
	/** Callback when a marker is clicked/interacted with */
	onMarkerInteract?: (markerId: string) => void;
	/** Height above ground to float markers */
	floatHeight?: number;
}

const MARKER_COLORS: Record<QuestMarker["type"], Color3> = {
	objective: new Color3(1, 0.8, 0.2), // Gold
	collectible: new Color3(0.2, 0.8, 1), // Cyan
	npc: new Color3(0.2, 1, 0.4), // Green
	exit: new Color3(1, 0.3, 0.8), // Pink
};

export function QuestMarkers({
	markers,
	onMarkerInteract,
	floatHeight = 2.5,
}: QuestMarkersProps) {
	const scene = useScene();
	const meshesRef = useRef<Map<string, AbstractMesh>>(new Map());
	const glowLayerRef = useRef<GlowLayer | null>(null);
	const [, setActiveMarkers] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (!scene) return;

		// Create glow layer for markers
		if (!glowLayerRef.current) {
			const glow = new GlowLayer("questGlow", scene);
			glow.intensity = 0.8;
			glowLayerRef.current = glow;
		}

		// Track which markers exist
		const existingIds = new Set(meshesRef.current.keys());
		const newIds = new Set(
			markers.filter((m) => m.active !== false).map((m) => m.id),
		);

		// Remove markers that are no longer active
		for (const id of existingIds) {
			if (!newIds.has(id)) {
				const mesh = meshesRef.current.get(id);
				if (mesh) {
					mesh.dispose();
					meshesRef.current.delete(id);
				}
			}
		}

		// Create/update markers
		for (const marker of markers) {
			if (marker.active === false) continue;

			let mesh = meshesRef.current.get(marker.id);

			if (!mesh) {
				// Create new marker mesh
				mesh = createMarkerMesh(
					scene,
					marker,
					floatHeight,
					glowLayerRef.current,
				);
				meshesRef.current.set(marker.id, mesh);

				// Setup click interaction
				mesh.actionManager =
					mesh.actionManager || new ActionManagerProxy(scene);
				setupMarkerInteraction(mesh, marker.id, onMarkerInteract);
			} else {
				// Update existing marker position
				mesh.position.x = marker.position.x;
				mesh.position.z = marker.position.z;
			}
		}

		setActiveMarkers(newIds);

		return () => {
			// Full cleanup on unmount
			for (const mesh of meshesRef.current.values()) {
				mesh.dispose();
			}
			meshesRef.current.clear();
			if (glowLayerRef.current) {
				glowLayerRef.current.dispose();
				glowLayerRef.current = null;
			}
		};
	}, [scene, markers, floatHeight, onMarkerInteract]);

	return null;
}

/**
 * Create a quest marker mesh with animation
 */
function createMarkerMesh(
	scene: Scene,
	marker: QuestMarker,
	floatHeight: number,
	glowLayer: GlowLayer | null,
): AbstractMesh {
	const color = MARKER_COLORS[marker.type];

	// Create crystal shape based on type
	let mesh: AbstractMesh;

	switch (marker.type) {
		case "objective":
			// Diamond/octahedron for main objectives
			mesh = MeshBuilder.CreatePolyhedron(
				`marker_${marker.id}`,
				{ type: 1, size: 0.4 }, // Octahedron
				scene,
			);
			break;
		case "collectible":
			// Small rotating cube for collectibles
			mesh = MeshBuilder.CreateBox(
				`marker_${marker.id}`,
				{ size: 0.35 },
				scene,
			);
			mesh.rotation.x = Math.PI / 4;
			mesh.rotation.z = Math.PI / 4;
			break;
		case "npc": {
			// Exclamation mark shape (cylinder + sphere)
			const cylinder = MeshBuilder.CreateCylinder(
				`marker_${marker.id}_cyl`,
				{ height: 0.6, diameter: 0.2, tessellation: 8 },
				scene,
			);
			const dot = MeshBuilder.CreateSphere(
				`marker_${marker.id}_dot`,
				{ diameter: 0.2, segments: 8 },
				scene,
			);
			dot.position.y = -0.5;
			dot.parent = cylinder;
			mesh = cylinder;
			break;
		}
		case "exit":
			// Arrow pointing up/forward
			mesh = MeshBuilder.CreateCylinder(
				`marker_${marker.id}`,
				{ height: 0.8, diameterTop: 0, diameterBottom: 0.5, tessellation: 4 },
				scene,
			);
			mesh.rotation.z = Math.PI; // Point up
			break;
		default:
			mesh = MeshBuilder.CreateSphere(
				`marker_${marker.id}`,
				{ diameter: 0.4, segments: 8 },
				scene,
			);
	}

	// Position
	mesh.position = new Vector3(
		marker.position.x,
		floatHeight,
		marker.position.z,
	);

	// Material with glow
	const material = new StandardMaterial(`marker_mat_${marker.id}`, scene);
	material.diffuseColor = color.scale(0.5);
	material.emissiveColor = color;
	material.specularColor = new Color3(1, 1, 1);
	material.alpha = 0.9;
	mesh.material = material;

	// Add to glow layer
	if (glowLayer) {
		glowLayer.addIncludedOnlyMesh(mesh);
	}

	// Floating animation (bob up and down)
	const floatAnim = new Animation(
		`float_${marker.id}`,
		"position.y",
		30,
		Animation.ANIMATIONTYPE_FLOAT,
		Animation.ANIMATIONLOOPMODE_CYCLE,
	);

	const baseY = floatHeight;
	const keys = [
		{ frame: 0, value: baseY },
		{ frame: 30, value: baseY + 0.3 },
		{ frame: 60, value: baseY },
	];
	floatAnim.setKeys(keys);
	mesh.animations.push(floatAnim);
	scene.beginAnimation(mesh, 0, 60, true);

	// Rotation animation
	const rotateAnim = new Animation(
		`rotate_${marker.id}`,
		"rotation.y",
		30,
		Animation.ANIMATIONTYPE_FLOAT,
		Animation.ANIMATIONLOOPMODE_CYCLE,
	);

	const rotKeys = [
		{ frame: 0, value: 0 },
		{ frame: 120, value: Math.PI * 2 },
	];
	rotateAnim.setKeys(rotKeys);
	mesh.animations.push(rotateAnim);
	scene.beginAnimation(mesh, 0, 120, true);

	// Pulse animation for material emissive
	const pulseAnim = new Animation(
		`pulse_${marker.id}`,
		"material.emissiveColor",
		30,
		Animation.ANIMATIONTYPE_COLOR3,
		Animation.ANIMATIONLOOPMODE_CYCLE,
	);

	const pulseKeys = [
		{ frame: 0, value: color },
		{ frame: 30, value: color.scale(1.5) },
		{ frame: 60, value: color },
	];
	pulseAnim.setKeys(pulseKeys);
	mesh.animations.push(pulseAnim);
	scene.beginAnimation(mesh, 0, 60, true);

	return mesh;
}

/**
 * Setup interaction handler for marker
 */
function setupMarkerInteraction(
	mesh: AbstractMesh,
	markerId: string,
	onInteract?: (id: string) => void,
): void {
	// Store callback for later use
	// biome-ignore lint/suspicious/noExplicitAny: storing custom property
	(mesh as any).__questMarkerId = markerId;
	// biome-ignore lint/suspicious/noExplicitAny: storing custom property
	(mesh as any).__onInteract = onInteract;
}

/**
 * Simple action manager proxy for markers
 * (Using proxy pattern since full ActionManager setup needs pointer events)
 */
class ActionManagerProxy {
	// biome-ignore lint/suspicious/noExplicitAny: any for scene
	constructor(_scene: any) {
		// Placeholder - full implementation would register pointer events
	}
}

/**
 * Data shard collectible component
 */
export interface DataShard {
	id: string;
	position: Vector3;
	collected: boolean;
}

export interface DataShardsProps {
	shards: DataShard[];
	onCollect?: (shardId: string) => void;
}

export function DataShards({ shards, onCollect }: DataShardsProps) {
	const scene = useScene();
	const meshesRef = useRef<Map<string, AbstractMesh>>(new Map());

	useEffect(() => {
		if (!scene) return;

		// Create/update shards
		for (const shard of shards) {
			if (shard.collected) {
				// Remove collected shards
				const mesh = meshesRef.current.get(shard.id);
				if (mesh) {
					mesh.dispose();
					meshesRef.current.delete(shard.id);
				}
				continue;
			}

			if (!meshesRef.current.has(shard.id)) {
				// Create new shard
				const mesh = createDataShardMesh(scene, shard);
				meshesRef.current.set(shard.id, mesh);

				// Store callback
				// biome-ignore lint/suspicious/noExplicitAny: storing custom property
				(mesh as any).__shardId = shard.id;
				// biome-ignore lint/suspicious/noExplicitAny: storing custom property
				(mesh as any).__onCollect = onCollect;
			}
		}

		return () => {
			for (const mesh of meshesRef.current.values()) {
				mesh.dispose();
			}
			meshesRef.current.clear();
		};
	}, [scene, shards, onCollect]);

	return null;
}

/**
 * Create data shard mesh
 */
function createDataShardMesh(scene: Scene, shard: DataShard): AbstractMesh {
	const mesh = MeshBuilder.CreatePolyhedron(
		`shard_${shard.id}`,
		{ type: 2, size: 0.2 }, // Icosahedron
		scene,
	);

	mesh.position = new Vector3(shard.position.x, 0.8, shard.position.z);

	// Glowing cyan material
	const material = new StandardMaterial(`shard_mat_${shard.id}`, scene);
	material.diffuseColor = new Color3(0, 0.3, 0.4);
	material.emissiveColor = new Color3(0, 0.8, 1);
	material.alpha = 0.85;
	mesh.material = material;

	// Spin animation
	const spinAnim = new Animation(
		`spin_${shard.id}`,
		"rotation.y",
		30,
		Animation.ANIMATIONTYPE_FLOAT,
		Animation.ANIMATIONLOOPMODE_CYCLE,
	);
	spinAnim.setKeys([
		{ frame: 0, value: 0 },
		{ frame: 60, value: Math.PI * 2 },
	]);
	mesh.animations.push(spinAnim);
	scene.beginAnimation(mesh, 0, 60, true);

	return mesh;
}
