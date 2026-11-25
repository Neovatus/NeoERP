# Brief: change (flow 2 of 2) · branch `accounts/spreading/change` → `accounts/spreading/feature` · BackEnd + App · reviews: backend, then App (D-97)

Read first: `docs/PRINCIPLES.md` and `docs/templates/brief.md`. Every section of the template applies. Also read `docs/templates/done.md` and `docs/templates/tester.md` ("Messages must explain"). **This brief is a frame, not a fence:** discovery, the plan and the build are yours, end to end, in both repos.

**Where the work happens (D-92, D-95 addendum):**
- In Jabran's checkouts `NeoERP-BackEnd` / `NeoERP-App`.
- Cut `accounts/spreading/change` from `accounts/spreading/feature`, push it, and open its draft PR into the feature (D-93).
- Spreading reaches `main` as one PR after this flow is tested.

**Open questions:** first check the decided rules and sources below (spec, rules check, decisions) and the industry standard (named ERPs and the law), the same way they were collected. If the answer is clear and fits what's decided, decide it yourself and record it with its source. Raise it only when it would change a decided rule, the scope or the contract, or when the sources disagree.

## Goal
Today an approved schedule can't be corrected: a wrong amount, an early end, a closed period or a reversed journal leaves the accountant fixing the books by hand, and the period close can't show whether the prepaid and deferred-income accounts are right.

After this flow, an accountant can:
- change an approved schedule (a new version, approved again);
- end it early;
- pause and resume it;
- reverse one period's journal and post it again;
- move a waiting period into the next open period.

At period close they see what didn't post, and a reconciliation of each balance account against the ledger. The books stay traceable, as the bookkeeping rules require: every correction is a new, documented entry.

## Decided rules (sources; don't reopen)
- **Spec AC-SPR** (`NeoERP-App/docs/design/specs/accounts-spreading.md`): §4.3, §4.4, §4.6, §6, §7 (R-5 to R-10), §9, §10, §11, §13.
- **Already decided** (14 items): section 1 of `.review-channel/spreading-flow2-rules-check.md`, with Fable conditions c1 to c13 (`docs/drafts/fable-check-4b-money-decisions.md`).
- **D-96** (`.review-channel/lead-decisions.md`): O1 to O12, including O2 (Jabran), plus the D-96 addendum (reversal date, feature off, pending changes).
- **Where the spec text differs from these decisions,** the decisions win, and the App lane updates its spec copy in this flow:
  - R-8 "A1 Reverse" becomes reversal from the schedule detail (O1);
  - R-10 "new remaining" becomes the larger of old and new remaining (c7);
  - §4.3 Post again by EDIT becomes a non-writer APPROVE holder (c1).
- **Earlier decisions:** D-82 and D-91 G4 (dimension conflicts after approval); D-90 (rounding, cap, defaults, retention ≥ 10 years); FL-1 to FL-11 (`NeoERP-BackEnd/docs/agents/spreading/decisions.md`).
- **Known flaws to fix in this flow:** E1 to E4 in section 5 of the rules check.
- **Screens with no spec layout** (Pause/Resume, the reversal confirm, History): build them from the design system's existing dialog and timeline patterns, the same way as the change and end dialogs in §4.3. That's the builder's call, recorded as a decision, not a stop.

