# QA-1 quick add: report

Commit: 2ea9b638 on dev-app (NeoERP-App), not pushed. Built on top of fc51832d (not reverted).

## What changed
- **Shared (A):** `designsystem/components/NeoQuickAdd.kt`: `NeoQuickAddPanel` (NeoSidePanel; error notice on top, footer Open full record / Cancel / Save, content slot) and `NeoQuickAdd` pure rules (`offer`, `prefill`, `canSave`). `NeoSearchSelect` drops `onAdd` when `toolbar = true` (never in filters).
- **Pickers (B):**
  - Supplier: bill editor, debit-note-on-account step and the new payment editor use `SupplierQuickAddHost`.
  - Customer: invoice editor, credit-note-on-account step and the new receipt editor use `CustomerQuickAddHost`.
  - Name only, typed text prefilled. They reuse `SupplierSheetViewModel` / `CustomerSheetViewModel` (new `initialName` param), so create call, rights, duplicate checks and errors are identical to the full sheet. No bank details.
  - "Open full record" saves, picks, then opens the record's own sheet over the form.
  - Dimensions: `DimensionQuickAdd` plus a shared scope provided by `ProvideDimensionCatalog`. `LineDimensionPickers` gets an "Add value" row (code + name) only with the right: cost centre create, projects MANAGE, company values MANAGE and FREE_DIMENSIONS on. Added values show at once in every line.
  - The scope is wired from `AccountsRoute` through `DimensionCatalogSource.quickAdd` and the lookups' `dimensionQuickAdd`.
