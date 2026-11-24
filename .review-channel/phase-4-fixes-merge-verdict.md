# core/phase-4-fixes → main · MERGE · 2026-11-24

First feature under workflow v2 (light: direct fix). Heads: BackEnd `acd727d` (15 commits), App `193a52f1` (18 commits); `main` had nothing the branches lack.
- Fixes: all Phase 4 seam MEDIUM/LOW findings + the "where else?" finds (bootstrap reads in shared/payroll/user-service, duplicate bank notices, revocation outbox backoff) + App outside-brief bugs. Migrations: audit V7, V8; user V51 (no clash on main: audit V6, user V50).
- Tests: builders' own tests, each finding failing on the old code (BE round 1 full run 4684/0 before the own-tests rule; round 2 120/0; review round 11/0; App 4181/0 then own tests). **No whole suite** before main: Jabran's rule for fixes (D-81 addendum 5); both started whole suites were stopped on his call.
- Review: one Fable 5.2 high review of the three risky BE areas (`phase-4-fixes-review.md`): FIX (F1 HIGH sign-in verified flag) → fixed in `acd727d` → re-check ACCEPT. LOWs F2, F3, F5–F8 in the backlog.
- Money invariants not run: no posting code changed (approval decision unchanged, only wording/`canConfirm`); runs in the next stack session.
- Rollout order: user-service before org/payroll/shared callers; audit-service before the `eventId` producers.
