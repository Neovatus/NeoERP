# Brief: 4B-414-APP — account rules screen, rule-aware line cells, branch default cost centre (App, draft 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` "Phase 4b" 4.14 (backlog:320). **Repo / lane:** NeoERP-App, branch
`phase/4b-dim-rules-app` from `phase/4b`, worktree `NeoERP-worktrees/dim-rules-app`. Copy this file to
`docs/agents/dim-rules/brief-app.md` as the first commit.
**Slicing:** L37 option B. **Money display lane** (posting refusals shown on lines). **Builder:** Opus 5.5 high,
builder Mac. **Reviews:** fresh Opus (diff + brief only).
**Starts when:** 4B-414-BE OD-1…OD-4 are answered and its builder report has the API table (lead OK). Until then build
on mocks only (`MockDimensionsRepository`, `MockAccountsSetupRepository`).

## Goal
A Finance Manager sets Required / Optional / Not used per account and per range of accounts, sees what a change will
touch before saving it, and every editor shows which dimension a line still needs and why a cell is "—"; the cost-centre
page and the Org branch page show and change a branch's default cost centre.

## Evidence (read first)
- Spec `docs/design/specs/accounts-dimensions.md` (AC-DIM): §2 permissions, §4.1 overview counts, §4.2 / §4.2.1
  cost-centre panel (branch default and its deactivate warnings), **§4.6 account rules**, **§4.7 line cells** (Required and
  empty, "—" with reason, column-show rule, Columns menu), §5 states, §6 numbers, **§7 rules**, §8 wording, **§9 refusals
  in words**, **§10 app tests**, §11 rig routes (`#accounts:kyst|dimensions|rules`, `|lines`, `#accounts:lahore|dimensions`).
- Rig `docs/design/screen-rig/accounts-dims.jsx`; tokens `docs/design/design-system/neoerp-tokens.json` (authoritative);
  `building-blocks.md`, `list-controls.md`, `tabs.md`, `bottom-tab-bar-and-phone-sheet.md`.
- Code today: `features/accounts/presentation/dimensions/*` (`AccountsDimensionsTab`, `DimensionRules.kt`,
  `LineDimensionPickers.kt`, `DimensionWords.kt`, `DimensionsState.kt`), `DimensionsAccess.kt`, `data/remote/DimensionsApi.kt`,
  `dto/DimensionDtos.kt`, `ui/shell/routing/AccountsJournalDimensions.kt`; `allowedDimensions` readers
  (`JournalsMapper`, `RecurringMapper`, `AccountsSetupMapper`, `AccountsA0Dtos`, `AccountsA1Dtos`); Org
  `features/organization/presentation/organization/CompanyBranchDetail.kt`; strings `strings_accounts_dimension.xml` ×4.
- Backlog DIM-B follow-ups (backlog:321): BR-1 refusal shape `details.lines[].index/problem/dimension` already kept.

## Decided (do not reopen)
1. ADR-021 D6 / AC-DIM §7: account rule → range rule → chart; a statutory rule shows a lock and can't be loosened;
   rules apply to lines saved from now on, posted lines never change; drafts are checked at Submit (DM-7 rec, OD-2 BE).
2. Wording AC-DIM §8: "Required · Optional · Not used", "Range rule; from 6000–7999", "Not tagged by {dimension}",
   "Use default · {name}". Refusal words §9 (`DIMENSION_REQUIRED`, `RULE_RANGE_OVERLAP`, `RULE_LOCKED`, `REASON_REQUIRED`).
3. Every change asks for a reason (6–500) and shows the "what follows" lines from the impact read (§4.6).
4. Languages en/nb/sv/da on every new string (Jabran 2026-11-10); no hard-coded text (HardcodedUiText check).
5. Branch default lives on the Org branch (ADR-021 Q5); Accounts' cost-centre page edits it through Org's write.
6. Department column stays out until the HR read exists (backlog:320): the matrix shows no Department column.

## Open decisions for Jabran
None for the App beyond 4B-414-BE OD-1…OD-4. If OD-3 changes the permission code, `DimensionsAccess.kt` follows it.

