# DIM-A review (Opus, read-only): Accounts Dimensions maintenance screens

Branch `ap-dim-a` (worktree `NeoERP-worktrees/ap-dim-a-app`), 3 commits on `origin/dev-app`, diff of 38 files.
Reviewed against the backend as built (`accounts-a0.md` amendment SB2d "As built (SB2d-3)", `CostCentreController`,
`DimensionControllers`, `DimensionDtos`, `DimensionMaintenanceService`), spec AC-DIM (Draft), ux-principles §6, app
architecture and the lead rules. Nothing was compiled or run (Gradle was in use). All app paths are under
`composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/` unless shown otherwise.

**Verdict: approve with fixes.** No High findings. The contract mapping is correct: paths, field names, `version` on every
write, `{version, reason}` on deactivate/activate/DELETE, `isHeader`/`used`/`valueCount`, `?status`, the permission codes
(cost centres on `COST_CENTER.CREATE/UPDATE/DEACTIVATE` with delete on DEACTIVATE; projects and definitions on
`DIMENSIONS.MANAGE`), `FEATURE_NOT_ENABLED` only on `/dimension-definitions`, `companyId` taken from the session
(`context.companyId`), platform actor read-only. `AccountsJson` has `encodeDefaults = true` and writes nulls, so
`isHeader: false`, `parentId: null` and `validTo: null` reach the server on PUT as intended.

Counts: **High 0 · Medium 5 · Low 9.**

## High

None.

## Medium

**M1. After a version conflict, the next Save can quietly undo the other person's change.**
`presentation/dimensions/DimensionValuePanel.kt:142–149` (form state is kept with `remember(existing?.id)`) and
`DimensionsTabHolder.kt:154–158` plus `:278–281`.
On 409 `VERSION_CONFLICT` the holder reads the list again, so `existing` now has the new version and the other person's
values. The form fields still hold what this person saw before (they are kept by id only). `changed` is compared with
the new record, so Save is enabled. The PUT sends the whole record, so any field the other person changed (validTo,
parent, group only) goes back to the old value, with the new version and no warning.
Fix: on a conflict, reset the form to the refreshed record and show a line such as "Someone else changed it. Check the
values and save again." The simplest version is to key the field state on `existing?.version` as well as the id. That
also clears unsaved edits after the panel's own deactivate. To avoid that, reset on conflict only, for example with an
`epoch` the holder increments on `VERSION_CONFLICT`. Add a holder test: a conflict followed by a save must not send the
stale fields.

**M2. Clearing "Valid from" on an existing value looks saved but changes nothing.**
`DimensionValuePanel.kt:334` (`validFrom = from.trim().ifEmpty { null }`). Backend `checkValue` uses
`input.validFrom ?: existing?.validFrom`, so leaving it out keeps the stored date.
A person clears the date on a value valid from 2025-01-01. `changed` is true, Save is enabled, and the notice says
"… saved", but the server keeps 2025-01-01. The mock does the same (`MockDimensionsRepository.kt:110`), so the tests
can't catch it.
Fix: on edit, send `1900-01-01` (`DimensionRules.EARLIEST`) when the field is cleared. On create, keep `null` or today.

**M3. "Already used" refusals for a company dimension leave the code blank.**
`DimensionsTabHolder.kt:250` (`words.refusal(error, name)` with the default `code = ""`) and `:253`
(`fail(r, name, "", null)`).
A 409 `DUPLICATE_DIMENSION_CODE` on Set up or Rename reads " is already used in this list. Choose another code."
It has no file column in it, and it says "code" where the screen says "File column".
Fix: pass the file column as `code`, and use a dedicated sentence: "The file column {x} is already used by {dimension}.
Choose another." Look up the holder in `state.definitions`. Add a test for each path.

