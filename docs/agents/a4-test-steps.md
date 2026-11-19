# Accounts A4: click-through test steps (recurring journals, accruals with automatic reversal, journal CSV import)

For Jabran. App: the A4 build (`a4-app` worktree, P2 to P4 merged for the run), desktop JVM, local backend stack freshly
reseeded. Written from the spec (`accounts-a4.md`), the builders' reports (P2, P3, P4), the app string files and the
seed data, not from a run, so a label that differs on screen is a finding: send it back.

## Read this first

- **Sign-in:** open the app, click **Continue with NeoERP ID**, sign in at the browser page with the username below.
  Password: see `NeoERP-BackEnd/docs/local-demo-data.md`. Sign out with **Sign out** at the bottom of the sidebar before
  switching people.
- **Company:** every test uses **Kystgruppe Nordic** (NOK, comma decimals). Typed dates are `dd.mm.yyyy`; the screen
  shows dates like `1 Dec 2026` (toasts, cards, tags such as "Reverses 1 Dec 2026"). The Expected texts below write
  `01.12.2026`: read it as the same date. The steps were written for **16.11.2026**; any day in Nov 2026 works.
  **Jan to Mar 2026 are LOCKED** by the seed (`seed-demo-a4.sh`, part of the reset; permanent, Kystgruppe only);
  Apr 2026 onward is open, so Nov 2026 is open. On a database seeded before QA1 every month is open and A5 step 8,
  A7 and A18 item 7 cannot be reached: reset and reseed. The accrual tests also need
  **Dec 2026 OPEN** (a reversal on 01.12.2026 needs it) and A4 jobs on. If Dec 2026 is closed, say so: A1, A2 and A4 then
  show the closed-month wording instead (that is itself a check of D-176 and the editor's warning line), and
  `docs/domain` needs a note.
- **Branches and tags at Kystgruppe:** branches `OSL` (Oslo HQ), `BRG` (Bergen), `TRO` (Tromsø); cost centres `OSL-OPS`,
  `BRG-OPS`; project `HARBOUR-26`. With three branches a line may need a branch: pick **Oslo HQ** unless a step says
  otherwise.
- **Accounts used (NS 4102 chart):** 1920 Bank deposits, 2960 Accrued expenses (type Accrual), 2990 Other short-term
  liabilities, 1700 Prepaid rent (type Prepayment), 6300 Rent of premises, 6340 Light and heating, 6360 Cleaning, 6700
  Audit fees, 6705 Accounting fees, 6800 Office supplies, 3000 Sales revenue. Account 6301 is deliberately **not** in the chart.
- **Menu path:** *Accounts → Journals*. The arrow part of **New journal** opens the menu the spec calls **More**
  (**New accrual or prepayment**, **Import journals**, **Recurring journals**, plus Opening balances). Where the
  builders put an item is written in A18; if you find an item elsewhere, note where.
- **Amounts:** type them the way the field's grey example shows: `15 000,00` or `15000,00`. **CSV files are different:**
  plain decimals with a point (`15000.00`) and ISO dates (`2026-11-16`), as the file format requires.
- **The 15-minute job.** Recurring journals are created by a job that runs inside accounts-service **every 15 minutes
  (UTC) and once 60 s after the service starts**. After saving a recurring journal whose first date is today or in the
  past, wait up to 15 minutes and reload its detail. Start the waiting tests (A5, A7, A14) first and do the others while
  you wait. **Automatic reversals post on the 1st of the next month by a second job**, so no test can watch the reversal
  itself post today (see "Not turned into steps").
- **Start state and tester tips:** run on a freshly reset and seeded stack (`NEOERP_CONFIRM_RESET=yes
  scripts/reset-local-dev.sh`); earlier runs leave `A4T` rows, posted journals and ended recurring journals, and a name
  that already exists is refused (A5 step 14). After sending the app Home and back to front, wait 5 to 10 s before
  tapping. A dev session expires after 30 minutes idle: sign in again. Plan which device or window each person uses
  before you start (A13, A14, A15 need several people).
- **Demo data:** `NEOERP_LOCAL_DEMO=1 scripts/seed-demo-a4.sh` (it also locks Jan to Mar 2026) creates *Office rent Oslo*, *Quarterly insurance
  accrual*, *Accrued electricity (A4 demo)* and the import *kystgruppe-a4-demo.csv*. The tests below do **not** need it
  and each says what it creates. If you ran it, the lists in A5, A7, A9, A10 and A13 show those rows too; ignore them.
- **Self-contained tests.** Each test names the data it creates. Names carry the tag `A4T` so you can tell them from seed
  data. Posted journals are permanent on this local database; nothing here is cleaned up after.
- **Recipe R1, "an accrual posted by Bjorn"** (used by A4, A14 and A17; each says which amount):
  1. Sign in as `anna.lindh`, *Journals → New journal ▾ → New accrual or prepayment*. Kind **Accrued expense**, Month
     **Nov 2026**, Date `30.11.2026`, Amount `{amount}`, Expense account `6705 Accounting fees`, Balance account stays
     the suggested `2960` (if the app suggests 2950 Påløpt rente, pick **2960 Accrued expenses** by hand: G06), Branch Oslo HQ, Memo `Accrued accounting fees A4T`, Document reference `EST-A4T-{n}`, Document
     date `30.11.2026`. Click **Submit for posting**.
  2. Sign out, sign in as `bjorn.eriksson`, *Journals → Waiting to post*, open the journal, **Post**, confirm.
- **Recipe R2, "a waiting-to-post recurring journal"** is written out in A5.

People used (usernames in `local-demo-data.md`):

| Person | Role at Kystgruppe Nordic |
|---|---|
| `anna.lindh` | Accountant: writes and submits, cannot post |
| `bjorn.eriksson` | Finance Manager: posts and reverses what someone else wrote |
| `ola.nordmann` | Owner |
| `jonas.moe` | Neovatus Platform Admin: switches features (Platform → Companies → Kystgruppe Nordic → Modules → Finance) |

---

# 1. Accruals and automatic reversal

## A1. Accrual dialog, then post, then the Automatic reversal card

Who: `anna.lindh` prepares, `bjorn.eriksson` posts. Creates: one posted accrual (15 000,00, 30.11.2026) with a PENDING
reversal due 01.12.2026.

1. Sign in as Anna. *Accounts → Journals*, click the arrow part of **New journal**.
   Expected: a menu with **New accrual or prepayment** and **Import journals** among its items. (If Recurring journals is
   off the accrual item is missing: see A15.)
2. Click **New accrual or prepayment**.
   Expected: a side panel titled "New accrual or prepayment", subtitle "An ordinary journal with two lines, reversed
   automatically." Fields: Kind, Month, Date, Amount, Expense account, Balance account, Branch, Cost centre, Memo,
   Document reference, Document date. Buttons **Cancel**, **Open in editor**, **Submit for posting**. The last is disabled
   with a reason beside it while a field is missing. (Builders used a side panel, not a dialog sheet: confirm in A18.)
3. Open **Kind**.
   Expected: four choices **Accrued expense**, **Accrued income**, **Prepaid expense**, **Deferred income**, each with a
   one-line help such as "A cost of this month; the invoice comes later." Choose **Accrued expense**.
   Expected: the Memo starts as "Accrued expense Nov 2026: " with the cursor at the end; Date defaults to `30.11.2026`.
4. Open **Month**.
   Expected: only open months are offered (Nov 2026 selected). Leave it.
5. Amount `15 000,00`; Expense account: type `6705`, pick **6705 Accounting fees**; look at Balance account.
   Expected: Balance account is filled with the Accrual-type account **2960 Accrued expenses**, hint "Suggested for this
   kind; you can change it." There is no "Add" option at the bottom of the account picker (the chart is setup data).
   Under the fields a small table "The journal it creates": Debit 6705 Accounting fees 15 000,00, Credit 2960 Accrued
   expenses 15 000,00.
6. Branch: Oslo HQ. Cost centre: open the picker and type something unknown, such as `zzq`. Memo: finish as `Accrued accounting fees A4T`. Document reference
   `EST-A4T-1`; Document date `30.11.2026`.
   Expected: the cost-centre picker lists the cost centres and says "Nothing matches "zzq"." with no **Add "x"** (cost centres are setup data, so the picker has no quick add, like the branch picker and the account picker). The consequence line above the buttons reads "Posts in Nov 2026 once someone else posts it. Reversed
   automatically on 01.12.2026." **Submit for posting** is enabled.
7. Click **Submit for posting**.
   Expected: the panel closes with the toast "{JV-DRAFT-…} submitted for posting. Reversed on 01.12.2026 once posted."
   *Waiting to post* shows the journal with a muted tag **Reverses 01.12** (or "Reverses 01.12.2026").
8. Open the journal.
   Expected: card **Automatic reversal** under the lines: "Will be reversed on 01.12.2026 once posted." and "Whoever
   posts it also approves the reversal." Anna has no **Post** button (Accountant cannot post).
9. Sign out, sign in as Bjorn. *Journals → Waiting to post*, open the journal, click **Post**.
   Expected: the post dialog adds the line "You also approve its reversal on 01.12.2026."
10. Confirm the post.
    Expected: the journal is **Posted** with its JV number. The Automatic reversal card now reads "Reversed
    automatically on 01.12.2026." and "Approved by Bjorn Eriksson when posting." with the action **Cancel automatic
    reversal**. In the Posted list the tag still reads Reverses 01.12.
11. Open *Accounts → Period close*, pick **Dec 2026**, run the check.
    Expected: a blocking row **Automatic reversals not posted** ("1 automatic reversal dated Dec 2026 hasn't posted") with
    the journal and **Reverse now**. (The close itself must not be done.) Report anything different, including the
    wording of the Checks column ("1 reversals waiting").

## A2. Reverse automatically box in the journal editor

Who: `anna.lindh`. Creates: one draft journal (not submitted).

1. Sign in as Anna. *Journals → New journal* (the main button).
   Expected: the journal editor. In the header card, under the document date, a checkbox **Reverse automatically**,
   unticked, with no hint line yet.
2. Entry date `30.11.2026`. Tick **Reverse automatically**.
   Expected: the line "Reversed on 01.12.2026, the first day of the next month." appears under the box. The footer's
   consequence line adds "Whoever posts it also approves the reversal on 01.12.2026."
3. Change the entry date to `31.12.2026`.
   Expected: the line changes to "Reversed on 01.01.2027, the first day of the next year." and, when FY2027 does not
   exist yet, a warning "FY2027 doesn't exist yet; the reversal waits until it's created." (or the generic "The next
   fiscal year doesn't exist yet…").
4. Change the date back to `30.11.2026`. Untick the box.
   Expected: both lines disappear. Tick it again.
5. Add two lines: 6340 Light and heating debit `2 000,00` branch Oslo HQ; 2960 Accrued expenses credit `2 000,00`
   branch Oslo HQ. Memo `Accrued power A4T`; document reference `EST-A4T-2`; document date `30.11.2026`. Click **Save draft**.
   Expected: saved as a draft; reopening it shows the box ticked and the line "Reversed on 01.12.2026…". On *Journals →
   Drafts* its row carries the tag **Reverses 01.12**.
6. Open *Journals → Drafts* filters: look for the chip **Reverse automatically**; click it.
   Expected: the list shows only journals marked Reverse automatically (this draft and the A1 journal if you ran A1).
   Click the chip again to clear.
7. Bjorn view: sign out, sign in as `bjorn.eriksson`. Open Anna's draft; as the editor allows, tick/untick nothing. Close.
   Expected: nothing is changed by opening it. (This step exists only to leave the draft for A3's final step.)

## A3. Period 13 (year-end adjustment) cannot be reversed automatically (D-174)

Who: `anna.lindh`. Creates: one draft (not submitted). Needs the year-end adjustment box offered in the editor; if
"Post to year-end adjustments" is not shown at all for this company, note that and skip to step 5.

1. Sign in as Anna. *Journals → New journal*. Entry date `31.12.2026`. Tick **Reverse automatically**.
   Expected: the box is ticked with its date line.
2. Tick **Post to year-end adjustments** (the "Year-end adjustment" box).
   Expected: **Reverse automatically** is unticked by itself and disabled, with "Year-end adjustments can't be reversed
   automatically." The date line is gone.
3. Try to tick **Reverse automatically**.
   Expected: nothing happens (disabled), same line stays.
4. Untick **Post to year-end adjustments**.
   Expected: **Reverse automatically** becomes usable again (it stays unticked until you tick it).
5. Tick **Post to year-end adjustments** again, add lines 6340 debit `500,00` and 2960 credit `500,00` (branch Oslo HQ),
   memo `Year-end adjustment A4T`, document reference `YE-A4T-1`, document date `31.12.2026`. Click **Save draft**.
   Expected: saves; the box stays unticked and disabled. There is no way in the screen to produce the pair. (The server
   refusal `AUTO_REVERSE_NOT_ALLOWED` with the reason ADJUSTMENT_PERIOD, "Year-end adjustments can't be reversed
   automatically. Untick Reverse automatically or Year-end adjustment.", cannot be provoked from this screen: see "Not
   turned into steps".)

## A4. Automatic reversal card: states, Cancel with a reason, reversed by hand

Who: `anna.lindh`, `bjorn.eriksson`. Creates: three posted accruals (R1 with amounts `1 000,00`, `1 100,00`, `1 200,00`,
document references `EST-A4T-3`, `-4`, `-5`). Dated 30.11.2026 for the first two. The third is dated **31.12.2026** (Month
**Dec 2026**, Date `31.12.2026`) if Dec 2026 is open.

1. Run R1 three times as above. Open the first posted journal (1 000,00) as Bjorn.
   Expected: card **Automatic reversal**, "Reversed automatically on 01.12.2026." "Approved by Bjorn Eriksson when
   posting." Action **Cancel automatic reversal** (Bjorn holds Reverse).
2. Click **Cancel automatic reversal**.
   Expected: dialog "Cancel the automatic reversal?" with "{JV-…} stays in the books until someone reverses it by hand."
   and a reason field "Why it's cancelled"; the confirm button is disabled until a reason is typed.
3. Reason `A4T: invoice arrived early`, confirm.
   Expected: toast "Automatic reversal of {JV-…} cancelled." The card turns neutral: "Cancelled by Bjorn Eriksson" and
   the reason in a quote block. No actions.
4. Open *Accounts → Period close* for Dec 2026 and run the check.
   Expected: the cancelled journal is not listed as a pending reversal (the other posted accruals are).
5. Open the second journal (1 100,00). Click **Reverse** (the ordinary reversal action) and confirm with a reason.
   Expected: the original is reversed by hand; its card reads "Reversed by hand by Bjorn Eriksson" (neutral), no
   Cancel or Reverse now. Report if the reversal is refused while an automatic one is waiting: that is a finding.
6. Open the third journal (31.12.2026), if you made it.
   Expected: when FY2027 does not exist: a warning card "Waits for FY2027 to be created." with **Cancel automatic
   reversal** (status Waiting for fiscal year). If FY2027 exists, the card reads "Reversed automatically on 01.01.2027."
   Say which you saw.
7. Sign in as Anna and open the first journal again.
   Expected: the card is readable but she has no **Cancel** or **Reverse now** (Accountant cannot reverse).

---

# 2. Recurring journals

## A5. Create a recurring journal with the schedule picker (Waiting to post)

Who: `anna.lindh`. Creates: recurring journal **A4T Rent Oslo** (monthly on the 1st, start 01.11.2026, waiting to post), and
within 15 minutes one journal for Nov 2026 waiting to post.

1. Sign in as Anna. *Journals → New journal ▾ → Recurring journals*.
   Expected: page "Recurring journals", subtitle "Journals that repeat on a schedule. Each one is created as a draft or
   waiting to post; someone who didn't write it posts it." Empty state "No recurring journals yet" / "Rent, leases,
   interest and other monthly journals can be created for you on their date." with **New recurring journal**.
2. Click **New recurring journal**.
   Expected: editor with the header card (Name, Memo, Document reference, Creates, Reverse automatically, branch, cost
   centre), the card **Schedule** and the line grid. Subtitle "Each date creates a journal. Nothing reaches the books
   until someone who didn't write this posts it."
3. Name `A4T Rent Oslo`. Memo: type `Office rent `, open **Insert**, pick **Month and year**.
   Expected: the Insert menu lists Month and year, Month, Year, Date, Fiscal year. The preview under the field reads
   "Next: Office rent Nov 2026" (it comes from the server; it may take a moment, builders show it only from the server).
   Finish with `, Oslo HQ`.
4. Creates: click **Waiting to post**.
   Expected: the line under it: "Each one is submitted for posting at once. Someone who didn't write this recurring
   journal posts it." The document reference becomes required. Click **Draft** and read its line "You or a colleague
   complete and submit each one."; then back to **Waiting to post**.
5. Document reference: type `Lease A4T-OSL `, **Insert → Month and year**.
   Expected: preview "Next: Lease A4T-OSL Nov 2026".
6. Schedule card. Repeats: open it. Then keep **Every month**; On: open it.
   Expected: Repeats lists Every month, Every 3 months, Every 6 months, Every year. On lists 1st to 28th and **Last day
   of the month** (no 29th, 30th or 31st), with the help "For the 30th or 31st, choose Last day of the month." Keep **1st**.
7. Starts: type `01.11.2026`. Ends: look at the segmented control, click **After**, then **On a date**, then **Never**.
   Expected: After shows a number field "Times"; On a date shows a date field; the help lines "Months while it's paused
   aren't created later; it still ends on …" (On a date) and "Counts every date handled since it was made, also skipped
   ones. Months while it's paused don't count, so the last date moves later." (After). Leave **Never**.
   Expected under the fields: **Dates**, group "Created now" with 01.11.2026 and its month Nov 2026 (no warning tag), a
   group of the next dates 01.12.2026, 01.01.2027 and so on (up to 6), last line "No end date." Above the footer a notice
   "1 journals will be created now: Nov 2026." (plural form is worth a look).
8. Set Starts to `01.03.2026`, then back to `01.11.2026`.
   Expected: with March the "Created now" group lists Mar to Nov 2026 ("9 journals will be created now"); Mar 2026 carries the tag "Locked — will be skipped" (seeded lock) and Apr to Oct carry no tag (open). Write down anything different. Back to Nov: only Nov 2026 is created now.
9. Lines: row 1 account `6300`, Debit `25 000,00`, branch Oslo HQ; row 2 account `1920`, Credit `25 000,00`, branch Oslo HQ.
   Expected: the account picker has no "Add" option. The footer shows Debit total 25 000,00, Credit 25 000,00, Difference 0,00.
10. Click **Save**.
    Expected: toast "Saved. Next journal on 01.12.2026." (the November date is created now by the job, so the next one
    is December; if the page says 01.11.2026, the job has not run yet) and the detail opens: name, status **Active**,
    muted line "Written by Anna Lindh" and "You're one of its writers, so you can't post the journals it creates."
11. Read the cards.
    Expected: **What it creates**: Creates Waiting to post, memo and document reference expanded for the next date,
    the lines, totals. **Schedule**: "Every month on the 1st", Starts 01.11.2026, Ends never, "0 handled so far" (or the
    plural form) and the next dates. **Dates** (history): empty ("No dates handled yet.") until the job runs.
12. Wait up to 15 minutes (do A6 meanwhile). Reload the detail (leave the page and come back).
    Expected: a row 01.11.2026 with Result "Waiting to post" and a link to the journal "JV-DRAFT-…" (later "Posted").
    Handled so far 1. *Journals → Waiting to post* shows the journal with a **Recurring** tag.
13. *Recurring journals* (the list) now.
    Expected: one row **A4T Rent Oslo**; Repeats "Every month on the 1st"; Next date 01.12.2026; Creates **Waiting to
    post**; Amount 25 000,00 (header "Amount (NOK)"); Last "Created JV-DRAFT-…" or "Waiting to post"; Status **Active**.
    The row's muted second line shows the memo as it will read next time ("Office rent Dec 2026, Oslo HQ").
14. Try a duplicate: **New recurring journal**, Name `A4T Rent Oslo`, any lines, Save.
    Expected: refusal on the page: "Another recurring journal is called A4T Rent Oslo." Everything typed is kept. Cancel.

## A6. Draft-mode journal with blank-amount lines, edit, Create draft now

Who: `anna.lindh`. Creates: recurring journal **A4T Insurance** (quarterly, last day, draft mode, blank amounts), starting
30.11.2026, and a draft made by **Create draft now**.

1. Sign in as Anna, *Journals → New journal ▾ → Recurring journals → New recurring journal*.
2. Name `A4T Insurance`. Memo `Insurance accrual `, Insert **Month and year**. Creates **Draft**. Document reference stays
   empty (optional in Draft mode). Repeats **Every 3 months**; On **Last day of the month**; Starts `30.11.2026`; Ends **After**, Times `4`.
   Expected: the Dates group shows 30.11.2026, 28.02.2027, 31.05.2027, 31.08.2027 (the last day of every third month) and
   "Ends after 4 journals, on 31.08.2027." (or the same sentence in the app's words). Because Starts is in the future, no
   "created now" group.
3. Line 1: account `6700`, branch Oslo HQ, leave Debit/Credit empty.
   Expected: the Debit/Credit cell shows the muted "Each time" placeholder and a hint "Chosen with the amount each time."
   The footer reads "Amounts filled in each time" instead of the difference.
4. Line 2: account `2960`, branch Oslo HQ, description `A4T accrual`, leave amount empty. Click **Save**.
   Expected: saves without an amount (Draft mode); toast "Saved. Next journal on 30.11.2026."
5. On the detail, card **What it creates**.
   Expected: the lines show "Each time" in Amount and "—" in Debit and Credit.
6. Click **Edit**. Change Creates to **Waiting to post** and click **Save**.
   Expected: Save is disabled or refused with the reason "Line 1 needs an amount: journals waiting to post can't be filled
   in later." (the server refusal, or an inline footer reason). Change back to **Draft**. Type an amount `4 000,00` in the
   Debit cell of line 1.
   Expected: the Debit/Credit side comes back for that line (it takes Debit) and the other line stays blank. Clear the
   amount again (the line keeps its account and tags). Above the form the note "Changes apply from the next date.
   Journals already created stay as they are." is present on this edit.
7. Change Name to `A4T Insurance Q`, **Save**.
   Expected: toast "Saved." (or "Saved. Next journal on 30.11.2026."); the detail shows the new name; the schedule's
   "handled so far" does not restart.
8. The first date (30.11.2026) is in the future: **Create draft now** is not offered on a future date. Skip; the runs list
   is tested in A7.

## A7. Runs list: a skipped date, Create draft now, Dismiss

Who: `anna.lindh`. Needs Jan to Mar 2026 LOCKED (seeded). Creates: recurring journal **A4T Old fee** (three dates, 01.01.2026
to 01.03.2026, all in LOCKED months), so three runs **Skipped**; one draft from **Create draft now** on March; and
skipped dates to **Dismiss**.

1. Sign in as Anna, *Recurring journals → New recurring journal*. Name `A4T Old fee`. Memo `Old fee `+Insert **Month and year**.
   Creates **Draft**. Repeats **Every month**, On **1st**, Starts `01.01.2026`, Ends **After**, Times `3`.
   Expected: "Created now" shows 01.01.2026, 01.02.2026 and 01.03.2026, each "Locked — will be skipped". Notice above the buttons "3 journals will be created now: Jan 2026, Feb 2026, Mar 2026." with the
   warning "… are closed or locked, so those will be skipped."
2. Lines: 6800 debit `300,00` branch Oslo HQ; 2990 credit `300,00` branch Oslo HQ. **Save**.
   Expected: toast "Saved. …"; detail opens, status Active.
3. Wait up to 15 minutes; reload the detail.
   Expected: three rows in **Dates**, each "Skipped: {month} is locked" (warning): 01.01.2026, 01.02.2026, 01.03.2026. Each skipped row has **Create draft now** and **Dismiss**.
   The journal has used all three of its "After 3 times" (skipped dates count), so it is **Ended** at once and the
   default list (Active and Paused) hides it although it carries **Needs you**: open **Status** and tick **Ended** to
   find it. The Journals page shows no notice of this (the "recurring journals need you" notice is not built yet, see "Not turned into steps").
4. Click **Create draft now** on the 01.03.2026 row.
   Expected: a dialog "Create the Mar 2026 journal"; field **Date** is preset to the first day of the earliest open
   month after March (01.04.2026 with the seeded locks), with the line under it ("Period: Apr 2026") showing that month's state. Body: "A draft with this
   recurring journal's current lines. Memo and document reference say Mar 2026." Buttons **Cancel**, **Create draft**.
5. Click **Create draft**.
   Expected: the editor of the new draft opens: memo "Old fee Mar 2026", date from step 4, lines 6800 / 2990 with
   300,00. Back to the recurring journal: the 01.03.2026 row reads "Created by Anna Lindh on {date}" and links to the draft.
6. On the 01.02.2026 row click **Dismiss**.
   Expected: dialog "Dismiss the Feb 2026 date?" with a reason field (at least 6 characters); confirm disabled until you type a reason.
   Reason `A4T handled elsewhere`, confirm: toast "Date dismissed."; the row reads "Dismissed by Anna Lindh" with the
   reason in a quote block. Dismiss the 01.01.2026 row the same way: **Needs you** disappears from the list row.
7. *Recurring journals* list, set **Status** to include **Ended** (the journal is Ended), toggle the chip **Needs you** (a phone list may not show the chip: use the Status filter and read the tag).
   Expected: the chip counts rows needing a person; with none left it reads without a count or shows no rows.

## A8. Pause, Resume, End, and the ended-only list state

Who: `anna.lindh`. Creates: recurring journal **A4T Pause me** (monthly, start 01.12.2026, so the job creates nothing
today), then pauses, resumes and ends it. No journals are made.

1. Sign in as Anna, create the recurring journal: Name `A4T Pause me`, Memo `Pause test `+Insert **Month and year**,
   Creates **Draft**, Every month, **1st**, Starts `01.12.2026`, Ends **After**, Times `12`, lines 6800 debit `100,00` and
   2990 credit `100,00` (branch Oslo HQ). **Save**.
   Expected: toast "Saved. Next journal on 01.12.2026." Detail: Active.
2. On the detail click the More menu, then **Pause**.
   Expected: dialog "Pause A4T Pause me?" with "No journals are created while it's paused. Dates while paused are not
   created later." and (because it ends after a number of times) a second line "Months while it's paused don't count
   towards the 12 times." A reason field; confirm disabled until a reason.
3. Reason `A4T pause test`, confirm.
   Expected: toast "A4T Pause me is paused."; status **Paused** (warning pill). More now offers **Resume** and **End**.
4. Open *Recurring journals* (list). Status filter default.
   Expected: the paused one is listed (default filter Active and Paused).
5. Back on the detail: More → **Resume**.
   Expected: dialog "Resume A4T Pause me?" with the builders' generic body "Journals are created again from the next
   date. Months while it was paused are not created." (the spec words with the next date and skipped months were not
   built; see A18). Confirm: toast "A4T Pause me is running again."; status Active.
   If instead you see "We couldn't read the company's date just now. Nothing was changed. Try again.", Org was
   unreachable: report it, retry.
6. More → **End**.
   Expected: dialog "End A4T Pause me?" in danger style, body "It has created nothing, so it's deleted." (a never-used
   one is deleted) with a reason field. Confirm.
   Expected: toast "A4T Pause me was deleted." and you return to the list; the row is gone.
7. To see a real Ended state you need one that has runs: use **A4T Old fee** from A7 (if you skipped A7, create it
   first and wait for the job). After A7 it has already ended by itself (its 3 skipped dates used up "After 3 times"), so
   open it through **Status → Ended** and check the same result without clicking End. If it is still Active, More → **End**,
   reason `A4T done`: body "It stops for good. Journals already created stay."; toast "A4T Old fee has ended."
   Expected: status **Ended** (neutral); no Edit, Pause, Resume or End on it; its runs stay readable.
8. *Recurring journals* list.
   Expected: the Status filter default is Active and Paused, so A4T Old fee is hidden. Open **Status** and tick **Ended**:
   it appears with the Ended pill. Untick Active and Paused so **only Ended** is on.
9. If **A4T Rent Oslo**, **A4T Insurance Q** and every other journal are also ended (End them as Anna with a reason),
   with only Ended rows left and the default filter on:
   Expected: the empty state "No active or paused recurring journals" / "Ended ones are kept. Choose Ended under Status
   to see them." (a different state from "No recurring journals match" that a search with no hit gives, with **Clear
   filters**). Type `zzz` in the search box to see that second state. Leave things ended.

## A9. Origin filter, Recurring tag, and the source line with the way back

Who: `anna.lindh`, `bjorn.eriksson`. Needs the journal made by **A4T Rent Oslo** in A5 (run A5 first, wait for step 12).
If you have not run A5, create **A4T Rent Oslo** now and wait: this test creates nothing else.

1. Sign in as Anna. *Journals → Waiting to post*.
   Expected: the rent journal carries a muted tag **Recurring** (name A4T Rent Oslo in its tooltip; under 720 px wide in
   the card line instead).
2. Open the **Origin** filter (replaces the old Source dropdown on the Posted tab).
   Expected: choices **Entered in Accounts**, **Recurring**, **Imported**, **From modules**; no "Typed only". Tick
   **Recurring**.
   Expected: only recurring journals remain (the rent journal and any other created by a recurring journal).
3. Tick **Entered in Accounts** as well, remove **Recurring**.
   Expected: every manual journal (typed, recurring, imported). Clear the filter.
4. Open the rent journal.
   Expected: a source line "From the recurring journal A4T Rent Oslo, Nov 2026" (the name is a link). In the timeline:
   "Created by recurring journal A4T Rent Oslo" and "Submitted by recurring journal A4T Rent Oslo" (never the word
   "system"). Document reference reads "Lease A4T-OSL Nov 2026".
5. Click the link in the source line.
   Expected: the recurring journal's detail opens; its Dates row for 01.11.2026 links to this journal.
6. From the detail, click the journal link in the Dates row, then use **Back** (or the browser-style back).
   Expected: Back from a journal opened from a recurring journal returns to that detail (not to the Journals list).
   Breadcrumb reads Companies / Kystgruppe Nordic / Accounts / Journals / Recurring journals / A4T Rent Oslo. Say if not.
7. Back on the Journals page, find the link-button **Recurring journals · n** beside the New journal menu.
   Expected: present while the company has any recurring journal; click it to land on the Recurring list.
8. Sign in as Bjorn, open the rent journal (do **not** post: that is A14).
   Expected: his page shows **Post**.

---

# 3. Journal CSV import

Files below are plain UTF-8 text. Save each exactly (header row first) with the given name, anywhere you can pick it
from. The same layout applies to all: comma delimiter, point decimals, ISO dates.

**File 1, `kystgruppe-a4t-good.csv`** (three journals, 22 450,50 NOK each side, balanced). Accounts 6700, 6800, 6360 are
expense accounts; 2960 and 2990 are liabilities; 1920 is the bank account. `OSL-OPS` and `BRG-OPS` are Kystgruppe's cost
centres.

```csv
journal_key,entry_date,memo,voucher_ref,voucher_date,account,debit,credit,description,branch,cost_centre,auto_reverse
ACC-A4T-01,2026-11-16,Accrued audit fee November A4T,Bilag A4T-2301,2026-11-16,6700,15000.00,,Audit fee,OSL,OSL-OPS,yes
ACC-A4T-01,2026-11-16,Accrued audit fee November A4T,Bilag A4T-2301,2026-11-16,2960,,15000.00,,OSL,,yes
SUP-A4T-11,2026-11-16,Office supplies November A4T,Bilag A4T-2302,2026-11-16,6800,3200.00,,Printer paper and toner,OSL,OSL-OPS,
SUP-A4T-11,2026-11-16,Office supplies November A4T,Bilag A4T-2302,2026-11-16,1920,,3200.00,,OSL,,
CLN-A4T-11,2026-11-16,Cleaning Bergen November A4T,Bilag A4T-2303,2026-11-16,6360,4250.50,,Monthly cleaning,BRG,BRG-OPS,
CLN-A4T-11,2026-11-16,Cleaning Bergen November A4T,Bilag A4T-2303,2026-11-16,2990,,4250.50,,BRG,,
```

**File 2, `kystgruppe-a4t-problems.csv`** (five journals; four have problems, one is clean). Each problem is deliberate:
BAD-A4T-01 has an amount `1.250` that looks like a thousands separator; BAD-A4T-02 uses account 6301 (not in the chart);
BAD-A4T-03 has a date written the Norwegian way; BAD-A4T-04 does not balance (debit 1000.00, credit 900.00);
OK-A4T-05 is clean.

```csv
journal_key,entry_date,memo,voucher_ref,voucher_date,account,debit,credit,description,branch,cost_centre,auto_reverse
BAD-A4T-01,2026-11-16,Separator problem A4T,Bilag A4T-3101,2026-11-16,6800,1.250,,Toner,OSL,,
BAD-A4T-01,2026-11-16,Separator problem A4T,Bilag A4T-3101,2026-11-16,1920,,1250.00,,OSL,,
BAD-A4T-02,2026-11-16,Unknown account A4T,Bilag A4T-3102,2026-11-16,6301,800.00,,Rent extra,OSL,,
BAD-A4T-02,2026-11-16,Unknown account A4T,Bilag A4T-3102,2026-11-16,1920,,800.00,,OSL,,
BAD-A4T-03,16.11.2026,Date format A4T,Bilag A4T-3103,2026-11-16,6800,500.00,,Pens,OSL,,
BAD-A4T-03,16.11.2026,Date format A4T,Bilag A4T-3103,2026-11-16,1920,,500.00,,OSL,,
BAD-A4T-04,2026-11-16,Unbalanced A4T,Bilag A4T-3104,2026-11-16,6800,1000.00,,Paper,OSL,,
BAD-A4T-04,2026-11-16,Unbalanced A4T,Bilag A4T-3104,2026-11-16,1920,,900.00,,OSL,,
OK-A4T-05,2026-11-16,Clean journal A4T,Bilag A4T-3105,2026-11-16,6340,700.00,,Electricity,OSL,,
OK-A4T-05,2026-11-16,Clean journal A4T,Bilag A4T-3105,2026-11-16,1920,,700.00,,OSL,,
```

**File 3, `kystgruppe-a4t-header.csv`** (the header is wrong: a column is missing and one is unknown):

```csv
journal_key,entry_date,memo,konto,debit,credit
H-A4T-01,2026-11-16,Wrong header A4T,6800,100.00,
H-A4T-01,2026-11-16,Wrong header A4T,1920,,100.00
```

**File 4, `kystgruppe-a4t-fixed.csv`** (File 2 with the four problems corrected, five journals):

```csv
journal_key,entry_date,memo,voucher_ref,voucher_date,account,debit,credit,description,branch,cost_centre,auto_reverse
BAD-A4T-01,2026-11-16,Separator problem A4T,Bilag A4T-3101,2026-11-16,6800,1250.00,,Toner,OSL,,
BAD-A4T-01,2026-11-16,Separator problem A4T,Bilag A4T-3101,2026-11-16,1920,,1250.00,,OSL,,
BAD-A4T-02,2026-11-16,Unknown account A4T,Bilag A4T-3102,2026-11-16,6300,800.00,,Rent extra,OSL,,
BAD-A4T-02,2026-11-16,Unknown account A4T,Bilag A4T-3102,2026-11-16,1920,,800.00,,OSL,,
BAD-A4T-03,2026-11-16,Date format A4T,Bilag A4T-3103,2026-11-16,6800,500.00,,Pens,OSL,,
BAD-A4T-03,2026-11-16,Date format A4T,Bilag A4T-3103,2026-11-16,1920,,500.00,,OSL,,
BAD-A4T-04,2026-11-16,Unbalanced A4T,Bilag A4T-3104,2026-11-16,6800,1000.00,,Paper,OSL,,
BAD-A4T-04,2026-11-16,Unbalanced A4T,Bilag A4T-3104,2026-11-16,1920,,1000.00,,OSL,,
OK-A4T-05,2026-11-16,Clean journal A4T,Bilag A4T-3105,2026-11-16,6340,700.00,,Electricity,OSL,,
OK-A4T-05,2026-11-16,Clean journal A4T,Bilag A4T-3105,2026-11-16,1920,,700.00,,OSL,,
```

(File 4 totals: 1 250,00 + 800,00 + 500,00 + 1 000,00 + 700,00 = 4 250,00 each side, five journals, ten lines.)

## A10. Import a good file: Upload, Check, Create, then the Imported tag and source line

Who: `anna.lindh`. Creates: one confirmed import of File 1 (three drafts: ACC-A4T-01 marked Reverse automatically,
SUP-A4T-11, CLN-A4T-11). Uses File 1.

1. Sign in as Anna. *Journals → New journal ▾*.
   Expected: the menu has **Import journals**. Click it.
   Expected: page "Import journals", stepper **Upload · Check · Create**, subtitle "Journals from a spreadsheet or
   another system, checked line by line. All are created, or none." A drop zone "Drop a CSV file here or choose a file",
   muted line "CSV, UTF-8, up to 5 MB, 10,000 rows and 500 journals".
2. Read the format help (open the first time).
   Expected: a table of columns with Needed and Example; three rules "One row per line. Rows with the same journal key
   make one journal.", "Amounts with a point and no thousands separator: 1250000.50" (or the builders' longer words
   "Write amounts with their decimals as they are: 1250.50 or 1250. A point followed by three digits, like 1.250, could
   be a thousands separator, so it's refused: write 1250.00."), "Dates as 2026-10-31" (shown in the company's pattern).
   Dimension columns are explained: `branch`, `cost_centre`, `project` and the company's own dimension columns, with
   `channel` named (Kystgruppe has the free dimension CHANNEL).
3. Click **Download a sample file**.
   Expected: a save dialog, the toast "File saved." and a file with the header `journal_key,entry_date,memo,voucher_ref,…`
   including `project` and `channel`. (Downloads appear only where the desktop file saver is wired: A18.)
4. **Create as**: look at the options **Drafts** and **Waiting to post**.
   Expected: Drafts selected; the line "Drafts: you or a colleague check and submit them; someone else posts them." Switch
   to **Waiting to post** and read "Waiting to post: they go straight to someone else, who posts them.", then back to **Drafts**.
5. Click the drop zone / **choose a file** and pick `kystgruppe-a4t-good.csv`. Click **Check the file**.
   Expected: the button shows progress "Checking…" and the page stays (no skeleton: builders' choice); then the page
   moves to **Check** by itself.
6. Read the Check step.
   Expected: summary card titled "kystgruppe-a4t-good.csv", subtitle "3 journals · 6 lines · Nov 2026"; Debit
   22 450,50 · Credit 22 450,50; status **Ready to create** (success). No warnings. A journals table with columns Key ·
   Date · Memo · Document · Lines · Debit · Reverses · Status: three rows, status **OK**; ACC-A4T-01 has Reverses
   01.12.2026, the others "—".
7. Expand a row (disclosure) for SUP-A4T-11.
   Expected: its two lines with Row (file line numbers), Account "6800 Office supplies" / "1920 Bank deposits", Debit or
   Credit, Branch OSL, Cost centre OSL-OPS on the first line, Description.
8. Click **Create 3 drafts**.
   Expected: a confirm sheet "Create 3 drafts?" with "All 3 are created, or none. Nothing reaches the books until someone
   else posts them. You won't be able to post them yourself." Confirm.
9. Read the result.
   Expected: card "3 journals created from kystgruppe-a4t-good.csv" with **Open in Drafts** and, if the file is clean,
   **Download the file** (when the scan is still PENDING instead: "The file is still being checked. It can be downloaded
   once the check is done.").
10. Click **Open in Drafts**.
    Expected: *Journals → Drafts* opens (the builders could not filter by this import: it shows all drafts; the three
    new ones are at the top). Each carries a muted tag **Imported** (file name in its tooltip); ACC-A4T-01 also shows
    **Reverses 01.12**.
11. Open the Origin filter, tick **Imported**.
    Expected: only the three imported journals remain.
12. Open ACC-A4T-01.
    Expected: a source line "Imported from kystgruppe-a4t-good.csv by Anna Lindh, key ACC-A4T-01" (the file name is a
    link to the import); the **Automatic reversal** card "Will be reversed on 01.12.2026 once posted." (it came from the
    `auto_reverse = yes` column).
13. Click the source link.
    Expected: the import's summary/result opens (read-only result card for a confirmed import).
14. *Journals → New journal ▾*: look at the import entries.
    Expected: **Import journals** and a way to **Journal imports** (history). Open the history.
    Expected: list card "Journal imports" with one row: File kystgruppe-a4t-good.csv, Status **Created**, Journals 3,
    Lines 6, Debit 22 450,50, By Anna Lindh, When today; the row links to its journals and carries **Download the file**.

## A11. A file with problems, an unreadable header, and uploading a fixed file

Who: `anna.lindh`. Creates: nothing in the books if you stop at step 9; step 10 onwards creates one confirmed import of
File 4 (five drafts). Uses Files 3, 2 and 4.

1. Sign in as Anna. *Journals → New journal ▾ → Import journals*. Choose `kystgruppe-a4t-header.csv`, click **Check the file**.
   Expected: the refusal stays on step 1, inline under the drop zone: "Missing column: voucher_ref, voucher_date, account..."
   (every missing required column, each on its own line) and "Unknown column: konto." No move to Check.
2. Choose `kystgruppe-a4t-problems.csv` (replace the file), click **Check the file**.
   Expected: the page moves to Check. Summary subtitle "5 journals · 10 lines · Nov 2026". Status line in danger: "4 problems:
   fix the file and upload it again" (the count may read 4 journals with problems; report how it counts). **Create** is
   not offered or is disabled with the reason.
3. Look at the toolbar.
   Expected: the chip **Only problems** is on; the table lists the four problem journals (BAD-A4T-01 to 04) and not
   OK-A4T-05. A search box "Key, memo or document". Turn **Only problems** off: five rows, OK-A4T-05 shows **OK**; the
   others "n problems" in danger. Turn it back on. (Builders filter the table locally.)
4. Expand BAD-A4T-01.
   Expected: line with 1.250 in italics, outlined, and under it "Row {n}: 1.250 could be a thousands separator; write
   1250.00." The row number is the line number in the file (write down whether the first data row is Row 2 or Row 1).
5. Expand BAD-A4T-02.
   Expected: "Row {n}: account 6301 isn't in the chart." with the file's own text 6301 in italics.
6. Expand BAD-A4T-03.
   Expected: "Row {n}: use 2026-11-16 for dates." (the example in the company's wording).
7. BAD-A4T-04: look at the journal row.
   Expected: "Journal BAD-A4T-04: debit and credit differ by 100,00." (or the plain "debit and credit differ.").
8. Remember the builders open only the **first five** problem journals by themselves: here that is all four. (A18.)
9. Click **Discard**.
   Expected: a confirm "Discard this check? Nothing was created." Cancel it (do not discard yet). Then click **Upload a
   fixed file**.
   Expected: back to step 1 with **Create as** unchanged; this discards only your own check (see A18).
10. Choose `kystgruppe-a4t-fixed.csv`, **Check the file**.
    Expected: Check step, "5 journals · 10 lines · Nov 2026", Debit 4 250,00 · Credit 4 250,00, **Ready to create**, five rows OK.
11. **Create as: Waiting to post** (before checking) is a variant: instead of the Drafts button the primary reads
    **Submit 5 journals**. Use that: go back with **Upload a fixed file**, choose File 4 again, set **Waiting to post**,
    **Check the file**, then click **Submit 5 journals** and confirm.
    Expected: the sheet reads "Submit 5 journals?" (or the matching words), result card "5 journals created from
    kystgruppe-a4t-fixed.csv" with **Open in Waiting to post**; the five journals sit under *Waiting to post* with the **Imported** tag.
    If **Waiting to post** is disabled for Anna, she lacks Submit: report (she should have it).

## A12. Warnings to tick, and discard

Who: `anna.lindh`. Creates: one more checked file that you discard (nothing created in the books). Needs A10 done (File 1
already imported).

1. Sign in as Anna. *Import journals*, choose `kystgruppe-a4t-good.csv` again (the file already imported in A10),
   **Check the file**.
   Expected: Check step; status "Ready to create" is **not** enough: a warnings block with checkboxes, one per warning:
   "This file was imported on 16.11.2026 by Anna Lindh." and, for each journal that looks like an existing one (same
   document reference, date and amount), "ACC-A4T-01 looks like {JV-DRAFT-…} (same document reference, date and amount)."
2. Look at the primary button.
   Expected: **Create 3 drafts** is disabled until every warning is ticked, with the reason beside it ("Tick each warning
   to go on.").
3. Tick all warnings but one.
   Expected: still disabled. Tick the last.
   Expected: enabled.
4. Do **not** create. Click **Discard**, then **Discard** in the confirmation "Discard this check? Nothing was created."
   Expected: back to step 1 (Upload) or to the history; no journals were made. *Journals → Drafts* count unchanged.
5. Open the history ("Earlier imports" link on step 1, or the menu entry).
   Expected: the discarded import is listed with status **Discarded**, with no Download link and no links to journals.

## A13. Someone else's check is read-only; discard one's own; history

Who: `anna.lindh` uploads, `bjorn.eriksson` looks, `ola.nordmann` looks. Creates: one checked file (File 4 with different
journal keys is not needed: use File 1 again) that is later discarded.

1. Sign in as Anna. *Import journals*, choose `kystgruppe-a4t-good.csv`, **Check the file**, tick the warnings if any,
   and **stop** on the Check step (do not create).
2. Sign out, sign in as Bjorn. *Journals → New journal ▾ → Journal imports* (history).
   Expected: a row for the file with status **Checked** and By Anna Lindh.
3. Open that row.
   Expected: a read-only summary of the check (journals, lines, totals, warnings and problems) with no **Create**, no
   **Upload a fixed file** and no **Discard** for Bjorn (Finance Manager); a notice "Only Anna Lindh, who uploaded the file, can create
   these journals." and the footer "Only the person who uploaded the file can create these journals." Bjorn can still read the journals table.
4. If the screen offers a Create button anyway, click it.
   Expected: the refusal "Only Anna Lindh, who uploaded the file, can create these journals." and nothing is created.
5. Open *Journals → New journal ▾ → Import journals* as Bjorn.
   Expected: his own Upload step opens (his own check, if any, resumes; Anna's does not). Anna's check is not his.
6. Sign in as Ola. Open the same history row.
   Expected: same read-only view (an Owner also cannot create someone else's import), but with **Discard**: the dialog reads "Discard Anna Lindh's check?" with a required reason field and "Anna Lindh sees who discarded the check and why." Cancel the dialog now: Anna's check must stay for step 7. (To test the Owner's discard, repeat steps 1 and 6 with a new check after step 8, discard it as Ola with a reason, then open the row as Anna: "Ola Nordmann discarded this check. Nothing was created. Reason: …".)
7. Sign in as Anna. Open *Import journals* again.
   Expected: the page resumes at **Check** with her unfinished check (coming back to the import route resumes it).
8. Click **Discard** and confirm.
   Expected: the check is discarded; history shows **Discarded** (and the earlier Created ones from A10/A11 as **Created**).
9. History columns.
   Expected: File · Status (Checked, Created, Discarded; Expired cannot be produced today) · Journals · Lines · Debit ·
   By · When. A created one links to its journals. A status the app does not know reads "Handled on the server".

---

# 4. Two-person rule

## A14. Posting by someone other than the writer

Who: `bjorn.eriksson` writes, `ola.nordmann` posts, `anna.lindh` tries. Creates: recurring journal **A4T Bjorn Rent**
(Bjorn is its writer, monthly, 1st, start 01.11.2026, waiting to post, 5 000,00 rent 6300 / bank 1920), one journal waiting
to post from it, and one accrual written by Bjorn. Uses recipe R1 for the accrual.

1. Sign in as Bjorn. *Recurring journals → New recurring journal*. Name `A4T Bjorn Rent`, Memo `Bjorn rent `+Insert **Month and
   year**, Creates **Waiting to post**, Document reference `Lease A4T-BJ `+Insert **Month and year**, Every month, **1st**,
   Starts `01.11.2026`, Never. Lines 6300 debit `5 000,00`, 1920 credit `5 000,00` (branch Oslo HQ each). **Save**.
   Expected: toast "Saved. Next journal on 01.12.2026." (or 01.11.2026 if the job has not run yet). The editor showed the
   notice "You'll be one of this journal's writers: you won't be able to post the journals it creates."
2. Wait up to 15 minutes. *Journals → Waiting to post*, open the journal from A4T Bjorn Rent.
   Expected: tag **Recurring**; the **Post** button is present (Bjorn can post in general).
3. Click **Post** and confirm.
   Expected: the refusal in words where the action was: "You wrote or changed the recurring journal that created this
   journal, so someone else must post it." The journal stays waiting to post. Report if instead the page lets him post,
   or hides **Post** without telling why.
4. Sign out, sign in as Ola. Open the same journal.
   Expected: **Post** is present. Click **Post**, confirm.
   Expected: posted (Ola is not a writer of the template); status Posted; the source line reads "From the recurring
   journal A4T Bjorn Rent, Nov 2026".
5. Open *Recurring journals → A4T Bjorn Rent* as Bjorn.
   Expected: "You're one of its writers, so you can't post the journals it creates." (Owner, if a writer: "You can post the
   journals it creates as Owner, with the confirmation."). The Dates row now shows "Posted".
6. Bjorn writes an accrual and tries to post it. Sign in as Bjorn, *New accrual or prepayment* with the R1 field values but
   Amount `1 300,00`, document reference `EST-A4T-6`, then click **Open in editor** (not Submit).
   Expected: the draft editor opens with the box **Reverse automatically** ticked and the date line.
7. In the editor click **Submit** (as an Owner/Finance Manager may), then **Post**.
   Expected: Post is refused for the writer with the standard two-person words of the journal editor ("someone else must
   post it", the same as A1's journals), not a special automatic-reversal message. Sign in as Ola and post it: the post
   dialog adds "You also approve its reversal on 01.12.2026."
8. Anna: *Waiting to post*, open any journal.
   Expected: no **Post** button (Accountant has no post right); this is the ordinary rule, not a new A4 one.

---

# 5. Feature off, history readable, back on

All three tests are run by `jonas.moe` first: **Platform → Companies → Kystgruppe Nordic → Modules → Finance**. The
features are named in the list under **Finance**; the build's names are **Recurring journals** (FINANCE.RECURRING_JOURNALS)
and **Journal import** (FINANCE.JOURNAL_CSV_IMPORT). Report the exact label you find (round 1 saw "Recurring journals and
accruals" and "Journal CSV import"). Switching a feature off asks for a reason in a dialog "Record the reason"; type
`A4 test, switching back later`, wait until the whole text shows, then **Apply change** (a tap that lands while the
typing is still arriving stores half the reason).

## A15. Recurring journals off

Who: `jonas.moe`, then `anna.lindh`, `bjorn.eriksson`. Creates: nothing new if A1/A4/A5 were run first (it reads their data).
For the one skipped month it also creates recurring journal **A4T Off month** (monthly, 1st, start 01.11.2026).

1. Sign in as Anna. Create **A4T Off month**: Draft, Every month, **1st**, Starts `01.11.2026`, Never, lines 6800 debit
   `50,00` / 2990 credit `50,00`. **Save**. **Immediately** (within the 15-minute job window) go to step 2. Do not wait for
   the job.
2. Sign in as `jonas.moe`, switch **Recurring journals** off for Kystgruppe Nordic (reason as above).
   Expected: the feature shows off; the Finance line reads one fewer on.
3. Sign in as Anna. *Journals → New journal ▾*.
   Expected: **New accrual or prepayment** is not in the menu. **Import journals** and the **Recurring journals** entry
   (history readable) are.
4. *Journals → New journal* (editor), tick nothing: look at the **Reverse automatically** box.
   Expected: the box is hidden or disabled with "Reverse automatically isn't part of your plan right now." A new tick is
   impossible.
5. Open the draft from A2 (Reverse automatically ticked), as Anna.
   Expected: the box is shown ticked and disabled with that line; untick is allowed. Click **Submit** while it is still
   ticked (re-tick is impossible, so first do step 6 as a check of the server refusal if the box lets you; otherwise untick).
   Expected when the draft is submitted still ticked (if the screen lets you): refusal "Reverse automatically isn't part
   of your plan right now. Untick it to go on." Untick it, then save: saves.
6. *Recurring journals*.
   Expected: the list opens **read-only**: an info notice "Recurring journals isn't part of your plan right now. What
   was set up stays readable; no new journals are created, and months while it's off aren't created later." There is no
   **New recurring journal**; rows have no More menu (Edit, Pause, Resume, End all gone).
7. Open a recurring journal (A4T Rent Oslo).
   Expected: the detail reads; no Edit, Pause, Resume, End; the same notice; its runs list is readable and a skipped
   row has no **Create draft now** or **Dismiss**. Try the address `…|recurring|{id}|edit` is not possible from the UI:
   note if any button leads to the editor (the editor route should open the detail).
8. As Anna open *Journals → Posted*, open the posted accrual from A4 whose reversal was cancelled and one that is still
   PENDING (A1's journal).
   Expected: the PENDING card still shows **Cancel automatic reversal** for Bjorn (cancel works while the feature is off,
   D-179). Sign in as Bjorn and cancel A1's reversal with reason `A4T cancel while off`.
   Expected: cancels as in A4; toast "Automatic reversal of {JV-…} cancelled." (Cancel stays; **Reverse now** also stays
   on a FAILED one, which cannot be produced today.)
9. Wait up to 20 minutes for the job (it runs while the feature is off). Switch the feature **back on** as `jonas.moe`
   (see A17 step 1). As Anna, open **A4T Off month**.
   Expected: if the job ran in the off window: a run row 01.11.2026 reading "Not created: Recurring journals was off in
   Nov 2026" (warning), with **Create draft now** and **Dismiss** now available again; the month is **not** caught up.
   If the job ran before step 2, you see "Draft created" instead: the off-window race missed, note it. The acceptance
   script (`a4-acceptance.sh`) covers this step end to end.

## A16. Journal import off

Who: `jonas.moe`, then `anna.lindh`. Creates: nothing (reads A10's import).

1. As `jonas.moe` switch **Journal import** off for Kystgruppe Nordic (reason as above).
2. Sign in as Anna. *Journals → New journal ▾*.
   Expected: **Import journals** is not in the menu. A **Journal imports** (history) entry stays in its place.
3. Open the history.
   Expected: the list with the imports from A10 to A13 is readable (Created, Discarded); a confirmed one still shows
   **Download the file** and downloads it (read-only history, D-179).
4. Try to start a check: only possible if an old route is reachable. On the history page (Earlier imports) click the
   breadcrumb **Import journals** (or an "Upload" back link if there is one).
   Expected: the wizard route shows the feature-off state, not the Recurring journals page: the title "Journal import is off for
   Kystgruppe Nordic" with "Ask your company admin to turn on Journal import." and **Back to Journals**, no upload field
   (the spec words are "Import journals isn't part of your plan right now."). Report the exact title you see.
5. As the same Anna, if an unfinished check from before still exists (you can create one in A13 before switching off),
   open it from the history.
   Expected: read-only; no Create.

## A17. Both features back on

Who: `jonas.moe`, then `anna.lindh`.

1. As `jonas.moe`, *Platform → Companies → Kystgruppe Nordic → Modules → Finance*: switch **Recurring journals** on, reason
   `A4 test done`; switch **Journal import** on, reason `A4 test done`.
   Expected: both show on; the Finance line reads fully on again.
2. Sign in as Anna. *Journals → New journal ▾*.
   Expected: **New accrual or prepayment** and **Import journals** are back. *Journals → New journal*: **Reverse
   automatically** is usable.
3. *Recurring journals*: **New recurring journal** is back; open A4T Rent Oslo (if you ended it in A8, open any active one,
   or create **A4T Back on** quickly): Edit, Pause and End are back. Dismiss and **Create draft now** return on any
   skipped run (see A7 and A15 step 9).
4. *Import journals*: upload File 4 again and **Check the file**.
   Expected: the wizard works; you will see the warnings from the earlier import of the same file (tick them). Discard.

---

# 6. The builders' open decisions

## A18. Walk the 34 builder decisions and confirm each

For each line: do what it says, compare with "Expected", and write **confirm** or **change: {what you want}**. Each
decision comes from the P2, P3 or P4 report. Use anything left over from A1 to A17.

**P2: reverse automatically and the accrual dialog (8)**

1. *Feature off: a draft already marked can only be unticked.* After A15 step 5: Expected: the box is ticked and disabled
   with "Reverse automatically isn't part of your plan right now."; only an untick is possible. Confirm or change.
2. *Accrual dialog is a side panel (`NeoSidePanel`), not the dialog sheet the spec names.* A1 step 2: Expected: it slides in
   from the right on desktop. Confirm or change.
3. *Reverse now also for a PENDING reversal once its date has passed.* Not visible today (needs the 1st): Expected: when
   the due date has passed and the status is still PENDING, the card offers **Reverse now** as well as Cancel (the spec
   lists Reverse now only for FAILED). Confirm or change.
4. *The failed-reason map ("the month is closed", "the month is locked", "the posting was refused").* Cannot be provoked:
   Expected: a FAILED reversal reads "Couldn't be reversed on 01.12.2026: the month is closed. Neovatus has been alerted."
   Confirm or change.
5. *No Post block in the editor for a poster without the Reverse right (the server refuses, in words).* Needs a person with
   post but not reverse: none in the demo. Expected: **Post** is not disabled in advance; on click the refusal reads
   "You can post journals but not reversals. Someone who can do both must post this one." Confirm or change.
6. *The balance account is suggested only for accrued expense and prepaid expense.* A1 step 3 and 5: change Kind to **Accrued
   income**, then **Prepaid expense**, then **Deferred income**. Expected: Balance account is filled (2960) for
   Accrued expense, filled (1700 Prepaid rent or another Prepayment account) for Prepaid expense, and **empty** for
   Accrued income and Deferred income. Confirm or change.
7. *Dialog wording for a closed month.* The Month list offers only open months, so no closed-month words show in the
   dialog. Expected: that is acceptable. Confirm or change (the other option: list closed months disabled with a note).
8. *Card wordings on the Automatic reversal card (A1, A4).* Confirm the texts: "Will be reversed on {date} once posted.",
   "Reversed automatically on {date}.", "Approved by {name} when posting.", "Waits for {FY} to be created.", "Cancelled by
   {name}", "Reversed by hand by {name}". Confirm or change.

**P3: recurring journals (16)**

9. *The editor grid is the journal grid behind a shared interface.* A5 step 9 and A6 step 3: Expected: same keyboard,
   Tags toggle and phone cards as the journal editor. Confirm or change.
10. *"Each time" placeholder plus the hint "Chosen with the amount each time."* A6 step 3. Confirm or change.
11. *Insert puts the placeholder at the end of the text, not at the cursor.* A5 step 3: put the cursor in the middle of the
    memo before clicking **Insert → Month and year**. Expected: the month and year are added at the **end**. Confirm or change.
12. *The "Next: …" preview comes only from the server (no app-side guess).* A5 step 3: Expected: appears after a moment; for
    a brand-new template it shows the memo, not an empty line. Confirm or change.
13. *Writer notice on a new recurring journal.* A5 step 2 and A14 step 1: Expected: "You'll be one of this journal's
    writers: you won't be able to post the journals it creates." above the form. Confirm or change.
14. *Pause, End, Dismiss and Resume use a dialog sheet with a reason field.* A7 and A8: Expected: all four ask for a reason
    (the spec says Resume is a plain confirmation, not a reason gate). Confirm or change.
15. *Resume body is generic (the app does not compute the skipped months).* A8 step 5: Expected: "Journals are created again
    from the next date. Months while it was paused are not created." The spec words have the next date and the months
    ("Nov 2026 and Dec 2026 are not created."). Confirm or change.
16. *Create draft now: the date defaults to the first day of the earliest open month after the skipped one.* A7 step 4. Confirm or change.
17. *The "Recurring journals · n" link-button sits in the Journals card head (beside New journal).* A9 step 7. Confirm or change.
18. *Origin filter words.* A9 step 2: Entered in Accounts, Recurring, Imported, From modules. Confirm or change.
19. *The source link goes back to the recurring journal.* A9 step 5 and 6. Confirm or change.
20. *Breadcrumb on a recurring journal and on Import.* A9 step 6; A10 step 1: Expected: Companies / Kystgruppe Nordic / Accounts /
    Journals / Recurring journals / {name}, and … / Journals / Import journals. Confirm or change.
21. *The "Automatic reversals" tab and its route open the Recurring list, not a separate tab.* A5 step 1: Expected: the
    recurring page has no **Automatic reversals** tab today; the spec describes one with a read list of all
    reversals (due date, status, Reverse now, Cancel). Confirm that this is deferred, or ask for it now.
22. *English label changes made for the duplicate-label test.* A5 step 7: Expected: the schedule labels read as built
    (the report names "Starting from", "Ending" and "Ending on"; the spec said Starts, Ends and On a date). Note what the
    screen says. Confirm or change.
23. *Problem wording on a failed save.* A6 step 6, A5 step 14: the words are those in the spec §9. Confirm or change.
24. *Unclear save: a retry keeps the same idempotency key.* Cannot be provoked by hand (needs a network fault). Expected:
    pressing **Save** again after "We couldn't confirm the result. Your changes are kept." creates no second recurring
    journal. Confirm or change.

**P4: journal import (10)**

25. *Ownership is read from the server (`IMPORT_NOT_YOURS`), not guessed.* A13 step 3 and 4. Confirm or change.
26. *Upload a fixed file discards only your own check.* A11 step 9. Confirm or change.
27. *One idempotency key per file pick plus Create as.* A11 step 11: pick the same file twice and choose a different Create as.
    Expected: no duplicate import; each pick makes its own check. Confirm or change.
28. *The journals table is filtered locally; the first five problem journals open by themselves.* A11 step 3 and 8. Confirm or change.
29. *The feature-off spot names the feature "Journal import" in the title.* A16 step 4: Expected: "Journal import isn't part of
    your plan right now" (the spec says "Import journals isn't part of your plan right now."). Confirm or change.
30. *Where the menu items sit.* A10 step 1 and 14: Import journals and Journal imports are in the arrow part of **New journal**
    (the spec puts them under **More**, a separate menu). Confirm or change.
31. *Open in Drafts shows all drafts, not only this import's.* A10 step 10: Expected: the three imported drafts are at the
    top of an unfiltered Drafts tab (the backend has no filter by import). Confirm or change.
32. *Downloads work only where the desktop file saver is wired.* A10 step 3 and 14: Expected: the sample file and the kept
    file both save on desktop; other platforms may show "The file couldn't be saved." Confirm or change.
33. *"Checking…" with a progress bar instead of a skeleton on the Check step.* A10 step 5: Expected: a progress state on the
    upload button, the page stays. Confirm or change.
34. *Norwegian and Danish say "bilag", Swedish "verifikation".* If the app has a language setting, switch to Norsk, Svenska,
    Dansk and open *Import journals*: Expected: "bilag" in nb and da, "verifikation" in sv for what en calls journal; the
    spec's own sentence is "journal". If there is no language switch, mark **not tested** and keep this for the I18N round.
    Confirm or change.

Anything else you see: write it down with the test id and the step.

---

## Not turned into steps (spec items I could not test from the screen)

- **The reversal job itself.** An automatic reversal posts on the 1st of the next month (RV by `system`, key
  `AUTO-RV:{id}`, approval origin SCHEDULED), and the Automatic reversal card's POSTED ("Reversed on {date} as
  {RV-…}"), FAILED and "Reverse now" states need that date or a closed month. FAILED cannot be reached at all: closing the
  month is blocked while a reversal is pending (`AUTO_REVERSALS_PENDING`). Covered by `scripts/a4-acceptance.sh` (20 to
  50 minutes, real jobs).
- **The Automatic reversals tab** (§4.1: list, status filter, Due from/to, Reverse now, Cancel per row) is not built
  (P3 report, "left open"); the route opens the recurring list. A18 item 21.
- **The "{n} recurring journals need you" notice and count on the Journals page and on the recurring link badge** are not
  built (P3 "left open"); only the **Needs you** tag on the list row exists. A7 step 3 notes it.
- **Period close checklist rows** "Automatic reversals not posted" and "Recurring journals not created": the first
  is checked in A1 step 11. The second ("{name}: no journal for {Nov 2026} ({reason})", warning) is not in any report
  as built; look for it in A7 (Period close, Nov 2026, after the skipped runs) and report if missing.
- **Server refusal `AUTO_REVERSE_NOT_ALLOWED` with ADJUSTMENT_PERIOD** (D-174 words): the editor prevents the pair, so
  the server's words cannot be shown from the app (A3 step 5).
- **Server refusals the screen prevents:** `SCHEDULE_INVALID` variants (the picker blocks them inline, A5 step 8 shows
  only the closed/locked tags), `PLACEHOLDER_UNKNOWN`, `RECURRING_LIMIT` (500), `IMPORT_TOO_LARGE`, `FILE_TOO_LARGE`,
  `IMPORT_FILE_TYPE`, `IMPORT_ENCODING`, `IMPORT_EMPTY`, `IMPORT_FILE_REJECTED` (needs a failed safety scan), `FILE_NOT_AVAILABLE`
  with scanState PENDING (only if the scanner is slow), `IMPORT_QUEUE_FULL` (needs five unfinished checks and its links
  are not built), `IMPORT_EXPIRED` (24 hours), `IMPORT_HAS_PROBLEMS` at Create (the chart would have to change between
  check and create). `VERSION_CONFLICT` on a recurring journal needs two windows editing at once (use two app windows
  with Anna and Bjorn if you want it: both Edit, Anna saves, Bjorn saves, expected "Anna Lindh changed this recurring
  journal at {time}. Load their version…").
- **`DATES_IN_SEVERAL_PERIODS` warning** (a file whose journals fall in several months) needs a second open month other
  than Nov and Dec 2026 and is not in a file here.
- **Dimension columns beyond cost centre:** `project` (HARBOUR-26) and the company dimension `channel` (DIRECT, PARTNER, account
  3090) are listed in the format help but no file exercises them. Add a `project` column with `HARBOUR-26` on a 6800 line
  of File 1 and a `channel` column with `DIRECT` on a 3090 line if you want it.
- **Widths:** the three widths of §7 (1440, 1024, 390), phone cards and the compact stepper "Step 2 of 3"
  (resize the window; not a click-through).
- **Deep links** `…|journals|new-accrual` (P2 "left open") and the language review of nb, sv and da text (P2 to P4) are not
  clickable today.
- **Resume's date and Org outage** (503 `ORG_UNAVAILABLE`, "We couldn't read the company's date just now…") needs Org down.
- **A poster who can post but not reverse:** no demo person has that mix (A18 item 5).
- **The clean-up of the three-to-five unfinished checks Bjorn or Ola might leave** when they open Import: not a test.
