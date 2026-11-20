# DIM-A report: Accounts Dimensions maintenance screens

Worktree `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/ap-dim-a-app`, branch `ap-dim-a` (from origin/dev-app 808f8ec2). Three commits, not pushed.
All paths below are under `composeApp/src/` of that worktree.

## Built
- Data and domain (`commonMain/.../features/accounts/`):
  - `domain/model/DimensionModels.kt`, `domain/repository/DimensionsRepository.kt` with `listCostCentres`, `listProjects`, `listDefinitions`, `listValues(companyId, definitionId)` and the writes. DIM-B can use it as is.
  - `data/remote/DimensionsApi.kt`, `data/remote/dto/DimensionDtos.kt`, `data/mapper/DimensionsMapper.kt`, `data/repository/DimensionsRepositoryImpl.kt`, `data/mock/MockDimensionsRepository.kt` (Kystgruppe rig data).
  - DI in `app/di/NeoAppDi.kt`.
  - Shared edits: `AccountsError.kt` gained `AccountsErrorDetails.dimension`, and `AccountsA2Transport.refusal` fills it for `DIMENSION_*` codes.
- Navigation and access:
  - `AccountsTab.Dimensions` (after Used for), `NeoDestination.AccountsDimensions`, `NeoFeatureMap` (GENERAL_LEDGER), shell helpers, smart content area, `AccountsRoute` tab body.
  - `presentation/DimensionsAccess.kt`.
  - `AccountsFeatureGates.freeDimensions` plus the session reader. Feature off hides the company dimensions altogether (reads included, since the backend answers 403 on every definitions call). Rights come after that.
- Screens (`presentation/dimensions/`):
  - `AccountsDimensionsTab` (host and overview §4.1), `DimensionValuesPage` (cost centres §4.2 and projects §4.3: toolbar, status chips, tree with fold, expand/collapse all, no-result and empty states).
  - `DimensionValuePanel` (panel §4.2.1 and the deactivate, reactivate and delete reason gates).
  - `CompanyDimensionPage` (§4.4: set-up form, definition card, rename panel, deactivate and reactivate gates, values).
  - Plain Kotlin: `DimensionRules`, `DimensionsTabHolder`, `DimensionsState`, `DimensionWords`.
  - Strings in `commonMain/composeResources/values/strings_accounts_dimensions.xml` (English only).

