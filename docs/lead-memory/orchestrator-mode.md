---
name: orchestrator-mode
description: Jabran wants the main agent to orchestrate many parallel agents (which may spawn their own sub-agents) and stay interactive
metadata:
  node_type: memory
  type: feedback
  originSessionId: e8485ecf-4bea-475b-a00d-acfb82dd4543
  modified: 2026-10-03T20:12:18.381Z
---

Main agent = orchestrator: stays responsive in chat, launches multiple background agents in parallel (agents may spawn sub-agents), watches and checks their outputs, integrates, reports. Don't do long work in the foreground or serialize work that can run in parallel.

**Why:** Jabran wants to keep interacting while work runs (stated 2026-10-03; also in WORKFLOW.md "Working mode").
**How to apply:** Split by files, start agents early in background, tell agents they may spawn sub-agents, review their results before committing.
