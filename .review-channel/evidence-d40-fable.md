# D-40 decision check (rule 2): R29b-3U and R29b-5 builder questions

Checked by: Fable 5.2 (high), 2026-11-22. Read only: D-25, D-37, D-40, the two builder reports, and the code at
R29b-3U `2473b616` (worktree `r29b-3u`) and R29b-5 `4cf2ee1a` (worktree `r29b-5`). Nothing was run.

`user/` = `services/user-service/src/main/kotlin/com/neovatus/user/` in the `r29b-3u` worktree.

| Item | Result |
|---|---|
| 1. `UserRepository` rest | APPROVE WITH CONDITIONS (8). Condition 3 holds an owner point for Jabran if its option (b) is taken |
| 2. `PlatformStaffRepository` | APPROVE WITH CONDITIONS (7). The key proposed for another person's staff mark is not accepted as written (condition 1) |
| 3. R29b-5 Q5: no auth adapter | APPROVE WITH CONDITIONS (2, both text) |
| 4. D-37 item 1: the `PersonAuditFanOutPort` key | APPROVE WITH CONDITIONS (6) |

## Item 1. `UserRepository` rest: APPROVE WITH CONDITIONS

What is there now (`user/application/port/outbound/user/UserRepository.kt`): `save(User)`, `findById(id): User?`,
`findByEmailIgnoreCase(email): User?`, unscoped, on the baseline. Callers: `OnboardingService.kt:224`, `:364-382`,
`:840-842`, `:1085`, `:1126`; `MembershipService.kt:101` (`requireUser`); `PeopleQueryService.kt:218`;
`UserAdminService.kt:234`; `UserSecurityPolicy.kt:71`.

The split by use is right, and id-only or boolean-only answers widen no read by themselves. Conditions:

1. **No `User` leaves the new ports and no general `save` stays.** Reads answer `Boolean` or `UUID?`. The writes the
   invite path needs are named and guarded in SQL, not by a full read and a Kotlin check:
   - create the invited account: insert only (fails when the id exists);
   - adopt an invite placeholder: only `WHERE idp = 'invite'` (today `OnboardingService.kt:371-380` saves a copy of
     whatever account the email found);
   - close a never-signed-in invited account on withdraw: only `status = PENDING AND last_login_at IS NULL` and no
     ACTIVE membership, in one statement (today `:840-842` reads the full row and checks in Kotlin).
   The identity match of `:366-369` moves into the port method, so the caller never holds the row.
