# Quest System v1.0

**Updated**: January 27, 2026

**Philosophy**: Grammar-driven quest clusters with alignment bias. Story quests are authored; side objectives are procedural per scene.

---

## Quest Types

- **Main**: Authored, required to progress story beats.
- **Side**: Procedural tasks tied to a scene’s context.
- **Secret**: Optional, alignment-leaning rewards.

---

## Grammar Tables (Flooded World)

### 1. Nouns (Targets)
| Bucket | Examples | Weight |
|--------|----------|--------|
| Salvage | water filters, boat parts, power cells, air tanks | 0.30 |
| People | courier, diver, merchant, academy scout | 0.20 |
| Locations | bridge span, rooftop antenna, market dock, shrine stairs | 0.20 |
| Artifacts | pre-flood archive, sealed locker, data core | 0.15 |
| Threats | canal pirate, scavenger crew, rogue drone | 0.15 |

### 2. Verbs (Actions, Alignment-Biased)
| Alignment Bias | Verbs | Weight |
|----------------|-------|--------|
| Kurenai (Passion) | raid, sabotage, reclaim, defend, challenge | 0.30 |
| Azure (Logic) | negotiate, secure, escort, map, report | 0.30 |
| Neutral | retrieve, investigate, recover, navigate, repair | 0.25 |
| Universal | find, protect, deliver, clear | 0.15 |

### 3. Adjectives (Flavor)
| Theme | Examples | Weight |
|-------|----------|--------|
| Flooded | submerged, waterlogged, rusted, salt-worn | 0.30 |
| Faction | contested, guarded, restricted, sacred | 0.30 |
| Environmental | storm-battered, fogbound, unstable | 0.20 |
| Universal | urgent, covert, abandoned | 0.20 |

### 4. Landmarks (Scene Anchors)
| Type | Examples |
|------|----------|
| Rooftops | bridge pylons, tarp shelters, solar racks |
| Waterline | dock spurs, ferry slips, crane barges |
| Deep | flooded stairwell, collapsed atrium, submerged archive |

### 5. Outcomes (Rewards/Progression)
| Type | Effect |
|------|--------|
| Progression | unlock scene exit, reveal new story beat |
| Reward | XP, credits, gear, alignment shift |
| Narrative | new dialogue node, faction favor |
| Risk | ambush, reputation loss, time pressure |

---

## Implementation (TypeScript)

- `src/lib/core/src/systems/QuestGenerator.ts`
- `src/lib/core/src/state/questStore.ts`
- `src/lib/core/src/state/playerStore.ts`

The generator uses deterministic seeds per scene to create a **quest cluster**: 1 main, 2 side, 1 secret.

---

## Alignment Hooks

- Kurenai-leaning verbs award Ignition/Flow shifts.
- Azure-leaning verbs award Logic/Structure shifts.
- Secrets bias more heavily and unlock faction-specific rewards.

---

Last Updated: 2026-01-27
