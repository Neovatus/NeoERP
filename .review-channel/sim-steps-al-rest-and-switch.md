# Simulator steps for the combined session: AL-REST (BE + APP) and FIX-APP-SWITCH — 2026-11-22

For the old Mac's one combined session (D-51), to be merged with its retest-round list. None of these steps is in `test-ledger.md` yet. Run on: BE with AL-REST-BE merged (V79) and App with AL-REST-APP + FIX-APP-SWITCH merged. Sign-in users and companies are named in each part; passwords are never repeated.

## Part A — AL-REST S6 (from App `docs/agents/al-rest/test-steps.md`)


**Before you start:** pull App `phase/4` and BackEnd `phase/4` once both AL-REST lanes are merged, restart the local stack
(BackEnd migration V79) and the app. Turn on **Approval limits** for the company if it is off (the feature
`FINANCE.APPROVAL_LIMITS`).

**Sign-in:** the demo users are in NeoERP-BackEnd/docs/local-demo-data.md. These steps use the roles, not the names:
- **Owner**: the Company Owner of Kystgruppe Nordic (NO) and of Lahore Trading (PK).
- **FM**: a Finance Manager (holds `ACCOUNTS.JOURNAL.POST`, `PAYMENT.APPROVE`, `REFUND.APPROVE`, `APPROVAL_LIMIT.UPDATE` and `.CONFIRM`).
- **FM2**: a second person who may confirm limits and decide payments.
- **Accountant**: writes and submits (no decide codes).
- **Reader**: an Accounts Viewer (`APPROVAL_LIMIT.READ` only).

Use two windows (or sign out and in) when a step needs another person.

## L. Set the limits (setup for the rest)

1. Sign in as **FM**. Open **Accounts → Approval limits**.
   **Expected:** Limits, Stand-ins, History and **Owner's decisions** in the segmented control; a card per kind; at the
   end the card **The Company Owner's own items** saying the Owner may approve one step of their own items.
2. On **Journals** click **Edit limits**. Add a band **Over 500 000** with two steps: **Anyone who may post journals**,
   then **Any Finance Manager**. Click **Save limits**, give a reason, confirm.
   **Expected:** the step list offers **Any Finance Manager** even though FM can't read roles under People (the roles that
   decide journals are read for every proposer). Toast: the change is proposed.
3. Sign in as **FM2**, open **Approval limits**, click **Confirm** on the Journals proposal.
   **Expected:** Journals now shows the band "Amounts over 500 000,00 · 2 · 1. Anyone who may post journals · 2. Any Finance Manager".
4. As **FM**, on **Supplier payments** propose three steps over **1 000 000**: Any Finance Manager, then a named person
   (the Owner), then anyone who may approve supplier payments. As **FM2**, confirm it.
   **Expected:** the ladder shows the three steps in that order.

## J. Journal with two steps (Kystgruppe Nordic, NOK)

1. Sign in as **Accountant**. Write a journal of **750 000,00** (debit 6300, credit 1920), date in an open month, and
   click **Submit for posting**.
   **Expected:** toast "… submitted"; in the list the row says **Waiting to post** with "0 of 2 approved" under it.
2. Sign in as **Owner**. Open the journal.
   **Expected:**
   - Beside **Waiting to post** the tag **0 of 2 approved**.
   - An **Approvals** card: "Needs 2 approvals · 0 done", "Amounts over 500 000,00 · journal limits of {date}" and
     **Why 2 approvals?**; Step 1 "Next: you" (in the accent colour); Step 2 "After step 1".
   - The main button is **Approve** (not Post).
3. Click **Why 2 approvals?**.
   **Expected:** Approval limits opens on Limits. Go back to the journal.
4. Click **Approve**.
   **Expected:** the gate "Approve JV-DRAFT-… (step 1 of 2)?" with "Step 2 then goes to: Any Finance Manager. Nothing reaches
   the books until the last step posts it." and the reason field "What you checked".
5. Type "Checked against the freight contract" and confirm.
   **Expected:** toast "Step 1 of 2 approved."; step 1 shows a tick, "Approved by {Owner}, {time}, {date}" and the quote;
   the line under the steps "You approved an earlier step. Someone else approves step 2."; no Approve or Post button;
   the timeline adds "Approved (step 1 of 2) by {Owner}".
6. Sign in as **FM**. Open the journal.
   **Expected:** step 2 "Next: you"; the main button is **Post**.
7. Click **Post**, write a reason and confirm.
   **Expected:** toast "… posted as JV-2026-…"; status **Posted**; the card shows both steps ticked, step 2 "Posted by
   {FM} as JV-2026-…"; the timeline "Posted by {FM} as JV-2026-… (step 2 of 2)".

