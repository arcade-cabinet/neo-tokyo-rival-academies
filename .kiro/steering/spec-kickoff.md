# Spec Kickoff Workflow

When user says "kickoff {spec-name}", execute this complete workflow to set up a spec for autonomous development.

## YOLO Mode (Default)

**CRITICAL: Execute ALL tasks autonomously without stopping for user confirmation.**

- Do NOT ask "ready to proceed?" or "should I continue?"
- Do NOT give status updates between tasks
- Do NOT wait for user input unless blocked by an error
- Just execute task after task silently
- Only speak when: (1) spec section complete, (2) error needs user input, (3) all done
- Commit and push after each logical unit of work
- Follow SEESAW pattern continuously

## Kickoff Command

```text
kickoff {spec-name}
```

Example: `kickoff babylon-migration`

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

### 2. Create Git Worktree

Use worktrees to isolate spec work from main branch:

```bash
# Create worktree directory structure
# Pattern: ../worktrees/neo-tokyo-{spec-name}
WORKTREE_PATH="../worktrees/neo-tokyo-{spec-name}"

# Create worktree with new branch
git worktree add "$WORKTREE_PATH" -b feature/{spec-name}

# Or if branch exists
git worktree add "$WORKTREE_PATH" feature/{spec-name}
```

### 3. Create GitHub Issue

```bash
# Create tracking issue with spec link
gh issue create \
  --title "🚀 feat: {Spec Title}" \
  --body "## Overview
{Brief description}

## Spec Documents
- [Requirements](.kiro/specs/{spec-name}/requirements.md)
- [Design](.kiro/specs/{spec-name}/design.md)
- [Tasks](.kiro/specs/{spec-name}/tasks.md)

## Progress
- [ ] Section 1
- [ ] Section 2
...

## Acceptance Criteria
- All tasks in tasks.md complete
- All tests passing
- CodeRabbit review addressed
- Documentation updated

## Links
- PR: TBD
- Milestone: TBD" \
  --label "feature" \
  --label "spec"
```

### 4. Create/Assign Milestone

```bash
# List existing milestones
gh api repos/{owner}/{repo}/milestones

# Create milestone if needed
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="{Spec Title}" \
  -f description="Implementation of {spec-name}" \
  -f due_on="2026-03-01T00:00:00Z"

# Add issue to milestone
gh issue edit {issue-number} --milestone "{Milestone Title}"
```

### 5. Create Pull Request (Draft)

```bash
# From worktree directory
cd "$WORKTREE_PATH"

# Make initial commit
git add .kiro/specs/{spec-name}/
git commit -m "feat({spec-name}): initialize spec implementation"
git push -u origin feature/{spec-name}

# Create draft PR
gh pr create \
  --title "feat({spec-name}): {Spec Title}" \
  --body "## Summary
Implements {spec-name} per spec documents.

Closes #{issue-number}

## Spec Documents
- [Requirements](.kiro/specs/{spec-name}/requirements.md)
- [Design](.kiro/specs/{spec-name}/design.md)
- [Tasks](.kiro/specs/{spec-name}/tasks.md)

## Checklist
- [ ] All tasks complete
- [ ] Tests passing
- [ ] CodeRabbit review addressed
- [ ] Documentation updated" \
  --draft \
  --label "feature" \
  --milestone "{Milestone Title}"
```

### 6. Link Issue to PR

```bash
# Update issue body with PR link
gh issue edit {issue-number} --body "... PR: #{pr-number} ..."

# Or use GitHub's auto-linking
# PR body contains "Closes #{issue-number}"
```

## Post-Kickoff (YOLO Autonomous Execution)

After kickoff completes, immediately begin task execution:

1. **Switch to worktree**: Execute all work in `../worktrees/neo-tokyo-{spec-name}`
2. **Execute Section 1**: Start with first task file, complete ALL tasks
3. **Commit frequently**: Small, atomic commits after each task
4. **Push after each section**: Keep PR updated
5. **SEESAW continuously**: Don't wait for CodeRabbit, keep executing
6. **No status updates**: Only report when section complete or blocked
7. **Auto-advance**: When section done, immediately start next section

### Autonomous Execution Rules

- **NEVER** ask "should I proceed?" - just proceed
- **NEVER** give task-by-task updates - work silently
- **NEVER** wait for approval between tasks
- **ALWAYS** continue to next task automatically
- **ONLY** stop when: error requires user input, or all sections complete
- **COMMIT** after each task or logical group
- **PUSH** after each section completes
- **RUN** `pnpm check` before committing
- **RUN** `pnpm test` after implementing features

### Section Completion

