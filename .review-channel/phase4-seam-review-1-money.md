# Phase 4 seam review 1 of 2: money and approvals

Date: 2026-11-24. Scope: AL-REST (approval limits, stand-ins, two-person rules, "waiting for you"), opening items
import, AC418, recurring journals, payments/refunds approval. Read only; nothing was run (no Gradle, tests, stack or
simulator). Heads read: BackEnd `7ee082b`, App at the `seam-review-App` detached head.

Paths below are relative to:

- BE = `NeoERP-worktrees/seam-review-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/`
- BE-user = `NeoERP-worktrees/seam-review-BackEnd/services/user-service/src/main/kotlin/com/neovatus/user/`
- App = `NeoERP-worktrees/seam-review-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/`

## Result

| Severity | Count |
|---|---|
| HIGH (wrong money, lost/duplicated posting, cross-company leak) | 0 |
| MEDIUM (broken flow or wrong decision in a real case) | 1 |
| LOW | 3 |

No wrong-money, lost or duplicated posting, or cross-company path was found in the features in scope. Phase 4 has no
cross-service money posting in these features: every posting is inside accounts-service in one transaction, and the
outbox there carries audit and domain events only.

## Findings

### M1 (MEDIUM, CONFIRMED by reading both sides): the Limits page and the "check an amount" answer become unreadable when the server sends `null` for two flags

Seam:

- BE `application/service/approvallimits/ApprovalLimitModels.kt:91` (`secondConfirmerMissing: Boolean?`), `:103` and
  `:138` (`featureEnabled: Boolean?`); filled in `ApprovalLimitReadService.kt:91-92` (count unreadable gives `null`),
  `:117`, `:158`, `:374-378` (`FeatureState.UNKNOWN -> null`); written as they are in
  `delivery/http/approvallimits/ApprovalLimitJson.kt:19`, `:33`, `:71`.
- App `data/remote/dto/ApprovalLimitsDtos.kt:61` (`secondConfirmerMissing: Boolean = false`), `:78` and `:110`
  (`featureEnabled: Boolean = false`), decoded by `data/remote/AccountsA2Transport.kt:73` and `:129-135` with
  `AccountsJson.instance`, which has no `coerceInputValues` (`data/remote/AccountsJson.kt:13-16`; only the
  recurring-journals reader got the tolerant Json, `:18-27`).

The server designed a degraded answer (`null` = "not known"). The App reads these as non-nullable booleans with the
strict Json, so a `null` throws and the whole answer is `AccountsUnreadableException`. The contract examples
(`docs/api/accounts-approval-limits.md:293-298`, `:348`) show only `true`/`false`, so neither side's tests cover it.

Failure scenarios:

1. A kind's current version was confirmed alone by the Owner and is not yet acknowledged. user-service's holder count
   cannot be read (down, slow, or 60 s cache cold). `GET /approval-limits` answers 200 with
   `"secondConfirmerMissing": null` for that kind. The App cannot read the answer: Limits does not open for anyone in
   the company, for all three kinds, although the server sent bands, warnings and the pending proposal. The same shape
   is returned by confirm and acknowledge-alone, but those App calls do not read the body.
2. org-service's entitlement answer is unreadable to the service (`FeatureState.UNKNOWN`) after the guard passed.
   `GET /approval-limits` and `GET /approval-limits/check` answer `"featureEnabled": null`. Limits does not open, and
   "check an amount" (`presentation/approvallimits/LimitsViewModel.kt:138`) fails.

Both are transient (they end when the dependency answers), no money moves, and no approval decision is affected:
item approvals do not use these two answers. Fix on one side: App fields nullable (null = unknown), or the server
never sends `null` there.

Not affected (checked field by field against the strict reader): `approval` block, `actions`, `approvalProgress`,
summaries, proposals, history, the Owner's-own report, opening-import DTOs, `/approval-stand-ins/mine`.

