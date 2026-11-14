# ADR-024: Data at scale — large databases, search and analytics

## Status
Draft (ERP lead, 2026-11-14, Opus planner; lead-checked F1, the session advisory locks and the Postgres 15/16 mismatch). Not accepted. Answers ADR-023 Q3 (store engine) and Q4 (sizes) from the database side. Waiting on Jabran's Q1–Q12. Moves to `NeoERP-BackEnd/docs/adr/` when accepted.
**Unverified (check before acceptance):** cloud-warehouse regions (no Pakistan region for BigQuery/Snowflake) and managed-Postgres extension availability were taken from general knowledge, not provider docs.

## Summary (plain English)
**Do not add Elasticsearch, BigQuery or similar now.** Postgres can hold all the data at the sizes we expect (≈ 1 GB of accounts data per million journal lines; the ADR-023 D14 tenant ≈ 20 GB after 10 years; a few hundred GB per region). The real risk is slow queries in our own code, which costs nothing to host to fix. Steps, in order: measure → better indexes and paging → connection pooler → read copy for reports/exports → split the biggest tables by year. Search: Postgres text search first (it has Norwegian, Swedish, Danish, Finnish), OpenSearch only on a measured trigger. Analytics: the ADR-023 store starts on Postgres; ClickHouse (self-hosted in each region) if load tests fail the targets; BigQuery/Snowflake not as our engine (residency, unpredictable cost), only as a customer's own export destination.

### Background
| Idea | Plain English |
|---|---|
| Index | Book index: jump to rows instead of reading every page. Each index slows writes a little. |
| Query plan | How Postgres will run a query; `EXPLAIN ANALYZE` shows it and the real time. |
| Working set | The often-used data (mostly the current year). If it fits in memory, a big database is still fast. |
| Offset vs keyset paging | "Page 400" reads and discards 19,950 rows; keyset ("50 after the last one") reads only 50. |
| Stored totals | Totals kept up to date at posting; reports read thousands of totals, not millions of lines. Accounts does this. |
| Partitioning | One big table split by year, still looks like one; old years stop changing; archive a year in one step. |
| Read replica | Read-only copy a few seconds behind; heavy reports run there. |
| Pooler (PgBouncer) | Lets many services share few real connections. |
| Vacuum | Cleans old row versions; if it falls behind, tables bloat. |
| Row vs column store | Postgres = whole rows (best for records). ClickHouse/BigQuery = columns (fast big sums, poor single-row updates). |
| Search engine | OpenSearch keeps a separate ranked, typo-tolerant text copy; one more system to run, secure, sync, keep in region. |

## 1. Today, measured from code (paths under `NeoERP-BackEnd/services/`)
Paging
- Accounts GL and journal listing reports: **keyset** + fixed snapshot, HMAC-signed cursor (`ReportJdbcAdapter.kt:231,244-245,311,325-326`). The pattern to copy.
- Accounts journal list: offset, page ≤ 200, full `count(*)` per page, `ILIKE '%…%'` (`JournalJdbcAdapter.kt:102-125,380,578`).
- Customer/supplier lists: offset + `count(*)` + per-row `CROSS JOIN LATERAL` summing all the party's documents, receipts, refunds (`ReceivablesReadJdbcAdapter.kt:62-67,261-288`; `PayablesReadJdbcAdapter.kt:46-51,111`).
- AR/AP documents, receipts, payments, refunds: offset, `LIKE '%…%'`.
- user-service and org-service lists: offset; batch loads per page done properly. One `Pageable.unpaged()` membership read (bounded per company).
- hr-service: **in-memory paging** of whole tables (deprecated helper, 7 call sites). Due for the HR rebuild (P-17).
- audit-service: offset by `createdAt DESC`.

Fastest-growing tables: `journal_lines` (≈ 2M/yr for D14, ≈ 1 GB), AR/AP document lines, entry/document events, `account_period_balances` (grows with dimension combinations, 2.6M at 5M lines), outboxes/inboxes (90-day churn, retention job exists), `audit_events` (likely largest by rows), HR attendance, payroll items.

Indexes: `journal_lines_gl_idx` matches the GL keyset order exactly; party index; AR/AP company-leading indexes. **Not used anywhere:** `pg_trgm`, `tsvector`, BRIN, partitioning, `pg_stat_statements`, `CREATE INDEX CONCURRENTLY`, `lock_timeout`.
Stored balances: period/year balances maintained by the engine in batches; AR/AP open amounts stored on documents, but party lists still sum at read time. Possible extra write load: `ix_account_year_balances_report` INCLUDEs amounts, so updates can't be HOT (verify).
Exports: TB direct; GL/listing direct ≤ 10,000 lines, else background job (2 per instance, 3 queued per company, `SKIP LOCKED`, one REPEATABLE READ snapshot, 5,000-row chunks, file store, 7 days). SIE is a file job. Caps 1M lines.

