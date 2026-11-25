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
