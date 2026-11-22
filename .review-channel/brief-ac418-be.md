# Brief: AC418-BE — company default tax codes, opening-items duplicates, listing dates, next memo (BackEnd, 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` row 4.18 (backend part). **Repo / lane:** NeoERP-BackEnd, branch
`phase/4-b2-ac418-be` cut from BE `origin/phase/4` (`16d9a3fe` or later), worktree `NeoERP-worktrees/ac418-be`. Copy this
file to `docs/agents/ac418/brief-be.md` as the first commit. **Slicing:** L37 style C (mixed follow-ups), labelled at
assignment. **Money lane** (tax default). **Builder:** Opus 5.5 high, **old Mac**, Gradle only through
`scripts/gradle-job.sh be <worktree> …` slots. **Reviews:** fresh Opus + Fable (diff + brief only, L36/R2).
**Twin:** `brief-ac418-app.md`; its rows A1, A11, A12 start when §API below is fixed (builder report API table, lead OK).

## Goal
A Norwegian domestic bill with no supplier default gets the domestic input VAT code, not an import code, because every
company has a stored default purchases and sales tax code seeded from its country pack; the journal listing report takes
exact dates; the recurring list row carries the memo as it will read next time; a receivables opening item can't be
entered twice.

## Evidence (read first)
- `WS/docs/backlog.md` "Quick add (QA-1) follow-ups" last item (Jabran's B2 test 2026-11-08): the app picks the
  highest-rate INPUT/OUTPUT code, so in Norway a 25 % tie picks `NO-MVA-IMPORT-PAID-25`. Ties also exist in SE
  (`SE-MOMS-IN-25`, `-CAR50`, `-REP`), DK (`DK-MOMS-IN-25`, `-NODED`), PK sales (`PK-ST-18`, `PK-ST-3RD`).
- Line rules: `docs/api/accounts-b.md` §1432 (`taxCodeId` null → customer's default, else null) and C-12 (required at
  approve when the company has an active SALES code); `accounts-c.md` C-2, §582 (supplier `defaultTaxCodeId`);
  `BillRules.kt:144` (`l.taxCodeId ?: supplier.defaultTaxCodeId`); `accounts-d.md` N-A0-D1 (account default tax code,
  designed, not built: no column on `origin/phase/4`).
- Tax codes: `delivery/http/taxcode/TaxCodeController.kt`, `AccountsPermissions` `TAX_CODE_*`, packs
  `packs/2026.4/tax-codes.csv` (`std_tax_code`), the 2026.5 `tax-additions/` pattern (MANIFEST, `codes.csv`, `adoption.sql`),
  `docs/api/accounts-a0.md` (tax codes, A-11 changes after go-live), `docs/modules/accounts/tax-codes.md`.
- Journal listing: `ReportController.kt:112` (`fiscalYearId`, `fromPeriod`, `toPeriod` only) vs `generalLedger` (`from`,
  `to` dates beside periods), `ReportModels.JournalListingQuery`, `JournalListingExporter`, contract `accounts-a2.md` C-27 §6.11.
- Recurring list: `RecurringDtos.RecurringListItemDto` (no memo), `RecurringModels.RecurringListItem`; App spec
  `NeoERP-App/docs/design/specs/accounts-a4.md` §Recurring tab (Name: "muted second line the memo as it will read next
  time"); backlog "QA1 leftovers" ("recurring list row lacks the memo"); FIX-BE R08 placeholder format (D-19).

- Opening items (N10): contract `docs/api/accounts-opening-items-import.md` C-19 (suppliers: refused) and C-20
  (customers: warning `POSSIBLE_DUPLICATE` only); `subledger/openingimport/OpeningItemImportService.kt:275`
  (`FILE_ALREADY_IMPORTED` only a warning, skipped at confirm via `excludeConfirmed`); `WS/docs/process/escaped-defects.md`
  row 2026-11-22 (HIGH, money); B2b `lane-ready-fix-app-b2b.md` follow-up N10.

## Decided (do not reopen)
1. Jabran 2026-11-16 (backlog "Decisions 2026-11-16"): "Exact dates" only on General ledger and journal list; C2
   follow-up: "Reports journal listing: add exact-date support in the backend request, then the toggle".
2. Spec A4 Recurring tab: the list row's second line is the next memo. Month text per D-19 / FIX-BE R08 ("nov 2026").
3. Building-blocks §3 "Defaults are visible, and only departures are stored"; D-A0-3: packs carry source and evidence
   for every tax code. Target design, no workarounds for old code (Jabran 2026-11-15).
4. Migration: **accounts V78** (V76 is the highest on `origin/phase/4`; **V77 is reserved for AL-REST-BE**; V73/V75 stay
   gaps, D-20). One migration for the lane. If AL-REST-BE is merged first, rebase; the number stays V78.
5. **N10 (Jabran 2026-11-22, "go with industry standards & recommendations"):** the server **refuses** a second
   receivables opening-items entry with the same customer and original number, as payables refuses a bill row against a
   submitted or posted bill (C-19). OI C-20 changes from warning to refusal. **N11:** an import never creates a bank
   account (as B2b built it): no row.

## Decisions (Jabran 2026-11-22: "go with industry standards & recommendations": every recommendation below is decided; build them)
- **OD-1 Where the default lives.** Rec: a flag on the company's own tax code rows (`defaultFor` = `PURCHASES` / `SALES`,
  at most one per side per company, partial unique index), set through the existing tax-code update
  (`ACCOUNTS.TAX_CODE.UPDATE`, audited, A-11 reason rule after go-live). Deactivating a default is refused 409
  `TAX_CODE_IS_DEFAULT` until another is chosen. Why: no new settings table, the Tax codes page already lists and audits
  these rows, and the default is visible where the codes are.
- **OD-2 Default per country (pack).** Rec: the standard domestic rate code per side, as a pack column with its source:
  NO `NO-MVA-IN-25` / `NO-MVA-25` (SAF-T 1 / 3), SE `SE-MOMS-IN-25` / `SE-MOMS-25`, DK `DK-MOMS-IN-25` / `DK-MOMS-25`,
  FI `FI-ALV-IN-STD` / `FI-ALV-STD`, IS `IS-VSK-IN-24` / `IS-VSK-24`, PK `PK-ST-IN` / `PK-ST-18` (names checked in
  packs 2026.1–2026.4 on 2026-11-22; the builder re-checks against the latest pack and lists the table before seeding). Why: the domestic standard rate is the most common line; every tie
  above is a special case (import, car, representation, non-deductible, third schedule).
- **OD-3 Server fallback.** Rec: **no** server fallback; a line with `taxCodeId` null keeps today's chain (party default,
  else null, required at approve per C-12). The company default is a prefill the App shows on the line. Why: a hidden
  server choice of VAT code is the risk this item fixes; §3 says defaults are visible.

