# Polish batch 2026-11-08 (NeoERP-App, dev-app)

One commit (SHA in the reply). Not pushed. English strings only.

1. Thousands gap: all amounts already went through the company format. The Nordic separator is U+202F, which Inter Tight draws about 2 px wide, so it vanished in sentences and key/value rows. `NeoText` and `NeoKeyValueList` now draw a separator between two digits as a no-break space (`neoVisibleDigitGroups`); "25 %" is untouched. Display only. Cause was inferred from the font metrics, not seen on screen: please eyeball it. Other `Text` call sites that do not use NeoText are not covered.
2. Branch row on invoice, credit note, bill, debit note, receipt and payment detail, only with more than one active branch. `ProvideDocumentBranches` (new, in AccountsAreaPage for both sides) reads the existing `lookups.branches`; `LocalDocumentBranches` feeds the screens. Refund detail not included.
3. `dimensionCodeAndName` shows code once when code equals name; used by DimensionLabel, DimensionValue.label, dimension panels, journals and report pickers.
4. Payments/receipts status column widened (250 dp; refunds 190 dp). The marks logic already gave "Waiting for approval" on an unfiltered list, so the likely cause was the narrow column squeezing the second pill; I could not reproduce. Added a test for a submitted advance. If it still shows only "Advance", check whether a status chip is selected (then the pill is hidden by design).
5. Advance line Tax code: `NeoSelectOption.closedLabel` shows only the code in the closed field (receipt and payment advance lines); the list keeps code and name.
6. Dimensions overview: a set-up slot shows "Company dimension N" (`accounts_dimension_label_company_slot`).
7. Picker panel: with nothing listed the panel is sized for one row (three only for skeleton or failure); the no-match box no longer pads vertically.
8. One Clear filters: toolbar button only while rows exist; the text line keeps it (ux-principles section 23). Done for receivables, payables, refunds, ageing, customers, suppliers and journals.
9. Credit and debit note on account lines start on the company default tax code (`defaultTaxCodeId`); a line holding only the default is still the open blank line.
10. Compact pickers show the chevron at rest (LC-21 updated in list-controls.md).
11. NeoLinesBlock wide header: numeric headers get end padding and a text header after a numeric one gets start padding, both the field's inner padding.

Tests run (jvmTest, targeted): PolishNov8Test (new: digit groups, one-word value, branch fact, credit and debit note default tax), PaymentsListAgeingStatementTest (new advance case), NoteEditorsDimensionsTest, CreditAndDetailTest, DocumentBranchTest, NeoSelectListHeightTest, BillsAndDebitNotesTest, NeoMoneyFormatTest: all pass. No full run, no UI check. Left out of the commit: NeoSidePanel.kt, NeoStickyFooter.kt, NeoFooterLayout*.kt (other builder).
