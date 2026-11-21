# Lane ready: Lane 0 App (machine gates) — 2026-11-21

**Repo / branch:** `NeoERP-App`, `phase/4-b2-lane0-app` (pushed, head `69a5deb0`). Merge target: `phase/4` (at `f19a101b`).
**Range:** `f19a101b..69a5deb0` (32 commits).
**Brief:** `docs/agents/lane0-gates/brief-app.md`, amended by decisions D-11 (feature-import pair ratchet) and D-12 (money-parse scope), both Fable APPROVE (`.review-channel/lead-decisions.md`).
**Builder:** Opus 5.5. **Reviewers:** Opus 5.5 (fresh) and Fable 5.2 security review (second, independent: diff and brief only, never the other review). High effort from the lead rule onward.

## Reviews (`docs/agents/lane0-gates/` on the branch)
- Round 1: `review-1-opus.md` FIX (3 HIGH: build cache could skip the scans; money/auth paths without a risk glob; self-tests whose `&&` chains never fail) and `review-2-fable-security.md` FIX (3 HIGH, two proven end to end in a scratch clone: a stub `gradlew` got a marker and the hook accepted it; a wider verified range hid a money-file revert). 21 rows merged in `fix-list-round1.md`; every HIGH and MEDIUM fixed with a regression test **proven old FAIL / new PASS** against a copy of `9b5a13fb` (build-rule regression class 6/6 failed on the old copy; `risk-check-test.sh` 23 cases failed on the old gates).
- Round 2, fixes only: `review-1b-opus-round2.md` ACCEPT (re-ran the old-code proof for all its HIGHs, incl. FROM-CACHE vs re-run); `review-2b-fable-security-round2.md` FIX, 1 new HIGH proven (a review whose `Range:` starts before the push base still hid a dropped fix when the file also got a harmless line).
- Round 3: fix in `risk-check.sh` (a review may vouch only for a risk file unchanged between its base and the push base) + regression case (old FAIL on `3b68c83e`, new PASS); `review-2c-fable-security-round3.md` ACCEPT (attack and 6 variants refused), `review-1c-opus-round3.md` ACCEPT.
- Round 4: the lead's first full verify run failed correctly (Gradle daemon out of memory: `/tmp/gradle-home/gradle.properties` caps it at 2 GB over the repo's 4 GB); `verify.sh` now passes the repo's `org.gradle.jvmargs` on the command line, with a test (old FAIL / new PASS). `review-1d-opus-round4.md` and `review-2d-fable-security-round4.md` ACCEPT. **These two are the final pair** (Reviewed `5414d4bb`, Range `f19a101b..5414d4bb`).

## Old command vs verify.sh (same commit `601e85b1` tests, `69a5deb0` verify; between them only `verify.sh` heap flag, its test, verify.md and review files changed)
| | Old `./gradlew :composeApp:jvmTest --no-build-cache` (WORKFLOW) | `scripts/verify.sh` |
|---|---|---|
| composeApp tests / failed / skipped | **3862 / 0 / 1** | **3862 / 0 / 1** |
| Gradle | exit 0, "BUILD SUCCESSFUL in 36m 26s" | exit 0 (also compiles iOS: `compileKotlinIosSimulatorArm64`) |
| Time | 2187 s | 2263 s |
| Result | — | **`verify: passed, no marker`: the pre-push hook is not installed** |

The skip (1) is `NeoErpAuthRuntimeTargetTest`, allowlisted with count 1 (skips when the local auth stack is down). The test floor is `min_tests=3500` against 3862 run (about 9 % slack; reviewer: sound, raise after this run — proposal below).

**Why no marker:** `verify.sh` refuses to write one while `core.hooksPath` is not set, so a marker is never written in a clone that would not enforce it. `install-hooks.sh` sets it clone-wide, which includes your App checkout `NeoERP/NeoERP-App`; the brief said "install after merge". See "For Jabran".

## Targeted tests
- Build-rule tests: 20 classes' cases, 0 failed (`com.neovatus.neoerp.app.buildrules.*`), each rule proven to fail on a bad sample.
- `scripts/risk-check-test.sh`: 46 PASS, 0 FAIL.

## What it holds
- `scripts/verify.sh` (jvmTest + iOS compile, no build cache, daemon heaps passed, test floor, required rule classes, skip allowlist, marker), `.githooks/pre-push` + `scripts/install-hooks.sh` (guards only `main` and `phase/<number>`), `scripts/risk-check.sh` + `docs/risk-paths.txt` (App money input/format/parse, accounts money screens and repositories, SIE import, journal editor, tax codes, payables/receivables view models, `*Access.kt`, company scope, context, contracts, roles, security, network client and auth plugin, DI, build files incl. `gradlew`, manifests, gate files).
- Build rules as `jvmTest` scans with shrink-only baselines: money text parse/format outside NeoFormat/NeoNumericInput (4 lines frozen), Double/Float money fields (3), Koin outside `app/di` (21), feature-to-feature imports as a per-pair count ratchet (36 lines; D-11).

## Write-scope check (`git diff --name-only f19a101b..69a5deb0`)
`scripts/**`, `.githooks/pre-push`, `docs/risk-paths.txt`, `docs/operations/verify.md`, `AGENTS.md`, `docs/definition-of-done.md`, `composeApp/src/jvmTest/**` (rules, fixtures, baselines), `composeApp/build.gradle.kts` (jvmTest inputs so the cache cannot skip the scans; outside the original scope, asked by the lead for review finding 1), `docs/agents/lane0-gates/**`. No production code. No AI attribution (checked, 0).

## Docs pages
- **Developer:** `docs/operations/verify.md` (new), `AGENTS.md` "Before push", `docs/definition-of-done.md`.
- **User guide:** none: no user-facing change.

## Follow-ups
- **R34** (fix list): the same gate fixes ported to the BE (wider-range revert, stub `gradlew`, review-base check, strict review parsing, self-tests), plus the App LOWs not fixed here and Fable's round-3 LOWs (`:`-prefixed risk file name; glob removed inside the reviewed part). Runs right after this lane merges (Jabran 2026-11-21).
- Composition pairs (backlog row): stay frozen until you decide.

## For Jabran
- **Verdict.**
- **Hook in your App checkout:** a marker needs the hook installed, and `install-hooks.sh` sets it for the whole App clone, including `NeoERP/NeoERP-App`. Proposed order after MERGE: install the hook, rerun `verify.sh` (about 38 min), then merge to `phase/4` through the hook — the same as you approved for the BE.
- **Test floor:** raise `min_tests` from 3500 to 3800 after the merge (3862 run today), in a small follow-up, so a large silent drop in tests fails verify.
