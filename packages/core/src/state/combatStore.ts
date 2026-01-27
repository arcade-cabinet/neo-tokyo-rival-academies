import { create } from "zustand";
import type {
	CombatAction,
	Combatant,
	CombatResult,
} from "../systems/CombatSystem";
import { CombatSystem, ENCOUNTER_TEMPLATES } from "../systems/CombatSystem";
import { usePlayerStore } from "./playerStore";

export type CombatPhase =
	| "idle"
	| "player_turn"
	| "enemy_turn"
	| "victory"
	| "defeat";

interface CombatState {
	// Combat state
	inCombat: boolean;
	phase: CombatPhase;
	turn: number;

	// Combatants
	player: Combatant | null;
	enemies: Combatant[];

	// Combat log
	combatLog: CombatResult[];

	// Rewards
	victoryRewards: {
		xp: number;
		credits: number;
	} | null;

	// Actions
	startCombat: (player: Combatant, encounterId: string) => void;
	playerAction: (action: CombatAction, targetId: string) => void;
	enemyTurn: () => void;
	endCombat: () => void;
	reset: () => void;
}

const combatSystem = new CombatSystem();

export const useCombatStore = create<CombatState>((set, get) => ({
	inCombat: false,
	phase: "idle",
	turn: 0,

	player: null,
	enemies: [],

	combatLog: [],
	victoryRewards: null,

	startCombat: (player: Combatant, encounterId: string) => {
		const template = ENCOUNTER_TEMPLATES[encounterId];
		if (!template) {
			console.warn(`Encounter ${encounterId} not found`);
			return;
		}

		const enemies = combatSystem.createEncounter(template);
		const xp = combatSystem.calculateEncounterXP(template);
		const credits = combatSystem.calculateEncounterCredits(template);

		set({
			inCombat: true,
			phase: "player_turn",
			turn: 1,
			player: { ...player },
			enemies,
			combatLog: [],
			victoryRewards: { xp, credits },
		});
	},

	playerAction: (action: CombatAction, targetId: string) => {
		const { player, enemies, combatLog } = get();

		if (!player || enemies.length === 0) return;

		const target = enemies.find((e) => e.id === targetId);
		if (!target) {
			console.warn(`Target ${targetId} not found`);
			return;
		}

		// Execute player action
		const result = combatSystem.executeAction(player, target, action);

		if (result.hit && result.damage > 0) {
			combatSystem.applyDamage(target, result.damage);
		}

		const newLog = [...combatLog, result];

		// Check for defeated enemies
		const aliveEnemies = enemies.filter((e) => !combatSystem.isDefeated(e));

		// Check victory
		if (aliveEnemies.length === 0) {
			set({
				enemies: aliveEnemies,
				combatLog: newLog,
				phase: "victory",
			});
			return;
		}

		// Move to enemy turn
		set({
			enemies: aliveEnemies,
			combatLog: newLog,
			phase: "enemy_turn",
		});

		// Auto-execute enemy turn after delay (handled by UI)
	},

	enemyTurn: () => {
		const { player, enemies, combatLog, turn } = get();

		if (!player || enemies.length === 0) return;

		const newLog = [...combatLog];
		const updatedPlayer = { ...player };

		// Each enemy attacks
		for (const enemy of enemies) {
			const action: CombatAction = { type: "attack" };
			const result = combatSystem.executeAction(enemy, updatedPlayer, action);

			if (result.hit && result.damage > 0) {
				combatSystem.applyDamage(updatedPlayer, result.damage);
			}

			newLog.push(result);

			// Check defeat
			if (combatSystem.isDefeated(updatedPlayer)) {
				set({
					player: updatedPlayer,
					combatLog: newLog,
					phase: "defeat",
				});
				return;
			}
		}

		// Move to next turn
		set({
			player: updatedPlayer,
			combatLog: newLog,
			phase: "player_turn",
			turn: turn + 1,
		});
	},

	endCombat: () => {
		const { phase, victoryRewards, player } = get();

		if (phase === "victory" && victoryRewards && player) {
			const playerStore = usePlayerStore.getState();

			// Award XP and credits
			playerStore.addXP(victoryRewards.xp);
			playerStore.addCredits(victoryRewards.credits);

			// Update player HP in player store if needed
		}

		set({
			inCombat: false,
			phase: "idle",
			turn: 0,
			player: null,
			enemies: [],
			combatLog: [],
			victoryRewards: null,
		});
	},

	reset: () => {
		set({
			inCombat: false,
			phase: "idle",
			turn: 0,
			player: null,
			enemies: [],
			combatLog: [],
			victoryRewards: null,
		});
	},
}));
