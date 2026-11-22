# Brief: AC418-APP — report and QA1 follow-ups, company default tax code on lines (App, 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` row 4.18 (app part). **Repo / lane:** NeoERP-App, branch
`phase/4-b2-ac418-app` cut from App `origin/phase/4` **after FIX-APP-B2 part b merges** (it changes the same GL, reports
and imports files; lane-ready `56b6ba03`), worktree `NeoERP-worktrees/ac418-app`. Copy this file to
`docs/agents/ac418/brief-app.md` as the first commit. **Slicing:** L37 style C (mixed follow-ups), labelled at assignment.
**Builder:** Opus 5.5 high, **old Mac**, Gradle only via `scripts/gradle-job.sh app <worktree> …` slots.
**Reviews:** fresh Opus; + Sonnet because A12 touches money display (tax code on lines). **Twin:** `brief-ac418-be.md`:
A1, A11, A12, A13 wait for its §API table (lead OK); all other rows start at once.

## Goal
The report and QA round 1 leftovers named in 4.18 are closed on every QA size, and new bill/invoice lines take the
company's default tax code instead of the highest-rate rule.

## Evidence (read first)
- `WS/docs/backlog.md` "Report filters follow-ups (C2, 2026-11-16)", "C2 follow-ups (2026-11-18)", "QA round 1
  follow-ups (2026-11-19)" (QA1 leftovers line), "Quick add (QA-1) follow-ups" (default tax code), "Decisions 2026-11-16".
- QA: `WS/docs/agents/qa-round1-retest/` `G15.md`, `G19.md`, `G25.md`, `G44.md`, `SIZES*.md`, `fix-list.md` §3 (G35);
  `WS/docs/agents/qa-round1/findings-grouped.md` G15, G30, G44.
- `docs/agents/c2/review.md:20` (GL and reports journal-listing cards overlap/truncate dates; statement tables clip).
- What merged already: `docs/agents/fix-app-a|fix-app-b1|fix-app-b2/builder-report.md`; B2b
  `docs/agents/fix-app-b2b/builder-report.md` and `WS/.review-channel/lane-ready-fix-app-b2b.md`.
- Specs: `docs/design/specs/accounts-a2-a3.md` §4.3 (GL range chip "Jan–Apr 2026 · from the trial balance", line ~234),
  period 13 rows (~400–422); `accounts-a4.md` Recurring tab (row memo, ~155); `accounts-ob-import.md`, `stepper.md`;
  `accounts-b-c.md` line Tax cell (~318); `building-blocks.md` §3; `docs/design/ux-principles.md` §21–25;
  `docs/design/screen-standard.md` §9; tokens `docs/design/design-system/neoerp-tokens.json` (authoritative).
- Code: `JournalsListToolbar.kt` (exact dates already on the operational list), `ReportsApi.kt`/`ReportsMapper.kt`
  (journal listing), `NeoReturnToFront` (B2a R16), `AccountsWording.kt:712` (TWO_PERSON roles), `PayablesSupport.kt:96`,
  `ReceivablesSupport.kt:37-45` (`standardTaxCode` rate rule).

## Decided (do not reopen)
1. "Exact dates" only on General ledger and journal list; one filter pattern on every report (Jabran 2026-11-16).
2. Phones: the period block collapses to one summary line "Period: All periods ▾" opening the filter panel (C2 2026-11-18).
3. GL after a TB drill shows the "· from the trial balance" chip (spec A2-A3 §4.3). Period 12 and 13 share dates: the
   operational journals filter help says period 12 includes year-end adjustments (C2 2026-11-18).
4. Recurring row second line = next memo (spec A4). One format via NeoFormat (backlog 2026-11-19, D-19).
5. Defaults are visible on the line (building-blocks §3); the tax default shape follows BE OD-1…OD-3 as Jabran answers.
6. N10 (Jabran 2026-11-22): the server refuses a duplicate receivables opening item (BE-7); N11: an import never
   creates a bank account (B2b, no row).

## Decisions (Jabran 2026-11-22: "go with industry standards & recommendations": every recommendation below is decided; build them)
- **OD-A1 Tax codes page control** (only if BE OD-1 is approved as recommended). Rec: a "Default for purchases" /
  "Default for sales" tag on the row and a "Make default" action in the row menu for `TAX_CODE.UPDATE` holders; the
  builder adds it to the tax codes spec section of `accounts-a0.md` first (lead OK). Why: the codes are managed there.