**M4. A company dimension set up by mistake uses up one of the four slots for good.**
`DimensionsApi.kt` / `DimensionsRepository.kt` (no `deleteDefinition`), `CompanyDimensionPage.kt:166–190`.
The backend has `DELETE /dimension-definitions/{id}` with `{version, reason}` while `valueCount == 0`. The app offers only
Deactivate, and a deactivated definition keeps its slot. So a wrongly named or test dimension blocks a slot permanently
(at most 4). Rename is also hidden once it is inactive.
Fix: add `deleteDefinition` to API, repository, mock and holder. Show **Delete** on the definition card when
`valueCount == 0` (reason gate, the same `DIMENSION_IN_USE details.values` wording that already exists). If the lead
decides against it, record the reason in the spec.

**M5. Projects: Accountants can't create, and the spec says they should. This needs a decision, not a code fix.**
`presentation/DimensionsAccess.kt:44–49`, spec §2 / §4.3.
The backend has one `DIMENSIONS.MANAGE` code for projects and company dimensions, with no `PROJECT.*` split. Spec §2
gives Accountants project create/update ("new projects start weekly") and keeps company dimensions with the FM and Owner.
As built, an Accountant either gets no project writes, or gets MANAGE and with it company-dimension set-up and
deactivation. The app follows the backend correctly. The gap is between the backend and the spec.
Fix: lead/Jabran decide. Either accept "projects = MANAGE" and update spec §2, or ask the backend for
`ACCOUNTS.PROJECT.CREATE/UPDATE/DEACTIVATE`. Track it in the backlog. It is not a blocker for DIM-A.

## Low

**L1. Cancel or close during a write cancels the coroutine but not the request.**
`DimensionsTabHolder.kt:132–140`, `:261–265`. `NeoReasonGateDialog`'s Cancel button and `NeoSidePanel.onDismiss` stay
active while `busy`.
The server may still commit the write. The list is not read again, so the shown version is stale and the next action gets
`VERSION_CONFLICT`. This is the same pattern as `TaxTabHolder`, `ChartTabHolder`, `CalendarTabHolder` and
`UsedForTabHolder`, so it is existing debt, not something new here.
Fix: don't cancel a running write. Either close the UI and let the job finish (it re-reads anyway), or call
`read(showLoading=false)` after cancelling. Better as one shared fix across the Accounts holders.

