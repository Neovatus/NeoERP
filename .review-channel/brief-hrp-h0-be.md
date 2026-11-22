# Brief: HRP-H0-BE — HR/Payroll v2 foundation: v1 deleted, new schemas with RLS from the first migration (BackEnd, 2026-11-22)

**Workstream:** PROJECT-STATE HRP-2, step **H0 foundation** (H1 screens/APIs wait for R29b-3U and AL-REST-BE).
**Repo / lane:** NeoERP-BackEnd. The lead cuts BE `phase/hrp-v2` from `origin/phase/4` (`16d9a3f` at writing); this lane is
`phase/hrp-v2-h0-be` from it, worktree `NeoERP-worktrees/hrp-h0-be`. Copy this file to `docs/agents/hrp-h0/brief-be.md` as the first commit.
**Slicing:** L37 style B (one lane per feature per repo). **Security / company-isolation lane** (migrations, RLS, roles).
**Builder:** Opus 5.5 high, **old Mac** (test Mac, 36 GB): targeted runs through `scripts/gradle-job.sh be <dir> <args>` slots (L34).
**Reviews:** fresh Opus + Fable security (diff + brief only, independent). **Twin:** `brief-hrp-h0-app.md` (parallel; no API between them).

## Goal
hr-service and payroll-service hold **no v1 code, tables or routes**; each has a new v2 foundation schema where every company table
carries `company_id NOT NULL`, composite keys and forced RLS from its creating migration, runs as its app role with the R1 binder
on, and its machine jobs work one company per transaction. H1 and P0 then add business tables on this base without rework.

## Evidence (read first)
- App `origin/phase/hrp-v2` (`b91d4abf`): `docs/design/specs/hr-h1.md` **§12.1–12.8** and the H0 inventory (H0-1…H0-24, esp. H0-1, -2, -5,
  -9, -12, -13, -20, -21); `payroll-p.md` **§17.1–17.4**; `docs/agents/hrp-specs/applied.md` (X.1, X.16, H1.1, H1.2).
- Workspace `docs/drafts/ADR-026-row-level-security.md`: M2–M6, **§4 R1 and R4 rows**, **§5 tests 1–8**, D8, **D9**, D-13/D-14 notes.
- What R1 built (use, do not redesign): `shared/tenant-security` `binding/TenantTransactionBinder.kt`, `TenantBinderSwitch.kt`,
  `database/DatabaseRoleCheck.kt`, `db/rls-callback`; `infra/postgres/initdb/{hr,payroll}-db-roles.psql`, `scripts/hr-payroll-db-roles.sh`;
  `HrRuntimeRoleCheck`, `PayrollRuntimeRoleCheck`, `HrDatabaseRoleTest`; `architecture-tests/.../TenantBindingArchitectureTest.kt`
  (`SYSTEM_JOB_BINDERS` empty, D-14 inbox rule); `docs/modules/shared/tenant-binder.md`; lane-ready `.review-channel/lane-ready-iso-r1.md`.
- Accounts patterns to copy (shape only): `RuntimeRoleCheck`, `accounts-runtime-role.psql`, the audit outbox and its dispatcher.
- v1 to delete: `services/hr-service` (V1–V9, ~260 files incl. `delivery/http/ess`, `/internal`, `iam_link_outbox`), `services/payroll-service`
  (V1–V5, ~150 files incl. `PayrollTenantIsolationGateFilter`); gateway routes `[7] hr-service` and `[8] payroll-service`
  (`api-gateway/.../application*.properties`, `GatewayPropertiesTest`, `scripts/gateway-route-check*.sh`); hr/payroll lines of
  `tenant-scope-baseline.txt` (59 hr, 39 payroll) and `FrozenTenantBaselines.kt`; `TenantRepositoryArchitectureTest` hr references;
  `scripts/verify-skip-allowlist.txt` / `verify-test-floor.txt` hr/payroll rows; postman hr/payroll requests.
- Contracts `docs/api/hrms-v2-h0.md`, `payroll-v2-p0.md`: still the old "migrate v1" path (V10/V11, V6/V7, backfill, quarantine).

## Decided (do not reopen)
1. **Rebuild, not refactor; v1 data not kept** (Jabran 2026-11-21, HRP-DES decisions 1–3; ADR-026 D9 accepted 2026-11-21). Old tables
   go by a **new forward migration**; applied migrations (hr V1–V9, payroll V1–V5) are never edited. No backfill, nullable-then-NOT-NULL,
   quarantine, archived seed or cloned global master (hr-h1 §12.1, payroll-p §17.1).
2. **v1 code goes in this lane** with the table drop: controllers, entities, repositories, jobs, gateway routes (decision 2, §12.1, H0-21).
3. **Every company table** has its own `company_id NOT NULL`, composite FKs `(company_id, parent_id)`, `ENABLE` + `FORCE ROW LEVEL SECURITY`
   and `company_isolation` in the creating migration; reference tables none (§12.2, M4). Tests run as `neoerp_<svc>_app` from the first
   slice (D8); no baseline entries (R4). RLS migrations **raise** when the app role is missing (M5 rule 3).
