---
name: gated-workflow-d97
description: "D-97 gated workflow — rules check → Architect → Gate 1 → BE Engineer/Gate 2/Reviewer/Gate 3/Improver → App plan refresh → App same → simulator → fixes → final approval; no App in parallel, no splitting"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 77eb07db-44e8-4900-b3a4-0648a220edbf
  modified: 2026-11-25T21:18:17.480Z
---

Both Macs run every flow as: (rules check for money/legal) → Architect (brief, discovery in both repos, plan, test data, done rows) → Gate 1 (plan check) → **BE** Engineer → Gate 2 (compile + own tests + always-run, from result files) → Reviewer → Gate 3 (CONFIRMED HIGH/MEDIUM block) → Improver (only with findings) → **App plan refresh (Gate 1b)** → **App** Engineer → Gate 2 → Reviewer (App + seams) → Gate 3 → Improver → **simulator test** → fixes → Final approval (merge into feature; feature → main through me with Jabran's gate answer). No App in parallel; no splitting (one flow = one sub-feature, built in full). New agent per stage, titled repo · role · model · feature; state file per flow; merge is a click when reviewed+tested and base unmoved; our design numbers (44 pt, 600/720/1024/1280).

**Why:** Jabran 2026-11-25 (D-97, c5b13ca) after both leads cross-checked the gated workflow he sent (`.review-channel/workflow-gated-discussion.md`).

**How to apply:** table in workflow v2 §5; supersedes the parallel-after-mock-backend part of D-88. Related: [[session-per-flow]], [[done-list-verify]], [[branch-pr-on-github]].
