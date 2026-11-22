# T4 retest results: tester 2 (G6, Lahore / Sialkot, iPad Air 13 only, 2026-11-22 ~18:46-18:55)

| Step | Feature | User | Result | What you saw |
|---|---|---|---|---|
| B2b-5 | Enter held-out customer balances as opening items | ayesha.khan | BLOCKED (DATA) | The import customers-opening-items.csv (Confirmed 13:12) was not fresh: Held out still offers "Enter as opening items" (80,000), but the wizard's Check step refuses it ("invoice number already entered as OB-AR-DRAFT-000006", 4 problems, Create disabled). Receivables > Invoices already holds drafts OB-AR-DRAFT-000006 (QA Acme 50,000) and -000007 (QA Beta 30,000) = the same 80,000. N6 data was already consumed. The other import tb-step14.csv ("Ready for accounts") Continue opens a blank File step. No data created or changed by me. |
| B2b-6 | Reopen import shows "Entered as opening items" | ayesha.khan | BLOCKED (needs B2b-5) | Not reachable. Side note: the import page still shows the Enter button although drafts for the same balances exist (they were probably entered outside this import link). |
| B2b-16a | "Entered as opening items" stays after Payroll / company switch | ayesha.khan | BLOCKED (needs B2b-5) | Not reachable. |
| OBS-1 | Lists/reports load without a tap, no stuck skeletons | ayesha.khan, omar.farooq | PASS (iPad Air 13 only; iPad Pro 11 not used) | Journals, Imported files, Invoices, Trial balance, P&L, Chart of accounts, Fiscal calendar, Tax codes all went from skeleton to rows by themselves. Load average was 420-560 at 18:47-18:48 (loads took ~10-20 s), ~20-40 from 18:51 (loads 2-6 s). Never needed a tap. |
| OBS-2 | Excel template saves as .xlsx | ayesha.khan | FAIL | Import opening balances, Format = Excel selected ("A trial balance saved as .xlsx"), Download the template: share sheet shows "opening-balances, Text Document, 7 KB"; saved file on the device is `opening-balances.csv` and `file` reports "CSV text". Expected .xlsx. CSV choice not separately tried. Shot: t4-shots/OBS-2.png |
| SW-D9 | Company switch shows new company data, nothing old flashes | omar.farooq | PASS (isolation not distinguishable) | Sialkot (Owner) and Lahore (Finance Manager): Chart of accounts (220), Fiscal calendar (FY2026-27), Tax codes (35, 32 unchecked) each showed skeleton then data; header and breadcrumb switched with the company, no old company's rows flashed. Both companies hold identical seed data, so data isolation could not be proven by content. Dimensions not opened (not checked whether on). |

Totals: PASS 2, FAIL 1, BLOCKED 3, N-A 0.
FAIL by feature: OBS-2 (Excel template download saves a CSV named opening-balances.csv).
Note for lead: omar.farooq signs in as Owner at Sialkot Mills and Finance Manager at Lahore Textiles (his default company at sign-in is Sialkot Mills).
