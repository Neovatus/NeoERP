# Lane verdict: FIX-B2A-REFRESH-APP (T4b B2a-S6: entitlements re-read on return) — 2026-11-24

**Verdict: MERGE**, **merged** (standing merge): App `phase/4` `d1d7f9d1` → `dae20eb1` (fast-forward). New-Mac build; old Mac gate + merge. RISK (`app/session/**`): two Opus seats. Last Phase 4 fix lane.
- Cause: the session re-read, not the editor. `AppSession.reread()` dropped a failed or empty re-read on return but still stamped the 5 s gap, so entitlements stayed stale until a cold restart. (The brief had put the cause in the editor.)
- Fix: one retry after 1.5 s; stops on sign-out or a company/branch change; only a real answer stamps the gap; no polling.
- Reviews: seat 1 ACCEPT (6 LOW), seat 2 security ACCEPT (3 LOW: no stale write after a switch or sign-out, a failed or empty answer never widens access, server still refuses switched-off features). Both on `bb684213`, Range `d1d7f9d1..bb684213`; `--reviews` REVIEWS OK.
- Tests (builder): old FAIL 3/4 on `a93c5cfe` (`EntitlementRereadOnReturnTest`); new PASS 2389/0 (features.accounts, BuildingBlockChecks, buildrules, i18n, app.session), Android compile OK. Page-level guard `JournalEditorFeatureOffOnReturnUiTest` does not prove the session link. Cause not proven on a device; iPad retest is the confirmation.
- **Gate:** 3 runs. Run 1 interrupted at the 99 % usage stop (environment); one run ended "broken pipe" (cause not recorded); rerun `verify: OK`, 4136/0/1, 10 min.
- **First-pass gate:** no. Cause: environment (interrupted at the 99 % usage stop).
- Follow-ups (LOW): tests use real time (`Thread.sleep`); no test for stop on sign-out or switch during the pause; UI test sets `access` directly; one retry only; failing server gets 2 calls per return; old `rereadJob` race can start a duplicate read; comment at `NeoEnterpriseShell.kt:86` says "five minutes".
- Docs pages: none (no user-guide or developer page describes the re-read on return).
- Brief: gaps were the cause placed in the editor, and the worktree lacking `local.properties`.

## Timeline (MEASURE-1)
- Build about 23 min; rework none; review seat A about 3 min, seat B about 1.3 min (stopped by Jabran and resumed 24 Nov 14:35); gate 3 runs, final 10 min; waiting: reviews waited for the usage reset.
- Size 3 code/test files (+308 / -4). Tokens: builder about 272 k; seats about 90 k each.
