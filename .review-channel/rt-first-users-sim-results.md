# core/realtime flow 4 `first-users`: simulator results (partial)

- Devices: P = Bjorn Eriksson (Finance Manager, Kystgruppe Nordic) on iPhone 18 Pro 45AD3FD4-…; ADM = Ola Nordmann (Owner) on iPad Pro 13-inch (M5) 5AB86CDD-…
- Commits: BE core/realtime/first-users ee898725 (incl. realtime-service :8089); App adcc81c1 (debug, sim-rt-app worktree)
- Stack: restarted by the lead at ~06:07 with `neoerp.accounts.exports.direct-max-lines=1` so GL exports become jobs (with the default 10,000 limit, the demo GL export is a direct file: no job, no Continue, no toast)
- Time: 2026-11-25 06:04–06:18 CET. Driver: AXe 2.1.1
- Status: **PARTIAL**. The run was stopped at step 7 while waiting for the lead's log check. Steps 8–11 were not run.

| Step | Device | Result | What I saw | Shot |
|---|---|---|---|---|
| 1 GL → Export → Excel | P | PASS (after limit lowered) | "Preparing your export…", "General ledger · Excel", Continue in background (id `accounts.export.continueInBackground`); row "Preparing…" under Your exports; no pill. With the default limit: direct file and the share sheet, no notice | 01-p-gl-excel-preparing.png, 01b-p-after.png |
| 2 Continue in background | P | PASS | Notice closes; rows stay under Your exports | 02-p-continued.png |
| 3 Go to Journals → toast | P | PASS | Toast "General ledger · Excel is ready" / "Download it under Your exports." about 2 s after Continue, shown on Journals (and on Reports) | 03-p-toast-on-reports.png, 03-p-toast-on-journals.png |
| 4 SIE export | P | BLOCKED-DATA | Kystgruppe has NO books. The SIE card is SE only (`AccountsAccess.kt` sieAccess: `countryCode == "SE"`), so the report picker has no "SIE file" | — |
| 5 SIE import | P | BLOCKED-DATA | Same reason: Journals → More ways has no SIE import for NO books. The opening-balance import needs a file from the iOS picker, and there is none on the simulator | — |
| 6 Stream down / up | P + I | PASS | realtime-service stopped ~06:11:15; pill at 06:11:31 on both devices (13–16 s): phone = orange dot, iPad = "Reconnecting…". Export without Continue finished by polling in about 3 s ("Your export is ready."). Continue in background while the stream was down: toast after 3 s. After the start, the pill went away (iPad 06:14:39, iPhone 06:14:52) | 06-p-preparing-stream-down.png, 06-p-ready-by-polling.png, 06-p-bg-toast-stream-down.png, 06-p-after-start.png, 06-P-*/06-I-* |
| 7 ADM removes Bjorn | I → P | **FAIL** | Ola: People → ⋯ → Deactivate (reason "Realtime test step 7") at ~06:16:05. iPad: "Deactivated at this company. Their other companies are unchanged." iPhone after 80+ s: no toast, no "No company" shell, header still "Kystgruppe Nordic · Finance Manager". Opening Journals shows only the page-level "You don't have access to this / Ask your company admin for access." | 07-i-deactivate-dialog.png, 07-i-after-deactivate.png, 07-p-after-60s.png, 07-p-2min.png, 07-p-after-nav.png |
| 8 Restore | I | NOT RUN | — | — |
| 9 Sign out everywhere | I → P | NOT RUN | — | — |
| 10 nb on iPad + large text | I | NOT RUN | — | — |
| 11 Second company | I | NOT RUN | (expected BLOCKED-DATA) | — |

## Findings

