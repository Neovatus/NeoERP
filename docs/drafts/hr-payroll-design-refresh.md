# HR/Payroll design refresh: change list (HRP-DES)

Status: **Draft, 2026-11-21 (Opus drafter).** It approves nothing. Approval path (brief `docs/agents/hrp-des/brief.md`):
fresh Opus review → Fable 5.2 (high) settles the **non-critical** items and gives a view on the rest → **Jabran approves
the whole list**, reading the **critical** items and anything Fable rejected or left open. The HR v2 build on
`phase/hrp-v2` starts only after that.

**What this checks.** The six specs approved at the design gate of 2026-10-21 (G-1…G-9,
`docs/drafts/hr-payroll/hr-payroll-open-decisions.md:5-19`) against what was decided since: ADR-026 (company column and
row-level security from the first migration, old tables dropped), the money/security/statutory guardrails, the building
blocks and the one-format rule, UX-1 (short heights, Larger Text, touch entry), approval limits, shared dimensions
(ADR-021), file store (ADR-020), notifications (ADR-025), data at scale (ADR-024) and the Accounts roadmap (A5, L.1).

**Class.** `critical` = payroll money, statutory, approved scope, row-level security or security, product direction.
`non-critical` = building blocks, layout, wording, UX-1 rules. **Size:** S (hours to a day of spec work), M (a few days),
L (more). Size counts spec and contract text, not the build.

**Where the lines come from (read only).**

| Short name | Means | At |
|---|---|---|
| `hr-h1.md:N` (and the other spec names) | `NeoERP-App/docs/design/specs/<file>` | App `phase/4` `f19a101b` |
| `UX-1 ux:N`, `UX-1 ss:N`, `UX-1 bb:N` | `docs/design/ux-principles.md`, `screen-standard.md`, `specs/building-blocks.md` on App `phase/4-b2-ux1` | `be956110` (reviewed, awaiting Jabran) |
| `BE <path>:N` | `NeoERP-BackEnd/<path>` | BackEnd `phase/4` `d0dd5441` |
| `WS <path>:N` | this workspace | `master` `13ce4a2` |
| `D-n` | UX-1 lead decisions, `WS .review-channel/lead-decisions.md` | as of 2026-11-21 |

**Status of the decisions this list leans on.** ADR-026 is a **draft waiting on Jabran's D1–D11**
(`WS docs/drafts/ADR-026-row-level-security.md:4`); every item that cites R4 or D9 assumes Jabran accepts D1 option B
and D9 as recommended (decision 1 below). ADR-021 is accepted (`BE docs/adr/ADR-021-shared-dimensions.md:5`), ADR-020
is accepted (`BE docs/adr/ADR-020-file-store.md:5`), ADR-024 and ADR-025 are "accept after the lead's one-page summary"
(`WS docs/backlog.md:385`), ADR-022 is proposed (`BE docs/adr/ADR-022-budget-control.md:5`), approval limits is a draft
spec being built (S1–S4 done, `WS PROJECT-STATE.md:30`). UX-1 D-1…D-10 are approved by Fable or confirmed by Jabran,
D-10 is marked for Jabran's confirmation.

## All six specs (cross-cutting)

