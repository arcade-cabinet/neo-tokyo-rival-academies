# Deprecations & Ignore Guide

**Last Updated**: January 26, 2026

---

## CRITICAL: Unity 6 Migration Complete (January 2026)

The game runtime has been **fully migrated from TypeScript/Babylon.js to Unity 6 DOTS**. The entire TypeScript runtime is now deprecated and archived.

### TypeScript Runtime Deprecations (COMPLETE)

The following are **ARCHIVED** in `_reference/` and must **NOT** be used:

| Deprecated Technology | Replacement |
|----------------------|-------------|
| **TypeScript Game Runtime** | Unity 6 C# |
| **Babylon.js / Reactylon** | Unity URP |
| **Miniplex ECS** | Unity DOTS Entities |
| **Zustand Stores** | Unity ScriptableObjects / DOTS singletons |
| **YukaJS Navigation** | Unity AI Navigation |
| **React Three Fiber** | Unity native rendering |
| **Vite Dev Server (game)** | Unity Editor |
| **Capacitor (runtime)** | Unity native builds |

**Location of archived code**: `_reference/typescript-runtime/`

### Migration Paths (TypeScript to Unity)

For agents needing to understand how old TypeScript patterns map to Unity:

| TypeScript Pattern | Unity 6 Equivalent | Notes |
|-------------------|-------------------|-------|
| `Miniplex world` | `World` (DOTS) | Entity management |
| `world.add(entity, component)` | `ecb.AddComponent<T>(entity)` | Use EntityCommandBuffer |
| `useQuery<T>()` | `SystemAPI.Query<T>()` | Burst-compiled iteration |
| `createSystem()` | `partial struct : ISystem` | DOTS systems |
| `Zustand store` | `ScriptableObject` or singleton | State management |
| `useFrame()` | `OnUpdate(ref SystemState)` | Per-frame logic |
| `<mesh>` JSX | Unity Prefab | Visual elements |
| `Rapier physics` | Havok Physics | Built into Unity 6 |
| `YukaJS pathfinding` | AI Navigation | Unity NavMesh |
| `seedrandom` | `Unity.Mathematics.Random` | Deterministic RNG |
| `Vite dev server` | Unity Editor | Development environment |
| `Capacitor` | Unity native builds | Mobile deployment |

### What REMAINS in TypeScript (Build-Time Tools Only)

| Package | Purpose | Status |
|---------|---------|--------|
| `dev-tools/content-gen` | Meshy/Gemini asset generation | ACTIVE |
| `dev-tools/e2e` | Playwright E2E tests | ACTIVE |
| `dev-tools/types` | Shared type definitions | ACTIVE |
| `dev-tools/shared-assets` | Asset manifests | ACTIVE |

---

## What to Ignore (Dead Ends / Superseded Ideas)

### Technical Deprecations

- **Pure Babylon.js (imperative)**: Early discussions on vanilla Babylon setup, ArcRotateCamera without JSX, manual dispose/parenting. **FULLY DEPRECATED** - now using Unity.
- **Reactylon declarative rendering**: Replaced by Unity URP and native rendering.
- **Non-Reactylon declarative attempts**: Any react-babylonjs mentions or generic JSX.
- **Heavy runtime GenAI**: Ideas relying on live Meshy API calls during play - **ignore**; we use build-time manifest pipeline only.
- **Open-world infinity / MMO / gacha**: Explicitly excluded per pillars.
- **Early combat jank obscuring**: DBZ explosions hiding limbs - superseded by stats-driven, visible-preview system.
- **Non-seeded randomness**: All Math.random() without seedrandom - **replace** with deterministic RNG (now Unity.Mathematics.Random with seeds).
- **YukaJS Navigation**: Replaced by Unity AI Navigation and custom NavigationSystem.
- **Three.js/R3F**: Replaced by Unity URP rendering pipeline.

### Narrative/Aesthetic Deprecations (Jan 19, 2026)

- **Cyberpunk Neon Aesthetic**: COMPLETELY DEPRECATED. No neon lights, no corporate chrome, no high-tech displays. Replaced by flooded post-apocalyptic world with weathered materials, natural lighting (lanterns, bonfires, sunlight), salvage tech.
- **"Midnight Exam" Race Storyline**: Replaced by "The Descent" salvage competition in STORY_FLOODED.md
- **NARRATIVE_DESIGN.md**: DELETED. Content translated to STORY_FLOODED.md
- **STORY_ARCS.md**: DELETED. Content translated to STORY_FLOODED.md
- **Neon Slums, HoloPlaza, etc.**: Old cyberpunk locations - **ignore**. Use rooftop territories, flooded zones, markets.
- **Pink/Green Neon UI Colors**: DEPRECATED. Use blues + rust/amber palette per DESIGN_PHILOSOPHY.md

### Design Anchor Principle

