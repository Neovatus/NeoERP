# Independent review of Claude security fixes — round 3

Date: 2026-11-01. Reviewer: Codex, separate from the implementation context.

## Verdicts

| Commit group | Requirement | Verdict | Reason |
| --- | --- | --- | --- |
| Backend `5c93fb5`, `57ec7ad`, `5ec33c3` | Tenant-isolation triage NEW-01 | **FIX-FIRST** | Direct pending-invite profile access is closed, but hidden private values remain inferable through PATCH, and the account-ID redaction has an alternate-route bypass. |
| App `9f03ae41`, `ac651ff1` | Bank-safety triage BS-01 / M-4; proof download | **FIX-FIRST** | Warnings and proof metadata reach the happy-path screen, but approval still works when their read has not succeeded. M-4 masking and the proof-download protections inspected have no separate finding. |

`5ec33c3`'s narrow correction to email/sign-in authorization is **SHIP** on static inspection: every accepted membership, including inactive and location-only memberships, counts; pending invitations do not. This does not clear the other backend findings.

## Findings

### R3-01 — High — Approval proceeds without loading fraud warnings

**Introduced by:** app `9f03ae41`; remains in `ac651ff1`.

**Locations** (app paths below start at `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/`):

- `presentation/payables/SupplierBank.kt:127`: `loadPendingDetail()` fetches asynchronously and silently drops a failed result at line 133.
- `presentation/payables/SupplierBank.kt:65`: absent detail becomes an empty signal list.
- `presentation/payables/SupplierBank.kt:291`: `canApprove` checks busy/confirmation/reason, without requiring successful detail loading.
- `presentation/payables/SuppliersScreen.kt:448` and `:495`: both approval buttons remain usable under that condition.

**Failure scenario:** A second person opens a supplier whose pending change would return `SAME_ACCOUNT_ELSEWHERE` or `HOLDER_NAME_MISMATCH`. Delay the single-request GET, or return a timeout/503, while supplier detail and approval POST remain available. Open Approve, tick confirmation and submit. The dialog has no warning, no loading/error indication for those warnings, and sends the approval. No reveal is required. Backend `SupplierBankChangeService.kt:236` accepts a properly authorized, confirmed second-person approval without requiring that the warning read succeeded; signals are advisory, not a server rejection. Thus the comment that the server will refuse does not preserve BS-01. A slow response alone creates the same window.

**Fix:** Represent loading, success and failure for the current request's safety detail. Show an inline failure with retry. Require a successful read for that request before enabling and executing approval; enforce this in the viewmodel as well as the button. An empty successfully loaded signal list must be distinguishable from an unread one. Keep absent or unscanned evidence optional, as contracted. Add deferred-response and failed-read tests asserting zero approval calls until the read succeeds, then successful approval with the returned warnings in state. Existing tests exercise successful loading only.

### R3-02 — Medium — Hidden profile fields have a PATCH equality oracle

**Introduced by:** backend `5c93fb5`; remains in `5ec33c3`.

**Location:** `NeoERP-BackEnd/services/user-service/src/main/kotlin/com/neovatus/user/application/service/user/admin/UserAdminService.kt:149`, especially `if (changed.isEmpty()) return` at line 151. Related: `mapper/UserAdminAppMapper.kt:83` and `:84` apply supplied birth date/gender; `SharedIdentityWritePolicy.kt:69` hides private details from an inactive-company reader.

**Failure scenario:** The person has an accepted but deactivated membership in A and an active membership in B. A's admin holds `IAM.USER.READ`/`IAM.USER.UPDATE` only at A. GET is allowed but correctly hides birth date, gender and the other private fields. PATCH to `/api/admin/users/{id}?orgId=A` with only `{"gender":"FEMALE"}` returns **200 if it equals the stored value**, and **403 if it differs**, because only actual changes reach the policy. Trying the four valid gender values recovers the hidden gender. The same status distinction tests a suspected national ID or enumerates birth dates. The response itself can stay redacted; the status leaks the answer. The route permits accepted inactive memberships, and the no-op success path saves and returns normally.

**Fix:** When the caller cannot read private details and cannot change person-owned details, reject any explicit submission of protected fields before comparing against their stored values. If unchanged-value submissions must remain supported for visible profiles, limit that exception to callers allowed to read those values. Test an inactive-A/active-B person with both matching and nonmatching guesses: responses must be indistinguishable and disclose no stored value. Current tests cover masked GET and unchanged PATCH separately, not this combination.