These apply to every spec; the per-spec sections below only add the lines.

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| X.1 | Every contract-rule inventory: `hr-h1.md:327-331, :347, :356, :363, :377`; `hr-h2-h3.md:16-17, :377, :417-419, :886, :926, :1511, :1559`; `hr-h4.md:468, :849`; `payroll-p.md:939-943, :950-953, :965-967, :984, :1049, :1099, :1130` | **No legacy conversion.** Drop every rule about v1 data: nullable columns then backfill then NOT NULL, quarantine rows, cloning global masters per company, splitting mixed v1 runs, archiving seed rows, `legacy = true` runs, the "interim calculator" that keeps v1's maths, v1 leave balances as opening entries, renaming v1 tables "data kept". The first v2 migration of hr-service and payroll-service creates the v2 tables new. | ADR-026 R4: "`company_id NOT NULL`, composite keys and RLS in the **first** migration; no baseline entries allowed; old tables dropped, no backfill" (`WS docs/drafts/ADR-026-row-level-security.md:130`); D9 (:166); Q1 answered: a rebuild, not a refactor (:171). Dev holds no customer data. | One dated amendment per spec, "Superseded by ADR-026 R4 and D9", replacing the listed rows; the BE contracts H0–H4 and P0–P4 get the same amendment in the build lane before CP-H0/CP-P0. Applied migrations V1–V5 of the old services are not edited: the rebuild drops the old tables in a new migration (or recreates the dev databases), which the build lane decides. | critical | M |
| X.2 | Each spec's "contract-rule inventory" (no row today) | **Add a company-isolation block** to each spec's inventory: every HR and Payroll table, child tables included, carries its own `company_id NOT NULL` with composite foreign keys `(company_id, parent_id)`; `ENABLE` + `FORCE ROW LEVEL SECURITY` and the `company_isolation` policy in the migration that creates it; the catalog test fails a table without it. Name the machine jobs and how each runs: leave accrual and year-end (hr-h2-h3 §6.3), the daily apply job and `CurrentJobRefreshJob` (hr-h4 §6.5), outbox dispatchers, async calculate (P1 §10.2), filing and bank-file jobs. Each claims its work on an allowlisted system table, then works **one company per transaction** under `SystemTenantScopes.forCompany`. | ADR-026 M1 (:76), M3 one company per transaction, a second company in one transaction throws (:87-92), M4 policy shape and child tables (:94-104), M6 two-step machine jobs (:113-117), catalog test §5.5 (:144); go-live P-17 (`BE docs/operations/hosting-and-go-live-requirements.md:39`). | Write it once in hr-h1 (H0/H1 foundation) and payroll-p (P0), and point to it from the other specs. The Payroll 503 gate (`PayrollTenantIsolationGateFilter`, ADR-026:27) goes with the old code. | critical | S |
| X.3 | Each spec's "Out of this drop" / acceptance (none name these) | **Guardrails written into the specs and the build brief:** (a) payroll-service whole, and HR's sensitive, bank, encryption and tenant paths, added to `docs/risk-paths.txt` in the commit that adds the code (today it lists only migrations for these services); (b) second, different reviewer and re-runs on every HR/Payroll lane; (c) a regression test per money or security finding; (d) a state-transition matrix test (every transition × role, owner/uploader, entitlement, period lock, two-person rule) for the pay run, bank-details change, payee-account change, lifecycle request and leave request; (e) the money invariant suite extended to payroll: run totals = sum of payslips, posted PR journal = run totals by role, no double post or double pay under retry, rounding per currency (ISK 0 decimals); (f) a golden-file suite per country, validated against the official schema with a named human reviewer, before the second country's filings start; (g) accountant sign-off of posting rules and statutory files before go-live. | WORKFLOW "Money and security lanes" (`WS WORKFLOW.md:114-116`), guardrails 1–5 (`WS WORKFLOW.md:323-328`); lessons L11, L12, L13, L16, L19, L29 (`WS docs/lessons.md:54-60, :62, :72`); `BE docs/risk-paths.txt:1-7, :83-84`. | Yes. (a) lands with the first HR/Payroll code commit; (d)–(f) are named acceptance tests in the H0/P0, P1 and P4–P9 build briefs. | critical | S |
| X.4 | Numeric fields in every spec (lines in the spec sections below) | **One format, through the shared pieces only.** Every amount through `NeoMoney`, every percentage through `NeoPercent`, every date field through `NeoDateField`/`NeoDateRangeField`, every shown date through `NeoFormat`/`NeoDateFormat`, every decimal quantity (days 0,5 and 2,08, hours 7,5, FTE) through `NeoNumericInput` in the company number format. No raw text field for a number, no `%` written by a screen, no Double in money. Each spec gets a short "Fields and formats" table naming the component per numeric field. | L24 is a Convention with build checks in Lane 0 (`WS docs/lessons.md:67`), promoting L03 (:46); building blocks "Numbers and money" (`UX-1 bb:358-382`, percentages :371, one date parser :372-379). | Yes; the build adds no exception. | non-critical | S |
| X.5 | `hr-h1.md:215, :257, :413`; `hr-h2-h3.md:732, :810, :1615-1619`; `hr-h4.md:436, :899`; `payroll-p.md:1273`; `ess.md:87, :223` | **Design and check at the QA sizes.** The specs design for a 390 × 844 phone and check the rig at 1440 / 1280 / 1024 / 768 / 390 / 320. Replace with the rig review sizes 375×667, 667×375, 874×402, 744, 1032, 1376, 1440, and redo the top-task tables ("main action above the fold", keyboard pass) at 375×667 and 667×375, default text and Accessibility Extra Large. | D-8 (lead-decisions.md:83-90); `UX-1 ss` §9 required widths and the short heights checked on every screen; QA sizes `WS WORKFLOW.md:314`; UX-1 "How it is checked" (`UX-1 ux:288`). | Yes. The keyboard pass that passed 4 of 10 top tasks at 1280 only (`hr-h1.md:437`) is redone at the QA sizes before the first HR screen slice. | non-critical | S |
| X.6 | Side panels and sheets: `hr-h1.md:65, :79`; `hr-h2-h3.md:428, :433`; `hr-h4.md:171`; `payroll-p.md:132, :166`; `bottom-tab-bar-and-phone-sheet.md:72, :88-89` | **Short heights decide by height, not width.** By width, 667×375 is a small tablet and 874×402 a tablet, so a record opens in a side panel and a phone sheet becomes a centred dialog (PS-7 at ≥ 600) on a screen only 375–402 pt tall. Once the short-height trigger fires, a record opens as a full page and a form as a full-height sheet; pinned parts follow UX-1 (top bar and a one-row footer with the keyboard down, top bar only with it up); checks, totals and needed-lines scroll with the form. | UX-1 §25 short heights (`UX-1 ux:267-271`), D-7 trigger (lead-decisions.md:74-81, Jabran agreed), D-2 (:29-36), D-5 (:56-63). | Yes; one rule in the HR/Payroll shell part of hr-h1, the others point to it. | non-critical | S |
| X.7 | Number, time and id fields in every spec | **Touch entry.** On touch platforms a number, amount, quantity, percentage, time or date-part field opens a number keyboard with Done, accepts both separators, refuses letters, and formats on Done. Two HR specifics: (a) the iOS number pad has no minus key, so a signed entry is a choice plus an unsigned number (Add / Remove days; Earning / Deduction from the element kind), never a typed "−"; (b) digit-only identifiers (NO fødselsnummer, DK CPR, SE personnummer, IS kennitala, PK CNIC, local bank account numbers) use a digits keyboard and are never formatted as numbers; IBAN uses a text keyboard with capitals. | UX-1 touch number entry (`UX-1 ux:284`); focused field visible (:286); `time-field.md:101` opens the numeric keyboard only on a "Phone (<600)", which misses the iPad. | Yes; add the time field to the touch rule (by platform, not width). | non-critical | S |
| X.8 | Wizards and sheets: `hr-h4.md:95, :119, :237`; `ess.md:95`; `payroll-p.md:172-174` | **Footers are one row at every width**, with one fold order: further actions under ⋯, Back as its arrow, Cancel under ⋯, and only then the primary's label wraps to two lines. "Primary full width at the bottom; Back above it" (ESS) and "Back and Next under each step" (H4 wizard) become one row. | D-3 (lead-decisions.md:38-45), D-10 (:101-108, for Jabran's confirmation); `UX-1 bb:127`; `UX-1 ux:269`; `UX-1 ss:186, :250` (never stacked full-width buttons). | Yes. | non-critical | S |
| X.9 | `payroll-p.md:180, :207, :357`; `hr-h2-h3.md:874` | **No disabled buttons the backend would refuse, no permission codes.** The calculator's Approve is "disabled with" a line; the bank-change requester's bank-file button is "disabled with" a line; the rig "shows the code on every disabled action's tooltip". Leave the button out and keep the line in words ("You calculated this run. Another payroll approver approves it."). | ux §6 (`UX-1 ux:71-84`); hr-h1 amendment ERP-148/149 "no disabled buttons or codes shown" (`hr-h1.md:5`); approval card AC-5/AC-6 (`approval-card.md:91-95`). | Yes. Offline and "steps not reached yet" keep their disabled state with a line (screen-standard §8), since the backend would accept the action later. | non-critical | S |
| X.10 | The ten HR/Payroll component contracts (`date-range-field.md`, `time-field.md`, `calendar-month.md`, `time-grid.md`, `stepper.md`, `variance-table.md`, `file-download.md`, `tabs.md`, `bottom-tab-bar-and-phone-sheet.md`, `approval-card.md`) | **A UX-1 pass on each contract** before the design-system checkpoint builds them: none mentions Larger Text, and most say nothing about short heights or the keyboard. Known conflicts: `stepper.md:71` "Labels never wrap; the meta line ellipsizes" (UX-1: text wraps, step labels are not on the may-cut list); `time-grid.md` headings and cells at accessibility sizes (UX-1: an entry grid becomes the tight grid, then cards, before a heading is cut); approval-card actions must stack when they do not fit (D-6); the phone sheet's footer gives way while the keyboard is up (`bottom-tab-bar-and-phone-sheet.md:84` keeps it above the keyboard). | Building blocks: built "in one design-system checkpoint before the first HR or Payroll screen build" (`UX-1 bb:434`); UX-1 Larger Text (`UX-1 ux:273-282`), D-4 (lead-decisions.md:47-54), D-6 (:65-72), D-9 (:92-99). | One short dated amendment per contract; the checkpoint's screenshot tests include AX sizes and 667×375 (WORKFLOW UI gate 8, `WS WORKFLOW.md:250-256`). | non-critical | M |
| X.11 | `hr-h2-h3.md:918` ("Translations (English first)"); string-key appendices in every spec | **Four languages from the first slice.** Every new string ships in en, nb, sv and da in the same commit; the build check fails on a missing key. | Jabran 2026-11-08 (`WS docs/backlog.md:312`); old HR/Payroll/ESS were skipped only until rebuilt (PROJECT-STATE HRP-2, `WS PROJECT-STATE.md:25`). | Yes; the appendices stay the English source. | non-critical | S |
| X.12 | `payroll-p.md:157`; `hr-h2-h3.md:393-397`; `hr-h1.md:220`; `hr-payroll-open-decisions.md:42` (L-9) | **Long jobs and notifications follow ADR-025** once accepted: calculate, bank-file and filing generation, accrual runs and imports answer 202 with an action id and show "Working…" with "Continue in background" (`NeoActionWaiter`); notices to people (L-9 in-app) go through notification-service; payroll results are never streamed (action id only). | `WS docs/drafts/ADR-025-realtime-notifications.md:42, :49, :54, :83`; accept after summary (`WS docs/backlog.md:385`). | Yes, conditional on ADR-025's acceptance; until then the specs' own progress copy stands. | non-critical | S |
| X.13 | Lists: `hr-h1.md:73`; `hr-h2-h3.md:390, :587, :608`; `payroll-p.md:129, :235` | **Lists at large-customer size.** Keyset paging for lists that can pass about 100,000 rows per company (attendance, payroll lines, payslips), capped counts ("10,000+"), no in-memory paging and no optional-tenant filters `(:companyId IS NULL OR …)`; the large-tenant generator includes 5,000 employees. | ADR-024 F4, F5 (`WS docs/drafts/ADR-024-data-at-scale.md:47-48`), D2 and D3 (:59-60), D4 "F4/F5 in the HR rebuild" (:61); product direction: large multi-company customers from day one (`WS docs/drafts/accounts-roadmap.md:13`). | Yes; the directory's "Count: 28 employees" becomes a capped count. | non-critical | S |
| X.14 | `hr-h1.md:413`, `hr-h2-h3.md:1615`, `hr-h4.md:899`, `payroll-p.md:1273` | **Rig evidence must be re-runnable.** The 4,794-visit check ran from `/tmp/hrp-c12-check/final.cjs`, which is not in any repo, so the claim cannot be repeated. | L25 (rules and checks live in the repo, `WS docs/lessons.md:68`); A finding needs evidence (`WS WORKFLOW.md:142-145`). | Move the script into `NeoERP-App/docs/design/reviews/` (or drop the claim) when the rig is next touched. | non-critical | S |

