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
5. **One shared field cipher** from Accounts' Tink scheme, built and security-reviewed (its own review batch, BE-2a) before any HR sensitive field.
6. **Every bank change needs a second person** (J-3): HR changes are WAITING `employee_pay_details` versions (H4-26); `hr.change_requests` is ESS only.
7. **Cost centre is an Accounts id, never free text** (H1-10); **pay group is Payroll's** ("Set in Payroll", H1-11). Keyset paging, capped counts,
   no `(:companyId IS NULL OR …)` (§12.9). Cross-company facts one call per company (§12.8). Migrations freeze once applied (Testcontainers only).
8. **D-59 (2026-11-22), all OQs as (a):** no End employment and no HR-officer job-change request in H1 (Jabran); ESS bank request fails closed, `auth_time`
   is its own lane (Jabran); cost-centre read in accounts-service; `shared/field-cipher` now, Accounts moves later; audit read in BE-2b; payroll column
   grants in P0; sensitive facts block and §11.1 match with P1.
9. **Ended employments are read-only** except documents and activity: every other write on an `EXITED` employee → 422 `EMPLOYEE_NOT_ACTIVE`; `actions` say `ENDED`.
10. **Contract freeze:** a slice's shapes freeze at its lane-ready. A later shape change (a review fix) = a dated note in `hrms-v2-h1.md` + a ring to the
    App builder, who tests against the note.

## Batching (D-51): five slices, in order, one lane branch; migrations in slice order
Each slice is its own commit set and its own **review batch + gate**: build → T1 → hand-back → two seats → fixes → lane-ready → T3 → merge to
`phase/hrp-v2`; the next slice continues on the merged head (no rebase of a reviewed slice). App slices follow (twin, OQ-A4).
Order: **BE-1a** (V12) → **BE-1b** (V13) → **BE-2a** (cipher, no migration) → **BE-2b** (V14) → **BE-3** (V15). Each slice adds its own
`docs/risk-paths.txt` lines in the commit that adds the code (§12.4 a) and grows the demo seed (H1-B9) for its tables.

