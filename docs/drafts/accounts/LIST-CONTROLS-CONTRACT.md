# List controls contract: `NeoSearchSelect` and `NeoMultiSelect`

**Status:** proposal, Accounts lead → ERP lead (owner of the shared design rules). Date: 2026-10-09.
**Answers:** ACCOUNTS-LEAD-REVIEW appendix "Accounts Screen Rig: design review" A-1 (blocker), A-2, A-7 and B-1.
**Built in:** CP-A1.2a (components, tokens, tests). Screens move onto it from CP-A1.2b (see §10).
**On approval:** §1–§9 replace the `NeoSearchSelect` and `NeoMultiSelect` bullets in building-blocks.md
"Choosing from a list". The five decision questions above those bullets and "Search in a table" stay as they are.
§10 and the "Amendments this needs" list stay in the Accounts drafts.

Rule ids (LC-n) are for tests and review comments. "Field" means the closed control. "Panel" means the open list on
desktop and tablet; "sheet" means the open list on a phone. "Item" means one choosable row.

## 0. What the two rig references did differently (and what wins)

| Topic | `A2SearchSelect` / `A2MultiSelect` (a2.jsx) | Account cell `AjAccountCell` (a1.jsx) | This contract |
|---|---|---|---|
| Matching | Text contains anywhere in "code label second-line"; case only | Code **prefix**, name or local name contains; case only | LC-1: code prefix, name/keywords contain; case, accents and Nordic letters folded |
| Ranking | Source order | Exact code, then code prefix, then the rest, by code | LC-2: five tiers, then source order |
| Recents | 6 per `recentKey`, repeated in the list below | 10 per company, not repeated | LC-5: 10 per company and kind, not repeated, only on lists above 10 items |
| Groups | Yes (`group`), also while typing | None | LC-6: before typing only |
| Where you type | Search field at the top of the panel | In the cell itself | LC-14: field variant = search at top; compact cell = in the cell |
| Opening keys | Printable key or ↓ | Printable key or Alt+↓ (plain ↓ did nothing) | LC-15: printable key, ↓, Alt+↓, F4, Space; Enter only in the field variant |
| After a pick | Panel unmounts, focus falls to `BODY` (bug A-2) | Focus moved by the screen to Description | LC-17: focus returns to the field; the screen may move it on |
| Size | Silent cut at 150 before typing, 80 after | No cut | LC-9: no silent cut; local ≤ 500, else remote with "Showing 50 of N" |
| Placement | `fixed`: pinned, opens up below 340 px, closes on scroll and resize | Pinned, always below, follows scroll | LC-22: flips above, never under a sticky footer, closes on scroll, follows resize |
| Empty item | "Choose", "None", "No default", "All branches" | none | LC-7: "None", "{name} (default)" or "All {things}" |
| Disabled reason | `title` tooltip only | — | LC-8: visible second line; field-level reason per LC-26 |
| ARIA | button + listbox; `label > checkbox` inside listbox (invalid) | combobox, highlight not announced | LC-27–LC-30 |

The rig is corrected to this contract by the Accounts lead before CP-A1.2b (both pickers become one component).

## 1. Matching, ranking, highlight (both components)

**LC-1 · Matching.** The query and every searchable text are *folded* before comparing:
1. Unicode case folding to lower case, locale-independent (Turkish İ/ı fold like i).
2. Accents removed: é→e, ü→u, ä→a, ö→o, å→a, ñ→n, ç→c, and the rest of Latin-1 Supplement and Latin Extended-A.
3. Letters that are not accented forms are spelt out: æ→ae, ø→o, œ→oe, ß→ss, ł→l, đ→d, þ→th.
4. Leading and trailing spaces trimmed; runs of spaces become one.

Fold lives in `commonMain` as `NeoTextFold.fold(text): Folded` with an explicit table (no `java.text.Normalizer`;
it is not in common code). `Folded` keeps an index map back to the original string for highlighting (æ→ae changes length).

The query is split into words. An item matches when **every** word matches one of:
- the start of the item's **code** (prefix only: "19" finds 1900–1999; "92" does **not** find 1920);
- anywhere in the item's **label** or its **keywords** (e.g. an account's local name "Bankinnskudd").

Never matched: the second line (`detail`, e.g. "Off"), the trailing meta (account type), the group heading.
Examples: "kafe" finds "Fjord Kafé"; "tromso" and "tromsø" both find "Tromsø"; "baerum" finds "Bærum";
"1920 bank" finds "1920 Bank deposits"; "goteborg" finds "Göteborg".

