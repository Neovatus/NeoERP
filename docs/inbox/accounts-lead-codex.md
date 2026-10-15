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
