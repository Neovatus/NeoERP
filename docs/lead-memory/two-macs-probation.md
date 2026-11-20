---
name: two-macs-probation
description: "Jabran uses two Macs/accounts; new-Mac lead is on probation (lane branches only, lane-ready files); old-Mac lead reviews and writes lane-verdict MERGE before any phase/4 merge"
metadata:
  node_type: memory
  type: project
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-20T23:36:11.919Z
---

From 2026-11-21 Jabran runs two leads: the new Mac (Ultra account, fresh limits) does QA batch 2; the old Mac (Team account) oversees. Rules in WORKFLOW.md "Two Macs, two leads" and `.review-channel/claims.md`.

**Why:** Jabran wants to drive and reconcile the new lead until it behaves as expected.
**How to apply:** on the old Mac: pull, read `.review-channel/lane-ready-<lane>.md`, review the lane branch diff and its process (brief with write/read scope, fresh review, money/security second reviewer, test output "BUILD SUCCESSFUL" + "0 failed", no AI attribution, write-scope paths), write `lane-verdict-<lane>.md` MERGE or FIX list, push. Probation ends only when Jabran says so. Memory sync: no deletes, newer wins; merge MEMORY.md lines by hand if both changed. Related: [[money-security-guardrails]], [[lessons-register]].
