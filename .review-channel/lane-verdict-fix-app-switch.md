# Lane verdict: FIX-APP-SWITCH (wrong-company journal request after a company switch; AC418 review-7 MEDIUM) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): App `phase/4` `9f182c69` → `6c680b49` (fast-forward, RISK marker). New-Mac lane; tier 1 + second seat until GATE-3.
- Fixes the step-15 bug class in `JournalsHost` / `AccountsRoute` (journals holder, SIE route) like ReportsPage `key(holder)`, with regression tests. Closes the backlog MEDIUM "before the Phase 4 PRs".
- Re-stamps on `9f182c69` by two Opus seats (`review-3-opus.md`, `review-4-opus-sec.md`). Builder run (own output): 2376 tests, 0 failed.
- **Gate:** `verify: OK`, 12 min, marker `6c680b49`. Flow checks: T4 Part B (`sim-steps-al-rest-and-switch.md`, merged into `sim-session-phase4-retest.md`).
- **Batch B (App) is complete.** All Phase 4 feature lanes are merged; next: GATE-3a (both), T4 retest session, fix lanes by feature, DOCS-2c, T5.
