/**
 * Core systems exports.
 * All systems are platform-agnostic with no rendering dependencies.
 */

export * from "./BreakSystem";
export {
	type AttackType,
	type CombatResult as CombatLogicResult,
	calculateDamage,
	type DamageModifiers,
} from "./CombatLogic";
export * from "./CombatSystem";
export * from "./DistrictManager";
export * from "./HitDetection";
export * from "./QuestGenerator";
export * from "./ReputationSystem";
export * from "./StatAllocation";
export * from "./WorldGenerator";
