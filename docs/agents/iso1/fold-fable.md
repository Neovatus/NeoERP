# ADR-026: Fable 5.2 views folded into the draft

Drafter: Opus, 2026-11-21, for Jabran before he decides D1–D11.
Source: `docs/agents/iso1/fable-decisions.md`. Target: `docs/drafts/ADR-026-row-level-security.md` on `phase/4-b2-iso1b`.
Every point was checked read-only against `NeoERP-BackEnd` on `phase/4` at d0dd5441. `ACC` means `services/accounts-service/src/main/kotlin/com/neovatus/accounts`.

Result: all 39 points (one row each) folded. Three were folded with a correction, because the code showed part of Fable's statement to be inexact (D3, D8, D11). No point was rejected.

## Decisions

| Point | Result | Where in the draft | Check and note |
|---|---|---|---|
| D1 add: later business services ship RLS in their first migration | Folded | Summary; M1; D1 | Agree statement, no code to check. |
| D2 audit-service gets a dated go-live row | Folded | Option C text; M8; R7; D2; ERP-Q4 line | Confirmed: nullable `org_id`, optional filter (`services/audit-service/.../V1__audit_events.sql:4,11`; `AuditController.kt:26-30`). Fable gave two dates ("before the first customer, or before HR/Payroll v2 audit rows land"); the draft recommends **before the first production customer**, because HR v2 audit rows in dev hold demo data only. Jabran may pick the earlier one. The go-live row itself goes into the BE go-live file when the ADR is accepted (not in this worktree). |
| D3 (1) outbox appends scope-first | Folded with correction | M3 last bullet; D3 | Audit append has no scope: confirmed (`AuditOutboxJdbcAdapter.kt:26`, `AccountsAuditWriter.kt:121`). **Correction:** the domain-event append already takes `CompanyTenantScope` first (`ACC/application/port/outbound/audit/AuditOutboxRepositories.kt:111-115`, `DomainOutboxAdapter.kt:20-23`). The substance still holds: it is a system repository, which the aspect does not wrap. The draft moves both company appends to a scope-first tenant-owned port. |
| D3 (2) aspect inside the transaction advice, with a test | Folded | M3; §5 test 3b | Confirmed: 33 JDBC adapter files use `@Transactional(MANDATORY)`, e.g. `ArReceiptJdbcAdapter.kt:38`; jobs open `REQUIRES_NEW` first (`LedgerCheckJob.kt:42-52`). |
| D3 (3) Flyway init SQL is the one session-level setting | Folded | M2 | It follows from M5 as written: Flyway's init SQL runs per connection, so it cannot be `SET LOCAL`. |
| D4 bank re-encryption and the key check reshaped in R2 | Folded | §1.3 table; M6 inventory; D4 | Confirmed: both read every company in one transaction (`BankDetailsReencryption.kt:24-88`, `BankKeyChecks.kt:13-66`). Added: loop over every company in `accounts_setups` whatever its state, so no ciphertext is skipped. |
| D5 (1) Flyway as a non-superuser owner in Testcontainers | Folded | M5 rule 1; §5 test 6; D5 | Confirmed: local owner is the superuser (`application-local.properties:12`, `scripts/accounts-db-roles.sh:20`). |
| D5 (2) Flyway callback fails without the flag | Folded | M5 rule 2; §5 test 6; D5 | Confirmed: `V42__statement_layouts_and_chart_2026_4.kt` runs `Pack2026_4.write`, which updates every company's accounts (`Pack2026_4.kt:95-118`). |
| D5 (3) name the backup role | Folded | M5 roles table; D5 | Plain Postgres behaviour: `pg_dump` errors when RLS would filter rows. |
| D6 (1) inventory incomplete | Folded | §1.3 table; M6 inventory; D6 | See missing item 2. |
| D6 (2) policy names the job per table | Folded | M6 step 1; §5 tests 5 and 7; D6 | Design point. The catalog list becomes (table, command, job). |
| D6 (3) no mixing of system, platform and company binds | Folded | M3; §5 test 3; D6 | Design point. |
| D6 (4) company selection reads `accounts_setups` only | Folded | M6 step 1; D6 | Confirmed: `companiesWithActiveTemplates` uses `EXISTS` on `recurring_journals` (`RecurringJournalJdbcAdapter.kt:623-635`). With a system policy on `accounts_setups` only, it would find no company. |
| D7 correction: the platform policy is on `accounts_setups` | Folded | M7; §5 test 7; D7 | Confirmed: every usage query reads `accounts.accounts_setups` (`PlatformCatalogJdbcAdapters.kt:102,126,137,166`); templates and tax packs are reference tables. |
| D8 R2 and R3 as one merge | Folded with correction | R2+R3 row; D8 | **Correction:** Fable says local accounts-service "already connects as `neoerp_accounts_app`". It does only when `ACCOUNTS_DB_USER` is set, as `docs/local-demo-data.md:284` says. Without it, `scripts/run-all-services.sh:112-118` warns and connects as the owner. The conclusion still holds for the documented setup, so the merge is folded. |
| D8 budget for superuser-only test statements and own-container suites; guard test | Folded | R2+R3 row; §5 test 6 | Confirmed: `session_replication_role = replica` in 10 Accounts test files (`AdvancePaymentTest.kt:389`, `LedgerCheckJobTest.kt:130`); `Phase2ApiSuiteTest.kt:341` has its own container. |
| D9 "untouched" vs "dropped", said in words | Folded | R4; D9; Q1 note | Confirmed against the HRP-DES change list (`NeoERP-worktrees/hrp-des/docs/drafts/hr-payroll-design-refresh.md`, H1.2, decision 2, still a recommendation pending with Jabran). |
| D10 three earlier dates | Folded | R6a, R6b; D10 | Confirmed: ERP-Q2 pen test is "4 weeks before the first production customer, on the hosted stage" (`NeoERP-BackEnd/docs/operations/hosting-and-go-live-requirements.md:127`). |
| D11 `audit_outbox` company policy `FOR INSERT` only | Folded with correction | M6 `audit_outbox` paragraph; §5 test 5; D11 | Confirmed for `audit_outbox`: a plain `INSERT` with no `RETURNING` (`AuditOutboxJdbcAdapter.kt:26-48`). **Correction:** Fable says "the same shape fits the domain-event outbox". It does not quite fit: the shared library inserts with `RETURNING` (`shared/domain-events/.../JdbcOutboxStore.kt:33-45`), and Postgres checks a `RETURNING` row against the `SELECT` policy. The draft gives that outbox `INSERT` plus `SELECT` for the company, or has the library drop the `RETURNING`. |

