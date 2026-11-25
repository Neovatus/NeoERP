# Review: Phase 4 fixes, risky BackEnd parts · branch `core/phase-4-fixes`

Reviewer: Fable 5.2 (high)
Reviewed: 6aff24b (BE, 6aff24ba4af1df760f79dccc70b1f625cc561811); re-check of F1 on acd727d / 193a52f1 (App, read only for the `EMAIL_TAKEN` words)
Range: 5b22aca..6aff24b (BE, `origin/main..HEAD`)
Verdict: ACCEPT

Scope (Jabran): only (1) sign-in email clash, (2) outbox claims and duplicate checks, (3) read-only lookups replacing
bootstrap. Read only; nothing was run. Paths below: `U/` = `services/user-service/src/main/kotlin/com/neovatus/user/`,
`AU/` = `services/audit-service/src/main/kotlin/com/neovatus/audit/`.

One blocking finding (F1, a one-line fix plus a test). Everything else is LOW.

## Findings

| # | Severity | Where | Failure (inputs → wrong result) | Confidence |
|---|---|---|---|---|
| F1 | HIGH | `U/application/service/user/me/mapper/UserMeMapper.kt:52-57` (clash path of `U/application/service/user/me/UserMeService.kt:45-50`); read by `U/application/service/onboarding/OnboardingFirstLoginService.kt:85-87` and `U/application/service/platform/PlatformStaffService.kt:195` | In the clash path the stored email is kept, but its verified flag is not: `email` is null there, so the code takes `existing.emailVerified \|\| token.emailVerified`. Stored `old@x` **unverified**, token email `E2` **verified** and held by another account → the row keeps `old@x` and becomes `emailVerified = true`, although nobody proved `old@x`. The same sign-in then runs `acceptForUser`, whose guard "accepted only by an account that has proven it owns the invited email" (`require-verified-email-to-accept`, default true) now passes, and `pendingInvitesOf` matches invitations by this user id and the stored email (`OnboardingInviteRepositoryAdapter.kt:75-78`). So an invitation sent to an address the account never proved is accepted and its membership activated. Before this branch the same sign-in answered 409; with a free `E2` the row takes `E2` and the invitation no longer matches. The new path is the only one that opens it. A person can set this up alone: hold the invited address unverified at the identity provider (the case the guard exists for), keep a second account whose row still holds a stale `E2`, then move the first account to `E2` and verify it. Plan, KDoc and `docs/api/user-iam.md` all say "keeps its verified flag". Fix: when the token email is not taken over, keep `existing.emailVerified` unchanged. Test (fails today): stored unverified + clashing verified token → still unverified, a pending invitation stays open. | flag change CONFIRMED by reading; full chain PLAUSIBLE (identity-provider settings not checked) |
| F2 | LOW | `AU/application/service/NotificationService.kt:63-65`, `AU/infrastructure/persistence/adapter/NotificationRepositoryAdapter.kt:95-101`; producer `services/accounts-service/.../notification/BankNoticeHttpSender.kt:60-64` | `saveNew` commits, then `dispatch` runs outside it. If `saveAttempt` fails or the service stops between the two, accounts gets no answer and retries; the repeat finds the stored row (status `DELIVERED` from creation), is answered 200 and nothing is dispatched. accounts marks the bank-change notice sent. Today the email is simulated, so only the attempt row is missing; with a real mail sender this is a bank-change notice that is never sent. Before V8 the retry sent it (twice at worst). Fix direction: on a repeat, dispatch when the stored notification has no sent attempt. No test for "stored, dispatch failed, repeat". | CONFIRMED by reading |
| F3 | LOW | `U/infrastructure/persistence/adapter/outbox/SecurityCommandOutboxJdbcRepository.kt:53-80` | The first lease is 5 s for every row of a batch of 25, sent one after the other. With a slow auth-service (more than about 200 ms per call, or one call at its 5 s timeout) the later rows' leases end before they are sent, and a second instance claims and sends them too. The comment says "longer than one send", not the batch (the audit outboxes use a lease that outlasts the batch). No harm to data: auth-service ignores an acknowledged `operation_id`. Effects: double sends under load, attempts counted twice, the "two instances once each" test only holds for a fast consumer. Also no upper limit on attempts (a row that can never succeed is retried every 5 min for ever). | CONFIRMED by reading |
| F4 | LOW | `U/configuration/security/UserServiceSecurityConfig.kt:133-140` | "Where else" miss of round 2: user-service's own `InProcessEffectivePermissionSource.selectedBranch` still runs the full bootstrap in process (sign-in sync write, invitation acceptance, calls to org-service). The grep was for the URL, this caller has none. Together with ISO-M1: for a person with an email clash each such call also writes one `SIGN_IN_EMAIL_NOT_SYNCED` row. It should call `ownSelectedContext`. | code CONFIRMED; which user-service routes reach it not checked |
| F5 | LOW | `U/application/service/user/me/UserMeService.kt:62-72` | One WARN and one audit row on **every** bootstrap and `/me` call (2 per App start) for as long as the clash lasts. If the other person has left and never signs in, it never ends, and the person's stored email stays the old one (notifications go there; an admin cannot set the new one either: 409). P4FIX-2 only says "support checks both accounts"; no step says how support clears the stale email. Suggest: record once per day (or on first detection) and write the support step. | CONFIRMED by reading |
| F6 | LOW | `U/application/service/platform/PlatformStaffService.kt:140,153` vs `docs/agents/phase-4-fixes/contract/README.md` §3, `plan.md` ISO-M1 | Plan and contract say staff add answers `EMAIL_TAKEN`. It does not: both the pre-check and the caught `EmailTakenException` answer 409 "appeared meanwhile; add them again" without a code. The App test fixture (`PlatformErrorWordsTest`) uses a body the BE never sends on that path. The BE words are the right ones there (adding again works); correct the contract and plan. | CONFIRMED by reading |
| F7 | LOW | `U/application/service/rbac/membership/MembershipService.kt:90-111` | `ownSelectedContext` is a second copy of bootstrap's choice (`AppBootstrapService.kt:143-160`) and `requireActiveCaller` a second copy of `UserLifecycleService.requireActiveUser`. Nothing ties the copies together: a later change of bootstrap's choice gives other services a different branch than the App shows. Share one function, or add a test that compares both answers. | CONFIRMED by reading |
| F8 | LOW | test table | Missing cases: (a) F1's case; (b) sign-in clash through the web layer (the test calls the use case); (c) a claimed row that is never marked (process stops) is sent again after the lease, user and auth audit outboxes; (d) session revocation: a failed row is sent again after its backoff, and the backoff grows; (e) selected context: preference with a branch, and a preference that is no longer active; (f) F2's case. | CONFIRMED |
| F9 | LOW | shared `HttpEffectivePermissionClient.selectedBranch`, org `OrgIamAccessClient`, payroll client | No note on rollout order. A service with the new client against a user-service without the two endpoints gets 404: org answers 503 on every page, payroll refuses, writes in accounts/hr answer 503. user-service must go first. Not a problem in dev; add a go-live row. | CONFIRMED by reading |

