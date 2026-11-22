# Test ledger (both leads)

What ran, on which code, so nobody repeats it (D-51 rule 5). **Read before planning any test, flow check, simulator session or review re-run; append after.** One line per run. The lead appends (builders and testers report to the lead). Gate markers (`build/verify/<sha>.ok`) stay the record for gates; list gates here only when they failed or were scoped.

Columns: date · repo@sha (or range) · what (modules / flows / simulator steps) · result · by · link

| Date | Code | What | Result | By | Link |
|---|---|---|---|---|---|
| 2026-11-22 | App 8356aba9 + BE 9aca6c76 | Simulator: Reports company switch Sialkot→Lahore→Sialkot, from TB and Balance sheet (AC418 step 15) | PASS | old-Mac tester | `.review-channel/ac418-app-simulator-retest.md` |
| 2026-11-22 | App bbb1dd5b + BE 095a8989 | Simulator AC418 steps 1–14, 17–20 (exact dates, period panels, ledger chip, cards, live refresh, PRJ-9 picker, OB hand-off/real step, recurring memo, tax defaults NO + PK, opening duplicate row) | 17 PASS (step 19 removed-default N-A; step 20 hand entry: no App field) | old-Mac tester | `.review-channel/ac418-app-simulator-checks.md` |
| 2026-11-22 | BE 1560d0d6 (R29b-5 jars) | Simulator: company Activity (Ola), platform audit log (superadmin), no cross-company rows | PASS (inbox, retry: N-A, no App screen) | old-Mac tester | `.review-channel/r29b-5-simulator-checks.md` |
| 2026-11-22 | BE 8de03ee | Claim/purge query bound: 11 tests (ANALYZE after first row), full suites domain-events, accounts, org, user, hr, architecture | PASS (7 old FAIL) | old-Mac builder | BE `docs/agents/outbox-claim/builder-report.md` |
| 2026-11-22 | App 8356aba9 | Bill send-for-approval as Bjørn (step 16) | NOT RUN: submit failed under load ~570 | old-Mac tester | retest round |
| 2026-11-22 | BE dc7c481a (AL-REST-BE -r2, V79) | Builder full suites: accounts-service, user-service, architecture | 2211/0, 690/0, 84/0 | new-Mac builder | BE `docs/agents/al-rest/builder-report-be.md` "Fix round 1" |
| 2026-11-22 | BE dc7c481a | Opus fix check, targeted: accounts 137 in 27 classes, architecture 84 | 0 failed | new-Mac Opus | BE `docs/agents/al-rest/review-3-opus.md` |
| 2026-11-22 | App 2c7e1fd4 (AL-REST-APP) | Builder: every size-test class (device matrix incl. 320 pt, font 130 %), all `features.accounts.*`, i18n, building blocks, buildrules; JVM + iOS + Android compiles | 2350/0 | new-Mac builder | App `docs/agents/al-rest/builder-report-app.md` "Fix round 1" |
| 2026-11-22 | App 2c7e1fd4 | Opus re-check, targeted: 13 classes incl. AlRestOldFailTest and both approval size tests | 61/0 | new-Mac Opus | App `docs/agents/al-rest/review-app-3-opus.md` |
| 2026-11-22 | App 2c7e1fd4 + BE AL-REST-BE | Simulator S6 click-through (`docs/agents/al-rest/test-steps.md`) | NOT RUN: needs both AL-REST lanes merged; one batch session with FIX-APP-SWITCH | — | — |
| 2026-11-22 | App 955e1716 (RISK-NARROW-APP -r2) | `scripts/risk-check-test.sh` full; dead-glob check | all cases PASS | new-Mac lead | lane-ready-risk-narrow-1 |
| 2026-11-22 | BE 39010216 (RISK-NARROW-BE -r3, merged as df80e554) | `scripts/risk-check-test.sh` full; dead-glob check | 110/110 | new-Mac lead | lane-ready-risk-narrow-1 |
| 2026-11-22 | BE fa045702 (R29b-3U, before rebase) | Opus: whole user-service, architecture, real-DB two-company 13 cases, new HTTP 6, real-DB 7 | 732/0/4, 85/0 | new-Mac Opus | BE `docs/agents/r29b/review-3u-3-opus.md` (re-run after the rebase onto df80e554: builder full user + org + arch) |
| 2026-11-22 | BE bbca0748 (EMAIL-UNIQ-BE, V50) | Builder: full user-service, architecture; read-only duplicate check on local `neoerp_iam` (0 duplicates) | 691/0/4, 89/0 | new-Mac builder | BE `docs/agents/email-uniq/builder-report.md` (fix round 1 running) |
| 2026-11-22 | App 542ccd55 (FIX-APP-SWITCH -r2 on 9f182c69) | `features.accounts.*` + every `design.*SizeTest` (old results deleted first) | 2376/0, BUILD SUCCESSFUL, exit 0, 17:59 | new-Mac lead | lane-ready-fix-app-switch |
| 2026-11-22 | BE 81b9f591 (R29b-3U -r2 merge fix) | user-service full + architecture | 737/0/4, 92/0, BUILD SUCCESSFUL, exit 0, 16:42 | new-Mac builder | lane-ready-r29b-3u (merged 1c0fc25c) |
| 2026-11-22 | BE 4701c941 (R29b-3U -r2 before fix) | user-service + architecture | **compile FAIL** (semantic merge break; my first report read stale XML) | new-Mac lead | inbox CORRECTION |
| 2026-11-22 | BE 5ae6e01d (EMAIL-UNIQ-BE -r) | user-service full + architecture (old results deleted first) | 745/0/4, 92/0, BUILD SUCCESSFUL, exit 0, 17:36 | new-Mac builder | lane-ready-email-uniq-be |
| 2026-11-22 | BE 7e7a3ff8 / App e4d1aba7 (GATE-3a fix round) | `risk-check-test.sh` full | BE 125/125, App 117/117 | new-Mac builders | lane-ready-gate-3a |
| 2026-11-22 | App c13df21b (AL-REST-APP -r) | every size-test class + `features.accounts.*`; JVM/iOS/Android compiles | 2366/0 (one AC418 order-dependent flake on run 1) | new-Mac builder | lane-ready-al-rest-app (merged 9f182c69) |
| 2026-11-22 | BE 8472c728 + App 6c680b49 (T4 run 1) | Tester 1 Kystgruppe G1–G5: B2a-S5 ×4, AC418-16 ×2 (submit works; detail banner general, known), B2a-S2 steps 1/2/4, B2b-14, B2a-S6 ×3 | ~17 PASS, 0 FAIL; ~14 BLOCKED (AL not released; Ola not on Lahore; D1/AC418-10a prep missing); B2b-3 not run | old-Mac tester 1 | `t4-results-tester1.md` |
| 2026-11-22 | same | Tester 2 Lahore G6: OBS-1, SW-D9 PASS; OBS-2 FAIL (Excel template saved as .csv); B2b-5/6/16a BLOCKED (import data used up) | 2 PASS, 1 FAIL, 3 BLOCKED | old-Mac tester 2 | `t4-results-tester2.md` |
