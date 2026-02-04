# Steering Rules for Neo-Tokyo: Rival Academies

> **Updated**: February 3, 2026 | **Platform**: Ionic Angular + Babylon.js

This directory contains steering rules that guide AI assistants working on this project.

## ⚠️ Critical Architecture Notes

**Stack**: Ionic Angular + Babylon.js + Capacitor
- Code lives in `src/` (NOT `packages/game/` which is deleted)
- Babylon.js is imperative (NOT React-based, NOT Reactylon)
- All planning in memory-bank (NOT GitHub Issues)
- Work directly on `main` branch unless owner requests PR

## Files

### Core Project Context
- **product.md** - Product overview, core features, game mechanics
- **tech.md** - Tech stack, common commands, code style
- **structure.md** - Project organization, file conventions

### Autonomous Execution
- **autonomous.md** - YOLO mode execution rules, error handling, commit strategy
- **spec-kickoff.md** - Workflow for kicking off specs autonomously
- **project-management.md** - Memory-bank tracking (NOT GitHub)
- **large-specs.md** - Organization patterns for large specs with 50+ tasks

## Usage

### For Users

When you want to kick off a spec for autonomous execution:

```bash
kickoff {spec-name}
```

Example:
```bash
kickoff e2e-testing
```

The AI will:
1. Validate the spec exists
2. Read memory-bank for context
3. Execute ALL tasks autonomously on main branch
4. Commit and push continuously
5. Update memory-bank with progress
6. Only stop when blocked or complete

### For AI Assistants

These steering files are automatically loaded and provide context for:

- **Product vision** - What we're building and why
- **Technical constraints** - Tech stack, code style, architecture
- **Project structure** - Where things go, how to organize code
- **Autonomous execution** - How to work independently
- **Memory-bank tracking** - How to track progress (NOT GitHub)

## Key Principles

1. **Zero Stubs Policy** - No TODO comments, fully implement features
2. **Production Quality** - Strict TypeScript, tested, documented
3. **YOLO Mode** - Execute continuously without asking for permission
4. **Memory-Bank Tracking** - All planning in memory-bank, NOT GitHub
5. **Main Branch Workflow** - Work directly on main, no PRs by default
6. **ECS Architecture** - Game logic in systems, rendering in components

## Autonomous Workflow

```
User: "kickoff {spec}"
  ↓
AI: Reads memory-bank for context
  ↓
AI: Executes Section 1 tasks (all of them)
  ↓
AI: Commits, pushes to main
  ↓
AI: Updates memory-bank
  ↓
AI: Immediately starts Section 2
  ↓
AI: Continues until all sections complete
  ↓
AI: Reports "Spec complete"
```

No user interaction needed unless blocked by an error.

## Quality Gates

Every commit must:
- [ ] TypeScript compiles (strict mode, no `any`)
- [ ] Linting passes (`pnpm check`)
- [ ] Tests pass (`pnpm test --watch=false`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] ECS architecture maintained

## Performance Targets

| Metric | Target |
|--------|--------|
| Bundle Size | <2MB gzipped |
| Initial Load | <3.5s to interactive |
| Frame Rate | 60 FPS (Pixel 8a) |
| Memory Usage | <200MB (mobile) |
| Asset Load | <500ms per character |

## DEPRECATED (Do NOT Use)

- ❌ GitHub Issues/Projects (use memory-bank)
- ❌ Pull Requests (work on main)
- ❌ React / React Three Fiber
- ❌ Reactylon
- ❌ Three.js
- ❌ `packages/game/` directory (deleted)

## Support

If you encounter issues:
- Check `memory-bank/activeContext.md` for current state
- Check `memory-bank/progress.md` for completed work
- Review `docs/00-golden/` for requirements
- Consult `AGENTS.md` for agent-specific guidelines
