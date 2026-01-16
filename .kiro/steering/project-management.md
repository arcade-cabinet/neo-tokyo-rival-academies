# Project Management Steering

Guidelines for managing GitHub issues, milestones, projects, and tracking spec progress.

## GitHub CLI Setup

Ensure gh is authenticated with required scopes:

```bash
# Check current auth
gh auth status

# Add project scope if needed
gh auth refresh -s project

# Verify repo access
gh repo view
```

## Milestone Management

### Create Milestone for Spec

```bash
# Create milestone with due date
gh api repos/{owner}/{repo}/milestones \
  --method POST \
  -f title="{Spec Title}" \
  -f description="Implementation of {spec-name} spec" \
  -f due_on="2026-03-01T00:00:00Z" \
  -f state="open"
```

### List Milestones

```bash
gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.number): \(.title) (\(.open_issues) open)"'
```

### Update Milestone Progress

```bash
# Close milestone when complete
gh api repos/{owner}/{repo}/milestones/{number} \
  --method PATCH \
  -f state="closed"
```

## Issue Management

### Issue Templates

#### Feature Issue (Spec Implementation)
```bash
gh issue create \
  --title "🚀 feat: {Spec Title}" \
  --body "## Overview
{Brief description}

## Spec Documents
- [Requirements](.kiro/specs/{spec-name}/requirements.md)
- [Design](.kiro/specs/{spec-name}/design.md)
- [Tasks](.kiro/specs/{spec-name}/tasks.md)

## Progress
- [ ] Section 1: {Section Name}
- [ ] Section 2: {Section Name}
- [ ] Section 3: {Section Name}
...

## Acceptance Criteria
- All tasks in tasks.md complete
- All tests passing
- CodeRabbit review addressed
- Documentation updated
- Performance targets met

## Links
- PR: TBD
- Milestone: TBD" \
  --label "feature" \
  --label "spec"
```

#### Bug Issue
```bash
gh issue create \
  --title "🐛 bug: {Short Description}" \
  --body "## Description
{What's broken}

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
{What should happen}

## Actual Behavior
{What actually happens}

## Environment
- OS: 
- Browser/Device: 
- Version: 

## Screenshots/Logs
{If applicable}

## Related
- Spec: {spec-name if applicable}
- System: {ECS system if applicable}" \
  --label "bug"
```

#### Task Issue (Sub-task)
```bash
gh issue create \
  --title "📋 task: {Task Description}" \
  --body "## Parent Issue
Relates to #{parent-issue}

## Task
{Detailed task description}

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Notes
{Any additional context}" \
  --label "task"
```

### Link Issues

```bash
# Add issue to milestone
gh issue edit {number} --milestone "{Milestone Title}"

# Add labels
gh issue edit {number} --add-label "priority:high"

# Assign to user
gh issue edit {number} --add-assignee "@me"
```

## GitHub Projects (v2)

### Create Project

```bash
# Create project
gh project create --owner {owner} --title "{Project Name}"

# List projects
gh project list --owner {owner}
```

### Add Items to Project

```bash
# Add issue to project
gh project item-add {project-number} --owner {owner} --url {issue-url}

# Add PR to project
gh project item-add {project-number} --owner {owner} --url {pr-url}
```

## Progress Tracking

### Update Issue Progress

When completing spec sections, update the tracking issue:

```bash
# Get current issue body
BODY=$(gh issue view {number} --json body --jq '.body')

# Update checkbox (manual edit or script)
# Mark "- [ ] Section 1" as "- [x] Section 1"

gh issue edit {number} --body "$UPDATED_BODY"
```

### Add Progress Comment

```bash
gh issue comment {number} --body "## Progress Update

✅ Completed Section 1: {Section Name}
- {Key accomplishment 1}
- {Key accomplishment 2}
- {Key accomplishment 3}

🔄 Starting Section 2: {Section Name}

**Next steps:**
- {Next task 1}
- {Next task 2}
- {Next task 3}

**Commits:** {commit-range}"
```

## Labels

### Standard Labels