### Slice BE-1a — Contract, codes, H0 LOWs (migration V12)
| ID | Item | Acceptance test (old FAIL / new PASS where a behaviour changes) |
|---|---|---|
| H1-B1 | Dated D9 + D-59 amendment of `hrms-v2-h1.md` (first commit after the brief): (1) new tables per slice V13/V14/V15, no backfill/quarantine/guard/legal-name job/history_v1, file store, shared cipher; (2) §3.1-4 `employees` columns as H1-B3; (3) **`kind`**: optional in the body, the server derives it when absent (position → `PROMOTION`, branch/department/manager → `TRANSFER`, FTE/hours → `CHANGE_OF_HOURS`, else `OTHER`; OQ-8), §5.1 step 4a amended; (4) **§6.2 paging**: `cursor`/`nextCursor`, `count` + `countCapped` (cap 10,000), `size` 1–200, no `page`/`totalElements`; (5) **§6.3 `actions`**: no `end`, no `requestJobChange`; not allowed = not drawn, `blockedBy` only feeds the "Only {role}…" line; (6) v1 `status`/`separate`/lifecycle rows and the `HR.EMPLOYEE.END/REQUEST/APPROVE` endpoint rows deleted (codes stay, no H1 endpoint); (7) departments: validity, header flag, `employeeCount` + `employeeCountWithSubDepartments` (HR-11); (8) `departmentId` in segments, headcount read; (9) Q3/Q4/Q14 closed as obsolete; (10) the product rows of OQ-9…OQ-12 once decided. | Doc skim by both seats; every §17 test name kept exists or is listed as later. App A3 cites (3)–(5). |
| H1-B2 | user-service **U-split** + **U-defaults** (H0 §6.2–6.3), next free numbers: v2 HR codes incl. `ALL_TEAMS`, `SENSITIVE.*`, `ORG.READ/MANAGE`; **`HR.PAY_DETAILS.APPROVE` defaults Owner + HR Admin** (spec §9); rule 7. | Migration test: every v1 HR code holder keeps an equal v2 set, **including a customised company role copy** (bilal.ahmed's "HR Manager (Lahore)"); no Payroll code changes meaning. |
| H1-B8 | **H0 LOWs carried:** hr **V12 `hrv2_outbox_column_grants`** (no UPDATE of `company_id`/payload on hr outboxes; F2, O2); `RlsPolicyCheck` compares policy expressions (F3, O3); views `security_invoker`, definer-function check, `neoerp.migration` not settable by the app role (F4); ADR §5.2 system-job test on the real outboxes (F5); refusal before listeners/schedulers start, workflow `orgId`, audit `reason` (F6, F7); `DatabaseRoleContract` binder-off guard back for accounts (O1); workflow order tie-break (O5); role script detects a re-grant of DELETE (F1); `verify-test-floor.txt` 4150 → measured (~4300, O4). Payroll's column grants: P0 (D-59). | One old-FAIL/new-PASS test per item (F1–F7, O1–O5), each named in the self-check. |

### Slice BE-1b — Employment and organisation (migration V13)
| ID | Item | Acceptance test |
|---|---|---|
| H1-B3 | hr **V13 `hrv2_employment_org`**. `employees`: `id`, `company_id`, `employee_code` (unique per company), `legal_name NOT NULL`, `user_id` NULL + unique `(company_id, user_id)` (H0-7, H0-10), `start_date`, `end_date`, `end_reason` (no `V1_UNKNOWN`), `status`, `country_code NOT NULL`, `work_email`, `work_phone`, `job_facts_complete`, projection columns (H1-4), `version`. **`employee_code_sequences`** (company_id, next value; RLS). `job_assignments` (full snapshots, exclusive `valid_to`, `changed_fields`, `retroactive`, `probation_end_date`, `fixed_term_end`, `work_calendar_id` reserved, `kind`; `source` ∈ `HR_DIRECT` now, `CHANGE_REQUEST`/`LIFECYCLE_REQUEST` later; `change_kind` ∈ `START`, `JOB_CHANGE`; `lifecycle_request_id` NULL **without FK** until H4; CHECKs without any v1 escape). `departments` (tree, `valid_from`/`valid_to`, `is_header`), `positions`, `country_job_defaults` (reference, no RLS, UNVERIFIED), domain-event outbox. | Catalog test (ENABLE, FORCE, policy names, composite FKs) generated per table incl. the sequence table; Flyway V1→V13 fresh as owner; missing app role raises; two-company RLS kit (§5.1–5.5); two companies draw codes independently. |
| H1-B4 | Employees API (§6.1–6.4, 6.8 as amended): list (keyset, capped count, filters incl. `appAccess` from `user_id` + IAM invite state, team scope H0-10), record with `actions` (H1-24), quick add (no sensitive fields yet; next `employee_code`), `/job`, `POST /job-changes` (§5.1 order, CA-1, derived `kind`), cancel latest upcoming, `HrCompanyClock`, reports-to walk with lock, `CurrentJobRefreshJob` (M6, `SYSTEM_JOB_BINDERS` row). **Audit**: §8.2 rows CREATE, JOB_CHANGE, JOB_CHANGE_CANCEL. | `JobChangeRulesTest` (each refusal in order, nothing written), Jan/Oct/Nov between-rows example, `ManagerCycleTest`, team-scope web test, 5,000-employee paging, ended-employee writes 422, **one audit row per write in the same transaction (rollback test)**. |
| H1-B5 | Organisation API (§6.1, §5.5): department tree (cycle, depth ≤ 10, header never on a job row, both counts), positions, deactivate refusals with counts (current + upcoming), reactivate; `hr.department.changed` via the ADR-019 relay (M6, ids only). **Audit**: hr-department / hr-position create, change, deactivate rows. | `DepartmentTreeTest`, `PositionLifecycleTest`, `OrgWebTest` (two companies), event payload scan, "Weaving with 4 employees" refused with the count, audit row per write. |
| H1-B6 | References: branch via Org facts (H0-19), `OrgBranchFactsV1` for display (null when absent); **cost-centre internal read** in accounts-service (D-59: `/api/internal/accounts/companies/{cid}/cost-centres`, `accounts.cost-centres.read`, hr client only); Accounts down → 503 on writes, `name: null` on reads. | Stub client tests; company B's cost centre refused (422 `REFERENCE_NOT_IN_COMPANY`); producer scope-pinning and two-company test. |
| H1-B7 | Gateway v2 routes `/api/hr/**`; the H0-B8 cross-company test covers every new route; risk paths for hr tenant, persistence, delivery. | Route test fails on the H0 head with an uncovered new route (old FAIL), passes with its cases; `gateway-route-check-test.sh`, `risk-check-test.sh`. |
| H1-B9 | **Demo seed, grows per slice** (`scripts/seed-demo-hr.sh`, `docs/local-demo-data.md`, local-only guard, idempotent). BE-1b: hr-h1 §3 job/org data on Lahore Textiles, Sialkot Mills, Kystgruppe Nordic, Stockholm Handel; a future job change; one ended employee (seeded directly, D-59); a **zone-1 branch fact** added to the Org seed so a zone 1 → `ZONE_4A` move exists; an **employee-only login** and a **line manager with a team** (demo sign-in, `user_id` + `iam.employee_links`); two `PAY_DETAILS.APPROVE` holders at Lahore. BE-2b: national ids, sensitive rows, bank versions (one approved, one WAITING). BE-3: Omar Farooq's waiting ESS bank request (spec §3) and a **two-employer login** (spec's Sara Malik: Lahore + Sialkot, new IAM user). Kystgruppe Danmark: **out of the H1 seed** (no such company in the tenant seed). | Run twice → same counts; each slice's part tested with that slice. |

