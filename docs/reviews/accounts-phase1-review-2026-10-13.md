# Accounts Phase 1 end-of-phase review (journals and reports): 2026-10-13

Reviewer: Accounts lead, read-only review. No builds or tests were run.

Ranges reviewed:

| Repo | Range | Checkpoints |
|---|---|---|
| NeoERP-BackEnd | `d422e5f..origin/dev` (up to 5f48a1d) | CP-A2.1b, CP-A2.1b-FIX, CP-A2.1c, CI-1 |
| NeoERP-App | `dev-app` `9001dd6..HEAD` (2e41bbb, includes unpushed commits) | CP-A1.2a, CP-A1.2b, CP-A2.2, CP-A2.2b |
| KMM-Network | `origin/main..HEAD` | CP-NET-1 |

Checked against these documents:
- Backend contracts: `accounts-a1.md` and `accounts-a2.md` (including A2-A15).
- App specs: `accounts-a1.md`, `accounts-a2-a3.md` (the A2 parts and the "Lead amendments 2026-10-13"), `building-blocks.md` and `list-controls.md`.

## Verdict

**Not ready for Jabran's click-through yet.** Two small fixes are needed first.

Scope is complete and nothing from later phases was built. The money handling is sound, and tenant isolation and security pass. But two app DTO mismatches break the reports:
- **B-1:** the drill from a trial balance row to the general ledger fails.
- **B-2:** every report fails for a company that has not yet had its nightly ledger check.

Both are one-line nullability fixes in `AccountsA2Dtos.kt`, each with a decode test. One backend contract mismatch, M-1 (`journalTypes`), also breaks the filtered journal-listing export. Fix B-1, B-2 and M-1, and ideally M-2 and M-3, then run the click-through below.

Counts: **Blocking 2 · Major 6 · Minor 22**.

### Scope (point 1)

Everything Phase 1 promised is built:
- **Journals:** list (tabs, filters, badge), editor (keyboard, document reference and date, memo), save, submit, two-person post with the Owner's own-post option, reject, delete, reverse, opening balances and journal detail.
- **Shared building blocks:** pickers (`NeoSearchSelect` / `NeoMultiSelect`, account select), `NeoMoney`, `NeoPercent`, `NeoTypedDate` / `NeoDateField`, and the list controls.
- **Reports:** trial balance (compare, `compareChange`, `totals.difference`, drill, ledger-check banner), general ledger (date or period range, running balance, cursor) and journal listing.
- **Period close:** close-check blockers and warnings, close, reopen and lock.
- **Fiscal calendar:** status history and links.
- **Exports:** PDF, XLSX and CSV, direct or as jobs, with "Your exports", streamed download and per-platform file savers.
- **CI-1:** all services, the shared libraries and architecture tests.

Nothing outside Phase 1 was built:
- The A3 statements and year-end are absent. The year-end box is behind `yearEndBoxEnabled = false`, which the spec allows.
- One item is wider than needed: `ExportFileNames.kt` already accepts XML, ZIP and SIE file types (Minor m-19).

Named tests: every test named in backend §11 (CP-A2.1b), the A2-A15 tests, app spec A1 §10, list-controls §9 and A2 §11 exists. Two are missing:
- `ReportPerformanceTest`, which the lead deferred to CP-A2.3 (accepted).
- Tests for the new findings below.

## Findings

