# Lane verdict: FIX-OB-IMPORT-APP (T4 OBS-2 template format; Held out card; B2a-S6 words) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): App `phase/4` `a8e004a6` → `d1d7f9d1` (fast-forward). New-Mac build; old Mac gate + merge. D-58. Tier 1, but two independent Opus seats because the App gate wants two review files for the Accounts data layer (RISK).
- Scope: (1) Excel calls `template.xlsx` and reads raw bytes; file name from sanitised `Content-Disposition`, fallback `opening-balances.{csv|xlsx}`. (2) Held out card reads `summary.parties.{AR|AP}.openingItems`: shows "Already entered as opening items: {numbers}" and **Open the import** instead of **Enter as opening items**; null side behaves as before; works with or without the BE lane. (3) B2a-S6: the note under the ticked Reverse automatically box now ends "Untick it to go on." (`AutoReverseWording.boxNote`). Words en/nb/sv/da.
- Reviews: seat 1 ACCEPT (5 LOW), seat 2 security ACCEPT (3 LOW), both on `f3d74420`, Range `a8e004a6..f3d74420`; `--reviews` REVIEWS OK. 0 fix rounds.
- Tests (builder): old FAIL 2/2 (Excel saved .csv; Enter offered twice) and 2/2 (note lacked the sentence); new PASS JVM scope 2362/0, Android compile OK. Compose UI tests added. iOS test compile fails on `kotlinx.coroutines.test` missing from the iOS test classpath: pre-existing on `a8e004a6` (follow-up row).
- **Gate:** `verify: OK`, 13 min.
- **First-pass gate:** yes (1 run, OK).
- Follow-ups: iOS test classpath; long draft-number caption at 320 pt / 130 %; Back label and crumbs on the Open-the-import path; crumb order; user guide missing-read-code case; no `AccountsRoute` Back wiring test; `importId` validation in the mapper; repository `require(format)` and `MAX_CSV_BYTES` name; untick sentence shown twice (design row).
- Docs pages: developer/design `docs/design/specs/accounts-ob-import.md` §2.1/§2.3 and `building-blocks.md`; user guide `opening-balance-import.md` and `accruals-and-prepayments.md`.
- Brief: gaps were the contract path and write answers, item 3's cause (another string, not a missing one), and whether a server file name with the wrong extension is kept.

## Timeline (MEASURE-1)
- Build about 2 h 15 min wall (much of it waiting for the App lock behind TEST-SCOPE-1, plus an out-of-memory retry when three jobs ran in one Gradle run); rework (item 3) about 25 min; review seat 1 2.4 min, seat 2 2.3 min; gate 13 min.
- Size 28 files (+702 / -37), 3 items, 0 fix rounds. Tokens: builder about 256 k; seats about 124 k and 112 k.
