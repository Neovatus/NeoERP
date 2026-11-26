---
name: done-list-verify
description: "D-87 — every flow keeps an open done list (docs/agents/<feature>/done.md); each step verifies inherited rows with fresh evidence, never from memory"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 77eb07db-44e8-4900-b3a4-0648a220edbf
  modified: 2026-11-25T07:00:44.723Z
---

Each flow keeps one open done list (`docs/agents/<feature>/done.md`, template `docs/templates/done.md`) from brief to merge. Every step **verifies** the rows it inherits (re-read files, open the test and confirm it proves the row, run it, look at the screen) before adding its own; evidence from that step's own run, never from memory or summaries. The list is open inside the scope of the DoD (brief goal + scope edges); outside-scope finds go under "Outside the scope" (reported/backlog, not built). Lead checks plan rows before build, spot-checks two rows before merge.

**Why:** Jabran 2026-11-25: steps passed on the previous step's word "without actually checking and verifying"; missed callers, tests not on real BE answers, and a test bypass all slipped through.

**How to apply:** put the done-list line in every brief; when I (or a compacted/resumed agent) report status, re-read the files first rather than recalling. Related: [[workflow-v2]], [[cost-rules-d86]].