## hr-h1 (employee directory, record, organisation, ESS shell)

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| H1.1 | H0 and H1 inventories: `hr-h1.md:327-331` (H0-1 to H0-5), `:347` (H0-21, v1 paths kept), `:356` (H1-1), `:363` (H1-8 rename designations, data kept), `:377` (H1-22, v1 `INACTIVE`) | Superseded by X.1: no v1 shapes, no kept v1 paths, no renamed v1 tables. Positions, departments and employees are created new; status is `ACTIVE` / `EXITED` only. | ADR-026 R4, D9 (`ADR-026:130, :166`). | Yes. | critical | S |
| H1.2 | `hr-h1.md:14` ("Replaces … removed when H1 ships"); `hr-h2-h3.md:8-18`; `hr-h4.md:8-10`; `payroll-p.md:49`; `ess.md:271-274` | **The v1 screens stop working on the day the old tables go**, not slice by slice. The specs remove each v1 part "when its v2 replacement ships", which assumed the v1 tables keep running. | ADR-026 R4, D9; Q1: old modules stay untouched and out of QA and i18n (`ADR-026:171`; `WS PROJECT-STATE.md:25`). | Hide the v1 HR, Payroll and ESS entries from the menu from the first v2 migration until each v2 area ships; delete the v1 code in the slice that ships its replacement, as the specs say. Decision 2. | critical | S |
| H1.3 | `hr-h1.md:368` (H1-13 encryption), `:375` (H1-20 documents); `BE docs/api/hrms-v2-h1.md:78` | **Build on the shared pieces that now exist.** Documents go straight to `:shared:file-store` (no interim `HrDocumentStore` and `hr.document_blobs`); sensitive fields (national id, bank account) use the same AEAD field cipher Accounts uses for bank details, not a second HR-own AES-GCM scheme. | ADR-020 D14 plans the interim ports' removal (`BE docs/adr/ADR-020-file-store.md:55, :169-177`); `:shared:file-store` is built (`BE settings.gradle.kts:14`; `BE shared/file-store/.../FileStore.kt`) and Accounts uses it for bank details at rest (`BE services/accounts-service/build.gradle.kts:35-39`). | Yes. Decision 8. | critical | S |
| H1.4 | `BE docs/api/hrms-v2-h1.md:680-682` (`segments[]`); departments in `hr-h1.md:204-206` | **Dimensions HR must give Accounts.** Employee-facts segments carry `branchId` and `costCentreId` but no `departmentId`, so a mid-period department move cannot post to both departments; departments have no validity dates and no `hr.department.changed` event, which Accounts' department dimension needs. | ADR-021 accepted (`BE docs/adr/ADR-021-shared-dimensions.md:5`); gap check D3 and D4, "before H1 build" (`WS docs/drafts/hr-payroll/large-customer-gap-check.md:52-53`); Accounts L.9 waits for the HR event (`WS docs/drafts/accounts-roadmap.md:158`). | Add `departmentId` (and `projectId` when the job gains one) to segments, validity dates and a header-node flag on departments, and the event through the ADR-019 relay, in H1. Decision 7. | critical | S |
| H1.5 | `hr-h1.md:181` ("Also an employee at …"), `:219` (ESS employer switcher); H1-21 `:376` | **Cross-company reads stay per company.** The switcher's rows and "Also an employee at" come from IAM's employee links (user-service has no RLS); any HR fact shown per employer (employee code, position) is read under that employer's own scope, one call per company, never one query over several. | ADR-026 D4 (:161), M8 (:121), Q4 (:174); H1-21 (`BE docs/api/hrms-v2-h1.md:79`). | Write the one-line rule into §7 and H1-21. | critical | S |
| H1.6 | §4 layout `hr-h1.md:63-66` ("iPad landscape (1024)") | At 874×402 and 667×375 the width rule gives the side-panel layout on a phone in landscape. Once the short-height trigger fires, a row opens the record as a full page; the quick-add panel opens as a full-height sheet. | X.6; `UX-1 ux:267`. | Yes. | non-critical | S |
| H1.7 | §4 Add employee `hr-h1.md:79-84`; `hr-h4.md:88, :119, :496, :509, :533` | **One way to add an employee.** hr-h4 §5 and §19 say the wizard replaces the quick-add panel with "Add now, finish later"; its own lead-decision line says "keep H1's quick add; the wizard is the full path". | ux §1 one concept, one pattern (`UX-1 ux:8`); the contradiction is inside hr-h4. | The wizard, with "Add now, finish later" after Job; delete the quick-add panel text and the stale lead-decision line. | non-critical | S |
| H1.8 | §4 columns `hr-h1.md:76` | The eight-column directory at Larger Text: names may end in "…"; employee codes, dates, status words and the "Changes 1 Nov" tag never; headings never cut. The table becomes the tight grid, then cards. | `UX-1 ux:277-279`; D-4. | Yes. | non-critical | S |
| H1.9 | Fields `hr-h1.md:54, :81, :150-151, :160` | Keyboards and formats per field: FTE % through `NeoPercent` with the number keyboard; weekly hours through `NeoNumericInput`; national id with a digits keyboard where the country's id is digits only (FI henkilötunnus ends in a letter or digit, so text); IBAN text with capitals; local account digits. | X.4, X.7. | Add the "Fields and formats" table to §4 and §5. | non-critical | S |
| H1.10 | `hr-h1.md:270, :272`; `:167, :236` | Wording: the defaults list has "Owner: all" and "Company Owner: all, including …" (one line); "a reason of at least 6 characters" becomes "at least `NeoChangeReason.MIN_REASON_LENGTH` characters". | `UX-1 bb:70-74` and bank rule 2a (`UX-1 bb:400`). | Yes. | non-critical | S |

