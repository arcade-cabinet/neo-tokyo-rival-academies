# Project Management Steering

> **Updated**: February 3, 2026 | **Platform**: Ionic Angular + Babylon.js

## ⚠️ Critical: Memory Bank Tracking

**ALL planning and tracking uses memory-bank, NOT GitHub Issues/Projects.**

Per owner directive, GitHub Issues and Projects are disabled for this repository. All work tracking happens in the `memory-bank/` directory.

## Memory Bank Structure

```
memory-bank/
├── activeContext.md      # Current focus and active work
├── progress.md           # Completed work history
├── parity-assessment.md  # Legacy porting status
├── parity-matrix.md      # Component mapping
├── productContext.md     # Product overview
├── projectbrief.md       # Project brief
├── systemPatterns.md     # Architecture patterns
└── techContext.md        # Technical context
```

## Key Files

### activeContext.md

Current state and active work items:

```markdown
# Active Context

## Current Focus
{What we're working on now}

## Active Work
### {N}. {Work Item} (Date)
- {Status}
- {Details}

## Next Steps
- {Next item 1}
- {Next item 2}
```

### progress.md

Completed work log:

```markdown
# Progress Tracker

## Milestone Overview
| Milestone | Status | Target | Notes |
|-----------|--------|--------|-------|
| {Name} | {Status} | {Date} | {Notes} |

## Completed Work

### {Date}

**{Work Item}**
- [x] Task 1
- [x] Task 2
- `pnpm check`
- `pnpm test --watch=false`
```

## Workflow

### Starting Work

1. Read `memory-bank/activeContext.md` to understand current state
2. Read `memory-bank/progress.md` to see completed work
3. Check Golden Record (`docs/00-golden/`) for requirements
4. Update `activeContext.md` with new work item

### During Work

1. Commit frequently with semantic messages
2. Push to main after each logical section
3. Run quality checks: `pnpm check`, `pnpm test --watch=false`

### Completing Work

1. Update `memory-bank/progress.md` with completed work
2. Update `memory-bank/activeContext.md` with next steps
3. Include handoff notes for next agent

## Main Branch Workflow

**Default**: Work directly on `main` unless owner requests a PR.

```bash
# Commit work
git add -A
git commit -m "feat({scope}): {description}"

# Push to main
git push origin main
```

## Quality Gates

Before pushing:
- [ ] TypeScript compiles (strict mode, no `any`)
- [ ] Linting passes (`pnpm check`)
- [ ] Tests pass (`pnpm test --watch=false`)
- [ ] E2E tests pass (`pnpm test:e2e`)

## Milestones (Phases)

Track in `memory-bank/progress.md`:

- **Phase 1: Mobile MVP** (Deadline: Mar 31, 2026)
- **Phase 2: Story Depth** (Deadline: Jun 30, 2026)
- **Phase 3: Polish** (Deadline: Sep 30, 2026)
- **Phase 4: Launch** (Deadline: Dec 31, 2026)

## Documentation First

- Before writing code, check if Golden Record (`docs/00-golden/`) covers the feature
- If feature requires design change, update documentation first
- Never implement code that contradicts `docs/`

## Agent Handoff

When finishing a session, update memory-bank with:
- Current state
- Next steps
- Any blockers
- Updated context for next agent

## Performance Tracking

Track in memory-bank or commit messages:

| Metric | Target |
|--------|--------|
| Bundle Size | <2MB gzipped |
| Initial Load | <3.5s to interactive |
| Frame Rate | 60 FPS (Pixel 8a) |
| Memory Usage | <200MB (mobile) |

## Test Coverage Tracking

Track in `memory-bank/progress.md`:

```markdown
## Test Coverage

| Area | Coverage | Status |
|------|----------|--------|
| Core Systems | {%} | {✅/❌} |
| UI Components | {%} | {✅/❌} |
| E2E Flows | {count} | {✅/❌} |
```

## DEPRECATED: GitHub Integration

The following are **NOT used** per owner directive:
- ❌ GitHub Issues
- ❌ GitHub Projects
- ❌ GitHub Milestones
- ❌ Pull Requests (unless explicitly requested)
- ❌ CodeRabbit reviews

All tracking happens in `memory-bank/` instead.
