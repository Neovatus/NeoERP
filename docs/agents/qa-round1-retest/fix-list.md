# QA round 1 retest — second fix list (draft for Jabran)

Source: `summary.md` and the per-group reports in this folder (retest 19 Nov 2026, app f42afb54, backend 6b67792).
Nothing is started until Jabran says go.

## 1. Blockers and data (first)

| # | Item | Sev | Repo | Where |
|---|---|---|---|---|
| R01 | G13: recurring journal with blank amounts saves, but app says "We couldn't confirm the result" and its detail page fails ("Something went wrong"). App can't read the saved shape. | flow-blocker | app (check contract) | G13.md |
| R02 | G14: iPad mini portrait — recurring editor footer Save and Import journals "Earlier imports" do not respond (no request). Landscape works. | flow-blocker | app | G14.md |
| R03 | Phone landscape (SE 667×375, 18 Pro 874×402): with keyboard up the footer and form vanish (14 pt left); without keyboard 90–135 pt working area. Pinned head + footer too tall for short heights. | flow-blocker | app | SIZES-iphone-se.md, SIZES.md |
| R04 | Bjørn (Finance) on iPad mini: Reports shows "We couldn't find this" on every tab; Anna and Ola fine. Cause unknown (permission or saved state) — investigate first. | flow-blocker | both? | SIZES.md |
| R05 | G31: typed text lost or misplaced — date typed in Starts landed in Document reference; accrual memo lost " fees A4T" in DB. | data | app | G05-G17-…-input.md |
| R06 | G05: bill line Description keeps only "Shore" of "Shore power, December". | data | app | same |
| R07 | G06: accrual panel suggests 2950 Påløpt rente, should be 2960; hint stays after manual change. | data | app/BE | G06.md |
| R08 | G07: `{period}` renders "nov./des./mar. 2026" in memo, document reference and "Next:" preview; must follow the one format (NeoFormat). | data | BE (+app preview) | G07.md |
| R09 | T18: SIE import says "Your company has no org number" although org has 556334-3689; line 2081 gets no branch despite "Every line gets this branch". | data | BE | T18.md |
| R10 | G03: Trial balance by branch puts equity under "Other branches…". | data | BE | G03.md |
| R11 | T16: Held out still offers "Enter as opening items" after creation (duplicate risk); "Back to receivables" opens a blank OB wizard. | data/flow | app | T16.md |
| R12 | T24: "500" once shown as "5,00" (money, not reproduced). Add an automated parse/format test per country for `NeoNumericInput`; no UI change unless the test fails. | money (unconfirmed) | app | T24.md |
| R13 | T24: Stockholm journal has no Default branch (check seed vs G10 rule). | data (check) | BE seed | T24.md |

## 2. Flow

| # | Item | Repo |
|---|---|---|
| R14 | Keyboard and focus: Amount/Starts open letter keyboard (journal on SE, recurring editor) — numbers keyboard with Done (G17); focused field not scrolled above the footer (G32); recurring editor jumps after date change, iPad mini grid row grows (G33). | app |
| R15 | Pickers: tapping the search field closes the account list (iPad Pro 13 journal editor, General ledger on SE, G12); Reports tab needs a second tap after scroll (G26). | app |
| R16 | G15: lists, counts and open detail pages don't refresh after someone else acts (stale Post is refused safely). | app |
| R17 | G20: no link from "Imported from" to the import; Created rows don't link to journals; "Open in Drafts" keeps an old search; history "By" shows uploader on a row Ola discarded (BE). | both |
| R18 | G21: Period close names pending reversals — make them links and offer Reverse now. | app |
| R19 | A7/G23: ended recurring journal with skipped dates (Needs you) hidden by default Active/Paused filter; "Ends after N times" counts skipped dates; no Needs you chip on phone. | both |
| R20 | G24: General ledger has no Cost centre / Project column. | app (+BE if not in payload) |
| R21 | G04: draft list row opens editor with no Delete; reopened draft footer shows 0.00 until first edit. | app |
| R22 | Leaving a bill editor via the side menu skips "Leave without saving?" (Cancel asks). | app |
| R23 | G02 follow-up: an editor already open before a feature switch isn't refreshed on return to front (server refuses safely). | app |
| R24 | G16: off page lacks "Accounts / Payables" crumbs; closed-form toast cut and "was" → "were". | app |
| R25 | G18: duplicate name refusal is generic — say the name is taken. G42: "This file was imported before." add date and person. G44: Recurring journals button "· n" count. | both |
| R26 | G19: Create account 1925 still missing. G41: template cancel says "The file could not be saved". | app |
| R27 | iPad Pro portrait: Accounts rail flyout stays open over the page after picking an item. | app |
| R28 | G25 (backlog item, still broken) — stays in backlog unless Jabran pulls it in. | app |

## 3. Layout and wording

- Larger Text: phone Journals loses "New journal ▾"; numbers cut to "JV-"; dialog button "Leave with…"; phone editor footer ~35 %; picker codes "CUST-00…"; toast cut; grid headers break mid-word ("Descript/ion").
- Cut labels at normal size: "Submit for appro…", sticky head "Journ…", phone landscape Journals cells "O…", search "Nu…", TB name loses "sats".
- Side menu header drawn under the status bar (iPhone, iPad mini); side menu list clipped without scroll hint (SE).
- Editor grids cut columns with only a fade (G34) — show a clear scroll hint.
- G35: Journals on phone still stacks every filter above the list.
- Trial balance: zero values blank instead of 0,00; "Filters" button and inline filters shown together.
- Wording: G40 Owner toast "Someone else approves it."; T16 create dialog vs "Approve all (as Owner)", pill "Created" after approval; T18 Swedish memo in English UI; G01 refusal card on stale page doesn't say who/why; G06 hint.

## 4. Decisions (Jabran 2026-11-20: all four recommendations approved)

1. **G16 reads while a feature is off:** the refund panel still loads open credit/advances; only writes are refused. Keep reads open (history stays visible) or refuse them? Recommendation: keep reads open (the Earlier imports history already does), refuse writes only.
2. **Refunds menu items while off:** they stay and lead to the off page. T11 reads as if they disappear. Recommendation: keep them, leading to the off page (consistent with Journal imports).
3. **Phone landscape editors (R03):** recommendation: below ~500 pt height the page head scrolls away (not pinned) and the footer shrinks to one row of buttons.
4. **G08 Bergen Payroll On while not in agreement** (tester check): confirm expected under the G08 rule (only ON equal to agreement → INHERIT; explicit stays) — likely seed data, not a bug.

## Suggested lanes (when Jabran says go)

- **BE (Opus, money/data):** R07 (if BE), R08, R09, R10, R13, R17 history By, R19 count rule, R25 BE parts, R04 investigation.
- **App A — input, keyboard, sizes (Opus):** R03, R05, R06, R12, R14, R15, R22.
- **App B — flows (Sonnet, decided items):** R01, R02, R11, R16–R21, R23–R27.
- **App C — layout and wording (Sonnet):** section 3.
