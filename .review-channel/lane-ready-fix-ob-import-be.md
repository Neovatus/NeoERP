# Lane ready: FIX-OB-IMPORT-BE (T4 OBS-2 Excel template; held-out opening-items link) — 2026-11-22

**Repo / branch:** `NeoERP-BackEnd`, `phase/4-b2-fix-ob-import-be-r`, head `91843a59`, on BE `phase/4` `0a8bbffe`. Code head is `f08ab2fd`; only review files follow it.
**Brief:** `docs/agents/t4-fix-ob-import/brief-be.md`. Lead decision D-58, with Jabran's answer "Excel gets .xlsx". Source: T4 G6 (tester 2, Lahore), FAIL OBS-2 plus the Held out observation.
**Builder:** Opus 5.5, default effort. Report: `docs/agents/t4-fix-ob-import/builder-report-be.md`, with a "Fix round 1" section.
**Tier 2** (company isolation: the new link reads across tables). Two Opus seats; seat B is security at high effort and saw only the diff and the brief.

## Review files (gate format)
- `review-be-3-opus.md` (Opus 5.5) and `review-be-4-opus-sec.md` (Opus 5.5 security (D-43)): both ACCEPT. Reviewed `f08ab2fd`, Range `0a8bbffe..f08ab2fd`.
- `risk-check.sh --reviews`: **REVIEWS OK**.
- History, round 1 on `71da3db4`:
  - `review-be-1-opus.md`: FIX, 2 MEDIUM and 5 LOW. The draft match had a date rule the duplicate refusal does not have, and edge tests were missing.
  - `review-be-2-opus-sec.md`: ACCEPT, 3 LOW.

## What it does
- **OBS-2:** new `GET /api/accounts/opening-balance-imports/template.xlsx`.
  - Same guard as `template.csv`. One sheet, header in row 1, account and name as text cells (formula-guarded), amounts empty.
  - The rows are the same as the CSV's (one row list, two writers). `XlsxExportWriter` gets `titleBlock=false`; report exports are unchanged.
- **Held out link:** `summary.parties.{AR|AP}.openingItems: {importId, status, draftNumbers[]} | null` on GET `/{id}`.
  - Matched on the opening items with exactly the duplicate-check key: customers by party + original number + direction (C-20), suppliers by supplier + normalised bill number (C-19). No date rule.
  - REVERSED is excluded, and the newest import that is not WITHDRAWN wins.
  - A side is null unless the reader holds `INVOICE.READ` (AR) or `BILL.READ` (AP).
  - A link failure gives null and a warning in the log, never a 500. `requireVisible` stays outside, so another company's id is still 404.
  - No migration.
- **Docs:** `docs/api/accounts-ob-import.md` (the route, §6.4, OB-B15, OB-B16, OBI-11) and the regenerated endpoint feature map.

## Tests (builder, BE lock)
- **Old FAIL:**
  - Round 1, on `afc4f4fe`: 2 tests, 2 failed (xlsx 400; `openingItems` missing).
  - Fix round, on `77f44b0f`: 10 tests, 4 failed (date, read codes in the rules test, failure gives null, read codes over HTTP).
- **New PASS, full run on `cd7923b5`:**
  - accounts-service 2225 tests, 0 failed, 4 skipped;
  - `:architecture-tests` 92 tests, 0 failed.
  - Exit 0, read from that run's output.
- **Isolation:** two-company tests for customers and suppliers; a reader with only `JOURNAL.READ` gets null.
- **Not run here:** `verify.sh`, the money invariants, the jar start. The local DB has no T4 Lahore data, so drafts 000006/000007 are for the retest.

## For the old Mac
1. Gate it: `scripts/verify.sh --range origin/phase/4..HEAD --reviews docs/agents/t4-fix-ob-import/review-be-3-opus.md docs/agents/t4-fix-ob-import/review-be-4-opus-sec.md`.
2. Merge it. The App lane `phase/4-b2-fix-ob-import-app` reads the field as optional, so either merge order works. Gate this one first.
3. T4 retest: OBS-2 (Excel template saves as .xlsx); the Held out card at Lahore shows "Already entered as opening items: OB-AR-DRAFT-000006, -000007" for a user with `INVOICE.READ`.

## Follow-up rows
- **Load:** each detail read of a PREVIEWED or CONFIRMED CSV/Excel import runs one extra evaluation and loads the company's whole customer or supplier list per side. Options: a cache per import version, or reading only the pre-fill's names.
- The WITHDRAWN filter is tested only with a fake (the real flow removes the items on withdraw).

## Docs pages
- **Developer:** `docs/api/accounts-ob-import.md`.
- **User guide:** in the App lane (`opening-balance-import.md`).

## Timeline (new Mac; Europe/Oslo)
- **Assigned:** the old-Mac G6 ring at about 19:15. Jabran's .xlsx answer at about 19:35. Brief and fresh brief check at about 19:40 (3 corrections per brief). Lane-ready at about 21:35.
- **Build:** about 70 m, including about 40 m waiting for the BE lock behind TEST-SCOPE-1 (D-61 log).
- **Rework:** about 25 m (fix round 1, with its full run).
- **Review:** round 1 seat A 2.5 m, seat B 3 m. Re-checks: A 0.9 m, B 1.1 m.
- **First-pass gate:** pending (old Mac).
- **Size:** 15+ files. 2 items, 1 fix round, 0 fix-caused findings.
- **Tokens:** builder about 300 k; seat A about 140 k; seat B about 136 k; brief check about 108 k.
- **Brief gaps:**
  - the contract path (`summary.parties.{AR|AP}`, not `parties.{receivables|payables}`);
  - the SHA link was unreliable (replaced by matching on the documents);
  - the lead's date rule was wrong (M1).
