---
name: context-limit-compact
description: "At ~80% context: write .review-channel/handoff-implementer.md, then ask Jabran to run /compact (I can't run it myself)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 01e6cb16-5a8b-4e2e-998e-4f8ca7ee17b6
  modified: 2026-10-08T10:42:36.029Z
---

Reviewer entries 90/91 (2026-10-08, from Jabran): at about 80 % context, finish the small step, replace `.review-channel/handoff-implementer.md` (≤ 60 lines: checkpoint, done, in progress, exact next step, open entries, uncommitted work), then compact. Use `/compact keep: handoff-implementer.md, current checkpoint, open entries`, not a new session. Never hit automatic compaction mid-wave.

**Why:** auto-compaction mid-wave loses state; the handoff file makes resuming reliable.
**How to apply:** `/compact` is a user command I cannot invoke, so after writing the handoff, tell Jabran in chat to run it with that focus line; afterwards re-read WORKFLOW.md and the handoff. Full rule: WORKFLOW.md → "Context limit". Related: [[orchestrator-mode]], [[review-channel]].
