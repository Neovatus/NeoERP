# Phase 4 review — comparison of the two reviews · 2026-11-24

**A** = lead's review (`phase4-review.md` + `phase4-review-data.md`). **B** = independent review (`phase4-review-independent.md`).
Written by a third agent that wrote neither (D-79). Facts checked against `lead-decisions.md` (LD), `escaped-defects.md` (ED),
`phase4-plan.md` (P), `WORKFLOW.md` (WF), the rework/timing files and git. Each disagreement ends with a question for Jabran.

## 1. Agreed (settled)
1. **Seam bugs are the main quality problem.** Pieces that work alone broke when joined (release flag off, wrong company data, file type). The simulator found them, not the gate or reviews. D-73 (seam tests) is kept as the top change for 4b/HR.
2. **The lead's own operating slips cost gate runs**: missing gate arguments, the review-file format, running the stack/simulator next to a gate, a dirty worktree.
3. **Simulator sessions were badly prepared**: test data missing (Ola, D1/AC418-10a). Three "failures" were correct behaviour because the plan's expected results were wrong (D-64). Both want a data check before testers start, and a check of the plan against the spec.
4. **Measuring was promised but not done.** "First-pass gate" was never filled in on any lane-ready, and cost per lane was mostly not recorded (D-63).
5. **What worked**: GATE-3a carried reviews over clean rebases; narrow fix lanes by feature (D-57) needed 0 fix rounds; parallel BE + App gates; one phase plan (D-53/D-55); the test ledger; D-69 trimmed 33 simulator steps.
6. **Rules, same call:** D-49 keep · D-53 keep · D-57 keep · D-61 too early · D-65 too early · D-67 keep · D-69 keep · D-71 (and D-54) drop, replaced by D-56 · D-73 keep. **D-51:** both keep the brief check and the ledger, and both change "flow test before review" so that a BE + App pair gets a flow test before merge.

