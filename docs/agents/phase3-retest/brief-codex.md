# Codex brief — Phase 3 retest round on clean data, T1 to T24 (report only)

You run the NeoERP **desktop app** with desktop control and click through the manual test script. You **report**;
you do not change code, do not commit, do not push.

## What changed since your last run
- The local stack was **reset and reseeded** (2026-11-16). All earlier test data is gone; earlier reports are history.
- The app is new: **NeoERP Dev.app** now includes Phase 3 fix batches 1 and 2, A4 (recurring journals, accruals,
  journal import) and "one person id". Everyone signs in again.
- Known fixed: the opening-import branch picker (T14), the Journals empty-state menu (T12), the template download (T13).

## Before you start
- Jabran is not testing while you run. The app is single-instance: close any other NeoERP window first.
- Backend runs from `NeoERP/NeoERP-BackEnd`. Do not start, stop or restart it.
- Open the app: `open "/Users/jabransiddiqui/Offices/Neovatus/NeoERP-TestApp/NeoERP Dev.app"`.
- Script: `NeoERP/docs/agents/phase3-test-steps.md`, T1 to T24 in order. Skip T10 (two app instances).
- Sign-ins: the demo users each test names; details in `NeoERP/NeoERP-BackEnd/docs/local-demo-data.md`. Type them only
  into the NeoERP sign-in page on localhost. **Never** copy them into a report or anywhere else.
- Already known (don't report again): `NeoERP/docs/agents/phase3-test-findings/*.md`. Read them first.

## Rules
- Follow each step exactly; use the values the script gives.
- A test that switches a feature or module **off** switches it **back on** before you move on, and checks it.
- Never delete anything the script doesn't say to delete.
- **Posting, approving and other money actions:** when your approval check refuses a Post / Approve / Pay click, stop
  at that step, write "waiting for Jabran: <exact button and screen>" in the report and in chat, and wait. Jabran
  clicks it, then tells you to continue.
- If the app or backend stops responding, stop and report; do not restart services.
- After a sign-in, the first click may only bring the window forward; click again.

## Screenshots (window only, every finding and every entry screen)
1. Click the NeoERP Dev window so it is in front.
2. Maximise it (green button), then: `screencapture -x NeoERP/docs/agents/phase3-retest/T{nn}-step{n}.png`
3. Open the image and check it shows NeoERP, not another app; retake if not.
Narrow-window and phone-size checks are covered by automated size tests; don't resize the window.

## Report (one file per test) in `NeoERP/docs/agents/phase3-retest/`
```
# T{nn} — {title}
Result: passed | passed with findings | failed | blocked | waiting for Jabran
## Steps
1. passed / finding / failed — what you saw (one line)
## Findings
1. Step n — what is wrong, exact on-screen text, where, how to reproduce. Severity: money | security | flow | wording | layout.
   Screenshot: T{nn}-step{n}.png
   Time: HH:MM (so the lead can find it in the backend log)
```
Quote screen text exactly. At the end write `summary.md`: one line per test (result + findings count) and blockers.
Do not commit; the lead reads the files.