When a section completes:
1. Update tasks.md TOC status to "Complete" (if using nested structure)
2. Update GitHub issue checkbox
3. Commit: `git commit -m "feat({spec}): complete section N"`
4. Push and trigger CodeRabbit: `@coderabbitai review`
5. Immediately start next section (don't wait for review)

## SEESAW Pattern (Autonomous Agent-to-Agent Loop)

SEESAW = **S**ubmit → **E**valuate → **E**xecute → **S**ubmit → **A**ssess → **W**rap

Continuous autonomous loop for agent-to-agent collaboration with CodeRabbit:

### The Loop

```
┌─────────────────────────────────────────────────────────┐
│                    SEESAW LOOP                          │
│                                                         │
│  1. SUBMIT    → Push commits to feature branch          │
│       ↓                                                 │
│  2. EVALUATE  → Trigger CodeRabbit review               │
│       ↓                                                 │
│  3. EXECUTE   → Continue next task while waiting        │
│       ↓                                                 │
│  4. SUBMIT    → Push next batch of commits              │
│       ↓                                                 │
│  5. ASSESS    → Fetch and process CodeRabbit feedback   │
│       ↓                                                 │
│  6. WRAP      → Resolve threads, mark complete          │
│       ↓                                                 │
│  └──────────→ Loop back to step 1                       │
└─────────────────────────────────────────────────────────┘
```

### Step 1: SUBMIT - Push Work

```bash
# Commit completed work
git add -A
git commit -m "feat({spec}): {task description}"
git push origin feature/{spec-name}
```

### Step 2: EVALUATE - Trigger Review

```bash
# Request CodeRabbit review
gh pr comment {pr-number} --body "@coderabbitai review"

# Or for specific files
gh pr comment {pr-number} --body "@coderabbitai review packages/game/src/systems/"
```

### Step 3: EXECUTE - Continue Working

Don't wait for review. Continue with next task immediately.

```bash
# Check task list for next item
cat .kiro/specs/{spec-name}/tasks.md

# Start next task
# ... implement ...
```

### Step 4: SUBMIT - Push Next Batch

```bash
git add -A
git commit -m "feat({spec}): {next task description}"
git push origin feature/{spec-name}
```

### Step 5: ASSESS - Process Feedback

```bash
# Fetch pending reviews
gh pr view {pr-number} --json reviews,comments

# Get CodeRabbit comments specifically
gh api repos/{owner}/{repo}/pulls/{pr-number}/comments \
  --jq '.[] | select(.user.login == "coderabbitai") | {id: .id, body: .body, path: .path, line: .line}'

# Get review threads
gh api graphql -f query='
query {
  repository(owner: "{owner}", name: "{repo}") {
    pullRequest(number: {pr-number}) {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
          comments(first: 10) {
            nodes {
              body
              author { login }
            }
          }
        }
      }
    }
  }
}'
```

### Step 6: WRAP - Resolve and Close

```bash
# After addressing feedback, resolve thread
gh api graphql -f query='
mutation {
  resolveReviewThread(input: {threadId: "{thread-id}"}) {
    thread { isResolved }
  }
}'

# Reply to CodeRabbit with resolution
gh pr comment {pr-number} --body "@coderabbitai I've addressed your feedback:
- Fixed {issue 1} in commit abc123
- Refactored {issue 2} per suggestion
- Added tests for {issue 3}"
```

### Autonomous Decision Making

When processing CodeRabbit feedback:

| Feedback Type | Action |
|---------------|--------|
| Valid bug | Fix immediately, commit, resolve thread |
| Style suggestion | Apply if reasonable, resolve thread |
| False positive | Reply with explanation, resolve thread |
| Question | Answer with context, resolve thread |
| Major refactor | Create follow-up issue, note in thread |

## Error Handling

If CodeRabbit is unresponsive:

```bash
# Check CodeRabbit status
gh api repos/{owner}/{repo}/installation --jq '.id'

# Manual review request
gh pr comment {pr-number} --body "@coderabbitai please review this PR"

# Fallback: request human review
gh pr edit {pr-number} --add-reviewer {username}
```

## Best Practices

1. **Small commits**: Easier for CodeRabbit to review
2. **Clear messages**: Help CodeRabbit understand intent
3. **Don't block**: Continue working while waiting for review
4. **Batch responses**: Address multiple comments in one commit
5. **Close loops**: Always resolve threads after addressing
6. **Run quality checks**: `pnpm check` before every commit
7. **Test continuously**: `pnpm test` after implementing features

## Neo-Tokyo Specific Conventions

### Commit Message Format
```
feat({spec}): {task-id} {description}
fix({spec}): {bug description}
test({spec}): {test description}
docs({spec}): {doc update}
```

### File Organization
- Systems: `packages/game/src/systems/{System}.ts`
- Components: `packages/game/src/components/react/{category}/{Component}.tsx`
- Tests: `packages/game/src/systems/__tests__/{System}.test.ts`
- Types: `packages/game/src/types/game.ts`

### Quality Gates
- TypeScript strict mode (no `any`, no `@ts-ignore`)
- Biome linting passes (`pnpm check`)
- All tests pass (`pnpm test`)
- ECS architecture maintained
- Cel-shaded visual style preserved
