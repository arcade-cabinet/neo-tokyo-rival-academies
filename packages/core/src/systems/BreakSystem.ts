/**
 * Break/Stagger system for combat.
 * Enemies have a stability gauge that depletes when hit.
 * When stability reaches 0, enemy enters "broken" state where all attacks are critical.
 *
 * Platform-agnostic - no rendering dependencies.
 */

import type { BreakState, CoreEntity, StabilityState } from "../types/entity";

export type { StabilityState, BreakState };

/**
 * Entity type for stability calculation.
 */
export type EntityType = "grunt" | "boss" | "player";

/**
 * Stability configuration by entity type.
 */
const STABILITY_CONFIG: Record<EntityType, { max: number; regenRate: number }> =
	{
		grunt: { max: 100, regenRate: 10 },
		boss: { max: 500, regenRate: 20 },
		player: { max: 200, regenRate: 15 },
	};

/**
 * Default break duration in milliseconds.
 */
export const DEFAULT_BREAK_DURATION_MS = 5000;

/**
 * Grace period before stability regeneration starts (ms).
 */
export const STABILITY_REGEN_DELAY_MS = 1000;

/**
 * Initialize stability state for an entity.
 */
export function initializeStability(entityType: EntityType): StabilityState {
	const config = STABILITY_CONFIG[entityType];
	return {
		current: config.max,
		max: config.max,
		regenRate: config.regenRate,
		regenDelay: STABILITY_REGEN_DELAY_MS,
		lastDamageTime: 0,
	};
}

/**
 * Reduce stability when entity is hit.
 *
 * @returns Updated stability state and whether break was triggered
 */
export function reduceStability(
	stability: StabilityState,
	damage: number,
	currentTime: number,
): { stability: StabilityState; breakTriggered: boolean } {
	const newCurrent = Math.max(0, stability.current - damage);
	const breakTriggered = newCurrent === 0 && stability.current > 0;

	return {
		stability: {
			...stability,
			current: newCurrent,
			lastDamageTime: currentTime,
		},
		breakTriggered,
	};
}

/**
 * Regenerate stability over time when not being hit.
 */
export function regenerateStability(
	stability: StabilityState,
	deltaTimeMs: number,
	currentTime: number,
): StabilityState {
	const timeSinceLastDamage =
		stability.lastDamageTime === 0
			? Infinity
			: currentTime - stability.lastDamageTime;

	// Only regenerate after grace period
	if (timeSinceLastDamage < stability.regenDelay) {
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
 * Create a new break state.
 */
export function createBreakState(
	currentTime: number,
	durationMs: number = DEFAULT_BREAK_DURATION_MS,
): BreakState {
	return {
		gauge: 0,
		maxGauge: 100,
		isBroken: true,
		breakDuration: durationMs,
		breakTimer: currentTime + durationMs,
		recoveryRate: 20,
	};
}

/**
 * Check if an entity is currently broken.
 */
export function isBroken(
	breakState: BreakState | undefined,
	currentTime: number,
): boolean {
	if (!breakState) return false;
	return breakState.isBroken && currentTime < breakState.breakTimer;
}

/**
 * Update break state, clearing it if expired.
 */
export function updateBreakState(
	breakState: BreakState | undefined,
	currentTime: number,
): BreakState | undefined {
	if (!breakState) return undefined;

	if (currentTime >= breakState.breakTimer) {
		return undefined; // Break state expired
	}

	return breakState;
}

/**
 * Process a hit on an entity with stability tracking.
 *
 * @returns Whether break was triggered
 */
export function processHitWithStability(
	entity: CoreEntity,
	damage: number,
	currentTime: number,
): { entity: CoreEntity; breakTriggered: boolean } {
	if (!entity.stability) {
		return { entity, breakTriggered: false };
	}

	const { stability, breakTriggered } = reduceStability(
		entity.stability,
		damage,
		currentTime,
	);

	const updatedEntity: CoreEntity = {
		...entity,
		stability,
	};

	if (breakTriggered) {
		updatedEntity.breakState = createBreakState(currentTime);
	}

	return { entity: updatedEntity, breakTriggered };
}

/**
 * Update stability and break state for an entity.
 */
export function updateStabilityAndBreak(
	entity: CoreEntity,
	deltaTimeMs: number,
	currentTime: number,
): CoreEntity {
	let updatedEntity = { ...entity };

	// Update break state
	if (updatedEntity.breakState) {
		const newBreakState = updateBreakState(
			updatedEntity.breakState,
			currentTime,
		);

		// Reset stability when break ends
		if (!newBreakState && updatedEntity.stability) {
			updatedEntity = {
				...updatedEntity,
				breakState: undefined,
				stability: {
					...updatedEntity.stability,
					current: updatedEntity.stability.max,
				},
			};
		} else {
			updatedEntity.breakState = newBreakState;
		}
	}

	// Regenerate stability if not broken
	if (
		updatedEntity.stability &&
		!isBroken(updatedEntity.breakState, currentTime)
	) {
		updatedEntity.stability = regenerateStability(
			updatedEntity.stability,
			deltaTimeMs,
			currentTime,
		);
	}

	return updatedEntity;
}

/**
 * Get break state progress as a percentage (0-1).
 */
export function getBreakProgress(
	breakState: BreakState | undefined,
	currentTime: number,
): number {
	if (!breakState || !breakState.isBroken) return 0;

	const remaining = breakState.breakTimer - currentTime;
	if (remaining <= 0) return 0;

	return remaining / breakState.breakDuration;
}
