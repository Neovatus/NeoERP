# Step 0 independent completion review — Codex, 2026-10-04

Verdict: **do not mark Step 0 COMPLETE yet.** Two verified permission-escalation paths remain, alongside the acceptance and product decisions already listed by the reviewer. Part 1 was read-only: no code, contracts, migrations, plans or repository files were changed. This report is its only output. Findings below are for the reviewer to assign; they are not authorization to implement them.

## Follow-up disposition — 2026-10-04

All eight findings below are fixed: backend `62ec307` resolves B1/B2/M1/N2/N3; app `cc80faa` resolves M2/M3/N1. Fresh independent Codex cross-review (each reviewer inspected code they did not author) found no actionable defects in these fixes. Jabran now assigns closure review to Codex; Claude is optional. User-service 433 and HR-service 85 tests passed in Part 3, and all four CORS regression cases passed. A subsequent full app run after the separately reported Standard roles decoding fix passed **532 tests, zero failures/errors/skips**, including the formerly offline live-auth diagnostic and screenshot suites; Android compilation also passed. Standard roles now accept the backend's nullable member count (`e09c1f3`); authenticated live gateway/owner probes returned 14 roles with HTTP 200.

The original report and pre-fix line evidence are retained below as history. Its eight findings are no longer open. This disposition does not certify whole-Step-0 completion: audit reason transport/wording, Enter-company attribution and remaining live/device acceptance are tracked in the owning IAM/platform plans. No applied migrations or PROJECT-STATE changes.

## Snapshot and scope

Reviewed clean App `8492827` and backend `81344c5`, including every section 2 range in STEP0-COMPLETION-REVIEW.md and the additional batches `0529bd4..8492827` / `6eb3e3b..81344c5`. Read HANDOFF.md, module-sequence.md, the IAM and platform plans, people-pa1.md and roles-rl1.md, relevant specs, implementations, tests and review-channel decisions. Three independent read-only workers covered frontend behavior, IAM authorization, and onboarding/concurrency; the lead checked their evidence and gateway/org changes. No tests, service starts, migrations or live exploit attempts were performed in Part 1. Existing tests are supporting source evidence, not a claim that they ran in this review.

Paths below are relative to the indicated repository. Line numbers refer to these pre-fix snapshots.

## BLOCKER

### B1. Resetting a customised role restores permissions beyond the caller's ceiling

Evidence: **BackEnd** `services/user-service/src/main/kotlin/com/neovatus/user/application/service/rbac/role/RoleService.kt:370`, `:375`; `delivery/http/rbac/role/controller/RoleController.kt:110`. The reset path computes standard versus copy codes, then moves all holders and pending invitations to the standard role without `requireWithinOwnRights`. The HTTP check establishes role-management rights only. `applyUpdate` performs the missing check at RoleService.kt:416. This contradicts `docs/api/roles-rl1.md:191` (“Rules enforced on every write”).

A delegated editor with IAM.ROLE.UPDATE but no payroll approval can reset a reduced Payroll copy and restore payroll approval to its holders, potentially including the editor. Suggested fix: validate `standardCodes - copyCodes` against the caller's effective permissions before moving references; explicitly preserve the entitlement rule and baseline exemption. Add a negative reset test asserting no movement/deletion/audit on refusal.

### B2. Editing a pending invitation can remove a DENY without holding the restored permission

Evidence: **BackEnd** `services/user-service/src/main/kotlin/com/neovatus/user/application/service/onboarding/OnboardingService.kt:408`, `:421`, `:434`; `delivery/http/onboarding/controller/OnboardingAdminController.kt:80`. Only added roles and new/changed ALLOW exceptions reach the held-permission check. Removing a stored DENY is omitted, although removing it restores access. Normal membership edits correctly include removed DENYs in `application/service/rbac/access/AccessChangeService.kt:360`.

An administrator with invite/override management but without X can keep a broad role on an Owner-created pending invitation and delete DENY(X); the recipient receives X on acceptance. Suggested fix: resolve removed DENY codes from stored rows and treat them as grants through the same ceiling check. Add an invitation-specific regression that refuses this change and preserves the saved invitation.

## MAJOR

### M1. Invitation acceptance can reverse global administrative deactivation

Evidence: **BackEnd** `services/user-service/src/main/kotlin/com/neovatus/user/application/service/onboarding/OnboardingFirstLoginService.kt:101`; `application/service/user/admin/UserAdminService.kt:241`; `application/service/user/me/UserMeService.kt:48`; `configuration/security/SecurityConfig.kt:25`. Any closed valid invitation, including `Accepted.WithoutAccess`, activates INACTIVE as well as PENDING users. Global deactivation leaves memberships intact and queues session revocation. Authenticated /me invokes acceptance without requiring an active lifecycle status.

A deactivated existing user with a pending invitation can use a still-valid access token to call /me and become ACTIVE again, restoring old memberships. This is pre-existing at the PA-1 base, retained by the reviewed code, rather than a new PA-1 regression. Suggested fix: autoactivate PENDING only, or explicitly distinguish a never-onboarded withdrawn invitation from administrative deactivation. Add a /me regression using a deactivated user with an unrelated active membership and a pending invitation.

### M2. Invitation preview can retain a previous recipient's access after the email changes

Evidence: **App** `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/people/presentation/PeopleViewModel.kt:785`, `:809`; `PeopleWording.kt:340`. Changing email clears lookup but preserves preview; the next preview is scheduled only if lookup returns a user ID. Existing recipient A → new recipient B, or lookup failure, leaves A's effective ticks and sources in B's Review step. Sending is not blocked by preview freshness. Server authorization remains enforced, but the administrator approves a misleading preview.

