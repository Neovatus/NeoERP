---
name: agent-model-label
description: Start every Agent description with the model in brackets, e.g. "[Opus] C3 build", so Jabran sees it in the background-task list
metadata:
  type: feedback
---

Jabran (2026-11-05): the app's background-task list does not show which model an agent uses. Every Agent call's `description` starts with the model tag: `[Opus]`, `[Sonnet]`, `[Haiku]` (e.g. "[Opus] M5-C3 review").

**Why:** he wants to see at a glance which model each running agent uses.
**How to apply:** always, for every sub-agent; also name the model in the chat line when launching. Related: [[subagent-models]].
