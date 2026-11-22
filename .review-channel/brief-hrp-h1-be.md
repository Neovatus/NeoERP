# Brief: HRP-H1-BE — HR v2 H1: employees, job history, organisation, sensitive data, self-service APIs (BackEnd, 2026-11-22)

**Workstream:** PROJECT-STATE HRP-2, step **H1** (first HR business tables and APIs on the H0 foundation). **Twin:** `brief-hrp-h1-app.md`.
**Repo / lane:** NeoERP-BackEnd, branch `phase/hrp-v2-h1-be` from the current BE `phase/hrp-v2` head (`f1a6f944` at writing, or newer),
worktree `NeoERP-worktrees/hrp-h1-be`. Copy this file to `docs/agents/hrp-h1/brief-be.md` as the first commit.
**Starts only after (lead step):** R29b-3U and AL-REST-BE are merged to BE `phase/4`, and the lead has merged `phase/4` into
`phase/hrp-v2` (normal merge commit, never force). This lane touches user-service (codes, employee links), so it must sit on R29b-3U's
classified user-service, and on AL-REST-BE's shared approval model (`shared/approval-model`). The lead cuts the branch after that merge.
**Review tier: 2.** Why: employee personal data and national ids (encryption, masking, audited reveal), bank details (who gets paid),
company isolation (new RLS tables, machine reads across services), permissions (new HR codes, Enter-company refusals). Two independent
seats in round 1: **Opus 5.5** (whole diff) and **Opus 5.5 security (D-43)** while Fable is paused (diff + brief only, not the first review).
**Builder:** Opus 5.5 high (spec decisions open), **new Mac**, targeted runs; the old Mac runs the gates (T3). Before the builder starts, a
fresh Opus checks this brief for gaps (D-51 rule 3); its findings go into this file.

## Evidence (read first)
- App `origin/phase/hrp-v2` (`d91e45cd`): `docs/design/specs/hr-h1.md` §1–§10 (screens and rules) and **§12** (foundation: §12.2 RLS, §12.3
  M6 jobs, §12.4 guardrails, §12.5 ids only, §12.6 cipher and file store, §12.7 dimensions and headcount read, §12.8 cross-company, §12.9
  paging); H1 inventory H1-1…H1-28; `ess.md` §6.1; `docs/agents/hrp-specs/applied.md` X.1, X.3, X.13, X.16, H1.1–H1.5.
- BE contract `docs/api/hrms-v2-h1.md` (§2 decisions, §3 data, §4 permissions, §5 rules, §6 API, §7 workflow, §8 audit, §9 national ids,
  §10 several employers, §11 facts, §13 other services, §15 errors, §17 checkpoints). **Still written for the old "migrate v1" path**
  (V12 renames, backfill, quarantine, V13 guard, `H1LegalNameBackfillJob`, `employee_history_v1`, `hr.document_blobs`, own AES-GCM,
  v1 `status`/`separate`/lifecycle "kept unpatched"); H1-B1 amends it. `hrms-v2-h0.md` §6.2–6.3 (U-split, U-defaults) and its 2026-11-22 amendment.
- H0 as built: `docs/agents/hrp-h0/brief-be.md`, `builder-report-be.md`, `review-1-opus.md`, `review-2-fable.md` (the LOWs below);
  workspace `.review-channel/lane-verdict-hrp-h0-be.md`; hr V10/V11, `RlsPolicyCheck`, role template, test kit, outbox dispatchers.
- Patterns to copy (shape only): Accounts `BankDetailsCrypto` (Tink AEAD), `:shared:file-store` + ADR-020 + `docs/modules/shared/file-store.md`,
  org-service `facts/branches` internal read, user-service `EmployeeLinkInternalController`, the ADR-019 domain-event relay.
- Workspace `docs/drafts/hr-payroll/large-customer-gap-check.md` rows D3 (segments carry `departmentId`), D4 (department validity, header
  flag, `hr.department.changed`); D5 and D10 are later.