**LC-2 · Ranking.** Matches are ordered by the first tier that applies, then by source order (the caller's order,
e.g. by account number):
1. the code equals the whole query;
2. the code starts with the query;
3. the label starts with the query;
4. a word in the label or keywords starts with the query;
5. everything else that matched (contains, or a multi-word match).

**LC-3 · Highlight.** In each shown item the matched part is drawn in SemiBold (same colour, so contrast is
unchanged): the code prefix, and the first matching run in the label. Keywords are not shown, so a keyword-only match
has no highlight. Highlight ranges are computed on the folded text and mapped back through `Folded`.

**LC-4 · Remote sources** (LC-10) must implement LC-1 on the server. The client re-ranks each returned page with
LC-2 and highlights with LC-3, so local and remote lists look and order the same.

## 2. Content of the list

**LC-5 · Recents.**
- Kept on the device, per **company** and per **kind** (`recentsKey`, e.g. `"accounts"`, `"branches"`): storage key
  `neoerp.recents.{companyId}.{recentsKey}`. The journal editor and the general ledger share `"accounts"`, so one
  account picker has one recent list.
- Up to **10**, most recent first. Recorded only when the person picks an item (not when a screen sets a value, not for
  the empty or fixed options). Picking a recent item moves it to the top.
- Shown **only before typing**, under the heading "Recent", and only when the list has **more than 10** items (on a
  short list they are noise). Recent items are **not repeated** in the list below them.
- A stored key that is no longer in the source, or whose item is disabled, is skipped (and dropped on the next write).
- Storage missing or failing (private mode, quota): no recents, no error. The component reads and writes
  through a `NeoRecentsStore` interface provided by a CompositionLocal, so tests use an in-memory store.
- `NeoMultiSelect` has no recents.

**LC-6 · Groups.** `itemGroup(item)` returns a heading or null. Items come in the caller's order; a heading is drawn
whenever the group changes (e.g. account classes "1 Assets", "2 Equity and liabilities"). Headings are not items:
not selectable, skipped by ↑/↓, not counted. Groups show **only before typing**; while typing the list is one ranked
list (LC-2) with no headings. The "Recent" heading is drawn the same way.

**LC-7 · The empty option** (`emptyOption: String?`): one item meaning "no value", always **first** before typing,
muted text in the panel and in the field. Picking it calls `onSelect(null)`. Hidden while typing. One rule for
its wording, by use:

| Use | Wording | Example |
|---|---|---|
| Optional field or cell, nothing applies when empty | "None" | Cost centre "None"; header Default branch "None" |
| Cell or field that falls back to a default when empty | "{default} (default)" | Line branch "Oslo (default)" |
| Single-choice filter | "All {things}" | "All branches", "All cost centres" |
| Required field | **no empty option**; empty shows the placeholder "Select…" | Account |

"Choose" and "No default" are retired.

**LC-8 · Disabled items** (`disabledReason(item)` returns a reason or null). A disabled item is **shown, never
hidden**: label dimmed (`textTertiary`), the reason as its visible second line in `textSecondary` (not dimmed, so it
stays readable), e.g. a closed branch: "Closed on 30 Sep 2026". A protected control account's "Needs a reason to post
here" is a second line (LC-8a), not a disabled reason: that account can be picked. The highlight can land on a disabled item (so the reason is read out);
Enter, Tab or a click on it does nothing and announces "Can't be chosen. {reason}". A tooltip may repeat it on
desktop but is never the only place.

**LC-8a · Second line and meta.** `itemDetail(item)` gives an optional muted second line for an enabled item ("Off",
"Receivables control"); `itemMeta(item)` an optional muted trailing text (the account type). A disabled item's
reason replaces its detail. Labels wrap to two lines in the panel, then ellipsize (review A-9 j).

**LC-8b · Code.** `itemCode(item)` returns a code or null; `showCode` (default: true when `itemCode` is given) shows
it in a monospace column (`NeoSelectTokens.codeColumn`) in the panel and before the label in the field
("1920 Bank deposits"). Items without a code (branches, cost centres, people) show the label only (`showCode = false`).

