# Brief: AL-REST-BE — approval limits on payments and refunds, small reads, Owner switch (BackEnd, 2026-11-22)

**Roadmap:** `docs/drafts/accounts-roadmap.md` "Phase 4, rest" 4.7 (S5), 4.9 (small reads), backend part of 4.11 (AL-D18).
**Repo / lane:** NeoERP-BackEnd, branch `phase/4-b2-al-rest-be` cut from `origin/phase/4`, worktree
`NeoERP-worktrees/al-rest-be`. Copy this file to `docs/agents/al-rest/brief-be.md` as the first commit.
**Slicing:** L37 option B (one lane per feature per repo), labelled at assignment. **Money lane.**
**Builder:** Opus 5.5 high, builder Mac (targeted tests only). **Reviews:** fresh Opus + Fable (diff + brief only, L36/R2).
**Twin:** `brief-al-rest-app.md` starts when §API below is fixed (the builder report's API table, lead OK).

## Goal
Supplier payments and customer refunds are approved in steps under the company's limits, exactly as journals are since
S4; the two small reads the app is waiting for exist; the company can switch off the Owner's own approval and see a
report of every Owner's-own decision.

## Evidence (read first)
- Contract `docs/api/accounts-approval-limits.md` (approved 2026-11-16): §1, §2 L-1…L-8, **§2.1 SR rules**, §6.2, §6.3,
  **§10 in full** (10.1 snapshot and Owner draft `SUBMIT_FIRST`, 10.2, **10.5 payments/refunds + SR-H4**, 10.6–10.8),
  §11, §12, §13, §15 S5 tests, **§15.1 S4-1…S4-5** (the patterns S5 copies).
- What S4 built (copy its shape, do not edit it): `application/service/journal/JournalApprovals.kt`,
  `JournalApprovalSteps.kt`, `domain/approvallimits/ItemApprovals.kt`, `port/outbound/approvallimits/ItemApprovalPorts.kt`,
  `ItemApprovalJdbcAdapter.kt`, `IamApprovalDecidersClient.kt`, tests `JournalApprovalStepsTest`, `JournalApprovalsRig`,
  `StandInDoubleCountTest`-style cases, `architecture-tests/.../ApprovalGateArchitectureTest.kt` (its line 24 waits for S5).
- Today's payment/refund approve: `payables/payment/PaymentApprovalService.kt` (lock order, C-3 bank editor, PAY-6,
  Owner draft R2-6), `receivables/refund/RefundApprovalService.kt` (C-39, P3-30 Owner's own only when nobody else holds
  `REFUND.APPROVE`), `PaymentDraftService.submit`, `RefundDraftService.submit`, `subledger/DocumentApprovals.kt`,
  `PaymentRules`/`RefundRules` (`bankRouteFingerprint`), `SupplierBankChangeService`, `CustomerBankChangeService`.
- Limits read: `approvallimits/ApprovalLimitReadService.kt` (`confirmedByUserId` is in the model, not in the answer).
- user-service stand-ins: `delivery/http/rbac/standin/controller/ApprovalStandInController.kt`, `ApprovalDecidersService`.
- `docs/backlog.md` "decide-roles read for proposers" and "confirmedByUserId on limits answer" (2026-11-16);
  plan `WS/docs/agents/approval-limits/plan.md` §2, §2.1, §3 single-writer, §4 risks; `WS/docs/domain/RULES.md` §3, §7.

## Decided (do not reopen)
1. AL-D1…AL-D19 and §2.1 as in the plan (Jabran 2026-11-15); contract approved (Jabran 2026-11-16); D-203 OB rule;
   D-204 one person id (subject = IAM user id, no fallback). Target design, no workarounds for old code (Jabran).
2. AL-D4: payment banded on `ap_payments.amount_base` (without withholding), refund on `ar_refunds.amount_base`.
3. AL-D8 / L-4: earlier steps `POST /api/accounts/{payments|refunds}/{id}/approval-steps/{n}/approve`; the last step is
   the existing `.../approve` with `expectedStep` (required when `steps_count > 1`, S4-4). Bank details confirmed on
   **every** step (PAY-6); note ≤ 500 (D-6a). SR-H4: payee version stored per step; a change cancels the approval
   (`PAYEE_CHANGED_DURING_APPROVAL`, document back to DRAFT, committed before the 409).
