# Accounts SB2d — shared dimensions on lines and balances: implementation plan

Status: **plan only. Revised 2026-11-04 after the independent Opus review ("approve after changes": H1–H3, M1–M7,
L1–L7 applied). For the lead's re-check and Jabran's approval. No code, no migrations.**
Written against `NeoERP-BackEnd` dev `a6ed776` (migrations up to V52; M5 in progress).
Brief: `docs/agents/codex-briefs/README.md` "## SB2d" Step 1. Decision: ADR-021 (accepted 2026-11-03, all
recommendations except Q13/Q14). Direction: `docs/large-customer-roadmap.md` (large multi-company customers
from day one — volume, indexes, concurrent first use). **The product is not live; only local demo data exists
(confirmed by the ERP lead).**

Starts only after M5 (incl. R and F1) is merged and pushed. Everything below that names an M5 migration, table or
trigger is re-checked against origin/dev at build (`git fetch`, list `db/migration`, list `pg_trigger`).

## 1. What SB2d delivers and what it leaves for later

**In SB2d:** ADR-021 D8 storage (`dimension_sets`), D7 tables (free dimensions, projects), `dimension_set_id` on
journal lines, every B/C money line table and both balance tables, the backfill, the engine and every draft writer
resolving sets, the new balance key through ledger check / year-end / reports / SIE export, maintenance for the
Accounts-owned values (cost centres, projects, free dimensions) with `accounts.cost_centre.changed`, and the
additive `DimensionSetV1` on journal, document and machine-posting lines.

**Later, own slices (not SB2d):** app pickers (AP slice after SB2d-4); department values (needs the HR
event-fed cache, ADR-021 Q1 — until then Payroll must not send `departmentId`, it would be refused); D6
REQUIRED/OPTIONAL/NOT_ALLOWED and range rules; the other `*.changed` events and machine reads (D2.4–5); imports
with dimensions (D10); integration posting API (Q13/Q14 open); populating item (§3, ADR amendment); ADR-023.

## 2. Tables that get `dimension_set_id`

`dimension_set_id UUID NOT NULL`, FK `(company_id, dimension_set_id) → dimension_sets (company_id, id)`.
No index on the lines' `dimension_set_id` is needed: sets are never deleted (no FK lookup from the parent side),
and reports go through the balance tables or `journal_lines_gl_idx` (which INCLUDEs it, §5).

| Table | Created in | Status | Dimension columns today | Backfill set from |
|---|---|---|---|---|
| `journal_lines` (drafts and posted) | V10 | on dev | `branch_id`, `stock_location_id`, `cost_centre_id`, `project_id` (never written) | branch + location + cost centre |
| `ar_document_lines` (invoice, credit note, opening item, **M5 advance deduction** `line_kind = ADVANCE_DEDUCTION`, **M5 write-off** lines if V53 writes lines) | V26, V52, V53 | on dev (V53 merging) | `cost_centre_id`, `stock_location_id`, `item_id` | location + cost centre; branch always null (§7) |
| `ap_document_lines` (bill, debit note, opening item, GRNI kind, **M5 supplier advance deduction**) | V31, V52 | on dev; M5-C2 uses it | same | location + cost centre; branch null |
| `ar_receipt_adjustments` | V26 | on dev | `branch_id`, `cost_centre_id` | branch + cost centre |
| `ap_payment_adjustments` | V31 | on dev | `branch_id`, `cost_centre_id` | branch + cost centre |
| `ar_receipt_advance_lines` (**M5-B1 customer advances**) | V26, V52 | on dev, in use since M5-B1 | none | all-null set |
| `ap_payment_advance_lines` (**M5-C1 supplier advances**) | V31, V56 | on dev; V56 planned | none | all-null set |
| `account_period_balances` | V10 | on dev | key `branch_id`, `cost_centre_id` | rebuilt (§5) |
| `account_year_balances` | V11 | on dev | key `branch_id`, `cost_centre_id` | rebuilt (§5) |

**Not given a set, with the reason:**

| Table | Reason; set of the journal lines it produces |
|---|---|
| `ar_document_line_taxes`, `ap_document_line_taxes` | Tax rows of a document line, no dimension columns. Their tax journal lines are built today (`TaxLineTagger.kt`) with no line cost centre and get the header branch as `defaultBranchId` when the tax account takes a branch. Their set = exactly what that gives (header branch or all-null). Unchanged. |
| `ar_receipt_withholdings`, `ap_payment_withholdings` | Withholding rows; same derivation (header branch when the account allows, nothing else). |
| `ar_refund_advance_parts`, `ap_supplier_refund_advance_parts` (exist since **V26/V31**; M5-B3/C3 use them, V55/V57 add draft-settle support) | Derived, not entered: they take the set of the advance line they reverse via `advance_line_id`. |
| Document, receipt, payment, refund **headers** | Keep `branch_id` as the header default (no set). |

