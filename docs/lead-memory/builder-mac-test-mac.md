---
name: builder-mac-test-mac
description: "New Mac (16 GB) builds with targeted tests only; old Mac (M3 Max 36 GB) runs all full gates, backend stack, simulators, reviews, merges, assigns build tasks to the new Mac and builds HR/Payroll in parallel (Jabran 2026-11-22)"
metadata:
  type: project
---

Jabran 2026-11-22 ("yes use that split after new mac finishes; this mac can decide task to the new mac for builder and you can work in parallel as well"). Starts when the new Mac has finished TEST-SPEED-1, TEST-SPEED-APP and FIX-APP-B1.

- **New Mac (16 GB) = builder Mac:** builders compile + targeted tests only, push lane branch, lane-ready without full-run result; no full verify.sh, no full backend stack.
- **Old Mac (M3 Max, 14 cores, 36 GB) = test and integration Mac:** every full gate for both repos, backend stack and simulators for QA, reviews + verdicts, merge after Jabran's MERGE, **assigns the new-Mac lead's build tasks** (brief in the repo's docs/agents/<topic>/ + claims.md line), builds HR/Payroll v2 in parallel when gates leave room.

**Why:** 16 GB cannot hold a full test run next to the backend stack (swapping, slow tests, memory not released); the 36 GB Mac can.
**How to apply:** WORKFLOW.md "Builder Mac and test Mac"; claims.md top; told the new-Mac lead in docs/inbox/erp-lead.md. Self-hosted GitHub runner on the old Mac is a later option, Actions off until Jabran approves ([[no-github-ci-dev]]). Related: [[two-macs-probation]], [[dev-speed-review]], [[gradle-one-at-a-time]].
