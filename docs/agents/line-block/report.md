# LB-1 report: shared lines block

Commit (NeoERP-App, dev-app, not pushed): see SHA in the reply.

## What changed
- New `designsystem/components/NeoLinesBlock.kt`: `NeoLinesBlock`, `NeoLineColumn` (header, width/weight, numeric, required, narrowPair, per-line error, cell slot) and `NeoLinesRules` (wide over 760 dp, limit check, narrow row grouping). No feature imports.
  - Wide: header row, one row per line, remove icon button ("Remove line N"), Add line under the table.
  - Narrow: card per line headed "Line N", labelled fields, "Remove line" in the card.
  - `below` slot under each row/card (VAT split caption, account and dimension pickers, refusals). `limit` disables Add line with "At most N lines."; null `onAdd` hides Add line. `card = false` gives a sub-heading for editors that already sit in a card.
- Moved onto it: invoice, bill (LinesCard/LineHeader/LineEditor/LINE_WIDE/REMOVE_WIDTH copies removed), Pay in advance and advance receipt lines (limit 20 kept), on-account credit and debit note lines. Kept: dimension pickers, VAT split caption, bill reverse-charge/deductible captions, per-line refusals, account pickers, tax override fields.
- Strings (English): `core_action_add_line`, `core_action_remove_line`, `core_msg_line_limit`, `core_title_line`, `core_a11y_remove_line` (new files `strings_core_titles.xml`, `strings_core_a11y.xml`). The six old `accounts_advance_*` / `accounts_supplier_advance_*` add/remove/limit keys are deleted (same English, now core).
- Docs: "Lines block" in `docs/design/specs/building-blocks.md`; a "Lines" section in `AGENTS.md`.

## Tests
- `NeoLinesRulesTest` (commonTest, 3) and `NeoLinesBlockUiTest` (jvmTest, 5): wide and narrow render, add/remove/edit keep each line's own state, limit disables Add line and shows its reason, no `onAdd` means no Add line. All pass. `compileKotlinJvm` passes. No full suite run.

## Visible changes / open points
- Invoice and bill button text "Add a line" is now "Add line"; wide "Remove" text button is now an icon button.
- Narrow invoice/bill: Net and Tax are now labelled fields on one row instead of one "Net x · Tax y" line; description/qty/price lose their placeholder (the label carries the name).
- On-account notes: the wide row now has header labels and a remove icon (disabled on the blank last line). No Add line there (view model auto-keeps a blank line); no limit.
- Advance lines wide: Tax code column 200 dp, amount 140 dp; Android compile not run.
- Credit/debit note "against an invoice/bill" lines (`InvoiceLinesCard`, `BillLinesCard`) are not repeating-add lines and were left as they are.
