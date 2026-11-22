# Lane ready: FIX-AL-RELEASE-BE (T4 blocker: release Approval limits) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-fix-al-release-be`, on BE `phase/4` `8472c728`. Code head `3d643b6c`; review commits follow.
**Brief:** `docs/agents/t4-fix-al-release/brief.md`. The source is the T4 blocker from the old Mac: Kystgruppe's Modules page showed "Approval limits: Coming later". This was missed in AL-REST, not decided.
**Builder:** Opus 5.5, default effort. Report: `docs/agents/t4-fix-al-release/builder-report.md`, with the T4 retest steps.
**Tier 1, plus a second seat from the old Mac** (shared catalog, D-61).

## Review files
- `docs/agents/t4-fix-al-release/review-1-opus.md` (Opus 5.5, new Mac): ACCEPT, 0 HIGH, 0 MEDIUM, 3 LOW. Reviewed `3d643b6c`, Range `8472c728..3d643b6c`.
- `docs/agents/t4-fix-al-release/review-2-opus-sec.md` (Opus 5.5 security (D-43), old Mac): copied in from the workspace once it is pushed.

## What it does
- `EntitlementCatalog.kt:109`: `FINANCE.APPROVAL_LIMITS` is now released. It stays INCLUDED, the default stays off, and there is no migration. Every guard (the accounts `EntitlementGate` and the user-service stand-ins) reads org live.
- The "unreleased" tests now use DIMENSION_REPORTING, IMPORTED_DOCUMENTS and BUDGET_CONTROL.
- The dev-only `scripts/seed-demo-tenants.sql` switches AL on for Lahore Textiles and Kystgruppe Nordic. It is idempotent. No ladders are seeded: the retest steps set them, with Ola proposing and Bjørn confirming.
- Docs: `docs/api/org.md` (the unreleased list now matches the catalog; it also drops RECURRING_JOURNALS and JOURNAL_CSV_IMPORT, which were already released), `docs/api/accounts-approval-limits.md` §5, and `docs/local-demo-data.md`.

## Tests (builder, BE lock)
- **Old FAIL:** on `8349fb2a`, exit 1. Catalog 13 tests, 1 failed; org 53 tests, 2 failed. The three failures are exactly the three new tests.
- **New PASS:** on `866647bb`, exit 0, results from that run's XML:

  | Module | Tests | Failed |
  |---|---|---|
  | catalog | 13 | 0 |
  | org-service | 628 | 0 |
  | user-service | 745 | 0 |
  | accounts-service | 2215 | 0 |
  | `:architecture-tests` | 92 | 0 |

- **Not run here:** `verify.sh`, the jar start.

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/t4-fix-al-release/review-1-opus.md docs/agents/t4-fix-al-release/review-2-opus-sec.md`.
2. Merge it.
3. For the T4 retest, an existing local DB needs `./scripts/seed-demo-tenants.sh` run again, or the switch flipped on the Modules page. Then set the ladder as in the report's retest steps.

## Follow-up rows (LOW, from Opus)
- `EntitlementCatalog.kt:101`: a stale "Not released yet … Phase 4 A4" comment above three released features.
- `org.md:1866-1869`: one line is longer than the rest (cosmetic).
- Seed note: a local database where someone set this feature's row to true by hand before 2026-11-15 would now turn it on. Dev only.

## Timeline (new Mac; Europe/Oslo)
- **Assigned:** the old-Mac ring at about 20:20. Brief at 20:25. No separate brief check (a small lane); the lead checked line 109, and the builder checked every file:line before building (all matched).
- **Build:** about 42 m, most of it waiting for the BE lock behind the two other BE lanes.
- **Review:** Opus about 1.7 m. The old-Mac seat ran in parallel.
- **Rework:** none.
- **First-pass gate:** pending (old Mac).
- **Size:** 11 files (+207 / −10), 0 fix rounds.
- **Tokens:** builder about 125 k, Opus about 94 k.
- **Brief gaps:** step 5 said what to do for the feature switch, but not for ladders. The builder left ladders to the retest steps.

## Docs pages
- **Developer:** `docs/api/org.md`, `docs/api/accounts-approval-limits.md`, `docs/local-demo-data.md`.
- **User guide:** none. No page said "Coming later" for approval limits.
