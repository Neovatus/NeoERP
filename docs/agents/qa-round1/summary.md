# QA round 1 — summary (stopped at 12:02 because of the tester's context limit)

Setup note: the local DB had been re-seeded (Lahore was READY, no imports), so T12-T15 were run first as the prerequisite for the T16 retry.

| Test | Result | Findings |
|---|---|---|
| T16 (retry) | failed | 6 |
| T12 | passed with findings | 1 |
| T13 | passed with findings | 4 |
| T14 | passed with findings | 3 |
| T15 | passed with findings | 4 |
| T1 | passed with findings | 7 |
| T2 | passed with findings | 2 |
| T3 | passed with findings | 3 |
| T4-T11, T17-T24 | not run (context limit) | — |
| A1-A18 | not run yet | — |

Layout passes across the size ladder: not done yet (flows ran on iPad Air portrait, iPad Pro 11 portrait, iPhone 18 Pro portrait, iPad mini portrait; phone-band findings recorded inside T1).

## Blockers
- T16: opening items can't be created at Lahore (branch tag required, wizard has no branch) — blocks T16 steps 3-5.
- None on devices: all six sessions alive at 12:01 (Omar on iPad Pro 11 is switched to Lahore Textiles; switch back to Sialkot Mills for T4/T5).
- Known-findings retest: T2 old findings 1-5 and T3 old findings 2, 4, 8, 10, 11 are fixed on iOS.

## Top findings
1. T16 step 3 (flow, blocks go-live AR/AP) — "Create 2 balances" fails with "That didn't work. Nothing was changed."; server: "A line tag is missing or invalid". The opening-items wizard has no Branch field, Lahore requires one. Explains the old T16 hand-off error.
2. T15 step 4 (data) — opening journal shows Branch "Lahore HQ" on all lines, but DB has no branch on the 2000/2098 lines; TB filtered to Lahore HQ puts 325,000 Cr under "Other branches and lines without a branch".
3. T1 step 6 (data) — bill line Description loses typed text when the editor auto-adds the next empty line (iPhone).
4. T1 steps 2-3 (layout, phone) — sticky panel footer covers the field being typed into when the keyboard is up; T14 step 5 same on iPad (picker list hidden behind footer).
5. T16 step 2 (flow) — "Upload a fixed file" throws away the handed-off file; the fix the row asks for (tick Create missing customers) is only on the Upload step.

## What's left for the next tester
- T4-T11, T17-T24, then A1-A18 (`a4-test-steps.md`).
- T16 steps 3-5 after the branch fix (a PREVIEWED customers-opening-items import is left at Lahore; discard or reuse it).
- Layout pass per band (iPhone 18 Pro portrait, iPad mini portrait, iPad Pro 11 landscape, iPad Pro 13 landscape, iPad Pro 13 Split View half) and Larger Text once per band: not started. Phone and mobile bands were seen only during the T1-T3 flows.
- Test data created: Lahore live (1 Jul 2026), OB-2026-27-000001 posted; Kyst PAY-2026-000004, BILL-2026-000004, SRF-2026-000002, WO-2026-000002 posted.
- Tip for the next agent: `xcrun simctl io <udid> screenshot` + `sips -Z 900` keeps screenshots small; first taps after a sheet/drawer opens are often lost, wait ~1.5 s.
- T18 (tester 2, 12:13-12:33, iPad Air 13 Erik + iPhone 17 Sara): blocked at step 5, 8 findings. Stockholm went live 1 Jan 2026 (Sara). SIE figures match the script, but the Default branch picker is empty (Org gives no branches for Stockholm), so Next stays off for both people. SIE import left PREVIEWED.
- T24 (tester 2, 12:23-12:31, same devices): passed with findings, 6 findings. SALES and P-10 created; no company-dimension slots or pickers. A new project wasn't offered on Erik's journal at first (no projects request), and appeared only after a rotation. Phone card layout OK. Bands not covered: mobile, Split View, Larger Text.

## Second tester (12:02–12:46): T4–T8 + layout pass
| Test | Result | Findings |
|---|---|---|
| T4 | passed with findings | 7 |
| T5 | passed with findings | 3 |
| T6 | passed with findings (step 6 failed on iPad: journal line pickers unusable by touch) | 8 |
| T7 | passed with findings | 5 |
| T8 | passed with findings | 2 |
| Layout pass T4–T8 (`layout-pass-T4-T8.md`) | partly done | 5 |