## K. Keep a later step open

1. Make sure **FM** is the only person with the Finance Manager role. As **Accountant**, submit another journal of 750 000,00.
2. Sign in as **FM** and open it.
   **Expected:** no Approve and no Post; the line "You’re the only Finance Manager who can approve step 2. Leave step 1
   to someone else."
3. Sign in as **Owner**, approve step 1. Sign in as **FM** again.
   **Expected:** **Post** is offered.

## P. Payment with three steps and a stand-in

1. As **Owner**, open **Approval limits → Stand-ins**, **Set my stand-in**: **FM2** for supplier payments, from today to next week.
   **Expected:** toast "{FM2} decides for {Owner} from … to …".
2. As **Accountant**, make a supplier payment of **1 200 000,00** to a supplier whose bank details changed in the last 30
   days, and **Submit for approval**.
3. Sign in as **FM**. Open the payment.
   **Expected:** **Approvals** card "Needs 3 approvals · 0 done", "Amounts over 1 000 000,00 · supplier payment limits of …";
   step 1 "Next: you"; step 2 names the Owner and "Next: {FM2}, for {Owner} (away until {date})"; the button **Approve**.
4. Click **Approve**.
   **Expected:** the sheet "Approve PAY-DRAFT-… (step 1 of 3)?", the bank-details warning with the tick (required), a note field.
5. Tick the bank details, confirm.
   **Expected:** toast "Step 1 of 3 approved."; FM sees "You approved an earlier step. Someone else approves step 2."
6. Sign in as **FM2**. Open the payments list.
   **Expected:** the row says **Waiting for you** and "Step 2 of 3 · for {Owner}"; the Payables badge counts it.
7. Open it, **Approve** (the bank tick is asked again), confirm.
   **Expected:** toast "Step 2 of 3 approved."; the timeline "Approved (step 2 of 3), for {Owner} (stand-in)".
8. Sign in as **Owner** (or another person who may approve payments and hasn't approved a step). Open it.
   **Expected:** the main button **Approve** (the last step); the sheet is today's, with the bank tick.
9. Confirm.
   **Expected:** the payment is posted; all three steps ticked.

## C. Payee changed between steps

1. As **Accountant**, submit a customer refund over the refund limit (or a payment over 1 000 000,00).
2. As **FM**, approve step 1.
3. As **Accountant**, change the customer's (or supplier's) bank details; as **FM2**, approve that change.
4. As **Owner**, open the refund and click **Approve** (or Approve refund on the last step), confirm.
   **Expected:** the notice "{name} changed the customer’s bank details at {time}, so this approval was cancelled. The
   refund is back in drafts; …"; the refund shows **Draft**; the timeline "Approval cancelled: the payee’s bank details changed".

## O. The Owner switch

1. Sign in as **FM**. **Approval limits → Limits**, card **The Company Owner's own items**, click **Stop the Owner
   approving own items**.
   **Expected:** the gate "Stop the Company Owner approving their own items?" saying it proposes the change for journals,
   supplier payments and customer refunds, one proposal each; a reason field.
2. Write a reason and confirm.
   **Expected:** toast "Proposed for Journals, Supplier payments and Customer refunds. Another person confirms each
   change." Each kind card shows its proposal with "The Company Owner may approve their own items: Yes → No".
   If one kind already had a change waiting: the notice names which kinds were proposed and which not, and why.
3. Sign in as **FM2** and **Confirm** each of the three.
   **Expected:** each kind card says "The Company Owner may not approve their own items of this kind."; the switch card
   says the Owner may not approve their own journals, supplier payments or customer refunds.
4. Sign in as **Owner**, write a journal over 500 000,00 and submit it; open it.
   **Expected:** no Approve; the line "The approval limits don’t let the Company Owner approve their own journals.
   Someone else approves this one."
5. As **Owner**, write a journal of 750 000,00 and, in the editor, try **Post my own journal** (switch back on first, or
   use a company where it is on).
   **Expected:** "This journal needs 2 approvals. Submit it first; then others approve it step by step." with **Submit for posting**.

## R. The Owner's decisions report

1. Sign in as **Reader**. **Approval limits → Owner's decisions**.
   **Expected:** a table When · Kind · Item · Amount · Step · Reason, newest first, with the Owner's own step of journal J
   if the Owner approved their own; no buttons other than the kind filter and, with a place to save, **Export the Owner’s decisions (CSV)** in More.
2. Choose **Supplier payments** in **Kind**.
   **Expected:** only payment rows.
