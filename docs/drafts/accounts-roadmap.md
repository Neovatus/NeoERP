# Accounts roadmap (draft for Jabran)

Status: **Draft, 2026-11-21 (batch 2, Opus).** It approves nothing. Jabran decides the order (§7).
Brief: `docs/agents/accounts-roadmap/brief.md`. Read only: both code repos at `origin/phase/4`
(BackEnd `e36b6c6a`, App `bff8d14c`) and `origin/main` (BackEnd `c6d5a6ff`, App `370ad7a6`).

Short names: **BE** = `NeoERP-BackEnd`, **App** = `NeoERP-App`, **WS** = this workspace.
`roadmap:N` = `BE/docs/api/accounts-roadmap.md` line N. `backlog:N` = `WS/docs/backlog.md` line N.
`state:N` = `WS/PROJECT-STATE.md` line N. `gates` = `BE/docs/operations/hosting-and-go-live-requirements.md`.
Size: S (days), M (1–2 weeks), L (more). Risk: **money**, **security**, **statutory**, or none.

## 1. Product direction

- Built for large multi-company customers from day one, sold by module (`WS/docs/large-customer-roadmap.md:7`).
- Every large-customer feature is optional per company and off by default (same file, line 11).
- Dimensions, budgets and reporting are core: ADR-021 accepted, ADR-022 and ADR-023 still Proposed
  (`BE/docs/adr/ADR-022-budget-control.md:5`, `ADR-023-reporting-layer.md:5`).
- Launch order by country stays SE → NO → PK → FI → IS → DK (roadmap:92). So the first customer is a Swedish one.

## 2. Naming: old phase numbers against today's

The approved build table (roadmap:84-92, 2026-10-10) uses phase numbers that no longer match the work.

| Today | What it holds | Old table |
|---|---|---|
| Phase 3 (done, on `main`) | B, C, M5, SB2d dimensions, OI, OBI CSV/Excel | Phases 1–3 |
| Phase 4 (now) | A4, approval limits, then the finance-gap items (roadmap:68) | old 4 = A5 + A4 |
| Phase 5 | Documents and bank, plus FX and payment files (roadmap:69) | old 5 |
| Phase 5b | Controls and close (roadmap:70) | new |
| Phase 6 | Tax returns and statutory files per country | old 6 |
| Phase 7 | Intercompany and consolidation (roadmap:71) | new |

## 3. Inventory: every Accounts spec and API doc

19 app specs (`App/docs/design/specs/accounts-*.md`) and 29 API docs (`BE/docs/api/accounts-*.md`).
Many headers still say "not built" although the code is built. State below comes from migrations and code, not headers.
Migrations: `BE/services/accounts-service/src/main/resources/db/migration/`.

