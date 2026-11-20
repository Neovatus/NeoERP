# DIM-B independent review (Opus)

Scope: `NeoERP-App` `808f8ec2..9098c194` on `dev-app` (6 commits, 86 files). This was a read-only review: no Gradle run and no edits. Paths below are relative to `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/` unless they say otherwise.

Checked against:
- backend docs: accounts-a1 SB2d, accounts-b/c SB2d amendments, accounts-a0 value lists;
- backend code: `WireDimensions`, `DraftDimensionCheck`, `DimensionsJson`, `ReportFilterParams`/`ValueFilter`, `DimensionControllers`, `CostCentreController`, `ArDocumentRules`;
- shared `DimensionSetV1`;
- spec `accounts-dimensions.md` §4.7–§9 and ux-principles §21–24;
- DIM-A branch `ap-dim-a` (88282349).

## Builder claims, checked

| Claim | Verdict |
|---|---|
| A request line with no `dimensions` is the same as an all-null set | **True.** `WireDimensions.tuple(null) = DimensionTuple.NONE`, and `ArDocumentRules` reads `l.dimensions?.…`. So `toBody(empty)=null` clears the line exactly as an all-null set would, and a line cleared on purpose is saved as cleared. |
| The bill editor dropped every bill line's cost centre on save | **True.** At 808f8ec2, `BillLineState` had no cost centre, and `BillLineDraft.costCentreId` was never set. The server turns the missing `dimensions` into `NONE`, so the cost centre was wiped on every PUT. Fixed now: the flat cost centre is folded into the set on load (`BillEditor.kt:252`). |
| Journals: the flat tags overlay the held set, so the app cannot cause `DIMENSION_CONFLICT` | **True.** `JournalsMapper.kt:230-239`. |
| Document lines null the branch; advance lines null branch and stock location; adjustments keep their branch | **True.** Matches `WireDimensions.documentLines` and `refuseUnsupported(stockLocationAllowed=false)` for advance lines (re-check L-a). |
| Deduction lines never send `dimensions` | **True.** Correct: the backend refuses them, and they copy the advance line's set. |
| `departmentId` is always sent null | Fine: the backend refuses it everywhere. **`itemId` always null is not fine on document lines** (see L1). |
| Report params `projectId` and `free1Id`..`free4Id`, with `untagged` | **True.** Matches `ReportFilterParams` and `ValueFilter.UNTAGGED` (matched case-insensitively). The export body leaves nulls out, so the hash of an old request is unchanged. |
| `AccountsResult` rather than `NeoResult` | ARCHITECTURE.md and `.claude/CLAUDE.md` say `NeoResult`, but every Accounts repository (249 signatures) returns `AccountsResult`. Consistent with the module, so acceptable. |
| "Values with no picker are shown as a read-only caption" | **True on the document, receipt and payment cards. False on the journal editor** (see L3). |
| "With the feature off, free values are sent back unchanged" | It does send them back, but the server answers **403** (see M1). |

## High

**H1. The credit-note and debit-note on-account editors wipe stored line dimensions on every draft save.**
- Where:
  - `presentation/receivables/CreditNoteEditor.kt:148` (load) and `:321` (save);
  - `presentation/payables/DebitNoteEditor.kt:147` and `:337`;
  - `OnAccountLineDraft` / `OnAccountDebitLineDraft` (`SalesDocumentModels.kt:239`, `PayablesModels.kt:691`).
