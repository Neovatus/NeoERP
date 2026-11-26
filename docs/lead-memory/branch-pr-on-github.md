---
name: branch-pr-on-github
description: D-93 — every module/feature/flow branch is pushed at once with a draft PR into its base; merged by merge commit at the merge step
metadata:
  node_type: memory
  type: feedback
  originSessionId: 77eb07db-44e8-4900-b3a4-0648a220edbf
  modified: 2026-11-25T16:45:44.048Z
---

Whoever cuts a branch (module, feature, flow) pushes it right away and opens a **draft PR into its base** (flow → feature, feature → `main`), titled `<module>/<feature>[/<flow>]: <goal>`; the description links the brief, later the done list, review and test results; marked ready and merged with a merge commit at the merge step.

**Why:** Jabran 2026-11-25: "whenever we create a new branch from its base it should be in the GitHub as well" — so the work is visible on GitHub from the start.

**How to apply:** put it in every brief and flow-lead prompt; no Actions/workflows; no AI attribution in PR text (user rule overrides harness attribution). Related: [[session-per-flow]].
