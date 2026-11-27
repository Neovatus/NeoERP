# ADR-028: Split the App (`:composeApp`) into Gradle modules

## Status
**Accepted by Jabran** (2026-11-24), revision 3 (**Q14 changed again by D-105, 2026-11-27: HR waits for M2 + M0-c and starts as `:feature:hr`**) with the recommendations for Q1, Q3–Q5, Q8–Q13, **and Q14 changed: HR does not wait for the module split** ("HR not wait for other to be modules splits"). HR is built now in its own package `features.hr` inside `:composeApp`, guarded by a border test that refuses imports from other features (the package → module rule); when M0-a/b/c, A-core, M1 and M2 are done, it moves to `:feature:hr` as a plain move. Payroll and later modules do the same. Revisions 2 and 3 applied Fable 5.2's verdict and its revision-2 check.
Builds on ADR-011 (one App) and TEST-SCOPE-1 (D-47). It **amends ADR-027 Design 5**: the App's copy of the flow fixtures moves from `composeApp/src/jvmTest/resources/fixtures/app/` to the owning feature module's `jvmTest/resources`.
Evidence: App `4e0ec8c7` (`phase/4`). `App/` = `NeoERP-App/`, `src/` = `App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`, `test/` = `App/composeApp/src/jvmTest/kotlin/com/neovatus/neoerp/app/`.

