# Review of the Accounts Phase 3 M5 plan (`m5-plan.md`)

Reviewer: Claude (Opus 5.5), 3 Nov 2026. Read-only review of the Codex plan dated 2 Nov 2026.
Checked against: B (`accounts-b.md` C-6, C-17, C-18, C-22, C-26, C-34, C-36, C-39, C-42…C-44, §7.3, §7.15–7.18,
§8, §11, §14 build notes, B-FBR amendment), C (`accounts-c.md` C-3, C-4, C-11, C-12, C-15, C-21, C-23, C-25, C-27,
§7.10, §7.11, §14 SC3/SC4 build notes incl. the 1480 finding, N-19), A1 (C-16, §6.7, FH-6), `plan.md`, and the
backend at `6171c3d` (dev): V26, V27, V28, V31, V35, V43 SQL; `AllocationCore.kt`, `PostingEngine.kt`
(`reverseInTransaction`), `Posting.kt` (`LineTaxTag.reversed`), `ArReportJdbcAdapter`, `ApReportJdbcAdapter`,
`DocumentSeries.kt`, receipt/payment draft and posting services, `CustomerService.kt`; packs 2026.2
`country-rules.csv` and the six country charts; user-service V43 codes. App: AC-BC §4.12–4.15, §5.7a.
Migration heads: dev ends at V50; V51 (payee verification, `3311980`) exists on another branch, so V52 is the
next free number, as the plan says.

## Verdict: READY-AFTER-CHANGES

The plan is careful on V43, refusals, idempotency and lock order, and most entries are right. It is not ready as
written for five reasons: it misses the customer bank-details flow that refunds depend on (F1); the first advance
receipt will break the AR ageing reconciliation because customer advances (2900/2420) are AR-kind accounts and the
split is scheduled last (F2); the C-42 deduction method gives wrong VAT when the rate changes between the advance and
the supply (F3); a write-off recovery reversal would report the VAT clawback in the write-off's period (F4); and a
receipt or payment reversal can strip the source from a posted refund (F5). All five can be fixed inside the plan and
small contract amendments. No finding needs a new design round.

## Findings, ranked