1. **HIGH, CONFIRMED (shots): removing a person does not reach their open app.** Screen: shell / Accounts on iPhone (P). Expected: after Ola deactivates Bjorn at Kystgruppe, a toast like "You no longer have access to Kystgruppe Nordic" and the "No company" shell. Seen: nothing after 80+ s. The stream looked connected (no pill). The shell still shows Kyst and the Accounts menu; only a 403 page on the next navigation. Backend side: V53 `iam.access_membership_trigger` fires on a status change and `access_change_flush` writes REVOKED when the person is no longer an ACTIVE member (V53__iam_domain_events.sql lines ~138–230). So the event is either not written, not pulled by realtime-service (restarted at 06:14), or not sent to Bjorn's stream. The lead was asked to check the user-service and realtime-service logs; there was no answer before this hand-back. Steps: sign P in, open Accounts → Reports; on ADM: People → ⋯ Bjorn → Deactivate → reason → Deactivate; watch P for 2 min.
2. **LOW, CONFIRMED (AX dump): pill screen-reader text has a double stop.** `shell.realtimeStatus` label reads "Reconnecting…. Live updates are reconnecting. Your work isn't affected.", from `"$label. $sentence"` in NeoRealtimeStatusPill.kt:58 while the label already ends in "…".
3. **QUESTION: the brief says "remove from company", but the app has only Deactivate (and Change access).** Deactivate keeps roles and can be reversed. Is it the right trigger for REVOKED, or is there a separate removal?

## Seen around the steps

- The Reports GL account choice resets to "Not chosen" after leaving Reports and coming back (and after the stack restart). It may be by design.
- After Ola deactivated him, Bjorn is no longer in the People list on the iPad (no deactivated row visible), so the restore path for step 8 is not obvious from the list. Not checked further.
- testTag ids are exposed as AXUniqueId on iOS (for example `shell.realtimeStatus`, `accounts.export.continueInBackground`).
- On the phone the pill is a dot only (by design, `compact`). Its label is in the accessibility tree.

## Data left

- **Bjorn Eriksson is DEACTIVATED at Kystgruppe Nordic** (not restored). He needs a reactivation as Finance Manager.
- 6 GL Excel export jobs for Bjorn under Your exports (Kyst).
- The stack runs with `direct-max-lines=1` (lead restart). realtime-service is running.
- The iPhone is still signed in as Bjorn, on the Journals no-access page.

Brief: unclear or missing: steps 4–5 need SE books (Kyst is NO); step 1 needs the direct-export limit lowered for demo data; there is no "remove from company" action, only Deactivate; steps 8–11 not run (stopped at step 7).

## Lead's evidence for step 7 (DB read-only, 2026-11-25 ~06:20)
- user-service wrote `iam.access.changed` change=REVOKED for Bjørn (recipient 1a000000-…0026) at Kystgruppe (d3300000-…0002) at 06:15:30.838 (`iam.domain_event_outbox` seq 1); delivered to consumer `realtime` at 06:15:30.94 (`iam.domain_event_deliveries` DELIVERED).
- realtime-service stored it as `realtime.stream_events` seq 7 (`access.changed`, recipient Bjørn, company Kyst).
- **`realtime.stream_connections` held only one open connection: Ola's (iPad), opened 06:14:38 after realtime-service was restarted in step 6. Bjørn's iPhone had no open stream, but showed no pill.** So the failure is on the App side: after realtime-service came back, the iPhone did not reconnect (or dropped silently) while still reporting Live. Backend path BE → realtime: works.
- Step 8 (restore) not run: **Bjørn is DEACTIVATED at Kystgruppe**; the re-test starts by reactivating him as Finance Manager (Ola on the iPad).

## Re-test (BE ee898725 / App 0bc4c7d2, 2026-11-25 06:40–07:02 CET)

- Devices: P = Bjorn on iPhone 18 Pro 45AD3FD4-…; I = Ola (Owner) on iPad Pro 13-inch (M5) 5AB86CDD-…. Driver AXe. Shots: `rt-first-users-shots/retest-*.png`.

