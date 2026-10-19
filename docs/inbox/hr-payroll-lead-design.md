# Inbox: hr-payroll-lead-design

Append-only. Only the lead writes briefs here (protocol §3). The main marks items done in `hr-payroll-lead-design.done.md`.
Handover: docs/handover/main-agent-handover.md

---

## 2026-10-10 15:10 · HRP-15 · From: Code · HR & Payroll lead (trial) · REQUEST · Brief DES-1 · Rig fix round: HR drop 1 + Payroll drop 2
→ HRP · Design · model Opus (payroll money and fraud controls) · Blocking: yes (design gate bundle 1)
1. **Start state.** If `docs/drafts/hr-payroll/cowork-export/` exists, start from its drop 1 / drop 2 fixed jsx and the review addendum; diff against the current blocks before using anything. Otherwise rebuild from the specs below. Tell me which you used.
2. **HR drop 1** (`hr-employee.jsx`, `ess-shell.jsx`, `hr-data.jsx`, `hr-directory.jsx`, `hr-org.jsx`, `hr-rig.jsx`; spec `NeoERP-App/docs/design/specs/hr-h1.md`): fix HR-1…HR-12 and X-1, X-4, X-9 from `docs/reviews/design-review-2026-10-09.md` ("HR drop 1", "Patterns"). Bank details (HR-1/2/7/9) follow building-blocks "Bank details changes" exactly, incl. ERP-27.3 (hire = first change request). HR-3: change between dated rows or "Edit the 1 Nov change", prefilled from the row valid on the chosen date. Dates via the one parser (ERP-27.2).
3. **Payroll drop 2** (`payroll-*.jsx`, ESS Pay in `ess-shell.jsx`; spec `payroll-p.md`, amended today — read its 2026-10-10 note): PR-1, PR-2, PS-1, PS-2, PS-3 and Owner's own (§6.3: only when nobody else holds calculate or approve). Switch journals to the packs 2026.2 §6.2a roles and drop the nearest-role fallback (ACC-9/10). PR-3…17, PS-4…18 only if the export has the addendum; otherwise list them as "waiting for addendum".
4. **Small items:** Tromsø AGA zone 4a in `hr-data.jsx`; ESS Home "Next payslip" card wired; Reykjavík demo company gets employees; the "Generate — file fails" design row points at `FIL-LHR-165-2026-Q1`.
5. **Rules:** only HR/Payroll/ESS `data-file` blocks in `app.html`; re-read app.html right before writing (Accounts edits it in parallel); each standalone jsx identical to its block; no object-rest destructuring; CSS only with `hr-`/`ess-`/`pay-` prefixes; no edits to shell, routes, Tweaks root or the Org/People/Roles/Activity screens (ERP-21). Pickers `NeoSearchSelect`/`NeoMultiSelect`; page states, numbers, money and percent per building-blocks.
6. **Spec text** goes with the rig: amend `hr-h1.md` for the drop 1 fixes (dated note). Don't touch `payroll-p.md` beyond what PR-3…17/PS-4…18 need.
7. **Test:** Playwright, CDN routed to local npm packs, 390/768/1024/1280 px, every touched route and state; no console errors.
8. **Report** (≤ 20 lines): per id done / not done, files changed, test result, open questions with your recommendation. Nothing is committed.
Refs: docs/handover/hr-payroll-lead-handover-code.md §5.8; docs/inbox/hr-payroll-lead.md ERP-9, ERP-11, ERP-27

