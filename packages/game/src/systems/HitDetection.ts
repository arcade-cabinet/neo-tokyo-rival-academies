import type { AbstractMesh } from '@babylonjs/core';
import type { ECSEntity } from '@/state/ecs';

/**
 * Hit detection system for combat.
 * Handles collision-based hit registration, attack hitbox timing, and invincibility frames.
 */

export interface HitboxConfig {
  /** Duration of the hitbox in milliseconds */
  duration: number;
  /** Offset from entity position */
  offset: { x: number; y: number; z: number };
  /** Size of the hitbox */
  size: { width: number; height: number; depth: number };
}

export interface InvincibilityState {
  /** Whether entity is currently invincible */
  isInvincible: boolean;
  /** Timestamp when invincibility ends */
  endsAt: number;
}

/**
 * Check if two meshes are colliding using bounding box intersection.
 */
export function checkCollision(mesh1: AbstractMesh, mesh2: AbstractMesh): boolean {
  if (!mesh1 || !mesh2) return false;

  const bounds1 = mesh1.getBoundingInfo();
  const bounds2 = mesh2.getBoundingInfo();

  return bounds1.intersects(bounds2.boundingBox, true);
}

/**
 * Check if an attack hitbox overlaps with a target entity.
 *
 * @param attackerMesh - The attacker's mesh
 * @param targetMesh - The target's mesh
 * @param hitboxConfig - Configuration for the attack hitbox
 * @returns True if the hitbox overlaps the target
 */
export function checkHitboxOverlap(
  attackerMesh: AbstractMesh,
  targetMesh: AbstractMesh,
  hitboxConfig: HitboxConfig
): boolean {
  if (!attackerMesh || !targetMesh) return false;

  // Get attacker position
  const attackerPos = attackerMesh.position;

  // Calculate hitbox position with offset
  const hitboxPos = {
    x: attackerPos.x + hitboxConfig.offset.x,
    y: attackerPos.y + hitboxConfig.offset.y,
    z: attackerPos.z + hitboxConfig.offset.z,
  };

  // Get target bounds
  const targetBounds = targetMesh.getBoundingInfo().boundingBox;
  const targetMin = targetBounds.minimumWorld;
  const targetMax = targetBounds.maximumWorld;

  // Calculate hitbox bounds
  const hitboxMin = {
    x: hitboxPos.x - hitboxConfig.size.width / 2,
    y: hitboxPos.y - hitboxConfig.size.height / 2,
    z: hitboxPos.z - hitboxConfig.size.depth / 2,
  };

  const hitboxMax = {
    x: hitboxPos.x + hitboxConfig.size.width / 2,
    y: hitboxPos.y + hitboxConfig.size.height / 2,
    z: hitboxPos.z + hitboxConfig.size.depth / 2,
  };

  // Check AABB intersection
  return (
    hitboxMin.x <= targetMax.x &&
    hitboxMax.x >= targetMin.x &&
    hitboxMin.y <= targetMax.y &&
    hitboxMax.y >= targetMin.y &&
    hitboxMin.z <= targetMax.z &&
    hitboxMax.z >= targetMin.z
  );
}

/**
 * Apply invincibility frames to an entity.
 *
 * @param durationMs - Duration of invincibility in milliseconds
 * @returns Invincibility state
 */
export function applyInvincibilityFrames(durationMs: number): InvincibilityState {
  const now = Date.now();
  return {
    isInvincible: true,
    endsAt: now + durationMs,
  };
}

/**
 * Check if an entity is currently invincible.
 *
 * @param invincibilityState - The entity's invincibility state
 * @returns True if the entity is invincible
 */
export function isInvincible(invincibilityState: InvincibilityState | undefined): boolean {
  if (!invincibilityState) return false;

  const now = Date.now();
  return invincibilityState.isInvincible && now < invincibilityState.endsAt;
}

/**
 * Update invincibility state, clearing it if expired.
 *
 * @param invincibilityState - The entity's invincibility state
 * @returns Updated invincibility state
 */
export function updateInvincibilityState(
  invincibilityState: InvincibilityState | undefined
): InvincibilityState | undefined {
  if (!invincibilityState) return undefined;

  const now = Date.now();
  if (now >= invincibilityState.endsAt) {
    return undefined; // Invincibility expired
  }

  return invincibilityState;
}

/**
 * Register a hit on a target entity.
 *
 * @param attacker - The attacking entity
 * @param target - The target entity
 * @param damage - Amount of damage to deal
 * @param invincibilityDurationMs - Duration of invincibility frames after hit
 * @returns True if the hit was registered, false if target was invincible
 */
export function registerHit(
  _attacker: ECSEntity,
  target: ECSEntity,
  damage: number,
  invincibilityDurationMs: number = 500
): boolean {
  // Don't register hit if target is invincible
  if (isInvincible(target.invincibility)) {
    return false;
  }

  // Apply damage
  if (target.health !== undefined) {
    target.health = Math.max(0, target.health - damage);
  }

  // Apply invincibility frames
  target.invincibility = applyInvincibilityFrames(invincibilityDurationMs);

  return true;
}