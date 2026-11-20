---
name: qa-report-no-artifact
description: QA/retest results go to the repo report files only; no Claude artifact review page unless Jabran asks
metadata:
  type: feedback
---

Jabran (2026-11-19, retest round): don't create an artifact for QA results; the report files in docs/agents/<round>/ (per-test/group files, summary.md, screenshots) are enough.

**Why:** the repo reports already hold everything; an extra page is duplicate work and usage.
**How to apply:** after a QA or retest round, commit the reports and give a short chat summary; publish a review page only if he asks. Related: [[tester-agent-full-flows]].
