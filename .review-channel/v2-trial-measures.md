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
