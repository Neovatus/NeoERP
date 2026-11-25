# Brief: change (flow 2 of 2) · branch `accounts/spreading/change` → `accounts/spreading/feature` · BackEnd + App · review: Opus 5.5 high

Read first: `docs/PRINCIPLES.md` and `docs/templates/brief.md`. Every section of the template applies: who you are, how the brief works, rules decided before the build, no helper agents, time and progress, batched runs, before hand-back, done means complete, every caller, contract first, test data ready from the start. Also read `docs/templates/done.md` and `docs/templates/tester.md` ("Messages must explain"). **This brief is a frame, not a fence.**

**How it runs (workflow v2 §5):** one flow-lead session runs every stage with a new agent, one at a time, with no helper agents:
- Opus planner;
- Opus BE builder (money flow);
- then, only after the BE is accepted, the Opus App builder (D-88, strict order);
- Opus 5.5 high reviewer;
- Sonnet tester;
- Sonnet fixer (Opus for a money fix).

**Where the work happens (D-92):** in Jabran's checkouts `NeoERP-BackEnd` / `NeoERP-App`, not worktrees. Cut `accounts/spreading/change` from `accounts/spreading/feature` (clean tree first), push it, and open its draft PR into the feature (D-93).

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

**Size:** about 3 500 to 4 500 BE and 3 000 to 3 800 App lines of code. This is one flow, within the per-builder limit.

## Definition of Done
The template's Definition of Done, including the UI-test lines (phone and tablet, `assertIsDisplayed`, edit and reopen, every line kind, a11y), plus:

**Money:**
- posted (live) + remaining = approved after every action;
- no journal posts twice for one schedule, period and attempt;
- a lowered remaining amount always leaves the balance account tied (O2);
- the reconciliation line ties to the ledger, with ENDED-LEAVE remainders shown on their own;
- the money-invariants check is green on the stack.

**Rights:**
- c1, c5 and c6 hold;
- nobody approves their own change;
- feature off refuses everything except pause;
- another company → 404;
- Enter-company sessions can't approve.

**The job:**
- posts only the approved version's runs;
- Resume and moves catch up in date order;
- a locked period is never re-dated.

**Test data, in the plan and run on the stack before hand-back:** the list in section 4 of the rules check, including an Enter-company Owner session and a user without `SPREADING.READ`.

**Simulator test** (this Mac, one session) covers:
- flow 2's own steps;
- dimension rules' 7 steps;
- flow 1's leftovers (steps 8, 4, 9, 14 and FE-1 on a fresh database).

All of these are listed in `.review-channel/spreading-feature-end-checklist.md`. The flow lead opens the screenshots of the money steps itself before the merge.

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
