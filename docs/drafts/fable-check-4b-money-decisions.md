# Fable check: Phase 4b posting and approval decisions (SP-1, A7, A8, B5)

Date: 2026-11-22. Independent review asked for in `.review-channel/brief-4b-plan.md` line 70. Read-only; nothing
else was changed. No REJECT, so nothing has to go back to Jabran as a refusal; **SP-1 conditions 1, 2 and 5 and A8
condition 1 change the specs as written**, so the lead should show those four to Jabran before the briefs are cut.

Sources read: `docs/domain/RULES.md` §3, §7, §8; `docs/drafts/spec-4-15-spreading-schedules.md` (§2, §4.3, §7, §10,
§11, §13); `NeoERP-BackEnd/docs/api/accounts-a4.md` (C-3, C-4, C-5, C-9, C-11, C-12, C-16, C-19, C-20, C-22, C-32,
C-33, D-108, D-179); `NeoERP-BackEnd/docs/api/accounts-a1.md` (C-6, C-7, C-9);
`NeoERP-BackEnd/docs/api/accounts-approval-limits.md` (§10.1, §10.2, §10.4, AL-D3, AL-D16);
`NeoERP-App/docs/design/specs/accounts-allocations.md` (§2, §7, §12); `NeoERP-App/docs/design/specs/accounts-budgets.md`
(§2, §4.7, §7, §12); `NeoERP-BackEnd/docs/adr/ADR-022-budget-control.md` (D3, D16, Q4, tests).

Checked for each item: maker ≠ checker, audit trail, period-close integrity, idempotent and recoverable jobs,
company isolation, the approval-limit chain. Test names below are proposals; the builder may rename, but each
behaviour needs a named test, and money findings need old FAIL / new PASS proof where a fix is involved.

---

## 1. SP-1: a spreading schedule is approved once by two people; the job posts each period

Verdict: ACCEPT WITH CONDITIONS

### Reasons

- **D-108 refused "approve the template once" for recurring journals because a wrong amount would repeat without
  limit.** A spreading schedule is different in the ways that matter: it is finite (1–120 periods), every amount is
  fixed in the approved preview, the total can never exceed a posted source line that already passed two people
  (`SOURCE_OVERSPREAD`), it only moves value between two fixed accounts of one company (no cash, no counterparty,
  no VAT), and the balance-account reconciliation line shows any drift. This is the same reasoning as C-20: the
  right is checked while the person is there, and the job carries their authorisation as evidence.
- **Common practice agrees.** SAP (accrual engine and recurring entries post in a periodic run), Dynamics 365
  (deferral schedules are fixed when the document posts; recognition runs in batch), NetSuite (amortization and
  revenue schedules; the journal run is a batch, with journal approval optional), Visma and Tripletex
  (periodisering is set on the voucher line and the period vouchers follow by themselves). None asks a person to
  post each month. NeoERP's approve-once with two people is stricter than most of these.
- 2,400 hand postings a year for 200 items would turn the second look into a rubber stamp, which is weaker
  control than one careful approval of the full preview.
- **The gaps are in the side doors, not in the main rule.** As written, a single EDIT holder (who may be a writer)
  can choose the period a posting lands in ("Post in {next open period}", "Post again"), the Opening balance source
  has no posted document behind it, and nobody but an EDIT holder can stop a schedule that may run for ten years.
  The conditions close these.

### Conditions

1. **Moving or re-posting a period keeps two people.** "Post in {next open period}" and "Post again" (spec §4.3 gives
   them to EDIT) decide which period a cost or income lands in; that is a cut-off decision. The actor must hold
   `ACCOUNTS.SPREADING.APPROVE` and must not be a writer of any version of the schedule (Owner only through the 4.11
   switch, recorded as `ownerSelfApproval`). Alternative the lead may choose instead: the action creates the journal
   **waiting to post** with the writers as contributors (A4 C-4), posted by A1's path. Either is acceptable; one
   EDIT holder alone is not. Tests: `SpreadingMoveTest.writerCannotPostInNextPeriod`,
   `SpreadingMoveTest.postAgainNeedsNonWriterApprover`, `SpreadingMoveTest.ownerMoveRecordsSelfApproval`.
2. **Opening balance source is bounded.** There is no source line to cap the amount, so: the approval card shows the
   balance account's ledger balance, the remaining on its other schedules and the difference after this schedule;
   Submit and Approve are refused (`SOURCE_OVERSPREAD`) when open schedules on the balance account would exceed its
   ledger balance on the go-live date. Tests: `SpreadingOpeningTest.refusedOverLedgerBalance`,
   `SpreadingOpeningTest.approvalBlockCarriesReconciliation`.
