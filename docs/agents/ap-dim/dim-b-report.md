# DIM-B report: dimension pickers on Accounts lines and report filters

Checkout `NeoERP-App`, branch `dev-app`, from 808f8ec2 to 9098c194 (6 commits, not pushed). 86 files, +2118/-84.
Compiled with `:composeApp:compileKotlinJvm`; targeted `jvmTest` only. The app was not run, so nothing is visually checked.

## Built

1. **Value lists** (read only). `DimensionsRepository` with `listCostCentres`, `listProjects`, `listDefinitions` and `listValues(definitionId)`, active values only. Live impl `DimensionsRepositoryImpl` over `DimensionsApi`, plus `MockDimensionsRepository` (2 cost centres, 2 projects with one group node, company dimension 1 "Sales channel"). Wired in `NeoAppDi`, `NeoSmartContentArea`, `AccountsRoute`.
2. **Line model.** `DimensionSet` (ten `DimensionSetV1` ids), `DimensionNames` (`dimensionNames`), `DimensionValue`, `DimensionDefinition`. Added `dimensions` and `dimensionNames` to the journal, invoice, bill, receipt adjustment, receipt advance line, payment adjustment and payment advance line models. DTOs, mappers and mocks follow.
3. **Catalog and rules** in `presentation/dimensions/`:
   - `DimensionCatalog` and `DimensionCatalogLoader` build the picker columns: Cost centre, Project, and company dimensions under their own slot names.
   - `LineDimensionRules` holds the pure rules. Take allowed dimensions from the account (`cost_centre`, `project`, `free1..free4`). Clear values on an account change. Work out which values have no picker. Build the read-only caption.
   - `LineDimensionPickers` is the shared card-layout composable. `LocalDimensionCatalog` and `ProvideDimensionCatalog` give posted-document screens the company's own headings.
4. **Journal editor.** The grid gets Project and Free 1-4 columns after Cost centre. A column shows when it has values and some line's account takes it. Cells are disabled with "Not tagged by project" and so on, in the grid and on the phone cards. The journal detail shows the held dimensions read-only, from `dimensionNames`.
5. **Invoice, bill, receipt and payment editors.**
   - Invoice lines and bill lines take pickers under the account select, limited to what the account takes. A blank account uses the default account's `allowedDimensions`.
   - Receipt adjustment lines and advance lines, and payment adjustment lines and advance lines, take pickers. Their account is not known to the client, so all pickers are offered and the server decides at posting.
   - Posted invoice, bill, receipt advance and payment advance detail screens show the dimensions read-only under the description.
6. **Gate.** `AccountsFeatureGates.freeDimensions` (from `NeoFeatureAction.FreeDimensions`) feeds `AccountsAccess.dimensions.freeDimensionsOn`. `AccountsAccess.dimensions` also carries `readCostCentres` (`COST_CENTER.READ`) and `readDimensions` (`DIMENSIONS.READ`). With the feature off, no free picker is offered. Existing free values stay on the line, are shown read-only by name, and are sent back unchanged. Unknown feature state counts as on.
7. **Report filters** on trial balance, general ledger and profit and loss: Project and one filter per company dimension, each "All", "Untagged" or one value.
   - They go to the API as `projectId`, `free1Id..free4Id` and to the export body (omitted when unset).
   - They are carried in the route as `dims` (`projectId:{id},free1Id:untagged`) and in the saved filters. The TB to GL, P&L to GL and P&L to TB drills carry them.
   - The GL cursor key includes them.
   - A value that cannot be picked (unknown, or no right) is dropped on resolve. "Untagged" stays.
   - Balance sheet and cash flow are untouched (company level in the backend).

## Data safety (draft PUT is a full replace)

Every editor keeps the whole `dimensions` object it loaded and sends it back, shown or not. Where the line has no picker (no right to read the lists, FREE_DIMENSIONS off, the account refuses the dimension), the value stays and is shown as a read-only caption.

