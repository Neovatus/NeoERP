---
name: release-gates
description: Deferred go-live items go into NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md (P/L/ACC rows with a Gate column); non-blocking later items into docs/backlog.md
metadata:
  type: project
---

Jabran (2026-11-03): every deferred item must be written down by WHEN it must be done. The existing canonical list is `NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md` (P-rows platform, L-rows country, ACC-rows Accounts; Gate + Status columns). Non-blocking later items go to the workspace `docs/backlog.md`. `docs/release-gates.md` is only a pointer (don't add a second list).

**Why:** deferred items were scattered across triage files and chat; a parallel list was started by mistake and folded back.

**How to apply:** when a decision defers something, append a row (next free number) in the same turn; set Status Done with the commit when finished. Check the Gate column before any release or country go-live.