M5 V54 (customer bank requests), V55/V57 (draft settles) and V58 (fiscal outbox) add no money lines. Builder
confirms at build that V53–V58 added no other table carrying an account and amount; any found joins a table above.
`journal_entries.default_branch_id` / `default_cost_centre_id` stay as header defaults (Q9).
`historical_balances` and `opening_item_import_rows` carry no dimensions: unchanged.

## 3. New tables (migration M1)

- **`accounts.dimension_sets`**: `id UUID PK`, `company_id`, `branch_id`, `stock_location_id`, `department_id`,
  `cost_centre_id`, `project_id`, `item_id`, `free1_id`..`free4_id` (all nullable UUID), `combo_hash BYTEA NOT NULL`,
  `created_at`. `UNIQUE (company_id, combo_hash)`, `UNIQUE (company_id, id)`, `UNIQUE (company_id, id, branch_id)`
  (target of the branch FK, §7).
  - Hash: one SQL function `accounts.dimension_combo_hash(...) RETURNS bytea IMMUTABLE` =
    `sha256('v1|' || the ten values as text in D3 order, null = '', trailing empties trimmed)`. Trimming means a
    future 11th column (D8.6) leaves existing hashes unchanged. `CHECK (combo_hash = accounts.dimension_combo_hash(...))`.
    **The hash exists only in SQL**; no Kotlin hash anywhere (§6).
  - FKs to Accounts-owned values: `(company_id, cost_centre_id) → cost_centres`, `(company_id, project_id) →
    projects`, `(company_id, freeN_id) → dimension_values` (proves company; and a value used by any set can't be
    deleted). Branch, location, department, item: ids only (owners elsewhere, ADR-001).
  - Immutable: `BEFORE UPDATE OR DELETE` trigger raises `ACCOUNTS_DIMENSION_SET_IMMUTABLE`, and M1 runs
    `REVOKE UPDATE, DELETE ON accounts.dimension_sets FROM neoerp_accounts_app` (role from
    `infra/postgres/initdb/accounts-runtime-role.psql`). Test reset hooks that truncate tables use the owner role
    and are updated to include `dimension_sets` (L5).
  - Reporting indexes: one partial index per column, `(company_id, X) WHERE X IS NOT NULL`.
- **Item (ADR-021 Q18 amendment, not a question):** `item_id` exists on `dimension_sets` as D8 says. SB2d never
  populates it: nothing can validate item ids until Inventory exists. The Inventory slice populates it and runs the
  Q18 set-count measurement. `ar/ap_document_lines.item_id` stays its own descriptive column until then. SB2d-0
  writes this amendment note into ADR-021 (Status/Q18).
- **`accounts.projects`** (ADR-021 Q3): `id`, `company_id`, `code`, `name`, `parent_id`, `status`, `valid_from`,
  `valid_to`, `is_header`, timestamps; unique `(company_id, code)`, `(company_id, id)`; parent FK within company.
- **`accounts.dimension_definitions`** (D7): `id`, `company_id`, `slot SMALLINT CHECK 1..4`, `code`, `name`, `status`;
  unique `(company_id, slot)`, `(company_id, code)`. **"Used" is derived, never written on the posting path:** a slot
  is used when `EXISTS (SELECT 1 FROM dimension_sets WHERE company_id = :c AND freeN_id IS NOT NULL)` (partial
  index makes it cheap). A used slot can't be re-purposed (code/name meaning change refused), only deactivated.
- **`accounts.dimension_values`** (D7): `id`, `company_id`, `definition_id`, `code`, `name`, `parent_id`, `status`,
  `valid_from`, `valid_to`, `is_header`; unique `(company_id, definition_id, code)`, `(company_id, id)`.
- **`accounts.cost_centres`** gains `valid_from DATE NOT NULL DEFAULT '1900-01-01'`, `valid_to DATE`, `is_header
  BOOLEAN NOT NULL DEFAULT false`, `deactivation_reason`.
