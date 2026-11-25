# Brief: `core/design-system` flow 3 `android-state` · App · review: one Opus 5.5 high

Feature `core/design-system`: `a11y-checks`, `contracts` merged (App 1355be21) → **`android-state`** (D-85: before `module`) → module (quiet window) → window-class → layouts-focus. Branch: `core/design-system/android-state` from `origin/core/design-system/feature`. Use `docs/templates/brief.md` for everything not said here.

## Goal
On Android, rotating, folding/unfolding, split-screen resizing, attaching a keyboard, switching dark mode or changing font size never loses what the person is doing: a half-typed invoice, an open editor, the scroll position, the open dialog.

## Decided rules (sources)
- `docs/reviews/material-3/2026-11-23/fable-verdict.md` "Android state loss": the manifest has no `android:configChanges` (`composeApp/src/androidMain/AndroidManifest.xml`), so the Activity is rebuilt; view models made with `remember` in composition (e.g. `ReceiptsHost.kt`, `RefundEditorScreen.kt`) die with it. Screen-standard §2 and UX §8 promise kept state.
- **Fix both layers:** (1) the manifest declares the size, orientation, screen layout, keyboard, UI-mode, density and font-scale changes as handled (Compose recomposes); (2) view models and editor state survive what the manifest cannot prevent (process death, system-initiated recreation): hold them outside composition (the navigation component's / Decompose instance keeper, or the existing pattern if one exists: discover) and keep typed form state saveable. No feature-by-feature rewrite: find the single place view models are created and fix it there; list the screens that still `remember` a view model and move them.
- A **rule test** (like the width-read rule): no new `remember { …ViewModel(…) }` in feature code; today's sites on a baseline that may only shrink. This is a gate file: list it for Jabran, don't run the gate.
- ADR-028: shared code goes in `core`/`designsystem` packages shaped for the later modules (no feature imports).
- Backlog row "Android is not in QA at all": this flow adds the first Android smoke (below).

## Scope edges
- **In:** manifest, view-model creation/retention, saveable editor state, the rule test + baseline, a developer page note ("how a screen keeps its state"), tests.
- **Out:** window classes, pane layouts, Back per platform (layouts-focus), reduced motion, iOS/desktop (nothing is rebuilt there; don't change their behaviour).

## Definition of Done (plus v2 §5)
- Failing-first tests: a view model survives a simulated recreation (Activity recreate / instance-keeper test); typed text in an editor survives it; the rule test refuses a new composition-created view model in a sample and passes on the baseline.
- **Android emulator check on the old Mac** (AVD `Pixel_10a`, run by the module lead's tester): open an invoice editor, type, then rotate, toggle dark mode, change font size, and resize in split screen: text, scroll and the open dialog are kept. Steps and testTags in the hand-back so the tester can drive it.
- Builders run only their own tests + compile (Android target included); never edit gate scripts; no gate or whole suite; gate-file changes listed for Jabran.
