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
