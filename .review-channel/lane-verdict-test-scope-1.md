# Lane verdict: TEST-SCOPE-1 (the gate runs only the affected modules/packages) — BE + App — 2026-11-24

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `91843a59` → `7ee082be`; App `phase/4` `5b65071e` → `82b815b0`. New-Mac build (Opus 5.5); old Mac gate + merge. Tier 2 (gate scripts): two Opus seats per repo, seat B security at high effort on diff + brief only. Brief check found 12 corrections.
- Scope: `risk-check.sh --scope` works out the affected set from git objects only (BE: changed modules, all dependents, readers of a changed file, always `:architecture-tests`; App: changed packages, importers one step, users of changed string keys, always `buildrules`, `i18n`, 7 source-tree-scan classes, design classes by every unit they name). Whole suite (FULL) for build/gate files, unlisted scripts, symlinks, non-text files, unlisted natural-form reads outside the project (D-62), pinned files (BE 118), any git/parse error; App also shared code, camelCase packages, KMM-Network change. `verify.sh` on a range from `origin/phase/<N>` runs only the affected set and writes `<sha>.scoped`; `main` or `--full` runs all (`.ok`); `--plan`, `--scoped-tests-only`, `--force-rerun`, floor per module/package. Hook accepts `.scoped` only for `phase/<N>` with the same base, graph and modules; BE dispatcher is gate version 3. Docs: `docs/operations/verify.md` (both), BE `AGENTS.md`.
- Reviews: both reviews carried over the rebase via GATE-3a (BE 13 commits, App 17 commits patch-identical, REVIEWS OK).
  - BE: round 1 A FIX (1 HIGH, 2 MEDIUM) / B FIX (2 MEDIUM, 4 LOW); round 2 A FIX 1 MEDIUM / B FIX 1 MEDIUM, 2 LOW; round 3 A ACCEPT / B FIX 1 MEDIUM; round 4 both ACCEPT (reviewed `75ccfb07`, Range `8472c728..75ccfb07`).
  - App: round 1 A FIX (2 HIGH, 1 MEDIUM) / B FIX (1 HIGH, 3 MEDIUM, 5 LOW); round 2 A ACCEPT / B FIX 1 MEDIUM, 2 LOW; round 3 both ACCEPT, B with a MEDIUM row (reviewed `4cfd5bb4`, Range `a8e004a6..4cfd5bb4`).
- Tests (builder): gate self-tests BE 167/167, App 172/172 (each round's new cases fail on the previous gate). BE baseline on `b269dbd4` 4665/0/59 (16 modules); App whole suite 4122/0/1.
- **Gate:**
  - BE: run 1 failed in about 3 min because Docker was down after a Mac restart (environment, not code); rerun `verify: OK` 4678/0/59, 14 min.
  - App: `verify: OK` 4147/0/1, 14 min.
- **First-pass gate:** BE no (Docker down after a Mac restart, environment); App yes.
- Measured: BE one service about 2 min vs 16 min full (shared module costs the same as full); App roles change 680 s vs 703 s whole suite, because the shared fixture `ScreenSizes.kt` names `ui.shell` and design is about 95 % of App test time. Machinery correct; App saving comes after the fixture split (row 1).
- After merge: BE hook dispatcher reinstalled to gate v3 on both Macs.
- Follow-ups: BE unpin caller-id literals (77 of 118 pins are data), root build file block checks, shared-module timing; App fixture split, pinned-blob/always-run row (first item of GATE-3 remainder), read-pattern gaps (`PWD`, `resolveSibling`, `File("..")`), no-KMM-folder case, one-step importer rule.
- Docs pages: developer `docs/operations/verify.md` (both), BE `AGENTS.md`; user guide none (tooling).
- Brief: gaps were graph sources (Groovy, parent-folder scripts), whether the read scan had to be enforced by the gate (D-62), correction 10 "always run design" leaving almost no saving, fixture naming a non-feature unit, and the builder-report file name (both repos).

## Timeline (MEASURE-1)
- BE: brief check 22 Nov about 19:45, built from about 20:05; build and rework about 6 h across 3 fix rounds plus the overnight stop; reviews 4 rounds x 2 seats, 3-10 min each; gates about 3 min (failed) + 14 min; lane-ready 24 Nov about 16:10. Tokens: builder about 570 k; seat A about 245 k; seat B about 285 k; brief check about 114 k.
- App: built from 22 Nov about 20:05; fix round 1 on 22 Nov evening, round 2 on 24 Nov; reviews 3 rounds x 2 seats; gate about 14 min; lane-ready 24 Nov about 16:30. Tokens: builder about 555 k; seat A about 190 k; seat B about 296 k. Build/rework minutes not recorded.
