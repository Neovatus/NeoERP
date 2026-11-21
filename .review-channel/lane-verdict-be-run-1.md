# Lane verdict: BE-RUN-1 (local backend in jar mode, opt-in) — 2026-11-22

**Reviewed:** `NeoERP-BackEnd` `a50eabbb..e3009697` on `phase/4-b2-be-run-1`, against `lane-ready-be-run-1.md`. Old-Mac overseer.
**Verdict: MERGE** (Jabran already said MERGE; this is the overseer check). Lands by fast-forward with the next BackEnd full run (TEST-SPEED-1's), together with BE-DOCS-1.

## Checked here
- `origin/phase/4` (`a50eabbb`) is an ancestor of `e3009697`: fast-forward possible.
- Write scope: `scripts/run-all-services.sh`, `README.md`, `docs/local-demo-data.md`, `docs/APPLICATION_DEVELOPMENT_GUIDE.md`, `docs/agents/be-run-1/*`. No service code, build files, migrations or tests. Not a money or security lane: one fresh Opus review is right.
- No AI attribution in the 6 commits.
- Review 1 (Opus, diff + brief): FIX, 2 MEDIUM + 5 LOW; every row has a lead decision, and the script diff carries them (Java 17 for the jars, devtools documented, jar resolved before `exec`, two-jar hint, `ORG_GRADLE_PROJECT_bootRunXmx` fallback, build before `free_ports`). Review 1b: ACCEPT, recorded in `builder-report.md` "Review 1b" (no separate review file).
- Default mode: the only change on that path is `if` → `elif` and a `[mode] gradle` line.
- Live test in jar mode recorded (8 healthy, 8 Java processes, no daemons left, Ctrl+C clean).
- Docs pages listed; user guide none (developer tooling).

## Open
- **Tests:** no `verify: OK` marker yet (the first gate failed on the flaky `SupplierBankEventsTest`, the second was stopped). The marker must cover `phase/4..32b07dac` (BE-RUN-1 + BE-DOCS-1), with the script counted in the risk check.

## Notes
- **BE-JDK21:** `JAR_JAVA` pins Java 17 (`java_home -v 17`) to match the toolchain. When the toolchain moves to 21, this pin and its comment must move with it, or jar mode keeps running 17 while bootRun runs 21. Put it in the BE-JDK21 brief.
- Review files lack the `Range:` line; small, fine for this lane.
