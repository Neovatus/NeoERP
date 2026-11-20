---
name: push-after-commit
description: Push commits right after they land (Jabran 2026-10-30); security/shared/cross-module commits only after the ERP-lead review passes
metadata:
  node_type: memory
  type: feedback
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-10-30T13:44:58.152Z
---

Jabran (2026-10-30): "when commit please pushes as well after commits." Push app (dev-app), backend (dev) and
workspace (master) after each builder's commits are verified (`git status --short` clean, tests green) — no
waiting for his acceptance click-through. Never force-push.

**Why:** he tests from the pushed branches and was being asked "shall I push?" after every batch.

**How to apply:** after a builder reports, check status/tests, then push in the same turn and say what was pushed.
Exception: commits in ERP-lead review scope (permissions/RBAC, auth, shared security, posting core, cross-module
migrations) get the independent review first; push once it says OK (fix-first findings fixed). Still tell him
when a restart is needed (new migrations). Supersedes the older "Jabran pushes / push only after acceptance" rule.
Related: [[builder-batching]], [[erp-lead-review-scope]].
