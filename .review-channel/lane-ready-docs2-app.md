# Lane ready: DOCS-2a user guide + app developer pages — 2026-11-21

**Repo / branch:** `NeoERP-App`, `phase/4-b2-docs2-app` (pushed). Merge target: `phase/4`.
**Range:** `bff8d14c..f19a101b` (brief 9417a071; 6 page commits 205ffb93..a121cff1; review fixes d7a2cd4c; round-2 review file + one lead wording fix f19a101b).
**Brief:** `docs/agents/docs2/brief.md` on the branch. Approved: Jabran 2026-11-21 (DOCS-2, docs lanes in parallel).
**Builder:** Sonnet 5.5. **Reviewer:** Opus 5.5, fresh, read-only. Docs only, one reviewer.

## Reviews (`docs/agents/docs2/` on the branch)
- `review-1-opus.md`: Reviewed a121cff1, FIX: 3 MAJOR (user guide described an unbuilt Automatic reversals tab; Owner self-approval of refunds without its condition; "Reverse now" advised where the app does not offer it), 9 MINOR (entry point, a non-existent notice, who may discard an import check, demo example facts, four quotes, a threshold, an example, cross-repo links that break on GitHub, a button name). ~22 claims verified correct.
- `review-2-opus.md`: Reviewed d7a2cd4c, fixes only: ACCEPT, all 12 fixed and re-checked against code, contract strings and demo data. One cosmetic leftover (country-packs.md:17) fixed by the lead in f19a101b (one noun restored).

## Tests
Docs only, no code: no tests.

## Rendering
Every changed Markdown page rendered through GitHub's renderer (`gh api markdown`, gfm, repo context) and checked by script: one H1, no skipped heading levels, equal table columns, no raw HTML except the `<!-- shot -->` placeholders, links and anchors resolve. 26 of 26 pages clean at d7a2cd4c. Visual look in the browser pane: not done (pane hidden). Screenshots are placeholders by design (10 after the review removed one), each with an entry in `docs/user-guide/tools/phase4-shots.json`, for DOCS-2c.

## Write-scope check (`git diff --name-only bff8d14c..f19a101b`)
`docs/user-guide/accounts/**`, `docs/user-guide/{glossary,decisions}.md`, `docs/user-guide/tools/phase4-shots.json`, `docs/modules/accounts/**`, `docs/agents/docs2/**` — all in scope. No code. No AI attribution (checked).

## Docs pages
- **User guide (new):** `accounts/recurring-journals.md`, `accruals-and-prepayments.md`, `journal-import.md`, `automatic-reversals.md`, `refunds-and-write-offs.md`. **Updated:** `accounts/README.md`, `customer-advances.md`, `customer-advance-deductions.md`, `supplier-advances.md`, `glossary.md` (11 terms), `decisions.md` (Accounts section, 8 rows).
- **App developer pages (new):** `recurring-journals.md`, `accruals-and-prepayments.md`, `journal-import.md`, `automatic-reversals.md`, `refunds-and-write-offs.md`. **Updated:** `README.md`, `journals-and-posting.md`, `period-close.md`, `year-end.md`, and cross-repo links → plain paths in `calendar-and-tax-codes.md`, `chart-and-used-for.md`, `country-packs.md`, `reports.md`, `setup-and-go-live.md`, `sie-export.md`.

## For Jabran
- **App gaps the docs now state as "not built yet"** (in the A4 spec, not on any fix list): the Automatic reversals tab on Journals, and the Journals-page notice for recurring journals that need attention. Decide whether they join the QA-B2 app lanes or the backlog.
- Spec-vs-code differences described as the code behaves: feature switch names, Resume dialog text, discard with reason (G01), accrual default accounts only for expense kinds, CSV comma or semicolon, refund approval steps without app UI (S5).
- DOCS-2c needs demo data for three states: a skipped-month recurring run, an import check discarded by someone else, a refund with no bank details.