4. **Binder on for hr and payroll** (`neoerp.tenant.binder.enabled=true`): R1/D-13 refuses start-up when RLS tables exist and it is off.
   Accounts stays off (R2+R3). Machine jobs: claim on an allowlisted table with named per-command policies, then work under
   `SystemTenantScopes.forCompany` (M6, §12.3); classes go into `SYSTEM_JOB_BINDERS` with reasons.
5. **Events and outbox payloads carry ids only** (§12.5, ADR-019 D3); secrets from config only, no defaults (H0-20).
6. user-service code migrations U-split, U-defaults, U-h1, U-h2h3 still apply later; **D9 drops only HR and Payroll tables** (rule 7).
7. "No environment holds real HR data" is **checked** on any hosted stack before the drop (D9), not assumed.

## Decisions
**OD-1 decided by Jabran 2026-11-22 ("go with industry standards & recommendations"): as recommended**: H0 creates only the foundation tables; each later lane creates its own business tables in its own first migration, RLS from that migration (hr-h1 §12.1 is read that way; the H1 brief amends the spec text). **OD-2 decided by the old-Mac lead 2026-11-22 as recommended** (dev data only, reversible by re-seeding; Jabran: "whichever is efficient, go for it").
- **OD-1 What H0 creates.** Rec: the foundation tables only: hr `audit_outbox`, `workflow_outbox`, `idempotency_keys`; payroll the same,
  each with company RLS and the M6 dispatcher policies, plus the **audit and workflow outbox dispatchers** (H0-12, H0-13). Business tables
  (employees, departments, runs…) come in H1/P0's own first migrations with RLS. Why: RLS, role and M6 tests need real company tables to
  prove anything, and a business schema with no code would freeze untested shapes (migrations freeze once applied). The domain-event
  outbox/inbox wait for the first event (`hr.department.changed`, H1), so the D-14 `ConsumerPoller` rule is not triggered yet.
- **OD-2 Data other services hold from v1.** Rec: a local-only step in `scripts/reset-local-dev.sh` (and a standalone `scripts/hr-v1-dev-clear.sh`)
  clears user-service `employee_links` / link requests and audit-service hr/payroll workflow items; the Employee-role memberships and EMPLOYEE
  users in `seed-demo-iam.sql` **stay** (nobody's rights change, rule 7; the App's "being rebuilt" state needs them); links are seeded again
  in H1 when v2 employees exist. Why: no user-service or audit-service code or migration is touched, so R29b-3U/R29b-5 are not disturbed.

## Scope
| ID | Item |
|---|---|
| H0-B1 | hr **V10 `hrv2_drop_v1`**: drop every v1 `hr.*` table (incl. `iam_link_outbox`, V5 seeds). payroll **V6 `payrollv2_drop_v1`** likewise. |
| H0-B2 | hr **V11 `hrv2_foundation`**, payroll **V7 `payrollv2_foundation`**: OD-1 tables, composite keys, ENABLE+FORCE, policies (`TO` named role, M2 functions only), grants; raise without the app role. |
| H0-B3 | Delete v1 code in both services; keep only the skeleton H1/P0 reuse (below). Nothing compiles against a dropped table. |
| H0-B4 | Binder switch on for hr and payroll; `RuntimeRoleCheck` expected-policy lists for both; datasource = app role, Flyway = owner. |
| H0-B5 | Audit and workflow outbox dispatchers (lease, `SKIP LOCKED`, back-off) as M6 jobs; `SYSTEM_JOB_BINDERS` entries with reasons. |
| H0-B6 | Gateway routes `/api/hr/**`, `/api/payroll/**` removed (H1/P0 add v2 routes); route check scripts and tests updated. |
| H0-B7 | Architecture tests: hr/payroll lines removed from `tenant-scope-baseline.txt` and `FrozenTenantBaselines` (shrink only); hr/payroll in the RLS catalog test; ban `(:companyId IS NULL OR …)` (§12.9). |
| H0-B8 | Generated cross-company route test (§12.4 h): every `/api/hr|payroll` gateway route needs an A-token/B-id case; passes empty now, fails when H1 adds an uncovered route. |
| H0-B9 | OD-2 dev clear step; `docs/local-demo-data.md`. |
| H0-B10 | Docs: dated D9 amendments to `hrms-v2-h0.md` §1–4 and `payroll-v2-p0.md` §1–3 (new numbering, no backfill); `hrms.md`/`payroll.md` marked removed; `db-design.md`; `tenant-binder.md`; `docs/risk-paths.txt` adds payroll-service whole and hr tenant/persistence paths (§12.4 a); postman. |

**Keep for H1/P0** (no v1 endpoint knowledge): `*ServiceApplication`, `SecurityConfig` skeleton, `HrIamAuthzClient`/`PayrollIamAuthzClient`,
permission snapshot caches, `HrFeatures`, `IamCallerIdentityClient`, `*RuntimeRoleCheck`, `HrDatabaseRoleTest`, `LocalDatabaseGuard`, R1
wiring, `db/rls-callback`; auth-service machine clients and scopes; org `domain_event_consumers` rows. When unsure: delete and list it.

