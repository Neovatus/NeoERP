# Phase 4 test plan (rest of the phase) — owner: old-Mac lead · for Jabran's review · 2026-11-22

One plan for where, when and what is tested until Phase 4 merges to `main`. Both leads follow it in this order. Rules behind it:
D-46 review tiers, D-47 gate scope, D-49 who tests what, D-51 speed rules + test ledger. Changes to this plan: the owner edits it
and rings the other lead; Jabran may change anything.

## Test points (each code change is tested at these points and nowhere else)
| Point | Where | What runs | Who |
|---|---|---|---|
| T1 Builder | new Mac, lane branch | tests per fix (old FAIL / new PASS) + full suites of touched services + `:architecture-tests` (later: the gate's scoped set) | new-Mac builder |
| T2 Review | new Mac | reads diff + T1 evidence; tests only to prove a finding (tier 1: 1 Opus; tier 2: 2 reviewers, round 1 only) | reviewers |
| T3 Gate | old Mac, rebased lane = future phase head | `verify.sh` (whole suite until TEST-SCOPE-1, then scoped) + money invariants + reviews check; one at a time, no stack/simulator meanwhile | old-Mac lead |
| T4 Flow session | old Mac, merged `phase/4` heads, stack up only for it | the merged simulator session (below), once per batch | old-Mac tester (Sonnet) |
| T5 Phase gate | old Mac, `phase/4` after merging `main` | whole suite both repos + money invariants + a short smoke flow (sign-in, post, approve, pay, report) | old-Mac lead |

Not tested again: a lane after its fast-forward merge (T3 ran on that exact commit); a flow step already PASS in the test ledger on
code this batch does not change.

## Sequence
1. **Merge batch A (BE):** R29b-3U → AL-REST-BE → EMAIL-UNIQ-BE. Each: T1, T2 on the new Mac, T3 here. No flow test for R29b-3U
   and EMAIL-UNIQ-BE alone (no App screen change); their flows ride in T4.
2. **Merge batch B (App):** AL-REST-APP (after AL-REST-BE) → FIX-APP-SWITCH. T1, T2, T3. Flow test before review (D-51) is
   replaced for these two by T4, because they need AL-REST-BE merged to run end to end.
3. **T4 run 1 + run 2** on the merged heads: `.review-channel/sim-session-phase4-retest.md` (82 steps, 7 device groups,
   ~3.5 h; data N1–N8 set up first, reusing hina.rauf, erik.sand, jonas.moe). Results → test ledger.
4. **Fix batch:** every T4 FAIL goes to its origin lane's builder on the new Mac, **one batch lane per repo** (not one lane per
   defect), T1 → T2 → T3; then **only the failed steps** are rerun (T4-lite), with the stack up for that only.
5. **DOCS-2c** screenshots (new Mac) — docs only, T2 one review, no T3 tests beyond the docs check.
6. **TEST-SCOPE-1 and GATE-3** may merge at any point after batch A (gate files; tier 2). From their merge on, T3 is scoped.
7. **T5:** merge `main` into `phase/4` in both repos (normal merge commit), whole suite, smoke flow, MERGE PR verdicts,
   merge BackEnd #8 and App #5. Scorecard + lessons written from the MEASURE-1 timelines.

## Budgets (to catch drift)
- Gate ≤ 15 min (whole suite) / ≤ 6 min (scoped). Flow session ≤ 4 h in two runs. Fix batch ≤ 1 review round + 1 re-check.
- A lane that fails T3 twice, or a T4 step that fails twice, comes to Jabran with a one-line reason before a third try.

## Measurements kept per lane (MEASURE-1)
Five buckets (Build, Rework, Review, Test, Waiting), changed files, items; plus gate-failure origin (inside/outside the
builder's run) and builder test minutes (D-49 follow-up), and review runs first vs repeat (D-46 follow-up).
