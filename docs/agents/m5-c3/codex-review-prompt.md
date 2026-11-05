# Codex second review — M5-C3 supplier refunds received

Role: independent second reviewer. READ ONLY: do not edit code, commit, push or run migrations against shared databases. The only file you write is your report: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/m5-c3/codex-review.md`.

## What to review
- Backend: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/m5-c3-be`, branch `claude/m5-c3`, commit `8c67d59` only (its parent `932f496` is M5-C2, reviewed separately). New migration `V58__m5_supplier_refund_requests.sql` (accounts-service). V52–V57 must stay unchanged.
- App: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/m5-c3-app`, branch `claude/m5-c3`, commit `7ee90051` only.
- Plan: `docs/agents/accounts-phase3/m5-plan.md` §3–§5 and the M5-C3 row of §6 (its "V57" slot is now V58). Contract: `docs/api/accounts-c.md` in the backend worktree. Domain: `docs/domain/RULES.md`.
- Customer-refund twin already on dev (M5-B3, V55, RefundController) for comparison.
- Decisions: VAT given back on an advance part posts to the advance's frozen input-VAT account (tag ADVANCE_REFUND), even after a remap. One person posts a supplier refund received (no approval step). Supplier bank details are revealed only to PAYMENT.CREATE/APPROVE holders.
- Builder choices to judge: create idempotency per A1 §6.7 without a client hash (same person + key → same draft whatever the body, as customer refunds); new 422 `SUPPLIER_CREDIT_NOTE_REQUIRED` when deductible VAT goes back.

## Focus
1. Money and VAT: journal per case (SE 25 %, partly deductible, NO/IS untaxed, PK 18 %), exact remainder across several partial refunds, tax point = refund date, refusal when the advance's VAT tax point is after the refund date.
2. V58 and triggers: commit-time check on POSTED (full allocation, totals = parts, credit note), V56 evidence extension (deductible VAT given back by bills + refunds never exceeds the advance's; last use exact), interplay with the V57 "evidence changed?" guard — any path that locks advance lines after balance rows (deadlock), any gap open to direct SQL.
3. Reverse: exact-once restore of every allocation and advance part; refusal of reversing a payment a posted refund settles (409 SOURCE_REFUNDED); races (refund vs bill on the same advance line; refund vs payment reversal).
4. Reports: statement = balance = ageing including refunds and their reversals at historical dates.
5. Security: rights per endpoint (PAYMENT.REFUND / PAYMENT.REVERSE / reads), tenant isolation in every query, bank-match adapter scope, audit/events.
6. App: matches server rules; disabled-with-reason actions; words in strings; no String.format / putIfAbsent / assert( in commonMain (they break iOS).

Tests: do NOT run full suites (builder: accounts-service 1677 / 0 failed; app 3059 with 1 known unrelated env failure). Run a single test only if you add a probe or doubt a result.

## Report format (`codex-review.md`)
Verdict (approve / changes requested), then findings High / Medium / Low, each with file:line, a concrete failing scenario and a suggested fix; then "checked and correct". Plain English, short.
