# Accounts SB2d — shared dimensions on lines and balances: implementation plan

Status: **plan only, for the lead's Opus review and Jabran's approval. No code, no migrations.**
Written 2026-11-04 against `NeoERP-BackEnd` dev `a6ed776` (migrations up to V52; M5 in progress).
Brief: `docs/agents/codex-briefs/README.md` "## SB2d" Step 1. Decision: ADR-021 (accepted 2026-11-03, all
recommendations except Q13/Q14). Direction: `docs/large-customer-roadmap.md` (large multi-company customers
from day one — volume, indexes, concurrent first use).

Starts only after M5 (incl. R and F1) is merged and pushed. Everything below that names an M5 migration or table
is re-checked against origin/dev at build (`git fetch`, list `db/migration`, list triggers).

## 1. What SB2d delivers and what it leaves for later

**In SB2d:** ADR-021 D8 storage (`dimension_sets`), D7 tables (free dimensions, projects), `dimension_set_id` on
journal lines, every B/C money line table and both balance tables, the backfill, the engine resolving sets inside
the posting transaction, the new balance key through ledger check / year-end / reports / SIE export, maintenance
for the Accounts-owned values (cost centres, projects, free dimensions), and the additive `DimensionSetV1` on
journal, document and machine-posting lines.

**Later, own slices (not SB2d):** app pickers (AP slice after SB2d-4); department values (needs the HR
event-fed cache, ADR-021 Q1); D6 REQUIRED/OPTIONAL/NOT_ALLOWED rules and range rules; `*.changed` events and
machine reads (D2.4–5); imports with dimensions (D10: SIE `#DIM/#OBJEKT`, CSV columns); integration posting API
(D10, Q13/Q14 open); item in sets (waits for Inventory, Q2 below); ADR-023 read store.

## 2. Tables that get `dimension_set_id`

`dimension_set_id UUID NOT NULL`, FK `(company_id, dimension_set_id) → dimension_sets (company_id, id)`.

| Table | Created in | Status | Dimension columns today | Backfill set from |
|---|---|---|---|---|
| `journal_lines` (drafts and posted) | V10 | on dev | `branch_id`, `stock_location_id`, `cost_centre_id`, `project_id` (never written) | branch + location + cost centre (+ project if any non-null; see §4) |
| `ar_document_lines` (invoice, credit note, opening item, **M5 advance deduction** `line_kind = ADVANCE_DEDUCTION`, **M5 write-off** lines if V53 writes lines) | V26, V52, V53 | on dev (V53 merging) | `cost_centre_id`, `stock_location_id`, `item_id` | location + cost centre (branch stays on header) |
| `ap_document_lines` (bill, debit note, opening item, GRNI kind, **M5 supplier advance deduction**) | V31, V52 | on dev; M5-C2 uses it | `cost_centre_id`, `stock_location_id`, `item_id` | location + cost centre |
| `ar_receipt_adjustments` | V26 | on dev | `branch_id`, `cost_centre_id` | branch + cost centre |
| `ap_payment_adjustments` | V31 | on dev | `branch_id`, `cost_centre_id` | branch + cost centre |
| `ar_receipt_advance_lines` (**M5-B1 customer advances**) | V26, V52 | on dev, in use since M5-B1 | none | all-null set |
| `ap_payment_advance_lines` (**M5-C1 supplier advances**) | V31, V56 | on dev; V56 planned | none | all-null set |
| `account_period_balances` | V10 | on dev | key `branch_id`, `cost_centre_id` | rebuilt (§5) |
| `account_year_balances` | V11 | on dev | key `branch_id`, `cost_centre_id` | rebuilt (§5) |

Not given a set (derived, not entered): `ar_refund_advance_parts` / `ap_supplier_refund_advance_parts`
(**M5-B3/C3 refunds**, V55/V57 planned) take the set of the advance line they reverse via `advance_line_id`;
refund, receipt, payment and document **headers** keep `branch_id` as the header default (no set). M5 V54
(customer bank requests), V55/V57 (draft settles) and V58 (fiscal outbox) add no money lines. Builder confirms
at build that V53–V58 added no other line table carrying an account and amount; any found joins this list.