- Problem: the backend reads `dimensions` on on-account credit-note and debit-note lines (accounts-b/c SB2d-4). A line sent without them resolves to `NONE`. These editors load `cn.lines`, whose domain lines now carry `dimensions` and `dimensionNames` (this slice's mapper), and drop them. The line state has no field for them. The PUT is a full replace, so the cost centre, stock location, project and free values are wiped.
- This is not a regression. It behaved the same before DIM-B. Today it only bites drafts written by another client (API or import), because the app cannot set dimensions on these lines. It is still a silent data loss on a money document, and the contract now names these lines.
- Lines against an invoice or bill are safe: they copy the source line on the server.
- Fix: carry `dimensions` in `OnAccountLineState` / `OnAccountDebitLineState` and the two drafts, then send `toBody(d.copy(branchId = null))`. The minimum, until there are pickers, is to round-trip only. Add a round-trip test for each editor.

## Medium

**M1. With FREE_DIMENSIONS off, any draft holding a free value cannot be saved, and the person cannot see why or remove it.**
- Where:
  - `presentation/AccountsFeatureGates.kt:37`;
  - `presentation/dimensions/DimensionCatalog.kt:73`;
  - the editors' save paths.
- Problem: `DraftDimensionCheck.requireFreeDimensions` refuses any line with a free value with 403 `FEATURE_NOT_ENABLED` while the feature is off, whether or not the value changed. The app round-trips the value, which is correct for data safety, so every save of that draft is refused.
- In the document, receipt and payment editors the value shows only as a caption, with no Remove. In the journal editor it is not shown at all (L3).
- Fix, which needs a decision:
  - (a) Offer "Remove" on the read-only caption for free values while the feature is off, and word the 403 on save: "Company dimensions are off for this company. Remove {Sales channel: SHOP} from line 3 to save."
  - or (b) ask the backend to accept unchanged stored free values. Recommend (a) now and raise (b) with the backend lead.

**M2. A held value that is not in the active list shows as an empty cell.**
- Where: `presentation/dimensions/LineDimensionPickers.kt:57` and `presentation/journals/editor/JournalLineGrid.kt:525`.
- Problem: `selected = options.firstOrNull { it.id == … }`. For a held project or free value that is inactive, a group-only node, or a value deleted elsewhere, the cell shows "None" while the value is still sent. `LineDimensionRules.hidden` does not cover it either, because the column is shown. The person reads the line as untagged. Posting then refuses with `DIMENSION_INVALID`, or saving keeps something they never saw.
- Fix: when the held id is not in the options, show it as the selection with the server's `dimensionNames` text plus "Inactive" (or "Group only"), so picking "None" is a visible, deliberate change.

**M3. Advance-line and adjustment pickers are offered with `allowed = null`, so on the shipped packs every advance-line pick is refused at save.**
- Where:
  - `presentation/receivables/ReceiptEditorScreen.kt:260` and `:340`;
  - `presentation/payables/PaymentEditorScreen.kt:219` and `:331`.
- Problem: the backend checks advance lines at draft save against the account `CUSTOMER_ADVANCES` / `SUPPLIER_ADVANCES` maps to. The docs say the shipped packs' advances accounts allow only `branch`. So, with standard charts, any cost centre, project or free value picked on an advance line comes back as 422 `DIMENSION_NOT_ALLOWED`. The app offers a control that cannot work.
- Adjustments are checked at posting against the kind's account. The receipt and payment response carry `adjustments[].account`, so its `allowedDimensions` can be looked up.
- Fix:
  - advance lines: resolve the advances role's account through `AccountsSetupRepository.roleMappings` and the chart, and pass its `allowedDimensions`; or hide the advance pickers until the backend returns `allowedDimensions` on the receipt or payment (the builder's open question 2);
  - adjustments: look up the account the response names.

**M4. Report filters cannot use inactive values, and a saved or shared filter on one is dropped without notice.**
- Where:
  - `presentation/reports/parts/ReportBooks.kt:64` (`known`);
  - `presentation/dimensions/DimensionCatalog.kt:102-114` (active only);
  - `data/remote/DimensionsApi.kt` (`status=ACTIVE`).
- Problem: reports run over past periods, and closed projects are exactly what people filter on. The catalog loads ACTIVE values only. `known()` then strips any other id from a route or saved filter, so the report silently shows unfiltered (or less filtered) figures.
- Fix: for report filters, load both statuses (status absent means both), mark inactive values "Inactive", and keep them in `known()`. Show a notice when a value from the route can't be read.

