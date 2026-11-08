# Quick add: test steps (QA-1)

**Sign-in:** open the app, click **Continue with NeoERP ID**, and sign in at the browser page. The usernames are below, and the passwords are in `NeoERP-BackEnd/docs/local-demo-data.md`.

**Company:** Kystgruppe Nordic. Use **Save draft** only: until the branch fix comes (next step), Submit there is still refused.

## Q1. Add a supplier while paying in advance

1. Sign in as `anna.lindh` and pick Kystgruppe Nordic. Open *Accounts → Payables → Payments* and click **Pay in advance**.
   **Expected:** the empty form.
2. Click **Supplier** and type `Fjord Test Leverandør`.
   **Expected:**
   - one line: "Nothing matches “Fjord Test Leverandør”.";
   - no second "No matches" line;
   - a last row: **Add “Fjord Test Leverandør”**.
3. Fill in **Amount paid** with 1000 first. Then open the Supplier picker again, type the name, and click the **Add** row.
   **Expected:**
   - a short panel slides in over the form, with the name already filled in;
   - it has no bank details fields;
   - it has an **Open full record** link.
4. Click **Save** in the panel.
   **Expected:**
   - the panel closes;
   - Supplier shows the new supplier;
   - Amount paid still shows 1000.
5. Fill in the line and click **Save draft**.
   **Expected:** the draft saves (PAY-DRAFT-…).
6. Open *Payables → Suppliers*.
   **Expected:** "Fjord Test Leverandør" is listed.

## Q2. Add a customer while recording a receipt

1. *Receivables → Receipts → New receipt*. In **Customer**, type `Bergen Test Kunde` and click **Add “Bergen Test Kunde”**.
   **Expected:** the short panel with the name filled in.
2. Click **Save**.
   **Expected:** the customer is picked and the rest of the form is unchanged.

## Q3. A refusal is shown in the panel

1. In a new bill, open **Supplier** and type `Fjord Test Leverandør` again. Pick **Add** anyway, if the row is offered for a near match, or type `Fjord Test Leverandør ` with a space at the end.
   **Expected:** either it is found, or the server's refusal shows in words in the panel; the panel is never blank. Save stays usable after you change the name.
2. In the panel, click **Open full record** without saving.
   **Expected:**
   - the full supplier form opens, with the name you typed;
   - saving it picks the supplier in the bill.
3. While a save is running, look at **Cancel**.
   **Expected:** it is off until the save finishes.

## Q4. Add a project or cost centre from a journal line

1. Sign out and sign in as `ola.nordmann`. *Accounts → Journals → New journal*. Add a line on a cost account, such as 6300.
2. In the line's **Project** picker, type `P-900` and click **Add value**.
   **Expected:**
   - a short panel with **Code** and **Name** (no Open full record here: it would leave the journal);
   - no error shows until you touch a field or press Save;
   - if the code is invalid (a space in it, for example), pressing Save shows the rule under the field.
3. Enter code `P-900` and name "Test quay". Click **Save**.
   **Expected:** the project is picked on the line.
4. Open *Accounts → Dimensions → Projects*.
   **Expected:** P-900 "Test quay" is listed Active, valid from today.
5. Sign out and sign in as `anna.lindh`. On a new journal line, open the **Project** picker and type something that doesn't exist.
   **Expected:** "Nothing matches …" and **no Add row**, because Anna may only view dimensions.

## Q5. Where quick add must not appear

1. In *Payables → Payments*, use the **Supplier** filter in the list toolbar and type a name that doesn't exist.
   **Expected:** no Add row in the filter.
2. In a new journal, open the **Account** picker and type a number that doesn't exist.
   **Expected:** no Add row. Chart accounts are added in Chart of accounts.

## Q6. Amounts on the right (earlier fix)

1. **Pay in advance**, then type 2500 in **Amount paid**.
   **Expected:**
   - the digits stay at the right edge while you type;
   - the footer reads "Paid 2 500,00 · lines 0,00".

If something fails, send a screenshot and the step number.