### R3-03 — Medium — Membership access read bypasses pending-invite account-ID redaction

**Incomplete fix in:** backend `57ec7ad`; remains in `5ec33c3`. This is an identity-disclosure gap, not a demonstrated restoration of the original private-profile GET/PATCH exploit.

**Location:** `NeoERP-BackEnd/services/user-service/src/main/kotlin/com/neovatus/user/application/service/rbac/membership/MembershipService.kt:243`: redaction is applied only to list results. Alternate response: sibling `MembershipAccessService.kt:151` uses the raw mapper; `mapper/MembershipAppMapper.kt:10` copies the real user ID.

**Failure scenario:** A's admin invites B's person without acceptance. GET `/api/rbac/memberships?orgId=A` returns the pending row's membership ID and `userId: ""`, as intended. Use that membership ID in GET `/api/rbac/memberships/{id}/access`. `MembershipAccessController.kt:32` authorizes through `canReadMembershipAt`; `UserAdminAuthorization.kt:475` delegates to `canReadMembership`, whose company permission check at line 221 does not exclude pending memberships. The access response serializes the raw membership's actual `userId` via `MembershipAccessHttpMapper.kt:13` and `MembershipResponseMapper.kt:11`. No guessing of the victim's user ID is needed. This contradicts the new documented guarantee that an unaccepted invitation does not identify the account behind it.

**Fix:** Reject pending memberships on the access-detail route, or use one shared pending-membership response redaction on every externally readable membership response. Retain invitation editing through the invitation route. Extend `SharedProfileAccessHttpTest` to list a real pending membership, follow its ID to `/access`, and assert denial or redaction, then confirm accepted memberships still work. The current test checks the list body only.

## Verified scope and limits

Review inputs: `docs/agents/codex-tenant-isolation/triage.md` NEW-01 and `docs/agents/codex-bank-safety-review/triage.md` BS-01/M-4. Source and test review used Git object contents at backend `5ec33c3cf6e1a28ab828ac55a5d1510fa7568003` and app `ac651ff157b91789e5dc3ab4afb0f7835299a9f7`, plus the named commits' diffs and relevant surrounding authorization, persistence, mapper and download code. Findings refer to those revisions, not later HEAD line numbers.

Successful controls traced: pending-invite exclusion reaches the membership database predicates; direct profile/person-page access rejects pending-only affiliation; writes of changed personal fields require the shared policy; inactive-company GET masks private details; email and sign-in policies include accepted inactive/location memberships. The documented active-only company set for personal-profile edits was treated as the implemented contract, not silently changed to the accepted-membership rule for sign-in.

App checks covered DTO/domain mapping, known and unknown warning wording, evidence scan states, DI and save-dialog wiring, company/request-scoped authenticated download, PDF/JPEG/PNG allowlisting, the 12 MiB streaming cap, rebuilt filenames, no redirect following, and temporary-file deletion through the downloader and live file sink. `SupplierBankDetails.toString()` masks route identifiers. No additional concrete defect was established in those inspected paths. Other bank-triage findings and unrelated list-tool changes are outside this review's verdict.

**No Gradle, builds, automated tests, services, HTTP requests or browser/device checks were run.** Reproductions above are deterministic source traces, not claimed executed tests. Added tests were inspected, not accepted as passing evidence. No PROJECT-STATE file was read. The requested checkout has no `NeoERP-Design/README.md`; no replacement design was invented.

## Task checkpoint and delivery scope

Owner: Codex independent reviewer. Stage: independent review complete; implementation fixes remain with their existing owners. User authorization: read-only implementation review, exactly this report as the sole written artifact, committed alone on workspace `master` with the specified message; no push. No implementation, migration, login or ownership changes are authorized here.

Pickup: workspace `master` at `582b26f`; backend `dev` at `b113f021f1c17ef174597e76a9cec10eb97bd94f`; app `dev-app` at `20bc7ed92f9bf0de101283ff86d7bbbb2671575d`. Both source checkouts were clean. Existing workspace changes were confined to unrelated readiness/design/inbox documents and untracked handoff/task directories; they are excluded from this report commit. Per the explicit one-file constraint, no plan, handoff or shared-state file was updated.

Next: implementation owners address R3-01/R3-02 and close the R3-03 response gap, run the named negative cases and affected suites in an authorized build context, then request focused re-review. SHIP here denotes static review acceptance only; it is not deployment approval.