**LC-8c · Fixed options** (`fixedOptions: List<T>`): a few caller-supplied items (at most 3) that are not part of the
source, e.g. a future "Lines without a branch" filter value. Before typing they come right after the empty option,
above Recent. While typing they are matched and ranked like any item. They are never recorded as recents.
(The rig's `fixed` flag meant "panel pinned to the window"; that is not a parameter here: every panel is pinned, LC-22.)

## 3. Size and server search

**LC-9 · Local lists.** A `Local` source holds the whole list in memory and is allowed up to **500** items (one page of
`GET /accounts?…&size=500`; a chart has ~180). Before typing the panel shows **all** of it, in a virtualised list
(8 rows visible). There is never a silent cut. A `Local` source above 500 items fails a debug assertion: use `Remote`.

**LC-10 · Remote lists.** The screen picks `Remote` when the backend list for that kind is paged or can exceed 500
(customers, suppliers, products, people of a large company). Accounts, branches, cost centres, stock locations and tax
codes are `Local`.
- Before typing: recents (resolved by `byKeys`), then the first page of **50** in source order.
- Typing: a request **250 ms** after the last keystroke (`motion.searchDebounce`), from the first character
  (codes are short). Each request cancels the previous one; a response for an older query is dropped.
- Each page returns `items` and `total` (all matches). When `total > shown`, the last row of the panel is a status
  row: **"Showing 50 of 1,240 — type to narrow"** (numbers grouped as §6 of A1). No infinite scroll in the panel.
- **Loading:** the first load shows three `NeoSkeleton` option rows in the panel (no spinner, no "Loading…" text).
  Later searches keep the previous rows, dimmed, until the answer arrives; the live region says "Searching".
- **Failure:** one inline problem row inside the panel, worded from the page-state table (building-blocks "Load failures
  by cause"), never server text:

| Cause | Row text | Action |
|---|---|---|
| No connection | "You're offline. We couldn't reach NeoERP. Check the connection." | Try again |
| 5xx / unreadable | "Something went wrong. It's not you. Try again in a moment." + mono line "INTERNAL · reference ACC-5031" | Try again |
| 503 service unavailable | "This is temporarily unavailable. A service NeoERP depends on isn't answering." | Try again |
| 403 PERMISSION_DENIED | "You don't have access to this." | none |
| Other refusal | warn tone: "We couldn't search just now." | Try again |

  Try again re-runs the last query. The typed query is kept through failures.
- **No match** (local or remote): "Nothing matches “{query}”." The caller may replace it with a way out
  (`noMatch`); the account picker keeps A1 §4.2.3: "No active account matches. Accounts are added in Chart of accounts."
  (link for holders of Add account).

## 4. Keyboard (desktop, and tablet with a keyboard)

**LC-14 · Where you type.** *Field variant:* opening moves focus to a search field at the top of the panel (sheet on a
phone). *Compact cell variant:* the cell itself becomes the search input while open; the panel has no search field.
This makes the account cell and the tag cells one behaviour.

**LC-15 · Opening (closed field focused).**

| Key | Field variant | Compact cell |
|---|---|---|
| A printable character (not Space, no Ctrl/Cmd/Alt) | Opens with that character in the search | Same |
| ↓ or Alt+↓ | Opens, empty search | Same |
| F4 | Opens, empty search | Same |
| Space | Opens | Opens |
| Enter | Opens | **Not handled**: the grid's meaning applies (A1 §4.2.4) |
| Backspace / Delete | Picks the empty option, if there is one | Same |
| Tab, Esc | Not handled | Not handled |

**LC-16 · While open.**

| Key | Does |
|---|---|
| Typing, Backspace | Edits the query; highlight goes to the first **enabled** match |
| ↓ / ↑ | Moves the highlight; skips headings; lands on disabled items; stops at the ends (no wrap) |
| Page Down / Page Up | Moves 8 items |
| Enter | Picks the highlighted item (if enabled), closes (LC-17) |
| Tab / Shift+Tab | If the person typed or moved the highlight since opening: picks the highlighted item. Otherwise: closes without a change. Then focus moves on as Tab normally would |
| Esc | Closes and keeps the value it had when the panel opened |
| Click outside | Closes without a change; focus goes to what was clicked, else back to the field |
| Home / End | Stay in the search text (caret) |

**LC-17 · Focus after closing.** On every close (pick, Esc, outside click on nothing focusable, scroll) focus returns
to the **field**, never to the page body. `onSelect(item, via)` reports how it was picked
(`NeoPickVia.Enter`, `Tab`, `Click`, `Clear`); the screen may then move focus on. The component never moves focus
anywhere but the field. (Fixes the rig bug in A-2.)

**LC-18 · Grid flow (compact cell inside the A1 line grid; restates A1 §4.2.4 for these cells).**
- **Account cell, picked with Enter:** the editor moves focus to Description (A1 §4.2.4 "Enter | Account picker open").
- **Branch, Stock location, Cost centre cell, picked with Enter:** focus stays on the cell (closed). The next Enter is
  not handled by the cell, so the grid moves to the same column on the next line; on the last filled line it goes to the
  Account cell of the empty "Add a line" row (A1 §4.2.4 "adds a line and focuses its Account").
- **Any cell, picked with Tab / Shift+Tab:** focus moves to the next / previous editable cell; disabled cells are
  skipped (A1 §4.2.4).
- **↓ on a closed cell** opens that cell's panel (every picker cell, the Account cell included; A-2). A1 §4.2.4 gives
  ↓ no row movement, so ↓ never jumps to the next line; moving down is Enter. If the ERP lead wants ↓ to move rows,
  that is an A1 amendment, not a component change.
- **Alt+↓ on the Account cell** opens with an empty query, so the recents show.
- Ctrl/Cmd+Backspace, Ctrl/Cmd+S, Ctrl/Cmd+Enter are never consumed by the component, open or closed.
- Tests: `JournalGridKeyboardTest.focusStaysInGridAfterPickingATag` (CP-A1.2b) and the component tests in §9.

## 5. Accessibility

**LC-27 · Pattern.** Combobox + listbox (WAI-ARIA APG "combobox with listbox popup"), in Compose semantics:
- **Field:** `role = Role.DropdownList`, the visible label (or, in a cell, the accessible label "Line 3 branch") as
  its name, `stateDescription` = the current value ("Oslo (default)", "None", "Not chosen"), expanded/collapsed state
  (`expand`/`collapse` semantics actions), `error(...)` when the field has an error.
- **Search input** (field variant) or the editing cell (compact): text input that keeps keyboard focus while open; its
  name is "Search {label}". The highlighted item is exposed as the input's `stateDescription`
  ("1920 Bank deposits, 3 of 184") and updated on every highlight move: the Compose equivalent of
  `aria-activedescendant`.
- **List:** `collectionInfo(rowCount = items, columnCount = 1)`; each item `collectionItemInfo`, `selected`,
  `onClick` (pick), `disabled()` for a disabled item with the reason in its `contentDescription`
  ("Bergen. Can't be chosen. Closed on 30 Sep 2026"). Headings carry `heading()` and are not items.
- **Multi-select items** are checkbox nodes (`toggleableState`, `Role.Checkbox`) inside the list, the whole row the
  target. No nested label + checkbox pair (the rig's invalid pattern).

**LC-28 · Announced counts.** A polite live region (`liveRegion = Polite`) carries the status of the list, set when the
panel opens and when a search settles: "184 accounts" (caller's `countNoun`), "12 matches", "No matches",
"Showing 50 of 1,240. Type to narrow.", "Searching", or the failure text of LC-10. Multi-select also announces
"{n} selected" after each toggle and "All branches" when the value collapses (LC-35).

**LC-29 · Targets.** Option rows, the field and the sheet's buttons are at least 44 × 44 on touch platforms
(`Platform.isTouchPrimary`); with a mouse, option rows are `NeoSelectTokens.optionRow` (field height, compact).

**LC-30 · Contrast and cues.** Text `textPrimary` on `bgElevated`; second lines, meta, the empty option and the reason
line in `textSecondary` (≥ 4.5:1 on `bgElevated`; asserted by the token contrast test). Only a disabled item's label uses
`textTertiary`. Highlight: `bgHover` fill; when moved by keyboard, also the 1px accent `neoFocusRing` inset, so it never
relies on a fill alone. Chosen item: a check icon, not colour only. Field focus: the single 1px accent border
(screen-standard §1).

## 6. Layout

**LC-20 · Field variant (closed).** screen-standard §8 field: label above, field at field height with one 1px border,
value or placeholder "Select…", chevron; hint below, error replaces the hint. `readOnly` draws the value at full
contrast with no chevron and does not open (ux-principles §6).

**LC-21 · Compact cell variant (closed).** No visible label (the column header is the label); fills the cell; the value
ellipsizes; chevron shown on hover and focus only. The column's `minWidth` is at least `NeoSelectTokens.cellMinWidth`.
A cell the line's account doesn't take shows "—" and is disabled (LC-26).

**LC-22 · Panel placement.**
- Pinned to the window (a Compose `Popup`), so a table's scrolling never clips it.
- Below the field with `panelGap`, left-aligned to it, shifted left as needed to keep `windowGutter` from the edges.
- Height: up to `rowsVisible` (8) items plus the search field and status row.
- **Flip:** if the room below (to the window bottom minus any *bottom obstruction*) is less than the panel needs, and
  the room above is larger, it opens above. Otherwise below, shortened to the room (never under `minRows`, 3).
- **Never under a sticky footer:** a sticky footer (the journal editor's totals bar) registers its height with
  `Modifier.neoBottomObstruction()`; the panel treats it as the window bottom.
- **Scroll:** if the page scrolls (the field moves while the window size is unchanged), the panel closes without a
  change and focus returns to the field.
- **Resize:** a window size change re-places the panel and keeps it open with the query (screen-standard §2: resizing
  never loses state).

**LC-23 · Panel width.** `max(field width, panelMinWidth)`, at most `panelMaxWidth` and the window minus two gutters.
`panelMinWidth` is 300 for items without codes and 400 with codes (`NeoSelectTokens.panelMinWidth`,
`panelMinWidthWithCode`). A compact cell's panel is therefore wider than its cell.

**LC-24 · Phone sheet.** When the window is narrower than `NeoSelectTokens.sheetBelow` (600, the `NeoSidePanel`
full-screen threshold), opening shows a full-height bottom sheet instead of the panel:
- Top bar: the field's label as the title; on the right **Close** (✕, single) or **Done** (multi).
- Then the search field, focused with the keyboard up, unless the list has no search (LC-33).
- Then the list (same content and order as the panel), 44 rows, the chosen item scrolled into view.
- Multi: a bottom bar with "Select all" and, when something is chosen, "{n} selected · Clear".
- System back, swipe down and Close close without a change (single). Insets: safe area and IME respected.
- After closing, accessibility and keyboard focus return to the field.

**LC-25 · Labelled fields on phone line cards (A-7).** Where a grid becomes cards, every select in a card uses the
field variant with its visible label (Branch, Stock location, Cost centre); never an unlabelled compact cell.

**LC-26 · A field that can't be used, and why (A-7).** `disabledReason: String?` on the field.
- Field variant: the reason is the visible hint line under the field ("Not tagged by cost centre").
- Compact cell: shows "—"; skipped by Tab (A1 §4.2.4); the reason is in the cell's semantics
  ("Line 2 cost centre, not available. This account isn't tagged by cost centre.") and in a hover tooltip.
- Phone cards: field variant, so the reason is visible.

## 7. `NeoMultiSelect`

**LC-31 · Closed field: summary text, not chips.** One line, never wraps:
- nothing chosen: the `allLabel` in muted text ("All branches") for a filter, or the placeholder "None" in a form;
- 1 or 2 chosen: their labels, ", " between ("Oslo, Bergen"), if they fit the field;
- otherwise: the count with the caller's noun, `countLabel(n)` → "3 branches".
Chips don't fit a 36-high toolbar control; a count is stable as the window narrows. (building-blocks' "Pool, Gym +3"
example is retired.)

**LC-32 · Open.** Search at the top (LC-33), then the top row, a divider, one checkbox row per item (groups and second
lines as LC-6, LC-8a; disabled items as LC-8, never tickable), then a footer when something is chosen:
"{n} selected" and **Clear**.
- **Filter** (`allLabel` given, none means all): the top row is "{allLabel}" with a checkbox, ticked while nothing is
  chosen; ticking it clears the choice. While a search is typed, the top row becomes **"Select all shown ({n})"**:
  it ticks every enabled shown item.
- **Form** (`allLabel` null): the top row is **"Select all"** (or "Select all shown ({n})" while searching), tri-state:
  ticked when all enabled shown items are ticked, mixed when some; ticking a ticked or mixed row unticks the shown ones.

**LC-33 · Search shown** when the list has more than 10 items or is `Remote` (`search = Auto`); a screen may force it on
for a data list (building-blocks Q5). Short fixed lists (Account types, Status) have no search.

**LC-34 · Keys.** ↓/↑ move; **Space** toggles the highlighted item when the last key was an arrow (right after typing a
character it types a space); **Enter** toggles too and keeps the panel open; Esc and Tab close; focus returns to the
field (LC-17). Opening keys as LC-15 (field variant).

**LC-35 · None = all.** For a filter, an empty value means all. When every item is ticked (and none is disabled) the
value collapses to empty and the field reads "All branches"; this keeps a saved filter open to items added later.

**LC-36 · Apply immediately.** Each tick calls `onChange` at once; there is no Apply button and Esc does **not** undo
ticks. Why, for report filters: it is the existing rule (building-blocks "a filter applies as you tick"; A2 §4.1 "no
Apply button", 300 ms debounce); the A2 reload already keeps the previous figures greyed, so a run of ticks costs one
reload after the debounce, not one per tick; and there is never a hidden pending state that is lost when the panel is
dismissed by a scroll or Back. In a form the value is saved with the form, as today.

## 8. Component API (Kotlin, `designsystem/components/NeoSearchSelect.kt`, `NeoMultiSelect.kt`)

```kotlin
/** Where the items come from. Local ≤ 500 items (LC-9); Remote searches on the server (LC-10). */
sealed interface NeoSelectSource<out T> {
    data class Local<T>(val items: List<T>) : NeoSelectSource<T>
    class Remote<T>(
        val search: suspend (query: String, limit: Int) -> NeoSelectPage<T>, // query "" = first page; LC-1 on the server
        val byKeys: suspend (keys: List<String>) -> List<T>,               // resolves recents and the chosen item
    ) : NeoSelectSource<T>
}
data class NeoSelectPage<T>(val items: List<T>, val total: Int)
// Remote failures are thrown as the app's load-failure type and mapped with the page-state cause table (LC-10).

enum class NeoPickVia { Enter, Tab, Click, Clear }
enum class NeoSelectSearch { Auto, On, Off }

@Stable class NeoSelectState { /* open, query, highlight, typedOrMoved; hoistable, saveable */ }
@Composable fun rememberNeoSelectState(): NeoSelectState

@Composable
fun <T> NeoSearchSelect(
    label: String,                         // visible label; the panel/sheet title; "Search {label}"
    source: NeoSelectSource<T>,
    itemKey: (T) -> String,
    itemLabel: (T) -> String,
    selected: T?,                          // hoisted value; null = empty option or nothing
    onSelect: (T?, NeoPickVia) -> Unit,    // null = the empty option was picked
    modifier: Modifier = Modifier,
    itemCode: ((T) -> String?)? = null,
    showCode: Boolean = itemCode != null,
    itemGroup: ((T) -> String?)? = null,
    itemDetail: ((T) -> String?)? = null,
    itemMeta: ((T) -> String?)? = null,
    itemKeywords: ((T) -> String?)? = null,
    disabledReason: ((T) -> String?)? = null,
    emptyOption: String? = null,           // LC-7 wording
    fixedOptions: List<T> = emptyList(),   // LC-8c
    placeholder: String = NeoSelectCopy.PLACEHOLDER, // "Select…"
    countNoun: (Int) -> String = NeoSelectCopy::items, // "184 accounts" for LC-28
    noMatch: (@Composable (query: String) -> Unit)? = null,
    hint: String? = null,
    error: String? = null,
    enabled: Boolean = true,
    fieldDisabledReason: String? = null,   // LC-26
    readOnly: Boolean = false,
    compact: Boolean = false,              // table-cell variant (LC-14, LC-21)
    accessibleLabel: String = label,       // "Line 3 branch" in a cell
    recentsKey: String? = null,            // LC-5 kind; company comes from LocalNeoCompanyScope
    state: NeoSelectState = rememberNeoSelectState(),
    testTag: String = "neoSelect.$label",
)

@Composable
fun <T> NeoMultiSelect(
    label: String,
    source: NeoSelectSource<T>,
    itemKey: (T) -> String,
    itemLabel: (T) -> String,
    selected: List<T>,                     // empty = none (= all when allLabel is set)
    onChange: (List<T>) -> Unit,           // called on every tick (LC-36)
    countLabel: (Int) -> String,           // "3 branches"
    modifier: Modifier = Modifier,
    allLabel: String? = null,              // "All branches": filter semantics (LC-32, LC-35)
    search: NeoSelectSearch = NeoSelectSearch.Auto,
    itemCode: ((T) -> String?)? = null, showCode: Boolean = itemCode != null,
    itemGroup: ((T) -> String?)? = null, itemDetail: ((T) -> String?)? = null,
    itemKeywords: ((T) -> String?)? = null, disabledReason: ((T) -> String?)? = null,
    hint: String? = null, error: String? = null,
    enabled: Boolean = true, readOnly: Boolean = false,
    state: NeoSelectState = rememberNeoSelectState(),
    testTag: String = "neoMultiSelect.$label",
)
```

**State hoisting.** The **value** (`selected`) belongs to the view model; the component never keeps its own copy.
The **transient state** (open, query, highlight) is `NeoSelectState`. A screen that changes layout with width (grid ↔
cards, toolbar ↔ sheet) creates the state above the width branch (screen-standard §2), so a resize never closes the
panel or loses the query. Matching, ranking, recents and the multi-select rules are plain functions in
`designsystem/select/` (`NeoSelectMatcher`, `NeoSelectList`, `NeoRecentsStore`, `NeoMultiSelectRules`), so they are
unit-tested without Compose.

**Shared item builders.** One concept, one pattern: Accounts provides `accountSelectItem` lambdas once
(`features/accounts/.../AccountSelect.kt`: code, name, group = class heading, meta = type, detail = control tag or "Off",
keywords = local name, disabledReason where a screen needs it) and every account picker uses them.

**Tokens** (`NeoComponentTokens.select`, ux-principles §10): `panelMinWidth` 300, `panelMinWidthWithCode` 400,
`panelMaxWidth` 560, `panelGap` 4, `windowGutter` 12, `rowsVisible` 8, `minRows` 3, `optionRow` (field height compact;
44 on touch), `groupHeaderHeight` 28, `codeColumn` 64, `cellMinWidth` 120, `sheetBelow` 600, `localMax` 500,
`remotePageSize` 50, `recentsMax` 10, `recentsFromItems` 11, `searchFromItems` 11, `summaryLabelsMax` 2; and
`motion.searchDebounce` 250 ms. Values are the rig's; names are fixed by this contract.

**Copy** (`NeoSelectCopy`): "Select…", "Recent", "Nothing matches “{q}”.", "Showing {n} of {total} — type to narrow",
"Select all", "Select all shown ({n})", "{n} selected", "Clear", "Close", "Done", "Can't be chosen. {reason}",
"Search {label}". No other strings in the component.

**Test tags** (`NeoSelectTestTags`, built from `testTag`): field `{tag}`, panel or sheet `{tag}.panel`, search
`{tag}.search`, item `{tag}.item.{key}`, empty option `{tag}.item.__empty`, heading `{tag}.group.{name}`, status row
`{tag}.status`, retry `{tag}.retry`, select-all row `{tag}.all`, clear `{tag}.clear`, close/done `{tag}.close`.
Screens pass stable tags, e.g. `journal.line.3.branch`.

**Previews** (`NeoSearchSelectPreviews.kt`, `NeoMultiSelectPreviews.kt`) use the shared fixtures `NeoSelectFixtures`
(Kystgruppe's 184 accounts with classes and local names; branches Oslo, Bergen, Trondheim, Tromsø, Bærum, Göteborg;
cost centres incl. "Butikkdrift"; one closed branch) and show every state listed for screenshots in §9.

## 9. Tests the builder writes in CP-A1.2a

**Unit (`commonTest`)**
| Test | Proves |
|---|---|
| `NeoTextFoldTest.foldsCaseAccentsAndNordicLetters` | Kafé, Tromsø, Bærum, Åsane, Göteborg, Straße, İ (LC-1) |
| `NeoTextFoldTest.indexMapPointsBackToOriginal` | æ→ae highlight ranges (LC-3) |
| `NeoSelectMatcherTest.codeMatchesByPrefixOnly` | "19" finds 1920; "92" doesn't (LC-1) |
| `NeoSelectMatcherTest.everyWordMustMatch` | "1920 bank", "bank 1920" (LC-1) |
| `NeoSelectMatcherTest.keywordsMatchButDetailMetaAndGroupDont` | local name yes; "Off", type, class no (LC-1) |
| `NeoSelectMatcherTest.ranksExactCodePrefixLabelStartWordStartContains` | the five tiers, then source order (LC-2) |
| `NeoSelectListTest.recentsFirstNotRepeatedOnlyAboveTenItems` | LC-5 |
| `NeoSelectListTest.recentsSkipMissingAndDisabled` | LC-5 |
| `NeoSelectListTest.emptyThenFixedThenRecentThenGroupsBeforeTyping` | LC-6, LC-7, LC-8c |
| `NeoSelectListTest.typingDropsGroupsAndEmptyOption` | LC-6, LC-7 |
| `NeoSelectListTest.highlightSkipsHeadingsLandsOnDisabledRefusesPick` | LC-8, LC-16 |
| `NeoRecentsStoreTest.tenPerCompanyAndKindMostRecentFirst` | LC-5 |
| `NeoRecentsStoreTest.storageFailureMeansNoRecents` | LC-5 |
| `NeoSelectRemoteTest.debounces250AndDropsStaleAnswers` | LC-10 |
| `NeoSelectRemoteTest.showsShowingNOfTotalOnlyWhenTruncated` | LC-10 |
| `NeoSelectRemoteTest.failureRowsFollowPageStateCausesAndRetry` | LC-10 |
| `NeoMultiSelectRulesTest.selectAllShownSkipsDisabled` | LC-32 |
| `NeoMultiSelectRulesTest.allTickedCollapsesToNoneOnlyWithoutDisabled` | LC-35 |
| `NeoMultiSelectRulesTest.summaryTwoLabelsThenCount` | LC-31 |
| `NeoSelectPlacementTest.flipsAboveRespectsObstructionAndWidthRules` | LC-22, LC-23 |

**UI (`jvmTest`, Compose UI test)**
| Test | Proves |
|---|---|
| `NeoSearchSelectKeyboardTest.printableDownAltDownF4SpaceOpen` | LC-15 |
| `NeoSearchSelectKeyboardTest.enterPicksAndFocusReturnsToField` | LC-16, LC-17 (A-2) |
| `NeoSearchSelectKeyboardTest.escAndOutsideClickKeepValueAndFocus` | LC-16, LC-17 |
| `NeoSearchSelectKeyboardTest.tabPicksOnlyAfterTypingOrArrow` | LC-16 |
| `NeoSearchSelectKeyboardTest.backspaceOnClosedFieldPicksEmptyOption` | LC-15 |
| `NeoSearchSelectGridTest.enterOnClosedCellIsLeftToTheGrid` | LC-15, LC-18 |
| `NeoSearchSelectGridTest.tagCellKeepsFocusAfterPickThenEnterMovesDown` | LC-18 (A-2), on a three-row fake grid |
| `NeoSearchSelectGridTest.gridShortcutsNeverConsumed` | LC-18 |
| `NeoSearchSelectPlacementTest.closesOnScrollStaysOpenOnResize` | LC-22 |
| `NeoSelectSemanticsTest.comboboxStateHighlightCountAndDisabledReason` | LC-27, LC-28, LC-8, LC-26 |
| `NeoMultiSelectKeyboardTest.spaceAfterArrowAndEnterToggleEscKeepsTicks` | LC-34, LC-36 |
| `NeoSelectSheetTest.phoneSheetTitleSearchFocusBackCloses` | LC-24 |

**Screenshots** (`NeoSelectScreenshotTest`, 1440 and 390, screen-standard §9):
closed field (placeholder; value with code; empty option muted; "Oslo (default)"; error; readOnly; disabled with reason);
compact cell in a three-row grid (value, "—" disabled, focused); open before typing (empty option, Recent, groups);
open while typing (highlights incl. "Tromsø" for "tromso"); no match; disabled item with reason; remote first load
(skeleton rows); remote "Showing 50 of 1,240"; remote failure (offline, 5xx with reference); panel flipped above a
sticky footer; phone sheet single and multi; multi closed ("All branches", "Oslo, Bergen", "3 branches"); multi open
(filter top row ticked; searching with "Select all shown (2)"; footer "2 selected · Clear"). Plus a width sweep of a
form with both fields, 320–1440 in 20dp steps.

## 10. Migration

| When | Screen | Change |
|---|---|---|
| CP-A1.2a | Design system | Build both components, tokens, copy, `NeoRecentsStore`, `Modifier.neoBottomObstruction`, fixtures, §9 tests. No screen changes. |
| Before CP-A1.2b | Screen Rig (Accounts lead) | `A2SearchSelect`, `A2MultiSelect` and `AjAccountCell` follow this contract; one account picker; design-index demo shows the branch filter as a searchable single filter (B-1). |
| CP-A1.2b | A1 journal editor | Account cell: compact, account items, `recentsKey = "accounts"`; editor moves focus to Description on Enter. Branch, Stock location, Cost centre cells: compact, empty option per LC-7, "—" with `fieldDisabledReason`. Default branch and Default cost centre: field variant, empty option "None". Footer registers `neoBottomObstruction`. Phone line cards: labelled field variant (LC-25). Test `JournalGridKeyboardTest.focusStaysInGridAfterPickingATag`. |
| CP-A1.2b | A1 journals list | Type filter: `NeoMultiSelect(allLabel = "All types")`, no search. Source stays a plain dropdown (two choices). |
| CP-A1.2b (Accounts lead to confirm scope) | A0 screens | Used for account pickers and the Change dialog, Add account → Under: `NeoSearchSelect` with the shared account items. Chart of accounts Type and Tax codes Tax authority filters: `NeoMultiSelect`. |
| CP-A2.2 | A2 trial balance, general ledger (and A3 P&L when built) | Branch and Cost centre filters: `NeoSearchSelect` with "All branches" / "All cost centres" (single choice: the contract takes one branch). GL Account: the shared account picker incl. inactive accounts with detail "Off". TB Account types: `NeoMultiSelect`, no search. |
| ERP lead decides | Org, IAM, platform screens | Data lists chosen with `NeoSelect` today (roles, people, branches of a company, companies) move to `NeoSearchSelect`; status filters stay `NeoFilterSelect`. Order and checkpoints are the ERP lead's. |

**Amendments this needs** (Accounts lead writes them after approval):
- A1 §4.2.3: matching and ranking per LC-1/LC-2; groups by class before typing; recents per LC-5; the panel per LC-22.
- A1 §4.2.4: add ↓ and F4 open, Tab commit per LC-16, focus after a tag pick per LC-18.
- A1 §4.2.2 row 7: Stock location is a searchable cell (review A-9 i).
- A2 §4.1, §4.3, §4.4: Branch and Cost centre are `NeoSearchSelect` with "All …" (review B-1).
- building-blocks "Choosing from a list": replace the two component bullet lists with §1–§9; drop "Pool, Gym +3".
