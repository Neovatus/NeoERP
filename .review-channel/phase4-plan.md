# Phase 4 plan (rest of the phase): lanes, builders, branches, order, reviews, tests — owner: old-Mac lead · for Jabran's review · 2026-11-22

One plan for the whole delivery flow until Phase 4 merges to `main`: which lanes, who builds them, branch and base, order, review tier, merge batches and where each is tested. Both leads follow it in this order. Rules behind it:
D-46 review tiers, D-47 gate scope, D-49 who tests what, D-51 speed rules + test ledger. Changes to this plan: the owner edits it
and rings the other lead; Jabran may change anything.

**Terms:** a **lane** = one branch, one builder, one review round, one gate; it may hold several fixes (commits). A **batch** = a group of lanes that merge one after another (batch A = BE lanes, batch B = App lanes). One batch has several lanes; one lane has several fixes.

## Lanes (the only lanes left in Phase 4; a new lane needs this table first)
| Lane | Repo | Built on | Branch (base) | Tier | Depends on | Batch | State |
|---|---|---|---|---|---|---|---|
| AL-REST-BE | BE | new Mac | `phase/4-b2-al-rest-be-r3` (`df80e554`) | 2 (money: approvals, V79) | — | A1 | **merged `6d948693`** |
| R29b-3U | BE | new Mac | `phase/4-b2-r29b-3u-r` (`df80e554` → rebase after A1) | 2 (isolation) | — | A2 | **merged `1c0fc25c`** |
| EMAIL-UNIQ-BE | BE | new Mac | `phase/4-b2-email-uniq-be` (→ rebase after A2) | 1 + 2nd seat until GATE-3 | — | A3 | **merged `66148f9d`** |
| AL-REST-APP | App | new Mac | `phase/4-b2-al-rest-app` (→ `3fc42d32`) | 2 (money: approvals) | AL-REST-BE merged | B1 | **merged `9f182c69`** |
| FIX-APP-SWITCH | App | new Mac | own branch (→ after B1) | 1 | — | B2 | **merged `6c680b49`** |
| GATE-3a (review survives a clean rebase, G7) | BE + App | new Mac | `phase/4-b2-gate-3a-be` (`df80e554`), `-app` (`3fc42d32`) | 2 (gate) | — | next after the lane in its gate, ahead of the rest of A/B | **BE merged `8472c728`**; App rebased, self-tests running |
| TEST-SCOPE-1 | BE + App | new Mac | own branches | 2 (gate) | — | any, after A | building |
| GATE-3 | BE + App | new Mac | own branches | 2 (gate) | RISK-NARROW-1 merged | any, after A | brief |
| Retest fix lanes (by feature) | BE / App | new Mac | `phase/4-b2-fix-<feature>-<repo>`; small features joined; ≤ 3 per repo | per defect, highest wins | T4 | C | after T4 |
| DOCS-2c | App | new Mac (Sonnet) | `phase/4-b2-docs2c` | 1 (docs) | B, C | D | waits |
| Phase 4 PR | BE + App | old Mac | `phase/4` ← merge `main` | T5 | all above | E | last |

**Branching rules:** every lane branches from the current `phase/4` head of its repo; one repo per lane (cross-repo = two lanes);
a lane rebases **once**, when the owner rings its turn; a rebased lane is pushed as a new `-r`/`-rN` branch (no force push);
no in-between batch branches (lane → `phase/4` → `main` only). Builders: Opus default effort; Sonnet only for fully decided work.
Briefs carry `Review tier:` and the D-51 rules; a fresh Opus checks each new brief before the builder starts.

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
4. **Retest fix lanes by feature (D-57):** every T4 FAIL goes to its origin lane's builder on the new Mac, **one batch lane per repo** (not one lane per
   defect), T1 → T2 → T3; then **only the failed steps** are rerun (T4-lite), with the stack up for that only.
