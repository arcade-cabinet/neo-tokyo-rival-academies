# Neo-Tokyo: Rival Academies - Project Brief

Neo-Tokyo: Rival Academies is a **3-hour Action JRPG** set in a **flooded, post-disaster Neo-Tokyo** where life has moved to rooftops. The game centers on rival academies (Kurenai vs Azure) and a territory-based salvage economy.

## Target Scope

**Playtime**: ~3 hours for a full playthrough
**Structure**: Action JRPG with narrative beats + procedural quests

## Core Requirements

- **3D Isometric Diorama View** with hex-tile grid system
- **JRPG Combat System** with stats-driven damage calculations
- **Narrative Overlay** (visual novel style)
- **GenAI Asset Pipeline** using Meshy AI for production-quality characters
- **Mobile-First Delivery** via Capacitor (Android/iOS)

## Tech Stack (Current)

- **Frontend**: Ionic + Angular (zoneless)
- **3D Engine**: Babylon.js
- **State/Logic**: Miniplex (ECS) + Zustand stores (framework-agnostic usage)
- **Physics**: Rapier
- **Animation**: Anime.js (UI)
- **Build**: Angular tooling + Vite under the hood, PNPM 10
- **Quality**: Biome 2.3, Vitest
- **Native Wrapper**: Capacitor 8

## Key Goals

1. **Production Quality**: No placeholders in shipped builds
2. **Cel-Shaded Aesthetic**: Babylon.js ToonMaterial/meshToonMaterial equivalents
3. **Mobile Performance**: 60 FPS on Pixel 8a baseline
4. **Narrative Depth**: Rivalry system with alignment-driven dialogue

## Characters (9 Generated)

**A-Story Heroes**:
- **Kai** - Kurenai Academy protagonist
- **Vera** - Azure Academy rival

**B-Story Characters**:
- Yakuza Grunt, Yakuza Boss
- Biker Grunt, Biker Boss

**C-Story Disruptors**:
- Mall Security Guard
- Alien Humanoid
- Tentacle Single (prop)

## Current Phase

**Phase 1: Mobile MVP** - Unified Ionic Angular app with Babylon.js + Capacitor.

---

Last Updated: 2026-01-27
