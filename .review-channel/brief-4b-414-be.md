# Brief: 4B-414-BE — dimension rules per account, range rules, branch default cost centre (BackEnd, draft 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` "Phase 4b" 4.14 (backlog:320). **Repo / lane:** NeoERP-BackEnd, branch
`phase/4b-dim-rules-be` from `phase/4b` (cut from `main` after the Phase 4 PR), worktree `NeoERP-worktrees/dim-rules-be`.
Copy this file to `docs/agents/dim-rules/brief-be.md` as the first commit, with a reference copy of the App spec
`accounts-dimensions.md` (AC-DIM) as `docs/agents/dim-rules/ref-ac-dim.md` (lead supplies it; builders see one repo).
**Slicing:** L37 option B (one feature lane: accounts-service + the org-service field + user-service codes).
**Money lane** (posting refusals). **Builder:** Opus 5.5 high, builder Mac. **Reviews:** fresh Opus + Fable.
**Starts when:** OD-1…OD-4 answered. **Twin:** `brief-4b-414-app.md` starts when §API is fixed (lead OK).

## Goal
A company says per account, or for a run of accounts, whether each dimension is Required, Optional or Not used; every
journal, document and machine line is checked against that at Submit and Post; each branch can carry a default cost
centre that new manual lines take.

## Evidence (read first)
- ADR-021 (`docs/adr/ADR-021-shared-dimensions.md`, accepted 2026-11-03 with every recommendation): **D4** defaults,
  **D5**, **D6** per-account rules, Q5, Q6, Q7, tests §"Rules" and "Defaults".
- AC-DIM ref copy: §1, §2, **§4.6** account rules, §4.7 line cells, **§7** rules, **§9** refusal codes, **§12 DM-1, DM-6,
  DM-7, DM-8**. SB2d plan (workspace, lead supplies the lines): §14 Q4 "D6 next slice after SB2d".
- Code today: `accounts.allowed_dimensions TEXT[]` (`domain/chart/ChartTypes.kt:82`, `ChartJdbcAdapters.kt:66,164`);
  step 6 in `application/service/posting/PostingValidator.kt:647-682`; `dimension/DraftDimensionCheck.kt:77-112`;
  `recurring/RecurringTemplateCheck.kt:206-249`; `journalimport/JournalImportValidator.kt:380`; `YearEndJdbcAdapter.kt:100`;
  pack writers (`Pack2026Writer`, `Pack2026_3Writer`, `PackWriter`); `delivery/http/accounts/dto/AccountDtos.kt`
  (`allowedDimensions`), `ChartController.kt:101`; `dimension/DimensionMaintenanceService.kt`; user-service
  `V44__accounts_dimensions_codes.sql` (`ACCOUNTS.DIMENSIONS.READ/.MANAGE`, `COST_CENTER.*`).
- Branch rule C-13 (required on tagged accounts with more than one active branch): `docs/api/accounts-a1.md`.

## Decided (do not reopen)
1. D6 as written: rule per dimension `REQUIRED | OPTIONAL | NOT_ALLOWED`; a dimension listed today reads OPTIONAL, one
   not listed reads NOT_ALLOWED (nothing posted changes meaning); account rule wins over range rule, range over chart;
   branch keeps C-13; 422 `DIMENSION_REQUIRED` / `DIMENSION_NOT_ALLOWED`; rule changes apply forward only, posted lines
   are never re-validated; reversals and the year-end journal keep their exceptions (A1 R-10, A3 A1-A1; D5.2).
2. Q7: a pack rule marked `locked` (statutory) can't be loosened (`RULE_LOCKED`); other pack rules a company may
   tighten and loosen what it tightened.
3. Q5 / DM-1 shape: default cost centre on the **Org branch**, nullable Accounts id, validated by the Accounts machine read.
4. D4: producing modules send explicit values; Accounts never defaults a machine line. Manual lines: line → header
   default → branch default → null, resolved once when the line is created, then frozen.
