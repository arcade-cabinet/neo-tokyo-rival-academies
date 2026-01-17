/**
 * BabylonDioramaScene Component
 *
 * Complete isometric diorama scene with camera, lighting, hex floor, background panels,
 * and character rendering.
 */

import { Color3, HemisphericLight, Vector3 } from "@babylonjs/core";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useScene } from "reactylon";
import { BabylonCanvas } from "./BabylonCanvas";
import {
	BackgroundPanels,
	Character,
	CharacterAnimationController,
	CyberpunkNeonLights,
	DirectionalLightWithShadows,
	HexTileFloor,
	IsometricCamera,
} from "@neo-tokyo/diorama";
import type { AbstractMesh, AnimationGroup } from "@babylonjs/core";

export interface BabylonDioramaSceneProps {
	children?: ReactNode;
}

function SceneContent({ children }: { children?: ReactNode }) {
	const scene = useScene();
	const lightRef = useRef<HemisphericLight | null>(null);
	const [characterMeshes, setCharacterMeshes] = useState<AbstractMesh[]>([]);
	const [animationController, setAnimationController] = useState<CharacterAnimationController | null>(null);

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

			{children}
		</>
	);
}

export function BabylonDioramaScene({ children }: BabylonDioramaSceneProps) {
	return (
		<div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
			<BabylonCanvas>
				<SceneContent>{children}</SceneContent>
			</BabylonCanvas>
		</div>
	);
}