```bash
# Create standard labels
gh label create "feature" --color "0E8A16" --description "New feature"
gh label create "bug" --color "D73A4A" --description "Something isn't working"
gh label create "spec" --color "1D76DB" --description "Has associated spec"
gh label create "task" --color "FBCA04" --description "Sub-task"
gh label create "priority:critical" --color "B60205" --description "Critical priority"
gh label create "priority:high" --color "D93F0B" --description "High priority"
gh label create "priority:medium" --color "FBCA04" --description "Medium priority"
gh label create "priority:low" --color "0E8A16" --description "Low priority"
gh label create "blocked" --color "D93F0B" --description "Blocked by dependency"
gh label create "needs-review" --color "7057FF" --description "Needs code review"
gh label create "ecs" --color "5319E7" --description "ECS system related"
gh label create "3d-graphics" --color "0052CC" --description "3D graphics related"
gh label create "combat" --color "E99695" --description "Combat system"
gh label create "narrative" --color "C5DEF5" --description "Narrative/dialogue"
gh label create "mobile" --color "BFD4F2" --description "Mobile specific"
```

## Neo-Tokyo Specific Labels

```bash
# Game system labels
gh label create "system:physics" --color "5319E7" --description "Physics system"
gh label create "system:combat" --color "5319E7" --description "Combat system"
gh label create "system:ai" --color "5319E7" --description "AI system"
gh label create "system:progression" --color "5319E7" --description "Progression system"
gh label create "system:dialogue" --color "5319E7" --description "Dialogue system"

# Component labels
gh label create "component:character" --color "0052CC" --description "Character component"
gh label create "component:enemy" --color "0052CC" --description "Enemy component"
gh label create "component:ui" --color "0052CC" --description "UI component"

# Content labels
gh label create "content:genai" --color "FBCA04" --description "GenAI content generation"
gh label create "content:assets" --color "FBCA04" --description "Asset related"
```

## Worktree Management

### List Worktrees

```bash
git worktree list
```

### Create Worktree for Spec

```bash
# Pattern: ../worktrees/neo-tokyo-{spec-name}
git worktree add ../worktrees/neo-tokyo-{spec-name} -b feature/{spec-name}
```

### Remove Worktree

```bash
git worktree remove ../worktrees/neo-tokyo-{spec-name}
git branch -d feature/{spec-name}
```

### Prune Stale Worktrees

```bash
git worktree prune
```

## CodeRabbit Integration

### Trigger Review

```bash
# Review entire PR
gh pr comment {pr-number} --body "@coderabbitai review"

# Review specific path
gh pr comment {pr-number} --body "@coderabbitai review packages/game/src/systems/"

# Review with focus
gh pr comment {pr-number} --body "@coderabbitai review with focus on ECS architecture"
```

### Get CodeRabbit Comments

```bash
# Get all CodeRabbit comments
gh api repos/{owner}/{repo}/pulls/{pr-number}/comments \
  --jq '.[] | select(.user.login == "coderabbitai") | "\(.path):\(.line) - \(.body | split("\n")[0])"'
```

### Resolve Review Thread

```bash
# Resolve thread after addressing feedback
gh api graphql -f query='
mutation {
  resolveReviewThread(input: {threadId: "{thread-id}"}) {
    thread { isResolved }
  }
}'
```

## Performance Tracking

Track performance metrics in issue comments:

```bash
gh issue comment {number} --body "## Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Bundle Size | <2MB gzipped | {current} | {✅/❌} |
| Initial Load | <3s on 3G | {current} | {✅/❌} |
| Frame Rate | 60 FPS | {current} | {✅/❌} |
| Memory Usage | <200MB | {current} | {✅/❌} |
| Asset Load | <500ms/char | {current} | {✅/❌} |

**Notes:** {any notes}"
```

## Test Coverage Tracking

```bash
gh issue comment {number} --body "## Test Coverage

| Package | Coverage | Status |
|---------|----------|--------|
| @neo-tokyo/game | {percentage}% | {✅/❌} |
| @neo-tokyo/content-gen | {percentage}% | {✅/❌} |

**Uncovered areas:**
- {area 1}
- {area 2}

**Next steps:**
- {action 1}
- {action 2}"
```

## Autonomous Workflow Integration

When executing specs autonomously:

1. **Create issue** at kickoff
2. **Update progress** after each section
3. **Trigger CodeRabbit** after each push
4. **Resolve threads** autonomously when possible
5. **Close issue** when spec complete

All of this happens without user intervention unless blocked.
