# Lines block: Account column and Tags toggle (2026-11-08)

## What changed
- `NeoLinesBlock` (designsystem): `tags: NeoLineTags<L>?` (toggle at the row end, per-line-key state), `wideAbove`, `LocalNeoLinesWide`,
  column flags `display` (Net/Tax label and value right-aligned together in a card) and `ownLabel` (bordered picker draws its own label),
  `NeoInlineTags` for lines outside a block, pure `NeoLinesRules.tagsView`.
- Shared accounts code: `LineAccountColumn.kt` (`lineAccountColumn`), `lineTags(...)` in `dimensions/LineDimensionPickers.kt`.
- Editors: invoice, bill (account column, tags, tax code bordered in cards, compact in rows), on-account credit and debit notes (account column,
  tags for held values only, Tax picker as the tax code), receipt and payment advance lines (tags), receipt and payment fee/difference lines (`NeoInlineTags`).
- Strings (English): `core_action_tags`, `core_a11y_tags_line`.
- Docs: building-blocks "Lines block" 3a-3d, AGENTS.md one sentence.

## Lines with values
Chose the compact read-only summary ("Cost centre: OSL-OPS · Project: P-900"), clicking opens the pickers. It keeps tall rows out of a
filled invoice, and the toggle's state never jumps when a value is cleared. Held and Remove values show inside the opened pickers.

## Notes
- Threshold unchanged at 760 dp. Invoice/bill: Discount is hidden in the table until a line has one or "Add discount" is tapped (cards always show it); numeric columns narrowed; Description:Account 3:2.
- Credit/debit "from a document" (hand-built rows, no NeoLinesBlock, account row only under Lines basis) are unchanged: they have no
  dimension pickers and no narrow layout yet. Follow-up if wanted.
- Advance lines have no account picker, so only Tags applies there.

## Tests
`NeoLinesTagsUiTest` (new: pure rule, toggle per key, summary opens, no toggle when not taggable, middle remove keeps state, narrow cards),
`NeoLinesBlockUiTest`, accounts receivables/payables editor tests, dimension tests, resource tests: all green (jvmTest, targeted).
