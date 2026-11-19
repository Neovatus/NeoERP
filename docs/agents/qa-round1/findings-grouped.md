# QA round 1 — findings grouped

Source: every report in this folder (T1–T24, A1–A18, layout passes, summary). Ranked: money/security → data → flow blockers → flow → layout → wording. Repo is a first read, not a diagnosis.

| Group | Title | Severity | Repo | Findings |
|---|---|---|---|---|
| G01 | Another person can discard the uploader's journal-import check | security | both | 3 |
| G02 | Submit accepted for a Reverse-automatically journal while Recurring journals is off | security | both | 2 |
| G03 | Opening-balance journal shows a branch on lines that have none in the DB | data | both | 2 |
| G04 | Invoice draft with an empty line description is saved but can't be opened | data | unclear | 1 |
| G05 | Auto-added empty line in document editors loses typed text and can't be removed | data | app | 3 |
| G06 | Accrual panel suggests 2950 Accrued interest instead of 2960 Accrued expenses | data | app | 4 |
| G07 | Recurring journals write Norwegian text into English screens | data | backend | 4 |
| G08 | Override count is wrong, and switching a feature off and on leaves an explicit ON row | data | unclear | 3 |
| G09 | Platform Overview says Kystgruppe's books start is "Not planned" although it is live | data | unclear | 1 |
| G10 | Opening items can't be created at a company that requires a branch on lines | flow-blocker | both | 1 |
| G11 | Stockholm has no branches in the app: SIE default branch picker empty, journal has no Default branch | flow-blocker | unclear | 2 |
| G12 | iPad journal grid: line pickers don't open by touch | flow-blocker | app | 4 |
| G13 | Draft-mode recurring journal with blank amounts can't be saved | flow-blocker | both | 1 |
| G14 | iPad mini portrait: sticky footer buttons don't respond to taps | flow-blocker | app | 2 |
| G15 | Pages, counts and pick lists don't refresh after someone else acts | flow | app | 5 |
| G16 | Feature off/on: late pick-up, discarded input, wrong breadcrumb, missing notices | flow | both | 7 |
| G17 | Amount and date fields: letter keyboard, stuck keyboard, no formatting | flow | app | 7 |
| G18 | Refusals are generic or shown out of view | flow | app | 5 |
| G19 | Opening-balance import wizard: hand-off and history gaps | flow | both | 6 |
| G20 | Journal import: no way back from a journal or the menu to its import; own check doesn't resume | flow | app | 5 |
| G21 | Automatic reversal: Period close doesn't name it, cancel isn't in the timeline | flow | both | 4 |
| G22 | Journals search ignores the document reference | flow | backend | 1 |
| G23 | Recurring journals editor and list behaviour | flow | app | 6 |
| G24 | Reports: filters dropped between tabs; GL has no dimension column | flow | app | 3 |
| G25 | Company switch on a report page shows "We couldn't find this" | flow | app | 1 |
| G26 | Pickers on touch: two taps, list under the keyboard, picker stays open | flow | app | 4 |
| G27 | Editors behave differently on Cancel and Tags | flow | app | 2 |
| G28 | Side menu opens under a panel; taps go through to rows behind | flow | app | 1 |
| G29 | Dimensions: new values valid from today; viewer sheet too thin; no quick add | flow | app | 4 |
| G30 | Slow loads: blank pages and long skeletons | flow | unclear | 5 |
| G31 | Typed characters or taps lost right after a panel or field opens | flow | unclear | 6 |
| G32 | Sticky footer and keyboard cover the fields being edited | layout | app | 7 |
| G33 | Layout shifts under the finger: taps land in the wrong field | layout | app | 6 |
| G34 | Wide tables and grids cut off with no scroll hint | layout | app | 8 |
| G35 | Phone/mobile lists: filters fill the first screen, cards inconsistent | layout | app | 7 |
| G36 | Period close on iPad mini portrait: title one letter per line, empty Status column | layout | app | 1 |
| G37 | App ignores iOS Larger Text | layout | app | 1 |
| G38 | Page heads: card order, stray captions, links not styled, duplicate back links | layout | app | 4 |
| G39 | One feature, several names; off notice says "your company" | wording | both | 4 |
| G40 | AR/AP approval and document wording | wording | app | 8 |
| G41 | Opening-balance import wording | wording | app | 9 |
| G42 | Journal import check wording | wording | app | 3 |
| G43 | Automatic reversal wording | wording | app | 5 |
| G44 | Recurring journals wording | wording | both | 8 |
| G45 | Dates and amounts not in the Norwegian format | wording | app | 3 |
| G46 | Dimensions wording | wording | app | 6 |
| G47 | Touch-device hints and small labels | wording | app | 4 |
| FIXED | Old findings confirmed fixed on iOS | — | — | 12 |
| SCRIPT | Test-script, seed and fixture problems | — | — | 15 |
| NOT-RUN | Steps not run; need the retest | — | — | 22 |

## G01 — Another person can discard the uploader's journal-import check

Severity: **security** · Repo: **both**

Root cause: The backend lets any holder of JOURNAL_REJECT discard someone else's checked import (JournalImportService.discard), and the read-only view offers Discard. Script/spec say only the uploader can discard; the uploader is not told.

Suggested fix: Decide the rule. If only the uploader may discard: refuse in the backend and hide Discard in the read-only view. If JOURNAL_REJECT may: update spec/script and tell the uploader who discarded it.

- **A13 step 3-4** (iPad mini landscape (Bjørn); iPad Pro 13 portrait (Ola)): Read-only view says "Only Anna Lindh, who uploaded the file, can create these journals." but offers Discard; Bjørn's Discard succeeded (DB discarded_by Bjorn Eriksson). Anna's Create then refused: "This check was discarded. Nothing was created." Screenshots: `A13-step3-readonly-discard-ipadmini.png`
- **A13 step 6** (iPad Pro 13 portrait): Ola (Owner) gets the same read-only view with Discard offered (not pressed).
- **A18 step item 25** (—): Builder decision 25: notice and no Create confirmed, but Discard offered to others and works → change.

## G02 — Submit accepted for a Reverse-automatically journal while Recurring journals is off

Severity: **security** · Repo: **both**

Root cause: Entitlement is checked on save-draft and post (JournalDraftService.requireAutoReverseFeature, JournalPostingService) but not on submit; the app keeps Submit for posting enabled.

Suggested fix: Refuse submit in the backend with "Reverse automatically isn't part of your plan right now. Untick it to go on." and disable Submit in the editor while the box is ticked and the feature is off.

- **A15 step 5** (iPhone 18 Pro portrait): Draft JV-DRAFT-000034 shows the box ticked with "Reverse automatically isn't part of your plan right now." but Submit for posting is enabled; toast "Journal JV-DRAFT-000034 submitted / It waits for someone else to check and post it." (DB SUBMITTED, auto_reverse = t). The poster then gets a refusal he can't fix. Screenshots: `A15-step5-ticked-off-iphone.png`, `A15-step5-submitted-while-off-iphone.png`
- **A18 step item 1** (—): Builder decision 1 → change: block Submit too, or refuse on submit.

## G03 — Opening-balance journal shows a branch on lines that have none in the DB

Severity: **data** · Repo: **both**

Root cause: The opening-balance import writes branch_id only on the mapped bank lines; the 2000 Share capital and 2098 Opening balance equity lines are saved with NULL branch, while the journal detail shows the default branch "Lahore HQ" on every line.