**M5. Refusal words are wrong for project and free values, now that the app sends them.**
- Where: `presentation/AccountsWording.kt:427-436`; `JournalLineProblem` (`domain/model/JournalModels.kt:430`) and `JournalsMapper.kt:257`.
- Problem: draft save now returns `DIMENSION_INVALID` with `problem: PROJECT_INVALID` / `FREE<n>_INVALID` and `reason: UNKNOWN` / `WRONG_SLOT`. `JournalLineProblem` keeps no `dimension` or `reason`. The `"UNKNOWN", "WRONG_SLOT"` branch matches on `problem`, so it never fires. Every project or free refusal falls through to "Line n: check its branch, stock location and cost centre."
- `DIMENSION_NOT_ALLOWED` for a project or free value gives "doesn't take that tag", not spec §9's "isn't tagged by {project}".
- Fix: map `dimension` and `reason` into `JournalLineProblem`, and word them with the column heading (the company's slot name) as spec §9 does. Check the receipt and payment refusal wording for `field: advanceLines` the same way.

## Low

**L1. Document lines wipe `itemId`.**
- Where: `data/mapper/DimensionPickerMapper.kt:31`.
- `toDto` always sends `itemId = null`. The backend accepts `itemId` on document lines (stored on the line's own `item_id`) and returns it in `dimensions`. So an AR/AP line holding an item loses it on save. Latent: nothing in the app sets an item yet.
- Fix: keep `itemId` for document lines and null it only for journal, adjustment and advance lines.

**L2. The catalog loader calls `/dimension-definitions` while the feature is off.**
- Where: `presentation/dimensions/DimensionCatalog.kt:105-106`.
- The backend gates the definitions reads on FREE_DIMENSIONS too (`DimensionControllers.kt:100,105`; DIM-A also documents this). So the call is a 403 on every editor open, and read-only headings fall back to "Company dimension N". The comment there is wrong.
- Fix: skip the call when the feature is off. Headings can come from `dimensionNames` alone, or show "Company dimension" without a number.

**L3. The journal editor shows nothing for held values that have no column.**
- When: no right to read the list, the feature is off, the list is empty, or no line's account takes the column.
- The values are sent, but they are invisible, which contradicts the report and spec §4.7. (The journal detail does show them.)
- Fix: a read-only caption under the line in the grid and on the card, the same as the document editors.

**L4. Spec §4.7 gaps (disclosed by the builder; listed so they are tracked):**
- the account change clears values without the 3-second "Cleared: not used on {account}" hint;
- validity dates on the line date are not filtered;
- group nodes are hidden rather than greyed;
- no recents;
- no header "Line defaults";
- no Columns menu;
- the phone line card stacks up to five extra fields with no "More dimensions" fold.

**L5. Each editor waits on two plus N dimension reads before it loads.**
- Where: `InvoiceEditor.kt:154`, `BillEditor.kt:219`, `ReceiptEditor`/`PaymentEditor` init, and `JournalsPageHolder`.
- Every editor open makes 2+N serial GETs (cost centres, projects, definitions, values per definition) before the draft loads. There is no cache, and cost centres are fetched twice in journals.
- Fix: load in parallel, cache per company in the page holder, and let the draft load first.

**L6. Naive plural in the filter's "All" option.**
- Where: `presentation/reports/ReportsWording.kt:20`.
- `allOf(name) = "All ${name.lowercase()}s"` produces "All countrys" and the like for company-named slots. Use "All" alone, or "Any {name}".

**L7. A feature or right change mid-session rebuilds the journals holder.**
- Where: `presentation/AccountsRoute.kt` (`remember(… dimensionSource)`).
- The journals and reports holders are keyed on `dimensionSource`, which is rebuilt when `access.dimensions` changes. That drops an open journal editor's state.
- Fix: key the holders on the company and the repository, and pass the flags as state.

**L8. The P&L with a project or free filter leaves out the untagged lines without a note.**
- Where: `ProfitLossState.kt:261`.
- The note only fires for a branch or cost-centre filter, so the result shows without saying that untagged lines are excluded. Disclosed by the builder; worth a follow-up.

**L9. Style.**
- Fully qualified names inline in `AccountsRoute`, the access code, the page holder and the DTO annotations.
- `modifier` is applied to both the caption and the picker row in `LineDimensionPickers`.
- `NeoSelectSource.Local(options)` is rebuilt on each recomposition.

**L10. Receipt and payment adjustments.**
- Changing the kind changes the posting account but keeps the dimensions; posting decides.
- There is no read-only list of adjustments on the detail screens (disclosed).

## Not verified

- No tests or compile were run (read-only).
- The opening-invoice and opening-bill editors (if any edit lines in the app) were not traced for the same full-replace wipe as H1. Check them with H1.

## Reconcile list: DIM-A (`ap-dim-a`, 88282349) vs DIM-B

Both branch from 808f8ec2. These conflict or need adapting at merge:

1. **`domain/repository/DimensionsRepository.kt`** (same path).
   - DIM-A has 4 reads, each with `status: DimensionStatus? = null` (null = both), plus 10 writes.
   - DIM-B has the same 4 reads without `status`.
   - DIM-B's calls still compile against DIM-A's defaults, but would then receive both statuses. The loader filters `isActive`, so behaviour is the same with more data. Pass `DimensionStatus.Active` for line pickers and null for report filters (M4).
2. **`domain/model/DimensionModels.kt`** (same path, both new): the file conflicts.
   - DIM-A only: `DimensionStatus`, `DimensionValueDraft`, `DimensionDefinitionDraft`, `DimensionTarget`, `DimensionErrorDetails`, `DimensionErrorCodes`.
   - DIM-B only: `DimensionFields`, `DimensionSet`, `DimensionLabel`, `DimensionNames`, `DimensionFilters`. Keep all of both.
   - Both define the same two value classes:

     | Class | DIM-A | DIM-B |
     |---|---|---|
     | `DimensionValue` | `id, definitionId, code, name, parentId, status: DimensionStatus, validFrom: String (non-null), validTo, isHeader, deactivationReason, used, version`, no defaults | `id, code, name, parentId=null, status: String="ACTIVE", validFrom?, validTo?, isHeader=false`, plus `label` |
     | `DimensionDefinition` | `status` enum, `deactivationReason`, `used`, `valueCount`, `version` | `status: String` |

   - Take DIM-A's shapes. Add `val label get() = "$code $name"`. Fix DIM-B's three-argument constructors (the mock companion, tests).
3. **`data/remote/dto`**: both declare `DimensionValueDto` and `DimensionDefinitionDto` in the same package, in different files (`DimensionDtos.kt` vs `DimensionPickerDtos.kt`). That is a **redeclaration compile error**.
   - The list wrappers differ in name: DIM-A `DimensionValuesDto` / `DimensionDefinitionsDto`, DIM-B `DimensionValueListDto` / `DimensionDefinitionListDto`.
   - Keep DIM-A's. From DIM-B keep only `DimensionSetDto` and `DimensionLabelDto`.
4. **`data/remote/DimensionsApi.kt`** (same path).
   - DIM-A: `AccountsA2Transport`, reads take `status: String?`, plus writes.
   - DIM-B: `AccountsApi.read`, `status=ACTIVE` hard-coded.
   - Take DIM-A's. Update DIM-B's `features/accounts/DimensionsApiTest.kt`, which tests DIM-B's signatures. DIM-A's test is in `features/accounts/dimensions`, so there is no class clash, only overlap.
5. **`data/repository/DimensionsRepositoryImpl.kt`** (same path).
   - DIM-A maps through `DimensionsMapper`. DIM-B maps through `DimensionPickerMapper.toDomain(DimensionValueDto | DimensionDefinitionDto)`.
   - Keep DIM-A's impl. Cut `DimensionPickerMapper` down to the set and names functions (`toDomain(DimensionSetDto)`, `toDto`, `toBody`, `names`).
6. **`data/mock/MockDimensionsRepository.kt`** (same path).
   - DIM-A: stateful per-company seeds with writes.
   - DIM-B: static companion (`COST_CENTRES`, `PROJECTS`, `DEFINITIONS`, `CHANNEL_ID`, `CHANNEL_VALUES`, `namesOf(set)`). These are used by `MockJournalsRepository:440`, `MockPayablesRepository:411,913,958`, `MockReceivablesRepository:454,816,838` and `DimensionCatalogTest:82,98`.
   - Move `namesOf` and the fixtures onto DIM-A's mock (or a `MockDimensionFixtures` object), with ids matching DIM-A's seeds, so mock lines name values the Dimensions screens list.
7. **DI (`app/di/NeoAppDi.kt`)**: both add `single<DimensionsRepository>`, at different lines. That double-registers. Keep one, built DIM-A's way.
8. **`AccountsAccess.dimensions`**: both add a property named `dimensions`, with different types.
   - DIM-A: `presentation.DimensionsAccess` (read and write flags, `freeDimensionsOn`).
   - DIM-B: `presentation.dimensions.DimensionAccessFlags` (`readCostCentres`, `readDimensions`, `freeDimensionsOn`).
   - The field names match, and the grant checks are equivalent (`reads(X)` is `can("X.READ")`).
   - Keep `DimensionsAccess`. Have `RepositoryDimensionCatalogSource` take it, or derive `DimensionAccessFlags` from it.
   - `ALL_CODES`: DIM-A adds `COST_CENTER.UPDATE/DEACTIVATE` and `DIMENSIONS.READ/MANAGE`; DIM-B adds `DIMENSIONS.READ` (duplicate).
9. **`AccountsFeatureGates` / `AccountsFeatureGatesFromSession`**: identical `freeDimensions` field and `apply` line in both. Trivial conflict; reconcile the KDoc (DIM-A's wording is accurate about the 403 on reads).
10. **Koin boundary**: DIM-B reads the repository in `NeoSmartContentArea` and passes it to `AccountsRoute` (`dimensionsRepository`). DIM-A calls `koinInject<DimensionsRepository>()` inside `presentation/dimensions/AccountsDimensionsTab.kt:70`. Align on DIM-B's pattern: Koin at the routing boundary only.
11. **`presentation/dimensions` package**: both add files there. There is no file or symbol clash (DIM-A: `DimensionRules`, `DimensionsState`, `DimensionsTabHolder`, …; DIM-B: `DimensionCatalog`, `LineDimensionPickers`, `LineDimensionRules`). Name overlap to watch: DIM-A `DimensionRules` vs DIM-B `LineDimensionRules`.
12. **Shell navigation**: DIM-A adds `AccountsTab.Dimensions`, `NeoDestination.AccountsDimensions` and its feature map entry. DIM-B touches neither, so there is no conflict.
13. **Cache opportunity**: once merged, DIM-A's tab holder and DIM-B's catalog loader read the same lists. A shared per-company cache would fix L5, and invalidating it on a DIM-A write keeps the pickers fresh.

## Re-check (Opus, read-only, 2026-11-08)

Scope: `NeoERP-App` `9098c194..39ca3fbb` on `dev-app`: merge `baa73a12` (DIM-A, with the reconcile), then `277ac56a` (H1, L1) and `39ca3fbb` (M1–M5, L2, L3, L6–L8).
Checked against the backend in `NeoERP-BackEnd` accounts-service (`b282c82`):
- `WireDimensions`, `DraftDimensionCheck`;
- `ReceivablesBodies.onAccountCreditNote` / `withDimensions`, `BillBodies.onAccountDebitNote`, `ArDocumentDraftService.onAccount`;
- `ReceiptRules.ADJUSTMENT_ROLES`, `PaymentRules.ADJUSTMENT_ROLES`;
- `ChartService.list` (`hasRole`, `roleCode`), `ReportFilterParams`;
- the packs (`packs/2026.2/*.csv`).

I did not compile or run anything. The builder reports 1,821 accounts tests green. Paths are relative to `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/`.

**Verdict: ready to merge. No blockers.** The merge kept everything from DIM-A, and every fix the lead asked for is in and correct against the backend. There are three new Lows. One of them is a direct result of the H1 fix (on-account note editors with company dimensions off), and it should be logged now.

### Merge (`baa73a12`)

| Check | Result | Where |
|---|---|---|
| DIM-A's approved fix rounds kept | **OK** | `git diff 88282349 HEAD` is empty for `DimensionsTabHolder.kt`, `DimensionValuePanel.kt`, `CompanyDimensionPage.kt`, `DimensionRules.kt`, `DimensionsApi.kt`, `DimensionsRepositoryImpl.kt` and `DimensionsRepository.kt`. That means: M1 conflict reset (`DimensionsTabHolder.kt:302` `formEpoch`, panel fields keyed on it, `DimensionValuePanel.kt:145-152`); M4 definition delete; N1 rename epoch (`CompanyDimensionPage.kt:228-229` `remember(d.id, state.formEpoch)`); `validFrom` can't be cleared (`fromRequired`). The DIM-A tests in `commonTest/.../dimensions/` are unchanged. |
| One `DimensionsRepository` shape | **OK** | DIM-A's (reads take `status`, null = both). DIM-B's set types moved to `domain/model/DimensionSetModels.kt`. One `DimensionValueDto` / `DimensionDefinitionDto` (`data/remote/dto/DimensionDtos.kt`), so no redeclaration. `label` added (`DimensionModels.kt:36`). |
| DI registered once | **OK** | `app/di/NeoAppDi.kt:225` is the only `single<DimensionsRepository>`. |
| Koin only at app/di and `NeoSmartContentArea` | **OK for this change** | `AccountsDimensionsTab.kt:68` now takes `context.dimensions` (`AccountsTabContext.kt:22`, fed from `NeoSmartContentArea.kt:335` through `AccountsRoute.kt:1268`). The diff adds no `koin` import. `features/` still has older `koinInject` calls (`AccountsChartTab`, `AccountsCalendarTab`, `AccountsTaxCodesTab`, `AccountsUsedForTab`, `PlatformDashboardScreen`). They predate DIM and are out of scope. |
| Mock ids consistent | **OK** | `data/mock/MockDimensionFixtures.kt` holds DIM-A's Kystgruppe seeds, unchanged (cc-1..10, p-1..5, def-1 Vessel, def-2 Sales channel, fv-1..5). `MockDimensionsRepository` seeds from it. `namesOf` resolves against the same ids (`MockJournalsRepository:440`, `MockReceivablesRepository:454,816,838`, `MockPayablesRepository:411,606,914,959`). |
| Access | **OK** | `AccountsAccess.dimensions` is `DimensionsAccess`. `toPickerFlags()` (`DimensionsAccess.kt:59`) is the only bridge. `ALL_CODES` has no duplicates (`AccountsAccess.kt:119-120`). |

### Fixes

| Item | Result | Evidence |
|---|---|---|
| **H1** on-account credit and debit notes wipe dimensions | **Fixed** | State and draft carry `dimensions`: `CreditNoteEditor.kt:31-35,151,324`, `DebitNoteEditor.kt:32-36,150,340`. The mapper sends `toBody(d.copy(branchId = null), keepItem = true)`: `SalesDocumentMapper.kt:233`, `PayablesMapper.kt:238`. DTOs get `dimensions` with `EncodeDefault.NEVER`. This matches the backend: `ON_ACCOUNT_LINE` includes `dimensions` (`ReceivablesBodies.kt:50`, `BillBodies.kt:38`), `withDimensions` uses `itemAllowed = true`, and `WireDimensions.documentLines` drops a line branch, so null is always safe. Tests: `NoteEditorsDimensionsTest` covers each editor with load → edit → save → re-read through the mock, which checks state and draft. Not tested: the two on-account `body()` mappers. They are one line each and match the invoice path, which is tested. |
| **L1** document lines wipe `itemId` | **Fixed** | `DimensionPickerMapper.kt:25-33` (`keepItem`). `keepItem = true` only on invoice, bill and the two on-account bodies. Journal, adjustment and advance lines still send null, which matches `refuseUnsupported(itemAllowed = false)` in `JournalBodies:66`, `ReceiptBodies:122,147` and `PaymentBodies:126,194`. Tested: `NoteEditorsDimensionsTest.theItemOfADocumentLineIsSentAndTheBranchIsNot`. |
| **M1** company dimensions off: Remove and words | **Fixed** | Remove: `LineDimensionPickers.kt:44-53` sets the slot to null in the whole set, which the editors send. Journal: `JournalEditorRules.setDimension` (`:177-182`, `without(field)`) reaches the PUT through `JournalsMapper.toBody` (`:234`), because the line set is the base. Words: `FreeDimensionsOff.notice` (`DimensionCatalog.kt`), wired into the invoice, bill, receipt, payment and journal refusal paths. Tests: `DimensionReviewFixesTest` M1, and `JournalDimensionsTest.withCompanyDimensionsOffHeldFreeValuesShowByNameAndCanBeRemoved`, which also checks that the other values stay. |
| **M2** a held value not in the list shows as None | **Fixed** | `LineDimensionRules.heldNotListed`, used in `LineDimensionPickers.kt:65-67` and `JournalLineGrid.kt:513-515`. Tested. Nit: with no server name the text is "Unknown value (inactive)". The value may not be inactive, so "(not in the list)" would be more accurate. Optional. |
| **M3** role-account pickers | **Fixed. The BAD_DEBT_EXPENSE fallback is right for receipts.** | The backend is `ReceiptRules.kt:475-480`: `SMALL_DIFFERENCE → [SMALL_DIFFERENCES, BAD_DEBT_EXPENSE]`, first mapped wins. Payables (`PaymentRules.kt:631-636`) have no fallback. `DimensionRoles` (`DimensionCatalog.kt`, bottom) mirrors both exactly. Advance lines use `CUSTOMER_ADVANCES` / `SUPPLIER_ADVANCES`, the same roles as `requireAllowedOnRole` (`ReceiptRules:236`, `PaymentRules:122`). When a role is unresolved the pickers are hidden and the held values show read-only (`LineDimensionPickers` with `allowed = emptySet()`). On the shipped packs the advances accounts allow only `branch` (`pk.csv:41,134`, `no-ns4102.csv:35,115`), so advance lines show no pickers. That is correct. `SETTLEMENT_DISCOUNT_NO_TAX` (backend: `DISCOUNT_GIVEN` / `DISCOUNT_RECEIVED`) is not an app `AdjustmentKind` (`ReceiptModels.kt:35`), so there is no gap today. See N2 for a resolution edge. |
| **M4** inactive report filters | **Fixed** | `DimensionCatalogLoader.load(includeInactive)` → `status = null`. `reportCatalog` is used by `ReportBooksReader`. Inactive values are marked (`ReportParts.kt:150-154`). `known()` keeps unfound values and shows them as "Unknown value". A value is dropped only when its column has no list. Tested. An unknown UUID only filters to no rows on the server (`ReportFilterParams` refuses non-UUID text only). Edge, not fixed: an inactive *definition* still drops its whole filter (`definitions.filter { it.isActive }`). Rare; backlog. |
| **M5** journal wording | **Fixed (journal only, as decided)** | `JournalsMapper.kt:257` maps `dimension` and `reason`; `AccountsWording.kt:402-407, 437-450, 458`. Tested. The invoice, bill, receipt and payment wording is still generic: backlog, as decided. Nit: `headingOf(...).lowercase()` turns a company heading such as "IMO number" into "imo number" in the NOT_ALLOWED sentence. |
| **L2** no definitions read while off | **Fixed** | `DimensionCatalog.kt` loader returns before `listDefinitions` when `!freeDimensionsOn`. Tested. |
| **L8** P&L note for project and company-dimension filters | **Fixed** | `ProfitLossState.kt` `PlNote.DimensionFilter`, `ProfitLossScreen.kt:215`, string `accounts_pl_note_dimension_filter`. Tested. |
| L3, L6, L7 (done in passing) | **Fixed** | L3: `JournalLineGrid.HeldDimensions`, with `heldNote` and `removableFree`. L6: `ReportsWording.allOf` → "Any {name}". L7: `AccountsRoute.kt:293-299`, where `rememberUpdatedState` plus a flags lambda means the source is keyed on the repository only. An open editor keeps the catalog it loaded; acceptable. |
| L4, L5, L9, L10 | Backlog, as decided | — |

### New issues

- **N1 (Low; a result of the H1 fix). With company dimensions off, an on-account credit or debit note that holds a company-dimension value can't be saved, and the person isn't told why.**
  - The note editors now send the stored free values back, which is correct. `ArDocumentRules:141` / `BillRules:149` → `DraftDimensionCheck.requireFreeDimensions` then refuses the save with 403 `FEATURE_NOT_ENABLED`.
  - Unlike the five editors fixed for M1, `CreditNoteEditor` / `DebitNoteEditor` and their screens show no held values at all: no caption, no Remove. They also don't use `FreeDimensionsOff`.
  - Before H1 the value was silently wiped and the save went through. Now the save is refused with generic words.
  - It only bites drafts written by another client while the feature is off, so it is rare.
  - Fix (small): put `LineDimensionPickers(catalog, set, allowed = emptySet(), …)` (read-only plus Remove) under each on-account line, and call `FreeDimensionsOff.notice` in the two `refuse` paths. Otherwise, add it to the backlog next to L4.
- **N2 (Low, an edge of M3). The role map keeps one role per account.**
  - `SetupReceivablesLookups.roleDimensions` / `SetupPayablesLookups.roleDimensions` build `roleCode → allowed` from `AccountQuery(hasRole = true)`.
  - The backend's list carries a single `roleCode` per account (`ChartService.kt:133`, `associate { accountId to roleCode }`). If a company maps two roles to one account (for example ROUNDING and SMALL_DIFFERENCES both to 7795), one of the roles drops out of the map.
  - The safe result: its pickers are hidden.
  - The wrong result, on receipts: if SMALL_DIFFERENCES is the role that drops out, the app falls back to BAD_DEBT_EXPENSE's `allowedDimensions`. The backend posts to the SMALL_DIFFERENCES account, so the app can offer a dimension that posting then refuses.
  - The shipped packs map one role per account, so a default setup is fine.
  - The app also uses the current mapping, while the backend checks the mapping on the document date.
  - Fix: read the role mappings (`AccountsSetupRepository.roleMappings`, role → account id) and look up each account's `allowedDimensions` in the chart. Backlog.
- **N3 (pre-existing, outside this slice; money path, worth a backlog row). The on-account debit note sends no `taxAmount` / `taxOverrideReason`.**
  - The backend accepts both on an on-account debit-note line (`BillBodies.kt:38`). `OnAccountDebitLineBodyDto` has neither, and `DebitNoteEditor` has no state for them.
  - A draft whose tax was overridden through the API is recalculated on the next app save. That is the same full-replace pattern as H1, applied to tax.
  - I did not trace whether the backend recalculates or refuses in that case.

No other regression found in the money or data paths. Document lines still never send a branch, deduction lines still never send `dimensions`, and journal flat tags still win over the held set. The `isBlank` change on the on-account line states (a line holding values is no longer "blank") is safe: such a line is validated (description and amount are required) and has its own Remove.
