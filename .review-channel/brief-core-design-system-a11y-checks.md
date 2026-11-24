# Brief: `core/design-system` flow 1 `a11y-checks` · App · review: one Opus 5.5 high

Feature `core/design-system` (split, App only): flows `a11y-checks` → `contracts` (branch `core/design-system/contracts` exists with one commit: the footer order) → `android-state` → `window-class` → `layouts-focus`. Branches: feature `core/design-system/feature` (from `main`), this flow `core/design-system/a11y-checks`. Module/integration lead: old-Mac lead. Use `docs/templates/brief.md` for everything not said here.

## Goal
Every screen the size-test harness renders is checked automatically for accessibility, in all four languages, in every gate, so simulator sessions only judge feel and look. Found by the dimension-rules flow-1 simulator test (`.review-channel/dr-flow1-sim-results.md`).

## Decided rules (sources: `.review-channel/lead-decisions.md`, "Automated accessibility checks" and "a11y-checks scope", Jabran 2026-11-25)
Five checks in the harness, on every rendered screen and language:
1. every clickable element has an accessibility label;
2. toggles and choice buttons expose their selected state;
3. touch targets ≥ 44 pt;
4. every interactive element has a `testTag` unique on its screen (iOS accessibility identifier, so AXe taps by id);
5. a required-field `*` is shown ⇔ the field is announced as required.
Plus a "required fields" case in each form's UI test (a `*` field blocks saving when empty; a field without `*` doesn't). **Ratchet:** today's gaps go on a baseline list (screen, element, check) that may only shrink; new or changed screens must pass fully; a builder touching a screen fixes its listed gaps.

## Scope edges
- **In:** the harness (`composeApp/src/jvmTest/.../testing/screens/` after `core/app-test-speed`), the baseline list + its gate check, the shared components that need a `testTag`/semantics hook to make checks 2, 4, 5 possible (`designsystem/components`), a short section in `docs/design/specs/building-blocks.md` and `ux-principles.md` (the five rules), the form UI-test helper for "required fields".
- **Out:** fixing all existing gaps (they go on the baseline); the other design-system flows; old v1 modules without size tests.

## Definition of Done (plus v2 §5)
- Each check fails on a deliberately broken sample screen (failing-first) and passes on a good one.
- The baseline list is generated, committed, and the gate fails when it grows.
- Size-test counts unchanged (no test lost); the gate's own script tests pass.
- Builders run only their own tests + compile; no whole suite (ask the module lead).
