# QA-1 quick add: Opus review of 2ea9b638 (NeoERP-App, dev-app)

Read-only review: no code edited, no Gradle run. Working tree equals 2ea9b638 at review time. Paths below are under
`NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/` unless written in full.

**Verdict:** one High to fix before merge (refusals that the panel cannot show). Rights, the filter rule, the single server path, no bank
details, the form state underneath, draft round-trips, the architecture rules and the "No matches" fix all check out. The Mediums are gaps
against the brief.

## High

**H1. A refusal aimed at a field the short form does not have is not shown. Save just comes back enabled.**
`features/accounts/presentation/payables/SupplierQuickAdd.kt:88` and `receivables/CustomerQuickAdd.kt:87` pass only `state.notice` as the
panel error, and the form draws only `fieldErrors["name"]`. The reused view models put the duplicate refusals into *field* errors with no
notice: `payables/PayablesSupport.kt:126-127` (`DUPLICATE_SUPPLIER_CODE` → `code`, `DUPLICATE_SUPPLIER_TAX_ID` → `taxId`),
`receivables/ReceivablesSupport.kt:155-156` (customer code and tax id), applied at `payables/Suppliers.kt:378` and
`receivables/Customers.kt:330`.
- **Failure:** a supplier exists whose code was typed by hand as `SUPP-000004`. The backend's next auto code is the same
  (`Payables.kt:130`, `"SUPP-" + 6 digits`), so the create gets 409 `DUPLICATE_SUPPLIER_CODE`. The panel shows no notice and no field
  error, and Save is enabled again. Every retry fails the same way, and "Open full record" also saves first, so the person cannot get out
  of it to the full sheet.
- **Same for VALIDATION:** a `VALIDATION` refusal on `country`, `terms` and so on shows only "1 field needs attention" with no field to fix.
- **Brief:** this breaks rule 3 and the check "duplicate refusals show in the panel".
- **Test:** `commonTest/.../payables/QuickAddTest.kt:60-66` uses exactly `DUPLICATE_SUPPLIER_TAX_ID`, but asserts
  `notice != null || fieldErrors.isNotEmpty()`, so it passes while the panel stays blank.
- **Fix:** in the quick panels, pass `state.notice ?: state.fieldErrors.filterKeys { it != "name" }.values.firstOrNull()` as the error, or
  join them. Then assert on what the panel would show.

## Medium

**M1. The first value of an empty cost-centre, project or company-dimension list cannot be quick-added.**
- **Cause:** `features/accounts/presentation/dimensions/DimensionCatalog.kt:66,72-73` drop a column whose list is empty, and
  `LineDimensionPickers.kt` only puts the add row on columns that exist.
- **Failure:** a company with no projects yet never sees a Project picker on a bill line, so the case where quick add matters most (the
  first project) is not offered.
