/**
 * Hit detection system for combat.
 * Handles invincibility frames and hit registration logic.
 *
 * Platform-agnostic - collision detection is handled by platform-specific code.
 * This module provides the core hit registration and invincibility logic.
 */

import type { CoreEntity, InvincibilityState } from "../types/entity";
import type { Vec3 } from "../types/math";

export type { InvincibilityState };

/**
 * Hitbox configuration for attacks.
 */
export interface HitboxConfig {
	/** Duration of the hitbox in milliseconds */
	duration: number;
	/** Offset from entity position */
	offset: Vec3;
	/** Size of the hitbox (width, height, depth) */
	size: Vec3;
	/** Damage dealt by this hitbox */
	damage: number;
	/** Whether this hitbox can hit multiple targets */
	multiHit?: boolean;
	/** IDs of entities already hit by this hitbox (for multi-hit prevention) */
	hitEntities?: Set<string>;
}

/**
 * Hit registration result.
 */
export interface HitResult {
	/** Whether the hit was registered */
	registered: boolean;
	/** Reason if hit was not registered */
	reason?: "invincible" | "already_hit" | "miss" | "dead";
	/** Damage dealt (if registered) */
	damage?: number;
}

/**
 * Default invincibility duration after being hit (ms).
 */
export const DEFAULT_INVINCIBILITY_MS = 500;

/**
 * Create initial invincibility state (not invincible).
 */
export function createInvincibilityState(): InvincibilityState {
	return {
		active: false,
		remaining: 0,
		duration: 0,
	};
}

/**
 * Apply invincibility frames to an entity.
 */
export function applyInvincibilityFrames(
	durationMs: number = DEFAULT_INVINCIBILITY_MS,
): InvincibilityState {
	return {
		active: true,
		remaining: durationMs,
		duration: durationMs,
	};
}

/**
 * Check if an entity is currently invincible.
 */
export function isInvincible(
	invincibility: InvincibilityState | undefined,
): boolean {
	if (!invincibility) return false;
	return invincibility.active && invincibility.remaining > 0;
}

/**
 * Update invincibility state over time.
 */
export function updateInvincibility(
	invincibility: InvincibilityState | undefined,
	deltaTimeMs: number,
): InvincibilityState | undefined {
	if (!invincibility || !invincibility.active) return invincibility;

	const newRemaining = invincibility.remaining - deltaTimeMs;

	if (newRemaining <= 0) {
		return {
			...invincibility,
			active: false,
			remaining: 0,
		};
	}

	return {
		...invincibility,
		remaining: newRemaining,
	};
}

/**
 * Get invincibility progress as a percentage (1.0 = just started, 0.0 = ending).
 */
export function getInvincibilityProgress(
	invincibility: InvincibilityState | undefined,
): number {
	if (!invincibility || !invincibility.active || invincibility.duration === 0)
		return 0;
	return invincibility.remaining / invincibility.duration;
}

/**
 * Create a new hitbox configuration.
 */
export function createHitbox(
	offset: Vec3,
	size: Vec3,
	damage: number,
	durationMs: number,
	multiHit = false,
): HitboxConfig {
	return {
		duration: durationMs,
		offset,
		size,
		damage,
		multiHit,
		hitEntities: new Set(),
	};
}

/**
 * Check if an entity can be hit (not invincible, not dead, not already hit).
 */
export function canBeHit(
	target: CoreEntity,
	hitbox?: HitboxConfig,
): { canHit: boolean; reason?: HitResult["reason"] } {
	// Check if dead
	if ((target.health ?? 0) <= 0) {
		return { canHit: false, reason: "dead" };
	}

	// Check invincibility
	if (isInvincible(target.invincibility)) {
		return { canHit: false, reason: "invincible" };
	}

	// Check if already hit by this hitbox
	if (hitbox?.hitEntities?.has(target.id)) {
		return { canHit: false, reason: "already_hit" };
	}

	return { canHit: true };
}

/**
 * Register a hit on a target entity.
 * Returns the hit result and updated entity.
 *
 * Note: This does NOT check collision - collision detection is platform-specific.
 * Call this after confirming collision via platform-specific code.
 */
export function registerHit(
	target: CoreEntity,
	damage: number,
	invincibilityMs: number = DEFAULT_INVINCIBILITY_MS,
	hitbox?: HitboxConfig,
): { result: HitResult; entity: CoreEntity; hitbox?: HitboxConfig } {
	const { canHit, reason } = canBeHit(target, hitbox);

	if (!canHit) {
		return {
			result: { registered: false, reason },
			entity: target,
			hitbox,
		};
	}

	// Apply damage
	const currentHealth = target.health ?? 0;
	const newHealth = Math.max(0, currentHealth - damage);

	// Apply invincibility frames
	const newInvincibility = applyInvincibilityFrames(invincibilityMs);

	// Update hitbox hit tracking
	let updatedHitbox = hitbox;
	if (hitbox) {
		const newHitEntities = new Set(hitbox.hitEntities);
		newHitEntities.add(target.id);
		updatedHitbox = { ...hitbox, hitEntities: newHitEntities };
	}

	const updatedEntity: CoreEntity = {
		...target,
		health: newHealth,
		invincibility: newInvincibility,
		characterState: newHealth === 0 ? "dead" : target.characterState,
	};

	return {
		result: { registered: true, damage },
		entity: updatedEntity,
		hitbox: updatedHitbox,
	};
}

/**
 * AABB collision check (platform-agnostic math).
 * Use this for simple collision detection without engine-specific code.
 */
export function checkAABBCollision(
	pos1: Vec3,
	size1: Vec3,
	pos2: Vec3,
	size2: Vec3,
): boolean {
	const halfSize1 = { x: size1.x / 2, y: size1.y / 2, z: size1.z / 2 };
	const halfSize2 = { x: size2.x / 2, y: size2.y / 2, z: size2.z / 2 };

	const min1 = {
		x: pos1.x - halfSize1.x,
		y: pos1.y - halfSize1.y,
		z: pos1.z - halfSize1.z,
	};
	const max1 = {
		x: pos1.x + halfSize1.x,
		y: pos1.y + halfSize1.y,
		z: pos1.z + halfSize1.z,
	};

	const min2 = {
		x: pos2.x - halfSize2.x,
		y: pos2.y - halfSize2.y,
		z: pos2.z - halfSize2.z,
	};
	const max2 = {
		x: pos2.x + halfSize2.x,
		y: pos2.y + halfSize2.y,
		z: pos2.z + halfSize2.z,
	};

	return (
		min1.x <= max2.x &&
		max1.x >= min2.x &&
		min1.y <= max2.y &&
		max1.y >= min2.y &&
		min1.z <= max2.z &&
		max1.z >= min2.z
	);
}
