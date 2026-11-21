# ARCH-1 step 1: capacity model (rows, storage, load, jobs and hosting cost)

Researcher B, 2026-11-21. Brief: `docs/agents/arch1/brief.md` §"File 2", plus Jabran's two additions the same day
("consider all scenarios, it is a large-scale system" and "large scale data processing, data query and fetching").
Read-only research: no code, no sign-ups, no vendor contact. Every figure below is an **estimate** unless it is a quoted
price with a link. Prices were read on 2026-11-21. Code and doc paths: `BE/` = `NeoERP-BackEnd/`, `WS/` = the
workspace repo.

## 1. Summary for Jabran

- **POS is the database, not accounts.** One large retailer (15 branches, 1,200 receipts per branch per day) writes
  about **76 million rows and 44 GB a year**. 88 % of that is receipts, receipt lines, stock moves and fiscal logs. Its
  books are only about 1.6 GB a year, because POS posts daily summaries (inventory decision 12,
  `WS/docs/drafts/items-inventory-scope.md:686-687`).
- **Jabran's scenario (10 large retailers, one region):** about 760 million rows and 440 GB a year in the service
  databases, plus about 220 GB in the reporting store. That is **3.3 TB after 5 years and 6.6 TB after 10 years** if
  nothing is archived (PK keeps 10 years). ADR-024's "a few hundred GB per region" (`WS/docs/drafts/ADR-024-data-at-scale.md:8`)
  is right for accounts only. It is too low once POS and inventory exist.
- **Load is small. Size and recovery time are the limits.** At a Black Friday or Eid peak the 10 retailers send
  about 25 receipts a second, about 425 row writes a second. One Postgres server handles that easily. What one server
  per region cannot do for long is restore a multi-TB database inside a 4-hour recovery target. It also cannot keep
  vacuum and indexes healthy on tables of hundreds of millions of rows that have no partitions.
- **When the single shared database per region stops being enough:** at about **2–3 TB of hot data, or about 500
  mixed customers (about 25 large retailers) per region**. On the growth path in §4.3 that is around year 4–5. Steps
  before that cost little: monthly partitions, a read replica, moving the POS and inventory databases to their own
  server (ADR-001 makes this a configuration move), and archiving closed years. The next step after that is a
  second "cell" (a second complete database set) per region. Each cell costs about **USD 24,000 a month on AWS
  Stockholm, or about EUR 8,600 a month self-managed at Hetzner**.
- **Monthly hosting per region (AWS Stockholm / DigitalOcean / Hetzner self-managed):**
  - first customers: about USD 1,200 / USD 1,100 / EUR 500
  - scenario: about USD 6,900 / USD 8,200 / EUR 2,600
  - 200 customers: about USD 12,900 / USD 15,600 / EUR 4,300
  - 5,000 customers: about USD 121,000 / USD 143,000 / EUR 43,000 per region

  Pakistan: AWS UAE costs about 13 % more than Stockholm, but the data then leaves Pakistan. No Pakistani provider
  publishes prices (§7.3).
- **Biggest cost cuts that keep the quality bar:** 1- or 3-year reservations (−27 % or −47 % on the database), daily
  summaries into the books (already decided), closed years moved to object storage (about 10 times cheaper per GB),
  dev and staging switched off at night, and the replica, ClickHouse and OpenSearch added only on a measured trigger.

## 2. Sources read and assumptions

### 2.1 Our documents (read-only)

| What | Where |
|---|---|
| ADR-024 sizes, stages, triggers | `WS/docs/drafts/ADR-024-data-at-scale.md:8` (1 GB per million journal lines; "a few hundred GB per region"), `:35` (fastest-growing tables), `:39` (export jobs, 1M-line cap), `:60` (D3 keyset), `:62` (D5 pooling), `:63` (D6 replica trigger), `:64` (D7 partitioning trigger ≈ 100M rows / 50 GB), `:68` (D11 ClickHouse trigger), `:70` (D13 sizing), `:85-87` (stages 1 and 2, L7 dedicated instance) |
| ADR-023 large tenant and targets | `BE/docs/adr/ADR-023-reporting-layer.md:53` (facts partitioned by company and year), `:117` (events kept 90 days), `:135-143` (D14 tenant: 5,000 employees, 2M journal lines a year, 30 companies; p95 targets; rebuild ≤ 8 h) |
| ADR-001 one Postgres, a database per service | `BE/docs/adr/ADR-001-db-per-service.md:13` |
| ADR-007 / ADR-009 store edge | `BE/docs/adr/ADR-007-store-edge-topology-for-offline-retail.md:94-103` (offline cases, high-volume store standby), `:132` (store-server fleet cost grows with store count); `BE/docs/adr/ADR-009-edge-sync-endpoint-routing-and-idempotent-posting.md:18-19` (sales, stock moves and receiving are the highest-volume writes) |
| ADR-019 relay retention | `BE/docs/adr/ADR-019-domain-event-relay.md:104-107` (outbox and inbox kept 90 days) |
| ADR-020 file store | `BE/docs/adr/ADR-020-file-store.md:91-103` (retention classes), `:121-128` (sizes), `:219` (versions kept 35 days) |
| ADR-025 SSE and notifications | `WS/docs/drafts/ADR-025-realtime-notifications.md:58` (one stream per session, limits), `:76` (retention 90/180 days) |
| ADR-026 RLS overhead | `WS/docs/drafts/ADR-026-row-level-security.md:74` (one extra round trip per transaction, 0.1–0.3 ms) |
| Inventory volumes | `WS/docs/drafts/items-inventory-scope.md:680-688` (30 companies, 100,000 items, 300 locations, 20M stock moves a year; daily summaries) |
| Hosting rules | `BE/docs/operations/hosting-and-go-live-requirements.md:11` (H-1 regions), `:15` (H-5 nothing shared across regions), `:23` (P-1 object storage, versions 35 days), `:29` (P-7 PITR backups), `:41` (P-19 ISAE 3402), `:48` (P-26 768 MB per service container) |
| Retention | same file `:104` (NO 5 years), `:106` (SE through the 7th year), `:107` (DK 5 years; till rolls excluded), `:108-109` (FI 10 / 6 years), `:110-111` (IS 7 / 25 years), `:112-113` (PK 10 full years; tax 6 years) |
| Exactly-once posting | `WS/docs/drafts/accounts-roadmap.md:151` (outbox plus one key per source line) |
| Row shapes | `BE/services/accounts-service/src/main/resources/db/migration/V10__a1_journals.sql:158-184` (journal_lines: about 9 UUIDs, 3 numerics, a 300-character description; 4 indexes plus PK/unique by V62); `BE/services/audit-service/src/main/resources/db/migration/V1__audit_events.sql:1-25` (audit_events with `payload_text`, 4 indexes) |
| Chosen vendors | `WS/docs/agents/vendor-choices/email-provider.md:53` (SES USD 0.10 per 1,000 + 0.12 per GB; Essentials 0.16), `WS/docs/agents/vendor-choices/peppol-access-point.md:43` (Maventa price not published), `WS/docs/agents/vendor-choices/pk-fbr-route.md:203` (PRAL free) |