| # | Slice | App spec | API doc | State | Evidence |
|---|---|---|---|---|---|
| 1 | A0 setup and go-live | a0 | a0 | Done (main) | V6–V9 |
| 2 | A1 journals | a1 | a1 | Done (main) | V10; API header "built (CP-A1.1, 1f85eb6)" |
| 3 | A2 TB, ledger, periods | a2-a3 | a2 | Done (main) | V11; App `presentation/periods`, `reports/tb`, `gl` |
| 4 | A3 statements, year-end | a2-a3 | a3 | Done (main); header still says draft | V13, V20; App `presentation/yearend`, `reports/statements` |
| 5 | A3b cash flow | a2-a3 | (in a3) | Done (main) | V14; `service/report/cashflow/CashFlowReadService.kt` |
| 6 | H-SE SIE 4 | h-se | h-se | Done (main); header still says draft | V16, V17, V19; `service/sie`, App `reports/sie` |
| 7 | OBI opening-balance import | ob-import | ob-import | CSV/Excel done (main); SAF-T reader (CP-OBI.3) not started | V64; API header line 3 |
| 8 | OI opening items at go-live | opening-items-import | opening-items-import | Done (main); API header says app not built, but it is | V34, V38; App `presentation/openingimport` |
| 9 | B receivables (+ M5) | b-c | b | Done (main) | V26–V30, V52–V55, V59 |
| 10 | C payables (+ M5) | b-c | c | Done (main) | V31–V33, V45, V49–V51, V56–V58 |
| 11 | Payment reference agreements | — | reference-agreements | Done (main) | V50 |
| 12 | Packs 2026.2 / .3 / .4 / .5 / .5-pk / .5-tax | — | packs-2026-2, -3, -4, -5, -5-pk, -5-tax | Done (main) | V12, V15, V42, V46, V47, V48 (Kotlin migrations) |
| 13 | Dimensions on lines | dimensions | (ADR-021) | Part done: storage, maintenance, pickers (main). Not started: account rules D6, department, branch default cost centre | V60–V65; backlog:320 |
| 14 | A4 journal productivity | a4 | a4 | Done (main). Leftovers not started; QA-B2 fixes open | V67–V69; backlog:390; state:20 |
| 15 | AL approval limits | approval-limits | approval-limits | In progress: S1–S4 + app P1 done (S3 on main, S4 on phase/4). S5 and app P2 open | V70 (main), V71 (phase/4); App `presentation/approvallimits`; state:25 |
| 16 | Allocations | allocations | — | Not started (draft spec) | no allocation-key code; spec status line |
| 17 | Spreading schedules | (none) | (none; out of A4, `api/accounts-a4.md:88`) | Not started, no spec | `domain/recurring/Schedule.kt:8` leaves room |
| 18 | Budgets stage 1 | budgets | — (ADR-022 Proposed) | Not started | no budget code in accounts-service |
| 19 | Integrations + import with dimensions | integrations | — (ADR-021 Q13/Q14 open) | Not started | ADR-021 status line |
| 20 | Multi-currency | multi-currency | — | Not started | spec status line |
| 21 | Fixed assets | fixed-assets | — | Not started | 0 hits for "depreciation" in accounts-service |
| 22 | Bank feeds + payment files (D3/PF-1) | bank-feeds | — | Not started | spec status line |
| 23 | D + D2 bank and cash | d-e | d | Not started (draft) | API header line 6 |
| 24 | E tax report and returns | d-e | e | Not started (draft) | API header line 3 |
| 25 | Document output + e-invoicing | docout | docout | Not started (approved G-5). FBR states and Noop provider done (F1) | V59; `App/.../accounts-docout.md` §0 |
| 26 | Attachments | attachments | attachments | Not started (draft) | API header line 3 |
| 27 | A5 payroll posting (AccountsPostingV2) | — | a5 | Not started (approved G-7). Machine posting v1 exists | `delivery/http/internal/postings/MachinePostingController.kt`; API header line 3 |
| 28 | H-NO, H-DK, H-PK, H-FI, H-IS | — | h-design | Not started (design draft) | API header line 3 |
| 29 | F franchise charges | — | f-design | Not started (design draft) | API header |
| 30 | G group view | — | g-design | Not started (design draft) | API header |
| 31 | Reference docs | — | decisions-for-jabran, roadmap, accounts (superseded by a0) | Reference only | `api/accounts.md:3` |

Not placed in a phase: row 31 (reference docs). Every other row is in §4.

## 4. Phases

### Phase 4, rest (now)

The brief names batch 2, AL S5 and DOCS-2. The Phase 4 order Jabran approved on 2026-11-16 (backlog:389) also holds
items 4.10–4.15. They stay here. See decision 1.

