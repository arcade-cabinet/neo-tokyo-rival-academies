import seedrandom from "seedrandom";
import type { RPGStats } from "../types/entity";

export interface CombatAction {
	type: "attack" | "defend" | "skill";
	skillId?: string;
}

export interface CombatResult {
	hit: boolean;
	critical: boolean;
	damage: number;
	attackerName: string;
	defenderName: string;
}

export interface Combatant {
	id: string;
	name: string;
	stats: RPGStats;
	currentHP: number;
	maxHP: number;
	defending: boolean;
}

export interface EnemyTemplate {
	id: string;
	name: string;
	stats: RPGStats;
	baseHP: number;
	xpReward: number;
	creditReward: number;
}

// Enemy Templates
export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
	street_thug: {
		id: "street_thug",
		name: "Street Thug",
		stats: {
			structure: 8,
			ignition: 12,
			logic: 6,
			flow: 10,
		},
		baseHP: 50,
		xpReward: 25,
		creditReward: 50,
	},
	scavenger: {
		id: "scavenger",
		name: "Scavenger",
		stats: {
			structure: 6,
			ignition: 10,
			logic: 8,
			flow: 12,
		},
		baseHP: 40,
		xpReward: 20,
		creditReward: 40,
	},
	elite_guard: {
		id: "elite_guard",
		name: "Elite Guard",
		stats: {
			structure: 20,
			ignition: 18,
			logic: 16,
			flow: 14,
		},
		baseHP: 150,
		xpReward: 100,
		creditReward: 200,
	},
	rogue_ai: {
		id: "rogue_ai",
		name: "Rogue AI",
		stats: {
			structure: 15,
			ignition: 25,
			logic: 30,
			flow: 20,
		},
		baseHP: 200,
		xpReward: 150,
		creditReward: 300,
	},
	district_boss: {
		id: "district_boss",
		name: "District Enforcer",
		stats: {
			structure: 35,
			ignition: 30,
			logic: 25,
			flow: 28,
		},
		baseHP: 400,
		xpReward: 500,
		creditReward: 1000,
	},
};

// Encounter Templates
export interface EncounterTemplate {
	id: string;
	name: string;
	enemies: { templateId: string; count: number }[];
	difficulty: "easy" | "medium" | "hard" | "boss";
}

export const ENCOUNTER_TEMPLATES: Record<string, EncounterTemplate> = {
	street_patrol: {
		id: "street_patrol",
		name: "Street Patrol",
		enemies: [{ templateId: "street_thug", count: 3 }],
		difficulty: "easy",
	},
	mixed_gang: {
		id: "mixed_gang",
		name: "Mixed Gang",
		enemies: [
			{ templateId: "street_thug", count: 2 },
			{ templateId: "scavenger", count: 2 },
		],
		difficulty: "medium",
	},
	elite_patrol: {
		id: "elite_patrol",
		name: "Elite Patrol",
		enemies: [{ templateId: "elite_guard", count: 1 }],
		difficulty: "medium",
	},
	ai_swarm: {
		id: "ai_swarm",
		name: "AI Swarm",
		enemies: [
			{ templateId: "rogue_ai", count: 1 },
			{ templateId: "scavenger", count: 2 },
		],
		difficulty: "hard",
	},
	boss_fight: {
		id: "boss_fight",
		name: "Boss Encounter",
		enemies: [{ templateId: "district_boss", count: 1 }],
		difficulty: "boss",
	},
};

/**
 * CombatSystem
 * Implements real-time combat formulas from ROADMAP_1.0.md
 */
export class CombatSystem {
	private rng: seedrandom.PRNG;

	constructor(seed?: string) {
		this.rng = seedrandom(seed || `combat-${Date.now()}`);
	}

	/**
	 * Calculate damage dealt by attacker to defender
	 * Formula: base = max(1, floor(attacker.Ignition * 2 - defender.Structure * 0.5))
	 */
	calculateDamage(
		attacker: Combatant,
		defender: Combatant,
		isCritical: boolean,
	): number {
		const baseDamage = Math.max(
			1,
			Math.floor(attacker.stats.ignition * 2 - defender.stats.structure * 0.5),
		);

		// Defender bonus
		const defenseMultiplier = defender.defending ? 0.5 : 1.0;

		// Critical multiplier
		const critMultiplier = isCritical ? 2.0 : 1.0;

		return Math.floor(baseDamage * defenseMultiplier * critMultiplier);
	}

