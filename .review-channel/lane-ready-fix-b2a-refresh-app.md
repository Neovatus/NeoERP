# Lane ready: FIX-B2A-REFRESH-APP (T4b B2a-S6: entitlements re-read on return) — 2026-11-24

**Repo / branch:** `NeoERP-App`, `phase/4-b2-fix-b2a-refresh-app`, on App `phase/4` `d1d7f9d1`. Code head `bb684213`; only the review files follow.
**Brief:** `docs/agents/t4-fix-b2a-refresh/brief.md`. Builder: Opus 5.5. Report: `builder-report.md`, with the cause and retest steps.
**RISK** (`app/session/**`): two Opus seats.

## Review files
- `review-1-opus.md` (Opus 5.5): ACCEPT, 6 LOW.
- `review-2-opus-sec.md` (Opus 5.5 security (D-43), diff and brief only): ACCEPT, 3 LOW.
- Both: Reviewed `bb684213`, Range `d1d7f9d1..bb684213`.
- `risk-check.sh --reviews`: **REVIEWS OK**.

## What it does
- **Cause:** the session's re-read, not the editor. The editor already follows the live gate. `AppSession.reread()` dropped a failed or empty re-read on return but still stamped the 5 s gap, so the entitlements stayed stale until a cold restart.
- **Fix:** one retry after 1.5 s. It stops on sign-out or a company or branch change, and only a real answer stamps the gap. No polling.
- **Security seat:** no stale write after a switch or sign-out; a failed or empty answer never widens access; the server still refuses switched-off features.

## Tests (builder, App lock)
- **Old FAIL:** on `a93c5cfe`, 4 tests, 3 failed (`EntitlementRereadOnReturnTest`).
- **New PASS on `1d231fab`:**
  - JVM `features.accounts.*`, BuildingBlockChecks, `buildrules`, i18n and `app.session`: 2389 tests, 0 failed, exit 0.
  - Android compile: exit 0.
- Plus the page-level guard `JournalEditorFeatureOffOnReturnUiTest`. It does not prove the session link (seat A).
- **The cause is not proven on a device.** The iPad retest is the confirmation. If it fails, capture the device log of the bootstrap call on return.

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/t4-fix-b2a-refresh/review-1-opus.md docs/agents/t4-fix-b2a-refresh/review-2-opus-sec.md`.
2. Merge it.
3. Retest B2a-S6 on the iPad, with the steps in the builder report: Home, wait 5 s, return, three times.

## Follow-up rows (LOW)
- The tests use real time (`Thread.sleep`); move them to `runTest`.
- No test for a stop on sign-out or a company switch during the pause.
- The UI test sets `access` directly.
- Only one retry; consider a backoff.
- A failing server gets 2 calls per return.
- An old `rereadJob` race can start a duplicate read.
- The comment at `NeoEnterpriseShell.kt:86` says "five minutes".

## Docs pages
None: no user-guide or developer page describes the re-read on return.

## Timeline (new Mac; Europe/Oslo)
- **Assigned:** T4b ring at about 23:00 (22 Nov). Built at about 23:30.
- **Reviews:** on 24 Nov at 14:35, stopped by Jabran and resumed (seat A about 3 m, seat B about 1.3 m). Lane-ready at about 14:50.
- **Build:** about 23 m.
- **Rework:** none.
- **First-pass gate:** pending.
- **Size:** 3 code/test files (+308 / −4).
- **Tokens:** builder about 272 k; seats about 90 k each.
- **Brief gaps:** the brief put the cause in the editor (it was the session); the worktree had no `local.properties`.