| # | Item | Why here | Depends on | Size | Risk |
|---|---|---|---|---|---|
| 4.1 | GATE-0 machine gates (verify.sh, pre-push, money invariant check, tenant arch test on 8 services, risk paths) | Approved first step of batch 2 (state:21). Running in `NeoERP-worktrees/lane0-be` | — | M | money, security |
| 4.2 | QA-B2 fix lanes R01–R28, layout and wording (`docs/agents/qa-round1-retest/fix-list.md`) | Approved 2026-11-20 (state:20) | 4.1 | M | money (R12), data |
| 4.3 | R29: classify 44 outbound ports for company scope (fix-list R29) | Lane 0 finding; ratchet before Phase 4 PR | 4.1 | S | security |
| 4.4 | DOCS-1 docs clean-up | In batch 2 (state:22). State unclear: commit `906fa94` says DOCS-1 done, the state row is still open | — | S | none |
| 4.5 | DOCS-2 user and developer pages for A4 features, refunds, write-offs | Jabran 2026-11-21 (state:23). Worktrees `docs2-app`, `docs2-be` hold briefs only | 4.2 | M | none |
| 4.6 | ISO-1: ADR-026 row-level security, draft for decision | Answers ERP-Q4. Draft on branch `phase/4-b2-iso1` (e2f87a5), waits on D1–D11 | — | S (doc) | security |
| 4.7 | AL S5 payments and refunds (accounts V75) | After QA-B2 (Jabran 2026-11-21, state:44) | 4.2 | M | money |
| 4.8 | AL app P2 steps card | Follows S5 (state:25) | 4.7 | M | money |
| 4.9 | AL small reads: decide-roles read, `confirmedByUserId` (backlog:392-399) | Finish AL in one go | 4.7 | S | security |
| 4.10 | A4 leftovers: Automatic reversals tab, "{n} recurring journals need you" notice (backlog:390) | After A4 click-through. State unclear: App has `ScheduledReversalsApi.kt` but no tab screen found | 4.2 | S | none |
| 4.11 | Switch "Owner may not post own journal" + self-approval report (AL-D18) | First in the approved order (backlog:389). Not built: V71 only records `owner_self_approval` | 4.8 | S | money |
| 4.12 | Platform lane: ADR-025 RT-0..RT-2, ADR-024 Stage 0 (backlog:347) | Approved order; parallel with 4.11–4.15 | ADR-024 and ADR-025 accepted (state:26) | L | security (notifications carry data) |
| 4.13 | RT-3..RT-5: SSE hub, app realtime, first Accounts screens (backlog:348) | "End of Phase 4" | 4.12 | M | none |
| 4.14 | Company dimensions per account: D6 Required/Optional/Not used, range rules, branch default cost centre (backlog:320) | Approved order; allocations and budgets read these rules | SB2d (done) | M | money (posting refusals) |
| 4.15 | Spreading schedules (prepaid costs, deferred income) | Approved order (roadmap:68). No spec yet | 4.14; reuse `domain/recurring` | M | money |
| 4.16 | Allocations by key or % (AC-ALC) | Approved order | 4.14, 4.15 (shared run table); headcount key needs HR (spec A5) | M | money |
| 4.17 | Budgets stage 1 (AC-BUD): versions, grid, budget vs actual vs forecast, variance flags | Approved order; core for large customers | ADR-022 stage 1 accepted; 4.14 | L | none (never posts) |
| 4.18 | Report and QA1 follow-ups: journal listing exact dates, phone period line, TB hint, P12/P13 note, older layouts, QA1 leftovers G15/G19/G25/G30/G44 (backlog:395-412) | Small, same screens as QA-B2 | 4.2 | S–M | none |
| 4.19 | Phase 4 PR to `main` (one PR per repo) | Branch-per-phase rule | 4.1–4.18 | S | — |

### Phase 5: documents and bank

