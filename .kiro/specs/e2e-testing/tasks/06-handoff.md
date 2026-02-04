# 6. Handoff Spec Generation

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirement 14

## Overview

Generate a comprehensive handoff spec for the next agent to continue feature completion work.

## Prerequisites

- All previous sections complete
- All E2E tests passing
- Test coverage documented

## Tasks

### 6.1. Analyze Remaining Work

**Validates:** Requirement 14.2, 14.3

- [ ] 6.1.1. Review Golden Record for remaining features
  - Read `docs/00-golden/GOLDEN_RECORD_MASTER.md`
  - Read `docs/00-golden/PHASE_ROADMAP.md`
  - Identify Phase 1 MVP requirements not yet implemented
  - Document feature gaps

- [ ] 6.1.2. Review parity assessment
  - Read `memory-bank/parity-assessment.md`
  - Read `memory-bank/parity-matrix.md`
  - Identify legacy features not yet ported
  - Prioritize by MVP importance

### 6.2. Document Test Coverage

**Validates:** Requirement 14.4

- [ ] 6.2.1. Generate test coverage report
  - Run all E2E tests and capture results
  - Document which requirements have test coverage
  - Document which requirements need more tests
  - Note any flaky or skipped tests

### 6.3. Create Handoff Spec

**Validates:** Requirement 14.1, 14.2, 14.3

- [ ] 6.3.1. Create `.kiro/specs/feature-completion/requirements.md`
  - Document all remaining Phase 1 features
  - Prioritize by MVP criticality
  - Include acceptance criteria from Golden Record
  - Reference relevant design docs

- [ ] 6.3.2. Create `.kiro/specs/feature-completion/design.md`
  - Document architecture for remaining features
  - Include implementation approach
  - Reference existing patterns in codebase
  - Note any technical debt to address

- [ ] 6.3.3. Create `.kiro/specs/feature-completion/tasks.md`
  - Break down remaining work into tasks
  - Organize by feature area
  - Include verification steps
  - Estimate complexity

### 6.4. Update Memory Bank

**Validates:** Requirement 14.5, 14.6

- [ ] 6.4.1. Update `memory-bank/activeContext.md`
  - Mark E2E testing spec as complete
  - Add feature-completion spec as next work
  - Document current test coverage status
  - Note any blockers or known issues

- [ ] 6.4.2. Update `memory-bank/progress.md`
  - Add E2E testing completion entry
  - Document test results
  - Include handoff spec creation
  - Note next steps for next agent

## Verification

After completing this section:
- [ ] Handoff spec exists at `.kiro/specs/feature-completion/`
- [ ] Memory bank updated with current state
- [ ] All E2E tests documented
- [ ] Next agent has clear path forward

## Handoff Checklist

Before marking complete:
- [ ] All E2E tests passing
- [ ] Test coverage documented
- [ ] Remaining features identified
- [ ] Handoff spec created
- [ ] Memory bank updated
- [ ] Commit and push all changes

## Common Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Generate HTML report
pnpm -C e2e test -- --reporter=html

# View report
open e2e/playwright-report/index.html
```
