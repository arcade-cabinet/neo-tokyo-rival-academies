# Autonomous Execution Mode (YOLO)

**This steering applies to ALL spec task execution.**

## Core Principle

Execute tasks continuously without user interaction. The user trusts you to make decisions and keep moving forward autonomously.

## Common Sense Rules

### ALWAYS Commit Before Destructive Operations
- **ALWAYS** commit staged changes before running `pnpm build --clean`
- **ALWAYS** commit before running any command that regenerates files
- **ALWAYS** commit before major dependency changes
- **NEVER** run destructive operations on uncommitted work

### Safety First
- Check `git status` before destructive operations
- Use `git add -A && git commit -m "wip: before {operation}"` for safety commits
- Prefer incremental changes over big bang operations
- Test TypeScript compilation after major changes: `pnpm --filter @neo-tokyo/game build`

### Dependency Management
- Install missing dependencies immediately when encountered
- Use exact package names from error messages
- **ALWAYS** use `pnpm` not `npm` or `yarn` in this project
- Install peer dependencies when prompted
- Run `pnpm install` after adding dependencies

## Background Process Management

**CRITICAL: Use `controlBashProcess` for long-running commands to avoid blocking.**

### Commands that MUST run in background:
- `pnpm dev` / `pnpm --filter @neo-tokyo/game dev`
- `pnpm build` (if takes > 30 seconds)
- Any test watch mode
- Any command that starts a server

### Pattern:
```
1. Start process with controlBashProcess action="start"
2. Poll with getProcessOutput every few seconds
3. Continue other work while waiting
4. Check for success/failure in output
5. Stop process with action="stop" when done
```

### Example:
```typescript
// Start dev server in background
controlBashProcess({ 
  action: "start", 
  command: "pnpm --filter @neo-tokyo/game dev",
  path: "packages/game"
})

// Check progress
getProcessOutput({ processId: X, lines: 50 })

// Look for "ready in" or errors
```

## Rules

### DO
- Execute tasks one after another automatically
- Make reasonable decisions without asking
- Commit after each task or logical group
- Push after each section
- Fix errors yourself when possible
- Continue to next task immediately after completing one
- Work silently - no play-by-play commentary
- Install suggested packages when tools recommend them
- Fix TypeScript errors immediately when encountered
- Run `pnpm check` to fix linting issues automatically
- Run tests after implementing features

### DO NOT
- Ask "should I proceed?" or "ready to continue?"
- Give status updates between tasks
- Wait for user confirmation
- Explain what you're about to do
- Summarize what you just did (unless section complete)
- Stop unless blocked or done
- Run destructive operations on uncommitted changes
- Ignore package installation suggestions from tools
- Use `npm` or `yarn` (always use `pnpm`)
- Use `any` types or `@ts-ignore` comments

## When to Speak

Only communicate when:
1. **Section complete** - Brief one-liner: "Section N complete, starting N+1"
2. **Blocked by error** - Can't proceed without user input
3. **All done** - Spec fully implemented
4. **Critical decision** - Architectural choice with major implications

## Commit Strategy

```bash
# Safety commit before destructive operations
git add -A
git commit -m "wip: before {operation}"

# After each task
git add -A
git commit -m "feat({spec}): {task-id} {brief description}"

# After section complete
git push origin feature/{spec-name}
gh pr comment {pr} --body "@coderabbitai review"
```

## Error Handling

1. **Missing dependency**: Install it immediately with `pnpm add {package}`, continue
2. **TypeScript error**: Fix it immediately, continue
3. **Linting error**: Run `pnpm check:fix`, continue
4. **Fixable error**: Fix it, continue
5. **Ambiguous requirement**: Make reasonable choice, document in commit
6. **Blocking error**: Report concisely, ask specific question
7. **Test failure**: Fix the code or test, continue

## Task Execution Flow

```text
┌─────────────────────────────────────────┐
│           YOLO EXECUTION LOOP           │
│                                         │
│  Read task → Execute → Commit → Next    │
│       ↑                          │      │
│       └──────────────────────────┘      │
│                                         │
│  Only exit when: blocked OR done        │
└─────────────────────────────────────────┘
```

## Section Transitions

When completing a section:
1. Mark tasks complete in task file
2. Update TOC status in tasks.md (if using nested structure)
3. Update GitHub issue checkbox
4. Commit and push
5. **Immediately** start next section

No pause. No "ready for next section?" Just go.

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types
- No `@ts-ignore` comments
- Use `import type` for type-only imports
- Follow path aliases: `@/`, `@components/`, `@systems/`, `@state/`, `@utils/`

### Testing
- Write tests for all game logic systems
- Co-locate tests with source: `{file}.test.ts`
- Run tests after implementation: `pnpm test`
- Ensure tests pass before moving to next task

### Code Style
- Run `pnpm check` before committing
- Use `pnpm check:fix` to auto-fix issues
- Follow Biome configuration (2 spaces, single quotes, semicolons)
- Use `meshToonMaterial` for cel-shaded visuals

## ECS Architecture Rules

- Game logic lives in `packages/game/src/systems/`
- State lives in `packages/game/src/state/ecs.ts`
- React components render based on ECS state
- Systems are pure logic, no rendering
- Each system has single responsibility

## Asset Management

- Character models in `public/assets/characters/{category}/{faction}/{role}/`
- Each character has `manifest.json` and `animations/` folder
- Background layers in `public/assets/backgrounds/{location}/{layer}/`
- Tiles in `public/assets/tiles/{tileset}/{variant}/`
- Always include `manifest.json` for new assets

## Performance Considerations

- Keep bundle size < 2MB gzipped
- Target 60 FPS on mobile
- Optimize asset loading (< 500ms per character)
- Use lazy loading for heavy assets
- Monitor memory usage (< 200MB on mobile)
