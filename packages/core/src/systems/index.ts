/**
 * Core systems exports.
 * All systems are platform-agnostic with no rendering dependencies.
 */

export * from "./BreakSystem";
export {
	calculateDamage,
	type AttackType,
	type CombatResult as CombatLogicResult,
	type DamageModifiers,
} from "./CombatLogic";
export * from "./CombatSystem";
export * from "./DistrictManager";
export * from "./HitDetection";
export * from "./QuestGenerator";
export * from "./ReputationSystem";
export * from "./StatAllocation";
export * from "./WorldGenerator";
