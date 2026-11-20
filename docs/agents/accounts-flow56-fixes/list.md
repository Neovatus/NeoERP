# Accounts flow 5–6 click-through: app fix batch

Source: Jabran's live click-through with the ERP lead, 2026-10-27 (SIE import and export on Stockholm Handel,
year-end on Kystgruppe Nordic). App only, branch `dev-app`; built in an isolated copy under `builds/`, then
cherry-picked. Writing rules: sentence case, plain words, mark only exceptions, errors inline, toasts title + line.

## 0. Bugs (first, each with a test)

- B1 Balance sheet, Group by "Chart classes": class 2 Equity and liabilities is listed in the Assets column, under
  it "Total assets"; the right column holds only its total. Group each class on its own side.
- B2 Year-end checks: `YEAR_END_TARGET_MAPPED` has no text, shows "Another check passed." Text: "The result goes to
  {2050 Retained earnings}." Add a test that every backend year-end check code (and SIE preflight code) has a text.
- B3 SIE import, Accounts step: the Default branch field disappears once a branch is chosen (shown only while the
  server reports BranchRequired, SieMappingState.kt:319). Keep it visible once chosen.

## 1. Shared components (fix once, every screen follows)

- S1 Date style everywhere: no raw ISO ("2026-01-01", "19:00, 2026-10-27") and no numeric "01.01.2026 – 31.01.2026"
  in Accounts; the app's date style (as the Fiscal calendar: "1 Jan 2027"). Date fields (NeoDateField) in the app
  font, not monospace, incl. the placeholder ("DD.MM.YYYY").
- S2 Month lists become ranges: "Jan–Oct 2026 aren't closed yet", "Aug–Dec 2026 are still open" (export warnings,
  year-end checks, period close).
- S3 Wizard steps: the lighter step pattern from building-blocks for both the SIE import and the year-end wizard;
  one title per wizard ("Import opening balances", "Year-end FY2026"), not repeating the step name.
- S4 Reason field hint: context-specific ("Kept with the close / the year-end / the journal and in the audit log"),
  not always "the change".
- S5 No repeated blocker lines under a disabled button: drop "Tick that you've read the warnings", "Add a reason to
  continue.", "Fix the problems above to export.", "Map 1 account to continue."; the disabled button and the inline
  item say it.
- S6 Check lists show problems first, each with its fixing action on the row; passed checks fold into "N checks
  passed" (year-end checks, close-month dialog, export dialog).
- S7 Every warning carries the action that fixes it: one blocking journal → "Open {JV-DRAFT-000001}" opens that
  journal (dialog closes first), several → "Open drafts" filtered to them; "FY2027 not created" → "Create FY2027".
- S8 Hide zero-count chips/tabs ("Not needed 0", "Drafts 0"); every tab shows its count when others do ("Mapped").
- S9 Status shown only as an exception: drop "Open" pills on all-open rows, "FY2026 · Open" in year pickers,
  "· Open" in the journal period line; "Posted by: Not posted yet" hidden until posted.
- S10 Overlines in sentence case labels ("Your exports", like "Versions").
- S11 Empty values blank, not "—" (journal line descriptions); zero amounts blank in all trial balance columns
  (Opening/Debit/Credit print 0,00 today while closing columns are blank).
- S12 Success after save/export is a toast, not a grey notice with Dismiss ("Saved …se").

## 2. SIE import wizard (Stockholm)

- I1 File/Check: file name and size shown twice; "Characters" heading duplicates "Character set".
- I2 "SIE type 1" → "Year balances (SIE type 1)".
- I3 Org-number notice says which side lacks it ("Your company has no org number") and links to Legal details.
- I4 Difference message and "Choose where the difference goes" only once every account is mapped; one red line max.
- I5 "Held out" explained once near its total (1510 Customers, 2440 Suppliers named; offset to 2009 stated), not per
  row; Confirm and import-detail lines name the accounts, without "Receivable or payable" and "— enter as opening
  items later" per line.
