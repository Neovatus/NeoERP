# NeoERP workflow (v2 DRAFT, 2026-11-24, D-81)

> DRAFT for the independent check and Jabran's approval. When approved it replaces `WORKFLOW.md`; the old text moves to
> `docs/process/archive/WORKFLOW-v1.md` (history, never read as rules). Read [PRINCIPLES.md](../PRINCIPLES.md) first.

This page says how work flows. **What good product looks like** lives in the standards, not here:
domain `docs/domain/RULES.md`; design `NeoERP-App/docs/design/` (`screen-standard.md`, `ux-principles.md`, tokens,
`specs/building-blocks.md`); code per repo `ARCHITECTURE.md` and `AGENTS.md`; the gate `docs/operations/verify.md`.
**Why** a rule exists lives in `.review-channel/lead-decisions.md` (history). Each rule here is one line; when a case is
not covered, apply the principles.

## 1. Who decides
- **Jabran:** product scope, money rules, statutory rules, design approval, this workflow, anything a FIX verdict or failed gate leaves open.
- **Lead of a module** (old Mac: HR/Payroll; new Mac: Accounts, D-61 trial): the phase plan, briefs, plan checks, merges into its phase branch.
- **Integration lead** (old Mac): every phase → `main`, shared platform code, the whole-phase review.
- **Builder:** everything inside the standards and the brief's goal, recorded as decisions. Stops and asks for: money rules, product scope, a BE↔App contract change, a new pattern where one exists, a write outside its repo.

## 2. Branches
```
main
 ├── accounts/phase-<x>      ← work goes straight in (one builder per repo at a time)
 │     └── accounts/<x>-<batch>   only when batches run in parallel; deleted at merge
 └── hr/phase-<x>
```
- A phase branch starts from `main`. Before its PR, `main` is merged into it (merge commit, never force).
- Never `--no-verify`, never force push (also not `--force-with-lease`), no AI attribution in commits, PRs or comments.
- One script does every merge (`scripts/merge.sh`, GATE-3): gate marker present → push → delete the batch branch and worktree → record. Pushes happen only from the checkout that holds the marker.
- *(Until the hooks know the new names, GATE-3 item: phase branches keep `phase/<n>`.)*