## Scope
| ID | QA/backlog | Item |
|---|---|---|
| BE-1 | backlog:327 | V78: the OD-1 column + index; seed existing companies from their country's OD-2 codes (only when that code exists and is active in the company; else none, listed in the report). Flyway fresh + on seeded data. |
| BE-2 | backlog:327 | Pack: OD-2 defaults as a new pack addition (2026.5 pattern) with source and evidence; books creation sets them for new companies. |
| BE-3 | backlog:327 | Tax codes read gains `defaultFor`; update sets/clears it (one per side, kind and side checked: purchases INPUT/ZERO/EXEMPT…, sales per C-12 kinds); 409 on deactivating a default; audit event fields. |
| BE-4 | backlog:327 | Contract: `accounts-a0.md` tax codes, `accounts-b.md` §1432 and `accounts-c.md` lines say the App prefill chain (party default → company default → none) and that the server chain is unchanged (OD-3). |
| BE-5 | backlog C2 / 4.18 "exact dates" | Journal listing `from`/`to` dates (same parsing and mutual rules as `generalLedger`), in the page, the cursor and the export; contract §6.11. |
| BE-6 | backlog QA1 leftovers, G44 | Recurring list item `nextMemo` (the memo rendered for `nextOccurrence`, D-19 format; null when ended). Contract `accounts-a4.md`. |
| BE-7 | N10, escaped-defects 2026-11-22 (HIGH) | Receivables opening items: same customer + original number (+ `item_type`, as C-20 keys it) against an existing confirmed/posted opening item or posted invoice → row problem (new code, e.g. `DUPLICATE_CUSTOMER_ITEM`, `details.existing {id, numberDisplay, status}`, mirroring C-19), checked at preview **and** again at confirm; a draft match stays `POSSIBLE_DUPLICATE`. `FILE_ALREADY_IMPORTED` is no longer skipped at the confirm re-check. Contract C-20 rewritten; refusal code in §error table. If a DB guard (unique partial index) is needed, it goes in V78 and says so. |

