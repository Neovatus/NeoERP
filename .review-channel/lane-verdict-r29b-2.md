# Lane verdict: R29b-2 (user-service resolver + RBAC, company scope) — 2026-11-22

**Verdict: MERGE**, **merged** under the standing merge rule: BE `phase/4` `16d9a3fe` → `409f45e5`, fast-forward through the pre-push hook (RISK marker).
- Fast-forward; user-service (157 files) + org-service (10) + architecture tests + docs; no migration; no AI attribution.
- Reviews: Opus + Fable, both ACCEPT (Reviewed `a198cde5`; later commit review files only); REVIEWS OK. Baseline 35 → 23 unclassified.
- **Gate 1** (08:32–09:00, 28 min, during the load-227 episode): 4481 tests, **1 failed**: `DimensionSetConcurrencyTest.sameNewCombinationFromManyTransactionsGivesOneRow` (accounts-service, not touched by this lane): `TimeoutException` in its race helper at 32.7 s. Load-sensitive test, not a lane defect → backlog row.
- **Gate 2** (09:02–09:13, 11 min, normal load): `verify: OK`, 4481/0/59, money invariants OK.
- App retest item: 404 instead of 403 on cross-company membership and role pages.
- After merge: new Mac cuts R29b-3U and R29b-5 from `409f45e5` (trial B); AL-REST-BE rebases.

## Timeline (old Mac, MEASURE-1)
- Lane-ready 08:2x; gate 1 08:32–09:00 (failed, load); gate 2 09:02–09:13; verdict + merge 09:15 Europe/Oslo. Review 0 min here. Waiting for Jabran 0. Changed files 181, items 13 RBAC entries.