- `allowed_dimensions` vocabulary (`domain/chart/ChartTypes.kt` `Dimensions`) gains `department`, `item`,
  `free1`..`free4`. No DB CHECK today; packs unchanged, so nothing posted today changes meaning.

## 4. Backfill (migrations M2a and M2b)

**M2a — sets on lines** (one Flyway transaction, service stopped):

1. Insert the **all-null set** for every company in `accounts_setups`.
2. Build a temp table `tmp_combo (company_id, branch_id, stock_location_id, cost_centre_id)` of every distinct
   combination over the §2 line tables (document and advance lines with branch = null). Insert those into
   `dimension_sets` (hash computed once per **distinct combination**, ordered by company and hash), then fill
   `tmp_combo.set_id` from them. Index `tmp_combo (company_id)`.
3. `ADD COLUMN dimension_set_id UUID` (nullable) on every §2 line table.
4. Disable the guard triggers **by explicit name list** captured at build (V52 precedent: `DISABLE TRIGGER
   trg_journal_lines_guard`, `trg_journal_lines_amount_scale`, `trg_ar_document_lines_guard`,
   `trg_ap_document_lines_guard`, V52 `trg_*_consumption` constraint triggers, `trg_ar_receipt_adjustments_guard`,
   `trg_ap_payment_adjustments_guard`, `trg_ar_receipt_advance_lines_guard`, `trg_ap_payment_advance_lines_guard`,
   plus whatever V53–V58 add; the build report lists them). Not `DISABLE TRIGGER USER`.
5. `UPDATE l SET dimension_set_id = c.set_id FROM tmp_combo c WHERE c.company_id = l.company_id AND c.branch_id IS
   NOT DISTINCT FROM l.branch_id AND …` — a join on values, **no sha256 per row**.
6. Raise `ACCOUNTS_DIMENSION_BACKFILL_INCOMPLETE` if any row is still null; `SET NOT NULL`; add FKs incl. the
   branch FK (§7); re-enable the same named triggers.
7. `journal_lines.project_id`: assert all null (never written), then drop.
8. `ANALYZE` the touched tables.

**M2b — balance key** (§5): rebuild both balance tables, recreate `journal_lines_gl_idx`.

**Volume:** the UPDATE rewrites every line row once. With no live data, one transaction at deploy is fine (Q7).
The builder measures M2a and M2b on a generated dataset (5 M journal lines, 500 k document lines, 3 companies,
~2 k combinations): time, peak WAL, lock time, balance-row counts. After go-live a change this size needs a batched
online backfill; noted for ADR-023's volume work.

**Rollback:** take a database backup before M2a (`pg_dump` of `neoerp_accounts`; on hosted environments a snapshot).
No down migrations (Flyway forward only). After M2a/M2b/M3 the old app build can't run against the database, so
rollback = restore the backup + deploy the previous build. `VACUUM ANALYZE` of the rewritten tables runs after
the deploy, outside Flyway (Flyway runs in a transaction).

## 5. Balance key, ledger check, reports, year-end, period close (SB2d-2b)

**Key:** `account_period_balances` / `account_year_balances` become `company × account × period (fiscal year) ×
dimension_set_id × txn_currency`, plain `UNIQUE` (no nulls in the key). Plus a **non-key `branch_id`** copied from
the set, with the same composite FK `(company_id, dimension_set_id, branch_id)` (Q11; keeps branch filters and
`branchUsed` join-free). M2b builds new tables from posted `journal_lines` grouped by the new key (the ledger
check's query); year rows from period rows (as V11). Before swapping, M2b compares old and new summed back to
(account, period|year, branch, cost centre, currency) with a **null-safe FULL OUTER JOIN** on `debit_base`,
`credit_base`, `debit_txn`, `credit_txn`, `line_count`, for **both** tables; any difference raises (it would mean
the ledger check already failed). Old tables dropped, new renamed; names kept (`uq_account_period_balances_key`,
`ix_account_period_balances_period`, `ix_account_year_balances_report` with `INCLUDE (dimension_set_id, branch_id,
debit_base, credit_base, line_count)`). `journal_lines_gl_idx` recreated with `dimension_set_id` replacing
`cost_centre_id` in its INCLUDE list (`branch_id` stays).

Growth: stock location joins the key (line-only under A2 C-25); item stays out (§3). Row counts recorded.

**Code (`services/accounts-service/src/main/kotlin/com/neovatus/accounts/`):**
- `domain/journal/Balances.kt`: `BalanceKey` / `YearBalanceKey` = (account, period|year, dimensionSetId, currency),
  `DbUuidOrder` on each id — one global lock order (C-25, §5.4).
- `BalanceJdbcAdapter.kt`, `LedgerCheckJdbcAdapter.kt`: new key; the ledger check also counts lines (and balance
  rows) whose `branch_id` differs from their set's branch, including line branch null with set branch not null.
- `ReportJdbcAdapter.kt` (+ `ReportReadRepository`, `ReportModels`, TB/GL/P&L/statement/cash-flow services and
  exporters): branch filter on the non-key `branch_id`; cost-centre and the new filters as `dimension_set_id IN
  (SELECT id FROM dimension_sets WHERE company_id = :c AND <col> = :v)`; "untagged excluded" (`missing()`) reads
  `<col> IS NULL` on the set. BS and cash flow stay company level (A3 C-7, CF-2).
- `YearEndJdbcAdapter.kt` + `domain/calendar/YearEnd.kt` (A3 C-12): buckets = (P&L account, set); one YE line per
  bucket with that set. Target line(s): the bucket's set reduced to what the target account allows (today branch
  → one line per branch as now; else the all-null set). Inactive values allowed (A3 A1-A1). `YearEnd.hash` leaves
  null fields out so year-end previews made before the deploy keep their hash.