### Slice BE-2a — Shared field cipher (no migration; own review batch)
| ID | Item | Acceptance test |
|---|---|---|
| H1-B10 | `shared/field-cipher`: Tink AEAD, `key_id` rotation, HMAC blind index with its own key, keys from config with no default (start-up fails), never logged; risk path `shared/field-cipher/**`. | Round trip, wrong key fails, old `key_id` reads, blind index stable per company and differs across companies, start-up refused without keys, Accounts ciphertext compatibility test (D-59). |

### Slice BE-2b — Personal and sensitive data (migration V14)
**Every `*_cipher` column in V14 and V15** (`national_id_cipher`, `date_of_birth_cipher`, `legal_sex_cipher`, `bank_account_cipher`,
`social_security_refs_cipher`, `change_requests.new_value_cipher`) uses `shared/field-cipher` with its `key_id`; masks (`last4`, `DD-MM`, masked JSON)
are stored separately; the payload and log scans cover every one.
| ID | Item | Acceptance test |
|---|---|---|
| H1-B11 | hr **V14 `hrv2_personal_sensitive`**: `employee_personal`, `emergency_contacts` (≤ 5), `employee_sensitive` (+ `national_id_type`, blind index, `last4`), `national_id_claims` (partial unique among non-ended), `employee_pay_details` (append-only, H4-26 `approval_status`, `requested_by_user_id`), `employee_documents` (file-store refs). Personal API with `FULL`/`WORK_ONLY`/platform views (H1-19, §4.4), emergency contacts (team-only → 403 `TEAM_SCOPE`). | Catalog + RLS kit per table; `PersonalViewTest` (owner, HR officer, manager, Enter-company); sixth contact 422. |
| H1-B12 | Sensitive API: masked GET, `PUT /sensitive` (direct edit with reason, CA-14), reveal (audit in the same transaction, fields only, 30 s, `no-store`, 60/h), `NationalIdRules` (§9, UNVERIFIED with source), quick add gains national id/DOB (`NATIONAL_ID_TAKEN`). | `RevealAuditTest`, `NationalIdRulesTest` (synthetic per country), `SensitiveNeverLoggedTest`, payload scan. |
| H1-B13 | Pay details: `GET`, `POST` (version, `effectiveFrom` ≥ today, own pay refused), H4-26 `approve` (`confirmedWithEmployee`) · `reject` · `withdraw` · `reveal`; Owner's own only when no other active holder; IBAN/local checks. **Non-bank fields** (tax residence, pension, union, holiday-pay route, PK EOBI/PESSI refs, H1-27) per OQ-11; optional supporting document per OQ-9. | **State-transition matrix test** (§12.4 d: transition × maker, approver, employee, Owner, platform, holder count; bank and non-bank versions); `PayDetailsVersionTest`. |
| H1-B14 | Documents on `:shared:file-store` (its envelope encryption is the at-rest scheme for every kind; object keys carry `service/companyId`): upload (≤ 10 MB, sniffed type, ADR-020 scan hook), list (`hiddenCount`), download (audited for `IDENTITY`/`BANK`), soft delete with reason, purge job (M6). | Size 413, type 415, sensitive kinds need the code, **company B cannot fetch A's content** by id or ref, purge per company. |
| H1-B15 | Export CSV (no sensitive or private column, audited) and Activity via an audit-service internal read by company + service + subject (`audit.event.read`, company required, D-59); §8.2 rows for BE-2b writes and reveals. | Export column test; activity two-company test; audit down → degraded. |

