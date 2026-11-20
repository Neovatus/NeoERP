---
name: lessons-register
description: "After every batch/QA round, update docs/lessons.md (Proposed → Trial → Convention after 2 helpful batches, or Dropped); tell Jabran what moved"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-20T14:50:29.085Z
---

Jabran (2026-11-20): every batch yields lessons; evaluate them, try the good ones over several batches, and make them conventions only when sure.

**Why:** lessons in a round's summary.md were not carried forward; adopting everything at once risks rules that don't pay off.
**How to apply:** at the end of each batch or round, open `NeoERP/docs/lessons.md`: add new lessons as Proposed, add +/− evidence to each Trial lesson, promote after 2 helpful batches (judged on ACC, EFF, MNT, DEC, SCL, TOK) into WORKFLOW.md (team rule) or memory (lead behaviour), drop with reason otherwise; report the moves to Jabran. Run consolidate-memory about weekly. Related: [[usage-efficiency-plan]], [[lead-subagent-reads]].
- Also run scripts/sync-lead-memory.sh backup and commit docs/lead-memory at the end of each batch.