## Summary
18 Gradle modules by product area: five `:core:*`, `:designsystem`, `:shell`, three `:shared:*`, six `:feature:*`, `:composeApp` (root, name kept), `:build-rules`. **New modules start as modules** (decided by Jabran); HR goes first, after M0, `:core` (one `:core:resources` keeping today's `Res` package) and `:designsystem`. Features register with the root through a registry; a build property picks any subset. From M0 the gate runs per-module tasks with a per-Mac shared build cache. Existing areas are decoupled in the single module under a package → module rule test, then moved. The test-time gain is mostly `core/app-test-speed`'s; modules give structure, compile savings and feature sets.

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
  - the chrome needs `AppShellState`/`AppPreferences`/`AppSession`, routing, ESS, Accounts, Organization and Koin (`src/ui/shell/NeoEnterpriseShell.kt:7,47-61`, `NeoShellHelpers.kt:5-8`, `src/app/shell/AppShellState.kt:8`);
  - core and designsystem point back to network (`core/auth/NeoAuthMessages.kt:5`, `designsystem/components/NeoFailureCause.kt:10`, `NeoSearchSelectPreviews.kt:20`; `NeoViewport.kt:3` uses `getPlatform`);
  - `PlatformRepositoryImpl.kt:4` calls Organization's `OrganizationService`: behaviour, not a type.

| Kind of reference | Refs | Resolution |
|---|---|---|
| Inside one product area (org→agreement 36, people→iam 10, …) | 61 | Internal to the area module |
| Shared entitlement types (org→entitlement 64, …) | 90 | `:shared:entitlement`; `NeoChangeReason` → `:core:common` |
| Audit used by org / platform / people | 31 | `:shared:audit` (no screen of its own) |
| Session/auth (`PkceAuthorizationRequest`) | 7 | Type to core session contracts; auth stays in the root |
| Home page (dashboard→agreement/org/platform) | 20 | Home tiles through the registry; later ADR-027's `/api/app/home` |
| Screen in another area's screen (org→people 30, platform→people 40, …) | ~103 | Typed registry slots (`CompanyPeopleTab.kt`, `CompanyRolesTab.kt`, `CompanyDetailAccess.kt`); person pieces (`PersonDetailLayout.kt`, `PeopleLabels.kt`, `RoleAccessUi.kt`) → `:shared:person` |

**Test time** (Fable §4, from the JUnit XML of the last whole-suite run: commit `82b815b0`, 637 classes, 4,147 tests, 1,661 s of class time):
| Module | Size tests | Other | Share |
|---|---|---|---|
| Accounts | 1,368 s (43 classes) | 21 s | 83.6 % |
| Access | 61 s | 20 s | 4.9 % |
| `:composeApp` (spans features, dashboard, DI, routing) | 89 s | 7 s | 5.8 % |
| Company | 38 s | 3 s | 2.5 % |
| Design system, shell, core, auth | 27 s | 16 s | 2.6 % |
| Build rules and i18n | — | 9 s | 0.5 % |

- **Size tests are 95.8 %** of test time; **Accounts size tests alone 82 %**; three classes 29 % (`TaxCodesDefaultSizeTest` 243 s, `A4ScreenSizeTest` 124 s, `KeyboardInViewTest` 108 s).
- A one-line Roles change runs all of design, 680 s vs 703 s whole suite (`App/docs/agents/test-scope-1/builder-report-app.md:263,269`), because `ScreenSizes.kt` imports the chrome, `app.session`/`app.shell` and an Accounts fixture (`test/design/ScreenSizes.kt:43-44,69,71-75`). With size tests picked it ran 146 s **in the one module**: T0's gain, not the modules'.
- **Compile ceiling:** 703 s wall vs about 554 s of tests on three forks leaves about 150 s for configuration and all compiles.
- The gate never builds Android or links iOS (`App/scripts/verify.sh:86`), and runs in fresh worktrees with `--no-build-cache` (`verify.md:94`).

**Strings** (Fable §2). One generated `Res` (`neoerp.composeapp.generated.resources`) is imported by 494 files (3,781 per-key imports, 258 wildcards). Prefixes do not match modules: `shell_` strings belong to audit, auth, dashboard and profile (the chrome uses `core_`); `strings_iam_company_access.xml` and `strings_platform_agreement.xml` belong to Company; about 40 uses cross areas. A rewrite by prefix is wrong.

**Wiring.** One Koin module (`src/app/di/NeoAppDi.kt:131`), allowed only in `app/di` and routing (`App/.claude/CLAUDE.md:66-70`; Accounts tabs and the sidebar still call it, `koin-baseline.txt:4-12,17-19`). `NeoDestination` is a core enum (`src/core/navigation/NeoDestination.kt:9`). Xcode runs `:composeApp:embedAndSignAppleFrameworkForXcode` (`project.pbxproj:155`). Build-type source sets choose prod/dev (`NeoBuildEnvironment.android.kt`, `ReleaseEnvironmentSourcePolicyTest.kt:27-31`). AGP 8.8.2, Kotlin 2.2.21, Compose MP 1.10.0.

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

- **Why areas:** they match `NeoModule`, the sold modules and the string files (per package: 21 modules, 31 pairs). Packages stay in a move.
- **`:core:auth` is folded into `:composeApp`:** all of its users stay in `:composeApp`.
- **`data/mock` is split by owner:** each area's mock data moves into that area. Whatever two areas still share after the split becomes `:shared:mock`. Either way, no feature imports `:composeApp`.
- **Release environment:** the choice stays in `:composeApp`, and the environment is passed into `:core:network`. The lane that touches it, the dev-session hooks or the source-policy tests gets the security reviewer.
- **Strings (Q8):** one `:core:resources` keeps every import unchanged (cost: a new key recompiles every iOS klib). HR and Payroll own their strings (own `Res` imported as `<Area>Res`), so from HR-1 there are several roots: the i18n scans, baselines, pseudo-locale generator and its release guard (`composeApp/build.gradle.kts:194-199`) handle them from M0-a, and the scope's fixed string path (`App/scripts/risk-check.sh:465`) is updated in M1, or every string change runs the whole suite. Other areas split only if M0's iOS numbers pay, by a key → module table, never by prefix.

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
- **Hot Reload:** M0-a edits a composable and a string in a library module while running, with `neoerp.env=localLive` still set (`composeApp/build.gradle.kts:297-306`).

### D4. Feature registry and feature sets (decided by Jabran)
| Part | Rule |
|---|---|
| Contract | `NeoFeature` in `:core:common`: `id`, `module: NeoModule`, menu entries, routes (`NeoDestination` → screen), home tiles, slot contributions. Each feature's entry object has `create(deps, <kit services>)`, which returns its `NeoFeature`. |
| Lifetime | A feature's graph is built **per signed-in session** (`create` after sign-in) and **dropped at sign-out and at company switch**; nothing in it is kept across companies (the bug class in `docs/backlog.md:437`). The registry tests prove both drops; this part gets the **security reviewer**. |
| Deps | `NeoFeatureDeps` (core): network runtime, session reader/emitter, shell emitter, environment. Kit services (`AuditServices`, `EntitlementServices`, defined in each kit) are built in `:composeApp` and passed as typed parameters to the feature's own entry (`HrFeature.create(deps, audit, entitlement)`); plain constructor wiring, no locator, no `get()`. |
| Typed slots | `NeoSlot<A>` keys declared in the kit or core that owns the host (e.g. `CompanyRecordSlots.People: NeoSlot<CompanyTabArgs>` with company and caller rights); a contribution is `(A) -> @Composable`, so a wrong argument is a compile error. |
| Inside a feature | One public entry object (e.g. `HrFeature`); its graph is built by constructors inside the feature, no Koin. For existing areas this means moving their wiring out of `NeoAppDi.kt` (813 lines) and `NeoSmartContentArea.kt` (639 lines) with their DI tests: **one lane per area** (A8–A11). |
| Root | Never names a feature's internals. Feature names only in a **generated** `NeoFeatureSet.kt` and the Gradle dependencies, both from `-Pneoerp.features=…` (default: all). Verify passes `-Pneoerp.features=<all>` itself, as it does for `neoerp.kmmNetworkPath` (`verify.sh:489`). Shared modules are always in. |
| Hosts | Menu, routing, home and slot hosts read the registry; an absent feature's slot or destination is hidden like an entitlement-off module. |
| Runtime default | One App for everyone, modules switched by the company's plan. Per-customer builds become possible, but all strings, destinations and permissions still ship (trimming those is later work). |
| Leak checks (Q11) | (1) a `:build-rules` text rule on **every** run: no root file outside the generated set names a registered feature's package; (2) a feature→feature leak is refused by the Gradle rule; (3) leave-one-out compile of `:composeApp` for **every feature before `main`**, and on phase ranges only when root sources or the registry contract changed (each is its own Gradle run). |

`NeoDestination` stays a core enum for now.

## Tests and build speed
- **`core/app-test-speed` (T0) goes first and owns the test gain**, with four changes for this ADR (Fable §3): size tests get their final package (`features.<area>…`) and run when their unit is in scope; the harness moves to a `testing` package with the company scope passed in (no `Kyst`), naming `AppShellState`/`AppSessionEmitter` as the links M3 cuts; the Accounts size tests are split by flow with time per flow (answers Q4). The baseline for this ADR is taken **after** T0, so modules are not credited with its gain.
- **The gate, from M0-b (decided by Jabran):**
  - (a) a scope unit maps to **every module that has test files in its package** (read from git paths), and the unit's floor is summed over them. Until M3, `features.hr` → `:feature:hr` **and** the HR size tests in `:composeApp`. Package units stay through phase B; the module graph replaces them once, at M8;
  - (b) **every scoped run also compiles the full-set `:composeApp`** for JVM and iOS (`compileKotlinJvm`, `compileKotlinIosSimulatorArm64`), so a broken registration or caller still fails the compile as today; with the cache this costs the changed module plus the root;
  - (c) a **local build cache shared by the worktrees on each Mac** (one folder per repo). **Only gate runs write it; builders (`--scoped-tests-only`) read only.** M0-b shows hits from a second worktree at another path, per task (JVM compile, iOS klib compile, resource generation); a task that is not relocatable is left out of the cache;
  - (d) **`Test` tasks are non-cacheable in the build itself**: the convention plugin marks every `Test` task never cacheable and never up to date; verify fails when a test task in scope reports FROM-CACHE or UP-TO-DATE (XML is counted as fresh by file time, `verify.sh:597`); one gate self-test proves it;
  - the **whole suite before `main` stays**, plus `:composeApp:assembleDebug`, `linkDebugFrameworkIosSimulatorArm64` and the leave-one-out runs.
- **Expected effect** (to measure, not promised): feature-range tests about 70–110 s (Access) come from T0; modules add skipped compiles from the cache inside the ~150 s ceiling and a faster Xcode loop; Accounts ranges stay near 90 % of today until per-flow picking or Q4.
- **Measure** (Fable §4): today's gate split into configuration / JVM / iOS / tests (`--profile`, fresh worktree, one-line roles and accounts changes); the same after T0 (baseline); the Xcode link (control `kotlin.incremental.native=true`); in M0 cache on/off, memory with two UI test modules, sync time, `assembleDebug`, Hot Reload; the three 475 s classes; gate self-tests (989 s).

## Migration plan
**Acceptance for every step (Q9):** whole suite green, `:composeApp:assembleDebug`, the iOS framework links, and the App starts on the iOS simulator, an Android emulator and desktop with one screen of the moved module in `en` and `nb` (a missing resource is a run-time crash, not a compile error; `Res.readBytes("files/…")` needs the same proof).

**Where steps land:** each step is one lane with one Opus review, and the review that touches the release environment gets the security reviewer. Steps land on the current App phase branch, and `phase/hrp-v2` merges it after every step.

| Step | Content | Size | After |
|---|---|---|---|
| T0 | `core/app-test-speed` with the four changes above; then the baseline measures | (queued) | — |
| **HR track** (decided by Jabran) | | | |
| M0-a | Build and resources spike: `build-logic`, `:core:testing`, one resources module; string, font and `files/` read on iOS, Android, desktop; Hot Reload; `-Pi18n.pseudo` and i18n scans over several roots; memory build service; graph file; the measures | M | T0 (Q12) |
| M0-b | Gate change (tier RISK, own review): unit → modules mapping with summed floors, full-set root compile, shared cache (gate writes, builders read), non-cacheable tests + FROM-CACHE check, `-Pneoerp.features=<all>` | M | M0-a; never in parallel with T0's gate change (Q12) |
| M0-c | Registry: contract (D4) incl. lifetime and typed slots; menu and route hosts read the registry beside today's hard-wired routing; `NeoFeatureSet` generation; leak text rule; security reviewer | M | M0-a |
| A-core | Single module: fix the back-references (`NeoAuthMessages`, `NeoFailureCause`, `NeoSearchSelectPreviews`, `getPlatform`); session contracts, `PkceAuthorizationRequest`, `NeoChangeReason` into core; **visibility on the core/designsystem borders** (~45 imports: 32 main, 13 tests, e.g. `AbstractStateMachine`, `NeoSkeletonBlock`, `readBodyUpTo`; the ~14 core/designsystem test files that import app or feature code stay in the root or are rewritten); **release-environment split** (`neoBuildEnvironment()` passed in from `:composeApp`, security reviewer); the module-rule test | M | M0-a |
| M1 | `:core:resources`, `:core:common`, `:core:network` (with `okHttpAuthMain`), `:build-rules`; string-path pattern in `risk-check.sh:465` | M | A-core, M0-b |
| M2 | `:designsystem`. No DS lane may be open during the move commit; DS-1b does not wait | S–M | M1 |
| HR-1 | `:feature:hr` created by HR's first App flow, registered through the registry. Its size tests stay in `:composeApp` under `features.hr` until M3 (reaching only HR's public names) | — | M2, M0-c |
| — | `:feature:payroll` the same way, when Payroll's first App flow starts | — | M2 |
| **Phase A, single module** (no quiet window; each lane useful on its own) | | | |
| A1–A7 | `:shared:audit` shape (drop `AuditWording.kt:11`'s Accounts use); `AppShellState` split; home tiles onto the registry; typed slots; Koin baseline cleared; mock data split; remaining visibility list; `OrganizationService` interface | S each | A-core, M0-c |
| A8–A11 | Each area's wiring out of `NeoAppDi.kt` and `NeoSmartContentArea.kt` into its entry object, with its DI tests (Access, Company, Platform, Accounts) | S–M each | A1–A7 |
| **Phase B, moves** (`git mv` plus a build file; the move commit kept separate) | | | |
| M3 | `:shell` and `:core:testing-ui`; HR's size tests move into `:feature:hr` | **L** (most likely to slip) | A1–A2 |
| M4 | `:shared:entitlement`, `:shared:person`, `:shared:audit` | S each | A1 |
| M5 | `:feature:access`, `:feature:company`, `:feature:platform`, one per lane | S–M each | M4, A4–A10 |
| M6 | `:feature:accounts`, in one quiet window; Q4 decided before | M | M3, M4, A5–A7, A11 |
| M8 | Scope by module graph; delete the ratchet; update ARCHITECTURE.md, AGENTS.md, CLAUDE.md rule 1 and the developer docs | S | M6 |

## Alternatives considered
| Option | For | Against | Verdict |
|---|---|---|---|
| Single module, test picking only (T0) | Most of the test gain | Rule stays text; no compile gain; no feature sets | First, not instead |
| Per-module strings now | Fewer iOS recompiles per key | About 500-file rewrite, misfiled files, about 40 crossing uses | Trial with HR/Payroll; the rest by numbers (Q8) |
| One module per package (21), or api/impl everywhere | Finest scope, compile avoidance | 31 pairs or about 2× modules; no ABI avoidance on Kotlin/Native | Rejected |
| HR in a package, moved later | HR waits for nothing | Rule stays text; a second move | Not taken (Jabran) |

## Risks
| Risk | Mitigation |
|---|---|
| Resources missing at run time | Start on three platforms in two languages at every step |
| Hidden coupling turns moves into refactors | Phase A and the module-rule test; a move only at zero |
| A feature leaks into the root | Generated feature set; text rule every run; leave-one-out before `main` |
| Feature graph outlives sign-out or company switch | Per-session lifetime, drop tests, security reviewer (D4) |
| Scoped gate weaker than today | Full-set root compile in every scoped run; non-cacheable tests |

## Consequences
The rule becomes a compile error. HR and Payroll start clean, any subset of features can be built, and the gate reuses unchanged modules. Costs: T0 plus about 20 lanes, `build-logic`, a registry, a graph file, verify/risk-check changes twice (M0 tasks and cache; M8 graph), one quiet window (Accounts), doc updates.

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
| Q11 | How to catch a feature leaking into the root? | Recommendation (Fable): text rule in `:build-rules` on every run; leave-one-out for every feature before `main`; on phase ranges only when root sources or the registry contract changed |
| Q12 | If T0 is not merged when HR is ready | Recommendation (Fable): M0 goes ahead; T0 and M0-b never change `verify.sh`/`risk-check.sh` in parallel (one merges first, the other rebases); T0's brief adds the configuration / JVM / iOS / tests split, or it runs as its own job |
| Q13 | Test results from the cache? | Recommendation (Fable): never; enforced in the build (non-cacheable `Test` tasks, FROM-CACHE check, self-test), not by a flag |
| Q14 | HR's wait | **Decided by Jabran:** HR does not wait. Built in `features.hr` inside `:composeApp` under the border test; moved to `:feature:hr` after M0–M2 as a plain move. The module steps run in parallel on the App side. |