| # | Item | Why here | Depends on | Size | Risk |
|---|---|---|---|---|---|
| 5.1 | Document output: invoice and credit-note PDF per country (AC-DO). Folds M5 items: signed subtotals (backlog:243), customer-language line text (backlog:283), advance receipt text (backlog:251) | Old phase 5 (roadmap:90); SE launch needs printed invoices | — | L | statutory |
| 5.2 | E-invoice send: SE (Peppol BIS / Svefaktura) first, then NO EHF, DK, FI, IS | NO law in force 2027-01-01 (gates L-1); SE first by launch order | 5.1; vendor D-121/D-123; P-9 mail; H-7 DPA | L | statutory |
| 5.3 | NO e-invoice receive (Peppol) | NO launch gate needs both send and receive (roadmap:22-23; backlog:287) | 5.2 | M | statutory |
| 5.4 | FBR Digital Invoicing provider F2 (PK): send at approval, dispatcher hardening, PK-REF, PK-ADVANCE, PK-CANCEL (backlog:276, 278; roadmap:36-43) | PK go-live blocker (gates L-3, ACC-R25) | 5.1; provider D-125 | L | statutory, security (token) |
| 5.5 | Attachments (AC-AT) on journals, bills, later bank entries | Vouchers are bookkeeping records; DK needs them (ACC-R2) | ADR-020 (accepted); P-3 ClamAV; ACC-R1 (off in NO/IS until C4); ACC-R26 rescan | M | security (uploads) |
| 5.6 | D + D2 bank and cash: bank accounts, transfers, reconciliation, camt.053 and PK CSV import; match on both references (backlog:280); bank entries under approval limits (`WS/docs/agents/approval-limits/plan.md:12`) | Old phase 5; daily need | B, C (done); AL (4.8) | L | money |
| 5.7 | Bank reconciliation reviewer sign-off (`BANK_RECONCILIATION.REVIEW`) + setting to make `BANK_NOT_RECONCILED` block the close (roadmap:69) | Finance-gap amendment | 5.6 | S | money |
| 5.8 | Payment files D3 / PF-1 (pain.001, Bankgirot, PK formats) + standing bank rules (AC-BF) | Finance-gap amendment (roadmap:69) | 5.6; PF-1 shared with Payroll (roadmap:142) | L | money, security |
| 5.9 | Multi-currency (AC-FX): FX documents, currency bank accounts, realised FX, revaluation with auto-reversal, close check | Finance-gap amendment; "Must" for SE pilots with foreign suppliers (`WS/docs/agents/finance-gap-check/report.md:104`) | 5.6; A4 auto-reversal (done) | L | money |
| 5.10 | RT-6 real e-mail, RT-8 FBR and e-invoice status events; statement import and payment files as action-id jobs (backlog:349) | Phase 5 per the ADR phasing | 4.12; P-9 | M | security |
| 5.11 | Advance deductions across a VAT rate change (ACC-R19) | Deadline 2027-07-01 at the latest | B, C (done) | M | money, statutory |
| 5.12 | Next pack edition: advance accounts take project/cost centre/free dimensions (backlog:268); PK-WHT statutory rates (backlog:296); C18 overlay `role_code` fix (backlog:289) | Collected pack fixes | pack loader (done) | S | statutory |
| 5.13 | AccountsPostingV2 core + integration posting API + import with dimensions (AC-IP) | Large-customer priority 1 (`large-customer-roadmap.md:32-33`). See decision 6 | ADR-021 Q13/Q14 decided | L | money, security (machine clients) |

### Phase 5b: controls and close

| # | Item | Why here | Depends on | Size | Risk |
|---|---|---|---|---|---|
| 5b.1 | Balance-sheet reconciliation workbench (BS-REC) with close check | roadmap:70 | 5.6, 5.5 (evidence) | L | money |
| 5b.2 | Close task list (CLOSE-T), multi-company close board, report-pack sign-off; live board with notifications (backlog:350) | roadmap:70 | A2 checks (done); 4.13 | M | none |
| 5b.3 | Segregation-of-duties matrix + quarterly user access review (user-service) | roadmap:70 | AL (done) | M | security |
| 5b.4 | Audit log export + full journal export with control total tying to the TB | roadmap:70 | A2 exports (done) | M | none |
| 5b.5 | Trend P&L by month and dimension | roadmap:70 | A3 (done); dimensions | M | none |
| 5b.6 | First-year comparatives from last year's TB (D-104) | roadmap:70 | OBI (done) | S | none |
| 5b.7 | Fixed assets (AC-FA): register, depreciation runs, disposal, capex vs budget | Not phased today. See decision 8 | 4.14, 4.17 (capex view) | L | money |

