const WORD_POOLS = {
  adjectives: [
    'crimson',
    'azure',
    'rust',
    'storm',
    'mist',
    'tide',
    'brine',
    'salt',
    'hollow',
    'shadow',
    'ember',
    'fog',
    'rain',
    'flood',
    'drift',
    'broken',
    'salvage',
    'drowned',
    'silent',
    'lantern',
    'wind',
    'iron',
    'jade',
    'onyx',
    'amber',
    'cobalt',
    'frozen',
    'ancient',
    'forgotten',
    'hidden',
    'sacred',
    'fallen',
    'rising',
    'waking',
    'living',
    'lost',
    'found',
    'bitter',
    'gentle',
    'wild',
    'loyal',
  ],
  nouns: [
    'phoenix',
    'lotus',
    'anchor',
    'skiff',
    'bridge',
    'barge',
    'harbor',
    'current',
    'wave',
    'storm',
    'tide',
    'reef',
    'shrine',
    'market',
    'dock',
    'rooftop',
    'tower',
    'spire',
    'garden',
    'forge',
    'station',
    'sanctum',
    'vault',
    'ruins',
    'heights',
    'depths',
    'crossing',
    'alley',
    'terrace',
    'yard',
    'plaza',
    'lantern',
    'runner',
    'diver',
    'sentinel',
    'echo',
    'signal',
    'spark',
    'flame',
    'moon',
    'sun',
  ],
  locations: [
    'academy',
    'tower',
    'shrine',
    'dock',
    'market',
    'garden',
    'forge',
    'port',
    'district',
    'plaza',
    'clinic',
    'temple',
    'fortress',
    'bunker',
    'station',
    'terminal',
    'hub',
    'sanctum',
    'vault',
    'ruins',
    'heights',
    'depths',
    'crossing',
    'bridge',
    'alley',
    'rooftop',
    'warehouse',
    'factory',
    'spire',
    'arena',
    'haven',
    'refuge',
    'outpost',
    'frontier',
    'edge',
    'terrace',
    'yard',
    'canal',
    'dockline',
    'salvage',
  ],
} as const;

export type SeedPhrase = `${string}-${string}-${string}`;

export function generateSeedPhrase(): SeedPhrase {
  const rng = Math.random;
  const adj = WORD_POOLS.adjectives[Math.floor(rng() * WORD_POOLS.adjectives.length)];
  const noun = WORD_POOLS.nouns[Math.floor(rng() * WORD_POOLS.nouns.length)];
  const loc = WORD_POOLS.locations[Math.floor(rng() * WORD_POOLS.locations.length)];
  return `${adj}-${noun}-${loc}` as SeedPhrase;
}

export function isValidSeedPhrase(phrase: string): phrase is SeedPhrase {
  const parts = phrase.toLowerCase().split('-');
  if (parts.length !== 3) return false;

  const [adj, noun, loc] = parts;
  return (
    (WORD_POOLS.adjectives as readonly string[]).includes(adj) &&
    (WORD_POOLS.nouns as readonly string[]).includes(noun) &&
    (WORD_POOLS.locations as readonly string[]).includes(loc)
  );
}

export function suggestCompletions(partial: string): {
  adjectives: string[];
  nouns: string[];
  locations: string[];
} {
  const parts = partial.toLowerCase().split('-');
  const current = parts[parts.length - 1] || '';

  const filterMatching = (words: readonly string[]) =>
    words.filter((w) => w.startsWith(current)).slice(0, 5);

  if (parts.length === 1) {
    return {
      adjectives: filterMatching(WORD_POOLS.adjectives),
      nouns: [],
      locations: [],
    };
  }
  if (parts.length === 2) {
    return {
      adjectives: [],
      nouns: filterMatching(WORD_POOLS.nouns),
      locations: [],
    };
  }
  return {
    adjectives: [],
    nouns: [],
    locations: filterMatching(WORD_POOLS.locations),
  };
}
