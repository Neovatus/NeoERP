# ADR-026: Row-level security — a second wall per company

## Status
Draft (ISO-1, Opus planner, 2026-11-21). Not accepted. Answers go-live gate ERP-Q4 and process review C3 (b). Makes ADR-012 Phase 4 concrete. Waiting on Jabran's D1–D10. No build starts before acceptance. Moves to `NeoERP-BackEnd/docs/adr/` when accepted.
Evidence paths are under `NeoERP-BackEnd/` unless they start with `docs/` (workspace). Line numbers are from `phase/4` at e36b6c6a.
**Unverified (check before acceptance):** whether the chosen managed-Postgres provider's admin role is a true superuser or has `BYPASSRLS` (it decides whether the Flyway owner can be held to `FORCE`); taken from general knowledge, not provider docs.

## Summary (plain English)
**Turn on Postgres row-level security (RLS) for the services that hold company money and people data: Accounts now, Payroll and HR in their rebuilds from their first migration, and the reporting store (already decided in ADR-023).** Leave org-, user-, audit- and auth-service on application checks plus route tests for now; they are platform services whose normal reads cross companies by design. Each transaction tells the database its one company with `set_config('neoerp.company_id', …, true)` (the same as `SET LOCAL`). A shared aspect does this from the `CompanyTenantScope` that ADR-012 already forces into every tenant repository call. No setting means no rows. The app role never owns tables and never has `BYPASSRLS`. Cross-company machine jobs and Super Admin platform reads get narrow, named policies on only the tables they need. This is a safety net under ADR-012, not a replacement.

### Background
| Idea | Plain English |
|---|---|
| RLS | Postgres adds a hidden `WHERE company_id = …` to every query on a table, whatever the app wrote. |
| Policy | The rule a table uses (`USING` for reads, `WITH CHECK` for writes). |
| `ENABLE` / `FORCE` | `ENABLE` turns the rules on for other roles; `FORCE` also holds the table owner to them. Superusers always skip RLS. |
| `BYPASSRLS` | A role attribute that skips every policy. The app must never have it. |
| `SET LOCAL` / `set_config(…, true)` | A value that lasts only until the transaction ends, so a pooled connection carries nothing to the next borrower. |
| Owner vs runtime role | Flyway migrates as the owner; the service connects as a role that owns nothing (P-5). Accounts already works this way. |

## 1. Today, measured from code
### 1.1 How each of the 8 services scopes by company
| Service | DB | Company check today | Repository scoping | Evidence |
|---|---|---|---|---|
| accounts | `neoerp_accounts` | `ServiceAuthorization` (fresh IAM permission at company, then entitlement) issues `CompanyTenantScope` | 43 `@TenantOwnedRepository` ports, scope first; no baseline entries; 76 JDBC adapters use `scope.companyId` in SQL (541 uses) | `shared/neoerp-security/.../authz/ServiceAuthorization.kt:60,91,132`; `architecture-tests/.../TenantRepositoryArchitectureTest.kt:236-240` (comment: "Accounts has no legacy baseline entries") |
| hr | `neoerp_hr` | `@PreAuthorize` (79) with client `companyId` checked via `/api/authz/effective` | 14 tenant-owned ports; 59 legacy baseline lines + 3 "awaiting ADR-012"; optional filters `(:companyId IS NULL OR …)`; `findAllByBranchId` unscoped | `EmployeeJpaRepository.kt:22,28-29`; `TenantRepositoryArchitectureTest.kt:371-377`; ADR-012:235-250 |
| payroll | `neoerp_payroll` | `@PreAuthorize` (32); **no company column in any of 12 tables**; served only in `local`/`test`, 503 elsewhere | 9 tenant-owned ports, 39 baseline lines, e.g. `findByPeriod(periodId)` | `PayrollTenantIsolationGateFilter.kt:33,44`; `PayslipRepository.kt:7-13`; go-live P-17 (`hosting-and-go-live-requirements.md:39`) |
| org | `neoerp_org` | `OrgAuthorization` beans in `@PreAuthorize` (61); Super Admin reaches many companies | no ADR-012 classification; not scanned by the arch test; `companyRepository.findAll()` on auth checks | `OrgAuthorization.kt:65-71` |
| user (IAM) | `neoerp_iam` | `UserAdminAuthorization` in `@PreAuthorize` (83); tenant column is `org_id` | not classified; memberships are read across companies by user | `RoleController.kt:47`; `MembershipRepository.kt:109`; `V3__iam_rbac_core.sql:65-70` |
| audit | `neoerp_audit` | `@PreAuthorize` (10); notifications by `caller.userId`; `orgId` optional filter | not classified | `AuditController.kt:26`; `NotificationController.kt:54,66`; `WorkflowRepositoryAdapter.kt:38,67-68` |
| auth | `neoerp_auth` | identity and token store; no company data | — | 9 tables, none company-bound |
| api-gateway | none | routes only | — | — |