- Period close / reopen / lock (`PeriodControlJdbcAdapter.kt`, `Pack2026_5.kt`): sums per account; compile only.
- `SieExportJdbcAdapter.kt`: groups by set; keeps branch exactly as today (L1); `#OBJEKT` cost centre (dim 1) as now
  plus project (dim 6) when set.

## 6. Engine and draft writers: resolving sets

New port `application/port/outbound/dimension/DimensionSetRepository` + `DimensionSetJdbcAdapter`, one method
`resolve(scope, tuples: List<DimensionTuple>): Map<DimensionTuple, UUID>`.

**Resolve by values, in SQL.** The adapter sends the distinct tuples as ten parallel `uuid[]` arrays;
`unnest(...)` → `accounts.dimension_combo_hash(...)` computed in SQL for both lookup and insert:
`INSERT INTO dimension_sets … SELECT …, h FROM (unnest … ) ORDER BY h ON CONFLICT (company_id, combo_hash) DO
NOTHING`, then `SELECT` by the same hashes (computed in SQL). Kotlin never hashes.

**Cache:** one global LRU (e.g. 200 k entries, Caffeine) keyed by `(companyId, value tuple)` → set id. Sets are
immutable, so a cached id is always right. Filled only with ids read as already committed, or in `afterCommit` for
ids this transaction inserted — never from a rolled-back insert.

**Posting paths** (`PostingEngine.kt`: manual, in-process document, machine, reversal, YE):
1. Validation first, in place (`PostingValidator.kt` / `PostingLineValidator.kt`, step 6), widened: project, free
   values and cost centre in the company, ACTIVE, not a header node, entry date within `valid_from..valid_to` → 422
   `DIMENSION_INVALID` (`details.lines[].{index, dimension}`); free value must belong to slot N's definition; a field
   the account doesn't allow → 422 `DIMENSION_NOT_ALLOWED`; department → refused (§1). A1 C-13 location-belongs-to-
   branch check kept. Reversals copy the original's set id, no re-validation (A1 R-10).
2. **Step 10.4a** (after accounts `FOR SHARE`, before the sequence): resolve every set the transaction needs, once.
   Each line gets `dimension_set_id`; `journal_lines.branch_id` is written from the set's branch.
3. **Manual post re-resolves:** a draft line's stored set holds what the person entered; when header defaults
   (`default_branch_id`, `default_cost_centre_id`) or the single-active-branch rule fill a line at post, the engine
   resolves the filled tuple at 10.4a and the posted line carries that set (draft lines are re-written at post
   today via the posting-journal insert path, so no update of a posted row is needed).
4. Balance deltas grouped by the new key, upserted as today (period rows, then year rows, each in key order).

**Lock invariant (written into `accounts-a1.md` §5.2 step 10 and R-2):** sets are inserted **once per transaction,
at 10.4a**; no exclusive lock taken after 10.4a may be held before 10.4a by any other path. Consequences:
- A future transaction that posts several journals (e.g. a batch) pre-resolves **all** its sets at one 10.4a
  before its first sequence/balance lock.
- Year-end sorts **all** its combinations by hash before batching in 1,000s (up to 100,000 lines), so batches
  keep one global order.