## hr-h2-h3 (leave, time, approvals inbox, ESS Leave and Time)

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| H23.1 | §6.6 `hr-h2-h3.md:417-419`; Replaces table `:16-17` ("data kept"); entry kind `:377`; audit `OPENING_FROM_V1` `:886`; key decision 2 `:926`; H2-1, H3-1 `:1511, :1559` | **No v1 leave or time data.** Drop §6.6, the "data kept" notes, the v1 leave-type mapping and the `OPENING_FROM_V1` event. Keep an **Opening balance** entry kind for a customer who moves from another system: entered by HR with a reason (as Adjust), or by an import later, never by a conversion. | X.1; ADR-026 R4, D9. A new customer still arrives with balances from its old system, so the ledger needs a way in (balances are a ledger, scope rule 5, `:376`). | Yes. | critical | S |
| H23.2 | §17 inbox `hr-h2-h3.md:669-724`; §24 `:914` (multi-step out) | **HR approvals on the shared approval model.** The model is built (`BE shared/approval-model`, step type `LINE_MANAGER` reserved for HR, `ApprovalTypes.kt:17-29`); stand-ins are central and cover Accounts and HR (AL-D1). Build the HR kinds on it from H2 with one band and one step (the line manager, or the decide-code holder for company-wide kinds), so stand-ins and "Waiting for you" work the same way as Accounts; multi-step chains stay out of v2 as the spec says. The card gains the optional "Step n of m" line. | `accounts-approval-limits.md:41-55` (one shared model, "HR approval chains … adopt it in their own slices"), AL-D1 `:296`, AL-D5 `:300`, card change `:313`; large-customer gap check, approval chains priority 1 (`WS docs/drafts/hr-payroll/large-customer-gap-check.md:12`). | Yes. Decision 5. | critical | M |
| H23.3 | §13 roster `hr-h2-h3.md:580-590`; §15.1 timesheets `:608-611`; §15.4 `:629` | `NeoTimeGrid` at accessibility sizes and short heights: headings never cut and never broken inside a word; the grid becomes the tight grid, then the phone layout (`ByColumn` / `ByRow`), before a heading is cut; sticky headings scroll with the grid once the short-height trigger fires; the edited cell stays in view above the keyboard. | `UX-1 ux:268, :278-279, :286`; X.10. | Yes, in `time-grid.md` and here. | non-critical | S |
| H23.4 | §6.4 Adjust `hr-h2-h3.md:406`; ledger `:405` | "plus or minus days or hours" becomes a choice (**Add days** / **Remove days**) plus an unsigned amount; the ledger's signed Days column is written by the shared number format. | X.7(a): the iOS number pad has no minus key. | Yes. | non-critical | S |
| H23.5 | Units and percentages `hr-h2-h3.md:380-381, :440, :466, :583, :788` | Days with two decimals (0,5; 2,08), hours (7,5 h; "46 / 37,5"), graded percentages (25 / 50 / 75 %) go through `NeoNumericInput` and `NeoPercent` in the company format; no screen writes "%" or "h" with its own number formatting. | X.4; `UX-1 bb:371`. | Yes. | non-critical | S |
| H23.6 | §7.2 `hr-h2-h3.md:433-443`; §18.4 `:753-760` ("Checks as §7.3, inline above the footer", `:758`); §19.3 `:792` | On short heights the checks and the summary line move into the form; a tap on the disabled Send scrolls to the first check, by keyboard and screen reader too. | D-2 (lead-decisions.md:29-36, Jabran confirmed); `UX-1 ux:270`; X.6. | Yes. | non-critical | S |
| H23.7 | §23 `hr-h2-h3.md:902` | "contracts in `docs/drafts/hr-payroll/components/`": the contracts live in `NeoERP-App/docs/design/specs/` (that folder holds only a README). | `UX-1 bb:434-445`. | Fix the path. | non-critical | S |
| H23.8 | J-9 `hr-h2-h3.md:941` | "a young worker check in every country" contradicts G-6: young-worker checks only in the six full countries, no school-term limits in v2. | G-6 (Jabran 2026-10-21, `WS docs/drafts/hr-payroll/hr-payroll-open-decisions.md:17`). | Align the J-9 note to G-6 (text only; the decision exists). | non-critical | S |
| H23.9 | Sick-pay protection card `hr-h2-h3.md:1646` | "Shown only for company `sthlm` (country SE)" names a rig company; the rule is by country (SE companies). | Spec rules are by country (hr-h2-h3 §4, `:153`). | "Shown only for companies in Sweden". | non-critical | S |

