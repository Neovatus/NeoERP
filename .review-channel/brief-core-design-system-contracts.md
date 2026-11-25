# Brief: `core/design-system` flow 2 `contracts` · App · review: one Opus 5.5 high

Feature `core/design-system`: `a11y-checks` merged (035ecc44) → **`contracts`** → `module` → `android-state` → `window-class` → `layouts-focus`. Branch: cut **`core/design-system/contracts-2`** from `origin/core/design-system/feature` and cherry-pick 81544f44 (the footer-order docs commit on the old `core/design-system/contracts`, which branched from `main`); delete the old remote branch after the merge. Use `docs/templates/brief.md` for everything not said here.

## Goal
The design system is clean and consistent before it becomes its own module: its rules, tokens, helpers and docs match the code and each other, with tests at every boundary.

## Decided rules (sources)
- `docs/reviews/material-3/2026-11-23/synthesis.md` ("DS-1a" and decisions C1–C8) and `fable-verdict.md` (its "Change before building" list), plus Jabran's footer decision (screen-standard §8, already in 81544f44: one end-aligned group, Cancel then primary, totals left).
- **Sentence case everywhere** (UX §21, i18n style guide §2): remove the uppercasing in code (`NeoText` Overline roles, `String.asOverline()`, ~15 uses) and the `textCase` tokens (tokens.json and the design-system architecture page).
- **Delete unused helpers:** `statColumns`, `isTabletOrBelow`, `isPhone` (no callers; confirm).
- **Breakpoint helpers with half-open ranges** and boundary tests at 480/600/720/1024/1280 (just below, at, just above; operators that disagree at 720 aligned).
- **"Deviations from Material 3"** section in screen-standard (density/44, footer wrap, toast timing, disabled primary, durations vs springs).
- **Fix the two wrong claims:** `maxContentWidth` 1200 has no consumer (say so, or wire it where the standard says pages cap; decide within the standard and record); `neoPagePadding` does not follow the classes.
- **Gate rule: no new window-width reads in feature code** (Fable: freeze now; the 10 existing Accounts sites go on a baseline that may only shrink; `layouts-focus` removes them). **This changes gate files:** list them in report B for Jabran (do not run the gate).
- The DS-1 docs LOWs still open in `docs/backlog.md` (rig `--focus` vs `focus.ring`, `--focus-soft` "retired" comment, auth.md `focus/ring` value, desktop KDoc collapsed/`shellMinContent`, ux §25 no-info-slot case).

## Scope edges
- **In:** `designsystem/**`, tokens, design docs, the size/a11y tests that cover them, the width-read rule + baseline.
- **Out:** moving code into modules (flow 3), Android state, window classes, layout contracts.

## Definition of Done (plus v2 §5)
- Failing-first tests: boundary tests; a test that no text style uppercases; the width-read rule refuses a new read in a feature (sample) and passes on the baseline.
- No visible change except sentence case: size tests in four languages updated deliberately (list the screens whose labels changed case); a11y baseline does not grow.
- Builders run only their own tests + compile; no gate or whole suite; gate-file changes listed for Jabran.
