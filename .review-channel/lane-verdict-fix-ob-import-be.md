# Lane verdict: FIX-OB-IMPORT-BE (T4 OBS-2 Excel template; held-out opening-items link) — 2026-11-22

**Verdict: MERGE**, **merged** (standing merge): BE `phase/4` `0a8bbffe` → `91843a59` (fast-forward). New-Mac build; old Mac gate + merge. Lead decision D-58 (Jabran: "Excel gets .xlsx"). Tier 2 (company isolation): two Opus seats, seat B security at high effort on diff + brief only.
- Scope: new `GET /api/accounts/opening-balance-imports/template.xlsx` (same guard as the CSV, one row list for two writers, formula-guarded text cells; `XlsxExportWriter` gets `titleBlock=false`). Held-out link: `summary.parties.{AR|AP}.openingItems {importId, status, draftNumbers[]} | null`, matched on exactly the duplicate-check key (C-20 customers, C-19 suppliers), REVERSED excluded, newest non-WITHDRAWN wins, null without `INVOICE.READ` / `BILL.READ`; a link failure gives null plus a log warning, never a 500; another company's id is still 404. No migration.
- Reviews: round 1 on `71da3db3`: seat A FIX (2 MEDIUM, 5 LOW: the draft match had a date rule the duplicate refusal lacks; edge tests missing), seat B ACCEPT (3 LOW). After 1 fix round both ACCEPT on `f08ab2fd`, Range `0a8bbffe..f08ab2fd`. `--reviews`: REVIEWS OK.
- Tests (builder): old FAIL round 1 2/2, fix round 4/10; new PASS accounts-service 2225/0 (4 skipped), architecture-tests 92/0. Two-company isolation tests included.
- **Gate:** `verify: OK`, 15 min (parallel with App).
- **First-pass gate:** yes (1 run, OK).
- Follow-ups: load of the extra evaluation per detail read (cache or narrower read); WITHDRAWN filter tested only with a fake.
- Docs pages: developer `docs/api/accounts-ob-import.md` and the regenerated endpoint feature map; user guide in the App lane.
- Brief: gaps were the contract path (`summary.parties.{AR|AP}`), an unreliable SHA link (replaced by document matching) and the lead's wrong date rule (M1).

## Timeline (MEASURE-1)
- Build about 70 min (about 40 min waiting for the BE lock behind TEST-SCOPE-1); rework about 25 min (fix round 1 with its full run); review round 1 seat A 2.5 min, seat B 3 min, re-checks 0.9 + 1.1 min; gate 15 min; waiting included in build.
- Size 15+ files, 2 items, 1 fix round, 0 fix-caused findings. Tokens: builder about 300 k; seats about 140 k and 136 k; brief check about 108 k.
