---
name: no-github-ci-dev
description: GitHub Actions off on all three repos in dev (Jabran 2026-11-21); never enable Actions or add a workflow without his OK
metadata:
  node_type: memory
  type: project
  originSessionId: 074a7a2d-fac5-4566-aefe-001b9b6a01eb
  modified: 2026-11-21T08:40:05.649Z
---

Jabran 2026-11-21: Actions that consume minutes were meant to be off; dev mode, no CI pipeline yet. Switched off on `Neovatus/NeoERP-BackEnd` (was already off), `Neovatus/NeoERP-FrontEnd` (the App) and `Neovatus/NeoERP` (workspace). Rule in WORKFLOW.md guardrails.

**Why:** Actions minutes cost money; the local `scripts/verify.sh` + pre-push hook are the gate until go-live (row P-8).
**How to apply:** never enable Actions or add a `.github/workflows` file without Jabran's OK; enabling the BackEnd would start `services-test.yml` on every push to main and phase/**. Related: [[release-gates]], [[verify-trust-check]].
