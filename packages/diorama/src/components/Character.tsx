/**
 * Character Component
 *
 * Loads rigged GLB character model with skeletal animations.
 * Handles animation blending and playback.
 */

import type { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import "@babylonjs/loaders/glTF";
import { useEffect, useRef, useState } from "react";
import { useScene } from "reactylon";

export interface CharacterProps {
	/** Path to the primary GLB model */
	modelPath: string;
	/** Additional animation GLB files to load */
	animationPaths?: string[];
	/** Initial position in world space */
	position?: Vector3;
	/** Scale factor */
	scale?: number;
	/** Initial animation to play */
	initialAnimation?: string;
	/** Whether character should cast shadows */
	castShadow?: boolean;
	/** Callback when model is loaded */
	onLoaded?: (meshes: AbstractMesh[], animations: AnimationGroup[]) => void;
}

export function Character({
	modelPath,
	animationPaths = [],
	position = new Vector3(0, 0, 0),
	scale = 1,
	initialAnimation,
	castShadow = true,
	onLoaded,
}: CharacterProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);
	const animationsRef = useRef<AnimationGroup[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (!scene) return;

		let disposed = false;

		const loadCharacter = async () => {
			try {
				// Load primary model
				const result = await SceneLoader.ImportMeshAsync(
					"",
					"",
					modelPath,
					scene,
				);

				if (disposed) {
					// Clean up if component unmounted during load
					for (const m of result.meshes) m.dispose();
					for (const a of result.animationGroups) a.dispose();
					return;
				}

				const rootMesh = result.meshes[0];
				rootMesh.position = position;
				rootMesh.scaling = new Vector3(scale, scale, scale);

				// Enable shadows
				if (castShadow) {
					for (const mesh of result.meshes) {
						mesh.receiveShadows = true;
						// Note: Shadow casting enabled via shadowGenerator in scene
					}
				}

				// Store loaded animations
				const allAnimations = [...result.animationGroups];

				// Load additional animation files
				for (const animPath of animationPaths) {
					const animResult = await SceneLoader.ImportMeshAsync(
						"",
						"",
						animPath,
						scene,
					);

					if (disposed) {
						for (const m of animResult.meshes) m.dispose();
						for (const a of animResult.animationGroups) a.dispose();
						return;
					}

					// Retarget animations to the main skeleton
					const targetSkeleton = result.skeletons[0];
					if (targetSkeleton && animResult.skeletons[0]) {
						for (const animGroup of animResult.animationGroups) {
							// Clone animation group and retarget to main mesh
							const clonedGroup = animGroup.clone(
								animGroup.name,
								(oldTarget) => {
									// Find matching bone in target skeleton
									if (oldTarget.name) {
										const bone = targetSkeleton.bones.find(
											(b) => b.name === oldTarget.name,
										);
										if (bone) return bone;
									}
									return oldTarget;
								},
							);
							allAnimations.push(clonedGroup);
						}
					}

					// Dispose temporary meshes from animation files
					for (const m of animResult.meshes) m.dispose();
				}

				meshesRef.current = result.meshes;
				animationsRef.current = allAnimations;

				// Play initial animation if specified
				if (initialAnimation) {
					const anim = findAnimationByPattern(allAnimations, initialAnimation);
					if (anim) {
						anim.play(true); // Loop
					}
				}

				setIsLoaded(true);
				onLoaded?.(result.meshes, allAnimations);
			} catch (error) {
				console.error("Failed to load character:", error);
			}
		};

		loadCharacter();

		return () => {
			disposed = true;
			// Clean up meshes and animations
			for (const mesh of meshesRef.current) mesh.dispose();
			for (const anim of animationsRef.current) anim.dispose();
			meshesRef.current = [];
			animationsRef.current = [];
		};
	}, [
		scene,
		modelPath,
		animationPaths,
		position,
		scale,
		initialAnimation,
		castShadow,
		onLoaded,
	]);

	// This component doesn't render JSX - it imperatively creates Babylon objects
	return isLoaded ? null : null;
}

/**
 * Helper to find animation by name pattern (case-insensitive substring match)
 */
function findAnimationByPattern(
	animations: AnimationGroup[],
	pattern: string,
): AnimationGroup | null {
	const match = animations.find((anim) =>
		anim.name.toLowerCase().includes(pattern.toLowerCase()),
	);
	return match || null;
}

/**
 * Animation controller helper for character animation management
 */
export class CharacterAnimationController {
	private animations: Map<string, AnimationGroup> = new Map();
	private currentAnimation: AnimationGroup | null = null;

	constructor(animationGroups: AnimationGroup[]) {
		for (const anim of animationGroups) {
			this.animations.set(anim.name.toLowerCase(), anim);
		}
	}

	/**
	 * Play animation with optional cross-fade
	 */
	play(pattern: string, loop = true, _fadeTime = 0.2): boolean {
		const anim = this.findByPattern(pattern);
		if (!anim) return false;

		if (this.currentAnimation && this.currentAnimation !== anim) {
			// Cross-fade from current to new animation
			this.currentAnimation.stop();
			anim.start(loop, 1.0, anim.from, anim.to, false);
		} else {
			anim.play(loop);
		}

		this.currentAnimation = anim;
		return true;
	}

	/**
	 * Stop current animation
	 */
	stop(): void {
		this.currentAnimation?.stop();
		this.currentAnimation = null;
	}

	private findByPattern(pattern: string): AnimationGroup | null {
		const lowerPattern = pattern.toLowerCase();
		for (const [name, anim] of this.animations) {
			if (name.includes(lowerPattern)) {
				return anim;
			}
		}
		return null;
	}
}
