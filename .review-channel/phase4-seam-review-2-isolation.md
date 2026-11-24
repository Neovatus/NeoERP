# Phase 4 seam review 2 of 2: company isolation and platform

Date: 2026-11-24. Reviewer 2 (isolation and platform). Read only; no Gradle, tests, stack or simulator run.
Heads read: BackEnd `7ee082b`, App `82b815b0` (`NeoERP-worktrees/seam-review-BackEnd`, `seam-review-App`).
Paths below are relative to those two worktrees. `U` = `services/user-service/src/main/kotlin/com/neovatus/user`,
`APP` = `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app`.

## Result

No cross-company read or write found, and no auth bypass. 0 HIGH, 5 MEDIUM, 5 LOW.
M4, M5 and L5 come from the lead's extra lens (BE-nullable field, App non-null field, strict Json reader).

The three MEDIUM findings are all places where one lane's change meets code that the lane did not look at:
the email index meets the sign-in sync, the stricter reach lookup meets the bootstrap call, and the outbox claim fix
stops short of two outboxes that have no claim at all.

| # | Severity | Confidence | Short |
|---|---|---|---|
| M1 | MEDIUM | code path CONFIRMED, trigger PLAUSIBLE | V50 email index can lock a person out at sign-in (bootstrap and `/me` answer 409) |
| M2 | MEDIUM | call chain CONFIRMED, outage PLAUSIBLE | Every org-service request by a company user runs a full app bootstrap in user-service, which writes and calls org-service back |
| M3 | MEDIUM | CONFIRMED | Audit events can be recorded twice: user and auth outboxes have no claim, and audit-service has no duplicate check |
| M4 | MEDIUM | CONFIRMED by reading both sides (not run) | Entitlement change history is unreadable for company users: BE sends `actorId: null`, App field is non-null |
| M5 | MEDIUM | mismatch CONFIRMED, trigger PLAUSIBLE | One person with no email makes a company's People list and that person's page unreadable |
| L5 | LOW | mismatch CONFIRMED, trigger PLAUSIBLE | An invitation whose employee code is null makes the Invitations list unreadable |
| L1 | LOW | CONFIRMED | App has no words for `PERSON_NOT_AVAILABLE`; user-service's 503 reads as "sign-in service" |
| L2 | LOW | PLAUSIBLE | Company switch: the company-wide context can come back as a branch context |
| L3 | LOW | CONFIRMED (code), rare | Company switch fallback keeps the old company's permissions and feature switches under the new company's name |
| L4 | LOW | CONFIRMED | People lookup compares the invitation email without lower-casing |

---

## M1 (MEDIUM): the V50 email index can lock a person out at sign-in

**Seam:** EMAIL-UNIQ-BE (V50) x the sign-in sync, which the lane did not list as a write path.

- `services/user-service/src/main/resources/db/migration/V50__users_email_unique.sql` (unique on `lower(btrim(email))`).
- `U/application/service/user/me/mapper/*.kt:49`: `email = email ?: existing.email`. Every sign-in copies the
  token's email onto the person's row.
- `U/application/service/user/me/UserMeService.kt:38` (`saveOwn`) to
  `U/infrastructure/persistence/adapter/user/UserRepositoryAdapter.kt:239` (`emailGuard`), which throws
  `EmailTakenException` (409, no `code`).
- `U/application/service/app/bootstrap/AppBootstrapService.kt:52`: bootstrap starts with `getOrCreateMe`.
- App: `APP/features/auth/data/service/AuthServiceImpl.kt:86` turns any non-404 status into
  "The server answered HTTP 409 (GetAppBootstrap)", shown as a generic start failure with Try again.
- org-service: `services/org-service/.../configuration/security/OrgIamAccessClient.kt:42-51` reads the reach from the
  same bootstrap call, so a 409 there becomes 503 `AUTHZ_UNAVAILABLE` on every org page.

**Failure scenario.** Person Y's email was changed at the identity provider (account console, or by support) from
`accounts@acme.no` to something else, and Y has not signed in since, so `iam.users` still holds the old address for Y.
Person X is then given `accounts@acme.no` at the identity provider, which accepts it because it is free there. At X's
next sign-in the token carries the new email, the sync tries to write it, V50 refuses, and X gets 409 on bootstrap and
on `/api/users/me` at every attempt. X cannot enter the app until Y signs in or an operator edits the row. If Y has
left the company, that never happens by itself. Before V50 this wrote a silent duplicate; now it is a lock-out with no
message that names the cause.

