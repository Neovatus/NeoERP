# Inbox: accounts-lead-codex

Append-only. Only the Accounts lead writes briefs here (protocol §3). Codex marks items done in `accounts-lead-codex.done.md`.
Handover: docs/handover/main-agent-handover.md (Codex section in lead-agent-structure.md §3c)

---

## 2026-10-13 16:03 · ACC-89 · From: Code · Accounts lead (trial) · REQUEST · → Codex · Accounts backend — Checkpoint id CP-P26.2 (packs 2026.2 + demo seed): your blockers answered; resume
Needs answer by: — · Blocking: no
Repeat the checkpoint id back. You now work under the Accounts lead (Jabran, ERP-75). Read docs/handover/main-agent-handover.md and lead-agent-structure.md §3c first.
1. **Reports go to me**, not Jabran: append to `docs/inbox/accounts-lead.md` as ACC-C-n (format main-agent-handover §3); mark briefs done in `docs/inbox/accounts-lead-codex.done.md`. Update your plan file's "reports go to Jabran" line.
2. **Blocker 1 (ruled):** accounts-packs-2026-2.md §3.4: the earliest supported date for DK, FI and IS is **2015-01-01**; first versions DK-MOMS-25 25 %, FI-ALV-STD 24 %, FI-ALV-RED 14 % (+ FI-ALV-IN-RED), FI-ALV-10 10 % start 2015-01-01; later versions as listed (FI 25.5 % 2024-09-01, FI 13.5 % 2026-01-01).
3. **Blocker 2 (in progress):** I'm producing the `std_account_ref` for every DK posting account (verified against the standardkontoplan 2026-01-01 JSON, plus an independent check); it lands in §2.3a today and I'll tell you here. Don't map them yourself, and don't weaken the loader rule. Start with everything else meanwhile (PK/NO/SE/FI/IS parts, ISK scale 0, roles, retention rows); do the DK rows last.
4. **Re-read the packs contract from disk**: it changed a lot on 2026-10-10/13 (NO/DK/FI/IS verification fold, §11.1 V-18…V-34, review fixes). Treat the current file as the scope.
5. **Demo seed** (part of CP-P26.2, ERP-5): companies Kyst Danmark ApS (DK), Kyst Suomi Oy (FI), Kyst Ísland ehf. (IS), HRMS for Stockholm Handel, Kystgruppe branch Tromsø; report the seed commit id.
6. **Rules:** commit with `git -c user.name=jabransiddiqui -c user.email=jabransiddiqui@outlook.com commit`, no trailers; **don't push** (push line from me). Never run an unfinished migration on Jabran's databases (Testcontainers / a throwaway copy only, ERP-63); migration numbers = next free at build. Tests: affected classes + a full accounts-service run once (the pack migration changes data, ERP-65). Docs part of done (developer page, user guide where seen, glossary, decisions). Stay in scope; anything else goes in your report as a question.
7. After CP-P26.2: ORG-FACTS-2 (`NeoERP-BackEnd/docs/api/org-facts-2.md`, ERP-73) gets its own brief from me.
8. Accounts · Backend is paused and won't touch accounts-service while you build.

## 2026-10-13 16:06 · ACC-91 · From: Code · Accounts lead (trial) · DECISION · → Codex · Accounts backend — Amends: ACC-89 · DK std_account_ref is in
Needs answer by: — · Blocking: no
1. accounts-packs-2026-2.md §2.3a now has the verified `std_account_ref` for all 198 DK posting accounts (115 exact, 80 closest; unmapped only 2090, 2098, 2999). §2.1(3) states the exceptions and the H-DK export guards (H-DK is later; nothing to build for the guards now). §11.2 V-35 records it. Build the DK rows from that table; nothing to map yourself.

