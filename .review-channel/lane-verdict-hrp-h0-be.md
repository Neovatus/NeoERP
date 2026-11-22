# Lane verdict: HRP-H0-BE (HR/Payroll v2 foundation, BackEnd) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/hrp-v2` `16d9a3fe` → `f1a6f944` (fast-forward). The hook does not gate `phase/hrp-v2`; the gate was run by rule.
- Scope: v1 hr/payroll code and tables dropped (hr V10/V11, payroll V6/V7: drop v1 + foundation outboxes/idempotency with RLS), `beforeMigrate` flag callback, tenant-security `RlsPolicyCheck` + role template + test kit, hr/payroll JPA → JDBC, outbox claim fixed (materialized CTE, old FAIL/new PASS), dev scripts `hr-payroll-db-roles.sh` / `hr-v1-dev-clear.sh`. 458 files, +5972 −23712. No AI attribution.
- Reviews: Opus ACCEPT (5 LOW + 2 INFO; ran 23 RLS/migration/role/outbox tests, 0 failed), Fable ACCEPT (7 LOW; static). REVIEWS OK.
- **Full gate:** `verify: OK`, 11 min, 4323 tests, 0 failed, 45 skipped, money invariants OK.
- **Carried to H1-BE / P0 as scope rows** (cheap there, first migrations still to come): column grants on the outboxes (no UPDATE of `company_id`/payload; Fable F2, Opus O2); `RlsPolicyCheck` compares policy expressions (F3, O3); views `security_invoker` and definer-function checks, `neoerp.migration` settable (F4); ADR §5.2 system-job test on the real outboxes (F5); refusal before listeners/schedulers start, workflow `orgId`, audit `reason` (F6, F7); `DatabaseRoleContract` binder-off guard back for accounts (O1); workflow order tie-break (O5); role script re-grant of DELETE detected (F1); test floor from this run: raise 4150 → ~4300 (O4).
- Local dev before an `hrp-v2` stack runs: HR/PAYROLL DB + FLYWAY passwords in `.env` (never printed), `scripts/hr-payroll-db-roles.sh`, restart, `NEOERP_CONFIRM_HR_V1_CLEAR=yes scripts/hr-v1-dev-clear.sh`. Not needed until H1 testing.
- Suspected escaped defect logged: the Accounts audit outbox claim has the same query shape (`docs/process/escaped-defects.md`).

## Timeline (MEASURE-1)
- Built on the old Mac: builder 65 min (539k tokens); reviews Opus 8.5 min (220k), Fable 6.5 min (232k); gate 10:00–10:11; merged 10:12 Europe/Oslo. Rework 0. Changed files 458, items: H0 scope rows (brief).
