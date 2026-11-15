# Codex brief — Phase 3 UI click-through, T11 to T24 (report only)

You run the NeoERP **desktop app** with desktop control and click through the manual test script. You **report**;
you do not change code, do not commit, do not push.

## Before you start
- Jabran is **not** testing while you run (same app, same users, same database). The app is single-instance.
- The local backend runs from `NeoERP/NeoERP-BackEnd`. Do not start or restart it.
- **Use the test app** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP-TestApp/NeoERP Dev.app` (open it with
  `open "/Users/jabransiddiqui/Offices/Neovatus/NeoERP-TestApp/NeoERP Dev.app"`). It is a real macOS app named
  "NeoERP Dev", pinned to the local backend. Any other NeoERP window must be closed first (single instance).
- Script: `NeoERP/docs/agents/phase3-test-steps.md`. Run the tests from the one Jabran names (default **T12**) to **T24** in order. Skip T10 (needs two app instances).
- Sign-in: use the demo users named in each test. Their sign-in details are in
  `NeoERP/NeoERP-BackEnd/docs/local-demo-data.md`. Type them only into the NeoERP sign-in page on `localhost`
  (Keycloak on localhost:8082). **Never** copy them into your report or any other place.
- Already known (don't report again): everything in `NeoERP/docs/agents/phase3-test-findings/*.md`. Read those first.

## Rules
- Follow each step exactly. If a step creates data, use the values the script gives.
- A test that switches a feature or module **off** must switch it **back on** before you move on (as T9 steps 9–10).
  Check that it is on again.
- Never delete anything the script does not tell you to delete. Never sign out "on all devices" for a user other than
  the one you are using.
- Do not change company settings, agreements, users or roles beyond what a step says.
- If the app or the backend stops responding, stop and report; do not restart services.
- After the first click following a sign-in, the app may need one extra click (known focus issue).

## Report (one file per test)
Write `NeoERP/docs/agents/phase3-ui-run/T{nn}.md` for each test:

```
# T{nn} — {title}
Result: passed | passed with findings | failed | blocked
## Steps
1. passed / finding / failed — what you saw (one line)
...
## Findings
1. Step n — what is wrong, exact on-screen text, where (screen, field), how to reproduce. Severity: money | security | flow | wording | layout.
   Screenshot: T{nn}-step{n}.png (save next to the report)
```
Exact words matter: quote the screen text as shown. Note layout problems too (alignment, overlap, cut-off text,
inconsistent buttons or statuses between screens).

At the end write `NeoERP/docs/agents/phase3-ui-run/summary.md`: one line per test (result + count of findings) and
anything that blocked you. Do not commit; the lead reads the files.
