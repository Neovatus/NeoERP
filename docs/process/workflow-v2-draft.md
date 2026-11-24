# NeoERP workflow (v2 DRAFT, 2026-11-24, D-81)

> DRAFT, revised after the independent check (`.review-channel/workflow-v2-independent-check.md`). When Jabran approves it,
> it replaces `WORKFLOW.md`; the old text moves to `docs/process/archive/WORKFLOW-v1.md` (history, never read as rules).
> Read [PRINCIPLES.md](../PRINCIPLES.md) first.

This page says how work flows. **What good product looks like** lives in the standards, not here:
domain `docs/domain/RULES.md`; design `NeoERP-App/docs/design/` (`screen-standard.md`, `ux-principles.md`, tokens,
`specs/building-blocks.md`); code per repo `ARCHITECTURE.md` and `AGENTS.md`; the gate `docs/operations/verify.md`; QA `docs/qa/qa-guide.md`.
**Why** a rule exists lives in `.review-channel/lead-decisions.md` (history). When a case is not covered, apply the principles.

## 1. Who decides
- **Jabran:** product scope, money and statutory rules, design approval (no build before the screen design and contract are approved), sign-in/login changes, this workflow, anything a failed gate or an unresolved FIX leaves open.
- **Module lead** (new Mac: Accounts, D-61 trial; old Mac: HR/Payroll): the module plan, briefs, plan checks, merges into its feature branches.
- **Integration lead** (old Mac): every feature → `main`, `core/*` work, shared code.
- **Builder:** everything inside the standards and the brief's goal, recorded as decisions. Stops and asks for: money rules, product scope, a BE↔App contract change, a new pattern where one exists, a write outside its repo. Approved spec decisions are never reopened (a needed change is a note to the lead).
- **Builders commit; only leads push.**

## 2. Branches: module → feature → flow
```
main
 ├── accounts/dimension               simple: one branch, one PR; flows done in order inside it
 ├── accounts/budgets/feature         split: the feature branch (one PR to main)
 │     ├── accounts/budgets/entry     flow → merged into accounts/budgets/feature
 │     └── accounts/budgets/approval
 ├── hr/payroll-posting               cross-module: owned by the module whose user flow it delivers
 └── core/phase-4-fixes               shared work (auth, user, org, audit, outbox, platform)
```
- The prefix names the **owner**; a branch may change other modules' code (the BackEnd is one repo). The plan names every module touched; that module's lead reads its part in the review.
- The plan says simple or split before building. Same branch name in both repos when a feature needs both.
- Two features touching the same files don't run in parallel. Every feature merges `main` in (merge commit) before its PR.
- **Only `main` is hook-protected** (as today). Feature and flow branches need no hook (Jabran 2026-11-24): builders don't push, the lead runs the gate before every merge into a feature branch, and the whole suite runs before every PR to `main`.
- Never `--no-verify`, never force push (also not `--force-with-lease`), no AI attribution in commits, PRs or comments.
- **Close checklist** (lead, before a feature PR): every flow merged, no flow branch or worktree left, gate pushes from the worktree that ran it, record written.

## 3. A feature (the unit that goes to `main`)
1. **Plan** (module lead; Jabran reviews the module plan): the flows, simple or split, order, owner and touched modules, review model, test-session slots.
2. **Flows run one after another** (or in parallel on flow branches when no files are shared). Each flow follows §4.
3. **Feature end:** every flow merged → **feature review** (§6, reads the whole feature in both repos) → fixes (one fixer per repo, §4 step 6) → **whole suite** in both repos with `main` merged in → MERGE verdict → PR to `main` with a merge commit → checkouts fast-forwarded.
For a feature with one flow, the flow review is the feature review.

## 4. A flow: six steps (Jabran 2026-11-24)
| # | Step | Who | Done when |
|---|---|---|---|
| 1 | **Brief:** goal, rules, Definition of Done (§5), links to the standards; "not a limit" ([template](../templates/brief.md)) | lead | written |
| 2 | **Discover, plan, implement and test the flow:** reads both repos, finds every path and writer, writes the plan, builds BE first then App, writes the tests for all cases and runs **only the tests of what it implemented** | builder, one per repo | the flow works end to end; its tests pass; hand-back with plan, decisions, "found outside the brief" |
| 3 | **Review and test:** code review of BE + App together; screen tests (UI flow, sizes in en/nb/sv/da); simulator test of the flow | reviewer (**one Opus 5.5 at high effort**, every flow) + tester agent | findings listed, or approved → step 6's merge |
| 4 | **Set the goal again:** the findings become a fix brief | lead | written |
| 5 | **Fix:** the **same builder** (resumed) implements the fixes, each with a failing-first test, and runs only those tests. It checks its work against the Definition of Done again and writes, per finding, **how it was missed and why** (which DoD line, brief gap or wrong assumption) | the same builder, one per repo | its tests pass; the "missed and why" list is in the hand-back |
| 6 | **Review and test again** (only after a HIGH; MEDIUM fixes are proven by their tests and merged, Jabran 2026-11-24) (same reviewer and tester, on the fixes and the flow they touch) → **approved → merged into the feature branch** (no gate run per flow); not approved → back to step 4 | reviewer + tester; lead merges | `Verdict: ACCEPT` |

