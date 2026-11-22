---
name: builder-mac-test-mac
description: "New Mac (16 GB) builds with targeted tests only; old Mac (M3 Max 36 GB) runs all full gates, backend stack, simulators, reviews, merges, assigns build tasks to the new Mac and builds HR/Payroll in parallel (Jabran 2026-11-22)"
metadata:
  type: project
---

Jabran 2026-11-22 ("yes use that split after new mac finishes; this mac can decide task to the new mac for builder and you can work in parallel as well"). Starts when the new Mac has finished TEST-SPEED-1, TEST-SPEED-APP and FIX-APP-B1.

- **New Mac (16 GB) = builder Mac:** builders compile + targeted tests only, push lane branch, lane-ready without full-run result; no full verify.sh, no full backend stack.
- **Old Mac (M3 Max, 14 cores, 36 GB) = test and integration Mac:** every full gate for both repos, backend stack and simulators for QA, reviews + verdicts, merge under the standing merge rule ([[standing-merge]]), **assigns the new-Mac lead's build tasks** (brief in the repo's docs/agents/<topic>/ + claims.md line), builds HR/Payroll v2 in parallel when gates leave room.

**Why:** 16 GB cannot hold a full test run next to the backend stack (swapping, slow tests, memory not released); the 36 GB Mac can.
**How to apply:** WORKFLOW.md "Builder Mac and test Mac"; claims.md top; told the new-Mac lead in docs/inbox/erp-lead.md. Self-hosted GitHub runner on the old Mac is a later option, Actions off until Jabran approves ([[no-github-ci-dev]]). Related: [[two-macs-probation]], [[dev-speed-review]], [[gradle-one-at-a-time]].

**Update 2026-11-22 (Jabran: "the builder Mac builds, takes decisions, reviews and fixes, then the target run; so we don't repeat here"):** the new Mac owns each lane up to the gate incl. reviews and fix rounds; the old Mac does NOT repeat reviews: it checks lane-ready + review files, runs the full gate / jar-mode start / simulator checks, writes the verdict, merges (standing merge, [[standing-merge]]). The four lanes already in review on the old Mac (TEST-SPEED-1, TEST-SPEED-APP, FIX-APP-B1, BE-JDK21) finish here.

**Parallel builders (Jabran 2026-11-22):** "the new Mac lead builder can do multiple builders in parallel, we should do that". Several builders at once on the builder Mac, each its own lane/worktree, no shared files; Gradle one job per repo (L33) on 16 GB; back off on swap/OOM. Supersedes "one builder at a time" in [[save-usage-limits]] and [[builder-batching]] for the builder Mac. Keep a task queue in claims.md so a freed slot gets work.

**Backend stack on demand (Jabran 2026-11-22):** start the local stack only right before simulator checks or Jabran's own testing, stop it after; gates and builders use Testcontainers and never need it.

**D-61 (Jabran 2026-11-22, trial from Accounts 4b):** new Mac (16 GB) runs Accounts end to end incl. its own scoped gates and merges into the Accounts phase branch; asks the old Mac for simulator sessions (run here on 36 GB), shared-code changes, decisions and phase → main. Old Mac: HR & Payroll end to end + all simulator sessions + every phase → main. Check-in after the first 4b batch.