## Deviations from the spec (the backend wins)
- Pattern: Accounts uses State, Holder (`@PresentationState`, like `TaxTabHolder`), `AccountsResult` and `call{}`, not the NeoResult/StateMachine/EventHandler/UseCase chain, so I followed Accounts. No use cases (Accounts has none except chart templates).
- Not built: §4.5 Department (no backend read), §4.6 Account rules, §4.7 line columns, branch defaults card, the Branch and Stock location overview rows, the overview rules line, the "Default for" and "Used on lines {count}" columns (backend gives only `used`: boolean), history and created-by, "Undo for 10 s" on delete, and the folding of the projects notice.
- Permissions: the backend has `COST_CENTER.*` for cost centres and a single `DIMENSIONS.READ/MANAGE` for projects and company dimensions. There is no `PROJECT.*` split, so an Accountant gets no project create unless they hold MANAGE.
- Delete is a reason gate (the server needs `{version, reason}`), not an Undo toast. Delete shows only for a value never used.
- Edit and create have no reason gate: the PUT and POST bodies take no reason. Only deactivate, reactivate and delete ask one.
- Only group-only (`isHeader`) nodes can be a parent (`DIMENSION_PARENT_INVALID NOT_HEADER`), so "Part of" lists only those. A used value can't become group only, and a group with children can't stop being one. Both are worded.
- Code read-only once `used`: stricter than the server, which allows a code change; this follows DM-4.
- Company dimension definition = slot, code, name only. Spec's "File column" is sent as `code`. "Values form a tree" and "Default value" don't exist, so they are omitted. A used dimension can't be renamed (server `DIMENSION_SLOT_USED`), so Rename is hidden once used and the card says why. Rename has no reason gate (the server takes no reason). A deactivated dimension keeps its slot.
- Before go-live: the backend allows writes on books CREATED, READY and LIVE, so I did not add the "Read-only until go-live" notice.
- Neovatus staff: read, never write.
- "Right missing" actions are hidden (spec §2: no buttons the server refuses), not disabled with a reason. Feature off hides, per the pattern.
- "Part of" uses `NeoSearchSelect` (Local source). Counts use the company grouping. Breadcrumb is a "‹ Dimensions" back button inside the tab (the page header's crumb is fixed per tab).
- Rig: `docs/design/screen-rig/accounts-dims.jsx` already exists. No rig change.

## Tests (targeted only)
- New, all green:
  - `commonTest/.../accounts/dimensions/` `DimensionRulesTest` (phases, filters, tree, parent options, form checks, slots), `DimensionsAccessTest` (rights, platform, feature gate), `DimensionsTabHolderTest` (22 flows on the mock: load, feature off, create, duplicate code, parent, cycle, deactivate/reactivate, delete, version conflict, uncertain write, projects, set-up, slot taken, used dimension, rename), `DimensionsApiTest` (paths, bodies, refusal details), `DimensionWordsTest`.
  - `jvmTest/.../presentation/DimensionWordsResourcesTest` (English defaults match the XML).
  - `jvmTest/.../design/DimensionsScreenshotTest` renders 31 states at 1440 and 390 to `build/design-shots/DimensionsScreenshotTest/`.
- Existing tests updated for the new tab: `AccountsAccessTest` and `ReportsAccessTest` (tab lists).
- Also green: `AccountsMenuGroupsTest`, `DestinationFeatureAccessTest`, `AccountsPageLifecycleTest`, `AccountsStringResourcesTest`, `Phase2AccountsRouteTest`, `AccountsCompanyLabelRouteTest`, `NeoAppDi*`, `ModuleAccessTest`, `JournalsAccessTest`, `AccountsFeatureGatesTest`, `AccountsTabHoldersTest`.
- `./gradlew :composeApp:compileKotlinJvm` is green. No full test run.

## Open questions
1. Does Jabran want edit-with-reason? It needs a backend `reason` on PUT/POST (the audit already records `changed[]`).
2. Branch defaults (DM-1) and Department (§4.5) need Org and HR endpoints before the overview can list Branch, Stock location and Department.
3. Merge: DIM-B's lookup should switch to `DimensionsRepository`. `AccountsTab`, `AccountsAccess` and `AccountsFeatureGates` are the shared files most likely to conflict.

## Fix round (Opus review)
Commit on `ap-dim-a`: "fix(accounts): dimensions review fixes …".
- M1: a 409 `VERSION_CONFLICT` re-reads, then bumps `formEpoch`; the panel keys its form on it, so the form shows the fresh record, Save stays disabled until an edit, and the panel says "Someone else changed this. The latest version is shown." Holder test covers the conflict and a re-save of the fresh record.
- M2: the backend keeps the stored `validFrom` when the PUT sends null (`input.validFrom ?: existing?.validFrom`), so no sentinel. Valid from can be changed but not emptied once set (hint plus form problem `FromRequired`). The mock already kept it and its date-order check now uses the stored date too. **Backend backlog item for the lead:** a PUT cannot clear `validFrom` (null means keep); decide whether clearing back to "from the start" should be supported.
- M3: the taken-code refusal on Set up and Rename now reads "The file column {x} is already used by {dimension}. Choose another." (holder looks the dimension up). Tests for both paths.
- M4: `deleteDefinition` added (API, repository, mock, holder). Delete on the definition card when it has no values, with a reason gate; it returns to the overview and the slot is free again. Refused with values (worded). Tests for both.
- Lows: refused deactivate/reactivate/delete error shows once (panel only when no gate is open); Delete hidden on a group with children; fold arrow is now `NeoIconButton` (touch floor and focus); `definitionsOff` is used (server says off wins over the session, so no Set up row that can only fail); "Part of" always lists the current parent; a line says when the parent list is capped at 500; L2 fixed (target captured at write start).
- Left as the lead said: cancel-during-write, stale-list flash, missing right stays hidden, M5 untouched. L9 (new value defaults to today) unchanged.
- Tests run: the dimensions test package, `DimensionsScreenshotTest`, `DimensionWordsResourcesTest`, `AccountsStringResourcesTest`, all green; `compileKotlinJvm` green.
