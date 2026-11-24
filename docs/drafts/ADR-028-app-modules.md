# ADR-028: Split the App (`:composeApp`) into Gradle modules

## Status
**Draft** (ERP lead, 2026-11-24) for Jabran. He has set the direction ("onward we should split composeApp into modules"). This draft decides how. A Fable review follows. Kept in the workspace as a system-level decision, like ADR-027. Every App brief that adds a module or moves code links it.
Builds on ADR-011 (one App), ADR-027 (flow endpoints, a data layer per feature) and TEST-SCOPE-1 (D-47). Changes none of them.
Evidence: App `4e0ec8c7` (`phase/4`). `App/` = `NeoERP-App/`, `src/` = `App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`.

## Summary
About 14 Gradle modules, split by **product area**, not by package: `:core:*`, `:designsystem`, `:shell` (chrome), a few `:shared:*` kits, `:feature:<area>`, and `:composeApp`, which stays the composition root and keeps its name. Gradle refuses a feature→feature dependency. Where one feature shows another's screen, `:composeApp` composes it through slots. Domain types used by several features move to `:shared:*`. No api/impl split. Kotlin packages stay, so a move is `git mv` plus resource import lines. About ten steps, one module each, whole suite green. HR v2 starts life as a module, and Accounts moves last, in a quiet window.

## Context: what we measured
**One module.**
- `settings.gradle.kts:49` includes only `:composeApp`. KMM-Network comes in as an included build (`:14-16`).
- One build file defines Android, the static iOS framework `ComposeApp` (`composeApp/build.gradle.kts:60-68`) and the JVM desktop target (`:70-74`).
- Main code is 1,151 files. Features: 902 files and 205k lines, of which **Accounts is 575 files and 141k lines**. Organization 22k, designsystem 23k, core 7.3k lines.
- Tests: 463 commonTest files, 210 jvmTest files, 4,122 tests.

**The rule is text, not structure.** "Features never import from other features" (`App/.claude/CLAUDE.md:64`) is a per-pair ratchet (`FeatureImportRuleTest.kt:11-25`) with **31 pairs and 312 references** (`jvmTest/resources/buildrules/feature-imports-baseline.txt:2-36`; the backlog says 289 + 24 in 30 pairs, `docs/backlog.md:422`). Shared code leans on features too:
- `designsystem/components/NeoReasonGate.kt:21` imports the entitlement `NeoChangeReason`;
- features import `app.session` 35 times and `data.mock` 12 times;
- the shell menu imports Accounts and People types (`ui/shell/navigation/NeoMenuModel.kt:15-16`, `NeoSmartSidebar.kt:40`).

**The references, by kind** (counted per pair, by type):
| Kind | Pairs (refs) | Example |
|---|---|---|
| Inside one product area | org→agreement 36, org→companyaccess 4, agreement→org 2, people→iam 10, roles→iam 3, security→iam 6 (**61**) | the company record's Agreement tab |
| Shared domain type | accounts, agreement, org (64), people, roles, iam, security →entitlement (**90**) | `NeoChangeReason` 18×, `NeoCompanyEntitlements` |
| Session/auth | context, ess, payroll, profile →auth (**7**) | `PkceAuthorizationRequest` |
| Home page | dashboard→agreement/org/platform (**20**) | `AgreementRepository` |
| Screen in another area's screen | org→people 30 / roles 15 / audit 13 / security 6; platform→people 40 / audit 17 / security 8 / org 2; 3 singles (**134**) | `PeopleViewModel` in the company record; `PersonStatusPill` in Platform staff |

**The scoped gate cannot scope the expensive part.**
- `design` is "about 95 % of the suite's test time" (`App/docs/operations/verify.md:213`).
- A range that touches `ScreenSizes.kt` runs all of design (`:219-221`). `ScreenSizes.kt` imports the shell chrome (`jvmTest/…/design/ScreenSizes.kt:71-75`), `app.session` and `app.shell` (`:43-44`) and an Accounts fixture (`:69`).
- So a one-line Roles change ran **680 s against 703 s** for the whole suite (`App/docs/agents/test-scope-1/builder-report-app.md:263,269`). The same range with 12 design classes picked ran 146 s (`:201`).
- The package graph is dense, so the scope follows importers only one step (`verify.md:181-187`).
- Every run compiles all 1,151 files for iOS (`App/scripts/verify.sh:86`).
- 43 of the 61 design test classes import Accounts.