## Scope
| ID | Item |
|---|---|
| AP-1 | Account rules page (§4.6): range rules card (list, Edit, Remove with reason), Add/Edit range rule dialog with impact preview and overlap refusal in the dialog. |
| AP-2 | Matrix: posting accounts grouped, sticky first column and header, cells in words with source marks A / R / none and legend, lock cell, cell menu (incl. "Use the range rule"), multi-select "Set rule for {n} accounts…"; read-only for READ. Phone: one card per account. |
| AP-3 | A0 account panel "Tags on lines" → "Dimensions on lines": a rule select per dimension and a link to Account rules; Add account the same. |
| AP-4 | Line cells in the journal grid, invoice/credit note, bill/debit note, receipt/payment adjustment editors: column shows when some line's account takes it (Required or Optional); Required and empty → danger border after Submit is tried and the footer reason "Line 4 needs a cost centre."; "—" with "Not tagged by …"; Columns menu can't hide a required column ("Required on line 3"); account change clears values with the 3-second hint. |
| AP-5 | Manual line defaults: header default, then branch default, frozen when the line is created (ADR-021 D4). |
| AP-6 | Cost-centre panel: "Default for branches" section, change through the reason gate, deactivate warnings (§4.2.1); Org branch detail shows the default cost centre (read, link). |
| AP-7 | Overview counts "Required on {n} · optional on {m}" and the rules summary line (§4.1). |
| AP-8 | DTOs and mappers: `dimensionRules` read; `allowedDimensions` kept only as fallback for one release (BE-5). |
| AP-9 | User guide page for account rules and branch defaults (en; nb/sv/da strings via I18N files). |

## API needed from 4B-414-BE
BE-4 rule and range endpoints, impact read; BE-5 `dimensionRules`; BE-7 branch field and write; BE-8 "default for
branches"; refusal codes and `details`. Record the final table in `docs/agents/dim-rules/backend-contract.md`.

## Neighbours (outside this scope)
BackEnd: 4B-414-BE. Department, group-only nodes, "Used on lines" counts, history: later (backlog:320). Spreading
(4.15), allocations (4.16) and budgets (4.17) screens: their own lanes. DIM-B L4 extras not listed here (date-validity
filter on pickers, phone "More dimensions" fold) stay in backlog:321 unless §4.7 needs them for AP-4: say which in the report.
PLAT app lane (RT-0, inbox) runs in parallel: no shared files.

## Tests
- AC-DIM §10 rule items: range rule add with impact preview, overlap refused, account rule wins over range, locked
  rule, matrix read-only for READ; grid shows only taken columns, "—" with reason, required-missing footer reason,
  Columns menu refuses hiding a required column, account change clears values; branch default change through the
  reason gate, cancel restores.
- State tests per screen (loading, empty, error, loaded, read-only, before go-live read-only notice).
- Six QA sizes (375×667, 667×375, 874×402, 744, 1032, 1376) via `ScreenSizes.QaSize` for the rules page, matrix
  (phone cards), dialog and a journal grid with rule cells; keyboard in view for the dialog's fields.
- NO and PK formats for counts and dates (`#accounts:kyst`, `#accounts:lahore`).
- **Old FAIL / new PASS:** a line missing a Required cost centre shows no reason before, the footer reason now.
- Targeted runs only (`:composeApp:jvmTest --tests …`); compile every target you touched. No whole-suite run.

## Rules
- One repo (App). Gradle only through `lockf -k /private/tmp/neoerp-gradle.lock`, log to a file, one watcher; never
  `gradlew --stop`; stop only your own daemons. Do not run the app against a stack while Jabran tests.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws`, keys.
- Design values only from tokens (`neoerp-tokens.json`); shared blocks before new ones; touch targets ≥ 44.
- Docs: user guide page (AP-9), developer note in `docs/` for the rule-aware cells; spec AC-DIM "As built" notes
  where the build differs. List each or "none: reason" in the lane-ready.
- Stop and ask: the spec and the API disagree; a change to shared design-system components beyond a new parameter.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, screenshot, file:line) | Status |
|---|---|---|
| AP-1 … AP-9 | | |
L36: every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files
in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).

## Reviews
Fresh Opus (whole diff, spec §4.6/§4.7/§9, wording, sizes) → `docs/agents/dim-rules/review-app-1-opus.md`. Only a FIX
reviewer re-checks. **Report:** `docs/agents/dim-rules/builder-report-app.md`.
**Lane-ready:** `.review-channel/lane-ready-4b-dim-rules-app.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Files: … changed (main …, test …, docs …) · Items: … scope rows (… done, … moved, … dropped)
```

## Done when
AP-1…AP-9 proven in the self-check; targeted tests 0 failed; review ACCEPT; docs listed; lane-ready with the
Timeline; the old Mac's App `verify.sh` green before merge to `phase/4b`; Jabran's click-through steps written
(sign-in, numbered clicks, Expected per step).