### L1 (LOW, CONFIRMED): a one-step band with a role or a named person gives the wrong reason in the App

Seam:

- BE `application/service/subledger/SubledgerActions.kt:21-31`: under a stored version with one step, `approve`
  answers `allowed: false` with `blockedBy` `NOT_IN_STEP` or `NOBODY_CAN`. A one-step `ROLE` or `PERSON` band is a
  valid policy (`shared/approval-model/.../PolicyChecks.kt:44-97`).
- App `presentation/approvalsteps/ApprovalStepsRules.kt:61-62` and `:151-152`: the approvals card and the step line
  exist only when `needed > 1`. So `presentation/payables/PaymentDetailState.kt:111-117` falls to
  `accounts_payment_msg_note_no_right`; refunds do the same (`presentation/receivables/RefundDetail.kt:119-125`).

Scenario: payment limits are "any amount: 1 approval by role Finance Manager". Kari holds `PAYMENT.APPROVE` but is not
a Finance Manager. On a waiting payment she reads "Approving needs the right to approve payments, which your role
doesn't have. A Finance Manager or the Owner can approve it." She does hold the right; with a `PERSON` step the advice
is also wrong (only the named person can), and with `NOBODY_CAN` nothing says nobody can. The server refuses correctly;
only the words are wrong, and no card shows who may approve.

### L2 (LOW, PLAUSIBLE): "Set my stand-in" is decided by the App's own grants; the server's `canSetOwn` is ignored

Seam:

- BE-user `application/service/approval/ApprovalStandInService.kt:84-85`: `canSetOwn = !platform && member &&
  decide.isNotEmpty()`, from company-level decide codes.
- App `presentation/ApprovalLimitsAccess.kt:65` and `:119` (`canSetOwnStandIn` from `grants.can(decideCode)`),
  used at `presentation/approvallimits/StandInsViewModel.kt:103`. `MyStandIns.canSetOwn` is mapped
  (`data/mapper/ApprovalLimitsMapper.kt:240`) and never read. `StandInsState.kt:73` also falls back to all three kinds
  when the server's `decideKinds` is empty.

Scenario (not proven, it depends on whether the App's company grants can hold a decide code the server does not count
at company level, for example through a branch-scoped role): the App offers "Set my stand-in" with all three kinds,
the server refuses the save with 403. No wrong stand-in can be created; the server decides. The rule is decided twice
where the server already sends the answer.

### L3 (LOW, CONFIRMED, latent): approval-run status `PAUSED_NO_RIGHT` is active for the server and not for the App

Seam:

- BE `domain/subledger/openingimport/OpeningImportModels.kt:349` (`active` = `RUNNING` or `PAUSED_NO_RIGHT`), the
  one-active-run index in `V34__opening_item_imports.sql:136`, `OpeningItemImportService.kt:676-681` (another run
  active gives 409 `APPROVAL_RUN_ACTIVE`).
- App `domain/model/OpeningImportModels.kt:44` (`isRunning` = `Running` only), used by Continue and Cancel
  (`presentation/openingimport/OpeningImportPageController.kt:303`, `:365`).

No code sets `PAUSED_NO_RIGHT` today, so this cannot happen yet. If a later lane sets it, the side (customers or
suppliers) is blocked for the whole company: the server refuses a new run and the App offers neither Continue nor
Cancel.

## Read and found clean

Approval limits and stand-ins

- Limits, check, proposals, history, Owner's-own report: every response key and type, BE `ApprovalLimitJson` against
  App `ApprovalLimitsDtos` (except M1); every request body against `ApprovalLimitBodies` (explicit `null`s the App
  sends are accepted); path kinds, idempotency key, paging keys (`totalElements`; stand-in history `total` is read).
- Feature off: reads stay open on both sides (`gateReads = false`; App `ApprovalLimitsAccess`), withdraw and
  acknowledge stay allowed on both sides. `FINANCE.APPROVAL_LIMITS` is released; the demo seed only switches the
  feature on and seeds no limits rows, so it hides nothing.
