# AC418-APP simulator checks (old Mac, 2026-11-22)

Local stack, iOS Simulator, debug build. Not committed. Demo data date is 22 Nov 2026, so ranges differ from the brief's
("Jan–Oct" is Jan–Nov here). Test data I created on the local stack: invoice INV-DRAFT-000011 approved (INV-2026-000005), bill
BILL-DRAFT-000020 approved, journal JV-DRAFT-000034 submitted, project PRJ-9 (Stockholm), two draft Lahore opening balances
and one opening-balance import confirmed (OB-DRAFT-000008 waiting to post), Lahore customers "QA Acme Textiles" and "QA Beta
Garments". NO-MVA-IN-15 default was set and then reverted to NO-MVA-IN-25 (step 18). Opening-items CSVs were made by me in the
scratchpad (none exist in the repos): `customers-opening-items.csv` (trial balance with a customer column), `ar-duplicate.csv`
(opening-items format), `tb-step14.csv`.

| Step | Device / user | Result | What I saw |
|---|---|---|---|
| 1 | iPad Pro 13 landscape, Ola | PASS | Exact dates shows 01.01.2026 and 30.11.2026 (the chosen Jan–Nov months), list reloaded. |
| 2 | iPad Pro 13, Ola | PASS | From 01.02.2026 To 10.03.2026: "No posted journals in 1 Feb – 10 Mar 2026." (demo data has none in that span, so inclusion of rows could not be seen). |
| 3 | iPad Pro 13, Ola | PASS | Export CSV opens the share sheet "KYSTNO-journal-listing-20260201…" (file name starts with the dates, 304 bytes = header only). After leaving Accounts and reopening Reports → Journal listing: same 01.02.2026–10.03.2026. |
| 4 | iPad Pro 13, Ola | PASS | From 15.03 / To 01.03: "From must be before To." under To; nothing listed; Export greyed. |
| 5 | iPhone 18 Pro, Anna | PASS | TB: one line "Period: Jan–Nov 2026 ▾", no fields; panel "Period" (year, From, To, This period / Year to date / Last year), This period + Done → line "Nov 2026", reloaded. Same line on Balance sheet ("As at: 22 Nov 2026 ▾"), P&L, Cash flow, GL, Journal listing, Journals (opened its panel with Exact dates too). |
| 6 | iPad Pro 13, Ola | PASS | Jan–Apr TB → account 1920: ledger shows chip "Jan–Apr 2026 · from the trial balance" instead of period fields. Chip kept after switching report tabs and back (a fresh menu open resets the whole ledger, account too). Tapping chip: Exact dates 01.01.2026–30.04.2026, chip gone. |
| 7 | iPhone, Anna | PASS | Journals period To = Dec 2026: "Dec 2026 and the year-end adjustments share the year’s last day, so this list shows both." |
| 8 | iPhone, Anna; iPad Pro 13 portrait | PASS | GL 1920 and Journal listing cards: number link and date on one line, nothing overlaps the description; at extra-extra-large the same, nothing cut (no wrap needed). iPad portrait (sidebar collapsed): table with the memo wrapped over 2–3 lines, not one word (not cards; table kept at that width). |
| 9 | iPhone, Anna, Larger Text | PASS | P&L: "Total operating expenses" whole; Cash flow: "Dividends and other equity changes" wraps, all names whole. |
| 10 | iPad mini Bjørn + iPad Pro 13 Ola | PASS (invoices, bills) | Invoices: Ola approved INV-DRAFT-000011 → Bjørn left the app (Settings) and came back: row INV-2026-000005 shows Open, "Waiting for approval" tab gone, no pull. Bills: same with BILL-DRAFT-000020 → BILL-2026-000004 Open, tab gone. Checked 2 lists only (invoices, bills); menu badges not read before/after. |
| 11 | iPad Pro 11 Sara + iPad Air 13 Erik | PASS | Sara added PRJ-9. Erik's New journal page opened before the add listed only P-10 (page already open); he left and opened New journal again (no rotation, no sign-out): the line's Project picker lists P-10 and PRJ-9. |
| 12 | iPad Air 13, Ayesha | PASS | OB CSV with customer column → Enter as opening items → check "Tick Create missing customers"; Upload step still shows customers-opening-items.csv and total 80,000.00; ticked it + default branch → Check the file ran ("Ready to create"), no "Choose a CSV file". |
| 13 | iPad Air 13, Ayesha | PASS | Imported files: "Ready for accounts"; Continue opened step 3 of 4; after choosing difference account + branch: "Ready to confirm"; Continue opened Confirm with the balance-date tick; ticked both, Create and submit journals worked. |
| 14 | iPad Air 13, Ayesha | PASS | At step 3: tapping step 2 and step 1 opens them; tapping step 4 does nothing. |
| 15 | iPad Pro 11, Omar | **FAIL** | Reports → Trial balance at Sialkot Mills worked; company chip → Lahore Textiles: page shows "We couldn't find this" (stays; Reports again from the menu also shows it). Journals at Lahore loads fine. Shot: sim-shots/step-15.png. |
| 16 | iPad mini, Bjørn | **FAIL** | Journal JV-DRAFT-000034 written and submitted by Bjørn: detail banner "You wrote, changed or submitted this journal, so someone else must post it." (general sentence); expected "You submitted this journal, so someone else must post it." There is no Post button for the author (only Reject), so the 403 path itself could not be tried. Bill "You sent this for approval…" not tried. Shot: sim-shots/step-16.png. Note: he is both writer and submitter (two roles); TwoPersonReason gives the general sentence for several roles, so this may be as designed. |
| 17 | iPhone + iPad Pro 13, Anna | PASS | Memo line under each active row's name (e.g. "Insurance premium accrual nov 2026", "Office rent des 2026, Oslo HQ"); ended row "A4T Old fee" (status filter incl. Ended) shows none. |
| 18 | iPad Pro 13, Ola | PASS | NO-MVA-25 "Default for sales", NO-MVA-IN-25 "Default for purchases". Make default NO-MVA-IN-15 + reason: toast "NO-MVA-IN-15 is now the default for purchases."; tag moved; new bill line starts on NO-MVA-IN-15. Deactivate NO-MVA-IN-15: "NO-MVA-IN-15 is the default for new purchase lines. Make another code the default first." Reverted: NO-MVA-IN-25 default again (toast shown). Not seen: the bill-line tax before the change (the open bill line used NO-MVA-IN-25). |
| 19 | iPad Air 13, Ayesha (Lahore) | PASS (Lahore); N-A (removed default) | Lahore: PK-ST-18 "Default for sales" (PK-ST-IN for purchases); new invoice line Tax = PK-ST-18. No company with a removed default exists: not tested. |
| 20 | iPad Air 13, Ayesha | PASS (file part); BLOCKED (hand-entered part) | Opening-items import with an already-entered customer + number: "Row 2: this customer's invoice number is already entered as OB-AR-DRAFT-000006." Create is off ("Fix the problems…"). Hand-entered duplicate + Submit: BLOCKED (the hand-made opening-item draft editor shows qty 0 / price 0 and no separate original-number field; could not make a submittable duplicate). |

## Other findings (not in the steps)
- Re-uploading an identical OB file that was already confirmed opens the import at File step with "This import cannot be changed in its current state." (probably the server returning the confirmed import; not a step).
- Journal editor (SEK company, Erik): document-date field format YYYY-MM-DD; NOK company DD.MM.YYYY; fine.

## Time
Chunk 1: 14 min (+ 14 min re-check of steps 1–4 and 6 afterwards). Chunk 2: 15 min. Chunk 3: 14 min.
