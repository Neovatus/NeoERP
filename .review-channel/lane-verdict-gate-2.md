# Lane verdict: GATE-2 (BackEnd and App) — 2026-11-22

**Verdict: MERGE** (old-Mac lead, test Mac), **merged** under the standing merge rule: BE `phase/4` `64509abe` → `16d9a3fe`, App `phase/4` `f7c993f4` → `8d7e8a96`, fast-forwards through the pre-push hook (RISK markers).
- Fast-forward possible in both; only gate files and docs changed; no AI attribution (0 matches).
- Reviews: Opus + Fable, both ACCEPT in both repos (Reviewed `a232b393` BE / `853c2c81` App; later commits review files only); `risk-check.sh --reviews`: REVIEWS OK both.
- **Proof run (the lane's point):** both full gates started 07:55:56 **at the same time, no lockf wrapper**; each took its own lock and home.
  - BackEnd: `verify: OK`, 13 min, 4438/0/59, money invariants OK; 5 slowest classes printed (TrialBalancePropertyTest 82 s first).
  - App: `verify: OK`, 13 min, 3959/0/0; 5 slowest printed (A4ScreenSizeTest 139 s, KeyboardInViewTest 113 s).
  - Processes on `gradle-home-verify-be/` / `-app/` during the run: up to 7 / 4 (daemons carry the home on their command line, D-32 item 5); after the run **0 Gradle processes** on either home (the "left=1" count was the lead's own monitor loop matching the string).
  - `scripts/gw --version`: Launcher and Daemon JVM Temurin 21.0.13 (≥ 21.0.9) from `org.gradle.java.home`.
  - Memory: swap 18.4 GB before the start (4 simulators, jar stack, idle daemons from earlier runs), peak 28.0 GB, no failure; after shutting simulators and three idle daemons of the lead's own earlier runs: 6.4 GB. **Rule for parallel gates on this Mac: shut simulators and stray daemons first.**
- Back-to-back the two gates would take ~21 min; in parallel 13 min.

## Timeline (old Mac, MEASURE-1)
- Lane-ready doorbell ~07:50; checks + worktrees 5 min; gates 07:56–08:09 (13 min, parallel); clean-up 5 min; verdict and merge ~08:20 Europe/Oslo. Review 0 min here (reviews on the builder Mac). Waiting for Jabran: 0 (standing merge).

## After the merge (lanes based on the old heads)
- R29b-2 (on BE `64509abe`) → rebase onto `16d9a3fe`. B2b (on App `f7c993f4`) → rebase onto `8d7e8a96`. RISK-NARROW-1 (cut from the GATE-2 heads) → rebase onto the merged heads (same commits). TEST-SCOPE-1 may start now.
- WORKFLOW "Test scope" text (lane-ready "At merge", D-32 item 4): the builder-Mac lead applies it, as it said.
