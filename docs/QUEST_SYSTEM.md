# Quest System

> **Purpose**: Define the procedural quest generation grammar and cluster system.

## Overview

Quests are generated using **noun-verb-adjective grammars** with alignment bias. This creates coherent, varied content without runtime AI—all deterministic from seeds.

## Quest Grammar Structure

### Template Patterns

```text
Main Quest:  "[Verb] the [Adjective] [Noun] at [Landmark] to [Outcome]."
Side Quest:  "[Verb] the [Adjective] [Noun] near [Landmark]."
Secret:      "Discover the hidden [Adjective] [Noun] that reveals [Outcome]."
```

### Grammar Tables

#### Verbs (Action Words)

| Category | Universal | Azure Bias | Kurenai Bias |
|----------|-----------|------------|--------------|
| Primary | Retrieve, Find, Defeat, Explore, Activate | Negotiate, Secure, Hack, Report, Decipher | Sabotage, Destroy, Escort, Expose, Challenge |
| Weight | 0.5 | +0.3 if alignment > 0.3 | +0.3 if alignment < -0.3 |

#### Adjectives (Descriptors)

| Theme | Options |
|-------|---------|
| Universal | ancient, mysterious, valuable, dangerous, hidden |
| Neon | glowing, flickering, overbright, holo-lit, sparking |
| Corporate | encrypted, elite, pristine, guarded, secure |
| Slum | cursed, rusted, overgrown, damp, forgotten |
| Industrial | heavy, sparking, massive, leaking |

#### Nouns (Objects/Targets)

| Category | Options |
|----------|---------|
| Data | datavault, passcode, data-core, chip, archive |
| Items | synth-sapphire, trophy, badge, relic, implant |
| People | info-broker, fixer, cadet, mentor, enforcer |
| Tech | drone-core, antenna, reactor, simulator |

#### Landmarks

| District Type | Landmarks |
|---------------|-----------|
| Neon | HoloPlaza, Club Eclipse, Neon Boulevard, VIP Lounge |
| Corporate | Central Pillar, Rooftop Helipad, Elite Office, Secure Vault |
| Slum | Gate Plaza, Sewer Junction, Overgrown Alley, Graffiti Cache |
| Industrial | Forge Core, Reactor Chamber, Service Tunnel |

#### Outcomes (Rewards/Unlocks)

| Type | Options |
|------|---------|
| Progression | unlock the elevator, access next stratum, unlock faction HQ |
| Faction | gain faction respect, reveal alliance, trigger rivalry event |
| Tangible | obtain credits, receive gear, discover secret |
| Information | reveal a secret, uncover conspiracy, learn faction lore |

## Quest Cluster Structure

Each district/act generates a **cluster** of related quests:

```typescript
interface QuestCluster {
  district: string;
  act: number;
  seed: string;
  main: Quest;        // 1 spine quest (vertical progression)
  sides: Quest[];     // 3-6 exploration quests (horizontal)
  secret?: Quest;     // 0-1 hidden discovery
}
```

## Quest Generator Implementation

