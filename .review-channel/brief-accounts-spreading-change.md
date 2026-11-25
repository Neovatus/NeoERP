# Brief: change (flow 2 of 2) · branch `accounts/spreading/change` → `accounts/spreading/feature` · BackEnd + App · review: Opus 5.5 high

Read first: `docs/PRINCIPLES.md` and `docs/templates/brief.md`. Every section of the template applies: who you are, how the brief works, rules decided before the build, no helper agents, time and progress, batched runs, before hand-back, done means complete, every caller, contract first, test data ready from the start. Also read `docs/templates/done.md` and `docs/templates/tester.md` ("Messages must explain"). **This brief is a frame, not a fence.**

**How it runs (workflow v2 §5):** one flow-lead session runs every stage with a new agent, one at a time, with no helper agents:
- Opus planner;
- Opus BE builder (money flow);
- then, only after the BE is accepted, the Opus App builder (D-88, strict order);
- Opus 5.5 high reviewer;
- Sonnet tester;
- Sonnet fixer (Opus for a money fix).

**Where the work happens (D-92):** in Jabran's checkouts `NeoERP-BackEnd` / `NeoERP-App`, not worktrees. Cut `accounts/spreading/change` from `accounts/spreading/feature` (clean tree first), push it, and open its draft PR into the feature (D-93). This is the one exception to D-95 (flows straight to `main`): spreading isn't on `main` yet, so flow 2 builds on the feature, and the feature goes to `main` in one PR after flow 2 is tested.

**Who answers questions:**
- **Builder:** decides code-level questions within the standards.
- **Flow lead:** checks the rest (industry, law, our rules, the spec) and decides the clear ones in `docs/agents/spreading/decisions.md`.
- **Module lead:** gets brief changes, approved-decision changes and disagreeing sources.
- **Jabran:** gets only critical points.

Messages to the module lead only at stage ends.

## Goal
An accountant can correct an approved spreading schedule without touching the books by hand:
- change it (as a new version, approved again);
- end it early;
- pause and resume it;
- reverse one period's journal and post it again;
- move a waiting period into the next open period.

At period close they see what didn't post and a reconciliation of each prepaid or deferred-income account against the ledger.

## Decided rules (sources; don't reopen)
- **Spec AC-SPR** (`NeoERP-App/docs/design/specs/accounts-spreading.md`): §4.3 (change and end dialogs), §4.4 (detail actions), §4.6 (period close row and reconciliation), §6, §7 (R-5 to R-10), §9, §10, §11, §13.
- **Already decided** (14 items): section 1 of `.review-channel/spreading-flow2-rules-check.md`, with Fable conditions c1 to c13 (`docs/drafts/fable-check-4b-money-decisions.md`).
- **D-96** (`.review-channel/lead-decisions.md`): O1 to O12, including **O2**, approved by Jabran.
  - **O2:** lowering the remaining amount names its route: credit note already posted, or one release journal in the current open period.
  - **O4:** v1's unposted runs become `SUPERSEDED`.
  - **O5:** Resume catches up in date order.
  - **O6:** a later-fiscal-year move gets a warning, not a block.
  - **O1:** reversal happens from the schedule detail.
  - Spec texts R-8 and R-10 are aligned with these.
- **Earlier decisions:** D-82 and D-91 G4 (dimension conflicts after approval: FAILED + Needs you; the job never drops or fills a value); D-90 (rounding, cap, defaults, retention ≥ 10 years); FL-1 to FL-11 (`NeoERP-BackEnd/docs/agents/spreading/decisions.md`).
- **Every refusal and "Needs you" message** says why, shows the numbers and says what to do (tester template).

## Scope
**In:**
- change as a version, raising or lowering the remaining amount (O2), with approval under c6 and c7;
- End early (LEAVE or POST_REST, O8);
- Pause and Resume (c5, O5);
- the dimension-only fix after a failed run (O12);
- reversing a period journal from the detail (O1, E1);
- Post again, retry and posting in the next open period (c1, O6, O7);
- source credited (O10);
- feature-off refusals (c11);
- the History timeline (O11);
- the Period close row and the reconciliation line (§4.6, O9);
- `lastDetails` per version (backlog 519), SKIP audit (511) and the FL-9 move credit line (512).

**Flaws to fix in this flow** (E1 to E4 in the rules check):
- spreading journals can't be reversed today;
- `period_runs` has no `SUPERSEDED` status;
- check `ck_period_runs_posted` with a test.

**Out:**
- the "Needs you" notification (R-15, waits for ADR-025);
- the realtime stream type (waits for `core/realtime` on `main`);
- App F6, F7 and F9 (backlog, unless a screen you touch shows them);
- spec §1 "Out".

**Migrations:** accounts from **V86**, user from **V55**, org from **V44**. V84/V85/V54 are applied and frozen. Check `origin/main` and the feature branch before naming one.


