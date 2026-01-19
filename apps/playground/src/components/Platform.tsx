/**
 * Platform - Rideable surface that can follow a rail path
 *
 * Reusable for:
 * - Ferry decks
 * - Elevator cars
 * - Moving walkways
 * - Gondola floors
 * - Any moving platform
 *
 * Can be static (bridge) or animated (following a rail).
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
	Path3D,
	type AbstractMesh,
	Animation,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface PlatformProps {
	/** Unique identifier */
	id: string;
	/** Platform position (if static) or starting position (if animated) */
	position: Vector3;
	/** Platform dimensions */
	size: { width: number; length: number; height?: number };
	/** Platform style */
	style?: "metal" | "wood" | "glass" | "concrete";
	/** Edge railings */
	railings?: boolean;
	/** Neon edge lighting */
	neonEdge?: Color3 | null;
	/** Animation: path to follow */
	path?: Path3D | null;
	/** Animation: travel time in seconds (one way) */
	travelTime?: number;
	/** Animation: auto-start movement */
	autoStart?: boolean;
	/** Animation: loop back and forth */
	pingPong?: boolean;
	/** Callback when mesh is ready */
	onReady?: (mesh: AbstractMesh) => void;
	/** Callback with animation controls */
	onAnimationReady?: (controls: PlatformAnimationControls) => void;
}

export interface PlatformAnimationControls {
	start: () => void;
	stop: () => void;
	pause: () => void;
	resume: () => void;
	setProgress: (t: number) => void; // 0-1
	getProgress: () => number;
}

// Style colors
const STYLE_COLORS = {
	metal: { base: new Color3(0.3, 0.32, 0.35), roughness: 0.4 },
	wood: { base: new Color3(0.4, 0.3, 0.2), roughness: 0.7 },
	glass: { base: new Color3(0.2, 0.3, 0.4), roughness: 0.1 },
	concrete: { base: new Color3(0.4, 0.4, 0.42), roughness: 0.8 },
};

/**
 * Platform component
 */
