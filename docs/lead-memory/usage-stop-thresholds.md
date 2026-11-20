---
name: usage-stop-thresholds
description: "Plan-limit stop rule: at 90% (5-hour or weekly) start nothing new, only finish the running builder; at 92% stop everything and hand off (Jabran 2026-11-15)"
metadata:
  type: feedback
---

Jabran (2026-11-15): keep Phase 4 going while Phase 3 testing waits, but watch the plan limits.

**How to apply:** check `get_usage` (5-hour and weekly all-models) before starting any builder and when one finishes.
At **90%** on either: start no new builder or review; only let the running one finish. At **92%**: stop — no new tool
work, write the handoff, tell Jabran where it stopped and when the limit resets. Extra usage is already spent past its
monthly cap, so don't rely on it. Related: [[save-usage-limits]], [[context-limit-compact]].

**Below 90%, keep going (Jabran 2026-11-16):** don't pause work to wait for a reset while under 90%; start the next
phase item. Only the 90/92% thresholds stop work.

**Again (2026-11-19):** don't hold a lane because running work might push usage past 90 later. Below 90% start it now; builders commit as they go, so a 92% stop loses little.
