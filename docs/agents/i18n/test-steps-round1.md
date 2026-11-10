# App languages, round 1: test steps

**Before you start:** pull dev-app (505f2126) and restart the backend services. The backend restart applies V66, which gives the account names in the company's language.

**Sign-in:** `anna.lindh`, company Kystgruppe Nordic. The passwords are in NeoERP-BackEnd/docs/local-demo-data.md.

**In scope:** shared texts, Accounts (journals, periods, year end, calendar, chart, dimensions, home), Organization, People, Roles, Security, the audit log and platform admin.

**Still in English for now:**
- invoices, bills, payments, reports and SIE (round 2);
- HR, payroll, self-service, the HR reports and the inbox (old modules, skipped until they are rebuilt).

## R1. The language switch
1. Open **Settings → On this device → Language**.
   **Expected:** six choices: Device language, English, Norsk, Svenska and Dansk. Each name is written in its own language.
2. Choose **Norsk**.
   **Expected:**
   - The app switches at once, with no restart.
   - The menu, the buttons and the page titles are in Norwegian.
3. Open **Regnskap → Bilag** (Accounts → Journals).
   **Expected:**
   - The list, the filters, the column headers and the status pills are in Norwegian.
   - Month names read, for example, "1. mai 2026" / "mai".
   - Amounts read "1 234,50".
4. Switch to **Svenska**, then to **Dansk**.
   **Expected:** the same page follows each choice, and nothing you typed is lost.

## R2. A journal in Norwegian (Norsk)
1. **Regnskap → Bilag → Nytt bilag**. Fill in:

   | Field | Enter |
   |---|---|
   | Description | `Test språk` |
   | Line 1 | account 1920, debit `100` |
   | Line 2 | account 3000, credit `100` |

2. **Lagre utkast** (Save draft).
   **Expected:**
   - The toast and the status are in Norwegian.
   - No English words appear.
   - No ⟦…⟧ marker appears anywhere. That marker means a text slipped through untranslated: send a screenshot.
3. Open the account picker on a line.
   **Expected:** account names are the company's Norwegian names (e.g. "Bankinnskudd"). You can also find an account by typing its English name.

## R3. Organization and People (Svenska)
1. Switch to **Svenska**. Open **Företag → Kystgruppe Nordic** and go through the tabs: Översikt, Juridiskt, Filialer, Moduler, Avtal and Aktivitet.
   **Expected:** everything is Swedish, including counts ("1 filial", "3 filialer") and dates.
2. Open a branch and click **Inaktivera** (Deactivate), then cancel.
   **Expected:** the dialog text and the reason hint are Swedish.
3. Open **Personer** (People), then a person, then **Åtkomst** (Access).
   **Expected:**
   - Roles, permissions headings and tooltips are Swedish.
   - The permission descriptions themselves may still be English. They come from the server: a known gap, in the backlog.

## R4. Phone width (Dansk)
1. Switch to **Dansk** and make the window narrow (under about 400 px), or use the phone app.
2. Open **Regnskab → Bilag**, a journal, and then **Periodeafslutning** (Period close).
   **Expected:**
   - Buttons wrap or stack instead of being cut off.
   - A long button or status text ends with "…".
   - Hovering or long-pressing shows the full text.

## R5. Sign-in page
1. Sign out.
   **Expected:**
   - The sign-in page has a language picker at the top right: English, Norsk, Svenska, Dansk.
   - Choosing Dansk translates the page.
   - A wrong password shows a Danish message.

If something fails, send a screenshot with the step number. If you see English where it should be translated, include the language you chose.
