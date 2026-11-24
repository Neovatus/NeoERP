# Lane ready: TEST-SCOPE-1 App (the gate runs only the affected packages on phase/* ranges) — 2026-11-24

**Repo / branch:** `NeoERP-App`, `phase/4-b2-test-scope-app-r`, head `82b815b0`, rebased onto App `phase/4` `5b65071e` (DOCS-2c in). GATE-3a carried both reviews over: 17 commits patch-identical, REVIEWS OK.
**Brief:** workspace `.review-channel/brief-test-scope-1.md` with its "Lead corrections", plus:
- the lead change (correction 10): `design.*` is scoped by the import rule;
- D-60 and D-62.

Builder: Opus 5.5. Report: `docs/agents/test-scope-1/builder-report-app.md`, with the lead change and fix rounds 1–2.
**Tier 2 (gate scripts).** Two Opus seats. Seat B is security at high effort and saw only the diff and the brief.

## Review files
- `review-app-5-opus.md` (Opus 5.5) and `review-app-6-opus-sec.md` (Opus 5.5 security (D-43)): both ACCEPT. Reviewed `4cfd5bb4`, Range `a8e004a6..4cfd5bb4`. Carried over the rebase.
- History:

  | Round | Seat A | Seat B |
  |---|---|---|
  | 1 | FIX: 2 HIGH, 1 MEDIUM | FIX: 1 HIGH, 3 MEDIUM, 5 LOW |
  | 2 | ACCEPT | FIX: 1 MEDIUM, 2 LOW |
  | 3 | ACCEPT | ACCEPT, with a MEDIUM row |

## What it does
- **`risk-check.sh --scope`:** works out the affected set from git objects only. The set is the changed packages, their importers (one step), and the users of changed string keys. Always run: `buildrules`, `i18n` and the 7 source-tree-scan classes (`always=`).
- **Design screen-size classes** are picked by every unit they name, including their helpers. A shared fixture naming a unit in the scope → all of them.
- **Whole suite (FULL)** for:
  - shared code (di, navigation, session, shell, core, designsystem, …);
  - camelCase packages, a package line that doesn't match its folder, NUL or binary-looking `.kt` files;
  - a changed test that reads files and isn't on the always-run list;
  - a KMM-Network change; build or gate files.
- **verify, marker and hook:**
  - `.scoped` is written only for `phase/<N>`; it carries `modules=`, `design=`, `always=` and `graph=`, and the hook recomputes them.
  - A floor per package, and floors are checked for emptied units.
  - `--plan`, `--scoped-tests-only` and `--force-rerun`.
  - `-Pneoerp.kmmNetworkPath` is passed to Gradle.
- **Docs:** `docs/operations/verify.md` covers the scope rules, the D-62 bar, the one-step importer limit and the evasion limit.

## Tests (builder)
- Gate self-tests: **172/172**. Each round's new cases fail on the previous gate.
- Whole suite: 4122 tests, 0 failed, 1 skipped; floors met.
- **Timing — honest:** a roles change now takes 680 s against 703 s for the whole suite. The shared fixture `ScreenSizes.kt` names `ui.shell`, so most feature ranges run every design class, and design is about 95 % of App test time. **The machinery is correct; the saving comes only after the fixture split (row 1).**

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/test-scope-1/review-app-5-opus.md docs/agents/test-scope-1/review-app-6-opus-sec.md`. Gate files changed, so this lane itself runs the whole suite.
2. Merge it.
3. Reinstall the App hook dispatcher on each clone if `install-hooks.sh` asks for it.

## Follow-up rows
1. **Split `ScreenSizes.kt` and the other shared design fixtures per feature,** to get the App's design saving back. A small lane after the workflow review.
2. **Seat B MEDIUM 1 (partly closed):** a test that scans the source tree, added in one range, isn't forced onto the always-run list for later ranges. Fix: move the 12 blob pins into `risk-check.sh`, and make a range FULL whenever any test at the head matches the read pattern and is neither listed nor pinned. **First item for GATE-3's remainder.**
3. **Seat B LOW 1:** the read pattern misses `PWD`, `resolveSibling` and `File("..")` walk-ups.
4. **Seat B LOW 2 / seat A LOW:** with no KMM folder, verify passes no flag, so an environment-only path could differ (evasion per D-62).
5. **The importer rule is one step** (lead decision 1). The full run at phase → main covers transitive effects.

## Docs pages
- **Developer:** `docs/operations/verify.md`.
- **User guide:** none (tooling).

## Timeline (new Mac; Europe/Oslo)
- **Built:** from 22 Nov at about 20:05. The lead change (design scoped) came on 22 Nov.
- **Fix rounds:** round 1 on 22 Nov evening; round 2 on 24 Nov.
- **Reviews:** 3 rounds × 2 seats.
- **Lane-ready:** 24 Nov at about 16:30.
- **First-pass gate:** pending.
- **Tokens:** builder about 555 k; seat A about 190 k; seat B about 296 k.
- **Brief gaps:**
  - correction 10, "always run design", left almost no saving;
  - whether a fixture naming a non-feature unit forces all design classes;
  - the builder-report file name.
