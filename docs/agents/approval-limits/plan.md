# Approval limits (AC-AL) — plan (Phase 4)

## Checkpoint
| Field | Content |
|---|---|
| Identity | Approval limits for journals, supplier payments and customer refunds (spec `NeoERP-App/docs/design/specs/accounts-approval-limits.md`). Repos: NeoERP-BackEnd, NeoERP-App. Lead: Claude (workspace lead session). |
| Stage | Plan done 2026-11-15 (Opus, read-only; base: worktree a4-be = main e210155 + A4). Waiting for Jabran's decisions. No build until Phase 3 testing ends and A4 is merged. |
| Approval | **AL-D11 decided by Jabran 2026-11-15:** a limit change needs a second person (one proposes, a different person confirms; applies only on confirm). **Jabran 2026-11-15 approved the planner's §2.1 design** (separate CONFIRM code; no confirming a change that names you; no stand-in confirm; no editing a pending proposal; 14-day expiry; Owner confirms alone only when no other holder, with reason and visible tag), except: notifying other holders waits for the notification service (ADR-025); until then a banner on Limits + History. **Jabran 2026-11-15 decided AL-D1…AL-D19** (§2 "Decided" column), on the rule "we're in dev: target design, not workarounds for old code". |
| Resume point | All decisions made. Next: S0 contract (after A4 lands), backend first; Opus security review of the AL-D12 endpoint and the AL-D14 id change. |

## 0. Things the spec assumes that the code does not have
1. **Bank entries and payment batches are not built** (slice D is roadmap row 8; D3 is Phase 5 / PF-1). v1 kinds = journals, supplier payments, customer refunds. No bypass today: any other money-out is a manual journal, covered by journal limits. Rule: slice D must bring bank entries under the limits when it builds them.
2. **Accounts cannot see who holds a code.** The user-service internal API returns only a count (`PermissionHolderInternalController.kt:25-60`); calls carry codes and the Owner flag, no roles (`shared/neoerp-security/.../authz/Calls.kt:23-32`). Role steps, named steps, AL-6, "Next: Siri Dahl" and the stand-in picker need a new machine-only user-service endpoint (security decision, Opus review) → AL-D12.
3. **Two ids for one person:** contributors use the token subject; user-service uses IAM user ids → AL-D14.
4. **user-service has no event outbox** → read stand-ins fresh instead of an event feed (AL-D1).

## 1. Drift
| # | Finding | Where |
|---|---|---|
| 1 | Bank entries and batches not built. | roadmap rows 8, Phase 5 |
| 2 | Feature switch `FINANCE.APPROVAL_LIMITS` exists (off by default); HR `APPROVAL_CHAINS`, Payroll `PAY_MULTI_APPROVAL`. Spec silent. | `EntitlementCatalog.kt:92,115,145` |
| 3 | "Waiting for you" is SQL on contributors only; steps and AL-6 need candidates in SQL + in-memory filter. | `JournalJdbcAdapter.kt:406`, `ReceivablesControllers.kt:482`, `BillController.kt:271`, `JournalPolicy.waitingForYou` |
| 4 | Owner may post own draft without submit (R-12): snapshot needed there too. | `JournalPolicy.postableStatus`, `PaymentApprovalService.kt:124` |
| 5 | All journal submits go through `JournalDraftService.markSubmittedInTransaction` (A1, recurring job, CSV import). | `JournalDraftService.kt:269-280,551`, `RecurringJournalJob.kt:491-496`, `JournalImportService.kt:499-500` |
| 6 | Engine evidence holds two people; earlier steps live in Accounts tables, engine unchanged. | `Posting.kt:218-300` |
| 7 | A4 left the promised room (`scheduled_reversals.authorisedBy/amount`, complete contributors). | `JournalPostingService.schedule()` |
| 8 | Opening-balance journals post via normal journal post; would land in the top band. | `JournalPostingService.requireControl` |
| 9 | Roadmap Phase 4 also lists "Owner may not post own journal" + self-approval report; not in this spec. | `accounts-roadmap.md:68` |
| 10 | Only Owner, Finance Manager, Super Admin hold JOURNAL.POST / PAYMENT.APPROVE / REFUND.APPROVE: 3-step bands usually unfillable in small companies. | user `V10:83,134`, `V43:260-265` |
| 11 | "Approving is never the asking code" → confirm needs its own code. | `permission-actions.md` |
| 12 | Reminders need a working-day calendar + notification channel; none in Accounts. | `BankNoticeHttpSender.kt` |
| 13 | App: `NeoApprovalCard` not built; rig `accounts-al.jsx` has no pending-change states. | — |
| 14 | App strings: en/nb/sv/da. | `composeResources/values*` |
| 15 | HR v1 has one `approver_employee_id`; manager rule, inbox, `ApprovalItemProvider` are contracts only; expense claims only a feature code. Shared model keys people by IAM user id; relation steps resolved by the owning service. | hr `V2:50`, `V7`, `V8` |

