# Codex second review — M5-C2 fixes (supplier advances deducted on final bills)

Role: independent second reviewer. READ ONLY: do not edit code, commit, push or run migrations against shared databases. The only file you write is your report: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/m5-c2/codex-review.md`.

## What to review
- Backend: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/m5-c2-be`, branch `claude/m5-c2`, range `fb263aa..932f496` (C2 build 35e7616 + fixes 932f496). New migration `V57__m5_ap_advance_guard_and_subtotals.sql` (accounts-service). V52–V56 are applied and frozen.
- App: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/m5-c2-app`, branch `claude/m5-c2`, range `081bc8a6..49353fce`.
- First review (what was found and should now be fixed): `docs/agents/m5-c2/opus-review.md` (H1, M1, M2, M3, L1, L2, L4, L5, L6; L3 deferred to backlog).
- Rules: backend `AGENTS.md`; domain `docs/domain/RULES.md`; plan `docs/agents/accounts-phase3/m5-plan.md` §3–§6 (M5-C2 row); contract `NeoERP-BackEnd`-side `docs/api/accounts-c.md` in the worktree.
- Decision (Jabran 2026-11-05): supplier BILL/CREDIT use the same signed-subtotal rule as customer invoices (net/VAT/non-deductible may go negative via advance deductions; payable total >= 0).

## Focus
1. Is each finding really fixed, with a test that would fail without the fix? H1 especially: V57 guard filter vs V55's AR version — any header/child/counter change that can still lock advance lines while holding balance rows; any update path now skipped that should still be checked.
2. V57 correctness: dropped/re-added constraints, `ap_check_advance_bill_totals` (signed sums, non-deductible from INPUT tax rows), behaviour on existing posted rows and on fresh/populated upgrade, no gap a direct SQL update could use.
3. Money and VAT: the M1 tax-point refusal (SE/DK/FI/PK/NO/IS), the L2 one-minor-unit rule, total-0 bills (journal, statement = balance = ageing, no allocation), signed subtotals in VAT reports.
4. App: `SupplierDeductionMath.kt` matches the server's `price()` exactly; PAYMENT.READ gating; strings moved.
5. Anything new the fixes broke (security, tenant isolation, lock order, contract drift between `accounts-c.md`, backend DTOs and app DTOs).

Tests: do NOT run the full suites (already run: accounts-service 1666/0 failed, app payables 216/0). Run a single test only if you add a probe or suspect a result.

## Report format (`codex-review.md`)
Verdict (approve / changes requested), then findings High / Medium / Low, each with file:line, a concrete failing scenario and a suggested fix; then "checked and correct". Plain English, short.