## Open questions

| Point | Result | Where | Check and note |
|---|---|---|---|
| Q1 "untouched" and "dropped" cannot both hold | Folded | Q1 note; D9 | Q1's recorded answer is kept word for word. A dated note below it says that its RLS order ("Accounts first (R1–R3), then Payroll/HR (R4)") is replaced by Fable's order in §4. **For Jabran:** that order was part of the answer recorded as yours on 2026-11-21 (commit 4145549), so please confirm the change when you decide. |
| Q2 do not depend on the provider admin; per-service owner role | Folded | Status line; M5; Q2; R6a | Design point. Whether the provider lets us create such roles is still unchecked in provider docs (R6a). |
| Q3 no branch-level RLS | Folded | Q3 | Agree. |
| Q4 group consolidation loops per company | Folded | Q4 | ADR-023 D13 is at `NeoERP-BackEnd/docs/adr/ADR-023-reporting-layer.md:129-131`. |

## Rollout

| Point | Result | Where | Check and note |
|---|---|---|---|
| R0 Lane 0 already merged; stale line numbers | Folded | §1.1; R0; all arch-test line numbers | Confirmed: the ratchet is at `TenantRepositoryArchitectureTest.kt:29-41`. The old branch name `phase/4-lane0-be` was replaced by `phase/4` (overseer's flag). |
| R1 first, widened to hr-service and payroll-service roles | Folded | §4 intro; R1; D10 | Confirmed: only `accounts-runtime-role.psql` and the Accounts `RuntimeRoleCheck` exist. The draft also says the HR/Payroll rebuild starts now in parallel (Jabran 2026-11-21, `PROJECT-STATE.md` HRP-2). |
| R4 after R1, not after R2–R3; HR v2 suites as the runtime role | Folded | R4; §4 cost note | Design point. |
| R2 and R3 together, after the inventory | Folded | R2+R3 row; M6 inventory | See D8. |
| R5 unchanged | Folded | R5 (BI check added from missing item 8) | — |
| R6 split | Folded | R6a, R6b | — |
| Cost of R4 before R2–R3 | Folded | §4 | — |

## Missing items

| # | Point | Result | Where | Check and note |
|---|---|---|---|---|
| 1 | Say what RLS does not stop; reporting runs no user SQL | Folded | M9; Summary; §6 Risks | ADR-023 builds self-service queries at run time (`ADR-023-reporting-layer.md:68`). It does not say "no user SQL" in those words, so M9 states it as a new rule. |
| 2 | Six cross-company paths outside the arch test | Folded | §1.3 table; M6 inventory; §6 Risks | Confirmed all six. The name filter is `endsWith("Repository")` (`TenantRepositoryArchitectureTest.kt:26`); the four ports and two classes are at the lines Fable gave. |
| 3 | "No rows" must not read as "all clear" | Folded | M2 (`neoerp_required_company()`); M4; §5 tests 2 and 7a | Confirmed: `remaining()` counts through RLS (`BankDetailsReencryption.kt:85-88`), and the gauges count all companies (`RecurringJournalJdbcAdapter.kt:637-643`). This adds a fifth flag function. HRP-DES X.2 still says "the four M2 flag functions" and needs a one-word update if this is accepted. |
| 4 | Roles for backup, money checks, support | Folded | M5 roles table; R6b | Confirmed: `scripts/money-invariants.sh:29` defaults to the `neoerp` superuser. |
| 5 | A missing app role fails the migration | Folded | M5 rule 3; §5 test 6 | Confirmed: `IF EXISTS (SELECT 1 FROM pg_roles …)` in V62, V68, V69 (`:130`) and V71. |
| 6 | Start-up drift check compares every policy | Folded | M5; §5 test 6 | Design point. |
| 7 | Catalog tests: foreign keys, no definer function, raw connections | Folded | §5 test 5 | Checked: about 272 foreign keys in Accounts migrations, 228 of them with `company_id` (Fable: 228 of 270). No `SECURITY DEFINER` in any migration. The three raw `dataSource.connection` uses are at the lines Fable gave. |
| 8 | Direct BI access | Folded | M9; R5 | — |
| 9 | Rollback is not routine | Folded | §4 Rollback paragraph | The old text said "one down-migration per service". It now says a forward migration, Jabran's decision each time, audited. |

## Found while checking (not from Fable)

| Point | Where | Evidence |
|---|---|---|
| The audit dispatcher runs single statements outside any transaction, so a `SET LOCAL` system bind needs one. `bindSystemJob` opens a transaction as the company aspect does. | M6 | `AuditOutboxJdbcAdapter.kt:15-20` (class comment). |
