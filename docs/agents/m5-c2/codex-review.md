# M5-C2 second review

**Verdict: changes requested.** H1 is fixed; L2 and part of L1 remain.

Reviewed backend `fb263aa..932f496` and app `081bc8a6..49353fce`, both on `claude/m5-c2`, with clean working trees. Locations refer to those worktrees.

## High

None found.

## Medium

**L2 — the one-cent fix can exhaust deductible VAT before the advance is fully consumed.**

- **Where:** backend `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/bill/BillAdvanceDeductionService.kt:139`; journal branch at lines 231–250.
- **Reproduction:** an advance of **0.15**, at 25% VAT and 30% deductible, stores net 0.12, VAT 0.03 and deductible VAT 0.01. Deduct **0.05**: the new rule takes net 0.04, VAT 0.01 and the entire deductible cent. Deduct the remaining **0.10**: net 0.08, VAT 0.02, deductible VAT zero. `journalLines()` credits 0.10 with a **NET** tag, although the original advance had a **TAX** tag with base 0.12. Under accounts-e.md C-4, the combined signed base becomes **−0.02 instead of zero**. Money balances; tax-base evidence does not cancel. The original L2 failure has moved to the remainder.
- **Fix:** prevent a partial deduction from exhausting deductible VAT while leaving VAT that would subsequently take the NET path; require the full remainder when necessary, or preserve the original base through another valid posting representation. Align the app. Extend `aTinyPartOfAPartlyDeductibleAdvanceKeepsTheTaxPath` with this vector and assert combined tax-base evidence, not just zero open gross.

## Low

**L1 — tax-resolver refusals still use NORMAL-only indexes.**

- **Where:** backend `services/accounts-service/src/main/kotlin/com/neovatus/accounts/application/service/payables/bill/BillRules.kt:539`.
- **Reproduction:** save `[deduction, NORMAL]`, with NORMAL net 1,000, VAT rate 25%, typed VAT 251.50 and no override reason. Submit returns `TAX_OVERRIDE_REASON_REQUIRED` with index **0**, identifying the deduction; the correct index is **1**. `typedTaxes()` passes the filtered list to `BillTaxResolver.resolve()` and lets its exception escape before applying `positions`. Existing tests establish the override-reason refusal; the new L1 test covers only draft discount validation.
- **Fix:** remap resolver refusal indexes through `positions`, including integer lists and indexed objects. Add an interleaved-lines submit test. Non-blocking, as in the first review.

## Checked and correct

- **H1:** V57 skips allocation-only header changes, retains evidence-changing headers and counter checks, and checks both child parents. Ordinary credited-line updates have no advance ID to lock. The deterministic allocation test would fail without the filter; a payment-versus-second-bill race is also present.
- **M2/M3:** signed subtotals follow the approved rule. V57 sums INPUT non-deductible tax, checks affected documents on header/line/tax changes, and retains nonnegative payable totals and posted immutability. Existing V56-valid rows satisfy the replacement immediate constraints; V52–V56 are unchanged. Zero-total NO/SE tests cover journals and reconciliation; NO also covers allocation exclusion/refusal.
- **M1:** save and approval use the bill tax point and pack rule: later payment/invoice for SE/DK/FI, invoice for PK, payment for NO/IS. The new negative test covers SE; explicit-tax-point, approval-recheck and other-country negative cases are not demonstrated.
- **L4/L5/L6:** app math matches server rounding, remaining-share limits and exact remainder using the new DTO fields, including the L2 limitation. Editor/detail payment links require PAYMENT.READ. Deduction wording comes from resources, with injected-word tests.
- Tenant-scoped advance reads/locks, restricted picker payloads and changed backend/app DTOs remain aligned. L3 stays deferred.

**Verification limits:** no suites or database migrations run. L2 was reproduced with decimal arithmetic and source tracing, not an API test. A compiled-code probe could not construct the sealed tenant-scope fixture. Fresh/populated V57 upgrades, negative direct-SQL subtotal probes and VAT-report output were not independently verified; the added tests do not establish those checks.
