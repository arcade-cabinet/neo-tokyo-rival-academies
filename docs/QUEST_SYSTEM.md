# Quest Generation System v1.0

**Philosophy**: Noun-verb-adjective grammar tables + alignment bias → seeded, reproducible quest clusters.

## Grammar Tables

### 1. Nouns Table (Core Objects/Targets)
| Bucket          | Nouns (examples)                          | Weight |
|-----------------|-------------------------------------------|--------|
| Tech/Corporate  | datavault, passcode, synth-sapphire, drone-core, holo-projector | 0.25 |
| People/Contacts | info-broker, fixer, vendor, runner, hacker | 0.20 |
| Locations/Items | graffiti cache, rooftop antenna, sewer grate, billboard circuit | 0.15 |
| Mysteries       | encrypted file, cursed implant, ancient relic, glowing artifact | 0.20 |
| Threats         | patrol drone, security bot, lurking shadow, corporate enforcer | 0.20 |

### 2. Verbs Table (Actions – Alignment-Biased)
| Alignment Bias  | Verbs                                     | Weight (base) |
|-----------------|-------------------------------------------|---------------|
| Corporate (+ )  | Deliver, Negotiate, Secure, Escort, Report | 0.30 |
| Rebel (- )      | Sabotage, Steal, Destroy, Hack, Expose    | 0.30 |
| Mystery (neutral)| Investigate, Uncover, Eavesdrop, Trace, Decipher | 0.25 |
| Universal       | Retrieve, Find, Defeat, Explore, Activate | 0.15 |

### 3. Adjectives Table (Flavor – District/Theme Biased)
| Theme/District  | Adjectives                                | Weight |
|-----------------|-------------------------------------------|--------|
| Neon/Entertainment | glowing, overbright, flickering, holo-lit, jittery | 0.25 |
| Corporate/Upper | encrypted, secure, elite, pristine, guarded | 0.20 |
| Slum/Lower      | cursed, rusted, hidden, overgrown, damp   | 0.20 |
| Industrial      | industrial, heavy, leaking, sparking, massive | 0.15 |
| Universal       | ancient, mysterious, valuable, dangerous, forgotten | 0.20 |

### 4. Landmarks Table (Locations – Procedural Tie-Ins)
| Type            | Landmarks (seeded from district features) | Examples |
|-----------------|-------------------------------------------|----------|
| Fixed/Procedural| HoloPlaza, Club Eclipse, Central Pillar, Sewer Junction, Rooftop Helipad, Abandoned Reactor | Auto-generated from city rules |
| Dynamic         | back alley, service tunnel, neon boulevard, elevated bridge, underground vault | Placed via noise hotspots |

### 5. Outcomes Table (Rewards/Progression Hooks)
| Type            | Outcomes                                  | Effect |
|-----------------|-------------------------------------------|--------|
| Progression     | unlock the upper elevator, gain rooftop access, reveal the resistance base | Vertical gate / new district |
| Reward          | obtain credits/XP, acquire new gear, shift alignment | Items / stats |
| Narrative       | learn a corporate secret, expose a betrayal, uncover a hidden truth | Dialogue / branch flag |
| Risk/Failure    | trigger alarm, attract enforcers, lose reputation | Combat / chase |

## Quest Generator Implementation (Zustand + Seeded RNG)

```ts
// packages/game/src/systems/QuestGenerator.ts
import seedrandom from 'seedrandom';
import create from 'zustand';

// Alignment scale: -1.0 Kurenai (passion) to +1.0 Azure (logic)
interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'secret';
  alignmentShift: number; // Applied on completion
  reward: { xp: number; item?: string; unlock?: string };
  completed: boolean;
}

interface QuestCluster {
  district: string;
  main: Quest;
  sides: Quest[];
  secret?: Quest;
}

interface QuestStore {
  alignment: number; // -1.0 to +1.0
  activeCluster?: QuestCluster;
  completedQuests: string[];
  generateCluster: (seed: string, districtProfile: DistrictProfile) => void;
  completeQuest: (questId: string) => void;
  shiftAlignment: (amount: number) => void;
}

const useQuestStore = create<QuestStore>((set, get) => ({
  alignment: 0.0,
  completedQuests: [],
  generateCluster: (seed: string, districtProfile: DistrictProfile) => {
    const rng = seedrandom(seed);
    const { alignment } = get();

    // Bias weights by alignment + district
    const bias = alignment > 0.3 ? 'azure' : alignment < -0.3 ? 'kurenai' : 'neutral';

    // (Tables logic here)
    // ...
    // Generate main (vertical spine)
    const mainVerb = pick(getBiasedArray(verbs.universal, bias as any));
    const mainAdj = pick([...adjectives.universal, ...adjectives[districtProfile.themeKey]]);
    const mainNoun = pick(nouns);
    const mainLandmark = pick(landmarks);
    const mainOutcome = pick(outcomes.filter(o => o.includes('unlock') || o.includes('reveal'))); // Progression focus

    const main: Quest = {
      id: `${seed}-main`,
      title: `${mainVerb} the ${mainAdj} ${mainNoun}`,
      description: `${mainVerb} the ${mainAdj} ${mainNoun} at ${mainLandmark} to ${mainOutcome}.`,
      type: 'main',
      alignmentShift: alignment > 0 ? 0.3 : alignment < 0 ? -0.3 : 0.1 * (rng() > 0.5 ? 1 : -1),
      reward: { xp: 300, unlock: 'next-stratum-elevator' },
      completed: false,
    };
    // Sides/Secret generation...
    // ...
    set({ activeCluster: cluster });
  },
  // ...
}));
```