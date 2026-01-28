# Neo-Tokyo: Rival Academies - Release 1.0 Roadmap

**Branch**: `release/1.0`
**Target**: Production-ready Android APK & iOS TestFlight Build
**Status**: Legacy (superseded)

**Note**: This roadmap reflects the deprecated React Native + Babylon Native pivot. Current roadmap lives at `/docs/00-golden/PHASE_ROADMAP.md`.

## Release Vision

A polished, playable vertical slice demonstrating the Neo-Tokyo experience:
- Complete intro sequence (Kai vs Vera rivalry)
- Single district exploration (Shibuya)
- 3 combat encounters with the Spin-Out system
- Save/Load game state
- 60 FPS on Pixel 8a baseline

## Milestone Structure

### Milestone 1: Native Foundation (Blocking)

Architecture pivot from Capacitor to React Native + Babylon Native.

| Issue | Title | Priority |
|-------|-------|----------|
| #41 | Architecture: Monorepo Restructure (Native Pivot) | P0 |
| #42 | Mobile: Initialize React Native + Babylon Native App | P0 |
| #43 | Core: Extract Game Logic to Shared Package | P0 |
| #34 | Phase 1: Reactylon Setup & Mobile Init Flow | P0 |

**Exit Criteria**:
- [ ] `_legacy/apps/mobile` runs on Android emulator with Babylon Native (legacy)
- [ ] `packages/core` contains all ECS systems
- [ ] Web fallback builds and runs in browser

### Milestone 2: Core Systems (Critical)

Essential gameplay systems for the vertical slice.

| Issue | Title | Priority |
|-------|-------|----------|
| #24 | Implement Navigation V2 (Replacing YukaJS) | P0 |
| #36 | Phase 1: Combat Stats & Encounter Templates | P0 |
| #37 | Phase 1: Sound & UI Polish Rules | P1 |
| #27 | Feature: Implement save/load game state system | P1 |
| #26 | Feature: Implement equipment system with stat modifiers | P1 |

**Exit Criteria**:
- [ ] Player can navigate diorama with touch controls
- [ ] Combat encounters trigger Spin-Out transition
- [ ] Game state persists between sessions
- [ ] Basic equipment affects stats

### Milestone 3: Content Pipeline (Important)

GenAI and procedural content systems.

| Issue | Title | Priority |
|-------|-------|----------|
| #28 | Critical: Implement Meshy AI 3D asset pipeline | P0 |
| #35 | Phase 1: Quest Generator v1 Implementation | P1 |
| #20 | GenAI: Complete character model and animation generation | P1 |
| #21 | GenAI: Generate hex tile assets for all 6 tile types | P2 |
| #25 | GenAI: Generate stage background assets for all 9 stages | P2 |

**Exit Criteria**:
- [ ] Meshy integration generates models from prompts
- [ ] Quest system produces playable objectives
- [ ] All placeholder art replaced with GenAI assets

### Milestone 4: Quality & Polish (Required for Release)

Testing, performance, and security hardening.

| Issue | Title | Priority |
|-------|-------|----------|
| #18 | Testing: Expand unit test coverage for game systems | P1 |
| #19 | Testing: Implement E2E Playwright gameplay tests | P1 |
| #23 | Performance: Implement LOD, asset compression | P1 |
| #16 | Security: Address Dependabot vulnerabilities | P0 |
| #17 | CI: Fix build artifact upload path | P2 |

**Exit Criteria**:
- [ ] >70% code coverage on game systems
- [ ] E2E tests cover intro -> combat -> save flow
- [ ] No high/critical security vulnerabilities
- [ ] 60 FPS sustained on Pixel 8a

## Epic Tracker

All issues roll up to the master Epic:

- **#33**: EPIC: Neo-Tokyo Golden Record Implementation

## Current Status

### Completed
- [x] PR #40 merged: Architecture pivot documentation, CI fixes, Reputation system
- [x] Babylon.js + Reactylon integrated for 3D rendering
- [x] ECS architecture (Miniplex) in place
- [x] GitHub Issues triaged and prioritized
- [x] CI/CD pipeline passing (Biome, TypeScript, Build)

### In Progress
- [ ] Milestone 1: Native Foundation

### Blocked
- Navigation V2 (#24) - blocked by #41 (needs new monorepo structure)
- Combat Encounters (#36) - blocked by #24 (needs pathfinding)

## Development Workflow

1. **Feature branches** from `release/1.0`
2. **PRs** require:
   - CodeRabbit/Gemini review
   - CI checks passing
   - At least 1 human approval (or admin override for bot reviews)
3. **Merge to release/1.0** when complete
4. **Merge to main** at each milestone completion

## Release Checklist

### Pre-Release
- [ ] All P0 issues resolved
- [ ] All P1 issues resolved or deferred with documentation
- [ ] Security audit complete (no high/critical CVEs)
- [ ] Performance benchmarks pass (60 FPS on Pixel 8a)
- [ ] Android APK builds and installs
- [ ] iOS TestFlight build approved

### Release Day
- [ ] Tag `v1.0.0` on main
- [ ] Generate GitHub Release with changelog
- [ ] Upload APK as release artifact
- [ ] Submit to Google Play (internal track)
- [ ] Submit to TestFlight

## References

- [Golden Record Master](docs/00-golden/GOLDEN_RECORD_MASTER.md)
- [Architecture Pivot](docs/ARCHITECTURE_PIVOT_NATIVE.md)
- [Mobile Native Guide](docs/legacy/mobile/MOBILE_NATIVE_GUIDE.md)
- [Combat Design Gap Analysis](docs/COMBAT_DESIGN_GAP_ANALYSIS.md)
