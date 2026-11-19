# QA round 1 retest — summary

| Group / test | Result | New findings | Tester |
|---|---|---|---|
| T16 (Lahore, with T12–T15 setup) | passed with findings | Create dialog says you can't approve yourself but Owner gets "Approve all (as Owner)" (wording); "Back to receivables" opens a blank OB wizard (flow); Held out still offers "Enter as opening items" after creation (flow); pill "Created" after approval (wording) | Pakistan/Sweden tester |
| T18 (Stockholm, steps 1–7) | passed with findings | "Your company has no org number" though Org has 556334-3689 (data); 2081 line has no branch despite "Every line gets this branch" (data); Swedish memo in English UI (wording); charset defaults PC8 for a UTF-8 file (flow) | Pakistan/Sweden tester |
| G03 | partly fixed | detail matches DB now; TB by branch still puts equity under "Other branches…" (data) | Pakistan/Sweden tester |
| G10 | fixed | — | Pakistan/Sweden tester |
| G11 | fixed | — | Pakistan/Sweden tester |
| G19 | partly fixed | Source link fixed; Create account 1925 still missing | Pakistan/Sweden tester |
| G25 | still broken (backlog) | also after reopening Reports from the menu (flow) | Pakistan/Sweden tester |
| G41 | partly fixed | template cancel shows "The file could not be saved" (wording) | Pakistan/Sweden tester |
| G08 | fixed (read-only) | Payroll On at Bergen while not in agreement (data, check) | Pakistan/Sweden tester |
| G09 | fixed | — | Pakistan/Sweden tester |
| G39 | partly fixed (platform names only) | — | Pakistan/Sweden tester |
| T24 | passed with findings | 5,00 vs 500 amount once, not reproduced (money, unconfirmed); phone Amount opens letters keyboard and footer covers field (layout); Project picker second tap (flow); no Default branch on Stockholm journal (data, check) | Pakistan/Sweden tester |
| G46 | fixed (Stockholm only) | — | Pakistan/Sweden tester |
| G06 | still broken | still 2950 suggested; hint stays after manual change (wording) | Kystgruppe tester |
| G07 | partly fixed | timeline/Written by English now; {period} still "nov./des./mar. 2026" in memo, doc ref and Next preview (data) | Kystgruppe tester |
| G13 (+A6 4–5) | still broken (app side) | server saves blank-amount draft; app shows "We couldn't confirm the result" and the detail page fails with "Something went wrong" (flow-blocker) | Kystgruppe tester |
| G21 | partly fixed | Period close names pending reversals but no link/Reverse now (flow); cancel now in timeline | Kystgruppe tester |
| G22 | fixed | — | Kystgruppe tester |
| G36 | fixed | — | Kystgruppe tester |
| A7 steps 4–7 | passed with findings | ended-but-Needs-you journal hidden from default list (flow); no Needs you chip on phone | Kystgruppe tester |
| G12 | partly fixed | one tap opens the list on both iPads; on iPad Pro 13 tapping the list's search closes it, so no typing/search (flow); iPad mini search works | Kystgruppe tester |
| G14 | still broken | Save in recurring editor footer: 3 taps in portrait, no request; landscape works | Kystgruppe tester |
| G04 | fixed (Sialkot leftovers) | Draft rows open the editor, Delete only on detail page after Submit then Withdraw (flow); reopened draft footer shows 0.00 until first edit (data, display) | Sialkot leftovers |
| G40 | partly fixed (Sialkot leftovers) | Still: Owner toast "Someone else approves it." (wording). Fixed: no-bank-details refund sheet and toast say cheque or cash; sender has "Withdraw to draft"; sender menu word is "Reject" not "Send back". New: phone side-menu header overlaps the clock (layout) | Sialkot leftovers |
| Larger Text (iPad Pro 11, iPhone 18 Pro Max) | partly (Sialkot leftovers) | Dialogs scale like the page (passed). Pickers scale but cut codes "CUST-00..." (layout); toast cut "Draft INV-DRAFT-000011 de..." (layout); line grid headers break mid-word and first line sits under footer at the largest step (layout); phone header role and breadcrumb cut (layout). See larger-text.md | Sialkot leftovers |
| G01 | fixed | refusal card on the uploader's stale page doesn't say who/why (wording) | Kystgruppe tester |
| G20 | partly fixed | source line, menu entry, resume and next action fixed; no link from banner to import; history By = uploader; Created rows no journal links; Open in Drafts keeps old search (flow) | Kystgruppe tester |
| G42 | partly fixed | "This file was imported before." still without date/person | Kystgruppe tester |
| G44 | partly fixed | writer-block reason, Last, ended reason, Dismiss words fixed; still no "· n" count on Recurring journals button (wording) | Kystgruppe tester |
| G43 | partly fixed (reachable items fixed) | A2 31.12 line, Reverse dialog and poster refusal not re-run | Kystgruppe tester |
| G23 | partly fixed | Next preview, cursor, filter, breadcrumb fixed; ended-but-Needs-you hidden (flow) | Kystgruppe tester |
| G28 | fixed | phone month sheet covers the menu; iPad mini scrim closes panel | Kystgruppe tester |
| G34 | partly fixed | tags fixed; editor grids still cut columns without hint | Kystgruppe tester |
| G37 / Larger Text (my devices) | fixed (scales live) | phone: New journal ▾ disappears (layout/flow); iPad Pro 13: journal numbers cut to "JV-"; dialog button "Leave with…"; footer 35 % on phone; drawer under status bar | Kystgruppe tester |
| G05 | still broken | bill Description keeps only "Shore" of "Shore power, December" (data); trailing line fixed | Kystgruppe tester |
| G17 | partly fixed | bill price numeric+Done; recurring Amount and Starts still letter keyboard | Kystgruppe tester |
| G26 | fixed (phone) / see G12 (iPad) | — | Kystgruppe tester |
| G31 | still broken | NEW (data): date typed in Starts landed in Document reference; accrual memo lost " fees A4T" | Kystgruppe tester |
| G32 | partly fixed | footer collapses with keyboard, but focused field not scrolled into view; iPad Pro grid hidden | Kystgruppe tester |
| G33 | partly fixed | recurring editor jumps after date change; iPad mini grid row grows | Kystgruppe tester |
| G18 | partly fixed | message next to Save now, but generic for duplicate name | Kystgruppe tester |
| G02 | not run | needs the feature switched off → next tester | Kystgruppe tester |
| G14 (2nd case) | still broken | Import journals "Earlier imports" footer link: 2 taps, no response in iPad mini portrait | Kystgruppe tester |

