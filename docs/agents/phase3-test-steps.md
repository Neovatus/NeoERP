# Accounts Phase 3: click-through test steps

For Jabran. App: NeoERP-App dev-app 808f8ec2 (desktop JVM), local backend stack with the Phase 3 demo data seeded.
Written from the code and the seed scripts, not from a run, so a label that differs on screen is a finding: send it back.

## Read this first

- **Sign-in:** open the app, click **Continue with NeoERP ID**, and sign in at the browser page with the username
  (or email) below. Password: see `NeoERP-BackEnd/docs/local-demo-data.md`. Sign out with **Sign out** at the bottom of
  the sidebar before switching people. Omar belongs to two companies: pick the company with the chip at the top
  ("Company: ..., change company").
- **Menu path:** the sidebar group **Accounts** holds Overview, Journals, then two headings **Receivables** (Invoices,
  Credit notes, Receipts, Refunds, Customers, Ageing) and **Payables** (Bills, Debit notes, Payments, Refunds received,
  Suppliers, Ageing), then Reports, Period close, Chart of accounts, and so on. Written below as
  *Accounts → Payables → Payments*.
- **More actions:** the square "..." button next to a page's main button (tooltip "More actions").
- **Amounts:** written with a point (`2,500.00`). Type them the way the field's grey example shows: comma decimals for
  NOK and SEK companies, point decimals for PKR. Leave every date as today (Kystgruppe Jan-Mar are LOCKED for good; only
  Nov 2026 is open there).
- **Seed amounts you can rely on:**
  - Kystgruppe Nordic (NOK): customer *Fjordtech AS* invoice A, 16,150.00 gross, **6,150.00 open**; *Nordlys Bygg AS*
    invoice B 50,000.00 with a 12,500.00 write-off already posted; supplier *Fjord Energi AS* has a **3,000.00
    advance still open** (5,000.00 paid, 2,000.00 deducted); supplier *Bergen Kontorservice AS* has **1,000.00 credit**
    (paid 1,500.00 on account, 500.00 refunded).
  - The BE-14 acceptance scripts also ran on this stack and posted their own tagged documents, so totals that are not
    listed here can be higher than the seed alone gives.
  - Sialkot Mills (PKR): customer *Sialkot Sports Traders (Pvt) Ltd* (NTN and STRN on file), invoice 2 for 59,000.00 is
    approved and **open** (its receipt waits for Hina); customer *Daska Garments Co* has a 5,000.00 refund **waiting
    for Hina**; supplier *Faisalabad Yarn Mills* payment 2 (59,000.00) waits for Hina.
- **Things that differ from the brief (code says so):**
  1. Lahore Textiles is READY (not live). The Journals page switches **New journal** off while books are not live, and
     **Confirm** refuses with "Opening balances can be imported once the books are live." So the opening-balance import
     (tests OB-1 to OB-5) needs Lahore to **go live first**. That is permanent on the local database. See OB-0.
  2. The invoice and bill editors have **no** cost centre, project or free-dimension picker. The journal editor has
     Branch, Stock location and Cost centre only. Projects and free dimensions can be seen nowhere in the app yet
     (`AccountsFeatureGates` says so). So SB2d is tested through the journal view and the report filters (DIM-1, DIM-2).
  3. The button is **Record advance** (not "Record an advance").
  4. With **Refunds and advances** off, the two menu entries **Refunds** and **Refunds received** also disappear.

People used (all usernames are in local-demo-data.md):

| Company | Person | Role |
|---|---|---|
| Kystgruppe Nordic | `anna.lindh` | Accountant (prepares, cannot approve) |
| Kystgruppe Nordic | `bjorn.eriksson` | Finance Manager (approves) |
| Kystgruppe Nordic | `ola.nordmann` | Owner |
| Sialkot Mills | `omar.farooq` | Owner (prepares here) |
| Sialkot Mills | `hina.rauf` | Finance Manager, second approver |
| Lahore Textiles | `ayesha.khan` | Owner |
| Stockholm Handel | `erik.berg` / `sara.lind` | Accountant / Owner |
| Neovatus | `jonas.moe` | Platform Admin (switches features) |

---

# 1. M5 payables

## T1. Pay a supplier in advance, then deduct it on a bill

Who: `anna.lindh` prepares, `bjorn.eriksson` approves. Company: Kystgruppe Nordic. Supplier: Fjord Energi AS.

1. Sign in as Anna. *Accounts → Payables → Payments*. Click the "..." button next to **Record payment**, then **Pay in advance**.
   Expected: a side panel titled **Pay in advance**, subtitle "Money paid to a supplier before they deliver, against their prepayment invoice. Someone else approves it; the final bill deducts it later."