## Scope edges
- **Other areas' code you will touch:**
  - the shared posting and reversal path (a spreading reversal must not open reversal of other source modules' journals from the journal screen);
  - AP/AR credit-note posting (only to flag a credited source);
  - the Period close checklist;
  - the journal detail (it points to the schedule).
- **Other areas' behaviour must not change:** prove it with their existing tests.
- **Contract:** publish the whole flow-2 contract with its examples first (template). New values such as the `SUPERSEDED` run status are additive.
- **Out:**
  - the "Needs you" notification (R-15, waits for ADR-025);
  - the realtime stream type (waits for `core/realtime` on `main`);
  - App F6, F7 and F9 (backlog, unless a screen you touch shows them);
  - spec §1 "Out".
- **Migration numbers:** V84/V85/V54 are applied here and frozen. `core/realtime` has reserved accounts V82/V83, user V53 and org V43, so flow 2 starts at accounts V86, user V55, org V44. Check `origin/main` and the feature branch before naming one.

## Definition of Done: the flow works, as the accountant sees it
Each action below gives its **output** on the screen and in the books. Each **exception** is refused or waits, with a message that says why, shows the numbers and says what to do. **These rows are the floor:** discovery and the plan add every edge case under each row (code paths, two people at once, the job running mid-action, boundaries, other callers, data states).

| # | Action (who) | Output when it works | Exceptions (refused / waits) |
|---|---|---|---|
| 1 | **Change** an approved schedule: amount, end, method, P&L account, dimensions, memo (EDIT) | v2 waits for approval while v1 keeps posting. On approval, v1's unposted periods become superseded, and v2's periods post from then on. Posted periods never change. History shows v1 → v2 with before and after. The dialog says that past periods keep their account, and that a reclassification journal fixes them (O3). | The approver is a writer of any version → refused (c6). Over the journal limit → two-step approval on the larger of old and new remaining (c7). A change already waiting → a second one is refused. v2 rejected or withdrawn → v1 carries on unchanged. Another company → 404. |
| 2 | **Lower the remaining amount** (EDIT) | Route (a), source credited: no journal, the remaining drops. Route (b), release now: one journal in the current open period moves the difference to P&L. The balance account still ties (O2). | Route (a) with no credit note covering it → refused, showing the amounts. Below what's already posted → refused. Raising above the source line's net → `SOURCE_OVERSPREAD` with the figures. |
| 3 | **End early** (EDIT) | LEAVE: the schedule ends with no journal; its remainder shows as "left on {balance account}". POST_REST: one journal in the chosen open period posts the rest, approved like a change (O8). | A reason shorter than 6 or longer than 500 characters → refused. A period before the last posted one or after today → refused. A closed period → refused, naming the next open one. |
| 4 | **Pause / Resume** (pause: APPROVE or JOURNAL.REVERSE holder, with a reason; resume: a non-writer APPROVE holder) | Paused: no period posts, and the list shows Paused. Resume: the dialog lists the periods that will post, then they post in date order (O5). | Resume by a writer → refused (c5). Pause without a reason → refused. |
| 5 | **Reverse a period's journal** from the schedule detail (JOURNAL.REVERSE) | A reversal journal posts: in the original period if it's open, otherwise in the first open period with the memo "reversal for {period}" (D-96 addendum). That period shows Reversed, its amount returns to the remaining, and the schedule shows Needs you (O1, E1). | No right → the action isn't shown, and the server refuses it. A reversal from the journal screen → points to the schedule. |
| 6 | **Post again / Post in the next open period / Retry** (a non-writer APPROVE holder; the Owner only with the 4.11 switch, recorded as own approval, c1) | A reversed, waiting or failed period posts once (attempt n+1), either in its own period or in the first open period after it with the memo "for {period}". A later fiscal year gets the IAS 8 warning (O6, O7). | A writer → refused (c1). A locked period → only "next open period" is offered, never a re-date. A second click → no second journal. |
| 7 | **Source credited** (a credit note posts against a spread bill or invoice line) | The schedule shows "Source credited" and Needs you; the person changes it (route a) or ends it (O10). | The schedule never changes by itself. |
| 8 | **Fix the dimension** after a run failed on a dimension rule (EDIT) | Only the dimension fields change, logged, with no second person. The run then posts when a non-writer APPROVE holder posts it again (O12, O7, D-91 G4). | Changing anything else → it becomes a full change (row 1). |
| 9 | **Feature switched off** | Approved schedules keep posting. Pause and reversal from the detail still work (D-96 addendum). | Create, submit, approve, change, End early, Resume, move, Post again, Retry and the dimension fix are refused with "Spreading is switched off for {company}". With FINANCE off or the books not live, the job skips and catches up later (c11). |
| 10 | **Period close** (Finance Manager) | The checklist row shows the count and amount not posted for the period, and never blocks. The reconciliation line per balance account ties remaining plus ENDED-LEAVE remainders to the ledger, with the difference shown (O9). | A difference other than 0 → a warning with "Open account {balance account} in the general ledger". |

**Always true after every action:**
- posted (live) + remaining = approved;
- at most one live journal per schedule and period;
- the job posts only the approved version's runs;
- nothing is ever re-dated;
- rights are checked on the server, not only hidden in the App;
- another company's schedule → 404;
- an Enter-company session never approves, posts again or resumes;
- every action is in the audit and the History, with its actor and reason;
- versions, snapshots and runs are never hard-deleted (≥ 10 years, D-90);
- four languages, with nothing cut off at the largest text.

**Proven by:**
- a BE and an App test per row and per edge case (the template's UI-test lines);
- the money-invariants check green on the stack;
- one simulator session on this Mac covering rows 1–10, plus the carried tests in `.review-channel/spreading-feature-end-checklist.md`;
- the test data in section 4 of the rules check, run on the stack before hand-back.

## Hand-back
As the template. At the merge, one measures line in `.review-channel/v2-trial-measures.md`, compared with flow 1:
- questions decided per level;
- agents and models;
- tokens per stage;
- the flow lead's context.

## Never
- `--no-verify`, force push, AI attribution, GitHub workflows; builders don't push, merge or rebase.
- Never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
