# iPhone SE sizes (375x667 portrait, 667x375 landscape) - Ola, Kystgruppe, 23:29-23:40, 2026-11-19
Device: QA iPhone SE 53779766. Result: passed with findings. No drafts or data created (typed "SE test" / "SE-1" / "12" were discarded via Leave without saving or menu navigation). Left in portrait.
Screenshots: `SE-<screen>-<portrait|landscape>.png` in this folder.

## Findings (N = new, otherwise known group)
| # | Screen | Orientation | Severity | What | Group |
|---|---|---|---|---|---|
| 1 | Journal editor, recurring editor, AP bill editor | portrait | flow | Sticky footer is 195 pt on the journal editor (30% of 667), 110-125 pt on recurring and bill. With the keyboard up, the focused field (Amount, Name, Invoice number) sits behind the footer: only half the Amount field is visible, Name and Invoice number are fully hidden. Typing works blind. Return key dismisses the keyboard. Shots: journal-editor-keyboard-amount, recurring-editor-keyboard, ap-bill-editor | G32 |
| 2 | Journal editor Amount | portrait | flow | Amount (NOK) opens the full QWERTY keyboard: no numbers keyboard and no Done key (only Return). Typed "12" was accepted. | N (G32-adjacent) |
| 3 | Journal editor, recurring editor, AP bill editor | landscape | flow-blocker until keyboard closes | With the keyboard up, footer and form vanish: only a 14 pt strip of the page is left (header, title and breadcrumb take 145 pt). Save draft, Submit and Cancel cannot be reached until the keyboard is closed with Return. Without keyboard the visible form area is only about 90-110 pt (app bar 65 + Accounts title/breadcrumb 80 + footer 130 of 375). Shots: ap-bill-editor-keyboard-landscape, journal-editor-landscape, recurring-editor-landscape | N (worse than G32) |
| 4 | General ledger Account picker | portrait and landscape | flow | Tapping the search field inside the picker closes the picker (3 of 3 tries portrait, 1 of 1 landscape); the page also creeps up 3-6 pt per attempt. Search by number is therefore not possible; only the long list. Could be a simulator tap artefact, but it repeated. Journal-editor picker opens on the first tap, no auto keyboard, closes on pick (G26 better here). | N |
| 5 | Journals list | portrait | layout | Fiscal year, From period, To period, 5 chips, search all stack above the first journal: the first card is more than one screen down. Landscape: same, one card is taller than the visible area (cards at 667 pt wide instead of a table). | G35 |
| 6 | Journals list, journal detail, bill list | portrait | layout | Sticky mini header: "Journals" title cut to "Journ..." beside Recurring journals + New journal + menu (55 pt strip). | N (minor) |
| 7 | AP bills list | portrait | layout | Search field squeezed: placeholder "Nu..." next to the supplier drop-down. | G35 (T18 case) |
| 8 | AP bill editor | portrait | wording/layout | Footer button reads "Submit for appro..." (landscape shows "Submit for approval"). | N |
| 9 | Side menu | portrait | layout | Header (logo + NeoERP) starts at the status bar edge, under the clock row. Accounts submenu is cut at the bottom ("Fiscal calendar", "Ageing" half visible) with no scroll hint; it does scroll. | known (drawer header, 22:20 note) + N (no hint) |
| 10 | Side menu | landscape | layout | Menu list gets about 220 pt between the header and Sign out; one-level scroll needed to reach Reports, Period close, Payables items. Reachable. | N |
| 11 | Page navigation | both | layout (G33) | The scroll offset of the previous page is kept on the next one: Reports opened with "Accounts" title cut under the app bar; landscape Period close and journal detail opened mid-page. | G33 |
| 12 | Reports, landscape | landscape | layout | Report tabs scroll sideways, "Cash flow" cut at the right edge with a fade; first tap on a tab right after a scroll did not register (2 taps). Portrait uses a drop-down (better than round 1). | G35, G26 |
| 13 | Trial balance | both | layout | One account per card (6-7 rows); in landscape 667 pt a table would fit. Zero values left blank (Debit empty) instead of 0,00. "Filters" button and the inline filter fields are both shown. | G35/G34 |
| 14 | Journal editor Date | portrait | ok | Date field 19.11.2026 with calendar icon; the calendar is a full-screen sheet, X reachable, no cut text. | - |
| 15 | Journal editor Cancel | portrait | ok | "Leave without saving?" dialog fits, both buttons visible and 44 pt. | - |
| 16 | Leaving AP bill editor | landscape | flow (minor) | Leaving the bill editor with typed text via the side menu gives no "Leave without saving?" dialog (Cancel does). | N |
| 17 | Period close, Journal detail | portrait | ok | No cut text; Close buttons reachable; detail Reject/Post visible; Lines as cards. | - |
| 18 | Load times | both | info | Each screen took 6-9 s showing skeleton rows (another tester on the stack). | - |
| 19 | Larger Text | - | not checked | Not in this chunk. | G37 |

## Screen checklist
- Journals list: portrait OK but long filters (G35); landscape OK, tall cards.
- Journal detail: OK in both (head, Reject/Post, lines).
- Journal editor: portrait Save reachable (footer 30%), keyboard hides Amount (1,2); landscape keyboard hides everything (3).
- Recurring editor: same pattern (1,3). Recurring list OK in both.
- Period close: OK in both.
- Trial balance: OK, cards (13).
- General ledger: head OK, no stray "Year to date" caption seen; picker search closes (4).
- AP bill editor: (1,3,8).
- Side menu: (9,10).
Not checked: horizontal page scroll on any screen (none seen), journal line grid with several lines, recurring Starts date field, Insert menu / accrual sheet.