## 2026-10-10 15:12 · HRP-16 · From: Code · HR & Payroll lead (trial) · REQUEST · Brief DES-2 · Rig drop 3: Leave, Time, approvals inbox, lifecycle, ESS Leave/Time
→ HRP · Design · model Opus · Blocking: yes (design gate bundle 2) · Start after DES-1 is reported (it shares `ess-shell.jsx`, `hr-rig.jsx`, `hr-data.jsx`)
1. **Start state:** as DES-1 item 1 (Cowork's drop 3 output may be in the export; use it after a diff check).
2. **Scope:** specs `hr-h2-h3.md` and `hr-h4.md`; contracts `NeoERP-BackEnd/docs/api/hrms-v2-h2.md`, `-h3.md`, `-h4.md` (amended today). New blocks `hr3-data.jsx`, `hr3-ui.jsx`, `hr3-rig.jsx`, `hr-leave.jsx`, `hr-time.jsx`, `hr-approvals.jsx`, `hr-lifecycle.jsx`; ESS Leave and Time in `ess-shell.jsx`. Every state (empty, loading, error, read-only, no access, offline) at phone, iPad and desktop.
3. **Must hold:** J-9 (roster rules are warnings with source, save anyway with a logged reason, young-worker check in every country, legal sex only for the PK night-work check); H2 notices are IN_APP notifications, not workflow items (ERP-13); REASSIGN as H2 §19.2; health leave shows "Away" to everyone but HR (E-1 Q8); components per the 10 approved component specs (`approval-card`, `calendar-month`, `time-grid`, `time-field`, `date-range-field`, `stepper`, …).
4. **Rules, test and report:** as DES-1 items 5, 7, 8. Use sub-agents per screen group, each with its own files; you integrate app.html once.
Refs: hr-payroll-lead-handover-code.md §5.2, §6.1, §6.3

## 2026-10-10 16:20 · HRP-22 · From: Code · HR & Payroll lead (trial) · DECISION · Models for DES-1 and DES-2 (replaces "model Opus" in HRP-15/16)
→ HRP · Design · Blocking: no
1. Your session: **Haiku** (design work, lead-agent-structure §3a).
2. Plan for each brief: one **Opus** sub-agent writes the plan (screens, worker split, owned files).
3. Rig and spec workers: **Haiku**. app.html integration and Playwright runs: **Haiku**; up one model only after a pass/fail check failed twice.
4. Before you report: a fresh read-only **Opus** review of the payroll screens (money figures, Owner's own, bank-details and Mark-as-paid controls) and the HR bank-details screens. Required, not optional.

## 2026-10-13 17:10 · HRP-29 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-15, HRP-16 · Start state, review file, rules since 10 Oct
→ HRP · Design · Blocking: no
1. **Start state (replaces HRP-15.1 / HRP-16.1):** there is no Cowork export of the rig work; it won't come. Rebuild drop 1 fixes, drop 2 fixes and drop 3 from the specs and contracts on disk. Ignore `cowork-export/`.
2. **Drop 2 findings are on disk:** `docs/reviews/payroll-drop2-review-2026-10-10.md` (PR-1…17, PS-1…18; PS-13 withdrawn). Fix all of them in the rig and `payroll-p.md`; the server-side rules are in P0–P4 (amended 2026-10-10 and today). Report per id.
3. **Listen:** first action, start the protocol §13 loop on `docs/inbox/hr-payroll-lead-design.md`; restart it as the last action of every turn.
4. **Models (ERP-68):** set the model on every sub-agent explicitly. Plan: Opus. Rig/spec workers, integration, Playwright: Haiku (Sonnet only after a check failed twice). Required read-only Opus review of payroll and bank-details screens before you report. Your session: Haiku.
5. **Shared components (ERP-46):** ESS uploads and document previews use `NeoFilePicker` / `NeoDocumentViewer`; `NeoFileType` adds Jpg, Png. Don't build your own.
6. **Testing (ERP-66):** only the routes you changed and what depends on them, at 390/768/1024/1280.
7. **Order:** DES-1 (drops 1 + 2) first, report; then DES-2 (drop 3). After DES-1 is accepted, write a handoff in your plan and ask Jabran to /compact (ERP-59).

## 2026-10-13 20:20 · HRP-32 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-15 (DES-1 wave 4 test) · Priority: now
→ HRP · Design · Blocking: no
1. Wave 4 has run over 30 minutes. At the next safe point, switch to **one Playwright script** (Node, headless, CDN routed to local packs) that loops every touched route × 390/768/1024/1280. It collects console errors, page errors and horizontal overflow (`scrollWidth > clientWidth`) as JSON. No screenshots, no step-by-step clicking by an agent.
2. Worker: Haiku writes and runs the script once; if it fails twice, Sonnet. Time box: 15 minutes from now.
3. State checks (empty, error, read-only, no access, offline) only on the routes PR-1, PR-2, PS-1, PS-2, PS-3 and HR-1/2/3/7/9 touch, via the rig's Tweaks switches in the same script.
4. Then the required Opus review (read-only, the jsx and spec only, no browser), and report per id. Anything not tested goes in the report as "not tested", not as a reason to keep going.

## 2026-10-13 20:30 · HRP-33 · From: Code · HR & Payroll lead (trial) · DECISION · Replaces: HRP-32 · Lighter checks for rig drafts · Priority: now
→ HRP · Design · Blocking: no
1. These are design drafts, not code. Stop the test wave at the next safe point.
2. **Check now (≤ 10 min):** one headless load of app.html. Every touched route renders at 390 and 1280 with no console errors. That's all.
3. **Review:** the Opus read-only review covers only the blocking ids (HR-1, HR-2, HR-3, HR-7, HR-9, PR-1, PR-2, PS-1, PS-2, PS-3) against the spec. No browser, ≤ 15 min.
4. Report per id now. Jabran clicks through the rig himself; the full four-width pass runs once, just before the design-gate bundle, not per drop.
5. Same rule for DES-2.

## 2026-10-13 22:30 · HRP-34 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-1 · DES-1 accepted with small fixes; start DES-2
→ HRP · Design · Blocking: no
1. **DES-1 accepted** as a draft for Jabran's review. Good work.
2. Small fixes first (≤ 20 min, Haiku):
   a. `payroll-p.md` §3: the Sialkot owner is Usman Tariq.
   b. `hr-h1.md` §5: HR-3 follows the rig (a change can be dated between rows, prefilled from the row valid on that date); remove cancel-and-re-enter.
   c. Replace the hard-coded "Hina Javed" with the seed's HR admin per company.
   d. One headless script checks the three untested flows: "Change account" click, Reverse → ESS shows Replaced, requester bar (add a Lahore persona who requested a bank change).
3. Decisions on your 4a/4c: the contracts follow the rig (H1-17/H4-26 WAITING until HR.PAY_DETAILS.APPROVE; HR-5/6/12 rows; H1-5(a) between rows; P3 codes TWO_PERSON_RULE/PAYEE_ACCOUNT, JOURNAL_REVERSE_FAILED, PAYMENT_FILE_EXISTS; P2 PR-4 entryDate, PR-9 disabled post). I'm amending them now. Nothing to change in the rig.
4. 4d goes to the Accounts lead from me; don't touch Accounts blocks. 4e is fine for a draft.
5. Then **DES-2** (HRP-16 as amended by HRP-29, checks as HRP-33). Report DES-1 fixes in one line inside the DES-2 report.

## 2026-10-13 23:30 · HRP-37 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-34 · DK ATP_PAYABLE
→ HRP · Design · Blocking: no
1. DK `ATP_PAYABLE` = **2771** (ACC-101). Replace the 2944 placeholder in payroll-data.jsx at your next safe point. The Accounts lead regenerates the demo chart with the 2026.2 roles later; don't touch Accounts blocks.

## 2026-10-15 09:50 · HRP-39 · From: Code · HR & Payroll lead (trial) · REQUEST · Start DES-2 now · Priority: next
→ HRP · Design · Blocking: no
1. DES-1 and its fixes are accepted (HRP-D-1, HRP-D-2). Start **DES-2** (HRP-16 as amended by HRP-29; checks as HRP-33). Session Haiku; Opus plan and the required Opus review on the approvals, lifecycle and bank-at-hire screens.
2. Apply HRP-37 (DK ATP_PAYABLE 2771) first if it isn't done yet.
3. **Languages (Jabran, C3, ERP-89):** every new spec screen lists its copy as named string keys (e.g. `hr.leave.request.submit`) with English text, so the app builds them as string resources. The rig keeps English text inline.
4. Keep the payroll seed names (Hina Javed in payroll-data.jsx) as they are.
5. ESS bank-account requests are refused with "Sign in again" until auth_time exists (ERP-89.1); the rig may show it as a state chip.
6. When DES-2 is reported, write the handoff and ask Jabran to /compact (ERP-59).

## 2026-10-15 14:55 · HRP-40 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-39.3 · String key format
→ HRP · Design · Blocking: no
1. String keys in specs follow building-blocks "Screen text and languages": `<module>_<area>_<name>` (e.g. `hr_leave_request_submit`), file `strings_<module>_<area>.xml`. Not dotted keys. Apply at your next slice boundary.

## 2026-10-15 17:45 · HRP-41 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-39 · DES-2 lead conflicts (W7, W8)
→ HRP · Design · Blocking: no · apply in the fix pass
1. **Ended employee in ESS:** the contracts win (H2-A7, H4 §8.12, J-5). After the end date: Me shows no HR job data (403 → "Your employment has ended"); leave and time are read-only history; payslips stay readable for 12 months. Banner: "Your employment ended on {date}. You can still see your payslips until {date + 12 months}." (string key per HRP-40).
2. **hr3CreateEmployee:** follow H4-4. An ended national-id match is a re-hire offer, not a refusal. Drop `NATIONAL_ID_ENDED_MATCH` as a refusal.
3. **Not built items** (half days, hours unit, graded leave, roster copy-week, shift reactivate, etc.): list them in your report as "not in rig"; don't add them now. I decide per item whether bundle 2 needs them.
4. London / Helsinki / Reykjavík with no HR data showing "module off" is fine.

## 2026-10-15 18:45 · HRP-42 · From: Code · HR & Payroll lead (trial) · DECISION · Listener script (ERP-102)
→ HRP · Design · Blocking: no
1. Replace your pasted listener loop with `docs/inbox/listen.sh hr-payroll-lead-design` (background, from NeoERP/), started as the last action of every turn. Write a done line for everything you handle, FYIs included.

## 2026-10-15 18:50 · HRP-43 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-41.1 · Ended employee: Leave and Time
→ HRP · Design · Blocking: no
1. H2-A7 wins over my HRP-41.1: after the end date, Leave and Time show the ended card only (no HR ESS data). Keep what you built. Home's "payslips stay in Pay" is fine.

## 2026-10-15 19:40 · HRP-44 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-39 · Time box the rest of DES-2 · Priority: now
→ HRP · Design · Blocking: no
1. No file under screen-rig or specs has changed since 18:34. If a worker has been running for more than 20 minutes without writing, stop it.
2. W9 spec: two Haiku workers in parallel, one for `hr-h2-h3.md` and one for `hr-h4.md`. Each adds only a dated note, the string-key tables for new screens, and the sections the rig changed. No rewrite of the rest. 20 minutes each.
3. W10 integration, then W11 load check at 390 and 1280 (HRP-33), then the Opus review of approvals, lifecycle and bank at hire only (≤ 15 min). Report to my inbox when done. Anything unfinished goes in the report as "not done".

## 2026-10-15 19:50 · HRP-45 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-3 · DES-2 fix pass
→ HRP · Design · Blocking: no
1. (a) **Yes.** One Sonnet pass fixes B-5, B-6, B-8, B-9, B-11, B-13 and the new items:
   - Draft saves keep no nid, dob or IBAN in localStorage. Sensitive fields are never stored in a draft.
   - Drop the hard-coded "Ayesha Khan".
   - One create path: `lcCreate` calls `hr3CreateEmployee`.
   - Planning an end checks waiting job-change requests.
   - Bank reveal needs PAY_DETAILS.APPROVE and matches the maker by user id (ERP-82.1).
   - Re-hire and move send only the source id; the "server" copies nid and dob.
   - REHIRE_OFFER returns no employeeCode.
   - Statutory leave says "Confirm".
   Then a fresh Opus re-review of B-5, B-6, B-8, B-13 and the draft leak only (≤ 15 min).
2. (b) Network is back. Rebuild the load harness from npm (`npm pack` the React, ReactDOM and @babel/standalone versions app.html uses) into your scratchpad, route the CDN to them, and run W11 at 390 and 1280.
3. (c) **Yes:** move the drop-3 router hook above the HrPage early return so London and Helsinki reach it.
4. Report in one entry. Then write the handoff and ask Jabran to /compact (ERP-59).

## 2026-10-15 20:05 · HRP-46 · From: Code · HR & Payroll lead (trial) · REQUEST · Commit all HRP design, spec, contract and plan files as Draft (ERP-110, Jabran) · Priority: now
→ HRP · Design · Blocking: no · do this at your next safe point, before continuing the HRP-45 fix pass
1. **Status lines first** (only the status line, near the top; nothing else). Set `Status: Draft (not approved by Jabran)` in specs `hr-h1.md`, `hr-h2-h3.md`, `hr-h4.md`, `payroll-p.md` and contracts `hrms-v2-h0…h4.md`, `payroll-v2-p0…p4.md`. Where a file has no status line, add one under the title.
2. **NeoERP-App (`dev-app`), one docs-only commit:** `docs/design/screen-rig/hr-*.jsx`, `hr3-*.jsx`, `payroll-*.jsx`, `ess-shell.jsx`; `docs/design/specs/hr-h1.md`, `hr-h2-h3.md`, `hr-h4.md`, `payroll-p.md`; `docs/agents/hrp-des-1/`, `docs/agents/hrp-des-2/`. **Not `app.html`**: Accounts · App commits it whole (ERP-111). Subject: `docs(hr-payroll): rig drops 1–3, specs and plans (Draft)`.
3. **NeoERP-BackEnd (`dev`), one docs-only commit:** `docs/api/hrms-v2-h0.md` … `hrms-v2-h4.md`, `docs/api/payroll-v2-p0.md` … `payroll-v2-p4.md`. Nothing else, and leave the other sessions' staged or modified files alone: stage by explicit path only. Subject: `docs(hr-payroll): HR H0–H4 and Payroll P0–P4 contracts (Draft)`.
4. Rules: `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`, no trailers; `git diff --cached --stat` checked before each commit, showing only those paths; **no push**.
5. Report the two commit ids in one line to my inbox, then continue HRP-45. Your later rig fixes are your own follow-up commits (same rules).

## 2026-10-15 20:15 · HRP-47 · From: Code · HR & Payroll lead (trial) · DECISION · Listener full path (ERP-114)
→ HRP · Design · Blocking: no
1. Start your listener as `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh hr-payroll-lead-design`.

## 2026-10-15 20:35 · HRP-48 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-46 · Plan folders (ERP-117)
→ HRP · Design · Blocking: no
1. Add `docs/agents/hrp-des-1/` and `hrp-des-2/` with `git add -f` (a global ignore can hide `docs/agents/`). Check `git status --ignored` before you report the commit ids.

## 2026-10-15 20:41 · HRP-50 · From: Code · HR & Payroll lead (trial) · DECISION · Replaces: HRP-46, HRP-48 · Draft commits done by the lead
→ HRP · Design · Blocking: no
1. I made the Draft commits at Jabran's request: NeoERP-App a09fc826, NeoERP-BackEnd 20fae50. Skip HRP-46 and HRP-48. On resume, start with HRP-45. Commit your later rig and spec fixes yourself (docs only, explicit paths, no push).

## 2026-10-15 21:00 · HRP-51 · From: Code · HR & Payroll lead (trial) · DECISION · Replaces: HRP-45 items 1–3 · Codex does the DES-2 fix pass
→ HRP · Design · Blocking: no
1. Codex (Jabran's session "Codex · HRP design fixes") does the HRP-45 fixes, the router hook and the load check. **Don't edit any `hr-*`, `hr3-*`, `ess-shell.jsx` file or the HR/ESS blocks in `app.html` until I say so.**
2. Your remaining DES-2 task: when I send it, a fresh read-only Opus re-review of Codex's fixes (B-5, B-6, B-8, B-13, the draft leak). Then the handoff and /compact.

## 2026-10-15 23:26 · HRP-53 · From: Code · HR & Payroll lead (trial) · REQUEST · Opus re-review of the Codex fixes (HRP-51.2)
→ HRP · Design · Blocking: no
1. Codex fixed DES-2 in **89995150** (report HRP-C-1 in my inbox): 102 routes × 4 widths clean, 11 behaviour checks pass.
2. Run one fresh read-only **Opus** review of B-5, B-6, B-8, B-13 and the draft leak against H1-14/16/17, H4-4/6/23/26 and building-blocks "Bank details changes". Static, no browser, ≤ 15 min. PASS / FAIL per id, file:line for each FAIL. Report to my inbox; fix nothing.
3. You may edit the HR/ESS files again only if I send a fix brief after that review. Then the handoff and /compact.
4. Listener: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh hr-payroll-lead-design

## 2026-10-15 23:40 · HRP-54 · From: Code · HR & Payroll lead (trial) · DECISION · Replaces: HRP-53 · One review at the end
→ HRP · Design · Blocking: no
1. Jabran: Codex completes the rest of drop 3 first; one review at the end. Skip HRP-53 for now and stay off `hr-*`, `hr3-*`, `ess-shell.jsx` and the two drop-3 specs.
2. When Codex reports (HRP-C-2), I'll send you one Opus review brief covering everything. Until then, nothing to do: write your handoff and ask Jabran to /compact.

## 2026-10-16 08:30 · HRP-55 · From: Code · HR & Payroll lead (trial) · REQUEST · The one Opus review of drop 3 (HRP-54.2)
→ HRP · Design · Blocking: yes (bundle 2)
1. Codex finished drop 3 (HRP-C-2 in my inbox; commits 379dd89f … b651d233; 1,308 visits clean, 53 checks pass).
2. Run **one fresh read-only Opus review** of the drop 3 rig (`hr-*`, `hr3-*`, `ess-shell.jsx`) against contracts H2, H3, H4, H1-14/16/17 and building-blocks. Priority: the round 1 ids (B-5, B-6, B-8, B-13, draft leak), then four-eyes and Owner's own, bank at hire, ended employee (HRP-43), J-9 roster warnings with "Save anyway", health leave shown as "Away", the leave ledger and carry-over. Static, no browser, ≤ 30 min.
3. Report PASS / FAIL per area, file:line for every FAIL, severity High/Med/Low. **Fix nothing.** Accepted for the draft: the compact time picker and calendar visuals (the real components come from the design-system checkpoint).
4. Listener: /Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh hr-payroll-lead-design

## 2026-10-16 09:00 · HRP-56 · From: Code · HR & Payroll lead (trial) · DECISION · Replaces: HRP-55 · Review runs in the lead's session
→ HRP · Design · Blocking: no
1. I'm running the drop 3 Opus review myself (docs/reviews/hrp-drop3-review-2026-10-16.md). Skip HRP-55. Nothing to do now; write your handoff and wait.

## 2026-10-16 11:05 · HRP-60 · From: Code · HR & Payroll lead (trial) · FYI · Your handoff is out of date
→ HRP · Design · Blocking: no
1. On resume, update your hrp-des-2 handoff: DES-2 is done. Codex completed and fixed drop 3 (89995150 … e4ecba2b, 91a1723c); the Opus review passed (docs/reviews/hrp-drop3-review-2026-10-16.md). You have no open brief; wait for the next one.

## 2026-10-19 20:00 · HRP-63 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-6 · Design completion (P5–P9 and remaining coverage)
→ Codex · HR & Payroll design completion (Jabran's Codex session; working folder /Users/jabransiddiqui/Offices/Neovatus/NeoERP) · Blocking: no
1. **Continuation: GO WITH LIMITS.** Draft design only. One batch at a time; each batch ends with your report to `docs/inbox/hr-payroll-lead.md`, my acceptance, and a fresh read-only Opus review in my session for anything touching money, identity, bank or permissions. No production code, migrations, real data, live submissions, push or PR.
2. **Order:** Batch 0 → A → B → C → D → E (your section 3), each as you proposed. Start with 0 and A now. Don't start B until I accept A.
3. **Batch 0, today (≤ 30 min):**
   a. **F-09 accepted:** in `payroll-v2-p5.md` §6, PAID locks only **SALARY** bank files (create, remake, cancel). **PAYEE** files follow P3 §5.4: they need PAID, with the requester bar, approved account and duplicate-READY guards. Don't change the rig, which is already right. Check other P6–P9 for the same sentence.
   b. **Commit the current country drafts as Draft** (ERP-110: nothing stays uncommitted). NeoERP-App `dev-app`: `payroll-data.jsx`, `payroll-rig.jsx`, `payroll-setup.jsx`, their app.html blocks, `payroll-p.md`. NeoERP-BackEnd `dev`: `docs/api/payroll-v2-p5.md` … `p9.md`, each with `Status: **Draft (not approved by Jabran)**`. Workspace `NeoERP` `master`: `docs/drafts/hr-payroll/payroll-p5-norway.md` … `p9-iceland.md`, `docs/agents/hrp-p5-p7/`, `docs/agents/hrp-p8-p9/` (`git add -f`). Explicit paths with `--only`; check `git diff --cached --name-only` first; `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`; no trailers; **no push**. Exclude `spot-state-audit.codex.md`.
4. **Batch A, shared import (after batch 0).** Pre-check: `payroll-v2-p1.md` carries "Amended 2026-10-19 (HRP lead): P1-43"; if not, stop and report.
   - Build one shared tax-card import pattern per P1-43 in the Payroll rig: upload → mapping → preview (eligible / skipped with reasons) → apply (applied / skipped) → done. Both mapping and apply re-select the same file.
   - States, each with a behaviour check: preview expired; source changed (`IMPORT_SOURCE_CHANGED`); stale card; HR unavailable; own-record and confidential rows refused; permission lost between preview and apply; partial counts; discard; retry.
   - Country profiles: NO, SE, DK, FI as tax-card files; IS as a credit-allocation instruction (no authority feed wording).
   - Synthetic fixtures only; no identity or file persisted anywhere, including localStorage.
5. **Files you may edit:** `NeoERP-App/docs/design/screen-rig/payroll-*.jsx` and their app.html blocks; `NeoERP-App/docs/design/specs/payroll-p.md`; `NeoERP-BackEnd/docs/api/payroll-v2-p5.md` … `p9.md` (clarifications in this brief's scope only); `docs/drafts/hr-payroll/payroll-p5-norway.md` … `p9-iceland.md`; `docs/agents/hrp-p5-p7/`, `docs/agents/hrp-p8-p9/`. **Read-only:** H0–H4, P0–P4 (I write their amendments), building-blocks, every other module, `hr-*`/`hr3-*`/`ess-shell.jsx` (unless a later batch names them). You are the app.html integrator for your blocks: fresh read before writing, blocks byte-equal to the jsx, every other block hash unchanged.
6. **Definition of done per batch:** Babel parse of the changed jsx; one recreated /tmp Playwright harness (npm-packed React 18.3.1, ReactDOM 18.3.1, Babel 7.29.0) over every #pay route at 390/768/1024/1280 with zero page or console errors, blank roots or overflow; earlier regression checks still pass; one behaviour check per listed state. **Design complete** = batches A–E accepted by me, Opus reviews pass, and Jabran approves the click-through.
7. **F-01…F-09:**
   - **F-01:** accepted as A→E.
   - **F-02:** accepted. One shared transport, P1-43 (I'm drafting it now; the ERP lead reviews the sensitive-data part). P5–P9 point to P1-43 instead of defining their own: align their A-ids in batch A.
   - **F-03:** accepted, deferred to batch C. I write the P4 amendments (employment-only months, FI payment-level/cancel-new, IS zero-payment families, feedback evidence) before C starts.
   - **F-04:** accepted, deferred to batch B. I write the HR fact DTO amendments (H1/H2/H4); Org facts go to the ERP lead. Until then the rig shows missing-fact blockers, never invented HR fields.
   - **F-05:** accepted, deferred to batch D. Accounts owns the roles and payees; I ask the Accounts lead before D. No hardcoded accounts.
   - **F-06:** accepted. Checker per country is the J-8 practitioner (Jabran's decision), engaged when that country is built. Until then I run a source check per country (Sonnet research + Opus review, as for PK). All values stay UNCHECKED / PARALLEL_ONLY with an explicit "not verified" label.
   - **F-07:** reconciled in item 9.
   - **F-08:** accepted. Formal reviewer = a fresh read-only Opus review in my session per batch; Jabran gives final approval. Your own reviews are evidence, not the formal review.
   - **F-09:** accepted, batch 0a.
8. **Unresolved statutory values:** placeholders allowed when labelled "Pending verification" with the source to check; never a guessed number. Statutory leave expiry stays disabled until reminder lead times are verified; IS leave expiry stays open.
9. **Prior decisions, as I hold them:** HRP-C-5 is accepted as Draft (Opus security check running today). Contract audit CA-1…35 are all accepted. G-1…G-6 are **not yet decided by Jabran**: nothing is approved; everything stays Draft. PK payroll figures are still unconfirmed.
10. **Commits:** Draft commits per batch are allowed, docs only, with the rules in 3b. No push, no PR.

## 2026-10-19 20:30 · HRP-65 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-63 batch 0 · CA-14 leftover (security check)
→ Codex · HR & Payroll design completion · Blocking: yes (batch 0 isn't accepted without it)
1. My Opus security check of HRP-C-5 (docs/reviews/hrp-c5-security-check-2026-10-19.md): CA-2, CA-23, CA-30 PASS; **CA-14 FAIL (Med)**. The national-id change-request path is still live.
2. Add **batch 0c**, and for it only you may also edit `ess-shell.jsx`, `hr-employee.jsx`, `hr-data.jsx`, `hr-approvals.jsx` and their app.html blocks:
   - ESS: no "Request a change" on the national id (`ess-shell.jsx:301`, `:462-470`). Show the keyed text "To change your ID number, contact HR." instead.
   - HR: remove the NATIONAL_ID change-request kind and its apply path (`hr-employee.jsx:446`, `:475-476`, `:509`; `hr-data.jsx:466`; `hr-approvals.jsx:644`). The direct SENSITIVE.UPDATE edit (`hr-employee.jsx:572-596`) is the only way.
   - Low: `payroll-setup.jsx:415` checks `payOwnersOwnAllowed` but calls `payPayeeOwnerAllowed`; make them the same function.
   - Checks: ESS persona sees no NID request action; the approvals queue has no NID kind; the HR direct edit still works with a reason and a field-only audit.
3. Commit 0c separately: `docs(hr): CA-14 national id has no request path (Draft)`.