The arch test imports only hr, payroll and accounts ports (`TenantRepositoryArchitectureTest.kt:21-25`), though its build file also pulls in org (`architecture-tests/build.gradle.kts:22-27`). Lane 0 (`phase/4-lane0-be`, brief item 5) adds user, audit, auth and the gateway. Machine work uses `SystemTenantScopes.forCompany` with a company from a trusted machine source (`SystemTenantScopes.kt:23-50`). Platform-wide reads need `PlatformTenantAccess` and one allowlisted port (`TenantRepositoryArchitectureTest.kt:262-265`).

### 1.2 Which tables hold company data (counted from the migrations; tenant column `company_id`, or `org_id` in user/audit)
| Service | Tables | Company-bound | Not company-bound |
|---|---|---|---|
| accounts | 115 | 97 | 18: reference (`currencies`, `tax_packs`, `coa_templates`, `journal_types`, report layouts…), `audit_outbox`, `org_sync_state`, `bank_key_checks`, event consumers/subscriptions |
| hr | 21 | 6 | 15 child/master tables (attendance, leave, shifts, performance, history) — company only through `employees` |
| payroll | 12 | **0** | all 12 (P-17) |
| org | 28 | 19 | 9: `companies` itself, agreements and addenda, relationship history, event tables |
| user | 29 | 13 | 16: users, permissions catalogue, platform roles/staff, role links |
| audit | 4 | 3 (`org_id` nullable) | `notification_delivery_attempts` |
| auth | 9 | 0 | all (identity data) |

### 1.3 What already exists that RLS can reuse
- **Runtime role, Accounts only:** `neoerp_accounts_app` is `NOSUPERUSER … NOBYPASSRLS`, owns nothing, has no DDL (`infra/postgres/initdb/accounts-runtime-role.psql:16,21,31-41`). Flyway runs as the owner (`AccountsServiceContextTest.kt:36-40,172-173`). `RuntimeRoleCheck` refuses to start when the datasource role is a superuser, bypasses RLS or owns tables (`RuntimeRoleCheck.kt:18-19,47-61`). `DatabaseRoleTest.kt:20-44` proves it. Other services have no runtime role yet (go-live P-5, `hosting-and-go-live-requirements.md:27`).
- **Transaction-local settings already in production code:** the posting guard sets `accounts.posting_journal_id` with `set_config(…, true)` and a trigger reads it (`JournalJdbcAdapter.kt:279,287`; `V10__a1_journals.sql:297,313`). RLS uses the same pattern.
- **Zero RLS today:** no `ROW LEVEL SECURITY` in any migration (process review C3).
- **Local and test Postgres run as a superuser:** compose `POSTGRES_USER: neoerp` (`infra/compose.yml:22`); the Testcontainers fixture uses that user (`BooksFixture.kt:309,326-328`; 88 of 456 accounts test files use the fixture). A superuser skips RLS, so today's tests would neither break nor prove anything once RLS is on.
- **Cross-company machine paths in Accounts:** 21 `@Scheduled` jobs in 15 classes; 11 Accounts system repositories on the reviewed allowlist (export, SIE and journal-import queues, bank notices, evidence cleanup, opening-import expiry, ledger check, audit and domain outboxes, org event inbox, org sync state) (`TenantRepositoryArchitectureTest.kt:281-361`). The ledger check already works one company per transaction (`LedgerCheckJob.kt:55-77`). The event relay writes `company_id NOT NULL` on outbox/inbox rows and consumers open a scope per event (ADR-019:92-95).
- **Session advisory locks** in export, ledger check and org sync (ADR-024 §1). They do not conflict with `SET LOCAL`, but they block a transaction-mode pooler (ADR-024 D5).

