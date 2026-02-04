# Active Context

## Current Focus

**Phase**: Mobile MVP (single unified Ionic Angular app)
**Target**: Babylon.js + Capacitor delivery for web, Android, iOS; optional Electron desktop.
**Governance**: Owner directed memory-bank-only tracking; GitHub Issues/Projects are disabled.

## ⚠️ Critical Architecture Notes

**Stack**: Ionic Angular + Babylon.js + Capacitor
- Code lives in `src/` (NOT `packages/game/` which is deleted)
- Babylon.js is imperative (NOT React-based, NOT Reactylon)
- All planning in memory-bank (NOT GitHub Issues)

## Active Work

### 41. Comprehensive E2E Testing Spec (Feb 3, 2026)
- Created spec at `.kiro/specs/e2e-testing/`
- 42 tasks across 6 sections
- Covers all collision, bounds, gameplay scenarios
- Final task creates handoff spec for next agent
- **Status**: Ready for execution

### 40. Steering & Governance Update (Feb 3, 2026)
- Updated all `.kiro/steering/` files with correct architecture
- Removed references to obsolete React/Three.js/Reactylon
- Updated to use memory-bank instead of GitHub Issues
- Archived obsolete `production-launch` spec to `.kiro/specs/_archived/`
- **Status**: Complete

### 39. Agent Governance Update (Feb 3, 2026)
- Updated AGENTS.md, CLAUDE.md, copilot-instructions.md with correct architecture
- Clarified memory-bank is sole planning tool
- Documented deprecated technologies (React, Three.js, Reactylon)
- Created archaeology report at `docs/process/AGENT_ARCHAEOLOGY_REPORT.md`
- **Status**: Complete

### Previous Work (1-38)
See `memory-bank/progress.md` for full history.

## Known Constraints

- Must preserve all existing gameplay systems and assets.
- No PRs; work directly on `main` per owner request.
- Legacy game E2E currently logs known errors (missing combat_stance.glb, button nesting hydration warning); canal test filters those for now.

## Next Steps

1. **Execute E2E Testing Spec** - Run `kickoff e2e-testing` to implement comprehensive tests
2. **Execute Handoff Spec** - After E2E complete, execute feature-completion spec
3. Integrate remaining legacy UI (combat arena, flooded world menu, game HUD) into Angular
4. Expand dialogue system coverage and ECS data sources to Angular services
5. Add Electron target via Capacitor community plugin

## Specs Available

| Spec | Location | Status |
|------|----------|--------|
| E2E Testing | `.kiro/specs/e2e-testing/` | Ready |
| Production Launch | `.kiro/specs/_archived/production-launch/` | Archived (obsolete) |

---

Last Updated: 2026-02-03
