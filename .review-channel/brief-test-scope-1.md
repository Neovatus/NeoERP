# Brief: TEST-SCOPE-1 — gate runs only the affected modules and flows, BackEnd and App (2026-11-22)

> **Principles first (D-63):** read the workspace `docs/PRINCIPLES.md` (8 principles; the WORKFLOW rules are examples of it). Builders who see one repo get a copy of it in the brief folder.

**Approved:** Jabran 2026-11-22: "yes to … test scopes for target & effective services & flow, both app & backend". Two twin lanes: `phase/4-b2-test-scope-be` (BackEnd, the rules below) and `phase/4-b2-test-scope-app` (App, section "App" below). Both start **after GATE-2 merges** (all edit `verify.sh`, `risk-check.sh`, the hook).

**Asked:** Jabran 2026-11-22: "make sure duplicates are not running; target and affected places run the test; we should
only test in full those services that are affected, not all services."
**Repo / lane:** BackEnd `phase/4-b2-test-scope-be` and App `phase/4-b2-test-scope-app`, each cut from its `phase/4` after GATE-2 merged. Copy this file to `docs/agents/test-scope-1/brief.md` in each lane.
**Builder:** Opus 5.5, default effort (D-44). **Reviews (tier 2):** a fresh Opus 5.5 (default) + an independent Opus 5.5 security seat at high effort (D-43: no new Fable), diff + brief only. Seat B signs `Reviewer: Opus 5.5 security (D-43)`.
Tier 2 because it changes what the gate tests. **Gate files changed → RISK → whole-suite run for this lane itself.**
**Where it runs:** builder Mac builds with targeted runs; the old Mac (test Mac) runs the gates (own lock per repo after GATE-2).

## Goal
A `phase/4` push needs a passing run of **the modules the range affects**, not the whole BackEnd. Same bar for those
modules (all their tests, floor, skips allowlist, money invariants); unaffected services are not re-tested.

## Rules (BackEnd; approved 2026-11-22)
1. **Affected set** = every Gradle project with a changed file in the range, **plus every project that depends on it**
   (computed from the Gradle project graph at the range head, never a hand-kept list), **plus always**
   `:architecture-tests` (tenant ratchet, Lane 0 names) and the money invariants (as today).
   - A change in `shared/*` → that module + all its dependents (often all services: fine).
   - A migration in `services/<x>/` → `<x>` (and its dependents).
