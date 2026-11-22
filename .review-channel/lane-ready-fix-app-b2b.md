# Lane ready: FIX-APP-B2 part b (reports, accruals, opening balances, imports, FIX-BE App items) — 2026-11-22

**Repo / branch:** `NeoERP-App`, `phase/4-b2-fix-app-b2b-r` (pushed, head `430bc5ab`; was `56b6ba03` before the gate fix). It sits on App `phase/4` `8d7e8a96`
(GATE-2 merged): rebased from part a, and all 29 commits are `=` in the range-diff. Built and reviewed on the
**builder Mac**: JVM targeted tests and the iOS compile only.
**Brief:** `docs/agents/fix-app-b2b/brief.md`. Approved by Jabran 2026-11-21 and 2026-11-22 (D-15, D-16, D-19); assigned
by the old Mac (inbox "App B2", lead cut into part a and part b). **Builder:** Opus 5.5 high. Report:
`docs/agents/fix-app-b2b/builder-report.md` (rows, review round 1 table, follow-up rows, simulator steps).
**Reviews (this Mac):** Opus fresh + Sonnet (money display, posting-related screens, locale); both said FIX in round 1
and accept after one fix round. Fable checked the lead decisions (D-33: no REJECT). Decisions: D-33 (with Fable's
conditions), D-35. The range touches the Accounts data layer and API models: **RISK**.

## Gate fix round (old-Mac verdict FIX, workspace `6124907`)
- The full gate on `56b6ba03` failed `A4ScreenSizeTest.importCreated` (66 overlaps of the created-journal links).
- Fix `a5e2d19f`: each created journal is its own full-width row, at least the touch floor tall (`neoTouchFloor()`),
  with the link centred in it. The row itself is not clickable, so there is no second tap target. Test tags and the R17
  target are unchanged; no strings changed. Report: `builder-report.md`, section "Gate fix round".
- Builder (Sonnet 5.5): **every size test of the screens the lane touched, run in full**. A4ScreenSizeTest 18/0,
  Batch2ScreenSizeTest 8/0, ReportFilterScreenSizeTest 9/0, KeyboardInViewTest 10/0, GeneralLedgerDimensionSizeTest
  1/0, DeleteDraftMenuSizeTest 2/0, BillInvoiceAllocationSizeTest 1/0, Qa1LayoutSizeTest 3/0. JournalImport* 18/0. The
  iOS and Android compiles: 0 errors.
- Opus fix check re-ran A4ScreenSizeTest 18/0 and JournalImport* 18/0. Two LOWs went to follow-up rows (below).

## Review files (gate format; the gate reads these two)
- `docs/agents/fix-app-b2b/review-5-opus.md` (Opus 5.5) and `review-6-sonnet.md` (Sonnet 5.5): Verdict ACCEPT,
  Reviewed `c3837e72`, Range `8d7e8a96..c3837e72`. The one commit after it holds only these two files.
  `risk-check.sh --reviews` on this Mac: **REVIEWS OK**.
- Earlier: `review-3-opus.md` / `review-4-sonnet.md` (ACCEPT up to `262744f8`).
- History: `review-1-opus.md` (FIX: 1 HIGH for the BackEnd, 2 MEDIUM, 6 LOW; 806/0; old FAIL proven for R04, N2, R09,
  R07) and `review-2-sonnet.md` (FIX: 3 MEDIUM, 5 LOW).

## Rows
| Row | Done |
|---|---|
| D-16 | Trial balance reads `OTHER_BRANCHES` + `NO_BRANCH` ("Company-level lines (no branch)"); `OUTSIDE_FILTER` gone; one row under a cost-centre filter; the two rows add up to the old one |
| R09 (App) | SIE wording "Lines on accounts that take a branch get this branch" |
| R04 | A report 404 drops the saved filter and fiscal year and reloads once; a 404 on one GL account drops only that account's filter |
| R07 | Accrued expenses suggest the pack's 2990 in SE (BAS 2960 is accrued interest) and 2960 elsewhere, picked by `templateRef`; nothing suggested if the account is missing or off |
| D-19 | Month and month-year mirror test against the BackEnd `{month}`/`{period}` rule |
| Control reason | 400 `too_long`/`invalid` and 422 `CONTROL_REASON_REQUIRED {min, max}` as field messages; every field message shows |
| R11 | "Held out" stops offering "Enter as opening items" after creation for the app's run; a second hand-off still shows the duplicate warning (test); a simulator step after a restart |
| R17 | "Imported from" links; created rows link to journals; "Open in Drafts" starts clean; history "By" shows who discarded and when (local date) |
| R20 | General ledger Cost centre and Project: table columns that drop on a narrow table, labelled lines on the phone card |
| R24 | Off page crumbs; the closed-form toast fits, plural "were" |
| R25 | G18 the name is taken; G42 "imported before" with date, person and a link (local date) |
| R26 | G41 cancel says nothing was saved (test); G19 explains why 1925 can't be created and what to do (4 languages) |
| R27 | The Accounts rail flyout closes after a pick |
| R33 | The short frames (375×667, 667×375, 874×402) are in the report screenshots; the other ~45 classes are row R33b |
| B2a N2 | On `VERSION_CONFLICT` a delete re-reads the draft and keeps Delete draft, in all five editors (one test each) |