## hr-h4 (lifecycle: add, job changes, end, move, re-hire)

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| H4.1 | H4-1 `hr-h4.md:849`; B4 `:468` ("replaces v1 `status` and `separate`, which are deleted") | Superseded by X.1: no backfill, no conversion report rows, no v1 endpoints to delete inside the v2 schema. | ADR-026 R4, D9. | Yes. | critical | S |
| H4.2 | Replaces `hr-h4.md:8-10`; §19 `:536` | "carry only the changes H1 §6.1 lists as explicit exceptions … for Jabran to approve (hrms-v2-h1 Q17)" is stale: Q17 was decided as "no patched-v1 exceptions". | CA-6 (`BE docs/api/hrms-v2-h1.md:4`, H1-22 `:80`); Q1, old modules untouched (`ADR-026:171`). | Delete the exception wording. | non-critical | S |
| H4.3 | §5 wizard `hr-h4.md:95` ("Back and Next under each step"), `:119` ("Add now, finish later", secondary); §7 end page `:237`; §5.6 `:153` | Wizard and end-page footers are one row with the fold order of X.8; "Add now, finish later" folds under ⋯ first. | X.8; D-3, D-10. | Yes. | non-critical | S |
| H4.4 | Open questions `hr-h4.md:496-497` against `:509, :513`; §10 `:385` | The O1 and O5 rows contradict their lead-decision lines: O5 is decided "show, dates only" (§10, H4-25) while the table says "No in v2"; O1 see H1.7. | H4-25 (`hr-h4.md:385`); H1.7. | Rewrite the O1 and O5 rows to the decided state. | non-critical | S |
| H4.5 | §7.3 team table `hr-h4.md:267`; §7.2 notice period `:247` | The direct-reports table with a picker per row becomes cards with the picker inside on a phone and at accessibility sizes; the notice period is a number (number keyboard, Done) plus a unit choice. | `UX-1 ux:279, :284`; X.7. | Yes. | non-critical | S |
| H4.6 | Stepper `hr-h4.md:90-95, :436` | On phones and short heights the compact bar "Step n of N · label" is part of the page head: it wraps rather than cuts at accessibility sizes and scrolls with the form once the trigger fires. | `UX-1 ux:268, :275`; X.10 (`stepper.md:71`). | Yes. | non-critical | S |

