# Workflow v2 trial: measures (from 2026-11-24, D-81)

One line per flow or feature, written by the lead at merge. Compared with the Phase 4 baseline at the review point.

## Baseline: Phase 4 (from `phase4-review.md`, `phase4-review-compare.md`)
- ~215 review files for ~45 lane merges; review repeats 48 % (65–68 % before GATE-3a).
- 26 FIX rounds; 13 of 75 HIGH/MEDIUM findings caused or left open by a fix or rebase.
- First-pass gate 64 % (27 of 42); 3 of 15 first-run failures from lane code, the rest environment/process.
- 10 escaped defects after merge (seam bugs most), caught by the simulator, not by gates or lane reviews; the whole-phase seam review found 6 MEDIUM + 8 LOW more.

## Trial lines
| Date | Feature / flow | Mode | Builders | Review runs (first / repeat) | Fix rounds | Findings HIGH/MED/LOW (review) | Found later (test / feature review) | Gate first pass | Wall time | Cost (tokens) | Brief gaps |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-24 | core/phase-4-fixes | light v2 (direct fix) | 1 BE + 1 App (Opus) | 1 / 1 (Fable high, 3 BE areas; re-check of the HIGH only) | BE 3 (findings, where-else, review), App 2 | review 0/0+1 HIGH/6 LOW | App 4 + BE 7 found by the fixers themselves | n/a (no whole suite, D-81 add. 5) | ~3 h 15 m start → main (19:54–23:10); ~65 min lost to fixer whole-suite runs | BE ~480 k, App ~450 k, review ~240 k tokens | BE 3, App 2 |
| 2026-11-24 | core/app-test-speed | v2 (6 steps) | 1 App (Opus) | 1 / 0 (Opus high; MEDIUM fixes not re-checked, Jabran) | 1 | 0 HIGH / 2 MED / 4 LOW | — | n/a | ~2 h 50 m (21:35–00:25); ~15 min lost to an unneeded baseline whole suite | builder ~325 k, review ~190 k tokens | 1 (Accounts per-flow split did not reduce Accounts runs) |
| 2026-11-25 | accounts/dimension-rules · flow 1 set-rules | v2 (6 steps; detailed brief + brief check) | 1 BE + 1 App (Opus) | 1 / 0 (Opus high) | App 1 (time-box leftovers + 3 LOW + test gaps) | 0 / 0 / 10 | sim: 0 FAIL, 1 MED→LOW (reviewer), 6 LOW + a11y labels; stack checks OK (backfill 2384/0 diff, invariants) | n/a (gate per feature) | BE ~55 m build after plan; App ~3 h (box hit, 6 items left) + fix round ~1 h 10 m | BE ~590 k, App ~630 k, review ~400 k, brief check ~150 k | lead brief 18 gaps (brief check); BE 3, App 3 |
| 2026-11-25 | accounts/dimension-rules · flow 2 post-with-rules | v2 (short brief, builder-owned discovery, specialist lines, 20-min notes) | same builders, resumed | 1 / — (Opus high; FIX) | in progress (BE + App, one round with flow 1 sim findings) | 0 / 2 / 11 | sim requested | n/a | BE plan → build ~50 m incl. 3 stop-and-reports (line origins, VAT link, write-off); App plan + build ~45 m | BE ~920 k cumulative, App ~850 k cumulative, review ~375 k | BE 3 (role-accounts read unbuilt, no line link, system-line rules), App 2 |
