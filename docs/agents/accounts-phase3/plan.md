# Accounts Phase 3 plan: Receivables (B) ∥ Payables (C)

Status: **Draft for Jabran's approval, 2026-10-30.** Planning architect, read-only on code. Nothing here is approved
or started. Abbreviations: `B` = `NeoERP-BackEnd/docs/api/accounts-b.md`, `C` = `…/accounts-c.md`, `AC-BC` =
`NeoERP-App/docs/design/specs/accounts-b-c.md`, `OI` = `…/docs/api/accounts-opening-items-import.md`, `OBI` =
`…/docs/api/accounts-ob-import.md`, `DEC` = `…/docs/api/accounts-decisions-for-jabran.md`, `RM` =
`…/docs/api/accounts-roadmap.md`, `UX` = `NeoERP-App/docs/design/ux-principles.md`, `ERPD` =
`docs/handover/erp-lead-decisions.md`, `RIG` = `NeoERP-App/docs/design/screen-rig/accounts-bc.jsx`.

Scope (DEC "Next after the flow 1–7 click-through", 2026-10-29): after one small leftovers batch, B ∥ C with their
opening items, which clear the held-out receivables and payables on opening-balance equity. Then the CSV/Excel
opening-balance import (D-173), which shares that opening-items work (OBI-12). New screens follow UX §21 and §22.

## 1. Gate 0: approve the design

### 1.1 What is already decided (do not reopen)

- Every contract open point is decided. B §18 and C §18 are "decided 2026-10-09: all as recommended". DEC "All as
  recommended" covers D-19…D-37 and D-57…D-83.
- The B, C and rig design gate was approved on 2026-10-10 (DEC G-1). The **status lines were never updated**: B, C
  and AC-BC still say "Draft (re-draft after lead review), 2026-10-09. Not approved" (B header, C header, AC-BC header).
- Opening items: D-160…D-171 approved on 2026-10-14 (DEC "Opening-items import approved"; OI §13, lead rulings).
  OI still says "Draft" (OI header).
- OBI-1…OBI-12 and OBI-A1…A3 were decided on 2026-10-27 (OBI §15; DEC "Flow 6 click-through"). OBI still says
  "Draft" (OBI header).
- The rig money fixes BC-R1…R4 passed an independent recheck (27/27). The follow-ups RC-1…5 and RC-7 were delivered
  with 43/43 green (`docs/agents/accounts-bc-readiness/plan.md` "ACC-231"; `recheck-bc-r1-r4.md`).

### 1.2 Points still open (for Jabran, with a recommendation)

| Id | Point | Recommendation |
|---|---|---|
| G0-1 | Re-confirm G-1 after the §21/§22/navigation refresh (1.3), because the package predates them. | Approve once the design pass lands. The lead then sets B, C, AC-BC, OI, AC-OI, OBI and AC-OBI to Approved in one docs commit. |
| G0-2 | The OI amendments OI-1/OI-2 ("made when this contract is approved") were never applied. B and C have no pointer to OI (grep: 0 hits; OI §12). | Apply them in the same docs commit, so the B §14 and C §14 slice tables list CP-B.OI1/OI2 and CP-C.OI1/OI2. |
| G0-3 | SB2a now also carries the ADR-021 `dimension_set_id` on lines and balances (`docs/agents/accounts-bc-readiness/brief-sb2a.md` "Dimension-set id", ERP-197). ADR-021 is still **Proposed** (`NeoERP-BackEnd/docs/adr/ADR-021-shared-dimensions.md` §Status). | Do not put it in SB2a. Make it its own checkpoint (SB2d) after SB2a, run only if ADR-021 D7–D9 are accepted first. Otherwise SB2a ships without it. An applied migration is frozen, so the order matters. |
| G0-4 | Service APIs for Sales and Purchasing (B §7.19 in SB8, the C SC8 internal GRNI lines). Neither consumer exists yet (B N-S-1, N-I-1). | Keep the columns and the GRNI control-kind row in the B and C migrations (ADR-018 needs them, and migrations freeze). Defer the `delivery/internal/**` endpoints until Sales or Purchasing starts. |
| G0-5 | FBR Digital Invoicing is a PK go-live blocker (B "Verification" VB-2). The provider comes with document output in Phase 5 (RM phase 5; B conflict 22). | In Phase 3, B ships the states, the outbox and `NoopFiscalProvider` (B §14 SB8). Sialkot's demo has no fiscal registration, so no FBR pills show (AC-BC §6). One rig route still shows FBR rejected. |
| G0-6 | One user-service codes migration or three? SB1, SC1 and CP-B.OI1 each add codes (B §14, C §14, OI §11). | One migration for the receivables, payables and import codes, with one ERP-lead security check. |
| G0-7 | SB6 is one very large app slice (every receivables screen; B §14). | Split it into SB6a (customers, invoices, credit notes), SB6b (receipts, allocation, ageing, statement) and SB6c (refunds, advances, write-off, FBR). Do the same for SC6. |
| G0-8 | The OBI Excel library and the ADR-020 size amendment wait for the ERP lead (OBI §15 OBI-5, OBI-A1). | Ask the ERP lead now, so the answer is in before CP-OBI.1. If it is late, CSV goes first (OBI-5 fallback). |
| G0-9 | The shared vector file `docs/api/fixtures/accounts-document-math.json` does not exist (recheck RC-6). | SB2 creates it, including the deductible vectors 0/50/100/12.5 %. SB5 copies it (AC-BC §7). |
| G0-10 | The lead's disposition of ACC-231 (RC follow-ups) is still pending (`accounts-bc-readiness/plan.md` "Resume point"). | The lead accepts it in the design pass. Nothing new to build. |