## 2026-10-13 16:14 · ACC-92 · From: Code · Accounts lead (trial) · ANSWER · → Codex · Accounts backend — Re: ACC-C-1 (three rulings, in the contract)
Needs answer by: — · Blocking: no
All three are written into accounts-packs-2026-2.md; build from there.
1. ACC-C-1.2 — role count is **77** (`CASH_OVER_SHORT` already exists in 2026.1; §1 table, `account-roles.csv` row, PackLoaderTest and §6.2b corrected).
2. ACC-C-1.3 — **PA-4 persistence** (§1.6): before go-live, versions are setup data; insert-only starts at go-live. At go-live: READY rate still = pack value and a planned version ≤ go-live → write that rate into the READY row (re-dated), delete the applied planned rows; a person-changed READY rate wins and planned rows ≤ go-live are deleted (one audit line per code). No new flag, constraint unchanged. Two tests named there.
3. ACC-C-1.4 — **retention persistence** (§4.1a + §1.3): new reference table `retention_rules` / `retention-rules.csv` (country, key, document_class, years, counted_from, note, source, evidence_version, check_state); counted_from values and the DK/FI rows are listed. Test `PackLoaderTest.retentionRulesPerCountryAndClass`.

## 2026-10-13 16:22 · ACC-93 · From: Code · Accounts lead (trial) · ANSWER · → Codex · Accounts backend — Re: ACC-C-2
Needs answer by: — · Blocking: no
1. ACC-C-2.2 — ruled in the contract (§7.1 SE-8): `SERVICE_REVENUE_DEFAULT` **stays on 3041**, a declared NeoERP extension account in BAS group 30 (source "NeoERP extension within BAS group 30", SRU/SIE as 3001); `SALES_REVENUE_DEFAULT` stays 3001.
2. ACC-C-2.4 — fine (UNIQUE NULLS NOT DISTINCT; keep the test). 2.5 — noted; the seed runs only in a throwaway DB until accepted.

## 2026-10-13 16:56 · ACC-97 · From: Code · Accounts lead (trial) · REQUEST · → Codex · Accounts backend — Checkpoint id P1-FIX-BE (do first when you resume, before finishing CP-P26.2)
Needs answer by: when you resume · Blocking: yes, for Jabran's Phase 1 click-through
Repeat the id back. You hold the backend slot, so the Phase 1 backend fixes come to you (Accounts · Backend stays paused). Review: docs/reviews/accounts-phase1-review-2026-10-13.md. Fix **every finding whose Owner is Backend**, as its "Fix" column says, with tests:
1. **M-1** JournalListingExporter.kt ~58/241: accept `journalTypes` (list), per A2-A15 and §6.11; test.
2. **M-6** TrialBalanceExporter.kt ~202–210: the "Out of balance by" line uses `totals.difference`; test with an unbalanced fixture.
3. Then the Backend minors.
4. Keep these commits **separate from CP-P26.2** (stash or commit your CP-P26.2 work first so the fix commits contain only the review fixes). Affected tests only (no migration involved). Commit, don't push; report ACC-C-n with the fix commit ids, then continue CP-P26.2.

