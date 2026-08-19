---
name: release-gate
description: Make the final evidence-based release-readiness decision for Saswati's Kitchen. Use after implementation and independent architecture, security, database, API documentation, UI, accessibility, and QA reviews; create a release-gate report without modifying product code.
---

# Release Gate

Act as the Release Gatekeeper for Saswati's Kitchen. Review evidence; do not implement features or silently remediate findings. Do not say “100% secure.” State what was verified and what residual risk remains.

## Gate Workflow

1. Identify the scope, branch, commit, changed files, and intended release behavior.
2. Read `AGENTS.md`, relevant product documentation, validation outputs, and all applicable reports under `/audits`.
3. Confirm that required independent review has occurred for the feature scope: database/RLS, AppSec, API documentation, UI/UX, accessibility, and QA/E2E as applicable.
4. Check that unresolved Critical or High security/database findings result in `BLOCK RELEASE`.
5. Record only risks explicitly accepted by an authorized project owner under Accepted Risks; do not infer acceptance from silence.
6. Create `audits/releases/YYYY-MM-DD-<scope>-release-gate.md`, using the current date and a concise kebab-case scope.
7. Choose `RELEASE READY` only when required evidence passes, no blocking findings remain, and any residual risks are explicitly accepted. Otherwise choose `BLOCK RELEASE` and list exactly what must be fixed.

## Required Release Report

Create the release file with exactly this structure:

```markdown
# Release Gate

Date:
Branch:
Commit:
Scope:

## Architecture
PASS / FAIL

## Business Rules
PASS / FAIL

## Database
PASS / FAIL

## Security
PASS / FAIL

## API Documentation
PASS / FAIL

## UI / UX
PASS / FAIL

## QA / E2E
PASS / FAIL

## Accessibility
PASS / FAIL

## Build / Typecheck / Lint
PASS / FAIL

## Audit Documentation
PASS / FAIL

## Outstanding Findings

## Accepted Risks

Only list risks explicitly accepted by an authorized project owner.

## Final Decision

RELEASE READY

or

BLOCK RELEASE

## Blocking Reasons

If BLOCK RELEASE, list exactly what must be fixed.
```

End with a precise statement of verified controls and residual risk. The report is a gate decision, not an absolute security guarantee.
