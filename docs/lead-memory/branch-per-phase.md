---
name: branch-per-phase
description: "After 2026-11-12 merge, main is the base; one branch + PR per phase/lane, delete after merge; no CI (tests run locally) (Jabran 2026-11-12)"
metadata:
  node_type: memory
  type: project
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-12T19:05:03.536Z
---

Decided by Jabran 2026-11-12:
1. Merge frontend dev-app → main and backend dev → main once (PR, merge commit), then delete dev-app / dev. main is the only long-lived branch.
2. Every phase or lane gets its own branch from main (`feat/…`, `fix/…`, `phase/…`) and a PR back to main; delete the branch after merge. Parallel PRs are fine.
3. No GitHub Actions CI (costs action credits; we test locally). So the lead runs the ONE full local test run per PR before merging, one at a time (see [[gradle-one-at-a-time]]); builders still only compile.
4. Old backend branches legacy-dev and jabran/NEB-5-Privilege-Service: delete (back them up as local tags first).

**Why:** branches grew too large; per-phase PRs allow parallel work and a review trail on GitHub.

**How to apply:** start every new lane from main on its own branch; open a PR; Opus review on review-scope PRs; merge after the lead's verified local full run; delete the branch and worktree. Shared-code PRs (design system, i18n resource files, core) merge one after another.

**Phase 3 test fixes (Jabran 2026-11-13):** both repos have `fix/phase3-test-fixes` from main. Every fix from Jabran's Phase 3 testing and the reviews goes there (commit + push to the branch). When he says the fixes are done: one full local run, open one PR per repo, merge, delete the branch. Phase 4 starts after that, on its own branch.

**Reviews on the fix branch (Jabran 2026-11-13):** no review per test fix. Small module fixes: targeted tests only. Security, money posting or migration fixes get their own Opus review as they land. Everything else, shared design-system work included (BACK-1, STICKY-1), is folded into ONE Opus review of the whole `fix/phase3-test-fixes` diff at the end, then one full run per repo, then the PRs.

**Phase 4 started early (Jabran 2026-11-14):** Phase 4 runs while he still tests Phase 3. It starts with A4 (recurring journals, accruals with auto-reversal, CSV journal import); A5 payroll posting waits for Payroll P0. Order: plan (Opus) → Jabran approves → backend build in a worktree under NeoERP-worktrees/, branch from main, never in the checkouts he tests from. FMT-T waits until fix/phase3-test-fixes is merged.

**Branch layout from Phase 4 (Jabran 2026-11-15):** slices → lane → phase → main. Each repo has `phase/4` from main (pushed). Lanes branch from `phase/4` (e.g. `phase/4-a4`, `phase/4-approval-limits`, `phase/4-platform`) and merge into `phase/4` when the lane is done (after its reviews + a full run). Parallel slices inside a lane use short sub-branches (e.g. `phase/4-a4-s4`) merged into the lane, then deleted. At the end of Phase 4: one full run per repo, one PR `phase/4` → main per repo, merge, delete. Same pattern for later phases.
Possible later change (Jabran 2026-11-15): branches may become feature → module (e.g. `module/accounts`) → main instead of lane → phase → main. Not decided; keep phase/4 until he says.


**Update 2026-11-16 (Jabran):** Phase 3 + the Phase 4 work so far merged to main (BackEnd PR #7, App PR #4) after the combined full run; retest fixes go on `phase/4`, a serious (money/security) one as a fix branch merged into both main and phase/4. `phase/4` restarted from the new main; Phase 4 lanes branch from `phase/4`, and main is merged into `phase/4` when needed; one Phase 4 PR to main at the end.