The "pre-flood" world is anchored to **2020s-2030s** (our current era), NOT retro-futurism like Fallout's 1950s. See WORLD_TIMELINE.md for full timeline.

**Typography**: Technical Precision (Rajdhani + Inter) - modern, digital-native fonts that would appear on 2030s infrastructure.

---

## Core Canon to Preserve & Build On

**Current Truth as of January 25, 2026**:

### Technical (Unity 6)

- **Unity 6 DOTS**: Entities, Burst, Collections, Mathematics
- **URP Rendering**: Cel-shaded, weathered materials
- **Seeded procedural generation**: Master/sub-seeds using Unity.Mathematics.Random
- **Meshy build-time pipeline**: JSON manifests consumed by ManifestLoader
- **Mobile-first**: Unity native builds, 60fps on Pixel 8a baseline
- **Test-Driven Development**: EditMode tests before implementation

### Narrative

- Flooded World setting (see FLOODED_WORLD.md, WORLD_TIMELINE.md)
- Year 40 post-flood timeline
- Academy rivalry (Kurenai vs Azure)
- Kai vs Vera character dynamics
- "The Descent" as main competition storyline
- Procedural quests with hand-crafted story beats (Daggerfall model)

### Design

- Blues as primary color (water theme, accessibility)
- Rust/amber complementary accents
- Weathered materials palette (rust, concrete, salvaged wood)
- Natural lighting (NO NEON)
- Technical Precision typography (Rajdhani headers, Inter body)

### Game Systems

- 4 stats (Structure/Ignition/Logic/Flow)
- Alignment rivalry axis (-1.0 Kurenai passion to +1.0 Azure logic)
- Territory-based world structure
- Salvage economy

---

## Document Structure

| Content Type | Current File | Status |
|--------------|--------------|--------|
| **Architecture** | UNITY_6_ARCHITECTURE.md | **NEW** - Active |
| Migration Plan | UNITY_MIGRATION.md | Active |
| Vision & Pillars | DESIGN_PHILOSOPHY.md | Active |
| World Setting | FLOODED_WORLD.md | Active |
| Timeline & Backstory | WORLD_TIMELINE.md | Active |
| Story & Narrative | STORY_FLOODED.md | Active |
| Geography | WORLD_GEOGRAPHY.md | Active |
| Block Architecture | MODULAR_ASSEMBLY_SYSTEM.md | Active |
| Procedural World | PROCEDURAL_WORLD_ARCHITECTURE.md | Active |
| GenAI Pipeline | GENAI_PIPELINE.md | Active |
| Deprecations | DEPRECATIONS.md | This file |

**Deleted/Archived Files**:
- NARRATIVE_DESIGN.md -> STORY_FLOODED.md
- STORY_ARCS.md -> STORY_FLOODED.md
- TECH_ARCHITECTURE.md -> UNITY_6_ARCHITECTURE.md (superseded)
- TypeScript runtime -> `_reference/typescript-runtime/`

---

## The Daggerfall Principle

If Bethesda could create a world the size of Great Britain with branching storylines on a 486 processor with 8MB RAM in 1996, we can do better with modern tech.

**The formula**:
1. **Hand-craft the story beats** - Small amount of curated content
2. **Procedurally generate everything else** - Templates + seeds = infinite content
3. **Let player choices ripple** - Faction reputation affects generated content

This is why the Block system exists. Procedural world, injected story.

---

## Migration Reference

For agents needing to understand the old TypeScript patterns for context:

| Old Pattern | New Unity Pattern |
|-------------|-------------------|
| `ECSEntity` type | `Entity` struct |
| `world.add(entity, component)` | `ecb.AddComponent<T>(entity)` |
| `useQuery<T>()` | `SystemAPI.Query<T>()` |
| `createSystem()` | `partial struct : ISystem` |
| `Zustand store` | `ScriptableObject` or DOTS singleton |
| `useFrame()` | `OnUpdate(ref SystemState)` |
| `<mesh>` JSX | Unity Prefab |

---

## Archived Documentation

The following documentation files are archived and marked with `[ARCHIVED]` or `[HISTORICAL]` prefixes:

| File | Status | Notes |
|------|--------|-------|
| `BABYLON_MIGRATION_PLAN.md` | ARCHIVED | Planned Babylon.js migration, superseded by Unity |
| `REACTYLON_MIGRATION.md` | ARCHIVED | Reactylon evaluation, superseded by Unity |
| `ARCHITECTURE_PIVOT_NATIVE.md` | HISTORICAL | Babylon Native pivot, superseded by Unity |
| `MOBILE_WEB_GUIDE.md` | DELETED | Replaced by MOBILE_NATIVE_GUIDE.md (Unity) |

These files are kept for historical reference to understand the project's evolution.

---

*Agents: Always check this file before implementing features. The game runtime is Unity 6 DOTS - do not reference or use TypeScript runtime patterns.*
