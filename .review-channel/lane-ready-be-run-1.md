# Lane ready: BE-RUN-1 (local backend in jar mode, opt-in) — 2026-11-21

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-be-run-1` (pushed, head `e3009697`, 6 commits on BE `phase/4` `a50eabbb`).
Merge target: BE `phase/4`, fast-forward through the hook (needs a `verify.sh` marker; the change is a dev script and docs,
no service code).
**Brief:** `docs/agents/be-run-1/brief.md`. Approved: Jabran 2026-11-21 ("yes opt-in first"). Not a money or security lane.
**Builder:** Sonnet 5.5 high. **Review:** Opus 5.5 fresh (diff + brief only), rounds 1 (FIX: 2 MEDIUM, 5 LOW) and 1b (ACCEPT, 2 LOW applied by the lead).

## What it does
`NEOERP_RUN_MODE=jar scripts/run-all-services.sh`: stops the old stack, builds all 8 boot jars in one Gradle call
(`--no-daemon`, Kotlin compiler in-process, so nothing stays behind), then starts each service with `java -jar` from its
own folder on Java 17 (the project toolchain, as bootRun), same heap/JVM flags, env, profile, accounts-service DB role and
bank-key file. Rebuilt from the current code on every start. Without the variable the script behaves as before (one
`if` → `elif`, plus a `[mode] gradle` line). Devtools (accounts, org) is not in the jars: documented.

## Live test (lead) — `docs/agents/be-run-1/builder-report.md` "Live test"
All 8 healthy; **8 Java processes instead of 25**; all on Temurin 17; no Gradle or Kotlin daemon left; **Java memory 2.4 GB
right after start** (the gradle-mode stack measured about 10–11 GB in Activity Monitor earlier today, not at the same
uptime); gateway 401 without a token; Ctrl+C stops all, ports free. Not run: default mode end to end (unchanged path,
checked by both reviews) and a device sign-in (simulator shut down).

## Docs pages
`README.md` and `docs/local-demo-data.md` ("Jar mode (opt-in)"), `docs/APPLICATION_DEVELOPMENT_GUIDE.md` (pointer).
User guide: none (developer tooling only).

## For Jabran
1. Verdict (lead's call: **MERGE** into BE `phase/4` after a `verify.sh` run).
2. Later decision, not now: make jar mode the default after a few days of use.
