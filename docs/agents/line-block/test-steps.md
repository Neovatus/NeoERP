# Lines as a table: test steps (LB-1)

**Sign-in:** `anna.lindh`, company Kystgruppe Nordic. Use **Save draft** only, not Submit.

## L1. Pay in advance with three lines (wide window)

1. Make the app window wide (full screen). Go to *Payables → Payments → **Pay in advance***.
   **Expected:** the line area is a table, with the headers **Description · Tax code · Amount including VAT (NOK)** and one row under them.
2. Fill in the top of the form:

   | Field | Enter |
   |---|---|
   | Supplier | Fjord Test Leverandør |
   | Paid from | 1900 Cash |
   | Amount paid (NOK) | `600` |

3. Click **Add line** twice.
   **Expected:**
   - three rows;
   - each ends with a small **×** (remove) icon;
   - hovering or tabbing to the icon says "Remove line 1", "Remove line 2", and so on.
4. Fill in the three rows:

   | Row | Description | Amount including VAT |
   |---|---|---|
   | 1 | `Deposit A` | `100` |
   | 2 | `Deposit B` | `200` |
   | 3 | `Deposit C` | `300` |

   **Expected:** the footer reads "Paid 600,00 · lines 600,00".
5. Click the **×** on **row 2** (Deposit B).
   **Expected:**
   - two rows remain: **Deposit A 100** and **Deposit C 300**, in that order;
   - nothing has moved between rows;
   - the footer reads "lines 400,00".
6. Click **Cancel** without saving.

## L2. Narrow window or phone

1. Make the window narrow (drag it under about 760 px wide), or open the app on your phone. Open **Pay in advance** again and click **Add line** once.
   **Expected:**
   - each line is a card with a heading "Line 1", "Line 2";
   - each field has its own label above it;
   - each card has a **Remove** button.
2. Make the window wide again.
   **Expected:** it goes back to the table, and anything you typed stays.

## L3. Invoice and bill

1. *Receivables → Invoices → **New invoice***. Pick customer **Bergen Test Kunde** and add two lines:

   | Row | Description | Qty | Unit price | Discount |
   |---|---|---|---|---|
   | 1 | `Design work` | `4` | `1200` | empty |
   | 2 | `Travel` | `1` | `800` | `10 %` |

   **Expected:**
   - the table header row: Description, Qty, Unit price, Discount, Tax code, Net, Tax;
   - the required columns have a red star;
   - Net and Tax are right-aligned: row 1 Net 4 800,00, row 2 Net 720,00.
2. Make the window narrow.
   **Expected:**
   - each line is a card;
   - Net and Tax are two labelled fields;
   - Discount shows the hint "10 % or an amount".
3. Click **Cancel**. Repeat step 1 on a **new bill** (supplier Fjord Test Leverandør).
   **Expected:** the same table layout.

## L4. Notes on account

1. *Receivables → Credit notes → **Credit note on account***, customer Bergen Test Kunde. Fill in line 1: Description `Test`, Net `100`.
   **Expected:**
   - a new blank line appears under it;
   - the blank line has **no** remove icon;
   - the filled line has one.
2. Click **Cancel**.

## L5. The 20-line limit

1. In **Pay in advance**, click **Add line** until there are 20 rows.
   **Expected:** **Add line** turns off and the text beside it reads "At most 20 lines."
2. Click **Cancel**.

If something fails, send a screenshot and the step number.