| # | Sev | Plan section | Problem | Fix |
|---|---|---|---|---|
| F1 | **High** | §4 (bank snapshot), §6 M5-B3 | The customer bank-details change-request flow (B §7.4, X-5, ERP-26.3: first details saved as a PENDING request, second-person approval, 30-day editor = contributor, audited reveal) **is not built**. `CustomerService.kt:100` says so; there is no `customer_bank_change_requests` table (only suppliers have one, V31:124), although V35 already seals the customer columns. The plan assumes the flow exists (`BANK_DETAILS_PENDING`, `bankDetailsEditorCannotApprove`) but has no slice for it. Without it every customer has no details and every refund takes the cash/cheque path; the C-39 fraud guard is untestable. | Add slice **M5-B0 customer bank details** before B3: a migration with the request table (sealed exactly like V35's supplier requests), the request/approve/reject/reveal/history endpoints mirroring SC2 (`SupplierBankChangeService`), evidence and notice reuse, and the app customer-sheet section (AC-BC LR-S10). If Jabran prefers to defer it, B3 must ship cash/cheque-only and say so; see decision D1. |
| F2 | **High** | §1 gap 4, §6 M5-R, §7 | `CUSTOMER_ADVANCES` (2900 NO/DK/FI/PK/IS, 2420 SE) has **control kind AR** in every chart, just as 1480 is AP. `ArReportJdbcAdapter` (lines 156, 165) sums every AR-kind account, so the first posted advance receipt (B1) makes `difference ≠ 0` in AR ageing and fires the ageing metric. The plan names only the AP side and leaves the AR split to M5-R, after B1–B4 and C0–C3. | Move the AR split (`advancesControl`, B §11.1) into **B1**, by mapped role account ids as the plan already proposes for AP. Keep the AP split in C0 before C1. Each slice must leave "ageing = control" true. |
| F3 | **High** (money) | §3 rows 2 and 6, vector, Q8 | C-42/C-25 tax the **whole** supply at the final document's rate and deduct the advance at the advance's rate. When the rate changes in between (FI 24 → 25.5 % in 2024, SE food rate change in 2026, PK each Finance Act), the advanced part ends up taxed at the new rate. Under EU VAT Art. 65 (SE, DK, FI) and PK s.2(44) the advanced part is taxed when paid, at the rate then. Example: advance 100 net at 12 %, supply 200 net at 6 %: the method gives total VAT 12, the right figure is 18. "VAT counted once" holds only when the rates are equal. | For M5: refuse an `ADVANCE_DEDUCTION` whose advance rate differs from the rate of the supply line(s) it offsets (422 `ADVANCE_RATE_CHANGED`, "Make the remaining invoice by hand: the advance was taxed at {old} %"), on both AR and AP. Record a contract open point for B C-42 / C C-25 (tax the advanced part at the advance rate). Add a test vector with a rate change. Decision D3. |
| F4 | **High** (tax period) | §3 "Write-off recovery", M5-B4 | The engine's reversal copies every tag (`LineTaxTag.reversed()` only negates the base), so the recovery RV keeps the write-off's `tax_point_date`. The re-charged output VAT then lands in the write-off's VAT period, which may be filed, instead of the recovery period (SE/NO/DK/FI all charge it when the money comes back; NO/DK/FI packs use `CORRECT_EARLIER`). | The recovery must stamp `tax_point_date = reversalDate` on its TAX lines. Options: an engine reversal option "tax point = reversal date" used only by `AR_WRITE_OFF` (needs an A1/E note), or a forward WO-recovery posting that mirrors the lines. Recommend the engine option (smaller, keeps one RV). Raise the same question for refund reversals with E's owner, but do not block on it. Test: `recoveryTaxPointIsRecoveryDate`. |
| F5 | **High** | §5 item 5, §4 refusals | A receipt or supplier payment that a posted refund consumed can still be reversed: the existing reversal undoes **every** active allocation, including the one into the refund (`target_refund_id`). The refund would be left posted with no source, breaking "a refund is allocated in full", and the money would be counted twice. The same holds for reversing an opening credit/debit item (R2-2) used by a refund. | Refuse such reversals with 409 `SOURCE_REFUNDED` ("Reverse refund {RFD-…} first"); add the check to `ReceiptPostingService` / payment reversal / opening-item reverse, and test it in B3/C3. Add it to B §7.14 and C C-14. |
| F6 | Medium | §5 item 3 | The plan's refund lock order (sources, then the refund) is right and matches the rule "sources before targets", but it contradicts B §7.16, which says "refund row, sources then advance lines". | Keep the plan's order and amend B §7.16 (and the C §7.11 mirror) in the B3 docs commit, so builders do not follow the old text. |
| F7 | Medium | §4 idempotency | The plan makes draft **creates** compare a body hash (changed body → `IDEMPOTENCY_KEY_REUSED`) and adds client-hash columns. Every existing create (receipts, payments, bills, invoices) follows A1 §6.7: same person + key → same draft, **whatever the body**. Body comparison exists only for engine postings (A1 C-16) and allocation requests (V30). Mixing the two rules in one module confuses the app. | Keep A1 §6.7 for refund and advance creates (no hash column); approval re-reads and re-checks everything anyway. Posting keys and engine hash comparison as the plan says. If Jabran wants body comparison on creates, do it module-wide in its own change. This shrinks the refund-draft migrations. |
| F8 | Medium | Q8 | Q8 is simpler than the plan says. Treat `ADVANCE_DEDUCTION` lines as never creditable; a credit note credits only NORMAL lines at their own rate. The AR excess becomes credit on account, which a normal refund pays out without VAT. Check (SE vector): advance VAT 25 + final 50 − 25 − full credit 50 = 0. | Replace Q8 with a rule: deduction lines are not creditable (`CREDIT_LINE_NOT_ALLOWED`); the `full` credit-note mode skips them. That changes `ArDocumentDraftService` / debit-note service in B2/C2; add a test. No decision needed. |
| F9 | Medium | Q5 | B §7.17 says the recovery works "as the opening item correction of §8", and §8 applies the Owner rule (A1 R-12). The plan recommends failing closed. In a company with only the Owner (Sialkot today), a recovered debt could then never be recorded. | Apply the Owner rule as §8 does: Owner may confirm their own request with `ownerSelfApproval`, recorded on the WO, the journal, the audit and the event. Decision D4. |
| F10 | Medium | §3 write-off row, B4 | The relief split is underspecified. (a) It must be computed on what is still open per code after credit notes and advance deductions, not on the invoice's original gross. Otherwise mixed rates over-claim relief. (b) It must **not** use the credited counters: V28/V43 let them only grow, so a recovery could not give them back. (c) Per-code rounding with the last code taking the remainder. | Specify: relief per code = min(round(open share × rate/(100+rate)), tax still unrelieved on that code), where unrelieved = line tax − credited tax − deduction tax − active WO relief. Track relief through the WO's own lines, never the invoice's counters. Add vectors with mixed rates, a credit note and a deduction. |
| F11 | Medium | §3 rows 1, 5; §4 | PK withholding on advances is not handled. Payers in PK withhold s.153 income tax on advance payments, and buyers often withhold on advances they pay us. B §7.15 refuses withholdings on advances (`ADVANCE_FIELDS_NOT_ALLOWED`) and C §7.10 is silent. A PK advance therefore can't be recorded at its real cash amount. | M5: keep the refusal and give the fallback in words: a PK advance with tax withheld is entered as an ordinary receipt or payment on account (with its withholding), without advance VAT. Record a contract open point for withholdings on advances. Decision D5. |
| F12 | Medium | Q1, B1 | B-FBR: a qualifying PK advance needs an FBR advance receipt invoice; `fiscal_outbox` can only reference `ar_documents`. The plan blocks only "release". | B1 enforces it on the server: a taxed advance dated inside an active fiscal registration → 422 `FISCAL_ADVANCE_NOT_SUPPORTED`. The SE/DK/FI demo is unaffected. |
| F13 | Medium | §6 M5-F2 | G0-5 approved "states, outbox, Noop" for Phase 3. F2 adds a dispatcher with backoff, retry, REJECTED cancellation credit notes and concurrency tests. With Noop, nothing ever leaves PENDING, so all of that runs only against the test fake until Phase 5. | Keep F1: registration, PENDING + outbox at approval, issue-blocked flags, Noop, `required` for STRN. Defer F2 to the Phase 5 provider slice, or keep a minimal dispatcher with the test fake if Jabran wants the states shown end to end. Decision D6. |
| F14 | Medium | §6 M5-R | Reports come last, but every slice changes balances and statements (ADVANCE, REFUND, WRITE_OFF lines). With reports last, B1–C3 each ship with statements that disagree with balances. | Fold each slice's statement and ageing lines into that slice (B1 advances, B2 deductions, B3 refunds, B4 write-off/recovery, C1–C3 mirrors). Keep M5-R only for historical as-of consumption queries and the final reconciliation tests. |
| F15 | Medium | §3 row 5, Q4 | Internal inconsistency: the table says an untaxed supplier advance posts "G to advances", while Q4 says "no evidence means ordinary on-account payment". C-25 allows OUT_OF_SCOPE advance lines and requires the supplier invoice number only for taxed lines. | Rule: OUT_OF_SCOPE lines (no evidence needed) → `SUPPLIER_ADVANCES`. INPUT lines need the prepayment invoice number and date; without them, 422 (never silently converted). An on-account payment stays the user's explicit choice. |
| F16 | Low | Q3 | Moot: `ap_payments.series` has CHECK = 'PAY' (V31), so supplier advances already number in PAY. Only the document type and key name remain open. `SRF` is in the V31 schema (`ap_supplier_refunds.series`) but missing from `DocumentSeries.kt`; that is a code-only addition, with no migration. | Q3 reduces to the document type: `ADVANCE_PAYMENT`, key `ADVANCE_PAYMENT:{id}:1`. Fine as recommended. Drop "SRF series support" from V57. |
| F17 | Low | Q7, M5-C0 | GRNI accounts are INVENTORY-kind in every chart (`2450`/`2449`/`2961`). An owner row alone protects nothing, and Inventory already protects them. Adding the row now and reclassifying later costs two migrations on the same concern. | Recommend deferring the GRNI row and its reclassification together to the first Purchasing/Inventory checkpoint (amend C §14's 2026-10-31 note). C0 then needs no migration. Decision D7. |
| F18 | Low | §3, B1/B3/C3 legal content | The final invoice deducting an advance, and a refund of an advance, are legal corrections of the prepayment invoice (SE/DK/FI; PK via FBR). The deduction or refund line should freeze the advance's number and date for Phase 5 output. On AP, the supplier's credit note number is evidence for reversing advance input VAT. | Freeze `{advanceNumber, advanceDate}` on deduction lines and refund advance parts (the snapshot can live in the existing line JSON or new nullable columns in that slice's migration). C3: require `supplierCreditNoteNumber` when an advance part reverses input VAT. |
| F19 | Low | §4 refusals | NO/IS are hardcoded ("NO/IS … only OUT_OF_SCOPE"). The rule is the pack flag `tax_on_advances` (false also for base countries `*`). Also: in NO an issued *forskuddsfaktura* is VAT-able (mva-loven §15-9), so `false` is right only while NeoERP prints no prepayment invoice. | Use the pack flag. Add a Phase 5 verify note: NO/IS printing an ADV as an invoice needs VAT. |
| F20 | Low | §5 | The AR guard lets `deducted_gross`/`open_gross` move in any direction on a posted advance; AP lets them only grow. Q2's model is right. | V52 (in B2): one deferred constraint trigger per side checks that the counter equals Σ evidence (deduction lines on posted documents + parts of POSTED refunds), replacing AP's grow-only trigger. Arbitrary decreases then fail on both sides. |
| F21 | Low | §8 click-through 3 | Sialkot has only its Owner. A two-person refund there needs BE-14's seeded second person. | Name BE-14 seed (or a seed step in B3) as a prerequisite of click-through 3. |
| F22 | Low | §6 M5-0 | A foundation slice with no consumer builds the consumption model before anything uses it. | Merge M5-0 into B2 (first consumer: deductions) and the refund allocation path into B3. |

Things checked and found correct: the advance, deduction, refund, write-off (relief only where `bad_debt_relief`:
SE/NO/DK/FI/IS yes, PK and base no), supplier advance (N + U capitalised) and supplier refund entries and the SE
vector balance; tax extraction `round(G × r/(100+r))` with exact remainder on final consumption; `tax_on_advances`
pack values (PK/SE/DK/FI true, NO/IS false); refund of over-payment (receipt source, no VAT) vs credit note (VAT
reduced first, then refunded as credit); the inverted AllocationCore date rule for refunds (`TARGET_AFTER_SOURCE`
would refuse them today); V26 `ar_documents` allows REVERSED only for OPENING, so the WO-reversal migration is
needed; refund draft-settle tables are missing on both sides (V26/V31 have only receipt/payment draft allocations);
`ap_payments` has no prepayment-invoice **date** and only a non-unique index on its number, so the C1 migration is
needed; permission codes already exist (user-service V43), so no codes migration; V43 acceptance criteria;
single-currency CHECKs make FX a non-issue in M5.

## Corrected slice order and migration numbers

Numbers are slots, taken at commit time against the merged head (V51 is on another branch and must land first or
be re-checked). Backend queue in order; each app part follows its backend slice on mocks.

| # | Slice | Migration | Notes |
|---|---|---|---|
| 1 | **M5-B1** customer advance receipt + **AR advances control split** + fiscal-registration refusal for taxed advances; statement ADVANCE lines | none expected | F2, F12, F14, F19. App AP7-C1. |
| 2 | **M5-B2** final invoice deduction + consumption evidence (AR and AP guards) + deduction lines not creditable + rate-change refusal | **V52** `m5_advance_consumption` | F3, F8, F20, F22. App AP7-C2. |
| 3 | **M5-B4** write-off and recovery (Owner rule as §8, relief split, recovery tax point) | **V53** `m5_write_off_reversal` (WRITE_OFF may reach REVERSED; header guard) | F4, F9, F10. Independent of advances; can run before B2 if the queue is free. App AP7-B. |
| 4 | **M5-B0** customer bank-details change requests | **V54** `m5_customer_bank_requests` | F1. App: customer sheet bank section. Skip only under D1 = defer. |
| 5 | **M5-B3** customer refunds (lock order per F6, `SOURCE_REFUNDED`, ADV refs) | **V55** `m5_refund_draft_settles` | F5, F6, F7, F18, F21. App AP7-A. |
| 6 | **M5-C0** AP advances control split | none (if D7 defers GRNI); else GRNI row here | F17. App AP7-D0. |
| 7 | **M5-C1** supplier advance payment | **V56** `m5_supplier_advance_evidence` (prepayment invoice date; partial unique number index on SUBMITTED/POSTED) | F15, F16. App AP7-D1. |
| 8 | **M5-C2** final bill deduction (uses V52) | none | F3, F8 mirrored. App AP7-D2. |
| 9 | **M5-C3** supplier refunds received | **V57** `m5_supplier_refund_draft_settles` | F5, F18. App AP7-E. |
| 10 | **M5-R** as-of consumption queries and reconciliation tests | none | F14. App AP7-R (what remains). |
| 11 | **M5-F1** fiscal registration, PENDING + outbox at approval, Noop, issue block | **V58** `m5_fiscal_outbox_unique` (only if the schema audit finds a gap) | F13. App AP7-F1. |
| — | M5-F2 dispatcher/retry/REJECTED cancellation | — | Deferred to Phase 5 under D6 = defer. |

Unused slots are dropped, not left as gaps, before anything is applied.

## Decisions for Jabran (recommendation first)

- **D1. Customer bank details before refunds.** *Recommend: build them first (new slice B0).* Refunds pay money out
  to a customer's account. Without the approved-bank-details step, nobody checks where the money goes. The other
  choice is cash and cheque refunds only in M5.
- **D2. Contract fixes in one docs commit before B1.** *Recommend: yes.* B §7.16 lock order; "a receipt or payment
  used by a refund can't be reversed until the refund is"; deduction lines can't be credited; write-off recovery
  is reported in the recovery's VAT period.
- **D3. Advance taxed at one rate, invoice at another.** *Recommend: refuse that case in M5 and fix the rule later.*
  Today's rule gives the wrong VAT when a rate changes between the advance and the invoice. Refusing is safe; the
  person makes that one invoice by hand.
- **D4. Undo a write-off in a one-person company.** *Recommend: allow the Owner to confirm it themselves, recorded,
  as for opening-item corrections.* Otherwise Sialkot could never record that a written-off customer paid.
- **D5. Pakistani advances with tax withheld.** *Recommend: not in M5.* Record them as normal receipts or payments
  on account, and add withholding on advances to the contract later.
- **D6. FBR in M5.** *Recommend: only the states, the queue and the "not sent" placeholder.* Leave the
  sending/retry machinery for when the real FBR connection is built (Phase 5). The real connection still blocks
  any PK company with a sales-tax number from going live.
- **D7. GRNI control row.** *Recommend: move it to the first Purchasing/Inventory checkpoint*, together with
  reclassifying the GRNI accounts. On its own the row protects nothing.
- **D8. Duplicate-request keys on new drafts.** *Recommend: keep today's rule* (same person + same key gives the same
  draft), as for every other draft, rather than a new rule only for refunds and advances.
- Q2 (consumption evidence), Q3 (PAY series, `ADVANCE_PAYMENT`), Q4 (non-deductible VAT carried with the supplier
  advance), Q6 (no 1480 reclassification): *agree with the plan as recommended* (Q3 is already forced by the schema;
  Q4 with F15's rule). Q8 needs no decision (F8).