### Slice BE-3 — Self-service, links, facts (migration V15)
| ID | Item | Acceptance test |
|---|---|---|
| H1-B16 | hr **V15 `hrv2_change_requests`** + HR side (§5.7, §6.6): one WAITING per kind, approve applies in the same transaction, reject with reason, `BANK_ACCOUNT` only by `PAY_DETAILS.APPROVE` with the tick, per-kind queue (CA-4), `/change-requests/{id}/reveal`; workflow items (ids only); risk paths for the change-request packages. | **Catalog + RLS kit (§5.1–5.5) for V15 tables**; `ChangeRequestFlowTest` + matrix; decider = employee or submitter 403; stale version; invalid value on approve 422 stays WAITING. |
| H1-B17 | ESS `/api/hr/me/**` (§6.7, §5.8; H0-7): profile, job, direct contact and emergency-contact edits (audited), change requests create/withdraw; `POST /me/documents` + 24 h purge (OQ-9); user-service **U-h1** `HR.ESS.PROFILE`; `BANK_ACCOUNT` fails closed (401 `REAUTH_REQUIRED`, D-59), notice recorded in-app only. | `/me` two-company test, no sensitive values in `/me`, bank 401, other kinds pass. |
| H1-B18 | App access (§10): `GET /app-access` (`otherEmployments` only where the viewer holds HR read; degraded), `PUT`/`DELETE /employees/{id}/user`, PA-1 link outbox (RLS, M6, `positionName`), user-service `employments[]` on `/api/users/me` + bootstrap, internal `employee-links?viewerUserId=` (`iam.employee-links.read`); dev links re-seeded (OD-2). | Viewer without HR read at Sialkot sees no Sialkot row; link outbox per company; user-service two-company test. |
| H1-B19 | Employee facts §11 (non-sensitive, segments with `branchId`, `costCentreId`, `departmentId`, `retroactiveFrom`, `payDetailsChangedBy/At`) and the headcount read §12.7 (`hr.headcount.read`, accounts client only). | Payroll client only, one company per answer; headcount counts on the date, ended excluded, no names. |
| H1-B20 | `scripts/h1-acceptance.sh` (§17 overall acceptance, local only) and the docs. | Script green on the local stack (lead, with T4). |

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
- Developer (new): `docs/modules/hr/employees.md`, `organisation.md`, `sensitive-data.md` (BE-2b), `self-service-and-links.md` (BE-3);
  `docs/modules/shared/field-cipher.md` (BE-2a); `docs/api/hrms-v2-h1.md` (H1-B1 + per slice); `audit-catalogue.md`, `permission-actions.md`,
  `standard-roles.md`; `db-design.md`; `docs/local-demo-data.md`; `tenant-binder.md` (new system jobs).
- User guide: none in this repo: HR user-guide pages live in NeoERP-App and ship with the App twin.

