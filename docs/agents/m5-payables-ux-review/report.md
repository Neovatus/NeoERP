# Accounts M5 payables (AP7-D1, D2, E, R): UX/design review

Read-only review of `m5-r-app`, branch `claude/m5-r`, at a4447162 (range `4d44ccef..HEAD`). I did not compile or run anything, so phone, iPad and desktop behaviour is judged from the components used. Paths are relative to `composeApp/src/commonMain/kotlin/com/neovatus/neoerp/app/features/accounts/presentation/` unless noted.

## Verdict per screen

| Screen | Verdict | Main reasons |
|---|---|---|
| Pay in advance editor (AP7-D1) | Approve with fixes | Still has the three problems fixed on the AR advance editor: raw-style footer, policy error with no Try again, Add line hidden at 20. New wording is hard-coded English. |
| Advance payment detail (AP7-D1/D2) | **Changes required** | The section is headed "Deducted and refunded" but only lists bills, so Open does not add up. Six-column card, not the AR shape. "Advance paid ahead". |
| Payments list with advances | Approve with fixes | Type filter is an unlabeled `NeoSelect`, not `NeoMultiSelect`. "Advance" pill shows even when filtered to advances. Pay in advance is hidden instead of disabled. |
| Bill editor, Advances card (AP7-D2) | Approve with fixes | Notice tones not aligned with the AR fixes (Info offer, Warning load failure). The hint lacks "is still open". |
| Bill detail deduction lines | Approve with fixes | "−" is glued onto the amount by hand (S14 again). |
| Advance source sheet (AP) | Approve with fixes | VAT shows even at zero. Failure uses the Warning tone. |
| Refunds received list (AP7-E) | Approve (nice only) | Good: no Waiting tab, exception-only pills, three empty states, Record disabled with a reason. |
| Record refund received editor (AP7-E) | **Changes required** | Post refund posts in one click with no confirmation. Credit-note error shows before any attempt. "VAT given back" means different amounts in the row and the footer. No period line. |
| Refund received detail (AP7-E) | **Changes required** | Preparers cannot reach Delete draft. Raw ids can show. Load failure is a dead end. Reversal shown as a Warning notice. |
| AP/AR ageing advances strips (AP7-R) | Approve with fixes | "See the journals." sits next to the new "Open journals" link. AP has no explanation line. Control wording differs between AR and AP. |
| Supplier list / sheet / statement (R) | Approve | "Advances open" is negative beside the balance everywhere (S13 is done for AP). |

## Must fix

- **M1 Post refund has no confirmation.** `payables/SupplierRefundsScreen.kt:278–281` calls `vm::post` directly. The rig gates it with "Post refund for {cur} {x}? It gets the next number and goes into the books for {period}." (`docs/design/screen-rig/accounts-bc.jsx:2668–2674`). Add a `NeoDialogSheet` confirmation.
- **M2 The advance payment omits supplier refunds.** `payables/PaymentDetailState.kt:48–49` builds the list from `deductions` only. `refunds` is mapped (`domain/model/PaymentModels.kt:51`, `data/mapper/PaymentMapper.kt:108`) but never shown. The heading is "Deducted and refunded" (`payables/PaymentDetailScreen.kt:129`), so Open does not reconcile. Add "{RFD} refunded −{x}" rows (`accounts_advance_refunded_row`), each linking to the refund.
- **M3 Delete draft can't be reached.** `payables/SupplierRefundsScreen.kt:78` sends anyone with `prepareRefund` from a draft row to the editor, which has no Delete. Delete exists only on the detail page (`:420`), which only non-preparers reach, and for them it is disabled. Add Delete draft to the editor, or open drafts on the detail page. The AR refunds have the same gap (`receivables/RefundsHost.kt:80`).

## Should fix

- **S1** Supplier's credit note shows a red error as soon as VAT goes back, before Post is tried (`SupplierRefundsScreen.kt:327–333`, `SupplierRefunds.kt:328`). Mark the field required and keep the reason in the footer. Show the error only after Post or blur.
- **S2** "VAT given back" means three different things:
  - Row: total tax (`SupplierRefunds.kt:311–312`).
  - Footer: the deductible part only (`:322–324`).
  - Detail: "VAT given back X (claimed Y)" (`SupplierRefundsScreen.kt:447`), which is a third wording and differs from the editor's "claimed back from you; … part of the cost".

  Use one term and one sentence.
