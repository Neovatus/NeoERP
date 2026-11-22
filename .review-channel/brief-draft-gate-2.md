# Brief draft: GATE-2 — parallel gates, slowest classes, gate LOWs (2026-11-22)

**Asked:** Jabran 2026-11-22: "yes [one gate lane], but as the new Mac runs targets it also can run for App and BackEnd, not have to necessarily wait". GATE-SLOW-1 (approved 2026-11-21) folds in.
**Lanes (one repo per builder, same design in both):** BackEnd `phase/4-b2-gate-2-be` from BE `phase/4` (after BE-JDK21 merges: its head; until then `50ac03dc`), App `phase/4-b2-gate-2-app` from App `phase/4` `496c1517` (rebase onto FIX-APP-B1 when it merges). Copy this file into each lane as `docs/agents/gate-2/brief.md`.
**Builder:** Opus high per lane on the builder Mac. **Reviews:** fresh Opus + Fable (gate files, RISK) per lane, or one Fable call covering both lanes (as in TEST-SPEED). Reviewers write their own gate-format files (lessons L35; verify.md "Review files": Reviewer / Reviewed / Range / Verdict).

## Items (both repos unless marked)
1. **Each repo's gate takes only its own lock.** App `verify.sh` uses `/private/tmp/neoerp-gradle-app.lock` (today it takes the BackEnd lock, a leftover); BackEnd keeps `/private/tmp/neoerp-gradle.lock`. No App script, hook or doc may take the BackEnd lock, and no BackEnd one the App lock. So targeted runs, compiles and full gates of the two repos never wait on each other on any Mac.
2. **Own Gradle home per gate:** verify defaults to its repo's own home (e.g. `/tmp/gradle-home-verify-be`, `/tmp/gradle-home-verify-app`, seeded from `/tmp/gradle-home` the same way `scripts/gradle-job.sh` does), `VERIFY_GRADLE_USER_HOME` still overrides; verify stops the daemons of its own home at the end (pass or fail), so nothing stays behind.
3. **Parallel full gates:** the docs (verify.md, WORKFLOW "Test scope" pointer) say: one full gate per repo at a time; a BackEnd gate and an App gate may run together on the old Mac (36 GB); on the new Mac (16 GB) full gates are not run (builder Mac rule), targeted runs of the two repos run in parallel. Remove the "both locks, run alone" wording; any other whole-suite `--parallel` run follows the same per-repo rule.
4. **GATE-SLOW-1:** after the module table, verify prints the 5 slowest test classes of the run (from the JUnit XML it already reads), output only.
5. **Gate LOWs from TEST-SPEED reviews:** a `.gitattributes` anywhere under `docs/` is never light; a `.ok` with an empty or out-of-order `gate=` is refused; the not-light result uses a flag, not output text; the D8 docs-literal scan also catches `"../docs/…"`-style and concatenated literals where cheap (document the limit otherwise); BackEnd: a gitlink is FULL even with `diff.ignoreSubmodules=all`; align the hook warning text and the D8 patterns between the two repos; newline paths print on one line (quoted).
5b. **BackEnd only: `scripts/gw`** (Jabran 2026-11-22): runs `./gradlew` with `-Dorg.gradle.java.home=$(/usr/libexec/java_home -v 21)` (fallback: `JAVA_HOME`), so a plain Gradle call in NeoERP uses Java 21 ≥ 21.0.9 even when a user-level `~/.gradle/gradle.properties` pins an older JDK for other projects; never reads or prints that file. Listed as a light dev script only if it stays out of every gate path; README and dev guide mention it.
6. **Self-tests:** cases for 1 (each repo's scripts never name the other repo's lock), 2 (home chosen, daemons stopped), 4 (slowest list from a fixture), 5 (each LOW), all failing on the old scripts where they fix a hole; `GIT_CONFIG_GLOBAL=/dev/null bash scripts/risk-check-test.sh` all pass.

## Out of scope
GitHub Actions / runners (off until Jabran approves); affected-only test selection (TEST-SCOPE-1, waiting for Jabran).

## Done when
Both lanes built, reviewed (two ACCEPT gate files each), lane-ready written; the old Mac runs the two full gates **in parallel** as the first proof (memory and swap logged).
