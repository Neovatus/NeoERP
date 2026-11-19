# QA round 1 retest (report only)

Same rules, devices, sizes and report format as the first round: read `NeoERP/docs/agents/qa-round1/brief.md` first and follow it,
except where this file says otherwise. The local stack was **reset and reseeded** (19 Nov): earlier test data is gone; Kystgruppe now has 3 LOCKED months;
Stockholm Handel has org number 556334-3689. The app is the new build with the QA1 fixes (phase/4 f42afb54).

## Devices (all signed in fresh)
The first round's table plus: iPad Air 13 `E946C073-50B9-453B-82A7-A781934D27AA` = erik.berg (Stockholm, Accountant), iPhone 17 `DCBB4A4D-A71A-429F-8042-C93F36B14847` = sara.lind (Stockholm, Owner),
iPad (A16) `802B7D68-B38A-44A6-BD3E-A0D315771E4F` = jonas.moe (Platform admin). Never sign out, reinstall or reset a simulator.

## What to retest
1. **Every fixed group.** Read `NeoERP/docs/agents/qa-round1/findings-grouped.md`. For each group G01–G47, re-run the steps of its findings (same test, same step, same device class) and record per finding:
   fixed / still broken / changed (new problem). Don't re-run whole scripts unless a group needs the setup.
2. **The NOT-RUN list** in the same file (T16 steps 3–5 at Lahore with a Default branch, T18 steps 5–7 at Stockholm, T10 step 3, A6 step 5, A7 steps 4–7 now that months are locked, A16 steps 4–5, A18 items).
   Some need setup from earlier tests (T12 go-live at Lahore, T18 go-live at Stockholm): do that setup first; go-live is permanent on this database.
3. **Size and input checks** the builders could not do on the JVM: iOS keyboard (numbers keyboard with Done, no letters, select-all on entry, dates), pickers on iPad by one tap and with typing,
   footer collapsing with the keyboard, side panels above the keyboard (no double shift), iPad mini portrait footer taps (G14), value links tap area, phone Filters button with count and summary,
   card heads with two buttons on iPad mini, iOS Larger Text on every band **including dialogs and pickers** (turn it on in Settings, relaunch not needed), iPad Split View half, the phone side menu over a month panel.
4. **New: resizable layout check.** On the iPhone Duo simulator if present (`xcrun simctl list devices | grep -i duo`), install the app only if the lead has set it up; otherwise skip and say so.

## Known and accepted (don't report)
- Dates on screens read "1 Dec 2026" (decision: one format). Typed fields use the company format.
- The backlog items in `NeoERP/docs/backlog.md` "QA1 leftovers" (G15 refresh on resume, G19 rest, G25, G30, G08 stored-row indicator, ⌘K shortcut, 200 % text journals grid).

## Report
In `NeoERP/docs/agents/qa-round1-retest/`: one file per group checked (`G01.md` …) or per test where you ran a test (`T16.md`), screenshots next to them, and `summary.md`
with a table: group, result (fixed / still broken / partly), new findings. Mark severity as in round 1. Write each file as soon as it is done; append to summary.md.
