# Procedural Architecture (Scenes)

**Updated**: January 27, 2026

**Scope**: Procedural generation is applied to **scenes**, not the story.

---

## Goals

- Deterministic scene layouts per story beat.
- Fast generation on mobile.
- Reusable rules across rooftop, bridge, and waterline scenes.

---

## Seed Strategy

```
sceneSeed = `${storyBeatId}-${districtId}-${variant}`
```

- **storyBeatId**: authored beat (Act1-Intro, Act2-DeepDive, etc.)
- **districtId**: current territory
- **variant**: optional replay flavor

---

## Scene Outputs

- **Layout**: rooftops, bridges, docks, hazards
- **Props**: scatter sets by theme
- **Encounters**: enemy groups and trigger zones
- **Navigation**: walkable surfaces + player bounds

---

## Generation Pipeline

1. **Select Scene Template** based on story beat.
2. **Generate Layout** (tiles + structural blocks).
3. **Place Props** (faction + weather variants).
4. **Spawn Encounters** (combat zones, narrative triggers).
5. **Emit Scene Manifest** for Babylon runtime.

---

## Constraints

- **No neon**. Use weathered materials.
- **Readability first**: silhouette clarity for combat.
- **Mobile budgets**: instancing for tiles/props.

---

## Related Docs

- `/docs/story/STORY_FLOODED.md`
- `/docs/world/FLOODED_WORLD.md`
- `/docs/gameplay/QUEST_SYSTEM.md`
