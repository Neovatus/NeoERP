---
name: lead-subagent-reads
description: "Lead reads small things itself; >3 files, long logs or web pages go to a sub-agent and only the conclusion returns (lessons L07, trial)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-20T14:50:32.284Z
---

Agreed with Jabran 2026-11-20 (lessons register L07, stage Trial).

**Why:** everything the lead reads is re-sent every later turn; a sub-agent's fixed start-up cost (~15–20k tokens) is only worth it for big reads.
**How to apply:** a short diff or one report → read directly. Many files, long logs, web pages, or anything where only the conclusion matters → Explore/web-fetch sub-agent; parallel when independent. Note +/− evidence in `docs/lessons.md` after each batch. Related: [[lessons-register]].
