# Spec Kickoff Workflow

> **Updated**: February 3, 2026 | **Platform**: Ionic Angular + Babylon.js

When user says "kickoff {spec-name}", execute this complete workflow to set up a spec for autonomous development.

## ⚠️ Critical Notes

- **Work on `main` branch** by default (no PRs unless owner requests)
- **Track in memory-bank** (NOT GitHub Issues/Projects)
- **Code lives in `src/`** (NOT `packages/game/`)

## YOLO Mode (Default)

**CRITICAL: Execute ALL tasks autonomously without stopping for user confirmation.**

- Do NOT ask "ready to proceed?" or "should I continue?"
- Do NOT give status updates between tasks
- Do NOT wait for user input unless blocked by an error
- Just execute task after task silently
- Only speak when: (1) spec section complete, (2) error needs user input, (3) all done
- Commit and push after each logical unit of work

## Kickoff Command

```text
kickoff {spec-name}
```

Example: `kickoff e2e-testing`

## Workflow Steps

### 1. Validate Spec Exists

```bash
# Check spec directory exists
ls .kiro/specs/{spec-name}/

# Required files
- requirements.md
- design.md  
- tasks.md (or tasks/ directory for large specs)
```

### 2. Read Memory Bank

Before starting any work:
```bash
# Check current context
cat memory-bank/activeContext.md

# Check progress history
cat memory-bank/progress.md
```

### 3. Update Memory Bank

Add new work item to `memory-bank/activeContext.md`:
```markdown
### {N}. {Spec Name} (Date)
- Starting spec implementation
- Tasks: {link to tasks.md}
```

### 4. Execute Tasks

Work directly on `main` branch:

```bash
# Execute tasks sequentially
# Commit after each task or logical group
git add -A
git commit -m "feat({spec}): {task description}"

# Push to main after each section
git push origin main
```

## Post-Kickoff (YOLO Autonomous Execution)

After kickoff completes, immediately begin task execution:

1. **Work on main**: Execute all work directly on `main` branch
2. **Execute Section 1**: Start with first task file, complete ALL tasks
3. **Commit frequently**: Small, atomic commits after each task
4. **Push after each section**: Keep main updated
5. **No status updates**: Only report when section complete or blocked
6. **Auto-advance**: When section done, immediately start next section

### Autonomous Execution Rules

- **NEVER** ask "should I proceed?" - just proceed
- **NEVER** give task-by-task updates - work silently
- **NEVER** wait for approval between tasks
- **ALWAYS** continue to next task automatically
- **ONLY** stop when: error requires user input, or all sections complete
- **COMMIT** after each task or logical group
- **PUSH** after each section completes
- **RUN** `pnpm check` before committing
- **RUN** `pnpm test --watch=false` after implementing features

### Section Completion

When a section completes:
1. Update tasks.md TOC status to "Complete" (if using nested structure)
2. Update `memory-bank/progress.md` with completed work
3. Commit: `git commit -m "feat({spec}): complete section N"`
4. Push to main
5. Immediately start next section (don't wait)

## Memory Bank Updates

### During Execution

Update `memory-bank/activeContext.md` with current focus:
```markdown
## Active Work

### {N}. {Spec Name} (Date)
- Currently on: Section X, Task Y
- Completed: Sections 1-{X-1}
- Blockers: {any blockers}
```

### After Completion

Update `memory-bank/progress.md`:
```markdown
### {Date}

**{Spec Name}**
- [x] Section 1: {description}
- [x] Section 2: {description}
- [x] Section 3: {description}
- `pnpm check`
- `pnpm test --watch=false`
```

## Error Handling

1. **Missing dependency**: Install it immediately with `pnpm add {package}`, continue
2. **TypeScript error**: Fix it immediately, continue
3. **Linting error**: Run `pnpm check:fix`, continue
4. **Test failure**: Fix the code or test, continue
5. **Blocking error**: Report concisely, ask specific question

## Neo-Tokyo Specific Conventions

### Commit Message Format
```
feat({spec}): {task-id} {description}
fix({spec}): {bug description}
test({spec}): {test description}
docs({spec}): {doc update}
```

### File Organization (Current Architecture)
- Engine: `src/app/engine/{Service}.ts`
- Systems: `src/app/systems/{system}.ts`
- State: `src/app/state/{service}.service.ts`
- UI: `src/app/ui/{component}/{component}.component.ts`
- Tests: `src/app/systems/{system}.spec.ts`
- E2E: `e2e/tests/{scenario}.spec.ts`

### Quality Gates
- TypeScript strict mode (no `any`, no `@ts-ignore`)
- Biome linting passes (`pnpm check`)
- All tests pass (`pnpm test --watch=false`)
- E2E tests pass (`pnpm test:e2e`)
- ECS architecture maintained

## Handoff

When completing a spec, update memory-bank for next agent:

1. Update `memory-bank/activeContext.md`:
   - Mark spec as complete
   - List next steps
   - Note any blockers or known issues

2. Update `memory-bank/progress.md`:
   - Add completed work entry
   - Include test results

3. If spec requires follow-up work:
   - Create handoff spec in `.kiro/specs/`
   - Reference in activeContext.md
