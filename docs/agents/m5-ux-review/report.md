# Accounts M5 app screens — UX/design review

Date 4 Nov 2026. Read-only review (Opus) of `NeoERP-App` `dev-app` at `4d44ccef` (range `1f13145e~1..HEAD`, `composeApp`);
not compiled or run, so phone/iPad/desktop behaviour is judged from the components used. Authority, in order:
`docs/handover/design-principles.md` → `ux-principles.md` (§14, §21, §22 binding) → `screen-standard.md` → tokens and
components → `specs/accounts-b-c.md` (§4.2, §4.5, §4.9–4.12, §4.14, §5.7a) and `screen-rig/accounts-bc.jsx` (BcWriteOff
:1602, doc detail :1305–1530, money detail :1632–1760, money editor :2410–2600, statement/ageing :2940–3010) →
`NeoERP-App/.claude/CLAUDE.md`. Paths below are relative to
`composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/` unless noted.

## Verdict per screen

| Screen | Verdict | Main reasons |
|---|---|---|
| Write-off sheet (AP7-B) | Approve with fixes | Errors are grey captions at the bottom, not on the field; no period line; extra Save draft button |
| Invoice detail with write-offs, write-off detail, undo (AP7-B) | **Changes required** | Write-off listed as "Credit note WO-…"; invoice closed by a write-off shows green "Paid"; loose "Written off … as WO-…" links; actions hidden instead of disabled with a reason |
| Advance receipt editor (AP7-C1) | Approve with fixes | Footer prints the raw typed amount; VAT preview has no rate; policy-failure notice is a dead end |
| Advance receipt detail | Approve with fixes | Only total deducted, not which invoices; zero rows shown; no tax code or rate |
| Receipts list with advances | Approve with fixes | "{amount} open" missing; "Advance" tag even when filtered; Type select has no label |
| Advance deduction, invoice editor (AP7-C2) | Approve with fixes + rig sync | Own "Advances" card instead of the rig's grid row (acceptable); notice tones and "the server checks it" wording |
| Deduction lines on invoice detail | Approve with fixes | Hand-concatenated "−" |
| Open-advance source sheet | Approve (nice only) | — |
| AR ageing advances control, customers, customer statement | Approve with fixes | AR control has no amounts or fix (AP has); balance note always on and repeated; wording drift |
| AP ageing, supplier list/sheet/statement (AP7-D0) | Approve with fixes | Good three-state strip; advances positive in the list, negative elsewhere; terms drift |

## Must fix

