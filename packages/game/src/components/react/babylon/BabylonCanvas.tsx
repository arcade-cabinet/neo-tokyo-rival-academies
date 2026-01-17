/**
 * BabylonCanvas Component
 *
 * Wraps Reactylon Engine and Scene components for Babylon.js rendering.
 */

// Import Babylon core modules to ensure they're available
import "@babylonjs/core/Engines/engine";
import "@babylonjs/core/scene";
import type { Scene as BabylonScene } from "@babylonjs/core";
import type { ReactNode } from "react";
import { Scene } from "reactylon";
import { Engine } from "reactylon/web";

export interface BabylonCanvasProps {
	children: ReactNode;
	antialias?: boolean;
	adaptToDeviceRatio?: boolean;
	onSceneReady?: (scene: BabylonScene) => void;
}

export function BabylonCanvas({
	children,
	antialias = true,
	adaptToDeviceRatio = true,
	onSceneReady,
}: BabylonCanvasProps) {
	return (
		<Engine engineOptions={{ antialias, adaptToDeviceRatio }} forceWebGL={true}>
			<Scene onSceneReady={onSceneReady}>{children}</Scene>
		</Engine>
	);
}