## Rules
- Never `--no-verify`, no force push. Push only this lane branch when a slice is lane-ready; no merge or rebase unless the lead rings.
- No AI attribution: no Co-Authored-By, no "Generated with", in commits, PRs or comments.
- Never open, print or grep `.env`, `infra/.env`, `.local-secrets/*`, token or session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.aws` or keys.
- One repo per builder: NeoERP-BackEnd only (App is the twin lane).
- Gradle only via the workspace `scripts/gradle-job.sh be <dir> <args>`; log to a file, one watcher; `--stop` only inside your slot via the script; don't start the stack.
- Migrations V12–V15 apply only in Testcontainers until merged; a fix after merge is a new migration (ask). user-service numbers: next free, renumber own unpushed on a clash.
- **Local stack before H1 testing (Jabran, by hand; values never printed; the builder documents variable names only, in `local-demo-data.md`):**
  BE-1a/1b: HR/PAYROLL DB + FLYWAY passwords in `.env`, `scripts/hr-payroll-db-roles.sh`, restart, `NEOERP_CONFIRM_HR_V1_CLEAR=yes scripts/hr-v1-dev-clear.sh`,
  `scripts/seed-demo-hr.sh`. **BE-2a/2b add:** the hr field-cipher key, the blind-index key and the hr file-store key (KEK) in `.env` (names from H1-B10/B14),
  then restart; hr-service refuses to start without them. The builder writes these steps; it never runs them.
- Stop and ask: an applied migration; a change to Accounts bank or posting code beyond H1-B6/H1-B10; a money rule; a scope item not listed here.

## Self-check, reviews, report
Self-check table (L36) in `docs/agents/hrp-h1/builder-report-be-<slice>.md`: one row per H1-B item (proof: test class.method, file:line; status).
Reviews per slice: `docs/agents/hrp-h1/review-be<slice>-1-opus.md` and `review-be<slice>-2-opus-sec.md` (gate format, round 1 both; after a FIX only
the asking seat re-checks). Lane-ready: `.review-channel/lane-ready-hrp-h1-be<slice>.md` with the MEASURE-1 timeline block (Build · Rework ·
Review · Test · Waiting minutes, tokens per agent, FIX rounds, changed files, items). Hand-back ≤ 10 lines (L35).
**Done when** (per slice): its items proven, targeted + full suites 0 failed with no unexpected skip, both seats ACCEPT, docs listed, T3 green, merged.

## Open questions (OQ-1…OQ-7 decided in D-59, all (a), written into the items above). New ones from the brief check:
- **OQ-8 Job-change `kind` (lead).** (a) Optional in the body, server derives it from the changed fields, App sends none in H1; (b) App adds a kind picker.
  **Rec (a):** the spec panel has no such field; a derived, stored value keeps Payroll's reading; a picker can come with H4's lifecycle types.
- **OQ-9 Attachments (product scope, Jabran).** (a) In H1: optional document on HR bank changes (B13) and ESS change requests (`POST /me/documents`,
  24 h purge of unlinked uploads, B17); (b) out until a later slice. **Rec (a):** spec §5/§7 and the contract have it; evidence on a bank change is
  standard practice against payment fraud, and the file store is ready.
- **OQ-10 Directory status options (lead).** (a) H1: Active · Ended · All (default Active); H2 adds "Active and on leave" and "On leave"; (b) show the leave
  options empty now. **Rec (a):** `ON_LEAVE` is derived by H2 (H1-22); no option that can never match.
- **OQ-11 Non-bank pay-details fields (money rule, Jabran).** Tax residence, pension, union, holiday-pay route, PK EOBI/PESSI refs: (a) direct
  `SENSITIVE.UPDATE` edit with reason, audited, takes effect on save; only the bank account waits for a second person; (b) every pay-details change waits.
  **Rec (a):** J-3 covers bank changes (the redirect-pay fraud path); the others are audited sensitive edits, as CA-14 does for national ids.
- **OQ-12 Overview probation and contract end (lead).** (a) In H1 from the job row (H1-26, HR-5), shown when set; (b) later. **Rec (a):** the
  columns ship in V13 anyway; the spec lists them on Overview.

## Brief-check rows → where applied (`brief-check-hrp-h1.md`)
| Row | Applied in |
|---|---|
| employees columns + code sequence (H) | H1-B3 (V13), H1-B1 (2) |
| job_assignments v1 columns (M) | H1-B3 |
| `kind` (H) | H1-B1 (3), H1-B4, OQ-8 |
| paging shape (H) | H1-B1 (4), H1-B4 |
| `actions` / v1 rows (H) | H1-B1 (5)(6), Decided 8 |
| PAY_DETAILS.APPROVE defaults, customised role (M) | H1-B2 |
| BE-1 audit rows (H) | H1-B4, H1-B5 (B15 keeps BE-2b rows) |
| sub-department count (M) | H1-B1 (7), H1-B5 |
| column grants location (M) | H1-B8 (V12 in BE-1a) |
| seed per slice, two-employer login, zone, Danmark (H) | H1-B9 |
| B10 order (M) | Slice BE-2a, Decided 5 |
| cipher naming (H) | BE-2b intro line |
| file-store at rest + company key (M) | H1-B14 |
| attachments (M) | H1-B13, H1-B17, OQ-9 |
| non-bank pay fields (M) | H1-B13, OQ-11 |
| V15 RLS kit (H) | H1-B16 |
| risk paths per slice (L) | Batching line, H1-B10, H1-B16 |
| ended record read-only (M) | Decided 9, H1-B4 test |
| cipher keys in stack steps (H) | Rules, local stack |
| size cut (H) | BE-1a / BE-1b / BE-2a / BE-2b / BE-3 |
| contract freeze (M) | Decided 10 |
| App-only rows | `brief-hrp-h1-app.md` table |
