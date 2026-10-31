# Triage: Codex posting-invariants report

Triaged 2026-10-31 against `report.md` in this folder. Backend `dev` at `2cc8423`, the same revision Codex audited.
I only read the code. Gradle, SQL and tests were not run, and no PROJECT-STATE file was read.

Paths: **K/** = `NeoERP-BackEnd/services/accounts-service/src/main/kotlin/com/neovatus/accounts/`,
**M/** = `.../src/main/resources/db/migration/`, **T/** = `.../src/test/kotlin/com/neovatus/accounts/`.

## Context Codex missed: V11 and the runtime role

Codex says journal immutability starts in V10 and never cites V11. V11 adds two things that change the picture:

- **A deferred balance check.** `trg_journal_entries_posted_balanced` (M/V11__a2_period_control.sql:188–216) refuses to
  commit a journal that becomes POSTED unbalanced. It fires only on `INSERT` of a journal row or `UPDATE OF status`. It
  does **not** fire when a line is added to a journal that was posted earlier.
- **A restricted runtime role.** The service connects as `neoerp_accounts_app`
  (`NeoERP-BackEnd/infra/postgres/initdb/accounts-runtime-role.psql`). That role can read and write data but owns no
  tables, so it cannot `DISABLE TRIGGER`. `RuntimeRoleCheck` refuses to start outside local/test if the role could
  bypass the guards. The ERP lead approved this as V11-7.

So the threat model "anyone with ordinary DML access", which Codex used, is the project's own declared boundary. The
database guards are meant to hold against the runtime role. SQL-only findings are real findings, not hypotheticals.

Two documents are wrong on this point:

- `accounts-a2.md` V11-7 says the runtime role cannot set `accounts.posting_journal_id` outside the engine's
  transaction. That is false: any role can set a custom setting.
- `docs/modules/accounts/journals-and-posting.md` §"Database guards" says "the balance trigger still refuses an
  unbalanced result at commit". That does not hold when lines are added to a journal posted earlier.

## Summary (sorted by severity)

| # | Item | Verdict | Severity | One-line fix |
|---|---|---|---|---|
| F-01 | Setting `accounts.posting_journal_id` lets anyone add lines to any old posted journal | CONFIRMED (worse than reported: V11 does not catch it, and the docs claim it does) | **High** | Record the posting transaction's id (`posted_xid`) on the journal header and allow line inserts only from that same transaction |
| N-2 | (new) A line inserted concurrently into a SUBMITTED manual journal while it posts ends up in the posted journal | CONFIRMED | Medium | Same lock fix as F-07, on `journal_lines_guard` |
| F-07 | A raw SQL edit to an AR line during approval lands in the posted document | CONFIRMED, severity lowered | Medium | Line guards take `FOR SHARE` on the parent document before reading its status (AR, AP and journals) |
| F-05 | SQL can point `reversed_by_id` at an unrelated journal | CONFIRMED, severity lowered | Medium | The update guard requires the target to be a POSTED RV whose `reversal_of_id` is this journal |
| F-04 | A worker whose claim has expired resumes and counts its batch again | CONFIRMED | Medium | Count only first-time approvals (not replays) and stop a worker once it no longer holds the claim |
| F-03 | SQL can rewind or skip a number series | CONFIRMED, with a missed case | Low | Guard both counter tables: UPDATE must be exactly +1, INSERT starts at 1, DELETE refused |
| F-02 | Two credit notes allocated to each other deadlock | CONFIRMED | Low | Filter AR targets by direction and kind in SQL before `FOR UPDATE`, as AP already does |
| F-06 | The first-use check on AR/AP control accounts is "not serialized" | WRONG as a defect | — | None. The result equals a legal order where the JV posts first; at most add a contract note |
| Row 48 | A pinned machine client can make up the names of approving people | By design (contract C-8/C-21) | Decision | See Decisions |
| N-3 | (new) The runtime role can fabricate a brand-new, balanced posted journal and matching balance rows | CONFIRMED (limit of the trigger-based model) | Decision | See Decisions |

**Spot-check of 5 "blocked" rows: all hold.** Rows 26, 30, 31, 38 and 44 are below. Row 33 is stronger than Codex
says, because V11 also enforces balance in the database.

## Details

### F-01: insert into an old posted journal (High, CONFIRMED)

**How it happens.**
- M/V10__a1_journals.sql:312–315 lets a line INSERT through when `current_setting('accounts.posting_journal_id')` equals
  the parent's id. Nothing ties that setting to the transaction that posted the journal.
- The V11 balance check (M/V11:213–216) runs only when a journal becomes POSTED. Adding a line to an old posted journal
  updates no journal row, so the check never runs.
- An attacker with the runtime role's credentials (stolen password, SQL injection) can therefore add **one-sided** lines
  to any posted journal and commit. The trial balance and line-based reports change.
- Detection: if the line has a period, the nightly `LedgerCheckJob` flags FAILED, because line totals no longer match
  the balance rows. A line with a null `period_id` passes `ck_journal_lines_posted`. It is skipped by
  `LedgerCheckJdbcAdapter.kt:47` (`period_id IS NOT NULL`) and by `journal_lines_gl_idx`, so it is never detected, yet
  it still shows in the journal's own detail.
- `PostedImmutabilityTriggerTest.kt:86–88` already performs this insert successfully and then rolls it back.

**Fix: one forward migration (V40).**
1. `ALTER TABLE accounts.journal_entries ADD COLUMN posted_xid XID8`.
2. A `BEFORE INSERT OR UPDATE` trigger on `journal_entries`. When NEW.status = 'POSTED' and the row was not POSTED
   before, it sets `NEW.posted_xid := pg_current_xact_id()` and ignores any value the caller sent. The existing update
   guard already freezes the column once the row is posted.
3. Replace `journal_lines_guard`. Allow an INSERT under a POSTED parent only when `parent.posted_xid =
   pg_current_xact_id()` and `NEW.period_id IS NOT NULL`. Drop the reliance on the setting; it can stay set but is
   ignored.
4. Effect on existing paths:
   - Machine, reversal and in-process posts insert the header POSTED and then the lines in the same transaction: still
     allowed.
   - Manual posts insert their lines before `markPosted` (PostingEngine.kt:656–661), so the parent is not POSTED yet:
     still allowed.
   - Journals posted before V40 have a null `posted_xid`, so no line can ever be added to them.
   - The test fixtures (`YearEndFixture`, `SieExportHarness`, `PostedJournalGuardTest`) insert header and lines in one
     transaction, so they still pass.
5. Correct `accounts-a2.md` V11-7 and the "Limit" paragraph in `journals-and-posting.md`.

**Tests that would prove it.**
- `PostedImmutabilityTriggerTest.oldPostedJournalRefusesInsertEvenWithSetting`: as `neoerp_accounts_app`, in a new
  transaction, set the setting to a committed posted id, INSERT a line with a period and a line with a null period. Both
  are refused with `ACCOUNTS_POSTED_IMMUTABLE`.
- Update `:86–88` to expect refusal.
- `PostedJournalGuardTest.machineAndManualPostStillInsertLines`, as a regression check.

### N-2 (new): concurrent line insert into a manual journal while it posts (Medium, CONFIRMED)

**How it happens.** This is the journal version of F-07, and Codex did not cover it.
- The engine locks the journal `FOR UPDATE`, deletes the draft lines, inserts the posted lines, then runs `markPosted`
  (PostingEngine.kt:656–661).
- Meanwhile a raw INSERT of a line into the same journal starts. Its BEFORE trigger reads the parent status with a plain
  SELECT, sees SUBMITTED, and lets it through.
- The foreign-key check takes `FOR KEY SHARE` on the parent and waits behind the engine's `FOR UPDATE`. Once the engine
  commits, the check passes because the row still exists, and the insert commits.
- The engine's DELETE never saw the uncommitted row. The V11 balance check already ran at the engine's commit.

**Result.** A posted journal with an extra draft-shaped line: null period, the same blind spot as F-01.

**Fix.** In `journal_lines_guard`, read the parent with `SELECT status ... FOR SHARE`. That waits for the engine's lock
and then sees POSTED. The service's own paths already hold the parent lock, so a share lock taken by the same
transaction does not wait. Ship it in V40 with F-01.

**Test.** `PostingLockOrderTest.rawLineInsertDuringManualPostRefused`: two connections. Pause the engine after it locks
the journal, INSERT a line from the second connection, then let the engine commit. The INSERT fails with
`ACCOUNTS_POSTED_IMMUTABLE`.

### F-07: AR line changed during approval (Medium, CONFIRMED; Codex said High)

**How it happens.** This is real.
- `ar_document_lines_guard` (M/V28:23–27) reads the parent's status with a plain SELECT.
- An UPDATE of a non-key line column fires no foreign-key check, so it takes no lock on the parent.
- Approval locks the header (ArDocumentApprovalService.kt:112), reads the lines (:125), and never rewrites ordinary lines.
- A raw UPDATE that commits during that window leaves the stored lines of the posted document different from its
  journal.
- The same pattern exists in the AP line guard (M/V31:1018).

**Why Medium.** It needs runtime-role credentials *and* precise timing against an approval in progress. Every service
path takes the parent lock first, so normal operation never hits it. The journal and the balances stay correct; only
the document's own snapshot is wrong.

**Fix.** In V40, change the parent read in the AR and AP line guards to `SELECT status, kind ... FOR SHARE`.

**Deadlock check.**
- The service always locks the header before touching lines: draft updates, approval, and the credited-counter updates
  under credit-note approval (invoice locked at :127). The trigger's share lock is then the transaction's own lock and
  costs nothing.
- Only an outside writer that already holds a lock on a line and then waits for the parent can deadlock. That writer is
  the attacker, and losing the deadlock is acceptable.

**Test.** `ArImmutabilityTriggerTest.lineUpdateDuringApprovalWaitsThenRefused` and the AP equivalent: pause approval
after `findLines`, run a raw UPDATE of `description` from a second connection, then commit the approval. The UPDATE is
refused.

### F-05: reversal link made up with SQL (Medium, CONFIRMED; Codex said High)

**How it happens.** M/V10:265–268 allows `reversed_by_id` to go once from null to any journal of the same company. The
foreign key checks existence only.

**Impact.**
- The journal is shown as reversed, and the API refuses a real reversal: `ALREADY_REVERSED`, or a replay pointing at
  the wrong journal.
- No amounts change, so this damages the audit trail and blocks corrections; it does not make the books wrong. Hence
  Medium.

**Fix.** In V40's version of `journal_entries_guard_update`, accept the change only if a matching reversal exists:

```sql
EXISTS (SELECT 1 FROM accounts.journal_entries r
        WHERE r.id = NEW.reversed_by_id AND r.company_id = OLD.company_id
          AND r.journal_type = 'RV' AND r.status = 'POSTED' AND r.reversal_of_id = OLD.id)
```

The engine inserts the RV before calling `setReversedBy` (PostingEngine.kt:836–843), and that is the only caller. The
unique index on `reversal_of_id` already allows only one such RV.

**Test.** Rewrite `PostedImmutabilityTriggerTest.updateAndDeleteOfPostedRefusedReversedByIdOnce`:
- linking to an ordinary posted JV is refused;
- linking to an RV of another journal is refused;
- the engine's own reversal still links (`ReversalEngineTest.onceOnlyRvAndYeNotReversible` stays green).

### F-04: approval-run worker resumes after its claim expired (Medium, CONFIRMED)

**How it happens.**
- `side.approve` throws away the approval outcome (ArOpeningImportSide.kt:136 and the AP side :180).
- If another worker already posted the item and the user is the same, the approval returns a replay without error
  (ArDocumentApprovalService.kt:247) and `posted++` runs anyway (OpeningItemImportService.kt:750). If the user is
  different, the result is `ALREADY_APPROVED`, which is counted as `failed`.
- The finishing step adds the counters even when `mine == false` (:769–776). `total` is stretched to fit (:788).

**Impact.** No duplicate journal entries are posted. The run's counters and its `APPROVAL_FINISH` audit record are
wrong.

**When it triggers.** A batch of 200 must stall for more than the 10-minute claim (`CLAIM_LEASE`), so it is rare.

**Fix.**
1. `OpeningImportSide.approve` returns `replay: Boolean`, and only first-time posts are counted.
2. Before each item, check the claim in a short transaction (`claimId` still mine and still live, renewing
   `claimedUntil` each time). If the claim is lost, stop the loop.
3. When `!mine`, write nothing to the counters.

**Test.** `BulkApprovalTest.staleWorkerResumesAfterTakeoverCountsNothingTwice`: a test hook pauses worker A after
`items.next`, the clock moves past the claim, worker B finishes the run, then A resumes. Expect `posted == number of
items` and A stopping with the claim lost.

### F-03: number series rewound or skipped (Low, CONFIRMED)

**What Codex found.** `number_sequences` (M/V6:314) and `document_sequences` (M/V26:19) only check `next_value >= 1`.
- Lowering the value wedges the series: the unique number index refuses the duplicate, and the rollback restores the
  same wrong value.
- Deleting the row resets it, because `INSERT … ON CONFLICT DO NOTHING` recreates it at 1.

**Missed case.** *Raising* the value leaves a silent gap in the legal numbers. That breaks the gapless rule C-6/C-12,
and nothing detects it.

**Why Low.** It needs the runtime role. No duplicate legal number can be committed.

**Fix.** In V40, add a trigger to both tables:
- UPDATE requires `NEW.next_value = OLD.next_value + 1` with the key unchanged. The only writers, the
  `NumberSequenceJdbcAdapter`/`DocumentSequenceJdbcAdapter` `take` functions, always add exactly 1.
- INSERT requires `next_value = 1`.
- DELETE is refused.

A rollback undoes the row change and needs no UPDATE, so it is unaffected.

**Test.** `NumberSequenceGuardTest.rewindSkipDeleteRefused`, run as the runtime role. Keep
`PostingConcurrencyLoadTest.rolledBackPostConsumesNoNumber` green.

### F-02: two AR credit notes allocated to each other deadlock (Low, CONFIRMED)

**How it happens.**
- `AllocationService.kt:128` locks targets through the general `ArDocumentJdbcAdapter.lockAllForUpdate` (:82) and drops
  non-debit kinds afterwards in memory.
- Request A→B and request B→A each hold their source lock and wait on the other's. PostgreSQL detects the deadlock and
  aborts one request, which probably surfaces as a 500 rather than a validation error.
- AP filters in SQL first (`ApDocumentJdbcAdapter.lockTargetsForUpdate` :95–107). PostgreSQL applies the WHERE before it
  locks a row, so AP is safe.

**Impact.** No money is affected. It needs requests that are already invalid.

**Related path checked.** The receipt posting path (`ReceiptPostingService.kt:138`) uses the same unfiltered lock, but
draft allocations are checked at save to be POSTED DEBIT invoices or opening items (`ReceiptRules.kt:262`), and those
fields are frozen once posted. It is safe today. Switch it to the filtered query anyway.

**Fix.** Add `ArDocumentJdbcAdapter.lockTargetsForUpdate` with `direction = 'DEBIT' AND kind IN (DEBIT_KINDS)` in SQL,
ordered by id, and use it in `AllocationService.allocate` and `ReceiptPostingService`.

**Test.** `ReceiptReverseAndAllocationTest.reciprocalCreditNoteTargetsRefusedNoDeadlock`, mirroring AP's
`targetLockTakesOnlyBillsAndOpeningCredits`.

### F-06: first-use check on control accounts (WRONG as a defect)

**The race.** Both paths take `FOR SHARE` on the account, so a manual JV and the first AR posting can commit in either
order.

**Why it is not a defect.**
- The manual JV reads one fact: "no RECEIVABLES journal exists" (`JournalJdbcAdapter.existsPostedFromModules`).
- The AR posting reads nothing that the JV writes.
- With no read–write cycle there is no write skew. The history is equivalent to the legal serial order "JV first, then
  the first AR document". That order the rule allows, and the books are the same.

The only visible oddity: the JV's `posted_at` can be milliseconds after the first AR document. Add no lock. At most, add
a sentence to accounts-a1.md BA-1 saying the cutoff is linearized at the JV's recheck under lock.

### Spot-checks of rows marked "blocked" (all CONFIRMED)

- **Row 26: concurrent machine post with the same key.** PostingEngine.kt:424–439 catches the unique-index violation
  only when `isIdempotencyRace`, then re-reads the winner in a new transaction. The loser's number is rolled back with
  it. Holds.
- **Row 30: reverse twice.** The unique index `uq_journal_entries_reversal_of` (M/V10:145) plus the original's lock and
  the `reversedBy` recheck before `setReversedBy` (:843). Holds. F-05 is the only gap.
- **Row 31: close during posting.** `PeriodControlService.locked` (:119–127) takes the year `FOR SHARE` and then the
  period `FOR UPDATE`. The engine holds the period `FOR SHARE` until commit and re-checks OPEN after locking
  (PostingEngine.kt:1039–1046). Close and posting serialize. Holds.
- **Row 38: two receipts against one invoice.** The receipt is locked, then targets `FOR UPDATE` in id order (:138), then
  the plan is recomputed from the open amounts read under the lock, then the customer `FOR SHARE` (:160). This follows
  the rule (source, then targets in order, then the party last). Holds.
- **Row 44: no gaps or duplicates in numbering.** `NumberSequenceJdbcAdapter.take` locks the row `FOR UPDATE` and
  updates it inside the posting transaction, so a rollback restores the value. The unique index
  `uq_journal_entries_number` is the backstop. Holds against the application. F-03 covers the SQL case.
- **Row 33, a correction.** Balance is also enforced in the database at commit by V11's deferred trigger, which is
  stronger than Codex states. Its tested case is `PostedJournalGuardTest.unbalancedOrOverScaleJournalRefusedAtCommit`.

## Decisions for Jabran

1. **Ship one forward migration V40 "posted-guard hardening" covering F-01, N-2, F-07, F-05 and F-03.**
   *Recommendation: yes, as one backend item with the tests named above.* It consists entirely of database triggers
   plus one column. It is High only because of F-01. The engine needs no code change. The docs need correcting
   (`accounts-a2.md` V11-7 and the "Limit" paragraph in `journals-and-posting.md`).
2. **Fix F-04 and F-02 in code, as one small Accounts item.** *Recommendation: yes, low priority after V40.*
3. **Threat model for the runtime role (N-3).** Even after V40, someone holding `neoerp_accounts_app` credentials can
   insert a new, balanced, numbered POSTED journal (DRAFT → POSTED by UPDATE) and update the balance rows to match.
   Triggers cannot tell that apart from the engine. The real options are:
   - (a) accept it: database guards stop changes to *existing* posted records, and stolen credentials are an
     operations matter;
   - (b) revoke direct DML on journals and balances and post only through `SECURITY DEFINER` functions, which would
     be a large rewrite;
   - (c) add a tamper-evident hash chain over posted journals that the ledger check verifies.

   *Recommendation: (a) now, and write it down in `journals-and-posting.md`. Consider (c) together with SIE/SAF-T
   retention work.*
4. **Row 48: the machine client's approval evidence is trusted.** This is the contract (C-8/C-21). *Recommendation:
   keep it. No change.*
5. **F-06.** *Recommendation: no code change. Optionally add one sentence to BA-1.*