Suggested fix: Backend: put the chosen branch on every line the import creates (or the company's required branch). App: show the line's real branch, not the header default.

- **T15 step 4** (iPad Pro 11 portrait): OB-2026-27-000001 shows Branch "Lahore HQ" on all 4 lines, but journal_lines.branch_id is NULL on 2000 and 2098.
- **T15 step 5 (report)** (iPad Pro 11 portrait): Trial balance filtered to Lahore HQ puts the equity side under "Other branches and lines without a branch 325,000.00 Cr". Screenshots: `T15-tb-branch-ipadpro11.png`

## G04 — Invoice draft with an empty line description is saved but can't be opened

Severity: **data** · Repo: **unclear**

Root cause: Save draft returns an error to the app although the server created the draft; the detail of that draft fails every time. The empty line description is the likely trigger (other drafts open). Not traced to app decode vs backend response.

Suggested fix: Either refuse the save when a line has no description (the footer already says "Line 1: Describe the line.") or make the save response and detail tolerate an empty description. Make the stuck draft openable/deletable.

- **T22 step 2** (iPhone 18 Pro portrait): Save draft shows "We couldn't confirm that this went through. Reload before trying again." but INV-DRAFT-000027 was created; opening it always shows the same message with Back only. Retrying creates duplicates; it can't be edited or deleted. Screenshots: `T22-step2-save-error-iphone.png`

## G05 — Auto-added empty line in document editors loses typed text and can't be removed

Severity: **data** · Repo: **app**

Root cause: The invoice/bill editor appends a trailing empty line as soon as line 1 gets text; the recomposition drops the rest of the text being typed, and the trailing line comes back after Remove and on reopen.

Suggested fix: Add the trailing line without moving focus or recomposing the field being typed in (or add it on blur); let Remove line hide it or don't render it as a removable line.

- **T1 step 6** (iPhone 18 Pro portrait): Typing "Shore power, December" in line 1 Description left only "Shore p"; the editor auto-added an empty Line 2 and the rest was lost. Screenshots: `T1-step6-desc-cut-iphone.png`
- **T1 step 6** (iPhone 18 Pro portrait): The trailing empty "Line 2" can't be removed: Remove line does nothing (line comes back).
- **T22 step 1-3** (iPhone 18 Pro portrait): Typing a line description adds an empty "Line 2" at once; reopening a saved draft shows that empty Line 2 again, pushing Tags/pickers down.

## G06 — Accrual panel suggests 2950 Accrued interest instead of 2960 Accrued expenses

Severity: **data** · Repo: **app**

Root cause: AccrualDialogState picks the first active account of the ACCRUAL subtype in chart order, which is 2950 Påløpt rente; Accrued income and Deferred income get no suggestion at all.

Suggested fix: Map each kind to a specific account (or a per-account usage flag) instead of the first account of the subtype; suggest 2960 for Accrued expense.

- **A1 step 5** (iPhone 18 Pro portrait): Balance account suggested as "2950 Påløpt rente" with hint "Suggested for this kind; you can change it." Had to change it to 2960 by hand. Screenshots: `A1-step5-balance-2950-iphone.png`
- **A4 step 1** (iPhone 18 Pro portrait): Same on all three accruals: suggested 2950 changed to 2960 each time.
- **A14 step 6** (iPad mini landscape): Bjørn's accrual: Balance account suggested 2950 again.
- **A18 step item 6** (iPhone 18 Pro portrait): Accrued expense → 2950 Påløpt rente; Accrued income → empty ("Select…"); Prepaid expense → 1700 Forskuddsbetalt leiekostnad; Deferred income → empty.

## G07 — Recurring journals write Norwegian text into English screens

Severity: **data** · Repo: **backend**

Root cause: RecurringOccurrences fills {period} and the writer name using the company's ledger language (LedgerText.Language.NB → "Gjentakende bilag: {name}", "nov. 2026"), while the app is English and the editor's Dates list says "Nov 2026".

Suggested fix: Decide which language document text uses. Make the preview, the Dates list and the created journals agree, and show the creator as "Created by recurring journal {name}" in the app language rather than a stored Norwegian string.

- **A5 step 11-12** (iPhone 18 Pro portrait): Created journal memo "Office rent nov. 2026, Oslo HQ", document reference "Lease A4T-OSL nov. 2026", created_by_name "Gjentakende bilag: A4T Rent Oslo"; preview then reads "Office rent des. 2026". Screenshots: `A5-step11-detail-nov-iphone.png`
- **A7 step 3** (iPhone 18 Pro portrait): JV-DRAFT-000030/31 memos "Old fee mar. 2026" / "Old fee apr. 2026", created_by_name "Gjentakende bilag: A4T Old fee".
- **A9 step 1, 4** (iPhone 18 Pro portrait; iPad mini portrait): Written by / Submitted / timeline read "Gjentakende bilag: A4T Rent Oslo"; spec says "Created by recurring journal A4T Rent Oslo". Screenshots: `A9-step2-recurring-norwegian-iphone.png`, `A9-step4-timeline-iphone.png`
- **A14 step 2, 4** (iPad mini portrait; iPad Pro 13 portrait): Timeline "Written/Submitted by Gjentakende bilag: A4T Bjorn Rent". Screenshots: `A14-step4-posted-ipadpro13.png`

## G08 — Override count is wrong, and switching a feature off and on leaves an explicit ON row

Severity: **data** · Repo: **unclear**

Root cause: The Modules stats count module overrides but miss the branch override (known T8-1, still open); a feature switched off and back on is stored as an explicit company ON instead of returning to INHERIT, and the screen doesn't count it.

Suggested fix: Compute "Overrides in force" from the same data as the matrix; offer "Same as agreement" (back to INHERIT) when switching on, and confirm an explicit ON doesn't keep a feature the agreement later drops.

- **T8 step 1** (iPad Pro 13 landscape): Kystgruppe shows "2 Overrides in force · 2 modules · 0 features" while the matrix shows one branch override (Bergen · Finance "Set for this branch") and HRMS has none.
- **T11 step 1** (iPad A16 portrait): Switching Refunds back on stores an explicit ON row; stats still "2 Overrides in force · 2 modules · 0 features".
- **A17 step 1** (iPad A16 portrait): RECURRING_JOURNALS and JOURNAL_CSV_IMPORT now explicit company ON (was INHERIT); no "same as agreement" choice. Screenshots: `A17-step1-both-on-ipada16.png`

## G09 — Platform Overview says Kystgruppe's books start is "Not planned" although it is live

Severity: **data** · Repo: **unclear**

Root cause: The platform Overview reads a go-live field that is not set for seeded live companies (or reads the wrong source).

Suggested fix: Show the Accounts setup's go-live state/date; check the seed sets it for Kystgruppe.

- **T9 step 1** (iPad A16 portrait): Overview: "Books start in NeoERP: Not planned — chosen at go-live" for Kystgruppe, which has posted journals since Jan 2026.

## G10 — Opening items can't be created at a company that requires a branch on lines

Severity: **flow-blocker** · Repo: **both**

Root cause: The go-live opening-items wizard (Receivables/Payables hand-off) has no Branch field and the file has no branch column; Lahore requires a branch tag on lines, so the backend refuses with "A line tag is missing or invalid". Very likely the unexplained old T16 hand-off error.

Suggested fix: Add a Branch (default) field to the opening-items wizard and/or a branch column in the file, pass it to the backend; or let the backend use the company's default branch.

- **T16 step 3** (iPad Air 11 portrait): "Create 2 balances" → amber "That didn't work. Nothing was changed."; server log AccountsRefusal: "A line tag is missing or invalid". Steps 4-5 blocked. Screenshots: `T16-step3-ipadair.png`

## G11 — Stockholm has no branches in the app: SIE default branch picker empty, journal has no Default branch

Severity: **flow-blocker** · Repo: **unclear**

Root cause: The app's Org data for Stockholm has no branches (company menu shows only "Stockholm Handel · All branches") although neoerp_org.branches has an ACTIVE branch STO. The SIE footer reads branches from orgDimensions → OrganizationRepository.loadOverview(); unclear whether the API omits them or the app drops them.

Suggested fix: Trace /api/org/companies for Stockholm: make it return STO, or fix the app mapping; then the SIE Accounts step and the journal header get the branch.

- **T18 step 5** (iPad Air 13 portrait, iPad Air 13 landscape, iPhone 17 portrait): Default branch ("Choose a branch") doesn't open; "Choose a default branch to continue." stays and Next stays off. Steps 6-7 blocked. Screenshots: `T18-step5-branch-ipadair13.png`, `T18-step5-landscape-ipadair13.png`
- **T24 step 2** (iPad Air 13 portrait): Journal header has no Default branch field at Stockholm; lines can't be given branch STO.

## G12 — iPad journal grid: line pickers don't open by touch

Severity: **flow-blocker** · Repo: **app**

Root cause: The desktop-style journal grid's dropdown cells (Account, Branch, Cost centre) take focus on tap but don't open their list on touch; they rely on typing or keyboard. Lists that do open are misplaced.

Suggested fix: Open the cell's picker on tap (touch) with a search field, anchored to the cell and above the keyboard; or use the card layout on touch devices.

- **T6 step 6** (iPad mini portrait/iPad mini landscape; iPad Pro 13 landscape): Account/Cost centre cells take focus but no list opens on iPad mini; on iPad Pro 13 the Account list opened once without search, typing "6800" closed it. A journal can't be written on an iPad. Screenshots: `T6-step6-account-picker-noopen-ipadmini.png`, `T6-step6-new-journal-ipadmini.png`
- **T21 step iPad check** (iPad mini portrait): Confirmed: tapping the Account cell of line 1 focuses it but no list opens (all journal tests then done on the iPhone).
- **A14 step 1** (iPad mini portrait): Recurring editor grid: the account list opened only when typing (first character only, "6300" filtered on "6").
- **T24 step 2** (iPad Air 13 portrait): Account picker list opens about 40 pt below its cell (gap between "5010" field and "5010 Lokalhyra") with the keyboard up.

## G13 — Draft-mode recurring journal with blank amounts can't be saved

Severity: **flow-blocker** · Repo: **both**

Root cause: App and backend contracts disagree: RecurringMapper.toBody sends a blank-amount DRAFT line without a side; RecurringBodies.line requires side on every line (C-14) → 400 "Invalid request fields".

Suggested fix: Agree the contract (C-14 says every line has an account and a side): have the app send the side for blank-amount lines, add a contract test.

- **A6 step 4** (iPhone 18 Pro portrait): Line 2 2960 with blank amount, Save → red banner only "Check the fields and try again."; server AccountsRefusal "Invalid request fields". Draft mode's main purpose doesn't work. Screenshots: `A6-step4-save-refused-iphone.png`

## G14 — iPad mini portrait: sticky footer buttons don't respond to taps

Severity: **flow-blocker** · Repo: **app**

Root cause: In the mobile band (744 pt portrait) some sticky-footer buttons get no tap (likely an overlapping layer or hit area); rotating to landscape makes them work.

Suggested fix: Find the layer over the footer in the mobile band (e.g. the auto-added grid line or a scrim) and fix hit testing; add a size test that taps the footer buttons at 744 pt.

- **A14 step 1** (iPad mini portrait): Save on the new recurring journal did nothing (6 taps over 2 min, no request reached the gateway, no message); in landscape one tap saved.
- **A13 step 2** (iPad mini portrait): "Earlier imports" in the Import journals sticky footer didn't respond (3 taps); after rotating to landscape one tap opened it.

## G15 — Pages, counts and pick lists don't refresh after someone else acts

Severity: **flow** · Repo: **app**

Root cause: Screens keep their first load: no refresh on resume/focus or after another person's change; cached reference lists (projects) are reused; list counts don't update after the app's own navigation.

Suggested fix: Refresh detail/list and badge counts on resume/focus (or show "This changed — reload"); invalidate cached dimension lists when opening an editor.

- **layout-pass-T4-T8 step 3** (iPad Pro 11 landscape; iPhone 18 Pro portrait): Omar's refund page still "Waiting for approval" 26 min after Hina posted RFD-2026-27-000001; Anna's WO-DRAFT-000024 still "Waiting for approval" after Bjørn approved. Screenshots: `LP-tablet-stale-refund-ipadpro11.png`
- **T4 step 7** (iPhone 18 Pro Max portrait): Hina's sidebar shows Receipts 1 while two receipts wait for her.
- **T21 step 4** (iPad mini portrait): Bjørn's Journals list didn't show the new "Waiting to post" journal until he searched.
- **T24 step 2** (iPad Air 13 portrait): A project created by Sara isn't offered on Erik's new journal: no projects request, no Project column until the iPad was rotated. Screenshots: `T24-step2-noproject-ipadair13.png`
- **A10 step 10** (iPhone 18 Pro portrait): After Open in Drafts the chip read "Drafts 4" while there were 7, and imported drafts listed although Origin was "Entered in Accounts" only.

## G16 — Feature off/on: late pick-up, discarded input, wrong breadcrumb, missing notices

Severity: **flow** · Repo: **both**

Root cause: Entitlement changes reach the app only on return to the front (and on a throttle when switching on); open forms are dropped silently; the history page and breadcrumb don't know the feature-off state; read endpoints stay open while off.

Suggested fix: Re-check entitlements on focus without throttle for ON; tell the user when a form is closed by a switch; route the "Import journals" crumb to the feature-off spot; show the off notice on Earlier imports; keep header/breadcrumb on the off page; confirm whether reads should be refused.

- **T10 step 3** (iPad Pro 13 portrait): Half-filled "Record refund received" panel thrown away with no message when the page turned into the off page.
- **T10 step 3** (iPad Pro 13 portrait): While off on the server, the open panel still loaded the supplier's open credit (Pays back list); only writes are refused.
- **T10 step 4/6** (iPad Pro 13 portrait; iPad mini portrait): The off page drops the page header and breadcrumb; no menu item highlighted. Screenshots: `T10-step4-owner-offpage-ipadpro13.png`, `T10-step6-offpage-ipadmini.png`
- **A16 step 4** (iPhone 18 Pro portrait): With Journal import off, the breadcrumb "Import journals" on Earlier imports opens Recurring journals, not "Import journals isn't part of your plan right now." Screenshots: `A16-step4-crumb-opens-recurring-iphone.png`
- **A16 step 3** (iPhone 18 Pro portrait): Earlier imports gives no hint that importing is off. Screenshots: `A16-step3-download-share-iphone.png`
- **A17 step 2** (iPhone 18 Pro portrait): Switch back ON reached the app only on the second return to the front (~1 min); OFF was picked up on the first. Screenshots: `A17-step2-menu-on-iphone.png`
- **A15 step 3** (iPhone 18 Pro portrait): 1 minute after the switch the open app still offered New accrual or prepayment (picked up after Home → reopen; not re-reported). Screenshots: `A15-step3-menu-before-refocus-iphone.png`, `A15-step3-menu-off-iphone.png`

## G17 — Amount and date fields: letter keyboard, stuck keyboard, no formatting

Severity: **flow** · Repo: **app**

Root cause: Amount/date text fields use the default keyboard type, accept letters, don't format on blur, and on phone date filters the keyboard can't be dismissed.

Suggested fix: Use decimal/number keyboard types with a Done accessory, filter non-numeric input, format on blur, select-all-replace on focus; fix the date filter's focus so the keyboard dismisses.

- **T4 step 7** (iPhone 18 Pro Max portrait): Receipts "To" date field opens the letter keyboard and it can't be dismissed (✓, Return, tap outside all fail); list hidden until leaving the page. Screenshots: `T4-step7-date-keyboard-stuck-iphonemax.png`
- **layout-pass-T4-T8 step 5** (iPhone 18 Pro portrait): Date filter fields open the full letter keyboard that can't be dismissed (same as T4).
- **T1 step 2-3** (iPhone 18 Pro portrait): Amount fields open the letter keyboard; Amount shows "2500,00" (no thousands space) after typing.
- **T2 step 4** (iPhone 18 Pro portrait): Select-all + type didn't replace "4000,00"; had to delete characters one by one; field shows "4000,00" without the space while focused.
- **T4 step 5** (iPad Pro 11 portrait): Typed amounts stay unformatted ("44840.00", "2360.00") while computed ones are grouped ("47,200.00"). Screenshots: `T4-step5-ipadpro11.png`
- **T3 step 2** (iPhone 18 Pro portrait): The write-off Amount field accepts letters (ended as "1500,00CASE-DEMO-7").
- **T21 step 4** (iPhone 18 Pro portrait): Document date has no date keyboard (took "19112026"); not counted again.

## G18 — Refusals are generic or shown out of view

Severity: **flow** · Repo: **app**

Root cause: Server refusals are mapped to a generic banner at the top of the page; specific reasons (missing tag, invalid field, duplicate name, discarded) are not shown next to the action or the field, and some states have no next action.

Suggested fix: Show the refusal next to Save/the field and scroll to it; map known refusal codes to specific words; give a next action (Upload again / Earlier imports) after a discarded check.

- **A6 step 4** (iPhone 18 Pro portrait): "Check the fields and try again." at the top only, no field marked, while the user is at Save. Screenshots: `A6-step4-save-refused-iphone.png`
- **A8 step 1** (iPhone 18 Pro portrait): "Another recurring journal is called A4T Rent Oslo." appears only at the top; tapping Save at the bottom shows no reaction.
- **T16 step 3** (iPad Air 11 portrait): "That didn't work. Nothing was changed." although the server sent "A line tag is missing or invalid". Screenshots: `T16-step3-ipadair.png`
- **A13 step 4** (iPhone 18 Pro portrait): After someone else discarded the check, the page shows "This check was discarded. Nothing was created." and an empty card with no next action.
- **A18 step item 23** (—): Builder decision 23 → change: put the words next to Save / the field.

## G19 — Opening-balance import wizard: hand-off and history gaps

Severity: **flow** · Repo: **both**

Root cause: The OB import and its hand-off don't keep state across steps (fix requires re-upload), discarded/failed imports keep actions or rows, status labels lag the real step, and the journal has no link back.

Suggested fix: Keep the handed-off file when going back to Upload (make the stepper tappable); hide the hand-off on discarded imports; detect format before storing, or don't list format refusals; show the real step and resume there; link the journal's Source to the import; decide on creating missing accounts.

- **T16 step 2** (iPad Air 11 portrait): Row says "Tick Create missing customers, or fix the name." but Check only offers Upload a fixed file, which drops the handed-off file; stepper "Upload" not tappable. Screenshots: `T16-step2-ipadair.png`, `T16-step2b-ipadair.png`
- **T17 step 3** (iPad Air 11 portrait): Discarded lahore-tb.xlsx import still shows "Held out" with Enter as opening items for 200,000.00 and 150,000.00. Screenshots: `T17-step3-discarded-heldout-ipadair.png`
- **T17 step 1, 4, 5** (iPad Air 11 portrait): Every refused wrong-format file is still stored and listed: "CSV lahore-tb.xlsx · Could not read the file"; FAILED rows for PDF and .xls. Screenshots: `T17-imported-files-ipadair.png`
- **T18 step 5** (iPhone 17 portrait): Imported files shows "Ready to check" for an import past Check; Continue reopens at "Step 2 of 4 · Check". Screenshots: `T18-imported-files-iphone17.png`
- **T15 step 3** (iPad Air 11 portrait): Journal Source "From CSV file lahore-tb.csv · 19 Nov 2026" is not a link back to the import.
- **T14 step 5** (iPad Air 11 portrait): "Create account 1925 Meezan savings account" is not offered at all; no way to add the missing account from here.

## G20 — Journal import: no way back from a journal or the menu to its import; own check doesn't resume

Severity: **flow** · Repo: **app**

Root cause: Imported journals don't show their source line; the New journal ▾ menu has a Journal imports entry only while the feature is off; Import journals always opens a fresh Upload.

Suggested fix: Show "Imported from {file} by {person}, key {key}" linking to the import; keep a Journal imports entry when on; resume the person's own PREVIEWED check; show who discarded a row.

- **A10 step 12** (iPhone 18 Pro portrait): JV-DRAFT-000039 has no "Imported from kystgruppe-a4t-good.csv by Anna Lindh, key ACC-A4T-01" line; no link back.
- **A10 step 14** (iPhone 18 Pro portrait): New journal ▾ has no Journal imports; "Imported files" lists opening balances only and says "No files imported yet".
- **A13 step 7** (iPhone 18 Pro portrait): Import journals opens on Step 1 · Upload, not Anna's unfinished check (DB PREVIEWED). Screenshots: `A13-step7-no-resume-iphone.png`
- **A13 step 9** (iPad landscape / phone): History "By" shows the uploader even when someone else discarded it; Created rows have no link to their journals.
- **A18 step item 30** (—): Builder decision 30 → change: keep a Journal imports entry when on too.

## G21 — Automatic reversal: Period close doesn't name it, cancel isn't in the timeline

Severity: **flow** · Repo: **both**

Root cause: Period close has no text for the new pending-reversal check code (falls back to the generic message); cancelling an automatic reversal writes no journal event.

Suggested fix: Add the "Automatic reversals not posted" check text with the journal and Reverse now; record the cancel (who, reason) as a journal event shown in What happened.

- **A1 step 11** (iPad mini portrait): Dec 2026 panel shows "A check needs your attention before closing." twice; no "Automatic reversals not posted", no journal, no Reverse now. Screenshots: `A1-step11-dec-checklist-ipadmini.png`
- **A4 step 4** (iPad mini portrait): Can't see which journals Period close lists (only the generic message).
- **A4 step 3** (iPad mini portrait): Cancel automatic reversal leaves no entry in "What happened" ("Oldest first. Kept in the audit log.").
- **A15 step 8** (iPad mini portrait): Cancel while off also not in the timeline (known A4). Screenshots: `A15-step8-cancelled-ipadmini.png`

## G22 — Journals search ignores the document reference

Severity: **flow** · Repo: **backend**

Root cause: JournalJdbcAdapter's text search covers number_display, draft_ref and memo only, not voucher_ref, although the placeholder says "Number, draft, document or memo".

Suggested fix: Add voucher_ref (document reference) to the search clause.

- **A4 step 7** (iPhone 18 Pro portrait): Search "EST-A4T-3" → "No posted journals match"; "JV-2026-000003" finds it.

## G23 — Recurring journals editor and list behaviour

Severity: **flow** · Repo: **app**

Root cause: Gaps against the decided behaviour: no Next preview while creating, Insert leaves the cursor before the token, ended journals drop out silently, list opens pre-filtered, breadcrumb misses the recurring journal.

Suggested fix: Show "Next: …" while creating; put the cursor after the token; show an Ended notice and keep it findable; don't preselect Needs you (or say the list is filtered); include Recurring journals / {name} in the breadcrumb.

- **A5 step 3/5** (iPhone 18 Pro portrait): No "Next: …" preview under the field while creating; Insert places {period} with the cursor before it.
- **A6 step 2** (iPhone 18 Pro portrait): Cursor lands before the inserted token again. Screenshots: `A6-step2-dates-iphone.png`
- **A7 step 3** (iPhone 18 Pro portrait): A4T Old fee ended by itself ("schedule finished") and dropped out of the default list with no message.
- **A15 step 9** (iPhone 18 Pro portrait): Recurring journals list opens with "Needs you · 1" preselected, hiding the others without saying it is filtered. Screenshots: `A15-step9-skipped-run-actions-iphone.png`
- **A9 step 6** (iPhone 18 Pro portrait): Journal opened from a recurring journal's Dates row: breadcrumb "… / Journals / JV-DRAFT-000032", not via Recurring journals / A4T Rent Oslo.
- **A18 step items 11, 12** (—): Builder decisions 11 and 12 → change (cursor after token; Next preview while creating).

## G24 — Reports: filters dropped between tabs; GL has no dimension column

Severity: **flow** · Repo: **app**

Root cause: Each report tab keeps its own filter state (drill keeps it, tab switch doesn't); the GL table has no column for the filtered dimension.

Suggested fix: Share dimension filters across report tabs; add a Cost centre/Project column to the GL when filtered (or always).

- **T7 step 6** (iPad Pro 13 landscape): General ledger has no Cost centre column (Date, Number, Description, Debit, Credit, Balance only). Screenshots: `T7-step6-gl-ipadpro13.png`
- **T7 step 5-6** (iPad Pro 13 landscape): Cost-centre filter dropped when switching P&L → TB → GL; TB first shows an empty area ~5 s.
- **T23 step 2** (iPad mini portrait): Project = P-100 set on TB; P&L tab opened with "All (Project)" again. Screenshots: `T23-step2-pl-project-ipadmini.png`

## G25 — Company switch on a report page shows "We couldn't find this"

Severity: **flow** · Repo: **app**

Root cause: After a company switch the current route keeps the old company's report id/state and resolves to not-found.

Suggested fix: On company switch, navigate to the same area's list/report for the new company (or the dashboard).

- **T4 step 0** (iPad Pro 11 portrait): Switching Lahore Textiles → Sialkot Mills on Reports → Trial balance shows "We couldn't find this / It may have been deleted, or the link is wrong. / Back to list". Screenshots: `T4-step1-switch-notfound-ipadpro11.png`

## G26 — Pickers on touch: two taps, list under the keyboard, picker stays open

Severity: **flow** · Repo: **app**

Root cause: Form/report dropdowns auto-focus a search field so the keyboard covers the list; the first tap only outlines the field; a picker doesn't close after choosing, so typing goes into its search (with a quick-add row).

Suggested fix: Open on first tap; place the list above the keyboard (or don't auto-focus search on touch); close the picker on selection and move focus on.

- **T7 step 2/5/6** (iPad Pro 13 landscape): Every report filter needs two taps, then the list opens under the keyboard; Return doesn't pick the single match. Screenshots: `T7-step2-filter-list-under-keyboard-ipadpro13.png`
- **T4 step 4** (iPad Pro 11 portrait): Customer picker stayed open after choosing; typing "44840.00" went into its search: "Nothing matches "4"." with an Add "4" row (one tap creates a junk customer).
- **T6 step 1** (iPad mini portrait): Income account picker near the sticky footer focuses but shows no list until the line is scrolled higher.
- **T23 step 3** (iPad mini portrait): Project picker opens with the letter keyboard over half the screen (list above it, works here; not counted again).

## G27 — Editors behave differently on Cancel and Tags

Severity: **flow** · Repo: **app**

Root cause: Invoice/bill editors don't use the journal editor's dirty-check on Cancel; Tags visibility rules differ between invoice and bill lines.

Suggested fix: One rule for all editors: ask "Leave without saving?" when dirty; show Tags the same way on invoice and bill lines.

- **T6 step 1/2** (iPad mini portrait): Cancel on New invoice / New bill with a typed line leaves at once; New journal asks "Leave without saving? Your changes to this draft are lost."
- **T22 step 1-3** (iPhone 18 Pro portrait): Tags hidden until an account is chosen on the invoice line, but shown at once with "Default expense account" on the bill line.

## G28 — Side menu opens under a panel; taps go through to rows behind

Severity: **flow** · Repo: **app**

Root cause: The navigation drawer is drawn below the open month panel (z-order), so taps reach the page behind it.

Suggested fix: Draw the drawer above panels (or close the panel first); block taps to the content behind an open drawer.

- **A1 step 11** (iPad mini portrait): With the month panel open, the menu opened under it; the tap on "Reports" opened Apr 2026, which has an enabled "Close Apr 2026". A wrong tap could close a month.

## G29 — Dimensions: new values valid from today; viewer sheet too thin; no quick add

Severity: **flow** · Repo: **app**

Root cause: New project/cost centre/value forms default Valid from to today; the read-only sheet shows only Status/Valid/Used; cost-centre pickers have no quick add (possibly by design: setup data is link-only).

Suggested fix: Default Valid from to the start of the open period or leave it empty; show code, name, Part of and Group only in the viewer sheet; confirm whether cost centres get quick add (update the script if not).

- **T19 step 2-4** (iPad Pro 13 portrait): New projects and cost centres default "Valid from" to today (19.11.2026); journals dated earlier in Nov 2026 can't use them.
- **T20 step 2** (iPad Pro 13 landscape): Vessel values FJORD/KYST also "From 19 Nov 2026".
- **T19 step 6** (iPhone 18 Pro portrait): Anna's read-only sheet shows only Status / Valid / Used on lines: no code, name, Part of or Group only.
- **A1 step 6** (iPhone 18 Pro portrait): Accrual Cost centre picker: "Nothing matches "zzq"." with no Add "zzq" (script expects quick add). Screenshots: `A1-step6-costcentre-noadd-iphone.png`

## G30 — Slow loads: blank pages and long skeletons

Severity: **flow** · Repo: **unclear**

Root cause: Journal/editor/report loads take 4-8 s on the simulators; some pages show a blank card instead of a skeleton. Unclear whether backend latency or app sequential loads.

Suggested fix: Measure the requests behind the journal editor/detail and TB; load in parallel; always show a skeleton.

- **T15 step 3** (iPad Air 11 portrait): Journal detail blank (empty white page, empty card) ~4 s before data shows.
- **T21 step 2** (iPhone 18 Pro portrait): New journal and saved draft show a skeleton 5-8 s.
- **T22 step 1-3** (iPhone 18 Pro portrait): Every editor open shows a skeleton 5-8 s (not counted again).
- **T12 step 1** (iPad Air 11 portrait): Accounts Overview first load showed a skeleton ~6 s.
- **A9 step 5** (iPhone 18 Pro portrait): Recurring journal detail ~5 s of skeleton.

## G31 — Typed characters or taps lost right after a panel or field opens

Severity: **flow** · Repo: **unclear**

Root cause: Input arrives before the panel's layout/focus settles (~0.5-1.5 s) and is dropped. May partly be the simulator's fast typing, but seen in many forms.

Suggested fix: Check focus handling when sheets/panels open (don't recompose the focused field); try on a real device before deciding.

- **T2 step 3** (iPhone 18 Pro portrait): First tap on Supplier after the panel opened landed on nothing; typed text lost.
- **T19 step 2** (iPad Pro 13 portrait): "P-100" arrived as "P" when typed within ~0.5 s of tapping the field.
- **T20 step 1/4** (iPad Pro 13 landscape): Name "Test slot" arrived as "Test s"; File column "VESSEL" as "VE".
- **A14 step 6** (iPad mini landscape): Memo: only "Accrued ac" of 27 typed characters stayed.
- **A6 step 6** (iPhone 18 Pro portrait): Typed " Q" in Name was gone after editing a line amount further down (once).
- **A8 step 8** (iPhone 18 Pro portrait): Status sheet: first taps after it opened were ignored.

## G32 — Sticky footer and keyboard cover the fields being edited

Severity: **layout** · Repo: **app**

Root cause: Panels and editors keep a tall sticky footer (summary + buttons) above the keyboard; on phones and with the keyboard up on iPads it covers the focused field, picker lists and grids.

Suggested fix: Collapse the footer to the action row while the keyboard is up (or hide it), scroll the focused field into view, and cap the footer height on phones.

- **T1 step 2-3** (iPhone 18 Pro portrait): Pay in advance: footer (~230 pt) stays above the keyboard and hides the Amount field being typed. Screenshots: `T1-step2-keyboard-iphone.png`
- **T14 step 5** (iPad Air 11 portrait): Account picker: the keyboard pushes the footer over the result list; only one result row visible. Screenshots: `T14-step5-picker-keyboard-ipadair.png`
- **T6 step 6** (iPad Pro 13 landscape; iPad mini landscape): Footer + keyboard cover the whole journal Lines grid; the line being typed is not visible. Screenshots: `T6-step6-keyboard-hides-grid-ipadpro13.png`
- **T18 step 1** (iPhone 17 portrait): Review and go live footer takes ~40% of the iPhone screen. Screenshots: `T18-step1-footer-iphone17.png`
- **T18 step layout** (iPad Air 13 landscape): Before scrolling, the footer covers the "Put the difference on" chips (minor).
- **T24 step 3** (iPhone 17 portrait): Journal editor footer takes ~35% of the screen; only one field of the line card shows. Screenshots: `T24-footer-iphone17.png`
- **layout-pass-A1-A9 step 3** (iPhone 18 Pro portrait): Recurring editor's Insert menu opens over the sticky footer; in the accrual sheet the footer hides Balance account until you scroll.

## G33 — Layout shifts under the finger: taps land in the wrong field

Severity: **layout** · Repo: **app**

Root cause: Content above the touch target changes height after an action (error line, caption, collapsing section, re-read) and the page moves, so the next tap or typed text lands elsewhere.

Suggested fix: Reserve space for captions/error lines, keep scroll position on re-read and collapse, avoid scrolling to top.

- **T1 step 6-7** (iPhone 18 Pro portrait): Tapping Deduct made the page jump ~50 pt so the first tap missed; "Advance Prepayment to Fjord Energi" cut without an ellipsis.
- **T3 step 2/7** (iPhone 18 Pro portrait; iPad mini portrait): Write-off sheet moves when the red error or keyboard appears: Amount became "1500,00CASE-DEMO-7", later "100,00,00" and Why "Own approval testval". Screenshots: `T3-step2-over-iphone.png`
- **T21 step 1-2** (iPhone 18 Pro portrait): Journal line card grows after picking an account ("Bank account" caption); "2500" landed in Description.
- **A14 step 1** (iPad mini portrait): Same on the iPad mini grid: after picking 1920 the row grew and the tap for Credit landed in Account.
- **T12 step 2** (iPad Air 11 portrait): After Mark as reviewed on Tax codes the page scrolled up ~40 pt; next tap landed on empty space.
- **T14 step 2-3** (iPad Air 11 portrait): Every change on the Check step re-reads the file and scrolls to the top.

## G34 — Wide tables and grids cut off with no scroll hint

Severity: **layout** · Repo: **app**

Root cause: Tables/matrices are wider than their card at 744-1032 pt and scroll sideways without a hint, or clip cell content (tags, words).

Suggested fix: Signal horizontal scroll (fade/shadow), let columns wrap or drop to cards below the breakpoint, don't clip tags; add the missing Creates/Last columns.

- **T8 step 5** (iPad Air 11 portrait): Modules branch matrix wider than the card; Rawalpindi column cut ("Raw / RWP", switch half shown, "Set f…", "Us…"). Screenshots: `T8-step5-modules-matrix-ipadair.png`
- **T9 step 1** (iPad A16 portrait): Platform Modules matrix: Tromsø column cut ("Tror / TRO").
- **T6 step 6** (iPad Pro 13 landscape): Even at 1376 pt the journal grid shows only up to Cost centre ("Default · No cost c…"); Project and Sales channel need an unsignalled sideways scroll.
- **T24 step 2-3** (iPad Air 13 portrait): At 1032 pt the journal grid scrolls sideways to Cost centre and Project. Screenshots: `T24-step2-landscape-ipadair13.png`
- **layout-pass-A1-A9 step 1** (iPad Pro 13 portrait): Journals list Type-column tags clipped: "Reverses 1 Jan" (2027 missing), "Reversal" for "Reversal cancelled". Screenshots: `LP-A-journals-portrait-ipadpro13.png`
- **layout-pass-A1-A9 step 2** (iPad Pro 13 portrait/iPad Pro 13 landscape): Recurring journals table has no "Creates" and no "Last" columns (phone cards have them).
- **T16 step journals list** (iPad Air 11 portrait): Type column wraps "Opening" as "Openin / g". Screenshots: `T16-journals-type-wrap-ipadair.png`
- **T6 step 4** (iPad mini portrait): Journal detail: Source cut "Receivables · Sales invoice INV-2026-000001 · requested by An…" with no way to read the rest; "…" More actions alone on its own row. Screenshots: `T6-step4-journal-head-ipadmini.png`

## G35 — Phone/mobile lists: filters fill the first screen, cards inconsistent

Severity: **layout** · Repo: **app**

Root cause: Lists and reports stack every filter above the content on phones; card layouts differ between lists (labels repeated, caps, missing rows, cards vs table at the same width).

Suggested fix: Put filters in a Filters sheet on phones; P&L as two-column rows; one card style (label case, Status row) across lists; same layout choice for all filters at one width.

- **T1 step 4** (iPhone 18 Pro portrait): Payments filters take the whole first screen; first payment below the fold. Screenshots: `T1-step4-iphone.png`
- **layout-pass-T4-T8 step 1** (iPhone 18 Pro portrait): Reports tabs scroll sideways, last visible tab cut ("Pro…"), stacked filters fill more than the first screen. Screenshots: `LP-phone-reports-iphone.png`
- **layout-pass-T4-T8 step 2** (iPhone 18 Pro portrait): P&L rows render as cards that each repeat the label "Amount".
- **T18 step 8** (iPhone 17 portrait): Imported files: search field squeezed to ~10 pt next to the two "None" drop-downs. Screenshots: `T18-imported-files-iphone17.png`
- **T4 step 5** (iPad Pro 11 portrait): Receipts filtered on Waiting for approval show cards without the Status row.
- **T9 step 7** (iPad mini portrait): Invoices list switches to a table at 744 pt when Type = "Write-offs"; other filters show cards.
- **T6 step journals list** (iPad Pro 13 landscape; iPad mini portrait): Type column mixes words and codes ("WO", "RF" next to "Purchase bill"); iPad mini cards label fields in capitals ("DATE", "DOCUMENT", "MEMO", "TOTAL (NOK)", "STATUS"). Screenshots: `T6-journals-type-codes-ipadpro13.png`, `T6-journals-list-caps-ipadmini.png`

## G36 — Period close on iPad mini portrait: title one letter per line, empty Status column

Severity: **layout** · Repo: **app**

Root cause: The Period close header is laid out in a zero-width column in the mobile band; the Status column has no content there.

Suggested fix: Fix the header's width constraint at 744 pt and fill the Status column (or drop it to the card layout).

- **A1 step 11** (iPad mini portrait): "Period close · FY2026 / Close a month when its journals are done…" renders one character per line down the first screen; Status column empty. Screenshots: `A1-step11-periodclose-vertical-ipadmini.png`

## G37 — App ignores iOS Larger Text

Severity: **layout** · Repo: **app**

Root cause: Text sizes don't follow iOS Dynamic Type (at least without a relaunch).

Suggested fix: Scale typography tokens with the platform font scale; retest after a relaunch.

- **layout-pass-T4-T8 step 4** (iPhone 18 Pro portrait): With Accessibility Medium the running app kept the same text size on P&L and the menu. Screenshots: `LP-larger-text-ignored-iphone.png`

## G38 — Page heads: card order, stray captions, links not styled, duplicate back links

Severity: **layout** · Repo: **app**

Root cause: Small head-area issues across detail pages and wizards.

Suggested fix: Head (number, status) first, action cards below and only for approvers; remove the stray caption; style links; one back link.

- **T5 step 1** (iPad Pro 11 portrait; iPhone 18 Pro Max portrait): "Before you approve" card sits above the document head and is shown to Omar, who can't approve.
- **T7 step 6** (iPad Pro 13 landscape): General ledger shows a stray caption "Year to date" above Fiscal year.
- **A9 step 4** (iPhone 18 Pro portrait): The recurring journal name in the Source line is a working link but looks like plain text. Screenshots: `A9-step4-timeline-iphone.png`
- **T18 step 3-5** (iPad Air 13 portrait): Wizard shows two back links stacked ("← Back" and "← Back to import history"). Screenshots: `T18-step3-ipadair13.png`

## G39 — One feature, several names; off notice says "your company"

Severity: **wording** · Repo: **both**

Root cause: The platform feature catalogue (backend) and the Accounts screens (app strings) name features differently.

Suggested fix: Pick one name per feature and use it on the platform, notices and off pages; use the company name in the off notice.

- **T9 step 8** (iPad mini portrait): "Refunds and advances are off for your company" (spec: "…off for Kystgruppe Nordic"); switch is named "Refunds, advances and write-offs". Screenshots: `T9-step8-writeoff-off-ipadmini.png`
- **T10 step 4/6** (iPad Pro 13 portrait): Off page says "Refunds and advances"; switch "Refunds, advances and write-offs".
- **A15 step 2** (iPad A16 portrait): "Recurring journals and accruals" (platform) vs "Recurring journals isn't part of your plan right now" vs "Reverse automatically isn't part of your plan right now." Screenshots: `A15-step2-off-ipada16.png`
- **A16 step 1** (iPad A16 portrait): "Journal CSV import" vs "Import journals" / "Journal imports" / "Journal import". Screenshots: `A16-step1-both-off-ipada16.png`

## G40 — AR/AP approval and document wording

Severity: **wording** · Repo: **app**

Root cause: Toasts, approve sheets, pills and column headers don't adapt to the case (Owner, no bank details, sender, gross vs left to pay).

Suggested fix: Owner wording in toasts; cheque/cash wording without bank details; one sender action label; consistent "Waiting for you"; hide the consequence line when the amount is invalid; correct headers and signs.

- **T4 step 2/6** (iPad Pro 11 portrait): Toast "INV-DRAFT-000011 sent for approval. Someone else approves it." contradicts the head "As Owner you may approve your own once you confirm…".
- **T5 step 4-5** (iPhone 18 Pro Max portrait): Approve sheet "…make the transfer in your bank." and toast "Make the transfer in your bank." although "No bank details on file. Record a cheque or cash refund."; same for "Send the money from your bank." Screenshots: `T5-step4-sheet-iphonemax.png`
- **T5 step 2** (iPad Pro 11 portrait): Sender sees "Send back" (approver's word); write-offs give the sender "Withdraw to draft".
- **T3 step 5** (iPad mini portrait): Bjørn's waiting write-off pill reads "Waiting for approval"; waiting payments read "Waiting for you".
- **T1 step 8** (iPad mini portrait): Bills list "Total (NOK) 10 000,00" while gross total is 12 500,00 (10 000,00 is left to pay).
- **T3 step 2** (iPhone 18 Pro portrait): With the over-open 7 000,00 the sheet still says "7 000,00 goes to bad debts. VAT of 1 365,33 is given back to you." under the red error.
- **T9 step 5** (iPad mini portrait): RCT-2026-000002 Settles header "Invoice" but the row is RFD-2026-000001. Screenshots: `T9-step5-receipt-actions-ipadmini.png`
- **T9 step 5** (iPad mini portrait): Customer panel "Advances open −9 500,00" with a minus (receipts list "9 500,00 open").

## G41 — Opening-balance import wording

Severity: **wording** · Repo: **app**

Root cause: File names, labels, hints and statuses in the OB import don't match the state or the company.

Suggested fix: Name files with the company code; label the filters; correct breadcrumb; update hint after a file is chosen; show journal numbers; format amounts; local example names; hide Difference once balanced.

- **T13 step 2** (iPad Air 11 portrait): Template saves as "opening-balances" ("opening-balances · Text Document · 7 KB"), not opening-balances-{company code}.csv.
- **T13 step 5** (iPad Air 11 portrait): Imported files: two filter drop-downs read "None" and "None" with no label. Screenshots: `T13-step5-ipadair.png`
- **T13 step all** (iPad Air 11 portrait): Breadcrumb "Companies / Lahore Textiles / Accounts / Journals / Imported files" on the "Import opening balances" wizard.
- **T13 step 3** (iPad Air 11 portrait): After a file is chosen the footer hint still says "Choose a file to continue." Screenshots: `T13-step3-ipadair.png`
- **T17 step 1, 4, 5** (iPad Air 11 portrait): Same hint after the red refusal (not counted again).
- **T15 step 4** (iPad Air 11 portrait): After posting, the import's Journals card reads "Journal 1 · Posted" instead of "OB-2026-27-000001". Screenshots: `T15-step4-import-posted-ipadair.png`
- **T16 step 2** (iPad Air 11 portrait): Balance rows unformatted ("120000.00", "80000.00") while totals read "200,000.00".
- **T16 step 1** (iPad Air 11 portrait): Hand-off file named customers-opening-items.csv; format example customer "Sjøfolk Handel AS" at a Pakistani company.
- **T18 step 5** (iPad Air 13 portrait): "Difference −1 000,00" still shown next to "Debit 100 000,00 Credit 100 000,00" after 2099 was chosen.

## G42 — Journal import check wording

Severity: **wording** · Repo: **app**

Root cause: The Check step hides the file's own value for unreadable amounts and summarises problems and totals in a confusing way; the duplicate-file warning lacks who/when.

Suggested fix: Show the file's text (italic, outlined) on the cell; explain left-out amounts in the totals; "This file was imported on {date} by {person}."

- **A11 step 4** (iPhone 18 Pro portrait): BAD-A4T-01 line card shows no Debit; only "Row 2: 1.250 could be a thousands separator; write 1250.00."
- **A11 step 2** (iPhone 18 Pro portrait): "5 problems" for 4 journals; "Debit 3 000,00 · Credit 4 150,00" (unreadable amount silently left out). Screenshots: `A11-step2-problems-iphone.png`
- **A12 step 1** (iPhone 18 Pro portrait): Warning reads only "This file was imported before." (spec: "This file was imported on {date} by {person}.") Screenshots: `A12-step1-warnings-iphone.png`

## G43 — Automatic reversal wording

Severity: **wording** · Repo: **app**

Root cause: Card and dialog texts don't distinguish pending from done and omit the consequences.

Suggested fix: "Will be reversed automatically on …" until it posts; keep the reversal-date line with the FY warning; say the automatic one is dropped in the Reverse dialog; use the reversal's date; tell the poster to Reject.

- **A18 step item 8** (iPad mini portrait): Posted card says "Reversed automatically on 1 Dec 2026." while still PENDING.
- **A2 step 3** (iPhone 18 Pro portrait): With 31.12.2026 the box shows only "FY2027 doesn't exist yet; the reversal waits until it's created."; "Reversed on 1 Jan 2027, the first day of the next year." missing.
- **A4 step 5** (iPad mini portrait): Reverse dialog doesn't say the pending automatic reversal will be dropped.
- **A4 step 5** (iPad mini portrait): "Reversed by RV-2026-000001 on 19 Nov 2026" while RV-2026-000001 is dated 30 Nov 2026.
- **A15 step 5** (iPad mini portrait): Poster's refusal "Reverse automatically isn't part of your plan right now." says nothing about what to do (suggest Reject so the writer can untick). Screenshots: `A15-step5-post-refused-ipadmini.png`

## G44 — Recurring journals wording

Severity: **wording** · Repo: **both**

Root cause: List rows, required markers, notices and dialogs in recurring journals show status words or system text instead of the useful content; the writer-block reason is generic.

Suggested fix: List row: next memo and last journal number; mark document reference required in Waiting to post; hide the reverse line when unticked; add "· n" count; human ended reason; Dismiss says what it does; specific writer-block reason.

- **A5 step 13** (iPhone 18 Pro portrait): List row second line repeats "Waiting to post" instead of the memo; Last "Waiting to post" without the journal number.
- **A5 step 4** (iPhone 18 Pro portrait): Document reference not marked required in Waiting to post; "Each journal is reversed on the first day of the next month." shows under an unticked box.
- **A5 step 1** (iPhone 18 Pro portrait): Journals button reads "Recurring journals" without the "· n" count.
- **A9 step 7** (iPhone 18 Pro portrait): Same: no "· n" count.
- **A7 step 3** (iPhone 18 Pro portrait): List row Next date "—" with "Created JV-DRAFT-000031" under it, repeating Last.
- **A8 step 7** (iPhone 18 Pro portrait): Ended reason shows the system text "schedule finished" in a quote block, lower case.
- **A18 step item 14** (iPhone 18 Pro portrait): Dismiss dialog ("Dismiss the Nov 2026 date?") has only a Reason field; doesn't say the date won't be created.
- **A14 step 3** (iPad mini portrait): Writer sees "You wrote, changed or submitted this journal, so someone else must post it." on a journal the job wrote; specific reason ("You wrote or changed the recurring journal…") missing. Screenshots: `A14-step3-no-post-ipadmini.png`

## G45 — Dates and amounts not in the Norwegian format

Severity: **wording** · Repo: **app**

Root cause: Some texts format dates as "1 Dec 2026" and amounts without the thousands space.

Suggested fix: Use the locale formatter (01.12.2026, 1 106,43) in every string, including notes and toasts.

- **A1 step 7-10** (iPhone 18 Pro portrait; iPad mini portrait): Dates read "1 Dec 2026" in toast, card, tag "Reverses 1 Dec 2026" and post dialog where 01.12.2026 is expected.
- **A2 step all** (iPhone 18 Pro portrait): "1 Dec 2026" / "1 Jan 2027" instead of 01.12.2026 / 01.01.2027.
- **T7 step 2** (iPad Pro 13 landscape): Note amount "1106,43" has no thousands separator (elsewhere "1 106,43"). Screenshots: `T7-step2-oslo-ipadpro13.png`

## G46 — Dimensions wording

Severity: **wording** · Repo: **app**

Root cause: Dimensions overview, set-up form and filter placeholders word things inconsistently.

Suggested fix: Show one row per slot or the count; pre-fill file column in upper case and stop once touched; name the slot; match the empty-card actions; intro without company dimensions when off; "All projects" style placeholders.

- **T19 step 1** (iPad Pro 13 portrait): One row "Company dimension · Not set up · Set up" instead of one row per slot.
- **T20 step 1** (iPad Pro 13 landscape): File column pre-filled from Name in mixed case ("Vessel"); typing VESSEL gave "VesselVESSEL".
- **T20 step 1** (iPad Pro 13 landscape): Set-up form and dimension page don't say which slot it takes.
- **T24 step 1** (iPhone 17 portrait / iPad): Intro "Cost centres, projects and your own company dimensions…" where company dimensions are off. Screenshots: `T24-step1-ipadair13.png`
- **T24 step 0** (iPhone 17 portrait): Cost centres offers "Add the first cost centre"; Projects offers only "Open" when empty. Screenshots: `T24-step0-iphone17.png`
- **T23 step 1-2** (iPad mini portrait): Placeholders "All branches", "All cost centres" but "All (Project)", "All (Sales channel)", "All (Vessel)". Screenshots: `T23-step1-tb-project-ipadmini.png`

## G47 — Touch-device hints and small labels

Severity: **wording** · Repo: **app**

Root cause: Desktop-only keyboard hints show on iPad; small missing words in pills and lists.

Suggested fix: Hide keyboard hints without a hardware keyboard (⌘K on Apple); show kind help in the list; "Ends in 12 days".

- **T6 step 6** (iPad mini portrait; iPad Pro 13 landscape): Lines hint "Tab moves across, Enter goes down or adds a line, ↓ opens a list, = fills the amount that balances." on touch.
- **T17 step landscape** (iPad Air 11 landscape): Search field hint "CTRL K" on an iPad.
- **A1 step 3** (iPhone 18 Pro portrait): Kind help shown only under the field after choosing, not beside each choice.
- **T9 step 1** (iPad A16 portrait): Agreement pills "Ends in 12" and "Ends in 54" lose "days".

## FIXED — Old findings confirmed fixed on iOS

- **T2 step 3-6** (iPhone 18 Pro portrait): Old T2 findings 1-5 fixed: Branch field present (old BRANCH_REQUIRED blocker), over-amount message once and Post disabled, Pays back fills itself, double tap posts once and opens the posted refund. Screenshots: `T2-step4-over-iphone.png`, `T2-step6-iphone.png`
- **T3 step 3-8** (iPhone 18 Pro portrait; iPad mini portrait): Old T3 findings 2, 4, 8, 10, 11 fixed: "Back to INV-2026-000001" link, toast wraps, no "Approved by" on a draft, no "contract event" note on Delete.
- **T4 step 2-6** (iPad Pro 11 portrait): Old T4-2/5/6/8 fixed (Open/Paid pills, "Allocated (PKR)"); T4-3 smart match works; footer names the customer; SI memo uses the final number.
- **T5 step 2** (iPad Pro 11 portrait): Old T5-1 fixed: Owner shortcut for own refund approval closed in the app.
- **T6 step 1-6** (iPad mini portrait): Old T6-1/5/6/7/9/11/13/14 fixed (Tags on default income account, Journal fact is a link, final-number memo, Sales channel tag, seeded bill accounts, back link + record bar, default branch prefilled). T6-2 not seen.
- **T7 step 2-6** (iPad Pro 13 landscape): Old T7-2/3 fixed (sign-free note, GL uses fiscal periods); TB "Lines outside this filter" row and "Balanced" wording fixed.
- **T8 step 1-5** (iPad Pro 13 landscape; iPad Air 11 portrait): Old T8-2/3/4/5/6/7/9/11 fixed; Owner sees the feature list. T8-1 still open (G08).
- **T10 step 5** (iPad Pro 13 portrait): "Owner sees no feature list" fixed: Ask Neovatus opens Modules with Finance open.
- **T16 step 1** (iPad Air 11 portrait): The earlier "Something went wrong" on Enter as opening items did not appear.
- **T21 step 3** (iPhone 18 Pro portrait): Group-only "Operations" and inactive "Old quay" no longer offered in journal pickers. Screenshots: `T21-step3-costcentre-picker-iphone.png`
- **T22 step 3** (iPhone 18 Pro portrait): Bill no longer loses its cost centres on save.
- **A18 step item 22** (—): Schedule uses the spec words (Repeats, On, Starts, Ends); the builder's note is out of date.

## SCRIPT — Test-script, seed and fixture problems

- **A1 step setup** (—): Every FY2026 month at Kystgruppe is OPEN (no locked/closed months) and FY2027 doesn't exist; the A-script assumes Jan–Mar locked. A5 step 8 shows no Locked/Closed tags; A7 steps 4–7 and A18 item 7 can't be reached. Seed a locked month before Nov 2026.
- **T12-T15 step setup** (—): The local DB had been re-seeded (Lahore READY, no imports; Stockholm READY), so T12–T15 had to run again before T16.
- **T1 step 2/4** (iPhone 18 Pro portrait): Paid from defaults to "1921 Kystgruppe operating bank" (script 1920); Approve notice text differs from the script ("Someone other than the person who wrote or sent it approves it.").
- **T12 step 3** (iPad Air 11 portrait): New journal ▾ lists two more entries than the script (New accrual or prepayment, Import journals); script is older.
- **T18 step 4** (iPad Air 13 portrait): Fixture kyst-se-fy2026.se is UTF-8 but declares #FORMAT PC8; the app correctly warns ("Some names look wrong…"). Fix the fixture. Screenshots: `T18-step4-ipadair13.png`
- **T18 step 4** (iPad Air 13 portrait): Seed: Stockholm Handel has no registration_number/tax_id, so "Your company has no org number, so it can't be compared with the file's." Add 556334-3689.
- **T19 step 2-4** (iPad Pro 13 portrait): Script says "Create project" / "Create cost centre"; buttons are New project / New cost centre.
- **T19 step 1** (iPad Pro 13 portrait): Script expects one row per company-dimension slot; if one row is the design, update the script (also in G46).
- **T20 step seed** (iPad Pro 13 landscape): Sialkot Sales channel values RETAIL/WHOLESALE/EXPORT have name = code in upper case.
- **T16 step 1** (iPad Air 11 portrait): Script expects hand-off file opening-items-ar-lahore-tb.csv; app uses customers-opening-items.csv (also in G41).
- **T8 step note** (—): Run as Owners directly; jonas.moe no longer needed for T8.
- **A1 step 6** (iPhone 18 Pro portrait): Script expects quick add in the accrual Cost centre picker; cost centres are setup data (link-only rule), so the script may be wrong (see G29).
- **A13 step 3-4** (—): Script/spec: no Discard for others; backend allows JOURNAL_REJECT holders (see G01).
- **A16 step 1** (iPad A16 portrait): Off reason stored as "A4 test, swi" (tester's tap landed before typing finished; not an app fault).
- **T10 step 3** (iPad Pro 13 portrait): Ola's iPad was look-only for one tester; Post refund wasn't pressed. Plan device ownership per tester.

## NOT-RUN — Steps not run; need the retest

- **T16 step 3-5** (iPad Air 11 portrait): Opening items create, suppliers hand-off, approval and TB check: blocked by G10. A PREVIEWED customers-opening-items import is left at Lahore.
- **T18 step 5-7** (iPad Air 13 portrait): SIE Accounts → Confirm → post: blocked by G11; wrong role, double Post, closed period, self-approval not tried. SIE import left PREVIEWED.
- **T14 step 6** (iPad Air 11 portrait): The To do tick not exercised (only one unmapped row).
- **T20 step 5** (iPad Pro 13 landscape): Two app windows as Ola: skipped (one window per iPad).
- **T9 step 5/7** (iPad mini portrait): Credit notes not opened; New invoice for Nordlys not re-checked with the feature off.
- **T11 step 2** (iPad mini portrait): Write off… on open invoices and the Advances card not re-checked after switching back on.
- **T24 step wrong role** (iPad Air 13 portrait): Whether Erik (Accountant) can create a dimension value not tested.
- **A1 step 11** (iPad mini portrait): Close Dec 2026 and Create FY2027 not exercised.
- **A2 step 7** (—): Bjørn opening the draft without changes: not done.
- **A4 step 4** (—): Which journals Period close lists: not checkable (G21).
- **A6 step 5** (iPhone 18 Pro portrait): Draft-mode run with blank amounts not run (G13); rerun after the fix.
- **A7 step 4-7** (iPhone 18 Pro portrait): Create draft now / Dismiss / Needs you on a skipped date: blocked by the all-open seed. Now reachable on A4T Off month (skipped run from A15).
- **A8 step 4/7/9** (iPhone 18 Pro portrait): Status filter default not checked separately; End-with-reason on a used journal not exercised; "No active or paused recurring journals" empty state not produced.
- **A10 step 2/3/13** (iPhone 18 Pro portrait): channel column card not confirmed; sample file header not read; source link step not possible (G20).
- **A11 step 10** (iPhone 18 Pro portrait): Drafts variant of step 10 done only up to Check.
- **A13 step 4** (iPad mini portrait): The Create refusal for a non-uploader couldn't be tried (no Create offered).
- **A16 step 4-5** (iPhone 18 Pro portrait): Feature-off spot title not seen (G16); step 5 not run (no unfinished check).
- **A17 step 3** (iPhone 18 Pro portrait): A4T Rent Oslo not reopened after switch-on.
- **A18 step items 3, 4, 5, 7, 24, 27, 29, 33, 34** (—): Not visible from the screen or not testable here (due/failed reversals, poster-without-reverse role, closed month, network fault, double pick, spot title, progress state, language switch).
- **layout step Split View half** (iPad Pro 13): Narrow-window band (Split View half) not done for any test.
- **layout step Larger Text** (all bands): Larger Text only checked on the phone band (app ignored it, G37); retest after a relaunch on every band.
- **layout step bands** (—): A1–A9 screens not checked on iPad Pro 11 landscape; T18/T24 not checked in the mobile band (720–1024).