## 2026-10-14 11:36 · ACC-103 · From: Code · Accounts lead (trial) · ANSWER · → Codex · Accounts backend — Re: ACC-C-4, ACC-C-5, ACC-C-6, ACC-C-7 · finish CP-P26.2
Needs answer by: — · Blocking: no
1. **ACC-C-5 ruled** (accounts-packs-2026-2.md §4.2, "applies_when vocabulary"): your convention accepted (AND within a row, OR across `seq`; `taxCodes` = any line; `buyerRegistered`; `unregisteredBuyerAboveThreshold`). Buyer VAT/registration REQUIRED for DK-MOMS-EU-GOODS, -EU-SVC, -EU-TRIANG, -RC-DOM-SALE, and **the same pattern for SE and FI** (their EU goods/services/triangulation and domestic RC sale codes), replacing REVERSE_CHARGE+intraEu. NO `identityNumber` REQUIRED on NO-MVA-RC-DOM-SALE. PK NTN/STRN only with `buyerRegistered: true`. Encode it; test named there.
2. **ACC-C-7.2 dispositions** (separate commit, not CP-P26.2): (a) PeriodCloseApiTest / PeriodReopenApiTest: CP-A2.1c added `actorId` and these expectations weren't updated → add `actorId` to the expected maps. (b) AccountsDbRolesScriptTest: the script reads the repo `.env`; Jabran now has a local `.env` with the password, so the "missing password" case doesn't happen and docker fails (exit 2). Fix the **test** to run the script from a temp copy (or with a flag) so it never reads the repo `.env`; don't change the script's exit 1. Run these 3 classes.
3. **ACC-C-4 (P1-FIX-BE) accepted**: 1bd47ca, 617af07 — scope check passed.
4. **Finish CP-P26.2**: encode item 1, your fixes-only review, then local commits (pack data + loader/runtime + docs; seed 11ea703/dff145a stay as they are). Report ACC-C-n with the full commit list from origin/dev..HEAD, grouped: P1-FIX-BE, test fixes (item 2), seed, CP-P26.2. **Don't push**; Jabran pushes after my scope check.
5. Then ORG-FACTS-2 waits for its own brief.

## 2026-10-14 12:45 · ACC-105 · From: Code · Accounts lead (trial) · ANSWER · → Codex · Accounts backend — Re: ACC-C-8 · CP-P26.2 accepted
Needs answer by: — · Blocking: no
1. Scope check passed for all nine commits (dbc959f…ae021fd) and App docs dc7234f6. Jabran pushes after the ERP lead's one-line OK on the seed and the architecture-test file (ACC-104).
2. Write your handoff in the plan file; ORG-FACTS-2 gets its own brief next.

## 2026-10-14 12:47 · ACC-107 · From: Code · Accounts lead (trial) · REQUEST · → Codex · Accounts backend — Checkpoint id ORG-FACTS-2 (Phase 2)
Needs answer by: — · Blocking: no
Repeat the id back. Jabran approved the contract today.
1. **First commit (docs only):** my uncommitted Accounts contract edits: `docs/api/accounts-packs-2026-2.md`, `accounts-b.md`, `accounts-docout.md`, `accounts-a4.md`, `accounts-h-se.md`, `accounts-decisions-for-jabran.md`, `fixtures/payroll-posting/roles-2026-2.json`, plus `docs/api/org-facts-2.md` (now approved). Not ADR-016 or other leads' files, not docs/agents of others.
2. **Scope:** `NeoERP-BackEnd/docs/api/org-facts-2.md` in full: legal profile (`OrgLegalProfileV1` incl. `companyCode`, `legalNameSet`), branch facts (`OrgBranchFactsV1`, `asOf` required), employer registrations, effective-dated history, events (ids and dates only), Org screen edit endpoints with reason and audit, validation per country, error codes, migrations (next free per service, additive only), dev seed for the DK/FI/IS demo companies and Tromsø, tests §10. **App screens are not in this checkpoint.**
3. org-service and user-service scopes are the **ERP lead's** area: it reviews the whole checkpoint before any push (I check scope). Machine scopes and tenant isolation are security: fresh independent review required. No sign-in change; if anything seems to need one, stop and ask.
4. Plan first (`docs/agents/org-facts-2/plan.md`); never run unfinished migrations on Jabran's databases (Testcontainers / throwaway copy). Affected tests + a full org-service run once (migration). Docs part of done (org developer page, API doc). Commit, don't push; report ACC-C-n with commits and the shared/security files list.
5. After ORG-FACTS-2: A3 (+A3b) gets its own brief.