**Resources and wiring.**
- **Strings:** the files are already per area: `strings_<area>_*.xml` (accounts 52, core 15, org 11, iam 9, platform 8, shell 4) in en/nb/sv/da, plus stubs in fi and is.
- **One `Res`:** a single generated `Res` (`neoerp.composeapp.generated.resources`, used in 441 main files). `core_` keys are used in 197 Accounts files and in every other feature.
- **DI:** Koin is one module, `neoErpModule` (`src/app/di/NeoAppDi.kt:131`, 813 lines). It is allowed only in `app/di` and the routing boundary (`App/.claude/CLAUDE.md:66-70`).
- **Navigation:** the `NeoDestination` enum sits in `src/core/navigation/NeoDestination.kt:9`. `ui/shell/routing/NeoSmartContentArea.kt` routes to every feature (Decompose).
- **iOS host:** Xcode runs `:composeApp:embedAndSignAppleFrameworkForXcode` (`App/iosApp/iosApp.xcodeproj/project.pbxproj:155`).
- **Versions:** AGP 8.8.2, Kotlin 2.2.21, Compose MP 1.10.0 (`gradle/libs.versions.toml:2,13,15`). `androidLibrary` is already declared at the root (`App/build.gradle.kts:5`).
- **Caches:** the gate runs `--no-build-cache` (`verify.md:94`).

## Decision

### D1. Modules by product area; `:composeApp` stays the root
| Module | Holds (from `src/`) | Kind |
|---|---|---|
| `:core:common` | core model, result, text, time, money, format, permissions, presentation, navigation, i18n; session **contracts** (`AppSessionReader/Emitter`, `signOutOnSessionExpiry`, from `app/session`); `strings_core_*` | KMP + Compose resources, public Res |
| `:core:network` | `core/network`, KMM-Network API | KMP |
| `:core:auth` | `features/auth` domain and data (PKCE, auth repository) | KMP |
| `:core:testing` / `:core:testing-ui` | commonTest fakes (`NeoTestText`, `testSession`) / `ScreenSizes`, `FitShots`, `LayoutChecks`, `DesignShots` | KMP test-only / JVM test-only |
| `:designsystem` | `designsystem/`, fonts, drawables | KMP + Compose, public Res |
| `:shell` | chrome only: sidebar, rail, top bar, menu mode, `shell_` strings; no routing | KMP + Compose |
| `:shared:entitlement`, `:shared:person` | entitlement domain and display pieces; person pieces used by Access and Platform | KMP + Compose |
| `:feature:accounts` | `features/accounts`, `accounts_` strings | KMP + Compose |
| `:feature:company` | organization, agreement, companyaccess; `org_` | KMP + Compose |
| `:feature:access` | people, roles, security, iam; `iam_` | KMP + Compose |
| `:feature:platform`, `:feature:audit` | platform; audit (composed by others through slots) | KMP + Compose |
| `:feature:hr` | HR v2; Payroll/ESS v2 inside it or as siblings by the same rules | KMP + Compose |
| `:composeApp` | `App.kt`, `app/` (runtime, session machine, DI, Decompose root), routing, home/dashboard, profile, context, `data/mock`, the v1 modules (old hr, payroll, ess, inbox, reports) until v2 replaces them; Android app, iOS framework, desktop, Hot Reload | as today |
| `:build-rules` | the tree scans: `buildrules.*`, i18n scans, the always-run source policies | JVM, tests only |