### Phase 6: tax returns and statutory files (per country)

| # | Item | Why here | Depends on | Size | Risk |
|---|---|---|---|---|---|
| 6.1 | E: VAT report and return files, **SE momsdeklaration first**, then NO MVA-melding, DK, FI, IS, PK Annex A/C; EU sales lists; return flow Prepare → Check → Approve → File → Paid → Locked (backlog:277) | Launch gate per country (roadmap:154) | B, C (done); 5.4 for PK | L | statutory |
| 6.2 | H-NO ∥ H-DK SAF-T (one engine); account name rule (backlog:313); ACC-R3, ACC-R22; DK SAF-T 2.1 from 2027-01-01 (ACC-R2) | NO, DK launch gates | 6.1; file store | L | statutory |
| 6.3 | H-PK, H-FI, H-IS statutory files not covered by E | Per-country launch | 6.1 | M | statutory |
| 6.4 | OBI SAF-T reader (CP-OBI.3) | Built with H-NO ∥ H-DK (`api/accounts-ob-import.md:3`) | 6.2 | M | money |
| 6.5 | PK-ANNEX-C close gate, PK-FED fields (roadmap:42-43) | PK launch | 5.4, 6.1 | M | statutory |

### Later

| # | Item | Why later | Depends on | Size | Risk |
|---|---|---|---|---|---|
| L.1 | A5 payroll posting (AccountsPostingV2 by role) | Payroll v2 rebuild not active (state:46) | Payroll v2 P2; 5.13 core | L | money, statutory |
| L.2 | Phase 7: intercompany postings, intercompany reconciliation, consolidation with eliminations and currency translation (rework G) | Before the first multi-company group pilot (roadmap:71) | 5.9; G-scope ADR | L | money |
| L.3 | F franchise charges | After launch (roadmap:94) | FT-1, F-D1..D8, ADR-017 (roadmap:155) | L | money |
| L.4 | G franchise group view | After launch | Group-scope ADR, G-D1..D6, A3b (roadmap:156) | M | none |
| L.5 | Budgets stage 2: check, reserve, commitments | Needs Purchasing, HR hiring or Expenses (AC-BUD §1) | 4.17; ADR-022 stage 2 | L | money |
| L.6 | ADR-023 reporting store, dashboards, scheduled reports | ADR-023 Q1–Q13 open | ADR-023, ADR-024 | L | security (permissions carried) |
| L.7 | Live bank feeds (bank APIs) | "Not on the roadmap yet" (roadmap:182) | 5.6 | L | security |
| L.8 | Imported invoices and bills as documents for Accounts-only companies (ADR-021 Q16) | Large-customer priority 2 | B, C | M | money |
| L.9 | Department dimension from HR, allocation headcount key | Needs HR event cache (backlog:320) | HR rebuild | M | none |
| L.10 | Branch-limited access (backlog:361) | "Later, platform lane" | user-service | M | security |
| L.11 | Hash-chained ledger evidence (backlog:288); retention purge and holds (ACC-R6) | With the retention work | attachments, H | L | security, statutory |
| L.12 | GRNI clearing moves to Purchasing (backlog:242, M5 D7) | With Purchasing | Purchasing module | S | money |
| L.13 | Per-user "Language and formats" (backlog:411) | Only if customers ask | — | S | none |

### Go-live lane (runs beside Phases 5–6; owner ERP lead unless named)

