/**
 * Hero - Basic character controller for testing
 *
 * Provides:
 * - Simple capsule/cylinder mesh
 * - WASD keyboard movement
 * - Jump capability
 * - Basic gravity simulation
 * - Third-person camera following
 *
 * NOT a full character - just for testing navigation and AI.
 */

import {
	type AbstractMesh,
	ArcRotateCamera,
	Color3,
	KeyboardEventTypes,
	MeshBuilder,
	PBRMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface HeroProps {
	/** Unique identifier */
	id: string;
	/** Starting position */
	position: Vector3;
	/** Character height */
	height?: number;
	/** Character radius */
	radius?: number;
	/** Movement speed (units per second) */
	speed?: number;
	/** Jump velocity */
	jumpForce?: number;
	/** Gravity strength */
	gravity?: number;
	/** Ground level (Y position) */
	groundLevel?: number;
	/** Primary color */
	color?: Color3;
	/** Accent glow color */
	glowColor?: Color3;
	/** Enable third-person camera */
	enableCamera?: boolean;
	/** Camera distance */
	cameraDistance?: number;
	/** Enable keyboard controls */
	enableControls?: boolean;
	/** Callback on position change */
	onMove?: (position: Vector3) => void;
	/** Callback when mesh is ready */
	onReady?: (mesh: AbstractMesh, controls: HeroControls) => void;
}

export interface HeroControls {
	/** Move hero to a specific position */
	moveTo: (position: Vector3) => void;
	/** Set hero velocity */
	setVelocity: (velocity: Vector3) => void;
	/** Make hero jump */
	jump: () => void;
	/** Get current position */
	getPosition: () => Vector3;
	/** Get current velocity */
	getVelocity: () => Vector3;
	/** Is hero on ground */
	isGrounded: () => boolean;
	/** Enable/disable player control */
	setControlsEnabled: (enabled: boolean) => void;
}

/**
 * Hero component
 */
export function Hero({
	id,
	position,
	height = 1.8,
	radius = 0.4,
	speed = 5,
	jumpForce = 8,
	gravity = 20,
	groundLevel = 0,
	color = new Color3(0.2, 0.3, 0.4),
	glowColor = new Color3(0, 1, 0.8),
	enableCamera = false,
	cameraDistance = 8,
	enableControls = true,
	onMove,
	onReady,
}: HeroProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh | null>(null);
	const velocityRef = useRef(new Vector3(0, 0, 0));
	const groundedRef = useRef(true);
	const inputRef = useRef({ forward: 0, right: 0, jump: false });
	const controlsEnabledRef = useRef(enableControls);
	const lastPositionRef = useRef(position.clone());

	// Controls API
	const controlsRef = useRef<HeroControls>({
		moveTo: (pos: Vector3) => {
			if (meshRef.current) {
				meshRef.current.position.copyFrom(pos);
				lastPositionRef.current.copyFrom(pos);
				onMove?.(pos);
			}
		},
		setVelocity: (vel: Vector3) => {
			velocityRef.current.copyFrom(vel);
		},
		jump: () => {
			if (groundedRef.current) {
				velocityRef.current.y = jumpForce;
				groundedRef.current = false;
			}
		},
		getPosition: () => {
			return meshRef.current?.position.clone() ?? position.clone();
		},
		getVelocity: () => {
			return velocityRef.current.clone();
		},
		isGrounded: () => {
			return groundedRef.current;
		},
		setControlsEnabled: (enabled: boolean) => {
			controlsEnabledRef.current = enabled;
			if (!enabled) {
				inputRef.current = { forward: 0, right: 0, jump: false };
			}
		},
	});

	useEffect(() => {
		if (!scene) return;

		// Create hero mesh (capsule approximation with cylinder + spheres)
		const bodyHeight = height - radius * 2;

		// Main body cylinder
		const body = MeshBuilder.CreateCylinder(
			`hero_body_${id}`,
			{
				diameter: radius * 2,
				height: bodyHeight,
				tessellation: 16,
			},
			scene,
		);

		// Top sphere
		const top = MeshBuilder.CreateSphere(
			`hero_top_${id}`,
			{
				diameter: radius * 2,
				segments: 12,
			},
			scene,
		);
		top.position.y = bodyHeight / 2;
		top.parent = body;

		// Bottom sphere
		const bottom = MeshBuilder.CreateSphere(
			`hero_bottom_${id}`,
			{
				diameter: radius * 2,
				segments: 12,
			},
			scene,
		);
		bottom.position.y = -bodyHeight / 2;
		bottom.parent = body;

		// Material
		const heroMat = new PBRMaterial(`heroMat_${id}`, scene);
		heroMat.albedoColor = color;
		heroMat.roughness = 0.6;
		heroMat.metallic = 0.3;

		body.material = heroMat;
		top.material = heroMat;
		bottom.material = heroMat;

		// Glow ring around waist
		const glowRing = MeshBuilder.CreateTorus(
			`hero_glow_${id}`,
			{
				diameter: radius * 2.2,
				thickness: 0.05,
				tessellation: 24,
			},
			scene,
		);
		glowRing.rotation.x = Math.PI / 2;
		glowRing.parent = body;

		const glowMat = new PBRMaterial(`heroGlowMat_${id}`, scene);
		glowMat.albedoColor = glowColor;
		glowMat.emissiveColor = glowColor.scale(2);
		glowMat.emissiveIntensity = 2;
		glowMat.unlit = true;
		glowRing.material = glowMat;

		// Direction indicator (front of character)
		const indicator = MeshBuilder.CreateBox(
			`hero_indicator_${id}`,
			{
				width: 0.1,
				height: 0.1,
				depth: 0.3,
			},
			scene,
		);
		indicator.position.z = radius + 0.15;
		indicator.position.y = 0;
		indicator.material = glowMat;
		indicator.parent = body;

		// Position
		body.position = position.clone();
		body.position.y += height / 2; // Offset so feet are at position

		meshRef.current = body;

		// Third-person camera
		let camera: ArcRotateCamera | null = null;
		if (enableCamera) {
			camera = new ArcRotateCamera(
				`heroCamera_${id}`,
				Math.PI / 2,
				Math.PI / 3,
				cameraDistance,
				body.position,
				scene,
			);
			camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
			camera.lowerRadiusLimit = 3;
			camera.upperRadiusLimit = 15;
			camera.lowerBetaLimit = 0.1;
			camera.upperBetaLimit = Math.PI / 2 - 0.1;
			scene.activeCamera = camera;
		}

		// Keyboard input
		const onKeyboard = scene.onKeyboardObservable.add((kbInfo) => {
			if (!controlsEnabledRef.current) return;

			const pressed = kbInfo.type === KeyboardEventTypes.KEYDOWN;
			const key = kbInfo.event.key.toLowerCase();

			switch (key) {
				case "w":
				case "arrowup":
					inputRef.current.forward = pressed ? 1 : 0;
					break;
				case "s":
				case "arrowdown":
					inputRef.current.forward = pressed ? -1 : 0;
					break;
				case "a":
				case "arrowleft":
					inputRef.current.right = pressed ? -1 : 0;
					break;
				case "d":
				case "arrowright":
					inputRef.current.right = pressed ? 1 : 0;
					break;
				case " ":
					if (pressed && groundedRef.current) {
						inputRef.current.jump = true;
					}
					break;
			}
		});

		// Update loop
		const onBeforeRender = scene.onBeforeRenderObservable.add(() => {
			const dt = scene.getEngine().getDeltaTime() / 1000;
			const mesh = meshRef.current;
			if (!mesh) return;

			// Get camera direction for movement relative to view
			let forward = new Vector3(0, 0, 1);
			let right = new Vector3(1, 0, 0);

			if (camera) {
				// Get camera forward (flattened to XZ plane)
				forward = camera.getTarget().subtract(camera.position);
				forward.y = 0;
				forward.normalize();
				right = Vector3.Cross(Vector3.Up(), forward).normalize();
			}

			// Apply input
			const moveDir = forward
				.scale(inputRef.current.forward)
				.add(right.scale(inputRef.current.right));

			if (moveDir.length() > 0) {
				moveDir.normalize();
				velocityRef.current.x = moveDir.x * speed;
				velocityRef.current.z = moveDir.z * speed;

				// Rotate to face movement direction
				const angle = Math.atan2(moveDir.x, moveDir.z);
				mesh.rotation.y = angle;
			} else {
				// Friction when not moving
				velocityRef.current.x *= 0.9;
				velocityRef.current.z *= 0.9;
			}

			// Jump
			if (inputRef.current.jump && groundedRef.current) {
				velocityRef.current.y = jumpForce;
				groundedRef.current = false;
				inputRef.current.jump = false;
			}

			// Gravity
			if (!groundedRef.current) {
				velocityRef.current.y -= gravity * dt;
			}

			// Apply velocity
			mesh.position.x += velocityRef.current.x * dt;
			mesh.position.y += velocityRef.current.y * dt;
			mesh.position.z += velocityRef.current.z * dt;

			// Ground collision
			const feetY = mesh.position.y - height / 2;
			if (feetY <= groundLevel) {
				mesh.position.y = groundLevel + height / 2;
				velocityRef.current.y = 0;
				groundedRef.current = true;
			}

			// Update camera target
			if (camera) {
				camera.target = mesh.position;
			}

			// Notify position change
			if (!mesh.position.equals(lastPositionRef.current)) {
				lastPositionRef.current.copyFrom(mesh.position);
				onMove?.(mesh.position);
			}
		});

		// Callback with controls
		if (onReady) {
			onReady(body, controlsRef.current);
		}

		return () => {
			scene.onKeyboardObservable.remove(onKeyboard);
			scene.onBeforeRenderObservable.remove(onBeforeRender);
			if (camera) {
				camera.dispose();
			}
			glowRing.dispose();
			indicator.dispose();
			top.dispose();
			bottom.dispose();
			body.dispose();
			meshRef.current = null;
		};
	}, [
		scene,
		id,
		position,
		height,
		radius,
		speed,
		jumpForce,
		gravity,
		groundLevel,
		color,
		glowColor,
		enableCamera,
		cameraDistance,
		enableControls,
		onMove,
		onReady,
	]);

	return null;
}

export default Hero;
