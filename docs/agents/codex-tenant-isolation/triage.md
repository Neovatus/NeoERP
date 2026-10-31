# Triage: Codex tenant isolation audit

Date: 2026-10-31. Reviewer: Claude (adversarial verification, read-only).
Input: `docs/agents/codex-tenant-isolation/report.md` (brief §8, `docs/agents/codex-briefs/README.md`).
Backend checked: `NeoERP-BackEnd` dev `2cc8423`. This is the revision Codex audited; nothing in the backend changed after it.
Method: for each finding and each "N" row, I traced the request from gateway route through the shared guard (`ServiceAccessInterceptor`, lifecycle filter), controller `@PreAuthorize`/`@ServiceEndpoint`, authorization bean, service and repository/SQL. I also checked the token issuers (auth-service `JwtCustomizerConfig`, Keycloak realm mappers) for the claims the checks depend on. No Gradle runs, no HTTP calls, no edits in either repo.

## Summary (sorted by severity)

| ID | Codex says | Verdict | Severity (mine) | One line |
|---|---|---|---|---|
| **NEW-01** | (not reported; the "Shared user identity" row was marked Y) | **CONFIRMED (missed)** | **High** | Company A can read and overwrite the shared personal profile (national ID, tax ID, date of birth, address, phone, name) of anyone, including B's people. It needs only their email and an unaccepted invite. |
| TI-01 | HIGH | **CONFIRMED** | High (hard to exploit) | A reviewer in A can write a review row onto B's performance goal. Needs B's goal UUID. |
| TI-04 | HIGH in local/test, prod blocked | **CONFIRMED** (gated) | Medium overall; High in any shared env running `local`/`test` | Payroll has no company column. The 503 gate holds wherever the active profiles are not only `local`/`test`. |
| TI-02 | HIGH | **PARTLY** | Medium | Foreign manager, department, designation, branch and actor IDs are accepted. The effect is A pushing its own employees into B's manager views, not A reading B. |
| TI-06 | MEDIUM | **CONFIRMED** | Medium (prevention gap) | The architecture test imports only hr, payroll and accounts, and only interfaces whose names end in `*Repository`. |
| **NEW-02** | (not reported) | **CONFIRMED (missed, same-company)** | Medium | HR approvals take `approverEmployeeId` from the request body, so anyone with the APPROVE permission can act as "the manager". |
| TI-03 | HIGH, conditional | **PARTLY**: defect real, unreachable today | Low today; High if an `employee_id` claim is ever added | Neither token issuer emits `employee_id`, so the fallback always denies. Lists without a filter return 403, not every company's rows. |
| TI-05 | MEDIUM, conditional | **PARTLY**: unreachable today | Low today | Shift create, list and update always return 403 for everyone (the same missing claim). The definitions are company-less, as Codex says. |
| "Shared user identity / security changes" = Y | Y | **WRONG** (only partly true) | — | Only email change, security resets and "everywhere" status changes need authority over every company. A plain profile PATCH and GET do not. See NEW-01. |

Counts: 6 Codex findings. 2 confirmed (TI-01, TI-06), 1 confirmed but gated (TI-04), 3 partly right (TI-02, TI-03, TI-05), 0 wrong outright. 2 missed issues added (NEW-01 High, NEW-02 Medium). One Y row is wrong.

Row tables: the endpoint table has 94 rows (74 Y, 20 N). The repository table has 315 rows (108 Y, 207 N). All 20 endpoint N rows map onto TI-01 to TI-05 (details below). None of the 207 repository N rows is an exploit on its own. That column means "no mandatory scope argument on the port", not "data leaks" (Codex says so in its own preamble). One repository N row, user `MembershipRepository` / `userBelongsToOrg`, is the enabler of NEW-01, which Codex did not connect.

## Details

### NEW-01 — High — An unaccepted invite gives company A read and write access to a person's shared profile (missed by Codex)

**Path:** `POST /api/admin/onboarding/invites` (gateway route `/api/admin/**` → user-service) → `OnboardingService.create` (OnboardingService.kt:197-210). For an existing account it saves an **INACTIVE pending membership in A** immediately (OnboardingService.kt:787-797). The response carries `applicationUserId` (OnboardingDtos.kt:69). Then:

- `GET /api/admin/users/{id}?orgId=A` → `canReadUser` (UserAdminAuthorization.kt:168-174) = `IAM.USER.READ` in A **and** `userBelongsToOrg(id, A)`.
- `PATCH /api/admin/users/{id}?orgId=A` → `canWriteUser` (UserAdminAuthorization.kt:176-182) = `IAM.USER.UPDATE` in A **and** `userBelongsToOrg(id, A)`. Only a changed `email` adds `canChangeEmail`, which requires every company (:257-268).
- `userBelongsToOrg` (UserAdminAuthorization.kt:497-498) is `findByFilter(userId, orgId, includeLocations = true).isNotEmpty()`. It has no status filter and no `excludePendingInvites`, so a pending invite counts.
- `UserAdminService.updateUser` (UserAdminService.kt:138-175) patches the **global** `users` row: fullName, phoneNumber, profileImageUrl, address, dateOfBirth, gender, userType, timezone, locale, nationalId, taxRegistrationId (UpdateUserRequest.kt:5-18).

