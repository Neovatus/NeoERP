# Lane ready: FIX-OB-IMPORT-APP (T4 OBS-2 template follows the format; Held out card; B2a-S6 words) — 2026-11-22

**Repo / branch:** `NeoERP-App`, `phase/4-b2-fix-ob-import-app`, head `d1d7f9d1`, on App `phase/4` `a8e004a6`. Code head is `f3d74420`; only review files follow it.
**Brief:** `docs/agents/t4-fix-ob-import/brief-app.md`, plus item 3 (T4 B2a-S6) added at hand-back. Lead decision D-58 (Jabran: "Excel gets .xlsx").
**Builder:** Opus 5.5, default effort. Report: `docs/agents/t4-fix-ob-import/builder-report-app.md`, with retest steps and an "Item 3" section.
**Tier 1.** The App gate still needs two review files for the Accounts data layer (RISK until the rest of GATE-3), so it has two independent Opus seats.

## Review files (gate format)
- `review-app-1-opus.md` (Opus 5.5): ACCEPT, 5 LOW.
- `review-app-2-opus-sec.md` (Opus 5.5 security (D-43); diff and brief only): ACCEPT, 3 LOW.
- Both: Reviewed `f3d74420`, Range `a8e004a6..f3d74420`.
- `risk-check.sh --reviews`: **REVIEWS OK**.

## What it does
1. **OBS-2:** the template follows the chosen format. Excel calls `template.xlsx` and reads raw bytes. The file name comes from `Content-Disposition` (sanitised); if it is missing or has the wrong extension, the app uses `opening-balances.{csv|xlsx}`. The demo repo has a real small .xlsx.
2. **Held out:** the app reads `summary.parties.{AR|AP}.openingItems`. A linked side shows "Already entered as opening items: {numbers}" and **Open the import** instead of **Enter as opening items**. Back returns to the OB import at its step.
   - Write answers keep the last read's link.
   - A null side (no match, or no `INVOICE.READ`/`BILL.READ`) behaves as before.
   - It works with or without the BE lane merged.
3. **B2a-S6:** the note under the ticked Reverse automatically box now ends "Untick it to go on." (new `AutoReverseWording.boxNote`; no string changed). The accrual dialog is unchanged.
- **Words:** en/nb/sv/da.

## Tests (builder, App lock)
- **Old FAIL:**
  - On `5be2844e`: 2 tests, 2 failed (Excel saved .csv; Enter offered twice).
  - On `7ea1bd5a` plus the item 3 test: 2 tests, 2 failed (the note lacked the sentence).
- **New PASS on `35f3c7c1`:**
  - JVM brief scope: 2362 tests, 0 failed. BUILD SUCCESSFUL, exit 0.
  - Android `compileDebugKotlinAndroid`: BUILD SUCCESSFUL.
  - Only docs commits after it.
- **Compose UI tests (D-69):**
  - `ObHeldOutEnteredUiTest`
  - `JournalAutoReverseFeatureOffWordsTest`
  - the format test in `ObImportControllerTest`
- **iOS:** main compiles. The iOS **test** compile fails on `kotlinx.coroutines.test` missing from the iOS test classpath. **This is pre-existing on `a8e004a6`**:
  - no build-file change in this lane;
  - `commonTest` has only `kotlin.test`;
  - 11 commonTest files on the base already use it.
  - A follow-up row.

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/t4-fix-ob-import/review-app-1-opus.md docs/agents/t4-fix-ob-import/review-app-2-opus-sec.md`. Gate FIX-OB-IMPORT-BE first; either order works.
2. Merge it.
3. **Simulator retest** (steps in the builder report):
   - OBS-2: Excel saves `opening-balances-{code}.xlsx`.
   - Lahore Held out: shows OB-AR-DRAFT-000006/-000007 with Open the import, for a user with INVOICE.READ.
   - B2a-S6: the full words.

## Follow-up rows
- **iOS test classpath:** add `kotlinx-coroutines-test` to commonTest (pre-existing).
- **Long draft-number caption** at 320 pt / 130 %: show the first few plus "and n more" (Opus LOW-1).
- **Open the import path:** the Back label says "Back to receivables/payables", and the crumbs show the Receivables path (LOW-2).
- **Crumb order:** `crumbAction` checks `obRoute` before `openingImportSide` (pre-existing, LOW-3).
- **User guide:** it does not name the missing-read-code case (LOW-4).
- **No `AccountsRoute` wiring test** for Back (LOW-5).
- **`importId` check:** validate it in the mapper with `SieImportIds.isValid` (sec LOW-1).
- **Repository `require(format)`:** it sits outside `call {}`, and `MAX_CSV_BYTES` is misnamed (sec LOW-2).
- **Untick sentence shown twice:** it appears under the box and as the Submit reason (spec §4.2.5). Kept for now; a design row.

## Docs pages
- **Developer/design:** `docs/design/specs/accounts-ob-import.md` §2.1/§2.3 and `building-blocks.md`.
- **User guide:** `docs/user-guide/accounts/opening-balance-import.md` and `accruals-and-prepayments.md`.

## Timeline (new Mac; Europe/Oslo)
- **Assigned:** the G6 ring at about 19:15. Brief and brief check at about 19:40. Item 3 added at about 21:15. Lane-ready at about 21:45.
- **Build:** about 2 h 15 m wall, much of it waiting for the App lock (TEST-SCOPE-1), plus an out-of-memory retry when it ran three jobs in one Gradle run.
- **Rework:** item 3, about 25 m.
- **Review:** seat 1 about 2.4 m, seat 2 about 2.3 m.
- **First-pass gate:** pending.
- **Size:** 28 files (+702 / −37). 3 items, 0 fix rounds.
- **Tokens:** builder about 256 k; seats about 124 k and 112 k.
- **Brief gaps:**
  - the contract path and write answers (settled by the BE builder);
  - item 3's cause (another string, not a missing one);
  - whether a server file name with the wrong extension is kept.
