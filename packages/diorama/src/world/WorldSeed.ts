/**
 * WorldSeed - Deterministic world generation from memorable seed phrases
 *
 * Generates three-word phrases like "crimson-phoenix-academy" that
 * deterministically seed all procedural generation.
 *
 * Same phrase → Same world, always.
 */

import seedrandom from "seedrandom";

// Word pools curated for Neo-Tokyo cyberpunk aesthetic
// ~50 words per category = 125,000 unique combinations
const WORD_POOLS = {
	// Evocative adjectives (colors, qualities, atmospheres)
	adjectives: [
		"crimson",
		"azure",
		"shadow",
		"neon",
		"cyber",
		"iron",
		"jade",
		"obsidian",
		"chrome",
		"midnight",
		"scarlet",
		"golden",
		"silver",
		"onyx",
		"amber",
		"violet",
		"cobalt",
		"rust",
		"frost",
		"ember",
		"phantom",
		"hollow",
		"silent",
		"burning",
		"frozen",
		"broken",
		"ancient",
		"forgotten",
		"hidden",
		"cursed",
		"sacred",
		"fallen",
		"rising",
		"bleeding",
		"sleeping",
		"waking",
		"dying",
		"living",
		"lost",
		"found",
		"eternal",
		"fleeting",
		"bitter",
		"sweet",
		"savage",
		"gentle",
		"wild",
		"tame",
		"rogue",
		"loyal",
	],

	// Powerful nouns (creatures, concepts, symbols)
	nouns: [
		"phoenix",
		"dragon",
		"lotus",
		"storm",
		"blade",
		"wolf",
		"crane",
		"titan",
		"serpent",
		"hawk",
		"tiger",
		"panther",
		"viper",
		"raven",
		"spider",
		"mantis",
		"scorpion",
		"oni",
		"tengu",
		"kitsune",
		"spirit",
		"ghost",
		"demon",
		"angel",
		"ronin",
		"shogun",
		"samurai",
		"ninja",
		"yakuza",
		"geisha",
		"cipher",
		"echo",
		"pulse",
		"signal",
		"static",
		"glitch",
		"virus",
		"spark",
		"flame",
		"wave",
		"thunder",
		"lightning",
		"shadow",
		"light",
		"void",
		"star",
		"moon",
		"sun",
		"comet",
		"nebula",
	],

	// Location types (where the story unfolds)
	locations: [
		"academy",
		"tower",
		"shrine",
		"dock",
		"market",
		"garden",
		"forge",
		"port",
		"district",
		"plaza",
		"arcade",
		"clinic",
		"temple",
		"palace",
		"fortress",
		"bunker",
		"station",
		"terminal",
		"nexus",
		"hub",
		"sanctum",
		"vault",
		"crypt",
		"tomb",
		"ruins",
		"slums",
		"heights",
		"depths",
		"crossing",
		"bridge",
		"alley",
		"rooftop",
		"basement",
		"penthouse",
		"warehouse",
		"factory",
		"reactor",
		"spire",
		"dome",
		"arena",
		"casino",
		"club",
		"bar",
		"den",
		"lair",
		"haven",
		"refuge",
		"outpost",
		"frontier",
		"edge",
	],
} as const;

export type SeedPhrase = `${string}-${string}-${string}`;

export interface WorldRNG {
	/** Get next random float 0-1 */
	next(): number;
	/** Get random integer in range [min, max) */
	int(min: number, max: number): number;
	/** Pick random element from array */
	pick<T>(array: readonly T[]): T;
	/** Shuffle array (returns new array) */
	shuffle<T>(array: readonly T[]): T[];
	/** Get boolean with given probability (default 0.5) */
	chance(probability?: number): boolean;
	/** Get the original seed phrase */
	readonly phrase: SeedPhrase;
	/** Get numeric seed derived from phrase */
	readonly numericSeed: number;
}

/**
 * Generate a random seed phrase using system randomness
 */