## API the App lane needs (fix it in the builder report before A1/A11/A12 start)
BE-3 `defaultFor` read/write shape and error codes; BE-5 query params; BE-6 field; BE-7 row problem code and details.

## Neighbours (outside this scope)
- AL-REST-BE (new Mac): approval limits, V77, `PaymentApprovalService`/`RefundApprovalService`; do not touch.
- FIX-APP-B2 part b follow-up `ACCRUED_EXPENSES` pack role: not here (N10 is BE-7 here; N11 needs no row). R29b (tenant classification), R34/R34i gate holes: their own lanes.
- Account-level default tax code (N-A0-D1, designed, not built) and supplier/customer defaults stay as they are.
- `discardedByName` on journal imports: done in FIX-BE R17 (dropped from 4.18). App screens: AC418-APP.

## Tests (money lane: a test per rule)
- Per country (NO, SE, DK, FI, IS, PK): a new company's books get the OD-2 purchases and sales defaults; the V78 seed on
  an existing company of each country; a company where the code is inactive gets none. **Old FAIL / new PASS:** the
  tax-codes read of a Norwegian company has no default (old), `NO-MVA-IN-25` (new); same for each tie above.
- One per side per company (second set clears or 409 as OD-1 says); wrong kind/side 422; deactivate default 409;
  two-company isolation (B's code can't be A's default, B's defaults never in A's answer); audit row.
- OD-3: a bill line with null tax code and no supplier default posts exactly as before (regression test).
- BE-7 (money): **old FAIL / new PASS** — a second receivables file with the same customer + original number is
  confirmed today (old) and refused at preview and at confirm (new); a hand-entered/posted invoice match refused; a
  draft match only warns; same file re-confirmed after the first confirm refused (`FILE_ALREADY_IMPORTED` at confirm);
  payables C-19 unchanged; two-company isolation (company B's item never blocks A); race: two confirms at once → one
  posts, no doubled receivable; `money-invariants.sh` green.
- BE-5: dates filter, periods + dates refused as GL does, export equals page, cursor keeps dates. BE-6: memo per country
  format, ended template null. `scripts/money-invariants.sh` green.
- Targeted runs only (`:services:accounts-service:test --tests …`). No whole suite, no `verify.sh` (the lead runs it).

## Rules
- One repo. Gradle only via `scripts/gradle-job.sh be …`, Java 21, log to a file, one watcher; never `gradlew --stop`
  outside your slot. Do not start the backend.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws`, keys.
- Migrations freeze once applied: never edit an applied file; a fix is a new migration (ask first).
- Docs: `docs/modules/accounts/tax-codes.md`, `reports.md`, `recurring-journals.md`, the opening-items import page, `docs/database/db-design.md` V78,
  contract pages above; user guide: none in this repo (App lane). List each or "none: reason" in the lane-ready.
- Stop and ask: an OD answer is missing; a change touches `PostingEngine.kt`/`Posting.kt`, an applied migration, or a
  response shape outside §API.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, file:line) | Old FAIL / new PASS | Status |
|---|---|---|---|
| BE-1 … BE-7 | | | |
L36: every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files
in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).

## Reviews
Fresh Opus (whole diff) → `docs/agents/ac418/review-be-1-opus.md`; Fable (tax default seeding, OD-1 uniqueness, OD-3
unchanged posting, BE-7 duplicate refusal and confirm race, isolation) → `review-be-2-fable.md`. Only a FIX reviewer re-checks.
**Report:** `docs/agents/ac418/builder-report.md`. **Lane-ready:** `.review-channel/lane-ready-ac418-be.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Changed files: … · Items: 7
```

## Done when
OD-1…OD-3 answered; BE-1…BE-7 proven in the self-check; targeted tests 0 failed; both reviews ACCEPT; API table OK'd for
the App lane; docs listed; lane-ready with the Timeline; the old Mac's `verify.sh` green before merge to `phase/4`.

## Migration number (lead note)
V78 is provisional: AL-REST-BE (new Mac) holds V77. Whichever of the two lanes merges second renumbers its migration to the next free number before its gate (allowed only while it is unapplied outside the lane's own test containers). Never apply the lane's migration to the shared local stack database before merge.