3. **The job posts exactly what was approved.** Each approved version stores a frozen snapshot (period, date, amount,
   both accounts, branch, dimension set) and its hash. The job builds each journal from the snapshot only; an
   inactive account, a dimension refusal or any other mismatch gives `FAILED` and Needs you, never a substitute
   value. The sum of the snapshot equals the approved amount to the cent (rounding on the last period). Tests:
   `SpreadingJobTest.postsSnapshotAmountsExactly`, `SpreadingJobTest.inactiveAccountFailsNeverSubstitutes`,
   `SpreadingPreviewTest.sumEqualsAmountEqualAndByDays`.
4. **A named engine evidence type, and a closed list.** The posting carries evidence
   `ScheduleApproval(scheduleId, version, approvedBy, approvedByName, writers)` beside `ScheduledReversal`; actor
   `system`; `source.module = SPREADING`. `ApprovalGateArchitectureTest` is extended so the only callers that reach
   the engine for a JV without the approval gate are the reversal job and the spreading job, each with its evidence
   type. A4 C-3 and D-108 are amended in words: "the exceptions are the automatic reversal and an approved
   spreading schedule; a recurring template still never posts". Tests:
   `ApprovalGateArchitectureTest.onlyReversalAndSpreadingJobsBypassGate`,
   `PostingEngineTest.scheduleApprovalEvidenceRequiredForSystemSpreading`,
   `SpreadingJobTest.unapprovedOrSupersededVersionNeverPosts`.
5. **Anyone with authority can stop it at once.** A holder of `ACCOUNTS.SPREADING.APPROVE` or `ACCOUNTS.JOURNAL.REVERSE`
   can **Pause** an approved schedule with a reason and no second person (as C-23 cancel); Resume needs a non-writer
   APPROVE holder. The approver's rights are not re-checked each period (as C-20), so this stop is the
   counterweight. Tests: `SpreadingPauseTest.pausedScheduleCreatesNoRun`, `SpreadingPauseTest.resumeNeedsNonWriter`.
6. **Maker ≠ checker over the whole life.** Writers are cumulative across versions (creator, every editor, every
   proposer of a change, the submitter). No writer approves any step of any version; a stand-in may not act for a
   writer; a person is used once per approval (SR-H2). Multi-step bands complete before the first posting.
   Tests: `SpreadingApprovalTest.writerOfEarlierVersionCannotApproveChange`,
   `SpreadingApprovalTest.standInForWriterRefused`, `SpreadingApprovalTest.samePersonTwoStepsRefused`.
7. **Approval-limit chain.** Snapshot of the journal band at submit (AL-D3) on the amount still to release in base
   currency; a change is banded on the larger of the old and the new remaining amount; several schedules on one
   source line are banded on the line's total open spread amount (stops splitting under a band); limits read
   unavailable fails closed (`AUTHZ_UNAVAILABLE`, never Standard, SR-M5); feature `APPROVAL_LIMITS` off gives the
   Standard two-person step. Tests: `SpreadingLimitsTest.bandOnRemainingBase`,
   `SpreadingLimitsTest.splitSchedulesBandOnSourceLineTotal`, `SpreadingLimitsTest.limitsUnavailableFailsClosed`.
8. **Owner's own approval is visible on every journal.** When the 4.11 switch allows the Owner to approve their own
   schedule, every period journal it posts carries `owner_self_approval = true` and appears in the self-approval
   report (AL-D18). Test: `SpreadingApprovalTest.ownerSelfApprovalFlagsEveryPeriodJournal`.
9. **No double posting, ever.** One live (not reversed) journal per schedule and period: unique key
   `(company_id, schedule_id, period)` on the live run, with an attempt number for Post again; engine idempotency key
   `SPR:{scheduleId}:{n}:{attempt}`; run row and journal in one transaction; advisory lock `accounts-spreading`
   plus row locks in the R-4 order; End early (post the rest), a change approval and the job serialise on the
   schedule row. Invariant, checked by the ledger check and blocking push: posted live period journals + remaining
   = approved amount, per schedule. Tests: `SpreadingJobTest.twoInstancesPostOnce`,
   `SpreadingJobTest.crashAfterJournalBeforeCommitPostsOnceOnRetry`, `SpreadingJobTest.catchUpAfterDowntimeNoDoubles`,
   `SpreadingJobTest.endEarlyRacesJobPostsRestOnce`, `SpreadingJobTest.postAgainAfterReversalOneLiveJournal`,
   `SpreadingInvariantTest.postedPlusRemainingEqualsApproved`.