| Step | Device | Result | What I saw | Shot |
|---|---|---|---|---|
| 0 Reactivate Bjorn | I | PASS (workaround) | The People list showed no deactivated rows and no status filter, so no Reactivate. Used Invite person (bjorn.eriksson@…, Finance Manager): "Invitation sent. Bjorn can already sign in; the company appears at their next sign-in." Lead: membership INACTIVE → ACTIVE at sign-in | retest-00b/c/d/e-i-*.png, retest-00f-p-signed-in.png |
| 1 GL Excel → Continue → toast (P) | P | PARTIAL | The job runs ("Preparing…" row, then "Your export is ready.", 13 rows under Your exports). The export notice sits ABOVE the long Your exports list, so after tapping Export (below the list) the notice and Continue in background are off-screen. The job finishes in about 2 s, so I could not tap Continue in time on the phone; no toast seen. The toast itself passed on the iPad (step 10) | retest-01-p-preparing.png, retest-02a-p-notice-offscreen.png, retest-02-p-continued.png |
| 2 (old 6) Stream down / up | P + I | **PASS** | Stop ~06:48:50; pill on both at 06:49:06 (label "Reconnecting… Live updates are reconnecting. Your work isn't affected." — the double stop is fixed). Start: iPhone Live 06:49:37, iPad Live 06:49:48. Lead: both have a new connection row (Bjorn 06:49:36, Ola 06:49:48) | retest-06-i/p-pill-down.png, retest-06-i/p-live-after-start.png |
| 3 (old 7) Ola deactivates Bjorn | I → P | **FAIL** | Deactivate (reason "Realtime re-test step 7") at 06:50:37; iPad "Deactivated at this company. Their other companies are unchanged." iPhone after ~2.5 min: no toast, no No-company shell, header still "Kystgruppe Nordic · Bjorn Eriksson · Finance Manager", and **no pill** although the stream was closed and the reconnect refused | retest-07-i-reason.png, retest-07-i-after-deactivate.png, retest-07-p-after-wait.png, retest-07-p-final-no-pill.png |
| 4 (old 8) Reactivate | I | PASS | After the deactivate the row stayed in the list as "Deactivated" with ⋯ → Reactivate; reason given; "Reactivated. Their roles and exceptions are as before." iPhone needed no new sign-in; Journals opens (New journal) | retest-08-i-reactivated.png, retest-08-p-after-reactivate.png |
| 5 (old 9) Sign out everywhere | I → P | PASS (slow) | Bjorn → Security → Sign out everywhere (reason) at 06:54:55: "13 sessions ended. They're told by email and in the app who did this." iPhone on sign-in with Notice "Your session has ended or was revoked. Please sign in again." seen at 06:55:41 (≤ 46 s, poll every ~4 s) | retest-09-i-dialog.png, retest-09-i-after.png, retest-09-p-after.png |
| 6 (old 10) nb + largest text | I | PASS | Norsk (applies after an app restart, as the Settings text says). Hovedbok 1920 → Eksporter → Excel → Fortsett i bakgrunnen: toast "Hovedbok · Excel er klar" / "Last den ned under Dine eksporter." At accessibility-XXXL the toast wraps cleanly; pill "Kobler til igjen …" fits in the header (stream stopped by the lead, 06:59:46), gone at 07:00:27 after start. Back to Device language + normal size | retest-10-i-nb-bg-1.png, retest-10-i-xxxl-toast-3.png, retest-10-i-xxxl-pill.png, retest-10-i-back-english.png |
| 7b Second company | — | BLOCKED-DATA | Not tried (no second company owned by Ola found) | — |