2. Fill: Supplier *Fjord Energi AS*; Date: today; Paid from: the main bank account (1920); Amount paid (NOK) `2,500.00`; Reference `ADV-DEMO-1`.
   Expected: no errors yet; the panel now shows the heading **Supplier's prepayment invoice** and a block **What it's for**.
3. Supplier's prepayment invoice number `PP-9001`; Prepayment invoice date: today. Under **What it's for**: Description `Prepayment, December power`; Tax code: the Norwegian no-VAT advance code (`NO-ADV-OOS-IN`, "Advance paid, no VAT"); Amount including VAT (NOK) `2,500.00`.
   Expected: footer reads "Paid 2,500.00 · lines 2,500.00". The line says "No VAT on this advance". No amber "VAT can't be claimed" warning (a no-VAT line needs no invoice number).
4. Click **Submit for approval**.
   Expected: toast "... sent for approval." with "Someone else approves it."; the payment opens as a submitted advance; Anna has no Approve button (she wrote it).
5. Sign out, sign in as Bjorn. *Accounts → Payables → Payments*, open the new advance (it carries the **Advance** mark, 2,500.00). Click **Approve payment**, then **Approve** in the sheet "Approve {number}?".
   Expected: the sheet says "It gets the next payment number and goes into the books as money paid ahead to the supplier. The final bill deducts it later. A mistake is corrected by reversing it." After Approve: toast "Payment {number} approved." / "It is in the books. Send the money from your bank."
6. Sign out, sign in as Anna. *Accounts → Payables → Bills → New bill*. Supplier *Fjord Energi AS*; Supplier's invoice number `FE-4700`; leave dates; one line: Description `Shore power, December`, Qty `1`, Unit price `10,000.00`, Tax code the 25 % input VAT code (`NO-MVA-IN-25`).
   Expected: a card **Advances** shows two notices: "You paid Fjord Energi AS 3,000.00 in advance (...)" (the seeded one) and "You paid Fjord Energi AS 2,500.00 in advance (...)" (yours), each with **Deduct from this bill**. Bill total 12,500.00 (10,000.00 + 2,500.00 VAT).
7. Click **Deduct from this bill** on the 2,500.00 notice.
   Expected: a row "Advance {number} deducted", field **Amount including VAT** with hint "Up to 2,500.00 is still open.", and the footer "Advance deducted 2,500.00 · left to pay 10,000.00".
8. Click **Submit for approval**. Sign out, sign in as Bjorn, open the bill under *Bills*, click **Approve**.
   Expected: the bill is posted with 10,000.00 left to pay (deduction line -2,500.00).
9. As Bjorn open *Payments* and the 2,500.00 advance.
   Expected: the advance shows **Deducted 2,500.00**, open 0.00, and a link back to the bill; its **Reverse** action is disabled with "A bill has deducted this advance, or the supplier refunded part of it, so it can't be reversed."

## T2. Supplier refund received: record, post with confirmation, check the detail

Who: `anna.lindh` (one person records and posts). Company: Kystgruppe Nordic. Supplier: Bergen Kontorservice AS (1,000.00 credit).

1. Sign in as Anna. *Accounts → Payables → Refunds received*.
   Expected: the list shows one posted refund (the seeded 500.00 from Bergen Kontorservice), tabs Drafts / Posted / Reversed. Button **Record refund received** is enabled.
2. Click **Record refund received**.
   Expected: side panel "Record refund received", subtitle "One person: whoever records it posts it."
3. Supplier *Bergen Kontorservice AS*.
   Expected: card **Pays back** ("What Bergen Kontorservice AS owes you...") lists one row **Credit with supplier** with **Left 1,000.00**.
4. Date received: today; Received into: the main bank account; Amount `400.00`; Bank reference `SR-DEMO-1`. Type `400.00` in the **Pays back** column of the row.
   Expected: footer "Received 400.00 = balances 400.00 + advances 0.00"; **Post refund** becomes enabled. (Pressing **Everything** instead assigns the whole 1,000.00 if the Amount is 1,000.00.)
5. Click **Post refund**.
   Expected: a confirmation sheet "Post refund for {number} Bergen Kontorservice AS?" with "It gets the next number and goes into the books for 400.00." and buttons **Cancel** / **Post refund**. Nothing is posted yet.
6. Click **Post refund** in the sheet.
   Expected: toast "{SRF number} posted." / "What it paid back is settled." The refund page opens.