```typescript
// src/systems/QuestGenerator.ts
import seedrandom from 'seedrandom';
import { create } from 'zustand';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'secret';
  alignmentShift: number;
  reward: { xp: number; item?: string; unlock?: string };
  completed: boolean;
}

interface QuestStore {
  alignment: number;
  activeCluster?: QuestCluster;
  completedQuests: string[];
  generateCluster: (seed: string, profile: DistrictProfile) => void;
  completeQuest: (questId: string) => void;
}

const useQuestStore = create<QuestStore>((set, get) => ({
  alignment: 0.0,
  completedQuests: [],

  generateCluster: (seed: string, profile: DistrictProfile) => {
    const rng = seedrandom(seed);
    const { alignment } = get();

    // Determine bias
    const bias = alignment > 0.3 ? 'azure' : alignment < -0.3 ? 'kurenai' : 'neutral';

    // Grammar tables
    const verbs = {
      universal: ['Retrieve', 'Find', 'Defeat', 'Explore', 'Activate'],
      azure: ['Negotiate', 'Secure', 'Hack', 'Report', 'Decipher'],
      kurenai: ['Sabotage', 'Destroy', 'Escort', 'Expose', 'Challenge'],
    };

    const adjectives = {
      universal: ['ancient', 'mysterious', 'valuable', 'dangerous'],
      neon: ['glowing', 'flickering', 'overbright', 'holo-lit'],
      corporate: ['encrypted', 'elite', 'pristine', 'guarded'],
      slum: ['cursed', 'rusted', 'overgrown', 'damp'],
    };

    const nouns = ['datavault', 'passcode', 'synth-sapphire', 'drone-core',
                   'info-broker', 'fixer', 'graffiti cache', 'antenna'];

    const landmarks = ['HoloPlaza', 'Club Eclipse', 'Gate Plaza',
                       'Sewer Junction', 'Rooftop Helipad', 'Central Pillar'];

    const outcomes = ['unlock the elevator', 'gain faction respect',
                      'obtain credits', 'reveal a secret'];

    // Helper functions
    const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
    const biasedVerbs = [...verbs.universal, ...(verbs[bias] || [])];
    const themeAdj = [...adjectives.universal, ...(adjectives[profile.themeKey] || [])];

    // Generate main quest
    const main: Quest = {
      id: `${seed}-main`,
      title: `${pick(biasedVerbs)} the ${pick(themeAdj)} ${pick(nouns)}`,
      description: `${pick(biasedVerbs)} the ${pick(themeAdj)} ${pick(nouns)} at ${pick(landmarks)} to ${pick(outcomes)}.`,
      type: 'main',
      alignmentShift: bias === 'azure' ? 0.3 : bias === 'kurenai' ? -0.3 : 0.1,
      reward: { xp: 300, unlock: 'next-stratum' },
      completed: false,
    };

    // Generate sides
    const sideCount = 3 + Math.floor(rng() * 4);
    const sides: Quest[] = [];
    for (let i = 0; i < sideCount; i++) {
      sides.push({
        id: `${seed}-side-${i}`,
        title: `${pick(biasedVerbs)} the ${pick(themeAdj)} ${pick(nouns)}`,
        description: `${pick(biasedVerbs)} the ${pick(themeAdj)} ${pick(nouns)} near ${pick(landmarks)}.`,
        type: 'side',
        alignmentShift: 0.1 * (rng() > 0.5 ? 1 : -1),
        reward: { xp: 100 + Math.floor(rng() * 100) },
        completed: false,
      });
    }

    // Generate secret
    const secret: Quest = {
      id: `${seed}-secret`,
      title: `Discover the hidden ${pick(themeAdj)} ${pick(nouns)}`,
      description: `Uncover the secret that ${pick(outcomes)}.`,
      type: 'secret',
      alignmentShift: 0.15 * (rng() > 0.5 ? 1 : -1),
      reward: { xp: 200, item: 'mystery-relic' },
      completed: false,
    };

    set({ activeCluster: { district: profile.name, main, sides, secret } });
  },

  completeQuest: (questId: string) => {
    set((state) => {
      const { activeCluster } = state;
      if (!activeCluster) return state;

      // Find and mark complete
      const allQuests = [activeCluster.main, ...activeCluster.sides, activeCluster.secret];
      const quest = allQuests.find(q => q?.id === questId);

      if (quest && !quest.completed) {
        quest.completed = true;
        return {
          ...state,
          alignment: Math.max(-1, Math.min(1, state.alignment + quest.alignmentShift)),
          completedQuests: [...state.completedQuests, questId],
        };
      }
      return state;
    });
  },
}));

export { useQuestStore };
```

## Cluster Examples

### Academy Gate Slums (Act 1, Cluster 1)

**Seed**: `"NeoTokyo-v1-district-1-act1"`

**Generated Cluster**:
- **Main**: "Investigate the flickering holo-invite at Gate Plaza to unlock the Selection Ceremony."
- **Side 1**: "Retrieve the rusted academy badge from lurking vendor in overgrown alley."
- **Side 2**: "Eavesdrop on the jittery runners discussing faction secrets."
- **Side 3**: "Sabotage the corporate recruitment drone patrolling the gate."
- **Secret**: "Discover the hidden graffiti cache that reveals a resistance contact."

### Neon Spire (Act 2, Cluster 3)

**Seed**: `"NeoTokyo-v1-district-2-act2"`

**Generated Cluster**:
- **Main**: "Infiltrate the overbright HoloPlaza vault to retrieve the glowing data-core."
- **Side 1**: "Negotiate with the elite fixer at Club Eclipse for intel."
- **Side 2**: "Sabotage the flickering security cams in the back alleys."
- **Side 3**: "Retrieve the valuable synth-drink from jittery vendor."
- **Side 4**: "Eavesdrop on the corporate meeting in VIP lounge."
- **Secret**: "Discover the hidden resistance cache behind the graffiti mural."

## Alignment Integration

Quest generation responds to current alignment:

| Alignment Range | Verb Bias | Adjective Flavor | Side Quest Ratio |
|-----------------|-----------|------------------|------------------|
| < -0.6 (Extreme Kurenai) | 70% passion verbs | aggressive | More sabotage/challenge |
| -0.6 to -0.3 | 50% passion verbs | mixed | Balanced |
| -0.3 to +0.3 (Neutral) | Universal only | neutral | Balanced |
| +0.3 to +0.6 | 50% logic verbs | mixed | Balanced |
| > +0.6 (Extreme Azure) | 70% logic verbs | calculated | More negotiate/secure |

## UI Integration

```tsx
// In HUD component
const QuestLog: FC = () => {
  const { activeCluster, completeQuest } = useQuestStore();

  if (!activeCluster) return null;

  return (
    <div className="quest-log">
      <h3>Active Quests</h3>
      <QuestItem quest={activeCluster.main} onComplete={completeQuest} />
      {activeCluster.sides.map(q => (
        <QuestItem key={q.id} quest={q} onComplete={completeQuest} />
      ))}
    </div>
  );
};
```

---

*Every quest traces to a seed. Reproducible, testable, balanced.*