- A posting that meets another's uncommitted set row waits on the unique index until that one commits (rolls back
  → it inserts). While waiting it still holds its setup-row, period and account `FOR SHARE` locks; that blocks
  only exclusive lockers of those rows (period close, account edit) for the length of one posting, on first use only.
- If Postgres still reports a deadlock (40P01), the transaction rolls back with nothing written, as any posting
  failure today. **Lead check (2026-11-04): accounts-service has no deadlock mapping today** (no 40P01 /
  `POSTING_BUSY` handling exists), so SB2d-2a adds one: 40P01 and 55P03 map to a new retryable 409 `POSTING_RETRY`
  ("Try again"), with a metric; no retry inside the engine; documented in A1 and the app's error codes.
- Guard: an architecture/unit test asserts `DimensionSetRepository.resolve` is called only from the 10.4a step and
  the draft writers (below), never after a sequence or balance call in the same transaction.

**Draft paths (sets resolved at save, own short step in the draft transaction):** every writer of a line table in
§2 resolves the line's tuple before its insert. Writers to change in SB2d-2a:
- `JournalJdbcAdapter.kt` — draft line delete/re-insert (`DELETE` ~l.209 and ~l.303, `INSERT` ~l.448) and the
  draft services feeding it (`JournalDraftService.kt`, `SieOpeningConfirmService.kt`).
- `ArDocumentJdbcAdapter.kt` (~l.328), `ApDocumentJdbcAdapter.kt` (~l.339) — document lines incl. deduction lines
  (`AdvanceDeductionJdbcAdapter.kt` if it writes lines) and opening items.
- `ArReceiptJdbcAdapter.kt` (advance lines ~l.301, adjustments ~l.320), `ApPaymentJdbcAdapter.kt` (adjustments
  ~l.313, advance lines).
- Opening-item import (`OpeningImportJdbcAdapter.kt` / `OpeningImportItemJdbcAdapter.kt`) where it creates
  documents through the document adapters.
- Any M5 writer added by V53–V58 (write-off, refunds) — listed at build.
Draft writers resolve sets **without** dimension validation (that stays at posting, as today) and take no other
lock after resolving. Sets created by drafts that are never posted are harmless: a set is only a combination of
ids, it holds no money and does not count as "used" for anything except blocking value deletion and slot
re-purposing — and a value that a draft referenced is a reasonable reason to keep it.

**Idempotency (ADR Q2, accepted):**
- Before hashing, the flat fields (`branchId`, `costCentreId`, `stockLocationId`) and nested `dimensions` are
  checked for conflict (422 `DIMENSION_CONFLICT`) and **normalised into one map under the `DimensionSetV1` names**;
  null fields are left out. `PostingRequestHash.kt` hashes that map, so a stored key sent flat replays the same,
  and the same request sent nested or flat gives the same hash.
- `PostingEngine.documentHash` (~l.380): same null omission for the new fields; the header branch is **not**
  merged into the line `branchId` used by this hash (the hash stays on what the module sent).
- `YearEnd.hash` (`domain/calendar/YearEnd.kt` l.44): null fields omitted (preferred over forcing previews to refresh).
- `ExportRequestHash` (`application/service/report/export/ExportSupport.kt` l.152): new report filters omitted when null.
- Compat tests for all four (§12).

Opus review required. Load: repeat `scripts/a1-load.sh` and the A2 reports load run; record posting p95, lock
waits, dead tuples, and p95 with 100 % new combinations.

## 7. Branch on the line equals the set's branch

- `journal_lines`, `ar_receipt_adjustments`, `ap_payment_adjustments` and (non-key) the balance tables keep
  `branch_id`. Enforced by composite FK `(company_id, dimension_set_id, branch_id) → dimension_sets (company_id, id,
  branch_id)` (MATCH SIMPLE: every row with a branch; no per-row trigger). Branch null with a set branch is
  impossible by construction and counted by the nightly ledger check (ADR D8.2).
- **Document and advance lines always store branch = null in their set.** The API accepts a line `branchId` equal
  to the header's branch and normalises it to null; a different branch → 422 `DIMENSION_INVALID`
  (`dimension: branch`). At posting the engine merges the header branch exactly as `defaultBranchId` today, so the
  journal line's set carries the branch. The A1 C-13 location-in-branch check runs against that merged branch.

## 8. Fate of the fixed columns