## Builder decisions

| Decision | Judgement | Why |
|---|---|---|
| D1: sign-in never fails on the clash; retry in a second transaction, stored email kept, other account untouched | acceptable | No lock-out: the retry cannot hit V50 (the stored value is unchanged), callers are not transactional, open-in-view is off. No takeover: the other row is never written. Wrong in one detail (F1). Never heals when the other person does not sign in (F5). |
| D1: retry instead of a pre-check | good | Covers a concurrent email write; no new method on the frozen port. |
| D1: audit row without the email, WARN with a masked email | good | Nothing about the other account leaves the service; the answer is the person's own stored email. |
| `EMAIL_TAKEN` on the other writes | good | Same 409 and words as before, now with a code; no new information. Staff add does not get it (F6). |
| D2: `own-companies` from `ownMemberships.memberships` filtered to ACTIVE, through `MembershipService` | good | Exactly bootstrap's set (company and branch memberships, no locations), no ratchet change. |
| D2: explicit active-person check | acceptable | Right behaviour; duplicates the lifecycle service (F7). |
| D2: org maps 403 → empty, everything else → 503, bad or missing ids → 503 | good | Never a narrower reach from a broken answer. |
| D3: batch claim, lease outlasts the batch (user 5 min for 25, auth batch × 10 s) | good | Bounded by the client timeouts (10 s per send at most); a failed row is released by `markFailed`. |
| D3: `claimDue` default in the port = `findPending` | acceptable | Only for test doubles; a new real implementation that forgets to override it silently has no claim. |
| D3: `eventId` = outbox row id; key = (producer from the token, id) | good | One producer cannot hide another's events. |
| D3: advisory lock, then read; unique index as backstop | good | Safe under READ COMMITTED; contention only between two deliveries of the same event. |
| V7, V8, V51 | good | Nullable columns, partial indexes, `IF NOT EXISTS`; existing rows are NULL / attempts 0 and due at once. Index builds are not concurrent (short write block on a large `audit_events`; fine at start-up). |
| Round 2: `own-selected-context` and the shared-module URI change | acceptable | Same answer as bootstrap without `orgId`, timeouts kept, callers still fail closed. Copy of the logic (F7), in-process caller left (F4), rollout order (F9). |
| Round 2: notification sent only when new | acceptable today, wrong with a real mail sender | F2. |
| Round 2: session-revocation lease = backoff, counted at claim | acceptable | Fixes the stall; first lease too short for a slow batch (F3). |
| Not taken: what support does when the other person never signs in | missing | F5. |