10. **Period close.** Never re-dated by the job (SP-6 as recommended); period lock taken last, `FOR SHARE` (C-32);
    a period closed between due date and run gives `SKIPPED_PERIOD_CLOSED`. The Period close row shows count **and
    amount** not yet posted for the period being closed. The SP-3 first journal (P&L to balance account on the
    source date) is in the approved preview and follows the same rule when that date's period is closed. Tests:
    `SpreadingJobTest.closedPeriodWaitsNeverRedates`, `SpreadingJobTest.lockedPeriodWaits`,
    `PeriodCloseChecklistTest.spreadingRowShowsCountAndAmount`, `SpreadingJobTest.firstMoveJournalInClosedPeriodWaits`.
11. **SP-8 (feature off) as recommended, stated fully.** Feature off: approved schedules keep posting; no create,
    submit, approve, change, move or post again. FINANCE module off or books not LIVE: the job skips the company
    (C-5) and, unlike recurring, **catches up** when it is back (the approval covered those periods), each period
    still subject to condition 10. Tests: `SpreadingFeatureTest.offKeepsPostingRefusesWrites`,
    `SpreadingFeatureTest.financeOffSkipsThenCatchesUp`.
12. **Company isolation.** The job binds one company per transaction (RLS binder); source line, accounts, dimension
    values and schedule id of another company are refused as foreign (404 / `DIMENSION_INVALID`); a franchise's
    schedules never show in the group. Tests: `SpreadingIsolationTest.foreignSourceLine404`,
    `SpreadingIsolationTest.jobNeverCrossesCompany`, `SpreadingIsolationTest.listAndSummaryOwnCompanyOnly`.
13. **Audit trail.** Every job posting writes audit `accounts-spreading-run POST` naming schedule, version, period,
    amount, journal id and the approver whose authorisation was used; the journal detail shows "Posted by schedule
    {number} v{n}, approved by {name} on {date}; written by {names}"; MOVE, POST_AGAIN, PAUSE, RESUME and END carry
    actor and reason. Test: `SpreadingAuditTest.jobPostingNamesApproverAndVersion`.

---

## 2. A7: re-running an allocation month is "reverse and recreate"; one live run per rule and month

Verdict: ACCEPT WITH CONDITIONS

### Reasons

- It is the standard pattern: SAP assessment and distribution cycles are reversed and repeated, Dynamics 365
  reverses the allocation journal and processes again, NetSuite re-runs after reversing the generated journal.
  Auditors can follow two whole journals more easily than a chain of difference journals.
- Posted journals stay untouched, the reversal needs `JOURNAL.REVERSE` with a reason, and the new journal passes a
  second person again, so the two-person rule and the limits are kept without new machinery.
- The risks are in the edges: reversal and re-run landing in different periods, the reversal being counted as a
  cost to allocate, and two runs racing.

### Conditions

1. **One live run enforced by the database.** Partial unique index `(company_id, rule_id, month)` where the run is
   not `REVERSED` / `DISMISSED`; an unposted journal (draft or waiting to post) counts as live. Deleting or
   rejecting the unposted journal frees the month without a reversal. Tests:
   `AllocationRunTest.secondRunSameMonthRefusedAlreadyRun`, `AllocationRunTest.jobAndPersonRaceCreatesOne`,
   `AllocationRunTest.deletedDraftFreesTheMonth`.
2. **Reversal and re-run stay in the same month.** "Reverse and run again" is refused when the month is closed or
   locked (`PERIOD_CLOSED` / `PERIOD_LOCKED`, "Reopen {month} first"); the RV is dated the original's date, never the
   A1 C-9 fall-back to a later period. Tests: `AllocationRerunTest.closedMonthRefused`,
   `AllocationRerunTest.reversalDatedOriginalDate`.
3. **Reverse and recreate is one action.** One transaction (or one action id with a recoverable second step that
   repeats safely): after it, either the old journal is live, or it is reversed and the new journal exists. A
   crash never leaves "reversed, nothing new" without the run showing Needs you. Idempotency-Key on the call.
   Tests: `AllocationRerunTest.atomicReverseAndRecreate`, `AllocationRerunTest.retrySameKeyCreatesNothingNew`.
4. **The source amount ignores this rule's own journals and their reversals.** The spec excludes "the journal from
   this rule's own earlier runs"; the RV of such a journal must be excluded too, or the re-run allocates the
   reversal. Test: `AllocationSourceTest.ownRunsAndTheirReversalsExcluded`.