## 3. A phase
1. **Phase plan** (module lead, Jabran reviews): the batches, their order, who builds, the review model per batch, test-session slots.
2. **Batches run one after another** (or in parallel on batch branches when no files are shared). Each batch is the full flow in §4.
3. **Phase end:** every batch merged, no open branch (the merge script refuses otherwise) →
   **whole-phase review**: two reviewers split by feature, each reading BE and App together (Fable, medium; Opus when Fable's budget is out) → fixes (one batch, same flow) →
   **whole suite** in both repos on the phase head with `main` merged in → MERGE verdict → PR to `main` (merge commit) → checkouts fast-forwarded.

## 4. A batch (one feature part, both repos)
| # | Step | Who | Done when |
|---|---|---|---|
| 1 | **Brief** ([template](../templates/brief.md)): goal, rules, checklist, Definition of Done, links to the standards; "not a limit" | module lead | the brief check (an agent that opens the code the brief names) finds no gap |
| 2 | **Discovery + plan**: the whole flow today, every path the change touches, what to reuse, decisions it will take, open questions | the builder (BE first), reading **both repos** | the lead checks the plan (~10 min): direction, scope, contract |
| 3 | **Build + tests** (BE first; the App builder gets the BE contract and its examples) | builders, each writing only in its own repo | Definition of Done (§5) met; the builder's own pass of the review checklist filled in |
| 4 | **Flow test** on the local stack | tester agent ([template](../templates/tester.md)) | pass, or findings with steps |
| 5 | **Review, once, BE + App together** ([template](../templates/review.md)) | one reviewer: Fable for books, money, isolation, auth; Opus otherwise | ACCEPT; or HIGH/MEDIUM fixed by the **same builder** (resumed) and checked by the **same reviewer**; LOWs → backlog |
| 6 | **Gate + merge into the phase** | lead, merge script | `verify: OK` (scoped), batch branch deleted, record written |
| 7 | **Simulator session** when the batch has new screens: first looks, real-device behaviour, wording | tester(s), data prepared by script first | findings → next batch or a fix batch |

Two strikes: the same failure twice → stop, write what was tried, escalate (lead, then Jabran). A finding needs file:line and a concrete failure.

## 5. Definition of Done (every batch; the brief adds its own lines)
1. The flow works end to end in both repos for **every path discovery found**, not only the one the brief names.
2. **Tests for all cases**, from a test table written before the code (case → expected → test name):
   success and each variant · refusals with the right error code · edge values (empty, missing, zero, negative, very large, rounding, max length, period edges, closed period, other currency) · rights and company (no permission, another company, stand-in, feature off) · repeats and races (double submit, retry after timeout, same event twice, two users) · contract (BE accepts the published examples; the App sends exactly them and reads responses with missing or empty fields without breaking) · screens (Compose UI flow test; size tests in en, nb, sv, da; error and empty states).
3. Each fix has a test that fails on the old code.
4. Standards kept: nothing duplicated, the architecture kept, every deviation written down with its reason.
5. Feature checklist: release flag, permissions, demo data with the awkward cases, user-guide and developer pages, four languages.
6. The builder's hand-back: what ran (sha, counts from that run), decisions taken, found outside the brief, the filled review checklist, `Brief: unclear or missing — …`.

## 6. Reviews
- **Own pass first, end to end:** brief + standards → walk the flow through both repos (seams, error paths, rights, languages, data) → then the builder's decisions, a verdict on each → then the test table (a missing case is a finding).
- One reviewer per batch; HIGH/MEDIUM block, LOWs go to the backlog; one fix round, checked by the same reviewer; no re-stamps after a clean rebase; no review of reviews.
- Reviewers don't re-run the builder's tests; they run a test only to prove a finding.
- Money and security keep their guardrails: a test per finding before close; money invariants after every seed and full run (a break stops the push); accountant sign-off and pen test before go-live.

## 7. Tests and gates
- Builder: its tests + the gate's scoped set (same command) before hand-back. Gate: scoped per batch; **whole suite at every phase → `main`**, always.
- Gradle: one job per repo at a time (locks in `verify.md`); old Mac may run one BE and one App gate together; no backend stack or simulator during a gate; after a Mac restart check Docker and the infra containers first.
- Test output stays out of the conversation (`-q`, logs to files, read the summary).
- Stack and simulators run only while someone tests, stopped right after.

## 8. Records (one owner each)
| Record | Holds | Writer |
|---|---|---|
| `PROJECT-STATE.md` | phases, heads, next work | integration lead |
| `.review-channel/<module>-phase-<x>-plan.md` | batches, order, slots | module lead |
| batch folder `docs/agents/<batch>/` in each repo | brief, plan, hand-backs, review, test table | the agents |
| `.review-channel/lead-decisions.md` | decisions and their reasons (history) | leads |
| `docs/backlog.md` | LOWs and later work | anyone, with an owner |
| `.review-channel/handoff-<role>.md` | handoff, replaced not appended | each lead |
| `docs/inbox/erp-lead.md` | messages between the Macs | leads |
The merge script records time, first-pass gate result and cost per batch automatically; no hand-filled numbers.

## 9. Agents and models
- Builders: Opus (money, security, migrations always Opus); Sonnet only for fully decided small work; Haiku for mechanical work.
- Reviewers: Fable (books, money, isolation, auth) or Opus; testers: Sonnet in small chunks.
- A sub-agent for independence (reviews), large context (builders) or parallel work (testers); otherwise the lead does it. Fix rounds resume the builder that knows the code.
- Effort: default; high only when Jabran asks or for security reviews.

## 10. Secrets, machines, limits
- **Never** open, print, grep or copy `.env` (incl. `infra/.env`), `.local-secrets/**`, token and session files, `~/.gradle/gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, keychains or keys; read one key only when needed. In a new BackEnd worktree run `chmod 700 .local-secrets && chmod 600 .local-secrets/* .env infra/.env`. Every brief repeats this.
- No GitHub Actions or workflows without Jabran's OK.
- Two Macs: claims in `.review-channel/claims.md` first; pull before work, push right after. New Mac (16 GB) builds and runs scoped gates for its module; old Mac (36 GB) runs heavy runs, simulators, shared code and phase → `main`.
- Usage: start new work up to 99 % of the plan limit; at 99 % finish the step, hand off, stop. Lead compacts at ~50 % context with a keep line; other sessions hand off at ~80 %.

## 11. Changing this workflow
Only at a phase review. A new rule needs: the incident or number behind it, the principle it serves, and a check date; rules that didn't help are removed. Between reviews, problems go to the topics list, not into this file.

## Open for Jabran / GATE-3 (cut to ~1 day, incident-backed)
1. Merge script (§2) incl. the phase-close check (no open branch, every claimed batch merged).
2. Hooks accept `<module>/phase-<x>` and batch names.
3. Review template checked when written, not at the gate; the gate takes the review model from the brief (one review per batch).
4. Failing test names in the gate output; Gradle-lock waits shown.
5. App gate-v3 dispatcher port, only if it fits the day.
