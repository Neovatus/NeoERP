# G37 — iOS Larger Text (my devices), including dialogs and pickers
Result: fixed (text scales live) — new layout findings
Devices: iPhone 18 Pro portrait, iPad mini portrait, iPad Pro 13 landscape; Settings → Larger Text = Accessibility Medium (set with `simctl ui content_size`, no relaunch), restored to Large afterwards.
## Steps
1. iPhone, Period close: all text grows at once (no relaunch). Picker (Fiscal year) grows too. passed. Screenshot: LT-periodclose-axm-iphone.png
2. iPhone, Journals: the split button's **▾ part is gone** — the row shows "Recurring journals" and "+ New journal" only, so New accrual, Import journals, Journal imports, Opening balances can't be reached. Sideways swipe does nothing. Screenshot: LT-journals-no-menu-arrow-iphone.png
3. iPhone, New journal: sticky footer grows to ~310 pt (about 35 % of the screen), leaving ~4 fields visible. Screenshot: LT-journal-editor-footer-iphone.png
4. iPhone, "Leave without saving?" dialog: the red button is truncated to **"Leave with…"**. Screenshot: LT-dialog-button-truncated-iphone.png
5. iPhone drawer: scales; its header ("N NeoERP") is drawn under the status bar and overlaps the clock (also at normal size, both iPhone and iPad mini). Screenshot: NEW-drawer-under-statusbar-iphone.png
6. iPad mini portrait: journal detail and Journals list scale cleanly; ▾ is present. passed. Screenshots: LT-journal-detail-ipadmini.png, LT-journals-ipadmini.png
7. iPad Pro 13 landscape, Journals table: the Journal column shows only **"JV-"** for every row (numbers cut, no ellipsis); dates "1 Nov" lose the year; sidebar splits "Receivabl / es". Screenshot: LT-journals-numbers-cut-ipadpro13.png
## Findings
1. Step 2 — Phone + Larger Text: New journal ▾ menu unreachable. Severity: layout (flow: accrual/import can't be started). Time 23:13
2. Step 7 — iPad Pro 13 + Larger Text: journal numbers cut to "JV-" in the list. Severity: layout. Time 23:17
3. Step 4 — dialog button text truncated. Severity: layout.
4. Step 3 — footer ~35 % of the phone screen at Larger Text. Severity: layout.
5. Step 5 — drawer header under the status bar. Severity: layout (minor).