**Finding validity (Jabran 2026-11-25):** the reviewer marks each finding **CONFIRMED** (failing test, reproduction, or both sides of the seam read with file:line) or **PLAUSIBLE**; a finding without a concrete failure is not reported. Only CONFIRMED HIGH/MEDIUM block; PLAUSIBLE ones go to the builder to check. The builder's first step per finding is the failing test: it fails on the old code → valid, fix it; it can't be made to fail → "not valid, because …" with evidence; the reviewer accepts or answers once with proof; still disagreeing → the lead decides. The lead counts invalid findings per reviewer and fixes the review brief where they repeat. **Re-review rule (Jabran 2026-11-24, no loops):** after the first review: ACCEPT → merge; only LOW → backlog, merge; MEDIUM → the same builder fixes each with a failing-first test, the lead checks the tests exist and pass, merge, **no re-review**; HIGH → fixed with a test, **one re-check of the HIGH fix only** by the same reviewer; if that still fails → **stop**: the lead decides or asks Jabran. **Never a third review.** **Steps 3–6 are scoped to the flow, not the feature** (Jabran 2026-11-24): the review reads the flow's changes; screen tests cover the flow's screens; the simulator runs the flow's own steps (none for a flow without screens); fixes and the second review and test cover only what the fixes touched. The **simulator test runs per flow** (Jabran 2026-11-25); the feature's end is only the feature review (code and flows together). After two rounds of steps 4–6 without approval, the lead decides or asks Jabran. Tooling and gate work runs the same steps with a done line and a time box. Tooling Definition of Done also: counts and identity checks on the current `main`; tests are judged by what they check, not what they name.

## 5. Definition of Done (every flow; the brief adds its own lines)
1. The flow works end to end in both repos for **every path and every writer** discovery found.
2. **Tests for all cases**, from a test table written before the code (case → expected → test name):
   success and each variant · refusals with the right error code · edge values (empty, zero, negative, very large, rounding, max length, period edges, closed period, other currency) · rights and company (no permission, another company, stand-in, feature off) · repeats and races (double submit, retry after timeout, same event twice, two users, two accounts with the same value) · **contract** (BE accepts the published examples; the App sends exactly them; the App reads responses where a field is **an explicit `null`**, missing or empty, and an unknown enum value, without breaking) · screens (Compose UI flow test; size tests in en, nb, sv, da with the automated accessibility checks: labels, selected state, 44-pt targets, unique element ids, required `*` ⇔ announced; a "required fields" case per form; error and empty states).
3. Each fix has a test that fails on the old code.
4. Standards kept: nothing duplicated ("where else?" answered: fixed / not affected / left because …), architecture kept, every deviation written down.
5. Feature checklist: release flag, permissions and company scope (every query scoped; Payroll keeps the company column), demo data with the awkward cases, user-guide and developer pages (or "none: reason"), four languages.
6. Migrations: listed against the latest origin (no number clash); an applied migration is never edited.
7. Hand-back: what ran (command, sha, counts from that run), decisions taken, found outside the brief, the filled review checklist, `Brief: unclear or missing — …`.