2. **Whole suite** (today's full run) when the range touches: root `build.gradle.kts`, `settings.gradle.kts`,
   `gradle/**`, `gradle.properties`, the wrapper, `buildSrc`/convention plugins, any gate file (`verify.sh`,
   `risk-check.sh`, hooks, test floor, skip allowlist, `money-invariants.sh`, acceptance scripts, `risk-paths.txt`),
   or a file outside every project that is not docs/dev-script (unknown → whole suite). Also once before each
   Phase PR (4.19) and when Jabran asks.
3. **Light gate** (TEST-SPEED-1) unchanged: docs and listed dev scripts only.
4. **Marker:** `gate=affected` with `modules=<sorted list>` and `graph=<sha256 of the project graph>`; the pre-push
   hook recomputes the affected set for the pushed range **with the push base's scripts** and accepts the marker only
   if its modules ⊇ that set and the range matches (same rules as the light marker: base = remote head, ends at HEAD).
   A whole-suite marker (`gate=full`) satisfies any range.
5. **Test floor per module:** `verify-test-floor.txt` gets a minimum test count and required classes per project; an
   affected run checks the floors of the modules it ran; the whole-suite total stays for `gate=full`.
6. **No duplicate runs:**
   - verify prints the affected set and the reason for each module before Gradle starts (`--plan` prints it and exits).
   - If a valid marker for the same HEAD, range and scope exists, verify says so and exits 0 without re-running,
     unless `--force-rerun`.
   - `--rerun` / no build cache stays as today for the modules that do run (no "UP-TO-DATE" tests in a gate).
7. Keep `--continue`, the parallel forks and the per-fork databases from TEST-SPEED-1.

## Flows (both repos)
"Affected" also covers the flows that cross the changed code, not only its module: the BackEnd acceptance/flow scripts
and route tests of every affected service run with it (a change in accounts-service runs the accounts flows; a change in
a shared module runs the flows of every dependent service). The plan output names each flow and why.

## App (lane `phase/4-b2-test-scope-app`)
The App is one Gradle module (`composeApp`), so the affected set is **test packages**, picked with Gradle test filters:
1. **Affected** = test classes under the same feature package as a changed main file (`features/<x>/**` → tests under
   `features/<x>/**`), plus tests of any feature that imports a changed file (from a source scan at the range head; unknown
   → whole suite), plus **always** the build-rule scans, the i18n/string scans, and the screen-size and layout tests of the
   affected features.
2. **Whole suite** when the range touches `core/**`, `designsystem/**`, `ui/shell/**`, navigation/routing, DI modules,
   `commonMain` resources shared by every feature, build files, gate files, or an unknown path; and once before each
   Phase PR.
3. The iOS compile (`compileKotlinIosSimulatorArm64`) still runs on every non-light gate (it is a compile, not a test).
4. Marker, hook, per-scope floor, `--plan`, no-duplicate rule and tests: as for the BackEnd (`gate=affected`, a list of
   packages instead of modules).

## Out of scope
No GitHub Actions (off until Jabran approves).

## Tests (in the lane)
risk-check / scope cases as shell tests: service-only change → that service + architecture-tests; shared change →
dependents; migration → service; build file / gate file / unknown path → whole suite; rename across modules → both;
delete-only; a marker whose modules miss one → hook refuses; a stale graph hash → refuses; light range unchanged.

## Done when
`verify.sh --plan` and an affected run work on a one-service range (time it); the hook accepts/refuses as above; docs
(`docs/operations/verify.md`, WORKFLOW "Test scope" pointer) updated; builder report with timings; lane-ready.

## Lead note 2026-11-22 (Jabran's D-47 gate scope)
**Jabran 2026-11-22:** the whole suite runs only for a phase → main PR, after main has been merged into the phase
branch. TEST-SCOPE-1 therefore makes:
- **scoped** the `verify.sh` default for a `phase/*` range: the changed modules and their dependents, plus
  `:architecture-tests` and the money invariants every time;
- **full** the default for `main`.
The scoped run must print which modules it ran and why (changed, or a dependent of a changed module). It must fail safe:
when the module graph can't be read, it runs the full suite.
`Review tier: 2` (gate scripts).
- **D-49 (Jabran, old Mac):** reviewers no longer re-run tests. Builders run the gate's own scoped set before hand-back,
  so TEST-SCOPE-1 also ships a builder-side command (for example `scripts/verify.sh --scoped-tests-only --range
  origin/phase/4..HEAD`, or a `scripts/test-scope.sh <be|app> <worktree>` that prints and runs the same module set
  through `gradle-job.sh` and the repo lock). It runs exactly the test set the gate would run, without the review
  checks, so a builder's green means a gate green on tests.

## Lead note 2026-11-22 ~19:45 (start; current rules)
- **Base:** BE `phase/4` `8472c728`, App `phase/4` `a8e004a6` (GATE-2 and GATE-3a merged). Reviews carry over a clean rebase (GATE-3a): keep the lane's commits patch-identical on a rebase, so no re-stamp is needed.
- **Runs beside the T4 fix lanes** (Jabran via the old Mac, "Phase 4 closes first": tooling may). **GATE-3's remainder waits** until this lane merges: both edit `verify.sh`, `risk-check.sh` and the hook.
- Never open, print, grep the content of or copy `.env` files (incl. tracked `infra/.env`), `.local-secrets/**`, token/session files, `~/.gradle/gradle.properties` and other user-level `gradle.properties`, `~/.netrc`, `~/.npmrc`, `~/.aws/**`, or keys. Read one key only when needed (`grep -c '^key=' file`).
- No force push, never `--no-verify`, no AI attribution in commits, no GitHub workflows. Gradle only through the repo lock (`lockf -k /private/tmp/neoerp-gradle.lock` BE / `neoerp-gradle-app.lock` App + `scripts/gradle-job.sh`); `verify.sh` itself without a `lockf` wrapper. Read the exit code and BUILD line; delete old test results first; wait loops stop when the job exits and have a time limit.
- Hand-back: `docs/agents/test-scope-1/builder-report.md` with what ran on which sha (counts from that run's own output), timings, docs pages changed. Final line: `Brief: unclear or missing — …` or `Brief: none`.

## Lead corrections 2026-11-22 ~20:00 (fresh Opus brief check; these win over everything above)
1. **Whole suite:** the phase → main default is full (D-47). Rule 2's triggers (build files, gate files, unknown path) **stay as the fail-safe** for a `phase/*` range too.
2. **No Gradle in the hook.** The pre-push hook never runs the pushed tree's code. The graph is read **as text** from the push base's script: parse the `include(...)` literals in `settings.gradle.kts` and `project(":…")` literals in every `build.gradle.kts`; any non-literal form → full. `graph=` = sha256 of the sorted edge list. (`architecture-tests` depends on all 7 services, so it is a dependent of every service: fine.)
3. **Where the logic lives:** in `risk-check.sh` as `--scope` (the hook reads only the base's `risk-check.sh`). If you split it into a new script, add it to the hard-coded gate globs, NEVER_LIGHT and `risk-paths.txt`.
4. **Marker:** a new `<sha>.scoped` file (never `.ok`: `.ok` stays "always full"). One word throughout: **scoped**. It carries `risk=`, `reviews=`, `modules=`, `graph=`, `base=` (and `kmm_network=` on the App). The hook refuses it for `main`, for a new remote branch, and when `base=` ≠ the remote tip.
5. **No duplicate runs:** check for a valid marker **before** verify deletes HEAD's markers. Valid = same HEAD, same `base=` = remote tip, same `graph=`, covers the planned modules, `risk=`/`reviews=` still true. `--force-rerun` skips the check.
6. **Floor:** per-module syntax `:services:x min_tests=N`, and `class=` lines tagged with their module (26 classes today, 11 in architecture).
7. **Flows (Jabran 2026-11-22: "Gradle flow tests only"):** "flow" = the flow/integration tests inside each affected Gradle module, which run with its tests. The stack scripts (`*-acceptance.sh`) are **not** added to the gate; they stay at phase → main and the T sessions. No gate time added.
8. **Builder command:** `scripts/verify.sh --scoped-tests-only [--range …]`, using verify's own lock and Gradle home, writing **no** marker. It runs exactly the scoped test set. (`gradle-job.sh` is workspace-only; it is not in either repo, so the lines above that name it are replaced by this.)
9. **Wording:** verify uses `--no-build-cache` and deletes old results, not `--rerun`; describe what it really does.
10. **App:**
    - Time an `features/accounts` range too (574 of 1150 main files, 343 of 676 test files).
    - The import scan must handle wildcard imports and generated `Res`; unsure → the feature's whole package, or full.
    - Strings are per feature (`values*/strings_<feature>_*.xml`) → that feature. "Shared resources" = the rest (fonts, drawable, `files/`) → full.
    - Always run `design.*`, `buildrules.*`, `i18n.*` (screen-size tests sit in `app/design/` by batch).
    - Skip a `--tests` filter that matches nothing (Gradle fails the task on an empty filter).
    - A KMM-Network commit change → full.
    - DI, navigation, session, shell paths → full: list the real ones in the script (`app/di`, `ui/shell`, `app/session`, check each exists).
11. **GATE-3a carry-over:** this lane is RISK and runs the whole suite. Commit `builder-report.md` **before** the review files (only `review-*.md` may follow the reviewed commits). If a T4 lane later touches `risk-paths.txt` or `verify.md`, the carry-over fails and a re-stamp is due: keep edits to those small.
12. **Tests to add:** scoped marker refused on `main` and on a new branch; `base=` ≠ tip refused; transitive shared → shared → service; non-literal `project()` → full; a valid marker skipped and `--force-rerun`; `--plan` output; per-module floor; App strings mapping and an empty filter. **Docs:** `docs/operations/verify.md` in **both** repos. The WORKFLOW "Test scope" pointer is in the workspace, and the lead writes it, not the builder.
