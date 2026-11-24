# ADR-028 (App modules): independent review

Reviewer: Fable 5.2 (high)
Verdict: ACCEPT WITH CHANGES

Date: 2026-11-24. Read only. App code: `NeoERP-App` `phase/4` at `4e0ec8c7`. I read the code first (build files, resources, DI, navigation, iOS host, tests, gate), then the draft, the backlog section, ADR-027, the DS-1 review and the `core/app-test-speed` brief.

**Not checked:** no Gradle, no build, no simulator. Statements about Kotlin/Native, AGP, Compose resources and Hot Reload behaviour are from knowledge, not from a run; each is marked "confirm in M0". Counts below come from scripts over the source tree (import lines and `Res.string.<key>` uses), so they are lower bounds.

Paths: `App/` = `NeoERP-App/`, `src/` = `App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`, `test/` = `App/composeApp/src/jvmTest/kotlin/com/neovatus/neoerp/app/`.

## Summary

The direction and the cut by product area are right, and the draft's counts match the code. Accept it after the changes at the end. Four matter most:

1. **The speed gain is mostly not the modules' gain.** In the last whole-suite run, the Accounts size tests are 82 % of all test time and everything that is not a size test is 4 %. A non-Accounts range already ran in 146 s in one module once the size tests were picked; `core/app-test-speed` delivers that. Modules add compile savings only, and the gate as designed gets none (point 4). Decide this ADR on structure (the rule becomes a compile error, HR v2 starts clean, faster Xcode builds), not on gate time.
2. **"The rule is the key prefix, so a script does it" is not true for strings.** The `shell_` strings are not the chrome's, seven string files belong to a different module than their prefix, and about 40 uses cross areas. I recommend one shared strings module first, which needs no source change at all, and per-module strings later if the iOS numbers ask for it.
3. **Decouple in the single module first, then move.** A move is not "`git mv` plus Res import lines": at least 155 imports of `internal` names cross the proposed borders, features import `data.mock`, and the chrome depends on app state that depends on Organization.
4. **HR v2 and DS-1b should not wait for M0–M3.** Both can proceed in packages; the moves are cheap afterwards.

---

## 1. The module cut

