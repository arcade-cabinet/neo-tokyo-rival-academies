# Neo-Tokyo: Rival Academies - Project Brief

Neo-Tokyo: Rival Academies is a **~3 hour Action JRPG** built with modern web technologies. Set in a neon-lit cyberpunk metropolis, players navigate the rivalry between two elite academies competing for supremacy through "The Midnight Exam" - an illegal underground race through Neo-Tokyo's rooftops.

## Target Scope

**Playtime**: ~3 hours if playing through ALL required and optional storyline content
**Structure**: A/B/C Story Architecture (Japanese JRPG anime style)

## Core Requirements

- **3D Isometric Diorama View** with hex-tile grid system
- **JRPG Combat System** with stats-driven damage calculations
- **A/B/C Story Architecture**: Main rivalry (A), parallel development (B), disruptor team-ups (C)
- **GenAI Asset Pipeline** using Meshy AI for production-quality characters
- **Visual Novel Dialogue** for narrative progression
- **Mobile-Ready** via Capacitor for native deployment

## Tech Stack

- **Frontend**: React 19, Three.js 0.182, React Three Fiber 9.x
- **3D Framework**: Isometric camera, hex grid utilities
- **State**: Miniplex (ECS) + Zustand
- **Physics**: Rapier (via @react-three/rapier)
- **GenAI**: Meshy AI (text-to-image, image-to-3D, rigging, animations)
- **Build**: Vite 6.x, PNPM 10
- **Quality**: Biome (lint/format), Vitest (unit), Playwright (E2E)

## Key Goals

1. **Production Quality**: No placeholders, high-fidelity GLB assets
2. **Cel-Shaded Aesthetic**: meshToonMaterial for anime visual style
3. **Deep Narrative**: LLM-driven dialogue with rival characters
4. **Kinetic Combat**: Stats-based JRPG with real-time elements

## Characters (9 Generated)

**A-Story Heroes** (Hero preset - 7 animations):
- **Kai** - Kurenai Academy protagonist, "Ignition" philosophy
- **Vera** - Azure Academy rival, "Calculation" philosophy

**B-Story Characters** (Enemy/Boss presets):
- Yakuza Grunt, Yakuza Boss - Street-level encounters
- Biker Grunt, Biker Boss - Highway territory conflicts

**C-Story Disruptors** (Enemy preset + Prop):
- Mall Security Guard - Mall Drop stage enemy
- Alien Humanoid - Alien Ship stage enemy
- Tentacle Single (prop) - Yuka-driven boss mechanics

## Story Structure

- **A Story**: Kai vs Vera rivalry through 8-10 major beats
- **B Story**: Parallel character development, academy politics, lore
- **C Story**: Disruptor events (alien abduction, mall drop) forcing team-ups

## Current Phase

**MVP**: Isometric diorama prototype with hex grid, character loading, and basic combat framework.

---

Last Updated: 2026-01-16
