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