| Part of the cut | Judgement | Evidence and change |
|---|---|---|
| By product area, not by package | **Agree** | Matches the string files and `NeoModule`. In-area pairs become internal. |
| `:composeApp` stays the root and keeps its name | **Agree** | Xcode calls `:composeApp:embedAndSignAppleFrameworkForXcode` (`App/iosApp/iosApp.xcodeproj/project.pbxproj:155`); the gate names it (`App/scripts/verify.sh:86`); `risk-check-test.sh` names it 129 times. |
| "About 14 modules" | **Correct the number** | D1 lists 17: five `:core:*`, `:designsystem`, `:shell`, two `:shared:*`, six `:feature:*`, `:composeApp`, `:build-rules`. Each has four targets. |
| `:feature:audit` | **Change to `:shared:audit`** | Audit has no screen of its own: 8 files, of which wording (748 lines), two view models, domain and data. Its users build their own screens from it: `src/features/platform/presentation/PlatformAuditLogScreen.kt:86-88`, `src/features/organization/domain/OrganizationUseCases.kt:14`. As a shared kit, 31 references (org→audit 13, platform→audit 17, people→audit 1) need no slot. First remove its one use of Accounts (`src/features/audit/presentation/AuditWording.kt:11`). |
| `:core:auth` | **Fold into `:composeApp`** | Its dependents (session machine, context, profile, login UI) all stay in `:composeApp`. Only `PkceAuthorizationRequest` is needed lower down, because the session contract returns it (`test/design/ScreenSizes.kt:676`); move that one type to `core/session` with the contracts. |
| `:core:network` apart from `:core:common` | **Agree, three back-references to fix** | `src/core/auth/NeoAuthMessages.kt:5` (common → network, a cycle), `src/designsystem/components/NeoFailureCause.kt:10` and `NeoSearchSelectPreviews.kt:20` (designsystem → network). Also `src/designsystem/NeoViewport.kt:3` imports `getPlatform` from the root package. |
| `:shell` | **Agree it is needed; it is larger than "M"** | The size-test harness renders the chrome (`test/design/ScreenSizes.kt:71-75`), so the chrome must sit below the features' tests. But the chrome imports `AppShellState`, `AppPreferences` and `AppSession` (`src/ui/shell/NeoEnterpriseShell.kt:7,47-50`, `navigation/NeoMenuRail.kt:66-68`, `NeoSmartSidebar.kt:65-66`), the routing (`NeoEnterpriseShell.kt:60-61`), ESS, Accounts and Organization (`NeoShellHelpers.kt:5-8,53`) and Koin (`koin-baseline.txt:17-19`). `AppShellState` itself imports Organization (`src/app/shell/AppShellState.kt:8`) and holds Accounts waiting counts (`:51-53`), and the harness builds one (`ScreenSizes.kt:592`). The draft names only the menu imports. |
| `:shared:entitlement` | **Agree** | 9 files; `NeoChangeReason` to core as the draft says. |
| `:shared:person` | **Agree; size M, and name the files** | Platform imports about 27 `internal` names from `people.presentation`. They live in three files: `PersonDetailLayout.kt`, `PeopleLabels.kt`, `RoleAccessUi.kt`. Their `iam_` strings must come with them. |
| Slots for cross-area screens | **Agree for the company record** | The seam exists: `CompanyPeopleTab.kt`, `CompanyRolesTab.kt`, `CompanyDetailAccess.kt`, `CompanyActivityTab.kt` hold almost all Organization → Access imports. They become the slot fillers in `:composeApp`. |
| "Another feature needs behaviour" has no case today | **Not so: two cases** | `OrganizationUseCases.kt:14` calls `AuditRepository` (solved by `:shared:audit`). `src/features/platform/data/repository/PlatformRepositoryImpl.kt:4` calls Organization's `OrganizationService`. Name the second one in the ADR and decide it (a small interface in `:shared` or core, filled in `:composeApp`). |
| No api/impl, no `explicitApi` | **Agree, with a visibility rule** | 1,148 top-level `internal` declarations exist. At least 106 main imports and 49 test imports of them cross the proposed borders (Platform → people `RoleAccessPage`; `src/App.kt` → `neoBuildEnvironment`; `test/design/BranchDetailScreenshotTest.kt` → Organization's `BranchDetailTab`). Each needs a decision: make public, move, or move the test. Say who decides and that widening to public is reviewed. |
| Koin only in the root | **Agree** | Clear the baseline first: four Accounts tabs call `koinInject` (`koin-baseline.txt:4-12`), the sidebar calls `getKoin` (`:17-19`). A module without the Koin dependency will not compile them. |
| `data/mock` stays in `:composeApp` | **Missing decision** | Feature main code imports it (Access 8, Company 1, Platform 1, entitlement 1, auth 1) and so do feature tests (Access 10, Accounts 2). A feature cannot see `:composeApp`. Split the mock data by owner, or make a `:shared:mock` kit. |
| Release environment | **Add** | Production or dev is chosen by Android build-type source sets inside `core/network` (`composeApp/src/androidRelease/.../NeoBuildEnvironment.android.kt`), and `ReleaseEnvironmentSourcePolicyTest.kt:27-31` checks fixed paths. Keep that choice in `:composeApp` (the application module) and pass the environment into the network module. It then cannot depend on variant matching between modules, and it survives the newer Android KMP library plugin, which has no build types (confirm in M0). This lane needs the security reviewer. |

---

## 2. KMP and Compose risks the draft misses or underrates

**Strings (the largest one).** From every `Res.string/plurals/array.<key>` use, mapped to the draft's modules:

| Finding | Evidence |
|---|---|
| `shell_` strings are not used by the chrome at all | `strings_shell_audit.xml`: 210 uses in audit, 3 in Access. `strings_shell_auth.xml`: auth. `strings_shell_dashboard.xml`, `strings_shell_profile.xml`: dashboard and profile. The chrome uses `core_` keys (47 uses). D1's "`:shell` … `shell_` strings" is wrong. |
| Files whose prefix names the wrong module | `strings_iam_company_access.xml` is used by Company (16) and audit (1), never by Access. `strings_platform_agreement.xml`: Company 57, dashboard 1. `strings_platform_entitlement.xml`: only entitlement (7). |
| Uses that cross areas | Access → `platform_` 18 (12 files); Accounts → `org_` 11 and `iam_` 2; audit → `accounts_` 5, `platform_` 2; routing → `org_` 1; with Access → `shell_audit` 3 and audit → `iam_company_access` 1, about 40 uses. A feature cannot read another feature's `Res`. |
| The rewrite is larger than "about 300 files" | 494 files import the generated package: 3,781 per-key import lines, 258 files with a wildcard import, plus fully qualified uses (`src/core/money/NeoNumberFormat.kt:37`, `src/features/accounts/presentation/AccountsRoute.kt:856`). Tests use `Res` too (116 Accounts keys in commonTest). |
| Two `Res` names in one file, for good | 197 Accounts files would carry `CoreRes.string.core_…` next to `Res.string.accounts_…` (1,626 core uses in Accounts alone). |
| Tooling that assumes one resource root | The i18n scans (`test/i18n/`, 12 files), the baselines in `App/i18n/`, the test task's declared inputs (`composeApp/build.gradle.kts:167-170`), the pseudo-locale generator and its "never in a release" guard, which checks only its own project (`:194-199`). |

**Recommendation:** put all of `composeResources` (strings, fonts, files) in one module, `:core:resources`, with `publicResClass = true` and `packageOfResClass = "neoerp.composeapp.generated.resources"`. Every existing import then resolves unchanged: no rewrite, no alias, one root for the i18n scans, and M0b loses its risky half. The cost: adding a key changes that module, so every iOS klib recompiles (JVM recompiles only what uses the changed names). HR v2 can own its strings from birth as the trial of per-module strings. Split the existing areas later only if M0's iOS compile number shows it pays. If Jabran prefers per-module strings now, the rewrite must be driven by a key → module table built from the XML files, after the misfiled files and the 40 crossing uses are resolved, not by prefix.

**Other risks.**

| Risk | What the draft says | What is missing |
|---|---|---|
| Resources missing at run time | M0 shows a string and a font | A missing resource is a run-time crash, not a compile error, and only the desktop JVM is tested. Every M-step needs a start on the iOS simulator and an Android emulator, one screen of the moved module, in `en` and `nb`. `Res.readBytes("files/org/…")` (`src/features/organization/data/service/MockOrganizationService.kt:416`) needs the same proof as fonts. |
| Android | Library modules use `com.android.library` | The gate never builds Android (`verify.sh:86` runs `jvmTest` and the iOS compile). With up to 16 Android library modules (namespaces, manifests, assets), add `:composeApp:assembleDebug` to each M-step and to the whole-suite gate. The DS-1 review found Android has never been in QA. AGP 9 does not accept the KMP plugin in an application module, as I understand it, so `:composeApp` will later need a thin `:androidApp`; confirm in M0 and note it under Q3. |
| iOS framework | No `export()`, link once | Agree: Swift uses only `MainViewControllerKt` (`App/iosApp/iosApp/ContentView.swift:10`). Missing: each M-step must link (`linkDebugFrameworkIosSimulatorArm64`), not only compile; the gate compiles a klib and never links. |
| iOS build time | "The largest compile gain" | Likely true for Xcode debug builds: unchanged klibs keep their native caches (confirm in M0). But Kotlin/Native has no ABI-based compile avoidance: any change in `:core:common` or a strings module recompiles every klib above it, and a feature change always recompiles `:composeApp` for iOS. The draft's sentence on compile avoidance holds for JVM and Android only. |
| Memory on the 16 GB Mac | Cap workers if M0 shows swap | Today: 3 test JVMs of 512 MB heap, one seen at 3.1 GB (`composeApp/build.gradle.kts:146-162`). With the configuration cache on (`App/gradle.properties:7`) Gradle runs tasks of different projects at once, so several modules' `jvmTest` tasks can each start 3 forks (confirm in M0). Put a shared build service on the UI test tasks (one at a time) in the convention plugin; do not wait for swap. |
| Test fixtures across modules | `:core:testing`, `:core:testing-ui` | `testSession` is `internal` in commonTest (`composeApp/src/commonTest/.../core/permissions/TestSessions.kt:13`) and becomes public API of a module. Feature tests that import `data.mock` (Access 10 files, Accounts 2) or `app.session` (Access 7, Company 5) cannot move with their feature until those are resolved. Five size-test classes (four span features, plus the dashboard) must stay in `:composeApp`, where they run on every feature change (about 89 s of class time). |
| Hot Reload | Checked in M0 | The M0 check must edit a composable and a string inside a library module while the app runs, and confirm `neoerp.env=localLive` is still set (`composeApp/build.gradle.kts:297-306`). Not proven by reading. |
| Previews | `uiTooling` in the convention | Not an issue: one `@Preview` in main code (`composeApp/src/androidMain/.../MainActivity.kt:94`). |
| KMM-Network | Two declaring modules | Agree. Add: `okHttpAuthMain` is shared by `androidMain` and `jvmTest` (`composeApp/build.gradle.kts:90-91`) and must move with `core/network` as a pair. |
| Build-rule scans | Moved to `:build-rules` | Its test task must declare every module's sources as inputs, as `:167-170` does today, or a change in another module leaves it up to date. |

---

## 3. Migration order and the queued work

**What is in the wrong order or done twice.**

| Item | Problem | Change |
|---|---|---|
| M0b before any module exists | A rewrite of about 500 files across every open lane, before a single number proves the split pays. | With one strings module, M0b is only the source moves (session contracts, `PkceAuthorizationRequest`, `NeoChangeReason`). |
| Decoupling is spread over M1–M7 | Each move lane also has to break dependencies, so no step is a plain move. | **Phase A, single module:** add one build rule now, a package → target-module map checked against the D2 table with a shrink-only baseline (the existing ratchet, widened to core, designsystem, shell and `data.mock`). Then small lanes bring it to zero: `:shared:audit` shape, `AppShellState` split, menu contribution, slots, Koin baseline, mock data, visibility. Each is useful even if no module is ever created, and none needs a quiet window. **Phase B:** the moves, which are then really `git mv` plus a build file. |
| M2 "after DS-1a, before DS-1b" | DS-1b would wait for M0, M0b, M1 and M2. Design-system changes run the whole suite either way, so building DS-1b "in the module" gains nothing. | No coupling. Only rule: no design-system lane is open during the hour of the M2 move commit. |
| M5 needs M1–M3 | M3 is the hardest step. HR v2's first App lane would wait for it. | HR v2 starts in `features/hr` with its own `strings_hr_*`, zero cross-feature imports and its tests in its own package. The draft's own rule ("new code before its module exists") covers it; moving a clean feature later is small. |
| Gate scope rules | app-test-speed changes the scope rules now (a tier-RISK script, Fable review), M1 changes them for several roots, M8 replaces them. Three changes to the safety net. | Through M1–M7 keep today's package units; change only where sources are scanned (all module roots), which Gradle task a unit maps to, and where results and floors are read. Packages stay, so the unit logic keeps working. Replace it with the module graph once, at M8. |
| Q4 after M7 | Moving 925 Accounts files as one module and splitting them later moves them twice. | Decide Q4 before M7. The numbers needed (test time per Accounts flow, the package graph inside Accounts) do not need M7. |
| Branches | The draft does not say where M-steps land. `phase/hrp-v2` is a long-lived branch that already deletes the old hr, payroll, ess and reports features (`origin/phase/hrp-v2-h0-app`). | State the branch, and that `phase/hrp-v2` merges it after every M-step. |
| ADR-027 | "Changes none of them", but ADR-027 Q6 fixes the App fixture path under `composeApp/src/jvmTest/resources/fixtures/app/` (`ADR-027:123`) and D3 moves it. | Say that it amends that path. |

**Should app-test-speed change because of this ADR? Yes, in four small ways. It should still go first.**

1. Give each moved size test its final package (`features.<area>.…`), so M6 and M7 are plain moves.
2. Use the existing unit rule: a size test in `features.accounts` runs when the `features.accounts` unit is in scope. That maps one to one onto modules later and needs less new gate logic than extending the `design=` picking.
3. Do the harness decoupling now, since it is what forces `design=*`: move the harness to a `testing` package, pass the company scope in instead of importing `Kyst` (`ScreenSizes.kt:69`), and list `AppShellState` and `AppSessionEmitter` (`:43-44`) as the two links M3 must cut.
4. Split the Accounts size tests by flow (journals, payables, receivables, reports, SIE, setup, periods) and report the time per flow. Accounts is 82 % of the test time, so this is where the minutes are, and the same table answers Q4.

Then take the baseline for this ADR **after** app-test-speed merges, so the modules are not credited with its gain.

---

## 4. The speed claims

**"Design is about 95 % of test time": confirmed.** From the JUnit XML of the last whole-suite run I could find (`NeoERP-worktrees/test-scope-app-gate/composeApp/build/test-results/jvmTest`, commit `82b815b0`, 637 classes, 4,147 tests, 1,661 s of class time): size and screenshot classes are 1,591 s, 95.8 %.

**Class time by the draft's modules:**

| Module | Size tests | Other tests | Share of all test time |
|---|---|---|---|
| Accounts | 1,368 s (43 classes) | 21 s | 83.6 % |
| Access | 61 s | 20 s | 4.9 % |
| Company | 38 s | 3 s | 2.5 % |
| `:composeApp` (spans features, dashboard, DI, routing) | 89 s | 7 s | 5.8 % |
| Design system, shell, core, auth | 27 s | 16 s | 2.6 % |
| Build rules and i18n scans | — | 9 s | 0.5 % |

Three classes are 29 % of everything: `TaxCodesDefaultSizeTest` 243 s (5 tests), `A4ScreenSizeTest` 124 s, `KeyboardInViewTest` 108 s.

**"Non-Accounts change about 120–200 s": plausible for the tests, unproven for the compile, and not caused by modules.**
- An Access range is its own 81 s plus `:composeApp` 96 s plus rules 9 s, about 186 s of class time, so 70–110 s on three forks. Company is about 146 s of class time.
- But the anchor, the 146 s Roles run (`App/docs/agents/test-scope-1/builder-report-app.md:199-201`), was measured **in one module**, and right after the whole suite on the same commit, so it probably compiled nothing. The single-module fallback in the draft's alternatives table is not a fallback: it is app-test-speed, already queued, and it delivers this number.
- Since 2026-11-01, 378 of 508 App code commits touch Accounts and 167 touch shared code (whole suite either way). About 25 would have been a non-Accounts feature range. HR v2 will raise that share.

**"Accounts change about 75–85 % of today": optimistic.** Accounts tests plus `:composeApp` plus rules are 90 % of the test time. Only picking by flow inside Accounts lowers it, which is app-test-speed.

**Compile savings in the gate: none as designed.**
- `:composeApp` depends on every module and is in the reverse closure of every feature, so every feature range builds `:composeApp`, and that compiles every module for JVM and iOS.
- Unchanged modules are skipped only if their outputs are reused. Up-to-date state lives in the checkout's `build/` folders, not in the Gradle home as the draft says, and gates run in fresh worktrees with `--no-build-cache` (`App/docs/operations/verify.md:94,124-125`).
- So the gate gains compile time only with Q6 (a build cache for compile tasks, in the gate's own home) or a gate checkout that is kept. Q6 decides whether the claim exists; it cannot wait until after M3.
- The ceiling is small in any case: the whole suite took 703 s of wall time (`builder-report-app.md:198`) against about 554 s of tests on three forks (1,661 / 3; a different run of nearly the same suite), which leaves at most about 150 s for configuration, JVM compile and iOS compile together.

**What to measure, before accepting the estimate table** (one Gradle job, when the Mac is free):
1. Today's gate split into configuration, JVM compile, iOS compile and tests: in a fresh worktree, and after a one-line change in roles and in accounts (`--profile`).
2. The same after app-test-speed. This is the baseline.
3. The Xcode loop: `linkDebugFrameworkIosSimulatorArm64` after a one-line change today, and in the M0 spike. As a control, the single module with `kotlin.incremental.native=true`.
4. In M0: gate time with the compile-task cache on and off; peak memory and swap with two modules' UI tests; configuration and IDE sync time with the module count; `assembleDebug`; Hot Reload restart.
5. Why three test classes take 475 s. Fixing them may be worth more than any module.
6. The gate's own self-tests (989 s today, `builder-report-app.md:262`), which grow with the scope rules.

---

## 5. The open questions

| # | Recommendation in the draft | Judgement |
|---|---|---|
| Q1 | Per product area | **Agree.** |
| Q2 | Slots plus `:shared:*` kits; api only with a reason | **Agree, with changes:** audit is a shared kit, not a feature with slots; name the `PlatformRepositoryImpl` → `OrganizationService` case; add the visibility rule. |
| Q3 | Keep `:composeApp` | **Agree.** Note the later `:androidApp` split for AGP 9. |
| Q4 | Accounts sub-modules: not now, decide with M7 numbers | **Agree with "not now"; decide before M7**, from app-test-speed's per-flow table, so the files move once. |
| Q5 | Do not move the v1 modules | **Agree.** Mostly moot: the HR v2 branch already deletes hr, payroll, ess and reports; inbox is what remains. |
| Q6 | Build cache for compile tasks in the gate: decide after M3 | **Disagree on timing.** Decide in M0 with a measurement. Without it or a kept gate checkout, the gate has no compile gain from modules. Keep tests always rerun and the cache in the gate's own home. |
| Q7 | M0–M3 before HR v2's first App lane; quiet windows for M0b and M7 | **Disagree.** HR v2 and DS-1b do not wait. Order: app-test-speed → measure → Phase A in the single module → M0 spike → moves. With one strings module only M7 needs a quiet window. |

**Questions to add:**
- **Q8 (strings):** one shared strings module first (my recommendation), or per-module strings from the start?
- **Q9 (acceptance per step):** "whole suite green" plus Android `assembleDebug`, an iOS link, and a start on each platform?
- **Q10 (stop rule):** if M0 shows no gain in the Xcode loop and the gate, does the split continue for structure alone? I think yes, but at a slower pace, behind feature work; Jabran should say so.

---

## Change before accepting (ranked)

1. **Speed section:** replace the estimate with the measured table in point 4; say that the test gain is app-test-speed's and that modules add compile savings only with Q6 or a kept gate checkout; take the baseline after app-test-speed.
2. **Strings:** correct the `shell_` row and the "prefix is the rule" sentence; add Q8; default to one `:core:resources` module with the old package name, HR v2 as the per-module trial.
3. **Order:** Phase A (decouple in the single module under a package → module rule test) before any move; HR v2 and DS-1b do not wait; Q4 before M7; name the branch and the `phase/hrp-v2` merges.
4. **Module list:** audit becomes `:shared:audit`; fold `:core:auth` into `:composeApp`; say 17 modules (16 after folding auth, 17 again with `:core:resources`); add a decision for `data/mock`.
5. **Per-step acceptance (Q9):** `assembleDebug`, an iOS link, and a start on iOS, Android and desktop with one moved screen, in two languages.
6. **Gate:** keep package units through M1–M7 and switch to the module graph once at M8; decide Q6 in M0; add the Android build to the whole-suite gate.
7. **Visibility:** a rule for `internal` names that cross a border (at least 155 imports today) and who approves a widening to public.
8. **`:shell` step:** list all its links (`AppShellState`, `AppPreferences`, `AppSession`, routing, ESS, Organization, Koin) and resize it; M3 is the step most likely to slip.
9. **Security:** keep the release-environment choice and the dev-session hooks in `:composeApp`; the lane that touches them and the source-policy tests gets the security reviewer.
10. **Memory:** a shared build service that runs one UI test task at a time, in the convention plugin from M0.
11. **Smaller:** fix the three core/designsystem back-references and `getPlatform`; clear the Koin baseline before M3 and M7; the `:build-rules` test task declares all module sources as inputs; say that D3 amends the ADR-027 fixture path.

Brief: unclear or missing — (1) Which branch the M-steps land on, and how `phase/hrp-v2` follows, is in neither the brief nor the draft. (2) The draft says "about 14 modules" but lists 17. (3) No compile time is measured anywhere, and I could not run Gradle, so the compile half of point 4 is reasoning plus one bound from wall time. (4) The brief says "HR v2 App screens soon" without saying whether its first lane is expected before or after M3, which is the main timing question.

---

## Revision 2 check

Date: 2026-11-24. Checked: revision 2 of the draft (workspace commit `e2039ce`) against my ranked list, then Jabran's three decisions and Q11–Q13. Read only, no Gradle. The line at the top stays ACCEPT WITH CHANGES: my eleven changes went in correctly, and the new decisions are sound in direction, but they open three holes in the gate and move three pieces of work behind the step that needs them.

### My list

| # | Change | In revision 2 |
|---|---|---|
| 1 | Speed section | **In.** Measured table, T0 owns the test gain, baseline after T0, 150 s ceiling. |
| 2 | Strings | **In.** One `:core:resources` with today's package; HR and Payroll as the trial. One gap: item 5 below. |
| 3 | Order | **In**, except that HR is born as a module (Jabran's decision, which replaces my "HR in a package"). Gap: item 4 below. |
| 4 | Module list | **In.** `:shared:audit`, auth folded, 18 counted correctly, `data/mock` split by owner. |
| 5 | Per-step acceptance | **In.** |
| 6 | Gate | **In.** Package units through phase B, graph at M8, cache decided in M0, Android build and iOS link before `main`. |
| 7 | Visibility rule | **In** as a rule; its timing is item 4 below. |
| 8 | `:shell` step | **In** (size L, links listed). |
| 9 | Security | **In** as a rule; the work itself is missing from the HR track (item 4). |
| 10 | Memory | **In.** |
| 11 | Smaller items | **In.** "Amends ADR-027 Design 5" is the right section (`ADR-027:119-123`). |

### What the revision broke or left open (ranked)

1. **A feature range no longer compiles the root with that feature.** Today every run compiles everything, "so a broken caller fails the compile" (`App/docs/operations/verify.md`, "Units"). Under (a), an HR range runs only `:feature:hr` tasks. The root names HR only in the generated `NeoFeatureSet.kt`, which is not in git, so the scope (git objects only) never adds a root unit. The leave-one-out compile builds the root *without* HR. So a renamed entry object or a changed registration reaches the phase branch uncompiled. **Change:** every scoped run also runs `:composeApp:compileKotlinJvm` and `:composeApp:compileKotlinIosSimulatorArm64` with the full feature set. With the cache this costs the changed module plus the root.
2. **Unit → task mapping misses tests held in a second module.** HR's size tests stay in `:composeApp` under `features.hr` until M3, but (a) maps `features.hr` to "the module that owns its package", `:feature:hr`. The size tests would then not run on an HR range. **Change:** a unit maps to every module that has test files in that package (read from the git paths), and the unit's floor is summed over them. Those tests can also reach only HR's public names.
3. **Test tasks and the cache (Q13).** "Always rerun" needs more than leaving a flag out. Verify counts XML as fresh by file time (`App/scripts/verify.sh:597`), and `verify.md:135-136` says `--no-build-cache` is what keeps Gradle from restoring an earlier result. A result restored from the cache is written now, so it would count. **Change:** the convention plugin marks every `Test` task as never cacheable and never up to date; verify fails when a test task in scope reports FROM-CACHE or UP-TO-DATE; one gate self-test proves it.
4. **The HR track lacks three things that are scheduled after it.**
   - Visibility: about 45 of the 155 crossing imports sit on the core and designsystem borders (32 main, 13 tests; e.g. `AbstractStateMachine`, `NeoSkeletonBlock`, `readBodyUpTo`). The visibility list is in A1–A7, after M1 and M2 need it. About 14 core and designsystem test files import app or feature code and must stay in the root or be rewritten.
   - Release environment: `neoBuildEnvironment()` is an `internal expect` in `core/network` with actuals in build-type source sets. Passing it in from `:composeApp` must happen before M1, with the security reviewer. A-core does not list it.
   - Registry hosts: HR-1 registers "through the registry", but "menu, routes and home tiles onto the registry" is in A1–A7. The menu and route hosts must read the registry (beside today's hard-wired routing) before HR-1.
   **Change:** add all three to A-core.
5. **String paths.** The scope reads string files at one fixed path (`App/scripts/risk-check.sh:465`). After M1 and HR-1 that path matches nothing, so every range with a string change becomes a whole-suite run. Safe, but it removes the scoping for most UI lanes. Update the pattern in M1. "One root for the i18n scans" holds only until HR-1: the scans, the baselines, the pseudo-locale generator and its release guard (which checks its own project only, `composeApp/build.gradle.kts:194-199`) must handle several roots from M0.
6. **The registry contract is underspecified in four places.**
   - Lifetime: when `start(deps)` runs and when a feature's graph is dropped. A graph that outlives sign-out or a company switch can show one company's data in another (the bug class in `docs/backlog.md:437`). Say that the graph is built per signed-in session and dropped at sign-out, and give this to the security reviewer.
   - Shared kits: `NeoFeatureDeps` is in core and cannot name `:shared:*` types. Say where the audit and entitlement services are built and how features get them, without rebuilding Koin under another name.
   - Typed slots: `NeoSlotId` → composable loses the argument types (a company record tab needs the company and the caller's rights). Use a typed key, so a wrong argument is a compile error.
   - Existing areas: "graph built inside the feature, no Koin" means moving each area's wiring out of `NeoAppDi.kt` (813 lines) and `NeoSmartContentArea.kt` (639 lines), with the DI tests. That is one lane per area and is not in A1–A7.
7. **M0 is too large for one spike:** build logic, three-platform resource proof, Hot Reload, pseudo-locale, gate tasks, shared cache, registry, feature property, leave-one-out, memory service, graph file, measures. Split it: build and resources proof with the measures; the gate change (a tier-RISK script, its own review); the registry.
8. **Smaller.** Verify should pass `-Pneoerp.features=<all>` itself, as it does for `neoerp.kmmNetworkPath` (`verify.sh:489`), so an environment or Gradle-home property cannot narrow what the gate builds. Only gate runs write to the shared cache; builders read. M0 must show cache hits from a second worktree at another path, per task (JVM compile, iOS klib compile, resource generation): worktrees differ in absolute path, and I have not confirmed that the Kotlin/Native compile is relocatable. "Per-customer builds need no extra work" is too strong: all strings, destinations and permissions still ship. M6 should also follow A5–A7.

### Jabran's decisions

| Decision | Sound? |
|---|---|
| HR and Payroll born as modules, HR track first | **Yes**, with items 2, 4 and 5. The cost is that HR's first App flow waits for four lanes (M0, A-core, M1, M2), of which M1 carries the core move and the gate change. |
| Per-module gate tasks and a per-Mac build cache from M0 | **Yes**, with items 1, 2, 3 and the cache rules in item 8. Without item 1 the scoped gate is weaker than today's. |
| Feature registry, `-Pneoerp.features`, leave-one-out compile | **Yes in direction**, with item 6. The property is per Gradle run, so leave-one-out is a second run with its own configuration time. |

### Q11–Q13

| # | Draft's recommendation | My view |
|---|---|---|
| Q11 | Once per gate (the changed feature); each feature before `main` | **Change the trigger.** A leak into the root is a change to root sources, so a feature-only range cannot create one, and leaving out the changed feature proves nothing new. A leak into another feature is already refused by the Gradle rule. Do three things: a text rule in `:build-rules` on every run (no root file outside the generated set names a registered feature's package; complete and free); leave-one-out for every feature before `main`; on phase ranges only when root sources or the registry contract changed. Item 1 is needed either way. |
| Q12 | M0 goes ahead without T0; baseline from T0's report | **Agree, with two conditions.** T0 and M0 both change `verify.sh` and `risk-check.sh`: one of them merges its gate change first and the other rebases, never in parallel. T0's brief measures only the scoped run, so add the configuration / JVM compile / iOS compile / tests split to it, or run that as its own job. |
| Q13 | No test results from the cache | **Agree**, enforced in the build as in item 3, not by a flag. |

Brief: unclear or missing — whether "the gate" in Jabran's cache decision covers builders' own runs (`--scoped-tests-only`) or only marker runs; I assumed builders read the cache and only gate runs write it.
