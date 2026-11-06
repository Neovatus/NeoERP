# Opus review — Codex AP-8 OB import wizard (codex/ap-8 @ 981d28ac), 2026-11-06

Verdict: good mock-stage UI; do NOT merge alone — merge only together with the BE-13 wiring (H1).
Merge with dev-app (5 commits ahead, FE-5/FE-6) is clean; only shared file NeoSmartContentArea.kt.
FE-5 added `NeoFeatureAction.OpenBalanceImport` (OPENING_BALANCE_IMPORT) and `SieImport` (SIE_SE); unused by AP-8.

Holds up: live repo returns 501 OB_IMPORT_NOT_AVAILABLE; mock only under useMockData; demo notice; mock items never
handed to live AP-6 (AccountsRoute.kt:833); no iOS-unsafe calls; tokens; Next disabled with reason; state in controller.

## Lead decision (H4)
BE-13 rule wins: the opening-items hand-off fetches `GET /{id}/opening-items.csv?side=AR|AP` (server pre-filled,
`OB-{account}`, dated asOfDate) and sends `summary.parties.{side}.controlTotal` (the held-out control-account balance)
as the control total, so gaps show as CONTROL_TOTAL_DIFFERS. The app-built CSV and per-row invoice/date editor go.
Reason: the subledger items must agree with the GL control balance from the same file; a typed total adds nothing
once the server holds that balance. (Codex's "independently typed" predates BE-13.)

## High
- H1 SIE opening balances lost in live builds: AccountsRoute.kt:505 `historyOnly = true`; openSie(OpeningBalances) and
  Overview (:1010) route to the OB wizard, which is unavailable live. Fix by merging only with the wiring.
- H2 No polling: BE-13 upload answers 202 {importId,status}; table changes go PARSING → PREVIEWED.
  ObImportController.send :164-171 and options/mutate :186-196 install the answer at once → empty Check step.
- H3 SIE format lacks what the SIE OB wizard had: chosenYear / OB_PERIOD_CHOICE_REQUIRED, default branch /
  BRANCH_REQUIRED, create account, Accounts filter/paging (spec §2.3 "As AC-HSE §3.3").
- H4 Opening-items hand-off opposite of BE-13 (OB-B15): ObOpeningItemsFile.kt, ObPrefillEditor
  (ObImportPages.kt:104-121), OpeningWizardController.kt:226 blanks control total. See lead decision.

## Medium
- M1 No Party role (ObImportModels.kt:12, ObImportWords.role :64-68); mock infers AR/AP from header names; BE-13 by the
  mapped control account.
- M2 Changing number style/delimiter/sheet calls useColumns() (ObImportController.kt:175-177) → sends table.columns →
  columnsSource=PERSON unlocks Next without "Use these columns". Invalid local columns drop the style change silently.
- M3 Numbers card shows fixed text instead of summary.parse.numberStyleSamples both ways (contract §6.3); add the
  "whole numbers like 1,250 under COMMA" emphasis.
- M4 Generic error text for OB_ROWS_SKIPPED, OB_RESULT_ACCOUNTS_FOLDED, OB_HELD_OUT_AR_AP, NAME_DIFFERS,
  POST_CONTROL_NEEDED, BRANCH_REQUIRED, PARSE_FAILED, OB_MAPPING_INVALID, SIE_* (ObImportHost.kt:155-158,
  ObImportWords.kt:58). Missing "This file isn't a SIE file" (OB-B4) and OB_DUPLICATE_ACCOUNT reason PARTY_BLANK.
  Mock emits invented OB_ACCOUNT_FORMAT; BE-13 skips such rows (OB-B8).
- M5 Difference choices built from plan.yearEndTarget.role (ObImportPages.kt:34-37) instead of summary.resultToChoices.
- M6 No SIE historyOnly regression test; ObImportRepositoryTest (13 of 39) tests the mock parser only.

## Low
- JournalSieSourceTexts.kt formatName hard-codes "Excel"/"SAF-T".
- NeoNotAvailableNotice(message = "") (ObImportHost.kt:42).
- Prefill button disabled with no reason when no party rows (ObImportPages.kt:55).
- Prefill error says "balance date" but checks go-live (ObImportController.kt:237-239).
- ObImportModels.kt:94 default uploadedBy = "Demo accountant".
- JournalDetailViewModel.openSieImport: openingImportId set but OB link not wired → click does nothing.
- "History imports (SIE)" sits above "Journal" in the Journals More menu.

## Wiring list
1. data/repository/ObImportRepositoryImpl.kt:10-25 → real client on `/api/accounts/opening-balance-imports?companyId=`:
   formats, template.csv, list, get, accounts (paged), options, mappings, confirm, discard, file; multipart upload with
   `format` first, optional `encoding` (UTF_8/WINDOWS_1252, CSV only), then `file`, plus Idempotency-Key
   (extend/clone NetworkSieUploadTransport, which only has purpose/encoding parts, :154-155).
2. domain/model/ObImportModels.kt: :12 add Party; :25 delimiter enum COMMA|SEMICOLON|TAB; :27 columns as 0-based Int
   indexes with explicit nulls reverting to the server proposal; add readerOptions (chosen, numberStyleSource,
   sheets[]), summary.parse (notUsed, skippedRows, numberStyleSamples, hiddenRows), summary.folded,
   summary.resultToChoices, summary.parties{AR,AP{count,total,controlTotal},other}, summary.acknowledge (→
   requiredAcknowledgements); accounts out of the import (paged endpoint); remove prefill() (:103-107) and
   ObPartyBalance editing fields.
3. presentation/obimport/ObImportController.kt: poll while PARSING after upload and table change (:164-171, :186-196);
   send only the changed field on style/delimiter/sheet (:175-177); roles→indexes (:178-183); replace prefill editor
   with fetching opening-items.csv?side= and handing file + controlTotal (:230-243); add chosenYear, defaultBranchId,
   CreateAccount mapping.
4. ObImportHost.kt: role dropdown "Customer or supplier" (:137); real number samples (:149-150); delimiter enum (:152);
   per-problem words and places (row, column, value, example) (:155-158); year, branch, create-account controls.
5. ObImportPages.kt: resultToChoices (:34-37); held-out rows from summary.parties + server CSV (:46-57);
   summary.folded (:32); drop editor (:104-121).
6. ObImportWords.kt:10-59: add the M4 codes, OB_IMPORT_FORMAT_NOT_FOR_COUNTRY reasons, PARTY_BLANK, generic SIE_*.
7. Delete domain/usecase/ObOpeningItemsFile.kt.
8. openingimport/OpeningWizardController.kt:221-226: prefill takes and sets the control total.
9. AccountsRoute.kt: remove isMock && MockOpeningImportRepository guard (:831-836); pass server file + control total
   (:734-735); keep :505/:1010 only with the wiring; gate OB entries on NeoFeatureAction.OpenBalanceImport and the SIE
   format on SIE_SE.
10. NeoAppDi.kt:398 inject HTTP client/transports into the real repo.
11. Journals already read openingImport (OB-B14); drop sieImport fallback once shipped.
12. Tests: replace ObImportRepositoryTest with DTO/mapper tests on BE-13 JSON; add polling, party role,
    controlTotal hand-off, SIE historyOnly regression.
