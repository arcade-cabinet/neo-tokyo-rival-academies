# Community & Expansion

> **Purpose**: Define post-launch community features and expansion content hooks.

## Seed Sharing System

### Philosophy
Every playthrough is deterministic from a master seed. Players can share their world configurations, creating a community of unique Neo-Tokyo variants.

### Seed URL Format

```
https://neotokyo.game/?seed=<base64-encoded-seed>
```

**Example**:
```
https://neotokyo.game/?seed=Sm9uLU5lb1Rva3lvLTIwMjYtdjE=
// Decodes to: "Jon-NeoTokyo-2026-v1"
```

### Shareable Elements

| Element | Shared via Seed | Notes |
|---------|-----------------|-------|
| District layout | Yes | Deterministic from seed |
| Quest content | Yes | Grammar generates same |
| Building placement | Yes | Noise-based |
| Enemy spawns | Yes | Position/type |
| Item drops | Yes | Loot tables seeded |
| Weather patterns | Yes | Per-district seed |

### NOT Shared

| Element | Why |
|---------|-----|
| Player progress | Personal data |
| Alignment choices | Player agency |
| Completion status | Spoiler prevention |

### Implementation

```typescript
// Generate shareable URL
const getShareableURL = (): string => {
  const seed = useWorldStore.getState().masterSeed;
  const encoded = btoa(seed);
  return `${window.location.origin}?seed=${encoded}`;
};

// Parse seed from URL
const parseSeedFromURL = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('seed');
  if (encoded) {
    try {
      return atob(encoded);
    } catch {
      return null;
    }
  }
  return null;
};
```

### Share UI

```tsx
const ShareButton: FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = getShareableURL();

    if (navigator.share) {
      // Native share on mobile
      await navigator.share({
        title: 'My Neo-Tokyo World',
        text: 'Check out my Neo-Tokyo seed!',
        url,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button onClick={handleShare}>
      {copied ? 'Copied!' : 'Share World Seed'}
    </button>
  );
};
```

---

## User-Generated Content

### Custom Manifests (Future)

Allow players to create custom asset manifests for:
- Character skins
- Tile variants
- Background themes

**Manifest Format**:
```json
{
  "type": "user_manifest",
  "author": "PlayerName",
  "version": "1.0.0",
  "assets": [
    {
      "id": "custom-tile-neon-pink",
      "type": "tile",
      "concept": "Neon pink hex tile, cyberpunk aesthetic",
      "replaces": "tile-neon-base"
    }
  ]
}
```

### Moderation Rules

| Content Type | Allowed | Review Required |
|--------------|---------|-----------------|
| Tile textures | Yes | Auto-scan |
| Character skins | Yes | Manual review |
| Quest text | No | N/A |
| Sound effects | No | N/A |

---

## Expansion Content Hooks

### New Districts (Post-Launch)

The district system is designed for expansion:

```typescript
// Add new district profile
const newDistrictProfile: DistrictProfile = {
  id: 'expansion-skyline',
  name: 'Skyline Penthouse Zone',
  themeKey: 'corporate',
  density: 0.95,
  verticalBias: 'upper',
  questAffinity: ['negotiate', 'secure', 'report'],
  factionTie: 'azure',
  visualRules: {
    buildingHeight: [80, 150],
    neonIntensity: 0.3,
    overgrowth: false,
    hasRoads: false, // Sky bridges only
  },
  signatureLandmark: 'Elite penthouse with panoramic Neo-Tokyo view',
};
```

### New Quest Clusters

Expansion clusters slot into existing act structure:

| Expansion | Act | Cluster Name | Theme |
|-----------|-----|--------------|-------|
| Pack 1 | 2 | Underground Racing | Speed challenge |
| Pack 1 | 3 | Corporate Heist | Stealth Azure |
| Pack 2 | 2 | Resistance Cell | Sabotage Kurenai |
| Pack 2 | 3 | Vera's Past | Rivalry lore |

### New Endings

Additional ending variants for extreme alignment combinations:

| Condition | Ending Name |
|-----------|-------------|
| Max Kurenai + Vera ally | Crimson Partnership |
| Max Azure + Vera enemy | Cold Victory |
| Perfect neutral | True Balance |
| NG+3 completion | Legacy ending |

---

## Community Features

### Leaderboards (Optional)

| Category | Metric |
|----------|--------|
| Speedrun | Time to credits |
| Completionist | % secrets found |
| Alignment extremist | Max/min alignment |
| Pacifist | Enemies avoided |

**Privacy**: Opt-in only, no personal data

### Seed Challenges

Weekly/monthly community challenges:

```typescript
interface SeedChallenge {
  id: string;
  seed: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  criteria: {
    type: 'speedrun' | 'alignment' | 'completion' | 'custom';
    target: number | string;
  };
}

// Example
const weeklyChallenge: SeedChallenge = {
  id: 'week-2026-45',
  seed: 'Community-Challenge-Week45-2026',
  name: 'The Azure Gauntlet',
  description: 'Reach max Azure alignment before Act 2',
  startDate: new Date('2026-11-04'),
  endDate: new Date('2026-11-10'),
  criteria: {
    type: 'alignment',
    target: 0.8,
  },
};
```

### Discord Integration (Future)

- Share seeds to Discord channel
- Challenge notifications
- Achievement announcements

---

## Post-Launch Roadmap

### Month 1-3: Community Foundation
- [ ] Seed sharing v1
- [ ] Share button in credits
- [ ] Community Discord setup
- [ ] Bug fix patches

### Month 4-6: First Expansion
- [ ] 2 new districts
- [ ] 4 new quest clusters
- [ ] New enemy types
- [ ] Balance adjustments

### Month 7-12: Growth
- [ ] User manifests (beta)
- [ ] Weekly challenges
- [ ] Leaderboards (opt-in)
- [ ] Additional endings

### Year 2+
- [ ] Major expansion pack
- [ ] Community tools
- [ ] Mod support consideration

---

## Feedback Collection

### In-Game Survey (Post-Credits)

```typescript
interface PostGameSurvey {
  overallRating: 1 | 2 | 3 | 4 | 5;
  favoriteDistrict?: string;
  favoriteQuest?: string;
  alignmentSatisfaction: 1 | 2 | 3 | 4 | 5;
  wouldRecommend: boolean;
  feedbackText?: string; // Max 500 chars
}
```

### Bug Reporting

In-game bug report button:
- Captures seed
- Captures current state (no personal data)
- Optional screenshot
- Sends to issue tracker

---

## Success Metrics

| Metric | Target | Tracking |
|--------|--------|----------|
| Plays (first quarter) | 10k+ | Analytics |
| Completion rate | > 30% | Analytics |
| Seed shares | 1000+ | URL tracking |
| Community members | 500+ | Discord |
| Average rating | 4.0+ | Store reviews |

---

*Build the game. Build the community. Let players own their Neo-Tokyo.*