## Decided (do not reopen)
1. **New tables only, per slice** (ADR-026 D9; OD-1, Jabran 2026-11-22): each slice's first migration creates its own tables with
   `company_id NOT NULL`, composite FKs, `ENABLE`+`FORCE` RLS and `company_isolation` in that migration; raises without the app role. No rename,
   backfill, quarantine, nullable-then-NOT-NULL, v1 history or legacy enum (`V1_RECONSTRUCTED`, `V1_UNKNOWN`, `INACTIVE`). Status `ACTIVE`/`EXITED`.
2. **Tests run as `neoerp_hr_app`** with the binder on; Docker-backed tests never skip silently (§12.4 i); no tenant-baseline entries.
3. **Events and outbox payloads carry ids only** (§12.5); readers fetch details through the permission-checked API. Secrets from config, no defaults.
4. **Documents go straight to `:shared:file-store`** (ADR-020); no `HrDocumentStore` port, no `hr.document_blobs` (§12.6, decision 8).
5. **One shared field cipher** from Accounts' Tink scheme, built and security-reviewed before any HR sensitive field (§12.6); no own AES-GCM.
6. **Every bank change needs a second person** (J-3): HR changes are WAITING `employee_pay_details` versions (H4-26); `hr.change_requests` is ESS only.
7. **Cost centre is an Accounts id, never free text** (H1-10); **pay group is Payroll's** ("Set in Payroll", H1-11). Keyset paging, capped counts,
   no `(:companyId IS NULL OR …)` (§12.9). Cross-company facts one call per company (§12.8). Migrations freeze once applied (Testcontainers only).

## Batching (D-51): three slices, in order, one lane branch
Each slice is its own commit set and its own **review batch + gate**: build → T1 → hand-back → two seats → fixes → lane-ready → T3 → merge to
`phase/hrp-v2`; the next slice continues on the merged head (no rebase of a reviewed slice). The App slice of the same number follows it.

