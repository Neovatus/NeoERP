# Inbox: erp-lead-design

Append-only. Only the lead writes briefs here (protocol §3). The main marks items done in `erp-lead-design.done.md`.
Handover: docs/handover/main-agent-handover.md

---

## 2026-10-21 · ERP-156 · From: Code · ERP lead (trial) · REQUEST · → ERP · Design · Brief 1: the Design Review Hub (slices 1–5)
Needs answer by: — · Blocking: no
**You are ERP · Design** (model: **Sonnet**; Opus only for a fresh review before you report). Read `docs/handover/main-agent-handover.md` (§1 reading order incl. `design-principles.md` and `ux-principles.md`; rig rules), then this brief. Jabran's decision (2026-10-21, erp-lead-decisions.md "Design review approach"): **the Screen Rig works like the product.** Report to `docs/inbox/erp-lead.md` with ids `ERP-D-n`.

**Scope: rig root only.** New block `rig-hub.jsx`; the root inline block (anchor `const TWEAK_DEFAULTS`, ~line 59279 of `app.html`); `shell.jsx` (Sidebar/Topbar); `data.jsx`. **Never change a module block** (accounts-*, hr-*, hr3-*, payroll-*, ess-*): those belong to the Accounts and HR & Payroll leads. Re-read `app.html` just before writing; replace only your blocks; check the 60 module block hashes are unchanged. Babel: no object-rest destructuring.