## Checklist (checked for the three areas)
- [x] flow works on every discovered path, except F1 (clash path) and F4 (in-process caller)
- [x] contract: both sides read for `EMAIL_TAKEN`; F6 is a wrong line in the contract
- [ ] rights and company scope: F1
- [x] money invariants unaffected · [ ] no duplicate piece: F7
- [x] feature checklist (docs pages present; go-live rows P4FIX-1, -2) · [ ] test table complete: F8

## Read and found clean
- Sign-in: `UserMeService`, `UserMeMapper`, `UserSignInService`, `AppBootstrapService` (callers not transactional), `UserRepositoryAdapter.save` / `emailGuard`, `EmailTakenException`, `UserAdminService` email change, invite adopt/create. A stale email on another row does not send an invitation to the wrong account: `adoptInvitedAccount` requires the identity to match (`UserRepositoryAdapter.kt:139`), so such an invitation is refused (builder's "plausible, not checked" item; older than this branch). The 409 on an admin email change tells a company admin that an address is used somewhere; that was already so before this branch.
- Outboxes: user and auth claim SQL (materialized CTE, SKIP LOCKED, autocommit, no transaction during sends), `markPublished` / `markFailed`, both dispatchers, token and event client timeouts, org and accounts `eventId`, audit-service `append` and `saveNew`, V7, V8, V51, auth-service `SessionRevocationService` (repeat is a no-op once acknowledged), `BankNoticeSenderJob` (one notice row per recipient, ids never reused).
- Lookups: `AuthzController`, `MembershipService` additions, `OwnMembershipJdbcAdapter.memberships`, `OrgIamAccessClient`, `PayrollSelectedContextClient` + `PayrollAccessRules` (null → refused), shared `EffectivePermissions.kt` + `ServiceAuthorization.selectedBranch` (unavailable → write 503, read company level), `NeoErpHttpClients` (2 s / 5 s), route rule entries. Only the caller's own data, active person only, machine tokens get 403, staff and Enter-company answers equal bootstrap's.
- Tests read: `SignInEmailClashIntegrationTest`, `SessionRevocationOutboxIntegrationTest`, `OwnCompaniesTest`, `AuthzControllerWebMvcTest` additions; names only for the other test classes of these areas.

Brief: unclear or missing — the brief does not say how many instances of a service run (decides how much F3 matters), whether the identity provider lets a person change or hold an unverified email (decides how easy F1 is), or the rollout order of services (F9). The hand-back still says "Migrations: audit V7 only" and "no shared-module change" (round 2 added audit V8, user V51 and the shared client change; plan.md is right).

## Re-check (acd727d, `git diff 6aff24b..acd727d`, read only, nothing run)
- **F1 fixed.** `UserMeMapper.kt:57-63`: in the clash path (`!takeTokenEmail`) the row keeps `existing.emailVerified`; the
  two other branches are as before (a different token address carries the token's flag, the same address keeps "once
  verified"). New test `SignInEmailClashIntegrationTest.a clashing verified token email does not verify the kept
  unverified address`: stored unverified + clashing verified token → row stays unverified, its invitation stays
  `PENDING`. By reading, both assertions fail on 6aff24b (flag became true; the invitation was then closed as accepted),
  and the test runs with the default `require-verified-email-to-accept=true`. The plan does not record the old-code
  FAIL run for this test; add that line when the gate runs.
- **F4 glance: nothing broken.** `InProcessEffectivePermissionSource.selectedBranch` now reads `OwnSelectedContextUseCase`
  (one bean, `MembershipService`, taken lazily). Same answer as before: branch only for the asked company, a person who
  is not active or another token → `Unavailable` (write 503, read company level). No bootstrap dependency left there.
- Not re-checked (LOW, backlog): F2, F3, F5, F6, F7, F8. F9 has its rollout note in `docs/api/user-iam.md`.
- Cosmetic: one `@Test` line in `SignInEmailClashIntegrationTest` is indented too far.