5. **DOCS-2c** screenshots (new Mac) — docs only, T2 one review, no T3 tests beyond the docs check.
6. **TEST-SCOPE-1 and GATE-3** may merge at any point after batch A (gate files; tier 2). From their merge on, T3 is scoped.
7. **T5:** merge `main` into `phase/4` in both repos (normal merge commit), whole suite, smoke flow, MERGE PR verdicts,
   merge BackEnd #8 and App #5. Scorecard + lessons written from the MEASURE-1 timelines.

## Budgets (to catch drift)
- Gate ≤ 15 min (whole suite) / ≤ 6 min (scoped). Flow session ≤ 4 h in two runs. Retest fix lane ≤ 1 review round + 1 re-check.
- A lane that fails T3 twice, or a T4 step that fails twice, comes to Jabran with a one-line reason before a third try.

## Measurements kept per lane (MEASURE-1)
Five buckets (Build, Rework, Review, Test, Waiting), changed files, items; plus gate-failure origin (inside/outside the
builder's run) and builder test minutes (D-49 follow-up), and review runs first vs repeat (D-46 follow-up).

## Efficiency changes (Jabran approved 2026-11-22, D-55)
1. **GATE-3 rebase piece first:** the "review survives a clean rebase" part of GATE-3 (patch-identical commits, base move touches none of the lane's files) is split out as a small first GATE-3 lane (tier 2, gate script), merged before the rest of GATE-3, so later lanes skip re-stamps.
2. **Two testers in parallel in T4:** one backend session, no gate running; tester 1 Kystgruppe users (Ola, Anna, Bjørn) on iPad Pro 13 + iPhone, tester 2 Lahore/Sialkot/Stockholm users (Ayesha, Omar, Hina, Sara, Erik) on iPad Air 13 + iPad Pro 11; each tester owns its companies' data, so they never touch the same documents. Groups R1–R7 are split by company accordingly.
3. **Stream fixes in small batches (not one bug at a time):** FAILs are sent per finished device group (R1, R2, …), all of that group's FAILs in one message; each goes into the fix lane of **its feature** (AL-REST, company switch, B2a/B2b areas, …); features with only 1–2 small FAILs share one lane; at most 3 fix lanes per repo. Only a **blocker** (a FAIL that stops later steps, e.g. sign-in or bill submit) is sent at once. Fixed steps are retested once at the end, only the failed ones.
4. **Final gates in parallel:** T5 BE and App whole-suite gates run at the same time when nothing else runs on the Mac (measured 13 min each, GATE-2).
5. **Use the gaps:** while the new Mac builds, the old Mac writes non-Gradle work (HR H1 brief, Phase 4b plan, scorecard drafts).

## Phase review → next plan
At T5 the owner writes a one-page review of this plan (planned vs real times per test point and lane, re-stamps, repeats, gate failures and their origin, what to change). Its changes go into the next phase plan (`phase4b-plan.md`, HR plan) before their first lane starts. Lessons that hold for two phases become WORKFLOW rules (lessons register).

## Lanes by feature (Jabran 2026-11-22, D-57)
Feature work is cut vertically: one roadmap item = one BE lane + one App lane, tested as one end-to-end user flow. Fixes are grouped by
feature, not by test round (small features joined, ≤ 3 fix lanes per repo). Cross-cutting lanes (isolation, gates, tooling) stay
separate and small. The flow session is ordered by user flow, so each FAIL maps to one feature lane. The 4b and HR plans are per
feature from the start (4.12, 4.14, 4.15 …; H1 slices).

## Phase review checklist (D-63)
At T5 the owner writes `.review-channel/phase4-review.md`: planned vs real time per test point and lane; cost per lane; first-pass gate rate; repeats and re-stamps; escaped defects; and every rule added in Phase 4 (D-43 … D-63) with its numbers → keep / change / drop. Dropped rules leave WORKFLOW in the same commit; changes go into `phase4b-plan.md` and the HR plan.

## T4 trimmed (D-69)
Before T4 runs, the step list drops steps already covered by automated tests on the merged code (screen-size, screenshot, Compose UI tests) and checks backend-only steps through the API (lead, local stack). Every T4 FAIL's fix lane adds an automated test for it. Target: ~1–1¼ h with two testers.
