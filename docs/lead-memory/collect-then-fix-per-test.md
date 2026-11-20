---
name: collect-then-fix-per-test
description: "During Jabran's manual test runs, collect findings per test and fix only when he finishes that test — no edits in the App checkout while he is mid-test"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-15T13:05:29.610Z
---

While Jabran runs a manual test (e.g. Phase 3 T1–T24), collect his findings in a list and start fixes only after he finishes that test (batch per T), not while he is clicking.

**Why:** builders editing the App checkout mid-test refresh his running app (Hot Reload) and sometimes leave it stuck (Jabran 2026-11-15).

**How to apply:** log each finding (test, step, what, screenshot) in the test's findings file; start one builder per batch when he says the T is done; tell him before any edit lands in the App checkout. Backend-only fixes also wait unless he asks. Related: [[app-tests-hot-reload]], [[builder-batching]].