- **Why areas:** they match `NeoModule` (`core/model/NeoPermission.kt:6-20`), the sold modules and the string prefixes. 61 references become internal to a module. One module per package would mean 21 modules and 31 pairs to break.
- **Packages stay.** A move is `git mv` plus Res import lines, so rename detection carries open branches.
- **`:composeApp` keeps its name.** The Xcode script, `verify.sh`, Hot Reload and the dev bundle stay as they are.
- **v1 modules** are not moved. They are deleted when v2 replaces them.

### D2. Dependency rules, enforced by Gradle
| Module | May depend on |
|---|---|
| `:core:common` | libraries only |
| `:core:network`, `:core:auth` | `:core:common` (auth also network) |
| `:designsystem` | `:core:common` |
| `:shell` | `:core:*`, `:designsystem` |
| `:shared:<x>` | `:core:*`, `:designsystem`; never `:shared` or `:feature` |
| `:feature:<x>` | `:core:*`, `:designsystem`, `:shared:*`; **never `:feature:*` or `:shell`** |
| `:core:testing(-ui)` | `:core:*`, `:designsystem`, `:shell`; test source sets only |
| `:composeApp` | everything |

- **Enforcement:** convention plugins `neoerp.kmp.library`, `neoerp.kmp.compose` and `neoerp.feature` live in an included `App/build-logic/`, not `buildSrc`, so a change there does not invalidate every module.
  - `neoerp.feature` fails configuration on a `ProjectDependency` to `:feature:*` or `:shell`.
  - `checkModuleGraph` writes `App/docs/operations/module-graph.txt`, and a `:build-rules` test fails when the committed file is stale.
  - Gradle refuses cycles.
- **The ratchet** keeps scanning every module's `src` while features sit in `:composeApp`. A feature still inside `:composeApp` could otherwise use an extracted feature unseen. It is deleted when no feature package is left in `:composeApp` except the composition ones.
- **How each kind of pair is resolved:**
  - **in-area:** it becomes internal (61);
  - **shared type:** it moves to `:shared:entitlement`, and `NeoChangeReason` goes to `:core:common` because the designsystem uses it (90);
  - **auth:** it goes to `:core:auth` (7);
  - **home:** it stays in `:composeApp` and later reads ADR-027's `/api/app/home` (20);
  - **a screen in another area's screen:** the host takes slots, e.g. `CompanyRecord(peopleTab: @Composable (CompanyId) -> Unit, rolesTab: …, activityTab: …)`, filled in `:composeApp/composition/`, and the guest's ViewModel comes from DI. Shared display pieces go to `:shared:person` (134).
- **api/impl:** none now. A feature's only dependent is the small `:composeApp`, so an ABI change is cheap. A `:feature:<x>:api` needs a written reason: another feature needs behaviour, not a type or a screen. No `explicitApi` (141k lines of churn).

### D3. KMP specifics
- **Targets:** every module has `androidTarget`, `iosArm64`, `iosSimulatorArm64` and `jvm`, from the conventions. Android library modules use `com.android.library` (namespace `com.neovatus.neoerp.app.<area>`). The KMP android-library plugin waits for an AGP upgrade.
- **iOS:**
  - one static framework, `ComposeApp`, from `:composeApp`, with **no `export()`**, so headers and framework size do not grow;
  - each module compiles its own klib, and they link once.
- **Compose resources:**
  - each module has its own `composeResources/values{,-nb,-sv,-da,-fi,-is}/strings_<area>_*.xml` and `packageOfResClass = "com.neovatus.neoerp.app.<area>.resources"`;
  - `:core:common` and `:designsystem` set `publicResClass = true`;
  - files using `core_` keys import `…core.common.resources.Res as CoreRes`. The rule is the key prefix, so a script does it;
  - `NeoUiText`/`StringResource` already cross modules;
  - the pseudo-locale (`composeApp/build.gradle.kts:179-205`) moves into `neoerp.kmp.compose`;
  - the i18n baselines get one file per module.
- **DI:** Koin stays only in `:composeApp` `app/di`. `KoinBoundaryTest` is unchanged. Features stay Koin-free, with constructor parameters. `NeoAppDi.kt` splits into one file per area.
- **Navigation:**
  - `NeoDestination` stays in `:core:common`;
  - a feature opens another area's page only through `AppShellEmitter` plus a destination and its arguments;
  - routing stays in `:composeApp`;
  - the menu's Accounts and People imports become a `NeoMenuContribution` interface in `:shell`, filled by `:composeApp`.
