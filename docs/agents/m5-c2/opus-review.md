## M5-C2 adversarial review: supplier advances deducted on final bills

**Verdict: changes requested.** One High finding needs a migration before merge. The posting maths, the split rounding, the V52/V56 evidence guards, tenant isolation, the open-advances rights and the debit-note refusal are all correct. Nothing was edited, committed or pushed.

**Tests (all green):**
- **Backend** (m5-c2-be @35e7616), one in-process Gradle run with -Xmx4g: BillAdvanceDeductionTest 12, AdvancePaymentTest 18, ApAdvancesControlSplitTest 10, BillDraftApiTest 6, BillApprovalTest 7, BillDuplicateTest 6, BillContentTest 3. Total 62 passed, 0 failed, 0 skipped.
- **App** (m5-c2-app @ece60330), jvmTest with max-workers 1: SupplierAdvanceDeductionTest 18, BillsAndDebitNotesTest 31, SupplierAdvancesControlTest 7, AdvancePaymentStateTest 13, PaymentDetailAndAllocateTest 15, PaymentRefusalsAndDtoTest 13. Total 97 passed, 0 failed.

### HIGH

**H1. AP consumption guard still has the deadlock that the B2 review found on AR and V55 fixed for AR only.**
- **Where:** V56__m5_supplier_advance_evidence.sql:157-195 (`ap_advance_consumption_guard`) together with V52:359 (`trg_ap_documents_consumption`). V55__m5_refund_draft_settles.sql:3-11 and 98-121 added the "evidence changed?" filter to the AR guard. The AP guard has no such filter.
- **What happens:** every UPDATE of a posted bill that carries deduction lines takes `FOR UPDATE` on its advance lines when the transaction commits. That includes a payment or debit-note allocation changing `open_amount`. By then that transaction already holds the engine's `account_period_balances` row locks (exclusive upserts; `PostingEngine.kt:333`, `BalanceJdbcAdapter.kt:56`).
- **Scenario:**
  1. Tx A approves a payment to posted bill B1, which deducted advance line L. It locks the AP_CONTROL balance row, then at commit the trigger asks for L.
  2. Tx B approves bill B2, which deducts the rest of L. It has already locked L (`lockSources`) and now waits on the AP_CONTROL balance row.
  3. Postgres detects the deadlock (40P01). Nothing handles 40P01, so the loser gets a 500. M5-C3 supplier refunds will hit the same thing.
- **Before C2 this could not happen:** AP had no deduction lines, so the trigger did nothing. C2 makes it live.
- **Fix:** add V57 mirroring V55 item 3 for the AP guard:
  - Check `ap_documents` / `ap_supplier_refunds` / `ap_payments` only when status, party, currency or date changes.
  - Check children (`ap_document_lines`, `ap_document_line_taxes`, refund parts) only under a posted or reversed header.
  - Always check counter rows.
- **Test:** add the two-transaction test that m5-plan.md:169 requires. It should race payment allocation (or debit-note allocation) to a partly deducted bill against a second bill deducting the same advance line. The existing races (BillAdvanceDeductionTest:293-345) do not cover this.

### MEDIUM

**M1. The VAT reversal can fall in an earlier period than the VAT claim.**
- **Where:** BillAdvanceDeductionService.kt:72-79 checks only `paymentDate <= bill date`. The trigger checks `posting_date >= payment_date`. Neither looks at the advance's own input-VAT tax point, which `SupplierAdvanceRules.taxDate` (lines 91-103) sets to the later of payment and invoice date (SE/DK/FI) or the invoice date (PK). The deduction's TAX line is put on the bill's tax point (`BillRules.prepare`, `taxPointDate = document.taxPointDate ?: date`).
- **Scenario (SE, monthly VAT):**
  1. Advance paid 25 Mar; prepayment invoice dated 3 Apr, so its VAT is claimed in April.
  2. Final bill dated (or with tax point) 31 Mar deducts the advance. The VAT reversal lands in March, before the claim.
  3. March and April are each misstated, although the two periods net to zero.
  - The same happens when the bill's tax point is before the advance's payment date.