7. Check the detail page.
   Expected: heading "Refund received from a supplier", status **Posted**, line "Posted by Anna Lindh on {today}", facts **Journal** and received-into account, card **What it paid back** (Credit with supplier, 400.00), card **History** ("Recorded by Anna Lindh", "Posted by Anna Lindh"). **Reverse** and **Delete draft**: Reverse is offered, Delete is not (posted).
8. Open *Payables → Suppliers*, open Bergen Kontorservice AS.
   Expected: the supplier sheet shows credit of 600.00 left (1,000.00 - 400.00).

## T3. Write-off with Finance Manager approval (own approval refused)

Who: `anna.lindh` prepares, `bjorn.eriksson` approves. Company: Kystgruppe Nordic. Invoice: Fjordtech AS, 6,150.00 open.

1. Sign in as Anna. *Accounts → Receivables → Invoices*, search `Fjordtech`, open the invoice with 6,150.00 open. Click **Write off...** (More actions menu if it is not on the page).
   Expected: sheet "Write off {invoice number}?" with "Open 6,150.00. You can write off less."
2. Amount `1,500.00`; Why `Customer disputes freight, agreed loss`; Evidence `CASE-DEMO-7`.
   Expected: a line "1,500.00 goes to bad debts. VAT of {x} is given back to you." and "Someone other than you approves it. If the customer pays after all, the write-off can be undone (two people)." (If the VAT line says no VAT is given back, report it.)
3. Click **Submit for approval**.
   Expected: the invoice now shows "Write-off {number} · Waiting for approval" with an **Open** link.
4. Click **Open**.
   Expected: the write-off page, status Submitted. Anna has **no Approve button**; she sees either "You wrote, changed or sent this write-off, so someone else must approve it." (with Withdraw to draft) or "Approving needs the approve right, which your role doesn't have. A Finance Manager or the Owner can approve it."
5. Sign out, sign in as Bjorn. *Accounts → Receivables → Invoices*, set the Type filter to **Write-offs**, open the waiting write-off.
   Expected: a primary **Approve** button.
6. Click **Approve** and confirm.
   Expected: text "It gets the next write-off number and 1,500.00 is allocated to its invoice. The invoice's credited lines are unchanged." After approving, the write-off is Posted and the Fjordtech invoice has 4,650.00 open (6,150.00 - 1,500.00); it is not marked **Written off** because only part was written off.
7. Own approval refused for the Finance Manager. Still as Bjorn: open the Fjordtech invoice, **Write off...** `100.00`, Why `Own approval test`, **Submit for approval**, open the new write-off.
   Expected: no Approve button for Bjorn; the line "You wrote, changed or sent this write-off, so someone else must approve it."; main button **Withdraw to draft**.
8. Click **Withdraw to draft**, then in More actions **Delete** it so the demo stays tidy.
   Expected: the write-off is gone from the invoice.

---

# 2. Sialkot two-person

## T4. Omar prepares an invoice and a receipt with tax withheld; Hina approves both

Company: Sialkot Mills (PKR). Customer: Sialkot Sports Traders (Pvt) Ltd. Tax code PK-ST-18 (18 %).

1. Sign in as `omar.farooq`, pick **Sialkot Mills**. *Accounts → Receivables → Invoices → New invoice*. Customer *Sialkot Sports Traders (Pvt) Ltd*; one line: Description `Football, match size 5`, Qty `4`, Unit price `10,000.00`, Tax code `PK-ST-18`.
   Expected: total 47,200.00 (40,000.00 + 7,200.00 tax).
2. Click **Submit for approval**.
   Expected: invoice shows Submitted. Omar, although Owner, has **no "Approve my own invoice"**: the note reads "You wrote, changed or sent this invoice, so someone else must approve it." (Hina exists, so the Owner shortcut is closed.)
3. Sign out, sign in as `hina.rauf` (Sialkot Mills). *Accounts → Receivables → Invoices*, open the waiting invoice (47,200.00), click **Approve**.
   Expected: invoice becomes Posted with an INV number; open 47,200.00. (If approval is refused for a missing NTN or STRN, send back the exact words: the seed warns about that.)
4. Sign out, sign in as Omar. *Receivables → Receipts → Record receipt*. Customer same; Date today; Paid into: a bank account; Amount received `44,840.00`; Reference `MCB 00419999`.
   Expected: card **Settles** lists the customer's open invoices (the 59,000.00 seeded one and the new 47,200.00).
