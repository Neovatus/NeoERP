---
name: worktree-isolation-repo
description: "Agent isolation:\"worktree\" branches from whatever repo the session cwd is in; the NeoERP umbrella isn't a repo, so backend agents got App worktrees"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 01e6cb16-5a8b-4e2e-998e-4f8ca7ee17b6
  modified: 2026-10-06T17:20:44.864Z
---

`Agent(isolation: "worktree")` creates the worktree from the repo of the session's *current* working directory. NeoERP/ is not a git repo and the cwd drifts into NeoERP-App or NeoERP-BackEnd after Bash calls, so on 2026-10-06 four backend agents got NeoERP-App worktrees (at an odd "Initial commit" base) and had to clone the backend themselves.

**Why:** wrong-repo worktrees waste agent time and risk edits to the shared checkout.
**How to apply:** before spawning backend worktree agents, `cd` into NeoERP-BackEnd in a Bash call (and into NeoERP-App for app agents), spawn same-repo agents together, and tell each agent to verify `git rev-parse --show-toplevel` and HEAD before editing. Or skip isolation and have agents `git clone` the repo into the scratchpad. Related: [[orchestrator-mode]], [[app-tests-hot-reload]].