Note for the gap map: `WS/PROJECT-STATE.md:31` calls ADR-024/025 accepted, but the files still say "Draft" (`ADR-024-data-at-scale.md:4`).

### 2.2 Customer types (assumptions)

| Type | Companies | Branches / tills | Employees (self-service) | Back-office users | Basis |
|---|---|---|---|---|---|
| S small shop | 1 | 1 / 1 | 5 | 3 | 50 receipts a day, 3 lines each |
| M mid company | 3 | 5 / 1 shop | 100 | 30 | wholesale/services, 30,000 sales and purchase documents a year |
| L large retailer | 2 | 15 / 120 | 1,500 | 150 | 1,200 receipts per branch per day, 4 lines each, 360 days |
| F payroll-heavy factory | 1 | 3 sites, no POS | 5,000 | 60 | monthly payroll plus 2 bonus runs, 4 clock events a day |
| G group (ADR-023 D14) | 30 | 30 / mixed | 5,000 | 400 | 2M journal lines a year (`ADR-023:135`); about 20M stock moves (`items-inventory-scope.md:681`) |
| G50 group of 50+ companies | 50 | 50 | 8,000 | 650 | G × 50/30 |

Mixed portfolio for 50, 200, 1,000 and 5,000 customers: **70 % S, 20 % M, 5 % L, 3 % F, 2 % G**. This is an
assumption. Large retailers drive almost all the volume, so the model scales with the number of L customers. If the
real mix has twice as many L, double the POS figures.

Sensitivity: 1,200 receipts per branch per day is a mid figure. Large Pakistani supermarkets and Nordic grocery
chains can do 2,000–5,000, and fashion shops 200. Get the real figure from the first retail customer (decision J11).

### 2.3 Bytes per row (assumptions)

The figures include indexes, TOAST and about 20 % bloat. They are anchored to ADR-024's 1 GB per million journal
lines (`ADR-024:8`), which covers headers, indexes and balance rows.

| Row | Bytes | Reason |
|---|---|---|
| journal line | 1,000 | ADR-024:8 |
| POS receipt header (with tenders) | 700 | ids, totals, tender split, fiscal number |
| POS receipt line | 450 | item, qty, price, tax, discount, 2–3 indexes |
| stock move | 500 | item, location, qty, cost, source link, dimension set |
| AR/AP document / line | 1,500 / 900 | like journal lines plus party and tax detail |
| payroll line | 350 | employee, run, element, amount |
| attendance log / daily row | 250 / 200 | `db-design.md` §7.5–7.6 shape |
| audit event | 1,500 | `payload_text` (V1 audit) |
| notification incl. deliveries | 900 | ADR-025 D-rows, 180-day retention, so a steady state, not growth |
| loyalty transaction (future) | 350 | member, receipt, points, balance after |
| fiscal log per receipt | 1,200 | PK FBR DI request/response, NO cash-register journal entry |
| reporting store | +50 % of service data | facts at line grain and summaries (`ADR-023:47-52`); assumption |

Outbox, deliveries and inbox rows are kept 90 days (`ADR-019:104-107`). They are a steady state of about 25 % of a
year's events and are left out of yearly growth.

## 3. Volumes per customer type (rows per year)

| Module / row | S | M | L | F | G (30 cos) |
|---|---|---|---|---|---|
| POS receipts | 18,000 | 20,000 | 6,480,000 | 0 | 4,000,000 |
| POS receipt lines | 54,000 | 60,000 | 25,920,000 | 0 | 16,000,000 |
| Stock moves | 60,000 | 300,000 | 27,900,000 | 1,500,000 | 20,000,000 |
| Fiscal log (1 per receipt) | 18,000 | 20,000 | 6,480,000 | 0 | 4,000,000 |
| Loyalty earn and burn (future) | 6,300 | 6,000 | 3,000,000 | 0 | 1,800,000 |
| Journal lines (daily POS summaries + documents) | 12,000 | 400,000 | 1,600,000 | 600,000 | 2,000,000 |
| AR/AP documents | 1,000 | 30,000 | 40,000 | 25,000 | 150,000 |
| AR/AP document lines | 3,000 | 150,000 | 400,000 | 200,000 | 1,200,000 |
| Payroll lines (employees × runs × 40 elements) | 1,800 | 48,000 | 720,000 | 2,800,000 | 2,400,000 |
| Attendance logs / daily rows | 3,000 / 1,500 | 60,000 / 30,000 | 900,000 / 450,000 | 6,000,000 / 1,500,000 | 3,000,000 / 1,500,000 |
| Audit events (business changes, POS exceptions about 2 %) | 10,000 | 120,000 | 1,500,000 | 600,000 | 2,000,000 |
| Notifications created | 4,000 | 100,000 | 340,000 | 750,000 | 1,000,000 |
| **Total rows a year** | **0.19 M** | **1.34 M** | **75.7 M** | **14.0 M** | **59.1 M** |
| **Database GB a year** | **0.13** | **1.1** | **44.1** | **5.9** | **34.5** |
| of which POS, stock, fiscal and loyalty | 0.09 | 0.22 | 39.0 | 0.75 | 25.4 |
| of which books (journal lines) | 0.01 | 0.4 | 1.6 | 0.6 | 2.0 |
| Files a year (object storage: bills, issued invoices, payslips) | 0.16 GB | 4 GB | 8 GB | 9 GB | 30 GB |

