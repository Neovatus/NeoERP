# Layout pass — main screens of T4–T8
Result: partly done (4 of 5 bands; Larger Text checked on the phone band only; Split View not done)

| Band | Device + orientation | Screens seen | Result |
|---|---|---|---|
| Phone (<480) | iPhone 18 Pro portrait 402 (Anna) + iPhone 18 Pro Max 440 (Hina) | Receipts list, receipt/refund/payment detail, approve sheets, Reports (TB, P&L) | findings 1, 2, 5 |
| Mobile (720–1024) | iPad mini portrait 744 (Bjorn) | Invoice / bill editors (line cards, Tags), invoice/bill detail, journal detail, journals list, new journal | findings in T6 (1, 6, 7, 8) |
| Tablet (1024–1280) | iPad mini landscape 1133, iPad Pro 11 landscape 1210 (Omar) | New journal grid, refund detail, refunds list | finding 3; T6-1/T6-2 |
| Desktop (>=1280) | iPad Pro 13 landscape 1376 (Ola) | Journals list, new journal, TB, P&L, GL, Company → Modules | T6-4, T7-1, T7-4 |
| Narrow window | iPad Pro 13 Split View half | — | not done (needs a second app in Split View; left for the next pass) |
| Larger Text | iPhone 18 Pro, Accessibility Medium via the simulator's content size | P&L, menu | finding 4 (setting restored to Large after) |
Also: iPad Pro 11 portrait 834 (T4/T5 flows) and iPad Air portrait 820 (T8) — findings in T4 and T8.

## Findings
1. Phone — Reports: the report tabs (Trial balance, General ledger, Journal listing, Profit and loss, …) scroll sideways; "Profit and loss" is off-screen, the last visible tab is cut ("Pro…") with no scroll hint, and the stacked filters (Fiscal year, From, To, chips, Branch, Cost centre, Project, Sales channel, Compare) fill more than the first screen before any figure shows. Collapse the filters into a "Filters" sheet on phones. Severity: layout. iPhone 18 Pro portrait. Screenshot: LP-phone-reports-iphone.png. Time: 12:42
2. Phone — P&L rows render as cards that each repeat the label "Amount" (Total operating income / Amount / 57 000,00 …); a two-column row (name left, amount right) fits 402 pt and halves the length. Severity: layout. iPhone 18 Pro. Time: 12:43
3. Tablet — pages don't refresh when other people act: at 12:44 Omar's refund page still showed RFD-DRAFT-000006 "Waiting for approval" 26 minutes after Hina posted it as RFD-2026-27-000001 (rotation didn't reload either); the list refreshed only after Back. Same on Anna's iPhone (WO-DRAFT-000024 still "Waiting for approval" at 12:15 after Bjorn approved it at 11:58). Acting on the stale page is refused correctly (T4 step 3). Refresh on resume/focus or show "This changed — reload". Severity: flow. iPad Pro 11 landscape. Screenshot: LP-tablet-stale-refund-ipadpro11.png. Time: 12:44
4. Larger Text — with iOS text size set to Accessibility Medium the running app kept the same text size on every screen (P&L, menu). The app doesn't follow iOS Dynamic Type (at least not without a relaunch; not relaunched, to keep the session). Severity: layout (accessibility). iPhone 18 Pro. Screenshot: LP-larger-text-ignored-iphone.png. Time: 12:44
5. Phone — date filter fields open the full letter keyboard and the keyboard can't be dismissed (see T4 finding 5). Severity: layout.
