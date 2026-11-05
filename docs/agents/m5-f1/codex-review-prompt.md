# Codex second review — M5-F1 fiscal registration and approval hook (Pakistan FBR baseline)

Role: independent second reviewer. READ ONLY: do not edit code, commit, push or run migrations against shared databases. The only file you write is your report: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/m5-f1/codex-review.md`.

## What to review
- Backend: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/m5-f1-be`, branch `claude/m5-f1`, commit `975f2de` (parent `c3f33bf` = dev). New migration `V59__m5_fiscal_state_integrity.sql` (accounts-service); V26/V53 hold the earlier fiscal tables and transition rules — must stay unchanged.
- App: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/m5-f1-app`, branch `claude/m5-f1`, commit `ac423ccd`.
- Plan: `docs/agents/accounts-phase3/m5-plan.md` M5-F1 row of §6, §7 fiscal states, §9 Q1 (approved: baseline states/outbox/Noop/test fake only; refuse fiscal-qualified advance paths; no real PK STRN go-live; F2 dispatcher deferred). Contract: `docs/api/accounts-b.md` (C-34, C-45, C-16, "Amendment 2026-11-01 — B-FBR" — its expanded scope is NOT in F1, and the new "M5-F1 built" note under §7.18). Domain: `docs/domain/RULES.md`.
- Builder addition to judge: `FiscalSubmission.sendOnce` (claim one outbox row, call the provider outside any transaction, re-lock and record the answer once) — nothing schedules or exposes it.

## Focus
1. Atomicity: approval writes POSTED + PENDING + one outbox row, or nothing; commit-time checks; rollback paths.
2. State integrity: allowed transitions only; ACCEPTED/REJECTED terminal and frozen; Noop never invents acceptance, number or QR and never says "sent to FBR"; FBR number unique per company; retry repeats the first payload.
3. `sendOnce` concurrency: two callers, stale claims, provider call outside locks, re-lock and recheck, no outbox→document vs document→outbox deadlock.
4. Guards: issue blocked until ACCEPTED; credit note refused while its invoice is not ACCEPTED (create, edit, approve); registration edits (overlap, in-use, start date, version); fiscal-qualified advances refused.
5. Security: rights per endpoint (FISCAL.MANAGE, reads), reason gate and audit, tenant isolation in every query, the new Org `taxIds` read.
6. App: no FBR UI without a registration; exception pills only; neutral waiting; disabled-with-reason; words in strings; no String.format/putIfAbsent/assert( in commonMain.

Tests: do NOT run full suites (builder: impacted backend 141/0 failed, FiscalHookTest 6, FiscalRegistrationApiTest 4, architecture 28/0; app receivables 255/0). Run a single test only if you add a probe or doubt a result.

## Report format (`codex-review.md`)
Verdict (approve / changes requested), then findings High / Medium / Low, each with file:line, a concrete failing scenario and a suggested fix; then "checked and correct". Plain English, short.
