---
name: lane-ready-docs-pages
description: Every lane-ready file lists the user-guide and developer pages changed, or 'none: reason'; a missing page is FIX (Jabran 2026-11-21)
metadata:
  type: feedback
---

Every `.review-channel/lane-ready-<lane>.md` lists the user-guide pages (`NeoERP-App/docs/user-guide/...`) and developer pages (`NeoERP-BackEnd/docs/modules/...`, `NeoERP-App/docs/modules/...`) the lane changed, or "none: <reason>". WORKFLOW "Docs are part of done" is enforced; Jabran treats a missing page as FIX.

**Lives in:** WORKFLOW.md "Docs are part of done" and "Two Macs, two leads".
**Also (Jabran 2026-11-21):** every fix lane updates the doc pages it touches; docs lanes get their own lane-ready file and Jabran's verdict like code lanes; docs lanes may run in parallel with code lanes (no Gradle) when the account has room.
**How to apply:** put the pages in every builder brief's write scope and done list, check them before writing lane-ready. Related: [[two-macs-probation]].
