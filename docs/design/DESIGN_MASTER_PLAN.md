# Neo-Tokyo: Rival Academies - Master Design Plan

**Updated**: January 27, 2026 | **Platform**: Ionic Angular + Babylon.js

## 1. Vision Statement
A **3-hour Action JRPG** set in flooded Neo-Tokyo's rooftop districts. The narrative is **fully authored**, while **scenes are procedurally generated** per story beat. Visuals are cel-shaded, weathered, and grounded in survival culture.

**Core Pillars**
- **Production Quality**: No placeholders. High-quality GLB assets, polished UI, and stable performance.
- **Authored Story**: Fixed narrative beats, rivalry-driven progression.
- **Procedural Scenes**: Layouts, props, and encounters vary per beat with deterministic seeds.
- **Mobile-First**: 60 FPS on Pixel 8a baseline.

---

## 2. Visual Direction (Flooded World)
- **No neon**. Natural light, lanterns, bonfires, and overcast haze.
- **Materials**: Rusted metal, weathered concrete, salvaged wood, patched tarps.
- **Cel-shaded rendering** using Babylon toon materials.

Reference: `/docs/world/FLOODED_WORLD.md`

---

## 3. Gameplay Structure

### Exploration
- Rooftop traversal across bridges, docks, and salvage spans.
- Story beats anchor each scene; procedural rules fill in layout detail.

### Combat
- **Spin-out arena combat** (JRPG-style) triggered by encounters.
- Rivalry (Kai vs Vera) drives key battles.

Reference: `/docs/gameplay/COMBAT_PROGRESSION.md`

---

## 4. Story & Pacing
- **Act 1 (45 min)**: Academy life, rivalry setup, Descent announced.
- **Act 2 (60 min)**: Underwater trials, storm disruption, forced alliance.
- **Act 3 (45 min)**: Conspiracy reveal, final rivalry, endings.

Reference: `/docs/story/STORY_FLOODED.md`

---

## 5. Asset Pipeline (Build-Time)

We support a **manifest-driven** asset pipeline for characters, props, and tiles. GenAI tooling (e.g., Meshy) is **optional** and build-time only.

Reference: `/docs/pipeline/GENAI_PIPELINE.md`

---

## 6. Technical Direction
- **UI**: Ionic + Angular (zoneless) for routing and overlays.
- **3D**: Babylon.js runtime with toon materials.
- **Logic**: Miniplex ECS + Zustand stores (`packages/core`).
- **Native**: Capacitor 8 for Android/iOS; optional Electron target.

Reference: `/docs/tech/TECH_ARCHITECTURE.md`

---

Last Updated: 2026-01-27
