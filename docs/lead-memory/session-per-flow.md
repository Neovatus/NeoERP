---
name: session-per-flow
description: D-89 — module lead briefs and starts one fresh flow-lead session per flow; that session runs every stage with sub-agents and ends after its merge
metadata:
  node_type: memory
  type: feedback
  originSessionId: 77eb07db-44e8-4900-b3a4-0648a220edbf
  modified: 2026-11-25T08:53:07.380Z
---

The module lead (me for core/*, the new-Mac lead on the new Mac) writes the brief and starts **one fresh flow-lead session per flow**; it never builds, reviews or tests. The flow-lead session runs every stage with sub-agents (BE builder, App builder, combined Opus high reviewer + tester, fixer), verifies done-list rows between stages itself, merges the flow into the feature branch, writes its measures line, then ends and is archived. The new Mac runs one flow at a time (D-88). Features reach `main` through me with Jabran's gate answer.

**Why:** Jabran 2026-11-25: "it just delegates the brief to the flow lead… that session takes care of all with sub-agents on each stage, not itself". Keeps contexts small (D-86) and each stage fresh (D-87).

**How to apply:** never reuse a flow-lead session for a second flow; archive after merge. Related: [[workflow-v2]], [[cost-rules-d86]], [[done-list-verify]].
