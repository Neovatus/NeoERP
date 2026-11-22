# Lane verdict: FIX-APP-B2 part b — 2026-11-22

**Verdict: FIX** (old-Mac lead, test Mac). Back to the builder Mac as a fix task.
- Full gate on `56b6ba03` (base `8d7e8a96`): `verify: FAILED`, 3992 tests, **1 failed**: `A4ScreenSizeTest.importCreated`, 66 layout faults (fault list copied to `.review-channel/b2b-import-created-faults.txt`).
- Fault: on the journal import's "created" page, the new created-journal links (R17/R25: `journalImport.created.jv-imp-…` rows, 88 pt tall tap areas) overlap each other and the `JV-DRAFT-…` labels at phone-small 320×568 (en, nb) and at font 130 %. Not seen in the targeted runs on the builder Mac.
- Fix expected: the created-journal rows lay out without overlap at every A4 size (link tap area inside its own row), `A4ScreenSizeTest` passes (run it in full on the builder Mac, plus the other size tests of screens the lane touched: `Batch2ScreenSizeTest`, `ReportFilterScreenSizeTest`, `KeyboardInViewTest`); the fix check by the reviewer whose area it is (Opus); re-stamp the gate-format review files for the new head.
- Reviews ACCEPT and REVIEWS OK otherwise; no AI attribution. Gate wall 26 min (three builders running on this Mac at the same time; it was 13 min alone).
- Simulator checks not run yet (after the fix). AC418-APP waits for B2b's merge.

## Timeline (old Mac, MEASURE-1)
- Lane-ready 08:27; gate 08:28–08:54 (26 min, failed: 1 test); verdict 08:55 Europe/Oslo. Escaped into the gate: a size test outside the targeted set (L36 check item: run every size test of each screen the lane touches before hand-back).

## Round 2 — 2026-11-22: **Verdict: MERGE**, merged (standing merge)
- Gate fix `a5e2d19f` (created-journal rows without overlap; all touched size tests run in full, A4 18/0); Opus + Sonnet re-checked and re-stamped (`review-5-opus.md`, `review-6-sonnet.md`, Reviewed `c3837e72`); REVIEWS OK.
- **Full gate on `430bc5ab`:** `verify: OK`, 13 min, 3992 tests, 0 failed.
- **Simulator checks** (backend jar mode on BE `409f45e5`, three Sonnet testers in parallel; backend and simulators stopped after):
  - Ola, iPad Pro 13: 12 (GL table landscape + portrait muted line) PASS, 13 (collapsed rail flyout) PASS.
  - Anna, iPhone: 2, 4, 8, 9, 11, 15, 12-phone PASS; 1 Balanced PASS, its two italic rows **data missing** (no other-branch/no-branch lines in Kystgruppe's data); 12 Project line data missing.
  - Ayesha, iPad Air 13: 7 PASS; 16 after-restart half PASS; 5, 6 **data missing** (Lahore Textiles already has its first opening-items set; finishing would create a second set), 17 data missing (no CSV with 1925 on the device); 16 before-restart half not run (needs 5).
  - Deferred to the retest round: 3, 10, 14 (two devices / feature switch), plus the data-missing items with prepared data.
  - Observations for the retest: lists stayed on skeleton rows until a tap (iPad Pro 13, Anna's iPhone "slow"); the template download is named `.csv` when Excel is chosen.
- **Merged:** App `phase/4` `8d7e8a96` → `430bc5ab` (fast-forward, RISK marker). Jabran's checkout fast-forwarded, hooks reinstalled, worktree and lane branch removed. AC418-APP may start (cut from `430bc5ab`).

## Timeline round 2 (old Mac, MEASURE-1)
- Re-ready ~09:15; gate 09:16–09:29 (13 min); backend + iOS build + simulators set-up ~20 min (jar build needed explicit memory, sign-in needed keychain reset); checks ~11 min in parallel (Sonnet 310k + 276k + 131k tokens); verdict + merge 09:58 Europe/Oslo. Waiting for Jabran 0.