**Failure scenario:** An admin of company A (IAM.USER.INVITE plus IAM.USER.READ/UPDATE, the normal org-admin set) invites `someone@b-company.com`. B's employee has not accepted and may never accept. The A admin can then read that person's national ID, tax registration ID, date of birth and address, all held on the shared identity, and overwrite them. B's screens show the overwritten values because the row is shared. The victim only gets the "you've been added" notice (no-forced-reset rule, D-7).

Contrast: security actions (`UserSecurityPolicy.decide`, UserSecurityPolicy.kt:61-86) and email change already require authority in **every** company the person belongs to. Profile fields were left out of that rule.

**Fix:** (1) `userBelongsToOrg` must ignore pending, never-activated memberships for reads and writes (`excludePendingInvites = true`, plus status ACTIVE for writes). (2) Writing the shared profile gets the email rule: authority in every company the person belongs to. Alternatively, sensitive fields (nationalId, taxRegistrationId, dateOfBirth, address) become person-self-service only, and per-company data lives on the HR employee record. (3) GET returns sensitive fields only under the same rule, otherwise masked. Add a two-company test: invite B's person from A, then GET and PATCH both return 404/403.

**Architecture-test rule:** In user-service, any class in `..application.service.user.admin..` that calls `UserRepository.save` must depend on a single `SharedIdentityWritePolicy` (the `UserSecurityPolicy` pattern). Ban `MembershipRepository.findByFilter` calls from `UserAdminAuthorization` that do not pass `excludePendingInvites` (a source scan in the style of the existing outbox SQL scan). Pair with the two-company test above.

### TI-01 — CONFIRMED — High (low exploitability)

Verified: `PerformanceController.createReview` (:48-52) authorizes only `canReviewPerformance(reviewerEmployeeId)` (HrAuthorization.kt:149-150), i.e. the reviewer's company. `PerformanceService.createReview` (:45-58) checks `existsGoalById` (raw, PerformanceRepositoryAdapter.kt:35) and saves. No shared filter or aspect adds a tenant check: `@SelfAuthorizedEndpoint` hands the decision to the method rule (ServiceAccessInterceptor.kt:95-99). The FK `fk_performance_reviews_goal` (V3__hr_performance.sql:41) only proves the goal exists.

Extra Codex missed: `reviewerEmployeeId` is any A employee, not the caller (see NEW-02).

Exploitability: goal IDs are random UUIDs and A cannot list B's goals: the goals list needs an employee in B, or the dead TI-03 fallback. No endpoint reads reviews today, so B sees nothing yet. It is still a cross-tenant write, so High stays.

**Fix:** load goal → employee → company, require that the reviewer is the caller's own employee record in that company, and authorize HR.PERFORMANCE.REVIEW at the goal's company. Scoped finders.

**Architecture-test rule:** classes in `com.neovatus.hr.application.service..` must not call the raw existence/lookup methods (`existsGoalById`, `existsById`, `findById` on `@TenantOwnedRepository` ports) except via a shrink-only allowlist of (caller, method) pairs. Owner resolution lives in `configuration.security` only.

### TI-02 — PARTLY — Medium

Verified: `EmployeeService.create/transfer/promote` (EmployeeService.kt:42-50, 121-170) accept `managerEmployeeId`, `branchId` and `departmentId`/`designationId` with raw existence checks only. `requireChangedBy` (:327-330) accepts any employee. History append (EmployeeHistoryService.kt:21-40) and lifecycle create/approve (EmployeeLifecycleRequestService.kt:35-60, 100+) behave the same. `ManagerService.directReports` (:152) uses `findAllByManagerEmployeeId` without company.

Where Codex is off: the A writer cannot use this to read B. `canReadManager` authorizes at the manager's company, and transfer/promote are gated on the stored employee's company. The real effect is that **A injects its own employees, leave and goals into B's manager dashboard and team views**. That is an integrity and confusion problem for B, plus A data shown to B by A's own action. Approving A's leave from B is still refused (`canApproveLeave` uses the employee's company). Medium, not High.

**Fix:** as Codex says: validate every secondary reference against the stored employee's company, query direct reports by (company, manager), derive the change actor from the token, and validate branch through org facts.

