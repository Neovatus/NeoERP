# LB-1: One shared lines block for document editors (approved by Jabran, 2026-11-08)

**Why.** With several lines, the Pay in advance, advance receipt, and on-account credit and debit note editors stack every line as a full block of fields. Invoice and bill already show a column header with one row per line (wide window over 760dp) and cards on a narrow one. Each of them has its own copy of `LinesCard` / `LineHeader` / `LINE_WIDE`.

## Scope (NeoERP-App, dev-app, in the checkout)

1. **Shared component.** Put one shared lines block in `designsystem/` (no feature imports).
   - **Columns:** declared with a header label, a weight or width, numeric/right alignment and a cell slot.
   - **Wide:** a header row, one compact row per line, a remove icon button at the row end with an a11y label, and **Add line** under the table. The disabled state at the limit carries its reason, for example "At most 20 lines."
   - **Narrow:** one card per line with the heading "Line 1", "Line 2", … and Remove in the card.
   - **Under a row:** an optional slot for a caption (the VAT split) and the dimension pickers.
2. **Editors.** Move the invoice and bill editors, plus the four editors above, onto it. Remove the per-editor copies. Journals keep `JournalLineGrid`.
3. **Docs.** Add a "Lines block" entry in NeoERP-App/docs/design/specs/building-blocks.md, and one line in NeoERP-App/AGENTS.md: every editor with repeating lines uses it.
4. **Text.** New texts follow docs/agents/i18n/naming-standard.md, English only.
5. **Tests.**
   - Add, remove and edit per row keep their keys.
   - Wide and narrow both render (use existing test patterns).
   - The limit disables Add line with its reason.

Run targeted tests only. Commit, but do not push.

**Rules:** the same as docs/agents/quick-add/brief.md. Report to docs/agents/line-block/report.md.
