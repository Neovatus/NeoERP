# Lane verdict: OUTBOX-CLAIM-BE (escaped defect: claim/purge queries over the batch limit) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `1560d0d6` → `9aca6c76` (fast-forward, RISK marker). Old-Mac lane.
- Scope: 7 claim/purge queries shaped `UPDATE/DELETE … (SELECT … LIMIT :n FOR UPDATE SKIP LOCKED)` touched every due row once the table was analyzed with one row. All moved to `WITH … AS MATERIALIZED` (`DELETE … USING`): accounts AuditOutbox.claimDue, OrgEventInbox.claimDue; shared domain-events JdbcInboxStore.claimDue, purgeDone, JdbcFeedStore.purgeDelivered; user EmployeeLinkRequest.claimDue; hr v1 IamLinkOutbox.claimDue. 4 already-correct CTEs got an explicit MATERIALIZED. Rule in BE `docs/database/db-design.md` §1. No migration. No AI attribution.
- Tests: 11 new (ANALYZE after the first row, 3 due / limit 1 → 1). Old FAIL 7 / new PASS. Builder full suites: domain-events 117, accounts 2167, org 624, user 687, hr 125, architecture 83, 0 failed. Opus reproduced the bug in a throwaway Postgres.
- Reviews: round 1 Opus ACCEPT, Fable ACCEPT (on `8de03ee`); after the base move (R29b-5) Opus re-stamp + **Opus 5.5 security (D-43)** re-stamp (Fable paused), both ACCEPT on `2bfc90c`.
- **Gate:** run 1 refused the reviews (a second "verdict" mention; same reviewer name) after 11 min of green tests; run 2 `verify: OK`, 11 min, money invariants OK, marker `9aca6c76`.
- Also carried: R29b-5 release-gate rows F1/F3/N1 (BE go-live requirements, section ISO).
- **hrp-v2 note:** hr v1 `IamLinkOutboxJdbcRepository.kt` is deleted on `phase/hrp-v2` (H0-B3); when phase/4 meets hrp-v2, take the delete.
- Backlog: Fable LOW (audit claim never counts attempts) row added.

## Timeline (MEASURE-1)
- Build 38 min; review round 1 Opus 3 min, Fable 1 min; rebase + re-stamps 2 min; Rework: gate rerun 11 min + label fixes 5 min (format, not code); gates 11 + 11 min; Waiting: ~15 min behind the R29b-5 gate. Changed files 14 + 1 doc; items 7 queries.
