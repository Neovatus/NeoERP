# Phase 4 review — lead (old Mac) · 2026-11-24

Built from `phase4-review-data.md` (every number cited there). An independent review (`phase4-review-independent.md`, raw sources only, D-79) is written separately; the two are compared by a third agent and every disagreement goes to Jabran before the `main` merge.

## The numbers in one place
- **45 lane merges** (BE `phase/4` 24, App `phase/4` 18, `phase/hrp-v2` 3) + 8 workspace docs lanes. **64 gate runs, 20 not OK.**
- **First-pass gate 64 %** (27 of 42). The 15 first-run failures: **3 lane code**, **8 environment** (load, flake, Docker down, heap, killed process, usage stop), **4 process/format** (2 review-file format, 2 missing `--reviews`/`--range`). Since AL-REST-BE, **no first-run failure came from lane code.**
- **Review repeats 65–68 % → 48 %** after GATE-3a (0 re-stamps, 2 "REVIEW CARRIED OVER"). D-46 ("only the FIX reviewer re-checks") was **broken 3 times**.
- **13 escaped defects**: seam 9, rule 1, gate tooling 2, database query 1. Caught by: **simulator/T4 5, reviews 4, gate 0.**
- **Biggest sinks**: TEST-SCOPE-1 BE ~6 h (3 fix rounds, 4 review rounds); R29b-2 build 3 h 19 m; a 73-min gate under overload; Gradle-lock waits on the 16 GB Mac (~40 min); early lanes spent 32 % in review + fix and 18 % waiting to merge.

## Top problems (my own included)
1. **The gate tests that code works alone, not that pieces work together.** 9 of 13 escaped defects were seam bugs (wrong company data, release flag, file type, stand-in path) and the gate caught **none**; the simulator caught them late and expensively. → D-73 (strict fakes, contract tests) is the most important change for 4b/HR.
2. **My process slips cost gate runs.** Missing `--range` (16 min), a reviewer writing into a gated worktree (13 min), review-format refusals, and running the stack + a simulator beside a gate (load ~570 → a 73-min gate and 503s). Each became a rule, but they should never have needed one.
3. **Simulator sessions were planned badly by me.** Data not prepared (Ola not on Lahore, D1, AC418-10a) blocked steps; three "failures" were correct behaviour (stand-ins, D-64) because my plan's steps were wrong; T4b took ~130 min against a 75-min estimate.
4. **Measurement has holes.** 7 of today's lanes have **no verdict file** (GATE-3a, DEMO-FM2, FIX-OB-IMPORT BE/App, B2A-REFRESH, DOCS-2c, TEST-SCOPE-1); the "first-pass gate" field was never filled in any lane-ready; cost per lane (D-63) mostly not recorded. Rules about measuring were added faster than the measuring was done.
5. **Review repeats are still high (48 %).** GATE-3a removed re-stamps, but D-46 is not enforced by the gate yet, so reviewers still re-check by habit.

## What worked (with evidence)
- **GATE-3a**: two lanes' reviews carried over clean rebases with no re-stamp (TEST-SCOPE-1 BE and App).
- **End-to-end testing found what nothing else could**: Approval limits could not be switched on (`released = false`) — reviews and unit tests passed it.
- **Lane-code quality**: zero first-run gate failures from code since AL-REST-BE.
- **Parallel BE + App gates** (13–15 min each) and **two testers by company** (tester 2's group in 27 min).
- **Brief check (D-51)**: found 32 gaps in the HR H1 briefs before any builder started.
- **Trim against automated tests (D-69)**: 33 simulator steps dropped as already covered.

## Rules added this phase — my calls
| Rule | Call | Why |
|---|---|---|
| D-43 Fable pause, fresh Opus as 2nd seat | keep | worked; only issue was the reviewer-name label, solved |
| D-44 default effort, high only for security | too early | no quality drop seen, but cost not recorded per lane |
| D-46 review tiers | **change** | right rule, broken 3×; needs gate enforcement (GATE-3 phase) |
| D-47 gate scope | **change** | BE 2 min vs 16 (keep); App saves nothing until `ScreenSizes.kt` is split |
| D-49 who tests what | keep | zero code first-run failures since AL-REST-BE |
| D-51 speed rules (brief check, check first, ledger) | keep | 32 brief gaps caught; ledger cut duplicate sim steps |
| D-51 "flow test before review" | **change** | not applied: flows needed the BE merged first; run flow tests on the lane's own stack when the BE half is lane-ready |
| D-53 / D-55 one phase plan + efficiency changes | keep | plan held the order; two testers and streamed fixes worked |
| D-57 lanes and fixes by feature | keep | narrow fix lanes (AL release, OB import, B2A refresh) reviewed fast |
| D-61 Accounts independent on the new Mac | too early | 4b not started; Gradle-lock waits already show the 16 GB limit |
| D-63 principles, cost + first-pass measures | **change** | measures not recorded; make the merge helper refuse a merge without them |
| D-65 fewer sub-agents | too early | resuming a builder worked (DEMO-FM2); not measured |
| D-67 brief-gap line | keep | produced concrete, fixable brief gaps |
| D-69 automate what repeats | keep | 33 steps dropped; sim time still too long |
| D-71 fix-lanes-only at 90 % | **drop** | superseded by D-56 (99 %) |
| D-73 seam tests | keep (priority) | the main lesson of the phase; too early to measure |
| D-75 personas + a11y | keep | found 13 a11y issues; measure properly once AXe is in |
| D-77 GATE-3 own phase | keep | right split: tooling, not shipped |
| D-79 independent process reviews | keep | this review is its first use |

## Changes for 4b and HR (into their plans before the first lane)
1. **Seam tests first** (D-73): strict fakes lane before feature lanes; a contract test row in every brief.
2. **The merge helper enforces the record**: no merge without a verdict file, first-pass result and cost line (GATE-3 phase).
3. **Simulator sessions need a data-prep checklist that is run and checked before testers start**, and a plan check against the spec so by-design behaviour isn't tested as a failure.
4. **Enforce D-46 in the gate** (GATE-3 phase) so repeats drop below 48 %.
5. **Keep heavy test runs off the 16 GB Mac** (Gradle-lock priority, heavy runs on the old Mac).

## Own action before the `main` merge
Write the 7 missing verdict files from their lane-readies and gate logs, so Phase 4's record is complete.