| # | Sev | Where (repo:file:line) | What | Fix | Owner |
|---|---|---|---|---|---|
| B-1 | **Blocking** | App:`features/accounts/data/remote/dto/AccountsA2Dtos.kt:173-174` against Backend:`delivery/http/report/dto/ReportDtos.kt:323-324` | `GeneralLedgerRangeDto.from` and `.to` are non-null `String`. The backend writes explicit `null` for a period range, and `AccountsJson` has no `explicitNulls=false` or coercion. Every general ledger opened by periods therefore fails to decode ("answer couldn't be read"). That includes **every drill from a trial balance row** (`TrialBalanceState.kt:127-135` → `GeneralLedgerRange.Periods`) and every saved period range. | Use `String? = null` for both, and let `ReportsMapper.kt:103-104` take null. Add a DTO test that decodes a period-range general ledger. | App |
| B-2 | **Blocking** | App:`AccountsA2Dtos.kt:164` (TB), `:243` (GL), `:321` (listing) against Backend:`ReportDtos.kt:200/309/443` | `ledgerCheck` is non-null in the app but nullable in the backend. `LedgerCheckDto.of` returns null until the first nightly check, which runs at 02:00 UTC only (`LedgerCheckJob`). A company that went live today, or a laptop that was off at 02:00, gets all three reports unreadable. The A1 summary DTO already handles this case. | Use `LedgerCheckDto? = null` (the mapper at `ReportsMapper.kt:267` already accepts null). Add a decode test with `"ledgerCheck": null`, as `JournalDtoTest` does. | App |
| M-1 | Major | Backend:`application/service/report/export/JournalListingExporter.kt:241` (FIELDS) and `:58` | The journal-listing export body accepts only `journalType`. The A2-A15 clarification and the app (`AccountsA2Dtos.kt:347`, `ExportsMapper.kt:60`) send `journalTypes`. `ExportBody` refuses unknown keys, so any export with a type filter gets 400 `VALIDATION`, which the app shows as a generic refusal. | Accept `journalTypes` (keep `journalType` as an alias), store `journalTypes` in the job parameters, and add a `ReportExportApiTest` case. | Backend |
| M-2 | Major | App:`presentation/AccountsRoute.kt:235` → `reports/export/ExportController.kt:332-337` (`scope.cancel()`) | Leaving Accounts or switching company while a file is being saved cancels `sink.save`. On desktop the `.part` file is deleted; on Android the document is deleted; on iOS the sheet is dismissed. A2 spec §5 says "An export already saving completes its save". | Run the save phase (and the temp-file cleanup) in an app scope or `NonCancellable`; `close()` cancels only polling and state. Add a test. | App |
| M-3 | Major | App:`core/network/NeoDownload.kt:137-150`, called from `ExportController` on `Dispatchers.Main.immediate` (`:57`) | The streamed download writes the temp file chunk by chunk on the UI thread, because nothing on the path switches dispatcher. A job export of hundreds of MB janks the UI and trips StrictMode. | Wrap `NeoDownload.fetch`, or at least the store write and close, in `withContext(Dispatchers.IO)` (`Default` on iOS). | App |
| M-4 | Major | App:`reports/export/ExportController.kt` (`refreshJobs` is called only on mount, Stop waiting and the end of the followed export); `YourExportsStrip.kt:91-114` | The "Your exports" strip never refreshes on its own. After Stop waiting, a job started in an earlier session, or "Still preparing", its row stays "Preparing…" and never offers Download until the person leaves and re-enters Reports. This undermines the lead amendment's job flow. | While any row is QUEUED or RUNNING and Reports is visible, poll `GET /exports` every 5–10 s, or add a Refresh action. Add a test. | App |
| M-5 | Major | App:`features/accounts/presentation/journals/route/JournalsPageHolder.kt:165-189` | `loadBooks` reads the chart, fiscal calendar and cost centres once per company page and never again. A period closed or locked in Period close (same page, this phase) still shows "Open" in the journal editor and on the reversal period line. A new or inactivated account is missing from, or still in, the picker until the person leaves Accounts. The server refusal is the only guard. | Invalidate books when the Journals tab or the editor opens, and after Chart, Calendar or Period close writes. | App |
| M-6 | Major | Backend:`application/service/report/export/TrialBalanceExporter.kt:202-210` | The PDF and XLSX "Out of balance by" line uses the first pair that differs (movement, then closing, then opening), not `totals.difference` as A2-A15 says. When the books are out of balance, the file can show a different figure from the screen. | Print `r.totals.difference.abs()`, and add a test that compares the file line with the API. | Backend |
| m-1 | Minor | Backend:`JournalListingExporter.kt:151, 182-183` against `ReportDtos.kt:475-476` | For machine postings, the export's "Entered by" and "Posted by" use created/posted names, while the GET uses requested/approved names (§6.11). The file and the screen disagree. | Use the same rule in both. | Backend |
| m-2 | Minor | Backend:`delivery/http/report/ReportExportController.kt:36-71` | `PERMISSION_DENIED` on export names only the missing code. §10 says it names both codes. | List both codes, or amend §10. | Backend |
| m-3 | Minor | Backend:`export/job/ExportJobWorker.kt:149-157` | `markFailed` runs after the run lock is released, so a concurrent `failStale` can set the job to INTERRUPTED and lose the real `errorCode`. | Call `markFailed` inside the locked block. | Backend |
| m-4 | Minor | Backend:`ExportJobWorker.kt:189-191`, `infrastructure/export/LocalExportFileStore.kt:32-38` | Orphaned files (from a failed `markDone` or a crash `.part`) are never swept. | Delete the file on a failed `markDone`, and sweep stray `.part` files. | Backend |
| m-5 | Minor | Backend:`ReportExportService.kt:173-180`, `GeneralLedgerExporter.kt:105-114` | A direct export streams inside the REPEATABLE READ transaction, which has a 60 s idle timeout. A slow client could receive a truncated file after the 200. | Buffer to a temp file, or document the limit. | Backend |
| m-6 | Minor | Backend:`configuration/report/ExportConfig.kt:78-82` | In the local profile, without `ACCOUNTS_EXPORTS_DIR`, a restart gives DONE jobs 410 `EXPORT_EXPIRED`. That will confuse the click-through. | Default to a stable local directory. | Backend |
| m-7 | Minor | Backend:`docs/api/accounts-a2.md` §6.4 and §6.11 examples | The examples show `source.voucherRef`; the code and X2-2 use `source.documentRef`. | Correct the examples. | Backend |
| m-8 | Minor | Backend:`ReportExportSupport.kt:148-154` | The company code in file names and PDF headers is derived from the name (known V11-9 gap). | Track with the org-facts change. | Backend |
| m-9 | Minor | App:`AccountsA2Dtos.kt:59` (`numberDisplay`), `:63` (`ReportDimensionDto.code/name`) | These are non-null in the app but nullable in the backend (`ReportDtos.kt:40-42, 412-416`). A branch without org facts makes the whole listing page unreadable. | Make them nullable. | App |
| m-10 | Minor | App:`ReportsWording.kt:205-211` | Report refusals other than RANGE_*, NO_FISCAL_YEAR, ACCOUNT_NOT_POSTING and VALIDATION fall back to "Check the filters…". This needs checking for `PERMISSION_DENIED` and `AUTHZ_UNAVAILABLE`. | Map them to the access and unavailable wording. | App |
| m-11 | Minor | App:`journals/state/JournalsListViewModel.kt:88-130` | `start()` drops its summary result if a tab is clicked before the summary answers (generation bump). The tab counts and "Waiting for you" stay missing until the next action. | Apply the summary regardless of generation, or refresh it in `selectTab` when `!started`. Add a test. | App |
| m-12 | Minor | App:`journals/route/JournalsHost.kt:198` | The editor view model is keyed on `formats`, so a late country resolution rebuilds it and loses unsaved edits. | Key on session and company only. | App |
| m-13 | Minor | App:`core/money/NeoMoney.kt` (`groupingOk`) | A trailing grouping mark while typing ("1,") shows "Digits only…" between keystrokes. | Treat it as incomplete until blur. | App |
| m-14 | Minor | App:`presentation/AccountsWording.kt:391`; `JournalDetailViewModel.kt` (~436) | The fallback says "…they apart." when `details.difference` is missing, and the currency is hard-coded as `"PKR"` when the detail is null. | Use a fixed sentence and the company currency. | App |
| m-15 | Minor | App:`journals/editor/JournalLineGrid.kt:314` | The editor's account no-match line has no "Add account" Chart link (spec §4.2.3, LC-10). | Pass `onOpenChart`. | App |
| m-16 | Minor | App:`reports/export/ExportMenu.kt:41` | Export is not paused offline (spec §5). | Gate on offline. | App |
| m-17 | Minor | App:`reports/export/ExportController.kt:292-296` | "Your exports" shows "Period 13" and "Periods 1–4", which §8 and §6 forbid. `expiresAt` uses the UTC date. | Use `ReportRanges.label`, and the local date. | App |
| m-18 | Minor | App:`accounts/.../CalendarTabHolder.kt:69-80` | The fiscal calendar calls `GET /periods/{id}` for every closed period without `PERIOD.READ` (silent 403s, N+1). | Gate on `seesPeriodClose`, and fetch lazily. | App |
| m-19 | Minor | App:`ExportWording.kt:45-49`, `ExportFileNames.kt`, `ReportsPage.kt:404-423`, `NeoDownload.kt:9,161`, `NetworkExportDownloadTransport.kt:26-27` | Small export issues: format descriptions are missing; XML, ZIP and SIE are allowed early; export can send filters that are still debouncing; comments are stale; the iOS gzip Content-Length check can misfire; the unwired transports are dead code. | Clean up with the M-2/M-3 change. | App |
| m-20 | Minor | App:`PeriodCloseViewModel.kt:404-418` | "Done by me" after an uncertain close needs `warningsAcknowledged` to match exactly. A warning that cleared in the meantime reads as "changed by someone else". | Match on actorId, action and version. | App |
| m-21 | Minor | KMM-Network:`core-network-auth-refresh/.../RefreshingNetworkClient.kt:41-52`; `ktor/KtorNetworkClient.kt` (`close`) | Streamed calls get no 401 refresh and retry; the app is not affected because it uses `NeoSessionNetworkClient.guardedStream`. `streamClient` is never closed. There are no tests for stream cancellation or for connect and socket timeouts. | Adopt the app's refresh-once pattern, or document it in CONSUMING.md. Close `streamClient`, and add the tests. | App (KMM-Network) |
| m-22 | Minor | App:`JournalDetailViewModel.confirmAttempt` (~478); `core/time/NeoTypedDate.kt` ISO regex | An uncertain reverse by the same actor can read as success. ISO input accepts one-digit month and day. | Compare versions; tighten the regex. | App |

