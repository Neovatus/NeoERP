# T4b short retest, R-OB + B2a-S6: tester 2 (iPad Air 13, English default, then Danish XXL)

Run 2026-11-22 21:44-22:11 (about 27 min), app build from `ios-dd-t4` (App phase/4 head), local stack, users ayesha.khan then omar.farooq.
Data (P5): fresh CSVs in `scratchpad/t4data/` (lahore-ob-r2.csv: customers QA Delta Traders 40,000 + QA Epsilon Weavers 25,000; lahore-ob-r3.csv: QA Zeta Mills 22,000 + QA Eta Garments 18,000; lahore-ob-1926.csv; lahore-ob-1925.csv), each balanced, based on the app's own template (columns account, name, debit, credit, customer). Put into the simulator by copying into the app group "File Provider Storage" (On My iPad) and choosing them with the Files picker. No clash with OB-AR-DRAFT-000006/7.

| Step | Feature | User | Result | What you saw |
|---|---|---|---|---|
| OBS-2 (English, Excel chosen) | OB import template | ayesha | PASS | Download the template with Excel selected gave `opening-balances-LHRTEX.xlsx` (10,010 bytes, `file` = Microsoft OOXML, share sheet "Office Spreadsheet · 10 KB"), not CSV text |
| OBS-2 (English, CSV chosen) | OB import template | ayesha | PASS | `opening-balances-LHRTEX.csv`, "Text Document · 7 KB" (7,293 bytes CSV text) |
| OBS-2 (English, second time, wizard from Journals menu) | OB import template | ayesha | PASS | Excel again .xlsx 10,010 bytes (Microsoft OOXML), no red "could not be saved", button re-enabled after the share sheet |
| OBS-2 (Danish, XXL text) | OB import template | ayesha | PASS | Excel -> `.xlsx` "Office Spreadsheet 10 KB"; CSV -> `.csv` "Text Document 7 KB"; labels "Download skabelonen", "En saldobalance gemt som .xlsx / som CSV" correct and not cut |
| Held-out: no re-entry when drafts exist (English) | OB import held-out card | ayesha, then omar | PASS | lahore-ob-r3 after its customers were entered: card "Customers' balances 40,000.00" shows **Open the import** and "Already entered as opening items: OB-AR-DRAFT-000012, OB-AR-DRAFT-000013"; no "Enter as opening items" button. Before entering (fresh file): button offered as expected |
| Held-out (Danish, XXL) | OB import held-out card | ayesha | PASS | lahore-ob-r2 (drafts 9, 10 exist): "Kundesaldi 65,000.00", "Åbn importen", "Allerede registreret som åbne poster: OB-AR-DRAFT-000009, OB-AR-DRAFT-000010"; no entry button; nothing cut |
| B2b-5 | Enter as opening items (customers) | ayesha | PASS | lahore-ob-r3 > Held out > Enter as opening items > Check (first time 4 problems: several branches + customers missing, as designed) > ticked Create missing customers + default branch Lahore HQ, Waiting for approval > Check "Ready to create, 2 customers new" > Create 2 balances > toast "2 balances created."; **Back to receivables opened the Receivables Invoices list** (OB-AR-DRAFT-000012/13 Waiting for approval), not a blank wizard |
| B2b-6 | Opening items entered state | ayesha | PASS | Reopened lahore-ob-r3: Customers' balances shows "Already entered as opening items: OB-AR-DRAFT-000012, OB-AR-DRAFT-000013" + Open the import; no Enter as opening items button |
| B2b-16a (Payroll round trip) | Entered state persists | ayesha | PASS | Payroll opened and left, Imported files > lahore-ob-r3 again: still "Already entered as opening items" |
| B2b-16a (company switch) | Entered state persists | omar (fresh app session, Lahore Finance Manager) | PASS | Switched Lahore > Sialkot Mills > Lahore, reopened lahore-ob-r3: same "Already entered as opening items: ...12, ...13" (so it comes from the server, not only the in-app mark) |
| B2b-17 (account 1926 HBL savings) | "Can't be created" row | ayesha | PASS | Row "Needs an account": "This account can't be created from an import. Map the row to an existing account, or create the account first (a bank account needs its bank details)."; only the Select... picker offered. Exact sentence as in the plan |
| B2b-17 (account 1925 Meezan, as the plan names it) | "Can't be created" row | ayesha | N-A | On Lahore 1925 shows "Remembered" and is already mapped to 1930 Bank - savings (mapping kept from the earlier session), so the sentence cannot show; used 1926 instead (same rule) |
| B2a-S6 | Editor note, feature off ("Untick it to go on.") | ayesha | BLOCKED | Needs "Recurring journals and accruals" switched off for the company. Ayesha (Lahore Owner) sees Company > Modules feature rows as read-only "On" pills (no switch; Payroll/branch module toggles only); Settings has only Appearance. The switch is Jonas on Kystgruppe (tester 1 devices). Draft ready: JV-DRAFT-000011 with Reverse automatically ticked (shows "Reverses 1 Dec 2026") on Lahore if someone with the switch wants it |

## Accessibility check (D-75), screens visited
Method: by eye from screenshots (no accessibility-tree or touch-target tool in this simulator session; sizes are estimates from screenshots, 1 pt = about 1.46 px of the 1499 px-wide capture). Visited: Accounts overview, Journals, Imported files, Import opening balances (4 steps), Import balances at go-live (3 steps), Invoices, Company > Modules, Payroll, Settings, Danish XXL versions of Journals, Imported files, Import wizard.

| ID | Feature | Finding |
|---|---|---|
| A11Y-1 | Link/ghost buttons ("Download the template", "Hide the file format", "Download a sample file", "Open the import", "Back", breadcrumb Back) | Visible target about 25-34 pt high, under 44 pt |
| A11Y-2 | Filter chips (Drafts / Waiting / Posted / Reverse automatically, All periods, Open, Overdue, Paid; Payroll tabs) | About 31 pt high, under 44 pt |
| A11Y-3 | Checkboxes ("To do", "Create missing customers", "These are the balances at ...") | Box about 22 pt; unclear whether the whole row is tappable |
| A11Y-4 | Toast close X, sidebar icons | X about 20 pt; sidebar icons about 40 pt |
| A11Y-5 | Accounts overview, Danish XXL | Label "Regnskabsvaluta" breaks mid-word ("Regnskabsvalut / a") in the key-value card |
| A11Y-6 | Payroll (old module) | Add button disabled with "Working... Refreshing payroll workspace" banner still showing; old module, not rebuilt |
| Names | Unnamed controls | Could not check without an accessibility tree; needs a Compose UI test or AXe (D-75 spike) |

Also seen (not A11Y, not in scope): Danish run still has English strings: dashboard "Quick access / Jump directly to any module...", breadcrumb "Companies", menu item "Approval limits", "Companies" in the sidebar flyout titles.

## Notes
- Simulator boot: the first boot of the iPad Air 13 left SpringBoard crashed ("system shell probably crashed"); shutdown + boot fixed it. Not an app problem.
- New Lahore data left behind: OB-AR-DRAFT-000009/10 (QA Delta 40,000, QA Epsilon 25,000, Waiting for approval from earlier session), 000012/13 (QA Zeta 22,000, QA Eta 18,000, Waiting for approval), unfinished imports lahore-ob-1925/1926/r2/r3 "Ready for accounts", JV-DRAFT-000011. Language reset to default (app reinstalled), text size reset to large.
- No FAIL, so no t4-shots files.

Totals: PASS 11, FAIL 0, BLOCKED 1, N-A 1.
Brief: unclear or missing, see hand-back.
