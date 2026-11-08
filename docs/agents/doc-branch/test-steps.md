# Branch on documents: test steps (BR-1, BR-2)

**Sign-in:** open the app, click **Continue with NeoERP ID**, and sign in at the browser page. The passwords are in `NeoERP-BackEnd/docs/local-demo-data.md`.

**Company:** Kystgruppe Nordic, which has three branches: Oslo HQ, Bergen and Tromsø. Stockholm Handel has one branch.

## B1. Pay in advance submits ✅ (done)

Branch can't be cleared. In a company with more than one branch it is required, and the list has no empty choice.

## B2. A bill keeps its branch

Sign in as `anna.lindh` and pick Kystgruppe Nordic.

1. Go to *Payables → Bills* and click **New bill**. Fill it in exactly like this:

   | Field | Enter |
   |---|---|
   | Supplier | `Fjord Test Leverandør` |
   | Supplier's invoice number | `B2-BILL-1` |
   | Bill date | leave today's date |
   | Branch | **Bergen** |
   | Line, Description | `Office chairs` |
   | Line, Qty | `2` |
   | Line, Unit price (NOK) | `1500` |
   | Line, Discount | leave empty |
   | Line, Tax code | leave the default |

   **Expected:** Net shows 3 000,00, and Tax and Total show the default tax code's amounts. For example, with 25 % VAT, Tax is 750,00 and Total is 3 750,00.
2. Click **Save draft**.
   **Expected:** a toast "Draft BILL-DRAFT-… saved."
3. Click **Cancel** to go back to the list. Open the draft you just saved; it is at the top under **Drafts**.
   **Expected:**
   - Branch shows **Bergen**;
   - the line still reads Office chairs, 2 × 1500;
   - the invoice number is still B2-BILL-1.
4. Change Branch to **Tromsø** and click **Save draft**. Click **Cancel**, then open the draft again.
   **Expected:** Branch shows **Tromsø**, and nothing else has changed.

## B3. An invoice keeps its branch

This waits for the invoice form fix. Do it when I tell you it's ready.

1. Go to *Receivables → Invoices* and click **New invoice**:

   | Field | Enter |
   |---|---|
   | Customer | `Bergen Test Kunde` |
   | Invoice date | leave today's date |
   | Branch | **Bergen** |
   | Line, Description | `Consulting, November` |
   | Line, Qty | `10` |
   | Line, Unit price (NOK) | `950` |
   | Line, Tax code | leave the default |

   **Expected:** Net shows 9 500,00.
2. Click **Save draft**, then **Cancel**, then open the draft.
   **Expected:** Branch shows **Bergen**, and the line is unchanged.
3. Change to **Oslo HQ**, save, close and reopen.
   **Expected:** Oslo HQ.

## B4. Credit and debit notes on account

1. Go to *Receivables → Credit notes* and click **Credit note on account**. Pick **Bergen Test Kunde** and click **Continue**.
   **Expected:** the form has a **Branch** field set to your branch.
2. Fill it in:

   | Field | Enter |
   |---|---|
   | Reason | `Goodwill` |
   | Branch | **Tromsø** |
   | Line, Description | `Goodwill discount` |
   | Line, Amount (NOK) | `500` |
   | Line, Tax code | leave the default |

   Click **Save draft**, close it, then open it again.
   **Expected:** Branch shows **Tromsø**, and the line reads Goodwill discount 500.
3. Do the same with a debit note on account:

   | Field | Enter |
   |---|---|
   | Where | *Payables → Debit notes* → **Debit note on account** |
   | Supplier | **Fjord Test Leverandør** |
   | Supplier's credit note number | `B4-DN-1` |
   | Branch | **Bergen** |
   | Line, Description | `Returned chairs` |
   | Line, Amount (NOK) | `1500` |

   **Expected:** after saving and reopening, Branch shows **Bergen**.
4. Open a **posted** invoice, for example INV-2026-000016, and use its **Credit** action to start a credit note from it.
   **Expected:** there is no Branch field, because the note takes the invoice's branch.

## B5. A company with one branch

1. Sign out and sign in as `erik.berg`. Pick Stockholm Handel.
2. Open **New invoice**, then **New bill**, then **Pay in advance**.
   **Expected:** none of them has a Branch field. Fill in a bill like B2, step 1, with any Swedish supplier, and click **Save draft**.
   **Expected:** it saves.

If something fails, send a screenshot and the step number.