- **Bug (C):** `visibleStatus` no longer draws "No matches" (the list pane's "Nothing matches “x”." is the only line; screen-reader text unchanged).
- **Docs (D):** ux-principles §23 picker bullet, building-blocks "Empty picker" plus new "Quick add" block, AGENTS.md "Pickers" rule.
- **Text (E):** new core keys `core_action_open_full_record`, `core_action_save`, `core_action_cancel`, `core_msg_saving`, `core_msg_quick_add_subtitle`, `core_label_name`, `core_label_code`; module keys `accounts_supplier_title_quick_add`, `accounts_customer_title_quick_add`, `accounts_dimension_title_quick_add`. English only. Existing hard-coded text was not moved. The "Add supplier / Add value" row labels are still literals, as before.

## Tests run (jvmTest, targeted)
NeoQuickAddTest (new), payables.QuickAddTest (new), PaymentEditorViewModelTest, PaymentEditorDimensionsTest, AdvancePaymentStateTest, NeoDateFieldTypingTest (NeoInput), NeoSelectSemanticsTest, NeoSelectToolbarTest, NeoPageStateRulesTest, SuppliersAndBankTest. All pass (after fixing one wrong expectation in my new test). The first runs hit a Kotlin daemon OOM; passing needed `-Pkotlin.daemon.jvmargs=-Xmx5g`.

## Open
- **Empty dimension lists:** `DimensionCatalog.columns` hides a picker with no values, so the first value of an empty cost centre, project or company-dimension list cannot be quick-added from a line. Fixing it means showing the picker for people who may create; not done.
- **Not quick-added:** the editors' own cost-centre cell (`withCostCentre = false`) and the report filters (by rule).
- **Customer actor name:** receipts opened from the Receipts host pass no actor name (only `isOwner` on the main panel), so the customer sheet behind "Open full record" has the same limits as before there.
- **Compose UI tests:** the checks are commonTest rules and view-model tests; no Compose UI test of the add row or panel was added.
- **No manual run:** the app was not run, so the panel layout has not been looked at.

## Fixes (after the Opus review of 2ea9b638)
- **H1:** the supplier and customer panels show a refusal aimed at a field they lack (`NeoQuickAdd.visibleError`, field words win over "1 field needs attention"). "Open full record" no longer saves first: it opens the full new-record sheet (`initialName`) with the typed name, and that sheet picks the record on save, so it works after a refusal. The test now asserts the visible text.
- **M1:** `DimensionCatalog.columns(keepEmpty)`: an empty cost-centre, project or company-dimension list keeps its line picker (add row only) when `DimensionQuickAdd.canCreate`; hidden otherwise.
- **M2:** the dimension panel has "Open full record": saves, picks, then opens the Dimensions tab on the value (`DimensionOpenHub` provided in `AccountsRoute`, read by `AccountsDimensionsTab`).
- **M3:** the code rule (and the name rule) is written under the field; the code rule shows once the code is touched or a name is there.
- **Lows:**
  - **L1:** the open-full choice is gone (no more flag to reset).
  - **L2:** Cancel and closing are off while saving.
  - **L4:** keys renamed (`accounts_quick_add_*` file, `accounts_dimension_quick_add_*` in the dimensions file); `core_label_code` dropped; the "Add supplier / Add customer / Add value" labels are in resources.
  - **L5:** the stale `visibleStatus` comment fixed.
  - **L6:** quick-added values are valid from the company's today; written in building-blocks.
  - **L7:** the full sheet's save picks the record, so the label is refreshed.
- **Left as is:** the receipt actor and owner flag, the Compose UI tests (backlog).
- **Tests run:** NeoQuickAddTest (5), payables.QuickAddTest (12), PaymentEditorViewModelTest, PaymentEditorDimensionsTest, AdvancePaymentStateTest, NeoDateFieldTypingTest, NeoSelectSemanticsTest, NeoSelectToolbarTest, NeoPageStateRulesTest, SuppliersAndBankTest, DimensionRulesTest, DimensionsTabHolderTest. All pass.

### Fixes after the re-check of dd924421
- **H2:** the dimension quick-add panel no longer has "Open full record". The full value panel belongs to the Dimensions tab (its state holder, rights and page), so running it over an editor would need a large refactor. `DimensionOpenHub` and its wiring (`AccountsRoute`, `AccountsDimensionsTab`) are removed, which also closes N1. The exception is written in building-blocks.
- **N2:** the full-sheet path keeps `withBank` and shows the same "bank details wait for approval" toast (supplier and customer).
- **N3:** the code and name rules show only after the field is touched or Save is pressed; Save stays pressable and pressing it with a problem shows the rules.
- **N4:** hidden-field refusals are prefixed with the field's label ("Code: …"; `NeoQuickAdd.visibleError(labels)`).
- **L4 leftover:** the dimension panel's Name uses `core_label_name`.

## Journal grid

Gap: quick add for dimension values was only in `LineDimensionPickers`; the journal editor grid had none.

- `JournalEditorContext` gains `quickAdd: DimensionQuickAdd?` (set from `JournalsPageHolder.dimensionQuickAdd` in `JournalsHost`). `extraColumns` and `canAddCostCentre` keep an empty project, company-dimension or cost-centre column for someone who may add its first value; `JournalEditorRules` uses them (rights come from `DimensionQuickAdd.canCreate`, the same rule as the line pickers: COST_CENTER create, DIMENSIONS.MANAGE for projects, MANAGE plus FREE_DIMENSIONS on for company values).
- `JournalEditorBranch` provides `ProvideDimensionQuickAdd` around the editor. `JournalLineGrid` cost centre, project and company-dimension cells (wide grid and phone cards) pass `onAdd` and the existing `accounts_dimension_action_add_value` label to `NeoSearchSelect` and open the existing `DimensionQuickAddPanel` (typed text prefilled, valid from the company's today). The created value is kept in the shared scope (shows in every line's list) and picked on that line through `vm.setCostCentre` / `vm.setDimension`; nothing else in the journal state changes. No second view model, no new strings.
- Branch and stock location are not quick-added (Org setup).
- Tests: `JournalQuickAddTest` (empty cells kept only with the right, per-list rights, FREE_DIMENSIONS off, value picked with description, account and amounts kept). Ran `*journals.state.*`, `*journals.route.*`, `*payables.QuickAddTest`.
- Not covered by an automated UI test: the panel itself in the grid (no journal grid compose test exists); worth a manual check as Owner typing `P-900` in a Project cell.
