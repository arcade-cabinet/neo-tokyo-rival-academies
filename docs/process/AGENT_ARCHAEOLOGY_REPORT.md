# Agent Archaeology Report

**Date**: February 3, 2026
**Purpose**: Document findings from comprehensive codebase and issue audit

---

## Executive Summary

This report documents a critical misalignment between agent work and the actual project state. Multiple agents have been working on **obsolete architecture** while the project has pivoted to a completely different stack.

### Key Findings

1. **Architecture Pivot Missed**: Project pivoted from React/Three.js/Reactylon to **Ionic Angular + Babylon.js + Capacitor**
2. **Obsolete Work**: The `packages/game/` directory was deleted; all React-based work is invalid
3. **Governance Violation**: GitHub Issues were supposed to be disabled; work should be in memory-bank
4. **Stale Issues**: 39 GitHub issues exist, many referencing obsolete architecture
5. **Spec Misalignment**: `.kiro/specs/production-launch/` spec targets wrong architecture

---

## Current Architecture (Truth)

### Stack
- **Framework**: Ionic + Angular (zoneless)
- **3D Engine**: Babylon.js (imperative, NOT Reactylon)
- **State**: Miniplex ECS + Zustand
- **Mobile**: Capacitor 8 (Android/iOS)
- **Build**: Angular CLI + Vite

### Directory Structure
```
src/                    # Main Ionic Angular app
├── app/
│   ├── engine/        # Babylon.js scene services
│   ├── game-shell/    # Game container
│   ├── state/         # ECS + Zustand stores
│   ├── systems/       # Game logic systems
│   ├── ui/            # Angular UI components
│   └── utils/
├── lib/
│   ├── core/          # Shared game logic
│   ├── diorama/       # Diorama components (legacy TSX)
│   └── world-gen/     # World generation
└── assets/            # Game assets
```

### What Was Deleted
- `packages/game/` - Entire React/Vite game package
- `packages/e2e/` - Playwright tests (moved to `e2e/`)
- React Three Fiber components
- Reactylon integration

---

## GitHub Issues Audit

### Issue Categories

| Category | Count | Status |
|----------|-------|--------|
| Obsolete (React/R3F) | 12 | Should close |
| Partially relevant | 8 | Need update |
| Still valid | 10 | Keep open |
| Completed | 9 | Already closed |

### Issues to Close (Obsolete Architecture)

- #15 Babylon.js Migration (completed differently)
- #31 Production Launch spec (wrong architecture)
- #32 PR for production-launch (invalid)
- #34 Reactylon Setup (deprecated)
- #41 Monorepo Restructure (completed differently)
- #42 React Native + Babylon Native (deprecated)
- #43 Core Package Extract (completed differently)

### Issues to Update

- #24 Navigation V2 - Still relevant, update for Angular
- #28 Meshy AI Pipeline - Still relevant
- #33 Golden Record Epic - Update status
- #55 Flooded World Epic - Update status

### Issues Still Valid

- #19 E2E Playwright tests
- #20 Character model generation
- #21 Hex tile generation
- #23 Performance optimization
- #25 Stage background assets
- #26 Equipment system
- #27 Save/load system
- #35 Quest Generator
- #36 Combat Stats
- #37 Sound & UI Polish

---

## Spec Files Assessment

### `.kiro/specs/production-launch/`

**Status**: INVALID - targets obsolete React/Reactylon architecture

**Files**:
- `requirements.md` - Requirements still valid conceptually
- `design.md` - Architecture section invalid
- `tasks.md` - All tasks target wrong codebase
- `tasks/*.md` - All 12 task files invalid

**Recommendation**: Archive or delete. Create new spec aligned with Angular architecture.

---

## Memory Bank Status

The memory-bank is the **correct** tracking mechanism per governance.

**Files**:
- `activeContext.md` - Current and accurate
- `progress.md` - Current and accurate
- `parity-assessment.md` - Useful for porting work
- `parity-matrix.md` - Useful for porting work

---

## Governance Rules (From Docs)

1. **No GitHub Issues/Projects** unless owner re-enables
2. **Memory-bank tracking** is primary
3. **Main branch workflow** - no PRs by default
4. **Golden Record** is source of truth
5. **Documentation first** - update docs before code

---

## Recommended Actions

### Immediate (This Session)

1. ✅ Clean up stashed/uncommitted work
2. Create GitHub Project for Kanban tracking
3. Update/close stale GitHub issues
4. Create comprehensive E2E testing spec
5. Update steering files with lessons learned

### Short Term

1. Archive `.kiro/specs/production-launch/`
2. Create new spec aligned with Angular architecture
3. Update AGENTS.md, CLAUDE.md with current architecture
4. Create milestone structure in GitHub

### Medium Term

1. Complete parity porting from legacy TSX
2. Implement comprehensive E2E test suite
3. Complete Phase 1 deliverables per roadmap

---

## Lessons Learned

### For Future Agents

1. **ALWAYS read Golden Record first** (`docs/00-golden/`)
2. **Check memory-bank** for current context
3. **Verify architecture** before writing code
4. **Don't assume** - the codebase may have pivoted
5. **Follow governance** - memory-bank over GitHub Issues

### Process Improvements Needed

1. Better handoff documentation
2. Architecture change notifications
3. Spec validation against current codebase
4. Automated architecture drift detection

---

## References

- `/docs/00-golden/GOLDEN_RECORD_MASTER.md` - Master spec
- `/docs/00-golden/PHASE_ROADMAP.md` - Timeline
- `/docs/00-golden/DEPRECATIONS.md` - What to ignore
- `/docs/process/AGENT_GOVERNANCE.md` - Workflow rules
- `/memory-bank/activeContext.md` - Current state

---

Last Updated: 2026-02-03