Arithmetic for L: receipts = 15 branches × 1,200 × 360 = 6.48M; lines = 6.48M × 4 = 25.9M; stock moves = 25.9M
sales moves + 2M receiving, transfers and counts = 27.9M. That is consistent with the 20M a year assumed for the D14
tenant (`items-inventory-scope.md:681`). Journal lines = 15 branches × 360 days × 80 summary lines (POS) plus the same
for stock, about 0.86M, plus 0.6M from documents and 0.1M from bank and payroll, about 1.6M.

The loyalty line assumes 40 % of receipts carry a member who earns points and 5 % burn points. Each also updates one
stored member balance.

## 4. Scenarios: rows and storage per year, after 5 and 10 years

### 4.1 Totals (both regions together; storage includes the reporting store)

| Scenario | Rows a year (M) | Service DB GB a year | + reporting GB a year | Files GB a year | Receipt lines M a year | Stock moves M a year | Journal lines M a year | DB TB after 5 y | after 10 y, PK (10 y kept) | after 10 y, EU (7 y kept) |
|---|---|---|---|---|---|---|---|---|---|---|
| **Jabran: 10 large retailers** | 757 | 441 | 221 | 80 | 259 | 279 | 16.0 | 3.3 | 6.6 | 4.6 |
| Group of 50 companies | 98 | 58 | 29 | 50 | 27 | 33 | 3.3 | 0.4 | 0.9 | 0.6 |
| 50 mixed | 290 | 169 | 85 | 109 | 83 | 97 | 11.3 | 1.3 | 2.5 | 1.8 |
| 200 mixed | 1,158 | 677 | 338 | 436 | 333 | 388 | 45.3 | 5.1 | 10.2 | 7.1 |
| 1,000 mixed | 5,790 | 3,384 | 1,692 | 2,182 | 1,666 | 1,942 | 226 | 25.4 | 50.8 | 35.5 |
| 5,000 mixed | 28,952 | 16,921 | 8,460 | 10,910 | 8,329 | 9,710 | 1,132 | 127 | 254 | 178 |

How to read it: "after 5 y" = 5 × (service + reporting) at a constant customer count. The PK column keeps 10 years,
because PK books and vouchers are kept for 10 full years (`hosting-and-go-live-requirements.md:112`). The EU column
keeps 7 years, the Swedish rule (`:106`) and the longest common Nordic rule for vouchers. FI statements (10 years) and
IS annual accounts (25 years) are small and are left out.

These totals assume **nothing is archived**. With closed years moved to object storage (ADR-024 D9, `:65`), the hot
database holds about 2–3 years. The rest costs about 10 times less per GB (§7).

### 4.2 Per region

H-1 and H-5 give one deployment per region with nothing shared between regions (`hosting-and-go-live-requirements.md:11,15`).
The model assumes customers split **50 % EU/EEA and 50 % Pakistan**. That is an assumption; first market group:
Pakistan and Nordic together.

| Scenario | Per region: rows a year (M) | DB + reporting GB a year | Hot DB after 3 years (archiving on) | Held after 10 years |
|---|---|---|---|---|
| 10 large retailers, all in one region | 757 | 662 | 2.0 TB | PK 6.6 TB / EU 4.6 TB |
| 200 mixed (100 per region) | 579 | 508 | 1.5 TB | PK 5.1 / EU 3.6 TB |
| 1,000 mixed (500 per region) | 2,895 | 2,538 | 7.6 TB | PK 25.4 / EU 17.8 TB |
| 5,000 mixed (2,500 per region) | 14,476 | 12,691 | 38 TB | PK 127 / EU 89 TB |

PK customers keep 3 more years than EU customers. With the same mix, the PK region ends up about 40 % larger after 10
years.

### 4.3 Growth per year (a planning path, assumption)

Path: 20 → 50 → 200 → 500 → 1,000 → 2,000 → 3,000 → 4,000 → 5,000 → 5,000 customers in total, split equally between
the regions. An average mixed customer writes 5.1 GB a year including reporting, and 2.2 GB of files.

| Year | Customers (both regions) | New DB data TB a year per region | EU DB TB held (7 y) | PK DB TB held (10 y) | Files TB per region |
|---|---|---|---|---|---|
| 1 | 20 | 0.1 | 0.1 | 0.1 | 0.0 |
| 2 | 50 | 0.1 | 0.2 | 0.2 | 0.1 |
| 3 | 200 | 0.5 | 0.7 | 0.7 | 0.3 |
| 4 | 500 | 1.3 | 2.0 | 2.0 | 0.8 |
| 5 | 1,000 | 2.5 | 4.5 | 4.5 | 1.9 |
| 6 | 2,000 | 5.1 | 9.6 | 9.6 | 4.1 |
| 7 | 3,000 | 7.6 | 17.2 | 17.2 | 7.4 |
| 8 | 4,000 | 10.2 | 27.3 | 27.3 | 11.8 |
| 9 | 5,000 | 12.7 | 39.8 | 40.0 | 17.2 |
| 10 | 5,000 | 12.7 | 52.0 | 52.7 | 22.7 |

On this path one shared database per region is enough to about year 4, and with partitions and archiving to about
year 5. After that the region needs cells (§6).

## 5. Peak load and query load

### 5.1 Peak assumptions

| Peak | Factor (assumption) | When |
|---|---|---|
| Sale season (Black Friday, Christmas, pre-Eid days, Ramadan evenings in PK) | busiest day = 3 × an average day; busiest hour = 2 × that day's average, so **6 ×** the yearly average hour | Nov–Dec (EU); the two Eids, which move about 11 days earlier each year (PK) |
| Month-end close | back-office load × 3 for 2–3 days | last and first working days |
| Payroll day | 30 % of employees open self-service in the first hour, 10 requests each, × 3 in the first 20 minutes | the 1st or the last day of the month |
| Store reconnect after an outage | a store server drains 8 hours of receipts at 10 × the peak rate (ADR-007 case 1, `:94`) | any time |
| Worst case | all of the above on one day. In PK an Eid can fall at month-end on payday. | plan for it |

Tills talk to their **store server** (ADR-007). The cloud sees store-server sync calls and receipt batches, not
per-scan calls. A shop without a store server (S) sends about one call per receipt.

### 5.2 Requests and writes per second at peak (both regions together)

Back office: 50 % of users active at peak, each at 0.2 requests a second. Store sync: 0.5 calls a second per branch.
Each receipt writes about 17 rows: a header, 4 lines, 4 stock moves, 4 stored stock-balance updates, about 0.45
loyalty rows, a fiscal log row, outbox and inbox rows, and an idempotency key (ADR-009). SSE: 60 % of back-office users
and 5 % of employees signed in (ADR-025 D3, `:51-58`).