- I6 "Needs an account" tag and "Not in your chart" note say the same; keep one.
- I7 Summary lines above the card ("File · …", "Check · …") redundant; drop.
- I8 Difference choice: a label plus two plain options.
- I9 No "Same number" / "Chosen" tags on mapped rows (exceptions only; AC-OBI OBI-A2).
- I10 When Needs action reaches 0, switch to All or show "Every account is mapped".
- I11 Account select list: no fixed blank area under the last option.
- I12 Confirm: "Create and submit journal" follows the count; "0 not needed" hidden; card title "What will be
  created", not "Confirm".
- I13 Import detail: "Waiting for someone else to post" is a neutral notice (normal next step), "journal" singular;
  "Original file" line shows size only (date/by repeat Uploaded).
- I14 Breadcrumb last crumb and the "FY2026" line under it (see S15 below).
- I15 Memo "(1 of 1)" only when the import made more than one journal (journal list, detail, post dialog).

## 3. Journals

- J1 Detail: Document reference and Source say the same for imports; keep one. Source link "Open" → "View import".
- J2 Editor footer "2 of 2 lines complete" with 3 lines; count non-empty lines.
- J3 "Line 1 needs a branch" waits until submit or the line is otherwise complete.

## 4. Reports

- R1 Trial balance (Stockholm, after backend f495089): verify the OB shows in Opening; nothing else to change in app.
- R2 SIE export dialog: "3 things to know" yellow bar + separate grey notice → one grey "Good to know (N)" fold with
  every info line; "0 vouchers · 0 lines" → "Opening balances for 10 accounts · no vouchers yet" when OB is #IB;
  hide "Include last year's balances" when there is none; subtitle "For your accountant or auditor"; empty-state
  full stop; after export close the dialog, highlight the row, toast "File saved to Downloads".
- R3 SIE file list: per row "N notes" folded; "Kept until {date}" next to size.
- R4 SIE export SRU warning names the account (backend skips OBE; separate backend item).
- R5 Balance sheet: hide empty sections (keep main totals); layout line not truncated; the two notes under
  "Balanced" merged into one.

## 5. Period close, fiscal calendar, year-end

- P1 Period close "Checks" column holds history ("Locked … by …"): rename or move to the row menu.
- P2 Drop the Dates column (or only the year-end adjustments date); drop the explanation line repeating the subtitle.
- P3 Close on months that can't close yet: disabled with the reason, or "Close May–Jun".
- P4 Year-end card: "Open 2050 in the general ledger" says why ("Retained earnings (2050) receives the result").
- P5 Year-end adjustments side panel: drop the Note repeating the subtitle; hide empty History; consider no panel.
- P6 Fiscal calendar: drop the Open/Closed/Locked notice (keep it on Period close); "All open" once in the year
  header instead of a pill per month; period number column in one font.
- P7 Year-end preview: 0-line case says so ("No income or costs were posted in FY2026…"); closing lines ordered by
  account, result account last; the grey paragraph shortened to what the table doesn't show.
- P8 Close step: notice shortened ("Nothing can be posted to FY2026 after closing. The Owner can reopen it until it's
  locked.").
- P9 Done step: journal named once (link); "Lock the year" moves to Period close's year menu with its own confirm;
  one primary action ("Back to Period close"), reports as links.
- P10 "Next: preview" while a check fails → "Preview anyway" plus the line that the year can't close yet.

## 6. Page header

- S15 The "FY2026" line under the breadcrumb: follows the year being shown (Fiscal calendar on FY2027) or is left
  out; the breadcrumb's last crumb is the page you're on.

## Not in this batch (backend or other owners)

- SIE preflight: skip the SRU warning for the OPENING_BALANCE_EQUITY account; name the account in SRU warnings.
- Org legal-profile history: return actor and reason; validation errors with `fieldErrors`; separate code for
  "before company creation" vs overlap.
- Earlier backlog: auth `/error` permitAll and desktop logout loopback (await Jabran's approval).