- **Status:** the report lists this as open, but the brief B row has no such exception, and building-blocks "Quick add" ("Accounts today:
  … cost centre, project and company-dimension values on the line pickers") says it works.
- **Fix:** show the column with an empty list when `DimensionQuickAdd.canCreate` is true. Otherwise get Jabran's OK and note the exception
  in the spec.

**M2. The dimension quick-add panel has no "Open full record".**
- **Where:** `dimensions/DimensionQuickAdd.kt:119-127` calls `NeoQuickAddPanel` without `onOpenFullRecord`.
- **Rules:** brief rule 2 ("The panel has an 'Open full record' link") and the building-blocks footer text both say every quick-add panel
  has it.
- **Failure:** a person who needs a parent or valid-from date on a new cost centre must cancel, lose the typed code and name, and go to
  Dimensions.
- **Fix:** add it (save, pick, then open the Dimensions page or value panel), or record the exception in the spec. The report does not
  mention this gap.

**M3. The dimension panel disables Save without saying why.**
- **Where:** `dimensions/DimensionQuickAdd.kt:98` computes `valueProblem`, and `saveEnabled = problem == null`. No problem text is drawn.
  The full panel draws one (`DimensionValuePanel.kt:161-176`, `accounts_dimension_problem_*`).
- **Failure:** the person types `R 1` or `Retail shop` as the code. `codeOk` fails on the space, and Save is grey with no message.
- **Fix:** show the same `accounts_dimension_problem_*` text under the code field once it has been touched.

## Low

- **L1. The "Open full record" choice is never reset.**
  - **Where:** `SupplierQuickAdd.kt:75,79,89` and `CustomerQuickAdd.kt:74,78,88` set `wantsFull = true` and never set it back.
  - **Failure:** the person clicks "Open full record", the save is refused, they fix the name and click Save. The full sheet opens instead
    of the panel closing.
  - **Fix:** reset it on refusal, or pass the intent into the save call.
- **L2. Closing the panel during a save can end in a duplicate.** Cancel stays enabled while busy (`designsystem/components/NeoQuickAdd.kt:132`).
  - **Failure:** closing the panel cancels the coroutine (the dimension panel uses `rememberCoroutineScope`; the supplier and customer VMs
    are closed in `onDispose`). The server may already have created the record, but nothing is picked. A second try gives
    `DUPLICATE_CODE` (dimension), or a second supplier with the same name, because a new VM gets a new idempotency key.
  - **Fix:** disable Cancel while busy.
- **L3. Receipts pass no actor and partly no owner.**
  - **Where:** `receivables/ReceiptsHost.kt:240` and `:278` pass no `isOwner`, and no receipt path passes `actorName`. Also
    `receivables/ReceivablesHost.kt:254` (`""`, `false`) and `InvoiceEditorScreen.kt:95` (`false`).
  - **Effect:** the customer sheet behind "Open full record" gets a blank actor or non-owner for its bank section. The report lists this
    as open. The server enforces the rule, so this is only a display gap.
- **L4. String keys do not follow naming-standard §3 and §4.**
  - **Prefix (§3):** `composeResources/values/strings_accounts_quick_add.xml` holds `accounts_supplier_advance_…`, `accounts_customer_…` and
    `accounts_dimension_…`. Keys must start with the file's scope (`accounts_quick_add_…`), or go into the supplier, customer and dim files.
  - **Area name:** `accounts_dimension_…` uses a new area word; the existing dimension keys use `accounts_dimension_`.
  - **Unused key:** `core_label_code` is defined but never used (rule 10). The dimension panel uses `core_label_code` for Code but
    `core_label_name` for Name.
  - **Hard-coded text:** `LineDimensionPickers.kt:85` adds the new literal `"Add value"`. The new add rows in
    `PaymentEditorScreen.kt:123` and `ReceiptEditorScreen.kt:117` add more `"Add supplier"` / `"Add customer"` literals (rule 8: new text
    goes into keys; only *existing* text waits for I18N-1).
  - **Already flagged:** `core_action_save`, `core_action_cancel` and `core_msg_saving` repeat the English text of existing module keys
    (rule 2). That is acceptable until the I18N-1 merge, which already plans it.
- **L5. A stale KDoc.** `designsystem/components/NeoSelectSupport.kt:905-907` still says the status row draws "No matches". The code at
  `:917-919` no longer does. Update the comment.
- **L6. Quick add sends a different valid-from from the Dimensions page.**
  - **Behaviour:** dimension quick add sends `validFrom = null`, which the server stores as 1900-01-01
    (`DimensionQuickAdd.kt` `draft(…)`). The Dimensions page defaults a new value to today (`DimensionValuePanel.kt:148-150`).
  - **Why it matters:** the same value gets different validity depending on where it was made. For back-dated documents the quick-add
    default is arguably the better one, but it should be a deliberate rule written in the spec.
- **L7. The full sheet's edits do not reach the form.** After "Open full record", `SupplierSheetHost` / `CustomerSheetHost` get
  `onSaved = { _, _ -> }` (`SupplierQuickAdd.kt` host, `CustomerQuickAdd.kt:830`).
  - **Failure:** a rename made in the full sheet does not reach the form's picked label until it reloads.
- **L8. No test drives the composables.** All new tests are pure-rule or view-model tests.
  - **Not tested:** that `NeoSearchSelect` actually routes `onAdd` through `NeoQuickAdd.offer`, that `LineDimensionPickers` hides the row
    without the right, and that the panel's error area shows the refusal (which would have caught H1).

## Checked and fine

- **Rights.**
  - Supplier and customer: `PayablesAccess.addSupplier` = `SUPPLIER_CREATE`, `ReceivablesAccess.addCustomer` = `CUSTOMER_CREATE`.
  - Dimensions: cost centre needs `createCostCentre`; project needs `readDimensions && manageDimensions`; company values need
    `freeDimensionsOn && readDimensions && manageDimensions` and also `catalog.freeOn` (`DimensionQuickAdd.kt:276-280`).
  - Filters: `NeoSearchSelect` drops `onAdd` when `toolbar = true`, and no filter picker passes `onAdd`.
- **Server path.**
  - Supplier and customer use the full sheet's view models (`createSupplier` / `createCustomer`, same idempotency key handling). The bank
    form is empty, so `bankDetails` / `bank` is null.
  - Dimension values use `DimensionsRepository.createValue`, the Dimensions page's call. A duplicate code shows in words and the typed
    code and name stay.
- **The form underneath.**
  - The panels are `NeoSidePanel` Dialogs over the editor, and editor view models are untouched. The pick goes through the editors'
    existing `pickSupplier` / `pickCustomer` / `onChange(column.with(set, id))`.
  - Draft round-trips are unaffected. No line mapping changed. The dimension pick keeps every other value of the set. No view model strips
    ids missing from its catalog (only `clearNotTaken` on an account change, as before). `itemId` is not touched.
- **Architecture.** No Koin outside di. `designsystem/components/NeoQuickAdd.kt` imports only designsystem and resources. No Compose in
  view models (only `initialName` was added to the two VMs). `DimensionQuickAddScope` holds Compose state, but it is a UI scope, not a
  view model.
- **"No matches".** The list pane draws "Nothing matches “x”." in every case that used to draw the status line
  (`itemCount == 0 && query.isNotBlank() && !loading`, `NeoSelectSupport.kt:536-541`). "Searching" and the truncated line still draw, and
  screen readers still hear "No matches". Single and multi select both pass the query to the pane.
- **Docs.** The ux-principles picker bullet, the building-blocks "Empty picker" and "Quick add" blocks, and the AGENTS.md "Pickers" rule
  match brief rules 1–5. The dimension coverage line is over-claimed; see M1 and M2.

## Re-check of dd924421 (fix commit)

Read-only: read from the commit (`git show dd924421:…`), not the working tree; no Gradle. Paths as above.

**Verdict:** H1, M1, M3 and the fixed Lows are fixed. M2 is fixed as asked, but its "Open full record" leaves the form and loses it (new
**H2** below). Fix H2 before merge; the rest is Low.

### Findings

| Finding | Status | Note |
|---|---|---|
| H1 refusal on a field the short form lacks | **Fixed** | `NeoQuickAdd.visibleError` shows the hidden field words (they win over "1 field needs attention"); both panels use it. "Open full record" no longer saves, so a stuck code clash can be fixed in the full sheet. Test now asserts the shown text. |
| M1 empty list has no picker | **Fixed** | `columns(keepEmpty)`; `LineDimensionPickers` keeps an empty column only when `quickAdd?.port?.canCreate(c, catalog) == true`. Without the right, or with no quick-add provider, it stays hidden (test `anEmptyListKeepsItsPickerOnlyForSomeoneWhoMayAddTheFirstValue`). `hidden()`, `extraColumns` and the journal grid still use the default (no empty columns), which is right: the journal grid has no quick add, and a value picked into an empty column has no name in the empty catalog, so no duplicate caption is drawn. |
| M2 dimension panel lacks "Open full record" | **Fixed, but see H2** | Added via `DimensionOpenHub`. |
| M3 Save grey without a reason | **Fixed** | The code and name rules are drawn under the fields (`valueProblemText`, the Dimensions page's keys). |
| L1 open-full flag never reset | **Fixed** | The flag is gone. |
| L2 closing during a save | **Fixed** | Cancel, outside-dismiss and "Open full record" are off while busy. |
| L3 receipt actor/owner | Not fixed (left on purpose, report says so) | Display only. |
| L4 key names and literals | **Fixed** | `accounts_quick_add_*`, `accounts_dimension_quick_add_*`, `core_label_code` gone, the three add labels in resources. Small leftover: the dimension panel still uses `core_label_name` while `core_label_name` exists. |
| L5 stale KDoc | **Fixed** | |
| L6 valid-from | **Fixed** | Company's today, written in building-blocks. |
| L7 full sheet's edits not reaching the form | **Fixed** | The full new-record sheet's `onSaved` picks the record. |
| L8 no Compose tests | Not fixed (backlog) | |

### New problems

**H2. A dimension value's "Open full record" throws away the document being edited.**
- **Path:** `DimensionQuickAdd.kt` `save(thenOpen = true)` creates the value, picks it on the line, then `hub.openTab()` =
  `selectTabFromPage(AccountsTab.Dimensions)` (`AccountsRoute.kt:697`). That asks the shell for the Dimensions destination, so `area`
  becomes null and `areaBody` (the Receivables/Payables page) leaves the composition.
- **Effect:** every caller of `LineDimensionPickers` is an editor held in that area page (bill, debit note, payment, invoice, credit note,
  receipt). Their view models are `remember(p)`-ed in `PayablesHost` / `ReceivablesHost` and closed in `onDispose`. No Accounts editor
  registers a `NeoLeaveGuard`, so nothing asks. A new, unsaved bill is lost entirely, including the value just picked; an edited draft
  loses its unsaved changes. Coming back through the menu lands on the list, not the editor.
- **Brief:** breaks rule 2 ("the form underneath keeps its state"), the one rule quick add exists for.
- **Fix:** open the full value panel (`DimensionValuePanel`, create mode, code and name carried over) as a side panel over the form, the
  same pattern as the supplier and customer sheets, and pick the value when it saves. Or drop the link from the dimension panel and record
  the exception in building-blocks. The building-blocks text ("for dimension values it saves, picks, then opens the Dimensions tab")
  must change with it.

**Low**
- **N1. Pending open request can go stale.** `AccountsDimensionsTab` waits with `holder.state.first { Loaded }`. If the load fails, the
  request is never cleared, and a later visit to the tab opens that value's panel by surprise. Clear it on failure, or after one try.
  (Moot if H2 removes the hub.)
- **N2. Full-sheet path drops the bank-approval toast.** The full new-supplier/customer sheet can take bank details on create
  (`savedWithBank`). The Suppliers screen then says "Its bank details wait for approval."; the quick-add host's `onSaved = { saved, _ -> … }`
  ignores `withBank`, so nothing says it. Show the same toast.
- **N3. Code rule shows on open.** The name is prefilled from the typed text, so "or a name is there" makes the code-missing error show
  the moment the panel opens, before the person has touched anything. Showing it after the code is touched or after a Save attempt
  would be calmer; a prefilled name over the length limit, on the other hand, still greys Save with no reason until the name is touched.
- **N4. Hidden field words have no field name.** `visibleError` joins plain words such as "Use up to 2 characters." without saying which
  field (country, terms). Prefix the field's label for `VALIDATION` refusals.

### Checked and fine
- "Open full record" (supplier, customer) no longer saves first: it opens `SupplierSheetHost` / `CustomerSheetHost` with `supplierId =
  null` and `initialName`; the new VM starts with that name; its save calls `onSaved` (picks) and then `onClose` (ends the flow). The form
  underneath stays; the quick VM is closed when the panel is swapped out; nothing is created twice.
- The empty-list picker stays hidden without the right in every case: no provider, `canCreate` false, or the account does not take the
  dimension (`takes` filter still applies after `keepEmpty`).
- No stale key names remain in any `values*` folder.