## Tests on this Mac
- Builder: round 0 346/0 and 281/0; round 1, the changed classes 1,349/0; iOS compile 0 errors. Old FAIL on
  `903a9630` (temp checkout): 11 of 59 tests fail as expected (dates, R07, N2 ×4, field messages, GL 404, toast, byAt).
- Opus re-runs: round 1, 806/0 on `a511cb24` (old FAIL proven for R04, N2, R09, R07); fix check, 93/0 on `262744f8`,
  iOS up to date.
- Not run here: the whole `:composeApp:jvmTest`, `verify.sh`, the simulator.

## For the old Mac (test Mac)
1. Check the two review files.
2. `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/fix-app-b2b/review-5-opus.md docs/agents/fix-app-b2b/review-6-sonnet.md`
   (no `lockf` wrapper).
3. Simulator steps in the builder report, "Simulator checks for the old Mac": numbered, with Expected per step. It
   includes the R11 restart step and the GL table vs cards at iPad Pro 13 portrait.
4. Verdict; merge under the standing merge. **Open questions for Jabran do not block this lane:** N10 (refuse or warn
   on duplicate receivables opening items) is a BackEnd rule; N11 (may an import create a bank account) is product scope;
   N8 ("As built" notes, GL at 744) is design follow-up.

## Docs pages
- **User guide:** `docs/user-guide/accounts/accruals-and-prepayments.md`, `journal-import.md`,
  `opening-balance-import.md`, `reports.md`, `sie-import.md`.
- **Developer:** `docs/modules/accounts/accruals-and-prepayments.md`, `journal-import.md`, `journal-screens.md`,
  `opening-balance-import.md`, `recurring-journals.md`, `reports.md`.
- **Design:**
  - `docs/design/specs/accounts-a2-a3.md`, `accounts-a4.md`, `accounts-h-se.md`;
  - `docs/design/screen-standard.md`;
  - `docs/design/screen-rig/accounts-a2.jsx`, `app.html`, `README.md` (the trial balance rows; the rig artifact is not
    republished).

## Follow-up rows
- **App:**
  - R33b: short frames in the other ~45 screenshot classes.
  - The GL as a table at 744 needs narrower number and money columns (design, N8).
  - The G19 text points to creating the bank account first, but the App has no such flow from the import (Sonnet N2;
    reword or link when one exists).
  - A transient GL reload failure also drops saved filters: limit that to 404 (Sonnet N1).
  - An older server's GL line shows no cost centre once the column drops (Sonnet N3).
  - Changing GL filters during the stale-filter reload can jump the route back to the defaults (Opus N1).
  - Gate fix LOWs: restore a small gap between created-journal rows on desktop, where the touch floor is 0 and the
    links now touch (`JournalImportWizardScreen.kt:487`); the report's cited `RolesIndexUi` row is clickable,
    unlike this one (wording only).
- **BackEnd:**
  - Refuse or warn on a second receivables opening-items entry, plus a durable link between the two imports and
    `FILE_ALREADY_IMPORTED` acknowledged at confirm (N10, go-live gate; Opus H1, logged in
    `docs/process/escaped-defects.md`).
  - An `ACCRUED_EXPENSES`/prepaid pack role before any new country pack.
  - A per-row reason for `creatable=false`.

## Timeline (new Mac; Europe/Oslo; agent time from task notifications; L37 style: A, one lane cut in two parts)
- **Assigned:** inbox TASK "App B2", 2026-11-22; part b brief and start after the usage window reset.
- **Build:** builder first pass about 2 h 35 m (15 rows; it also ran its targeted tests).
- **Rework:** fix round 1, about 28 m (13 commits, including the old-FAIL proof).
- **Review:** Opus round 1 10.3 m, plus its fix check 3.4 m; Sonnet round 1 5.2 m, plus its fix check 1.3 m; Fable
  decision check 3.3 m.
- **Test:** inside the builder and Opus runs above (targeted only; one rebase without conflicts).
- **Waiting:** started about 40 m after part a's lane-ready (usage window); about 10 m for the second reviewer.
- **Size:** 118 files changed (+2,780 / −173) over the base; 15 items; 1 fix round (both reviewers said FIX in round 1
  and accept after it); 0 fix-caused MEDIUMs; 4 new LOWs passed to follow-up rows.
- **Tokens:** builder 749 k; Opus 356 k; Sonnet 296 k; Fable (D-33) 133 k.
- **Gate fix round (after the old-Mac FIX at 09:35):**
  - Rework: Sonnet builder 14.5 m (85 k), including the full size-test runs.
  - Review: Opus fix check 4.2 m (92 k), Sonnet re-stamp 0.3 m (64 k).
  - Escaped into the gate: one size test outside the targeted set.
  - Files: 120 changed (+2,873 / −173). Fix rounds: 2 (1 review, 1 gate).
