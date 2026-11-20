---
name: test-steps-format
description: "Every time Jabran is asked to test, give numbered click-by-click steps with the expected result per step"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fe966f25-7261-4d33-af0b-3f8dddc67e0c
  modified: 2026-10-29T16:47:17.720Z
---

When asking Jabran to test in the app, always give: who to sign in as (password pointer to docs/local-demo-data.md,
never the password), then per test numbered clicks (menu path, field, value) and an **Expected:** line for what he
should see. Say what not to click when it would change demo state. Ask for screenshots only of steps that differ.

**Why:** Jabran (2026-10-29): "give me steps to test each time" — summary lists of what to check were not enough.

**How to apply:** use this format for every test request, including short ones. Related: [[edit-in-place-test-in-copy]].