5. **Reversal from the Journals screen is seen.** A hand reversal of an allocation journal sets the run to
   "Reversed by hand" and frees the month (as A4 C-22 `REVERSED_BY_PERSON`). Test:
   `AllocationRunTest.handReversalMarksRunAndFreesMonth`.
6. **Dependent rules are flagged.** When rule B's source includes accounts and values rule A posts to, reversing or
   re-running A marks B's run for the month "Costs changed after the run". Test:
   `AllocationRerunTest.dependentRuleFlaggedStale`.
7. **History is complete.** Reversed runs keep their key, key version, target numbers, source amounts, journal and
   RV ids, who reversed and the reason; nothing is overwritten. The reverser counts as the runner of the new run
   (A8), so cannot post it. Tests: `AllocationHistoryTest.reversedRunKeptWithKeyVersionAndNumbers`,
   `AllocationRerunTest.reverserCannotPostNewJournal`.
8. **Isolation and limits.** Runs, keys and journals belong to one company; the new journal takes the journal
   limits at submit like any JV (`markSubmittedInTransaction`). Tests: `AllocationIsolationTest.foreignRuleOrKey404`,
   `AllocationLimitsTest.runJournalSnapshotsJournalBand`.

---

## 3. A8: whoever switched a schedule on (and every writer) cannot post the journals it creates

Verdict: ACCEPT WITH CONDITIONS

### Reasons

- It is A4 C-4 applied to a job: the job has no person, so the people who caused the run stand in as its makers.
  Without it, the rule's author could switch the schedule on and post the result, which is one person end to end.
- The journal still goes through A1's post and the journal limits, so the approval chain is unchanged.
- **One gap:** the spec says changing a key table does not make someone a writer, and that the poster "can check"
  who changed it. But the key decides every amount in the journal. A person who edits the key version and then
  posts the journal has set the numbers and approved them alone.

### Conditions

1. **Authors of the key version used are contributors of that run's journal.** Not writers of the rule in general
   (that would lock out small teams), only for journals whose run used a key version they created or edited.
   The screen says so before the click, as for writers. Tests:
   `AllocationContributorsTest.keyVersionAuthorCannotPost`, `AllocationContributorsTest.keyAuthorOfUnusedVersionMayPost`.
2. **The contributor list is written at run time, in the run transaction:** all writers of the rule since creation,
   everyone who switched the schedule on or changed it, the hand runner, and the key-version authors (condition 1).
   Pause, resume and end do not add anyone (A4 C-4). Tests:
   `AllocationContributorsTest.scheduledRunCarriesWritersAndSwitcher`,
   `AllocationContributorsTest.pauseResumeAddsNobody`.
3. **The server refuses; the screen never offers.** Post by a contributor is refused by A1 C-6 with no new path;
   a stand-in may not act for a contributor; the Owner posts only through the 4.11 switch with
   `ownerSelfApproval` recorded. Tests: `AllocationPostTest.switcherRefusedByA1TwoPersonRule`,
   `AllocationPostTest.standInForWriterRefused`, `AllocationPostTest.ownerSelfApprovalRecorded`.
4. **The scheduled run never posts.** It creates a draft or a journal waiting to post only; `ApprovalGateArchitectureTest`
   keeps the allocation job off the engine. Test: `ApprovalGateArchitectureTest.allocationJobNeverCallsEngine`.
5. **Audit.** The run records who switched the schedule on and when; the journal's history lists its contributors
   and why each is one (writer, switched on, ran, key version). Test:
   `AllocationAuditTest.runRecordsSwitcherAndContributorReasons`.

---

## 4. B5: budgets gain "Waiting for approval" between Draft and Approved (amends ADR-022 D3)

Verdict: ACCEPT WITH CONDITIONS

### Reasons

- With autosave (B4) and many editors, a Draft can change while the approver reads it. A frozen state is what makes
  the approval mean "this content". Dynamics 365 budget register entries do the same (Draft, In review, Completed);
  SAP planning uses a work status lock. A budget never posts (ADR-022 D2), so the money risk is low; the risk
  becomes real in stage 2, when the approved version drives spending control.
- It matches journals, so "Waiting for you" and the approval card work the same way.
- **One gap found while checking separation of duties:** Copy creates a new version whose only editor is the
  copier, so an editor of the original could approve their own numbers in the copy.

### Conditions