## 2. Options
| | A. No RLS, stronger tests | B. RLS on Accounts + rebuilt Payroll (and HR, reporting) — **recommended** | C. RLS on every company table in all services |
|---|---|---|---|
| What | Keep ADR-012 only; add L17 cross-company route tests, two-company adapter tests, skip-check (P-16) | Policies on every company-bound table in accounts, payroll v2, hr v2, reporting store | B plus org, user, audit (`org_id`) |
| Build cost | S (route-test generator already planned, L17) | M for Accounts (97 tables, one aspect, jobs); ~0 extra for Payroll/HR if done in their first migration | L: user and org read across companies on almost every auth path; needs many platform policies |
| Risk it removes | A wrong route; not a wrong SQL in a covered route that tests miss | A missing or wrong `company_id` predicate on money and people data, including native SQL and new reports | Same, plus IAM/org rows |
| New risk | None | Missing setting → empty result (fails closed, visible in tests); job paths need care | High chance of false denials on auth paths; outages look like permission bugs |
| Performance | none | One extra round trip per transaction (~0.1–0.3 ms); predicate matches company-leading indexes (ADR-024 §1) | Same, but on the hot auth path of every request |
| Flyway | none | Each new company table ships `ENABLE`/`FORCE` + policy; a catalog test fails a table without it | Same, in 3 more services |
| Testcontainers | more tests | RLS suite connects as the runtime role; later the fixture's app connection too | Same, in every service |
| Seeds | none | Seeds run as superuser locally; unaffected | Same |
| Reporting/read models | app-only | Matches ADR-023 ("RLS from day one", group view = one query per company) | Same |
| Platform jobs, Super Admin | unchanged | Named per-table system and platform policies (§3.5–3.6) | Many more such policies (IAM, org, audit) |
| Go-live ERP-Q4 | Does not meet it | Meets it for money and personnel data | Meets it fully, latest |

Option A is rejected as the end state: C3 asks for a second layer, and a test only proves the paths someone wrote a test for. Its tests are still required under B (ADR-012 acceptance 4, L17). Option C is rejected now: org and IAM are where "which companies can this person reach" is computed, so their legitimate reads cross companies; RLS there gives little and costs the most. Revisit audit-service when it is split by company (D8).

## 3. Decision (mechanism for option B)
**D1. Scope.** RLS on every company-bound table of accounts-service now; of payroll-service and hr-service from their rebuild's first migration; of the ADR-023 reporting store from its first migration. Platform reference tables (no `company_id`) get no RLS and stay read-only for the runtime role.

**D2. One company per transaction, from the existing scope.**
- Setting name: `neoerp.company_id`. Read only through one owner-owned function:
  `neoerp_current_company()` = `NULLIF(current_setting('neoerp.company_id', true), '')::uuid`, `STABLE`. The `NULLIF` matters: after a pooled connection has once used `SET LOCAL`, the setting reads as `''`, not NULL, in the next transaction.
- Set by a shared `TenantTransactionBinder` (new, in `shared/tenant-security`): `SELECT set_config('neoerp.company_id', :id, true)` on the transaction's connection (`DataSourceUtils`, so JDBC and JPA share it).
- Called by a Spring aspect around every bean that implements a `@TenantOwnedRepository` interface. ADR-012 already guarantees the first argument is `CompanyTenantScope` (`TenantRepositoryArchitectureTest.kt:148-172`), so the aspect needs no per-method code.
- Per transaction: first call binds and remembers the company (transaction resource); same company again does nothing; **a different company in the same transaction throws** (no mixing). With no transaction active the aspect opens one (`REQUIRED`) around that call, so the setting never falls into autocommit.
- Session-level settings are forbidden: an architecture test fails on `set_config('neoerp.…', …, false)` or `SET neoerp.` without `LOCAL` in main code.
- Pool safety: the value dies at commit or rollback, before Hikari gets the connection back; also safe behind a transaction-mode PgBouncer (ADR-024 D5).

**D3. Policies (same shape on every table).**
```sql
ALTER TABLE accounts.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts.journal_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY company_isolation ON accounts.journal_lines
  FOR ALL TO neoerp_accounts_app
  USING (company_id = (SELECT neoerp_current_company()))
  WITH CHECK (company_id = (SELECT neoerp_current_company()));
```
The `(SELECT …)` form is evaluated once per query, so the planner still uses `company_id`-leading indexes. HR v2 / Payroll v2 child tables carry their own `company_id NOT NULL` (composite FKs `(company_id, parent_id)`, as `docs/drafts/hr-payroll/HR-PAYROLL-LEAD-REVIEW.md:147-148`), so no policy needs a join. Views, if any, are `security_invoker = true`. Triggers and functions stay `SECURITY INVOKER`.