export function Platform({
	id,
	position,
	size,
	style = "metal",
	railings = true,
	neonEdge = null,
	path = null,
	travelTime = 5,
	autoStart = false,
	pingPong = true,
	onReady,
	onAnimationReady,
}: PlatformProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);
	const animationRef = useRef<Animation | null>(null);
	const progressRef = useRef(0);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const platformHeight = size.height ?? 0.15;
		const styleConfig = STYLE_COLORS[style];

		// Main platform deck
		const deck = MeshBuilder.CreateBox(
			`platform_${id}`,
			{
				width: size.width,
				height: platformHeight,
				depth: size.length,
			},
			scene
		);

		deck.position = position.clone();
		deck.position.y += platformHeight / 2;

		// Material
		const deckMat = new PBRMaterial(`platformMat_${id}`, scene);
		deckMat.albedoColor = styleConfig.base;
		deckMat.roughness = styleConfig.roughness;
		deckMat.metallic = style === "metal" ? 0.6 : 0.1;

		if (style === "glass") {
			deckMat.alpha = 0.6;
			deckMat.transparencyMode = 2;
		}

		deck.material = deckMat;
		meshes.push(deck);

		// Railings
		if (railings) {
			const railHeight = 1.0;
			const railThickness = 0.05;

			// Four corner posts
			const corners = [
				[-size.width / 2 + railThickness, -size.length / 2 + railThickness],
				[size.width / 2 - railThickness, -size.length / 2 + railThickness],
				[-size.width / 2 + railThickness, size.length / 2 - railThickness],
				[size.width / 2 - railThickness, size.length / 2 - railThickness],
			];

			const railMat = new PBRMaterial(`railMat_${id}`, scene);
			railMat.albedoColor = new Color3(0.25, 0.25, 0.28);
			railMat.metallic = 0.7;
			railMat.roughness = 0.3;

			corners.forEach(([x, z], i) => {
				const post = MeshBuilder.CreateCylinder(
					`post_${id}_${i}`,
					{ diameter: railThickness * 2, height: railHeight },
					scene
				);
				post.position = new Vector3(
					position.x + x,
					position.y + platformHeight + railHeight / 2,
					position.z + z
				);
				post.material = railMat;
				post.parent = deck;
				meshes.push(post);
			});

			// Horizontal rails
			const railPositions = [
				{ start: corners[0], end: corners[1], axis: "x" },
				{ start: corners[2], end: corners[3], axis: "x" },
				{ start: corners[0], end: corners[2], axis: "z" },
				{ start: corners[1], end: corners[3], axis: "z" },
			];

			railPositions.forEach(({ start, end, axis }, i) => {
				const length = axis === "x" ? size.width : size.length;
				const rail = MeshBuilder.CreateBox(
					`rail_${id}_${i}`,
					{
						width: axis === "x" ? length : railThickness,
						height: railThickness,
						depth: axis === "z" ? length : railThickness,
					},
					scene
				);
				rail.position = new Vector3(
					position.x + (start[0] + end[0]) / 2,
					position.y + platformHeight + railHeight,
					position.z + (start[1] + end[1]) / 2
				);
				rail.material = railMat;
				rail.parent = deck;
				meshes.push(rail);
			});
		}

		// Neon edge lighting
		if (neonEdge) {
			const neonHeight = 0.06;
			const neonInset = 0.02;

			// Edge strips on all four sides
			const edges = [
				{ w: size.width, d: neonHeight, x: 0, z: -size.length / 2 + neonInset },
				{ w: size.width, d: neonHeight, x: 0, z: size.length / 2 - neonInset },
				{ w: neonHeight, d: size.length, x: -size.width / 2 + neonInset, z: 0 },
				{ w: neonHeight, d: size.length, x: size.width / 2 - neonInset, z: 0 },
			];

			const neonMat = new PBRMaterial(`neonMat_${id}`, scene);
			neonMat.albedoColor = neonEdge;
			neonMat.emissiveColor = neonEdge.scale(2.5);
			neonMat.emissiveIntensity = 3.0;
			neonMat.unlit = true;

			edges.forEach(({ w, d, x, z }, i) => {
				const strip = MeshBuilder.CreateBox(
					`neon_${id}_${i}`,
					{ width: w, height: neonHeight, depth: d },
					scene
				);
				strip.position = new Vector3(
					position.x + x,
					position.y + platformHeight + neonHeight / 2,
					position.z + z
				);
				strip.material = neonMat;
				strip.parent = deck;
				meshes.push(strip);
			});
		}

		meshesRef.current = meshes;

		// Path animation setup
		if (path) {
			const pathPoints = path.getCurve();
			const frameRate = 60;
			const totalFrames = travelTime * frameRate;

			// Create position animation
			const posAnim = new Animation(
				`platformAnim_${id}`,
				"position",
				frameRate,
				Animation.ANIMATIONTYPE_VECTOR3,
				pingPong
					? Animation.ANIMATIONLOOPMODE_YOYO
					: Animation.ANIMATIONLOOPMODE_CYCLE
			);

			// Generate keyframes along path
			const keyframes = pathPoints.map((point, i) => ({
				frame: (i / (pathPoints.length - 1)) * totalFrames,
				value: point.clone(),
			}));

			posAnim.setKeys(keyframes);
			deck.animations = [posAnim];
			animationRef.current = posAnim;

			// Animation controls
			const controls: PlatformAnimationControls = {
				start: () => {
					scene.beginAnimation(deck, 0, totalFrames, true);
				},
				stop: () => {
					scene.stopAnimation(deck);
					deck.position = pathPoints[0].clone();
				},
				pause: () => {
					scene.stopAnimation(deck);
				},
				resume: () => {
					const currentFrame = progressRef.current * totalFrames;
					scene.beginAnimation(deck, currentFrame, totalFrames, true);
				},
				setProgress: (t: number) => {
					const clampedT = Math.max(0, Math.min(1, t));
					const index = Math.floor(clampedT * (pathPoints.length - 1));
					deck.position = pathPoints[index].clone();
					progressRef.current = clampedT;
				},
				getProgress: () => progressRef.current,
			};

			if (onAnimationReady) {
				onAnimationReady(controls);
			}

			if (autoStart) {
				controls.start();
			}
		}

		if (onReady) {
			onReady(deck);
		}

		return () => {
			scene.stopAnimation(meshesRef.current[0]);
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			meshesRef.current = [];
		};
	}, [scene, id, position, size, style, railings, neonEdge, path, travelTime, autoStart, pingPong, onReady, onAnimationReady]);

	return null;
}

export default Platform;