### Lead's evidence for step 3 (old 7), 06:50–06:53
- iam wrote `access.changed` REVOKED (Bjorn, Kyst) at 06:50:37.873 (outbox seq 3); delivered to realtime 06:50:37.99; realtime stored stream event #16 for Bjorn at 06:50:38.003.
- Bjorn's 06:49:36 connection row is gone (hub closed his stream after REVOKED, by design). The gateway shows one new `/api/stream` request at 06:50:39.72 (refused, expected 403), then nothing more.
- So either the REVOKED frame was not delivered before the close, or the App got it and did not act; after the 403 the App's access re-read did not move Bjorn out. Backend path works; FAIL is App side.
- The two stale connection rows from before the restart (last seen 06:48:44) were still listed 4 min later.

### Findings (re-test)

1. **HIGH, CONFIRMED (shots + lead DB/gateway): removing a person still does not reach their open app.** After the reconnect fix the stream reconnects (step 2 PASS), but on REVOKED the iPhone shows no "You no longer have access to Kystgruppe Nordic", no No-company shell, and keeps the Kyst header. After its one refused reconnect (06:50:39) it stops trying and shows no pill, so it reports Live with no stream. Repro: step 3 above.
2. **MEDIUM, CONFIRMED (shot + AX): on a phone the export notice is off-screen.** Reports with many rows under Your exports: the "Preparing your export…" notice and Continue in background render above the list, while Export is below it; nothing visible happens on tap, and the job is done before the user can scroll up. Shot retest-02a-p-notice-offscreen.png.
3. **LOW, PLAUSIBLE: sign-out-everywhere took up to ~46 s to reach the phone** (likely via token refresh, since its stream was dead after finding 1). The words are right but generic: the iPad says people are told "in the app who did this", the phone notice does not say who.
4. **QUESTION/LOW, CONFIRMED (shots): People list has no way back to a deactivated person after a reload.** After the earlier run's deactivate, People showed no Bjorn row and no status filter (spec §2.2: filter appears when someone is deactivated), so Invite person was the only way back. Right after a deactivate in the same session the row stays with Reactivate. Probably `countsByStatus` / list excludes deactivated after reload.
5. **LOW, CONFIRMED (AX): TB Excel direct export notice says "Lagrer… / Eksporter"** — the second line is the button verb, not the report name ("Saldobalanse · Excel"). Shot retest-10-i-nb-tb-direct.png.
6. **LOW, CONFIRMED (shot): nb Dashboard not translated**: title "Dashboard" and breadcrumb "Companies / … / Dashboard" while the menu says "Dashbord"/"Selskaper". Also "Approval limits" and "Sales channel" (dimension name, may be data) in English. Shot retest-10-i-nb-dashboard.png.
7. Fixed since the first run: the pill screen-reader double stop (finding 2 of the first run) is gone.

### Data left
- **Bjorn is ACTIVE at Kystgruppe as Finance Manager** (reactivated 06:53:40). All his sessions were ended in step 5; the iPhone is on the sign-in page.
- Invitation for Bjorn (step 0) was accepted. Extra GL Excel exports: Bjorn ~7 more, Ola 4 + 1 TB direct file.
- realtime-service running (started ~07:00). iPad: Ola signed in, English (Device language), normal text size.

## Re-test round 3 (BE ff3898a1, App 1ed44f8c)

Times UTC, 2026-11-25. Shots in `rt-first-users-shots/` (prefix `r3-`).

