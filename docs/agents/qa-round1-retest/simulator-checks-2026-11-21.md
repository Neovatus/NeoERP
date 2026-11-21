# Simulator checks S1–S4 for FIX-APP-A (R05, R06) — 2026-11-21

Run by the lead in the iOS Simulator (Xcode 27, iOS 27.2), debug build of App `phase/4` `324d3039` (FIX-APP-A merged),
local stack (BackEnd `phase/4` `a50eabbb`), signed in as the demo user Anna Lindh (Accountant, Kystgruppe Nordic).
The on-screen keyboard was used by tapping its keys one by one (the simulator's text input arrives as hardware-keyboard
keystrokes and would skip the soft keyboard's word commit), Auto-Correction on.

## Results
| Check | Device | Result |
|---|---|---|
| S1 (R06) bill line Description "Shore power, December" | iPhone 18 Pro, portrait | **Pass.** Every word kept while typing on the soft keys (the "Lines · 1" header appears after the first letter; typing continues). Return closes the keyboard, text kept. Cancel asks "Leave without saving?"; Keep editing keeps the text. R06 does not reproduce. |
| S2 (R05) accrual memo "accounting fees A4T" | iPhone 18 Pro, portrait | **Pass on the text:** "Accrued expense Nov 2026: accounting fees A4T" in the panel and in the journal editor after Open in editor (JV-DRAFT-000025 created on the local stack). Amount keyboard: numbers and punctuation with ✓ Done, both separators. Two new findings in the panel (F2, F3). |
| S3 (R05) date typed into Starts after the memo | iPhone 18 Pro, portrait | **Pass.** One tap on Starts takes the caret and switches to numbers and punctuation with ✓ Done; 01.11.2026 lands in Starts; Document reference stays "Lease A4T-OSL {period}"; the dates list grows below, the page does not jump. R05 does not reproduce. |
| S4 iPad hardware keyboard | iPad Pro 13-inch (M5), landscape | **Partly run, still open.** The lead's simulator tool cannot switch on "Connect Hardware Keyboard" (I/O ▸ Keyboard; only the pane or the Simulator menu can), so the soft keyboard stayed on. Checked: Mac keystrokes into Memo kept every character ("Office rent Dec 2026"); the editor opens with its footer (step 1 pass); with the soft keyboard up the footer gives way and comes back with Save draft enabled when the keyboard closes. Not checked: Tab through the header with a real hardware keyboard and the shortcut bar (steps 2–3): the soft keyboard's ⇥ key left the focus in the multi-line Memo, which is not the same event. Needs one more run with the hardware keyboard on. New findings: F1 also here, F10. |

Also confirmed on iOS: the side-menu leave guard (R22) asks "Leave without saving?" from a dirty bill.

## New findings (for App lane B)
| # | Severity | Where | What |
|---|---|---|---|
| F1 | MEDIUM | Page head on editor pages (bill, journal, recurring), iPhone portrait | When the page scrolls, the page head ("Accounts" and the breadcrumb) is drawn on top of the app's top bar: "Accounts" overlaps the menu button, the breadcrumb runs through "Anna Lindh · Accountant". Seen right after opening the recurring editor too. |
| F2 | MEDIUM | Accrual panel (New accrual or prepayment), keyboard up | The panel footer (hint, Cancel, Open in editor, Submit for posting) rides above the keyboard and covers the focused field (Memo, Amount): the person cannot see what they type. Only Kind and Month stay visible. Breaks ux §25 "the focused field never under the footer or keyboard" (the case Opus L4 left for the simulator). |
| F3 | MEDIUM | Accrual panel, Memo with the keyboard up | Neither Return nor a tap on empty panel space closes the keyboard (the round-2 tap-outside fix covers editor pages, not this panel); with F2 the person is stuck until they scroll and tap another field. |
| F4 | LOW | Accrual panel Amount | After Done the amount shows "1500,00"; the journal editor shows the same value as "1 500,00". The panel misses the NO thousands separator (value is right). |
| F5 | LOW | Side menu header, iPhone | The drawer's "N NeoERP" header sits under the status bar; the clock overlaps "NeoERP". |
| F6 | LOW | Bill line Description | The first letter is not capitalised automatically (other iOS text fields start in Shift). |
| F7 | LOW, unconfirmed | Recurring editor Name | Text typed right after opening the page was stored but not drawn until the next tap (seen once, with hardware-keyboard input). |
| F8 | LOW, unconfirmed | Journals list | "Drafts 2" did not change after creating JV-DRAFT-000025 (count may not refresh; not checked further). |
| F9 | MEDIUM | Top-bar search opened on a scrolled editor page, iPhone portrait (seen by Jabran, recurring editor) | The open search field is boxed in the middle of the bar with the menu button still beside it, and the page head ("Accounts" and the breadcrumb, F1) is drawn through it. building-blocks.md "Search": on a phone the field opens **across the bar** and ×, Esc or Back closes it. Fix with F1 (same layer order); check the open field covers the whole bar and nothing from the page draws over it. |
| F1+ | MEDIUM | Same as F1, iPad Pro 13 landscape, journal editor with the soft keyboard up | The page lifts above the keyboard and "Accounts" is drawn over the top-bar search field, the breadcrumb under it. So F1 is not phone-only. |
| F10 | LOW | Side menu, iPad Pro 13 landscape, soft keyboard up | The "Sign out" block moves up with the keyboard and covers the lower menu items: Dimensions to Approval limits, Profile and Settings cannot be reached until the keyboard closes. |
| F8 note | — | Journals list | After a fresh sign-in on the iPad the list shows "Drafts 3" (JV-DRAFT-000025 counted), so the count is right on load; the in-session refresh is still unchecked. |
| — | tooling | Keycloak sign-in sheet on the iPad | The simulator's text input put only the first character into the web sign-in fields; typing on the on-screen keys worked. Testers: sign in on the soft keys. |
| — | known | Accrual panel Balance account | Still defaults to 2950 Påløpt rente (R07, App part planned in App B). |