| Column | Decision |
|---|---|
| `journal_lines.branch_id`, adjustments' `branch_id`, headers' `branch_id` | **Kept** (D8.2, §7). |
| `journal_lines.project_id` | Dropped in M2a (never written; asserted null). |
| `journal_lines.cost_centre_id`, `stock_location_id`; `ar/ap_document_lines.cost_centre_id`, `stock_location_id`; adjustments' `cost_centre_id` | Code stops reading/writing them in SB2d-2a/2b/4; **dropped in M3** (Q1), with their FKs. |
| `ar/ap_document_lines.item_id` | Kept until Inventory (§3 amendment). |

## 9. API (additive; `docs/api/accounts-*.md` updated in the same slice)

- **`DimensionSetV1`** (ten frozen names, all nullable UUID): a Kotlin data class in a new shared module
  `shared/dimension-contracts` owned by the ERP lead (Q10); the set id is never on the wire (D8).
- Request lines gain optional `dimensions: DimensionSetV1` on: journal draft lines (`JournalBodies.kt`), AR document
  lines (`ReceivablesBodies.kt`), receipt adjustments and advance lines (`receipt/ReceiptBodies.kt`), bill lines
  (`bill/BillBodies.kt`), payment adjustments and advance lines (`payment/PaymentBodies.kt`), machine posting lines
  (`internal/postings/MachinePostingDtos.kt`). Flat `costCentreId` / `stockLocationId` / `branchId` stay accepted;
  both given and different → 422 `DIMENSION_CONFLICT` (Q12). Branch on document/advance lines per §7.
- Responses: each line adds `dimensions` (ids) and `dimensionNames` (null when the owner is unknown); flat fields kept.
- Reports (TB, GL, P&L, statement exports): optional filters `stockLocationId`, `projectId`, `free1Id`..`free4Id`
  next to `branchId` / `costCentreId` (AND between them); null filters left out of `ExportRequestHash`.
- Maintenance under `/api/accounts/companies/{companyId}/`: `cost-centres` (create, edit, deactivate with reason,
  reactivate; GET kept), `projects`, `dimension-definitions` (slot 1–4), `dimension-definitions/{id}/values`.
  Permission codes `ACCOUNTS.DIMENSIONS.READ` / `.MANAGE` (user-service; ERP lead check). Delete only when no set
  references the value (the FK refuses otherwise).
- **`accounts.cost_centre.changed`** (id, code, name, status, `validFrom`, `validTo`, `subjectVersion`) through the
  relay (ADR-019) in SB2d-3, so HR/Payroll caches see deactivation and validity (L3). The existing machine read
  `GET /cost-centres` also returns status and validity.
- Deactivation race accepted as in ADR-021 Q1: a producing module may post with a value deactivated seconds
  earlier if its cache is stale; Accounts re-checks at posting, so the only window is Accounts' own commit order (L4).
- Events carrying lines (`accounts.*.posted`) add the dimension ids (D9), names never.

## 10. Migrations (numbers = next free on origin/dev at build; "V5x+")

| # | Name | Content | Slice |
|---|---|---|---|
| M1 | `V5x__sb2d_dimension_storage` | §3: hash function, `dimension_sets` (+ REVOKE), `projects`, `dimension_definitions`, `dimension_values`, cost-centre validity. | SB2d-1 |
| M2a | `V5x+1__sb2d_dimension_sets_on_lines` | §4 M2a: set id on every §2 line table, backfill, FKs incl. branch FK, `project_id` drop. Balances untouched. | SB2d-2a |
| M2b | `V5x+2__sb2d_balance_key_by_set` | §5: balance tables rebuilt on the set key with non-key `branch_id`, totals check, GL index. | SB2d-2b |
| M3 | `V5x+3__sb2d_drop_fixed_dimension_columns` | §8: drop replaced `cost_centre_id` / `stock_location_id` and their FKs. | SB2d-5 |

Expected V59–V62 if M5 ends at V58. Never edit an applied migration; slots taken at commit time.

## 11. Slices, in order