### 1.3 Refresh needed on AC-BC and the rig (§21, §22, navigation)

| # | Conflict | Where now | Change |
|---|---|---|---|
| R-1 | Area tab bars on the page: Invoices · Credit notes · Receipts · Refunds · Customers · Ageing. The rule now is "areas live in the menu; module pages lose their area tab bars". | AC-BC §3; RIG:3014 `bc-areatabs` | Each list becomes a menu entry under Receivables and Payables, with breadcrumbs. Tabs stay only inside one record, for example a customer's Open items · Documents · Statement (RIG:2719). Per ERPD 2026-10-24 navigation. |
| R-2 | The Drafts · Waiting for approval · Posted (· Reversed) status tabs with counts. | AC-BC §4.1, §4.5; RIG:932, 1078 | Make them status filter chips, with "none chosen = all", the same as journals (ERPD 2026-10-24 "journal status is a filter"). The "Waiting for you" badge stays in the menu. |
| R-3 | Dates shown in the company format ("09.10.2026", "2026-10-09"). | AC-BC §7 | Show dates in the app style ("9 Oct 2026", ranges "1–31 Oct 2026"). Typing still follows the company format (UX §21 Words). |
| R-4 | A pill for the normal state: Posted "Open", "Waiting for approval" on every row, Waiting shown amber. | AC-BC §4.1; RIG:752, 765 | Show no pill when the item is open. Show Part paid, Overdue, Paid, Credited and Balance at go-live only where they apply. Waiting is a neutral state, or one notice when every row is waiting (UX §21 Mark only exceptions, Calm surfaces). |
| R-5 | Empty values shown as "—". | RIG:39, 115, 181, 997, 1004, 1120 | Leave them blank. Hide a column that is empty in every row, such as Lines or Due (UX §21). |
| R-6 | The page error states predate §22. The rig's "Load failed" is bespoke. | AC-BC §6; RIG:3101 | Use the `NeoFailureState` kinds: couldn't load, offline, no access, and not found with "Back" for a deep link to a missing id. Keep the real company name in the breadcrumb (UX §22). |
| R-7 | The "Books not live" notice opens every Receivables and Payables tab. | AC-BC §6 | Say it once, only where it blocks, with nothing underneath (UX §21 One place). Lahore (READY) shows it. |
| R-8 | Repeated facts: the list subtitle repeats the approval rule, and the waiting tags repeat the badge. | AC-BC §4.1, §4.3 | Say each fact once. Reason hints say what the reason is kept with (UX §21 Say it once, Words). |
| R-9 | The phone layout assumes area tabs scroll into view. | AC-BC §6 "Phone" | Use the bottom bar (Home, Work, Search, More), with areas reached from the menu (ERPD 2026-10-24). |
| R-10 | No top-tasks list. | AC-BC (none) | List the 5–10 top tasks with click counts. Any task over 3 clicks is fixed before approval (UX "Checking it"). |
| R-11 | Required fields fold only if they are optional. | AC-BC §4.2, §5.2 | Invoice and bill date, customer or supplier, and the lines stay visible. Only secondary detail folds (ERPD 2026-10-26; UX §16). |
| R-12 | Stale headers: AC-OI says "no rig yet", but `screen-rig/accounts-oi.jsx` exists. AC-OBI has no rig. | AC-OI and AC-OBI headers | Fix AC-OI's header. Build the AC-OBI rig as the generalised H-SE wizard (`accounts-hse.jsx`). |
| R-13 | The rig has no SE or IS demo (RN-5), but Stockholm (SE) is live in the app. | AC-BC §11, "Rig notes" RN-5 | Add Stockholm routes: SE advance at 25 %, OCR/Bankgiro. |