| Scenario | Back-office users | Employees | Back-office req/s | Payday self-service req/s | Store-sync req/s | Till receipts/s at peak | DB rows written/s at peak | Catch-up receipts/s after an 8-h outage (unthrottled) | Open SSE streams |
|---|---|---|---|---|---|---|---|---|---|
| 10 large retailers | 1,500 | 15,000 | 150 | 38 | 75 | 25 | 425 | 250 | 1,650 |
| Group of 50 companies | 650 | 8,000 | 65 | 20 | 25 | 3 | 44 | 26 | 790 |
| 50 mixed | 1,270 | 17,425 | 127 | 44 | 76 | 8 | 138 | 81 | 1,630 |
| 200 mixed | 5,080 | 69,700 | 508 | 174 | 305 | 32 | 552 | 325 | 6,530 |
| 1,000 mixed | 25,400 | 348,500 | 2,540 | 871 | 1,525 | 162 | 2,760 | 1,620 | 32,700 |
| 5,000 mixed | 127,000 | 1,742,500 | 12,700 | 4,360 | 7,630 | 811 | 13,800 | 8,110 | 163,000 |

Per region, take about half of each row. What this means:

- **Writes are not the limit.** One well-sized Postgres primary takes several thousand small writes a second
  (estimate; to prove with the large-tenant generator, `ADR-024:59`). Even 5,000 customers, about 6,900 rows a second
  per region spread over several cells, fit.
- **Catch-up after an outage must be throttled.** If every store in a region reconnects at once (for example after a
  WAN or cloud outage), unthrottled catch-up is 10 times the peak. Store servers should drain at a capped rate, with
  server-side admission per company. Exactly-once keys (`accounts-roadmap.md:151`) make retries safe, but they do not
  make them cheap.
- **API capacity:** at 1,000 customers, about 5,000 requests a second at the combined peak. With about 100–200
  requests a second per vCPU (estimate for plain JSON with RLS, `ADR-026:74`), that is about 30–50 vCPU of service
  containers per region. That figure is in the cost table.
- **Connections:** 8 services × several instances × Hikari 10 exceeds Postgres limits from about the scenario size.
  PgBouncer is needed then (ADR-024 D5, `:62`), after the advisory-lock fix N5.
- **SSE:** 163,000 open streams at 5,000 customers is about 82,000 per region. The proxy and the notification service
  need a load test (ADR-025 P-29, `:99`).
- **Loyalty:** about 11 point transactions a second at the scenario peak, which is easy. The design problem is burning
  points while a store is offline. It needs an offline limit like ADR-008, or burns refused while offline (J10).

### 5.3 Query targets and what each needs at what size

Targets marked (ADR-023) are written in `ADR-023:137-143`. The others are **proposed** here.

| Query | Target p95 (server) | Grows with | Needs at what size |
|---|---|---|---|
| Till item scan, price, stock check | ≤ 50 ms, local | items per store | Never the cloud: the store server holds items and prices (ADR-007). Cache down-sync by change feed. |
| List screens (receipts, moves, documents, journals) | ≤ 300 ms first page (proposed) | rows per company | **Keyset paging plus capped counts** once a list can pass about 100,000 rows (`ADR-024:60`). An L company passes that in **one week** of receipts (125,000 a week). Needed from the first large retailer. |
| Date-bounded lists and exports on POS and stock | ≤ 300 ms | rows per table | **Monthly partitions with partition pruning.** ADR-024 triggers at about 100M rows or 50 GB (`:64`). 10 retailers write 259M receipt lines a year, so they pass it in **about 5 months**. Build partitions into the first migration (J3). |
| Picker and type-ahead search | ≤ 200 ms (proposed) | items, parties | trigram indexes (`ADR-024 D8, D10`), now |
| Global search (Ctrl/⌘ K) | ≤ 500 ms (`ADR-024:67` trigger) | modules × rows | Fan-out first; OpenSearch only on that trigger |
| Document open | ≤ 300 ms (proposed) | lines per document | batched lookups (F6, `ADR-024:49`) |
| Stock on hand, open AR/AP, account balances | ≤ 300 ms | items × locations | **stored totals**, never sums at read time (`items-inventory-scope.md:682`; F1 fix `ADR-024:44`) |
| Module reports (TB, GL period) | ≤ 2 s (proposed) | lines per year | stored period balances, which exist today |
| KPI tile | ≤ 1 s (ADR-023) | facts | reporting summaries, short cache (about 60 s) |
| Cross-module report for one year | ≤ 3 s (ADR-023) | facts | **reporting store** from the first cross-module report |
| Sales analysis by item × branch × day | ≤ 5 s pivot (ADR-023) | receipt lines | Reporting store with daily item × branch summaries: about 10.8M rows a year per L (15 branches × 2,000 items sold a day × 360). At about **10–20 large retailers per region**, pivots over 50M facts likely fail on Postgres, which is the ClickHouse trigger (`ADR-024:68`). The load test decides. |
| Exports, SAF-T, SIE, statements, 10-year audit files | background job | rows exported | **read replica** once report and export load passes 30 % of primary CPU (`ADR-024:63`). Expected at the scenario's first year-end, or at about 100–200 mixed customers per region. |

## 6. Scale steps: when each is needed

ADR-024 stages, with the measure that triggers each and when each scenario reaches it. Per region.