The email-uniq brief, builder report and five reviews name three write paths (admin email change, staff add, invite).
None mentions `getOrCreateMe`, `saveOwn` or bootstrap (grep over `docs/agents/email-uniq/*.md`: no hit).

**Related, same lane:** V50 stops Flyway when duplicates exist, and user-service then does not start. The duplicate
count was run on the local dev database only (0). The sign-in sync above could create duplicates before V50, so any
longer-lived environment needs the same count before it takes this migration.

**Suggested direction (lead decides):** in the sign-in sync, keep the stored email when the token's email is taken by
another account and log it, instead of failing the sign-in; add the duplicate count as a go-live row.

---

## M2 (MEDIUM): every org-service request by a company user runs a full bootstrap

**Seam:** R29b-1 (org reach, made strict) x user-service bootstrap (R29b-2 / 3U).

- `services/org-service/.../configuration/security/OrgScopeResolver.kt:121` and `:216`: the reach of every list and
  every by-id or company-path request, for anyone who is not staff with every company in scope, comes from
  `iam.activeMembershipOrgIds(...)`.
- `OrgIamAccessClient.kt:53-66`: that is `GET /api/app/bootstrap` with the person's token; only `memberships` is used.
  The `RestClient` has no connect or read timeout (`:38`).
- `AppBootstrapService.bootstrap` does much more than list memberships:
  - `getOrCreateMe` (`:52`): takes the per-person sign-in advisory lock, writes the person's row (`last_login_at`,
    email, name) and accepts the person's pending invitations (`OnboardingFirstLoginService.acceptForUser`);
  - computes effective permissions once per ACTIVE membership (`:72-80`);
  - calls org-service back about five times (`ownCompanyFacts` twice, branch names, modules, entitlements), each with
    a fresh machine token from auth-service (`U/configuration/org/OrgModuleAccessClient.kt:423`, no token cache).