Old findings confirmed fixed on iOS: T4-2/5/6/8 (Open/Paid pills, "Allocated (PKR)"), T4-3 smart match, footer names the customer; T5-1 (Owner shortcut closed for refunds); T6-1/5/6/7/9/11/13/14; T7-2/3 and the TB "Lines outside this filter" row; T8-2/3/4/5/6/7/9/11. Still open: T8-1 (override count).

Data posted (Sialkot Mills, PKR): INV-2026-27-000003 47,200.00 (journal SI-2026-27-000003); RCT-2026-27-000003 44,840.00 + WHT 2,360.00 (RC-2026-27-000003); seeded RCT-DRAFT-000004 approved as RCT-2026-27-000004 (RC-2026-27-000004); seeded RFD-DRAFT-000006 approved as RFD-2026-27-000001 (RF-2026-27-000001, Daska on account 20,000 → 15,000); seeded PAY-DRAFT-000010 approved as PAY-2026-27-000002 (PY-2026-27-000002). All journals balanced. Kystgruppe: nothing posted (drafts cancelled).

Top new findings (T4–T8):
1. T6 step 6 (flow) — journal lines can't be entered on iPad: Account / Cost centre cells in the New journal grid don't open by touch (iPad mini); on iPad Pro 13 the account list opened once without search and typing closed it.
2. T4 step 7 (layout, phone) — date filter fields open the letter keyboard, which can't be dismissed (✓, Return, tap outside all fail); list hidden until leaving the page.
3. T7 / T6 (layout, iPad) — report filter and picker lists open under the on-screen keyboard; two taps needed to open.
4. Layout pass (flow) — detail pages don't refresh after another person acts (stale "Waiting for approval" 26 min later); app ignores iOS Larger Text.
5. T4 step 0 (flow) — switching company on a report page shows "We couldn't find this".

## What's left
- T9–T11, T17–T24, then A1–A18; T16 steps 3–5 after the branch fix.
- Layout pass: Split View half on iPad Pro 13 not done; Larger Text on the mobile/tablet/desktop bands not done (the app ignored it on the phone, so check after a relaunch with the lead).
- Devices: all six sessions alive at 12:44; iPads rotated back to portrait; iPhone text size restored to Large. Omar's iPad Pro 11 is on Sialkot Mills.

## Tester 3 (12:48–13:00): T9–T11, Refunds and advances off/on
| Test | Result | Findings |
|---|---|---|
| T9 | passed with findings | 7 |
| T10 | passed with findings (two instances: Super Admin iPad + Ola/Bjørn iPads) | 4 |
| T11 | passed | 0 |
- Refunds and advances was OFF 12:50:12–12:57:21 and is back ON (DB enabled=t, change row "Phase 3 test done"). Bjørn back on Journals; Ola's iPad was taken over by another tester (landscape, Dimensions) and left there. No refund was posted from Ola's form.
- Top: T9-1 (wording) off notice "for your company" + feature named two ways; T9-3 (data) platform Overview says Kystgruppe "Books start: Not planned"; T10-1 (flow) half-filled refund form silently discarded when the feature goes off; T9-2 agreement pills "Ends in 12" missing "days".

## Third tester (12:46–13:30): T17, T19–T23
| Test | Result | Findings |
|---|---|---|
| T17 | passed with findings | 3 |
| T19 | passed with findings | 4 |
| T20 | passed with findings (step 5 two windows skipped: one window per iPad, Ola on one device) | 3 |
| T21 | passed with findings (done on iPhone, iPad grid issue confirmed on iPad mini) | 2 |
| T22 | passed with findings | 3 |
| T23 | passed with findings | 2 |

Old known issue now fixed on iOS: T21 step 3 — the journal Cost centre picker no longer offers group-only "Operations".