**L2. The result of a write can land in another page's list.**
`DimensionsTabHolder.kt:195`. `finishValue` takes `target` from the state at the end of the write, not the start.
Navigating during a slow write (`openPage` doesn't cancel) can upsert a cost centre into the projects list until the
follow-up `read()` replaces it. It corrects itself, but briefly shows a wrong row.
Fix: capture `target` in `perform` and pass it to `finishValue`.

**L3. "Part of" shows "None" when the current parent isn't a group-only node.**
`DimensionValuePanel.kt:153`, `:278`; `DimensionRules.kt:118`.
Cost centres from before V60 can have a `parent_id` with `is_header = false` (V60 defaulted every existing row to false).
`parentOptions` lists only headers, so `selected` is null and the field reads "None (top level)" while `parentId` still
holds the old parent. Saving keeps it, because the server only checks a changed parent, so the screen misstates the record.
Fix: always include the current parent in the options, even if it is not a header.

**L4. The parent list stops at `LOCAL_MAX` (500) without saying so.**
`DimensionValuePanel.kt:153`. This is fine at today's sizes. For the large-customer direction, switch to a remote or
paged source, or at least show "Type to narrow" past the cap.

**L5. `definitionsOff` is set but nothing reads it.**
`DimensionsState.kt:45`, `DimensionsTabHolder.kt:85–88`. The server's `FEATURE_NOT_ENABLED` hides the definitions only
because the list is empty. Either drop the field, or use it with `access.seesCompanyDimensions` so the "Set up" row
can't appear when the session says the feature is on and the server says it is off. Today a person with MANAGE sees
"Set up", and the create fails with "Company dimensions aren't in the company's agreement."

**L6. One refusal shows twice.**
`DimensionValuePanel.kt:318/320` and `:358/372/387`. A refused deactivate, reactivate or delete shows `state.error` in
the gate and again in the panel behind it. Show it in the panel only when `state.dialog == null`.

**L7. The fold chevron is hard to hit and invisible to the keyboard.**
`DimensionValuesPage.kt:263–270`. It is a 20 dp clickable `Icon` with no `Role.Button`, no focus and a hit area under
the touch floor (ux §24). Use an icon button component (or `Modifier.minimumInteractiveComponentSize()` +
`role = Role.Button`).

**L8. Delete shows for a group with values under it.**
`DimensionValuePanel.kt:225`. Delete is offered whenever `!used`, so a header with children is offered Delete and
then refused (`DIMENSION_IN_USE children`, worded correctly). The panel already counts `children`. Hide Delete when
`children > 0`, or keep it and say why beside it.

**L9. New values default to today as "Valid from" (spec §4.2.1), which can refuse backdated postings.**
`DimensionValuePanel.kt:145–147`. A cost centre created today can't be used on a journal dated earlier
(`DIMENSION_INVALID`), for example last month's accruals during close. This follows the Draft spec, but the backend
default is 1900-01-01. Worth a lead or spec check: empty by default ("from the start"), with today as an example in the
field.

Also noted, no change needed:
- `koinInject` in `AccountsDimensionsTab.kt:70` breaks `.claude/CLAUDE.md` ("Koin only in app/di and the routing
  boundary"). It is the same as every other Accounts setup tab (Chart, Tax codes, Used for, Calendar), so it is existing
  debt.
- Holder and State rather than a ViewModel/UseCase: consistent with the Accounts tab holders. No Compose in the holder.
  `@PresentationState` is used.
- `DimensionRules.DEFINITION_NAME_MAX = 40` is stricter than the server (120). This is spec-intended.

## Missing right: hide or disable? (asked by the lead)

**The builder is right to hide them in this area.**
- ux-principles §6: "View but no change permission: the same screen, read-only … with no actions and no buttons that the
  backend would refuse." Spec AC-DIM §2 says the same.
- The existing Accounts set-up tabs hide write actions without the right: Tax codes `AccountsTaxCodesTab.kt:128,155,184`
  (`writes.add`) and Chart `AccountsChartTab.kt:138,198` (`access.addAccount`). Dimensions sits among these.
- The Jabran 2026-11-04 decision is `docs/backlog.md:260` item (4): "'Refund…' on the customer sheet shows disabled with
  the reason when the person lacks the refund right". Reviewers have since applied it to similar transactional actions
  (Refunds received, `m5-payables-ux-review/report.md:73`). The phase-3 UX review line ("then right (disable with
  reason …)") was about ordering feature-off before rights for in-page actions. It doesn't turn every hidden write into a
  disabled one.
- The order is right: feature off hides the company dimensions altogether (`AccountsFeatureGates.kt:38–40`,
  `DimensionsAccess.seesCompanyDimensions`), then rights.

Optional: where a role commonly expects an action (Accountant on Projects, see M5), add one plain line under the card
head ("Only a Finance Manager or the Owner can add projects."), the HR-H1 pattern from ERP-148. Never a code. If Jabran
meant the 2026-11-04 rule to apply everywhere, the lead should say so and the Chart and Tax codes tabs change with this
one.

## Shared-file changes: regression risk

- `domain/model/AccountsError.kt`: adds `dimension: DimensionErrorDetails? = null`, defaulted and additive. **No risk.**
- `data/remote/AccountsA2Transport.kt:151`: fills `dimension` only when `code.startsWith("DIMENSION_")`. It also parses
  `DIMENSION_INVALID` from journal posting, but only into the new field, and existing journal code doesn't read it.
  **No risk.**
- `app/di/NeoAppDi.kt`: one new `single`, the same mock/live switch as its neighbours. **No risk.**
- `AccountsTab.Dimensions` / `NeoDestination.AccountsDimensions` and the `NeoShellHelpers`, `NeoSmartContentArea`,
  `NeoFeatureMap` and `AccountsRoute` entries: every exhaustive `when` is updated, and the order follows spec §3 (after
  Used for). `AccountsAccessTest` and `ReportsAccessTest` tab lists are updated. **Low risk**, and the merge conflict
  with DIM-B is the risk the builder flagged.
- `AccountsFeatureGates.kt` / `AccountsFeatureGatesFromSession.kt`: new `freeDimensions = true` default.
  `NeoFeatureAction.FreeDimensions` already exists. Feature unknown means shown, as the file's rule says. **No risk.**

## Tests

The tests are meaningful: 22 holder flows on the mock, API path and body checks including DELETE with a body and refusal
details, access including platform and feature gate, words versus XML, and screenshots at 1440 and 390. Gaps worth
adding with the fixes:
1. A conflict followed by a re-save (M1).
2. Clearing valid-from on edit (M2). The mock should keep the stored date like the server so the test fails today.
3. A duplicate file column on Set up and on Rename (M3).
4. Definition delete (M4), if built.
5. The mock's date-order check on edit uses `EARLIEST` instead of the stored `validFrom`
   (`MockDimensionsRepository.kt:226`). The server uses the stored one. Align it.

## Re-check (Opus, read-only, 2026-11-08)

Fix commit `9c98698d` on `ap-dim-a` (19 files), read against `DimensionControllers.kt`, `DimensionDtos.kt` and
`DimensionMaintenanceService.kt` in `NeoERP-BackEnd` (accounts-service). Nothing compiled or run; the builder reports
the dimensions tests, screenshot, words-resource tests and `compileKotlinJvm` green. App paths as above.

**Verdict: approve.** All four Mediums and the requested Lows are fixed correctly. One new Low (the same stale-form
pattern on Rename) and two nits; none blocks the merge.

| Item | Result | Where |
|---|---|---|
| M1 conflict reset | **Fixed** | `DimensionsTabHolder.kt:301–302` bumps `formEpoch` after the re-read; `DimensionValuePanel.kt:145–152` keys every field on `(id, formEpoch)`; `existing` comes from the refreshed list (`:110`), so `changed` is false and Save is off until an edit. A conflict from a gate also resets an open form, which is acceptable. Only a VERSION_CONFLICT bumps the epoch, so a panel's own deactivate keeps unsaved edits. Test `DimensionsTabHolderTest.kt:220–228` proves the epoch and a clean re-save at the holder level. The Compose reset itself is not under test (readable, low risk). |
| M2 valid from | **Fixed, and the lead's premise is accurate** | Backend `DimensionMaintenanceService.kt:406`: `input.validFrom ?: existing?.validFrom ?: DimensionValue.EARLIEST`, `DimensionValueRequest.validFrom: LocalDate? = null` (`:33`). A null on PUT keeps the stored date, and there is no way to clear it except sending an explicit date. App: `DimensionValuePanel.kt:160–161` (`fromRequired` when the stored date isn't 1900-01-01), hint `:298`, rule `DimensionRules.kt` `FromRequired`. A record stored at EARLIEST shows blank and a blank save keeps EARLIEST, which is consistent. `validFrom` is non-null `String` in the model, so `fromRequired` can't misfire on null. Mock now keeps and checks against the stored date (`MockDimensionsRepository.kt:102, 236–241`). Tests: `DimensionRulesTest` `aStoredValidFromCanBeChangedButNotEmptied`, holder `:380`. |
| M3 file column wording | **Fixed** | `DimensionsTabHolder.kt:265–268` (Rename now also keeps the form on DUPLICATE_CODE, and the holder is looked up excluding self); `DimensionWords.definitionRefusal`. Code `DUPLICATE_DIMENSION_CODE` matches the backend (`AccountsRefusal.kt:361`, `translate` on `uq_dimension_definitions_company_code`). Tests: holder `:392`, words test, resource test. |
| M4 delete definition | **Fixed** | Contract matches `DimensionDefinitionController` `:143–150`: `DELETE /api/accounts/dimension-definitions/{id}`, 204, body `DimensionStatusRequest{version, reason}`, feature `FREE_DIMENSIONS`, `DIMENSIONS_MANAGE`. App: `DimensionsApi.kt` `deleteDefinition` (body + path pinned in `DimensionsApiTest`), button inside the `manage` trailing only (`CompanyDimensionPage.kt:169, 181`), so it follows `canWriteCompanyDimensions` = feature on + MANAGE. Gate guard `:111`, reason gate `maxReason = 500` like the other gates. Server refusal `valueCount > 0` → `DIMENSION_IN_USE {values}` is worded by the existing `inUseValues`. Success removes the definition and its values, returns to the overview and re-reads (`DimensionsTabHolder.kt:231–245`). Version conflict and NOT_FOUND re-read; a vanished definition falls back to the Set up card, and the gate can't render without a definition. Tests: holder `:406`, `:421`. |
| M5 | Left for Jabran, as decided | — |
| L1 cancel during write | Left, as decided | — |
| L2 target at write start | **Fixed** | `DimensionsTabHolder.kt:148–170, 184–206` (`replaceValue` no longer takes a null target). |
| L3 current parent listed | **Fixed** | `DimensionRules.parentOptions(keep =)`, `DimensionValuePanel.kt` `allOptions` keyed on `parentId`; `DimensionRulesTest` `theCurrentParentStaysInTheListEvenWhenNotGroupOnly`. |
| L4 parent cap | **Fixed (line only)** | `DimensionValuePanel.kt:157, 293`. A remote source is still a later item for large customers. |
| L5 `definitionsOff` | **Fixed** | `AccountsDimensionsTab.kt:87`: the server's "off" turns the session access off, so no Set up row and no definition writes. |
| L6 refusal twice | **Fixed** | `DimensionValuePanel.kt:330–332`. |
| L7 fold chevron | **Fixed** | `DimensionValuesPage.kt:262` `NeoIconButton` (touch floor, focus, role, tooltip). Nit: the leaf-row spacer is a fixed 32 dp (`:270`); on a touch platform the button grows to `neoTouchFloor()`, so leaf and parent names don't line up there. Use the same width source, or ignore. |
| L8 delete on a group with values | **Fixed** | `DimensionValuePanel.kt:233` and the gate guard `:116`. |
| L9 today as default | Left, as decided | — |

**New issues**

- **N1 (Low). Rename keeps the stale form after a conflict, the M1 pattern.** `CompanyDimensionPage.kt:227–228`
  (`remember(d.id)`). After a 409 on Rename the definition is re-read, but name and file column keep what this person
  saw. If they changed only the name and someone else changed the file column, Save sends the old file column back with
  the new version. Rare (two people renaming one dimension at once) and both fields are visible. Fix: key on
  `state.formEpoch` too, one line each.
- **N2 (Low, mock only, existing).** `MockDimensionsRepository.kt:161, 177` treat a definition code as taken
  case-insensitively; the server's `uq_dimension_definitions_company_code` (V60) is case-sensitive and the service has no
  ignore-case check. So "vessel" vs "Vessel" is refused in the mock and accepted live. The M3 test (`:392`) relies on
  the mock; the wording path is still proved, and the holder's case-insensitive lookup is harmless. Either align the
  mock with the server, or ask the backend for a case-insensitive definition code (likely what people expect for a file
  column header).
- Nit: the delete gate's `noticeTitle` ("It is removed at once and its place is free again.") and `noticeBody` read the
  wrong way round. Optional.

No regressions found in the shared files. `VERSION_CONFLICT` now uses the dimensions sentence instead of the shared
Accounts one, and the words test is updated to match.
