/**
 * Platform-agnostic math types for game logic.
 * These abstract away Babylon.js/Three.js specific implementations.
 */

/**
 * 3D Vector interface compatible with any 3D engine.
 * Implementations should provide adapters for Babylon.Vector3, Three.Vector3, etc.
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Create a new Vec3
 */
export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

/**
 * Vector operations - pure functions for ECS systems
 */
export const Vec3Math = {
  add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },

  subtract(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },

  scale(v: Vec3, s: number): Vec3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },

  dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  },

  cross(a: Vec3, b: Vec3): Vec3 {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  },

  length(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  lengthSquared(v: Vec3): number {
    return v.x * v.x + v.y * v.y + v.z * v.z;
  },

  normalize(v: Vec3): Vec3 {
    const len = Vec3Math.length(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return Vec3Math.scale(v, 1 / len);
  },

  distance(a: Vec3, b: Vec3): number {
    return Vec3Math.length(Vec3Math.subtract(a, b));
  },

  distanceSquared(a: Vec3, b: Vec3): number {
    return Vec3Math.lengthSquared(Vec3Math.subtract(a, b));
  },

  lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  },

  clone(v: Vec3): Vec3 {
    return { x: v.x, y: v.y, z: v.z };
  },

  zero(): Vec3 {
    return { x: 0, y: 0, z: 0 };
  },

  equals(a: Vec3, b: Vec3, epsilon = 0.0001): boolean {
    return (
      Math.abs(a.x - b.x) < epsilon &&
      Math.abs(a.y - b.y) < epsilon &&
      Math.abs(a.z - b.z) < epsilon
    );
  },
};

/**
 * 2D Vector for UI and hex grid calculations
 */
export interface Vec2 {
  x: number;
  y: number;
}

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export const Vec2Math = {
  add(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  subtract(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  scale(v: Vec2, s: number): Vec2 {
    return { x: v.x * s, y: v.y * s };
  },

  length(v: Vec2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  normalize(v: Vec2): Vec2 {
    const len = Vec2Math.length(v);
    if (len === 0) return { x: 0, y: 0 };
    return Vec2Math.scale(v, 1 / len);
  },

  distance(a: Vec2, b: Vec2): number {
    return Vec2Math.length(Vec2Math.subtract(a, b));
  },
};
