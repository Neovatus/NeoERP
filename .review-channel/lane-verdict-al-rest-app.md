# Lane verdict: AL-REST-APP (refunds, advances, write-offs, approvals: App) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): App `phase/4` `3fc42d32` → `9f182c69` (fast-forward, RISK marker). New-Mac lane + one old-Mac test-only commit; tier 2.
- Needs AL-REST-BE (`expectedStep`, step/summary endpoints, `confirmedByUserId`), merged first (BE `6d948693`).
- Rebase onto AC418-APP resolved real conflicts in 6 shared files; reviews `review-app-5-opus.md`, `review-app-6-sonnet.md` (Reviewed `c13df21b`). One false ring: the re-stamp commit had landed on a detached HEAD (fixed, `e1df8868`).
- **Gates:** run 1 refused reviews (old-Mac error: detached worktree without `--range` → base `main`); run 2 failed one order-dependent AC418 test `ConfirmRaceWordsTest` (expected Check, was Created). Root cause: a thread race in the test rig (`OpeningRig.send` returned before the new check's rows read), not shared state; fix `9f182c69` test-only, reproduced with forced ordering before/after, full jvmTest 4112/0 (own output). Run 3 `verify: OK`, 10 min.
- Flow checks: in the Phase 4 retest session (T4, Part A). FIX-APP-SWITCH rebases next.
