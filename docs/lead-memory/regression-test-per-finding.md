---
name: regression-test-per-finding
description: Every HIGH/MEDIUM review finding needs a regression test shown to fail on the old commit and pass on the fix; LOWs may move to a fix-lane row if more than small (Jabran 2026-11-21)
metadata:
  type: feedback
---

Every HIGH/BLOCKER and MEDIUM/MAJOR finding gets a regression test that fails on the old code and passes on the fix; the builder proves it (old: FAIL / new: PASS) in the report. LOWs that take more than a small change go to a numbered fix-lane row (e.g. R30) instead of stretching the lane. Round 2 of each review checks only the fixes.

**Why:** Jabran 2026-11-21, Lane 0 BE review fixes.
**How to apply:** put this in every fix list sent to a builder. Related: [[money-security-guardrails]], [[second-reviewer-independent]].
