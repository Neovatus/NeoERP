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