Checked and found correct:
- **Money:**
  - **App:** `NeoMoney` uses Long minor units with overflow checks; there is no Double or Float, and no rounding (excess decimals are refused). Report figures are `AccountsReportAmount` exact strings. Nothing is computed in the app; `difference` and `compareChange` come from the server (A2-A15).
  - **Backend:** BigDecimal with HALF_UP on output only. C-5, C-6 and C-7 hold, and the running balance is carried in an HMAC-signed cursor on one snapshot.
- **Tenant isolation:** every report query filters on `company_id`. Jobs are read by (company, id) and then by creator. File keys are UUID-checked and stay under the store root. Cursors are bound to company, kind and filter.
- **Security:**
  - Download checks `REPORT.EXPORT` plus the report code fresh, and audits DOWNLOAD before the first byte.
  - Platform persons get 403.
  - The app sends the bearer token on downloads, refreshes once on 401, follows no redirects and makes the server's file name safe.
- **Two-person rule:** enforced under lock at post (`TWO_PERSON_RULE`, `OWNER_CONFIRMATION_REQUIRED`). The app follows the server's `actions` and `blockedBy`, including CONTRIBUTOR.
- **Gateway:** `/api/accounts/**` covers `/reports`, `/exports` and `/periods`.
- **CI-1:** 11 Gradle projects in a matrix, wrapper validation, cancel-per-ref.
- **Page states:** loading, empty, spot by cause, offline strip, READY note, denied and Neovatus read-only are present on every screen at 1440 and 390.

