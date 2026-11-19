# Size check, Kystgruppe rest (19 Nov 23:24-23:41)
Screens: Journals list, journal editor, Period close, Trial balance, recurring editor. Screenshots named SIZE-*.

## iPhone 18 Pro landscape (874x402), Anna
- Journals list (default Drafts chip): table; "Last changed" cell cut ("Anna Lindh, 23:04, 19 Nov 2...") and the Open column shows "O..." (layout). Filters stacked as in portrait; the pinned list head ("Journals" + buttons) takes ~115 of 402 pt. SIZE-journals-list-iphone-landscape.png
- Journal editor: the page head ("Accounts" + breadcrumb, ~65 pt) stays pinned and the footer takes ~90 pt, so only ~135 pt of 402 shows the form; line rows are reachable only by scrolling one row at a time; the grid is cut after Credit (fade at right, Branch not visible). Footer buttons all visible and tappable. (layout, flow) SIZE-journal-editor-iphone-landscape.png
- Period close: table Period / Status / Checks fits; no cut. Anna has no Close buttons (role). SIZE-period-close-iphone-landscape.png
- Trial balance: cards, not a table; label rows without values for empty cells (cosmetic). SIZE-trial-balance-iphone-landscape.png
- Side menu in landscape: only ~3.5 items visible above the pinned Sign out; Reports / Period close need scrolling; it works. (layout, minor)
- Recurring editor: NOT REACHED.

## iPad mini portrait (744), Bjorn
- Journals list: cards, labels in normal case, Status row, filter chips wrap; fine. SIZE-journals-list-ipadmini-portrait.png
- Journal editor: lines grid shows #, Account, Description, Debit, Credit only; Branch and later columns are off to the right with a soft fade as the only hint (layout). Footer fine; Cancel worked on the first tap (G14 not seen here). SIZE-journal-editor-ipadmini-portrait.png
- Recurring editor: same grid cut after Credit; Cancel worked on the first tap. SIZE-recurring-editor-ipadmini-portrait.png
- Period close: fits, status and Close buttons visible. SIZE-period-close-ipadmini-portrait.png
- Trial balance and every other report: BLOCKED. Reports shows "We couldn't find this / It may have been deleted, or the link is wrong." with Back to list, on every tab, reproduced 3 times (reached from the menu and after Back to list). Anna and Ola open Reports fine. Cause not known (permission or stale saved report state; backlog G25 is the same wording). Severity flow-blocker for Bjorn on this device. SIZE-reports-not-found-ipadmini.png
  The new-journal grid/footers were checked; TB columns on 744 not checked because of this.

## iPad Pro 13 portrait (1032), Ola
- Journals list: table with words in Type; all columns fit. SIZE-journals-list-ipadpro13-portrait.png
- Journal editor: grid shows # to Branch; further columns (cost centre) cut with a fade. Footer fine; after the keyboard opens the footer collapses to the buttons only. SIZE-journal-editor-ipadpro13-portrait.png
- Recurring editor: schedule card fine; grid cut after Branch. Footer ok. SIZE-recurring-editor-ipadpro13-portrait.png
- Period close: fits. SIZE-period-close-ipadpro13-portrait.png
- Trial balance: fits, account name "Salgsinntekt, avgiftspliktig, hoy" loses "sats" (wraps to 2 lines then cut). SIZE-trial-balance-ipadpro13-portrait.png
- NEW (layout/flow): the collapsed Accounts rail opens a flyout; after tapping an item the page loads but the flyout stays open over the page; a following tap on the rail icon + the page behind opened a month side panel (Jul 2026) under the flyout. Tapping the next menu item worked.

## iPad Pro 13 landscape (1376), Ola
- Journals list: all columns fit. SIZE-journals-list-ipadpro13-landscape.png
- Journal editor: grid # .. Cost centre visible; one more column hidden behind the fade. Footer fine. SIZE-journal-editor-ipadpro13-landscape.png
- Period close: fits. SIZE-period-close-ipadpro13-landscape.png
- Trial balance: fits, "Lines outside this filter" row with info icon. SIZE-trial-balance-ipadpro13-landscape.png
- Recurring editor: fits; the sticky footer overlaps only the bottom of the Schedule card (scrolls). SIZE-recurring-editor-ipadpro13-landscape.png