| # | Step | Trigger (measure) | 10 retailers | 200 mixed | 1,000 / 5,000 mixed | Cost when added (AWS Stockholm, per month) |
|---|---|---|---|---|---|---|
| 1 | Indexes, keyset paging, capped counts, batched lookups (Stage 0/1) | list > 100,000 rows per company (`ADR-024:60`) | first L, week 1 | day 1 | day 1 | none (code) |
| 2 | Monthly partitions: POS receipts and lines, stock moves, fiscal log, loyalty, audit, outboxes | table > 100M rows or 50 GB, or vacuum > 1 h (`ADR-024:64`) | **month 5**; build in from the first migration | year 1 | day 1 | none (code); partitioning later is "the hardest change" (`ADR-024:92`) |
| 3 | PgBouncer and explicit pool sizes | pool sum > 70 % of `max_connections` (`ADR-024:62`) | year 1 | year 1 | day 1 | about USD 30 (a small container) |
| 4 | Read replica for reports and exports | reports and exports > 30 % of primary CPU at peak, or posting p95 worse during exports (`ADR-024:63`) | first year-end | year 1–2 | day 1 | USD 840 (r7g.2xlarge plus 1 TB) |
| 5 | Reporting store on its own instance (ADR-023, `ADR-024:68`) | first cross-module report; sales pivots | year 1 | year 1 | day 1 | USD 780 (r7g.2xlarge single-AZ, rebuildable) |
| 6 | POS and inventory databases on their own server (ADR-001 already splits databases by service) | one instance > about 2 TB hot, restore > RTO, or POS > 50 % of I/O | year 2–3 | year 2 | day 1 | about USD 3,100 (HA r7g.4xlarge plus 1 TB) |
| 7 | Archive closed years (L3; read-only, still visible, `ADR-024:65,109`) | hot DB > 2–3 TB, or the first retention expiry | year 3–4 | year 3 | year 1–2 | saves money: S3 USD 0.023/GB against HA gp3 about USD 0.24/GB |
| 8 | ClickHouse for analytics (L4) | D14 pivot target fails on the load test (`ADR-024:68`) | likely year 1–2 | likely year 2 | likely | 3 nodes about USD 1,000–1,500 (estimate, self-hosted on EC2) |
| 9 | Dedicated database for one very large or regulated customer (L7) | one tenant > about 20 % of region load or I/O, a contract or a regulator asks, or a G50 / 100-branch retailer | not needed | not needed | a few customers | HA r7g.2xlarge plus storage about USD 1,700; Hetzner about EUR 550; charge it to the customer |
| 10 | **Second cell per region** (a full database set plus services, with a tenant directory) | after steps 1–7, primary CPU > 60 % at peak, or hot data > 3 TB, or about 500 mixed customers (about 25 L) per region | not needed | not needed | **1,000: one cell per region at the limit; 5,000: 5 cells per region** | about USD 24,300 per cell (§7.2) |

Where the single shared database stops: the binding limits are **restore time and table maintenance, not CPU**. With
the proposed RTO of 4 hours (§8), a restore plus WAL replay of more than about 2–3 TB does not fit (§8). Without step 6
and step 7, the 10-retailer scenario reaches that in year 3–4. With them it lasts until about 500 mixed customers per
region. After that a second server per region means **cells**. A cell needs a tenant directory, routing at the gateway,
one sign-in across cells, and Flyway run per cell. That needs a new ADR, and the gap map covers it. Sharding inside
Postgres (Citus) stays rejected (`ADR-024:95`).

## 7. Monthly hosting cost per stage and region

### 7.1 Published prices used (read 2026-11-21)

Tags: P = provider page; 3P = third-party tracker or price API mirror; D = derived by us; E = estimate.