**D4. Missing setting = deny.** No setting → `NULL` → no row matches; reads return nothing and writes fail `WITH CHECK`. The aspect and binder log a `TENANT_SETTING_MISSING` security event when a write fails this way, so it shows in tests, not as silent emptiness in production.

**D5. Roles.**
| Role | Who | Attributes | RLS |
|---|---|---|---|
| `neoerp_<svc>_owner` | Flyway only | owns schema; **not superuser, no `BYPASSRLS`** in hosted stacks | `FORCE` holds it; data migrations run with `neoerp.migration = 'on'` (Flyway init SQL) and a policy `TO owner USING (current_setting('neoerp.migration', true) = 'on')` |
| `neoerp_<svc>_app` | the service | `NOSUPERUSER NOBYPASSRLS NOINHERIT`, owns nothing (as today) | company policy, plus D6/D7 policies on named tables |
`RuntimeRoleCheck` (FAIL outside local/test) gets one more check: every company-bound table has `relrowsecurity` and `relforcerowsecurity`. Locally the owner is the `neoerp` superuser and skips RLS; that is accepted for dev only.

**D6. Cross-company machine jobs.** Two steps, never one wide query over company data:
1. **Claim/select** on the system tables already on the allowlist (queues, outboxes, inboxes, `accounts_setups` for the LIVE list): an extra policy `FOR SELECT, UPDATE … USING (current_setting('neoerp.system_job', true) IS NOT NULL)` exists **only on those tables**. The binder's `bindSystemJob(name)` sets it; an arch test lets only the packages already named in `SYSTEM_ALLOWLIST` call it. A wrong system bind therefore cannot reach `journal_lines`.
2. **Work** for each claimed row in its own transaction under `SystemTenantScopes.forCompany(row.companyId, …)`, which binds the company as in D2. The ledger check is already shaped this way (`LedgerCheckJob.kt:55-77`); its port changes from `companyId: UUID` to the scope.
Event consumers already open a scope per event (ADR-019 D7). The domain-event feed reader is a system job on the outbox table only.

**D7. Super Admin and platform-wide reads.** Enter-company sessions already get a normal `CompanyTenantScope` (`ServiceAuthorization.kt:91`), so they need nothing new. A `@PlatformWideRepository` adapter binds `neoerp.platform_access = <operationId>` from `PlatformTenantAccess`; a `FOR SELECT` policy for it exists only on the tables that port reads (today the chart-template and tax-pack usage counts). No platform write policy exists (ADR-012 §3). The arch test lets only `PLATFORM_WIDE_ALLOWLIST` adapters call `bindPlatform`.

**D8. Not in scope now.** org, user, audit and auth keep application checks, the 8-service arch test (Lane 0) and the L17 route tests. Audit is reconsidered when `org_id` becomes NOT NULL or audit holds money or personnel detail.

## 4. Rollout and migration
| Step | What | Size | Gate |
|---|---|---|---|
| R0 | Accept this ADR; Lane 0 arch test covers all 8 services | — | Jabran |
| R1 | `TenantTransactionBinder`, aspect, `neoerp_current_company()`, session-setting ban, binder unit tests | S | lead review + 2nd reviewer (security) |
| R2 | Accounts: one migration `ENABLE`/`FORCE` + policy on all 97 company tables, D6 policies on the system tables, D7 policy on the catalog tables; extend `RuntimeRoleCheck`; ledger-check port takes a scope | M | RLS suite (§5) green as runtime role |
| R3 | Accounts: switch the fixture's app connection to `neoerp_accounts_app` (owner keeps seeding) and fix every path that read without a scope | M | full accounts suite green |
| R4 | Payroll v2 and HR v2: `company_id NOT NULL`, composite keys and RLS in the **first** migration; no baseline entries allowed; old tables dropped, no backfill (dev has no legacy data to keep) | in the rebuild | P-17 closes |
| R5 | Reporting store (ADR-023) ships with RLS | in its build | — |
| R6 | Hosted stacks: owner and app roles per RLS service, owner not superuser, `RuntimeRoleCheck` FAIL | S per stack | P-5, ERP-Q4 |
Rollback: one down-migration per service (`DISABLE ROW LEVEL SECURITY`, drop policies); the binder stays harmless without policies.

ERP-Q4 is met when R1–R3 are done for Accounts, R4 for any of HR/Payroll that serves the customer, and R6 on the production stack. Then the go-live row moves to Done with the RLS suite's test names as evidence.

