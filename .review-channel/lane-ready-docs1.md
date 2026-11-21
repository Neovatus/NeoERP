# Lane ready: DOCS-1 (docs clean-up) — 2026-11-21

**Repo / branch:** workspace `NeoERP`, `phase/4-b2-docs1` (pushed). Merge target: workspace `master`.
**Range:** `df97a45..3452aa5` (4 commits: 86b9c67 build, 4d57ae1 round-1 fixes, 3a13d67 Jabran's answers, 3452aa5 round-2 fixes). Based on current `origin/master`.
**Brief:** `docs/agents/docs-cleanup/brief.md` (on master). Approved: evening plan step 2 (Jabran 2026-11-20).
**Builder:** Sonnet 5.5 (docs-only, decided answers). **Reviewer:** Opus 5.5, fresh, read-only.

## Reviews
- `docs/agents/docs-cleanup/review-1-opus.md`: Reviewed 86b9c67, FIX, 10 findings (4 MAJOR). All fixed in 4d57ae1, with lead rulings: second reviewer + re-runs stay "money and security" (wider list is an open question); decision-owner text restored (Cowork → "the reviewer (fresh Opus sub-agent)"), owner question open; memory rules moved into WORKFLOW before any memory delete.
- `docs/agents/docs-cleanup/review-2-opus.md`: Reviewed 3a13d67, fixes-only round, FIX: 1 MAJOR (re-run on every review contradicted "UI and wording: no re-runs") + 3 MINOR. All four fixed by the lead in 3452aa5 exactly as the reviewer worded them. Two-round rule: no third round.
- Not a money/security lane (docs only; no `risk-paths` exist in the workspace), so no second reviewer.

## Jabran's answers applied (2026-11-21)
hrp-draft-commits-preaccepted → delete; move-to-repo targets per the mapping (builder rules → repo AGENTS.md, cross-repo → WORKFLOW.md, design/UI → NeoERP-App/docs/design/); "Canonical state" no-moves sentence → "Moving or retiring a document needs Jabran's OK for that change."

## Tests
Docs only: no tests (WORKFLOW test scope "Docs only: no tests"). No code repo touched.

## Write-scope check (`git diff --name-only origin/master..3452aa5`)
`WORKFLOW.md`, `AGENTS.md`, `.codex/CODEX.md`, `docs/agents/docs-cleanup/{proposals.md, review-1-opus.md, review-2-opus.md}` — all inside the brief's write scope. `CLAUDE.md` unchanged (no contradictions). No AI attribution in any commit message (checked).

## Open questions for Jabran (in proposals.md)
1. Should numbering, locking, migrations, isolation or statutory work also get the second reviewer and test re-runs?
2. Who owns design and architecture decisions now that the Cowork reviewer is retired?

## After MERGE (lead)
Apply the proposals: 9 repo-guide rows (after Lane 0 merges, on b2 lane branches) and the memory table (delete/keep/move per row).

## Docs pages (rule from 2026-11-21, added after merge)
User guide: none: process docs only. Developer pages: none: no code or feature changed.