## End-to-end flows (point 2)

| Flow | Result |
|---|---|
| Draft → submit (Accountant) → post (Finance Manager) → see in trial balance and general ledger | Journal part works. Trial balance and general ledger fail before the first ledger check (**B-2**). The drill to the general ledger fails (**B-1**). |
| Reverse a posted journal | Works. |
| Opening balances | Works (OB through the same create path, voucher rules worded). |
| Close a month with blockers and warnings, then reopen, then lock | Works. All period refusal codes are mapped, and 409s re-read. |
| Trial balance direct export, general ledger export as a job then download | Works. Problems: M-2 (save cancelled on leave), M-3 (UI thread), M-4 (strip stale), M-6 (out-of-balance line). |
| Journal listing with type filter, then export | The listing works. The filtered export is refused (**M-1**). |

## Click-through script for Jabran (after B-1, B-2 and M-1 are fixed)

**Setup:**
1. Start the backend stack and run `NEOERP_SEED_A1_JOURNALS=1 ./scripts/seed-demo-accounts.sh`.
2. To see an export job without 10,000 lines, start accounts-service locally with `neoerp.accounts.exports.direct-max-lines=5`. Also set `ACCOUNTS_EXPORTS_DIR` so finished files survive a restart (m-6).

**Demo company and people:** Kystgruppe Nordic.
- `anna.lindh`: Accountant.
- `bjorn.eriksson`: Finance Manager.
- `ola.nordmann`: Owner.