- **S3** Raw ids are shown when a number is missing (`SupplierRefunds.kt:292, 301`; `SupplierRefundsScreen.kt:445, 448`). Use the draft reference or the kind word. The numbers on the detail should open the document.
- **S4** There is no period line under "Date received" (`SupplierRefundsScreen.kt:300–304`). The rig has `AjPeriodLine`, and the AR refund Date has one.
- **S5** Refund received detail:
  - Load failure is an error notice with no Try again (`:391–394`; §22 wants `NeoFailureState`).
  - The editor's `loadNotice` uses the Warning tone (`:288`).
  - The reversal is a Warning notice with the reason inline (`:398–405`). The rig has a neutral Reversed fact plus a "Reason given" quote.
  - The subtitle reuses the editor's (`:412`). Use "Refund received from a supplier".
  - Disabled reasons are glued on with " — " (`:486`). Use `NeoMenuAction.description`.
  - An unknown timeline kind shows the raw code `e.kind` (`:461`).
- **S6** Bring the Pay in advance editor in line with the AR fixes (M4, S9, S10):
  - Footer "Advance lines X · Paid Y" (`PaymentEditorScreen.kt:72`) should read "Paid {x} · lines {y} · of which VAT {z}".
  - Policy failure is a dead end (`:91`; the string says "Close and reopen this form…"). Add Try again.
  - Add line is hidden at the limit (`:213`). Disable it with "At most 20 lines."
  - The amount input has no `isError`.
- **S7** Bring the bill Advances card in line with the AR S6 fix:
  - The offer notice is Info (`BillEditorScreen.kt:401`). Make it neutral.
  - The load failure is Warning (`:395`). Make it a slim error with Try again.
  - The hint "Up to {x}" should be "Up to {x} is still open." (`strings_accounts_supplier_deduction.xml`, `sdeduction_limit`).
  - The input (`:419`) has no `isError` and is not end-aligned.
- **S8** `"−" + f.money(…)` again (S14 from the last review) at `BillDetailScreen.kt:187, 203, 206`. Use `f.money(-x)`.
- **S9** AP advance source sheet:
  - VAT shows even when zero (`BillAdvance.kt:42`).
  - Failure uses the Warning tone (`:49`).
  - Line description is used as a row label. Match the AR sheet: each line as a heading with Including VAT, VAT (only above zero) and Open.
- **S10** The advance payment detail card (`PaymentDetailScreen.kt:103–121`, six columns) differs from the AR advance detail. The AR shape is: Description · Tax code and rate · Amount incl. VAT · VAT, then the deducted/refunded rows, then Open. Use one shape; the claimed/not-claimable split can be a caption.
- **S11** One set of advance terms, AR and AP (S13 leftovers):
  - "Advance paid ahead" (`strings_accounts_supplier_advance.xml` `kind_value`, used at `PaymentDetailScreen.kt:181`): drop "ahead".
  - "Advance paid" (card), "Advance payment" (sheet) and "Advances": pick one.
  - "What it is for" vs AR "What it's for".
  - Refund kind "Payment on account" vs the payment detail's "Credit with supplier".
  - AP control "advances account balance" vs AR "net".
- **S12** Advances strips:
  - `…_control_outside` (AP and AR, `strings_accounts_advance.xml:34`) ends with "See the journals." and now sits beside an "Open journals" button. Drop that sentence (the rig has only the link).
  - The AP Matches state has no explanation line (`ApAgeingScreen.kt:107`). AR has one, and the rig shows it for both.
- **S13** Payments list:
  - The Type filter is an unlabeled `NeoSelect` (`PaymentsListScreen.kt:115–122`). The decision is `NeoMultiSelect` "Type", as on Invoices and Receipts (rig :1288).
  - The "Advance" pill shows even when filtered to Advances, and it is hard-coded (`PaymentsList.kt:70`).
  - Pay in advance is hidden without the right. Refunds received shows its button disabled with a reason; do the same.
