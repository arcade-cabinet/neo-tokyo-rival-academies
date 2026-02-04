# Archived Specs

This directory contains specs that are no longer active due to architecture changes.

## production-launch (Archived Feb 3, 2026)

**Reason**: This spec was created targeting the obsolete React/Three.js/Reactylon architecture.

The project has pivoted to **Ionic Angular + Babylon.js + Capacitor**.

### What Was Wrong

- Referenced `packages/game/` directory (deleted)
- Assumed React/Reactylon for UI
- Assumed Three.js for 3D rendering
- Used GitHub Issues for tracking (now using memory-bank)

### Current Architecture

- **UI Framework**: Ionic Angular (zoneless)
- **3D Engine**: Babylon.js (imperative, NOT React-based)
- **Mobile**: Capacitor 8
- **Code Location**: `src/` (NOT `packages/game/`)
- **Planning**: `memory-bank/` (NOT GitHub Issues)

### Replacement

New specs should be created in `.kiro/specs/` following the current architecture.

See:
- `AGENTS.md` for current architecture
- `docs/00-golden/GOLDEN_RECORD_MASTER.md` for requirements
- `memory-bank/activeContext.md` for current work