Passwords are in `NeoERP-BackEnd/docs/local-demo-data.md`.

**Layouts:**
- **Desktop:** window at 1440 wide.
- **Phone:** Android emulator, or the desktop window under 720 wide.

| # | Where | Who | Do | Expect |
|---|---|---|---|---|
| 1 | Desktop | Anna | Open Accounts → Journals. | Tabs with counts; the seeded draft, submitted, posted and reversed journals; the badge shows the waiting count. |
| 2 | Desktop | Anna | New journal (JV): two lines, 1 250,00 debit expense and credit 1921 bank. Type the date as `13.10.26`. Fill in document reference, document date and a memo. Press Ctrl+S, then Ctrl+Enter. | The amount is grouped the Nordic way and the date is read as 13.10.2026. The draft is saved, then Submitted. There is no Post button, and the two-person notice shows. |
| 3 | Desktop | Anna | Clear the memo on a new draft and try to submit. | "Memo" refusal on the field (`MEMO_REQUIRED`); nothing is lost. |
| 4 | Desktop | Björn | Journals → "Waiting for you" → open Anna's journal → Post, with a reason. | Posted, and the timeline shows Anna submitted and Björn posted. The badge count drops. |
| 5 | Desktop | Björn | Reports → Trial balance, current year. | Balanced tag, with expense and bank 1921 moved by 1 250,00. The ledger-check banner is absent, or says "not yet checked", and does not error (B-2). |
| 6 | Desktop | Björn | Turn on Compare to the previous range. | The Change column is filled from the server and there is a totals compare row. |
| 7 | Desktop | Björn | Click the 1921 row. | The general ledger opens for 1921 with the period range chip "from the trial balance" (B-1). The running balance ends at the trial balance closing figure, and the source link opens the journal. |
| 8 | Desktop | Björn | On the posted journal: Reverse, with today's date and a reason. | A reversal journal is created. The general ledger shows both, and the net is zero. |
| 9 | Desktop | Björn | Reports → Journal listing → Type = JV → Export → CSV. | With the 5-line threshold: "Preparing your export…", then "Your export is ready.", then Download saves a CSV that has a BOM and only JV lines (M-1). |
| 10 | Desktop | Björn | Trial balance → Export → PDF. | Direct save with the server's file name. The PDF has the totals and "Page 1 of n". |
| 11 | Desktop | Björn | General ledger export (XLSX) as a job → "Stop waiting" → stay on Reports. | The "Your exports" row turns to Download on its own (M-4). Otherwise leave and re-enter Reports. |
| 12 | Desktop | Ola | Accounts → Period close → last month → Check. | The checklist shows blockers (for example the unposted draft) and warnings. Close stays disabled while there are blockers. |
| 13 | Desktop | Ola | Delete or post the blocking draft, then Close, ticking the warnings and giving a reason. | Period CLOSED. The fiscal calendar shows Closed with the history "by Ola Nordmann". A journal dated in that month is refused `PERIOD_CLOSED`. Re-open the editor; with M-5 fixed, the period line shows Closed. |
| 14 | Desktop | Ola | Reopen with a reason, close again, then Lock. | Reopen then re-close work. After Lock, Reopen is no longer offered and a write in that month is refused `PERIOD_LOCKED`. |
| 15 | Phone | Anna then Björn | Repeat steps 1, 2, 4, 5 and 7, and download one export. | The list shows cards, the editor shows line cards, and Post my own journal sits under More (Owner only). The trial balance and general ledger show as cards with sticky totals, and the export saves through the platform's save sheet. No horizontal scroll. |
