---
name: targeted-test-runs
description: "Run only the changed module's tests (plus dependents); one full run per batch; no --rerun-tasks"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 01e6cb16-5a8b-4e2e-998e-4f8ca7ee17b6
  modified: 2026-10-10T19:55:08.541Z
---

Jabran asked (2026-10-07) why every small change re-ran all tests. Rule: during work, run only the changed module's tests plus modules that depend on it (a `shared/neoerp-security` change → all services on it; a single-service change → that service only). One full run of the affected modules per batch, as review evidence. Never `--rerun-tasks` (recompiles everything, caused compiler OOM); to prove tests ran, use `:<module>:cleanTest :<module>:test`. Prefer reusing an existing clone over a fresh clone for small single-service fixes (fresh clones have no build cache). Stop idle Gradle daemons after a batch (11 piled up).

**Why:** full forced runs across 7 suites with Testcontainers took tens of minutes per fix and slowed the whole session.
**How to apply:** put the exact targeted gradle command in every worker brief, and always include `:architecture-tests:test` when a backend change adds or changes repositories, ports or packages (it enforces ADR-012; PCT-a missed it). Since 2026-10-08 this is formalised in WORKFLOW.md "Checkpoints" (impact-based scope; `-q --console=plain`, logs to file, counts + failures only; one independent review per checkpoint, not per wave). Related: [[orchestrator-mode]], [[app-tests-hot-reload]].

**Update 2026-10-10 (Jabran):** no full suite before every push. Backend CI (CI-1) runs everything on push to dev and is the full run. A full local run happens once per checkpoint only when shared code (shared/*, designsystem, core, shell), security or a data-changing migration changed. Written in docs/handover/lead-agent-structure.md §3a "Testing".

**Update 2026-10-16 (Jabran): GitHub Actions are off** (minutes ran out). There is no CI full run: before every push the builder runs locally the full suite of every service/module changed in the pushed range (+ architecture-tests when ports/repos change) and reports counts. lead-agent-structure.md §3a.

**Update 2026-10-29 (Jabran):** "full" only when a change impacts every flow (app shell, auth/session, money/date formatting, DI root). Otherwise run the tests of the new change plus the impacted flows: the features/screens that use the changed code (e.g. a design-system select change → tests of the screens using that select, found by grep), not the whole suite. Applies before push too, replacing the 2026-10-16 "full suite of every changed module" for app batches; the backend accounts-service suite still runs when accounts-service changed and its full run hasn't passed on the pushed range.

**Update 2026-11-05 (Jabran):** keep the review routine (build → independent review → fix → re-check → merge) but cut repeated testing. Builder: targeted tests only. Reviewer: does NOT re-run tests; reads the code and the builder's counts, and runs only a test it adds or suspects. Fixer: tests of what it changed. Exactly one full run per checkout (accounts-service suite / composeApp jvmTest) on the final state, just before merge. Put this in every builder/reviewer brief.
Same day: the one full run is per MERGE BATCH, not per slice: group related ready slices (max 3, e.g. C2+C3), merge them together, one full run per repo, then push. A slice ready alone isn't held back. One final full run at the end of Phase 3 before Jabran tests. "Full run" = automated test suite only; reviews are separate and unchanged (one independent review per slice).
Also from 2026-11-05: every batch's pre-merge check includes `./gradlew :composeApp:compileKotlinIosSimulatorArm64` (must be 0 errors). commonMain must not use String.format/.format, putIfAbsent or assert( (25 such errors had piled up unseen; fixed in dev-app d4179874).
Also (Jabran 2026-11-06, from the task list): every builder brief says "keep at most ONE background watcher per Gradle run; never start a new watcher per check" — duplicate wait loops clutter his background-task list.

**iOS build not in pre-merge checks (Jabran 2026-11-14):** don't add xcodebuild to the merge checks; run and check the iOS app only when needed. Stop asking.
