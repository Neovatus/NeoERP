# To the implementer (appended by the reviewer)

## 1 · 2026-10-03 · reviewer · answer
Answers to your PA-1 questions 1–10. All accepted, with these conditions:
1. Remove the exception on the source membership, but authorise the caller against the SOURCE membership.
   A Branch Manager viewing a branch can't remove a company-level exception; show it read-only ("from company access").
2. Drop the "Invited" pill from the spec.
3. V9 checks for duplicates and fails with a clear message naming them. No silent cleanup. Fix the demo seed if needed.
4. Add scheduling in hr-service for the link outbox. Claim each row before sending (FOR UPDATE SKIP LOCKED or equivalent)
   so two instances can't double-send. Calls stay idempotent and versioned.
5. Add one Testcontainers test for V9 and the employee–login link.
6. Include docs/database/db-design.md in the docs package.
7. Keep HR.EMPLOYEE.WRITE for PA-1 and split it at the HR module step.
8. File-split changes accepted.
9. Branch and company membership lookups must match warehouse_id IS NULL, so a location row is never taken as the branch membership.
   The focused review also covers: grant only what you hold, Branch Manager reach, last Owner and self-lockout,
   and the accessVersion conflict. Add tests for each.
10. Fix "Last active" clipping and replace NeoDialogCard, only in the PA-1 screens being rewritten.
At the B0/A1 checkpoint, append a `review-request` with the commit range for each repo to to-reviewer.md.

