# Phase 4 timing: where the time goes (MEASURE-1, first pass) — 2026-11-22

Sources: `phase4-lane-timing.md` (git commit times, 15 merged lanes, both Macs) and `phase4-timing-notes-newmac.md`
(agent run time and tokens from the new Mac's task notifications). Commit times are proxies; agent times are exact.

## What the numbers say

| Stage | Lane-hours (share) | Code lanes only (11) | Agent working time inside it | So the rest is |
|---|---|---|---|---|
| Build | 16.2 h (22%) | 28% | 0.5–1.5 h per lane (R29b-2: 3 h 19 m) | mostly real work |
| Review + fix | 24.4 h (32%) | 42% | reviews 5–17 min, fix checks 1–9 min, fix rounds 6–46 min | **waiting**: hand-offs, review slots, the separate "final gate file" step (≈1.5 h gap in B1 and BE-JDK21) |
| Gate + checks | 20.8 h (28%) | 19% | full gate was 36–54 min, now 8–12 min; simulator checks 8 min in parallel | waiting for batch verdicts, docs lanes waiting for another lane's full run, reruns (OOM, flaky test, missing `--reviews`) |
| Waiting for MERGE | 13.7 h (18%) | 12% | — | verdicts written at night (04:00–04:30) waited until morning |

Mean lane: 5.0 h from assignment to merge. The test runs themselves are no longer the bottleneck (BackEnd 54 → 11 min,
App 36 → 8–11 min). **Most lane time is waiting between steps, not building, reviewing or testing.**

## Proposals (lead, input for Jabran)

1. **Review files in gate format from round 1.** Each reviewer writes `Reviewer:/Reviewed:/Range:/Verdict:` in every
   review file, so an ACCEPT is gate-ready at once; no separate "final file" round (saves ≈1–1.5 h per lane).
2. **Fix check in the same reviewer agent, resumed at once** when the fix lands (already L35); the builder pushes and
   rings the doorbell in the same step.
3. **verify.sh finds the lane's final review files itself** when `--reviews` is not given (from `docs/agents/<topic>/`),
   so a gate cannot pass tests and still miss its marker (cost 11 min today). Small addition to GATE-2 or a follow-up.
4. **Builders compile every target before hand-back** (JVM tests, iOS and Android compiles, 6 GB heap via
   `gradle-job.sh`): B1's Android fix and B2a's OOM were found after review.
5. **Smaller slices, more in parallel** (approved: parallel builders): R29b-2's 3 h 19 m build is the largest single block.
6. **MERGE wait (Jabran's call):** either a standing MERGE for lanes with gate OK + both reviews ACCEPT + no open
   decision + not money/security, or fixed MERGE times (e.g. morning and evening batches). Money/security lanes always ask.
7. **Keep measuring:** every lane-ready carries `## Timeline` (both Macs, from today); re-run this analysis after the
   Phase 4 PR.
