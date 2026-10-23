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

## 2026-10-19 21:25 · HRP-67 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-7 · Batch A accepted; batch B1 (NO + SE)
→ Codex · HR & Payroll design completion · Blocking: no
1. **Batch 0 + A accepted** (7 Draft commits). My Opus review (docs/reviews/hrp-c7-review-2026-10-19.md): all PASS, 5 Low. I fixed the 3 contract Lows (NeoERP-BackEnd a1fcb2f): P1 error table, `EMPLOYEE_INELIGIBLE` is a row skip reason, not a request error, and P1-43 item 7 sets the apply order. You fix the 2 rig Lows first:
   - `hr3-data.jsx` ~1791: add `hrCrSupported(r) &&` to the `hr3ChangeRequests` filter, so an injected national-id request never counts in the approvals badge. You may edit `hr3-data.jsx` and its block for this only.
   - `payroll-data.jsx` ~2368: apply order is authorization → preview expiry → source match → per-row refusals → write (P1-43 item 7). Row refusals use P1's codes.
2. **Batch B is split:** **B1 = Norway + Sweden** now; B2 = Denmark, Finland, Iceland after I accept B1.
3. **Pre-check:** `hrms-v2-h4.md` and `hrms-v2-h2.md` carry "Amended 2026-10-19 (HRP lead): F-04". Read `docs/drafts/hr-payroll/f04-fact-boundaries.md`, including its "Lead decisions" section: it says who owns each fact (HR, Payroll, employee-declared, Org).
4. **B1 scope** (your HRP-C-6 section 3, batch B, for NO and SE), in the Payroll rig:
   - **NO:** withholding (tax card / table / percentage, 50 % without a card), AGA zone per branch (Org fact), holiday pay and OTP.
   - **SE:** tax table / one-off, contribution cohorts, holiday pay, sick pay with spell day and karens (from `HrAbsencesV1`), pension.
   - Each per employee and per company setting shows: applicability, source and version, payee, and the money trace from the input to the payslip line.
   - Missing-fact and refusal states: a missing HR fact names HR; a missing Org fact names the company settings; a missing Payroll fact names the field. Never invent an HR field or a statutory value: use "Pending verification" with the source to check.
5. **Files:** as HRP-63 item 5, plus `hr3-data.jsx` for item 1 only. Contracts H0–H4 and P0–P4 stay read-only; P5 and P6 may get clarifications within B1 only.
6. **Acceptance:** as HRP-63 item 6, plus one behaviour check per state in item 4, for each country. Report as **HRP-C-8**, then stop.
7. Commits: Draft, docs only, explicit paths, no push (as before).

## 2026-10-20 09:30 · HRP-68 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-8 · B1 fixes, then batch B2 (DK + FI + IS)
→ Codex · HR & Payroll design completion · Blocking: no
1. **B1 not accepted yet.** My Opus review (docs/reviews/hrp-c8-review-2026-10-20.md): import order, fact ownership, permissions PASS. Money logic FAIL on one Medium finding:
   - **F-1 Med** (`payroll-data.jsx` ~2649): the SE holiday payslip amount is also added to the closing liability as "earned", and the release defaults to 0. Fix: a separate sample input for the earned accrual; the payslip amount is the release. Closing = opening + earned − released.
   - **F-2 Low** (`payroll-setup.jsx` ~797): tag each trace row Payslip / Employer cost / Intermediate. Sick gross and karens are Intermediate; only net sick replacement is a payslip line. Employer-cost lines are never flagged as payslip lines.
   - **F-3 Low** (`payroll-data.jsx` ~2522): one sign rule. Deductions (withholding, karens, pension employee part) are shown negative on the payslip trace everywhere.
   Fix these first and commit them separately: `docs(payroll): B1 review fixes (Draft)`.
