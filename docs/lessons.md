# Lessons register

Every batch or QA round produces lessons. They are not rules straight away: each one is tried, checked over more batches, and only then becomes a convention.

**Judged on** (Jabran 2026-11-20). Every lesson names which of these it aims at, and each batch's evidence says what it did to them; a lesson that helps one but hurts another is not promoted until the trade-off is agreed.

| Code | Criterion | Asks |
|---|---|---|
| ACC | Accuracy | Fewer wrong results, fewer "partly fixed", fewer findings reaching Jabran |
| EFF | Efficiency | Less wall-clock and fewer round-trips per batch |
| MNT | Maintainability | Code, specs and scripts stay simple, shared and consistent |
| DEC | Flows and decisions | Decisions recorded, followed and traceable; flows match the domain rules |
| SCL | Scalability | Still works with more modules, lanes, people and customers |
| TOK | Token efficiency | Fewer tokens and less plan usage for the same result |

**Batch scorecard** (end of every batch, in the batch's summary; trends feed the evidence column):

| Code | Number recorded |
|---|---|
| ACC | findings fixed first time / total; money or security findings found after merge |
| EFF | hours from start to merge; round-trips to Jabran |
| MNT | shared components changed vs single screens patched; build-rule hits |
| DEC | decisions asked of Jabran; decisions later found unrecorded |
| SCL | lead compactions; lanes run in parallel |
| TOK | plan usage % spent by builders, reviewers and testers |

**Guardrails are not trials.** Money, security and statutory safeguards (Jabran 2026-11-20) become conventions at once; batches only tune *how* they run (scope, cost), never *whether*.

**Stages**

| Stage | Meaning | Moves on when |
|---|---|---|
| Proposed | Seen once, written in a round's Lessons section | Lead and Jabran agree to try it |
| Trial | Used in the next batches; each batch notes whether it helped | Helped in 2 batches with no real downside → Convention. Did not help or cost more than it saved → Dropped |
| Convention | Moved into WORKFLOW.md (team rule) or memory (lead behaviour), with the date | Revisited only if a later batch shows a problem |
| Dropped | Kept here with the reason, so it is not proposed again unchanged | — |

**At the end of every batch or round** the lead: adds new lessons as Proposed; records for each Trial lesson whether it helped ("+ batch name" or "− batch name, why"); promotes or drops those that have enough evidence; tells Jabran what moved.

## Register

| # | Lesson | Aims at | Source | Stage | Evidence |
|---|---|---|---|---|---|
| L01 | Retest only the screens a fix lane touched; no full re-walk of the flows | TOK, EFF | QA1 retest (2.7 M tester tokens for small fixes) | Trial | — |
| L02 | Sonnet testers in small chunks (10–20 min, one device set) instead of one long Opus run | TOK, EFF | QA1 retest | Trial | + QA1 retest (chunks 5–18 min covered as much as the 63-min Opus run) |
| L03 | Repeat faults become build rules (detekt / grep in Gradle, pre-commit hook): no format outside NeoFormat, no raw text field for amounts, no hardcoded colours | ACC, MNT, TOK | QA1 retest | Proposed | — |
| L04 | Reviewers load one project review-checklist skill instead of the checklist being copied into each brief | ACC, MNT, SCL | QA1 retest | Proposed | — |
| L05 | Fix the shared component, not the one screen; briefs name the component and every screen that uses it | ACC, MNT | QA1 retest (G12, G17, G32 partly fixed) | Trial | — |
| L06 | iOS-only checks become JVM tests where possible: size tests at 667×375 and 874×402, keyboard type per numeric field, per-country number parse/format | ACC, TOK | QA1 retest | Trial | — |
| L07 | Lead reads small things itself; reads of more than 3 files, long logs or web pages go to a sub-agent and only the conclusion comes back | TOK, SCL | Jabran 2026-11-20 | Trial | — |
| L08 | Grant simulator access when a device is booted, before a tester needs it | EFF | QA1 retest (iPhone SE prompt missed) | Trial | — |
| L09 | Check the build exit and "0 failed" before any push; never chain a push after a background test | ACC | QA1 merge (red push) | Convention (memory, 2026-11-19) | + QA1 merge fix-forward |
| L10 | Collect all findings of a round, fix once at the end; only flow blockers fixed at once | EFF, TOK, DEC | QA round 1 | Convention (WORKFLOW.md, 2026-11-19) | + QA1, + QA1 retest |
| L11 | Every money or security finding gets an automated test before it is closed, so it can never come back unseen | ACC, SCL | Jabran 2026-11-20 (G01, G02 were found by hand) | Convention (guardrail, WORKFLOW.md 2026-11-20) | — |
| L12 | Money invariants as automated checks run after every seed and full test run: debits = credits per journal, ledger = sum of postings, subledger = control account, no double post or double pay under retry, rounding per currency | ACC, SCL | Jabran 2026-11-20 | Convention (guardrail, WORKFLOW.md 2026-11-20; built in batch 2) | — |
| L13 | Money and security changes get a second, different reviewer (Opus plus Codex or `/security-review`) before merge | ACC, DEC | Jabran 2026-11-20 | Convention (guardrail, WORKFLOW.md 2026-11-20) | — |
| L14 | Posting rules and tax/statutory output (SAF-T, SIE, VAT) are signed off by a human accountant before go-live; AI review is not enough | ACC, DEC | Jabran 2026-11-20 | Convention (go-live gates ERP-Q1–Q3, 2026-11-20) | — |
| L15 | A push to `main` or `phase/*` needs a verify marker for HEAD written by `scripts/verify.sh` (failed = 0, skips within allowlist); a pre-push hook and branch protection enforce it | ACC, SCL | Process review 2026-11-20 C1 (red push 2026-11-19; CI off; no hooks) | Convention (guardrail, 2026-11-20; hook in batch 2 Lane 0; branch protection when CI is back) | — |
| L16 | Money or security scope is decided by `docs/risk-paths.txt` and a script, never by judgment; a RISK range needs two review files with the reviewed SHA | ACC, DEC | Process review C2 | Convention (guardrail, 2026-11-20; risk-paths file in Lane 0) | — |
| L17 | Every gateway route has a generated cross-company test (company A token, company B id → refused); a new route without one fails the build | ACC, SCL | Process review C3 (no RLS, arch test on 4 of 8 services) | Convention (guardrail, 2026-11-20; arch test to 8 services in Lane 0, route tests in BE lane) | — |
| L18 | Test runs fail on unexpected skipped tests, not only on failures (Docker-backed security tests skip silently) | ACC | Process review C3 (61 files use `disabledWithoutDocker`; P-16) | Convention (guardrail, 2026-11-20; Lane 0) | — |
| L19 | Each document type has a state-transition matrix test: every transition × role, owner/uploader, entitlement, period lock, two-person rule | ACC, SCL | Process review H3 (G01, G02 were one missing guard each) | Convention (guardrail, 2026-11-20; journals first, then per document type) | — |
| L20 | A separate verifier (no build context) signs each merge batch: verify, risk check, write-scope diff, finding dispositions; the lead does not merge without it | ACC, DEC | Process review H2 | Trial (batch 2) | — |
| L21 | A fix is done only with a test that fails before and passes after, or a written "simulator only" line that goes on the retest list | ACC, TOK | Process review C4 (QA1 retest: 15 fixed, 24 partly, 8 still broken) | Trial (batch 2) | — |
| L22 | Reviewers write a failing test or reproduction per finding and run the builder's named tests from clean; builders run their targeted tests (compile-only for wording lanes) | ACC | Process review C4 (contradicting rules 2026-11-02 vs 2026-11-05) | Trial (batch 2, money/security lanes; Jabran C4 decision) | — |
| L23 | Money and security findings stop the round for that area on any shared or hosted stack; "collect, then fix" applies to the local dev stack only | ACC, DEC | Process review H4 | Convention (guardrail, 2026-11-20) | — |
| L24 | App money rules as build checks now (promote L03 for money): parse/format only through NeoFormat/NeoNumericInput, no Double in money, per-country round-trip property test | ACC, MNT | Process review H5 (R12 "500 → 5,00") | Convention (guardrail, 2026-11-20; Lane 0 build rules) | — |
| L25 | Rules that bind builders or reviewers live in the repo; memory holds only lead habits. A new rule names what it supersedes and the old text is deleted in the same commit | DEC, MNT, SCL | Process review H1, M1, M2 | Trial (batch 2 docs clean-up) | — |
| L26 | Expected results for money and permission test steps are written from RULES.md and the contract by an agent that has not read the app code, each with its rule id | ACC | Process review H3 (45 script fixes in one round) | Trial | — |
| L27 | Scorecard numbers come from scripts (git, findings ledger), not from the lead's summary | ACC, DEC | Process review H2 | Trial | — |
| L28 | Guide files get a link-and-claim check each batch (dead or absolute paths, section numbers that no longer match) and a Claude/Codex parity check | MNT, DEC | Process review H7, M3 | Trial | — |
| L29 | Statutory output has a golden-file suite per country validated against the official schema, and a named human reviewer, before the second country starts | ACC, SCL | Process review (scalability); ERP-Q1 | Convention (guardrail; before the second country) | — |
| L30 | Try the Claude Code **Projects (Beta)** coordinator as the lead (project main chat) instead of one lead session. Trial on low-risk work first (Lane 0 machine gates), money/security lanes only after it passes. Watch: resume-lead checks 1–7 pass (memory loaded, right folder); one Gradle build at a time through lockf; builders keep one repo and their write scope; fresh review after every build and the money/security review rules; no AI attribution; usage per batch vs the session lead (scorecard TOK, EFF); handoff and PROJECT-STATE kept current | EFF, SCL, TOK, DEC | Jabran 2026-11-20 (new Mac) | Trial | — |
| L31 | An App lane that changes the page frame, scrolling, top bar, footer, keyboard or sizes gets an iOS look (scroll, then open search; one keyboard-up form) on one iPhone and one iPad simulator before its merge; every QA round runs "scroll, then open search" | UX, ACC | F1, F9 (2026-11-21): passed JVM tests and reviews, seen only on iOS | Trial (approved by Jabran 2026-11-21) | — |
| L32 | Clean up after builds and tests: stop the Gradle daemons a run started; when Jabran says testing is done, stop the backend services (3 Java processes each) and shut the simulators; Docker stays up | MNT | 2026-11-21: three idle daemons held about 6–7 GB for hours | Trial (approved by Jabran 2026-11-21) | — |

## L33 Two Gradle locks, one per repo
**Status:** Trial (Jabran 2026-11-21, "yes we can run 2 i think?"). **Rule:** BackEnd and App builders use separate Gradle locks, so one job per repo runs at once; full verify runs take both locks and run alone. **Why:** three builders queued on one lock; 16 GB holds two normal jobs (57% free with one running), not two full runs. **Check after the batch:** any out-of-memory, Kotlin daemon crash or swapping (from the speed lanes' peak-memory numbers); none → Convention after two batches; any → back to one lock.
**Trial note 2026-11-21 23:39–23:41:** swap rose 4.4 → 8.3 GB when the BackEnd speed builder ran a whole-suite trial (`--parallel`, 4 workers, 3 forks) under the BackEnd lock only, beside App jobs; calm again after compile, no crash. Rule sharpened: **any whole-suite or `--parallel` run is full-size and takes both locks**; targeted single-module runs keep one lock each.

## L34 Gradle slots with their own home, cleaned up on exit (old Mac)
**Status:** Trial (Jabran 2026-11-22: "we have a lot of space, we can run multiple in parallel but making sure they leave as well when done"). **Rule:** on the old Mac (36 GB) targeted Gradle jobs (builds, compiles, targeted tests) run through `scripts/gradle-job.sh <app|be> <dir> <args>`: up to 2 slots per repo (`NEOERP_GRADLE_SLOTS`), each slot its own lock `/private/tmp/neoerp-gradle-<repo>-slot<n>.lock` and its own `GRADLE_USER_HOME` (`/private/tmp/gradle-home-<repo>-<n>`, dependencies cloned copy-on-write from `/tmp/gradle-home`), Kotlin compiler in-process, and on exit `gradlew --stop` on that home only, with a check that no process is left. Full `verify.sh` runs keep L33 (both locks, alone). The new Mac (16 GB) stays on L33 with one slot. **Why:** 75 % of memory was free with three reviewers and a test run going; a reviewer's targeted run waited minutes on the single App lock; and leftovers (8 orphaned Gradle daemons and a 2-day-old backend stack on this Mac) held memory. A per-slot home means the clean-up can never stop another job's daemon or a running backend. **Check after 2 batches:** time saved, peak memory and swap, "processes left: 0" lines; OOM or swap → back to one slot.

## L35 Reviewers and builders write their own report files; hand-backs stay short (both leads)
**Status:** Trial (Jabran 2026-11-22: "are we using the limits efficiently?" → "same for the new Mac lead"). **Rule:** every reviewer writes its review file itself (verdict line, range line, findings table, what it ran) to the path the brief names (the lead's scratchpad, or the lane's `docs/agents/<lane>/review-<n>-<model>.md` when the reviewer may write there); every builder keeps per-row status in its builder report. The hand-back to the lead is at most ~10 lines: verdict or done/blocked, counts (tests, findings by severity), the file path, and anything the lead must decide. The lead copies the file onto the lane and does not retype it. Leads compact their own session at about 50 % context. **Why:** on 2026-11-22 the old-Mac lead received 6 full reports in its context and retyped each into a file (double output tokens; lead context 37 % after ~2 h). **Check after 2 batches:** lead context growth per lane, weekly usage per lane.

## L36 Fewer rework rounds: self-check, fix with its own test, gate-format reviews from round 1, all targets compiled, neighbours in briefs (both leads)
**Status:** Trial (MEASURE-1, 2026-11-22; Jabran asked "why builders make mistakes that we iterate multiple times"). **Rule:** (1) before hand-back the builder fills a self-check table: one row per brief item with its proof (test, file, screenshot); (2) every fix of a finding comes with its own old-FAIL/new-PASS test, and the builder re-runs targeted tests for everything the fix touched; the fix check reviews the whole fix diff; (3) every review file is in gate format from round 1 (`Reviewer:/Reviewed:/Range:/Verdict:`), so an ACCEPT is gate-ready and there is no final-file round; (4) builders compile JVM, iOS and Android (App) before hand-back; (5) briefs list "neighbours": related items outside the scope, so the builder sees the context and says what it leaves to whom. **Why:** `docs/process/phase4-rework.md`: of 75 HIGH/MEDIUM findings, 22 were brief items missed or not stated, 13 were caused or left open by a fix (10 of 26 FIX rounds), 4 platform/build found after review; six lanes had a separate final-file round (≈1–1.5 h each). **Check after 2 batches:** FIX rounds per lane, fix-caused findings, minutes in the Rework and Waiting buckets (MEASURE-1).
