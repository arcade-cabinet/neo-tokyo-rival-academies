/**
 * Core Game Constants
 *
 * Centralized game configuration values used across all packages.
 * All values are deterministic and seedable for reproducible gameplay.
 */

/**
 * Physics constants for character movement and combat
 */
export const PHYSICS = {
	/** Gravity acceleration (units/second²) */
	gravity: -50,
	/** Base movement speed (units/second) */
	baseSpeed: 14,
	/** Sprint movement speed (units/second) */
	sprintSpeed: 22,
	/** Jump force (units/second) */
	jumpForce: 18,
	/** Knockback drag coefficient */
	knockbackDrag: 4,
	/** Friction multiplier for deceleration */
	frictionMultiplier: 0.8,
	/** Minimum velocity before stopping */
	velocityThreshold: 0.1,
} as const;

/**
 * Combat system constants
 */
export const COMBAT = {
	/** Base damage multiplier */
	baseDamageMultiplier: 1.0,
	/** Critical hit multiplier */
	criticalMultiplier: 1.5,
	/** Break gauge base value */
	baseBreakGauge: 100,
	/** Break duration in seconds */
	breakDuration: 3.0,
	/** Invincibility frames duration in seconds */
	invincibilityDuration: 0.5,
} as const;

/**
 * RPG stat boundaries
 */
export const STATS = {
	/** Minimum stat value */
	minValue: 1,
	/** Maximum stat value */
	maxValue: 99,
	/** Starting stat value for new characters */
	defaultValue: 10,
	/** Stat points gained per level */
	pointsPerLevel: 3,
} as const;

/**
 * Level progression constants
 */
export const PROGRESSION = {
	/** Maximum character level */
	maxLevel: 50,
	/** Base XP required for level 2 */
	baseXpRequirement: 100,
	/** XP requirement scaling factor per level */
	xpScalingFactor: 1.15,
} as const;

/**
 * Reputation system thresholds
 */
export const REPUTATION = {
	/** Minimum reputation value */
	min: 0,
	/** Maximum reputation value */
	max: 100,
	/** Starting reputation with each faction */
	defaultValue: 50,
	/** Thresholds for reputation levels */
	thresholds: {
		hated: 0,
		hostile: 15,
		unfriendly: 30,
		neutral: 45,
		friendly: 60,
		honored: 75,
		revered: 90,
	},
} as const;

/**
 * Alignment axis (Kurenai <-> Azure)
 */
export const ALIGNMENT = {
	/** Minimum alignment (full Kurenai) */
	min: -1.0,
	/** Maximum alignment (full Azure) */
	max: 1.0,
	/** Neutral alignment */
	neutral: 0,
} as const;

/**
 * Game seed for deterministic generation
 * Master seed propagates to all sub-systems
 */
export const GAME_SEED = "neo-tokyo-2077" as const;