`journal_entries.default_branch_id` / `default_cost_centre_id` stay as header defaults (Q10).
`historical_balances` (SIE history) and `opening_item_import_rows` carry no dimensions: unchanged.

## 3. New tables (migration M1)

- **`accounts.dimension_sets`**: `id UUID PK`, `company_id`, `branch_id`, `stock_location_id`, `department_id`,
  `cost_centre_id`, `project_id`, `item_id`, `free1_id`..`free4_id` (all nullable UUID), `combo_hash BYTEA NOT NULL`,
  `created_at`. `UNIQUE (company_id, combo_hash)`, `UNIQUE (company_id, id)`,
  `UNIQUE (company_id, id, branch_id)` (target of the branch FK, §7).
  - Hash: one SQL function `accounts.dimension_combo_hash(...) RETURNS bytea IMMUTABLE` =
    `sha256('v1|' || the ten values as text in D3 order, null = '', trailing empties trimmed)`. Trimming means a
    future 11th column (D8.6) leaves every existing hash unchanged. `CHECK (combo_hash = accounts.dimension_combo_hash(...))`
    so no writer can store a wrong hash; the engine calls the same function (no Kotlin copy to drift).
  - FKs to Accounts-owned values: `(company_id, cost_centre_id) → cost_centres`, `(company_id, project_id) → projects`,
    `(company_id, freeN_id) → dimension_values` (also proves the value's company). Branch, location, department,
    item: ids only (owners elsewhere, ADR-001).
  - Immutable: `BEFORE UPDATE OR DELETE` trigger raises `ACCOUNTS_DIMENSION_SET_IMMUTABLE`.
  - Reporting indexes: one partial index per column, `(company_id, X) WHERE X IS NOT NULL` (smaller than full
    indexes; the all-null side is never filtered on).
- **`accounts.projects`** (ADR-021 Q3, Accounts holds until the Projects module takes the ids over): `id`,
  `company_id`, `code`, `name`, `parent_id`, `status` (ACTIVE/INACTIVE), `valid_from`, `valid_to`, `is_header`,
  timestamps; unique `(company_id, code)`, `(company_id, id)`; parent FK within company.
- **`accounts.dimension_definitions`** (D7): `id`, `company_id`, `slot SMALLINT CHECK 1..4`, `code`, `name`, `status`,
  `first_used_at` (set on first posted use; after that the slot can't be re-purposed, only deactivated);
  unique `(company_id, slot)`, `(company_id, code)`.
- **`accounts.dimension_values`** (D7): `id`, `company_id`, `definition_id`, `code`, `name`, `parent_id`, `status`,
  `valid_from`, `valid_to`, `is_header`; unique `(company_id, definition_id, code)`, `(company_id, id)`. The engine
  checks that `freeN_id` belongs to the definition in slot N.
- **`accounts.cost_centres`** gains `valid_from DATE NOT NULL DEFAULT '1900-01-01'`, `valid_to DATE`, `is_header
  BOOLEAN NOT NULL DEFAULT false`, `deactivation_reason`. (`is_header` = ADR Q6: header nodes take no postings.)
- `accounts.allowed_dimensions` vocabulary (`domain/chart/ChartTypes.kt` `Dimensions`) gains `department`, `item`,
  `free1`..`free4`. No DB CHECK exists today; validation stays in code. Packs unchanged (nothing new is allowed by
  default, so nothing posted today changes meaning).

## 4. Backfill (migration M2)

Order inside one Flyway migration (one transaction; ACCESS EXCLUSIVE locks are fine at deploy, service stopped):

1. Insert the **all-null set** for every company in `accounts_setups`.
2. Insert every distinct combination found in the tables of §2 (`SELECT DISTINCT company_id, …` per table,
   `UNION`, `ON CONFLICT DO NOTHING`), ordered by company and hash.
3. `ALTER TABLE … ADD COLUMN dimension_set_id UUID` (nullable) on every §2 line table.
4. `ALTER TABLE … DISABLE TRIGGER USER` on each line table (covers V43 `journal_lines_guard`,
   `journal_lines_amount_scale`, V27/V43 `ar/ap_document_lines_guard`, V52 consumption constraint triggers,
   `ar/ap_payment_children_guard` on adjustments and advance lines, and whatever V53–V58 add). FK triggers stay on.
   This is the V52 precedent widened; the builder lists `pg_trigger` per table at build and names them in the report.
5. `UPDATE … SET dimension_set_id = s.id FROM dimension_sets s WHERE s.company_id = l.company_id AND s.combo_hash =
   accounts.dimension_combo_hash(<line values>)`; document and advance lines use branch = null (§7, Q6).
6. Fail loudly if any row is left null (`RAISE EXCEPTION 'ACCOUNTS_DIMENSION_BACKFILL_INCOMPLETE'`), then
   `SET NOT NULL`, add the FKs, `ENABLE TRIGGER USER`.
7. `project_id` on `journal_lines`: the migration asserts every value is null (it has never been written); if not,
   it fails instead of guessing (no FK exists to prove the project).
8. Rebuild both balance tables (§5), then `ANALYZE` the touched tables.

**Volume:** the UPDATE rewrites every line row once. There is no customer data in production yet (pre go-live), so
one transaction at deploy is acceptable (Q8). The builder measures it on a generated dataset (5 M journal lines,
500 k document lines, 3 companies, ~2 k distinct combinations) and records time, peak WAL and lock time in the
report. After go-live a change of this size would need a batched online backfill; noted for ADR-023's volume work.

## 5. Balance key, ledger check, reports, year-end, period close

**Key:** `account_period_balances` and `account_year_balances` become `company × account × period (fiscal year) ×
dimension_set_id × txn_currency` — plain `UNIQUE` (no nulls in the key any more). Rebuild in M2 as new tables filled
from posted `journal_lines` grouped by the new key (the ledger check's own query), year rows from period rows (as
V11). Before swapping, the migration compares old rows with new rows summed back to (account, period, branch,
cost centre, currency) via the sets; any difference raises and the upgrade fails (it means the ledger check was
already failing). Old tables dropped, new renamed, constraint and index names kept (`uq_account_period_balances_key`,
`ix_account_period_balances_period`, `ix_account_year_balances_report` with `INCLUDE (dimension_set_id, debit_base,
credit_base, line_count)`). `journal_lines_gl_idx` is recreated with `dimension_set_id` in place of
`branch_id, cost_centre_id` in its INCLUDE list.

Growth: stock location joins the key (it was line-only under A2 C-25), so rows grow by the number of locations used
on stock accounts; item stays out (Q2). The builder records row counts before/after on the generated dataset.

**Code (all in `services/accounts-service/src/main/kotlin/com/neovatus/accounts/`):**
- `domain/journal/Balances.kt`: `BalanceKey` / `YearBalanceKey` = (account, period|year, dimensionSetId,
  currency), ordered by `DbUuidOrder` on each id — one global lock order stays (C-25, §5.4).
- `infrastructure/persistence/jdbc/BalanceJdbcAdapter.kt`, `LedgerCheckJdbcAdapter.kt`: new key; the ledger check
  also counts lines whose `branch_id` differs from their set's branch (§7) and lines whose set belongs to another
  company (impossible by FK; asserted anyway).
- `ReportJdbcAdapter.kt` (+ `ReportReadRepository`, `ReportModels`, TB/GL/P&L/statement/cash-flow services and
  exporters): the branch and cost-centre filters (A2 C-6, A3 C-6) become `dimension_set_id IN (SELECT id FROM
  dimension_sets WHERE company_id = :c AND <col> = :v)`; the "untagged lines excluded" note (`missing()`) reads
  `<col> IS NULL` on the set. `branchUsed` reads year balances joined to sets. BS and cash flow stay company level
  (A3 C-7, CF-2). GL/journal line reads return the set expanded (§8).
- `YearEndJdbcAdapter.kt` + `domain/calendar/YearEnd.kt` (A3 C-12): buckets become (P&L account, set); one YE line
  per bucket carrying that set. Target line(s): the bucket's set **reduced to what the target account allows**
  (today: branch only → one line per branch, as now; else the all-null set). Inactive values allowed (A3 A1-A1).
  The YE idempotency hash (`PostingEngine.kt` ~l.117) carries the set's fields, null fields left out.
- Period close / reopen / lock (`PeriodControlJdbcAdapter.kt` suspense check, `Pack2026_5.kt` existence checks):
  sums across all rows per account; no change beyond compiling against the new key.
- `SieExportJdbcAdapter.kt`: groups by set; `#OBJEKT` for cost centre (dim 1) as now, plus project (dim 6) when set.

## 6. Engine: resolving the set inside the posting transaction

New port `application/port/outbound/dimension/DimensionSetRepository` + `DimensionSetJdbcAdapter`, used by
`application/service/posting/PostingEngine.kt` on every path (manual, in-process document, machine, reversal, YE).

1. Validation first, unchanged in place (`PostingValidator.kt` / `PostingLineValidator.kt`, step 6), widened to the
   new fields: project, free values and cost centre must be in the company, ACTIVE, not a header node, and the
   entry date within `valid_from..valid_to` → else 422 `DIMENSION_INVALID` with `details.lines[].{index, dimension}`;
   a field the account does not allow → 422 `DIMENSION_NOT_ALLOWED` (existing). Department: refused until the HR
   cache exists (Q3). Reversals copy the original's set id as is (A1 R-10), no re-validation.
2. **New step 10.4a** (after accounts `FOR SHARE`, before the sequence): compute the distinct combinations of the
   posting; look them up (`SELECT id, combo_hash … WHERE company_id = :c AND combo_hash = ANY(:hashes)`); for the
   missing ones one `INSERT … SELECT … ORDER BY combo_hash ON CONFLICT (company_id, combo_hash) DO NOTHING`, then
   re-select. Inserting in hash order means two postings needing {A, B} never wait on each other in opposite
   order. Under READ COMMITTED a second posting that hits a first one's uncommitted row waits on the unique index
   until it commits, then gets its id; if the first rolls back, the second inserts. Batches of 1,000 for YE (up to
   100,000 lines).
3. Each line gets `dimension_set_id`; `journal_lines.branch_id` is written from the set's branch, never separately.
4. Process cache `hash → id` per company (bounded, e.g. 50 k entries): sets are immutable, so a cached id is
   always right. Filled only by ids read as already committed, or in `afterCommit` for ids this transaction
   inserted — never from a rolled-back insert.
5. Balance deltas grouped by the new key, upserted as today (period rows then year rows, each in key order).

Lock-order doc: `docs/api/accounts-a1.md` §5.2 step 10 and R-2 gain step 10.4a. Opus review required (posting
engine). Load: repeat `scripts/a1-load.sh` and the A2 reports load run; record posting p95, lock waits, dead
tuples, and p95 with 100 % new combinations (worst case first use).

**Idempotency (ADR Q2, accepted):** `PostingRequestHash.kt` adds `departmentId`, `projectId`, `itemId`,
`free1Id..free4Id` to each line map only when non-null (null and absent are already left out), so every stored key
replays with the same hash. `AccountsPostingV2` stays V2.

## 7. Branch on the line equals the set's branch

- `journal_lines`, `ar_receipt_adjustments`, `ap_payment_adjustments` keep `branch_id` (Org facts, branch scoping and
  the A1 C-13 rule read it). Enforced by a composite FK `(company_id, dimension_set_id, branch_id) →
  dimension_sets (company_id, id, branch_id)` (MATCH SIMPLE: checks every line with a branch, no per-row trigger
  cost). The remaining case (line branch null, set branch not null) is impossible by engine construction and is
  counted by the nightly ledger check (ADR D8.2) and a test (Q7).
- Document and advance lines carry no `branch_id`; their header's `branch_id` is the branch. The line's set holds
  branch = null or the header's branch (Q6); at posting the engine applies the header branch exactly as
  `defaultBranchId` today, so the journal line's set has the branch.

## 8. Fate of the fixed columns

| Column | Decision |
|---|---|
| `journal_lines.branch_id`, adjustments' `branch_id`, headers' `branch_id` | **Kept** (D8.2, §7). |
| `journal_lines.project_id` | Dropped in M2 (never written; asserted null). |
| `journal_lines.cost_centre_id`, `stock_location_id`; `ar/ap_document_lines.cost_centre_id`, `stock_location_id`; adjustments' `cost_centre_id` | Code stops reading/writing them in SB2d-2/-4; **dropped in M3** at the end of SB2d (Q1), with their FKs. |
| `ar/ap_document_lines.item_id` | Kept as its own column until Inventory exists (Q2). |

## 9. API (additive; `docs/api/accounts-*.md` updated in the same slice)

- **`DimensionSetV1`** (ten frozen names, all nullable UUID): one small Kotlin data class in a new shared module
  `shared/dimension-contracts` owned by the ERP lead (Q11); accounts maps it to/from set ids at the edge
  (`delivery/http/*`); the set id is never on the wire (D8).
- Request lines gain an optional `dimensions: DimensionSetV1` on: journal draft lines (`JournalBodies.kt`), AR
  document lines (`ReceivablesBodies.kt`), AR receipt adjustments and advance lines (`receipt/ReceiptBodies.kt`), AP
  bill lines (`bill/BillBodies.kt`), AP payment adjustments and advance lines (`payment/PaymentBodies.kt`), machine
  posting lines (`internal/postings/MachinePostingDtos.kt`). The flat `costCentreId` / `stockLocationId` / `branchId`
  stay accepted; both given and different → 422 `DIMENSION_CONFLICT` (Q12).
- Responses: each line adds `dimensions` (ids) and `dimensionNames` (display, null when the owner is unknown); flat
  fields still returned.
- Reports (TB, GL, P&L, statement exports): optional filters `stockLocationId`, `projectId`, `free1Id`..`free4Id`
  next to `branchId` / `costCentreId` (one value per dimension, AND between them). `departmentId` / `itemId` added
  when those dimensions become usable.
- New maintenance endpoints under `/api/accounts/companies/{companyId}/`: `cost-centres` (create, edit, deactivate
  with reason, reactivate; existing GET kept), `projects` (same), `dimension-definitions` (slot 1–4) and
  `dimension-definitions/{id}/values`. Permission codes `ACCOUNTS.DIMENSIONS.READ` / `ACCOUNTS.DIMENSIONS.MANAGE`
  (new codes go through user-service; ERP lead check). Deletion only of never-used values.
- Events carrying lines (`accounts.*.posted`) add the dimension ids (D9), names never.

## 10. Migrations (numbers = next free on origin/dev at build; "V5x+" below)

| # | Name | Content | Slice |
|---|---|---|---|
| M1 | `V5x__sb2d_dimension_storage` | §3: hash function, `dimension_sets`, `projects`, `dimension_definitions`, `dimension_values`, cost-centre validity columns. No line changes. | SB2d-1 |
| M2 | `V5x+1__sb2d_dimension_backfill` | §4 + §5: set id on every §2 line table, backfill, FKs incl. branch FK, `project_id` drop, balance rebuild, GL index. | SB2d-2 |
| M3 | `V5x+2__sb2d_drop_fixed_dimension_columns` | §8: drop the replaced `cost_centre_id` / `stock_location_id` columns and FKs. | SB2d-5 |

Expected V59–V61 if M5 ends at V58, V58–V60 if V58 is dropped. Never edit an applied migration; slots are taken at
commit time.

## 11. Slices, in order

| # | Slice | Content | Review |
|---|---|---|---|
| SB2d-0 | Contract docs | `accounts-a0.md` (cost centres, projects, free dims), `accounts-a1.md` §3/§5.2 step 10.4a/C-16 hash, `accounts-a2.md` C-25 replaced by the set key, `accounts-a3.md` C-12 buckets, `accounts-b.md` / `accounts-c.md` line shape, `docs/database/db-design.md`. Docs only. | lead |
| SB2d-1 | Storage + resolver | M1; domain `DimensionSet`, `DimensionSetRepository` + JDBC adapter with the ON CONFLICT resolution and cache; `shared/dimension-contracts`. Not yet called by the engine. Concurrency tests here. | Opus (migration) |
| SB2d-2 | Lines, backfill, balance key, engine | M2; engine step 10.4a on every path; `BalanceKey`; ledger check; year-end; reports; SIE export; idempotency hash. Internally flat fields still drive the set. Full accounts-service suite + load runs. | **Opus** (engine, money, migration) + ERP lead cross-module |
| SB2d-3 | Maintenance of Accounts-owned values | cost centres write API + validity; projects; free definitions/values; `Dimensions` vocabulary; permission codes; validation of the new fields in the engine (§6.1). | Opus (validation on posting path) |
| SB2d-4 | API on lines + report filters | `dimensions` on every request/response line of §9, conflict rule, machine posting fields, report filters, event payloads, Postman/docs. | lead |
| SB2d-5 | Clean-up | M3; remove remaining flat-column reads in adapters. | lead |
| later | App pickers (AP) | Dimension picker on journal/invoice/bill/receipt/payment lines; report filters; maintenance screens. On mocks after SB2d-4. | — |

One Gradle builder per checkout; SB2d-2 is the only slice touching `PostingEngine.kt`, `Balances.kt` and the
balance adapters — no parallel builder on those files.

## 12. Tests

New (names indicative; `services/accounts-service/src/test/kotlin/com/neovatus/accounts/`):
- `DimensionSetRepositoryTest`: same combination → same id incl. all-null; one column different → different id;
  hash function = CHECK; UPDATE/DELETE refused; foreign-company cost centre/project/free value refused by FK.
- `DimensionSetConcurrencyTest`: two postings in parallel with one new combination → both posted, one row (×100);
  two postings with {A, B} in opposite line order → no deadlock (×100); first posting rolls back → second still
  posts; cache never returns a rolled-back id.
- `DimensionBackfillMigrationTest` (populated upgrade from the M5 head, pattern of `AdvanceConsumptionMigrationTest`):
  every line has the set of its branch/location/cost centre; documents and advance lines included; all-null set
  per company; rebuilt balances = old balances summed per branch/cost centre; posted-row guards enabled again
  afterwards (an UPDATE on a posted line still refused); non-null `project_id` fails the upgrade.
- `BranchSetCheckTest`: line branch ≠ set branch refused by FK; ledger check reports a forced mismatch.
- `BalancePerSetTest`: for random postings incl. reversals and YE, every (account, period, set, currency) row = sum
  of posted lines; ledger check passes.
- `ReportByDimensionTest`: TB/GL/P&L filtered by cost centre, location, project, free dimension = sum over sets
  holding that value = sum of matching lines; untagged lines reported as excluded.
- `YearEndSetBucketsTest`: one YE line per (P&L account, set); target per branch when tagged; inactive values pass.
- `DimensionValidityTest`: inactive, out-of-dates, header node, foreign company → `DIMENSION_INVALID`; NOT_ALLOWED →
  `DIMENSION_NOT_ALLOWED`; department refused (Q3); reversal of a line with a now-inactive value posts.
- `PostingRequestHashCompatTest`: stored V2 keys from before SB2d replay with the same hash; a new field changes it.
- `DimensionSetV1ContractTest`: old producer without `dimensions` posts; flat + `dimensions` conflict → 422.
- `DimensionSeparationTest`: party, tax-code and source-line tags never create or change a set (D8.7).
- `IsolationTest` extended: values, sets and reports never cross companies.

Existing, green and unchanged in meaning: every posting/journal suite (incl. `PostingGuardMigrationTest`,
`AccountYearBalancesTest`, `LedgerCheckJobTest`), all `YearEnd*Test`, all report/statement/cash-flow tests, B/C
suites incl. M5 advance/refund/write-off tests, SIE export/import, architecture-tests. Full accounts-service run
once per slice before hand-off; counts in the report.

## 13. Risks

| Risk | Mitigation |
|---|---|
| M5 still changing the same files (`PostingEngine.kt`, B/C rules, line guards) | Start only after M5 merged; re-list tables and triggers at build; SB2d-2 alone on engine files. |
| Too many sets (item, many locations) → big balance tables and YE journals over 100,000 lines | Item stays out (Q2); record set and balance-row counts in load runs; YE line count measured on the generated dataset. |
| Backfill time and locks on large data | Pre go-live; measured on 5 M lines; documented batched approach for after go-live. |
| Hash drift between writers | One SQL function + CHECK constraint; no Kotlin hash. |
| Wait on first use of a combination during a long posting | Only on first use; hash-ordered inserts prevent deadlock; measured in load run. |
| Old idempotency keys stop replaying | Null fields left out of the hash; compat test. |
| Reports slower via join | Partial indexes on sets; sets table small per company; A2 report load run repeated; ADR-023 later. |
| Branch scoping regressions | `branch_id` kept on lines; composite FK + ledger check. |
| Guards silently off after migration | `ENABLE TRIGGER USER` + migration test that a posted line is still immutable. |

## 14. Questions for Jabran (recommendation first)

1. **Remove the old cost-centre and location columns from lines at the end of SB2d?** *Yes, drop them in the last
   slice.* No customer data is live yet, so keeping two copies of the same fact for a release only adds risk.
2. **Put the product (item) into the dimension set now?** *No, not until Inventory exists; the item stays its own
   column on invoice and bill lines.* There is nobody to check item ids yet, and it is the one dimension that can
   multiply balance rows by thousands.
3. **Department on lines in SB2d?** *Not yet: refuse department values until Accounts has HR's department list
   (its own small slice right after).* Accounts can't check a department without that list.
4. **Cost centre maintenance (create, edit, deactivate, valid dates) in SB2d?** *Yes.* Projects and free
   dimensions get maintenance in SB2d; cost centres being read-only would be the odd one out.
5. **Required/optional rules per account and account ranges (ADR D6)?** *Next slice after SB2d, before Sales.* SB2d
   is already a large money change; the rules are separate and testable on their own.
6. **May one line of an invoice or bill have a different branch than the document?** *No: blank (= document
   branch) or the same branch only.* One document belongs to one branch for numbering and branch access.
7. **How strictly to enforce "line branch = set branch"?** *Database link for every line with a branch, plus the
   nightly ledger check for the rest.* Full protection without a per-line trigger slowing large postings.
8. **Run the backfill in one go during the deploy (service stopped)?** *Yes.* No live customers yet; we measure it
   on 5 million lines and write down the slower online method for after go-live.
9. **Advance lines (customer and supplier advances) carry dimensions?** *Yes; a deduction copies its advance's
   dimensions.* A project advance must land on the project.
10. **Journal header defaults?** *Keep only default branch and cost centre for now.* More header defaults can come
    with the app pickers if people ask.
11. **Where the shared `DimensionSetV1` type lives?** *A new tiny shared module owned by the ERP lead.* Payroll,
    Sales and Purchasing then use the same class instead of copies.
12. **Keep the old flat fields (`costCentreId`, `stockLocationId`) in the API?** *Yes, next to the new `dimensions`;
    refuse if both are given and differ.* The app keeps working until its picker slice moves over.
13. **Report filters for every new dimension in SB2d?** *Yes, in SB2d-4.* Once the join exists it is cheap, and an
    Accounts-only company needs it to see project and free-dimension figures.
