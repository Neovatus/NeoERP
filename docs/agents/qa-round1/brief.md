# QA round 1: full-flow tester on iPhone and iPad simulators (report only)

Jabran, 2026-11-19: a proper tester runs every flow end to end as the demo people, **including Post, Approve, Pay and
Refund**, and checks that the data is right afterwards. You report; you do not change code, do not commit, do not push.

**Standing rules (2026-11-21):** roles, limits, checklists, sizes, report format, severity and round flow are now in the [QA guide](../../qa/qa-guide.md).
This brief is the round 1 record; a new round's brief follows the guide's brief template (§7) and reads the guide first.

## Limits (hard)
- **Local stack and seeded demo people only.** The backend is on localhost. Never a hosted stack, never a real account.
- **Sign-in only through the dev session files** that Jabran makes (`/private/tmp/neoerp-<user>.session.json`). The lead
  copies each file into its simulator with `NeoERP-App/tools/dev-session-to-simulator.sh <user>`. **Never open, print or
  copy a session, token or password file**, and never type a password. If a simulator lands on the sign-in screen,
  stop and report "needs a new session file for <user>".
- Don't start, stop or restart the backend. Don't reset data. Delete only what a step says to delete.
- **Database checks are read-only:**
  `docker exec neoerp-postgres psql -U neoerp -d <db> -v ON_ERROR_STOP=1 -c "SET default_transaction_read_only = on; <SELECT ...>"`
  Only `SELECT`. Never print columns that hold secrets (tokens, bank numbers in clear text).

## Devices: one person per simulator
The lead boots and installs the debug app and copies the session files before you start. Before each test, take a
screenshot to confirm who is signed in where.
| Simulator (udid) | Person | Company |
|---|---|---|
| iPad Pro 13-inch (M5) `5AB86CDD-21F1-45AB-A677-66079974BE1F` | ola.nordmann (Owner) | Kystgruppe Nordic |
| iPhone 18 Pro `45AD3FD4-4FF6-4EF3-A68B-F044AC85C269` | anna.lindh (Accountant) | Kystgruppe Nordic |
| iPad mini (A20 Pro) `F15DB8CB-E27C-4138-98F9-D49EE23820A0` | bjorn.eriksson (Finance) | Kystgruppe Nordic |
| iPad Pro 11-inch (M5) `AEA36C2C-1CAB-4069-9BD8-0380C6F2B7A2` | omar.farooq (Owner) | Sialkot Mills (and his second company) |
| iPhone 18 Pro Max `24E57525-4CB1-4511-8210-0824BA29318E` | hina.rauf (Finance) | Sialkot Mills |
| iPad Air 11-inch (M4) `AADDA449-1D04-463E-9049-87BEB5B54AE3` | ayesha.khan (Owner) | Lahore |
| iPad Air 13-inch (M4) `E946C073-50B9-453B-82A7-A781934D27AA` | erik.berg (Accountant) | Stockholm Handel |
| iPhone 17 `DCBB4A4D-A71A-429F-8042-C93F36B14847` | sara.lind (Owner) | Stockholm Handel |
All six are booted, the debug app is installed (bundle `com.neovatus.neoerp.app.NeoERP`) and each is signed in.
**Sessions end after 30 minutes idle** (Keycloak idle timeout). Touch every device you'll still need (open a screen)
at least every 20 minutes. A device that falls back to the sign-in screen: stop using it and report it.
Never sign out on a device, and never reinstall the app or reset a simulator.
If a test needs a person on a different device, use the device that person is already on, and do the size ladder on
devices whose person fits the test (rotate and use Split View where it helps).
Switching the person on a device needs a new session file: ask the lead, and never sign in yourself.
Use the `mcp__Claude_Code_iOS_Simulator__control` tool with `device` set on each call. Check portrait on every
screen; turn the device to landscape on the iPad for each test's main screen.

## Sizes: a layout pass on every main screen of each test

