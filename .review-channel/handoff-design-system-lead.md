# Handoff: design-system flow lead (old Mac, session started by the module lead) — 2026-11-25 ~08:00, paused by Jabran until the evening

## Heads (App)
- `core/design-system/feature`: 1355be21 (a11y-checks + contracts merged).
- `core/design-system/android-state`: **e264c945**, pushed (range 1355be21..e264c945, 5 commits). Worktree `NeoERP-worktrees/ds-android-app`.

## android-state status: built, not reviewed
- Manifest handles size, orientation, keyboard, uiMode, density, fontScale and the other config changes (locale and layoutDirection are left out on purpose). New `core/presentation/retained/NeoRetained.kt` (rememberNeoViewModel/Retained/EffectRelay) with the store in MainActivity. Moved: the invoice editor path (AccountsRoute page VM, ReceivablesHost page + list/customers VMs, InvoiceEditor VM) and login. 80 sites in 32 files stay on the baseline.
- Ran: AndroidConfigChangesRuleTest 3/3, NeoRetainedTest 11/11, InvoiceEditorRecreationTest 1/1, RememberedViewModelRuleTest 4/4, 14 route/editor classes 162 tests 0 failed. Android + iOS compile at e01859d3; only tests and docs changed after that. Each test failed first on the old code.
- Gate files, for Jabran: new `buildrules/RememberedViewModelRuleTest.kt` and `AndroidConfigChangesRuleTest.kt`, new `jvmTest/resources/buildrules/remembered-view-models-baseline.txt`; `composeApp/build.gradle.kts` (manifest as a jvmTest input); `docs/operations/verify.md` (2 rows). No `scripts/**` change.
- Scope agreed with the module lead: process death out (their backlog row).

## Next (when resumed)
1. One Opus 5.5 high review of 1355be21..e264c945 (fresh agent, review template, CONFIRMED/PLAUSIBLE). Points: retained store identity and release, relay callbacks into a dead composition, whether the ratchet counts every way to create a view model, manifest flags vs Compose recomposition (fontScale, density), iOS and desktop unchanged.
2. Fixes: D-86, a fresh Sonnet builder with a short fix brief for mechanical ones; Opus only for design.
3. Emulator check, run by the module lead's tester (AVD Pixel_10a); steps below. Then report B → module lead gates and merges.
4. Then: flow `module` waits for a quiet window (D-85); then window-class → layouts-focus (D-85 wide screens: lists and tables full width, forms and detail capped at ~1200–1440 and centred).

## Emulator steps (from the builder; testTags are resource ids)
- Install: `scripts/gradle-job.sh app ~/Offices/Neovatus/NeoERP-worktrees/ds-android-app :composeApp:installDebug`.
1. Sign in as a demo user with the right to create invoices.
2. Accounts › Receivables › Invoices › "New invoice" (by its text, no tag). Expect `invoice.save`.
3. Type "Fotball, kampball" into the first text field in `invoice.lines.line.0`. Scroll a little. Open the `invoice.customer` picker.
4. Rotate to landscape and back: same text, same scroll, the picker still open.
5. Dark mode on, then off: the same.
6. Font size largest, then back: the same.
7. Split screen and drag the divider: the same.
8. Optional: change the system language. The Activity is rebuilt and the editor text comes back (scroll and dialog may reset).

## Rules in force
v2 six steps; one Opus high review; CONFIRMED/PLAUSIBLE; no gate or whole suite; gate files listed for Jabran; D-86 (Sonnet for mechanical work, stay under 50 % context); builders commit, the flow lead pushes the flow branch, the module lead merges.
Notes: side-session-notes/…/design-system-lead.md. Measures lines for flows 1 and 2 are in v2-trial-measures.md.
