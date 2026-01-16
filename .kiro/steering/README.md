# Steering Rules for Neo-Tokyo: Rival Academies

This directory contains steering rules that guide AI assistants working on this project.

## Files

### Core Project Context
- **product.md** - Product overview, core features, game mechanics, design philosophy
- **tech.md** - Tech stack, common commands, code style, critical rules
- **structure.md** - Project organization, file conventions, development workflow

### Autonomous Execution
- **autonomous.md** - YOLO mode execution rules, error handling, commit strategy
- **spec-kickoff.md** - Complete workflow for kicking off specs autonomously
- **project-management.md** - GitHub integration, issue tracking, CodeRabbit workflow
- **large-specs.md** - Organization patterns for large specs with 50+ tasks

## Usage

### For Users

When you want to kick off a spec for autonomous execution:

```bash
kickoff {spec-name}
```

Example:
```bash
kickoff babylon-migration
```

The AI will:
1. Validate the spec exists
2. Create a git worktree
3. Create GitHub issue and PR
4. Execute ALL tasks autonomously
5. Commit and push continuously
6. Interact with CodeRabbit for reviews
7. Only stop when blocked or complete

### For AI Assistants

These steering files are automatically loaded and provide context for:

- **Product vision** - What we're building and why
- **Technical constraints** - Tech stack, code style, architecture
- **Project structure** - Where things go, how to organize code
- **Autonomous execution** - How to work independently for days
- **GitHub integration** - How to manage issues, PRs, milestones
- **CodeRabbit workflow** - How to collaborate with CodeRabbit AI

## Key Principles

1. **Zero Stubs Policy** - No TODO comments, fully implement features
2. **Production Quality** - Strict TypeScript, tested, documented
3. **YOLO Mode** - Execute continuously without asking for permission
4. **SEESAW Pattern** - Continuous agent-to-agent collaboration
5. **ECS Architecture** - Game logic in systems, rendering in components
6. **Cel-Shaded Visuals** - Use meshToonMaterial for anime aesthetic

## Autonomous Workflow

```
User: "kickoff {spec}"
  ↓
AI: Creates worktree, issue, PR
  ↓
AI: Executes Section 1 tasks (all of them)
  ↓
AI: Commits, pushes, triggers CodeRabbit
  ↓
AI: Immediately starts Section 2 (doesn't wait)
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
- [ ] Tests pass (`pnpm test`)
- [ ] ECS architecture maintained
- [ ] Cel-shaded visuals preserved

## Performance Targets

| Metric | Target |
|--------|--------|
| Bundle Size | <2MB gzipped |
| Initial Load | <3s on 3G |
| Frame Rate | 60 FPS (mobile) |
| Memory Usage | <200MB (mobile) |
| Asset Load | <500ms per character |

## Support

If you encounter issues with autonomous execution:
- Check `.kiro/specs/{spec-name}/` for spec documents
- Review `docs/` for architecture and design details
- Consult `AGENTS.md` for agent-specific guidelines
- Check GitHub issues for known problems