**Architecture-test rule:** same rule as TI-01, plus: no `@TenantOwnedRepository` method whose only selector is a foreign-key ID (`findAllByManagerEmployeeId`, `findAllByBranchId`) may be used outside `configuration.security`.

### TI-03 — PARTLY — Low today, latent High

The defect is real: `contextOf` (HrAuthorization.kt:247-257) authorizes the token employee's company when no filter is given, and the repository then runs with `companyId = null` (EmployeeJpaRepository `:companyId IS NULL OR …`, `findAll()` in several adapters).

It is unreachable because `currentEmployeeContext` (:278-282) needs an `employee_id` claim, and no issuer emits one. auth-service's `JwtCustomizerConfig` (:84-101) adds neoerp_identity_id, preferred_username, idp, email, name, idp_sid, client_id and azp only. The Keycloak realm has only the `realm_access.roles` mapper (infra/keycloak/realm/neoerp-realm.yaml:196). Today every list called without a filter returns **403**. That is a functional bug, not a leak.

Risk: one innocent mapper change turns it into a cross-tenant read across ~10 HR lists.

**Fix:** delete the `employee_id` fallback (recommended). Require an explicit companyId or employeeId on every HR list, and pass the authorized company into the query as a non-null scope.

**Architecture-test rule:** no nullable `companyId` parameter on a `@TenantOwnedRepository` method. Ban the JPQL/SQL text `:companyId IS NULL` in hr/payroll main sources (a source scan like `systemOutbox_exposesNoInsert`).

### TI-04 — CONFIRMED (gated) — Medium overall

Verified: no company column in the payroll V1/V2 tables. The native assignment UNION has no company predicate (SalaryAssignmentJpaRepository.kt:11-34). `PayrollAccessRules` resolves the selected company only to check permissions and never passes it down (:64-90). The gate (`PayrollTenantIsolationGateFilter.kt:16-37`) returns 503 on `/api/payroll/**` unless the active profiles are non-empty and all in {local, test}. Every payroll controller sits under `/api/payroll` and there is no internal payroll route, so the gate covers all 8 controllers.

The open question is deployment. The repo has no deploy manifests (`SPRING_PROFILES_ACTIVE` appears nowhere), so I cannot rule out a shared demo or staging run with `local`.

**Fix:** as Codex says (the ADR-012 migration). Keep the gate.

**Architecture-test rule:** every `CREATE TABLE` in `payroll`/`hr` Flyway migrations has `company_id NOT NULL` unless the table is on a reviewed platform-reference allowlist (migration source scan). Plus Codex's port rule.

### TI-05 — PARTLY — Low today

Verified: shifts have no company and update is by raw ID (ShiftService.kt:25+, ShiftRepositoryAdapter.kt:18). But `ShiftController` create, list and update (:31, :37, :43) use `canManageShift/canReadShift(authentication, null)`, which needs the missing `employee_id` claim. So the endpoints are always 403 for everyone, and shift definitions cannot be managed at all today. Assignments (:49, :55) are gated per employee.

**Fix:** decide whether shifts are company-owned (add company_id and scope) or platform reference data (move to a platform catalog endpoint). Either way, remove the null-context rule.

**Architecture-test rule:** covered by the TI-03 and TI-04 rules.

### TI-06 — CONFIRMED — Medium

Verified: `TenantRepositoryArchitectureTest` (:20-27) imports only `hr`/`payroll`/`accounts` outbound packages and only interfaces whose names end in `Repository`. user, org and audit are not covered at all, which is exactly where NEW-01 sits.

**Fix and rule:** as Codex proposes. Import every service. Classify every interface implemented by a class in `..infrastructure.persistence..`, whatever its name. Add a "shared-identity" classification for user-service ports whose methods take a user/person ID, and require their callers to go through an allowlisted policy class (see NEW-01).

### NEW-02 — Medium (same-company integrity, not cross-tenant)

`LeaveService.approve/reject` (:52-76), `LeaveEncashmentService` (:71-79, :138-141), `AttendanceWorkflowService` (:46-47, :113-116) and `EmployeeLifecycleRequestService.approve` (:100, :213) all take `approverEmployeeId` from the request body. They check only that the approver is the employee's manager when one is set. Any holder of HR.LEAVE.APPROVE or HR.ATTENDANCE.APPROVE in the company can pass the manager's ID and approve "as the manager". When no manager is set, any employee ID is accepted, including one from another company. The same pattern applies to `reviewerEmployeeId` (TI-01) and `changedByEmployeeId` (TI-02).

**Fix:** resolve the actor's employee record from the token (`findByCompanyIdAndUserId`, as ESS does) and drop these body fields.

**Architecture-test rule:** no request DTO in `com.neovatus.hr.delivery.http..dto` may declare a field named `approverEmployeeId`, `reviewerEmployeeId` or `changedByEmployeeId`. Actor identity comes from the token only.