1. **State machine, written into ADR-022 D3:** `DRAFT → WAITING_FOR_APPROVAL → APPROVED → LOCKED`; from Waiting:
   **Send back** (APPROVE holder, reason 6–500) and **Withdraw** (the person who asked, or an EDIT holder) both
   return to `DRAFT`; Reopen from Approved or Locked returns to `DRAFT`, never to Waiting. Approve is refused from
   `DRAFT` (`VERSION_NOT_WAITING`). Tests: `BudgetLifecycleTest.approveFromDraftRefused`,
   `BudgetLifecycleTest.sendBackNeedsReasonReturnsDraft`, `BudgetLifecycleTest.withdrawReturnsDraft`,
   `BudgetLifecycleTest.reopenGoesToDraftNotWaiting`.
2. **Frozen means every writer is refused while Waiting:** grid autosave, paste, spread, copy-into, import replace,
   and the module input call (ADR-022 D16) all answer `VERSION_NOT_DRAFT`. Tests:
   `BudgetFreezeTest.autosaveRefusedWhileWaiting`, `BudgetFreezeTest.importReplaceRefusedWhileWaiting`,
   `BudgetFreezeTest.moduleInputRefusedWhileWaiting`.
3. **The approver approves what they saw.** Approve carries `If-Match` (version); a mismatch is 409
   `VERSION_CONFLICT`. Test: `BudgetApproveTest.staleVersionRefused`.
4. **Separation of duties covers the whole history.** Editors, importers, generators and the person who asked for
   approval cannot approve; the list is cumulative since creation and survives Send back and Reopen; **Copy carries
   the source version's editors into the new version** (as A4 C-4). Tests:
   `BudgetSeparationTest.editorBeforeSendBackStillRefused`, `BudgetSeparationTest.copyCarriesSourceEditors`,
   `BudgetSeparationTest.requesterCannotApprove`, `BudgetSeparationTest.importerCannotApprove`.
5. **The opt-out stays visible.** Turning separation off needs SETTINGS, is audited with who and when, and every
   version approved by its editor shows "Approved by its editor" and appears in the self-approval report. Test:
   `BudgetSeparationTest.optOutAuditedAndShownOnVersion`.
6. **Official and events only from Approved.** Make official is refused in Draft and Waiting;
   `accounts.budget_version.approved` is written only on the move to Approved. Tests:
   `BudgetOfficialTest.waitingCannotBeOfficial`, `BudgetEventsTest.noApprovedEventOnAskForApproval`.
7. **Audit and isolation.** ASK_APPROVAL, WITHDRAW, SEND_BACK (reason), APPROVE, REOPEN (reason) are audit events
   with actor and version; "Waiting for you" counts only the caller's company and only versions they may approve.
   Tests: `BudgetAuditTest.lifecycleEventsRecorded`, `BudgetWaitingForYouTest.ownCompanyAndNotOwnEdits`.
8. **Note for stage 2 (no build now).** When budget control (ADR-022 D11–D19) is switched on, an approved version
   becomes a spending limit; decide then whether budget approval gets an approval-limits kind. Stage 1 keeps one
   step with `ACCOUNTS.BUDGET.APPROVE`.

---

## Summary

| Item | Proposal | Verdict | Key conditions |
|---|---|---|---|
| SP-1 | Approve a spreading schedule once (two people, journal limits); the job posts each period | ACCEPT WITH CONDITIONS | Moving or re-posting a period needs a non-writer approver (1); Opening balance bounded by the ledger balance (2); job posts the frozen approved snapshot with `ScheduleApproval` evidence, closed exception list (3, 4); Pause by any APPROVE or REVERSE holder (5); one live journal per schedule and period plus the posted + remaining invariant (9) |
| A7 | Re-run a month by reverse and recreate; one live run per rule and month | ACCEPT WITH CONDITIONS | Partial unique index incl. unposted journals (1); refused in a closed or locked month, RV on the original date (2); atomic and retry-safe (3); own runs and their reversals excluded from the source (4) |
| A8 | The schedule's switcher and every writer cannot post its journals | ACCEPT WITH CONDITIONS | Authors of the key version used are contributors of that run's journal (1); contributors written at run time (2); job never posts (4) |
| B5 | Budget state "Waiting for approval"; ADR-022 D3 amended | ACCEPT WITH CONDITIONS | All writers refused while Waiting (2); `If-Match` on Approve (3); Copy carries the source's editors, requester cannot approve (4) |

Spec changes these conditions need before the briefs: spreading spec §4.3 (row actions and Pause), §7 R-2, R-3, R-8,
R-10, §2; A4 contract C-3 / D-108 wording; allocations spec §2 (key-version authors) and §7 (reversals excluded,
closed month); ADR-022 D3 and budgets spec §4.7, §9.