### Slice BE-1 — Employment and organisation (migration V12)
| ID | Item | Acceptance test (old FAIL / new PASS where a behaviour changes) |
|---|---|---|
| H1-B1 | Dated D9 amendment of `hrms-v2-h1.md` (first commit after the brief): new tables per slice (V12/V13/V14), no backfill/quarantine/V13 guard/legal-name job/history_v1, file store, shared cipher, department validity + header, `departmentId` in segments, headcount read, v1 `status`/`separate`/lifecycle rows removed (deleted in H0), Q3/Q4/Q14 closed as obsolete. | Doc skim by both seats; every §17 test name it keeps exists or is listed as later. |
| H1-B2 | user-service **U-split** + **U-defaults** (H0 §6.2–6.3) as next free numbers: v2 HR codes incl. `ALL_TEAMS`, `SENSITIVE.*`, `PAY_DETAILS.APPROVE`, `ORG.READ/MANAGE`; rule 7 (nobody loses a right). | Migration test: every v1 HR code holder keeps an equal v2 set; role catalog lists the codes; no Payroll code changes meaning. |
| H1-B3 | hr **V12 `hrv2_employment_org`**: `employees`, `job_assignments` (full snapshots, exclusive `valid_to`, `changed_fields`, `retroactive`, `probation_end_date`, `fixed_term_end`, `work_calendar_id` reserved), `departments` (tree, `valid_from`/`valid_to`, `is_header`), `positions`, `country_job_defaults` (reference, no RLS, UNVERIFIED), domain-event outbox; partial unique on non-cancelled `(company_id, employee_id, valid_from)`. | Catalog test (ENABLE, FORCE, policy names, composite FKs) generated per table; Flyway V1→V12 fresh as owner; missing app role raises; two-company RLS kit (§5.1–5.5). |
| H1-B4 | Employees API (§6.1–6.4, 6.8): list (keyset, capped count, filters, team scope H0-10), record with `actions`/`blockedBy` (H1-24), quick add (no sensitive fields yet), `/job`, `POST /job-changes` (§5.1 order, between-rows rule CA-1), cancel latest upcoming, `HrCompanyClock` (Org time zone, else UTC), reports-to walk with lock, `CurrentJobRefreshJob` as an M6 job (`SYSTEM_JOB_BINDERS` row with reason). | `JobChangeRulesTest` (each §5.1 refusal in order, nothing written), Jan/Oct/Nov between-rows example, `ManagerCycleTest`, team-scope web test, paging test at 5,000 employees, refresh job per company. |
| H1-B5 | Organisation API (§6.1, §5.5): department tree (cycle, depth ≤ 10, header never on a job row), positions, deactivate refusals with counts (current + upcoming), reactivate; `hr.department.changed` through the ADR-019 relay (dispatcher M6, ids only). | `DepartmentTreeTest`, `PositionLifecycleTest`, `OrgWebTest` (two companies), payload scan on the new event, "Weaving with 4 employees" refused with the count. |
| H1-B6 | References: branch checked through Org facts (H0-19), `OrgBranchFactsV1` for display (null when absent); **cost-centre internal read** per OQ-1 with `accounts.cost-centres.read` for the hr client; Accounts down → 503 `ACCOUNTS_UNAVAILABLE` on writes, `name: null` on reads. | Client tests with a stub; a cost centre of company B refused (422 `REFERENCE_NOT_IN_COMPANY`); scope pinning test on the producer. |
| H1-B7 | Gateway v2 routes `/api/hr/**`; the H0-B8 generated cross-company test covers every new route (A-token, B-id → refused); `docs/risk-paths.txt` adds the new hr tenant, persistence and delivery paths. | Cross-company route test **fails** on the H0 head with a new uncovered route (old FAIL), passes with the cases; `gateway-route-check-test.sh`, `risk-check-test.sh`. |
| H1-B8 | **H0 LOWs carried** (verdict list): column grants on hr outboxes (no UPDATE of `company_id`/payload; F2, O2); `RlsPolicyCheck` compares policy expressions (F3, O3); views `security_invoker`, definer-function check, `neoerp.migration` not settable by the app role (F4); ADR §5.2 system-job test on the real outboxes (F5); refusal before listeners/schedulers start, workflow `orgId`, audit `reason` (F6, F7); `DatabaseRoleContract` binder-off guard back for accounts (O1); workflow order tie-break (O5); role script detects a re-grant of DELETE (F1); `verify-test-floor.txt` 4150 → measured count (~4300, O4). Payroll's own migration rows: OQ-5. | One old-FAIL/new-PASS test per item (F1–F7, O1–O5), each named in the self-check. |
| H1-B9 | Demo data: `scripts/seed-demo-hr.sh` + `docs/local-demo-data.md` (hr-h1 §3 on the seeded companies Lahore Textiles, Sialkot Mills, Kystgruppe Nordic, Stockholm Handel): department trees, positions, ~30/8/25/6 employees, a future job change, a branch move across AGA zones, one ended employee (seeded directly, OQ-4); one **employee-only login** and one **line manager with a team** with demo sign-in; two holders of `HR.PAY_DETAILS.APPROVE` at Lahore. No passwords in the doc beyond the existing convention line. | `seed-demo-hr.sh` idempotent (run twice, same counts); local-only guard. |

