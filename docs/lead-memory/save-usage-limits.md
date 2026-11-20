---
name: save-usage-limits
description: "Keep agent use lean during testing — one builder at a time, Sonnet for small fixes, bigger batches, Opus review only for money/security/locking; Jabran prefers waiting over burning limits (2026-11-15)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-15T15:20:58.126Z
---

Jabran (2026-11-15): "I don't want to run many things and use a lot of limits; I can even wait."

**How to apply:** one builder at a time (no parallel App + backend builders unless he asks); combine findings of
several tests into one batch instead of a builder per test; Sonnet for UI/wording/small fixes, Opus only for money,
security, locking, migrations and their reviews; no separate desk-check or sweep agents unless asked; lead runs the
targeted tests itself. Short status messages. Related: [[subagent-models]], [[collect-then-fix-per-test]].
