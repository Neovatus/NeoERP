# Process review: how NeoERP is run (Fable, 2026-11-20)

Independent, read-only review. Evidence is file:line. `WF` = workspace `WORKFLOW.md`; `mem/x` = the lead's memory file `~/.claude/projects/-Users-jabransiddiqui-Offices-Neovatus-NeoERP/memory/x.md` (cited by file, not line); `App/` = `NeoERP-App/`; `BE/` = `NeoERP-BackEnd/`. No `PROJECT-STATE*`, secrets or token files were opened.

## Verdict

1. The backend has real, enforced money and isolation rules (ArchUnit: money types, posting write path, tenant repositories), and the go-live list is unusually honest. That part is good.
2. Almost everything else that protects money and security is prose that one agent on one laptop has to remember: no CI, no git hooks, no branch protection, no static analysis, no invariant suite yet, no database-level company isolation.
3. The rule set has four generations stacked on top of each other (stage pipeline, cloud reviewer, module leads, today's single lead with lanes). They contradict each other on push, review, testing and compaction, and the lead's private memory is the only place the current answer lives.
4. Accuracy is the weak point, measured: after build, Opus review and merge, the QA1 retest found 15 groups fixed, 24 partly fixed and 8 still broken. The review step is not catching what the tester catches.
5. One lead with one Gradle lane works for one module and one person. It will not carry Payroll, statutory filing and a second developer; split by risk (a separate verification owner) before splitting by module.

Criteria codes: ACC accuracy, EFF efficiency, MNT maintainability, DEC decisions/flows, SCL scalability, TOK tokens.

## Findings

### Critical

**C1. No machine gate between an agent and the shared branches.** (ACC, SCL, DEC)
- Evidence: CI is off by decision (`mem/branch-per-phase` item 3; `BE/docs/operations/hosting-and-go-live-requirements.md:30` P-8 "Paused"). `App/` has no `.github/workflows` at all. Neither repo has a git hook (`.git/hooks` empty, no `core.hooksPath`). The only Claude hook is a Stop hook for an inbox listener (`.claude/settings.json:2-9`). On 2026-11-19 the lead pushed a red build to `phase/4` because a pipeline echoed exit 0 (`mem/check-test-result-before-push`); the fix was another memory note (`docs/lessons.md:52` L09).
- Also: when CI is switched back on it will not run on merges. The workflow triggers on push to `dev` only (`BE/.github/workflows/services-test.yml:5-7`), and `dev` was deleted on 2026-11-12 (`mem/branch-per-phase` item 1).
- Why it matters: every guardrail below ends in "the lead reads the result and decides". A finance product needs at least one check that an agent cannot skip or misread.
- Fix: (a) one `scripts/verify.sh` per repo that runs the suite, parses the JUnit XML, fails on failed > 0 or on unexpected skips, and writes `build/verify/<commit-sha>.ok`; (b) a `pre-push` hook (committed under `.githooks/`, `core.hooksPath` set) that refuses a push to `main` or `phase/*` unless that file exists for HEAD; (c) GitHub branch protection on `main` and `phase/*` (PR only, no force push); (d) fix the workflow trigger to `main` and `phase/**` now, so it is right the day Actions return; (e) if Actions minutes are the problem, a self-hosted runner on the Mac costs nothing per minute.

**C2. The four money/security guardrails are not enforceable as written.** (ACC, DEC)
- Evidence, `WF:328-332`:
  1. "Every money or security finding gets an automated test before it is closed." Followed for G01 and G02 (`BE/services/accounts-service/src/test/.../journalimport/JournalImportApiTest.kt:253-255`; `.../reversal/AutoReversalApiTest.kt:76`), but nothing records it. No finding ledger has a "test" column, so nobody can audit the rule.
  2. "Money invariant checks run after every seed and full test run… A break stops the push." The checks do not exist yet (`docs/lessons.md:55` "built in batch 2"), and nothing can stop a push (C1). No owner, no command name, no definition of "after every seed".
  3. "Money and security changes get a second, different reviewer." Nothing defines which diff is a money or security change, who starts the second review, or what happens when the two reviewers disagree. Codex has a usage limit and was unavailable before (`mem/phase3-finish-plan` "Codex hit its limit"), so the fallback is silently one reviewer.
  4. Accountant sign-off and pen test are go-live rows only (`BE/docs/operations/hosting-and-go-live-requirements.md:126-128`), status Open, no named person, no date.
- Why it matters: `docs/lessons.md:27` says guardrails "become conventions at once", but three of four are words today.
- Fix: add `docs/risk-paths.txt` per repo (globs: posting engine, tax, payments, bank details, numbering, period lock, `shared/neoerp-security`, `shared/tenant-security`, migrations, auth, gateway routes). A script `scripts/risk-check.sh <range>` prints RISK or NORMAL from `git diff --name-only`; the lead may not classify by judgment. RISK ranges require two review files with the reviewed commit SHA in `docs/agents/<slice>/` before `verify.sh` writes the ok marker. Add a findings ledger (`docs/agents/findings.csv`: id, severity, test path, commit) and a test that fails when a money/security row has no existing test path. Give ERP-Q1 and ERP-Q2 a named owner and a "start by" date; a Type II control period and an accountant's calendar are long lead items.

**C3. Company isolation is application-layer only, covers half the services, and the reviewer is not asked to prove it.** (ACC, SCL)
- Evidence: no row-level security in any migration (grep `ROW LEVEL SECURITY` in `BE/services/**/*.sql`: 0 hits). The tenant ArchUnit test depends on four of eight services only: hr, payroll, accounts, org (`BE/architecture-tests/build.gradle.kts:22-27`); user-service, audit-service, auth-service and the gateway are outside it. It carries a legacy baseline of unscoped methods and an "awaiting ADR-012" list for hr-service (`BE/architecture-tests/.../TenantRepositoryArchitectureTest.kt:125-170`). Payroll has no company column at all (`hosting-and-go-live-requirements.md:39` P-17). 61 test files use `disabledWithoutDocker`, so isolation tests skip silently when Docker is down, and the push rule checks only "0 failed" (`WF:325`); P-16 admits this for CI only (`hosting…:38`).
- Why it matters: for a multi-company ERP one missed `company_id` predicate is a reportable breach. A structural test proves the method has a company parameter, not that company A cannot read company B.
- Fix: (a) a generated cross-company test: for every route in the gateway route table, call it as company A with a company B id and expect 403/404; the test fails when a new route has no case (the `fe3/accounts-endpoint-feature-map.txt` pattern already exists for entitlements); (b) Postgres RLS on accounts and the rebuilt payroll tables as a second layer, decided as an ADR before Payroll P0 because retrofitting it later means touching every query; (c) add user-service and audit-service to the architecture test; (d) `verify.sh` fails when skipped > an allowlisted number.

**C4. The review step is measurably not catching defects, and the rules make it weaker.** (ACC, TOK, EFF)
- Evidence: QA1 retest table (`docs/agents/qa-round1-retest/summary.md:5-47`): 15 fixed, 24 partly fixed, 8 still broken, after Opus build plus Opus review plus merge. Two results are data loss in a ledger editor (typed date landing in another field, memo truncated in the DB: `summary.md:42,52`) and one is an unconfirmed "500 shown as 5,00" (`summary.md:16`).
- Rules that weaken review: reviewers do not re-run tests (`mem/targeted-test-runs` update 2026-11-05) although an earlier rule from a real miss says every review must fetch and rerun (`mem/subagent-models` update 2026-11-02). Lane builders "run no tests at all, only compile" (`mem/gradle-one-at-a-time`), which contradicts `WF:145-147` and `WF:172-173`. Non-risk checkpoints are "accepted on test names" (`WF:186`). UI commits may be uncompiled (`mem/no-compile-each-change`). "A failure in an unrelated test is recorded and the work moves on" (`WF:208`).
- Why it matters: each rule was a fair answer to a cost complaint, but together they mean a reviewer reads a diff and a builder's own counts. The retest then costs more than the review saved (2.7 M tester tokens, `docs/lessons.md:44`).
- Fix: keep "no full re-run by the reviewer", but require the reviewer to (1) write at least one failing test or reproduction per finding and (2) run the builder's named tests from a clean `cleanTest`. Builders run their targeted tests through the lock; "compile only" stays for wording lanes. A fix is "done" only with a test that fails before and passes after, or a written "cannot be tested on JVM, needs simulator" line that goes on the retest list. Unrelated failures get a backlog row with an owner the same turn, or they block.

### High

**H1. Four generations of process coexist and contradict each other.** (DEC, MNT, ACC)
- Push: "pushes require explicit authorization" (`WF:60-61`), "push only when explicitly requested" (`App/AGENTS.md:27`, `.codex/CODEX.md:100`), versus "push right after verified commits" (`mem/push-after-commit`).
- Review: "Every build… gets a fresh independent Opus review before it lands" (`WF:126`), versus "Opus review only for money/security/locking" (`mem/save-usage-limits`) and "no review per test fix" (`mem/branch-per-phase`, 2026-11-13).
- Reviewer identity: a cloud Cowork session reviews and Jabran relays (`WF:112-118`, `WF:296-297`); the memory index still says "talk to reviewer via `.review-channel/` files", which `WF:295` retired; today's practice is Opus sub-agents plus Codex.
- Org: module leads under an ERP lead (`docs/handover/lead-agent-structure.md:9-24`, `mem/erp-lead-review-scope`: "never re-review a module lead's own work") versus one lead running everything.
- Compaction: 80 % (`WF:279`, `mem/context-limit-compact`) versus 50 % (`WF:326`).
- Desk check: required at slice end (`WF:243-245`) versus "no separate desk-check or sweep agents unless asked" (`mem/save-usage-limits`).
- Stale approval text still live: "No document moves… and no repository initialization, are authorized… Every workstream retains 'None newly approved'" (`WF:311-316`); escalate to "Fable 5.1" (`WF:149`); current state "see `NeoERP-App/docs/HANDOFF.md`" (`WF:129`, last changed 2026-10-15).
- Why it matters: a Codex builder or a new person reads `WF` and the repo guides, not the lead's memory, and gets the older answer. An agent that follows the text can honestly do either thing.
- Fix: one rewrite of `WF` as "current rules" (target under 150 lines) with a dated `docs/workflow-history.md` for superseded text. Every rule that binds a builder or reviewer must be in the repo; memory keeps only lead habits and Jabran's preferences. Add a "supersedes" line whenever a rule replaces another, and delete the old one in the same commit.

**H2. The lead is builder-of-briefs, judge, tester of record, merger and author of its own scorecard.** (ACC, DEC)
- Evidence: the lead writes briefs, picks reviewers, merges two reviewers' reports "into one fix list" (`mem/phase3-finish-plan`, 2026-11-05), makes "lead calls" (one overrode an approved decision, `mem/check-approved-decisions`), runs the one full test and pushes (`mem/gradle-one-at-a-time`), checks write scope "before merging" (`WF:271`), and records the lessons and scorecard about its own batches (`docs/lessons.md:16-26,38`).
- Why it matters: the party that wants the batch merged also decides whether the evidence is good enough. That is how a red push and an overridden decision happened.
- Fix: a small, separate "verifier" role (fresh Opus or Codex, no build context) whose only job per merge batch is: run `verify.sh`, run `risk-check.sh`, diff paths against the brief's write scope, check every review finding has a disposition, and write `verdict.md` with the SHA. The lead may not merge without it. The scorecard numbers come from scripts (git, the findings ledger), not from the lead's summary.

**H3. Testers check the lead's script against the app, not the app against the domain rules.** (ACC)
- Evidence: the lead writes the steps and expected results from the same spec the builder used (`mem/tester-agent-full-flows`); one round needed 45 script corrections (`docs/agents/qa-round1-retest/summary.md:96`). G01 and G02, the only security findings, were found by a human-style run, not by any test (`docs/lessons.md:54`). The demo role for one user differs between the doc and the app and is still "open" (`summary.md:96`).
- Why it matters: a wrong expectation passes; a right behaviour gets reported as a bug.
- Fix: expected results for money and permission steps are derived from `docs/domain/RULES.md` and the contract by an agent that has not seen the app code, and each carries the rule id. Add a state-transition matrix test per document type (every transition × every guard: role, uploader/owner, entitlement, period lock, two-person rule); G01 and G02 were both "one guard missing on one of several transitions", which a matrix finds mechanically.

**H4. Security and money findings wait for the end of a QA round.** (ACC, DEC)
- Evidence: "money/security findings also wait for the end, flagged at the top of the list" (`mem/tester-agent-full-flows`, Fixing); `WF:323` allows immediate fixes only for blockers that stop other tests.
- Why it matters: acceptable on a local stack with seed data. As a written rule it will be followed on a pilot stack too, and it lets later test chunks run on data a known posting bug may have corrupted.
- Fix: scope the rule in `WF`: "local dev stack only". On any shared or hosted stack, a money or security finding stops the round for that area, and the data it touched is marked.

**H5. Money correctness on the app side has no enforced rule.** (ACC, MNT)
- Evidence: the backend bans Double/Float in the money path by test (`BE/architecture-tests/.../MoneyTypesArchitectureTest.kt:18-54`). The app has no equivalent: its build checks cover building blocks and text only (`App/composeApp/src/jvmTest/.../designsystem/BuildingBlockChecksTest.kt`, `.../i18n/*`). "No format outside NeoFormat, no raw text field for amounts" is still Proposed (`docs/lessons.md:46` L03) while a number-parse fault is open (`fix-list.md:21` R12). The app review checklist has no money, format or locale line (`App/docs/review-checklist.md:1-95`).
- Fix: promote L03 now as a guardrail, not a trial: scanning tests (same style as `HardcodedUiTextTest`, shrinking baseline) for amount parsing/formatting outside `NeoFormat`/`NeoNumericInput`, `Double`/`Float` in `features/accounts/**` domain and DTOs, and `Color(0x…)` in features. Add a property test: for each of en/nb/sv/da and PK, `parse(format(x)) == x` for random amounts, including 500, 5.00, 1 234,50.

**H6. The reviewer guides and agent definitions are generic and stale; they do not carry the product's real risks.** (ACC, MNT)
- Evidence: the backend reviewer guide has no accounting section: nothing on balanced journals, rounding, period lock, numbering gaps, idempotent posting, outbox, dimension sets (`BE/.claude/skills/neoerp-backend-workflow/references/reviewer-guide.md:18-74`). App reviewer agent and `/review` command date from 2026-07-02 and check annotations and naming; `/review` requires "Mock repository exists alongside remote repository" (`App/.claude/commands/review.md:72`). The agent roster describes a standing team (lead, hrms, payroll-ess, accounts-finance…) that current practice does not use (`App/.claude/agents/README.md:17-33`). `BE/AGENTS.md:42` describes accounts-service as chart, journals and GL only, with nothing on AR, AP, payments, tax, imports. Review quality therefore depends on whatever the lead pastes into each brief (`WF:324`).
- Fix: do L04 now (`docs/lessons.md:47`): one review skill per repo with sections by risk (posting and money, isolation and permissions, migrations, contract mapping, UI consistency), each line a checkable statement with the command or test that proves it. Briefs name the sections. Delete the role-agent files or mark them historical; update `/review` or remove it.

**H7. Root guides point builders at wrong or dead content.** (DEC, ACC)
- Evidence: workspace `CLAUDE.md:59` and `.codex/CODEX.md:67` say RULES §7 is "three independent financial flags" and a schema decision; `docs/domain/RULES.md:121` §7 is now "Books belong to companies (revised 2026-10-06)". `App/.claude/CLAUDE.md:32` "Current State (as of May 2026)"; `:51-54` name HR as a reference module while HR is an April prototype to be rebuilt (`mem/app-languages`, `mem/dev-no-legacy-constraints`); `:251` lists the April Copilot `CODE-REVIEW.md` (web target, removed container) as a key document. `BE/AGENTS.md:13-18` links use absolute `/Users/jabransiddiqui/…` paths that break in every worktree and for every other person.
- Fix: a link-and-claim check (Haiku job or a script) over the guide files each batch: dead paths, absolute paths, section numbers that no longer match headings. Move `CODE-REVIEW.md` to `docs/archive/`.

**H8. "The most important rule" in the app is unenforced and already broken.** (MNT, ACC)
- Evidence: Koin only in `*/app/di/*` and one routing file (`App/.claude/CLAUDE.md:66-70`). Koin is imported in feature screens: `App/composeApp/src/commonMain/.../features/accounts/presentation/chart/AccountsChartTab.kt:93` (`koinInject`), also `AccountsCalendarTab.kt`, `AccountsTaxCodesTab.kt`, `features/dashboard/presentation/PlatformDashboardScreen.kt`. No test covers Koin imports or feature-to-feature imports. The three statements of the rule differ (`CLAUDE.md:67` `*/app/di/*`; `commands/review.md:25` and `reviewer-guide.md:15` `*/di/*.kt`).
- Why it matters: builders are told to "reuse the existing pattern" (`WF:266-269`); the existing pattern in Accounts breaks the written rule, so the rule loses.
- Fix: decide the rule (allow `koinInject` at tab/screen roots, or not), write it once in `ARCHITECTURE.md`, and add a scanning test with a shrinking baseline, as the i18n checks do.

### Medium

**M1. Process rules that bind everyone live in one person's private memory.** (SCL, DEC) The machine-wide Gradle lock, no AI attribution, worktree location, model choice, stop thresholds and review scope are in `~/.claude/…/memory` (42 files), not in the repos. Codex, a second Claude session, or a second developer cannot see them; the lead must paste them into every brief (`mem/gradle-one-at-a-time`, `mem/no-claude-coauthor`: "tell every builder brief"). Fix: a committed `docs/agents/BRIEF-TEMPLATE.md` per repo with the standing rules, and a `gradlew` wrapper script (`scripts/g`) that takes the lock itself so no brief has to mention it. Move the lock file out of `/private/tmp` (a restart empties it; the project already learned this, `mem/builders-isolated-checkout`).

**M2. Memory files keep superseded rules next to current ones.** (ACC, TOK) `mem/subagent-models` holds three model tables ("Current", "Superseded table", "History") and a contradicting review rule; `mem/targeted-test-runs` has seven dated updates that reverse each other (CI is the full run; CI is off; full suite per push; not per push); the index still lists a file marked SUPERSEDED. `mem/lessons-register` says "run consolidate-memory about weekly". Fix: do it now; one current rule per file, history moved to a single archive file that is not in the index.

**M3. Duplicated guides will drift, and already have.** (MNT) Claude and Codex skills are separate copies: 37 diff lines in the App skill, 38 in the backend skill, `project-context.md` differs. The skills still tell agents to maintain `review.md` and `improvements.md` (`App/.claude/skills/neoerp-workflow/SKILL.md:210,326,359`) which `WF:99-100` forbids. Fix: one tool-neutral skill body per repo under `docs/agents/skill/`, with `.claude` and `.codex` files reduced to a pointer; a test that fails if the two differ.

**M4. Definition of done and checklist are "where practical".** (ACC) `App/docs/definition-of-done.md:32-35` and `App/docs/review-checklist.md:60-62` let any builder skip tests with a sentence. `definition-of-done.md:57` sits under "Not Done If" and reads "the UI quality gates… are met", which says the opposite of what is meant. `BE/AGENTS.md:142` says `./gradlew test` is the regression gate, against the targeted-test rule. Fix: replace "where practical" with the named cases that need a test (mapper for any contract change, state machine transitions, refusal paths); fix line 57; align §9 with `WF`.

**M5. The UI "checks, not memory" gate covers a narrow slice of the building blocks.** (MNT, ACC) `WF:234-236` promises a check per building block. The check is one regex scanner with about seven patterns (`BuildingBlockChecksTest.kt:107`) against a 573-line `building-blocks.md`. The QA1 partly-fixed list is mostly shared-component behaviour (footer, picker, numeric field) fixed on one screen (`summary.md:95`). Fix: `building-blocks.md` gets a table "block, component, check test, screens using it"; a block without a check is listed as unguarded. The brief generator fills "screens using it" by grep, so L05 does not depend on the lead remembering.

**M6. Design gate plus frozen design, but no step that checks the build against the decision table.** (DEC) `WF:135-137,164` freeze spec, contract and rig. Decisions live in plan Q&A, `docs/backlog.md` "Decisions" sections, memory and chat; the lead has to grep them (`mem/check-approved-decisions`). Fix: one `decisions.md` per module with ids; every brief lists the decision ids it implements; the reviewer checks each id; the verifier fails a brief with no ids for a RISK range.

**M7. The backlog and go-live list are not operable at their current size.** (SCL, DEC) `docs/backlog.md` has about 312 bullets under 27 dated headings with no owner, size or gate. The go-live file holds 26 platform rows and 26 ACC rows in cells hundreds of characters wide, two rows duplicate (P-10/ACC-R8, P-12/ACC-R9), and P-8 status sits in the wrong column (`hosting…:30`). Fix: keep the go-live file (it is the best document here), split per gate ("first hosted", "first customer", "per country"), one line per row with a link to detail; backlog rows get module, gate and a rough size, and anything with a gate moves to the go-live list.

**M8. Token and time waste that follows from the structure.** (TOK, EFF) Full flow retest after small fixes (2.7 M tokens, `docs/lessons.md:44`); every brief re-carries the checklist (`WF:324`); the lead re-reads `WF` (333 lines, much of it stale) after each compaction (`WF:289`); Jabran relays prompts between sessions (`WF:296-297`) and pastes Codex prompts (`mem/phase3-finish-plan`). Fix: H1 rewrite, L04 skill, and retest lists generated from the fix commits' touched components (L01).

**M9. Uncommitted and scattered state in the workspace.** (DEC) At review time the workspace has modified and untracked agent reports (`docs/agents/phase3-ui-run/*`, `accounts-cp-ev-1c/`, `m5-b1f/`…), and briefs are split across `docs/agents/` (75 folders), `App/docs/agents/` (58+) and `BE/docs/agents/` (58) despite "briefs live in the repo" (`CLAUDE.md` Builders section). 16 empty worktree folders remain under `App/.claude/worktrees/`. Fix: end-of-batch step in the verifier: `git status --short` clean in all three, or listed.

### Low

**L1.** Time box rule has no number (`WF:150-151`). Give lanes a default (for example 45 min without a green test).
**L2.** `WF:122-125` hard-codes model names and one stale version; keep model choice in one file the lead updates on a release (`mem/subagent-models` already asks for this).
**L3.** Usage stop at 92 % (`mem/usage-stop-thresholds`) should add "never stop between a migration commit and its test run".
**L4.** `mem/hrp-draft-commits-preaccepted` lets commits ride a push on a subject suffix; with a single lead this standing permission should be dropped.

## Scalability: is one lead with lanes right?

- Today's ceiling is physical: one Gradle run machine-wide on a 36 GB Mac, lanes one at a time (`mem/gradle-one-at-a-time`). More lanes add nothing until builds run somewhere else (CI runner or a second machine).
- The lead's context is the second ceiling: compaction at 50 %, 42 memory files, three docs trees.
- Keep one lead for product decisions and integration. Split now by function, not by module: (1) lead, (2) independent verifier (H2), (3) a standing "guardrails" lane that owns `verify.sh`, risk paths, invariants and arch tests.
- Split by module when either is true: a second human joins, or Payroll P0 starts while Accounts is still changing. Then each module gets a lead with its own branch (`module/<name>`, already floated in `mem/branch-per-phase`), and shared code (design system, `shared/*`, core) gets a single owner with a merge queue.
- Per country: statutory output needs a golden-file suite per country pack (official XSD or validator for SAF-T, SIE, EHF) and a named human reviewer before the second country, or the work of ERP-Q1 lands all at once at go-live.

## Automation to build (in order)

1. `scripts/verify.sh` + `pre-push` hook + branch protection (C1). Includes skipped-test count and the iOS compile.
2. `docs/risk-paths.txt` + `scripts/risk-check.sh` (C2) and the two-review marker.
3. Money invariant SQL suite (`scripts/invariants.sql`, run by `verify.sh` after seed and after the accounts suite; later the ERP-Q3 scheduled job): balanced journals, ledger = postings, subledger = control, no duplicate document number, no posting in a locked period, no duplicate idempotency key.
4. Cross-company route test generated from the gateway route table (C3).
5. App scanning tests: money format/parse, Double in money, hard-coded colours, Koin outside DI, feature-to-feature imports (H5, H8).
6. Document state-transition matrix test (H3).
7. Guide link/claim check and Claude/Codex skill parity test (H7, M3).
8. `scripts/g` Gradle wrapper that takes the lock (M1); a Claude `PreToolUse` hook that blocks `git push` without the verify marker and blocks reads of `.local-secrets` and `*.jwt`/`*.session.json` (today only a memory rule, `mem/lead-runs-demo-tokens`).
9. Dependency and secret scanning (OWASP dependency-check or equivalent, gitleaks) in `verify.sh`; a milestone library is already in the upload path (`hosting…:33` P-12).
10. Findings ledger with a test column and a check (C2).

## Keep doing

- Backend architecture tests with shrinking baselines and reviewed allowlists (`BE/architecture-tests/.../TenantRepositoryArchitectureTest.kt:147-170`, `MoneyTypesArchitectureTest.kt`, `PostingWritePathArchitectureTest.kt`).
- App i18n build checks with baselines that only shrink (`App/AGENTS.md:46-47`, `jvmTest/.../i18n/`).
- The go-live list with gate, status and source per row, including uncomfortable rows (P-8, P-16, P-17, ERP-Q1–Q3).
- Regression tests named after the QA finding (`JournalImportApiTest.kt:253`).
- Write scope and read scope in briefs (`App/docs/agents/qa1-fix/brief-app-a.md:12-21`); "fix in the shared component once".
- Lessons register with evidence before promotion, and guardrails exempt from trial (`docs/lessons.md:27-36`).
- Migrations frozen once applied; never Flyway repair (`mem/builders-isolated-checkout`).
- Measured model trials instead of opinion (`mem/subagent-models`, 2026-11-12).
- Collect findings, group by root cause, one fix batch (`WF:323`), for non-money findings.

## Proposed lessons (format of `docs/lessons.md`)

| # | Lesson | Aims at | Source | Stage | Evidence |
|---|---|---|---|---|---|
| L15 | A push to `main` or `phase/*` needs a verify marker for HEAD written by `scripts/verify.sh` (failed = 0, skips within allowlist); a pre-push hook and branch protection enforce it | ACC, SCL | Process review 2026-11-20 C1 (red push 2026-11-19; CI off; no hooks) | Proposed (guardrail) | — |
| L16 | Money or security scope is decided by `docs/risk-paths.txt` and a script, never by judgment; a RISK range needs two review files with the reviewed SHA | ACC, DEC | Process review C2 | Proposed (guardrail) | — |
| L17 | Every gateway route has a generated cross-company test (company A token, company B id → refused); a new route without one fails the build | ACC, SCL | Process review C3 (no RLS, arch test on 4 of 8 services) | Proposed (guardrail) | — |
| L18 | Test runs fail on unexpected skipped tests, not only on failures (Docker-backed security tests skip silently) | ACC | Process review C3 (61 files use `disabledWithoutDocker`; P-16) | Proposed (guardrail) | — |
| L19 | Each document type has a state-transition matrix test: every transition × role, owner/uploader, entitlement, period lock, two-person rule | ACC, SCL | Process review H3 (G01, G02 were one missing guard each) | Proposed (guardrail) | — |
| L20 | A separate verifier (no build context) signs each merge batch: verify, risk check, write-scope diff, finding dispositions; the lead does not merge without it | ACC, DEC | Process review H2 | Proposed | — |
| L21 | A fix is done only with a test that fails before and passes after, or a written "simulator only" line that goes on the retest list | ACC, TOK | Process review C4 (QA1 retest: 15 fixed, 24 partly, 8 still broken) | Proposed | — |
| L22 | Reviewers write a failing test or reproduction per finding and run the builder's named tests from clean; builders run their targeted tests (compile-only for wording lanes) | ACC | Process review C4 (contradicting rules 2026-11-02 vs 2026-11-05) | Proposed | — |
| L23 | Money and security findings stop the round for that area on any shared or hosted stack; "collect, then fix" applies to the local dev stack only | ACC, DEC | Process review H4 | Proposed (guardrail) | — |
| L24 | App money rules as build checks now (promote L03 for money): parse/format only through NeoFormat/NeoNumericInput, no Double in money, per-country round-trip property test | ACC, MNT | Process review H5 (R12 "500 → 5,00") | Proposed (guardrail) | — |
| L25 | Rules that bind builders or reviewers live in the repo; memory holds only lead habits. A new rule names what it supersedes and the old text is deleted in the same commit | DEC, MNT, SCL | Process review H1, M1, M2 | Proposed | — |
| L26 | Expected results for money and permission test steps are written from RULES.md and the contract by an agent that has not read the app code, each with its rule id | ACC | Process review H3 (45 script fixes in one round) | Proposed | — |
| L27 | Scorecard numbers come from scripts (git, findings ledger), not from the lead's summary | ACC, DEC | Process review H2 | Proposed | — |
| L28 | Guide files get a link-and-claim check each batch (dead or absolute paths, section numbers that no longer match) and a Claude/Codex parity check | MNT, DEC | Process review H7, M3 | Proposed | — |
| L29 | Statutory output has a golden-file suite per country validated against the official schema, and a named human reviewer, before the second country starts | ACC, SCL | Process review (scalability); ERP-Q1 | Proposed (guardrail) | — |