### Slice BE-2 — Personal and sensitive data (migration V13)
| ID | Item | Acceptance test |
|---|---|---|
| H1-B10 | **Shared field cipher** (`shared/field-cipher`, per OQ-2): Tink AEAD, `key_id` rotation, HMAC blind index with its own key, keys from config with no default (start-up fails), never logged. Reviewed as its own commit set first. | Round trip, wrong key fails, old `key_id` still reads, blind index stable per company and differs across companies, start-up refused without keys, Accounts ciphertext compatibility test (OQ-2). |
| H1-B11 | hr **V13 `hrv2_personal_sensitive`**: `employee_personal`, `emergency_contacts` (≤ 5), `employee_sensitive` (+ `national_id_type`, blind index, `last4`), `national_id_claims` (partial unique among non-ended), `employee_pay_details` (append-only versions, H4-26 `approval_status`, `requested_by_user_id`, `social_security_refs`), `employee_documents` (file-store refs). Personal API with `FULL`/`WORK_ONLY`/platform views (H1-19, §4.4), emergency contacts. | Catalog + RLS kit for each table; `PersonalViewTest` (owner, HR officer, manager, Enter-company); sixth contact 422. |
| H1-B12 | Sensitive API: masked GET, `PUT /sensitive` (direct edit with reason, CA-14), `POST /sensitive/reveal` (audit row in the same transaction, fields only, `revealSeconds: 30`, `no-store`, 60/h `REVEAL_LIMIT`), `NationalIdRules` per country and type (§9, all UNVERIFIED with source), quick add gains national id/DOB with `NATIONAL_ID_TAKEN`. | `RevealAuditTest` (one row per reveal, no values, 429, platform 403), `NationalIdRulesTest` (synthetic valid/invalid per country), `SensitiveNeverLoggedTest` (log capture), payload scan. |
| H1-B13 | Pay details: `GET`, `POST` (WAITING version, `effectiveFrom` ≥ today, own pay refused), H4-26 `approve` (`confirmedWithEmployee`) · `reject` · `withdraw` · `reveal`; Owner's own only when no other active holder; IBAN and local account checks. | **State-transition matrix test** (§12.4 d: every transition × maker, approver, employee, Owner, platform, holder count); `PayDetailsVersionTest` (history masked, requested/approved by). |
| H1-B14 | Documents on `:shared:file-store`: upload (≤ 10 MB, PDF/JPEG/PNG sniffed, ADR-020 scan hook), list (`hiddenCount` for sensitive kinds), download (audited for `IDENTITY`/`BANK`), soft delete with reason, purge job as M6. | `DocumentUploadTest` (size 413, type 415 by content, sensitive kinds need the code), two-company download refused, purge job per company. |
| H1-B15 | `GET /employees/export` (no sensitive or private column ever, audited with filters and count) and Activity read (§8.3) through an audit-service internal read per OQ-3; §8.2 catalogue rows. | Export column test (a sensitive field never appears); activity two-company test; audit down → degraded, no other company's rows. |

### Slice BE-3 — Self-service, links, facts (migration V14)
| ID | Item | Acceptance test |
|---|---|---|
| H1-B16 | hr **V14 `hrv2_change_requests`** + HR side (§5.7, §6.6): one WAITING per kind, approve applies in the same transaction, reject with reason, `BANK_ACCOUNT` only by `HR.PAY_DETAILS.APPROVE` with the tick, per-kind queue (CA-4), `/change-requests/{id}/reveal`; workflow items through the workflow outbox (ids only). | `ChangeRequestFlowTest` and its matrix (§12.4 d), decider = employee or submitter 403, stale version, invalid value on approve 422 stays WAITING. |
| H1-B17 | ESS `/api/hr/me/**` (§6.7, §5.8; employee = scope company + caller, H0-7): profile, job, direct contact and emergency-contact edits (audited), change requests create/withdraw; user-service **U-h1** `HR.ESS.PROFILE`; `BANK_ACCOUNT` per OQ-6 (no `auth_time` today: fail closed, 401 `REAUTH_REQUIRED`), notice recorded in-app only (ess §6.1, decision 11). | `/me` two-company test (company B's id with A's token), no sensitive values in `/me`, bank request 401 without sign-in time, other kinds pass. |
| H1-B18 | App access and links (§10): `GET /app-access` with `otherEmployments` (only where the viewer holds `HR.EMPLOYEE.READ`, degraded when user-service is down), `PUT`/`DELETE /employees/{id}/user`, new PA-1 link outbox (RLS, M6 dispatcher, `positionName`), user-service `employments[]` on `/api/users/me` + bootstrap and the internal `employee-links?viewerUserId=` read (`iam.employee-links.read`); dev links re-seeded (OD-2). | Viewer without HR read at Sialkot sees no Sialkot row (old: n/a, new test); link outbox per company; user-service two-company test. |
| H1-B19 | Internal reads: employee facts §11 (non-sensitive block, segments with `branchId`, `costCentreId`, `departmentId`, `retroactiveFrom`, `payDetailsChangedBy/At`; sensitive block and §11.1 per OQ-7) and the **headcount read** §12.7 (`hr.headcount.read`, accounts client only; counts and FTE per cost centre, department, branch on a date). | Facts: payroll client only, one company per answer, `REPEATABLE READ`; headcount: accounts client only, ended do not count, mid-period move counted on the date, no names. |
| H1-B20 | `scripts/h1-acceptance.sh` (contract §17 overall acceptance, local only) and the docs (below). | Script green on the local stack (lead runs it with T4). |

