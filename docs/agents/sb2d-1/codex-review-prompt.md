# Codex second review — SB2d-0 contract docs + SB2d-1 dimension storage and resolver

Role: independent second reviewer. READ ONLY: do not edit code, commit, push or run migrations against shared databases. The only file you write is your report: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/agents/sb2d-1/codex-review.md`.

## What to review
- `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-worktrees/sb2d-1-be`, branch `claude/sb2d-1`, commits `ad34eac` (SB2d-0 docs) and `78b29ba` (SB2d-1), parent `58bcfab` = dev. New migration `V60__sb2d_dimension_storage.sql` (accounts-service), new module `shared/dimension-contracts`, `DimensionSetRepository` + `DimensionSetJdbcAdapter` + cache, role script `infra/postgres/initdb/accounts-runtime-role.psql`.
- Approved plan: `docs/agents/accounts-sb2d/plan.md` (§2–§4, §10–§13; approved by Jabran 2026-11-04, all questions as recommended; Q5: a document line takes the document's branch, journals per-line branch). ADR-021. Product direction: large multi-company customers (volume, concurrent first use).

## Focus
1. Hash: SQL-only, IMMUTABLE, normalisation (null/empty, trailing trim, field order equals DimensionSetV1), collision/versioning (`v1|`), CHECK on stored hash.
2. Concurrency: INSERT … ORDER BY hash ON CONFLICT DO NOTHING RETURNING then SELECT — any path to a missing id, duplicate, deadlock, or a waiter seeing a rolled-back first insert; behaviour under READ COMMITTED vs REPEATABLE READ callers; savepoints.
3. Cache: global LRU keyed (company, tuple); per-transaction map promoted only after commit; rollback; memory at 200k entries; lock contention of a synchronized LinkedHashMap on a hot posting path; tenant isolation (no cross-company id).
4. Immutability: trigger + REVOKE (role may not exist), the role script re-grant problem, FKs by company (cost centres, projects, free values), deletes of referenced values.
5. V60 on a populated database (fresh and upgrade), cost-centre validity defaults, new tables' constraints; nothing else changed.
6. SB2d-0 docs: do the amendments match the plan and the code that will follow (balance key per set with non-key branch_id, step 10.4a, POSTING_RETRY on 40P01/55P03, idempotency hash normalisation, year-end buckets, B/C line shape and branch rule, no set on draft-settle tables)?

Tests: do NOT run full suites (builder: 70 targeted tests, 0 failed). Run a single test only if you add a probe or doubt a result.

## Report format (`codex-review.md`)
Verdict (approve / changes requested), then findings High / Medium / Low, each with file:line, a concrete failing scenario and a suggested fix; then "checked and correct". Plain English, short.
