import type { ECSEntity } from '../state/ecs';

/**
 * Break system for combat.
 * Enemies have a stability gauge that depletes when hit.
 * When stability reaches 0, enemy enters "broken" state where all attacks are critical.
 */

export interface StabilityState {
  /** Current stability value */
  current: number;
  /** Maximum stability value */
  max: number;
  /** Stability regeneration rate per second */
  regenRate: number;
  /** Timestamp of last hit */
  lastHitTime: number;
}

export interface BreakState {
  /** Whether entity is currently broken */
  isBroken: boolean;
  /** Timestamp when break state ends */
  endsAt: number;
}

/**
 * Initialize stability state for an entity.
 *
 * @param entityType - Type of entity (grunt, boss, etc.)
 * @returns Initial stability state
 */
export function initializeStability(entityType: 'grunt' | 'boss' | 'player'): StabilityState {
  const stabilityValues = {
    grunt: 100,
    boss: 500,
    player: 200,
  };

  const regenRates = {
    grunt: 10, // 10 stability per second
    boss: 20, // 20 stability per second
    player: 15, // 15 stability per second
  };

  const maxStability = stabilityValues[entityType];
  const regenRate = regenRates[entityType];

  return {
    current: maxStability,
    max: maxStability,
    regenRate: regenRate,
    lastHitTime: Date.now(),
  };
}

/**
 * Reduce stability when entity is hit.
 *
 * @param stability - Current stability state
 * @param damage - Amount of damage dealt
 * @returns Updated stability state and whether break was triggered
 */
export function reduceStability(
  stability: StabilityState,
  damage: number
): { stability: StabilityState; breakTriggered: boolean } {
  const newCurrent = Math.max(0, stability.current - damage);
  const breakTriggered = newCurrent === 0 && stability.current > 0;

  return {
    stability: {
      ...stability,
      current: newCurrent,
      lastHitTime: Date.now(),
    },
    breakTriggered,
  };
}

/**
 * Regenerate stability over time when not being hit.
 *
 * @param stability - Current stability state
 * @param deltaTimeMs - Time elapsed since last update in milliseconds
 * @returns Updated stability state
 */
export function regenerateStability(
  stability: StabilityState,
  deltaTimeMs: number
): StabilityState {
  const now = Date.now();
  const timeSinceLastHit = now - stability.lastHitTime;

  // Only regenerate if not hit recently (1 second grace period)
  if (timeSinceLastHit < 1000) {
    return stability;
  }

  const regenAmount = (stability.regenRate * deltaTimeMs) / 1000;
  const newCurrent = Math.min(stability.max, stability.current + regenAmount);

  return {
    ...stability,
    current: newCurrent,
  };
}

/**
 * Apply break state to an entity.
 *
 * @param entity - The entity to break
 * @param durationMs - Duration of break state in milliseconds (default 5000)
 * @returns Break state
 */
export function applyBreakState(entity: ECSEntity, durationMs: number = 5000): BreakState {
  const now = Date.now();
  return {
    isBroken: true,
    endsAt: now + durationMs,
  };
}

/**
 * Check if an entity is currently broken.
 *
 * @param breakState - The entity's break state
 * @returns True if the entity is broken
 */
export function isBroken(breakState: BreakState | undefined): boolean {
  if (!breakState) return false;

  const now = Date.now();
  return breakState.isBroken && now < breakState.endsAt;
}

/**
 * Update break state, clearing it if expired.
 *
 * @param breakState - The entity's break state
 * @returns Updated break state
 */
export function updateBreakState(breakState: BreakState | undefined): BreakState | undefined {
  if (!breakState) return undefined;

  const now = Date.now();
  if (now >= breakState.endsAt) {
    return undefined; // Break state expired
  }

  return breakState;
}

/**
 * Process a hit on an entity with stability tracking.
 *
 * @param entity - The target entity
 * @param damage - Amount of damage dealt
 * @returns Whether break was triggered
 */
export function processHitWithStability(
  entity: ECSEntity & { stability?: StabilityState; breakState?: BreakState },
  damage: number
): boolean {
  if (!entity.stability) {
    return false;
  }

  const { stability, breakTriggered } = reduceStability(entity.stability, damage);
  entity.stability = stability;

  if (breakTriggered) {
    entity.breakState = applyBreakState(entity);
    return true;
  }

  return false;
}

/**
 * Update stability and break state for an entity.
 *
 * @param entity - The entity to update
 * @param deltaTimeMs - Time elapsed since last update in milliseconds
 */
export function updateStabilityAndBreak(
  entity: ECSEntity & { stability?: StabilityState; breakState?: BreakState },
  deltaTimeMs: number
): void {
  // Update break state
  if (entity.breakState) {
    entity.breakState = updateBreakState(entity.breakState);

    // Reset stability when break ends
    if (!entity.breakState && entity.stability) {
      entity.stability.current = entity.stability.max;
    }
  }

  // Regenerate stability if not broken
  if (entity.stability && !isBroken(entity.breakState)) {
    entity.stability = regenerateStability(entity.stability, deltaTimeMs);
  }
}