2. **The key is a value, not a sentence.** Each method takes the scope the rule issued (MUTATION for invite, add and
   person change; the lookup's own read scope), as D-25 Q1 asked for the reach. A method cannot then be called before
   a rule allowed the action at that company. The enrollment-owner add from org-service is a machine path: its own
   method, keyed by the machine client, not by the company key.
3. **The claim path (the main point).** `CompanyPeopleRepository` treats a person as the company's when a membership
   row of any status exists (`UserJpaRepository.kt:48-56`), and returns and saves the full person row
   (`UserRepositoryAdapter.kt:52-82`). Two actions create such a row without the person agreeing:
   an invitation by email of an existing account (a pending row), and `POST` membership, which adds any existing user
   id for a caller with `IAM.USER.INVITE`, with the status taken from the request and no check that the person is
   already in the company (`MembershipController.kt:61`, `MembershipService.kt:100-138`).
   So "no person data from another company is returned" is true of the id-only port and not yet proven for the
   system: the id leads to a row, and the row makes the person readable. Required before this entry is frozen:
   - (a) a person whose only tie to the company is a pending invitation is not read or written through the company
     scope beyond what the company itself typed (name and email of the invitation); and
   - (b) a direct add by user id of a person with no accepted membership in the company is either refused for a
     person caller (the machine enrollment path and "add at another place of the same company" stay), or it creates
     a row the person must accept. **If (b) changes behaviour Jabran decided (existing accounts are invited normally
     since D-7), it is an owner point for Jabran**; (a) alone is not enough for the direct add, because that row is
     ACTIVE at once; and
   - (c) a real-DB two-company test: B invites A's person by email, and B adds A's person by id; B's People detail,
     user by id, admin update, stand-in history and audit trail show nothing of A's person that B did not type.
4. **The lookup.** `PeopleLookupResult.exists` tells a company caller whether any account on the platform has that
   email. Keep the throttle (`PeopleQueryService.kt:217`) and the log line; the port method is an SQL `EXISTS`;
   the member details (`userId`, `fullName`, memberships) come from a scoped read by email, never from the unscoped
   one (today `:218-221` uses the unscoped row's id); the rule `canLookupPeople` already needs the invite right in a
   MUTATION scope (`UserAdminAuthorization.kt:459-462`): keep it; drop `exists` if the App does not use it.
5. **The security policy (c).** Today `UserSecurityPolicy.kt:71` reads the full row before any reach is proven, and
   `refuse()` (`:74`) returns that row inside the refusal; an unknown id answers `null`, a known one a refusal. After:
   staff read the person through `PlatformPersonPort` with the minted grant; a company admin's branch asks the
   boolean port first (`PersonMembershipSpreadPort`), then reads through `CompanyPeopleRepository` with a
   resolver-issued scope of one company in `acceptedCompaniesWithin`; a refusal carries no field of the target;
   an unknown id and an id outside the reach give a company admin the same answer. `SharedIdentityWritePolicy.kt:58`
   follows the same order.
6. **No message built from the unscoped row.** `MembershipService.kt:105` puts `target.fullName` of a person who is not
   the company's into the refusal text.
7. **Arch rules:** the new entry's methods return only `Boolean`, `UUID?` or nothing (as "owner lookups return ids
   only"); each method pinned to its one caller; a fixture offender; `UserRepository` deleted; the cap lowered.
8. **Tests:** one two-company case per method; the email-uniqueness boolean is a courtesy check, the unique index
   stays the guard (a test for the race answer).

## Item 2. `PlatformStaffRepository`: APPROVE WITH CONDITIONS

Port: `user/application/port/outbound/platform/PlatformStaffRepository.kt` (18 methods: catalogue reads and writes,
role codes, scope, assignments, grant and revoke).

1. **The key for another person's staff mark, as written, fits only staff callers.** "Keyed by the checked platform
   staff permission" covers `PlatformStaffService` and `UserAdminAuthorization.kt:281-284`. The other callers are
   company-side and hold no platform permission: the rule (`UserAdminAuthorization.kt:199-209`, `:306-308`, `:449`),
   refusing staff as members (`AccessChangeService.kt:126`, `MembershipService.kt:104`, `OnboardingService.kt:1127`),
   showing "Neovatus" (`MembershipDetails.kt:112`, `MembershipAccessService.kt:242`, `OnboardingService.kt:1120`),
   and the two policies (`SharedIdentityWritePolicy.kt:58`, `UserSecurityPolicy.kt:78`). For them: a separate entry,
   one method `isNeovatusStaff(userId): Boolean` (never role codes, scope or a count), key "a platform fact needed
   to decide or show an action in a company scope the rule already issued, or in a person-wide decision the two
   policies already key" (the D-25 owner point 4 pattern), pinned by method to exactly those callers.
   The role codes stay on the staff-permission entry and on the caller-identity entry.
2. **Fail closed.** Today a missing bean reads as "not staff": `?.activeRoleCodes(..)?.isNotEmpty() ?: false`
   (`UserAdminAuthorization.kt:619`) and `.isNullOrEmpty()` (`MembershipService.kt:104`, `AccessChangeService.kt:126`,
   `OnboardingService.kt:1127`). The boolean port is a required dependency everywhere (as `UserSecurityPolicy`
   already has it), and an error refuses the action.
3. **One id rule.** `isStaff(userId)` passes the user id (ID-1), the other callers `target.neoErpIdentityId`
   (null on an old account means "not staff"). The port takes the user id and resolves the identity in SQL.
4. **Staff callers.** Role codes, scope, holder counts and the assignments list are keyed by a resolver-minted grant
   for `PLATFORM.STAFF.READ` / `PLATFORM.STAFF.MANAGE` (like `PlatformPersonGrant`), frozen, pinned to
   `PlatformStaffService` and the one rule. The last-Super-Admin check becomes a boolean taken under a lock inside the
   write's transaction (`UserAdminAuthorization.kt:284` and `PlatformStaffService.kt:332` count outside it today).
5. **The caller's own mark and access:** caller identity, the reader takes the principal, never a raw id (D-25 Q6).
6. **Catalogue.** Reference port (frozen, no-write arch rule, D-25 Q4): `permissions`, `roles`, `findRole`,
   `findRoleByCode`, `permissionCodesOf`. `countHolders` and `activeAssignments` are about people, not reference
   data: they go on the staff-permission entry.
7. **Writes** (D-25 Q2 conditions, each its own small port, never the whole repository): the staff writes (`grant`,
   `revoke`, `saveScope`, `clearScope`) and the platform-role writes (`insertRole`, `updateRole`,
   `replaceRolePermissions`, `deleteRole`), which D-40 does not name. PLATFORM_WRITE in the same transaction with
   before and after (role codes, permission codes, scope) and the reason; an audit failure refuses the write; one test
   per use case; each listed in the ADR-012 §3 note. A platform-role edit changes what every holder may do: fresh
   authority, and the actor grants nothing beyond their own permissions and scope (`requireWithinActor`,
   `requireScopeWithin` stay and get tests).

## Item 3. R29b-5 Q5, no auth adapter: APPROVE WITH CONDITIONS

Checked: at the base `409f45e5`, `inventory()` and `findByExternalIdentity` are named only in the port, the service
and the adapter of auth-service, with no caller outside that chain; at the head auth-service has no
`@PlatformWideRepository`, no `PlatformTenantAccess` and no `tenant-security` dependency. An adapter with no read to
record would be dead code, the same reasoning as D-25 Q3. The real-DB case for auth is
`StableIdentityJdbcRepositoryIntegrationTest`.

1. The ADR-012 note does not yet say what D-40 says it does. `docs/adr/ADR-012-tenant-query-isolation.md:187-190`
   (R29b-5 head) says only that auth has no platform-wide read. Add: auth gets its `PlatformAccessAuditPort` adapter
   in the lane that adds its first platform-wide read. Amend D-25 Q5's adapter list the same way.
2. Say in that note what enforces it: auth is in `RATCHET_SERVICES` (`TenantRepositoryArchitectureTest.kt:1077`), a
   platform-wide port needs the frozen allowlist and a `PlatformTenantAccess`, which only the resolver issues after
   the record is committed; so such a read cannot be added without the adapter. Known limit, as everywhere: a direct
   `JdbcTemplate` read in a class that is not a port is outside the scan.

## Item 4. D-37 item 1, the `PersonAuditFanOutPort` key: APPROVE WITH CONDITIONS

Checked: one method, `activeCompanyIdsForAudit(userId): Set<UUID>`
(`user/application/port/outbound/scope/PersonAuditFanOutPort.kt`); frozen (`FrozenTenantBaselines.kt:298`, `:329`);
pinned by class and method to `UserAdminService#enqueueUserAudit` (`TenantRepositoryArchitectureTest.kt:1082`). That
method is private, returns nothing, and uses the ids only as `AuditEventOutboxEvent.orgId`
(`UserAdminService.kt:444-476`); its three callers (`:249`, `:297`, `:433`) run after the person was read under the
rule. The key "a person change `UserAdminAuthorization` already allowed" widens no read: no caller gets an id, and each
company gets only an event about its own member. Approved, so it need not go to Jabran, with these conditions:

1. **The shape is part of the pin.** A test: the HTTP answer of a person update is the same whether or not the person
   is ACTIVE in a second company, and no log line prints the ids. (The pin names the method; nothing yet stops that
   method from returning or logging the ids later.)
2. **The SQL says what is meant.** `PersonMembershipJdbcAdapter.kt:64`:
   `status = 'ACTIVE' AND (activated_at IS NOT NULL OR status = 'ACTIVE')`; the second clause is always true. Write
   the rule once, with a real-DB test that a company holding only a pending invitation gets no event (NEW-01) and an
   INACTIVE one gets none.
3. **It depends on item 1, condition 3.** A direct add with status ACTIVE that the person never accepted makes the
   adding company a receiver of the person's later before and after values (email, name, status).
4. **What the receiving company sees.** The actor of the event is another company's administrator: in a company
   where the actor is not a member the audit view shows no name for them; the payload stays within `auditedFields`
   (never identity numbers). One test.
5. **Required, not optional.** `auditFanOut: PersonAuditFanOutPort? = null` (`UserAdminService.kt:77`): when it is
   absent the event is written once with no company (`:462`, `ifEmpty { listOf(null) }`) and every company's trail
   misses it without an error. Required in production wiring; the default only in tests.
6. **Text.** The port's KDoc still says "OPEN QUESTION … R29b-4 decides its final key": replace it with the D-37
   key; list the fan-out in the ADR-012 §3 note as a system write keyed by each event's own company, and note for R7
   that the outbox insert for the other companies needs the system policy.

## For the lead

- To Jabran: only item 1, condition 3 (b), and only if the direct add by user id is to change.
- The builders can continue on items 2, 3 and 4 with the conditions above; on item 1 the split can be built now,
  and condition 3 decides whether the entry may be frozen.
