# Brief draft — SB2a (engine amendments for B/C) · HELD

Status: **held**. Sent to Accounts · Backend only when all three gates hold: (1) Jabran accepts Phase 2 (click-through); (2) Jabran approves the B + C package (contracts `accounts-b.md`, `accounts-c.md`, spec `accounts-b-c.md`, rig after BC-R1…R4); (3) the Phase 2 range is pushed.

## Scope (contract B §14 SB2a, §15, §20)
- A1-A7 in-process documents: `DocumentApproval` evidence, `documentRefProvider`, in-process reversal.
- A1-A8 line tags and party columns (`tax_line_kind`, `tax_rate`, `tax_jurisdiction`, `tax_base_amount`, `tax_group_id`, `tax_override`) + party index.
- A1-A9 control kinds: `allowed_modules`, `subledger_only_after_use`; manual JV on AR refused `USE_RECEIVABLES` (AP rows come with C).
- A1-A10 `TwoPersonPolicy` extracted from A1's journal code, extra contributors from the caller.
- A1-A12 late opening items from RECEIVABLES/PAYABLES in the first open period on/after go-live.
- N-15 `RF`, `WO` journal types; `FX` callable in-process (inactive until MULTI_CURRENCY). N-16 `tax_point_date`, `tax_adjustment_kind`, `tax_deductible_percent`, path-agnostic tag validators. N-17 `approval_origin`. N-18 voucher ref/date filled in-process.
- **Not in:** any receivables/payables code, tables of §3.1 (that is SB2), app work, user-service codes (SB1, separate brief, ERP lead reviews).

## Rules
- Next free accounts migration at build time (V21 today). One reviewed change to A1's engine files.
- Critical part (posting engine, money, migration) → plan first (≤ 1 screen, to me), fresh Opus review before reporting.
- The shared vector file `docs/api/fixtures/accounts-document-math.json` does not exist yet; SB2 creates it (contract B §14). SB2a does not depend on it.
- Tests: §13 engine tests + every existing posting test green; full accounts-service suite + architecture-tests before the push (ERP-143), counts in the report.
- Check first that A5/payroll work hasn't already touched these engine files; if it has, list the overlap in the plan.
- Report with commit ids; no push.

## After SB2a
SB1 (user-service codes) in parallel with SB2a; then SB2 (shared subledger + receivables tables); C's SC2 follows B SB2 (document shape after B SB3). App SB5 (mocks, `AccountsAmount.minorUnits`) can start in parallel once the package is approved.
