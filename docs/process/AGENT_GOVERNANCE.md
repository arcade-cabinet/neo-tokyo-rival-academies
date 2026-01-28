# Agent Governance & Workflow

> **Updated**: January 27, 2026 | **Platform**: Ionic Angular + Babylon.js

**Purpose**: Define how AI agents and human developers coordinate using the memory-bank to ensure the "Golden Record" is executed accurately.

## 1. Work Tracking

Primary tracking for this repository is maintained in the **memory-bank** directory. GitHub Projects are optional and may be skipped at the owner's discretion.

## 2. Work Sessions (No Issues)

**Rule**: Track all work in the memory-bank instead of GitHub Issues/Projects until the owner re-enables them.

**Session Logging**:
1.  Record scope, goals, and decisions in `memory-bank/activeContext.md`.
2.  Record progress updates in `memory-bank/progress.md`.
3.  Record parity checks in `memory-bank/parity-assessment.md` and `memory-bank/parity-matrix.md` as needed.
4.  Link commits to memory-bank entries in commit messages when relevant.

## 3. Main-Branch Workflow

- **Default**: Work directly on `main` unless the owner requests a PR.
- **Commits**: Use Semantic Commit style (e.g., `feat(quest): implement grammar tables`).
- **Verification**:
  - CI-equivalent checks should pass locally (`pnpm test`, `pnpm check`, `pnpm test:e2e` as applicable).
  - No compile errors or warnings.
  - Link commits to memory-bank entries when relevant.

## 4. Documentation First

- Before writing code, check if the "Golden Record" (`/docs/`) covers the feature.
- If the feature requires a change to the design, **update the documentation first** in a separate PR or as the first commit.
- **Never** implement "cowboy code" that contradicts `/docs/`.

## 5. Agent Handoff

- When finishing a session, update the memory-bank with:
  - Current state.
  - Next steps.
  - Any blockers.
  - Updated context for the next agent.

## 6. Milestones (Phases)

- **Phase 1: Mobile MVP** (Deadline: Mar 31, 2026)
- **Phase 2: Story Depth** (Deadline: Jun 30, 2026)
- **Phase 3: Polish** (Deadline: Sep 30, 2026)
- **Phase 4: Launch** (Deadline: Dec 31, 2026)
