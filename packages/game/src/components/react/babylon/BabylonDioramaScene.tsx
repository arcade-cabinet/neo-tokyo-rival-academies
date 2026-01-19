/**
 * BabylonDioramaScene Component
 *
 * Complete isometric diorama scene with:
 * - Layer 1: Foreground (hex floor, props, character, quest markers)
 * - Layer 2: Midground (building facades, neon signs)
 * - Layer 3: Background (parallax cityscape panels)
 */

import { Color3, HemisphericLight, Vector3 } from "@babylonjs/core";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useScene } from "reactylon";
import { BabylonCanvas } from "./BabylonCanvas";
import {
	BackgroundPanels,
	Character,
	CharacterAnimationController,
	CyberpunkNeonLights,
	DataShards,
	DirectionalLightWithShadows,
	ForegroundProps,
	HexTileFloor,
	IsometricCamera,
	MidgroundFacades,
	PlayerController,
	QuestMarkers,
} from "@neo-tokyo/diorama";
import type { AbstractMesh, AnimationGroup } from "@babylonjs/core";
import type { QuestMarker, DataShard } from "@neo-tokyo/diorama";

export interface BabylonDioramaSceneProps {
	children?: ReactNode;
	/** Input state from UI controls */
	inputState?: {
		up: boolean;
		down: boolean;
		left: boolean;
		right: boolean;
	};
}

// Scene bounds constant
const SCENE_BOUNDS = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };

function SceneContent({ children, inputState }: { children?: ReactNode; inputState?: BabylonDioramaSceneProps["inputState"] }) {
	const scene = useScene();
	const lightRef = useRef<HemisphericLight | null>(null);
	const [characterMeshes, setCharacterMeshes] = useState<AbstractMesh[]>([]);
	const [animationController, setAnimationController] = useState<CharacterAnimationController | null>(null);
	const [collectedShards, setCollectedShards] = useState<Set<string>>(new Set());

	// Quest markers for this scene (tutorial objectives)
	const questMarkers = useMemo<QuestMarker[]>(() => [
		{
			id: "tutorial_start",
			position: new Vector3(0, 0, 5),
			type: "objective",
			label: "Talk to Vera",
			active: true,
		},
		{
			id: "exit_north",
			position: new Vector3(0, 0, -18),
			type: "exit",
			label: "Exit to Sector 7",
			active: true,
		},
	], []);

	// Data shards scattered around the scene
	const dataShards = useMemo<DataShard[]>(() => [
		{ id: "shard_1", position: new Vector3(-8, 0, -5), collected: collectedShards.has("shard_1") },
		{ id: "shard_2", position: new Vector3(12, 0, 3), collected: collectedShards.has("shard_2") },
		{ id: "shard_3", position: new Vector3(-3, 0, -12), collected: collectedShards.has("shard_3") },
		{ id: "shard_4", position: new Vector3(7, 0, -8), collected: collectedShards.has("shard_4") },
	], [collectedShards]);

	// Setup ambient lighting in useEffect to avoid re-creating on every render
	useEffect(() => {
		if (!scene) return;

		// Skip if light already exists
		if (lightRef.current) return;

		// Hemispheric light for ambient fill (reduced intensity with directional light)
		const light = new HemisphericLight(
			"hemisphericLight",
			new Vector3(0, 1, 0),
			scene,
		);
		light.intensity = 0.5; // Lower ambient with directional light
		light.diffuse = new Color3(1, 1, 1);
		light.specular = new Color3(0, 0, 0); // No specular for flat look
		lightRef.current = light;

		// Set clear color to dark blue for cyberpunk aesthetic
		scene.clearColor = new Color3(0.02, 0.02, 0.08).toColor4(1);

		return () => {
			if (lightRef.current) {
				lightRef.current.dispose();
				lightRef.current = null;
			}
		};
	}, [scene]);

	// Character load callback
	const handleCharacterLoaded = (meshes: AbstractMesh[], animations: AnimationGroup[]) => {
		setCharacterMeshes(meshes);
		const controller = new CharacterAnimationController(animations);
		setAnimationController(controller);

		// Play initial idle animation
		controller.play("combat", true);
	};

	// Quest marker interaction
	const handleMarkerInteract = (markerId: string) => {
		console.log("Quest marker interaction:", markerId);
		// TODO: Trigger dialogue or scene transition based on marker
	};

	// Data shard collection
	const handleShardCollect = (shardId: string) => {
		console.log("Collected shard:", shardId);
		setCollectedShards((prev) => new Set([...prev, shardId]));
	};

	// Don't render children until scene is ready
	if (!scene) return null;

	return (
		<>
			{/* Camera */}
			<IsometricCamera
				target={new Vector3(0, 0, 0)}
				radius={30}
				orthoSize={21}
			/>

			{/* Directional light with shadows */}
			<DirectionalLightWithShadows
				position={new Vector3(15, 25, 10)}
				intensity={1.2}
				shadowMapSize={2048}
				shadowCasters={characterMeshes}
			/>

			{/* Neon accent lights */}
			<CyberpunkNeonLights />

			{/* Environment */}
			<HexTileFloor
				seed="neo-tokyo-default"
				cols={10}
				rows={10}
				bounds={{ minX: -20, maxX: 20, minZ: -20, maxZ: 20 }}
				debug={false}
			/>
			<BackgroundPanels minX={-20} maxX={20} height={30} theme="neon" />

			{/* Character */}
			<Character
				modelPath="/assets/characters/main/kai/animations/combat_stance.glb"
				animationPaths={[
					"/assets/characters/main/kai/animations/runfast.glb",
				]}
				position={new Vector3(0, 0, 0)}
				scale={1}
				initialAnimation="combat"
				castShadow={true}
				onLoaded={handleCharacterLoaded}
			/>

			{/* Player movement controller */}
			{characterMeshes.length > 0 && animationController && (
				<PlayerController
					characterMeshes={characterMeshes}
					animationController={animationController}
					speed={5}
					bounds={{ minX: -20, maxX: 20, minZ: -20, maxZ: 20 }}
					inputState={inputState}
				/>
			)}

			{children}
		</>
	);
}

export function BabylonDioramaScene({ children, inputState }: BabylonDioramaSceneProps) {
	return (
		<div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
			<BabylonCanvas>
				<SceneContent inputState={inputState}>{children}</SceneContent>
			</BabylonCanvas>
		</div>
	);
}
