# ADR-028: Split the App (`:composeApp`) into Gradle modules

## Status
**Draft, revision 2** (ERP lead, 2026-11-24) for Jabran. He has set the direction ("onward we should split composeApp into modules") and made the decisions of 2026-11-24 marked "decided by Jabran" below. Revision 2 applies Fable 5.2's verdict, ACCEPT WITH CHANGES (`docs/reviews/adr-028-fable-verdict.md`). Every App brief that adds a module or moves code links it.
Builds on ADR-011 (one App) and TEST-SCOPE-1 (D-47). It **amends ADR-027 Design 5**: the App's copy of the flow fixtures moves from `composeApp/src/jvmTest/resources/fixtures/app/` to the owning feature module's `jvmTest/resources`.
Evidence: App `4e0ec8c7` (`phase/4`). `App/` = `NeoERP-App/`, `src/` = `App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`, `test/` = `App/composeApp/src/jvmTest/kotlin/com/neovatus/neoerp/app/`.

## Summary
18 Gradle modules cut by product area: five `:core:*`, `:designsystem`, `:shell`, three `:shared:*` kits, six `:feature:*`, `:composeApp` (root, name kept) and `:build-rules`. **New modules start as modules** (decided by Jabran): HR and Payroll never live in `:composeApp`. HR goes first: M0, `:core` (with one shared `:core:resources` keeping today's `Res` package) and `:designsystem` come before HR's first App flow. Features register with the root (menu, routes, home tiles, slots), and a build property picks any subset. From M0 the gate runs per-module tasks with a build cache shared by each Mac's worktrees. Existing areas are decoupled inside the single module under a package → module rule test, then moved. Most of the test-time gain belongs to `core/app-test-speed`; modules give structure, compile savings and per-customer builds.

## Context: what we measured
**One module.**
- `settings.gradle.kts:49` includes only `:composeApp`. KMM-Network is an included build (`:14-16`).
- One build file defines Android, the static iOS framework `ComposeApp` (`composeApp/build.gradle.kts:60-68`) and the JVM desktop target (`:70-74`).
- Main code is 1,151 files. Features are 902 files and 205k lines, of which **Accounts is 575 files and 141k lines**.

**The rule is text, not structure.**
- "Features never import from other features" (`App/.claude/CLAUDE.md:64`) is held by a ratchet (`FeatureImportRuleTest.kt:11-25`): **31 pairs, 312 references** (`feature-imports-baseline.txt:2-36`).
- **Hidden coupling** (Fable §1), which a move does not fix:
  - at least **155 imports of `internal` names** cross the planned borders (106 main, 49 tests);
  - features import `data.mock`;
  - the chrome needs `AppShellState`/`AppPreferences`/`AppSession`, routing, ESS, Accounts, Organization and Koin (`src/ui/shell/NeoEnterpriseShell.kt:7,47-61`, `NeoShellHelpers.kt:5-8`), and `AppShellState` imports Organization (`src/app/shell/AppShellState.kt:8`);
  - core and designsystem point back to network (`core/auth/NeoAuthMessages.kt:5`, `designsystem/components/NeoFailureCause.kt:10`, `NeoSearchSelectPreviews.kt:20`; `NeoViewport.kt:3` uses `getPlatform`);
  - `PlatformRepositoryImpl.kt:4` calls Organization's `OrganizationService`: behaviour, not a type.

| Kind of reference | Refs | Resolution |
|---|---|---|
| Inside one product area (org→agreement 36, people→iam 10, …) | 61 | Internal to the area module |
| Shared entitlement types (org→entitlement 64, …) | 90 | `:shared:entitlement`; `NeoChangeReason` → `:core:common` |
| Audit used by org / platform / people | 31 | `:shared:audit` (no screen of its own; users build their screens from it) |
| Session/auth (`PkceAuthorizationRequest`) | 7 | The type moves to core session contracts; the rest of auth stays in `:composeApp` |
| Home page (dashboard→agreement/org/platform) | 20 | Home tiles through the registry; later ADR-027's `/api/app/home` |
| Screen in another area's screen (org→people 30, platform→people 40, …) | ~103 | Registry slots (company record tabs: `CompanyPeopleTab.kt`, `CompanyRolesTab.kt`, `CompanyDetailAccess.kt`); person pieces (`PersonDetailLayout.kt`, `PeopleLabels.kt`, `RoleAccessUi.kt`) → `:shared:person` |

**Test time** (Fable §4, from the JUnit XML of the last whole-suite run: commit `82b815b0`, 637 classes, 4,147 tests, 1,661 s of class time):
| Module | Size tests | Other | Share |
|---|---|---|---|
| Accounts | 1,368 s (43 classes) | 21 s | 83.6 % |
| Access | 61 s | 20 s | 4.9 % |
| `:composeApp` (spans features, dashboard, DI, routing) | 89 s | 7 s | 5.8 % |
| Company | 38 s | 3 s | 2.5 % |
| Design system, shell, core, auth | 27 s | 16 s | 2.6 % |
| Build rules and i18n | — | 9 s | 0.5 % |

- **Size and screenshot tests are 95.8 %** of test time. **The Accounts size tests alone are 82 %.**
- Three classes are 29 % of all time: `TaxCodesDefaultSizeTest` 243 s, `A4ScreenSizeTest` 124 s, `KeyboardInViewTest` 108 s.
- Today a one-line Roles change runs all of design, 680 s against 703 s for the whole suite (`App/docs/agents/test-scope-1/builder-report-app.md:263,269`). The cause is that `ScreenSizes.kt` imports the chrome, `app.session`/`app.shell` and an Accounts fixture (`test/design/ScreenSizes.kt:43-44,69,71-75`).
- The same range ran 146 s with its size tests picked, **inside the one module**. That gain is `core/app-test-speed`'s, not the modules'.
- **Compile has a small ceiling:** 703 s of wall time against about 554 s of tests on three forks leaves at most about 150 s for configuration, JVM compile and iOS compile together.
- **The gate never builds Android and never links iOS** (`App/scripts/verify.sh:86`). It runs in fresh worktrees with `--no-build-cache` (`verify.md:94`), so it reuses nothing today.

**Strings** (Fable §2). One generated `Res` (`neoerp.composeapp.generated.resources`) is imported by 494 files (3,781 per-key imports, 258 wildcards). Prefixes do not match modules: `shell_` strings belong to audit, auth, dashboard and profile (the chrome uses `core_`); `strings_iam_company_access.xml` and `strings_platform_agreement.xml` belong to Company; about 40 uses cross areas. A rewrite by prefix is wrong.

**Wiring.** Koin is one module (`src/app/di/NeoAppDi.kt:131`), allowed only in `app/di` and the routing boundary (`App/.claude/CLAUDE.md:66-70`); four Accounts tabs and the sidebar still call it (`koin-baseline.txt:4-12,17-19`). `NeoDestination` is a core enum (`src/core/navigation/NeoDestination.kt:9`), and `NeoSmartContentArea.kt` routes to every feature. Xcode runs `:composeApp:embedAndSignAppleFrameworkForXcode` (`project.pbxproj:155`); Swift uses only `MainViewControllerKt`. Android build-type source sets choose production or dev (`androidRelease/.../NeoBuildEnvironment.android.kt`, checked by `ReleaseEnvironmentSourcePolicyTest.kt:27-31`). AGP 8.8.2, Kotlin 2.2.21, Compose MP 1.10.0.

## Decision

### D1. Modules (18; 19 if `:shared:mock` is needed)
| Module | Holds | Kind |
|---|---|---|
| `:core:resources` | **all of today's `composeResources`** (strings in en/nb/sv/da plus fi/is stubs, fonts, `files/`), `publicResClass = true`, `packageOfResClass = "neoerp.composeapp.generated.resources"` | KMP + Compose resources |
| `:core:common` | core model, result, text, time, money, format, permissions, presentation, navigation, i18n; session contracts (`AppSessionReader/Emitter`, `signOutOnSessionExpiry`, `PkceAuthorizationRequest`); `NeoChangeReason`; the **feature registry contract** (D4) | KMP + Compose runtime |
| `:core:network` | `core/network`, KMM-Network API; `okHttpAuthMain` moves with it as a pair | KMP |
| `:core:testing` / `:core:testing-ui` | commonTest fakes (`testSession` becomes public API) / the size harness (`ScreenSizes`, `FitShots`, `LayoutChecks`, `DesignShots`) | test-only (KMP / JVM) |
| `:designsystem` | `designsystem/` | KMP + Compose |
| `:shell` | the chrome only (sidebar, rail, top bar, menu mode), after `AppShellState` is split | KMP + Compose |
| `:shared:entitlement`, `:shared:person`, `:shared:audit` | domain + display pieces used by several areas | KMP + Compose |
| `:feature:hr`, `:feature:payroll` | **born as modules**, own strings (the per-module strings trial) | KMP + Compose |
| `:feature:accounts`, `:feature:company` (organization, agreement, companyaccess), `:feature:access` (people, roles, security, iam), `:feature:platform` | moved in phase B | KMP + Compose |
| `:composeApp` | root: `App.kt`, `app/` (runtime, session machine, auth incl. login and PKCE flow, DI, Decompose root), routing host, dashboard host, profile, context, release-environment choice, dev-session hooks, inbox (v1); Android app, iOS framework, desktop, Hot Reload | as today |
| `:build-rules` | the tree scans (build rules, i18n, source policies); its test task declares **every module's sources** as inputs | JVM, tests only |

- **Why product areas:** they match `NeoModule`, the modules we sell and the string files. A cut per package would need 21 modules and 31 pairs to break.
- **Packages stay:** a move does not rename packages.
- **`:core:auth` is folded into `:composeApp`:** all of its users stay in `:composeApp`.
- **`data/mock` is split by owner:** each area's mock data moves into that area. Whatever two areas still share after the split becomes `:shared:mock`. Either way, no feature imports `:composeApp`.
- **Release environment:** the choice stays in `:composeApp`, and the environment is passed into `:core:network`. The lane that touches it, the dev-session hooks or the source-policy tests gets the security reviewer.
- **Strings (Q8):** one `:core:resources` keeps every import unchanged: no rewrite, one root for the i18n scans. Cost: a new key recompiles every iOS klib. HR and Payroll own their strings (import the module's own `Res` as `<Area>Res`, fixed in M0). The others split only if M0's iOS numbers show it pays, then by a key → module table from the XML, never by prefix.

### D2. Dependency rules, enforced by Gradle
| Module | May depend on |
|---|---|
| `:core:resources` | libraries only |
| `:core:common`, `:core:network` | `:core:resources`; network also `:core:common` (no back-references) |
| `:designsystem` | `:core:common`, `:core:resources` (not network) |
| `:shell` | `:core:*`, `:designsystem` |
| `:shared:<x>` | `:core:*`, `:designsystem`; never `:shared` or `:feature` |
| `:feature:<x>` | `:core:*`, `:designsystem`, `:shared:*`; **never `:feature:*`, `:shell` or `:composeApp`** |
| `:core:testing(-ui)` | `:core:*`, `:designsystem`, `:shell`; test source sets only |
| `:composeApp` | `:core:*`, `:designsystem`, `:shell`, `:shared:*`, and the **selected** features through the registry only |

- **Enforcement:** convention plugins `neoerp.kmp.library`, `neoerp.kmp.compose`, `neoerp.feature` in an included `App/build-logic/`; `neoerp.feature` fails configuration on a forbidden `ProjectDependency`; `checkModuleGraph` writes `App/docs/operations/module-graph.txt`, checked for staleness by `:build-rules`; Gradle refuses cycles.
- **Before any move, a module-rule test** in the single module: a package → target-module map checked against this table, with a shrink-only baseline. It is today's ratchet, widened to core, designsystem, shell and `data.mock`. A move is allowed when its packages reach zero.
- **Visibility:** each `internal` name used across a border (at least 155 imports) is made public, moved, or has its test moved. The builder lists each one in the lane report. Widening to public is a review item, and the lead decides disputed cases.
- **Behaviour across features** (`PlatformRepositoryImpl` → `OrganizationService`): a small interface in `:shared` or `:core`, filled in `:composeApp`.
- **api/impl:** none. No `explicitApi`.
- **Koin** stays only in `:composeApp`. The Koin baseline is cleared before `:shell` and before Accounts move.

### D3. KMP specifics
- **Targets:** every module has Android, `iosArm64`, `iosSimulatorArm64` and `jvm`. Library modules use `com.android.library`. AGP 9 will later need a thin `:androidApp` (confirm in M0; Q3).
- **iOS:** one static framework, `ComposeApp`, with **no `export()`**. Kotlin/Native has no ABI-based compile avoidance: a change in `:core:*` recompiles every klib above it, and a feature change always recompiles `:composeApp` for iOS. Unchanged klibs keep their native caches in the Xcode loop (confirm in M0).
- **Memory:** a shared build service in the convention plugin runs **one UI test task at a time**. Each task keeps today's 3 forks of 512 MB.
- **Hot Reload:** M0 edits a composable and a string inside a library module while the app runs, and checks that `neoerp.env=localLive` is still set (`composeApp/build.gradle.kts:297-306`).

### D4. Feature registry and feature sets (decided by Jabran)
| Part | Rule |
|---|---|
| Contract | `NeoFeature` in `:core:common`: `id`, `module: NeoModule`, menu entries, routes (`NeoDestination` → screen), home tiles, slot contributions (`NeoSlotId` → composable), and `start(deps: NeoFeatureDeps)`. The deps are the core services the root passes in: network runtime, session reader/emitter, shell emitter, environment. |
| Inside a feature | Each feature has one public entry object (e.g. `HrFeature`). Its graph is built by constructors inside the feature, with no Koin. Koin in the root wires the core services only. |
| Root | Never names a feature's internals. The only feature names are in a **generated** `NeoFeatureSet.kt` and in the Gradle dependencies, both produced from `-Pneoerp.features=accounts,hr,…` (default: all). Shared modules are always in. |
| Hosts | The menu, routing, home and slot hosts read the registry. A slot or destination with no registered feature is hidden, like a module switched off by entitlement. |
| Runtime default | One App for everyone, with modules switched on by the company's plan, as today. Per-customer builds (enterprise, white-label) need no extra work. |
| Gate check | Every gate compiles `:composeApp` for the JVM **once with one feature left out**: the range's changed feature, else one chosen by commit. A leak into the root or into another feature then fails to compile (Q11). |

`NeoDestination` stays a core enum for now. A change there runs the whole suite anyway.

## Tests and build speed
- **`core/app-test-speed` (T0) goes first and owns the test gain**, with four changes for this ADR (Fable §3): size tests get their final package (`features.<area>…`) and run when their unit is in scope; the harness moves to a `testing` package with the company scope passed in (no `Kyst`), naming `AppShellState`/`AppSessionEmitter` as the links M3 cuts; the Accounts size tests are split by flow with time per flow (answers Q4). The baseline for this ADR is taken **after** T0, so modules are not credited with its gain.
- **The gate, from M0 (decided by Jabran):**
  - (a) each scope unit maps to the Gradle tasks of the module that owns its package, e.g. `features.hr` → `:feature:hr:jvmTest :feature:hr:compileKotlinIosSimulatorArm64`. Package units stay through phase B and are replaced by the module graph once, at M8;
  - (b) a **local Gradle build cache shared by the worktrees on each Mac** (one folder per repo, set in the gate's Gradle home). Fresh gate worktrees then reuse unchanged modules' compile outputs. Test tasks in scope always rerun, and only XML written by this run is counted;
  - the **whole suite before `main` stays**, and gains `:composeApp:assembleDebug` and `linkDebugFrameworkIosSimulatorArm64`.
- **Expected effect** (to measure, not promised): feature-range tests about 70–110 s (Access) come from T0; modules add skipped compiles from the cache inside the ~150 s ceiling and a faster Xcode loop; Accounts ranges stay near 90 % of today until per-flow picking or Q4.
- **Measure** (one Gradle job, Mac free; Fable §4): today's gate split into configuration / JVM compile / iOS compile / tests (`--profile`, fresh worktree, one-line roles and accounts changes); the same after T0 (the baseline); the Xcode link after a one-line change (control: `kotlin.incremental.native=true`); in M0 the cache on/off, peak memory with two modules' UI tests, configuration and IDE sync, `assembleDebug`, Hot Reload; why three classes take 475 s; the gate self-tests (989 s).

## Migration plan
**Acceptance for every step (Q9):** whole suite green, `:composeApp:assembleDebug`, the iOS framework links, and the App starts on the iOS simulator, an Android emulator and desktop with one screen of the moved module in `en` and `nb` (a missing resource is a run-time crash, not a compile error; `Res.readBytes("files/…")` needs the same proof).

**Where steps land:** each step is one lane with one Opus review, and the review that touches the release environment gets the security reviewer. Steps land on the current App phase branch, and `phase/hrp-v2` merges it after every step.

| Step | Content | Size | After |
|---|---|---|---|
| T0 | `core/app-test-speed` with the four changes above; then the baseline measures | (queued) | — |
| **HR track** (decided by Jabran) | | | |
| M0 | Spike: `build-logic`, `:core:testing` and one resources module; string, font and `files/` read on iOS, Android and desktop; Hot Reload; `-Pi18n.pseudo`; per-module gate tasks plus the shared cache; registry skeleton plus `neoerp.features` plus the leave-one-out check; memory build service; graph file; measures | M | T0 (Q12) |
| A-core | Single module: fix the back-references (`NeoAuthMessages`, `NeoFailureCause`, `NeoSearchSelectPreviews`, `getPlatform`); move the session contracts, `PkceAuthorizationRequest` and `NeoChangeReason` into core; add the module-rule test | S–M | M0 |
| M1 | `:core:resources`, `:core:common`, `:core:network` (with `okHttpAuthMain`), `:build-rules` | M | A-core |
| M2 | `:designsystem`. No DS lane may be open during the move commit; DS-1b does not wait | S–M | M1 |
| HR-1 | `:feature:hr` created by HR's first App flow, registered through the registry. Its size tests stay in `:composeApp` under `features.hr` until M3 | — | M2 |
| — | `:feature:payroll` the same way, when Payroll's first App flow starts | — | M2 |
| **Phase A, single module** (no quiet window; each lane useful on its own) | | | |
| A1–A7 | `:shared:audit` shape (drop `AuditWording.kt:11`'s Accounts use); `AppShellState` split; menu, routes and home tiles onto the registry; slots; Koin baseline cleared; mock data split; visibility list; `OrganizationService` interface | S each | A-core |
| **Phase B, moves** (`git mv` plus a build file; the move commit kept separate) | | | |
| M3 | `:shell` and `:core:testing-ui`; HR's size tests move into `:feature:hr` | **L** (most likely to slip) | A1–A2 |
| M4 | `:shared:entitlement`, `:shared:person`, `:shared:audit` | S each | A1 |
| M5 | `:feature:access`, `:feature:company`, `:feature:platform`, one per lane | S–M each | M4, A4–A7 |
| M6 | `:feature:accounts`, in one quiet window; Q4 decided before | M | M3, M4 |
| M8 | Scope by module graph; delete the ratchet; update ARCHITECTURE.md, AGENTS.md, CLAUDE.md rule 1 and the developer docs | S | M6 |

## Alternatives considered
| Option | For | Against | Verdict |
|---|---|---|---|
| Single module, test picking only (T0) | Most of the test gain | Rule stays text; no compile gain; no feature sets | First, not instead |
| Per-module strings now | Fewer iOS recompiles per key | About 500-file rewrite, misfiled files, about 40 crossing uses | Trial with HR/Payroll; the rest by numbers (Q8) |
| One module per package (21), or api/impl everywhere | Finest scope, compile avoidance | 31 pairs or about 2× modules; no ABI avoidance on Kotlin/Native | Rejected |
| HR in a package, moved later (Fable's option) | HR waits for nothing | The rule stays text for new code; a second move | Not taken (Jabran: born as a module) |

## Risks
| Risk | Mitigation |
|---|---|
| Resources missing at run time | Start on three platforms in two languages at every step |
| iOS recompiles everything after a `:core:*` change | Measured in M0; per-module strings only if it pays |
| Hidden coupling turns moves into refactors | Phase A and the module-rule test; a move only at zero |
| Memory on a 16 GB Mac | One UI test task at a time |
| Release environment drifts into a library | Choice kept in `:composeApp`; security reviewer |
| A feature leaks into the root | Generated feature set; leave-one-out compile |

## Consequences
The rule becomes a compile error. HR and Payroll start clean, any subset of features can be built, and the gate reuses unchanged modules. Costs: T0 plus about 15 lanes, `build-logic`, a registry, a graph file, verify/risk-check changes twice (M0 tasks and cache; M8 graph), one quiet window (Accounts), doc updates.

## Questions
| # | Question | Answer |
|---|---|---|
| Q1 | Per product area or per package? | Recommendation: per area (Fable agrees) |
| Q2 | Cross-area screens | **Decided by Jabran:** through the registry (slots, routes, home tiles). Recommendation: shared types in `:shared:*` kits; api modules only with a reason |
| Q3 | Keep `:composeApp` as the root? | Recommendation: keep; a thin `:androidApp` when AGP 9 needs it |
| Q4 | Split Accounts into sub-modules? | Recommendation: not now; decide **before** M6 from T0's per-flow table |
| Q5 | Move the v1 modules? | Recommendation: no. Mostly moot, because `phase/hrp-v2` deletes hr, payroll, ess and reports; inbox stays in the root |
| Q6 | Gate gain | **Decided by Jabran:** in M0, per-module tasks plus a build cache shared by the worktrees on each Mac; the whole suite before `main` stays |
| Q7 | Timing | **Decided by Jabran:** new modules start as modules; HR first: M0, `:core` (with `:core:resources`) and `:designsystem` before HR's first App flow; HR waits for no other step |
| Q8 | Strings: one module or per module? | Recommendation: one `:core:resources` with today's package; HR/Payroll own theirs as the trial |
| Q9 | Acceptance per step | Recommendation: whole suite, `assembleDebug`, iOS link, start on 3 platforms in en + nb |
| Q10 | Stop rule if M0 shows no speed gain | Recommendation: continue for structure and feature sets, behind feature work |
| Q11 | Leave-one-out check: once per gate, or every feature before `main`? | Recommendation: once per gate (changed feature); before `main`, each feature once, JVM compile only |
| Q12 | If T0 is not merged when HR's first App flow is ready | Recommendation: M0 goes ahead; the baseline comes from T0's own report |
| Q13 | Test results from the cache? | Recommendation: no; tests in scope always rerun |