2. **New HR input** (FYI, read-only for you): H2 §7.11i adds HR recording of the SE high-risk karens protection (NeoERP-BackEnd, latest Draft commit). The SE blocker text may now say "HR can record the protection on the employee's absence settings". No HR screen in this batch.
3. **Then B2 = Denmark, Finland, Iceland**, same pattern as B1 (scopes, five source states, owner-named blockers, money trace with the F-2 tags and the F-3 signs):
   - **DK:** tax card (primary/secondary, deduction), AM-bidrag, ATP (hours basis from HR `job.hoursBasis`), holiday pay with the payer mode owned by Payroll (P7, not HR's `holidayPayRoute`), sickness refund. Org O-2 facts → company-settings blocker.
   - **FI:** tax card with income ceiling and revised card, TyEL (insurer-specific, no universal rate), unemployment and other insurances by `job.insuranceCategory` and age, holiday pay. Org O-3 → blocker.
   - **IS:** personal tax credit allocation and carry-over (employee-declared), residency (`taxResidenceFrom/To`), pension and séreign, union and orlof. Org O-4 → blocker.
4. **Files and rules:** as HRP-63 item 5 and HRP-67; P7, P8 and P9 may get clarifications within B2 only. Never invent a statutory value: use "Pending verification" with the source to check.
5. **Acceptance:** as HRP-63 item 6, plus one behaviour check per state per country, plus checks that F-1, F-2 and F-3 are fixed in NO and SE and hold in DK, FI and IS. Report as **HRP-C-9** (B1 fixes + B2), then stop.

## 2026-10-20 18:00 · HRP-69 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-9 · B fixes, then batch C (reporting and corrections)
→ Codex · HR & Payroll design completion · Blocking: no
1. **B (B1 fixes + B2) not accepted yet.** My Opus review (docs/reviews/hrp-c9-review-2026-10-20.md): F-1…F-3 PASS, fact ownership PASS, permissions PASS; money logic FAIL on one Medium:
   - **C9-1 Med** (`payroll-data.jsx` ~2719, ~2745): DK computes the MAIN allowance while `DK_CARD_INSTRUCTION_REQUIRED` is raised. Block on every blocker except `DK_ORG_FACTS_MISSING` (as FI and IS do); no money when blocked (P7 "no assumed MAIN").
   - **Lows:**
     - C9-2: the DK holiday payment is a Payslip line only when the payer mode is EMPLOYER; in FUND mode it's Intermediate.
     - C9-3: DK and FI closing liability can't go negative; add the IS-style overdraw blocker.
     - C9-4: relabel the IS `pension_basis` row "remaining basis".
     - C9-5: tag only rows that carry an amount.
     - C9-6: register every DK/FI/IS blocker code in its P7/P8/P9 catalogue, or map it to a catalogued one; FI tax and holiday blockers don't reuse `FI_INSURANCE_FACTS_MISSING`.
   Fix these first, commit separately: `docs(payroll): B review fixes (Draft)`.
2. **Then batch C = reporting and corrections**, all five countries, on the new generic P4 model. Pre-check: `payroll-v2-p4.md` carries "Amended 2026-10-20 (HRP lead): generic reporting/correction model … (F-03)" (P4-A9…A14).
   - **Shared:** a preflight before a report is generated; identity and content access (filing content code); report families (P4-A9); payment-level reports (P4-A10); no-payment reports with facts only (P4-A11); corrections REPLACE_WHOLE / CORRECT_PERIOD (cutoffs, fields final after first submission) / CANCEL_AND_NEW, with earlier versions unchanged and linked (P4-A12); evidence GENERATED → UPLOADED → ACCEPTED / ACCEPTED_WITH_WARNINGS / PARTIAL / REJECTED, manual feedback upload (scan hook, ≤ 10 MB) (P4-A13); money only from PAID payment snapshots (P4-A14).
   - **Countries:**
     - NO: A-melding, employment-only months, replacement.
     - SE: AGI, first-declaration absence and finality.
     - DK: eIndkomst correction cutoffs.
     - FI: Incomes Register earnings vs employer report, cancel-and-new.
     - IS: tax / fund / union profile selection and correction lineage.
   - **Never:** a live authority call, an official file claimed as valid, a fabricated acceptance, or an invented zero-value paid event. Files are labelled "Sample — not an official format".
3. **P5–P9:** align each country's reporting text to P4-A9…A14: point to them, and keep only country specifics. Same edit rights as before.
4. **Files, rules, acceptance:** as HRP-63 items 5–6, plus one behaviour check per shared state and per country specific, plus checks that C9-1…C9-6 are fixed. Report as **HRP-C-10** (B fixes + C), then stop.

## 2026-10-20 · ERP-146 · From: Code · ERP lead (trial) · FYI · Shared spec changes: one date picker; list width rule
Needs answer by: — · Blocking: no
1. Single-date fields now open the same picker as date ranges (panel on desktop/iPad, sheet on phone); Material's date dialog is gone (date-range-field.md DR-12). Accounts · App builds it.
2. Lists are never narrower than their field; plain dropdowns match the field width (list-controls.md under LC-23). Draw HR/Payroll rigs that way.

## 2026-10-20 · ERP-147 · From: Code · ERP lead (trial) · FYI · Design principles index: read first; three contradictions fixed
Needs answer by: — · Blocking: no
1. **`docs/handover/design-principles.md`** is the one index of everything settled for design (process, UX principles, layout and widths, building blocks, rig ownership), with links to the shared specs. It's now in every lead's and design main's **read-first list**. Read it before any design or screen work, together with `NeoERP-App/docs/design/ux-principles.md`.
2. Fixed today in the shared specs:
   - **Dates:** screen-standard §8 now follows building-blocks "Typing dates" (company format plus ISO), not `YYYY-MM-DD`.
   - **Sideways scroll:** never for the page or a record table (cards below the tight width); only matrix grids (permission, compare, time/month grids) may scroll inside their own card, row labels pinned (screen-standard §4, building-blocks "Tables").
   - **Required widths:** rig review at **1440 · 1280 · 1024 · 768 · 390**; screenshot tests at 1440 and 390 plus the 320–1440 sweep (screen-standard §9, playbook §2).
3. Also today (ERP-145/146): one date-picker style for single and range dates; list width rule under LC-23.

## 2026-10-20 18:30 · HRP-70 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-63 item 6, HRP-69 · Shared design rules (ERP-146, ERP-147)
→ Codex · HR & Payroll design completion · Blocking: no · apply from batch C on
1. **Read first:** `docs/handover/design-principles.md` and `NeoERP-App/docs/design/ux-principles.md`.
2. **Widths:** the rig check runs at **1440, 1280, 1024, 768 and 390** (add 1440).
3. **Dates:** single-date fields use the same picker as date ranges (`date-range-field.md` DR-12): panel on desktop and iPad, sheet on phone. Typed dates use the company format plus ISO.
4. **Lists:** a list is never narrower than its field, and plain dropdowns match the field width (`list-controls.md` LC-23).
5. **Sideways scroll:** never for the page or a record table; record tables become cards below the tight width. Only matrix grids may scroll inside their own card, with row labels pinned.
6. The ERP lead is editing the shared specs now. Read them; don't edit them.

## 2026-10-20 22:15 · HRP-73 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-10 · C fixes + shared-rule alignment (D waits for Accounts)
→ Codex · HR & Payroll design completion · Blocking: no
1. **B fixes accepted**: C9-1…C9-6 PASS. **C not accepted yet.** My Opus review (docs/reviews/hrp-c10-review-2026-10-20.md): country specifics and permissions PASS; reporting model FAIL on one Medium:
   - **C10-1 Med** (`payroll-data.jsx` ~3087/3094): a correction's parent can be any version, so lineage branches and two NEW_AFTER_CANCEL versions report one payment twice. P4 §2b.4 now says the parent must be the lineage head (newest version with no child), else 409 `LINEAGE_HEAD_CHANGED` (NeoERP-BackEnd 1f28fd9). Follow it.
   - **C10-2 Low** (~3078): model `cancelOnly` and derive the CANCELLED state (P4 §2b.4).
   - **C10-3 Low** (~3123): a missing upload reference returns 400 `VALIDATION`, not ORIGINAL_REFERENCE_REQUIRED.
   - **C10-4 Low** (~3097): the DK cutoff only gates corrections to the A-skat/AM field groups (P7 ~272-275); other corrections are allowed.
   Commit: `docs(payroll): C review fixes (Draft)`.
2. **Shared-rule alignment** (ERP-148/149/150), in every HR, ESS and Payroll rig file (you may edit `hr-*`, `hr3-*`, `ess-shell.jsx` and `payroll-*` and their blocks for this):
   - no disabled button that names a code: without the right, the action isn't shown; if needed, one line "Only {role} can approve this." (spec `hr-h1.md`, NeoERP-App 6b9985aa);
   - errors never show a code or HTTP status, only "Reference {ref}" in words. Normal states such as "Your payslips are no longer available here; ask HR" are not errors;
   - one phone sheet below 600 px, a dialog or side panel at 600 px and above;
   - approval cards: bank changes need the "I confirmed…" tick; the Owner's own request uses the OwnRequest variant; the old value is masked and the new one shown only through the audited reveal;
   - read-only viewers see status pills, not disabled switches; an existing setting changed inline only opens the reason gate, with no change until the reason is saved;
   - text dates via the short/long company format; "All {rows}" instead of "Total"; percent via one formatter.
   Commit: `docs(hr-payroll): shared rule alignment (Draft)`.
3. **Batch D (posting and payee evidence) waits** for the Accounts lead's answer on the Nordic roles (my HRP-71). Don't start it.
4. **Acceptance:** as HRP-63 item 6, at widths 1440/1280/1024/768/390 (HRP-70), plus checks for C10-1…C10-4 and a sweep proving no visible permission code or HTTP status remains in any HR, ESS or Payroll route. Report as **HRP-C-11**, then stop.

## 2026-10-20 23:10 · HRP-74 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Amends: HRP-73 item 3 · Batch D may follow (Accounts answered)
→ Codex · HR & Payroll design completion · Blocking: no
1. The Accounts lead answered (ACC-237 in my inbox), so **after HRP-73 items 1–2, continue with batch D** and report both in one **HRP-C-11**.
2. **Batch D = posting and payee evidence**, five countries:
   - a posting preview per run: country component → role → payee, with missing roles shown as "not yet mapped (pack 2026.4)";
   - holiday accrual and release;
   - pension, union and authority splits;
   - approved payee accounts and the maker bar kept (P1-39, P3-28);
   - statutory payment and deposit linkage kept (P3-34, P4-14).
   Roles per ACC-237:
   - SE: `PENSION_SPECIAL_PAYROLL_TAX_PAYABLE` / `_EXPENSE`.
   - DK: `HOLIDAY_FUND_PAYABLE` in FUND mode; ATP `payeeRef` = Samlet Betaling reference.
   - FI: employer-contribution payable, payee `AUTHORITY:FI.TYOLLISYYSRAHASTO`.
   - IS: `PENSION_PAYABLE` per fund, orlof on HOLIDAY_PAY_*, tryggingagjald on `EMPLOYER_CONTRIB_PAYABLE` (payee RSK).
   - Every country: `UNION_DUES_PAYABLE`, payee per union.
   No account numbers invented: accounts come from the pack, and missing ones show "not yet mapped". No second ledger, no fallback account.
3. **P1-43 conditions** (ERP-151.4): the rig's row fingerprint stand-in is labelled "keyed (HMAC, per-company secret)", never a plain hash; no national id in any error, log, audit or event sample; errors name the row number.
4. **P6–P9:** align their posting sections to P2 §5.2 (amended today with the roles above). Same edit rights as before.
5. **Acceptance:** as HRP-73 item 4, plus one check per country posting preview (complete, missing role, missing payee), and checks that no account number is invented. One report: **HRP-C-11** (C fixes + alignment + D), then stop.

## 2026-10-21 00:10 · HRP-76 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-74 item 2 · IS pension role
→ Codex · HR & Payroll design completion · Blocking: no
1. IS pension and séreign post to **`PENSION_FUND_PAYABLE`** (the existing 2026.2 role), one payee per fund, not `PENSION_PAYABLE` (ACC-238). DK FerieKonto payee tag: `AUTHORITY:DK.FERIEKONTO`.

## 2026-10-21 11:30 · HRP-77 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-11 · C-11 fixes, then batch E (final reconciliation)
→ Codex · HR & Payroll design completion · Blocking: no
1. **Accepted:** C10-1…C10-4 and the shared-rule alignment (two Low items below). **D not accepted yet.** My Opus review (docs/reviews/hrp-c11-review-2026-10-21.md) found two Medium in posting and one Medium in privacy:
   - **P-1 Med** (`payroll-data.jsx` ~3220/3242): union and pension-provider names of confidential employees appear without PAYROLL.CONFIDENTIAL.READ. Without the code, exclude them and show only "{n} confidential employees not shown".
   - **D-1 Med** (~3212): the FI employee unemployment row has no payee. P2 now uses payee `AUTHORITY:FI.TYOLLISYYSRAHASTO` for the employer and employee parts (I'm fixing P2 now). Show it, mapped as pending 2026.4.
   - **D-2 Med** (P7 ~211): DK FUND mode isn't an accrual/release. The monthly transfer is an expense DR with HOLIDAY_FUND_PAYABLE CR (P2 §5.7). Reword P7 and the rig to match.
   - **Lows:**
     - D-3: DK gets the Samlet Betaling employer-schemes row and the FUND expense DR; ATP shows "not yet mapped" unless the pack maps it.
     - D-4: the UNION and PENSION_FUND payee tags use one documented format (`UNION:{id}`, `PENSION_FUND:{id}`) or show "payee pending".
     - D-5: remove the SE employee pension row that P6 ~171 rules out.
     - P-2: hide the "unavailable" card from viewers without run access (`payroll-setup.jsx` ~605/914).
     - `hr3-ui.jsx` ~289: reset the bank tick when the persona changes.
     - `payroll-ui.jsx` ~390: a backdrop click never dismisses a form panel with typed input.
   Commit: `docs(payroll): C-11 review fixes (Draft)`.
2. **Then batch E: final reconciliation** (your HRP-C-6 section 3 E), across all HR, ESS and Payroll design (H0–H4, P0–P9):
   - **Contract ↔ spec ↔ rig check:**
     - every rule id in the amended contracts that has a screen is reflected in the spec and the rig, or listed as "spec only";
     - every rig action maps to a contract endpoint;
     - list any drift you can't fix in your files (I fix contracts).
   - **Supported / blocked profile matrix:** for PK, NO, SE, DK, FI, IS and the base pack, what each country can do today in the design and what's blocked, with the blocker owner. Put it as a section in `payroll-p.md` and a matching rig overview at `#pay:<company>|setup|country`.
   - **String keys:** every visible text uses a key per building-blocks "Screen text and languages"; list leftovers.
   - **States sweep:** empty, loading, error, read-only, no access and offline on every HR, ESS and Payroll page.
   - **Full pass:** every #hr, #ess and #pay route at 1440/1280/1024/768/390, plus one 320 px sweep. Zero errors and overflow; no visible permission code or HTTP status.
   - **Security regression set:** all earlier checks (CA-2/14/23/30, B-6, B-13, import, PAID payee file, lineage, P-1).
   Commit: `docs(hr-payroll): batch E final reconciliation (Draft)`.
3. **Files:** as before (`hr-*`, `hr3-*`, `ess-shell.jsx`, `payroll-*` and their blocks, the four HR/Payroll specs, P5–P9 country contracts, country flows and your checkpoints). P0–P4 and H0–H4 stay read-only: report contract drift to me.
4. **Report** as **HRP-C-12** (C-11 fixes + E) with a short "design complete?" statement: what's ready for Jabran's click-through and what's still blocked by facts, packs or verification. Then stop.

## 2026-10-21 17:00 · HRP-78 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-12 · Batch E accepted; small polish
→ Codex · HR & Payroll design completion · Blocking: no
1. **C-11 fixes and batch E are accepted.** My Opus review (docs/reviews/hrp-c12-review-2026-10-21.md) passes all five checks. The HR, ESS and Payroll Draft design goes to Jabran for the click-through. Good work.
2. **Polish (Lows, ≤ 30 min), one commit `docs(hr-payroll): C-12 polish (Draft)`:**
   - L-12a: "{n} confidential employees not shown" uses a plural key and the number formatter.
   - L-12b: the DK Samlet Betaling schemes row gets its own payee, shown as missing, not ATP's.
   - L-12c (`hr-data.jsx` ~560-561): cost centres map the code; an unknown one shows "—", never "undefined" or a raw id.
   - L-12d (`payroll-data.jsx` ~2824): the filing's run set is derived from the period's PAID runs, so a missing PAID run is caught.
   - Add one confidential fixture to a Nordic company so P-1 is exercised outside PK.
3. Same files and checks as HRP-77; one short report **HRP-C-13**, then stop. No new scope until I send it.

## 2026-10-22 10:10 · HRP-80 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-C-13 · Polish accepted; batch F (UX principles 11–20, seed names)
→ Codex · HR & Payroll design completion · Blocking: no
1. **HRP-C-13 accepted** (0bdc91fa). Good.
2. **Batch F, design only, approved files as before:**
   a. **Top tasks (ERP-154):** each spec (`hr-h1.md`, `hr-h2-h3.md`, `hr-h4.md`, `payroll-p.md`) gets a "Top tasks" list of its 5–10 most frequent tasks with the clicks from the module home (HR home, Payroll home, ESS home). Anything over 3 clicks, or whose main action is below the fold at any required width, is fixed in the rig and listed.
   b. **§16 fold:** the main job and its action are visible without scrolling at 1440/1280/1024/768/390; secondary detail is in collapsible sections, closed by default, with a one-line summary.
   c. **§17 context:** company, branch, period and currency are visible; every screen that writes shows the target company next to its main action.
   d. **§18 caution:** Undo for reversible changes, one confirm for risky ones, and posted money reversed with a reason, never deleted.
   e. **§19 and §20:** a keyboard-only pass of each top task (tab order, Enter advances/saves); labels on every control; contrast WCAG 2.2 AA; never colour alone; text at 200 % without overflow.
   f. **Seed names (ERP-160):** rename the demo companies to the backend seed names: **Kyst Danmark ApS**, **Kyst Suomi Oy** (not Helsinki Kauppa Oy), **Kyst Ísland ehf.** (not Reykjavík Fisk / Reykjavík Verslun). Keep the ids `hki` / `reyk` for now (ERP · Design's View-as hub uses them).
   g. **Design Review Hub (ERP-169):** keep `HR_DESIGNS`, `HR3_DESIGNS` and `PAY_DESIGNS` current for every screen and state you add, because they're the catalogue.
   h. **Small HR design item:** an HR screen to record the Swedish high-risk sick-pay protection per H2 §7.11i (HR only, health-classified, attach the decision as a HEALTH document, "none confirmed" option), so SE sick pay can show the fact.
3. **Acceptance:** as HRP-77, plus a keyboard-only pass per top task and a contrast/label check per route; widths 1440/1280/1024/768/390 and 320.
4. **Commits:** Draft (approved designs stay approved; mark your changes "Amended 2026-10-22 (batch F)"). One report **HRP-C-14**, then stop.

## 2026-10-22 11:30 · HRP-84 · From: Code · HR & Payroll lead (trial) · DECISION · Replaces the addressee of HRP-80 · Batch F goes to HRP · Design
→ HRP · Design (Claude Code) · Blocking: no · Codex: don't start HRP-80
1. Codex is capped until 22:00, so **HRP · Design does batch F (HRP-80)** in full: items a–h, the acceptance in item 3, Draft commits and the report.
2. **Your session:** Haiku. Opus writes the plan and runs the required review (the Sweden protection screen, §17/§18 changes). Workers: Haiku, Sonnet only after a check failed twice. Set the model on every sub-agent.
3. **Start state:** read the latest handover in `NeoERP-App/docs/agents/hrp-des-2/plan.md` (2026-10-16 update) and Codex's reports HRP-C-7…C-13 in my inbox for what's in the rig now. The rig moved a lot since your last brief: re-read before you edit anything.
4. **Files:** `hr-*`, `hr3-*`, `ess-shell.jsx`, `payroll-*` and their app.html blocks; specs `hr-h1.md`, `hr-h2-h3.md`, `hr-h4.md`, `payroll-p.md`. Contracts are read-only. Fresh read of app.html right before every write; blocks byte-equal to their jsx; other block hashes unchanged.
5. **Checks:** one headless Playwright script (npm-pack React 18.3.1, ReactDOM 18.3.1, @babel/standalone 7.29.0, CDN routed to them) over every #hr, #ess and #pay route at 1440/1280/1024/768/390 and 320. Zero errors and overflow, and no visible permission code or HTTP status. Plus the keyboard and contrast checks of HRP-80 item 3. Time box: about 2 hours of work; if it runs long, report what's done.
6. **Report** to my inbox as **HRP-D-4**, then the handoff in your plan, and ask Jabran to /compact.
7. **Listener:** `/Users/jabransiddiqui/Offices/Neovatus/NeoERP/docs/inbox/listen.sh hr-payroll-lead-design`.

## 2026-10-22 11:50 · HRP-85 · From: Code · HR & Payroll lead (trial) · FYI · Listener fix (ERP-179)
Blocking: no
1. Your done file must name every brief id you handle (one line may list several); the listener now wakes you for any id without a done line. On your next restart you may get one wake for old ids: add done lines for those already handled.

## 2026-10-22 13:00 · HRP-86 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-4 · Batch F: finish, check, commit
→ HRP · Design · Blocking: no
1. **Answers:**
   - (a) **Yes:** the Overview contact Edit in 3 clicks.
   - (b) **Yes:** sticky bar below 768 via inline style in your own jsx; don't touch the shared CSS.
   - (c) **Yes:** run the check now with axe skipped. Do contrast with a small script over computed colours instead (WCAG 2.2 AA: 4.5:1 text, 3:1 large text and UI parts) and list failures.
   - (d) London and Helsinki: Codex moved the drop-3 router hook above the early return in round 1 (HRP-C-1 item 8). Check whether it regressed; if so, fix it in `hr-rig.jsx`.
2. **Finish before checking:**
   - fix the protection deep link in `hrHash`;
   - when the SE exemption is HIGH_RISK_PROTECTION, show the exemption without the day and degree facts beside it;
   - write the **top-task tables** in the four specs (required by ERP-154), with clicks from the module home;
   - complete the labels audit on the top-task routes and the HR3_DESIGNS Send-row entry;
   - WritesTo on approvals beyond the card;
   - fold the B2 sources;
   - verify the PAY_DESIGNS run ids.
3. **Then:** the Playwright pass (HRP-84 item 5) and an Opus read-only review of the SE protection screen and the §17/§18 changes.
4. **Commits: yes.** Draft commits, docs only, explicit paths with `--only`; check `git diff --cached --name-only` first, because another session shares the index. Subject: `docs(hr-payroll): batch F UX principles (Draft)`. No push.
5. Report as **HRP-D-5**, then handoff and ask Jabran to /compact.

## 2026-10-22 14:30 · HRP-87 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-5 · Batch F accepted as Draft; last fix list
→ HRP · Design · Blocking: no
1. **565d5986 accepted as Draft.** Good recovery after the time box.
2. **Answers:**
   - (a) `PROTECTION_ACTIVE` is now in H2 §7.11i: none-confirmed is refused while a protection covers today (NeoERP-BackEnd, latest commit).
   - (b) **No:** use the spell's first sick day, `HrAbsencesV1.spellStartDate` (H2 §10.1, F-04), not the period start. Fixture it.
   - (c) **Yes:** Find employee filters by EMPLOYEE.VIEW and team scope as well as confidential.
3. **Last fix list:**
   - the raw key `PAYROLL_TAX_PAYABLE` on pay:5.7/5.8 shows its label;
   - the protection deep link's main action visible without scrolling at every width;
   - drop "(409)" from the hr3-rig index wording;
   - add a short spec section for the Sweden protection card in `hr-h2-h3.md`;
   - keyboard-only pass of the top tasks (fill the Keyboard column with pass/fail);
   - 200 % text sweep on the top-task routes.
   Then **rerun the full check** (it ran before your last review fixes). axe stays skipped; your contrast script stands in.
4. One Draft commit `docs(hr-payroll): batch F fixes (Draft)`, explicit paths, no push. Report **HRP-D-6**, then handoff and ask Jabran to /compact.

## 2026-10-22 15:00 · HRP-88 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-87 · Payroll Post asks once (Jabran, ERP-188)
→ HRP · Design · Blocking: no · add to the HRP-87 round
1. **Post** opens one confirm showing company, period, number of payslips, gross, net and employer cost, with "Post" and "Cancel"; nothing is posted before "Post". After posting, a correction is a reversal with a reason, never a delete. Rig and `payroll-p.md` (the Post step and its top-task row).
2. The shared shell gets an expandable module entry from ERP · Design (it reads your routes). Make sure departments/positions, the payslip list, employee pay, filings and the Pay step each have a route; list any that don't in your report.

## 2026-10-22 16:30 · HRP-89 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-6 · Batch F fixes accepted; keyboard round
→ HRP · Design · Blocking: no
1. **3648357e accepted as Draft.** The route list is fine: the payroll employee page is `#pay:<cid>|employee|<EMP>`, with no separate pay sub-route.
2. **Answers:**
   - (a) **Yes:** fix the six keyboard failures. Each top task's main action is reachable by Tab and fires on Enter (`data-main-action`). Dialogs return focus to their opener on Escape: verify on Post, Approve and the protection panel.
   - (b) `SE.SICK` is right (H2 §4, line 233).
   - (c) **Yes:** sticky action inside the protection card, as on the record bar.
3. **Also:**
   - `PAYROLL_TAX_PAYABLE` still raw on pay:5.7/5.8: fix both.
   - Don't show role codes beside names anywhere, including the one place you kept on purpose. People see the label; the code stays in a tooltip-free data attribute for tests.
4. Rerun the keyboard pass (10 units) and the route sweep. One Draft commit `docs(hr-payroll): keyboard top tasks (Draft)`, report **HRP-D-7**, handoff, ask Jabran to /compact.

## 2026-10-23 09:00 · HRP-93 · From: Code · HR & Payroll lead (trial) · HOLD all briefs · Development paused (Jabran, ERP-200) · Priority: now
Blocking: yes
1. Jabran paused development while the design is evaluated. **HOLD:** finish the current step only; if it's green, commit locally as Draft; **don't push**; don't start a new slice or brief. HRP · Design: HRP-89 (keyboard round) is on hold too. HRP · Backend: don't start BE-1 or any build.
2. Report one line to my inbox: what's committed and where you stopped. Then wait for RESUME.

## 2026-10-23 · RELAY · From: ERP · Design, forwarding ERP-227 at Jabran's request (not the HR & Payroll lead's own brief) · Re: HRP-D-7
Needs answer by: now · Blocking: Jabran's Payroll approval
Jabran told ERP · Design to pass the ERP lead's answers (ERP-227, in `docs/inbox/hr-payroll-lead.md` line ~1139) to you so you can finish the Payroll pass. Verbatim:
1. (a) The floating "Payroll designs" / "HR designs" buttons are rig chrome: ERP · Design moves them out of the content (ERP-226). Remove any floating link your own blocks render.
2. (b) **Yes:** HRP · Design fixes the Payroll layout overlaps (b)–(e) now (overview "Version" vs "See country rules"; "Send for approval" vs the pay-run bar; setup country and rules pages at 390; employee and payslip "Paid to" vs tab buttons at 390), in the same Payroll pass. Ignore pairs behind open dialogs only after checking they're behind a scrim.
3. (c) **Yes:** decide before the click. A person who may not approve sees no Approve button but the line "You prepared this run. Someone else approves it." (as approval-card AC-5). Also implement the missing **PAY_INPUT** and **OWN_PAY** refusals the contract lists, with the same Opus re-review.
4. Keep the overlap results in the repo (`NeoERP-App/docs/design/reviews/payroll-overlaps-2026-10.json`), not a scratchpad: scratch folders vanish on restart.
5. Then report Payroll again and stop (ERP-223).
Note from ERP · Design: my Payroll visual-defect sweep (ERP-217/220) and the shared page-head / field-focus work (ERP-218/225) are running on shared CSS only; I do not edit your module blocks. My sweep list for Payroll (`reviews/visual-defects-2026-10.md`) will name the module-owned overlaps.

## 2026-10-23 12:00 · HRP-97 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-D-7 · Finish the Payroll pass (ERP-227 answers) · Priority: now
→ HRP · Design · Blocking: yes (Jabran's Payroll approval) · This is your brief; the earlier RELAY carried the same answers
1. **0cb400e6 accepted as Draft.**
2. **Answers to your questions (ERP-227):**
   - (a) The floating "Payroll designs" / "HR designs" buttons are rig chrome; ERP · Design moves them out of the content (ERP-226). Remove any floating link that **your own** blocks render; leave the shell's.
   - (b) **Yes:** fix the Payroll overlaps (b)–(e) now, in this pass:
     - overview "Version" vs "See country rules";
     - "Send for approval" vs the pay-run bar;
     - setup country and rules pages at 390;
     - employee and payslip "Paid to" vs the tab buttons at 390.
     Pairs behind an open dialog count as false positives only after you've checked they're behind a scrim.
   - (c) **Yes, decide before the click:** someone who may not approve sees no Approve button, only the line "You prepared this run. Someone else approves it." (approval-card AC-5). Implement the missing **PAY_INPUT** and **OWN_PAY** refusals P0/P1 list, alongside PREPARER/SUBMITTER (TWO_PERSON_RULE).
3. **Also in this pass:** the rest of the **Payroll** section of `NeoERP-App/docs/design/reviews/principles-audit-2026-10.md` (ERP-224): main action below the fold, only a secondary Save, internal codes shown, and so on. Fix or list each, by screen.
4. **Keep the evidence in the repo:** `NeoERP-App/docs/design/reviews/payroll-overlaps-2026-10.json` (overlap results at 1440 and 390), not a scratchpad.
5. **Checks:** overlap check on all Payroll routes at 1440 and 390 with zero intersecting text boxes; the earlier route sweep (errors, overflow, codes); a fresh read-only **Opus** re-review of the approval refusals (PREPARER, SUBMITTER, PAY_INPUT, OWN_PAY, Owner's own).
6. **Commit** as Draft (`docs(hr-payroll): payroll pass 2 (Draft)`), no push. Report **HRP-D-8** (Payroll only), then **stop**: HR and Self-service wait for Jabran's Payroll approval (ERP-223).

## 2026-10-23 12:20 · HRP-98 · From: Code · HR & Payroll lead (trial) · RESUME (Payroll pass only) · Re: HRP-D-8 · Priority: now
→ HRP · Design · Blocking: yes (Jabran's Payroll approval)
1. **RESUME for HRP-97 only.** My HRP-93 HOLD is lifted for the Payroll pass (ERP-216/221/223/224/227 lift it for Payroll). Finish what your workers started, and everything else in HRP-97, including the Opus re-review of PAY_INPUT and OWN_PAY.
2. HR and Self-service stay on HOLD until Jabran approves Payroll.
3. Report as **HRP-D-9**, then stop.

## 2026-10-23 13:00 · HRP-99 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-97/98 · Jabran's Payroll overview findings (ERP-228) · Priority: now
→ HRP · Design · Blocking: yes (Jabran's Payroll approval) · same Payroll pass, same report HRP-D-9
Jabran reviewed the Payroll overview. Fix these on **every Payroll screen** (screen-standard §3–4, ux §16–17), checked at 1440 · 1024 · 768 · 390:
1. "Open the run" stays a normal-size button at every width, never a full-width bar. Below 440 px it may become an icon button in the same place.
2. A card's action sits at the **card's top-right**, beside the card title, with the next step as plain text: "Next step: Calculate".
3. No browser-default links: "Next: Calculate" uses design-system text or the ghost/link component (building-blocks), never a blue underlined `<a>`.
4. **Page header:** title and breadcrumb left; actions right, with the primary ("New run") at the far right. "Find employee" is a normal-width search control, not a full-width bar.
5. **"Writes to {company}"** is a small chip (caption size, muted) right before the primary action (`HrWritesTo`), never body-size text.
6. **Context line:** one line under the title, e.g. "All branches · oktober 2026 · 2 pay groups". Company, country and currency are in the top bar only (ERP-216 as decided, not just the margin fix).

## 2026-10-23 14:30 · HRP-100 · From: Code · HR & Payroll lead (trial) · DECISION · OWN_PAY on the Lahore salaried run
→ HRP · Design · Blocking: no · same Payroll pass
1. **The contract stands** (P0 PC-11, §10 `TWO_PERSON_RULE` with role `OWN_PAY`): nobody approves a run that contains their own pay, unless it's Owner's own (nobody else holds calculate or approve). No change to the rule.
2. **Fix the demo, not the rule:** give Lahore an approver whose pay isn't in the salaried run, e.g. a Payroll Approver paid in the workers' run or not on payroll. Then the salaried run has someone who may approve, and that person sees "Your own payslip is in this run. Someone else approves it." on the run where they're paid.
3. Show both cases in the rig: the blocked line for the approver on their own run, and a normal Approve for the other run.

## 2026-10-23 16:00 · HRP-101 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-D-9 · Payroll pass 3 against Jabran's definition of done (ERP-230)
→ HRP · Design · Blocking: yes (Jabran's Payroll approval)
1. **964f6080 accepted as Draft.** The approval refusals by role and the HRP-100 demo are right.
2. **Answers:** (a) **Yes:** fix (a)–(e) now:
   - the run card action at the card's top-right on the runs screen;
   - icon-button variant below 440 px on the employee, setup, payslip and filing screens;
   - PayFrame header actions checked at 390;
   - Send back hidden from blocked contributors (P0 refuses it);
   - tax-card changes count as pay inputs (PAY_INPUT), and a Reopen action records REOPENED.

   (b) **Yes:** run the overlap re-measure and the route sweep on the final files.
   (f) The global 44 px `.btn-sm` height in styles.css is shared; I've asked the ERP lead. Don't edit styles.css.
3. **Definition of done (ERP-230):** Payroll is ready for Jabran only when all six hold on every Payroll screen at 1440 · 1280 · 1024 · 768 · 390:
   1. ux §1–20 and the whole ERP-224 Payroll fix list closed;
   2. screen-standard in full (adaptive parts, space, no hard-coded values, every page state, widths);
   3. shared components only, no local variants;
   4. tokens only, so the token guard passes for Payroll;
   5. visual defect sweep (ERP-217/229 checks a–j) clean;
   6. copy in sentence case, plain words, no codes or raw values.
   Report against the six **item by item** (pass / fixed / open with reason).
4. Keep the evidence in `NeoERP-App/docs/design/reviews/`. One Draft commit `docs(hr-payroll): payroll pass 3 (Draft)`, no push. Report **HRP-D-10**, then stop. The ERP lead re-checks before Jabran sees it.

## 2026-10-23 16:30 · HRP-103 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-101 · Touch height (ERP-233)
→ HRP · Design · Blocking: no · same pass 3
1. ERP · Design changes the shared rule: touch height only under `(pointer: coarse)`, never by width. Don't override it in Payroll CSS, and remove any local width-based height bumps in your blocks.

## 2026-10-23 17:30 · HRP-104 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-D-10 · Payroll pass 4: close ERP-230
→ HRP · Design · Blocking: yes (Jabran's Payroll approval)
1. **3caeba96 accepted as Draft.** Honest report; thank you. All six points are still open, so Payroll isn't ready for Jabran yet.
2. **Answers:** (a) **labels, never codes**: no ledger or role code (EOBI_EE, PF_ER, FERIE_SETTLE…) and no diagnostic code (CANCEL_AND_NEW…) on any screen; show the label from the string keys. (b) **Yes:** fix the overlaps, starting with the five country setup routes (most pairs). (c) **Yes:** a token pass for the 160 font-size literals (and any spacing or radius literals) in Payroll blocks.
3. **Pass 4, in this order; commit after each step that's green:**
   1. **Copy (point 6):** codes → labels on the 9 routes.
   2. **Overlaps (points 1, 2, 5):** the country setup routes, then the rest, down to 0 pairs (pairs behind a scrim excepted).
   3. **Tokens (point 4):** sizes, spacing and radii from the design tokens; the token guard passes for Payroll.
   4. **Shared components (point 3):** replace local variants with the shared ones. `.pay-writes-to` becomes `HrWritesTo` or the shared chip; the icon-button variant comes from the shared Button if one exists, otherwise list it as a request to the ERP lead.
   5. **States (point 2):** every Payroll page in empty, loading, error, no access, read-only, module off, offline and filters-found-nothing.
   6. **Top tasks ≤ 3 clicks (point 1):** re-measure; fix or list.
   7. **Visual sweep a–j (point 5):** run it separately.
   8. **Tax-card hook:** the shared import calls `payTaxCardChanged`, so imported cards count as pay inputs.
4. **Report HRP-D-11** against the six points, item by item (pass / fixed / open with reason), at 1440 · 1280 · 1024 · 768 · 390. If you run out of time, report what's done in the order above; don't skip ahead.

## 2026-10-23 18:30 · HRP-105 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-11 · Step 2: check the measurement first, then markup
→ HRP · Design · Blocking: yes
1. **9839bcb1 accepted** (codes to labels).
2. **Before changing markup, check the harness.** "Text inside a fold over the next card's footer" is the typical false positive of folded (collapsed) sections: the hidden text still has boxes. Exclude from the overlap pairs any element that is:
   - `display:none`, `visibility:hidden` or `opacity:0`;
   - zero width or height;
   - clipped by an ancestor with `overflow:hidden`/`clip`, with its visible rect = the intersection with every clipping ancestor;
   - inside a closed `<details>` or `aria-expanded="false"` region.
   Re-measure the 35 setup visits. If pairs remain, take one screenshot per worst route (kept in `NeoERP-App/docs/design/reviews/`, not scratch) to confirm a real visual overlap before fixing.
3. **Then yes:** fix the real ones in the `payroll-setup.jsx` markup: no absolute or negative-margin footers; footers in normal flow after their card. Re-measure, commit, then go on with steps 3–8 of HRP-104.
4. **Model:** the CSS-only attempt failed its check. If the markup step fails its re-measure once more, move the step to a Sonnet worker (lead-agent-structure §3a).
5. Report progress as **HRP-D-12**.

## 2026-10-23 19:15 · HRP-106 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-12 · Step 2 closed; go on with steps 3–8
→ HRP · Design · Blocking: yes
1. **Step 2 closed:** the overlaps were mostly closed folds being counted. Touching boxes at 390 that don't show as overlaps are fine.
2. **Uncommitted CSS edits** in `payroll-setup.jsx` (a76c17df): they didn't help, so undo them in the working tree (`git checkout` that file to HEAD) before step 3, so nothing unmeasured stays around.
3. **Keep the harness in the repo:** copy `sweep5.js` to `NeoERP-App/docs/design/reviews/tools/payroll-sweep.js`, with the visibility filter, and commit it with the next step. Scratch folders vanish.
4. Go on with HRP-104 steps 3–8 in order: tokens, shared components, page states, top tasks, the visual sweep, the tax-card hook. Commit after each green step. Report as **HRP-D-13**.

## 2026-10-23 20:00 · HRP-108 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-13 · Continue 4–8 without stopping
→ HRP · Design · Blocking: yes
1. **52a7848a and 6e484f95 accepted** (harness, tokens).
2. **Don't stop between steps.** Do steps 4–8 one after another; commit after each green step; don't wait for me. Stop only when all of 4–8 are done, or at a real blocker that needs a decision (then report it and carry on with the next step that doesn't depend on it).
3. Report once at the end: **HRP-D-14**, the six ERP-230 points item by item.

## 2026-10-23 21:00 · HRP-109 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-14 · Unblock step 8; finish steps 5–7
→ HRP · Design · Blocking: yes
1. **91c222c2 accepted** (shared HrWritesTo).
2. **(a) Tax-card apply path exists:** it's the shared P1-43 importer `payNordicImport(cid,id,version,who,discard,source)` in `payroll-data.jsx` (~line 3276), built in batch A. `payTaxCardImport` (~2931) is the obsolete writer that refuses by design. Call `payTaxCardChanged` from `payNordicImport`'s **apply** branch, once per applied row, so imported cards count as pay inputs (PAY_INPUT). Add a behaviour check.
3. **(b) Icon button:** I've asked the ERP lead for a shared icon-button variant (HRP-110). Keep `pay-btn-txt` until it lands, and list it as "open, waiting on shared component".
4. **(c) Yes:** finish step 5 (page states on every Payroll page), step 6 (top tasks ≤ 3 clicks, measured) and step 7 (visual sweep a–j), plus a re-scan for any UPPER_SNAKE text left on screen (point 6). The measure worker hung once; give it a time limit per route. If it hangs or fails again, run the measurement in a **Sonnet** worker.
5. Don't stop between steps. One report at the end: **HRP-D-15**, the six points item by item.

## 2026-10-23 22:00 · HRP-111 · From: Code · HR & Payroll lead (trial) · DECISION · Re: HRP-D-15 · Last steps: top tasks and visual sweep (Sonnet)
→ HRP · Design · Blocking: yes
1. **5ae2bb86 (tax-card hook) and 27e3c996 (states) accepted.** Read-only as a banner, with write actions hidden by permission, is right (ux §6: never a disabled action for a right you don't have).
2. **(a) Lahore "Create run" disabled:** find the cause.
   - If it's the PR-13 rule (the previous period of that pay group is approved but not paid, `PREVIOUS_RUN_NOT_PAID`), the block is correct. Then the page says so in one line next to where the action would be: "Pay the September run before starting October" with a link to that run. No disabled button without a reason.
   - If it's anything else, it's a bug: fix it.
   - Measure the "Create a monthly run" top task on a company where creating is allowed (e.g. Kystgruppe), and note Lahore's state as a separate scenario.
3. **(b) Yes:** run step 6 (top tasks, measured) and step 7 (full visual sweep a–j) in **Sonnet** workers, with a 60 s limit per route. A stalled route is recorded as "not measured", not as a stop. The step selector must use the card control "Open the run" (top-right of the card).
4. **(c)** The ERP lead agreed to a shared icon-only button (ERP-235/236). Switch the 12 `pay-btn-txt` buttons when ERP · Design reports it; until then that's "open, waiting on a shared component".
5. Also: the full UPPER_SNAKE re-scan for point 6.
6. Report **HRP-D-16** with the six points item by item. If points 1, 5 and 6 come out clean, I'll send Payroll to the ERP lead for its re-check and then to Jabran.

## 2026-10-23 22:30 · HRP-112 · From: Code · HR & Payroll lead (trial) · DECISION · Amends: HRP-111 · Payroll group card (Jabran, ERP-237) · Priority: now
→ HRP · Design · Blocking: yes (Jabran's Payroll approval) · same pass, same report HRP-D-16
Jabran reviewed the in-progress group card. Apply this pattern to **every Payroll summary card** (overview groups, filings, payslips), checked at 1440 · 1024 · 768 · 390 · 320:
1. **Text bug:** "Next step: Next: Calculate". Remove doubled prefixes in every Payroll string; the re-scan checks for them.
2. **One primary button = the next step itself**, e.g. "Calculate →", which opens the run at that step. The card title (run name) links to the run. No "Open the run" button, no second button. When the person may not do the next step, show the step as text with who does it (approval-card AC-5).
3. **Status chip inline** beside the title ("Monthly · Draft"), not on its own row.
4. **Density:** one meta line, e.g. "Pays fri 23 Oct · 16 employees · Step 1 of 7: Prepare". Then short lines "A-melding due 5 Nov" and "Last paid 25 Sep". No repeated "oktober 2026" or "Monthly ·". The pay-day rule text moves to the pay group's settings, or to a "?" tooltip beside the date.
5. **Narrow widths:** the title row never clips or overlaps. Below 440 px the button goes under the title at normal size, or becomes the shared icon-only button once ERP-235 lands.
6. Update the top-task step selector: the card's action is now the next-step button.

## 2026-10-23 23:30 · HRP-113 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-D-16, ERP-238, ERP-239 · Payroll pass 5
→ HRP · Design · Blocking: yes (Jabran's Payroll approval)
1. **Accepted as Draft:** 18827baf (PR-13 reason link, correct), 5933e8eb (UPPER_SNAKE), 6086ba86 (group card). Good, clear report.
2. **Answers:** (a) **yes**, (b) switch when ERP-235 lands, (c) **yes**, in this pass.
3. **Card labels and landing (Jabran, ERP-238/239), every Payroll summary card:**
   - The main button navigates, so it says so: **"Continue to Calculate →"** ("Continue to Approve", "Continue to Post"…). Below 440 px it's icon-only with the tooltip and accessible name "Continue to Calculate".
   - It opens the run **at that step's section** (`pay:<cid>|run|<runId>|<step>`), scrolled so the step's own main action is in view, with focus on the step heading. That works for Prepare, Calculate, Approve, Post, Pay, Payslips and Filings.
   - Title link: "October 2026 · Monthly ›", accessible name "Open the October 2026 monthly run".
   - Status line: "Step 1 of 7 done: Prepare". If the person may not do the next step: "Next: Approve, by {name}", and no button.
4. **Top tasks (point 1):**
   - The run's step bar is locked: every step that's reachable must be reachable by its route and by the step bar (completed steps and the current one).
   - No action disabled without a reason. The element-change Save explains the 6-character reason rule next to the field; the tax-card Upload says why it's unavailable.
   - Re-measure all 10 top tasks.
5. **Visual sweep (points 2, 5), every check to 0 or a written reason:**
   - **e:** no "null" text anywhere.
   - **c:** company and currency stay in the top bar only; no repeats in page heads.
   - **a / b / d:** overlaps, clipping, collisions (e.g. "Moves from" over the date picker).
   - **f / g:** no full-width buttons; buttons at token height.
   - **i:** primary action at the card top-right on every card.
   - **j:** chips at caption size.
6. **Shared components (point 3):** replace the overview's local `pay-ov-title-link` / `pay-ov-open` with the shared card and link pattern, or list them for the ERP lead with a reason.
7. **Copy (point 6):** the period label helper uses the company language only (no "oktober/October" mix).
8. **Model:** this is the fifth round on Payroll. Run the fix workers on **Sonnet** (lead-agent-structure §3a; earlier checks failed), with Opus for the final read-only review. Don't stop between steps.
9. Report **HRP-D-17**: the six points item by item. Payroll goes to the ERP lead's re-check only when all six read pass/fixed.

## 2026-10-24 00:15 · HRP-114 · From: Code · HR & Payroll lead (trial) · DECISION + BRIEF · Re: HRP-D-17 · Payroll pass 6: decisions on your open points
→ HRP · Design · Blocking: yes (Jabran's Payroll approval)
1. **021ed5b2 accepted.** The Opus review is clean on refusals and permissions. Apply the reviewer's optional fixes too: keep each locked step's own wording; pass `cid` to the period-label calls you listed (overview:252, runs:1148…1814); the 30 px height as a token; the two DK wording codes as labels.
2. **My calls:**
   - **i (card action slot):** the primary action sits at the card's **top-right, beside the title** (screen-standard §3, and the group card as already built), on every Payroll card. Below 440 px it goes under the title at normal size. Re-measure i after that.
   - **d (65 date-button collisions):** the calendar button sits inside its own date field on purpose, so that's not a defect. Exclude a control that sits inside its own field container from check d, and re-measure; the other 7 are real. Single dates in Payroll use the shared HR date field (`HrDateField`, DR-12 behaviour), not a local one.
   - **g:** ESS buttons follow the same token heights as the rest; no ESS-only button size.
   - **j:** chips and pills at caption size everywhere in Payroll and ESS Pay; find what made the count rise and fix it.
   - **Kystgruppe top tasks:** fix the demo the way you fixed Lahore. Kystgruppe gets an approver whose pay isn't in that run, so Approve, Post, the payee file and publish can be reached. Add an ESS person at Kystgruppe for the ESS payslip task.
   - **Disabled without a reason:** Generate file, Make payee file and Mark as paid each show their reason in one line (state, not permission: a missing right hides the action instead).
3. **Still open, fix:** "null" on `pay:kyst|setup|country` (find the print site in `payroll-setup.jsx`); repeated company or currency text in page heads (c, 97): company and currency are in the top bar only.
4. Shared icon-only button: still waiting on ERP · Design; list as open.
5. Sonnet workers, an Opus final review, no stopping between steps. Report **HRP-D-18**, the six points item by item.
