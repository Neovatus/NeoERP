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
| 2026-11-24 | core/phase-4-fixes | light v2 (direct fix) | 1 BE + 1 App (Opus) | | | | | | | | |