### Kystgruppe tester (iPad Pro 13 Ola, iPhone 18 Pro Anna, iPad mini Bjørn) — 22:20–23:23
New findings (not in round 1):
- G13/A6 5 (flow-blocker): a recurring journal with blank-amount lines can't be opened at all ("Something went wrong"); Save says "We couldn't confirm the result" although it saved.
- G31 (data): a date typed into the recurring Starts field landed in Document reference and replaced it; accrual memo lost its last words in the DB ("Accrued expense Nov 2026:accounting").
- Larger Text (layout/flow): phone Journals loses the New journal ▾ menu; iPad Pro 13 journal numbers cut to "JV-"; dialog button "Leave with…".
- A7 (flow): ended recurring journal with skipped dates (Needs you) is hidden by the default Active/Paused filter.
- G21 (flow): Period close lists pending reversals but without link / Reverse now.
- G20 (flow): Open in Drafts keeps an old search and stale count, hiding the new drafts.
- Drawer header drawn under the status bar on iPhone and iPad mini (layout, minor).
Data created: recurring A4T Rent Oslo, A4T Old fee (ended), A4T Insurance (blank amounts, can't open), A4T Bjorn Rent; JV-2026-000002 posted (15 000,00, reversal cancelled); drafts JV-DRAFT-000026..31 (imported ×3, recurring ×3); imports: problems (discarded), good (created), good (discarded by Ola).
Not reached: G02 (needs feature off); A8 duplicate-name refusal on its own (G18 used the A4T Insurance save); G43 A2/A4 step 5/A15; Split View half; iPad Pro 11 band. Text size restored to Large on all three devices; iPad Pro 13 left in portrait, iPad mini portrait.

### iPhone SE sizes (QA iPhone SE, Ola, 23:29-23:40) - full list in SIZES-iphone-se.md
New findings (not in round 1):
- Landscape (flow-blocker while keyboard is up): journal, recurring and bill editors lose footer and form behind the keyboard (14 pt strip left); even without keyboard the working area is about 90-110 pt (iPhone SE sizes).
- Portrait (flow): focused field (Amount, Name, Invoice number) is hidden behind the footer; Amount opens a letter keyboard, no numbers keyboard or Done (iPhone SE sizes).
- General ledger Account picker closes when the search field is tapped, portrait and landscape (flow, iPhone SE sizes).
- Bill footer button "Submit for appro..." cut in portrait; sticky head "Journ..." cut; side menu Accounts list clipped without hint; leaving a bill editor via the side menu gives no unsaved-changes dialog (layout/wording, iPhone SE sizes).
Known and seen again: G32, G33 (previous page scroll offset kept), G35 (filters fill the first screen, "Nu..." search), G34/G35 Trial balance cards, G26 tab needs two taps in landscape.
Data created: none. Device left in portrait on Period close.

### Kystgruppe rest (iPad Pro 13 Ola, iPhone 18 Pro Anna, iPad mini Bjorn) 23:24-23:41
| Group / test | Result | New findings | Tester |
|---|---|---|---|
| G15 | still broken | list chip/counts and open detail page don't refresh; a stale Post is refused safely with a banner naming Bjorn (flow) | Kystgruppe rest |
| G24 | partly | filters kept across tabs = fixed; GL has no cost-centre/project column (flow) | Kystgruppe rest |
| G27 | fixed | Cancel asks "Leave without saving?" on invoice/journal/recurring; Tags consistent on invoice and bill line | Kystgruppe rest |
| G35 | partly | Reports, Invoices, write-offs, iPad mini cards, Type words fixed; Journals on phone still stacks every filter (layout) | Kystgruppe rest |
| G38 | partly | journal head and GL caption fixed; T5/A9/T18 items not reached | Kystgruppe rest |
| G45 | fixed | typed dates and amounts follow Norway; screen dates "1 Dec 2026" as decided | Kystgruppe rest |
| G47 | partly | lines hint, CTRL K hint gone; kind help beside choices fixed; "Ends in N days" not reached | Kystgruppe rest |
| Size check (iPhone 18 Pro landscape, iPad mini 744, iPad Pro 13 1032 and 1376) | see SIZES.md | Reports "We couldn't find this" for Bjorn on iPad mini, every tab (flow-blocker); phone landscape editor leaves ~135 pt of 402 for fields (layout); lines grids cut after Credit/Branch with only a fade as hint (layout); iPad Pro rail flyout stays open over the page (layout); phone landscape Journals list cells cut "O..." (layout) | Kystgruppe rest |
Data created: JV-2026-000003 (draft JV-DRAFT-000032) "R3 G15 test" 1 234,50, written by Ola, posted by Bjorn. No other data; invoice/bill/recurring editors left with nothing saved.
Not reached: G02/G16, iPhone SE and Split View (other chunk), recurring editor on phone landscape, TB on iPad mini (blocked), T5/A9/T18 head items, Ends-in-days pills. Devices left in portrait.

### Feature switches (iPhone 18 Pro Anna, iPad Pro 13 Ola, iPad mini Bjorn, iPad A16 Jonas) 23:42-23:53
| Group / test | Result | New findings | Tester |
|---|---|---|---|
| G02 | fixed | server refuses submit with "Reverse automatically is part of Recurring journals and accruals, which is off for this company. Untick it to go on." (DB stays DRAFT); reopened draft has Submit disabled with the same notice; an editor already open before the switch is not refreshed on return to front (low) | Feature switches |
| G16 | partly | closed form now told by toast (grammar "was", text cut); Earlier imports off hint, crumb to off page, ON on first return, menus update = fixed; off page keeps title and short breadcrumb but not "Accounts / Payables" crumbs (partly); reads of open credit/advances still work while off (decision); Refunds menu items stay while off (question) | Feature switches |
Data created: draft JV-DRAFT-000033 "R4 G02" (100,00, Reverse automatically ticked, left as DRAFT). No refund posted. All features switched back ON: Recurring journals and accruals, Journal import, Refunds, advances and write-offs (Kystgruppe Nordic, 18 of 20 Finance features on). Devices left in portrait.

## Lessons

- **Way of working:** Sonnet testers in small chunks (10–18 min each) covered as much per chunk as the 63-minute Opus run and were easier to steer; keep chunks small and give each one device set. Grant simulator access when a device is booted, not when the tester needs it.
- **Automated tests to add in batch 2:** most "partly fixed" items were iOS-only (keyboard type, taps on iPad mini portrait, short landscape heights) that the JVM tests can't see. Add size tests at 667×375 and 874×402, a keyboard-type test per numeric field, and a per-country parse/format test for `NeoNumericInput` (the unconfirmed "500 → 5,00").
- **Fix shared parts, not screens:** several fixes landed on one editor while the same footer, picker or field is used by others (G17, G32, G12). Batch 2 briefs name the shared component and every screen that uses it.
- **Spec and scripts:** one format (screens "1 Dec 2026", typed values by company country) is now in both test scripts; 45 script fixes are listed in `script-fixes.md`. Open: Omar's role at Lahore differs between the demo-data doc (Accounts Admin) and what the app shows (Finance Manager).
