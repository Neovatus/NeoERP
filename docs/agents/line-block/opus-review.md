# LB-1 review (Opus): shared lines block, NeoERP-App 6d462025

Read-only review of `git show 6d462025` against `brief.md`, `report.md`, `NeoERP-App/AGENTS.md` and
`docs/agents/i18n/naming-standard.md`. No Gradle run. Paths below are relative to `NeoERP-App/composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/`;
line numbers are at 6d462025.

## High

1. **Wide rows have no accessible name for their fields (answer to the builder's a11y question: yes, something is lost).**
   `designsystem/components/NeoLinesBlock.kt:163` renders each cell with no semantics. The column name exists only once, in the
   visual header row (`:150`). In linear screen-reader order, the reader hears the headers once and then a run of unnamed edit fields for
   every line.
   - Invoice/bill (`receivables/InvoiceEditorScreen.kt:186-195`, `payables/BillEditorScreen.kt:258-267`): the placeholders "Description *",
     "Qty" and "Unit price (NOK)" are gone. They were the only text inside the field.
   - Credit/debit on-account notes (`receivables/CreditNoteEditorScreen.kt:164-168`, `payables/DebitNoteEditorScreen.kt:177-181`): the
     placeholders "Description" and "Net (NOK)" are gone.
   - Pay in advance / advance receipt (`payables/PaymentEditorScreen.kt:216-229`, `receivables/ReceiptEditorScreen.kt:344-355`): this one is worse.
     Before, each line had a `NeoField` label per field. In the 880 dp side panel the block is wide, so on desktop those per-line labels are gone.

   Failure: on a wide window, a VoiceOver/NVDA user reaches "edit text, blank" for Qty on line 3 with no way to tell which column it is.
   Fix in the block, not the editors: in `WideRow`, give each cell `Modifier.semantics { contentDescription = "<header>, line N" }` (a new
   `core_a11y_` key with args), or hand the header to the cell so `NeoInput` / `NeoSelect` can carry it.

## Medium

1. **The remove icon is under the touch floor on touch devices in the wide layout.** `NeoLinesBlock.kt:69,164`: `REMOVE_SLOT = 40.dp`
   wraps a `NeoIconButton`. That button asks for `max(sizing.button 40, neoTouchFloor() 44)`, and its `.size()` is clamped by the 40 dp parent.
   On Android/iOS, a window over 760 dp gets the wide layout: tablets, and large phones in landscape. There the hit target is 40 × 44,
   below the 44 dp floor the rest of the system keeps. The narrow card's `NeoButton` is fine, because it clamps to the floor and uses
   `minimumInteractiveComponentSize`. Fix: `REMOVE_SLOT = max(40.dp, neoTouchFloor())`, also in the header spacer (`:153`).

2. **Numeric read-only cells are not right-aligned, though the column says it is.** `NeoLinesBlock.kt:163` passes
   `Modifier.fillMaxWidth()` to every cell. For `NeoText` (which has no `textAlign`), a full-width text starts at the left, so
   `contentAlignment = CenterEnd` has no effect. Invoice/bill "Net" and "Tax" (`InvoiceEditorScreen.kt:208-209`, `BillEditorScreen.kt:280-281`)
   show their amount at the left of a 100/90 dp cell, under a right-aligned header. Amounts on different lines also don't line up by
   their last digit. The KDoc on `NeoLineColumn` ("header and cell sit on the right") is broken for every non-input cell. Fix: do not
   force `fillMaxWidth` on numeric cells, or wrap them so the text takes its own width.

3. **The narrow Discount hint is lost.** Before, the narrow invoice/bill used `NeoField("Discount", hint = "10 % or an amount")`. Now the narrow
   card builds the field from the column (`NeoLinesBlock.kt:189-193`), and `NeoLineColumn` has no `hint`. All that is left is the placeholder "10 %"
   (`InvoiceEditorScreen.kt:197-199`, `BillEditorScreen.kt:269-271`). Failure: on phone, nothing tells the user that a plain amount is also accepted.
   Fix: add `hint: String?` to `NeoLineColumn`, pass it to `NeoField` when narrow, and set it for Discount.

## Low

1. **Naming standard, rules 5 and 8, inside designsystem.**
   - `NeoLinesBlock.kt:171` glues `"${c.header}: $it"` for wide refusals. Rule 5 says never glue texts.
   - `NeoLinesBlock.kt:92` adds a new hard-coded English default, `title = "Lines"`, used by invoice, bill and both notes.

   Both now sit in a shared component that every module will reuse. Suggest a `core_fmt_` key for "%1$s: %2$s" and a `core_title_lines` key.
   This is the same pattern as the `InvoiceLineErrors.label` glue that already exists in the editors, which can wait for I18N-1.
2. **`core_msg_line_limit` is a count, but it is not a `<plurals>`** (rule 6). "At most %1$d lines." reads "At most 1 lines." if a limit of 1 is ever used.
   The only limit today is 20, so nothing fails now.
3. **The wide header's required mark is a plain "*"** (`NeoLinesBlock.kt:150`) in the tertiary colour. It does not use `NeoRequiredLabel`, so
   screen readers do not say "required" and the star is not the danger colour. On narrow, `NeoField` does both, so the two layouts disagree.
4. **The narrow "Remove line" button has no line number for screen readers** (`NeoLinesBlock.kt:199-202`). Every card says the same
   "Remove line". Give it `core_a11y_remove_line` as its content description, as the wide icon has.
5. **Test gaps.**
   - `NeoLinesBlockUiTest.addRemoveAndEditKeepEachLinesKey` checks keys on the wide layout only. Narrow cards (the phone path) are not covered.
   - No test covers a column `error` landing on the right line after a middle remove (the Payment `adv.<key>` refusal).

   The key test itself does tell a keyed block from an unkeyed one: `remember` is seeded from the line key.
6. **The trailing blank line on the on-account notes.** Its remove control is disabled with no reason, and on phone the blank line is counted as "Line N".
   This is cosmetic, see "Open points" below.

## Open points from the builder

- **Null `onAdd` on the credit/debit notes: acceptable.** `removeOnAccount` / `editOnAccount(-1)` in `CreditNoteEditor.kt:219-222` and
  `DebitNoteEditor.kt:241-244` always keep one blank line open, and before LB-1 there was no Add line either. The spec documents it
  (building-blocks "Lines block" item 4). No backend line limit was found to enforce there.
- **Changed texts and placeholders on invoice/bill.**
  - "Add a line" → "Add line" and "Remove" → icon are fine. The icon has "Remove line N".
  - On narrow, the dropped placeholders are replaced by real `NeoField` labels, which is better.
  - On wide, the placeholders were the fields' only names. See High 1.
  - The lost Discount hint is Medium 3.

## Checked and fine

- **Nothing else lost.** Every editor keeps its account picker, `LineDimensionPickers` (tags `*.dim` unchanged), Payment VAT split caption,
  Receipt VAT preview, bill reverse-charge and deductible captions, and per-line refusals (`InvoiceLineErrors`, `view.problem`, invoice
  `view.taxProblem`, Payment `adv.<key>`). All of these are read by `line.key` inside the `below` slot or the column `error`.
  No tax override field existed in these six editors before the commit (grep of the parent), so none can be lost.
  The test tags `invoice.line.<key>.tax/.account/.dim`, `bill.line.<key>.*` and `credit.`/`debit.<key>.*` are unchanged.
  No existing UI test referenced the removed texts or tags.
- **20-line limit.** Payment and Receipt pass `MAX_ADVANCE_LINES`. At the limit, Add line stays, is disabled, and shows "At most 20 lines." beside it.
- **Keys.** Each line is composed under `key(lineKey(line))` (`NeoLinesBlock.kt:111-118`). Cells and the `below` content read their own
  line by key, so a remove in the middle does not move values between lines. The `.line.N` and `.remove.N` test tags are positional, which is fine for tags.
- **Layouts.** The Payment and Receipt side panels are `wide = true` (880 dp), so desktop gets the table. Phone gets cards.
- **Architecture.** `NeoLinesBlock.kt` imports only designsystem and generated `Res`, like `NeoQuickAdd.kt`. The five core keys follow
  `core_<kind>_<meaning>` with arg comments, in `strings_core_<group>.xml` files, and no English text is duplicated.
  The six deleted `accounts_(supplier_)advance_{add_line,remove_line,line_limit}` keys have no remaining reference in code or in any
  `values-*` folder.
  The AGENTS.md "Lines" rule and the building-blocks entry are present.
