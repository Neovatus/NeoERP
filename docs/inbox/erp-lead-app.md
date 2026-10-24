# Inbox: erp-lead-app

Append-only. Only the lead writes briefs here (protocol §3). The main marks items done in `erp-lead-app.done.md`.
Handover: docs/handover/main-agent-handover.md

---

## 2026-10-24 · ERP-243 · From: Code · ERP lead (trial) · REQUEST · → Codex · ERP App · App shared design-system fixes (Jabran: pause lifted for this app work)
Needs answer by: — · Blocking: walking Accounts flow 1 with Jabran
Audit: `NeoERP-App/docs/design/reviews/app-shared-audit-2026-10-24.md` (read it first; file:line evidence there). Repo `NeoERP-App`, branch `dev-app`. **Persistent copy:** `/Users/jabransiddiqui/Offices/Neovatus/builds/app-shared-1` as a git worktree of the NeoERP-App repo (never /tmp, never Jabran's checkout, which runs Hot Reload); bundle after each commit.
**Do, in this order, one commit each:**
1. **Field focus:** tokens `focusField` (#525252 light / #A3A3A3 dark) and `focusRingSoft` (rgba 10,10,10,.14 / 250,250,250,.18) in `designsystem/tokens` (match `docs/design/design-system/neoerp-tokens.json` focus/field and ringSoft); one shared field-border helper (1 px focusField border + 3 px soft halo, no extra ring) used by NeoTextField, NeoForm fields, NeoSearchInput, list-control inputs, selects, NeoDateField, chip input and the journal editor's raw inputs (`JournalEditorInputs.kt:70,131`). Replace Material's 2 dp focused border.
2. **Context in the top bar:** a company · country · currency context chip in `NeoSmartTopBar` (reads the active company from the session; opens the existing company switcher). Then remove country/currency from Accounts' `factLine` (`AccountsRoute.kt:754,1018-1024`) and the repeated "Amounts in {currency}" captions (e.g. `TrialBalanceScreen.kt:255`); keep fiscal year/period where it's the page's own fact.
3. **Top-bar touch sizing** from `neoTouchFloor()` (touch platforms only), not `isMobileOrBelow(width)`; fix the `density/$touchFloor` description in neoerp-tokens.json.
4. **Responsive actions API:** `NeoPageHeader(actions: List<label, icon, variant>)` (no hard-wired Plus; supports danger and a "More" overflow); `NeoButton(iconOnly = …)` for every variant with tooltip and accessible name = label; `NeoIconButton` secondary and danger variants. Migrate existing call sites.
5. **Focus ring 2 px with offset** for borderless controls (keyboard only); move the dp/sp literals of NeoFilePickerField, NeoSpotState, NeoOfflineStrip, NeoViewport, NeoSpotIllustration into tokens (and the hard-coded "Retry" into strings); make `NeoButton.fullWidth` internal to the file component and fix its 9 feature call sites (normal-size buttons).
**Checks (Jabran, 2026-10-24): no new screenshot tests; Jabran reviews the screens himself.** Run only: JVM compile + Android compile, and the existing tests of the changed modules (designsystem, shell, accounts) — report counts. No push; report ERP-C-n with commits, files touched and a short "what to look at" list for Jabran (screens where each fix shows).
Report to `docs/inbox/erp-lead.md` as **ERP-A-n**.

## 2026-10-24 · ERP-245 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-243 · Work in Jabran's main app checkout (Jabran)
1. Jabran wants to see each change and its impact live: work **directly in `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/NeoERP-App` on branch `dev-app`**, not a worktree. Hot Reload may be running there and will pick up your edits.
2. Because of that: **no Gradle test runs in this checkout while Hot Reload runs** (they break each other). Compile checks only (`:composeApp:compileKotlinJvm`, `:composeApp:compileDebugKotlinAndroid`); if a test run is needed, ask first. Never stop or start Jabran's app or services.
3. Touch only the files of ERP-243; leave other uncommitted files alone (e.g. `docs/agents/hrp-des-2/plan.md` is HRP's). One commit per fix (git identity per the handover, no trailers), then a short note of what changed on screen so Jabran can look. Don't push.

## 2026-10-24 · ERP-246 · From: Code · ERP lead (trial) · DECISION · Reviews for UI work (Jabran)
1. **UI and design-system changes need no independent review per change.** Jabran reviews the screens; I check your report. Finish the current review if it's already running, then for the rest: compile, commit, report with the "what to look at" list.
2. Independent (Opus) reviews stay mandatory only for critical parts: money/tax/payroll calculations, posting, auth/security, tenant isolation, data-changing migrations.
3. Compile memory: sequential, one worker, is fine; don't change Jabran's Gradle settings.

## 2026-10-24 · ERP-247 · From: Code · ERP lead (trial) · FYI · neoerp-workflow skill now has a UI lane
1. `NeoERP-App/.agents/skills/neoerp-workflow/SKILL.md` (and the .claude copy) now has a **UI lane**: short plan, change, compile, commit, report with "what to look at"; no Advisor Gates, no separate Reviewer (commit 133d272d on dev-app). ERP-243 runs in that lane. If a fix turns out to change behaviour, permissions, session or wiring, switch to the full pipeline and tell me.
2. Also added: never read PROJECT-STATE*.md (state = inbox, done file, plan.md).

## 2026-10-24 · ERP-248 · From: Code · ERP lead (trial) · DECISION · Field focus: one line, no halo (Jabran)
Needs answer by: — · Blocking: Jabran's review of ERP-A-1 · UI lane
1. Jabran: the focused field reads as a double line (inner soft band from `neoFieldBorder` + the 1 dp border, e.g. journal Memo). **Decision: focus = the border alone changes to `focusField` (#525252 / #A3A3A3), 1 dp → 1.5 dp, no halo, nothing else drawn.** Errors keep the danger border; disabled unchanged.
2. Remove the halo from `NeoFieldBorder.kt` (keep `focusRingSoft` token only if something else uses it; otherwise remove it and its JSON entry note). Compile, commit, report ERP-A-2 with where to look (journal Memo, any search/select/date field).

## 2026-10-24 · ERP-250 · From: Code · ERP lead (trial) · DECISION · Priority · Top-bar context chip: place and content (Jabran)
Needs answer by: — · Blocking: Jabran's review of ERP-A-1 · UI lane
Jabran's screenshot (Companies page): a wide box left of search shows "Org d3300000 … NO · NOK". Match the agreed design (rig top bar):
1. **Place:** on the **right**, immediately before the bell and avatar; compact text, not a field-like box; never left of search.
2. **Content, two short lines:** line 1 "{company name} · {country name} · {currency}" (e.g. "Kystgruppe Nordic · Norway · NOK"); line 2 "{person name} · {role}". Country as its localized name, never the ISO code.
3. **Never a raw id:** while the name loads show a short skeleton/"Loading…"; if it can't load, show nothing rather than "Org d…".
4. **No company in context** (platform pages such as Companies for platform staff): hide line 1, or show "All companies"; never a placeholder company.
5. Click opens the existing company switcher; keyboard reachable with an accessible name "Company: {name}, change company".
6. Narrow widths: line 2 hides first, then line 1 shortens to the company name with ellipsis; it never pushes search off or overlaps.
Compile, commit, report ERP-A-n with where to look (a company page and the Companies page, wide and narrow).

## 2026-10-24 · ERP-251 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-250 · Reference and badge
1. Jabran confirmed the target: the rig top bar exactly (right side, "**Kystgruppe Nordic** · Norway · NOK" with the company name bold, line 2 "Ingrid Hansen · Owner", then bell, then avatar).
2. Notification badge sits at the bell's top-right corner, outside the glyph, never covering it.

## 2026-10-24 · ERP-252 · From: Code · ERP lead (trial) · REQUEST · Combined fix list from Jabran's live review of ERP-A-1 (supersedes the open parts of ERP-248, ERP-250, ERP-251)
Needs answer by: — · Blocking: Accounts flow 1 · UI lane, work in Jabran's app checkout (ERP-245), one commit per item, compile only, report ERP-A-2 with "what to look at"
1. **Field focus: one line, no halo** (ERP-248). On focus only the border changes: `focusField` (#525252 light / #A3A3A3 dark), 1 dp → 1.5 dp. Remove the inner halo from `NeoFieldBorder.kt`; drop `focusRingSoft` if nothing else uses it. Errors keep the danger border; disabled unchanged. Look: journal Memo, any search/select/date/chip field.
2. **Top-bar context: match the Design Review Hub exactly** (ERP-250, ERP-251; reference = rig top bar).
   - Right side, immediately before the bell and avatar; compact text, no field-like box, never left of search.
   - Line 1 "**{company name}** · {country name} · {currency}" (company bold, country written out, e.g. "Kystgruppe Nordic · Norway · NOK"); line 2 "{person} · {role}".
   - Never a raw id ("Org d3300000"): skeleton while loading, nothing if it can't load.
   - No company in context (platform pages, e.g. Companies): hide line 1 or show "All companies".
   - Click/Enter opens the company switcher; accessible name "Company: {name}, change company".
   - Narrow: line 2 hides first, then line 1 shortens to the company name with ellipsis; never pushes search off or overlaps.
   - Notification badge at the bell's top-right corner, outside the glyph.
3. **Entry grid (journal lines now; one shared pattern for every line grid later: invoices, bills, payroll one-offs).** Build it as a shared component/modifier in `designsystem` and use it in the journal lines editor:
   - Faint column dividers + a light bottom line per row, so the grid is visible.
   - Editable cells show a field box on hover; on focus the same one-line focus as item 1.
   - Placeholders in every empty editable cell: "Number or name", "Description", "0.00" (Debit, Credit).
   - Select cells (Branch, later tax code) show a ▾ and "None" in muted text.
   - Amounts right-aligned, tabular figures.
   - Delete-line icon shows on row hover/focus, not as a boxed button on every row; keyboard reachable.
   - Header count "Lines · n" counts the real lines (it shows 0 while rows exist).
   - Keep the existing keyboard behaviour (Tab across, Enter down/adds a line, ↓ opens a list, = fills the balancing amount).
4. Report ERP-A-2: commits, files, and per item the screens to look at. Don't push.

## 2026-10-24 · ERP-253 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-252 item 1 · Focus colour medium-dark grey (Jabran)
1. `focusField` = **#737373** light (4.7:1 on white, 4.0:1 against the resting #ECECEC border) and **#8C8C8C** dark, at 1.5 dp, one line, no halo. #525252 read as near-black.