- Who may approve is decided only by the server: `StepAuthority`, `JournalApprovals`, `SubledgerApprovals`. The App
  takes `actions`, `waitingForYou` and `approvalProgress` from the answers and re-decides nothing
  (`ApprovalStepsRules`, `TwoPersonReason`, list rows). All `blockedBy` values and all refusal codes of accounts
  approval limits, the shared model and user-service stand-ins are known to the App (checked by name, none missing).
- `expectedStep` is sent on the journal post and on the payment and refund approve (the open escaped-defect row APP-3
  is fixed at this head); earlier steps use `approval-steps/{n}/approve` with the exact key lists the server accepts.
- Deciders read accounts to user-service: field names and types of `IamApprovalDecidersClient.parse` against
  `ApprovalDecidersDtos`; answer for another company refused; failure and `truncated` give 503 on writes and
  `nextUnknown` on reads; cache key includes the company; company always from the trusted scope.
- Identity: token subject equals IAM user id (enforced), so contributor, used-set and stand-in matching by id is sound.
- Confirm of new limits: proposer cannot confirm, Owner-alone only when no other holder, named person and their
  stand-in refused, version and fingerprint checked under the lock.
- Amount basis: journal total debit in company currency; payments and refunds are company currency only
  (`amount_base = amount`), so the band cannot be picked from a foreign amount. All submit paths (person, recurring
  job, journal import, opening-balance confirm) take the snapshot through the same two functions.

Payments and refunds approval

- `PaymentApprovalService.approve` and `PaymentStepApprovalService.approve`: lock order, state and version re-checked
  under the lock, posting, step row and approval completion in one transaction, idempotency key per document, payee
  change cancels and commits before the 409, bank-details tick on every step. App sends and handles
  `confirmedBankDetails`, `PAYEE_CHANGED_DURING_APPROVAL`, `SUBMIT_FIRST`, `OWNER_OWN_NOT_ALLOWED`,
  `APPROVAL_STEP_TAKEN`.

Opening items import and AC418

- Every endpoint, body key and response key, BE `OpeningImportControllers` / `OpeningImportJson` against App
  `OpeningImportApi` / `OpeningImportDtos`; the send-all and approve-all loops end in every case I traced (all items
  skipped, run finished, 409 from a second device).
- Approval run: claim under the run lock, counters and posting of each item in one transaction, a lost claim writes
  nothing, importer cannot approve unless Owner with the tick, withdraw refused once anything is posted.
- AC418: V78 guard fails with a list instead of changing data; `OpeningNumberGuard` at submit and approve plus the
  index race; the App handles `DUPLICATE_CUSTOMER_ITEM` in the wizard, the import page and the document screens.
  The opening-balance import's new `openingItems` link is read-only and scoped by the caller's company and read codes.

Recurring journals

- `RecurringJournalJob`: one run per month per template (`ON CONFLICT`, template lock), period re-checked under a
  share lock, module off skips the company while feature off records `SKIPPED_FEATURE_OFF` (different codes, so a
  suspended module is not recorded as a skipped month), 503 never recorded, failure recorded in its own transaction.
  Job switches default to on. Run statuses, modes and frequencies match the App enums one to one.

Not read in depth (out of time, lower risk for seams): auto-reversal job internals, the journal CSV import service,
`RefundApprovalService` beyond its approval gate (it mirrors payments), the Limits editor screen's band editing, mock
repositories.

Brief: unclear or missing — "AC418" was not described (I took it as the company default tax codes migration plus the
opening-item number guard and the App two-person reason, from V78 and the App brief folder); the brief did not say
that the App reads most Accounts answers with a strict Json (a `null` for a non-nullable field makes the whole answer
unreadable), which is the lens that found M1 and would be worth naming for reviewer 2 and for later seam reviews.