5. Producing modules read the rules through the role-accounts read (D6 last bullet) to stop at calculate.
6. Two-company: a rule or value of another company never applies (D5.4, RULES §7, §8: a franchise is its own company).
7. Single writer: `PostingEngine.kt` / `Posting.kt` untouched; this lane owns `PostingValidator.kt` step 6 in 4b.

## Open decisions for Jabran (each with a recommendation; AC-DIM §12 asks for them before backend work)
- **OD-1 Storage (DM-6).** **Rec:** `account_dimension_rules (account_id, dimension, rule, source PACK|COMPANY, locked)`
  + `dimension_range_rules (dimension, from_number, to_number, rule, reason, by, at)`, compared on the account number
  as a number; an account added later inside a range takes it; overlap for one dimension refused `RULE_RANGE_OVERLAP`;
  `allowedDimensions` stays one release as a derived read; chart CSV `cost_centre:required` (bare name = Optional).
- **OD-2 When drafts meet a new rule (DM-7).** **Rec:** checked at Submit and Post, never re-saved; impact read
  `GET /api/accounts/dimension-rules/impact?dimension=&from=&to=&rule=` gives the gate's counts. A recurring template
  whose line now lacks a Required value: the run is `CREATED_AS_DRAFT` with the problem (`recurring-journals.md` "Run outcomes"), not `FAILED`.
- **OD-3 Permission (DM-8, backlog:318).** **Rec:** new `ACCOUNTS.DIMENSION_RULE.UPDATE` (Owner, Finance Manager);
  reads under the built `ACCOUNTS.DIMENSIONS.READ`; the `DIMENSIONS.MANAGE` split stays later (lead recommendation).
- **OD-4 Which pack rules are locked (Q7: "Accounts lead to list").** **Rec:** ship the `locked` column and mechanism,
  mark **no** pack rule locked until the per-country AI double review (ERP-Q1, decision 13) lists them with sources.

## Scope
| ID | Item |
|---|---|
| BE-1 | Accounts migration (next free): OD-1 tables, backfill from `allowed_dimensions` (listed → OPTIONAL, COMPANY or PACK source as today), REVOKE pattern as the other Accounts tables. Flyway fresh + on seeded data. |
| BE-2 | Domain `DimensionRules`: resolve (account → range → chart), branch C-13, locked; one pure function every checker calls. |
| BE-3 | Checks: `PostingValidator` step 6, `DraftDimensionCheck` (Submit), `RecurringTemplateCheck`, `JournalImportValidator`, AR/AP lines, receipt/payment adjustments; `DIMENSION_REQUIRED` with `details.lines[].index/problem/dimension` (the BR-1 shape). |
| BE-4 | API: `GET/PUT /api/accounts/accounts/{id}/dimension-rules`, `GET/POST/PUT/DELETE /api/accounts/dimension-range-rules` (reason 6–500 on change and remove), impact read (OD-2), bulk set for n accounts; `RULE_RANGE_OVERLAP`, `RULE_LOCKED`, `REASON_REQUIRED`. |
| BE-5 | Account and chart reads gain `dimensionRules[{dimension, rule, source: ACCOUNT, RANGE or CHART, locked}]`; `allowedDimensions` derived; chart CSV `:required`; role-accounts read carries the rules. |
| BE-6 | Packs write rules with source PACK and `locked` (none set, OD-4). |
| BE-7 | Org-service: branch `default_cost_centre_id` (migration next free), validated by the Accounts machine read, scoped write for `ACCOUNTS.COST_CENTER.UPDATE` holders; carried in the branch read and its `changed` event. |
| BE-8 | Accounts: manual journal line defaults gain the branch step (name the lines); cost-centre read lists "default for branches"; deactivating such a cost centre returns that list for the warning. |
| BE-9 | user-service migration (next free): OD-3 code with the V-pattern defaults. |
| BE-10 | Audit: `accounts-dimension-rule` CREATE/UPDATE/DELETE (reason, before/after), `org-branch` UPDATE of the default. |

