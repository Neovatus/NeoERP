---
name: lead-runs-demo-tokens
description: The lead may run make-demo-tokens.sh itself to refresh expired dev session files (local stack only); never read its inputs or outputs
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-19T22:31:57.461Z
---

Jabran (2026-11-19): "when you need to refresh token run the command as well". The lead runs `NEOERP_DEV_SESSION=1 scripts/make-demo-tokens.sh <users…>` from NeoERP-BackEnd itself when simulator sessions expire (30 min idle), then `tools/dev-session-to-simulator.sh` (in NeoERP-App) plus keychain reset and relaunch.

**Why:** saves round-trips to Jabran during QA rounds.
**How to apply:** local stack only; the script reads `.local-secrets/demo-passwords` itself. Never cat, open or print that file, the `.jwt`/`.session.json` outputs, or `neoerp-demo-tokens.env`; pass paths only. Sub-agent testers still do not run it. Related: [[tester-agent-full-flows]].