Suggested fix: cancel/invalidate identity-dependent preview immediately and re-preview each settled lookup, including null user ID; prevent stale results from repopulating it. Test existing → new → existing and lookup failure.

### M3. Sheet authentication failures bypass session-expiry handling

Evidence: **App** `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/people/presentation/PeopleViewModel.kt:109`, `:1033`. The expiry watcher includes list/person/company errors but omits sheet save and preview errors. An expired/revoked session during Invite or Change access is recorded only in the sheet; refresh clears tokens, but this owner does not emit sign-out. Signed-in UI and loaded people data remain until another watched operation fails.

Suggested fix: include sheet errors and other PA-1 error channels in expiry handling, preserving the existing offline-refresh exception. Test refused refresh during submit and preview.

## MINOR

### N1. Partial company metadata failures have no same-company retry

Evidence: **App** `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/people/presentation/PeopleViewModel.kt:266`, `:269`, `:356`; `CompanyPeopleTab.kt:180`. A successfully loaded catalogue suppresses metadata reload even if roles, permissions or reach failed; normal refresh omits it and the error has no retry action. Suggested fix: explicitly retry metadata on partial failure and provide the shared retry affordance. Test catalogue success / roles failure followed by recovery without switching companies.

### N2. Batch leases can expire before later entries are attempted

Evidence: **BackEnd** `services/user-service/src/main/kotlin/com/neovatus/user/application/service/onboarding/EmployeeLinkRequestDispatcher.kt:55`; `services/hr-service/src/main/kotlin/com/neovatus/hr/application/service/employee/outbox/IamLinkOutboxDispatcher.kt:48`. The complete batch is claimed before sequential network calls. Fifty slow calls can exceed the first-attempt 30-second IAM lease or two-minute HR lease; a second worker can reclaim later entries and consume retries. Idempotency/version checks limit correctness impact. Suggested fix: claim near dispatch, renew leases or bound concurrent batches; test two workers with a delayed first entry.

### N3. CORS check reports PASS on an unreachable gateway

Evidence: **BackEnd** `scripts/gateway-route-check.sh:186`, `:192`. Absence of Access-Control-Allow-Origin alone counts as a refused preflight, even when curl times out or returns no HTTP response. Other checks can fail the run, but this individual evidence is false. Suggested fix: require a received HTTP status and the documented refusal response before PASS; classify missing response as failure/not proven. Test a nonresponsive endpoint.

## Section 3 claims and sections 4–5 verdicts

| Claim/verdict | Independent disposition at latest heads |
| --- | --- |
| Dashboard, Inbox, Companies/detail, Agreements, Requests, People, Staff, roles, audit, Enter company are implemented | Confirmed in source; this review does not certify live acceptance. Agreements partial-load error and audit current-page export are accurately described. |
| Standard roles “BROKEN live”, parent protection not built | Superseded: 6604a69 routes standard roles to user-service; 9ec1fe6 adds domain/service checks and org V28 trigger; 81344c5 checks franchise requests at raise and approval. Runtime restart/route acceptance remains open. A cross-row rule correctly uses a trigger rather than an impossible cross-row CHECK. |
| Internal routes closed, actuator protected | Confirmed route/security configuration and added tests. Route indices are contiguous and user-platform precedes org-platform. Authenticated smoke checks and audit-write refusal still require actual execution. |
| Grant only held / Taken away wins / final Owner / Branch Manager reach | DENY subtraction, membership removed-DENY checks, place reach and final-Owner locking exist. B1/B2 disprove the blanket grant-ceiling claim. |
| Onboarding savepoint and lock order | Transaction-bound JDBC savepoint preserves DENYs with activation; nontransactional follow-up repositories avoid poisoning the outer transaction. Contract explicitly allows failures outside that savepoint to fail sign-in (people-pa1.md:940). Sorted refreshed invite locks, employee advisory lock before ordered membership locks, and outbox dispatch outside sender row-lock transactions are present. Existing PostgreSQL tests cover key interleavings; not every possible cycle is proven absent. Add multi-invite acceptance versus HR placement coverage. M1 remains. |
| Migrations | Reviewed local constraints, V24–V32 IAM changes, HR V9 duplicate preflight, and org V28 existing-data preflight/parent FOR SHARE/type-change guard. No new cross-service FK. No clean migration execution in this part; retain the clean-start gate. |
| Platform People effective permissions/source | Still absent: PlatformPeopleScreen.kt:457 directs the operator to Open company. Explicit acceptance or implementation remains required. |
| Screenshot tests absent / W5 fixes unfinished | Superseded by render fixtures and UI fixes at 97845b6/8492827. Fixtures check image creation rather than baseline image comparison, so they are not proof of visual regression protection or device acceptance. |
| Stub destinations, dead endpoint/contract, old login-auth plan | Removed/retired in the latest app range. Some backend frontend docs still describe retired identity/invite routes; those are the specifically approved Part 2 cleanup. |
| IAM/platform decisions settled by built behavior | Current plans record D-1/6/7/8/11 and D-PA1-3. This supports recording implementation decisions; it does not settle the outstanding HR Officer, ESS-context, franchise-terms or audit-catalogue questions. |
| Ready to mark COMPLETE | Disputed. Keep in progress: B1/B2, M1–M3, real-device login, PA-1/persona/clean-seed acceptance, authenticated gateway run, Platform People decision, franchise terms, audit catalogue/fixes and rig reconciliation remain. HR-specific deferred items remain at their owning module. |

## Known approved follow-ups, separate from new findings

Part 2 is limited to the user's five Claude-reviewer items: remove the dead audience exemption; use details.code for PARENT_NOT_OWNED with text fallback; carry requester companyType and adjust approval/error UI; move inner row clipping to NeoSectionCard; refresh the named docs. None of B1–N3 is included in that implementation authorization. The reviewer assigns those fixes.