| # | Slice | Content | Review |
|---|---|---|---|
| SB2d-0 | Contract docs | `accounts-a0.md` (cost centres, projects, free dims), `accounts-a1.md` §3/§5.2 step 10.4a + lock invariant/R-2 + C-16 normalised hash, `accounts-a2.md` C-25 replaced, `accounts-a3.md` C-12 buckets, `accounts-b.md` / `accounts-c.md` line shape and branch rule, `docs/database/db-design.md`, ADR-021 Q18 item amendment. | lead |
| SB2d-1 | Storage + resolver | M1; domain `DimensionSet`/`DimensionTuple`, `DimensionSetRepository` + adapter (SQL hash, ordered ON CONFLICT, global LRU); `shared/dimension-contracts`. Not yet called. Concurrency tests. | Opus |
| SB2d-2a | Sets on lines | M2a; every draft writer (§6) and the engine's 10.4a fill `dimension_set_id`; manual-post re-resolve; normalised idempotency hashes. Balances, reports and year-end still read the old columns (still present). | **Opus** + ERP lead cross-module |
| SB2d-2b | Balance key | M2b; `BalanceKey`; ledger check incl. branch mismatch; year-end; reports; SIE export; GL index; `YearEnd.hash`. Load runs. | **Opus** + ERP lead |
| SB2d-3 | Maintenance of Accounts-owned values | cost centres write API + validity + `accounts.cost_centre.changed`; projects; free definitions/values with derived "used"; `Dimensions` vocabulary; permission codes; engine validation of the new fields. | Opus (posting path) |
| SB2d-4 | API on lines + report filters | `dimensions` on every line of §9, conflict and branch normalisation, machine posting fields, report filters, export hash, event payloads, Postman/docs. | lead |
| SB2d-5 | Clean-up | M3; remove remaining flat-column reads. | lead |
| later | App pickers (AP) | Pickers on journal/invoice/bill/receipt/payment lines; report filters; maintenance screens. On mocks after SB2d-4. | — |

One Gradle builder per checkout; SB2d-2a/2b alone on `PostingEngine.kt`, `Balances.kt`, the balance and line
adapters. Full accounts-service suite per slice.

## 12. Tests

New (names indicative; `services/accounts-service/src/test/kotlin/com/neovatus/accounts/`):
- `DimensionSetRepositoryTest`: same tuple → same id incl. all-null; one column different → different id; CHECK
  rejects a wrong hash; UPDATE/DELETE refused by trigger and by the app role's missing grant; foreign-company value
  refused by FK; a value referenced by a set can't be deleted.
- `DimensionSetConcurrencyTest`: two postings in parallel with one new combination → both posted, one row (×100);
  {A, B} in opposite line order → no deadlock (×100); first posting rolls back → second still posts; cache never
  returns a rolled-back id; YE with many new combinations parallel to an ordinary posting → no deadlock.
- `DimensionSetLockOrderTest` (architecture/unit): `resolve` only at 10.4a and in draft writers.
- `DraftDimensionSetTest`: journal draft save/edit (delete + re-insert), AR/AP document draft, receipt/payment
  adjustments and advance lines, opening-item import, SIE opening confirm → every line has a set; manual post with
  header defaults → posted line carries the filled set; discarded draft leaves its set, nothing else changes.
- `DimensionBackfillMigrationTest` (populated upgrade from the M5 head, pattern of `AdvanceConsumptionMigrationTest`):
  every line has the set of its branch/location/cost centre; documents/advance lines branch null; all-null set per
  company; named guards enabled again (an UPDATE on a posted line still refused); non-null `project_id` fails.
- `BalanceKeyMigrationTest`: rebuilt period and year rows = old rows summed per branch/cost centre on all five
  amounts (FULL OUTER JOIN); a forced difference fails the upgrade.
- `BranchSetCheckTest`: line or balance branch ≠ set branch refused by FK; ledger check reports a forced null-branch mismatch.
- `BalancePerSetTest`: random postings incl. reversals and YE; every (account, period, set, currency) row = sum of lines.
- `ReportByDimensionTest`: TB/GL/P&L filtered by cost centre, location, project, free dimension = sum over sets
  holding the value = sum of matching lines; untagged reported as excluded.
- `YearEndSetBucketsTest`: one YE line per (P&L account, set); target per branch when tagged; inactive values pass;
  **a P&L account whose `allowed_dimensions` was narrowed after postings** still closes every old bucket (L6).
- `DimensionValidityTest`: inactive, out-of-dates, header node, foreign company, free value of the wrong slot →
  `DIMENSION_INVALID`; NOT_ALLOWED → `DIMENSION_NOT_ALLOWED`; department refused; reversal with a now-inactive value posts.
- `DocumentLineBranchTest`: line branch = header → stored null; other branch → 422; journal line gets header branch;
  location in another branch → C-13 refusal.
- Hash compat: `PostingRequestHashCompatTest` (stored V2 keys replay; flat vs nested same hash; new field changes
  it), `DocumentHashCompatTest`, `YearEndHashCompatTest`, `ExportRequestHashCompatTest`.
