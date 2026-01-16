/**
 * Perception System
 *
 * Implements vision cone and line of sight detection for AI.
 */

import type { Scene } from '@babylonjs/core';
import { Ray, Vector3 } from '@babylonjs/core';

export interface VisionConfig {
  fov: number; // Field of view in radians
  range: number; // Detection range
  position: Vector3;
  direction: Vector3;
}

/**
 * Check if target is within vision cone
 */
export function isInVisionCone(target: Vector3, vision: VisionConfig): boolean {
  const toTarget = target.subtract(vision.position);
  const distance = toTarget.length();

  // Check range
  if (distance > vision.range) {
    return false;
  }

  // Check angle
  toTarget.normalize();
  const angle = Math.acos(Vector3.Dot(vision.direction, toTarget));

  return angle <= vision.fov / 2;
}

/**
 * Check line of sight with raycasting
 */
export function hasLineOfSight(
  from: Vector3,
  to: Vector3,
  scene: Scene,
  maxDistance: number
): boolean {
  const direction = to.subtract(from);
  const distance = direction.length();

  if (distance > maxDistance) {
    return false;
  }

  direction.normalize();

  const ray = new Ray(from, direction, distance);
  const hit = scene.pickWithRay(ray);

  // If no hit or hit is beyond target, LOS is clear
  return !hit || !hit.hit || hit.distance >= distance;
}

/**
 * Get all targets within vision cone
 */
export function getVisibleTargets(
  targets: Vector3[],
  vision: VisionConfig,
  scene: Scene | null
): Vector3[] {
  const visible: Vector3[] = [];

  for (const target of targets) {
    if (isInVisionCone(target, vision)) {
      // Check LOS if scene provided
      if (!scene || hasLineOfSight(vision.position, target, scene, vision.range)) {
        visible.push(target);
      }
    }
  }

  return visible;
}

/**
 * Calculate vision direction from rotation
 */
export function getVisionDirection(rotationY: number): Vector3 {
  return new Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
}