| Step | Device | Result | Seen | Shots |
|---|---|---|---|---|
| 1 Reports open, stream Live | P | PASS | 06:19:52 P on Accounts > Reports (13 exports listed). No "Reconnecting" pill. `realtime.stream_connections` had 2 fresh rows (last seen 06:19:58). | r3-1-p-reports |
| 2 Deactivate Bjørn | I then P | PASS | I confirmed Deactivate at 06:20:46 (membership INACTIVE 06:20:46.97). First P shot at ~06:20:54 (<10 s) already showed warning toast "You no longer have access to Kystgruppe Nordic / You're not in any company now.", breadcrumb "No company assigned", header "Bjorn Eriksson · Employee". Menu: only Dashboard, Profile, Settings (no Accounts). Stayed so through 60 s. | r3-2-i-dialog, r3-2-p-t5, t15, t25, t40, t60, r3-2-p-menu |
| 3 Reactivate | I | PASS (iPad) | People row showed "Deactivated" badge; ⋯ offered "Reactivate"; reason entered; confirmed 06:21:52; SQL status = ACTIVE. | r3-3-i-after-deactivate |
| 3b P returns to Kyst by itself | P | FAIL | 35+ s after reactivation P still shows "No company assigned", menu Dashboard/Profile/Settings only, no company switcher. No realtime push re-granted access. Needs a new sign-in (lead re-sign script). | r3-3-p-after-react |
| 4 Phone export notice | P | NOT RUN | Blocked: Bjørn not back in Kyst without re-sign-in. Re-run after lead re-signs. | none |

### Findings
- MEDIUM (CONFIRMED, r3-3-p-after-react): after reactivation the phone does not regain the company without a sign-in; the user stays on "No company assigned" with no hint or "refresh" action. Plausibly expected (token has no membership) but the no-company screen offers no way back and the stream gives no "access restored" event.
- LOW (CONFIRMED): iPad People page, "More actions for <name>" and menu items such as "People and access" appear twice with the same label (two AX nodes), so `axe tap --label` is ambiguous; no testTag ids on dialog Reason field or Deactivate/Reactivate buttons.
- LOW (CONFIRMED): an element with empty AXLabel "" appears in the iPad People screen tree (likely the page icon or unlabeled control).
- LOW (PLAUSIBLE): Reason text field has no stable id; label "Why this change is being made" duplicated.
- NOTE: Reports page "Your exports" list already had 13 entries (earlier runs), step 4 not yet verified.

### End state
- Bjørn membership: ACTIVE (SQL).
- P (iPhone): signed in as Bjørn, still on the No-company shell ("No company assigned"), needs lead re-sign into Kyst.
- I (iPad): Ola Nordmann, People page, Bjørn row back to active.

### Step 4 addendum (Bjørn re-signed into Kyst by lead; 06:23-06:25 UTC)

| Step | Device | Result | Seen | Shots |
|---|---|---|---|---|
| 4 General ledger > Export > Excel x6 (account 1100) | P | PARTIAL | Export menu offers PDF / Excel (.xlsx) / CSV. Each of 6 exports (06:24:06 first, then 06:24:29, :40, :51, 06:25:01, :12) showed a "Saving…" notice directly above the General ledger card (visible, not off-screen) and the Export button turned to "Exporting…"; each finished within ~5 s and opened the iOS share sheet (KYSTNO-general-ledger-1100-…xlsx, 4 KB). The "Preparing…/Working…" notice with "Continue in background" never appeared (exports too fast), so the Continue tap and its toast could NOT be tested. "Your exports" stayed at "· 13" after 6 exports (list not refreshed or sync exports not listed). | r3-4-p-picker, r3-4-p-exportmenu, r3-4-p-export1-a/b/c, r3-4-p-export2..6-a/b |

Findings (addendum)
- NOT TESTED: "Continue in background" position/toast: needs a slow export (large range or all accounts, or throttled backend).
- LOW (CONFIRMED, r3-4-p-export1-a/b): "Your exports" count stayed 13 after 6 new Excel exports from the page; either the list does not refresh on completion or these sync downloads aren't recorded there. Verify against the audit log/exports table.
- LOW (CONFIRMED): the export list is above the report, so on the phone the user must scroll past 13 rows to reach the report selector and Export; the page opens scrolled to the top of a long list (long-list problem, still present).
- LOW: General ledger shows "Choose an account" and no Export until an account is picked (fine), account picker rows carry both composite and split a11y labels (duplicates).

End state (updated): Bjørn ACTIVE and in Kyst on Accounts > Reports (General ledger, account 1100), share sheet dismissed. iPad: Ola on People.