## API the App lane needs (fix it in the builder report before 4B-414-APP starts)
BE-4 paths, bodies, impact answer; BE-5 fields; BE-7 branch field and write; BE-8 "default for branches"; refusal codes.

## Neighbours (outside this scope)
App screens: 4B-414-APP. Department dimension and its HR read (ADR-021 Q1), "group only" nodes (DM-2), "Used on lines"
counts, history: later rows (backlog:320). Spreading (4.15), allocations (4.16) and budgets (4.17) read these rules.
Platform lanes PLAT-A/B/C run in parallel: no shared files except a user-service migration number (rule below).

## Tests (money lane: a test per rule)
- ADR-021 "Rules" set: Required missing → 422; Not used present → 422; range 6000–6999 applies; account rule overrides
  it; locked rule can't be loosened; overlap refused; a rule change leaves posted lines and their balances unchanged.
- Each path refuses the same way: manual post, Submit, recurring run (OD-2 outcome), journal import (row refusal list),
  AR/AP document lines, adjustments, machine posting (no defaulting).
- Reversal of a line posted before a new Required rule posts; the year-end journal posts.
- Backfill: every account's derived `allowedDimensions` equals the old column (all seeded companies, both packs).
- Branch default: new manual line takes it; explicit value wins; later change doesn't rewrite saved lines; another
  company's cost centre refused on the branch write; caller without `COST_CENTER.UPDATE` 403.
- **Old FAIL / new PASS:** posting without a Required cost centre accepted before, refused now; branch default absent before.
- **Two-company isolation:** range rules, impact counts and branch defaults of B never in A's answers; B's id → 404.
- **Money invariants:** no ledger line written or changed by any rule change; `scripts/money-invariants.sh` green.
- Targeted runs only (`:services:accounts-service:test --tests …`, `:services:org-service:test --tests …`,
  `:services:user-service:test --tests …`, `:architecture-tests:test`). No whole-suite run, no `verify.sh`.

## Rules
- One repo (BackEnd). Gradle only through `lockf -k /private/tmp/neoerp-gradle.lock`, Java 21, log to a file, one
  watcher; never `gradlew --stop`; stop only your own daemons. Do not start the backend.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws`, keys.
- Migrations freeze once applied: never edit an applied file. Numbers are **next free per service at build time**; if
  PLAT-C merges a user-service migration first, renumber yours before anyone applies it (ask the lead).
- Docs: developer `docs/modules/accounts/dimensions.md` (new: rules, ranges, defaults), `chart-and-used-for.md`
  (CSV column), `docs/database/db-design.md`, contract `docs/api/accounts-a1.md` C-13 / §6 refusals; user guide: none
  in this repo (App lane writes it). List each or "none: reason" in the lane-ready.
- Stop and ask: a rule can't be built as written; a change touches `PostingEngine`/`Posting.kt`, auth-service, an
  applied migration, or a response shape outside §API.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, file:line) | Status |
|---|---|---|
| BE-1 … BE-10 | | |
L36: every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files
in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).

## Reviews
Fresh Opus (whole diff) → `docs/agents/dim-rules/review-be-1-opus.md`; Fable money logic (rule order, every check path,
no re-validation of posted lines, branch write authorisation, isolation) → `review-be-2-fable.md`, diff + brief only.
Only a FIX reviewer re-checks. **Report:** `docs/agents/dim-rules/builder-report-be.md`.
**Lane-ready:** `.review-channel/lane-ready-4b-dim-rules-be.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Files: … changed (main …, test …, docs …) · Items: … scope rows (… done, … moved, … dropped)
```

## Done when
BE-1…BE-10 proven in the self-check; targeted tests 0 failed; both reviews ACCEPT; API table OK'd for the App lane;
docs listed; lane-ready with the Timeline; the old Mac's `verify.sh` green before merge to `phase/4b`.
