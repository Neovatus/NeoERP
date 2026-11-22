# GATE-3 scope suggestions (old-Mac lead, 2026-11-22)

Things that cost time on the test Mac today, with a fix each. Ordered by time lost. Your call which fit GATE-3; the rest can be backlog rows.

1. **Fail fast on reviews.** `verify.sh` runs the 10–13 min suite first and checks reviews last. B2a ran green with no marker because
   `--reviews` was missing. Run `risk-check.sh` (and the "no --reviews but RISK paths in range" check) **before** Gradle; refuse in seconds.
2. **Name the failing tests in the summary.** Today the summary says "2 test(s) failed (see log)". Print class.method (max 10) and the
   module, and mark each as **inside / outside the lane's changed modules**, so a load flake (`DimensionSetConcurrencyTest`) is seen at once.
3. **Flakes outside the lane:** optionally rerun only the failed tests once when they sit outside the changed modules. The marker
   records "passed after rerun: <tests>", and the gate appends a row to `docs/backlog.md` (never silent). Tests inside the lane: no rerun.
4. **Patch-identical review rule** (already in): accept a review across a rebase when `git range-diff` shows every reviewed commit `=`
   and the base move touches none of the lane's files. Today: 4 re-stamps × ~15 min.
5. **Gate-busy helper instead of hand-written pgrep loops.** A plain `pgrep -f gradle-home-verify` matches the waiting shells
   and deadlocked 3 agents for ~30 min. Add `scripts/gate-busy.sh` (exit 0 = a gate runs). Or better, have `gradle-job.sh` wait on the
   repo's gate lock itself, so builders never write the loop.
6. **One way to call `gradle-job.sh`.** It lives in the workspace repo, but briefs and builders call `scripts/gradle-job.sh` inside
   the code repo, which exits 127 (2 lost runs today). Add a thin wrapper in each code repo's `scripts/`, or give a clear error that names the path.
7. **Merge helper:** `scripts/merge-lane.sh <lane-branch> <phase-branch>`. It checks that the branch is ff-only onto the phase head,
   that the marker exists for that sha, that both review files are ACCEPT in gate format, and that there is no AI attribution in the
   new commits. Then it fast-forwards and pushes, and prints the next lane in `.review-channel/merge-queue.md` that needs a rebase and re-stamp.
8. **Gate `phase/hrp-v2` (and any `phase/*`) in the pre-push hook.** Today HR lanes rely on running `verify.sh --range` "by rule".
9. **Jar-mode start reuses built jars.** `run-all-services.sh` runs its own 8-jar Gradle build, which hit metaspace earlier.
   `NEOERP_SKIP_BUILD=1` (or an up-to-date check) should start from the jars `gradle-job.sh` built.
10. **Stack and simulator down in one command** (WORKFLOW "up only while testing"): `scripts/stack-down.sh` stops the service jars,
    `xcrun simctl shutdown all`, and idle Gradle/Kotlin daemons on NeoERP homes only (never the IDE's default home). It prints what is left.
11. App side (could be App tooling, not GATE-3): `tools/sim-signin.sh <device> <user>` does uninstall, `simctl keychain reset`,
    install, dev session and launch. The keychain keeps old users (iPad Air signed in as Erik Berg today).