| # | Item | Gate | Size | Risk |
|---|---|---|---|---|
| G.1 | ERP-Q4 RLS build | ADR-026 accepted (4.6); before first production customer | L | security |
| G.2 | ERP-Q5 hosted secrets + P-4 secret store + P-25 machine-client secrets | First hosted stack | M | security |
| G.3 | H-1 provider pick, H-7 DPAs, P-2 KMS, P-7 backups, P-11 bucket expiry, P-26 memory limits, P-21/P-22 dimension cache sizing and restore runbook | First hosted stack | M | security |
| G.4 | P-8 CI back on, P-16 Docker tests not skipped | Before the hosted stage | S | security |
| G.5 | ERP-Q3 money invariant checks on the stage, scheduled in production with alert; AR/AP control-difference alerts (backlog:255) | First production customer | M | money |
| G.6 | Company-local "today" across Accounts + post-dated money rule (backlog:263, 266) | Before go-live | M | money |
| G.7 | Read-only pages when a feature is off but records exist (backlog:270); FE-2 narrow membership check (backlog:272); auth Hikari leak (backlog:274-275) | Before go-live | M | security |
| G.8 | Remove the D-202 subject fallback (backlog:371-372); ACC-R13/R14 key tests; ACC-R16 shared reveal limiter; P-12/ACC-R9 fileupload GA | Before go-live / multi-instance | S | security |
| G.9 | ERP-Q2 pen test (Jabran, vendor) | 4 weeks before first production customer, on the hosted stage | — | security |
| G.10 | ERP-Q1 accountant sign-off per country; L-4 pack CHECKED; L-7 native read-through; L-6 pilot customer | Before that country's first customer | — | statutory |
| G.11 | P-20 agreement grace period | Before first paying customer | S | none |
| G.12 | ADR-024 Stage 1 (keyset paging, search indexes, pool sizes); P-19 ISAE 3402 control period starts | Before the first **large** customer | L | none / statutory |
| G.13 | Country rows: SE ACC-R4, ACC-R18, ACC-R23; NO ACC-R3, ACC-R7, ACC-R22; PK ACC-R5, ACC-R24, H-6; FI ACC-R20, H-4; IS ACC-R21, H-2; DK ACC-R2 | Each country launch | — | statutory |

### Obsolete

`BE/docs/post-release-backlog.md` §5 (lines 57-69, dated 2026-04-01) lists 9 Accounts items. All are built or placed
above: AP/AR (rows 9–10), bank reconciliation (5.6), multi-currency (5.9), budgets (4.17), fixed assets (5b.7),
P&L/BS/cash flow (rows 4–5), close automation (5b.2), payroll journals (L.1), sales/purchase journals (B/C internal API,
ADR-018). The file is stale. See decision 12.

## 5. Critical path to the first customer (Swedish)

1. Close Phase 4: GATE-0 → QA-B2 → AL S5 → AL P2 → Phase 4 PR. ADR-026 decided in parallel.
2. Phase 5 for Sweden: document output → SE e-invoice → attachments → D + D2 → multi-currency.
3. Phase 6 for Sweden: E momsdeklaration and EU sales list (H-SE is done).
4. Go-live lane on a hosted stage: RLS, secrets, KMS, backups, CI, invariant checks, company-local today.
5. Gates: ERP-Q3 green on the stage → ERP-Q2 pen test (4 weeks before) → ERP-Q1 SE accountant → L-6 pilot.

Phase 4 items 4.11–4.17 and Phase 5b are on the path only if the first customer is large (decision 2).

```mermaid
graph LR
  G0[4.1 GATE-0] --> QA[4.2 QA-B2] --> S5[4.7 AL S5] --> P2[4.8 AL P2] --> PR4[4.19 Phase 4 PR]
  ADR26[4.6 ADR-026 accepted] --> RLS[G.1 RLS build]
  PR4 --> DO[5.1 Document output] --> EI[5.2 SE e-invoice]
  PR4 --> AT[5.5 Attachments]
  PR4 --> D[5.6 D + D2 bank] --> FX[5.9 Multi-currency]
  PR4 --> E[6.1 E SE VAT return]
  EI --> STAGE
  AT --> STAGE
  FX --> STAGE
  E --> STAGE
  RLS --> STAGE[Hosted stage: G.2-G.8]
  STAGE --> Q3[ERP-Q3 invariants] --> Q2[ERP-Q2 pen test] --> Q1[ERP-Q1 SE accountant] --> PILOT[L-6 SE pilot]
```

## 6. Counts

