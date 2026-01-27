import seedrandom from "seedrandom";
import {
	type GrammarEntry,
	QUEST_ADJECTIVES,
	QUEST_LANDMARKS,
	QUEST_NOUNS,
	QUEST_OUTCOMES,
	QUEST_VERBS,
	weightedRandom,
} from "../data/questGrammar";
import type { DistrictProfile } from "../state/worldStore";

export interface Quest {
	id: string;
	type: "main" | "side" | "secret";
	title: string;
	description: string;
	objective: string;
	location: string;
	rewards: {
		xp: number;
		credits: number;
		items?: string[];
		alignmentShift?: { kurenai?: number; azure?: number };
	};
	requirements?: {
		level?: number;
		kurenaiRep?: number;
		azureRep?: number;
	};
	completed: boolean;
}

export interface QuestCluster {
	districtId: string;
	districtName: string;
	main: Quest;
	sides: Quest[];
	secret: Quest;
}

export class QuestGenerator {
	private rng: seedrandom.PRNG;
	private seed: string;

	constructor(seed: string) {
		this.seed = seed;
		this.rng = seedrandom(seed);
	}

	/**
	 * Generate a quest cluster for a district
	 * @param districtProfile The district's profile (theme, etc.)
	 * @param districtId Unique district identifier
	 * @param districtName Human-readable district name
	 * @returns QuestCluster with 1 main + 2 sides + 1 secret
	 */
	generateCluster(
		districtProfile: DistrictProfile,
		districtId: string,
		districtName: string,
	): QuestCluster {
		const main = this.generateQuest(
			"main",
			districtProfile,
			`${districtId}_main`,
			1,
		);
		const sides = [
			this.generateQuest("side", districtProfile, `${districtId}_side_1`, 2),
			this.generateQuest("side", districtProfile, `${districtId}_side_2`, 3),
		];
		const secret = this.generateQuest(
			"secret",
			districtProfile,
			`${districtId}_secret`,
			4,
		);

		return {
			districtId,
			districtName,
			main,
			sides,
			secret,
		};
	}

	/**
	 * Generate a single quest using grammar tables
	 */
	private generateQuest(
		type: "main" | "side" | "secret",
		districtProfile: DistrictProfile,
		questId: string,
		seedOffset: number,
	): Quest {
		// Create deterministic RNG for this specific quest
		const questRng = seedrandom(`${this.seed}_${questId}_${seedOffset}`);

		// Select grammar elements
		const noun = weightedRandom(QUEST_NOUNS, questRng);
		const verb = weightedRandom(QUEST_VERBS, questRng);

		// Get adjectives and landmarks for this district's theme
		const adjectives =
			QUEST_ADJECTIVES[districtProfile.theme] ?? QUEST_ADJECTIVES.slums;
		const landmarks =
			QUEST_LANDMARKS[districtProfile.theme] ?? QUEST_LANDMARKS.slums;

		const adjective = weightedRandom(adjectives, questRng);
		const landmark = weightedRandom(landmarks, questRng);
		const outcome = weightedRandom(QUEST_OUTCOMES, questRng);

		// Construct quest title and description
		const title = `${verb.value.charAt(0).toUpperCase() + verb.value.slice(1)} the ${adjective.value} ${noun.value}`;

		const description = this.generateDescription(
			verb.value,
			noun.value,
			adjective.value,
			landmark.value,
			districtProfile.name,
		);

		const objective = `${verb.value.charAt(0).toUpperCase() + verb.value.slice(1)} the ${noun.value} from ${landmark.value}`;

		// Determine rewards based on quest type
		const rewards = this.generateRewards(type, verb, outcome, questRng);

		// Set requirements (main quests have lower requirements)
		const requirements =
			type === "main"
				? undefined
				: {
						level: type === "secret" ? 5 : 2,
					};

		return {
			id: questId,
			type,
			title,
			description,
			objective,
			location: landmark.value,
			rewards,
			requirements,
			completed: false,
		};
	}

	/**
	 * Generate quest description text
	 */
	private generateDescription(
		verb: string,
		noun: string,
		adjective: string,
		landmark: string,
		districtName: string,
	): string {
		const templates = [
			`A contact in ${districtName} needs someone to ${verb} a ${adjective} ${noun}. The target is located at the ${landmark}. Discretion is advised.`,
			`Word on the street is that there's a ${adjective} ${noun} at the ${landmark} in ${districtName}. You've been asked to ${verb} it, no questions asked.`,
			`The ${landmark} in ${districtName} is rumored to contain a ${adjective} ${noun}. Your mission: ${verb} it before someone else does.`,
			`An anonymous client wants you to ${verb} a ${adjective} ${noun} from the ${landmark}. Payment on delivery. Location: ${districtName}.`,
		];

		const templateIndex = Math.floor(this.rng() * templates.length);
		return templates[templateIndex];
	}

	/**
	 * Generate quest rewards based on type and alignment
	 */
	private generateRewards(
		type: "main" | "side" | "secret",
		verb: GrammarEntry,
		_outcome: GrammarEntry,
		questRng: seedrandom.PRNG,
	): Quest["rewards"] {
		// Base rewards by type
		const baseXP = type === "main" ? 500 : type === "side" ? 200 : 300;
		const baseCredits = type === "main" ? 1000 : type === "side" ? 400 : 600;

		// Add variance (±20%)
		const xp = Math.floor(baseXP * (0.8 + questRng() * 0.4));
		const credits = Math.floor(baseCredits * (0.8 + questRng() * 0.4));

		// Alignment shift based on verb bias (±10-20 reputation)
		const alignmentShift: { kurenai?: number; azure?: number } = {};

		if (verb.alignmentBias === "kurenai") {
			alignmentShift.kurenai = 10 + Math.floor(questRng() * 10);
		} else if (verb.alignmentBias === "azure") {
			alignmentShift.azure = 10 + Math.floor(questRng() * 10);
		}

		// Secret quests have a chance for rare items
		const items: string[] = [];
		if (type === "secret" && questRng() > 0.5) {
			items.push("water-filter-core");
		}

		return {
			xp,
			credits,
			items: items.length > 0 ? items : undefined,
			alignmentShift:
				Object.keys(alignmentShift).length > 0 ? alignmentShift : undefined,
		};
	}

	/**
	 * Reset RNG to seed (for regeneration)
	 */
	reset(): void {
		this.rng = seedrandom(this.seed);
	}
}