## Neighbours (outside this scope; say what you leave to whom)
- **R29b-3U** (user-service: employee link, onboarding, `HrEmployeePort` in `tenant-classification-baseline.txt`): touch **no** user-service
  file. `HrEmployeePort` answers 404 → `null`/`NOT_FOUND` after the drop (safe). Its statuses `ACTIVE/INACTIVE/EXITED` vs v2 `ACTIVE/EXITED`
  (API `ENDED`): H1. Shared files `FrozenTenantBaselines.kt`: remove only hr/payroll lines; the lead rebases on whichever merges first.
- **R29b-5** (audit + auth): no code there; workflow items cleared by script only. **R7** audit RLS, **R6b** hosted roles: later.
- **Accounts R2+R3** also fills `SYSTEM_JOB_BINDERS`: separate lines only. **AL-REST-BE**: payroll pay-run limits (AL-D16) are Payroll P-slices.
- **H1**: directory/record/org APIs and tables, IAM link push, v2 internal endpoints, employee-facts and headcount read (§12.7), cross-company
  reads (§12.8), v2 routes, shared field cipher (§12.6), file store, U-split/U-defaults/U-h1. **P0**: run tables, lifecycle, fixture calculator.
  **A5** posting contract refresh. App side: **HRP-H0-APP**.

## Tests (security lane: a test per rule; Docker-backed, never silently skipped, §12.4 i)
- **Migrations:** Flyway fresh V1→V11 / V1→V7 in Testcontainers as the non-superuser owner with the flag; and from a V9 / V5 database with v1
  rows in two companies: afterwards no v1 table exists. Missing app role → V11/V7 raises.
- **Per table, generated from the catalog (ADR §5.1–5.5):** A bound reads 0 of B's rows; insert/update with B's `company_id` fails; no bind →
  `TENANT_SETTING_MISSING`; mixing throws; 2 threads × pool of 1 × 1,000 alternations; catalog check (ENABLE, FORCE, policy names, composite
  FKs, no `TO PUBLIC`, no `SECURITY DEFINER`).
- **Roles (§5.6):** app role not superuser, no BYPASSRLS, owns nothing; owner without flag sees 0 rows; `RuntimeRoleCheck` fails on an extra
  policy; guard test fails a superuser test datasource.
- **Jobs (§5.7, 7a):** each dispatcher's bind reads A's and B's outbox rows, cannot read the other job's table; work done in both companies.
- **Ids only:** payload scan over both outboxes refuses pay, bank, national-id, health fields.
- **Old FAIL / new PASS** (run on `16d9a3f`, say how): v1 route `/api/hr/employees` answers through the gateway (old) → no route (new);
  hr app session reads another company's row (old: v1 tables, no RLS) → 0 rows; hr starts with binder off and RLS tables → refused.
- **Deletion:** `:architecture-tests:test`, full `:services:hr-service:test` and `:services:payroll-service:test` (migration rule),
  `:services:api-gateway:test`, `:services:user-service:test --tests '*Employee*'` + `*Onboarding*`, `scripts/gateway-route-check-test.sh`,
  `scripts/risk-check-test.sh`. All Gradle targets compile. No `verify.sh` by the builder.

## Rules
- One repo. Gradle only through `scripts/gradle-job.sh`; log to a file, one watcher; never `gradlew --stop` outside your slot; don't start the stack.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws`, keys.
- **Migrations freeze once applied:** apply V10/V11, V6/V7 only in Testcontainers, never on the shared local stack; a fix is a new migration (ask).
- **Gate:** the hook does not cover `phase/hrp-v2`; the lead runs `scripts/verify.sh` (L33, both locks) before merging there, by rule.
- Docs: developer pages in H0-B10; user guide: none (no user-facing change in BE; App lane says why). List each or "none: reason".
- Stop and ask: the owner role cannot drop a v1 table (ownership); a change needs user-, audit-, auth- or accounts-service code; an applied migration.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, file:line) | Status |
|---|---|---|
| H0-B1 … H0-B10 | | |
Every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files in gate format from round 1.

## Reviews and report
Fresh Opus (whole diff) → `docs/agents/hrp-h0/review-be-1-opus.md`; Fable security (policies, roles, binder, M6, deletion leaves no path to
company data) → `review-be-2-fable.md`. Only a FIX reviewer re-checks. **Report:** `docs/agents/hrp-h0/builder-report-be.md`.
**Lane-ready:** `.review-channel/lane-ready-hrp-h0-be.md`, with:
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
- Changed files: … (added/deleted/modified) · Items: 10 scope rows, … findings
```

## Done when
H0-B1…B10 proven in the self-check; targeted tests 0 failed, no unexpected skip; both reviews ACCEPT; docs listed; hosted-stack check
recorded; the lead's `verify.sh` green on the lane, then merge to BE `phase/hrp-v2` (tell Jabran: his next local restart drops v1 HR data).