Findings
| # | Finding | Where | Effect |
|---|---|---|---|
| F1 | Party list `count(*)` and "with balance" filter run the balance lateral for every party (lead-verified) | `ReceivablesReadJdbcAdapter.kt:61-63`; `PayablesReadJdbcAdapter.kt:46-47` | 50,000 customers × 1M documents read on every list load. Biggest risk. |
| F2 | `platformReachableCompanyIds` loads all companies | `org-service/…/OrgAuthorization.kt:70` | Grows with tenants, runs on auth checks |
| F3 | `CompanyService.list()` unpaged | `CompanyService.kt:235` | Grows with tenants |
| F4 | HR in-memory paging; `findAll()` across companies | hr-service | Whole tables; P-17 |
| F5 | `(:companyId IS NULL OR …)` filters | `EmployeeJpaRepository.kt:26-35` | Cached plans lose the index; weakens isolation |
| F6 | One lookup per account/tax code on document detail | Ar/ApDocumentReadService, Receipt/PaymentReadService | ~300 queries on a big document |
| F7 | Exact `count(*)` per list page | offset lists | Costs as much as the filter |
| F8 | Leading-wildcard LIKE without trigram index | lists, pickers | Full company scan per keystroke |
| F9 | Org event lease sorts whole backlog | backlog Org S1 | Known |
| F10 | Untagged dimension `IS NULL` subqueries miss partial indexes | backlog SB2d-4 (5) | Known |

Platform: no Hikari settings (default 10 per instance; 8 services × instances can hit 100 connections); **session-level advisory locks** (lead-verified) in `ExportJobJdbcAdapter.kt:297-327`, `LedgerCheckJdbcAdapter.kt:132-140`, `OrgSyncJdbcAdapters.kt:164-172` break behind a transaction-mode pooler; only `health,info` exposed so metrics can't be collected; random UUID v4 on high-volume rows; **local compose runs Postgres 15** (`infra/compose.yml:19`), target 16.

## 2. Decision
- **D1** Postgres is the system of record and first tool. Any new engine needs a measured trigger, an ADR amendment and Jabran's approval; it stays in the source's region (H-5).
- **D2 Measure first:** `pg_stat_statements`, `auto_explain` (> 500 ms), slow log, Prometheus on an internal port with Hikari metrics; per-table vacuum/HOT/size watch. **Large-tenant generator** (extend the P-24 load check to D14 size: 30 companies, 20M lines, 5,000 employees) + k6/Gatling scripts; every threshold checked against it.
- **D3 Code rules:** keyset for lists that can pass ~100,000 rows per company (journals, AR/AP docs, receipts, payments, audit, attendance, payroll lines), offset fine for small lists, page size capped; capped counts ("10,000+"); no in-memory paging (architecture test); no optional-tenant filters; batch lookups; large-table migrations with `CREATE INDEX CONCURRENTLY`, `lock_timeout`, batched online backfills, VACUUM after bulk changes; UUID v7 for new high-volume rows.
- **D4 Fix hot spots:** F1 via stored per-party balances or lateral only for the page rows; F2/F3 via `parent_company_id IN (…)` and paging; F4/F5 in the HR rebuild; balance tables `fillfactor` 80–90, check HOT ratio.
- **D5 Pooling:** explicit Hikari sizes (5–10); move session advisory locks to transaction-level or lease rows (prerequisite, also fixes the export-lock backlog item); PgBouncer when pool sum > 70 % of `max_connections` or before multi-instance of > 2 services. RLS `SET LOCAL` stays safe.
- **D6 Read replica** per region for exports, SIE, TB, GL, statements, reporting backfills; writes stay on primary. Every page of a report and every job chunk runs on the same server (snapshot cursors); prove with a lagging-replica test. Trigger: report/export load > ~30 % primary CPU at peak or posting p95 worsens during exports.
- **D7 Partitioning:** `audit_events` monthly (≈ 50M rows or purging starts); outboxes/inboxes monthly (if retention deletes show); `journal_lines` then document lines by **posting year** (≈ 100M rows / 50 GB / vacuum > 1 h) after a design spike (drafts have no entry_date; keys must include the partition key; no FKs reference journal_lines; triggers on partitioned tables; RLS on parent, no rights on partitions); not by company (thousands of partitions). Balances not partitioned.
- **D8 Index types:** B-tree default; BRIN on append-only time columns; GIN trigram with `btree_gin` for name/code/number search.
- **D9 Archiving** per company after close and retention (ACC-R6: 5–25 years); closed partitions stay readable read-only; past-retention data exported to the file store then deleted only through ACC-R6 controls.
- **D10 Search:** now `pg_trgm` for pickers/lists and full-text (nb/sv/da/fi dictionaries; `simple` for Icelandic/Urdu); global Ctrl/⌘ K bar = each module's `GET …/search?q=&limit=5` filtered by its own permissions, merged in parallel. OpenSearch later when fan-out p95 > 500 ms with trigram, typo-tolerant cross-module search is needed, attachment text is wanted (Q8) or > ~6 sources. Then: one cluster per region, shared index per entity routed by company, fed by ADR-019 events, ADR-023 D5 security, erasure handled, nothing sensitive indexed; ≥ 3 nodes per region.
- **D11 Analytics:** ADR-023 store on Postgres in its own instance per region. Trigger for ClickHouse (same region, facts and summaries only, behind the same API): D14 targets fail (pivot over 50M facts ≤ 5 s, standard report ≤ 3 s p95). Cloud warehouses rejected as internal engine; DuckDB only for one-off extract jobs.
- **D12 Customer BI:** first a read-only OData pull feed (ADR-023 Q6); later opt-in Parquet/CSV extracts to customer-owned destinations (Q2).
- **D13 Sizing:** per region one managed Postgres primary (all service DBs) + HA standby + PITR; grow by scale-up → replica → pooler → separate reporting instance. Size `max_wal_size`/temp for the largest migration (P-24).