## payroll-p (pay runs, payslips, employee pay, setup, filings, ESS Pay)

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| PY.1 | Scope P0 `WS docs/agents/payroll/scope.md:11, :16-18`; inventory PC-1 to PC-5 `payroll-p.md:939-943`, PC-12 interim calculator `:950`, PC-13 legacy runs `:951`, PC-15 "existing NUMERIC(14,2)" `:953`, P1-1 to P1-3 `:965-967`, P1-20 "non-legacy" `:984`, P3-1 `:1049`, P4-1 `:1099`, P4-18 `:1130` | **Payroll P0 becomes "new schema", not "migrate v1".** The signed-off scope says "Data: kept through new migrations" and "V6 (nullable) → backfill job → V7"; with D9 the first migration creates all v2 tables with `company_id NOT NULL`, composite keys, RLS and `NUMERIC(19,4)` money; no interim calculator (P1's engine is the first calculator), no legacy runs, no v1 conversion, no seed rows copied (the demo seed creates per-company rows). P0 keeps four eyes, `@Version`, idempotency, the audit outbox and tier 2. | X.1; ADR-026 R4, D9; the scope is Jabran's (`scope.md:3`). | Amend scope §1 P0 and the "Data" line with a dated note; P0 and P1 contracts follow. Decision 3. | critical | M |
| PY.2 | Scope P1 "the Pakistan pack" `WS docs/agents/payroll/scope.md:29, :43-47`; P4–P9 order "PK → NO → SE → DK → FI → IS" `:66, :72-79`; demo data `payroll-p.md:90-98` | **Country order against the launch order.** Payroll builds and checks Pakistan first and Sweden third; the launch order is SE → NO → PK → FI → IS → DK, so the first customer is Swedish. A country is ready only after its pack is CHECKED and a pilot runs in parallel, so the first checked pack should be the first launch country. | Launch order (`BE docs/api/accounts-roadmap.md:92`; `WS docs/drafts/accounts-roadmap.md:18`); product direction, large Swedish pilot (`WS docs/drafts/accounts-roadmap.md:241`); country readiness rule (`scope.md:70`). The engine is designed against Norway either way (`scope.md:30`). | Order the country slices SE → NO → PK → FI → IS → DK: P1 ships the engine with the SE pack and SE filings (AGI) as the first statutory slice; PK keeps its demo companies and moves to third. Decision 4. | critical | M |
| PY.3 | §6.4 journal preview `payroll-p.md:189`; P2 lines `BE docs/api/payroll-v2-p2.md:78, :417`; A5 `BE docs/api/accounts-a5.md:93, :152` | **Payroll posting carries the shared dimensions.** P0 lines already hold the full `DimensionSetV1` (`BE docs/api/payroll-v2-p0.md:465`), but the P2 body and `AccountsPostingV2` carry only `branchId` and `costCentreId`, so department, project and the company's free dimensions are lost on the way to the ledger. The preview shows the dimensions the company uses. P2 also reads ADR-021 account rules (required / not allowed per dimension) at calculate, as for branch. | ADR-021 accepted 2026-11-03 (`BE docs/adr/ADR-021-shared-dimensions.md:5`), after A5 (2026-10-10, `accounts-a5.md:3`) and P2 were written; gap check D2, D6, D9 (`WS docs/drafts/hr-payroll/large-customer-gap-check.md:51, :55, :58`). | A numbered amendment to P2 and to A5 before CP-P2. Decision 7. | critical | S |
| PY.4 | §6.3 Approve `payroll-p.md:176-186` | **Pay run approval stays one approver with four eyes in v2** (calculator ≠ approver, Owner's own only when nobody else holds a payroll calculate or approve right, fresh check that fails closed). Multi-level approval for large runs (payroll, then finance above an amount) comes later on the shared approval model. | Scope rule 4 (`scope.md:95-99`); L-1, L-2 (`hr-payroll-open-decisions.md:34-35`); approval limits names "large pay runs" as a later adopter (`accounts-approval-limits.md:43-44`); gap check priority 2 (`large-customer-gap-check.md:41`). | Keep; record "multi-level run approval" as a later row. Decision 6. | critical | S |
| PY.5 | §6.5 bank file `payroll-p.md:203`; §6.6–§7 payslip PDF `:243`; §6.7 filing files `:225`; P3 interim document store | **Files on the shared file store from the start**: bank files, payslip PDFs, filing files and receipts go through `:shared:file-store`; no interim `PayrollDocumentStore`. Payment files stay one shared PF-1 piece with Accounts' payment files (5.8). | ADR-020 D14 (`BE docs/adr/ADR-020-file-store.md:55, :169-177`); `BE settings.gradle.kts:14`; PF-1 shared with Payroll (`WS docs/drafts/accounts-roadmap.md:116`). | Yes. Decision 8. | critical | S |
| PY.6 | §6.4 Post `payroll-p.md:188-200` | **A5 is an Accounts lane Payroll waits for.** Posting needs `AccountsPostingV2` built in Accounts (A5, with the AC-IP core), and the payroll client is added only after P0 is accepted. Build order: P0 → P1 → (A5 in Accounts) → P2. Until A5 lands, the spec's "Books aren't live yet" path applies: runs are calculated and paid, and posted later. Bank-and-cash D v1 ships without payroll-payable clearing, which arrives with L.1. | Accounts roadmap decisions 5, 6 and 16 (`WS docs/drafts/accounts-roadmap.md:248-254, :275-279`), L.1 (:150); A5 C-4 (`BE docs/api/accounts-a5.md:87`). | Name the dependency in §6.4 and in the build plan; posting is not needed for P0/P1 acceptance. | critical | S |
| PY.7 | §6.1 one-off amounts grid `payroll-p.md:149` | Built on `NeoEntryGrid` with `NeoMoney`; the sign comes from the element's kind (earning, deduction, recovery), never a typed minus; at accessibility sizes the grid becomes the tight grid, then cards; the edited cell stays above the keyboard. | X.4, X.7; `UX-1 ux:279, :286`. | Yes. | non-critical | S |
| PY.8 | §5 runs list `payroll-p.md:129`; §6.2 variance table `:161-165`; §6.1 employees table `:145` | Wide tables at Larger Text and on phones: names may end in "…"; amounts, Δ, Δ % (through `NeoPercent`), periods, run numbers and status words never; the table becomes cards before a heading is cut. | `UX-1 ux:277-279`; D-4. | Yes, also in `variance-table.md` (X.10). | non-critical | S |
| PY.9 | §6.2 actions `payroll-p.md:172-174`; §6 stepper `:139-141` | Each run step's footer is one row (Recalculate and Back to prepare fold under ⋯ before the primary wraps); the seven-step stepper uses the compact bar on phones. | X.8; `stepper.md` ST-9. | Yes. | non-critical | S |
| PY.10 | Lead decisions table `payroll-p.md:1290`; `WS docs/drafts/hr-payroll/design-gate-final.md:21` | "Sweden high-risk sick-pay protection … no HR editing screen" is stale: the card exists (`hr-h2-h3.md:1640-1680`). With Sweden first (PY.2) this is on the critical path, so the stale line matters. | hr-h2-h3 batch F amendment. | Mark the row closed with a pointer to the card. | non-critical | S |

## ess (employee self-service)

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| ES.1 | Bank change notice `ess.md:31-33`; building blocks bank rule 5 (`UX-1 bb:403`) | **The bank-change notice is a fraud control that needs real e-mail.** "A notice goes to the contact address on file" cannot be sent until real e-mail exists (ADR-025 RT-6, vendor-dependent); Accounts already carries the same gap as a go-live row for supplier bank changes. | ADR-025 RT-6 (`WS docs/drafts/ADR-025-realtime-notifications.md:94, :97`); go-live P-9 and ACC-R15 (`BE docs/operations/hosting-and-go-live-requirements.md:37, :84`). | Add an HR row beside ACC-R15: ESS bank changes may serve a customer only once the notice is really sent; until then it is recorded and shown in-app. | critical | S |
| ES.2 | Status `ess.md:3` | "Draft for Jabran's review" while §11 says "Decided by Jabran, 2026-10-30: all as recommended" (`:240`). | `ess.md:240`. | "Approved (Jabran, 2026-10-29 pass; open points 2026-10-30)". | non-critical | S |
| ES.3 | Shell `ess.md:87`; top tasks `:223` ("above the fold at 390") | Phone target 390 × 844 becomes 375×667 portrait and 667×375 landscape, at default text and Accessibility Extra Large; the top-task table is re-measured there. | X.5. | Yes. | non-critical | S |
| ES.4 | Progressive flows `ess.md:95` ("Primary action full width at the bottom; Back above it") | One row: Back as its arrow, then the primary. | X.8; `UX-1 ss:186`. | Yes. | non-critical | S |
| ES.5 | ESS at ≥ 600 width: `ess.md:92`; `bottom-tab-bar-and-phone-sheet.md:72, :88-89`; `hr-h2-h3.md:732` | On a phone in landscape (667×375, 874×402) the width rule swaps the tab bar for the sidebar group (fine: it costs width, not height) and opens sheets as centred dialogs (not fine on 375 pt with a keyboard). Once the short-height trigger fires, ESS sheets stay full-height sheets. | X.6; D-7. | Yes. | non-critical | S |
| ES.6 | §6.1 sheets `ess.md:139-142` | Keyboards: private phone with the phone keyboard; IBAN text with capitals; local account digits; the focused field stays in view above the keyboard in every sheet. | X.7; `UX-1 ux:286`. | Yes. | non-critical | S |

## people-access (affected in two places)

| # | Spec section:line | What changes | Why (decision + source) | Recommendation | Class | Size |
|---|---|---|---|---|---|---|
| PA.1 | §1.5 `people-access.md:245-248`; §6.2 item 10 `:828-832` | Written against v1 HR ("`hr.employees.user_id NOT NULL` today", "becomes nullable", "designation"). In v2 the employee table is created with a nullable login link and positions; the link endpoint is the H1 one. | X.1; hr-h1 words (`hr-h1.md:23`). | Rewrite both to the v2 shape; the approved rules (employees without a login, Employee role with app access) stay. | non-critical | S |
| PA.2 | People list and person page `people-access.md:301, :580, :820` | "EMP-0042 · Store lead" is the designation; v2 names it the position (`employee: { id, code, position }`). | `hr-h1.md:23`. | Yes. | non-critical | S |

## Counts

| Spec | Items | Critical | Non-critical |
|---|---|---|---|
| All six (X) | 14 | 3 | 11 |
| hr-h1 | 10 | 5 | 5 |
| hr-h2-h3 | 9 | 2 | 7 |
| hr-h4 | 6 | 1 | 5 |
| payroll-p | 10 | 6 | 4 |
| ess | 6 | 1 | 5 |
| people-access | 2 | 0 | 2 |
| **Total** | **57** | **18** | **39** |

The 39 non-critical items are for Fable to settle. Two of them choose between contradicting texts that are already in the
specs: H1.7 (wizard or quick-add panel) and H4.4 (the O1 and O5 rows). X.8 follows D-10, which is still marked for
Jabran's confirmation.

## Decisions for Jabran

Each groups the critical items it settles.

1. **Start HR v2 and Payroll v2 on a new schema** (X.1, X.2, H1.1, H23.1, H4.1): company column, composite keys and
   row-level security from the first migration, old tables dropped, no backfill. This is ADR-026 D1 (option B) and D9.
   **Recommend: yes.** Dev holds no customer data (ADR-026:166), and adding the wall later means a second migration of
   every table and a backfill nobody needs.
2. **v1 HR, Payroll and ESS stop working from the first v2 migration** (H1.2); their menu entries are hidden until each v2
   area ships. **Recommend: yes.** They are already out of QA and i18n (PROJECT-STATE HRP-2); keeping them alive would
   need the backfill decision 1 removes.
3. **Amend the signed-off Payroll scope P0** (PY.1): new schema, no interim calculator, no legacy runs, no seed copies.
   **Recommend: yes.** It follows from 1; P0 keeps four eyes, `@Version`, idempotency, the audit outbox and tier 2.
4. **Payroll country order SE → NO → PK → FI → IS → DK**, with the SE pack and AGI as the first statutory slice (PY.2).
   **Recommend: yes.** The first customer is Swedish and a country is ready only after its own pack is checked and a
   pilot has run in parallel; checking Pakistan first delays the first sale. Pakistan keeps its demo companies.
5. **HR approvals on the shared approval model from H2** (H23.2): one band, one step, shared stand-ins; multi-step later.
   **Recommend: yes.** The model and its `LINE_MANAGER` step type are built; HR-own approval tables would be rebuilt when
   large customers ask for chains (priority 1 in the gap check).
6. **Pay run approval stays one approver with four eyes in v2** (PY.4). **Recommend: yes.** It is scope rule 4 as
   decided; multi-level run approval adds money risk now for a priority-2 need.
7. **Payroll posting carries the shared dimensions** (PY.3, H1.4): amend P2 and A5 (`AccountsPostingV2`) to carry the
   full dimension set; HR adds department to employee-facts segments, department validity and the
   `hr.department.changed` event. **Recommend: yes, before the H1 build and CP-P2.** ADR-021 is accepted, and a frozen
   posting contract costs more to change once built.
8. **Shared file store and field cipher from the start** (H1.3, PY.5) for HR documents, sensitive fields, payslip PDFs,
   bank and filing files. **Recommend: yes.** Both are built and used by Accounts; interim stores would need ADR-020's
   copy job later.
9. **Guardrails package for the whole HR/Payroll build** (X.3): risk paths, second reviewer, regression test per finding,
   state-transition matrices, payroll money invariants, golden files per country, accountant sign-off. **Recommend: yes.**
   These are the 2026-11-20 guardrails applied to payroll money, statutory files and personal data.
10. **A5 is an Accounts lane that lands before Payroll P2** (PY.6); P0 and P1 do not wait for it. **Recommend: yes.** It
    matches Accounts roadmap decision 16 ("A5 and L.1 follow Payroll v2's own progress").
11. **ESS bank changes serve a customer only once the bank-change notice is really e-mailed** (ES.1), as ACC-R15 for
    suppliers. **Recommend: yes.** The notice is the employee's only warning of a fraudulent change.
12. **Cross-company reads stay one company per call** (H1.5): employer lists from IAM, HR facts per employer under its
    own scope. **Recommend: yes.** It is ADR-026 D4 and keeps a franchise's employees out of the group's reach (RULES §8).

## Not changed, checked

These still hold against the later decisions:

- **Four eyes and Owner's own** (scope rule 4, `WS docs/agents/payroll/scope.md:95-99`; L-1, L-2, L-3): consistent with
  approval limits, which keeps HR's own Owner rule (`accounts-approval-limits.md:55`).
- **Bank-details pattern** (building blocks rules 1–7, `UX-1 bb:394-407`): hire bank details as the first request (L-7),
  requester can't make the bank file (L-5), Mark as paid one-way (L-6, L-11, `payroll-p.md:209-215`).
- **No pack, no payroll; effective-dated rows; parallel runs only until a pack is CHECKED** (P1-6, P1-7, P1-25,
  `payroll-p.md:970-971, :989`; L-10): matches L29 and accountant sign-off (X.3).
- **Money on the wire and in the engine:** decimal strings at the currency scale (ISK 0), `NUMERIC(19,4)`, `BigDecimal`
  scale 4, rounding only where the pack says (PC-15, P1-12, `payroll-p.md:953, :976`): matches L24 (no Double).
- **Packs are platform reference data** (P1-4, H2-3, `payroll-p.md:968`, `hr-h2-h3.md:1516`): matches ADR-026 M1
  (reference tables get no RLS; R2 revokes writes on them).
- **Start in another company is two saves in two companies, nothing rolled back across companies**
  (`hr-h4.md:341-351`): matches ADR-026 M3 and D4 (one company per transaction).
- **"Also an employee at …" only where the viewer can read both** (H1-21): matches RLS; the list comes from IAM, which
  ADR-026 leaves on application checks (M8).
- **Enter-company sees no payroll unless granted** (PC-8, D5): matches ADR-026 M7 (an Enter-company session gets a normal
  company scope; nothing new).
- **HR records facts, Payroll calculates amounts** (encashment H0-17, final settlement `hr-h4.md:273-302`).
- **Sick leave without diagnosis; health types "Away"** (`hr-h2-h3.md:465, :515-517`): matches ADR-025, which never
  streams HR sensitive subjects (`ADR-025:54`).
- **IAM code migrations still needed** (U-split, U-defaults, U-h2h3, `hr-h2-h3.md:842`): D9 drops only HR and Payroll
  tables; user-service data stays, so rule 7 (nobody's rights change) still applies.
- **ESS design pass** (five tabs, open points 1–16 decided 2026-10-30, `ess.md:240`) and the **people-access approvals**
  (employees without a login, Employee role with app access, `people-access.md:250-268`).
- **One employment per company, re-hire is a new record, franchise is its own employer** (D4, O13; RULES §8,
  `WS docs/domain/RULES.md:154`).
- **Pay lines already carry the full dimension set** (P0-A9, `BE docs/api/payroll-v2-p0.md:4, :465`): only the posting
  step (PY.3) and HR's segments (H1.4) are missing.
- **Budget control (ADR-022)** asks nothing of v2: the personnel-cost feed is stage 2 (`accounts-budgets.md:239`).
- **Sweden sick-pay protection** has its HR card (`hr-h2-h3.md:1640`), so the SE payroll path is not blocked by HR
  (PY.10 only fixes the stale line).

## Not verified

- ADR-026 is not accepted; decisions 1–3 and every R4/D9 item depend on Jabran's D1 and D9.
- That no non-local environment holds HR or Payroll data (D9's condition, ADR-026:166) was taken from the ADR and
  PROJECT-STATE, not checked on any server.
- What IAM's employee links hold (code, position) for the ESS switcher (H1.5) was not read in user-service code.
- The rig was not opened; layout items come from the spec text and the UX-1 rules, not from screenshots.
- The Nordic country flows (`docs/drafts/hr-payroll/payroll-p5…p9-*.md`) and the P5–P9 contracts were read only for
  order and status, not row by row.