- **KMM-Network:** only `:core:network` and the platform source sets of `:composeApp` declare `dev.kmmkit:*`. The included build substitutes them for every module, and verify's `kmm_network=` record is unchanged.
- **ADR-027 fixtures** move into the owning feature's `jvmTest/resources`. The hash check (ADR-027 Q6) reads the new paths.

## Tests and build speed
- **Per-module tasks:**
  - `jvmTest`, the iOS compile and Android unit tests run per module;
  - size tests live in the feature's own `jvmTest` on `:core:testing-ui`;
  - M3 ends `design=*`: `ScreenSizes` no longer reaches a feature or `app.*`, and the `Kyst` fixture goes to Accounts.
- **What Gradle skips:** tests and compiles of unchanged modules (up to date in the gate's own Gradle home) and their iOS klibs. With compile avoidance, a feature change that keeps the ABI does not recompile `:composeApp`. Dev machines also use the build cache.
- **Scoped gate:**
  - the module comes from the changed path's folder, plus the **transitive** reverse dependencies from the committed `module-graph.txt`. It still reads git objects only;
  - the closure stays small because features never depend on features, so the one-step limit goes away between modules;
  - `:core:*`, `:designsystem`, `:shell`, `build-logic`, settings and gate files stay FULL;
  - inside an affected module, today's package units and design picking stay as an option (useful for Accounts);
  - `:build-rules` runs on every range;
  - `verify.sh` runs `:<m>:jvmTest :<m>:compileKotlinIosSimulatorArm64` per affected module.
- **Estimate (reasoned, not measured):**
  - **Access, Company, Platform or HR change:** about 680 s today. Expected 120–200 s (module tests, its few design classes, `:composeApp`, build rules; anchored on the 146 s Roles run);
  - **Accounts change:** about 75–85 % of today's time, because it owns 43 of 61 design classes. The gain comes from compile, iOS klibs and design picking inside the module;
  - **iOS compile:** the largest compile gain;
  - **`:core`, `:designsystem`, `:shell`:** no gain;
  - **cost:** about 14 projects to configure (configuration cache covers it), still one link.
- **Measure before M0 and after each step**, on the same quiet Mac:
  1. per-class time from the last whole-suite JUnit XML, summed per target module. This is the predicted scoped time per module, available now at no cost;
  2. `--profile` of a clean build and of one-line changes in roles and accounts: JVM compile, iOS compile, configuration;
  3. iOS link time and framework size;
  4. `assembleDebug`;
  5. Hot Reload restart.

  The numbers go in the lane report and the workflow v2 measures file.

## Migration plan
Each step is one lane and one module (or a small set), whole suite green, one Opus review. The `git mv` commit is separate from the fix commit (build file, imports).
| Step | Content | Size | After |
|---|---|---|---|
| M0 | Spike: `build-logic`; `:core:testing` and one tiny resources module; prove Android, iOS from Xcode **showing a string and a font from a library module**, desktop and Hot Reload, `-Pi18n.pseudo`, `verify.sh`, multi-root scans, graph file; baseline measures | S–M | — |
| M0b | Still single module: `core_` → `CoreRes` rewrite (script, about 300 files); session contracts → `core/session`; `NeoChangeReason` → `core` | M, mechanical | quiet half-day |
| M1 | `:core:common`, `:core:network`, `:core:auth`, `:build-rules` | M | M0b |
| M2 | `:designsystem`, after DS-1a merges and before DS-1b, so DS-1b/c are built in the module | S–M | M1 |
| M3 | `:shell` chrome + `NeoMenuContribution`; `:core:testing-ui` | M | M2 |
| M4 | `:shared:entitlement`, `:shared:person` | S each | M1 |
| M5 | `:feature:hr`, created by HR v2's first App lane | — | M1–M3 |
| M6 | Slot refactors, then `:feature:audit`, `:access`, `:company`, `:platform`, one per lane; ratchet lines deleted at 0 | S–M each | M4 |
| M7 | `:feature:accounts` in a quiet window (no open Accounts lane): `git mv` about 575 main + about 350 test files + strings, Res rewrite | M, mechanical | M3, M4 |
| M8 | Delete the ratchet; scope by module only; update ARCHITECTURE.md, AGENTS.md, `.claude/CLAUDE.md` rule 1, developer docs | S | M7 |

- **No feature stop.** Only the lane that owns the moving area waits: it merges before the move or rebases right after.
- **Files added under the old path** are moved by re-running the move's own script, `scripts/move-module.sh <area>`.
- **New code before its module exists** goes in its area package with no cross-area imports.

## Alternatives considered
| Option | For | Against | Verdict |
|---|---|---|---|
| Single module, split tests only (narrow the `ScreenSizes` rule) | No moves | Compile stays whole; rule stays text; dense graph | Fallback only if M3 slips past two weeks |
| Package rules only (ratchet, Konsist) | Cheap, exists | Enforces, never speeds up | Kept only during migration |
| One module per package (21) | Finest scope | 31 pairs to break, more config and link work, small gain | Rejected |
| api/impl everywhere | Best compile avoidance | About 2× modules and boilerplate; the only dependent is small | On request with a reason |
| JVM-only domain modules | Fast compile | iOS needs the code | KMP everywhere; Compose only where UI or resources exist |
| Split Accounts now (journals, AP, AR, reports, SIE, setup) | Most test gain | Big refactor during Phase 4 | Later, with M7 numbers (Q4) |

## Risks
| Risk | Mitigation |
|---|---|
| iOS link time, framework size | No `export()`; M0 measures link and size |
| Library-module resources missing at run time (iOS bundle, Android assets) | M0 shows a string and a font on all three platforms first |
| Two `Res` in one file | `core_` → `CoreRes` done in the single module (M0b) |
| Previews, Hot Reload across modules | `uiTooling` in `neoerp.kmp.compose`; both checked in M0 |
| Circular or forbidden dependencies | Gradle cycle check, `neoerp.feature`, graph file test |
| Conflicts with running lanes | Separate move commit, packages unchanged, one module per step, quiet windows for M0b and M7 |
| Scans and scripts hard-code `composeApp/src` (`BuildRules.appPath`, `risk-check.sh:209,255,268`, test inputs `composeApp/build.gradle.kts:163-171`) | Moved to `:build-rules` with all module roots in M1; gate self-tests updated in the same lane |
| More parallel Gradle work on a 16 GB Mac | One job per repo as today; cap `org.gradle.workers.max` if M0 shows swap |
| KMM-Network included build | Two declaring modules; verify record unchanged; M0 runs with and without it |

## Consequences
"Features never import features" becomes a compile error. Feature ranges run their own tests. HR v2 starts clean. Accounts-heavy ranges gain less until Accounts is split. Costs: about ten lanes, `build-logic`, a graph file, verify and risk-check changes, two quiet windows, doc updates.

## Open questions (lead's recommendation)
| # | Question | Recommendation |
|---|---|---|
| Q1 | Modules per product area or per package? | Per area: `NeoModule`, string prefixes, sold modules; 61 refs become internal |
| Q2 | Cross-area screens: slots in `:composeApp` or `:feature:<x>:api`? | Slots + `:shared:*` kits; api only with a reason |
| Q3 | Keep `:composeApp` as the root's path, or rename `:app`? | Keep; a rename later is one lane |
| Q4 | Split Accounts into sub-modules? | Not now; decide with M7 numbers |
| Q5 | Move the v1 modules (old hr, payroll, ess, inbox, reports)? | No; they stay until v2 replaces them |
| Q6 | Build cache for compile tasks in the gate (tests always rerun)? | Not now; decide after M3 with numbers |
| Q7 | When? | M0–M3 before HR v2's first App lane; M0b and M7 in announced quiet windows |
