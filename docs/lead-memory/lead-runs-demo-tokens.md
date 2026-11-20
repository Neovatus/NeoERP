---
name: lead-runs-demo-tokens
description: "The lead may run `NEOERP_DEV_SESSION=1 scripts/make-demo-tokens.sh <users>` (NeoERP-BackEnd, local stack only) and NeoERP-App `tools/dev-session-to-si"
metadata:
  type: feedback
---

The lead may run `NEOERP_DEV_SESSION=1 scripts/make-demo-tokens.sh <users>` (NeoERP-BackEnd, local stack only) and NeoERP-App `tools/dev-session-to-simulator.sh` to refresh simulator sessions; never open or print `.local-secrets/*`, `*.jwt`, `*.session.json` or `neoerp-demo-tokens.env`; tester sub-agents do not run it (Jabran 2026-11-19).

**Lives in:** this memory; moves to WORKFLOW.md QA section with the DOCS-1 repo-guide edits.