- **On your tax-point question:** reversing on the bill's tax point is correct in principle for SE, DK, FI and PK. The final invoice's period carries the full VAT claim and the reversal of the prepayment VAT, so the net is the remaining VAT. AR is safe because its advance tax point is the receipt date.
- **Fix:** refuse with `ADVANCE_INVALID` when the advance's tax date is after the bill's tax point. The alternative is to date the reversal at the later of the two, but refusing is cleaner. Check it in `price()`, passing the tax point, and again at approval.

**M2. `ADVANCE_EXCEEDS_BILL` blocks realistic full settlements.**
- **Where:** BillAdvanceDeductionService.kt:174-186.
- **Who it hits:**
  - **NO/IS:** advances are untaxed, so a 100 % prepayment (1 000 against 800 + 200 VAT) can never be fully deducted. At most 800 can be deducted; 200 stays open on the advance and the bill still asks for 200. There is no way to clear this except a manual journal. That is a core prepayment case for those markets.
  - **SE/DK/FI:** the extra rule "non-deductible VAT above VAT" (stricter than V31, which only requires ≥ 0, V31:454) refuses fully covered bills when the advance's deductible percent differs from the bill's. Example: advance 100 % deductible against a bill that is 50 % deductible. It can also refuse on a 0.01 per-line rounding difference.
- No wrong postings result: the system refuses rather than storing wrong figures.
- **Fix:** take this decision with H1 in the same V57: mirror AR's `ck_ar_documents_subtotals` and `ar_check_advance_invoice_totals` for AP BILL/CREDIT (signed net, VAT and non-deductible subtotals that must match the deduction lines). Then drop the non-deductible-above-VAT refusal, or limit it to what the DB guarantees. Until that lands, keep it as the open point for Jabran, with NO/IS release gated on it.

**M3. No test posts a bill fully covered by advances.**
- **Gap:** no backend test posts a bill with total 0, which is the path with no `AP_CONTROL` line (BillRules.kt journalLines `if (document.total.signum() != 0)`; prepare accepts total 0 only when there are deductions). The closest is line 229 (NO, net 0, total 200).
- Reading the code, it looks correct: V31 allows `total >= 0` and `open_amount = 0`, the journal balances, and statement, balance and ageing stay consistent.
- **Fix:** add one test that posts a total-0 bill and asserts the journal, the statement/balance/ageing equality, that no payment allocation is offered or accepted, and the VAT lines.

### LOW

- **L1. Refusal indexes are not mapped back to request positions.**
  - **Where:** `BillRules.priceLines` → `priceNormalLines` (positions filtered) and `prepare` → `typedTaxes(ordinary)`. Refusals for NORMAL lines are indexed within the NORMAL-only list; AR remaps them to the full list.
  - **Impact:** harmless for the app today, which always sends NORMAL lines first and deductions last (BillEditor.kt `draft()`; error mapping at `i - sentLines.size`). Any other API client that puts a deduction first gets the error pinned to the wrong line.
  - **Fix:** map the index through `positions`, a cheap change that keeps AR and AP the same. Not blocking.
- **L2. A tiny partial deduction can be tagged differently from the advance.** On a partly deductible advance, a very small partial deduction can round the deductible share to 0 (BillAdvanceDeductionService.kt:212-243). It then takes the NET path, crediting the gross with a NET tag. The advance itself posted a carrying amount plus a TAX line with base = net. The VAT-report base reversal can therefore be off by cents in that edge case. Totals and accounts are still correct.
- **L3. Statement goes wrong once AP bills can be reversed (not reachable today).** AP bills cannot be reversed yet, but the reports already read `status IN ('POSTED','REVERSED')`. The statement adds an `ADVANCE_DEDUCTED` credit with no reversal row, and `BILL_REVERSED` debits only the bill's net-of-deduction total. Once bill reversal is built, the statement stops equalling the balance, and the advance's open amount must also be restored.
  - **Fix:** record these points in the backlog for the bill-reversal slice.