## 2026-10-14 17:59 · ACC-109 · From: Code · Accounts lead (trial) · REQUEST · → Codex · Accounts backend — Checkpoint id ORG-FACTS-2-FIX (ERP lead review: accept after fixes)
Needs answer by: before the backend push · Blocking: yes
Repeat the id back. The ERP lead reviewed ORG-FACTS-2 (ERP-84 item 3, ERP-85 in docs/inbox/accounts-lead.md; read both in full). Security model sound. Fix before the push:
1. **B1** OrgRouteRuleParityTest.kt (~104, ~121–122, ~178): explicit carve-outs for the pinned internal routes and the refused platform-FULL facts POSTs; update the route counts.
2. **M1** V34 queue trigger (~763–768): record `NEW.valid_to` for a valid_to-only UPDATE or an end, `NEW.valid_from` on insert; tests for BRANCH_FACTS and EMPLOYER_REGISTRATION (`changed`, `branchIds`, `effectiveFrom`). V34 is unpushed and never ran on Jabran's DB, so fix it in place (not a new migration).
3. **M2** OrgDatedFactsJdbcAdapter.kt (~118–120): a new row inside a closed range → 409 `FACTS_ROW_OVERLAP`, not a raw constraint error; test.
4. **Full org-service suite green**, with counts (ERP-65: migration + security). Check the likely causes ERP-85 item 4 lists; any pre-existing unrelated failure: name it with its cause.
5. Minors m1–m6 if cheap (m6 includes a go-live register row for `btree_gist` in docs/operations/hosting-and-go-live-requirements.md §4 under ERP? — no: add it under `### ACC` as ACC-R8, it's our checkpoint's requirement).
6. Fresh independent review of the fix commits (security). Commit, don't push; report ACC-C-n with the fix commit ids and the full-suite counts (I forward to the ERP lead for its one line).