## 6. Reviews
- Template: [review.md](../templates/review.md). The reviewer writes the same file into `docs/agents/<feature>/review.md` in **each repo the flow changed** (the gate reads it from there).
- **Own pass first, end to end** (brief + standards → the flow through both repos: seams, error paths, rights, data, languages) → then a verdict on each builder decision → then the test table (a missing case is a finding).
- **Severity:** HIGH = wrong money or books, a cross-company read/write, an auth bypass, data loss or duplication. MEDIUM = a broken flow or a wrong decision in a real case. LOW = everything else (backlog, doesn't block).
- One reviewer per flow and per feature review; no second reviewer; no re-stamps after a clean rebase; reviewers don't re-run the builder's tests (only to prove a finding); a finding needs file:line and a concrete failure.
- Money and security guardrails stay: a test per finding before close; money invariants after every seed and full run (a break stops the push); company isolation by the tenant architecture test now and database row security by ADR before the first customer; accountant sign-off and pen test before go-live.

## 6b. Documents and speed (Jabran 2026-11-24)
- **Documents are part of the work, not reviewed on their own:** feature docs (user guide, developer pages, contract examples) are written by the builder with the code and updated in the same commit when behaviour changes; the flow's one review covers them. Briefs and plans: written by the lead at the start, updated when scope changes, no review. ADRs: the lead writes, Jabran approves; one independent check only for big decisions (all platforms, money, security), never a second round: the lead applies the check and finishes it.
- **One review round per flow:** the reviewer re-checks only a HIGH fix; the lead checks MEDIUM fixes against their tests.
- **Found outside the brief:** fixed in the same round only when it is the same bug in the same area; everything else goes to the backlog unless it is HIGH.
- **Time box per job:** a fix ≤ 45 min, a flow ≤ 3 h; over the box the agent reports instead of continuing.
- **Parallel by default:** up to 2 BackEnd + 2 App builders on the old Mac (gradle-job.sh slots), the new Mac's own work beside; flows of different features run side by side.

## 7. Tests and gates
- **Builder and fixer: only the tests they wrote or changed, plus a compile of the changed modules; never service suites or the whole suite** (Jabran 2026-11-24). Exception: gate/tooling work proves its own scope rules. **Gate (lead): once per feature, not per flow** (Jabran 2026-11-24): the scoped gate runs before the feature's PR to `main`. **Whole suite only for full module features, never for fixes, and only after asking Jabran.** A failure the gate finds goes back to the same builder.
- Gradle: one job per repo at a time (locks and Gradle homes in `verify.md`); the old Mac may run one BE and one App gate together; no backend stack or simulator during a gate; after a Mac restart check Docker and the infra containers first.
- Test output stays out of the conversation (`-q`, logs to files, read the summary and "0 failed" before any push).
- Stack and simulators run only while someone tests, stopped right after; no idle Gradle daemons.

## 8. Records (one owner each)
| Record | Holds | Writer |
|---|---|---|
| `PROJECT-STATE.md` | features in flight, `main` heads, next work | integration lead |
| `.review-channel/<module>-plan.md` | the module's features, flows, order, slots | module lead |
| `docs/agents/<feature>/` in each repo | brief, plan, hand-backs, review, test table | the agents |
| `.review-channel/lead-decisions.md` | decisions and their reasons (history) | leads |
| `docs/backlog.md` | LOWs and later work, each with an owner | anyone |
| `.review-channel/handoff-<role>.md` | handoff (replace, don't append) | each lead |
| `.review-channel/claims.md`, `docs/inbox/erp-lead.md` | who works on what; messages between the Macs | leads |
Per flow the lead records time, first-pass gate result, review and fix rounds and cost in one line of `.review-channel/v2-trial-measures.md` (trial).

## 9. Agents and models
- Builders: Opus (money, security, migrations always Opus); Sonnet for fully decided small work; Haiku for mechanical work. Codex only when Jabran asks.
- Reviewers: **one Opus 5.5 at high effort** for every flow and feature review (Jabran 2026-11-24); Fable only when Jabran asks (e.g. a big ADR). Testers (Jabran 2026-11-24): screen-size tests are automated (written by the builder, run by Gradle, no model). Simulator: **Opus medium** for a flow with new screens (incl. the accessibility and look pass), **Sonnet** for re-tests after fixes, in chunks of ~4 steps; the flow's Opus reviewer judges the findings and looks at the size-test shots. **Simulator driver: AXe** (`/opt/homebrew/bin/axe`: tap/type by label or by the element's `testTag` id, accessibility tree, screenshots); check `which axe` before starting the stack and a tester; turn autocorrect off in test simulators. The desktop app's iOS Simulator tool is an alternative for first looks.
- A sub-agent for independence (reviews), large context (builders) or parallel work (testers); otherwise the lead does it. Fixes resume the builder that knows the code.
- Effort: default for builders; reviews at high (Opus 5.5); otherwise when Jabran asks.

## 10. Secrets, machines, limits
- **Never** open, print, grep or copy `.env` (incl. `infra/.env`), `.local-secrets/**`, token and session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, keychains or keys; read one key only when needed. In a new BackEnd worktree run `chmod 700 .local-secrets && chmod 600 .local-secrets/* .env infra/.env`. Every brief, review and tester template repeats this.
- No GitHub Actions or workflows without Jabran's OK.
- Two Macs: claims first; pull before work, push right after. New Mac (16 GB) builds and runs scoped gates for its module; old Mac (36 GB) runs heavy runs, simulators, `core/*` and every feature → `main`.
- Usage: start new work up to 99 % of the plan limit; at 99 % finish the step, hand off, stop. Lead compacts at ~50 % context with a keep line; other sessions hand off at ~80 %.

## 11. Changing this workflow
Only at a review point (after a module's feature set). A new rule needs the incident or number behind it, the principle it serves and a check date; rules that didn't help are removed. Between reviews, problems go to the topics list.

## Order (Jabran 2026-11-24)
1. `core/phase-4-fixes`: done 2026-11-24 (merged to `main`).
2. Full v2 trial on real features: the first Accounts feature (new Mac) and the first HR feature (old Mac), in parallel.
3. Later features: `core/backend-decisions` (the App shows the server's decisions), `accounts/editor-speed` (fewer calls per screen).
GATE-3 hook work is dropped (no hooks for feature branches); its other items go to the backlog and come back only with an incident.