## Scope
| ID | QA/backlog | Item |
|---|---|---|
| A1 | C2 2026-11-16 | Reports ▸ Journal listing: "Exact dates" toggle (as the GL), sends BE-5 `from`/`to`; saved filter keeps it; export uses it. |
| A2 | C2 2026-11-18, G35 | Phone period summary line on every report and the Journals list; opens the filter panel. |
| A3 | C2 2026-11-18 | GL opened by a TB drill shows the "from the trial balance" range chip again (and keeps it after a reload). |
| A4 | C2 2026-11-18 | Operational journals filter help: period 12 includes year-end adjustments (period 13 shares its date); en/nb/sv/da. |
| A5 | C2 review:20 | Older layouts: GL and journal-listing cards (overlap, cut dates), statement tables (end clipping). |
| A6 | G15 rest | Refresh on return beyond Journals: refund and write-off detail, receipts/payables/receivables lists and sidebar badges, the project pick list (fresh on editor open, T24), Drafts chip after Open in Drafts (A10). Reuse `NeoOnReturnToFront`. |
| A7 | G19 rest | OB import: the handed-off file kept on Back; stepper steps tappable (stepper spec); Imported files shows the real step. |
| A8 | G25 | Company switch on a report: reproduce with a test; if B2b R04 already fixes it, the test is the proof; else key report state by company. |
| A9 | G30 | Measure the reads behind journal editor/detail, TB, recurring detail and Accounts overview (count, serial vs parallel); load independent reads in parallel; never a blank card (skeleton). Timings table in the report. |
| A10 | G44 (backlog) | 403 `TWO_PERSON_RULE` `details.roles` read on every path (journals, opening import, payables, refunds): the specific reason shows. Already partly in `AccountsWording.kt:712`: prove each path, build the missing ones. |
| A11 | QA1 leftovers | Recurring list row: second line `nextMemo` (BE-6), phone card too. |
| A13 | N10 (BE-7) | OB import (customers): the BE-7 row problem shows as a row error like the supplier one (`accounts_opening_import_error_row_duplicate_supplier_invoice[_as]`), "Row n: this customer's invoice number is already entered (as X)." in en/nb/sv/da; the `POSSIBLE_DUPLICATE` warning text stays for draft matches only; the confirm refusal at `FILE_ALREADY_IMPORTED` shows its message. Waits for §API. |
| A12 | backlog:327 | Bill, debit note, invoice, credit note lines prefill: party default → company default (BE-3) → none; remove `standardTaxCode`'s rate rule; OD-A1 on the Tax codes page. |

## Neighbours (outside this scope; never duplicate)
- **B2b (FIX-APP-B2 part b, lane-ready):** D-16, R09, R04, R07, D-19, control reason, R11, R17, R20 (GL cost centre /
  project), R24, R25, R26 (G19 account 1925, G41), R27, R33, B2a N2. Its follow-ups R33b, N8 (GL at 744), Sonnet N1/N3,
  Opus N1: not here unless A5 touches the same card (then say so).
- B2a already did R16/R23 for Journals (G15 part), R25 G44 "· n" count, R18, R19, R21, R31. App A/B1: keyboard, sizes.
- Unassigned: fix-list §3 layout and wording (App C) except G35 (A2 here); G08 stored-row indicator; 200 % text
  journals grid; ⌘K shortcut; G09 Books start. AL-REST-APP (approval limits screens). AC418-BE (twin).

## Tests
- A test per row; **old FAIL / new PASS** on the branch base for each behaviour change (say how in the report).
- Layout rows (A2, A5, A7, A11, A12 lines): size tests at the six QA sizes (375×667, 667×375, 874×402, 744, 1032, 1376)
  + the 320–1440 sweep with LayoutChecks on, view models on `Dispatchers.Unconfined`, loaded state asserted.
- A12 per country (NO, SE, DK, FI, IS, PK): a bill with no supplier default gets the company purchases default (NO:
  `NO-MVA-IN-25`, never `NO-MVA-IMPORT-PAID-25`); invoice same for sales; party default still wins; no company default →
  empty cell (required message at approve as today).
- A6/A8: two-user and company-switch view-model tests. A9: a mock with delays proves parallel loads.
- Simulator-only proof: numbered steps with Expected per step for the old Mac (users from the QA reports, no passwords).
- Targeted JVM tests only, never the whole `:composeApp:jvmTest`.

## Rules
- One repo; read the BackEnd only through `git show`. Do not start the backend.
- Plain commits per row, **no AI attribution, no Co-Authored-By**. No push, merge or rebase.
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws`, keys.
- New strings en/nb/sv/da through the i18n checks; money and dates only via NeoFormat / NeoNumericInput; tokens only;
  no Koin outside `app/di`; in commonMain no `String.format`, `putIfAbsent`, `assert(`.
- Docs: user guide `docs/user-guide/accounts/reports.md`, `journals.md`, `recurring-journals.md`, `tax-codes.md`,
  `opening-balance-import.md`; developer `docs/modules/accounts/reports.md`, `journal-screens.md`, `recurring-journals.md`,
  `tax-codes.md`; specs touched. List each or "none: reason". Migrations: none in this repo.
- Stop and ask: a row needs a rule the spec and this brief don't settle; a BE field is missing from §API.

## L36 and builder self-check (in the report, one row per scope row)
Compile **all targets** before hand-back: JVM tests, `:composeApp:compileKotlinIosSimulatorArm64`
(`-Dorg.gradle.jvmargs=-Xmx4096M`) and the Android compile (`:composeApp:compileDebugKotlinAndroid`), 0 errors.
Every finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files in gate format
from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).
| ID | Proof (test class.method, file:line, sizes) | Old FAIL / new PASS | Status |
|---|---|---|---|
| A1 … A13 | | | |

## Reviews
Fresh Opus (whole diff) → `docs/agents/ac418/review-app-1-opus.md`; Sonnet (A12 tax prefill, money display, locale) →
`review-app-2-sonnet.md`. Only a FIX reviewer re-checks.
**Report:** `docs/agents/ac418/builder-report.md`. **Lane-ready:** `.review-channel/lane-ready-ac418-app.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Changed files: … · Items: 13
```

## Done when
A1…A13 proven in the self-check (A12 after BE OD answers, A1/A11/A13 after §API); JVM, iOS and Android compile 0 errors; targeted tests
0 failed; both reviews ACCEPT; simulator steps listed; docs listed; lane-ready with the Timeline; the old Mac's
`verify.sh` green before merge to `phase/4`.