- R29b-1 removed the comment that said this was temporary ("Still the bootstrap call for now; a narrower membership
  check is recorded for the lead") and at the same time made every failure other than 403 a 503.

**What is confirmed.** One org-service request by a company user costs one user-service write transaction, about five
org-service internal calls and about five token requests, before the permission check (`/api/authz/effective`) runs.
A read in org-service causes writes in user-service. audit-service removed exactly this pattern earlier (reviewer
entry 78.3, see `AuditCallerIdentity.kt` header); org-service still has it and now depends on it for every request.

**Failure scenario (plausible).** A company admin opens the Company page; the App sends several org requests at once.
Each one runs a bootstrap, and the bootstraps of one person queue on the sign-in lock. Each bootstrap needs org-service
threads again for its five calls back. When org-service is slow or its request threads are busy, those calls time out
after 3 s in user-service, bootstrap gets slower, and the outer org requests (no timeout) hold their threads longer. Any
bootstrap error other than 403 (a 409 from M1, a 429, a 5xx) now shows as 503 `AUTHZ_UNAVAILABLE` on every org page for
that person.

No cross-company data is involved; the reach is still computed correctly when the call succeeds.

**Suggested direction:** a read-only "own active company ids" endpoint in user-service (the data is
`OwnMembershipReadPort.activeCompanyIds`), with timeouts on the org client.

---

## M3 (MEDIUM): audit events can be recorded twice

By the brief's wording a duplicated event is HIGH. I rate it MEDIUM because only an audit row is duplicated; no
business state changes twice. The lead may want to re-rate it.

**Seam:** OUTBOX-CLAIM-BE (fixed seven claim queries) x the outboxes that have no claim, x audit-service's consumer.

- Consumer: `services/audit-service/.../application/service/AuditService.kt:33-43`. `record` gives every request a new
  `UUID.randomUUID()`; `AuditEventRequest` (`delivery/http/dto/AuditDtos.kt:6`) carries no event id; no unique key or
  `ON CONFLICT` anywhere in audit-service main code or migrations.
- user-service: `U/application/service/outbox/AuditEventOutboxDispatcher.kt:24-39` with
  `U/infrastructure/persistence/adapter/outbox/AuditEventOutboxJdbcRepository.kt:47-63`. `findPending` is a plain
  `SELECT ... LIMIT`: no lock, no lease, no claim. `markPublished` is unconditional.
- auth-service: `services/auth-service/.../configuration/audit/AuditEventOutbox.kt:95-105` and `:158-176`: the same shape.
- org-service is safe between instances (`AuditEventOutboxJpaRepository.findPendingDue` takes a pessimistic write
  lock inside the dispatcher's transaction). accounts-service has a leased claim.
- The OUTBOX-CLAIM report says "No other service (org, payroll, audit, auth, api-gateway) has SKIP LOCKED in main
  code" and stops there. For user and auth that is because they do not claim at all.

**Failure scenarios.**
1. Two instances of user-service (or auth-service): both read the same pending rows and both post them. Every audit
   event from that service is stored twice, including the `platform-access` / `PLATFORM_WRITE` and
   `PLATFORM_WIDE_READ` rows that R29b added as the record of staff access.
2. One instance, any producer: audit-service commits the event but the answer is lost or passes the producer's read
   timeout (3 s in user-service, 5 s in accounts). The producer marks the row failed and sends it again; a second row
   is stored. This applies to accounts and org as well.

**Suggested direction:** send the outbox row id as an event id and make audit-service's insert idempotent on
(producer, event id); give the user and auth outboxes the same leased claim as accounts.

---

## Nullability lens (lead's extra request)

The App's readers in this scope are `Json { ignoreUnknownKeys = true }` (People, Platform, Organization, Auth) or
`{ ignoreUnknownKeys = true; explicitNulls = true }` (Entitlements). None sets `coerceInputValues`, so a JSON `null`
for a non-nullable field fails the whole decode, also when the field has a default. Neither user-service nor
org-service sets a global "omit nulls" (only single fields carry `@JsonInclude(NON_NULL)`), so nulls are sent.

### M4 (MEDIUM, CONFIRMED by reading both sides, not run): entitlement history unreadable for company users

- BE: `services/org-service/.../delivery/http/entitlement/dto/EntitlementDtos.kt:143` `actorId: String?` ("Null for
  tenant readers"); `.../entitlement/mapper/EntitlementHttpMapper.kt:142` `actorId = if (showActor) actorId else null`;
  `EntitlementController.kt:127` sets `showActor` only for staff.
- App: `APP/features/entitlement/data/remote/dto/EntitlementDtos.kt:100` `val actorId: String = ""`, decoded as a
  whole list in `APP/features/entitlement/data/service/EntitlementServiceImpl.kt:36`.
- Scenario: a company owner opens Company > Modules and its change history after any module or feature was switched.
  Every row carries `"actorId": null`, the list fails to decode, and the history card shows an error. Staff see it
  correctly, so a test as Super Admin passes. Fix on the App side: `actorId: String? = null`.

### M5 (MEDIUM, mismatch CONFIRMED, trigger PLAUSIBLE): a person without an email breaks the People list

- BE: `U/delivery/http/rbac/people/dto/PeopleDtos.kt:17` (`PersonRowResponse.email: String?`) and `:93`
  (`PersonDetailResponse.email: String?`); the mappers pass the stored value through.
- App: `APP/features/people/data/remote/dto/PeopleAccessDtos.kt:160` (`PaPersonRowDto.email: String = ""`) and `:373`
  (`PaPersonDto.email: String = ""`). The Platform DTOs for the same people are nullable and fine.
- A null email is allowed by design (V50 leaves NULL and blank out) and reachable: `PATCH /api/admin/users/{id}` with
  `email: ""` stores null (`UserAdminAppMapper.kt:59-63`, the open escaped-defect row of 2026-11-22), and older rows may
  have none.
- Scenario: one member of a company has no email. The whole People page of that company fails to load for every admin
  (one bad row fails the page), and that person's detail page too. Fix on the App side: nullable email.

### L5 (LOW, mismatch CONFIRMED, trigger PLAUSIBLE): invitation with a null employee code

- BE: `U/delivery/http/onboarding/dto/OnboardingDtos.kt:96-99` (`InviteEmployeeResponse.code: String?`); the code is
  null when user-service holds no link row for the employee yet or the read fails
  (`OnboardingService.kt:632-636`, `runCatching { ... }.getOrNull()`).
- App: `PeopleAccessDtos.kt:56-58` (`PaEmployeeRefDto.code: String = ""`), used by `PaInviteDto.employee` (`:256`).
- Scenario: a "Give app access" invitation for an employee whose hr push has not reached user-service: the
  Invitations list of the company fails to decode until the push arrives.

Checked and clean under this lens: bootstrap (`AppBootstrapDtos.kt` x `AuthSessionDtos.kt`, including entitlements,
company access and platform access), `/api/users/me`, `/api/authz/effective`, people lookup, platform staff, platform
people and Super Admin DTOs, org company, branch and warehouse responses. The App declares no serialized enum in
these DTOs (statuses, sources and modes are strings), so an unknown enum value cannot fail a decode here. Not compared
field by field: roles, agreement, org requests, legal profile, usage and audit DTOs.

## L1 (LOW, CONFIRMED): App has no words for two user-service answers that R29b added

- BE: `U/application/service/rbac/role/RoleRuleException.kt:38,112`: 409 `PERSON_NOT_AVAILABLE`, "This person can't be
  added here; invite them by email" (R29b-3U, marked "visible" in `docs/api/user-iam.md`).
- App: `APP/features/people/domain/PeopleAccessModels.kt:901-925` (`PeopleRefusal.of`) has no case for it, and
  `APP/features/iam/IamErrors.kt:49-82` has none either, so the person reads `iam_error_conflict`: "This can't be done
  as things stand. Reload and try again." Reloading does not help; the hint "invite them by email" is lost. Real case:
  a company admin invites an email that belongs to Neovatus staff.
- Same file, `byStatus(503)`: user-service's new 503 `AUTHZ_UNAVAILABLE` (org-service down for the franchise reach, or
  the `PLATFORM_WRITE` event could not be written) is shown as `iam_error_identity_provider_unavailable`: "The sign-in
  service isn't answering right now...". The advice (nothing changed, try again) is right; the named cause is wrong.
- The 409 "Another account already uses <email>" (no `code`) also reads as the generic conflict text. That is
  acceptable today: the App has no admin email-change screen, and in the invite and staff-add races a retry works.

## L2 (LOW, PLAUSIBLE): the company-wide context can come back as a branch context

- App: `APP/features/context/data/repository/ContextRepositoryImpl.kt:26-29` sends no `branchId` for the company-wide
  context, and takes the selected context from the server's answer (`AuthSessionMapper.kt:47,84`).
- BE: `AppBootstrapService.kt:132-137` picks the first ACTIVE membership in that company when `branchId` is absent;
  `OwnMembershipJdbcAdapter.kt:39` orders memberships by creation time.
- Scenario: a person was first added at branch B1 and later given company-wide access. Choosing the company (all
  branches) in the switcher returns B1's membership, so the App lands in branch B1 again and cannot reach the
  company-wide context. Not verified on a running stack, and the selection rule itself is older than Phase 4; the
  ordering now comes from R29b-2's `listOwn`. A fix would be: with no `branchId`, prefer the membership whose
  `branchId` is null.

## L3 (LOW, CONFIRMED in code, rare): switch fallback keeps the old company's rights

- `APP/features/context/data/repository/ContextRepositoryImpl.kt:38-41`: when bootstrap answers 404 and
  `/api/authz/effective` answers 404 too, the session is returned as `session.copy(selectedContext = selectedContext)`:
  the new company's name with the old company's permissions, entitlements and enabled modules. The branch just below
  it (`refreshForContext`) clears the entitlements correctly; this one does not.
- Only reachable when both calls answer 404 (a missing route or an older backend). Services still refuse on their own
  side, so nothing crosses companies; the person would see menus and buttons that then fail.

## L4 (LOW, CONFIRMED): people lookup does not lower-case the email for the invitation search

- `U/application/service/rbac/people/PeopleQueryService.kt:216-228`: `normalized = email.trim()` is passed to
  `onboardingInviteRepository.findByFilter(scope, normalized, ...)`, while invitations store the email through
  `normalizeEmail` (`OnboardingService.kt:211`). The account checks next to it use `lower(btrim())`.
- Scenario: lookup of `Bob@Acme.no` reports no pending invitation; the invite that follows is then refused with
  `ALREADY_INVITED`, which the App handles. Wrong hint only.

---

## Notes that are not findings

- **Database row-level security is not on in Phase 4.** `neoerp.tenant.binder.enabled` is set in no properties file
  and no migration enables RLS (`ROW LEVEL SECURITY` appears only in the shared role script). ISO-R1 delivered the
  binder, the role check and the Flyway history guard as groundwork. Company isolation in Phase 4 is the scoped
  repository layer (R29b) alone. The hr and payroll role checks are `WARN` under `local`/`test` and `FAIL` elsewhere,
  while those services still connect as the container superuser, so they need the runtime role before any non-local
  start.
- org-service's audit dispatcher (`AuditOutboxDispatcher.dispatchDue`) holds a database transaction and row locks
  while it calls audit-service, and its HTTP client has no timeout (`AuditEventPublisher.kt:39-40`). Older than Phase 4.
- A poison audit row (audit-service answers 400, for example the new `RESERVED_AUDIT_SOURCE`) is retried for ever in
  user-service (no attempt limit). No producer sends such a row today.

## Read and found clean

- **Scope resolvers** (`UserScopeResolver`, `OrgScopeResolver`, `AuditScopeResolver`): the company of a by-id target
  comes from an owner lookup bounded by the caller's reach; the grant is verified again before the scope is issued;
  the handler takes the issued scope, not a request id. `AuditScopeResolver.issuedAuditRead` checks the company and
  branch match.
- **Internal endpoints** (all `@InternalEndpoint` handlers in user, org, audit, accounts, hr): machine token, internal
  audience, capability scope, clients pinned where the body is trusted; producer id from the token. `franchisesOf`
  only for user-service's client. The gateway has no `/api/internal` route.
- **SEC-1 path move:** every producer (auth, user, org, hr, payroll, accounts) posts to `/api/internal/audit/...`; the
  legacy machine paths are gone from the shared filter and from audit's properties.
- **Shared domain events** (`InboxProcessor`, `JdbcInboxStore`, `JdbcFeedStore`, `DomainEventWriter`): the handler and
  the DONE mark share one transaction and the mark is fenced by the claim, so a re-claimed row rolls back; the system
  scope is checked against the event's company; the seven claim and purge queries are materialized.
- **Employee link** (hr push x user-service, new 422 for a user with no membership in the pushed company): hr only
  links active members and the link request is written after the invitation is accepted, so the 422 is not hit in the
  normal flows.
- **Invite and account races** (`adoptInvitedAccount`, `createInvitedAccount`, `emailGuard`), invitation acceptance
  (needs the invitation's own user id and a verified email by default).
- **Bootstrap contract** BE `AppBootstrapDtos.kt` x App `AuthSessionDtos.kt`: fields, nullability and defaults match;
  entitlements absent means "not known" on both sides.
- **Entitlement codes:** all 28 codes in App `NeoFeatureMap.kt` exist in `EntitlementCatalog.kt`; `APPROVAL_LIMITS`,
  `RECURRING_JOURNALS` and `JOURNAL_CSV_IMPORT` are released.
- **App after a company switch:** `withRefetched` drops an answer for another person, company or branch; the re-read
  retry checks the context again; the journals and receivables badges, saved report filters, opening-items marks and
  the country cache are keyed by company (and person); `PeopleViewModel` resets and drops late answers on a company
  change; Accounts hosts are keyed since FIX-APP-SWITCH.
- **Approval deciders and permission-holder machine reads:** company from the path under a system scope, client pinned
  to accounts (and payroll), codes limited to the client's own modules. Money and approval rules themselves were left
  to reviewer 1.

Not read in depth: accounts-service's own scope code (R29, before Phase 4), the hr v1 and payroll services beyond
their outbox and publisher changes, and the SQL of the owner-lookup adapters line by line (covered by the R29b
reviews).

Brief: unclear or missing — (1) it says the App makes "direct service calls", but the App talks to the gateway only; I
treated the gateway as the single entry. (2) It does not say how many instances of a service run in production; M3
scenario 1 depends on that. (3) It names "R29b, all sub-lanes" as isolation work but does not say that database RLS is
still off, which changes what "isolation" covers. (4) Approval stand-ins sit on the border of both reviewers' scopes; I
checked only where the company id comes from.
