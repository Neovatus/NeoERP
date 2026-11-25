# Brief: schedule (flow 1 of 2) · branch `accounts/spreading/schedule` → `accounts/spreading/feature` · BackEnd + App · review: Opus 5.5 high

Read first: `docs/PRINCIPLES.md`, `docs/templates/brief.md` (every section applies: "Who you are", "How this brief works", time and progress, batched runs, before hand-back and done means complete, every caller, BE contract first) and `docs/templates/done.md`. **This brief is a frame, not a fence.** It's run by one flow-lead session (D-89), one flow at a time (D-88): BE first, then App.

**Agents per stage (D-89 addendum, Jabran 2026-11-25; table in `docs/process/workflow-v2-draft.md` §5): every stage is a new agent, build included.**
- **Planner (Opus):** discovery plus the plan, reading both repos. The plan and the done list must be complete enough to build from: every caller, every rule decided, every test named.
- **Builder (a new agent):** this is a **money flow**, so the builders are **Opus**. A builder that finds a gap in the plan stops and reports; it doesn't decide alone.
- **Then:** the reviewer and tester, then the fixer, each a new agent.

## Goal
An accountant can spread a prepaid cost or deferred income over periods. Sources:
- a posted bill line;
- a posted invoice line;
- a posted journal line;
- an opening balance.

They see every period's amount before saving. It's approved once, under the company's journal limits. Then each period's journal posts itself on the period's last day, and the amount released always equals the source.

## Decided rules (sources; don't reopen)
- Spec AC-SPR, `docs/drafts/spec-4-15-spreading-schedules.md` (workspace; the App lane moves it to `NeoERP-App/docs/design/specs/accounts-spreading.md`): §1 scope, §2 permissions, §4.1–4.5 screens, §6 money, §7 rules, §8 wording, §9 refusals, §10 API sketch, §11 audit, §12 Nordic/PK, §14 App tests.
- **SP-1 to SP-10 as recommended in spec §13** (Jabran approved): one approval, then the job posts due periods as the approver's authority; one journal per schedule per period; P&L source lines allowed; Equal and By days; the shared `period_runs` table (kind `SPREADING`, ready for `ALLOCATION`); closed period → Wait / Needs you; journal limits on the remaining amount; feature off keeps approved schedules posting; pack roles `PREPAID_COST` / `DEFERRED_INCOME`; `ACCOUNTS.SPREADING.READ/EDIT/APPROVE`.
- **Fable conditions (Jabran accepted 2026-11-22, `docs/drafts/fable-check-4b-money-decisions.md`):**
  - **SP-1 c2:** an opening-balance source is capped by the balance account's ledger balance, shown on the approval card. In this flow.
  - **c1** (post in the next open period / post again need a non-writer APPROVE holder) and **c5** (any APPROVE or JOURNAL.REVERSE holder can pause at once) are flow 2. Keep the model ready for them.
- **Dimension rules (just built on this branch):** the spreading journals' lines obey D-82 and the account rules. The release line takes the schedule's dimensions; the balance line inherits from the source line.
- **Rounding:** the last period takes the remainder, so the sum equals the source to the cent (spec §6).
- ADR-027 flow endpoints and contract rules; the footer order; no window-width reads; four languages; RULES §3/§7/§8 company isolation.
- Industry standard where the spec is silent (D-82 standing rule): name the reference systems in your plan.

## Scope edges
- **In (flow 1):**
  - create from each source kind;
  - the preview, live in the editor;
  - Draft → approval (journal limits) → Approved;
  - the `period_runs` table and the job that posts due periods;
  - the list, editor and detail (§4.1–4.4);
  - the entry points on bill, invoice and journal lines (§4.5), and a draft bill line's "Spread over periods";
  - the pack roles, the permission codes, audit, demo data with the awkward cases;
  - user-guide and developer pages.
- **Out (flow 2 `change`):**
  - change as a new version, end early, pause, post again after a reversal;
  - post in the next open period (c1, c5);
  - closed-period handling beyond "Wait / Needs you";
  - feature off;
  - the Period close row and reconciliation line (§4.6).
- **Out entirely:** spec §1 "Out" list.
- **Migrations:** accounts from **V84**, user from **V54**, org from **V44** (V80–V83, V52–V53 and V42–V43 are taken by dimension-rules and `core/realtime`). Check `origin/main` and both feature branches before naming one.

## Definition of Done
The template's Definition of Done, including its UI-test lines, plus:
- **Money:**
  - released total = source on every method, period count and start rule (Equal / By days, Full / From the start date, a 29-day February, 1 cent over 3 periods);
  - no journal posts twice for one schedule and period (job retry, two job instances);
  - `money-invariants` green (the old Mac runs the script on the stack; name the test that proves the sum).
- **Rights:**
  - EDIT creates, APPROVE approves under the limits, nobody approves their own;
  - another company's source or schedule → 404;
  - a stand-in follows the existing stand-in rules.
- **The job:** posts on the period's last day as the approver's authority (SP-1). A closed period gives Wait / Needs you, never a re-date.
- **App:**
  - a Compose UI test of create → preview → submit, at phone and tablet;
  - the approval card shows the SP-1 c2 cap for an opening balance;
  - size tests en/nb/sv/da.
- **Simulator test:** on the old Mac until Jabran OKs the AXe install here. The flow lead writes the steps and asks for the slot in `docs/inbox/erp-lead.md`.

## Hand-back
As the template. **Measures line (first full trial of D-87 to D-89; Jabran):** at the merge, one line in workspace `.review-channel/v2-trial-measures.md`, section "Trial of D-87 – D-89", with:
- the done rows per source (brief / discovery / plan / review / tester);
- the rows caught at the plan check;
- the plan gaps the builder stopped on;
- the findings that were a missing row;
- the agents and models per stage;
- the flow lead's context at the merge. The flow lead merges the flow into `accounts/spreading/feature`, writes its measures line in `.review-channel/v2-trial-measures.md`, reports to the module lead, and ends.

## Never
- `--no-verify`, force push, AI attribution, GitHub workflows, writes in the other repo; builders don't push, merge or rebase.
- Never edit an applied migration.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
