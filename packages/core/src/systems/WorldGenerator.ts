import seedrandom from "seedrandom";
import type { District, DistrictProfile } from "../state/worldStore";

// Canonical district profiles (legacy reference: /docs/legacy/procedural/WORLD_GENERATION.md)
const DISTRICT_PROFILES: DistrictProfile[] = [
	{
		name: "Academy Gate Slums",
		theme: "slums",
		tileDistribution: { base: 0.6, airvent: 0.15, pipes: 0.15, grate: 0.1 },
		enemyTypes: ["street_thug", "scavenger"],
		landmarkCount: 2,
		description: "Makeshift dwellings cluster around the academy entrance",
	},
	{
		name: "Neon Spire District",
		theme: "entertainment",
		tileDistribution: { base: 0.5, glass: 0.2, pipes: 0.2, antenna: 0.1 },
		enemyTypes: ["bouncer", "hacker"],
		landmarkCount: 4,
		description: "Holographic ads and neon signs tower above crowded streets",
	},
	{
		name: "Corporate Pinnacle",
		theme: "corporate",
		tileDistribution: { base: 0.4, glass: 0.4, antenna: 0.15, grate: 0.05 },
		enemyTypes: ["security_bot", "corp_enforcer"],
		landmarkCount: 5,
		description: "Gleaming towers house the Azure megacorporations",
	},
	{
		name: "Reactor Underworks",
		theme: "industrial",
		tileDistribution: { base: 0.3, generator: 0.3, pipes: 0.3, grate: 0.1 },
		enemyTypes: ["maintenance_droid", "mutant"],
		landmarkCount: 3,
		description: "Steam vents and coolant pipes snake through the lower levels",
	},
	{
		name: "Sky Garden Terraces",
		theme: "nature",
		tileDistribution: { base: 0.6, glass: 0.2, antenna: 0.1, airvent: 0.1 },
		enemyTypes: ["gardener_automaton", "bio_experiment"],
		landmarkCount: 4,
		description: "Hydroponic gardens float on upper stratum platforms",
	},
	{
		name: "Transit Hub Chaos",
		theme: "transit",
		tileDistribution: { base: 0.5, grate: 0.2, pipes: 0.2, generator: 0.1 },
		enemyTypes: ["pickpocket", "gang_member"],
		landmarkCount: 3,
		description: "Maglev tracks crisscross above crowded platforms",
	},
	{
		name: "Data Archive Sector",
		theme: "tech",
		tileDistribution: { base: 0.4, antenna: 0.3, glass: 0.2, generator: 0.1 },
		enemyTypes: ["ai_guardian", "netrunner"],
		landmarkCount: 2,
		description: "Server towers hum with encrypted knowledge",
	},
	{
		name: "Martial Arts Quarter",
		theme: "training",
		tileDistribution: { base: 0.7, tarpaper: 0.15, airvent: 0.1, grate: 0.05 },
		enemyTypes: ["dojo_student", "master_trainee"],
		landmarkCount: 5,
		description: "Dojos and training grounds for both academies",
	},
	{
		name: "Black Market Alleys",
		theme: "criminal",
		tileDistribution: { base: 0.5, pipes: 0.2, grate: 0.2, tarpaper: 0.1 },
		enemyTypes: ["smuggler", "yakuza_member"],
		landmarkCount: 3,
		description: "Illicit goods change hands in shadowy passages",
	},
	{
		name: "Skybridge Overlook",
		theme: "transit",
		tileDistribution: { base: 0.3, glass: 0.4, antenna: 0.2, grate: 0.1 },
		enemyTypes: ["sky_patrol", "drone"],
		landmarkCount: 4,
		description: "Glass bridges connect the upper stratum towers",
	},
];

// Strata elevation ranges (as per docs)
const STRATA = {
	upper: { min: 60, max: 100 },
	mid: { min: 0, max: 40 },
	lower: { min: -30, max: 0 },
};

export class WorldGenerator {
	private rng: seedrandom.PRNG;
	private masterSeed: string;

	constructor(seed: string) {
		this.masterSeed = seed;
		this.rng = seedrandom(seed);
	}

	/**
	 * Generate a deterministic set of districts from the master seed
	 * @param count Number of districts to generate (6-9 as per docs)
	 * @returns Array of District objects
	 */
	generateDistricts(count: number = 6): District[] {
		const districts: District[] = [];
		const profileIndices = this.shuffleIndices(DISTRICT_PROFILES.length);

		for (let i = 0; i < Math.min(count, DISTRICT_PROFILES.length); i++) {
			const profileIndex = profileIndices[i];
			const profile = DISTRICT_PROFILES[profileIndex];
			const stratum = this.selectStratum(i, count);
			const elevation = this.generateElevation(stratum);

			const district: District = {
				id: `district_${i}`,
				name: profile.name,
				seed: this.getDistrictSeed(i),
				stratum,
				elevation,
				profile,
			};

			districts.push(district);
		}

		return districts;
	}

	/**
	 * Generate a single canonical district (for MVP - Academy Gate Slums)
	 */
	generateSingleDistrict(): District {
		const profile = DISTRICT_PROFILES[0]; // Academy Gate Slums
		return {
			id: "district_0",
			name: profile.name,
			seed: this.getDistrictSeed(0),
			stratum: "lower",
			elevation: -10,
			profile,
		};
	}

	/**
	 * Get deterministic seed for a specific district
	 */
	getDistrictSeed(districtIndex: number): string {
		return `${this.masterSeed}_d${districtIndex}`;
	}

	/**
	 * Select stratum for district based on index and total count
	 * Distribution: ~30% upper, ~40% mid, ~30% lower
	 */
	private selectStratum(
		index: number,
		totalCount: number,
	): "upper" | "mid" | "lower" {
		const ratio = index / totalCount;
		if (ratio < 0.3) return "lower";
		if (ratio < 0.7) return "mid";
		return "upper";
	}

	/**
	 * Generate elevation within stratum range with some randomness
	 */
	private generateElevation(stratum: "upper" | "mid" | "lower"): number {
		const range = STRATA[stratum];
		return range.min + this.rng() * (range.max - range.min);
	}

	/**
	 * Fisher-Yates shuffle for indices (deterministic)
	 */
	private shuffleIndices(length: number): number[] {
		const indices = Array.from({ length }, (_, i) => i);
		for (let i = indices.length - 1; i > 0; i--) {
			const j = Math.floor(this.rng() * (i + 1));
			[indices[i], indices[j]] = [indices[j], indices[i]];
		}
		return indices;
	}

	/**
	 * Reset RNG to master seed (for regeneration)
	 */
	reset(): void {
		this.rng = seedrandom(this.masterSeed);
	}
}
