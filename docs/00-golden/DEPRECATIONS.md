# Deprecations & Ignore Guide

**Last Updated**: January 27, 2026

---

## Current Truth

The active runtime is **Ionic Angular + Babylon.js + Capacitor**. Story is **hand-authored**, while **scenes are procedurally generated** within those beats.

Unity 6 documentation is preserved only for historical/reference purposes in `/docs/legacy/unity/`.

---

## What to Ignore (Superseded)

### Runtime/Platform

- **Unity 6 DOTS runtime**: legacy-only, archived in `/docs/legacy/unity/`.
- **React/Reactylon runtime**: deprecated; Babylon rendering is imperative in Angular.
- **Expo / React Native app shells**: deprecated; single web bundle only.
- **Multi-app packages** in `apps/`: deprecated; we ship one unified app.

### Code + Content

- `_reference/typescript-runtime/`: historical snapshot only.
- Any docs claiming “Unity migration complete” or “Unity is current.”

### Aesthetic/Story

- **Cyberpunk neon aesthetic**: deprecated; use weathered, post-apocalyptic palette.
- **Procedural story arcs**: deprecated; story is fixed and authored.
- **Infinite open-world or MMO ambitions**: out of scope.

---

## Canon to Preserve

- Flooded Neo-Tokyo rooftop setting
- Kai vs Vera rivalry
- Kurenai vs Azure academies
- Four stats: Structure, Ignition, Logic, Flow
- Alignment axis: Kurenai ← 0 → Azure
- 3-hour authored narrative arc
- Procedural **scene** generation (layouts, props, encounters)

---

## Document Structure (Active)

| Domain | Location |
|--------|----------|
| Golden Record | `/docs/00-golden/` |
| Story | `/docs/story/` |
| World | `/docs/world/` |
| Gameplay Systems | `/docs/gameplay/` |
| Design | `/docs/design/` |
| Tech | `/docs/tech/` |
| Procedural | `/docs/procedural/` |
| Pipeline | `/docs/pipeline/` |
| Testing | `/docs/testing/` |
| Process | `/docs/process/` |
| Legacy (Unity/React/Mobile) | `/docs/legacy/` |

---

## Legacy Reference (Do Not Implement)

- `/docs/legacy/unity/` — Unity 6 DOTS implementation notes
- `/docs/legacy/react/` — React/Reactylon migration notes
- `/docs/legacy/mobile/` — deprecated mobile-native strategy
- `/docs/legacy/procedural/` — superseded long-form procedural drafts

---

*Agents: default to Golden Record + Story + World docs, and treat Legacy as historical context only.*
