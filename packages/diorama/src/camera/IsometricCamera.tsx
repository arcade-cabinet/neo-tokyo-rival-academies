/**
 * IsometricCamera Component
 *
 * Configures ArcRotateCamera for isometric diorama view.
 * Matches Three.js camera angles: alpha=π/4, beta=π/3
 */

import { ArcRotateCamera, Vector3 } from "@babylonjs/core";
import { CAMERA } from "@neo-tokyo/config";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface IsometricCameraProps {
	/** Target position to look at */
	target?: Vector3;
	/** Camera distance from target */
	radius?: number;
	/** Orthographic zoom level */
	orthoSize?: number;
	/** Minimum zoom */
	minOrthoSize?: number;
	/** Maximum zoom */
	maxOrthoSize?: number;
}

export function IsometricCamera({
	target = new Vector3(0, 0, 0),
	radius = CAMERA.defaultRadius,
	orthoSize = CAMERA.orthoSize,
	minOrthoSize = CAMERA.minOrthoSize,
	maxOrthoSize = CAMERA.maxOrthoSize,
}: IsometricCameraProps) {
	const scene = useScene();
	const cameraRef = useRef<ArcRotateCamera | null>(null);

	useEffect(() => {
		if (!scene) return;

		// Create ArcRotateCamera
		// alpha = π/4 (45° rotation around Y axis)
		// beta = π/3 (~60° elevation)
		const camera = new ArcRotateCamera(
			"isometricCamera",
			Math.PI / 4, // alpha: 45° rotation
			Math.PI / 3, // beta: 60° elevation
			radius,
			target,
			scene,
		);

		// Enable orthographic mode for isometric projection
		camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;

		// Set orthographic bounds
		const aspectRatio =
			scene.getEngine().getRenderWidth() / scene.getEngine().getRenderHeight();
		camera.orthoLeft = -orthoSize * aspectRatio;
		camera.orthoRight = orthoSize * aspectRatio;
		camera.orthoTop = orthoSize;
		camera.orthoBottom = -orthoSize;

		// Configure zoom limits
		camera.lowerRadiusLimit = radius * 0.5;
		camera.upperRadiusLimit = radius * 2;

		// Store zoom bounds for future use
		const _zoomBounds = { min: minOrthoSize, max: maxOrthoSize };

		// Disable rotation (fixed isometric view)
		camera.inputs.clear();

		// Attach camera to canvas
		camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

		// Set as active camera
		scene.activeCamera = camera;
		cameraRef.current = camera;

		// Handle resize to maintain aspect ratio
		const handleResize = () => {
			const newAspectRatio =
				scene.getEngine().getRenderWidth() /
				scene.getEngine().getRenderHeight();
			camera.orthoLeft = -orthoSize * newAspectRatio;
			camera.orthoRight = orthoSize * newAspectRatio;
		};

		scene.getEngine().onResizeObservable.add(handleResize);

		return () => {
			scene.getEngine().onResizeObservable.removeCallback(handleResize);
			camera.dispose();
			cameraRef.current = null;
		};
	}, [scene, target, radius, orthoSize, minOrthoSize, maxOrthoSize]);

	return null; // Camera is managed imperatively
}