Next free migrations at merge: accounts **V70**, user **V47**. One per slice.

## 2. Decisions

### Decided (Jabran 2026-11-15)
- **As recommended:** AL-D2, D3, D4, D6, D7, D8, D9, D10, D13, D15, D18, D19; AL-D1 (read stand-ins fresh is the target design, kept).
- **AL-D5 (target):** the shared model includes LINE_MANAGER, MANAGER_OF_MANAGER, COST_CENTRE_OWNER step types now; the new HR supplies the people from its start (not "reserved").
- **AL-D12 (yes):** machine-only user-service endpoint (holders of a code in a company: IAM user id, subject, name, roles), Accounts client only, logged and counted; Opus security review.
- **AL-D14 (target):** one id everywhere = IAM user id. New tables store only it; existing Accounts documents get a new IAM-id column filled once from the subject (new migrations; applied ones stay frozen). Subject no longer used for matching once filled.
- **AL-D16 (new Payroll):** the new Payroll's pay-run approval uses the shared limit model (bands, steps, stand-ins, two-person limit changes) from day one; Accounts adds no second limit on payroll postings (normal checks stay). Auto-reversal job and reversals: no limits. Recurring and imported journals: limits apply.
- **AL-D17 (target):** reminders ship with ADR-025's notification service in Phase 4; banner on Limits until then.