## Out of scope
Payroll (P0+: runs, pay group, time windows, salary line P2); H2 leave and `ON_LEAVE`; H3 time, calendars, shifts, time zones beyond the Org read;
H4 wizard, End employment, re-hire, lifecycle requests (HR Officer job-change requests), Start in another company; agreement profiles (H2);
starter setup by business type; bulk import and mass changes; document expiry and signing; real e-mail/SMS notices (notification-service);
managed key service (go-live gate); App code (twin lane).

## Tests (D-49: builder tests once, gate once, reviewers do not re-run)
- Per item: the tests above; **per review finding** a test that fails on the slice head and passes after the fix (old FAIL / new PASS).
- Before each hand-back: full `:services:hr-service:test`, full suites of every other touched service (user-service, accounts-service,
  audit-service, org-service, api-gateway, auth-service as touched), `:shared:*` touched modules, and `:architecture-tests:test`; all targets compile;
  `scripts/gateway-route-check-test.sh`, `scripts/risk-check-test.sh`. No `verify.sh` by the builder (the old Mac's T3). Counts + sha in the report.
- Docker-backed RLS/role/migration tests: an unexpected skip fails the run.

## Docs (part of done; lane-ready lists each page or "none: reason")
- Developer (new): `docs/modules/hr/employees.md`, `organisation.md`, `sensitive-data.md` (BE-2), `self-service-and-links.md` (BE-3);
  `docs/modules/shared/field-cipher.md` (BE-2); `docs/api/hrms-v2-h1.md` (H1-B1 + per slice); `audit-catalogue.md`, `permission-actions.md`,
  `standard-roles.md`; `db-design.md`; `docs/local-demo-data.md`; `tenant-binder.md` (new system jobs).
- User guide: none in this repo: HR user-guide pages live in NeoERP-App and ship with the App twin.

## Rules
- Never `--no-verify`, no force push. Push only this lane branch when a slice is lane-ready; no merge or rebase unless the lead rings.
- No AI attribution: no Co-Authored-By, no "Generated with", in commits, PRs or comments.
- Never open, print or grep `.env`, `infra/.env`, `.local-secrets/*`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys.
- One repo per builder: NeoERP-BackEnd only (App is the twin lane).
- Gradle only via the workspace `scripts/gradle-job.sh be <dir> <args>`; log to a file, one watcher; never `gradlew --stop` outside your slot; don't start the stack.
- Migrations V12–V14 apply only in Testcontainers until merged; a fix after merge is a new migration (ask). user-service numbers: next free, renumber own unpushed on a clash.
- **Local stack before H1 testing (Jabran, by hand, never printed):** HR/PAYROLL DB + FLYWAY passwords in `.env`, then `scripts/hr-payroll-db-roles.sh`,
  restart, `NEOERP_CONFIRM_HR_V1_CLEAR=yes scripts/hr-v1-dev-clear.sh`, then `scripts/seed-demo-hr.sh`. The builder writes these steps; it never runs them.
- Stop and ask: an applied migration; a change to Accounts bank or posting code beyond OQ-1/OQ-2; a money rule; a scope item not listed here.

## Self-check, reviews, report
Self-check table (L36) in `docs/agents/hrp-h1/builder-report-be-<slice>.md`: one row per H1-B item (proof: test class.method, file:line; status).
Reviews per slice: `docs/agents/hrp-h1/review-be<slice>-1-opus.md` and `review-be<slice>-2-opus-sec.md` (gate format, round 1 both; after a FIX only
the asking seat re-checks). Lane-ready: `.review-channel/lane-ready-hrp-h1-be<slice>.md` with the MEASURE-1 timeline block (Build · Rework ·
Review · Test · Waiting minutes, tokens per agent, FIX rounds, changed files, items). Hand-back ≤ 10 lines (L35).
**Done when** (per slice): its items proven, targeted + full suites 0 failed with no unexpected skip, both seats ACCEPT, docs listed, T3 green, merged.

## Open questions for the lead (options · recommendation; money rules and product scope go to Jabran)
- **OQ-1 — DECIDED (a), D-59.** Cost-centre read.** No internal cost-centre read exists in accounts-service. (a) Add it in BE-1 (`/api/internal/accounts/companies/{cid}/cost-centres`,
  scope `accounts.cost-centres.read`, hr client only); (b) an Accounts lane builds it, H1 keeps `costCentreId` null meanwhile. **Rec (a):** the owner
  serves a narrow machine read, as Org facts do; small, read-only; the lead checks no Phase 4 lane touches those files. Without it, §12.7 dimensions stall.
- **OQ-2 — DECIDED (a), D-59.** Cipher and Accounts.** (a) Build `shared/field-cipher`, HR uses it, Accounts moves to it in a later small tier-2 lane, with a compatibility test
  now; (b) move Accounts in BE-2 too; (c) copy the scheme into HR. **Rec (a):** one scheme now without touching stored bank ciphertext in a HR lane.
- **OQ-3 — DECIDED (a), D-59.** Activity read.** audit-service has only a write endpoint. (a) Add an internal read by company + service + subject (`audit.event.read`, company
  required) in BE-2; (b) defer the Activity tab. **Rec (a):** the spec and audit catalogue already plan it; read-only, two-company test.
- **OQ-4 — DECIDED (a) by Jabran 2026-11-22, D-59.** Ending and requests (scope, Jabran).** H0 deleted v1 `status`/`separate`/lifecycle; H4 owns their v2. (a) H1 ships no End employment and no
  HR-Officer job-change request (actions hidden; the ended demo employee is seeded); (b) pull H4 B4 ending into H1. **Rec (a):** keeps H1 reviewable.
- **OQ-5 — DECIDED (a), D-59.** Payroll H0 LOWs.** (a) Shared-module fixes here cover both; payroll's migration rows (column grants) go into P0's first migration; (b) a payroll
  migration in this lane. **Rec (a):** one repo per lane is kept, and P0's first migration is next anyway.
- **OQ-6 — DECIDED (a) by Jabran 2026-11-22, D-59.** ESS bank request without `auth_time` (security, Jabran).** (a) Fail closed in H1 as the contract says; the `auth_time` sign-in change is its own
  lane for Jabran's approval; (b) add `auth_time` here. **Rec (a):** a sign-in change needs his approval and its own review.
- **OQ-7 — DECIDED (a), D-59.** Facts sensitive block and §11.1 match.** (a) Build them with P1 when a consumer exists; (b) now. **Rec (a):** no untested sensitive surface
  without its reader; the non-sensitive facts and headcount read ship now.
