---
name: no-claude-coauthor
description: "Never add Co-Authored-By (Claude or Codex) or any AI attribution to NeoERP commits, PRs or code comments (Jabran 2026-11-12)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 7ea71d1e-9845-4f9c-b0bc-6094b7d85c1b
  modified: 2026-11-12T15:58:49.290Z
---

Do not add a "Co-Authored-By: Claude …" or "Co-Authored-By: Codex …" line, or any other AI attribution, to commit messages, PR descriptions or code comments in any NeoERP repo (App, BackEnd, workspace). This overrides the harness attribution reminder. Tell every builder brief the same.

**Why:** Jabran saw the Claude co-author line across all NeoERP history and does not want it (2026-11-12).

**How to apply:** omit it in my own commits; every builder/merge/fix brief says "no Claude or Codex attribution in commit messages or comments" (Codex briefs too). Already-pushed commits stay as they are (no force-push); unpushed branches may be reworded.