**Who does it.** One design pass, modelled on ESS (`NeoERP-App/docs/design/specs/ess.md` §2: audit table "rule →
finding → fixed", amendments marked "(design pass …)") and on Users and roles (`specs/roles.md` header). Product
design does the pass under the Accounts lead. Shared components (status pill, notice, failure state) are fixed once
(UX §21 "Shared components carry the rule"). The ERP lead checks only the shared shell and menu parts (ERPD
2026-10-10 review scope).

**Size.** About 2–3 working sessions:
- One for the audit and the AC-BC amendments.
- One for the rig, which is 3,278 lines (`wc`), plus the `rig-regression.cjs` rerun.
- Half a session for the AC-OBI rig and the AC-OI header fix.

## 2. Prerequisites

| Item | Status | Evidence |
|---|---|---|
| EV-1 `:shared:domain-events` (ADR-019) | **Built**, and Accounts already uses it. | Commits 4f844c8, 9dd5d84, 9138608; accounts V18 `domain_event_relay` (72bb8fe, CP-EV-2); `services/accounts-service/build.gradle.kts:26` |
| `:shared:file-store` (ADR-020) | **Built** (CP-FS-1). | cf75bad; `settings.gradle.kts:14`; `build.gradle.kts:29`. Rescan job (ERP-205) and ClamAV are only needed before customer uploads go live (ERPD ADR-020). |
| A1 engine + A3 in-process core (B §14 "A1 S2; A3 S1") | **Built**. | `V13__a3_year_end.sql` carries the in-process rows; `PostingEngine.kt` |
| A1 amendments A1-A7…A12, N-15…N-18 | **Not built**. This is SB2a's job. | B §15, §20; brief-sb2a.md |
| Org legal profile N-O-1 (ORG-FACTS-2) | **Built**. | DEC "ORG-FACTS-2 approved"; ERPD ACC-106; B "ORG-FACTS-2 alignment" |
| Packs 2026.2 N-P-1/N-P-2 (roles, `invoice_content_rules`, `taxOnAdvances`, ISK) | **Built**. Discovery checks each flag the contract names. | 9f5b616, ae54277; `resources/packs/2026.2/schema.sql`, `currencies.csv` (ISK) |
| `NeoMoney` minor units (N-13) | **Built**. | `core/money/NeoMoney.kt:12` |
| Shared app components | **Built**: NeoDataTable, NeoSearchSelect, NeoMultiSelect, NeoListToolbar, NeoDateField, NeoReasonGateDialog, NeoStatusPill, NeoNotice, NeoToast, NeoFailureState/NeoFailureMapper, NeoSplitButton, NeoEntryGrid, NeoKeyValueList, NeoFilePickerField, NeoPercent. Reuse the journal patterns too: editor footer, line grid, detail timeline, `SourceDocumentLinks.kt` (N-8). | `composeApp/src/commonMain/.../designsystem/components/`; `features/accounts/presentation/journals/**` |
| OrgEventsV2 cutover (CP-EV-1b/1c) | On HOLD. **Not needed** for B/C. | `docs/agents/accounts-cp-ev-1c/notes.md` |
| Phase 2 range pushed (brief-sb2a gate 3) | The backend `dev` is level with origin. The app `dev-app` is **7 commits ahead**. Jabran pushes them before SB5. | `git status -sb` 2026-10-30 |
| Leftovers batch | Comes before Phase 3 (DEC 2026-10-29). | — |

Migration heads on 2026-10-30: accounts V24, user-service V41. Numbers are taken at commit time (RM "Migration
numbers"), and an applied migration is frozen.

## 3. Build slices

There is one Gradle builder per checkout. So "B ∥ C" means the backend queue and the app queue run side by side, with
the app one step behind (RM "Build phases"). Inside each queue, B and C slices take turns. The app runs on mocks first
and switches to live once its backend slice is accepted. Opus review applies where `lead-agent-structure` §3a needs it
(money, tax, security, migrations).

**Backend queue (NeoERP-BackEnd)**

| # | Slice | User gets | Depends on | Test focus |
|---|---|---|---|---|
| BE-1 | SB1+SC1+OI codes (G0-6) | Receivables, payables and import rights in roles | Gate 0 | user-service suite; ERP-lead security check |
| BE-2 | SB2a engine amendments | (none visible) Engine takes in-process documents, tags, `RF`/`WO`, approval origin | Gate 0 | §13 engine tests; every posting test; full accounts-service + architecture tests (brief-sb2a "Rules"); Opus |
| BE-2d | SB2d dimension set (only if G0-3 says yes) | (none visible) | BE-2, ADR-021 accepted | balance keys, concurrent first use, backfill; ERP-lead cross-module check |
| BE-3 | SB2 `b_receivables` + shared subledger core | (none visible) | BE-2 | DocumentMath vectors (creates fixture, G0-9); sequences; allocation core; Opus |
| BE-4 | SB3 customers, invoices, credit notes | Customers, approved invoices posting SI, credit notes | BE-1, BE-3 | B §13 SB3; legal content per country; PK further tax (D-21); D-4 `USE_RECEIVABLES` |
| BE-5 | SC2 `c_payables` + suppliers | Suppliers with bank-detail change guard | BE-3 (doc shape after BE-4) | C §13 SC2; bank-details request flow (D-28) |
| BE-6 | SB4 receipts, allocation, AR reports | Receipts, withholding, ageing, statement | BE-4 | B §13 SB4; statement = balance = ageing; two-person receipts (D-19) |
| BE-7 | SC3 bills, debit notes | Bills with KID/OCR, deductible VAT, duplicate refusal | BE-1, BE-5 | C §13 SC3; D-25, D-26, D-66 |
| BE-8 | SC4 payments, allocation, AP reports | Payments (two people), s.153 withholding, AP ageing | BE-7 | C §13 SC4; lock order (C R-2) |
| BE-9 | CP-B.OI1 opening-items core + customers' file | Customer balances at go-live from a CSV | BE-6 | OI §10 CP-B.OI1; `PostingLockOrderTest`; batches of 200 from the approver's session (OI lead rulings) |
| BE-10 | CP-C.OI1 suppliers' file | Supplier balances at go-live | BE-8, BE-9 | OI §10 CP-C.OI1; duplicate check on opening bills |
| BE-11 | SB8 without `delivery/internal` (G0-4) | Refunds, write-offs, advances, fiscal states (Noop) | BE-6 | B §13 C-39, C-42, C-43, C-34 tests |
| BE-12 | SC8 without the internal API | Supplier advances, refunds received | BE-8, BE-11 | C §13 C-23, C-25 |
| BE-13 | CP-OBI.1 engine + CSV (+ Excel per G0-8) + OBI-12 prefill | One OB import for every country; party balances pre-fill opening items | BE-10 | OBI §13; `ObImportReadersDoNotPostArchitectureTest`; SIE regression; Opus |
| BE-14 | SB7+SC7 acceptance + seed | Demo customers, invoices, bills, payments; second Sialkot person | all | `b-acceptance.sh`, `c-acceptance.sh`; gateway route check |

**App queue (NeoERP-App)**

| # | Slice | User gets | Depends on | Test focus |
|---|---|---|---|---|
| AP-1 | SB5 receivables data + DocumentMath | (mocks) | Gate 0, app push | `DocumentMathVectorsTest`, DTO, access; **full jvmTest** (touches DI and money) |
| AP-2 | SC5 payables data | (mocks) | AP-1 | DTO, access; affected classes |
| AP-3 | SB6a customers, invoices, credit notes + menu entries | Receivables menu, invoice editor and detail | AP-1; live after BE-4 | AC-BC §10 receivables; **full jvmTest** (sidebar, `NeoDestination`) |
| AP-4 | SB6b receipts, allocate, ageing, statement | Receive money, see ageing | AP-3; live after BE-6 | AC-BC §10; screenshots |
| AP-5 | SC6a suppliers, bills, debit notes, payments, AP ageing | Payables menu and screens | AP-2, AP-4; live after BE-8 | AC-BC §10 payables; full jvmTest (sidebar) |
| AP-6 | CP-B.OI2 + CP-C.OI2 wizards | Import balances at go-live | AP-5; live after BE-9/10 | AC-OI tests; affected classes |
| AP-7 | SB6c + SC6b refunds, advances, write-off, FBR status | Those screens | AP-5; live after BE-11/12 | AC-BC §10 for §4.12–4.15, §5.7a |
| AP-8 | CP-OBI.2 generalised OB wizard | CSV/Excel import; `/sie-imports` OB path retired | AP-6; live after BE-13 | AC-OBI; SIE wizard regression |

Shared files have one owner at a time: route, tab context, DI, sidebar, `AccountsWording`, `AccountsRefusal`,
`AccountsPermissions` (C §14). There is one builder per checkout, so the rule holds without hand-overs. The lead
names the owning slice in each brief.

## 4. Click-through flows (after each milestone)

Sign-ins are as in `NeoERP-BackEnd/docs/local-demo-data.md` (users table). The steps format follows the team rule:
sign in, then numbered clicks, with an Expected result for each step.

- **M1, invoices (BE-4 + AP-3).** Kystgruppe NO: anna.lindh adds a customer and writes an invoice with 25 % and 15 %
  lines, then submits it. bjorn.eriksson approves it. Expected: the number is INV-{FY}-…, and the journal detail
  shows "From Sales invoice …". He then credits part of it. Sialkot PK: omar.farooq invoices an unregistered buyer
  at PK-ST-18 plus further tax, and approves it himself as Owner with the confirmation.
- **M2, receipts (BE-6 + AP-4).** Kystgruppe: a part receipt, then aged receivables, then the statement. Expected:
  statement = balance = ageing. A manual journal to AR control is refused with "Enter customer balances in
  Receivables" (D-4). Sialkot: a receipt with tax withheld is approved by a second person (seeded in BE-14, or
  Owner self-approval until then).
- **M3, payables (BE-8 + AP-5).** Kystgruppe: a supplier, then a bill with a KID, 25 % VAT and 50 % deductible.
  Entering the same bill again is refused as a duplicate. The bank-details change waits for approval. A payment is
  approved by a second person, then the payables ageing. Sialkot: a payment with s.153 withholding.
- **M4, opening items (BE-9/10 + AP-6).** Stockholm SE: AR and AP were held out on 2009 by the SIE import. erik.berg
  imports the customers' and suppliers' open items, typing the old control total. sara.lind uses "Approve all".
  Expected: 2009 is zero, and the setup checklist ticks `arOpeningItemsPosted` and `apOpeningItemsPosted`.
- **M5, money extras (BE-11/12 + AP-7).** Stockholm: an advance with 25 % VAT, then the final invoice deducts it.
  Kystgruppe: a bad-debt write-off with VAT relief. Sialkot: a customer refund approved by two people.
- **M6, OB import (BE-13 + AP-8).** Lahore PK (READY): Receivables shows the not-live notice once. A CSV trial
  balance with a customer and supplier column produces OB drafts, with opening items pre-filled (OBI-12). After both
  are approved, go live. Expected: opening-balance equity is zero.

## 5. Risks and decisions to watch

- **Size.** B (2,278 lines) and C (1,203 lines) are the largest Accounts slices. G0-4 and G0-7 keep checkpoints
  reviewable, and each milestone ends with a click-through.
- **Frozen migrations.** `b_receivables` and `c_payables` carry the currency twins (R-7), the source links (ADR-018)
  and maybe the dimension set (G0-3). Anything left out costs a later migration on live tables.
- **No printed invoice in Phase 3.** Under D-22, PDF and e-invoice come in Phase 5. Norway's B2B e-invoice date of
  2027-01-01 (DEC N-1) puts pressure on Phase 5.
- **PK FBR provider.** It is a PK launch blocker (B VB-2). Phase 3 proves only the states, not the provider.
- **Demo data.** Sialkot has only its Owner (`local-demo-data.md` "Sialkot Mills"), so two-person PK flows need a
  seeded second person. Kystgruppe and Stockholm already have pairs.
- **Design order.** Payroll is the design pilot that the other modules follow (ERPD 2026-10-23, ERP-220..223). Jabran's
  2026-10-29 decision puts Accounts next. Confirm that the Accounts pass does not wait on Payroll's approval.
- **Doc drift.** Stale "Draft" headers (G0-1) and missing OI pointers (G0-2) can mislead builders. Fix them in one
  commit before the first brief.
- **PK verify items.** The 180-day credit-note window, the s.73 limit and the withholding base stay *(verify)*
  (B "Verification" VB-7). They are pack data, so they can change without code.

## 6. Recommendation (next action)

1. While the leftovers batch runs, start the **AC-BC design pass** (1.3, R-1…R-13) as one product-design brief under
   the Accounts lead, with the ACC-231 disposition (G0-10). Ask the ERP lead now about OBI-5/OBI-A1 (G0-8).
2. Jabran answers G0-1…G0-7 in one sitting, ideally "as recommended".
3. The lead makes one docs commit: Approved status lines, OI pointers, revised slice tables (SB2d, SB6a–c, merged
   codes migration, SB8/SC8 without the internal API).
4. Jabran pushes the 7 app commits. Then BE-1 and BE-2 (SB2a, brief from `accounts-bc-readiness/brief-sb2a.md`
   without the dimension part) start in the backend, and AP-1 (SB5) starts in the app.
