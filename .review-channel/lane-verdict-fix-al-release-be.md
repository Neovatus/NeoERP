# Lane verdict: FIX-AL-RELEASE-BE (T4: Approval limits could not be switched on) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `8472c728` → `7246cee5` (fast-forward, RISK marker: shared entitlement catalog). New-Mac build; old Mac second seat + gate + merge (D-61).
- Escaped defect (escaped-defects row): `APPROVAL_LIMITS` was `released = false` in `shared/entitlement-catalog`; AL-REST merged a feature no company could switch on. Found only by the T4 end-to-end retest.
- Fix: release flag dropped for APPROVAL_LIMITS only (default stays off per company); unreleased-feature tests moved to DIMENSION_REPORTING, IMPORTED_DOCUMENTS, BUDGET_CONTROL; dev-only `seed-demo-tenants.sql` switches AL on for Lahore and Kystgruppe. Builder: catalog 13/0, org 628/0, user 745/0, accounts 2215/0, arch 92/0 (old FAIL / new PASS).
- Reviews: new-Mac Opus (`review-1-opus.md`), old-Mac `Opus 5.5 security (D-43)` (`review-2-opus-sec.md`, high effort, brief + diff only): ACCEPT, 2 LOW (no AL-specific "FINANCE off ⇒ AL off" test; double setup in the positive test).
- **Gate:** `verify: OK`, 14 min, marker `7246cee5`.
- For T4 short retest: rerun `scripts/seed-demo-tenants.sh` (or switch AL on in Modules); ladders set in the steps.
