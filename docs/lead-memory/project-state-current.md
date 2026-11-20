---
name: project-state-current
description: "PROJECT-STATE.md is in git and kept current by the lead at the end of every batch; the .claude/.codex copies are deprecated history (Jabran 2026-11-20, never-read rule lifted)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-20T18:16:08.828Z
---

Jabran (2026-11-20): committed PROJECT-STATE*.md to the workspace repo and lifted the earlier "never read or touch PROJECT-STATE" rule so the state stops going stale.

**Why:** the file was still called canonical in AGENTS.md/WORKFLOW.md but had not changed since Sep 2026; new machines and agents would start from old state.
**How to apply:** at the end of every batch, together with the lessons register and memory backup, update the workspace `PROJECT-STATE.md` (index only: ID, owning plan link, owner, blocker, next approved work). `PROJECT-STATE.claude.md` and `PROJECT-STATE.codex.md` carry a DEPRECATED banner — never plan from them. Related: [[lessons-register]].