- **Journal:** branch, stock location and cost centre keep their own fields. The rest of the set rides in `JournalEditorLine.dimensions` and is always sent. The mapper lays the flat tags over the held set, so flat and nested always agree and 422 `DIMENSION_CONFLICT` cannot come from this app. `holds()` also compares the set.
- **Existing bug fixed:** the bill editor dropped every bill line's cost centre on each save (`BillLineState` had no cost-centre field). It now round-trips it, including a flat-only cost centre.
- **Document lines** (invoice, bill): `branchId` is nulled on send (a line takes the document's branch; anything else is 422 `BRANCH_NOT_DOCUMENT_BRANCH`).
- **Advance lines** (receipt, payment): `branchId` and `stockLocationId` are nulled on send (stock location is refused on advance lines).
- **Adjustments** keep their own branch.
- **Mapper rule:** `departmentId` and `itemId` are always sent null (refused by the backend).
- **Empty set:** an empty set is not written at all (`dimensions` omitted from the line), so requests without dimensions are byte-identical to before.
- **Advance-deduction lines** never carry `dimensions` (they copy the advance's).

Round-trip tests, one per editor:
- `JournalDimensionsTest`
- `InvoiceEditorDimensionsTest`
- `BillEditorDimensionsTest`
- `ReceiptEditorDimensionsTest` (adjustment and advance line)
- `PaymentEditorDimensionsTest` (adjustment and advance line)

Each saves with no pickers present and checks the stored set equals the loaded one (including a value of a slot the person has no column for). Where there is a picker, each checks that one change keeps the rest.

## Files

New, under `features/accounts`:
- `domain/model/DimensionModels.kt`
- `domain/repository/DimensionsRepository.kt`
- `data/remote/DimensionsApi.kt`, `data/remote/dto/DimensionPickerDtos.kt`
- `data/mapper/DimensionPickerMapper.kt`
- `data/repository/DimensionsRepositoryImpl.kt`
- `data/mock/MockDimensionsRepository.kt`
- `presentation/dimensions/DimensionCatalog.kt`, `presentation/dimensions/LineDimensionPickers.kt`

Edited:
- **Journals:** `JournalEditorRules`, `JournalEditorState`, `JournalEditorViewModel`, `JournalLineGrid`, `JournalEditorSupport` (`GridColumn`), `JournalDetailState`, `JournalDetailLinesCard`, `JournalWording`, `JournalsPageHolder`, `JournalContexts`.
- **Invoice:** `InvoiceEditor`, `InvoiceEditorScreen`, `SalesDocumentDetailScreen`.
- **Bill:** `BillEditor`, `BillEditorScreen`, `BillDetailScreen`.
- **Receipt:** `ReceiptEditor`, `ReceiptEditorScreen`, `ReceiptDetailScreen`.
- **Payment:** `PaymentEditor`, `PaymentEditorScreen`, `PaymentDetailScreen`.
- **Wiring and lookups:** `ReceivablesSupport` and `PayablesSupport` (lookups), `AccountsAreaPage`.
- **Access and gates:** `AccountsAccess`, `AccountsFeatureGates`, `AccountsFeatureGatesFromSession`.
- **Reports:**
  - presentation: `ReportsRouteId`, `ReportBooks`, `ReportParts`, `ReportsWording`, `TrialBalanceState`/`ViewModel`/`Screen`, `GeneralLedgerState`/`ViewModel`/`Screen`, `ProfitLossState`/`ViewModel`/`Screen`.
  - data: `ReportsApi`, `StatementsApi`, `ExportsMapper`, `AccountsA2Dtos`.
- **Domain/DTO/mapper/mock for lines:** `JournalModels`, `SalesDocumentModels`, `PayablesModels`, `ReceiptModels`, `PaymentModels`, `ReportModels`, `StatementModels`, the matching `*Dtos` and mappers, `MockJournalsRepository`, `MockReceivablesRepository`, `MockPayablesRepository`.
- **App wiring:** `NeoAppDi`, `NeoSmartContentArea`, `AccountsRoute`.

New tests (commonTest, `features/accounts`):
- `journals/state/JournalDimensionsTest`
- `receivables/InvoiceEditorDimensionsTest`, `receivables/ReceiptEditorDimensionsTest`
- `payables/BillEditorDimensionsTest`, `payables/PaymentEditorDimensionsTest`
- `reports/ReportDimensionFiltersTest`
- `presentation/DimensionCatalogTest`
- `DimensionsApiTest`
- Edit: `JournalStateFixtures` takes `dimensions`, and chart account 6300 allows free1 and free2.

## Deviations from the brief and the spec

- **Result type.** The brief said `NeoResult`. No Accounts repository returns `NeoResult`; every one returns `AccountsResult` (A0 `call` helper). `DimensionsRepository` uses `AccountsResult<List<…>>` and takes `companyId` first, like `journals.costCentres(companyId)`. Names are exactly `listCostCentres`, `listProjects`, `listDefinitions`, `listValues(definitionId)`. DIM-A's file needs the same two adjustments, or the lead adapts one side. `DimensionValue` and `DimensionDefinition` are my names; the DTOs in `DimensionPickerDtos.kt`, the mapper in `DimensionPickerMapper.kt` and the mock in `MockDimensionsRepository.kt` are separate files so the merge is mechanical.
- **Spec §4.7 vs what I built.** The spec is Draft. These parts are not built:
  - header "Line defaults" row (default project and company dimensions);
  - the "Columns" menu (hide optional columns);
  - "Use default · {name}" empty options;
  - required-dimension (`DIMENSION_REQUIRED`) cell states;
  - recents first;
  - group-only nodes listed greyed (they are left out of the pickers: they take no postings);
  - the "Cleared: not used on {account}" 3-second hint (values are cleared silently on an account change).
- **Document and adjustment editors** use the card layout (pickers in a wrapped row under the account select), not grid columns, because those editors are not grids. A dimension the account does not take is not drawn, instead of the disabled "—" cell with its reason (journal grid has the disabled cell).
- **Required/validity:** drafts are not checked in the app against validity dates or status. Group-only and inactive values are excluded from the pickers, and the backend remains the check at posting (DIMENSION_NOT_ALLOWED and DIMENSION_INVALID words already exist).
- **Report filters** choose one value or "Untagged" per dimension (the backend takes several). `untaggedExcluded` of the P&L is not surfaced.
- **Backend over spec:** the spec's `departmentId` and `itemId` columns are not built (backend refuses both). Free slots use the backend's `free1..free4` account vocabulary.

## Tests and results (targeted, one Gradle process at a time)

- New: `JournalDimensionsTest` 6, `InvoiceEditorDimensionsTest` 3, `BillEditorDimensionsTest` 4, `ReceiptEditorDimensionsTest` 4, `PaymentEditorDimensionsTest` 4, `ReportDimensionFiltersTest` 6, `DimensionCatalogTest` 8, `DimensionsApiTest` 3. All pass.
- Package runs, all green after the last change: `accounts.journals.*`, `accounts.receivables.*`, `accounts.payables.*`.
- Earlier green run: `accounts.reports.*` (475 tests) with one failure (`JournalDtoTest`, line key set) that I then fixed in the same package run.
- Also run green: `AccountsFeatureGatesTest`, `AccountsAccessTest`, `ReportsRouteIdTest`, `TrialBalanceStateTest`, `ProfitLossStateTest`, `ReportFiltersStoreTest`, `JournalEditorStateTest`, `JournalDetailStateTest`.
- Not run: the full suite, UI/Compose tests, Android and iOS compile, the live app.

## Open questions and follow-ups

1. **Credit and debit note editors** (on-account lines accept `dimensions`; lines against a document copy the document line) are not built. The credit-note and debit-note editors still send no `dimensions`. If they ever load a line set, they would drop it on save. Today they carry none, but worth a follow-up slice.
2. **Receipt/payment adjustment account is unknown to the client**, so pickers are offered for any dimension. An account that does not take it is refused at posting with `DIMENSION_NOT_ALLOWED`. Advance lines are also checked at draft save against the `CUSTOMER_ADVANCES` / `SUPPLIER_ADVANCES` account (422 `DIMENSION_NOT_ALLOWED`, `field: advanceLines`), so a draft save can refuse them; the existing refusal wording handles it. Should the receipt and payment responses carry the account's `allowedDimensions` so the pickers can be filtered? (Backend change.)
3. **Opening AR/AP and SIE/OB imports** were not touched.
4. **Read-only caption headings** on posted documents come from `ProvideDimensionCatalog`. Where nothing provides it (a screen opened outside `AccountsAreaPage`), a company dimension reads "Company dimension 1".
5. **Receipt and payment adjustments** have no read-only list on their detail screens today, so their stored dimensions are not shown there.
6. **Visual check needed:** the journal grid has up to four extra tag columns (horizontal scroll via `NeoTableScroll`). Please click it on a narrow window and a phone width. Test steps for Jabran: open Accounts, Journals, New journal, with the mock repository (mock data has a project, two cost centres and "Sales channel").
7. **`AccountsAccess.dimensions`** overlaps with whatever DIM-A adds for the maintenance screens (`DIMENSIONS.MANAGE`); merge by adding its flags to the same class.
8. **`ACCOUNTS.DIMENSIONS.READ`** is added to the full-grant test set (`AccountsAccess.FULL`) in `AccountsAccess.kt`.

## Merge + fix round

### Merge (commit baa73a12, "merge: DIM-A Accounts Dimensions maintenance screens; lead-reviewed")
Resolved per the reconcile list:
- DIM-A's shapes for `DimensionModels`, `DimensionsRepository` (reads take `status`, null = both), `DimensionsApi`, `DimensionsRepositoryImpl`, `MockDimensionsRepository`; `label` ("{code} {name}") added to `DimensionValue`.
- DIM-B's set/names/filter types moved to `domain/model/DimensionSetModels.kt`. `DimensionPickerDtos`/`DimensionPickerMapper` cut down to the set and names parts.
- Mock fixtures: DIM-A's Kystgruppe seeds moved into `MockDimensionFixtures` (the mock seeds from it), and `namesOf` lives there, so mock lines name the values the Dimensions screens list (slot 1 Vessel, slot 2 Sales channel).
- One DI registration (DIM-A's). DIM-A's `DimensionsAccess` kept; `toPickerFlags()` derives DIM-B's `DimensionAccessFlags`. `AccountsAccess.dimensions` is `DimensionsAccess`.
- Koin: `AccountsDimensionsTab` no longer injects; the repository reaches it through `AccountsTabContext.dimensions` from `NeoSmartContentArea` -> `AccountsRoute`.
- My tests adapted (`dv`/`dd` fixtures; the list-path API tests are DIM-A's, mine reduced to `DimensionLineWireTest`).

### Fixes (lead decisions)
- **H1:** credit-note and debit-note on-account lines carry `dimensions` (branch removed) through load and save. Tests: `NoteEditorsDimensionsTest`.
- **L1:** `itemId` is kept on all document lines (invoice, bill, both on-account notes) and nulled elsewhere (`toDto(keepItem)`). Tested.
- **M1:** with FREE_DIMENSIONS off, a held company-dimension value shows by name with a Remove in the invoice, bill, receipt, payment and journal editors. A save refused with FEATURE_NOT_ENABLED says "Company dimensions are off for this company. Remove {heading}: {name} from the line to save." (`FreeDimensionsOff`). The journal editor shows held values too (L3).
- **M2:** a held value not in the active list (inactive, group only, gone) is the selection under its `dimensionNames` text plus "(inactive)" / "(group only)" / "Unknown value", never "None" (document editors and journal grid).
- **M3:** advance-line and adjustment pickers offer only what the role account takes. The app resolves the account from the chart (`AccountQuery(hasRole = true)`, which carries `roleCode` and `allowedDimensions`; same data as the role mappings): CUSTOMER_ADVANCES / SUPPLIER_ADVANCES for advance lines, BANK_CHARGES / ROUNDING / SMALL_DIFFERENCES (receipts fall back to BAD_DEBT_EXPENSE when unmapped) for adjustments by kind. **When the role cannot be resolved the pickers are hidden** (the held values show read-only and are still sent). Not show-and-refuse.
- **M4:** report filters load ACTIVE and INACTIVE values; the filter list shows inactive ones with the "Inactive" detail. A filter value that is not found stays and shows as "Unknown value"; only a dimension with no list at all (no right, or feature off) is dropped.
- **M5:** the parsed journal refusal keeps `dimension` and `reason`; words name the right dimension with the company's own heading ("that value isn't one of the Sales channel values", "isn't tagged by sales channel"). **Not done:** the same words for the invoice, bill, receipt and payment editors' DIMENSION_* refusals (including `field: advanceLines`): they still use those screens' existing generic wording.
- **L2:** definitions are not read while FREE_DIMENSIONS is off (comment fixed); held free values then read "Company dimension N".
- **L8:** the P&L shows a note ("lines that have no value for it are left out. Choose Untagged to see them.") for a project or company-dimension filter.
- Also done cheaply: L6 ("Any {name}"), L7 (journals and reports holders no longer rebuild when a right or feature changes: the source reads the flags at each call).

Tests: new `DimensionReviewFixesTest` (M1-M5, L2), `NoteEditorsDimensionsTest`, journal and P&L additions. Full `features.accounts.*` package run plus `AccountsStringResourcesTest`, `NeoAppDi*`, `DimensionWordsResourcesTest`: all green (1821 tests). Not run: Android/iOS compile, the full suite, the screenshot test, the live app.

### Left for the backlog (not fixed)
- **L4** spec §4.7 gaps (Cleared hint, validity on the line date, greyed group nodes, recents, Line defaults, Columns menu, "More dimensions" fold).
- **L5** each editor makes 2+N serial dimension reads before loading; no per-company cache (a shared cache with DIM-A's tab holder, invalidated on its writes, would fix it).
- **L9** style (fully qualified names, `modifier` on both caption and picker row, `Local(options)` rebuilt per recomposition).
- **L10** a changed adjustment kind keeps its dimensions; no read-only adjustment list on detail screens.
- M5 for invoice/bill/receipt/payment wording (above); the "Remove" is offered only for company dimensions while the feature is off (not for other hidden values).
- Opening-invoice and opening-bill editors: the app has no editor for them, so nothing to round-trip.

### Re-check round (N1, N3)
- **N1:** the on-account credit-note and debit-note editors load the dimension catalog, show held values by name (no pickers there; `allowed = emptySet()`), offer Remove for company-dimension values while FREE_DIMENSIONS is off, and say the same refusal words as the other editors. Tests in `NoteEditorsDimensionsTest`.
- **N3:** accounts-service `BillTaxResolver`: a line with no typed tax amount is recalculated and its override reason cleared (`typedTax ?: computed`). So the debit-note editor now round-trips `taxAmount` and `taxOverrideReason` from the loaded draft, sent only when the stored tax differs from the computed one (a computed tax stays unsent). The mock models the same rule. Tested (override kept at 100.00 against a computed 125.00).
- N2: no change (backlog).
