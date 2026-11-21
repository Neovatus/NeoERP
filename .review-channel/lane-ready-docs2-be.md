# Lane ready: DOCS-2b backend developer pages — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-docs2-be` (pushed). Merge target: `phase/4`.
**Range:** `e36b6c6a..cdb268bf` (brief 4da31364; 7 page commits 28be5aa6..b58c07fd; review fixes 8b258679; review files).
**Brief:** `docs/agents/docs2/brief.md` on the branch. Approved: Jabran 2026-11-21 (DOCS-2, docs lanes in parallel).
**Builder:** Sonnet 5.5. **Reviewer:** Opus 5.5, fresh, read-only. Docs only: no money/security code, so one reviewer.

## Reviews (`docs/agents/docs2/` on the branch)
- `review-1-opus.md`: Reviewed b58c07fd, FIX: 1 MAJOR (Create draft now permission: `JOURNAL.CREATE` guard + fresh `RECURRING_JOURNAL.READ` in `RecurringRunService.kt:64-65`; the builder had wrongly called it a spec difference), 1 MINOR (stale README slice table). ~25 claims verified against code and migrations (jobs, locks, idempotency keys, V67/V68/V71/V74 constraints, permissions, refunds, write-offs, approval limits with S5 stated as not built).
- `review-2-opus.md`: Reviewed 8b258679, fixes only: ACCEPT. README slice table rows checked against migrations/controllers (A2, A3, A4, AL partly built, B, C, D and E not built). Note (not blocking): V60–V65 are shared dimension migrations, not B-only.

## Tests
Docs only, no code: no tests (WORKFLOW test scope).

## Rendering
Every changed page rendered through GitHub's Markdown renderer (`gh api markdown`, gfm, repo context) and checked by script: one H1, no skipped heading levels, equal table columns, no raw HTML, all relative links resolve. 10 of 10 pages clean at 8b258679. Cross-repo references are plain backticked paths. Visual look in the browser pane: not done (pane hidden).

## Write-scope check (`git diff --name-only e36b6c6a..cdb268bf`)
`docs/modules/accounts/{README, approval-limits, automatic-reversal, customer-advances, customer-write-offs, journal-import, journals-and-posting, period-close, recurring-journals, refunds-advances-and-write-offs}.md`, `docs/agents/docs2/{brief, review-1-opus, review-2-opus}.md` — all in scope. No AI attribution (checked).

## Docs pages
- **Developer pages (this lane):** new `recurring-journals.md`, `automatic-reversal.md`, `journal-import.md`, `refunds-advances-and-write-offs.md`, `approval-limits.md`; updated `README.md` (slice table 2026-11-21), `period-close.md`, `journals-and-posting.md`, `customer-advances.md`, `customer-write-offs.md`.
- **User guide:** none here: it lives in NeoERP-App (lane DOCS-2a, `phase/4-b2-docs2-app`).

## For Jabran / backlog
- Failed scheduled reversals retry with no attempt limit (code behaviour, `ScheduledReversalJob.kt:60-61`); the page says so; backlog row to add.
- Spec texts that lag the code (A4 §5.1 now matches; approval-limits §10.2 deciders read under Standard; accounts-b §7.16 first paragraph): listed on the pages, no code change.