4. §10.1: snapshot at submit; Owner's own draft approve with more than one step → 409 `SUBMIT_FIRST`. S4-1: Standard
   approvals keep today's rule without the deciders read. Fail closed (L-8, 503 `AUTHZ_UNAVAILABLE`).
5. Migration: **accounts V77** (next free on `origin/phase/4`: V76 is the highest; V73 and V75 stay gaps, lead D-20,
   2026-11-21). One migration for the lane. Contract §6.3 still says "V73": update it to V77.
6. Single writer: `PostingEngine.kt` / `Posting.kt` untouched; journal files untouched except where 4.11 needs the
   Owner check (name the lines in the report). `PaymentApprovalService`, `RefundApprovalService`, `DocumentApprovals`
   are this lane's.
7. Decide-roles read: `GET /api/rbac/approval-stand-ins/decide-roles?orgId=&kinds=` for holders of
   `ACCOUNTS.APPROVAL_LIMIT.UPDATE` or `.CONFIRM`, answer `{items:[{roleId,name,canDecide:[kinds]}]}`, kinds limited
   to ACCOUNTS (SR-M2) (backlog 2026-11-16, security review). `confirmedByUserId` per kind in `GET /approval-limits`.

## Decisions (Jabran 2026-11-22: "od oa as recommended": OD-1, OD-2, OD-3 decided as recommended below; build them)
- **OD-1 What the switch covers.** Rec: one company switch "The Owner may not approve their own items" for all three
  limit kinds (journals, supplier payments, customer refunds). Why: the Owner's own exists in all three (A1 C-7, C R2-6,
  B P3-30); a journal-only switch leaves the same self-approval open through a payment.
- **OD-2 Where it lives and who changes it.** Rec: a per-kind flag on the limits version (`ownerOwnAllowed`, default
  true = today), changed through the existing propose → confirm flow (AL-D11). Why: two people, History, CSV and audit
  come for free; one person switching it off for themselves is what it guards against. At a decision the stricter of
  snapshot and current rule applies (AL-D13: never quietly loosened).
- **OD-3 Report scope.** Rec: `GET /api/accounts/approval-limits/owner-self-approvals` (+ CSV), filters date range and
  kind, needs `ACCOUNTS.APPROVAL_LIMIT.READ`; rows from every place Accounts records `owner_self_approval` (journals,
  AR/AP documents, payments, refunds, write-offs, SIE/opening imports, bank-detail changes). Why: an auditor wants one list.

## Scope
| ID | Item |
|---|---|
| BE-1 | V77: widen `document_approvals.kind` to `SUPPLIER_PAYMENT`, `CUSTOMER_REFUND` (+ OD-2 column if approved). Flyway fresh + on seeded data. |
| BE-2 | Snapshot at payment/refund submit (feature read before locks, S4-5) and at the Owner's own draft approve (`SUBMIT_FIRST`). |
| BE-3 | Earlier-step endpoints for payments and refunds (§10.3 order, SR-L2 checks before the deciders read, lock order setup → document → its targets → party → approval). |
| BE-4 | Last step via existing approve + `expectedStep`; engine in the same transaction; step row `is_last`; COMPLETED. |
| BE-5 | SR-H4 payee version per step and cancel on change; PAY-6 confirmation on every step. |
| BE-6 | Detail `approval` block, `actions.approve`, `blockedBy` values, timeline `APPROVED_STEP`; list `approvalProgress`; `waitingForYou` / counts for payments and refunds (§10.7, capped 99). |
| BE-7 | Audit `accounts-payment` / `accounts-refund` `APPROVE_STEP`; APPROVE gains the fields (§12). |
| BE-8 | `ApprovalGateArchitectureTest` names PY and RF. |
| BE-9 | Decide-roles read in user-service (own scope check, company from the call only, no subjects/notes in the answer). |
| BE-10 | `confirmedByUserId` per kind in `GET /approval-limits` (null when no version). |
| BE-11 | 4.11 switch as OD-1/OD-2 decide; refusal code `OWNER_OWN_NOT_ALLOWED` (403) on every Owner's-own path. |
| BE-12 | Self-approval report + CSV as OD-3 decides. |

## API the App lane needs (fix it in the builder report before the App starts)
BE-3/4 endpoints and bodies; the BE-6 fields; error codes; BE-9, BE-10; BE-11 setting read/write shape; BE-12 rows.

