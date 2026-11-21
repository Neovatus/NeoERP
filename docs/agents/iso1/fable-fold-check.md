# ADR-026 fold check

Reviewer: Fable 5.2 (high), fold check
Reviewed: e3d0a17c6436438d12e924f18e7533a39783d2ac
Verdict: FIX

Scope: fixes only. Compared `docs/agents/iso1/fable-decisions.md` with the folded draft (`docs/drafts/ADR-026-row-level-security.md`) and the fold record (`fold-fable.md`) on `phase/4-b2-iso1b`. Code checked read-only on `NeoERP-BackEnd` `phase/4` at d0dd5441. `ACC` is `services/accounts-service/src/main/kotlin/com/neovatus/accounts`.

## Result

All 39 points are in the draft and each says what I meant. The three corrections are right. The verdict is FIX for one reason that matters and six small text fixes: the draft replaces an order Jabran recorded, and it must ask him instead. Two of the small fixes are gaps in my own views that the fold carried over faithfully; I name them as mine.

## The three corrections

| Correction | Against the code | View |
|---|---|---|
| D3: the domain-event append already takes the scope first | True: `DomainOutboxRepository.append(scope, event)` (`ACC/application/port/outbound/audit/AuditOutboxRepositories.kt:111-116`). My sentence was wrong for that port. The drafter's conclusion is also right: the port is on the system allowlist, so the aspect does not wrap it. | Correct. Keep the fold. One addition under F7. |
| D8: local accounts-service uses the app role only when `ACCOUNTS_DB_USER` is set | True: `scripts/run-all-services.sh:110-118` switches the datasource user only then, and warns otherwise. My "already connects" was too strong; the reason for one merge still holds for the documented setup. | Correct. |
| D11: the event outbox insert returns rows, so it also needs a company `SELECT` | True: `shared/domain-events/src/main/kotlin/com/neovatus/events/producer/jdbc/JdbcOutboxStore.kt:33-45` inserts with `RETURNING` inside a CTE, and Postgres checks returned rows against the `SELECT` policy. The same statement inserts the delivery rows, which the draft also covers. | Correct. Either option in the draft is safe; a company reading its own pending events is not a tamper risk. |

The drafter's own finding (the audit dispatcher runs single statements outside a transaction, `AuditOutboxJdbcAdapter.kt:16-20`) is true and the fix is right.

## Jabran's recorded order

Jabran recorded: "RLS order: Accounts first (R1–R3), then Payroll/HR from their first migration (R4)". My rollout lets R4 start after R1 and run beside R2+R3.

- **Read as a build sequence, my rollout contradicts it.** Under my order HR v2's first migration can be applied before the Accounts RLS migration is merged. That is a change to his recorded answer. It was my view for him to decide, not a settled change.
- **Read as "Accounts gets the wall first and is finished first", it is compatible.** The shared binder is built and reviewed first (R1), the Accounts lane is first in line, Accounts R2+R3 still land before the penetration test and before any customer, and HR/Payroll never have a migration without RLS.
- **Why I still recommend it:** the same day he recorded that the rebuild starts now in parallel. A strict "R1–R3 first" holds the HR v2 build behind the largest money and security step of this ADR. The cost of my order is one possible follow-up migration in HR v2 if Accounts shows the policy shape must change.

Only Jabran can say which reading he meant.

## Fixes

| # | Fix | Where | Why |
|---|---|---|---|
| F1 | Do not present the order as changed. §4 says "Order changed" and the Q1 note says his order "is replaced by §4". Make it a question in §7 (in D10 or a new row): **(a)** strict, as recorded: HR v2's first migration waits for Accounts R2+R3; **(b)** recommended: R4 after R1, beside R2+R3, with Accounts R2+R3 done before the pen test. Until he answers, the recorded order stands. The fold record asks him to confirm, but the draft itself does not. | §4 intro; Q1 note; §7 D10 | A draft cannot replace an answer Jabran recorded. |
| F2 | The "no mixing of bind kinds" rule needs one clarification (my gap). The shared inbox processor marks the inbox row DONE inside the handler's company transaction, on purpose, so a lost lease rolls the change back (`shared/domain-events/src/main/kotlin/com/neovatus/events/consumer/InboxProcessor.kt:105-115`). So: the processor binds the company from the scope it opens, at the start of that transaction, and the consumer inbox table has a company `SELECT` and `UPDATE` policy for that mark. Without it, a handler that runs no SQL leaves no bind, the mark changes 0 rows, the row reads as "claim lost" and retries for ever. No service uses this processor yet; HR v2, Payroll v2 and reporting will. | M3 no-mixing bullet; M6; R1 | Otherwise the rule breaks ADR-019's one-transaction guarantee in R4. |
| F3 | R7 says "RLS on its company rows" for audit-service. Narrow it (my gap, same words in my D2): the table that holds the payloads is `audit_events`. Notifications and workflow items are read per user across companies (`NotificationController.kt:54,66`; RULES §15, one inbox), so they need a per-company loop or stay on application checks. R7 must say which, and its size depends on it. | M8; R7; D2 | As written, R7 would break the one-inbox read or be sized wrong. |
| F4 | Three leftovers that now contradict the folded text: (1) §5 test 5 still requires a `company_isolation` policy on `audit_outbox`, while M6 names it `company_audit_insert` and makes it insert-only, and the event outbox has insert plus select; (2) §6 Positive still says a missed filter "returns nothing"; on company-only tables it is now an error; (3) M5 says `FORCE` "only guards against accidental use of the owner connection" and the next paragraph gives it a second purpose. | §5.5; §6; M5 | Internal consistency. |
| F5 | "No setting means an error on company-only tables" is true only when the query meets a row. Postgres evaluates the policy's sub-select on first use, so an unbound read of an empty table, or a lookup that finds no row at all, returns nothing without an error. That is harmless (there is nothing to hide), but the summary and test 2 state it as absolute; test 2 must seed a row in every table. | Summary; M4; §5.2 | Otherwise test 2 fails on empty tables for the wrong reason. |
| F6 | The backup role is described as "logical backup and restore only" and "read-only". A read-only role cannot restore. Say: the backup role is read-only and dumps; restore is a runbook step with its own tested path (P-7, P-22). | M5 roles table | Small contradiction. |
| F7 | Two small additions to folded points. (1) Key rotation: the loop over `accounts_setups` assumes that list is complete, and no foreign key ties suppliers or customers to it (`V31__c_payables.sql:37-101`, `V26__b_receivables.sql:39-94`). Before an old bank key is retired, the "0 remaining" count is confirmed once by the checks role, which sees every row. (2) The scope-first append should bind inside the shared `DomainEventWriter` as well, so HR v2 and Payroll v2 get it without repeating the Accounts port split. | M6 inventory; M3 last bullet | The first closes the one path where a wrong zero loses data. |

## Not fixes, for Jabran to weigh

- R7 is dated "before the first production customer". By the same reasoning as D10, it is better finished before the penetration test, so the test sees the final shape.
- `ApprovalProposalQueue` reads pending proposals, which is a business table. Of the two options M6 leaves to the R2 brief, only the per-company loop fits the rule "company selection reads `accounts_setups` only"; a system policy there would be a named exception he should see.