**Superseded 2026-11-21:** the size list is the [QA guide](../../qa/qa-guide.md) §4 (UX-1's list). The ladder below is kept as the round 1 record.

Run the flows on the devices above. Then, for each test's main screens, run a **layout pass** across this ladder. It
covers every design breakpoint (`NeoBreakpointTokens`: phone 480, mobile 720, tablet 1024, desktop 1280, wide 1440):
One device per design band (devices in the same band show the same design, so don't repeat them):
| Band | Device + orientation (width pt) |
|---|---|
| Phone (< 480) | iPhone 18 Pro, portrait (402) |
| Mobile (720-1024) | iPad mini, portrait (744) |
| Tablet (1024-1280) | iPad Pro 11-inch, landscape (1210) |
| Tablet, narrow edge | iPad Pro 13-inch, portrait (1032, just above the 1024 breakpoint) |
| Desktop (>= 1280) | iPad Pro 13-inch, landscape (1376) |
| Narrow window on a big screen | iPad Pro 13-inch, Split View half (about 680) |
Skipped as duplicates: iPhone 18 Pro Max portrait, the other iPads in portrait or landscape.
The smallest phone (375) is covered by the automated size tests.
Also run each band once with **Larger Text** turned on in iOS Settings (Accessibility, Display & Text Size).
At each size, compare the screen with the design for that breakpoint (`NeoERP-App/docs/design/specs/` and
`docs/design/screen-rig/`). Report anything that differs from the design, and anything that's cut off, overlaps,
scrolls sideways, is hard to tap (under 44 pt), or is hidden with no way to reach it.
The desktop sizes (1024×700 up to 1920) are checked by the automated size tests and by Codex on macOS. Don't repeat them.

## Scripts (in this order)
1. `NeoERP/docs/agents/phase3-test-steps.md`: T1 to T24. **Retry T16 first** (its hand-off error was never explained).
   T10 (two instances) is now possible with two simulators: do it.
2. `NeoERP/docs/agents/a4-test-steps.md`: A1 to A18.
Known findings, which you don't report again, are in `NeoERP/docs/agents/phase3-test-findings/*.md` and
`NeoERP/docs/agents/phase3-retest/summary.md`. Read them first.
The scripts are written for desktop. Where a phone or tablet layout differs (menus collapsed, More actions, sheets
instead of side panels), follow the meaning of the step. A step you **can't do on a phone or tablet** is a finding
(flow, layout).

## For every step that changes data, check the data
After Post, Approve, Pay, Refund, Reverse, Import and the like:
1. **On screen:** the status, totals, the open amount, and the history or audit entry with the right person and time.
2. **In the ledger:** the journal is balanced (debits equal credits), uses the right accounts, period and dimensions,
   and the source link goes back to the document.
3. **In the reports:** trial balance, ageing and the related report move by exactly the amount, and drill-down lands on
   the entry.
4. **Isolation:** the other company doesn't see it, and a person without the right role can't act on it (try once).
5. **In the database (read-only):** the rows match what the screen says.
Write each expected → actual line in the report.

## Also try the wrong paths in every flow (one each, short)
The wrong role, a closed or locked period, a double click on Post, the same person posting and approving where the
rules forbid it, an amount above the open amount, and going Back mid-flow. If a wrong path **succeeds**, that's a
severity-money or severity-security finding.

## Report (one file per test) in `NeoERP/docs/agents/qa-round1/`
```
# T{nn} — {title}
Result: passed | passed with findings | failed | blocked
Devices: iPad Pro 13" (Ola), iPhone 18 Pro (Anna)
## Steps
1. passed / finding / failed — what you saw (one line)
## Data checks
- Expected → actual (screen / ledger / report / DB)
## Findings
1. Step n — what is wrong, the exact on-screen text, where, how to reproduce. Severity: money | security | flow | data | wording | layout.
   Device + orientation. Screenshot: T{nn}-step{n}-{device}.png
   Time: HH:MM
```
Save screenshots next to the reports. Quote screen text exactly. Never include a password, token or session-file
contents. At the end write `summary.md`: one line per test (result and findings count), blockers, and the top 5 findings.