## Neighbours (outside this scope)
- App screens for all of the above: AL-REST-APP (twin). Journal steps UI: AL-REST-APP.
- Bank entries `BANK_OUT` and batches `PAYMENT_BATCH`: slice D / D3 (Phase 5, 5.6 / 5.8).
- Reminders: ADR-025 platform lane 4.12. `accounts.journal.posted` additive fields: deferred (S4-3).
- Payroll pay-run limits: HRP-2 (AL-D16). Split-to-stay-under-a-band report: backlog (SR-L4). 4.18 follow-ups: own lane.

## Tests (money lane: a test per rule)
- Contract §15 S5: `PaymentApprovalStepsTest`, `RefundApprovalStepsTest` with the S4 set mirrored: stepOneThenApprove,
  expectedStepRace (two approvers at once → one posts, the other 409, **one journal, no double post**), keepLaterStep,
  alreadyApproved, ownerOwnOneStepOnly, ownerDraftNeedsSubmit, standInDecides, stand-in double count (SR-H2),
  rejectRestartsWithCurrentPolicy, snapshotUnchangedByLaterLimitChange, featureOffKeepsSnapshot, feature read
  unavailable → stored version, bankDetailsConfirmedOnEachStep, `payeeChangedBetweenStepsCancels`, foreign-currency
  payment banded on `amount_base`, withholding excluded, bank editor (C-3/C-39) refused on every step, refund P3-30 kept.
- **Old FAIL / new PASS** for each changed behaviour (run the new test on the base commit; say how in the report):
  over-limit payment and refund approved by one person; missing `confirmedByUserId`; decide-roles for an UPDATE holder
  without `IAM.ROLE.READ`; Owner's own with the switch on.
- **Two-company isolation:** decide-roles, report, payment/refund `waitingForYou` counts, `confirmedByUserId`: company
  B's rows never in A's answer; another company's id → the service's existing 404/403.
- **Money invariants:** earlier steps never write ledger lines or change bill/invoice open amounts; the last step posts
  exactly the approved amount once; a cancelled approval leaves no ledger lines; `scripts/money-invariants.sh` green.
- Targeted runs only (`:services:accounts-service:test --tests …`, `:services:user-service:test --tests …`,
  `:architecture-tests:test`). No whole-suite run, no `verify.sh`: the old Mac runs the gate.

## Rules
- One repo (BackEnd). Gradle only through `lockf -k /private/tmp/neoerp-gradle.lock`, Java 21, log to a file, one
  watcher; never `gradlew --stop`; stop only your own daemons. Do not start the backend.
- Plain commits, **no AI attribution, no Co-Authored-By**. No push, merge or rebase (the lead does).
- **Never open or print** `.env`, `infra/.env`, `.local-secrets/*`, token/session files, `~/.gradle/gradle.properties`,
  `~/.netrc`, `~/.aws`, keys.
- Migrations freeze once applied: never edit V70/V71 or any applied file; a fix is a new migration (ask first).
- Docs: developer `docs/modules/accounts/approval-limits.md`, contract §6.3/§10.5/§15 ticks, `docs/database/db-design.md` V77;
  user guide: none in this repo (App lane writes it). List each or "none: reason" in the lane-ready.
- Stop and ask: the contract can't be built as written; a change touches `PostingEngine`/`Posting.kt`, auth-service,
  an applied migration, or a response shape outside §API.

## Builder self-check (L36; in the report, one row per scope row)
| ID | Proof (test class.method, file:line) | Status |
|---|---|---|
| BE-1 … BE-12 | | |
L36: every review finding fixed with its own old-FAIL/new-PASS test and a re-run of the touched targets; review files
in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`).

## Reviews
Fresh Opus (whole diff) → `docs/agents/al-rest/review-be-1-opus.md`; Fable money/approval logic (lock order, SR-H2/H4,
race, fail closed, Owner switch) → `review-be-2-fable.md`. Only a FIX reviewer re-checks.
**Report:** `docs/agents/al-rest/builder-report-be.md`. **Lane-ready:** `.review-channel/lane-ready-al-rest-be.md`.

## Timeline (lane-ready, MEASURE-1)
```
## Timeline
- Build: … · Rework: … · Review: … · Test: … · Waiting: …   (minutes; tokens per agent; FIX rounds)
```

## Done when
BE-1…BE-12 proven in the self-check; targeted tests 0 failed; both reviews ACCEPT; API table OK'd for the App lane;
docs listed; lane-ready with the Timeline; the old Mac's `verify.sh` green before merge to `phase/4`.