Data created / posted (Kystgruppe Nordic, NOK unless noted):
- Projects P-100 Harbour crane (Active), P-200 Old quay (Inactive, "Quay closed for good"); cost centres OPS Operations (group only), CRANE Crane team (under OPS).
- Company dimension 2 Vessel (`VESSEL`) with FJORD "MS Fjord" and KYST "MS Kyst". A slot "Boat" set up by mistake was deleted (reason recorded).
- **Posted:** JV-DRAFT-000026 → **JV-2026-000001** (Anna wrote, Bjørn posted 13:12): 6300 Dr 2 500,00 (CRANE, P-100) / 1920 Cr 2 500,00. Balanced.
- Drafts: INV-DRAFT-000027 (stuck, can't be opened — T22 finding 1), INV-DRAFT-000028 (P-100), BILL-DRAFT-000029 (CRANE).
- Lahore Textiles (PKR): imports lahore-tb.xlsx DISCARDED; FAILED import rows for lahore-tb.xlsx (as CSV), lahore-note.pdf and lahore-tb.xls. Test files lahore-tb.xlsx / lahore-note.pdf / lahore-tb.xls added to Files on Ayesha's iPad Air.

Top new findings (T17–T23):
1. T22 step 2 (data) — saving an invoice draft with an empty line description shows "We couldn't confirm that this went through. Reload before trying again." although the draft was created (INV-DRAFT-000027); the draft then can't be opened (same message every time). Retrying makes duplicates; the stuck draft can't be edited or deleted.
2. T17 step 3 (flow) — a discarded opening-balance import still offers "Enter as opening items" for the held-out customer/supplier balances.
3. T17 (flow) — every wrong-format file is uploaded and listed in Imported files as "Could not read the file" (FAILED rows for xlsx-as-CSV, PDF, xls).
4. T21 step 1-2 (layout, phone) — the journal line card grows after an account is picked ("Bank account" caption), so the next taps land in the wrong field.
5. T19 (flow) — new projects/cost centres/dimension values default Valid from = today, so documents dated earlier in the open month can't use them.

Layout pass for these screens: import wizard on iPad Air portrait (mobile) and landscape 1180 (tablet); Dimensions / cost-centre tree / company dimension on iPad Pro 13 landscape (desktop) and portrait, Dimensions on iPhone (phone); journal / invoice / bill cards on iPhone (phone); reports with dimension filters on iPad mini (mobile). Not done: Split View half and Larger Text for these screens.

Devices at 13:30: all six sessions alive (Ayesha touched 13:26, Omar/Hina 13:26, Ola 13:29, Bjørn 13:29, Anna 13:25). Ola's iPad Pro 13 rotated back to portrait. Ayesha's iPad Air on Lahore Journals; Omar on Sialkot Mills Refunds.

What's left: T9–T11 (other tester), T16 steps 3–5 after the branch fix, A1–A18, Split View + Larger Text passes.

## Tester 4 (13:30–14:31): A1–A9 (accruals, automatic reversal, recurring journals)
Devices: Anna iPhone 18 Pro (all journal lines and recurring editors on the iPhone — iPad grid issue), Bjørn iPad mini (posting, reversing), Ola iPad Pro 13 (layout pass, portrait 1032 + landscape).
Setup note: in this DB **every FY2026 month at Kystgruppe is OPEN** (no locked/closed months) and FY2027 does not exist — the script's "Jan–Mar locked" does not hold, so A7's skipped-date steps can't be reached.

| Test | Result | Findings |
|---|---|---|
| A1 | passed with findings | 7 |
| A2 | passed with findings | 2 |
| A3 | passed | 0 |
| A4 | passed with findings | 4 |
| A5 | passed with findings | 5 |
| A6 | not run (context) | — |
| A7 | blocked in part (no skippable month) | 2 |
| A8 | passed with findings | 2 |
| A9 | passed with findings | 3 |
| Layout pass A1–A9 (`layout-pass-A1-A9.md`) | partly done | 3 |

Data created (Kystgruppe Nordic, NOK):
- **Posted** by Bjørn (written by Anna): JV-2026-000002 6705/2960 15 000,00 (30.11, auto-reversal PENDING 01.12); JV-2026-000003 1 000,00 (auto-reversal CANCELLED, reason "A4T: invoice arrived early"); JV-2026-000004 1 100,00 reversed by hand → **RV-2026-000001** (30.11); JV-2026-000005 1 200,00 (31.12, reversal WAITING_FISCAL_YEAR 01.01.2027). All balanced, branch Oslo HQ.
- Drafts: JV-DRAFT-000034 (Accrued power A4T, reverse automatically), JV-DRAFT-000035 (year-end adjustment A4T, 31.12), JV-DRAFT-000030/31 (made by A4T Old fee, dated 01.03 and 01.04.2026 — they now show as warnings on Period close Mar/Apr).
- Waiting to post: **JV-DRAFT-000032** (A4T Rent Oslo, Nov 2026, 25 000,00) — left for A14.
- Recurring journals: A4T Rent Oslo ACTIVE (next 01.12.2026); A4T Old fee ENDED (finished by itself); A4T Pause me created, paused, resumed, ended → deleted.
- FY2027 **not** created (Period close offers "Create FY2027"; left alone).

Top new findings (A1–A9):
1. A1 (data) — accrual panel suggests Balance account **2950 Påløpt rente (Accrued interest)** for "Accrued expense" instead of 2960 Accrued expenses; you must change it by hand every time.
2. A5/A9 (data/wording) — recurring journals fill {period} in **Norwegian** ("Office rent nov. 2026", "des. 2026") and name the writer "Gjentakende bilag: A4T Rent Oslo" in Written by / Submitted / timeline, in the English app.
3. A1 (flow) — Period close for Dec 2026 shows only a generic "A check needs your attention before closing." (twice) instead of "Automatic reversals not posted" with the journal and Reverse now; on iPad mini portrait the Period close title renders one letter per line and the Status column is empty.
4. A4 (flow) — Cancel automatic reversal leaves no entry in the journal's "What happened" timeline; Journals search doesn't find a journal by its document reference (EST-A4T-3) although the placeholder says it does.
5. A8 (flow) — the duplicate-name refusal on the recurring editor appears only at the top of the page; on the phone nothing visible happens after Save.

What's left: A6 (draft-mode recurring with blank amounts, Edit to Waiting to post refusal), A7 steps 4–7 (needs a locked/closed month before Nov 2026), A8 step 9 empty state, A10–A18; layout pass for A1–A9 on iPad Pro 11 landscape, Split View half and Larger Text.
Devices at 14:31: Anna (iPhone) on Recurring journals, Bjørn (iPad mini) on JV-DRAFT-000032 (not posted), Ola (iPad Pro 13) back in portrait on Recurring journals. All three sessions alive.

## Tester 5 (14:31–15:27): A6, A10–A14
Devices: Anna iPhone 18 Pro portrait (all journal lines, recurring editor, imports), Bjørn iPad mini portrait + landscape (A14 writer/poster, A13), Ola iPad Pro 13 portrait (posting, A13).
Import files: the four A4T CSVs created in the scratchpad and copied into the iPhone's Files "On My iPhone"; picked through the iOS Files picker.

| Test | Result | Findings |
|---|---|---|
| A6 | failed (blank-amount draft lines can't be saved; rest passed with amounts) | 2 |
| A10 | passed with findings | 3 |
| A11 | passed with findings | 2 |
| A12 | passed with findings | 1 |
| A13 | failed (others can discard the uploader's check; own check doesn't resume) | 3 |
| A14 | passed with findings | 2 |

Data created / posted (Kystgruppe Nordic, NOK):
- **Posted** (all balanced, Nov 2026, branch Oslo HQ): **JV-2026-000006** 6300/1920 5 000,00 (from recurring A4T Bjorn Rent, written by the job, posted by Ola); **JV-2026-000007** 6705/2960 1 300,00 EST-A4T-6 (written+submitted by Bjørn, posted by Ola, automatic reversal PENDING 01.12.2026 authorised by Ola); **JV-2026-000008** 6300/1920 25 000,00 (= JV-DRAFT-000032 from A4T Rent Oslo, posted by Bjørn). Nov 2026: 6300 Dr 32 500,00, 1920 Cr 32 500,00.
- Recurring journals: **A4T Insurance Q** (Draft mode, every 3 months on the last day, 30.11.2026, 4 times, 6700 Dr / 2960 Cr 4 000,00 — amounts had to be filled, see A6), **A4T Bjorn Rent** (Bjørn, monthly 1st, waiting to post, next 01.12.2026).
- Imports: kystgruppe-a4t-good.csv CONFIRMED → drafts JV-DRAFT-000039 (auto-reverse), -000040, -000041; kystgruppe-a4t-fixed.csv CONFIRMED (waiting to post) → JV-DRAFT-000044…000048 **waiting to post, not posted**; problems.csv and three later good.csv checks DISCARDED (one discarded by Bjørn, see A13).

Top new findings:
1. A6 (flow) — Draft-mode recurring journal with a blank amount can't be saved: the app sends a blank line without `side`, the backend requires `side` on every line → "Check the fields and try again." (400 Invalid request fields). Draft mode's main purpose doesn't work.
2. A14/A13 (flow, layout) — iPad mini portrait: the sticky footer buttons (Save on the recurring editor, Earlier imports on Import journals) don't respond to taps; rotating to landscape makes them work.
3. A13 (flow) — a Finance Manager or Owner can Discard another person's checked import from the read-only view (backend allows holders of JOURNAL_REJECT); the uploader only learns at Create ("This check was discarded"). Script/spec say only the uploader can discard.
4. A10 (flow) — imported draft has no "Imported from {file} by {person}, key {key}" source line in the editor; the journal-import history isn't in the New journal ▾ menu ("Imported files" there is opening balances only).
5. A13 (flow) — returning to Import journals doesn't resume the person's own unfinished check.

Not done: A15–A18; layout pass (Split View half, Larger Text) for these screens.
Devices at 15:27: Anna (iPhone) on Earlier imports, Bjørn (iPad mini, back in portrait) on Import journals, Ola (iPad Pro 13 portrait) on Anna's discarded check. All three sessions alive. JV-DRAFT-000044…000048 are waiting to post (good for A15–A17 if needed).

## Tester 6 (15:31–16:04): A15–A18 (feature off/on, builder decisions)
Devices: Jonas iPad A16 portrait (Platform admin, feature switches), Anna iPhone 18 Pro portrait, Bjørn iPad mini portrait, Ola iPad Pro 13 (landscape once for A18 item 2, back to portrait).

| Test | Result | Findings |
|---|---|---|
| A15 | passed with findings | 4 |
| A16 | passed with findings (step 4 spot state not reachable; step 5 not run, no unfinished check) | 3 |
| A17 | passed with findings | 2 |
| A18 | passed with findings (22 decisions seen, 12 not visible / not testable) | 2 new (+8 pointing at earlier findings) |

Feature switches (Kystgruppe Nordic, by Jonas Moe): Recurring journals ("Recurring journals and accruals") OFF 15:39:16 → ON 15:52:06; Journal import ("Journal CSV import") OFF 15:47:47 → ON 15:52:43. **Both back ON**: org DB `company_feature_entitlements` RECURRING_JOURNALS enabled = t, JOURNAL_CSV_IMPORT enabled = t (checked 16:04); Anna's iPhone shows New accrual or prepayment, Import journals and the Reverse automatically box again. Note: the off reason for Journal import was stored as "A4 test, swi" (tester's tap landed before the typing finished).

Data created / changed (Kystgruppe Nordic, NOK). **Nothing posted.**
- Recurring journal **A4T Off month** (Anna, Draft, monthly 1st from 01.11.2026, 6800 Dr / 2990 Cr 50,00): run 1 Nov 2026 **SKIPPED_FEATURE_OFF** ("Not created: Recurring journals was off in Nov 2026", Needs you). Create draft now / Dismiss left for Jabran (both opened and cancelled).
- **JV-DRAFT-000034** (Accrued power A4T, 2 000,00, Reverse automatically): submitted by Anna **while the feature was off** (accepted, see A15 finding 1) → now waiting to post. Bjørn's post was refused while off; not posted since.
- **JV-2026-000002**: automatic reversal **CANCELLED** by Bjørn, reason "A4T cancel while off" (feature off at the time).
- Journal import: one more kystgruppe-a4t-fixed.csv check, DISCARDED by Anna (A17 step 4).
- Kystgruppe journals now: 30 posted, 6 waiting to post (JV-DRAFT-000034, 000044–000048), 6 drafts.

Top new findings (A15–A18):
1. A15 step 5 (flow, entitlement) — with Recurring journals off, a draft still marked Reverse automatically can be **submitted** (button enabled, server accepts: JV-DRAFT-000034 SUBMITTED with auto_reverse). The backend checks the feature on save and post, not on submit; the poster then gets "Reverse automatically isn't part of your plan right now." and can't fix it (only Reject).
2. A16 step 4 (flow) — with Journal import off, the breadcrumb "Import journals" on Earlier imports opens **Recurring journals**, not the import feature-off spot; the spot state is unreachable from the screen.
3. A15 (flow) — the Recurring journals list opens with **"Needs you · 1" preselected**, hiding all other recurring journals without saying the list is filtered.
4. A18 item 8 (wording) — the Automatic reversal card says "Reversed automatically on 1 Dec 2026." while it is still pending; reads as done.
5. A15/A16 (wording) — each feature has several names: "Recurring journals and accruals" vs "Recurring journals" vs "Reverse automatically"; "Journal CSV import" vs "Import journals" vs "Journal imports".
Also: switching a feature back on reached the app only on the second return to the front (~1 min, A17); switching off/on leaves an explicit company ON row instead of INHERIT (A17, low).

Devices at 16:04: all four sessions alive. Anna (iPhone) on A4T Off month detail; Bjørn (iPad mini) on Journals → Posted; Ola (iPad Pro 13, portrait) on Journals; Jonas (iPad A16) on Kystgruppe Nordic → Modules.

What's left: A6 blank-amount draft (backend fix), A7 steps 4–7 now reachable on A4T Off month (skipped run exists; Nov is open so Create draft now defaults to 01.11.2026); A16 step 4 spot title after the breadcrumb fix; A18 items 3, 4, 5, 24, 27, 33, 34; layout passes (Split View half, Larger Text) for A-screens.