5. Click **Add tax withheld**: Code `PK-WHT-BY-CUST · 5 %`; Withheld `2,360.00`; Withheld from `47,200.00`; Certificate number `WHT-DEMO-010`. In **Settles** type `47,200.00` against the **new** invoice only (do not use **Oldest first**: it would pick the seeded one).
   Expected: note "Tax was withheld (or a small difference is taken), so someone else approves this receipt." Footer "Received 44,840.00 + withheld 2,360.00 = 47,200.00 · Allocated 47,200.00 · 0.00 stays on Sialkot Sports Traders (Pvt) Ltd's account". The main button reads **Submit for approval** (not Post receipt).
6. Click **Submit for approval**.
   Expected: receipt is Submitted; Omar has no approve button.
7. Sign out, sign in as Hina. *Receivables → Receipts*, open the waiting receipt, click **Approve receipt**, then confirm.
   Expected: toast "Receipt {number} posted." Status Posted; the invoice shows 0.00 open and **Paid**.
8. As Hina, still on *Receipts*, open the seeded waiting receipt (56,050.00, reference `MCB 00418911`) and approve it too.
   Expected: posted; the 59,000.00 invoice is settled (56,050.00 + 2,950.00 withheld).

## T5. Omar's own refund approval is refused; Hina approves

Company: Sialkot Mills. Refund: Daska Garments Co, 5,000.00, submitted by Omar (seeded).

1. Sign in as Omar (Sialkot Mills). *Accounts → Receivables → Refunds*, open the 5,000.00 refund to Daska Garments Co.
   Expected: status Submitted; payee card; a card **Before you approve**.
2. Look at the buttons.
   Expected: no **Approve refund** button. Either the line "You wrote, changed or sent this refund, so someone else must approve it." shows, or (if the page offers **Approve my own refund**) clicking it ends in the notice "Someone else can approve this refund, so send it for approval instead." Report which one you saw.
3. Sign out, sign in as Hina. *Receivables → Refunds*, open the same refund.
   Expected: main button **Approve refund**, More actions has **Send back**.
4. Click **Approve refund**.
   Expected: sheet "Approve refund {number}?"; confirm it. No "Owner's own" box for Hina.
5. Confirm.
   Expected: refund Posted, "Approved by Hina Rauf"; Daska's money on account drops from 20,000.00 to 15,000.00 (*Receivables → Customers*, open Daska Garments Co).
6. Same for payables (optional): as Hina open *Payables → Payments*, payment 2 to Faisalabad Yarn Mills (59,000.00), **Approve payment**.
   Expected: toast "Payment {number} approved."; no own-approval box.

---

# 3. Dimensions (SB2d)

Kystgruppe has the Free dimensions add-on. Seeded values: cost centres *Oslo operations* (OSL-OPS), *Bergen operations* (BRG-OPS), project *Harbour terminal upgrade* (HARBOUR-26), free dimension *Sales channel* (Direct, Partner). Lahore has *Lahore factory floor*, *Lahore sales office*, project *Export order programme 2026*, channel (Retail, Wholesale, Export).

## T6. What exists in the app, and the tags in a journal

Who: `bjorn.eriksson`. Company: Kystgruppe Nordic.

1. Sign in as Bjorn. *Accounts → Receivables → Invoices → New invoice*, add a line.
   Expected: the line has Description, Qty, Unit price, Tax code, Income account, Discount only. **No** cost centre, project or Sales channel picker. (This is the known gap: say so in your notes, it is not a failure.) Click **Cancel**.
2. *Accounts → Payables → Bills → New bill*, add a line.
   Expected: the same: no dimension picker. **Cancel**.
3. *Accounts → Receivables → Invoices*, open invoice A (Fjordtech AS, 13,000.00 net, 16,150.00 gross). Read the **Journal** fact.
   Expected: a journal number like JV/INV-... is shown.
4. *Accounts → Journals*, find that journal (search its number) and open it.
   Expected: source line "From Sales invoice ..."; the **Lines** card has a **Cost centre** column: lines show *Oslo operations* (the 10 x 1,000.00 crane line and the 2,000.00 channel line). No Project column and no Sales channel column exist.
5. *Accounts → Payables → Bills*, open bill BK-20931, open its journal the same way.
   Expected: the expense line for 4 x 312.50 (1,250.00) shows *Bergen operations* in the Cost centre column; the 899.00 line shows none (its project has no column).
6. *Accounts → Journals → New journal*, add a line on an expense account.
   Expected: the line has a **Cost centre** cell (default option "Default · No cost centre"); choosing it lists *Oslo operations* and *Bergen operations*. For an account that is "Not tagged by cost centre" the cell is disabled with that reason. **Cancel** (no need to post).

## T7. Report filters by cost centre

Who: `bjorn.eriksson` (or `ola.nordmann`). Company: Kystgruppe Nordic.

