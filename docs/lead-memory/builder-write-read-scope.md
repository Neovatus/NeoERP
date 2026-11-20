---
name: builder-write-read-scope
description: "Every builder brief names a write scope (exact folders it may change; else stop and ask) and a read scope (rest of repo, read-only, to reuse existing patterns/architecture — no invented patterns); lead checks diff paths before merge (Jabran 2026-11-19)"
metadata:
  type: feedback
---

Jabran (2026-11-19): builders given a whole repo duplicate or invent their own patterns instead of the project's
standards and architecture.

**How to apply:** in every Claude/Codex brief add "Write scope: <folders>" and "Read scope: rest of repo, read-only —
reuse existing pattern/building block/helper/test harness; no new pattern where one exists; stop and ask if none
fits". Report must list what was reused. Before merge, check `git diff --stat` paths against the write scope and look
for duplicates. Keep the full repo checked out (build, shared modules, architecture tests need it). Rule lives in
WORKFLOW.md "Builder scope". Related: [[one-repo-per-builder]], [[subagent-models]].