## 5. Tests and acceptance
1. **Company A cannot read B:** for every company-bound table, a Testcontainers test as `neoerp_<svc>_app` binds A and counts B's rows = 0; insert or update with B's `company_id` fails. Generated from the catalog, so a new table is covered without new code.
2. **Missing setting denies:** in a fresh transaction with no bind, every company-bound table returns 0 rows; on a pooled connection that served A in the previous transaction, still 0 (the `''` case).
3. **No mixing:** binding B after A in one transaction throws; nothing commits.
4. **Pool:** 2 threads × 1 connection pool, alternating A and B 1,000 times, never see the other's rows.
5. **Catalog check:** every table with a `company_id` column has RLS enabled and forced and a `company_isolation` policy; an unlisted exception fails the build.
6. **Roles:** app role is not superuser, has no `BYPASSRLS`, owns nothing (extends `DatabaseRoleTest`); owner without `neoerp.migration` sees 0 company rows.
7. **Jobs and platform:** system bind sees queue rows of A and B but 0 `journal_lines`; platform bind sees only the catalog tables; the arch test rejects a call to either bind from another package.
8. These tests may not be skipped silently: the suite fails when Docker is missing (P-16, L18).
9. Measured: posting and GL report p95 on the ADR-024 large-tenant data differ by < 5 % with RLS on.

## 6. Consequences
Positive: a missed `company_id` in Accounts, Payroll, HR or reporting returns nothing instead of another company's data; native SQL and new report queries are covered; the posting-guard and runtime-role work is reused.
Negative: one more migration rule per table; a job or adapter that forgets its scope now fails (by design) and needs fixing; tests must run as the runtime role to mean anything; two small policy families (system, platform) to review.
Risks: a broad `neoerp.system_job` policy creeping onto business tables (the catalog test lists where it may exist); a hosted owner that is secretly a superuser (`RuntimeRoleCheck` and the go-live check); developers mistaking RLS for authorization (ADR-012 checks stay mandatory).

## 7. Decisions for Jabran
| # | Decision | Recommendation |
|---|---|---|
| D1 | Which option? | **B**: Accounts now, Payroll v2 and HR v2 from their first migration, reporting store from day one. |
| D2 | RLS on org, user, audit, auth too? | **No, not now**; app checks + 8-service arch test + L17 route tests. Revisit audit later. |
| D3 | Setting carried per transaction by a shared aspect from `CompanyTenantScope`? | **Yes**; session-level settings banned by test. |
| D4 | One company per transaction (group views loop per company)? | **Yes**, as ADR-023 already says. |
| D5 | `FORCE` on the owner too, with a migration flag for data migrations? | **Yes** in hosted stacks; locally the superuser owner is accepted. |
| D6 | Cross-company jobs through narrow per-table system policies on one pool, or a separate DB role and pool? | **Per-table policies, one pool** (fewer connections, ADR-024 D5); separate role only if a reviewer finds a path a policy cannot contain. |
| D7 | Super Admin platform reads through a read-only policy on named tables only? | **Yes**; no platform write policy. |
| D8 | Accounts tests switch to the runtime role (R3), not only a separate RLS suite? | **Yes**, right after R2; it is what makes the existing 88 fixture tests prove RLS. |
| D9 | Payroll/HR rebuild drops old tables with no backfill? | **Yes** (dev only, no customer data); a backfill plan is needed only if any environment holds real payroll data. |
| D10 | When must it be done? | Accounts R1–R3 before the first production customer (ERP-Q4); HR/Payroll in their rebuild before they serve a customer (P-17). |

## 8. Open questions
- Q1. Is a Payroll/HR rebuild active now or after Phase 4? It decides whether R4 lands before R2 (`PROJECT-STATE.md:45` asks the same).
- Q2. Which hosting provider? Its admin role must not bypass RLS (unverified line above).
- Q3. Should branch-level RLS ever exist? Recommendation: no; a branch is a tag on the company's books (RULES §7), and branch access stays an application rule.
- Q4. Franchise and group (RULES §7–§8): a franchise is its own company, so RLS keeps the group out of its rows; group consolidation reads each company under its own scope. Confirm no screen needs one query over several companies.

## Related decisions
ADR-001 (database per service), ADR-012 (tenant query isolation; Phase 4 is this ADR), ADR-016 (security checks), ADR-019 D7 (event relay tenant rules), ADR-023 (reporting with RLS from day one), ADR-024 D5 (pooling); go-live P-5, P-16, P-17, ERP-Q4; process review C3; lessons L17, L18.