- **L4. The app's live split before save differs from the server's.** BillEditor.kt `deductionSplit` uses `deductiblePercent`, while the server uses the advance's own deductible-to-VAT proportion with remaining-amount limits. The app also does not cap the deductible part at what is left, and does not pre-check `ADVANCE_FULL_REMAINDER_REQUIRED`. This is display only: the server's figures replace it after save. The maths is correctly kept in the view model.
- **L5. The advance-payment link in the bill editor and detail is shown to everyone.** It is offered to bill preparers who lack `PAYMENT.READ`; they get a 403 shown as a sheet notice. Nothing leaks, but it is a dead end.
  - **Fix:** pass the access rights and hide the link without `PAYMENT.READ`.
- **L6. English text written in code, not in the strings file.** Examples: `deductionTaxNote` ("VAT …: you can claim …", BillDetailScreen.kt), the three view-model blocker messages and `BillDeductionErrors.NOT_POSITIVE` (BillEditor.kt), and the new `PayablesRefusals` notices (PayablesSupport.kt). This matches older payables code, but contradicts the new strings file's own rule that the words come from strings in the reader's language.

### Checked and correct

- **Journal:**
  - Deductible advance: CR the frozen `SUPPLIER_ADVANCES` account with net + non-deductible VAT; CR the frozen input-tax account with the deductible VAT (`TAX`, base −net, `ADVANCE_DEDUCTION`, rate and deductible percent).
  - Nothing deductible: CR the gross with a `NET`/`ADVANCE_DEDUCTION` tag.
  - Each mirrors how the advance posted (`SupplierAdvanceRules.kt:288-311`).
  - For a 0 %-deductible advance the tax row's account is NULL, because the advance's frozen tax account is NULL (V56 constraint).
  - V56's rule "tax row account = frozen tax account" holds for every split.
  - The validator's frozen-account allowance after a remap is in place (`PostingLineValidator.kt:100-104`).
  - The bill balances: DR supply gross = CR `AP_CONTROL` total + CR deductions.
- **Split:**
  - Partial: VAT = round(G × r / (100 + r)), capped at what remains.
  - The deductible floor/ceiling keeps both deductible and non-deductible VAT within what remains (floor ≤ remaining deductible always holds).
  - A deduction of the full open amount takes exactly the remaining net, VAT and deductible VAT.
  - This satisfies V52's exactness rule (`used = gross ⇒ used_net = net and used_tax = tax`).
- **V52/V56 triggers are satisfied:** kind BILL/CREDIT, same supplier and currency, `posting_date >= payment_date`, frozen number/date/account snapshot, `open_gross = gross − used`, and `deducted_gross` equal to the posted lines.
- **Lock order:** setup row (FOR SHARE) → advance payments → advance lines (id order) → bill → supplier (FOR SHARE). This agrees with payment approval and reversal (setup → payment → targets). Approval checks `seen.version == locked.version`, so the locked lines are the lines being posted. Advance reversal against a deduction serialises on the payment row. The only lock-order defect is H1.
- **Reports:** ageing advances (gross and carrying, net of deductions posted by the as-of date), the statement `ADVANCE_DEDUCTED` row and `balanceAsOf` are consistent with each other, and the advances control reconciles.
- **Isolation:** every new SQL statement filters on `company_id`. Another company's advance line returns 404.
- **Open advances read (`GET /suppliers/{id}/open-advances`):** needs `BILL.CREATE`, `BILL.UPDATE` or `PAYMENT.READ`. It returns only the supplier's posted, still-open advance lines, with no bank, payee or payment-list details. Another company's supplier returns 404.
- **Debit notes:** an explicitly credited deduction line is refused 422 `CREDIT_LINE_NOT_ALLOWED`, at draft and at approval. `full` credits NORMAL lines only, and the app filters deductions out of the debit-note editor.
- **M5-C1 re-check item 5** (prepayment invoice date checked before the lines are re-taken) is done in both submit and approval.