# Lane ready: TEST-SCOPE-1 BE (the gate runs only the affected modules on phase/* ranges) — 2026-11-24

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-test-scope-be-r`, head `7ee082be`, rebased onto BE `phase/4` `91843a59`. GATE-3a carried both reviews over: 13 commits patch-identical, REVIEWS OK.
**Brief:** workspace `.review-channel/brief-test-scope-1.md` (copied into the lane), with its "Lead corrections" section, D-47, D-49, D-60 (Jabran: flows = Gradle tests only) and D-62 (the read-scan bar). Builder: Opus 5.5. Report: `docs/agents/test-scope-1/builder-report-be.md`, rounds 1–3.
**Tier 2 (gate scripts).** Two Opus seats. Seat B is security at high effort and saw only the diff and the brief.

## Review files
- `review-be-7-opus.md` (Opus 5.5) and `review-be-8-opus-sec.md` (Opus 5.5 security (D-43)): both ACCEPT. Reviewed `75ccfb07`, Range `8472c728..75ccfb07`. Carried over the rebase.
- History:

  | Round | Seat A | Seat B |
  |---|---|---|
  | 1 | FIX: 1 HIGH, 2 MEDIUM | FIX: 2 MEDIUM, 4 LOW |
  | 2 | FIX: 1 MEDIUM | FIX: 1 MEDIUM, 2 LOW |
  | 3 | ACCEPT | FIX: 1 MEDIUM |
  | 4 | ACCEPT | ACCEPT |

## What it does
- **`risk-check.sh --scope`:** works out the affected set from git objects only, with no Gradle. The set is the changed modules, every module that depends on them (followed all the way), the readers of a changed file, and always `:architecture-tests`.
- **Whole suite (FULL)** for:
  - build or gate files, and unlisted build scripts (Groovy, `.dcl`, parent-folder, `buildSrc`);
  - symlinks and submodules, non-text files, tracked files under `build/`;
  - any read outside the project in a natural form (D-62) that `KNOWN_READS` doesn't list;
  - any change to a file pinned by blob (118 files);
  - any git or parse error.
- **`verify.sh`:**
  - a range from `origin/phase/<N>` runs only the affected modules and writes `<sha>.scoped`;
  - `main` or `--full` runs the whole suite (`.ok`);
  - `--plan`, `--scoped-tests-only` (the builder command, planned exactly as the gate plans), `--force-rerun`, and a duplicate check before markers are deleted;
  - a floor per module.
- **Hook:** accepts `.scoped` only for `phase/<N>` with `base=` = the remote tip and the same graph and modules, recomputed with the base's own script. `GIT_NO_REPLACE_OBJECTS=1` is set. The dispatcher is gate version 3.
- **Docs:** `docs/operations/verify.md` covers the scoped gate, the bar and the evasion limit, and "Who refreshes a pin". `AGENTS.md` "Before push" points to it.

## Tests (builder)
- Gate self-tests: **167/167**. Every fix round's new cases fail on the previous round's gate.
- Full baseline on `b269dbd4`: 4665 tests, 0 failed, 59 skipped, 16 modules, every floor met.
- **Timings (Gradle):**

  | Range | Time |
  |---|---|
  | one service | about 2 min |
  | 3 modules | 3 min |
  | shared (10 modules) | 16 min |
  | full | 16 min |

- Swap stayed between 6.1 and 9.4 GB of 10 (D-61 log in the report).

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/test-scope-1/review-be-7-opus.md docs/agents/test-scope-1/review-be-8-opus-sec.md`. Gate files changed, so this lane itself runs the whole suite.
2. Merge it.
3. **After the merge, every clone must reinstall the hook dispatcher** from `phase/4` (`scripts/install-hooks.sh`). Until then verify refuses to write a marker; it fails closed.
4. GATE-3's remainder starts after this merges.

## Follow-up rows
- **Unpin caller-id literals:** count a bare project name only as a `File(`/`Path.of(`/`resolve(` argument. 77 of the 118 pinned files are data.
- **Root build file:**
  - a `project(":x") {` or `configure(…) {` block at the root isn't checked like `subprojects` (seat B LOW 1);
  - braces inside strings end the root-block tracking early (LOW 2; evasion per D-62).
- **Timing:** a shared-module change costs the same as the full suite (accounts-service holds 2232 of 4665 tests).

## Docs pages
- **Developer:** `docs/operations/verify.md`, `AGENTS.md`.
- **User guide:** none (tooling).

## Timeline (new Mac; Europe/Oslo)
- **Brief:** brief check on 22 Nov at about 19:45 (12 corrections). Built from about 20:05.
- **Build and rework:** about 6 h across 3 fix rounds, plus the overnight stop.
- **Reviews:** 4 rounds × 2 seats, about 3–10 m each.
- **Lane-ready:** 24 Nov at about 16:10.
- **First-pass gate:** pending.
- **Tokens:** builder about 570 k; seat A about 245 k; seat B about 285 k; brief check about 114 k.
- **Brief gaps:**
  - the graph sources (Groovy, parent-folder scripts);
  - whether the read scan had to be enforced by the gate (D-62 settled it);
  - the builder-report file name.