## 2. Disagreements
| # | Topic | A says | B says | Evidence | **Jabran's decision** |
|---|---|---|---|---|---|
| 1 | **What to do about process failures** (the biggest split) | Make the gate enforce more: D-46 in the gate, a merge helper that refuses a merge without a verdict and a cost line, a full GATE-3 phase. | Gate tooling is already too costly. Use checklists and a data script, not more scripts. Cap GATE-3. | B: in the first 15 lanes, the 5 gate lanes held 36 of 75 HIGH/MEDIUM findings (`phase4-rework.md` A2). GATE-3a cost ~780 k tokens (data §6: 185+215+180+200 k) and opened a forgery hole (LD D-52). A: re-stamps went from 22 to 0 after GATE-3a (data §3). | Should the fix for process slips be more gate enforcement (A) or checklists, with gate tooling capped (B)? |
| 2 | D-77: GATE-3 as its own phase | keep | change: time-box it to 1 day with a named list, or run it beside 4b/HR | LD D-77: the order is workflow review → GATE-3 phase → 4b + HR. No limit on time or scope is written. | Does GATE-3 get a fixed time limit (say 1 day, incident items only), or does 4b/HR wait until it is finished? |
| 3 | D-45: GATE-3 scope | not rated | change: keep only items backed by an incident (fail-fast review check, failing-test names, lock wait); the rest goes to the backlog | LD D-45 lists 7 items plus the D-46 additions. B ties 3 of them to real reruns (WF timing: two 11-min reruns). | Should the GATE-3 scope shrink to the items that real incidents justify? |
| 4 | D-43: Fable paused, fresh Opus as second reviewer | keep | drop (it has expired). When it is available, the second seat should be a different model. | LD D-43: "until the weekly reset (2026-11-24 15:00)". Fable found the AC418-BE HIGH where Opus said ACCEPT (data §7). | After the reset, should tier-2 second seats go back to a different model (Fable) when budget allows? |
| 5 | D-46: review tiers | change: enforce "only the FIX reviewer re-checks" in the gate (it was broken 3 times) | keep, but the second seat must be a different model or angle (seams/integration), not a second Opus | Data §3: 3 re-checks by reviewers who had already ACCEPTed. ED: every pre-merge seam break was found by a builder or the simulator, never by a "brief + diff only" reviewer. | Fix the repeat reviews with gate code (A), or change who the second reviewer is (B)? Or both? |
| 6 | D-47: scoped gate per lane | change: the BE saving is real (2 vs 16 min); the App saves nothing until `ScreenSizes.kt` is split | change: put back a whole-suite run at every phase → main (see §3 item 1) | P l.97 vs WF l.125. A's 2 vs 16 min is one service only; B quotes 5–7 min per gate (`phase4-timing-analysis.md`). | Must every phase → main run the whole suite, even when `main` has not moved? |
| 7 | D-44: default effort | too early (cost not recorded) | keep (small default-effort lanes needed 0 fix rounds) | Data §7: "no before/after measure in any source". A is closer to the evidence. | Keep D-44 as it is, or mark it a trial until there are cost numbers? |
| 8 | D-55: plan efficiency | keep | keep items 1, 4, 5; change item 2: parallel testers start only after a scripted data check passes and the machine is idle | Testers lost runs to load 420/570 and missing data (`t4-results-tester1.md`, ledger l.13). Data §5: tester 1 took ~130 m, tester 2 took 9–27 m. | Should parallel testers be blocked until a scripted data and load check passes? |
| 9 | D-62: the read-scan bar | not rated | change: "unsure = FULL" took TEST-SCOPE-1 to 4 review rounds, and it relies on a phase → main whole suite that is now skipped | LD D-62 names "the whole suite at phase → main" as a guard. P l.97 drops that suite. | Keep the strict scan bar? If yes, the phase whole suite must stay (see #6). |
| 10 | D-63: measure, then change | change: make the merge helper refuse a merge without the numbers | keep and enforce: no new rule without a metric and a check date; back-fill numbers at merge | Both cite "first-pass: pending" everywhere (data §6). The difference is tooling (A) vs a rule for adding rules (B). | Enforce measuring through the merge helper, or through a "no rule without a metric" rule? |
| 11 | D-75: personas + accessibility | keep | too early / defer until data setup is reliable | T4b found 7 a11y findings (`t4b-results-tester1.md`), but sessions already overran (~130 m vs 75 m). | Personas now, or after the test-data script works? |
| 12 | D-79: independent reviews | keep (first use) | not rated | This comparison is its first output. | none (keep) |
| 13 | Review repeats (A's top problem 5) | 48 % is still too high; enforce D-46 | re-stamp cost was overstated: 0.7–3.7 min each in agent notes vs ~15 min in the inbox | Data §6 shows re-stamps of 1–3.7 m. The inbox (`erp-lead.md` l.1091) says ~15 min. | Is cutting the repeats further worth more tooling? |
| 14 | Escaped defects: what to count | "13 escaped defects", "gate caught none" | "every escaped defect … is a seam or a pre-existing cross-lane gap" | Both overstate; see §4. | none (correct the record) |

## 3. Found only by B (A's blind spots)
1. **The whole suite can silently stop running (D-47 + the fast-forward rule).** P l.97 (11-24) says: run the phase-level whole suite "only when `main` has moved". Once lane gates are scoped (TEST-SCOPE-1 is merged), a phase where `main` has not moved never runs the whole suite on the combined code.
   - This breaks PRINCIPLES 1 ("once combined").
   - D-62 explicitly relies on that suite.
   - It also contradicts WF l.125 (D-47: always merge `main` in, then run the whole suite) and WF l.350 (phase PR: "final full gate … whole suite", "merge commit").
   - For Phase 4 alone it is safe, because every Phase 4 gate ran the full suite (data §7: all markers `gate=full`).
   - P l.97 has no D-number in LD, so it is unclear whether Jabran approved it as a rule.
2. **Gate and tooling work used a large share of the phase.** 88 of ~215 review files are on gate/tooling lanes (B's count from `origin/phase/4`; not re-counted here). TEST-SCOPE-1 took ~6 h for a 5–7 min saving per gate, and no Phase 4 lane used it (data §7: all `gate=full`). R34-BE needed 3 fix rounds and Lane 0 App needed 4.
3. **Rule churn.**
   - Every rule from D-43 to D-75 is dated 11-22 (LD).
   - WORKFLOW grew from 27.4 KB (git, before 11-21) to 46.2 KB (now). B says 28.4 KB.
   - 608 workspace commits on 11-21/22 (git confirms).
   - D-54, D-71 and D-56 reversed each other within ~40 min (LD).
   - Numbers collided (D-46u/D-47u).
   - `PRINCIPLES.md` is copied into each topic folder, so the copies can drift.
4. **Fix rounds create defects.** 13 of 75 HIGH/MEDIUM findings were caused or left open by a fix or a rebase, which accounts for 10 of the 26 FIX rounds (`phase4-rework.md` A6). In 4 fix checks, one seat ACCEPTed what the other flagged.
5. **Independence has a price.** "Brief + diff only" reviewers cannot see seams. Opus + Opus is less diverse than Opus + Fable.
6. **Process before product.** Three process steps (workflow review, GATE-3 phase) come before any 4b/HR feature (LD D-77).
7. **Coordination load between the two Macs**: about 60 messages a day (`erp-lead.md` l.934–1294), and D-61 adds more boundaries.
8. **Missing deliverables**: the L37 slicing comparison (`docs/process/slicing-comparison.md`) was never written.
9. **Standing merge** was the biggest time win (13.7 h of merge waiting removed). A does not mention it.

**Found only by A:** 7 lanes have no verdict file (data §1, confirmed). A plans to write them before the merge, and B does not mention this.

## 4. Factual conflicts
- **"13 escaped defects" (A) is too high.** ED itself marks the R29b-3U × AL-REST-BE break as "caught before the gate". The AC418 steps 15/16 were pre-merge simulator finds (data §4 title: "escaped defects … and pre-merge device finds"). That leaves **10 true escapes** after merge, 13 counting pre-merge finds. LD D-73 says "4 escaped bugs, all seam", which counts only that day's device finds. "Seam 9" is the collector's own classification (data §4 footnote).
- **B's "every escaped defect is a seam" is wrong.** ED has a money-rule defect (duplicate receivables, N10), a database query shape (outbox claim) and two gate-tooling rows.
- **WORKFLOW size**: B says 28.4 KB → 46.2 KB (+62 %). Git shows 27.4 KB before 11-21 → 46.2 KB (+69 %). B's direction is right; the start figure is slightly off.
- **Gate-lane share**: B says "26 of the 28 gate format/process rows". `phase4-rework.md` A2 says 28 of 78 rows are gate-script defects, and 26 of the 36 HIGH/MEDIUM findings in the five gate lanes are of that type. B mixes the two denominators; the point stands.
- **Gate rerun minutes**: A gives "missing `--range` 16 min" (AL-REST-APP) and B gives "`--reviews` 11 min" (FIX-APP-B2a, `phase4-lane-timing-oldmac.md` l.165). These are two different incidents, so both are right.
- **Load**: A gives ~570 (RISK-NARROW BE 73-min gate). B gives 420 (start of T4) and 570 (bill submit). These are different moments; all three are in the sources.
- **D-47 saving**: A gives 2 vs 16 min (one BE service, `lane-ready-test-scope-*`). B gives 5–7 min per gate (`phase4-timing-analysis.md`). Both are sourced; A's is a best case and B's is a typical case.
- Agreeing numbers: TEST-SCOPE-1 ~6 h / 3 fix rounds; repeats 68 % (D-46 sample); GATE-3a ~780 k tokens.