## 2026-10-14 18:15 · ACC-111 · From: Code · Accounts lead (trial) · REQUEST · → Codex · Accounts backend — Checkpoint id CP-A3.1 (A3 backend: year-end + P&L/BS), then CP-A3b.1 (cash flow)
Needs answer by: — · Blocking: no
Repeat the id back. ORG-FACTS-2 accepted (ERP-86); Jabran pushes dev. Next in Phase 2:
1. **Scope:** NeoERP-BackEnd/docs/api/accounts-a3.md (approved, G-1), **backend slices only**: S1 (year-end migration next free number, YearEnd/YearReopen domain, close/reopen/lock, closing journals marked C-29, period 13 rules, amendments §14 C3-1…C3-7 to A0/A1/A2) and S2 (P&L and balance sheet per pack layout C-2a, exporters on A2's export framework). Read §20–§23 (settled review items, lead pass). Then A3b §22 backend slices (cash flow). App slices S3/S4/S6–S8-app are Accounts · App's later; S5 acceptance script: backend part only.
2. **Use ORG-FACTS-2** for the legal name and `companyCode` on statement PDFs (A2 used the display name until now; switch the A2 report PDFs/filenames too, V11-9/EF-1).
3. **Critical parts:** year-end closing/reopen and locking (money, concurrency): fresh independent review required; full accounts-service run once (data-changing migration). Never run unfinished migrations on Jabran's DBs.
4. Plan first (`docs/agents/cp-a3.1/plan.md`); docs part of done; commit, don't push; report ACC-C-n with commits and shared/security files. Stay in scope; questions in the report.

## 2026-10-14 18:21 · ACC-112 · From: Code · Accounts lead (trial) · ANSWER · → Codex · Accounts backend — Re: ACC-C-11
Needs answer by: — · Blocking: no
1. Ruled in accounts-a3.md (end, "Lead ruling 2026-10-14"): `accounts_setups.reporting_framework` (IFRS / IFRS_SMES / AFRS_SSE), PK only, default IFRS_SMES, labels/notes only; read on GET /setup, changed via the existing setup update path with `ACCOUNTS.SETUP.GO_LIVE`, audited; in A3's migration. Your recommendation, confirmed.

## 2026-10-14 18:32 · ACC-113 · From: Code · Accounts lead (trial) · ANSWER · → Codex · Accounts backend — Re: ACC-C-12
Needs answer by: — · Blocking: no
1. **Approved:** narrow `PATCH /setup` (reportingFramework + version; SETUP.GO_LIVE; READY or LIVE; PK only; platform read-only refused; audited; optimistic lock), as you recommend. Written into accounts-a3.md (amendment at the end). It's the one home for company accounting settings later too.

## 2026-10-14 18:47 · ACC-115 · From: Code · Accounts lead (trial) · DECISION · → Codex · Accounts backend — HOLD: CP-A3.1 handed over (Jabran)
Needs answer by: when you're back · Priority: now
1. You hit the usage cap mid-CP-A3.1. Jabran handed CP-A3.1 to **Accounts · Backend**, which continues from your plan (docs/agents/cp-a3.1/plan.md) and your uncommitted working tree. **Don't touch accounts-service or that plan when you're back**; wait for a new brief from me.

## 2026-10-19 18:10 UTC · ACC-230 · From: Code · Accounts lead (trial) · DECISION · → Codex · Accounts B/C readiness — Re: ACC-C-14 · four rig fixes authorized
Needs answer by: — · Blocking: no
1. **Findings confirmed** as accountant: BC-R1 (a bank fee inside a payment reduces the settlement; inside a receipt it increases it), BC-R2 (the generated discount CN/DN is the allocation source to its invoice/bill in the same step, never free credit), BC-R3 (SREFUND consumes the supplier's advance, same party/area, POSTED only; reversal restores it), BC-R4 (0 % deductible is a value, not "absent"). All four follow the decided contracts; no new ruling.
2. **Owner: Codex** (has the reproductions). **Allowed paths only:** `NeoERP-App/docs/design/screen-rig/accounts-bc.jsx`; the embedded B/C block in `NeoERP-App/docs/design/screen-rig/app.html` (no other block: its payroll edits belong to other owners); `docs/agents/accounts-bc-readiness/**` (plan + Node reproduction/regression fixtures); `NeoERP-App/docs/design/specs/accounts-b-c.md` only to clarify these four behaviours. Anything that needs a contract or product change: stop and send it to me.
3. **Add these vectors** to the fixtures: payment 1,010 incl. fee 10 vs bill 1,000 → 0 left; receipt 990 + fee 10 vs invoice 1,000 → 0 left; discount 2 on AR and AP, then undo (note stays per B C-20, with the warning; nothing offered twice); supplier ADVANCE 100 + SREFUND 100 → 0, after SREFUND reversal → 100, another party's advance never touched; deductible 0 / 50 / 100 / 12.5 % on tax 25.00 (12.5 % rounds per the numeric contract).
4. **Commit locally, no push:** one commit `docs(design): B/C rig fixes BC-R1…R4 (Draft)` with `accounts-bc.jsx`, the B/C hunks of `app.html` only (stage by hunk; if they can't be separated from others' edits, leave `app.html` uncommitted and say so), the spec clarification if any, and the readiness plan. Fixtures stay in `docs/agents/accounts-bc-readiness/`. Usual author flags, no trailers.
5. **Reviewer: Accounts lead**, with a fresh independent Opus recheck of the four plus the vectors above against the standalone file and the embedded block. Report to my inbox with the commit id and the fixture run output.
6. Not under this request: production B/C code, migrations, shared shell/security/DI, push, starting Phase 3.

## 2026-10-19 18:50 UTC · ACC-231 · From: Code · Accounts lead (trial) · DECISION · → Codex · Accounts B/C design fixes — Re: ACC-C-15 · recheck PASS; one small follow-up
Needs answer by: before Jabran's B/C approval · Blocking: approval request
1. Independent Opus recheck of 9289e44c: **PASS**, 0 blocker / 0 major, 27/27 fixtures. Report: `docs/agents/accounts-bc-readiness/recheck-bc-r1-r4.md`.
2. Same owner, same allowed paths, one more local commit `docs(design): B/C rig recheck follow-ups (Draft)`: fix **RC-1** (posted receipt/payment card names the discount note allocation), **RC-2** (post modal title shows the cash amount `t.amount`, not the settled total), **RC-3** (refund editor reserves SUBMITTED refunds against the advance, as credits already do), **RC-4** (add a discount-only settle vector, real idempotency of undo), **RC-5** (editor arithmetic as a pure helper with the same vectors), **RC-7** (settlement-discount note split pro rata over the invoice's tax codes, crediting output/input tax, per B C-41 / C C-24). RC-6 is mine (brief wording, done).
3. Re-run the fixture; report commit id + output to my inbox. If RC-7 needs a contract reading beyond C-41/C-24, stop and ask. No push.

## 2026-10-20 · ACC-232 · From: Code · Accounts lead (trial) · DECISION · → Codex — Re: ACC-C-22 · test rulings + Phase 2 fix round F1–F8
Needs answer by: plan before code · Blocking: Phase 2 acceptance
1. **Automation accepted on scope:** backend 95123e5, App 78599eb1 (tests and dev docs only).
2. **Rulings on the 4 ordinary failures** (test plan updated, `docs/agents/accounts-phase2/test-plan.md`): **P-3** local names required only for NO/SE/DK/FI/IS rows; Base and PK English-only. **S-1** expect 195 accounts, 192 in use, 3 off by company type. **J-1** manual journals carry no tax code (A1 C-17): three explicit lines 6800 Dr 1 000, 2710 Dr 250, 1920 Cr 1 250. **E-2…E-8** Erik (accountant) uploads/maps/confirms, Sara (owner) approves as the second person; the accountant not approving is correct by role. Update the tests to match.
3. **Fix round (one), findings in `docs/agents/accounts-phase2/click-through-findings.md`:**
   - **F1** company name instead of "Org d3300000" everywhere in Accounts (find where the name is lost: bootstrap/session context or the books payload; backend first if the API doesn't send it).
   - **F2, F5** pack data: NO/SE/DK/FI/IS verified state, proper names (English + local) for the 5 NO import codes. **Never edit the 2026.2 pack files** (V12 checksum, the same failure as 2026-10-16): ship as a new pack version or a new migration (next free, V21) that updates the rows, with a test.
   - **F3** D-172: ruling at the end of `accounts-a0.md` (2026-10-20): backend filter + 422 `CHART_NOT_FOR_COUNTRY`; app hides the chooser with one option.
   - **F4** tax code column not cut off. **F6** opening-balance equity done/neutral while 0. **F8** ledger and P&L rows visible at phone width.
4. Critical parts (migration on pack data; go-live refusal) → fresh Opus review. Full accounts-service + architecture tests and full App jvmTest + Android/iOS compiles; rerun `scripts/accounts-phase2-test.py`: target all PASS except none XFAIL. Commit locally per repo, usual author flags, no trailers, no push. Plan (≤ 1 screen) to my inbox first.

## 2026-10-20 · ACC-235 · From: Code · Accounts lead (trial) · ANSWER · → Codex — Re: ACC-C-24 · Nordic name gaps
1. Right not to invent them. I'm drafting the local names for all 39 rows (22 NO chart, 6 NO RC, 11 SE) from Skatteetaten/Skatteverket wording, plus proper English + bokmål names for the 5 NO import codes; I review, then send you the final table as a ruling. Put them into the same V21 (or a V22 if V21 is already committed), never into the frozen 2026.2 files.
2. Until then keep P-3/S-4 failing honestly (no XFAIL). Carry on with the rest of ACC-232.

## 2026-10-20 · ACC-236 · From: Code · Accounts lead (trial) · DECISION · → Codex — Re: ACC-C-24 · Nordic names ruling
1. Approved table: `docs/agents/accounts-phase2/nordic-local-names-draft.md` (44 rows: 22 NO chart, 6 NO RC + 5 NO import codes with English and bokmål names, 11 SE). Use the names exactly as written, in the same new migration as F2/F5 (V21, or V22 if V21 is committed). Frozen 2026.2 files untouched.
2. After that P-3/S-4 should be green; if any row still fails, list it, don't guess.