export function generateSeedPhrase(): SeedPhrase {
	const rng = Math.random;
	const adj =
		WORD_POOLS.adjectives[Math.floor(rng() * WORD_POOLS.adjectives.length)];
	const noun = WORD_POOLS.nouns[Math.floor(rng() * WORD_POOLS.nouns.length)];
	const loc =
		WORD_POOLS.locations[Math.floor(rng() * WORD_POOLS.locations.length)];
	return `${adj}-${noun}-${loc}` as SeedPhrase;
}

/**
 * Validate a seed phrase format
 */
export function isValidSeedPhrase(phrase: string): phrase is SeedPhrase {
	const parts = phrase.toLowerCase().split("-");
	if (parts.length !== 3) return false;

	const [adj, noun, loc] = parts;
	return (
		(WORD_POOLS.adjectives as readonly string[]).includes(adj) &&
		(WORD_POOLS.nouns as readonly string[]).includes(noun) &&
		(WORD_POOLS.locations as readonly string[]).includes(loc)
	);
}

/**
 * Convert phrase to numeric seed (for compatibility with existing systems)
 */
function phraseToNumericSeed(phrase: string): number {
	let hash = 0;
	for (let i = 0; i < phrase.length; i++) {
		const char = phrase.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

/**
 * Create a deterministic RNG from a seed phrase
 *
 * @example
 * ```ts
 * const world = createWorldRNG("crimson-phoenix-academy");
 * const terrain = world.next(); // Always same value for same phrase
 * const enemy = world.pick(["yakuza", "ronin", "ninja"]); // Deterministic
 * ```
 */
export function createWorldRNG(phrase: SeedPhrase | string): WorldRNG {
	const normalizedPhrase = phrase.toLowerCase().trim() as SeedPhrase;
	const rng = seedrandom(normalizedPhrase);
	const numericSeed = phraseToNumericSeed(normalizedPhrase);

	return {
		next: () => rng(),

		int: (min: number, max: number) => Math.floor(rng() * (max - min)) + min,

		pick: <T>(array: readonly T[]): T => {
			if (array.length === 0) {
				throw new Error("Cannot pick from empty array");
			}
			return array[Math.floor(rng() * array.length)];
		},

		shuffle: <T>(array: readonly T[]): T[] => {
			const result = [...array];
			for (let i = result.length - 1; i > 0; i--) {
				const j = Math.floor(rng() * (i + 1));
				[result[i], result[j]] = [result[j], result[i]];
			}
			return result;
		},

		chance: (probability = 0.5) => rng() < probability,

		get phrase() {
			return normalizedPhrase;
		},

		get numericSeed() {
			return numericSeed;
		},
	};
}

/**
 * Create a sub-RNG for a specific system (e.g., "terrain", "enemies", "loot")
 * This ensures different systems don't interfere with each other's sequences
 */
export function createSubRNG(parent: WorldRNG, subsystem: string): WorldRNG {
	const subPhrase = `${parent.phrase}:${subsystem}` as SeedPhrase;
	return createWorldRNG(subPhrase);
}

/**
 * Get word pools for UI display (e.g., autocomplete)
 */
export function getWordPools() {
	return {
		adjectives: [...WORD_POOLS.adjectives],
		nouns: [...WORD_POOLS.nouns],
		locations: [...WORD_POOLS.locations],
	};
}

/**
 * Suggest completions for partial phrase input
 */
export function suggestCompletions(partial: string): {
	adjectives: string[];
	nouns: string[];
	locations: string[];
} {
	const parts = partial.toLowerCase().split("-");
	const current = parts[parts.length - 1] || "";

	const filterMatching = (words: readonly string[]) =>
		words.filter((w) => w.startsWith(current)).slice(0, 5);

	if (parts.length === 1) {
		return {
			adjectives: filterMatching(WORD_POOLS.adjectives),
			nouns: [],
			locations: [],
		};
	} else if (parts.length === 2) {
		return {
			adjectives: [],
			nouns: filterMatching(WORD_POOLS.nouns),
			locations: [],
		};
	} else {
		return {
			adjectives: [],
			nouns: [],
			locations: filterMatching(WORD_POOLS.locations),
		};
	}
}