## Definition of Done: the flow works, as the accountant sees it
The flow is done when each action below gives its **output** on the screen and in the books, and each **exception** is refused or waits with a message that says why, shows the numbers and says what to do. Each row is a test (BE + App) and a simulator step.

| # | Action (who) | Output when it works | Exceptions (refused / waits) |
|---|---|---|---|
| 1 | **Change** an approved schedule: amount, end, method, accounts, dimensions (EDIT) | A new version v2 waits for approval; v1 keeps posting until v2 is approved; on approval v1's unposted periods become `SUPERSEDED`, v2's preview periods post from then on; posted periods never change; History shows v1 → v2 with before/after | The approver is a writer of any version → refused (c6). Over the journal limit → two-step approval (c7, larger of old and new remaining). Feature off → refused. Another company → 404. |
| 2 | **Lower the remaining amount** (EDIT) | Route (a), source credited: no journal, the remaining drops. Route (b), release now: one journal in the current open period moves the difference to P&L. The balance account still ties (O2). | Route (a) when no credit note covers it → refused with the amounts. Lowering below what's posted → refused. Raising above the source net → `SOURCE_OVERSPREAD` with the figures. |
| 3 | **End early** (EDIT) | LEAVE: the schedule ends, no journal, the remainder shown as "left on 1749". POST_REST: one journal in the chosen open period posts the rest, approved like a change (O8). | A reason of 5 characters or fewer → refused. A period before the last posted or after today → refused. A closed period → refused with the next open one named. |
| 4 | **Pause / Resume** (pause: APPROVE or JOURNAL.REVERSE; resume: a non-writer APPROVE) | Paused: no period posts; the list shows Paused. Resume: the dialog lists the periods that will post, then they post in date order (O5). | Resume by a writer → refused (c5). Pause without a reason → refused. Pause works even with the feature off. |
| 5 | **Reverse a period's journal** from the schedule detail (JOURNAL.REVERSE) | A reversal journal posts; that period shows Reversed, its amount returns to the remaining, Needs you appears (O1, E1) | Reversing from the journal screen → points to the schedule (source module). No right → the action isn't shown. |
| 6 | **Post again / Post in the next open period / Retry** (a non-writer APPROVE) | A reversed, waiting or failed period posts once (attempt n+1) in the same period, or in the first open period after it with the memo "for Oct 2026"; a later fiscal year gets the IAS 8 warning (O6, O7) | A writer → refused (c1). A locked period → only "next open period" is offered, never a re-date. A second click → no second journal. |
| 7 | **Source credited** (a credit note posts against a spread bill line) | The schedule shows "Source credited" + Needs you; the person changes it (route a) or ends it (O10) | The schedule never changes by itself. |
| 8 | **Fix the dimension** after a run failed on a dimension rule (EDIT) | Only the dimension fields change, logged, with no second person; the run posts on its next try (O12, D-91 G4) | Changing anything else → it becomes a full change (row 1). |
| 9 | **Feature switched off** | Approved schedules keep posting; pause still works | Create, submit, approve, change, move and post again are refused with "Spreading is switched off for {company}". |
| 10 | **Period close** (Finance Manager) | The checklist row shows the count and amount not posted for the period (never blocking). The reconciliation line per balance account ties remaining + ENDED-LEAVE remainders to the ledger, with the difference shown (O9). | A difference ≠ 0 → shown as a warning with "Open account 1749 in the general ledger". |

**These rows are the floor, not the full list.** The planner adds every edge case discovery finds under each row in the plan's test table: code paths, concurrency (two people acting at once, the job running mid-change), boundaries (the last period, the 120-period limit, a 1-cent remainder, a fiscal-year edge), other callers and data states. The builder adds any it meets while building. The reviewer and tester add what's still missing, as findings.

**Always true after every action:** posted (live) + remaining = approved; another company's schedule → 404; an Enter-company session never approves, posts again or resumes; four languages, nothing cut at the largest text; no journal posts twice for one schedule, period and attempt; the job posts only the approved version's runs; nothing is re-dated; every action is in the audit and the History with its actor and reason.

**How it's proven:** the template's UI-test lines (phone + tablet, `assertIsDisplayed`, edit → reopen, a11y) for rows 1–10; the money-invariants check green on the stack; the test data from section 4 of the rules check, run on the stack before hand-back.

**One simulator session on this Mac** covers rows 1–10, dimension rules' 7 steps, and flow 1's leftovers (steps 8, 4, 9, 14 and FE-1 on a fresh database). These are listed in `.review-channel/spreading-feature-end-checklist.md`. The flow lead opens the money steps' screenshots itself before the merge.

## Hand-back
As the template. At the merge, one measures line in `.review-channel/v2-trial-measures.md` with:
- done rows per source;
- questions decided per level (builder, flow lead, module lead, Jabran);
- agents and models;
- tokens per stage;
- the flow lead's context.

Compare it with flow 1. Then report to the module lead and end.

## Never
- `--no-verify`, force push, AI attribution, GitHub workflows; builders don't push, merge or rebase.
- Never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