1. *Accounts → Reports → Profit and loss*. Fiscal year FY2026, this year so far.
   Expected: the filters row shows Fiscal year, From, To, Branch, **Cost centre** ("All cost centres"), Compare.
2. Open **Cost centre**, choose *Oslo operations*.
   Expected: figures drop to what carries that tag: sales of at least 12,000.00 (invoice A: 10,000.00 + 2,000.00); a note "... on accounts that aren't tagged by cost centre isn't included. Those are company-wide costs or income, such as interest or tax."
3. Choose *Bergen operations*.
   Expected: cost of at least 1,250.00 (bill BK-20931, line 1) and no sales from invoice A.
4. Back to **All cost centres**.
   Expected: totals are larger than either filtered figure.
5. *Reports → Trial balance*. **Cost centre** *Oslo operations*.
   Expected: only tagged accounts keep their lines; the row "Other branches and lines without a branch" carries what is outside the filter so the totals still balance.
6. *Reports → General ledger*, Account: the income account of invoice A (the one named in the journal from T6), Cost centre *Oslo operations*.
   Expected: ledger rows for invoice A's tagged lines with a **Cost centre** column, running balance.
7. Check that there is no Project filter.
   Expected: the filters stop at Branch and Cost centre; projects cannot be filtered in the app yet (record it as a gap).

---

# 4. Feature entitlements (FE)

## T8. Company → Modules labels

1. Sign in as `ola.nordmann` (Kystgruppe, Norway). Sidebar group **Company** → **Modules**. Open **Finance**.
   Expected: heading with "Features · n of m on". Norwegian statutory duties (VAT return, SAF-T, e-invoice sending for Norway) show the pill **Required by law** where a switch would be; no switch.
2. Look for features of other countries (FBR digital invoicing, Pakistani tax filing, SIE for Sweden).
   Expected: **not listed at all** (hidden, no "Not for this country" row).
3. Find **Free dimensions**.
   Expected: tags **Add-on** and **Bought**.
4. Find an add-on the agreement does not cover (for example **Budgets**, if listed).
   Expected: tags **Add-on** and **Not bought**; no "Required by law" or country pill. Names are never cut off with "...".
5. Sign out, sign in as `ayesha.khan` (Lahore Textiles, Pakistan). **Company → Modules → Finance**.
   Expected: FBR digital invoicing and Pakistani tax filing show **Required by law**; no Norwegian VAT return or SAF-T. **Free dimensions** shows **Add-on** and **Bought**.
6. Click a switch or the pill as Ayesha.
   Expected: nothing changes; a company Owner reads only ("Set by your agreement with Neovatus").

## T9. Switch "Refunds and advances" off (platform admin) and check the screens

Company used: Kystgruppe Nordic (it has a posted write-off to check).

1. Sign in as `jonas.moe`. Sidebar **Platform** → **Companies**, open *Kystgruppe Nordic*, tab **Modules**, open **Finance**, find **Refunds and advances**.
   Expected: a switch that is on.
2. Click the switch.
   Expected: dialog "Record the reason" labelled "Finance · Refunds and advances disabled for Kystgruppe Nordic".
3. Reason `Phase 3 test, switching back later`, click **Apply change**.
   Expected: the feature shows off; Finance line reads "Features · one fewer on".
4. Sign out, sign in as `anna.lindh`. Look at the sidebar.
   Expected: under Receivables there is no **Refunds**; under Payables no **Refunds received**. Everything else is there.
5. *Receivables → Invoices*, open a posted invoice with something open (Fjordtech AS); look at the buttons and More actions.
   Expected: no **Write off...** and no disabled leftover. Open *Credit notes*, a posted credit note: no **Refund...**. *Receipts*, a posted receipt: no **Refund...**. *Customers*, open a customer: no **Refund...**.
6. *Receivables → Receipts*, click More actions. *Payables → Payments*, click More actions.
   Expected: no **Record advance** and no **Pay in advance**. (The "..." button may be gone altogether.)
7. *Receivables → Invoices → New invoice*, customer *Nordlys Bygg AS* (has 9,500.00 advance open); then *Payables → Bills → New bill*, supplier *Fjord Energi AS* (advance 3,000.00 open).
   Expected: **no Advances card** in either editor and **no red error notice or "Try again"** at the bottom or top. Lines, totals and Submit for approval work as normal. **Cancel**.
8. *Receivables → Invoices*, Type filter **Write-offs**, open the posted 12,500.00 write-off (Nordlys Bygg AS).
   Expected: the write-off is fully readable (amount, reason, journal); no action buttons; one neutral line "Refunds and advances are off for Kystgruppe Nordic".

## T10. The feature-off page wording

