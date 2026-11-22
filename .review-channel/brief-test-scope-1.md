# Brief: TEST-SCOPE-1 — gate runs only the affected modules and flows, BackEnd and App (2026-11-22)

> **Principles first (D-63):** read the workspace `docs/PRINCIPLES.md` (8 principles; the WORKFLOW rules are examples of it). Builders who see one repo get a copy of it in the brief folder.

**Approved:** Jabran 2026-11-22: "yes to … test scopes for target & effective services & flow, both app & backend". Two twin lanes: `phase/4-b2-test-scope-be` (BackEnd, the rules below) and `phase/4-b2-test-scope-app` (App, section "App" below). Both start **after GATE-2 merges** (all edit `verify.sh`, `risk-check.sh`, the hook).

**Asked:** Jabran 2026-11-22: "make sure duplicates are not running; target and affected places run the test; we should
only test in full those services that are affected, not all services."
**Repo / lane:** BackEnd `phase/4-b2-test-scope-be` and App `phase/4-b2-test-scope-app`, each cut from its `phase/4` after GATE-2 merged. Copy this file to `docs/agents/test-scope-1/brief.md` in each lane.
**Builder:** Opus 5.5 high (gate lane). **Reviews:** fresh Opus + Fable 5.2 high security review (diff + brief only),
because it changes what the gate tests. **Gate files changed → RISK → whole-suite run for this lane itself.**
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