- Specs and API docs: 48 (19 app, 29 API) in 31 inventory rows; 30 rows placed in a phase, 1 reference row.
- Backlog and gate items placed: 19 (Phase 4) + 13 (Phase 5) + 7 (Phase 5b) + 5 (Phase 6) + 13 (later) + 13 (go-live) = 70 rows, plus 9 obsolete post-release items.
- State unclear: 2 (DOCS-1 row, A4 leftovers tab).

## 7. Decisions for Jabran

1. **Phase 4 scope.** The brief lists batch 2, AL S5 and DOCS-2. Your 2026-11-16 order (backlog:389) also puts the
   owner switch, platform lane, account dimension rules, spreading, allocations and budgets in Phase 4.
   **Recommend:** keep them in Phase 4 as approved, in that order, after AL P2.
2. **Is the first customer large?** If yes, Phase 4 items 4.11–4.17, Phase 5b and G.12 sit on the critical path.
   **Recommend:** plan for a large Swedish pilot (product direction), so keep them before go-live.
3. **ADR acceptance.** ADR-024/025 block 4.12; ADR-022 blocks 4.17; ADR-026 blocks G.1; ADR-023 blocks L.6.
   **Recommend:** accept ADR-024 and ADR-025 now (with the 3 proposed additions), ADR-022 stage 1 before 4.17,
   ADR-026 after its D1–D11, ADR-023 at the start of Phase 5b.
4. **Old phase table.** roadmap:84-92 still numbers phases the old way. **Recommend:** after you approve this draft,
   add an amendment to `accounts-roadmap.md` that points to it (separate change, outside this brief's scope).
5. **A5 payroll posting.** Old Phase 4; blocked by the Payroll v2 rebuild, which is not active. The launch gate
   (roadmap:154) still says "payroll posting live". **Recommend:** move A5 to Later with Payroll v2, and require
   payroll posting at launch only for customers who buy Payroll (sold by module).
6. **Integration posting API (AC-IP).** Large-customer priority 1, no phase, ADR-021 Q13/Q14 open.
   **Recommend:** Phase 5 after D, building the AccountsPostingV2 core that A5 reuses later; decide Q13/Q14 first.
7. **Norway e-invoice by 2027-01-01 (RM-NO, roadmap:17).** Six weeks away; document output is not started.
   **Recommend:** drop the date as a build target; no Norwegian customer until 5.2 and 5.3 are live (gate L-1).
8. **Fixed assets.** Large-customer priority 1, roadmap says after launch. **Recommend:** Phase 5b (depreciation is a
   monthly close step).
9. **Phase 6 per country.** The gate needs "Phases 1–6 for that country". **Recommend:** build E for Sweden first and
   ship it with Phase 5; other countries' E and H follow their launch order.
10. **Vendor choices with no owner:** Peppol access point (D-121/D-123) and PK FBR route (D-125). **Recommend:**
    decide D-121/D-123 before 5.2 starts; D-125 before PK work (PK is third in launch order).
11. **Go-live items with no slot or owner:** company-local today, control-difference alerts, read-only off pages,
    FE-2 check, D-202 removal, Hikari leak, ACC-R19 (deadline 2027-07-01). **Recommend:** one go-live hardening lane
    (G.5–G.8) owned by the ERP lead, built before the hosted stage; ACC-R19 in Phase 5.
12. **Stale file.** `BE/docs/post-release-backlog.md` (April 2026). **Recommend:** mark it superseded by this roadmap and
    `docs/backlog.md` (separate change).
13. **ERP-Q1 order.** The gate says "Norway first, 6 weeks before the NO pilot", but Sweden launches first.
    **Recommend:** first accountant sign-off for Sweden, 6 weeks before the SE pilot.
14. **Allocations headcount key.** Needs an HR read; HR rebuild not active. **Recommend:** allocations v1 with % and
    fixed keys only; headcount key with L.9.
15. **Group pilot.** Phase 7 is "before the first multi-company group pilot", but the direction is large multi-company
    customers from day one. **Recommend:** no owned-group pilot before Phase 7; single-company pilots first.
