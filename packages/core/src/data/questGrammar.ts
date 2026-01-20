/**
 * Quest grammar tables for procedural quest generation
 * As per docs/QUEST_SYSTEM.md
 */

export interface GrammarEntry {
	value: string;
	weight: number;
	alignmentBias?: "kurenai" | "azure" | "neutral";
}

// Nouns: Quest objects/targets
export const QUEST_NOUNS: GrammarEntry[] = [
	{ value: "data chip", weight: 1.0, alignmentBias: "azure" },
	{ value: "prototype weapon", weight: 0.8, alignmentBias: "kurenai" },
	{ value: "stolen medicine", weight: 0.9, alignmentBias: "neutral" },
	{ value: "encrypted file", weight: 1.0, alignmentBias: "azure" },
	{ value: "contraband tech", weight: 0.7, alignmentBias: "kurenai" },
	{ value: "corporate ledger", weight: 0.8, alignmentBias: "azure" },
	{ value: "black market goods", weight: 0.9, alignmentBias: "kurenai" },
	{ value: "AI core fragment", weight: 0.6, alignmentBias: "azure" },
	{ value: "rival academy intel", weight: 1.0, alignmentBias: "neutral" },
	{ value: "yakuza package", weight: 0.7, alignmentBias: "kurenai" },
];

// Verbs: Quest actions (weighted by alignment)
export const QUEST_VERBS: GrammarEntry[] = [
	// Azure-biased (corporate, logical, negotiation)
	{ value: "deliver", weight: 1.0, alignmentBias: "azure" },
	{ value: "negotiate for", weight: 0.8, alignmentBias: "azure" },
	{ value: "secure", weight: 0.9, alignmentBias: "azure" },
	{ value: "analyze", weight: 0.7, alignmentBias: "azure" },
	{ value: "decrypt", weight: 0.8, alignmentBias: "azure" },

	// Kurenai-biased (rebellious, passionate, direct action)
	{ value: "steal", weight: 0.9, alignmentBias: "kurenai" },
	{ value: "sabotage", weight: 0.7, alignmentBias: "kurenai" },
	{ value: "destroy", weight: 0.6, alignmentBias: "kurenai" },
	{ value: "raid", weight: 0.8, alignmentBias: "kurenai" },
	{ value: "liberate", weight: 0.9, alignmentBias: "kurenai" },

	// Neutral
	{ value: "retrieve", weight: 1.0, alignmentBias: "neutral" },
	{ value: "investigate", weight: 0.9, alignmentBias: "neutral" },
	{ value: "locate", weight: 0.8, alignmentBias: "neutral" },
];

// Adjectives: Quest flavor (themed by district type)
export const QUEST_ADJECTIVES: Record<string, GrammarEntry[]> = {
	slums: [
		{ value: "desperate", weight: 1.0 },
		{ value: "dangerous", weight: 0.9 },
		{ value: "filthy", weight: 0.7 },
		{ value: "makeshift", weight: 0.8 },
	],
	entertainment: [
		{ value: "flashy", weight: 0.9 },
		{ value: "lucrative", weight: 0.8 },
		{ value: "scandalous", weight: 0.7 },
		{ value: "celebrity-endorsed", weight: 0.6 },
	],
	corporate: [
		{ value: "classified", weight: 1.0 },
		{ value: "executive", weight: 0.8 },
		{ value: "high-value", weight: 0.9 },
		{ value: "confidential", weight: 0.9 },
	],
	industrial: [
		{ value: "hazardous", weight: 0.8 },
		{ value: "radioactive", weight: 0.6 },
		{ value: "experimental", weight: 0.7 },
		{ value: "unstable", weight: 0.8 },
	],
	nature: [
		{ value: "organic", weight: 0.7 },
		{ value: "bio-engineered", weight: 0.8 },
		{ value: "rare", weight: 0.9 },
		{ value: "exotic", weight: 0.8 },
	],
	transit: [
		{ value: "smuggled", weight: 0.9 },
		{ value: "intercepted", weight: 0.8 },
		{ value: "lost", weight: 0.7 },
		{ value: "urgent", weight: 1.0 },
	],
	tech: [
		{ value: "encrypted", weight: 1.0 },
		{ value: "cutting-edge", weight: 0.8 },
		{ value: "prototype", weight: 0.9 },
		{ value: "AI-secured", weight: 0.7 },
	],
	training: [
		{ value: "legendary", weight: 0.7 },
		{ value: "master-crafted", weight: 0.8 },
		{ value: "ancient", weight: 0.6 },
		{ value: "tournament-grade", weight: 0.9 },
	],
	criminal: [
		{ value: "illicit", weight: 1.0 },
		{ value: "contraband", weight: 0.9 },
		{ value: "blood-stained", weight: 0.7 },
		{ value: "yakuza-protected", weight: 0.8 },
	],
};

// Landmarks: Quest locations
export const QUEST_LANDMARKS: Record<string, GrammarEntry[]> = {
	slums: [
		{ value: "rusted warehouse", weight: 1.0 },
		{ value: "underground market", weight: 0.9 },
		{ value: "makeshift clinic", weight: 0.8 },
	],
	entertainment: [
		{ value: "neon nightclub", weight: 1.0 },
		{ value: "holo-theater", weight: 0.8 },
		{ value: "VR arcade", weight: 0.9 },
	],
	corporate: [
		{ value: "corporate tower lobby", weight: 1.0 },
		{ value: "executive penthouse", weight: 0.7 },
		{ value: "secure data vault", weight: 0.9 },
	],
	industrial: [
		{ value: "reactor core chamber", weight: 0.8 },
		{ value: "coolant processing plant", weight: 0.9 },
		{ value: "maintenance tunnels", weight: 1.0 },
	],
	nature: [
		{ value: "sky garden plaza", weight: 1.0 },
		{ value: "hydroponic farm", weight: 0.9 },
		{ value: "bio-dome observatory", weight: 0.7 },
	],
	transit: [
		{ value: "maglev platform", weight: 1.0 },
		{ value: "cargo loading bay", weight: 0.9 },
		{ value: "transit control center", weight: 0.8 },
	],
	tech: [
		{ value: "server farm", weight: 1.0 },
		{ value: "AI research lab", weight: 0.8 },
		{ value: "quantum computing facility", weight: 0.6 },
	],
	training: [
		{ value: "Azure academy dojo", weight: 0.9 },
		{ value: "Kurenai training ground", weight: 0.9 },
		{ value: "meditation chamber", weight: 0.7 },
	],
	criminal: [
		{ value: "yakuza safehouse", weight: 0.9 },
		{ value: "smuggler hideout", weight: 1.0 },
		{ value: "black market auction", weight: 0.8 },
	],
};

// Outcomes: Quest resolution flavor
export const QUEST_OUTCOMES: GrammarEntry[] = [
	{
		value: "Kurenai academy reputation increases",
		weight: 1.0,
		alignmentBias: "kurenai",
	},
	{
		value: "Azure academy reputation increases",
		weight: 1.0,
		alignmentBias: "azure",
	},
	{ value: "XP and credits reward", weight: 1.0, alignmentBias: "neutral" },
	{
		value: "Rare item unlock",
		weight: 0.7,
		alignmentBias: "neutral",
	},
	{
		value: "New district access",
		weight: 0.5,
		alignmentBias: "neutral",
	},
];

/**
 * Weighted random selection helper
 */
export function weightedRandom<T extends { weight: number }>(
	items: T[],
	rng: () => number,
): T {
	const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
	let random = rng() * totalWeight;

	for (const item of items) {
		random -= item.weight;
		if (random <= 0) return item;
	}

	return items[items.length - 1];
}