## 3. Roadmap
Stage 0 — now, no new infrastructure
| # | Step | Effort | Risk |
|---|---|---|---|
| N1 | Observability (D2) | S | Low |
| N2 | Code rules + architecture test | S | Low |
| N3 | Large-tenant generator + load scripts | M | Low |
| N4 | Fix F1, F2, F3 | S–M | Medium (balances must match; reconciliation tests) |
| N5 | Session advisory locks → transaction-level/leases | S–M | Medium |
| N6 | UUID v7 for new high-volume rows | S | Low |
| N7 | Local Postgres 15 → 16 | S | Low |
| N8 | Batched detail lookups (F6) | S | Low |

Stage 1 — before the first large customer: B1 keyset cursors + capped counts (backend + app "load more") M; B2 trigram indexes, module search endpoints, global search fan-out M; B3 autovacuum/fillfactor per table + bulk-change runbook S; B4 explicit Hikari sizes, PgBouncer at threshold (after N5) S–M; B5 online migration discipline M; B6 journal_lines partition spike + BRIN S; B7 reporting-service on Postgres (ADR-023) L; B8 read replica with same-server routing, only if N3 shows the trigger M.

Stage 2 — only on a measured trigger: L1 partition journal/document lines (L, high); L2 time partitions for audit/outboxes (M); L3 archive closed years (L, legal); L4 ClickHouse (L); L5 OpenSearch (L); L6 customer BI extracts (M); L7 dedicated instance for one very large customer (L).

Hosting rows to add (numbers assigned at merge, after ADR-025's): Postgres 16 with `pg_stat_statements`, `auto_explain`, `pg_trgm`, `btree_gin`, Prometheus on an internal port; explicit pool sizes and capacity check, no session advisory locks before PgBouncer; large-tenant load test passed before the first large customer, results in `db-design.md`.

## 4. Consequences
No new hosting cost now (first spend: observability + generator). Big lists move to cursors and "load more". Each later engine is one more thing per region to run, secure, back up and prove isolation/erasure on — hence measured triggers. Partitioning `journal_lines` is the hardest change; the spike is early for that reason. Extensions become hosting requirements next to P-10.

## 5. Alternatives rejected now
OpenSearch for all search now (cluster per region, second copy of personal data, duplicated permission logic); BigQuery/Snowflake as engine (residency, processor/DPA, cost, still need our own permission layer); Citus sharding (solves write limits we don't have); one shared replica for all modules' reporting (breaks ADR-001); partition by company (too many partitions).

## 6. Open questions for Jabran
| # | Question | Recommendation |
|---|---|---|
| Q1 | Add Elasticsearch/BigQuery now? | No. Postgres first; each engine comes back with numbers. |
| Q2 | Push customer data to their own warehouse, possibly outside our region? | Not in release 1; pull feed first; later opt-in, customer-owned destination, DPA, legal sign-off. |
| Q3 | Do reporting copies, indexes, replicas count as records that must stay in Pakistan? | Assume yes until the PK legal opinion; rules out cloud warehouses for PK. |
| Q4 | Same for Iceland? | Same rule; decide with the Iceland hosting decision. |
| Q5 | Hosting provider must offer Postgres 16 + extensions, readable replicas, pooler, PITR, both regions? | Yes, add to the provider checklist. |
| Q6 | ADR-023 D14 sizes as load-test target? | Yes, plus a 3× headroom run. |
| Q7 | Dedicated database for very large customers? | Not now. |
| Q8 | Search inside attachment text? | Not in release 1; later Accounts only, own security review. |
| Q9 | Who may search for people? | Only those who can already see them; names only. |
| Q10 | Archived years readable in the app? | Always, read-only, until retention ends. |
| Q11 | Approve replica/OpenSearch/ClickHouse budget now or per trigger? | Per trigger, with metric, load-test result and monthly cost. |
| Q12 | "10,000+" and "load more" on very large lists? | Yes; exact totals stay on reports. |

## 7. Tests and acceptance
Generated D14 tenant meets p95 targets (pickers, lists, GL, TB, exports) before the first large customer, recorded in `db-design.md`. Keyset lists return every row exactly once while posting continues; deep pages plan like page 1. Replica: report finishes on its starting server; lagging-replica test shows no gaps. Two-company tests on every search endpoint, partitioned table and replica route; direct partition queries refused for the runtime role. Search never shows records without view permission. Pooler: export, ledger-check, org-sync concurrency tests green. Partition spike: identical posting, reversal, triggers, ledger check, SIE export results.