### The 20 endpoint N rows

| Rows | Maps to | Verdict |
|---|---|---|
| PerformanceController | TI-01 | CONFIRMED (review write) |
| EmployeeController, EmployeeHistoryController, EmployeeLifecycleRequestController, ManagerController | TI-02 (+TI-03 list) | PARTLY (integrity, no B read) |
| AttendanceWorkflowController, DepartmentController, DesignationController, LeaveController, LeaveEncashmentController, LeavePolicyController | TI-03 only | Not exploitable today (403). Per-ID approve/update paths are owner-gated (verified `canApprove*`, `canManage*ById`) |
| ShiftController | TI-03/TI-05 | Not reachable today |
| 8 payroll controllers | TI-04 | CONFIRMED, gated in non-local/test |

### The 207 repository N rows

- accounts (12): system queues and helpers on the reviewed allowlist. Correctly not tenant-scoped. No issue.
- hr (52) and payroll (30): restate TI-01 to TI-05.
- org (35): every ID path resolves the stored owner before deciding (`OrgAuthorization.resourceAccess` :370+, `canReadRequest`/`canDecideRequest` :356-367, `WarehouseService.create` checks the branch belongs to the company, :36). Dated facts are scoped by `company_id` in every statement (OrgDatedFactsJdbcAdapter.kt:39-158). No issue.
- audit (12): reads need `orgId` plus IAM.AUDIT.READ there (AuditReadAuthorization.kt:22-35). Notification read is bound to the recipient (NotificationService.kt:60-68). Workflow decisions are machine-only. No issue.
- user (66): guards hold for memberships, roles, exceptions and sessions. Checked: `removeRedundantException` ties the exception to the membership (AccessChangeService.kt:445-448); session end checks ownership at Keycloak (auth-service IdentitySecurityConfig.kt:151-167). **Except** `userBelongsToOrg` counting pending invites, which gives NEW-01.

## Reliability of the report

- **Code facts are accurate.** Every file and line I opened said what Codex claimed. No invented code paths.
- **Severity is inflated for conditional items.** TI-03 and TI-05 are rated HIGH and MEDIUM even though Codex itself did not find an `employee_id` emitter. Two minutes in `JwtCustomizerConfig` settles that none exists. TI-02's attack direction is misdescribed: it is A contaminating B's views, not B being read.
- **A blind spot in user-service.** It accepted "shared identity operations require authority over every affected company" after checking the security and email paths, and missed that a plain profile PATCH or GET only needs a single, even pending, membership (NEW-01). It also missed the approver-from-body pattern (NEW-02).
- **Y-row sample (14 checked):** accounts journal detail (company in every SELECT, JournalJdbcAdapter.kt:312-318), export download (company plus requester, ExportJobService.kt:100-103), SIE file download (scope company on open), machine posting (pinned client, intentional), the AccountsEndpoint mechanism (central company authorization, no SelfAuthorized accounts handler except the platform catalog), org branch/warehouse/request, org dated facts, user membership exception removal, user sessions (own and admin), audit events read, audit notifications, HR holidays, HR leave balance, gateway routes (no `/api/internal/**` route). **13 correct, 1 wrong** (shared identity → NEW-01). Reliability is good for accounts, org and audit, and weaker for user-service shared-identity logic.
- The repository N/Y column measures structural enforcement, not exposure. Do not count the 207 N rows as 207 holes.

## Decisions for Jabran

1. **Fix NEW-01 first (recommended: yes, now).** It is live and needs only an email address. Recommendation: a pending invite never counts as "belongs to the company", and changing or reading sensitive shared-profile fields needs authority in every company the person belongs to, the same rule as email. Decision needed: **is the person profile (national ID, tax ID, date of birth, address) person-owned or company-owned?** I recommend person-owned and self-service, with per-company HR data on the employee record. That means company admins lose edit rights on those fields.
2. **One HR batch for TI-01, TI-02 and NEW-02 (recommended).** Resolve owners from stored rows, take the acting employee from the token, and remove the `approverEmployeeId`/`reviewerEmployeeId`/`changedByEmployeeId` body fields. That changes the API, so the App must stop sending those fields.
3. **TI-03/TI-05: delete the `employee_id` fallback rather than patch the queries (recommended).** Decision needed: are **shifts company-owned or platform reference data?** I recommend company-owned, matching holidays and leave policies.
4. **TI-04:** keep the gate. Confirm that no shared environment (demo, staging, review) runs payroll with only the `local`/`test` profile. Yes/no from you.
5. **Architecture tests (TI-06 plus the rules above):** approve adding them in the same batches as the fixes, starting with the user-service shared-identity rule and the HR "no raw lookups from services" rule.