- **S14** New hard-coded English, all in the same panels that otherwise use strings:
  - `PaymentWording.kt`: the advance block (`EVIDENCE_*`, `ADVANCE_IN_USE`, `ADVANCE_POST_EXPLANATION`, `NO_VAT`, `advanceSplit`, `duplicateAdvance`).
  - The advance refusal texts in `PaymentRefusals`.
  - `"No prepayment invoice"` and `"Advance deducted"`.

  Move them to `strings_accounts_supplier_advance.xml`.

## Nice

- N1 Some strings leave the apostrophe unescaped (`srefund_refused_tax_path_part`, `sdeduction_tax_path_part`, `supplier_advance_control_outside`), while others use `\'` and the AR strings use ’. Pick one.
- N2 The deduction VAT note shows positive amounts while the line's Net and Tax are negative (`SupplierDeductionWords.kt:68–73`).
- N3 The Pays back input is wider (`selectMinWidth`) than its column's 140 minimum, and has no accessible label (`SupplierRefundsScreen.kt:371`).
- N4 `BillDetailScreen.kt:62` uses a fully-qualified `DocumentButtons`.
- N5 The `openAdvances` filtering happens in the composable (`BillEditorScreen.kt:399`). Move it to the view model.
- N6 An advance row's kind is replaced by its description (`SupplierRefunds.kt:308`). Show "Advance payment · {description}".
- N7 Three footer buttons plus a caption at 390 in the refund received editor (same as the last review's N10).
- N8 "Supplier name or code" / "Customer name or code" placeholders are hard-coded (`ApAgeingScreen.kt:52`, `AgeingScreen.kt`). They predate this range.
- N9 nb/sv translations of the three new strings files.

## Keep

- **Refunds received:**
  - One person, no Waiting tab.
  - Drafts and Reversed chips hide at zero; Posted carries no pill.
  - First-use, filtered and status empty states.
  - Record is disabled with a reason, not hidden.
  - Errors sit on each Pays back row, and server refusals land on the row they name.
  - Post's blocker shows in the footer; uncertain-result wording; reason 6–500.
  - The pure `SupplierRefundEditorRules`.
- Supplier list, sheet and statement show "Advances open" negative beside the balance.
- The Open journals link is gated on journals host plus read right (`AccountsRoute.kt` `journalsLink`).
- A payment opened from a bill is read-only, and the link needs PAYMENT.READ.
- Deduction words come from strings through `SupplierDeductionWords`.
- Blank Qty and Price on deduction lines.
- Components: `NeoSidePanel`, `NeoDialogSheet`, and `NeoDataTable`, which switches to cards on a phone.
- No hard-coded colours; status colours come from tokens.
- No custom glass (system defaults only).
- State lives in view models.

## Rig sync-back (`docs/design/screen-rig/accounts-bc.jsx` + `docs/design/specs/accounts-b-c.md`)

1. Refunds received list (:1248–1290): decide the subtitle (spec §5.7a has one, design pass R-8 says no list subtitle). Built shows a "Settles" column with "Balances x · advances y"; the rig shows "Pays back" with references.
2. Record refund received editor (:2600–2675): Supplier's reference; Supplier's credit note, required when VAT goes back; Everything; footer "Received x = balances + advances (VAT given back y)"; the one-cent preview note; Save draft. Keep the rig's Post confirmation (M1).
3. Refund received detail (:1806–1810): the "What it paid back" card with VAT parts, History, Delete draft with a reason.
4. Pay in advance editor: the prepayment invoice number and date section, and the evidence-missing notice. Spec §5.7a still has the older "paid on account" sentence.
5. Advance payment detail (:1772–1777): settle on one AR/AP shape (S10), including refund rows (M2).
6. Bill editor Advances card and AP advance source sheet: the AP version of the AR card and sheet (rig items 5 and 6 of the last review).
7. Bill detail deduction line: "Advance {ADV} deducted", date · "−{x} including VAT", blank Qty and Price, the VAT claim note.
8. Payments list: Pay in advance in More and as the empty state's second action, the Advance tag. The rig already has the `NeoMultiSelect` Type filter, so code follows (S13).
9. Spec "UX review 2026-11-04" closing paragraph: "Not in the app yet … a Journals link in the advances control strips" is now stale, since M5-R built it. Also add the AP explanation line (S12).
