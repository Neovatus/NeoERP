# Review: App test speed (`core/app-test-speed`) — workflow v2 step 3

Reviewer: Opus 5.5 (high)
Reviewed: 5f8f42c6d2b3699a44f93a52ffa16187836fe082
Verdict: FIX

Scope read: `git diff 35bee31d..5f8f42c6` (35bee31d = merge base with origin/main; 2077c874/b9ede745 add only the brief).
Note: `origin/main..HEAD` as given also shows phase-4-fixes being reverted, because origin/main (a555be1f) moved on
after the branch was cut (see F2). Probes ran in a throwaway clone in the reviewer's scratchpad (nothing written in the
worktree): `scripts/risk-check.sh --scope <head>..<probe>`. Gate tests: `scripts/risk-check-test.sh` at the head, see the end.

## Findings

| # | Sev | Where | Finding | Fix |
|---|---|---|---|---|
| F1 | MEDIUM | `design/Batch2ScreenSizeTest.kt`, `risk-check-test.sh` `case_speed_repo_design_tests_check_several_features` | 7 of Batch2's 8 methods check Accounts (`billEditor`, `invoiceEditor`, `journalEditor`, `journalsFirstUse`, `tableCardsAndCells`, `wizardFooter`, `wizardFooterPrimaryOnly`); only `companiesTightGrid` is Organization. In `design` it now runs only when a changed **package** is one Batch2 names directly (one-step rule, package-level). Old rule: any unit in scope that a design file named touched it (unit-level), and the harness importing `Kyst` made every Accounts change `design=*`. Proof: a comment in `features/accounts/presentation/dimensions/AccountsDimensionsTab.kt` (the invoice, bill and journal editors import `presentation.dimensions`, 12 imports) gives `units=buildrules features.accounts i18n`: no `design`, so the editor size checks in Batch2 do not run; same for `presentation/tax`, `presentation/calendar`. A real Accounts change can skip size tests that render it. The "names ≥ 2 features" check passes a class that is 7/8 one feature. Same pattern, lower impact: `ui.shell.ShellFitScreenshotTest` / `TopBarLayerTest` render Accounts journals pages and run only for the packages they name. | Move `Batch2ScreenSizeTest` to `features.accounts` (unchanged class and methods; it names `features.organization.presentation`, so an Organization change still runs it by one-step import). Make the repo check stricter: a test stays in `design` only if no single feature owns most of its methods, or drop `design` as a home and require "the feature most methods check". |
| F2 | MEDIUM | branch base vs origin/main | origin/main (phase-4-fixes, a555be1f) adds `design/Phase4FixesSizeTest.kt` and `design/Phase4FixesUiTest.kt` and edits `design/ScreenSizes.kt`, `FitShots.kt`, `Qa1LayoutSizeTest.kt`. `git merge-tree origin/main HEAD` is clean in text (renames carry main's harness edits into `testing/screens`), but the merged tree will not compile: `Phase4FixesSizeTest` (package `design`) uses `ScreenSizes`, `PeopleShots`, `NoopPeopleActions` without imports, which now live in `testing.screens` and `features.people`. The 4147/636 identity, the floors (design 7, people 168, accounts 2461), the plans and the Accounts timing all describe the old base. | Rebase onto origin/main; put the two new classes in their feature (both name Accounts and People; Accounts owns most, per F1); recount the method identity at the rebased head; recheck floors; rerun `risk-check-test.sh`. |
| F3 | LOW | `scripts/verify.sh` (per-class design check removed), `verify-test-floor.txt` | The per-class "each listed design class ran a test" check is gone, and the size classes now sit inside big unit floors: `features.accounts` 2461 of 2512 (slack 51). Every Accounts size class has ≤ 18 tests (`A4ScreenSizeTest` 18, `JournalEditorScreenshotTest` 14), so a size class that runs nothing (e.g. a fork's lost XML) passes a scoped or full gate. Before, with `design=*`, the design floor 236 of 251 (slack 15) caught a lost A4. | Add `class=` pins for the size classes in their units (the floor file already supports `<unit> class=<class>`), at least the 40 Accounts ones and the slowest elsewhere. |
| F4 | LOW | `risk-check-test.sh` `case_speed_repo_harness_names_no_feature_but_auth` | The check only forbids `features.*` names. The harness could name another non-shared unit (`data.*`, `ui.auth`, `local`); a change there would reach every size test through the harness while only that unit runs. Today the harness names only FULL units plus `features.auth` (a type for the no-op session; an auth probe runs `testing` with no tests, compile covers it), so nothing is wrong now. | Check "the harness names only `SCOPE_FULL_UNITS` units plus `features.auth`". |
| F5 | LOW | `composeApp/screenshots.gradle.kts` `designShotsTest`; `i18n-pseudo.gradle.kts` and `FitShots.kt` run lines | The name patterns select exactly the 61 old design classes plus `features.accounts…SieFileSizeTest` (not a screen-size test). A future size test with another suffix is missed silently. The pseudo-locale run line is now `--tests "*ScreenshotTest"`, which leaves out the `*SizeTest` fit runs. Local-only task, no gate effect. | Exclude `SieFileSizeTest` or name the size tests by a marker (base class, annotation or a `sizes` subpackage); widen the run line to `"*ScreenshotTest" "*SizeTest"`. |
| F6 | LOW | `testing/screens/ScreenSizes.kt` `ShellCompany.Demo` | Behaviour is the same: `Demo` = `co-kyst` / `Kystgruppe Nordic` / `NO` = `Kyst.COMPANY` / `Kyst.NAME` and the old hard-coded `"NO"`; no scene passes another company; `StatementShots` is byte-identical to the block cut from `ProfitLossScreenshotTest`. But the literals can drift from `Kyst` without any failure (the page scoped to one company, the shell to another). `session(company)` now builds a new session object on every recomposition of `Shell` (was a `val`); harmless. | One small test in `features.accounts` (which may import `Kyst`): `ShellCompany.Demo` equals Kyst's values. |

No HIGH: a harness change (`testing/screens/ScreenSizes.kt`, `StatementShots.kt`) and a design-system change are FULL (probed);
a changed feature always runs its own size tests (they are in its unit); hook, marker and verify agree (no `design=`
written, read or checked anywhere; `list_covers` still guards `always=`; an old marker's `design=` line is ignored).

## Decisions

| Decision | Call |
|---|---|
| Harness to jvmTest `testing.screens` (shared → FULL with no new rule) | good |
| Company passed in on `Scene(company = …)`, default `ShellCompany.Demo` | acceptable (same behaviour; F6 drift guard) |
| `StatementShots` cut out of `ProfitLossScreenshotTest` into the harness | good (identical code, 14 users) |
| Design-system shots → `designsystem.components`, shell shots → `ui.shell` | good (both FULL when changed; shell shots still run on named Accounts packages) |
| Accounts split by flow; 7 several-flow classes in `features.accounts`; payables has none | good (same unit today; ready for sub-units) |
| `Batch2ScreenSizeTest` stays in `design` | wrong: 7/8 methods are Accounts; leads to F1 |
| `design=` removed everywhere (scope, verify, marker, hook) | good (less gate logic; consistent across all four) |
| `SCOPE_ALWAYS_UNITS="buildrules i18n"`, other always-run scans unchanged | good |
| Floors: design 236 → 7, receiving units raised to count − 2 %, total unchanged | acceptable (numbers checked against the head's source counts; per-class guard lost, F3) |
| `designShotsTest` by name patterns | acceptable (local only; F5) |
| Gate-test cases for old design picking deleted, new `case_speed_*` cases | acceptable (the old fix-round cases tested logic that no longer exists; the new ones cover the unit rule, FULL for harness and design system, no `design=` line, the two repo checks) |
| "Before" time for (a) taken as the known ~680 s, not re-run (lead stop) | acceptable (class times 1768 s → 1400 s are measured; wall 649 s after) |

## Is "no test lost" shown?

Yes, at the old base, by identity, not only counts. Reviewer's own extraction from git objects (`@Test` methods with
their enclosing class, commonTest + jvmTest): 35bee31d 4147, 5f8f42c6 4147. Fully-qualified lists differ in 243
entries on each side, all package-only moves out of `design` (into `designsystem.components` 16, `features.accounts*`
195, `features.organization` 11, `features.people` 11, `features.platform` 3, `features.roles` 2, `features.agreement` 1,
`features.dashboard` 1, `ui.shell` 3); the `Class.method` lists without package are identical. Per-unit source counts
match the new floors (each floor ≤ count and ≈ count − 2 %). Limits: only the Accounts scope ran at the head (2971, 0
failed); the other moved units are compile-only (Gradle finds test classes by scan, not by package, so the risk is
small); and the identity must be redone after the rebase (F2), since main adds tests in `design`.

## Gate script tests

`bash scripts/risk-check-test.sh` at 5f8f42c6 (reviewer run, temp dirs in the reviewer's scratchpad): **169 cases: 169
passed, 0 failed**, the same as the builder's claim. The new `case_speed_*` cases pass, but none of them covers F1: the
fixture's `CrossShotTest` imports the parent package only, so it never tests a change in a sibling subpackage.

Brief: unclear or missing — the brief says "tests that check several features stay in `design/` and name why", which
the builder followed for Batch2 even though one feature owns 7 of its 8 methods; it does not say that `design` loses the
unit-level reach the old picking gave (F1), nor that the branch must be rebased over phase-4-fixes before the counts are
final (F2).