The page shows only when you are already on it as the feature goes off (the menu hides it otherwise). It needs two things at once: a second person to flip the switch, and a window that notices. If you can only run one app window, skip this test and tell me.

1. Sign in as `ola.nordmann` (Owner, Kystgruppe). **Accounts → Payables → Refunds received**; leave the page open.
   Expected: the list of refunds received (Refunds and advances is on).
2. In a second app window (or after Anna's session changes nothing), `jonas.moe` switches **Refunds and advances** off for Kystgruppe Nordic as in T9 steps 1-3. (Skip if already off from T9 and go to step 3 with a fresh sign-in.)
   Expected: Ola's window still shows the list.
3. In Ola's window click **Record refund received**, fill supplier, date, account, amount, and click **Post refund** (or just bring the window back to focus after 5 minutes).
   Expected: the write is refused and the app re-checks what is on; the page becomes an off page.
4. Read the page.
   Expected, as Owner: title "Refunds and advances are off for Kystgruppe Nordic" (plural "are"), neutral tone; the line "Neovatus decides what your agreement covers." only when the agreement does not cover it; button **Ask Neovatus**.
5. Click **Ask Neovatus**.
   Expected: opens *Company → Modules* where the feature request is made. (Back there is also fine: the label is **Back**, not "Go to dashboard".)
6. Sign in as `anna.lindh` (not an Owner) and reach the same page the same way.
   Expected: "Ask your company admin to turn it on." (or "...to turn on Refunds and advances."); no request button; a **Back** button.

## T11. Switch it back on

1. Sign in as `jonas.moe`. **Platform → Companies → Kystgruppe Nordic → Modules → Finance → Refunds and advances**, click the switch, reason `Phase 3 test done`, **Apply change**.
   Expected: the feature is on again.
2. Sign out, sign in as Anna.
   Expected: **Refunds** and **Refunds received** are back in the sidebar; **Write off...** is on open invoices; More actions on Payments shows **Pay in advance**; the bill and invoice editors show the **Advances** card again.
3. Open the 12,500.00 write-off.
   Expected: the "are off" line is gone and its normal actions (Undo write-off...) are back.

---

# 5. Opening-balance import at Lahore (AP-8)

## T12. OB-0: prerequisite, go-live at Lahore (decision for Jabran)

Lahore Textiles is READY. The Journals page switches the import off until the books are live, and the Confirm step refuses
before that. **Going live is permanent on this local database and ends "READY for the import" for any other test**, so
confirm that is fine before doing it.

1. Sign in as `ayesha.khan` (Lahore Textiles). *Accounts → Overview*.
   Expected: a not-live notice with **Review and go live**.
2. Click **Review and go live**; choose the first day of a month as the go-live date (any offered date); resolve any blocker the checklist lists; confirm.
   Expected: the Overview turns Live. Write down the go-live date G: balances in the import will be "at G minus 1 day".
3. *Accounts → Journals*, click the arrow part of **New journal**.
   Expected: the menu lists **Journal**, **Opening balances**, then **Import opening balances...**, **Imported files**.

## T13. OB-1: CSV template, upload, wait while reading

Who: `ayesha.khan`. Company: Lahore Textiles (PKR, point decimals, comma separator).

Sample file, save as `lahore-tb.csv` (UTF-8). Accounts come from the Lahore chart: 1920 Bank - main operating account, 1500 Trade receivables (customer control), 2400 Trade payables (supplier control), 2000 Share capital. Account 1925 is deliberately **not** in the chart.

```csv
account,name,party,debit,credit
1920,Bank - main operating account,,300000.00,
1925,Meezan savings account,,25000.00,
1500,Trade receivables,Gulberg Retail Traders,120000.00,
1500,Trade receivables,Model Town Stores,80000.00,
2400,Trade payables,Kasur Cotton Suppliers,,90000.00
2400,Trade payables,Lahore Packaging Works,,60000.00
2000,Share capital,,,375000.00
```

(Debits 525,000.00 = credits 525,000.00. Customers 200,000.00, suppliers 150,000.00.)

1. *Accounts → Journals → New journal ▾ → Import opening balances...*
   Expected: page "Import opening balances" with the stepper **File - Check - Accounts - Confirm**; format hint "A trial balance saved as CSV: one row per account with its balance." (Excel is the second format; a format switch appears.) Footer buttons are not shown until a file is chosen.
2. Click **Download the template**.
   Expected: toast/notice "File saved" and a save dialog; the file `opening-balances.csv` has the header `account,name,debit,credit` and your chart's accounts ("Your chart's accounts, ready to fill in.").
3. Click the file field (Choose file) and pick `lahore-tb.csv`.
   Expected: a progress bar while sending, then "Reading the file..." with a skeleton; the page moves to **Check** by itself, no empty step.
4. Wait for it.
   Expected: the stepper shows **Check**; cards **Columns**, **Numbers**, **Date** appear.
5. Click the "..." button beside the title, then **Imported files**.
   Expected: list "Imported files · 1" with your file, a **CSV** tile and a status pill (Ready to check). **Continue** returns to the wizard.

## T14. OB-2: Check step, then Accounts mapping with Create account

Continue from T13.

1. On **Check**, look at the **Columns** card.
   Expected: because there is a `party` column the file is not the plain template: a table "In the file / Used as" with samples; account = Account number, name = Account name, party = **Customer or supplier**, debit = Debit, credit = Credit. Hint "Check what each column holds. We've filled in what the headers suggest."
2. Change **debit** to **Not used**, then click **Use these columns**.
   Expected: an error such as "Choose a balance column, or a debit and a credit column." Set it back to Debit and click **Use these columns** again; the file is read again and the error goes.
3. **Numbers** card.
   Expected: toggle "1 250,50 | 1,250.50" is on **1,250.50**; "From your file" samples like `300000.00 → 300,000.00`. Switch to `1 250,50`: samples now say "can't be read with this style" or show a different value and the whole-number warning may appear. Switch back to `1,250.50`.
4. **Date** card.
   Expected: "These balances are read as at the end of {G minus 1}, in PKR." and a tick box "These are the balances at {date}". **Next** is disabled with a reason until you tick it.
5. Tick the box, click **Next**.
   Expected: the **Accounts** step: table "In the file / Balance / Your account". Rows 1920, 1500, 2400, 2000 are matched; 1500 and 2400 are marked **Held out**; 1925 shows the grey tag **Needs an account** with a button "Create account 1925 Meezan savings account".
6. Tick **To do**.
   Expected: only 1925 stays. Click **Create account 1925 Meezan savings account**.
   Expected: the row's account becomes the new account, marked "New account"; the tag disappears.
7. Look at the bottom of the card.
   Expected: key list Debit / Credit / **Difference**; a line "Enter held-out balances as opening items in Receivables or Payables."; two rows **Customers' balances 200,000.00** and **Suppliers' balances 150,000.00**, each with **Enter as opening items**. If the Difference is not zero, a field "Where the difference goes" offers retained earnings and opening balance equity.

## T15. OB-3: Confirm and the result page with journal statuses

1. On **Accounts**, click **Next**.
   Expected: the **Confirm** step: "Creates {n} opening-balance journal(s) dated {G} from CSV file lahore-tb.csv and submits it/them. Someone else with the right to post must post it/them." Button reads **Create and submit journals**.
2. Click **Create and submit journals**.
   Expected: the result page titled `lahore-tb.csv`, a **CSV** tile and the pill **Confirmed**; facts **Balances at {G minus 1}** and **Confirmed {Ayesha Khan} · {time}**; **Download original file** button.
3. Look at the card **Journals**.
   Expected: each journal is "Journal {number}" with its own status (not all "Waiting to post"); after submit they read waiting. Click one.
   Expected: the journal detail opens with a source line naming the import file and the date, and a link back to the import.
4. Sign out, sign in as `omar.farooq` (Accounts Admin at Lahore, company Lahore Textiles), open that journal and **Post** it (someone other than Ayesha posts).
   Expected: Posted. Reopen the import under *Imported files*: the journal now reads **Posted**.
5. *Accounts → Reports → Trial balance*.
   Expected: 1920 300,000.00 Dr, 1925 25,000.00 Dr, 2000 375,000.00 Cr; the held-out 1500 and 2400 are still zero; account 2098 Opening balance equity shows the 50,000.00 held-out net (to be cleared in T16).

## T16. OB-4: hand-off to opening items for customers and suppliers

Use a fresh import of the same file if T15 confirmed it: the hand-off is offered on the Accounts step of an import that is still in preview, or from the result of a confirmed one. If it is not offered on the confirmed import, repeat T13-T14 (the confirmed file is refused as already confirmed; change one name in the CSV and re-upload) and stop at the **Accounts** step.

1. On the Accounts step click **Enter as opening items** next to **Customers' balances 200,000.00**.
   Expected: the wizard "Import balances at go-live" (Receivables) opens with the file already chosen (name shown as selected) and the field **Total from your old system** already holding **200,000.00**, with PKR on the right.
2. Click **Check the file**.
   Expected: the summary shows "Total in your file" 200,000.00, "Total from your old system" 200,000.00 and the green **They match**; the balances table lists Gulberg Retail Traders 120,000.00 and Model Town Stores 80,000.00 with original numbers `OB-1500`. If parties are missing, the page offers the checkbox to create customers.
3. Click **Create 2 balances** and confirm.
   Expected: card "2 balances created from {file}" with **Open the import**.
4. Go back to the import and click **Enter as opening items** next to **Suppliers' balances 150,000.00**; **Check the file**; **Create 2 balances**.
   Expected: control total prefilled 150,000.00, **They match**; supplier bills Kasur Cotton Suppliers 90,000.00 and Lahore Packaging Works 60,000.00.
5. Approve both (a second person: `ayesha.khan` approves what `omar.farooq` created, or the other way round), then check *Reports → Trial balance*.
   Expected: 1500 shows 200,000.00 Dr, 2400 shows 150,000.00 Cr and **2098 Opening balance equity is 0.00**.

## T17. OB-5: a wrong-format file, then "Use Excel instead"

Needs an `.xlsx` of the same data: open `lahore-tb.csv` in Excel or Numbers and save as `lahore-tb.xlsx`.

1. *Accounts → Journals → New journal ▾ → Import opening balances...*, keep format **CSV**. Choose `lahore-tb.xlsx`.
   Expected: the file is refused on the File step with red text "This looks like Excel, not CSV." and a button **Use Excel instead**. No move to Check.
2. Click **Use Excel instead**.
   Expected: the format becomes **Excel**, the hint reads "A trial balance saved as .xlsx: one row per account with its balance.", the same file is read ("Reading the file...") and the Check step opens with a **Sheet** field in the Columns card.
3. Click "..." beside the title, then **Discard import**, and confirm in "Discard this import?".
   Expected: "Import discarded"; no journal was created.
4. Start again, keep **CSV**, choose a PDF (any PDF).
   Expected: "This looks like a PDF, not CSV." and no "Use ... instead" button (a PDF is no offered format).
5. Choose an old `.xls` file if you have one (otherwise skip).
   Expected: "This looks like an older Excel file (.xls), not CSV." and "Save it as .xlsx or CSV, then choose it again."

---

# 6. SIE (Swedish)

A Swedish demo company exists: **Stockholm Handel** (`erik.berg` Accountant, `sara.lind` Owner). It has the SIE add-on and is READY, so it must go live first like Lahore (T12), and that is permanent. A usable SIE file is in the repo: `NeoERP-BackEnd/services/accounts-service/src/test/resources/phase2/kyst-se-fy2026.se` (company "Stockholm Handel", ORGNR 556334-3689, fiscal 2026, accounts 1930, 2081, 2641, 6110).

## T18. SIE opening balances at Stockholm, two people

1. Sign in as `sara.lind`, pick Stockholm Handel. *Accounts → Overview → Review and go live*, choose 1 January 2026, confirm (skip if already live).
   Expected: Overview Live.
2. Sign out, sign in as `erik.berg`. *Accounts → Journals → New journal ▾ → Import opening balances...*
   Expected: the wizard with the stepper File - Check - Accounts - Confirm; the only format is **SIE**, so no format switch; hint "An SIE file (.se) from your previous program."
3. Choose `kyst-se-fy2026.se`.
   Expected: "Reading the file..." then Check.
4. Look at the Check step.
   Expected: card **What the file holds** (Program, Company in the file "Stockholm Handel", Currency SEK, Version); the **Date** card with the tick "These are the balances at 31 December 2025"; no Columns table (SIE has no columns).
5. Tick it, **Next**.
   Expected: accounts 1930 Bank, 2081 Aktiekapital, 2641 Ingående moms matched to the BAS chart; any unmatched has **Create account ...**. Balance sheet only; the 1,000.00 cost on 6110 (last year's result) is shown as "Income and expenses ... are last year's result" and a field "Where the difference goes" (choose retained earnings).
6. **Next**, then **Create and submit journals**.
   Expected: result page with the pill **Confirmed**, a **SIE** tile, journals waiting to post.
7. Sign out, sign in as `sara.lind`, open the journal, **Post** it.
   Expected: posted by Sara (second person); *Accounts → Journals* now lists it as Posted.

---

# If something fails

Send me, for each problem:

1. The test number and **step number** (for example "T3 step 4").
2. What you saw on the screen: a screenshot of the whole window, and the exact words of any red or amber notice.
3. Who was signed in, and which company the top chip showed.
4. For a missing or different label, what the label said instead.

Also tell me when a step has to be skipped (for example T10 without a second window, T12 if you do not want Lahore live) so I do not read the skip as a pass.