- **M1 Write-off shown as a credit note.** `data/mapper/SalesDocumentMapper.kt:59` merges `writeOffs` into
  `creditNotes`; `receivables/SalesDocumentDetailScreen.kt:205` labels each "Credit note". Word rows by kind ("Written off
  WO-…", negative; pending "Write-off WO-DRAFT-… · Waiting for approval"), number as a link, delete the loose loop at
  `:66–69` (§21 one place per fact).
- **M2 Invoice settled by a write-off reads "Paid".** `SalesDocumentDetailScreen.kt:143`, `SalesDocumentsList.kt:117–119`
  only know Credited/Paid; the rig `bcSettle` (:843) has neutral "Written off". Add it to detail and list; test.
- **M3 Write-off errors not on the field.** `receivables/WriteOffSheetScreen.kt:50–59`. Use `NeoField(error=…)` /
  `NeoInput(isError=…)` for Amount, Date, Evidence and `NeoReasonField` for Why; reason error only after blur or submit;
  rig wording "Only {open} of {INV} is still open." Same for the recovery date caption at `SalesDocumentDetailScreen.kt:360`.
- **M4 Advance editor footer shows the raw typed amount.** `receivables/ReceiptEditorScreen.kt:75`. Format in the view
  model; text "Received {x} · lines {y} · of which VAT {z}" (VAT part only when not zero).

## Should fix

- **S1** Write-off and undo hidden instead of disabled (`SalesDocumentDetail.kt:117,130`): show disabled with a reason
  (spec §4.3, rig :1379–1380, §15).
- **S2** No visible waiting state after Ask to undo: neutral notice per rig :1429 and the disabled More item.
- **S3** Undo wording vague (`strings_accounts_writeoff.xml:31`): "{INV} is open again"; show the requester's reason as a
  labeled row (`SalesDocumentDetailScreen.kt:356`).
- **S4** Posted write-off consequence in future tense (`:337`): past-tense strings; `writeOffCountryName` falls back to
  "this country", not the ISO code (`WriteOffSheetScreen.kt:66`, §9).
- **S5** Write-off sheet: period line under Date; drop Save draft (or sync rig; clips at 390); title shows "Write off ?"
  while loading — pass the invoice number from `ReceivablesHost.kt:169`.
- **S6** Deduction card: offer notice neutral not Info (`InvoiceEditorScreen.kt:323`); load failures as slim error with Try
  again, not Warning (`:320`, `:362`); replace "The server checks it again…" with "Up to {x} is still open."; blocker
  messages from strings, not English in the VM (`InvoiceEditor.kt:428–430`); no "save the draft to check VAT" step; draft
  link not in past tense.
- **S7** Advance receipt detail (`ReceiptDetailScreen.kt:286–296`): table Description · Tax code and rate · Amount incl.
  VAT · VAT; one row per deduction "{INV} deducted −x" with link; then Open; hide zero VAT/Deducted.
- **S8** Receipts list (`ReceiptsList.kt:64–67,85`, `ReceiptsListScreen.kt:110`): "{open} open" and blank Allocated/Left
  for advances; no "Advance" tag when filtered; label the Type select; "Receipts" from strings; one document-type filter
  pattern across lists (spec: `NeoMultiSelect`).
- **S9** Advance editor policy failure: add Try again (`ReceiptEditorScreen.kt:92`, `strings_accounts_advance.xml:5`).
- **S10** Advance editor lines: VAT preview with rate; rig subtitle (NO/IS variant); disabled Add line with reason at the
  20-line limit; `vm.advanceTax` out of the composable.
- **S11** AR advances control (`AgeingScreen.kt:54–55`): shared three-state strip with amounts and a Journals link, as AP
  (`ApAgeingScreen.kt:99–106`); spec §4.11 explanation line.
- **S12** Customer balance note only when a customer has an advance (`CustomersScreen.kt:82`); in the sheet replace the
  repeated note (`:212`) with "Advance · open {amount}".
- **S13** One term and one sign for advances: supplier list positive (`payables/Suppliers.kt:136`) vs negative elsewhere;
  "paid/received ahead" vs spec "Advances · open". Unify the term, drop "ahead", negative beside a balance.
- **S14** Use `f.money(-x)` instead of prepending "−" (`SalesDocumentDetailScreen.kt:176–177`).

## Nice

N1 duplicate imports (`SalesDocumentDetailScreen.kt:16–17/22–23`); N2 "Owner's own" as neutral pill; N3 "(two people)"
on the write-off two-person line; N4 toast after write-off submit — align with rig one way; N5 "What it's for"; N6 nb/sv
translations; N7 one hard-coded-English sweep in touched composables; N8 no "Write-off" pill when filtered; N9 advance
source sheet key wraps on phone; N10 three footer buttons at 390.

## Keep

`NeoDialogSheet` + `NeoResponsiveForm`; money through `formats.money` (except M4, S14); reason rules 6–500 with "Kept
with…" hint; explicit audited Owner tick; two-step two-person undo; refusals from fixed strings; empty columns hidden,
zero buckets blank; Record advance in More and as quiet second action; the AP three-state strip; no hard-coded colours;
state in view models.

## Rig sync-back (`screen-rig/accounts-bc.jsx` + `specs/accounts-b-c.md`)

1. Write-off sheet (:1602): Save draft decision; Evidence "(optional)" wording; go-live "no stored VAT" consequence.
2. Write-off detail facts card (Why, Evidence, Undo requested/confirmed by, Recovery date, Owner's own, consequence, Open {INV}).
3. Undo: two sheets (Ask to undo; second-person Undo with Recovery date and Owner tick); "Write-off undone" pill; "Undo requested" timeline entry.
4. Invoice More: disabled "Credit: undo the write-off first".
5. Invoice editor deduction (:1986, :2100): redraw as the built "Advances" card, or move code to the grid row.
6. Advance source sheet (new).
7. One type-filter pattern (:1193, :1293).
8. Advance editor (:2410–2547): footer, policy-unavailable error, Add/Remove line, 20-line limit.
9. Customers: conditional balance note; "Advance · open" item.
10. Statements (:2950): align footer terms per S13.
11. AP7-D0: Advances paid column; supplier-sheet advance lines; "posted by journal" and "differs" strip states.
12. AR ageing advances control three states (after S11).
13. Receipts list advance row (:1258): keep; code follows (S8a).
