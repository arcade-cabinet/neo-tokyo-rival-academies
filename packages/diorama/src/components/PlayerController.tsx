/**
 * Player Controller Component
 *
 * Handles player character movement, animation state machine, and physics.
 * Integrates keyboard/touch input with character animations.
 */

import type { AbstractMesh, AnimationGroup } from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { useEffect, useRef, useState } from "react";
import { useScene } from "reactylon";
import type { CharacterAnimationController } from "./Character";

export interface PlayerControllerProps {
	/** Character meshes to control */
	characterMeshes: AbstractMesh[];
	/** Animation controller */
	animationController: CharacterAnimationController | null;
	/** Movement speed in units per second */
	speed?: number;
	/** Grid bounds for collision (outer bounds) */
	bounds?: {
		minX: number;
		maxX: number;
		minZ: number;
		maxZ: number;
	};
	/** Collision meshes that block movement (buildings, walls, etc.) */
	collisionMeshes?: AbstractMesh[];
	/** Input state from UI controls */
	inputState?: {
		up: boolean;
		down: boolean;
		left: boolean;
		right: boolean;
	};
}

/**
 * Keyboard input hook
 */
function useKeyboard() {
	const [keys, setKeys] = useState({
		w: false,
		a: false,
		s: false,
		d: false,
		up: false,
		down: false,
		left: false,
		right: false,
	});

	useEffect(() => {
		const handleDown = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			setKeys((prev) => {
				const next = { ...prev };
				if (key === "w" || key === "arrowup") {
					next.w = true;
					next.up = true;
				}
				if (key === "a" || key === "arrowleft") {
					next.a = true;
					next.left = true;
				}
				if (key === "s" || key === "arrowdown") {
					next.s = true;
					next.down = true;
				}
				if (key === "d" || key === "arrowright") {
					next.d = true;
					next.right = true;
				}
				return next;
			});
		};

		const handleUp = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			setKeys((prev) => {
				const next = { ...prev };
				if (key === "w" || key === "arrowup") {
					next.w = false;
					next.up = false;
				}
				if (key === "a" || key === "arrowleft") {
					next.a = false;
					next.left = false;
				}
				if (key === "s" || key === "arrowdown") {
					next.s = false;
					next.down = false;
				}
				if (key === "d" || key === "arrowright") {
					next.d = false;
					next.right = false;
				}
				return next;
			});
		};

		window.addEventListener("keydown", handleDown);
		window.addEventListener("keyup", handleUp);

		return () => {
			window.removeEventListener("keydown", handleDown);
			window.removeEventListener("keyup", handleUp);
		};
	}, []);

	return keys;
}

export function PlayerController({
	characterMeshes,
	animationController,
	speed = 5,
	bounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 },
	collisionMeshes = [],
	inputState,
}: PlayerControllerProps) {
	const scene = useScene();
	const keys = useKeyboard();
	const [isMoving, setIsMoving] = useState(false);
	const positionRef = useRef(new Vector3(0, 0, 0));
	const velocityRef = useRef(new Vector3(0, 0, 0));

	// Calculate bounds (add small margin)
	const maxX = bounds.maxX - 1;
	const maxZ = bounds.maxZ - 1;
	const minX = bounds.minX + 1;
	const minZ = bounds.minZ + 1;

	// Character collision radius
	const CHARACTER_RADIUS = 0.5;

	useEffect(() => {
		if (!scene || characterMeshes.length === 0) return;

		const rootMesh = characterMeshes[0];

		// Initialize position
		positionRef.current = rootMesh.position.clone();

		// Animation loop for movement
		const updateLoop = scene.onBeforeRenderObservable.add(() => {
			const deltaTime = scene.getEngine().getDeltaTime() / 1000;

			// Combine keyboard and touch input
			const moveUp = keys.w || keys.up || inputState?.up || false;
			const moveDown = keys.s || keys.down || inputState?.down || false;
			const moveLeft = keys.a || keys.left || inputState?.left || false;
			const moveRight = keys.d || keys.right || inputState?.right || false;

			// Calculate velocity
			let velX = 0;
			let velZ = 0;

			if (moveUp) velZ -= speed;
			if (moveDown) velZ += speed;
			if (moveLeft) velX -= speed;
			if (moveRight) velX += speed;

			// Normalize diagonal movement
			if (velX !== 0 && velZ !== 0) {
				const magnitude = Math.sqrt(velX * velX + velZ * velZ);
				velX = (velX / magnitude) * speed;
				velZ = (velZ / magnitude) * speed;
			}

			// Update animation state
			const moving = velX !== 0 || velZ !== 0;
			if (moving !== isMoving) {
				setIsMoving(moving);
				if (animationController) {
					if (moving) {
						animationController.play("run", true, 0.2);
					} else {
						animationController.play("combat", true, 0.2);
					}
				}
			}

			// Apply velocity with delta time
			velocityRef.current.x = velX;
			velocityRef.current.z = velZ;

			let newX = positionRef.current.x + velX * deltaTime;
			let newZ = positionRef.current.z + velZ * deltaTime;

			// Check collision with meshes (simple AABB check)
			for (const collisionMesh of collisionMeshes) {
				const bb = collisionMesh.getBoundingInfo().boundingBox;
				const minBound = bb.minimumWorld;
				const maxBound = bb.maximumWorld;

				// Expand bounds by character radius
				const expandedMinX = minBound.x - CHARACTER_RADIUS;
				const expandedMaxX = maxBound.x + CHARACTER_RADIUS;
				const expandedMinZ = minBound.z - CHARACTER_RADIUS;
				const expandedMaxZ = maxBound.z + CHARACTER_RADIUS;

				// Check if new position would collide
				if (
					newX >= expandedMinX &&
					newX <= expandedMaxX &&
					newZ >= expandedMinZ &&
					newZ <= expandedMaxZ
				) {
					// Find the axis with smallest penetration and resolve
					const distToMinX = Math.abs(newX - expandedMinX);
					const distToMaxX = Math.abs(newX - expandedMaxX);
					const distToMinZ = Math.abs(newZ - expandedMinZ);
					const distToMaxZ = Math.abs(newZ - expandedMaxZ);

					const minDist = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

					if (minDist === distToMinX) {
						newX = expandedMinX - 0.01;
					} else if (minDist === distToMaxX) {
						newX = expandedMaxX + 0.01;
					} else if (minDist === distToMinZ) {
						newZ = expandedMinZ - 0.01;
					} else {
						newZ = expandedMaxZ + 0.01;
					}
				}
			}

			// Apply boundary constraints (outer bounds)
			const clampedX = Math.max(minX, Math.min(maxX, newX));
			const clampedZ = Math.max(minZ, Math.min(maxZ, newZ));

			positionRef.current.x = clampedX;
			positionRef.current.z = clampedZ;

			// Update mesh position
			rootMesh.position.x = clampedX;
			rootMesh.position.z = clampedZ;

			// Rotate character to face movement direction
			if (velX !== 0 || velZ !== 0) {
				const targetRotation = Math.atan2(velX, velZ);
				rootMesh.rotation.y = targetRotation;
			}
		});

		return () => {
			scene.onBeforeRenderObservable.remove(updateLoop);
		};
	}, [
		scene,
		characterMeshes,
		speed,
		minX,
		maxX,
		minZ,
		maxZ,
		keys,
		inputState,
		animationController,
		isMoving,
		collisionMeshes,
	]);

	return null;
}
