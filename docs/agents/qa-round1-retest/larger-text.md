# Larger Text retest: Sialkot devices (iPad Pro 11 portrait, iPhone 18 Pro Max portrait)
Setting: set with `xcrun simctl ui <udid> content_size accessibility-extra-large` (the same value as Settings > Accessibility > Display & Text Size > Larger Text at the second-largest accessibility step), the app was reopened from the Home screen, no relaunch needed. Both devices reset to `large` (default) afterwards, checked.

## Page
- Page text, headings, fact rows, lines table (becomes cards), toolbar buttons and filter chips scale on both devices. passed.
- iPad: header name and role scale (Sialkot Mills / Omar Farooq . Owner); the search box shrinks to fit. Phone: header role is cut to "Hina Rauf . ..." and the breadcrumb collapses to "Companies / ... / Refunds". Severity: layout (info loss, minor).
- Small icons (back arrow, bell, search, "..." menu glyph, calendar, close X) do not scale; the buttons around them stay about 44 pt. Severity: layout (minor).

## Dialogs
- iPad: "Delete draft INV-DRAFT-000011?" dialog (reason box, hint, Cancel / Delete draft) scales like the page (about 1.6x), fits, buttons readable and tappable. passed. `LargerText-ipad-dialog-ax2.png`
- iPhone: "Reverse RFD-2026-27-000001?" dialog (long text, date, reason, two buttons) scales fully and fits without cutting. passed. `LargerText-iphone-dialog-ax2.png`
- Toast: "Draft INV-DRAFT-000011 deleted." became "Draft INV-DRAFT-000011 de..." (cut on two lines). Severity: layout. `LargerText-ipad-list-toast-ax2.png`

## Pickers
- iPad customer picker (popup) scales (search, names), but the customer code is cut "CUST-00..." in both rows and a long name wraps. Rows stay tappable. Partly: scales, with truncation. `LargerText-ipad-picker-ax2.png`
- iPhone customer filter picker (full-screen sheet): row text scales less than the page (names about 1.3x), code cut "CUST-00...", close X small but tappable. Partly. `LargerText-iphone-picker-ax2.png`
- Search placeholders "Number, cu..." and "All cust..." are cut on the phone; date fields show "DD/M...". Severity: layout.

## Editor (iPad, New invoice)
- Line grid headers break mid-word: "Descript / ion", "Quan / tity", "Inco / me / acc / ount", the line row inputs are partly under the sticky footer on first view (the form needs a scroll before the first line is usable), tax code shows "PK-S...". The footer wraps Net / Tax / Total over three lines but stays usable. Severity: layout (the line grid does not switch to the card layout the detail page uses). `LargerText-ipad-picker-ax2.png` shows it.

## Verdict
Dialogs scale like the page. Pickers scale but truncate codes (partly). Editor line grid at this size is the weak spot. Nothing was hidden with no way to reach it.
