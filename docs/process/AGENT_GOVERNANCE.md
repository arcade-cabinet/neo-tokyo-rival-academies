# Agent Governance & Workflow

> **Updated**: January 27, 2026 | **Platform**: Ionic Angular + Babylon.js

**Purpose**: Define how AI agents and human developers coordinate using GitHub to ensure the "Golden Record" is executed accurately.

## 1. Work Tracking

Primary tracking for this repository is maintained in the **memory-bank** directory. GitHub Projects are optional and may be skipped at the owner's discretion.

## 2. Issue Lifecycle

**Rule**: No code changes without an associated Issue.

**Owner Override**: The repository owner may explicitly authorize work to proceed without issues or project tracking for a given scope or session. This override must be recorded in documentation (memory-bank) and referenced in the commit notes for any work done under the exception.

**Current Directive**: Use memory-bank tracking in place of GitHub Issues/Projects until the owner re-enables them.

1.  **Creation**:
    - Title: Clear and action-oriented (e.g., "Implement Quest Generator v1").
    - Body: Link to relevant Golden Record doc (e.g., `/docs/gameplay/QUEST_SYSTEM.md`).
    - Labels: `feature`, `bug`, `refactor`, `documentation`.
    - Milestone: Associate with the current Phase (e.g., `Phase 1: MVP`).

2.  **Working**:
    - Assign the issue to yourself (the agent).
    - Move to `In Progress`.
    - Create a branch: `feat/issue-number-short-description` (e.g., `feat/12-quest-generator`).
    - **Exception**: For the current migration, work directly on `main` if explicitly requested.

3.  **Closing**:
    - Link PR to issue (e.g., "Closes #12").
    - Move to `Done` upon merge.

## 3. Pull Request (PR) Protocol

- **Title**: Semantic Commit style (e.g., `feat(quest): implement grammar tables`).
- **Description**:
  - Summary of changes.
  - Verification: How was this tested? (e.g., "Ran unit tests", "Manual playtest on Pixel 8a").
  - Linked Issue.
- **Checks**:
  - CI must pass (`pnpm test`, `pnpm check`, `pnpm test:e2e` as applicable).
  - No compile errors or warnings.

## 4. Documentation First

- Before writing code, check if the "Golden Record" (`/docs/`) covers the feature.
- If the feature requires a change to the design, **update the documentation first** in a separate PR or as the first commit.
- **Never** implement "cowboy code" that contradicts `/docs/`.

## 5. Agent Handoff

- When finishing a session, leave a comment on the Issue or PR with:
  - Current state.
  - Next steps.
  - Any blockers.
  - Updated context for the next agent.

## 6. Milestones (Phases)

- **Phase 1: Mobile MVP** (Deadline: Mar 31, 2026)
- **Phase 2: Story Depth** (Deadline: Jun 30, 2026)
- **Phase 3: Polish** (Deadline: Sep 30, 2026)
- **Phase 4: Launch** (Deadline: Dec 31, 2026)