- **AL-D15 amended (Jabran 2026-11-16, after the Opus security review H3):** opening-balance journals keep Standard two-person only until the first non-OB posting or the first period close, whichever comes first; after that they follow JOURNAL limits.
- **AL-Q3 (lead, on the review's advice):** one combined holders + stand-ins read and scope, with per-client module allowlists and no note/subject in the answer.

### Planner recommendations (for reference)
| # | Recommendation | Blocks |
|---|---|---|
| AL-D1 | Pure-Kotlin `shared/approval-model` (bands, steps, checks, AL-6 solver, stand-in resolution); tables in the owning service (last step + posting in one transaction); stand-ins central in user-service, **read fresh, no event feed**. | S1, S2 |
| AL-D2 | Ordered steps, max 3 per band, with AL-6. | S1 |
| AL-D3 | Snapshot at submit, storing the band's step definitions; who may fill a step checked live. | S4 |
| AL-D4 | Company currency: journal total debit; payment amount paid without withholding; refund amount paid out. | S4, S5 |
| AL-D5 | Step types: decide code, role (any, incl. company-made), named person; reserve LINE_MANAGER, MANAGER_OF_MANAGER, COST_CENTRE_OWNER. | S1 |
| AL-D6 | Stand-in must hold the decide code; away person can still decide; checked fresh. | S2 |
| AL-D7 | v1: journals, payments, refunds; bank entries with slice D (must include them); batches with D3. | S0 |
| AL-D8 | Last approval posts; request carries `expectedStep`, mismatch → 409. | S4 |
| AL-D9 | `waitingForYou` redefined, same field; SQL candidates + library filter; counts capped. | S4, S5 |
| AL-D10 | Per company only. | — |
| **AL-D11 (decided, Jabran 2026-11-15)** | Two people for a limit change. Planner design: proposals PENDING/CONFIRMED/DECLINED/WITHDRAWN/SUPERSEDED/EXPIRED; one pending per company+kind; stores base version + content fingerprint; new code `ACCOUNTS.APPROVAL_LIMIT.CONFIRM` (Owner, Finance Manager by default); audit for every step. See §2.1. | S2, S3 |
| AL-D12 | Machine-only user-service endpoint: holders of a code in a company (user id, subject, name, roles); Accounts client only, logged and counted. Alternative: drop role/named steps from v1. | S2, S4 |
| AL-D13 | Feature off: limits, history, stand-ins readable, read-only; pending proposals frozen; waiting items **keep their snapshot** (never quietly loosened); new submissions use Standard; ending a stand-in always allowed. | S3, S4 |
| AL-D14 | Steps and stand-ins store IAM user id and subject; compare with contributors by subject. | S2 |
| AL-D15 | Opening-balance journals stay Standard two-person (D-5); period-13 follows journal limits; year-end close unchanged. | S4 |
| AL-D16 | No limits on machine postings (payroll), auto-reversal job, reversals (one step). Recurring and imported journals do pass limits (submitted, posted by people). Payroll adopts via `PAY_MULTI_APPROVAL` later. | S4 |
| AL-D17 | Reminders later (calendar + notifications). | S6 |
| AL-D18 | "Owner may not post own journal" switch + self-approval report: separate Phase 4 item. | — |
| AL-D19 | Stuck items: "Nobody can approve step 2"; reject + resubmit takes the current policy; Limits warns on unfillable steps. | S4 |

### 2.1 AL-D11 design — approved by Jabran 2026-11-15 (notifications deferred to ADR-025)
1. **One holder only:** Owner may confirm own proposal only when the server finds no other CONFIRM holder (fresh count, excluding the proposer); tick "Nobody else can confirm this" + reason; marked `confirmedAlone`, tagged in History, shown on Limits until a second holder exists. A non-Owner sole holder is refused. Rejected: blocking (unusable for owner-run companies); Neovatus confirming (RULES §13, liability). Lead had proposed confirm by UPDATE holders; planner prefers a separate CONFIRM code so a company can split edit from confirm.
2. **Confirmer needs no decide code** (oversight, e.g. an auditor). Conflict rule: you cannot confirm a proposal that names you as an approver.
3. **Stand-ins cannot confirm.**
4. **Risks:** collusion (applies only to new submissions; other holders and Owner notified; History + CSV export); pending forever (expire after 14 days; withdraw; banner); no editing a pending proposal (withdraw + new; confirm sends id + fingerprint); base changed → SUPERSEDED (`LIMITS_CHANGED`); proposer lost the right → void; decline needs a reason; no shortcut for tightening; reminder days and stand-ins stay single-person with reason.

## 3. Slices
Order: A4 merged → S0 → S1 ∥ S2 → S3 → S4 → S5 → S6. App follows each backend slice.
Single-writer: journal files (`JournalDraftService`, `JournalPostingService`, `JournalPolicy`, `JournalReadService`, `JournalDtos`, `JournalJdbcAdapter`) in S4 only, after A4 merge; **`PostingEngine.kt`/`Posting.kt` untouched** (architecture test that only the approval gate posts these kinds); `PaymentApprovalService`, `RefundApprovalService`, `DocumentApprovals` in S5.

| Slice | Content | Migration | Opus review |
|---|---|---|---|
| S0 | Contract `accounts-approval-limits.md`; amend A1 §6.6, C, B, note for D C-7; roadmap; decisions D-183+. | — | lead |
| S1 | `shared/approval-model`. | — | yes |
| S2 | user-service codes (READ, UPDATE, CONFIRM, ORG.APPROVAL_STANDIN.MANAGE); stand-ins table + endpoints; AL-D12 endpoint. | V47, V48 | yes |
| S3 | Accounts policy, proposals, history, CSV, feature gate, audit; no posting path. | V70 | yes |
| S4 | Journals: snapshot at submit and Owner draft post; step decisions under the journal lock; actions, waitingForYou, timeline; period check last step only. | V71 | yes (money) |
| S5 | Payments and refunds. | V72 | yes |
| S6 | Acceptance, load, demo seed; reminders deferred. | — | — |

Test names: see planner report (`ApprovalBandsTest`, `PolicyChecksTest`, `KeepLaterStepSolverTest`, `StandInRulesTest`, `ApprovalLimitCodesMigrationTest`, `StandInServiceTest`, `DeciderListInternalTest`, `LimitProposalTest.{proposerCannotConfirm, ownerAloneOnlyWhenNoOtherHolder, confirmerNamedInProposalRefused, editIsNewProposal, staleBaseSuperseded, expiresAfter14Days, proposerLostRightVoid, standInCannotConfirm}`, `ApprovalLimitsFeatureOffTest`, `JournalApprovalStepsTest.*`, `JournalWaitingForYouTest`, `ApprovalGateArchitectureTest`, `PaymentApprovalStepsTest`, `RefundApprovalStepsTest`).

App: P0 rig update for AL-D11 (Jabran signs off) → P1 data layer → P2 Limits area (`strings_accounts_approval_limits.xml` en/nb/sv/da, `NeoFeatureAction.ApprovalLimits`) → P3 steps card (`NeoApprovalSteps`, reusable by HR; Opus check) → P4 payment/refund detail → P5 click-through.

## 4. Risks
- Posting without a limit: Owner's own draft post (snapshot there); new Post/Approve callers (architecture test); bank entries when D arrives; machine postings exempt by design.
- AL-6 needs fresh people lists; re-solve before the transaction; if user-service cannot answer, refuse, never allow.
- Stand-ins always read fresh at decision time.
- Race on a step: document `FOR UPDATE` then approval rows; lost race → `APPROVAL_STEP_TAKEN`.
