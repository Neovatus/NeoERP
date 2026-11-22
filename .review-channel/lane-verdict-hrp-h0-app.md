# Lane verdict: HRP-H0-APP (delete v1 HR, Payroll, ESS, HR reports) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): App `phase/hrp-v2` `b91d4abf` → `d91e45cd` (fast-forward; the hook does not gate `phase/hrp-v2`, gate run by rule).
- Scope: v1 `hr` (19 files), `payroll` (20), `ess` (11), `reports` (7) deleted with navigation, DI, strings and tests; employee-only people land on a "being rebuilt" self-service page (en/nb/sv/da); People "link employee" and Org headcount hidden until H1, dead `/api/hr` calls removed, a build rule refuses new HR/Payroll endpoint calls; docs (developer + user guide) updated. +~1.2k −11.5k lines. No AI attribution.
- Builder: Sonnet high (3 rounds: build, lead decision on dead calls, review fixes). Reviews round 1: Opus FIX (docs F1/F2 MEDIUM, F4 LOW landing), Sonnet FIX (docs); round 2: both ACCEPT (`review-3-opus.md`, `review-4-sonnet.md`). REVIEWS OK.
- **Full gate:** `verify: OK`, 10 min, 3951 tests, 0 failed, 1 skipped.
- Carried to H1-APP: Dashboard bounce to the self-service page on session refresh (Sonnet LOW-2), two wording lines in `people.md` / `employee-link.md` Rules, mock-only HR leftovers, Opus I1–I4.

## Timeline (MEASURE-1)
- Build 32 min + lead-decision round ~20 min (+30 min lost to the self-matching wait check) + review fixes ~25 min; reviews Opus 7.8 + 1.1 min, Sonnet 5.8 + 0.7 min; gate 10:47–10:57; merged 10:58 Europe/Oslo. Changed files ~140, items: H0 App scope rows.