## 2 · 2026-10-03 · reviewer · review
Re your entry 1: thanks, nothing to change. Spot-reviewed X1 cb75783: OK.
- The scopes are on the right clients: user-service holds hr.employee-link, hr-service holds iam.employee-link. The audiences map correctly.
- Reminder for H1: hr-service doesn't accept the `neoerp-hr-internal` audience yet. Its resource-server config must
  require that audience plus the `hr.employee-link` scope on /api/internal/hr/**. That route must accept ONLY service tokens
  (the person endpoints accept only person tokens). Add a test that a person token is refused there.
  Same rule in user-service for /api/internal/iam/employee-links/**, with iam.employee-link.
Waiting for the B0/A1 review-request.

## 3 · 2026-10-03 · reviewer · info (scope, confirmed by Jabran)
PA-1 scope is services and screens for this feature only:
- Backend: user-service (people, access, invites), hr-service only for employees without a login, the employee link
  and the ESS lookup by (company, user), plus the auth-service scopes (done).
- App: People list, Invite / Add / Change access sheet, person Access tab. On the HR employee screen, ONLY
  "Give app access" and "Link to employee"; leave the rest of that screen as it is.
- Out of scope: the older screens (HR, Payroll, Accounts, ESS, Reports, IAM legacy, Dashboard, Inbox) and the HANDOFF
  UI leftovers outside PA-1 screens. They are ported to the shared blocks and new codes when their module comes up
  in module-sequence.md. Don't refactor them now, even if they are nearby.

## 4 · 2026-10-03 · reviewer · info
Got your entry 2 (wave 1 review request). The review is running now: one reviewer on backend ff31946..b215299, one on app 95fdcef..0ecfd13.
Hold round two until my review entry arrives. Expect it in about 15–25 minutes.

## 5 · 2026-10-03 · reviewer · review (PA-1 wave 1: B0 ff31946..b215299, A1 95fdcef..0ecfd13)
Verdict: good foundation, but NOT ready for round two. Fix the 6 BLOCKERs plus the MAJORs marked "now" in B0/A1 (they touch frozen/shared files),
then append a review-request with the fix range. I'll re-review just those fixes.

What holds up: V28–V31 indexes/CHECK/FKs/numbering; warehouse_id IS NULL in the legacy finders and the authz lookup; EffectiveAccess (DENY wins,
reach); redundancy; source-membership checks in AccessGrantRules; self / Owner-lock / last-Owner; the DTO split; app paths/DTOs/enums match the
contract; places[], accessVersion + ACCESS_CHANGED, hasLogin=false; no Compose in the VM; labels follow spec §7; docs D-PA1-1/2 are right.

BACKEND BLOCKERS (B0)
B-1 B0's authorization part is missing (contract, Wave 1, "Authorization and effective access"). AuthzService still has its own union/DENY logic
    instead of EffectiveAccess; no warehouseId in AuthzService/OverrideDelegationPolicy; UserAdminAuthorization has no gate methods for B1–B4
    (people read with branch context, reach, lookup, preview, invite edit, employeeId link gate, person status, shared sets).
    Finish it now. Tests: a DENY at branch wins over a company role; location falls back to branch, then company.
B-2 AccessGrantRules.CallerAccess (27-44) has no factory, and codesAt() falls back to companyCodes for a missing branch. A builder that skips a
    branch where the caller has only a Taken away would let them grant a code they don't hold. Add CallerAccess.from(callerLayers, codesById, owner,
    superAdmin, platformCodes), computing codes for EVERY branch/location with an active membership via EffectiveAccess. Fix the KDoc.
    Test: company role gives HR.LEAVE.APPROVE, branch takes it away → requireHeld at that branch throws ABOVE_OWN_RIGHTS.
B-3 V28 backfill (46-65): a person who was active, deactivated, then re-invited (ensureMembership reuses the row) gets activated_at NULL → hidden,
    can't be reactivated, and hard-deleted with roles/overrides on revoke. Add `AND m.created_at >= i.created_at` to the first EXISTS. Edit V28 in
    place (not applied anywhere shared) and add a Testcontainers Flyway test for both cases. Jabran's local DB: if V28 already ran there, tell him
    the reset step in your report.

BACKEND MAJORS
M-1 now (port): last-Owner protection is check-then-act. Two Owners removing each other at once can leave none. Add a port method
    lockOwnersOf(orgId) (pg_advisory_xact_lock or FOR UPDATE on the ORG_ADMIN memberships). B3 calls it before counting. Two-thread test in B3.
M-2 now (ports), B4 implements: D-PA1-1 follow-ups. (a) Add claimByInviteId with FOR UPDATE SKIP LOCKED, and insert with a grace delay (~2 min)
    so the after-commit run and the sweeper can't both process a row. (b) Add an insert-if-absent override write for the after-commit ALLOW step.
    upsertOverrides would turn an admin's later DENY into ALLOW. (c) KDoc: claim + step + update in one transaction.
M-3 now: departure 5 → add the no-op EmployeeRoleUseCases bean (@ConditionalOnMissingBean). B5 replaces it. D1 notes the rename.
M-4 now: departure 3 → switch UserSeatGuard (50-53) and UserAdminAuthorization.userBelongsToOrg (365-366) to includeLocations=true in B0.
    Neither file is in B3's list.
MINOR (round two is fine):
- AccessVersion/SharedSetKey (SharedSetKey.kt:41): length-prefix or JSON-encode each row before hashing.
- B3: compare accessVersion after findByIdForUpdate, inside the write transaction.
- EffectiveAccess.redundancy: document or enforce ACTIVE layers only; add a test with an inactive wider layer.
- B5: map the uq_employee_links_org_user violation to a retryable 409, and on relink remove Employee from the old membership. Test both.
- B2: readOnly / canRemove are always computed against the SOURCE membership.
Departures: 1 change (B-3); 2 accept the table, ports per M-2; 3 change (M-4); 4 accept on the backend; 5 change (M-3); 6 accept (+ minors).

APP BLOCKERS (A1)
A-1 Departure 4: the app ignores the exception's sourceScope / readOnly / canRemove and works them out itself (PeopleAccessDtos.kt:87-103,
    PeopleAccessMapper.kt:196-243, PeopleAccessModels.kt:599-620, 669-675). Add the three fields to PaExceptionDto and AccessException, and use
    exception.canRemove / readOnly. Drop the scopeOf guess and the VM override. Mock emits them. D1 adds them to the contract's Exception shape.
A-2 Person.canToggleStatus (PeopleAccessModels.kt:552) is derived with any(membership.can.changeStatus), so a Branch Manager is offered
    Deactivate on a company-wide person and gets a 403. Contract change (I'll make it, see below): GET /api/rbac/people/{userId} gains
    can { changeAccess, changeStatus } with the list row's meaning; B1 implements it. A1 adds it to PaPersonDto and Person.
    canToggleStatus = can.changeStatus && !self && !lastActiveOwner.
A-3 The frozen sheet stubs aren't enough for A3: add reactivateMembership(membershipId, reason) to AccessSheetActions (ALREADY_MEMBER + INACTIVE →
    Reactivate), and add membershipCan to AccessSheetState from access.membership.can. Change access keeps roleIds when changeRoles is false.

APP MAJORS
- now: the mock is realistic only for an Owner. Add a second seeded caller, a Branch Manager at one cmp-001 branch, switchable. can(),
  roleOptions (ABOVE_OWN_RIGHTS + missingCodes, OWNER_ONLY), canTakeAway and notExtraable follow that caller; exceptions carry readOnly /
  canRemove. Otherwise A2–A4 can't build or test the security UI paths.
- now: listUnlinkedEmployees (PeopleServiceImpl.kt:265-280) sends no size, and hr defaults to 20. Send size=200 or page through.
- Edit invitation always sends expiresAt=null. Contract (I'll make it): null = unchanged. A3 sends it only when it changes.
- Two withdraw paths: the legacy revokeInvite posts "{}" and B4 will refuse it (REASON_REQUIRED). A2 moves CompanyPeopleTab to
  withdrawInvitation and deletes the legacy People revokeInvite. The legacy IAM screen's Withdraw (IamServiceImpl.kt:105-110) is NEEDS JABRAN,
  asked in chat; until he answers, leave it.
APP MINORS (A2/A3): openEditInvitation silently no-ops when the invite isn't loaded (load it or show a notice); sheet roles show as loading
until the preview answers; mock accessVersion should include reasons, separate from keyOf; move the PeopleLabels object out of the file that
imports Compose.
Departure 7: accept (a)–(d), with the withdraw note above.

## 6 · 2026-10-03 · reviewer · info (correction to entry 5)
Please make the two contract edits I said I'd make (A-2: person read gains `can { changeAccess, changeStatus }`; expiresAt null = unchanged
on PUT /invites/{id}). Also add the exception's sourceScope / readOnly / canRemove. Put all three in docs/api/people-pa1.md in your B0 fix
commit. I'm not committing to NeoERP-BackEnd while you build, so our git operations don't collide.

## 7 · 2026-10-03 · reviewer · answer
Re entry 3: all good. V28 edited in place with no reset is fine, since the local DB is at V27. The legacy Withdraw fix goes to A2 as stated.
One addition for the B0 fix: the re-verify must include the new Flyway test for both backfill cases. Waiting for your fix review-request.

## 8 · 2026-10-03 · reviewer · info
Got entry 4. Re-review of 7003fb4 and 8fd9ec0 is running (fixes only). Expect it in about 5–10 minutes. Hold round two until then.
The behaviour change (grant only what you hold for every caller) is Jabran's accepted contract decision 2, so it is confirmed.

## 9 · 2026-10-03 · reviewer · review (re-review: backend 7003fb4, app 8fd9ec0)
Close. Verified fixed: B-2, B-3, M-1 (port), M-2, M-3, M-4, the entry 6 contract edits, SharedSetKey; A-2, A-3, paging,
expiresAt, the app minors. The behaviour change is confirmed: the only bypasses are Super Admin and platform staff with the company in
scope, and authz results for existing callers are unchanged. Fix the 5 items below as one small commit, then start round two.
I'll review that commit together with the first round-two batch; no separate checkpoint is needed.

FIX BEFORE ROUND TWO
R-1 (MAJOR, new) The Owner role, and a FULL Enter-company session, hold every code EXCEPT HR.ESS.* / PAYROLL.ESS.* (V27 rule O-1). Under
    grant-only-what-you-hold, Owners now get 403 ABOVE_OWN_RIGHTS giving Employee, or any role containing ESS codes. That breaks current
    invite and PUT-roles flows. Apply ONE rule in both UserAdminAuthorization.rolesGrantable (~332-341) and AccessGrantRules.notHeld (~355-366):
    (a) self-service codes (HR.ESS.*, PAYROLL.ESS.*) are never counted in `needed`, because they are personal, not delegable power; and
    (b) the Employee role is refused first with EMPLOYEE_MANAGED wherever the contract says it's managed, before the held check.
    Fix contract lines ~629 ("Owner holds every code") and ~1212 ("except Owner / Super Admin / Enter company") to match.
    Test: an Owner gives a custom role containing HR.ESS.READ → allowed; the preview shows Employee as EMPLOYEE_MANAGED, not ABOVE_OWN_RIGHTS.
R-2 (B-1 leftover) AuthzController (21-27): add @RequestParam(required=false) warehouseId, pass it to effective(...), map it in the
    response, and add a controller test. Contract: a caller sending warehouseId must also send branchId; say so at ~955.
R-3 (A-1 leftover, frozen DTO) PaExceptionDto.readOnly must default to TRUE (canRemove stays false), so an older backend fails closed in the UI.
R-4 (mock, shared file) MockPeopleAccess.exceptionDto: readOnly = inherited || readIsReadOnly || !changeable (contract ~271).
    Flip the test to assertTrue(inherited.readOnly).
R-5 (mock, shared file) MockPeopleService: gate the Branch Manager on changeMembershipStatus, withdrawInvitation, dismissSharedSet,
    linkEmployee and lookupEmail (as moveSharedSetToRole does). Reactivate doesn't cascade (only deactivate does). Add SELF_CHANGE,
    WIDER_ACCESS_DEACTIVATED, NOT_ACCEPTED_YET and the 6-character reason check. Person reactivate under a deactivated company
    membership → 409 WIDER_ACCESS_DEACTIVATED, not 403.

FOR ROUND TWO (put these in the job briefs)
- B3: call lockOwnersOf(orgId) inside the transaction on EVERY path that can remove an Owner (role change, status, revoke, move-to-role),
  plus the two-thread test. Compare accessVersion after findByIdForUpdate.
- B4: a late sweeper retry must not re-add an Extra an admin deleted after acceptance. Mark the step done before writing, or skip the
  permission if any override row for it was touched after accepted_at.
- B2/B3: canGrantRoles/canAssignRoles also take the target's warehouseId (a DENY at the caller's location must count).
- B1–B4: add CallerAccessResolver tests (company, branch and read-only sessions). A branch session should let a location fall back to
  its own branch, to match AuthzService.withoutMembership.
- Legacy OverrideDelegationPolicy: align its bypass with CallerAccess.bypasses (staff with PLATFORM.PEOPLE.ROLES in scope), or record
  that the legacy path needs Enter company.
- A3: reactivateMembership keeps the sheet open until success and routes refusals to sheet.refusal; check the 6-character reason on the
  client. Add a test for expiresAt-only-when-changed.
- A5: when the 50-page cap on unlinked employees is reached, show a notice rather than dropping the rest silently.

## 10 · 2026-10-03 · reviewer · answer (re entry 5, B5)
Q1 Accept the wider removal, with conditions:
   - Only memberships in THAT company. Never touch another company's.
   - Keep it if another ACTIVE (not EXITED) employee record in that company still places it.
   - Each removal writes the audit EMPLOYEE_ROLE_REMOVED with the cause ("employee exited" / "unlinked"), naming the membership.
   - Test: the person has 2 memberships, one deactivated → both lose Employee; a second active employee record → it stays.
   D1 updates the contract text, and notes that a hand-given Employee is removed by the backfill for an EXITED employee. This is intended:
   Employee follows the HR record.
Q2 Accept 409 EMPLOYEE_ALREADY_LINKED + details.retryable=true, plus two conditions:
   - Retries stop after a maximum (e.g. 10, with backoff capped at ~1h). Then the outbox row goes to FAILED and is logged loudly / audited.
     A clash can be permanent (two employee records claiming the same user), and must not retry forever.
     Test that it ends FAILED.
   - Unknown userId must not be a 500 retried forever. Check that the user exists and answer 422 (e.g. NOT_A_MEMBER, or USER_NOT_FOUND if you
     prefer; document it) as FINAL, not retryable. A 500 stays only for real faults.
FYI noted: the new port EmployeeLinkPushUseCases.kt is fine. Set servletPath in the WebMvc tests for /api/internal/**. Also keep one
test that a PERSON token is refused there (my entry 2).

## 11 · 2026-10-03 · reviewer · answer (re entry 6, hr tenant-scope baseline)
Accept your recommendation (a) + (b). Don't grow the baseline; this doesn't need Jabran.
a) Yes: company data methods take CompanyTenantScope (findAll, findByCompanyIdAndUserId, findByIdForUpdate, saveAndQueueLinkPush).
   The baseline must actually shrink by the two removed entries. Lower the cap in the same commit so it can't creep back.
   The ESS (company, user) lookup goes through the scope too: the company comes from the caller's token or context, never from a client parameter.
b) Yes, IamLinkOutboxRepository goes on a reviewed system/outbox allowlist with the justification line, inventory 29 → 30. Two guards:
   - Add an ArchUnit rule (or extend the existing one) so that only the outbox dispatcher/scheduler package may depend on IamLinkOutboxRepository.
     No controller and no person-request service may use it.
   - Writes to the outbox happen only inside saveAndQueueLinkPush (scoped). The outbox repository itself exposes no insert that takes a
     client-chosen company.

## 12 · 2026-10-03 · reviewer · answer (re entry 7)
(b) is done well, thanks.
(a) Accept 2 + 3:
   - The machine link write is its own method on the SYSTEM allowlist, with the same guards as the outbox: only the internal link controller
     path may call it; it takes the employee id and the company from the stored employee row, never from the request.
   - findAll+hasLogin, findByCompanyIdAndUserId and findByIdForUpdate go on a separate named "awaiting ADR-012" list. Give it a cap equal to its
     size (3), so it can only shrink, and a comment pointing to the open item.
   - The legacy baseline drops the 2 removed entries and its cap is lowered.
   - Record the open item "wire ADR-012 tenant gateway in hr-service (person + machine actor)" in the plan. It is its own task, not PA-1.
(c) CORRECTION to my entry 11. "Never from a client parameter" was too strict for how the code works today. Every company-scoped hr endpoint
   takes companyId from the client and authorises it, and that is the accepted pattern until ADR-012. So don't narrow the PA-1 scope;
   no NEEDS JABRAN. Instead:
   - /api/hr/me/** takes ?companyId= again (required).
   - userId comes ONLY from the token. The lookup is findByCompanyIdAndUserId(companyId, tokenUserId), so a person can only ever reach their
     OWN employee record.
   - Authorise first: the caller must hold HR.ESS.READ (HR.ESS.WRITE for writes) at that company via /api/authz/effective, as the other hr
     endpoints do. No active membership there → 403. No linked employee → 404 as today.
   - Drop the dependency on the employee_id claim for ESS (nothing issues it). Keep the claim only as an optional cross-check if present.
   - Tests: a person can't read another person's record by changing companyId (403 or 404); a person employed in two companies gets the right
     record for each.
   D1 notes this in the contract; the token claim vs workspace header question stays an open item for the HR/ESS step.

## 13 · 2026-10-04 · reviewer · info
Got entry 8. The round-two backend review is running: 4 reviewers by area (access writes and authz core; invites and sign-in accept; people reads
and preview; employee links, hr-service and docs). It's large (~14.5k lines), so expect it in about 20–30 minutes. Carry on with the app
integration meanwhile. Don't merge to dev's final state or hand to Jabran for testing until my review entry lands.

## 14 · 2026-10-04 · reviewer · review (PA-1 round two BACKEND 7003fb4..e8217f6)
Verdict: no BLOCKERs, solid work. These hold up: R-1/R-2; CallerAccess for every session; accessVersion under the row lock; the Owner lock on
the PA-1 paths, with a real two-thread race test; grant-only at the target's location; SELF_CHANGE; status cascade and WIDER_ACCESS_DEACTIVATED;
the D-PA1-1 savepoint with a real Postgres test; claimed follow-ups with insertIfAbsent; gates on reads; invited people excluded; the internal
routes take service tokens only, with tests on both sides; the versioned upsert; 422/409 handling; outbox FAILED after 10; V9 safety;
the ArchUnit guards.
Fix the 9 MAJORs below before Jabran tests (one fix batch, then a review-request). The MINORs can follow in the same batch or after.

MAJOR (fix now)
M1 SECURITY. Removing a Taken away isn't judged against what the caller holds (AccessChangeService.kt:325-332 applyChange, :665 moveToRole,
   old PUT /overrides). A Branch Manager can remove an Owner-set DENY on a code they don't hold, and the person regains it.
   Add the codes of removed DENY rows to requireHeld (applyChange, and per membership in moveToRole).
   Test: no HR.LEAVE.APPROVE + remove the DENY on it → 403 ABOVE_OWN_RIGHTS.
M2 Lost update on membership roles. EmployeeLinkService.place/removeEmployee (:141, :164) and OnboardingService (~:416) replace the role set
   from an unlocked snapshot while Change access holds the row lock. They can re-add a role an admin just removed.
   Take findByIdForUpdate(membership) before reading the roles, or use add-one/remove-one role operations.
M3 Owner lock missing: UserAdminService.requireLifecycleMutationAllowed (213-226, user deactivate/delete) counts Owners without
   lockOwnersOf. Lock each org from findActiveOrgAdminOrgIdsByUserId, in sorted order, inside the tx.
M4 Invite race: Withdraw/Edit/Resend and accept don't lock the invite row (OnboardingService:663-676, 372-417 vs
   OnboardingFirstLoginService:98-115). Withdraw can overwrite ACCEPTED with REVOKED while the person keeps ACTIVE access.
   Use SELECT … FOR UPDATE on the invite (or a conditional UPDATE … WHERE status IN (…)) and re-check the status after the lock:
   accept skips unless PENDING; withdraw/edit return 409 INVITE_NOT_EDITABLE once ACCEPTED.
M5 Data exposure: preview with userId and no membershipId (AccessPreviewController:25-28, AccessPreviewService:57-62, 94) needs only INVITE or
   ROLE.ASSIGN, yet returns the person's other memberships, roles and exceptions. Require canReadPerson in that case, or treat the person as new
   (no wider layers) when the caller can't read them. Test with INVITE but no USER.READ.
M6 N+1: the People list runs findByFilter per row (up to 200) plus an Owner count per Owner row; layersOf runs per membership/role;
   shared-set keys are recomputed for the whole company on every access read and Change-access response. Add batched reads (memberships by
   userIds, roles by membershipIds, permissions by roleIds) and use them in loadPeople, layersOf, SharedSets.keysOf and permissionCodesOf.
   Compute the shared-set keys once per request, or only for the list.
M7 ESS broken for normal employees (HrAuthorization.kt:173-174): identityIn calls authz/effective with no branch, so a branch- or location-only
   member gets 403. Departure 4 is NOT accepted as built. Decide membership from the member check (activeMembershipIds incl. branch and
   location), then authorise HR.ESS.* at the membership that holds Employee (employee_links.membership_id with its branchId/warehouseId).
   Tests: branch-only employee → 200; location-only → 200; another company → 403.
M8 hr lost update on the link: transfer/promote/changeStatus/approval (EmployeeService.kt:121, 145, 169) saveAndFlush the whole entity and can
   write back a stale user_id after an Unlink, then push it as truth. Map user_id/full_name/work_email updatable=false and write them only
   through the link, unlink and invite SQL, or lock or version. Test: a transfer interleaved with an unlink keeps user_id null.
M9 Employee-role writes per employee aren't serialised (EmployeeLinkService.kt:53, 79-89, 101-): overlapping pushes v2/v3 leave Employee on the
   wrong user. Take a per-employee lock (pg_advisory_xact_lock(hashtext(employee_id)) or FOR UPDATE on employee_links) in applyPush and in
   ensureEmployeeRole, and read `previous` under it. Two-thread test: relink A→B→C, and only C holds Employee.

MINOR
- moveToRole: sort membership ids before locking (deadlock). Compare WITH the kept Employee on both sides (dep 5 note).
- Delete the dead HeldPermissionDelegationPolicy and its test.
- Pre-check gates (canActOnMembership/canAssignRoles, PUT /roles,/status,/overrides) and canManageOnboardingInvite (withdraw/resend) should pass
  warehouseId. Test: a DENY at the location refuses Withdraw there.
- OnboardingFirstLoginService: wrap only the savepoint part in try/catch and let JPA errors propagate; fix the KDoc. When accept finds no pending
  membership, write an audit/event (accessStarted=false + reason), or leave the invite open.
- Orphan replacement (dep 3): first check that no open invite for the same userId stands at that place, else ALREADY_INVITED.
- EmployeeLinkRequest dispatcher: compute due-ness in SQL (no starvation by 50 backed-off rows), claim in a short tx, send outside it,
  cache the token.
- Tests: a location invite isn't refused by a branch membership/invite, and a second one at L gives ALREADY_INVITED. Refuse expiresAt <= now (400).
- can.changeStatus for deactivate: check only ACTIVE company memberships. holdsOwner: ACTIVE memberships only.
- Preview: check that warehouseId belongs to branchId/orgId (400).
- Lookup limiter: expire keys (bounded cache) and record that the limit is per instance.
- hr: clear the cached token on 401. The outbox row for a missing employee is logged and audited.
DEPARTURES: 1 accept (no flip). 2 accept; confirm no DB has run V29 (edited in place), else state the reset step. 3 accept with the orphan check
above. 4 NOT accepted (M7). 5 accept with the Employee-both-sides note. 6 accept: keep 401/403/404 retryable, and document it in the
outbox rules.

## 15 · 2026-10-04 · reviewer · answer (re entry 9)
The fix plan F1–F5 is good, go ahead.
Local DB:
- From now on, migrations V28–V31 and hr V9 are FROZEN: they have run on Jabran's local DB. Any schema change in the fix jobs goes in a NEW
  migration (user-service V32+, hr V10+). Never edit those files in place again; Flyway would fail on the checksum at his next start.
  Tell F1–F5 now.
- The context-tests issue goes in THIS batch as F6. It's file-disjoint: test resources only.
  Add src/test/resources/application-test.properties (or application.properties under test) for user-service and hr-service, so that
  @SpringBootTest uses Testcontainers (or the existing integration base) and NEVER the local Postgres. Add a guard that fails a test run
  pointed at localhost:5432/neoerp_* unless explicitly allowed.
- Check whether those context tests wrote rows into Jabran's local neoerp_iam / neoerp_hr (test users, memberships, invites, outbox rows).
  If they did, list them in your report and give Jabran a cleanup step. Re-running seed-demo-iam.sh on a fresh DB is fine if simpler.

## 16 · 2026-10-04 · reviewer · info
Got entry 10. The app review of 8fd9ec0..6012ca9 is running: one reviewer on logic and contract, one on UI consistency against the spec, rig and
building blocks. Expect it in about 15–20 minutes. Keep going with F1–F6 meanwhile.

## 17 · 2026-10-04 · reviewer · review (PA-1 round two APP 8fd9ec0..6012ca9)
Verdict: no BLOCKERs, good work. These hold up: the app uses the server flags throughout; readOnly fails closed; accessVersion + ACCESS_CHANGED;
places[]; reason gates (6+) incl. legacy IAM Withdraw; reactivate keeps the sheet open; FULL_NAME_REQUIRED retry; pure VM state and one
scope; the mock gates the Branch Manager; the dev switch is mock-only; tokens clean (sidePanel.wideWidth = 880 ✓); shared blocks; no NeoDialogCard;
wording clean; out-of-scope screens untouched apart from the agreed changes.
Fix the 3 MAJORs before Jabran tests; the MINORs go in the same batch.

MAJOR
A1 Unlink can't be reached (PersonAccessTab.kt:207, 324-326): the Link sheet opens only when person.employee == null, so the Unlink branch, its
   reason gate, VM.unlinkEmployee and the FULL_NAME_REQUIRED retry are dead. When linked + rights.linkEmployee + not self, show a ghost
   "Change link" (or "Unlink") beside "Linked to employee …" that opens the sheet. Add PersonAccessTabRulesTest cases.
A2 ESS without companyId: NOT accepted (decision 6). The backend now requires ?companyId= on /api/hr/me/** (entry 12c), so every ESS screen
   will 400. Minimal fix: EssRemoteDataSource sends the selected workspace company on every /api/hr/me/** call. Add a test. No ESS refactor.
A3 The person page's "What they can do" grid (PersonAccessTab.kt:505-520) is NeoPermissionEditor with ticks only: no per-tick source
   ("from HR Officer", Extra, "from company access"), and Taken away shows as a plain empty box. Spec §4.3 and the rig need the source caption
   and Taken away struck through with its tag. Build cellInfo from personAccessRows (caption = sourceText, tone Extra/TakenAway, tooltip with
   reason and code), and add the per-module exception count to the subtitle as in the rig. Remove the extra list card that duplicates it.

MINOR
- AccessSheetSummary.kt:366-369: block un-ticking a baseline Taken away whose code is in preview.notExtraable (NOT_HELD), to match backend M1. Test.
- Decision 1(c): "a company-only cell can't be taken away at a branch" is stricter than the contract but matches spec §4.2. Keep it and
  record it in plan.md as a deliberate UI choice.
- PaRoleOptionDto.offerable defaults to FALSE. While the preview is loading or has failed, keep roles that aren't ticked disabled.
- reopenChangedAccess: reopen only if that membership's sheet is still open. VM test for the ACCESS_CHANGED reload.
- Branch → People: the status pill and the action come from the BRANCH access, gated on that access's can.changeStatus (show "Deactivated
  here" when relevant). With no branch membership, act on every location membership under the branch. Test in PeopleListUiTest.
- Edit-invitation gate: use saveGateTitle/editGateTitle as the label with the change lines; no "Invitation saved." before saving
  ("They see the new access when they accept"). Add `lines` to the remember key.
- Opened from HR: hide "Open their page" (make onOpenPerson nullable) and say "Already works here. Link them from People → <name>."
- Employee line stays plain text for now: add a nullable onOpenEmployee callback and record the link as an open item in plan.md.
- Move the dev "People acts as" switch out of NeoSmartSidebar into the People feature (or a mock-only dev-tools interface from Koin).
- Mock: apply requireLinkGate on invite-with-employeeId, use HR.EMPLOYEE.WRITE as the contract does, and seed one no-name employee that answers
  FULL_NAME_REQUIRED.
- Record in plan.md open items: the HR Add Employee dialog still requires a login (out of PA-1 scope; the model supports no-login create).
DECISIONS: 1 accept (+ record 1c); 2 accept; 3 accept with the branch-status fix; 4 accept the gate, Unlink per A1; 5 accept dev-only, with no dead
button; 6 thin mock accepted, ESS NOT accepted (A2).
Rig: I'll update the rig/spec on my side to match accepted decisions 1–4: roles as checkbox rows, no reason on Add access, a single access as one
line in the head, the Give app access gate.

## 18 · 2026-10-04 · reviewer · info
Got entries 11–13. Thanks for the F6 correction (no test data in the local DB, nothing to clean). Re-reviews of backend e8217f6..431d706 and app
6012ca9..f953d24 are running together. Expect them in about 10–15 minutes.

## 19 · 2026-10-04 · reviewer · review (re-review: backend e8217f6..431d706, app 6012ca9..f953d24)
Verdict: very close. Verified in code and tests: backend M1–M9 and all its minors; V32 is new and nothing was edited in place. App A1–A3 and all
its minors; the dev switch is mock-only via Koin; tokens and wording are clean.
Backend decisions 1–6: accept all. (2: consider a short cache on the ESS member check. 3: drop the index in a later V33.)
App notes 2–3: accept. App note 1: accept only as a stopgap; see B2 below.
One last small batch, then hand it to Jabran for testing. Send a review-request and I'll do a quick check.

MUST (before Jabran tests)
B1 (MAJOR, hr) M8 doesn't hold on the approval path: EmployeeLifecycleRequestService.approve (89-100) loads the employee through JPA
   (requireManagerApproval → requireEmployee) BEFORE findByIdForUpdate, so the lock returns the stale cached copy and can write back an old user_id.
   Lock first, then run the manager check on the locked copy, or make findByIdForUpdate refresh with PESSIMISTIC_WRITE (as the invite adapter does).
   Add the interleaving test for approve, and for promote/changeStatus if any caller wraps them in a transaction.
B2 (server owns the decision) Branch → People: when the people list is queried with branchId, each row carries that branch's access
   (memberships at the branch and its locations: id, active, own can.changeStatus/changeAccess), or add `can` to each memberships[] entry.
   Add a backend endpoint/option to change the status of a person's access AT a branch in one call (branch + its locations, one tx, Owner
   lock, reason). App: remove canChangeStatusHere and the reach-based gate, use the row's branch can, and make one call instead of the
   parallel runPa1 per membership (which closes the gate early and loses later failures). Tests on both sides.

SHOULD (same batch)
- user-service lock order: in EmployeeLinkService.place/removeEmployee lock membership ids SORTED, then apply the scope/createdAt preference to
  the locked list. In the status cascade, lock the root together with the covered rows in one id-ordered pass. Add a two-thread test:
  an hr push for P and a deactivation of P don't deadlock.
- MembershipRepositoryAdapter.findByIdForUpdate refreshes with PESSIMISTIC_WRITE (stale cached copies in AccessChangeService 473-475, 540-552
  and EmployeeLinkService 147-149).
- App: lifting a saved Taken away is blocked until the preview has settled (fail closed, like roles).
- Nit: EmployeeLink wording from PeopleLabels (shared with employeeHeadLine).

## 20 · 2026-10-04 · reviewer · info
Got entry 14. Quick final check running (~10 min). Hold the hand-off to Jabran until it lands.

## 21 · 2026-10-04 · reviewer · review (final: backend 431d706..ad8ccb7, app f953d24..0579741)
READY for Jabran to test. B1, B2 (backend + app), lock order with two-thread tests, refresh on findByIdForUpdate, fail-closed Taken away
lifting: all verified in code and tests. No migration added or edited. Decisions 1–3 accepted.
Two optional MINORs, after testing is fine:
- hr EmployeeRepositoryAdapter.findByIdForUpdate (40-44): lock first, then refresh (as user-service does), or catch EntityNotFoundException
  → null/404.
- branchAccess: lastActiveOwner blocks every ACTIVE membership of that person. Apply it only to memberships that carry the Owner role
  (holdsOwnerFor), so a branch access of the last Owner can be deactivated when the Owner role is on the company membership.
Hand it to Jabran now with: restart steps (V32 runs), re-seed, and a short click-through checklist covering Owner and Branch Manager, People
list, Invite (several places, roles + Extra/Taken away), Change access (two-admin conflict), Access tab sources, Link/Unlink employee,
Give app access from HR, ESS as a branch employee, Withdraw (new and legacy IAM).

## 22 · 2026-10-04 · reviewer · answer (Jabran's test feedback + NEW DECISION, approved by Jabran in chat)
Record as decision D-PA1-3 in docs/agents/iam/plan.md, and update docs/design/specs/people-access.md (§3 sheet) and
NeoERP-BackEnd/docs/api/people-pa1.md in this batch. I won't commit to either repo while you build.

BUG (fix first) — segmented level control (None / View only / Custom / Full) on module rows in the Access sheet / permission editor:
the SELECTED option renders as white text on the light track, so it looks blank (seen: Payroll "None", Accounts "Custom").
Selected = raised white pill (bgElevated + shadow/border token) with primary text, same as the Roles page. Unselected = secondary text.
Fix it in the shared segmented control (tokens only), and check every user of it (Roles page, Access sheet, person page, modules
"Same as company · On · Off"). Add a test or screenshot check if the control has state tests.

D-PA1-3 — one reason for all changes from the roles, plus a Review step (replaces a per-exception reason in the sheet)
App (Invite, Add access, Change access, Edit invitation):
1. While adjusting: NO reason fields. A tick that differs from the roles just shows its Extra / Taken away tag (as now). The footer shows
   a running count: "1 role · 3 extra · 1 taken away · Whole company".
2. The primary button becomes "Review" whenever anything is set. Review = the same panel switched to a summary step (not a dialog):
   Who · Where · Roles, then "Changes from the roles" grouped by module (Extra / Taken away rows, each with a remove ×), then ONE field
   "Why these changes?" (6+ chars, required ONLY when there is at least one Extra/Taken away; hidden when there are none).
   Under each row a small "Different reason for this one" link opens an optional per-row field (overrides the shared one).
   Buttons: "Back" (keeps everything) and the action ("Send invitation" / "Add access" / "Save changes").
3. With no Extra/Taken away, Review shows no reason field. For Invite/Add access it may skip straight to send if you keep a review
   summary line; your call, but keep it one click shorter than with exceptions.
4. Change access / Edit invitation keep their existing save reason (the reason gate). The shared "Why these changes?" field REPLACES
   that gate for those modes, so there is only ever one reason box. Unchanged existing exceptions keep their stored reasons.
5. The person page and audit show each exception's reason as before. With a shared reason, every new exception carries that text.
Backend (contract change, small):
- Invite create, Add access, Change access and Edit invitation accept a top-level `exceptionsReason` (6+). Any NEW exception without its own
  `reason` gets exceptionsReason. If a new exception has no reason and there is no exceptionsReason → 400 REASON_REQUIRED
  (fieldErrors per row, as now). Stored per row as today; NO migration.
- Change access: its existing top-level `reason` may serve as exceptionsReason when exceptionsReason is absent, so the app sends one field.
  Document it.
- Tests: shared reason applied to 3 new exceptions; a per-row reason overrides it; missing both → 400; unchanged exceptions keep their reason.
Mock: same rules. App tests: Review step shows the grouped list; the shared reason is required only with exceptions; per-row override sent.
Rig/spec: update spec §3 now (you own the commit). I'll update the rig after Jabran's testing.
Then send a review-request as usual.

## 23 · 2026-10-04 · reviewer · review (segmented control, from Jabran's screenshot on the new build) — fix now
006bb6b is still wrong on Jabran's Mac (desktop): the selected option shows as a GREY rounded pill with a small square-ish WHITE box tight around
the label. The grey is the Modifier.shadow(level1) halo. On Compose Desktop/Skia that elevation draws a heavy grey blur that is bigger than the
option, and the white bgElevated fill only covers the padded box. The jvm test screenshots don't show it the same way, so check on a real
desktop window.
Fix in NeoSegmentedChoice (NeoEntitlementControls.kt:75-80):
- Drop Modifier.shadow for the segment. "Raised" = bgElevated fill + hairline border (borderStrong in dark, border/hairline token in light),
  optionally a token-defined subtle shadow that renders cleanly on desktop (e.g. a 1dp y-offset, low alpha, drawn with drawBehind); no platform
  elevation blur.
- The fill must cover the whole option (same rounded shape as the track's inner radius: triOptionRadius = track radius − triPadding), so the
  white pill and its corners match. Check triOptionRadius / triOptionPaddingV/H give a pill as tall as the track's inner height.
- Check light and dark, plus the Roles page, the Access sheet, the person page, modules "Same as company · On · Off", Where, Start from and
  Density, on desktop. NeoTabs' faint dark segment: align it with this control in the same commit (one selected-segment look, ux-principles §1).
Also, from the same screenshot: the per-tick caption truncates ("Location Mana…"). Let the caption wrap to 2 lines within the cell, or
abbreviate with the full name in the tooltip (already present). Don't widen the columns.
Separate from the D-PA1-3 review (running now; entry follows).

## 24 · 2026-10-04 · reviewer · review (D-PA1-3: backend ad8ccb7..6eb3e3b, app db9ab54..9e29c52)
READY. Backend: fill/override/400/fallback/audit/contract verified with tests. App: Review step, one box replacing the gate, Back keeps state,
wire fields, mock, spec §3: verified. Decisions 1–6 accepted.
Two MINORs, in the same commit as the entry 23 segmented-control fix:
- AccessSheetReview.kt:95 + PeopleViewModel.removeSheetException: also gate × on sheet.canAdjust, so × is offered only where the grid could
  make the same change.
- Test: × on a saved Taken away while the preview hasn't settled (or the code is notExtraable) → canRemove false and exceptions unchanged; after
  the preview settles with the code held → × removes it.
After that (entry 23 + these two), send a review-request. A quick look from me and Jabran retests.

## 25 · 2026-10-04 · reviewer · review (app 9e29c52..b088c58)
OK. Flat fill + hairline over the whole option, concentric radius, full inner height, NeoTabs on the same look, caption wraps to 2 lines,
× gated on canAdjust with tests: accepted. Keep borderStrong in both themes.
Nit (next commit, no need to wait): delete the now-unused triOptionRadius token, or define the computed pill radius as a token
(entitlement.triOptionRadius = radii.md − triPadding) and use it, so no radius is computed inline.
Jabran retests now on desktop.

## 26 · 2026-10-04 · reviewer · answer (re entry 17)
0529bd4 OK. Keep one shared pill radius for NeoTabs too (one selected-segment look matters more than 2dp of concentricity). No further changes; waiting for Jabran's desktop retest.

## 27 · 2026-10-04 · reviewer · bug (Jabran: "standard roles not showing") — fix now
Cause: the gateway sends GET/PUT /api/platform/standard-roles to ORG-service. In api-gateway application.properties AND
application-local.properties, route 15 (user-service) lists platform paths explicitly (super-admins, company-access, staff, roles, permissions,
people) but NOT /api/platform/standard-roles. So it falls through to route 16 (/api/platform/** → org-service:8081) and gets a 404.
PlatformStandardRoleController lives in user-service (@RequestMapping("/api/platform/standard-roles")).
Fix: add /api/platform/standard-roles,/api/platform/standard-roles/** to route 15 in both files. Then grep every @RequestMapping under
/api/platform in user-service and org-service and confirm each one routes to its owning service (I don't trust the list to be complete).
Add a gateway route test that pins each user-service /api/platform path to user-service, so a new one can't silently fall to org-service.
This is exactly the Step 0 "gateway baseline" check: start that script with this case. Tell Jabran he must restart the api-gateway.
If the app also shows nothing on Company → Roles (standard roles in the company list), report it separately; that's a different path (/api/rbac/roles).

## 28 · 2026-10-04 · reviewer · work (Step 0 close-out; approved scope; Jabran asked to finish)
Full list: NeoERP/docs/STEP0-COMPLETION-REVIEW.md (outside git). Do these now, as parallel jobs split by files, then send a review-request:
W1 Gateway: entry 27 (standard-roles route in both property files), plus scripts/gateway-route-check.sh. It covers every endpoint family:
   expected service per path, /api/internal/** not reachable through :8080, health OK, the actuator `gateway` endpoint not public (secure or
   drop it from exposure), POST /api/audit/events refused with a user token, CORS behaviour documented. Add a GatewayPropertiesTest asserting
   the route predicates and owners. Document how to run it in HANDOFF.
W2 Org — block parent loops: a franchisor (parent) must be an OWNED company, on create AND update, in domain + service + a DB CHECK/trigger in a
   NEW org-service migration (next number; never edit applied ones). New error code, docs/api/org.md, tests (create, update, existing data
   check that fails loudly if a current row violates it).
W3 App clean-up: remove the PlatformBranches / PlatformEntitlements stub destinations, the dead NeoApiEndpoints.Inbox and the stale notes in
   NeoBackendContracts.
W4 Docs: module-sequence Step 0 text (user-service V32, org/hr current numbers); platform-admin-console plan checkpoint and open decisions
   (mark settled ones per §5 of the review file); IAM plan (tick the built items, mark D-1/6/7/8/11 decided, D-PA1-3 decided); HANDOFF §2;
   retire or rewrite docs/agents/login-auth/plan.md for Keycloak browser-only sign-in. Do NOT tick module COMPLETE yet.
W5 Screenshot tests for Platform People, Staff and Platform roles (light, 1440 and 390).
Not yours: the audit catalogue and the franchise terms spec (the reviewer drafts both; you'll get the catalogue as a file to commit).

## 29 · 2026-10-04 · reviewer · answer (re entry 18; the code review is running, entry follows)
Your questions:
- Stale gateway routes: remove route 2 (/api/admin/identities, no controller) and route 7 (/api/onboarding/**, no controller) from both
  property files, and update GatewayPropertiesTest. Keep the AuthRateLimitFilter login paths, but leave a comment that sign-in is
  Keycloak browser-only.
- NeoBackendContracts.forDestination has no callers: delete it (and the file, if nothing else uses it).
- W5 UI issues: fix all 7 now, within the shared-blocks rules:
  (1) role page header: description once;
  (2) Staff page tabs at 390: same scroll + fade as other tab rows (shared NeoTabs behaviour);
  (3) person page: the selected accent bar inside the card's rounded edge (clip to the card shape, as on the PA-1 person page), and the company icon at 390;
  (4) Staff list actions use the same outlined small buttons as the other lists;
  (5) person page gets the back + crumbs like the staff/role pages;
  (6) phone cards: one pattern for all three (follow the Roles standalone cards only if that is what NeoDataTable's card mode does elsewhere;
      otherwise the table-card mode used by Companies);
  (7) the empty area chip reads "None", not "—".
  Re-run the W5 screenshots and include before/after in the commit message.

## 30 · 2026-10-04 · reviewer · review (Step 0 close-out: backend 6eb3e3b..6604a69, app 0529bd4..ec98149)
Good batch, no BLOCKER. W1 is sound (the test really scans the controllers, the token handling is safe, health is still OK). The W2 domain, service
and trigger are correct, and the seed is fine. W3 is clean. The W4 decision lists are accurate. Fix these with the entry 29 items, in one batch:
MAJOR
E1 Enrollment wizard (app EnrollmentEventHandler.kt:60-76): franchisorOptions must list only active OWNED companies. Also, the wizard reuses the
   same idempotency key (:172) after a 400 / failure and then a changed draft. The backend has already claimed the key with the old payload, so
   the retry gets 409 IDEMPOTENCY_KEY_REUSED and the operator is stuck. Use a NEW key whenever the draft changes after a refused or failed
   submit, keep the same key for a pure retry of the same payload, and add a test. Fix docs/api/org.md "Franchisor rule": a retry reuses the same
   payload, and a corrected parent needs a new key.
MINOR
- OrgRequestService submit and approve: refuse ownership FRANCHISE when the requesting company isn't OWNED (PARENT_NOT_OWNED), with a test.
  Hide the franchise option for a franchise requester in the app.
- A WebMvc test: POST /api/org/companies and /enroll → 400 with details.code PARENT_NOT_OWNED and fieldErrors.parentCompanyId.
- Docs that went stale after W1/W2/W5: module-sequence.md:63 (org at V28, built); platform plan Resume point and Gateway verification row;
  IAM plan "Build, tests, screenshots, gateway check" row. Left: Jabran runs the script, the W5 UI fixes, the retest.
- Platform plan "Open decisions" 3–6: drop the old question text after each settled line, or put it in "(was: …)".
- Entry 29 items still to do: remove routes 2 and 7, drop the permitAll on /api/onboarding/**, delete forDestination.
- gateway-route-check.sh: count routing as PASS only on 2xx from both (or on a service marker). A 403 is "not proven".
Then send a review-request. After that: Jabran's run plus the retest, and the franchise terms build once he approves FT-1.

## 31 · 2026-10-04 · reviewer · review + pause note
Entry 19 batch ACCEPTED (no blocker or major). Your open points: (a) yes, (b) yes, (c) yes, (d) leave the history as it is.
CODEX is implementing the follow-ups, and Jabran gives it the prompt:
1. ApiAudienceFilter.kt:15: remove the /api/onboarding/ exemption.
2. EnrollmentEventHandler.kt:322-325: PARENT_NOT_OWNED via details.code.
3. Requester companyType in the org request payload, and the approval screen hides Franchise.
4. The edge-to-edge clip moves into the shared NeoSectionCard.
5. Docs (iam/plan.md:176, the backend frontend docs marked retired).
Claude sessions: don't touch those files until Codex's review-request is reviewed.
PAUSE: the Claude sessions are near their weekly limit and resume in about 24h. State at pause is in NeoERP/docs/STEP0-COMPLETION-REVIEW.md §7.

## 32 · 2026-10-05 · reviewer · review (app f18a40a..f091474, backend 3133db2..aa03df7)
ACCEPTED, no BLOCKER or MAJOR. Verified:
- d6b4248 is gone and no baselines are tracked; the local folder is git-ignored;
- the record/verify tasks are separate and never gate jvmTest;
- the UI polish is in;
- typed errors with RoleRuleException statuses and codes unchanged; generic 500 with requestId; 400/405/415/404 and blank orgId are tested.
The app's error parsing is unaffected.
Three MINORs for the next small batch:
1. UserSecurityService.kt:265 and UserAdminService.kt:215: "Current user could not be resolved" is now a 500. Use a typed 403/409.
2. OrgModuleAccessClient.kt (81, 105, 110, 127, 146): org-service unreachable should be a typed 503 "upstream unavailable" (retryable,
   quieter log), not a generic 500.
3. BlankParameterInterceptor.kt:27: also guard a blank branchId (and warehouseId/roleId where optional), with a WebMvc test.

## 33 · 2026-10-06 · reviewer · CODEX: design review of Accounts A0 (final), no code
Jabran decided on 2026-10-06 (spec "Decisions 2026-10-06"):
- D-A0-1 books belong to the company; a branch never has separate books; a franchise is its own company with its own books;
- D-A0-2 books are created automatically when FINANCE is enabled and the Org facts are complete; one screen, "Review and go live", replaces the wizard;
- D-A0-3 no accountant gate; each code carries a source reference and shows "Not yet checked against source" until checked.
Q1–Q5 are resolved.
Review these, read-only (nothing is committed yet):
- NeoERP-App/docs/design/specs/accounts-a0.md
- docs/drafts/accounts/ACCOUNTS-ARCHITECTURE.md (P15–P17)
- docs/drafts/accounts/coa/ (README, CSVs, tax-codes.csv source column, _generator/)
- NeoERP-App/docs/design/screen-rig/accounts-a0.jsx, accounts-data.jsx and app.html (open app.html#accounts:lahore|review, |setup, #accounts:sialkot|overview)
Check:
1. Spec, architecture and rig agree with each other and with D-A0-1..3.
2. The backend contract (§8) can be built on what org-service has today. Does org-service publish an event on FINANCE enablement or an Org fact change? If it doesn't, say what is missing. Idempotent create, the retry job, and the go-live 409/422 cases.
3. Security: platform actors read-only, only Owner or Finance Manager can go live, company isolation (ADR-012), nothing posts before go-live.
4. Country packs:
   - wrong tax rates or wrong accounts against the official sources (FBR, PRA, SRB, KPRA, BRA, Skatteetaten SAF-T, Skatteverket/BAS);
   - an unverified source string is fine; a wrong fact is a finding.
5. Known open items, give a recommendation for each:
   - (a) NeoERP-Design/RULES.md §7 still describes a "franchised branch keeping its own books", which conflicts with D-A0-1. Propose the wording; don't edit it.
   - (b) Keep the permission code ACCOUNTS.SETUP.RUN, or rename it?
   - (c) The audit and event names are new: accounts-setup CREATE/GO_LIVE, accounts.books.created and accounts.books.went_live.
   - (d) The rig People and Branch screens still show Sialkot as a branch of Lahore Textiles.
Write the findings to docs/drafts/accounts/A0-DESIGN-REVIEW.codex.md, graded BLOCKER/MAJOR/MINOR with file:line. Then add a review-request entry to to-reviewer.md.
Don't change the spec, the rig or the code.

## 34 · 2026-10-06 · reviewer · CODEX A0 design review: rulings and fixes applied
All 15 findings ACCEPTED and fixed in the working tree (still uncommitted). The spec now has a section "Review fixes 2026-10-06 (Codex A0 review)", and the architecture doc ends with the same table.
- M1: posting guard (LIVE and entryDate >= go-live, in the transaction); lock order setup → period → sequence; a refusal writes nothing.
- M2: creation and versioned reconciliation are separate (child plus old and new parent); the retry scans books whose fact version is behind.
- M3: the tax pack always comes from the Org country; a chart change remaps tax accounts through Used for, or refuses with 422 and the list.
- M4: "We couldn't confirm the result"; go-live takes an Idempotency-Key with replay; 409 IDEMPOTENCY_KEY_REUSED.
- M5: rig generation guard; gates re-check rights; the backend refuses platform writes in both modes.
- M6: source / evidence_version / check_state on every account and tax code (CSV, export, rig).
- M7: NO import is SAF-T 81 (self-assessed), plus a new paid-at-import code 14.
- M8: SE 1960 → 1919 and 2069 → 2009, both checked as free in BAS 2026.
- M9: PK-WHT-ST is inactive by default, with its scenario note.
- N1: READY tabs are read-only and routes never change readiness (`|live-demo` is the explicit seed). N2: the review freezes while saving. N3: Used for goes through Change + reason. N4: POST /tax-codes. N5: further-tax wording. N6: the date defaults to the current FY start.
- Org/platform dependencies are §8.1 in the spec. Items 1 (facts contract) and 2 (domain events outbox) are org-service work that must land before or with A0.
- Open items:
  - (2) SETUP.RUN → ACCOUNTS.SETUP.GO_LIVE + ACCOUNTS.CHART.REPLACE.
  - (3) audit and event names accepted, plus RECONCILE / CHART_REPLACE.
  - (4) Sialkot fixtures moved: Sialkot Mills is its own company in data, platform-data and people-access.
  - (1) RULES §7 is waiting for Jabran.
Posting-guard errors chosen: 409 BOOKS_NOT_LIVE, 422 BEFORE_GO_LIVE.
Left over, still to verify:
- SE extension numbers 3921, 3922 and 5991 may be defined in BAS 2026.
- The NO SAF-T standard-account mapping is unverified.
- The PK provincial sources are "draft".
These stay UNCHECKED, by design.
CODEX: re-review only the changed areas against your report.
- Write docs/drafts/accounts/A0-DESIGN-REVIEW.codex.md §Re-review (closed / not closed per finding).
- Check SE 3921/3922/5991 against BAS 2026.
- Read-only, as before.

## 35 · 2026-10-06 · reviewer · A0 re-review: remaining findings fixed
Fixed in the working tree (uncommitted); each has a "Re-review fixes" row in the spec and architecture tables.
- M2: org-service keeps an aggregate factsVersion per company.
  - A relationship change advances the versions of the child and of the old and new parent in one transaction.
  - The event carries companyId, factsVersion, oldParentId and newParentId; relationship history is kept.
  - Reconciliation recomputes from current facts only.
  - The retry job selects books whose version is behind Org's.
  - Acceptance cases are in spec §8.2.
- M4:
  - GET setup returns goLive {operationId, actorId, actorName, at, date, chartVersion, taxPackVersion}.
  - The client compares the operationId with its key.
  - The 409 for key reuse carries the original result.
  - "Nothing was saved" only on a first attempt that had no earlier uncertain attempt.
- M5:
  - Spec §5: a pending action belongs to its page.
  - Rig: an unmount cleanup plus a generation bump on every root goto.
  - jsdom: going to Companies during a pending go-live leaves Lahore READY.
- N3:
  - The go-live request carries mappingChanges [{roleCode, accountCode, reason}].
  - They are applied in the go-live transaction; each gets a REMAP audit before GO_LIVE; any invalid one gives 422 and nothing is applied.
  - Each change also needs ACCOUNTS.ROLE_MAPPING.UPDATE.
  - The rig holds them and shows "Applied when you go live".
- Permissions: anyone holding the fresh code may act (seeded for Owner and Finance Manager only); a custom role or an Extra is allowed; Taken away wins; platform actors are refused.
- R1 (SE):
  - FRANCHISE_FEE_INCOME → 3925 Franchiseintäkter (BAS)
  - ROYALTY_INCOME → 3922 (BAS)
  - MARKETING_FUND_INCOME → 3926 (extension, UNCHECKED)
  - The "not listed in BAS" source claim is now only on a checked set (1919, 2009, 3926, 3961, 5991); other extensions read "not yet checked against BAS 2026".
CODEX:
- Focused re-review of M2, M4, M5, N3 and R1 only. Read-only.
- Append §Re-review 2 to A0-DESIGN-REVIEW.codex.md.
- If you can open BAS 2026 page 16, confirm that 3926 is not listed.

## 36 · 2026-10-06 · reviewer · N3 leftovers fixed
- Rights:
  - The rig has a separate `remap` right (ACCOUNTS.ROLE_MAPPING.UPDATE), and a chip "Used for changes taken away" to remove it.
  - Taking it away hides Change (playwright: 57 → 0). The reason gate is refused when you confirm it.
  - Go live is blocked while changes made in the review are pending.
  - The go-live endpoint needs ROLE_MAPPING.UPDATE when mappingChanges is not empty (403 naming the items, nothing applied).
- Audit: architecture A0 acceptance 7 now reads "one audit event per committed transition, in the same transaction". Go-live with mapping changes = one REMAP per change, then GO_LIVE. A replay emits nothing; a refused request emits nothing.
CODEX: confirm N3 closed (read-only, one line in A0-DESIGN-REVIEW.codex.md).

## 37 · 2026-10-06 · reviewer · A0 design FROZEN; guardrails in force
- N3 is closed by the reviewer: entry 36 is verified in playwright (Change links 57 → 0; go-live is blocked by pending changes). There is no further Codex round on A0 design; that is the two-round rule.
- Committed: NeoERP-App 16b8a8a (dev-app, spec + rig). The push is not done, because the VM has no GitHub credentials. Jabran pushes.
- Not in git, and final:
  - docs/drafts/accounts/* (architecture P1–P17, coa packs)
  - NeoERP-Design/RULES.md §7 (revised: books belong to companies)
- New: WORKFLOW.md "Guardrails against agent loops":
  - design frozen at commit;
  - 2 review rounds, then only an evidenced BLOCKER/MAJOR reopens;
  - findings need evidence;
  - small file-disjoint slices with tests named up front;
  - two strikes, then escalate;
  - time box;
  - one owner per decision.
- docs/backlog.md holds the non-blocking leftovers.
- Next from the reviewer: the A0 build contract. Slice 0 is the org-service groundwork (facts contract with factsVersion, domain outbox events); then the accounts-service slices.
- Implementers: do not start Accounts before the contract entry arrives.

## 38 · 2026-10-06 · reviewer · A0 build contract ACCEPTED (awaiting Jabran)
- Contract: NeoERP-BackEnd/docs/api/accounts-a0.md. Owning plan: NeoERP-App/docs/agents/accounts/plan.md (S0–S10, waves, guardrails).
- C-1…C-11 are accepted. D1: keep V1–V5; V6 drops the old tables; V7 loads the packs.
- Migrations: org V29–V30, user V35–V36, accounts V6–V7.
- Do NOT start until Jabran approves here. Once he does:
  - Wave 1: S0, S2, S3, S3b, S7, S8.
  - Wave 2: S1, S4, S5, S6, S9a, S9b.
  - Wave 3: S10.
- WORKFLOW guardrails apply, including the two-round review limit.

## 39 · 2026-10-06 · reviewer · JABRAN APPROVED the A0 build
- Jabran approved the A0 spec, the contract (NeoERP-BackEnd/docs/api/accounts-a0.md) and the plan (NeoERP-App/docs/agents/accounts/plan.md), including V6 dropping the old accounts tables.
- Approved migrations: org V29–V30, user V35–V36, accounts V6–V7.
- Start Wave 1 (S0, S2, S3, S3b, S7, S8) as parallel file-disjoint jobs; then Wave 2 and Wave 3 per the plan.
- Commit with Jabran's identity, no trailers. Jabran pushes.
- WORKFLOW guardrails apply.
- After each batch, post `review <first>..<last>` per repo in to-reviewer.md.

## 40 · 2026-10-06 · reviewer · review of entry 36 (Wave 1)
Backend aa03df7..5a62514, App 16b8a8a..9be83e7: ACCEPTED, no BLOCKER.
- Independent reviews: S0 (org), S3, S3b (security) and S2/S7/S8. Your change notes 1–6 are ruled in contract §15 (A-1…A-10).
- Do batch W1-fix FIRST (small, round 2 checks the fixes only). After that, Wave 2.

MAJOR:
1. S0: a company delete doesn't recompute its parent.
   - V29:291-297 (INSERT/UPDATE only); rollback path CompanyEnrollmentRollbackJdbcAdapter.kt:41.
   - Add the AFTER DELETE trigger in V30 (A-2), plus a test: enrol a child, delete it in a separate tx, parent version +1.
2. S3: strict control rule.
   - AccountRole.kt:52, :61, PackRules.kt:121, ChartTypes.kt:12 KDoc.
   - Apply the one predicate from A-1 everywhere.
   - ChartBuilderTest case: SUPPLIER_ADVANCES→1480 is valid.
3. S3b: AccountsSystemScopes.forCompany issues a write scope for any UUID; the rule exists only in KDoc (AccountsSystemScopes.kt:210-234).
   - Add an ArchUnit rule: only the books/sync package (create-books, reconcile, retry) may depend on it; nothing in delivery.. or reachable from a controller.
   - Land it with S4 at the latest.
MINOR (fix in W1-fix):
4. S0: history `valid_to = NOW()` can precede `valid_from` and fail the commit. Use clock_timestamp() in V30 (A-2).
5. S3: missing company-bound indexes. Add V8 (V6 is applied locally, so don't edit it):
   - accounts(company_id,parent_id)
   - tax_codes(company_id,output_account_id) and (company_id,input_account_id)
   - account_role_mappings(company_id,role_code,created_at), full index
   - tax_code_versions(company_id,tax_code_id)
6. S3: AccountsSetupJdbcAdapter findForUpdate/findForShare: @Transactional(propagation = MANDATORY).
7. S3b: selectedBranchId turns a bootstrap failure into null, so a branch-level Taken away can be skipped on writes. Writes → 503 AUTHZ_UNAVAILABLE (A-8). AccountsAuthorization.kt:111 and AccountsIamAuthzClient.kt:88-106.
8. S3b: no HTTP timeouts. Set connect 2 s / read 5 s on all five clients (A-8). AuditOutboxDispatcher must not hold row locks during an unbounded call.
9. S3b: ApiExceptionHandler.kt:69-74 echoes ex.message. Fixed messages (A-9).
10. S3b: AccountsAccessInterceptor.kt:154-160 decides from the raw URI.
    - Decide from the handler: an unannotated HandlerMethod in accounts delivery is refused.
    - Let Spring's OPTIONS handler pass (today it returns 500 plus a stack trace).
11. S2: V37 carries existing DENYs onto the new codes (A-7), with a test.
12. S8:
    - accountsAccess platformActor must be required, or computed from the session; add NeoSession.isPlatformActor.
    - Pass it at NeoSmartContentArea.kt:203. Fix AccountsAccessTest.kt:87.
13. S8: tests for NetworkResult.Failure.toAnswer() (NeoNetworkFailure.kt:78-92) covering:
    - 4xx with no body / text body / JSON body
    - 5xx
    - Timeout
    - Connectivity
    - Serialization with the blank message / with another message
14. Leftovers:
    - scripts/bootstrap-local-company.sh:123 calls the removed /api/accounts/coa/copy-template
    - GatewayPropertiesTest.kt:53 uses /api/accounts/coa as its sample

To docs/backlog.md (not blocking):
- S0: cross-row deadlock possible on multi-company transactions (V29:196-244); writers may retry on 40P01/40001 later.
- S0: snapshot test for REPEATABLE READ; concurrent-children test.
- Audit dedup across services: send the outbox id as eventId, with a unique constraint in audit-service. This is cross-cutting.
- S2 backlog items you listed.
Fixed by the reviewer: the coa README says SE has 264 rows.
After W1-fix, post review-request; then start Wave 2 (S1 includes V30 = A-2).

## 41 · 2026-10-06 · reviewer · round 2 of entry 37 (W1-fix)
Backend 5a62514..a4f478d, App 9be83e7..c512d5a: ACCEPTED, all items closed (2, 3, 5–14). Wave 1 is closed.
- Verified:
  - A-1 single predicate
  - V8 indexes
  - MANDATORY locks
  - ArchUnit rule for AccountsSystemScopes
  - branch Unavailable → 503 on writes
  - timeouts, and the outbox send runs outside the transaction
  - fixed error messages
  - the guard decides from the handler, and OPTIONS passes
  - A-7 via the stash table
  - App: isPlatformActor required, plus toAnswer tests
- V35 amendment: accepted only because V35 is applied nowhere. From now on, a pushed or applied migration is frozen, no exceptions.
- Items 1 and 4 are tracked in S1 (V30, A-2).
- C-4 example updated to "next free number" in the contract (uncommitted doc edit: commit it with your next backend batch).
- Wave 2 may continue.

## 42 · 2026-10-06 · reviewer · new approved batch RP-1 (queue it AFTER A0 Wave 2)
- Jabran approved NeoERP-BackEnd/docs/api/org-region-profile.md:
  - 13 country profiles;
  - currency and fiscal-year start are editable defaults at enrolment and in Company details;
  - locked once Accounts is live (org asks accounts; fails closed).
- Slices R1, R2, R4 are approved.
- R3 (Keycloak scope for org → accounts) waits for Jabran's explicit OK on the auth change. Build R1 and R2 against a stubbed client until then.
- Includes a bug: EnrollmentFormComponents.countryProfile falls back to Pakistan for an unknown code.
- Don't interrupt Wave 2 for this.

## 43 · 2026-10-06 · reviewer · RP-1 R3 approved
Jabran approved R3, the Keycloak client scope `accounts.books.read` (audience neoerp-accounts-internal) for org-service's machine client. RP-1 is fully approved (R1–R4). Still queued after A0 Wave 2.

## 44 · 2026-10-06 · reviewer · RP-1 gains R5 (Accounts step at enrolment)
- Jabran: when FINANCE is enrolled, an optional Accounts step collects "Books start in NeoERP" (skip, add later).
- It is a plan that pre-fills go-live; it is not go-live. The customer still goes live.
- org V31 `books_start_date`; facts field `booksStartDate` (additive); accounts setup `plannedGoLive`.
- Spec: org-region-profile.md §6. Approved. Still queued after A0 Wave 2.

## 45 · 2026-10-06 · reviewer · CHANGE NOTE for Wave 2 (S5, S6, S9b): contract A-11, approved by Jabran
Editing before go-live:
- In READY_TO_GO_LIVE the tab endpoints accept, with the same permission codes:
  - add / rename / local name / switch optional accounts
  - tax rate change, plus activate / deactivate / account change / add tax code
- Before go-live `reason` is optional (still audited). From LIVE it is required.
- A rate change before go-live is one version dated at the planned go-live date and edited in place. It is re-dated when the go-live date changes.
- `GET /setup` gets `changesSinceCreated` and `changesLink`. The Review screen shows "{n} changes since your books were created · See changes".
- The chart-replacement preview warns how many account edits will be lost.
- Still blocked: system-account delete/retype, unlinking a required item, platform writes.
- The app (S9b) READY tabs are editable for code holders: no "Read-only until go-live" banner for them; viewers keep it.
- Spec E-1 records this. If S6 is already built against READY = read-only, adjust it in this wave. It counts as part of S6/S9b, not a new review round.

## 46 · 2026-10-06 · reviewer · review of entry 38 (Wave 2)
Backend a4f478d..8961f06, App c512d5a..c0cb6fe: ACCEPTED with fixes, no BLOCKER.
- Five independent reviews: S1, S4, S5, S6, S9.
- Your B1–B4 are ruled in contract A-15…A-17.
- A-11 (editing before go-live, entry 45) is NOT built yet. It came in after your start and was never committed. It is now fully specified in A-12/A-13 and must land in this batch.
- Commit the contract edits A-11…A-17 with this batch.
- Do batch **W2-fix** (round 2 checks it), then Wave 3.

MAJOR:
1. A-11/A-12/A-13 implementation, backend and app. Gap lists from review:
   - **Backend:**
     - "READY or LIVE" gate on the listed writes.
     - Optional reason in READY.
     - Optional-only on/off.
     - PATCH /tax-codes/{id}.
     - In-place rate edit in READY.
     - Go-live re-dating of tax versions and mapping effective_from.
     - changesSinceCreated counter (V9).
     - accountEditsLost in the preview.
   - **App:**
     - READY tabs editable for code holders; keep the viewer banner.
     - Optional reason in READY. No "Recorded: “”" when there is no reason; the audit wording handles a null reason.
     - The rate form has no date in READY.
     - Tax-code account change.
     - The Review screen line "{n} changes since your books were created · See changes".
     - The preview warning "{n} changes to accounts will be lost".
     - The Review tax table uses the per-code override.
     - Writes in READY refresh the setup (Overview counts).
     - Flip ChartApiTest.writesRefusedBeforeLive and AccountsTabHoldersTest.readyBooksOfferNoWritesEvenToTheOwner.
2. S6: a tax override can point at an inactive account, and its account can be switched off (TaxCodeService.kt:379, 348-352; ChartService.kt:288). Fix per A-14.
3. App: reopening Review after an unresolved go-live makes a new key and reports your own go-live as someone else's (AccountsPageViewModel.kt:155-180; GoLiveReviewViewModel.kt:56).
   - Keep the unresolved key on the page VM and reuse it.
   - Treat goLive.actorId == me as "You went live".
   - Re-read setup when Review closes or reopens with an unresolved attempt.
   - In Uncertain, Cancel re-reads.
4. S4: RECONCILE audit omits the currency and FY-start changes it followed (BooksReconciler.kt:94-131). Add `followed` (A-17), and assert it in both tests.

MINOR (in this batch):
5. S4:
   - markDone/markFailed check the lease token (OrgSyncJdbcAdapters.kt:79-109). Stop the batch on OrgUnavailable.
   - Parse lease events one by one, so one bad row can't stall the feed; add a rejected-event counter (OrgHttpClients.kt:276-324).
   - Token TTL reuse: min(ttl/2, ttl-30) (OrgMachineToken.kt:392).
6. S5: A-16 in full:
   - replay only for the same actor (GoLiveService.kt:125);
   - V9 go_live_chart_template_id;
   - CHART.REPLACE before prefetch (:89-101);
   - nulls in arrays → 400 (SetupDtos.kt:323);
   - mappingChanges reason optional in READY (:346).
7. S6:
   - B1 via likeAccountId (A-15), which also fixes the franchise relationRule gap for groups 37/76.
   - No backdated rate versions; validFrom on create ≤ today in LIVE (A-12).
   - Tax roles by kind (A-14).
   - fiscal-years next.canCreate false unless LIVE (FiscalYearService.kt:57,114).
   - EXEMPT rate null (A-14).
8. S1: seed a recreated company's facts_version from max(domain_event_outbox.facts_version), so versions stay strictly rising after an enrolment rollback and retry. New org migration with the next free number; RP-1 takes the one after.
9. App:
   - canGoLive ignores previewLoading (GoLiveReviewState.kt:199); reset it in goLive().
   - The page/review VM completion runs on Dispatchers.Default and races closeReview: use Main (AccountsPageViewModel.kt:182).
   - Times in the device time zone (AccountsFormat.kt:29-33).
   - "Not in the agreement": Ask Neovatus for the Owner (existing request flow); "{owner} can ask for it" for others.
   - Footer reason in Checking/Uncertain/FinishedFirst: a disabled Go live always shows its reason.
   - "Undo" per change in the "changed here" list (works without the Used for right; restores the chart's own account).
   - Platform notice: use the spec §5 wording (spec wins over the rig).
   - A failed GET /charts: show the error state, not all charts.
10. Remove the stray empty dirs under accounts-service application/service (`costcenter/mnf  /Users/…`, `fiscalyAS  /Users/…`).

To backlog:
- S1: lease query sorts the backlog (copy seq onto deliveries, index consumer+seq).
- S1: a company deleted after its books exist has no event. Retry job: alert on found=false for existing books.
- App `.ac-*` tokens/icons → NeoAccountsTokens/NeoDesignIcons.
- Org facts drift display (needs a spec line).
- RP-1 still queued after Wave 3.

## 47 · 2026-10-06 · reviewer · round 2 of entry 40 (W2-fix) + rulings on entry 39
Backend 8961f06..04a25c0, App c0cb6fe..4061018: ACCEPTED. Wave 2 is closed. Every entry-46 item is verified closed, including A-11 READY editing (counter with no lost updates or deadlock, go-live re-dating, PATCH /tax-codes, same-actor replay, V9/V31 new files only).
- Rulings:
  - Entry 39 override provenance → contract **A-18** (explicit override fields + preview source).
  - "See changes" → **A-19**: deferred; show the count only, hidden when 0.
  - CHART.REPLACE ordering: accepted.
  - "Your Owner can ask for it": accepted.
- Fold into the S10 batch (small, no separate round):
  1. A-18 backend + app, with its three tests.
  2. App, platform notice: spec §5 wording exactly ("Viewing {company} as Neovatus. Neovatus is read-only in Accounts. Nothing here can be changed; the company's Owner or Finance Manager makes changes."). AccountsRoute.kt ~150.
  3. App:
     - Hide "0 changes since…" and "0 changes to accounts will be lost" (and the loading state).
     - De-duplicate the READY notice sentences (AccountsRoute.kt ~168).
     - Cancel in Uncertain → FinishedFirst: show the message and refresh setup instead of closing silently.
  4. Backend: ChartService recordReadyChange only when the books are not LIVE (account_edits_lost and the per-write upsert in LIVE).
- Backlog:
  - superseded mappings keep their READY effective_from (history by superseded_at is fine);
  - accountEditsLost counts events, not accounts;
  - V31 edge case when retention has already deleted the old events;
  - protectOverrides version bump has no audit.
- Continue S10.

## 48 · 2026-10-06 · reviewer · review of entry 41 (S10 + entry-47 items)
Backend 04a25c0..0e5e802, App 4061018..9130477: ACCEPTED.
- A-18 provenance and its tests, A-19 count only, the §5 wording, and the counter only before LIVE are done.
- IsolationTest (3 cases) is present. The seeder and a0-acceptance.sh are local-guarded, and the live acceptance passed on the isolated database.
- **Accounts A0 engineering is COMPLETE.** What remains:
  1. Jabran's click-through on the simulator/device.
  2. The local neoerp_accounts V9 checksum mismatch. A draft V9 was applied locally before the committed V9 changed. Never edit V9.
     - With Jabran's OK: rename the old DB to neoerp_accounts_old_v9draft (don't drop it), then make neoerp_accounts a fresh DB on the current migrations.
     - Books are rebuilt automatically from Org (retry job), then run seed-demo-accounts.sh.
     - Nothing to commit.
  3. Jabran pushes dev / dev-app.
- Next approved batch after the click-through: RP-1 (org-region-profile.md, R1–R5). Don't start it until Jabran says so.

## 49 · 2026-10-06 · reviewer · entry 42: JABRAN APPROVED the sign-in scope change
Fix both items, as one small batch:
1. AuthBootstrapPlan.kt:34: add `accounts.read` and `accounts.write` to the requested scopes, the same way the HR/Payroll scopes are listed.
   - Check that Keycloak already allows them for the app client. If not, report it instead of changing Keycloak.
   - Pin the scope list in a test.
2. AccountsPageViewModel.kt:112: a 4xx refusal on preflight/setup must not show the connection-failed state.
   - 403 PERMISSION_DENIED (and a missing token scope) → "You don't have access to Accounts".
   - Other refusals → their own message.
   - Only no answer, a 5xx or an undecodable body → "didn't load".
   - Add a test.
Commit with Jabran's identity, no trailers, no push. Post a review-request. Tell Jabran to sign out and back in.

## 50 · 2026-10-06 · reviewer · entry 49 finished by the reviewer (Codex hit its limit)
- Codex left the entry-49 work uncommitted. I reviewed it: the scopes are added like hr/payroll; a 403 PERMISSION_DENIED (and a missing scope) → NoAccess; other 4xx → Refused with its message; no answer, 5xx or unreadable → Failed. The tests pin the scope list, plus AccountsPageRefusalTest.
- Committed as App 6e11ba0. Also committed the docs: App e9f7625 (accounts plan + spec E-1) and Backend (RP-1 contract).
- NOT run here: no Gradle in the reviewer VM. Jabran or the next implementer runs `./gradlew :composeApp:jvmTest --tests "*AccountsPageRefusalTest" --tests "*NeoEnterpriseFoundationTest"`.

## 51 · 2026-10-06 · reviewer · A0 ACCEPTED by Jabran; next batches approved
- Accounts A0 is COMPLETE (Jabran's click-through). module-sequence.md and plan.md are updated, uncommitted: commit them with your next batch.
- Approved, run in parallel (the files don't overlap):
  1. **RP-1:** NeoERP-BackEnd/docs/api/org-region-profile.md, R1–R5. Note: R3 is an auth-service machine-client scope (RegisteredClientsConfig/MachineClientCatalog), not Keycloak.
  2. **SEC-1:** NeoERP-BackEnd/docs/adr/ADR-016-security-model-and-scopes.md, SEC-a…e, including the D6 hardening. Jabran approved its sign-in changes. SEC-e (removing the old scopes) runs one release later and waits for the reviewer's go.
- First, run and confirm the tests of App 6e11ba0 (entry 50).
- Same guardrails, commit identity and review-request flow; no pushes.

## 52 · 2026-10-06 · reviewer · queued: PCT-1 Platform chart templates (read-only)
- Approved by Jabran, queued AFTER RP-1 and SEC-1 (or alongside A1). Don't start yet.
- Scope:
  - Platform → Chart templates (Neovatus staff, read-only).
  - Per pack/version: accounts, Used for links, tax codes, with source and check_state.
  - Which companies use which pack version.
  - No editing: pack fixes stay new versions via the generator and a migration.
- The reviewer writes a short spec and contract before it starts.

## 53 · 2026-10-06 · reviewer · ack of entry 43
- Entry 50 tests confirmed; docs committed (App 023eb38, Backend 02ed0e8). Thanks.
- Change notes 1–3: all ACCEPTED.
  - V32 for books_start_date.
  - SEC-d committed only after SEC-c.
  - SEC-b in two phases, accounts after R2.
- Carry on. Post review-requests per batch.

## 54 · 2026-10-06 · reviewer · ruling on entry 44 (SEC-d re-sign-in gap)
**(a) ACCEPTED, plus one small safety net. No token-store change.**
1. SEC-e ships no earlier than 7 days (the refresh-token lifetime) after the SEC-d app release reaches users. Record that as a gate on SEC-e in the ADR-016 slice table.
2. Safety net, in SEC-b/SEC-c:
   - The shared neoerp-security library answers a human token that lacks the required first-party scope with 403 and the distinct code `TOKEN_SCOPE_MISSING` (not PERMISSION_DENIED).
   - The app treats `TOKEN_SCOPE_MISSING` from any service as "sign in again": clear the session, then show the sign-in screen with "Please sign in again to continue." It never shows "no access".
   - This also covers dev machines with lingering old tokens and any future scope change.
   - Tests: the library returns the code; the app maps it to re-sign-in.
3. Dropping `gateway` from the app request is accepted (D2: a machine scope; api-gateway checks no scope).
SEC-d is still committed only after SEC-c.

## 55 · 2026-10-06 · reviewer · rulings on entry 45
1. **Sign-out ends every device: ACCEPTED for now.** It matches what Keycloak sign-out already did. Backlog: per-device sign-out (keyed by authorization / idp_sid) plus an explicit "Sign out everywhere" action.
   - The sign-out confirmation text must say so: "This signs you out on all your devices."
2. **Password reset: (a) ACCEPTED.** An admin- or support-initiated reset always sends `signOutEverywhere=true` (one line in user-service, in SEC-c), with a test.
   - Backlog: (b) a Keycloak "password updated" event to auth-service, so a person's own password change also revokes.
3. **Parallel refresh = reuse: the app MUST refresh single-flight.**
   - One in-flight refresh per session, shared by all callers (the network runtime and every repository); other callers wait for its result.
   - Required test: N concurrent 401s → exactly one refresh call, and all retries use the new token.
   - If the review finds any path that can refresh in parallel (two windows, background sync), fix it in the app. Don't loosen reuse detection on the server.

## 56 · 2026-10-06 · reviewer · rulings on entries 46 and 47
**Entry 46 (library): 1–5 ACCEPTED as built.**
- Choice 3 (any other token shape refused everywhere) is right; keep it.
- Record 1–5 in ADR-016 D4 as "library rules" when you commit.

**Entry 47 (RP-1 backend):**
1. **Add `BOOKS_START_DATE` to `changed`. YES.** Contract rule, to add to accounts-a0.md §4 as A-20:
   - `changed` is an open list. Consumers must ignore values they don't know, and an unknown value never makes an event malformed or unacked.
   - Check accounts' per-event parser meets this; fix it if it doesn't, with a test that an unknown `changed` value is accepted.
   - Accounts on BOOKS_START_DATE: READY books refresh `plannedGoLive` (it is read from facts anyway). LIVE books ignore it (no drift; the go-live date is fixed).
2–7. ACCEPTED.
- On 4: a null PATCH field keeps the value, so a planned books start date can't be cleared once set. That's fine for now; backlog "clear planned books start date".

## 57 · 2026-10-06 · reviewer · ruling on entry 48
- **(a) ACCEPTED: single-instance guard on desktop.**
  - Use a lock file next to the token store, held for the process lifetime (OS file lock, so a crash releases it).
  - A second launch hands focus to the running instance if that's easy on the platform. Otherwise it exits with "NeoERP is already open."
  - Test the guard logic (lock held → second start refused).
  - Android and iOS are single-process, so nothing is needed there. Note that in the plan.
- Order confirmed: reuse detection is committed only in the same batch as the app single-flight gate and this guard, never before.
- The three auth-service fixes (re-insert after delete MAJOR, rotation save order, Keycloak failure rolling back the revoke) need a regression test each.

## 58 · 2026-10-06 · reviewer · review of entry 50 (batch 1) + rulings on entries 49, 51, 52
Backend 0a5c8f2..2975867, App e9f7625..157e233: **ACCEPTED with fixes**, no BLOCKER. Entry 49's rule (an FY change that leaves booksStartDate outside the window → 422) is ACCEPTED.

**RP-1 fixes (next batch, round 2 checks them):**
1. MAJOR, lost update: PUT /companies/{id} and activate/deactivate/suspend read without a lock and save the whole row (CompanyService.kt:71,78,194–222; CompanyEntity has no @Version). So they can silently revert an accepted fiscal-facts PATCH.
   - Fix: add `@Version` to CompanyEntity; a conflict → 409 VERSION_CONFLICT. No API change, since the read and save happen in one transaction.
   - Regression test: a PUT racing a PATCH.
2. MINOR, FiscalFacts.kt:14: refuse currency codes with defaultFractionDigits < 0 (X?? test/metal/fund codes) and withdrawn codes (keep a short explicit list: DEM, FRF, VEF, …). Add the cases to RegionProfileTest.
3. MINOR, CompanyFiscalFactsService.kt:60–67: always ask books-state, even with FINANCE off. Accounts answers NONE when there are no books, and unreachable → 503 (fail closed). A company can have LIVE books with FINANCE later turned off.
4. MINOR, AccountsInternalSecurity.kt:61–124: the internal chain must check the token kind (client_id present and == sub). Optionally pin client neoerp-org-service. Add a test with a person-shaped token that has the right audience and scope. Can land with SEC-b phase 2.

**Library fixes (before any further adoption):**
5. MAJOR, company binding is only by a named path variable (ServiceAccessInterceptor.kt:82–95). For full guard (`@ServiceEndpoint`) handlers:
   - each endpoint declares its company source (param / named path variable / none), and startup fails if a guarded handler has an undeclared company-shaped variable;
   - add a RequestBodyAdvice: a body implementing `CompanyScoped` whose companyId ≠ call.companyId → 400;
   - the contract suite gets "path/body company ≠ authorised company → 400".
6. MINOR: classify paths on the decoded path within the application, not the raw requestURI (NeoErpPaths.kt:10).
7. MINOR: refuse non-HandlerMethod handlers except an allowlist (static resources, CORS preflight/OPTIONS, error controller). Default servicePackages = com.neovatus.
8. MINOR, important:
   - the library sets its own JwtAuthenticationConverter (scopes → SCOPE_* only);
   - it strips any PLATFORM_* / ROLE_SUPER_ADMIN authority that came from the token before adding the lifecycle decision's;
   - a service can't override that.
9. MINOR:
   - a startup check fails when there is more than one SecurityFilterChain, or when ServiceAuthorization isn't the library's;
   - add one test that boots a real @SpringBootApplication with full auto-configuration (Boot's own security/actuator auto-config backs off).
10. MINOR: FirstPartyTokenContract gets hooks plus tests for:
    - an unannotated handler → 500;
    - a company mismatch → 400;
    - a platform READ_ONLY write → PLATFORM_READ_ONLY;
    - a write with the permission source down → 503;
    - module off → MODULE_NOT_ENABLED.
- Backlog: an overall per-call deadline (m6).

**Entry 52 (two tiers): APPROVED** (51's A + B included). No API or app change in SEC-c.
- **Tier 1, all services now:**
  - library token kind, audience + scope (`neoerp.app` OR legacy, TOKEN_SCOPE_MISSING), lifecycle filter with the platform fields, error body, deny-by-default;
  - `@SelfAuthorizedEndpoint` leaves the decision to the service's existing rules;
  - B: UserLifecycleDecision carries platformPermissions/scopeAll/companyIds/accessId, plus `LifecycleDecisionHook.around`;
  - `@InternalEndpoint(allowedClients=…)`;
  - audit's legacy machine paths as a configured transition list;
  - payroll keeps its isolation gate filter.
- **Guard, required:** a `@SelfAuthorizedEndpoint` handler without a method-security rule (`@PreAuthorize` or equivalent) **fails startup**. "Self-authorised" must never mean "unauthorised". The contract suite covers it.
- **Tier 2, per module later:** full `@ServiceEndpoint` (company binding per fix 5, fresh permissions, module check) when a module's API is reworked. New modules (Accounts A1+, Inventory…) start on tier 2.
- Backlog: move audit's machine writes to /api/internal/audit/… (a contract change).
- I add the tiers to ADR-016 D4 now; commit it with your next batch.
Order:
1. Library fixes 5–10 + the tier-1 features (one worker, reviewed).
2. Then the per-service tier-1 moves.
3. accounts phase 2 and user-service may continue meanwhile, but rebase them on the fixed library before commit.

## 59 · 2026-10-06 · reviewer · ruling on entry 53 (via 54): user-service exemption lists
**APPROVED, with these limits:**
1. Both lists are empty by default and set only in user-service's config. They are exact paths or narrow patterns (no `/api/**`-style wildcards). The library refuses at startup a pattern broader than one segment wildcard at the end.
2. **Lifecycle-exempt:**
   - `/api/lifecycle/decision` only: it answers `200 {allowed:false}` itself.
   - `GET /api/users/me` is exempt **only from the USER_NOT_FOUND denial** (first sign-in creates the row). A suspended or deactivated user is still refused there.
   - Token kind, audience and scope rules still apply to both.
3. **READ_ONLY-session write exemptions:**
   - `/api/platform/company-access/**`, restricted to ending/leaving the caller's own session (the handler's own rule enforces "own session");
   - `/api/users/me/**` (self-service on one's own account).
   - Nothing else.
4. The library logs both lists at startup. The contract suite tests that:
   - a path not in the list is still refused;
   - an exempt path still needs a valid token;
   - a suspended user is refused on /api/users/me.
5. user-service supplies its lifecycle and permission sources in-process. Internal endpoints use `allowedClients` (neoerp-org-service, neoerp-hr-service).
Record these in ADR-016 D4a when you commit.
V33 for companies.version: accepted.

## 60 · 2026-10-06 · reviewer · ruling on entry 55 (refresh outcome unknown)
**(a) APPROVED. It's the reviewer's call: a technical security policy inside the approved ADR-016 D6.**
- The request was sent and then timed out or the connection reset: clear the tokens, and this device signs in again ("Please sign in again to continue."). Never resend R0.
- A 2xx with an unreadable body: clear the tokens (certain rotation).
- A pre-send connectivity failure (refused, DNS, offline): keep R0 and retry later.
- Keep it behind the one switch, default (a), with a test per branch.
- The two BLOCKER fixes (NonCancellable refresh + save, generation bump in finally, a failed save clears the tokens, Android commit(), iOS writes the refresh token first) are required before reuse detection is committed. Each gets a regression test from its probe.
- Backlog: a server-side reuse grace window. Within ~30 s, the same client re-presenting the just-rotated token gets the same successor back instead of revocation. That would make (b) safe on flaky mobile networks. Not now.

## 61 · 2026-10-06 · reviewer · review of entry 57 (batch 2) + rulings on entry 56
Backend 2975867..555a947: **ACCEPTED.** RP-1 round 2 (items 1–3) is closed: V33 @Version with race tests, currency rules, books-state always checked. The reset sign-out and ADR D4a are fine. The independent gateway review found no BLOCKER or MAJOR.
- Yes, add **ZWL** to the withdrawn list.
- The duplicate-on-existing-id side effect is accepted. The enrolment retry still works (rollback hard-deletes first). Add one real-Postgres integration test: delete, then retry with the same id.

**Entry 56: 1–4 ACCEPTED,** with the fixes below. 5 goes to the backlog (auth-service/Keycloak failed sign-in events → per-user alerts). 6: yes, update the gateway docs and the hardening plan item 1 to describe the new filter (docs-only, approved).

**Key cap ruling: LRU eviction, not fail-closed.** A flood of new keys must never lock out real users.
1. Separate maps per scope:
   - per-user (verified sub, bounded by real users);
   - per-IP;
   - sign-in.
   For per-IP and sign-in, evict the least-recently-used entry even when live (a flooder keeps its own bucket fresh, so eviction gives an attacker nothing). One WARN when a cap is first hit.
2. Security alert monitor (SecurityAlertMonitor.kt:56,88–90): separate maps per rule, so unauthenticated IPs can't fill the user-keyed rules. A WARN "security alert" line at most once per window when untracked keys start.
3. RateLimitWebFilters.kt:47: exempt only /actuator/health, /actuator/health/** and /actuator/info from the per-IP limit, not all of /actuator/**.

**SEC-b phase 2 changes confirmed:**
- a machine token on a human path → 401 (library rule 1);
- the internal prefix = all of /api/internal/**.

## 62 · 2026-10-06 · reviewer · rulings on entry 58 (library fixes + tier 1)
1. ACCEPTED. No `company = NONE`: an endpoint with no company is `@SelfAuthorizedEndpoint`. Company source is PARAM/PATH plus the CompanyScoped body check, and the startup detection rules are as built.
2. **RESTRICT.** The read-only-write-exempt list skips ONLY the READ_ONLY-session refusal, never the service-wide `platform-read-only=true` policy. That policy is a service-level decision (Accounts) and must not have a per-path bypass. Make the contract case pass by configuring the test service without `platform-read-only`, or by asserting that exempt + platform-read-only → still refused. Add that assertion.
3. ACCEPTED: strip token-sourced `PLATFORM.*`, `PLATFORM_*` and `ROLE_SUPER_ADMIN`.
4. ACCEPTED: an unannotated handler gets 500 at runtime; two endpoint annotations fail startup.
5. ACCEPTED, with a parity requirement. When a service's `authorizeHttpRequests` route rules move to `@PreAuthorize` on `@SelfAuthorizedEndpoint` handlers (audit, payroll's gate onto NeoErpChainFilter):
   - each service adds a rule-parity test listing every former route rule (method + path → required authority/scope) and asserting the same outcome for an allowed and a refused token;
   - no rule may be dropped silently, especially audit's machine-scope paths (`audit.event.write`, `notification.command.write`, `workflow.command.write`).
6. ACCEPTED: every contract test supplies `readOnlySession`, `unannotatedRequest` and (tier 1) `selfAuthorizedDenied`.

## 63 · 2026-10-06 · reviewer · rulings on entry 59
1. **RP-1 lock read: (a) APPROVED, as a separate endpoint.**
   - Add `GET /api/org/companies/{id}/fiscal-facts-lock` → `{ state: EDITABLE|LOCKED|UNKNOWN, liveSince? }`.
   - It needs the same permission as reading the company. It uses the same fail-closed books-state call (unreachable → UNKNOWN, never EDITABLE).
   - Don't embed it in `GET /companies/{id}`, so ordinary company reads don't depend on accounts.
   - The app calls it only when showing Company details' fiscal facts:
     - LOCKED → read-only with the "Locked: Accounts went live on {date}" hint;
     - UNKNOWN → "Can't check Accounts right now. Try again" and edits disabled;
     - EDITABLE → editable.
   - Saving still enforces the lock server-side.
   - Record it in org-region-profile.md §3/§4 as an amendment.
2. **Library F1: ACCEPTED** (refuse permitAll/true, @PostAuthorize-only on writes, final methods, isAuthenticated()).
   - `@SelfAuthorizedEndpoint(anyActivePerson = true)` is the explicit opt-in.
   - The library logs the list of anyActivePerson endpoints at startup, so they stay visible.
   - **F2 ACCEPTED.**
3. The RP-1 app BLOCKER fix (request prefill keeping PKR/July): fine, with tests. Backlog the minimum JDK patch level for org-service (≥ 21.0.7, so XCG/ZWG are known); pin it in the build/Docker base when convenient.

## 64 · 2026-10-06 · reviewer · review of entry 60 (batch 3) + the 502/504 question
Backend 555a947..864dff5, App 157e233..831c9ae: **ACCEPTED with fixes**, no BLOCKER.
- Closed and verified: ZWL; the real-Postgres retry test; gateway LRU per scope + per-rule alert maps + health/info-only exemption; the lock-read amendment; RP-1 R5 app; auth-service `neoerp.app` (app client only, defensive customizer), token-shape pin, org-only `accounts.books.read`, V11 new-file only, revocation committed before Keycloak; app single-flight gate (one runtime, barrier test), generation logic, desktop OS lock, sign-out caption.
- **These fixes come before anything else in SEC-1, and before any build goes to another person's device.**

**Question (502/504): every 5xx from the token endpoint = MaybeSent → clear (sign in again).** The one exception: a 503/500 whose OAuth JSON body is `temporarily_unavailable` keeps R0, and only if auth-service guarantees no rotation on that path. Add a test per status. (This is also review finding M1.)

**MAJOR (app):**
1. **Process death between server rotation and local save** resends R0 on the next start, which revokes every device. NonCancellable doesn't cover a crash or kill.
   - Before sending a refresh, durably persist a "refresh pending" marker: a hash of R0, written with Android commit(), the Keychain, or a desktop fsync'd write. Clear it after the save or clear.
   - At start-up, if the marker matches the stored refresh token, treat R0 as spent: clear the tokens and sign in again.
   - Desktop: add a shutdown hook that waits, bounded, for the gate.
2. **Verify, and fix if true: the refresher sends `Authorization: Bearer <expired access token>` to /oauth2/token** (NeoErpNetworkRuntime.{jvm,android,ios}.kt ~254–257 build it on the bearer gateway client). auth-service's authorization-server chain has oauth2ResourceServer, so it may answer 401 invalid_token, and the app would sign out at every access-token expiry. Build the refresher on `buildNeoErpAuthRuntime` (no bearer), with a test that asserts no Authorization header on the token request.

**MAJOR (auth-service, defence in depth, promoted from the backlog):**
3. **Soft-reuse grace window, 60 s, configurable.** A refresh presenting the immediate predecessor token within 60 s of its rotation, by the same client, gets `invalid_grant` and **no** revocation. That one device signs in again. Beyond 60 s, or an older ancestor, means full revocation as today. This caps the blast radius of any client mis-step (5xx, network races, the cases below) without losing theft detection.

**MINOR (auth-service):**
4. Make the rotation compare-and-set: in save, under the lock, if the stored refresh token ≠ the presented one → remove the authorization and return invalid_grant. That catches concurrent racers immediately.
5. Add a two-thread Postgres test proving the row lock stops the re-insert (DELETE blocks until save commits, and the row is gone afterwards).
6. Prune rotated tokens per authorization (`WHERE authorization_id = ? AND expires_at < ?`), or with a scheduled SKIP LOCKED job. Not a global DELETE inside the locked transaction.
7. `RegisteredClientsConfig.kt:150`: the Postman redirect URI on neoerp-frontend goes to the local profile only.

**MINOR (app):**
8. clear() must be durable and checked: Android commit(), check File.delete/Files.delete. If it fails, overwrite the refresh token with null via updateTokens.
9. A late refresh must not overwrite or wipe a newer sign-in: check that the stored refresh token is still the one sent before save/clear, or route sign-in/sign-out through the gate mutex.
10. TOKEN_SCOPE_MISSING: compare against the token actually sent (capture it per request), not the store's current token (NeoSessionGuard.kt:107).
11. Single-instance lock: only an actual "held by another process" result means "already open". Other IOExceptions are logged and start-up continues (NeoSingleInstanceLock.kt:42).
12. Classifier:
    - real-engine tests (refused port, unresolvable host, accept-then-reset, read-then-stall) on JVM/Android;
    - iOS -1009 → MaybeSent unless the path monitor showed offline before sending;
    - a 2xx without refresh_token → keep the access token, drop R0.
13. TOKEN_SCOPE_MISSING before generic 403 handling in SecurityRules.kt:213, GoLiveReviewViewModel.kt:454 and PlatformDashboardViewModel.kt:84.
Round 2 checks these only.

## 65 · 2026-10-06 · reviewer · ack of entries 61 and 62
- **MINOR 4 rule: ACCEPTED.** The racer never receives a stored token: it gets invalid_grant, and the winner keeps the sign-in. So a thief who loses the race gains nothing. The 60 s soft path only avoids revoking the real user. Document this in the auth API doc together with the grace window.
- 5xx handling as ruled is fine (OAuth errors are always 400; rotation commits at the end of save).
- **MAJOR 2 confirmed:** the bearer on /oauth2/token signs users out at roughly every access-token expiry, and it predates SEC-1. Commit the fix on its own, as planned, as soon as it's green. It is the top user-visible fix.
- Docs follow-ups (the three Postman "local only" mentions, the grace window in the auth API doc): yes, in the batch.
- f5141bd will be reviewed with the entry-64 range. Post the range when the app fixes land.

## 66 · 2026-10-06 · reviewer · ruling on entry 63 (four behaviour differences)
All four are **accepted**, with the conditions below. Each condition goes in the batch before dev; none needs a new round with me unless it fails.

1. **org: `org.read` alone can no longer write.** Accepted. Evidence: in the main tree, the only registered client holding `org.read` also holds `org.write` (RegisteredClientsConfig ~l.184). One real gap: `docs/postman/NeoERP_Local.postman_environment.json` `login_scope` is `gateway org.read hr.read payroll.read`, so Postman org writes will now return 403. Change it to `neoerp.app` (ADR-016 D1). Keep a read-only variant only if it is labelled as one. Note this in the org move's commit message.
2. **user-service lifecycle check on every endpoint except `/api/lifecycle/decision`.** Accepted, because ADR-016 checks 1–5 apply to every request. Condition: add one app test showing that a SUSPENDED 403 from the first post-sign-in call (`/api/users/me` or bootstrap) routes to the suspended screen, not a generic error or a retry loop. Sign-out must still work for a suspended person; it is auth-service revocation, so confirm nothing in that path calls user-service.
3. **Shared §6.2 refusal body (`path` dropped).** Accepted. Evidence: the app's `NeoApiErrorResponseDto.path` defaults to `""`, so dropping it is safe. But `status` has **no default** in that DTO. Confirm the §6.2 body always carries `status` (the library contract asserts it at FirstPartyTokenContract ~l.398; keep that assertion for org and user too). Also confirm that `error` and `message` are present or have defaults, otherwise the app fails to deserialise the error and shows the wrong message.
4. **`PATCH /api/users/me` 403 before the user exists.** Accepted. Note that the app's `NeoApiEndpoints` documents `GET|PUT /api/users/me`, not PATCH. Confirm which method the app sends, make the rule cover the method actually used, and confirm the first-run flow never writes `/me` before the user is created.

No change to ordering: finish the entry-64 app fixes, then post one range covering them plus the org/user/hr-payroll-audit tier-1 moves.

## 67 · 2026-10-07 · reviewer · ruling on entry 65 (audit library requests)
Entry-66 conditions 1, 3 and 4 are accepted as reported. Condition 2 (the suspended-first-call app test) goes in the next range. The batch-4 review (entry 64) is still running; its ruling will come as entry 68.

1. **Legacy machine path without an audience: not approved. Accept the regression and drop the client's audit access.** Evidence: in main code, nothing obtains a `neoerp-gateway` client-credentials token. Its only uses are the auth-service registration and secret validator, tests, Postman and docs. A no-audience pin would weaken the D2 rule for a client that SEC-e removes anyway. Actions:
   - remove the gateway machine-path entries from audit;
   - delete the `@Disabled` parity cases rather than leaving them disabled;
   - mark the matching Postman machine requests "removed by SEC-c (ADR-016 D2)";
   - add one backlog line: "remove the neoerp-gateway client at SEC-e".
   If your independent review finds a live runtime caller, stop and tell me. Don't add the library option.
2. **One `*` segment in READ_ONLY exempt patterns: approved, with these limits:**
   - `*` matches exactly one non-empty path segment (no `/`, no `**`, no prefix or suffix inside a segment);
   - each pattern starts with at least two literal segments and ends with a literal segment, and is bound to a method;
   - invalid patterns fail at startup, like the other exemption rules;
   - the exemption only lifts the READ_ONLY write block. The endpoint must still check ownership, so a READ_ONLY session marking **someone else's** notification gets 403/404.
   Tests:
   - `POST /api/notifications/{id}/read` passes for the owner and fails for another person;
   - `/api/notifications/a/b/read`, `/api/notifications//read`, `/api/notifications/x/read/extra` and `GET`/`DELETE` on the same path don't match;
   - startup rejects `/api/*/x`, `/api/notifications/*`, `**` and `a*b`.
   Add a line to ADR-016 D4a recording that exempt patterns allow one `*` segment.

## 68 · 2026-10-07 · reviewer · batch 4 review (entry 64)
Five independent reviews, of the library, auth, accounts+org, app session and RP-1 app. Accepted:
- **auth** f5141bd/fc27117;
- **accounts + org lock** 9b240ed/6785e5b/ef353f8 (no findings);
- **library** a85d91f..8a44078 (minor fixes);
- **RP-1 app** cf6ae52/9f1442f/059bde8 (minor fixes).

**App session** 8c721da/3ab6357/9af1081 is accepted only once the MAJOR below is fixed. That fix must land before any build goes to another person's device.

### MAJOR (app session)
1. **The marker is removed even when the clear failed, so a spent R0 can be resent.**
   - `NeoErpTokenRefresher.kt` ~201–217: `endSession` → `clearDurably` swallows a failed fallback, then calls `clearMarker()` regardless.
   - Desktop: `Files.deleteIfExists` can fail (Windows AV/backup lock) while the separate marker file deletes fine, leaving R0 stored with no marker. The next refresh resends R0, and reuse detection then signs out every device.
   - iOS: `NeoErpTokenStore.ios.kt` ~104–108, `write(account, null)` ignores the `delete()` status and returns true.
   - Rule: **remove the marker only after the token clear or overwrite is confirmed.** Otherwise keep it, so start-up recovery retries the clear. iOS `write(null)` must return the real delete result (errSecItemNotFound counts as success).
   - Tests: a fake store whose clear and fallback both fail leaves the marker in place, and the next refresh does not send R0.

### MINOR (same batch)
**App session:**
2. **An unreadable marker is treated as "no marker"** (`NeoErpTokenRefresher.kt` ~131 `getOrNull() ?: return false`; desktop `readText` IOException, iOS `read()` returns null on any Keychain error). Read error → do not refresh; treat as MaybeSent and clear. Only "confirmed absent" (file missing / errSecItemNotFound) lets the refresh go ahead. Test both.
3. **The stale-refresh check (~183) isn't atomic with the save (~189).** Sign-in (`BootstrapWithTokensUseCase.kt:17`) and sign-out (`AuthRepositoryImpl` ~59 `clear()`) write outside the gate. Run those writes under the same gate mutex as the refresher, as entry 64 item 9 offered. Test: a sign-in during an in-flight refresh keeps the new sign-in.
4. **The desktop marker isn't fully durable** (`NeoErpTokenStore.jvm.kt` ~106–111):
   - write to a temp file, then fsync it;
   - use `ATOMIC_MOVE`;
   - fsync the `.neoerp` directory too.
   macOS F_FULLFSYNC isn't required; note the limitation in a code comment.
5. **Per-request token capture depends on KMM-Network** `AuthTokenProvider` running in the caller's coroutine context, and that library is outside our mount. Confirm it in KMM-Network, or capture the token explicitly per request. Add a test that fails if the fallback to the token stored before the call is used.
6. **Confirm `temporarily_unavailable`** (entry 64, the 5xx ruling): auth-service must guarantee no rotation on any path that returns it. If it can't, every 5xx clears. Add a one-line note in auth.md.

**Library:**
7. **`@SelfAuthorizedEndpoint` startup check** (`NeoErpSecurityStartupCheck.kt` ~148–180) passes if any advisor matches. A handler with `@PreAuthorize(neoerp.app)` + `@RolesAllowed` passes while JSR-250 is off, so the role is never enforced. Require an active advisor for **each** rule kind present; otherwise startup fails. Test it.
8. **Lifecycle-exempt paths accept `/**`** (`NeoErpPaths.kt` ~100–110). Entry 59 allows exact paths only, so reject subtrees at startup. The interceptor also must require the lifecycle decision attribute on non-exempt paths, so a misconfigured filter can't silently let a SUSPENDED person through.
9. **Actuator:** the library permits all of `/actuator/**` (`NeoErpSecurityAutoConfiguration.kt` ~143, `NeoErpPaths.kt` ~31). Narrow it to `/actuator/health`, `/actuator/health/**` and `/actuator/info`, as entry 61.3 ruled.
10. **The contract's `internalClientPinned` defaults to false**, so a pinned service can silently skip the "other client refused" case. Derive it from the handler's `@InternalEndpoint.allowedClients`.
11. **Legacy machine paths:** `{*rest}` capture-all slips past the no-`**` rule (`NeoErpPaths.kt` ~159). Reject it at startup too.

**Auth (docs only):**
12. auth.md: add that **a thief who wins the race within the grace window is not detected**; the real client gets invalid_grant and must sign in again. This is the accepted cost of the 60 s window (entry 64 MAJOR 3).

**RP-1 app:**
13. **409 VERSION_CONFLICT on the fiscal-facts save** shows a generic error with no reload (`OrganizationEventHandler.kt` ~482–491, `CompanyFiscalFacts.kt:138`). Map it to "This company changed — reloaded, check and save again", reload the company, and rebuild the editor from the fresh values. Test it.
14. **Reopening a company keeps the old lock state while it is read again** (~444–447; `canEdit` ignores `isLockLoading`). Reset `lock` to Checking when the read starts. Test: EDITABLE → reopen → no Edit until the new answer arrives.
15. Clearing the planned books start date stays in the backlog (already listed). No change now.

### Entry-64 risk questions
- **R1 (Android HttpURLConnection may silently retry the token POST): backlog**, not a release blocker. A silent retry happens within seconds, so the 60 s grace window covers it. Before SEC-e, either move the Android engine to OkHttp with `retryOnConnectionFailure(false)` for the token call, or prove there's no retry. Add the backlog line.
- **R2 (`bootstrapSession` clears tokens when start-up reads fail on a network error): fix now, not backlog.** An offline launch signs the user out, which is common and visible.
  - A network failure (NotSent/MaybeSent at transport level, no HTTP answer) keeps the tokens and shows "Can't reach NeoERP — Try again".
  - Only an auth answer (401 after refresh, invalid_grant) clears.
  - Tests: offline start keeps the sign-in; 401 start clears.

Order: item 1 first, as its own commit. Then 2–6 and R2, then the library 7–11, and 12–14 in either order. Post one range. Second review round on this batch only for items 1–3 and R2; the rest I'll accept on your test names.

## 69 · 2026-10-07 · reviewer · ruling on entry 66 (first-sign-in BLOCKER) + ack of 67
**Option (a) is approved:** a reason-aware first-sign-in exemption. This amends entry 59's list. Option (b) is rejected, because it needs an app change and still leaves PENDING broken. Good catch by the review.

Limits:
1. **Exactly two entries:** `GET /api/users/me` and `GET /api/app/bootstrap`. Allowed reasons are `USER_NOT_FOUND` and `PENDING`. Any other method on those paths is not exempt.
2. **Closed reason set:** the library only accepts reasons from {USER_NOT_FOUND, PENDING}. If a config names SUSPENDED, DEACTIVATED or anything else, **startup fails**. The default stays USER_NOT_FOUND only, and the same narrow-shape rules apply (exact path, method-bound).
3. **The exemption lifts only the lifecycle refusal.** Token kind, audience, scope and the READ_ONLY rules still apply in full.
4. **No data before activation:** both handlers run accept-invite, then `requireActiveUser`, before reading or returning anything else. If the person is still PENDING after that (not an invitee, or the invite was revoked or expired), they get 403 with the §6.2 body and `reasonCode=PENDING`, the same as before the move.
5. **Accept must be idempotent and race-safe:** bootstrap and `/me` can run at the same time on first launch. Both must succeed, with one row and one ACTIVE transition (one audit event, not two).

Tests, all through the HTTP chain:
- a PENDING invitee calls bootstrap → 200, and the row is ACTIVE;
- a PENDING invitee calls `/me` → 200;
- an unknown person calls bootstrap → the row is created → 200;
- PENDING but not an invitee → 403 PENDING;
- SUSPENDED → 403;
- DEACTIVATED → 403;
- PENDING on `PATCH /me` and on one other endpoint → 403;
- `POST`/`PUT` on the bootstrap path is not exempt;
- concurrent bootstrap + `/me` for the same invitee → one ACTIVE transition;
- startup rejects reason `SUSPENDED`.
Also turn `InviteAcceptSignInIntegrationTest` into a test through the HTTP chain, or add one alongside it.

**App (MINOR, in the entry-68 batch alongside R2).** A 403 the app can't decode on bootstrap currently clears the tokens. Read the §6.2 body. A lifecycle 403 (any `reasonCode`) shows the matching screen and **never** clears the tokens. Only an auth failure clears them. Test: 403 USER_NOT_FOUND and 403 PENDING on bootstrap keep the sign-in.

**Docs:** update ADR-016 D4a and the entry-59 list in the user-service security notes to name the two entries and their reasons.

**Order:** the library change + user 0a8a206 + this fix go to dev together, never 0a8a206 alone. The batch needs one more review round with me, on the user move with this fix only.

**Entry 67** is acknowledged. Items 6 and 12 are done, the backlog lines are in place, and the gateway-caller check stays as ruled in 67.1.

## 70 · 2026-10-07 · reviewer · rulings on entries 68 + 69 (audit holes; payroll differences)
**hr/payroll/audit tier-1 on dev** (4d9108c, 99f3be8, c7c9ee7, c32bfa5): acknowledged. Payroll differences (a), (b) and (c) are **accepted**. All three fail closed, and (a) matches hr. Add them to the accepted-differences list in ADR-016 D5.

**The audit holes: fix all three now, not just (2).** No app uses these routes, but every person token holding `neoerp.app` can call them directly. That makes them live IDORs today, and with (3) actor spoofing on approvals. Closing them now costs little, because there are no person callers to break.

1. **Notification query** (`NotificationService.query`):
   - for a person token, always scope to the caller's own notifications (recipient = the token's user);
   - drop the `userId` and `email` filters for persons; if sent, they give 400 `FILTER_NOT_ALLOWED` (don't silently ignore them, or a client will think the filter worked);
   - `orgId` may only narrow the caller's own notifications;
   - an admin or cross-person view is out of scope, and goes to the backlog as a permissioned endpoint at audit tier 2.
2. **Mark read**: approved as you proposed. Pass the caller in; a non-owner gets 404 with no existence leak; record an audit event as today. Land it with the 67.2 one-`*` exemption.
3. **Workflow approve/reject** (by id and by subject):
   - **Person tokens are refused (403)** on all four decision routes.
   - The only real caller is hr-service's `WorkflowPublisher`, which uses a client-credentials **machine** token (`approveBySubject`/`rejectBySubject`; hr checks the person's authority before calling). Move those routes to machine-only, pinned to the hr-service client (`allowedClients`). `actor` from the body is accepted only from that pinned machine client.
   - Before landing, grep every caller of these four routes (payroll, user, org). If another service calls them, add it to the pin and list it in your entry. If any caller uses a **person** token, stop and tell me.
   - A person-facing "approve my inbox item" route, with actor = token and an assignee check, is backlog for audit tier 2.
   - Workflow **query** has the same free-filter shape (`initiator`, `assignee`). Scope it like (1): a person sees only items they initiated or are assigned, and other person filters give 400.

Tests, through the HTTP chain:
- notifications: the owner can query and mark read; another person's notification gets 404 / is never listed; a `userId` filter for a person → 400;
- workflows: a person on approve/reject (all four routes) → 403; the hr machine client → 200 with the body actor recorded; another machine client → 403; a person's workflow query is scoped to them.

This is a behaviour change, and approved as such. Note it in the commit message and in platform.md. One review round with me, on the audit commit only.

## 71 · 2026-10-07 · reviewer · entries 70 + 71: SEC-c complete; audit fix review (one round)
**SEC-c is complete on dev and acknowledged:**
- user 5a46d51 + 3b22a90 (landed together, as required);
- library 63cc825 + 40fb493;
- audit IDOR fix d0c12cf.

**SEC-d** (App b52442d) is acknowledged. The SEC-e gate starts on the day Jabran ships that app release to users, not on commit day; record that date in plan.md when it happens. Narrowing actuator to health, info and /error is accepted.

**Audit fix d0c12cf is accepted.** My independent round found no MAJOR. What it confirmed:
- every notification and workflow route is guarded;
- a user-service failure gives 503, so it fails closed;
- the non-owner 404 is identical to the missing-id 404;
- the filter 400 can't be dodged;
- hr submit still works;
- the decision pin matches on `sub`.

Your three review notes:
- **(c) Now.** Drop the token subject from `workflowIdentifiers`. It's a real spoof: a person whose username equals a stored literal initiator (payroll stores `initiator = "payroll-service"`, PayRunController.kt:40) sees those items. Use the IAM user id only. Test: a person with username `payroll-service` sees no pay-run items.
- **(b) Now.** On the four decision routes, the calling client must equal the item's `producerClientId`; otherwise 404, the same as a missing item. Test: payroll deciding an hr item → 404.
- **(a) Backlog**, as you have it. The side-effect-free identity lookup is due before any app feature uses notifications or workflows.

**One more MINOR, same commit as (b)/(c).** `AuditCallerScopeTest` runs over `InMemoryNotifications`/`InMemoryWorkflows` and `FakeAuditCallers`, so the JPA `userEquals`/`participantIn` specs and the `/me` parsing are never tested. Add:
- one Testcontainers test through the real repositories: owner vs other person, for notification query, mark-read and workflow query;
- one parsing test for `AuditCallerIdentityClient`: a valid `/me`, a missing id, a non-UUID id and a 4xx all handled correctly.

**Backlog note.** hr stores `initiator = employeeId`, not the IAM id, so people currently see none of their own hr items. This fails closed, so leave it. It belongs with (a): a proper "my inbox" design at audit tier 2.

No further review round needed for (b), (c) or the tests; I'll accept them on their test names in your next range.

## 72 · 2026-10-07 · reviewer · batch 5 (entry 72) round 2 + entry 73
**Accepted:**
- **App** 9af1081..068fc02. Round 2 on entry-68 items 1–3 + R2 was run independently: no MAJOR, and each ruling holds with its named tests. RP-1 items 13–14 and SEC-d b52442d are accepted.
- **Backend** ef353f8..75b6e7f, for the record, including the owning plans.
- **Entry 73** (19b967e), on its test names: (b), (c), the real-DB test and the parsing tests.

### Your decision question (068fc02): a definite answer with no session
**Don't clear.** Only an auth failure clears: a 401 with the refresh reachable, or invalid_grant/Revoked. Every other start-up outcome keeps the tokens and shows a reason with **Try again** and **Sign out**:
- no memberships → "You don't have access to any company yet. Ask your administrator, then try again.";
- a 404, or a blank or empty 2xx on bootstrap or `/me` → SessionStartIncomplete, as for a 5xx.
Clearing on "no memberships" makes people sign in again just to read the same message, and clearing on a 404 signs people out during a gateway deploy (the review's finding). Tests: no memberships keeps the sign-in; bootstrap 404 keeps it; Sign out clears it.

### MINOR (one small commit, before SEC-e; it doesn't block Jabran's device smoke test)
1. **iOS `read()` returns null on any Keychain error** (`ios.kt` ~114). In recovery (`NeoErpTokenRefresher.kt` ~144–156) and in the stale-refresh check (~201), a failed read of the refresh token looks "absent", so the marker is deleted while R0 stays stored, and the next refresh resends R0.
   - Make `refreshToken()` throw on anything but errSecItemNotFound, as `refreshPending()` already does.
   - In recovery, a read error keeps the marker and ends the session without sending.
   - The ~201 check is now redundant, because every writer is gated. Remove it, or make it throw-safe in the same way.
   - Test with a fake store whose token read throws.
2. **Wrong message after a start-up `TOKEN_SCOPE_MISSING`** (`AuthRepositoryImpl.kt` ~57). The guard has already cleared the tokens, but the screen says "You're still signed in." Show the TOKEN_SCOPE_MISSING wording ("Sign in again to continue") and go to sign-in.

### UI note
There's no suspended screen; showing lifecycle reasons on the sign-in screen is fine for now. The kept-token states (AccountUnavailable, SessionStartIncomplete, no access) must offer both **Try again** and **Sign out**, so nobody is stuck. Confirm both buttons are there. A designed "account status" screen goes in the backlog for NeoERP-Design.

**Next:** Jabran's device sign-in smoke test (desktop, Android, iOS) and the RP-1 click-through. Post the result as an entry. SEC-e stays gated at 7 days or more after the SEC-d release reaches users.

## 73 · 2026-10-07 · reviewer · ack of entry 74 (a20bc7e)
Accepted on its test names. Both MINORs are done (I checked iOS `readStrict`), and the kept states and messages are as ruled.
**Your question about a bootstrap answer with an empty membership list: leave it as is.** Opening the shell with "No company assigned" keeps the sign-in, which is the rule. A single shared "no access" treatment can come with the account-status screen in the backlog. Next: Jabran's device smoke test and the RP-1 click-through.

## 74 · 2026-10-07 · reviewer · SEC-e now: Jabran drops the transition (dev mode)
**Jabran's decision (2026-10-07), in chat:** NeoERP is in development with no released users, so there is no transition period. The 7-day gate after the SEC-d release is **cancelled**, and SEC-e goes ahead now. This is his approval of the sign-in change.

**SEC-e scope (one batch, backend + docs; the app already requests only `neoerp.app`):**
1. **auth-service:** the app client (`neoerp-frontend`) keeps only `openid profile email neoerp.app`. Remove `org.*`, `hr.*`, `payroll.*`, `accounts.*`, `iam.admin` and `gateway` from it. `ensureFrontendClient` already rewrites scopes on start, so confirm existing DB rows are corrected too.
2. **All services:** person tokens are accepted with `neoerp.app` only. Delete the legacy human-scope lists (legacy-read/write-scopes config, `SCOPE_org.read`-style rules, the D5 "or old scope" branch in the library) together with their config keys, so nothing can switch them back on.
3. **Delete the `neoerp-gateway` client**: its registration, its bootstrap secret, the validator entry, Postman and docs (backlog item "remove at SEC-e"). First confirm again that nothing in main code obtains its token. If api-gateway needs a client for anything, stop and tell me.
4. **Out of scope:** machine clients and their narrow scopes (D2), and the remaining legacy machine paths (their move to `/api/internal` stays in the backlog). Don't touch them in this batch.
5. **Tests**, as ADR-016 D5 step 3 requires:
   - a token with only `neoerp.app` works on one read and one write endpoint per service;
   - a person token with only a legacy scope (e.g. `org.read`) gets 403 `TOKEN_SCOPE_MISSING` on every service;
   - auth-service refuses an authorize request asking for `org.read` with `invalid_scope`;
   - the `neoerp-gateway` client can't get a token.
   Update or delete the parity tests that assumed legacy scopes; no leftover `@Disabled`.
6. **Docs:**
   - ADR-016 D5: "Transition shortened by Jabran 2026-10-07 (dev, no released users): steps 1–3 done together; no release gap";
   - sec-1 plan.md: SEC-e implemented, gate removed;
   - Postman: only `neoerp.app`;
   - local-demo-data / auth.md: old local refresh tokens get TOKEN_SCOPE_MISSING, so sign in again once.
7. **The backlog line "Android no-retry before SEC-e"** becomes "before the first release to real users". It still stands, but it no longer gates.

**Order:** do SEC-e first, then Jabran's device smoke test, so he tests the final state once. Independent review as usual, then one round with me. After you post the range, Jabran must restart the backend and sign in again on every device.

## 75 · 2026-10-07 · reviewer · SEC-e ACCEPTED (entry 76)
Backend 19b967e..656597b is **accepted**. My independent round found no MAJOR or MINOR issues.
- **Person paths:** none still accepts a legacy scope; `acceptedHumanScopes()` = {neoerp.app}, and the keys are gone from all six services.
- **auth V13:** it's a new file, and V0–V12 are byte-identical. The delete order is correct, it's limited to `neoerp-gateway`, and it is safe when the row is absent.
- **Frontend client:** rewritten to the four scopes on every start, with redirect and PKCE settings kept.
- **`appScope`:** cannot be overridden; startup fails if anyone tries.
- **Machine clients and machine paths:** unchanged; every machine caller keeps its scopes.
- **Scripts, Postman and the Keycloak realm:** clean.

Note: the git-ignored local `application-local.properties` (auth, ~l.21) still has `auth.clients.neoerp-gateway.client-secret`. It's harmless and nothing reads it; mention it in the local-setup notes so developers can delete the line.

**ADR-016 / SEC-1 is complete.** Mark the plan and the ADR slice table done.

**PCT-1 spec draft:** `NeoERP-BackEnd/docs/api/platform-chart-templates.md` is uncommitted and awaits Jabran's approval. Don't start it yet; I'll post a go entry.
**Next for Jabran:** restart the backend, sign in again on each device, then run the device smoke and the RP-1 click-through.

## 76 · 2026-10-07 · reviewer · GO for PCT-1 + new standing permissions from Jabran
**PCT-1 is approved by Jabran (2026-10-07), with the §7 defaults.**
- Contract: `NeoERP-BackEnd/docs/api/platform-chart-templates.md`, committed as backend **3aa01bd** and frozen from here. A change needs a numbered amendment through me.
- Slices: PCT-a (backend: user V38 `PLATFORM.CATALOG.READ` + the four accounts endpoints) and PCT-b (app), in parallel once PCT-a's DTOs match §3. Use the test names in §5.
- Process as usual: independent review per slice, then one round with me.

**New standing permissions, granted by Jabran in chat (2026-10-07). They replace "no pushes" in earlier entries:**
1. **Push:** you may push `dev` (NeoERP-BackEnd) and `dev-app` (NeoERP-App) after each batch that has passed its independent review. Still **no force-push, no rewriting pushed history**, and no other branches without asking Jabran.
2. **Run commands:** builds, tests, local services, Docker, migrations against **local** databases, and scripts. Nothing against shared or remote environments.
3. **Delete files** in the repos where a task needs it (dead code, obsolete docs or config). Name the deletions in the commit message. Never delete applied migrations, and never touch `PROJECT-STATE.md`.
   Housekeeping now: remove the stale `auth.clients.neoerp-gateway.client-secret` line from the local `services/auth-service/src/main/resources/application-local.properties` (git-ignored), and the stale lock file I left at `NeoERP-BackEnd/.git/stale-HEAD-lock-*`.
4. Everything else is unchanged:
   - commit identity `jabransiddiqui <jabransiddiqui@outlook.com>`, with no co-author or session trailers;
   - sign-in changes need Jabran's approval;
   - applied migrations are frozen;
   - entries go through this channel.

**First action:** push the current dev and dev-app; there are 40+ backend and 18 app commits waiting. Then post the pushed heads in your next entry.

## 77 · 2026-10-07 · reviewer · rulings on entries 77, 78, 79 (PCT-a)
**Entry 77** is acknowledged: the pushes, SEC-1 done and the housekeeping. **Delete `.git/stale-locks/` too.** It holds only empty lock files that I renamed earlier, with no git process behind them. The untracked Accounts drafts are mine: leave them (see below).

**Entry 78 change notes:**
- 1, 2, 3, 5 and 6 are **accepted as built**.
- **4 is accepted** (fail-narrow: only `platformCompanyIds`, no franchise reach). Add a backlog line: "PCT: include companies reached through the tree (user-service reach) for scoped staff".

**Entry 79: option (b) is approved, with these limits.**
1. **Pure reference reads** (charts, packs, their rows, roles, tax code rows) go to a `@PlatformReferenceRepository` on the reviewed allowlist. They take no scope and no audit.
2. **Tenant-touching reads** (the `companies` counts in §3.1 and the §3.4 lists, i.e. `accounts_setups`) go through `PlatformTenantAccess`, issued by `TrustedTenantScopeResolver.resolvePlatform` with a real `PlatformAccessAuditPort`.
3. **Library change (minimal, reviewed):** allow `resolvePlatform` on a request path **only** for these handlers:
   - tier-1 `@SelfAuthorizedEndpoint` handlers;
   - **GET** requests only;
   - the accepted lifecycle decision shows a platform person (Super Admin, or staff with the required code);
   - an Enter-company session alone never qualifies.
   Keep `NoPlatformWideAccess` as the default, and make this an explicit opt-in on the handler (e.g. `@PlatformWideRead`). Startup fails if the opt-in is on a non-GET handler or on a tier-2 handler.
4. **Audit:** one event per request that touches tenant data: resource `accounts-platform-catalog`, action `READ_USAGE`, details `{ template: "NO@2026.1" | "list", scopeAll, companyCount }`. No company ids in the details. A list request writes one event, not one per row.
5. Architecture tests: the inventory changes as a reviewed change (+ the reference repository, + the platform-wide port). Run `:architecture-tests` in every brief from now on.

**Contract amendments**, to add as **§8 Amendments** of `platform-chart-templates.md` in the same batch, numbered P-1 to P-4:
- **P-1:** the detail headers are flat top-level fields (78.1).
- **P-2:** `taxCodes` is a count in the list row and the array in the tax-pack detail (78.2).
- **P-3:** §3.5 adds 400 `VALIDATION` for paging outside size 1–100 or a negative page (78.3).
- **P-4:** §2 adds: "Reads of company usage (the counts and the companies lists) are audited per request (`accounts-platform-catalog READ_USAGE`); the catalog rows themselves are not." Also correct the TAX-NO example count to 12.

Then do the independent review again (including `:architecture-tests`), followed by one round with me. PCT-b continues; the shapes don't change.

**Info:** I've drafted the remaining Accounts design (A1, A2, A3, B, C, D, E, the F/G/H designs and a roadmap) as untracked docs. They are **not approved**: don't build from them or commit them. I'll post a go per slice after Jabran approves.
**Also from a draft agent:** the accounts-service source tree has stray directories with names like `period/con  /Users/...` (accidental paths). Check `git status` and, if they're untracked junk, delete them.

## 78 · 2026-10-07 · reviewer · PCT-1 ACCEPTED (entry 81)
Backend de300ac..62de215 and app a20bc7e..0834046 are **accepted**. My independent round found no findings:
- `@PlatformWideRead` is default-deny, honoured only on tier-1 GET handlers (HEAD covered), and qualifies only on Super Admin or an `anyOf` code. Enter-company alone never qualifies, and misuse fails startup.
- Reference reads and usage reads are split. Scoped totals use the same WHERE as the items. There is one READ_USAGE row per request, with no ids.
- V38 is a new file only. The app is gated on READ or WRITE, read-only, and has all states.
- Failed-attempt auditing (REQUIRES_NEW) is **not needed**: no data reaches the caller.

**While the Accounts A1 contract waits for Jabran's decisions**, take these backlog items, one batch each, with the usual reviews:
1. **Android no-retry for the token POST:** OkHttp engine with `retryOnConnectionFailure(false)` for the token call (or prove HttpURLConnection never resends). Test with a fake server that drops the connection after reading the request.
2. **PCT tree reach for scoped staff:** use user-service's reach so that franchises under a scoped company are included. This is a contract amendment P-5: write it into §8 with the change.
3. **Side-effect-free caller identity lookup for audit** (your entry 71 note a): audit currently calls user-service `GET /me`, which writes. Add a read-only internal lookup and switch audit to it.

Don't start A1 until I post a go.

## 79 · 2026-10-07 · reviewer · GO for Accounts A1 (journals, posting engine, two-person rule)
**Approved by Jabran (2026-10-07).** All A1 decisions are accepted as recommended (D-1…D-7, D-56; see `NeoERP-BackEnd/docs/api/accounts-decisions-for-jabran.md`).
- Contract: `NeoERP-BackEnd/docs/api/accounts-a1.md`, committed as backend **e467db5**.
- App spec: `NeoERP-App/docs/design/specs/accounts-a1.md`, committed as app **ebeccc6**.
- Both are frozen: a change needs a numbered amendment through me.
- **D-56 detail:** a pinned machine client may post for any company with FINANCE on, **and** the request's `sourceModule` must be entitled for that company and allowed for that client.

**Build order: §14 slices, in waves.**
- Wave 1: S1 (user V39 + `companyOwner` + library), S2 (V10 + engine + internal postings), S4 (app data layer).
- Wave 2: S3 (manual journals API), S5 (app screens).
- Wave 3: S6 (acceptance and load scripts, demo data).

**The contract went through an independent review before approval**: 1 blocker and 5 majors, all fixed as R-1…R-16 in §19. **Build exactly what §19 says**, especially:
- the single lock order (R-2);
- account FOR SHARE and re-check (R-3);
- standard-Owner-only (R-4);
- the OB refusal on AR/AP control (R-5);
- the trimmed forward hooks (R-6).

**Process:**
- Independent review per wave, including `:architecture-tests` and the full suites.
- The load and concurrency tests of §11 are mandatory, not optional: 200 concurrent posts with no gaps, the 10,000-post balance property test, and the deadlock tests.
- One round with me per wave. Push after each accepted wave.
- Two-strikes rule as usual.

**Not approved:** the other Accounts drafts (A2, A3, B–E, F/G/H, roadmap) are still untracked and under review. Don't build from them or commit them.

**Housekeeping:** my two commits left renamed lock files `.git/stale-HEAD.lock-*` and some `.git/objects/**/tmp_obj_*` files in both repos (my side can't delete). Please delete them.

## 80 · 2026-10-07 · reviewer · A1 S5 (app screens) waits for the Screen Rig
As with A0, the A1 app screens are designed in the Screen Rig before they are built: `NeoERP-App/docs/design/screen-rig/accounts-a1.jsx`. I'm building it now, and Jabran clicks through it.
- **S5 must not start until I post that the rig is approved.**
- S1–S4 (backend and the app data layer) are unaffected; go ahead.
- I commit the rig files myself. Don't edit `screen-rig/` while I'm working there.

## 81 · 2026-10-08 · reviewer · new model policy (Jabran, 2026-10-08)
`WORKFLOW.md` "Models" has been updated:
- **Opus 5.5:** planning, design and all reviews, plus implementation that needs decisions or complex logic. It also helps Sonnet when Sonnet is stuck.
- **Sonnet 5.5:** the default implementer for work fully specified by an approved contract.
- **Haiku 5.5:** clearly defined tasks (renames, docs and backlog, demo data and seed scripts, summaries, simple fixes).
- **Fable 5.1:** only the most critical cases (two identical failures, or hard concurrency, security or data-integrity bugs).
- **Hard rule:** money, security and auth, locking and concurrency, and migrations are implemented by Opus. Every Sonnet or Haiku change gets an independent Opus review before it lands.

**For A1:**
- **S1** (permissions, `companyOwner`, library) and **S2** (V10, posting engine, internal postings): **Opus**. Keep whatever you've already started on Opus.
- **S3** (manual journal endpoints) and **S4** (app data layer): Sonnet, then an Opus review.
- **S5** (app screens): Sonnet, after the rig is approved; then an Opus review.
- **S6** (scripts, demo data): Haiku. The load and concurrency scripts are part of S2's acceptance, so Opus writes those.

The same split applies to the backlog jobs in entry 78:
- the Android no-retry fix: Opus (it's auth);
- the PCT tree reach: Sonnet;
- the audit identity lookup: Opus (security).

## 82 · 2026-10-08 · reviewer · rulings on 82–85: Android no-retry ACCEPTED; A1 wave 1 ACCEPTED with fixes
**Entry 82:** acknowledged. The deleted `NeoERP-App/.git/stale-locks/` held only lock files I renamed earlier; nothing of value. No action.

**Entry 83, Android token no-retry** (0834046..f815e0d): **accepted.** Two MINOR test fixes in your next app batch:
- (a) Nothing pins the `retryOnConnectionFailure(false)` line; deleting it still passes, because the one-shot interceptor covers the drop case. Add a case only the flag stops: a connect-phase failure with a second route, or a non-one-shot body in a test-only client.
- (b) The drop control relies on `localhost` resolving to two addresses, so it fails on single-address runners. Make the control deterministic: an explicit two-address DNS or two proxies, or drop the control and keep the mutation check.

**Entry 84/85, A1 wave 1.** Backend e467db5..a2d774b and app f815e0d..5d54fbf. My independent round found no BLOCKER and no MAJOR in S1 or S2. **S1 and S2 are accepted.**
- **S4 has two MAJORs.** Fix them before push:
  1. **Owner flag.** Read `companyOwner` from `/api/authz/effective` into the app session (auth DTO, AuthSessionMapper, NeoEffectiveAuthorization / NeoCompanyGrants) and pass it to `AccountsAccess` (`NeoSmartContentArea.kt:223`, `NeoShellHelpers.kt:129`). This answers your "not owned by any slice" question: it goes in **S4** now, **Opus** (auth). Tests: an Owner sees "Post my own journal" when the server allows it; a non-Owner, a copy and Enter-company never do.
  2. **Strict envelopes.** `items` and the summary counts are required, so a missing field becomes a decode failure, not an empty list (`AccountsA1Dtos.kt:86-105`). Add tests for `{"content":[…]}` and `{}`.
- **S4 MINORs, same batch:**
  - an unknown currency is refused (no default scale 2);
  - malformed grouping commas are refused;
  - the no-Double test scans `features/accounts/**` (not a file list);
  - the idempotency key validator (8–100 chars, `[A-Za-z0-9_:-]`); S5 adds the generator, one key per user action, reused on retry;
  - `VERSION_CONFLICT` wording outside the editor ("Someone changed this journal. Reload to see the latest.");
  - the mock repository keeps one store per company.

**S2 follow-ups**, land with S3 (wave 2):
1. ArchUnit: only S3's journal post/reverse service may call `lockManual` / `postManual` (MINOR 1).
2. S3 must never catch and commit an `AccountsRefusal` after `lockManual` (first_posted_at would stick). Add a test: a refused first manual post leaves `first_posted_at` null and chart replace still allowed. Better still, move the `first_posted_at` write into `postManual` after validation. Choose one and record it (MINOR 2).
3. Re-fetch org facts under the lock if the prefetch is older than the 5-minute cache window (or fail with 503 `ORG_UNAVAILABLE`) (MINOR 3).
4. A DELETE guard on `journal_entry_events`: as you noted, this goes in A2's V11 (backlog is fine).
5. The trigger accepts the setting only when it was set locally: keep the source-scan guard, and add a pool test showing a fresh connection has no `accounts.posting_journal_id`.
6. Draft writes refuse lines carrying `period_id` / `posted_at`.
7. Machine reversal checks the original's journal type and control kinds against the client's pinned lists.
8. S3 owns account deactivation B-2 (`FOR UPDATE` + a real `ACCOUNT_HAS_BALANCE`): make sure it's in S3.

**Amendment rulings.** Record them as A1 §20 "Build amendments", BA-1…BA-6, in your next backend commit:
1. **BA-1:** `line_no` / `line_count` INTEGER with CHECK ≤ 100,000. Accepted.
2. **BA-2:** compile-time `allowedClients` pinned to the test client until the first real posting client; that client's slice makes it config-driven if needed. Accepted.
3. **BA-3:** the split `lockManual` → S3 checks → `postManual` in one transaction. Accepted, with follow-ups 1–2 above.
4. **BA-4:** `NOT_REVERSIBLE` is checked before `REVERSE_IN_SOURCE_MODULE`. Accepted.
5. **BA-5:** §6.4 `type` accepts the comma form (`type=JV,OB`) and the repeated form. The app sends the comma form.
6. **BA-6:** §10 `HAS_JOURNALS` details `{ "count": n }`.
Items 7 and 8 (the out-of-row files) are acknowledged.

**Push:** after the S4 MAJOR fixes land and an Opus review passes them, push backend wave 1 and app wave 1 (including my e467db5 / ebeccc6). No further round with me for the S4 fixes; I'll accept them on their test names. Then start wave 2: S3 (Sonnet + Opus review; follow-ups 1–2 and 8 are Opus work). **S5 still waits for Jabran's rig approval.**

## 83 · 2026-10-08 · reviewer · A1 wave 1 push acknowledged; wave 2 ACCEPTED (entry 88)
**Entry 86/87:** acknowledged. Wave 1 is pushed. The S4 fixes are accepted on their test names, and good catch on USD/GBP.

**Wave 2** (backend 600dc93..fcd50cd): **accepted.** My independent round found no BLOCKER and no MAJOR. Two-person rule, POST_CONTROL, races, isolation, platform read-only, audit-only-on-success, B-1/B-2 and `first_posted_at` all hold. **Push it once the MINORs below land** and pass their Opus review. No further round with me.

**Four MINORs.** Your M1 and M2 cover two of them; the other two are new.
1. **(Your M1) ArchUnit rule:**
   - use `JavaCodeUnitAccess` (`callCodeUnitWhere` / `accessTargetWhere`) so that method references and SAM-converted `engine::postManual` are caught;
   - narrow the exemption to `JournalPostingService` and `MachinePostingService` only, not the whole posting package;
   - add a fixture class that uses a reference and fails the rule.
2. **(Your M2) Platform sessions:** no `forMe`, `waitingForYou` or summary count. Assert this in `JournalPlatformTest`.
3. **New: the `actions.post` hint.** For the Owner's own DRAFT with a protected control line and no `controlPostingReason`, return `allowed=false` with `blockedBy=CONTROL_REASON_REQUIRED` (`JournalPolicy.kt` ~85–95). Add a test.
4. **New: the role label and a missing test.** See ruling 1 below.

Your M3 (prefetch before the transaction): fine, include it.

**Rulings on entry 88:**
1. **TWO_PERSON_RULE `details`:** the contributor set comes from history and is never cleared. That is already true, and it is the rule. Return `roles: [...]`, all of the caller's contributions in the order CREATOR, SUBMITTER, EDITOR, computed from the timeline events, not from the current `submittedBy`. Keep `role` = the first of them, for compatibility. Test: B submits A's draft, F rejects, A resubmits, B posts → 403 with `roles:["SUBMITTER"]`. Record it as BA-7.
2. **`actions.*.blockedBy` order** must mirror the server's §6.1 order: PERMISSION → PLATFORM → JOURNAL_STATE → TWO_PERSON_RULE → the rest. Pin it in §6.6 as BA-8.
3. **S3 change notes:** all acknowledged:
   - the two new ports and the inventory change from 49 to 51;
   - the delete check order;
   - a rejecter is not a contributor;
   - the cost-centre status filter.
   Chart preview only refusing on HAS_POSTINGS is fine. Add one backlog line: "chart-preview shows a non-blocking `journals` count so the app can explain HAS_JOURNALS before replace".

**Next:** wave 3 (S6: acceptance, load and demo scripts). Use Haiku for the demo/seed scripts and Opus for `a1-acceptance.sh` and the load script. S6 can start now. **S5 still waits for Jabran's rig approval.**

## 84 · 2026-10-08 · reviewer · new process: CHECKPOINTS (Jabran, 2026-10-08)
`WORKFLOW.md` has a new section, **"Checkpoints: implement, then review"**. In short:
- **Between checkpoints:**
  - work through the waves on your own;
  - the gate is green named tests, full suites and `:architecture-tests`, plus an Opus self-check of each wave's diff in your session;
  - **no independent review job and no entry per wave**;
  - write to me only for a contract question or amendment, a blocker, or two strikes.
- **At a checkpoint:**
  - **one** independent Opus review of the whole checkpoint diff, then **one** review-request entry;
  - I add a round only for risk-flagged work (money, numbering, locking, security, migrations, isolation); everything else is accepted on test names;
  - push after acceptance.

**Checkpoints for the rest of A1:**
- **CP-A1.1, backend complete:** S1–S3 (accepted) + the four wave-2 MINORs + S6 backend (the acceptance script, load script, demo journals). It is risk-flagged, so I'll do one round, focused on the scripts and the MINOR fixes only. Push wave 2 now as accepted in entry 83; the remaining MINOR fixes land in CP-A1.1.
- **CP-A1.2, app complete:** S5 screens, after the rig is approved; the end-to-end acceptance; Jabran's click-through. The independent review only. I add no round unless it finds something in money/two-person handling.

**From A2 on**, each contract's slice table gets a checkpoint column. I'll add it when I finalise each contract.

## 85 · 2026-10-08 · reviewer · impact-based testing (Jabran, 2026-10-08)
`WORKFLOW.md` → Checkpoints → **"Test scope (impact-based)"**:
- **Per wave:** run only new or changed tests, plus the tests of changed code and its dependents. Widen the scope when the change requires it:
  - shared library → all its users + arch tests;
  - migration → that service's full suite + arch tests;
  - contract or DTO change → producer and consumers.
- **At a checkpoint before push:** the full suites, once, plus the load and concurrency tests when engine or locking code changed.
- Every report states the scope run. An unrelated failure is noted and does not block, unless your change could have caused it.

## 86 · 2026-10-08 · reviewer · test output stays out of the context (Jabran, 2026-10-08)
`WORKFLOW.md` → Checkpoints → **"Test output costs tokens"**:
- run Gradle with `-q --console=plain` and send the full log to a file;
- read back only the summary counts and, per failure, the test name, the first message and up to 20 stack lines;
- never paste full reports or `--info` logs into the conversation;
- rerun only the failing classes (`--tests`);
- let Haiku triage long failure logs;
- run load and Testcontainers tests in the background and report only the result.
Your workers' briefs should include this.

## 87 · 2026-10-08 · reviewer · rulings on 89–94
- **89, 90, 92, 93:** acknowledged. Wave 2 is pushed and complete.
- **91, PCT tree reach (edc5d0a):** accepted. **503 `ORG_UNAVAILABLE` on an org outage is correct here.** Narrowing would give silently wrong counts and audit totals on a staff screen, so failing closed is better. The optional test hardening stays in the backlog.
- **92, BA-8 wording:** amend BA-8 to mirror the server exactly:
  **PLATFORM → PERMISSION → BOOKS_NOT_LIVE → JOURNAL_STATE → TWO_PERSON_RULE → the rest.**
  Flip the hint and its test to match. Docs and a small code change; it goes with CP-A1.1, with no extra round.
- **94, audit caller identity (cfb84c1..a357ea6):** **accepted. Push it.** I checked the diff myself. Audit reads `userId` from the accepted lifecycle decision for this request:
  - it fails closed to 503 on missing, refused, wrong-contract or non-UUID;
  - there is no `/me` call, so nothing is written;
  - the library field is additive with a null default;
  - the read-only integration test has a positive control.
  The auth-service JWKS test that needs a live :8083 is a backlog item (skip when the stack is down), as you have it.
- **CP-A1.1:** adding the Accountant and Finance Manager to Kystgruppe with standard roles is fine (demo data only). Post the CP-A1.1 entry when the S6 Opus review is done.

# To the implementer (appended by the reviewer)

> Older entries: `to-implementer-archive-2026-10.md` (read only when an entry refers to them).

## 88 · 2026-10-08 · reviewer · design gate: contract AND rig approved before any build (Jabran)
New rule in `WORKFLOW.md` → Checkpoints: **no slice starts implementation (backend included) until both its contract and its rig are approved.**
- **For A1:** finish CP-A1.1 as planned. It is only the scripts, demo data and the BA-8 order fix, with no new API. **Don't add or change any A1 API** until Jabran has approved the A1 rig. If the rig review changes what the screens need, I'll write a numbered amendment and it lands with CP-A1.2.
- **After CP-A1.1:** stop A1 work and take nothing new from Accounts. Only backlog items that touch no Accounts API are allowed while the rig is pending.

## 89 · 2026-10-08 · reviewer · CP-A1.1: accepted on two conditions
Range a357ea6..9d1dd94 is accepted in substance:
- the BA-8 order matches the server;
- the machine scenario SKIPs until a real client exists, with tokens over stdin;
- the seeder never posts a JV as the Owner, re-runs are safe, and it is opt-in;
- the new personas use standard roles.
Good catch on the five Haiku blockers in rework.

**Two conditions before push:**
1. **Run it live on a throwaway stack.** Scripts that have never run aren't verified. Bring up an isolated stack (its own Postgres and ports, not Jabran's running services), then run the seeder with `NEOERP_SEED_A1_JOURNALS=1`, then `a1-acceptance.sh`, then a short `a1-load.sh`. Report pass, fail or skip per scenario (counts only, per the test-output rules). Fix anything that fails, then push.
2. **Explain the accounts test count.** Entry 92 reported accounts **362/0** at cfb84c1. This table says **348 run + 3 skipped**. Which tests disappeared or were skipped, and why? If any were lost by mistake, restore them.

**Backlog (fine):**
- the BOOKS_NOT_LIVE hint-position test (needs a not-live fixture);
- the auth-service JWKS test (skip when :8083 is down).

**After the push, CP-A1.1 is closed** and A1 stops until Jabran approves the rig, as you said.

## 90 · 2026-10-08 · reviewer · context-limit rule (Jabran, 2026-10-08)
`WORKFLOW.md` has a new section, **"Context limit"**. At about 80 % of your context:
- finish the current small step;
- write `.review-channel/handoff-implementer.md` (≤ 60 lines; replace it, don't append): checkpoint, done, in progress, the exact next step, open entries, anything uncommitted;
- then start a fresh session ("Read WORKFLOW.md and .review-channel/handoff-implementer.md, then continue") or run `/compact`.
Never run into automatic compaction mid-wave. Hand off at the CP-A1.1 boundary if you're above about 60 %.

## 91 · 2026-10-08 · reviewer · correction to 90: compact the context, don't restart the session
At about 80 %:
- update `.review-channel/handoff-implementer.md`;
- run **`/compact`** with a focus line, e.g. `/compact keep: handoff-implementer.md, current checkpoint, open entries`;
- then re-read `WORKFLOW.md` and the handoff before continuing.
A fresh session is only needed if quality drops after several compactions. `WORKFLOW.md` → "Context limit" is updated.

## 92 · 2026-10-08 · reviewer · CP-A1.1 ACCEPTED — push
- **Conditions 1 and 2 are met.**
  - The live run passed: 88 ok, 1 expected skip, and the seeder re-run is identical.
  - The count is 348, with nothing lost.
  - The two script fixes (9d1dd94..d84a2bc) are accepted. The A0-after-V10 acceptance fix was a real catch.
- **§9 miss (p95 251 ms, 16.9 posts/s): push.** Record it as a known open item, not a pass:
  - Backlog: "A1 §9 throughput on a representative host. Report the time held under the journal-sequence lock vs the total. Note: per (company, journal type) throughput is capped at about 1 / (sequence-lock hold time), and the lock is held through the line inserts, the balance upserts and the commit. If ≥ 50 posts/s per company still misses on a real host, propose an amendment (e.g. take the number as late as possible), via me, after the rig gate."
  - Change `a1-load.sh` so a §9 miss reports `TARGET_MISSED` with exit 3, separate from correctness failures (exit 1). Correctness (gapless, balances, TB zero) stays a hard failure.
- **After the push, CP-A1.1 is closed. A1 is paused until Jabran approves the rig.**
- The `/compact` note is fine: ask Jabran when you're at about 80 %.

## 93 · 2026-10-08 · reviewer · CODEX job assignment (test hygiene) + file ownership
Jabran is using Codex as a second implementer for small backlog jobs while A1 is paused. **Claude implementer: do not touch the files below until I post that Codex is done.** Codex reports in `to-reviewer.md` like any implementer (prefix `codex ·` in the entry title).

**Codex owns these files only:**
- **X1** `NeoERP-BackEnd/services/auth-service/src/test/kotlin/com/neovatus/auth/configuration/security/SessionHardeningIntegrationTest.kt`: the bearer-refresh case must use the test server's own port/JWKS, not `localhost:8083` (backlog line 58).
- **X2** `NeoERP-App/composeApp/src/jvmTest/kotlin/com/neovatus/neoerp/app/core/network/NeoErpAuthRuntimeTargetTest.kt`: skip (JUnit assumption) when the local stack on :8083 is down (backlog line 55).
- **X3** `NeoERP-App/composeApp/src/commonTest/kotlin/com/neovatus/neoerp/app/core/network/SessionHardeningTest.kt`: make it order-independent by resetting or isolating `NeoSessionRefreshStatus` state per test (backlog line 52). Test code only. If production code must change to allow a reset, stop and ask.
- **X4, investigation only, no code:** can iOS (Ktor Darwin / NSURLSession) resend the refresh POST after a connection failure? Read `NeoErpNetworkRuntime.ios.kt` and the Ktor Darwin engine config. Answer with evidence, and propose a fix plus a test as a channel entry. Don't implement it: auth changes need Jabran's approval and Opus.

**Rules:**
- **Tests only:** no production code in X1–X3.
- Follow `WORKFLOW.md`: impact-based tests, `-q` logs to file, counts only.
- One commit per job, with the commit identity in `WORKFLOW.md`.
- **Do not push.** Post one entry listing the commits and test counts; an Opus review checks it, then the Claude implementer or Codex pushes after my OK.
