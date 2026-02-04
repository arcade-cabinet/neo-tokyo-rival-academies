# Large Spec Task Organization

> **Updated**: February 3, 2026 | **Platform**: Ionic Angular + Babylon.js

## When to Use Nested Tasks

For specs with more than 50 tasks or 5+ major sections, split tasks into:
- `tasks.md` - Table of Contents with links to nested files
- `tasks/` directory containing individual task files per major section

## Directory Structure

```
.kiro/specs/{feature-name}/
├── requirements.md
├── design.md
├── tasks.md              # TOC with overview and links
└── tasks/
    ├── 01-setup.md
    ├── 02-systems.md
    ├── 03-components.md
    ├── 04-ui.md
    ├── 05-testing.md
    └── 06-integration.md
```

## TOC Format (tasks.md)

```markdown
# Implementation Tasks: {Feature Name}

## Overview
{Brief description of implementation approach}

## Version Requirements
- Node.js: >=22.22.0
- PNPM: >=10.0.0
- TypeScript: 5.9+
- Angular: 19 (zoneless)
- Babylon.js: 8.46+

## Task Sections

| Section | File | Tasks | Status |
|---------|------|-------|--------|
| 1. Setup | [01-setup.md](tasks/01-setup.md) | 8 | Not Started |
| 2. Systems | [02-systems.md](tasks/02-systems.md) | 12 | Not Started |
| 3. Components | [03-components.md](tasks/03-components.md) | 15 | Not Started |
| 4. UI | [04-ui.md](tasks/04-ui.md) | 10 | Not Started |
| 5. Testing | [05-testing.md](tasks/05-testing.md) | 12 | Not Started |
| 6. Integration | [06-integration.md](tasks/06-integration.md) | 6 | Not Started |

**Total Tasks:** 63

## Execution Notes

- Execute sections sequentially (1 → 2 → 3 → ...)
- Some tasks within sections can be parallelized
- Commit after each task or logical group
- Push to main after each section completes
- Run `pnpm check` before committing
- Run `pnpm test --watch=false` after implementing features
- Update memory-bank after each section
```

## Nested Task File Format

Each nested file follows this structure:

```markdown
# {Section Number}. {Section Title}

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements X, Y, Z

## Overview
{What this section accomplishes}

## Prerequisites
- {Prerequisite 1}
- {Prerequisite 2}

## Tasks

### {N}.1. {Subsection Title}

**Validates:** Requirement X.Y

- [ ] {N}.1.1. {Task description}
  - {Additional detail}
  - {File to modify: `src/app/systems/file.ts`}
  
- [ ] {N}.1.2. {Task description}
  - {Additional detail}
  - {Command to run: `pnpm test --watch=false`}

## Verification

After completing this section:
- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] Linting passes (`pnpm check`)
- [ ] No console errors in dev mode
- [ ] Performance targets met

## Common Commands

```bash
# Development
pnpm start

# Build
pnpm build

# Test
pnpm test --watch=false

# E2E
pnpm test:e2e

# Lint
pnpm check
```
```

## Task Numbering Convention

- Use `{section}.{subsection}.{task}` format (e.g., 1.3.2)
- Section numbers match file prefix (01 = section 1)
- Subsections are logical groupings within a section
- Tasks are atomic, executable units

## Status Tracking

Use these markers in the TOC:

- `Not Started` - No tasks begun
- `In Progress` - Some tasks complete
- `Blocked` - Waiting on dependency
- `Complete` - All tasks done

Update status after each section completes:

```bash
# Update tasks.md TOC
# Change "Not Started" to "Complete" for completed section
git add .kiro/specs/{spec-name}/tasks.md
git commit -m "feat({spec}): complete section N"
```

## Neo-Tokyo Specific Sections

### Typical Section Breakdown

1. **Setup** - Environment, dependencies, configuration
2. **Systems** - Game logic systems (Combat, AI, etc.)
3. **Components** - Angular UI components
4. **Engine** - Babylon.js scene services
5. **Testing** - Unit tests, E2E tests
6. **Integration** - Wire systems together

### File Organization (Current Architecture)

- Engine: `src/app/engine/{Service}.ts`
- Systems: `src/app/systems/{system}.ts`
- State: `src/app/state/{service}.service.ts`
- UI: `src/app/ui/{component}/{component}.component.ts`
- Tests: `src/app/systems/{system}.spec.ts`
- E2E: `e2e/tests/{scenario}.spec.ts`

## Autonomous Execution with Large Specs

When executing large specs autonomously:

1. **Read TOC first** - Understand overall structure
2. **Execute section by section** - Complete one section before moving to next
3. **Update TOC status** - Mark sections complete as you go
4. **Commit per section** - Push to main after each section completes
5. **Update memory-bank** - Record progress after each section
6. **Continue immediately** - Don't wait, keep executing

### Section Completion Checklist

After each section:
- [ ] All tasks in section complete
- [ ] All tests pass
- [ ] Linting passes
- [ ] TOC status updated
- [ ] Committed and pushed to main
- [ ] Memory-bank updated

Then immediately start next section.

## Performance Considerations

For large specs with many tasks:

- **Batch commits**: Group related tasks into single commit
- **Incremental testing**: Test after each subsection
- **Early integration**: Integrate early to catch issues
- **Continuous deployment**: Push frequently to keep main updated