- `DimensionSetV1ContractTest`: old producer without `dimensions` posts; conflict → 422.
- `FreeDimensionSlotTest`: used slot (derived) can't be re-purposed, can be deactivated.
- `CostCentreChangedEventTest`: create/edit/deactivate emits one event; duplicate stale event changes nothing.
- `DimensionSeparationTest`: party, tax-code, source-line tags never create or change a set (D8.7).
- `IsolationTest` extended: values, sets, reports never cross companies.

Existing, green and unchanged in meaning: every posting/journal suite (`PostingGuardMigrationTest`,
`AccountYearBalancesTest`, `LedgerCheckJobTest`), all `YearEnd*Test`, report/statement/cash-flow, B/C suites incl. M5
advance/refund/write-off tests, SIE export/import, architecture-tests. Counts in each report.

## 13. Risks

| Risk | Mitigation |
|---|---|
| M5 still changing the same files and guards | Start after M5 merged; re-list tables, writers and triggers at build; 2a/2b alone on engine files. |
| A draft writer missed → NOT NULL failure at runtime | Writer list in §6, `DraftDimensionSetTest`, full suite. |
| Too many sets → big balance tables, YE over 100,000 lines | Item not populated (§3); counts recorded in load runs and on the generated dataset. |
| Backfill time and locks | No live data; measured; backup + rollback (§4); online method noted for after go-live. |
| Deadlock or long wait on first use | One resolve step at 10.4a, hash-ordered, lock invariant + test; 40P01 → clean retryable refusal. |
| Hash drift | Hash only in SQL + CHECK; no Kotlin hash. |
| Old idempotency keys or previews stop matching | Normalised maps, nulls omitted; four compat tests. |
| Reports slower via join | Non-key `branch_id` on balances; partial indexes on sets; A2 report load repeated; ADR-023 later. |
| Guards left off | Named enable list + posted-line-immutable migration test. |
| Payroll sends department early | Refused with 422 until the HR-cache slice; noted for Payroll lead (L7). |

## 14. Questions for Jabran (recommendation first)

1. **Remove the old cost-centre and location columns from lines at the end of SB2d?** *Yes, in the last slice.*
   Only demo data exists, so two copies of the same fact for a release only add risk.
2. **Department on lines in SB2d?** *Not yet; refuse it until Accounts has HR's department list (small slice right
   after).* Accounts can't check a department without that list.
3. **Cost-centre maintenance (create, edit, deactivate, valid dates) in SB2d?** *Yes.* Projects and free dimensions
   get it too; read-only cost centres would be the odd one out.
4. **Per-account required/optional rules and account ranges (ADR D6)?** *Next slice after SB2d, before Sales.* Keeps
   this money change smaller; the rules test well on their own.
5. **Can an invoice or bill line have its own branch?** *No: the line always uses the document's branch; sending
   the same branch is accepted, a different one is refused.* One document belongs to one branch.
6. **How strictly to enforce "line branch = set branch"?** *A database link for every row with a branch, plus the
   nightly check.* Full protection without slowing large postings.
7. **Run the data conversion in one go during the deploy, with a backup first?** *Yes.* Only demo data; we time it
   on 5 million lines, and roll back by restoring the backup.
8. **Do advance lines carry dimensions?** *Yes; a deduction copies its advance's.* A project advance must land on the project.
9. **Journal header defaults?** *Keep only default branch and cost centre.* More can come with the pickers.
10. **Where does the shared `DimensionSetV1` type live?** *A new tiny shared module owned by the ERP lead.* Every
    service uses the same class.
11. **Keep the branch as a plain extra column on the balance tables?** *Yes.* Branch reports and checks stay fast
    without a join; a database link keeps it equal to the set.
12. **Keep the old flat API fields next to the new `dimensions`?** *Yes; refuse when both disagree.* The app keeps
    working until its picker slice.
13. **Report filters for every new dimension in SB2d?** *Yes, in SB2d-4, with empty filters left out of the export
    duplicate check.* Cheap once the join exists; Accounts-only companies need it.
14. **When is a free-dimension slot "used" and locked?** *As soon as any line combination holds one of its values
    (worked out, not stored).* Nothing extra is written while posting.
15. **Split the conversion and the balance change into two reviewed steps?** *Yes.* Each is a large money change;
    two smaller Opus reviews catch more than one big one.
