---
name: one-repo-per-builder
description: Builders (Claude and Codex) get only the repo they work in; briefs live inside that repo's docs; both repos only for cross-repo work (Jabran 2026-11-10)
metadata:
  type: feedback
---

A builder working on the app gets only NeoERP-App (its worktree), a backend builder only NeoERP-BackEnd. Briefs, plans and reviews for that work live inside the repo (`NeoERP-App/docs/agents/…`, `NeoERP-BackEnd/docs/agents/…`), not in the workspace `docs/agents/`. Only cross-repo tasks get both folders. Needed domain rules are copied into the brief, not pointed at. Same for Codex builders (`.codex/CODEX.md` in each repo).

**Why:** less to search, fewer wrong turns, no accidental edits to the other repo.

**How to apply:** done 2026-11-10 (I18N docs moved; rule in each repo's AGENTS.md, .claude/CLAUDE.md, .codex/CODEX.md and the workspace CLAUDE.md). Write new briefs in the target repo's docs/agents/<topic>/; give builders only that repo path. Related: [[edit-in-place-test-in-copy]], [[builder-batching]].