**Slice 1 · View-as bar** (~300 lines): pinned `ViewAsBar` [Company ▾][Role ▾][Design] on every route (sticky; `--rig-bar-h`; hidden in frame mode with `@bar=0`). `RIG_PERSONAS` in data.jsx: company → role → `{name, keys:{ac, hr, pay, essPid}}`, names read from `AC_ORG.people` / `HR_PERSONAS` / `PAY_PERSONAS` / `ESS_PERSONS` (never copied). Roles: Owner, Finance Manager, Accountant, HR Admin, Payroll Admin, Payroll Approver, Manager, Employee, Neovatus staff. `rigViewAs(cid, role)`: set `HR_RIG.persona`, `PAY_RIG.persona`, `acState(cid).viewer`, bump `HR_GEN` / `payBumpGen()` / `acBumpGen(cid)`, set `window.__rigSession`; `rigKeepRoute` keeps the module and tab when the new company/role can see it (drop company-specific ids such as EMP-, RUN-, PS-, journal ids), else that role's home (Neovatus → `#dashboard`). A null persona → **"Shown as Owner"** marker; no key at all → module hidden. localStorage `neoerp.rig.viewAs` with try/catch; a hash company beats the stored one; default Kystgruppe · Owner. Retire `TWEAK_DEFAULTS.viewer`; `isSuperAdmin` = role neovatus. The company shows its language as a label only (all rig text is English for now).
**Slice 2 · Home** `#home:<cid>|<role>` "Waiting for you" (ux §11) from `ajSummary(...).waitingForYou`, `hr3ApprovalCount` / `Hr3InboxCard`, `payOverviewCards`, `essWaitingFor` / `EssWaitingCard`; counts + one-click routes; company formats; the Owner marker.
**Slice 3 · Sidebar/Topbar** read `__rigSession`: Platform Admin only for Neovatus staff; modules from MOCK `modules` ∩ data ∩ role (`acMe().read`, HR codes, `payShowSidebar`, ESS person). The Topbar shows company · person · role (ux §17).
**Slice 4 · Catalogue** `#designs` / `#designs:<module>`: module → feature → screen cards from adapters over `A3_DESIGNS` + `AT_DESIGNS`, `HR_DESIGNS` + `HR3_DESIGNS`, `PAY_DESIGNS`, plus a `ROOT_DESIGNS` table built from the root's Tweak buttons; status Draft / Ready for review / Approved mapped from the group strings; spec links; search and filters (module, country, status). The Tweaks panel keeps Appearance only.
**Slice 5 · Frame view** `#frame:<w>|<hash>`: one iframe, width buttons **1440 · 1280 · 1024 · 768 · 390** (change width without reload), a state picker (empty, loading, error, read-only, no access, offline) through a root `hashchange` listener and an `@options` suffix (e.g. `@load=empty&persona=neovatus`) passed to `hrOpenDesign` / `payOpenDesign` / `acState`.
**Shared demo data (decided by me):** in `data.jsx` MOCK.COMPANIES, add **Kyst Danmark ApS (DK)**, **Kyst Suomi Oy (FI)** and **Kyst Ísland ehf. (IS)**, matching the backend demo seed, and give **Stockholm Handel** `hrms` + `pay`. Where a module block still uses other FI/IS names (Helsinki Kauppa Oy, Reykjavík Fisk / reykjavikverslun), map them in `RIG_PERSONAS` and list the mismatches in your report (the leads rename at their next touch). The duplicate "Nadia Iqbal" (Sialkot Finance Manager vs Lahore's ended employee): list it for the Accounts lead.
**Later, slice 6 (docs only):** write `rigRegister({module, spec, designs, personas.apply, waiting, keepRoute, strings})` for the module leads.
**Tests:** reuse the HR & Payroll headless Playwright harness (local React 18.3.1 / Babel 7.29.0 packs). Every company × role from each module's open page lands as the rules say; every sidebar item routes; every catalogue row opens; 1440/1280/1024/768/390 with zero console errors and no horizontal overflow; reload restores the choice; a cleared store gives Kystgruppe · Owner; the bar never hides a page's main action (ux §16, count `--rig-bar-h`).
**Process:** plan first in `NeoERP-App/docs/agents/rig-hub/plan.md`; build slice by slice; report after slice 1 so Jabran can try it; then continue. Update `screen-rig/README.md` with how to open and use the hub. Commit docs-only (rig) with Jabran's identity, no trailers, named paths only; don't push. Start the listener: `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh erp-lead-design`.

## 2026-10-21 · ERP-157 · From: Code · ERP lead (trial) · Amends: ERP-156 · Check every slice in the browser pane
Needs answer by: — · Blocking: no
1. Use the Claude Code built-in browser pane to work on and verify the rig. Serve `NeoERP-App/docs/design/screen-rig/` over a local static server (a `.claude/launch.json` entry, e.g. `python3 -m http.server` on a free port, started with `preview_start`), not `file://`: the frame view needs same-origin iframes.
2. For every slice, before you report: open the routes, switch every company × role, resize to 1440 / 1280 / 1024 / 768 / 390, take a screenshot per width of the home and one module page, check the main action is above the fold, and read the console (zero errors). The headless Playwright run stays as the automated check.
3. In your report, give Jabran the local URL and two or three hash links to try.

## 2026-10-21 · ERP-158 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-D-1. Slice 1 accepted; go on with slice 2
Needs answer by: — · Blocking: no
1. **Slice 1 accepted:** 288/288 view-as matrix, widths clean, 59/60 blocks unchanged as intended. Commit `.claude/launch.json` in the workspace repo (`Neovatus/NeoERP`, docs-only commit, Jabran's identity).
2. (a) Agreed: module rig bars may disagree with the View-as bar until slice 5 passes the persona through `@options`; hide or grey the module rig bars' persona pickers when a View-as session is set, if it's a root-only change.
3. (b) **Role → module mapping confirmed:** Finance Manager and Accountant: Accounts plus Payroll read-only (totals, as E-decisions say); HR Admin: HR; Payroll Admin and Approver: Payroll; Manager: HR (My team) **plus ESS for themselves**; Employee: ESS where linked; Owner: everything the company has; Neovatus staff: Platform plus read-only module views.
4. (c) **Names follow the backend demo seed** (`scripts/seed-demo-tenants.sql`): display names **Kyst Danmark ApS**, **Kyst Suomi Oy**, **Kyst Ísland ehf.** (legal names may keep the suffix). Fix MOCK in data.jsx now (keep the ids kystdk / hki / reyk, so module blocks keep working); the leads rename their module data at their next touch (I'm telling them). Sialkot Mills (Pvt) Ltd is fine as a legal name.
5. Next: slice 2 (Home), then 3–5, reporting after each as before.

## 2026-10-21 · ERP-161 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-D-2. Slice 2 accepted
Needs answer by: — · Blocking: no
1. **Accepted.** (a) Keep `ajMe(cid)`. (b) Keep your own cards (one look for every module's "waiting" card is right per ux §1). (c) Passed to the Accounts lead.
2. Go on with slice 3 (Sidebar/Topbar), then 4–5.

## 2026-10-21 · ERP-163 · From: Code · ERP lead (trial) · Amends: ERP-156 · Priority: next · Speed up: slices 3 and 4 in parallel, one report at the end
Needs answer by: — · Blocking: no
1. Jabran wants the hub sooner. Build **slice 3** (Sidebar/Topbar in `shell.jsx`) and **slice 4** (catalogue: put it in a **new root-owned block** `rig-catalogue.jsx`, so the two don't share files) **in parallel** with two sub-agents (Sonnet), each owning only its files. Then **slice 5** (frame, widths, states, the root `hashchange` listener) after both are in.
2. **Don't stop for my acceptance between slices.** Run the combined test pass (view-as and home matrices, sidebar routes, catalogue rows, widths, zero console errors) after slice 5, take the browser-pane screenshots, then send **one** report covering 3–5.
3. Quality rules unchanged: re-read app.html before writing, only your blocks, module block hashes unchanged, one Opus review of the finished hub before you report.

## 2026-10-21 · ERP-164 · From: Code · ERP lead (trial) · Amends: ERP-163 · Priority: next · In order, not parallel
Needs answer by: — · Blocking: no
1. Jabran prefers **slices 3 → 4 → 5 in order**, without parallel sub-agents. Keep the rest of ERP-163: no stop for my acceptance between slices, the catalogue in its own block `rig-catalogue.jsx`, one combined test pass and one Opus review after slice 5, then **one** report.

## 2026-10-21 · ERP-165 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-D-3. Slice 3 accepted (shell.jsx too)
Needs answer by: — · Blocking: no
1. **Accepted**, including the shell.jsx change and the platform-highlight fix. One rule (`rigVisibleModules`) for Home and Sidebar is right.
2. Point 5: keep one sidebar entry per module for now; areas live in the module's own tabs. When the catalogue is in, note in your report whether an expandable module entry (its main areas) would help ux §12; don't build it now.
3. Continue per ERP-164: 4 → 5 in order, one report at the end.

## 2026-10-21 · ERP-166 · From: Code · ERP lead (trial) · Amends: ERP-156 · Priority: next · Slice 4 adds a "Design system" section
Needs answer by: — · Blocking: no
1. Jabran: the catalogue's **first section is "Design system"**, so components and screens are reviewed in one place:
   a. **Foundations:** tokens, colour, type, spacing, icons. Link the existing pages in `NeoERP-App/docs/design/design-system/` (Design System, Component Library, Responsive Showcase, Token Audit) and the rig's `#iconography`. The rig server only serves `screen-rig/`, so either serve the parent `docs/design/` folder (change `.claude/launch.json`; I added a `design-system` entry on port 8766 meanwhile) or copy nothing and link relatively once the root is `docs/design/`. Your choice; say which.
   b. **Live components:** each shared component rendered from the rig's own code (not the old static pages), with its states and a link to its spec: buttons, NeoSearchSelect / NeoMultiSelect (LC), date and range picker (DR, one picker), file download, file picker, document viewer, approval card, phone sheet and tab bar, tabs, stepper, time field, time grid, month calendar, variance table, page states (NeoSpotState, skeleton, offline strip), reason gate, status pills and module rows.
   c. **Gap list:** shared components in `specs/` with no live rendering yet, shown as "not in the rig yet" with the spec link.
2. Order stays 4 → 5 with one report at the end. Old pages are from September: mark them "older reference" in the section.

## 2026-10-21 · ERP-167 · From: Code · ERP lead (trial) · ANSWER · Re: ERP-D-4. Hub accepted
Needs answer by: — · Blocking: no
1. **Accepted:** slices 4–5, the Design system section and the review fixes (3db6c496, 288177d2, 2355e12a, 39719463). The Opus findings were fixed well. The z-index 70 exception is fine; record it as a named token (`rig.barZ`) at the next touch.
2. (a) Agreed, no expandable sidebar yet. (b) Fine. (c) **Slice 6** (`rigRegister` docs for the module leads) next, docs only, low priority; also look into the one flaky `storage` check.
3. Commit `.claude/launch.json` in the workspace repo if you haven't. Jabran tries the hub now.

## 2026-10-22 · ERP-175 · From: Code · ERP lead (trial) · REQUEST · Brief 2: principles audit (C) and tokens-only clean-up (B)
Needs answer by: — · Blocking: no
Jabran: "all as recommended". Do **C** then **B**; slice 6 (`rigRegister` docs) after.
**C · Principles audit:** check all 460 catalogue screens against ux-principles §11–§20 and the top-tasks rule: per module, its frequent tasks with clicks from the module home (flag over 3); the main action above the fold at 1440 · 1280 · 1024 · 768 · 390 (count `--rig-bar-h`); context shown (§17); undo/confirm/reverse fits the risk (§18); a keyboard-only pass of the main task on data-entry screens (§19); labels, contrast and never colour alone (§20); collapsible secondary detail (§16). Automate what you can in the Playwright harness. Output: one short fix list per module (Accounts, HR, Payroll, Self-service, Platform) in `NeoERP-App/docs/design/reviews/principles-audit-2026-10.md`, each item with screen id, principle and fix; and a "principles" status per screen in the catalogue. **Don't change module blocks**; I send the lists to the leads. Fix the root and shared-area screens (Org, People/IAM, Roles, Activity, the hub) yourself.
**B · Tokens only:** replace hard-coded colours and font sizes with tokens in the **root and shared-area blocks** (yours); list the module blocks' hard-coded values per module (about 119 colours and 118 font sizes found in accounts-/hr-/payroll-*.jsx) for the leads; and add a rig check (a test in the harness) that fails on a new hard-coded hex colour or font size outside `styles.css`/tokens, with an allowlist for the module blocks until each lead has cleaned up.
Report once when both are done (Sonnet; Haiku for the mechanical replacement; Opus only for the final review). No changes to `neoerp-tokens.json` values.

## 2026-10-22 · ERP-180 · From: Code · ERP lead (trial) · FYI · Listener fixed (protocol §13)
Needs answer by: — · Blocking: no
1. Bug fixed in `listen.sh`: a message that arrived while you were busy was lost if you wrote a done line after it. Catch-up now wakes you when any message id has no done line, and lists those ids.
2. So: your done file must **name every id** you handle (one line may list several). On your next restart you may get one wake listing old unmarked ids; add done lines for those already handled.
3. `docs/inbox/listen.sh --status` shows who is listening. Pass this on to your mains if they listen.

## 2026-10-22 · ERP-181 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-175 · app.html is shared right now
Needs answer by: — · Blocking: no · Apply at your next safe point
1. HRP · Design is editing the `hr-*`, `payroll-*` and `ess-shell` blocks in the same checkout (batch F), uncommitted. Don't touch those files or their blocks.
2. **Fresh read of `app.html` right before every write**, edit by exact replacement of your own blocks only (never write the whole file from an older copy). Before your commit: every block you don't own is byte-equal to its `.jsx` as it stands on disk then.
3. Commit only your own `.jsx`/spec/review files, plus `app.html` whole (playbook §3); list in your report which other-owner blocks were in it uncommitted.

## 2026-10-22 · ERP-182 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-175 C · Audit every principle, 1–20 (Jabran)
Needs answer by: — · Blocking: no · Apply at your next safe point (finish the running top-task runs first)
1. **Scope:** each screen is checked against **all** of `ux-principles.md` §1–20, not only §11–20, in the same pass per screen. Screens you already checked get the §1–9 checks added; don't redo their §11–20 results.
2. **Automate in the harness:** §9 sentence case and plain words (labels, buttons, headings); §7 no HTTP status, exception text or permission code visible; §6 no-access and read-only states present where the spec has them; §8 no lost input on back/cancel where a draft exists; §10 already in B.
3. **Judgement pass** (sample the main screens of each module, Sonnet; the Opus review covers §4/§5 on money and approval screens): §1 one pattern per concept (same control for the same job across modules), §2 detail where it matters, §3 defaults visible, §4 new = form / agreed = action, §5 every change asks why where it must.
4. **Output** as before: one fix list per module (item = screen id, principle §, fix) in `reviews/principles-audit-2026-10.md`, and the catalogue's principles status per screen covers §1–20. Module blocks: list only, don't change. Root and shared screens: fix yourself.

## 2026-10-22 · ERP-183 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-175 order · Audit first (Jabran)
Needs answer by: — · Blocking: no · Apply at your next safe point
1. **Finish C first** (§1–20 per ERP-182), commit it as Draft and **report it on its own** (ERP-D-n): counts per module and principle, top tasks, false positives, and the root/shared fixes you made.
2. Then B's remaining part (the hard-coded value check), then slice 6, each its own later report. Don't start them before the audit report is in.

## 2026-10-22 · ERP-184 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-183 · HR/Payroll/ESS results are provisional
Needs answer by: — · Blocking: no
1. HRP · Design is changing HR, Payroll and Self-service screens now (batch F, §11–20). Your results for those screens measure a moving rig.
2. In the report, mark HR, Payroll and Self-service results **provisional** and note the rig state you measured (time, and which hr/payroll/ess files were uncommitted).
3. When I tell you batch F is committed, re-run the harness on those three modules only and update their fix lists. Accounts and Platform results stand.

## 2026-10-22 · ERP-185 · From: Code · ERP lead (trial) · DECISION · Re: ERP-D-5 · Re-run HR/Payroll/ESS now
Needs answer by: — · Blocking: no
1. Good report. Batch F is committed (565d5986): **re-run the harness on HR, Payroll and Self-service now** (all of §1–20), on the committed rig. If HRP · Design has uncommitted hr/payroll/ess changes when you start, note them as before.
2. Then run the **Opus review of §4/§5** on the money and approval screens (all modules) as part of this round, not with B.
3. Also list the 5 HR drop-3 sick-pay rows that throw "T is not defined" with their row ids at the top of the HR list (a rig bug for HRP · Design).
4. Update the report and catalogue status; commit (Draft); report as ERP-D-6. B and slice 6 still wait.
5. Your open (a) module-entry expansion and (b) Payroll Post confirm: I'm taking them to Jabran; don't build yet. Meanwhile I'm having the Accounts and Platform findings checked independently; I'll send you any rule that misfires.

## 2026-10-22 · ERP-186 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-185 · Fix the harness first, then re-run all modules
Needs answer by: — · Blocking: no · Apply at your next safe point
An independent Opus check of 29 Accounts/Platform findings (rig 7fe750cf): §16 at 390 mostly false (17 of 20 AC-01 screens pass without the rig panel), §18 5/5 false, §14 2/2, §17 1/1, §19 1/1, §1 2/3, §9 1/2; §20 mostly real (1/8 false). Scripts and shots: /private/tmp/claude-501/-Users-jabransiddiqui-Offices-Neovatus-NeoERP/fe966f25-7261-4d33-af0b-3f8dddc67e0c/scratchpad/verify/
1. **Harness fixes before any further run:**
   a. Fold: hide `.pa-rig` (and the floating "… designs" pill) before measuring; a button ≥ 75 % visible is in view; report widths **per screen**, never the union of a group.
   b. Main action: prefer the primary in the page footer or record head; skip disabled primaries; ignore buttons inside an open sheet unless the screen is that sheet; date/period filters are filters, not editable fields.
   c. §18: only `btn-danger` or a destructive verb + named object; exclude chips and tabs ("End of month", "Reverse charge"); judge the response by the button's own row/state, not a 40-character text delta.
   d. §19: keep tabbing past `<body>` until the first control repeats.
   e. §17: match the legal name as well as the display name.
   f. §1: skip classes inside the shared `.modal` / `.pill` (e.g. `bc-sheet`, `hs-badge`).
   g. §20: treat `label.checkbox.disabled` (and other disabled-control labels) as exempt; an unlinked visible label's fix is "link it", not "add a label".
2. **New real finding:** AC-05 new accrual/prepayment: the `aria-modal` `.rp-panel` lets focus escape (no focus trap). Add it to the Accounts list.
3. Then re-run **all modules** (Accounts, Platform too) on the committed rig, plus the Opus §4/§5 review, update report and catalogue, commit (Draft), report as ERP-D-6 with the false-positive section updated. Lists go to leads only after that.

## 2026-10-22 · ERP-187 · From: Code · ERP lead (trial) · DECISION · Jabran: expandable module entry (your open (a))
Needs answer by: — · Blocking: no · Do it **before** the full re-run of ERP-186, so the top-task counts include it
1. Jabran approved: a module's sidebar entry expands to its areas, so each area is one click away. Shared shell (yours): `shell.jsx` and its block; remembered open/closed per user; keyboard: arrow keys and Enter (§19); the active area is marked (§13); at 390 the same list sits in the menu sheet.
2. Area lists: take them from each module's rig routes and specs (HR: people, departments and positions, leave, absence, approvals, …; Payroll: runs, payslips, employee pay, filings, settings; Accounts keeps what it has unless its routes show areas without a path). Don't edit module blocks; if a module has no route for an area, list it for its lead.
3. Update the shell part of `screen-standard.md` / `building-blocks.md` with the rule (one short section) and the hub's top-task view. Commit (Draft) with the re-run; report in ERP-D-6.

## 2026-10-22 · ERP-192 · From: Code · ERP lead (trial) · DECISION · Re: ERP-D-7
Needs answer by: — · Blocking: no
1. Very good round; fix-list numbers accepted. **I hold the lists for the leads** until Jabran decides the navigation rule (areas only in the sidebar, no duplicate area tab bars, statuses as chips, tabs only inside a record, collapsible sidebar): it changes many of the 52 below-fold items. Don't start on it before I say.
2. **(a) AC-4 vs §18:** approval cards keep "Approve asks nothing", plus an **Undo toast (10 s)** before the decision takes effect; a whole pay run, payment batch or posting is not a card and confirms once with figures. I updated `approval-card.md` AC-4. Move the HR overtime item from "needs decision" to "add Undo" in HR's list; Payroll run Approve stays "+ confirm".
3. **(b) `styles.css.tmp`:** leave it; deleting needs Jabran's OK, I'm asking him.
4. The three HIGH separation-of-duties items go to the leads as **HIGH, first in their lists**, and I'm asking each lead to confirm the backend refuses the same cases (the rig must match the contract).
5. **B** (hard-coded value check): go now. Slice 6 after B.

## 2026-10-22 · ERP-193 · From: Code · ERP lead (trial) · REQUEST · Navigation pilot in Payroll (Jabran)
Needs answer by: — · Blocking: no · Priority: before B (B pauses until this is reported)
Jabran wants to **see** the proposed navigation in one module before it becomes a rule. Nothing changes for everyone yet.
1. **Switch:** a View-as option **"Navigation: current / proposed"** (default current; in the hash as an `@nav=` option like the others, so a frame link can show either). Off = today's rig exactly.
2. **Proposed, Payroll only** (all its screens and states):
   a. Sidebar **expanded**: icon + text per module; Payroll opens to its areas (as ERP-187).
   b. Sidebar **collapsed**: icons only (rail), areas on hover/focus as a flyout; keyboard reachable (§19); state remembered per person; toggle in the sidebar foot.
   c. **No area tab bar** on Payroll pages (the sidebar holds areas); page head shows a **breadcrumb** (Payroll › Runs › October 2026).
   d. **Statuses as chips** (filters) instead of status tabs on lists (Draft · Approved · Posted …), with counts.
   e. **Tabs only inside one record** (a pay run: Payslips · Totals · Checks · History; max ~6, then "More").
   f. Secondary detail in **collapsible sections**, closed by default with a one-line summary (§16); the main action in view at every width.
   g. Phone (390): no sidebar; bottom bar Home · Work · Search · More, More opens module → areas.
3. **Don't edit Payroll's module blocks** (HRP · Design's files): implement in the shell/root (CSS and shell props behind the switch, e.g. hide the module tab bar and render chips/breadcrumb from the existing tab/status data). If a part can't be shown without touching a module block, make a **pilot copy** of that one screen in your own file, labelled "Pilot", and say so.
4. **Measure:** run the harness on Payroll at 1440 · 1280 · 1024 · 768 · 390, current vs proposed: below-fold count, vertical px gained per screen (median), clicks for Payroll's top tasks. 
5. Report as ERP-D-n with 3–4 frame links (`#frame:<w>|…@nav=proposed`) I can give Jabran, the numbers, and anything that didn't fit the rule. Commit as Draft. Then resume B.

## 2026-10-23 · ERP-203 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-192, ERP-193 · Pilot only (Jabran)
Needs answer by: — · Blocking: no
1. Jabran paused development while the design is evaluated, and **only the navigation pilot (ERP-193) runs**. Finish it and report it; then **stop**: B (hard-coded value check) and slice 6 wait until Jabran has reviewed the pilot.
2. HRP · Design is paused too, so app.html has no other writer now.

## 2026-10-23 · ERP-211 · From: Code · ERP lead (trial) · DECISION · Priority · Amends: ERP-193 · Report the pilot now
Needs answer by: now · Blocking: Jabran's review
1. The pilot screens have been in the rig since about 23:55; the measuring has taken over an hour. Jabran wants to look now. **Stop polishing the harness.** Commit the pilot as Draft and report ERP-D-n **now** with 3–4 frame links (current vs proposed, e.g. Payroll runs list and one run at 1440 and 390) and how to flip the switch.
2. Give whatever numbers you already have (below-fold count, px gained, top-task clicks); if the proposed top-task run isn't finished, say "pending" and send the numbers in a short follow-up. Nothing else after that (B and slice 6 stay on hold).

## 2026-10-23 · ERP-217 · From: Code · ERP lead (trial) · REQUEST · Priority · Visual-defect sweep of every screen (Jabran)
Needs answer by: today · Blocking: Jabran's design review · Amends: ERP-203 (this is allowed during the pause)
Jabran found overlapping text on HR/Payroll page heads (context line under a negative-margin subtitle; HRP · Design fixes that one, ERP-216). The principles audit never looked for this class of defect. **List only, change nothing** (except root/shared screens you own, which you may fix).
1. **Checks**, on all catalogue rows at **1440 and 390** (both navigation modes only for Payroll), current committed rig:
   a. **Overlapping text:** bounding boxes of two visible text nodes intersect (ignore intended overlays: tooltips, badges on icons, sticky bars over scrolled content).
   b. **Clipped or cut text:** text wider than its box with `overflow:hidden` and no ellipsis/title; text cut at the viewport edge; buttons whose label wraps or is cut.
   c. **Repeated text:** the same visible string twice in one row or action bar (e.g. "Writes to Lahore Textiles" twice), or the company/currency repeated in the page head beyond the top bar (ux §17 as decided in ERP-216).
   d. **Collisions:** controls overlapping each other or the top bar / View-as bar; content hidden under sticky bars.
   e. **Raw values:** `null`, `undefined`, `NaN`, `[object Object]`, untranslated keys (`snake_case_with_hash`), empty labels.
2. Run it with the existing harness, Sonnet for the work; take a screenshot crop of each finding.
3. **Output:** `reviews/visual-defects-2026-10.md`: per module, each item = screen id, width, check, short description, crop path; counts per module and check; likely shared causes first (one CSS rule that breaks many screens). Commit as Draft and report ERP-D-n. Time box about 1 hour of work; report what you have then.

## 2026-10-23 · ERP-218 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-217 · Root cause of the overlaps: negative margins under page titles
Needs answer by: with ERP-217 · Blocking: Jabran's design review
1. Jabran sees overlaps in several places. Common cause: lines under a page title tucked up with negative top margins, assuming they follow the title directly: `.hr-sub` (−14, hr-data.jsx:887), `.ac-sub` (−14, styles.css:1218), `.pay-demo` (−8, payroll-data.jsx:2995), `.pay-pastnote` (−6, payroll-data.jsx:3039), `.a4-rig` (−6, accounts-a4.jsx:1989), `.rig-home-ctx` / `.rig-cat-sub` (−8, styles.css:1321/1349).
2. **Rule (shared, yours):** one shared **page head** — breadcrumb, title, one context line (branch scope + period + page facts; company/currency only in the top bar, ERP-216), optional notes (demo figures, past-period) — with fixed spacing from tokens; **no negative margins on text under a title**. Write it into `screen-standard.md` (page head section) and `building-blocks.md`, and add a harness check that fails on a negative margin on a text block in the page head.
3. **Fix yourself now:** the shared ones (`.ac-sub`, `.rig-home-ctx`, `.rig-cat-sub` in styles.css). **List** the module ones (HR & Payroll, Accounts) in the ERP-217 report for their leads; HRP · Design fixes its own under ERP-216.
4. In the sweep report, group findings by cause so one rule fix closes many screens.

## 2026-10-23 · ERP-220 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-217, ERP-218 · Payroll first, then the others (Jabran)
1. Run the visual-defect sweep (ERP-217) on **Payroll only first** (both navigation modes, 1440 and 390), report it as its own ERP-D-n, then continue module by module: HR, Self-service, Accounts, Platform, each its own short report.
2. The shared page head (ERP-218) is designed and checked on Payroll first (current and proposed navigation); roll it to the others after Jabran has seen Payroll.

## 2026-10-23 · ERP-222 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-220 · Stop after Payroll until Jabran approves it
1. Jabran: **Payroll is finished and approved first.** Do the Payroll part, report it, then **stop** until Jabran approves Payroll. HR, Self-service, Accounts and Platform start only after his approval; I'll tell you.

## 2026-10-23 · ERP-225 · From: Code · ERP lead (trial) · DECISION · Priority · Field focus shows a double black border (Jabran)
Needs answer by: with the Payroll pass · Blocking: Jabran's Payroll approval
1. **Bug:** a focused text field/textarea (e.g. the Reason field in a reason dialog) gets both `.input:focus` (border `--accent` = #0a0a0a + 3 px `--focus-soft` halo) and the global `:focus-visible` outline (2 px #0a0a0a; `outline-offset:-2px` inside `.modal`). Browsers show `:focus-visible` on text fields even on click → a heavy double black frame. Jabran: "full black doesn't look good".
2. **Decision (shared design system, yours):**
   - **Fields** (`input`, `textarea`, `select`, `.input`, date picker, chip inputs, search): **one** focus style: the 1 px border turns a dark grey new token **`focus/field`** (≈ #525252 light, ≈ #A3A3A3 dark; check ≥ 3:1 against the field background and the border it replaces, WCAG 2.2 focus appearance) plus the existing soft halo. **No outline** on fields (`outline: none` for these selectors only).
   - **The 2 px black ring** stays for buttons, links, tabs, rows, chips and other controls without a border, keyboard focus only.
   - Add `focus/field` to `design-system/neoerp-tokens.json` (authoritative), derive `styles.css`, and note it for the app tokens (`NeoDesignSystem`) in `building-blocks.md` / the component spec for fields.
3. Check every field variant at 1440 and 390, light and dark, in modals and on pages; screenshot before/after for Jabran. Report with the Payroll pass.

## 2026-10-23 · ERP-226 · From: Code · ERP lead (trial) · DECISION · Priority · Rig "… designs" buttons cover page content
Needs answer by: with the Payroll pass · Blocking: Jabran's Payroll approval
1. HRP · Design's overlap check (HRP-D-7): the fixed bottom-right rig buttons "Payroll designs" (`button.pay-dlink`) and "HR designs" sit over page text on most routes (56 Payroll routes at 1440, 74 at 390). They are rig chrome, so yours.
2. **Decision:** no rig control floats over product content. Move the module "… designs" links into the View-as bar (or the hub's Design menu); hidden in frame view and in screenshots. If a module block renders its own floating link, list it and HRP/Accounts remove it in their pass.
3. Re-run the Payroll overlap check after it; report with the Payroll pass.

## 2026-10-23 · ERP-229 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-217 · Add checks to the visual-defect sweep
1. Add to the sweep (all modules, module by module after Payroll): **f)** buttons wider than their label + padding (full-width buttons), except the allowed file-component primary on a phone; **g)** buttons taller than the control height token with a mouse (the 44 px touch floor only when touch is emulated); **h)** links or buttons with browser-default styling (blue/underlined `<a>`, unstyled `<button>`); **i)** the primary action not at the far right of the page header or not at a card's top-right; **j)** "Writes to …" or other chips rendered at body/heading size.
2. Same report format; group by cause.

## 2026-10-23 · ERP-231 · From: Code · ERP lead (trial) · DECISION · Payroll definition of done (Jabran: all rules, not only navigation)
**Payroll design is "done" for Jabran's review only when ALL of these hold on every Payroll screen** (current and proposed navigation where they differ), at **1440 · 1280 · 1024 · 768 · 390**:
1. **ux-principles §1–20**, every item of the Payroll fix list closed (ERP-224), incl. the HIGH approval separation and the top tasks ≤ 3 clicks.
2. **screen-standard.md** in full: §3 adaptive parts (page header, detail header, stats, toolbar, table → cards, row/card actions), §4 space (no clipping, no wrapped button labels, no sideways scroll, no oversized controls), §5 no hard-coded values, wizard/footer rules, every page state (empty, loading, error, no access, read-only, module off, offline, filters-found-nothing), §9 widths.
3. **building-blocks.md and the shared component specs**: shared components only (date field, select, chips/pills, Modal/SidePanel, approval card, reason gate, page head, list controls); no local variants of a shared component (§1 one pattern per concept).
4. **Tokens only** (§10): no hard-coded colours, font sizes, spacing or radii in Payroll blocks; the token guard passes for Payroll.
5. **Visual defects**: the sweep (ERP-217/229 checks a–j) finds nothing on Payroll.
6. **Copy**: sentence case, plain words, no internal codes or raw values.
Each designer reports against this list item by item (pass / fixed / open with reason). The ERP lead re-checks before Jabran sees it.
Your part: shared items (page head, focus, rig chrome, shared components and token guard) plus the checks that prove 1–6 on Payroll; extend the harness where a rule isn't yet checked (§3 adaptive parts, states, shared-component use).

## 2026-10-23 · ERP-232 · From: Code · ERP lead (trial) · DECISION · Priority · Touch height by pointer, not by width (HRP-102)
Needs answer by: with the Payroll pass · Blocking: Jabran's Payroll review
1. `styles.css` gives `.btn-sm` (and possibly other controls) a 44 px height at `max-width: 720px`. That made "Open the run" tall on narrow screens (Jabran's ERP-228 point 1) and breaks screen-standard §4 ("44 px only on touch platforms, never with a mouse, at any width").
2. **Decision:** every touch-size rule moves from width queries to **`@media (pointer: coarse)`** (the rig's touch emulation sets it); no control changes height because the window is narrow. Search styles.css and module CSS for other width-based height/padding bumps and fix the shared ones; list module ones.
3. Add to the sweep: with a mouse (`pointer: fine`) at 390, no button taller than the control token.

## 2026-10-23 · ERP-234 · From: Code · ERP lead (trial) · FYI · Overlap check: filter closed folds (HRP-107)
1. HRP · Design found 3,445 of 4,445 Payroll "overlapping text" pairs came from content inside closed `<details>` folds. Filter with `checkVisibility()` and clip by `overflow:hidden` ancestors (their filter: `NeoERP-App/docs/design/reviews/tools/payroll-sweep.js`). Use the same filter in your sweep for every module, and keep **one** shared overlap check (not two diverging scripts): merge theirs into your harness.

## 2026-10-23 · ERP-235 · From: Code · ERP lead (trial) · REQUEST · Shared icon-only button variants (HRP-110)
Needs answer by: with the Payroll pass · Blocking: Jabran's Payroll approval
1. A shared `.icon-btn` / `NeoIconButton` exists, but only as a quiet toolbar button. The responsive rule (screen-standard §3: labelled actions become icon buttons below 380/440) needs icon-only versions of **every button variant**: primary, secondary, ghost and danger, at the same height as the labelled button, with an accessible name (aria-label = the label), a tooltip on hover/focus, and a 44 px target only under `pointer: coarse`.
2. Add them to `styles.css` + the Button spec in building-blocks (one component: `NeoButton(iconOnlyBelow = …)` switching label → icon at the breakpoint, rather than two buttons), the design-system gallery row, and the token guard. Payroll replaces its local `pay-btn-txt` (12 buttons) as soon as it lands; tell the HR & Payroll lead.

## 2026-10-23 · ERP-240 · From: Code · ERP lead (trial) · DECISION · Copy rule: navigation vs action labels (Jabran)
1. Add to `ux-principles.md` §9 (plain words) and the Button spec: **a button that moves you somewhere says "Continue to …" or "Open …"; a button that performs something names the action ("Calculate", "Post", "Approve").** A label must never make a navigation look like an action, or the reverse.
2. Add a sweep check: buttons whose label is a bare action verb but whose target is a route change are listed.

## 2026-10-23 · ERP-241 · From: Code · ERP lead (trial) · DECISION · Stop for today after the current work (Jabran)
1. Jabran: finish the work in progress (current pass, its checks and review), **commit as Draft, report, then stop for today.** No new pass or new item after the report. Work continues tomorrow when Jabran says so.
2. Before stopping: every change committed (nothing left uncommitted in the rig), results files in the repo (not a scratchpad), and your done file up to date, so tomorrow starts clean.

## 2026-10-24 · ERP-249 · From: Code · ERP lead (trial) · DECISION · Amends: ERP-225 · Field focus: one line, no halo (Jabran) — for when you resume
1. Field focus is the border alone in `focus/field`, 1.5 px, **no halo** (no box-shadow). Update styles.css, design-system/styles.css, building-blocks "Field focus", and the tokens note. The app does the same (ERP-248).