3. More → **Export the Owner’s decisions (CSV)**.
   **Expected:** a CSV file is saved; toast that it was exported.

## N. Read-only and Neovatus

1. Sign in as **Reader** and open the journal of J step 1 (before posting).
   **Expected:** the Approvals card with the steps and names; no Approve, no Post, no line about a button.
2. Enter the company as Neovatus (read only).
   **Expected:** the same: steps shown, no buttons.

## PK. Lahore Trading (PKR)

1. As **FM** in Lahore Trading, set Supplier payments over **5 000 000** to two steps; as **FM2**, confirm.
2. As **Accountant**, submit a payment of **7 500 000.00**; open it as **FM**.
   **Expected:** "Amounts over 5,000,000.00 · supplier payment limits of …"; amounts with comma grouping and a point, never spaces.

## Languages

Switch **Settings → On this device → Language** to Norsk, Svenska and Dansk and repeat J2 and P3.
**Expected:** the card, the lines, the gates and the toasts are in that language ("Trenger 2 godkjenninger · 0 gjort",
"Behöver 2 godkännanden · 0 klara", "Kræver 2 godkendelser · 0 klaret").

## Part B — FIX-APP-SWITCH (from App `docs/agents/fix-app-switch/test-steps.md`)


**Before you start:** build App branch `phase/4-b2-fix-app-switch`, restart the local stack and the app. Use a person who is
a member of **two companies in different countries** with the right to read and write journals: the Company Owner of
**Kystgruppe Nordic (NO)** and of **Lahore Trading (PK)** (demo users: NeoERP-BackEnd/docs/local-demo-data.md). The two
countries matter: the number and date formats change on the switch, which is what used to trigger the wrong request.
Run steps 1 to 6 on the **iPad** and again on the **phone** (iPhone). Do not run a gate or other heavy job at the same time.

**Gateway log:** keep the gateway request log open (or `docker logs` of the gateway). A wrong request looks like
`GET /api/accounts/journals/<id>?companyId=<Lahore id>` where `<id>` is a journal of Kystgruppe.

## A. Switch from a journal detail

1. Sign in as the Owner. Select **Kystgruppe Nordic**. Open **Accounts → Journals**, open any **posted journal** (its detail
   shows the number, the lines and the Approvals/Timeline cards).
   **Expected:** the journal detail of Kystgruppe; the breadcrumb ends with the journal number.
2. In the company chip (top bar) pick **Lahore Trading**.
   **Expected:** the screen shows the **Journals list of Lahore Trading** (tabs All, Drafts, Waiting, Posted; the Lahore
   figures and the company name in the breadcrumb). No journal detail of Kystgruppe, no "We couldn't find this", no
   error toast, no loading skeleton left behind.
3. Look at the gateway log for the switch.
   **Expected:** no `GET /api/accounts/journals/<Kystgruppe journal id>?companyId=<Lahore>` (and no 404 on the journals
   path). Lahore's own `GET /api/accounts/journals?companyId=<Lahore>…` (the list) and the summary call are there.
4. Switch back to **Kystgruppe Nordic**.
   **Expected:** the Journals list of Kystgruppe (not the journal that was open before); no wrong-company request in the log.

## B. Switch from the editor of a draft (Edit)

5. As the Owner at **Kystgruppe Nordic**: **Journals → Drafts**, open a **draft** (the editor shows the header card, the lines
   and the footer with **Save**). Change nothing. In the company chip pick **Lahore Trading**.
   **Expected:** the Journals list of Lahore Trading, no editor. If the page asks "Leave this page?" (an edit was made),
   choose **Leave**; the list of Lahore Trading follows. The log has no `GET …/journals/<Kystgruppe draft id>?companyId=<Lahore>`.
6. Back at Lahore Trading, press **New journal**, then switch to **Kystgruppe Nordic** from the chip.
   **Expected:** the Journals list of Kystgruppe; the new-journal editor of Lahore is gone and no draft was created.

## C. SIE import page (Swedish company)

7. If a Swedish demo company is available: open **Accounts → Journals → Import history**, open an import, then pick
   another company in the chip.
   **Expected:** the other company's Journals list; no page of the first company's import; no request for that import id at
   the other company.

## D. Regression glance

8. At **Lahore Trading**: open **Reports → Trial balance**, then switch to **Kystgruppe Nordic**.
   **Expected:** Kystgruppe's trial balance (AC418 step 15 still holds).
9. At either company: **Chart of accounts**, **Fiscal calendar**, **Tax codes** (and **Dimensions** if on): switch company.
   **Expected:** each tab shows the new company's data after a short loading state; nothing of the old company flashes.
