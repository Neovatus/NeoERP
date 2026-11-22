# Brief draft: TEST-SCOPE-1 — full runs only for the affected BackEnd modules (2026-11-22)

**Asked:** Jabran 2026-11-22: "make sure duplicates are not running; target and affected places run the test; we should
only test in full those services that are affected, not all services."
**Repo / lane:** `NeoERP-BackEnd`, `phase/4-b2-test-scope-1`, cut from TEST-SPEED-1 **after its review fixes** (both
lanes edit `scripts/verify.sh`, `risk-check.sh` and the hook; nothing is added to a running lane). Copy this file to
`docs/agents/test-scope-1/brief.md` in the lane.
**Builder:** Opus 5.5 high (gate lane). **Reviews:** fresh Opus + Fable 5.2 high security review (diff + brief only),
because it changes what the gate tests. **Gate files changed → RISK → whole-suite run for this lane itself.**
**Where it runs:** the old Mac (test Mac) runs every full gate; Gradle through `scripts/gradle-job.sh` for targeted
runs (L34), verify runs with both locks (L33).

## Goal
A `phase/4` push needs a passing run of **the modules the range affects**, not the whole BackEnd. Same bar for those
modules (all their tests, floor, skips allowlist, money invariants); unaffected services are not re-tested.

## Rules (recommended; Jabran approves the brief)
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

## Out of scope
The App: one Gradle module (`composeApp`), 11 min after TEST-SPEED-APP; per-package selection is a later decision.
No GitHub Actions (off until Jabran approves).

## Tests (in the lane)
risk-check / scope cases as shell tests: service-only change → that service + architecture-tests; shared change →
dependents; migration → service; build file / gate file / unknown path → whole suite; rename across modules → both;
delete-only; a marker whose modules miss one → hook refuses; a stale graph hash → refuses; light range unchanged.

## Done when
`verify.sh --plan` and an affected run work on a one-service range (time it); the hook accepts/refuses as above; docs
(`docs/operations/verify.md`, WORKFLOW "Test scope" pointer) updated; builder report with timings; lane-ready.
