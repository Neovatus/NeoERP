# Lessons register

Every batch or QA round produces lessons. They are not rules straight away: each one is tried, checked over more batches, and only then becomes a convention.

**Stages**

| Stage | Meaning | Moves on when |
|---|---|---|
| Proposed | Seen once, written in a round's Lessons section | Lead and Jabran agree to try it |
| Trial | Used in the next batches; each batch notes whether it helped | Helped in 2 batches with no real downside → Convention. Did not help or cost more than it saved → Dropped |
| Convention | Moved into WORKFLOW.md (team rule) or memory (lead behaviour), with the date | Revisited only if a later batch shows a problem |
| Dropped | Kept here with the reason, so it is not proposed again unchanged | — |

**At the end of every batch or round** the lead: adds new lessons as Proposed; records for each Trial lesson whether it helped ("+ batch name" or "− batch name, why"); promotes or drops those that have enough evidence; tells Jabran what moved.

## Register

| # | Lesson | Source | Stage | Evidence |
|---|---|---|---|---|
| L01 | Retest only the screens a fix lane touched; no full re-walk of the flows | QA1 retest (2.7 M tester tokens for small fixes) | Trial | — |
| L02 | Sonnet testers in small chunks (10–20 min, one device set) instead of one long Opus run | QA1 retest | Trial | + QA1 retest (chunks 5–18 min covered as much as the 63-min Opus run) |
| L03 | Repeat faults become build rules (detekt / grep in Gradle, pre-commit hook): no format outside NeoFormat, no raw text field for amounts, no hardcoded colours | QA1 retest | Proposed | — |
| L04 | Reviewers load one project review-checklist skill instead of the checklist being copied into each brief | QA1 retest | Proposed | — |
| L05 | Fix the shared component, not the one screen; briefs name the component and every screen that uses it | QA1 retest (G12, G17, G32 partly fixed) | Trial | — |
| L06 | iOS-only checks become JVM tests where possible: size tests at 667×375 and 874×402, keyboard type per numeric field, per-country number parse/format | QA1 retest | Trial | — |
| L07 | Lead reads small things itself; reads of more than 3 files, long logs or web pages go to a sub-agent and only the conclusion comes back | Jabran 2026-11-20 | Trial | — |
| L08 | Grant simulator access when a device is booted, before a tester needs it | QA1 retest (iPhone SE prompt missed) | Trial | — |
| L09 | Check the build exit and "0 failed" before any push; never chain a push after a background test | QA1 merge (red push) | Convention (memory, 2026-11-19) | + QA1 merge fix-forward |
| L10 | Collect all findings of a round, fix once at the end; only flow blockers fixed at once | QA round 1 | Convention (WORKFLOW.md, 2026-11-19) | + QA1, + QA1 retest |