| Provider / item | Price | Tag | Source |
|---|---|---|---|
| AWS eu-north-1 RDS PostgreSQL single-AZ, monthly: m7g.large 2/8 GB 129; m7g.xlarge 4/16 258; r7g.large 2/16 179; r7g.2xlarge 8/64 717; r7g.8xlarge 32/256 2,866 (USD) | as listed | 3P | [bytebase r7g.large](https://www.bytebase.com/dbcost/rds/instance/db.r7g.large.md), [r7g.2xlarge](https://www.bytebase.com/dbcost/rds/instance/db.r7g.2xlarge.md), [m7g.large](https://www.bytebase.com/dbcost/rds/instance/db.m7g.large.md), [r7g.8xlarge](https://www.bytebase.com/dbcost/rds/instance/db.r7g.8xlarge.md) |
| AWS Multi-AZ = 2 × single-AZ (m7g.large 0.177 vs 0.354 USD/h) | 2 × | 3P | [sparecores m7g.large](https://sparecores.com/database/aws/db.m7g.large) |
| AWS r7g.4xlarge 16/128 (D: 2 × 2xlarge) 1,434; reservations r7g.large 1-yr 131 (−27 %), 3-yr 95 (−47 %) | | D / 3P | bytebase as above |
| AWS gp3 DB storage USD 0.115/GB single, 0.23 Multi-AZ; backup beyond the free allowance 0.095/GB (US East; Stockholm assumed 0.12 / 0.24 / 0.10) | | 3P + E | [cloudroutehq RDS pricing](https://cloudroutehq.com/aws/rds-pricing) |
| AWS S3 Standard USD 0.023/GB; egress 0.09/GB (first 10 TB); 100 GB a month free | | 3P / P | [AWS EC2 on-demand (free 100 GB)](https://aws.amazon.com/ec2/pricing/on-demand/) |
| AWS EC2 m7g.xlarge 4/16 0.1734 USD/h = 127/month; EKS control plane 73/month (0.10/h, not verified this pass); ALB about 35/month incl. LCU | | 3P / E | [sparecores m7g.xlarge](https://sparecores.com/server/aws/m7g.xlarge) |
| AWS me-central-1 (UAE): RDS m7g.large 150, xlarge 299, 2xlarge 599; r7g not offered for PG, r6g.large 202, xlarge 404, 2xlarge 809; gp3 0.14/GB; backup 0.1045/GB; S3 0.025; egress 0.11/GB; EC2 m7g.xlarge 146; Fargate 0.0526 per vCPU-h | | 3P (AWS Price List API, published 2026-11-20) | [AWS price list index](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonRDS/current/region_index.json), [bytebase m7g.large](https://www.bytebase.com/dbcost/rds/instance/db.m7g.large.md) |
| DigitalOcean managed PG Advanced: 2 vCPU/8 GiB from USD 130; standby and read-only node at the primary's price; storage 0.115/GiB. Standard edition limited to ≤ 4 GiB and no standby for new clusters from 2026-11-30; Advanced is in public preview. 8/32 about 480 (not verified) | | P / 3P | [DO PG pricing](https://docs.digitalocean.com/products/databases/postgresql/details/pricing/), [DO plan changes](https://docs.digitalocean.com/release-notes/upcoming/dbaas-plan-changes/) |
| DigitalOcean droplet General Purpose 4/16 USD 126, 8/32 252; DOKS HA control plane 40; LB 12 per node; Spaces 5 incl. 250 GiB, then 0.02/GiB; egress 0.01/GiB beyond 4–9 TiB per droplet | | P | [Droplets](https://www.digitalocean.com/pricing/droplets), [DOKS](https://docs.digitalocean.com/products/kubernetes/details/pricing/), [Spaces](https://docs.digitalocean.com/products/spaces/details/pricing/), [LB](https://docs.digitalocean.com/products/networking/load-balancers/details/pricing/) |
| Hetzner HEL1 (EUR, excl. VAT, after the 2026-04-01 and 2026-06-15 increases): CCX13 2/8 36.99; CCX23 4/16 73.49; CCX33 8/32 117.99; CCX43 16/64 234.99; CCX53 32/128 453.49; CCX63 48/192 725.49; 20–60 TB traffic included; LB21 21.49; Object Storage 6.49 incl. 1 TB, then about 6.35/TB. No managed Postgres. Volumes not verified (assumed EUR 0.05/GB) | | P | [Hetzner general purpose](https://www.hetzner.com/cloud/general-purpose/), [object storage](https://www.hetzner.com/storage/object-storage/), [load balancer](https://www.hetzner.com/cloud/load-balancer/) |
| UpCloud Helsinki managed PG (reference only): 4/16 HA about USD 294; 8/32 HA about 654; 16/64 HA about 1,391; 32/128 HA about 2,771; backups up to 31 days | | 3P | [sparecores UpCloud](https://sparecores.com/database/upcloud/rdb.standard.4CPU-16GB) |
| Pakistan local (Nayatel PostgreSQL DBaaS, Jazz Garaj, PTCL, RapidCompute, Sky47): **price not published**, quote needed. A third-party listing shows a PK VPS of 6 vCPU/16 GB for PKR 15,000 a month (about USD 54 at PKR 276.6 per USD) | | not published / 3P | [Nayatel DBaaS](https://www.nayatel.com/cloud/hosting/postgresql-dbaas), [whtop Blue Hosting](https://www.whtop.com/plans/bluehosting.pk/155541), [SBP rates 19 Nov 2026](https://www.sbp.org.pk/assets/document/weighted-average-customer-exchange-rates-19-November-2026.pdf) |
| AWS SES: USD 0.10 per 1,000 mails + 0.12 per GB of attachments (Essentials 0.16 per 1,000) | | P (our doc) | `email-provider.md:53` |
| Maventa / Inexchange Peppol: price not published | | — | `peppol-access-point.md:43` |
| PRAL (FBR DI): free | | — | `pk-fbr-route.md:203` |

No AWS, Google or Microsoft region is in Pakistan, and none has been announced (read 2026-11-21). The nearest are the
UAE, Bahrain and Mumbai. Pakistan's MoITT started accrediting cloud providers on 2026-05-26
([Profit](https://profit.pakistantoday.com.pk/2026/05/26/pakistan-launches-cloud-provider-accreditation-under-new-data-localization-push)).
That matters for government customers. For private books the open question stays ACC-R24, the PK legal opinion
(`hosting-and-go-live-requirements.md:93`).

### 7.2 What each stage runs (per region)

| Stage | Databases (vCPU/RAM, HA, storage) | Service nodes (4 vCPU/16 GB) | Other |
|---|---|---|---|
| Dev (hosted; local stays free) | 2/8 single, 50 GB | 1 | 50 GB objects |
| Staging | 2/8 single, 100 GB | 2 | LB, 100 GB objects |
| First customers (≤ 20 S/M and one large pilot) | 4/16 **HA**, 200 GB | 3 (each service × 2, P-26 768 MB) | LB, 0.2 TB objects, 0.2 TB egress |
| 10 large retailers | primary 16/128 HA 1 TB; replica 8/64 1 TB; reporting 8/64 single 0.5 TB | 10 | 1 TB egress, 1 TB extra backup |
| 200 customers in one region | primary 32/256 HA 1.5 TB; replica 16/128; reporting 16/128 | 16 | 2 TB egress |
| 500 per region (1,000 total), one cell | POS and inventory 32/256 HA 3 TB; other services 16/128 HA 1 TB; 2 replicas 16/128; reporting 32/256 | 40 | 5 TB egress, 4 TB extra backup |
| 2,500 per region (5,000 total) | 5 cells as above | 200 | — |

Every row adds 10 % for monitoring, KMS, secrets and logs (E). HA on Hetzner = 2 servers plus a small witness
(Patroni), with backups to object storage (pgBackRest or WAL-G).

### 7.3 Monthly cost per region (estimates from the prices above)

| Stage (per region) | EU: AWS Stockholm (USD) | EU: DigitalOcean FRA/AMS (USD) | EU: Hetzner Helsinki, self-managed (EUR) | PK-near: AWS UAE (USD; data outside PK) | PK local, self-managed (USD, E) |
|---|---|---|---|---|---|
| Dev (hosted) | 370 | 340 | 130 | 415 | 110 |
| Staging | 560 | 510 | 240 | 630 | 210 |
| First customers | 1,200 | 1,070 | 500 | 1,370 | 430 |
| **10 large retailers** | **6,900** | **8,240** | **2,590** | **7,840** | **2,550** |
| 200 customers | 12,900 | 15,640 | 4,260 | 14,610 | 4,660 |
| 500 per region (1,000 total) | 24,300 | 28,580 | 8,560 | 27,650 | 9,020 |
| 2,500 per region (5,000 total) | 121,400 | 142,700 | 42,800 | 138,000 | 45,100 |

Worked example, 10 retailers on AWS Stockholm:
- primary r7g.4xlarge HA: 1,434 × 2 + 1,000 GB × 0.24 = 3,108
- replica r7g.2xlarge: 717 + 120 = 837
- reporting: 717 + 60 = 777
- 10 nodes: 10 × 127 + 73 EKS = 1,343
- LB 35; objects 7; egress 900 GB × 0.09 = 81; extra backup 1,000 GB × 0.10 = 100
- subtotal 6,288 + 10 % = **USD 6,917**

Per customer that is about USD 690 per large retailer a month on AWS and about EUR 260 on Hetzner. At 200
customers it is about USD 64 per customer, and at 5,000 customers about USD 49.

Notes on the columns:
- **AWS** is the most managed option: Multi-AZ, PITR, KMS, SES in the same region (`email-provider.md:49`), and
  ISAE/SOC reports to rely on for P-19. It is the most expensive per unit.
- **DigitalOcean** large managed-Postgres sizes are estimates. Its HA edition is in preview and its regions are only
  Frankfurt and Amsterdam. Beyond the first customers it is not cheaper than AWS, so it is not a strong choice for
  large customers.
- **Hetzner** is about 60–65 % cheaper. We run Postgres HA, backups, upgrades and the P-19 control evidence
  ourselves. That costs about 0.5–1 SRE/DBA (not in the table), which is the price of keeping the same quality bar.
  Two 2026 price rises are a supplier risk.
- **AWS UAE** keeps Pakistan latency low but puts records outside Pakistan. It is usable only if the ACC-R24 opinion
  allows it, or with a full export kept in Pakistan.
- **PK local** is an estimate: self-managed nodes at about USD 15 per vCPU-month (4 GB per vCPU). That assumes about
  1.5–2 times the third-party VPS benchmark for an SLA tier. It needs quotes from Nayatel (the only local managed
  PostgreSQL found), Garaj and PTCL.

Vendors on top (both regions):
- **SES:** about 10,000 mails a month at the first customers costs about USD 1–2. 100,000 at the scenario costs about
  10–16. 5 million at 5,000 customers costs about 500–800, plus about 18 for attachments.
- **Maventa:** not published; ask in the RFI.
- **PRAL:** free.
- **APNs and FCM push:** free (not verified this pass).
- **Store servers** (ADR-007 `:132`): customer hardware, one per store plus a standby for high-volume stores. This is
  not hosting cost, but it should be budgeted in the retail offer.

## 8. Backups and recovery

Rules in force: PITR plus bucket versions to the same time, with keys stored apart (P-7, `:29`), and 35 days of
versions (P-1, `:23`; `ADR-020:219`). Proposed targets (J2): **RPO ≤ 5 minutes, RTO ≤ 4 hours** per region.

Assumptions (E): WAL ≈ 3 × the new data (full-page writes and indexes); compressed base backup ≈ 50 % of database
size; restore of a snapshot or pgBackRest ≈ 0.5–1 TB per hour; WAL replay ≈ 50–150 GB per hour.

| Size point (per region) | Hot DB | 35-day WAL | Backup storage held | Estimated restore (base + replay) | Fits a 4-h RTO? |
|---|---|---|---|---|---|
| First customers | 0.05 TB | < 10 GB | < 0.1 TB | < 15 min | yes |
| 10 retailers, year 1 | 0.66 TB | 130–190 GB | about 0.5 TB | 1–2 h | yes |
| 10 retailers, year 3 (no archiving) | 2.0 TB | 130–190 GB | about 1.2 TB | 2.5–5 h | borderline |
| 10 retailers, year 5 (no archiving) | 3.3 TB | 130–190 GB | about 1.8 TB | 4–8 h | **no**: needs step 6 or 7 |
| 500 per region, year 1 | 2.5 TB | 0.75 TB | about 2 TB | 4–9 h | **no**: one cell per region already, with the POS database split |
| 2,500 per region | 5 cells × about 2.5 TB | per cell | per cell | per cell 4–9 h; cells restore in parallel | per cell, after the split |

Restores must also be tested (P-19 needs tested restores, `:41`), and a restore drill needs the same server size for a
few hours. Budget one extra primary-sized instance for 4–8 hours a month (AWS scenario: about USD 10–20 a month).
Services restart after a restore (P-22, `:44`).

## 9. Heavy jobs: sizes, durations and compute

Estimates. Each must be proven with the large-tenant generator and k6/Gatling scripts (`ADR-024:59`) before the first
large customer.

| Job | Size | Estimated duration | Compute | Runs on | Note |
|---|---|---|---|---|---|
| Payroll run, 5,000 employees (F, G) | 5,000 × 40 elements = 200,000 lines (about 70 MB); reads 150,000 attendance rows | calculation 1–2 min at 20 ms per employee per core on 4 workers; payslip PDFs 5,000 × 150 ms ≈ 2 min on 8 threads (about 0.5 GB of files) | 4–8 vCPU for about 5 min | primary (writes), workers | Posting is a summary journal of ≤ 1,000 lines (A5). On payday, 38 req/s of self-service. G50 with 8,000 employees takes about 1.6 times as long. |
| Month-end close, group of 50 companies | about 280,000 journal lines a month; depreciation, accruals, FX revaluation of about 10,000 open items per company, ledger check | 10–30 s per company: about 10–25 min in sequence, 3–6 min on 4–8 workers | 4–8 vCPU | primary | Year-end reads the whole year (3.3M lines, about 3.3 GB) in 2–5 min; a YE journal can hold up to 100,000 lines (`V10:162`). |
| Re-costing after a back-dated move, large retailer | typical: one item at one location, about 15 later moves; worst usual case: a late landed-cost bill for 2,000 items across 15 branches, 2 months back, about 300,000 moves | ms; 1–3 min | 2 vCPU | primary, in batches | A month re-run (about 2.3M moves) takes 10–20 min and writes about 2–3 GB of WAL, so it must be throttled and batched (B5). Summarised days get a further summary (`items-inventory-scope.md:743`). |
| 10-year audit export, large retailer | about 620M rows (receipts 65M, lines 259M, moves 279M, journal 16M); about 90 GB CSV, about 10–15 GB zipped | about 3.5 h at 50,000 rows/s | 2–4 vCPU plus replica I/O | **replica** | Today's export cap of 1M lines per job (`ADR-024:39`) cannot do this. It needs per-year, per-type chunked jobs or a streamed archive format (decision J8). |
| 10-year audit export, group of 50 | journal 33M + documents 12M lines (about 45M rows, 7 GB CSV) | about 15 min | 2 vCPU | replica | fits a chunked job |
| Reporting store: normal flow | 10 retailers: about 720,000 facts a day (8 a second on average, about 50 a second at peak) | continuous; ≤ 60 s event to report (ADR-023) | 1–2 vCPU | reporting instance | event-fed (ADR-023 D2), not a nightly batch |
| Reporting store: nightly | summary roll-ups, retention purge, watermarks | 10–30 min | 2 vCPU | reporting instance | |
| Reporting store: full rebuild of the largest tenant | L with 10 years: about 275M facts | about 4 h at 20,000 facts/s | 4–8 vCPU | reporting instance, beside the old version (`ADR-023:115-119`) | Within the 8-h target (`ADR-023:143`). Per tenant, never the whole region at once. |
| Archive a closed year (step 7) | detach a monthly partition, copy, verify, drop | minutes per month of data | 2 vCPU | primary plus object storage | legal controls ACC-R6 (`:75`) |

Job compute in the cost table: 2–4 of the service nodes per region act as a separate worker pool from the scenario
size up.

## 10. Noisy neighbours in one shared database

Risk: one large customer's heavy jobs slow everyone in the region. Examples are a 10-year export, a year-end close, a
month re-cost, a reporting rebuild or a store catch-up storm. Postgres shares CPU, I/O, buffers, WAL, autovacuum
workers and connections. It cannot cap CPU per tenant inside one server.

| Control | Effect | Cost |
|---|---|---|
| Per-company job caps: 2 per instance, 3 queued per company (exists for exports, `ADR-024:39`); extend to every heavy job with one global queue that is fair per company | one tenant cannot fill the job workers | code only |
| Statement and lock timeouts per role; `work_mem` caps for job roles | runaway queries stop | code and config |
| Heavy reads on the replica (D6) and reporting work on its own instance (D11) | exports and reports leave the primary | replica USD 840, reporting USD 780 a month (AWS, scenario) |
| Separate worker pool from the request-serving pods | API latency stays flat during jobs | 2–4 nodes, USD 250–500 a month |
| Rate limits and admission per company at the gateway; throttled store catch-up | storms queue instead of spreading | code only |
| Batched, throttled backfills and re-costs (B5) | WAL and replica lag stay bounded | code only |
| Per-tenant metrics (`pg_stat_statements` by role or company tag, job time per company) | finds the neighbour | observability (N1) |
| Dedicated database for a tenant above about 20 % of region load (L7) | full isolation | about USD 1,700 a month on AWS or EUR 550 on Hetzner, charged to the customer |
| Cells (step 10) | limits the blast radius to one cell | about USD 24,000 per cell |

The controls in the code-only rows cost little and belong in Stage 1. The replica and the worker pool are the first
paid steps.

## 11. Where cost can be cut without lowering the quality bar

| Cut | Saving | Why quality stays |
|---|---|---|
| 1- or 3-year reservations on database and nodes once the first large customers sign | −27 % / −47 % on RDS (r7g.large 179 → 131 / 95) | same servers |
| Stockholm instead of Frankfurt (AWS) | about −16 % (r7g.large 179 vs 212) | EEA, closer to the Nordics |
| Graviton (ARM) instances, already assumed | about −10–20 % against x86 (E) | JVM runs on ARM |
| Daily summaries into the books (inventory decision 12, already decided) | keeps Accounts at about 1.6 GB a year per L instead of about 30 GB | detail stays in the stock ledger |
| Monthly partitions plus archiving closed years to object storage | HA gp3 about USD 0.24/GB against S3 0.023/GB, about 10 × | still readable (ADR-024 Q10) |
| Replica, ClickHouse and OpenSearch only on a measured trigger (ADR-024 Q11) | USD 1,000–3,000 a month deferred | triggers are measured |
| Reporting store single-AZ, rebuilt from snapshots after a failure | half the HA price | reports lag after a failure, books unaffected (J7) |
| Dev local; staging off nights and weekends | about −60 % on staging | production unchanged |
| Right-sized containers (P-26 768 MB), scaling by instances | fewer nodes | memory limits |
| Self-managed Postgres (Hetzner, or PK local) | about −60–65 % of hosting | only with a funded SRE/DBA and the same P-19 controls |
| Compressed JSON and ETags | egress cut by about half or more (E) | same data |

## 12. Decisions Jabran will need

| # | Decision | Recommendation |
|---|---|---|
| J1 | Provider per region | EU: AWS Stockholm for the first customers (managed HA, PITR, KMS, SES, assurance reports); revisit Hetzner self-managed when a funded SRE exists. PK: get quotes from Nayatel (local managed PG), Garaj and PTCL. AWS UAE only if the ACC-R24 opinion allows records outside Pakistan. |
| J2 | Recovery targets | RPO ≤ 5 min, RTO ≤ 4 h per region. This sets the about 2–3 TB hot-data limit per database server. |
| J3 | Partition POS receipts and lines, stock moves, fiscal log, loyalty and audit by month **from their first migration** | Yes. 10 retailers pass ADR-024's trigger in about 5 months, and adding partitions later is the hardest change. Amend ADR-024 D7. |
| J4 | Correct ADR-024 sizes and the load test | "A few hundred GB per region" becomes "several TB with POS". Add a large-retailer profile (15 branches, 6.5M receipts a year) to the generator next to the D14 tenant (`ADR-024:59`, P-24). |
| J5 | Cells as the next step after one server per region | Accept as the direction at about 500 mixed customers or 25 large retailers per region. Needs a new ADR (tenant directory, routing, sign-in, Flyway per cell). |
| J6 | Archive closed years (L3) earlier than "Stage 2" | Plan it for when hot data passes 2 TB (scenario year 3), with ACC-R6 controls. |
| J7 | Reporting store availability | Single-AZ plus rebuild (cheaper) or HA. Recommend single-AZ until a customer contract asks for report availability. |
| J8 | 10-year audit and statutory export at retail size | Replace the 1M-line cap with chunked per-year jobs on the replica. |
| J9 | Dedicated database or cell for very large or regulated customers | Offer it as a priced option (about USD 1,700 a month on AWS). |
| J10 | Loyalty burn while a store is offline | Bounded offline limit like ADR-008, or online-only burn. |
| J11 | Confirm volume inputs with the first retail and payroll customers | receipts per branch per day, lines per receipt, employees, mix of customer types |
| J12 | Reservations | Commit to 1-year reservations at the first two large contracts. |
| J13 | Store catch-up throttling | Capped drain rate per store and admission per company. Add it to ADR-009. |

## 13. Not verified (check before using a number in a contract)

- AWS Stockholm gp3, backup, ALB, EKS and egress prices are from third-party pages or US-East figures; check them in
  the AWS Pricing Calculator.
- DigitalOcean Advanced sizes above 8 GiB, and its backup and PITR terms.
- Hetzner Volumes price, and whether the CCX servers can be ordered (the order buttons showed "currently
  unavailable").
- Every Pakistani provider price (none published), the Nayatel Tier III claim, and PK local SLA terms.
- All throughput, restore-speed and job-duration figures are estimates until the large-tenant load test runs.