	/**
	 * Calculate critical hit chance
	 * Formula: chance = min(0.5, attacker.Ignition * 0.01)
	 */
	calculateCriticalChance(attacker: Combatant): number {
		return Math.min(0.5, attacker.stats.ignition * 0.01);
	}

	/**
	 * Calculate hit chance
	 * Formula: hitChance = 0.8 + (attacker.Flow - defender.Flow) * 0.05
	 */
	calculateHitChance(attacker: Combatant, defender: Combatant): number {
		const baseHitChance = 0.8;
		const flowModifier = (attacker.stats.flow - defender.stats.flow) * 0.05;
		return Math.min(1.0, Math.max(0.1, baseHitChance + flowModifier));
	}

	/**
	 * Execute a combat action and return the result
	 */
	executeAction(
		attacker: Combatant,
		defender: Combatant,
		action: CombatAction,
	): CombatResult {
		// Reset defending state
		attacker.defending = false;

		if (action.type === "defend") {
			attacker.defending = true;
			return {
				hit: false,
				critical: false,
				damage: 0,
				attackerName: attacker.name,
				defenderName: defender.name,
			};
		}

		// Check hit
		const hitChance = this.calculateHitChance(attacker, defender);
		const hitRoll = this.rng();
		const hit = hitRoll < hitChance;

		if (!hit) {
			return {
				hit: false,
				critical: false,
				damage: 0,
				attackerName: attacker.name,
				defenderName: defender.name,
			};
		}

		// Check critical
		const critChance = this.calculateCriticalChance(attacker);
		const critRoll = this.rng();
		const critical = critRoll < critChance;

		// Calculate damage
		const damage = this.calculateDamage(attacker, defender, critical);

		return {
			hit: true,
			critical,
			damage,
			attackerName: attacker.name,
			defenderName: defender.name,
		};
	}

	/**
	 * Apply damage to a combatant
	 */
	applyDamage(combatant: Combatant, damage: number): void {
		combatant.currentHP = Math.max(0, combatant.currentHP - damage);
	}

	/**
	 * Check if combatant is defeated
	 */
	isDefeated(combatant: Combatant): boolean {
		return combatant.currentHP <= 0;
	}

	/**
	 * Create a combatant from a template
	 */
	createEnemyFromTemplate(
		template: EnemyTemplate,
		index: number = 0,
	): Combatant {
		return {
			id: `${template.id}_${index}`,
			name: template.name + (index > 0 ? ` ${index + 1}` : ""),
			stats: { ...template.stats },
			currentHP: template.baseHP,
			maxHP: template.baseHP,
			defending: false,
		};
	}

	/**
	 * Create an encounter from a template
	 */
	createEncounter(template: EncounterTemplate): Combatant[] {
		const enemies: Combatant[] = [];
		let enemyIndex = 0;

		for (const { templateId, count } of template.enemies) {
			const enemyTemplate = ENEMY_TEMPLATES[templateId];
			if (!enemyTemplate) {
				console.warn(`Enemy template ${templateId} not found`);
				continue;
			}

			for (let i = 0; i < count; i++) {
				enemies.push(this.createEnemyFromTemplate(enemyTemplate, enemyIndex));
				enemyIndex++;
			}
		}

		return enemies;
	}

	/**
	 * Calculate total XP reward for an encounter
	 */
	calculateEncounterXP(template: EncounterTemplate): number {
		let totalXP = 0;

		for (const { templateId, count } of template.enemies) {
			const enemyTemplate = ENEMY_TEMPLATES[templateId];
			if (enemyTemplate) {
				totalXP += enemyTemplate.xpReward * count;
			}
		}

		return totalXP;
	}

	/**
	 * Calculate total credit reward for an encounter
	 */
	calculateEncounterCredits(template: EncounterTemplate): number {
		let totalCredits = 0;

		for (const { templateId, count } of template.enemies) {
			const enemyTemplate = ENEMY_TEMPLATES[templateId];
			if (enemyTemplate) {
				totalCredits += enemyTemplate.creditReward * count;
			}
		}

		return totalCredits;
	}
}
