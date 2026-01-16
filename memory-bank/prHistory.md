# PR History

This document tracks pull request history and notable changes.

---

## Open PRs

### PR #5: JRPG Transformation
**Branch**: `jrpg-transformation-107803072628449215`
**Status**: Open, Awaiting Review
**Created**: 2026-01-14

#### Summary
Comprehensive architectural transformation from 3D platformer to Action JRPG.

#### Key Changes
- **Architecture**: Vite/React SPA → ECS (Miniplex) driven design
- **Game Type**: Platformer → JRPG with stats system
- **Assets**: Placeholder → GenAI-generated characters (9 total)
- **Grid System**: None → Hex tile isometric diorama
- **Documentation**: Minimal → Comprehensive

#### Files Changed
- `AGENTS.md` - Rewritten for JRPG context
- `README.md` - Updated project description
- `docs/JRPG_TRANSFORMATION.md` - New stats/combat design
- `docs/TESTING_STRATEGY.md` - New testing approach
- `packages/content-gen/` - GenAI pipeline implementation
- `packages/game/src/utils/hex-grid.ts` - Hex utilities
- `packages/game/src/components/react/scenes/IsometricScene.tsx` - Main scene

#### Review Status
- [ ] CodeRabbit review requested
- [ ] Jules bot assisted with implementation
- [ ] Human review pending

---

## Merged PRs

### PR #4: Initial Project Setup
**Merged**: 2026-01-13
**Branch**: `initial-setup`

#### Summary
Initial monorepo setup with Vite, React Three Fiber, and GenAI toolchain foundation.

#### Key Changes
- Monorepo structure with pnpm workspaces
- Vite 6.x with React integration
- Biome configuration for linting/formatting
- Initial character manifest structure
- CI/CD pipeline for GitHub Pages

---

## PR Templates

### Feature PR
```markdown
## Summary
[Brief description of the feature]

## Changes
- [List of key changes]

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Documentation
- [ ] CHANGELOG.md updated
- [ ] Relevant docs updated
```

### Bug Fix PR
```markdown
## Bug Description
[What was broken]

## Root Cause
[Why it was broken]

## Fix
[How it was fixed]

## Testing
- [ ] Regression test added
- [ ] Verified fix works
```

---

## Conventions

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation only
- `refactor/description` - Code refactoring

### Commit Messages

```text
type(scope): subject

body

Co-Authored-By: Claude Code <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Review Process
1. Open PR with descriptive title
2. Request CodeRabbit review (`@coderabbitai review`)
3. Address automated feedback
4. Request human review
5. Squash and merge to main

---

Last Updated: 2026-01-16
